// Theme switcher
const themeSwitch = document.querySelector('.theme-switch');
const body = document.body;

themeSwitch.addEventListener('change', function() {
    if (this.checked) {
        body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
    }
});

// Check for saved theme preference or respect OS preference
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
const currentTheme = localStorage.getItem('theme');

if (currentTheme === 'dark' || (currentTheme === null && prefersDarkScheme.matches)) {
    themeSwitch.checked = true;
    body.classList.add('dark-theme');
} else {
    themeSwitch.checked = false;
    body.classList.remove('dark-theme');
}

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

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Lazy loading for protocol cards
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.protocol-card').forEach(card => {
    observer.observe(card);
});

const searchInput = document.getElementById('protocol-search');
const protocolItems = document.querySelectorAll('.protocol-card li');

searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    protocolItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(searchTerm) ? '' : 'none';
    });
});

const dosageForm = document.getElementById('dosage-form');
const resultDiv = document.getElementById('result');

const medications = {
    epinephrine: { dosage: 0.01, unit: 'mg/kg' },
    morphine: { dosage: 0.1, unit: 'mg/kg' },
    // Add more medications and their dosages
};

dosageForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const medication = document.getElementById('medication').value;
    const weight = document.getElementById('weight').value;
    
    if (medication && weight) {
        const { dosage, unit } = medications[medication];
        const calculatedDosage = (dosage * weight).toFixed(2);
        resultDiv.innerHTML = `
            <h3>${medication.charAt(0).toUpperCase() + medication.slice(1)}</h3>
            <p>Recommended dosage: ${calculatedDosage} ${unit}</p>
        `;
        resultDiv.style.display = 'block';
    }
});
