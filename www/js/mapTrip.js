/**
 * Created by sgrzybowski on 12/12/2014.
 */

/**
 * The Google Maps API reference.
 *
 * @type {google.maps.Map}
 */
var map;

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

/**
 * List of active markers on the map.
 *
 * @type {Array.<google.maps.Marker>}
 */
var markerArray = [];

/**
 * The overview marker for the active endpoint.
 *
 * @type {google.maps.Marker}
 */
var overviewMarker;

/**
 * The overview window for the active endpoint.
 *
 * @type {google.maps.InfoWindow}
 */
var overviewWindow;

/**
 * The total trip distance (in miles).
 *
 * @type {number}
 */
var distance = 0;

/**
 * the total time a trip took in minutes
 * @type {number}
 */
var duration = 0;

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
        console.log('Device is Ready on Map Trip Page');
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

        initialize();

        fetchWaypoints();

        setMessagesCount();
    }
};


/**
 * Fetches the current waypoints for a trip from the server and plots the route.
 */
function fetchWaypoints() {
    var theTripId = sessionStore['theTripId'];   //$('#tripId').val();
    console.log('the trip Id: '+ theTripId);

    var request = $.ajax({
        url: baseURL + 'fetchWayPoints',
        data: {tripId: theTripId, authToken: authToken},
        type: 'GET'
    });

    request.done(function(result) {
        if(result != 'false') {
            try {
                var obj = JSON.parse(result);
                setDraggableRoutes(obj);
            } catch(e) {
                alert(e);
            }
        }
    });

    request.fail(function(jqXHR, textStatus, msg) {
        alert('Request failed: ' + textStatus + ' Message: ' + msg);
    });
}

/**
 * Initializes the Google Maps API map and services, registers callbacks for the interface actions.
 */
function initialize() {
    // Set up the map.
    // Center the Map on middle of North America (rugby ND - 48.372934, -99.995689) per Bill 05.05.14.
    // Our office area is 33.613250, -111.914271.
    var mapOptions = {
        zoom: 3,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: new google.maps.LatLng(48.372934, -99.995689),
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
            position: google.maps.ControlPosition.RIGHT_TOP
        },
        panControl: true,
        panControlOptions: {
            position: google.maps.ControlPosition.LEFT_TOP
        },
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.LARGE,
            position: google.maps.ControlPosition.LEFT_TOP
        },
        streetViewControl: true,
        streetViewControlOptions: {
            position: google.maps.ControlPosition.LEFT_TOP
        }
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

    // Set up auto complete objects for start and end fields.
   /* var defaultBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(60, -130),
        new google.maps.LatLng(24, -60)
    );*/
    /*var options = {
        bounds: defaultBounds,
        componentRestrictions: {country: 'us'}
    };*/

    //var origin = document.getElementById('origin');
    //var destination = document.getElementById('destination');

    //autocompleteOrigin = new google.maps.places.Autocomplete(origin, options);
    //autocompleteDestination = new google.maps.places.Autocomplete(destination, options);

    overviewWindow = new google.maps.InfoWindow();
    overviewMarker = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29)
    });

    // Setup event listeners.

    // Fired when a directions are first plotted on the map or a user drags the route.
    google.maps.event.addListener(directionsDisplay, 'directions_changed', handleDirectionsChange);

    // Fired when a user changes the trip origin.
   /* google.maps.event.addListener(autocompleteOrigin, 'place_changed', function() {
        handleEndpointChange(autocompleteOrigin);
    });

    // Fired when a user changes the trip destination.
    google.maps.event.addListener(autocompleteDestination, 'place_changed', function() {
        handleEndpointChange(autocompleteDestination);
    });*/
}

/**
 * Clears the map.
 */
function clearMap() {
    overviewWindow.close();
    overviewMarker.setVisible(false);
    clearMarkers();
}

/**
 * Clears the markers off the map.
 */
function clearMarkers() {
    // First, remove any existing markers from the map.
    for(var i = 0; i < markerArray.length; i++) {
        markerArray[i].setMap(null);
    }
    // Now, clear the array itself.
    markerArray = [];
}

/**
 * Clears the map and sets the base route onto the map by the start and end points.
 *
 * @param {Object=} route An optional route from the to use as waypoints.
 */
function setDraggableRoutes(route) {
    var options = {};
    if(route) {
        var wp = [];
        for(var i = 0; i < route.waypoints.length; i++) {
            var lat = route.waypoints[i].lat;
            var lng = route.waypoints[i].lng;
            wp[i] = {
                'location': new google.maps.LatLng(lat, lng),
                'stopover':false
            };
        }

        options = {
            'origin': new google.maps.LatLng(route.startLat, route.startLng),
            'destination': new google.maps.LatLng(route.endLat, route.endLng),
            'waypoints': wp,
            'travelMode': google.maps.DirectionsTravelMode.DRIVING
        };
    } else {
        var originLatLng = originGeometry.location;
        var destinationLatLng = destinationGeometry.location;

        options = {
            'origin': originLatLng,
            'destination': destinationLatLng,
            'travelMode': google.maps.DirectionsTravelMode.DRIVING
        };
    }

    clearMap();
    directionsService.route(options, function(response, status) {
        if(status == 'OK') {
            directionsDisplay.setDirections(response);
            //GRIZ may be able to set driving directions here in a div
            //directionsDisplay.setPanel(document.getElementById('drivingDirections'));
            var route = response.routes[0].legs[0];
            originGeometry = {location: route.start_location};
            destinationGeometry = {location: route.end_location};

            pinA = new google.maps.Marker({
                position: route.start_location,
                map: map,
                icon: new google.maps.MarkerImage(
                    'img/truck3.png',
                    new google.maps.Size(32, 37),
                    new google.maps.Point(0, 0),
                    new google.maps.Point(17, 37)
                )
            }),
                pinB = new google.maps.Marker({
                    position: route.end_location,
                    map: map,
                    icon: new google.maps.MarkerImage(
                        'img/stop.png',
                        new google.maps.Size(32, 37),
                        new google.maps.Point(0, 0),
                        new google.maps.Point(17, 37)
                    )
                });
            // We only have two markers so add them.
            markerArray[0] = pinA;
            markerArray[1] = pinB;
        }
    });
}

/**
 * Handles the callback for a initilization/change in the map route.
 */
function handleDirectionsChange() {
    computeTotalDistance(directionsDisplay.getDirections());
}

/**
 * Update the UI with the new route distance.
 *
 * @param {google.maps.DirectionsResult} result The route results to calculate distance by.
 */
function computeTotalDistance(result) {
    var totalKilometers = 0;
    var totalSeconds = 0;
    var myroute = result.routes[0];
    for(var i = 0; i < myroute.legs.length; i++) {
        totalKilometers += myroute.legs[i].distance.value;
        totalSeconds += myroute.legs[i].duration.value;
    }
    // Convert meters to miles.
    var total = totalKilometers / 1609.34;
    //now round it
    distance = Math.round(total);

    //convert total seconds to minutes
    var totalMins = totalSeconds / 60;
    duration = Math.round(totalMins);

    $('#tripMiles').html(' ' + distance.toString() + ' mi');
    $('#tripTime').html(' ' + duration.toString() + ' mins');

}



