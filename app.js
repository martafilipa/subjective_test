const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoDBStore = require('connect-mongodb-session')(session);
const  MongoClient = require('mongodb').MongoClient;

// Number of Pairs in test minus 1 
const nPairs = 360;
const nTrain = 3;


const app = express();
const Pairs = require("./models/Pairs");
const Sessions = require("./models/Sessions");
const Train = require("./models/Trains");

var tools = require('./tools');

const connectDB = require("./db");
connectDB();

const uri = 'mongodb://localhost:27017/test';

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ 
    extended: true 
}));

app.use("/public", express.static(path.join(__dirname, 'public')));

app.use(session({
    secret : '2Ayuj5hb#m3rd6x_&zbSA[wTC[Z-Vy', 
    resave : false, 
    saveUninitialized : false, 
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/', async (req, res) => {
    req.session.isAuth = true;
    console.log('ID:', req.session.id);
    console.log('Order: ', tools.get_order()); 
    const session = new Sessions({
        id: req.session.id, 
        order: tools.get_order(),
        current: 0
    })
    session.save()
        .then(() => {
            res.render('index');
        })
        .catch((err) => {
            console.log('Error: ', err);
            res.render('index');
        })
})

app.post('/start', async (req, res) => {
    console.log("Request: %j", req.body)
    console.log("Resolution: ", req.body.resolution.split(','))
    Sessions.updateOne(
        { 'id': req.session.id }, 
        {$set: {'gender': req.body.gender,
                'display': req.body.display, 
                'age': req.body.age, 
                'name': req.body.name, 
                'resolution': req.body.resolution.split(','),
                'current': 0
    },
        $push: {'time': Date()} }
    )
            .then((obj) => {
                console.log("Updated: %j", obj)

                // console.log('Updated - ' + obj);
                res.redirect(303, '/train');
            })
            .catch((err) => {
                console.log('Error: ', err);
            })
    
})

app.get('/test', async (req, res) => {

    try {
        const session = await Sessions.findOne({'id' :req.session.id})
        try {
            const pair = await Pairs.findOne({'id' : session.order[session.current]})
            res.render('test', {src_L: path.join('./public/images', pair.A), src_R : path.join('./public/images', pair.B), 
                current: session.current, nPairs: nPairs});
        } catch (err) {
            console.log('Error: ', err);
            res.render('error')
        }
    } catch (err) {
        console.log('Error: ', err);
        res.render('error')
    }
})

app.post('/test', async (req, res) => {

    try {
        const session = await Sessions.findOne({'id' :req.session.id})
        if(session.current >= nPairs - 1){
            Sessions.updateOne(
                { 'id': req.session.id }, 
                {$set: {'current': -1}, 
                $push: {'time': Date()}}
            )
                .then((obj) => {
                    res.redirect(303, '/end');
                })
                .catch((err) => {
                    console.log('Error: ', err);
                })
        }
        else{
            Sessions.updateOne(
                { 'id': req.session.id },
                {$push: {'time': Date()},
                $push: { 'judgments':  req.body.value},
                $inc: {'current': 1} }
            )
                .then((obj) => {
                    res.redirect(303, '/test');
                })
                .catch((err) => {
                    console.log('Error: ', err);
                })
        }
    }
        catch (err) {
            console.log('Error: ', err);
            res.render('error')
        }
})

app.get('/train', async (req, res) => {

    try {
        const session = await Sessions.findOne({'id' :req.session.id})
        try {
            const pair = await Train.findOne({'id' : session.current})
            res.render('train', {src_L: path.join('./public/images', pair.A), src_R : path.join('./public/images', pair.B), 
            current: session.current, nPairs: nTrain, ans: pair.res});
        } catch (err) {
            console.log('Error: ', err);
            res.render('error')
        }
    } catch (err) {
        console.log('Error: ', err);
        res.render('error')
    }
})

app.post('/train', async (req, res) => {

    try {
        const session = await Sessions.findOne({'id' :req.session.id})
        if(session.current >= nTrain - 1){
            Sessions.updateOne(
                { 'id': req.session.id }, 
                {$set: {'current': 0}, 
                $push: {'time': Date()}}
            )
                .then((obj) => {
                    res.redirect(303, '/start');
                })
                .catch((err) => {
                    console.log('Error: ', err);
                })
        }
        else{
            Sessions.updateOne(
                { 'id': req.session.id },
                {$push: {'time': Date()}, 
                $inc: {'current': 1} }
            )
                .then((obj) => {
                    res.redirect(303, '/train');
                })
                .catch((err) => {
                    console.log('Error: ', err);
                })
        }
    }
        catch (err) {
            console.log('Error: ', err);
            res.render('error')
        }
})

app.get('/start', async (req, res) => {
    res.render('start_test');
})

app.get('/end', async (req, res) => {
    res.render('end');
})

app.get('/error', async (req, res) => {
    res.status(404);
    res.render('error');
})

const port = process.env.PORT || 80;
app.listen(port, () => console.log(`Listening on port ${port} ... `));
