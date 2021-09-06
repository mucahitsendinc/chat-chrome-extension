const API="https://chat.dehasoft.com.tr";
const APP_VERSION="R3FpSWs1Z2tzb1RzUTAxZWFLZ3A1dz09";
const loading = $('#loading');
const chat = $('.chat');
const forms = $('#forms');
const register = $('#register');
const login = $('#login');
const forgot = $('#forgot');
const settings = $('#settings');
const regform = $('#registerForm');
const regErr=$('#registerError');
const logErr=$('#loginError');
const forErr=$('#forgotError');
const newVersion=$('#newVersion');
const forgotEmail=$('#forgotEmail');
const forgotCode=$('#forgotCode');
const forgotStatus=$('#forgotStatus');
const forgotNewPassword=$('#forgotNewPassword');
const forgotToken=$('#forgotToken');
const messages=$('#messages');
const mesaj=$('#mesaj');
const green="linear-gradient(90deg, rgba(105,215,96,1) 0%, rgba(62,189,42,1) 35%, rgba(138,255,114,1) 100%)";
const red="linear-gradient(90deg, rgba(145,47,52,1) 0%, rgba(119,30,22,1) 35%, rgba(145,13,13,1) 100%)"

loading.show() 
chat.hide()
forms.hide()
register.hide()
forgot.hide()
forgotCode.hide()
forgotNewPassword.hide()
newVersion.hide()
settings.hide()
var myIP=""
var update=""


Pusher.logToConsole = true;

var pusher = new Pusher('cc6a096a59440665729b', {
  cluster: 'eu'
});

var channel = pusher.subscribe('my-channel');
channel.bind('my-event', function(data) {
  alert(JSON.stringify(data));
});


function goBottom(){
  document.getElementById('messages').scrollTo(0, document.getElementById('messages').scrollHeight);
}

