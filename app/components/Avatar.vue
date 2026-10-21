<script setup lang="ts">
import { Person } from '~~/types/person';
defineProps<{ person: Person; size?: number; showPresence?: boolean }>();
</script>

<template>
  <div class="relative shrink-0">
    <img v-if="person.avatarUrl" :src="person.avatarUrl" :alt="person.name" class="rounded-full object-cover"
      :style="{ width: `${size ?? 40}px`, height: `${size ?? 40}px` }" :title="person.name"
      :data-testid="`avatar-${person.id}`" />
    <div v-else class="grid place-items-center rounded-full font-mono font-medium tracking-[-.08em] text-void"
      :style="{ width: `${size ?? 40}px`, height: `${size ?? 40}px`, backgroundColor: person.color, fontSize: `${Math.max(9, (size ?? 40) * .27)}px` }"
      :title="person.name" :data-testid="`avatar-${person.id}`">{{ person.initials }}</div>
    <span v-if="showPresence && person.online"
      class="presence-pulse absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-panel bg-mint" />
  </div>
</template>