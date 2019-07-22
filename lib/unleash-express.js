const { Results } = require('./results');
const { ExpressCookieStore } = require('./cookies-store');

class UnleashExpress {
    constructor(client, options = {}) {
        this.client = client;
        this.options = Object.assign(
            {
                cookieName: 'unleash',
                cookieOptions: {},
            },
            options
        );
    }

    middleware() {
        const options = this.options;
        const getWrappedClientFunction = this.getWrappedClientFunction;
        const self = this;
        return function unleashExpress(req, res, next) {
            const cookieStore = new ExpressCookieStore(req, res, options);
            const results = new Results(self.client.getToggles(), cookieStore);
            const wrappedExperiment = getWrappedClientFunction.call(self, 'experiment', results);
            const wrappedIsEnabled = getWrappedClientFunction.call(self, 'isEnabled', results);

            req.unleash = {
                experiment: wrappedExperiment,
                isEnabled: wrappedIsEnabled,
                results,
            };

            next();
        };
    }

    getWrappedClientFunction(fn, results) {
        const client = this.client;
        if (!client || typeof client[fn] != 'function') {
            throw new Error('Cannot wrap client function. Client or function is not defined.');
        }

        const original = client[fn];

        return function wrappedClientFn(...args) {
            const featureName = args[0];
            const persistedResult = results.get(featureName);
            const clientResult = original.apply(client, args);
            let result = clientResult && persistedResult ? persistedResult : clientResult;
            results.persist(featureName, result);
            return result;
        };
    }
}

module.exports.UnleashExpress = UnleashExpress;
