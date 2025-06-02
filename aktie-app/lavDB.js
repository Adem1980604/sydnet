const sql = require('mssql'); // vi importerer mssql-pakken, som gør at vi kan skrive SQL
require('dotenv').config(); //Gør det muligt at få info fra vores .env fil

// Forbinder til .env og får info om vores database 
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
DROP table IF EXISTS historiskdata.portefoeljevaerdi;
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
DROP schema IF EXISTS historiskdata;
  `;


// Her opretter vi vores schema'er
const lavSchemaBruger = `
CREATE SCHEMA bruger
`;

const lavSchemaKonto = `
CREATE SCHEMA konto
`;

const lavSchemaVaerdipapir = `
CREATE SCHEMA vaerdipapir
`;

const lavSchemaHistoriskData = `
CREATE SCHEMA historiskdata
`;

// Vi opretter  tabeller
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
    INSERT INTO bruger.oplysninger (username, password, email) VALUES ('Forelæser', 'HAITPROG1', 'Forelæser@cbs.dk')
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
  INSERT INTO konto.kontooplysninger (bruger_id, navn, valuta, saldo, bank_ref, oprettet, nedlagt, aktiv) VALUES (1,'Emil_Konto1','DKK',5000,'Jyske Bank','2024-05-06 20:00:00',NULL,1)
  INSERT INTO konto.kontooplysninger (bruger_id, navn, valuta, saldo, bank_ref, oprettet, nedlagt, aktiv) VALUES (1,'Emil_Konto2','DKK',8500,'Jyske Bank','2024-05-06 20:00:00',NULL,1)
  INSERT INTO konto.kontooplysninger (bruger_id, navn, valuta, saldo, bank_ref, oprettet, nedlagt, aktiv) VALUES (1,'Emil_Konto3','DKK',2000,'Danske Bank','2024-05-06 20:00:00',NULL,1)
  INSERT INTO konto.kontooplysninger (bruger_id, navn, valuta, saldo, bank_ref, oprettet, nedlagt, aktiv) VALUES (1,'Emil_Konto4','DKK',3000,'Nordea','2024-05-06 20:00:00',NULL,1)

  INSERT INTO konto.kontooplysninger (bruger_id, navn, valuta, saldo, bank_ref, oprettet, nedlagt, aktiv) VALUES (2,'Meda_Konto1','DKK',5000,'Jyske Bank','2024-05-06 20:00:00',NULL,1)
  INSERT INTO konto.kontooplysninger (bruger_id, navn, valuta, saldo, bank_ref, oprettet, nedlagt, aktiv) VALUES (2,'Meda_Konto2','DKK',8500,'Jyske Bank','2024-05-06 20:00:00',NULL,1)
  INSERT INTO konto.kontooplysninger (bruger_id, navn, valuta, saldo, bank_ref, oprettet, nedlagt, aktiv) VALUES (2,'Meda_Konto3','DKK',2000,'Danske Bank','2024-05-06 20:00:00',NULL,1)
  INSERT INTO konto.kontooplysninger (bruger_id, navn, valuta, saldo, bank_ref, oprettet, nedlagt, aktiv) VALUES (2,'Meda_Konto4','DKK',3000,'Nordea Bank','2024-05-06 20:00:00',NULL,1)

  INSERT INTO konto.kontooplysninger (bruger_id, navn, valuta, saldo, bank_ref, oprettet, nedlagt, aktiv) VALUES (3,'Mads_Konto1','DKK',5000,'Jyske Bank','2024-05-06 20:00:00',NULL,1)
  INSERT INTO konto.kontooplysninger (bruger_id, navn, valuta, saldo, bank_ref, oprettet, nedlagt, aktiv) VALUES (3,'Mads_Konto2','DKK',8500,'Jyske Bank','2024-05-06 20:00:00',NULL,1)
  INSERT INTO konto.kontooplysninger (bruger_id, navn, valuta, saldo, bank_ref, oprettet, nedlagt, aktiv) VALUES (3,'Mads_Konto3','DKK',2000,'Danske Bank','2024-05-06 20:00:00',NULL,1)
  INSERT INTO konto.kontooplysninger (bruger_id, navn, valuta, saldo, bank_ref, oprettet, nedlagt, aktiv) VALUES (3,'Mads_Konto4','DKK',3000,'Nordea','2024-05-06 20:00:00',NULL,1)

  INSERT INTO konto.kontooplysninger (bruger_id, navn, valuta, saldo, bank_ref, oprettet, nedlagt, aktiv) VALUES (4,'Nikola_Konto1','DKK',5000,'Jyske Bank','2024-05-06 20:00:00',NULL,1)
  INSERT INTO konto.kontooplysninger (bruger_id, navn, valuta, saldo, bank_ref, oprettet, nedlagt, aktiv) VALUES (4,'Nikola_Konto2','DKK',8500,'Jyske Bank','2024-05-06 20:00:00',NULL,1)
  INSERT INTO konto.kontooplysninger (bruger_id, navn, valuta, saldo, bank_ref, oprettet, nedlagt, aktiv) VALUES (4,'Nikola_Konto3','DKK',2000,'Danske Bank','2024-05-06 20:00:00',NULL,1)
  INSERT INTO konto.kontooplysninger (bruger_id, navn, valuta, saldo, bank_ref, oprettet, nedlagt, aktiv) VALUES (4,'Nikola_Konto4','DKK',3000,'Nordea Bank','2024-05-06 20:00:00',NULL,1)

  INSERT INTO konto.kontooplysninger (bruger_id, navn, valuta, saldo, bank_ref, oprettet, nedlagt, aktiv) VALUES (5,'ForelæserKonto','DKK',300000,'Nordea Bank','2024-05-06 20:00:00',NULL,1)
`;


