import { makeSeedRng, pick, type Rng } from '../core/rng'

// Procedural naming for geographic features. Deterministic per seed.

const HEADS = [
  'Ast', 'Vel', 'Mar', 'Tha', 'Ril', 'Osk', 'Dur', 'Kai', 'Sel', 'Enn',
  'Orv', 'Pha', 'Yss', 'Vor', 'Cal', 'Bru', 'Ish', 'Lor', 'Que', 'Fen',
  'Nal', 'Oke', 'Teth', 'Ras', 'Gwen', 'Hol', 'Esk', 'Vaj', 'Olm', 'Zeph',
  'Corr', 'Mid', 'Bal', 'Har', 'Suan', 'Tri', 'Wend', 'Ald', 'Rho', 'Um',
]
const MID = [
  'a', 'e', 'i', 'o', 'u', 'ae', 'ei', 'ia', 'ou', 'y',
]
const TAILS = [
  'ria', 'or', 'en', 'ath', 'il', 'ur', 'ess', 'ond', 'ar', 'ea',
  'in', 'oth', 'ay', 'um', 'yr', 'al', 'os', 'eth', 'ir', 'une',
  'mont', 'heim', 'vale', 'gard', 'stad', 'wick', 'dun',
]
const RANGE_SUFFIX = ['Monti', 'Catena', 'Massiccio', 'Crinale']
const LAKE_SUFFIX = ['Lago', 'Laghi di']
const DESERT_SUFFIX = ['Deserto', 'Distesa', 'Erg']
const FOREST_SUFFIX = ['Foresta', 'Bosco']
const ISLAND_SUFFIX = ['Isola', 'Isole']

export class Namer {
  private rng: Rng
  private used = new Set<string>()

  constructor(seedStr: string, salt: number) {
    this.rng = makeSeedRng(seedStr + '|names', salt)
  }

  private syllable(): string {
    let s = pick(this.rng, HEADS)
    if (this.rng() < 0.55) s += pick(this.rng, MID)
    s += pick(this.rng, TAILS)
    return s
  }

  base(): string {
    for (let t = 0; t < 40; t++) {
      let s = this.syllable()
      // title case nicely
      s = s.charAt(0).toUpperCase() + s.slice(1)
      s = s.replace(/([a-z])([A-Z])/g, '$1\u2019$2')
      if (!this.used.has(s.toLowerCase())) {
        this.used.add(s.toLowerCase())
        return s
      }
    }
    const n = Math.floor(this.rng() * 900 + 100)
    return 'Terra ' + n
  }

  range(): string {
    return `${this.base()} ${this.suffix(RANGE_SUFFIX)}`
  }
  lake(): string {
    const s = this.suffix(LAKE_SUFFIX)
    return `${s} ${this.base()}`
  }
  desert(): string {
    return `${this.suffix(DESERT_SUFFIX)} ${this.base()}`
  }
  forest(): string {
    return `${this.suffix(FOREST_SUFFIX)} ${this.base()}`
  }
  island(): string {
    return `${this.suffix(ISLAND_SUFFIX)} ${this.base()}`
  }
  river(): string {
    return `Fiume ${this.base()}`
  }
  peak(): string {
    return `Monte ${this.base()}`
  }
  volcano(): string {
    return `Vulcano ${this.base()}`
  }
  pass(): string {
    return `Passo ${this.base()}`
  }
  ruin(): string {
    return `Rovine di ${this.base()}`
  }
  canyon(): string {
    return `Canyon ${this.base()}`
  }
  harbor(): string {
    return `Approdo di ${this.base()}`
  }
  wetland(): string {
    return `Paludi di ${this.base()}`
  }

  private suffix(list: string[]): string {
    return pick(this.rng, list)
  }
}
