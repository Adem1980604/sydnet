const express = require('express');
const router = express.Router();

//Søger for at vi kan oprette forbindelse til databasen vis vores db.js
const { sql, forbindDatabase } = require('../db');

const { query } = require('mssql');
require('dotenv').config(); // sørger for at tage fat i vores env fil

//Søger for at vi kan bruge vores klasse fra PorteBeregner.js
const PortefoljeBeregner = require('../logik/PorteBeregner');




// vi sætter vores ROUTES op for BRUGER SIDER.
// GET bruges til at vise log-ind siden 

//***********************************************************
//******* BRUGER OPRET, LOG-IND, LOGOFF ***********************
//***********************************************************

//**************** BRUGER OPRET ***********************
// Søger for at bruger-oprettelses siden bliver vist når en bruger klikker/søger efter den.
router.get('/bruger-oprettelse', function (req, res) {
    res.render('bruger-sider/bruger-oprettelse');
});

// Håndter post med data fra bruger-oprettelse.ejs.
// Får brugers info ud af requesten
router.post('/register', async (req, res) => {
    const { username, password, repeatPassword, email } = req.body;

    // Tjek for tomme felter først. !!!Dette er dobbelttjek, da det allerede sker i bruger-oprettelse.ejs HTML formen
    if (!username || !password || !repeatPassword) {
        return res.status(400).json({ success: false, message: "Udfyld alle felter" });
    }
    // Tjek om adgangskoderne matcher
    if (password !== repeatPassword) {
        return res.status(400).json({ success: false, message: "Adgangskoderne matcher ikke" });
    }

    // Skaber en forbindelse med db
    const db = await forbindDatabase();

    //************* FORSØG(VIRKER IKKE) - Funktion: BRUGER FINDES ALLEREDE I DB **************************/
    /*
    //Check om bruger allerede findes i databasen, og derfor ikke kan "gen"oprette sig.
    db_result = 
        await db.request()
            .input('name', sql.NVarChar(100), username)        
            .query(`SELECT username
                FROM bruger.oplysninger 
                WHERE username=@name`)
    try {
        const db_username = db_result.recordset[0].username
        console.log("db_username er : " + db_result.recordset[0].username + " Den findes allerede ")
        //return res.status(200).json({ success: true, message: "OK" });
        return res.status(400).json({ success: false, message: "Password er forkert" });
        //return res.status(400).json({ success: false, message: "Bruger id findes allerede - kan ikke oprettes igen." });
    } catch {
        // Så findes brugeren ikke i forvejen og så skal vi bare fortsætte
    }
*/
    //Hvis alt er gået godt, så indsætter vi den nye brugers info i databasen(I bruger.oplysninger)
    await db.request()
        .input('name', sql.NVarChar(100), username)
        .input('password', sql.NVarChar(100), password)
        .input('email', sql.NVarChar(100), email)
        .query(
            `INSERT INTO bruger.oplysninger (username, password, email) 
          VALUES (@name, @password, @email)`);

    //Redirecter os til log-ind siden når brugeren er oprettet.
    return res.redirect('/bruger/log-ind');
});

//********* LOG-IND ************************
// Søger for at log-ind siden bliver vist når en bruger klikker/søger efter den.
// Inden under den givne fil, står der hvordan siden skal se ud og derved hvad der skal vises i browseren.
router.get('/log-ind', function (req, res) {
    res.render('bruger-sider/log-ind');
});

