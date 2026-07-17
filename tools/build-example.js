#!/usr/bin/env node
/*
 * build-example.js -- reproducible builder for the two-branch reconciliation example.
 *
 * Run ONCE, from the repo root, on a fresh repo (git initialized, nothing committed). It
 * writes the base source tree itself, so it does not matter what is in the working tree.
 * It produces the history the walkthrough needs:
 *
 *   main             -- the mainline (base app + M1..M8)
 *   refactor         -- the long-lived refactor branch (base app + R1..R5); the branch
 *                       a reader clones and reconciles. Left checked out at the end.
 *   refactor-merged  -- the answer key: refactor with main merged in and every conflict
 *                       and semantic break resolved (tsc + tests green).
 *
 * This is a HUMAN-run tool. The repo's rule is that the AI does not run git; this script
 * is how a maintainer builds the example. It embeds each divergent file's full content so
 * the whole divergence is reproducible and inspectable from one command:
 *
 *   node tools/build-example.js
 */

'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');

function git(args) {

    execFileSync('git', ['-C', REPO, ...args], { stdio: 'inherit' });
}

function gitQuiet(args) {

    return execFileSync('git', ['-C', REPO, ...args], { encoding: 'utf8' });
}

function tryGit(args) {

    // For commands that may exit non-zero as an expected outcome (e.g. a conflicting merge).
    try {
        execFileSync('git', ['-C', REPO, ...args], { stdio: 'inherit' });
    } catch {
        // swallowed on purpose; caller handles the resulting state
    }
}

function writeFile(rel, content) {

    const full = path.join(REPO, rel);

    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content, 'utf8');
}

function removeFile(rel) {

    fs.rmSync(path.join(REPO, rel), { force: true });
}

function commit(message) {

    git(['add', '-A']);
    git(['commit', '--no-verify', '-m', message]);
}

