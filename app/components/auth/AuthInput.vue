<script setup lang="ts">
defineProps<{ modelValue: string; type?: string; placeholder: string; error?: string }>()
defineEmits(['update:modelValue'])
</script>
<template>
  <div>
    <input
        :type="type || 'text'"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :placeholder="placeholder"
        :class="['w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 text-sm bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white dark:placeholder-slate-400',
        error ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-slate-600 focus:ring-blue-500']"
    />
    <p v-if="error" class="text-red-500 text-xs mt-1 pl-1">{{ error }}</p>
  </div>
</template>