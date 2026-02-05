import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, TrendingUp, Users, DollarSign, Calendar, 
  Download, Filter, PieChart, Activity, Award, Target 
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Analytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month'); // 'week', 'month', 'quarter', 'year'
  const [reportType, setReportType] = useState('overview'); // 'overview', 'enrollment', 'financial', 'performance'

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, reportType]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/analytics?range=${timeRange}&type=${reportType}`);
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Demo analytics data
      setAnalytics({
        overview: {
          totalStudents: 245,
          totalActivities: 18,
          totalEnrollments: 487,
          totalRevenue: 125000,
          averageAttendance: 87.5,
          completionRate: 92.3,
          growthRate: 15.2
        },
        enrollmentTrends: [
          { month: 'Jan', enrollments: 45, dropouts: 3 },
          { month: 'Feb', enrollments: 52, dropouts: 2 },
          { month: 'Mar', enrollments: 48, dropouts: 4 },
          { month: 'Apr', enrollments: 61, dropouts: 1 },
          { month: 'May', enrollments: 55, dropouts: 2 }
        ],
        categoryDistribution: [
          { category: 'Sports', count: 156, percentage: 32 },
          { category: 'Clubs', count: 142, percentage: 29 },
          { category: 'Technical', count: 118, percentage: 24 },
          { category: 'Arts', count: 71, percentage: 15 }
        ],
        topActivities: [
          { name: 'Basketball Team', enrollments: 45, revenue: 22500, rating: 4.8 },
          { name: 'Coding Bootcamp', enrollments: 42, revenue: 29400, rating: 4.9 },
          { name: 'Drama Club', enrollments: 38, revenue: 15200, rating: 4.7 },
          { name: 'Robotics Club', enrollments: 35, revenue: 35000, rating: 4.8 },
          { name: 'Music Band', enrollments: 32, revenue: 19200, rating: 4.6 }
        ],
        revenueBreakdown: {
          paid: 98500,
          pending: 18500,
          overdue: 8000
        },
        performanceMetrics: {
          excellentPerformers: 89,
          goodPerformers: 124,
          averagePerformers: 28,
          needsImprovement: 4
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    // Export functionality
    alert('Exporting report... (Feature coming soon)');
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Comprehensive insights and reports</p>
          </div>
          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex gap-2">
            <Filter className="w-5 h-5 text-gray-500 mt-2" />
            <div className="flex gap-2">
              {['week', 'month', 'quarter', 'year'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            {['overview', 'enrollment', 'financial', 'performance'].map((type) => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  reportType === type
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        {analytics && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white"
              >
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 opacity-80" />
                  <span className="text-3xl font-bold">{analytics.overview.totalStudents}</span>
                </div>
                <h3 className="font-semibold mb-1">Total Students</h3>
                <p className="text-sm opacity-80">Active participants</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white"
              >
                <div className="flex items-center justify-between mb-4">
                  <Activity className="w-8 h-8 opacity-80" />
                  <span className="text-3xl font-bold">{analytics.overview.totalActivities}</span>
                </div>
                <h3 className="font-semibold mb-1">Total Activities</h3>
                <p className="text-sm opacity-80">Available programs</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white"
              >
                <div className="flex items-center justify-between mb-4">
                  <Target className="w-8 h-8 opacity-80" />
                  <span className="text-3xl font-bold">{analytics.overview.totalEnrollments}</span>
                </div>
                <h3 className="font-semibold mb-1">Total Enrollments</h3>
                <p className="text-sm opacity-80">All time registrations</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white"
              >
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-8 h-8 opacity-80" />
                  <span className="text-3xl font-bold">₹{(analytics.overview.totalRevenue / 1000).toFixed(0)}K</span>
                </div>
                <h3 className="font-semibold mb-1">Total Revenue</h3>
                <p className="text-sm opacity-80">Collected fees</p>
              </motion.div>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Average Attendance</h3>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {analytics.overview.averageAttendance}%
                </div>
                <p className="text-sm text-gray-600">Across all activities</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Completion Rate</h3>
                  <Award className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {analytics.overview.completionRate}%
                </div>
                <p className="text-sm text-gray-600">Successfully completed</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Growth Rate</h3>
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  +{analytics.overview.growthRate}%
                </div>
                <p className="text-sm text-gray-600">Month over month</p>
              </motion.div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Enrollment Trends */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Enrollment Trends</h3>
                  <BarChart3 className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-4">
                  {analytics.enrollmentTrends.map((trend, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <span className="text-sm font-medium text-gray-600 w-12">{trend.month}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-indigo-600 h-2 rounded-full"
                              style={{ width: `${(trend.enrollments / 70) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{trend.enrollments}</span>
                        </div>
                        {trend.dropouts > 0 && (
                          <span className="text-xs text-red-600">-{trend.dropouts} dropouts</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Category Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Category Distribution</h3>
                  <PieChart className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-4">
                  {analytics.categoryDistribution.map((cat, index) => {
                    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500'];
                    return (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">{cat.category}</span>
                          <span className="text-sm font-semibold text-gray-900">{cat.percentage}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`${colors[index]} h-2 rounded-full`}
                              style={{ width: `${cat.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">{cat.count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* Top Activities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="bg-white rounded-xl shadow-sm p-6 mb-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Activities</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Activity</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Enrollments</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Revenue</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topActivities.map((activity, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">{activity.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-sm text-gray-900">{activity.enrollments}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-sm font-semibold text-green-600">₹{activity.revenue.toLocaleString()}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-sm font-semibold text-yellow-600">★ {activity.rating}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Revenue & Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Paid</span>
                    <span className="text-lg font-bold text-green-600">
                      ₹{analytics.revenueBreakdown.paid.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Pending</span>
                    <span className="text-lg font-bold text-yellow-600">
                      ₹{analytics.revenueBreakdown.pending.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Overdue</span>
                    <span className="text-lg font-bold text-red-600">
                      ₹{analytics.revenueBreakdown.overdue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Performance Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Distribution</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Excellent</span>
                    <span className="text-lg font-bold text-green-600">
                      {analytics.performanceMetrics.excellentPerformers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Good</span>
                    <span className="text-lg font-bold text-blue-600">
                      {analytics.performanceMetrics.goodPerformers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Average</span>
                    <span className="text-lg font-bold text-yellow-600">
                      {analytics.performanceMetrics.averagePerformers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Needs Improvement</span>
                    <span className="text-lg font-bold text-red-600">
                      {analytics.performanceMetrics.needsImprovement}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Analytics;