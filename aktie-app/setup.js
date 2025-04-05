

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
// her opretter vi vores schema
const lavSchemaBruger = `
CREATE SCHEMA bruger
`;

const lavSchemaKonto = `
CREATE SCHEMA konto
`
const lavSchemaIndsadelse = `
CREATE SCHEMA indsadelse
`;



// vi opretter en tabeller

const lavBrugerTabel =`
CREATE TABLE bruger.oplysninger (
  id INT PRIMARY KEY IDENTITY(1,1),
  username NVARCHAR(100),
  password NVARCHAR(255)
);
`;

const lavKontoTabel = `
CREATE TABLE konto.kontooplysninger(
  konto_id INT IDENTITY(1,1),
  navn NVARCHAR(100),
  email NVARCHAR(255),
  bank NVARCHAR(255),
  CONSTRAINT konto_PK PRIMARY KEY (konto_id)
);
  `
;

const lavIndsadelsesTabel = `
CREATE TABLE indsadelse.indoplysninger(
indsendelses_id INT IDENTITY(1,1),
  konto_id INT,
  værdi INT,
  valuta NVARCHAR(255),
  tid DATETIME,
  CONSTRAINT ind_PK PRIMARY KEY (indsendelses_id),
  CONSTRAINT konto_FK FOREIGN KEY (konto_id)
 REFERENCES konto.kontooplysninger(konto_id)
);
  `
;


// Vi laver en async function som sørger for at, alt bliver forbundet i den rigtig rækkefølge
async function ventPåDatabase(){


  //forbinder til databasen
   await sql.connect(config) // skaber forbindelse med din database

   // opretter SCHEMA 

   await sql.query(lavSchemaBruger);  
   await sql.query(lavSchemaKonto); 
   await sql.query(lavSchemaIndsadelse);  

   // opretter tabeller 

   await sql.query(lavBrugerTabel);
   await sql.query(lavKontoTabel);
   await sql.query(lavIndsadelsesTabel);

 console.log('alt oprettet') // tjek
};


ventPåDatabase();





    