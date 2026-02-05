import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Target, Activity, Calendar, BarChart3, PieChart, LineChart } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Performance = () => {
  const { user } = useAuth();
  const [performance, setPerformance] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all'); // 'week', 'month', 'semester', 'all'

  useEffect(() => {
    fetchPerformance();
  }, [selectedPeriod]);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/performance/student/${user.user_id}`);
      setPerformance(response.data.data || []);
      calculateStats(response.data.data || []);
    } catch (error) {
      console.error('Error fetching performance:', error);
      // Demo data
      const demoData = [
        {
          performance_id: 1,
          activity_name: 'Basketball Team',
          attendance_rate: 95,
          skill_level: 'Advanced',
          achievements: 'Tournament Winner, Best Player Award',
          feedback: 'Excellent performance and leadership skills',
          rating: 5,
          recorded_date: '2025-01-15'
        },
        {
          performance_id: 2,
          activity_name: 'Robotics Club',
          attendance_rate: 88,
          skill_level: 'Intermediate',
          achievements: 'Regional Competition Finalist',
          feedback: 'Great technical skills, needs improvement in teamwork',
          rating: 4,
          recorded_date: '2025-01-10'
        },
        {
          performance_id: 3,
          activity_name: 'Drama Club',
          attendance_rate: 92,
          skill_level: 'Advanced',
          achievements: 'Lead Role in Annual Play',
          feedback: 'Outstanding acting and stage presence',
          rating: 5,
          recorded_date: '2025-01-05'
        }
      ];
      setPerformance(demoData);
      calculateStats(demoData);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    if (data.length === 0) {
      setStats({
        averageAttendance: 0,
        averageRating: 0,
        totalAchievements: 0,
        activitiesCount: 0
      });
      return;
    }

    const avgAttendance = data.reduce((sum, p) => sum + p.attendance_rate, 0) / data.length;
    const avgRating = data.reduce((sum, p) => sum + p.rating, 0) / data.length;
    const totalAchievements = data.reduce((sum, p) => {
      return sum + (p.achievements ? p.achievements.split(',').length : 0);
    }, 0);

    setStats({
      averageAttendance: avgAttendance.toFixed(1),
      averageRating: avgRating.toFixed(1),
      totalAchievements,
      activitiesCount: data.length
    });
  };

  const getSkillLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-yellow-100 text-yellow-800';
      case 'intermediate': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-green-100 text-green-800';
      case 'expert': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Analytics</h1>
          <p className="text-gray-600">Track your progress and achievements</p>
        </div>

        {/* Period Filter */}
        <div className="mb-6 flex gap-2">
          {['week', 'month', 'semester', 'all'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stats.averageAttendance}%</span>
              </div>
              <h3 className="text-gray-600 font-medium">Average Attendance</h3>
              <p className="text-sm text-gray-500 mt-1">Across all activities</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stats.averageRating}</span>
              </div>
              <h3 className="text-gray-600 font-medium">Average Rating</h3>
              <p className="text-sm text-gray-500 mt-1">Out of 5 stars</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stats.totalAchievements}</span>
              </div>
              <h3 className="text-gray-600 font-medium">Total Achievements</h3>
              <p className="text-sm text-gray-500 mt-1">Awards and recognitions</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stats.activitiesCount}</span>
              </div>
              <h3 className="text-gray-600 font-medium">Active Enrollments</h3>
              <p className="text-sm text-gray-500 mt-1">Current activities</p>
            </motion.div>
          </div>
        )}

        {/* Performance Chart Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Attendance Trend</h3>
              <LineChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Chart visualization coming soon</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Skill Distribution</h3>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <PieChart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Chart visualization coming soon</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Performance Details */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Activity Performance Details</h2>
          {performance.length > 0 ? (
            performance.map((perf, index) => (
              <motion.div
                key={perf.performance_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {perf.activity_name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSkillLevelColor(perf.skill_level)}`}>
                        {perf.skill_level}
                      </span>
                      <div className="flex items-center gap-1">
                        {getRatingStars(perf.rating)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 mb-1">Attendance</div>
                    <div className="text-2xl font-bold text-indigo-600">{perf.attendance_rate}%</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Achievements</h4>
                    <div className="flex flex-wrap gap-2">
                      {perf.achievements?.split(',').map((achievement, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded-lg text-xs font-medium"
                        >
                          🏆 {achievement.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Instructor Feedback</h4>
                    <p className="text-sm text-gray-600">{perf.feedback}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>Last updated: {new Date(perf.recorded_date).toLocaleDateString()}</span>
                  </div>
                  <button className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium">
                    View Details
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Performance Data Yet</h3>
              <p className="text-gray-600">
                Your performance data will appear here once you start participating in activities.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Performance;