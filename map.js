/**
 * Map initialization and management
 */

// Initialize map when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Hide loading overlay
        const loadingOverlay = document.getElementById('loadingOverlay');
        
        // Initialize map
        initializeMap();
        
        // Load health centers data
        await loadHealthCentersData();
        
        // Add markers to map
        addHealthCentersToMap();
        
        // Initialize search
        initializeSearch();
        
        // Initialize routing
        initializeRouting();
        
        // Hide loading overlay
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
        
    } catch (error) {
        console.error('Error initializing application:', error);
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            let errorMessage = error.message;
            let instructions = '';
            
            // Provide helpful instructions based on error type
            if (error.message.includes('file://') || error.message.includes('Failed to fetch')) {
                instructions = `
                    <div class="mt-4 p-4 bg-blue-50 rounded-lg text-left max-w-md mx-auto">
                        <h3 class="font-semibold text-blue-900 mb-2">How to Fix:</h3>
                        <ol class="list-decimal list-inside space-y-1 text-sm text-blue-800">
                            <li>Open a terminal/command prompt</li>
                            <li>Navigate to this folder</li>
                            <li>Run: <code class="bg-blue-100 px-1 rounded">python -m http.server 8000</code></li>
                            <li>Open: <code class="bg-blue-100 px-1 rounded">http://localhost:8000</code></li>
                        </ol>
                        <p class="mt-3 text-xs text-blue-700">Or use: <code class="bg-blue-100 px-1 rounded">npx http-server -p 8000</code></p>
                    </div>
                `;
            }
            
            loadingOverlay.innerHTML = `
                <div class="text-center max-w-2xl mx-auto px-4">
                    <div class="mb-4">
                        <svg class="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <p class="text-red-600 font-semibold text-lg mb-2">Error loading application</p>
                    <p class="text-sm text-gray-700 mb-4">${errorMessage}</p>
                    ${instructions}
                </div>
            `;
        }
    }
});

/**
 * Initialize Leaflet map
 */
function initializeMap() {
    // Uganda center coordinates
    const ugandaCenter = [1.3733, 32.2903];
    
    // Create map
    window.map = L.map('map', {
        center: ugandaCenter,
        zoom: 7,
        zoomControl: true,
        attributionControl: true
    });
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(window.map);
    
    // Initialize marker cluster group
    window.markerClusterGroup = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 50
    });
    
    window.map.addLayer(window.markerClusterGroup);
}

/**
 * Add health centers to map
 */
function addHealthCentersToMap() {
    if (!window.markerClusterGroup || !healthCentersFeatures) {
        return;
    }
    
    // Clear existing markers
    window.markerClusterGroup.clearLayers();
    
    // Create markers for all health centers
    const markers = healthCentersFeatures.map(feature => {
        return createMarker(feature);
    });
    
    // Add markers to cluster group
    markers.forEach(marker => {
        window.markerClusterGroup.addLayer(marker);
    });
    
    // Fit map to show all markers
    if (markers.length > 0) {
        window.map.fitBounds(window.markerClusterGroup.getBounds().pad(0.1));
    }
    
    // Update health centers list
    updateHealthCentersList(healthCentersFeatures);
}

