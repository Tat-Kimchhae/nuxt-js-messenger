<!-- components/auth/RegisterForm.vue -->
<template>
  <form @submit.prevent="handleSubmit" novalidate class="space-y-4">
    <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-1">
      Create a new account
    </h2>
    <p class="text-xs text-gray-500 dark:text-slate-400 mb-4">It's quick and easy.</p>

    <div class="flex gap-2">
      <div class="w-1/2">
        <AuthInput v-model="formData.firstName" placeholder="First name" :error="errors.firstName"/>
      </div>
      <div class="w-1/2">
        <AuthInput v-model="formData.lastName" placeholder="Last name" :error="errors.lastName"/>
      </div>
    </div>

    <AuthInput v-model="formData.email" type="email" placeholder="Mobile number or email" :error="errors.email"/>
    <AuthInput v-model="formData.password" type="password" placeholder="New password" :error="errors.password"/>

    <button type="submit" :disabled="isLoading"
            class="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-md transition duration-200 flex items-center justify-center disabled:opacity-50">
      <span v-if="!isLoading">Sign Up</span>
      <span v-else class="flex items-center gap-2">
        <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Processing...</span>
      </span>
    </button>
  </form>
</template>

<script setup lang="ts">
import {reactive, ref} from "vue";
import {registerSchema} from "~/validation/auth.ts";
import AuthInput from "~/components/auth/AuthInput.vue";

const formData = reactive({firstName: "", lastName: "", email: "", password: ""});
const {errors, validate} = useFormValidation();
const {call, isLoading} = useApi();

const handleSubmit = async () => {
  if (!validate(registerSchema, formData)) return;

  await call(
      () => $fetch("/api/auth/register", {method: "POST", body: formData}),
      {successMessage: (res) => res.message}
  );
};
</script>