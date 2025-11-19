/**
 * Utility functions for the Health Centers Map application
 */

/**
 * Get marker icon based on health center type
 * @param {string} type - Health center type
 * @returns {L.Icon} Leaflet icon object
 */
function getMarkerIcon(type) {
    const iconConfig = {
        'Hospital': {
            color: '#dc2626',
            gradient: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            icon: '🏥'
        },
        'Clinic': {
            color: '#2563eb',
            gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            icon: '🏪'
        },
        'Health Center II/III/IV': {
            color: '#059669',
            gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            icon: '⚕️'
        },
        'Dispensary': {
            color: '#f97316',
            gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            icon: '💊'
        }
    };

    const config = iconConfig[type] || iconConfig['Clinic'];
    
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            background: ${config.gradient};
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 4px 8px rgba(0,0,0,0.25), 0 2px 4px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            justify-content: center;
        ">
            <span style="
                transform: rotate(45deg);
                font-size: 18px;
                display: block;
                filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
            ">${config.icon}</span>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
}

/**
 * Get type badge color
 * @param {string} type - Health center type
 * @returns {string} CSS color class
 */
function getTypeBadgeColor(type) {
    const colors = {
        'Hospital': 'text-white font-semibold',
        'Clinic': 'text-white font-semibold',
        'Health Center II/III/IV': 'text-white font-semibold',
        'Health Center': 'text-white font-semibold',
        'Dispensary': 'text-white font-semibold'
    };
    return colors[type] || colors['Clinic'];
}

/**
 * Get type badge background style
 * @param {string} type - Health center type
 * @returns {string} Inline style for background
 */
function getTypeBadgeStyle(type) {
    const styles = {
        'Hospital': 'background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);',
        'Clinic': 'background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);',
        'Health Center II/III/IV': 'background: linear-gradient(135deg, #059669 0%, #047857 100%);',
        'Health Center': 'background: linear-gradient(135deg, #059669 0%, #047857 100%);',
        'Dispensary': 'background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);'
    };
    return styles[type] || styles['Clinic'];
}

/**
 * Format phone number for display
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
function formatPhone(phone) {
    return phone.replace(/(\+256)(\d{3})(\d{6})/, '$1 $2 $3');
}

/**
 * Generate star rating HTML
 * @param {number} rating - Rating value (0-5)
 * @returns {string} HTML string with stars
 */
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '★';
    }
    if (hasHalfStar) {
        stars += '½';
    }
    for (let i = 0; i < emptyStars; i++) {
        stars += '☆';
    }
    
    return stars;
}

/**
 * Check if health center is open now
 * @param {Object} openingHours - Opening hours object
 * @returns {Object} Status object with isOpen, nextChange, and message
 */
function isOpenNow(openingHours) {
    if (!openingHours) {
        return { isOpen: false, nextChange: null, message: 'Hours not available' };
    }

    const now = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = dayNames[now.getDay()];
    const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight
    
    const todayHours = openingHours[currentDay];
    
    if (!todayHours || todayHours === 'Closed') {
        // Find next open day
        let nextOpenDay = null;
        let daysToCheck = 7;
        let checkDay = (now.getDay() + 1) % 7;
        
        while (daysToCheck > 0 && !nextOpenDay) {
            const dayName = dayNames[checkDay];
            const hours = openingHours[dayName];
            if (hours && hours !== 'Closed') {
                nextOpenDay = {
                    day: dayName,
                    hours: hours
                };
            }
            checkDay = (checkDay + 1) % 7;
            daysToCheck--;
        }
        
        return {
            isOpen: false,
            nextChange: nextOpenDay ? `${nextOpenDay.day} at ${nextOpenDay.hours.split('-')[0]}` : null,
            message: nextOpenDay ? `Opens ${nextOpenDay.day} at ${nextOpenDay.hours.split('-')[0]}` : 'Closed'
        };
    }
    
    // Parse hours (format: "HH:MM-HH:MM" or "00:00-23:59")
    const [openTime, closeTime] = todayHours.split('-');
    const [openHour, openMin] = openTime.split(':').map(Number);
    const [closeHour, closeMin] = closeTime.split(':').map(Number);
    
    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;
    
    // Handle 24-hour operations
    if (openMinutes === 0 && closeMinutes === 1439) {
        return { isOpen: true, nextChange: null, message: 'Open 24 hours' };
    }
    
    const isOpen = currentTime >= openMinutes && currentTime < closeMinutes;
    
    if (isOpen) {
        return {
            isOpen: true,
            nextChange: `${closeTime}`,
            message: `Closes at ${closeTime}`
        };
    } else {
        if (currentTime < openMinutes) {
            return {
                isOpen: false,
                nextChange: `${openTime}`,
                message: `Opens at ${openTime}`
            };
        } else {
            // Find next open day
            let nextOpenDay = null;
            let daysToCheck = 7;
            let checkDay = (now.getDay() + 1) % 7;
            
            while (daysToCheck > 0 && !nextOpenDay) {
                const dayName = dayNames[checkDay];
                const hours = openingHours[dayName];
                if (hours && hours !== 'Closed') {
                    nextOpenDay = {
                        day: dayName,
                        hours: hours
                    };
                }
                checkDay = (checkDay + 1) % 7;
                daysToCheck--;
            }
            
            return {
                isOpen: false,
                nextChange: nextOpenDay ? `${nextOpenDay.day} at ${nextOpenDay.hours.split('-')[0]}` : null,
                message: nextOpenDay ? `Opens ${nextOpenDay.day} at ${nextOpenDay.hours.split('-')[0]}` : 'Closed'
            };
        }
    }
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Format distance in kilometers
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance
 */
function formatDistance(meters) {
    if (meters < 1000) {
        return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Format duration in hours and minutes
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength = 100) {
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength) + '...';
}

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
}

