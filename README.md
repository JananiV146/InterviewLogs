# InterviewLog – Interview Experience Archive

A structured, anonymous platform for college students to record and view real interview experiences, enabling knowledge preservation and reuse across batches.

## 🎯 Features

- **Anonymous Submissions**: Share experiences without exposing identity
- **Company & Role Tagging**: Filter by company, job title, and difficulty
- **Detailed Rounds**: Capture phone, onsite, OA, HR rounds with specific questions
- **Preparation Tips**: Share practical advice learned from interviews
- **Search & Filtering**: Find relevant experiences quickly
- **Admin Moderation**: Optional review and approval workflow
- **College Email Authentication**: Secure sign-up restricted to college domains

## 🛠 Tech Stack

- **Frontend**: React 18 + Vite, React Router, Axios
- **Backend**: Node.js + Express, Mongoose, MongoDB
- **Auth**: Email OTP with JWT sessions
- **Database**: MongoDB (Atlas or local)
- **Deployment**: Vercel/Netlify (frontend), Render/Fly/Railway (backend)

## 📁 Project Structure

```
InterviewLog/
├── backend/
│   ├── src/
│   │   ├── models/        (User, AuthToken, Experience, ModerationLog)
│   │   ├── routes/        (auth, experiences, admin routes)
│   │   ├── controllers/   (auth, experience, admin logic)
│   │   ├── middleware/    (auth, role checks)
│   │   └── utils/         (OTP, email, validation)
│   ├── server.js          (Express app entry point)
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── pages/         (Home, Login, Experiences, Submit, Admin)
    │   ├── components/    (Navbar, etc.)
    │   ├── context/       (AuthContext)
    │   ├── hooks/         (useAuth)
    │   ├── utils/         (API client)
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    ├── vite.config.js
    └── .env.example
```

## 🚀 Getting Started

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with:
   - MongoDB URI (MongoDB Atlas or local)
   - JWT secret
   - SMTP credentials (for OTP emails)
   - Allowed college email domains

5. Start the backend:
   ```bash
   npm run dev
   ```

   Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with the API base URL (if backend is not on localhost:5000)

5. Start the frontend:
   ```bash
   npm run dev
   ```

   Frontend will run on `http://localhost:5173`

## 📡 API Endpoints

### Auth
- `POST /api/auth/request-otp` – Request OTP to email
- `POST /api/auth/verify-otp` – Verify OTP and login
- `POST /api/auth/logout` – Logout

### Experiences
- `GET /api/experiences` – List (with filters: company, role, difficulty, tag, q)
- `GET /api/experiences/:id` – Detail view
- `POST /api/experiences` – Create (auth required)
- `GET /api/experiences/tags` – List all tags

### Admin (role=admin)
- `GET /api/admin/pending` – View pending submissions
- `POST /api/admin/experiences/:id/approve` – Approve
- `POST /api/admin/experiences/:id/reject` – Reject with reason

## 🔐 Authentication Flow

1. User enters college email (domain validated)
2. OTP generated and sent via email (10-min expiry)
3. User enters OTP code
4. JWT token issued, stored in httpOnly cookie
5. Subsequent requests include token in Authorization header or cookie

**Anonymous Submissions**: User must be authenticated; set `is_anonymous: true` to hide identity in responses (user_id stored server-side for abuse tracking).

## 🗄 Database Schema

### Collections

**users**
- email (unique), name, college, role (student/admin)

**auth_tokens**
- email, otp_hash, expires_at, attempts, used

**experiences**
- user_id, is_anonymous, company, role_title, difficulty (easy/medium/hard)
- prep_tips, status (published/pending/rejected)
- rounds: [{round_order, round_type, summary, questions: [{question_text, question_type, answer_brief}]}]
- tags, timestamps

**moderation_logs**
- experience_id, admin_id, action (approve/reject/flag), reason

## 🎮 User Flows

### Visitor Flow
1. Browse home page → List experiences → Filter by company/role/difficulty → View detail

### Student Flow
1. Login with college email (OTP) → Browse experiences → Submit experience (choose anonymous) → Wait for admin approval

### Admin Flow
1. Login → Admin page → View pending submissions → Approve/Reject with reasoning

## 🔮 Future Enhancements

- **Upvotes & Comments**: Community engagement with moderation
- **Bookmarks & Collections**: Curated lists by company
- **CSV Export**: For placement office analytics
- **Spam Detection**: Rate limiting + keyword filtering
- **Analytics Dashboard**: Company popularity, difficulty trends
- **Resource Links**: Attach external prep resources
- **Interview Difficulty Predictor**: ML-based insights (optional)
- **Email Notifications**: Alerts for new experiences in saved companies

## 🛡 Security Considerations

- Email OTP rate limiting (max 3 attempts per 10 min)
- JWT tokens set to expire in 7 days
- User IDs hidden when `is_anonymous=true`
- Admin role enforced server-side
- MongoDB indexes on frequently filtered fields
- CORS restricted to frontend domain

## 🧪 Development Tips

- Use Postman/Insomnia to test API endpoints
- Check browser DevTools → Application → Cookies for JWT verification
- Admin users must be manually set in DB initially (`role: 'admin'`)
- Seed sample data for demo: add 5-10 experiences via API

## 📝 License

MIT

## 👥 Contributing

Feel free to fork, open issues, and submit PRs!

---

**Happy Interviewing!** 🚀
