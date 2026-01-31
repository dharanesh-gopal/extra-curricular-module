# 🎓 Intelligent School ERP - Extracurricular Activities Module

A production-ready, AI-powered School ERP system for managing sports, clubs, and extracurricular activities with role-based access, payments, attendance tracking, and intelligent predictions.

## 🚀 Features

### Core Functionality
- **Activity Management**: Create and manage sports, clubs, technical, and social activities
- **Enrollment Workflow**: Student requests, teacher approvals, seat management
- **Payment System**: Fee tracking, payment status, receipt generation
- **Attendance Tracking**: Session-based attendance with duration tracking
- **Performance Evaluation**: Skill levels, scores, remarks, certificate eligibility
- **Smart Notifications**: Real-time updates for enrollments, payments, and attendance

### AI/ML Capabilities
- **Dropout Risk Prediction**: Identify at-risk students using classification models
- **Performance Forecasting**: Neural network-based trend analysis
- **Activity Recommendations**: Personalized suggestions using hybrid filtering
- **Student Clustering**: Group students by skill level and engagement
- **Rule-Based Intelligence**: Automated eligibility and certificate qualification

### User Roles
- **Students**: Browse, enroll, pay, track attendance and performance
- **Teachers/Coaches**: Create activities, approve enrollments, mark attendance, evaluate performance
- **Administrators**: System-wide management, analytics, AI insights

## 🛠️ Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS
- Framer Motion (animations)
- React Router v6
- Axios
- Lucide React (icons)
- Recharts (analytics)

### Backend
- Node.js & Express.js
- MySQL (mysql2)
- JWT Authentication
- bcrypt
- dotenv

### AI/ML Layer
- Python 3.9+
- Flask/FastAPI
- scikit-learn
- TensorFlow/Keras
- pandas & numpy

## 📁 Project Structure

```
school-erp/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── context/         # React context
│   │   ├── utils/           # Utility functions
│   │   └── App.jsx          # Main app component
│   ├── package.json
│   └── vite.config.js
│
├── backend/                  # Node.js API
│   ├── routes/              # API routes
│   ├── controllers/         # Business logic
│   ├── models/              # Database models
│   ├── middleware/          # Auth & validation
│   ├── config/              # Configuration
│   ├── server.js            # Entry point
│   └── package.json
│
├── ai-service/              # Python ML service
│   ├── models/              # Trained models
│   ├── services/            # ML services
│   ├── train.py             # Model training
│   ├── predict.py           # Prediction logic
│   ├── app.py               # Flask/FastAPI app
│   └── requirements.txt
│
├── database/                # Database files
│   ├── schema.sql           # Database schema
│   └── seed.sql             # Sample data
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MySQL 8.0+
- Python 3.9+
- VS Code (recommended)

### 1. Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE school_erp;

# Import schema
mysql -u root -p school_erp < database/schema.sql

# (Optional) Import sample data
mysql -u root -p school_erp < database/seed.sql
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your MySQL credentials
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=yourpassword
# DB_NAME=school_erp
# JWT_SECRET=your-secret-key
# PORT=5000

# Start backend server
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. AI Service Setup

```bash
cd ai-service
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env with your MySQL credentials

# Train initial models (optional)
python train.py

# Start AI service
python app.py
```

AI service will run on `http://localhost:5001`

### 4. Frontend Setup

```bash
cd frontend
npm install

# Create .env file
cp .env.example .env

# Edit .env
# VITE_API_URL=http://localhost:5000
# VITE_AI_URL=http://localhost:5001

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

## 👥 Default Users

After running seed data:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@school.com | admin123 |
| Teacher | teacher@school.com | teacher123 |
| Student | student@school.com | student123 |

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Activities
- `GET /api/activities` - List all activities
- `POST /api/activities` - Create activity (Teacher/Admin)
- `PUT /api/activities/:id/approve` - Approve activity (Admin)

### Enrollments
- `POST /api/enrollments` - Enroll in activity
- `PUT /api/enrollments/:id/status` - Update enrollment status

### Payments
- `POST /api/payments` - Process payment
- `GET /api/payments/:studentId` - Get student payments

### Attendance
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance/:activityId` - Get activity attendance

### Performance
- `POST /api/performance` - Add performance record
- `GET /api/performance/:studentId` - Get student performance

### AI Predictions
- `POST /api/ai/predict/dropout` - Predict dropout risk
- `POST /api/ai/recommend/activities` - Get activity recommendations
- `POST /api/ai/predict/performance` - Predict performance trends
- `POST /api/ai/cluster/students` - Cluster students by behavior

## 🤖 AI Models

### 1. Dropout Risk Prediction (Logistic Regression)
Analyzes attendance, performance, and engagement to predict dropout risk.

### 2. Performance Forecasting (ANN)
Neural network predicting future performance trends based on historical data.

### 3. Activity Recommendation (Hybrid Filtering)
Combines content-based and collaborative filtering for personalized suggestions.

### 4. Student Clustering (K-Means)
Groups students by skill level and engagement patterns.

### 5. Rule-Based Engine
Automated eligibility checks and certificate qualification.

## 🎨 UI Features

- Modern, responsive design with Tailwind CSS
- Smooth animations with Framer Motion
- Interactive charts and analytics
- Real-time notifications
- Dark mode support
- Mobile-friendly interface
- Advanced data tables with sorting and filtering
- Beautiful card layouts
- Icon-rich interface with Lucide React

## 📊 Database Schema

Key tables:
- `users` - User accounts and roles
- `departments` - Activity departments
- `activities` - Extracurricular activities
- `activity_schedule` - Activity schedules
- `enrollments` - Student enrollments
- `payments` - Payment records
- `attendance` - Attendance tracking
- `performance` - Performance evaluations
- `ai_predictions` - AI prediction logs

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- SQL injection prevention
- CORS configuration
- Environment variable protection

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# AI service tests
cd ai-service
pytest
```

## 📝 Development

### Code Style
- ESLint for JavaScript/React
- Prettier for formatting
- PEP 8 for Python

### Git Workflow
```bash
git checkout -b feature/your-feature
git commit -m "Add your feature"
git push origin feature/your-feature
```

## 🚀 Deployment

### Backend
- Deploy to Heroku, AWS, or DigitalOcean
- Use PM2 for process management
- Configure environment variables

### Frontend
- Build: `npm run build`
- Deploy to Vercel, Netlify, or AWS S3

### AI Service
- Deploy to AWS Lambda, Google Cloud Functions, or dedicated server
- Use Docker for containerization

## 📚 Documentation

- API documentation: `/backend/docs/API.md`
- Database schema: `/database/SCHEMA.md`
- AI models: `/ai-service/docs/MODELS.md`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

Built for academic demonstration and portfolio purposes.

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@schoolerp.com

## 🎓 Academic Use

This project is designed for:
- Final year projects
- HR demonstrations
- Technical vivas
- Portfolio showcases
- Learning full-stack development with AI integration

---

**Built with ❤️ using React, Node.js, MySQL, and Python**