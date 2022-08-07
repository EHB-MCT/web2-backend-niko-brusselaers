/*
used sources:

    WEB II - session 7 - Fullstack Web - Team Amina https://github.com/EHB-MCT/web2-groupproject-backend-team-amina

*/

const express = require('express')
const cors = require('cors')
const {
    MongoClient
} = require('mongodb')
const bodyParser = require('body-parser')
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.static('public'))
app.use(cors())
app.use(bodyParser.json())

const uri = "mongodb+srv://courseProjectRestApi:ThisIsThePassword@cluster0.ruiua.mongodb.net/Courseproject?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


//temp
// const password
// const username
//temp

// test to see if api works
app.get('/', async (req, res) => {
    res.status(300).redirect('info.html');
});


// function to create account 
app.post('/create-account', async (req, res) => {

    // checks if all required fields are filled
    if (!req.body.username || !req.body.password || !req.body.email || !req.body.firstname || !req.body.lastname) {
        res.status(400).send("please fill everything in");
        return
    }

    try {
        // make connection to database and perfrom a check if the username and/or the email is already taken
        await client.connect();
        const data = client.db().collection('user_data');
        const checkusername = await data.findOne({
            username: req.body.username
        });

        const checkemail = await data.findOne({
            email: req.body.email
        })
        console.log(checkusername);
        if (checkusername) {
            res.status(409).send({
                error: "the username is already taken"
            });
            return
        }
        if (checkemail) {
            res.status(409).send({
                error: "the Email is already taken"
            });
            return
        }
        //if username and email are not taken, the new account will be created and stored on the database
        if (checkusername == null && checkemail == null) {
            let newuser = {
                "username": req.body.username,
                "email": req.body.email,
                "firstname": req.body.firstname,
                "lastname": req.body.lastname,
                "password": req.body.password,
            };

            let insertuser = await data.insertOne(newuser);
            const userId = await data.distinct("_id", {
                "username": newuser.username
            })
            //sends back the userId that was created so the user can stay logged in
            res.status(200).send({
                succes: "successfully created new useraccount",
                id: userId
            });
        }
        // if there is any problem, the api will send the error back and also display it inside the console
    } catch (error) {
        console.log(error);
        res.status(406).send(error.message);
        // close the connection to the database
    } finally {
        await client.close();
    }

})

// function to login
app.post('/login', async (req, res) => {
    // check if the username and password fields are filled
    if (!req.body.username || !req.body.password) {
        res.status(401).send({
            error: "please fill in all fields"
        });
        return
    }
    // makes connection to the database and searches the username inside the database
    try {
        await client.connect();
        data = await client.db().collection("user_data");
        checkusername = await data.findOne({
            username: req.body.username
        });
        // if the filled in username is not found, return a error with a message
        if (checkusername == null) {
            console.log('test 2');
            res.status(404).send({
                error: "username or password is wrong"
            });
            return
        } else {
            const userdata = await data.findOne({
                username: req.body.username
            });
            // if both username and password are correct, return userId so that the user stays logged in
            if (userdata.password == req.body.password) {
                const userId = await data.distinct("_id", {
                    "username": req.body.username
                })
                res.status(200).send({
                    succes: "successfully logged in",
                    id: userId
                });
                // if the password is wrong,  return a error with a message
            } else {
                res.status(404).send({
                    error: 'username or password is wrong'
                })
            }

        }
        // if there is any problem, the api will send the error back and also display it inside the console
    } catch (error) {
        console.log(error);
        res.status(406).send({
            error
        });
        // close the connection to the database
    } finally {
        await client.close();
    }
})

//function to retrieve all events from the database 
app.get('/events', async (req, res) => {
    try {
        await client.connect();
        data = await client.db().collection("events");
        // if there is any problem, the api will send the error back and also display it inside the console
    } catch (error) {
        console.log(error);
        res.status(406).send({
            error
        });
        // close the connection to the database
    } finally {
        await client.close();

    }
})

// function to create  new events
app.post('/createEvent', async (req, res) => {
    
})



app.listen(PORT, () => {
    console.log(`api running at: http://localhost:${PORT}`);
});