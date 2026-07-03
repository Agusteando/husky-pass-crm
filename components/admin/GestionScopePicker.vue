<template>
  <div class="gestion-scope-picker" :data-compact="compact ? 'true' : 'false'">
    <label class="scope-field">
      <span>Plantel</span>
      <select :value="modelValue.plantel || ''" :disabled="disabled" :required="required" @change="onSelect('plantel', $event)">
        <option value="">Plantel</option>
        <option v-for="plantel in plantelNodes" :key="plantel.value" :value="plantel.value">{{ plantel.label }}</option>
      </select>
    </label>

    <label class="scope-field">
      <span>Nivel</span>
      <select :value="modelValue.nivel || ''" :disabled="disabled || !modelValue.plantel" @change="onSelect('nivel', $event)">
        <option value="">Todos</option>
        <option v-for="nivel in nivelNodes" :key="nivel.value" :value="nivel.value">{{ nivel.label }}</option>
      </select>
    </label>

    <label class="scope-field">
      <span>Grado</span>
      <select :value="modelValue.grado || ''" :disabled="disabled || !modelValue.plantel" @change="onSelect('grado', $event)">
        <option value="">Todos</option>
        <option v-for="grado in gradoNodes" :key="grado.value" :value="grado.value">{{ grado.label }}</option>
      </select>
    </label>

    <label class="scope-field">
      <span>Grupo</span>
      <select :value="modelValue.grupo || ''" :disabled="disabled || !modelValue.plantel" @change="onSelect('grupo', $event)">
        <option value="">Todos</option>
        <option v-for="grupo in grupoNodes" :key="grupo.value" :value="grupo.value">{{ grupo.label }}</option>
      </select>
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import type { GestionEscolarScope, GestionEscolarScopeTree, GestionEscolarScopeTreeNode } from '~/types/gestionEscolar'

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
const clean = (value?: string | null) => String(value || '').trim()
const sortNodes = (nodes: GestionEscolarScopeTreeNode[]) => nodes.slice().sort((a, b) => a.label.localeCompare(b.label, 'es', { numeric: true }))

const plantelNodes = computed(() => {
  const treeNodes = props.scopeTree?.planteles || []
  if (treeNodes.length) return sortNodes(treeNodes)
  return (props.options?.planteles || []).map(fallbackNode)
})

const selectedPlantelNode = computed(() => plantelNodes.value.find((node) => node.value === clean(props.modelValue.plantel)))
const nivelNodes = computed(() => {
  const treeNodes = selectedPlantelNode.value?.children || []
  if (treeNodes.length) return sortNodes(treeNodes)
  return (props.options?.niveles || []).map(fallbackNode)
})
const selectedNivelNode = computed(() => nivelNodes.value.find((node) => node.value === clean(props.modelValue.nivel)))
const gradoNodes = computed(() => {
  const treeNodes = selectedNivelNode.value?.children || selectedPlantelNode.value?.children?.flatMap((node) => node.children || []) || []
  if (treeNodes.length) return sortNodes(uniqueNodes(treeNodes))
  return (props.options?.grados || []).map(fallbackNode)
})
const selectedGradoNode = computed(() => gradoNodes.value.find((node) => node.value === clean(props.modelValue.grado)))
const grupoNodes = computed(() => {
  const treeNodes = selectedGradoNode.value?.children || gradoNodes.value.flatMap((node) => node.children || [])
  if (treeNodes.length) return sortNodes(uniqueNodes(treeNodes))
  return (props.options?.grupos || []).map(fallbackNode)
})

function uniqueNodes(nodes: GestionEscolarScopeTreeNode[]) {
  const map = new Map<string, GestionEscolarScopeTreeNode>()
  nodes.forEach((node) => {
    if (!map.has(node.value)) map.set(node.value, node)
  })
  return Array.from(map.values())
}

function onSelect(field: 'plantel' | 'nivel' | 'grado' | 'grupo', event: Event) {
  updateField(field, (event.target as HTMLSelectElement | null)?.value || '')
}

function updateField(field: 'plantel' | 'nivel' | 'grado' | 'grupo', raw: string) {
  const value = clean(raw) || null
  const next: GestionEscolarScope = {
    isGlobal: false,
    plantel: clean(props.modelValue.plantel) || null,
    nivel: clean(props.modelValue.nivel) || null,
    grado: clean(props.modelValue.grado) || null,
    grupo: clean(props.modelValue.grupo) || null
  }
  next[field] = value
  if (field === 'plantel') {
    next.nivel = null
    next.grado = null
    next.grupo = null
  }
  if (field === 'nivel') {
    next.grado = null
    next.grupo = null
  }
  if (field === 'grado') next.grupo = null
  emit('update:modelValue', next)
}

watch(() => props.modelValue, (scope) => {
  const plantel = clean(scope.plantel)
  if (!plantel) return
  const next: GestionEscolarScope = { isGlobal: false, plantel, nivel: clean(scope.nivel) || null, grado: clean(scope.grado) || null, grupo: clean(scope.grupo) || null }
  let changed = false
  if (next.nivel && !nivelNodes.value.some((node) => node.value === next.nivel)) { next.nivel = null; next.grado = null; next.grupo = null; changed = true }
  if (next.grado && !gradoNodes.value.some((node) => node.value === next.grado)) { next.grado = null; next.grupo = null; changed = true }
  if (next.grupo && !grupoNodes.value.some((node) => node.value === next.grupo)) { next.grupo = null; changed = true }
  if (changed) emit('update:modelValue', next)
}, { deep: true })
</script>

<style scoped>
.gestion-scope-picker {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
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
  min-width: 0;
  padding: 0 12px;
  width: 100%;
}

.gestion-scope-picker[data-compact='true'] {
  gap: 8px;
}

.gestion-scope-picker[data-compact='true'] .scope-field select {
  min-height: 40px;
}

@media (max-width: 980px) {
  .gestion-scope-picker {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 620px) {
  .gestion-scope-picker {
    grid-template-columns: 1fr;
  }
}
</style>
