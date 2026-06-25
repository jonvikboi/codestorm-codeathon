const supabase = require('../services/supabase');

const getAttendanceAnalytics = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    // Fetch all attendance records for the student
    const { data: attendanceRecords, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId);

    if (error) throw error;

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No attendance records found',
        data: {
          overall_percentage: 0,
          total_present: 0,
          total_absent: 0,
          total_classes: 0,
          subjects: []
        }
      });
    }

    let globalPresent = 0;
    let globalTotal = 0;

    const subjectsAnalytics = attendanceRecords.map(record => {
      const present = record.present_classes || 0;
      const total = record.total_classes || 0;
      const absent = Math.max(0, total - present);

      const percentage = total > 0 ? (present / total) * 100 : 0;

      // Calculate consecutive classes needed to reach 75%
      // Formula: X >= 3T - 4P
      const classesNeededFor75 = Math.max(0, 3 * total - 4 * present);

      let riskLevel = 'Critical';
      if (percentage >= 75) {
        riskLevel = 'Safe';
      } else if (percentage >= 60) {
        riskLevel = 'Warning';
      }

      globalPresent += present;
      globalTotal += total;

      return {
        id: record.id,
        subject: record.subject,
        present_count: present,
        absent_count: absent,
        total_classes: total,
        attendance_percentage: parseFloat(percentage.toFixed(2)),
        classes_needed_for_75: classesNeededFor75,
        risk_level: riskLevel
      };
    });

    const globalPercentage = globalTotal > 0 ? (globalPresent / globalTotal) * 100 : 0;

    let globalRiskLevel = 'Critical';
    if (globalPercentage >= 75) {
      globalRiskLevel = 'Safe';
    } else if (globalPercentage >= 60) {
      globalRiskLevel = 'Warning';
    }

    res.status(200).json({
      success: true,
      message: 'Attendance analytics calculated successfully',
      data: {
        overall: {
          percentage: parseFloat(globalPercentage.toFixed(2)),
          total_present: globalPresent,
          total_absent: Math.max(0, globalTotal - globalPresent),
          total_classes: globalTotal,
          risk_level: globalRiskLevel,
          classes_needed_for_75: Math.max(0, 3 * globalTotal - 4 * globalPresent)
        },
        subjects: subjectsAnalytics
      }
    });
  } catch (error) {
    next(error);
  }
};

const getTaskAnalytics = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const { data: task, error } = await supabase
      .from('task')
      .select('*')
      .eq('student_id', studentId);

    if (error) throw error;

    if (!task || task.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No task found',
        data: {
          pending_tasks: 0,
          completed_tasks: 0,
          overdue_tasks: 0,
          due_today: 0,
          due_this_week: 0
        }
      });
    }

    const now = new Date();
    // Reset time to start of day for accurate day/week comparisons
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    const endOfWeek = new Date(startOfToday);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    let pendingCount = 0;
    let completedCount = 0;
    let overdueCount = 0;
    let dueTodayCount = 0;
    let dueThisWeekCount = 0;

    task.forEach(task => {
      const deadline = new Date(task.deadline);

      if (task.completed) {
        completedCount++;
      } else {
        pendingCount++;

        // Strict overdue check (past exact current time)
        if (deadline < now) {
          overdueCount++;
        }

        // Due today check (between 00:00 and 23:59 today)
        if (deadline >= startOfToday && deadline < endOfToday) {
          dueTodayCount++;
        }

        // Due this week check (between today and next 7 days)
        if (deadline >= startOfToday && deadline < endOfWeek) {
          dueThisWeekCount++;
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Deadline analytics calculated successfully',
      data: {
        pending_tasks: pendingCount,
        completed_tasks: completedCount,
        overdue_tasks: overdueCount,
        due_today: dueTodayCount,
        due_this_week: dueThisWeekCount
      }
    });
  } catch (error) {
    next(error);
  }
};

const getGlobalDashboard = async (req, res, next) => {
  try {
    // Fetch all necessary data concurrently for maximum performance
    // Only select the required columns to optimize database payload
    const [
      { data: students, error: studentsError },
      { data: task, error: tasksError },
      { data: attendanceRecords, error: attendanceError }
    ] = await Promise.all([
      supabase.from('students').select('id'),
      supabase.from('task').select('id, deadline, completed'),
      supabase.from('attendance').select('student_id, present_classes, total_classes')
    ]);

    if (studentsError) throw studentsError;
    if (tasksError) throw tasksError;
    if (attendanceError) throw attendanceError;

    // --- Task Analytics ---
    const now = new Date();
    let totalTasks = task.length;
    let completedTasks = 0;
    let pendingTasks = 0;
    let overdueTasks = 0;

    task.forEach(task => {
      if (task.completed) {
        completedTasks++;
      } else {
        pendingTasks++;
        if (new Date(task.deadline) < now) {
          overdueTasks++;
        }
      }
    });

    // --- Attendance Analytics ---
    const totalStudents = students.length;

    // Group attendance by student to calculate per-student overall attendance
    const studentAttendanceMap = {};
    attendanceRecords.forEach(record => {
      if (!studentAttendanceMap[record.student_id]) {
        studentAttendanceMap[record.student_id] = { present: 0, total: 0 };
      }
      studentAttendanceMap[record.student_id].present += record.present_classes || 0;
      studentAttendanceMap[record.student_id].total += record.total_classes || 0;
    });

    let studentsAtRisk = 0;
    let sumOfPercentages = 0;
    let highestAttendance = 0;
    let lowestAttendance = 100;
    let studentsWithAttendanceData = 0;

    Object.values(studentAttendanceMap).forEach(data => {
      if (data.total > 0) {
        const percentage = (data.present / data.total) * 100;
        sumOfPercentages += percentage;
        studentsWithAttendanceData++;

        if (percentage < 75) studentsAtRisk++;
        if (percentage > highestAttendance) highestAttendance = percentage;
        if (percentage < lowestAttendance) lowestAttendance = percentage;
      }
    });

    // Handle edge case where no attendance data exists
    if (studentsWithAttendanceData === 0) {
      lowestAttendance = 0;
    }

    const averageAttendance = studentsWithAttendanceData > 0
      ? (sumOfPercentages / studentsWithAttendanceData)
      : 0;

    res.status(200).json({
      success: true,
      message: 'Global dashboard metrics calculated successfully',
      data: {
        attendance_summary: {
          total_students: totalStudents,
          students_at_risk: studentsAtRisk,
          average_attendance: parseFloat(averageAttendance.toFixed(2)),
          highest_attendance: parseFloat(highestAttendance.toFixed(2)),
          lowest_attendance: parseFloat(lowestAttendance.toFixed(2))
        },
        task_summary: {
          total_tasks: totalTasks,
          pending: pendingTasks,
          completed: completedTasks,
          overdue: overdueTasks
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAttendanceAnalytics,
  getTaskAnalytics,
  getGlobalDashboard
};
