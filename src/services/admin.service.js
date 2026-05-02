const User = require('../models/User.model');
const Appointment = require('../models/Appointment.model');
const DoctorProfile = require('../models/DoctorProfile.model');

const getAllUsers = async () => {
  return await User.find().select('-password').sort({ createdAt: -1 });
};

const getReports = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [
    totalAppointments,
    todayAppointments,
    weekAppointments,
    pendingCount,
    confirmedCount,
    completedCount,
    cancelledCount,
    totalDoctors,
    totalPatients
  ] = await Promise.all([
    Appointment.countDocuments(),
    Appointment.countDocuments({ dateTime: { $gte: today, $lt: tomorrow } }),
    Appointment.countDocuments({ dateTime: { $gte: weekAgo } }),
    Appointment.countDocuments({ status: 'pending' }),
    Appointment.countDocuments({ status: 'confirmed' }),
    Appointment.countDocuments({ status: 'completed' }),
    Appointment.countDocuments({ status: 'cancelled' }),
    User.countDocuments({ role: 'doctor' }),
    User.countDocuments({ role: 'patient' })
  ]);

  return {
    appointments: {
      total: totalAppointments,
      today: todayAppointments,
      thisWeek: weekAppointments,
      byStatus: { pending: pendingCount, confirmed: confirmedCount, completed: completedCount, cancelled: cancelledCount }
    },
    users: {
      doctors: totalDoctors,
      patients: totalPatients
    }
  };
};

const deleteUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  if (user.role === 'admin') throw new Error('Cannot delete an admin account');
  await User.findByIdAndDelete(userId);
  if (user.role === 'doctor') {
    await DoctorProfile.findOneAndDelete({ user: userId });
  }
  return { message: 'User deleted successfully' };
};

module.exports = { getAllUsers, getReports, deleteUser };
