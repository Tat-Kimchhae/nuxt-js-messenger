<template>
  <div
      class="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col justify-between font-sans transition-colors duration-300">
    <!-- Header with Dark Mode Toggle -->
    <header class="p-4 flex justify-end">
      <button @click="toggleThemeWithTransition"
              class="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-700 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
        <svg v-if="$colorMode.value === 'dark'" class="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
        </svg>
        <svg v-else class="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
        </svg>
        <span class="text-xs font-medium">{{ $colorMode.value === "dark" ? "Light Mode" : "Dark Mode" }}</span>
      </button>
    </header>

    <!-- Main Section -->
    <div class="grow flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div class="max-w-4xl w-full flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-20">
        <!-- Brand Visual -->
        <div class="flex flex-col items-center md:items-start text-center md:text-left max-w-md">
          <div
              class="w-20 h-20 mb-4 bg-linear-to-tr from-[#0099FF] via-[#A033FF] to-[#FF5280] rounded-2xl flex items-center justify-center shadow-md">
            <svg class="w-12 h-12 text-white fill-current" viewBox="0 0 24 24">
              <path
                  d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.45 5.518 3.716 7.202V22l3.376-1.854c.91.252 1.88.39 2.908.39 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.2 12.333l-2.534-2.703-4.945 2.703 5.44-5.77 2.595 2.702 4.883-2.702-5.439 5.77z"/>
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
          <div
              class="bg-white dark:bg-slate-800 py-8 px-6 shadow-xl rounded-2xl border border-gray-100 dark:border-slate-700">
            <!-- LOGIN FORM -->
            <form v-if="isLoginForm" @submit.prevent="handleLoginSubmit" novalidate class="space-y-4">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Log Into Messenger
              </h2>

              <!-- Login Email -->
              <div>
                <input v-model="loginForm.email" type="text" placeholder="Email address or phone number" :class="[
                  'w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 text-sm bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white dark:placeholder-slate-400',
                  errors.email
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-200 dark:border-slate-600 focus:ring-blue-500',
                ]"/>
                <p v-if="errors.email" class="text-red-500 text-xs mt-1 pl-1">
                  {{ errors.email }}
                </p>
              </div>

              <!-- Login Password -->
              <div>
                <input v-model="loginForm.password" type="password" placeholder="Password" :class="[
                  'w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 text-sm bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white dark:placeholder-slate-400',
                  errors.password
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-200 dark:border-slate-600 focus:ring-blue-500',
                ]"/>
                <p v-if="errors.password" class="text-red-500 text-xs mt-1 pl-1">
                  {{ errors.password }}
                </p>
              </div>

              <button type="submit" :disabled="isLoading"
                      class="cursor-pointer w-full py-3 px-4 bg-[#0084FF] hover:bg-[#0073E6] text-white font-semibold rounded-xl shadow-md transition duration-200 flex items-center justify-center disabled:opacity-50">
                <span v-if="!isLoading">Log In</span>
                <span v-else class="flex items-center gap-2">
                  <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                       viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                  </svg>
                  <span>Processing...</span>
                </span>
              </button>
            </form>

            <!-- REGISTER FORM -->
            <form v-else @submit.prevent="handleRegisterSubmit" novalidate class="space-y-4">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Create a new account
              </h2>
              <p class="text-xs text-gray-500 dark:text-slate-400 mb-4">
                It's quick and easy.
              </p>

              <!-- First & Last Name -->
              <div class="flex gap-2">
                <div class="w-1/2">
                  <input v-model="registerForm.firstName" type="text" placeholder="First name" :class="[
                    'w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 text-sm bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white dark:placeholder-slate-400',
                    errors.firstName
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-200 dark:border-slate-600 focus:ring-blue-500',
                  ]"/>
                  <p v-if="errors.firstName" class="text-red-500 text-xs mt-1 pl-1">
                    {{ errors.firstName }}
                  </p>
                </div>

                <div class="w-1/2">
                  <input v-model="registerForm.lastName" type="text" placeholder="Last name" :class="[
                    'w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 text-sm bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white dark:placeholder-slate-400',
                    errors.lastName
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-200 dark:border-slate-600 focus:ring-blue-500',
                  ]"/>
                  <p v-if="errors.lastName" class="text-red-500 text-xs mt-1 pl-1">
                    {{ errors.lastName }}
                  </p>
                </div>
              </div>

              <!-- Register Email -->
              <div>
                <input v-model="registerForm.email" type="email" placeholder="Mobile number or email" :class="[
                  'w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 text-sm bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white dark:placeholder-slate-400',
                  errors.email
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-200 dark:border-slate-600 focus:ring-blue-500',
                ]"/>
                <p v-if="errors.email" class="text-red-500 text-xs mt-1 pl-1">
                  {{ errors.email }}
                </p>
              </div>

              <!-- Register Password -->
              <div>
                <input v-model="registerForm.password" type="password" placeholder="New password" :class="[
                  'w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 text-sm bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white dark:placeholder-slate-400',
                  errors.password
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-200 dark:border-slate-600 focus:ring-blue-500',
                ]"/>
                <p v-if="errors.password" class="text-red-500 text-xs mt-1 pl-1">
                  {{ errors.password }}
                </p>
              </div>

              <button type="submit" :disabled="isLoading"
                      class="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-md transition duration-200 flex items-center justify-center disabled:opacity-50">
                <span v-if="!isLoading">Sign Up</span>
                <span v-else class="flex items-center gap-2">
                  <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                       viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                  </svg>
                  <span>Processing...</span>
                </span>
              </button>
            </form>

            <!-- Switcher Button -->
            <div class="mt-6 border-t border-gray-100 dark:border-slate-700 pt-6 text-center">
              <button type="button" @click="switchForm" class="cursor-pointer px-5 py-2.5 rounded-xl text-xs font-semibold transition duration-200
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
import {ref, reactive} from "vue";
import {toast} from "vue-sonner";
import {loginSchema, registerSchema} from "~/validation/auth";

