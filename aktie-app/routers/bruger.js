const express = require('express');
const router = express.Router();

const { sql, forbindDatabase } = require('../db');
const { query } = require('mssql');
require('dotenv').config(); // sørger for at tage fat i vores env fil



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
            req.session.bruger_id = db_bruger_id; // gemmer brugerens ID i session

            console.log(" ********* db_bruger_id ************************")
            console.log(db_bruger_id)
            console.log(" ********* req.session ************************")
            console.log(req.session)

            console.log(" ********* req.session.cookie ************************")
            console.log(req.session.cookie)

            //const token = jwt.sign({ _id: bruger_id.toString() }, 'secret')
            //console.log(" ********* token ************************")
            //console.log(token)

            //user.tokens = user.tokens.concat( { token } )
            //console.log(" ********* user.token ************************")
            //console.log(user.tokens)

            //req.session.cookie.bearerToken = user.tokens;

            //const token = jwt.sign({ _id: user.id.toString() }, 'secret')
            //user.tokens = user.tokens.concat( { token } )
            //await user.save()


            return res.status(200).json({ success: true, message: "Password er korrekt" });



        }
    } catch {
        return res.status(200).json({ success: true, message: "Noget er gået helt galt" });
    }

});



router.get('/logoff', function (req, res) {
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
//******* KONTO                       ***********************
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


    //Backendt delen: Vi vil indsætte værdien brugeren har indsæt/vil indsætte på sin konto.       

    const db = await forbindDatabase();  // skaber en forbindelse med db

    const transResult = await db.request()
        .input('vaerdi', sql.Decimal(10, 2), vaerdi)
        .input('valuta', sql.NVarChar(100), valuta)
        .input('datotid', sql.DateTime, nuværendeTid)
        .input('konto_id', sql.Int, konto_id)

        .query(`
         INSERT INTO konto.transaktioner(vaerdi, valuta, datotid, konto_id)
          OUTPUT INSERTED.transaktions_id
         VALUES (@vaerdi, @valuta, @datotid, @konto_id)`
        );

    const transaktions_id = transResult.recordset[0].transaktions_id;

    // vi opdater saldoen hvis bruger indsætter penge på konto 

    if (vaerdi == null || isNaN(vaerdi)) {
        return res.status(400).json({ success: false, message: "Ugyldig værdi sendt til serveren" });
    }

    await db.request()
        .input('vaerdi', sql.Decimal(10, 2), vaerdi)
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




module.exports = router;




