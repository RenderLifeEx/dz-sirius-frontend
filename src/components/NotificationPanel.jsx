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

function formatTimeLeft(msLeft) {
  if (msLeft <= 0) return 'уже отправляется'
  const totalSec = Math.floor(msLeft / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h} ч ${m} мин`
  if (m > 0) return `${m} мин ${s} сек`
  return `${s} сек`
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
  },
  labelRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
  },
  pollSpinner: {
    width: '14px',
    height: '14px',
    border: '2px solid var(--border)',
    borderTopColor: 'var(--accent)',
    borderRadius: '50%',
    animationName: stylex.keyframes({
      to: { transform: 'rotate(360deg)' },
    }),
    animationDuration: '0.8s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
  dateRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
  },
  calIcon: {
    fontSize: '22px',
    flexShrink: '0',
    marginRight: '10px',
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
    marginBottom: '8px',
  },
  timeLeft: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginBottom: '16px',
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
  const [timeLeft, setTimeLeft] = useState(null)
  const [polling, setPolling] = useState(false)
  const timerRef = useRef(null)
  const tickRef = useRef(null)

  async function poll() {
    setPolling(true)
    const [result] = await Promise.allSettled([
      fetchNextNotification(),
      new Promise(resolve => setTimeout(resolve, 3000)),
    ])
    if (result.status === 'fulfilled') {
      setScheduledAt(result.value.scheduledAt || null)
      setError(null)
    } else {
      setError(result.reason.message)
    }
    setPolling(false)
  }

  useEffect(() => {
    poll()
    timerRef.current = setInterval(poll, POLL_INTERVAL_MS)
    return () => clearInterval(timerRef.current)
  }, [])

  // Update progress bar every second
  useEffect(() => {
    clearInterval(tickRef.current)
    if (!scheduledAt) { setProgress(0); setTimeLeft(null); return }

    function tick() {
      const target = parseScheduledAt(scheduledAt)
      const now = Date.now()
      const msLeft = target.getTime() - now
      const startOfDay = new Date(target)
      startOfDay.setHours(0, 0, 0, 0)
      const totalMs = target.getTime() - startOfDay.getTime()
      if (totalMs <= 0) { setProgress(1); setTimeLeft('уже отправляется'); return }
      const pct = Math.min(1, Math.max(0, 1 - msLeft / totalMs))
      setProgress(pct)
      setTimeLeft(formatTimeLeft(msLeft))
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
        <div {...stylex.props(s.labelRow)}>
          <span {...stylex.props(s.label)}>Следующая отправка</span>
          {polling && <span {...stylex.props(s.pollSpinner)} />}
        </div>

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

        {timeLeft && (
          <span {...stylex.props(s.timeLeft)}>осталось {timeLeft}</span>
        )}

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
