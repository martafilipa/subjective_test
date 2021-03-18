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
const Trains = require("./models/Trains");

var tools = require('./tools');

const connectDB = require("./db");
const { Session } = require('inspector');
const { render } = require('pug');
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
    saveUninitialized : true, 
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/', (req, res) => {
    res.render('index');
})

app.post('/start', (req, res) => {
    console.log('New client: ', req.session.id);
    const client = new Sessions({
        id: req.session.id, 
        order: tools.get_order(),
        gender: req.body.gender,
        display: req.body.display, 
        age: req.body.age, 
        name: req.body.name, 
        resolution: req.body.resolution.split(','),
        time: Date(),
        current: 0
    }); 
    client.save(function(err, _) {
        if (err)
            console.log('Error: ', err)
        else
        {
            res.redirect(303, '/train');
        }
    });
})

app.get('/test', (req, res) => {
    Sessions.findOne({'id' :req.session.id}, function(err, sess){
        if (err || sess == null){
            console.log('Error: ', err);
            render('error');
        }
        else{
            Pairs.findOne({'id' : sess.order[sess.current]}, function(err, pair) {
                if (err || pair == null){
                    console.log('Error: ', err);
                    render('error');
                }
                else{
                    res.render('test', {src_L: path.join('./public/images', pair.A), src_R : path.join('./public/images', pair.B),
                        current: sess.current, nPairs: nPairs});
                }
            })
        }
    });
});

app.post('/test', (req, res) => {
    Sessions.findOne({'id' :req.session.id}, function(err, sess){
        if (err || sess == null){
            console.log('Error: ', err);
            render('error');
        }
        else{
            if(sess.current >= nPairs - 1){
                Sessions.updateOne({ 
                    'id': req.session.id }, 
                    {$set: {'current': -1}, 
                    $push: {'time': Date()}}, 
                    function(err, _){
                        if (err){
                            console.log('Error: ', err);
                            render('error');
                        }
                        else
                            res.redirect(303, '/end');
                    }
                );
            }
            else{
                Sessions.updateOne({
                    'id': req.session.id },
                    {$push: {'time': Date()},
                    $push: { 'judgments':  req.body.value},
                    $inc: {'current': 1}},
                    function(err, _ ){
                        if (err){
                            console.log('Error: ', err);
                            render('error');
                        }
                        else
                            res.redirect(303, '/test');

                });
            }
        
        }
    });
})

app.get('/train', (req, res) => {
    Sessions.findOne({'id' :req.session.id}, function(err, sess){
        if (err || sess == null){
            console.log('Error: ', err);
            render('error');
        }
        else{
            Trains.findOne({'id' : sess.current}, function(err, pair) {
                if (err || pair == null){
                    console.log('Error: ', err);
                    render('error');
                }
                else{
                    res.render('train', {src_L: path.join('./public/images', pair.A), src_R : path.join('./public/images', pair.B), 
                        current: sess.current, nPairs: nTrain, ans: pair.res});
                }
            })
        }
    });
})

app.post('/train', (req, res) => {
    Sessions.findOne({'id' :req.session.id}, function(err, sess){
        if (err || sess == null){
            console.log('Error: ', err);
            render('error');
        }
        else{
            if(sess.current >= nTrain - 1){
                Sessions.updateOne({ 
                    'id': req.session.id }, 
                    {$set: {'current': 0}, 
                    $push: {'time': Date()}}, 
                    function(err, _){
                        if (err){
                            console.log('Error: ', err);
                            render('error');
                        }
                        else
                            res.redirect(303, '/test');
                    }
                );
            }
            else{
                Sessions.updateOne({
                    'id': req.session.id },
                    {$push: {'time': Date()},
                    $inc: {'current': 1}},
                    function(err, _ ){
                        if (err){
                            console.log('Error: ', err);
                            render('error');
                        }
                        else
                            res.redirect(303, '/train');

                });
            }
        
        }
    });
})

app.get('/start', (req, res) => {
    res.render('start_test');
})

app.get('/end', (req, res) => {
    res.render('end');
})

app.get('/error', (req, res) => {
    res.status(404);
    res.render('error');
})

const port = process.env.PORT || 80;
app.listen(port, () => console.log(`Listening on port ${port} ... `));
