import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

export default function handler(req: VercelRequest, res: VercelResponse) {
    try {
        // Look for the generators folder relative to this executing function
        const generatorsPath = path.join(process.cwd(), 'src/core/generators');
        
        let files: string[] = [];
        if (fs.existsSync(generatorsPath)) {
            files = fs.readdirSync(generatorsPath);
        } else {
            files = ["Generators folder not found at: " + generatorsPath];
        }

        res.status(200).json({
            status: "Debug Online",
            cwd: process.cwd(),
            foundFiles: files
        });
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
}