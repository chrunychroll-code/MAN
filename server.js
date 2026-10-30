import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Health endpoint for Cloud Run container liveness probes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'civicpulse-ai',
    version: '1.0.0',
    mode: process.env.NODE_ENV || 'production',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    supabaseConfigured: Boolean(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL),
    timestamp: new Date().toISOString()
  });
});

// Optional Gemini LLM Enrichment Endpoint with Strict Fallback
app.post('/api/ai/triage', async (req, res) => {
  const { title, description, category, ward, landmark, coordinates } = req.body || {};
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.json({
      fallback: true,
      reason: 'GEMINI_API_KEY not configured. Deterministic local AI engine active.',
      enrichment: null
    });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const prompt = `You are CivicPulse AI, a municipal triage intelligence system.
Analyze this civic issue report:
Title: "${title || ''}"
Description: "${description || ''}"
Category: "${category || ''}"
Ward: "${ward || ''}"
Landmark: "${landmark || ''}"
Location: (${coordinates?.x || 0}, ${coordinates?.y || 0})

Return a strictly valid JSON object without markdown fences, matching this structure:
{
  "executiveSummary": "1-sentence municipal operational summary focusing on the threat vector",
  "rootCauseHypothesis": "Concise hypothesis of underlying infrastructure failure",
  "recommendedDepartment": "Exact municipal department responsible",
  "recommendedAction": "Immediate action required by first responder",
  "safetyAdvisory": "Plain language warning for citizens nearby",
  "confidenceScore": 0.94
}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 500,
          responseMimeType: "application/json"
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error('Empty response from Gemini API');
    }

    // Clean any potential markdown wrappers if returned
    const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const enrichment = JSON.parse(cleanedText);

    return res.json({
      fallback: false,
      model: 'gemini-2.5-flash',
      enrichment
    });
  } catch (error) {
    console.warn('[CivicPulse API] Gemini enrichment skipped or timed out, returning fallback:', error.message);
    return res.json({
      fallback: true,
      reason: error.name === 'AbortError' ? 'Gemini API call timed out (>3.5s)' : error.message,
      enrichment: null
    });
  }
});

// Serve compiled static files from dist/
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// SPA fallback for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(` CivicPulse AI Platform Online`);
  console.log(` Port: ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(` Health Probe: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});
