# Weather App 🌤️

A modern, responsive weather application built with vanilla JavaScript and Open-Meteo API.

## ✨ Features

### Core Weather Features
- 🔍 **City Search** - Search weather by city name with autocomplete
- 📍 **Geolocation** - One-click access to your current location weather
- 🌡️ **Temperature Unit Toggle** - Switch between Celsius and Fahrenheit
- 💨 **Wind Information** - View wind speed and cardinal direction
- 📅 **3-Day Forecast** - Extended weather forecast with min/max temperatures
- 🎨 **Weather Icons** - Beautiful emoji icons for different conditions

### Advanced Features
- 💾 **Export to CSV** - Download your recent search history
- 📚 **Recent Searches** - Quick access to previously searched cities
- 🗑️ **Clear History** - Remove all search history with one click
- 🌙 **Dark Mode** - Automatic dark/light theme based on system preferences
- ⌨️ **Keyboard Shortcuts** - Quick access with keyboard commands
- 💬 **Smooth Animations** - Floating icons, bouncing forecasts, and fade-in effects

### Design & UX
- 📱 **Fully Responsive** - Works perfectly on desktop, tablet, and mobile
- ♿ **Accessible** - WCAG compliant with proper ARIA labels
- 🎯 **Professional UI** - Modern design system with color variables
- 🚀 **Fast Performance** - Caching system reduces API calls
- 🌐 **Dark Mode Support** - Automatic theme based on system settings
- 🔄 **Loading States** - Skeleton screens and visual feedback

## 🛠️ Technologies

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **APIs**: 
  - Open-Meteo Weather API (free weather data)
  - Nominatim API (reverse geocoding)
- **Storage**: Browser localStorage for recent searches
- **Features**: Geolocation API, Fetch API, CSV export

## 📦 Project Structure

```
weather/
├── weather.html      # Main HTML file with structure
├── style.css         # Comprehensive design system and styling
├── script.js         # Application logic (900+ lines)
├── README.md         # This file
└── .gitignore       # Git ignore rules
```

## 🚀 Getting Started

### Option 1: Open Locally
1. Clone or download the project
2. Open `weather.html` in any modern browser
3. Allow geolocation permission (optional)
4. Start searching!

### Option 2: Run with Local Server
```powershell
cd "c:\Users\PC\OneDrive\Desktop\weather"
python -m http.server 8000
```
Then visit: `http://localhost:8000`

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` or `Cmd+K` | Focus search input |
| `Enter` | Search weather |
| `Escape` | Clear search input |

## 🎨 Design Features

### Color System
- **Light Mode**: Blue-tinted gradient background with white cards
- **Dark Mode**: Dark blue/gray background with darker cards
- **Accent Color**: Vibrant blue (#3a7bfd) with hover effects

### Animations
- ✨ **Fade-in Effects** - Smooth page load animations
- 🎈 **Floating Icons** - Weather icon gently floats up and down
- 🎪 **Bounce Animation** - Forecast cards bounce gently
- 📝 **Shimmer Loading** - Skeleton screens with shimmer effect
- 🎯 **Smooth Transitions** - All interactions have smooth transitions

### Responsive Breakpoints
- **Mobile**: 480px and below (single column)
- **Tablet**: 480px to 768px (optimized touch targets)
- **Desktop**: 768px and above (full layout)

## 📊 Weather Data

### Current Weather Shows
- 🌡️ Temperature (with unit conversion)
- 📝 Weather description (e.g., "Light rain")
- 💨 Wind speed and direction
- 🌐 Location (city, country)
- ⏰ Local time
- 🎨 Appropriate weather emoji icon

### 3-Day Forecast Shows
- 📅 Date (formatted as "Mon, 28 Apr")
- 🎨 Weather emoji
- 📝 Weather description
- 🌡️ Min/Max temperatures

## 💾 CSV Export Format

Exported file includes:
- Header with export timestamp
- Column headers: "City Name", "Search Index"
- All recent searches with date/time
- Proper CSV formatting with quoted fields

Example:
```csv
"Recent Searches Export"
"Exported on","4/28/2026, 2:30:15 PM"

"City Name","Search Index"
"London",1
"New York",2
"Tokyo",3
```

## 🔒 Privacy & Security

- ✅ No data sent to external servers except weather APIs
- ✅ Search history stored locally in browser (localStorage)
- ✅ Geolocation data never saved or transmitted
- ✅ CSV export is a local file download
- ✅ Works completely offline after first load

## 🌐 API Credits

- **Weather Data**: [Open-Meteo](https://open-meteo.com/) - Free weather API
- **Reverse Geocoding**: [Nominatim](https://nominatim.org/) - OpenStreetMap geocoding

## 🎯 Performance Optimizations

- **Smart Caching**: 10-minute cache for locations, 5-minute for weather
- **Debounced Search**: 300ms delay prevents excessive API calls
- **Lazy Loading**: Forecast cards load on demand
- **CSS Optimizations**: Minimal file size with efficient selectors
- **JavaScript Minification Ready**: Can be minified for production

## 🔧 Customization

### Change Colors
Edit `:root` variables in `style.css`:
```css
--accent: #3a7bfd;        /* Main color */
--accent-hover: #2563eb;  /* Hover color */
--success: #2d7c3e;       /* Success messages */
--error: #d64545;         /* Error messages */
```

### Adjust Cache Duration
Edit `CONFIG` in `script.js`:
```javascript
const CONFIG = {
  CACHE_DURATION: 10 * 60 * 1000,  // 10 minutes
  // ...
};
```

### Change Max Recent Searches
```javascript
MAX_RECENT_SEARCHES: 5  // Store last 5 searches
```

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🐛 Troubleshooting

### App won't load
- Check browser console for errors (F12)
- Ensure JavaScript is enabled
- Try a different browser

### Geolocation not working
- Browser requires HTTPS or localhost
- Check location permission in browser settings
- Try manual search instead

### Weather data not showing
- Verify internet connection
- Check if APIs are accessible from your region
- Try searching a major city (London, New York, Tokyo)

### Export CSV not downloading
- Check browser's download settings
- Ensure you have recent searches
- Try a different browser

## 📝 Future Enhancements

- [ ] Hourly forecast
- [ ] Weather alerts/warnings
- [ ] Multiple city comparison
- [ ] Weather history graphs
- [ ] Favorites/bookmarks
- [ ] PWA (Progressive Web App)
- [ ] Multi-language support
- [ ] Air quality data

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author Notes

Built as a modern weather application demonstration with a focus on:
- Clean, maintainable code
- Professional UI/UX design
- Responsive design patterns
- Accessibility best practices
- Performance optimization
- User experience enhancements

## 🤝 Contributing

Feel free to fork, modify, and improve this project!

## 📞 Support

For issues or suggestions, please open an issue on GitHub.

---

**Happy weather checking! ☀️🌧️⛈️**
