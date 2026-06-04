import { Link } from 'react-router-dom'
import CountryFlag from './CountryFlag'
import type { Squad } from '../types'
import './TeamCard.css'

interface TeamCardProps {
  squad: Squad
}

export default function TeamCard({ squad }: TeamCardProps) {
  const playerCount = Object.values(squad.players).flat().length

  return (
    <Link to={`/teams/${encodeURIComponent(squad.country)}`} className="team-card">
      <div className="team-card-header">
        <CountryFlag country={squad.country} size="lg" />
        <div>
          <h3 className="team-card-name">{squad.country}</h3>
          <p className="team-card-meta">Group {squad.group} · {squad.confederation}</p>
        </div>
      </div>
      <div className="team-card-body">
        <div className="team-card-coach">
          <span className="label">Head Coach</span>
          <span className="value">{squad.coach}</span>
        </div>
        <div className="team-card-players">
          <span className="player-count">{playerCount}</span>
          <span className="player-label">Squad Players</span>
        </div>
      </div>
      <span className="team-card-cta">View Squad →</span>
    </Link>
  )
}
