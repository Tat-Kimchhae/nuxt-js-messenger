<script setup lang="ts">
import Avatar from './Avatar.vue';
import AppIcon from './AppIcon.vue';

type Person = { id: string; name: string; initials: string; color: string; online?: boolean };
type Conversation = { id: string; title: string; kind: 'direct' | 'group'; members: Person[] };
defineProps<{ conversation: Conversation; detailsOpen: boolean }>();
const emit = defineEmits<{ back: []; toggleDetails: [] }>();
</script>

<template>
  <header class="flex h-[72px] shrink-0 items-center justify-between border-b border-line bg-surface-chat/95 px-4 sm:px-6 dark:bg-[#19191f]/95">
    <div class="flex min-w-0 items-center gap-3">
       <button data-testid="button-back-to-conversations" class="mr-1 grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-dim transition hover:bg-black/5 hover:text-ink dark:hover:bg-white/5 md:hidden" title="Back to conversations" @click="emit('back')">
        <AppIcon name="arrow-left" :size="18" />
      </button>
      <div v-if="conversation.kind === 'direct'">
        <Avatar :person="conversation.members[0]" :size="39" :show-presence="true" />
      </div>
      <div v-else class="flex -space-x-3">
        <Avatar v-for="person in conversation.members.slice(0, 3)" :key="person.id" :person="person" :size="30" />
      </div>
      <div class="min-w-0">
        <h1 class="truncate text-[14px] font-semibold tracking-[-.02em]">{{ conversation.title }}</h1>
        <p class="mt-0.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[.1em] text-ink-faint">
          <span v-if="conversation.kind === 'direct'" class="text-mint">online</span>
          <template v-else>{{ conversation.members.length + 1 }} members</template>
        </p>
      </div>
    </div>
    <div class="flex items-center gap-1">
       <button data-testid="button-call" class="grid h-9 w-9 place-items-center rounded-full text-ink-dim transition hover:bg-black/5 hover:text-ink dark:hover:bg-white/5" title="Start audio call"><AppIcon name="phone" :size="17" /></button>
       <button data-testid="button-video-call" class="grid h-9 w-9 place-items-center rounded-full text-ink-dim transition hover:bg-black/5 hover:text-ink dark:hover:bg-white/5" title="Start video call"><AppIcon name="video" :size="18" /></button>
       <button data-testid="button-conversation-details" class="grid h-9 w-9 place-items-center rounded-full transition hover:bg-black/5 hover:text-ink dark:hover:bg-white/5" :class="detailsOpen ? 'text-plum' : 'text-ink-dim'" title="Conversation details" @click="emit('toggleDetails')"><AppIcon name="more" :size="18" /></button>
    </div>
  </header>
</template>