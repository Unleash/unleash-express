import { test } from 'ava';
import { Results } from './results';

test('should be stringified as a usual object', t => {
    const results = new Results({}, { experiment_1: { id: '0' } });
    t.true(results.toString() === '[object Object]');
});

test('should support to be stringified for Google Optimize', t => {
    const features = [
        {
            name: 'experiment_1',
            goExperimentId: 'foo',
        },
        {
            name: 'experiment_2',
            goExperimentId: 'bar',
        },
    ];
    const baseResults = {
        experiment_1: { id: '0' },
        experiment_2: { id: '1' },
    };
    const results = new Results(features, baseResults);
    t.true(results.toString('GOOGLE_OPTIMIZE') === 'foo.0!bar.1');
});

test('should not stringify for Google Optimize when variant has no id', t => {
    const features = [
        {
            name: 'experiment_1',
            goExperimentId: 'foo',
        },
    ];
    const baseResults = {
        experiment_1: { name: 'control' },
    };
    t.true(new Results(features, baseResults).toString('GOOGLE_OPTIMIZE') === '');
});

test('should not stringify for Google Optimize when experiment feature does not exist', t => {
    const features = [
        {
            name: 'experiment_1',
            goExperimentId: 'foo',
        },
    ];
    const baseResults = {
        experiment_2: { id: '1' },
    };
    t.true(new Results(features, baseResults).toString('GOOGLE_OPTIMIZE') === '');
});

test('should not stringify for Google Optimize when experiment has no go experiment id', t => {
    const features = [
        {
            name: 'experiment_1',
        },
    ];
    const baseResults = {
        experiment_1: { id: '1' },
    };
    t.true(new Results(features, baseResults).toString('GOOGLE_OPTIMIZE') === '');
});

test('should stringify when no features or results for Google Optimize', t => {
    t.true(new Results().toString('GOOGLE_OPTIMIZE') === '');
    t.true(new Results([], {}).toString('GOOGLE_OPTIMIZE') === '');
    t.true(new Results([{ name: 'foo' }], {}).toString('GOOGLE_OPTIMIZE') === '');
    t.true(new Results([], { foo: { id: 0 } }).toString('GOOGLE_OPTIMIZE') === '');
});
