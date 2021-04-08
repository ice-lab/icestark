/**
 * scripts to build docs
 */
import { spawnSync } from 'child_process';
import { copySync } from 'fs-extra';
import { join } from 'path';

console.log('[DOCS:BUILD]', process.cwd());

spawnSync('npm', [
  'run',
  'docs:build',
], {
  stdio: 'inherit',
  cwd: process.cwd(),
});

const source = join(__dirname, '../dist');
const target = join(__dirname, '../');

copySync(source, target);
