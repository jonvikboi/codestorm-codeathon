const axios = require('axios');

const sendWebhook = async (webhookUrl, webhookName, payload) => {
  if (!webhookUrl) {
    console.warn(`⚠️  ${webhookName} webhook URL not configured.`);
    return;
  }

  console.log(`\n[WEBHOOK REQUEST] Sending ${webhookName} Webhook...`);
  console.log(`[WEBHOOK URL] ${webhookUrl}`);
  console.log(`[WEBHOOK PAYLOAD] ${JSON.stringify(payload, null, 2)}`);

  try {
    const response = await axios.post(webhookUrl, payload, {
      timeout: 10000, // 10 seconds timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log(`[WEBHOOK RESPONSE] Status: ${response.status}`);
    console.log(`[WEBHOOK DATA]`, response.data);
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error(`❌ ${webhookName} Webhook Timeout: Request took longer than 10s`);
    } else {
      console.error(`❌ Failed to send ${webhookName} Webhook:`, error.message);
    }
  }
};

const sendTaskWebhook = async (payload) => {
  const url = process.env.N8N_TASK_WEBHOOK;
  // Fire and forget (don't wait for completion in the caller)
  sendWebhook(url, 'Task', payload).catch(err => console.error(err));
};

const sendAttendanceWebhook = async (payload) => {
  const url = process.env.N8N_ATTENDANCE_WEBHOOK;
  // Fire and forget
  sendWebhook(url, 'Attendance', payload).catch(err => console.error(err));
};

module.exports = {
  sendTaskWebhook,
  sendAttendanceWebhook,
};