//Denne post bliver sendt fra "log-ind.ejs" filen. Med den kommer information om et indtastet brugernavn og adgangskode
router.post('/log-ind', async (req, res) => {
    //console.log(req); // Se hele requesten
    //console.log(req.body); // Ser kun på den del af requesten som indeholde brugernavn og adgangskode
    
    //Sætter brugernavn og adgangskode "tilbage" ind i to variable(brugernavn og adgangskode)
    const { brugernavn, adgangskode } = req.body; 

    //Hvis brugernavn og adgangskode er tomt, så udskriv følgende besked.(Dobbelttjek, da det allerede tjekkes i log-ind.ejs)
    if (!brugernavn || !adgangskode) {
        return res.status(400).json({ success: false, message: "Udfyld både bruger_id og password" });
    }

    //Skaber en forbindelse med db
    const db = await forbindDatabase();

    //Søger efter bruger i databasen baseret på brugernavn, og får info ud om den givne bruger(hvis den findes).
    db_result =
        await db.request()
            .input('name', sql.NVarChar(100), brugernavn)
            .input('password', sql.NVarChar(100), adgangskode)
            .query(`SELECT bruger_id, username, password
                    FROM bruger.oplysninger 
                    WHERE username=@name`)

    //console.log("db_result: " + db_result)  
    //console.log(db_result)
    

    //Try-Catch: Hvis der findes noget på den plads vi leder efter i databasen så fortsæt
    //Catch bliver kun udløst hvis try delen fejler/programmet giver en rød fejl/crasher
    try {
        const db_username = db_result.recordset[0].username
        console.log("db_username er : " + db_username + " and you entered : " + brugernavn)
    } catch {
        return res.status(400).json({ success: false, message: "Bruger navn findes ikke" });
    }

    //Samme try-catch metode, bare i forhold til password
    try {
        const db_password = db_result.recordset[0].password
        console.log("db_password er : " + db_result.recordset[0].password + " and you entered : " + adgangskode)
        if (db_password != adgangskode) {
            return res.status(400).json({ success: false, message: "Password er forkert" });
        } else {
            
            //Får fat i brugerens id, hvis begge try-catch er gået godt
            const db_bruger_id = db_result.recordset[0].bruger_id;

            //Gemmer brugerens id i session
            req.session.bruger_id = db_bruger_id; 
            return res.status(200).json({ success: true, message: "Password er korrekt"});
        }
    //"Ekstra" catch i tilfælde af at noget er gået helt galt
    } catch (error) {        
        console.log("ERROR" + error.message)  
        return res.status(400).json({ success: false, message: "Noget er gået helt galt" });
    }
});


//********* LOGOFF ************************
//"Logger bruger ud", og viser dem logoff.ejs siden.
router.get('/logoff', function (req, res) {
    //Fjerne bruger_id fra den givne session, hvilket gør at hvis man logger ud, så kan man ikke se noget data på nogen af siderne.
    // Dette skyldes også at dataen er sat op til de givne brugere.
    req.session.bruger_id = 0;
    console.log(req.session);
    res.render('bruger-sider/logoff');
});


//********* SKIFT ADGANGSKODE ************************
router.get('/nulstill', function (req, res) {
    res.render('bruger-sider/nulstill');
});

//Post der håndtere brugers ændring af sin adgangskode og opdaterer den i DB(kaldes fra nulstill.ejs)
router.post('/nulstill', async function (req, res) {
    //console.log(req.body); // Ser at vi modtager det rigtige info
    
    //Får info ud af req og gemmer det i nye variable.
    const {username, email, nyAdgangskode, nyAdgangskodeIgen } = req.body;

    if (nyAdgangskode !== nyAdgangskodeIgen) {
        // Hvis adgangkode ikke matcher stop og send fejl til brugeren
        return res.status(400).json({ success: false, message: "OBS. Der er sket en fejl prøv igen " });
    }

    //Forbinder os til databasen 
    const db = await forbindDatabase();

    // Opdaterer brugers adgangskode i DB ud fra email og brugernavn
    await db.request()
        .input('email', sql.NVarChar(255), email)
        .input('username', sql.NVarChar(100), username)
        .input('password', sql.NVarChar(255), nyAdgangskode)

        .query(`
        UPDATE bruger.oplysninger
        SET password = @password
        WHERE email = @email AND username = @username
        `);
    return res.status(200).json({ success: true });
});



//***********************************************************
//******* KONTO  ***********************
//***********************************************************

