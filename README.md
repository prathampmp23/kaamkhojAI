# KaamKhoj AI – Multi-Language Voice-Powered Job Assistance Platform

**KaamKhoj AI** is an AI-powered employment assistant that helps users (especially daily-wage workers) create their job profiles using voice instead of typing.  
The system supports **English, Hindi, and Marathi**, automatically extracts information from speech, builds user profiles, and recommends suitable jobs.

This project is built using **React, Node.js, Express, MongoDB**, and **Gemini/Ollama AI**.

---

## Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution Overview](#-solution-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [AI Assistant Workflow](#-ai-assistant-workflow)
- [API Endpoints](#-api-endpoints)
- [Installation & Setup](#-installation--setup)
- [Folder Structure](#-folder-structure)
- [Future Enhancements](#-future-enhancements)
- [License](#license)

---

## Problem Statement

Daily-wage workers (drivers, cooks, cleaners, guards, helpers…) struggle with:

- Filling complex forms
- English-only job portals
- Low digital literacy
- Difficulty showcasing skills
- Finding jobs that match their experience, age, shift, and salary needs

**Most do not type well — but they can speak naturally.**

---

## Solution Overview

**KaamKhoj AI** uses a multi-language voice assistant to:

1. Listen to the user
2. Extract data using AI (Gemini/Ollama)
3. Auto-fill a job profile
4. Store in MongoDB
5. Recommend top 5 matching jobs

The assistant re-asks, validates data, avoids repeated triggers, and provides a natural conversation experience.

---

## Key Features

### Voice-Based Profile Creation

**AI extracts:**
- Name, Age, Address, Phone, Experience, Job Type, Shift Preference, Salary Expectation

**Supports:** English, Hindi, Marathi

**Features:**
- Retries incorrect input
- Smart prompts

### Job Recommendation Engine

**Matches jobs based on:**
- Job title
- Minimum age
- Shift availability (day/night/flexible)
- Experience
- Salary expectation

### Job Management

**Admin can:**
- Add jobs
- Edit jobs
- Categorize jobs (driver, cook, security, etc.)
- Manage salary ranges

### Authentication

- JWT-based login
- Auto-linking profiles
- Worker profile + user profile support

### Multi-Language Interface

**Frontend fully supports:**  
English | Hindi | Marathi

---

## System Architecture

```
               ┌────────────────────────┐
               │        Frontend         │
               │  React + Tailwind CSS   │
               │  Voice UI + i18Next     │
               └────────────┬────────────┘
                            │
                     Web Speech API
                            │
                            ▼
               ┌────────────────────────┐
               │       AI Processor      │
               │ Gemini / Ollama Model   │
               │ Field Extraction Logic  │
               └────────────┬────────────┘
                            │
                            ▼
               ┌────────────────────────┐
               │       Backend API       │
               │ Node.js + Express       │
               │ User & Job Controllers  │
               └────────────┬────────────┘
                            │
                            ▼
                   MongoDB Database
          (User Profiles, Jobs, Recommendations)
```

---

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- i18Next (multi-language)
- Web Speech API (voice recognition)
- Axios

### Backend
- Node.js
- Express.js
- Mongoose

### Database
- MongoDB Atlas / Local MongoDB

### AI / NLP
- Google Gemini API
- Ollama (local LLM option)
- Regex-based fallback extractor

---

## AI Assistant Workflow (Step-by-Step)

1. User clicks mic → speaks a response
2. **Web Speech API** converts audio → text
3. Frontend sends text to backend:
   ```
   POST /api/voice/process
   ```
4. AI extracts fields like:
   ```json
   {
     "success": true,
     "extractedValue": "Pratham"
   }
   ```
5. Frontend updates **"Captured Fields"** section live
6. After all fields collected → submitted to:
   ```
   POST /api/auth/create-profile
   ```
7. Backend generates job recommendations
8. AI speaks results + navigates user to Jobs page

---

## API Endpoints

### 1. Voice AI Processing

**POST** `/api/voice/process`  
Extracts specific field from spoken text.

### 2. Create Worker Profile

**POST** `/api/auth/create-profile`

**Example body:**
```json
{
  "name": "John Doe",
  "age": 25,
  "address": "Nagpur",
  "phone": "0123456789",
  "shift_time": "flexible",
  "experience": 2,
  "job_title": "driver",
  "salary_expectation": 20000
}
```

### 3. Job APIs

| Method | Route            | Description       |
|--------|------------------|-------------------|
| GET    | `/api/jobs`      | Fetch all jobs    |
| POST   | `/api/jobs`      | Add a new job     |
| PUT    | `/api/jobs/:id`  | Update job        |
| DELETE | `/api/jobs/:id`  | Remove job        |

---

## Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/prathampmp23/kaamkhojAI
cd kaamkhoj
```

### 2. Backend Setup
```bash
cd backend
npm install
```

**Create `.env`:**
```env
MONGO_URI=your_connection_string
GEMINI_API_KEY=your_api_key
JWT_SECRET=your_secret
PORT=5000
```

**Start server:**
```bash
node server.js
```

### 3. Seed Jobs (Optional)
```bash
node seedJobs.js
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm start
```

---

## Folder Structure

```
kaamkhoj/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── seedJobs.js
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── i18n/
│   │   └── AiAssistantPage.jsx
│   └── public/
│
└── README.md
```

---

## Future Enhancements

- Document verification (Aadhaar/PAN)
- Worker trust rating system
- Employer dashboard panel
- GPS-based nearby job recommendations
- WhatsApp conversational bot version
- Resume builder auto-generated from voice
- Multiple user roles (Admin/Employer/Worker)

---

<!-- ## License -->

