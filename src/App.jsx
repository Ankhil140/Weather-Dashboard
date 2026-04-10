import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { ThermometerSun, AlertTriangle, TrendingUp, Activity, Cpu, Search, MapPin, Wind } from 'lucide-react';
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
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

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

  const handleInputChange = (e) => {
    setInputs({
      ...inputs,
      [e.target.name]: parseFloat(e.target.value) || 0
    });
  };

  const handleCitySearch = async (e) => {
    e.preventDefault();
    if(!citySearch.trim()) return;
    setSearching(true);
    setSearchError('');
    try {
      const geoRes = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${citySearch}&count=1&language=en&format=json`);
      if(geoRes.data.results && geoRes.data.results.length > 0) {
        const { latitude, longitude, name, country } = geoRes.data.results[0];
        const weatherRes = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph`);
        if(weatherRes.data.current_weather) {
          setLocalWeather({
            temperature: weatherRes.data.current_weather.temperature,
            windspeed: weatherRes.data.current_weather.windspeed,
            name,
            country
          });
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

  return (
    <div className="dashboard-container">
      <header className="glass-panel">
        <h1>Climate Dashboard <span style={{fontSize: '1.2rem', fontWeight: 'normal', color: 'var(--text-secondary)'}}>using Machine Learning</span></h1>
        <p>Premium Real-Time Weather Prediction & Live Data</p>
      </header>

      <div className="kpi-grid">
        <div className="glass-panel kpi-card">
          <div className="kpi-icon">
             <ThermometerSun size={28} />
          </div>
          <div className="kpi-content">
             <h3>Latest Avg Temp</h3>
             <div className="value">{loading ? '...' : `${latestAvg.toFixed(2)}°F`}</div>
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
             <div className="value">1.78°F</div>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="glass-panel chart-section">
          <div className="chart-header">
            <h2>Historical Temperatures (1850+)</h2>
            <div style={{color: "var(--text-secondary)"}}>Land & Ocean Average</div>
          </div>
          <div style={{ width: '100%', height: 400 }}>
            {loading ? (
              <div style={{height: "100%", display: "flex", alignItems: "center", justifyContent: "center"}}>Loading historical data...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                  />
                  <Area 
                    type="monotone" 
                    dataKey="LandAndOceanAverageTemperature" 
                    name="Avg (°F)"
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

        <div className="glass-panel" style={{display: "flex", flexDirection: "column", gap: "2rem"}}>
          <div className="city-search-section">
            <h2>Live Local Weather</h2>
            <p style={{color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1rem"}}>Get current conditions for any area.</p>
            <form onSubmit={handleCitySearch} style={{display: "flex", gap: "0.5rem", marginBottom: "1.5rem"}}>
              <input 
                type="text" 
                className="glass-input" 
                placeholder="Enter city name..." 
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                required
                style={{flex: 1}}
              />
              <button type="submit" className="glass-button" disabled={searching} style={{width: "auto", padding: "0.8rem 1.2rem"}}>
                {searching ? '...' : <Search size={20} />}
              </button>
            </form>

            {searchError && <p style={{color: "#ff6b6b", fontSize: "0.9rem", marginBottom: "1rem"}}>{searchError}</p>}

            {localWeather && (
              <div className="prediction-result" style={{marginTop: "0", background: "rgba(0, 242, 254, 0.1)", borderColor: "rgba(0, 242, 254, 0.3)"}}>
                <div style={{display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "1rem"}}>
                  <MapPin size={24} color="var(--accent-secondary)"/>
                  <h3 style={{fontSize: "1.2rem"}}>{localWeather.name}, {localWeather.country}</h3>
                </div>
                <div style={{display: "flex", justifyContent: "space-around", alignItems: "center"}}>
                  <div>
                    <p style={{marginBottom: "0.2rem"}}>Current Temp</p>
                    <h2 style={{fontSize: "2rem"}}>{localWeather.temperature}°F</h2>
                  </div>
                  <div>
                    <p style={{marginBottom: "0.2rem", display: "flex", alignItems: "center", gap: "0.3rem"}}>
                      <Wind size={16} /> Wind
                    </p>
                    <h2 style={{fontSize: "1.5rem", color: "var(--text-primary)"}}>{localWeather.windspeed} mph</h2>
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
              <h2>{prediction.toFixed(2)}°F</h2>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

export default App;
