/**
 * Created by sgrzybowski on 12/12/2014.
 */
/**
 * Created by scott on 11/17/2014.
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

/**
 * The geometry for the current origin.
 *
 * @type {google.maps.LatLong}
 */
var originGeometry;

/**
 * The geometry for the current desitination.
 *
 * @type {google.maps.LatLong}
 */
var destinationGeometry;

/**
 * The Google Directions API service reference.
 *
 * @type {google.maps.DirectionsService}
 */
var directionsService;

/**
 * The Directions API overlay for the Google map.
 *
 * @type {google.maps.DirectionsRendere}
 */
var directionsDisplay;

/***
 * Start Odometer retrieved from the server
 */
var startOdometer;

/***
 * Start Odometer retrieved from the server
 */
var endOdometer;

/**
 * The total trip distance (in miles).
 *
 * @type {number}
 */
var distance = 0;


/**
 * The trip data for saving to the server.
 *
 * @type {Object}
 */
var data = {};


/**
 * The trip starting latitude.
 *
 * @type {?number}
 */
data.startLat = null;


/**
 * The trip starting point longitude.
 *
 * @type {?number}
 */
data.startLng = null;


/**
 * The trip ending point latitude.
 *
 * @type {?number}
 */
data.endLat = null;


/**
 * The trip ending point longitude.
 *
 * @type {?number}
 */
data.endLng = null;


/**
 * The server side id of the trip record.
 *
 * @type {?number}
 */
data.tripId = null;


/**
 * List of trip waypoints as objects containing lat (latitude) and lng (longitude).
 *
 * @type {Array.<Object>}
 */
data.wayPoints = [];


/**
 * Overview polyline of route. List of lat (latitude) and lng (longitude).
 *
 * @type {Array.<Object>}
 */
data.polyline = [];


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
        document.addEventListener('backbutton', onBackKeyDown, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        console.log('Device is Ready on Drive Page');
        //testing only
        //authToken = 'whatever';
        authToken = sessionStore["authToken"];
        //console.log('AuthToken : ' + authToken) ;
        //need to get the current location only if this is first time Check sessionStore for tripId?
        var options = { timeout: 31000, enableHighAccuracy: true, maximumAge: 90000 };
        navigator.geolocation.getCurrentPosition(app.onSuccess, app.onError, options);
        //set the ajax stuff
        $(document).ajaxStart(function() {
            console.log( 'ajax started' );
            $('#ajaxSpinner').show();
        }).ajaxComplete(function() {
            console.log( 'ajax completed' );
            $('#ajaxSpinner').hide();
        });

        setMessagesCount();

        //need to get the odometer reading for this driver/vehicle
        getStartOdometer();

        //Disable the buttons until all the necessary info is retrieved such as Odometer, places address, etc.
        //we may need to use Deferreds since all calls have to be successful in order to start a new trip?
        //Initialize the Map for route calcs
        mapInit();
        //disableButtons();

        //enableButtons();
    },
    onSuccess: function (position) {
        console.log('in onSuccess ' );
        geocoder = new google.maps.Geocoder();
        console.log('geocoder loaded');
        var lng = position.coords.longitude;
        //alert('long: ' + lng);
        var lat = position.coords.latitude;
        //alert('lat: ' + lat );
        var pos = new google.maps.LatLng(lat,lng);
        sessionStore.originGeometry = pos;
        console.log('have a valid lat long:' + pos);
        //var pos = new google.maps.LatLng(48.372934, -99.995689);

        geocoder.geocode({'latLng': pos}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[1]) {
                    //console.log(results);
                    $('#origin').val((results[1].formatted_address));
                    //enableButtons();
                }
            } else {
                alert("Geocoder failed due to: " + status);
            }
        });
    },
    // onError Callback receives a PositionError object
    //
    onError: function(error) {
        alert('code: '    + error.code    + '\n' +
        'message: ' + error.message + '\n');
    }
};

//TODO HANDLE THIS LATER
/**
 * ANDROID SPECIFIC Handle the back button
 */
function onBackKeyDown() {
    if (sessionStore.tripId) {
        if(confirm('You have a trip in progress, Do you want to stop your trip?')) {
            stopTrip();
        }
    } else {
        window.location.href='home.html';
    }
}

