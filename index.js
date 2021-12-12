
/*
used sources:

    WEB II - session 7 - Fullstack Web - Team Amina https://github.com/EHB-MCT/web2-groupproject-backend-team-amina

*/

const express = require('express')
const {MongoClient} = require('mongodb')
const bodyParser = require('body-parser')
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.static('public'))
app.use(bodyParser.json())

const uri = "mongodb+srv://courseProjectRestApi:ThisIsThePassword@cluster0.ruiua.mongodb.net/Courseproject?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


//temp
// const password
// const username
//temp

app.get('/', async (req, res) => {
    res.status(300).redirect('info.html');
});

app.post('/create-account', async (req, res) => {

    if (!req.body.username || !req.body.password || !req.body.email || !req.body.firstname || !req.body.lastname) {
        res.status(400).send("please fill everything in");
        return
    }
    
    try {
        await client.connect();
        const data = client.db().collection('user_data');
        const checkusername = await data.findOne({
            username: req.body.username
        });

        const checkemail = await data.findOne({
            email: req.body.email
        })

        if (checkusername){
            res.status(409).send("the username is already taken")
            return
        } 
        if (checkemail){
            res.status(409).send("the Email is already taken")
            return
        }
        
        let newuser = {
            "username": req.body.username,
            "email": req.body.email,
            "firstname": req.body.firstname,
            "lastname": req.body.lastname,
            "password": req.body.password,
        };

        let insertuser = await data.insert(newuser)
        res.status(200).send("successfully created new useraccount")
    } catch (error) {
        console.log(error);
        res.status(406).send(error)
    } finally{

        await client.close();
    }

})



app.listen(PORT, () => {
    console.log(`api running at: http://localhost:${PORT}`);
});

