<!-- Illustrative example -- delete when starting real work. -->
## Code locations covered by this doc

- `src/lib-core/result-envelope.ts`
- `src/api/handler.base.ts`
- `src/search/search-api.ts`

# Result-envelope pattern

LIVING design doc.

## Problem

Handlers across libraries each invented their own success/failure return
shape -- some threw, some returned `null`, some returned bare data with an
out-of-band error flag. Callers could not handle results uniformly, and
adding a new consumer meant re-deriving the shape from an existing call
site. A single cross-library return shape lets every caller branch on one
discriminant and read errors from one place.

## Mechanism

`result-envelope.ts` exports a `Result<T>` union -- `{ ok: true, value: T }`
or `{ ok: false, error: ErrorInfo }` -- plus the constructors `ok(value)`
and `err(code, message)`. Producers never throw across a library boundary;
they return an envelope. Consumers narrow on `result.ok` before touching
`value` or `error`. The base handler in `handler.base.ts` wraps every
route so an uncaught throw is converted into an `err(...)` envelope,
guaranteeing the shape even on failure. Adopters include the base handler
(`handler.base.ts`) and the search API surface (`search-api.ts`), which
returns its page of results inside the same envelope.

## Invariants and limitations

- A function that returns `Result<T>` MUST NOT also throw for expected
  failures; expected failures are `err(...)`.
- `error.code` is a stable string enum; callers branch on `code`, not on
  `message` (message is human-facing and may change).
- The envelope carries no transport concern (no HTTP status); mapping a
  `code` to a status is the handler layer's job, not the envelope's.
- Not a replacement for exceptions on genuinely unexpected faults inside a
  single library; the envelope is the CROSS-boundary contract.
