<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import AppIcon from './AppIcon.vue';

const emit = defineEmits<{ send: [text: string, file?: File] }>();
const draft = ref('');
const textarea = ref<HTMLTextAreaElement | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const file = ref<File | null>(null);
const previewUrl = ref<string | null>(null);

const canSend = computed(() => !!draft.value.trim() || !!file.value);

const colorMode = useColorMode();
const showEmoji = ref(false);
const emojiWrap = ref<HTMLElement | null>(null);

function insertEmoji(emoji: string) {
  const el = textarea.value;
  if (!el) {
    draft.value += emoji;
    return;
  }
  const start = el.selectionStart ?? draft.value.length;
  const end = el.selectionEnd ?? draft.value.length;
  draft.value = draft.value.slice(0, start) + emoji + draft.value.slice(end);
  showEmoji.value = false;
  nextTick(() => {
    el.focus();
    el.setSelectionRange(start + emoji.length, start + emoji.length);
    resize();
  });
}

function onDocClick(event: MouseEvent) {
  if (showEmoji.value && !emojiWrap.value?.contains(event.target as Node)) showEmoji.value = false;
}

onMounted(() => {
  import('emoji-picker-element');
  document.addEventListener('click', onDocClick);
});

function onEmojiClick(event: CustomEvent<{ unicode?: string }>) {
  if (event.detail.unicode) insertEmoji(event.detail.unicode);
}

watch(file, (next) => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = next ? URL.createObjectURL(next) : null;
});

onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
});

function resize() {
  if (!textarea.value) return;
  textarea.value.style.height = 'auto';
  textarea.value.style.height = `${Math.min(textarea.value.scrollHeight, 120)}px`;
}

function onPick(event: Event) {
  const input = event.target as HTMLInputElement;
  const picked = input.files?.[0];
  if (picked && picked.type.startsWith('image/')) file.value = picked;
  input.value = '';
}

function send() {
  const text = draft.value.trim();
  if (!text && !file.value) return;
  emit('send', text, file.value ?? undefined);
  draft.value = '';
  file.value = null;
  nextTick(resize);
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    send();
  }
}
</script>

<template>
  <div class="border-t border-line bg-surface-chat px-4 pb-4 pt-3 sm:px-8 sm:pb-6 lg:px-12 dark:bg-[#19191f]">
    <div class="mx-auto max-w-3xl">
      <div v-if="previewUrl" class="mb-2 flex items-center gap-3 px-1">
        <img :src="previewUrl" alt="" class="h-14 w-14 rounded-xl object-cover" />
        <p class="min-w-0 flex-1 truncate text-[11px] text-ink-dim">{{ file?.name }}</p>
        <button data-testid="button-remove-attachment" class="text-ink-faint transition hover:text-ink" title="Remove"
          @click="file = null">
          <AppIcon name="close" :size="16" />
        </button>
      </div>

      <div
        class="flex items-end gap-2 rounded-[18px] border border-line bg-void/75 p-2 transition focus-within:border-plum/50">
        <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onPick" />
        <button data-testid="button-attach-file"
          class="mb-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl text-ink-faint transition hover:bg-black/5 hover:text-ink dark:hover:bg-white/5"
          title="Attach an image" @click="fileInput?.click()">
          <AppIcon name="paperclip" :size="18" />
        </button>

        <textarea ref="textarea" v-model="draft" data-testid="input-message-composer" rows="1"
          class="max-h-[120px] min-h-[36px] flex-1 resize-none bg-transparent px-1.5 py-2 text-[13px] leading-5 text-ink outline-none placeholder:text-ink-faint"
          placeholder="Write a message..." @input="resize" @keydown="onKeydown" />

        <!-- emoji: replaces the old <button data-testid="button-add-reaction"> -->
        <div ref="emojiWrap" class="relative mb-0.5 hidden sm:block">
          <button data-testid="button-add-reaction"
            class="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-ink-faint transition hover:bg-black/5 hover:text-ink dark:hover:bg-white/5"
            title="Emoji" @click="showEmoji = !showEmoji">
            <AppIcon name="smile" :size="18" />
          </button>
          <ClientOnly>
            <emoji-picker v-show="showEmoji" :class="colorMode.value === 'dark' ? 'dark' : 'light'"
              class="absolute bottom-12 right-0 z-20 shadow-2xl shadow-black/20" style="width: 320px; height: 360px"
              @emoji-click="onEmojiClick" />
          </ClientOnly>
        </div>

        <button data-testid="button-send-message"
          class="mb-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl transition"
          :class="canSend ? 'bg-plum text-void hover:bg-[#c4b0ff]' : 'bg-panel-raised text-ink-faint'"
          title="Send message" @click="send">
          <AppIcon name="send" :size="16" />
        </button>
      </div>
      <p class="mt-2 hidden text-center font-mono text-[9px] uppercase tracking-[.14em] text-ink-faint sm:block">enter
        to send · shift + enter for a new line</p>
    </div>
  </div>
</template>