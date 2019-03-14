import { test } from 'ava';
import { setupApp, Unleash } from './helpers';

const cookieValue = (obj) => encodeURIComponent(`j:${JSON.stringify(obj)}`);

test('should return the persisted results across requests of the same client', async t => {
    t.plan(0);
    const unleash = new Unleash({
        features: [{
            name: 'feature.variants.A',
            enabled: true,
            variants: [{ name: 'variant_1' }, { name: 'control' }],
        }],
    });

    const { app, request: _request } = setupApp({ unleash });
    const request = _request.agent(app); // persist cookies via an agent, simulating the same client

    app.get('/', (req, res) => {
        res.send(req.unleash.experiment('feature.variants.A').name);
    });

    await request
        .get('/')
        .expect(200)
        .expect('set-cookie', `unleash=${cookieValue({ 'feature.variants.A': { name: 'variant_1' } })}; Path=/`)
        .expect('variant_1');

    return request
        .get('/')
        .expect(200)
        .expect('set-cookie', `unleash=${cookieValue({ 'feature.variants.A': { name: 'variant_1' } })}; Path=/`)
        .expect('variant_1');
});

test('should return different persisted results across requests from different clients', async t => {
    t.plan(0);
    const unleash = new Unleash({
        features: [{
            name: 'feature.variants.A',
            enabled: true,
            variants: [{ name: 'variant_1' }, { name: 'control' }],
        }],
    });

    const { app, request: _request } = setupApp({ unleash });
    const request = _request(app); // no cookies will be persisted, simulating different clients

    app.get('/', (req, res) => {
        res.send(req.unleash.experiment('feature.variants.A').name);
    });

    await request
        .get('/')
        .expect(200)
        .expect('set-cookie', `unleash=${cookieValue({ 'feature.variants.A': { name: 'variant_1' } })}; Path=/`)
        .expect('variant_1');

    return request
        .get('/')
        .expect(200)
        .expect('set-cookie', `unleash=${cookieValue({ 'feature.variants.A': { name: 'control' } })}; Path=/`)
        .expect('control');
});

test('should remove the state of a feature from the cookie if not enabled', async t => {
    t.plan(0);
    const unleash = new Unleash({
        features: [{
            name: 'feature.A',
            enabled: true,
        }],
    });

    const { app, request: _request } = setupApp({ unleash });
    const request = _request.agent(app); // persist cookies via an agent, simulating the same client

    app.get('/', (req, res) => {
        res.send(req.unleash.isEnabled('feature.A'));
    });

    await request
        .get('/')
        .expect(200)
        .expect('set-cookie', `unleash=${cookieValue({ 'feature.A': true })}; Path=/`);

    unleash.features.features[0].enabled = false;

    return request
        .get('/')
        .expect(200)
        .expect('set-cookie', `unleash=${cookieValue({})}; Path=/`);
});

test('should remove the state of an experiment from the cookie if no variant was returned', async t => {
    t.plan(0);
    const unleash = new Unleash({
        features: [{
            name: 'feature.variants.A',
            enabled: true,
            variants: [{ name: 'variant_1' }, { name: 'control' }],
        }],
    });

    const { app, request: _request } = setupApp({ unleash });
    const request = _request.agent(app); // persist cookies via an agent, simulating the same client

    app.get('/', (req, res) => {
        res.send(req.unleash.experiment('feature.variants.A'));
    });

    await request
        .get('/')
        .expect(200)
        .expect('set-cookie', `unleash=${cookieValue({ 'feature.variants.A': { name: 'variant_1' } })}; Path=/`)

    unleash.features.features[0].enabled = false;

    return request
        .get('/')
        .expect(200)
        .expect('set-cookie', `unleash=${cookieValue({})}; Path=/`);
});

test('should send only one set-cookie header', async t => {
    t.plan(0);
    const unleash = new Unleash({
        features: [{
            name: 'feature.A',
            enabled: true,
        }, {
            name: 'feature.B',
            enabled: true,
        }],
    });

    const { app, request: _request } = setupApp({ unleash });
    const request = _request.agent(app);

    app.get('/', (req, res) => {
        req.unleash.isEnabled('feature.A');
        req.unleash.isEnabled('feature.B')
        res.send();
    });

    await request
        .get('/')
        .expect(200)
        .expect('set-cookie', `unleash=${cookieValue({ 'feature.A': true, 'feature.B': true })}; Path=/`);
});