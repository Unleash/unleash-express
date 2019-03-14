/*
* Load and persist valid results in a cookie using Express.js request & response objects
*/

class ExpressCookieStore {
    constructor(req, res, options) {
        this.req = req;
        this.res = res;
        this.name = options.cookieName;
        this.options = options.cookieOptions;
        this.results = this.loadResults() || {};
    }

    loadResults() {
        return this.req.cookies ? this.req.cookies[this.name] : {};
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
        this.setCookie(this.name, this.results, this.options);
    }

    /*
    * Replace the unleash-express cookie values
    */
    setCookie(name, results, options) {
        this.res.cookie(name, results, options);
        const cookies = this.res.getHeaders()['set-cookie'];
        // At this point set-cookie header can be either undefined, String or Array.
        // We're interested in its Array form, holding multiple unleash-express
        // cookies.
        if (Array.isArray(cookies)) {
            for (let i = cookies.length - 2; i >= 0; i--) {
                const cookie = cookies[i];
                if (cookie && cookie.indexOf(`${name}=`) > -1) {
                    cookies.splice(i, 1);
                }
            }
        }
    }
}

module.exports.ExpressCookieStore = ExpressCookieStore;
