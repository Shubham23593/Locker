# Telemedicine Queue Optimization System

A production-ready full-stack telemedicine application with ML-powered queue optimization.

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, React Router, Axios, Socket.io-client, Chart.js
- **Backend**: Node.js, Express.js, Socket.io, JWT Auth
- **Database**: MongoDB with Mongoose
- **ML Service**: Python Flask, Scikit-learn (RandomForestRegressor)

## Project Structure

```
telemedicine/
├── backend/          # Node.js/Express API server
├── frontend/         # React.js web application
└── ml_service/       # Python Flask ML prediction service
```

## Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- Python 3.9+

### 1. ML Service
```bash
cd ml_service
pip install -r requirements.txt
python train_model.py    # Train model first
python app.py            # Starts on port 5001
```

### 2. Backend
```bash
cd backend
cp .env.example .env     # Configure your MongoDB URI and JWT secret
npm install
npm run dev              # Starts on port 5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev              # Starts on port 5173
```

## System Features

### Roles
- **Patient**: Join live queue, book appointments, track status
- **Doctor**: Manage queue, toggle Active/Inactive, conduct sessions
- **Admin**: Monitor all queues, view analytics, run simulations

### Queue Optimization
- **ML-Predicted Duration**: RandomForestRegressor predicts consultation time
- **Priority Scheduling**: `PriorityScore = (EmergencyLevel × 5) × WaitingTime`
- **Aging Algorithm**: Every 5 min waiting adds +1 to priority score
- **Emergency Warning**: Levels 4-5 show strict UI warning
- **Dynamic Recalculation**: Real-time queue reordering if session exceeds prediction
- **Auto-Reassignment**: Patients reassigned if doctor goes inactive/offline
- **Stale Session Detection**: Alert admin if doctor doesn't start within 3 minutes

### Real-Time Features
- Socket.io notifications in all dashboards
- Live queue position updates
- Emergency alerts to admin
- Doctor status changes broadcast instantly

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get current user

### Consultations
- `POST /api/consultation/join` - Join live queue
- `POST /api/consultation/book` - Book appointment
- `GET /api/consultation/patient-queue` - Patient's queue status
- `GET /api/consultation/doctor-queue` - Doctor's queue
- `PUT /api/consultation/start/:id` - Start session
- `PUT /api/consultation/end/:id` - End session

### Doctors
- `PUT /api/doctor/status` - Toggle Active/Inactive
- `GET /api/doctor/list` - List doctors (filterable)

### Admin
- `GET /api/admin/dashboard` - Global stats
- `GET /api/admin/analytics` - Queue analytics
- `POST /api/admin/simulate` - Simulate queue performance
- `GET /api/admin/queues` - All active queues

### ML Service
- `POST /predict` - Predict duration & specialization
- `GET /health` - Health check
