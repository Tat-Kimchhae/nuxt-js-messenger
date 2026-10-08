<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import AppIcon from '~/components/AppIcon.vue';
import Avatar from '~/components/Avatar.vue';
import ConversationList from '~/components/ConversationList.vue';
import ChatHeader from '~/components/ChatHeader.vue';
import MessageThread from '~/components/MessageThread.vue';
import Composer from '~/components/Composer.vue';
import FriendPanel from '~/components/FriendPanel.vue';
import FriendsList from '~/components/FriendsList.vue';
import { useApi } from '~~/app/composables/useApi';

// Types
import type { Person } from "~~/types/person";
import { toast } from 'vue-sonner';

type FriendProfile = Person & { username: string };
type FriendRequest = { id: string; person: Person; username: string; time: string };
type Message = {
  id: number;
  senderId: string;
  text: string;
  time: string;
  audio?: string;
  audioDurationSeconds?: number;
  read?: boolean;
  readAt?: string | Date;
};
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

const me: Person = { id: 'me', name: 'You', initials: 'AR', color: '#b49bff' };
const people: Record<string, Person> = {
  maya: { id: 'maya', name: 'Maya Chen', initials: 'MC', color: '#ff8975', online: true },
  theo: { id: 'theo', name: 'Theo Martin', initials: 'TM', color: '#87e6ce', online: false },
  june: { id: 'june', name: 'June Okafor', initials: 'JO', color: '#ffc76c', online: true },
  sam: { id: 'sam', name: 'Sam Rivera', initials: 'SR', color: '#a5a7ff', online: true },
  nico: { id: 'nico', name: 'Nico Park', initials: 'NP', color: '#ee9bd8', online: false },
  ian: { id: 'ian', name: 'Ian Brooks', initials: 'IB', color: '#71caef', online: false },
  rhea: { id: 'rhea', name: 'Rhea Morgan', initials: 'RM', color: '#d79cff', online: true },
  luca: { id: 'luca', name: 'Luca Silva', initials: 'LS', color: '#f2a875', online: false },
  nora: { id: 'nora', name: 'Nora Patel', initials: 'NP', color: '#8cccf2', online: true },
  sienna: { id: 'sienna', name: 'Sienna Cole', initials: 'SC', color: '#e9a4c6', online: false },
  omar: { id: 'omar', name: 'Omar Haddad', initials: 'OH', color: '#9bd6ad', online: true },
};

const conversations = ref<Conversation[]>([]);
const isCreatingFriendConversation = ref(false);
const activeId = ref('');
const search = ref('');
const showConversation = ref(false);
const isDetailsOpen = ref(false);
const showFriendPanel = ref(false);
const colorMode = useColorMode();
const friends = ref<Person[]>([]);
const isLoadingFriends = ref(true);
const messagesByConversation = ref<Record<string, Message[]>>({});

const friendSearchPeople: FriendProfile[] = [
  { ...people.rhea, username: '@rheamorgan' },
  { ...people.luca, username: '@lucasilva' },
  { ...people.nora, username: '@norapatel' },
  { ...people.sienna, username: '@siennacole' },
  { ...people.omar, username: '@omarh' },
];

// Suggested friends
const { user, clear } = useUserSession();
const { subscribeToConversation, subscribeToUserChannel } = usePusher();
let unsubscribeUserChannel: (() => void) | undefined;
let unsubscribeConversationChannel: (() => void) | undefined;

const { call, isLoading } = useApi();
const suggestedFriends = ref<Person[]>([]);
const pendingRequests = ref<FriendRequest[]>([]);

watch(showFriendPanel, async (open) => {
  if (!open) return;

  const res = await call(() =>
    Promise.all([
      $fetch<{ data: Person[]; status: boolean }>('/api/friends/suggestions'),
      $fetch<{ data: FriendRequest[]; status: boolean }>('/api/friends/requests', { query: { type: 'received' } }),
      $fetch<{ data: FriendRequest[]; status: boolean }>('/api/friends/requests', { query: { type: 'sent' } }),
    ])
  );

  const [suggestions, received, sent] = res ?? [];
  suggestedFriends.value = suggestions?.data ?? [];
  pendingRequests.value = received?.data ?? [];
  sentRequests.value = sent?.data ?? [];
});

// const pendingRequests = ref<FriendRequest[]>([
//   { id: 'pending-rhea', person: people.rhea, username: '@rheamorgan', time: '2h ago' },
//   { id: 'pending-luca', person: people.luca, username: '@lucasilva', time: 'Yesterday' },
// ]);

