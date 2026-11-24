import type { GenParams } from '../gen/types'
import type { GameState } from './state'
import { regenerateWorld, newGameState } from './init'

// Multi-world save system on localStorage. The world is regenerated
// deterministically from the seed; only exploration deltas are stored.

const LIST_KEY = 'wwm.saves.v2'
const BLOB_KEY = 'wwm.blob.v2'

export interface SaveMeta {
  id: string
  name: string
  worldName: string
  seedStr: string
  params: GenParams
  createdAt: number
  lastPlayed: number
  day: number
  points: number
}

export interface SaveBlob {
  v: number
  state: Omit<GameState, 'exp'> & { expB64: string }
}

function u8ToB64(a: Uint8Array): string {
  let out = ''
  const CHUNK = 8192
  for (let i = 0; i < a.length; i += CHUNK) {
    out += String.fromCharCode.apply(null, Array.from(a.subarray(i, i + CHUNK)) as unknown as number[])
  }
  return btoa(out)
}

function b64ToU8(b64: string): Uint8Array {
  const bin = atob(b64)
  const a = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i)
  return a
}

export function listSaves(): SaveMeta[] {
  try {
    const raw = localStorage.getItem(LIST_KEY)
    if (!raw) return []
    return JSON.parse(raw) as SaveMeta[]
  } catch {
    return []
  }
}

function allMetas(): SaveMeta[] {
  return listSaves()
}

function writeMetas(list: SaveMeta[]): void {
  localStorage.setItem(LIST_KEY, JSON.stringify(list))
}

export function saveGame(meta: Omit<SaveMeta, 'id' | 'lastPlayed'>, state: GameState, id?: string): string {
  const newId = id ?? 'w' + Date.now().toString(36)
  const blob: SaveBlob = {
    v: 2,
    state: {
      ...(state as Omit<GameState, 'exp'>),
      expB64: u8ToB64(state.exp),
    },
  }
  localStorage.setItem(`${BLOB_KEY}.${newId}`, JSON.stringify(blob))
  const list = allMetas().filter((m) => m.id !== newId)
  list.unshift({
    ...meta,
    id: newId,
    lastPlayed: Date.now(),
  })
  writeMetas(list)
  return newId
}

export function deleteSave(id: string): void {
  localStorage.removeItem(`${BLOB_KEY}.${id}`)
  writeMetas(allMetas().filter((m) => m.id !== id))
}

export function loadSaveState(id: string): { meta: SaveMeta; state: GameState; world: ReturnType<typeof regenerateWorld> } | null {
  try {
    const raw = localStorage.getItem(`${BLOB_KEY}.${id}`)
    if (!raw) return null
    const blob = JSON.parse(raw) as SaveBlob
    const metas = allMetas()
    const meta = metas.find((m) => m.id === id)
    if (!meta) return null
    const got = b64ToU8(blob.state.expB64)
    const { expB64, ...rest } = blob.state as Omit<GameState, 'exp'> & { expB64: string }
    void expB64
    const state: GameState = { ...rest, exp: got } as GameState
    const world = regenerateWorld(meta.seedStr, meta.params)
    return { meta, state, world }
  } catch {
    return null
  }
}

export function createNew(meta: Omit<SaveMeta, 'id' | 'lastPlayed'>, seedStr: string, params: GenParams): { id: string; state: GameState; world: ReturnType<typeof regenerateWorld> } {
  const world = regenerateWorld(seedStr, params)
  const state = newGameState(world, seedStr, params)
  const id = saveGame(meta, state)
  return { id, state, world }
}
