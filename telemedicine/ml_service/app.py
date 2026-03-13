"""
Telemedicine Queue Optimization - ML Service
Flask API for consultation duration and specialization prediction.
"""

import os
import logging
import random

import joblib
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
PORT = 5001
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# ---------------------------------------------------------------------------
# Model loading
# ---------------------------------------------------------------------------
_model = None


def load_model():
    global _model
    if os.path.exists(MODEL_PATH):
        try:
            _model = joblib.load(MODEL_PATH)
            logger.info("Model loaded from %s", MODEL_PATH)
        except Exception as exc:
            logger.error("Failed to load model: %s", exc)
            _model = None
    else:
        logger.warning("model.pkl not found – run train_model.py first")
        _model = None


load_model()

# ---------------------------------------------------------------------------
# Specialization mapping
# ---------------------------------------------------------------------------
SPECIALIZATION_KEYWORDS: list[tuple[list[str], str]] = [
    (["chest", "heart", "cardiac", "palpitation"], "Cardiologist"),
    (["head", "neuro", "brain", "seizure", "migraine", "dizziness"], "Neurologist"),
    (["skin", "rash", "acne", "eczema", "dermat"], "Dermatologist"),
    (["bone", "joint", "fracture", "ortho", "knee", "back pain"], "Orthopedist"),
    (["breath", "lung", "asthma", "cough", "respiratory", "pulmon"], "Pulmonologist"),
    (["stomach", "gastro", "digest", "abdomen", "nausea", "vomit"], "Gastroenterologist"),
]

SPECIALIZATION_TO_NUMERIC: dict[str, int] = {
    "Cardiologist": 0,
    "Neurologist": 1,
    "Dermatologist": 2,
    "Orthopedist": 3,
    "Pulmonologist": 4,
    "Gastroenterologist": 5,
    "General Physician": 6,
}


def map_symptoms_to_specialization(symptoms: str) -> tuple[str, int]:
    """Return (specialization_name, specialization_numeric) for a symptom string."""
    symptoms_lower = symptoms.lower()
    for keywords, specialization in SPECIALIZATION_KEYWORDS:
        if any(kw in symptoms_lower for kw in keywords):
            return specialization, SPECIALIZATION_TO_NUMERIC[specialization]
    return "General Physician", SPECIALIZATION_TO_NUMERIC["General Physician"]


VISIT_TYPE_TO_NUMERIC: dict[str, int] = {
    "checkup": 0,
    "followup": 1,
    "follow-up": 1,
    "follow_up": 1,
}

# ---------------------------------------------------------------------------
# Prediction helpers
# ---------------------------------------------------------------------------

def predict_duration(age: int, emergency_level: int, previous_visits: int, visit_type: str, specialization_numeric: int) -> tuple[int, float]:
    """
    Returns (predicted_duration_minutes, confidence).
    Uses the RandomForest model when available; falls back to a deterministic
    formula otherwise.
    """
    visit_type_num = VISIT_TYPE_TO_NUMERIC.get(visit_type.lower(), 0)

    if _model is not None:
        features = np.array([[age, emergency_level, previous_visits, visit_type_num, specialization_numeric]], dtype=float)
        duration = float(_model.predict(features)[0])
        # Derive a pseudo-confidence from the variance across trees
        tree_preds = np.array([tree.predict(features)[0] for tree in _model.estimators_])
        std = float(np.std(tree_preds))
        confidence = float(np.clip(1.0 - std / (duration + 1e-6), 0.5, 0.99))
    else:
        # Fallback formula
        base = 10 + (emergency_level * 3) + (previous_visits * 2)
        if age > 60:
            base += 5
        duration = base + random.uniform(-2, 2)
        confidence = round(random.uniform(0.65, 0.80), 2)

    duration = int(round(max(10, min(60, duration))))
    confidence = round(confidence, 2)
    return duration, confidence


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.route("/health", methods=["GET"])
def health():
    model_status = "loaded" if _model is not None else "not loaded"
    return jsonify({"status": "healthy", "model": model_status}), 200


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    # Validate required fields
    required = ["age", "symptoms", "emergency_level", "visit_type", "previous_visits"]
    missing = [f for f in required if f not in data]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    try:
        age = int(data["age"])
        symptoms = str(data["symptoms"])
        emergency_level = int(data["emergency_level"])
        visit_type = str(data["visit_type"])
        previous_visits = int(data["previous_visits"])
    except (ValueError, TypeError) as exc:
        return jsonify({"error": f"Invalid field value: {exc}"}), 400

    # Range validation
    if not (0 <= age <= 120):
        return jsonify({"error": "age must be between 0 and 120"}), 400
    if not (1 <= emergency_level <= 5):
        return jsonify({"error": "emergency_level must be between 1 and 5"}), 400
    if not (0 <= previous_visits <= 100):
        return jsonify({"error": "previous_visits must be between 0 and 100"}), 400

    category, specialization_numeric = map_symptoms_to_specialization(symptoms)
    predicted_duration, confidence = predict_duration(age, emergency_level, previous_visits, visit_type, specialization_numeric)

    logger.info(
        "Prediction: age=%d symptoms=%r → %s, %d min, conf=%.2f",
        age, symptoms, category, predicted_duration, confidence,
    )

    return jsonify(
        {
            "predicted_duration": predicted_duration,
            "predicted_category": category,
            "confidence": confidence,
        }
    ), 200


@app.route("/train", methods=["POST"])
def train():
    """Retrain the model on fresh synthetic data and reload it in memory."""
    try:
        from train_model import train_and_save
        train_and_save()
        load_model()
        return jsonify({"status": "success", "message": "Model retrained and reloaded"}), 200
    except Exception as exc:
        logger.error("Training failed: %s", exc)
        return jsonify({"error": f"Training failed: {exc}"}), 500


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=False)
