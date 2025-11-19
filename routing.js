/**
 * Routing functionality using OSRM API
 */

let currentRoute = null;
let routeLayer = null;
let userLocationMarker = null;
let userLocation = null;

/**
 * Initialize routing functionality
 */
function initializeRouting() {
    // Request user location on page load
    requestUserLocation();
    
    // Handle "Get Directions" button clicks
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('get-directions-btn') || e.target.closest('.get-directions-btn')) {
            const button = e.target.classList.contains('get-directions-btn') ? e.target : e.target.closest('.get-directions-btn');
            const lat = parseFloat(button.getAttribute('data-lat'));
            const lon = parseFloat(button.getAttribute('data-lon'));
            const name = button.getAttribute('data-name');
            
            // Close any open popups
            if (window.map) {
                window.map.closePopup();
            }
            
            if (userLocation) {
                calculateRoute(userLocation, [lon, lat], name);
            } else {
                requestUserLocation().then(() => {
                    if (userLocation) {
                        calculateRoute(userLocation, [lon, lat], name);
                    } else {
                        alert('Please enable location services to get directions.');
                    }
                });
            }
        }
    });
    
    // Close route info panel
    const closeRouteInfoBtn = document.getElementById('closeRouteInfo');
    if (closeRouteInfoBtn) {
        closeRouteInfoBtn.addEventListener('click', clearRoute);
    }
    
    // Clear route button
    const clearRouteBtn = document.getElementById('clearRouteBtn');
    if (clearRouteBtn) {
        clearRouteBtn.addEventListener('click', clearRoute);
    }
    
    // Close directions panel
    const closeDirectionsBtn = document.getElementById('closeDirections');
    if (closeDirectionsBtn) {
        closeDirectionsBtn.addEventListener('click', () => {
            document.getElementById('directionsPanel').classList.add('hidden');
        });
    }
    
    // Locate me button
    const locateBtn = document.getElementById('locateBtn');
    if (locateBtn) {
        locateBtn.addEventListener('click', () => {
            requestUserLocation().then(() => {
                if (userLocation && window.map) {
                    window.map.setView([userLocation[1], userLocation[0]], 13);
                    updateUserLocationMarker();
                }
            });
        });
    }
}

/**
 * Request user's geolocation
 * @returns {Promise<Array|null>} User location [lon, lat] or null
 */
function requestUserLocation() {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            console.warn('Geolocation is not supported by this browser.');
            resolve(null);
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = [position.coords.longitude, position.coords.latitude];
                updateUserLocationMarker();
                resolve(userLocation);
            },
            (error) => {
                console.warn('Error getting user location:', error);
                resolve(null);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
}

/**
 * Update user location marker on map
 */
function updateUserLocationMarker() {
    if (!window.map || !userLocation) return;
    
    // Remove existing marker
    if (userLocationMarker) {
        window.map.removeLayer(userLocationMarker);
    }
    
    // Create pulsing teal dot with professional styling
    const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
            <div style="
                width: 22px;
                height: 22px;
                border-radius: 50%;
                background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
                border: 3px solid white;
                box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.3), 0 2px 8px rgba(0,0,0,0.2);
                animation: pulse 2s infinite;
            "></div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
    });
    
    userLocationMarker = L.marker([userLocation[1], userLocation[0]], { icon: userIcon })
        .addTo(window.map)
        .bindPopup('Your Location');
}

/**
 * Calculate route from origin to destination
 * @param {Array} origin - [lon, lat]
 * @param {Array} destination - [lon, lat]
 * @param {string} destinationName - Name of destination
 */
async function calculateRoute(origin, destination, destinationName) {
    if (!window.map) return;
    
    try {
        // Show loading state
        const routeInfoPanel = document.getElementById('routeInfoPanel');
        const routeDetails = document.getElementById('routeDetails');
        routeDetails.innerHTML = '<p class="text-sm font-medium" style="color: #475569;">Calculating route...</p>';
        routeInfoPanel.classList.remove('hidden');
        
        // Build OSRM API URL
        const url = `https://router.project-osrm.org/route/v1/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?overview=full&steps=true&geometries=geojson`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
            throw new Error('No route found');
        }
        
        const route = data.routes[0];
        currentRoute = route;
        
        // Display route on map
        displayRoute(route.geometry);
        
        // Display route information
        displayRouteInfo(route, destinationName);
        
        // Display turn-by-turn directions
        displayDirections(route.legs[0].steps);
        
    } catch (error) {
        console.error('Error calculating route:', error);
        const routeDetails = document.getElementById('routeDetails');
        routeDetails.innerHTML = `
            <p class="text-sm font-medium" style="color: #dc2626;">Error calculating route. Please try again.</p>
        `;
    }
}

/**
 * Display route on map
 * @param {Object} geometry - GeoJSON geometry
 */
