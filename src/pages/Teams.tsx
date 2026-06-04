import { useMemo, useState } from 'react'
import squadsData from '../data/wc2026_squads.json'
import TeamCard from '../components/TeamCard'
import type { SquadsData } from '../types'
import './Teams.css'

const squads = squadsData as SquadsData

export default function Teams() {
  const [search, setSearch] = useState('')
  const [groupFilter, setGroupFilter] = useState('All')

  const groups = useMemo(() => {
    const set = new Set(squads.squads.map((s) => s.group))
    return ['All', ...Array.from(set).sort()]
  }, [])

  const filtered = useMemo(() => {
    return squads.squads.filter((s) => {
      if (groupFilter !== 'All' && s.group !== groupFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          s.country.toLowerCase().includes(q) ||
          s.coach.toLowerCase().includes(q) ||
          Object.values(s.players).flat().some((p) => p.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [search, groupFilter])

  return (
    <div className="page teams-page">
      <header className="page-header">
        <h1>Teams & Squads</h1>
        <p>{squads.note}</p>
      </header>

      <div className="filters">
        <input
          type="search"
          placeholder="Search country, coach, or player..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="filter-search"
        />
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

      <div className="teams-grid">
        {filtered.map((squad) => (
          <TeamCard key={squad.country} squad={squad} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="empty-state">No teams match your search.</p>
      )}
    </div>
  )
}
