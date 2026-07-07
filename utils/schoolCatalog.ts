import { normalizeMatricula } from './matricula'

export const SCHOOL_PLANTELES = ['PM', 'PT', 'SM', 'ST', 'PREEM', 'GM', 'CT'] as const
export type SchoolPlantelCode = typeof SCHOOL_PLANTELES[number]

const SCHOOL_PLANTEL_SET = new Set<string>(SCHOOL_PLANTELES)
const FULL_GRADE_PLANTELES = new Set<string>(['PM', 'PT', 'SM', 'ST'])

const GRADE_ORDER = ['primero', 'segundo', 'tercero', 'cuarto', 'quinto', 'sexto'] as const
export type SchoolGrade = typeof GRADE_ORDER[number]

const GRADE_ALIASES: Record<string, SchoolGrade> = {
  '1': 'primero',
  '1°': 'primero',
  '1º': 'primero',
  primero: 'primero',
  primera: 'primero',
  '2': 'segundo',
  '2°': 'segundo',
  '2º': 'segundo',
  segundo: 'segundo',
  segunda: 'segundo',
  '3': 'tercero',
  '3°': 'tercero',
  '3º': 'tercero',
  tercero: 'tercero',
  tercera: 'tercero',
  '4': 'cuarto',
  '4°': 'cuarto',
  '4º': 'cuarto',
  cuarto: 'cuarto',
  cuarta: 'cuarto',
  '5': 'quinto',
  '5°': 'quinto',
  '5º': 'quinto',
  quinto: 'quinto',
  quinta: 'quinto',
  '6': 'sexto',
  '6°': 'sexto',
  '6º': 'sexto',
  sexto: 'sexto',
  sexta: 'sexto'
}

function cleanUpper(value?: string | number | null) {
  return String(value ?? '').trim().toUpperCase()
}

function cleanLower(value?: string | number | null) {
  return String(value ?? '').trim().toLowerCase()
}

function lettersOnly(value?: string | number | null) {
  return cleanUpper(value).replace(/[0-9]/g, '').replace(/[^A-Z]/g, '')
}

export function normalizeSchoolPlantel(value?: string | number | null): SchoolPlantelCode | null {
  const direct = cleanUpper(value).replace(/\s+/g, '')
  if (SCHOOL_PLANTEL_SET.has(direct)) return direct as SchoolPlantelCode

  const letters = lettersOnly(value)
  if (SCHOOL_PLANTEL_SET.has(letters)) return letters as SchoolPlantelCode

  const byPrefix = [...SCHOOL_PLANTELES]
    .sort((left, right) => right.length - left.length)
    .find((plantel) => letters.startsWith(plantel))
  return byPrefix || null
}

export function deriveSchoolPlantelFromMatricula(value?: string | number | null): SchoolPlantelCode | null {
  const matricula = normalizeMatricula(value)
  if (!matricula) return null
  return normalizeSchoolPlantel(lettersOnly(matricula))
}

export function schoolGradesForPlantel(plantel?: string | number | null): SchoolGrade[] {
  const normalized = normalizeSchoolPlantel(plantel)
  const limit = normalized && FULL_GRADE_PLANTELES.has(normalized) ? 6 : 3
  return GRADE_ORDER.slice(0, limit) as SchoolGrade[]
}

export function normalizeSchoolGrade(value?: string | number | null, plantel?: string | number | null): SchoolGrade | null {
  const raw = cleanLower(value)
  if (!raw) return null
  const normalized = GRADE_ALIASES[raw] || GRADE_ALIASES[raw.replace(/\s+/g, '')] || null
  if (!normalized) return null
  return schoolGradesForPlantel(plantel).includes(normalized) ? normalized : null
}


export function normalizeSchoolGradeForPlanteles(value?: string | number | null, planteles: Array<string | number | null | undefined> = []): SchoolGrade | null {
  const normalizedPlanteles = planteles.map((plantel) => normalizeSchoolPlantel(plantel)).filter(Boolean)
  if (!normalizedPlanteles.length) return normalizeSchoolGrade(value, null)
  for (const plantel of normalizedPlanteles) {
    const grade = normalizeSchoolGrade(value, plantel)
    if (grade) return grade
  }
  return null
}

export function compareSchoolPlanteles(left?: string | null, right?: string | null) {
  return SCHOOL_PLANTELES.indexOf(normalizeSchoolPlantel(left) as SchoolPlantelCode) - SCHOOL_PLANTELES.indexOf(normalizeSchoolPlantel(right) as SchoolPlantelCode)
}

export function compareSchoolGrades(left?: string | null, right?: string | null, plantel?: string | null) {
  const grades = schoolGradesForPlantel(plantel)
  return grades.indexOf(normalizeSchoolGrade(left, plantel) as SchoolGrade) - grades.indexOf(normalizeSchoolGrade(right, plantel) as SchoolGrade)
}

export function schoolPlantelSqlFromMatricula(expression: string) {
  return `CASE
    WHEN UPPER(${expression}) LIKE 'PREEM%' THEN 'PREEM'
    WHEN UPPER(${expression}) LIKE 'PM%' THEN 'PM'
    WHEN UPPER(${expression}) LIKE 'PT%' THEN 'PT'
    WHEN UPPER(${expression}) LIKE 'SM%' THEN 'SM'
    WHEN UPPER(${expression}) LIKE 'ST%' THEN 'ST'
    WHEN UPPER(${expression}) LIKE 'GM%' THEN 'GM'
    WHEN UPPER(${expression}) LIKE 'CT%' THEN 'CT'
    ELSE NULL
  END`
}
