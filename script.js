/**
 * Weather App JavaScript
 * Enhanced version with better UX, error handling, and features
 */

// ===========================
// CONFIGURATION & CONSTANTS
// ===========================

const CONFIG = {
  API_BASE: 'https://api.open-meteo.com/v1/forecast',
  GEOCODING_BASE: 'https://geocoding-api.open-meteo.com/v1/search',
  CACHE_DURATION: 10 * 60 * 1000, // 10 minutes
  DEBOUNCE_DELAY: 300, // ms
  MAX_RECENT_SEARCHES: 5
};

// Weather code mapping with enhanced descriptions
const WEATHER_CODE_MAP = {
  0: { label: 'Clear sky', icon: '☀️', category: 'clear' },
  1: { label: 'Mainly clear', icon: '🌤️', category: 'clear' },
  2: { label: 'Partly cloudy', icon: '⛅', category: 'cloudy' },
  3: { label: 'Overcast', icon: '☁️', category: 'cloudy' },
  45: { label: 'Fog', icon: '🌫️', category: 'fog' },
  48: { label: 'Depositing rime fog', icon: '🌫️', category: 'fog' },
  51: { label: 'Light drizzle', icon: '🌦️', category: 'rain' },
  53: { label: 'Moderate drizzle', icon: '🌦️', category: 'rain' },
  55: { label: 'Dense drizzle', icon: '🌧️', category: 'rain' },
  56: { label: 'Freezing drizzle', icon: '🌧️', category: 'rain' },
  57: { label: 'Heavy freezing drizzle', icon: '🌧️', category: 'rain' },
  61: { label: 'Slight rain', icon: '🌧️', category: 'rain' },
  63: { label: 'Rain', icon: '🌧️', category: 'rain' },
  65: { label: 'Heavy rain', icon: '⛈️', category: 'rain' },
  66: { label: 'Freezing rain', icon: '🌧️', category: 'rain' },
  67: { label: 'Heavy freezing rain', icon: '🌧️', category: 'rain' },
  71: { label: 'Snow fall', icon: '🌨️', category: 'snow' },
  73: { label: 'Snow', icon: '🌨️', category: 'snow' },
  75: { label: 'Heavy snow', icon: '❄️', category: 'snow' },
  77: { label: 'Snow grains', icon: '❄️', category: 'snow' },
  80: { label: 'Rain showers', icon: '🌧️', category: 'rain' },
  81: { label: 'Heavy rain showers', icon: '⛈️', category: 'rain' },
  82: { label: 'Violent rain showers', icon: '⛈️', category: 'rain' },
  85: { label: 'Snow showers', icon: '🌨️', category: 'snow' },
  86: { label: 'Heavy snow showers', icon: '❄️', category: 'snow' },
  95: { label: 'Thunderstorm', icon: '⛈️', category: 'storm' },
  96: { label: 'Thunderstorm with hail', icon: '⛈️', category: 'storm' },
  99: { label: 'Thunderstorm with heavy hail', icon: '⛈️', category: 'storm' }
};

// ===========================
// UTILITY FUNCTIONS
// ===========================

/**
 * Debounce function to limit API calls
 */
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Convert wind direction degrees to cardinal direction
 */
function getWindDirection(degrees) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

/**
 * Format date for display
 */
function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
}

/**
 * Format time for display
 */
function formatTime(isoDate) {
  return new Date(isoDate).toLocaleString(undefined, {
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit'
  });
}

/**
 * Get weather details from code
 */
function getWeatherDetails(code) {
  return WEATHER_CODE_MAP[code] || { label: 'Unknown', icon: '🌈', category: 'unknown' };
}

/**
 * Simple cache implementation
 */
class SimpleCache {
  constructor() {
    this.cache = new Map();
  }

  set(key, value, ttl = CONFIG.CACHE_DURATION) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }
}

// ===========================
// API FUNCTIONS
// ===========================

/**
 * Generic JSON fetch with error handling
 */
