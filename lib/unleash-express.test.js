import { test } from 'ava';
import { UnleashExpress } from './unleash-express';
import { Unleash, UnleashMultiVariants } from '../test/helpers';

class App {
    constructor(cookies) {
        this.cookies = cookies;
        this.req = { cookies: this.cookies };
    }

    use(middleware) {
        middleware(this.req, {}, () => {});
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
    unleash.experiment('feature');
    t.true(unleashExpress.results['feature'].variant.name === 'control');
});

test('should keep persisted variant', t => {
    const app = new App({
        unleash: { feature: { variant: { name: 'control' } } },
    });
    const unleash = new Unleash({
        feature: {
            variant: { name: 'variant_1' },
        },
    });
    const unleashExpress = new UnleashExpress(unleash);
    app.use(unleashExpress.middleware());
    unleash.experiment('feature');
    t.true(unleashExpress.results['feature'].variant.name === 'control');
});

test('should keep persisted variant across different experiment calls', t => {
    const app = new App();
    const unleash = new UnleashMultiVariants({
        feature: {
            variants: [{ name: 'control' }, { name: 'variant_1' }],
        },
    });
    const unleashExpress = new UnleashExpress(unleash);
    app.use(unleashExpress.middleware());
    t.true(unleash.experiment('feature').name === 'control');
    t.true(unleashExpress.results['feature'].variant.name === 'control');
    t.true(unleash.experiment('feature').name === 'control');
    t.true(unleashExpress.results['feature'].variant.name === 'control');
});

test('should persist unleash results if no variant is given', t => {
    const app = new App({
        unleash: { feature: { variant: { name: 'control' } } },
    });
    const unleash = new Unleash({
        feature: {
            variant: null,
        },
    });
    const unleashExpress = new UnleashExpress(unleash);
    app.use(unleashExpress.middleware());
    unleash.experiment('feature');
    t.true(unleashExpress.results['feature'].variant === null);
});

test('should inject unleash results into the request object', t => {
    const app = new App();
    const unleash = new Unleash({
        feature: {
            variant: 'control',
        },
    });
    const unleashExpress = new UnleashExpress(unleash);
    app.use(unleashExpress.middleware());
    unleash.experiment('feature');
    t.deepEqual(app.req.unleash.results, unleashExpress.results);
});
