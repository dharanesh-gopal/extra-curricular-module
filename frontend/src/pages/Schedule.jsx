import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';

const Schedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('week'); // 'week' or 'month'

  useEffect(() => {
    fetchSchedules();
  }, [currentDate]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await api.get('/schedules');
      setSchedules(response.data.data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      // Demo data for schedule
      setSchedules([
        {
          schedule_id: 1,
          activity_name: 'Basketball Team',
          day_of_week: 'Monday',
          start_time: '16:00:00',
          end_time: '18:00:00',
          location: 'Main Sports Complex',
          instructor: 'Coach Mike'
        },
        {
          schedule_id: 2,
          activity_name: 'Drama Club',
          day_of_week: 'Tuesday',
          start_time: '15:00:00',
          end_time: '17:00:00',
          location: 'Auditorium',
          instructor: 'Ms. Sarah'
        },
        {
          schedule_id: 3,
          activity_name: 'Robotics Club',
          day_of_week: 'Wednesday',
          start_time: '16:00:00',
          end_time: '18:00:00',
          location: 'Tech Lab',
          instructor: 'Dr. Smith'
        },
        {
          schedule_id: 4,
          activity_name: 'Yoga & Fitness',
          day_of_week: 'Thursday',
          start_time: '17:00:00',
          end_time: '18:30:00',
          location: 'Yoga Hall',
          instructor: 'Instructor Jane'
        },
        {
          schedule_id: 5,
          activity_name: 'Music Band',
          day_of_week: 'Friday',
          start_time: '15:30:00',
          end_time: '17:30:00',
          location: 'Music Room',
          instructor: 'Mr. Johnson'
        },
        {
          schedule_id: 6,
          activity_name: 'Coding Bootcamp',
          day_of_week: 'Saturday',
          start_time: '10:00:00',
          end_time: '13:00:00',
          location: 'Computer Lab',
          instructor: 'Prof. Anderson'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const getSchedulesForDay = (day) => {
    return schedules.filter(s => s.day_of_week === day);
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getCategoryColor = (activityName) => {
    if (activityName.includes('Basketball') || activityName.includes('Yoga')) return 'bg-blue-500';
    if (activityName.includes('Drama') || activityName.includes('Music')) return 'bg-purple-500';
    if (activityName.includes('Robotics') || activityName.includes('Coding')) return 'bg-green-500';
    return 'bg-gray-500';
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Activity Schedule</h1>
          <p className="text-gray-600">View your weekly activity schedule</p>
        </div>

        {/* Calendar Controls */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateWeek(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => navigateWeek(1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="text-lg font-semibold text-gray-900">
                Week of {currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Weekly Schedule Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {daysOfWeek.map((day, index) => {
            const daySchedules = getSchedulesForDay(day);
            const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day;

            return (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-xl shadow-sm overflow-hidden ${
                  isToday ? 'ring-2 ring-indigo-500' : ''
                }`}
              >
                <div className={`p-4 ${isToday ? 'bg-indigo-600' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold ${isToday ? 'text-white' : 'text-gray-900'}`}>
                    {day}
                  </h3>
                  {isToday && (
                    <span className="text-xs text-indigo-200">Today</span>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  {daySchedules.length > 0 ? (
                    daySchedules.map((schedule) => (
                      <motion.div
                        key={schedule.schedule_id}
                        whileHover={{ scale: 1.02 }}
                        className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-300 transition-all cursor-pointer"
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <div className={`w-1 h-full ${getCategoryColor(schedule.activity_name)} rounded-full`}></div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm mb-1">
                              {schedule.activity_name}
                            </h4>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <MapPin className="w-3 h-3" />
                                <span>{schedule.location}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Users className="w-3 h-3" />
                                <span>{schedule.instructor}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No activities scheduled</p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Category Legend</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Sports</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Clubs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Technical</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Schedule;