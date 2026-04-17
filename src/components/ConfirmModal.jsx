import { useState } from 'react'
import * as stylex from '@stylexjs/stylex'
import { postSendNow } from '../api.js'

const s = stylex.create({
  backdrop: {
    position: 'fixed',
    inset: '0',
    background: 'rgba(0,0,0,0.45)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '1000',
    padding: '16px',
  },
  modal: {
    background: 'var(--surface)',
    borderRadius: '20px',
    padding: '32px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: 'var(--shadow)',
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    textAlign: 'center',
    marginBottom: '20px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1.5px solid var(--border)',
    background: 'var(--bg)',
    color: 'var(--text-primary)',
    fontSize: '16px',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s',
    marginBottom: '20px',
    ':focus': {
      borderColor: 'var(--accent)',
    },
  },
  inputError: {
    borderColor: '#ef4444',
    ':focus': {
      borderColor: '#ef4444',
    },
  },
  errorText: {
    color: '#ef4444',
    fontSize: '14px',
    textAlign: 'center',
    marginTop: '-12px',
    marginBottom: '20px',
  },
  actions: {
    display: 'flex',
  },
  btnCancel: {
    flex: '1',
    padding: '12px',
    borderRadius: '12px',
    border: '1.5px solid var(--border)',
    background: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: '15px',
    fontWeight: '600',
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'background 0.2s',
    marginRight: '12px',
    ':hover': {
      background: 'var(--border)',
    },
  },
  btnSubmit: {
    flex: '1',
    padding: '12px',
    borderRadius: '12px',
    border: 'none',
    background: 'var(--accent)',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '700',
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ':hover': {
      opacity: '0.88',
    },
  },
  btnDisabled: {
    opacity: '0.6',
    cursor: 'not-allowed',
    ':hover': {
      opacity: '0.6',
    },
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    marginRight: '8px',
    animationName: stylex.keyframes({
      to: { transform: 'rotate(360deg)' },
    }),
    animationDuration: '0.7s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
})

export default function ConfirmModal({ onClose, onSuccess }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!code.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await postSendNow(code.trim())
      if (res.status === 200) {
        onSuccess('Отправлено!')
        onClose()
      } else if (res.status === 403) {
        setError('Неверный код')
      } else if (res.status === 404) {
        setError('Нет домашнего задания')
      } else {
        setError('Произошла ошибка')
      }
    } catch {
      setError('Ошибка сети')
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !loading) handleSubmit()
    if (e.key === 'Escape') onClose()
  }

  return (
    <div {...stylex.props(s.backdrop)} onClick={onClose}>
      <div {...stylex.props(s.modal)} onClick={e => e.stopPropagation()}>
        <p {...stylex.props(s.title)}>Введите слово подтверждения</p>
        <input
          {...stylex.props(s.input, error && s.inputError)}
          type="text"
          value={code}
          onChange={e => { setCode(e.target.value); setError('') }}
          onKeyDown={handleKey}
          placeholder="Код подтверждения"
          autoFocus
          disabled={loading}
        />
        {error && <p {...stylex.props(s.errorText)}>{error}</p>}
        <div {...stylex.props(s.actions)}>
          <button {...stylex.props(s.btnCancel)} onClick={onClose} disabled={loading}>
            Отмена
          </button>
          <button
            {...stylex.props(s.btnSubmit, loading && s.btnDisabled)}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading && <span {...stylex.props(s.spinner)} />}
            Отправить
          </button>
        </div>
      </div>
    </div>
  )
}
