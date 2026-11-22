import type { VercelRequest, VercelResponse } from '@vercel/node';

const failedAttempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = failedAttempts.get(ip);
    if (!entry || now > entry.resetAt) {
        failedAttempts.set(ip, { count: 0, resetAt: now + 15 * 60 * 1000 });
        return false;
    }
    return entry.count >= 8;
}

function recordFailure(ip: string) {
    const entry = failedAttempts.get(ip);
    if (entry) entry.count += 1;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const forwarded = req.headers['x-forwarded-for'];
    const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0] || req.socket?.remoteAddress || 'unknown').trim();

    if (isRateLimited(ip)) {
        return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
    }

    const { inviteCode } = req.body || {};
    const SECRET_CODE = process.env.MASTER_INVITE_CODE;

    if (!SECRET_CODE) {
        return res.status(500).json({ error: 'Server configuration error' });
    }

    if (typeof inviteCode !== 'string' || !inviteCode.trim()) {
        recordFailure(ip);
        return res.status(401).json({ valid: false });
    }

    if (inviteCode.trim().toUpperCase() === SECRET_CODE.trim().toUpperCase()) {
        failedAttempts.delete(ip);
        return res.status(200).json({ valid: true });
    } else {
        recordFailure(ip);
        return res.status(401).json({ valid: false });
    }
}