const sentRequests = ref<FriendRequest[]>([
  { id: 'sent-nora', person: people.nora, username: '@norapatel', time: '3d ago' },
]);

function toggleColorMode() {
  colorMode.preference.value = colorMode.value.value === 'dark' ? 'light' : 'dark';
}

async function addFriend(person: Person) {
  try {
    const res = await $fetch<{ status: boolean; data: { id: string } }>('/api/friends/requests', {
      method: 'POST',
      body: { receiverId: person.id },
    });
    sentRequests.value.unshift({ id: res.data.id, person, time: 'Just now' });
    suggestedFriends.value = suggestedFriends.value.filter((p) => p.id !== person.id);
  } catch (err) {
    console.error('Add friend failed:', err);
    toast.error(err?.data?.statusMessage ?? 'Could not send request');
  }
}

async function acceptFriend(request: FriendRequest) {
  try {
    await $fetch('/api/friends/requests/accept', { method: 'POST', body: { requestId: request.id } });
    pendingRequests.value = pendingRequests.value.filter((r) => r.id !== request.id);
    if (!friends.value.some((f) => f.id === request.person.id)) friends.value.push(request.person);
  } catch (err) {
    console.error('Accept friend failed:', err);
    toast.error(err?.data?.statusMessage ?? 'Could not accept request');
  }
}

async function declineFriend(request: FriendRequest) {
  try {
    await $fetch('/api/friends/requests/decline', { method: 'POST', body: { requestId: request.id } });
    pendingRequests.value = pendingRequests.value.filter((r) => r.id !== request.id);
  } catch (err) {
    console.error('Decline friend failed:', err);
    toast.error(err?.data?.statusMessage ?? 'Could not deline request');
  }
}

async function cancelFriend(request: FriendRequest) {
  try {
    await $fetch(`/api/friends/requests/${request.id}`, { method: 'DELETE' });
    sentRequests.value = sentRequests.value.filter((r) => r.id !== request.id);
  } catch (err) {
    console.error('Cancel friend failed:', err);
    toast.error(err?.data?.statusMessage ?? 'Could not cancel request');
  }
}

async function loadFriends() {
  try {
    const response = await $fetch<{ status: boolean; data: Person[] }>('/api/friends');
    friends.value = response.data ?? [];
  } catch (err) {
    console.error('Load friends failed:', err);
    toast.error('Could not load friends');
  } finally {
    isLoadingFriends.value = false;
  }
}

async function loadConversations(query = '') {
  try {
    const response = await $fetch<Omit<Conversation, 'messages'>[]>('/api/conversations', {
      query: { q: query || undefined },
    });
    conversations.value = response.map((conversation) => {
      for (const member of conversation.members) {
        people[member.id] = member;
      }
      return { ...conversation, messages: [] };
    });
  } catch (err) {
    console.error('Load conversations failed:', err);
    toast.error('Could not load conversations');
  }
}

const cursorByConversation = ref<Record<string, string | null>>({});
const loadingOlder = ref(false);

async function loadMessages(id: string) {
  try {
    const res = await $fetch<{ messages: any[]; nextCursor: string | null }>(
      `/api/conversations/${id}/messages`,
    );
    messagesByConversation.value[id] = res.messages.map((m) => ({ ...m, time: formatTime(m.createdAt) }));
    cursorByConversation.value[id] = res.nextCursor;
    await nextTick();
    document.querySelector('[data-message-scroll]')?.scrollTo({ top: 99999 });
  } catch (err) {
    console.error('Load messages failed:', err);
    toast.error('Could not load messages');
  }
}

async function loadOlder() {
  const id = activeId.value;
  const cursor = cursorByConversation.value[id];
  if (!id || !cursor || loadingOlder.value) return;

  const el = document.querySelector('[data-message-scroll]') as HTMLElement | null;
  const prevHeight = el?.scrollHeight ?? 0;

  loadingOlder.value = true;
  try {
    const res = await $fetch<{ messages: any[]; nextCursor: string | null }>(
      `/api/conversations/${id}/messages`,
      { query: { before: cursor } },
    );
    const older = res.messages.map((m) => ({ ...m, time: formatTime(m.createdAt) }));
    messagesByConversation.value[id] = [...older, ...(messagesByConversation.value[id] ?? [])];
    cursorByConversation.value[id] = res.nextCursor;

    // keep the viewport anchored after prepending
    await nextTick();
    if (el) el.scrollTop = el.scrollHeight - prevHeight;
  } catch (err) {
    console.error('Load older failed:', err);
    toast.error('Could not load older messages');
  } finally {
    loadingOlder.value = false;
  }
}

