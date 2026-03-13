import os
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.ensemble import RandomForestRegressor
import joblib

app = Flask(__name__)
CORS(app)

SYMPTOM_SPECIALIZATION = {
    'chest pain': 'Cardiologist',
    'heart': 'Cardiologist',
    'palpitation': 'Cardiologist',
    'headache': 'Neurologist',
    'migraine': 'Neurologist',
    'seizure': 'Neurologist',
    'dizziness': 'Neurologist',
    'skin rash': 'Dermatologist',
    'acne': 'Dermatologist',
    'eczema': 'Dermatologist',
    'bone pain': 'Orthopedic',
    'fracture': 'Orthopedic',
    'joint pain': 'Orthopedic',
    'back pain': 'Orthopedic',
    'fever': 'General',
    'cold': 'General',
    'cough': 'General',
    'flu': 'General',
    'stomach pain': 'Gastroenterologist',
    'nausea': 'Gastroenterologist',
    'vomiting': 'Gastroenterologist',
    'diarrhea': 'Gastroenterologist',
    'eye pain': 'Ophthalmologist',
    'blurred vision': 'Ophthalmologist',
    'ear pain': 'ENT',
    'sore throat': 'ENT',
    'breathing difficulty': 'Pulmonologist',
    'asthma': 'Pulmonologist',
    'wheezing': 'Pulmonologist',
    'anxiety': 'Psychiatrist',
    'depression': 'Psychiatrist',
    'insomnia': 'Psychiatrist',
    'tooth pain': 'Dentist',
    'gum bleeding': 'Dentist',
    'pregnancy': 'Gynecologist',
    'menstrual': 'Gynecologist',
    'child fever': 'Pediatrician',
    'child cough': 'Pediatrician',
    'diabetes': 'Endocrinologist',
    'thyroid': 'Endocrinologist',
    'kidney pain': 'Nephrologist',
    'urination problem': 'Urologist',
}


def _generate_training_data(n_samples=500):
    np.random.seed(42)
    age = np.random.randint(18, 81, n_samples)
    symptom_severity = np.random.randint(1, 11, n_samples)
    emergency_level = np.random.randint(1, 6, n_samples)
    previous_visits = np.random.randint(0, 21, n_samples)

    base_time = 10
    age_factor = age * 0.1
    severity_factor = symptom_severity * 1.5
    emergency_factor = emergency_level * 2
    visit_factor = previous_visits * 0.5
    noise = np.random.uniform(-3, 3, n_samples)

    consultation_duration = (
        base_time + age_factor + severity_factor +
        emergency_factor + visit_factor + noise
    )

    X = np.column_stack([age, symptom_severity, emergency_level, previous_visits])
    y = consultation_duration
    return X, y


def _train_and_save_model():
    X, y = _generate_training_data()
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    joblib.dump(model, 'duration_model.joblib')
    return model


# Load or train model on startup
if os.path.exists('duration_model.joblib'):
    model = joblib.load('duration_model.joblib')
else:
    model = _train_and_save_model()


@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    age = data['age']
    symptoms = data['symptoms']
    emergency_level = data['emergencyLevel']
    previous_visits = data['previousVisits']

    symptom_severity = min(len(symptoms.split()), 10)

    features = np.array([[age, symptom_severity, emergency_level, previous_visits]])
    predicted_duration = model.predict(features)[0]

    return jsonify({
        'predictedDuration': round(predicted_duration),
        'unit': 'minutes'
    })


@app.route('/predict-specialization', methods=['POST'])
def predict_specialization():
    data = request.get_json()
    if not data or 'symptoms' not in data or not data['symptoms']:
        return jsonify({'specialization': 'General'})
    symptoms = data['symptoms'].lower()

    specialization = 'General'
    for keyword, spec in SYMPTOM_SPECIALIZATION.items():
        if keyword in symptoms:
            specialization = spec
            break

    return jsonify({'specialization': specialization})


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})


if __name__ == '__main__':
    app.run(port=5001, debug=True)
