<template>
  <div class="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col justify-between font-sans transition-colors duration-300">
    <!-- Header with Dark Mode Toggle -->
    <header class="p-4 flex justify-end">
      <button @click="toggle"
              class="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-700 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
        <svg v-if="colorMode.value === 'dark'" class="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
        </svg>
        <svg v-else class="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
        </svg>
        <span class="text-xs font-medium">{{ colorMode.value === "dark" ? "Light Mode" : "Dark Mode" }}</span>
      </button>
    </header>

    <!-- Main Section -->
    <div class="grow flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div class="max-w-4xl w-full flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-20">
        <!-- Brand Visual -->
        <div class="flex flex-col items-center md:items-start text-center md:text-left max-w-md">
          <div class="w-20 h-20 mb-4 bg-linear-to-tr from-[#0099FF] via-[#A033FF] to-[#FF5280] rounded-2xl flex items-center justify-center shadow-md">
            <svg class="w-12 h-12 text-white fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.45 5.518 3.716 7.202V22l3.376-1.854c.91.252 1.88.39 2.908.39 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.2 12.333l-2.534-2.703-4.945 2.703 5.44-5.77 2.595 2.702 4.883-2.702-5.439 5.77z"/>
            </svg>
          </div>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Connect with your favorite people.
          </h1>
          <p class="mt-3 text-lg text-gray-600 dark:text-slate-400">
            Hang out anytime, anywhere — Messenger makes it easy and fun to stay
            close to your favorite people.
          </p>
        </div>

        <!-- Form Card -->
        <div class="w-full max-w-sm">
          <div class="bg-white dark:bg-slate-800 py-8 px-6 shadow-xl rounded-2xl border border-gray-100 dark:border-slate-700">
            <LoginForm v-if="isLoginForm"/>
            <RegisterForm v-else/>

            <!-- Switcher Button -->
            <div class="mt-6 border-t border-gray-100 dark:border-slate-700 pt-6 text-center">
              <button type="button" @click="isLoginForm = !isLoginForm" class="cursor-pointer px-5 py-2.5 rounded-xl text-xs font-semibold transition duration-200
                 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900
                 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white
                 border border-transparent dark:border-slate-700/60 shadow-sm">
                {{ isLoginForm ? "Create new account" : "Already have an account?" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <footer class="py-6 text-center text-xs text-gray-500 dark:text-slate-400">
      <p>&copy; {{ new Date().getFullYear() }} Meta / Messenger Clone</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import RegisterForm from "~/components/auth/RegisterForm.vue";
import LoginForm from "~/components/auth/LoginForm.vue";

const isLoginForm = ref(true);
const {colorMode, toggle} = useThemeTransition();
</script>