async function markRead(id: string) {
  try {
    await $fetch(`/api/conversations/${id}/read`, { method: 'POST' });
  } catch (err) {
    console.error('Mark read failed:', err);
  }
}

const activeConversation = computed(() => {
  const conversation = conversations.value.find((c) => c.id === activeId.value);
  if (!conversation) return null;
  return { ...conversation, messages: messagesByConversation.value[conversation.id] ?? [] };
});

function selectConversation(id: string) {
  activeId.value = id;
  showConversation.value = true;
  const conversation = conversations.value.find((item) => item.id === id);
  if (conversation) conversation.unread = 0;
  loadMessages(id).then(() => markRead(id));
}

async function startFriendConversation(person: Person) {
  const existingConversation = conversations.value.find(
    (conversation) => conversation.kind === 'direct' && conversation.members.some((member) => member.id === person.id),
  );
  if (existingConversation) {
    selectConversation(existingConversation.id);
    return;
  }

  if (isCreatingFriendConversation.value) return;

  isCreatingFriendConversation.value = true;
  try {
    const serializedConversation = await $fetch<Omit<Conversation, 'messages'>>('/api/conversations', {
      method: 'POST',
      body: { friendId: person.id },
    });
    for (const member of serializedConversation.members) {
      people[member.id] = member;
    }

    const existingConversationById = conversations.value.find(
      (conversation) => conversation.id === serializedConversation.id,
    );
    if (!existingConversationById) {
      conversations.value.unshift({ ...serializedConversation, messages: [] });
    }
    selectConversation(serializedConversation.id);
  } catch (error: any) {
    console.error('Create conversation failed:', error);
    toast.error(error?.data?.statusMessage ?? 'Could not start conversation');
  } finally {
    isCreatingFriendConversation.value = false;
  }
}

const formatTime = (date: string | Date) => new Date(date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

async function handleSend(text: string, file?: File) {
  const conversation = activeConversation.value;
  if (!conversation || (!text.trim() && !file)) return;

  let body: FormData | { text: string };
  if (file) {
    body = new FormData();
    body.append('text', text.trim());
    body.append('image', file);
  } else {
    body = { text: text.trim() };
  }

  try {
    const message = await $fetch<any>(`/api/conversations/${conversation.id}/messages`, {
      method: 'POST',
      body,
    });

    updateConversationAfterSend(conversation.id, message);
  } catch (err: any) {
    console.error('Send failed:', err);
    toast.error(err?.data?.statusMessage ?? 'Could not send message');
  }
}

async function handleSendVoice(audioBlob: Blob, durationSeconds: number) {
  const conversation = activeConversation.value;
  if (!conversation) return;

  const audioFileExtension = getAudioFileExtension(audioBlob.type);
  const audioFile = new File(
    [audioBlob],
    `voice-message.${audioFileExtension}`,
    { type: audioBlob.type },
  );
  const formData = new FormData();
  formData.append('audio', audioFile);
  formData.append('audioDurationSeconds', String(durationSeconds));

  try {
    const message = await $fetch<any>(`/api/conversations/${conversation.id}/messages`, {
      method: 'POST',
      body: formData,
    });

    updateConversationAfterSend(conversation.id, message);
  } catch (err: any) {
    console.error('Send failed:', err);
    toast.error(err?.data?.statusMessage ?? 'Could not send message');
  }
}

function getAudioFileExtension(audioType: string) {
  const audioSubtype = audioType.split('/')[1]?.split(';')[0]?.toLowerCase();
  const knownAudioExtensions: Record<string, string> = {
    '3gpp': '3gp',
    '3gpp2': '3g2',
    'mpeg': 'mp3',
    'mp4': 'm4a',
    'wave': 'wav',
    'wav': 'wav',
    'x-m4a': 'm4a',
    'x-wav': 'wav',
  };

  return knownAudioExtensions[audioSubtype ?? ''] ?? audioSubtype?.replace(/^x-/, '') ?? 'webm';
}

function updateConversationAfterSend(conversationId: string, message: any) {
  addMessageIfMissing(conversationId, message);
  const targetConversation = conversations.value.find((item) => item.id === conversationId);
  if (targetConversation) {
    targetConversation.preview =
      message.text || (message.image ? 'Sent a photo' : message.audio ? 'Sent a voice message' : '');
    targetConversation.time = 'Now';
  }
}

function backToList() {
  showConversation.value = false;
}

async function handleLogout() {
  await clear()
  await navigateTo('/login')
}

function addMessageIfMissing(conversationId: string, incoming: any) {
  const list = messagesByConversation.value[conversationId] ?? [];
  if (list.some((message) => message.id === incoming.id)) return;
  const senderId = incoming.senderId === user.value?.id ? 'me' : incoming.senderId;
  messagesByConversation.value[conversationId] = [
    ...list,
    { ...incoming, senderId, time: formatTime(incoming.createdAt) },
  ];
  nextTick(() => document.querySelector('[data-message-scroll]')?.scrollTo({ top: 99999, behavior: 'smooth' }));
}

function applyConversationUpdated(payload: any) {
  const conversationId = payload?.id ?? payload?.conversationId;
  const conversation = conversations.value.find((item) => item.id === conversationId);
  if (!conversation) return;
  conversation.preview = payload.preview;
  conversation.time = payload.time;
  if (activeId.value === conversationId) {
    markRead(conversationId);
    return;
  }
  conversation.unread = payload.unread;
}

function applyMessagesRead(conversationId: string, payload: { readerId: string; readAt: string | Date }) {
  const list = messagesByConversation.value[conversationId];
  if (!list) return;
  messagesByConversation.value[conversationId] = list.map((message) => {
    if (message.senderId === payload.readerId) return message;
    return { ...message, read: true, readAt: payload.readAt };
  });
}

watch(activeId, (id) => {
  nextTick(() => document.querySelector('[data-message-scroll]')?.scrollTo({ top: 99999 }));
  unsubscribeConversationChannel?.();
  unsubscribeConversationChannel = undefined;
  if (!id) return;
  unsubscribeConversationChannel = subscribeToConversation(id, {
    'message:new': (incoming) => addMessageIfMissing(id, incoming),
    'messages:read': (payload) => applyMessagesRead(id, payload as { readerId: string; readAt: string | Date }),
  });
});

let searchTimer: ReturnType<typeof setTimeout>;
watch(search, (query) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => loadConversations(query.trim()), 300);
});

