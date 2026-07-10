<template>
  <div class="attendance-header-container">
    <header class="attendance-header" data-product-component="family-attendance-header">
      <div class="attendance-identity">
        <div class="student-avatar" :data-has-photo="Boolean(studentPhoto)">
          <FamilyPersonasProcessedPhoto
            v-if="studentPhoto"
            :src="studentPhoto"
            namespace="attendance-student-photo"
            :alt="studentName"
            loading="eager"
          />
          <span v-else>{{ studentInitials }}</span>
        </div>

        <div class="attendance-identity-copy">
          <p class="attendance-eyebrow">Asistencia y accesos</p>
          <h1>{{ studentName }}</h1>
          <p v-if="studentDetails" class="attendance-description">{{ studentDetails }}</p>
        </div>
      </div>

      <div class="attendance-controls" aria-label="Contexto de asistencia">
        <button class="cycle-control" type="button" data-testid="attendance-open-cycles" @click="$emit('open-cycles')">
          <FamilyPersonasIcon name="calendar" />
          <span>
            <small>Este ciclo escolar</small>
            <strong>{{ schoolYear }}</strong>
          </span>
          <FamilyPersonasIcon name="chevron" />
        </button>

        <button class="history-control btn btn-secondary" type="button" @click="$emit('open-cycles')">
          Ciclos anteriores
          <FamilyPersonasIcon name="arrow" />
        </button>

        <label v-if="children.length > 1" class="student-control">
          <span>Alumno</span>
          <select
            :value="selectedMatricula"
            class="select"
            data-testid="attendance-child-select"
            @change="selectStudent"
          >
            <option v-for="child in children" :key="child.matricula" :value="child.matricula">
              {{ child.name }}
            </option>
          </select>
        </label>
      </div>
    </header>
  </div>
</template>

<script setup lang="ts">
interface AttendanceHeaderChild {
  matricula: string
  name: string
}

withDefaults(defineProps<{
  studentName: string
  studentDetails?: string
  studentPhoto?: string
  studentInitials?: string
  schoolYear: string
  children?: AttendanceHeaderChild[]
  selectedMatricula?: string
}>(), {
  studentDetails: '',
  studentPhoto: '',
  studentInitials: 'A',
  children: () => [],
  selectedMatricula: ''
})

const emit = defineEmits<{
  'open-cycles': []
  'select-student': [matricula: string]
}>()

function selectStudent(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('select-student', target.value)
}
</script>

<style scoped>
.attendance-header-container {
  container-name: attendance-header;
  container-type: inline-size;
  width: 100%;
}

.attendance-header {
  align-items: center;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, .98) 0%, rgba(255, 255, 255, .91) 52%, rgba(255, 255, 255, .7) 100%),
    url('/personas-autorizadas/backdrops/husky-pass-soft-safety-hero.png') right center / cover no-repeat;
  border: 1px solid #e2e8ec;
  border-radius: 26px;
  box-shadow: 0 18px 48px rgba(30, 53, 78, .07);
  display: grid;
  gap: clamp(24px, 3cqw, 42px);
  grid-template-columns: minmax(360px, .9fr) minmax(0, 1.45fr);
  min-height: 190px;
  overflow: hidden;
  padding: 24px;
  position: relative;
}

.attendance-header::after {
  background: linear-gradient(180deg, rgba(var(--pa-primary-rgb), .16), rgba(var(--pa-primary-rgb), 0));
  border-radius: 999px;
  content: '';
  height: 124px;
  left: 56%;
  opacity: .38;
  pointer-events: none;
  position: absolute;
  top: 18px;
  width: 124px;
}

.attendance-identity,
.attendance-controls {
  min-width: 0;
  position: relative;
  z-index: 1;
}

.attendance-identity {
  align-items: center;
  display: grid;
  gap: 18px;
  grid-template-columns: 82px minmax(0, 1fr);
}

