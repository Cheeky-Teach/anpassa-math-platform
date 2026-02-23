import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { inviteCode } = req.body;
    
    // This pulls from your Vercel Environment Variables
    const SECRET_CODE = process.env.MASTER_INVITE_CODE;

    if (!SECRET_CODE) {
        return res.status(500).json({ error: 'Server configuration error' });
    }

    if (inviteCode?.trim().toUpperCase() === SECRET_CODE.toUpperCase()) {
        return res.status(200).json({ valid: true });
    } else {
        return res.status(401).json({ valid: false });
    }
}