onMounted(() => {
  loadFriends();
  loadConversations();
  const userId = user.value?.id;
  if (userId) {
    unsubscribeUserChannel = subscribeToUserChannel(userId, {
      'conversation:updated': applyConversationUpdated,
    });
  }
});

onUnmounted(() => {
  unsubscribeUserChannel?.();
  unsubscribeConversationChannel?.();
});

</script>

<template>
  <main class="noise h-[100dvh] overflow-hidden bg-void text-ink">
    <div class="mx-auto flex h-[100dvh] max-w-[1560px] flex-col p-0 sm:p-3 lg:p-5">
      <div
        class="flex min-h-0 flex-1 overflow-hidden border-line bg-panel sm:rounded-[26px] sm:border sm:shadow-2xl sm:shadow-black/20">
        <aside
          class="flex min-h-0 w-full shrink-0 flex-col border-r border-line bg-surface-sidebar dark:bg-[#141419] md:w-[320px] lg:w-[364px]"
          :class="showConversation ? 'hidden md:flex' : 'flex'">
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
                <button data-testid="button-toggle-theme"
                  class="grid h-9 w-9 place-items-center rounded-full border border-line text-ink-dim transition hover:border-plum hover:text-plum dark:hover:border-plum dark:hover:text-plum"
                  :aria-label="colorMode.value === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
                  :title="colorMode.value === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
                  @click="toggleColorMode">
                  <AppIcon :name="colorMode.value === 'dark' ? 'sun' : 'moon'" :size="16" />
                </button>
                <button data-testid="button-add-friend"
                  class="grid h-9 w-9 place-items-center rounded-full border border-line text-ink-dim transition hover:border-plum hover:text-plum dark:hover:border-plum dark:hover:text-plum"
                  title="Add a friend" aria-label="Add a friend" @click="showFriendPanel = true">
                  <AppIcon name="user-plus" :size="16" />
                </button>
                <button data-testid="button-new-message"
                  class="grid h-9 w-9 place-items-center rounded-full border border-line text-ink-dim transition hover:border-plum hover:text-plum dark:hover:border-plum dark:hover:text-plum"
                  title="New message">
                  <AppIcon name="edit" :size="16" />
                </button>
              </div>
            </div>
            <label
              class="flex h-11 items-center gap-3 rounded-[13px] border border-line bg-void/70 px-3.5 text-ink-dim transition focus-within:border-plum/60">
              <AppIcon name="search" :size="17" />
              <input v-model="search" data-testid="input-search-conversations"
                class="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-faint"
                placeholder="Search conversations" type="search" />
              <span v-if="search" class="font-mono text-[10px] text-ink-faint">{{ conversations.length }}</span>
            </label>
          </div>

          <div class="flex items-center justify-between px-6 pb-2 pt-5">
            <span class="font-mono text-[10px] uppercase tracking-[.16em] text-ink-faint">Recent</span>
            <button data-testid="button-filter-conversations" class="text-ink-faint transition hover:text-ink"
              title="Filter conversations">
              <AppIcon name="sliders" :size="14" />
            </button>
          </div>
          <ConversationList :conversations="conversations" :active-id="activeId" @select="selectConversation" />
          <FriendsList :friends="friends" :is-loading="isLoadingFriends" @start="startFriendConversation" />
          <div class="mt-auto border-t border-line px-5 py-4 sm:px-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <Avatar :person="me" :size="34" />
                <div>
                  <p class="text-[13px] font-medium">Ari Rhodes</p>
                  <p class="font-mono text-[10px] text-mint">available</p>
                </div>
              </div>
              <button data-testid="button-settings" class="text-ink-faint transition hover:text-ink" title="Settings">
                <AppIcon name="settings" :size="17" />
              </button>
            </div>
          </div>
        </aside>

        <section class="relative flex min-w-0 min-h-0 flex-1 flex-col bg-surface-chat dark:bg-[#19191f]"
          :class="showConversation ? 'flex' : 'hidden md:flex'">
          <template v-if="activeConversation">
            <ChatHeader :conversation="activeConversation" :details-open="isDetailsOpen" @back="backToList"
              @toggle-details="isDetailsOpen = !isDetailsOpen" />
            <MessageThread @load-older="loadOlder" :conversation="activeConversation" :people="people" :me="me" />
            <Composer @send="handleSend" @send-voice="handleSendVoice" />
            <div v-if="isDetailsOpen"
              class="absolute right-4 top-[76px] z-10 w-[250px] rounded-2xl border border-line bg-surface-popover p-4 shadow-2xl shadow-black/10 dark:bg-[#24242b] dark:shadow-black/30">
              <div class="mb-4 flex items-center justify-between">
                <p class="text-[13px] font-semibold">Conversation info</p>
                <button data-testid="button-close-details" class="text-ink-faint hover:text-ink"
                  @click="isDetailsOpen = false">
                  <AppIcon name="close" :size="16" />
                </button>
              </div>
              <div class="mb-4 flex items-center gap-3">
                <Avatar v-if="activeConversation.kind === 'direct'" :person="activeConversation.members[0]"
                  :size="40" />
                <div v-else class="flex -space-x-2">
                  <Avatar v-for="person in activeConversation.members.slice(0, 3)" :key="person.id" :person="person"
                    :size="30" />
                </div>
                <div>
                  <p class="text-[13px] font-medium">{{ activeConversation.title }}</p>
                  <p class="text-[11px] text-ink-faint">{{ activeConversation.kind === 'group' ?
                    `${activeConversation.members.length + 1} members` : 'Direct conversation' }}</p>
                </div>
              </div>
              <button data-testid="button-mute-conversation"
                class="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[12px] text-ink-dim transition hover:bg-black/5 hover:text-ink dark:hover:bg-white/5">
                <AppIcon name="bell-off" :size="15" /> Mute notifications
              </button>
              <button data-testid="button-search-chat"
                class="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[12px] text-ink-dim transition hover:bg-black/5 hover:text-ink dark:hover:bg-white/5">
                <AppIcon name="search" :size="15" /> Search in conversation
              </button>

              <!-- Section Divider -->
              <div class="my-1 h-px bg-black/5 dark:bg-white/5"></div>

              <button data-testid="button-logout"
                class="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[12px] text-red-600/80 transition hover:bg-red-500/10 hover:text-red-600 dark:text-red-400/80 dark:hover:bg-red-500/20 dark:hover:text-red-400"
                @click="handleLogout">
                <AppIcon name="logout" :size="15" /> Logout
              </button>
            </div>
          </template>
          <div v-else class="grid flex-1 place-items-center p-8 text-center">
            <div>
              <div class="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-[22px] bg-plum/10 text-plum">
                <AppIcon name="message" :size="28" />
              </div>
              <h2 class="text-lg font-semibold">Choose a conversation</h2>
              <p class="mt-2 max-w-xs text-sm leading-6 text-ink-dim">Your messages, in one calm place. Select someone
                to start
                catching up.</p>
            </div>
          </div>
        </section>
      </div>
      <FriendPanel v-if="showFriendPanel" :people="friendSearchPeople" :suggestedFriends="suggestedFriends"
        :pending-requests="pendingRequests" :sent-requests="sentRequests" :isLoading="isLoading"
        @close="showFriendPanel = false" @add="addFriend" @accept="acceptFriend" @decline="declineFriend"
        @cancel="cancelFriend" />
    </div>
  </main>
</template>