function disableButtons() {
    //This will disable buttons
    console.log('in DisableButtons');
    $('#startButton').prop('disabled',true);
    $('#stopButton').prop('disabled',true);
    $('#fuelButton').prop('disabled',true);
    $('#receiptButton').prop('disabled',true);
    //$(tripElements).fadeTo('slow',.6);
    //$(tripElements).append('<div id="disableFade" style="position: absolute;top:0;left:0;width: 100%;height:100%;z-index:2;opacity:0.4;filter: alpha(opacity = 50)"></div>');
}

function enableButtons() {
    console.log('in enableButtons');
    $('#startButton').prop('disabled',false);
    $('#stopButton').prop('disabled',false);
    //This will enable  the div and all it's children
    //var tripElements = $('.trip_actions');
    //var $allDisabled = $tripElements.find("*").prop("disabled", true);
    //enable them
    //$allDisabled.prop('disabled', false);
    //$(tripElements).children().removeAttr('disabled');
    //$('#disableFade').remove();
}

function enableStartStopButtons() {

}

function enableFuelReceiptButtons() {

}

//Start trip functionality
$('#startButton').click(function(){
    console.log('In click of start button');
    //On page load, remove active highlight
    $('button').not(this).removeClass('drive_button_start_active');
    $(this).toggleClass('drive_button_start_active');
    //start a trip, but only if a trip isn't in progress.
    //TODO:  Need to figure out how to check for a trip in progress?  SessionStore.TripId?
    startTrip();
});

//End trip functionality
$('#stopButton').click(function(){
    console.log('In click of stop button');
    //On page load, remove active highlight
    $('button').not(this).removeClass('drive_button_stop_active');
    if($('#startButton').hasClass('drive_button_start_active')){
        $('#startButton').removeClass('drive_button_start_active');
        $(this).toggleClass('drive_button_stop_active');
        stopTrip();
    }
    //End a trip  using the current GPS Coordinates for now and let Google calculate route like we do on Web.

});

function getStartOdometer() {
    var request = $.ajax({
        url: baseURL + 'getStartOdometer',
        data: {authToken: authToken, vehicleId: sessionStore.vehicleId},
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
            //store the startOdometer
            startOdometer = response.startOdometer;
            console.log('getStartOdometer returned with success: ' + startOdometer);
            //Test for a zero
            if (Number(startOdometer) != 0) {
                $('#digit0').html(response.digit0);
                $('#digit1').html(response.digit1);
                $('#digit2').html(response.digit2);
                $('#digit3').html(response.digit3);
                $('#digit4').html(response.digit4);
                $('#digit5').html(response.digit5);
                console.log('final digit ' + response.digitFinal );
                $('#digitFinal').html(response.digitFinal);
            }
            else {
                //set them all to Zero
                $('#digit0').html('0');
                $('#digit1').html('0');
                $('#digit2').html('0');
                $('#digit3').html('0');
                $('#digit4').html('0');
                $('#digit5').html('0');
                console.log('final digit ' + response.digitFinal );
                $('#digitFinal').html('0');
            }
        }else{
            $('#ajaxSpinner').hide();
            console.log('getStartOdometer failed with : ' + response.success);
            console.log('Message: ' + response.message);
            alert(response.message);
            window.location.href='index.html';
        }
    });

    request.fail(function(jqXHR, textStatus, msg) {
        alert('Request failed: ' + textStatus + ' Message: ' + msg);
    });
}

function startTrip() {
    var request = $.ajax({
        url: baseURL + 'startTrip',
        data: {authToken: authToken, vehicleId: sessionStore.vehicleId, startOdometer: startOdometer, origin: $('#origin').val() },
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
            //store the startOdometer
            sessionStore.tripId = response.tripId;
            //store the trip id in localstore in case the app closes
            localStore.tripId = response.tripId;
            console.log('startTrip returned with success: ' + response.tripId);
            //TODO need to do something with the buttons
            $('#startButton').prop('disabled',true);
        } else {
            $('#ajaxSpinner').hide();
            console.log('startTrip failed with : ' + response.success);
            console.log('Message: ' + response.message);
            alert(response.message);
        }
    });
    request.fail(function(jqXHR, textStatus, msg) {
        alert('Request failed: ' + textStatus + ' Message: ' + msg);
    });
}

