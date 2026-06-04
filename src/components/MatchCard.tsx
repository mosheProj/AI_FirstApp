import CountryFlag from './CountryFlag'
import type { Match } from '../types'
import './MatchCard.css'

interface MatchCardProps {
  match: Match
  compact?: boolean
}

export default function MatchCard({ match, compact = false }: MatchCardProps) {
  const isTbd = match.home === 'TBD' || match.away === 'TBD'

  return (
    <article className={`match-card${compact ? ' compact' : ''}`}>
      <div className="match-meta">
        <span className="match-date">{match.date}</span>
        <span className="match-time">{match.time} ET</span>
        {match.group && <span className="match-group">Group {match.group}</span>}
      </div>
      <div className="match-teams">
        <div className="team-side home">
          {isTbd ? (
            <span className="team-flag-fallback">?</span>
          ) : (
            <CountryFlag country={match.home} size={compact ? 'sm' : 'md'} />
          )}
          <span className="team-name">{match.home}</span>
        </div>
        <span className="vs">VS</span>
        <div className="team-side away">
          {isTbd ? (
            <span className="team-flag-fallback">?</span>
          ) : (
            <CountryFlag country={match.away} size={compact ? 'sm' : 'md'} />
          )}
          <span className="team-name">{match.away}</span>
        </div>
      </div>
      <div className="match-venue">
        <span className="stage-badge">{match.stage}</span>
        <span className="venue-text">
          {match.venue === 'TBD' ? 'Venue TBD' : `${match.venue}, ${match.city}`}
        </span>
      </div>
    </article>
  )
}
