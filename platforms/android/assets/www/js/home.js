/**
 * Created by scott on 12/8/2014.
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
        console.log('Device is Ready on Home Page');
        //testing only
        //authToken = 'whatever';
        authToken = sessionStore["authToken"];
        console.log('AuthToken : ' + authToken) ;
        $('#userFullName').html('<i class="fa fa-user"></i> ' + sessionStore['userFullName']);
        $('#userEmail').html('<i class="fa fa-envelope"></i> ' + sessionStore['userName']);
        $(document).ajaxStart(function() {
            console.log( 'ajax started' );
            $('#ajaxSpinner').show();
        }).ajaxComplete(function() {
            console.log( 'ajax completed' );
            $('#ajaxSpinner').hide();
        });
        getCurrentVehicle();
        getMessagesCount();
        getAvatarImage();
        //loadAvatar();
    }
};

function getCurrentVehicle() {
    var request = $.ajax({
        url: baseURL + 'getCurrentVehicle',
        data: {authToken: authToken},
        //async: false,
        //contentType: 'application/json',
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
            console.log('getVehicle returned with success: ' + response.vehiclePlate + 'Id: ' + response.vehicleId);
            //store the vehicle Id to session
            sessionStore.vehicleId = response.vehicleId;
            $('#currentVehicle').html('<i class="fa fa-truck"></i>  ' + response.vehiclePlate + ' | ' + response.vehicleState);

        }else{
            $('#ajaxSpinner').hide();
            console.log('get vehicle failed with : ' + response.success);
            console.log('Message: ' + response.message);
            alert(response.message);
            window.location.href='index.html';
        }
    });
    request.fail(function(jqXHR, textStatus, msg) {
        alert('Request failed: ' + textStatus + ' Message: ' + msg);
    });
}

function getMessagesCount() {
    var request = $.ajax({
        url: baseURL + 'getMessagesCount',
        data: {authToken: authToken},
        //async: false,
        //contentType: 'application/json',
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
            console.log('getMessageesCount returned with success and the count is: ' + response.message);
            sessionStore['messagesCount'] = response.message;
            $('.noti').html(response.message).css({display: 'inline'});
        }else{
            $('#ajaxSpinner').hide();
            console.log('getMessageesCountfailed with : ' + response.success);
            console.log('Message: ' + response.message);
        }
    });
    request.fail(function(jqXHR, textStatus, msg) {
        alert('Request failed: ' + textStatus + ' Message: ' + msg);
    });
}

/***
 * Go To Past Trips page
 * disable button and turn on spinner
 */
function goToTrips() {
    disableBookedTripSubmit();
    window.location.href='trips.html';
}
/**
 * Disable the Trip button when clicked
 * GRIZ 12.10.14
 */
function disableBookedTripSubmit() {
    $('#bookedTripsBtn').prop('disabled',true);
    $('#bookedTripsBtnSpinner').css({display: 'inline'});
    $('#bookedTripsBtnText').css({display: 'inline'}).html(' Loading Trips...');
    //<i style="font-size:1.2em" class="fa fa-list-ol"></i>
}

/**
 * Enable the Trip button once form is saved
 * GRIZ 12.10.14
 * Don't think we need this since the Home page is reloaded each visit
 */

function enableBookedTripSubmit() {
    $('#bookedTripsBtn').prop('disabled',false);
    $('#bookedTripsBtnSpinner').css({display: 'none'});
    $('#bookedTripsBtnText').css({display: 'inline'}).html(' View your past trips');
}

function getAvatarImage() {
    //var authToken = 'a43dc660-3564-4d26-914e-303378d9ae8a';
    var request = $.ajax({
        url: baseURL + 'getAvatarImageString',
        data: {authToken: authToken},
        //async: false,
        //contentType: 'application/json',
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
            var contentType = response.contentType;
            //var imgSrc = 'data:image/jpg;base64,' + response.message;
            var imgSrc = 'data:' + contentType +';base64,' + response.message;
            //console.log(imgSrc);
            console.log('getAvatarImageString returned with success: ' + response.success);
            $('#avatar').attr('src', imgSrc);


        }else{
            $('#ajaxSpinner').hide();
            console.log('getAvatarImageString : ' + response.success);
            $('#avatar').attr('src', 'img/default_avatar.png');
        }
    });
    request.fail(function(jqXHR, textStatus, msg) {
        console.log('Request failed: '  +  textStatus + ' Message: ' + msg);
        $('#ajaxSpinner').hide();
        $('#avatar').attr('src', 'img/default_avatar.png');
    });

}