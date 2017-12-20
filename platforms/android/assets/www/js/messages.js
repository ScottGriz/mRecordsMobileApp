/**
 * Created by sgrzybowski on 12/12/2014.
 */


var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        console.log('Device is Ready on Messages Page');
        //testing only
        //authToken = 'whatever';
        authToken = sessionStore['authToken'];
        console.log('AuthToken : ' + authToken) ;
        $(document).ajaxStart(function() {
            console.log( 'ajax started' );
            $('#ajaxSpinner').show();
        }).ajaxComplete(function() {
            console.log( 'ajax completed' );
            $('#ajaxSpinner').hide();
        });

        setMessagesCount();
        getMessages();
    }
};

function getMessages() {
    var request = $.ajax({
        url: baseURL +  'getMessages',
        data: {authToken: authToken},
        contentType: 'application/x-www-form-urlencoded',
        xhrFields: {
            withCredentials: false
        },
        type: 'GET',
        dataType: 'json'
    });
    request.done(function(response) {
        if(response.success == true){
            $('#ajaxSpinner').hide();
            console.log('getMessages returned with success: ' + response.success);
            $('#tripRadioGroup').html(response.message);

        }else{
            $('#ajaxSpinner').hide();
            console.log('getMessages returned with : ' + response.success);
            console.log('Message: ' + response.message);
            alert(response.message);
            window.location.href='index.html';
        }
    });
    request.fail(function(jqXHR, textStatus, msg) {
        alert('Request failed: ' + textStatus + ' Message: ' + msg);
    });
}