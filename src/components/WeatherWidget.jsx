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
      <span {...stylex.props(s.icon)}>🌡️</span>
      <div {...stylex.props(s.temps)}>
        <span {...stylex.props(s.tempDay)}>—°</span>
        <span {...stylex.props(s.tempNight)}>—°</span>
      </div>
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
