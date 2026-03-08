"""
Flask AI Microservice for Sustainable Farming Platform.
Provides crop recommendations and sustainability score calculations.
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from models.crop_model import predict_crop, train_model
from models.sustainability_model import calculate_sustainability_score

app = Flask(__name__)
CORS(app)


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({'status': 'ok', 'service': 'AI Recommendation Service'})


@app.route('/recommend-crop', methods=['POST'])
def recommend_crop():
    """
    Recommend the best crop based on environmental conditions.

    Expected JSON body:
    {
        "temperature": 25,
        "humidity": 70,
        "ph": 6.5,
        "rainfall": 200
    }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400

        required_fields = ['temperature', 'humidity', 'ph', 'rainfall']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        result = predict_crop(
            temperature=float(data['temperature']),
            humidity=float(data['humidity']),
            ph=float(data['ph']),
            rainfall=float(data['rainfall'])
        )

        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/sustainability-score', methods=['POST'])
def sustainability_score():
    """
    Calculate sustainability score from farming practices.

    Expected JSON body:
    {
        "water_efficiency": 75,
        "organic_fertilizer_usage": 80,
        "crop_rotation": 65,
        "soil_health": 70
    }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400

        result = calculate_sustainability_score(
            water_efficiency=float(data.get('water_efficiency', 50)),
            organic_fertilizer_usage=float(data.get('organic_fertilizer_usage', 50)),
            crop_rotation=float(data.get('crop_rotation', 50)),
            soil_health=float(data.get('soil_health', 50))
        )

        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    # Train the crop model on startup
    print("🌱 Training crop recommendation model...")
    train_model()
    print("🚀 Starting AI Service on port 5001...")
    app.run(host='0.0.0.0', port=5001, debug=True)
