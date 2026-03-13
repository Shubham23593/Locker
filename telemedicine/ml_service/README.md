# Telemedicine ML Service

## Setup
```bash
pip install -r requirements.txt
python train_model.py  # Train the model first
python app.py          # Start the Flask server (port 5001)
```

## Endpoints

### `GET /health`
Returns service and model status.

### `POST /predict`
Predict consultation duration and specialization.

**Request:**
```json
{
  "age": 45,
  "symptoms": "chest pain shortness of breath",
  "emergency_level": 4,
  "visit_type": "checkup",
  "previous_visits": 2
}
```

**Response:**
```json
{
  "predicted_duration": 25,
  "predicted_category": "Cardiologist",
  "confidence": 0.87
}
```

### `POST /train`
Retrains the model on fresh synthetic data and reloads it in memory.
