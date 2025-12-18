# KaamKhojAI 

> Voice-First Multilingual Job Discovery Platform for Blue-Collar Workers

[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-5+-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Mongoose](https://img.shields.io/badge/Mongoose-8+-880000)](https://mongoosejs.com/)
[![Vite](https://img.shields.io/badge/Vite-7+-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Axios](https://img.shields.io/badge/Axios-1.11+-5A29E4?logo=axios&logoColor=white)](https://axios-http.com/)
[![i18next](https://img.shields.io/badge/i18next-25+-26A69A?logo=i18next&logoColor=white)](https://www.i18next.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000)](https://jwt.io/)
[![bcryptjs](https://img.shields.io/badge/bcryptjs-Security-00A86B)](https://www.npmjs.com/package/bcryptjs)
[![Multer](https://img.shields.io/badge/Multer-Uploads-777777)](https://github.com/expressjs/multer)
[![Web%20Speech%20API](https://img.shields.io/badge/Web%20Speech%20API-Browser-FF6F00)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
[![Speech%20Synthesis](https://img.shields.io/badge/Speech%20Synthesis-Browser-FF6F00)](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-API-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)

## Overview

KaamKhojAI is a voice-first employment platform designed to bridge the gap between blue-collar workers and job opportunities. The platform eliminates literacy and language barriers by enabling workers to create profiles and discover jobs through natural speech interaction in English, Hindi, and Marathi.

## Key Features

- **Voice-First Interface**: Complete profile creation through guided voice interaction
- **Multilingual Support**: English, Hindi, and Marathi with real-time language switching
- **AI-Powered Assistance**: Conversational profile building using Gemini
- **Smart Job Matching**: Rule-based recommendation engine with constraint relaxation
- **Secure Authentication**: JWT-based auth for workers and contractors
- **Responsive Design**: Mobile-first UI built with React and Tailwind CSS
- **Text-to-Speech**: Voice feedback for recommended jobs and system messages
- **Trust & Verification Badges**: Visible tags like Verified, Police Verified, Skill Tested, Top Rated to signal reliability
- **Composite Trust Score**: Weighted score derived from customer ratings, job completion rate, and verified documents

## Problem Statement

Blue-collar workers in India face significant barriers when accessing traditional job portals:
- **Literacy Challenges**: Text-heavy forms are difficult to navigate
- **Language Barriers**: Limited support for regional languages
- **Complex UX**: Conventional job platforms aren't designed for non-technical users
- **Contractor Inefficiency**: Small contractors lack simple tools to post jobs and find candidates

## Solution

KaamKhojAI addresses these challenges through:
1. Voice-driven profile creation with zero typing required
2. Intelligent field extraction from natural speech
3. Rule-based job matching considering age, experience, shift, and job title
4. Lightweight contractor dashboard for job posting
5. Complete multilingual support across UI and voice interaction

## System Architecture

```
┌────────────────────────┐
│      Frontend          │
│  React + CSS           │
│  Voice UI + i18next    │
└──────────┬─────────────┘
           │
    Web Speech API
           │
           ▼
┌────────────────────────┐
│  Voice Extraction      │
│  Regex-based extractor │
│  Gemini     │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│    Backend API         │
│  Node.js + Express     │
│  User & Job Controllers│
└──────────┬─────────────┘
           │
           ▼
     MongoDB Database
  (Users, Jobs, Profiles)
```

## Technology Stack

### Frontend
- **Framework**: React 18+ (Vite)
- **Styling**: CSS
- **Internationalization**: i18next
- **Voice**: Web Speech API (Recognition) + Speech Synthesis (prompts)
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcryptjs
- **Middleware**: CORS, dotenv

### AI/NLP
- **Field Extraction**: Multilingual regex patterns
- **Conversational AI**: Gemini API 

## Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- MongoDB 6+ (local or Atlas)
- Modern browser with Web Speech API support

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create a .env file with your configuration
# Required variables:
# - MONGO_URI
# - JWT_SECRET
# - GEMINI_API_KEY 
# - PORT

# Start the server
npm run dev
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Environment Variables

### Backend (.env)
```env
MONGO_URI=mongodb://localhost:27017/kaamkhojai
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

## Usage

### For Workers

1. **Select Language**: Choose from English, Hindi, or Marathi using the language toggle
2. **Activate Voice Assistant**: Click the microphone button to start profile creation
3. **Speak Naturally**: Answer the assistant's questions in your preferred language:
   - Name
   - Age
   - Address
   - Phone number
   - Preferred shift (day/night/flexible)
   - Years of experience
   - Job title (e.g., "plumber", "electrician")
   - Expected salary
4. **Review Profile**: Check extracted information and confirm
5. **Get Job Recommendations**: View matched jobs with voice feedback

### For Contractors

1. **Register/Login**: Create a contractor account
2. **Post Jobs**: Fill out the job posting form with:
   - Job title
   - Description
   - Minimum age requirement
   - Required experience
   - Shift timing
   - Salary range
   - Location
3. **Manage Listings**: View and edit posted jobs from the dashboard

## Trust & Verification

This project introduces a trust model to increase contractor confidence when hiring workers through the platform. It adds non-invasive badges and a composite trust score to worker profiles without changing existing API routes.

### Badges
- **Verified ✔**: Baseline identity checks (e.g., phone/email ownership) completed.
- **Police Verified 🔒**: Police verification certificate uploaded and validated (authenticity + validity period). Intended to reduce impersonation/fraud risk for contractors.
- **Skill Tested 🛠**: Evidence-backed skills reviewed (short demo videos, prior work photos) and mapped to the worker’s declared job_title and skills.
- **Top Rated ⭐**: Awarded to workers exceeding a trust score threshold (e.g., ≥ 4.5/5).

### Trust Score (Concept)
A weighted combination of independent signals:
- **Customer Ratings (≈50–60%)**: Mean star rating with recency weighting; safeguards for outlier impact.
- **Job Completion Rate (≈30–40%)**: Completed vs. assigned jobs; recency- and volume-aware normalization.
- **Document Signals (≈10–20%)**: Police verification validity and baseline identity verification.

This score is displayed numerically (e.g., 4.6/5) and drives the “Top Rated ⭐” badge. Badges appear on worker cards, profile pages, and job application views.

### Security & Privacy Impact
- **Hiring Confidence**: Clear, verifiable signals (police verification, skill evidence) reduce contractor risk and decision time.
- **Minimal Exposure**: Only badge states and scores are shown publicly; sensitive documents are stored securely and are not exposed.
- **Tamper Resistance (Design Goal)**: Immutable audit logs for verification actions; certificate validity checks (issuer, expiry).
- **Fairness Considerations**: Balanced weights to avoid penalizing new workers; guardrails against rating brigading; opt-in visibility for sensitive evidence.

### UX & Discoverability
- Badges shown next to worker names and in profile headers.
- Filters and sort-by options (e.g., “Police Verified”, “Top Rated”, minimum trust score) for contractor search.
- Tooltips and short explanations for each badge to improve transparency.

Note: This documentation stages the feature for research and design. No new API routes are required yet; implementation can layer onto existing auth/profile flows.

### Trust & Verification Tech Stack (Planned)
To implement badges and trust scoring with minimal changes to the current Node/Express stack:

- **File Uploads (existing):** `multer` (memoryStorage) to receive certificate images/PDFs and skill evidence media.
- **OCR (documents):**
   - Local: `tesseract.js` (server-side) for extracting text from images (police verification certificates).
   - PDFs: `pdf-parse` to extract text/metadata from PDF uploads.
   - Optional Cloud: Google Vision API or Azure Form Recognizer for higher accuracy (swap-in if needed).
- **Image Processing & Metadata:** `sharp` for resizing/thumbnails; `exif-parser` to inspect capture dates/device metadata (anti-fraud heuristics).
- **Video Evidence Handling:** `fluent-ffmpeg` (requires OS `ffmpeg`) to transcode short clips and generate thumbnails/snapshots.
- **Validation & Scoring:** Custom rule-based validator and a `computeTrustScore()` helper function; weights from ratings, completion rate, and document validity.
- **Storage:** Start with local `uploads/` (already present) and later migrate to cloud object storage if required.

These additions stay within the current codebase and can be introduced behind existing auth/profile flows without new public routes initially.

## API Endpoints

### Authentication
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — User login, returns JWT
- `GET /api/auth/me` — Get current user (JWT required)

### Voice & Profile
- `POST /api/voice/process` — Extract a specific field from spoken text (multilingual regex)
- `POST /api/auth/create-profile` — Create worker profile from extracted fields and return recommended jobs

### Jobs
- `GET /api/jobs` — List all jobs
- `POST /api/jobs` — Create a new job (contractors only)

## Job Matching Algorithm

The recommendation engine uses a rule-based, staged matching process:

1. **Base Query**: `minAge <= age` and job title match (`jobName` contains desired `job_title`, case-insensitive).
2. **Availability Constraint**: If the worker’s shift is not “flexible/any”, match `availability` (day/night/full-time/part-time/weekends).
3. **Relax Availability**: If no results, drop the availability filter while keeping age and title.
4. **Category Fallback**: Map common titles (e.g., driver, cook, security) to category and query.
5. **Final Fallback**: Return a small set of general jobs to avoid empty UI.

## Architecture Overview (Concise)

- **Frontend**: React SPA with voice capture (Web Speech API), Speech Synthesis prompts, multilingual UI (i18next), and job browsing/posting.
- **Backend**: Node/Express REST API for auth, voice processing, profile creation, and jobs; deterministic regex extractor; optional Gemini chat.
- **Data**: MongoDB (Auth users, worker profiles, jobs, trust metadata: badges/score/ratings/job stats/doc status).
- **Trust Layer**: Badges and trust score computed from ratings, job completion, and document validity; badges/score displayed publicly, documents kept private.

## Supported Languages

| Language | Code | Voice Support | UI Support |
|----------|------|---------------|------------|
| English  | en   | yes            | yes         |
| Hindi    | hi   | yes            | yes         |
| Marathi  | mr   | yes            | yes         |

## Browser Compatibility

- Chrome 80+ (Recommended)
- Edge 80+
- Safari 14.1+ (Limited voice support)
- Firefox 90+ (Limited voice support)

**Note**: Web Speech API support varies by browser. Chrome/Edge provide the best experience.

## Future Enhancements

- Document verification (Aadhaar/PAN integration)
- Worker rating and trust system
- Employer dashboard analytics
- Location-aware job recommendations (GPS integration)
- WhatsApp bot for conversational job discovery
- Server-side STT using Whisper for better accuracy
- SMS notifications for job matches
- Offline support with Progressive Web App
- Video profile uploads
- Interview scheduling system

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Security Considerations

- JWT tokens stored in localStorage (consider httpOnly cookies for production)
- Passwords hashed using bcryptjs with salt rounds
- CORS configured for specific origins in production
- Input validation on all API endpoints
- Rate limiting recommended for production deployment

## Performance Tips

- Use MongoDB indexes on frequently queried fields (jobTitle, age, shift)
- Implement Redis caching for job recommendations
- Compress voice data before transmission
- Use CDN for static assets
- Enable gzip compression on Express

## Troubleshooting

### Voice Recognition Not Working
- Ensure HTTPS is enabled (required for Web Speech API)
- Check browser microphone permissions
- Verify browser compatibility
- Try Chrome/Edge for best results

### Jobs Not Matching
- Check that worker profile is complete
- Verify job constraints (age, shift) aren't too restrictive
- Review console logs for matching algorithm output

### Database Connection Issues
- Verify MongoDB is running
- Check MONGODB_URI in .env
- Ensure network connectivity to MongoDB Atlas (if using cloud)

## License

This project is intended for academic, research, and demonstration purposes.

## Acknowledgments

- Web Speech API for browser-based voice recognition
- Google Gemini for conversational AI capabilities
- i18next community for internationalization support
- MongoDB for flexible document storage

## Contact

For questions or support, please open an issue on GitHub or contact the development team.

---

**Made with ❤️ for India's workforce**