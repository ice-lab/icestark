/**
 * Scripts to check unpublished version and run publish
 */
import { join } from 'path';
import { spawnSync } from 'child_process';
import { IPackageInfo, getPackageInfos } from './getPackageInfos';

const semverReg = /^\d+\.\d+\.\d+$/;

if (process.env.BRANCH_NAME === 'master') {
  console.log('The current branch forbids publishing.', process.env.BRANCH_NAME);
  process.exit(0);
}

function publishBeta(pkg: string, version: string, directory: string): void {
  console.log('[PUBLISH BETA]', `${pkg}@${version}`);
  console.log('[PUBLISH BETA]', directory);
  spawnSync('npm', [
    'publish',
    " --tag='beta'",
  ], {
    stdio: 'inherit',
    cwd: directory,
    shell: true,
  });
}

// Entry
console.log('[PUBLISH BETA] Start:');

getPackageInfos(join(__dirname, '../packages'), true)
  .then((packageInfos: IPackageInfo[]) => {
    let publishedCount = 0;
    // Publish
    for (let j = 0; j < packageInfos.length; j++) {
      const { name, directory, localVersion, shouldPublish } = packageInfos[j];
      const conformedSemver = semverReg.test(localVersion);
      if (shouldPublish) {
        if (conformedSemver) {
          console.log(`Package ${name} expects to provide a semver version., instead of ${localVersion}`);
          continue;
        }

        publishedCount++;
        console.log(`--- ${name}@${localVersion} ---`);
        publishBeta(name, localVersion, directory);
      }
    }
    console.log(`[PUBLISH BETA] Complete (count=${publishedCount}).`);
  });

