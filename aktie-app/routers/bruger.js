const express = require('express');
const router = express.Router();

const { sql, forbindDatabase } = require('../db'); 
require('dotenv').config(); // sørger for at tage fat i vores env fil



// vi sætter vores ROUTES op for BRUGER SIDER.
// GET bruges til at vise log-ind siden 

router.get('/bruger-oprettelse', function(req, res) { 
    res.render('bruger-sider/bruger-oprettelse'); 
});

router.get('/kontooplysninger', function(req, res) { 
    res.render('bruger-sider/kontooplysninger'); 
});

router.get('/indsaender', function(req, res) { 
 res.render('bruger-sider/indsaender'); 
});

router.get('/logoff', function(req, res) { 
    res.render('bruger-sider/logoff'); 
   });

//Dette gør at vi overhovedet kan se siden. Den siger "Få info om denne side fra en given stig(bruger-sider/log-ind)".
// (Denne forespørgsel kommer f.eks. fra Dashboard)
//Inden under den givne fil, står der hvordan siden skal se ud og derved hvad der skal vises i browseren.
router.get('/log-ind', function(req, res) { 
    res.render('bruger-sider/log-ind'); 
});

//****************************************************************/
//************* REGISTER - OPRET BRUGER **************************/
// HÅNDTER bruger-oprettelses side, antså den tager os til log ind siden når brugeren er oprettet.
router.post('/register', async(req, res) => {
    const { username, password, repeatPassword, email} = req.body;

    // Tjek for tomme felter først. !!!Dette er dobbelt tjek, da det allerede sker i bruger-oprettelse.ejs HTML formen
    if (!username || !password || !repeatPassword ) {
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

//****************************************************************/
//************* LOGIN - HÅNDTER LOGIN   **************************/
//Denne post bliver sendt fra "log-ind.ejs" filen. Med den kommer information om et indtastet brugernavn og adgangskode
router.post('/log-ind', async(req,res) => {
    //console.log(req); // Se hele requesten
    console.log(req.body); // Ser kun på den del af requesten som indeholde brugernavn og adgangskode
    const {brugernavn, adgangskode} = req.body; //Sætter brugernavn og adgangskode "tilbage" ind i to variable(brugernavn og adgangskode)
    
    //Hvis brugernavn og adgangskode er tomt, så udskriv følgende besked.
    if (!brugernavn || !adgangskode ) {
        return res.status(400).json({ success: false, message: "Udfyld både bruger id og password" });
    }

    //Skaber en forbindelse med db
    const db = await forbindDatabase();

    //Søger efter bruger i databasen baseret på brugernavn
    db_result = 
        await db.request()
            .input('name', sql.NVarChar(100), brugernavn)
            .input('password', sql.NVarChar(100), adgangskode)
            .query(`SELECT username, password 
                    FROM bruger.oplysninger 
                    WHERE username=@name`)
    
    console.log(db_result)  
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
        console.log("db_password er : " + db_result.recordset[0].password  + " and you entered : " + adgangskode)    
        if (db_password != adgangskode) {
            return res.status(400).json({ success: false, message: "Password er forkert" });
        } else {
            return res.status(200).json({ success: true, message: "Password er korrekt" });
        }
    } catch {
        return res.status(200).json({ success: true, message: "Password er tomt i db" });
    }


    //if (brugernavn === "m" && adgangskode === "f") { 
    //    //if (brugernavn === "TestUser") { 
    //    res.json({success: true, message: "Login Succesfuld"});
    //    console.log(res.statusCode); // debugging
    //    console.log(res.statusMessage); // debugging
//
//
//
    //} else { 
    //    // dette sørger for at API ikke returnerer 200 som vil indikere at logind er OK
    //    res.status(400).json({success: false, message: "Forkert brugernavn eller adgangskode"});
    //}
});

router.get('/nulstill', function(req, res) { 
    res.render('bruger-sider/nulstill'); 
});

//POST-rute vil håndeter vores Login-data 
router.post('/nulstill',(req,res) => {
    console.log(req.body); // debugging
    const  { nyAdgangskode, nyAdgangskodeIgen } = req.body;

    if (nyAdgangskode === nyAdgangskodeIgen) { 
        res.json({success: true, message: "Ændring af adgangskode var succesfuld"});
    } else { 
        // dette sørger for at API ikke returnerer 200 som vil indikere at logind er OK.
        res.status(400).json({success: false, message: "OBS. indtast samme adgangskode i begge felter "});
    }
});


// vi laver en post request der skal give os den nuværende tidspunkt og dato for den indsædense der laves
router.post('/indsaender', async function (req,res) {

const { værdi, valuta, konto_id } = req.body;
const nuværendeTid = new Date(); // tager fat i nutidens dato


  // backendt delen vi vil indsætte værdier brugeren har indsendt til indsendelsen.       

  const db = await forbindDatabase();  // skaber en forbindelse med db

 await db.request()
 .input('værdi', sql.Int, værdi)
 .input('valuta',sql.NVarChar(100), valuta)
 .input('tid',sql.DateTime, nuværendeTid)
 .input('konto_id',sql.Int, konto_id)
 .query(`
         INSERT INTO konto.transaktioner(vaerdi, vaulta, datotid, konto_id)
         VALUES (@vaerdi, @valuta, @tid, @konto_id)`
);
 

res.json({
    success: true,
    indsendelse: {
      værdi,
      valuta,
      konto: konto_id,
      tid: nuværendeTid.toLocaleString()
    }
  });

console.log("Indsendelse modtaget:", req.body); //tjek 

});


module.exports = router; 



