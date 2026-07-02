# TEACH_US.md

## Idea: Treat rate limiting as a product decision, not just an infra guardrail

Most teams bolt on rate limiting purely as an anti-abuse measure — a flat "N requests per
minute per IP" rule applied uniformly across the API, tuned once and forgotten. In this
project I split it into three tiers instead: a generous general API limiter, a strict
limiter on public feedback submission (anti-spam), and a strict limiter on login
(anti-brute-force). That's a common pattern. The idea I'd actually suggest Acowale adopt is
one step further:

**Rate limits should be defined next to the endpoint's business risk, not its infra cost.**

Concretely: instead of a global `rateLimiter.js` with a few exported presets, define the
limit as metadata on the route itself, alongside its validation schema — something like:

```js
router.post('/feedback', rateLimit({ tier: 'public-write', reason: 'spam prevention' }), ...)
router.post('/auth/login', rateLimit({ tier: 'auth', reason: 'credential stuffing' }), ...)
```

Why this matters at Acowale's stage: as Acodash grows past a single feedback form into
the multi-tenant CRM implied in the CEO's letter ("thousands of businesses use it every
day"), different tenants and different endpoints will have wildly different acceptable
request patterns — a billing webhook needs to allow bursts, a password-reset endpoint
needs to be nearly paranoid, and a read-heavy dashboard endpoint needs headroom for
legitimate power users. If rate limits live as scattered numeric constants, nobody
remembers *why* a given limit is what it is six months later, and engineers either loosen
it blindly (reintroducing the original risk) or leave it too tight (breaking a legitimate
customer) because the reasoning was never recorded.

Tagging each limiter with its **tier** and **reason** turns rate limiting into
self-documenting security policy instead of a magic number. It also means you can generate
a real audit artifact for free: a script that walks all routes and prints "endpoint → tier
→ reason → current limit" becomes your security review doc, instead of a wiki page someone
has to remember to update.

## Why I believe this over the alternative

The alternative — a single shared rate limit config file with per-route overrides — is
what most teams do (including the first draft of this project), and it works fine at
small scale. It breaks down specifically at the moment a team starts to scale
horizontally and onboard new engineers who didn't write the original limits: nobody
can tell from reading `rateLimiter.js` *why* `/feedback` is capped at 5/min instead of 10,
or whether it's safe to raise. Co-locating the "why" with the "what," right at the route
definition, is a small change that pays off exactly when Acowale's own hiring pitch comes
true — new engineers shipping features they didn't design from scratch, who need to trust
the guardrails they're inheriting.

This isn't a novel invention — it's closer to how well-run API gateways (Kong, AWS API
Gateway with usage plans) already think about rate limiting as policy. The suggestion is
just to bring that discipline in-process, in code, rather than treating it as ops
configuration bolted on separately from the endpoints it protects.
