// ============================================================
// DATA: MLB franchises
// Engine-agnostic: the engine only consumes these fields.
// ============================================================

export const LEAGUE_NAME = 'MLB';
export const SEASON_GAMES = 162;
export const PLAYOFF_ROUNDS = [
  'Wild Card Series',
  'Division Series',
  'League Championship Series',
  'World Series',
];

export const TEAMS = [
  { id: 'LAD', city: 'Los Angeles', name: 'Dodgers', primary: '#005A9C', secondary: '#EF3E42', rating: 92 },
  { id: 'NYY', city: 'New York', name: 'Yankees', primary: '#132448', secondary: '#C4CED4', rating: 89 },
  { id: 'ATL', city: 'Atlanta', name: 'Braves', primary: '#13274F', secondary: '#CE1141', rating: 88 },
  { id: 'PHI', city: 'Philadelphia', name: 'Phillies', primary: '#E81828', secondary: '#002D72', rating: 88 },
  { id: 'NYM', city: 'New York', name: 'Mets', primary: '#002D72', secondary: '#FF5910', rating: 87 },
  { id: 'HOU', city: 'Houston', name: 'Astros', primary: '#002D62', secondary: '#EB6E1F', rating: 85 },
  { id: 'BAL', city: 'Baltimore', name: 'Orioles', primary: '#DF4601', secondary: '#000000', rating: 85 },
  { id: 'SD', city: 'San Diego', name: 'Padres', primary: '#2F241D', secondary: '#FFC425', rating: 84 },
  { id: 'CLE', city: 'Cleveland', name: 'Guardians', primary: '#00385D', secondary: '#E31937', rating: 84 },
  { id: 'SEA', city: 'Seattle', name: 'Mariners', primary: '#0C2C56', secondary: '#005C5C', rating: 83 },
  { id: 'BOS', city: 'Boston', name: 'Red Sox', primary: '#BD3039', secondary: '#0C2340', rating: 82 },
  { id: 'MIL', city: 'Milwaukee', name: 'Brewers', primary: '#FFC52F', secondary: '#12284B', rating: 82 },
  { id: 'DET', city: 'Detroit', name: 'Tigers', primary: '#0C2340', secondary: '#FA4616', rating: 82 },
  { id: 'TEX', city: 'Texas', name: 'Rangers', primary: '#003278', secondary: '#C0111F', rating: 81 },
  { id: 'CHC', city: 'Chicago', name: 'Cubs', primary: '#0E3386', secondary: '#CC3433', rating: 80 },
  { id: 'MIN', city: 'Minnesota', name: 'Twins', primary: '#002B5C', secondary: '#D31145', rating: 80 },
  { id: 'AZ', city: 'Arizona', name: 'Diamondbacks', primary: '#A71930', secondary: '#E3D4AD', rating: 80 },
  { id: 'TOR', city: 'Toronto', name: 'Blue Jays', primary: '#134A8E', secondary: '#1D2D5C', rating: 79 },
  { id: 'KC', city: 'Kansas City', name: 'Royals', primary: '#004687', secondary: '#BD9B60', rating: 79 },
  { id: 'TB', city: 'Tampa Bay', name: 'Rays', primary: '#092C5C', secondary: '#8FBCE6', rating: 78 },
  { id: 'CIN', city: 'Cincinnati', name: 'Reds', primary: '#C6011F', secondary: '#000000', rating: 78 },
  { id: 'STL', city: 'St. Louis', name: 'Cardinals', primary: '#C41E3A', secondary: '#0C2340', rating: 77 },
  { id: 'SF', city: 'San Francisco', name: 'Giants', primary: '#FD5A1E', secondary: '#27251F', rating: 77 },
  { id: 'PIT', city: 'Pittsburgh', name: 'Pirates', primary: '#FDB827', secondary: '#27251F', rating: 74 },
  { id: 'LAA', city: 'Los Angeles', name: 'Angels', primary: '#BA0021', secondary: '#003263', rating: 74 },
  { id: 'MIA', city: 'Miami', name: 'Marlins', primary: '#00A3E0', secondary: '#EF3340', rating: 72 },
  { id: 'WSH', city: 'Washington', name: 'Nationals', primary: '#AB0003', secondary: '#14225A', rating: 71 },
  { id: 'ATH', city: 'Sacramento', name: 'Athletics', primary: '#003831', secondary: '#EFB21E', rating: 69 },
  { id: 'COL', city: 'Colorado', name: 'Rockies', primary: '#33006F', secondary: '#C4CED4', rating: 67 },
  { id: 'CWS', city: 'Chicago', name: 'White Sox', primary: '#27251F', secondary: '#C4CED4', rating: 65 },
];

export const teamById = (id) => TEAMS.find((t) => t.id === id);

export const teamTier = (rating) => {
  if (rating >= 87) return { label: 'Contender', tone: 'emerald' };
  if (rating >= 81) return { label: 'Playoff', tone: 'sky' };
  if (rating >= 76) return { label: 'Bubble', tone: 'amber' };
  return { label: 'Rebuild', tone: 'rose' };
};

// Official logos (ESPN CDN hotlink; the component falls back to the colored crest)
export const logoUrl = (id) => `https://a.espncdn.com/i/teamlogos/mlb/500/${id.toLowerCase()}.png`;

export const CONFERENCE = {
  AL: ['NYY', 'BOS', 'TB', 'BAL', 'TOR', 'CLE', 'DET', 'KC', 'MIN', 'CWS', 'HOU', 'SEA', 'TEX', 'ATH', 'LAA'],
  NL: ['ATL', 'PHI', 'NYM', 'WSH', 'MIA', 'CHC', 'MIL', 'STL', 'PIT', 'CIN', 'LAD', 'SD', 'AZ', 'COL', 'SF'],
};
