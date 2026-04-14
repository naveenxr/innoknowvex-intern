/* =====================================================
   WEATHERNOW — script.js
   Concepts: Fetch API, async/await, DOM manipulation
   ===================================================== */

// ─────────────────────────────────────────────────────
// ⚠️  SETUP: Get your FREE API key from:
//     https://openweathermap.org/api
//     Sign up → go to "API keys" → copy your key below
// ─────────────────────────────────────────────────────
const API_KEY = '011962ac4751bd3ccef3d369116f1544';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const UNITS    = 'metric';             // 'imperial' for °F

// ── DOM References ─────────────────────────────────────
const cityInput   = document.getElementById('cityInput');
const searchBtn   = document.getElementById('searchBtn');
const weatherCard = document.getElementById('weatherCard');
const errorCard   = document.getElementById('errorCard');
const errorMsg    = document.getElementById('errorMsg');
const loader      = document.getElementById('loader');
const hintSection = document.getElementById('hintSection');
const bodyEl      = document.getElementById('body');

// Weather data elements
const cityNameEl    = document.getElementById('cityName');
const countryDateEl = document.getElementById('countryDate');
const weatherIconEl = document.getElementById('weatherIcon');
const temperatureEl = document.getElementById('temperature');
const weatherDescEl = document.getElementById('weatherDesc');
const feelsLikeEl   = document.getElementById('feelsLike');
const tempMinEl     = document.getElementById('tempMin');
const tempMaxEl     = document.getElementById('tempMax');
const humidityEl    = document.getElementById('humidity');
const windSpeedEl   = document.getElementById('windSpeed');
const visibilityEl  = document.getElementById('visibility');
const pressureEl    = document.getElementById('pressure');
const sunriseEl     = document.getElementById('sunrise');
const sunsetEl      = document.getElementById('sunset');

// ── UI State Helpers ───────────────────────────────────
function showLoader()  {
  loader.style.display      = 'flex';
  weatherCard.style.display = 'none';
  errorCard.style.display   = 'none';
  hintSection.style.display = 'none';
}

function showError(message) {
  loader.style.display      = 'none';
  weatherCard.style.display = 'none';
  errorCard.style.display   = 'flex';
  hintSection.style.display = 'none';
  errorMsg.textContent      = message;
}

function showWeather() {
  loader.style.display      = 'none';
  errorCard.style.display   = 'none';
  weatherCard.style.display = 'block';
  hintSection.style.display = 'none';
}

function showHint() {
  loader.style.display      = 'none';
  errorCard.style.display   = 'none';
  weatherCard.style.display = 'none';
  hintSection.style.display = 'block';
}

// ── Utility: Format Unix timestamp → "6:20 AM" ────────
function formatTime(unixTs, timezoneOffsetSec) {
  // Convert Unix timestamp + timezone offset to local time string
  const date = new Date((unixTs + timezoneOffsetSec) * 1000);
  const h = date.getUTCHours();
  const m = String(date.getUTCMinutes()).padStart(2, '0');
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${period}`;
}

// ── Utility: Map OWM condition → CSS body class ────────
function getWeatherClass(condition) {
  const map = {
    'Clear':        'weather-clear',
    'Clouds':       'weather-clouds',
    'Rain':         'weather-rain',
    'Drizzle':      'weather-drizzle',
    'Thunderstorm': 'weather-thunderstorm',
    'Snow':         'weather-snow',
    'Mist':         'weather-mist',
    'Fog':          'weather-fog',
    'Haze':         'weather-haze',
    'Dust':         'weather-haze',
    'Sand':         'weather-haze',
    'Smoke':        'weather-haze',
  };
  return map[condition] || 'weather-default';
}

// ── Core: Fetch Weather using Fetch API ───────────────
// async/await makes the code look synchronous while being non-blocking
async function fetchWeather(city) {
  // 1. Validate input
  if (!city.trim()) {
    showError('Please enter a city name.');
    return;
  }

  // 2. Check if API key is set
  if (API_KEY === 'YOUR_API_KEY_HERE') {
    showError('⚠️ Please add your OpenWeatherMap API key in script.js (line 9).');
    return;
  }

  showLoader();

  try {
    // 3. Build the API request URL
    const url = `${BASE_URL}?q=${encodeURIComponent(city)}&units=${UNITS}&appid=${API_KEY}`;

    // 4. Fetch API call — returns a Promise
    const response = await fetch(url);

    // 5. Check HTTP status code
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`"${city}" not found. Check spelling and try again.`);
      } else if (response.status === 401) {
        throw new Error('Invalid API key. Check your OpenWeatherMap key.');
      } else {
        throw new Error(`Server error (${response.status}). Try again later.`);
      }
    }

    // 6. Parse JSON response
    const data = await response.json();

    // 7. Display the data
    displayWeather(data);

  } catch (err) {
    // 8. Handle network errors or thrown errors
    if (err.name === 'TypeError') {
      showError('Network error. Check your internet connection.');
    } else {
      showError(err.message);
    }
  }
}

// ── Display: Populate DOM with weather data ────────────
function displayWeather(data) {
  // Extract fields from the API response object
  const {
    name,
    sys: { country, sunrise, sunset },
    weather: [{ description, icon, main }],
    main: { temp, feels_like, temp_min, temp_max, humidity, pressure },
    wind: { speed },
    visibility,
    timezone,
  } = data;

  // ── City & Date ──
  cityNameEl.textContent    = `${name}`;
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });
  countryDateEl.textContent = `${country}  ·  ${dateStr}`;

  // ── Weather Icon (from OpenWeatherMap CDN) ──
  weatherIconEl.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
  weatherIconEl.alt = description;

  // ── Temperature ──
  temperatureEl.textContent = `${Math.round(temp)}°C`;
  weatherDescEl.textContent = description;
  feelsLikeEl.textContent   = `${Math.round(feels_like)}°C`;
  tempMinEl.textContent     = `${Math.round(temp_min)}°C`;
  tempMaxEl.textContent     = `${Math.round(temp_max)}°C`;

  // ── Stats ──
  humidityEl.textContent  = `${humidity}%`;
  windSpeedEl.textContent = `${(speed * 3.6).toFixed(1)} km/h`;  // m/s → km/h
  visibilityEl.textContent = visibility
    ? `${(visibility / 1000).toFixed(1)} km`
    : 'N/A';
  pressureEl.textContent  = `${pressure} hPa`;
  sunriseEl.textContent   = formatTime(sunrise, timezone);
  sunsetEl.textContent    = formatTime(sunset,  timezone);

  // ── Dynamic background based on weather ──
  const weatherClass = getWeatherClass(main);
  bodyEl.className   = weatherClass;

  showWeather();
}

// ── Event Listeners ─────────────────────────────────────

// Search button click
searchBtn.addEventListener('click', () => {
  fetchWeather(cityInput.value);
});

// Press Enter to search
cityInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') fetchWeather(cityInput.value);
});

// Quick city chips
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const city = chip.dataset.city;
    cityInput.value = city;
    fetchWeather(city);
  });
});

// ── Initial State ─────────────────────────────────────
showHint();
