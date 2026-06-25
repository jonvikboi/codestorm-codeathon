const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n[API REQUEST] [${timestamp}] ${req.ip || 'Unknown IP'} | ${req.method} ${req.url}`);
  
  if (req.body && Object.keys(req.body).length > 0) {
    const safeBody = { ...req.body };
    if (safeBody.password) safeBody.password = '*** HIDDEN ***';
    console.log(`[API PAYLOAD] ${JSON.stringify(safeBody)}`);
  }
  
  next();
};

module.exports = {
  logger,
};
