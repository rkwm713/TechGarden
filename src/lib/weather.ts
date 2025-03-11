import { supabase } from './supabase';

export interface WeatherData {
  temp: number;
  humidity: number;
  description: string;
  windSpeed: number;
  precipitationProbability: number;
  forecast: ForecastDay[];
}

export interface ForecastDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  precipitationProbability: number;
}

const LAT = 32.326757;
const LON = -95.337467;

export async function getWeather(): Promise<WeatherData> {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&timezone=auto&forecast_days=7`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data?.current || !data?.daily) {
      throw new Error('Invalid weather data format');
    }

    const current = data.current;
    const daily = data.daily;
    
    // Create forecast array
    const forecast = daily.time.map((date: string, index: number) => ({
      date,
      maxTemp: Math.round(daily.temperature_2m_max[index]),
      minTemp: Math.round(daily.temperature_2m_min[index]),
      precipitationProbability: Math.round(daily.precipitation_probability_max[index])
    }));
    
    return {
      temp: Math.round(current.temperature_2m ?? 70),
      humidity: Math.round(current.relative_humidity_2m ?? 50),
      description: getWeatherDescription(current.temperature_2m),
      windSpeed: Math.round(current.wind_speed_10m ?? 0),
      precipitationProbability: Math.round(current.precipitation_probability ?? 0),
      forecast: forecast.slice(1) // Exclude today since we show it in current conditions
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    // Return default values instead of throwing
    return {
      temp: 70,
      humidity: 50,
      description: 'partly cloudy',
      windSpeed: 0,
      precipitationProbability: 0,
      forecast: Array(6).fill({
        date: new Date().toISOString(),
        maxTemp: 70,
        minTemp: 50,
        precipitationProbability: 0
      })
    };
  }
}

function getWeatherDescription(temp: number): string {
  if (temp >= 85) return 'hot and sunny';
  if (temp >= 70) return 'warm and pleasant';
  if (temp >= 60) return 'mild';
  if (temp >= 50) return 'cool';
  return 'cold';
}