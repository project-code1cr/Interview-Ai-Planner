# Interview AI Planner

A full-stack AI interview preparation app that converts a job description and resume/self-summary into a ready-to-use interview plan.

## 🚀 What it does
- Generate role-matching score (0-100)
- Generate 4+ technical interview questions with intention + model answers
- Generate 4+ behavioral interview questions with intention + model answers
- Identify 3+ skill gaps with severity (low/medium/high)
- Create a 7-day preparation roadmap with daily tasks
- Save reports in MongoDB and list history
- Generate resume PDF (AI-enhanced output)

## 🧩 Tech stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB (Mongoose)
- AI: Google Gemini via `@google/genai`
- PDF parsing: `pdf-parse`
- File upload: `multer`
- PDF generation: `puppeteer`
- Validation: `zod`

## 🗂️ Project structure
- `Backened/`: Express API
  - `src/controllers/interview.controller.js`
  - `src/services/ai.service.js`
  - `src/models/user.model.js`, `interviewReport.model.js`
  - `src/routes/interview.routes.js`
  - `src/middlewares/auth.middleware.js`, `file.middleware.js`
- `Fronted/`: React app
  - `src/features/interview/` hooks, pages, services
  - `src/App.jsx`, `src/main.jsx`

## ⚙️ Setup
### Backend
```bash
cd Backened
npm install
cp .env.example .env
# set GOOGLE_GENAI_API_KEY, MONGODB_URI, JWT_SECRET
npm run dev
```

### Frontend
```bash
cd Fronted
npm install
npm run dev
```

## 📝 Usage
1. Register / login user
2. On Home page, provide Job Description, and resume file or self-description.
3. Click `Generate My Interview Strategy`
4. View generated plan and download resume PDF.

## 🔐 Notes
- Must use a valid `GOOGLE_GENAI_API_KEY`.
- Gemini model returns JSON; backend parses and validates via Zod.
- `multer` memory storage and 3MB file limit for upload.

## 🐞 Troubleshooting
- If you see `Internal Server Error while generating interview report`, check backend logs: AI response payload may not be valid JSON, or key may be missing/incorrect. 
- If you see parser issues, ensure a proper PDF resume.

## ✨ Contribution
- Improve prompt and schema for better AI planning quality.
- Add local caching, user quotas, prompt template settings.
- Add tests for controller + service.


