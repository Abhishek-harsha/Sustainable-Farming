"""
Sustainability Score Model.
Calculates a farm's sustainability score (0-100) based on multiple factors.
"""
import numpy as np


# Weights for each sustainability factor
WEIGHTS = {
    'water_efficiency': 0.30,
    'organic_fertilizer_usage': 0.25,
    'crop_rotation': 0.25,
    'soil_health': 0.20
}


def calculate_sustainability_score(water_efficiency, organic_fertilizer_usage, crop_rotation, soil_health):
    """
    Calculate sustainability score from 0-100.

    Parameters:
        water_efficiency (float): 0-100 rating of water usage efficiency
        organic_fertilizer_usage (float): 0-100 rating of organic fertilizer usage
        crop_rotation (float): 0-100 rating of crop rotation practices
        soil_health (float): 0-100 rating of soil health

    Returns:
        dict: sustainability score breakdown
    """
    # Clamp inputs to 0-100
    inputs = {
        'water_efficiency': max(0, min(100, float(water_efficiency))),
        'organic_fertilizer_usage': max(0, min(100, float(organic_fertilizer_usage))),
        'crop_rotation': max(0, min(100, float(crop_rotation))),
        'soil_health': max(0, min(100, float(soil_health)))
    }

    # Weighted score
    score = sum(inputs[k] * WEIGHTS[k] for k in WEIGHTS)
    score = round(score, 1)

    # Determine grade
    if score >= 80:
        grade = 'A'
        label = 'Excellent'
    elif score >= 60:
        grade = 'B'
        label = 'Good'
    elif score >= 40:
        grade = 'C'
        label = 'Average'
    elif score >= 20:
        grade = 'D'
        label = 'Below Average'
    else:
        grade = 'F'
        label = 'Poor'

    # Factor-level breakdown
    breakdown = {
        factor: {
            'value': inputs[factor],
            'weight': WEIGHTS[factor],
            'contribution': round(inputs[factor] * WEIGHTS[factor], 1)
        }
        for factor in WEIGHTS
    }

    # Improvement suggestions
    suggestions = []
    if inputs['water_efficiency'] < 60:
        suggestions.append('Consider implementing drip irrigation or rainwater harvesting to improve water efficiency.')
    if inputs['organic_fertilizer_usage'] < 60:
        suggestions.append('Increase use of compost and organic fertilizers to reduce chemical dependency.')
    if inputs['crop_rotation'] < 60:
        suggestions.append('Practice seasonal crop rotation to improve soil nutrients and reduce pests.')
    if inputs['soil_health'] < 60:
        suggestions.append('Conduct regular soil tests and add organic matter to enhance soil health.')

    return {
        'sustainability_score': score,
        'grade': grade,
        'label': label,
        'breakdown': breakdown,
        'suggestions': suggestions
    }


if __name__ == '__main__':
    result = calculate_sustainability_score(75, 80, 65, 70)
    print(f"Test score: {result}")
