// Build-time half of the service worker (public/sw.js). After each build it:
//   1. stamps a build id into dist/sw.js, so every deploy is a new worker;
//   2. injects the precache list (every built file the app shell needs) into dist/sw.js;
//   3. writes dist/version.json;
//   4. copies the built stylesheet links into dist/offline.html, so that page uses the same tokens.
import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// index.html is never precached: page loads always go to the network (Ahorra is online-only).
const NEVER_PRECACHE = new Set(['sw.js', 'version.json', 'index.html']);
const SKIPPED_FILE = /\.(map|txt)$|(^|\/)\.gitkeep$|^splash\//;

function listFiles(dir, base = '') {
  return readdirSync(join(dir, base), { withFileTypes: true }).flatMap((entry) => {
    const path = base ? `${base}/${entry.name}` : entry.name;
    return entry.isDirectory() ? listFiles(dir, path) : [path];
  });
}

// 202609301215-a1b2c3d: minute of the build, then the commit.
export function makeBuildId(root) {
  const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 12);
  let commit = 'nogit';
  try {
    commit = execSync('git rev-parse --short HEAD', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    // Not a git checkout: the timestamp alone still makes the id unique.
  }
  return `${stamp}-${commit}`;
}

// 1.0.0, 2.0.0 ...: the number of commits since baseCommit, so every deploy raises the major number by the commits it carries.
// Hosts often clone only the latest commit, so a shallow clone is completed first. If the history still cannot be read the
// version falls back to 0.0.0 and says so in the build log, and the build id still tells builds apart.
export function makeVersion(root, baseCommit) {
  const git = (args) => execSync(`git ${args}`, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  try {
    if (git('rev-parse --is-shallow-repository') === 'true') git('fetch --unshallow --quiet');
    const count = Number(git(`rev-list --count ${baseCommit}..HEAD`));
    if (Number.isInteger(count) && count >= 0) return `${count}.0.0`;
  } catch {
    console.warn(`version: could not count commits since ${baseCommit}; using 0.0.0.`);
  }
  return '0.0.0';
}

// Fails the build loudly if a marker is missing, instead of shipping an unstamped worker.
function replaceOnce(text, marker, value, file) {
  if (!text.includes(marker)) throw new Error(`${file}: marker ${marker} not found.`);
  return text.replace(marker, () => value);
}

export function ahorraServiceWorker(buildId) {
  let outDir;

  return {
    name: 'ahorra-service-worker',
    apply: 'build',
    configResolved(config) {
      outDir = join(config.root, config.build.outDir);
    },
    writeBundle() {
      const precache = listFiles(outDir)
        .filter((file) => !NEVER_PRECACHE.has(file) && !SKIPPED_FILE.test(file))
        .map((file) => `/${file}`)
        .sort();

      const styles = readFileSync(join(outDir, 'index.html'), 'utf8').match(/<link\b[^>]*\brel="stylesheet"[^>]*>/g) ?? [];
      if (styles.length === 0) throw new Error('index.html has no stylesheet link to copy into offline.html.');
      const offlinePath = join(outDir, 'offline.html');
      writeFileSync(
        offlinePath,
        replaceOnce(readFileSync(offlinePath, 'utf8'), '<!--ahorra:styles-->', styles.join('\n    '), 'offline.html'),
      );

      const swPath = join(outDir, 'sw.js');
      let sw = readFileSync(swPath, 'utf8');
      sw = replaceOnce(sw, "'__BUILD_ID__'", JSON.stringify(buildId), 'sw.js');
      sw = replaceOnce(sw, "['__PRECACHE_URLS__']", JSON.stringify(precache, null, 2), 'sw.js');
      writeFileSync(swPath, sw);

      writeFileSync(
        join(outDir, 'version.json'),
        `${JSON.stringify({ buildId, builtAt: new Date().toISOString() }, null, 2)}\n`,
      );

      console.log(`service worker: build ${buildId}, ${precache.length} files precached`);
    },
  };
}
