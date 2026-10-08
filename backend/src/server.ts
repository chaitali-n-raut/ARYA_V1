import dotenv from 'dotenv';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { generateLocalGuidance } from './guidanceEngine';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(ROOT, '.env') });
const DB_FILE = path.join(ROOT, 'data', 'db.json');
const ML_DIR = path.resolve(ROOT, '..', 'ml');

type Db = {
  tenants: any[];
  users: any[];
  students: any[];
  drives: any[];
  applications: any[];
  notifications: any[];
  aiRuns: any[];
  importBatches: any[];
  sessions: any[];
};

type AuthUser = { id: string; tenantId: string; role: string; name: string; email: string; studentId?: string };

const app = express();
const origin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json({ limit: '5mb' }));

function emptyDb(): Db {
  return { tenants: [], users: [], students: [], drives: [], applications: [], notifications: [], aiRuns: [], importBatches: [], sessions: [] };
}
function readDb(): Db {
  if (!fs.existsSync(DB_FILE)) {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(emptyDb(), null, 2));
  }
  const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  const db = { ...emptyDb(), ...parsed } as Db;
  // One-time cleanup from older builds: this version has no ARYA Admin or invitation workflow.
  const removedAdminIds = new Set(db.users.filter(u => u.role === 'admin').map(u => u.id));
  const hadLegacyWorkflowData = 'institutionRequests' in (parsed as any) || 'invitations' in (parsed as any) || 'emailOutbox' in (parsed as any);
  if (removedAdminIds.size || hadLegacyWorkflowData) {
    db.users = db.users.filter(u => u.role !== 'admin');
    db.sessions = db.sessions.filter(s => !removedAdminIds.has(s.userId));
    delete (db as any).institutionRequests;
    delete (db as any).invitations;
    delete (db as any).emailOutbox;
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  }
  return db;
}
function writeDb(db: Db) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  const tmp = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
}
function id(prefix: string) { return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`; }
function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || id('college');
}
function generateCollegeCode(db: Db) {
  let code = '';
  do {
    code = `ARYA-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  } while (db.tenants.some(t => String(t.collegeCode || '').toUpperCase() === code));
  return code;
}
function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}
function verifyPassword(password: string, stored: string) {
  const [salt, hash] = String(stored || '').split(':');
  if (!salt || !hash) return false;
  const actual = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(hash, 'hex'));
}
function safeUser(user: any) {
  const { passwordHash, ...rest } = user;
  return { ...rest, isAuthenticated: true };
}
function setSession(res: express.Response, db: Db, user: any) {
  const token = crypto.randomBytes(32).toString('hex');
  db.sessions.push({ token, userId: user.id, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  writeDb(db);
  res.setHeader('Set-Cookie', `arya_session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`);
}
function clearSession(res: express.Response) {
  res.setHeader('Set-Cookie', 'arya_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0');
}
function cookie(req: express.Request, name: string) {
  const raw = req.headers.cookie || '';
  const item = raw.split(';').map(x => x.trim()).find(x => x.startsWith(`${name}=`));
  return item ? decodeURIComponent(item.slice(name.length + 1)) : undefined;
}
function auth(req: express.Request): AuthUser | null {
  const db = readDb();
  const token = cookie(req, 'arya_session') || String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const session = db.sessions.find(s => s.token === token && s.expiresAt > Date.now());
  if (!session) return null;
  const user = db.users.find(u => u.id === session.userId);
  if (!user) return null;
  return { id: user.id, tenantId: user.tenantId, role: user.role, name: user.name, email: user.email, studentId: user.studentId };
}
function requireAuth(req: express.Request, res: express.Response): AuthUser | null {
  const user = auth(req);
  if (!user) { res.status(401).json({ error: 'Authentication required' }); return null; }
  return user;
}
function tenantRows(rows: any[], user: AuthUser) { return rows.filter(x => x.tenantId === user.tenantId); }
function canManage(user: AuthUser) { return user.role === 'tnp'; }
function canFacultyOrManage(user: AuthUser) { return ['faculty', 'tnp'].includes(user.role); }
function canSeeStudent(user: AuthUser, student: any) {
  if (student.tenantId !== user.tenantId) return false;
  if (['tnp', 'faculty', 'recruiter'].includes(user.role)) return true;
  return user.role === 'student' && user.studentId?.toUpperCase() === String(student.Student_ID).toUpperCase();
}

app.get('/api/health', (_req, res) => {
  const db = readDb();
  res.json({ ok: true, service: 'ARYA AI TalentLink API', storage: 'local-json-database', model: fs.existsSync(path.join(ML_DIR, 'models', 'arya_placement_model.joblib')), geminiConfigured: Boolean(process.env.GEMINI_API_KEY), counts: { tenants: db.tenants.length, users: db.users.length, students: db.students.length, drives: db.drives.length } });
});

// ---------------- Tenants / institution onboarding ----------------
app.get('/api/tenants', (_req, res) => {
  const db = readDb();
  res.json(db.tenants.filter(t => t.status === 'active').map(t => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    logoUrl: t.logoUrl,
    settings: t.settings,
    status: t.status
  })));
});

