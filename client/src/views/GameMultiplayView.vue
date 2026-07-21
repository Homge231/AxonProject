<template>
  <div
    class="h-screen w-full overflow-hidden relative font-sans flex flex-col select-none text-white transition-all duration-75"
    :class="{
      'exodia-shake': showMissionCelebration && isExodia
    }" @click="refocusInput">
    <PhaserBackground :vfx-enabled="settingsStore.vfxEnabled" :image-url="currentBgImage"
      class="transition-opacity duration-500 ease-in-out"
      :class="{ 'opacity-0': isBgFading, 'opacity-100': !isBgFading }" />

    <div class="absolute inset-0 bg-black/45 pointer-events-none z-0"></div>

    <div class="absolute inset-0 cyber-grid opacity-20 pointer-events-none z-0"></div>

    <OpponentWidget 
      :visible="isMultiplayer" 
      :name="opponentName" 
      :avatar="opponentAvatar" 
      :score="opponentScore" 
    />

    <!-- Dice Roll Shift Overlay  -->
    <transition name="fade">
      <div v-if="isShifting"
        class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
        <svg class="w-28 h-28 text-white animate-spin-fast drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] mb-6"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke-width="2" />
          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
          <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor" />
          <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor" />
        </svg>
        <p class="text-2xl font-black uppercase tracking-widest text-white animate-pulse">
          Rolling Core...
        </p>
      </div>
    </transition>
    <!-- Prismatic Screen Flash -->
    <div v-if="showPrismaticFlash && settingsStore.vfxEnabled"
      class="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-cyan-500/20 to-yellow-500/20 pointer-events-none z-10 mix-blend-screen animate-pulse">
    </div>



    <!-- Floating points popup container -->
    <div class="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      <transition-group name="float-pts" tag="div">
        <!-- Point Popups -->
        <div v-for="popup in pointPopups" :key="popup.id"
          class="fixed pointer-events-none z-[100] font-black uppercase tracking-wider transition-all" :class="[
            popup.type === 'speedster' ? 'speedster-popup' :
              popup.type === 'prismatic' ? 'prismatic-explosion' : 'point-popup-anim',
            popup.type === 'typo' ? (settingsStore.vfxEnabled ? 'text-orange drop-shadow-[0_0_10px_rgba(255,165,0,0.8)]' : 'text-orange') :
              popup.type === 'wrong' ? (settingsStore.vfxEnabled ? 'text-hexred drop-shadow-[0_0_10px_rgba(230,57,70,0.8)]' : 'text-hexred') :
                popup.type === 'speedster' ? (settingsStore.vfxEnabled ? 'speedster-fast-text' : 'text-cyan-400') :
                  popup.type === 'shield_blocked' ? (settingsStore.vfxEnabled ? 'text-gray-300 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'text-gray-300') :
                    popup.type === 'prismatic' ? '' :
                      (settingsStore.vfxEnabled ? 'text-success drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'text-success')
          ]" :style="{
            left: `${popup.x}px`,
            top: `${popup.y}px`
          }">
          {{ popup.type === 'shield_blocked' ? 'BLOCKED' : (popup.type === 'wrong' || popup.type === 'typo' ?
            `-${Math.abs(popup.value)}` : `+${Math.abs(popup.value)}`) }}
          <span v-if="popup.type === 'speedster'" class="ml-1">FAST!</span>
          <span v-if="popup.type === 'prismatic'" class="ml-1">BOOM! 💥</span>
        </div>
      </transition-group>
    </div>

    <!-- Tutorial CoachMark -->
    <CoachMark v-if="tutorial.isCurrentScreen('gameplay') || tutorial.isCurrentScreen('match-end')"
      :targetId="tutorial.currentStepData.value?.targetId || ''"
      :message="tutorial.currentStepData.value?.message || ''" :title="tutorial.currentStepData.value?.title"
      :icon="tutorial.currentStepData.value?.icon" :step="tutorial.currentStepNumber.value"
      :totalSteps="tutorial.totalSteps" :keyHints="tutorial.currentStepData.value?.keyHints"
      :placement="tutorial.currentStepData.value?.placement" @next="tutorial.next" @skip="tutorial.complete" />

    <!-- Pandora overlays: shift announcements and indicator -->
    <PandoraOverlay :is-pandora-mode="isPandoraMode" :active-core-name="activeCoreNameDynamic"
      :shift-announcement="shiftAnnouncement" />

    <header v-show="gameState !== 'upgrade'"
      class="relative z-30 flex justify-between items-center px-8 lg:px-12 py-5 bg-darkNavy/30 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div class="relative" ref="menuRef">
        <button @click.stop="menuOpen = !menuOpen"
          class="flex items-center gap-3 focus:outline-none hover:opacity-80 transition-opacity">
          <svg class="w-8 h-8 text-orange fill-current" viewBox="0 0 24 24">
            <path d="M7 3 L7 21 L12 21 L12 9 L17 21 L17 3 L12 3 L12 15 L7 3 Z" />
          </svg>
          <span
            class="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange to-hexred uppercase drop-shadow-md">
            NAENRA
          </span>
          <svg class="w-4 h-4 text-gray-300 transition-transform duration-200" :class="menuOpen ? 'rotate-180' : ''"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <transition name="dropdown">
          <div v-if="menuOpen"
            class="absolute top-full left-0 mt-3 w-56 bg-darkNavy/90 backdrop-blur-xl border border-white/10 shadow-2xl z-50 rounded-b-lg overflow-hidden">
            <div class="px-5 py-3 border-b border-white/10 bg-black/20">
              <p class="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Match in progress</p>
              <p class="text-sm text-gray-200 font-mono mt-1">Score: <span class="text-white font-bold">{{ score
              }}</span>
              </p>
            </div>
            <button @click.stop="goHome"
              class="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors text-left">
              <svg class="w-4 h-4 text-orange flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Back to Home
            </button>
            <button @click.stop="confirmQuit = true; menuOpen = false"
              class="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-hexred hover:bg-hexred/10 transition-colors text-left">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Quit Match
            </button>
            <button
              v-if="!matchStore.isFinalRound() && (gameState === 'playing' || gameState === 'correct' || gameState === 'wrong')"
              @click.stop="skipGameplay"
              class="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-yellow-400 hover:bg-yellow-400/10 transition-colors text-left border-t border-white/10">
              <svg class="w-4 h-4 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
              Skip to Core Selection
            </button>
            <button v-if="isDev" @click.stop="debugSkipRound"
              class="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-yellow-400 hover:bg-yellow-400/10 transition-colors text-left border-t border-white/10">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
              Debug: Skip Round
            </button>
          </div>
        </transition>

      </div>

      <!-- Active Core History Badges in Center -->
      <div v-if="gameStore.coreHistory.length > 0" class="hidden md:flex flex-row items-center gap-2">
        <div v-for="(core, index) in gameStore.coreHistory" :key="`${core.id}-${index}`"
          class="flex flex-col items-center px-4 py-1.5 rounded-lg bg-black/20 shadow-md backdrop-blur-md transition-all duration-300"
          :class="[
            index === gameStore.coreHistory.length - 1 ? 'border border-white/20 opacity-100 scale-105' : 'border border-white/5 opacity-60 scale-95'
          ]">
          <span class="text-[8px] font-bold uppercase tracking-wider mb-0.5"
            :class="[index === gameStore.coreHistory.length - 1 ? 'text-gray-300' : 'text-gray-500']">
            {{ index === gameStore.coreHistory.length - 1 && isPandoraMode ? basePandoraCoreName : `Round ${index + 1}`
            }}
          </span>
          <span class="text-xs font-black uppercase tracking-widest flex items-center gap-1 shadow-sm"
            :class="[index === gameStore.coreHistory.length - 1 ? (activeCoreModule.timerColor || 'text-lightBlue') : 'text-gray-400']">
            <span>
              <img
                :src="(index === gameStore.coreHistory.length - 1 && isPandoraMode) ? activeCoreIconUrlDynamic : core.icon"
                :alt="core.name" class="w-4 h-4 inline-block object-contain" />
            </span> {{ (index === gameStore.coreHistory.length - 1 && isPandoraMode) ? 'Shifted: ' +
              activeCoreNameDynamic : core.name }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-8">
        <!-- Sound Toggle removed -->

        <div id="tutorial-score-area"
          class="flex items-center gap-3 bg-black/30 backdrop-blur-md border border-white/10 px-5 py-2 rounded-lg shadow-inner">
          <span class="text-xs font-bold text-orange tracking-[0.2em] uppercase">Score</span>
          <span class="text-xl font-black text-white tabular-nums">{{ score }}</span>
        </div>

        <div
          class="flex items-center gap-3 bg-black/30 backdrop-blur-md border border-white/10 px-5 py-2 rounded-lg shadow-inner">
          <span class="text-xs font-bold text-lightBlue tracking-[0.2em] uppercase">Q</span>
          <span class="text-xl font-black text-white">{{ questionsAnswered }}</span>
        </div>

        <div class="relative flex items-center gap-2"
          :class="timeLeft <= 10 ? 'text-hexred' : activeCoreModule.timerColor">
          <svg class="w-5 h-5 drop-shadow-md" :class="activeCoreModule.timerIconClass || undefined" fill="none"
            stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="font-mono font-black text-3xl tabular-nums drop-shadow-lg" :class="[
            activeCoreModule?.timerColor,
            timeLeft <= 10 && settingsStore.vfxEnabled ? 'animate-pulse' : '',
            settingsStore.vfxEnabled ? (activeCoreModule?.timerClass || '') : ''
          ]">
            {{ String(timeLeft ?? 0).padStart(2, '0') }}
          </span>
          <!-- Round Indicator Preparation -->
          <div class="absolute -bottom-6 w-full text-center whitespace-nowrap">
            <span id="tutorial-round-indicator"
              class="text-[9px] font-bold text-gray-500 uppercase tracking-widest bg-darkBlue/50 px-2 py-0.5 rounded-full border border-white/5">
              Round {{ matchStore.currentRound }}/{{ matchStore.maxRounds }}
            </span>
          </div>
        </div>
      </div>
    </header>

    <!-- Upgrade Selection Phase (Overlay on top of game board) -->
    <!-- Moved out of the header's .relative wrapper: that wrapper is a descendant of a
         backdrop-blur element, which creates a new containing block for `position: fixed`
         children. That squashed this overlay's fixed inset-0 into the header's ~80px box
         instead of the full viewport. Living as a direct sibling of header/main fixes it. -->
    <transition name="fade">
      <CoreUpgradeOverlay v-if="gameState === 'upgrade'" @selected="handleUpgradeSelected" />
    </transition>

    <main v-show="gameState !== 'upgrade'"
      class="relative z-20 flex-1 flex flex-col items-center justify-center py-10 px-6 lg:px-16 max-w-5xl mx-auto w-full">

      <!-- Speedster wind streak overlay component -->
      <SpeedsterOverlay :active="!!activeCoreModule.showWindOverlay && settingsStore.vfxEnabled"
        :playing="gameState === 'playing'" />

      <section class="w-full max-w-4xl flex flex-col gap-10" style="perspective: 1500px;">

        <div v-if="gameState === 'loading'" class="w-full flex flex-col gap-10">
          <div class="bg-blue/10 backdrop-blur-xl border border-blue/20 rounded-2xl p-6 h-28 animate-pulse"></div>
          <div class="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-14 h-44 animate-pulse"></div>
        </div>

        <template v-else>
          <transition name="card-flip" mode="out-in">
            <div :key="currentQuestion.id" class="w-full flex flex-col items-center gap-10">
              <!-- Top-half container for Hint and Question Text -->
              <div class="w-full flex flex-col gap-6">
                <div v-if="currentQuestion.hint"
                  class="relative overflow-hidden bg-blue/10 backdrop-blur-xl border border-blue/30 rounded-2xl p-6 md:p-8 shadow-[0_10px_30px_rgba(59,130,246,0.15)] text-center w-full transition-all duration-300 transform hover:-translate-y-1">
                  <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue to-transparent">
                  </div>
                  <div class="flex items-center justify-center gap-1.5 mb-3 opacity-90">
                    <svg class="w-4 h-4 text-lightBlue drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                    </svg>
                    <span class="text-[10px] font-bold text-lightBlue tracking-[0.25em] uppercase">Hint</span>
                  </div>
                  <h1
                    class="text-2xl md:text-4xl font-black text-lightBlue tracking-wider drop-shadow-lg leading-tight break-words px-2 py-1">
                    {{ currentQuestion.hint }}
                  </h1>
                </div>

                <!-- Oracle: Click-to-reveal hint button (only for Oracle core) -->
                <OracleCoreIndicator v-if="isOracleCore && gameState === 'playing'"
                  :oracle-reveal-level="oracleRevealLevel" :oracle-max-allowed="oracleMaxAllowed"
                  :oracle-hint-text="oracleHintText" :oracle-next-cost="oracleNextCost" @use-hint="useOracleHint" />

                <div
                  class="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col items-center text-center w-full transition-all duration-300 transform-gpu"
                  :class="{ 'burning-edge-active': isBurningComboActive }">
                  <p class="text-xl md:text-3xl font-medium text-gray-200 leading-relaxed max-w-3xl">
                    <span v-if="currentQuestion?.question_text?.split(/_+/)[0]">
                      {{ currentQuestion.question_text?.split(/_+/)[0] }}
                    </span>
                    <span class="text-white/50 font-bold mx-2 tracking-widest">---</span>
                    <span v-if="currentQuestion?.question_text?.split(/_+/)[1]">
                      {{ currentQuestion.question_text?.split(/_+/)[1] }}
                    </span>
                  </p>
                </div>
              </div>

              <!-- Letter slots (anchor for popup position) -->
              <div id="tutorial-typing-area" class="w-full flex flex-col items-center gap-3 overflow-hidden"
                ref="letterSlotsRef">


                <div
                  class="flex flex-nowrap items-center justify-center gap-2 md:gap-3 w-full overflow-x-auto pb-3 scrollbar-none"
                  :class="{ 'speedster-slots-glow': isSpeedsterCore && gameState === 'playing' }">
                  <div v-for="(_, idx) in currentQuestion.target_length" :key="idx" class="flex-shrink-0">
                    <div
                      class="relative w-10 h-14 md:w-14 md:h-20 bg-black/60 rounded-t-lg flex items-center justify-center border-b-4 transition-colors duration-200"
                      :class="{
                        'slot--active border-orange bg-black/60 shadow-[0_-4px_15px_rgba(255,165,0,0.25)]': idx === typedLetters.length && gameState === 'playing',
                        'slot--correct border-success': gameState === 'correct',
                        'slot--wrong border-hexred': gameState === 'wrong',
                        'border-white/20': idx !== typedLetters.length || gameState !== 'playing'
                      }">
                      <span
                        class="text-2xl md:text-4xl font-black uppercase tracking-widest drop-shadow-md transition-all duration-100"
                        :class="{
                          'text-white': typedLetters[idx] !== undefined && gameState === 'playing',
                          'glow-sweep': gameState === 'correct',
                          'text-hexred drop-shadow-[0_0_10px_rgba(230,57,70,0.6)]': gameState === 'wrong',
                          'opacity-0': typedLetters[idx] === undefined,
                          'opacity-100': typedLetters[idx] !== undefined,
                        }" :style="gameState === 'correct' ? { animationDelay: `${idx * 0.05}s` } : {}">
                        {{ typedLetters[idx] ?? '_' }}
                      </span>
                      <span v-if="idx === typedLetters.length && gameState === 'playing'"
                        class="absolute bottom-2 left-1/2 -translate-x-1/2 w-5 h-1 bg-orange animate-pulse rounded-full"></span>
                    </div>
                  </div>
                </div>

                <div v-if="gameState === 'playing'"
                  class="text-xs md:text-sm font-semibold text-lightBlue/80 tracking-widest font-mono mt-1">
                  ({{ currentQuestion.target_length }} letters)
                </div>
              </div>

              <transition name="fade">
                <div v-if="gameState === 'correct' || gameState === 'wrong'"
                  class="relative z-10 flex items-center gap-3 px-8 py-3.5 border font-bold text-sm tracking-widest uppercase rounded-full shadow-2xl mx-auto w-fit backdrop-blur-lg"
                  :class="{
                    'border-success/50 bg-success/20 text-green-300': gameState === 'correct',
                    'border-hexred/50 bg-hexred/20 text-red-300': gameState === 'wrong',
                  }">
                  <span v-if="gameState === 'correct'">★ Brilliant! +{{ pointsEarned }} pts</span>
                  <span v-else>
                    <span v-if="currentQuestion.correct_word">
                      ✗ Correct word:
                      <span class="uppercase text-white ml-1 font-black">{{ currentQuestion.correct_word }}</span>
                      <span class="ml-3 text-hexred font-black">-{{ pointsDeducted }} pts</span>
                    </span>
                    <span v-else class="animate-pulse">
                      ✗ Checking...
                    </span>
                  </span>
                </div>
              </transition>

            </div>
          </transition>
        </template>

      </section>
    </main>

    <!-- Timer progress bar -->
    <div v-show="gameState !== 'upgrade'" class="relative z-20 h-2 w-full flex bg-black/50">
      <div class="h-full rounded-r-full shadow-[0_0_10px_rgba(255,165,0,0.8)]" :class="[
        timeLeft <= 10 ? 'bg-hexred shadow-[0_0_15px_rgba(230,57,70,0.8)]' : 'bg-gradient-to-r from-blue to-lightBlue'
      ]" :style="{ width: `${tutorial.isCurrentScreen('gameplay') ? 0 : timerProgressPercent}%` }">
      </div>
    </div>

    <!-- Right-Side Indicators Container -->
    <div class="absolute top-52 right-8 z-20 flex flex-col items-end gap-4 transition-all duration-300">

      <!-- Combo indicator: only visible when active core is the Combo Core -->
      <transition name="fade-scale">
        <div v-if="isComboCore">
          <ComboCoreIndicator :current-combo="currentCombo" />
        </div>
      </transition>

      <!-- Aegis Shield Mode Indicator -->
      <transition name="fade-scale">
        <div v-if="isAegisMode">
          <AegisShieldIndicator :count="aegisShieldCount" :shattering="isShattering" :max-shields="maxShields" />
        </div>
      </transition>

    </div>

    <!-- Mission Tracker UI: only visible when active core is the Mission Core -->
    <transition name="fade-scale">
      <div v-if="isMissionCore" class="absolute top-28 left-8 z-20 flex transition-all duration-300">
        <MissionCoreIndicator :mission-progress="missionProgress" :show-celebration="showMissionCelebration" />
      </div>
    </transition>

    <!-- Player Avatar -->

    <Avatar :src="playerAvatarUrl" alt="Player Avatar" />



    <transition name="timeout-overlay">
      <div v-if="gameState === 'timeout'" class="absolute inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-darkNavy/80 backdrop-blur-xl"></div>
        <div id="tutorial-match-result"
          class="relative border border-hexred/50 bg-darkNavy/90 p-12 max-w-2xl w-full mx-4 text-center timeout-panel rounded-2xl shadow-[0_0_50px_rgba(230,57,70,0.2)] flex flex-col max-h-[90vh]">
          <p class="text-xs font-bold text-hexred tracking-[0.4em] uppercase mb-4 drop-shadow-md">
            {{ matchStore.isFinalRound() ? 'Match Ended' : 'Round Ended' }}
          </p>
          <h2
            class="text-7xl font-black italic tracking-tighter text-white drop-shadow-[0_0_30px_rgba(230,57,70,0.8)] mb-2 timeout-glitch">
            TIME OUT
          </h2>
          <div class="w-20 h-1 bg-gradient-to-r from-transparent via-hexred to-transparent mx-auto mb-10 mt-6"></div>

          <div
            v-if="isMultiplayer"
            class="grid grid-cols-3 divide-x divide-white/10 mb-6 bg-black/30 py-4 rounded-xl border border-white/5 flex-shrink-0"
          >
            <div>
              <p class="text-[10px] text-orange uppercase tracking-widest mb-1 font-bold">Your Score</p>
              <p class="text-4xl font-black text-white drop-shadow-md">{{ score }}</p>
            </div>
            <div>
              <p class="text-[10px] text-lightBlue uppercase tracking-widest mb-1 font-bold">Opponent</p>
              <p class="text-4xl font-black text-white drop-shadow-md">{{ opponentScore }}</p>
            </div>
            <div>
              <p class="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Questions</p>
              <p class="text-4xl font-black text-gray-300 drop-shadow-md">{{ questionsAnswered }}</p>
            </div>
          </div>
          <div
            v-else
            class="grid grid-cols-2 divide-x divide-white/10 mb-6 bg-black/30 py-4 rounded-xl border border-white/5 flex-shrink-0"
          >
            <div>
              <p class="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Final Score</p>
              <p class="text-4xl font-black text-orange drop-shadow-md">{{ score }}</p>
            </div>
            <div>
              <p class="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Questions</p>
              <p class="text-4xl font-black text-lightBlue drop-shadow-md">{{ questionsAnswered }}</p>
            </div>
          </div>

          <!-- Recap Table -->
          <div v-if="matchHistory.length > 0"
            class="mb-6 bg-black/40 border border-white/10 rounded-xl overflow-hidden flex-1 overflow-y-auto custom-scrollbar">
            <table class="w-full text-left text-sm text-gray-300">
              <thead class="bg-black/60 text-xs uppercase text-gray-500 sticky top-0 z-10">
                <tr>
                  <th class="px-6 py-4 font-bold tracking-widest">Your Answer</th>
                  <th class="px-6 py-4 font-bold tracking-widest border-l border-white/5">Correct Answer</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <template v-for="(group, roundNum) in groupedMatchHistory" :key="roundNum">
                  <tr>
                    <td colspan="2"
                      class="px-6 py-2 font-bold text-xs text-white/50 bg-black/80 uppercase tracking-widest border-b border-white/10">
                      Round {{ roundNum }}
                    </td>
                  </tr>
                  <tr v-for="(item, idx) in group" :key="`${roundNum}-${idx}`"
                    class="hover:bg-white/5 transition-colors">
                    <td class="px-6 py-3 font-medium uppercase tracking-wider"
                      :class="item.isCorrect ? 'text-green bg-green/10' : 'text-hexred bg-hexred/10'">
                      {{ item.submitted }}
                    </td>
                    <td class="px-6 py-3 font-medium text-white uppercase tracking-wider border-l border-white/5">
                      {{ item.correct }}
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>

          <p v-if="savingSession" class="text-xs text-gray-400 uppercase tracking-widest mb-6 flex-shrink-0"
            :class="{ 'animate-pulse': settingsStore.vfxEnabled }">
            <span class="inline-block w-2 h-2 bg-lightBlue rounded-full mr-2"></span>
            Syncing results...
          </p>

          <div class="flex gap-4 justify-center flex-shrink-0 mt-6">
            <button v-if="!isMultiplayer" @click="router.push('/home')"
              class="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-bold text-sm tracking-widest uppercase transition-colors rounded-lg">Home</button>

            <!-- Next Round (Rounds 1 & 2) -->
            <button v-if="!matchStore.isFinalRound()" 
              :disabled="waitingForOpponent"
              @click="goToUpgrade"
              class="flex-1 group relative px-6 py-4 bg-gradient-to-r from-orange to-hexred overflow-hidden font-black text-sm tracking-widest uppercase rounded-lg shadow-lg hover:shadow-[0_0_20px_rgba(230,57,70,0.5)] transition-shadow disabled:opacity-50 disabled:cursor-not-allowed">
              <div
                class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              </div>
              <span class="relative z-10 text-white">
                {{ waitingForOpponent ? 'Waiting for opponent...' : `Next Round (${timeoutCountdown}s)` }}
              </span>
            </button>

            <!-- Play Again & Feedback (Round 3) -->
            <template v-else>
              <!-- Nút Feedback mới thêm -->
              <button @click="showFeedback = true"
                class="flex-1 group relative px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 overflow-hidden font-black text-sm tracking-widest uppercase rounded-lg shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-shadow">
                <div
                  class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                </div>
                <span class="relative z-10 text-white">Feedback</span>
              </button>

              <!-- Nút Play Again giữ nguyên -->
              <button @click="playAgain"
                class="flex-1 group relative px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 overflow-hidden font-black text-sm tracking-widest uppercase rounded-lg shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-shadow">
                <div
                  class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                </div>
                <span class="relative z-10 text-white">Play Again</span>
              </button>
            </template>
          </div>
        </div>
      </div>
    </transition>

    <transition name="overlay">
      <div v-if="confirmQuit"
        class="absolute inset-0 z-50 flex items-center justify-center bg-darkNavy/90 backdrop-blur-md">
        <div
          class="relative border border-white/10 bg-darkNavy/95 p-10 rounded-2xl shadow-2xl max-w-sm w-full mx-4 text-center">
          <div class="w-16 h-16 bg-hexred/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-8 h-8 text-hexred" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p class="text-xl text-white font-black uppercase mb-2">Abandon Match?</p>
          <p class="text-gray-400 text-sm mb-8 leading-relaxed">Your current progress and score of <span
              class="text-orange font-bold">{{ score }} pts</span> will be completely lost.</p>
          <div class="flex gap-3">
            <button @click="confirmQuit = false; refocusInput()"
              class="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-bold text-xs tracking-widest uppercase transition-colors rounded-lg">Resume</button>
            <button @click="goHome"
              class="flex-1 px-4 py-3 bg-hexred hover:bg-red-600 text-white font-bold text-xs tracking-widest uppercase transition-colors rounded-lg shadow-lg">Quit</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Waiting for opponent next round overlay -->
    <transition name="fade">
      <div v-if="isWaitingForNextRound" class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md">
        <svg class="w-16 h-16 text-lightBlue animate-spin mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-xl font-black uppercase tracking-widest text-lightBlue animate-pulse">Waiting for opponent to choose upgrade...</p>
      </div>
    </transition>

    <!-- US-24: input is disabled during the 15s timeout phase AND in the final timeout state -->
    <input ref="inputRef" class="sr-only" type="text" autocomplete="off" autocorrect="off" autocapitalize="off"
      spellcheck="false" :disabled="gameState === 'timeout' || tutorial.isCurrentScreen('gameplay')"
      @keydown="handleKeydown" />
    <FeedbackOverlay :is-visible="showFeedback" @close="showFeedback = false" @success="handleFeedbackSuccess" />

    <!-- Opponent Toast Notifications Stack -->
    <div class="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-2 pointer-events-none">
      <transition-group name="toast-slide">
        <div v-for="toast in toasts" :key="toast.id" 
             class="bg-darkNavy/90 border border-white/10 shadow-lg rounded-lg px-4 py-3 flex items-center gap-3 backdrop-blur-sm min-w-[200px]">
          <span class="text-xl">{{ toast.icon }}</span>
          <span class="text-sm font-bold tracking-widest uppercase" :class="toast.color">
            {{ toast.message }}
          </span>
        </div>
      </transition-group>
    </div>

  </div>

