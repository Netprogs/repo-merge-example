### Code Style Requirements Document

#### Based on `src/libs/example/modules`

This document outlines the code style requirements and conventions observed in the `src/libs/example/modules` directory.

---

### Section index

Style reference -- grep or deep-link rather than read top to bottom.

- [General Guidelines](#general-guidelines)
- [Workstream Lifecycle](#workstream-lifecycle)
- [Living design documentation](#living-design-documentation)
- [Code-side breadcrumbs to design docs](#code-side-breadcrumbs-to-design-docs)
- [Example cross-library rule](#example-cross-library-rule)
- [Documentation Character Set](#documentation-character-set)
- [Imports](#imports)
- [Constants](#constants)
- [Interfaces and Types](#interfaces-and-types)
- [Enums](#enums)
- [Functions](#functions)
- [Classes](#classes)
- [Comments and Documentation](#comments-and-documentation)
- [AI-Generated Comment Style](#ai-generated-comment-style)
- [Code Formatting](#code-formatting)
- [Conditional Statements](#conditional-statements)
- [Loops](#loops)
- [Variable Declarations](#variable-declarations)
- [Object and Array Literals](#object-and-array-literals)
- [Type Assertions and Casting](#type-assertions-and-casting)
- [Naming Conventions](#naming-conventions)
- [Export Patterns](#export-patterns)
- [Error Handling and Validation](#error-handling-and-validation)
- [Logging](#logging)
- [Best Practices](#best-practices)
- [TypeScript-Specific](#typescript-specific)
- [Summary Checklist](#summary-checklist)
- [Repository Scaffolding](#repository-scaffolding)

---

### General Guidelines

#### Code Creation

- ✅ Follow SOLID principles when logically makes sense to.
- ✅ Look for chances for code sharing, but do not overengineer.
- ✅ Check for existing functions, libraries, etc and use those before making new functions.

#### File Organization

- **One primary concept per file**: Classes, interfaces, and related functions should be organized logically
- **Use descriptive file names**: Follow the pattern `[category].[subcategory].[type].ts` (e.g., `cache.types.field.ts`,
  `layout.validations.generator.ts`)
- **Index files**: Use `index.ts` files to re-export modules from subdirectories

#### File Structure Order

1. Import statements (grouped logically)
2. Interfaces and types
3. Enums (if applicable)
4. Classes
5. Functions
6. Constants

---

### Workstream Lifecycle

The plan / phase / tracker authoring convention, the
`docs/future/` -> `docs/history/` archival flow, the `LANDED YYYY-MM-DD`
banner rule, cross-archive synthesis, and the notes-for-AI-assistants
sub-rules are documented in [`docs/AGENTS.md`](./docs/AGENTS.md).

That file is auto-picked-up by the cwd-walk when an agent is operating
in `docs/`, so code-only sessions are not forced to load it. Any work
that authors, lands, or archives a workstream (plan / phase / tracker)
-- or synthesises across archives -- must follow it.

---

### Living design documentation

`docs/design/` holds living current-state documentation for patterns
that span multiple libraries. Each doc describes how the codebase
works TODAY -- updated in place when the design shifts.

**Before non-trivial code changes that touch cross-library patterns,
scan `docs/design/` for a relevant doc.** Each design doc carries a
`## Code locations covered by this doc` header at the top listing the
file paths it watches. Grep `docs/design/*.md` for your branch's
file paths to find candidates. If your branch modifies a watched
file, update the design doc in the same branch as the code change.

The discipline is one-branch: doc moves with design, not after. See
[`docs/AGENTS.md`](./docs/AGENTS.md) "Design documentation" for the
full rules.

---

### Code review

Landing a large-track workstream, a new consumed surface, or a change that
touched a `docs/design/` pattern (the same trigger as the design scan above)
carries a code-review gate: before the archive move, a `Verified` spec-to-code
review must exist for the landing surface, or the maintainer must waive it
(recorded in the tracker). The reviewer checks CURRENT code against the surface's
spec, not a diff. Method, severity scale, the framing template, and the landing
precondition live in the runbook
[`docs/playbooks/code-review-playbook.md`](./docs/playbooks/code-review-playbook.md);
the lifecycle rule is in [`docs/AGENTS.md`](./docs/AGENTS.md) "Notes for AI
assistants". Small-track mechanical work (rename, dead-code prune, doc-only)
needs no review.

---

### Code-side breadcrumbs to design docs

When creating or significantly modifying a public class, exported
function, or exported decorator that participates in a pattern
documented in `docs/design/`, add a JSDoc breadcrumb naming the
design doc:

```typescript
/**
 * <One-paragraph description of what this symbol does in isolation.>
 *
 * Cross-library design: <one-line role in the pattern>. Documented at
 * `docs/design/<topic>.md`. If a change here extends the contract,
 * update the design doc in the same branch.
 */
export class ExampleGuard implements CanActivate {
```

Apply when:

- The symbol appears in a design doc's "Code locations covered"
  header, OR
- You are creating a new canonical entry point for an EXISTING
  pattern that has a design doc.

Do NOT apply to:

- Internal helpers, private methods, utility functions.
- Code that doesn't participate in a cross-library pattern (most
  code).
- Tests, fixtures, types, and DTOs (unless they ARE the pattern's
  surface).

**New patterns.** A pattern earns a design doc only when 2+
adopters exist (see `docs/AGENTS.md` "When a pattern earns its own
design doc"). At first-adopter time, no design doc and no
breadcrumb. At second-adopter time, the design doc is created AND
breadcrumbs are added to both adopters in the same branch.

If unsure: don't add. Over-breadcrumbing is noise; the goal is
making discovery work for the small set of canonical entry points.

---

### Example cross-library rule

Endpoints decorated with `@UseGuards(AuthGuard, ExampleGuard)`
MUST use `directRequest`, not `fallbackRequest`. See
[`docs/design/example-pattern.md`](./docs/design/example-pattern.md) for the
mechanism this rule enforces, the four mount-seam dispatches that
compensate for mount-time reads, and the rationale for the rule.

---

### Documentation Character Set

#### No Special Text Characters

- ALL documentation files (Markdown, READMEs, docs under any `docs/` directory,
  inline JSDoc, and code comments) MUST avoid special non-ASCII text
  characters for prose, punctuation, and symbols. Use the ASCII equivalents
  listed in the Required Replacements table below.
- Do NOT use Unicode punctuation, smart quotes, dashes, arrows, math symbols,
  box-drawing characters, or other typographic glyphs.
- Status markers may use EITHER emoji icons (✅, ❌, ⚠️, ℹ️, ⏳) OR ASCII
  bracket tokens (`[OK]`, `[FAIL]`, `[WARN]`, `[INFO]`, `[...]`). Pick the
  form that fits the medium -- icons render well in rich Markdown viewers;
  bracket tokens are grep-friendlier and survive plain-text paste (Slack,
  email, terminal logs). Be consistent within a single file.
- Icons must NOT be used as a substitute for punctuation, arrows, or math
  symbols (those still follow the ASCII rules below).
- When copying content from external sources, normalize punctuation and
  symbols to ASCII before committing. Leave intentional emoji untouched.
- Re-save edited files as UTF-8 without BOM. Files must not contain mojibake
  byte sequences produced by double-encoded UTF-8 (for example the corrupted
  `A-with-circumflex` + `Euro-sign` pair that renders as a broken em dash).

#### Status markers (both forms acceptable)

 Meaning         | Icon | Bracket token |
-----------------|------|---------------|
 Success / done  | ✅    | `[OK]`        |
 Failure / error | ❌    | `[FAIL]`      |
 Warning         | ⚠️   | `[WARN]`      |
 Info            | ℹ️   | `[INFO]`      |
 In progress     | ⏳    | `[...]`       |

#### Required Replacements

The policy is a WHITELIST: documentation is ASCII-only (printable ASCII plus
tab / newline / carriage-return), with the status-marker emoji as the only
permitted non-ASCII. The table below is NOT the list of what is banned -- it is
a set of canonical replacements for the common offenders, so everyone fixes them
the same way. Any non-ASCII character not in the status-emoji allowlist must be
replaced with its nearest ASCII equivalent, whether or not it appears here.

 Description (code point)            | Replace With |
-------------------------------------|--------------|
 Em dash (U+2014)                    | --           |
 En dash (U+2013)                    | -            |
 Right arrow (U+2192)                | ->           |
 Less-or-equal (U+2264)              | <=           |
 Greater-or-equal (U+2265)           | >=           |
 Ellipsis (U+2026)                   | ...          |
 Middle dot (U+00B7)                 | *            |
 Smart double quotes (U+201C/U+201D) | "            |
 Smart single quotes (U+2018/U+2019) | '            |
 Single right angle quote (U+203A)   | >            |
 Set intersection (U+2229)           | intersect    |
 Circled plus (U+2295)               | (+)          |

#### Verification

The repository carries an `npm run check:doc-chars` script (living under `docs/scripts/`)
that scans Markdown files and exits non-zero on violations. It is a whitelist scan:
it flags ANY non-ASCII codepoint outside the status-emoji allowlist, plus stray
control bytes (NUL and other C0 controls), so unlisted glyphs and corruption are
caught without maintaining a blacklist. Run it before committing documentation
changes; at landing run the check with `--fix --working <path>` on the workstream
while it is still in `docs/future/` (BEFORE the move -- `docs/history/` is excluded,
so a post-move check is a no-op).

AI assistants do NOT run this themselves. It is git-backed, and the agent
sandbox can return stale or truncated views of mounted files -- so an assistant
requests that the maintainer run it and report the result, the same way it
defers `git`, `tsc`, and `eslint`. Assistants verify their own edits with the
host-direct file tools (read / grep), never by shelling into the sandbox mount.

```shell
npm run check:doc-chars                          # default: changed files vs origin/main (repo-wide)
npm run check:doc-chars -- --staged              # files staged for commit
npm run check:doc-chars -- --all                 # every *.md tracked by git
npm run check:doc-chars -- --working             # tracked AND untracked *.md (use at landing)
npm run check:doc-chars -- --working docs/future # scan, scoped to a path
npm run check:doc-chars -- --fix --working docs/ # auto-fix, scoped (a path is REQUIRED for --fix)
```

Positional path args restrict any mode to files under those paths. With no path,
scanning is repo-wide -- the convention governs READMEs and docs everywhere, so a
repo-wide SCAN is intended.

`--fix` rewrites files in place: it applies the Required Replacements table,
strips control / NUL bytes, and leaves the allowed emoji untouched. A non-ASCII
character with no known ASCII replacement is left in place and reported (exit 1)
for a human to resolve -- `--fix` never guesses. To prevent an accidental
repo-wide rewrite, `--fix` REQUIRES a path scope (e.g. `docs/`) or the explicit
`--all-paths` opt-in; scanning has no such restriction. Review the diff after
fixing.

`docs/archive/` and `docs/history/` are excluded in every mode (pre-convention /
frozen content is intentionally not normalized). The status-marker emoji
(check, cross, warning, info, hourglass) are the only allowed non-ASCII; extend
the allowlist in the script if a new intentional emoji is adopted. Source:
the `check:doc-chars` script under `docs/scripts/`.

#### Summary Checklist Addition

- ✅ Documentation and comments contain no disallowed special text characters
- ✅ No Unicode punctuation, smart quotes, dashes, arrows, math symbols, or box-drawing glyphs
- ✅ Status markers use a consistent form within each file (icons OR bracket tokens, not both)
- ✅ All files saved as UTF-8 without BOM, no mojibake sequences, no stray control / NUL bytes
- ✅ `npm run check:doc-chars` is clean before commit (and `--working` clean at landing)

---

### Imports

#### Grouping

Imports should be organized in the following order with blank lines between groups:

```typescript
// 1. External libraries (namespace imports)
import * as _ from 'lodash';
import * as datefns from 'date-fns';

// 2. Shared packages
import { formatValue, prettyJSON } from '@scope/common';
import { math } from '@scope/common/algorithm';

// 3. Relative imports (grouped by functionality)
import {
    ImportField, ImportProductFieldValidator, ImportAbstractValidator, ImportRegexValidator,
} from '../import/types/index';

import {
    ProductValidatorConfig, ProductRegexValidator, ProductFieldOption, ProductLayoutGroup,
} from '../cache/types/index';
```

#### Import Style

- **Named imports**: Use named imports with destructuring
- **Namespace imports**: Use `import * as` for libraries like lodash and date-fns
- **Multi-line imports**: When importing multiple items, use multi-line format with proper indentation
- **Trailing comma**: Always include trailing comma on multi-line imports

---

### Constants

#### Naming Convention

- Use `SCREAMING_SNAKE_CASE` for constants
- Export constants directly

```typescript
export const CAPACITY_FLAG_FIELD = 'capacityEligibilityAttempted';
export const CAPACITY_PROVIDERS_DOCUMENT_FIELD = 'capacityProviders';
export const CAPACITY_PROVIDERS_CONTAINER = 'capacityProvidersContainer';

export const CAPACITY_FLAG_FIELD_SET = 'Yes';
export const CAPACITY_FLAG_FIELD_UNSET = '';
```

#### Grouping

- Group related constants together
- Use blank lines to separate different groups of constants

---

### Interfaces and Types

#### Interface Definition

```typescript
export interface ValidationParseResult {

    // The original config for the validator.
    config?: ProductValidatorConfig;

    // These are all the "parsed" results from the config.
    message: string;
    regex: string;
    regexFlags: string;
    params: any;
}
```

#### Style Rules

- **Blank line after opening brace**: Always include a blank line after the opening brace of an interface
- **Blank line before closing brace**: Always include a blank line before the closing brace
- **Comments**: Place comments above the property they describe
- **Optional properties**: Use `?` for optional properties
- **Type annotations**: Always provide explicit type annotations
- **Export**: Export interfaces that are used across modules

#### Property Organization

```typescript
export interface ProductField {

    created: Date;
    modified: Date;

    /** @deprecated Use fieldId */
    name: string;

    fieldId: string;
    fieldType?: LayoutFieldType;

    dataPath: string;
    dataPathType: LayoutDataPathType;

    // Group related properties together with blank lines
    label: string;
    reportLabel: string;
    description: string;
    placeholder: string;
}
```

---

### Enums

#### Definition Style

```typescript
export enum OptionBuilderType {

    Direct = 'direct',
    Lookup = 'lookup',
    NumberRange = 'number-range',

    /** @deprecated Renamed to Lookup above. */
    Workbook = 'workbook',
}
```

#### Rules

- Use `PascalCase` for enum names
- Use `PascalCase` for enum values
- String values should use `kebab-case`
- Include blank line after opening brace
- Include blank line before closing brace
- Use JSDoc comments for deprecated values

---

### Functions

#### Exported Functions

Use arrow function syntax with `export const`:

```typescript
export const mergeImportFields = (field: ImportField, inheritedField: ImportField): void => {

    field.fieldType = inheritedField.fieldType;

    field.dataPath = inheritedField.dataPath;
    field.dataPathType = inheritedField.dataPathType;

    field.label = field.label ? field.label : inheritedField.label;
};
```

#### Function Style Rules

- **Blank line after opening brace**: Always include blank line after function opening brace
- **Type annotations**: Always provide explicit parameter and return types
- **Naming**: Use `camelCase` for function names
- **Descriptive names**: Use clear, descriptive function names that indicate purpose
- **Line spacing**: Use blank lines to separate logical sections within functions

#### Complex Function Parameters

```typescript
export const parseValidatorParams = (
    fieldValidator: AbstractValidator,
    productValidator: ImportAbstractValidator | AbstractValidator | undefined = undefined,
): ValidationParseResult => {

    // Implementation
};
```

---

### Classes

#### Class Definition

```typescript
export class LayoutValidationsGenerator {

    private readonly layoutComponents: LayoutComponents;


    constructor(
        private messageLogger: MessageLogger,
        private productCache: ProductCacheData,
    ) {

        this.layoutComponents = new LayoutComponents(messageLogger, productCache);
    }


    // Members are ordered protected -> public -> private. 
    // Two blank lines follow the constructor; a single blank line separates each method thereafter.

    protected resolveComponents(): LayoutComponents {

        return this.layoutComponents;
    }

    public async processLayoutValidations(
        generatorParams: LayoutGeneratorParams,
        layoutValidations: LayoutValidationGroup[],
    ): Promise<void> {

        // Implementation
    }

    private logFailure(error: Error): void {

        this.messageLogger.error({
            msg: '[LAYOUT_VALIDATION_FAILED]',
            reference: {
                error: error.message,
                stack: error.stack,
            }
        });
    }
}
```

#### Class Style Rules

- **Access modifiers**: Always use explicit access modifiers (`public`, `private`, `protected`)
- **Property declaration**: Declare private properties before constructor
- **Constructor parameters**: Use parameter properties when appropriate (`private messageLogger: MessageLogger`)
- **Member order**: Order class members `protected` -> `public` -> `private`
- **Constructor spacing**: Use TWO blank lines after the constructor's closing brace
- **Method spacing**: Use a single blank line between methods (NOT two)
- **Method parameters**: Multi-line format for multiple parameters
- **Async methods**: Use `async` keyword with `Promise<T>` return type

#### Property Declaration

```typescript
export class LayoutValidationsGenerator {

    private readonly layoutComponents: LayoutComponents;

    // Use readonly for properties that shouldn't be reassigned
}
```

---

### Comments and Documentation

#### Rule of Thumb

We follow the standard TSDoc / Google / Airbnb convention:

- ✅ `/** ... */` JSDoc is for documenting declarations only --
  functions, methods, classes, interfaces, enums, type aliases, and their members.
  This is what TSDoc, TypeDoc, and `eslint-plugin-jsdoc` already assume.
- ✅ `//` (single or stacked) is for everything else --
  in-body explanations, file-level notes, section dividers, and TODOs.

House-specific deviations from the common style guides:

- ❌ Do NOT use `/* ... */` non-JSDoc block comments for general prose.
  Airbnb/Google permit them; we do not. Use stacked `//` instead.
- ✅ Open and close multi-paragraph `//` blocks with a blank `//` line
  (paragraph-style), and follow the AI-Generated Comment Style rules for
  wrapping and paragraph breaks.

#### Single-line Comments

```typescript
// This is a single-line comment explaining the next line
field.label = field.label ? field.label : inheritedField.label;
```

#### Multi-line Comments

Use stacked `//` lines (opened and closed with a blank `//` line) for any
commentary that is NOT documenting a declaration.

```typescript
//
// Go through each of the payment services, then each of the serviceComponents assigned to it.
// Add each validation for the serviceComponent to the related group. These groups already exist.
//
```

#### JSDoc Comments

Use `/** ... */` only on functions, methods, classes, interfaces, enums, type
aliases, and their members. This is the right place for `@param`, `@returns`,
`@deprecated`, `@throws`, and similar tags.

```typescript
/**
 * Merges inherited field metadata into `field`, preferring values already set on `field`.
 *
 * Used by the import pipeline so that product-level overrides win over the defaults pulled from the parent
 * template.
 *
 * @param field - The target field that receives merged values.
 * @param inheritedField - The parent template field providing fallbacks.
 */
export const mergeImportFields = (field: ImportField, inheritedField: ImportField): void => {

        // implementation
    };
```

Short JSDoc is allowed for single-line annotations on declared members:

```typescript
/** @deprecated Use fieldId */
name: string;

/** @deprecated No used */
Shared = 'shared',
```

#### TODO Comments

Always use `//` for TODOs, regardless of length.

```typescript
// TODO Create very specific unit tests for these functions outside of the system.

// TODO [UPDATE-NEEDED]
// PROJ-14365 This is no longer required. We build these at runtime within PaymentServiceBuilder.
```

#### Istanbul Ignore

Tooling directives that require the `/* */` form are exempt from the rules
above and should remain unchanged.

```typescript
/* istanbul ignore file */

// https://github.com/istanbuljs/nyc#parsing-hints-ignoring-lines
```

---

### AI-Generated Comment Style

These rules apply to ALL comments and JSDoc generated by AI assistants (JSDoc blocks, multi-line `//` comments,
inline explanations).

#### Paragraph structure

- ✅ Break long comments into paragraphs separated by a blank `*` line (JSDoc) or a blank `//` line (block
  comments). One paragraph = one idea.
- ✅ Lead each paragraph with the topic, not a continuation word. If a paragraph starts with "It", "This", or
  "That", consider whether it belongs with the previous paragraph instead.
- ❌ Do NOT produce single-paragraph walls of text longer than ~6 lines. Split at the natural topic shift.

#### Line wrapping

- ✅ The workspace `max-len` is 130 characters. Wrap prose lines so each line uses the available width -- aim
  to fill close to column 130 before breaking, not to wrap "around 80" out of habit. Wrapping that leaves
  most lines under ~100 characters when 130 is available is considered EARLY WRAPPING and is not acceptable.
- ❌ Do NOT carry old 72/80/100-column habits into this codebase. A comment that wraps at column 65-70 (common
  default for many AI tooling presets) is too narrow here. If a line could comfortably hold more words before
  hitting 130, extend it.
- ✅ The 130 figure is a ceiling, not a target floor for every line, but each line should sit much closer to
  130 than to 80. Treat ~110-130 as the normal landing zone for full prose lines; only the last line of a
  paragraph or a deliberately-broken aside should be shorter.
- ❌ Do NOT leave a single short word (`It`, `the`, `a`, `from`, `to`, `is`, `on`) or a trailing 2-3 word fragment
  (`on this fallback.`, `over the loop.`) as the only content of a line. If a wrap would produce one, break the
  previous line earlier so the fragment stays with its neighbour.
- ✅ Keep an identifier together with the verb that introduces it. Do not wrap between `created by` and
  `seedFieldKeySet`; wrap before `created by` instead.
- ✅ When a sentence contains an em-dash-style aside (` -- ...`), break AT the dash so the aside starts a new
  line, rather than trailing a long sentence.
- ✅ Prefer paragraph breaks over long single paragraphs. A 2-line paragraph at 130 chars reads better than a
  4-line paragraph at 80.

#### Tone and content

- ✅ Explain the WHY (intent, invariants, dormant fallbacks), not the WHAT the code already shows.
- ✅ Reference the related identifier(s) by name in backticks so the reader can grep for them.
- ❌ Do NOT restate the method signature in prose ("This method takes a field and returns a set"). The signature
  already says that.

#### Example -- preferred

```typescript
/**
 * Returns the cached `Set<string>` of validation compare keys already present in the given field.
 *
 * In normal builder flow the set is created by `seedFieldKeySet` when the field is first pushed via
 * `addOrUpdateFieldInGroup`, so the defensive seed loop below is expected to be a no-op (zero iterations) in
 * practice.
 *
 * It exists only as a fallback for callers that obtain a field from a source other than
 * `addOrUpdateFieldInGroup` -- for example, a future code path that imports a pre-existing group from a snapshot.
 */
```

#### Example -- avoid

```typescript
/**
 * Returns the cached `Set<string>` of validation compare keys already present
 * in the given field. In normal builder flow this set is created by `seedFieldKeySet` when the
 * field is first pushed via `addOrUpdateFieldInGroup`, so the defensive seed
 * loop below is expected to be a no-op (zero iterations) in practice. It
 * exists only as a fallback for callers that obtain a field from a source
 * other than `addOrUpdateFieldInGroup` (for example, a future code path that
 * imports a pre-existing group from a snapshot).
 */
```

What is wrong with the "avoid" example:

- ❌ Single paragraph mixing three ideas (what it returns, why the fallback exists, when it fires).
- ❌ Orphan words: a line ending in `It` and another ending in `the`.
- ❌ Long sentences that span 4+ wrapped lines without a break.

#### Example -- avoid (early wrapping)

```typescript
//
// Custom house rule: enforces AGENTS.md "blank line after opening
// brace of a class" without requiring a blank line before the closing
// brace. `@stylistic/padded-blocks` cannot express that asymmetry --
// its per-block-kind options accept only 'always' (both sides) or
// 'never' (neither side), so the only way to enforce the opening
// padding via padded-blocks would also force a trailing blank line,
// which the team has rejected.
//
```

Same prose wrapped correctly for this codebase (each line lands in the ~110-130 zone, except the deliberate
break at the em-dash aside):

```typescript
//
// Custom house rule: enforces AGENTS.md "blank line after opening brace of a class" without requiring a blank line before
// the closing brace. `@stylistic/padded-blocks` cannot express that asymmetry -- its per-block-kind options accept only
// 'always' (both sides) or 'never' (neither side), so the only way to enforce the opening padding via padded-blocks would
// also force a trailing blank line, which the team has rejected.
//
```

What is wrong with the early-wrapping version:

- ❌ Every line sits around column 65-70 when 130 is available. This is the dominant comment-style bug we see
  from AI assistants in this repo.
- ❌ Wrapping at ~70 nearly doubles the vertical footprint of every comment block for no readability benefit;
  130-column terminals and editors are the working assumption.
- ❌ Identifier/verb pairs that would fit on one line at 130 (`enforces AGENTS.md "blank line after opening
  brace of a class"`) get split across lines, which is exactly what the orphan/identifier rules above try to
  prevent.

---

### Code Formatting

#### Indentation

- Use **4 spaces** for indentation (no tabs)
- Consistent indentation for nested blocks

#### Line Length

- **Workspace `max-len` is 130 characters.** This applies to code and to prose comments alike. The
  `house/import-packing` rule defaults to the same 130 ceiling for packed import blocks.
- Aim to use the available width. Lines that wrap at ~80 in a 130-column codebase create unnecessary
  vertical sprawl; see `AI-Generated Comment Style > Line wrapping` for the prose-specific guidance.
- Break long lines at logical points (after an operator, before a chained method, at a function-arg
  boundary), not mid-identifier or mid-expression.

#### Blank Lines

- **One blank line** between different logical sections
- **One blank line** between class methods (NOT two)
- **Two blank lines** after the constructor's closing brace
- **One blank line** after opening braces of classes, interfaces, functions, and methods
- **One blank line** before closing braces (where appropriate)

#### Braces

- Opening brace on the same line as declaration
- Closing brace on its own line

```typescript
if (inheritedField.conditionals) {

    if (layoutGroup.conditionals) {
        layoutGroup.conditionals = _.merge(layoutGroup.conditionals, inheritedLayoutGroup.conditionals);
    } else {
        layoutGroup.conditionals = layoutGroup.conditionals ? layoutGroup.conditionals : inheritedLayoutGroup.conditionals;
    }
}
```

---

### Conditional Statements

#### If Statements

```typescript
if (condition) {

    // Code
}

if (condition) {
    // Single statement can be on same line as opening brace
}
```

#### Ternary Operators

```typescript
// Inline for simple cases
const order: string = optionParams.order ? optionParams.order : 'asc';

// Multi-line for complex cases
field.defaultValue = !_.isNil(field.defaultValue) && !_.isEmpty(field.defaultValue)
    ? field.defaultValue : inheritedField.defaultValue;
```

#### Early Returns

Use early returns with `continue` in loops:

```typescript
for (const paymentOption of service.paymentOptions) {

    if (!paymentOption.paymentTypes) {
        continue;
    }

    // Main logic
}
```

---

### Loops

#### For...of Loops

Preferred for iterating arrays:

```typescript
for (const key of configKeys) {
    params[key] = productValidator.config.params[key];
}

for (const value of numbers) {

    let optionValue: string = value.toString();

    // Processing logic
}
```

#### Array Methods

```typescript
const productFieldGroup: ProductValidationGroup | undefined =
    cacheValidations.find((v) => v.fieldValidationType === fieldValidationType);
```

---

### Variable Declarations

#### Const vs Let

- Use `const` by default
- Use `let` only when reassignment is needed

```typescript
const order: string = optionParams.order ? optionParams.order : 'asc';
const steps: number = parseInt((optionParams.steps ? optionParams.steps : '1'), 10);

let end: string = optionParams.end ? optionParams.end : '0';
let start: string = optionParams.start ? optionParams.start : '0';
```

#### Type Annotations

Always provide explicit type annotations:

```typescript
const validatorRegex: string = '';
const validatorRegexFlags: string | undefined = undefined;
const populatedOptions: ProductFieldOption[] = [];
```

---

### Object and Array Literals

#### Object Creation

```typescript
return {

    config: fieldValidator.config,
    message: message,
    regex: validatorRegex,
    regexFlags: validatorRegexFlags,
    params: params,

} as ValidationParseResult;
```

#### Array Creation

```typescript
populatedOptions.push({

    label: parsed,
    value: parsed,

} as ProductFieldOption);
```

#### Rules

- Blank line after opening brace
- Blank line before closing brace
- Trailing comma on last property
- Type assertion when needed (`as TypeName`)

---

### Type Assertions and Casting

#### Type Assertions

```typescript
productValidation.name = productValidation.name ? productValidation.name : importValidation.name as string;

return {
    config: fieldValidator.config,
    message: message,
} as ValidationParseResult;
```

---

### Naming Conventions

#### Summary Table

| Type               | Convention                  | Example                      |
|--------------------|-----------------------------|------------------------------|
| Constants          | SCREAMING_SNAKE_CASE        | `CAPACITY_FLAG_FIELD`        |
| Variables          | camelCase                   | `validatorRegex`             |
| Functions          | camelCase                   | `mergeImportFields`          |
| Classes            | PascalCase                  | `LayoutValidationsGenerator` |
| Interfaces         | PascalCase                  | `ValidationParseResult`      |
| Enums              | PascalCase                  | `OptionBuilderType`          |
| Enum Values        | PascalCase                  | `NumberRange`                |
| Private Properties | camelCase                   | `layoutComponents`           |
| Public Methods     | camelCase                   | `processLayoutValidations`   |
| Type Parameters    | Single Letter or PascalCase | `T`, `TResult`               |

---

### Export Patterns

#### Named Exports

Prefer named exports over default exports:

```typescript
export const mergeImportFields = (...) => {
};

export class LayoutValidationsGenerator {
}

export interface ValidationParseResult {
}

export enum OptionBuilderType { }
```

#### Re-exporting from Index Files

```typescript
export * from './cache.data';
export * from './cache.types.field';
export * from './cache.types.layout';
```

#### Rules

- Group related exports together
- Use blank lines to separate export groups
- Alphabetical order within groups (when logical)

---

### Error Handling and Validation

#### Null/Undefined Checks

```typescript
if (inheritedField.conditionals) {
    // Handle
}

if (!_.isNil(regex) && !_.isEmpty(regex)) {
    // Handle
}
```

#### Using Lodash Utilities

- Use lodash methods for common operations: `_.isNil()`, `_.isEmpty()`, `_.merge()`, `_.cloneDeep()`

---

### Logging

#### Error Logging Style

Use structured logging with a `reference` object to nest error details and context:

```typescript
this.logger.error({
    msg: '[HEALTH_CHECK_FAILED]',
    reference: {
        connectionKey: connectionKey,
        error: error.message,
        stack: error.stack,
    }
});
```

#### Rules

- **Message tag**: Use `msg` field with description of the message`)
- **Reference object**: Group error details and related context in a `reference` object
- **Context fields**: Include relevant context fields (like `connectionKey`, `hostname`, etc.) within the `reference` object
- **Structured format**: Always use object notation for logger methods, not string concatenation

#### Additional Logging Examples

```typescript
// Info logging with reference context
this.logger.info({
    msg: 'Connection established',
    reference: {
        connectionKey: connectionKey,
        hostname: hostname,
        databaseName: databaseName,
    }
});

// Warning with error and context
this.logger.warn({
    msg: 'Connection timeout',
    reference: {
        error: error.message,
        timeout: timeoutMs,
        connectionKey: connectionKey,
    }
});
```

---

### Best Practices

#### Immutability

```typescript
// Clone to avoid mutating cached data
const cloneValidations = _.cloneDeep(validations);
```

#### Descriptive Variable Names

```typescript
const currentYear: string = datefns.format(new Date(), 'yyyy');
const replaceRegExp: RegExp = new RegExp('\\{' + key + '\\}', 'g');
```

#### Logical Grouping

Group related assignments and operations together with blank lines separating different concerns:

```typescript
field.label = field.label ? field.label : inheritedField.label;
field.reportLabel = field.reportLabel ? field.reportLabel : inheritedField.reportLabel;
field.placeholder = field.placeholder ? field.placeholder : inheritedField.placeholder;
field.description = field.description ? field.description : inheritedField.description;

// Blank line before next group
field.formatter = field.formatter ? field.formatter : inheritedField.formatter;
```

---

### TypeScript-Specific

#### Optional Chaining

Use optional chaining where appropriate:

```typescript
if (serviceComponent.componentParams &&
    serviceComponent.componentParams.validations &&
    serviceComponent.componentParams.showForInterface) {
    // Handle
}
```

#### Union Types

```typescript
productValidator: ImportAbstractValidator | AbstractValidator | undefined = undefined
```

#### Generic Types

```typescript
Promise<void>
ProductFieldOption[]
```

---

### Summary Checklist

When writing code in this style:

- ✅ Use 4 spaces for indentation
- ✅ Include blank line after opening braces of functions, classes, interfaces
- ✅ Use single blank lines between class methods
- ✅ Always provide explicit type annotations
- ✅ Use `const` by default, `let` only when needed
- ✅ Export using named exports, not default exports
- ✅ Use arrow functions for standalone functions
- ✅ Use descriptive variable and function names in camelCase
- ✅ Group related code logically with blank lines
- ✅ Comment above code being explained
- ✅ Use SCREAMING_SNAKE_CASE for constants
- ✅ Use PascalCase for classes, interfaces, and enums
- ✅ Include trailing commas in multi-line arrays/objects
- ✅ Use lodash utilities for common operations
- ✅ Clone objects before mutation to maintain immutability
- ✅ AI comments use paragraphs separated by blank `*` / `//` lines
- ✅ AI comments fill the line out to the ~110-130 zone (workspace `max-len` is 130) and avoid single-word orphans or trailing 2-3
  word fragments
- ✅ AI comments do NOT wrap at ~65-80 chars when 130 is available (early wrapping is the most common comment-style violation)
- ✅ AI comments explain WHY, reference identifiers in backticks, and break at em-dash-style asides

---

### Repository Scaffolding

Adding a new shared lib (`@scope/<name>`) or a new deployable API means
creating the package's own source, then running `npm run wiring:gen`. The build
wiring -- the four `@scope/*` alias maps, the build config (e.g. `nest-cli.json`)
library projects, and your CI build fan-out in the build fan-out index -- is
GENERATED from the `libs/` folder list and the real import graph, not
hand-maintained. Run `npm run wiring:check` locally to confirm the committed
wiring is current; enforcing it as a CI gate is a future improvement. The
step-by-step procedure is a runbook:
[`docs/playbooks/example-playbook.md`](./docs/playbooks/example-play