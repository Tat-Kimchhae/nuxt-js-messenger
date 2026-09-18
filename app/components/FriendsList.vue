<script setup lang="ts">
import Avatar from './Avatar.vue';
import AppIcon from './AppIcon.vue';

type Person = { id: string; name: string; initials: string; color: string; online?: boolean };

defineProps<{ friends: Person[] }>();
const emit = defineEmits<{ start: [person: Person] }>();
</script>

<template>
  <section class="border-t border-line px-3 pb-3 pt-4">
    <div class="flex items-center justify-between px-3 pb-2">
      <div class="flex items-center gap-2">
        <AppIcon name="users" :size="13" class="text-ink-faint" />
        <span class="font-mono text-[10px] uppercase tracking-[.16em] text-ink-faint">Friends</span>
      </div>
      <span class="font-mono text-[10px] text-ink-faint">{{ friends.length }}</span>
    </div>

    <div class="scrollbar-thin max-h-[190px] space-y-0.5 overflow-y-auto">
      <button
        v-for="friend in friends"
        :key="friend.id"
        :data-testid="`button-friend-${friend.id}`"
        class="group flex w-full items-center gap-3 rounded-[13px] px-3 py-2 text-left transition hover:bg-black/[.035] dark:hover:bg-white/[.035]"
        @click="emit('start', friend)"
      >
        <Avatar :person="friend" :size="32" :show-presence="true" />
        <span class="min-w-0 flex-1">
          <span class="block truncate text-[12px] font-medium text-ink/90">{{ friend.name }}</span>
          <span class="mt-0.5 block font-mono text-[9px] uppercase tracking-[.08em] text-ink-faint">
            {{ friend.online ? 'online' : 'offline' }}
          </span>
        </span>
        <span class="grid h-7 w-7 place-items-center rounded-full text-ink-faint opacity-0 transition group-hover:opacity-100 group-hover:text-plum">
          <AppIcon name="message" :size="14" />
        </span>
      </button>
    </div>
  </section>
</template>