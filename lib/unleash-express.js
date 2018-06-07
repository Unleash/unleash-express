const { Results } = require('./results');

class UnleashExpress {
    constructor(client, options = {}) {
        this.client = client;
        this.options = Object.assign({
            cookieName: 'unleash',
            cookieOptions: {},
        }, options);
    }

    middleware() {
        const options = this.options;
        const getWrappedClientFunction = this.getWrappedClientFunction;
        const self = this;
        return function unleashExpress (req, res, next) {
            const results = new Results(self.client.getToggles());
            const wrappedExperiment = getWrappedClientFunction.call(self, 'experiment', results);
            const wrappedIsEnabled = getWrappedClientFunction.call(self, 'isEnabled', results);
            const cookie = req.cookies ? req.cookies[options.cookieName] : {};
            Object.assign(results, cookie);

            function experiment () {
                const result = wrappedExperiment.apply(null, arguments);
                res.cookie(options.cookieName, results, options.cookieOptions);
                return result;
            };

            function isEnabled() {
                const result = wrappedIsEnabled.apply(null, arguments);
                return result;
            }

            req.unleash = {
                experiment,
                isEnabled,
                results,
            };
            next();
        };
    }

    getWrappedClientFunction(fn, results, resultsKey) {
        const client = this.client;
        if (!client || typeof client[fn] != 'function') {
            throw new Error('Cannot wrap client function. Client or function is not defined.');
        }

        const original = client[fn];

        return function wrappedClientFn () {
            const featureName = arguments[0];
            const persistedResult = results[featureName];
            const clientResult = original.apply(client, arguments);
            let result = clientResult && persistedResult ? persistedResult : clientResult;
            results[featureName] = result;
            if (results[featureName] === null) {
                delete results[featureName];
            }
            return result;
        };
    }
}

module.exports.UnleashExpress = UnleashExpress;
