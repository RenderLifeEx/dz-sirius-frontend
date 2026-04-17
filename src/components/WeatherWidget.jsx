import { useEffect, useState } from 'react'
import * as stylex from '@stylexjs/stylex'

const POLL_INTERVAL_MS = 10 * 60 * 1000
const URL = 'https://api.open-meteo.com/v1/forecast'
  + '?latitude=43.435&longitude=39.950'
  + '&daily=temperature_2m_max,temperature_2m_min,weathercode'
  + '&timezone=Europe%2FMoscow&forecast_days=2'

function getWeatherIcon(code) {
  if (code === 0) return '☀️'
  if (code <= 2) return '🌤️'
  if (code === 3) return '☁️'
  if (code <= 48) return '🌫️'
  if (code <= 57) return '🌦️'
  if (code <= 67) return '🌧️'
  if (code <= 77) return '❄️'
  if (code <= 82) return '🌧️'
  if (code <= 86) return '🌨️'
  return '⛈️'
}

const s = stylex.create({
  widget: {
    display: 'flex',
    alignItems: 'center',
    background: 'var(--accent-light)',
    borderRadius: '12px',
    padding: '0 12px',
    marginRight: '8px',
    height: '40px',
    boxSizing: 'border-box',
  },
  icon: {
    fontSize: '18px',
    marginRight: '6px',
    lineHeight: '1',
  },
  temps: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  tempDay: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    lineHeight: '1.2',
  },
  tempNight: {
    fontSize: '11px',
    fontWeight: '400',
    color: 'var(--text-secondary)',
    lineHeight: '1.2',
  },
})

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null)
  const [fetchError, setFetchError] = useState(false)

  function fetchWeather() {
    if (!window.fetch) { setFetchError(true); return }
    window.fetch(URL)
      .then(function(res) {
        if (!res.ok) return null
        return res.json()
      })
      .then(function(data) {
        if (!data) { setFetchError(true); return }
        setFetchError(false)
        // index 1 = tomorrow
        setWeather({
          max: Math.round(data.daily.temperature_2m_max[1]),
          min: Math.round(data.daily.temperature_2m_min[1]),
          code: data.daily.weathercode[1],
        })
      })
      .catch(function() { setFetchError(true) })
  }

  useEffect(function() {
    fetchWeather()
    var interval = setInterval(fetchWeather, POLL_INTERVAL_MS)
    return function() { clearInterval(interval) }
  }, [])

  if (!weather && !fetchError) return null
  if (fetchError) return (
    <div {...stylex.props(s.widget)}>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
        <g fill="#FF8B8B">
          <path d="M6.469 5.053a15.019 15.019 0 0 0-5.077 3.341 1 1 0 1 0 1.415 1.414 12.995 12.995 0 0 1 5.225-3.192zM9.664 8.249a10.983 10.983 0 0 0-5.437 2.967 1 1 0 0 0 1.413 1.416 8.967 8.967 0 0 1 5.793-2.615zM14.636 10.392l-2.389-2.39a10.968 10.968 0 0 1 7.526 3.214 1 1 0 1 1-1.413 1.416 8.994 8.994 0 0 0-3.724-2.24zM13.6 12.184l3.32 3.32a1 1 0 0 1-1.38-.035C14.634 14.56 13.383 14 12 14s-2.634.56-3.54 1.469a1 1 0 0 1-1.416-1.412 7.017 7.017 0 0 1 6.556-1.873zM10.348 6.104 8.626 4.38A15.043 15.043 0 0 1 12 4c4.142 0 7.894 1.68 10.608 4.394a1 1 0 0 1-1.415 1.414A12.956 12.956 0 0 0 12 6c-.56 0-1.11.035-1.652.104zM14 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
        </g>
        <path fill="#FF0B0B" fillRule="evenodd" d="M2.293 2.293a1 1 0 0 1 1.414 0l18 18a1 1 0 0 1-1.414 1.414l-18-18a1 1 0 0 1 0-1.414z" clipRule="evenodd"/>
      </svg>
    </div>
  )

  return (
    <div {...stylex.props(s.widget)}>
      <span {...stylex.props(s.icon)}>{getWeatherIcon(weather.code)}</span>
      <div {...stylex.props(s.temps)}>
        <span {...stylex.props(s.tempDay)}>{weather.max}°</span>
        <span {...stylex.props(s.tempNight)}>{weather.min}°</span>
      </div>
    </div>
  )
}
