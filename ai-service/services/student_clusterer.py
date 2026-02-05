import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

class StudentClusterer:
    """
    Clusters students using K-Means based on performance and engagement
    """
    
    def __init__(self):
        self.ready = True
        self.scaler = StandardScaler()
        self.n_clusters = 3  # High performers, Average, Needs support
    
    def is_ready(self):
        return self.ready
    
    def cluster(self, student_data):
        """
        Cluster students based on performance metrics
        
        Args:
            student_data: list of dicts with keys:
                - student_id: int
                - student_name: str
                - attendance_percentage: float
                - average_score: float
                - skill_level: str
        
        Returns:
            dict with cluster assignments
        """
        try:
            if len(student_data) < 3:
                # Not enough data for clustering, use simple grouping
                return self._simple_grouping(student_data)
            
            # Extract features
            features = []
            student_info = []
            
            for student in student_data:
                attendance = student.get('attendance_percentage', 0)
                score = student.get('average_score', 0)
                
                # Convert skill level to numeric
                skill_map = {'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4}
                skill_numeric = skill_map.get(student.get('skill_level', 'beginner'), 1)
                
                features.append([attendance, score, skill_numeric])
                student_info.append({
                    'student_id': student.get('student_id'),
                    'student_name': student.get('student_name'),
                    'attendance': attendance,
                    'score': score,
                    'skill_level': student.get('skill_level', 'beginner')
                })
            
            # Normalize features
            features_array = np.array(features)
            features_scaled = self.scaler.fit_transform(features_array)
            
            # Perform K-Means clustering
            n_clusters = min(self.n_clusters, len(student_data))
            kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
            cluster_labels = kmeans.fit_predict(features_scaled)
            
            # Organize students by cluster
            clusters = {}
            for i, label in enumerate(cluster_labels):
                cluster_name = f"cluster_{label}"
                if cluster_name not in clusters:
                    clusters[cluster_name] = []
                
                student_info[i]['cluster'] = int(label)
                clusters[cluster_name].append(student_info[i])
            
            # Analyze and name clusters
            cluster_descriptions = self._analyze_clusters(clusters, features_array, cluster_labels)
            
            return {
                'clusters': clusters,
                'descriptions': cluster_descriptions,
                'total_students': len(student_data),
                'n_clusters': n_clusters
            }
            
        except Exception as e:
            raise Exception(f"Clustering error: {str(e)}")
    
    def _simple_grouping(self, student_data):
        """Simple grouping when not enough data for clustering"""
        clusters = {
            'high_performers': [],
            'average_performers': [],
            'needs_support': []
        }
        
        for student in student_data:
            score = student.get('average_score', 0)
            attendance = student.get('attendance_percentage', 0)
            
            avg_metric = (score + attendance) / 2
            
            student_info = {
                'student_id': student.get('student_id'),
                'student_name': student.get('student_name'),
                'attendance': attendance,
                'score': score,
                'skill_level': student.get('skill_level', 'beginner')
            }
            
            if avg_metric >= 75:
                clusters['high_performers'].append(student_info)
            elif avg_metric >= 50:
                clusters['average_performers'].append(student_info)
            else:
                clusters['needs_support'].append(student_info)
        
        descriptions = {
            'high_performers': {
                'name': 'High Performers',
                'description': 'Students with excellent attendance and performance',
                'avg_score': np.mean([s['score'] for s in clusters['high_performers']]) if clusters['high_performers'] else 0,
                'avg_attendance': np.mean([s['attendance'] for s in clusters['high_performers']]) if clusters['high_performers'] else 0,
                'recommendations': 'Provide advanced challenges and leadership opportunities'
            },
            'average_performers': {
                'name': 'Average Performers',
                'description': 'Students with moderate performance and engagement',
                'avg_score': np.mean([s['score'] for s in clusters['average_performers']]) if clusters['average_performers'] else 0,
                'avg_attendance': np.mean([s['attendance'] for s in clusters['average_performers']]) if clusters['average_performers'] else 0,
                'recommendations': 'Encourage consistent practice and provide regular feedback'
            },
            'needs_support': {
                'name': 'Needs Support',
                'description': 'Students requiring additional attention and resources',
                'avg_score': np.mean([s['score'] for s in clusters['needs_support']]) if clusters['needs_support'] else 0,
                'avg_attendance': np.mean([s['attendance'] for s in clusters['needs_support']]) if clusters['needs_support'] else 0,
                'recommendations': 'Provide personalized support, mentoring, and intervention'
            }
        }
        
        return {
            'clusters': clusters,
            'descriptions': descriptions,
            'total_students': len(student_data),
            'n_clusters': 3
        }
    
    def _analyze_clusters(self, clusters, features, labels):
        """Analyze cluster characteristics and provide descriptions"""
        descriptions = {}
        
        for cluster_name, students in clusters.items():
            if not students:
                continue
            
            # Calculate cluster statistics
            cluster_idx = int(cluster_name.split('_')[1])
            cluster_features = features[labels == cluster_idx]
            
            avg_attendance = np.mean(cluster_features[:, 0])
            avg_score = np.mean(cluster_features[:, 1])
            avg_skill = np.mean(cluster_features[:, 2])
            
            # Determine cluster type
            combined_metric = (avg_attendance + avg_score) / 2
            
            if combined_metric >= 75:
                name = 'High Performers'
                description = 'Students with excellent attendance and performance'
                recommendations = 'Provide advanced challenges, leadership roles, and competition opportunities'
            elif combined_metric >= 50:
                name = 'Average Performers'
                description = 'Students with moderate performance and engagement'
                recommendations = 'Encourage consistent practice, provide regular feedback, and set achievable goals'
            else:
                name = 'Needs Support'
                description = 'Students requiring additional attention and resources'
                recommendations = 'Provide personalized support, one-on-one mentoring, and intervention strategies'
            
            descriptions[cluster_name] = {
                'name': name,
                'description': description,
                'avg_attendance': round(avg_attendance, 2),
                'avg_score': round(avg_score, 2),
                'avg_skill_level': round(avg_skill, 2),
                'student_count': len(students),
                'recommendations': recommendations
            }
        
        return descriptions