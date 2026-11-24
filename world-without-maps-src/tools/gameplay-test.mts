// Gameplay integration test (headless): exploration, survey, missions, save state.
import { generateWorld } from '/workspace/world-without-maps/src/gen/generate.ts'
import { newGameState } from '/workspace/world-without-maps/src/game/init.ts'
import { DEFAULT_PARAMS, SEA_LEVEL, B } from '/workspace/world-without-maps/src/gen/types.ts'
import { advanceTime, findPath, moveCostHours, observe, pathHours, survey, weatherAt, sightRadiusAt } from '/workspace/world-without-maps/src/game/logic.ts'
import { generateMissions, updateMissions, atlasCompletion } from '/workspace/world-without-maps/src/game/missions.ts'
import { X_OBSERVED, X_SURVEYED } from '/workspace/world-without-maps/src/game/state.ts'

const w = generateWorld('gameplay-test', { ...DEFAULT_PARAMS })
const s0 = newGameState(w, 'gameplay-test', { ...DEFAULT_PARAMS })
let s = s0
const W = w.W
const N = W * w.H

console.log('== GAMEPLAY ==')
console.log('spawn in', s.player, 'biome', w.biome[s.player.y * W + s.player.x], 'day', s.day.toFixed(0))
console.log('missions generated:', s.missions.length, s.missions.map((m) => m.title).join(' | '))

// 1. observation at spawn
const o1 = observe(s, w, s.player, s.day, 3)
s = o1.state
let obs = 0
for (let i = 0; i < N; i++) if (s.exp[i] === X_OBSERVED) obs++
console.log('after first observe: tiles observed =', obs, '| discoveries:', o1.discoveries.length, o1.discoveries.map((d) => d.name).join(', '))

// 2. short trip along a found path to some distant tile on land
let dest = -1
for (let k = 0; k < N; k += 97) {
  const i = k
  if (w.elevation[i] > SEA_LEVEL + 0.02 && w.biome[i] !== B.ICE) { dest = i; break }
}
const path = findPath(w, s, s.player.y * W + s.player.x, dest)
console.log('path found to', dest % W, ((dest / W) | 0), ':', path ? path.length + ' tiles, ' + pathHours(w, s, path).toFixed(0) + 'h' : 'NONE')
if (path) {
  for (const step of path.slice(1)) {
    const pi = s.player.y * W + s.player.x
    if (pi === step) continue
    const hours = moveCostHours(w, pi, step, s)
    if (hours < 0) break
    s = { ...s, player: { x: step % W, y: (step / W) | 0 } }
    s = advanceTime(s, w, hours, [])
    const o = observe(s, w, s.player, s.day, hours)
    s = o.state
    for (const d of o.discoveries) s = { ...s, journal: [...s.journal, { day: s.day, kind: 'discover', text: 'Avvistato ' + d.name }] }
    const mu = updateMissions(w, s)
    s = { ...s, missions: mu.missions }
    if (s.water <= 0) break
  }
}
console.log('after trip: day', Math.floor(s.day), 'coords', s.player, 'food', Math.round(s.food), 'water', Math.round(s.water), 'fatigue', Math.round(s.fatigue), 'points', s.points)
console.log('journal entries:', s.journal.length)

// 3. survey here
const sv = survey(s, w, s.player)
s = sv.state
console.log('survey: tiles', sv.tilesDone, 'hours', sv.hours.toFixed(1), 'points now', s.points, 'discoveries', sv.discoveries.length, 'confirmations', sv.surveys.length)
let srv = 0
for (let i = 0; i < N; i++) if (s.exp[i] === X_SURVEYED) srv++
console.log('surveyed tiles total:', srv)

// 4. mission progress & atlas
const mu2 = updateMissions(w, s)
s = { ...s, missions: mu2.missions }
console.log('missions:', s.missions.map((m) => `${m.title}: ${(m.progress * 100).toFixed(0)}%${m.done ? ' DONE' : ''}`).join(' | '))
console.log('atlas completion:', (atlasCompletion(w, s) * 100).toFixed(1) + '%')

// 5. weather sanity across a year at spawn
const winter = weatherAt(w, s.player.y * W + s.player.x, 10)
const summer = weatherAt(w, s.player.y * W + s.player.x, 180)
console.log('weather sample day10 temp', winter.temp.toFixed(1), 'day180 temp', summer.temp.toFixed(1))

// 6. sight radius across terrain
console.log('sight on hill vs plain:', sightRadiusAt(w, s.player.y * W + s.player.x).toFixed(1))

console.log('\nOK')
