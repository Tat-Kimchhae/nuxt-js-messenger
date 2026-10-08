<script setup lang="ts">
import { computed, reactive } from 'vue';
import Avatar from './Avatar.vue';
import AppIcon from './AppIcon.vue';

type Person = { id: string; name: string; initials: string; color: string; online?: boolean };
type Message = {
  id: number;
  senderId: string;
  text: string;
  time: string;
  audio?: string;
  audioDurationSeconds?: number;
  read?: boolean;
};
type Conversation = { id: string; title: string; kind: 'direct' | 'group'; members: Person[]; messages: Message[] };
const props = defineProps<{ conversation: Conversation; people: Record<string, Person>; me: Person }>();

const emit = defineEmits<{ 'load-older': [] }>();
const audioElements = new Map<number, HTMLAudioElement>();
const audioPlaybackByMessage = reactive<Record<number, { currentTime: number; duration: number; isPlaying: boolean }>>({});

function onScroll(e: Event) {
  if ((e.target as HTMLElement).scrollTop < 80) emit('load-older');
}

function setAudioElement(messageId: number, element: Element | null) {
  if (element instanceof HTMLAudioElement) {
    audioElements.set(messageId, element);
    return;
  }
  audioElements.delete(messageId);
}

function playbackState(message: Message) {
  return audioPlaybackByMessage[message.id] ?? {
    currentTime: 0,
    duration: message.audioDurationSeconds ?? 0,
    isPlaying: false,
  };
}

function formatAudioTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, '0')}`;
}

function progressWidth(message: Message) {
  const state = playbackState(message);
  if (!state.duration) return '0%';
  return `${Math.min(100, (state.currentTime / state.duration) * 100)}%`;
}

function remainingAudioTime(message: Message) {
  const state = playbackState(message);
  return state.isPlaying
    ? formatAudioTime(Math.max(0, state.duration - state.currentTime))
    : formatAudioTime(message.audioDurationSeconds ?? state.duration);
}

function toggleAudioPlayback(messageId: number) {
  const audioElement = audioElements.get(messageId);
  if (!audioElement) return;

  if (audioElement.paused) {
    for (const [otherMessageId, otherAudioElement] of audioElements) {
      if (otherMessageId !== messageId) otherAudioElement.pause();
    }
    void audioElement.play().catch((error: unknown) => {
      console.error('Voice message playback failed:', error);
    });
  } else {
    audioElement.pause();
  }
}

function updateAudioTime(messageId: number, event: Event) {
  const audioElement = event.currentTarget as HTMLAudioElement;
  audioPlaybackByMessage[messageId] = {
    currentTime: audioElement.currentTime,
    duration: Number.isFinite(audioElement.duration)
      ? audioElement.duration
      : audioPlaybackByMessage[messageId]?.duration ?? 0,
    isPlaying: !audioElement.paused,
  };
}

function onAudioPlay(messageId: number, event: Event) {
  const audioElement = event.currentTarget as HTMLAudioElement;
  for (const [otherMessageId, otherAudioElement] of audioElements) {
    if (otherMessageId !== messageId) otherAudioElement.pause();
  }
  updateAudioTime(messageId, event);
  audioPlaybackByMessage[messageId].isPlaying = true;
}

function onAudioPause(messageId: number, event: Event) {
  updateAudioTime(messageId, event);
  audioPlaybackByMessage[messageId].isPlaying = false;
}

function seekAudio(messageId: number, event: MouseEvent) {
  const audioElement = audioElements.get(messageId);
  const progressElement = event.currentTarget as HTMLElement;
  if (!audioElement || !Number.isFinite(audioElement.duration)) return;

  const bounds = progressElement.getBoundingClientRect();
  if (!bounds.width) return;
  const progress = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
  audioElement.currentTime = progress * audioElement.duration;
  audioPlaybackByMessage[messageId] = {
    currentTime: audioElement.currentTime,
    duration: audioElement.duration,
    isPlaying: !audioElement.paused,
  };
}

const messagesWithMeta = computed(() => props.conversation.messages.map((message, index, all) => {
  const previous = all[index - 1];
  const isMine = message.senderId === props.me.id;
  const previousMine = previous?.senderId === message.senderId;
  return {
    ...message,
    isMine,
    showSender: props.conversation.kind === 'group' && !isMine && !previousMine,
    isLastInGroup: !all[index + 1] || all[index + 1].senderId !== message.senderId,
  };
}));
</script>

<template>
   <div data-message-scroll @scroll.passive="onScroll" class="scrollbar-thin min-h-0 flex-1 overflow-y-auto bg-surface-chat px-4 py-6 sm:px-8 lg:px-12 dark:bg-[#19191f]">
    <div class="mx-auto flex min-h-full max-w-3xl flex-col justify-end">
      <div class="mb-8 text-center">
        <div class="mx-auto mb-3 flex justify-center">
          <Avatar v-if="conversation.kind === 'direct'" :person="conversation.members[0]" :size="52" :show-presence="true" />
          <div v-else class="flex -space-x-3">
            <Avatar v-for="person in conversation.members.slice(0, 3)" :key="person.id" :person="person" :size="38" />
          </div>
        </div>
        <h2 class="text-[15px] font-semibold">{{ conversation.title }}</h2>
        <p class="mx-auto mt-1 max-w-xs text-[11px] leading-5 text-ink-faint">
          {{ conversation.kind === 'direct' ? `You and ${conversation.members[0].name.split(' ')[0]} · say hello` : 'A shared space for good ideas.' }}
        </p>
      </div>

      <div class="space-y-1.5">
        <div v-for="message in messagesWithMeta" :key="message.id" class="message-enter flex items-end gap-2" :class="message.isMine ? 'justify-end' : 'justify-start'">
          <Avatar v-if="!message.isMine && message.isLastInGroup" :person="people[message.senderId]" :size="25" />
          <div v-else-if="!message.isMine" class="w-[25px]" />
          <div class="max-w-[82%] sm:max-w-[68%]" :class="message.isMine ? 'items-end' : 'items-start'">
            <p v-if="message.showSender" class="mb-1 ml-1 font-mono text-[10px] text-ink-faint">{{ people[message.senderId]?.name }}</p>
             <div class="rounded-[18px] px-4 py-2.5 text-[13px] leading-[1.45]" :class="message.isMine ? 'rounded-br-[5px] bg-plum text-void dark:bg-[#b49bff] dark:text-[#101014]' : 'rounded-bl-[5px] bg-panel-raised text-ink/90 dark:bg-[#202027] dark:text-[#f6f5f2]/90'">
              <img v-if="message.image" :src="message.image" class="mb-1 max-h-64 rounded-xl" alt="" />
              <div v-if="message.audio" class="flex min-w-[180px] items-center gap-3">
                <button
                  class="grid h-8 w-8 shrink-0 place-items-center rounded-full"
                  :class="message.isMine ? 'bg-void/25' : 'bg-plum text-void'"
                  :aria-label="playbackState(message).isPlaying ? 'Pause voice message' : 'Play voice message'"
                  @click="toggleAudioPlayback(message.id)">
                  <AppIcon :name="playbackState(message).isPlaying ? 'pause' : 'play'" :size="14" />
                </button>
                <div
                  class="h-1 flex-1 cursor-pointer rounded-full bg-current/20"
                  role="slider"
                  aria-label="Voice message progress"
                  :aria-valuenow="Math.round(playbackState(message).currentTime)"
                  :aria-valuemin="0"
                  :aria-valuemax="Math.round(playbackState(message).duration)"
                  tabindex="0"
                  @click="seekAudio(message.id, $event)">
                  <div class="h-1 rounded-full bg-current" :style="{ width: progressWidth(message) }" />
                </div>
                <span class="font-mono text-[10px]">{{ remainingAudioTime(message) }}</span>
                <audio
                  :ref="(element) => setAudioElement(message.id, element as HTMLAudioElement | null)"
                  :src="message.audio"
                  preload="metadata"
                  class="hidden"
                  @loadedmetadata="updateAudioTime(message.id, $event)"
                  @timeupdate="updateAudioTime(message.id, $event)"
                  @play="onAudioPlay(message.id, $event)"
                  @pause="onAudioPause(message.id, $event)"
                  @ended="onAudioPause(message.id, $event)" />
              </div>
              <span v-if="message.text">{{ message.text }}</span>
            </div>
            <div v-if="message.isLastInGroup" class="mt-1 flex items-center gap-1.5 px-1 font-mono text-[9px] text-ink-faint" :class="message.isMine ? 'justify-end' : 'justify-start'">
              <span>{{ message.time }}</span>
              <span v-if="message.isMine && message.read" class="text-plum">seen</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>