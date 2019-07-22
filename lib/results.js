class Results {
    constructor(features = [], store) {
        Object.defineProperty(this, 'features', {
            value: features,
            enumerable: false,
            configurable: false,
            writable: false,
        });

        Object.defineProperty(this, 'store', {
            value: store,
            enumerable: false,
            configurable: false,
            writable: false,
        });
    }

    get(featureName) {
        return this.store.get(featureName);
    }

    persist(featureName, result) {
        this.store.persist(featureName, result);
    }

    toString(format) {
        const results = this.store.results;
        let string;
        switch (format) {
            case 'GOOGLE_OPTIMIZE': {
                const featuresByName = this.features.reduce((a, b) => {
                    a[b.name] = b;
                    return a;
                }, {});
                string = Object.keys(results)
                    .map(key => {
                        const feature = featuresByName[key] || {};
                        const variant = results[key] || {};
                        if (!feature.goExperimentId || !variant.id) return null;
                        return `${feature.goExperimentId}.${variant.id}`;
                    })
                    .filter(experimentString => !!experimentString)
                    .join('!');
                break;
            }
            default: {
                string = super.toString();
            }
        }
        return string;
    }
}

module.exports.Results = Results;
