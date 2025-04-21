
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
DROP table IF EXISTS vaerdipapir.vpkurs
DROP table IF EXISTS vaerdipapir.vphandler
DROP table IF EXISTS vaerdipapir.vpoplysninger
DROP table IF EXISTS konto.portefoelje
DROP table IF EXISTS konto.transaktioner;
DROP table IF EXISTS konto.kontooplysninger;
DROP table IF EXISTS bruger.oplysninger;
DROP table IF EXISTS konto.portefoelje;
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

const lavBrugerTabel = `
  CREATE TABLE bruger.oplysninger (
    bruger_id INT IDENTITY(1,1),
    username NVARCHAR(100),
    password NVARCHAR(255),
    email NVARCHAR(255),
    CONSTRAINT bruger_PK PRIMARY KEY (bruger_id)
  );
`;

const dataibrugertabel = `
    INSERT INTO bruger.oplysninger (username, password, email) VALUES ('Emil', 'Emil', 'Emil@cbs.dk')
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
    valuta NVARCHAR(50),
    saldo DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    bank_ref NVARCHAR(255),
    oprettet DATETIME,
    nedlagt DATETIME,
    aktiv BIT,
    CONSTRAINT konto_PK PRIMARY KEY (konto_id),
    CONSTRAINT brugerid_FK FOREIGN KEY (bruger_id) REFERENCES bruger.oplysninger(bruger_id)
  );
`;

const dataikontotabel = `
  INSERT INTO konto.kontooplysninger (bruger_id, navn, valuta, saldo, bank_ref, oprettet, nedlagt, aktiv) VALUES (1,'Emil_Konto1','DKK',0,'Jyske Bank','2025-04-06 20:00:00',NULL,1)
  INSERT INTO konto.kontooplysninger (bruger_id, navn, valuta, saldo, bank_ref, oprettet, nedlagt, aktiv) VALUES (1,'Emil_Konto2','DKK',850,'Jyske Bank','2025-04-06 20:00:00',NULL,1)
  INSERT INTO konto.kontooplysninger (bruger_id, navn, valuta, saldo, bank_ref, oprettet, nedlagt, aktiv) VALUES (1,'Emil_Konto3','DKK',0,'Jyske Bank','2025-04-06 20:00:00',NULL,1)
  INSERT INTO konto.kontooplysninger (bruger_id, navn, valuta, saldo, bank_ref, oprettet, nedlagt, aktiv) VALUES (1,'Emil_Konto4','DKK',0,'Jyske Bank','2025-04-06 20:00:00',NULL,1)

  INSERT INTO konto.kontooplysninger (bruger_id, navn, valuta, saldo, bank_ref, oprettet, nedlagt, aktiv) VALUES (2,'Meda_Konto1','DKK',0,'Danske Bank','2025-03-26 20:00:00',NULL,1)
  INSERT INTO konto.kontooplysninger (bruger_id, navn, valuta, saldo, bank_ref, oprettet, nedlagt, aktiv) VALUES (2,'Meda_Konto2','DKK',5900,'Danske Bank','2025-03-26 20:00:00',NULL,1)
  INSERT INTO konto.kontooplysninger (bruger_id, navn, valuta, saldo, bank_ref, oprettet, nedlagt, aktiv) VALUES (2,'Meda_Konto3','DKK',0,'Danske Bank','2025-03-26 20:00:00',NULL,1)
  INSERT INTO konto.kontooplysninger (bruger_id, navn, valuta, saldo, bank_ref, oprettet, nedlagt, aktiv) VALUES (2,'Meda_Konto4','DKK',0,'Danske Bank','2025-03-26 20:00:00',NULL,1)

`;




const lavTransaktionersTabel = `
    CREATE TABLE konto.transaktioner(
      transaktions_id INT IDENTITY(1,1),
      konto_id INT,
      vaerdi DECIMAL(10,2),
      transaktionstype NVARCHAR(20),
      valuta NVARCHAR(50),
      datotid DATETIME,
      CONSTRAINT konto1_FK FOREIGN KEY (konto_id) REFERENCES konto.kontooplysninger(konto_id)
    );
  `;
  
