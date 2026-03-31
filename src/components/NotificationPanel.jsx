import { useEffect, useRef, useState } from 'react'
import * as stylex from '@stylexjs/stylex'
import { fetchNextNotification } from '../api.js'
import ConfirmModal from './ConfirmModal.jsx'
import Toast from './Toast.jsx'

const POLL_INTERVAL_MS = 10_000

function parseScheduledAt(str) {
  // "2026-04-02T17:30:00" or ISO string
  return new Date(str)
}

function formatDate(date) {
  const days = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']
  const day = days[date.getDay()]
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${day} ${dd}.${mm} в ${hh}:${min}`
}

function getProgressColor(pct) {
  // 0% green → 50% yellow → 75% orange → 100% red
  if (pct < 0.5) {
    // green → yellow
    const t = pct / 0.5
    const r = Math.round(34 + (234 - 34) * t)
    const g = Math.round(197 + (179 - 197) * t)
    const b = Math.round(94 + (8 - 94) * t)
    return `rgb(${r},${g},${b})`
  } else if (pct < 0.75) {
    // yellow → orange
    const t = (pct - 0.5) / 0.25
    const r = Math.round(234 + (249 - 234) * t)
    const g = Math.round(179 + (115 - 179) * t)
    const b = Math.round(8 + (22 - 8) * t)
    return `rgb(${r},${g},${b})`
  } else {
    // orange → red
    const t = (pct - 0.75) / 0.25
    const r = Math.round(249 + (239 - 249) * t)
    const g = Math.round(115 + (68 - 115) * t)
    const b = Math.round(22 + (68 - 22) * t)
    return `rgb(${r},${g},${b})`
  }
}

const s = stylex.create({
  panel: {
    background: 'var(--surface)',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: 'var(--shadow)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
  },
  dateRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  calIcon: {
    fontSize: '22px',
    flexShrink: '0',
  },
  dateText: {
    fontSize: '17px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  barTrack: {
    width: '100%',
    height: '10px',
    borderRadius: '99px',
    background: 'var(--border)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: '99px',
    transition: 'width 1s linear, background-color 1s linear',
  },
  btnSend: {
    alignSelf: 'flex-end',
    padding: '11px 24px',
    borderRadius: '12px',
    border: 'none',
    background: 'var(--accent)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '700',
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    ':hover': {
      opacity: '0.88',
    },
  },
  errorText: {
    color: '#ef4444',
    fontSize: '14px',
  },
})

export default function NotificationPanel() {
  const [scheduledAt, setScheduledAt] = useState(null)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState(null)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef(null)
  const tickRef = useRef(null)

  async function poll() {
    try {
      const data = await fetchNextNotification()
      setScheduledAt(data.scheduledAt || null)
      setError(null)
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => {
    poll()
    timerRef.current = setInterval(poll, POLL_INTERVAL_MS)
    return () => clearInterval(timerRef.current)
  }, [])

  // Update progress bar every second
  useEffect(() => {
    clearInterval(tickRef.current)
    if (!scheduledAt) { setProgress(0); return }

    function tick() {
      const target = parseScheduledAt(scheduledAt)
      const now = Date.now()
      const msLeft = target.getTime() - now
      // totalMs = time from start of the day to scheduledAt
      const startOfDay = new Date(target)
      startOfDay.setHours(0, 0, 0, 0)
      const totalMs = target.getTime() - startOfDay.getTime()
      if (totalMs <= 0) { setProgress(1); return }
      const pct = Math.min(1, Math.max(0, 1 - msLeft / totalMs))
      setProgress(pct)
    }

    tick()
    tickRef.current = setInterval(tick, 1000)
    return () => clearInterval(tickRef.current)
  }, [scheduledAt])

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const target = scheduledAt ? parseScheduledAt(scheduledAt) : null
  const pct = Math.round(progress * 100)
  const color = getProgressColor(progress)

  return (
    <>
      <div {...stylex.props(s.panel)}>
        <span {...stylex.props(s.label)}>Следующая отправка</span>

        {error && <p {...stylex.props(s.errorText)}>{error}</p>}

        <div {...stylex.props(s.dateRow)}>
          <span {...stylex.props(s.calIcon)}>📅</span>
          <span {...stylex.props(s.dateText)}>
            {target ? formatDate(target) : 'Отправка не запланирована'}
          </span>
        </div>

        <div {...stylex.props(s.barTrack)}>
          <div
            {...stylex.props(s.barFill)}
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>

        <button {...stylex.props(s.btnSend)} onClick={() => setShowModal(true)}>
          Отправить сейчас
        </button>
      </div>

      {showModal && (
        <ConfirmModal
          onClose={() => setShowModal(false)}
          onSuccess={showToast}
        />
      )}

      {toast && <Toast message={toast} />}
    </>
  )
}
