const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { webcrypto } = require('node:crypto');
const vm = require('node:vm');

const source = name => readFileSync(join(__dirname, '../Egodact Smart/src', name), 'utf8');
const TOKEN_KEY = 'pYfkT6ZWcUB98Sla76HppFpk4aYdTAp0_CACHE_0';
const jwt = (sub, nonce = 'first', iss = 'https://synthetic.example/') =>
    ['e30', Buffer.from(JSON.stringify({ sub, iss, nonce })).toString('base64url'), 'signature'].join('.');
function fixture(fetch = async () => { throw new Error('Unexpected fetch'); }) {
    const data = new Map();
    const storage = {
        getItem: key => data.get(key) ?? null,
        setItem: (key, value) => data.set(key, String(value)),
        removeItem: key => data.delete(key)
    };
    const context = vm.createContext({ localStorage: storage, crypto: webcrypto, TextEncoder, TextDecoder, atob, fetch });
    vm.runInContext(source('security.js') + '\n' + source('challenges.js'), context);
    return {
        data, storage, context,
        login(token, school = 'school-A') { storage.setItem(TOKEN_KEY, token); storage.setItem('selectedSchool', school); },
        run: code => vm.runInContext(code, context)
    };
}
const block = { id: 123.5, dag: 0, start: 540, einde: 600, naam: 'Math', beschrijving: 'Homework', onderwerp: 'Math', challengeId: 'challenge-1', kleur: '#1976d2' };

test('personal storage separates users, issuers, schools and unowned legacy entries', async () => {
    const f = fixture();
    f.storage.setItem('egodact_planner_template', 'legacy private tasks');
    f.login(jwt('A'));
    const a = await f.run('egodactOpenPersoonlijkeOpslag()');
    assert.equal(a.getItem('egodact_planner_template'), null);
    for (const key of ['egodact_planner_template', 'week', 'clipboard', 'ideas']) a.setItem(key, 'A private data');
    for (const [token, school] of [[jwt('B'), 'school-A'], [jwt('A'), 'school-B'], [jwt('A', 'first', 'https://other.example/'), 'school-A']]) {
        f.login(token, school);
        const other = await f.run('egodactOpenPersoonlijkeOpslag()');
        for (const key of ['egodact_planner_template', 'week', 'clipboard', 'ideas']) assert.equal(other.getItem(key), null);
        assert.throws(() => a.setItem('week', 'stale update'), /gewijzigd/);
    }
    f.login(jwt('A'));
    const again = await f.run('egodactOpenPersoonlijkeOpslag()');
    assert.equal(again.getItem('week'), 'A private data');
    assert.equal(f.storage.getItem('egodact_planner_template'), 'legacy private tasks');
    assert.ok([...f.data.keys()].every(key => !key.includes(jwt('A'))));
});

test('JWT refresh preserves plans but invalidates old handles; logout fails closed', async () => {
    const f = fixture();
    f.login(jwt('A'));
    const old = await f.run('egodactOpenPersoonlijkeOpslag()');
    old.setItem('week', 'saved');
    f.login(jwt('A', 'refreshed'));
    const refreshed = await f.run('egodactOpenPersoonlijkeOpslag()');
    assert.equal(refreshed.getItem('week'), 'saved');
    assert.equal(old.actief(), false);
    assert.throws(() => old.getItem('week'), /gewijzigd/);
    f.storage.removeItem(TOKEN_KEY);
    assert.throws(() => refreshed.setItem('week', 'bad'), /gewijzigd/);
    await assert.rejects(f.run('egodactOpenPersoonlijkeOpslag()'), /Log eerst in/);
});

test('opaque and malformed tokens get separate hashed namespaces', async () => {
    const f = fixture();
    f.login('opaque-A');
    const a = await f.run('egodactOpenPersoonlijkeOpslag()');
    a.setItem('week', 'A data');
    for (const token of ['opaque-B', 'invalid.@@@.token']) {
        f.login(token);
        const other = await f.run('egodactOpenPersoonlijkeOpslag()');
        assert.equal(other.getItem('week'), null);
    }
});

