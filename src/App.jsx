import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { ThermometerSun, AlertTriangle, TrendingUp, Activity, Cpu, Search, MapPin, Wind, Star, LocateFixed } from 'lucide-react';
import './index.css';

function App() {
  const [data, setData] = useState([]);
  const [latestAvg, setLatestAvg] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);
  
  const [inputs, setInputs] = useState({
    land_avg: 15.0,
    land_max: 20.0,
    land_min: 10.0
  });

  const [citySearch, setCitySearch] = useState('');
  const [localWeather, setLocalWeather] = useState(null);
  const [localForecast, setLocalForecast] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  
  const [unit, setUnit] = useState('F'); 
  const [savedLocs, setSavedLocs] = useState(() => {
    const saved = localStorage.getItem('weatherSavedLocations');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('weatherSavedLocations', JSON.stringify(savedLocs));
  }, [savedLocs]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/data');
        if (response.data.success) {
          setData(response.data.historical);
          setLatestAvg(response.data.latest_average);
        }
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePredict = async (e) => {
    e.preventDefault();
    setPredicting(true);
    try {
      const response = await axios.post('/api/predict', inputs);
      if (response.data.success) {
        setPrediction(response.data.prediction);
      }
    } catch (error) {
      console.error("Error during prediction", error);
    } finally {
      setPredicting(false);
    }
  };

  const fetchCityWeather = async (cityName) => {
    if(!cityName.trim()) return;
    setSearching(true);
    setSearchError('');
    try {
      const geoRes = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=en&format=json`);
      if(geoRes.data.results && geoRes.data.results.length > 0) {
        const { latitude, longitude, name, country } = geoRes.data.results[0];
        
        // Fetch current and 10 days (5 past, 6 forecast to make it 11 total centering on today)
        const weatherRes = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&daily=temperature_2m_max,temperature_2m_min&past_days=5&forecast_days=6`);
        
        if(weatherRes.data.current_weather && weatherRes.data.daily) {
          setLocalWeather({
            temperature: weatherRes.data.current_weather.temperature,
            windspeed: weatherRes.data.current_weather.windspeed,
            name,
            country
          });
          
          const daily = weatherRes.data.daily;
          const forecastArray = daily.time.map((t, idx) => ({
            date: t,
            maxF: daily.temperature_2m_max[idx],
            minF: daily.temperature_2m_min[idx]
          }));
          setLocalForecast(forecastArray);
        }
      } else {
        setSearchError('City not found');
      }
    } catch(err) {
      setSearchError('Error fetching weather data');
    } finally {
      setSearching(false);
    }
  };

  const handleAutoLocate = () => {
    if (!navigator.geolocation) {
      setSearchError('Geolocation is not supported by your browser');
      return;
    }
    setSearching(true);
    setSearchError('');
    
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        
        const bdRes = await axios.get(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
        const name = bdRes.data.city || bdRes.data.locality || 'Current Location';
        const country = bdRes.data.countryName || '';

        const weatherRes = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&daily=temperature_2m_max,temperature_2m_min&past_days=5&forecast_days=6`);
        
        if(weatherRes.data.current_weather && weatherRes.data.daily) {
          setLocalWeather({
            temperature: weatherRes.data.current_weather.temperature,
            windspeed: weatherRes.data.current_weather.windspeed,
            name,
            country
          });
          
          const daily = weatherRes.data.daily;
          const forecastArray = daily.time.map((t, idx) => ({
            date: t,
            maxF: daily.temperature_2m_max[idx],
            minF: daily.temperature_2m_min[idx]
          }));
          setLocalForecast(forecastArray);
          setCitySearch(name); // Fill input with location
        }
      } catch(err) {
        setSearchError('Error fetching location weather');
      } finally {
        setSearching(false);
      }
    }, () => {
      setSearchError('Unable to retrieve your location. Check browser permissions.');
      setSearching(false);
    });
  };

  const handleCitySearch = (e) => {
    e.preventDefault();
    fetchCityWeather(citySearch);
  };

  const handleInputChange = (e) => {
    setInputs({
      ...inputs,
      [e.target.name]: parseFloat(e.target.value) || 0
    });
  };

  const toggleSaveLocation = () => {
    if(!localWeather) return;
    const locName = `${localWeather.name}, ${localWeather.country}`;
    if(savedLocs.includes(locName)) {
      setSavedLocs(savedLocs.filter(l => l !== locName));
    } else {
      setSavedLocs([...savedLocs, locName]);
    }
  };

  const conversion = (valF) => unit === 'F' ? valF : (valF - 32) * 5/9;
  const dispUnit = unit === 'F' ? '°F' : '°C';
  const windUnit = unit === 'F' ? 'mph' : 'km/h';
  const windConv = (valMph) => unit === 'F' ? valMph : valMph * 1.60934;

  const displayData = data.map(d => ({
    ...d,
    displayAvg: conversion(d.LandAndOceanAverageTemperature)
  }));
  
  const displayForecast = localForecast.map(d => ({
    ...d,
    max: conversion(d.maxF),
    min: conversion(d.minF)
  }));
  
  const isSaved = localWeather && savedLocs.includes(`${localWeather.name}, ${localWeather.country}`);

  return (
    <div className="dashboard-container">
      <header className="glass-panel" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'}}>
        <div>
          <h1>Climate Dashboard <span style={{fontSize: '1.2rem', fontWeight: 'normal', color: 'var(--text-secondary)'}}>using Machine Learning</span></h1>
          <p>Premium Real-Time Weather Prediction & Live Data</p>
        </div>
        <div className="unit-toggle" style={{display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '4px'}}>
          <button className={`toggle-btn ${unit === 'C' ? 'active' : ''}`} onClick={() => setUnit('C')}>°C</button>
          <button className={`toggle-btn ${unit === 'F' ? 'active' : ''}`} onClick={() => setUnit('F')}>°F</button>
        </div>
      </header>

      <div className="kpi-grid">
        <div className="glass-panel kpi-card">
          <div className="kpi-icon">
             <ThermometerSun size={28} />
          </div>
          <div className="kpi-content">
             <h3>Latest Avg Temp</h3>
             <div className="value">{loading ? '...' : `${conversion(latestAvg).toFixed(2)}${dispUnit}`}</div>
          </div>
        </div>
        
        <div className="glass-panel kpi-card">
          <div className="kpi-icon">
             <TrendingUp size={28} />
          </div>
          <div className="kpi-content">
             <h3>Model Accuracy</h3>
             <div className="value">99.58%</div>
          </div>
        </div>
        
        <div className="glass-panel kpi-card">
          <div className="kpi-icon">
             <Activity size={28} />
          </div>
          <div className="kpi-content">
             <h3>Baseline MAE Gap</h3>
             <div className="value">{conversion(1.78).toFixed(2)}{dispUnit}</div>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="left-charts">
          
          <div className="glass-panel chart-section" style={{marginBottom: '1.5rem'}}>
            <div className="chart-header">
              <h2>Historical Temperatures (1850+)</h2>
              <div style={{color: "var(--text-secondary)"}}>Land & Ocean Average</div>
            </div>
            <div style={{ width: '100%', height: 300 }}>
              {loading ? (
                <div style={{height: "100%", display: "flex", alignItems: "center", justifyContent: "center"}}>Loading historical data...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={displayData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4facfe" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#4facfe" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="Year" stroke="var(--text-secondary)" tick={{fontSize: 12}} />
                    <YAxis domain={['auto', 'auto']} stroke="var(--text-secondary)" tick={{fontSize: 12}} />
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(11, 12, 16, 0.9)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(val) => [val.toFixed(2) + dispUnit, "Global Avg"]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="displayAvg" 
                      name="Avg"
                      stroke="#00f2fe" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorTemp)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {localForecast.length > 0 && (
            <div className="glass-panel chart-section" style={{animation: 'fadeIn 0.5s ease'}}>
              <div className="chart-header">
                <h2>10-Day Weather Forecast</h2>
                <div style={{color: "var(--text-secondary)"}}>5 Days Past & 5 Days Future for {localWeather?.name}</div>
              </div>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={displayForecast} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff758c" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#ff758c" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4facfe" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#4facfe" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="var(--text-secondary)" tick={{fontSize: 12}} />
                    <YAxis domain={['auto', 'auto']} stroke="var(--text-secondary)" tick={{fontSize: 12}} />
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(11, 12, 16, 0.9)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(val, name) => [val.toFixed(2) + dispUnit, name]}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="max" 
                      name="Daily Max"
                      stroke="#ff758c" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorMax)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="min" 
                      name="Daily Min"
                      stroke="#4facfe" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorMin)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        <div className="glass-panel" style={{display: "flex", flexDirection: "column", gap: "2rem"}}>
          <div className="city-search-section">
            <h2>Live Local Weather</h2>
            <p style={{color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1rem"}}>Get current conditions for any area.</p>
            
            <form onSubmit={handleCitySearch} style={{display: "flex", gap: "0.5rem", marginBottom: "1rem"}}>
              <input 
                type="text" 
                className="glass-input" 
                placeholder="Enter city name..." 
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                required
                style={{flex: 1}}
              />
              <button type="submit" className="glass-button" disabled={searching} title="Search City" style={{width: "auto", padding: "0.8rem 1.2rem"}}>
                {searching ? '...' : <Search size={20} />}
              </button>
              <button type="button" onClick={handleAutoLocate} className="glass-button" disabled={searching} title="Auto Locate Me" style={{width: "auto", padding: "0.8rem 1.2rem", background: "rgba(255,255,255,0.1)"}}>
                <LocateFixed size={20} color="var(--accent-secondary)" />
              </button>
            </form>

            <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem'}}>
              {savedLocs.map((loc, i) => (
                <button 
                  key={i} 
                  className="saved-loc-chip" 
                  onClick={() => {setCitySearch(loc.split(',')[0]); fetchCityWeather(loc.split(',')[0]);}}
                >
                  <MapPin size={12} /> {loc}
                </button>
              ))}
            </div>

            {searchError && <p style={{color: "#ff6b6b", fontSize: "0.9rem", marginBottom: "1rem"}}>{searchError}</p>}

            {localWeather && (
              <div className="prediction-result" style={{marginTop: "0", background: "rgba(0, 242, 254, 0.1)", borderColor: "rgba(0, 242, 254, 0.3)"}}>
                <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem"}}>
                  <div style={{display: "flex", alignItems: "center", gap: "0.5rem"}}>
                    <MapPin size={24} color="var(--accent-secondary)"/>
                    <h3 style={{fontSize: "1.2rem", margin: 0}}>{localWeather.name}, {localWeather.country}</h3>
                  </div>
                  <button onClick={toggleSaveLocation} className="save-btn" title={isSaved ? "Unsave" : "Save Location"}>
                    <Star size={24} fill={isSaved ? "gold" : "transparent"} color={isSaved ? "gold" : "var(--text-secondary)"} />
                  </button>
                </div>
                <div style={{display: "flex", justifyContent: "space-around", alignItems: "center"}}>
                  <div>
                    <p style={{marginBottom: "0.2rem"}}>Current Temp</p>
                    <h2 style={{fontSize: "2rem"}}>{conversion(localWeather.temperature).toFixed(1)}{dispUnit}</h2>
                  </div>
                  <div>
                    <p style={{marginBottom: "0.2rem", display: "flex", alignItems: "center", gap: "0.3rem"}}>
                      <Wind size={16} /> Wind
                    </p>
                    <h2 style={{fontSize: "1.5rem", color: "var(--text-primary)"}}>{windConv(localWeather.windspeed).toFixed(1)} {windUnit}</h2>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="prediction-section">
            <h2>ML Predictor</h2>
          <form onSubmit={handlePredict}>
            <div className="form-group">
              <label>Land Average Temperature (°F)</label>
              <input 
                type="number" 
                name="land_avg"
                step="0.01"
                className="glass-input" 
                value={inputs.land_avg} 
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Land Max Temperature (°F)</label>
              <input 
                type="number" 
                name="land_max"
                step="0.01"
                className="glass-input" 
                value={inputs.land_max} 
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Land Min Temperature (°F)</label>
              <input 
                type="number" 
                name="land_min"
                step="0.01"
                className="glass-input" 
                value={inputs.land_min} 
                onChange={handleInputChange}
                required
              />
            </div>
            
            <button type="submit" className="glass-button" disabled={predicting}>
               {predicting ? 'Calculating...' : <><Cpu size={20} /> Generate Prediction</>}
            </button>
          </form>

          {prediction !== null && (
            <div className="prediction-result">
              <p>Predicted Land & Ocean Avg</p>
              <h2>{conversion(prediction).toFixed(2)}{dispUnit}</h2>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}

export default App;
