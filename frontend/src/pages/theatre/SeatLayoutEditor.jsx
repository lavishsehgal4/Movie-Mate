import { useState, useReducer } from 'react'
import './SeatLayoutEditor.css'

const MIN_ROWS = 12
const MIN_COLS = 20

const SEAT_TYPES = [
  { id: 'STANDARD',    label: 'Standard',    color: '#E8895B' },
  { id: 'PREMIUM',     label: 'Premium',     color: '#7c6af7' },
  { id: 'RECLINER',    label: 'Recliner',    color: '#06b6d4' },
  { id: 'VIP',         label: 'VIP',         color: '#f59e0b' },
  { id: 'WHEELCHAIR',  label: 'Wheelchair',  color: '#4ade80' },
]

const TYPE_COLOR = Object.fromEntries(SEAT_TYPES.map(t => [t.id, t.color]))

// ── helpers ──────────────────────────────────────────────
function makeRow(rowNumber, cols, defaultType = 'STANDARD') {
  return {
    rowNumber,
    rowName: '',
    hasSeats: false,
    hasText: false,
    text: '',
    rowSeatType: defaultType,
    seats: Array.from({ length: cols }, (_, i) => ({
      position: i + 1,
      displayNumber: 0,
      type: 0,
      seat_type: defaultType,
    })),
  }
}

function makeInitialState(rows = MIN_ROWS, cols = MIN_COLS, existing = null) {
  if (existing?.rows) {
    const loadedRows = existing.rows.map(r => ({
      ...r,
      rowSeatType: r.rowSeatType || (r.seats?.[0]?.seat_type) || 'STANDARD',
      seats: (r.seats || []).map(s => ({ ...s, seat_type: s.seat_type || 'STANDARD' })),
    }))
    return { gridRows: existing.gridRows || rows, gridCols: existing.gridCols || cols, rows: loadedRows }
  }
  return {
    gridRows: rows,
    gridCols: cols,
    rows: Array.from({ length: rows }, (_, i) => makeRow(i + 1, cols)),
  }
}

// ── reducer ───────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {

    case 'RESET':
      return makeInitialState()

    case 'ADD_ROW': {
      const r = makeRow(state.gridRows + 1, state.gridCols)
      return { ...state, gridRows: state.gridRows + 1, rows: [...state.rows, r] }
    }

    case 'REMOVE_ROW': {
      if (state.gridRows <= MIN_ROWS) return state
      return { ...state, gridRows: state.gridRows - 1, rows: state.rows.slice(0, -1).map((r, i) => ({ ...r, rowNumber: i + 1 })) }
    }

    case 'ADD_COL': {
      const rows = state.rows.map(r => ({
        ...r,
        seats: [...r.seats, { position: state.gridCols + 1, displayNumber: 0, type: 0, seat_type: r.rowSeatType }],
      }))
      return { ...state, gridCols: state.gridCols + 1, rows }
    }

    case 'REMOVE_COL': {
      if (state.gridCols <= MIN_COLS) return state
      return { ...state, gridCols: state.gridCols - 1, rows: state.rows.map(r => ({ ...r, seats: r.seats.slice(0, -1) })) }
    }

    case 'SET_ROW_TYPE': {
      return {
        ...state,
        rows: state.rows.map((r, i) => i !== action.rowIndex ? r : {
          ...r,
          hasSeats: action.rowType === 'seat',
          hasText:  action.rowType === 'text',
          rowName:  action.rowType === 'seat' ? r.rowName : '',
          text:     action.rowType === 'text' ? r.text    : '',
        }),
      }
    }

    case 'SET_ROW_NAME':
      return { ...state, rows: state.rows.map((r, i) => i === action.rowIndex ? { ...r, rowName: action.value } : r) }

    case 'SET_ROW_TEXT':
      return { ...state, rows: state.rows.map((r, i) => i === action.rowIndex ? { ...r, text: action.value } : r) }

    // set seat type for entire row — also updates all existing seats in that row
    case 'SET_ROW_SEAT_TYPE': {
      return {
        ...state,
        rows: state.rows.map((r, i) => i !== action.rowIndex ? r : {
          ...r,
          rowSeatType: action.value,
          seats: r.seats.map(s => ({ ...s, seat_type: action.value })),
        }),
      }
    }

    // mark gap as seat (uses row's seat type)
    case 'MARK_SEAT': {
      const { rowIndex, colIndex } = action
      return {
        ...state,
        rows: state.rows.map((r, ri) => ri !== rowIndex ? r : {
          ...r,
          seats: r.seats.map((s, ci) => ci !== colIndex || s.type === 1 ? s : {
            ...s, type: 1, displayNumber: ci + 1, seat_type: r.rowSeatType,
          }),
        }),
      }
    }

    // remove seat → back to gap
    case 'REMOVE_SEAT': {
      const { rowIndex, colIndex } = action
      return {
        ...state,
        rows: state.rows.map((r, ri) => ri !== rowIndex ? r : {
          ...r,
          seats: r.seats.map((s, ci) => ci !== colIndex ? s : { ...s, type: 0, displayNumber: 0 }),
        }),
      }
    }

    case 'SET_DISPLAY_NUM': {
      return {
        ...state,
        rows: state.rows.map((r, ri) => ri !== action.rowIndex ? r : {
          ...r,
          seats: r.seats.map((s, ci) => ci !== action.colIndex ? s : { ...s, displayNumber: Number(action.value) || 0 }),
        }),
      }
    }

    case 'SET_SEAT_TYPE': {
      return {
        ...state,
        rows: state.rows.map((r, ri) => ri !== action.rowIndex ? r : {
          ...r,
          seats: r.seats.map((s, ci) => ci !== action.colIndex ? s : { ...s, seat_type: action.value }),
        }),
      }
    }

    default: return state
  }
}

