import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Activity, Users, TrendingUp, Calendar,
  Award, DollarSign, LogOut, Menu, X, Bell, Search,
  BookOpen, Target, Sparkles, BarChart3
} from 'lucide-react';
import { enrollmentsAPI, activitiesAPI, paymentsAPI, aiAPI } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    totalEnrollments: 0,
    activeEnrollments: 0,
    totalPayments: 0,
    pendingPayments: 0,
  });
  const [activities, setActivities] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch activities
      const activitiesRes = await activitiesAPI.getAll({ limit: 6 });
      setActivities(activitiesRes.data.data.activities || []);

      // Fetch enrollment summary if student
      if (user.role === 'student') {
        const summaryRes = await enrollmentsAPI.getSummary(user.user_id);
        setStats(summaryRes.data.data || {});

        // Fetch AI recommendations
        try {
          const aiRes = await aiAPI.recommendActivities({ student_id: user.user_id });
          setAiInsights(aiRes.data.data);
        } catch (error) {
          console.log('AI service unavailable');
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  const ActivityCard = ({ activity }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer"
      onClick={() => navigate('/activities')}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{activity.activity_name}</h3>
          <p className="text-sm text-gray-500">{activity.department_name}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          activity.category === 'sports' ? 'bg-blue-100 text-blue-700' :
          activity.category === 'clubs' ? 'bg-purple-100 text-purple-700' :
          activity.category === 'technical' ? 'bg-green-100 text-green-700' :
          'bg-orange-100 text-orange-700'
        }`}>
          {activity.category}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          {activity.current_enrolled}/{activity.max_students} enrolled
        </span>
        <span className="font-semibold text-primary-600">
          ₹{activity.fee}
        </span>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40 shadow-lg"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">School ERP</h1>
              <p className="text-xs text-gray-500">v1.0.0</p>
            </div>
          </div>

          <nav className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary-50 text-primary-700 font-medium">
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </button>
            <button
              onClick={() => navigate('/activities')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Activity className="w-5 h-5" />
              Activities
            </button>
            <button
              onClick={() => navigate('/schedule')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Calendar className="w-5 h-5" />
              Schedule
            </button>
            <button
              onClick={() => navigate('/performance')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Award className="w-5 h-5" />
              Performance
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
              Analytics
            </button>
          </nav>

          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg p-4 text-white mb-4">
              <Sparkles className="w-6 h-6 mb-2" />
              <p className="text-sm font-medium">AI Insights Available</p>
              <p className="text-xs opacity-90">Get personalized recommendations</p>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Welcome back, {user?.name}!
                </h2>
                <p className="text-sm text-gray-500 capitalize">{user?.role} Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  icon={BookOpen}
                  title="Total Enrollments"
                  value={stats.total_enrollments || 0}
                  color="bg-gradient-to-br from-blue-500 to-blue-600"
                />
                <StatCard
                  icon={Target}
                  title="Active Activities"
                  value={stats.active_enrollments || 0}
                  color="bg-gradient-to-br from-green-500 to-green-600"
                />
                <StatCard
                  icon={DollarSign}
                  title="Total Paid"
                  value={`₹${stats.total_paid || 0}`}
                  color="bg-gradient-to-br from-purple-500 to-purple-600"
                />
                <StatCard
                  icon={TrendingUp}
                  title="Pending Payments"
                  value={`₹${stats.pending_payments || 0}`}
                  color="bg-gradient-to-br from-orange-500 to-orange-600"
                />
              </div>

              {/* Activities Grid */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Available Activities</h3>
                  <button
                    onClick={() => navigate('/activities')}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    View All →
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activities.slice(0, 6).map((activity) => (
                    <ActivityCard key={activity.activity_id} activity={activity} />
                  ))}
                </div>
              </div>

              {/* AI Insights */}
              {aiInsights && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                    <h3 className="text-lg font-bold text-gray-900">AI Recommendations</h3>
                  </div>
                  <p className="text-gray-700 mb-4">{aiInsights.reasoning}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {aiInsights.recommendations?.slice(0, 4).map((rec, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-4 border border-purple-200">
                        <p className="font-medium text-gray-900 capitalize">{rec.category}</p>
                        <p className="text-sm text-gray-600 mt-1">{rec.reason}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;