<script setup lang="ts">
import {computed, nextTick, ref, watch} from 'vue';
import AppIcon from '~/components/AppIcon.vue';
import Avatar from '~/components/Avatar.vue';
import ConversationList from '~/components/ConversationList.vue';
import ChatHeader from '~/components/ChatHeader.vue';
import MessageThread from '~/components/MessageThread.vue';
import Composer from '~/components/Composer.vue';

type Person = { id: string; name: string; initials: string; color: string; online?: boolean };
type Message = { id: number; senderId: string; text: string; time: string; read?: boolean };
type Conversation = {
  id: string;
  title: string;
  kind: 'direct' | 'group';
  members: Person[];
  preview: string;
  time: string;
  unread: number;
  messages: Message[];
  accent: string;
};

const me: Person = {id: 'me', name: 'You', initials: 'AR', color: '#b49bff'};
const people: Record<string, Person> = {
  maya: {id: 'maya', name: 'Maya Chen', initials: 'MC', color: '#ff8975', online: true},
  theo: {id: 'theo', name: 'Theo Martin', initials: 'TM', color: '#87e6ce', online: false},
  june: {id: 'june', name: 'June Okafor', initials: 'JO', color: '#ffc76c', online: true},
  sam: {id: 'sam', name: 'Sam Rivera', initials: 'SR', color: '#a5a7ff', online: true},
  nico: {id: 'nico', name: 'Nico Park', initials: 'NP', color: '#ee9bd8', online: false},
  ian: {id: 'ian', name: 'Ian Brooks', initials: 'IB', color: '#71caef', online: false},
};

const conversations = ref<Conversation[]>([
  {
    id: 'maya',
    title: 'Maya Chen',
    kind: 'direct',
    members: [people.maya],
    preview: 'The light is perfect around 7.',
    time: '9:42 AM',
    unread: 2,
    accent: '#ff8975',
    messages: [
      {id: 1, senderId: 'maya', text: 'Hey! Did you see the new layout for the gallery?', time: '9:31 AM'},
      {id: 2, senderId: 'me', text: 'Just opened it. The type feels so much better now.', time: '9:33 AM', read: true},
      {id: 3, senderId: 'maya', text: 'Right? I spent way too long nudging those captions.', time: '9:34 AM'},
      {id: 4, senderId: 'maya', text: 'Want to take a walk and talk through the last few pieces?', time: '9:42 AM'},
    ],
  },
  {
    id: 'studio',
    title: 'Studio / Spring Launch',
    kind: 'group',
    members: [people.june, people.sam, people.nico],
    preview: 'June: I dropped the final selects.',
    time: 'Yesterday',
    unread: 0,
    accent: '#ffc76c',
    messages: [
      {id: 11, senderId: 'sam', text: 'The landing page is ready for a last pass.', time: 'Yesterday, 4:12 PM'},
      {id: 12, senderId: 'june', text: 'I dropped the final selects. The warm set feels right for the opening.', time: 'Yesterday, 4:19 PM'},
      {id: 13, senderId: 'me', text: 'Agreed. Let’s use the close crop for the first frame.', time: 'Yesterday, 4:24 PM', read: true},
      {id: 14, senderId: 'nico', text: 'Perfect. I’ll update the deck before tomorrow morning.', time: 'Yesterday, 4:31 PM'},
    ],
  },
  {
    id: 'theo',
    title: 'Theo Martin',
    kind: 'direct',
    members: [people.theo],
    preview: 'That sounds like a plan.',
    time: 'Tue',
    unread: 0,
    accent: '#87e6ce',
    messages: [
      {id: 21, senderId: 'me', text: 'Coffee after the talk?', time: 'Tue, 2:08 PM', read: true},
      {id: 22, senderId: 'theo', text: 'That sounds like a plan.', time: 'Tue, 2:11 PM'},
    ],
  },
  {
    id: 'weekend',
    title: 'Weekend plans',
    kind: 'group',
    members: [people.ian, people.maya, people.theo],
    preview: 'Ian: I can bring the speaker.',
    time: 'Mon',
    unread: 0,
    accent: '#71caef',
    messages: [
      {id: 31, senderId: 'maya', text: 'Are we still doing the coast on Saturday?', time: 'Mon, 8:14 PM'},
      {id: 32, senderId: 'ian', text: 'I can bring the speaker.', time: 'Mon, 8:27 PM'},
      {id: 33, senderId: 'me', text: 'Absolutely. I’ll pack the picnic stuff.', time: 'Mon, 8:39 PM', read: true},
    ],
  },
  {
    id: 'june',
    title: 'June Okafor',
    kind: 'direct',
    members: [people.june],
    preview: 'Can you send me that reference?',
    time: 'Sun',
    unread: 0,
    accent: '#ffc76c',
    messages: [
      {id: 41, senderId: 'june', text: 'Can you send me that reference?', time: 'Sun, 11:08 AM'},
    ],
  },
]);

