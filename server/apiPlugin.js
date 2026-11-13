import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const QUESTION_BANK_PATH = path.resolve(__dirname, '../src/data/questionBank.json');
const SUBMISSIONS_PATH = path.resolve(__dirname, './storage/submissions.json');
const SESSIONS_PATH = path.resolve(__dirname, './storage/sessions.json');
const RECORDINGS_DIR = path.resolve(__dirname, './storage/recordings');
const PUBLIC_AUDIO_DIR = path.resolve(__dirname, '../public/media/audio');
const PUBLIC_IMAGES_DIR = path.resolve(__dirname, '../public/media/images');

function ensureStorage() {
  const storageDir = path.resolve(__dirname, './storage');
  if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });
  if (!fs.existsSync(RECORDINGS_DIR)) fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
  if (!fs.existsSync(PUBLIC_AUDIO_DIR)) fs.mkdirSync(PUBLIC_AUDIO_DIR, { recursive: true });
  if (!fs.existsSync(PUBLIC_IMAGES_DIR)) fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });
  if (!fs.existsSync(SUBMISSIONS_PATH)) fs.writeFileSync(SUBMISSIONS_PATH, JSON.stringify([], null, 2));
  if (!fs.existsSync(SESSIONS_PATH)) {
    fs.writeFileSync(
      SESSIONS_PATH,
      JSON.stringify(
        [
          {
            id: 'SESSION-DEFAULT',
            sessionCode: 'PTE-2026-A',
            title: 'Full PTE Academic Mock Test (Classroom Batch A)',
            mode: 'full',
            packageId: 'PKG-FULL-A',
            status: 'active',
            createdAt: new Date().toISOString(),
            students: []
          }
        ],
        null,
        2
      )
    );
  }
}

function readJsonSafe(filePath, fallback = []) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return fallback;
  }
}

