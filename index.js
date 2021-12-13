
/*
used sources:

    WEB II - session 7 - Fullstack Web - Team Amina https://github.com/EHB-MCT/web2-groupproject-backend-team-amina

*/

const express = require('express')
const cors = require('cors')
const {MongoClient} = require('mongodb')
const bodyParser = require('body-parser')
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.static('public'))
app.use(cors())
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

    if ( !req.body.username || !req.body.password || !req.body.email || !req.body.firstname || !req.body.lastname ) {
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
        console.log(checkusername);
        if (checkusername){
            res.status(409).send({error: "the username is already taken"});
            return
        } 
        if (checkemail){
            res.status(409).send({error: "the Email is already taken"});
            return
        }
        if (checkusername == null && checkemail == null) {
            let newuser = {
                "username": req.body.username,
                "email": req.body.email,
                "firstname": req.body.firstname,
                "lastname": req.body.lastname,
                "password": req.body.password,
            };
    
            let insertuser = await data.insertOne(newuser);
            res.send(await data.distinct("_id", {"username": newuser.username}));
            res.status(200).send({succes: "successfully created new useraccount"});
        }
        
    } catch (error) {
        console.log(error);
        res.status(406).send(error.message); 
    } finally{
        await client.close();
    }

})

app.post('/login', async (req, res) => {
    if ( !req.body.username || !req.body.password){
        res.status(401).send({error: "please fill in all fields"});
        return
    }

    try {
        await client.connect();
        data = await client.db().collection("user_data");
        checkusername = await data.findOne({username: req.body.username});
        if(checkusername == null) {
            console.log('test 2');
            res.status(404).send({error: "username or password is wrong"});
            return
        } else{
            const userdata = await data.findOne({username: req.body.username});
            if (userdata.password == req.body.password) {
                const userId = userdata._id.toString();
                res.send(await data.distinct("_id", {"username": req.body.username}));
                console.log(userId);
            } else{
                res.status(401).send({error: 'username or password is wrong'})
            }
            
        }
    }catch(error){
        console.log(error);
        res.status(406).send(error.message);
    } finally{
        await client.close();
    }
})



app.listen(PORT, () => {
    console.log(`api running at: http://localhost:${PORT}`);
});

