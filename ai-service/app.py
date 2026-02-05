from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import numpy as np
from services.dropout_predictor import DropoutPredictor
from services.performance_predictor import PerformancePredictor
from services.activity_recommender import ActivityRecommender
from services.student_clusterer import StudentClusterer

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize AI services
dropout_predictor = DropoutPredictor()
performance_predictor = PerformancePredictor()
activity_recommender = ActivityRecommender()
student_clusterer = StudentClusterer()

@app.route('/', methods=['GET'])
def home():
    """API home endpoint"""
    return jsonify({
        'success': True,
        'message': 'School ERP AI Service',
        'version': '1.0.0',
        'endpoints': {
            'dropout_prediction': '/predict-dropout',
            'performance_prediction': '/predict-performance',
            'activity_recommendation': '/recommend-activity',
            'student_clustering': '/cluster-students'
        }
    })

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'status': 'healthy',
        'service': 'AI Service',
        'models_loaded': {
            'dropout_predictor': dropout_predictor.is_ready(),
            'performance_predictor': performance_predictor.is_ready(),
            'activity_recommender': activity_recommender.is_ready(),
            'student_clusterer': student_clusterer.is_ready()
        }
    })

@app.route('/predict-dropout', methods=['POST'])
def predict_dropout():
    """
    Predict dropout risk for a student
    
    Expected input:
    {
        "student_data": {
            "attendance_percentage": float,
            "average_score": float,
            "total_sessions": int,
            "days_enrolled": int
        }
    }
    """
    try:
        data = request.get_json()
        student_data = data.get('student_data')
        
        if not student_data:
            return jsonify({
                'success': False,
                'message': 'student_data is required'
            }), 400
        
        # Predict dropout risk
        result = dropout_predictor.predict(student_data)
        
        return jsonify({
            'success': True,
            'prediction': result['prediction'],
            'confidence': result['confidence'],
            'risk_level': result['risk_level'],
            'factors': result['factors'],
            'recommended_actions': result['recommended_actions']
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/predict-performance', methods=['POST'])
def predict_performance():
    """
    Predict future performance for a student
    
    Expected input:
    {
        "performance_data": [
            {
                "score": float,
                "evaluation_date": str,
                "attendance_status": str
            }
        ]
    }
    """
    try:
        data = request.get_json()
        performance_data = data.get('performance_data')
        
        if not performance_data:
            return jsonify({
                'success': False,
                'message': 'performance_data is required'
            }), 400
        
        # Predict performance
        result = performance_predictor.predict(performance_data)
        
        return jsonify({
            'success': True,
            'predicted_score': result['predicted_score'],
            'trend': result['trend'],
            'confidence': result['confidence'],
            'next_evaluation_date': result.get('next_evaluation_date'),
            'recommendations': result.get('recommendations')
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/recommend-activity', methods=['POST'])
def recommend_activity():
    """
    Recommend activities for a student
    
    Expected input:
    {
        "student_id": int,
        "enrollment_history": [
            {
                "category": str,
                "avg_score": float
            }
        ]
    }
    """
    try:
        data = request.get_json()
        student_id = data.get('student_id')
        enrollment_history = data.get('enrollment_history', [])
        
        if not student_id:
            return jsonify({
                'success': False,
                'message': 'student_id is required'
            }), 400
        
        # Get recommendations
        result = activity_recommender.recommend(student_id, enrollment_history)
        
        return jsonify({
            'success': True,
            'recommendations': result['recommendations'],
            'reasoning': result['reasoning']
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/cluster-students', methods=['POST'])
def cluster_students():
    """
    Cluster students based on performance and engagement
    
    Expected input:
    {
        "student_data": [
            {
                "student_id": int,
                "student_name": str,
                "attendance_percentage": float,
                "average_score": float,
                "skill_level": str
            }
        ]
    }
    """
    try:
        data = request.get_json()
        student_data = data.get('student_data')
        
        if not student_data:
            return jsonify({
                'success': False,
                'message': 'student_data is required'
            }), 400
        
        # Cluster students
        result = student_clusterer.cluster(student_data)
        
        return jsonify({
            'success': True,
            'clusters': result['clusters'],
            'cluster_descriptions': result['descriptions']
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'message': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'message': 'Internal server error'
    }), 500

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5001))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    print('\n' + '='*50)
    print('🤖 School ERP AI Service Started')
    print('='*50)
    print(f'📍 Server running on: http://localhost:{port}')
    print(f'🌍 Environment: {os.getenv("FLASK_ENV", "development")}')
    print('='*50 + '\n')
    
    app.run(host='0.0.0.0', port=port, debug=debug)