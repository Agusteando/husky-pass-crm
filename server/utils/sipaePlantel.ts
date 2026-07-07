import { normalizeAttendanceText } from '~/utils/attendance'
import { normalizeSchoolPlantel } from '~/utils/schoolCatalog'

interface PlantelMapEntry {
  db_code: string
  db_codes: string[]
  husky_db_codes?: string[]
  name: string
  display_name?: string
  sapf_data_campuses?: string[]
}

const PLANTEL_MAP: Record<string, PlantelMapEntry> = {
  PM: {
    db_code: 'PM',
    db_codes: ['PM', 'PMA', 'PMB', '4 - PM', '04 - PM', 'PRIMARIA METEPEC', 'PRIMARIA ALTA METEPEC', 'PRIMARIA BAJA METEPEC'],
    name: 'Primaria Metepec',
    sapf_data_campuses: ['PM', 'PMA', 'PMB', 'Primaria Metepec', 'Primaria Alta Metepec', 'Primaria Baja Metepec']
  },
  PT: {
    db_code: 'PT',
    db_codes: ['PT', '01', '1', '1 - PT', '14 - PT', 'PRIMARIA TOLUCA'],
    name: 'Primaria Toluca',
    sapf_data_campuses: ['PT', 'Primaria Toluca']
  },
  SM: {
    db_code: 'SM',
    db_codes: ['SM', '5 - SM', '05 - SM', 'SECUNDARIA METEPEC'],
    name: 'Secundaria Metepec',
    sapf_data_campuses: ['SM', 'Secundaria Metepec']
  },
  ST: {
    db_code: 'ST',
    db_codes: ['ST', '2 - ST', '02 - ST', 'SECUNDARIA TOLUCA'],
    name: 'Secundaria Toluca',
    sapf_data_campuses: ['ST', 'Secundaria Toluca']
  },
  PREEM: {
    db_code: 'PREEM',
    db_codes: ['PREEM', 'PREES MET', 'PREES-MET', 'PREESCOLAR METEPEC', 'CASITA METEPEC'],
    husky_db_codes: ['PREEM', 'PREES MET', 'PREESCOLAR METEPEC', 'CASITA METEPEC'],
    name: 'Preescolar Metepec',
    sapf_data_campuses: ['PREEM', 'PREES MET', 'PREES-MET', 'PREES_MET', 'Preescolar Metepec', 'PREESCOLAR METEPEC']
  },
  GM: {
    db_code: 'GM',
    db_codes: ['GM', 'GUARDERIA METEPEC'],
    husky_db_codes: ['GM', 'GUARDERIA METEPEC'],
    name: 'Guardería Metepec',
    sapf_data_campuses: ['GM', 'Guarderia Metepec', 'GUARDERIA METEPEC']
  },
  CT: {
    db_code: 'CT',
    db_codes: ['CT', 'PREES TOL', 'PREES-TOL', 'PREESCOLAR TOLUCA', 'CASITA TOLUCA'],
    husky_db_codes: ['CT', 'PREES TOL', 'PREESCOLAR TOLUCA', 'CASITA TOLUCA'],
    name: 'Casita Toluca',
    sapf_data_campuses: ['CT', 'PREES TOL', 'PREES-TOL', 'PREES_TOL', 'Preescolar Toluca', 'PREESCOLAR TOLUCA', 'Casita Toluca']
  }
}

function dedupe(values: string[]) {
  const seen = new Set<string>()
  return values.filter((value) => {
    const key = normalizeAttendanceText(value)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function resolveSipaePlantel(plantelCode?: string | null) {
  const requested = String(plantelCode || '').trim()
  const canonical = normalizeSchoolPlantel(requested) || normalizeSchoolPlantel(requested.replace(/[0-9]/g, '')) || 'PT'
  const mapping = PLANTEL_MAP[canonical]
  const dbCode = mapping?.db_code || canonical
  const dbCodes = dedupe(mapping?.db_codes || [dbCode])
  const huskyDbCodes = dedupe(mapping?.husky_db_codes || dbCodes)
  const sapfDataCampuses = dedupe(mapping?.sapf_data_campuses || [dbCode])

  return {
    plantelRequested: requested || dbCode,
    plantelCode: canonical,
    canonicalCode: canonical,
    dbCode,
    dbCodes,
    huskyDbCodes,
    sapfDataCampuses,
    resolvedName: mapping?.display_name || mapping?.name || dbCode
  }
}

export function deriveSipaePlantelFromStudent(input: {
  matricula?: string | null
  nivelEdu?: string | null
  campus?: string | null
  plantel?: string | null
}) {
  return normalizeSchoolPlantel(input.matricula) || normalizeSchoolPlantel(input.plantel) || normalizeSchoolPlantel(input.campus) || 'PT'
}

export function plantelMatches(candidate: string | null | undefined, expectedPlantelCode: string) {
  const normalizedCandidate = normalizeAttendanceText(candidate)
  if (!normalizedCandidate) return false
  const plantel = resolveSipaePlantel(expectedPlantelCode)
  return dedupe([
    plantel.dbCode,
    plantel.plantelCode,
    plantel.canonicalCode,
    plantel.resolvedName,
    ...plantel.dbCodes,
    ...plantel.sapfDataCampuses,
    ...plantel.huskyDbCodes
  ]).some((value) => {
    const normalized = normalizeAttendanceText(value)
    return normalizedCandidate === normalized || normalizedCandidate.startsWith(normalized) || normalizedCandidate.includes(normalized)
  })
}
