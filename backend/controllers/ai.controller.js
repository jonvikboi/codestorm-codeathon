const { generateCompletion } = require('../services/groq');

const generateStudySchedule = async (req, res, next) => {
  try {
    const { subjects, deadline } = req.body;

    const prompt = `
      You are an expert study planner. The student needs to study the following subjects: ${subjects.join(', ')}.
      The final deadline is ${deadline}. 
      Generate a day-wise study schedule from today until the deadline.
      Return ONLY a JSON object in this exact format, with no other text or markdown:
      {
        "days": [
          {
            "date": "YYYY-MM-DD",
            "subjects": ["subject1", "subject2"]
          }
        ]
      }
    `;

    const aiResponse = await generateCompletion(prompt);

    res.status(200).json({
      success: true,
      message: 'Study schedule generated successfully',
      data: aiResponse,
    });
  } catch (error) {
    next(error);
  }
};

const analyzeAttendance = async (req, res, next) => {
  try {
    const { attendance } = req.body;

    const prompt = `
      You are an academic advisor. The backend has already calculated the student's attendance analytics:
      ${JSON.stringify(attendance)}
      
      Your task is to analyze these pre-calculated metrics. Do NOT attempt to calculate percentages yourself.
      Provide a qualitative explanation based on the data.
      Return ONLY a JSON object in this exact format, with no other text or markdown:
      {
        "summary": "Detailed explanation of their overall attendance health.",
        "riskLevel": "Safe, Warning, or Critical based on your analysis of the data",
        "recommendation": "A personalized recommendation message.",
        "suggestedActions": ["Action 1", "Action 2", "Action 3"]
      }
    `;

    const aiResponse = await generateCompletion(prompt);

    res.status(200).json({
      success: true,
      message: 'Attendance analysis complete',
      data: aiResponse,
    });
  } catch (error) {
    next(error);
  }
};

const analyzeDeadlines = async (req, res, next) => {
  try {
    const { task } = req.body;

    const prompt = `
      You are an elite productivity coach and AI Deadline Assistant. 
      Analyze the following pending task:
      ${JSON.stringify(task)}
      
      Determine the exact execution order to maximize productivity and avoid missed deadlines.
      Evaluate priorities, calculate urgency based on the deadline, and provide actionable productivity suggestions.
      
      Return ONLY a JSON object in this exact format, with no other text or markdown:
      {
        "executionOrder": ["Task Title 1", "Task Title 2"],
        "urgencyExplanation": "Detailed explanation of why these task are urgent.",
        "deadlineWarnings": ["Warning about Task 1's tight deadline", "Warning about Task 2"],
        "productivitySuggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"]
      }
    `;

    const aiResponse = await generateCompletion(prompt);

    res.status(200).json({
      success: true,
      message: 'Deadline analysis complete',
      data: aiResponse,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateStudySchedule,
  analyzeAttendance,
  analyzeDeadlines,
};