/**
 * Initial stop function of a trip in progress. (start point of a true stop trip)
 */
function stopTrip() {
    console.log('STOP STEP ONE');
    //need to use google directionsRender to get a route?  then send it to stopTrip AJAX
    if(sessionStore["originGeometry"] != undefined) {
        originGeometry =  sessionStore.originGeometry;
        //need to get our current position
        var options = {timeout: 31000, enableHighAccuracy: true, maximumAge: 90000};
        var location = navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
    }
    else {
        alert('There is a problem saving this trip, your original location is not found');
    }
}

/**
 * Step 2 of saving a trip, aka tru stop trip
 * @param position
 */
function onSuccess (position) {
        console.log('STOP STEP TWO');
        console.log('in onSuccess ' );
        var destination;
        geocoder = new google.maps.Geocoder();
        console.log('geocoder loaded');
        var lng = position.coords.longitude;
        //alert('long: ' + lng);
        var lat = position.coords.latitude;
        //alert('lat: ' + lat );
        var pos = new google.maps.LatLng(lat,lng);
        console.log('have a valid lat long:' + pos);
        sessionStore.destinationGeometry = pos;
        //var pos = new google.maps.LatLng(48.372934, -99.995689);

        geocoder.geocode({'latLng': pos}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[1]) {
                    //console.log(results);
                    destination = (results[1].formatted_address);//Where are we? in plain english USE RESULTS index 1
                    sessionStore.destination = destination;
                    console.log('destination: ' + destination);
                    //I Think this is where we need to call the directions service to get a route and then try to save all this?
                    //testing only
                    //var endOdometer = 9000;
                    //I think we need to call SaveWayPoints then saveTripOnStop
                    saveWaypoints();
                    //saveTripOnStop(destination, endOdometer);
                }
            } else {
                alert("Geocoder failed due to: " + status);
            }
        });

        //TODO clear the sessionStore on successful stop

}

    // onError Callback receives a PositionError object
    //
function onError(error) {
    alert('code: '    + error.code + '\n' + 'message: ' + error.message + '\n' + 'You Must Move in order to Have a valid trip');
}

/**
 * Save the waypoint information for the route to the server. Step 3 of a true stop trip. ALSO, a trip's orign and destination
 * cannot be the same. If they do, the current trip and any associated objects will be deleted. Redirect to drive
 *
 * @param {Object} response A XHR response object containing the trip id.
 */
function saveWaypoints() {
    console.log('STOP STEP THREE');
    //we know we have the origin and destination geometries in the session or we couldn't have made it here
    var originLatLng = sessionStore.originGeometry;
    var destinationLatLng = sessionStore.destinationGeometry;

    if(originLatLng == destinationLatLng){
        alert('You cannot have a trip ending in the same position. Please try again.');
        var request = $.ajax({
            url: baseURL +'deleteTrip',
            data: {authToken: authToken, tripId: sessionStore.tripId},
            contentType: 'application/x-www-form-urlencoded',
            xhrFields: {
                withCredentials: false
            },
            type: 'GET',
            dataType: 'json'
        });
        request.done(function(response) {
            if(response.success==true) {
                alert('Current trip deleted')
                window.location.href='drive.html'
            } else {
                alert('Current trip failed to delete')
                window.location.href='drive.html'
            }
        });
        request.fail(function(jqXHR, textStatus, msg) {
            alert('Request failed: ' + textStatus + ' Message: ' + msg);
        });
    } else {
        var options = {
            'origin': originLatLng,
            'destination': destinationLatLng,
            'travelMode': google.maps.DirectionsTravelMode.DRIVING
        };

        //This is a google thing to give you your actual route on the map
        directionsService.route(options, function (response, status) {
            if (status == 'OK') {
                directionsDisplay.setDirections(response);
                saveWayPointsAjax();
            }
            else {
                alert('Oops, we seem to have an error with saving your route of travel');
            }
        });
    }

}
/**
 * saveWayPointsAjax Actually makes the AJAX call to the REST service to. STEP 4 of a save trip
 * takes the directions that are drawn to the map and actually saves it to our objects.
 */

