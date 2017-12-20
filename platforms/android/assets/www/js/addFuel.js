/**
 * Created by sgrzybowski on 1/9/2015.
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
        console.log('Device is Ready on Add Fuel Page');
        //testing only
        //authToken = 'whatever';
        authToken = sessionStore["authToken"];
        console.log('AuthToken : ' + authToken) ;
        $(document).ajaxStart(function() {
            console.log( 'ajax started' );
            $('#ajaxSpinner').show();
        }).ajaxComplete(function() {
            console.log( 'ajax completed' );
            $('#ajaxSpinner').hide();
        });
        //loadAvatar();
    }
};

function showCamera() {
    alert('this is where the camera loads');
}

function capturePhoto(){
    navigator.camera.getPicture(uploadPhoto,null,{sourceType:1,quality:60});
}

function uploadPhoto(data){
// this is where you would send the image file to server

    cameraPic.src = "data:image/jpeg;base64," + data;
    // Successful upload to the server
    navigator.notification.alert(
        'Your Photo has been uploaded',  // message
        okay,                           // callback
        'Photo Uploaded',              // title
        'OK'                          // buttonName
    );

    // upload has failed Fail

    /*

     if (failedToUpload){

     navigator.notification.alert(
     'Your Photo has failed to upload',
     failedDismissed,
     'Photo Not Uploaded',
     'OK'
     );

     }
     */


}

function okay(){
    // Do something
}


//var pictureSource,
//    destinationType
//
//document.addEventListener("deviceready",loaded,false);
//
//function loaded() {
//    pictureSource=navigator.camera.PictureSourceType;
//    destinationType=navigator.camera.DestinationType;
//}
//
//function getPhoto(imageData) {
//    var smallImage = document.getElementById('smallImage');
//
//
//    smallImage.style.display = 'block';
//
//
//    smallImage.src = "data:image/jpeg;base64," + imageData;
//}
//
//function capturePhoto() {
//    navigator.camera.getPicture(getPhoto, onFail, { quality: 50 });
//}
//
//
//function onFail(message) {
//    alert('Failed because: ' + message);
//}