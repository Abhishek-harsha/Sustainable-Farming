"""
Crop Recommendation Model using Random Forest Classifier.
Predicts the best crop based on environmental conditions.
"""
import os
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score
import joblib

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'crop_rf_model.pkl')
ENCODER_PATH = os.path.join(os.path.dirname(__file__), 'crop_label_encoder.pkl')
DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'crop_data.csv')


def train_model():
    """Train the Random Forest model on crop data."""
    df = pd.read_csv(DATA_PATH)

    X = df[['temperature', 'humidity', 'ph', 'rainfall']]
    y = df['crop']

    # Encode crop labels
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)

    # Split and train
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42
    )

    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Crop model trained - Accuracy: {accuracy:.2%}")

    # Save model and encoder
    joblib.dump(model, MODEL_PATH)
    joblib.dump(le, ENCODER_PATH)
    print(f"Model saved to {MODEL_PATH}")

    return model, le


def load_model():
    """Load the trained model, training first if necessary."""
    if not os.path.exists(MODEL_PATH) or not os.path.exists(ENCODER_PATH):
        return train_model()
    model = joblib.load(MODEL_PATH)
    le = joblib.load(ENCODER_PATH)
    return model, le


def predict_crop(temperature, humidity, ph, rainfall):
    """Predict the best crop for given conditions."""
    model, le = load_model()
    features = np.array([[temperature, humidity, ph, rainfall]])
    prediction = model.predict(features)[0]
    probabilities = model.predict_proba(features)[0]
    confidence = float(max(probabilities))
    crop_name = le.inverse_transform([prediction])[0]

    # Get top 3 recommendations
    top_indices = np.argsort(probabilities)[::-1][:3]
    top_crops = [
        {"crop": le.inverse_transform([idx])[0], "confidence": round(float(probabilities[idx]), 3)}
        for idx in top_indices
    ]

    return {
        "recommended_crop": crop_name,
        "confidence": round(confidence, 3),
        "top_recommendations": top_crops
    }


if __name__ == '__main__':
    train_model()
    result = predict_crop(25, 70, 6.5, 200)
    print(f"Test prediction: {result}")
