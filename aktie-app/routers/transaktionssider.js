const express = require('express');
const router = express.Router();
const { sql, forbindDatabase } = require('../db'); // tager fat i db filen 

// vi sætter vores ROUTES op for transaktion-sider

router.get('/formular-handel', function(req, res) { 
    res.render('transaktion-sider/formular-handel'); 
});

router.get('/formular-salg', function(req, res) { 
    res.render('transaktion-sider/formular-salg'); 
});

router.get('/handelside', function(req, res) { 
    res.render('transaktion-sider/handelside'); 
});

router.get('/registrering-af-handel', function(req, res) { 
    res.render('transaktion-sider/registrering-af-handel'); 
});

router.get('/transaktions-historik', function(req, res) { 
    res.render('transaktion-sider/transaktions-historik'); 
});

module.exports = router 