const lavTransaktionersTabel = `
    CREATE TABLE konto.transaktioner(
      transaktions_id INT IDENTITY(1,1),
      konto_id INT,
      vaerdi DECIMAL(10,2),
      transaktionstype NVARCHAR(20),
      valuta NVARCHAR(50),
      datotid DATETIME,
      CONSTRAINT transaktion_PK PRIMARY KEY (transaktions_id),
      CONSTRAINT konto1_FK FOREIGN KEY (konto_id) REFERENCES konto.kontooplysninger(konto_id)
    );
  `;
  
const dataitransaktionstabel = `
    INSERT INTO konto.transaktioner (konto_id, vaerdi, valuta, datotid) VALUES (2,100,'DKK','2025-01-06 20:00:00')
    INSERT INTO konto.transaktioner (konto_id, vaerdi, valuta, datotid) VALUES (2,200,'DKK','2025-02-06 20:00:00')
    INSERT INTO konto.transaktioner (konto_id, vaerdi, valuta, datotid) VALUES (2,500,'DKK','2025-03-06 20:00:00')
    INSERT INTO konto.transaktioner (konto_id, vaerdi, valuta, datotid) VALUES (2,50,'DKK','2025-04-06 20:00:00')

    INSERT INTO konto.transaktioner (konto_id, vaerdi, valuta, datotid) VALUES (6,600,'DKK','2025-01-06 20:00:00')
    INSERT INTO konto.transaktioner (konto_id, vaerdi, valuta, datotid) VALUES (6,200,'DKK','2025-02-06 20:00:00')
    INSERT INTO konto.transaktioner (konto_id, vaerdi, valuta, datotid) VALUES (6,5000,'DKK','2025-03-06 20:00:00')
    INSERT INTO konto.transaktioner (konto_id, vaerdi, valuta, datotid) VALUES (6,100,'DKK','2025-04-06 20:00:00')

    INSERT INTO konto.transaktioner (konto_id, vaerdi, valuta, datotid) VALUES (10,100,'DKK','2025-01-06 20:00:00')
    INSERT INTO konto.transaktioner (konto_id, vaerdi, valuta, datotid) VALUES (10,200,'DKK','2025-02-06 20:00:00')
    INSERT INTO konto.transaktioner (konto_id, vaerdi, valuta, datotid) VALUES (10,500,'DKK','2025-03-06 20:00:00')
    INSERT INTO konto.transaktioner (konto_id, vaerdi, valuta, datotid) VALUES (10,50,'DKK','2025-04-06 20:00:00')

    INSERT INTO konto.transaktioner (konto_id, vaerdi, valuta, datotid) VALUES (14,600,'DKK','2025-01-06 20:00:00')
    INSERT INTO konto.transaktioner (konto_id, vaerdi, valuta, datotid) VALUES (14,200,'DKK','2025-02-06 20:00:00')
    INSERT INTO konto.transaktioner (konto_id, vaerdi, valuta, datotid) VALUES (14,5000,'DKK','2025-03-06 20:00:00')
    INSERT INTO konto.transaktioner (konto_id, vaerdi, valuta, datotid) VALUES (14,100,'DKK','2025-04-06 20:00:00')

    INSERT INTO konto.transaktioner (konto_id, vaerdi, valuta, datotid) VALUES (17,300000,'DKK','2025-04-06 20:00:00')
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
    INSERT INTO konto.portefoelje (konto_id, navn, dato) VALUES (2,'Emils portefoelje1','2024-05-07 20:00:00')
    INSERT INTO konto.portefoelje (konto_id, navn, dato) VALUES (2,'Emils portefoelje2','2024-05-07 20:00:00')
    INSERT INTO konto.portefoelje (konto_id, navn, dato) VALUES (2,'Emils portefoelje3','2024-05-07 20:00:00')
    INSERT INTO konto.portefoelje (konto_id, navn, dato) VALUES (2,'Emils portefoelje4','2024-05-07 20:00:00')

    INSERT INTO konto.portefoelje (konto_id, navn, dato) VALUES (6,'Medas portefoelje1','2024-05-07 20:00:00')
    INSERT INTO konto.portefoelje (konto_id, navn, dato) VALUES (6,'Medas portefoelje2','2024-05-07 20:00:00')
    INSERT INTO konto.portefoelje (konto_id, navn, dato) VALUES (6,'Medas portefoelje3','2024-05-07 20:00:00')
    INSERT INTO konto.portefoelje (konto_id, navn, dato) VALUES (6,'Medas portefoelje4','2024-05-07 20:00:00')

    INSERT INTO konto.portefoelje (konto_id, navn, dato) VALUES (10,'Mads portefoelje1','2024-05-07 20:00:00')
    INSERT INTO konto.portefoelje (konto_id, navn, dato) VALUES (10,'Mads portefoelje2','2024-05-07 20:00:00')
    INSERT INTO konto.portefoelje (konto_id, navn, dato) VALUES (10,'Mads portefoelje3','2024-05-07 20:00:00')
    INSERT INTO konto.portefoelje (konto_id, navn, dato) VALUES (10,'Mads portefoelje4','2024-05-07 20:00:00')

    INSERT INTO konto.portefoelje (konto_id, navn, dato) VALUES (14,'Nikolas portefoelje1','2024-05-07 20:00:00')
    INSERT INTO konto.portefoelje (konto_id, navn, dato) VALUES (14,'Nikolas portefoelje2','2024-05-07 20:00:00')
    INSERT INTO konto.portefoelje (konto_id, navn, dato) VALUES (14,'Nikolas portefoelje3','2024-05-07 20:00:00')
    INSERT INTO konto.portefoelje (konto_id, navn, dato) VALUES (14,'Nikolas portefoelje4','2024-05-07 20:00:00')


    INSERT INTO konto.portefoelje (konto_id, navn, dato) VALUES (17,'ForelæserPortefoelje','2024-05-07 20:00:00')
`;

