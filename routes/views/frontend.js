let loggedinuser = false ;
let notificationhtml = "<div class='notification'><span class='closebutton' onclick='close()'>&times;</span>$  ^</div><div ></div>" ;
let originalbodycontent = "" ;
window.onload = function() {
  originalbodycontent = document.getElementsByTagName('body')[0].innerHTML;
}

function showLoader(loaderid) {
  var loader = document.getElementById(loaderid) ;
  loader.style.position = "relative" ;
  loader.style.top = loader.parentElement.clientHeight*0.45 ;
  loader.style.display = "block" ;
}

function hideLoader(loaderid) {
  document.getElementById(loaderid).style.display = "none" ;
}

function processSignup() {
  var object = {} ;
  object.username=document.getElementById('signupusername').value ;
  object._id = document.getElementById('signupemail').value ;
  object.password = document.getElementById('signuppassword').value ;

  $.ajax({
    url: 'createUser',
    type: "POST",
    data: JSON.stringify(object),
    contentType: "application/json",
    success: function(data) {
      console.log('success');
      //$.ajax({
        //url: 'createUser',
        //type: 'GET',
        //dataType: 'jsonp',
        //success: function(data) {
          var a = document.getElementById('signupdropdown') ;
          a.style.backgroundColor = "white" ;
          a.style.color = "green" ;
          a.innerHTML = data.message ;
          console.log(data.message) ;
        //}
      //}) ;
    },
    error: function() {
      document.getElementById('signupmessage').innerHTML = "Signup Failed. Please Try again." ;
    }
  }) ;
}

function checkLogin() {
  var object = {} ;
  object._id = document.getElementById('loginemail').value ;
  object.password = document.getElementById('loginpassword').value ;
  document.getElementById('loginemail').value = "" ;
  document.getElementById('loginpassword').value = "" ;

  $.ajax({
    url: 'checkUserLogin',
    type:"POST",
    contentType: 'application/JSON',
    data: JSON.stringify(object),
    success: function(value) {

          if(value.value==="OK") {
            loginclick() ;
            console.log(document.getElementById('loginbutton').clientWidth) ;
            setTimeout(function() {
              document.getElementById('loginbutton').innerHTML = value.username ;}, 500) ;
            let totalleftvaluesoccupiedbysignupandlogin = document.getElementById('signupbutton').offsetWidth+document.getElementById('loginbutton').offsetWidth ;
            console.log(totalleftvaluesoccupiedbysignupandlogin);
            $('ul li:first-child').css("padding-right",document.documentElement.clientWidth-totalleftvaluesoccupiedbysignupandlogin-500) ;
            loggedinuser = true ;
          }
          else {
            document.getElementById('loginmessage').innerHTML = "Login Failed!!. Please try again." ;
          }
        //}
      //}) ;
    }
  }) ;
}

var venuesearchurlprefix = "https://api.foursquare.com/v2/venues/";
var venuesearchurlsuffix = "?client_id=CZWUOXHDACJSHFEYTBZZ2304SBXRZEQCGXA5ER5D3MF0ALYZ&client_secret=Z4LJLNABYG2SVWZVBR4KEUJPQ4A5ROPM5I2YPWMZP04AHDE4&v=20170501" ;