const activeId = ref('maya');
const search = ref('');
const showConversation = ref(false);
const isDetailsOpen = ref(false);
const colorMode = useColorMode();

function toggleColorMode() {
  colorMode.preference.value = colorMode.value.value === 'dark' ? 'light' : 'dark';
}

const activeConversation = computed(() => conversations.value.find((conversation) => conversation.id === activeId.value) ?? null);
const filteredConversations = computed(() => {
  const query = search.value.trim().toLowerCase();
  if (!query) return conversations.value;
  return conversations.value.filter((conversation) =>
      `${conversation.title} ${conversation.preview}`.toLowerCase().includes(query),
  );
});

function selectConversation(id: string) {
  activeId.value = id;
  showConversation.value = true;
  const conversation = conversations.value.find((item) => item.id === id);
  if (conversation) conversation.unread = 0;
}

function handleSend(text: string) {
  if (!activeConversation.value || !text.trim()) return;
  const now = new Date();
  const time = now.toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'});
  activeConversation.value.messages.push({
    id: Date.now(),
    senderId: me.id,
    text: text.trim(),
    time,
    read: true,
  });
  activeConversation.value.preview = text.trim();
  activeConversation.value.time = 'Now';
  nextTick(() => {
    document.querySelector('[data-message-scroll]')?.scrollTo({top: 99999, behavior: 'smooth'});
  });
}

function backToList() {
  showConversation.value = false;
}

watch(activeId, () => {
  nextTick(() => document.querySelector('[data-message-scroll]')?.scrollTo({top: 99999}));
});
</script>

