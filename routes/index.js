var express = require('express');
var router = express.Router();
var dotenv = require('dotenv').config() ;
var mongourl = 'mongodb://'+process.env.DBUS+":"+process.env.DWORD+"@ds153113.mlab.com:53113/"+process.env.DBNAME
var session = require('express-session') ;
var mongo = require('mongodb').MongoClient ;

router.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))
//router.use(bodyParser.json()) ; // useful for parsing the ajax post data
router.use(function (req, res, next) {
  if (!req.session.username) {
    req.session.usercreated = false ;
    req.session.userexists = false ;
    req.session.username = " ";
    req.session.loginallowed = false ;
  }
  next()
})
/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(__dirname+'/views/index.html');
  req.session.destroy() ;
})

router.get('/main.css', function(req, res) {
  res.sendFile(__dirname+'/views/main.css') ;
})

router.get('/frontend.js', function(req, res) {
  res.sendFile(__dirname+'/views/frontend.js') ;
})

router.get('/createUser', function(req, res) {
  var object = {} ;
  console.log(req.session.usercreated) ;
  if(req.session.usercreated) {
    object.message = "User has been created. Now, please login" ;
  }
  else {
    object.message = "The user already exists." ;
  }
  console.log(object) ;
  res.jsonp(object) ;
})

router.get('/checkUserLogin', function(req, res) {
  var object = {} ;
  if(req.session.loginallowed) {
    object.value = "OK" ;
    object.username = req.session.username ;
  }
  res.jsonp(object) ;
  console.log(object) ;
})

router.post('/createUser', function(req, res) {
  mongo.connect(mongourl, function(err, db) {
    var collection = db.collection('usersfornightlife') ;
    console.log(req.body) ;
    console.log(req.body._id) ;
    collection.find({"_id":req.body._id}).toArray(function(err, docs) {
      console.log(docs) ;
      if(docs.length<1) {
        console.log("the user does not exist") ;
          collection.insert(req.body) ;
          req.session.usercreated = true ;
          console.log(req.session.usercreated) ;
          db.close() ;
          res.sendStatus(200) ;
      }
      else {
        res.sendStatus(500) ;
        db.close() ;
      }
    })
  })
})
router.post('/checkUserLogin', function(req, res) {
  mongo.connect(mongourl, function(err, db) {
    let collection = db.collection('usersfornightlife') ;
    console.log(req.body) ;
    collection.find({"_id": req.body._id}).toArray(function(err, docs) {
      if(docs.length<1) {
        // user does not exist ;
        req.session.userexists = false ;
        res.sendStatus(200) ;
        console.log('The user does not exit') ;
      }
      else {
        if(req.body.password===docs[0]["password"]) {
          req.session.username = docs[0]["username"] ;
          req.session.loginallowed = true ;
          res.sendStatus(200) ;
        }
      }
      db.close() ;
    })
  })
})
module.exports = router;