</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useScoreAnimation } from '../composables/game/useScoreAnimation'
import { useMatchTimer } from '../composables/game/useMatchTimer'
import { useQuestionQueue } from '../composables/game/useQuestionQueue'
import { currentRoom, leaveMatchRoom } from '../services/multiplayerService'
import OpponentWidget from '../components/game/OpponentWidget.vue'
import AegisShieldIndicator from '../components/game/AegisShieldIndicator.vue'
import ComboCoreIndicator from '../components/game/ComboCoreIndicator.vue'
import MissionCoreIndicator from '../components/game/MissionCoreIndicator.vue'
import CoreUpgradeOverlay from '../components/game/CoreUpgradeOverlay.vue'
import OracleCoreIndicator from '../components/game/OracleCoreIndicator.vue'
import FeedbackOverlay from '../components/game/FeedbackOverlay.vue'
import PhaserBackground from '../components/game/PhaserBackground.vue'
import Avatar from '../components/Avatar.vue'
import SpeedsterOverlay from '../components/game/SpeedsterOverlay.vue'
import PandoraOverlay from '../components/game/PandoraOverlay.vue'
import CoachMark from '../components/tutorial/CoachMark.vue'
import { useTutorial } from '../composables/useTutorial'
import { useGameStore } from '../stores/gameStore'
import { getCoreFamily } from '../game/cores/families'
import { useMatchStore } from '../stores/matchStore'
import {
  initAudio, 
  playKeystroke, 
  playComboTone, 
  playComboBreak, 
  playFireBurst,
  playJackpot,
  playShieldGain,
  playShieldBreak,
  playSpeedWhoosh,
  playPandoraWarp,
  playPandoraTransform,
  playOracleHint
} from '../composables/game/useAudioEngine'
import {
  getCoreModule,
  isComboCore as checkComboCore,
  isOracleCore as checkOracleCore,
  isSpeedsterCore as checkSpeedsterCore,
  isMissionCore as checkMissionCore,
  isAegisCore as checkAegisCore,
  isPandoraCore as checkPandoraCore,
  getMaxShields as checkMaxShields
} from '../game/cores/registry'
import { useSettingsStore } from '../stores/settingsStore'

