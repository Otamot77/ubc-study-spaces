# Decision log

Record meaningful product and technical decisions here as the project evolves. Keep the reasoning and alternatives, not just the final answer.

## 2026-10-28 — Initial direction

**Status:** Working direction, not a frozen specification.

**Decision:** Prioritize a simple mobile-first busyness finder over a detailed campus directory.

**Why:** The key user question is where to study *now*, rather than browsing a large catalogue of rooms.

**Constraints:** Busyness comes from voluntary reports and may be unknown. Location must be opt-in. The first version should stay small.

## Open decisions

| Topic | Questions |
| --- | --- |
| Interface | List-first, map-first, or compact map + list? |
| Scope | Which buildings and study zones launch first? |
| Location | When should location be requested and how does manual selection work? |
| Reports | What age limit, weighting, and confidence rules are appropriate? |
| Identity | Anonymous, pseudonymous, or accounts? |
| Stack | Which frontend, backend, and database offer the simplest maintainable implementation? |
| Notifications | Should directions trigger an opt-in reminder after walking time + a grace period? |
| Deployment | Hosting, costs, and maintenance plan? |

## Future entries

Use this template:

### YYYY-MM-DD — Decision title
**Status:** Proposed / Accepted / Revisited

**Choice:** ...

**Alternatives:** ...

**Why:** ...

**Follow-up:** ...
