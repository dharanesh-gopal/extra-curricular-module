import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Plus, Users, DollarSign, Calendar, MapPin, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { activitiesAPI, enrollmentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import EnrollmentForm from '../components/EnrollmentForm';

const Activities = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const categories = [
    { value: 'all', label: 'All Activities', color: 'gray' },
    { value: 'sports', label: 'Sports', color: 'blue' },
    { value: 'clubs', label: 'Clubs', color: 'purple' },
    { value: 'technical', label: 'Technical', color: 'green' },
    { value: 'social', label: 'Social', color: 'orange' },
    { value: 'skill_development', label: 'Skill Development', color: 'pink' },
  ];

  useEffect(() => {
    fetchActivities();
  }, [selectedCategory]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = selectedCategory !== 'all' ? { category: selectedCategory } : {};
      const response = await activitiesAPI.getAll(params);
      setActivities(response.data.data.activities || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = (activity) => {
    setSelectedActivity(activity);
    setShowEnrollmentForm(true);
  };

  const handleEnrollmentSuccess = () => {
    fetchActivities();
  };

  const filteredActivities = activities.filter(activity =>
    activity.activity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ActivityCard = ({ activity }) => {
    const availableSeats = activity.max_students - activity.current_enrolled;
    const isFull = availableSeats <= 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {activity.activity_name}
              </h3>
              <p className="text-sm text-gray-500">{activity.department_name}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              activity.category === 'sports' ? 'bg-blue-100 text-blue-700' :
              activity.category === 'clubs' ? 'bg-purple-100 text-purple-700' :
              activity.category === 'technical' ? 'bg-green-100 text-green-700' :
              activity.category === 'social' ? 'bg-orange-100 text-orange-700' :
              'bg-pink-100 text-pink-700'
            }`}>
              {activity.category.replace('_', ' ')}
            </span>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {activity.description || 'No description available'}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{activity.current_enrolled}/{activity.max_students}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span>₹{activity.fee}</span>
            </div>
            {activity.location && (
              <div className="flex items-center gap-2 text-sm text-gray-600 col-span-2">
                <MapPin className="w-4 h-4" />
                <span>{activity.location}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {user.role === 'student' && (
              <button
                onClick={() => handleEnroll(activity)}
                disabled={isFull}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  isFull
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {isFull ? 'Full' : 'Enroll Now'}
              </button>
            )}
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              Details
            </button>
          </div>

          {availableSeats > 0 && availableSeats <= 5 && (
            <p className="text-xs text-orange-600 mt-2 text-center">
              Only {availableSeats} seats left!
            </p>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Extracurricular Activities</h1>
              <p className="text-gray-600">Explore and enroll in activities</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No activities found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((activity) => (
              <ActivityCard key={activity.activity_id} activity={activity} />
            ))}
          </div>
        )}
      </div>

      {/* Enrollment Form Modal */}
      <AnimatePresence>
        {showEnrollmentForm && selectedActivity && (
          <EnrollmentForm
            activity={selectedActivity}
            onClose={() => {
              setShowEnrollmentForm(false);
              setSelectedActivity(null);
            }}
            onSuccess={handleEnrollmentSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Activities;