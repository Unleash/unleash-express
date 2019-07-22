import { test } from 'ava';
import { Results } from './results';

class Store {
    constructor(results) {
        this.results = results;
    }

    persist() {}
}

test('should be stringified as a usual object', t => {
    const results = new Results({}, { experiment1: { id: '0' } });
    t.true(results.toString() === '[object Object]');
});

test('should support to be stringified for Google Optimize', t => {
    const features = [
        {
            name: 'experiment1',
            goExperimentId: 'foo',
        },
        {
            name: 'experiment2',
            goExperimentId: 'bar',
        },
    ];
    const store = new Store({
        experiment1: { id: '0' },
        experiment2: { id: '1' },
    });
    const results = new Results(features, store);
    t.true(results.toString('GOOGLE_OPTIMIZE') === 'foo.0!bar.1');
});

test('should not stringify for Google Optimize when variant has no id', t => {
    const features = [
        {
            name: 'experiment1',
            goExperimentId: 'foo',
        },
    ];
    const store = new Store({
        experiment1: { name: 'control' },
    });
    t.true(new Results(features, store).toString('GOOGLE_OPTIMIZE') === '');
});

test('should not stringify for Google Optimize when experiment feature does not exist', t => {
    const features = [
        {
            name: 'experiment1',
            goExperimentId: 'foo',
        },
    ];
    const store = new Store({
        experiment2: { id: '1' },
    });
    t.true(new Results(features, store).toString('GOOGLE_OPTIMIZE') === '');
});

test('should not stringify for Google Optimize when experiment has no go experiment id', t => {
    const features = [
        {
            name: 'experiment1',
        },
    ];
    const store = new Store({
        experiment1: { id: '1' },
    });
    t.true(new Results(features, store).toString('GOOGLE_OPTIMIZE') === '');
});

test('should stringify when no features or results for Google Optimize', t => {
    const emptyStore = new Store({});
    t.true(new Results(undefined, emptyStore).toString('GOOGLE_OPTIMIZE') === '');
    t.true(new Results([], emptyStore).toString('GOOGLE_OPTIMIZE') === '');
    t.true(new Results([{ name: 'foo' }], emptyStore).toString('GOOGLE_OPTIMIZE') === '');
    t.true(new Results([], new Store({ foo: { id: 0 } })).toString('GOOGLE_OPTIMIZE') === '');
});
