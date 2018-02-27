import { test } from 'ava';
import { setupApp, Unleash } from './helpers';

const cookieValue = (obj) => encodeURIComponent(`j:${JSON.stringify(obj)}`);

test('should give persisted results across requests', async t => {
    t.plan(0);
    const unleash = new Unleash({
        feature: {
            variants: [{ name: 'variant_1' }, { name: 'control' }]
        },
    });

    let { app, request } = setupApp({ unleash });
    request = request.agent(app); // cookies will be persisted

    app.get('/', (req, res) => {
        res.send(req.unleash.experiment('feature').name);
    });

    await request
        .get('/')
        .expect(200)
        .expect('set-cookie', `unleash=${cookieValue({feature: { name: 'variant_1' }})}; Path=/`)
        .expect('variant_1');

    return request
        .get('/')
        .expect(200)
        .expect('set-cookie', `unleash=${cookieValue({feature: { name: 'variant_1' }})}; Path=/`)
        .expect('variant_1');
});

test('should give different persisted results across requests from diff clients', async t => {
    t.plan(0);
    const unleash = new Unleash({
        feature: {
            variants: [{ name: 'variant_1' }, { name: 'control' }]
        },
    });

    let { app, request } = setupApp({ unleash });
    request = request(app);

    app.get('/', (req, res) => {
        res.send(req.unleash.experiment('feature').name);
    });

    await request
        .get('/')
        .expect(200)
        .expect('set-cookie', `unleash=${cookieValue({feature: { name: 'variant_1' }})}; Path=/`)
        .expect('variant_1');

    return request
        .get('/')
        .expect(200)
        .expect('set-cookie', `unleash=${cookieValue({feature: { name: 'control' }})}; Path=/`)
        .expect('control');
});
