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
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 682.667 682.667" fill="none" stroke="var(--text-secondary)" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round">
        <defs>
          <clipPath id="nw-a" clipPathUnits="userSpaceOnUse"><path d="M0 512h512V0H0Z"/></clipPath>
          <clipPath id="nw-b" clipPathUnits="userSpaceOnUse"><path d="M0 512h512V0H0Z"/></clipPath>
        </defs>
        <g clipPath="url(#nw-a)" transform="matrix(1.33333 0 0 -1.33333 0 682.667)">
          <path d="M0 0h-16.067" transform="translate(63.2 336.334)"/>
          <path d="M0 0h16.067" transform="translate(448.8 175.667)"/>
          <path d="M0 0v16.067" transform="translate(175.667 448.8)"/>
          <path d="M0 0v-16.067" transform="translate(336.334 63.2)"/>
        </g>
        <path d="m0 0-11.327 11.361" transform="matrix(1.33333 0 0 -1.33333 128.182 128.187)"/>
        <path d="m0 0 11.327-11.361" transform="matrix(1.33333 0 0 -1.33333 554.485 554.48)"/>
        <g clipPath="url(#nw-b)" transform="matrix(1.33333 0 0 -1.33333 0 682.667)">
          <path d="M0 0a32.127 32.127 0 0 1 9.399 22.722A32.129 32.129 0 0 1 0 45.444a32.177 32.177 0 0 1-22.734 9.411 32.177 32.177 0 0 1-22.735-9.411A425146.53 425146.53 0 0 1-90.938 0l45.469-45.443S-19.842-19.826 0 0z" transform="translate(221.939 267.36)"/>
          <path d="M0 0a32.127 32.127 0 0 1 9.399 22.722A32.129 32.129 0 0 1 0 45.444a32.175 32.175 0 0 1-22.734 9.411 32.177 32.177 0 0 1-22.734-9.411C-65.231 25.617-90.856 0-90.856 0l45.388-45.443S-19.842-19.826 0 0z" transform="translate(312.795 176.474)"/>
          <path d="m0 0-159.059 159.052s-15.746-15.72-34.062-34.083c-31.41-31.372-31.41-82.237 0-113.608a23993.249 23993.249 0 0 0 45.388-45.444c31.411-31.372 82.262-31.372 113.672 0C-15.745-15.719 0 0 0 0Z" transform="translate(278.734 119.67)"/>
          <path d="m0 0-159.059 159.052s15.745 15.719 34.061 34.082c31.41 31.373 82.261 31.373 113.672 0a24292.528 24292.528 0 0 1 45.388-45.443c31.41-31.372 31.41-82.236 0-113.608C15.746 15.719 0 0 0 0Z" transform="translate(392.325 233.278)"/>
          <path d="m0 0-45.388 45.444-70.613-70.588 45.469-45.443z" transform="translate(131.001 85.587)"/>
          <path d="m0 0-45.469 45.443-70.532-70.588 45.388-45.442z" transform="translate(497 451.557)"/>
        </g>
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
