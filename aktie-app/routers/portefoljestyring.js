const express = require('express');
const router = express.Router();
router.use(express.json());
const { sql, forbindDatabase } = require('../db');  // tager fat i db filen 
const PortefoljeBeregner = require('../logik/PorteBeregner'); // logiken til beregning af portefølje funktionaliteter 
const axios = require('axios'); // axios, som er et moderne og populært HTTP-klientbibliotek Denne gør HTTP kaldet mere simpelt og lækkert



//*********************************************************************
//********************* ROUTES for KONTO ******************************
//*********************************************************************

// Venstre side af kontooplysninger (under opret konto)
router.get('/kontooplysninger', async function (req, res) {
  console.log("DEBUG: 000 - initiated route get /kontooplysninger");
  const db = await forbindDatabase();
  const result = await db.request().query(`
    SELECT * FROM konto.kontooplysninger
    WHERE aktiv = 1
  `);
  const konti = result.recordset;
  res.render('portestyring/kontooplysninger', { konti });
  console.log("DEBUG: 002 - get Kontooplysninger");
});

// Henter alle konti og viser dem på Eksisterende Konti siden
router.get('/hentkontooplysninger', async function (req, res) {
  console.log("DEBUG: 010 - initiated route get /hentkontooplysninger");
  //console.log(req);
  //console.log("Bearer_token provided by the client in request header")
  //console.log(req.session.bearer_token);

  const loggedin_bruger_id = req.session.bruger_id;

  const db = await forbindDatabase(); // forbinder til databasen 
  // sørger for at vi kun få vist de aktive konti på siden

  
  const result = await db.request()
  .input('loggedin_bruger_id', sql.Int, loggedin_bruger_id)
  .query(`
    SELECT * FROM konto.kontooplysninger
    WHERE aktiv = 1 and bruger_id = @loggedin_bruger_id
  `);
  res.json(result.recordset);
  console.log("DEBUG: 012 - get hentkontoooplysninger");
});


//router.get('/kontooplysninger/view', function (req, res) {
//  res.render('portestyring/kontooplysninger');
//  console.log("DEBUG: 020 - get kontoooplysninger");
//});
//
//router.get('/konto-detalje', function (req, res) {
//  res.render('portestyring/kontooplysninger');
//  console.log("DEBUG: 030 - get konto-detalje");
//  // her skal vi på et eller andet måde få fat i en id for hvert konto der laves ved brug af SQL, 
//});

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
  console.log("DEBUG: 040 - post kontoooplysninger");
});

