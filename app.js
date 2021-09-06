async function main() {

    const express = require('express');
    const path = require('path');
    const bodyParser = require('body-parser');
    const session = require('express-session');
    const mongoose = require('mongoose');
    const MongoDBStore = require('connect-mongodb-session')(session);
    const  MongoClient = require('mongodb').MongoClient;

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

    // Number of test pairs (nPairs) and train pairs (nTrain)
    const nPairs = await Pairs.countDocuments({});
    const nTrain = await Trains.countDocuments({});

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

    const pairs_ref = await  Pairs.find({}, {'_id' : 0, 'A' : 0, 'B':0});

    app.get('/', (req, res) => {
        // console.log(req.query.err)
        if(req.query.err == 'true')
            res.render('index', {errorCont: req.query.err});
        else 
            res.render('index', {errorCont: false});
    })

    app.post('/start', (req, res) => {
        console.log('New client: ', req.session.id);

        const client = new Sessions({
            id: req.session.id, 
            order: tools.get_order(pairs_ref),
            gender: req.body.gender,
            display: req.body.display, 
            age: req.body.age, 
            name: req.body.name, 
            email: req.body.email,
            resolution: req.body.resolution.split(','),
            time: Date(),
            current: 0
        }); 
        client.save(function(err, _) {
            if (err){
                console.log('Error: ', err)
                res.redirect(303, '/error');
            }
            else
                res.redirect(303, '/train');
        });
    })

    app.get('/test', (req, res) => {
        Sessions.findOne({'id' :req.session.id}, function(err, sess){
            if (err || sess == null){
                console.log('Error: ', err);
                res.redirect(303, '/error');
            }
            else{
                Pairs.findOne({'id' : sess.order[sess.current]}, function(err, pair) {
                    if (err || pair == null){
                        console.log('Error: ', err);
                        res.redirect(303, '/error');
                    }
                    else{
                        res.render('test', {src_L: path.join('./public/images/test', pair.A), src_R : path.join('./public/images/test', pair.B),
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
                res.redirect(303, '/error');
            }
            else{
                if(sess.current < 0){
                    res.redirect(303, '/end')
                }
                if(sess.current >= nPairs - 1){
                    Sessions.updateOne({ 
                        'id': req.session.id }, 
                        {$set: {'current': -1}, 
                        $push: {'time': Date(), 
                        'judgments':  req.body.value}}, 
                        function(err, _){
                            if (err){
                                console.log('Error: ', err);
                                res.redirect(303, '/error');
                            }
                            else
                                res.redirect(303, '/end');
                        }
                    );
                }
                else{
                    Sessions.updateOne({
                        'id': req.session.id },
                        {$push: {'time': Date(),
                        'judgments':  req.body.value},
                        $inc: {'current': 1}},
                        function(err, _ ){
                            if (err){
                                console.log('Error: ', err);
                                res.redirect(303, '/error');
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
                res.redirect(303, '/error');
            }
            else{
                Trains.findOne({'id' : sess.current}, function(err, pair) {
                    if (err || pair == null){
                        console.log('Error: ', err);
                        res.redirect(303, '/error');
                    }
                    else{
                        res.render('train', {src_L: path.join('./public/images/train', pair.A), src_R : path.join('./public/images/train', pair.B), 
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
                res.redirect(303, '/error');
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
                                res.redirect(303, '/error');
                            }
                            else
                                res.redirect(303, '/start');
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
                                res.redirect(303, '/error');
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

    app.post('/continue', (req, res) => {
        Sessions.findOne({'email' :req.body.email}, function(err, sess){
            if (err || sess == null){
                console.log('Email not found.');
                res.redirect(303, '/?err=true');
            }
            else{
                Sessions.updateOne({
                    'id': req.session.id},
                    function(err, _ ){
                        if (err){
                            console.log('Error: ', err);
                            res.redirect(303, '/error');
                        }
                        else
                            res.redirect(303, '/test');
                    });
            }
        });
    })

    app.post('/start_test', (req, res) => {
        Sessions.findOne({'id' :req.session.id}, function(err, sess){
            if (err || sess == null){
                console.log('Error: ', err);    
                res.redirect(303, '/error');
            }
            else{
                Sessions.updateOne({
                    'id': req.session.id}, 
                    {$push: {'time': Date()}},
                    function(err, _ ){
                        if (err){
                            console.log('Error: ', err);
                            res.redirect(303, '/error');
                        }
                        else
                            res.redirect(303, '/test');
                });
            }
        });
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
}

main();