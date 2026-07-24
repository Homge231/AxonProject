<template>
  <div class="home-root" id="home-lobby">

    <!-- ═══════════════════════ ANIMATED BACKGROUND ════════════════════════ -->
    <div class="bg-layer" aria-hidden="true">
      <!-- Floating gradient orbs -->
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>

      <!-- Subtle particle field -->
      <div
        v-for="p in particles"
        :key="p.id"
        class="particle"
        :style="p.style"
      ></div>

      <!-- Cyber grid overlay -->
      <div class="cyber-grid"></div>

      <!-- Watermark text -->
      <div class="watermark" aria-hidden="true">NAENRA</div>
    </div>

    <!-- ═══════════════════════════ HEADER ═════════════════════════════════ -->
    <header class="home-header" role="banner">
      <!-- Logo -->
      <div class="logo-group" @click="router.push('/home')" role="link" tabindex="0" aria-label="Go to home">
        <div class="logo-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
            <path d="M7 3 L7 21 L12 21 L12 9 L17 21 L17 3 L12 3 L12 15 L7 3 Z" />
          </svg>
        </div>
        <div class="logo-text">
          <span class="logo-name">NAENRA</span>
          <span class="logo-sub">TYPING ESPORTS ARENA</span>
        </div>
      </div>

      <!-- Nav actions -->
      <nav class="header-nav" aria-label="Header navigation">
        <!-- Analytics button -->
        <button
          class="nav-icon-btn"
          @click="router.push('/analytics'); audioService.playClick()"
          @mouseenter="audioService.playHover()"
          title="Vocabulary Analytics"
          aria-label="Vocabulary Analytics"
          id="nav-analytics-btn"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </button>

        <!-- Logout button -->
        <button
          class="nav-icon-btn nav-icon-btn--danger"
          @click="handleLogout"
          @mouseenter="audioService.playHover()"
          title="Disconnect"
          aria-label="Disconnect / Logout"
          id="nav-logout-btn"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </nav>
    </header>

    <!-- ═══════════════════════════ MAIN ═══════════════════════════════════ -->
    <main class="home-main" role="main">

      <!-- ── LEFT: Hero + CTAs ──────────────────────────────────────────── -->
      <section class="hero-section" aria-labelledby="hero-heading">

        <!-- Season badge -->
        <div class="season-badge" role="status" aria-live="polite">
          <span class="season-dot" aria-hidden="true"></span>
          <span>Season 1 is Live</span>
        </div>

        <!-- Hero heading -->
        <h1 id="hero-heading" class="hero-heading">
          <span class="hero-heading--light">Ranked</span><br />
          <span class="hero-heading--red">Clash</span>
        </h1>

        <p class="hero-sub">
          The ranked servers are primed and ready. Showcase your speed,
          enhance your accuracy, and claim your dominance on the global leaderboard.
        </p>

        <!-- ── PRIMARY CTA: Single Player ──── -->
        <div class="cta-primary-wrap">
          <button
            id="btn-single-player"
            class="cta-primary"
            :class="{ 'cta-primary--loading': isSearching }"
            @click="startSinglePlayer"
            @mouseenter="audioService.playHover()"
            :disabled="isSearching"
            aria-label="Start Single Player match"
          >
            <!-- Shimmer sweep layer -->
            <span class="cta-primary__shimmer" aria-hidden="true"></span>
            <!-- Fill gradient layer -->
            <span class="cta-primary__fill" aria-hidden="true"></span>

            <span class="cta-primary__content">
              <span class="cta-primary__icon" aria-hidden="true">
                <svg v-if="!isSearching" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg v-else class="spin-icon" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </span>
              <span class="cta-primary__label">
                {{ isSearching ? 'INITIALIZING...' : 'SINGLE PLAYER' }}
              </span>
              <span class="cta-primary__arrow" aria-hidden="true">→</span>
            </span>
          </button>

          <p v-if="isSearching" class="cta-searching-hint" aria-live="polite">
            ▶ Preparing your session...
          </p>
        </div>

        <!-- ── SECONDARY CTA: 1v1 Match ─────── -->
        <button
          id="btn-find-match"
          class="cta-secondary"
          :class="{ 'cta-secondary--loading': isFindingMatch }"
          @click="startMatchmaking"
          @mouseenter="audioService.playHover()"
          :disabled="isFindingMatch"
          aria-label="Find a 1vs1 ranked match"
        >
          <span class="cta-secondary__icon" aria-hidden="true">
            <svg v-if="!isFindingMatch" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <svg v-else class="spin-icon" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </span>
          <span class="cta-secondary__label">
            {{ isFindingMatch ? 'SEARCHING...' : '1 vs 1 MATCH' }}
          </span>
          <span class="cta-secondary__badge" aria-hidden="true">RANKED</span>
        </button>

        <!-- ── TERTIARY grid ────────────────── -->
        <div class="tertiary-grid" role="group" aria-label="Additional options">
          <button
            id="btn-custom-room"
            class="tertiary-btn"
            @click="goToCustomRoom"
            @mouseenter="audioService.playHover()"
            :disabled="isJoiningCustom"
            aria-label="Create a custom 1v1 room"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 4v16m8-8H4" />
            </svg>
            {{ isJoiningCustom ? 'CONNECTING...' : 'CREATE ROOM' }}
          </button>

          <div class="join-code-wrap" role="group" aria-label="Join a room by code">
            <input
              id="input-join-code"
              v-model="joinCode"
              @keyup.enter="joinExistingRoom"
              type="text"
              placeholder="ENTER CODE..."
              class="join-code-input"
              maxlength="12"
              aria-label="Room code"
              autocomplete="off"
            />
            <button
              id="btn-join-code"
              @click="joinExistingRoom"
              @mouseenter="audioService.playHover()"
              :disabled="!joinCode || isJoiningCustom"
              class="join-code-btn"
              aria-label="Join room"
            >→</button>
          </div>

          <button
            id="btn-leaderboard"
            class="tertiary-btn"
            @mouseenter="audioService.playHover()"
            aria-label="View leaderboard (coming soon)"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            LEADERBOARD
          </button>
        </div>
      </section>

      <!-- ── RIGHT: Profile & Stats Card ──────────────────────────────────── -->
      <aside class="stats-panel" aria-label="Player profile and statistics">
        <div class="profile-card glass-card">

          <!-- Card header label -->
          <div class="profile-card__label">
            <span class="profile-card__dot" aria-hidden="true"></span>
            PLAYER PROFILE
          </div>

          <!-- Avatar -->
          <div class="profile-avatar-wrap" @click="router.push('/profile')" role="link" tabindex="0" aria-label="View profile">
            <div class="profile-avatar-ring" aria-hidden="true"></div>
            <div class="profile-avatar-img-wrap">
              <img
                :src="avatarUrl"
                :alt="username"
                class="profile-avatar-img"
                @error="(e) => (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`"
              />
            </div>
            <div class="profile-avatar-edit-hint" aria-hidden="true">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit
            </div>
          </div>

          <!-- Username + rank badge -->
          <div class="profile-identity">
            <h2 class="profile-username">{{ username }}</h2>
            <span class="profile-rank-badge" :class="`rank-${rankTier}`">{{ rank }}</span>
          </div>

          <!-- ELO bar -->
          <div class="elo-section">
            <div class="elo-section__header">
              <span class="elo-section__label">ELO Rating</span>
              <span class="elo-section__value">{{ elo }}</span>
            </div>
            <div class="elo-bar" role="progressbar" :aria-valuenow="elo" aria-valuemin="0" aria-valuemax="3000">
              <div class="elo-bar__fill" :style="{ width: eloBarWidth }"></div>
            </div>
            <div class="elo-tier-labels" aria-hidden="true">
              <span>Bronze</span><span>Silver</span><span>Gold</span><span>Diamond</span>
            </div>
          </div>

          <!-- Stats grid -->
          <div class="stats-grid" role="list">
            <div class="stat-chip stat-chip--wins" role="listitem">
              <span class="stat-chip__label">Wins</span>
              <span class="stat-chip__value">{{ wins }}</span>
            </div>
            <div class="stat-chip stat-chip--losses" role="listitem">
              <span class="stat-chip__label">Losses</span>
              <span class="stat-chip__value">{{ losses }}</span>
            </div>
            <div class="stat-chip stat-chip--matches" role="listitem">
              <span class="stat-chip__label">Matches</span>
              <span class="stat-chip__value">{{ totalMatches }}</span>
            </div>
            <div class="stat-chip stat-chip--wr" role="listitem">
              <span class="stat-chip__label">Win Rate</span>
              <span class="stat-chip__value">{{ winRate }}</span>
            </div>
          </div>

          <!-- View profile link -->
          <button
            class="profile-link-btn"
            @click="router.push('/profile'); audioService.playClick()"
            @mouseenter="audioService.playHover()"
            aria-label="View full profile"
            id="btn-view-profile"
          >
            <span>View Full Profile</span>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </aside>
    </main>

    <!-- ═══════════════════════════ FOOTER BAR ════════════════════════════ -->
    <div class="home-footer-bar" aria-hidden="true">
      <div class="home-footer-bar__accent-1"></div>
      <div class="home-footer-bar__dot"></div>
      <div class="home-footer-bar__accent-2"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { audioService } from '../services/audioService'

