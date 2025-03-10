
/*
Lav hver css side til hver ejs fil ind i public, 
lav bruger oplysninger side 
*/
const express = require('express'); 
const path = require('path');
const app = express(); 
const port = 4000;

// her sætter vi EJS som template, så vi kan bruge "dynamiske" HTML-sider
app.set('view engine', 'ejs'); 

// dette håndere vores JSON-data altså POST request
app.use(express.json()); 

// Gør det muligt for hjemmesiden at bruge filer som CSS og JavaScript.
app.use(express.static('public'));

// vi sætter ROUTES op for MAIN PAGE.
app.get('/', function(req, res){ 
    res.render('index')
}); 


// impoter routerne
const brugerRuter = require('./routes/bruger');
const prteføljeRuter = require('./routes/porteføljestyring');
const transaktionsRuter = require('./routes/transaktionssider');


app.use('/bruger', brugerRuter);
app.use('/porteføljestyring', prteføljeRuter);
app.use('/transaktionssider', transaktionsRuter);



    //res.status(200).json();

// vi starter vores server og tjekker at den virker, ved console.log
app.listen(port, () => {
    console.log(`app listening on port ${port}`)});
