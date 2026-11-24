export const FIRST_NAMES = [
  'Alma','Boris','Clara','Dario','Edith','Farid','Greta','Henrik','Ines','Jonas',
  'Katya','Lior','Marta','Nils','Odalys','Pavel','Quinn','Rosa','Stefan','Tova',
  'Ugo','Vera','Wendell','Ximena','Yusuf','Zora','Anja','Bruno','Celia','Dmitri',
  'Elsa','Felix','Gwen','Hugo','Iris','Jarek','Karin','Lars','Mireille','Nadia',
  'Otto','Priya','Renata','Soren','Tania','Umberto','Viktor','Wanda','Xavier','Yara',
  'Zeno','Astrid','Basile','Cormac','Delia','Eero','Flora','Gidon','Hana','Ivo',
]

export const LAST_NAMES = [
  'Almeida','Brandt','Cassel','Duval','Egede','Falk','Garau','Hoffmann','Iversen','Jarvinen',
  'Kessler','Lindqvist','Moreau','Nyberg','Ostrowski','Petit','Quirke','Ricci','Solano','Tamm',
  'Ulmer','Vance','Weiss','Xanthos','Yilmaz','Zubiri','Aalto','Bern','Czerny','Dahl',
  'Ekwueme','Ferrand','Gerber','Halvorsen','Ilić','Jansen','Kovač','Lemaitre','Merz','Novak',
  'Okafor','Palmieri','Rask','Sørensen','Trelawney','Ustinov','Verhoeven','Wozniak','Yamane','Zeller',
]

export const SPECIALTIES: Record<string, string[]> = {
  operations: ['Line Scheduling','Quality Control','Plant Maintenance','Industrial Engineering'],
  finance: ['Treasury','Cost Accounting','Tax','Credit Control'],
  hr: ['Recruiting','Labor Relations','Training','Payroll'],
  rnd: ['Applied Physics','Materials','Prototyping','Systems Research'],
  marketing: ['Brand','Market Research','Campaigns','Client Accounts'],
  logistics: ['Freight','Warehousing','Fleet','Procurement'],
  legal: ['Contracts','Regulatory','Litigation','IP'],
  it: ['Infrastructure','Security','Legacy Systems','Data Services'],
  planning: ['Forecasting','Org Design','Portfolio Review','Market Entry'],
  pr: ['Media Relations','Government Affairs','Community','Crisis Comms'],
  security: ['Access Control','Investigations','Loss Prevention','Continuity of Operations'],
  archives: ['Records Retention','Document Recovery','Indexing','Preservation'],
}

export const TRAITS = [
  'Ambitious','Loyal','Opportunistic','Creative','Conservative','Introverted',
  'Charismatic','Conflict-prone','Analytical','Unmotivated','Conscientious','Vindictive',
]

export const TITLES: Record<number, string[]> = {
  1: ['Clerk','Associate','Coordinator','Technician'],
  2: ['Senior Associate','Specialist','Team Lead'],
  3: ['Manager','Head of Unit'],
  4: ['Director'],
}
