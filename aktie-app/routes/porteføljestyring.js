const express = require('express');
const router = express.Router();

// vi sætter vores ROUTES op for PORTEFØLJESTYRING.

router.get('/porteføljeoversigt', function(req, res) { 
    res.render('porteføljestyring-sider/porteføljeoversigt'); 
});

router.get('/zoom-på-1-portefølje', function(req, res) { 
    res.render('porteføljestyring-sider/zoom-på-1-portefølj'); 
});

module.exports = router 