<script setup lang="ts">
import { ref } from 'vue';
import Avatar from './Avatar.vue';
import AppIcon from './AppIcon.vue';
import type { Person } from '~~/types/person.ts';

type FriendProfile = Person & { username: string };
type FriendRequest = { id: string; person: Person; username: string; time: string };

const props = defineProps<{
  people: FriendProfile[];
  suggestedFriends: Person[];
  pendingRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  isLoading: boolean;
}>();

const emit = defineEmits<{
  close: [];
  add: [person: FriendProfile];
  accept: [request: FriendRequest];
  decline: [request: FriendRequest];
  cancel: [request: FriendRequest];
}>();

const query = ref('');

function hasSentRequest(personId: string) {
  return props.sentRequests.some((request) => request.person.id === personId);
}
</script>

<template>
  <div class="fixed inset-0 z-[60] flex justify-end" data-testid="friend-panel">
    <button class="absolute inset-0 cursor-default bg-black/10 dark:bg-black/35" aria-label="Close add friend panel"
      @click="emit('close')" />

    <section
      class="relative flex h-full w-full max-w-[430px] flex-col border-l border-line bg-surface-sidebar text-ink dark:bg-[#141419]">
      <header class="flex items-start justify-between border-b border-line px-5 pb-5 pt-6 sm:px-6">
        <div>
          <div class="mb-2 flex items-center gap-2 text-plum">
            <AppIcon name="user-plus" :size="16" />
            <span class="font-mono text-[10px] uppercase tracking-[.16em]">Connections</span>
          </div>
          <h2 class="text-lg font-semibold tracking-[-.03em]">Add a friend</h2>
          <p class="mt-1 max-w-[290px] text-xs leading-5 text-ink-dim">Find people you know and keep the good
            conversations close.</p>
        </div>
        <button data-testid="button-close-friend-panel"
          class="grid h-9 w-9 place-items-center rounded-full border border-line text-ink-dim transition hover:border-plum hover:text-ink"
          aria-label="Close add friend panel" @click="emit('close')">
          <AppIcon name="close" :size="16" />
        </button>
      </header>

      <div class="scrollbar-thin flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        <label
          class="flex h-11 items-center gap-3 rounded-[13px] border border-line bg-void/70 px-3.5 text-ink-dim transition focus-within:border-plum/60">
          <AppIcon name="search" :size="17" />
          <input v-model="query" data-testid="input-search-friends"
            class="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-faint"
            placeholder="Search by name or username" type="search" />
          <span v-if="query" class="font-mono text-[10px] text-ink-faint">{{ suggestedFriends.length }}</span>
        </label>

        <section class="mt-7">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="font-mono text-[10px] uppercase tracking-[.16em] text-ink-faint">
              People you may know
            </h3>
            <span class="font-mono text-[10px] text-ink-faint">
              {{ isLoading ? '' : suggestedFriends.length }}
            </span>
          </div>

          <!-- Loading state -->
          <div v-if="isLoading" class="space-y-1">
            <div v-for="i in 5" :key="i"
              class="flex items-center gap-3 rounded-2xl border border-transparent px-3 py-3">
              <div class="h-[38px] w-[38px] shrink-0 rounded-full bg-black/10 dark:bg-white/10 animate-pulse" />
              <div class="min-w-0 flex-1 space-y-2">
                <div class="h-3.5 w-28 rounded bg-black/10 dark:bg-white/10 animate-pulse" />
                <div class="h-2.5 w-16 rounded bg-black/10 dark:bg-white/10 animate-pulse" />
              </div>
              <div class="h-7 w-14 shrink-0 rounded-xl bg-black/10 dark:bg-white/10 animate-pulse" />
            </div>
          </div>

          <!-- Real list -->
          <div v-else-if="suggestedFriends.length" class="space-y-1">
            <div v-for="suggestedFriend in suggestedFriends" :key="suggestedFriend.id"
              class="flex items-center gap-3 rounded-2xl border border-transparent px-3 py-3 transition hover:border-line hover:bg-black/[.025] dark:hover:bg-white/[.025]">
              <Avatar :person="suggestedFriend" :size="38" :show-presence="true" />
              <div class="min-w-0 flex-1">
                <p class="truncate text-[13px] font-medium">{{ suggestedFriend.name }}</p>
                <p class="mt-0.5 truncate font-mono text-[10px] text-ink-faint">
                  {{ suggestedFriend.username }}
                </p>
              </div>
              <button :data-testid="`button-add-friend-${suggestedFriend.id}`"
                class="rounded-xl border border-plum/50 px-3 py-1.5 text-[11px] font-medium text-plum transition hover:bg-plum hover:text-void disabled:cursor-default disabled:border-line disabled:text-ink-faint disabled:hover:bg-transparent disabled:dark:hover:bg-transparent"
                :disabled="hasSentRequest(suggestedFriend.id)" @click="emit('add', suggestedFriend)">
                <span v-if="hasSentRequest(suggestedFriend.id)" class="flex items-center gap-1">
                  <AppIcon name="check" :size="12" /> Sent
                </span>
                <span v-else>Add</span>
              </button>
            </div>
          </div>

          <!-- Empty state -->
          <div v-else class="rounded-2xl border border-dashed border-line px-4 py-6 text-center">
            <p class="text-xs font-medium">No new people found</p>
            <p class="mt-1 text-[11px] leading-5 text-ink-faint">
              Try a different name or username.
            </p>
          </div>
        </section>

        <section class="mt-8">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="font-mono text-[10px] uppercase tracking-[.16em] text-ink-faint">Pending requests</h3>
            <span
              class="grid h-5 min-w-5 place-items-center rounded-full bg-plum/15 px-1.5 font-mono text-[10px] text-plum">{{
                pendingRequests.length }}</span>
          </div>
          <div class="space-y-1.5">
            <div v-for="request in pendingRequests" :key="request.id"
              class="rounded-2xl border border-line bg-panel/60 px-3 py-3 dark:bg-panel-raised/35">
              <div class="flex items-center gap-3">
                <Avatar :person="request.person" :size="38" :show-presence="true" />
                <div class="min-w-0 flex-1">
                  <p class="truncate text-[13px] font-medium">{{ request.person.name }}</p>
                  <p class="mt-0.5 truncate font-mono text-[10px] text-ink-faint">{{ request.username }} · {{
                    request.time }}</p>
                </div>
              </div>
              <div class="mt-3 flex gap-2 pl-[50px]">
                <button :data-testid="`button-accept-request-${request.id}`"
                  class="flex-1 rounded-xl bg-plum px-3 py-2 text-[11px] font-medium text-void transition hover:bg-[#a88df8]"
                  @click="emit('accept', request)">Accept</button>
                <button :data-testid="`button-decline-request-${request.id}`"
                  class="flex-1 rounded-xl border border-line px-3 py-2 text-[11px] font-medium text-ink-dim transition hover:border-ink-faint hover:text-ink"
                  @click="emit('decline', request)">Decline</button>
              </div>
            </div>
            <p v-if="!pendingRequests.length"
              class="rounded-2xl border border-dashed border-line px-4 py-4 text-center text-[11px] text-ink-faint">
              You’re all caught up.</p>
          </div>
        </section>

        <section class="mt-8">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="font-mono text-[10px] uppercase tracking-[.16em] text-ink-faint">Sent requests</h3>
            <span class="font-mono text-[10px] text-ink-faint">{{ sentRequests.length }}</span>
          </div>
          <div class="space-y-1">
            <div v-for="request in sentRequests" :key="request.id"
              class="flex items-center gap-3 rounded-2xl border border-line px-3 py-3">
              <Avatar :person="request.person" :size="36" />
              <div class="min-w-0 flex-1">
                <p class="truncate text-[12px] font-medium">{{ request.person.name }}</p>
                <p class="mt-0.5 truncate font-mono text-[10px] text-ink-faint">{{ request.username }} · {{ request.time
                  }}</p>
              </div>
              <button :data-testid="`button-cancel-request-${request.id}`"
                class="rounded-lg px-2 py-1.5 text-[11px] text-ink-faint transition hover:bg-black/5 hover:text-ink dark:hover:bg-white/5"
                @click="emit('cancel', request)">Cancel</button>
            </div>
            <p v-if="!sentRequests.length"
              class="rounded-2xl border border-dashed border-line px-4 py-4 text-center text-[11px] text-ink-faint">No
              outgoing requests.</p>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>