const dataitransaktionstabel = `
    INSERT INTO konto.transaktioner (konto_id, vaerdi, valuta, datotid) VALUES (2,100,'DKK','2025-04-06 20:00:00')
    INSERT INTO konto.transaktioner (konto_id, vaerdi, valuta, datotid) VALUES (2,200,'DKK','2025-04-06 20:00:00')
    INSERT INTO konto.transaktioner (konto_id, vaerdi, valuta, datotid) VALUES (2,500,'DKK','2025-04-06 20:00:00')
    INSERT INTO konto.transaktioner (konto_id, vaerdi, valuta, datotid) VALUES (2,50,'DKK','2025-04-06 20:00:00')

    INSERT INTO konto.transaktioner (konto_id, vaerdi, valuta, datotid) VALUES (6,600,'DKK','2025-04-06 20:00:00')
    INSERT INTO konto.transaktioner (konto_id, vaerdi, valuta, datotid) VALUES (6,200,'DKK','2025-04-06 20:00:00')
    INSERT INTO konto.transaktioner (konto_id, vaerdi, valuta, datotid) VALUES (6,5000,'DKK','2025-04-06 20:00:00')
    INSERT INTO konto.transaktioner (konto_id, vaerdi, valuta, datotid) VALUES (6,100,'DKK','2025-04-06 20:00:00')
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


const dataIPortefoeljeTabel  = `
    INSERT INTO konto.portefoelje (konto_id, navn, dato) VALUES (2,'portefoelje1','2025-04-06 20:00:00')
    INSERT INTO konto.portefoelje (konto_id, navn, dato) VALUES (2,'portefoelje2','2025-04-06 20:00:00')
    INSERT INTO konto.portefoelje (konto_id, navn, dato) VALUES (2,'portefoelje3','2025-04-06 20:00:00')
    INSERT INTO konto.portefoelje (konto_id, navn, dato) VALUES (2,'portefoelje4','2025-04-06 20:00:00')

    INSERT INTO konto.portefoelje (konto_id, navn, dato) VALUES (6,'portefoelje5','2025-04-06 20:00:00')
    INSERT INTO konto.portefoelje (konto_id, navn, dato) VALUES (6,'portefoelje6','2025-04-06 20:00:00')
    INSERT INTO konto.portefoelje (konto_id, navn, dato) VALUES (6,'portefoelje7','2025-04-06 20:00:00')
    INSERT INTO konto.portefoelje (konto_id, navn, dato) VALUES (6,'portefoelje8','2025-04-06 20:00:00')