const colorMode = useColorMode();
const isLoginForm = ref(true);
const isLoading = ref(false);

// Stores validation field errors
const errors = reactive<Record<string, string>>({});

// State
const loginForm = reactive({email: "user1@gmail.com", password: "123456"});
const registerForm = reactive({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
});

// Clear errors when toggling forms
const switchForm = () => {
  isLoginForm.value = !isLoginForm.value;
  Object.keys(errors).forEach((key) => delete errors[key]);
};

// Generic validation helper
const validate = (schema, data) => {
  Object.keys(errors).forEach((key) => delete errors[key]); // reset errors
  const result = schema.safeParse(data);

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      const field = issue.path[0];
      if (!errors[field]) {
        errors[field] = issue.message;
      }
    });
    return false;
  }
  return true;
};

const handleLoginSubmit = async () => {
  if (!validate(loginSchema, loginForm)) return;

  isLoading.value = true;

  try {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: loginForm,
    });
    toast.success(response.message);
  } catch (err: any) {
    console.error('Login failed:', err.data?.message || err.message);
    toast.error(err.data?.message || 'Login failed');
  } finally {
    isLoading.value = false;
  }
};

const handleRegisterSubmit = async () => {
  if (!validate(registerSchema, registerForm)) return;

  isLoading.value = true;

  try {
    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: registerForm,
    });
    toast.success(response.message);
  } catch (err: any) {
    console.error('Register failed:', err.data?.message || err.message);
    toast.error(err.data?.message || 'Registration failed');
  } finally {
    isLoading.value = false;
  }
}

// View Transition API Theme Switch
const toggleThemeWithTransition = (event) => {
  const nextTheme = colorMode.value === "dark" ? "light" : "dark";

  if (!document.startViewTransition) {
    colorMode.preference = nextTheme;
    return;
  }

  const x = event.clientX;
  const y = event.clientY;
  const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y),
  );

  const transition = document.startViewTransition(() => {
    colorMode.preference = nextTheme;
  });

  transition.ready.then(() => {
    document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 450,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        },
    );
  });
};

</script>
