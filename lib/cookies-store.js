/*
* Load and persist valid results in a cookie using Express.js request & response objects
*/

class ExpressCookieStore {
    constructor(req, res, options) {
        this.req = req;
        this.res = res;
        this.cookieName = options.cookieName;
        this.options = options.cookieOptions;
        this.results = this.loadResults() || {};
    }

    loadResults() {
        return this.req.cookies ? this.req.cookies[this.cookieName] : {};
    }

    get(featureName) {
        return this.results[featureName];
    }

    persist(featureName, result) {
        // Only store valid results
        if (result !== false && result !== null) {
            this.results[featureName] = result;
        } else {
            delete this.results[featureName];
        }
        this.res.cookie(this.cookieName, this.results, this.cookieOptions);
    }
}

module.exports.ExpressCookieStore = ExpressCookieStore;