function hasCommits() {

    try {
        execFileSync('git', ['-C', REPO, 'rev-parse', '--verify', '--quiet', 'HEAD'], { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

// --------------------------------------------------------------------------------------
// Embedded file contents. Each is the FULL file as it exists after the given commit, so
// the builder never has to compute a diff. Template literals escape backticks (\`) and
// dollar-brace (\${) so the TypeScript template strings are written out verbatim.
// --------------------------------------------------------------------------------------

const MAIN = {};
const REFACTOR = {};
const MERGED = {};

// ---- main: M1 email/welcome.ts (reworded log line) ----
MAIN['src/email/welcome.ts'] = `import { recordWelcomeEmail } from '../store';

//
// Stub welcome-email send. In a real app this would call an email provider; here it
// records the send so the example can observe how many went out.
//
export const sendWelcomeEmail = (email: string): void => {

    recordWelcomeEmail(email);

    console.log(\`[email] welcome email dispatched to \${email}\`);
};
`;

// ---- main: M2 src/server.ts (adds GET /health at the top of handle) ----
MAIN['src/server.ts'] = `import { createServer, IncomingMessage, ServerResponse } from 'http';

import { handleLogin } from './auth/login';
import { handleSignup } from './signup/signup';


const PORT = Number(process.env.PORT ?? 3000);

const readJsonBody = (req: IncomingMessage): Promise<Record<string, unknown>> => {

    return new Promise((resolve, reject) => {

        let raw = '';

        req.on('data', (chunk) => { raw += String(chunk); });

        req.on('end', () => {

            if (!raw) {
                resolve({});
                return;
            }

            try {
                resolve(JSON.parse(raw) as Record<string, unknown>);
            } catch {
                reject(new Error('invalid JSON body'));
            }
        });

        req.on('error', reject);
    });
};

const send = (res: ServerResponse, status: number, body: unknown): void => {

    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
};

const handle = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {

    try {

        if (req.method === 'GET' && req.url === '/health') {
            send(res, 200, { ok: true });
            return;
        }

        if (req.method === 'POST' && req.url === '/login') {

            const body = await readJsonBody(req);
            const result = handleLogin({ email: String(body.email ?? ''), password: String(body.password ?? '') });

            send(res, result.status, result.body);

            return;
        }

        if (req.method === 'POST' && req.url === '/signup') {

            const body = await readJsonBody(req);
            const result = handleSignup({ email: String(body.email ?? ''), password: String(body.password ?? '') });

            send(res, result.status, result.body);

            return;
        }

        send(res, 404, { error: 'not found' });

    } catch (err) {
        send(res, 400, { error: (err as Error).message });
    }
};

const server = createServer((req: IncomingMessage, res: ServerResponse) => {

    void handle(req, res);
});

server.listen(PORT, () => {

    console.log(\`app on http://localhost:\${PORT}\`);
});
`;

// ---- main: M3 src/signup/signup.ts (fix: welcome only for a NEW user) ----
MAIN['src/signup/signup.ts'] = `import { SignupRequest } from '../types';
import { findUser, saveUser } from '../store';
import { sendWelcomeEmail } from '../email/welcome';


const hash = (password: string): string => {

    return \`hashed:\${password}\`;
};

export interface SignupResult {

    body: unknown;
    status: number;
}

export const handleSignup = (req: SignupRequest): SignupResult => {

    if (!req.email || !req.password) {
        return { status: 400, body: { error: 'email and password are required' } };
    }

    const existing = findUser(req.email);

    if (!existing) {
        saveUser({ email: req.email, passwordHash: hash(req.password) });
        sendWelcomeEmail(req.email);
    }

    return { status: 201, body: { email: req.email } };
};
`;

// ---- main: M4 src/auth/login.ts (reject empty credentials) ----
MAIN['src/auth/login.ts'] = `import { findUser } from '../store';
import { LoginRequest } from '../types';


const hash = (password: string): string => {

    return \`hashed:\${password}\`;
};

export interface LoginResult {

    body: unknown;
    status: number;
}

export const handleLogin = (req: LoginRequest): LoginResult => {

    if (!req.email || !req.password) {
        return { status: 401, body: { error: 'invalid credentials' } };
    }

    const user = findUser(req.email);

    if (!user || user.passwordHash !== hash(req.password)) {
        return { status: 401, body: { error: 'invalid credentials' } };
    }

    return { status: 200, body: { email: user.email } };
};
`;

// ---- main: M5 src/profile.ts (getPreferences returns a defensive copy) ----
MAIN['src/profile.ts'] = `import { Profile } from './types';

const profiles = new Map<string, Profile>();


export const saveProfile = (profile: Profile): void => {

    profiles.set(profile.email, profile);
};

//
// Reads a user's preferences out of the wrapped envelope, returning a defensive copy so
// callers cannot mutate stored state.
//
export const getPreferences = (email: string): string[] => {

    const profile = profiles.get(email);

    return profile ? [...profile.preferences.value.data] : [];
};
`;

// ---- main: M6 src/admin/reset.ts (new; imports the soon-to-be-retired SignupRequest) ----
MAIN['src/admin/reset.ts'] = `import { SignupRequest } from '../types';

//
// Admin helper: echoes the email from a signup request so an operator can confirm which
// account a reset targets. Imports \`SignupRequest\` -- a type the refactor branch retires.
//
export const resetSignup = (req: SignupRequest): string => {

    return req.email;
};
`;

// ---- main: M7 src/store.test.ts (new; builds the store with no clock) ----
MAIN['src/store.test.ts'] = `import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildStore, findUser } from './store';


test('buildStore seeds users', () => {

    buildStore({ seed: [{ email: 'seed@example.com', passwordHash: 'hashed:pw' }] });

    assert.equal(findUser('seed@example.com')?.email, 'seed@example.com');
});
`;

// ---- main: M8 src/signup/signup.test.ts (new; encodes the dup-welcome fix intent) ----
MAIN['src/signup/signup.test.ts'] = `import { test } from 'node:test';
import assert from 'node:assert/strict';

import { handleSignup } from './signup';
import { welcomeEmailsSentTo } from '../store';


test('a repeat signup for an existing address sends no second welcome', () => {

    const email = 'repeat@example.com';

    handleSignup({ email: email, password: 'pw' });
    handleSignup({ email: email, password: 'pw' });

    assert.equal(welcomeEmailsSentTo(email), 1);
});
`;

// ---- refactor: R1 move auth/login -> modules/auth/login (imports repointed) ----
REFACTOR['src/modules/auth/login.ts'] = `import { findUser } from '../../store';
import { LoginRequest } from '../../types';


const hash = (password: string): string => {

    return \`hashed:\${password}\`;
};

export interface LoginResult {

    body: unknown;
    status: number;
}

export const handleLogin = (req: LoginRequest): LoginResult => {

    const user = findUser(req.email);

    if (!user || user.passwordHash !== hash(req.password)) {
        return { status: 401, body: { error: 'invalid credentials' } };
    }

    return { status: 200, body: { email: user.email } };
};
`;

// ---- refactor: R1 server.ts import repointed to the moved module (no /health here) ----
REFACTOR['src/server.ts'] = `import { createServer, IncomingMessage, ServerResponse } from 'http';

import { handleLogin } from './modules/auth/login';
import { handleSignup } from './signup/signup';


const PORT = Number(process.env.PORT ?? 3000);

const readJsonBody = (req: IncomingMessage): Promise<Record<string, unknown>> => {

    return new Promise((resolve, reject) => {

        let raw = '';

        req.on('data', (chunk) => { raw += String(chunk); });

        req.on('end', () => {

            if (!raw) {
                resolve({});
                return;
            }

            try {
                resolve(JSON.parse(raw) as Record<string, unknown>);
            } catch {
                reject(new Error('invalid JSON body'));
            }
        });

        req.on('error', reject);
    });
};

const send = (res: ServerResponse, status: number, body: unknown): void => {

    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
};

const handle = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {

    try {

        if (req.method === 'POST' && req.url === '/login') {

            const body = await readJsonBody(req);
            const result = handleLogin({ email: String(body.email ?? ''), password: String(body.password ?? '') });

            send(res, result.status, result.body);

            return;
        }

        if (req.method === 'POST' && req.url === '/signup') {

            const body = await readJsonBody(req);
            const result = handleSignup({ email: String(body.email ?? ''), password: String(body.password ?? '') });

            send(res, result.status, result.body);

            return;
        }

        send(res, 404, { error: 'not found' });

    } catch (err) {
        send(res, 400, { error: (err as Error).message });
    }
};

const server = createServer((req: IncomingMessage, res: ServerResponse) => {

    void handle(req, res);
});

server.listen(PORT, () => {

    console.log(\`app on http://localhost:\${PORT}\`);
});
`;

// ---- refactor: R2 split -- signup delegates to welcome-dispatch ----
REFACTOR['src/signup/welcome-dispatch.ts'] = `import { sendWelcomeEmail } from '../email/welcome';

//
// Dispatches the welcome email for a signup. \`isNew\` indicates whether the signup created
// a new user; the current policy sends regardless.
//
export const dispatchWelcome = (email: string, isNew: boolean): void => {

    void isNew;

    sendWelcomeEmail(email);
};
`;

// signup.ts after R2 (delegates) and R4 (uses Credentials) -- written once at R4.
REFACTOR['src/signup/signup.ts@R2'] = `import { SignupRequest } from '../types';
import { findUser, saveUser } from '../store';
import { dispatchWelcome } from './welcome-dispatch';


const hash = (password: string): string => {

    return \`hashed:\${password}\`;
};

export interface SignupResult {

    body: unknown;
    status: number;
}

export const handleSignup = (req: SignupRequest): SignupResult => {

    if (!req.email || !req.password) {
        return { status: 400, body: { error: 'email and password are required' } };
    }

    const existing = findUser(req.email);
    const isNew = !existing;

    if (isNew) {
        saveUser({ email: req.email, passwordHash: hash(req.password) });
    }

    dispatchWelcome(req.email, isNew);

    return { status: 201, body: { email: req.email } };
};
`;

// ---- refactor: R3 reshape -- Profile.preferences flattened; getPreferences follows ----
REFACTOR['src/profile.ts'] = `import { Profile } from './types';

const profiles = new Map<string, Profile>();


export const saveProfile = (profile: Profile): void => {

    profiles.set(profile.email, profile);
};

//
// Reads a user's preferences out of the (now flat) preferences array.
//
export const getPreferences = (email: string): string[] => {

    const profile = profiles.get(email);

    return profile ? profile.preferences : [];
};
`;

// types.ts after R3 (flat Profile) and R4 (SignupRequest retired) -- written once at R4.
REFACTOR['src/types.ts@R4'] = `export interface User {

    email: string;
    passwordHash: string;
}

export interface Credentials {

    email: string;
    password: string;
}

export interface LoginRequest {

    email: string;
    password: string;
}

export interface Profile {

    email: string;
    preferences: string[];
}
`;

// signup.ts after R4 -- SignupRequest -> Credentials.
REFACTOR['src/signup/signup.ts@R4'] = `import { Credentials } from '../types';
import { findUser, saveUser } from '../store';
import { dispatchWelcome } from './welcome-dispatch';


const hash = (password: string): string => {

    return \`hashed:\${password}\`;
};

export interface SignupResult {

    body: unknown;
    status: number;
}

export const handleSignup = (req: Credentials): SignupResult => {

    if (!req.email || !req.password) {
        return { status: 400, body: { error: 'email and password are required' } };
    }

    const existing = findUser(req.email);
    const isNew = !existing;

    if (isNew) {
        saveUser({ email: req.email, passwordHash: hash(req.password) });
    }

    dispatchWelcome(req.email, isNew);

    return { status: 201, body: { email: req.email } };
};
`;

// ---- refactor: R5 store.ts requires a clock at runtime (optional in the type) ----
REFACTOR['src/store.ts'] = `import { User } from './types';

//
// In-memory user store, plus a log of welcome-email sends so tests can observe how many
// were dispatched for a given address. Fine for an example; a real app would use a database.
//

const usersByEmail = new Map<string, User>();
const welcomeEmailLog: string[] = [];


//
// Options passed when (re)building the store. \`seed\` preloads users; \`clock\` is required at
// runtime (a build with no clock throws), though it is optional in the type so existing
// callers still compile.
//
export interface StoreRefs {

    seed?: User[];
    clock?: () => number;
}


export const buildStore = (refs: StoreRefs = {}): void => {

    if (!refs.clock) {
        throw new Error('buildStore requires a clock');
    }

    usersByEmail.clear();

    for (const user of refs.seed ?? []) {
        usersByEmail.set(user.email, user);
    }
};

export const findUser = (email: string): User | undefined => {

    return usersByEmail.get(email);
};

export const saveUser = (user: User): void => {

    usersByEmail.set(user.email, user);
};

export const recordWelcomeEmail = (email: string): void => {

    welcomeEmailLog.push(email);
};

export const welcomeEmailsSentTo = (email: string): number => {

    return welcomeEmailLog.filter((entry) => entry === email).length;
};
`;

// ---- refactor-merged: resolutions (the answer key) ----

// welcome-dispatch, resolved: main's fix hand-ported here -- send only for a new user.
MERGED['src/signup/welcome-dispatch.ts'] = `import { sendWelcomeEmail } from '../email/welcome';

//
// Dispatches the welcome email for a signup. Sends only when the signup created a NEW user
// -- the mainline's duplicate-welcome fix, re-expressed here after the split moved the send
// out of \`handleSignup\`.
//
export const dispatchWelcome = (email: string, isNew: boolean): void => {

    if (isNew) {
        sendWelcomeEmail(email);
    }
};
`;

// profile, resolved: flat shape (refactor) plus main's defensive copy.
MERGED['src/profile.ts'] = `import { Profile } from './types';

const profiles = new Map<string, Profile>();


export const saveProfile = (profile: Profile): void => {

    profiles.set(profile.email, profile);
};

//
// Reads a user's preferences out of the flat preferences array, returning a defensive copy
// so callers cannot mutate stored state.
//
export const getPreferences = (email: string): string[] => {

    const profile = profiles.get(email);

    return profile ? [...profile.preferences] : [];
};
`;

// admin/reset, resolved: retired type renamed (rung 3).
MERGED['src/admin/reset.ts'] = `import { Credentials } from '../types';

//
// Admin helper: echoes the email from a signup request so an operator can confirm which
// account a reset targets.
//
export const resetSignup = (req: Credentials): string => {

    return req.email;
};
`;

// store.test, resolved: pass the clock the merged builder now requires (rung 4a).
MERGED['src/store.test.ts'] = `import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildStore, findUser } from './store';


test('buildStore seeds users', () => {

    buildStore({ seed: [{ email: 'seed@example.com', passwordHash: 'hashed:pw' }], clock: () => 0 });

    assert.equal(findUser('seed@example.com')?.email, 'seed@example.com');
});
`;

// server, resolved: main's /health plus refactor's moved-module import (auto-mergeable;
// written explicitly for determinism).
MERGED['src/server.ts'] = `import { createServer, IncomingMessage, ServerResponse } from 'http';

import { handleLogin } from './modules/auth/login';
import { handleSignup } from './signup/signup';


const PORT = Number(process.env.PORT ?? 3000);

const readJsonBody = (req: IncomingMessage): Promise<Record<string, unknown>> => {

    return new Promise((resolve, reject) => {

        let raw = '';

        req.on('data', (chunk) => { raw += String(chunk); });

        req.on('end', () => {

            if (!raw) {
                resolve({});
                return;
            }

            try {
                resolve(JSON.parse(raw) as Record<string, unknown>);
            } catch {
                reject(new Error('invalid JSON body'));
            }
        });

        req.on('error', reject);
    });
};

const send = (res: ServerResponse, status: number, body: unknown): void => {

    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
};

const handle = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {

    try {

        if (req.method === 'GET' && req.url === '/health') {
            send(res, 200, { ok: true });
            return;
        }

        if (req.method === 'POST' && req.url === '/login') {

            const body = await readJsonBody(req);
            const result = handleLogin({ email: String(body.email ?? ''), password: String(body.password ?? '') });

            send(res, result.status, result.body);

            return;
        }

        if (req.method === 'POST' && req.url === '/signup') {

            const body = await readJsonBody(req);
            const result = handleSignup({ email: String(body.email ?? ''), password: String(body.password ?? '') });

            send(res, result.status, result.body);

            return;
        }

        send(res, 404, { error: 'not found' });

    } catch (err) {
        send(res, 400, { error: (err as Error).message });
    }
};

const server = createServer((req: IncomingMessage, res: ServerResponse) => {

    void handle(req, res);
});

server.listen(PORT, () => {

    console.log(\`app on http://localhost:\${PORT}\`);
});
`;

// modules/auth/login, resolved: refactor's moved imports plus main's empty-credentials guard.
MERGED['src/modules/auth/login.ts'] = `import { findUser } from '../../store';
import { LoginRequest } from '../../types';


const hash = (password: string): string => {

    return \`hashed:\${password}\`;
};

export interface LoginResult {

    body: unknown;
    status: number;
}

export const handleLogin = (req: LoginRequest): LoginResult => {

    if (!req.email || !req.password) {
        return { status: 401, body: { error: 'invalid credentials' } };
    }

    const user = findUser(req.email);

    if (!user || user.passwordHash !== hash(req.password)) {
        return { status: 401, body: { error: 'invalid credentials' } };
    }

    return { status: 200, body: { email: user.email } };
};
`;

// --------------------------------------------------------------------------------------
// Base source tree (embedded, so the builder is fully self-contained -- it does not depend
// on whatever happens to be in the working tree).
// --------------------------------------------------------------------------------------

const BASE = {};

BASE['src/types.ts'] = `export interface User {

    email: string;
    passwordHash: string;
}

export interface SignupRequest {

    email: string;
    password: string;
}

export interface LoginRequest {

    email: string;
    password: string;
}

//
// A stored user profile. \`preferences\` is held as a wrapped \`{ value: { data } }\`
// envelope -- the shape the rest of the app reads through \`getPreferences\`.
//
export interface Profile {

    email: string;
    preferences: { value: { data: string[] } };
}
`;

BASE['src/store.ts'] = `import { User } from './types';

//
// In-memory user store, plus a log of welcome-email sends so tests can observe how many
// were dispatched for a given address. Fine for an example; a real app would use a database.
//

const usersByEmail = new Map<string, User>();
const welcomeEmailLog: string[] = [];


//
// Options passed when (re)building the store. \`seed\` preloads users so a test or a boot
// path can start from a known set.
//
export interface StoreRefs {

    seed?: User[];
}


export const buildStore = (refs: StoreRefs = {}): void => {

    usersByEmail.clear();

    for (const user of refs.seed ?? []) {
        usersByEmail.set(user.email, user);
    }
};

export const findUser = (email: string): User | undefined => {

    return usersByEmail.get(email);
};

export const saveUser = (user: User): void => {

    usersByEmail.set(user.email, user);
};

export const recordWelcomeEmail = (email: string): void => {

    welcomeEmailLog.push(email);
};

export const welcomeEmailsSentTo = (email: string): number => {

    return welcomeEmailLog.filter((entry) => entry === email).length;
};
`;

BASE['src/profile.ts'] = `import { Profile } from './types';

const profiles = new Map<string, Profile>();


export const saveProfile = (profile: Profile): void => {

    profiles.set(profile.email, profile);
};

//
// Reads a user's preferences out of the wrapped envelope. Callers depend on this accessor
// rather than reaching into \`preferences.value.data\` themselves.
//
export const getPreferences = (email: string): string[] => {

    const profile = profiles.get(email);

    return profile ? profile.preferences.value.data : [];
};
`;

BASE['src/auth/login.ts'] = `import { findUser } from '../store';
import { LoginRequest } from '../types';


const hash = (password: string): string => {

    return \`hashed:\${password}\`;
};

export interface LoginResult {

    body: unknown;
    status: number;
}

export const handleLogin = (req: LoginRequest): LoginResult => {

    const user = findUser(req.email);

    if (!user || user.passwordHash !== hash(req.password)) {
        return { status: 401, body: { error: 'invalid credentials' } };
    }

    return { status: 200, body: { email: user.email } };
};
`;

BASE['src/signup/signup.ts'] = `import { SignupRequest } from '../types';
import { findUser, saveUser } from '../store';
import { sendWelcomeEmail } from '../email/welcome';


const hash = (password: string): string => {

    return \`hashed:\${password}\`;
};

export interface SignupResult {

    body: unknown;
    status: number;
}

export const handleSignup = (req: SignupRequest): SignupResult => {

    if (!req.email || !req.password) {
        return { status: 400, body: { error: 'email and password are required' } };
    }

    const existing = findUser(req.email);

    if (!existing) {
        saveUser({ email: req.email, passwordHash: hash(req.password) });
    }

    sendWelcomeEmail(req.email);

    return { status: 201, body: { email: req.email } };
};
`;

BASE['src/email/welcome.ts'] = `import { recordWelcomeEmail } from '../store';

//
// Stub welcome-email send. In a real app this would call an email provider; here it
// records the send so the example can observe how many went out.
//
export const sendWelcomeEmail = (email: string): void => {

    recordWelcomeEmail(email);

    console.log(\`[email] welcome sent to \${email}\`);
};
`;

BASE['src/server.ts'] = `import { createServer, IncomingMessage, ServerResponse } from 'http';

import { handleLogin } from './auth/login';
import { handleSignup } from './signup/signup';


const PORT = Number(process.env.PORT ?? 3000);

const readJsonBody = (req: IncomingMessage): Promise<Record<string, unknown>> => {

    return new Promise((resolve, reject) => {

        let raw = '';

        req.on('data', (chunk) => { raw += String(chunk); });

        req.on('end', () => {

            if (!raw) {
                resolve({});
                return;
            }

            try {
                resolve(JSON.parse(raw) as Record<string, unknown>);
            } catch {
                reject(new Error('invalid JSON body'));
            }
        });

        req.on('error', reject);
    });
};

const send = (res: ServerResponse, status: number, body: unknown): void => {

    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
};

const handle = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {

    try {

        if (req.method === 'POST' && req.url === '/login') {

            const body = await readJsonBody(req);
            const result = handleLogin({ email: String(body.email ?? ''), password: String(body.password ?? '') });

            send(res, result.status, result.body);

            return;
        }

        if (req.method === 'POST' && req.url === '/signup') {

            const body = await readJsonBody(req);
            const result = handleSignup({ email: String(body.email ?? ''), password: String(body.password ?? '') });

            send(res, result.status, result.body);

            return;
        }

        send(res, 404, { error: 'not found' });

    } catch (err) {
        send(res, 400, { error: (err as Error).message });
    }
};

const server = createServer((req: IncomingMessage, res: ServerResponse) => {

    void handle(req, res);
});

server.listen(PORT, () => {

    console.log(\`app on http://localhost:\${PORT}\`);
});
`;

// Paths that must NOT exist in the base tree (main-only or refactor-only additions a prior
// build may have left behind). Cleared before the base commit.
const NON_BASE_FILES = [
    'src/signup/welcome-dispatch.ts',
    'src/store.test.ts',
    'src/signup/signup.test.ts',
];
const NON_BASE_DIRS = ['src/modules', 'src/admin', 'docs/future/engine-refactor'];

// ---- refactor R0: the engine-refactor workstream plan + its reconciliation tracker ----

REFACTOR['docs/future/engine-refactor/engine-refactor-plan.md'] = [
    '# Engine Refactor -- Plan',
    '',
    'Long-lived refactor branch (`refactor`) that reshapes the example service. It is kept',
    'current against the moving mainline (`main`) by a recurring reconciliation -- see the',
    'tracker in [`branch-reconciliation/branch-reconciliation-plan.md`](./branch-reconciliation/branch-reconciliation-plan.md).',
    '',
    '## Motivation',
    '',
    'The service grew a few shapes worth tidying: auth handling sat at the top level, the signup',
    'handler did too much, a preferences field carried a needless wrapper, two request types had',
    'drifted into duplicates, and the store could be built without a reference it needs. This',
    'branch reshapes all of that in one sustained effort -- which is exactly why it cannot land in',
    'small pieces, so it runs as a long-lived branch and reconciles against `main` on a cadence.',
    '',
    '## Changes',
    '',
    '| Change | Status |',
    '| --- | --- |',
    '| Move `auth/login` into `modules/auth/` | In progress 2026-07-16 |',
    '| Split the welcome-email dispatch out of `signup` into its own module | In progress 2026-07-16 |',
    '| Flatten the `Profile.preferences` wrapper to a plain array | In progress 2026-07-16 |',
    '| Retire `SignupRequest` in favour of `Credentials` | In progress 2026-07-16 |',
    '| Require a reference (a clock) when building the store | In progress 2026-07-16 |',
    '',
    '## Keeping current',
    '',
    '`main` keeps shipping while this branch is in flight. Rather than let the branch rot, we merge',
    '`main` in on a cadence and reconcile the collisions. The recurring how-to is',
    '[`docs/playbooks/branch-reconciliation-prompt.md`](../../playbooks/branch-reconciliation-prompt.md);',
    'the running map and per-run history live in the reconciliation tracker beside this plan.',
    '',
].join('\n');

REFACTOR['docs/future/engine-refactor/branch-reconciliation/branch-reconciliation-plan.md'] = [
    '# Branch Reconciliation -- keeping `refactor` current with `main`',
    '',
    'The pre-merge map for reconciling this refactor branch against the mainline. Regenerated',
    'each run by the sweep; every run is recorded in the delta log below. The recurring how-to',
    'is [`docs/playbooks/branch-reconciliation-prompt.md`](../../../playbooks/branch-reconciliation-prompt.md).',
    '',
    '## What this is (plain language)',
    '',
    '`main` is the mainline and never stops changing. This branch has moved, split, and reshaped',
    'code. We keep it current by MERGING `main` in on a cadence -- we do not copy files; the merge',
    'does that. The merge handles almost everything on its own. The only trouble is where `main`',
    'changed a file this branch has since moved, split, or reshaped. This map flags exactly those',
    'spots before the merge runs.',
    '',
    '## Inputs',
    '',
    '- OLD ref: `origin/main`',
    '- NEW ref: `refactor` (HEAD)',
    '- Scope: whole repo',
    '- Integration: `git merge -X find-renames=30% origin/main`',
    '- Baseline: the merge-base, recomputed each run',
    '',
    '## Standing decisions',
    '',
    '- We MERGE `main` in; we do not copy files.',
    '- Three things the merge cannot do for itself, which this map flags: confirm a change landed',
    '  at a moved path; hand-port a change into a file the branch split logic into; re-express a',
    '  change against a reshaped data shape.',
    '- Resolve by intent, never by greening the bar. When a test fails after the merge, decide',
    '  whether the test or the code holds the correct intent before changing either.',
    '- Update THIS file each run: refresh the map, then append a delta-log entry.',
    '',
    '## Map (latest run)',
    '',
    'Awaiting the first recorded run. Run `npm run reconcile`, then record the buckets, the',
    'predicted conflicts, and the resolutions here.',
    '',
    '## Delta log',
    '',
    'One entry per reconcile. None recorded yet.',
    '',
].join('\n');

// --------------------------------------------------------------------------------------

function main() {

    if (hasCommits()) {
        console.error('This repo already has commits. Run build-example.js on a fresh repo');
        console.error('(the base files present, nothing committed). Reset first if re-building.');
        process.exit(1);
    }

    // Establish the base tree from embedded content, and clear any divergent files a prior
    // build left behind, so the base commit is correct regardless of working-tree state.
    // Config and docs (other than the refactor workstream) are branch-invariant, from disk.
    for (const [rel, content] of Object.entries(BASE)) {
        writeFile(rel, content);
    }
    for (const rel of NON_BASE_FILES) {
        removeFile(rel);
    }
    for (const dir of NON_BASE_DIRS) {
        fs.rmSync(path.join(REPO, dir), { recursive: true, force: true });
    }

    // Base commit, then force the branch name to `main` -- robust whether `git init`
    // defaulted to `main` or `master`.
    commit('base: example app + docs system (fork point)');
    git(['branch', '-M', 'main']);

    // The refactor branch forks here, before any main commits.
    git(['branch', 'refactor']);

    // ----- main branch: M1..M8 -----
    writeFile('src/email/welcome.ts', MAIN['src/email/welcome.ts']);
    commit('main: reword the welcome-email log line');

    writeFile('src/server.ts', MAIN['src/server.ts']);
    commit('main: add GET /health route');

    writeFile('src/signup/signup.ts', MAIN['src/signup/signup.ts']);
    commit('main: fix duplicate welcome email on repeat signup');

    writeFile('src/auth/login.ts', MAIN['src/auth/login.ts']);
    commit('main: reject empty credentials in handleLogin');

    writeFile('src/profile.ts', MAIN['src/profile.ts']);
    commit('main: return a defensive copy from getPreferences');

    writeFile('src/admin/reset.ts', MAIN['src/admin/reset.ts']);
    commit('main: add admin reset helper');

    writeFile('src/store.test.ts', MAIN['src/store.test.ts']);
    commit('main: add store test');

    writeFile('src/signup/signup.test.ts', MAIN['src/signup/signup.test.ts']);
    commit('main: add signup regression test (no second welcome on repeat)');

    // ----- refactor branch: R0..R5 -----
    git(['checkout', 'refactor']);

    // R0: open the refactor workstream and its reconciliation tracker under docs/future.
    writeFile('docs/future/engine-refactor/engine-refactor-plan.md',
        REFACTOR['docs/future/engine-refactor/engine-refactor-plan.md']);
    writeFile('docs/future/engine-refactor/branch-reconciliation/branch-reconciliation-plan.md',
        REFACTOR['docs/future/engine-refactor/branch-reconciliation/branch-reconciliation-plan.md']);
    commit('refactor: open the engine-refactor workstream + reconciliation tracker');

    // Move by delete + write, not `git mv` (which needs the destination dir pre-created).
    // Git detects the rename by content similarity at merge time -- exactly what the
    // move-conflict scenario relies on.
    removeFile('src/auth/login.ts');
    writeFile('src/modules/auth/login.ts', REFACTOR['src/modules/auth/login.ts']);
    writeFile('src/server.ts', REFACTOR['src/server.ts']);
    commit('refactor: move auth/login into modules/auth');

    writeFile('src/signup/welcome-dispatch.ts', REFACTOR['src/signup/welcome-dispatch.ts']);
    writeFile('src/signup/signup.ts', REFACTOR['src/signup/signup.ts@R2']);
    commit('refactor: split welcome dispatch out of signup');

    writeFile('src/profile.ts', REFACTOR['src/profile.ts']);
    commit('refactor: flatten Profile.preferences to a string array');

    writeFile('src/types.ts', REFACTOR['src/types.ts@R4']);
    writeFile('src/signup/signup.ts', REFACTOR['src/signup/signup.ts@R4']);
    commit('refactor: retire SignupRequest in favor of Credentials');

    writeFile('src/store.ts', REFACTOR['src/store.ts']);
    commit('refactor: require a clock when building the store');

    // ----- refactor-merged branch: the answer key -----
    git(['checkout', '-b', 'refactor-merged']);

    // Attempt the merge the reader would run. It leaves conflicts (signup.ts, profile.ts);
    // that is expected. We then write the resolved tree deterministically and commit.
    tryGit(['merge', '--no-commit', '--no-ff', '-X', 'find-renames=30%', 'main']);

    // Make sure the moved-away path is gone (in case rename detection left it around).
    removeFile('src/auth/login.ts');

    writeFile('src/signup/welcome-dispatch.ts', MERGED['src/signup/welcome-dispatch.ts']);
    writeFile('src/signup/signup.ts', REFACTOR['src/signup/signup.ts@R4']);
    writeFile('src/profile.ts', MERGED['src/profile.ts']);
    writeFile('src/admin/reset.ts', MERGED['src/admin/reset.ts']);
    writeFile('src/store.test.ts', MERGED['src/store.test.ts']);
    writeFile('src/server.ts', MERGED['src/server.ts']);
    writeFile('src/modules/auth/login.ts', MERGED['src/modules/auth/login.ts']);
    writeFile('src/types.ts', REFACTOR['src/types.ts@R4']);
    writeFile('src/store.ts', REFACTOR['src/store.ts']);

    git(['add', '-A']);
    git(['commit', '--no-verify', '-m', 'merge main into refactor; resolve conflicts and the two semantic breaks']);

    // Leave the repo on refactor -- the branch a reader reconciles from.
    git(['checkout', 'refactor']);

    console.log('');
    console.log('Built branches: main, refactor (checked out), refactor-merged.');
    console.log('Next: npm install, then on refactor try `npm run reconcile`, then');
    console.log('`git merge -X find-renames=30% main` and resolve against refactor-merged.');
}

main();
