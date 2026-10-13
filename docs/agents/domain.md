# Domain Docs

This is a single-context repository. Engineering skills should consult the following files when they exist:

- `CONTEXT.md` at the repository root.
- Relevant decisions in `docs/adr/`.

If these files do not exist, proceed without flagging their absence. The domain-modeling flow creates them lazily when terms or decisions need to be recorded.

Use the glossary vocabulary from `CONTEXT.md` when naming domain concepts in issues, proposals, refactors, and tests. If a needed concept is not defined, note the gap rather than silently introducing competing terminology.

If an implementation or proposal contradicts an existing ADR, surface the conflict explicitly rather than silently overriding it.