$(document).ready(function(){
  //$('#messages').html('')

  getIp=()=>{
    window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;   //compatibility for firefox and chrome
    var pc = new RTCPeerConnection({iceServers:[]}), noop = function(){};      
    pc.createDataChannel("");    //create a bogus data channel
    pc.createOffer(pc.setLocalDescription.bind(pc), noop);    // create offer and set local description
    pc.onicecandidate = function(ice){  //listen for candidate events
        if(!ice || !ice.candidate || !ice.candidate.candidate)  return;
         myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];  
          if(myIP.length<5){
            setTimeout(() => {
              getIp()
            }, 200);
          }
        pc.onicecandidate = noop;
    };
   
  }
  getIp()
  getMessages=()=>{
    if(localStorage.getItem('token')!=null){
        $.ajax({
          url: API+"/get-message",
          type: "post",
          data: {
                  "type":"loading",
                  "ip": myIP,
                  'version':APP_VERSION,
                  "token" : localStorage.getItem('token')? localStorage.getItem('token') : ''
                } ,
          success: function (response) {
            if(response.version==false){
              register.hide()
              login.hide()
              forgot.hide()
              chat.hide()
              update=response.redirect
              newVersion.show()

            }else if(response.login==false){
                loading.hide()
                forms.show()
                login.show()
            }else if(response.login==true){
              loading.hide()
              forms.hide()
              chat.show()
              messages.html('')
              response.messages.forEach(element => {
                  console.log(element)
                  if(element.profile==true){
                    messages.html(messages.html()+`
                      <div class="message sender">
                          <div class="messageContent">`+element.message+`</div>
                            <div class="date">`+element.date+`</div>
                        </div>`);
                  }else{
                    messages.html(messages.html()+`
                      <div class="message sending">
                        <div class="name">`+element.username+`</div>
                        <div class="messageContent">`+element.message+`</div>
                          <div class="date">`+element.date+`</div>
                      </div>`);
                  }
                  goBottom()
              });

            }
          }
      });
    }else{
      $.ajax({
          url: API+"/check-version/"+APP_VERSION,
          type: "get",
          data: {
                  "type":"loading",
                  "ip": myIP,
                  'version':APP_VERSION
                } ,
          success: function (response) {
            if(response.version==false){
              register.hide()
              login.hide()
              loading.hide()
              chat.hide()
              forgot.hide()
              chat.hide()
              update=response.redirect
              newVersion.show()

            }else{
              loading.hide()
              forms.show()
              login.show()
            }
          }
      });
      
    }
    
  }
  
  getMessages()

  $('#registerForm').on('submit',function(e){
    e.preventDefault()
    $('#registerForm button').prop('disabled', true)

    let formData=($(this).serializeArray())
    
    $.ajax({
        url: API+"/register",
        type: "post",
        data: formData ,
        success: function (response) {
          regErr.html('<div class="errorArea">'+response.msg+'</div>')
          if(response.error!=true){
            $('.errorArea').css('background',green)
            $('#registerForm').trigger('reset')
            setTimeout(() => {
              register.hide()
              login.show()
              regErr.html('')
            }, 1000);
          }else{
            $('.errorArea').css('background',red)
            $('#registerForm button').prop('disabled', false)
          }

        },
    });

  })

  $('#loginForm').on('submit',function(e){
    e.preventDefault()
    $('#loginForm button').prop('disabled', true)

    let formData=($(this).serializeArray())
    formData.push({'name':'ip','value':myIP})
    $.ajax({
        url: API+"/login",
        type: "post",
        data: formData ,
        success: function (response) {
          logErr.html('<div class="errorArea">'+response.msg+'</div>')
          if(response.error!=true){
            $('.errorArea').css('background',green)
            localStorage.setItem('token',response.token)
            localStorage.setItem('email',response.email)
            localStorage.setItem('id',response.id)
            $('#loginForm').trigger('reset')
            setTimeout(() => {
              getMessages()
              logErr.html('')
              
            }, 200);
            //register.hide()
            //login.show()
          }else{
            $('.errorArea').css('background',red)
          }
          $('#loginForm button').prop('disabled', false)

        },
    });

  })

  $('#forgotForm').on('submit',function(e){
    e.preventDefault()

    $('#forgotForm button').prop('disabled', true)

    let formData=($(this).serializeArray())
    if(forgotStatus.val()==0){
      $.ajax({
         url: API+"/send-forgot-code",
         type: "post",
         data: formData ,
         success: function (response) {


            forErr.html('<div class="errorArea">'+response.msg+'</div>')

            if (response.error==true) {

              $('.errorArea').css('background',red)

            }else{

              $('.errorArea').css('background',green)
              forgotEmail.hide()
              forgotCode.show()
              forgotNewPassword.show()
              forgotStatus.val('1')
              forgotToken.val(response.token)
              setTimeout(() => {
                forErr.html('')
              }, 3000);
              $('#forgotForm button').html('Şifremi Güncelle')

            }
            $('#forgotForm button').prop('disabled', false)

         },
     });

    }else if(forgotStatus.val()==1){

      $.ajax({
         url: API+"/new-password",
         type: "post",
         data: formData ,
         success: function (response) {


            forErr.html('<div class="errorArea">'+response.msg+'</div>')

            if (response.error!=false) {
              if(response.restart==true){
                forgotEmail.show()
                forgotCode.hide()
                forgotNewPassword.hide()
                forgotStatus.val('0')
                forgotToken.val('')
                forgot.show()
                $('#forgotForm button').html('Doğrulama Kodu Gönder<i class="fa fa-envelope"></i>')
              }
              $('.errorArea').css('background',red)
              $('#forgotForm button').prop('disabled', false)

            }else{

              $('.errorArea').css('background',green)
              $('#forgotForm').trigger('reset')

              forgotEmail.hide()
              forgotCode.hide()
              forgotNewPassword.hide()
              $('#forgotForm button').hide()
              setTimeout(() => {
                forgotEmail.show()
                forgotStatus.val('0')
                forgotToken.val('')
                forgot.hide()
                login.show()
                $('#forgotForm button').show()
                $('#forgotForm button').html('Doğrulama Kodu Gönder<i class="fa fa-envelope"></i>')
                $('#forgotForm button').prop('disabled', false)
              }, 2500);

            }

         },
     });

    }
     

  })

  $('.redirectRegister').on('click',function(){
    login.hide()
    forgot.hide()
    register.show()
  })
  $('.redirectLogin').on('click',function(){
    register.hide()
    forgot.hide()
    login.show()
  })
  $('.redirectForgot').on('click',function(){
    register.hide()
    forgot.show()
    login.hide()
  })
  $('#updateBtn').on('click',function(){
    window.open(update,'_blank')
  })
  $('#mesaj').keypress(function (e) {
  if(e.which == 13){
    if(e.shiftKey){
      
    }else{
      $('#gonder').click();
      return false;
    }
  }
  });   
  $('.settingsBtn').on('click',function(e){
    chat.hide()
    settings.show()
  })
  $('.goBack').on('click',function(e){
    chat.show()
    settings.hide()
  })
  $('.logOut').on('click',function(e){
    forms.show()
    login.show()
    settings.hide()
    localStorage.removeItem('token')
  })
  $('#gonder').on('click',function(e){

    
    $('#gonder').attr('disabled','true')
    const sendingMsg=mesaj.val();
    const current_date=new Date();
    $.ajax({
        url: API+"/add-message",
        type: "post",
        data: {
          'version':APP_VERSION,
          'message':sendingMsg,
          "token" : localStorage.getItem('token')? localStorage.getItem('token') : ''
        } ,
        success: function (response) {
          const hour=('0'+current_date.getHours()).slice(-2)+':'+('0'+current_date.getMinutes()).slice(-2);
          messages.html(messages.html()+`
          <div class="message sender">
              <div class="messageContent">`+sendingMsg+`</div>
                <div class="date">`+hour+`</div>
            </div>`);
          mesaj.val('');
          goBottom()
          $('#gonder').attr('disabled','false')
        }
    });

  })
  
})

