
const express = require('express'); 
const path = require('path');
const app = express(); 
const port = 4000;


// her sætter vi EJS som template, så vi kan bruge "dynamiske" HTML-sider
app.set('view engine', 'ejs'); 
app.set('views', path.join(__dirname, 'views'));


// dette håndere vores JSON-data altså POST request
app.use(express.json()); 

// Gør det muligt for hjemmesiden at bruge filer som CSS og JavaScript.
app.use(express.static('public'));

// vi sætter ROUTES op for MAIN PAGE.
app.get('/', function(req, res){ 
    res.render('Dashboard')
}); 


// impoter routerne
const brugerRuter = require('./routers/bruger');
const portefoljeRuter = require('./routers/portefoljestyring');
const transaktionsRuter = require('./routers/transaktionssider');


app.use('/bruger', brugerRuter);
app.use('/portefoljestyring', portefoljeRuter);
app.use('/transaktionssider', transaktionsRuter);



    //res.status(200).json();

// vi starter vores server og tjekker at den virker, ved console.log
app.listen(port, () => { //Gør at porten er åben og lytter
    console.log(`app listening on port ${port}`) //Tekst i konsollen
});

