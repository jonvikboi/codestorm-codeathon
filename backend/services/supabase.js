const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Supabase URL or Key is missing. Check your .env file.');
}

const customFetch = async (url, options) => {
  try {
    console.log(`[DB QUERY] ${options.method} ${url}`);

    const response = await fetch(url, options);

    console.log(`[DB RESPONSE] ${response.status}`);

    return response;

  } catch (err) {

    console.error("=================================");
    console.error("FETCH FAILED");
    console.error("Message:", err.message);
    console.error("Cause:", err.cause);
    console.error("Stack:", err.stack);
    console.error("=================================");

    throw err;
  }
};
const supabase = createClient(supabaseUrl || 'http://localhost', supabaseKey || 'dummy', {
  global: { fetch: customFetch }
});

module.exports = supabase;
