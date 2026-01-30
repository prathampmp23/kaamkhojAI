# Methods

## System Overview
KaamKhoj is a voice-first job discovery platform designed for blue-collar workers. It provides:
- A multilingual, guided speech interaction to collect worker profiles.
- Rule-based job recommendations matching age, desired role, and shift.
- Lightweight authentication and a simple contractor workflow to post jobs.

Implementation spans a React frontend (Vite) and a Node/Express backend with MongoDB via Mongoose. Internationalization (EN/HI/MR) is supported through i18next; voice capture uses the Web Speech API.

## Participants and Roles
- **Worker (Candidate):** Creates a profile via voice, receives recommended jobs, browses listings.
- **Contractor/Poster:** Registers and posts jobs through a form; listings become discoverable to workers.

## Data Collection (Voice → Structured Fields)
- **Client-side Capture:** `webkitSpeechRecognition` records the user’s utterance; `SpeechSynthesis` provides prompts in EN/HI/MR.
- **Server-side Extraction:** A multilingual, deterministic regex extractor converts free text into fields: `name`, `age`, `address`, `phone`, `shift_time`, `experience`, `job_title`, `salary_expectation`.
  - Robustness features:
    - Numeric fallbacks for `age` and `salary` (digit parsing, English word numbers up to 99).
    - Hindi/Marathi variants for name/address cues.
    - Heuristics to reject obviously non-name inputs.
- **API:** `POST /api/voice/process` returns `{success, field, extractedValue, confidence}` per utterance.

## Profile Creation & Validation
- **Endpoint:** `POST /api/auth/create-profile`.
- **Validation:** Ensures required text fields (`name`, `job_title`) and positive numeric fields (`age`, `experience`, `salary_expectation`).
- **Persistence:** Creates a `User` document with fields above.

## Recommendation Algorithm (Rule-Based)
1. **Base Query:** `minAge <= age` AND `jobName` contains `job_title` (case-insensitive).
2. **Availability Constraint:** If `shift_time` is not "flexible"/"any", include `availability` regex match.
3. **Relaxation:** If no matches, drop availability constraint.
4. **Category Fallback:** Map `job_title` keywords (e.g., driver, cook) to `category` and query.
5. **Final Fallback:** Return a small set of general jobs to avoid empty UI.

Returns up to five jobs in each stage.

## Job Management
- **Listing:** `GET /api/jobs` returns all jobs, sorted by `createdAt`.
- **Creation:** `POST /api/jobs` creates a job with required fields: `jobName`, `company`, `jobDescription`, `location`, `salary`, `category`, `minAge`, `availability`, `skillsRequired[]`, `experience`.
- **Seeding:** `seedJobs.js` inserts a diverse set of roles (driver, cook, cleaner, electrician, security, factory, construction, house-help, office-helper) with availability variants.

## Authentication
- **Register:** `POST /api/auth/register` checks unique `username` and `email`, stores bcrypt-hashed `password`.
- **Login:** `POST /api/auth/login` validates credentials, issues a 30-day JWT; client stores token in localStorage.
- **Protected Access:** `GET /api/auth/me` and `POST /api/auth/link-profile` require `Authorization: Bearer <token>`; middleware verifies token and loads user.

## Internationalization
- **UI i18n:** i18next (`supportedLngs: ['en','hi','mr']`); JSON translations served from `/public/locales`.
- **Voice Locale:** Prompts and speech synth use `en-IN`, `hi-IN`, `mr-IN`; recognition configured per language.

## Optional LLM Assistance
- **Endpoint:** `POST /validate-with-ai`.
- **Model Use:** `Meta Llama 3.3 70B` with language-specific system prompts to guide profile collection.
- **Resilience:** Fallback message when the LLM is unavailable; primary data collection relies on deterministic extractors.

## Data Models
- **AuthUser:** `username`, `email`, `password (hash)`, `profileCompleted`, `profileId`, `createdAt`.
- **User (Profile):** `name`, `age`, `address`, `phone`, `shift_time`, `experience`, `job_title`, `salary_expectation`, `createdAt`.
- **Job:** `jobName`, `company`, `jobDescription`, `location`, `salary (string)`, `category (enum)`, `minAge`, `availability (enum)`, `skillsRequired[]`, `experience`.

## Security & Privacy
- **Transport:** CORS allowlist enforces known frontend origins; APIs reject unknown origins.
- **Identity:** JWT-based auth; passwords hashed via bcrypt; tokens verified server-side.
- **Client Storage:** Token and minimal user data stored in localStorage; worker profile snapshot cached for UX continuity.

## Limitations
- Rule-based recommendations (no semantic matching); limited update/delete APIs for jobs; reliance on browser speech APIs.

## Reproducibility Notes
- Backend requires `MONGO_URI`, `JWT_SECRET`,`OPENROUTER_API_KEY`.
- CORS allowlist includes localhost 5173 and the deployed frontend.
- Frontend selects backend via hostname in `src/environment.js`.