const settingsStore = useSettingsStore()
import { getCoreIconPath } from '../game/cores/icons'
import { fetchWithAuth } from '../services/api'
import { audioService } from '../services/audioService'
const router = useRouter()
const authStore = useAuthStore()
const gameStore = useGameStore()
const matchStore = useMatchStore()
const showFeedback = ref(false);

const handleFeedbackSuccess = () => {
  console.log('Feedback đã được gửi!');
};

// QuestionPayload and PointPopup used by composables — re-export so IDE recognises usage
export interface QuestionPayload {
  id: string
  question_text: string
  target_length: number
  target_hash: string
  oracle_hints: string[]
  hint?: string
  correct_word?: string
  topic?: string
}

export interface PointPopup {
  id: number
  value: number
  type: 'correct' | 'wrong' | 'typo' | 'speedster' | 'shield_blocked' | 'prismatic'
  x: number
  y: number
}

type GameState = 'loading' | 'playing' | 'correct' | 'wrong' | 'timeout' | 'upgrade'

// MATCH_DURATION managed by useMatchTimer composable; kept here for documentation
// const MATCH_DURATION = 60
const TIMEOUT_PHASE_DURATION = 15
const FEEDBACK_MS = 1000
const REFETCH_THRESHOLD = 5

// ── Toast Notifications Stack ──────────────────────────────────────────────
interface Toast {
  id: number
  message: string
  icon: string
  color: string
}
const toasts = ref<Toast[]>([])
let toastIdCounter = 0