function displayRoute(geometry) {
    if (!window.map) return;
    
    // Remove existing route
    if (routeLayer) {
        window.map.removeLayer(routeLayer);
    }
    
    // Create route polyline with professional styling
    routeLayer = L.geoJSON(geometry, {
        style: {
            color: '#0d9488',
            weight: 6,
            opacity: 0.85,
            lineCap: 'round',
            lineJoin: 'round'
        }
    }).addTo(window.map);
    
    // Fit map to route bounds
    window.map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });
}

/**
 * Display route information
 * @param {Object} route - Route object from OSRM
 * @param {string} destinationName - Name of destination
 */
function displayRouteInfo(route, destinationName) {
    const routeInfoPanel = document.getElementById('routeInfoPanel');
    const routeDetails = document.getElementById('routeDetails');
    
    const distance = formatDistance(route.distance);
    const duration = formatDuration(route.duration);
    
    routeDetails.innerHTML = `
        <div class="space-y-3 text-sm">
            <div class="flex items-center gap-3 p-2 rounded-lg" style="background: #f8fafc;">
                <span class="text-xl">📍</span>
                <div>
                    <p class="font-semibold" style="color: #0f172a;">Distance</p>
                    <p style="color: #475569; font-weight: 500;">${distance}</p>
                </div>
            </div>
            <div class="flex items-center gap-3 p-2 rounded-lg" style="background: #f8fafc;">
                <span class="text-xl">⏱️</span>
                <div>
                    <p class="font-semibold" style="color: #0f172a;">Estimated Time</p>
                    <p style="color: #475569; font-weight: 500;">${duration}</p>
                </div>
            </div>
            <div class="flex items-center gap-3 p-2 rounded-lg" style="background: #f8fafc;">
                <span class="text-xl">🚗</span>
                <div>
                    <p class="font-semibold" style="color: #0f172a;">Travel Mode</p>
                    <p style="color: #475569; font-weight: 500;">Driving</p>
                </div>
            </div>
            <div class="pt-2 border-t" style="border-color: #e2e8f0;">
                <p class="text-xs" style="color: #64748b;">To: ${destinationName}</p>
            </div>
        </div>
    `;
    
    routeInfoPanel.classList.remove('hidden');
}

/**
 * Display turn-by-turn directions
 * @param {Array} steps - Array of route steps
 */
function displayDirections(steps) {
    const directionsPanel = document.getElementById('directionsPanel');
    const directionsList = document.getElementById('directionsList');
    
    if (!steps || steps.length === 0) {
        directionsList.innerHTML = '<p class="text-sm" style="color: #64748b;">No directions available</p>';
        directionsPanel.classList.remove('hidden');
        return;
    }
    
    let html = '<div class="space-y-2">';
    
    steps.forEach((step, index) => {
        const instruction = step.maneuver.instruction || 'Continue';
        const distance = formatDistance(step.distance);
        const icon = getDirectionIcon(step.maneuver.type, step.maneuver.modifier);
        
        html += `
            <div class="flex items-start gap-3 p-3 rounded-lg transition-all" 
                 style="background: #f8fafc; border: 1px solid #e2e8f0;"
                 onmouseover="this.style.background='#f1f5f9'; this.style.borderColor='#cbd5e1';"
                 onmouseout="this.style.background='#f8fafc'; this.style.borderColor='#e2e8f0';">
                <div class="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm text-white" 
                     style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    ${index + 1}
                </div>
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-lg">${icon}</span>
                        <p class="text-sm font-medium" style="color: #0f172a;">${instruction}</p>
                    </div>
                    <p class="text-xs" style="color: #64748b; font-weight: 500;">${distance}</p>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    directionsList.innerHTML = html;
    directionsPanel.classList.remove('hidden');
}

/**
 * Get direction icon based on maneuver type and modifier
 * @param {string} type - Maneuver type
 * @param {string} modifier - Maneuver modifier
 * @returns {string} Emoji icon
 */
function getDirectionIcon(type, modifier) {
    const icons = {
        'turn': {
            'left': '↪️',
            'right': '↩️',
            'sharp left': '⬅️',
            'sharp right': '➡️',
            'slight left': '↖️',
            'slight right': '↗️',
            'straight': '⬆️',
            'uturn': '↩️'
        },
        'new name': '➡️',
        'depart': '🚶',
        'arrive': '📍',
        'merge': '🔀',
        'on ramp': '🔼',
        'off ramp': '🔽',
        'fork': '🔀',
        'end of road': '🛑',
        'continue': '➡️',
        'roundabout': '🔄',
        'rotary': '🔄',
        'roundabout turn': '🔄',
        'notification': 'ℹ️',
        'exit roundabout': '🔄',
        'exit rotary': '🔄'
    };
    
    if (type === 'turn' && modifier) {
        return icons.turn[modifier] || '➡️';
    }
    
    return icons[type] || '➡️';
}

/**
 * Clear current route
 */
function clearRoute() {
    if (routeLayer && window.map) {
        window.map.removeLayer(routeLayer);
        routeLayer = null;
    }
    
    currentRoute = null;
    
    document.getElementById('routeInfoPanel').classList.add('hidden');
    document.getElementById('directionsPanel').classList.add('hidden');
}

