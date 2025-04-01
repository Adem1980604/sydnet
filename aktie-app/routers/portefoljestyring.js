const express = require('express');
const router = express.Router();
router.use(express.json());
//  Vi laver lige nu et array der indeholder alle kontopolysnigner som erstates med database senere
let kontoplysningerArray = [];

// vi sætter vores ROUTES op for PORTEFØLJESTYRING.

router.get('/', function(req, res) { 
    res.render('portestyring/porteføljeoversigt'); 
});

router.get('/zoom-på-1-portefølje', function(req, res) { 
    res.render('portestyring/zoom-på-1-portefølje'); 
});

router.get('/kontoplysninger', function(req, res) { 
    res.status(200).json(kontoplysningerArray);
});

router.get('/kontoplysninger/view', function(req, res) { 
    res.render('portestyring/kontoplysninger');
});

/* vi laver en post request der skal give os den nuværende tidspunkt og dato for den indsædense der laves
router.post('/kontoplysninger',(req,res)=>{
    const { værdi, valuta, konto } = req.body;
const nu = new Date(); // tager fat i nutidens dato
const dato = nu.toISOString() // gør det letsæsligt når vi skal bruge det 
const tid = nu.toTimeString()
const id = næsteId++;

const indsendelse = {
    id,
    konto,
    dato,
    tid,
    værdi,
    valuta
  };

  indsendelser.push(indsendelse);

res.json({ success: true, indsendelse });
}
)
*/

router.get('/konto-detalje', function(req, res) { 
    res.render('portestyring/kontoplysninger');
    // her skla vi på et eller andet måde tage fat i en id for hvert konto der lsaves ved brug af SQL, 

});

  // vi laver en test om kontooplysninger virker

  // Opretter en POST til tilføjelse af konto 

  router.post('/kontoplysninger', function(req,res){
    console.log(req.body); 
    
    const nyKonto = {
          navn: req.body.navn,
          valuta: req.body.valuta,
          email: req.body.email,
          saldo: req.body.saldo,
          dato: req.body.dato,
          bank: req.body.bank
     };
     kontoplysningerArray.push(nyKonto) // pusheri vores array før vi har opsat databassen

     res.status(201).json({ message: "Konto oprettet!", data: nyKonto }); //Send svar som JSON
     
});


let næsteId = 1  // obs muligvis kan dette laves om så databasen automatisk laver ider 
const indsendelser = [];



module.exports = router 