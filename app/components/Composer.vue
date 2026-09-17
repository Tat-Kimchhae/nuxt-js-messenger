<script setup lang="ts">
import { nextTick, ref } from 'vue';
import AppIcon from './AppIcon.vue';

const emit = defineEmits<{ send: [text: string] }>();
const draft = ref('');
const textarea = ref<HTMLTextAreaElement | null>(null);

function resize() {
  if (!textarea.value) return;
  textarea.value.style.height = 'auto';
  textarea.value.style.height = `${Math.min(textarea.value.scrollHeight, 120)}px`;
}

function send() {
  const text = draft.value.trim();
  if (!text) return;
  emit('send', text);
  draft.value = '';
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
      <div class="flex items-end gap-2 rounded-[18px] border border-line bg-void/75 p-2 transition focus-within:border-plum/50">
         <button data-testid="button-attach-file" class="mb-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl text-ink-faint transition hover:bg-black/5 hover:text-ink dark:hover:bg-white/5" title="Attach a file"><AppIcon name="paperclip" :size="18" /></button>
        <textarea
          ref="textarea"
          v-model="draft"
          data-testid="input-message-composer"
          rows="1"
          class="max-h-[120px] min-h-[36px] flex-1 resize-none bg-transparent px-1.5 py-2 text-[13px] leading-5 text-ink outline-none placeholder:text-ink-faint"
          placeholder="Write a message..."
          @input="resize"
          @keydown="onKeydown"
        />
         <button data-testid="button-add-reaction" class="mb-0.5 hidden h-9 w-9 shrink-0 place-items-center rounded-xl text-ink-faint transition hover:bg-black/5 hover:text-ink dark:hover:bg-white/5 sm:grid" title="Add reaction"><AppIcon name="smile" :size="18" /></button>
        <button data-testid="button-send-message" class="mb-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl transition" :class="draft.trim() ? 'bg-plum text-void hover:bg-[#c4b0ff]' : 'bg-panel-raised text-ink-faint'" title="Send message" @click="send"><AppIcon name="send" :size="16" /></button>
      </div>
      <p class="mt-2 hidden text-center font-mono text-[9px] uppercase tracking-[.14em] text-ink-faint sm:block">enter to send · shift + enter for a new line</p>
    </div>
  </div>
</template>