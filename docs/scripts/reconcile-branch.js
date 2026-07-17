#!/usr/bin/env node
/*
 * reconcile-branch.js -- branch reconciliation sweep harness (read-only).
 *
 * Wired as `npm run reconcile` (see package.json).
 *
 * What it does: regenerates the divergence inventory between a long-lived
 * refactor branch and the mainline it forked from, in ONE read-only run. It
 * recomputes the merge-base every time so the inventory is always correct for
 * the CURRENT divergence even as both branches advance. It never renders a diff
 * body -- it works from file names and change shapes only, so the result stays
 * small enough to reason about.
 *
 * Two modes:
 *   Sweep:      node docs/scripts/reconcile-branch.js [<OLD> <NEW> <scope>] [--out <dir>]
 *   File diff:  node docs/scripts/reconcile-branch.js <OLD> <NEW> --file <path> [--out <dir>]
 *
 * Or via npm:   npm run reconcile -- <OLD> <NEW> <scope>
 *
 * Defaults when omitted: OLD=origin/main  NEW=HEAD  scope=. (whole repo). A bare
 * `npm run reconcile` runs the standing whole-repo sweep. Pass a narrowing scope
 * (e.g. `services/ui`) to bound the sweep and restore the outside-scope bucket.
 *
 * Read-only git only (diff / merge-base / grep / show). It runs NO merge and no
 * mutating git. Defaults out-dir to <repo>/.reconcile-out. Output is UTF-8.
 *
 * CUSTOMIZE ME: the RESHAPE signature below is the one project-specific part.
 * It flags files that your refactor RESHAPED (changed a data shape) so a sweep
 * can route them to the unit playbook that re-expresses the mainline's change in
 * the new shape. Here it matches the "value.data" envelope this example's refactor
 * flattens (the `Profile.preferences` shape in src/types.ts); change it to whatever
 * shape your own refactor is flattening/reshaping. Owning the strict match
 * HERE, in JS, keeps it identical on every platform rather than depending on the
 * platform git's regex engine.
 */

'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..', '..');

