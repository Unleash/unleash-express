class Unleash {
    constructor(features = {}) {
        this.features = features;
    }

    experiment(feature) {
        return this.features[feature].variant;
    }
}

class UnleashMultiVariants extends Unleash {
    experiment(feature) {
        const feat = this.features[feature];
        let variant;

        if (feat.variants) {
            feat.currentVariantIndex = feat.currentVariantIndex || 0;
            variant = feat.variants[feat.currentVariantIndex];
            if (feat.currentVariantIndex + 1 < feat.variants.length) {
                feat.currentVariantIndex++;
            }
        } else {
            variant = feat.variant;
        }

        return variant;
    }
}

module.exports.Unleash = Unleash;
module.exports.UnleashMultiVariants = UnleashMultiVariants;