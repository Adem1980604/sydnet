const express = require('express');
const router = express.Router();

// vi sætter vores ROUTES op for BRUGER SIDER.
// GET bruges til at vise log-ind siden 

router.get('/bruger-oprettelse', function(req, res) { 
    res.render('bruger-sider/bruger-oprettelse'); 
});

router.get('/brugeroplysning', function(req, res) { 
    res.render('bruger-sider/brugeroplysning'); 
});

router.get('/indsænder', function(req, res) { 
    res.render('bruger-sider/indsænder'); 
});

router.get('/log-ind', function(req, res) { 
    res.render('bruger-sider/log-ind'); 
});

//POST-rute vil håndeter vores Login-data 
router.post('/log-ind',(req,res) => {
    console.log(req.body);
  const  {brugernavn, adgangskode} = req.body;

  if (brugernavn === "m" && adgangskode === "f") { 
    res.json({success: true, message: "Login Succesfuld"});
} else { 

// dette sørger for at API ikke returnerer 200 som vil indikere at logind er OK
    res.status(401).json({success: false, message: "Forkert brugernavn eller adgangskode"});
}
});


router.get('/nulstill', function(req, res) { 
    res.render('bruger-sider/nulstill'); 
});


module.exports = router; 