function saveWayPointsAjax( ) {
    console.log('STOP STEP FOUR');
    var rleg = directionsDisplay.directions.routes[0].legs[0];
    data.startLat = rleg.start_location.lat();
    data.startLng = rleg.start_location.lng();
    data.endLat = rleg.end_location.lat();
    data.endLng = rleg.end_location.lng();

    var wp = rleg.via_waypoints;
    data.wayPoints = [];
    for(var i = 0; i < wp.length; i++) {
        data.wayPoints.push({
            'lat': wp[i].lat(),
            'lng': wp[i].lng()
        });
    }
    //GRIZ note removed .points from overview_polyline on 6.24.14 it stopped working??
    var polyline = google.maps.geometry.encoding.decodePath(
        directionsDisplay.directions.routes[0].overview_polyline
    );

    data.polyline = [];
    for(var i = 0; i < polyline.length; i++) {
        data.polyline.push({
            'lat': polyline[i].lat(),
            'lng': polyline[i].lng()
        });
    }

    data.tripId = sessionStore.tripId;

    var jsonData = JSON.stringify(data, null, 4);

    var request = $.ajax({
        url: baseURL +'saveWayPoints',
        data: {authToken: authToken, jsonData: jsonData},
        contentType: 'application/x-www-form-urlencoded',
        xhrFields: {
            withCredentials: false
        },
        type: 'GET',
        dataType: 'json'
    });

    request.done(function(msg) {
        console.log('save waypoints AJAX returned ' );
        //now call the saveTripOnStop
        // calculate mileage
        saveTripOnStop(endOdometer);

    });

    request.fail(function(jqXHR, textStatus, msg) {
        alert('Request failed: ' + textStatus + ' Message: ' + msg);
    });
}
/***
 * Finalize the saving of a trip with the endOdometer. Step 5 and final of a save trip
 * @param endOdometer, tipId, destination  (Session Store)
 */
function saveTripOnStop() {
    console.log('STOP STEP FIVE AND FINAL');
    var request = $.ajax({
        url: baseURL + 'stopTrip',
        data: {authToken: authToken, tripId: sessionStore.tripId, endOdometer: endOdometer, destination: sessionStore.destination },
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
            console.log('saveTripOnStop returned with success: ' + response.tripId);
            //TODO need to do something with the buttons?
            $('#stopButton').prop('disabled',true);
            //redirect them to home?
            window.location.href='home.html';
            sessionStore.removeItem('tripId');
        } else {
            //If we fail here, it means its a groovy thing problem
            $('#ajaxSpinner').hide();
            console.log('saveTripOnStop failed with : ' + response.success);
            console.log('Message: ' + response.message);
            alert(response.message);
        }
    });
    request.fail(function(jqXHR, textStatus, msg) {
        alert('Request failed: ' + textStatus + ' Message: ' + msg);
    });
}

/**
* Initializes the Google Maps API map and services, registers callbacks for the interface actions.
*/
function mapInit() {
    // Set up the map.
    // Center the Map on middle of North America (rugby ND - 48.372934, -99.995689) per Bill 05.05.14.
    // Our office area is 33.613250, -111.914271.
    var mapOptions = {
        zoom: 3,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: new google.maps.LatLng(48.372934, -99.995689),
        mapTypeControl: false
    };
    map = new google.maps.Map(document.getElementById('mapCanvas'), mapOptions);


    // Set up the directions renderer and service; tie it to the map.
    var rendererOptions = {
        suppressMarkers: true,
        draggable: false
    };
    directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
    directionsDisplay.setMap(map);
    directionsService = new google.maps.DirectionsService();

    // Fired when a directions are first plotted on the map or a user drags the route.
    google.maps.event.addListener(directionsDisplay, 'directions_changed', handleDirectionsChange);
}

/**
 * Handles the callback for a initialization/change in the map route.
 */
function handleDirectionsChange() {
    computeTotalDistance(directionsDisplay.getDirections());
}

/**
 * Update the UI with the new route distance.
 *
 * @param {google.maps.DirectionsResult} result The route results to calculate distance by.
 * startOdoomter is a global variable
 */
function computeTotalDistance(result) {
    var totalKilometers = 0;
    var myroute = result.routes[0];
    for(var i = 0; i < myroute.legs.length; i++) {
        totalKilometers += myroute.legs[i].distance.value;
    }
    // Convert meters to miles.
    var total = totalKilometers / 1609.34;
    distance = Math.round(total);
    endOdometer = (distance + Number(startOdometer));
}




