<script setup lang="ts">
import Avatar from './Avatar.vue';
import AppIcon from './AppIcon.vue';

type Person = { id: string; name: string; initials: string; color: string; online?: boolean };
type Conversation = { id: string; title: string; kind: 'direct' | 'group'; members: Person[]; preview: string; time: string; unread: number; accent: string };
defineProps<{ conversations: Conversation[]; activeId: string }>();
const emit = defineEmits<{ select: [id: string] }>();
</script>

<template>
  <div v-if="conversations.length" class="scrollbar-thin flex-1 overflow-y-auto px-3 pb-4">
    <button
      v-for="conversation in conversations"
      :key="conversation.id"
      :data-testid="`button-conversation-${conversation.id}`"
      class="group relative flex w-full items-center gap-3 rounded-[15px] px-3 py-3 text-left transition"
       :class="activeId === conversation.id ? 'bg-panel-raised' : 'hover:bg-black/[.035] dark:hover:bg-white/[.035]'"
      @click="emit('select', conversation.id)"
    >
      <div v-if="activeId === conversation.id" class="absolute bottom-3 left-0 top-3 w-[3px] rounded-r-full bg-plum" />
      <div v-if="conversation.kind === 'direct'" class="relative">
        <Avatar :person="conversation.members[0]" :size="43" :show-presence="true" />
      </div>
      <div v-else class="flex w-[43px] shrink-0 -space-x-3">
        <Avatar v-for="person in conversation.members.slice(0, 2)" :key="person.id" :person="person" :size="32" />
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-center justify-between gap-2">
          <p class="truncate text-[13px] font-medium" :class="activeId === conversation.id ? 'text-ink' : 'text-ink/85'">{{ conversation.title }}</p>
          <span class="shrink-0 font-mono text-[9px] text-ink-faint">{{ conversation.time }}</span>
        </div>
        <div class="mt-1 flex items-center gap-2">
          <p class="truncate text-[11px] text-ink-faint">{{ conversation.preview }}</p>
          <span v-if="conversation.unread" class="ml-auto grid h-4 min-w-4 shrink-0 place-items-center rounded-full bg-plum px-1 font-mono text-[9px] font-medium text-void">{{ conversation.unread }}</span>
        </div>
      </div>
    </button>
  </div>
  <div v-else class="flex flex-1 flex-col items-center justify-center px-8 pb-20 text-center">
    <div class="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-panel-raised text-ink-faint"><AppIcon name="search" :size="19" /></div>
    <p class="text-sm font-medium">No matches found</p>
    <p class="mt-1 text-xs leading-5 text-ink-faint">Try searching for a name or a phrase.</p>
  </div>
</template>