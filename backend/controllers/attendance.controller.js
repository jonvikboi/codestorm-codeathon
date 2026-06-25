const supabase = require('../services/supabase');
const { sendAttendanceWebhook } = require('../services/webhook');

// Initialize a Supabase Realtime channel for broadcasting
const realtimeChannel = supabase.channel('attendance_updates');
realtimeChannel.subscribe((status) => {
  if (status === 'SUBSCRIBED') {
    console.log('✅ Supabase Realtime connected for Attendance Broadcasts');
  }
});

const broadcastUpdate = (action, payload) => {
  realtimeChannel.send({
    type: 'broadcast',
    event: 'attendance_changed',
    payload: { action, data: payload }
  });
};

const createAttendance = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { subject, present_classes, total_classes } = req.body;

    const { data: attendance, error } = await supabase
      .from('attendance')
      .insert([
        { student_id: studentId, subject, present_classes, total_classes }
      ])
      .select()
      .single();

    if (error) throw error;

    // Trigger n8n webhook
    sendAttendanceWebhook({
      action: 'created',
      studentName: req.user.name,
      studentEmail: req.user.email,
      subject,
      present_classes,
      total_classes
    });

    // Broadcast via Realtime
    broadcastUpdate('create', attendance);

    res.status(201).json({
      success: true,
      message: 'Attendance record created successfully',
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

const getAttendance = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const { data: attendance, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Attendance records retrieved successfully',
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

const getAttendanceById = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;

    const { data: attendance, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('id', id)
      .eq('student_id', studentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: 'Attendance record not found', data: {} });
      }
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Attendance record retrieved successfully',
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

const updateAttendance = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;
    const updates = req.body;

    const { data: attendance, error } = await supabase
      .from('attendance')
      .update(updates)
      .eq('id', id)
      .eq('student_id', studentId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: 'Attendance record not found', data: {} });
      }
      throw error;
    }

    sendAttendanceWebhook({
      action: 'updated',
      studentName: req.user.name,
      studentEmail: req.user.email,
      ...updates
    });

    broadcastUpdate('update', attendance);

    res.status(200).json({
      success: true,
      message: 'Attendance record updated successfully',
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAttendance = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;

    const { data: attendance, error } = await supabase
      .from('attendance')
      .delete()
      .eq('id', id)
      .eq('student_id', studentId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: 'Attendance record not found', data: {} });
      }
      throw error;
    }

    sendAttendanceWebhook({
      action: 'deleted',
      studentName: req.user.name,
      studentEmail: req.user.email,
      deletedId: id
    });

    broadcastUpdate('delete', { id });

    res.status(200).json({
      success: true,
      message: 'Attendance record deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAttendance,
  getAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
};
