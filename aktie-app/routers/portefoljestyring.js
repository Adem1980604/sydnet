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

router.get('/hentkontooplysninger', async (req, res) => {

  const db = await forbindDatabase(); // forbinder til databasen 

  // sørger for at vi kun få vist de aktive konti på siden
  const result = await db.request().query(`
    SELECT * FROM konto.kontooplysninger
    WHERE aktiv = 1 
  `);
  res.json(result.recordset);
});2


router.get('/kontooplysninger/view', function(req, res) { 
    res.render('portestyring/kontooplysninger');
});


router.get('/konto-detalje', function(req, res) { 
    res.render('portestyring/kontooplysninger');
    // her skal vi på et eller andet måde få fat i en id for hvert konto der laves ved brug af SQL, 

});

  // Opretter en POST til tilføjelse af konto 

  router.post('/kontooplysninger', async function(req,res){

    const { navn, bank_ref } = req.body
    const saldo = 0.00;

    const bruger_id = req.session.bruger_id; // henter bruger_id fra sessionen, sessionen bruges så systmet hved hvem brugeren er når man skifter imellem forskellige sider
    const nuværendeTid = new Date(); // tager fat i nutidens dato

const db = await forbindDatabase();  // skaber en forbindelse med db

const resultater = await db.request()
 .input('navn', sql.NVarChar(100), navn)
 .input('bank_ref',sql.NVarChar(100), bank_ref)
 .input('oprettet', sql.DateTime,nuværendeTid)
 .input('saldo',sql.Decimal(15,2), saldo)
 .input('bruger_id', sql.Int, bruger_id)
 .input('aktiv', sql.Bit, 1) // Aktiv = true 
 .input('nedlagt', sql.DateTime, null) // Nedlagt = null ( der skal nok laves en ekstra rute til nedlæggelse af konto)
 .input('valuta', sql.NVarChar(50), 'DKK')
 .query(`
         INSERT INTO konto.kontooplysninger(navn,bank_ref,oprettet, saldo, bruger_id, aktiv, nedlagt, valuta)
          OUTPUT INSERTED.konto_id
         VALUES (@navn, @bank_ref, @oprettet, @saldo, @bruger_id, @aktiv, @nedlagt, @valuta)
         `
);

const konto_id = resultater.recordset[0].konto_id;

 
res.json({
  success: true,
  konto_oprettelse: {
    navn,
    bank_ref,
    konto_id,
    saldo,
    bruger_id,
    tid: nuværendeTid.toLocaleString(),
    aktiv: true
  }
});
console.log("Bruger ID fra session:", bruger_id);

console.log("konto oprettet:", req.body); //tjek 

});


// dette er opretelse af konto id siden (konto-detaljer), altså npr der bliver trykket på se detaljer komme siden frem afhængig af id
router.get('/konto/:id' , async function(req,res){
const db = await forbindDatabase();


const konto_id = req.params.id // vi henter det :id parameter fra URL’en, som brugeren har besøgt


const kontoResultater = await db.request()
.input('id', sql.Int, konto_id)

.query('SELECT * FROM konto.kontooplysninger WHERE konto_id = @id')



const indsendelserResultater = await db.request()
.input('id', sql.Int, konto_id)
.query('SELECT * FROM konto.transaktioner WHERE transaktions_id = @id');

// Gem første række fra kontodata 
const konto = kontoResultater.recordset[0];

 // Hent porteføljer
 const portefoljeResultater = await db.request()
 .input('id', sql.Int, konto_id)
 .query('SELECT * FROM konto.portefoelje WHERE konto_id = @id');
const portefoljer = portefoljeResultater.recordset;


// Hent alle transaktioner 
  const indsendelser = indsendelserResultater.recordset;

// render siden med data 
  res.render('portestyring/konto-detalje', {
     konto,
    konto_id, // vi sender konti_id til konto_detalje.ejs
    indsendelser, // hvis vi vil sende indsendelsesdata til ejs siden
    portefoljer // sendes til EJS
  });
});

// ruten til at slette konto 

router.delete('/slet-konto/:id', async (req, res) => {
  const kontoId = req.params.id; // tager fat i den tilhørende konto man er inde på 
  const nuværendeTid = new Date(); // tager fat i nutidens dato



    const db = await forbindDatabase();
 
    // slette selve konto 
    await db.request()
      .input('kontoId', sql.Int, kontoId)
      .input('nedlagt', sql.DateTime, nuværendeTid) 
      .query(`
       UPDATE konto.kontooplysninger 
      SET aktiv = 0, nedlagt = @nedlagt
      WHERE konto_id = @kontoId

      `);
      res.json({ 
        success: true, 
        konto_slettet: {
          tid: nuværendeTid.toLocaleString(),
          nedlagt: nuværendeTid.toLocaleString(),
          aktiv: false
        }
      });


    });

   
    

// ruten til oprettels af portefølje  
router.post('/opret-portefolje', async function(req, res) {
  const { navn, konto_id } = req.body; // vi får data, som blev sendt fra fetch()
  const dato = new Date();

  const db = await forbindDatabase();

   const result =  await db.request()
      .input('navn', sql.NVarChar(100), navn)
      .input('dato', sql.Date, dato)
      .input('konto_id', sql.Int, konto_id)
      .query(`
        INSERT INTO konto.portefoelje (navn, dato, konto_id)
         OUTPUT INSERTED.portefoelje_id
        VALUES (@navn, @dato, @konto_id)
      `);

      
const portefoelje_id = result.recordset[0].portefoelje_id;

    res.json({ success: true,
      portefolje_oprettelse: {
        portefoelje_id,
        navn,
        dato,
        konto_id,

      }

     });

});


module.exports = router 