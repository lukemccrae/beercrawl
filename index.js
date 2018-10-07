var directionsDisplay = new google.maps.DirectionsRenderer;
var directionsService = new google.maps.DirectionsService;
var destinations = [];
var waypoint = [];
var howMany;
var home;

function startClick() {
  document.getElementById('places-string').innerHTML = "";
    destinations = [];
    waypoint = []
    loading();
    howMany = 4;
    findCurrent();
}

function loading() {
    document.getElementById('loader').style.display = 'block'
    document.getElementById("load-text").style.display = 'block';
    document.getElementById("go-button").style.display = 'none';
    document.getElementById("redo-button").style.display = 'none';

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
        radius: '1000',
        types: ['bar']
    };
    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, addLocation);
}

function openInMap() {
  var directionString = 'https://www.google.com/maps/dir/?api=1&origin=' + home.lat + '+' + home.lng + '&waypoints='
  for (var i = 0; i < destinations.length; i++) {
    var placeName = destinations[i].name.split(' ');
    for (var y = 0; y < placeName.length; y++) {
      directionString += placeName[y]
      if(y + 1 < placeName.length) {
        directionString += '+'
      }
      if(y + 1 == placeName.length && i + 1 != destinations.length) {
        directionString += '%7C'
      }
    }
  }
  directionString += '&destination=' + home.lat + '+' + home.lng
  window.location.href = directionString;
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
            waypoint.push({
                location: currentLatLng.lat + ',' + currentLatLng.lng
            })
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
  $.get('https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=Museum%20of%20Contemporary%20Art%20Australia&inputtype=textquery&fields=photos,formatted_address,name,rating,opening_hours,geometry&key=&key=AIzaSyB6mjYhp5ca_RPpOdHu_Ul7E-YY6BYzmms')
      .done(function(data) {
        console.log(data);
      })
      .fail(function(error) {
          console.log(error);
      })
  var list = document.createElement('ul');
  for (var i = 0; i < destinations.length; i++) {
    var item = document.createElement('li');
    item.appendChild(document.createTextNode(destinations[i].name));
    list.appendChild(item);
  }
  return list;
}

function doneLoading() {
  directionsService.route({
      origin: home,
      destination: home,
      travelMode: 'WALKING',
      waypoints: waypoint,
      optimizeWaypoints: true
  }, function(response, status) {
      if (status === 'OK') {
          var distanceInt = 0;
          for (var i = 0; i < response.routes[0].legs.length; i++) {
            var distanceStr = response.routes[0].legs[i].distance.text.split(' ');
            if(distanceStr[1] === 'mi') {
              distanceInt = distanceInt + parseFloat(distanceStr[0])
            }
          }
          document.getElementById('loader').style.display = 'none'
          document.getElementById('load-text').style.display = 'none'
          document.getElementById("go-button").style.display = 'block';
          document.getElementById("redo-button").style.display = 'block';
          document.getElementById('places-string').innerHTML = detailMessage(distanceInt)
      } else {
          window.alert('Directions request failed due to ' + status);
      }
  });
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
    }
    doneLoading()
}

// function initialize() {
//     directionsDisplay = new google.maps.DirectionsRenderer();
//     var chicago = new google.maps.LatLng(home.lat, home.lng);
//     var mapOptions = {
//         zoom: 15,
//         center: chicago
//     }
//     map = new google.maps.Map(document.getElementById('map'), mapOptions);
//     directionsDisplay.setMap(map);
//     directionsDisplay.setPanel(document.getElementById('directionsPanel'));
// }

var alreadyAdded = function(loc) {
    for (var i = 0; i < destinations.length; i++) {
        if (destinations[i].name === loc) {
            return false;
        }
    }
    return true;
}

function detailMessage(distanceInt) {
  var numberString;
  var placeString = ""
  for (var i = 0; i < destinations.length; i++) {
    if(i + 1 < destinations.length) {
      placeString += destinations[i].name
      placeString += ', '
    } else {
      placeString += ' and ' + destinations[i].name
    }
  }
  var result = "This crawl takes you to " + placeString + ". It is about " + distanceInt + " miles long. The directions will return you to this location"
  return result;
}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {

}