function addToast(message: string, icon: string, color: string) {
  const id = ++toastIdCounter
  if (toasts.value.length >= 3) {
    toasts.value.shift()
  }
  toasts.value.push({ id, message, icon, color })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 2000)
}

// ── State ──────────────────────────────────────────────────────────────────
const gameState = ref<GameState>('loading')
const typedLetters = ref<string[]>([])
const inputRef = ref<HTMLInputElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const letterSlotsRef = ref<HTMLElement | null>(null)
const menuOpen = ref(false)
const confirmQuit = ref(false)
const savingSession = ref(false)
const sessionId = ref<string | null>(null)
const timeoutCountdown = ref(TIMEOUT_PHASE_DURATION)
const isDev = import.meta.env.DEV

// --- MULTIPLAYER CORE BINDINGS [US-51] ---
const route = useRoute()
const isMultiplayer = computed(() => route.path === '/game/multiplayer')
const opponentName = ref('')
const opponentAvatar = ref('')
const opponentScore = ref(0)
const opponentSessionId = ref('')
const currentUserId = computed(() => authStore.user?.id || authStore.profile?.id)
const waitingForOpponent = ref(false)
const isWaitingForNextRound = ref(false)

function updateOpponentData(state: any) {
  if (!state || !state.players || !currentRoom) return
  
  if (!opponentSessionId.value) {
    state.players.forEach((player: any, sId: string) => {
      if (sId !== currentRoom?.sessionId) {
        opponentSessionId.value = sId
      }
    })
  }

  const opponent = opponentSessionId.value ? state.players.get(opponentSessionId.value) : null
  if (opponent) {
    opponentScore.value = opponent.score || 0
    opponentName.value = opponent.name || 'Opponent'
    opponentAvatar.value = opponent.avatar || ''
    console.log(`[Multiplayer] Updated opponent ${opponent.name} score to: ${opponent.score}`)
  } else {
    opponentName.value = 'Waiting...'
    opponentScore.value = 0
  }
}


const tutorial = useTutorial()

const questionsAnswered = ref(0)
const oracleRevealLevel = ref(0)
const oracleTotalPenalty = ref(0)
const questionStartTime = ref<number>(Date.now())

// Initialize custom composables
const {
  score,
  pointsEarned,
  pointsDeducted,
  scoreFlash,
  pointPopups,
  triggerScoreFlash,
  spawnPointPopup,
  updateScoreAnimated
} = useScoreAnimation(letterSlotsRef)

function sendScoreUpdate(newScore: number) {
  if (isMultiplayer.value && currentRoom) {
    console.log(`[Multiplayer] Sending score update to server: ${newScore}`)
    currentRoom.send('update_score', { score: newScore })
  }
}

const {
  timeLeft,
  timerProgressPercent,
  startMatchTimer,
  stopMatchTimer,
  addTime,
  pauseTimerFor,
  resetTimer
} = useMatchTimer({
  showTutorial: () => tutorial.isCurrentScreen('gameplay'),
  timerSpeedMultiplier: () => timerSpeedMultiplier.value,
  isPandoraMode: () => isPandoraMode.value,
  isTrickster: () => isTrickster.value,
  isChaos: () => isChaos.value,
  onShapeshift: () => triggerShapeshift(),
  onTimeout: () => startTimeoutPhase()
})

const {
  questionQueue,
  currentQuestion,
  fetchBatch,
  loadQuestion,
  clearQueue
} = useQuestionQueue({
  fetchWithAuth,
  matchStore,
  gameStore,
  gameState,
  typedLetters,
  oracleRevealLevel,
  oracleTotalPenalty,
  questionStartTime,
  inputRef,
  refetchThreshold: REFETCH_THRESHOLD
})

const THEME_MAP: Record<string, string> = {
  'daily-life': '/bg-daily-life.png',
  'cafe': '/bg-cafe.png',
  'travel': '/bg-travel.png'
}

const currentBgImage = ref<string>(THEME_MAP[matchStore.topics?.[matchStore.currentRound - 1] || 'daily-life'] || THEME_MAP['daily-life'])
const isBgFading = ref(false)
const activeBgTimeouts = new Set<ReturnType<typeof setTimeout>>()

watch(() => matchStore.currentRound, (newRound, oldRound) => {
  const newTopic = matchStore.topics?.[newRound - 1]
  const newBg = THEME_MAP[newTopic] || THEME_MAP['daily-life']

  if (oldRound === undefined) {
    currentBgImage.value = newBg
  }

  else if (newRound && newRound !== oldRound) {
    isBgFading.value = true

    const t1 = setTimeout(() => {
      currentBgImage.value = newBg
      activeBgTimeouts.delete(t1)

      const t2 = setTimeout(() => {
        isBgFading.value = false
        activeBgTimeouts.delete(t2)
      }, 100)
      activeBgTimeouts.add(t2)
    }, 500)
    activeBgTimeouts.add(t1)
  }
}, { immediate: true })


const currentCombo = ref(0)
const isBurningComboActive = computed(() => isComboCore.value && currentCombo.value >= 3)
const missionProgress = ref(0)
const isAegisMode = computed(() =>
  checkAegisCore(activeCoreModule.value?.name || '') ||
  effectiveCores.value.some(c => checkAegisCore(c.name))
)
const maxShields = computed(() => {
  const activeMax = checkMaxShields(activeCoreModule.value?.name || '')
  if (effectiveCores.value.length === 0) return activeMax
  return Math.max(activeMax, ...effectiveCores.value.map(c => checkMaxShields(c.name)))
})
// Aegis Shield State
const aegisShieldCount = ref(0)

const isShattering = ref(false)
const showMissionCelebration = ref(false)
const showPrismaticFlash = ref(false)

// active_core_id / name sourced from gameStore (set in CoreSelectionView)
const currentPandoraCoreId = ref<string | null>(null)
const activeCoreId = computed<string | null>(() => {
  return gameStore.activeCoreId
})

// ── Core registry ──────────────────────────────────────────────────────────
const effectiveCores = computed(() => {
  const activeName = gameStore.activeCoreName || ''
  const activeFamily = getCoreFamily(activeName)

  let history = [...gameStore.coreHistory]

  if (activeFamily) {
    history = history.filter(c => getCoreFamily(c.name) === activeFamily)
  } else {
    history = history.filter(c => c.name === activeName)
  }

  if (gameStore.activeCoreId && gameStore.activeCoreName && !history.some(c => c.id === gameStore.activeCoreId)) {
    history.push({
      id: gameStore.activeCoreId,
      name: gameStore.activeCoreName,
      icon: '⚙️'
    })
  }

  if (isPandoraMode.value && currentPandoraCoreId.value) {
    const shiftedCore = allCores.value.find(c => c.id === currentPandoraCoreId.value)
    if (shiftedCore && !history.some(c => c.id === shiftedCore.id)) {
      history.push(shiftedCore)
    }
  }

  // Filter out older Power Cores in history if there is a more recent one
  const getClassification = (name: string) => {
    const found = allCores.value.find(c => c.name.toLowerCase() === name.toLowerCase())
    return found?.classification || null
  }

  const powerCoresInHist = history.filter(c => getClassification(c.name) === 'power')
  if (powerCoresInHist.length > 1) {
    const latestPowerCore = powerCoresInHist[powerCoresInHist.length - 1]
    history = history.filter(c => getClassification(c.name) !== 'power' || c.id === latestPowerCore.id)
  }

  return history
})

// ── Pandora's Box Logic ──────────────────────────────────────────────────
const basePandoraCoreName = computed(() => {
  const baseCore = allCores.value.find(c => c.id === gameStore.activeCoreId)
  return baseCore ? baseCore.name : gameStore.activeCoreName
})
const isPandoraMode = computed(() => checkPandoraCore(basePandoraCoreName.value))
const isTrickster = computed(() => isPandoraMode.value && matchStore.currentRound === 2)
const isChaos = computed(() => isPandoraMode.value && matchStore.currentRound === 3)

const activeCoreNameDynamic = computed(() => {
  if (isPandoraMode.value && currentPandoraCoreId.value) {
    const shiftedCore = allCores.value.find(c => c.id === currentPandoraCoreId.value)
    return shiftedCore ? shiftedCore.name : gameStore.activeCoreName
  }
  return gameStore.activeCoreName
})

const activeCoreIconUrlDynamic = computed(() => {
  if (isPandoraMode.value && currentPandoraCoreId.value) {
    const shiftedCore = allCores.value.find(c => c.id === currentPandoraCoreId.value)
    return shiftedCore ? getCoreIconPath(shiftedCore.name, shiftedCore.icon_url) : getCoreIconPath(gameStore.activeCoreName || '')
  }
  return gameStore.activeCoreName ? getCoreIconPath(gameStore.activeCoreName) : ''
})

const activeCoreModule = computed(() => {
  return getCoreModule(activeCoreNameDynamic.value)
})

// Convenience booleans
const getActiveName = () => activeCoreNameDynamic.value?.toLowerCase() || ''

const isComboCore = computed(() => {
  const name = getActiveName()
  if (checkComboCore(name)) return true
  return gameStore.coreHistory.some(c => checkComboCore(c.name))
})
const isOracleCore = computed(() => {
  const name = getActiveName()
  return checkOracleCore(name)
})
const isSpeedsterCore = computed(() => {
  const name = getActiveName()
  if (checkSpeedsterCore(name)) return true
  return gameStore.coreHistory.some(c => checkSpeedsterCore(c.name))
})
const isMissionCore = computed(() => {
  const name = getActiveName()
  if (checkMissionCore(name)) return true
  return gameStore.coreHistory.some(c => checkMissionCore(c.name))
})
const isTimeWarp = computed(() => {
  const name = getActiveName()
  if (name === 'time warp') return true
  return gameStore.coreHistory.some(c => c.name.toLowerCase() === 'time warp')
})
const isChronobreak = computed(() => {
  const name = getActiveName()
  if (name === 'chronobreak') return true
  return gameStore.coreHistory.some(c => c.name.toLowerCase() === 'chronobreak')
})

