<script setup lang="ts">
import { computed } from 'vue';
import Avatar from './Avatar.vue';

type Person = { id: string; name: string; initials: string; color: string; online?: boolean };
type Message = { id: number; senderId: string; text: string; time: string; read?: boolean };
type Conversation = { id: string; title: string; kind: 'direct' | 'group'; members: Person[]; messages: Message[] };
const props = defineProps<{ conversation: Conversation; people: Record<string, Person>; me: Person }>();

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
   <div data-message-scroll class="scrollbar-thin flex-1 overflow-y-auto bg-surface-chat px-4 py-6 sm:px-8 lg:px-12 dark:bg-[#19191f]">
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
              {{ message.text }}
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