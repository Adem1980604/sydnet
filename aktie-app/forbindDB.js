const sql = require('mssql'); // importerer Microsoft SQL Server i driveren 
require('dotenv').config(); // henter vores database-logindoplysninger fra .env filen

// opbygger din forbindelse med databasen
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

// vi forbinder nu vores database 
async function forbindDatabase() {
  return await sql.connect(config);
}

module.exports = {
  sql,
  forbindDatabase

};

