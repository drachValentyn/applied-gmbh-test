<template>
  <div class="scheduler-container">
    <h1>Script Execution Planner</h1>

    <div class="input-section">
      <label>Input Scripts (JSON):</label>
      <textarea v-model="inputText" spellcheck="false"></textarea>

      <div class="file-upload-section">
        <label for="file-input" class="btn-secondary">
          📁 Upload JSON File
        </label>
        <input
          id="file-input"
          type="file"
          accept=".json"
          @change="handleFileUpload"
        />
        <span v-if="fileName" class="file-name">{{ fileName }}</span>
      </div>

      <button @click="handleSortByWaves" class="btn-primary">
        Generate Execution Plan
      </button>
      <p v-if="error" class="error-msg">{{ error }}</p>
    </div>

    <div v-if="resultPlan" class="results-section">
      <div class="meta">
        <span
          class="efficiency-badge"
          :class="{ 'is-high': resultPlan.efficiency > 0.8 }"
        >
          Efficiency: {{ resultPlan.efficiency }}
        </span>
      </div>

      <div class="waves-list">
        <h3>Execution Waves</h3>
        <div
          v-for="(wave, index) in resultPlan.waves"
          :key="index"
          class="wave-card"
        >
          <span class="wave-label">Wave {{ index + 1 }}</span>
          <div class="wave-items">
            <span
              v-for="id in wave"
              :key="id"
              class="script-tag"
              >{{ id }}</span
            >
          </div>
        </div>
      </div>

      <div v-if="resultPlan.warnings.length" class="warnings-box">
        <h3>Warnings</h3>
        <ul>
          <li v-for="warn in resultPlan.warnings" :key="warn">{{ warn }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { sortByWaves, type ExecutionPlan } from './utils/sortByWaves';

const inputText = ref<string>(JSON.stringify([
  { "scriptId": 1, "dependencies": [] },
  { "scriptId": 2, "dependencies": [1] },
  { "scriptId": 3, "dependencies": [1, 2] },
  { "scriptId": 4, "dependencies": [99] }
], null, 2));

const resultPlan = ref<ExecutionPlan | null>(null);
const error = ref<string>('');
const fileName = ref<string>('');

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file){
    return;
  }

  fileName.value = file.name;
  const reader = new FileReader();

  reader.onload = (e) => {
    const content = e.target?.result as string;
    inputText.value = content;
    handleSortByWaves();
  };

  reader.readAsText(file);
};

const handleSortByWaves = () => {
  try {
    error.value = '';
    const parsed = JSON.parse(inputText.value);

    if (!Array.isArray(parsed)) {
      throw new Error("Input must be an array");
    }

    resultPlan.value = sortByWaves(parsed);

  } catch (e: any) {
    error.value = "Invalid JSON format";
    resultPlan.value = null;
  }
};
</script>

<style lang="scss" scoped>
$primary-color: #42b883;
$primary-hover: #33a06f;
$bg-main: #f8fafc;
$text-dark: #2c3e50;
$border-color: #e2e8f0;
$error-color: #ef4444;
$warning-bg: #fffbeb;
$warning-text: #92400e;
$success-color: #22c55e;

@mixin card-shadow {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.scheduler-container {
  width: 650px;
  margin: 2rem auto;
  padding: 2rem;
  background: $bg-main;
  border-radius: 12px;
  font-family: 'Inter', system-ui, sans-serif;

  h1 {
    color: $text-dark;
    font-size: 1.8rem;
    margin-bottom: 2rem;
    text-align: center;
  }
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  label {
    font-weight: 600;
    color: #4b5563;
  }

  textarea {
    max-width: 100%;
    height: 200px;
    padding: 1rem;
    margin: 1rem;
    border: 2px solid $border-color;
    border-radius: 8px;
    font-family: 'Fira Code', monospace;
    font-size: 0.6rem;
    resize: vertical;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: $primary-color;
    }
  }

  .btn-primary {
    align-self: center;
    background: $primary-color;
    color: white;
    border: none;
    padding: 0.8rem 2rem;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: $primary-hover;
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }

  .error-msg {
    color: $error-color;
    font-size: 0.9rem;
    font-weight: 500;
  }
}

.results-section {
  margin-top: 1.5rem;
  border-top: 2px solid $border-color;
  padding-top: 2rem;

  .meta {
    margin-bottom: 1.5rem;

    .efficiency-badge {
      display: inline-block;
      padding: 0.4rem 0.8rem;
      background: #64748b;
      color: white;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 700;

      &.is-high {
        background: $success-color;
      }
    }
  }
}

.waves-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  h3 { color: #1e293b; margin-bottom: 0.5rem; }

  .wave-card {
    @include card-shadow;
    background: white;
    padding: 0.6rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    border-left: 5px solid $primary-color;

    .wave-label {
      min-width: 100px;
      font-weight: 700;
      color: #64748b;
      font-size: 0.9rem;
    }

    .script-tag {
      display: inline-block;
      background: #f1f5f9;
      padding: 0.2rem 0.8rem;
      margin: 0 0.3rem;
      border-radius: 4px;
      font-weight: 600;
      color: $text-dark;
    }
  }
}

.warnings-box {
  margin-top: 1rem;
  background: $warning-bg;
  border: 1px solid #fde68a;
  padding: 1rem;
  border-radius: 8px;

  h3 { color: $warning-text; margin-top: 0; }

  ul {
    margin: 0;
    padding-left: 1rem;
    li { color: $warning-text; font-weight: 500; margin-bottom: 0.4rem; }
  }
}

.file-upload-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;

  #file-input {
    display: none;
  }

  .btn-secondary {
    margin: 1rem;
    display: inline-block;
    background: #64748b;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    transition: background 0.2s;

    &:hover {
      background: #475569;
    }
  }

  .file-name {
    font-size: 0.85rem;
    color: $text-dark;
    font-style: italic;
  }
}
</style>
