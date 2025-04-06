

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


const dropAllTables = `
DROP table IF EXISTS konto.transaktioner;
DROP table IF EXISTS konto.kontooplysninger;
DROP table IF EXISTS bruger.oplysninger;
DROP table IF EXISTS konto.portefoelje
`;


const dropAllSchemas = `
DROP schema IF EXISTS bruger;
DROP schema IF EXISTS konto;
DROP schema IF EXISTS vaerdipapir;
  `;


// her opretter vi vores schema
const lavSchemaBruger = `
CREATE SCHEMA bruger
`;

const lavSchemaKonto = `
CREATE SCHEMA konto
`;

const lavSchemaVaerdipapir = `
CREATE SCHEMA vaerdipapir
`;


// vi opretter tabeller

const lavBrugerTabel =`
  CREATE TABLE bruger.oplysninger (
    bruger_id INT IDENTITY(1,1),
    username NVARCHAR(100),
    password NVARCHAR(255),
    email NVARCHAR(255),
    CONSTRAINT bruger_PK PRIMARY KEY (bruger_id)
  );
`;

const dataibrugertabel = `
--INSERT INTO bruger.oplysninger (username, password, email) VALUES ('Emil', 'Emil', 'Emil@cbs.dk')
INSERT INTO bruger.oplysninger (username, password, email) VALUES ('Meda', 'Meda', 'Meda@cbs.dk')
INSERT INTO bruger.oplysninger (username, password, email) VALUES ('Mads', 'Mads', 'Mads@cbs.dk')
INSERT INTO bruger.oplysninger (username, password, email) VALUES ('Nikola', 'Nikola', 'Nikola@cbs.dk')
`;


const lavKontoTabel = `
  CREATE TABLE 
  konto.kontooplysninger(
    konto_id INT IDENTITY(1,1),
    bruger_id INT,
    navn NVARCHAR(100),
    vaulta NVARCHAR(50),
    saldo DECIMAL(15,2),
    bank_ref NVARCHAR(255),
    oprettet DATETIME,
    nedlagt DATETIME,
    aktiv BIT,
    CONSTRAINT konto_PK PRIMARY KEY (konto_id),
    CONSTRAINT brugerid_FK FOREIGN KEY (bruger_id) REFERENCES bruger.oplysninger(bruger_id)
  );
`;

const dataikontotabel = `
  INSERT INTO konto.kontooplysninger (bruger_id, navn, vaulta, saldo, bank_ref, oprettet, nedlagt, aktiv) VALUES (1,'Konto1','DKK',0,'JyskeBank','2025-04-06 20:00:00','',1)
  INSERT INTO konto.kontooplysninger (bruger_id, navn, vaulta, saldo, bank_ref, oprettet, nedlagt, aktiv) VALUES (1,'Konto2','DKK',0,'JyskeBank','2025-04-06 20:00:00','',1)
  INSERT INTO konto.kontooplysninger (bruger_id, navn, vaulta, saldo, bank_ref, oprettet, nedlagt, aktiv) VALUES (1,'Konto3','DKK',0,'JyskeBank','2025-04-06 20:00:00','',1)
  INSERT INTO konto.kontooplysninger (bruger_id, navn, vaulta, saldo, bank_ref, oprettet, nedlagt, aktiv) VALUES (1,'Konto4','DKK',0,'JyskeBank','2025-04-06 20:00:00','',1)
`;



