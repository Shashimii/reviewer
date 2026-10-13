// Seconds as a clock: 1:05:09 or 4:07.
export function formatClock(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = String(s % 60).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`
}

// Seconds in words for summaries: "3 min 20 s", "45 s".
export function formatSeconds(totalSeconds: number) {
  const s = Math.round(totalSeconds)
  if (s < 60) return `${s} s`
  const m = Math.floor(s / 60)
  return s % 60 ? `${m} min ${s % 60} s` : `${m} min`
}

export function formatDate(time: number) {
  return new Date(time).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
}
