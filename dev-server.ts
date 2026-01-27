import express, { Request, Response } from 'express';
import cors from 'cors';
import { register } from 'tsconfig-paths';
import path from 'path';

// 1. Register Path Aliases (@core/*) from tsconfig
// This ensures the backend logic can find files in src/core
import tsConfig from './tsconfig.json' assert { type: "json" };

const baseUrl = path.resolve(process.cwd(), tsConfig.compilerOptions.baseUrl || '.');
const cleanup = register({
  baseUrl,
  paths: tsConfig.compilerOptions.paths,
});

// 2. Import API Handlers
// We import these AFTER registering paths so they resolve correctly
import questionHandler from './api/question';
import answerHandler from './api/answer';
import curriculumHandler from './api/curriculum';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 3. Vercel -> Express Adapter
// Vercel functions are (req, res) => void, which matches Express,
// but we wrap them to ensure errors are caught.
const adapter = (handler: any) => async (req: Request, res: Response) => {
    try {
        await handler(req, res);
    } catch (err) {
        console.error("API Error:", err);
        res.status(500).json({ error: 'Internal Server Error', details: String(err) });
    }
};

// 4. Define Routes
// These must match the filenames in your /api folder
app.get('/api/question', adapter(questionHandler));
app.post('/api/answer', adapter(answerHandler));
app.get('/api/curriculum', adapter(curriculumHandler));

// 5. Start Server
app.listen(PORT, () => {
    console.log(`\n🚀 Backend Simulation running at http://localhost:${PORT}`);
    console.log(`   - /api/question`);
    console.log(`   - /api/answer`);
    console.log(`   - /api/curriculum`);
    console.log(`\n🎨 Frontend running at http://localhost:5173 (Proxy active)\n`);
});