const router = useRouter()
const authStore = useAuthStore()

// ── State ─────────────────────────────────────────────────────────────────
const isSearching   = ref(false)   // single-player loading
const isFindingMatch = ref(false)  // 1v1 match loading
const isJoiningCustom = ref(false)
const joinCode       = ref('')

// ── Particle field data ───────────────────────────────────────────────────
interface Particle { id: number; style: Record<string, string> }
const particles = computed<Particle[]>(() => {
  return Array.from({ length: 22 }, (_, i) => ({
    id: i,
    style: {
      left:              `${Math.random() * 100}%`,
      top:               `${Math.random() * 100}%`,
      width:             `${1 + Math.random() * 2}px`,
      height:            `${1 + Math.random() * 2}px`,
      opacity:           `${0.08 + Math.random() * 0.18}`,
      animationDelay:    `${Math.random() * 8}s`,
      animationDuration: `${6 + Math.random() * 10}s`,
    }
  }))
})

// ── Profile data ──────────────────────────────────────────────────────────
const username = computed(() =>
  authStore.profile?.username ||
  authStore.user?.user_metadata?.full_name ||
  'Player'
)

const avatarUrl = computed(() =>
  authStore.profile?.avatar_url ||
  authStore.user?.user_metadata?.avatar_url ||
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${username.value}`
)

const elo          = computed(() => authStore.profile?.elo          ?? 0)
const rank         = computed(() => authStore.profile?.rank         ?? 'Unranked')
const wins         = computed(() => authStore.profile?.wins         ?? 0)
const losses       = computed(() => authStore.profile?.losses       ?? 0)
const totalMatches = computed(() => authStore.profile?.total_matches ?? 0)

const winRate = computed(() => {
  const total = wins.value + losses.value
  if (total === 0) return '—'
  return `${Math.round((wins.value / total) * 100)}%`
})

/** Clamp ELO 0→3000 to bar width 0→100% */
const eloBarWidth = computed(() => `${Math.min(100, (elo.value / 3000) * 100)}%`)

/** Map rank string to a CSS tier class for colour coding */
const rankTier = computed(() => {
  const r = rank.value?.toLowerCase() ?? ''
  if (r.includes('diamond') || r.includes('master') || r.includes('grand')) return 'diamond'
  if (r.includes('gold'))   return 'gold'
  if (r.includes('silver')) return 'silver'
  if (r.includes('bronze')) return 'bronze'
  return 'unranked'
})

// ── Actions ───────────────────────────────────────────────────────────────
function startSinglePlayer() {
  audioService.playClick()
  isSearching.value = true
  setTimeout(() => {
    isSearching.value = false
    router.push('/core')
  }, 1800)
}

function startMatchmaking() {
  audioService.playClick()
  isFindingMatch.value = true
  setTimeout(() => {
    isFindingMatch.value = false
    // Placeholder until full matchmaking is wired; navigate to custom room for now
    router.push('/room/custom')
  }, 3000)
}

function goToCustomRoom() {
  audioService.playClick()
  isJoiningCustom.value = true
  setTimeout(() => {
    router.push('/room/custom').finally(() => {
      isJoiningCustom.value = false
    })
  }, 600)
}

function joinExistingRoom() {
  if (!joinCode.value) return
  audioService.playClick()
  isJoiningCustom.value = true
  setTimeout(() => {
    const code = joinCode.value.trim()
    router.push(`/room/custom?id=${code}`).finally(() => {
      isJoiningCustom.value = false
      joinCode.value = ''
    })
  }, 600)
}

function handleLogout() {
  audioService.playClick()
  authStore.logout()
  router.push('/')
}

onMounted(() => {
  audioService.stopBGM()
})
</script>

<style scoped>
/* ╔══════════════════════════════════════════════════════════╗
   ║  ROOT LAYOUT                                             ║
   ╚══════════════════════════════════════════════════════════╝ */
.home-root {
  position: relative;
  min-height: 100vh;
  width: 100%;
  background-color: #0F172A;
  color: #F8FAFC;
  font-family: 'Inter', system-ui, sans-serif;
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
}

/* ╔══════════════════════════════════════════════════════════╗
   ║  ANIMATED BACKGROUND                                     ║
   ╚══════════════════════════════════════════════════════════╝ */
.bg-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

/* Floating gradient orbs */
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  mix-blend-mode: screen;
}

.orb-1 {
  width: 55vw;
  height: 55vw;
  top: -20%;
  left: -15%;
  background: radial-gradient(circle, rgba(255,123,0,0.18) 0%, transparent 70%);
  animation: floatOrb1 20s ease-in-out infinite;
}

.orb-2 {
  width: 50vw;
  height: 50vw;
  bottom: -25%;
  right: -15%;
  background: radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%);
  animation: floatOrb2 26s ease-in-out infinite;
}

.orb-3 {
  width: 35vw;
  height: 35vw;
  top: 30%;
  right: 25%;
  background: radial-gradient(circle, rgba(230,57,70,0.1) 0%, transparent 70%);
  animation: floatOrb3 18s ease-in-out infinite;
}

@keyframes floatOrb1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%       { transform: translate(4%, 6%) scale(1.05); }
  66%       { transform: translate(-3%, 3%) scale(0.97); }
}
@keyframes floatOrb2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  40%       { transform: translate(-5%, -4%) scale(1.08); }
  70%       { transform: translate(3%, -2%) scale(0.95); }
}
@keyframes floatOrb3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%       { transform: translate(6%, -8%) scale(1.1); }
}

/* Particle dots */
.particle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255,255,255,0.9);
  animation: particleDrift linear infinite;
}
@keyframes particleDrift {
  0%   { transform: translateY(0px) translateX(0px); opacity: var(--op, 0.1); }
  33%  { transform: translateY(-12px) translateX(6px); }
  66%  { transform: translateY(-6px) translateX(-8px); }
  100% { transform: translateY(0px) translateX(0px); opacity: var(--op, 0.1); }
}

/* Cyber grid */
.cyber-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
  background-size: 64px 64px;
  opacity: 0.7;
}

/* Watermark */
.watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) skewX(-10deg);
  font-size: clamp(6rem, 18vw, 16rem);
  font-weight: 900;
  font-style: italic;
  color: rgba(255,255,255,0.015);
  letter-spacing: -0.04em;
  white-space: nowrap;
  user-select: none;
}

/* ╔══════════════════════════════════════════════════════════╗
   ║  HEADER                                                  ║
   ╚══════════════════════════════════════════════════════════╝ */
.home-header {
  position: relative;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 3rem;
}

.logo-group {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  cursor: pointer;
  outline: none;
}
.logo-group:focus-visible { outline: 2px solid #FF7B00; border-radius: 4px; }

.logo-icon {
  width: 2.75rem;
  height: 2.75rem;
  color: #FF7B00;
  flex-shrink: 0;
}
.logo-icon svg { width: 100%; height: 100%; }

.logo-text { line-height: 1; }

.logo-name {
  display: block;
  font-size: 1.6rem;
  font-weight: 900;
  font-style: italic;
  letter-spacing: 0.12em;
  background: linear-gradient(135deg, #FF7B00, #E63946);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-sub {
  display: block;
  font-size: 0.55rem;
  color: #60A5FA;
  font-weight: 700;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  margin-top: 2px;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(15,23,42,0.6);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.08);
  padding: 0.5rem;
  border-radius: 12px;
}

.nav-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 8px;
  background: transparent;
  color: rgba(255,255,255,0.45);
  border: none;
  cursor: pointer;
  transition: color 0.2s ease, background 0.2s ease;
}
.nav-icon-btn:hover { color: #60A5FA; background: rgba(255,255,255,0.06); }
.nav-icon-btn svg { width: 1.2rem; height: 1.2rem; }

.nav-icon-btn--danger:hover { color: #E63946; background: rgba(230,57,70,0.08); }

/* ╔══════════════════════════════════════════════════════════╗
   ║  MAIN — 2-column grid                                    ║
   ╚══════════════════════════════════════════════════════════╝ */
.home-main {
  position: relative;
  z-index: 10;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2.5rem;
  align-items: center;
  padding: 1rem 3rem 2rem;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

/* ╔══════════════════════════════════════════════════════════╗
   ║  HERO SECTION (LEFT)                                     ║
   ╚══════════════════════════════════════════════════════════╝ */
.hero-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 640px;
}

/* Season badge */
.season-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 9999px;
  padding: 0.375rem 1rem;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #60A5FA;
  align-self: flex-start;
}
.season-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: #22C55E;
  animation: pulseDot 2s ease-in-out infinite;
}
@keyframes pulseDot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.75); }
}

/* Hero heading */
.hero-heading {
  font-size: clamp(4rem, 8vw, 7.5rem);
  font-weight: 900;
  font-style: italic;
  line-height: 0.88;
  letter-spacing: -0.03em;
  margin: 0;
}
.hero-heading--light {
  background: linear-gradient(180deg, #F8FAFC 0%, #6b7280 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-heading--red {
  color: #E63946;
  text-shadow: 0 0 40px rgba(230,57,70,0.35);
}

/* Hero sub-copy */
.hero-sub {
  color: #9ca3af;
  font-size: 0.875rem;
  line-height: 1.7;
  max-width: 440px;
  padding-left: 1rem;
  border-left: 2px solid #FF7B00;
  margin: 0;
}

/* ── PRIMARY CTA — Single Player ─────────────────────────────────────────── */
.cta-primary-wrap { display: flex; flex-direction: column; gap: 0.5rem; }

.cta-primary {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 380px;
  height: 72px;
  border: 1px solid rgba(255,123,0,0.35);
  background: rgba(15,23,42,0.9);
  cursor: pointer;
  overflow: hidden;
  clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px));
  transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1),
              box-shadow 0.35s ease,
              border-color 0.35s ease;
}
.cta-primary:hover:not(:disabled) {
  transform: scale(1.035) translateY(-2px);
  box-shadow: 0 0 40px rgba(230,57,70,0.55), 0 8px 24px rgba(0,0,0,0.4);
  border-color: rgba(230,57,70,0.7);
}
.cta-primary:active:not(:disabled) {
  transform: scale(0.97);
  box-shadow: 0 0 20px rgba(230,57,70,0.4);
}
.cta-primary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
.cta-primary:focus-visible {
  outline: 2px solid #FF7B00;
  outline-offset: 3px;
}

/* Gradient fill that slides in on hover */
.cta-primary__fill {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #FF7B00 0%, #E63946 100%);
  transform: translateX(-101%);
  transition: transform 0.45s cubic-bezier(0.22,1,0.36,1);
  z-index: 0;
}
.cta-primary:hover:not(:disabled) .cta-primary__fill { transform: translateX(0); }

/* Shimmer sweep */
.cta-primary__shimmer {
  position: absolute;
  top: 0;
  left: -80%;
  width: 60%;
  height: 100%;
  background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%);
  z-index: 2;
  pointer-events: none;
  transition: left 0s;
}
.cta-primary:hover:not(:disabled) .cta-primary__shimmer {
  animation: shimmerSweep 0.65s ease forwards;
  animation-delay: 0.15s;
}
@keyframes shimmerSweep {
  from { left: -80%; }
  to   { left: 160%; }
}

/* Content row */
.cta-primary__content {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 1.5rem;
  width: 100%;
}
.cta-primary__icon { display: flex; align-items: center; flex-shrink: 0; }
.cta-primary__icon svg { width: 1.5rem; height: 1.5rem; color: #FF7B00; transition: color 0.3s; }
.cta-primary:hover:not(:disabled) .cta-primary__icon svg { color: #fff; }

.cta-primary__label {
  flex: 1;
  font-size: 1rem;
  font-weight: 900;
  font-style: italic;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #d1d5db;
  transition: color 0.3s;
}
.cta-primary:hover:not(:disabled) .cta-primary__label { color: #fff; }

.cta-primary__arrow {
  font-size: 1.25rem;
  color: #E63946;
  transition: color 0.3s, transform 0.3s;
}
.cta-primary:hover:not(:disabled) .cta-primary__arrow {
  color: #fff;
  transform: translateX(4px);
}

.cta-searching-hint {
  font-size: 0.68rem;
  color: #FFA62B;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  animation: pulseDot 1.2s ease-in-out infinite;
  margin: 0;
}

/* ── SECONDARY CTA — 1v1 Match ────────────────────────────────────────────── */
.cta-secondary {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  max-width: 380px;
  height: 56px;
  padding: 0 1.5rem;
  background: rgba(59,130,246,0.06);
  border: 1px solid rgba(59,130,246,0.35);
  border-radius: 10px;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1),
              box-shadow 0.35s ease,
              background 0.3s ease,
              border-color 0.3s ease;
}
.cta-secondary:hover:not(:disabled) {
  transform: scale(1.025) translateY(-2px);
  box-shadow: 0 0 30px rgba(59,130,246,0.45), 0 6px 20px rgba(0,0,0,0.3);
  background: rgba(59,130,246,0.12);
  border-color: rgba(96,165,250,0.7);
}
.cta-secondary:active:not(:disabled) {
  transform: scale(0.97);
}
.cta-secondary:disabled { opacity: 0.6; cursor: not-allowed; }
.cta-secondary:focus-visible { outline: 2px solid #60A5FA; outline-offset: 3px; }

.cta-secondary__icon { display: flex; align-items: center; color: #60A5FA; flex-shrink: 0; }
.cta-secondary__icon svg { width: 1.2rem; height: 1.2rem; }

.cta-secondary__label {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #93c5fd;
  text-align: left;
}

.cta-secondary__badge {
  font-size: 0.55rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  color: #60A5FA;
  border: 1px solid rgba(96,165,250,0.4);
  border-radius: 4px;
  padding: 0.2rem 0.45rem;
  text-transform: uppercase;
}

/* ── Spinning icon (loading) ────────────────────────────────────────────── */
.spin-icon { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── TERTIARY grid ─────────────────────────────────────────────────────── */
.tertiary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.625rem;
  max-width: 380px;
}

.tertiary-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 44px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: rgba(255,255,255,0.6);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.25s ease;
}
.tertiary-btn:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(96,165,250,0.4);
  color: #60A5FA;
  box-shadow: 0 0 16px rgba(59,130,246,0.2);
}
.tertiary-btn:active { transform: scale(0.96); }
.tertiary-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.tertiary-btn svg { width: 0.9rem; height: 0.9rem; }

/* Join code row spans both columns */
.join-code-wrap {
  grid-column: 1 / -1;
  display: flex;
  height: 44px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}
.join-code-wrap:focus-within {
  border-color: rgba(96,165,250,0.5);
  box-shadow: 0 0 16px rgba(59,130,246,0.2);
}
.join-code-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #F8FAFC;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 0 1rem;
}
.join-code-input::placeholder { color: rgba(255,255,255,0.25); }
.join-code-btn {
  padding: 0 1rem;
  background: transparent;
  border: none;
  border-left: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.5);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
}
.join-code-btn:hover:not(:disabled) { color: #60A5FA; background: rgba(59,130,246,0.08); }
.join-code-btn:disabled { opacity: 0.35; cursor: not-allowed; }

/* ╔══════════════════════════════════════════════════════════╗
   ║  STATS PANEL (RIGHT)                                     ║
   ╚══════════════════════════════════════════════════════════╝ */
.stats-panel {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Glass card */
.glass-card {
  background: rgba(255,255,255,0.03);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 20px;
  box-shadow:
    0 8px 32px rgba(0,0,0,0.4),
    0 0 0 1px rgba(255,255,255,0.03) inset;
  padding: 1.75rem;
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Card header label */
.profile-card__label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
}
.profile-card__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22C55E;
  animation: pulseDot 2s ease-in-out infinite;
}

/* Avatar */
.profile-avatar-wrap {
  position: relative;
  width: 88px;
  height: 88px;
  margin: 0 auto;
  cursor: pointer;
}
.profile-avatar-wrap:focus-visible { outline: 2px solid #FF7B00; border-radius: 50%; }

.profile-avatar-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #FF7B00, #E63946, #3B82F6, #FF7B00);
  animation: spinRing 6s linear infinite;
  z-index: 0;
}
@keyframes spinRing {
  to { transform: rotate(360deg); }
}

.profile-avatar-img-wrap {
  position: relative;
  width: 88px;
  height: 88px;
  border-radius: 50%;
  overflow: hidden;
  background: #0F172A;
  z-index: 1;
  border: 3px solid #0F172A;
}
.profile-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Edit hint overlay */
.profile-avatar-edit-hint {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0,0,0,0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: white;
  opacity: 0;
  z-index: 2;
  transition: opacity 0.2s;
}
.profile-avatar-edit-hint svg { width: 1.1rem; height: 1.1rem; }
.profile-avatar-wrap:hover .profile-avatar-edit-hint { opacity: 1; }

/* Identity */
.profile-identity {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}
.profile-username {
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: #F8FAFC;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.profile-rank-badge {
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  flex-shrink: 0;
}
/* Rank tier colours */
.rank-diamond { background: rgba(147,197,253,0.12); color: #93c5fd; border: 1px solid rgba(147,197,253,0.3); }
.rank-gold    { background: rgba(255,123,0,0.12);   color: #FFA62B; border: 1px solid rgba(255,123,0,0.3); }
.rank-silver  { background: rgba(209,213,219,0.1);  color: #d1d5db; border: 1px solid rgba(209,213,219,0.25); }
.rank-bronze  { background: rgba(180,83,9,0.12);    color: #d97706; border: 1px solid rgba(180,83,9,0.3); }
.rank-unranked{ background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.4); border: 1px solid rgba(255,255,255,0.1); }

/* ELO section */
.elo-section { display: flex; flex-direction: column; gap: 0.4rem; }
.elo-section__header { display: flex; justify-content: space-between; align-items: center; }
.elo-section__label { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.35); }
.elo-section__value { font-size: 1rem; font-weight: 900; color: #FF7B00; font-variant-numeric: tabular-nums; }

.elo-bar {
  height: 6px;
  background: rgba(255,255,255,0.06);
  border-radius: 9999px;
  overflow: hidden;
}
.elo-bar__fill {
  height: 100%;
  background: linear-gradient(90deg, #FF7B00, #E63946);
  border-radius: 9999px;
  transition: width 1s cubic-bezier(0.22,1,0.36,1);
  box-shadow: 0 0 8px rgba(255,123,0,0.5);
}

.elo-tier-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.55rem;
  color: rgba(255,255,255,0.2);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-weight: 600;
}

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.625rem;
}

.stat-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px;
  padding: 0.875rem 0.5rem;
  transition: background 0.2s, border-color 0.2s;
}
.stat-chip:hover { background: rgba(255,255,255,0.07); }

.stat-chip__label {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
}
.stat-chip__value {
  font-size: 1.35rem;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
}

.stat-chip--wins   .stat-chip__value { color: #22C55E; }
.stat-chip--losses .stat-chip__value { color: #E63946; }
.stat-chip--matches .stat-chip__value { color: #F8FAFC; }
.stat-chip--wr     .stat-chip__value { color: #60A5FA; }

/* Profile link button */
.profile-link-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  height: 42px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  color: rgba(255,255,255,0.55);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.25s ease;
}
.profile-link-btn:hover {
  background: rgba(255,123,0,0.07);
  border-color: rgba(255,123,0,0.35);
  color: #FF7B00;
}
.profile-link-btn svg { width: 0.9rem; height: 0.9rem; }

/* ╔══════════════════════════════════════════════════════════╗
   ║  FOOTER BAR                                              ║
   ╚══════════════════════════════════════════════════════════╝ */
.home-footer-bar {
  position: relative;
  z-index: 20;
  height: 3px;
  width: 100%;
  display: flex;
  align-items: stretch;
}
.home-footer-bar__accent-1 {
  flex: 1;
  background: linear-gradient(90deg, #FF7B00, #E63946);
}
.home-footer-bar__dot {
  width: 3px;
  background: rgba(255,255,255,0.15);
  margin: 0 2px;
}
.home-footer-bar__accent-2 {
  width: 60px;
  background: #3B82F6;
}

/* ╔══════════════════════════════════════════════════════════╗
   ║  RESPONSIVE                                              ║
   ╚══════════════════════════════════════════════════════════╝ */
@media (max-width: 1100px) {
  .home-main {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    padding: 1rem 2rem 2rem;
    gap: 2rem;
  }
  .hero-section { max-width: 100%; align-items: center; text-align: center; }
  .hero-sub { text-align: left; }
  .cta-primary, .cta-secondary { max-width: 480px; }
  .tertiary-grid { max-width: 480px; }
  .stats-panel { order: -1; }
  .glass-card { max-width: 480px; }
}

@media (max-width: 768px) {
  .home-header { padding: 1.25rem 1.25rem; }
  .home-main { padding: 0.5rem 1.25rem 1.5rem; }
  .hero-heading { font-size: clamp(3rem, 14vw, 5rem); }
  .tertiary-grid { grid-template-columns: 1fr; }
  .join-code-wrap { grid-column: auto; }
  .glass-card { max-width: 100%; }
}

@media (max-width: 480px) {
  .logo-text .logo-name { font-size: 1.25rem; }
  .hero-heading { font-size: clamp(2.5rem, 16vw, 4rem); }
  .cta-primary { height: 60px; }
  .cta-primary__label { font-size: 0.85rem; }
  .stats-grid { grid-template-columns: 1fr 1fr; }
}
</style>