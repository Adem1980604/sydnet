const express = require('express');
const router = express.Router();
router.use(express.json());
const { sql, forbindDatabase } = require('../db');  // tager fat i db filen 





//********************* ROUTES for PORTEFØLJESTYRING ******************


router.get('/kontooplysninger', function (req, res) {
  res.render('portestyring/kontooplysninger');
});

router.get('/portefoelje-detaljer', function (req, res) {
  res.render('portestyring/portefoelje-detaljer');
});


router.get('/hentkontooplysninger', async function (req, res) {

  const db = await forbindDatabase(); // forbinder til databasen 

  // sørger for at vi kun få vist de aktive konti på siden
  const result = await db.request().query(`
    SELECT * FROM konto.kontooplysninger
    WHERE aktiv = 1 
  `);
  res.json(result.recordset);
});

router.get('/kontooplysninger/view', function (req, res) {
  res.render('portestyring/kontooplysninger');
});


router.get('/konto-detalje', function (req, res) {
  res.render('portestyring/kontooplysninger');
  // her skal vi på et eller andet måde få fat i en id for hvert konto der laves ved brug af SQL, 

});

// Opretter en POST til tilføjelse af konto 

router.post('/kontooplysninger', async function (req, res) {

  const { navn, bank_ref } = req.body
  const saldo = 0.00;

  const bruger_id = req.session.bruger_id; // henter bruger_id fra sessionen, sessionen bruges så systmet hved hvem brugeren er når man skifter imellem forskellige sider
  const nuværendeTid = new Date(); // tager fat i nutidens dato

  const db = await forbindDatabase();  // skaber en forbindelse med db

  const resultater = await db.request()
    .input('navn', sql.NVarChar(100), navn)
    .input('bank_ref', sql.NVarChar(100), bank_ref)
    .input('oprettet', sql.DateTime, nuværendeTid)
    .input('saldo', sql.Decimal(15, 2), saldo)
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


// dette er opretelse af konto id siden (konto-detaljer), altså når der bliver trykket på se detaljer komme siden frem afhængig af id
router.get('/konto/:id', async function (req, res) {
  const db = await forbindDatabase();


  const konto_id = req.params.id // vi henter det :id parameter fra URL’en, som brugeren har besøgt


  const kontoResultater = await db.request()
    .input('id', sql.Int, konto_id)

    .query('SELECT * FROM konto.kontooplysninger WHERE konto_id = @id')



  const indsaettelserResultater = await db.request()
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
  const indsaettelser = indsaettelserResultater.recordset;

  // render siden med data 
  res.render('portestyring/konto-detalje', {
    konto,
    konto_id, // vi sender konti_id til konto_detalje.ejs
    indsaettelser, // hvis vi vil sende indsættelsesdata til ejs siden
    portefoljer // sendes til EJS
  });
});

// ruten til at slette konto 

router.delete('/slet-konto/:id', async function (req, res) {
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
router.post('/opret-portefolje', async function (req, res) {
  const { navn, konto_id } = req.body; // vi får data, som blev sendt fra fetch()
  const dato = new Date();

  const db = await forbindDatabase();

  const result = await db.request()
    .input('navn', sql.NVarChar(100), navn)
    .input('dato', sql.Date, dato)
    .input('konto_id', sql.Int, konto_id)
    .query(`
        INSERT INTO konto.portefoelje (navn, dato, konto_id)
         OUTPUT INSERTED.portefoelje_id
        VALUES (@navn, @dato, @konto_id)
      `);


  const portefoelje_id = result.recordset[0].portefoelje_id;

  res.json({
    success: true,
    portefolje_oprettelse: {
      portefoelje_id,
      navn,
      dato,
      konto_id,

    }

  });

});

// ruten til at gå ind på den individuelle portefølje for en bruger 
// altså ruten sørger for at vise siden 
router.get('/porteside/:id', async function(req, res) {
  const db = await forbindDatabase();
  const portefoljeId = req.params.id; // her tager vi fat i id for porteføjen

  // Hent den specifikke portefølje
  const result = await db.request()
    .input('id', sql.Int, portefoljeId)
    .query(`SELECT * FROM konto.portefoelje WHERE portefoelje_id = @id`);

  const portefolje = result.recordset[0]; // Her tager vi den første række i svaret – altså den portefølje brugeren har klikket på

  const konto_id = portefolje.konto_id; // Hver portefølje tilhører en konto – derfor henter vi konto_id fra porteføljen

  // Hent alle porteføljer for den samme konto
  // Nu henter vi alle porteføljer, der tilhører samme konto – så sidebar kan vise dem alle
  const allePortefoljer = await db.request()
    .input('konto_id', sql.Int, konto_id)
    .query(`SELECT * FROM konto.portefoelje WHERE konto_id = @konto_id`);


  const portefoljer = allePortefoljer.recordset; // Vi gemmer dem i en variabel, så vi kan sende dem videre

  // Send dem alle til din EJS-side
  res.render('portestyring/portefoelje-detaljer', {
    portefolje, // den vagte portefølje
    portefoljer, // alle porteføljer for kontoen 
    konto_id // så vi kan linke tilbage 
  });
});

// ruten som gemmer handlen for den specifikke portefølje 

router.post('/portesiden/:id/handel', async function(req, res){
  const db = await forbindDatabase();
  const portefoelje_id = req.params.id; // her tager vi fat i id for porteføjen
  const {
    konto_id,
    vaerditype,
    antal,
    pris,
    valuta,
    type, // køb eller salg
    vpoplysninger_id 
  } = req.body;

  const datotid = new Date();
  const gebyr = pris * 0.001; // 0.1 % gebyr 
  let salg_koeb;


  if (type === "salg") {
    salg_koeb = 1; // hvis det er salg sæt den til 1
  } else {
    salg_koeb = 0;
  }
  


  await db.request()
  .input('vpoplysninger_id', sql.Int, vpoplysninger_id)
    .input('portefoelje_id', sql.Int, portefoelje_id)
    .input('konto_id', sql.Int, konto_id)
    .input('vaerditype', sql.NVarChar(50), vaerditype)
    .input('salg_koeb', sql.Bit, salg_koeb)
    .input('antal', sql.Int, antal)
    .input('pris', sql.Decimal(10,2), pris)
    .input('valuta', sql.NVarChar(50), valuta)
    .input('type', sql.NVarChar(50), type)
    .input('gebyr', sql.Decimal(10,2), gebyr)
    .input('datotid', sql.DateTime, datotid)
    .query(`
      INSERT INTO vaerdipapir.vphandler
      (vpoplysninger_id,portefoelje_id,konto_id, vaerditype,salg_koeb, antal, pris, valuta, gebyr, datotid)
      VALUES
      (@vpoplysninger_id, @portefoelje_id, @konto_id, @vaerditype, @salg_koeb, @antal, @pris, @valuta, @gebyr, @datotid)
    `);


    res.json({ success: true,
      handel: {
        vpoplysninger_id,
        portefoelje_id,
        konto_id, 
        vaerditype,
        salg_koeb, 
        antal, 
        pris, 
        valuta, 
        gebyr, 
        datotid:datotid.toLocaleString()
      }

     });

});





// ruten til at genaktiverer konto 

router.post('/genaktiver-konto/:id', async function (req, res) {

  const kontoId = req.params.id; // tager fat i den tilhørende konto id som brugeren vil genåbne
  const db = await forbindDatabase(); // forbinder til databasen 
  await db.request()
    .input('Id', sql.Int, kontoId)
    // vi tager fat i alle lukkede konti 
    .query(` 
    UPDATE konto.kontooplysninger
    SET aktiv = 1, nedlagt = NULL 
     WHERE konto_id = @Id
  `);

  res.json({ success: true });
});

// ruten til at hente lukkede konto fra db 

router.get('/hent-lukkede-konti', async function (req, res) {
  const db = await forbindDatabase();

  const result = await db.request().query(`
    SELECT * FROM konto.kontooplysninger
    WHERE aktiv = 0
  `);

  res.json(result.recordset);
});







module.exports = router 