const lavVPOplysninger = `
    CREATE TABLE vaerdipapir.vpoplysninger(
      vpoplysninger_id INT IDENTITY(1,1),
      navn NVARCHAR(50),
      symbol NVARCHAR(20),
      type NVARCHAR(50),
      CONSTRAINT vpoplysninger_PK PRIMARY KEY (symbol)
    );
      `;

const dataOmVP =
      `INSERT INTO vaerdipapir.vpoplysninger (navn, symbol, type)
        VALUES 
        ('Apple Inc.', 'AAPL', 'aktie'),
        ('Boeing Company', 'BA', 'aktie'),
        ('Novo Nordisk', 'NVO', 'aktie'),
        ('IBM', 'IBM', 'aktie'),
        ('Nike', 'NKE', 'aktie'),
        ('McDonalds', 'MCD', 'aktie'),
        ('Walmart Inc.', 'WMT', 'aktie'),
        ('Caterpiller Inc.', 'CAT', 'aktie')
        `;

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
        totalpris DECIMAL(10,2),
        valuta NVARCHAR(50),
        gebyr DECIMAL(10,2),
        datotid DATETIME,
        CONSTRAINT vphandler_PK PRIMARY KEY (vphandler_id),
        CONSTRAINT vpoplysninger1_FK FOREIGN KEY (symbol) REFERENCES vaerdipapir.vpoplysninger(symbol),
        CONSTRAINT fk_vphandler_konto FOREIGN KEY (konto_id) REFERENCES konto.kontooplysninger(konto_id)
      );
        `;


const dataiVpHandler = `insert into vaerdipapir.vphandler 
(symbol, portefoelje_id, konto_id, vaerditype, salg_koeb, antal, pris, totalpris, valuta, gebyr, datotid)
values  ('BA',   1, 2, 'aktie', 0, 100,  764.21,  76420.50,'DKK',  76.42, '2024-05-10 19:51:13.727'),        
        ('AAPL', 1, 2, 'aktie', 0, 10,  1098.70,  10986.95,'DKK',  10.99, '2024-05-10 20:11:29.057'),
        ('IBM',  1, 2, 'aktie', 0, 20,  1079.00,  21580.00,'DKK',  21.58, '2024-05-10 20:11:29.057'),
        ('MCD',  1, 2, 'aktie', 0, 150, 1761.50, 264225.00,'DKK', 264.23, '2024-05-10 20:11:29.057'),
        ('NKE',  1, 2, 'aktie', 0, 110,  603.20,  66352.00,'DKK',  66.35, '2024-05-10 20:11:29.057'),
        ('WMT',  1, 2, 'aktie', 0, 200,  395.46,  79092.00,'DKK',  79.09, '2024-05-10 20:11:29.057'),
        ('CAT',  1, 2, 'aktie', 0, 100, 2215.66, 221565.50,'DKK', 221.57, '2024-05-10 20:11:29.057'),

        ('BA',   5, 6, 'aktie', 0, 100,  764.21,  76420.50,'DKK',  76.42, '2024-05-10 19:51:13.727'),        
        ('AAPL', 5, 6, 'aktie', 0, 10,  1098.70,  10986.95,'DKK',  10.99, '2024-05-10 20:11:29.057'),
        ('IBM',  5, 6, 'aktie', 0, 20,  1079.00,  21580.00,'DKK',  21.58, '2024-05-10 20:11:29.057'),
        ('MCD',  5, 6, 'aktie', 0, 150, 1761.50, 264225.00,'DKK', 264.23, '2024-05-10 20:11:29.057'),
        ('NKE',  5, 6, 'aktie', 0, 110,  603.20,  66352.00,'DKK',  66.35, '2024-05-10 20:11:29.057'),
        ('WMT',  5, 6, 'aktie', 0, 200,  395.46,  79092.00,'DKK',  79.09, '2024-05-10 20:11:29.057'),
        ('CAT',  5, 6, 'aktie', 0, 100, 2215.66, 221565.50,'DKK', 221.57, '2024-05-10 20:11:29.057'),

        ('BA',   9, 10, 'aktie', 0, 100,  764.21,  76420.50,'DKK',  76.42, '2024-05-10 19:51:13.727'),        
        ('AAPL', 9, 10, 'aktie', 0, 10,  1098.70,  10986.95,'DKK',  10.99, '2024-05-10 20:11:29.057'),
        ('IBM',  9, 10, 'aktie', 0, 20,  1079.00,  21580.00,'DKK',  21.58, '2024-05-10 20:11:29.057'),
        ('MCD',  9, 10, 'aktie', 0, 150, 1761.50, 264225.00,'DKK', 264.23, '2024-05-10 20:11:29.057'),
        ('NKE',  9, 10, 'aktie', 0, 110,  603.20,  66352.00,'DKK',  66.35, '2024-05-10 20:11:29.057'),
        ('WMT',  9, 10, 'aktie', 0, 200,  395.46,  79092.00,'DKK',  79.09, '2024-05-10 20:11:29.057'),
        ('CAT',  9, 10, 'aktie', 0, 100, 2215.66, 221565.50,'DKK', 221.57, '2024-05-10 20:11:29.057'),

        ('BA',   13, 14, 'aktie', 0, 100,  764.21,  76420.50,'DKK',  76.42, '2024-05-10 19:51:13.727'),        
        ('AAPL', 13, 14, 'aktie', 0, 10,  1098.70,  10986.95,'DKK',  10.99, '2024-05-10 20:11:29.057'),
        ('IBM',  13, 14, 'aktie', 0, 20,  1079.00,  21580.00,'DKK',  21.58, '2024-05-10 20:11:29.057'),
        ('MCD',  13, 14, 'aktie', 0, 150, 1761.50, 264225.00,'DKK', 264.23, '2024-05-10 20:11:29.057'),
        ('NKE',  13, 14, 'aktie', 0, 110,  603.20,  66352.00,'DKK',  66.35, '2024-05-10 20:11:29.057'),
        ('WMT',  13, 14, 'aktie', 0, 200,  395.46,  79092.00,'DKK',  79.09, '2024-05-10 20:11:29.057'),
        ('CAT',  13, 14, 'aktie', 0, 100, 2215.66, 221565.50,'DKK', 221.57, '2024-05-10 20:11:29.057'),

        ('BA',   17, 17, 'aktie', 0, 100,  764.21,  76420.50,'DKK',  76.42, '2024-05-10 19:51:13.727'),        
        ('CAT',  17, 17, 'aktie', 0, 100, 2215.66, 221565.50,'DKK', 221.57, '2024-05-10 20:11:29.057')
        ;
        `;

const lavHistPorteVaerdi = `
      CREATE TABLE historiskdata.portefoeljevaerdi(
        histportvaerdi_id INT IDENTITY(1,1),
        portefoelje_id INT,
        vaerdi DECIMAL(10,2),
        valuta NVARCHAR(50),
        datotid DATETIME,        
        CONSTRAINT histportvaerdi_id PRIMARY KEY (histportvaerdi_id),
        CONSTRAINT portefoelje_PK FOREIGN KEY (portefoelje_id) REFERENCES konto.portefoelje(portefoelje_id)
      );
      `;

const dataiHistPorteVaerdi = `insert into historiskdata.portefoeljevaerdi 
    (portefoelje_id, vaerdi, valuta, datotid)
