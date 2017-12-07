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
    req.session.email_id = " " ;
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
});

router.get('/loginuser.jpg', function(req, res) {
  res.sendFile(__dirname+'/views/loginuser.jpg') ;
});

router.get('/signup-user.png', function(req, res) {
  res.sendFile(__dirname+'/views/signup-user.png') ;
})

router.get('/placesnightlife_noofusers', function(req,res) {
  mongo.connect(mongourl, function(err, db) {
    if(err) {
      res.sendStatus(500) ;
      db.close() ;
    }
    else {
      let collection = db.collection('placesnightlife_noofusers') ;
      collection.find().toArray(function(err, docs) {
        if(err) {
          res.sendStatus(500) ;
          db.close() ;
        }
        else {
          console.log(docs);
          let response = {} ;
          for(let i = 0 ; i<docs.length ; i++) {
            response[docs[i]._id] = docs[i].noofusers ;
          }
          res.jsonp(response) ;
          db.close() ;
        }
      })
    }
  })
})

router.post('/createUser', function(req, res) {
  mongo.connect(mongourl, function(err, db) {
  if(db!==null) {
    var collection = db.collection('usersfornightlife') ;
    let collection1 = db.collection('usersnightlife_places') ;
    console.log(req.body) ;
    console.log(req.body._id) ;
    collection.find({"_id":req.body._id}).toArray(function(err, docs) {
      console.log(docs) ;
      if(docs.length<1) {
        console.log("the user does not exist") ;
          collection.insert(req.body) ;

          let user = {} ;
          user._id = req.body._id ;
          user.venues_visiting = new Array(0) ;
          collection1.insert(user) ;

          req.session.usercreated = true ;
          console.log(req.session.usercreated) ;
          db.close() ;

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

      }
      else {
        res.sendStatus(500) ;
        db.close() ;
      }
    })
  }
  })
})

router.post('/checkUserLogin', function(req, res) {
  mongo.connect(mongourl, function(err, db) {
  if(db!==null) {
    let collection = db.collection('usersfornightlife') ;
    console.log(req.body) ;
    collection.find({"_id": req.body._id}).toArray(function(err, docs) {
      if(docs.length<1) {
        // user does not exist ;
        req.session.userexists = false ;
        console.log('The user does not exit') ;
        var object = {} ;
        if(req.session.loginallowed) {
          object.value = "NOT" ;
          object.username = undefined ;
        }
        res.jsonp(object) ;
      }
      else {
        if(req.body.password===docs[0]["password"]) {
          req.session.username = docs[0]["username"] ;
          req.session.email_id = docs[0]["_id"] ;
          req.session.loginallowed = true ;
          var object = {} ;
          if(req.session.loginallowed) {
            object.value = "OK" ;
            object.username = req.session.username ;
          }
          res.jsonp(object) ;
        }
        else {
          var object = {} ;
          object.value = "notok" ;
          res.jsonp(object) ;
        }
      }
      db.close() ;
    })
  }
  })
})

router.post('/createCheckin', function(req, res) {
  mongo.connect(mongourl, function(err, db) {
  if(db!==null) {
    let venueid = req.body.venueid ;
    let collection1 = db.collection('usersnightlife_places') ;
    let collection2 = db.collection('placesnightlife_noofusers') ;
    // we first determine whether the user is already going to this place.

    collection1.find({"_id": req.session.email_id}).toArray(function(err, docs) {
        // the user already exits, so we check whether he/she is going to the venue ;
        console.log(req.session.email_id);
        console.log(docs);
        if(docs[0].venues_visiting.indexOf(req.body.venueid)>-1) {
          // the user is already going there
          var response = {} ; response.updatedvalue = "initialvalue"; response.message = "Already going there" ; // response.updatedvalue = "initialvalue" indicates the frontend to maintain the same value.
          res.jsonp(response) ;
          db.close() ;
        }
        else {
          // the user is not visiting there
          // increase the no. of users visiting the places, then make an entry for the user's venues list
          // check if the venueid exits in collection2. If not, then make an entry
          let transactionsuccessful = true ;
          // find if the venue exists in the second collection.
          collection2.find({"_id": venueid}).toArray(function(err, doc) {
            if(doc.length>0) {
              // the venue exits. Now update the value
              collection2.update({"_id": venueid}, {$inc: {"noofusers": 1}}, function(err) {
                //some error occured. now abort the transaction.
                if(err) {
                  transactionsuccessful = false ;
                  res.sendStatus(400) ;
                }
                else {
                  docs[0].venues_visiting.push(venueid) ; // doc here refers to collection2 whereas docs refers to collection1
                  collection1.update({"_id": req.session.email_id}, {$set: {"venues_visiting": docs[0].venues_visiting}}, function(err) {
                    if(err) {
                      console.log('some error occured');
                      res.sendStatus(400) ;
                    }
                    else {
                      var response = {} ; response.updatedvalue = "increasevalue";// response.updatedvalue = "initialvalue" indicates the frontend to maintain the same value.
                      res.jsonp(response) ;
                    }
                  }) ;
                }
              })
            }
            else {
              // the venue is not listed in placesnightlife_noofusers table.
              let object = {} ;
              object._id = req.body.venueid ;
              console.log('venueid is '+venueid);
              object.noofusers  = 1 ;
              console.log(object);
              collection2.insert(object, function(err, data) {
                if(err) {
                  // notify the frontend of error
                  res.sendStatus(400) ;
                }
                else {
                  docs[0].venues_visiting.push(venueid) ;
                  console.log('inserted a new venue');
                  collection1.update({"_id": req.session.email_id}, {$set: {"venues_visiting": docs[0].venues_visiting}}, function(err) {
                    if(err) {
                      console.log('some error occured');
                      res.sendStatus(400) ;
                    }
                    else {
                      var response = {} ; response.updatedvalue = "updatevalue"; // response.updatedvalue = "initialvalue" indicates the frontend to maintain the same value.
                      res.jsonp(response) ;
                    }
                  }) ;
                }
              })
            }
          })

        }
      })
    }
    })
  })

module.exports = router;
