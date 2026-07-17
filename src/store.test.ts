import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildStore, findUser } from './store';


test('buildStore seeds users', () => {

    buildStore({ seed: [{ email: 'seed@example.com', passwordHash: 'hashed:pw' }] });

    assert.equal(findUser('seed@example.com')?.email, 'seed@example.com');
});
