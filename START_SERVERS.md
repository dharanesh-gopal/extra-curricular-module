# 🚀 Quick Start Guide - Running All Services

## ⚠️ IMPORTANT: Prerequisites

Before running the servers, ensure you have:

1. **MySQL Server Running**
   - Start MySQL service
   - Database `school_erp` created
   - Schema imported: `mysql -u root -p school_erp < database/schema.sql`
   - (Optional) Sample data: `mysql -u root -p school_erp < database/seed.sql`

2. **Update .env files** with your MySQL password if needed:
   - `backend/.env` - Update `DB_PASSWORD`
   - `ai-service/.env` - Update `DB_PASSWORD`

## 🎯 Running the Services

### Option 1: Run Each Service in Separate Terminals

#### Terminal 1 - Backend API (Port 5000)
```bash
cd backend
npm run dev
```
Wait for: "✅ Database connected successfully" and "🚀 School ERP API Server Started"

#### Terminal 2 - AI Service (Port 5001)
```bash
cd ai-service
pip install -r requirements.txt
python app.py
```
Wait for: "🤖 School ERP AI Service Started"

#### Terminal 3 - Frontend (Port 5173)
```bash
cd frontend
npm run dev
```
Wait for: "Local: http://localhost:5173/"

### Option 2: Using VS Code Split Terminal

1. Open VS Code integrated terminal (Ctrl + `)
2. Click the split terminal button (⊞) twice to create 3 terminals
3. Run each service in a separate terminal pane

## ✅ Verify Services Are Running

1. **Backend**: http://localhost:5000/api/health
2. **AI Service**: http://localhost:5001/health
3. **Frontend**: http://localhost:5173

## 🎓 Login Credentials (After importing seed data)

- **Admin**: admin@school.com / admin123
- **Teacher**: teacher@school.com / teacher123
- **Student**: student@school.com / student123

## 🐛 Troubleshooting

### Backend won't start
- Check MySQL is running
- Verify database exists: `SHOW DATABASES;`
- Check .env file has correct credentials

### AI Service errors
- Install Python dependencies: `pip install -r requirements.txt`
- Check Python version: `python --version` (need 3.9+)

### Frontend won't start
- Clear node_modules: `rm -rf node_modules && npm install`
- Check ports 5173 is available

### Database connection errors
- Verify MySQL credentials in .env files
- Test connection: `mysql -u root -p`
- Check if database exists

## 📊 What to Expect

Once all services are running:

1. **Frontend** opens automatically at http://localhost:5173
2. You'll see a beautiful login page with gradient background
3. Use quick login buttons or enter credentials
4. After login, you'll see:
   - Modern animated dashboard
   - Statistics cards
   - Available activities
   - AI-powered recommendations (if AI service is running)

## 🎨 Features to Test

### As Student:
- Browse activities
- Enroll in activities
- View enrollment status
- Check AI recommendations

### As Teacher:
- Create new activities
- Approve student enrollments
- Mark attendance
- Evaluate performance

### As Admin:
- Approve activities
- View system analytics
- Manage all aspects

## 🔥 Hot Tips

- All services support hot-reload (changes reflect automatically)
- Backend logs show all API requests
- Frontend has toast notifications for user feedback
- AI service has fallback if unavailable

---

**Enjoy your School ERP System! 🎓✨**