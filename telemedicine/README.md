# Telemedicine Queue Optimization System

A full-stack web application for managing telemedicine queues with ML-based consultation duration prediction, priority scheduling, and real-time updates.

## Tech Stack

- **Frontend**: React.js, Plain CSS, React Router, Axios, Socket.io-client, Chart.js
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.io
- **ML Service**: Python Flask, Scikit-learn (RandomForestRegressor)

## Project Structure

```
telemedicine/
├── backend/                    # Node.js/Express API (port 5000)
│   ├── controllers/            # Route handlers
│   │   ├── authController.js   # Register, Login, GetMe
│   │   ├── queueController.js  # Queue management, sessions
│   │   ├── doctorController.js # Doctor status, profile
│   │   └── adminController.js  # Dashboard, simulation
│   ├── models/                 # Mongoose schemas
│   │   ├── User.js             # Base user with roles
│   │   ├── Patient.js          # Patient profile
│   │   ├── Doctor.js           # Doctor profile with specialization
│   │   └── Consultation.js     # Queue/consultation records
│   ├── routes/                 # Express routes
│   ├── services/               # Business logic
│   │   ├── queueService.js     # Priority scoring, aging, reassignment
│   │   └── mlService.js        # ML service client
│   ├── middleware/
│   │   └── auth.js             # JWT auth + role authorization
│   └── server.js               # App entry point
├── frontend/src/               # React app
│   ├── pages/
│   │   ├── Login.jsx           # Authentication
│   │   ├── Register.jsx        # Registration with role-specific fields
│   │   ├── patient/            # Patient views
│   │   │   ├── PatientDashboard.jsx
│   │   │   ├── JoinQueue.jsx
│   │   │   ├── ScheduleAppointment.jsx
│   │   │   └── Consultation.jsx
│   │   ├── doctor/
│   │   │   └── DoctorDashboard.jsx
│   │   └── admin/
│   │       ├── AdminDashboard.jsx
│   │       ├── Analytics.jsx
│   │       └── SimulationEngine.jsx
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── NotificationBar.jsx
│   └── services/
│       ├── api.js              # Axios instance
│       └── socket.js           # Socket.io client
└── ml_service/                 # Python Flask API (port 5001)
    ├── app.py                  # Flask server with predict endpoints
    ├── train_model.py          # Model training script
    └── requirements.txt
```

## Setup & Running

### Prerequisites

- Node.js 18+
- Python 3.9+
- MongoDB running locally (or provide MONGODB_URI)

### 1. Backend

```bash
cd telemedicine/backend
npm install
# Create .env with:
#   PORT=5000
#   MONGODB_URI=mongodb://localhost:27017/telemedicine
#   JWT_SECRET=your_secret_key
node server.js
```

### 2. ML Service

```bash
cd telemedicine/ml_service
pip install -r requirements.txt
python app.py
```

### 3. Frontend

```bash
cd telemedicine/frontend
npm install
npm start
```

## Roles & Features

### Patient
- Join live queue or book scheduled appointments
- ML-predicted doctor specialization based on symptoms
- Emergency level selection (1-5) with misuse warnings for levels 4-5
- Video call or chat consultation mode
- Real-time queue position and estimated wait time

### Doctor
- Active/Inactive status toggle
- Priority-sorted patient queue
- Start/End session with timer
- Timer highlights red when exceeding ML-predicted duration

### Admin
- Global queue monitor with all active doctors and patients
- Analytics dashboard (Chart.js: Bar, Pie, Line charts)
- FIFO vs Optimized queue simulation engine
- Real-time alerts for doctor inaction

## Queue Optimization

- **Priority Score**: `EmergencyLevel × 5 + WaitingTimeMinutes`
- **Aging Algorithm**: +1 priority every 5 minutes to prevent starvation
- **Doctor Inaction**: 3-minute timeout alerts admin and prompts doctor
- **Dynamic Recalculation**: Re-orders queue when actual duration exceeds prediction
- **Auto-Reassignment**: Patients reassigned when doctor goes offline