//**********ROUTE TIL AT VISE KONTOOPLYSNINGER************
router.get('/kontooplysninger', function (req, res) {
    res.render('bruger-sider/kontooplysninger');
});


//router.get('/indsaetter', function (req, res) {
//    res.render('bruger-sider/indsaetter');
//});


// vi laver en post request der skal give os den nuværende tidspunkt og dato for den indsættelse der laves
router.post('/indsaetter', async function (req, res) {
    const { vaerdi, valuta, konto_id } = req.body;
    const nuværendeTid = new Date(); // tager fat i nutidens dato
    let vaerdiIBaseCurrency = 0; 

    //Backendt delen: Vi vil indsætte værdien brugeren har indsæt/vil indsætte på sin konto.       

    const db = await forbindDatabase();  // skaber en forbindelse med db

    const db_result = await db.request()
        .input('konto_id', sql.Int, konto_id)
        .query(`
            SELECT valuta 
            FROM konto.kontooplysninger kntopl 
            where kntopl.konto_id = @konto_id`
           );

    console.log(db_result);
    const baseCurrency = db_result.recordset[0].valuta;
    
    if (baseCurrency == valuta) {
       // Do Nothing
       console.log("********Debug888***********");
       vaerdiIBaseCurrency = vaerdi;
    } 
    else { 
        console.log("kontoens baseCurrency : " + baseCurrency);
        console.log("indsat valuta : " + valuta);
        console.log("antal penge indsat : " + vaerdi);
        const response = await fetch(`http://localhost:4000/aktiesoeg/hentvalutakurs/${valuta}`);
        console.log(response);
        const data2 = await response.json();
      
        console.log("****************DEBUG 9990**************");
        console.log(data2.base_code);
        console.log(data2.conversion_rates);
        console.log("****************DEBUG 9991: EUR**************");
        console.log(data2.conversion_rates.EUR);
        console.log("****************DEBUG 9993: DKK**************");
        console.log(data2.conversion_rates.DKK);
        console.log("****************DEBUG 9994: USD**************");
        console.log(data2.conversion_rates.USD);
        console.log("****************DEBUG 9995: **************");
        console.log(data2.conversion_rates[baseCurrency]);

        vaerdiIBaseCurrency = vaerdi * data2.conversion_rates[baseCurrency];
        console.log("vaerdiIBaseCurrency : " + vaerdiIBaseCurrency);

    } 
    console.log("******************Debug1000000000****************")
    console.log(vaerdiIBaseCurrency);

    if (vaerdi == null || isNaN(vaerdi)) {
        return res.status(400).json({ success: false, message: "Ugyldig værdi sendt til serveren" });
    }

    let transaktionsType="";
    if (vaerdi >0 )  {transaktionsType="Indsat"} else {transaktionsType="Hævet"}
    const transResult = await db.request()
        .input('vaerdi', sql.Decimal(10, 2), Number(vaerdiIBaseCurrency).toFixed(2))
        .input('valuta', sql.NVarChar(100), baseCurrency)
        .input('datotid', sql.DateTime, nuværendeTid)
        .input('konto_id', sql.Int, konto_id)
        .input('transaktionstype', sql.NVarChar(20), transaktionsType)
        .query(`         
         INSERT INTO konto.transaktioner(vaerdi, valuta, datotid, konto_id, transaktionstype)
          OUTPUT INSERTED.transaktions_id
         VALUES (@vaerdi, @valuta, @datotid, @konto_id, @transaktionstype )`
        );

    const transaktions_id = transResult.recordset[0].transaktions_id;

    // vi opdaterer saldoen hvis bruger indsætter penge på konto 

    await db.request()
        .input('vaerdi', sql.Decimal(10, 2), vaerdiIBaseCurrency)
        .input('konto_id', sql.Int, konto_id)
        .query(`
      UPDATE konto.kontooplysninger
      SET saldo = saldo + @vaerdi
      WHERE konto_id = @konto_id 
    `);

    // sender svar tilbage ved brug af json
    res.json({
        success: true,
        indsaettelse: {
            transaktions_id,
            vaerdi,
            valuta,
            konto: konto_id,
            tid: nuværendeTid.toLocaleString(),

        }
    });

    console.log("Indsættelse modtaget:", req.body); //tjek 

});