test('identity changes during async namespace creation do not open stale storage', async () => {
    const f = fixture(); f.login(jwt('A'));
    const opening = f.run('egodactOpenPersoonlijkeOpslag()');
    f.login(jwt('B'));
    await assert.rejects(opening, /gewijzigd/);
});

test('challenge cache is scoped to exact session and school and requires login', async () => {
    let calls = 0;
    const f = fixture(async (_url, options) => {
        calls++;
        const name = options.headers.Authorization + '/' + options.headers.School;
        return { ok: true, json: async () => ({ challenges: { c: { id: 'c', name, color: 'url(https://invalid.example/)' } } }) };
    });
    f.login('A');
    const a = await f.run('egodactLaadChallenges()');
    assert.equal(a[0].kleur, null);
    await f.run('egodactLaadChallenges()'); assert.equal(calls, 1);
    f.login('B');
    const b = await f.run('egodactLaadChallenges()'); assert.notEqual(a[0].naam, b[0].naam);
    f.login('B', 'school-B');
    const school = await f.run('egodactLaadChallenges()'); assert.notEqual(school[0].naam, b[0].naam);
    f.storage.removeItem(TOKEN_KEY);
    await assert.rejects(f.run('egodactLaadChallenges()'), /Geen access token/);
    assert.equal(calls, 3);
});

test('in-flight response from previous login cannot replace a newer cache', async () => {
    const pending = [];
    const f = fixture(() => new Promise(resolve => pending.push(resolve)));
    f.login('A'); const old = f.run('egodactLaadChallenges()');
    f.login('B'); const current = f.run('egodactLaadChallenges()');
    pending[1]({ ok: true, json: async () => ({ challenges: { b: { id: 'b', name: 'B private challenge' } } }) });
    await current;
    pending[0]({ ok: true, json: async () => ({ challenges: { a: { id: 'a', name: 'A private challenge' } } }) });
    await assert.rejects(old, /gewijzigd/);
    const cached = await f.run('egodactLaadChallenges()'); assert.equal(cached[0].id, 'b');
});

test('week normalization preserves valid exports and legacy HH:MM clipboard times', () => {
    const f = fixture(); f.context.input = [block];
    assert.deepEqual(JSON.parse(JSON.stringify(f.run('egodactNormaliseerWeek(input)'))), [block]);
    f.context.input = [{ ...block, start: '09:00', einde: '10:00', id: undefined }];
    const normalized = f.run('egodactNormaliseerWeek(input)')[0];
    assert.equal(normalized.start, 540); assert.equal(normalized.einde, 600);
    assert.equal(typeof normalized.id, 'string');
});

test('malformed day, time, field types and oversized weeks are rejected', () => {
    const f = fixture();
    const invalid = [null, [], { ...block, dag: 0.5 }, { ...block, dag: -1 }, { ...block, dag: 7 },
        { ...block, dag: '0' }, { ...block, start: NaN }, { ...block, einde: Infinity },
        { ...block, start: -1 }, { ...block, einde: 1441 }, { ...block, einde: 540 },
        { ...block, start: '09:99' }, { ...block, start: {} }, { ...block, naam: {} },
        { ...block, beschrijving: 'x'.repeat(20001) }, { ...block, id: {} }, { ...block, challengeId: [] }];
    for (const item of invalid) {
        f.context.input = [item]; assert.throws(() => f.run('egodactNormaliseerWeek(input)'));
    }
    f.context.input = Array(1001).fill(block); assert.throws(() => f.run('egodactNormaliseerWeek(input)'), /grote/);
});

test('CSS URL colors are stripped at the data boundary; custom hex colors survive', () => {
    const f = fixture();
    for (const kleur of ['url(https://invalid.example/track)', 'red; background: url(x)', {}, '#123', 'red']) {
        f.context.input = [{ ...block, kleur }];
        assert.equal(f.run('egodactNormaliseerWeek(input)')[0].kleur, null);
    }
    f.context.input = [{ ...block, kleur: '#aAbB12' }];
    assert.equal(f.run('egodactNormaliseerWeek(input)')[0].kleur, '#aAbB12');
});
