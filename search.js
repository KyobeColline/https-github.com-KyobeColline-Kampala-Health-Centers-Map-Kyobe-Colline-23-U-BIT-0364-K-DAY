/**
 * Search and filtering functionality
 */

let filteredMarkers = [];
let allMarkers = [];

/**
 * Initialize search functionality
 */
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    const typeFilter = document.getElementById('typeFilter');
    const mobileTypeFilter = document.getElementById('mobileTypeFilter');
    const clearSearchBtn = document.getElementById('clearSearch');
    
    // Debounced search function
    const performSearch = debounce((query, typeFilterValue) => {
        filterHealthCenters(query, typeFilterValue);
    }, 300);
    
    // Desktop search
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value;
            const typeFilterValue = typeFilter ? typeFilter.value : 'all';
            
            if (query.trim() !== '') {
                clearSearchBtn.classList.remove('hidden');
            } else {
                clearSearchBtn.classList.add('hidden');
            }
            
            performSearch(query, typeFilterValue);
        });
    }
    
    // Mobile search
    if (mobileSearchInput) {
        mobileSearchInput.addEventListener('input', (e) => {
            const query = e.target.value;
            const typeFilterValue = mobileTypeFilter ? mobileTypeFilter.value : 'all';
            performSearch(query, typeFilterValue);
        });
    }
    
    // Type filter
    if (typeFilter) {
        typeFilter.addEventListener('change', (e) => {
            const query = searchInput ? searchInput.value : '';
            performSearch(query, e.target.value);
        });
    }
    
    if (mobileTypeFilter) {
        mobileTypeFilter.addEventListener('change', (e) => {
            const query = mobileSearchInput ? mobileSearchInput.value : '';
            performSearch(query, e.target.value);
        });
    }
    
    // Clear search button
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                clearSearchBtn.classList.add('hidden');
            }
            if (mobileSearchInput) {
                mobileSearchInput.value = '';
            }
            filterHealthCenters('', typeFilter ? typeFilter.value : 'all');
        });
    }
    
    // Mobile menu controls
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileSidebar = document.getElementById('mobileSidebar');
    const closeMobileMenu = document.getElementById('closeMobileMenu');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileSidebar.classList.remove('hidden');
        });
    }
    
    if (closeMobileMenu) {
        closeMobileMenu.addEventListener('click', () => {
            mobileSidebar.classList.add('hidden');
        });
    }
    
    // Close mobile menu when clicking outside
    if (mobileSidebar) {
        mobileSidebar.addEventListener('click', (e) => {
            if (e.target === mobileSidebar) {
                mobileSidebar.classList.add('hidden');
            }
        });
    }
}

/**
 * Filter health centers based on search query and type
 * @param {string} query - Search query
 * @param {string} typeFilter - Type filter value
 */
function filterHealthCenters(query, typeFilter) {
    const filtered = searchHealthCenters(query, typeFilter);
    
    // Update markers on map
    if (window.markerClusterGroup) {
        // Remove all markers
        window.markerClusterGroup.clearLayers();
        
        // Add filtered markers
        filtered.forEach(feature => {
            const marker = createMarker(feature);
            window.markerClusterGroup.addLayer(marker);
        });
        
        // Fit bounds to filtered markers if there are results
        if (filtered.length > 0 && window.map) {
            const group = new L.featureGroup(
                filtered.map(f => {
                    return L.marker([f.geometry.coordinates[1], f.geometry.coordinates[0]]);
                })
            );
            window.map.fitBounds(group.getBounds().pad(0.1));
        }
    }
    
    // Update health centers list
    updateHealthCentersList(filtered);
}

/**
 * Update health centers list in sidebar
 * @param {Array} healthCenters - Filtered health centers
 */
