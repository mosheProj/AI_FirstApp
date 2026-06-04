import { Link, useParams } from 'react-router-dom'
import type { CSSProperties } from 'react'
import CountryFlag from '../components/CountryFlag'
import squadsData from '../data/wc2026_squads.json'
import {
  POSITION_LABELS,
  POSITION_COLORS,
  type PositionKey,
  type SquadsData,
} from '../types'
import './TeamDetail.css'

const squads = squadsData as SquadsData
const positions: PositionKey[] = ['GK', 'DEF', 'MID', 'FWD']

export default function TeamDetail() {
  const { country } = useParams<{ country: string }>()
  const squad = squads.squads.find((s) => s.country === decodeURIComponent(country ?? ''))

  if (!squad) {
    return (
      <div className="page">
        <div className="not-found">
          <h1>Team Not Found</h1>
          <p>Squad data is not available for this nation yet.</p>
          <Link to="/teams" className="btn btn-primary">Back to Teams</Link>
        </div>
      </div>
    )
  }

  const totalPlayers = Object.values(squad.players).flat().length

  return (
    <div className="page team-detail-page">
      <Link to="/teams" className="back-link">← All Teams</Link>

      <header className="team-hero">
        <CountryFlag country={squad.country} size="xl" className="team-hero-flag" />
        <div className="team-hero-info">
          <h1>{squad.country}</h1>
          <div className="team-hero-tags">
            <span className="tag">Group {squad.group}</span>
            <span className="tag">{squad.confederation}</span>
            <span className="tag">{totalPlayers} Players</span>
          </div>
          <p className="team-coach">
            <span className="coach-label">Head Coach</span>
            {squad.coach}
          </p>
        </div>
      </header>

      <div className="squad-grid">
        {positions.map((pos) => (
          <section key={pos} className="position-section">
            <header
              className="position-header"
              style={{ '--pos-color': POSITION_COLORS[pos] } as CSSProperties}
            >
              <span className="position-abbr">{pos}</span>
              <span className="position-name">{POSITION_LABELS[pos]}</span>
              <span className="position-count">{squad.players[pos].length}</span>
            </header>
            <ul className="player-list">
              {squad.players[pos].map((player) => (
                <li key={player} className="player-item">
                  <span
                    className="player-dot"
                    style={{ background: POSITION_COLORS[pos] }}
                  />
                  {player}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
