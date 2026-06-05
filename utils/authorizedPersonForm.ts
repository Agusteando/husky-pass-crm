import type { AuthorizedPerson } from '~/types/daycare'

export interface AuthorizedPersonFormModel {
  id: number | null
  indice: number
  paternoP: string
  maternoP: string
  nombreP: string
  parenP: string
  foto: string | null
  compressed_foto: string | null
  fechaP: string
}

export interface AuthorizedPersonValidationState {
  nombreP?: string
  parenP?: string
}

export function dateInputValue(value?: string | null) {
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(String(value || ''))
  return match?.[1] || ''
}

function normalizedIndice(value: unknown) {
  const parsed = Number(value || 1)
  return parsed >= 1 && parsed <= 4 ? parsed : 1
}

function cleanText(value?: string | number | null) {
  return String(value ?? '').trim()
}

function cleanNullableText(value?: string | number | null) {
  const next = cleanText(value)
  return next || null
}

export function createAuthorizedPersonForm(person?: Partial<AuthorizedPerson> | null): AuthorizedPersonFormModel {
  return {
    id: person?.id ? Number(person.id) : null,
    indice: normalizedIndice(person?.indice),
    paternoP: cleanText(person?.paternoP),
    maternoP: cleanText(person?.maternoP),
    nombreP: cleanText(person?.nombreP),
    parenP: cleanText(person?.parenP),
    foto: cleanNullableText(person?.foto),
    compressed_foto: cleanNullableText(person?.compressed_foto),
    fechaP: dateInputValue(person?.fechaP) || new Date().toISOString().slice(0, 10)
  }
}

export function validateAuthorizedPersonForm(form: AuthorizedPersonFormModel): AuthorizedPersonValidationState {
  const errors: AuthorizedPersonValidationState = {}
  if (!cleanText(form.nombreP)) errors.nombreP = 'Captura el nombre.'
  if (!cleanText(form.parenP)) errors.parenP = 'Captura el parentesco.'
  return errors
}

export function authorizedPersonFormIsValid(errors: AuthorizedPersonValidationState) {
  return !Object.values(errors).some(Boolean)
}

export function toAuthorizedPersonSavePayload(form: AuthorizedPersonFormModel): Partial<AuthorizedPerson> {
  return {
    id: form.id || null,
    indice: normalizedIndice(form.indice),
    paternoP: cleanNullableText(form.paternoP),
    maternoP: cleanNullableText(form.maternoP),
    nombreP: cleanText(form.nombreP),
    parenP: cleanText(form.parenP),
    foto: cleanNullableText(form.foto),
    compressed_foto: cleanNullableText(form.compressed_foto),
    fechaP: cleanNullableText(form.fechaP)
  }
}
