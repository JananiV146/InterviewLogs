# InterviewLog Setup Guide

## Prerequisites
- Node.js v16+ and npm
- MongoDB Atlas account (free tier) or local MongoDB
- Mailtrap account (for OTP email testing)

## 1. Backend Setup

### Step 1: Environment Variables
Navigate to `backend/` and create `.env`:
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your values:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/interviewlog?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_in_production
PORT=5000
NODE_ENV=development

SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your_mailtrap_username
SMTP_PASS=your_mailtrap_api_token
SMTP_FROM=noreply@interviewlog.local

COLLEGE_EMAIL_DOMAINS=college.edu,university.edu,iit.ac.in

ADMIN_EMAIL=admin@college.edu
FRONTEND_URL=http://localhost:5173
```

**Where to get these:**
- **MongoDB**: https://www.mongodb.com/cloud/atlas (free tier, create cluster, get connection string)
- **Mailtrap**: https://mailtrap.io/ (sign up, create project, copy SMTP details)
- **JWT_SECRET**: Use any long random string (e.g., `openssl rand -hex 32`)

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Seed Sample Data (Optional)
To populate the database with 3 sample experiences:
```bash
npm run seed
```

### Step 4: Run Backend
```bash
npm run dev
```

Backend will start on `http://localhost:5000`

You'll see:
```
MongoDB connected
Backend running on port 5000
```

## 2. Frontend Setup

### Step 1: Environment Variables
Navigate to `frontend/` and create `.env`:
```bash
cd frontend
cp .env.example .env
```

Edit `.env`:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

If backend is deployed, update the URL accordingly.

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Run Frontend
```bash
npm run dev
```

Frontend will start on `http://localhost:5173`

## 3. Testing the Application

### Login Flow
1. Open http://localhost:5173
2. Click "Browse Experiences" to see seeded data
3. Click "Share Your Experience" → redirects to login
4. Enter a college email (e.g., `student@college.edu`)
5. Check Mailtrap inbox for OTP
6. Enter OTP in the form
7. Submit an experience

### Admin Panel
1. Login with a college email
2. In MongoDB Compass or shell, update your user role:
   ```javascript
   db.users.updateOne(
     { email: 'your@email.com' },
     { $set: { role: 'admin' } }
   )
   ```
3. Go to http://localhost:5173/admin
4. Approve/reject pending experiences

## 4. API Testing (Postman/Insomnia)

### Health Check
```
GET http://localhost:5000/api/health
```

### Request OTP
```
POST http://localhost:5000/api/auth/request-otp
Content-Type: application/json

{
  "email": "student@college.edu"
}
```

### Verify OTP (check Mailtrap for actual OTP)
```
POST http://localhost:5000/api/auth/verify-otp
Content-Type: application/json

{
  "email": "student@college.edu",
  "code": "123456"
}
```

### List Experiences
```
GET http://localhost:5000/api/experiences?company=Google&difficulty=hard&page=1&limit=10
```

### Create Experience (requires JWT token from login)
```
POST http://localhost:5000/api/experiences
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "company": "Meta",
  "role_title": "SDE Intern",
  "difficulty": "hard",
  "prep_tips": "Study DP and graphs heavily.",
  "is_anonymous": true,
  "tags": ["dsa", "intern"],
  "rounds": [
    {
      "round_order": 1,
      "round_type": "phone",
      "summary": "45-min coding round",
      "questions": [
        {
          "question_text": "Valid Parentheses",
          "question_type": "dsa",
          "answer_brief": "Use stack"
        }
      ]
    }
  ]
}
```

### Get All Tags
```
GET http://localhost:5000/api/experiences/tags
```

## 5. Troubleshooting

### MongoDB Connection Error
- Verify connection string in `.env`
- Check MongoDB Atlas firewall settings (add your IP)
- Ensure database user has read/write permissions

### OTP Not Sending
- Check Mailtrap credentials in `.env`
- Verify SMTP_HOST and SMTP_PORT are correct
- Check backend logs for email errors

### Frontend Can't Reach Backend
- Ensure backend is running on port 5000
- Check CORS is enabled (should be in server.js)
- Verify `VITE_API_BASE_URL` in frontend `.env`

### JWT Token Errors
- Clear localStorage in browser (DevTools → Application → Storage)
- Login again
- Check `JWT_SECRET` matches between frontend and backend

## 6. Deployment

### Backend
1. Deploy to Render/Fly/Railway
2. Set environment variables in platform settings
3. Update MongoDB Atlas IP allowlist

### Frontend
1. Build: `npm run build`
2. Deploy to Vercel/Netlify
3. Update `VITE_API_BASE_URL` to production backend URL

## Next Steps

- Add more sample experiences via API
- Customize CSS in `frontend/src/App.css` and `index.css`
- Implement upvotes/comments (optional)
- Add spam detection and email verification
- Set up analytics

## Support

- Check backend logs for API errors
- Check browser console (F12) for frontend errors
- Verify all env variables are correctly set

Happy coding! 🚀
