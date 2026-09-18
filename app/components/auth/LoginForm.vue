<template>
  <form @submit.prevent="handleSubmit" novalidate class="space-y-4">
    <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
      Log Into Messenger
    </h2>

    <AuthInput v-model="formData.email" placeholder="Email address or phone number" :error="errors.email" />
    <AuthInput v-model="formData.password" type="password" placeholder="Password" :error="errors.password" />

    <button type="submit" :disabled="isLoading"
      class="cursor-pointer w-full py-3 px-4 bg-[#0084FF] hover:bg-[#0073E6] text-white font-semibold rounded-xl shadow-md transition duration-200 flex items-center justify-center disabled:opacity-50">
      <span v-if="!isLoading">Log In</span>
      <span v-else class="flex items-center gap-2">
        <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
        </svg>
        <span>Processing...</span>
      </span>
    </button>
  </form>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { loginSchema } from "~/validation/auth.ts";
import AuthInput from "~/components/auth/AuthInput.vue";

const formData = reactive({ email: "user1@gmail.com", password: "123456" });
const { errors, validate } = useFormValidation();
const { call, isLoading } = useApi();

const handleSubmit = async () => {
  if (!validate(loginSchema, formData)) return
  await call(
    () => $fetch("/api/auth/login", { method: "POST", body: formData }),
    { successMessage: (response) => response.message }
  ).then(response => {
    if (response) navigateTo("/");
  });
}
</script>