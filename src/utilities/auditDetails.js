export function getAuditDetails(oldData, newData) {
  const IGNORED_KEYS = [
    'created_at',
    'created_by',
    'updated_at',
    'updated_by',
    'opportunities_id',
    'opportunity_id',
  ]

  const changes = {}
  const keys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})])

  const normalize = (val) => {
    if (val === '' || val === undefined) return null
    if (typeof val === 'string' && !isNaN(val)) return Number(val)
    return val
  }

  for (const key of keys) {
    if (IGNORED_KEYS.includes(key)) continue

    const oldVal = normalize(oldData[key])
    const newVal = normalize(newData[key])

    // Ignore "emptying" changes: old has value, new is null/empty
    if (oldVal !== null && newVal === null) continue

    // Ignore system-generated fields (old undefined, new has value)
    if (oldVal === null && newVal !== null) continue

    // Ignore identical values
    if (oldVal === newVal) continue

    // Handle details specially
    if (key === 'details') {
      const dOld = oldVal?.[0] || {}
      const dNew = newVal?.[0] || {}
      const detailChanges = {}

      for (const dKey of Object.keys(dOld)) {
        if (IGNORED_KEYS.includes(dKey)) continue
        const o = normalize(dOld[dKey])
        const n = normalize(dNew[dKey])

        // ignore emptying
        if (o !== null && n === null) continue

        if (o === n) continue
        detailChanges[dKey] = [o, n]
      }

      if (Object.keys(detailChanges).length > 0) changes.details = detailChanges
      continue
    }

    changes[key] = [oldVal, newVal]
  }

  if (Object.keys(changes).length === 0) return ''

  // Format output
  let out = ''

  for (const [key, value] of Object.entries(changes)) {
    if (key === 'details') continue
    const [o, n] = value
    out += `${key}: ${o} → ${n}\n`
  }

  if (changes.details) {
    out += `Details Changed:\n`
    for (const [dKey, [o, n]] of Object.entries(changes.details)) {
      out += `  ${dKey}: ${o} → ${n}\n`
    }
  }

  return out.trim()
}
