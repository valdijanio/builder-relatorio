<template>
  <NuxtLayout name="auth">
    <h2 class="text-xl font-semibold text-text-primary mb-6 text-center">Entrar</h2>

    <form @submit.prevent="handleLogin" class="space-y-4">
      <div>
        <label class="label">Email</label>
        <input
          v-model="email"
          type="email"
          class="input"
          placeholder="seu@email.com"
          required
        />
      </div>

      <div>
        <label class="label">Senha</label>
        <input
          v-model="password"
          type="password"
          class="input"
          placeholder="••••••••"
          required
        />
      </div>

      <div v-if="error" class="p-3 bg-status-error/10 text-status-error rounded-lg text-sm">
        {{ error }}
      </div>

      <button
        type="submit"
        class="btn-primary w-full"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Entrando...' : 'Entrar' }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-text-secondary">
      Não tem conta?
      <NuxtLink to="/register" class="text-accent hover:underline">
        Criar conta
      </NuxtLink>
    </p>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const { login, isLoading } = useAuth()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  const result = await login(email.value, password.value)

  if (result.success) {
    router.push('/')
  } else {
    error.value = result.error || 'Erro ao fazer login'
  }
}
</script>
