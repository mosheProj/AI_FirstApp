import { useMemo, useState } from 'react'
import scheduleData from '../data/wc2026_schedule.json'
import MatchCard from '../components/MatchCard'
import type { Match, ScheduleData } from '../types'
import './Schedule.css'

const schedule = scheduleData as ScheduleData

const STAGES = [
  'All',
  'Group Stage',
  'Round of 32',
  'Round of 16',
  'Quarterfinals',
  'Semifinal 1',
  'Semifinal 2',
  'Third-Place Match',
  'Final',
] as const

type StageFilter = (typeof STAGES)[number]

function groupByDate(matches: Match[]): Map<string, Match[]> {
  const map = new Map<string, Match[]>()
  for (const m of matches) {
    const existing = map.get(m.date) ?? []
    existing.push(m)
    map.set(m.date, existing)
  }
  return map
}

export default function Schedule() {
  const [stageFilter, setStageFilter] = useState<StageFilter>('All')
  const [groupFilter, setGroupFilter] = useState<string>('All')
  const [search, setSearch] = useState('')

  const groups = useMemo(() => {
    const set = new Set<string>()
    schedule.schedule.forEach((m) => {
      if (m.group) set.add(m.group)
    })
    return ['All', ...Array.from(set).sort()]
  }, [])

  const filtered = useMemo(() => {
    return schedule.schedule.filter((m) => {
      if (stageFilter !== 'All' && m.stage !== stageFilter) return false
      if (groupFilter !== 'All' && m.group !== groupFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          m.home.toLowerCase().includes(q) ||
          m.away.toLowerCase().includes(q) ||
          m.city.toLowerCase().includes(q) ||
          m.venue.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [stageFilter, groupFilter, search])

  const byDate = useMemo(() => groupByDate(filtered), [filtered])

  return (
    <div className="page schedule-page">
      <header className="page-header">
        <h1>Match Schedule</h1>
        <p>{schedule.dates} · {schedule.time_zone_note}</p>
      </header>

      <div className="schedule-stats">
        <div className="schedule-stat">
          <span className="schedule-stat-value">{schedule.total_matches}</span>
          <span>Total Matches</span>
        </div>
        <div className="schedule-stat">
          <span className="schedule-stat-value">{filtered.length}</span>
          <span>Showing</span>
        </div>
        <div className="schedule-stat">
          <span className="schedule-stat-value">{schedule.total_stadiums}</span>
          <span>Stadiums</span>
        </div>
      </div>

      <div className="filters">
        <input
          type="search"
          placeholder="Search teams, cities, venues..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="filter-search"
        />
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value as StageFilter)}
          className="filter-select"
        >
          {STAGES.map((s) => (
            <option key={s} value={s}>{s === 'All' ? 'All Stages' : s}</option>
          ))}
        </select>
        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="filter-select"
        >
          {groups.map((g) => (
            <option key={g} value={g}>{g === 'All' ? 'All Groups' : `Group ${g}`}</option>
          ))}
        </select>
      </div>

      <div className="schedule-timeline">
        {Array.from(byDate.entries()).map(([date, matches]) => (
          <section key={date} className="date-section">
            <h2 className="date-heading">{date}</h2>
            <div className="date-matches">
              {matches.map((match, i) => (
                <MatchCard
                  key={`${match.match_day}-${i}`}
                  match={match}
                />
              ))}
            </div>
          </section>
        ))}
        {filtered.length === 0 && (
          <p className="empty-state">No matches match your filters.</p>
        )}
      </div>
    </div>
  )
}
