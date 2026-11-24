import type { GameState } from './types'
import { deptById, deptPerf, log, clamp } from './actions-helpers'
import { unlockEvidence } from './world'


export function applyEventEffect(s: GameState, eventId: string, index: number) {
  const m = s.metrics
  switch (`${eventId}#${index}`) {
    case 'script_w1#0': break
    case 'script_w1#1': s.flags.keyAsked = 1; log(s, 'mystery', 'Facilities could not match the second key to any lock in the register.'); break
    case 'script_w4#0': s.investigation.archivistTrust = clamp(s.investigation.archivistTrust + 15); s.flags.apBonus = (s.flags.apBonus ?? 0) + 1; break
    case 'script_w4#1': s.investigation.archivistTrust = clamp(s.investigation.archivistTrust - 5); break
    case 'script_w8#0': s.board.confidence = clamp(s.board.confidence + 3); s.flags.pledged = 1; break
    case 'script_w8#1': s.board.confidence = clamp(s.board.confidence - 2); s.investigation.suspicion += 3; break
    case 'script_w12#1': s.investigation.archivistTrust = clamp(s.investigation.archivistTrust + 5); break
    case 'ev_custodian_counter#0': s.investigation.suspicion = clamp(s.investigation.suspicion + 8); break
    case 'ev_custodian_counter#1': s.flags.hardened = 1; s.investigation.suspicion = clamp(s.investigation.suspicion + 16); break

    case 'ev_strike_ballot#0': s.flags.wagePackages = (s.flags.wagePackages ?? 0) + 1; m.satisfaction = clamp(m.satisfaction + 8); break
    case 'ev_strike_ballot#1': m.satisfaction = clamp(m.satisfaction + 4); m.stability = clamp(m.stability + 2); break
    case 'ev_strike_ballot#2': m.satisfaction = clamp(m.satisfaction - 6); m.stability = clamp(m.stability - 8); break

    case 'ev_competitor#0': m.cash -= 2400; m.marketShare += 0.3; break
    case 'ev_competitor#1': m.marketShare = Math.max(0.5, m.marketShare - 0.25); break
    case 'ev_competitor#2': m.reputation = clamp(m.reputation - 3); break

    case 'ev_supplier_bankrupt#0': m.cash -= 1800; deptById(s, 'logistics').performance = clamp(deptById(s, 'logistics').performance + 6); break
    case 'ev_supplier_bankrupt#1': deptById(s, 'logistics').performance = clamp(deptById(s, 'logistics').performance - 6); break

    case 'ev_exec_resignation#0': {
      m.cash -= 900
      const ex = [...s.executives].filter((e) => e.active).sort((a, b) => a.trust - b.trust)[0]
      if (ex) ex.trust = clamp(ex.trust + 25)
      break
    }
    case 'ev_exec_resignation#1': {
      const ex = [...s.executives].filter((e) => e.active).sort((a, b) => a.trust - b.trust)[0]
      if (ex) {
        ex.active = false
        deptById(s, ex.dept).performance = clamp(deptById(s, ex.dept).performance - 8)
        log(s, 'bad', `${ex.name} (${ex.role}) has left the company. ${deptById(s, ex.dept).name} is without its chief.`)
      }
      break
    }

    case 'ev_leak#0': m.reputation = clamp(m.reputation - 1); m.stability = clamp(m.stability + 2); break
    case 'ev_leak#1': m.reputation = clamp(m.reputation - 4); break

    case 'ev_whistle#0': {
      s.investigation.archivistTrust = clamp(s.investigation.archivistTrust + 5)
      s.flags.protectedChannel = 1
      log(s, 'mystery', 'The protected channel is live. First message: an index card referencing the Founder Trust deed — the amendment is missing from your copy.')
      break
    }
    case 'ev_whistle#1': s.flags.whistleIgnored = 1; break

    case 'ev_client_terminates#0': s.flags.demandShock = 2; break
    case 'ev_client_terminates#1': s.flags.demandShock = 4; break

    case 'ev_sub_profit#0': m.cash += 1500; break
    case 'ev_sub_profit#1': log(s, 'info', 'The breakdown reconciles perfectly. Nothing at Meridian normally reconciles perfectly.'); break

    case 'ev_regulation#0': m.cash -= 1500; deptById(s, 'legal').performance = clamp(deptById(s, 'legal').performance + 5); break
    case 'ev_regulation#1': deptById(s, 'legal').performance = clamp(deptById(s, 'legal').performance - 5); break

    case 'ev_it_outage#0': m.cash -= 1200; deptById(s, 'it').performance = clamp(deptById(s, 'it').performance + 6); break
    case 'ev_it_outage#1': deptById(s, 'it').performance = clamp(deptById(s, 'it').performance - 3); m.reputation = clamp(m.reputation - 2); break

    case 'ev_factory_incident#0': m.cash -= 2000; deptById(s, 'operations').performance = clamp(deptById(s, 'operations').performance + 5); m.stability = clamp(m.stability + 3); break
    case 'ev_factory_incident#1': m.stability = clamp(m.stability - 5); break

    case 'ev_undocumented#0': {
      const id = ['ev_min_1971', 'ev_chart_1984', 'ev_regulator_1971'].find((q) => !s.evidence.some((e) => e.id === q))
      if (id) {
        unlockEvidence(s, id)
        log(s, 'mystery', 'Archived document recovered from the Wayfarer crates and added to your record.')
      }
      break
    }
    case 'ev_undocumented#1': s.investigation.suspicion = clamp(s.investigation.suspicion + 5); break

    case 'ev_viral_praise#0': m.reputation = clamp(m.reputation + 4); break
    case 'ev_viral_praise#1': m.reputation = clamp(m.reputation + 2); break

    case 'ev_board_emergency#0': s.board.confidence = clamp(s.board.confidence + 2); break
    case 'ev_board_emergency#1': s.board.confidence = clamp(s.board.confidence + 1); break
    case 'ev_board_emergency#2':
      if (s.insights.length >= 2) s.board.confidence = clamp(s.board.confidence + 5)
      else s.investigation.suspicion = clamp(s.investigation.suspicion + 3)
      break
    default:
      break
  }
}
