import express, { Request, Response } from 'express';
import cors from 'cors';
import { register } from 'tsconfig-paths';
import path from 'path';

// 1. Register Path Aliases (@core/*) from tsconfig
import tsConfig from './tsconfig.json' assert { type: "json" };

const baseUrl = path.resolve(process.cwd(), tsConfig.compilerOptions.baseUrl || '.');
const cleanup = register({
  baseUrl,
  paths: tsConfig.compilerOptions.paths,
});

// 2. Import API Handlers
import questionHandler from './api/question';
import answerHandler from './api/answer';
import curriculumHandler from './api/curriculum';
import batchHandler from './api/batch'; 
import verifyInviteHandler from './api/verify-invite'; // <--- ADDED: Import the invite verifier

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 3. Vercel -> Express Adapter
const adapter = (handler: any) => async (req: Request, res: Response) => {
    try {
        await handler(req, res);
    } catch (err) {
        console.error("API Error:", err);
        res.status(500).json({ error: 'Internal Server Error', details: String(err) });
    }
};

// 4. Define Routes
app.get('/api/question', adapter(questionHandler));
app.post('/api/answer', adapter(answerHandler));
app.get('/api/curriculum', adapter(curriculumHandler));
app.post('/api/batch', adapter(batchHandler)); 
app.post('/api/verify-invite', adapter(verifyInviteHandler)); // <--- ADDED: Register the POST route

// 5. Start Server
app.listen(PORT, () => {
    console.log(`\n🚀 Backend Simulation running at http://localhost:${PORT}`);
    console.log(`   - /api/question`);
    console.log(`   - /api/answer`);
    console.log(`   - /api/curriculum`);
    console.log(`   - /api/batch`);
    console.log(`   - /api/verify-invite`); // <--- ADDED: Log the new route
    console.log(`\n🎨 Frontend running at http://localhost:5173 (Proxy active)\n`);
});