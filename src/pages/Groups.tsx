import { useMemo, useState, type CSSProperties } from 'react'
import groupsData from '../data/wc2026_groups_and_nations.json'
import GroupCard from '../components/GroupCard'
import CountryFlag from '../components/CountryFlag'
import type { GroupsData } from '../types'
import './Groups.css'

const data = groupsData as GroupsData

const CONFEDERATION_COLORS: Record<string, string> = {
  Europe: '#3b82f6',
  'South America': '#10b981',
  Asia: '#f59e0b',
  'Asia/Oceania': '#f59e0b',
  Africa: '#ef4444',
  'North America': '#8b5cf6',
  Oceania: '#06b6d4',
  'Middle East': '#ec4899',
}

export default function Groups() {
  const [activeTab, setActiveTab] = useState<'groups' | 'nations'>('groups')
  const [confFilter, setConfFilter] = useState('All')
  const [search, setSearch] = useState('')

  const confederations = useMemo(() => {
    return ['All', ...Object.keys(data.all_qualified_nations_by_confederation).sort()]
  }, [])

  const filteredNations = useMemo(() => {
    const entries = Object.entries(data.all_qualified_nations_by_confederation)
    return entries
      .filter(([conf]) => confFilter === 'All' || conf === confFilter)
      .map(([confederation, nations]) => ({
        confederation,
        nations: nations.filter((n) =>
          !search || n.toLowerCase().includes(search.toLowerCase())
        ),
      }))
      .filter((e) => e.nations.length > 0)
  }, [confFilter, search])

  const totalNations = Object.values(data.all_qualified_nations_by_confederation).flat().length

  return (
    <div className="page groups-page">
      <header className="page-header">
        <h1>Groups & Nations</h1>
        <p>
          {data.total_teams} qualified nations across {data.total_groups} groups ·{' '}
          {data.dates}
        </p>
      </header>

      <div className="groups-stats">
        <div className="groups-stat">
          <span className="groups-stat-value">{data.total_groups}</span>
          <span>Groups</span>
        </div>
        <div className="groups-stat">
          <span className="groups-stat-value">{totalNations}</span>
          <span>Nations</span>
        </div>
        <div className="groups-stat">
          <span className="groups-stat-value">{Object.keys(data.all_qualified_nations_by_confederation).length}</span>
          <span>Confederations</span>
        </div>
        <div className="groups-stat hosts">
          {data.hosts.map((h) => (
            <span key={h} className="host-tag">
              <CountryFlag country={h} size="xs" />
              {h}
            </span>
          ))}
        </div>
      </div>

      <div className="tab-bar">
        <button
          className={`tab${activeTab === 'groups' ? ' active' : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          Group Draw
        </button>
        <button
          className={`tab${activeTab === 'nations' ? ' active' : ''}`}
          onClick={() => setActiveTab('nations')}
        >
          All Nations
        </button>
      </div>

      {activeTab === 'groups' ? (
        <div className="groups-grid">
          {data.groups.map((group) => (
            <GroupCard key={group.group} group={group} />
          ))}
        </div>
      ) : (
        <>
          <div className="filters">
            <input
              type="search"
              placeholder="Search nation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="filter-search"
            />
            <select
              value={confFilter}
              onChange={(e) => setConfFilter(e.target.value)}
              className="filter-select"
            >
              {confederations.map((c) => (
                <option key={c} value={c}>{c === 'All' ? 'All Confederations' : c}</option>
              ))}
            </select>
          </div>

          <div className="nations-by-conf">
            {filteredNations.map(({ confederation, nations }) => (
              <section key={confederation} className="conf-section">
                <header
                  className="conf-header"
                  style={{
                    '--conf-color': CONFEDERATION_COLORS[confederation] ?? '#64748b',
                  } as CSSProperties}
                >
                  <h2>{confederation}</h2>
                  <span className="conf-count">{nations.length} teams</span>
                </header>
                <div className="nation-chips">
                  {nations.map((nation) => (
                    <span key={nation} className="nation-chip">
                      <CountryFlag country={nation} size="xs" />
                      {nation}
                    </span>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
