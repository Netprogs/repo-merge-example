import { createServer, IncomingMessage, ServerResponse } from 'http';

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

    console.log(`app on http://localhost:${PORT}`);
});