.student-avatar {
  align-items: center;
  aspect-ratio: 1;
  background: #eef6ff;
  border: 1px solid #d4e2f0;
  border-radius: 999px;
  box-shadow: 0 12px 26px rgba(23, 42, 74, .12);
  color: var(--pa-primary);
  display: grid;
  font-family: var(--font-title);
  font-size: 1.2rem;
  font-weight: 900;
  height: 82px;
  justify-items: center;
  overflow: hidden;
  width: 82px;
}

.attendance-identity-copy {
  min-width: 0;
}

.attendance-eyebrow,
.attendance-description,
.attendance-identity-copy h1 {
  margin: 0;
}

.attendance-eyebrow {
  color: var(--pa-primary);
  font-size: .7rem;
  font-weight: 850;
  letter-spacing: .14em;
  margin-bottom: 7px;
  text-transform: uppercase;
}

.attendance-identity-copy h1 {
  color: #1f2d46;
  font-size: clamp(1.8rem, 2.9cqw, 2.65rem);
  font-weight: 700;
  line-height: 1.03;
  text-wrap: balance;
}

.attendance-description {
  color: #6e788a;
  font-size: .84rem;
  font-weight: 650;
  line-height: 1.45;
  margin-top: 8px;
}

.attendance-controls {
  align-items: end;
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(216px, 238px) max-content minmax(220px, 1fr);
}

.cycle-control {
  align-items: center;
  background: linear-gradient(180deg, #fff, #f8fffb);
  border: 1px solid #bdd8ce;
  border-radius: 14px;
  color: #0f6b52;
  cursor: pointer;
  display: grid;
  gap: 11px;
  grid-template-columns: auto minmax(0, 1fr) auto;
  min-height: 56px;
  padding: 9px 12px;
  text-align: left;
  width: 100%;
}

.cycle-control > .pa-icon:first-child {
  height: 1.45rem;
  width: 1.45rem;
}

.cycle-control span {
  display: grid;
  gap: 1px;
  min-width: 0;
}

.cycle-control small,
.student-control > span {
  color: #6f7b8f;
  font-size: .72rem;
  font-weight: 900;
  letter-spacing: .045em;
  text-transform: uppercase;
}

.cycle-control strong {
  color: #0f7a5b;
  font-family: var(--font-title);
  font-size: 1.18rem;
  line-height: 1;
}

.history-control {
  align-self: end;
  min-height: 44px;
  white-space: nowrap;
}

.student-control {
  display: grid;
  gap: 5px;
  min-width: 0;
}

.student-control .select {
  max-width: 100%;
  min-width: 0;
  width: 100%;
}

@container attendance-header (max-width: 1120px) {
  .attendance-header {
    align-items: stretch;
    grid-template-columns: 1fr;
    min-height: 0;
  }

  .attendance-controls {
    grid-template-columns: minmax(216px, 238px) max-content minmax(220px, 1fr);
  }
}

@container attendance-header (max-width: 760px) {
  .attendance-header {
    gap: 20px;
    padding: 20px;
  }

  .attendance-identity {
    grid-template-columns: 72px minmax(0, 1fr);
  }

  .student-avatar {
    height: 72px;
    width: 72px;
  }

  .attendance-identity-copy h1 {
    font-size: clamp(1.65rem, 6.5cqw, 2.2rem);
  }

  .attendance-controls {
    align-items: stretch;
    grid-template-columns: 1fr;
  }

  .history-control,
  .student-control {
    width: 100%;
  }
}

@container attendance-header (max-width: 480px) {
  .attendance-header {
    border-radius: 20px;
    padding: 18px;
  }

  .attendance-identity {
    align-items: start;
    gap: 14px;
    grid-template-columns: 62px minmax(0, 1fr);
  }

  .student-avatar {
    height: 62px;
    width: 62px;
  }

  .attendance-eyebrow {
    font-size: .64rem;
    letter-spacing: .11em;
  }
}
</style>
