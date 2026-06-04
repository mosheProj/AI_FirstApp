export interface PlayersByPosition {
  GK: string[]
  DEF: string[]
  MID: string[]
  FWD: string[]
}

export interface Squad {
  country: string
  flag: string
  confederation: string
  group: string
  coach: string
  players: PlayersByPosition
}

export interface SquadsData {
  tournament: string
  note: string
  squads: Squad[]
}

export interface Match {
  match_day: number | string
  date: string
  time: string
  home: string
  away: string
  venue: string
  city: string
  country: string
  stage: string
  group: string | null
}

export interface ScheduleData {
  tournament: string
  dates: string
  hosts: string[]
  total_matches: number
  total_teams: number
  total_stadiums: number
  time_zone_note: string
  schedule: Match[]
}

export interface GroupTeam {
  name: string
  confederation: string
  host: boolean
  flag: string
}

export interface Group {
  group: string
  teams: GroupTeam[]
}

export interface GroupsData {
  tournament: string
  dates: string
  hosts: string[]
  total_teams: number
  total_groups: number
  groups: Group[]
  all_qualified_nations_by_confederation: Record<string, string[]>
}

export type PositionKey = keyof PlayersByPosition

export const POSITION_LABELS: Record<PositionKey, string> = {
  GK: 'Goalkeepers',
  DEF: 'Defenders',
  MID: 'Midfielders',
  FWD: 'Forwards',
}

export const POSITION_COLORS: Record<PositionKey, string> = {
  GK: '#f59e0b',
  DEF: '#3b82f6',
  MID: '#10b981',
  FWD: '#ef4444',
}
