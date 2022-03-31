'use strict';

function showGeolocationError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.");
            return;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            return;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            return;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            return;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function randInt(max) {
    return Math.floor(Math.random() * max);
}