// dette er oprettelse af konto id siden (konto-detaljer), altså når der bliver trykket på se detaljer kommer siden frem afhængig af id
router.get('/konto/:id', async function (req, res) {
  console.log("DEBUG: 050 - initiated route konto/id");
  const db = await forbindDatabase();
  const konto_id = req.params.id // vi henter det :id parameter fra URL’en, som brugeren har besøgt
  const kontoResultater = await db.request()
    .input('id', sql.Int, konto_id)
    .query('SELECT * FROM konto.kontooplysninger WHERE konto_id = @id')
  // Gem første række fra kontodata 
  const konto = kontoResultater.recordset[0];

  // Hent Saldo
  const kontoSaldo = await db.request()
    .input('id', sql.Int, konto_id)
    .query('SELECT saldo FROM konto.kontooplysninger WHERE konto_id = @id')
  const minSaldo = kontoSaldo.recordset;

  
  // Hent alle transaktioner 
  const transaktionerResultater = await db.request()
    .input('id', sql.Int, konto_id)
    //.query('SELECT * FROM konto.transaktioner WHERE transaktions_id = @id');
    .query(`SELECT * 
            FROM konto.transaktioner 
            WHERE konto_id = @id
            ORDER BY transaktions_id`);
  const transaktioner = transaktionerResultater.recordset;

    // Hent porteføljer
  const portefoljeResultater = await db.request()
    .input('id', sql.Int, konto_id)
    .query('SELECT * FROM konto.portefoelje WHERE konto_id = @id');
  const portefoljer = portefoljeResultater.recordset;
   
  //console.log("DEBUG: 055 ********");
  //console.log(konto);
  // render siden med data 
  res.render('portestyring/konto-detalje', {
    konto, // vi sender konti object til konto_detalje.ejs
    transaktioner, // hvis vi vil sende indsættelsesdata til ejs siden
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


//*********************************************************************
//********************* ROUTES for PORTEFØLJESTYRING ******************
//*********************************************************************

router.get('/portefoeljeoversigt', async function (req, res) {
  console.log("DEBUG: 080 - initiated route /portefoeljeoversigt");


  const loggedin_bruger_id = req.session.bruger_id; // man henter brugerid fra sessionen, så systemet ved hvad for en bruger vi arbejder med

  const db = await forbindDatabase();

  const konto_id = req.params.id // vi henter det :id parameter fra URL’en, som brugeren har besøgt

  // Henter konto
  const kontoResultater = await db.request()
    .input('loggedin_bruger_id', sql.Int, loggedin_bruger_id)
    .input('id', sql.Int, konto_id)
    .query('SELECT * FROM konto.kontooplysninger WHERE bruger_id = @loggedin_bruger_id')
  /// Gem første række fra kontodata 

  const konto = kontoResultater.recordset;
  //console.log("*************Konto**********");
  //console.log(konto);



    // Hent alle porteføljer for brugeren
  const portefoljeResultater = await db.request() 
    .input('loggedin_bruger_id', sql.Int, loggedin_bruger_id)   
    .query(`
      SELECT 
        portf.portefoelje_id, 
        portf.konto_id, 
        portf.navn, 
        portf.dato,
        ktoopl.navn as kontonavn
      FROM konto.portefoelje portf
      JOIN konto.kontooplysninger ktoopl on portf.konto_id = ktoopl.konto_id
      WHERE ktoopl.bruger_id = @loggedin_bruger_id`
    );
  const portefoljer = portefoljeResultater.recordset;

  //console.log("DEBUG: 085 ********");
  //console.log(portefoljer);


  // vi henter total værdi for hver portfølje som skla bruges til at lave en piechart 

  
  // Brug klassen på hver portefølje
  for (let i = 0; i < portefoljer.length; i++) {
    const portefolje = portefoljer[i];

// Man henter alle handler (køb/salg) tilhørende den portefølje
    const handlerResultat = await db.request()
      .input('portefoelje_id', sql.Int, portefolje.portefoelje_id)
      .query(`
        SELECT h.antal, h.pris, h.datotid, h.valuta, h.vaerditype, h.salg_koeb,
               v.symbol, v.navn
        FROM vaerdipapir.vphandler h
        JOIN vaerdipapir.vpoplysninger v ON h.symbol = v.symbol
        WHERE h.portefoelje_id = @portefoelje_id
      `);

    const handler = handlerResultat.recordset;


    // her broger vi klassen fra logik filen til at beregne ejerstruktur
    const beregner = new PortefoljeBeregner(handler); //  opretter en ny beregner-klasse og beregner ejerListe og GAK.
    beregner.beregnEjerOgGAK(); // kalder på metode der beregner GAK osv...


      // For hver aktie i porteføljen hentes live pris, her opdateres der pris på værdipapir
      for (let j = 0; j < beregner.ejerListeFiltreret.length; j++) {
        const aktie = beregner.ejerListeFiltreret[j];
    
          const apiSvar = await axios.get(`http://localhost:4000/aktiesoeg/hentaktiekurs/${aktie.symbol}`);
          const timeSeries = apiSvar.data['Time Series (60min)'];
          const senesteTidspunkt = Object.keys(timeSeries)[0];
          const aktuelPris = parseFloat(timeSeries[senesteTidspunkt]['1. open']);
          aktie.pris = aktuelPris;
          console.log(aktuelPris); 
        
      };


   // Beregn totals baseret på opdaterede priser
    const totaler = beregner.beregnTotaler();

    // Gem totals på portefølje, så vi kan vise det via vores EJS fil
    portefolje.totalErhvervelsespris = totaler.totalErhvervelsespris || 0;
    portefolje.totalForventetVaerdi = totaler.totalForventetVaerdi || 0;
    portefolje.totalUrealiseretGevinstTab = totaler.totalUrealiseretGevinstTab || 0;
}

  res.render('portestyring/portefoeljeoversigt', {
    konto,
    portefoljer
  });
});


router.get('/portefoelje-detaljer', function (req, res) {
  res.render('portestyring/portefoelje-detaljer');
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
      handler
    }

  });

});

// ruten til at gå ind på den individuelle portefølje for en bruger 

router.get('/porteside/:id', async function (req, res) {
  const db = await forbindDatabase();
  const portefoljeId = req.params.id; // her tager vi fat i id for porteføjen


  // Hen den specifikke portefølje fra databsen
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


// VI henter handler + info om værdipapir som kan vises i tabel (porefølje-detalje-ejs)
const handlerResultat = await db.request() 
  .input('id', sql.Int, portefoljeId)
  .query(`
    SELECT h.antal, h.pris, h.datotid, h.valuta, h.vaerditype, h.salg_koeb,
           v.symbol, v.navn
    FROM vaerdipapir.vphandler h
    JOIN vaerdipapir.vpoplysninger v ON h.symbol = v.symbol
    WHERE h.portefoelje_id = @id
  `);

  const handler = handlerResultat.recordset;

  //console.log("Handler fra databasen:", handler); 

  // hent hele aktielisten
  const aktielisteresultat = await db.request()
    .query(`SELECT symbol, navn FROM vaerdipapir.vpoplysninger`);
  const aktieliste = aktielisteresultat.recordset;

  // brug funktionaliteten fra klassen her til at beregne GAK osv for enkel portefølje
  const beregner = new PortefoljeBeregner(handler);
  beregner.beregnEjerOgGAK();


    // HER henter vi de NYESTE aktiekurser for hver aktie
    for (let i = 0; i < beregner.ejerListeFiltreret.length; i++) {
      const aktie = beregner.ejerListeFiltreret[i];
      
        const apiSvar = await axios.get(`http://localhost:4000/aktiesoeg/hentaktiekurs/${aktie.symbol}`);
        const timeSeries = apiSvar.data['Time Series (60min)'];
        const senesteTidspunkt = Object.keys(timeSeries)[0];
        const aktuelPris = parseFloat(timeSeries[senesteTidspunkt]['1. open']);
        aktie.pris = aktuelPris; // Her opdateres aktuel pris
       
      
    }
  
  
  
  // 11. Når alle aktiepriser er hentet, beregner vi totaler
  const totaler = beregner.beregnTotaler();

  // Sender data videre til EJS 
  res.render('portestyring/portefoelje-detaljer', {
    portefolje, // den valgte portefolje
    portefoljer: [], // henter flere, ellers tom array
    konto_id,
    handler, // alle handler lavet i porteføljen 
    aktieliste, // liste over alle akiter 
    ejerListeFiltreret: beregner.ejerListeFiltreret, //de ekjer brugeren ejer nu 
    gakBeregning: beregner.gakBeregning, // info om GAK
  // totalErhvervelsespris: totaler.totalErhvervelsespris, // samlet købspris
    totalForventetVaerdi: totaler.totalForventetVaerdi, // samlet forventet værdi 
    totalUrealiseretGevinstTab: totaler.totalUrealiseretGevinstTab // samlet urealiseret gevidst/tak
  });
});


// ruten som gemmer handlen for den specifikke portefølje 
router.post('/portesiden/:id/handel', async function (req, res) {
  const db = await forbindDatabase();
  const portefoelje_id = req.params.id; // her tager vi fat i id for porteføjen
  
  // tager fat i værdierne fra ejs filen
  const {
    konto_id,
    vaerditype,
    valuta,
    type, // køb eller salg
  } = req.body;

  // så vi ikke får fetch fejl 500 
   let pris = parseFloat(req.body.pris);
   let antal = parseInt(req.body.antal);

  // tilkobler dato og beregner gebyr 
  const datotid = new Date();
  const gebyr = pris * 0.001; // 0.1 % gebyr 
  const total = (pris * antal) + gebyr;

  // her tjekker vi om brugeren vil sælge eller handle 
  let salg_koeb
  if (type === "salg") {
    salg_koeb = 1; // hvis det er salg sæt den til 1
  } else {
    salg_koeb = 0;
  }

  // 1: tjek saldo om brugeren har nok penge på den specifikke konto 
  const saldoResultat = await db.request()
    .input('konto_id', sql.Int, konto_id)
    .query(`
      SELECT saldo FROM konto.kontooplysninger
      WHERE konto_id = @konto_id
    `);
  const saldo = saldoResultat.recordset[0].saldo;

  // 2. hvis det er køb og saldoen er for lav så send fejl 
  if (type === "kob" && saldo < total) {
    console.log("Vi sender fejlmeddelelse til clienten med besked om at der ikke er penge nok.")
    // Retur besked bliver sendt men message bliver ikke vist korrekt på klienten.
    return res.status(400).json({ success: false, message: "Ikke nok penge på kontoen" });
    //res.statusMessage = "Ikke nok penge på kontoen";
    //res.status(400).end();
    return res;
  }

// vi tager fat i id for værdipapir som skal bruges i handlen 
const symbol = req.body.symbol;

// Find vpoplysninger_id baseret på symbol
//const vpResultat = await db.request()
//  .input('symbol', sql.NVarChar(20), symbol)
//  .query(`
//    SELECT vpoplysninger_id 
//    FROM vaerdipapir.vpoplysninger 
//    WHERE symbol = @symbol
//  `);

//if (vpResultat.recordset.length === 0) {
//  return res.status(404).json({ success: false, message: "Værdipapir ikke fundet." });
//}

//vpoplysninger_id = vpResultat.recordset[0].vpoplysninger_id;

// 2.1 Indsæt aktien i vpoplysninger hvis den ikke findes i forvejen

try {
  await db.request()
  .input('navn', sql.NVarChar(20), symbol)
  .input('symbol', sql.NVarChar(20), symbol)
  .input('vaerditype', sql.NVarChar(50), vaerditype)
  .query(`
    IF NOT EXISTS (SELECT * FROM vaerdipapir.vpoplysninger WHERE symbol = @symbol)
    BEGIN
      INSERT INTO vaerdipapir.vpoplysninger
      (navn,symbol,type)
      VALUES
      (@navn,@symbol,@vaerditype)
    END
  `); 
} catch (error) {
  console.log("ERROR: Der skete en fejl i forbindelse med: Indsæt aktien i vpoplysninger hvis den ikke findes i forvejen")
  console.log(error.message)
}



try {
  // 3. indsæt handel 
  await db.request()
    .input('symbol', sql.NVarChar(20), symbol)
    .input('portefoelje_id', sql.Int, portefoelje_id)
    .input('konto_id', sql.Int, konto_id)
    .input('vaerditype', sql.NVarChar(50), vaerditype)
    .input('salg_koeb', sql.Bit, salg_koeb)
    .input('antal', sql.Int, antal)
    .input('pris', sql.Decimal(10, 2), pris)
    .input('valuta', sql.NVarChar(50), valuta)
    .input('gebyr', sql.Decimal(10, 2), gebyr)
    .input('datotid', sql.DateTime, datotid)
    .query(`
      INSERT INTO vaerdipapir.vphandler
      (symbol,portefoelje_id,konto_id, vaerditype,salg_koeb, antal, pris, valuta, gebyr, datotid)
      VALUES
      (@symbol, @portefoelje_id, @konto_id, @vaerditype, @salg_koeb, @antal, @pris, @valuta, @gebyr, @datotid)
    `);
  } catch (error) {
    console.log("ERROR: Der skete en fejl i forbindelse med: Indsæt handel i databasen")
    console.log(error.message)
  }

  // 4. opret transkation ( dette er vigtigt for opdatering af konto tabel og dens værdier)

  // vi tjekker hvad for en type transkation det er 
  let transaktionsVaerdi;

  if (type === "kob") {
    transaktionsVaerdi = -total;
  } else {
    transaktionsVaerdi = total;
  }
  
  // vi indsætter de nye værdier i transaktionstablen 
  await db.request()
    .input('konto_id', sql.Int, konto_id)
    .input('vaerdi', sql.Decimal(10, 2), transaktionsVaerdi)
    .input('transaktionstype', sql.NVarChar(20), `handel-${type}`)
    .input('valuta', sql.NVarChar(50), valuta)
    .input('datotid', sql.DateTime, datotid)
    .query(`
      INSERT INTO konto.transaktioner (konto_id, vaerdi, transaktionstype, valuta, datotid)
      VALUES (@konto_id, @vaerdi, @transaktionstype, @valuta, @datotid)
    `);

    // 5. Opdater kontoens saldo
  await db.request()
    .input('konto_id', sql.Int, konto_id)
    .input('ændring', sql.Decimal(10, 2), transaktionsVaerdi)
    .query(`
      UPDATE konto.kontooplysninger
      SET saldo = saldo + @ændring
      WHERE konto_id = @konto_id
    `);
 
  // send svar 
  res.json({
    success: true,
    handel: {
      symbol,
      portefoelje_id,
      konto_id,
      vaerditype,
      salg_koeb,
      antal,
      pris,
      valuta,
      gebyr,
      datotid: datotid.toLocaleString()
    }

  });

});

router.get('/vaerdipapir/:symbol', async function (req, res) {
  const db = await forbindDatabase();
  const symbol = req.params.symbol;

  const resultat = await db.request()
    .input('symbol', sql.NVarChar(20), symbol)
    .query(`
      SELECT * FROM vaerdipapir.vpoplysninger
      WHERE symbol = @symbol
    `);

  const info = resultat.recordset[0];


  res.render('portestyring/vpapir-detalje', { info });
});



module.exports = router 