// Institution registration is immediate. It creates the active college and its T&P account.
app.post('/api/institutions/register', (req, res) => {
  const body = req.body || {};
  const collegeName = String(body.collegeName || '').trim();
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const department = String(body.department || 'Training & Placement').trim();
  const designation = String(body.designation || 'Training & Placement Officer').trim();

  if (!collegeName || !name || !email || password.length < 4) {
    return res.status(400).json({ error: 'College name, T&P name, email and password (minimum 4 characters) are required.' });
  }

  const db = readDb();
  if (db.tenants.some(t => String(t.name).trim().toLowerCase() === collegeName.toLowerCase())) {
    return res.status(409).json({ error: 'This institution is already registered. Use its existing College Code.' });
  }
  if (db.users.some(u => String(u.email).toLowerCase() === email)) {
    return res.status(409).json({ error: 'This email is already registered. Please use another email address.' });
  }

  const slugBase = slugify(collegeName);
  let slug = slugBase;
  let n = 2;
  while (db.tenants.some(t => t.slug === slug)) slug = `${slugBase}-${n++}`;

  const tenant = {
    id: id('tenant'),
    name: collegeName,
    collegeCode: generateCollegeCode(db),
    slug,
    status: 'active',
    settings: {},
    createdAt: new Date().toISOString()
  };

  const user = {
    id: id('usr'),
    tenantId: tenant.id,
    name,
    email,
    role: 'tnp',
    passwordHash: hashPassword(password),
    department,
    designation,
    organization: collegeName,
    createdAt: new Date().toISOString()
  };

  db.tenants.push(tenant);
  db.users.push(user);
  writeDb(db);

  res.status(201).json({
    success: true,
    status: 'active',
    collegeCode: tenant.collegeCode,
    tenant,
    user: safeUser(user),
    message: 'Institution registered successfully. The T&P account can sign in immediately with email and password.'
  });
});

