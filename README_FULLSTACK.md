# ARYA AI TalentLink — Full Stack + Local ML + External AI

This version upgrades the original browser-only prototype into a tenant-aware full-stack architecture with server persistence and a real placement ML model.

## What was added

### 1. Backend (`backend/`)
- Express REST API
- Persistent local server database in `backend/data/db.json`
- Authentication endpoints
- Student CRUD
- Placement drive CRUD
- Application CRUD
- AI/ML endpoints
- AI run history
- Health endpoint
- Optional production serving of the Vite `dist/` folder

### 2. Local trained ML model (`ml/`)
The local model is **not the external LLM**.

A scikit-learn `MultiOutputClassifier(RandomForestClassifier)` is trained with two outputs:
1. `placed` — estimated placement outcome probability
2. `coaching_focus` — the dominant intervention area:
   - academic
   - technical_skills
   - projects
   - coding
   - communication

The backend calls `ml/predict.py`, receives the local prediction, and uses it to construct the prompt.

### 3. External AI layer
Gemini is called only after the local model has produced its structured analysis.

Flow:

`Student Profile -> Backend -> Local Random Forest -> Prompt Builder -> Gemini -> Coaching Response`

This gives the project a clear hybrid-AI story:
- **your model** performs structured prediction / intervention selection
- **external AI** performs natural-language reasoning and coaching
- **backend** controls the orchestration and data flow

### 4. Frontend integration
The Student Readiness screen now shows:
- local placement probability
- predicted coaching focus
- priority model features
- external AI coaching response
- the generated prompt sent to the external AI

The frontend no longer uses localStorage/sessionStorage for application state. The backend is the source of truth and the frontend keeps only an in-memory cache; authentication uses an HttpOnly server cookie.

---

## Kaggle datasets

The training pipeline supports placement datasets with common feature names. The recommended sources are listed in:

`ml/data/KAGGLE_SOURCES.md`

The repository does **not** redistribute Kaggle datasets. Download them from Kaggle according to their license/competition rules and place the CSV in `ml/data/`.

Then retrain:

```bash
python ml/train.py --dataset ml/data/student_placement_train.csv
```

The current ZIP includes a reproducible 8,000-row privacy-safe baseline training set generator and a trained model artifact. It is explicitly labelled as a synthetic baseline; it is **not falsely claimed to have been trained on Kaggle data**.

---

## Current model training result

The included model was trained on 8,000 generated records using the same placement-oriented feature schema.

- Placement ROC-AUC: ~0.880
- Placement accuracy: ~0.788
- Coaching-focus accuracy: ~0.899
- Model: MultiOutput Random Forest
- Features: CGPA, attendance, backlogs, technical skills, projects, certifications, internships, coding activity/rating, aptitude, communication

After downloading a licensed Kaggle dataset, retrain and replace:

`ml/models/arya_placement_model.joblib`

The generated `training_metrics.json` records the dataset source and metrics.

---

## Setup

### 1. Install frontend/backend dependencies

From the project root:

```bash
npm install
```

The root package already contains React/Vite/Express/tsx/dotenv/@google/genai dependencies.

### 2. Train/retrain the local model

```bash
python ml/train.py
```

Optional Kaggle dataset:

```bash
python ml/train.py --dataset ml/data/student_placement_train.csv
```

### 3. Configure Gemini

Copy:

```text
backend/.env.example
```

to:

```text
backend/.env
```

and set:

```env
PORT=4000
FRONTEND_ORIGIN=http://localhost:3000
GEMINI_API_KEY=your_key
GEMINI_MODEL=gemini-2.5-flash
AI_PROVIDER=gemini
ML_PYTHON=python
```

The API key stays server-side. Do not put it in `VITE_*` variables.

### 4. Start backend

Terminal 1:

```bash
npm run backend
```

Backend:

`http://localhost:4000`

Health check:

`http://localhost:4000/api/health`

### 5. Start frontend

Terminal 2:

```bash
npm run dev
```

Frontend:

`http://localhost:3000`

Or run both:

```bash
npm run dev:full
```

---

## API map