function search() {

  let location = document.getElementById('places').value ;

  document.getElementsByTagName('body')[0].innerHTML = originalbodycontent ;
  document.getElementById('body').style.display="none" ;

  showLoader("loader") ;

  $.ajax({
    url: 'placesnightlife_noofusers',
    method: 'GET',
    dataType: 'jsonp',
    success: function(resultsplacesnightlife) {
      //  results contain the details of the venues existing in the database and no. of users
      // now get the results of the query of location
      // we then compare the venueid of the results of location with the data and set the going button inner html.
      $.ajax({url: 'https://maps.googleapis.com/maps/api/geocode/json?address='+location+'&key=AIzaSyBoCRRbEs84If1UsBGQyzStE9b9njaxoAo',
                dataType: "JSON"  ,
                success: function(data) {
                  // the longitude and latitude data is obtained for the given location
                    console.log(data) ;
                    if(data.status == "OK") {

                      $.ajax({
                        url:'https://api.foursquare.com/v2/venues/search?categoryId=4bf58dd8d48988d11f941735,4bf58dd8d48988d123941735,56aa371be4b08b9a8d57354d,4bf58dd8d48988d11b941735,52e81612bcbc57f1066b7a0d,56aa371ce4b08b9a8d57356c,4bf58dd8d48988d1d5941735,4bf58dd8d48988d122941735,4bf58dd8d48988d121941735,53e510b7498ebcb1801b55d4,4bf58dd8d48988d11a941735&ll='+data.results[0].geometry.location.lat+","+data.results[0].geometry.location.lng+'&radius=10000&intent=browse&v=20120801&client_id=CZWUOXHDACJSHFEYTBZZ2304SBXRZEQCGXA5ER5D3MF0ALYZ&client_secret=Z4LJLNABYG2SVWZVBR4KEUJPQ4A5ROPM5I2YPWMZP04AHDE4&v=20170501',
                        success: function(results) {
                          // the venueid of the query results have been obtained. we now make separate request for each of the venueid to get the details of the venue.
                          console.log(results);
                          var size = results.response.venues.length ;
                          setTimeout( function() {
                            for(let i = 0 ; i<size ; i++) {
                              $.ajax({
                                url: venuesearchurlprefix+results.response.venues[i].id+venuesearchurlsuffix ,
                                dataType: 'json',
                                success: function(data) {
                                  // The details of the venue have been obtained.
                                  console.log(data);

                                  if(data.meta.code===200) {
                                    let url = data.response.venue.canonicalUrl ;
                                    let imageurl = data.response.venue.bestPhoto.prefix+'100x100'+data.response.venue.bestPhoto.suffix ;
                                    let rating = data.response.venue.rating+'/10' ;

                                    if(data.response.venue.rating===undefined) {
                                      rating = "Not available" ;
                                    }

                                    let locationdetails = data.response.venue.location.formattedAddress.join(', ') ;
                                    let contactdetails = data.response.venue.contact.phone ;

                                    if(data.response.venue.contact.phone===undefined) {
                                      contactdetails = "Not available" ;
                                    }

                                    let noofusers = resultsplacesnightlife[data.response.venue.id] ;
                                    if(noofusers===undefined) {
                                      noofusers = 0 ;
                                    }
                                    console.log('noofusers is '+noofusers);
                                    document.getElementById('body').innerHTML+='<div class="venues" id="g'+i+'" ><img src='+imageurl+' class = "venueimage"><div class="venuedescription"> <b>'+data.response.venue.name+'</b><span class="ratings"> ratings: '+rating+'</span>    <p>    Location: '+locationdetails+'<br>      Contacts: '+contactdetails+'<br><br><a href="'+url+'">Visit Page</a>  </p>  </div><div class="authorizedcheckins"> '+data.response.venue.stats.usersCount+' Past Checkins </div><div '+' class = "goingbutton" onclick = addcheckin('+'"'+data.response.venue.id+'"'+','+i+') id="a'+i+'" >'+noofusers+'<i class="fa fa-spinner" style="font-size:15px; display:none" aria-hidden="true"></i> Going  </div></div>' ;
                                  }

                                  document.getElementById('loader').style.display = "none" ;
                                  document.getElementById('body').style.display="block" ;
                                  document.getElementById('searchplaces').style.paddingTop = 50 ;
                                  document.getElementById('places').value = location ;

                                }
                              }) ;

                            }
                          },1500) ;
                        },
                        error: function(err) {
                          document.getElementById('body').style.display = "block" ;
                          document.getElementsByTagName('body')[0].innerHTML+=err.toString() ;
                        }
                      }) ;
                    }
    },
    error: function() {
      document.getElementById('places').value = "Please Enter the postal address of your location"
    }
  });
  document.getElementById('placeslabel').style.display = "none" ;
  //console.log(document.getElementsByTagName('body')[0].innerHTML) ;
  }
  }) ;
}

function goto(url) {
  console.log('url is '+url);
  window.location = url ;
}
function addcheckin(id, i) {
  id = id.trim() ;
  if(loggedinuser===false) {
    loginclick() ;
  }
  else {
    id = id.toString()+"" ;
    console.log(document.getElementById("a"+i).children);
    var checkinurl = "createCheckin";
    var object = {} ;
    object.venueid = id ;
    $.ajax({
      url : checkinurl,
      method: "POST",
      contentType: 'application/json',
      data: JSON.stringify(object),
      success: function(data) {
        console.log('done');
        console.log(data);
        let searchg = document.createElement("p") ; searchg.setAttribute("class", "searchg") ;
        if(data.updatedvalue!=="initialvalue") {
          let initialvalue = parseInt(document.getElementById("a"+i).innerHTML.split(" ")[0]) ;
          // show notification that the venue has been added to the user list
          searchg.innerHTML = "Venue added to your list" ;
          document.getElementById("g"+i).appendChild(searchg) ;
          document.getElementById("a"+i).innerHTML = (initialvalue+1)+'<i class="fa fa-spinner" style="font-size:15px; display:none" aria-hidden="true"></i> Going' ;

        }
        else {
          // show the notification that this user is already going that place.
          searchg.innerHTML = "You are already going here" ;
          document.getElementById("g"+i).appendChild(searchg) ;
        }
      }
    }) ;
  }
}

function setcontentofalertbars(alerthtml, contentbeforeclosebutton) {
  var firstcontent = alerthtml.split('$')[0] ;
  var lastcontent = alerthtml.split('^')[1] ;

  return firstcontent+contentbeforeclosebutton+lastcontent ;
}

function loginclick() {
            $('#signupdropdown').slideUp(500) ;
            $('#logindropdown').slideToggle(500);
}
function signupclick() {
            $('#logindropdown').slideUp(500);
            $('#signupdropdown').slideToggle(500) ;
}
