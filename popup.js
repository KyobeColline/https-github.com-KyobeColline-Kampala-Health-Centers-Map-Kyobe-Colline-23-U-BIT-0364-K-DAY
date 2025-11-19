/**
 * Popup creation and management for health center markers
 */

/**
 * Create popup content for a health center
 * @param {Object} feature - GeoJSON feature
 * @returns {string} HTML string for popup
 */
function createPopupContent(feature) {
    const props = feature.properties;
    const status = isOpenNow(props.openingHours);
    const typeBadgeColor = getTypeBadgeColor(props.type);
    const typeBadgeStyle = getTypeBadgeStyle(props.type);
    
    // Generate stars
    const stars = generateStars(props.rating);
    
    // Format opening hours
    const openingHoursHtml = formatOpeningHours(props.openingHours, status);
    
    // Generate photo carousel
    const photosHtml = generatePhotoCarousel(props.photos || [], props.id);
    
    // Generate reviews section
    const reviewsHtml = generateReviewsSection(props.reviews || []);
    
    return `
        <div class="health-center-popup" style="max-width: 350px; width: 100%; font-family: system-ui, -apple-system, sans-serif; box-sizing: border-box;">
            <!-- Header -->
            <div class="mb-3">
                <div class="flex items-start justify-between mb-2" style="gap: 8px;">
                    <h3 class="text-lg font-bold" style="margin: 0; line-height: 1.3; color: #0f172a; flex: 1; min-width: 0; word-wrap: break-word; overflow-wrap: break-word;">${props.name}</h3>
                    <span class="px-2.5 py-1 text-xs font-semibold rounded-full ${typeBadgeColor}" style="${typeBadgeStyle} white-space: nowrap; flex-shrink: 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        ${props.type}
                    </span>
                </div>
                
                <!-- Rating -->
                <div class="flex items-center gap-2 mb-2" style="flex-wrap: wrap;">
                    <span class="text-lg" style="color: #fbbf24; flex-shrink: 0;">${stars}</span>
                    <span class="text-sm font-semibold" style="color: #334155; flex-shrink: 0;">${props.rating.toFixed(1)}</span>
                    <span class="text-sm" style="color: #64748b; flex-shrink: 0;">(${props.reviewCount} reviews)</span>
                </div>
                
                <!-- Status Badge -->
                <div class="mb-2">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold" style="${
                        status.isOpen 
                            ? 'background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white;' 
                            : 'background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white;'
                    } box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        ${status.isOpen ? '🟢 Open Now' : '🔴 Closed'}
                        ${status.message ? ` - ${status.message}` : ''}
                    </span>
                </div>
            </div>
            
            <!-- Photo Carousel -->
            ${photosHtml}
            
            <!-- Description -->
            <div class="mb-3">
                <p class="text-sm leading-relaxed" style="color: #475569; word-wrap: break-word; overflow-wrap: break-word;">${props.description || 'No description available.'}</p>
            </div>
            
            <!-- Opening Hours -->
            ${openingHoursHtml}
            
            <!-- Contact Buttons -->
            <div class="flex gap-2 mb-3">
                <a href="tel:${props.phone}" 
                   class="contact-btn contact-btn--phone"
                   aria-label="Call ${props.name}">
                    <span class="contact-btn__icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M2.25 5.25a3 3 0 013-3H7.5c.621 0 1.148.45 1.215 1.067l.42 3.868a1.5 1.5 0 01-.72 1.45l-1.6.95a11.5 11.5 0 005.75 5.75l.95-1.6a1.5 1.5 0 011.45-.72l3.868.42a1.25 1.25 0 011.067 1.215V18.75a3 3 0 01-3 3H18a15.75 15.75 0 01-15.75-15.75v-.75z"></path>
                        </svg>
                    </span>
                    <span>Call Now</span>
                </a>
                <a href="https://wa.me/${props.whatsapp.replace(/[^0-9]/g, '')}" 
                   target="_blank"
                   rel="noopener noreferrer"
                   class="contact-btn contact-btn--whatsapp"
                   aria-label="Chat on WhatsApp with ${props.name}">
                    <span class="contact-btn__icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 3.75A8.25 8.25 0 004.5 12a8.2 8.2 0 001.143 4.191L4.5 20.25l4.26-1.11A8.23 8.23 0 0012 20.25a8.25 8.25 0 000-16.5z"></path>
                            <path d="M15.188 13.313l-.877.504a1.2 1.2 0 01-1.196-.003 7.5 7.5 0 01-2.825-2.825 1.2 1.2 0 01-.003-1.196l.504-.877a.75.75 0 00-.19-.952L9.26 7.677a.75.75 0 00-1.084.177 4 4 0 00-.53 3.673 9.25 9.25 0 003.827 3.827 4 4 0 003.673-.53.75.75 0 00.177-1.084l-.287-.43a.75.75 0 00-.952-.19z"></path>
                        </svg>
                    </span>
                    <span>WhatsApp</span>
                </a>
            </div>
            
            <!-- Get Directions Button -->
            <button class="w-full text-white py-2.5 px-4 rounded-lg transition-all text-sm font-semibold mb-3 get-directions-btn shadow-md hover:shadow-lg" 
                    style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);"
                    onmouseover="this.style.background='linear-gradient(135deg, #0f766e 0%, #115e59 100%)';"
                    onmouseout="this.style.background='linear-gradient(135deg, #0d9488 0%, #0f766e 100%)';"
                    data-lat="${feature.geometry.coordinates[1]}" 
                    data-lon="${feature.geometry.coordinates[0]}"
                    data-name="${props.name}">
                🗺️ Get Directions
            </button>
            
            <!-- Reviews -->
            ${reviewsHtml}
        </div>
    `;
}