async function fetchJson(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    if (error.name === 'TypeError') {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
}

/**
 * Get coordinates for a city
 */
async function getCoordinates(city) {
  const encoded = encodeURIComponent(city);
  const url = `${CONFIG.GEOCODING_BASE}?name=${encoded}&count=1&language=en&format=json`;

  const data = await fetchJson(url);
  if (!data.results || !data.results.length) {
    throw new Error('Location not found. Try a different city name.');
  }

  return data.results[0];
}

/**
 * Get weather data
 */
async function getWeather(lat, lon, timezone) {
  const url = `${CONFIG.API_BASE}?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode,windspeed_10m_max,winddirection_10m_dominant&timezone=${encodeURIComponent(timezone)}`;

  return await fetchJson(url);
}

/**
 * Get user's location using geolocation API
 */
function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      error => {
        let message = 'Unable to get your location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied. Please enable location services.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out.';
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
}

// ===========================
// UI MANAGEMENT
// ===========================

class WeatherApp {
  constructor() {
    this.cache = new SimpleCache();
    this.recentSearches = this.loadRecentSearches();
    this.temperatureUnit = 'celsius'; // 'celsius' or 'fahrenheit'
    this.initElements();
    this.initEventListeners();
    this.initKeyboardShortcuts();
  }

  initElements() {
    // Form elements
    this.searchButton = document.getElementById('search-button');
    this.cityInput = document.getElementById('city-input');
    this.locationButton = document.getElementById('location-button');
    this.unitToggle = document.getElementById('unit-toggle');
    this.exportCsvBtn = document.getElementById('export-csv-btn');
    this.clearSearchesBtn = document.getElementById('clear-searches-btn');

    // Display elements
    this.message = document.getElementById('message');
    this.weatherSection = document.getElementById('weather-section');
    this.locationEl = document.getElementById('location');
    this.temperatureEl = document.getElementById('temperature');
    this.descriptionEl = document.getElementById('description');
    this.weatherIconEl = document.getElementById('weather-icon');
    this.windSpeedEl = document.getElementById('wind-speed');
    this.pressureEl = document.getElementById('pressure');
    this.localTimeEl = document.getElementById('local-time');
    this.forecastGrid = document.getElementById('forecast-grid');

    // Recent searches
    this.recentSearchesEl = document.getElementById('recent-searches');
  }

  initEventListeners() {
    // Search events
    this.searchButton.addEventListener('click', () => this.searchWeather());
    this.cityInput.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        this.searchWeather();
      }
    });

    // Debounced input for suggestions (if implemented)
    this.cityInput.addEventListener('input', debounce(() => {
      // Could implement autocomplete here
    }, CONFIG.DEBOUNCE_DELAY));

    // Location button
    if (this.locationButton) {
      this.locationButton.addEventListener('click', () => this.useCurrentLocation());
    }

    // Unit toggle
    if (this.unitToggle) {
      this.unitToggle.addEventListener('change', () => this.toggleTemperatureUnit());
    }

    // CSV export button
    if (this.exportCsvBtn) {
      this.exportCsvBtn.addEventListener('click', () => this.exportRecentSearchesCSV());
    }

    // Clear searches button
    if (this.clearSearchesBtn) {
      this.clearSearchesBtn.addEventListener('click', () => this.clearRecentSearches());
    }

    // Recent searches
    if (this.recentSearchesEl) {
      this.updateRecentSearchesDisplay();
    }
  }

  initKeyboardShortcuts() {
    document.addEventListener('keydown', event => {
      // Ctrl/Cmd + K to focus search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        this.cityInput.focus();
        this.cityInput.select();
      }

      // Escape to clear search
      if (event.key === 'Escape') {
        this.cityInput.value = '';
        this.cityInput.focus();
      }
    });
  }

  // ===========================
  // MESSAGE HANDLING
  // ===========================

  setMessage(text, type = 'error') {
    this.message.textContent = text;
    this.message.className = `message ${type}`;
    this.message.setAttribute('aria-live', 'polite');
  }

  clearMessage() {
    this.message.textContent = '';
    this.message.className = 'message';
  }

  // ===========================
  // SEARCH FUNCTIONALITY
  // ===========================

  async searchWeather() {
    const query = this.cityInput.value.trim();
    if (!query) {
      this.setMessage('Please enter a city name to search.', 'error');
      return;
    }

    this.setLoadingState(true);
    this.setMessage('Loading weather...', 'info');

    try {
      const location = await this.getCoordinatesCached(query);
      const weather = await this.getWeatherCached(location);
      this.updateWeather(location, weather);
      this.addToRecentSearches(query);
      this.clearMessage();
    } catch (error) {
      this.setMessage(error.message, 'error');
      this.setLoadingState(false);
    }
  }

  async useCurrentLocation() {
    this.setLoadingState(true);
    this.setMessage('Getting your location...', 'info');

    try {
      const coords = await getUserLocation();
      // Reverse geocode to get city name
      const location = await this.reverseGeocode(coords.latitude, coords.longitude);
      const weather = await this.getWeatherCached(location);
      this.updateWeather(location, weather);
      this.cityInput.value = location.name;
      this.clearMessage();
    } catch (error) {
      this.setMessage(error.message, 'error');
      this.setLoadingState(false);
      this.weatherSection.hidden = true;
    }
  }

  async reverseGeocode(lat, lon) {
    // Use Nominatim API (OpenStreetMap) for reverse geocoding
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10&addressdetails=1`;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Weather-App (https://weather-app.local)'
        }
      });

      if (!response.ok) {
        throw new Error(`Geolocation service error: ${response.status}`);
      }

      const data = await response.json();

      if (!data || !data.address) {
        throw new Error('Unable to determine your location.');
      }

      const address = data.address;
      const city = address.city || address.town || address.village || address.county || 'Unknown';
      const country = address.country || 'Unknown';

      // Return location object similar to Open-Meteo API response
      return {
        name: city,
        country: country,
        latitude: lat,
        longitude: lon,
        timezone: 'UTC' // Nominatim doesn't provide timezone, using UTC as fallback
      };
    } catch (error) {
      throw new Error('Unable to determine your location. Please try searching manually.');
    }
  }

  // ===========================
  // CACHING
  // ===========================

  async getCoordinatesCached(city) {
    const cacheKey = `coords_${city.toLowerCase()}`;
    let location = this.cache.get(cacheKey);

    if (!location) {
      location = await getCoordinates(city);
      this.cache.set(cacheKey, location);
    }

    return location;
  }

  async getWeatherCached(location) {
    const cacheKey = `weather_${location.latitude}_${location.longitude}`;
    let weather = this.cache.get(cacheKey);

    if (!weather) {
      weather = await getWeather(location.latitude, location.longitude, location.timezone);
      this.cache.set(cacheKey, weather, 5 * 60 * 1000); // 5 minutes for weather
    }

    return weather;
  }

  // ===========================
  // RECENT SEARCHES
  // ===========================

  loadRecentSearches() {
    try {
      const searches = localStorage.getItem('weather_recent_searches');
      return searches ? JSON.parse(searches) : [];
    } catch {
      return [];
    }
  }

  saveRecentSearches() {
    try {
      localStorage.setItem('weather_recent_searches', JSON.stringify(this.recentSearches));
    } catch {
      // Ignore localStorage errors
    }
  }

  addToRecentSearches(city) {
    const index = this.recentSearches.indexOf(city);
    if (index > -1) {
      this.recentSearches.splice(index, 1);
    }
    this.recentSearches.unshift(city);
    this.recentSearches = this.recentSearches.slice(0, CONFIG.MAX_RECENT_SEARCHES);
    this.saveRecentSearches();
    this.updateRecentSearchesDisplay();
  }

  updateRecentSearchesDisplay() {
    if (!this.recentSearchesEl) return;

    this.recentSearchesEl.innerHTML = '';

    if (this.recentSearches.length === 0) {
      this.recentSearchesEl.innerHTML = '<p class="info-text">No recent searches</p>';
      return;
    }

    const ul = document.createElement('ul');
    ul.style.listStyle = 'none';
    ul.style.padding = '0';
    ul.style.display = 'grid';
    ul.style.gap = '8px';

    this.recentSearches.forEach(city => {
      const li = document.createElement('li');
      const button = document.createElement('button');
      button.textContent = city;
      button.style.background = 'none';
      button.style.border = 'none';
      button.style.color = 'var(--accent)';
      button.style.cursor = 'pointer';
      button.style.textAlign = 'left';
      button.style.padding = '4px 0';
      button.style.width = '100%';

      button.addEventListener('click', () => {
        this.cityInput.value = city;
        this.searchWeather();
      });

      li.appendChild(button);
      ul.appendChild(li);
    });

    this.recentSearchesEl.appendChild(ul);
  }

  // ===========================
  // CSV EXPORT
  // ===========================

  /**
   * Export recent searches to CSV format and download
   */
  exportRecentSearchesCSV() {
    if (this.recentSearches.length === 0) {
      this.setMessage('No recent searches to export', 'info');
      return;
    }

    const timestamp = new Date().toLocaleString();
    const csvContent = [
      ['Recent Searches Export'],
      ['Exported on', timestamp],
      [],
      ['City Name', 'Search Index'],
      ...this.recentSearches.map((city, index) => [city, index + 1])
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    this.downloadCSV(csvContent, 'weather-recent-searches.csv');
    this.setMessage('Recent searches exported successfully!', 'success');
  }

  /**
   * Trigger CSV download
   */
  downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL
    URL.revokeObjectURL(url);
  }

  /**
   * Clear all recent searches
   */
  clearRecentSearches() {
    if (confirm('Are you sure you want to clear all recent searches? This cannot be undone.')) {
      this.recentSearches = [];
      this.saveRecentSearches();
      this.updateRecentSearchesDisplay();
      this.setMessage('Recent searches cleared', 'info');
    }
  }

  // ===========================
  // TEMPERATURE UNIT TOGGLE
  // ===========================

  toggleTemperatureUnit() {
    this.temperatureUnit = this.temperatureUnit === 'celsius' ? 'fahrenheit' : 'celsius';
    // Re-render current weather if it exists
    if (!this.weatherSection.hidden) {
      // Would need to store current data and re-render
      // For now, just update the toggle label
    }
  }

  convertTemperature(temp) {
    if (this.temperatureUnit === 'fahrenheit') {
      return Math.round((temp * 9/5) + 32);
    }
    return Math.round(temp);
  }

  getTemperatureUnit() {
    return this.temperatureUnit === 'celsius' ? '°C' : '°F';
  }

  getWindSpeedUnit() {
    return this.temperatureUnit === 'celsius' ? 'km/h' : 'mph';
  }

  convertWindSpeed(speedKmh) {
    if (this.temperatureUnit === 'fahrenheit') {
      return Math.round(speedKmh * 0.621371); // Convert km/h to mph
    }
    return Math.round(speedKmh);
  }

  // ===========================
  // LOADING STATES
  // ===========================

  setLoadingState(loading) {
    this.searchButton.disabled = loading;
    this.searchButton.textContent = loading ? 'Loading...' : 'Check weather';

    if (loading) {
      this.weatherSection.hidden = true;
      // Add skeleton loading to elements
      this.addSkeletonLoading();
    } else {
      this.removeSkeletonLoading();
    }
  }

  addSkeletonLoading() {
    // Add skeleton classes to elements for loading animation
    const elements = [
      this.locationEl, this.temperatureEl, this.descriptionEl,
      this.windSpeedEl, this.pressureEl, this.localTimeEl
    ];

    elements.forEach(el => {
      if (el) el.classList.add('skeleton');
    });
  }

  removeSkeletonLoading() {
    const elements = [
      this.locationEl, this.temperatureEl, this.descriptionEl,
      this.windSpeedEl, this.pressureEl, this.localTimeEl
    ];

    elements.forEach(el => {
      if (el) el.classList.remove('skeleton');
    });
  }

  // ===========================
  // WEATHER DISPLAY
  // ===========================

  updateWeather(location, weather) {
    const current = weather.current_weather;
    const weatherDetails = getWeatherDetails(current.weathercode);
    const localTime = formatTime(current.time);

    // Update main weather info
    this.locationEl.textContent = `${location.name}, ${location.country}`;
    this.temperatureEl.textContent = `${this.convertTemperature(current.temperature)}${this.getTemperatureUnit()}`;
    this.descriptionEl.textContent = weatherDetails.label;
    this.weatherIconEl.textContent = weatherDetails.icon;
    this.windSpeedEl.textContent = `${this.convertWindSpeed(current.windspeed)} ${this.getWindSpeedUnit()} ${getWindDirection(current.winddirection)}`;
    this.pressureEl.textContent = `${getWindDirection(current.winddirection)}`;
    this.localTimeEl.textContent = localTime;

    // Update forecast
    this.updateForecast(weather.daily);

    // Show weather section
    this.weatherSection.hidden = false;
    this.setLoadingState(false);

    // Add smooth scroll to results
    this.weatherSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  updateForecast(daily) {
    this.forecastGrid.innerHTML = '';

    if (!daily || !daily.time || !daily.time.length) {
      return;
    }

    const days = daily.time.slice(0, 3);
    days.forEach((date, index) => {
      const weatherDetails = getWeatherDetails(daily.weathercode[index]);
      const maxTemp = this.convertTemperature(daily.temperature_2m_max[index]);
      const minTemp = this.convertTemperature(daily.temperature_2m_min[index]);

      const dayEl = document.createElement('div');
      dayEl.className = 'forecast-day';
      dayEl.innerHTML = `
        <strong>${formatDate(date)}</strong>
        <div class="icon">${weatherDetails.icon}</div>
        <small>${weatherDetails.label}</small>
        <small>${minTemp}° / ${maxTemp}°</small>
      `;

      this.forecastGrid.appendChild(dayEl);
    });
  }
}

// ===========================
// INITIALIZATION
// ===========================

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new WeatherApp();
});

// Export for potential testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WeatherApp, getWindDirection, formatDate };
}