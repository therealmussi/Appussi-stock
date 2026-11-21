// ============================================================
// DATA: NFL franchises
// Engine-agnostic: the engine only consumes these fields.
// ============================================================

export const LEAGUE_NAME = 'NFL';
export const SEASON_GAMES = 17;
export const PLAYOFF_ROUNDS = [
  'Wild Card',
  'Divisional Round',
  'Conference Championship',
  'Super Bowl',
];

export const TEAMS = [
  { id: 'PHI', city: 'Philadelphia', name: 'Eagles', primary: '#004C54', secondary: '#A5ACAF', rating: 93 },
  { id: 'KC', city: 'Kansas City', name: 'Chiefs', primary: '#E31837', secondary: '#FFB81C', rating: 91 },
  { id: 'BUF', city: 'Buffalo', name: 'Bills', primary: '#00338D', secondary: '#C60C30', rating: 90 },
  { id: 'BAL', city: 'Baltimore', name: 'Ravens', primary: '#241773', secondary: '#9E7C0C', rating: 89 },
  { id: 'LAC', city: 'Los Angeles', name: 'Chargers', primary: '#0080C6', secondary: '#FFC20E', rating: 89 },
  { id: 'DET', city: 'Detroit', name: 'Lions', primary: '#0076B6', secondary: '#B0B7BC', rating: 88 },
  { id: 'GB', city: 'Green Bay', name: 'Packers', primary: '#203731', secondary: '#FFB612', rating: 88 },
  { id: 'WAS', city: 'Washington', name: 'Commanders', primary: '#5A1414', secondary: '#FFB612', rating: 87 },
  { id: 'MIN', city: 'Minnesota', name: 'Vikings', primary: '#4F2683', secondary: '#FFC62F', rating: 87 },
  { id: 'DEN', city: 'Denver', name: 'Broncos', primary: '#FB4F14', secondary: '#002244', rating: 86 },
  { id: 'HOU', city: 'Houston', name: 'Texans', primary: '#03202F', secondary: '#A71930', rating: 86 },
  { id: 'ARI', city: 'Arizona', name: 'Cardinals', primary: '#97233F', secondary: '#000000', rating: 85 },
  { id: 'TB', city: 'Tampa Bay', name: 'Buccaneers', primary: '#D50A0A', secondary: '#34302B', rating: 85 },
  { id: 'CIN', city: 'Cincinnati', name: 'Bengals', primary: '#FB4F14', secondary: '#000000', rating: 84 },
  { id: 'LAR', city: 'Los Angeles', name: 'Rams', primary: '#003594', secondary: '#FFA300', rating: 84 },
  { id: 'SEA', city: 'Seattle', name: 'Seahawks', primary: '#002244', secondary: '#69BE28', rating: 84 },
  { id: 'PIT', city: 'Pittsburgh', name: 'Steelers', primary: '#FFB612', secondary: '#101820', rating: 82 },
  { id: 'CHI', city: 'Chicago', name: 'Bears', primary: '#0B162A', secondary: '#C83803', rating: 82 },
  { id: 'SF', city: 'San Francisco', name: '49ers', primary: '#AA0000', secondary: '#B3995D', rating: 82 },
  { id: 'ATL', city: 'Atlanta', name: 'Falcons', primary: '#A71930', secondary: '#000000', rating: 81 },
  { id: 'DAL', city: 'Dallas', name: 'Cowboys', primary: '#041E42', secondary: '#869397', rating: 80 },
  { id: 'JAX', city: 'Jacksonville', name: 'Jaguars', primary: '#006778', secondary: '#D7A22A', rating: 79 },
  { id: 'NE', city: 'New England', name: 'Patriots', primary: '#002244', secondary: '#C60C30', rating: 78 },
  { id: 'IND', city: 'Indianapolis', name: 'Colts', primary: '#002C5F', secondary: '#A2AAAD', rating: 78 },
  { id: 'NYG', city: 'New York', name: 'Giants', primary: '#0B2265', secondary: '#A71930', rating: 77 },
  { id: 'MIA', city: 'Miami', name: 'Dolphins', primary: '#008E97', secondary: '#FC4C02', rating: 76 },
  { id: 'NO', city: 'New Orleans', name: 'Saints', primary: '#D3BC8D', secondary: '#101820', rating: 75 },
  { id: 'NYJ', city: 'New York', name: 'Jets', primary: '#125740', secondary: '#000000', rating: 75 },
  { id: 'CLE', city: 'Cleveland', name: 'Browns', primary: '#311D00', secondary: '#FF3C00', rating: 74 },
  { id: 'CAR', city: 'Carolina', name: 'Panthers', primary: '#0085CA', secondary: '#101820', rating: 73 },
  { id: 'TEN', city: 'Tennessee', name: 'Titans', primary: '#0C2340', secondary: '#4B92DB', rating: 71 },
  { id: 'LV', city: 'Las Vegas', name: 'Raiders', primary: '#000000', secondary: '#A5ACAF', rating: 70 },
];

export const teamById = (id) => TEAMS.find((t) => t.id === id);

export const teamTier = (rating) => {
  if (rating >= 87) return { label: 'Contender', tone: 'emerald' };
  if (rating >= 82) return { label: 'Playoff', tone: 'sky' };
  if (rating >= 77) return { label: 'Bubble', tone: 'amber' };
  return { label: 'Rebuild', tone: 'rose' };
};

// Official logos (ESPN CDN hotlink; the component falls back to the colored crest)
export const logoUrl = (id) => `https://a.espncdn.com/i/teamlogos/nfl/500/${id.toLowerCase()}.png`;

export const CONFERENCE = {
  AFC: ['BUF', 'MIA', 'NE', 'NYJ', 'BAL', 'CIN', 'CLE', 'PIT', 'HOU', 'IND', 'JAX', 'TEN', 'DEN', 'KC', 'LV', 'LAC'],
  NFC: ['DAL', 'NYG', 'PHI', 'WAS', 'ARI', 'ATL', 'CAR', 'NO', 'TB', 'CHI', 'DET', 'GB', 'MIN', 'LAR', 'SEA', 'SF'],
};
