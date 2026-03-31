import * as stylex from '@stylexjs/stylex'

const fadeIn = stylex.keyframes({
  from: { opacity: '0', transform: 'translateY(16px)' },
  to: { opacity: '1', transform: 'translateY(0)' },
})

const s = stylex.create({
  toast: {
    position: 'fixed',
    bottom: '32px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#22c55e',
    color: '#fff',
    padding: '12px 28px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    boxShadow: '0 4px 20px rgba(34,197,94,0.35)',
    zIndex: '2000',
    animationName: fadeIn,
    animationDuration: '0.3s',
    animationTimingFunction: 'ease-out',
    whiteSpace: 'nowrap',
  },
})

export default function Toast({ message }) {
  return <div {...stylex.props(s.toast)}>{message}</div>
}
