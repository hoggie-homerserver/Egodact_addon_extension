# Personal data and planning imports

Plans, templates, copied blocks, and ideas are now scoped to an account and
selected school. Logging out or changing the login/school closes personal menus
and prevents their old callbacks from reading or writing data. Challenge responses
and their five-minute cache are bound to the exact current token and school.

The account namespace uses a SHA-256 digest of the JWT issuer, subject, and selected
school. These claims are used only to name local storage, not to authorize API
requests. Refreshing a JWT with the same issuer/subject preserves saved plans.
If the application's token is opaque or lacks these claims, the namespace falls
back to a digest of that token and school; changing that token creates a new
namespace. No raw tokens are written into personal storage keys.

Previously shared entries remain untouched and are not automatically assigned to
the current account, since their owner is unknown. To recover a known owner's old
plans, export them with the previous extension version in a trusted browser
profile, then import that file while logged in to the intended account and school.
There is no automatic migration for old ideas or templates. Keep a backup before
upgrading if you need those entries.

Data remains in the site's localStorage. This change separates application
accounts within a browser profile; it does not protect against malicious scripts
already executing on the Egodact origin or someone with access to browser tools.

Weekly imports and clipboard/template data must have integer days (0–6), finite
times within 0–1440 minutes with the end after the start, and expected field types.
Older HH:MM clipboard times remain supported. A week may contain at most 1,000
blocks, names/subjects at most 1,000 characters, and descriptions at most 20,000
characters. Planning import files are limited to 2 MiB. Malformed weeks are
rejected before overwriting saved plans, and failed replacement rendering restores
the previous stored week. Malformed saved weeks are ignored without deleting them.
Colors accept only six-digit hex values; other values become the default color,
so an imported CSS image URL cannot trigger a request.

Run security regression tests from the repository root with:

```sh
node --test tests/security.test.cjs
```

Tests use Node's built-in test runner, synthetic identities, and mocked API
responses. They require no package installation or production credentials.