`;

const lavVPOplysninger = `
    CREATE TABLE vaerdipapir.vpoplysninger(
      vpoplysninger_id INT IDENTITY(1,1),
      navn NVARCHAR(50),
      symbol NVARCHAR(20),
      type NVARCHAR(50),
      CONSTRAINT portefoelje_PK PRIMARY KEY (symbol)
    );
      `;

const dataOmVP =
      `INSERT INTO vaerdipapir.vpoplysninger (navn, symbol, type)
        VALUES 
        ('Apple Inc.', 'AAPL', 'aktie'),
        ('Boeing Company', 'BA', 'aktie'),
        ('Novo Nordisk', 'NVO', 'aktie'),
        ('IBM', 'IBM', 'aktie');
        `

const lavVPHandler = `
      CREATE TABLE vaerdipapir.vphandler(
        vphandler_id INT IDENTITY(1,1),
        symbol NVARCHAR(20),
        portefoelje_id INT,
        konto_id INT,
        vaerditype NVARCHAR(50),
        salg_koeb BIT,
        antal INT,
        pris DECIMAL(10,2),
        valuta NVARCHAR(50),
        gebyr DECIMAL(10,2),
        datotid DATETIME,
        CONSTRAINT vphandler_PK PRIMARY KEY (vphandler_id),
        CONSTRAINT vpoplysninger1_FK FOREIGN KEY (symbol) REFERENCES vaerdipapir.vpoplysninger(symbol),
        CONSTRAINT fk_vphandler_konto FOREIGN KEY (konto_id) REFERENCES konto.kontooplysninger(konto_id)
      );
        `;

const dataiVpHandler = `insert into vaerdipapir.vphandler 
(symbol, portefoelje_id, konto_id, vaerditype, salg_koeb, antal, pris, valuta, gebyr, datotid)
values  ('BA', 5, 6,'aktie', 0, 4, 215.00, 'DKK', 0.22, '2025-04-20 19:51:13.727'),
        ('BA', 5, 6,'aktie', 1, 1, 215.00, 'DKK', 0.22, '2025-04-20 19:51:43.177'),
        ('BA', 5, 6,'aktie', 1, 1, 215.00, 'DKK', 0.22, '2025-04-20 19:52:09.583'),
        ('BA', 5, 6,'aktie', 1, 1, 215.00, 'DKK', 0.22, '2025-04-20 19:54:58.840'),
        ('AAPL', 5, 6, 'aktie', 0, 3, 145.00, 'DKK', 0.14, '2025-04-20 20:11:29.057'),
        ('AAPL', 5, 6, 'aktie', 1, 1, 145.00, 'DKK', 0.14, '2025-04-20 20:11:40.797'),
        ('AAPL', 5, 6, 'aktie', 1, 1, 145.00, 'DKK', 0.14, '2025-04-20 20:11:53.183'),
        ('AAPL', 5, 6, 'aktie', 1, 1, 145.00, 'DKK', 0.14, '2025-04-20 20:12:01.247'),
        ('BA', 5, 6, 'aktie', 1, 1, 215.00, 'DKK', 0.22, '2025-04-20 20:15:03.813'),
        ( 'AAPL', 5, 6, 'aktie', 0, 4, 145.00, 'DKK', 0.14, '2025-04-20 20:16:22.843'),
        ( 'AAPL', 5, 6, 'aktie', 1, 1, 145.00, 'DKK', 0.14, '2025-04-20 20:16:58.687'),
        ( 'AAPL', 5, 6, 'aktie', 1, 1, 145.00, 'DKK', 0.14, '2025-04-20 20:17:40.107'),
        ( 'AAPL', 5, 6, 'aktie', 1, 1, 145.00, 'DKK', 0.14, '2025-04-21 07:49:18.760'),
        ( 'AAPL', 5, 6, 'aktie', 1, 1, 145.00, 'DKK', 0.14, '2025-04-21 08:03:25.567'),
        ( 'AAPL', 5, 6, 'aktie', 0, 4, 145.00, 'DKK', 0.14, '2025-04-21 08:08:44.400'),
        ( 'AAPL', 5, 6, 'aktie', 1, 1, 145.00, 'DKK', 0.14, '2025-04-21 08:08:54.140'),
        ( 'BA', 5, 6, 'aktie', 0, 2, 215.00, 'DKK', 0.22, '2025-04-21 09:36:51.160'),
        ( 'BA', 1, 2, 'aktie', 0, 3, 215.00, 'DKK', 0.22, '2025-04-21 14:53:21.487'),
        ( 'BA', 1, 2, 'aktie', 1, 2, 215.00, 'DKK', 0.22, '2025-04-21 14:55:41.613'),
        ( 'BA', 1, 2, 'aktie', 0, 2, 215.00, 'DKK', 0.22, '2025-04-21 14:57:43.850'),
        ( 'BA', 1, 2, 'aktie', 1, 3, 215.00, 'DKK', 0.22, '2025-04-21 14:58:14.177'),
        ( 'NVO', 1, 2, 'aktie', 0, 4, 545.00, 'DKK', 0.14, '2025-04-20 20:16:22.843'),
        ( 'NVO', 1, 2, 'aktie', 1, 1, 545.00, 'DKK', 0.14, '2025-04-20 20:16:58.687'),
        ( 'NVO', 1, 2, 'aktie', 1, 1, 545.00, 'DKK', 0.14, '2025-04-20 20:17:40.107'),
        ( 'NVO', 1, 2, 'aktie', 1, 1, 545.00, 'DKK', 0.14, '2025-04-21 07:49:18.760'),
        ( 'NVO', 1, 2, 'aktie', 1, 1, 545.00, 'DKK', 0.14, '2025-04-21 08:03:25.567'),
        ( 'NVO', 1, 2, 'aktie', 0, 4, 545.00, 'DKK', 0.14, '2025-04-21 08:08:44.400'),
        ( 'NVO', 1, 2, 'aktie', 1, 1, 545.00, 'DKK', 0.14, '2025-04-21 08:08:54.140'),
        ( 'BA', 5, 6, 'aktie', 0, 2, 215.00, 'DKK', 0.22, '2025-04-21 09:36:51.160'),
        ( 'BA', 1, 2, 'aktie', 0, 3, 215.00, 'DKK', 0.22, '2025-04-21 14:53:21.487'),
        ( 'BA', 1, 2, 'aktie', 0, 2, 215.00, 'DKK', 0.22, '2025-04-21 15:06:25.143');`

const lavVPKurs = `
        CREATE TABLE vaerdipapir.vpkurs(
          vpkurs_id INT IDENTITY(1,1),
          symbol NVARCHAR(20),
          kurs DECIMAL(10,2),
          datotid DATETIME,
          CONSTRAINT vpkurs_PK PRIMARY KEY (vpkurs_id),
          CONSTRAINT vpoplysninger2_FK FOREIGN KEY (symbol) REFERENCES vaerdipapir.vpoplysninger(symbol)
        );
          `;

// Vi laver en async function som sørger for at, alt bliver forbundet i den rigtig rækkefølge
async function ventPåDatabase() {
  //forbinder til databasen
  console.log('Connet to database');
  await sql.connect(config); // skaber forbindelse med din database

  //Drop all TABLES
  console.log('Drop all tabels');
  await sql.query(dropAllTables);

  //Drop all SCHEMA
  console.log('Drop all schemas');
  await sql.query(dropAllSchemas);

  // opretter SCHEMA 
  console.log('Create all schemas');
  await sql.query(lavSchemaBruger);
  await sql.query(lavSchemaKonto);
  await sql.query(lavSchemaVaerdipapir);

  // opretter tabeller 
  console.log('Create all tables');
  await sql.query(lavBrugerTabel);
  await sql.query(lavKontoTabel);
  await sql.query(lavTransaktionersTabel);
  await sql.query(lavPortefoeljeTabel);
  await sql.query(lavVPOplysninger);
  await sql.query(lavVPHandler);
  await sql.query(lavVPKurs);

  // indsæt test data i tabeller
  await sql.query(dataibrugertabel);
  await sql.query(dataikontotabel);
  await sql.query(dataIPortefoeljeTabel);
  await sql.query(dataitransaktionstabel);
  await sql.query(dataOmVP); 
  await sql.query(dataiVpHandler); 
  

  console.log('alt oprettet') // tjek
};


ventPåDatabase();





