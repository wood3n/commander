const esbuild = require('esbuild');
const chalk = require('chalk');
const { nodeExternalsPlugin } = require('esbuild-node-externals');

const startPlugin = {
  name: 'start',
  setup(build) {
    build.onStart(() => {
      console.log('compiling typescript files...');
    });
  },
};

esbuild
  .build({
    entryPoints: ['scripts/index.ts'],
    bundle: true,
    platform: 'node',
    target: ['node12'],
    loader: {
      '.ts': 'ts',
    },
    plugins: [startPlugin, nodeExternalsPlugin()],
    outfile: 'lib/index.js',
    minify: true,
    watch: {
      onRebuild(error, result) {
        if (error) {
          console.error(chalk.red('compiled failed:'), error);
        } else {
          console.log(chalk.green('compiled success'));
        }
      },
    }, // make esbuild listen tsfile change to rebuild automaticly
  })
  .then(() => {
    console.log(chalk.green('compiled success'));
  })
  .catch(() => process.exit(1));
