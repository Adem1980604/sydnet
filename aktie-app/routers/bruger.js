const express = require('express');
const router = express.Router();

const { sql, forbindDatabase } = require('../db'); 
require('dotenv').config(); // sørger for at tage fat i vores env fil



// vi sætter vores ROUTES op for BRUGER SIDER.
// GET bruges til at vise log-ind siden 

router.get('/bruger-oprettelse', function(req, res) { 
    res.render('bruger-sider/bruger-oprettelse'); 
});

router.get('/kontoplysninger', function(req, res) { 
    res.render('bruger-sider/kontoplysninger'); 
});

router.get('/indsaender', function(req, res) { 
 res.render('bruger-sider/indsaender'); 
});

router.get('/log-ind', function(req, res) { 
    res.render('bruger-sider/log-ind'); 
});


// HÅNDTER bruger-oprettelses side, antså den tager os til log ind siden når brugeren er oprettet.
router.post('/register', async(req, res) => {
    const { username, password, repeatPassword } = req.body;

    // Tjek for tomme felter først
    if (!username || !password || !repeatPassword) {
        return res.status(400).json({ success: false, message: "Udfyld alle felter" });
    }
        // Tjek om adgangskoderne matcher
        if (password !== repeatPassword) {
            return res.status(400).json({ success: false, message: "Adgangskoderne matcher ikke" });
        }
        
  // skaber en forbindelse med db
  const db = await forbindDatabase();


  await db.request()
    .input('name', sql.NVarChar(100), username)
    .input('password', sql.NVarChar(100), password)
    .query('INSERT INTO bruger.oplysninger (username, password) VALUES (@name, @password)');

  return res.redirect('/bruger/log-ind');
});

//POST-rute vil håndeter vores Login-data 
router.post('/log-ind',(req,res) => {
    console.log(req.body); // debugging
  const  {brugernavn, adgangskode} = req.body;

  if (brugernavn === "m" && adgangskode === "f") { 
    res.json({success: true, message: "Login Succesfuld"});
} else { 

// dette sørger for at API ikke returnerer 200 som vil indikere at logind er OK
    res.status(400).json({success: false, message: "Forkert brugernavn eller adgangskode"});
}
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

let næsteId = 1  // obs muligvis kan dette laves om så databasen automatisk laver ider 
const indsendelser = [];


// vi laver en post request der skal give os den nuværende tidspunkt og dato for den indsædense der laves
router.post('/indsaender',(req,res)=>{
    const { værdi, valuta, konto } = req.body;
const nu = new Date(); // tager fat i nutidens dato
const tid = nu.toLocaleString(); // gør det letsæsligt når vi skal bruge det 

const id = næsteId++;

const indsendelse = {
    id,
    konto,
    tid,
    værdi,
    valuta
  };

  indsendelser.push(indsendelse);

res.json({ success: true, indsendelse });
console.log("Indsendelse modtaget:", req.body);

}
)


module.exports = router; 



