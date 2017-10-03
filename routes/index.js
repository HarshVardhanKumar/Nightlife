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
router.use(bodyParser.json()) ; // useful for parsing the ajax post data
router.use(function (req, res, next) {
  if (!req.session.name) {
    req.session.name = " " ;
  }
  next()
})
/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(__dirname+'/views/index.html');
});

module.exports = router;
