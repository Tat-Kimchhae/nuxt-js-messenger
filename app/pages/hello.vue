<template>
  <div class="relative flex min-h-screen items-center justify-center bg-slate-950 font-sans text-slate-100 overflow-hidden">
    <!-- Ambient background glow -->
    <div class="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl"></div>
    <div class="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-fuchsia-600/20 blur-3xl"></div>

    <!-- Grid pattern overlay -->
    <div class="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

    <!-- Glass card container -->
    <div class="relative z-10 flex flex-col items-center gap-6 rounded-3xl border border-slate-800 bg-slate-900/50 p-12 text-center backdrop-blur-xl shadow-2xl transition-all duration-300 hover:border-slate-700/80">

      <!-- Status Badge -->
      <div class="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
        <span class="relative flex h-2 w-2">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
        </span>
        System Online
      </div>

      <!-- Main Heading -->
      <h1 class="bg-gradient-to-r from-indigo-300 via-white to-fuchsia-300 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-7xl">
        Hello World!
      </h1>

      <p class="max-w-md text-sm text-slate-400 sm:text-base">
        Welcome to your next generation web application layout powered by Vue & Tailwind CSS.
      </p>

      <!-- Action buttons -->
      <div class="mt-2 flex flex-wrap justify-center gap-4">
        <button class="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all duration-200 hover:bg-indigo-500 hover:shadow-indigo-500/30 active:scale-95">
          Get Started
        </button>
        <button class="rounded-xl border border-slate-700 bg-slate-800/50 px-6 py-2.5 text-sm font-semibold text-slate-300 backdrop-blur-sm transition-all duration-200 hover:bg-slate-800 hover:text-white active:scale-95">
          Documentation
        </button>
      </div>
    </div>
  </div>
</template>