const lavTransaktionersTabel = `
CREATE TABLE konto.transaktioner(
  transaktions_id INT IDENTITY(1,1),
  konto_id INT,
  vaerdi DECIMAL(10,2),
  transaktionstype NVARCHAR(20),
  valuta NVARCHAR(50),
  datotid DATETIME,
  CONSTRAINT ind_PK PRIMARY KEY (transaktions_id),
  CONSTRAINT konto1_FK FOREIGN KEY (konto_id) REFERENCES konto.kontooplysninger(konto_id)
);
  `;

  const dataitransaktionstabel = `
  INSERT INTO konto.transaktioner (konto_id, vaerdi, transaktionstype, valuta, datotid) VALUES (2,100,'indsaet','DKK','2025-04-06 20:00:00')
  INSERT INTO konto.transaktioner (konto_id, vaerdi, transaktionstype, valuta, datotid) VALUES (2,200,'indsaet','DKK','2025-04-06 20:00:00')
  INSERT INTO konto.transaktioner (konto_id, vaerdi, transaktionstype, valuta, datotid) VALUES (2,500,'indsaet','DKK','2025-04-06 20:00:00')
  INSERT INTO konto.transaktioner (konto_id, vaerdi, transaktionstype, valuta, datotid) VALUES (2,-50,'Haev','DKK','2025-04-06 20:00:00')
`;



  const lavPortefoeljeTabel = `
  CREATE TABLE konto.portefoelje(
    portefoelje_id INT IDENTITY(1,1),
    konto_id INT,
    navn NVARCHAR(50),
    dato DATE,
    CONSTRAINT portefoelje_PK PRIMARY KEY (portefoelje_id),
    CONSTRAINT konto2_FK FOREIGN KEY (konto_id) REFERENCES konto.kontooplysninger(konto_id)
  );
    `;



    const lavVPOplysninger = `
    CREATE TABLE vaerdipapir.vpoplysninger(
      vpoplysninger_id INT IDENTITY(1,1),
      navn NVARCHAR(50),
      type NVARCHAR(50),
      CONSTRAINT portefoelje_PK PRIMARY KEY (vpoplysninger_id),
    );
      `;
  

      const lavVPHandler = `
      CREATE TABLE vaerdipapir.vphandler(
        vphandler_id INT IDENTITY(1,1),
        vpoplysninger_id INT,
        portefoelje_id INT,
        vaerditype NVARCHAR(50),
        salg_koeb BIT,
        antal INT,
        pris DECIMAL(10,2),
        valuta NVARCHAR(50),
        gebyr DECIMAL(10,2),
        datotid DATETIME,
        CONSTRAINT vphandler_PK PRIMARY KEY (vphandler_id),
        CONSTRAINT vpoplysninger1_FK FOREIGN KEY (vpoplysninger_id) REFERENCES vaerdipapir.vpoplysninger(vpoplysninger_id)
      );
        `;
    

        const lavVPKurs = `
        CREATE TABLE vaerdipapir.vpkurs(
          vpkurs_id INT IDENTITY(1,1),
          vpoplysninger_id INT,
          kurs DECIMAL(10,2),
          datotid DATETIME,
          CONSTRAINT vpkurs_PK PRIMARY KEY (vpkurs_id),
          CONSTRAINT vpoplysninger2_FK FOREIGN KEY (vpoplysninger_id) REFERENCES vaerdipapir.vpoplysninger(vpoplysninger_id)
        );
          `;



// Vi laver en async function som sørger for at, alt bliver forbundet i den rigtig rækkefølge
async function ventPåDatabase(){
  //forbinder til databasen
  console.log('Connet to database');
  await sql.connect(config); // skaber forbindelse med din database
   

  //Drop all TABLES
  //console.log('Drop all tabels');
  //await sql.query(dropAllTables);

  /*
  //Drop all SCHEMA
  console.log('Drop all schemas');
  await sql.query(dropAllSchemas);
  

  // opretter SCHEMA 
  console.log('Create all schemas');
  await sql.query(lavSchemaBruger);  
  await sql.query(lavSchemaKonto);
  await sql.query(lavSchemaVaerdipapir);
  */

  /*
  // opretter tabeller 
  console.log('Create all tables');
  await sql.query(lavBrugerTabel);
  await sql.query(lavKontoTabel);
  await sql.query(lavTransaktionersTabel);
  await sql.query(lavPortefoeljeTabel);
  await sql.query(lavVPOplysninger);
  await sql.query(lavVPHandler);
  await sql.query(lavVPKurs);
  */


  //await sql.query(dataibrugertabel);
  
  //await sql.query(dataikontotabel);
  //await sql.query(dataitransaktionstabel);
  

  console.log('alt oprettet') // tjek
};


ventPåDatabase();





    