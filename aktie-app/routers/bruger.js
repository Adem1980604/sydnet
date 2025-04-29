const express = require('express');
const router = express.Router();

const { sql, forbindDatabase } = require('../db');
const { query } = require('mssql');
require('dotenv').config(); // sørger for at tage fat i vores env fil

const PortefoljeBeregner = require('../logik/PorteBeregner');




// vi sætter vores ROUTES op for BRUGER SIDER.
// GET bruges til at vise log-ind siden 

//***********************************************************
//******* BRUGER OPRET, LOGIN, LOGOFF ***********************
//***********************************************************
router.get('/bruger-oprettelse', function (req, res) {
    res.render('bruger-sider/bruger-oprettelse');
});

// HÅNDTER bruger-oprettelses side, antså den tager os til log ind siden når brugeren er oprettet.
router.post('/register', async (req, res) => {
    const { username, password, repeatPassword, email } = req.body;

    // Tjek for tomme felter først. !!!Dette er dobbelt tjek, da det allerede sker i bruger-oprettelse.ejs HTML formen
    if (!username || !password || !repeatPassword) {
        return res.status(400).json({ success: false, message: "Udfyld alle felter" });
    }
    // Tjek om adgangskoderne matcher
    if (password !== repeatPassword) {
        return res.status(400).json({ success: false, message: "Adgangskoderne matcher ikke" });
    }

    // skaber en forbindelse med db
    const db = await forbindDatabase();



    //************* FORSØG - Funktion: BRUGER FINDES ALLEREDE I DB **************************/
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
    //
    await db.request()
        .input('name', sql.NVarChar(100), username)
        .input('password', sql.NVarChar(100), password)
        .input('email', sql.NVarChar(100), email)
        .query(
            `INSERT INTO bruger.oplysninger (username, password, email) 
          VALUES (@name, @password, @email)`);

    return res.redirect('/bruger/log-ind');
});

//Dette gør at vi overhovedet kan se siden. Den siger "Få info om denne side fra en given stig(bruger-sider/log-ind)".
// (Denne forespørgsel kommer f.eks. fra Dashboard)
//Inden under den givne fil, står der hvordan siden skal se ud og derved hvad der skal vises i browseren.
router.get('/log-ind', function (req, res) {
    res.render('bruger-sider/log-ind');
});

//Denne post bliver sendt fra "log-ind.ejs" filen. Med den kommer information om et indtastet brugernavn og adgangskode
router.post('/log-ind', async (req, res) => {
    //console.log(req); // Se hele requesten
    console.log(req.body); // Ser kun på den del af requesten som indeholde brugernavn og adgangskode
    const { brugernavn, adgangskode } = req.body; //Sætter brugernavn og adgangskode "tilbage" ind i to variable(brugernavn og adgangskode)

    //Hvis brugernavn og adgangskode er tomt, så udskriv følgende besked.
    if (!brugernavn || !adgangskode) {
        return res.status(400).json({ success: false, message: "Udfyld både bruger id og password" });
    }

    //Skaber en forbindelse med db
    const db = await forbindDatabase();

    //Søger efter bruger i databasen baseret på brugernavn
    db_result =
        await db.request()
            .input('name', sql.NVarChar(100), brugernavn)
            .input('password', sql.NVarChar(100), adgangskode)
            .query(`SELECT bruger_id, username, password
                    FROM bruger.oplysninger 
                    WHERE username=@name`)

    //console.log("db_result: " + db_result)  
    //console.log("**********************")
    //console.log(db_result)
    //console.log("**********************")
    // Try-Catch: Hvis der findes noget på den plads vi leder efter i databasen, 
    //Catch bliver kun udløst hvis Try delen er "ulovlig"/programmet giver en rød fejl/crasher
    try {
        const db_username = db_result.recordset[0].username
        console.log("db_username er : " + db_result.recordset[0].username + " and you entered : " + brugernavn)
    } catch {
        return res.status(400).json({ success: false, message: "Bruger id findes ikke" });
    }

    try {
        const db_password = db_result.recordset[0].password
        console.log("db_password er : " + db_result.recordset[0].password + " and you entered : " + adgangskode)
        if (db_password != adgangskode) {
            return res.status(400).json({ success: false, message: "Password er forkert" });
        } else {

            const db_bruger_id = db_result.recordset[0].bruger_id;
            //const db_username = db_result.recordset[0].username;
            req.session.bruger_id = db_bruger_id; // gemmer brugerens ID i session

                        
            //const jwt = require('jsonwebtoken');

            //const user = { id: db_bruger_id, username: db_username };
            //const generateToken = (user) => {
            // // Create a token with user information and a secret key
            // return jwt.sign({ id: db_bruger_id, username: db_username }, 'your_secret_key', { expiresIn: '1h' });
            //};

            //const my_token = generateToken(user);
            //console.log(" ********* token ************************")
            //console.log(my_token);
            //req.session.bearer_token = my_token;
            

            return res.status(200).json({ success: true, message: "Password er korrekt"});
        }
    } catch (error) {        
        console.log("ERROR" + error.message)  
        return res.status(400).json({ success: false, message: "Noget er gået helt galt" });
    }

});



router.get('/logoff', function (req, res) {
    //Fjerne bruger_id fra den givne session, hvilket gør at hvis man logger ud, så kan man ikke se noget data på nogen af siderne.
    req.session.bruger_id = 0;
    console.log(req.session);
    res.render('bruger-sider/logoff');
});


// Reset password
router.get('/nulstill', function (req, res) {
    res.render('bruger-sider/nulstill');
});

//POST-rute vil håndeter vores Login-data, vi sørger for at brugeren kan nustille udgangskoden, og opdaterer den i DB.
router.post('/nulstill', async function (req, res) {

    console.log(req.body); // debugging
    const { username, email, nyAdgangskode, nyAdgangskodeIgen } = req.body;
    if (nyAdgangskode !== nyAdgangskodeIgen) {
        // Hvis adgangkode ikke matcher stop og send fejl til klienten
        return res.status(400).json({ success: false, message: "OBS. Der er sket en fejl prøv igen " });
    }

    // db skal forbindes 
    const db = await forbindDatabase();

    // opdatrer adgangskode direkte ud fra email og brugernavn
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

router.get('/kontooplysninger', function (req, res) {
    res.render('bruger-sider/kontooplysninger');
});

router.get('/indsaetter', function (req, res) {
    res.render('bruger-sider/indsaetter');
});


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
        .input('vaerdi', sql.Decimal(10, 2), vaerdiIBaseCurrency.toFixed(2))
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

    // vi opdater saldoen hvis bruger indsætter penge på konto 

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

// Dashboard route som viser alle de regnede værder
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

  // 3. Brug PortefoljeBeregner
  const beregner = new PortefoljeBeregner(handler, konti);  
  beregner.beregnEjerOgGAK();


// vi opdater aktiepriser med live data
for (let j = 0; j < beregner.ejerListeFiltreret.length; j++) {
  const aktie = beregner.ejerListeFiltreret[j];
  const response = await fetch(`http://localhost:4000/aktiesoeg/hentaktiekurs/${aktie.symbol}`);
  const data = await response.json();
  const aktuelPris = parseFloat(Object.values(data["Weekly Time Series"])[0]["1. open"]);
  aktie.pris = aktuelPris;
}


  // 4. Beregner totaler
  const totaler = beregner.beregnTotaler();

  // 5. Læg kontanter + aktier sammen
  let samletKontantSaldo = 0;
  for (let i = 0; i < konti.length; i++) {
    samletKontantSaldo += konti[i].saldo;
  }
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