// ---------------- Authentication ----------------
app.get('/api/auth/me', (req, res) => {
  const user = auth(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  const db = readDb();
  const stored = db.users.find(u => u.id === user.id);
  const tenant = db.tenants.find(t => t.id === user.tenantId);
  res.json({ user: safeUser(stored), tenant });
});
app.post('/api/auth/register', (req, res) => {
  const body = req.body || {};
  const email = String(body.email || '').trim().toLowerCase();
  const role = String(body.role || 'student');
  const name = String(body.name || '').trim();
  const collegeName = String(body.collegeName || '').trim();
  const collegeCode = String(body.collegeCode || '').trim().toUpperCase();

  if (!['student', 'faculty'].includes(role)) {
    return res.status(403).json({ error: 'Only Student and Faculty accounts can self-register.' });
  }
  if (!email || !name || !body.password) return res.status(400).json({ error: 'Name, email and password are required.' });
  if (String(body.password).length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters.' });
  if (!collegeName || !collegeCode) return res.status(400).json({ error: 'College Name and College Code are required for Student and Faculty registration.' });

  const db = readDb();
  const tenant = db.tenants.find(t =>
    t.status === 'active' &&
    String(t.name).trim().toLowerCase() === collegeName.toLowerCase() &&
    String(t.collegeCode || '').trim().toUpperCase() === collegeCode
  );

  if (!tenant) return res.status(400).json({ error: 'College Name and College Code do not match a registered institution.' });
  if (db.users.some(u => String(u.email).toLowerCase() === email)) {
    return res.status(409).json({ error: 'An account with this email already exists. Please sign in instead.' });
  }

  const studentId = role === 'student'
    ? String(body.studentId || `STU-${Date.now().toString().slice(-6)}`).trim().toUpperCase()
    : undefined;

  if (role === 'student' && db.students.some(s => s.tenantId === tenant.id && String(s.Student_ID).toUpperCase() === studentId)) {
    return res.status(409).json({ error: 'Student ID already exists in this college.' });
  }

  const user = {
    id: id('usr'),
    tenantId: tenant.id,
    name,
    email,
    role,
    passwordHash: hashPassword(String(body.password)),
    studentId,
    department: String(body.department || 'Computer Science and Engineering').trim(),
    designation: body.designation || undefined,
    organization: tenant.name,
    createdAt: new Date().toISOString()
  };

  db.users.push(user);

  if (role === 'student') {
    db.students.push({
      tenantId: tenant.id,
      Student_ID: studentId,
      Full_Name: name,
      Email: email,
      Phone: '',
      College: tenant.name,
      Department: user.department,
      Branch: user.department,
      Year: 4,
      Section: 'A',
      Graduation_Year: 2026,
      CGPA: Number(body.initialCgpa || 0),
      Attendance_Percentage: Number(body.initialAttendance || 0),
      Backlogs: Number(body.initialBacklogs || 0),
      Semester_Grades: [],
      Technical_Skills: [],
      Certifications: [],
      Internships: [],
      Projects: [],
      Coding_Activity: {
        platform: 'LeetCode',
        problemsSolved: Number(body.initialLeetcode || 0),
        contestRating: 0,
        leetcodeSolved: Number(body.initialLeetcode || 0),
        codechefSolved: Number(body.initialCodechef || 0),
        leetcodeRating: 0,
        codechefRating: 0
      },
      Aptitude_Score: Number(body.initialAptitude || 0),
      Communication_Score: Number(body.initialCommunication || 0),
      Class_Teacher: '',
      Mentor: '',
      Location: '',
      Target_Role: body.initialTargetRole || '',
      Bio: '',
      Mentorship_Notes: [],
      isProfileCompleted: false,
      ResumeUploaded: false,
      UpdatedAt: new Date().toISOString()
    });
  }

  writeDb(db);
  setSession(res, db, user);
  res.status(201).json({ user: safeUser(user), tenant });
});

// Sign-in deliberately accepts ONLY email + password. The tenant is resolved from the account.
app.post('/api/auth/login', (req, res) => {
  const db = readDb();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  const candidates = db.users.filter(u => String(u.email).toLowerCase() === email && u.role !== 'admin');
  const user = candidates.find(u => verifyPassword(password, u.passwordHash));
  if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

  const tenant = db.tenants.find(t => t.id === user.tenantId && t.status === 'active');
  if (!tenant) return res.status(403).json({ error: 'This institution is not active.' });

  setSession(res, db, user);
  res.json({ user: safeUser(user), tenant });
});

app.post('/api/auth/logout', (req, res) => {
  const db = readDb(); const token = cookie(req, 'arya_session'); if (token) db.sessions = db.sessions.filter(s => s.token !== token); writeDb(db); clearSession(res); res.json({ success: true });
});

// ---------------- Users ----------------
app.get('/api/users', (req, res) => { const user=requireAuth(req,res); if(!user)return; if(!canFacultyOrManage(user))return res.status(403).json({error:'Insufficient role permissions'}); const db=readDb(); let rows=tenantRows(db.users,user).map(safeUser); if(req.query.role) rows=rows.filter(u=>u.role===req.query.role); res.json(rows); });

// ---------------- Students ----------------
app.get('/api/students', (req, res) => {
  const user = requireAuth(req, res); if (!user) return; const db = readDb(); let rows = tenantRows(db.students, user);
  if (user.role === 'student') rows = rows.filter(s => s.Student_ID.toUpperCase() === String(user.studentId || '').toUpperCase());
  if (req.query.mentorEmail) rows = rows.filter(s => String(s.Mentor_Email || '').toLowerCase() === String(req.query.mentorEmail).toLowerCase());
  res.json(rows);
});
app.get('/api/students/:id', (req, res) => {
  const user = requireAuth(req, res); if (!user) return; const db = readDb(); const s = db.students.find(x => x.tenantId === user.tenantId && String(x.Student_ID).toUpperCase() === req.params.id.toUpperCase());
  if (!s || !canSeeStudent(user, s)) return res.status(404).json({ error: 'Student not found' }); res.json(s);
});
app.post('/api/students', (req, res) => {
  const user = requireAuth(req, res); if (!user) return; if (!canFacultyOrManage(user)) return res.status(403).json({ error: 'Insufficient role permissions' });
  const db = readDb(); const s = req.body; if (!s?.Student_ID || !s?.Full_Name || !s?.Email) return res.status(400).json({ error: 'Student_ID, Full_Name and Email are required' });
  if (db.students.some(x => x.tenantId === user.tenantId && String(x.Student_ID).toUpperCase() === String(s.Student_ID).toUpperCase())) return res.status(409).json({ error: 'Student already exists in this college' });
  const row = { ...s, tenantId: user.tenantId, Student_ID: String(s.Student_ID).toUpperCase(), College: db.tenants.find(t => t.id === user.tenantId)?.name || s.College, UpdatedAt: new Date().toISOString() }; db.students.push(row); writeDb(db); res.status(201).json(row);
});
app.put('/api/students/:id', (req, res) => {
  const user = requireAuth(req, res); if (!user) return; const db = readDb(); const idx = db.students.findIndex(x => x.tenantId === user.tenantId && String(x.Student_ID).toUpperCase() === req.params.id.toUpperCase());
  if (idx < 0 || !canSeeStudent(user, db.students[idx])) return res.status(404).json({ error: 'Student not found' });
  if (user.role === 'student' && String(db.students[idx].Student_ID).toUpperCase() !== String(user.studentId || '').toUpperCase()) return res.status(403).json({ error: 'Students may only edit their own profile' });
  const { tenantId: _tenant, Student_ID: _sid, ...patch } = req.body || {};
  db.students[idx] = { ...db.students[idx], ...patch, tenantId: user.tenantId, Student_ID: db.students[idx].Student_ID, UpdatedAt: new Date().toISOString() }; writeDb(db); res.json(db.students[idx]);
});
app.delete('/api/students/:id', (req, res) => {
  const user = requireAuth(req, res); if (!user) return; if (!canFacultyOrManage(user)) return res.status(403).json({ error: 'Insufficient role permissions' }); const db = readDb(); const before = db.students.length; db.students = db.students.filter(x => !(x.tenantId === user.tenantId && String(x.Student_ID).toUpperCase() === req.params.id.toUpperCase())); db.applications = db.applications.filter(a => !(a.tenantId === user.tenantId && String(a.studentId).toUpperCase() === req.params.id.toUpperCase())); writeDb(db); res.json({ success: db.students.length < before });
});
app.post('/api/students/bulk', (req, res) => {
  const user = requireAuth(req, res); if (!user) return; if (!canFacultyOrManage(user)) return res.status(403).json({ error: 'Insufficient role permissions' }); const db = readDb(); const records = Array.isArray(req.body?.students) ? req.body.students : []; const added:any[]=[]; const skipped:string[]=[]; const existing = new Set(db.students.filter(s=>s.tenantId===user.tenantId).map(s=>String(s.Student_ID).toUpperCase())); const batchId=String(req.body?.batchId||'');
  for (const record of records) { const sid=String(record?.Student_ID||'').trim().toUpperCase(); if(!sid||existing.has(sid)){if(sid)skipped.push(sid);continue;} existing.add(sid); added.push({...record,tenantId:user.tenantId,Student_ID:sid,College:db.tenants.find(t=>t.id===user.tenantId)?.name||record.College,Import_Batch_ID:batchId||record.Import_Batch_ID,UpdatedAt:new Date().toISOString()}); }
  db.students.push(...added); writeDb(db); res.status(201).json({addedCount:added.length,skippedIds:skipped,students:added});
});
app.post('/api/students/:id/mentor', (req,res)=>{ const user=requireAuth(req,res); if(!user)return; if(!canManage(user))return res.status(403).json({error:'T&P only'}); const db=readDb(); const s=db.students.find(x=>x.tenantId===user.tenantId&&String(x.Student_ID).toUpperCase()===req.params.id.toUpperCase()); if(!s)return res.status(404).json({error:'Student not found'}); s.Mentor=String(req.body?.mentorName||''); s.Mentor_Email=String(req.body?.mentorEmail||''); s.UpdatedAt=new Date().toISOString(); writeDb(db); res.json(s); });
app.post('/api/students/:id/mentoring-note',(req,res)=>{ const user=requireAuth(req,res); if(!user)return; if(!canFacultyOrManage(user))return res.status(403).json({error:'Faculty/T&P only'}); const db=readDb(); const s=db.students.find(x=>x.tenantId===user.tenantId&&String(x.Student_ID).toUpperCase()===req.params.id.toUpperCase()); if(!s)return res.status(404).json({error:'Student not found'}); const date=new Date().toISOString().split('T')[0]; s.Mentorship_Notes=[`${date}: ${String(req.body?.note||'').trim()}`,...(s.Mentorship_Notes||[])]; s.UpdatedAt=new Date().toISOString(); writeDb(db); res.json(s); });

// ---------------- Import batches ----------------
app.get('/api/import-batches',(req,res)=>{const user=requireAuth(req,res);if(!user)return;res.json(tenantRows(readDb().importBatches,user));});
app.post('/api/import-batches',(req,res)=>{const user=requireAuth(req,res);if(!user)return;if(!canFacultyOrManage(user))return res.status(403).json({error:'Faculty/T&P only'});const db=readDb();const n=(Math.max(0,...tenantRows(db.importBatches,user).map(b=>Number(String(b.id).match(/(\d+)$/)?.[1]||0)))+1);const num=String(n).padStart(3,'0');const batch={id:req.body?.id||`BATCH-${num}`,label:`Import Batch ${num}`,tenantId:user.tenantId,fileName:String(req.body?.fileName||'import.csv'),uploadedAt:new Date().toISOString(),uploadedById:user.id,uploadedByName:user.name,recordCount:Number(req.body?.recordCount||0),skippedCount:Number(req.body?.skippedCount||0)};db.importBatches.unshift(batch);writeDb(db);res.status(201).json(batch);});
app.patch('/api/import-batches/:id',(req,res)=>{const user=requireAuth(req,res);if(!user)return;const db=readDb();const b=db.importBatches.find(x=>x.tenantId===user.tenantId&&x.id===req.params.id);if(!b)return res.status(404).json({error:'Batch not found'});Object.assign(b,{recordCount:req.body?.recordCount??b.recordCount,skippedCount:req.body?.skippedCount??b.skippedCount});writeDb(db);res.json(b);});
app.delete('/api/import-batches/:id',(req,res)=>{const user=requireAuth(req,res);if(!user)return;if(!canFacultyOrManage(user))return res.status(403).json({error:'Faculty/T&P only'});const db=readDb();const before=db.importBatches.length;db.importBatches=db.importBatches.filter(x=>!(x.tenantId===user.tenantId&&x.id===req.params.id));db.students=db.students.filter(x=>!(x.tenantId===user.tenantId&&x.Import_Batch_ID===req.params.id));writeDb(db);res.json({success:db.importBatches.length<before});});
app.delete('/api/import-batches',(req,res)=>{const user=requireAuth(req,res);if(!user)return;if(!canManage(user))return res.status(403).json({error:'T&P only'});const db=readDb();db.importBatches=db.importBatches.filter(x=>x.tenantId!==user.tenantId);db.students=db.students.filter(x=>x.tenantId!==user.tenantId);writeDb(db);res.json({success:true});});

// ---------------- Tenant clean-slate ----------------
app.post('/api/tnp/clean-slate',(req,res)=>{const user=requireAuth(req,res);if(!user)return;if(!canManage(user))return res.status(403).json({error:'T&P only'});const db=readDb();for(const key of ['students','drives','applications','notifications','aiRuns','importBatches'] as const){db[key]=db[key].filter((x:any)=>x.tenantId!==user.tenantId);}writeDb(db);res.json({success:true});});

// ---------------- Notifications ----------------
app.get('/api/notifications',(req,res)=>{const user=requireAuth(req,res);if(!user)return;const db=readDb();const sid=req.query.studentId?String(req.query.studentId):undefined;let rows=tenantRows(db.notifications,user);if(user.role==='student')rows=rows.filter(n=>!n.studentId||n.studentId===user.studentId);else if(sid)rows=rows.filter(n=>!n.studentId||n.studentId===sid);res.json(rows);});
app.post('/api/notifications',(req,res)=>{const user=requireAuth(req,res);if(!user)return;if(!canManage(user))return res.status(403).json({error:'T&P only'});const db=readDb();const n={id:id('notif'),tenantId:user.tenantId,timestamp:new Date().toISOString(),read:false,...req.body};delete n.tenantId; n.tenantId=user.tenantId;db.notifications.unshift(n);writeDb(db);res.status(201).json(n);});
app.patch('/api/notifications/:id',(req,res)=>{const user=requireAuth(req,res);if(!user)return;const db=readDb();const n=db.notifications.find(x=>x.tenantId===user.tenantId&&x.id===req.params.id);if(!n)return res.status(404).json({error:'Notification not found'});Object.assign(n,{read:Boolean(req.body?.read)});writeDb(db);res.json(n);});

// ---------------- Analytics ----------------
app.get('/api/analytics/overview',(req,res)=>{const user=requireAuth(req,res);if(!user)return;const db=readDb();const students=tenantRows(db.students,user);const drives=tenantRows(db.drives,user);const apps=tenantRows(db.applications,user);const avg=(k:string)=>students.length?Number((students.reduce((a,s)=>a+Number(s[k]||0),0)/students.length).toFixed(2)):0;res.json({students:students.length,averageCgpa:avg('CGPA'),averageAttendance:avg('Attendance_Percentage'),activeDrives:drives.filter(d=>d.published!==false).length,applications:apps.length,selected:apps.filter(a=>a.status==='Selected').length,aiRuns:tenantRows(db.aiRuns,user).length});});

// ---------------- Drives / applications ----------------
app.get('/api/drives',(req,res)=>{const user=requireAuth(req,res);if(!user)return;let rows=tenantRows(readDb().drives,user);if(user.role==='student')rows=rows.filter(d=>d.published!==false&&(d.status||'Active')!=='Closed');res.json(rows);});
app.post('/api/drives',(req,res)=>{const user=requireAuth(req,res);if(!user)return;if(!canManage(user))return res.status(403).json({error:'T&P only'});const db=readDb();const now=new Date().toISOString();const d={id:id('drive'),tenantId:user.tenantId,createdAt:now,published:req.body?.published!==false,...req.body};delete d.tenantId;d.tenantId=user.tenantId;if(d.published)d.publishedAt=now;db.drives.unshift(d);writeDb(db);res.status(201).json(d);});
app.put('/api/drives/:id',(req,res)=>{const user=requireAuth(req,res);if(!user)return;if(!canManage(user))return res.status(403).json({error:'T&P only'});const db=readDb();const d=db.drives.find(x=>x.tenantId===user.tenantId&&x.id===req.params.id);if(!d)return res.status(404).json({error:'Drive not found'});const was=d.published;const patch={...req.body};delete patch.tenantId;Object.assign(d,patch);if(!was&&d.published)d.publishedAt=new Date().toISOString();writeDb(db);res.json(d);});
app.delete('/api/drives/:id',(req,res)=>{const user=requireAuth(req,res);if(!user)return;if(!canManage(user))return res.status(403).json({error:'T&P only'});const db=readDb();db.drives=db.drives.filter(x=>!(x.tenantId===user.tenantId&&x.id===req.params.id));db.applications=db.applications.filter(x=>!(x.tenantId===user.tenantId&&x.driveId===req.params.id));writeDb(db);res.json({success:true});});
app.get('/api/applications',(req,res)=>{const user=requireAuth(req,res);if(!user)return;const db=readDb();let rows=tenantRows(db.applications,user);if(user.role==='student')rows=rows.filter(a=>a.studentId===user.studentId);if(req.query.studentId)rows=rows.filter(a=>a.studentId===req.query.studentId);if(req.query.driveId)rows=rows.filter(a=>a.driveId===req.query.driveId);if(req.query.mentorEmail){const ids=new Set(tenantRows(db.students,user).filter(s=>String(s.Mentor_Email||'').toLowerCase()===String(req.query.mentorEmail).toLowerCase()).map(s=>s.Student_ID));rows=rows.filter(a=>ids.has(a.studentId));}res.json(rows);});
app.post('/api/applications',(req,res)=>{const user=requireAuth(req,res);if(!user)return;if(user.role!=='student')return res.status(403).json({error:'Only students may submit applications'});const db=readDb();const s=db.students.find(x=>x.tenantId===user.tenantId&&x.Student_ID===user.studentId);const d=db.drives.find(x=>x.tenantId===user.tenantId&&x.id===req.body?.driveId);if(!s||!d)return res.status(404).json({error:'Student or drive not found'});if(d.published===false||(d.status||'Active')==='Closed')return res.status(400).json({error:'This drive is not open'});if(db.applications.some(a=>a.tenantId===user.tenantId&&a.studentId===user.studentId&&a.driveId===d.id))return res.status(409).json({error:'Already applied'});const a={id:id('app'),tenantId:user.tenantId,appliedAt:new Date().toISOString(),status:'Applied',...req.body,studentId:user.studentId,studentName:s.Full_Name,companyName:d.companyName,role:d.role,packageLPA:d.packageLPA,appliedDate:new Date().toISOString().split('T')[0]};delete a.tenantId;a.tenantId=user.tenantId;db.applications.unshift(a);writeDb(db);res.status(201).json(a);});
app.patch('/api/applications/:id',(req,res)=>{const user=requireAuth(req,res);if(!user)return;if(!canManage(user))return res.status(403).json({error:'T&P only'});const db=readDb();const a=db.applications.find(x=>x.tenantId===user.tenantId&&x.id===req.params.id);if(!a)return res.status(404).json({error:'Application not found'});const patch={...req.body};delete patch.tenantId;Object.assign(a,patch,{updatedAt:new Date().toISOString()});writeDb(db);res.json(a);});

// ---------------- ML + external AI ----------------
function runPython(payload:any):Promise<any>{return new Promise((resolve,reject)=>{const child=spawn(process.env.ML_PYTHON||'python',[path.join(ML_DIR,'predict.py')],{cwd:ML_DIR});let out='',err='';child.stdout.on('data',d=>out+=d);child.stderr.on('data',d=>err+=d);child.on('close',code=>{if(code!==0)return reject(new Error(err||`ML process exited ${code}`));try{resolve(JSON.parse(out));}catch{reject(new Error(`Invalid ML response: ${out}`));}});child.stdin.write(JSON.stringify(payload));child.stdin.end();});}
function studentFeaturePayload(s:any){const coding=s.Coding_Activity||{};const skills=Array.isArray(s.Technical_Skills)?s.Technical_Skills:[];const certs=Array.isArray(s.Certifications)?s.Certifications:[];const projects=Array.isArray(s.Projects)?s.Projects:[];const internships=Array.isArray(s.Internships)?s.Internships:[];const problems=Number(coding.problemsSolved||0);const rating=Math.max(Number(coding.contestRating||0),Number(coding.leetcodeRating||0),Number(coding.codechefRating||0));const attendance=Number(s.Attendance_Percentage||0);const cgpa=Number(s.CGPA||0);const aptitude=Number(s.Aptitude_Score||0);const communication10=Number(s.Communication_Score||0);const communication=communication10<=10?communication10*10:communication10;const codingScore=Math.min(100,Math.round(Math.max(rating/20,problems/3)));const technicalScore=Math.min(100,Math.round(Math.min(100,skills.length*12)+Math.min(20,projects.length*4)));const domain=String(s.Target_Role||s.Branch||s.Department||'General').trim()||'General';return {age:Number(s.Age||21),gender:s.Gender||'Unknown',cgpa,attendance_percentage:attendance,backlogs:Number(s.Backlogs||0),coding_score:codingScore,aptitude_score:aptitude,communication_score:communication,technical_score:technicalScore,projects_count:projects.length,major_projects:projects.length>=2?1:0,internships_count:internships.length,internship_months:Number(s.Internship_Months||0),certifications_count:certs.length,hackathons_participated:Number(s.Hackathons_Participated||0),hackathons_won:Number(s.Hackathons_Won||0),coding_platform_score:Math.min(100,Math.round(rating||Math.min(100,problems))),github_projects:Number(s.Github_Projects||0),linkedin_score:Number(s.Linkedin_Score||0),resume_score:Number(s.Resume_Score||0),soft_skills_score:communication,leadership_score:Number(s.Leadership_Score||communication),extracurricular_score:Number(s.Extracurricular_Score||0),training_hours:Number(s.Training_Hours||0),mock_interview_score:Number(s.Mock_Interview_Score||communication),preferred_domain:domain};}
function buildPrompt(student:any,ml:any,question?:string){return `You are the external reasoning layer for ARYA AI TalentLink, a college placement-readiness platform.\n\nA locally trained placement model, trained on Kaggle's Binary Classification of Student Placement Outcomes dataset (8,000 training rows), has already analyzed this student.\n\nLOCAL MODEL OUTPUT:\n- placement probability: ${Math.round((ml.placement_probability??0)*100)}%\n- prediction: ${ml.prediction}\n- model confidence: ${Math.round((ml.confidence??0)*100)}%\n\nSTUDENT PROFILE:\n${JSON.stringify(student,null,2)}\n\nTASK:\nGive evidence-grounded placement coaching. Do not invent achievements. Identify the most actionable gaps from the available profile and give a 30-day improvement plan. State uncertainty when project data is incomplete.${question?`\nUSER QUESTION: ${question}`:''}\nReturn concise sections: Assessment, Why, Priority Actions, 30-Day Plan.`;}
app.post('/api/ai/readiness',async(req,res)=>{const user=requireAuth(req,res);if(!user)return;try{const db=readDb();const sid=String(req.body?.studentId||user.studentId||'');const student=db.students.find(s=>s.tenantId===user.tenantId&&String(s.Student_ID).toUpperCase()===sid.toUpperCase());if(!student||!canSeeStudent(user,student))return res.status(404).json({error:'Student not found'});res.json(await runPython({action:'readiness',features:studentFeaturePayload(student)}));}catch(e:any){res.status(500).json({error:e.message});}});
app.post('/api/ai/prompt',async(req,res)=>{const user=requireAuth(req,res);if(!user)return;try{const db=readDb();const sid=String(req.body?.studentId||user.studentId||'');const student=db.students.find(s=>s.tenantId===user.tenantId&&String(s.Student_ID).toUpperCase()===sid.toUpperCase());if(!student||!canSeeStudent(user,student))return res.status(404).json({error:'Student not found'});const ml=await runPython({action:'readiness',features:studentFeaturePayload(student)});res.json({prompt:buildPrompt(student,ml,req.body?.question),localModel:ml});}catch(e:any){res.status(500).json({error:e.message});}});
app.post('/api/ai/coach', async (req, res) => {
  const user = requireAuth(req, res);

  if (!user) return;

  try {
    const db = readDb();

    const sid = String(
      req.body?.studentId || user.studentId || ''
    );

    const student = db.students.find(
      s =>
        s.tenantId === user.tenantId &&
        String(s.Student_ID).toUpperCase() === sid.toUpperCase()
    );

    if (!student || !canSeeStudent(user, student)) {
      return res.status(404).json({
        error: 'Student not found'
      });
    }

    const modelResult = await runPython({
      action: 'readiness',
      features: studentFeaturePayload(student)
    });

    const result = generateLocalGuidance(
      student,
      modelResult
    );

    const run = {
      id: id('guidance'),
      tenantId: user.tenantId,
      createdAt: new Date().toISOString(),
      studentId: student.Student_ID,
      localModel: modelResult,
      guidance: result.guidance,
      summary: result.summary,
      provider: 'local'
    };

    db.aiRuns.push(run);
    writeDb(db);

    return res.json({
      configured: true,
      summary: result.summary,
      guidance: result.guidance,
      localModel: modelResult,
      runId: run.id
    });

  } catch (error) {
    console.error('Local guidance generation failed:', error);

    return res.status(500).json({
      error:
        'Personalized guidance is temporarily unavailable. Please try again.'
    });
  }
});
app.get('/api/ai/runs/:studentId',(req,res)=>{const user=requireAuth(req,res);if(!user)return;const db=readDb();const sid=req.params.studentId;res.json(tenantRows(db.aiRuns,user).filter(x=>x.studentId===sid).slice(-20).reverse());});

const dist=path.resolve(ROOT,'..','dist');if(fs.existsSync(dist)){app.use(express.static(dist));app.get('*',(req,res,next)=>req.path.startsWith('/api/')?next():res.sendFile(path.join(dist,'index.html')));}
const port=Number(process.env.PORT||4000);app.listen(port,()=>console.log(`ARYA backend running at http://localhost:${port}`));