values  ( 1, 590000, 'DKK', '2024-05-10 19:51:13.727'),        
        ( 1, 630000, 'DKK', '2024-06-10 20:11:29.057'),
        ( 1, 710000, 'DKK', '2024-07-10 20:11:29.057'),
        ( 1, 681000, 'DKK', '2024-08-10 20:11:29.057'),
        ( 1, 693000, 'DKK', '2024-09-10 20:11:29.057'),
        ( 1, 745000, 'DKK', '2024-10-10 20:11:29.057'),
        ( 1, 750000, 'DKK', '2024-11-10 20:11:29.057'),
        ( 1, 810000, 'DKK', '2024-12-10 20:11:29.057'),
        ( 1, 830000, 'DKK', '2025-01-10 20:11:29.057'),
        ( 1, 953000, 'DKK', '2025-02-10 20:11:29.057'),
        ( 1, 820000, 'DKK', '2025-03-10 20:11:29.057'),
        ( 1, 800000, 'DKK', '2025-04-10 20:11:29.057'),

        ( 5, 590000, 'DKK', '2024-05-10 19:51:13.727'),        
        ( 5, 630000, 'DKK', '2024-06-10 20:11:29.057'),
        ( 5, 710000, 'DKK', '2024-07-10 20:11:29.057'),
        ( 5, 681000, 'DKK', '2024-08-10 20:11:29.057'),
        ( 5, 693000, 'DKK', '2024-09-10 20:11:29.057'),
        ( 5, 745000, 'DKK', '2024-10-10 20:11:29.057'),
        ( 5, 750000, 'DKK', '2024-11-10 20:11:29.057'),
        ( 5, 810000, 'DKK', '2024-12-10 20:11:29.057'),
        ( 5, 830000, 'DKK', '2025-01-10 20:11:29.057'),
        ( 5, 953000, 'DKK', '2025-02-10 20:11:29.057'),
        ( 5, 820000, 'DKK', '2025-03-10 20:11:29.057'),
        ( 5, 800000, 'DKK', '2025-04-10 20:11:29.057'),

        ( 9, 590000, 'DKK', '2024-05-10 19:51:13.727'),        
        ( 9, 630000, 'DKK', '2024-06-10 20:11:29.057'),
        ( 9, 710000, 'DKK', '2024-07-10 20:11:29.057'),
        ( 9, 681000, 'DKK', '2024-08-10 20:11:29.057'),
        ( 9, 693000, 'DKK', '2024-09-10 20:11:29.057'),
        ( 9, 745000, 'DKK', '2024-10-10 20:11:29.057'),
        ( 9, 750000, 'DKK', '2024-11-10 20:11:29.057'),
        ( 9, 810000, 'DKK', '2024-12-10 20:11:29.057'),
        ( 9, 830000, 'DKK', '2025-01-10 20:11:29.057'),
        ( 9, 953000, 'DKK', '2025-02-10 20:11:29.057'),
        ( 9, 820000, 'DKK', '2025-03-10 20:11:29.057'),
        ( 9, 800000, 'DKK', '2025-04-10 20:11:29.057'),

        ( 13, 590000, 'DKK', '2024-05-10 19:51:13.727'),        
        ( 13, 630000, 'DKK', '2024-06-10 20:11:29.057'),
        ( 13, 710000, 'DKK', '2024-07-10 20:11:29.057'),
        ( 13, 681000, 'DKK', '2024-08-10 20:11:29.057'),
        ( 13, 693000, 'DKK', '2024-09-10 20:11:29.057'),
        ( 13, 745000, 'DKK', '2024-10-10 20:11:29.057'),
        ( 13, 750000, 'DKK', '2024-11-10 20:11:29.057'),
        ( 13, 810000, 'DKK', '2024-12-10 20:11:29.057'),
        ( 13, 830000, 'DKK', '2025-01-10 20:11:29.057'),
        ( 13, 953000, 'DKK', '2025-02-10 20:11:29.057'),
        ( 13, 820000, 'DKK', '2025-03-10 20:11:29.057'),
        ( 13, 800000, 'DKK', '2025-04-10 20:11:29.057'),
         
        ( 17, 275000, 'DKK', '2024-05-10 19:51:13.727'),        
        ( 17, 290000, 'DKK', '2024-06-10 20:11:29.057'),
        ( 17, 325000, 'DKK', '2024-07-10 20:11:29.057'),
        ( 17, 302000, 'DKK', '2024-08-10 20:11:29.057'),
        ( 17, 308000, 'DKK', '2024-09-10 20:11:29.057'),
        ( 17, 319000, 'DKK', '2024-10-10 20:11:29.057'),
        ( 17, 321000, 'DKK', '2024-11-10 20:11:29.057'),
        ( 17, 340000, 'DKK', '2024-12-10 20:11:29.057'),
        ( 17, 345000, 'DKK', '2025-01-10 20:11:29.057'),
        ( 17, 361000, 'DKK', '2025-02-10 20:11:29.057'),
        ( 17, 345000, 'DKK', '2025-03-10 20:11:29.057'),
        ( 17, 310000, 'DKK', '2025-04-10 20:11:29.057')
        ;
        `;




// Vi laver en async function som sørger for at, alt bliver forbundet i den rigtig rækkefølge
async function ventPåDatabase() {
  
  console.log('Connet to database');
  // skaber forbindelse med din database
  await sql.connect(config); 

  //Dropper alle TABLES
  console.log('Drop all tabels');
  await sql.query(dropAllTables);

  //Dropper alle SCHEMAER
  console.log('Drop all schemas');
  await sql.query(dropAllSchemas);

  //Opretter alle SCHEMAER 
  console.log('Create all schemas');
  await sql.query(lavSchemaBruger);
  await sql.query(lavSchemaKonto);
  await sql.query(lavSchemaVaerdipapir);
  await sql.query(lavSchemaHistoriskData);

  // Opretter alle TABLES 
  console.log('Create all tables');
  await sql.query(lavBrugerTabel);
  await sql.query(lavKontoTabel);
  await sql.query(lavTransaktionersTabel);
  await sql.query(lavPortefoeljeTabel);
  await sql.query(lavVPOplysninger);
  await sql.query(lavVPHandler);
  await sql.query(lavHistPorteVaerdi);

  
  // Indsæt test data i tabeller
  await sql.query(dataibrugertabel);
  await sql.query(dataikontotabel);
  await sql.query(dataIPortefoeljeTabel);
  await sql.query(dataitransaktionstabel);
  await sql.query(dataOmVP); 
  await sql.query(dataiVpHandler); 
  await sql.query(dataiHistPorteVaerdi); 

  
  console.log('alt oprettet') // Kommer vi her til så er alt oprettet
};

//Kalder funktion
ventPåDatabase();





