/**
 * Scripts to check unpublished version and run publish
 */
import { join } from 'path';
import { spawnSync } from 'child_process';
import { IPackageInfo, getPackageInfos } from './getPackageInfos';

if (process.env.BRANCH_NAME !== 'master') {
  console.log('The current branch forbids publishing.', process.env.BRANCH_NAME);
  process.exit(0);
}

function publish(pkg: string, version: string, directory: string): void {
  console.log('[PUBLISH]', `${pkg}@${version}`);
  console.log('[PUBLISH]', directory);
  spawnSync('npm', [
    'publish',
    // use default registry
  ], {
    stdio: 'inherit',
    cwd: directory,
  });
}

// Entry
console.log('[PUBLISH] Start:');

getPackageInfos(join(__dirname, '../packages'), true)
  .then((packageInfos: IPackageInfo[]) => {
    let publishedCount = 0;
    // Publish
    for (let j = 0; j < packageInfos.length; j++) {
      const { name, directory, localVersion, shouldPublish } = packageInfos[j];
      if (shouldPublish) {
        publishedCount++;
        console.log(`--- ${name}@${localVersion} ---`);
        publish(name, localVersion, directory);
      }
    }
    console.log(`[PUBLISH] Complete (count=${publishedCount}).`);
  });
