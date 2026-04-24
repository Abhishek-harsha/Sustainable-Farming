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


@app.route('/test', methods=['GET'])
def test():
    return jsonify({'message': 'AI Service is reachable'})


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


@app.route('/generate-report', methods=['POST'])
def generate_report():
    """
    Generate a detailed AI sustainability report.
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400

        score = float(data.get('score', 50))
        breakdown = data.get('breakdown', {})
        
        report = {
            'executive_summary': f"Your farm has achieved a sustainability score of {score}/100. " + 
                                ( "You are leading the way in sustainable practices!" if score >= 80 else 
                                  "You are making steady progress toward a greener future." if score >= 60 else
                                  "There are significant opportunities to enhance your environmental impact."),
            'strengths': [],
            'weaknesses': [],
            'roadmap': [],
            'impact_projection': {
                'carbon_sequestration': f"+{round(score * 0.15, 1)}% improvement potential",
                'water_saving': f"{round((100 - breakdown.get('water_efficiency', {}).get('value', 50)) * 0.8, 1)}% further reduction possible",
                'soil_biodiversity': "High" if score > 75 else "Moderate" if score > 50 else "Low"
            }
        }

        for factor, details in breakdown.items():
            val = details.get('value', 50)
            factor_name = factor.replace('_', ' ').capitalize()
            if val >= 75:
                report['strengths'].append(f"Excellent {factor_name} management.")
            elif val < 50:
                report['weaknesses'].append(f"Low {factor_name} levels.")

        if breakdown.get('water_efficiency', {}).get('value', 50) < 70:
            report['roadmap'].append({'step': 1, 'action': 'Upgrade to Drip Irrigation', 'benefit': 'Reduces water waste by 40%.'})
        if breakdown.get('organic_fertilizer_usage', {}).get('value', 50) < 70:
            report['roadmap'].append({'step': 2, 'action': 'Incorporate Bio-Fertilizers', 'benefit': 'Enhances long-term soil fertility.'})
        if breakdown.get('crop_rotation', {}).get('value', 50) < 70:
            report['roadmap'].append({'step': 3, 'action': 'Diversify Crop Portfolio', 'benefit': 'Prevents pest cycles and soil depletion.'})

        return jsonify(report)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    # Train the crop model on startup
    print("Training crop recommendation model...")
    train_model()
    print("Starting AI Service on port 5001...")
    app.run(host='0.0.0.0', port=5001, debug=True)
