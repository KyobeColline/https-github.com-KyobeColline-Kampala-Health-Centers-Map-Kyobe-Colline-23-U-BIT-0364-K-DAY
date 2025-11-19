/**
 * Data loading and management for health centers
 */

let healthCentersData = null;
let healthCentersFeatures = [];

/**
 * Load GeoJSON data - no restrictions, works with file:// protocol
 * @returns {Promise<Object>} GeoJSON data
 */
async function loadHealthCentersData() {
    // Try to fetch first (works with http/https)
    try {
        const response = await fetch('data/health-centers.geojson');
        if (response.ok) {
            const data = await response.json();
            healthCentersData = data;
            healthCentersFeatures = data.features;
            return data;
        }
    } catch (error) {
        // If fetch fails (file:// protocol), use embedded data from script tag
        console.log('Fetch failed, using embedded data');
    }
    
    // Embedded data fallback (works with file:// protocol)
    // Data is loaded from external script tag in HTML
    if (window.HEALTH_CENTERS_DATA) {
        healthCentersData = window.HEALTH_CENTERS_DATA;
        healthCentersFeatures = window.HEALTH_CENTERS_DATA.features;
        return window.HEALTH_CENTERS_DATA;
    }
    
    // If data script hasn't loaded yet, wait a bit and try again
    return new Promise((resolve) => {
        const checkData = setInterval(() => {
            if (window.HEALTH_CENTERS_DATA) {
                clearInterval(checkData);
                healthCentersData = window.HEALTH_CENTERS_DATA;
                healthCentersFeatures = window.HEALTH_CENTERS_DATA.features;
                resolve(window.HEALTH_CENTERS_DATA);
            }
        }, 100);
        
        // Timeout after 2 seconds
        setTimeout(() => {
            clearInterval(checkData);
            if (!window.HEALTH_CENTERS_DATA) {
                console.error('Health centers data not found');
                healthCentersData = { type: 'FeatureCollection', features: [] };
                healthCentersFeatures = [];
                resolve(healthCentersData);
            }
        }, 2000);
    });
}

/**
 * Get all health centers
 * @returns {Array} Array of health center features
 */
function getAllHealthCenters() {
    return healthCentersFeatures;
}

/**
 * Get health center by ID
 * @param {string} id - Health center ID
 * @returns {Object|null} Health center feature or null
 */
function getHealthCenterById(id) {
    return healthCentersFeatures.find(feature => feature.properties.id === id) || null;
}

/**
 * Search health centers by query
 * @param {string} query - Search query
 * @param {string} typeFilter - Type filter (optional)
 * @returns {Array} Filtered health center features
 */
function searchHealthCenters(query, typeFilter = 'all') {
    if (!healthCentersFeatures) {
        return [];
    }

    let filtered = healthCentersFeatures;

    // Apply type filter
    if (typeFilter !== 'all') {
        if (typeFilter === 'Health Center') {
            filtered = filtered.filter(feature => 
                feature.properties.type === 'Health Center II/III/IV'
            );
        } else {
            filtered = filtered.filter(feature => 
                feature.properties.type === typeFilter
            );
        }
    }

    // Apply search query
    if (query && query.trim() !== '') {
        const searchTerm = query.toLowerCase().trim();
        filtered = filtered.filter(feature => {
            const name = feature.properties.name.toLowerCase();
            const description = (feature.properties.description || '').toLowerCase();
            const type = feature.properties.type.toLowerCase();
            
            return name.includes(searchTerm) || 
                   description.includes(searchTerm) || 
                   type.includes(searchTerm);
        });
    }

    return filtered;
}

/**
 * Get unique health center types
 * @returns {Array} Array of unique types
 */
function getHealthCenterTypes() {
    if (!healthCentersFeatures) {
        return [];
    }
    const types = [...new Set(healthCentersFeatures.map(f => f.properties.type))];
    return types.sort();
}

