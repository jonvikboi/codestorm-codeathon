const supabase = require('../services/supabase');
const { sendTaskWebhook } = require('../services/webhook');

// Initialize a Supabase Realtime channel for broadcasting
const realtimeChannel = supabase.channel('task_updates');
realtimeChannel.subscribe((status) => {
  if (status === 'SUBSCRIBED') {
    console.log('✅ Supabase Realtime connected for Task Broadcasts');
  }
});

const broadcastUpdate = (action, payload) => {
  realtimeChannel.send({
    type: 'broadcast',
    event: 'task_changed',
    payload: { action, data: payload }
  });
};

const createTask = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { title, description, subject, deadline, priority } = req.body;

    const { data: task, error } = await supabase
      .from('task')
      .insert([
        { student_id: studentId, title, description, subject, deadline, priority }
      ])
      .select()
      .single();

    if (error) throw error;

    // Trigger n8n webhook asynchronously
    sendTaskWebhook({
      action: 'created',
      studentName: req.user.name,
      studentPhone: req.user.phone,
      title,
      subject,
      deadline,
      priority
    });

    // Broadcast via Realtime
    broadcastUpdate('create', task);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    // Sort by nearest deadline
    const { data: task, error } = await supabase
      .from('task')
      .select('*')
      .eq('student_id', studentId)
      .order('deadline', { ascending: true });

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'task retrieved successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;

    const { data: task, error } = await supabase
      .from('task')
      .select('*')
      .eq('id', id)
      .eq('student_id', studentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: 'Task not found', data: {} });
      }
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Task retrieved successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;
    const updates = req.body;

    const { data: task, error } = await supabase
      .from('task')
      .update(updates)
      .eq('id', id)
      .eq('student_id', studentId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: 'Task not found', data: {} });
      }
      throw error;
    }

    sendTaskWebhook({
      action: 'updated',
      studentName: req.user.name,
      studentPhone: req.user.phone,
      ...updates
    });

    // Broadcast via Realtime
    broadcastUpdate('update', task);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;

    const { error } = await supabase
      .from('task')
      .delete()
      .eq('id', id)
      .eq('student_id', studentId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: 'Task not found', data: {} });
      }
      throw error;
    }

    sendTaskWebhook({
      action: 'deleted',
      studentName: req.user.name,
      studentPhone: req.user.phone,
      deletedId: id
    });

    // Broadcast via Realtime
    broadcastUpdate('delete', { id });

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

const completeTask = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;

    const { data: task, error } = await supabase
      .from('task')
      .update({ completed: true })
      .eq('id', id)
      .eq('student_id', studentId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: 'Task not found', data: {} });
      }
      throw error;
    }

    sendTaskWebhook({
      action: 'completed',
      studentName: req.user.name,
      studentPhone: req.user.phone,
      taskId: id,
      title: task.title
    });

    broadcastUpdate('update', task);

    res.status(200).json({
      success: true,
      message: 'Task marked as completed',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  completeTask,
};
