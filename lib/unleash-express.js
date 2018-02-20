
class UnleashExpress {
    constructor(client, options = {}) {
        this.client = client;
        this.options = Object.assign({
            cookieName: 'unleash',
            cookieOptions: {},
        }, options);
        this.results = {};

        this.wrapClientFunction('experiment', 'variant');
    }

    middleware() {
        const results = this.results;
        const options = this.options;
        return function unleashExpress (req, res, next) {
            const cookie = req.cookies ? req.cookies[options.cookieName] : {};
            Object.assign(results, cookie);
            req.unleash = { results };
            next();
        };
    }

    wrapClientFunction(fn, resultsKey) {
        if (!this.client || typeof this.client[fn] != 'function') {
            return;
        }

        const original = this.client[fn];
        const results = this.results;

        if (original._wrap) {
            return;
        }

        this.client[fn] = function wrappedClientFn () {
            const feature = arguments[0];
            const persistedResult = (results[feature] = results[feature] || {})[resultsKey];
            const clientResult = original.apply(this, arguments);
            let result = clientResult && persistedResult ? persistedResult : clientResult;
            results[feature][resultsKey] = result;
            return result;
        };

        this.client[fn]._wrap = true;
    }
}

module.exports.UnleashExpress = UnleashExpress;
