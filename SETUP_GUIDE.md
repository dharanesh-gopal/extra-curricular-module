# 🚀 School ERP - Complete Setup Guide

This guide will help you set up and run the entire School ERP system locally.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/)
- **Python** (v3.9 or higher) - [Download](https://www.python.org/downloads/)
- **Git** - [Download](https://git-scm.com/)
- **VS Code** (recommended) - [Download](https://code.visualstudio.com/)

## 🗄️ Step 1: Database Setup

### 1.1 Start MySQL Server

```bash
# Windows
net start MySQL80

# macOS/Linux
sudo systemctl start mysql
```

### 1.2 Create Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE school_erp;

# Exit MySQL
exit;
```

### 1.3 Import Schema

```bash
# From project root directory
mysql -u root -p school_erp < database/schema.sql
```

### 1.4 Import Sample Data (Optional)

```bash
mysql -u root -p school_erp < database/seed.sql
```

## 🔧 Step 2: Backend Setup

### 2.1 Navigate to Backend Directory

```bash
cd backend
```

### 2.2 Install Dependencies

```bash
npm install
```

### 2.3 Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env file with your MySQL credentials
# Windows: notepad .env
# macOS/Linux: nano .env
```

Update the following in `.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=school_erp
JWT_SECRET=your-secret-key-change-this
PORT=5000
```

### 2.4 Start Backend Server

```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

✅ Backend should now be running on `http://localhost:5000`

## 🤖 Step 3: AI Service Setup

### 3.1 Navigate to AI Service Directory

```bash
cd ai-service
```

### 3.2 Create Virtual Environment (Recommended)

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3.3 Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 3.4 Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env file
```

Update the following in `.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=school_erp
FLASK_PORT=5001
```

### 3.5 Start AI Service

```bash
python app.py
```

✅ AI Service should now be running on `http://localhost:5001`

## 🎨 Step 4: Frontend Setup

### 4.1 Navigate to Frontend Directory

```bash
cd frontend
```

### 4.2 Install Dependencies

```bash
npm install
```

### 4.3 Configure Environment

```bash
# Copy example env file
cp .env.example .env
```

The default configuration should work:
```env
VITE_API_URL=http://localhost:5000
VITE_AI_URL=http://localhost:5001
```

### 4.4 Start Frontend Development Server

```bash
npm run dev
```

✅ Frontend should now be running on `http://localhost:5173`

## 🎯 Step 5: Access the Application

Open your browser and navigate to: `http://localhost:5173`

### Default Login Credentials

After importing seed data, you can login with:

**Admin Account:**
- Email: `admin@school.com`
- Password: `admin123`

**Teacher Account:**
- Email: `teacher@school.com`
- Password: `teacher123`

**Student Account:**
- Email: `student@school.com`
- Password: `student123`

## 🧪 Step 6: Verify Everything is Working

### Check Backend
```bash
curl http://localhost:5000/api/health
```

### Check AI Service
```bash
curl http://localhost:5001/health
```

### Check Frontend
Open `http://localhost:5173` in your browser

## 📁 Project Structure Overview

```
school-erp/
├── backend/           # Node.js/Express API
│   ├── controllers/   # Business logic
│   ├── routes/        # API routes
│   ├── middleware/    # Auth & validation
│   ├── config/        # Database config
│   └── server.js      # Entry point
│
├── frontend/          # React application
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── App.jsx      # Main app
│   └── package.json
│
├── ai-service/        # Python ML service
│   ├── services/      # ML models
│   ├── app.py         # Flask app
│   └── requirements.txt
│
└── database/          # SQL files
    ├── schema.sql     # Database schema
    └── seed.sql       # Sample data
```

## 🔍 Troubleshooting

### Database Connection Issues

**Error:** `ER_ACCESS_DENIED_ERROR`
- Check MySQL username and password in `.env`
- Ensure MySQL server is running

**Error:** `ER_BAD_DB_ERROR`
- Database doesn't exist, run: `CREATE DATABASE school_erp;`

### Port Already in Use

**Backend (Port 5000):**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

**Frontend (Port 5173):**
```bash
# Change port in vite.config.js
server: { port: 3000 }
```

### Python Dependencies Issues

```bash
# Upgrade pip
python -m pip install --upgrade pip

# Install dependencies one by one
pip install flask flask-cors python-dotenv
pip install numpy pandas scikit-learn
pip install tensorflow
```

### Node Modules Issues

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

## 🚀 Running All Services Together

### Option 1: Multiple Terminals

Open 3 separate terminals:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - AI Service:**
```bash
cd ai-service
python app.py
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

### Option 2: Using VS Code

1. Open project in VS Code
2. Use integrated terminal (Ctrl + `)
3. Split terminal into 3 panes
4. Run each service in separate pane

## 📊 Testing the System

### 1. Test Authentication
- Register a new user
- Login with credentials
- Verify JWT token is stored

### 2. Test Activities
- Browse available activities
- Create new activity (as teacher/admin)
- Enroll in activity (as student)

### 3. Test AI Features
- View dropout risk predictions
- Get activity recommendations
- Check performance forecasts

### 4. Test Dashboards
- Student dashboard: enrollments, payments, performance
- Teacher dashboard: activities, attendance, evaluations
- Admin dashboard: system overview, analytics

## 🎓 Next Steps

1. **Customize the System:**
   - Modify database schema for your needs
   - Add new features or modules
   - Customize UI theme and branding

2. **Deploy to Production:**
   - Set up production database
   - Configure environment variables
   - Deploy backend to Heroku/AWS
   - Deploy frontend to Vercel/Netlify
   - Deploy AI service to cloud

3. **Enhance Security:**
   - Change default passwords
   - Use strong JWT secrets
   - Enable HTTPS
   - Implement rate limiting
   - Add input sanitization

## 📞 Support

For issues or questions:
- Check the README.md file
- Review error logs in console
- Verify all services are running
- Check database connections

## 🎉 Success!

If you've reached this point and everything is working, congratulations! You now have a fully functional School ERP system with AI capabilities.

---

**Built with ❤️ for educational purposes**