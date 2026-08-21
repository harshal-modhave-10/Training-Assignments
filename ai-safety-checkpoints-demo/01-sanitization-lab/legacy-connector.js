const mysql = require('mysql2/promise');

// Load database configuration safely from environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'DB_HOST_PLACEHOLDER',
  user: process.env.DB_USER || 'DB_USER_PLACEHOLDER',
  password: process.env.DB_PASSWORD || 'DB_PASSWORD_PLACEHOLDER',
  database: process.env.DB_NAME || 'DB_NAME_PLACEHOLDER'
};

async function getCustomerRecord(userEmail) {
  // Retrieve downstream token securely from environment
  const auditToken = process.env.AUDIT_API_TOKEN;
  
  if (!auditToken) {
    throw new Error("AUDIT_API_TOKEN is not defined.");
  }

  // Use parameterized queries to prevent SQL injection and async/await for modern execution
  const connection = await mysql.createConnection(dbConfig);
  try {
    const query = "SELECT * FROM users WHERE email = ?";
    const [results] = await connection.execute(query, [userEmail]);
    
    console.log(`Auditing fetch for email: ${userEmail}`);
    return results;
  } finally {
    await connection.end();
  }
}

module.exports = { getCustomerRecord };
