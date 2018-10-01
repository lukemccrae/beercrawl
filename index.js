var directionsDisplay = new google.maps.DirectionsRenderer;
var directionsService = new google.maps.DirectionsService;
var destinations = [];
var waypoint = [];
var howMany;
var home;

function startClick() {
    destinations = []
    waypoint = []
    loading();
    howMany = 4;
    findCurrent();
}

function loading() {
    document.getElementById("directionsPanel").innerHTML = "";
    document.getElementById('loader').style.display = 'block'
    document.getElementById("load-text").style.display = 'block';
    document.getElementById("directionsPanel").style.display = 'none';
    document.getElementById("map").style.display = 'none';
}

function findCurrent() {
    navigator.geolocation.getCurrentPosition(function(position) {
        $.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + position.coords.latitude + ',' + position.coords.longitude + '&key=AIzaSyB6mjYhp5ca_RPpOdHu_Ul7E-YY6BYzmms')
            .done(function(data) {
            })
            .fail(function(error) {
                console.log(error);
            })
        home = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        }
        findLocations(home)
    })
}

function findLocations(location) {
    var position = new google.maps.LatLng(location.lat, location.lng);
    map = new google.maps.Map(document.getElementById('map'), {
        center: position,
        zoom: 14
    });
    var request = {
        location: position,
        radius: '4000',
        types: ['bar']
    };
    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, addLocation);
}

function addLocation(results, status) {
    if (results) {
        var randomNumber = Math.floor(Math.random() * results.length)
        var currentLoc = results[randomNumber]
        var currentLatLng = {
            lat: results[randomNumber].geometry.location.lat(),
            lng: results[randomNumber].geometry.location.lng()
        }
        if (alreadyAdded(currentLoc.name)) {
            destinations.push(currentLoc)
            //string method of pushing to waypoint
            waypoint.push({
                location: currentLatLng.lat + ',' + currentLatLng.lng
            })
            console.log(currentLoc.name);
            howMany += -1
            searchAgain(currentLatLng)
        } else {
            searchAgain(currentLatLng)
        }
    }
    if (!results || !howMany) {
        finishedSearching(currentLatLng)
    }
}

function searchAgain(currentLatLng) {
    if (howMany) {
        findLocations(currentLatLng)
    }
}

function makeList(destinations) {
  var list = document.createElement('ul');
  for (var i = 0; i < destinations.length; i++) {
    var item = document.createElement('li');
    item.appendChild(document.createTextNode(destinations[i].name));
    list.appendChild(item);
  }
  return list;
}

function doneLoading() {
  console.log(destinations);
    document.getElementById('loader').style.display = 'none'
    document.getElementById('load-text').style.display = 'none'
    document.getElementById('directionsPanel').style.display = 'block'
    document.getElementById('map').style.display = 'block'
    document.getElementById('places-list').appendChild(makeList(destinations))
}



function finishedSearching(end) {
    var path = `https://www.google.com/maps/dir/?api=1?mode=bicycling&origin=${home.lat},${home.lng}&destination=${home.lat},${home.lng}&waypoints=`
    waypointString();

    function waypointString() {
        var result = ''
        for (var i = 0; i < waypoint.length; i++) {
            var point = waypoint[i].location + '&7C'
            path += point
        }
        console.log(path);
    }
    doneLoading()
    initialize()
}

function initialize() {
    directionsDisplay = new google.maps.DirectionsRenderer();
    var chicago = new google.maps.LatLng(home.lat, home.lng);
    var mapOptions = {
        zoom: 15,
        center: chicago
    }
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directionsPanel'));
    calculateAndDisplayRoute(directionsService, directionsDisplay)
}

var alreadyAdded = function(loc) {
    for (var i = 0; i < destinations.length; i++) {
        if (destinations[i].name === loc) {
            return false;
        }
    }
    return true;
}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
    directionsService.route({
        origin: home,
        destination: home,
        travelMode: 'WALKING',
        waypoints: waypoint,
        optimizeWaypoints: true
    }, function(response, status) {
        console.log(response);
        console.log(waypoint);
        if (status === 'OK') {
            directionsDisplay.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}


function calcRoute() {
    var request = {
        origin: start,
        destination: start,
        travelMode: 'BICYCLING',
        waypoints: waypoints
    };
    directionsService.route(request, function(result, status) {
        if (status == 'OK') {
            directionsDisplay.setDirections(result);
        }
    });
}
