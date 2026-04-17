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
    padding: '6px 12px',
    marginRight: '8px',
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
        <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
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
