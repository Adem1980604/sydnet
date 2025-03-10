const express = require('express');
const router = express.Router();

// vi sætter vores ROUTES op for BRUGER SIDER.
router.get('/bruger-oprettelse', function(req, res) { 
    res.render('bruger-sider/bruger-oprettelse'); 
});

router.get('/brugeroplysning', function(req, res) { 
    res.render('bruger-sider/brugeoplysning'); 
});

router.get('/indsændelser', function(req, res) { 
    res.render('bruger-sider/indsændelser'); 
});

router.get('/log-ind', function(req, res) { 
    res.render('bruger-sider/log-ind'); 
});

router.get('/nulstill', function(req, res) { 
    res.render('bruger-sider/nulstill'); 
});

module.exports = router; 
