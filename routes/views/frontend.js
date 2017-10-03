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
      $.ajax({
        url: 'createUser',
        type: 'GET',
        dataType: 'jsonp',
        success: function(data) {
          document.getElementById('signupmessage').innerHTML = data.message ;
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
      $.ajax({
        url: 'checkUserLogin',
        type: "GET",
        dataType: 'jsonp',
        success: function(value) {
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
