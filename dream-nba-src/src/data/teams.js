// ============================================================
// DATI: franchigie NBA
// Per creare Dream NFL/MLB/NHL basta duplicare questo file
// (id, nome, colori, rating base 60-99). Il motore non conosce
// nulla di specifico del basket: consuma solo questi campi.
// ============================================================

export const LEAGUE_NAME = 'NBA';
export const SEASON_GAMES = 82;
export const PLAYOFF_ROUNDS = [
  'Primo Turno',
  'Semifinali',
  'Finale di Conference',
  'NBA Finals',
];

export const TEAMS = [
  { id: 'BOS', city: 'Boston', name: 'Celtics', primary: '#007A33', secondary: '#BA9653', rating: 91 },
  { id: 'OKC', city: 'Oklahoma City', name: 'Thunder', primary: '#007AC1', secondary: '#EF3B24', rating: 90 },
  { id: 'DEN', city: 'Denver', name: 'Nuggets', primary: '#0E2240', secondary: '#FEC524', rating: 88 },
  { id: 'DAL', city: 'Dallas', name: 'Mavericks', primary: '#00538C', secondary: '#B8C4CA', rating: 86 },
  { id: 'MIL', city: 'Milwaukee', name: 'Bucks', primary: '#00471B', secondary: '#EEE1C6', rating: 85 },
  { id: 'MIN', city: 'Minnesota', name: 'Timberwolves', primary: '#0C2340', secondary: '#78BE20', rating: 85 },
  { id: 'NYK', city: 'New York', name: 'Knicks', primary: '#006BB6', secondary: '#F58426', rating: 84 },
  { id: 'CLE', city: 'Cleveland', name: 'Cavaliers', primary: '#860038', secondary: '#FDBB30', rating: 83 },
  { id: 'PHI', city: 'Philadelphia', name: '76ers', primary: '#006BB6', secondary: '#ED174C', rating: 83 },
  { id: 'LAL', city: 'Los Angeles', name: 'Lakers', primary: '#552583', secondary: '#FDB927', rating: 82 },
  { id: 'MIA', city: 'Miami', name: 'Heat', primary: '#98002E', secondary: '#F9A01B', rating: 81 },
  { id: 'PHX', city: 'Phoenix', name: 'Suns', primary: '#1D1160', secondary: '#E56020', rating: 81 },
  { id: 'LAC', city: 'Los Angeles', name: 'Clippers', primary: '#C8102E', secondary: '#1D428A', rating: 80 },
  { id: 'MEM', city: 'Memphis', name: 'Grizzlies', primary: '#5D76A9', secondary: '#12173F', rating: 80 },
  { id: 'IND', city: 'Indiana', name: 'Pacers', primary: '#002D62', secondary: '#FDBB30', rating: 79 },
  { id: 'SAC', city: 'Sacramento', name: 'Kings', primary: '#5A2D81', secondary: '#63727A', rating: 78 },
  { id: 'ORL', city: 'Orlando', name: 'Magic', primary: '#0077C0', secondary: '#C4CED4', rating: 78 },
  { id: 'HOU', city: 'Houston', name: 'Rockets', primary: '#CE1141', secondary: '#26282A', rating: 78 },
  { id: 'GSW', city: 'Golden State', name: 'Warriors', primary: '#1D428A', secondary: '#FFC72C', rating: 78 },
  { id: 'ATL', city: 'Atlanta', name: 'Hawks', primary: '#E03A3E', secondary: '#26282A', rating: 76 },
  { id: 'NOP', city: 'New Orleans', name: 'Pelicans', primary: '#0C2340', secondary: '#C8102E', rating: 76 },
  { id: 'DET', city: 'Detroit', name: 'Pistons', primary: '#1D42BA', secondary: '#C8102E', rating: 76 },
  { id: 'CHI', city: 'Chicago', name: 'Bulls', primary: '#CE1141', secondary: '#26282A', rating: 75 },
  { id: 'BKN', city: 'Brooklyn', name: 'Nets', primary: '#26282A', secondary: '#C8102E', rating: 74 },
  { id: 'TOR', city: 'Toronto', name: 'Raptors', primary: '#CE1141', secondary: '#26282A', rating: 73 },
  { id: 'UTA', city: 'Utah', name: 'Jazz', primary: '#002B5C', secondary: '#F9A01B', rating: 73 },
  { id: 'SAS', city: 'San Antonio', name: 'Spurs', primary: '#000000', secondary: '#C4CED4', rating: 72 },
  { id: 'POR', city: 'Portland', name: 'Trail Blazers', primary: '#E03A3E', secondary: '#26282A', rating: 71 },
  { id: 'WAS', city: 'Washington', name: 'Wizards', primary: '#002B5C', secondary: '#E31837', rating: 71 },
  { id: 'CHA', city: 'Charlotte', name: 'Hornets', primary: '#1D1160', secondary: '#00788C', rating: 70 },
];

export const teamById = (id) => TEAMS.find((t) => t.id === id);

// Loghi ufficiali (hotlink CDN ESPN; il component mostrerà un crest colorato come fallback)
export const logoUrl = (id) => `https://a.espncdn.com/i/teamlogos/nba/500/${id}.png`;

export const CONFERENCE = {
  East: ['BOS', 'NYK', 'CLE', 'PHI', 'MIA', 'MIL', 'IND', 'ORL', 'ATL', 'DET', 'CHI', 'BKN', 'TOR', 'CHA', 'WAS'],
  West: ['OKC', 'DEN', 'DAL', 'MIN', 'LAL', 'PHX', 'LAC', 'MEM', 'SAC', 'HOU', 'GSW', 'NOP', 'UTA', 'SAS', 'POR'],
};

export function teamTier(rating) {
  if (rating >= 87) return { label: 'Contender', tone: 'emerald' };
  if (rating >= 81) return { label: 'Playoff', tone: 'sky' };
  if (rating >= 76) return { label: 'Play-In', tone: 'amber' };
  return { label: 'Rebuild', tone: 'rose' };
}
