#!/usr/bin/env node
//
// Scans (and optionally fixes) markdown files for disallowed characters per
// the "Documentation Character Set" section of the repo-root AGENTS.md.
//
// POLICY IS A WHITELIST. Documentation is ASCII-only: printable ASCII
// (0x20-0x7E) plus tab / newline / carriage-return, with a small allowlist
// for the status-marker emoji. Any other codepoint is flagged -- including
// stray control bytes (e.g. NUL) and any non-ASCII glyph nobody enumerated.
// This is deliberate: a blacklist always lags (it is how smart punctuation,
// set-theory symbols, and NUL padding slipped in unnoticed). The REPLACEMENTS
// map below supplies the canonical ASCII fix for the common offenders; it does
// NOT define what is allowed.
//
// Scope (which files are considered):
//
//   (default)   branch  -- markdown changed vs merge base with origin/main
//   --staged            -- files staged for commit
//   --all               -- every *.md tracked by git
//   --working           -- tracked AND untracked *.md (respecting .gitignore),
//                          so brand-new, uncommitted docs are caught.
//
// Path scope (optional positional args): restrict to files under those paths,
// e.g. `docs/` or `docs/future`. With no path, scanning is repo-wide. The
// convention governs all docs (including READMEs anywhere), so a repo-wide SCAN
// is intended. A repo-wide FIX is not -- see below.
//
// Action:
//
//   (default)   scan only -- report violations, exit 1 if any are found.
//   --fix               -- rewrite files in place: apply the REPLACEMENTS table,
//                          strip control / NUL bytes, leave allowed emoji. Any
//                          non-ASCII with no known ASCII replacement is left in
//                          place and reported; exit 1 if such residue remains.
//                          --fix REQUIRES a path scope (e.g. `--fix --working
//                          docs/`) or the explicit `--all-paths` opt-in, so an
//                          auto-rewrite never silently sweeps the whole repo.
//
// docs/archive/ , docs/history/ , and docs/compliance/ (and any */archive/ ,
// */history/) are excluded in every mode: pre-convention, frozen, and
// legal/external content is intentionally not normalized. The `*/history/`
// match is segment-based, so the ticket tree's landed archives
// (docs/tickets/history/) are excluded too, while docs/tickets/triage/ and
// docs/tickets/future/ remain in scope and ARE scanned. docs/compliance/ is
// excluded because compliance records are immutable audit artifacts and
// external-facing statements that legitimately use characters the ASCII rule
// forbids (e.g. the copyright sign), which must not be rewritten.
//

const { execFileSync } = require('child_process');
const fs = require('fs');


//
// Canonical ASCII replacements, mirroring the "Required Replacements" table in
// AGENTS.md. Drives both the scan's suggested fix and the --fix rewrite.
//
const REPLACEMENTS = new Map([

    [0x2014, '--'],        // em dash
    [0x2013, '-'],         // en dash
    [0x2192, '->'],        // right arrow
    [0x2264, '<='],        // less-or-equal
    [0x2265, '>='],        // greater-or-equal
    [0x2026, '...'],       // ellipsis
    [0x00B7, '*'],         // middle dot
    [0x201C, '"'],         // smart double quote (open)
    [0x201D, '"'],         // smart double quote (close)
    [0x2018, "'"],         // smart single quote (open)
    [0x2019, "'"],         // smart single quote (close)
    [0x203A, '>'],         // single right angle quote
    [0x2229, 'intersect'], // set intersection
    [0x2295, '(+)'],       // circled plus
]);


//
// Allowlisted non-ASCII codepoints: the status-marker emoji permitted by
// AGENTS.md "Status markers", plus the emoji variation selector. Extend this
// set when a new intentional emoji is formally adopted.
//
const ALLOWED_EMOJI = new Set([

    0x2705, // white heavy check mark        (success / done)
    0x274C, // cross mark                    (failure / error)
    0x26A0, // warning sign                  (warning)
    0x2139, // information source            (info)
    0x23F3, // hourglass with flowing sand   (in progress)
    0xFE0F, // variation selector-16         (emoji presentation of the above)
]);


const isAllowed = (cp) =>
    cp === 0x09 || cp === 0x0A || cp === 0x0D || // tab, LF, CR
    (cp >= 0x20 && cp <= 0x7E) ||                 // printable ASCII
    ALLOWED_EMOJI.has(cp);                         // intentional status emoji


