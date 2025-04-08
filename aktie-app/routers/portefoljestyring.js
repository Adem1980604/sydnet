const express = require('express');
const router = express.Router();
router.use(express.json());
const { sql, forbindDatabase } = require('../db');  // tager fat i db filen 

// vi sætter vores ROUTES op for PORTEFØLJESTYRING.
router.get('/kontooplysninger', function(req, res) { 
    res.render('portestyring/kontooplysninger'); 
});

router.get('/zoom-på-1-portefølje', function(req, res) { 
    res.render('portestyring/zoom-på-1-portefølje'); 
});

router.get('/hentkontooplysninger', async function(req, res) {     
    const db = await forbindDatabase(); // forbinder til databasen 
    
    const resultater = await db.request()
        .query('SELECT * FROM konto.kontooplysninger') // henter alle konti fra databasen
    
    console.log(resultater.recordset);
    res.status(200).json(resultater.recordset); // recordset er en liste (array) med rækker, som du får fra databasen, når du bruger mssql 
});

router.get('/kontooplysninger/view', function(req, res) { 
    res.render('portestyring/kontooplysninger');
});


router.get('/konto-detalje', function(req, res) { 
    res.render('portestyring/kontooplysninger');
    // her skal vi på et eller andet måde få fat i en id for hvert konto der laves ved brug af SQL, 

});

  // Opretter en POST til tilføjelse af konto 

  router.post('/kontooplysninger', async function(req,res){

    const { navn, email, bank } = req.body
   

const db = await forbindDatabase();  // skaber en forbindelse med db

const resultater = await db.request()
 .input('navn', sql.NVarChar(100), navn)
 .input('email',sql.NVarChar(100), email)
 .input('bank',sql.NVarChar(100), bank)
 .query(`
         INSERT INTO konto.kontooplysninger(navn,email,bank)
          OUTPUT INSERTED.konto_id
         VALUES (@navn, @email, @bank)
         `
);

const konto_id = resultater.recordset[0].konto_id;

 
res.status(201).json({ konto_id });

     
});

// dette er opretelse af konto id siden (konto-detaljer), altså npr der bliver trykket på se detaljer komme siden frem afhængig af id
router.get('/konto/:id' , async function(req,res){
const db = await forbindDatabase();
const konto_id = req.params.id // vi henter det :id parameter fra URL’en, som brugeren har besøg

const kontoResultater = await db.request()
.input('id', sql.Int, konto_id)
.query('SELECT * FROM konto.kontooplysninger WHERE konto_id = @id');

const indsendelserResultater = await db.request()
.input('id', sql.Int, konto_id)
.query('SELECT * FROM konto.transaktioner WHERE konto_id = @id');

// Gem første række fra kontodata 
const konto = kontoResultater.recordset[0];

// Hent alle transaktioner 
  const indsendelser = indsendelserResultater.recordset;

// render siden med data 
  res.render('portestyring/konto-detalje', {
    konto,
    indsendelser
  });
});




module.exports = router 