/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
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
        console.log('Device is Ready');
        console.log('CORS Status: ' + $.support.cors);
        $.support.cors = true;
        console.log('CORS Status: ' + $.support.cors);
        if(localStore["username"] != undefined) {
            $("#userName").val(localStore["username"]);
        }
        $(document).ajaxStart(function() {
            console.log( "ajax started" );
            $('#ajaxSpinner').show();
        }).ajaxStop(function() {
            console.log( "ajax stopped" );
            $('#ajaxSpinner').hide();
        });
    }
};

function searchByPlate() {
    var request = $.ajax({
        url:  'http://localhost:8080/mRecords/externalRegistrant/searchByPlate/',
        data: { jurisdiction: 'AZ', plate: 'AE36180', dataFormat: 'JSON'},
        beforeSend: function (xhr) {
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        },
        //data: form.serialize(),
        type: 'GET'
    });

    request.done(function (response) {
        //just update the div with template
        console.log('Search by Plate returned with success');
        console.log('Power Unit is: ' + response.powerUnitId);
        //$('#loginBtn').html(response);
    });

    request.fail(function (response) {
        /*var responseText = response.responseText || '[]';
         console.log(responseText);
         var json = responseText.evalJSON();*/
        console.log('WTF: ' + response.error);
        alert('User or Password not correct: ' );
        //displayError(msg.error);
    });
}

function bypassLoginForTesting(sender, e) {
    disableLoginSubmit();
    setTimeout('enableLoginSubmit()', 1000);
    window.location.href='home.html';
}

function checkCustomer(sender, e) {

        var request = $.ajax({
            url:  'https://hybridshop.legatus-solutions.com/HybridShop/webservice/checkCustomer',
            data: { macAddress: '281878B940FA', resultFormat: 'json'},
            //username: 'HSS3rv1ceUs3r',
            //password: 'L3g@tus2014!',
           /* xhrFields: {
                withCredentials: true
            },*/
            beforeSend: function (xhr) {
                //xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                xhr.setRequestHeader("Authorization", "Basic " + btoa("HSS3rv1ceUs3r:L3g@tus2014!"));
            },
            statusCode: {
                // Set up a global AJAX error handler to handle the 401
                // unauthorized responses. If a 401 status code comes back,
                // the user is no longer logged-into the system and can not
                // use it properly.
                401: function () {
                    alert('Got a 401 ');
                }
            },
            //data: form.serialize(),
            type: 'GET'
        });

    request.done(function (response) {
        //just update the div with template
        console.log('Search by MAC returned with success');
        $.each(response, function(index) {
            alert(response[index].customerID);
            console.log('Customer is: ' + response[index].customerID);
        });
        window.location.href='home.html';
        //$('#loginBtn').html(response);
    });

    request.fail(function (response) {
        /*var responseText = response.responseText || '[]';
         console.log(responseText);
         var json = responseText.evalJSON();*/
        console.log('WTF: ' + response);
        alert('Could not find customer' );
        //displayError(msg.error);
    });
}

function doLogin(sender, e) {
    //alert('In doLogin ');
    if ( ($('#userName').val() === '') || ( ($('#password').val() === '') ) ){
        alert('User and password must be filled in');
    }
    else {
        disableLoginSubmit();
        e.preventDefault();
        var form = $('#mainLogin');
        var u = $('#userName').val();
        var request = $.ajax({
            url:  baseLoginURL +  'authenticate',
            //data: {j_username: 'BasicUser', j_password: 'Env0yLSC!'},
            beforeSend: function (xhr) {
                xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            },
            data: form.serialize(),
            //async: false,
            //contentType: 'application/json',
            contentType: 'application/x-www-form-urlencoded',
            xhrFields: {
                withCredentials: false
            },
            statusCode: {
                // Set up a global AJAX error handler to handle the 401
                // unauthorized responses. If a 401 status code comes back,
                // the user is no longer logged-into the system and can not
                // use it properly.
                401: function () {
                    alert('There seems to be a problem with your network connection ');
                },
                /*200: function () {
                 alert('got a 200');
                 },*/
                302: function () {
                    alert('got a 302 instead of user name but we think you are logged in?');
                }
            },
            type: 'POST',
            dataType: 'json'
        });

        request.done( function(response){
            //either way enable the button
            enableLoginSubmit();
            if(response.success == true){
                console.log('Login returned with success: ' + response.success);
                console.log('userName: ' + response.username);
                console.log('authToken: ' + response.authToken);
                authToken = response.authToken;
                sessionStore['authToken'] = authToken;
                sessionStore['userFullName'] = response.fullName;
                sessionStore['userName'] = response.username;
                localStore['username'] = u;
                window.location.href='home.html';
            }else{
                console.log('Login returned with fail: ' + response.success);
                console.log('Message: ' + response.username);
                alert(response.username);
            }
        });

        request.fail(function(jqXHR, textStatus, msg) {
            console.log(msg);
            enableLoginSubmit();
            alert('Request failed: ' + textStatus + ' Message: ' + msg);
        });

    } //end if
 } //end function

/**
 * Disable the Login button when clicked
 * GRIZ 12.10.14
 */
function disableLoginSubmit() {
    $('#loginBtn').prop('disabled',true);
    $('#loginBtnSpinner').css({display: 'inline'});
    $('#loginBtnText').css({display: 'inline'}).html('LOGGING IN...');
}

/**
 * Enable the Login button once form is saved
 * GRIZ 12.10.14
 */

function enableLoginSubmit() {
    $('#loginBtn').prop('disabled',false);
    $('#loginBtnSpinner').css({display: 'none'});
    $('#loginBtnText').css({display: 'inline'}).html('LOGIN');
}


/***
 * display a bootstrap styled message
 * MUST HAVE a DIV with ID messageDisplay on the page
 * @param message from the ajax response
 */
function displayError(message) {
    var errMessage = $('<div class="alert alert-error" style="display: none;">');
    // a close button
    var close = $('<button type="button" class="close" data-dismiss="alert"></button>');
    errMessage.append(close); // adding the close button to the message
    errMessage.append('Oops, it seems we have an error: ' + message);  // adding the error response to the message
    // add the message element to the body, fadein, wait 3secs, fadeout
    errMessage.appendTo($('#messageDisplay')).fadeIn(300).delay(4000).fadeOut(2000);

}