//
// Control bytes safe to delete outright: C0 controls (except tab / LF / CR)
// and DEL. NUL padding falls in here.
//
const isStrippableControl = (cp) =>
    (cp < 0x20 && cp !== 0x09 && cp !== 0x0A && cp !== 0x0D) || cp === 0x7F;


const argv = process.argv.slice(2);

const flags = argv.filter((a) => a.startsWith('--'));
const has = (flag) => flags.includes(flag);

//
// Positional (non-flag) args are path scopes. Normalize Windows separators and
// strip trailing slashes so prefix matching is uniform.
//
const pathScopes = argv
    .filter((a) => !a.startsWith('--'))
    .map((p) => p.replace(/\\/g, '/').replace(/\/+$/, ''));

const fix = has('--fix');
const allPaths = has('--all-paths');

const mode =
    has('--working') ? 'working' :
    has('--all') ? 'all' :
    has('--staged') ? 'staged' :
    'branch';


//
// --fix is the destructive action. Refuse a blanket repo-wide rewrite unless a
// path scope is given or --all-paths is explicit, so it can never silently
// normalize markdown far outside the area being worked on.
//
if (fix && pathScopes.length === 0 && !allPaths) {
    console.error('check-doc-chars --fix: refusing to rewrite repo-wide.');
    console.error('Pass a path scope (e.g. `docs/` or `docs/future`) or `--all-paths` to fix everything.');
    process.exit(2);
}


//
// Run git with an explicit argv array (no shell), so pathspec globs like
// `*.md` are passed literally to git on every platform (no cmd.exe quoting
// surprises) and the shell never glob-expands them first. A generous maxBuffer
// keeps large repos from overflowing the default 1 MB pipe and silently
// returning empty.
//
const git = (args) => {

    try {
        return execFileSync('git', args, {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
            maxBuffer: 256 * 1024 * 1024,
        }).trim();
    } catch (err) {
        return '';
    }
};


//
// Frozen / pre-convention / compliance trees are intentionally not normalized,
// so the guard skips them in every mode to avoid burying real violations in
// legacy noise (and, for compliance, to avoid rewriting immutable legal and
// external-facing records that legitimately use non-ASCII characters).
// Matching each token as a path SEGMENT (not a prefix) means a nested landed
// tree like `docs/tickets/history/` is excluded too, without a dedicated rule.
//
const EXCLUDED = /(^|\/)(archive|history|compliance)\//;

const filterMarkdown = (list) => list
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.endsWith('.md'))
    .filter((s) => !EXCLUDED.test(s));

const uniq = (arr) => [...new Set(arr)];

//
// Path-scope filter: with no scopes, every file passes (repo-wide). Otherwise
// keep files equal to or under one of the given paths.
//
const inScope = (file) =>
    pathScopes.length === 0 ||
    pathScopes.some((s) => file === s || file.startsWith(`${s}/`));


const trackedAndUntracked = () => {

    const tracked = git(['ls-files', '--', '*.md']);
    const untracked = git(['ls-files', '--others', '--exclude-standard', '--', '*.md']);
    return uniq(filterMarkdown(`${tracked}\n${untracked}`));
};


const filesForMode = () => {

    if (mode === 'working') {
        return trackedAndUntracked();
    }

    if (mode === 'all') {
        return filterMarkdown(git(['ls-files', '--', '*.md']));
    }

    if (mode === 'staged') {
        return filterMarkdown(git(['diff', '--cached', '--name-only', '--diff-filter=ACMR', '--', '*.md']));
    }

    //
    // Branch mode: vs merge base with the first upstream ref that resolves.
    // Falls back to a working-tree scan if no upstream is configured (e.g.,
    // shallow clone or detached state) so new files are still seen.
    //

    const candidates = ['origin/main', 'main'];
    const baseRef = candidates.find((ref) => git(['rev-parse', '--verify', ref]));

    if (!baseRef) {
        console.error('check-doc-chars: no upstream branch found; falling back to --working');
        return trackedAndUntracked();
    }

    const base = git(['merge-base', 'HEAD', baseRef]);
    if (!base) {
        return [];
    }

    return filterMarkdown(git(['diff', '--name-only', '--diff-filter=ACMR', `${base}..HEAD`, '--', '*.md']));
};


