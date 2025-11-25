<template>
  <NuxtLayout name="auth">
    <h2 class="text-xl font-semibold text-text-primary mb-6 text-center">Criar Conta</h2>

    <form @submit.prevent="handleRegister" class="space-y-4">
      <div>
        <label class="label">Nome</label>
        <input
          v-model="name"
          type="text"
          class="input"
          placeholder="Seu nome"
          required
        />
      </div>

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
          placeholder="Mínimo 6 caracteres"
          required
          minlength="6"
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
        {{ isLoading ? 'Criando...' : 'Criar Conta' }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-text-secondary">
      Já tem conta?
      <NuxtLink to="/login" class="text-accent hover:underline">
        Entrar
      </NuxtLink>
    </p>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const { register, isLoading } = useAuth()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')

const handleRegister = async () => {
  error.value = ''
  const result = await register(email.value, password.value, name.value)

  if (result.success) {
    router.push('/')
  } else {
    error.value = result.error || 'Erro ao criar conta'
  }
}
</script>
