# Uganda Health Centers Map - GIS Web Application

A professional, production-ready GIS web application for mapping health centers across Uganda with advanced features including interactive routing, reviews, real-time opening hours, and mobile-responsive design.

![Health Centers Map](https://img.shields.io/badge/Status-Production%20Ready-success)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 🌟 Features

### Core Functionality
- **Interactive Map Display**: Leaflet.js map centered on Uganda with custom markers
- **30 Health Centers**: Comprehensive GeoJSON data with real Uganda health facilities
- **Marker Clustering**: Performance-optimized clustering for better map interaction
- **Custom Icons**: Color-coded markers by health center type (Hospital, Clinic, Health Center, Dispensary)

### Advanced Features
- **Smart Search**: Real-time filtering by name, type, and location with auto-complete
- **Advanced Popups**: Rich popup interface with:
  - Photo carousel (2+ photos per facility)
  - Star ratings and review count
  - Real-time opening hours status (Open/Closed)
  - Full weekly schedule display
  - Contact buttons (Phone & WhatsApp)
  - Recent reviews section
  - Get Directions button

### Routing & Navigation
- **User Geolocation**: Automatic location detection with pulsing blue marker
- **Turn-by-Turn Directions**: OSRM API integration for detailed routing
- **Route Information**: Distance, estimated time, and travel mode display
- **Interactive Route Display**: Blue polyline showing route on map

### Responsive Design
- **Mobile-First**: Optimized for 320px to 1920px+ screens
- **Touch-Friendly**: 44x44px minimum touch targets
- **Adaptive Layout**: 
  - Mobile: Hamburger menu, bottom sheet popups
  - Tablet: Side panel with larger popups
  - Desktop: Fixed sidebar with full feature set

### User Experience
- **Real-Time Status**: Opening hours checked against current time
- **Smooth Animations**: CSS transitions and loading states
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Error Handling**: Graceful error messages for API failures

## 📁 Project Structure

```
health-centers/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # Custom styles and animations
├── js/
│   ├── map.js              # Map initialization
│   ├── data.js             # GeoJSON data loading
│   ├── search.js           # Search and filtering
│   ├── routing.js          # Routing and directions
│   ├── popup.js            # Popup creation
│   └── utils.js            # Helper functions
├── data/
│   └── health-centers.geojson  # Health centers data (30 facilities)
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (for development)

### Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd health-centers
   ```

2. **Start a local web server**

   Using Python 3:
   ```bash
   python -m http.server 8000
   ```

   Using Node.js (http-server):
   ```bash
   npx http-server -p 8000
   ```

   Using PHP:
   ```bash
   php -S localhost:8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

### Production Deployment

The application can be deployed to any static hosting service:
- **Netlify**: Drag and drop the folder
- **Vercel**: `vercel deploy`
- **GitHub Pages**: Push to `gh-pages` branch
- **AWS S3**: Upload files to S3 bucket with static hosting

## 🗺️ Health Centers Data

The application includes 30 health centers across Uganda:

### Major Hospitals
- Mulago National Referral Hospital (Kampala)
- Nsambya Hospital (Kampala)
- Mengo Hospital (Kampala)
- Kiruddu National Referral Hospital (Kampala)
- Entebbe Regional Referral Hospital
- Jinja Regional Referral Hospital
- Mbale Regional Referral Hospital
- Gulu Regional Referral Hospital
- Mbarara Regional Referral Hospital
- And more...

### Data Format

Each health center includes:
- **Location**: GPS coordinates (longitude, latitude)
- **Basic Info**: Name, type, phone, WhatsApp
- **Description**: Service overview
- **Opening Hours**: Full weekly schedule
- **Photos**: Image URLs (2+ per facility)
- **Ratings**: Average rating and review count
- **Reviews**: User reviews with ratings and dates

## 🛠️ Technology Stack

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Custom styles with Tailwind CSS (CDN)
- **Vanilla JavaScript**: ES6+ (no framework dependencies)
- **Leaflet.js v1.9.4**: Interactive mapping
- **Leaflet.markercluster**: Marker clustering

### APIs & Services
- **OpenStreetMap**: Map tiles
- **OSRM API**: Routing and directions
- **Browser Geolocation API**: User location

### Design
- **Tailwind CSS**: Utility-first CSS framework (CDN)
- **Responsive Design**: Mobile-first approach
- **Modern UI**: Google Maps-inspired interface

## 📱 Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile Safari (iOS 14+)
- ✅ Chrome Mobile (Android)

## 🎯 Usage Guide

### Searching Health Centers

1. **Text Search**: Type in the search bar to filter by name or description
2. **Type Filter**: Use the dropdown to filter by health center type
3. **Click Results**: Click any result in the sidebar to zoom to location

### Getting Directions

1. **Enable Location**: Allow browser location access when prompted
2. **Click Marker**: Click any health center marker on the map
3. **Get Directions**: Click "Get Directions" button in the popup
4. **View Route**: Route appears on map with turn-by-turn directions

### Viewing Details

1. **Click Marker**: Click any health center marker
2. **View Popup**: See full details including:
   - Photos (swipe/click to navigate)
   - Opening hours with real-time status
   - Contact information
   - Reviews and ratings
3. **Contact**: Click "Call Now" or "WhatsApp" buttons

### Mobile Usage

- **Menu**: Tap hamburger icon (top-left) to open search/filters
- **Locate**: Tap location button (bottom-right) to center on your location
- **Directions**: Swipe up directions panel to view turn-by-turn instructions

## 🔧 Configuration

### Customizing Map Center

Edit `js/map.js`:
```javascript
const ugandaCenter = [1.3733, 32.2903]; // [lat, lon]
```

### Changing Map Tiles

Edit `js/map.js`:
```javascript
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    // Your tile layer configuration
})
```

### Adding More Health Centers

Edit `data/health-centers.geojson` and add new features following the existing format.

### Customizing Marker Icons

Edit `js/utils.js` - `getMarkerIcon()` function to change colors or icons.

## 🐛 Troubleshooting

### Map Not Loading
- Check browser console for errors
- Ensure you're using a local web server (not `file://`)
- Verify internet connection (for map tiles)

