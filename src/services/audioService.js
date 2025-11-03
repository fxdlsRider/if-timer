/**
 * Audio Service
 *
 * Handles all audio-related functionality using Web Audio API.
 * Plays completion sounds and manages AudioContext lifecycle.
 */

import { AUDIO_CONFIG } from '../config/constants';

// Global AudioContext instance
let audioContextInstance = null;

/**
 * Get or create AudioContext instance
 * @returns {AudioContext|null} AudioContext instance or null if not supported
 */
export const getAudioContext = () => {
  if (audioContextInstance) {
    return audioContextInstance;
  }

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContextInstance = new AudioContext();
    return audioContextInstance;
  } catch (error) {
    console.warn('AudioContext not supported:', error);
    return null;
  }
};

/**
 * Initialize AudioContext on user gesture
 * Must be called from user interaction (e.g., button click)
 * @returns {Promise<AudioContext|null>} AudioContext instance or null
 */
export const initializeAudioContext = async () => {
  const context = getAudioContext();

  if (!context) {
    return null;
  }

  // Resume if suspended (required for autoplay policy)
  if (context.state === 'suspended') {
    try {
      await context.resume();
      console.log('AudioContext resumed');
    } catch (error) {
      console.warn('Failed to resume AudioContext:', error);
    }
  }

  return context;
};

/**
 * Play a single tone
 * @param {AudioContext} audioContext - Web Audio API context
 * @param {number} frequency - Frequency in Hz
 * @param {number} startTime - Start time in seconds
 * @param {number} duration - Duration in seconds
 * @param {number} gain - Volume level (0-1)
 */
const playTone = (audioContext, frequency, startTime, duration, gain = AUDIO_CONFIG.GAIN) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = frequency;
  gainNode.gain.setValueAtTime(gain, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
};

/**
 * Play completion sound (success melody)
 * @returns {Promise<boolean>} True if played successfully, false otherwise
 */
export const playCompletionSound = async () => {
  const audioContext = getAudioContext();

  if (!audioContext) {
    console.log('❌ No AudioContext available');
    return false;
  }

  // Resume if suspended
  if (audioContext.state === 'suspended') {
    console.log('⚠️ AudioContext suspended, attempting resume...');
    try {
      await audioContext.resume();
    } catch (error) {
      console.error('❌ Failed to resume AudioContext:', error);
      return false;
    }
  }

  try {
    console.log('🔊 Playing completion sound...');

    const now = audioContext.currentTime;

    // Play melody (C5 → E5 → G5)
    AUDIO_CONFIG.COMPLETION_MELODY.forEach(({ frequency, duration, delay }) => {
      playTone(audioContext, frequency, now + delay, duration);
    });

    console.log('✅ Sound played successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error playing sound:', error);
    return false;
  }
};

/**
 * Play custom sound with given frequency
 * @param {number} frequency - Frequency in Hz
 * @param {number} duration - Duration in ms
 * @returns {Promise<boolean>} True if played successfully
 */
export const playCustomTone = async (frequency = 440, duration = 200) => {
  const audioContext = getAudioContext();

  if (!audioContext) {
    return false;
  }

  try {
    const now = audioContext.currentTime;
    playTone(audioContext, frequency, now, duration / 1000);
    return true;
  } catch (error) {
    console.error('Error playing custom tone:', error);
    return false;
  }
};

/**
 * Stop all audio
 */
export const stopAllAudio = () => {
  if (audioContextInstance && audioContextInstance.state !== 'closed') {
    audioContextInstance.close();
    audioContextInstance = null;
  }
};

/**
 * Check if audio is supported
 * @returns {boolean} True if Web Audio API is supported
 */
export const isAudioSupported = () => {
  return !!(window.AudioContext || window.webkitAudioContext);
};

/**
 * Get audio context state
 * @returns {string|null} 'running', 'suspended', 'closed', or null
 */
export const getAudioState = () => {
  return audioContextInstance ? audioContextInstance.state : null;
};
