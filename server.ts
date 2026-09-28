import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));

// Shared Gemini Client (telemetry User-Agent 'aistudio-build')
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey) {
  aiClient = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API Routes
app.get('/api/providers/status', (_req, res) => {
  res.json({
    googleAiStudio: {
      hasKey: !!process.env.GEMINI_API_KEY,
      model: 'gemini-3.8-flash',
      status: process.env.GEMINI_API_KEY ? 'CONNECTED' : 'NOT_CONFIGURED',
    },
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/gemini/generate', async (req, res) => {
  try {
    if (!aiClient) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server. Connect via Secrets or use simulation mode.',
        notConnected: true,
      });
    }

    const { prompt, systemInstruction } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: systemInstruction ? { systemInstruction } : undefined,
    });

    res.json({
      text: response.text || '',
      model: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({
      error: error?.message || 'Error generating content from Gemini',
    });
  }
});

// Vite middlewares for dev or static for prod
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Chat server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