### Location Not Working
- Check browser permissions for geolocation
- Ensure HTTPS in production (required for geolocation)
- Test in different browsers

### Routing Errors
- OSRM API may be rate-limited; wait and retry
- Check coordinates are valid (within Uganda)
- Verify internet connection

### Images Not Loading
- Check image URLs in GeoJSON are accessible
- Images use placeholder URLs; replace with actual photos
- Check browser console for CORS errors

## 📊 Performance Optimizations

- **Marker Clustering**: Groups nearby markers for better performance
- **Lazy Loading**: Images load only when popup opens
- **Debounced Search**: Limits API calls during typing
- **CDN Resources**: External libraries loaded from CDN
- **Optimized GeoJSON**: Compressed data structure

## 🔒 Security Considerations

- **No API Keys Required**: Uses free public APIs
- **HTTPS Recommended**: Required for geolocation in production
- **CORS**: Ensure proper CORS headers if hosting images externally
- **Input Sanitization**: User input is sanitized before display

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Leaflet.js**: Open-source JavaScript library for mobile-friendly interactive maps
- **OpenStreetMap**: Free, editable map of the world
- **OSRM**: Open Source Routing Machine
- **Tailwind CSS**: Utility-first CSS framework

## 📧 Support

For issues, questions, or contributions:
1. Check existing issues in the repository
2. Create a new issue with detailed description
3. Include browser and device information

## 🗺️ Data Attribution

Health center data is based on real facilities in Uganda. Coordinates and information are approximate and should be verified for accuracy.

**Map Tiles**: © OpenStreetMap contributors

---

**Built with ❤️ for healthcare accessibility in Uganda**

