# KaamKhojAI 

> Voice-First Multilingual Job Discovery Platform for Blue-Collar Workers

[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-47A248?logo=mongodb)](https://www.mongodb.com/)

## Overview

KaamKhojAI is a voice-first employment platform designed to bridge the gap between blue-collar workers and job opportunities. The platform eliminates literacy and language barriers by enabling workers to create profiles and discover jobs through natural speech interaction in English, Hindi, and Marathi.

## Key Features

- ** Voice-First Interface**: Complete profile creation through guided voice interaction
- ** Multilingual Support**: English, Hindi, and Marathi with real-time language switching
- ** AI-Powered Assistance**: Conversational profile building using Gemini/Ollama
- ** Smart Job Matching**: Rule-based recommendation engine with constraint relaxation
- ** Secure Authentication**: JWT-based auth for workers and contractors
- ** Responsive Design**: Mobile-first UI built with React and Tailwind CSS
- ** Text-to-Speech**: Voice feedback for recommended jobs and system messages

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
│  React + Tailwind CSS  │
│  Voice UI + i18next    │
└──────────┬─────────────┘
           │
    Web Speech API
           │
           ▼
┌────────────────────────┐
│  AI Processing Layer   │
│        Gemini          │
│  Field Extraction      │
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
- **Styling**: Tailwind CSS
- **Internationalization**: i18next
- **Voice**: Web Speech API (Recognition + Synthesis)
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

# Create environment file
cp .env.example .env

# Edit .env with your configuration
# Required variables:
# - MONGODB_URI
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

# Create environment file
cp .env.example .env

# Edit .env with backend API URL
# VITE_API_URL=http://localhost:5000

# Start development server
npm run dev
```

## Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/kaamkhojai
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
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

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Workers
- `POST /api/workers/profile` - Create worker profile via voice
- `GET /api/workers/profile/:userId` - Get worker profile
- `GET /api/workers/recommendations/:userId` - Get job recommendations

### Jobs
- `POST /api/jobs` - Create new job (contractors only)
- `GET /api/jobs` - List all jobs
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

## Job Matching Algorithm

The recommendation engine uses a multi-stage matching process:

1. **Exact Match**: Job title similarity + age eligibility + shift preference
2. **Relaxed Shift**: Remove shift constraint if no matches found
3. **Relaxed Age**: Expand age range (±2 years) if still no matches
4. **Title-Only Match**: Match only on job title as final fallback

## Project Structure

```
kaamkhojai/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── VoiceAssistant.jsx
│   │   │   ├── LanguageToggle.jsx
│   │   │   └── JobCard.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── WorkerDashboard.jsx
│   │   │   └── ContractorDashboard.jsx
│   │   ├── i18n/
│   │   │   └── translations.js
│   │   ├── utils/
│   │   │   └── api.js
│   │   └── App.jsx
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Job.js
│   │   │   └── WorkerProfile.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── workerController.js
│   │   │   └── jobController.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── workers.js
│   │   │   └── jobs.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── utils/
│   │   │   ├── fieldExtractor.js
│   │   │   └── jobMatcher.js
│   │   └── server.js
│   └── package.json
└── README.md
```

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

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Web Speech API for browser-based voice recognition
- Google Gemini for conversational AI capabilities
- i18next community for internationalization support
- MongoDB for flexible document storage

## Contact

For questions or support, please open an issue on GitHub or contact the development team.

---

**Made with ❤️ for India's workforce**