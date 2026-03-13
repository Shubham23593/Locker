"""
Train and save the RandomForestRegressor model on synthetic telemedicine data.
Run this script before starting the Flask server.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error
import joblib
import os

RANDOM_SEED = 42
N_SAMPLES = 1000
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")


def generate_synthetic_data(n_samples: int = N_SAMPLES) -> pd.DataFrame:
    rng = np.random.default_rng(RANDOM_SEED)

    age = rng.integers(18, 81, size=n_samples).astype(float)
    emergency_level = rng.integers(1, 6, size=n_samples).astype(float)
    previous_visits = rng.integers(0, 11, size=n_samples).astype(float)
    visit_type_numeric = rng.integers(0, 2, size=n_samples).astype(float)  # 0=checkup, 1=followup
    specialization_numeric = rng.integers(0, 7, size=n_samples).astype(float)  # 0-6

    # Consultation duration correlated with features
    base_duration = (
        10
        + emergency_level * 3
        + previous_visits * 2
        + (age > 60).astype(float) * 5
        + visit_type_numeric * 3
        + specialization_numeric * 0.5
    )
    noise = rng.normal(0, 2, size=n_samples)
    consultation_duration = np.clip(base_duration + noise, 10, 60)

    return pd.DataFrame(
        {
            "age": age,
            "emergency_level": emergency_level,
            "previous_visits": previous_visits,
            "visit_type_numeric": visit_type_numeric,
            "specialization_numeric": specialization_numeric,
            "consultation_duration": consultation_duration,
        }
    )


def train_and_save(n_samples: int = N_SAMPLES) -> None:
    print(f"Generating {n_samples} synthetic training samples...")
    df = generate_synthetic_data(n_samples)

    feature_cols = ["age", "emergency_level", "previous_visits", "visit_type_numeric", "specialization_numeric"]
    X = df[feature_cols].values
    y = df["consultation_duration"].values

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=RANDOM_SEED)

    model = RandomForestRegressor(n_estimators=100, random_state=RANDOM_SEED, n_jobs=-1)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    r2 = r2_score(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)

    print(f"Model performance on held-out test set:")
    print(f"  R² score : {r2:.4f}")
    print(f"  MAE      : {mae:.4f} minutes")

    joblib.dump(model, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")


if __name__ == "__main__":
    train_and_save()