const describe = (cp) => {

    const hex = 'U+' + cp.toString(16).toUpperCase().padStart(4, '0');

    if (cp === 0x00) {
        return `NUL byte (${hex})`;
    }
    if (cp < 0x20 || cp === 0x7F) {
        return `control byte (${hex})`;
    }
    return `non-ASCII (${hex})`;
};


//
// Returns the violations in a string: every codepoint that is not allowed,
// with 1-based line/col and the offending line for context.
//
const scanText = (text) => {

    const violations = [];
    const lines = text.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {

        const line = lines[i];

        for (let j = 0; j < line.length; ) {

            const cp = line.codePointAt(j);

            if (!isAllowed(cp)) {
                violations.push({
                    line: i + 1,
                    col: j + 1,
                    name: describe(cp),
                    replace: REPLACEMENTS.get(cp),
                    text: line,
                });
            }

            j += cp > 0xFFFF ? 2 : 1;
        }
    }

    return violations;
};


const readFile = (relPath) => {

    try {
        return fs.readFileSync(relPath, 'utf8');
    } catch (err) {
        return null;
    }
};


//
// Rewrites a string to ASCII: replaces mapped codepoints, strips control bytes,
// keeps allowed emoji, and leaves any unmapped non-ASCII in place (it has no
// known ASCII equivalent and must be fixed by hand). Reports counts.
//
const fixText = (text) => {

    let out = '';
    let replaced = 0;
    let stripped = 0;

    for (const ch of text) {

        const cp = ch.codePointAt(0);

        if (isAllowed(cp)) {
            out += ch;
        } else if (REPLACEMENTS.has(cp)) {
            out += REPLACEMENTS.get(cp);
            replaced++;
        } else if (isStrippableControl(cp)) {
            stripped++;
        } else {
            out += ch;
        }
    }

    return { out, replaced, stripped };
};


const files = filesForMode().filter(inScope);

if (files.length === 0) {
    console.log('check-doc-chars: no markdown files in scope.');
    process.exit(0);
}


//
// --fix: rewrite in place, then report any non-ASCII that could not be fixed.
//
if (fix) {

    let changedFiles = 0;
    let totalReplaced = 0;
    let totalStripped = 0;
    const residual = [];

    for (const file of files) {

        const content = readFile(file);
        if (content === null) {
            continue;
        }

        const { out, replaced, stripped } = fixText(content);

        if (out !== content) {
            fs.writeFileSync(file, out, 'utf8');
            changedFiles++;
            totalReplaced += replaced;
            totalStripped += stripped;
            console.log(`fixed ${file}: ${replaced} replacement(s), ${stripped} control byte(s) stripped`);
        }

        for (const v of scanText(out)) {
            residual.push({ file, ...v });
        }
    }

    console.log(`\ncheck-doc-chars --fix: ${changedFiles} file(s) changed, ` +
        `${totalReplaced} replacement(s), ${totalStripped} control byte(s) stripped ` +
        `(${files.length} file(s) in scope).`);

    if (residual.length > 0) {
        console.error(`\n${residual.length} unfixable non-ASCII char(s) remain ` +
            `(no known ASCII equivalent) -- fix by hand:`);
        for (const v of residual) {
            console.error(`${v.file}:${v.line}:${v.col}: ${v.name}`);
            console.error(`    ${v.text}`);
        }
        process.exit(1);
    }

    console.log('check-doc-chars --fix: no unfixable characters remain.');
    process.exit(0);
}


//
// Default: scan only.
//
const allViolations = files.flatMap((file) => {

    const content = readFile(file);
    if (content === null) {
        return [];
    }
    return scanText(content).map((v) => ({ file, ...v }));
});

if (allViolations.length === 0) {
    console.log(`check-doc-chars: clean. ${files.length} file(s) scanned.`);
    process.exit(0);
}

for (const v of allViolations) {
    const hint = v.replace !== undefined ? ` -> ${v.replace}` : ' -> (replace with nearest ASCII)';
    console.log(`${v.file}:${v.line}:${v.col}: ${v.name}${hint}`);
    console.log(`    ${v.text}`);
}

console.error(`\ncheck-doc-chars: ${allViolations.length} violation(s) across ${files.length} file(s).`);
process.exit(1);
