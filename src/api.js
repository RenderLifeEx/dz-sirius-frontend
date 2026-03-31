const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
const API_PREFIX = import.meta.env.VITE_API_PREFIX || ''

export async function fetchNextNotification() {
  const res = await fetch(`${BASE_URL}${API_PREFIX}/homework/next-notification`)
  if (!res.ok) throw new Error('Ошибка загрузки уведомления')
  return res.json()
}

export async function fetchAvailableDays() {
  const res = await fetch(`${BASE_URL}${API_PREFIX}/homework/available-days`)
  if (!res.ok) throw new Error('Ошибка загрузки домашнего задания')
  return res.json()
}

export async function postSendNow(code) {
  const res = await fetch(`${BASE_URL}${API_PREFIX}/homework/send-now`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })
  return res
}
