import CountryFlag from './CountryFlag'
import type { Group } from '../types'
import './GroupCard.css'

interface GroupCardProps {
  group: Group
}

export default function GroupCard({ group }: GroupCardProps) {
  return (
    <article className="group-card">
      <header className="group-header">
        <span className="group-letter">Group {group.group}</span>
      </header>
      <ul className="group-teams">
        {group.teams.map((team) => (
          <li key={team.name} className="group-team">
            <CountryFlag country={team.name} size="sm" />
            <div className="group-team-info">
              <span className="group-team-name">
                {team.name}
                {team.host && <span className="host-badge">HOST</span>}
              </span>
              <span className="group-team-conf">{team.confederation}</span>
            </div>
          </li>
        ))}
      </ul>
    </article>
  )
}