function updateHealthCentersList(healthCenters) {
    const desktopList = document.getElementById('healthCentersList');
    const mobileList = document.getElementById('mobileHealthCentersList');
    
    const renderList = (container) => {
        if (!container) return;
        
        if (healthCenters.length === 0) {
            container.innerHTML = '<p class="text-sm p-4 text-center" style="color: #64748b;">No health centers found</p>';
            return;
        }
        
        container.innerHTML = healthCenters.map(feature => {
            const props = feature.properties;
            const status = isOpenNow(props.openingHours);
            const typeBadgeColor = getTypeBadgeColor(props.type);
            const typeBadgeStyle = getTypeBadgeStyle(props.type);
            const stars = generateStars(props.rating);
            
            return `
                <div class="health-center-item p-3.5 mb-2 rounded-xl transition-all cursor-pointer"
                     style="background: white; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);"
                     onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'; this.style.transform='translateY(-2px)';"
                     onmouseout="this.style.boxShadow='0 1px 3px rgba(0,0,0,0.05)'; this.style.transform='translateY(0)';"
                     data-id="${props.id}"
                     data-lat="${feature.geometry.coordinates[1]}"
                     data-lon="${feature.geometry.coordinates[0]}">
                    <div class="flex items-start justify-between mb-1.5">
                        <h4 class="font-semibold text-sm flex-1 pr-2" style="color: #0f172a;">${props.name}</h4>
                        <span class="px-2 py-0.5 text-xs font-semibold rounded-full ${typeBadgeColor} flex-shrink-0" style="${typeBadgeStyle} box-shadow: 0 1px 3px rgba(0,0,0,0.15);">
                            ${props.type}
                        </span>
                    </div>
                    <div class="flex items-center gap-2 mb-1.5">
                        <span class="text-xs" style="color: #fbbf24;">${stars}</span>
                        <span class="text-xs" style="color: #475569; font-weight: 500;">${props.rating.toFixed(1)}</span>
                        <span class="text-xs font-medium" style="color: ${status.isOpen ? '#059669' : '#dc2626'};">
                            ${status.isOpen ? '🟢 Open' : '🔴 Closed'}
                        </span>
                    </div>
                    <p class="text-xs line-clamp-2" style="color: #64748b;">${truncateText(props.description || '', 80)}</p>
                </div>
            `;
        }).join('');
        
        // Add click handlers
        container.querySelectorAll('.health-center-item').forEach(item => {
            item.addEventListener('click', () => {
                const lat = parseFloat(item.getAttribute('data-lat'));
                const lon = parseFloat(item.getAttribute('data-lon'));
                
                if (window.map) {
                    window.map.setView([lat, lon], 15);
                    
                    // Open popup for this marker
                    window.markerClusterGroup.eachLayer((layer) => {
                        if (layer instanceof L.Marker) {
                            const markerLat = layer.getLatLng().lat;
                            const markerLon = layer.getLatLng().lng;
                            
                            if (Math.abs(markerLat - lat) < 0.001 && Math.abs(markerLon - lon) < 0.001) {
                                layer.openPopup();
                            }
                        }
                    });
                }
                
                // Close mobile menu
                const mobileSidebar = document.getElementById('mobileSidebar');
                if (mobileSidebar) {
                    mobileSidebar.classList.add('hidden');
                }
            });
        });
    };
    
    renderList(desktopList);
    renderList(mobileList);
}

/**
 * Create a marker for a health center feature
 * @param {Object} feature - GeoJSON feature
 * @returns {L.Marker} Leaflet marker
 */
function createMarker(feature) {
    const [lon, lat] = feature.geometry.coordinates;
    const icon = getMarkerIcon(feature.properties.type);
    
    const marker = L.marker([lat, lon], { icon });
    
    const popupContent = createPopupContent(feature);
    marker.bindPopup(popupContent, {
        maxWidth: 360,
        minWidth: 240,
        className: 'health-center-popup-container',
        autoPanPaddingTopLeft: L.point(24, 24),
        autoPanPaddingBottomRight: L.point(24, 24),
        closeOnClick: false,
        autoPan: true,
        keepInView: true
    });
    
    // Initialize carousel when popup opens
    marker.on('popupopen', () => {
        setTimeout(() => {
            const popup = marker.getPopup();
            if (popup) {
                const popupElement = popup.getElement();
                if (popupElement) {
                    const carouselContainer = popupElement.querySelector('.relative');
                    if (carouselContainer) {
                        const carouselId = `carousel-${feature.properties.id}`;
                        carouselContainer.id = carouselId;
                        initializeCarousel(carouselId);
                    }
                }
            }
        }, 100);
    });
    
    return marker;
}

