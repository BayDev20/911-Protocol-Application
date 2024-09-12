// Theme switcher
const themeSwitch = document.querySelector('.theme-switch');
const body = document.body;

if (themeSwitch) {
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
}

// Dosage calculator
const medications = {
    epinephrine: { dosage: 0.01, unit: 'mg/kg', max: 1, route: 'IM' },
    morphine: { dosage: 0.1, unit: 'mg/kg', max: 10, route: 'IV/IM' },
    albuterol: { dosage: 2.5, unit: 'mg', max: 5, route: 'Nebulized' },
    amiodarone: { dosage: 5, unit: 'mg/kg', max: 300, route: 'IV' },
    aspirin: { dosage: 324, unit: 'mg', max: 324, route: 'PO' },
    atropine: { dosage: 0.02, unit: 'mg/kg', max: 1, route: 'IV' },
    diphenhydramine: { dosage: 1, unit: 'mg/kg', max: 50, route: 'IV/IM' },
    fentanyl: { dosage: 1, unit: 'mcg/kg', max: 100, route: 'IV/IN' },
    glucagon: { dosage: 1, unit: 'mg', max: 1, route: 'IM' },
    ketamine: { dosage: 1, unit: 'mg/kg', max: 100, route: 'IV' },
    lidocaine: { dosage: 1, unit: 'mg/kg', max: 100, route: 'IV' },
    midazolam: { dosage: 0.1, unit: 'mg/kg', max: 5, route: 'IV/IN' },
    naloxone: { dosage: 0.1, unit: 'mg/kg', max: 2, route: 'IV/IN/IM' },
    nitroglycerin: { dosage: 0.4, unit: 'mg', max: 0.4, route: 'SL' },
    ondansetron: { dosage: 0.15, unit: 'mg/kg', max: 4, route: 'IV' },
};

const dosageForm = document.getElementById('dosage-form');
const resultDiv = document.getElementById('result');

if (dosageForm && resultDiv) {
    console.log('Dosage form and result div found');
    dosageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const medication = document.getElementById('medication').value;
        const weight = parseFloat(document.getElementById('weight').value);
        
        console.log('Form submitted');
        console.log('Medication:', medication);
        console.log('Weight:', weight);

        if (medication && !isNaN(weight) && weight > 0) {
            const med = medications[medication];
            console.log('Medication details:', med);

            let calculatedDosage;
            
            if (med.unit === 'mg/kg' || med.unit === 'mcg/kg') {
                calculatedDosage = (med.dosage * weight).toFixed(2);
                console.log('Weight-based calculation:', med.dosage, '*', weight, '=', calculatedDosage);
            } else {
                calculatedDosage = med.dosage.toFixed(2);
                console.log('Fixed dosage:', calculatedDosage);
            }
            
            // Apply max dosage if exceeded
            if (parseFloat(calculatedDosage) > med.max) {
                calculatedDosage = med.max.toFixed(2);
                console.log('Max dosage applied:', calculatedDosage);
            }

            console.log('Final calculated dosage:', calculatedDosage);

            const resultHTML = `
                <h3>${medication.charAt(0).toUpperCase() + medication.slice(1)}</h3>
                <p>Recommended dosage: ${calculatedDosage} ${med.unit}</p>
                <p>Max dose: ${med.max} ${med.unit}</p>
                <p>Route: ${med.route}</p>
            `;
            console.log('Result HTML:', resultHTML);

            try {
                resultDiv.innerHTML = resultHTML;
                console.log('Result div content after update:', resultDiv.innerHTML);
                resultDiv.style.display = 'block';
                resultDiv.style.visibility = 'visible';
                resultDiv.style.opacity = '1';
                resultDiv.style.backgroundColor = 'yellow';
                console.log('Result div styles:', resultDiv.style.cssText);
            } catch (error) {
                console.error('Error updating result div:', error);
            }
        } else {
            resultDiv.innerHTML = '<p>Please select a medication and enter a valid weight.</p>';
            resultDiv.style.display = 'block';
        }
    });

    // Update the medication select options
    const medicationSelect = document.getElementById('medication');
    if (medicationSelect) {
        medicationSelect.innerHTML = '<option value="">Select Medication</option>';
        for (const [key, value] of Object.entries(medications)) {
            medicationSelect.innerHTML += `<option value="${key}">${key.charAt(0).toUpperCase() + key.slice(1)}</option>`;
        }
    }
} else {
    console.log('Dosage form or result div not found');
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

// Function to initialize the map
function initMap() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            const map = new google.maps.Map(document.getElementById('map'), {
                center: userLocation,
                zoom: 13
            });

            const service = new google.maps.places.PlacesService(map);
            service.nearbySearch({
                location: userLocation,
                radius: 5000,
                type: ['hospital']
            }, function(results, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    for (let i = 0; i < results.length; i++) {
                        createMarker(results[i], map);
                    }
                }
            });
        }, function() {
            console.log('Error: The Geolocation service failed.');
        });
    } else {
        console.log('Error: Your browser doesn\'t support geolocation.');
    }
}

// Function to create markers for hospitals
function createMarker(place, map) {
    const marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location
    });

    google.maps.event.addListener(marker, 'click', function() {
        const infoWindow = new google.maps.InfoWindow();
        infoWindow.setContent(place.name);
        infoWindow.open(map, this);
    });
}

// Call initMap when the Google Maps API is loaded
window.initMap = initMap;

// Add this line at the end of your script for debugging
console.log('Script loaded. Form:', dosageForm, 'Result div:', resultDiv);

// Add this at the end of your script, outside of any function
document.body.insertAdjacentHTML('beforeend', '<div id="test-result" style="background-color: green; color: white; padding: 10px; margin-top: 20px;">This is a test result</div>');
