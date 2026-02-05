# ⚡ QUICK SETUP - School ERP System

## 🎯 Step-by-Step Setup (5 Minutes)

### Step 1: Start MySQL Server

**Windows:**
```bash
# Open Services (Win + R, type: services.msc)
# Find "MySQL80" or "MySQL" service
# Right-click → Start

# OR use Command Prompt as Administrator:
net start MySQL80
```

**Verify MySQL is running:**
```bash
mysql --version
```

### Step 2: Create Database

Open a new terminal and run:

```bash
# Login to MySQL (press Enter if no password)
mysql -u root -p

# In MySQL prompt, run:
CREATE DATABASE school_erp;
SHOW DATABASES;
exit;
```

### Step 3: Import Database Schema

```bash
# From project root directory
mysql -u root -p school_erp < database/schema.sql

# Import sample data (OPTIONAL but recommended for demo)
mysql -u root -p school_erp < database/seed.sql
```

### Step 4: Update Database Password (if you have one)

Edit these files if your MySQL has a password:

**backend/.env:**
```env
DB_PASSWORD=your_mysql_password_here
```

**ai-service/.env:**
```env
DB_PASSWORD=your_mysql_password_here
```

### Step 5: Start Backend Server

```bash
cd backend
npm run dev
```

**Expected Output:**
```
✅ Database connected successfully
🚀 School ERP API Server Started
📍 Server running on: http://localhost:5000
```

### Step 6: Start AI Service (New Terminal)

```bash
cd ai-service
pip install -r requirements.txt
python app.py
```

**Expected Output:**
```
🤖 School ERP AI Service Started
📍 Server running on: http://localhost:5001
```

### Step 7: Start Frontend (New Terminal)

```bash
cd frontend
npm run dev
```

**Expected Output:**
```
  VITE v5.0.8  ready in 500 ms
  ➜  Local:   http://localhost:5173/
```

### Step 8: Access the Application

Open browser: **http://localhost:5173**

**Login with:**
- Email: `student@school.com`
- Password: `student123`

OR use the quick login buttons on the login page!

---

## 🐛 Common Issues & Solutions

### Issue 1: "Database connection failed"
**Solution:**
1. Check MySQL is running: `mysql -u root -p`
2. Verify database exists: `SHOW DATABASES;`
3. Check password in `.env` files

### Issue 2: "Cannot find module"
**Solution:**
```bash
cd backend
rm -rf node_modules
npm install
```

### Issue 3: "Port already in use"
**Solution:**
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

### Issue 4: Python packages not found
**Solution:**
```bash
cd ai-service
pip install --upgrade pip
pip install -r requirements.txt
```

---

## ✅ Verification Checklist

- [ ] MySQL server is running
- [ ] Database `school_erp` exists
- [ ] Schema imported successfully
- [ ] Backend running on port 5000
- [ ] AI service running on port 5001
- [ ] Frontend running on port 5173
- [ ] Can access http://localhost:5173
- [ ] Can login successfully

---

## 🎓 What You'll See

### Login Page
- Beautiful gradient background
- Quick login buttons for demo
- Smooth animations

### Student Dashboard
- Statistics cards with your enrollments
- Available activities grid
- AI-powered recommendations
- Modern, responsive design

### Activities Page
- Browse all activities
- Filter by category
- Search functionality
- Enroll with one click

---

## 📞 Need Help?

1. Check all services are running
2. Verify database connection
3. Check console for errors
4. Review START_SERVERS.md for detailed guide

**The system is ready! Just follow the steps above.** 🚀