// --- CUSTOMIZE: your refactor's reshape signature -----------------------------
// Example: a ".value.data" / ".value?.data" / "value: { data" envelope that the
// refactor is flattening. Replace with your own shape. `git grep` is only a fast
// prefilter (loose, POSIX-ERE, over-includes); the strict JS regex refines it so
// classification is platform-independent.
const RESHAPE_STRICT = /\.?value\??\.data\b|value:\s*\{\s*data/;
const RESHAPE_PREFILTER = '\\.?value\\??\\.data|value:[[:space:]]*\\{[[:space:]]*data';
// -----------------------------------------------------------------------------

function git(args) {
    return execFileSync('git', ['-C', REPO, ...args], {
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
    });
}

// git grep exits non-zero when there are no matches; treat that as empty.
function gitAllowEmpty(args) {
    try {
        return git(args);
    } catch (e) {
        if (e.status === 1 && !e.stderr) return '';
        throw e;
    }
}

// True if a ref resolves. Used to fall back from a remote-tracking ref to a local branch.
function refExists(ref) {
    try {
        execFileSync('git', ['-C', REPO, 'rev-parse', '--verify', '--quiet', ref], { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

function write(outDir, name, content) {
    fs.writeFileSync(path.join(outDir, name), content, 'utf8');
    return name;
}

function parseArgs(argv) {
    const out = { positional: [], file: null, outDir: null, help: false };
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === '--file') out.file = argv[++i];
        else if (argv[i] === '--out') out.outDir = argv[++i];
        else if (argv[i] === '--help' || argv[i] === '-h') out.help = true;
        else out.positional.push(argv[i]);
    }
    return out;
}

function usage() {
    console.error('Usage:');
    console.error('  npm run reconcile                          # defaults: origin/main HEAD . (whole repo)');
    console.error('  npm run reconcile -- <OLD> <NEW> <scope>   # override any positional');
    console.error('  node docs/scripts/reconcile-branch.js [<OLD> <NEW> <scope>] [--out <dir>]');
    console.error('  node docs/scripts/reconcile-branch.js [<OLD> <NEW>] --file <path> [--out <dir>]');
    console.error('');
    console.error('Defaults when omitted: OLD=origin/main  NEW=HEAD  scope=. (whole repo)');
    process.exit(1);
}

function joinLines(arr) {
    return arr.length ? arr.join('\n') + '\n' : '';
}

function inScope(p, scope) {
    return p === scope || p.startsWith(scope + '/');
}

// Parse `git diff --name-status` into {status, path, from} entries. Rename/copy
// rows are "R091\tfrom\tto" (NEW-side path is `to`); plain rows are "M\tpath".
function parseStatus(raw) {
    const entries = [];
    for (const line of raw.split('\n')) {
        if (!line.trim()) continue;
        const cols = line.split('\t');
        if (/^[RC]/.test(cols[0])) entries.push({ status: cols[0][0], path: cols[2], from: cols[1] });
        else entries.push({ status: cols[0], path: cols[1], from: null });
    }
    return entries;
}

// Cross-reference YOUR name-status (rename/copy aware) against OLD's net-new into
// the four buckets. `mineFinal` is the NEW-side path of every row; `mineRenamedFrom`
// is the OLD path of R/C rows, used to flag move-conflicts (mainline edited a path
// you renamed away).
function bucketize(mineRaw, oldRaw) {
    const mine = parseStatus(mineRaw);
    const oldPaths = parseStatus(oldRaw).map((e) => e.path);

    const mineFinal = new Set(mine.map((e) => e.path));
    const mineRenamedFrom = new Set(mine.filter((e) => e.from).map((e) => e.from));
    const oldSet = new Set(oldPaths);

    return {
        bothTouched: oldPaths.filter((p) => mineFinal.has(p)).sort(),
        onlyOld: oldPaths.filter((p) => !mineFinal.has(p) && !mineRenamedFrom.has(p)).sort(),
        moveConflicts: oldPaths.filter((p) => mineRenamedFrom.has(p)).sort(),
        onlyMine: [...mineFinal].filter((p) => !oldSet.has(p)).sort(),
    };
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) usage();

    let OLD = args.positional[0] || 'origin/main';
    const NEW = args.positional[1] || 'HEAD';
    const SCOPE = args.positional[2] || '.';

    // Fall back to a local branch when the remote-tracking ref is absent -- e.g. running on
    // a freshly built repo with no remote yet. `origin/main` -> `main`.
    if (!refExists(OLD) && OLD.startsWith('origin/')) {
        const local = OLD.slice('origin/'.length);
        if (refExists(local)) {
            OLD = local;
        }
    }

    // '.' is whole-repo: no pathspec, nothing "outside scope", so both-touched
    // captures every collision -- including root config, CI, and docs a narrowed
    // scope would miss. A narrowing scope re-enables the pathspec and restores the
    // outside-scope bucket for files the merge brings in untouched.
    const WHOLE = SCOPE === '.' || SCOPE === '';
    const scopeArgs = WHOLE ? [] : ['--', SCOPE];

    const outDir = args.outDir || path.join(REPO, '.reconcile-out');
    fs.mkdirSync(outDir, { recursive: true });

    // File-diff mode: both sides of one file's divergence, for close inspection.
    if (args.file) {
        const base = path.basename(args.file).replace(/\.[^.]+$/, '');
        const written = [
            write(outDir, `diff-old-${base}.txt`, git(['diff', `${NEW}...${OLD}`, '--', args.file])),
            write(outDir, `diff-mine-${base}.txt`, git(['diff', `${OLD}...${NEW}`, '--', args.file])),
        ];
        console.log(`Wrote ${written.join(', ')} to ${outDir}`);
        return;
    }

    console.log(`Reconciliation sweep: OLD=${OLD} NEW=${NEW} scope=${SCOPE}`);
    console.log(`Output: ${outDir}\n`);

    const written = [];

    // Fork point, recomputed every run.
    written.push(write(outDir, 'merge-base.txt', git(['merge-base', OLD, NEW])));

    // YOUR side: refactors + moves since the fork (three-dot = merge-base..NEW),
    // rename/copy aware at a 30% similarity floor so a moved-and-refactored file
    // reads as "R old new", not delete+add.
    const renameOpts = ['-M0.3', '-C0.3'];
    const mineRaw = git(['diff', '--name-status', ...renameOpts, `${OLD}...${NEW}`, ...scopeArgs]);
    written.push(write(outDir, 'mine.txt', mineRaw));
    written.push(write(outDir, 'mine-stat.txt', git(['diff', '--stat', ...renameOpts, `${OLD}...${NEW}`, ...scopeArgs])));

    // OLD side: net-new since the fork (three-dot = merge-base..OLD).
    const oldRaw = git(['diff', '--name-status', `${NEW}...${OLD}`, ...scopeArgs]);
    written.push(write(outDir, 'old-netnew.txt', oldRaw));
    written.push(write(outDir, 'old-netnew-stat.txt', git(['diff', '--stat', `${NEW}...${OLD}`, ...scopeArgs])));

    // Buckets: cross-reference the two name-status lists (see bucketize()).
    const buckets = bucketize(mineRaw, oldRaw);
    written.push(write(outDir, 'only-old.txt', joinLines(buckets.onlyOld)));
    written.push(write(outDir, 'both-touched.txt', joinLines(buckets.bothTouched)));
    written.push(write(outDir, 'move-conflicts.txt', joinLines(buckets.moveConflicts)));
    written.push(write(outDir, 'only-mine.txt', joinLines(buckets.onlyMine)));

    // Outside-scope net-new: everything OLD changed beyond SCOPE. NOT a separate
    // step -- a real `git merge OLD` brings these in. Listed only for awareness.
    // Empty under the whole-repo default (nothing is out of scope), so any
    // collision in root config / CI / docs lands in both-touched instead.
    const outside = WHOLE ? [] : parseStatus(git(['diff', '--name-status', `${NEW}...${OLD}`]))
        .filter((e) => !inScope(e.path, SCOPE))
        .map((e) => `${e.status}\t${e.path}`);
    written.push(write(outDir, 'outside-scope-netnew.txt', joinLines(outside)));

    // Reshape candidates on the NEW tree (see CUSTOMIZE block). git grep
    // prefilters; the strict JS signature refines, so results are platform-stable.
    const prefiltered = gitAllowEmpty(['grep', '-lE', RESHAPE_PREFILTER, NEW, ...scopeArgs])
        .split('\n')
        .map((l) => l.replace(new RegExp(`^${NEW}:`), '').trim())
        .filter(Boolean);
    const candidates = prefiltered.filter((f) => RESHAPE_STRICT.test(git(['show', `${NEW}:${f}`])));
    written.push(write(outDir, 'reshape-candidates.txt', joinLines(candidates)));

    console.log(`Done. Wrote to ${outDir}:`);
    console.log('  ' + written.join('\n  '));
    console.log('');
    console.log('Buckets:');
    console.log(`  only-old (clean bring-forward):            ${buckets.onlyOld.length}`);
    console.log(`  both-touched (same path both sides):       ${buckets.bothTouched.length}`);
    console.log(`  move-conflicts (renamed away on NEW):      ${buckets.moveConflicts.length}`);
    console.log(`  only-mine (your refactor surface):         ${buckets.onlyMine.length}`);
    console.log(`  outside-scope net-new (comes in via merge): ${outside.length}`);
    console.log(`  reshape candidates:                        ${candidates.length}`);
    console.log('Next: hand these to a reconciliation sweep session to dispatch and risk-order.');
}

main();
