

const sql = require('mssql'); // vi importerer mssql-pakken, som forbinder med SQL server
require('dotenv').config();


// forbindens konfiguraiton 
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
// her opretter vi vores schema bruger
const lavSchema = `
CREATE SCHEMA bruger
`;
// vi opretter en tabel som indeholder alle bruger oplysninger
const lavBrugerTabel =`
CREATE TABLE bruger.oplysninger (
  id INT PRIMARY KEY IDENTITY(1,1),
  username NVARCHAR(100),
  password NVARCHAR(255)
);
`;

// Vi laver en async function som sørger for at, alt bliver forbundet i den rigtig rækkefølge
async function ventPåBrugerData(){

   await sql.connect(config) // skaber forbindelse med din database
   await sql.query(lavSchema);  // først schema
   await sql.query(lavBrugerTabel);   // så tabel
  
};

ventPåBrugerData()



    