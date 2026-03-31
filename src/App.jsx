import * as stylex from '@stylexjs/stylex'
import { ThemeContext, useThemeProvider } from './theme.js'
import ThemeToggle from './components/ThemeToggle.jsx'
import NotificationPanel from './components/NotificationPanel.jsx'
import HomeworkList from './components/HomeworkList.jsx'

const s = stylex.create({
  layout: {
    minHeight: '100vh',
    padding: '24px 16px 48px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: '800px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '8px',
  },
  titleGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  eyebrow: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--accent)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    lineHeight: '1.2',
  },
})

export default function App() {
  const themeValue = useThemeProvider()

  return (
    <ThemeContext.Provider value={themeValue}>
      <div {...stylex.props(s.layout)}>
        <div {...stylex.props(s.container)}>
          <header {...stylex.props(s.header)}>
            <div {...stylex.props(s.titleGroup)}>
              <span {...stylex.props(s.eyebrow)}>3Л класс</span>
              <h1 {...stylex.props(s.title)}>Домашнее задание</h1>
            </div>
            <ThemeToggle />
          </header>

          <NotificationPanel />
          <HomeworkList />
        </div>
      </div>
    </ThemeContext.Provider>
  )
}
