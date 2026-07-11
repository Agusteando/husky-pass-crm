<template>
  <div class="gestion-scope-picker" :data-compact="compact ? 'true' : 'false'">
    <label class="scope-field">
      <span>Plantel</span>
      <select :value="normalizedPlantel" :disabled="disabled" :required="required" @change="onPlantel">
        <option value="">Plantel</option>
        <option v-for="plantel in plantelNodes" :key="plantel.value" :value="plantel.value">{{ plantel.label }}</option>
      </select>
    </label>

    <label class="scope-field">
      <span>Grado</span>
      <select :value="normalizedGrado" :disabled="disabled || !normalizedPlantel" @change="onGrado">
        <option value="">Todos</option>
        <option v-for="grado in gradoNodes" :key="grado.value" :value="grado.value">{{ grado.label }}</option>
      </select>
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import type { GestionEscolarScope, GestionEscolarScopeTree, GestionEscolarScopeTreeNode } from '~/types/gestionEscolar'
import { SCHOOL_PLANTELES, normalizeSchoolGrade, normalizeSchoolPlantel, schoolGradesForPlantel } from '~/utils/schoolCatalog'

const props = withDefaults(defineProps<{
  modelValue: GestionEscolarScope
  scopeTree?: GestionEscolarScopeTree | null
  options?: { planteles?: string[]; niveles?: string[]; grados?: string[]; grupos?: string[] } | null
  disabled?: boolean
  required?: boolean
  compact?: boolean
}>(), {
  scopeTree: null,
  options: null,
  disabled: false,
  required: true,
  compact: false
})

const emit = defineEmits<{ 'update:modelValue': [value: GestionEscolarScope] }>()

const fallbackNode = (value: string): GestionEscolarScopeTreeNode => ({ value, label: value, families: 0, students: 0 })
const sortPlanteles = (values: string[]) => [...SCHOOL_PLANTELES].filter((plantel) => values.includes(plantel))
const normalizedPlantel = computed(() => normalizeSchoolPlantel(props.modelValue.plantel) || '')
const normalizedGrado = computed(() => normalizeSchoolGrade(props.modelValue.grado, normalizedPlantel.value) || '')

const plantelNodes = computed(() => {
  const treeValues = (props.scopeTree?.planteles || []).map((node) => normalizeSchoolPlantel(node.value)).filter(Boolean) as string[]
  const optionValues = (props.options?.planteles || []).map((plantel) => normalizeSchoolPlantel(plantel)).filter(Boolean) as string[]
  const values = sortPlanteles(Array.from(new Set([...treeValues, ...optionValues])))
  return values.map(fallbackNode)
})

const gradoNodes = computed(() => schoolGradesForPlantel(normalizedPlantel.value).map(fallbackNode))

function emitScope(plantel: string | null, grado: string | null) {
  emit('update:modelValue', {
    isGlobal: false,
    plantel,
    nivel: null,
    grado,
    grupo: null
  })
}

function onPlantel(event: Event) {
  const plantel = normalizeSchoolPlantel((event.target as HTMLSelectElement | null)?.value || '')
  emitScope(plantel, null)
}

function onGrado(event: Event) {
  const grado = normalizeSchoolGrade((event.target as HTMLSelectElement | null)?.value || '', normalizedPlantel.value)
  emitScope(normalizedPlantel.value || null, grado)
}

watch(() => props.modelValue, () => {
  const plantel = normalizedPlantel.value || null
  const grado = normalizeSchoolGrade(props.modelValue.grado, plantel)
  if (props.modelValue.plantel !== plantel || props.modelValue.nivel || props.modelValue.grupo || props.modelValue.grado !== grado) {
    emitScope(plantel, grado)
  }
}, { deep: true })
</script>

<style scoped>
.gestion-scope-picker {
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
}

.scope-field {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.scope-field span {
  color: #64748b;
  font-size: .72rem;
  font-weight: 850;
  letter-spacing: .06em;
  text-transform: uppercase;
}

.scope-field select {
  background: #fff;
  border: 1px solid #d9e2ea;
  border-radius: 14px;
  color: #17233b;
  min-height: 44px;
  padding: 0 12px;
  width: 100%;
}

.gestion-scope-picker[data-compact='true'] {
  grid-template-columns: 1fr;
}
</style>
