import numpy as np
from sklearn.ensemble import RandomForestRegressor
import joblib


def generate_training_data(n_samples=500):
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


def train_and_save_model():
    X, y = generate_training_data()
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    joblib.dump(model, 'duration_model.joblib')
    print("Model trained and saved to 'duration_model.joblib'")
    return model


if __name__ == '__main__':
    train_and_save_model()