const isPrismaticCombo = computed(() => {
  const name = getActiveName()
  if (name === 'prismatic combo') return true
  return gameStore.coreHistory.some(c => c.name.toLowerCase() === 'prismatic combo')
})
const isExodia = computed(() => {
  const name = getActiveName()
  if (name === 'exodia') return true
  return gameStore.coreHistory.some(c => c.name.toLowerCase() === 'exodia')
})
const isSpeedDemon = computed(() => {
  const name = getActiveName()
  if (name === 'speed demon') return true
  return gameStore.coreHistory.some(c => c.name.toLowerCase() === 'speed demon')
})
const isGuardianAngel = computed(() => {
  const name = getActiveName()
  if (name === 'guardian-angel' || name === 'guardian angel') return true
  return gameStore.coreHistory.some(c => c.name.toLowerCase() === 'guardian angel')
})

const isOracleFree = computed(() => {
  const name = getActiveName()
  // Hints are free only for Oracle UPGRADE cores (not the base Argus Eyes itself)
  if (name && checkOracleCore(name) && name !== 'argus eyes') return true
  return gameStore.coreHistory.some(c => {
    const family = getCoreFamily(c.name)
    return family === 'oracle' && c.name.toLowerCase() !== 'argus eyes'
  })
})
const timerSpeedMultiplier = computed(() => {
  let mult = 1.0
  const activeName = getActiveName()

  const hasHypercharge = activeName === 'hypercharge'
  const hasOverdrive = activeName === 'overdrive'
  if (hasHypercharge) mult += 0.15
  if (hasOverdrive) mult += 0.20

  const hasDivineGuidance = activeName === 'divine guidance'
  const hasOmniscienceCore = activeName === 'omniscience'
  if (hasDivineGuidance) mult -= 0.10
  if (hasOmniscienceCore) mult -= 0.20

  return Math.max(0.1, mult)
})

const isShifting = ref(false)
const shiftAnnouncement = ref('')
const pandoraPool = ref<any[]>([])
const allCores = ref<any[]>([])

async function fetchPandoraPool() {
  try {
    const res = await fetchWithAuth(`/api/game/cores?all=true`)
    if (!res.ok) return
    const data = await res.json()
    allCores.value = data.cores || []
  } catch (err) {
    console.error('Failed to fetch cores for Pandora', err)
  }
}

function triggerShapeshift() {
  if (allCores.value.length === 0) return

  // Determine T1 names via upgradePaths — Pandora always shifts to T1 regardless of round
  const upgradePaths: Record<string, string> = {
    'Perfect Combo': 'Radiant Combo',
    'Radiant Combo': 'Prismatic Combo',
    'Speedster': 'Time Warp',
    'Time Warp': 'Chronobreak',
    'Argus Eyes': 'Clairvoyance',
    'Clairvoyance': 'Omniscience',
    'Mission Impossible': 'Bounty Hunter',
    'Bounty Hunter': 'Exodia',
    'Aegis Shield': 'Reflective Aegis',
    'Reflective Aegis': 'Bastion of Light',
    'Balance': 'Harmony Core',
    'Harmony Core': 'Perfect Harmony',
    'Power Strike': 'Overclock Core',
    'Overclock Core': 'Supernova Core',
    "Pandora's Box": "Trickster's Glass",
    "Trickster's Glass": "Chaos Theory"
  }
  const tier1Names = Object.keys(upgradePaths).filter(k => !Object.values(upgradePaths).includes(k))
  // tier2Names/tier3Names intentionally omitted — Pandora only shifts to tier1Names

  // Pandora ALWAYS shifts between the 8 main (Tier 1) cores, regardless of round!
  const validNames = tier1Names

  pandoraPool.value = allCores.value.filter((c: any) =>
    validNames.some(name => name.toLowerCase() === c.name.toLowerCase()) &&
    c.id !== activeCoreId.value &&
    !checkPandoraCore(c.name)
  )

  if (pandoraPool.value.length === 0) return

  isShifting.value = true
  playPandoraWarp()

  const randomCore = pandoraPool.value[Math.floor(Math.random() * pandoraPool.value.length)]

  setTimeout(() => {
    playPandoraTransform()
    currentPandoraCoreId.value = randomCore.id
    shiftAnnouncement.value = randomCore.name
    isShifting.value = false

    // Clear flashy text after 2s
    setTimeout(() => {
      shiftAnnouncement.value = ''
    }, 2000)
  }, 1200) 
}
// Oracle progressive reveal: 3 levels, increasing cost
const ORACLE_MAX_LEVEL = 3
const ORACLE_COSTS = [10, 20, 30] // cost per level: -10, -20, -30

const oracleNextCost = computed(() => {
  if (isOracleFree.value) return 0
  return ORACLE_COSTS[oracleRevealLevel.value] ?? 0
})

const oracleHintText = computed(() => {
  const level = oracleRevealLevel.value
  if (level === 0) return ''
  return currentQuestion.value.oracle_hints?.[level - 1] || ''
})
// ── Skip Question Logic  ───────────────────────────────────────────


function useOracleHint() {
  if (oracleRevealLevel.value >= oracleMaxAllowed.value) return
  if (gameState.value !== 'playing') return

  playOracleHint()

  const cost = isOracleFree.value ? 0 : ORACLE_COSTS[oracleRevealLevel.value]
  oracleRevealLevel.value++
  oracleTotalPenalty.value += cost

  // Score bar will update when submit-answer responds (server is source of truth).
  // Oracle cost is shown on the hint button label — no separate popup needed.

  // Re-focus the hidden input so the player can continue typing without clicking the screen
  inputRef.value?.focus()
}
const oracleMaxAllowed = computed(() => {
  const len = currentQuestion.value.target_length
  if (len <= 5) return 2
  return ORACLE_MAX_LEVEL
})



let submitAnswerSeq = 0   // increments per answer submitted; used to discard out-of-order responses

