import React from 'react';
import { Cloud, Sun, Wind, Droplet, Umbrella, CalendarDays, ArrowDown, ArrowUp, RefreshCw } from 'lucide-react';
import { useWeather } from '../contexts/WeatherContext';

export default function WeatherWidget() {
  const { weather, loading, error, refreshWeather } = useWeather();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Garden Weather</h2>
        <button
          onClick={refreshWeather}
          className="text-techserv-blue hover:text-techserv-storm transition-all"
          aria-label="Refresh weather"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-8 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Garden Weather</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!weather) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Garden Weather</h2>
      
      {/* Current Conditions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="flex items-center space-x-3">
          <Sun className="h-8 w-8 text-yellow-500" />
          <div>
            <p className="text-gray-600">Temperature</p>
            <p className="text-xl font-semibold">{weather.temp}°F</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Cloud className="h-8 w-8 text-gray-500" />
          <div>
            <p className="text-gray-600">Conditions</p>
            <p className="text-xl font-semibold capitalize">{weather.description}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Wind className="h-8 w-8 text-blue-500" />
          <div>
            <p className="text-gray-600">Wind Speed</p>
            <p className="text-xl font-semibold">{weather.windSpeed} mph</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Droplet className="h-8 w-8 text-blue-400" />
          <div>
            <p className="text-gray-600">Humidity</p>
            <p className="text-xl font-semibold">{weather.humidity}%</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Umbrella className="h-8 w-8 text-purple-400" />
          <div>
            <p className="text-gray-600">Rain Chance</p>
            <p className="text-xl font-semibold">{weather.precipitationProbability}%</p>
          </div>
        </div>
      </div>

      {/* Weekly Forecast */}
      <div className="border-t pt-6">
        <div className="flex items-center mb-4">
          <CalendarDays className="h-5 w-5 mr-2 text-techserv-blue" />
          <h3 className="text-lg font-semibold">6-Day Forecast</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {weather.forecast.map((day, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-4 text-center"
            >
              <p className="font-semibold text-sm mb-2">{formatDate(day.date)}</p>
              <div className="space-y-2">
                <div className="flex items-center justify-center text-red-600">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  <span className="text-sm">{day.maxTemp}°F</span>
                </div>
                <div className="flex items-center justify-center text-blue-600">
                  <ArrowDown className="h-4 w-4 mr-1" />
                  <span className="text-sm">{day.minTemp}°F</span>
                </div>
                <div className="flex items-center justify-center text-purple-600">
                  <Umbrella className="h-4 w-4 mr-1" />
                  <span className="text-sm">{day.precipitationProbability}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
