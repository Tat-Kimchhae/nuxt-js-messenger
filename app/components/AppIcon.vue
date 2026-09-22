<script setup lang="ts">
defineProps<{ name: string; size?: number }>();
</script>

<template>
  <svg :width="size ?? 18" :height="size ?? 18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <template v-if="name === 'search'">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </template>
    <template v-else-if="name === 'edit'">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </template>
    <template v-else-if="name === 'sliders'">
      <path d="M4 6h16M7 12h10M10 18h4" />
      <circle cx="8" cy="6" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="12" cy="18" r="1.5" />
    </template>
    <template v-else-if="name === 'settings'">
      <circle cx="12" cy="12" r="3" />
      <path
        d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 1.7-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-2.4v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1L8 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H6.7v-2.4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9L8 8.6l1.7-1.7.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.2h2.4v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.7 1.7-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2V14h-.2a1.7 1.7 0 0 0-1.5 1Z" />
    </template>
    <template v-else-if="name === 'arrow-left'">
      <path d="m15 18-6-6 6-6" />
      <path d="M9 12h10" />
    </template>
    <template v-else-if="name === 'phone'">
      <path
        d="M21 16.7v2a1.4 1.4 0 0 1-1.5 1.4 16.3 16.3 0 0 1-7.1-2.5 16 16 0 0 1-5-5A16.3 16.3 0 0 1 5 5.5 1.4 1.4 0 0 1 6.4 4h2a1.4 1.4 0 0 1 1.4 1.2 9.2 9.2 0 0 0 .5 2 1.4 1.4 0 0 1-.3 1.5L9.2 9.6a11.4 11.4 0 0 0 5.2 5.2l.9-.8a1.4 1.4 0 0 1 1.5-.3 9.2 9.2 0 0 0 2 .5A1.4 1.4 0 0 1 21 16.7Z" />
    </template>
    <template v-else-if="name === 'video'">
      <rect x="3" y="5" width="13" height="14" rx="2" />
      <path d="m16 10 5-3v10l-5-3" />
    </template>
    <template v-else-if="name === 'more'">
      <circle cx="5" cy="12" r="1" fill="currentColor" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <circle cx="19" cy="12" r="1" fill="currentColor" />
    </template>
    <template v-else-if="name === 'smile'">
      <circle cx="12" cy="12" r="8" />
      <path d="M8.5 14.5s1.2 2 3.5 2 3.5-2 3.5-2M9 10h.01M15 10h.01" />
    </template>
    <template v-else-if="name === 'paperclip'">
      <path d="m20.5 11.5-7.8 7.8a5 5 0 0 1-7.1-7.1l8.5-8.5a3.5 3.5 0 0 1 5 5L10.5 17a2 2 0 0 1-2.8-2.8l8.5-8.5" />
    </template>
    <template v-else-if="name === 'send'">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </template>
    <template v-else-if="name === 'close'">
      <path d="m6 6 12 12M18 6 6 18" />
    </template>
    <template v-else-if="name === 'sun'">
      <circle cx="12" cy="12" r="4" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
    </template>
    <template v-else-if="name === 'moon'">
      <path d="M20.7 15.1A8.6 8.6 0 0 1 8.9 3.3 8.7 8.7 0 1 0 20.7 15.1Z" />
    </template>
    <template v-else-if="name === 'user-plus'">
      <path d="M15 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-3A4.5 4.5 0 0 0 3 18.5V20" />
      <circle cx="9" cy="7" r="3.5" />
      <path d="M19 8v6M16 11h6" />
    </template>
    <template v-else-if="name === 'users'">
      <path d="M16 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-3A4.5 4.5 0 0 0 4 18.5V20" />
      <circle cx="10" cy="7" r="3.5" />
      <path d="M16 4.5a3.5 3.5 0 0 1 0 6.8M20 20v-1.5a4.5 4.5 0 0 0-3-4.2" />
    </template>
    <template v-else-if="name === 'check'">
      <path d="m5 12 4 4L19 6" />
    </template>
    <template v-else-if="name === 'message'">
      <path d="M20 11.5a7 7 0 0 1-7.5 7 8 8 0 0 1-3.2-.7L4 19l1.4-4.3a7 7 0 1 1 14.6-3.2Z" />
    </template>
    <template v-else-if="name === 'bell-off'">
      <path d="M13.7 19a2 2 0 0 1-3.4 0M18 9a6 6 0 0 0-9.4-5M6.3 6.3A6 6 0 0 0 6 9c0 7-3 7-3 8h14M3 3l18 18" />
    </template>
    <template v-else-if="name === 'logout'">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </template>
  </svg>
</template>