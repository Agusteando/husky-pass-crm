import { normalizeAttendanceText } from '~/utils/attendance'

interface PlantelMapEntry {
  alias_of?: string
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
  PMA: {
    alias_of: 'PM',
    db_code: 'PM',
    db_codes: ['PM', 'PMA', 'PMB', '4 - PM', '04 - PM', 'PRIMARIA METEPEC', 'PRIMARIA ALTA METEPEC', 'PRIMARIA BAJA METEPEC'],
    name: 'Primaria Metepec',
    sapf_data_campuses: ['PM', 'PMA', 'PMB', 'Primaria Metepec', 'Primaria Alta Metepec', 'Primaria Baja Metepec']
  },
  PMB: {
    alias_of: 'PM',
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
  PREET: {
    db_code: 'PREET',
    db_codes: ['PREET', 'CT', 'PREES TOL', 'PREES-TOL', 'PREESCOLAR TOLUCA', 'CASITA TOLUCA'],
    husky_db_codes: ['PREET', 'CT', 'PREES TOL', 'PREESCOLAR TOLUCA', 'CASITA TOLUCA'],
    name: 'PREET',
    display_name: 'Preescolar Toluca (PREET)',
    sapf_data_campuses: ['PREET', 'PREES TOL', 'PREES-TOL', 'PREES_TOL', 'Preescolar Toluca', 'PREESCOLAR TOLUCA', 'CT', 'Casita Toluca']
  },
  CT: {
    alias_of: 'PREET',
    db_code: 'PREET',
    db_codes: ['PREET', 'CT', 'PREES TOL', 'PREES-TOL', 'PREESCOLAR TOLUCA', 'CASITA TOLUCA'],
    husky_db_codes: ['PREET', 'CT', 'PREES TOL', 'PREESCOLAR TOLUCA', 'CASITA TOLUCA'],
    name: 'PREET',
    display_name: 'Preescolar Toluca (PREET)',
    sapf_data_campuses: ['PREET', 'PREES TOL', 'PREES-TOL', 'PREES_TOL', 'Preescolar Toluca', 'PREESCOLAR TOLUCA', 'CT', 'Casita Toluca']
  },
  PREEM: {
    db_code: 'PREEM',
    db_codes: ['PREEM', 'CM', 'PREES MET', 'PREES-MET', 'PREESCOLAR METEPEC', 'CASITA METEPEC'],
    husky_db_codes: ['PREEM', 'CM', 'PREES MET', 'PREESCOLAR METEPEC', 'CASITA METEPEC'],
    name: 'PREEM',
    display_name: 'Preescolar Metepec (PREEM)',
    sapf_data_campuses: ['PREEM', 'PREES MET', 'PREES-MET', 'PREES_MET', 'Preescolar Metepec', 'PREESCOLAR METEPEC', 'CM', 'Casita Metepec']
  },
  CM: {
    alias_of: 'PREEM',
    db_code: 'PREEM',
    db_codes: ['PREEM', 'CM', 'PREES MET', 'PREES-MET', 'PREESCOLAR METEPEC', 'CASITA METEPEC'],
    husky_db_codes: ['PREEM', 'CM', 'PREES MET', 'PREESCOLAR METEPEC', 'CASITA METEPEC'],
    name: 'PREEM',
    display_name: 'Preescolar Metepec (PREEM)',
    sapf_data_campuses: ['PREEM', 'PREES MET', 'PREES-MET', 'PREES_MET', 'Preescolar Metepec', 'PREESCOLAR METEPEC', 'CM', 'Casita Metepec']
  },
  DM: {
    db_code: 'DM',
    db_codes: ['DM'],
    name: 'Desarrollo Metepec',
    sapf_data_campuses: ['DM']
  },
  PR: {
    db_code: 'PR',
    db_codes: ['PR'],
    name: 'Preescolar / PR',
    sapf_data_campuses: ['PR']
  },
  '01': {
    db_code: '01',
    db_codes: ['01'],
    name: 'Primaria Toluca (01)',
    sapf_data_campuses: ['PT', 'Primaria Toluca']
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
  const code = requested.toUpperCase()
  const mapping = PLANTEL_MAP[code] || PLANTEL_MAP[normalizeAttendanceText(code)] || null
  const canonical = mapping?.alias_of || code
  const dbCode = mapping?.db_code || canonical || requested
  const dbCodes = dedupe(mapping?.db_codes || [dbCode])
  const huskyDbCodes = dedupe(mapping?.husky_db_codes || dbCodes)
  const sapfDataCampuses = dedupe(mapping?.sapf_data_campuses || [dbCode])

  return {
    plantelRequested: requested || dbCode,
    plantelCode: code || dbCode,
    canonicalCode: canonical || dbCode,
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
  const matricula = String(input.matricula || '').trim().toUpperCase()
  const nivel = String(input.nivelEdu || '').toLowerCase()
  const campus = String(input.campus || '').toLowerCase()
  const plantel = String(input.plantel || '').trim().toUpperCase()

  if (matricula.startsWith('PREEM')) return 'PREEM'
  if (matricula.startsWith('PREET')) return 'PREET'
  if (matricula.startsWith('CT')) return 'CT'
  if (matricula.startsWith('CM')) return 'CM'
  if (matricula.startsWith('DM')) return 'CM'
  if (matricula.startsWith('SM')) return 'SM'
  if (matricula.startsWith('ST')) return 'ST'
  if (matricula.startsWith('PM')) return 'PM'
  if (matricula.startsWith('PT') && nivel.includes('sec')) return 'ST'
  if (matricula.startsWith('PT')) return 'PT'
  if (plantel) return plantel
  if (campus.includes('metepec') && nivel.includes('prees')) return 'PREEM'
  if (campus.includes('toluca') && nivel.includes('prees')) return 'PREET'
  return matricula.slice(0, 2) || 'PT'
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
