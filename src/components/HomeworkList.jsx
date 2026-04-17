import { useEffect, useState } from 'react'
import * as stylex from '@stylexjs/stylex'
import { fetchAvailableDays } from '../api.js'

function parseDayLabel(dateStr) {
  // dateStr: "01.04.2026"
  const [dd, mm, yyyy] = dateStr.split('.')
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
  const days = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота']
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
  return `${days[date.getDay()]}, ${Number(dd)} ${months[Number(mm) - 1]} ${yyyy}`
}

const s = stylex.create({
  section: {
    display: 'flex',
    flexDirection: 'column',
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    marginBottom: '16px',
  },
  empty: {
    background: 'var(--surface)',
    borderRadius: '20px',
    padding: '32px',
    textAlign: 'center',
    color: 'var(--text-secondary)',
    fontSize: '15px',
    boxShadow: 'var(--shadow)',
  },
  dayBlock: {
    background: 'var(--surface)',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: 'var(--shadow)',
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '16px',
    ':last-child': { marginBottom: '0' },
  },
  dayHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
  },
  dayIcon: {
    fontSize: '20px',
    marginRight: '10px',
  },
  dayTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    textTransform: 'capitalize',
  },
  divider: {
    height: '1px',
    background: 'var(--border)',
    border: 'none',
    margin: '0',
    marginBottom: '16px',
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    listStyle: 'none',
  },
  taskItem: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '10px',
    ':last-child': { marginBottom: '0' },
  },
  bullet: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'var(--accent)',
    flexShrink: '0',
    marginTop: '6px',
    marginRight: '10px',
  },
  taskText: {
    fontSize: '15px',
    color: 'var(--text-primary)',
    lineHeight: '1.5',
  },
  subject: {
    fontWeight: '600',
  },
  task: {
    color: 'var(--text-secondary)',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    padding: '32px',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid var(--border)',
    borderTopColor: 'var(--accent)',
    borderRadius: '50%',
    animationName: stylex.keyframes({
      to: { transform: 'rotate(360deg)' },
    }),
    animationDuration: '0.7s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
  errorText: {
    background: 'var(--surface)',
    borderRadius: '20px',
    padding: '24px',
    color: '#ef4444',
    textAlign: 'center',
    boxShadow: 'var(--shadow)',
  },
})

export default function HomeworkList() {
  const [days, setDays] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAvailableDays()
      .then(setDays)
      .catch(e => setError(e.message))
  }, [])

  return (
    <div {...stylex.props(s.section)}>
      <span {...stylex.props(s.sectionTitle)}>Домашнее задание</span>

      {days === null && !error && (
        <div {...stylex.props(s.loading)}>
          <div {...stylex.props(s.spinner)} />
        </div>
      )}

      {error && <p {...stylex.props(s.errorText)}>{error}</p>}

      {days && days.length === 0 && (
        <div {...stylex.props(s.empty)}>Домашнее задание не найдено</div>
      )}

      {days && days.map(day => (
        <div key={day.date} {...stylex.props(s.dayBlock)}>
          <div {...stylex.props(s.dayHeader)}>
            <span {...stylex.props(s.dayIcon)}>📖</span>
            <span {...stylex.props(s.dayTitle)}>{parseDayLabel(day.date)}</span>
          </div>
          <hr {...stylex.props(s.divider)} />
          <ul {...stylex.props(s.taskList)}>
            {day.homework.map((hw, i) => (
              <li key={i} {...stylex.props(s.taskItem)}>
                <span {...stylex.props(s.bullet)} />
                <span {...stylex.props(s.taskText)}>
                  <span {...stylex.props(s.subject)}>{hw.subject}</span>
                  {' — '}
                  <span {...stylex.props(s.task)}>{hw.task}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
