<template>
  <div class="min-h-screen bg-surface-secondary flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-text-primary">Report Builder</h1>
        <p class="text-text-secondary mt-2">Construtor de Relatórios</p>
      </div>
      <div class="card p-6">
        <slot />
      </div>
    </div>
  </div>
</template>
