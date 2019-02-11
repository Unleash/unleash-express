import { test } from 'ava';
import { UnleashExpress } from './unleash-express';
import { Unleash } from '../test/helpers';

class App {
    constructor(cookies) {
        this.cookies = cookies;
        this.req = { cookies: this.cookies };
        this.res = { cookie: () => {} };
    }

    use(middleware) {
        middleware(this.req, this.res, () => {});
    }
}

test('should provide a middleware function', t => {
    const unleash = new Unleash();
    const unleashExpress = new UnleashExpress(unleash);
    t.true(typeof unleashExpress.middleware === 'function');
});

test('should store the experiment result', t => {
    const app = new App();
    const unleash = new Unleash({
        feature: {
            variants: [{ name: 'control' }],
        },
    });
    const unleashExpress = new UnleashExpress(unleash);
    app.use(unleashExpress.middleware());
    app.use((req) => {
        req.unleash.experiment('feature');
        t.true(req.unleash.results['feature'].name === 'control');
    });
});

test('should return the persisted experiment result', t => {
    const app = new App({
        unleash: { feature: { name: 'variant_1' } },
    });
    const unleash = new Unleash({
        feature: {
            variants: [{ name: 'control' }],
        },
    });
    const unleashExpress = new UnleashExpress(unleash);
    app.use(unleashExpress.middleware());
    app.use((req) => {
        req.unleash.experiment('feature');
        t.true(req.unleash.results['feature'].name === 'variant_1');
    });
});

test('should return the persisted experiment result across different experiment calls', t => {
    const app = new App();
    const unleash = new Unleash({
        feature: {
            variants: [{ name: 'control' }, { name: 'variant_1' }],
        },
    });
    const unleashExpress = new UnleashExpress(unleash);
    app.use(unleashExpress.middleware());
    app.use((req) => {
        t.true(req.unleash.experiment('feature').name === 'control');
        t.true(req.unleash.results['feature'].name === 'control');
        t.true(req.unleash.experiment('feature').name === 'control');
        t.true(req.unleash.results['feature'].name === 'control');
    });
});

test('should override the result', t => {
    const app = new App({
        unleash: { feature: { name: 'control' } },
    });
    const unleash = new Unleash({
        feature: {
            variants: null,
        },
    });
    const unleashExpress = new UnleashExpress(unleash);
    app.use(unleashExpress.middleware());
    app.use((req) => {
        req.unleash.experiment('feature');
        t.true(typeof req.unleash.results['feature'] === 'undefined');
    });
});

test('should persist enabled features', t => {
    const app = new App();
    const unleash = new Unleash({
        features: [{
            name: 'foo',
            enabled: true,
        },
        {
            name: 'bar',
            enabled: false,
        }],
    });
    const unleashExpress = new UnleashExpress(unleash);
    app.use(unleashExpress.middleware());
    app.use((req) => {
        req.unleash.isEnabled('foo');
        req.unleash.isEnabled('bar');
        t.true(req.unleash.results['foo']);
        t.false(req.unleash.results['bar']);
    });
});
