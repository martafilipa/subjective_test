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

const uri = 'mongodb://localhost:27000/test';

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ 
    extended: true 
}));

app.use("/public", express.static(path.join(__dirname, 'public')));

app.use(session({
    secret : 'key that will sign cookie', 
    resave : false, 
    saveUninitialized : false, 
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/', async (req, res) => {
    req.session.isAuth = true;
    // console.log('ID:', req.session.id);
    // console.log('Order: ', tools.get_order()); 
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
                'resolution': req.body.resolution.split(',')
    },
        $push: {'time': Date()} }
    )
            .then((obj) => {
                console.log("Updated: %j", obj)

                // console.log('Updated - ' + obj);
                res.redirect(303, '/test');
            })
            .catch((err) => {
                console.log('Error: ', err);
            })
    
})

app.get('/test', async (req, res) => {
    // try {
    //     const session = await Sessions.findOne({'id' :req.session.id});
    //     if(!session){
    //         res.redirect('/error');
    //     }
    //     else{

    //     }
    // }
    // catch(err){

    // }
    const session = await Sessions.findOne({'id' :req.session.id});

    const pair = await Pairs.findOne({'id' :session.order[session.current]});

    if(session.current > nPairs){
        Sessions.updateOne(
            { 'id': req.session.id }, 
            {$set: {'current': -1}, 
            $push: {'time': Date()} }
        )
            .then((obj) => {
                // console.log('Updated - ' + obj);
                res.redirect('/end');
            })
            .catch((err) => {
                console.log('Error: ', err);
            })
    }
    else{
        Sessions.updateOne(
            { 'id': req.session.id }, 
            {$push: {'time': Date()} }
        )
            .then((obj) => {
                res.render('test', {src_L: path.join('./public/images', pair.A), src_R : path.join('./public/images', pair.B), 
                current: session.current, nPairs: nPairs});
            })
            .catch((err) => {
                console.log('Error: ', err);
            })
    }
})

app.get('/train', async (req, res) => {
    // try {
    //     const session = await Sessions.findOne({'id' :req.session.id});
    //     if(!session){
    //         res.redirect('/error');
    //     }
    //     else{

    //     }
    // }
    // catch(err){

    // }
    const session = await Sessions.findOne({'id' :req.session.id});
    
    console.log('Current id:', session.current);
    const pair = await Train.findOne({'id' : session.current});

    console.log(pair)

    if(session.current > nTrain){
        Sessions.updateOne(
            { 'id': req.session.id }, 
            {$set: {'current': 0}, 
            $push: {'time': Date()} }
        )
            .then((obj) => {
                // console.log('Updated - ' + obj);
                res.redirect('/end');
            })
            .catch((err) => {
                console.log('Error: ', err);
            })
    }
    else{
        Sessions.updateOne(
            { 'id': req.session.id },
            {$push: {'time': Date()} }
        )
            .then((obj) => {
                console.log("TRAIN: ", session.train)
                res.render('train', {src_L: path.join('./public/images', pair.A), src_R : path.join('./public/images', pair.B), 
                ans_right: pair.res, ans_user: session.train[session.current -1], current: session.current, nTrain: nTrain});
            })
            .catch((err) => {
                console.log('Error: ', err);
            })
    }
})


app.post('/test', async (req, res) => {
    // console.log("Request: %j", req.body)
    Sessions.updateOne(
        { 'id': req.session.id }, 
        { $push: { 'judgments':  req.body.value} ,
        $inc: {'current': 1} },
    )
        .then((obj) => {
            // console.log('Updated - ' + obj);
            res.redirect(303, '/test');
        })
        .catch((err) => {
            console.log('Error: ', err);
        })
})
app.post('/train', async (req, res) => {
    Sessions.updateOne(
        { 'id': req.session.id }, 
        { $push: { 'train':  req.body.value} ,
        $inc: {'current': 1} },
    )
        .then((obj) => {
            // console.log('Updated - ' + obj);
            res.redirect(303, '/train');
        })
        .catch((err) => {
            console.log('Error: ', err);
        })
})

app.get('/end', async (req, res) => {
    res.render('end');
})

app.get('/error', async (req, res) => {
    res.status(404);
    res.render('error');
})


const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port} ... `));