/**
 * Format opening hours HTML
 * @param {Object} openingHours - Opening hours object
 * @param {Object} status - Current status object
 * @returns {string} HTML string
 */
function formatOpeningHours(openingHours, status) {
    if (!openingHours) {
        return '<div class="mb-3"><p class="text-sm" style="color: #64748b;">Opening hours not available</p></div>';
    }
    
    const dayNames = {
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday'
    };
    
    const now = new Date();
    const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
    
    let html = '<div class="mb-3"><h4 class="text-sm font-semibold mb-2" style="color: #0f172a;">Opening Hours</h4><div class="space-y-1">';
    
    for (const [day, label] of Object.entries(dayNames)) {
        const hours = openingHours[day] || 'Closed';
        const isToday = day === currentDay;
        const dayStyle = isToday ? 'font-semibold; color: #0d9488;' : 'color: #475569;';
        
        html += `
            <div class="flex justify-between text-xs" style="${dayStyle}">
                <span>${label}:</span>
                <span>${hours === 'Closed' ? 'Closed' : hours}</span>
            </div>
        `;
    }
    
    html += '</div></div>';
    return html;
}

/**
 * Generate photo carousel HTML
 * @param {Array} photos - Array of photo URLs
 * @param {string} id - Health center ID
 * @returns {string} HTML string
 */
function generatePhotoCarousel(photos, id) {
    if (!photos || photos.length === 0) {
        return '<div class="mb-3"><div class="bg-gray-200 h-32 rounded-lg flex items-center justify-center text-gray-400 text-sm">No photos available</div></div>';
    }
    
    const carouselId = `carousel-${id}`;
    let html = `<div class="mb-3 relative" id="${carouselId}">`;
    
    // Carousel container
    html += '<div class="relative overflow-hidden rounded-lg bg-gray-200" style="height: 200px;">';
    
    // Images
    photos.forEach((photo, index) => {
        const isActive = index === 0 ? 'active' : '';
        html += `
            <img src="${photo}" 
                 alt="Health center photo ${index + 1}" 
                 class="carousel-image ${isActive}" 
                 data-index="${index}"
                 style="width: 100%; height: 200px; object-fit: cover; display: ${index === 0 ? 'block' : 'none'};"
                 loading="lazy"
                 onerror="this.src='https://via.placeholder.com/400x200?text=Image+Not+Available'">
        `;
    });
    
    // Navigation buttons
    if (photos.length > 1) {
        html += `
            <button class="carousel-prev absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all" 
                    style="z-index: 10;">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
            </button>
            <button class="carousel-next absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all" 
                    style="z-index: 10;">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
            </button>
        `;
        
        // Indicators
        html += '<div class="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1" style="z-index: 10;">';
        photos.forEach((_, index) => {
            html += `
                <button class="carousel-indicator w-2 h-2 rounded-full ${index === 0 ? 'bg-white' : 'bg-white bg-opacity-50'}" 
                        data-index="${index}"></button>
            `;
        });
        html += '</div>';
    }
    
    html += '</div></div>';
    
    return html;
}

/**
 * Generate reviews section HTML
 * @param {Array} reviews - Array of review objects
 * @returns {string} HTML string
 */
function generateReviewsSection(reviews) {
    if (!reviews || reviews.length === 0) {
        return '<div class="mb-2"><p class="text-sm" style="color: #64748b;">No reviews yet</p></div>';
    }
    
    // Show up to 3 most recent reviews
    const displayReviews = reviews.slice(0, 3);
    
    let html = '<div class="mb-2"><h4 class="text-sm font-semibold mb-2" style="color: #0f172a;">Recent Reviews</h4><div class="space-y-2">';
    
    displayReviews.forEach(review => {
        const stars = generateStars(review.rating);
        const date = formatDate(review.date);
        const text = truncateText(review.text, 120);
        
        html += `
            <div class="pl-3 py-1.5 rounded-lg" style="border-left: 3px solid #0d9488; background: #f8fafc;">
                <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs" style="color: #fbbf24;">${stars}</span>
                    <span class="text-xs font-semibold" style="color: #0f172a;">${review.author}</span>
                    <span class="text-xs" style="color: #94a3b8;">${date}</span>
                </div>
                <p class="text-xs leading-relaxed" style="color: #475569;">${text}</p>
            </div>
        `;
    });
    
    html += '</div></div>';
    return html;
}

/**
 * Initialize carousel functionality for a popup
 * @param {string} popupId - Popup container ID
 */
function initializeCarousel(popupId) {
    const carousel = document.querySelector(`#${popupId} .carousel-image`);
    if (!carousel) return;
    
    const container = carousel.closest('.relative');
    if (!container) return;
    
    const images = container.querySelectorAll('.carousel-image');
    const prevBtn = container.querySelector('.carousel-prev');
    const nextBtn = container.querySelector('.carousel-next');
    const indicators = container.querySelectorAll('.carousel-indicator');
    
    if (images.length <= 1) return;
    
    let currentIndex = 0;
    
    function showImage(index) {
        images.forEach((img, i) => {
            img.style.display = i === index ? 'block' : 'none';
        });
        
        indicators.forEach((ind, i) => {
            ind.className = `carousel-indicator w-2 h-2 rounded-full ${i === index ? 'bg-white' : 'bg-white bg-opacity-50'}`;
        });
        
        currentIndex = index;
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const newIndex = (currentIndex - 1 + images.length) % images.length;
            showImage(newIndex);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const newIndex = (currentIndex + 1) % images.length;
            showImage(newIndex);
        });
    }
    
    indicators.forEach((ind, index) => {
        ind.addEventListener('click', () => {
            showImage(index);
        });
    });
}

