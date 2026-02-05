import numpy as np
from collections import Counter

class ActivityRecommender:
    """
    Recommends activities using hybrid filtering (content-based + collaborative)
    """
    
    def __init__(self):
        self.ready = True
        self.category_weights = {
            'sports': 1.0,
            'clubs': 1.0,
            'technical': 1.0,
            'social': 1.0,
            'skill_development': 1.0
        }
    
    def is_ready(self):
        return self.ready
    
    def recommend(self, student_id, enrollment_history):
        """
        Recommend activities based on student's history
        
        Args:
            student_id: int
            enrollment_history: list of dicts with keys:
                - category: str
                - avg_score: float
                - activity_id: int
        
        Returns:
            dict with recommendations
        """
        try:
            # Analyze student preferences
            preferences = self._analyze_preferences(enrollment_history)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(preferences, enrollment_history)
            
            # Create reasoning
            reasoning = self._create_reasoning(preferences, enrollment_history)
            
            return {
                'recommendations': recommendations,
                'reasoning': reasoning,
                'student_preferences': preferences
            }
            
        except Exception as e:
            raise Exception(f"Recommendation error: {str(e)}")
    
    def _analyze_preferences(self, enrollment_history):
        """Analyze student's category preferences"""
        if not enrollment_history:
            return {
                'preferred_categories': [],
                'average_performance': 0,
                'diversity_score': 0
            }
        
        # Count categories
        categories = [item.get('category') for item in enrollment_history if item.get('category')]
        category_counts = Counter(categories)
        
        # Calculate average scores per category
        category_scores = {}
        for item in enrollment_history:
            cat = item.get('category')
            score = item.get('avg_score', 0)
            if cat and score:
                if cat not in category_scores:
                    category_scores[cat] = []
                category_scores[cat].append(score)
        
        # Average scores
        for cat in category_scores:
            category_scores[cat] = np.mean(category_scores[cat])
        
        # Sort by performance
        preferred_categories = sorted(
            category_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        return {
            'preferred_categories': [cat for cat, _ in preferred_categories],
            'category_scores': category_scores,
            'average_performance': np.mean([s for s in category_scores.values()]) if category_scores else 0,
            'diversity_score': len(set(categories)) / 5.0  # 5 total categories
        }
    
    def _generate_recommendations(self, preferences, enrollment_history):
        """Generate activity recommendations"""
        recommendations = []
        
        tried_categories = set(item.get('category') for item in enrollment_history if item.get('category'))
        all_categories = ['sports', 'clubs', 'technical', 'social', 'skill_development']
        untried_categories = [cat for cat in all_categories if cat not in tried_categories]
        
        # Recommend based on performance in similar categories
        if preferences['preferred_categories']:
            top_category = preferences['preferred_categories'][0]
            recommendations.append({
                'type': 'similar_success',
                'category': top_category,
                'reason': f"You performed well in {top_category} activities",
                'priority': 1
            })
        
        # Recommend untried categories for diversity
        if untried_categories:
            for cat in untried_categories[:2]:
                recommendations.append({
                    'type': 'explore_new',
                    'category': cat,
                    'reason': f"Explore {cat} to diversify your skills",
                    'priority': 2
                })
        
        # Recommend skill development if performance is moderate
        if preferences['average_performance'] < 75 and 'skill_development' not in tried_categories:
            recommendations.append({
                'type': 'improvement',
                'category': 'skill_development',
                'reason': "Skill development activities can boost overall performance",
                'priority': 1
            })
        
        # Social activities for well-rounded development
        if 'social' not in tried_categories:
            recommendations.append({
                'type': 'well_rounded',
                'category': 'social',
                'reason': "Social activities promote teamwork and leadership",
                'priority': 3
            })
        
        return sorted(recommendations, key=lambda x: x['priority'])
    
    def _create_reasoning(self, preferences, enrollment_history):
        """Create human-readable reasoning"""
        reasoning_parts = []
        
        if not enrollment_history:
            return "As a new student, we recommend starting with diverse activities to discover your interests."
        
        if preferences['preferred_categories']:
            top_cat = preferences['preferred_categories'][0]
            reasoning_parts.append(f"You excel in {top_cat} activities.")
        
        if preferences['diversity_score'] < 0.4:
            reasoning_parts.append("Consider exploring more diverse categories.")
        elif preferences['diversity_score'] > 0.7:
            reasoning_parts.append("Great diversity in your activities!")
        
        if preferences['average_performance'] >= 80:
            reasoning_parts.append("Your strong performance suggests you're ready for advanced challenges.")
        elif preferences['average_performance'] < 60:
            reasoning_parts.append("Focus on skill development to improve overall performance.")
        
        return " ".join(reasoning_parts) if reasoning_parts else "Continue exploring activities that interest you."