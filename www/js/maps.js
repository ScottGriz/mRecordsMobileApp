/**
 * Created by scott on 11/13/2014.
 */

/**
 * The Google Maps API reference.
 *
 * @type {google.maps.Map}
 */
var map;

/***
 * Google Maps GeoCoder object, used here for reverse geocoding to find an address
 */
var geocoder;

/***
 *
 * @type {google.maps.InfoWindow}
 */
var infowindow = new google.maps.InfoWindow();

/***
 * Marker for Google Maps
 */
var marker;

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
        //var options = { enableHighAccuracy: true };
        console.log('Device is Ready on Map Page');
        authToken = sessionStore['authToken'];
        var options = { timeout: 31000, enableHighAccuracy: true, maximumAge: 90000 };
        navigator.geolocation.getCurrentPosition(app.onSuccess, app.onError, options);
    },
    onSuccess: function (position) {
        //alert('in onSuccess ' );
        geocoder = new google.maps.Geocoder();
        console.log('geocoder loaded');
        var lng = position.coords.longitude;
        //alert('long: ' + lng);
        var lat = position.coords.latitude;
        //alert('lat: ' + lat );
        var pos = new google.maps.LatLng(lat,lng);
        console.log('have a valid lat long:' + pos);
        //var pos = new google.maps.LatLng(48.372934, -99.995689);

        setMessagesCount();

        var mapOptions = {
            center: pos,
            zoom: 6,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        map = new google.maps.Map(document.getElementById('mapCanvas'), mapOptions);

        geocoder.geocode({'latLng': pos}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[1]) {
                    map.setZoom(11);
                    marker = new google.maps.Marker({
                        position: pos,
                        map: map
                    });
                    //console.log(results);
                    infowindow.setContent(results[1].formatted_address);
                    infowindow.open(map, marker);
                }
            } else {
                alert("Geocoder failed due to: " + status);
            }
        });

       /* var infowindow = new google.maps.InfoWindow({
            map: map,
            position: pos,
            content: 'Your Current Position'
        });*/

    },
    // onError Callback receives a PositionError object
    //
    onError: function(error) {
        setMessagesCount();
        alert('code: '    + error.code    + '\n' +
        'message: ' + error.message + '\n');
    }
};