### System
- `GET /api/health`

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Students
- `GET /api/students`
- `GET /api/students/:id`
- `POST /api/students`
- `PUT /api/students/:id`
- `DELETE /api/students/:id`
- `POST /api/students/bulk`

### Placement
- `GET /api/drives`
- `POST /api/drives`
- `PUT /api/drives/:id`
- `DELETE /api/drives/:id`
- `GET /api/applications`
- `POST /api/applications`
- `PATCH /api/applications/:id`

### Notifications / analytics
- `GET /api/notifications`
- `POST /api/notifications`
- `PATCH /api/notifications/:id`
- `GET /api/analytics/overview`

### AI / ML
- `POST /api/ai/readiness`
- `POST /api/ai/prompt`
- `POST /api/ai/coach`
- `GET /api/ai/runs/:studentId`

---

## Example hybrid-AI request

```json
POST /api/ai/coach

{
  "student": {
    "Student_ID": "STU-1001",
    "Full_Name": "Example Student",
    "CGPA": 7.8,
    "Attendance_Percentage": 86,
    "Backlogs": 0,
    "Technical_Skills": ["Python", "SQL", "React"],
    "Projects": ["Placement Portal", "Analytics Dashboard"],
    "Certifications": ["AWS Cloud Practitioner"],
    "Internships": ["Software Intern"],
    "Coding_Activity": {
      "problemsSolved": 145,
      "contestRating": 1320
    },
    "Aptitude_Score": 72,
    "Communication_Score": 7
  }
}
```

The backend first calls the local Random Forest. It then creates a prompt containing the model output and sends that prompt to Gemini.

---

## What to explain to the panel

Do **not** say that the project trained Gemini.

Say:

> "We designed a hybrid AI architecture. Our local machine-learning model is trained on placement-oriented student features and predicts placement probability plus the dominant intervention area. The backend then converts those structured predictions into a context-aware prompt. An external generative AI model is used only as the natural-language reasoning layer. This separates predictive ML from generative AI and lets us evaluate each layer independently."

You can demonstrate:
1. Student profile enters the system.
2. Backend invokes the trained local model.
3. Local model returns placement probability and coaching focus.
4. Backend constructs the generated prompt.
5. Prompt is sent to the external AI.
6. External AI returns a coaching plan.
7. AI run is stored in the local database for traceability.

---

## Important academic/research note

The included baseline model is intentionally described honestly as a synthetic training baseline. For a stronger final dissertation/project claim, download an appropriate Kaggle placement dataset under its license, run the provided adapter/training script, record the resulting metrics, and cite that dataset in your report.

Suggested Kaggle sources are documented in `ml/data/KAGGLE_SOURCES.md`.

## Institution registration and tenant identity

The authentication UI separates institution onboarding from student/faculty onboarding. An institution representative selects **Register Your Institution** to create a tenant and its first T&P account. Students and faculty select an existing institution and join that tenant. The backend rejects duplicate institution names.

After login, protected portals show the institution name from the authenticated tenant, making the workspace feel like the college's own placement portal while retaining one shared ARYA codebase.

## Gemini integration

Gemini is already integrated on the backend using `@google/genai`. `/api/ai/coach` first runs the local placement model, builds a grounded prompt from the model output and student profile, then sends that prompt to Gemini. Configure `GEMINI_API_KEY` in `backend/.env` and keep the key server-side.


## Institution onboarding approval workflow

Institution registration is not self-activating. A visitor submits an institution request with the college name and designated T&P officer details. The request is stored as `pending` and a notification is sent to the ARYA Platform Admin.

The Platform Admin reviews the request in the Platform Institution Approval Queue. On approval, ARYA creates the tenant in `active` state and generates a one-time T&P invitation valid for 72 hours. The invitation is emailed when `RESEND_API_KEY` and `MAIL_FROM` are configured; otherwise the invitation is logged and stored in the local `emailOutbox` collection for development/demo use.

The T&P officer opens the invitation, accepts it, and is then signed into the private college workspace. Students and faculty can only register against approved active colleges.

Default local platform-admin credentials are controlled by `MAIN_ADMIN_EMAIL` / `MAIN_ADMIN_PASSWORD` (defaults: `admin@arya.local` / `Admin@123` for local development). Change these before deployment.
