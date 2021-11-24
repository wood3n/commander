import { Command } from 'commander';
import axios from 'axios';
import path from 'path';
import fs from 'fs';
import { homedir } from 'os';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { getCache, setCache, clearCache } from './cache';
import { generateSign } from './utils';
import packageJson from '../package.json';

const USER_CONFIG_PATH = `${homedir()}${path.sep}tlt`;

async function translate(query: string, appKey: string, secret: string) {
  const curtime = Math.round(new Date().getTime() / 1000);
  const salt = new Date().getTime();

  // 这里只能用get，post测试无法连通
  return axios.get('https://openapi.youdao.com/api', {
    params: {
      q: query,
      from: 'auto',
      to: 'auto',
      appKey,
      salt,
      sign: generateSign(query, appKey, salt, curtime, secret),
      signType: 'v3',
      curtime,
    },
  });
}

function readConfig() {
  if (fs.existsSync(USER_CONFIG_PATH)) {
    const file = fs.readFileSync(`${USER_CONFIG_PATH}${path.sep}config.json`, 'utf8');

    if (file) {
      return JSON.parse(file);
    }
  }

  return null;
}

function writeConfig(appKey: string, secret: string) {
  if (!fs.existsSync(USER_CONFIG_PATH)) {
    fs.mkdirSync(USER_CONFIG_PATH);
  }

  fs.writeFile(
    `${USER_CONFIG_PATH}${path.sep}config.json`,
    JSON.stringify({ appKey, secret }),
    'utf8',
    () => {
      // 缓存appKey以及secret
      setCache(appKey, secret);
    }
  );
}

function removeConfig() {
  fs.rm(`${USER_CONFIG_PATH}${path.sep}config.json`, { force: true }, () => {
    clearCache();
    process.exit(1);
  });
}

function startTranslate(query: string) {
  // 首先从缓存获取appkey和secret
  let appKey = getCache('appKey') || readConfig()?.appKey;
  let secret = getCache('secret') || readConfig()?.secret;

  // 从命令行获取appKey和secret
  if (!appKey || !secret) {
    inquirer
      .prompt([
        {
          type: 'input',
          name: 'appKey',
          message: 'youdao translation service appKey',
        },
        {
          type: 'input',
          name: 'secret',
          message: 'youdao translation service secret',
        },
      ])
      .then(({ appKey, secret }) => {
        // 开始翻译
        translate(query, appKey, secret)
          .then((res) => {
            // 写入配置
            writeConfig(appKey, secret);
            console.log(chalk.green(`🎉🎉🎉${res?.data?.translation?.[0] ?? '未查询到翻译结果'}`));
          })
          .catch((err) => console.log(err));

        // console.log(chalk.green('🖖配置完成🖖'));
      });
  } else {
    translate(query, appKey, secret).then((res) => {
      console.log(chalk.green(`🎉🎉🎉${res?.data?.translation?.[0] ?? '未查询到翻译结果'}`));
    });
  }
}

(function () {
  // node version must > 16.13
  require('please-upgrade-node')(packageJson);

  const program = new Command();
  program
    .version(packageJson.version)
    .name('🤖tlt🤖')
    .command('tlt [query]', 'some query text')
    .option('-rm --remove', 'reset your own appKey and secret')
    .action((options, command) => {
      if (options.remove) {
        // 移除缓存
        removeConfig();
      } else if (command.args.length) {
        startTranslate(command.args[0]);
      }
    })
    .parse(process.argv);
})();
