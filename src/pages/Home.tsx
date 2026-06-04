import { Link } from 'react-router-dom'
import scheduleData from '../data/wc2026_schedule.json'
import groupsData from '../data/wc2026_groups_and_nations.json'
import squadsData from '../data/wc2026_squads.json'
import MatchCard from '../components/MatchCard'
import CountryFlag from '../components/CountryFlag'
import type { ScheduleData, GroupsData, SquadsData } from '../types'
import './Home.css'

const schedule = scheduleData as ScheduleData
const groups = groupsData as GroupsData
const squads = squadsData as SquadsData

const upcomingMatches = schedule.schedule
  .filter((m) => m.home !== 'TBD' && typeof m.match_day === 'number')
  .slice(0, 6)

export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <span className="hero-badge">FIFA World Cup 2026</span>
          <h1 className="hero-title">
            The Greatest Show
            <br />
            <span>on Earth</span>
          </h1>
          <p className="hero-desc">
            48 nations. 104 matches. Three host countries.
            <br />
            June 11 – July 19, 2026
          </p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-value">{schedule.total_teams}</span>
              <span className="stat-label">Teams</span>
            </div>
            <div className="stat">
              <span className="stat-value">{groups.total_groups}</span>
              <span className="stat-label">Groups</span>
            </div>
            <div className="stat">
              <span className="stat-value">{schedule.total_matches}</span>
              <span className="stat-label">Matches</span>
            </div>
            <div className="stat">
              <span className="stat-value">{schedule.total_stadiums}</span>
              <span className="stat-label">Stadiums</span>
            </div>
          </div>
          <div className="hero-actions">
            <Link to="/schedule" className="btn btn-primary">View Full Schedule</Link>
            <Link to="/groups" className="btn btn-secondary">Explore Groups</Link>
          </div>
        </div>
        <div className="hero-hosts">
          {groups.hosts.map((host) => (
            <span key={host} className="host-pill">
              <CountryFlag country={host} size="xs" />
              {host}
            </span>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Opening Matches</h2>
          <Link to="/schedule" className="section-link">See all →</Link>
        </div>
        <div className="match-grid">
          {upcomingMatches.map((match) => (
            <MatchCard key={match.match_day} match={match} compact />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Featured Squads</h2>
          <Link to="/teams" className="section-link">All teams →</Link>
        </div>
        <div className="featured-teams">
          {squads.squads.slice(0, 4).map((squad) => (
            <Link
              key={squad.country}
              to={`/teams/${encodeURIComponent(squad.country)}`}
              className="featured-team"
            >
              <CountryFlag country={squad.country} size="lg" className="featured-flag" />
              <span className="featured-name">{squad.country}</span>
              <span className="featured-coach">{squad.coach}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
