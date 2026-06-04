import { onMounted, onUnmounted, ref } from 'vue'

const STORAGE_KEY = 'beibei-coloring-bgm-enabled'

export function useBgm() {
  const enabled = ref(localStorage.getItem(STORAGE_KEY) === 'true')
  let audioContext = null
  let masterGain = null
  let timer = null
  let step = 0

  const melody = [
    659.25, 783.99, 880, 783.99,
    659.25, 587.33, 659.25, 523.25,
    659.25, 783.99, 987.77, 880,
    783.99, 659.25, 587.33, 523.25
  ]

  const bass = [
    130.81, 130.81, 196, 196,
    146.83, 146.83, 196, 196
  ]

  function getAudioContext() {
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      audioContext = new AudioContextClass()
      masterGain = audioContext.createGain()
      masterGain.gain.value = 0.08
      masterGain.connect(audioContext.destination)
    }
    return audioContext
  }

  function playTone(frequency, duration, volume = 0.8) {
    const context = getAudioContext()
    const oscillator = context.createOscillator()
    const gain = context.createGain()

    oscillator.type = 'square'
    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(0.0001, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(volume, context.currentTime + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration)

    oscillator.connect(gain)
    gain.connect(masterGain)
    oscillator.start(context.currentTime)
    oscillator.stop(context.currentTime + duration)
  }

  function playStep() {
    playTone(melody[step % melody.length], 0.14, 0.55)
    if (step % 2 === 0) {
      playTone(bass[Math.floor(step / 2) % bass.length], 0.18, 0.35)
    }
    step++
  }

  async function startBgm() {
    enabled.value = true
    localStorage.setItem(STORAGE_KEY, 'true')

    const context = getAudioContext()
    if (context.state === 'suspended') {
      await context.resume()
    }

    if (timer) return
    playStep()
    timer = window.setInterval(playStep, 220)
  }

  function stopBgm() {
    enabled.value = false
    localStorage.setItem(STORAGE_KEY, 'false')

    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  function pauseBgm() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  function toggleBgm() {
    if (enabled.value) {
      stopBgm()
    } else {
      startBgm()
    }
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      pauseBgm()
    } else if (enabled.value) {
      startBgm()
    }
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    pauseBgm()
    audioContext?.close()
  })

  return {
    enabled,
    toggleBgm,
    startBgm,
    stopBgm
  }
}
