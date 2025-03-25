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


module.exports = router 