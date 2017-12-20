/**
 * Created by sgrzybowski on 12/12/2014.
 * COMMON.JS
 * include this file on every .html page
 */
/***
 * Base URL for all service calls.  Ensure the ending forward slash is included /
 */
//var baseURL = 'http://localhost:8080/mRecordsMobileServices/api/';
//var baseLoginURL = 'http://localhost:8080/mRecordsMobileServices/restLogin/';
var baseURL = 'https://bodybygriz.dontexist.com/mRecordsMobileServices/api/';
var baseLoginURL = 'https://bodybygriz.dontexist.com/mRecordsMobileServices/restLogin/';
//var baseURL = 'https://mobile.legatus-solutions.com/mRecordsMobileServices/api/';
//var baseLoginURL = 'https://mobile.legatus-solutions.com/mRecordsMobileServices/restLogin/';
/***
 * GRIZ 11.26.14
 * Global
 * authToken is needed for all REST calls once a login is successful.
 */
var authToken;
/***
 *
 * @type {Storage}
 * Local HTML5 window storage.  Persistent
 */
var localStore = window.localStorage;

/***
 *
 * @type {Storage}
 * Session Storage.  Volatile
 */
var sessionStore = window.sessionStorage;

/***
 * sets the message count if a value is stored in the session
 */
function setMessagesCount() {
    var messageCount = sessionStore['messagesCount'];
    if( messageCount  != undefined) {
        $('.noti').html(messageCount).css({display: 'inline'});
    }
}

//TODO You could make a common maps js (basic refactoring etc...)