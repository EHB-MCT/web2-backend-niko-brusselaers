
/*
used sources:

    WEB II - session 7 - Fullstack Web - Team Amina https://github.com/EHB-MCT/web2-groupproject-backend-team-amina

*/

const express = require('express')
const {client} = require('mongodb')
const bodyParser = require('body-parser')
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.static('public'))
app.use(bodyParser.json())



//temp
// const password
// const username
//temp

app.get('/', async (req, res) => {
    res.status(300).redirect('info.html');
});



app.listen(PORT, () => {
    console.log(`api running at: http://localhost:${PORT}`);
});

