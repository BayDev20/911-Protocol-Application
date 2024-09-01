function initMap() {
    // Default location: South Lake Tahoe
    const defaultLocation = { lat: 38.933241, lng: -119.984348 }; // Coordinates for South Lake Tahoe

    // Create a map object
    const map = new google.maps.Map(document.getElementById("map"), {
        center: defaultLocation,
        zoom: 12,
    });

    // Check if geolocation is supported and available
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                // Center the map at the user's location
                map.setCenter(userLocation);

                // Place a marker at the user's location
                new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    title: "You are here",
                });

                // Search for nearby hospitals around the user's location
                findNearbyHospitals(map, userLocation);
            },
            () => {
                // Handle location error by showing the default location and Barton Memorial Hospital
                handleLocationError(true, map, defaultLocation);
            }
        );
    } else {
        // Browser doesn't support Geolocation, use default location
        handleLocationError(false, map, defaultLocation);
    }
}

function handleLocationError(browserHasGeolocation, map, location) {
    map.setCenter(location);

    new google.maps.Marker({
        position: location,
        map: map,
        title: browserHasGeolocation
            ? "Default Location: South Lake Tahoe"
            : "Error: Your browser doesn't support geolocation.",
    });

    // Specifically search for Barton Memorial Hospital if using the default location
    findBartonHospital(map, location);
}

function findNearbyHospitals(map, location) {
    const request = {
        location: location,
        radius: '5000', // Search within 5 kilometers
        type: ['hospital'] // Search for hospitals
    };

    const service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (let i = 0; i < results.length; i++) {
                createHospitalMarker(map, results[i]);
            }
        } else {
            console.error('PlacesService was not successful for the following reason: ' + status);
        }
    });
}

// Service Worker registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registered: ', registration);
            })
            .catch(registrationError => {
                console.log('ServiceWorker registration failed: ', registrationError);
            });
    });
}

function calculateDosage() {
    const weight = parseFloat(document.getElementById('weight').value);
    const dosagePerKg = parseFloat(document.getElementById('medicationDosage').value);

    if (isNaN(weight) || isNaN(dosagePerKg)) {
        document.getElementById('dosageResult').innerText = 'Please enter valid numbers.';
        return;
    }

    const totalDosage = (weight * dosagePerKg).toFixed(2);

    document.getElementById('dosageResult').innerText = `The required dosage is ${totalDosage} mg`;
}