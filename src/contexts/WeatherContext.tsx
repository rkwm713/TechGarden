import React, { createContext, useContext, useEffect, useState } from 'react';
import { getWeather, type WeatherData } from '../lib/weather';

interface WeatherContextType {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  refreshWeather: () => Promise<void>;
}

const WeatherContext = createContext<WeatherContextType>({
  weather: null,
  loading: true,
  error: null,
  refreshWeather: async () => {},
});

export const useWeather = () => useContext(WeatherContext);

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshWeather = async () => {
    setLoading(true);
    try {
      const data = await getWeather();
      setWeather(data);
      setError(null);
    } catch (err) {
      setError('Failed to load weather data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshWeather();
    
    // Refresh weather data every 30 minutes
    const interval = setInterval(refreshWeather, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const value = {
    weather,
    loading,
    error,
    refreshWeather,
  };

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>;
};
