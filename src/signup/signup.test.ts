import { test } from 'node:test';
import assert from 'node:assert/strict';

import { handleSignup } from './signup';
import { welcomeEmailsSentTo } from '../store';


test('a repeat signup for an existing address sends no second welcome', () => {

    const email = 'repeat@example.com';

    handleSignup({ email: email, password: 'pw' });
    handleSignup({ email: email, password: 'pw' });

    assert.equal(welcomeEmailsSentTo(email), 1);
});
