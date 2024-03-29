/*
used sources:

    WEB II - session 7 - Fullstack Web - Team Amina https://github.com/EHB-MCT/web2-groupproject-backend-team-amina

*/
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const {
    MongoClient,
    ServerApiVersion,
    ObjectId
} = require('mongodb')
const bodyParser = require('body-parser')
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.static('public'))
app.use(cors())
app.use(bodyParser.json())


const uri = `mongodb+srv://${process.env.mongodbUsername}:${process.env.mongodbPassword}@cluster0.ruiua.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
});


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
        const data = client.db("Courseproject").collection('user_data');
        const checkUsername = await data.findOne({
            username: req.body.username
        });

        const checkEmail = await data.findOne({
            email: req.body.email
        })
        if (checkUsername) {
            res.status(409).send({
                error: "the username is already taken"
            });
            return
        }
        if (checkEmail) {
            res.status(409).send({
                error: "the Email is already taken"
            });
            return
        }
        //if username and email are not taken, the new account will be created and stored on the database
        if (checkUsername == null && checkEmail == null) {
            const newuser = {
                "username": req.body.username,
                "email": req.body.email,
                "firstname": req.body.firstname,
                "lastname": req.body.lastname,
                "password": req.body.password,
            };

            let insertUser = await data.insertOne(newuser);
            const userId = await data.distinct("_id", {
                "username": newuser.username
            })
            //sends back the userId that was created so the user can stay logged in
            res.status(200).send({
                succes: "successfully created new useraccount",
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
        const userData = await client.db("Courseproject").collection("user_data");
        const checkUsername = await userData.findOne({
            username: req.body.username
        });
        // if the filled in username is not found, return a error with a message
        if (checkUsername == null) {
            console.log("username doesn't exist");
            res.status(401).send({
                error: "username or password is wrong"
            });
            return
        } else {
            const username = await userData.findOne({
                username: req.body.username
            });
            // if both username and password are correct, return userId so that the user stays logged in
            if (username.password == req.body.password) {
                const userId = await userData.distinct("_id", {
                    "username": req.body.username
                })
                res.status(200).send({
                    succes: "successfully logged in",
                    id: userId,
                    username: req.body.username
                });
                // if the password is wrong,  return a error with a message
            } else {
                res.status(401).send({
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

// function to login with userId
app.post('/loginId', async (req, res) => {
    // check if the username and password fields are filled
    if (!req.body.username || !req.body.userId) {
        res.status(401).send({
            error: "no user Id provided"
        });
        return
    }
    // makes connection to the database and searches if the userId exists
    try {
        await client.connect();
        const userData = await client.db("Courseproject").collection("user_data");
        const userId = await userData.distinct("_id", {
            "username": req.body.username
        })
        // if userId doesn't exist, return a error with a message
        if (userId == null) {
            console.log("userId isnt valid");
            res.status(401).send({
                error: "userId isnt valid",
                Valid: false
            });
            return
        } else {
            // checks if userId in database is the same as the userId in the body
            if (req.body.userId == userId) {
                res.status(200).send({
                    Valid: true
                })
            } else {
                console.log("userId isnt valid");
                res.status(401).send({
                    error: "userId isnt valid",
                    Valid: false
                });
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
    console.log("reading events from the database");
    try {
        await client.connect();
        const data = await client.db("Courseproject").collection("events");
        events = await data.find().toArray()
        res.status(200).send(events)
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
    //check if all fields are filled
    if (!req.body.userId || !req.body.title || !req.body.description || !req.body.startDate || !req.body.endDate || !req.body.organisator || !req.body.price || !req.body.location) {
        console.log("missing fields");
        res.status(400).send("please fill in all fields");
    } else {
        // checking if the userId exist in our database
        await client.connect();
        const userData = await client.db("Courseproject").collection("user_data");
        const checkUserId = await userData.findOne({
            _id: ObjectId(req.body.userId)
        });
        // if userId doesn't exist, return error code with message
        if (checkUserId == null) {
            console.log("userId is invalid");
            res.status(401).send("userId is invalid")
        } else {
            // if userId exist, create a new object where we store all event details.
            const newEvent = {
                "title": req.body.title,
                "description": req.body.description,
                "startDate": req.body.startDate,
                "endDate": req.body.endDate,
                "organisator": req.body.organisator,
                "price": req.body.price,
                "location": req.body.location,
                "img": req.body.img
            };
            // check if there isn't a event already with the same title
            const eventData = await client.db("Courseproject").collection("events");
            const checkEvent = await eventData.findOne({
                title: newEvent.title
            })
            // if there is no event with same title, store new event in database
            if (checkEvent == null) {
                let insertEvent = await eventData.insertOne(newEvent);
                const eventId = await eventData.distinct("_id", {
                    "title": newEvent.title
                })
                console.log(eventId);
                res.status(200).send(eventId);
            } else {
                res.status(400).send("event already exists")
            }


        }


    }

})



app.listen(PORT, () => {
    console.log(`api running at: http://localhost:${PORT}`);
});