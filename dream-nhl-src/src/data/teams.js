// ============================================================
// DATA: NHL franchises
// Engine-agnostic: the engine only consumes these fields.
// ============================================================

export const LEAGUE_NAME = 'NHL';
export const SEASON_GAMES = 82;
export const PLAYOFF_ROUNDS = [
  'Round 1',
  'Round 2',
  'Conference Final',
  'Stanley Cup Final',
];

export const TEAMS = [
  { id: 'FLA', city: 'Florida', name: 'Panthers', primary: '#C8102E', secondary: '#041E42', rating: 90 },
  { id: 'EDM', city: 'Edmonton', name: 'Oilers', primary: '#041E42', secondary: '#FF4C00', rating: 89 },
  { id: 'VGK', city: 'Vegas', name: 'Golden Knights', primary: '#B4975A', secondary: '#333F42', rating: 88 },
  { id: 'COL', city: 'Colorado', name: 'Avalanche', primary: '#6F263D', secondary: '#236192', rating: 88 },
  { id: 'DAL', city: 'Dallas', name: 'Stars', primary: '#006847', secondary: '#8F8F8C', rating: 87 },
  { id: 'TOR', city: 'Toronto', name: 'Maple Leafs', primary: '#00205B', secondary: '#FFFFFF', rating: 86 },
  { id: 'TB', city: 'Tampa Bay', name: 'Lightning', primary: '#002868', secondary: '#FFFFFF', rating: 85 },
  { id: 'CAR', city: 'Carolina', name: 'Hurricanes', primary: '#CC0000', secondary: '#000000', rating: 85 },
  { id: 'NJ', city: 'New Jersey', name: 'Devils', primary: '#CE1126', secondary: '#000000', rating: 84 },
  { id: 'WPG', city: 'Winnipeg', name: 'Jets', primary: '#041E42', secondary: '#AC162C', rating: 84 },
  { id: 'NYR', city: 'New York', name: 'Rangers', primary: '#0038A8', secondary: '#CE1126', rating: 83 },
  { id: 'MIN', city: 'Minnesota', name: 'Wild', primary: '#154734', secondary: '#A6192E', rating: 82 },
  { id: 'LA', city: 'Los Angeles', name: 'Kings', primary: '#111111', secondary: '#A2AAAD', rating: 82 },
  { id: 'VAN', city: 'Vancouver', name: 'Canucks', primary: '#00205B', secondary: '#00843D', rating: 81 },
  { id: 'BOS', city: 'Boston', name: 'Bruins', primary: '#FFB81C', secondary: '#000000', rating: 80 },
  { id: 'NSH', city: 'Nashville', name: 'Predators', primary: '#FFB81C', secondary: '#041E42', rating: 79 },
  { id: 'SEA', city: 'Seattle', name: 'Kraken', primary: '#99D9D9', secondary: '#001628', rating: 78 },
  { id: 'STL', city: 'St. Louis', name: 'Blues', primary: '#002F87', secondary: '#FCB514', rating: 78 },
  { id: 'WSH', city: 'Washington', name: 'Capitals', primary: '#C8102E', secondary: '#041E42', rating: 77 },
  { id: 'PIT', city: 'Pittsburgh', name: 'Penguins', primary: '#FCB514', secondary: '#000000', rating: 76 },
  { id: 'NYI', city: 'New York', name: 'Islanders', primary: '#00539B', secondary: '#F47D30', rating: 75 },
  { id: 'DET', city: 'Detroit', name: 'Red Wings', primary: '#CE1126', secondary: '#FFFFFF', rating: 75 },
  { id: 'OTT', city: 'Ottawa', name: 'Senators', primary: '#DA1A32', secondary: '#C2912C', rating: 74 },
  { id: 'BUF', city: 'Buffalo', name: 'Sabres', primary: '#003087', secondary: '#FFB81C', rating: 73 },
  { id: 'MTL', city: 'Montréal', name: 'Canadiens', primary: '#AF1E2D', secondary: '#192168', rating: 73 },
  { id: 'CGY', city: 'Calgary', name: 'Flames', primary: '#D2001C', secondary: '#FAAF19', rating: 72 },
  { id: 'UTAH', city: 'Utah', name: 'Mammoth', primary: '#71AFE5', secondary: '#090909', rating: 71 },
  { id: 'ANA', city: 'Anaheim', name: 'Ducks', primary: '#F47A38', secondary: '#B9975B', rating: 70 },
  { id: 'PHI', city: 'Philadelphia', name: 'Flyers', primary: '#F74902', secondary: '#000000', rating: 70 },
  { id: 'SJ', city: 'San Jose', name: 'Sharks', primary: '#006D75', secondary: '#EA7200', rating: 69 },
  { id: 'CBJ', city: 'Columbus', name: 'Blue Jackets', primary: '#002654', secondary: '#CE1126', rating: 68 },
  { id: 'CHI', city: 'Chicago', name: 'Blackhawks', primary: '#CF0A2C', secondary: '#000000', rating: 67 },
];

export const teamById = (id) => TEAMS.find((t) => t.id === id);

export const teamTier = (rating) => {
  if (rating >= 87) return { label: 'Contender', tone: 'emerald' };
  if (rating >= 81) return { label: 'Playoff', tone: 'sky' };
  if (rating >= 76) return { label: 'Bubble', tone: 'amber' };
  return { label: 'Rebuild', tone: 'rose' };
};

// Official logos (ESPN CDN hotlink; the component falls back to the colored crest)
export const logoUrl = (id) => `https://a.espncdn.com/i/teamlogos/nhl/500/${id.toLowerCase()}.png`;

export const CONFERENCE = {
  East: ['FLA', 'TOR', 'TB', 'CAR', 'NJ', 'NYR', 'NYI', 'BOS', 'MTL', 'OTT', 'BUF', 'DET', 'PHI', 'WSH', 'CBJ', 'PIT'],
  West: ['EDM', 'COL', 'VGK', 'DAL', 'MIN', 'LA', 'VAN', 'SEA', 'STL', 'NSH', 'WPG', 'UTAH', 'ANA', 'SJ', 'CHI', 'CGY'],
};
