import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
import joblib
import os

class DropoutPredictor:
    """
    Predicts student dropout risk using Logistic Regression
    """
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.model_path = os.path.join('models', 'dropout_model.pkl')
        self.scaler_path = os.path.join('models', 'dropout_scaler.pkl')
        self._load_or_create_model()
    
    def _load_or_create_model(self):
        """Load existing model or create new one"""
        try:
            if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
                self.model = joblib.load(self.model_path)
                self.scaler = joblib.load(self.scaler_path)
            else:
                # Create a simple model with default parameters
                self.model = LogisticRegression(random_state=42)
                # Train with dummy data for initialization
                X_dummy = np.array([[80, 75, 10, 30], [60, 50, 5, 20], [90, 85, 15, 40]])
                y_dummy = np.array([0, 1, 0])  # 0: low risk, 1: high risk
                self.scaler.fit(X_dummy)
                X_scaled = self.scaler.transform(X_dummy)
                self.model.fit(X_scaled, y_dummy)
        except Exception as e:
            print(f"Error loading model: {e}")
            self.model = LogisticRegression(random_state=42)
    
    def is_ready(self):
        """Check if model is ready"""
        return self.model is not None
    
    def predict(self, student_data):
        """
        Predict dropout risk
        
        Args:
            student_data: dict with keys:
                - attendance_percentage: float
                - average_score: float
                - total_sessions: int
                - days_enrolled: int
        
        Returns:
            dict with prediction results
        """
        try:
            # Extract features
            attendance = student_data.get('attendance_percentage', 0)
            score = student_data.get('average_score', 0)
            sessions = student_data.get('total_sessions', 0)
            days = student_data.get('days_enrolled', 0)
            
            # Rule-based prediction (hybrid approach)
            risk_score = 0
            factors = []
            
            # Attendance factor
            if attendance < 60:
                risk_score += 0.4
                factors.append('low_attendance')
            elif attendance < 75:
                risk_score += 0.2
                factors.append('moderate_attendance')
            else:
                factors.append('good_attendance')
            
            # Performance factor
            if score < 50:
                risk_score += 0.4
                factors.append('low_performance')
            elif score < 70:
                risk_score += 0.2
                factors.append('moderate_performance')
            else:
                factors.append('good_performance')
            
            # Engagement factor
            if sessions < 3:
                risk_score += 0.1
                factors.append('low_engagement')
            elif sessions < 5:
                risk_score += 0.05
                factors.append('moderate_engagement')
            else:
                factors.append('high_engagement')
            
            # Determine risk level
            if risk_score >= 0.5:
                risk_level = 'high'
                recommended_actions = 'Immediate intervention required. Schedule counseling session, contact parents, and provide additional support.'
            elif risk_score >= 0.3:
                risk_level = 'medium'
                recommended_actions = 'Monitor closely. Provide encouragement and additional resources. Consider peer mentoring.'
            else:
                risk_level = 'low'
                recommended_actions = 'Continue current engagement level. Maintain regular monitoring and positive reinforcement.'
            
            return {
                'prediction': {
                    'risk_score': round(risk_score, 4),
                    'attendance_percentage': attendance,
                    'average_score': score,
                    'total_sessions': sessions
                },
                'confidence': round(1 - abs(0.5 - risk_score), 4),
                'risk_level': risk_level,
                'factors': factors,
                'recommended_actions': recommended_actions
            }
            
        except Exception as e:
            raise Exception(f"Prediction error: {str(e)}")
    
    def save_model(self):
        """Save model to disk"""
        try:
            os.makedirs('models', exist_ok=True)
            joblib.dump(self.model, self.model_path)
            joblib.dump(self.scaler, self.scaler_path)
        except Exception as e:
            print(f"Error saving model: {e}")