// Dashboard route som viser alle de regnede værdier
router.get('/dashboard', async function (req, res) {
  
  const brugerId = req.session.bruger_id;
  const db = await forbindDatabase();

  // 1. Hent alle konti
  const kontiResultat = await db.request()
    .input('bruger_id', sql.Int, brugerId)
    .query(`
      SELECT * FROM konto.kontooplysninger 
      WHERE bruger_id = @bruger_id AND aktiv = 1
    `);
  const konti = kontiResultat.recordset;

  // 2. Hent ALLE handler for brugerens porteføljer
  const handlerResultat = await db.request()
    .input('bruger_id', sql.Int, brugerId)
    .query(`
      SELECT h.*, v.navn, p.navn as portefolje_navn
      FROM vaerdipapir.vphandler h
      JOIN vaerdipapir.vpoplysninger v ON h.symbol = v.symbol
      JOIN konto.portefoelje p ON h.portefoelje_id = p.portefoelje_id
      JOIN konto.kontooplysninger k ON p.konto_id = k.konto_id
       WHERE k.bruger_id = @bruger_id
    `);
  const handler = handlerResultat.recordset;


  // Alle aktiekurser er i USD - så vi slår USD op i hentvalutakurs og finder kurs i forhold til kontoen base currency
  const response = await fetch(`http://localhost:4000/aktiesoeg/hentvalutakurs/USD`);
  const data2 = await response.json();
  let valutakurs;
  try {
    let valuta_text = Object.values(handler[0].valuta);
    let valuta_symbol = valuta_text.join('');
    valutakurs = data2.conversion_rates[valuta_symbol];
  } catch (error) {
    valutakurs = 1;
  } 
  console.log("Valuta kurs : " + valutakurs)

  // 3. Brug PortefoljeBeregner
  const beregner = new PortefoljeBeregner(handler, konti);  
  beregner.beregnEjerOgGAK();


  // vi opdater aktiepriser med live data
  for (let j = 0; j < beregner.ejerListeFiltreret.length; j++) {
    const aktie = beregner.ejerListeFiltreret[j];
    const response = await fetch(`http://localhost:4000/aktiesoeg/hentaktiekurs/${aktie.symbol}`);
    const data = await response.json();
    const aktuelPris = parseFloat(Object.values(data["Weekly Time Series"])[0]["1. open"]);
    aktie.pris = aktuelPris * valutakurs;
    //console.log("Aktiekurs i USD: " + aktuelPris + " | Aktiekurs i konto base currency: " + aktie.pris); 
  }


  // 4. Beregner totaler
  const totaler = beregner.beregnTotaler();

  // 5. Læg kontanter + aktier sammen
  let samletKontantSaldo = 0;
  for (let i = 0; i < konti.length; i++) {
    samletKontantSaldo += konti[i].saldo;
  }
  console.log("samletKontantSaldo : " + samletKontantSaldo)
  console.log("totaler.totalForventetVaerdi : " + totaler.totalForventetVaerdi)
  const samletVaerdi = samletKontantSaldo + totaler.totalForventetVaerdi;

  // 6. Top 5 aktier
  const top5Vaerdi = beregner.topFemVaerdi();
  const top5Profit = beregner.topFemProfit();

  // 7. Render dashboard
  res.render('Dashboard', {
    samletVaerdi,
    samletKontantSaldo,
    totalUrealiseretGevinstTab: totaler.totalUrealiseretGevinstTab,
    totalRealiseretGevinstTab: totaler.totalRealiseretGevinstTab,
    top5Vaerdi,
    top5Profit
  });

});


module.exports = router;




