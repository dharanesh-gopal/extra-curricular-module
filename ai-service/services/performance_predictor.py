import numpy as np
from datetime import datetime, timedelta

class PerformancePredictor:
    """
    Predicts future performance using trend analysis and simple neural network concepts
    """
    
    def __init__(self):
        self.ready = True
    
    def is_ready(self):
        return self.ready
    
    def predict(self, performance_data):
        """
        Predict future performance based on historical data
        
        Args:
            performance_data: list of dicts with keys:
                - score: float
                - evaluation_date: str
                - attendance_status: str (optional)
        
        Returns:
            dict with prediction results
        """
        try:
            if not performance_data:
                return {
                    'predicted_score': 0,
                    'trend': 'insufficient_data',
                    'confidence': 0,
                    'recommendations': 'Need more evaluation data for accurate prediction'
                }
            
            # Extract scores
            scores = [item.get('score', 0) for item in performance_data if item.get('score')]
            
            if len(scores) == 0:
                return {
                    'predicted_score': 0,
                    'trend': 'no_data',
                    'confidence': 0,
                    'recommendations': 'No performance scores available'
                }
            
            # Calculate statistics
            avg_score = np.mean(scores)
            recent_scores = scores[:3] if len(scores) >= 3 else scores
            recent_avg = np.mean(recent_scores)
            
            # Determine trend
            if len(scores) >= 2:
                if scores[0] > scores[-1] + 5:
                    trend = 'improving'
                    trend_factor = 1.05
                elif scores[0] < scores[-1] - 5:
                    trend = 'declining'
                    trend_factor = 0.95
                else:
                    trend = 'stable'
                    trend_factor = 1.0
            else:
                trend = 'insufficient_data'
                trend_factor = 1.0
            
            # Simple prediction using weighted average and trend
            predicted_score = (recent_avg * 0.6 + avg_score * 0.4) * trend_factor
            predicted_score = min(100, max(0, predicted_score))  # Clamp between 0-100
            
            # Calculate confidence based on data consistency
            if len(scores) >= 3:
                variance = np.var(scores)
                confidence = max(0.5, min(0.95, 1 - (variance / 1000)))
            else:
                confidence = 0.6
            
            # Generate recommendations
            recommendations = self._generate_recommendations(predicted_score, trend, recent_avg)
            
            # Estimate next evaluation date (30 days from now)
            next_date = (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')
            
            return {
                'predicted_score': round(predicted_score, 2),
                'trend': trend,
                'confidence': round(confidence, 4),
                'next_evaluation_date': next_date,
                'recommendations': recommendations,
                'current_average': round(avg_score, 2),
                'recent_average': round(recent_avg, 2)
            }
            
        except Exception as e:
            raise Exception(f"Performance prediction error: {str(e)}")
    
    def _generate_recommendations(self, predicted_score, trend, current_score):
        """Generate personalized recommendations"""
        recommendations = []
        
        if predicted_score >= 85:
            recommendations.append("Excellent performance! Consider advanced challenges.")
            recommendations.append("Encourage participation in competitions or leadership roles.")
        elif predicted_score >= 70:
            recommendations.append("Good performance. Continue current practice routine.")
            recommendations.append("Focus on consistency and gradual improvement.")
        elif predicted_score >= 50:
            recommendations.append("Moderate performance. Provide additional support and resources.")
            recommendations.append("Consider one-on-one coaching sessions.")
        else:
            recommendations.append("Needs significant improvement. Immediate intervention required.")
            recommendations.append("Develop personalized improvement plan with clear milestones.")
        
        if trend == 'declining':
            recommendations.append("⚠️ Declining trend detected. Investigate potential issues.")
            recommendations.append("Schedule meeting to discuss challenges and concerns.")
        elif trend == 'improving':
            recommendations.append("✅ Positive improvement trend. Maintain momentum!")
        
        return ' | '.join(recommendations)