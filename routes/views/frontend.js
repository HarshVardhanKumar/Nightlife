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
    success: function() {
      console.log('success');
      $.ajax({
        url: 'createUser',
        type: 'GET',
        dataType: 'jsonp',
        success: function(data) {
          var a = document.getElementById('signupdropdown') ;
          a.style.backgroundColor = "white" ;
          a.style.color = "green" ;
          a.innerHTML = data.message ;
          console.log(data.message) ;
        }
      }) ;
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

  $.ajax({
    url: 'checkUserLogin',
    type:"POST",
    contentType: 'application/JSON',
    data: JSON.stringify(object),
    success: function() {
      console.log('success') ;
      $.ajax({
        url: 'checkUserLogin',
        type: "GET",
        dataType: 'jsonp',
        success: function(value) {
          console.log(value.value);
          console.log(value.username);
          if(value.value==="OK") {
            document.getElementById('loginbutton').innerHTML = value.username ;
          }
          else {
            document.getElementById('loginmessage').innerHTML = "Login Failed" ;
          }
        }
      }) ;
    }
  }) ;
}


function search() {
  let location = document.getElementById('places').value ;
  $.ajax({url: 'https://maps.googleapis.com/maps/api/geocode/json?address='+location+'&key=AIzaSyBoCRRbEs84If1UsBGQyzStE9b9njaxoAo',
            dataType: "JSON"  ,
            success: function(data) {
                console.log(data) ;
                if(data.status == "OK") {
                  $.ajax({
                    url:'https://api.foursquare.com/v2/venues/search?categoryId=4bf58dd8d48988d11f941735,4bf58dd8d48988d123941735,56aa371be4b08b9a8d57354d,4bf58dd8d48988d11b941735,52e81612bcbc57f1066b7a0d,56aa371ce4b08b9a8d57356c,4bf58dd8d48988d1d5941735,4bf58dd8d48988d122941735,4bf58dd8d48988d121941735,53e510b7498ebcb1801b55d4,4bf58dd8d48988d11a941735&ll='+data.results[0].geometry.location.lat+","+data.results[0].geometry.location.lng+'&radius=10000&intent=browse&v=20120801&client_id=CZWUOXHDACJSHFEYTBZZ2304SBXRZEQCGXA5ER5D3MF0ALYZ&client_secret=Z4LJLNABYG2SVWZVBR4KEUJPQ4A5ROPM5I2YPWMZP04AHDE4&v=20170501',
                    success: function(results) {
                      console.log(results);
                      var size = results.responses.venues.length ;
                    }
                  }) ;
                }
            }
  }) ;
}

$(document).ready(function() {
    $('#loginbutton').click(
        function(){
            $(this).children('#logindropdown').slideToggle(500);
        }
    );
    $('#signupbutton').click(
        function() {
            $(this).children('#signupdropdown').slideToggle(500) ;
        }
    )
});
