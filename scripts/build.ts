import * as execa from 'execa';
import parse from 'yargs-parser';
import kebabcase from 'lodash.kebabcase';

function run(command: string) {
  console.log(`[RUN]: ${command}`);
  return execa.commandSync(command, { stdio: 'inherit' });
}

const monoPackages = [
  'icestark',
  'icestark-app',
  'icestark-data',
  'icestark-module',
  'sandbox',
];

const rawArgv = parse(process.argv.slice(2), {
  configuration: { 'strip-dashed': true },
});

delete rawArgv._;

(async () => {
  const argvsKeys = Object.keys(rawArgv);

  for (let i = 0; i < argvsKeys.length; ++i) {
    const kebabcasedKey = kebabcase(argvsKeys[i]);
    if (!monoPackages.includes(kebabcasedKey)) {
      throw new Error(`[RUN BUILD]: No package named ${kebabcasedKey}.`);
    }

    run(`cd packages/${kebabcasedKey} && rimraf lib && npm run build`);
  }
})().catch((e) => {
  console.trace(e);
  process.exit(128);
});
