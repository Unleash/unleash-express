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

test('should persist unleash variant', t => {
    const app = new App();
    const unleash = new Unleash({
        feature: {
            variant: { name: 'control' },
        },
    });
    const unleashExpress = new UnleashExpress(unleash);
    app.use(unleashExpress.middleware());
    app.use((req) => {
        req.unleash.experiment('feature');
        t.true(req.unleash.results['feature'].name === 'control');
    });
});

test('should keep persisted variant', t => {
    const app = new App({
        unleash: { feature: { name: 'control' } },
    });
    const unleash = new Unleash({
        feature: {
            variant: { name: 'variant_1' },
        },
    });
    const unleashExpress = new UnleashExpress(unleash);
    app.use(unleashExpress.middleware());
    app.use((req) => {
        req.unleash.experiment('feature');
        t.true(req.unleash.results['feature'].name === 'control');
    });
});

test('should keep persisted variant across different experiment calls', t => {
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

test('should persist unleash results if no variant is given', t => {
    const app = new App({
        unleash: { feature: { name: 'control' } },
    });
    const unleash = new Unleash({
        feature: {
            variant: null,
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
            name: 'alternative_1',
            enabled: true,
        },
        {
            name: 'alternative_2',
            enabled: false,
        }],
    });
    const unleashExpress = new UnleashExpress(unleash);
    app.use(unleashExpress.middleware());
    app.use((req) => {
        t.true(req.unleash.isEnabled() === true);
    });
});
