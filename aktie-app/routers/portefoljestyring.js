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
    // her skla vi på et eller andet måde tage fat i en id for hvert konto der lsaves ved brug af SQL, 

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

// OBD spørge vejleder om man kan bruge denne metde 
const konto_id = resultater.recordset[0].konto_id;

 
res.status(201).json({ konto_id });

     
});



module.exports = router 