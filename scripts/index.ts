import { Command } from 'commander';
import axios from 'axios';
import { generateSign } from './utils';
import packageInfo from '../package.json';
const program = new Command();

async function translate(query: string, appKey: string, secret: string) {
  const curtime = Math.round(new Date().getTime() / 1000);
  const salt = new Date().getTime();

  // 这里只能用get，post测试无法连通
  return axios.get('https://openapi.youdao.com/api', {
    params: {
      q: query,
      from: 'zh-CHS',
      to: 'en',
      appKey,
      salt,
      sign: generateSign(query, appKey, salt, curtime, secret),
      signType: 'v3',
      curtime,
    },
  });
}

translate('测试', '5dca74570dfbecb9', 'KsKVZ2AaKVYtzuawjephpOyJZMNAyy3M')
  .then((res) => {
    console.log('success', res);
  })
  .catch((err) => console.log(err));

// TODO:使用inquire对接命令行参数
// function smallTemp() {
//   const version = packageInfo.version;

//   program
//     .version(version)
//     .option('--entry', 'entry path that v18n will start to parse code')
//     .option('--secret', 'output path that v18n use to generate locale json file')
//     .option(
//       '--config',
//       'configuration file, if you use this option, v18n will only use configuration in this file'
//     );

//   program.parse(process.argv);

//   const options = program.opts();
//   console.log(options);
// }

// smallTemp();