<template>
  <main class="noise min-h-[100dvh] overflow-hidden bg-void text-ink">
    <div class="mx-auto flex min-h-[100dvh] max-w-[1560px] flex-col p-0 sm:p-3 lg:p-5">
      <div class="flex min-h-[100dvh] flex-1 overflow-hidden border-line bg-panel sm:min-h-0 sm:rounded-[26px] sm:border sm:shadow-2xl sm:shadow-black/20">
        <aside
            class="flex w-full shrink-0 flex-col border-r border-line bg-surface-sidebar dark:bg-[#141419] md:w-[320px] lg:w-[364px]"
            :class="showConversation ? 'hidden md:flex' : 'flex'"
        >
          <div class="border-b border-line px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
            <div class="mb-7 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="grid h-9 w-9 place-items-center rounded-[12px] bg-plum text-sm font-bold text-void">M</div>
                <div>
                  <p class="text-[15px] font-semibold tracking-[-0.03em]">Messages</p>
                  <p class="font-mono text-[10px] uppercase tracking-[.16em] text-ink-faint">your quiet corner</p>
                </div>
              </div>
              <div class="flex items-center gap-1">
                <button data-testid="button-toggle-theme" class="grid h-9 w-9 place-items-center rounded-full border border-line text-ink-dim transition hover:border-plum hover:text-plum dark:hover:border-plum dark:hover:text-plum" :aria-label="colorMode.value === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'" :title="colorMode.value === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'" @click="toggleColorMode">
                  <AppIcon :name="colorMode.value === 'dark' ? 'sun' : 'moon'" :size="16"/>
                </button>
                <button data-testid="button-new-message" class="grid h-9 w-9 place-items-center rounded-full border border-line text-ink-dim transition hover:border-plum hover:text-plum dark:hover:border-plum dark:hover:text-plum" title="New message">
                  <AppIcon name="edit" :size="16"/>
                </button>
              </div>
            </div>
            <label class="flex h-11 items-center gap-3 rounded-[13px] border border-line bg-void/70 px-3.5 text-ink-dim transition focus-within:border-plum/60">
              <AppIcon name="search" :size="17"/>
              <input v-model="search" data-testid="input-search-conversations" class="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-faint" placeholder="Search conversations" type="search"/>
              <span v-if="search" class="font-mono text-[10px] text-ink-faint">{{ filteredConversations.length }}</span>
            </label>
          </div>

          <div class="flex items-center justify-between px-6 pb-2 pt-5">
            <span class="font-mono text-[10px] uppercase tracking-[.16em] text-ink-faint">Recent</span>
            <button data-testid="button-filter-conversations" class="text-ink-faint transition hover:text-ink" title="Filter conversations">
              <AppIcon name="sliders" :size="14"/>
            </button>
          </div>
          <ConversationList :conversations="filteredConversations" :active-id="activeId" @select="selectConversation"/>
          <div class="mt-auto border-t border-line px-5 py-4 sm:px-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <Avatar :person="me" :size="34"/>
                <div>
                  <p class="text-[13px] font-medium">Ari Rhodes</p>
                  <p class="font-mono text-[10px] text-mint">available</p>
                </div>
              </div>
              <button data-testid="button-settings" class="text-ink-faint transition hover:text-ink" title="Settings">
                <AppIcon name="settings" :size="17"/>
              </button>
            </div>
          </div>
        </aside>

        <section
            class="relative flex min-w-0 flex-1 flex-col bg-surface-chat dark:bg-[#19191f]"
            :class="showConversation ? 'flex' : 'hidden md:flex'"
        >
          <template v-if="activeConversation">
            <ChatHeader :conversation="activeConversation" :details-open="isDetailsOpen" @back="backToList" @toggle-details="isDetailsOpen = !isDetailsOpen"/>
            <MessageThread :conversation="activeConversation" :people="people" :me="me"/>
            <Composer @send="handleSend"/>
            <div v-if="isDetailsOpen" class="absolute right-4 top-[76px] z-10 w-[250px] rounded-2xl border border-line bg-surface-popover p-4 shadow-2xl shadow-black/10 dark:bg-[#24242b] dark:shadow-black/30">
              <div class="mb-4 flex items-center justify-between">
                <p class="text-[13px] font-semibold">Conversation info</p>
                <button data-testid="button-close-details" class="text-ink-faint hover:text-ink" @click="isDetailsOpen = false">
                  <AppIcon name="close" :size="16"/>
                </button>
              </div>
              <div class="mb-4 flex items-center gap-3">
                <Avatar v-if="activeConversation.kind === 'direct'" :person="activeConversation.members[0]" :size="40"/>
                <div v-else class="flex -space-x-2">
                  <Avatar v-for="person in activeConversation.members.slice(0, 3)" :key="person.id" :person="person" :size="30"/>
                </div>
                <div>
                  <p class="text-[13px] font-medium">{{ activeConversation.title }}</p>
                  <p class="text-[11px] text-ink-faint">{{ activeConversation.kind === 'group' ? `${activeConversation.members.length + 1} members` : 'Direct conversation' }}</p>
                </div>
              </div>
              <button data-testid="button-mute-conversation" class="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[12px] text-ink-dim transition hover:bg-black/5 hover:text-ink dark:hover:bg-white/5">
                <AppIcon name="bell-off" :size="15"/>
                Mute notifications
              </button>
              <button data-testid="button-search-chat" class="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[12px] text-ink-dim transition hover:bg-black/5 hover:text-ink dark:hover:bg-white/5">
                <AppIcon name="search" :size="15"/>
                Search in conversation
              </button>
            </div>
          </template>
          <div v-else class="grid flex-1 place-items-center p-8 text-center">
            <div>
              <div class="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-[22px] bg-plum/10 text-plum">
                <AppIcon name="message" :size="28"/>
              </div>
              <h2 class="text-lg font-semibold">Choose a conversation</h2>
              <p class="mt-2 max-w-xs text-sm leading-6 text-ink-dim">Your messages, in one calm place. Select someone to start catching up.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>