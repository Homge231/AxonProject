<template>
  <div class="flex items-center justify-center min-h-screen bg-background px-4">
    <div class="w-full max-w-sm">

      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-primary-fixed tracking-widest uppercase">
          Naenra
        </h1>
        <p class="text-on-surface-variant text-sm mt-2">
          Email Verification
        </p>
      </div>

      <div class="bg-surface-container rounded-xl border border-outline-variant p-8">

        <div class="text-center mb-6">
          <div class="text-4xl mb-3">📧</div>
          <h2 class="text-on-surface font-bold text-lg mb-1">Check your email</h2>
          <p class="text-on-surface-variant text-sm">
            We sent a 6-digit code to
          </p>
          <p class="text-primary-fixed font-bold text-sm mt-1">{{ email }}</p>
        </div>

        <!-- OTP Input -->
        <div class="flex gap-2 justify-center mb-6">
          <input
            v-for="(_, i) in 6"
            :key="i"
            :ref="el => { if (el) inputs[i] = el as HTMLInputElement }"
            v-model="otpDigits[i]"
            type="text"
            maxlength="1"
            @input="handleInput(i)"
            @keydown="handleKeydown($event, i)"
            @paste="handlePaste"
            class="w-12 h-14 text-center text-2xl font-bold bg-surface-container-high border-2 border-outline-variant rounded-lg text-primary-fixed focus:border-primary-fixed focus:outline-none transition-colors"
          />
        </div>

        <!-- Error -->
        <p v-if="error" class="text-error text-sm text-center mb-4">{{ error }}</p>

        <!-- Verify Button -->
        <button
          @click="handleVerify"
          :disabled="loading || otp.length < 6"
          class="w-full py-3 bg-primary-fixed text-on-primary font-bold rounded-lg hover:opacity-90 transition uppercase tracking-widest disabled:opacity-50 mb-4"
        >
          {{ loading ? 'Verifying...' : 'Verify Code' }}
        </button>

        <!-- Resend -->
        <div class="text-center">
          <p class="text-on-surface-variant text-sm">
            Didn't receive the code?
          </p>
          <button
            @click="handleResend"
            :disabled="resendCooldown > 0 || resendLoading"
            class="text-primary-fixed text-sm font-bold hover:opacity-80 transition disabled:opacity-50 mt-1"
          >
            {{ resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code' }}
          </button>
        </div>

        <!-- Back -->
        <button
          @click="router.push('/')"
          class="w-full mt-4 py-2 text-on-surface-variant text-sm hover:text-on-surface transition"
        >
          ← Back to Login
        </button>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const email = ref((route.query.email as string) || '')
const otpDigits = ref<string[]>(['', '', '', '', '', ''])
const inputs = ref<HTMLInputElement[]>([])
const loading = ref(false)
const resendLoading = ref(false)
const error = ref('')
const resendCooldown = ref(0)

const otp = computed(() => otpDigits.value.join(''))

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

onMounted(() => {
  if (!email.value) router.push('/')
  inputs.value[0]?.focus()
  startResendCooldown()
})

function startResendCooldown() {
  resendCooldown.value = 60
  const interval = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) clearInterval(interval)
  }, 1000)
}

function handleInput(index: number) {
  const val = otpDigits.value[index]
  if (val && val.length > 0) {
    otpDigits.value[index] = val[val.length - 1]
    if (index < 5) inputs.value[index + 1]?.focus()
  }
}

function handleKeydown(e: KeyboardEvent, index: number) {
  if (e.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    inputs.value[index - 1]?.focus()
  }
}

function handlePaste(e: ClipboardEvent) {
  e.preventDefault()
  const paste = e.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6)
  if (!paste) return
  paste.split('').forEach((char, i) => {
    otpDigits.value[i] = char
  })
  inputs.value[Math.min(paste.length, 5)]?.focus()
}

async function handleVerify() {
  if (otp.value.length < 6) return
  error.value = ''
  loading.value = true

  try {
    const res = await fetch(`${SERVER_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, otp: otp.value })
    })

    const data = await res.json()

    if (!res.ok) {
      error.value = data.error || 'Invalid code'
      otpDigits.value = ['', '', '', '', '', '']
      inputs.value[0]?.focus()
      return
    }

    localStorage.setItem('arena_token', data.token)
    auth.user = data.user
    router.push('/home')

  } catch {
    error.value = 'Server error. Please try again.'
  } finally {
    loading.value = false
  }
}

async function handleResend() {
  resendLoading.value = true
  try {
    await fetch(`${SERVER_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value })
    })
    startResendCooldown()
    otpDigits.value = ['', '', '', '', '', '']
    inputs.value[0]?.focus()
  } catch {
    error.value = 'Failed to resend. Try again.'
  } finally {
    resendLoading.value = false
  }
}
</script>