function writeJsonSafe(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

export function pteApiPlugin() {
  ensureStorage();

  return {
    name: 'pte-local-backend-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next();

        try {
          // GET /api/recordings/:fileName (serve saved student audio recordings)
          if (req.method === 'GET' && req.url.startsWith('/api/recordings/')) {
            const rawName = decodeURIComponent(req.url.replace('/api/recordings/', '')).replace(/[^a-zA-Z0-9._-]/g, '_');
            const filePath = path.join(RECORDINGS_DIR, rawName);
            if (fs.existsSync(filePath)) {
              const stat = fs.statSync(filePath);
              res.setHeader('Content-Type', rawName.endsWith('.wav') ? 'audio/wav' : 'audio/webm');
              res.setHeader('Content-Length', stat.size);
              res.setHeader('Content-Disposition', `inline; filename="${rawName}"`);
              fs.createReadStream(filePath).pipe(res);
              return;
            }
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Recording not found' }));
            return;
          }

          res.setHeader('Content-Type', 'application/json');

          // POST /api/upload-recording (save CandidateID_ItemID.webm to /server/storage/recordings/)
          if (req.method === 'POST' && req.url === '/api/upload-recording') {
            const body = await parseBody(req);
            const { fileName, dataUrl } = body;
            if (!fileName || !dataUrl) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing fileName or dataUrl' }));
              return;
            }
            const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
            const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
            const buffer = Buffer.from(base64Data, 'base64');
            const fullPath = path.join(RECORDINGS_DIR, safeName);
            fs.writeFileSync(fullPath, buffer);
            res.end(
              JSON.stringify({
                ok: true,
                fileName: safeName,
                url: `/api/recordings/${safeName}`
              })
            );
            return;
          }

          // GET /api/questions
          if (req.method === 'GET' && req.url === '/api/questions') {
            const data = readJsonSafe(QUESTION_BANK_PATH, { items: [], testPackages: [] });
            res.end(JSON.stringify(data));
            return;
          }

          // PUT /api/questions (save updated questionBank.json directly to disk!)
          if (req.method === 'PUT' && req.url === '/api/questions') {
            const body = await parseBody(req);
            if (body && Array.isArray(body.items)) {
              writeJsonSafe(QUESTION_BANK_PATH, body);
              res.end(JSON.stringify({ ok: true, count: body.items.length }));
              return;
            }
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid question bank payload' }));
            return;
          }

          // GET /api/media (list existing files in /public/media/audio and /public/media/images)
          if (req.method === 'GET' && req.url === '/api/media') {
            const audioFiles = fs
              .readdirSync(PUBLIC_AUDIO_DIR)
              .filter((f) => /\.(mp3|wav|ogg|m4a|webm)$/i.test(f))
              .map((f) => `/media/audio/${f}`);
            const imageFiles = fs
              .readdirSync(PUBLIC_IMAGES_DIR)
              .filter((f) => /\.(png|jpe?g|svg|webp|gif)$/i.test(f))
              .map((f) => `/media/images/${f}`);
            res.end(JSON.stringify({ audioFiles, imageFiles }));
            return;
          }

          // POST /api/upload-media (save dropped audio or image file to /public/media/...)
          if (req.method === 'POST' && req.url === '/api/upload-media') {
            const body = await parseBody(req);
            const { fileName, mediaType, dataUrl } = body;
            if (!fileName || !dataUrl) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing fileName or dataUrl' }));
              return;
            }
            const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
            const targetDir = mediaType === 'audio' ? PUBLIC_AUDIO_DIR : PUBLIC_IMAGES_DIR;
            const subPath = mediaType === 'audio' ? 'audio' : 'images';
            const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
            const buffer = Buffer.from(base64Data, 'base64');
            const fullPath = path.join(targetDir, safeName);
            fs.writeFileSync(fullPath, buffer);
            res.end(
              JSON.stringify({
                ok: true,
                url: `/media/${subPath}/${safeName}`,
                fileName: safeName
              })
            );
            return;
          }

          // GET /api/sessions
          if (req.method === 'GET' && req.url === '/api/sessions') {
            const sessions = readJsonSafe(SESSIONS_PATH, []);
            res.end(JSON.stringify({ sessions }));
            return;
          }

          // POST /api/sessions (create or update session)
          if (req.method === 'POST' && req.url === '/api/sessions') {
            const body = await parseBody(req);
            const sessions = readJsonSafe(SESSIONS_PATH, []);
            const idx = sessions.findIndex((s) => s.id === body.id);
            if (idx >= 0) {
              sessions[idx] = { ...sessions[idx], ...body };
            } else {
              sessions.unshift({
                id: body.id || `SES-${Date.now()}`,
                sessionCode: body.sessionCode || `PTE-${Math.floor(1000 + Math.random() * 9000)}`,
                title: body.title || 'Classroom Session',
                mode: body.mode || 'full',
                packageId: body.packageId || null,
                status: body.status || 'active',
                createdAt: new Date().toISOString(),
                students: body.students || []
              });
            }
            writeJsonSafe(SESSIONS_PATH, sessions);
            res.end(JSON.stringify({ ok: true, sessions }));
            return;
          }

          // DELETE /api/sessions
          if (req.method === 'DELETE' && req.url.startsWith('/api/sessions/')) {
            const id = decodeURIComponent(req.url.replace('/api/sessions/', ''));
            const sessions = readJsonSafe(SESSIONS_PATH, []).filter((s) => s.id !== id);
            writeJsonSafe(SESSIONS_PATH, sessions);
            res.end(JSON.stringify({ ok: true, sessions }));
            return;
          }

          // GET /api/submissions
          if (req.method === 'GET' && req.url === '/api/submissions') {
            const submissions = readJsonSafe(SUBMISSIONS_PATH, []);
            res.end(JSON.stringify({ submissions }));
            return;
          }

          // POST /api/submissions (save or update a student exam submission)
          if (req.method === 'POST' && req.url === '/api/submissions') {
            const body = await parseBody(req);
            const submissions = readJsonSafe(SUBMISSIONS_PATH, []);
            const existingIdx = submissions.findIndex((s) => s.id === body.id);
            if (existingIdx >= 0) {
              submissions[existingIdx] = {
                ...submissions[existingIdx],
                ...body,
                updatedAt: new Date().toISOString()
              };
            } else {
              submissions.unshift({
                ...body,
                id: body.id || `SUB-${Date.now()}`,
                createdAt: body.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
            }
            writeJsonSafe(SUBMISSIONS_PATH, submissions);
            res.end(JSON.stringify({ ok: true, submissions }));
            return;
          }

          // DELETE /api/submissions/:id
          if (req.method === 'DELETE' && req.url.startsWith('/api/submissions/')) {
            const id = decodeURIComponent(req.url.replace('/api/submissions/', ''));
            const submissions = readJsonSafe(SUBMISSIONS_PATH, []).filter((s) => s.id !== id);
            writeJsonSafe(SUBMISSIONS_PATH, submissions);
            res.end(JSON.stringify({ ok: true, submissions }));
            return;
          }

          next();
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message || 'Server error' }));
        }
      });
    }
  };
}