const playerAvatarUrl = computed(() =>
  authStore.profile?.avatar_url ||
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authStore.profile?.username || 'Player')}`
)

const matchHistory = ref<{ round: number, submitted: string, correct: string, isCorrect: boolean }[]>([])

const groupedMatchHistory = computed(() => {
  const groups: Record<number, typeof matchHistory.value> = {}
  matchHistory.value.forEach(item => {
    if (!groups[item.round]) groups[item.round] = []
    groups[item.round].push(item)
  })
  return groups
})

// ── Timer ──────────────────────────────────────────────────────────────────
let timeoutInterval: ReturnType<typeof setInterval> | null = null

function stopTimeoutInterval() {
  if (timeoutInterval) {
    clearInterval(timeoutInterval)
    timeoutInterval = null
  }
}

// ── Session API ────────────────────────────────────────────────────────────
async function createSession() {
  try {
    const res = await fetchWithAuth(`/api/game/session`, {
      method: 'POST',
      body: JSON.stringify({ active_core_id: activeCoreId.value })
    })
    if (!res.ok) return
    const data = await res.json()
    sessionId.value = data.session_id
    gameStore.sessionId = data.session_id
    if (data.active_core?.id) gameStore.activeCoreId = data.active_core.id
    if (data.active_core?.name) gameStore.activeCoreName = data.active_core.name
    // Theme is now managed by matchStore topics
    if (data.aegis_shield_count !== undefined) aegisShieldCount.value = data.aegis_shield_count
  } catch (err) {
    console.error(err)
  }
}

async function callTimeoutEndpoint(sid: string, coreId: string | null, oracleLvl: number) {
  savingSession.value = true
  try {
    const res = await fetchWithAuth(`/api/game/timeout`, {
      method: 'POST',
      body: JSON.stringify({
        session_id: sid,
        active_core_id: coreId,
        oracle_reveal_level: oracleLvl
      })
    })
    if (res.ok) {
      const data = await res.json()
      score.value = data.score ?? score.value
      sendScoreUpdate(score.value)
      questionsAnswered.value = data.questions_answered ?? questionsAnswered.value
    }
  } catch (err) {
    console.error(err)
  } finally {
    savingSession.value = false
  }
}



// ── Skip Question Logic (Enter key) ───────────────────────────────────────
async function skipQuestion() {
  if (gameState.value !== 'playing') return
  if (!sessionId.value || !currentQuestion.value.id) {
    // No session (guest/mock): deduct locally only
    if (isAegisMode.value && aegisShieldCount.value > 0) {
      aegisShieldCount.value--
      spawnPointPopup(0, 'shield_blocked')
    } else {
      score.value = Math.max(0, score.value - 10)
      sendScoreUpdate(score.value)
      spawnPointPopup(10, 'wrong')
    }
    currentCombo.value = 0
    if (isMissionCore.value) missionProgress.value = 0
    typedLetters.value = []
    triggerScoreFlash('wrong')
    loadQuestion()
    return
  }

  // Capture state before reset
  const questionId = currentQuestion.value.id
  const capturedOracleLevel = oracleRevealLevel.value
  const capturedCombo = currentCombo.value
  const capturedShields = aegisShieldCount.value
  const capturedMission = missionProgress.value

  // Immediate local feedback
  audioService.playSkip()
  if (currentRoom) {
    currentRoom.send('player_skip')
  }
  gameState.value = 'wrong'
  currentCombo.value = 0
  if (isMissionCore.value) {
    const isShieldMission = effectiveCores.value.some(c => c.name.toLowerCase() === 'shield mission')
    if (isShieldMission && aegisShieldCount.value > 0) {
      // Streak is protected by active shield
    } else {
      missionProgress.value = 0
    }
  }
  typedLetters.value = []
  triggerScoreFlash('wrong')

  // Advance immediately (skip = instant move to next)
  loadQuestion()

  // Notify server: send empty string as answer (server treats it as a full skip/wrong)
  const timeTaken = Date.now() - questionStartTime.value
  const mySeq = ++submitAnswerSeq
    ; (async () => {
      try {
        const res = await fetchWithAuth(`/api/game/submit-answer`, {
          method: 'POST',
          body: JSON.stringify({
            session_id: sessionId.value,
            question_id: questionId,
            answer: '',            // empty = full skip
            current_combo: capturedCombo,
            active_core_id: activeCoreId.value,
            secondary_core_id: isPandoraMode.value ? currentPandoraCoreId.value : undefined,
            core_history_names: gameStore.coreHistory.map(c => c.name),
            oracle_reveal_level: capturedOracleLevel,
            time_taken: timeTaken,
            current_shields: capturedShields,
            mission_progress: capturedMission
          })
        })
        if (res.ok) {
          const data = await res.json()

          score.value = data.new_total_score ?? score.value
          sendScoreUpdate(score.value)
          questionsAnswered.value = data.questions_answered ?? questionsAnswered.value

          if (data.breakdown?.final_shield_count !== undefined) {
            aegisShieldCount.value = data.breakdown.final_shield_count
          }
          if (data.breakdown?.mission_streak !== undefined) {
            missionProgress.value = data.breakdown.mission_streak
          }

          // --- Core Effect Engine (v2) Handlers ---
          if (data.timer_delta) {
            addTime(data.timer_delta)
            if (data.timer_delta > 0) {
              spawnPointPopup(0, 'custom', `+${data.timer_delta/1000}s TIME!`)
            }
          }
          
          if (data.forgive_mistake) {
            // Restore proactive resets
            currentCombo.value = capturedCombo
            missionProgress.value = capturedMission
            
            triggerScoreFlash('forgive')
            spawnPointPopup(0, 'custom', 'FORGIVEN!')
          }

          // Only show popup if it's the latest question to avoid spam, but ALWAYS update history
          if (mySeq === submitAnswerSeq) {
            if (data.breakdown?.shield_blocked) {
              spawnPointPopup(0, 'shield_blocked')
            } else if (!data.forgive_mistake) {
              spawnPointPopup(data.points_deducted, 'wrong')
            }
          }

          matchHistory.value.push({
            round: matchStore.currentRound,
            submitted: '(Skipped)',
            correct: data.correct_word || '???',
            isCorrect: false
          })
        }
      } catch (err) {
        console.error('Failed to sync skip:', err)
      }
    })()
}

// ── Input handling ────────────────────────────────────────────────────────
function handleKeydown(e: KeyboardEvent) {
  initAudio()
  
  if (gameState.value === 'timeout') return
  if (gameState.value !== 'playing') return
  if (menuOpen.value || confirmQuit.value) return

  // Reset the input buffer on nextTick to prevent string accumulation memory bloat
  nextTick(() => {
    if (inputRef.value) inputRef.value.value = ''
  })

  // Skip question when Enter is pressed
  if (e.key === 'Enter') {
    skipQuestion()
    return
  }

  if (e.key === 'Backspace') {
    typedLetters.value = typedLetters.value.slice(0, -1)
    playKeystroke(isSpeedsterCore.value, 0.8) // slightly lower pitch for backspace
    return
  }

  if (/^[a-zA-Z0-9\- '".,!?]$/.test(e.key)) {
    const maxLen = currentQuestion.value.target_length
    if (typedLetters.value.length >= maxLen) return

    typedLetters.value = [...typedLetters.value, e.key.toLowerCase()]
    
    // Play keystroke sound
    playKeystroke(isSpeedsterCore.value, isSpeedsterCore.value ? 1.15 : 1.0)
    
    if (typedLetters.value.length === maxLen) checkAnswer()
  }
}
async function sha256(message: string) {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function checkAnswer() {
  const maxLen = currentQuestion.value.target_length
  if (typedLetters.value.length < maxLen) return

  const typed = typedLetters.value.join('')
  const elapsed = Date.now() - questionStartTime.value

  const questionId = currentQuestion.value.id
  const capturedOracleLevel = oracleRevealLevel.value
  const capturedCombo = currentCombo.value
  const capturedShields = aegisShieldCount.value
  const capturedMission = missionProgress.value

  const hashVal = await sha256(typed)
  const isCorrectLocal = hashVal === currentQuestion.value.target_hash

  if (isCorrectLocal) {
    audioService.playCorrect()
    gameState.value = 'correct'
    currentCombo.value++
    
    if (currentRoom) {
      const family = getCoreFamily(gameStore.activeCoreName || '')
      if (family === 'combo' && currentCombo.value > 0 && currentCombo.value % 5 === 0) {
        currentRoom.send('player_milestone', { type: 'combo', message: 'Opponent is on fire!', icon: '🔥', color: 'text-orange' })
      } else if (family === 'oracle' && currentQuestion.value.target_length >= 9) {
        currentRoom.send('player_milestone', { type: 'long_word', message: 'Opponent cleared a long word!', icon: '🤯', color: 'text-purple-400' })
      } else if (family !== 'combo' && family !== 'oracle' && family !== 'aegis') {
        if (elapsed < 2500) {
          currentRoom.send('player_milestone', { type: 'massive_hit', message: 'Opponent scored a massive hit!', icon: '🚀', color: 'text-lightBlue' })
        }
      }
    }

    // Core specific time modifiers
    if (isTimeWarp.value) {
      addTime(2000)
    }
    if (isSpeedDemon.value && elapsed < 1500) {
      addTime(3000)
    }
    if (isChronobreak.value && currentCombo.value > 0 && currentCombo.value % 3 === 0) {
      pauseTimerFor(3000)
    }

    // Mission logic has been removed from client prediction and moved entirely to the backend.

    triggerScoreFlash('correct')
  } else {
    audioService.playSkip()
    gameState.value = 'wrong'
    currentCombo.value = 0
    // Mission streak drop logic is now handled by the backend

    triggerScoreFlash('wrong')
  }

  if (!sessionId.value || !questionId) {
    setTimeout(() => {
      if (gameState.value !== 'timeout') loadQuestion()
    }, FEEDBACK_MS)
    return
  }

  const timeTaken = elapsed
  const mySeq = ++submitAnswerSeq

  // If local check is correct, transition to next question immediately after feedback time
  if (isCorrectLocal) {
    let delay = FEEDBACK_MS
    // BUG FIX #3: was hardcoded === 5, didn't account for Swift Mission (3) or Mission Master (3)
    const missionTarget = effectiveCores.value.some(c =>
      ['swift mission', 'mission master', 'daily quest'].includes(c.name.toLowerCase())
    ) ? 3 : 5
    if (isMissionCore.value && missionProgress.value === missionTarget) {
      delay = 2000 // Wait for mission celebration animation
    }
    setTimeout(() => {
      if (gameState.value !== 'timeout' && mySeq === submitAnswerSeq) loadQuestion()
    }, delay)
  }

  ; (async () => {
    let lockInputMs = 0
    try {
      const res = await fetchWithAuth(`/api/game/submit-answer`, {
        method: 'POST',
        body: JSON.stringify({
          session_id: sessionId.value,
          question_id: questionId,
          answer: typed,
          current_combo: capturedCombo,
          active_core_id: activeCoreId.value,
          secondary_core_id: isPandoraMode.value ? currentPandoraCoreId.value : undefined,
          core_history_names: gameStore.coreHistory.map(c => c.name),
          core_history: gameStore.coreHistory.map(c => c.id),
          oracle_reveal_level: capturedOracleLevel,
          time_taken: timeTaken,
          current_shields: capturedShields,
          mission_progress: capturedMission
        })
      })

      if (res.ok) {
        const data = await res.json()
        
        if (data.lock_input_ms) {
          lockInputMs = data.lock_input_ms
        }

        const newScore = data.new_total_score ?? score.value
        updateScoreAnimated(newScore)
        sendScoreUpdate(newScore)

        questionsAnswered.value = data.questions_answered ?? questionsAnswered.value
        pointsEarned.value = data.points_earned ?? pointsEarned.value
        pointsDeducted.value = data.points_deducted ?? pointsDeducted.value

        if (data.breakdown?.final_shield_count !== undefined) {
          aegisShieldCount.value = data.breakdown.final_shield_count
        }
        if (data.breakdown?.mission_streak !== undefined) {
          if (data.breakdown.mission_completed === 1) {
            // Optimistically fill the last star for the celebration
            missionProgress.value = missionProgress.value + 1
          } else {
            missionProgress.value = data.breakdown.mission_streak
          }
        }

        // --- Core Effect Engine (v2) Handlers ---
        if (data.timer_delta) {
          addTime(data.timer_delta)
          // Optional: spawn some text popup for +1s
          if (data.timer_delta > 0) {
            spawnPointPopup(0, 'custom', `+${data.timer_delta/1000}s TIME!`)
          }
        }

        if (data.pause_timer_ms) {
          pauseTimerFor(data.pause_timer_ms)
          spawnPointPopup(0, 'custom', 'TIME FROZEN!')
        }
        
        if (data.shield_delta) {
          if (data.shield_delta > 0) {
            spawnPointPopup(0, 'custom', '+1 SHIELD!')
          }
        }
        
        // Handle forgive_mistake (prevent streak loss)
        if (!data.correct && data.forgive_mistake) {
          // Restore proactive resets
          currentCombo.value = capturedCombo
          missionProgress.value = capturedMission
          
          triggerScoreFlash('forgive')
          spawnPointPopup(0, 'custom', 'FORGIVEN!')
        }

        if (mySeq === submitAnswerSeq && !data.correct && data.correct_word) {
          currentQuestion.value.correct_word = data.correct_word
        }

        matchHistory.value.push({
          round: matchStore.currentRound,
          submitted: typed,
          correct: data.correct ? typed : (data.correct_word || '???'),
          isCorrect: data.correct
        })

        if (mySeq === submitAnswerSeq) {
          if (data.breakdown?.mission_completed === 1) {
            playJackpot(true)
            showMissionCelebration.value = true
            setTimeout(() => {
              showMissionCelebration.value = false
              missionProgress.value = 0
            }, 2000)
          }

          // Note: Mission celebration is now handled locally for instant feedback
          if (data.breakdown?.shield_blocked) {
            spawnPointPopup(0, 'shield_blocked')
          } else if (data.correct && isPrismaticCombo.value) {
            spawnPointPopup(data.points_earned, 'prismatic')
            showPrismaticFlash.value = true
            playFireBurst() // Burst of fire for prismatic
            setTimeout(() => {
              showPrismaticFlash.value = false
            }, 300)
          } else if (data.correct && isSpeedsterCore.value) {
            spawnPointPopup(data.points_earned, 'speedster')
            if (timeTaken <= 2000) playSpeedWhoosh()
          } else {
            const popupType: 'correct' | 'wrong' | 'typo' | 'prismatic' = data.correct
              ? 'correct'
              : (data.penalty_type === 'typo' ? 'typo' : 'wrong')
            spawnPointPopup(
              data.correct ? data.points_earned : data.points_deducted,
              popupType
            )
          }
        }

      }
    } catch (err) {
      console.error('Failed to sync answer:', err)
    } finally {
      if (!isCorrectLocal && mySeq === submitAnswerSeq) {
        const feedbackDelay = lockInputMs > 0 ? lockInputMs : FEEDBACK_MS
        
        if (lockInputMs > 0) {
          triggerScoreFlash('wrong') // Trigger a stronger flash or effect
          spawnPointPopup(0, 'custom', 'SYSTEM OVERLOAD!')
        }

        setTimeout(() => {
          if (gameState.value !== 'timeout') loadQuestion()
        }, feedbackDelay)
      }
    }
  })()
}

function resetTypingBoard() {
  gameState.value = 'timeout'
  stopTimeoutInterval()
  // NOTE: intentionally NOT resetting score, questionsAnswered, pointsEarned, pointsDeducted
  resetTimer()
  typedLetters.value = []
  currentCombo.value = 0
  missionProgress.value = 0
  aegisShieldCount.value = 0
  scoreFlash.value = null
  pointPopups.value = []
  oracleRevealLevel.value = 0
  clearQueue()
}

// ── US-24: Start 15-second timeout phase countdown ───────────────────────
// Called when the 1m30s gameplay timer reaches 0.
// Initialises the countdown state and schedules callTimeoutEndpoint once the
// 15s window has elapsed (or immediately completes the phase if it finishes).
function startTimeoutPhase() {
  gameState.value = 'timeout'
  inputRef.value?.blur()
  stopTimeoutInterval()

  if (isMultiplayer.value) {
    waitingForOpponent.value = true
    if (currentRoom) {
      currentRoom.send("finished_round")
    }
  } else {
    waitingForOpponent.value = false
    runRecapCountdown()
  }

  // Only tell the backend the session is over if it's the final round!
  // Otherwise, we keep the session alive to retain score and anti-cheat tracking.
  const sid = sessionId.value
  const coreId = activeCoreId.value
  const oracleLvl = oracleRevealLevel.value

  if (sid && matchStore.isFinalRound()) {
    setTimeout(() => callTimeoutEndpoint(sid, coreId, oracleLvl), 300)
  }
}

function runRecapCountdown() {
  timeoutCountdown.value = 15
  stopTimeoutInterval()

  timeoutInterval = setInterval(() => {
    timeoutCountdown.value--
    if (timeoutCountdown.value <= 0) {
      stopTimeoutInterval()
      if (!matchStore.isFinalRound()) {
        gameState.value = 'upgrade'
      }
    }
  }, 1000)
}

function goToUpgrade() {
  stopTimeoutInterval()
  if (!matchStore.isFinalRound()) {
    gameState.value = 'upgrade'
  }
}

function handleUpgradeSelected(_newCoreId: string) {
  if (isMultiplayer.value) {
    isWaitingForNextRound.value = true
    if (currentRoom) {
      currentRoom.send("ready_next_round")
    }
  } else {
    // When upgrade is selected, restart match for the next round
    restartMatch()
  }
}

// ── Match control ──────────────────────────────────────────────────────────
async function restartMatch() {
  if (gameState.value === 'loading') return
  if (matchStore.isFinalRound()) {
    // If they manually click "Next Round" somehow, route to home as fallback
    router.push('/home')
    return
  }

  // Next Round
  currentPandoraCoreId.value = null
  matchStore.incrementRound()
  resetTypingBoard()

  // Transition to loading and fetch next batch
  // Note: We DO NOT call createSession() here so the backend continues the same session!
  gameState.value = 'loading'
  await fetchBatch()

  if (questionQueue.value.length > 0) {
    await loadQuestion()
    gameState.value = 'playing'
    startMatchTimer()
  } else {
    // Fallback if fetch completely failed
    gameState.value = 'playing'
    startMatchTimer()
  }
}

async function playAgain() {
  if (gameState.value === 'loading') return

  if (isMultiplayer.value && currentRoom) {
    const rId = currentRoom.roomId
    leaveMatchRoom()
    router.push(`/room/custom?id=${rId}`)
    return
  }

  // Hard reset of global state
  score.value = 0
  questionsAnswered.value = 0
  currentCombo.value = 0
  aegisShieldCount.value = 0
  missionProgress.value = 0

  matchStore.resetMatch()
  matchHistory.value = []
  gameStore.coreHistory = []
  gameStore.activeCoreId = null
  gameStore.activeCoreName = null

  stopMatchTimer()
  resetTypingBoard()

  // Route back to core selection for a completely fresh match
  router.push('/core')
}

function goHome() {
  stopMatchTimer()
  stopTimeoutInterval()
  abandonCurrentSession()
  gameStore.sessionId = null
  matchStore.resetMatch()
  router.push('/home')
}

async function debugSkipRound() {
  menuOpen.value = false
  if (matchStore.isFinalRound()) {
    startTimeoutPhase()
  } else {
    await restartMatch()
  }
}

function skipGameplay() {
  menuOpen.value = false
  stopMatchTimer()
  if (!matchStore.isFinalRound()) {
    gameState.value = 'upgrade'
  } else {
    startTimeoutPhase()
  }
}

async function abandonCurrentSession() {
  if (!sessionId.value || gameState.value === 'timeout') return
  try {
    await fetchWithAuth(`/api/game/abandon`, {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId.value })
    })
  } catch (err) {
    console.error('Failed to abandon session:', err)
  }
}

// ── Misc ───────────────────────────────────────────────────────────────────
function handleOutsideClick(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    menuOpen.value = false
  }
}

async function startFirstRound() {
  gameState.value = 'loading'
  if (!gameStore.sessionId) {
    await createSession()
  } else {
    sessionId.value = gameStore.sessionId
  }
  if (isPandoraMode.value) {
    await fetchPandoraPool()
  }
  await fetchBatch()
  await loadQuestion()
  gameState.value = 'playing'
  startMatchTimer()
  document.addEventListener('click', handleOutsideClick)
  window.addEventListener('beforeunload', handleBeforeUnload)
}

function refocusInput() {
  if (gameState.value === 'timeout') return
  if (!menuOpen.value && !confirmQuit.value) inputRef.value?.focus()
}

const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (gameState.value === 'playing') {
    e.preventDefault()
    e.returnValue = ''
  }
}

watch(() => settingsStore.isSettingsOpen, (isOpen) => {
  if (!isOpen && gameState.value === 'playing') {
    nextTick(() => {
      refocusInput()
    })
  }
})

// Audio watchers
watch(aegisShieldCount, (newVal, oldVal) => {
  if (newVal > oldVal) {
    playShieldGain(newVal === maxShields.value)
  } else if (newVal < oldVal) {
    playShieldBreak()
    if (currentRoom) {
      const family = getCoreFamily(gameStore.activeCoreName || '')
      if (family === 'aegis') {
        currentRoom.send('player_milestone', { type: 'shield_break', message: "Opponent's shield broke!", icon: '🛡️', color: 'text-gray-400' })
      }
    }
  }
})

watch(activeCoreModule, (newCore) => {
  // BGM is handled elsewhere
}, { immediate: true })

watch(() => gameState.value, (newState) => {
  if (newState === 'upgrade') {
    audioService.playBGM('/audio/core_selection.mp3')
  } else if (newState === 'playing') {
    audioService.playBGM(audioService.getCoreBgmPath(gameStore.activeCoreName))
  }
})

watch(() => currentCombo.value, (newVal) => {
  const isComboActive = effectiveCores.value.some(c => c.name.toLowerCase().includes('combo') || c.name.toLowerCase().includes('strike') || c.name.toLowerCase().includes('power'))
  
  if (!isComboActive) return

  if (newVal >= 2) {
    playComboTone(newVal)
  } else if (newVal === 0) {
    playComboBreak()
  }
})

onMounted(async () => {
  if (isMultiplayer.value && currentRoom) {
    updateOpponentData(currentRoom.state)
    currentRoom.onStateChange((state) => {
      updateOpponentData(state)
    })
    currentRoom.onMessage('opponent_left', () => {
      alert("Đối thủ đã thoát trận đấu! Bạn sẽ được đưa về màn hình chính.")
      goHome()
    })
    currentRoom.onMessage('start_recap_countdown', () => {
      waitingForOpponent.value = false
      runRecapCountdown()
    })
    currentRoom.onMessage('start_next_round', () => {
      isWaitingForNextRound.value = false
      restartMatch()
    })
    currentRoom.onMessage('opponent_milestone', (data: { type: string, message: string, icon: string, color: string }) => {
      addToast(data.message, data.icon, data.color)
    })
    currentRoom.onMessage('opponent_skip', () => {
      addToast('Opponent skipped a word!', '❌', 'text-hexred')
    })
  }

  if (!activeCoreId.value) {
    if (isMultiplayer.value) {
      router.replace('/core/multiplayer')
      return
    } else {
      router.replace('/core')
      return
    }
  }

  // Ensure we start a fresh match if navigating here from outside
  if (!gameStore.sessionId) {
    matchStore.resetMatch()
  }
  resetTimer()

  if (!gameStore.sessionId) {
    await createSession()
  } else {
    sessionId.value = gameStore.sessionId
  }
  if (isPandoraMode.value) {
    await fetchPandoraPool()
  }
  await fetchBatch()
  await loadQuestion()

  if (gameState.value !== 'upgrade') {
    audioService.playBGM(audioService.getCoreBgmPath(gameStore.activeCoreName))
  }

  sendScoreUpdate(0)
  startMatchTimer()
  document.addEventListener('click', handleOutsideClick)
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  leaveMatchRoom()
  stopMatchTimer()
  stopTimeoutInterval()
  document.removeEventListener('click', handleOutsideClick)
  window.removeEventListener('beforeunload', handleBeforeUnload)
  for (const t of activeBgTimeouts) clearTimeout(t)
  activeBgTimeouts.clear()
})


</script>

<style scoped>
.cyber-grid {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 64px 64px;
}

.score-bar-fill {
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.float-pts-item {
  text-shadow: 0 0 12px currentColor;
  white-space: nowrap;
}

.float-pts-enter-active {
  animation: floatUp 1.2s ease-out forwards;
}

.mission-celebration-enter-active {
  animation: missionCelebIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

.mission-celebration-leave-active {
  transition: opacity 0.3s ease-in;
}

.mission-celebration-enter-from,
.mission-celebration-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

@keyframes missionCelebIn {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.float-pts-leave-active {
  display: none;
}

@keyframes floatUp {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1.2);
  }

  20% {
    opacity: 1;
    transform: translateY(-16px) scale(1.35);
  }

  80% {
    opacity: 0.7;
    transform: translateY(-56px) scale(1);
  }

  100% {
    opacity: 0;
    transform: translateY(-80px) scale(0.85);
  }
}

/* ── Popups & Float Animations ──────────────────────────────────────────────── */
.point-popup-anim {
  animation: floatUp 1.2s ease-out forwards;
  will-change: transform, opacity;
}

/* ── Speedster FAST! popup ──────────────────────────────────────────────── */
.speedster-popup {
  animation: fastPopup 1.8s cubic-bezier(0.22, 1, 0.36, 1) forwards !important;
  will-change: transform, opacity;
}

.speedster-fast-text {
  display: inline-block;
  font-size: 2rem;
  font-weight: 900;
  letter-spacing: 0.15em;
  background: linear-gradient(90deg, #67e8f9, #06b6d4, #ffffff, #06b6d4, #67e8f9);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
  filter: drop-shadow(0 0 12px rgba(6, 182, 212, 0.9)) drop-shadow(0 0 24px rgba(103, 232, 249, 0.6));
  animation: shimmerFast 0.6s linear infinite;
}

@keyframes shimmerFast {
  to {
    background-position: 200% center;
  }
}

@keyframes fastPopup {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.6) skewX(-8deg);
  }

  10% {
    opacity: 1;
    transform: translateY(-10px) scale(1.5) skewX(4deg);
  }

  25% {
    opacity: 1;
    transform: translateY(-30px) scale(1.2) skewX(-2deg);
  }

  70% {
    opacity: 0.9;
    transform: translateY(-80px) scale(1.05) skewX(0deg);
  }

  100% {
    opacity: 0;
    transform: translateY(-120px) scale(0.8) skewX(0deg);
  }
}

/* ── Speedster timer glow ───────────────────────────────────────────────── */
.speedster-timer-glow {
  animation: speedTimerPulse 0.8s ease-in-out infinite;
  color: #67e8f9;
}

.speedster-timer-icon {
  animation: speedTimerPulse 0.8s ease-in-out infinite;
  color: #67e8f9;
  filter: drop-shadow(0 0 6px rgba(6, 182, 212, 0.8));
}

@keyframes speedTimerPulse {

  0%,
  100% {
    text-shadow: 0 0 8px rgba(6, 182, 212, 0.6), 0 0 16px rgba(103, 232, 249, 0.3);
    filter: drop-shadow(0 0 6px rgba(6, 182, 212, 0.8));
  }

  50% {
    text-shadow: 0 0 20px rgba(6, 182, 212, 1), 0 0 40px rgba(103, 232, 249, 0.8), 0 0 60px rgba(255, 255, 255, 0.3);
    filter: drop-shadow(0 0 14px rgba(6, 182, 212, 1)) drop-shadow(0 0 28px rgba(103, 232, 249, 0.6));
  }
}



.speedster-slots-glow {
  filter: drop-shadow(0 0 8px rgba(6, 182, 212, 0.35));
  transition: filter 0.3s ease;
}



.score-pop-correct {
  animation: scoreScaleCorrect 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.score-pop-wrong {
  animation: scoreScaleWrong 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes scoreScaleCorrect {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.6);
    text-shadow: 0 0 15px rgba(255, 165, 0, 0.8);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes scoreScaleWrong {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.4);
    text-shadow: 0 0 15px rgba(230, 57, 70, 0.9);
  }

  100% {
    transform: scale(1);
  }
}

.slot--correct {
  animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.slot--wrong {
  animation: shake 0.4s ease;
}

@keyframes pop {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.15);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-6px);
  }

  75% {
    transform: translateX(6px);
  }
}

.timeout-glitch {
  animation: glitch 0.8s ease forwards;
}

@keyframes glitch {
  0% {
    clip-path: inset(0 0 100% 0);
    opacity: 0;
    transform: skewX(-10deg) scale(1.1);
    color: #fff;
  }

  30% {
    clip-path: inset(0 0 0% 0);
    opacity: 1;
    transform: skewX(5deg);
    color: #E63946;
  }

  60% {
    transform: skewX(-2deg);
    color: #fff;
  }

  100% {
    transform: skewX(0);
    color: #E63946;
  }
}

.timeout-panel {
  animation: panel-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes panel-in {
  from {
    transform: scale(0.9) translateY(20px);
    opacity: 0;
  }

  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ── US-24: 15-second timeout phase banner ─────────────────────────────── */
.timeout-phase-banner-enter-active {
  transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.timeout-phase-banner-leave-active {
  transition: opacity 0.25s ease;
}

.timeout-phase-banner-enter-from,
.timeout-phase-banner-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

/* Pulsing red ring around the countdown circle */
.timeout-phase-ring {
  animation: phaseRingPulse 1s ease-in-out infinite;
}

@keyframes phaseRingPulse {

  0%,
  100% {
    box-shadow: 0 0 20px rgba(230, 57, 70, 0.4), 0 0 40px rgba(230, 57, 70, 0.2);
  }

  50% {
    box-shadow: 0 0 40px rgba(230, 57, 70, 0.8), 0 0 80px rgba(230, 57, 70, 0.4), 0 0 120px rgba(230, 57, 70, 0.15);
  }
}

/* Subtle scale-tick on every digit change */
.timeout-phase-digits {
  animation: phaseTick 1s steps(1, end) infinite;
}

@keyframes phaseTick {
  0% {
    transform: scale(1);
  }

  5% {
    transform: scale(1.15);
  }

  15% {
    transform: scale(1);
  }
}

.timeout-overlay-enter-active,
.timeout-overlay-leave-active {
  transition: opacity 0.3s;
}

.timeout-overlay-enter-from,
.timeout-overlay-leave-to {
  opacity: 0;
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.2s;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.card-flip-enter-active,
.card-flip-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}

.card-flip-enter-from {
  opacity: 0;
  transform: rotateX(-90deg) scale(0.9);
}

.card-flip-leave-to {
  opacity: 0;
  transform: rotateX(90deg) scale(0.9);
}

.glow-sweep {
  animation: sweepWave 1s ease-in-out infinite;
  display: inline-block;
}

@keyframes sweepWave {

  0%,
  100% {
    color: #22c55e;
    text-shadow: 0 0 5px rgba(34, 197, 94, 0.3);
    transform: scale(1) translateY(0);
  }

  50% {
    color: #ffffff;
    text-shadow: 0 0 15px rgba(34, 197, 94, 1), 0 0 25px rgba(34, 197, 94, 0.8), 0 0 35px rgba(255, 255, 255, 0.5);
    transform: scale(1.15) translateY(-3px);
  }
}


/* ── INTENSE WILDFIRE EFFECT ────────────────────────────── */
.burning-edge-active {
  position: relative;
  border-color: rgba(255, 100, 0, 0.8) !important;
}

.burning-edge-active::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  z-index: -1;
  pointer-events: none;
  animation: outerFlames 0.4s infinite alternate ease-in-out;
}

@keyframes outerFlames {
  0% {
    box-shadow:
      0 -10px 15px rgba(255, 165, 0, 0.6),
      0 10px 15px rgba(255, 69, 0, 0.5),
      10px 0 15px rgba(255, 69, 0, 0.5),
      -10px 0 15px rgba(255, 165, 0, 0.5);
  }

  100% {
    box-shadow:
      0 -40px 45px rgba(255, 100, 0, 0.9),
      0 20px 30px rgba(255, 0, 0, 0.7),
      25px 0 35px rgba(255, 100, 0, 0.8),
      -25px 0 35px rgba(255, 0, 0, 0.8),
      0 0 20px rgba(255, 255, 255, 0.3);
  }
}

/* Chaos Theory Color Shift */
@keyframes spin-fast {
  from {
    transform: rotate(0deg) scale(0.9);
  }
  50% {
    transform: rotate(180deg) scale(1.1);
  }
  to {
    transform: rotate(360deg) scale(0.9);
  }
}

.animate-spin-fast {
  animation: spin-fast 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
}

/* Exodia Shake */
.exodia-shake {
  animation: exodia-tremor 0.1s infinite;
}

@keyframes exodia-tremor {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }

  25% {
    transform: translate(5px, 5px) rotate(1deg);
  }

  50% {
    transform: translate(0, 0) rotate(0deg);
  }

  75% {
    transform: translate(-5px, 5px) rotate(-1deg);
  }

  100% {
    transform: translate(0, 0) rotate(0deg);
  }
}

/* Prismatic Explosion */
.prismatic-explosion {
  animation: prismatic-blast 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  will-change: transform, opacity;
  color: #fff;
  text-shadow: 0 0 10px #ff00ff, 0 0 20px #00ffff, 0 0 30px #ffff00;
}

@keyframes prismatic-blast {
  0% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(2.5) rotate(10deg);
    opacity: 0.8;
    text-shadow: 0 0 20px #ff00ff, 0 0 40px #00ffff, 0 0 60px #ffff00;
  }

  100% {
    transform: scale(3) rotate(0deg) translateY(-50px);
    opacity: 0;
  }
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s ease;
}
.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(50px);
}
.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

</style>