// ── main component ────────────────────────────────────────
export default function SeatLayoutEditor({ screenName = 'Screen', existingLayout = null, onSave, onBack }) {
  const [state,    dispatch] = useReducer(reducer, null, () => makeInitialState(MIN_ROWS, MIN_COLS, existingLayout))
  const [mode,     setMode]  = useState('edit')
  const [popup,    setPopup] = useState(null)   // { rowIndex, colIndex }
  const [jsonOut,  setJsonOut] = useState(null)

  const totalSeats = state.rows.reduce((a, r) => a + r.seats.filter(s => s.type === 1).length, 0)

  const buildJSON = () => {
    const out = {
      gridRows: state.gridRows,
      gridCols: state.gridCols,
      rows: state.rows.map(r => ({
        rowNumber: r.rowNumber,
        rowName:   r.rowName,
        hasSeats:  r.hasSeats,
        hasText:   r.hasText,
        text:      r.text,
        seats:     r.hasSeats ? r.seats : [],
      })),
    }
    setJsonOut(JSON.stringify(out, null, 2))
    setMode('json')
  }

  // preview: trim empty edge cols
  const activeCols = (() => {
    const seatRows = state.rows.filter(r => r.hasSeats)
    if (!seatRows.length) return { start: 0, end: state.gridCols - 1 }
    let start = state.gridCols, end = -1
    seatRows.forEach(r => r.seats.forEach((s, ci) => {
      if (s.type === 1) { start = Math.min(start, ci); end = Math.max(end, ci) }
    }))
    return end === -1 ? { start: 0, end: state.gridCols - 1 } : { start, end }
  })()

  // row summary data
  const rowSummaries = state.rows
    .filter(r => r.hasSeats)
    .map(r => {
      const seats = r.seats.filter(s => s.type === 1)
      const byType = {}
      seats.forEach(s => {
        if (!byType[s.seat_type]) byType[s.seat_type] = []
        byType[s.seat_type].push(s.displayNumber)
      })
      return { rowName: r.rowName || `Row ${r.rowNumber}`, total: seats.length, byType }
    })
    .filter(r => r.total > 0)

  if (mode === 'json') {
    return (
      <div className="sle-root">
        <div className="sle-topbar">
          <span className="sle-screen-name">{screenName} — Layout JSON</span>
          <div className="sle-topbar-right">
            <button className="sle-btn secondary" onClick={() => setMode('edit')}>← Edit Again</button>
            <button className="sle-btn primary" onClick={() => onSave && onSave(jsonOut)}>Save to Database</button>
          </div>
        </div>
        <div className="sle-json-wrap"><pre className="sle-json">{jsonOut}</pre></div>
      </div>
    )
  }

  return (
    <div className="sle-root" onClick={() => setPopup(null)}>

      {/* ── TOP BAR ── */}
      <div className="sle-topbar">
        <div className="sle-topbar-left">
          {onBack && <button className="sle-btn ghost" onClick={onBack}>← Back</button>}
          <span className="sle-screen-name">{screenName}</span>
          <span className="sle-mode-tag">{mode === 'edit' ? 'Edit Mode' : 'Preview'}</span>
        </div>
        <div className="sle-topbar-right">
          {mode === 'edit' && (
            <>
              <div className="sle-grid-controls">
                <div className="sle-ctrl-group">
                  <span>Rows</span>
                  <button onClick={() => dispatch({ type: 'REMOVE_ROW' })} disabled={state.gridRows <= MIN_ROWS}>−</button>
                  <span className="sle-ctrl-val">{state.gridRows}</span>
                  <button onClick={() => dispatch({ type: 'ADD_ROW' })}>+</button>
                </div>
                <div className="sle-ctrl-group">
                  <span>Cols</span>
                  <button onClick={() => dispatch({ type: 'REMOVE_COL' })} disabled={state.gridCols <= MIN_COLS}>−</button>
                  <span className="sle-ctrl-val">{state.gridCols}</span>
                  <button onClick={() => dispatch({ type: 'ADD_COL' })}>+</button>
                </div>
              </div>
              <button className="sle-btn danger" onClick={() => { if (window.confirm('Reset entire layout?')) dispatch({ type: 'RESET' }) }}>Reset</button>
            </>
          )}
          <button className="sle-btn secondary" onClick={() => setMode(m => m === 'edit' ? 'preview' : 'edit')}>
            {mode === 'edit' ? '👁 Preview' : '✏️ Edit'}
          </button>
          <button className="sle-btn primary" onClick={buildJSON}>Save Layout</button>
        </div>
      </div>

      {/* ── SEAT TYPE PALETTE ── */}
      {mode === 'edit' && (
        <div className="sle-palette">
          <span className="sle-palette-label">SEAT TYPES:</span>
          {SEAT_TYPES.map(t => (
            <div key={t.id} className="sle-palette-chip" style={{ '--chip-color': t.color }}>
              <span className="sle-palette-dot" style={{ background: t.color }} />
              {t.label}
            </div>
          ))}
          <span className="sle-palette-sep" />
          <span className="sle-palette-hint">Click gap → add seat · Click seat → edit · Set row type to apply to whole row</span>
          <span className="sle-seat-count">{totalSeats} seats total</span>
        </div>
      )}

      {/* ── GRID ── */}
      <div className="sle-grid-wrap">
        <div className={`sle-grid ${mode}`}>
          {state.rows.map((row, ri) => {
            const rowType = row.hasSeats ? 'seat' : row.hasText ? 'text' : 'empty'

            if (mode === 'preview') {
              if (rowType === 'empty') return <div key={ri} className="sle-row-empty-preview" />
              if (rowType === 'text')  return <div key={ri} className="sle-row-text-preview"><span>{row.text}</span></div>
              const vis = row.seats.slice(activeCols.start, activeCols.end + 1)
              return (
                <div key={ri} className="sle-row-preview">
                  <span className="sle-rowname-preview">{row.rowName}</span>
                  <div className="sle-seats-preview">
                    {vis.map((s, ci) =>
                      s.type === 1
                        ? <div key={ci} className="sle-seat-preview" style={{ background: TYPE_COLOR[s.seat_type] }}>{s.displayNumber || ''}</div>
                        : <div key={ci} className="sle-gap-preview" />
                    )}
                  </div>
                </div>
              )
            }

            // ── EDIT ROW ──
            return (
              <div key={ri} className="sle-row-edit">
                <div className="sle-row-meta">
                  <select className="sle-type-select" value={rowType}
                    onChange={e => dispatch({ type: 'SET_ROW_TYPE', rowIndex: ri, rowType: e.target.value })}>
                    <option value="seat">Seat Row</option>
                    <option value="text">Text Row</option>
                    <option value="empty">Empty Row</option>
                  </select>
                  {rowType === 'seat' && (
                    <>
                      <input className="sle-rowname-input" placeholder="A" value={row.rowName} maxLength={4}
                        onChange={e => dispatch({ type: 'SET_ROW_NAME', rowIndex: ri, value: e.target.value })} />
                      {/* row-level seat type */}
                      <select
                        className="sle-row-type-select"
                        value={row.rowSeatType}
                        style={{ borderColor: TYPE_COLOR[row.rowSeatType] + '66', color: TYPE_COLOR[row.rowSeatType] }}
                        onChange={e => dispatch({ type: 'SET_ROW_SEAT_TYPE', rowIndex: ri, value: e.target.value })}
                        title="Set seat type for entire row"
                      >
                        {SEAT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                      </select>
                    </>
                  )}
                </div>

                <div className="sle-row-content">
                  {rowType === 'seat' && (
                    <div className="sle-seats-edit" style={{ gridTemplateColumns: `repeat(${state.gridCols}, 1fr)` }}>
                      {row.seats.map((s, ci) => {
                        const isOpen = popup?.rowIndex === ri && popup?.colIndex === ci
                        const color  = TYPE_COLOR[s.seat_type] || '#E8895B'
                        return (
                          <div key={ci} className={`sle-cell ${s.type === 1 ? 'seat' : 'gap'}`}
                            style={s.type === 1 ? { background: color, borderColor: color } : {}}
                            onClick={e => {
                              e.stopPropagation()
                              if (s.type === 0) {
                                dispatch({ type: 'MARK_SEAT', rowIndex: ri, colIndex: ci })
                              } else {
                                setPopup(isOpen ? null : { rowIndex: ri, colIndex: ci })
                              }
                            }}
                          >
                            {s.type === 1 && <span>{s.displayNumber || '?'}</span>}

                            {/* popup */}
                            {isOpen && (
                              <div className="sle-popup" onClick={e => e.stopPropagation()}>
                                <div className="sle-popup-row">
                                  <label>Seat #</label>
                                  <input type="number" className="sle-popup-num" value={s.displayNumber || ''}
                                    autoFocus
                                    onChange={e => dispatch({ type: 'SET_DISPLAY_NUM', rowIndex: ri, colIndex: ci, value: e.target.value })}
                                    onKeyDown={e => e.key === 'Escape' && setPopup(null)}
                                  />
                                </div>
                                <div className="sle-popup-row">
                                  <label>Type</label>
                                  <select className="sle-popup-type"
                                    value={s.seat_type}
                                    onChange={e => dispatch({ type: 'SET_SEAT_TYPE', rowIndex: ri, colIndex: ci, value: e.target.value })}
                                  >
                                    {SEAT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                  </select>
                                </div>
                                <button className="sle-popup-remove"
                                  onClick={() => { dispatch({ type: 'REMOVE_SEAT', rowIndex: ri, colIndex: ci }); setPopup(null) }}>
                                  ✕ Remove seat (make gap)
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                  {rowType === 'text' && (
                    <input className="sle-text-input" placeholder="e.g. RECLINER SEATS, VIP SECTION"
                      value={row.text} onChange={e => dispatch({ type: 'SET_ROW_TEXT', rowIndex: ri, value: e.target.value })} />
                  )}
                  {rowType === 'empty' && <div className="sle-empty-row" />}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── SCREEN LABEL ── */}
      <div className="sle-screen-label">
        <div className="sle-screen-bar">SCREEN</div>
      </div>

      {/* ── ROW SUMMARY ── */}
      {mode === 'edit' && rowSummaries.length > 0 && (
        <div className="sle-summary">
          <p className="sle-summary-title">LAYOUT SUMMARY — ROW BREAKDOWN</p>
          <div className="sle-summary-grid">
            {rowSummaries.map((r, i) => (
              <div key={i} className="sle-summary-row">
                <div className="sle-summary-row-header">
                  <span className="sle-summary-rowname">Row {r.rowName}</span>
                  <span className="sle-summary-total">{r.total} seats</span>
                </div>
                <div className="sle-summary-types">
                  {Object.entries(r.byType).map(([type, nums]) => (
                    <div key={type} className="sle-summary-type-block">
                      <span className="sle-summary-type-dot" style={{ background: TYPE_COLOR[type] }} />
                      <span className="sle-summary-type-name">{type}</span>
                      <span className="sle-summary-type-count">×{nums.length}</span>
                      <span className="sle-summary-type-nums">
                        [{nums.sort((a,b) => a-b).join(', ')}]
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
