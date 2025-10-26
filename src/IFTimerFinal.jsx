// src/IFTimerFinal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from './supabaseClient';

export default function IFTimerFinal() {
  const { user, signOut, authError } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  
  // 🧪 TEST MODE - When true, uses seconds instead of hours for quick testing
  const TEST_MODE = true; // Change to false for production!
  const TIME_MULTIPLIER = TEST_MODE ? 1 : 3600; // 1 second or 3600 seconds (1 hour)
  const TIME_UNIT = TEST_MODE ? 'seconds' : 'hours';
  
  const [hours, setHours] = useState(16);
  const [isRunning, setIsRunning] = useState(false);
  const [targetTime, setTargetTime] = useState(null);
  const [angle, setAngle] = useState(21.2);
  const [isDragging, setIsDragging] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [completedFastData, setCompletedFastData] = useState(null);
  const [isExtended, setIsExtended] = useState(false);
  const [originalGoalTime, setOriginalGoalTime] = useState(null);

  const circleRef = useRef(null);
  const notificationShownRef = useRef(false);
  const audioContextRef = useRef(null);

  // Update current time every second for display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate time left based on target time
  const getTimeLeft = () => {
    if (!isRunning || !targetTime) return 0;
    
    if (isExtended) {
      // Extended mode: show time SINCE goal was reached
      const elapsed = Math.floor((currentTime - originalGoalTime) / 1000);
      return elapsed; // Positive number = time beyond goal
    }
    
    // Normal mode: countdown to goal
    const remaining = Math.max(0, Math.floor((targetTime - currentTime) / 1000));
    return remaining;
  };

  const timeLeft = getTimeLeft();

  // NOTE: Notification permission will be requested on first timer start
  // Safari requires user gesture - can't request automatically on page load

  // Show notification when timer completes
  useEffect(() => {
    if (isRunning && timeLeft === 0 && !notificationShownRef.current) {
      notificationShownRef.current = true;
      
      // Save completion data for celebration screen
      const completionData = {
        duration: hours,
        startTime: new Date(targetTime - (hours * TIME_MULTIPLIER * 1000)),
        endTime: new Date(targetTime),
        unit: TIME_UNIT
      };
      setCompletedFastData(completionData);
      
      // Play completion sound
      const playSound = () => {
        try {
          const audioContext = audioContextRef.current;
          
          if (!audioContext) {
            console.log('❌ No AudioContext available');
            return;
          }
          
          if (audioContext.state === 'suspended') {
            console.log('⚠️ AudioContext suspended, attempting resume...');
            audioContext.resume();
          }
          
          console.log('🔊 Playing completion sound...');
          
          // Success melody: 3 ascending tones
          const playTone = (frequency, startTime, duration) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(audioContext.destination);
            
            osc.frequency.value = frequency;
            gain.gain.setValueAtTime(0.3, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            
            osc.start(startTime);
            osc.stop(startTime + duration);
          };
          
          const now = audioContext.currentTime;
          playTone(523.25, now, 0.15);        // C5
          playTone(659.25, now + 0.15, 0.15); // E5
          playTone(783.99, now + 0.3, 0.3);   // G5
          
          console.log('✅ Sound played successfully!');
        } catch (e) {
          console.error('❌ Error playing sound:', e);
        }
      };
      
      playSound();
      
      // Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        const duration = TEST_MODE ? `${hours} seconds` : `${hours}h`;
        new Notification('IF Timer Complete! 🎉', {
          body: `Your ${duration} fast is complete! Great job!`,
          icon: '/favicon.ico',
          tag: 'if-timer-complete'
        });
      }

      // Show celebration screen instead of resetting
      setShowCelebration(true);
      
      // Reset notification flag after 5 seconds
      setTimeout(() => {
        notificationShownRef.current = false;
      }, 5000);
    }
  }, [isRunning, timeLeft, hours, TEST_MODE, TIME_MULTIPLIER, TIME_UNIT, targetTime]);

  // Load state from localStorage on mount (if not logged in)
  useEffect(() => {
    if (user) return; // Skip if logged in (will load from Supabase)

    const saved = localStorage.getItem('ifTimerState');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        setHours(state.hours || 16);
        setAngle(state.angle || 21.2);
        setIsRunning(state.isRunning || false);
        setTargetTime(state.targetTime || null);
      } catch (e) {
        console.error('Error loading state:', e);
      }
    }
  }, [user]);

  // Save to localStorage (if not logged in)
  useEffect(() => {
    if (user) return; // Skip if logged in (Supabase handles it)

    const state = {
      hours,
      angle,
      isRunning,
      targetTime
    };
    localStorage.setItem('ifTimerState', JSON.stringify(state));
  }, [hours, angle, isRunning, targetTime, user]);

  // Load from Supabase (if logged in)
  useEffect(() => {
    if (!user) return;

    const loadFromSupabase = async () => {
      const { data, error } = await supabase
        .from('timer_states')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading:', error);
        setIsInitialLoad(false);
        return;
      }

      if (data) {
        setHours(data.hours);
        setAngle(data.angle);
        
        // Check if timer is actually still running
        const targetTimeMs = data.target_time ? new Date(data.target_time).getTime() : null;
        const originalGoalMs = data.original_goal_time ? new Date(data.original_goal_time).getTime() : null;
        const now = Date.now();
        
        if (targetTimeMs && data.is_running) {
          setIsRunning(true);
          setTargetTime(targetTimeMs);
          
          // Check if in extended mode
          if (data.is_extended && originalGoalMs) {
            setIsExtended(true);
            setOriginalGoalTime(originalGoalMs);
          } else {
            setIsExtended(false);
            setOriginalGoalTime(null);
          }
        } else {
          // Timer not running or completed
          setIsRunning(false);
          setTargetTime(null);
          setIsExtended(false);
          setOriginalGoalTime(null);
        }
      }
      
      // Mark initial load as complete
      setIsInitialLoad(false);
    };

    loadFromSupabase();
  }, [user]);

  // Real-time sync (if logged in)
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('timer_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'timer_states',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new) {
            const data = payload.new;
            setHours(data.hours);
            setAngle(data.angle);
            
            // Check if timer is actually still running
            const targetTimeMs = data.target_time ? new Date(data.target_time).getTime() : null;
            const originalGoalMs = data.original_goal_time ? new Date(data.original_goal_time).getTime() : null;
            
            if (targetTimeMs && data.is_running) {
              setIsRunning(true);
              setTargetTime(targetTimeMs);
              
              // Check if in extended mode
              if (data.is_extended && originalGoalMs) {
                setIsExtended(true);
                setOriginalGoalTime(originalGoalMs);
              } else {
                setIsExtended(false);
                setOriginalGoalTime(null);
              }
            } else {
              // Timer not running
              setIsRunning(false);
              setTargetTime(null);
              setIsExtended(false);
              setOriginalGoalTime(null);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Save to Supabase (if logged in)
  const saveToSupabase = async () => {
    if (!user || syncing) return;

    setSyncing(true);

    try {
      const { error } = await supabase
        .from('timer_states')
        .upsert({
          user_id: user.id,
          hours,
          angle,
          is_running: isRunning,
          target_time: targetTime ? new Date(targetTime).toISOString() : null,
          is_extended: isExtended,
          original_goal_time: originalGoalTime ? new Date(originalGoalTime).toISOString() : null
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSyncing(false);
    }
  };

  // Sync on state changes (if logged in)
  useEffect(() => {
    if (!user) return;
    
    // Skip saving on initial load - only save after user actions
    if (isInitialLoad) return;
    
    saveToSupabase();
  }, [hours, angle, isRunning, targetTime, isExtended, originalGoalTime, user]);

  // Handle drag
  const handlePointerDown = (e) => {
    if (isRunning) return;
    e.preventDefault();
    setIsDragging(true);
    updateAngleFromEvent(e);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || isRunning) return;
    e.preventDefault();
    updateAngleFromEvent(e);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const updateAngleFromEvent = (e) => {
    if (!circleRef.current) return;

    const rect = circleRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    if (!clientX || !clientY) return;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;

    let rawAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
    if (rawAngle < 0) rawAngle += 360;

    if (angle < 180 && rawAngle > 270) return;
    if (angle > 270 && rawAngle < 90) return;

    setAngle(rawAngle);

    const hourRange = 34;
    const mappedHours = Math.round(14 + (rawAngle / 360) * hourRange);
    setHours(Math.min(48, Math.max(14, mappedHours)));
  };

  useEffect(() => {
    if (isDragging) {
      const handleMove = (e) => handlePointerMove(e);
      const handleUp = () => handlePointerUp();

      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleUp);
      };
    }
  }, [isDragging]);

  const handleLevelClick = (targetHours) => {
    if (isRunning) return;
    
    const hourRange = 34;
    const normalizedHours = Math.max(14, Math.min(48, targetHours));
    const newAngle = ((normalizedHours - 14) / hourRange) * 360;
    
    setHours(normalizedHours);
    setAngle(newAngle);
  };

  const startTimer = () => {
    // Request notification permission on first start (Safari requires user gesture)
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    // Initialize AudioContext on user gesture (required for autoplay policy)
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.log('AudioContext not supported:', e);
      }
    }
    
    // Resume AudioContext if suspended
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    
    const now = Date.now();
    const target = now + (hours * TIME_MULTIPLIER * 1000);
    
    // Reset extended mode state for new timer
    setIsExtended(false);
    setOriginalGoalTime(null);
    setShowCelebration(false);
    
    setTargetTime(target);
    setIsRunning(true);
    notificationShownRef.current = false;
  };

  const cancelTimer = () => {
    setIsRunning(false);
    setTargetTime(null);
    setIsExtended(false);
    setOriginalGoalTime(null);
    notificationShownRef.current = false;
  };

  // Celebration Screen Actions
  const handleContinueFasting = () => {
    // Enable extended mode
    setIsExtended(true);
    setOriginalGoalTime(targetTime); // Save when goal was reached
    setShowCelebration(false);
    // Timer continues running, now showing extended time
  };

  const handleStopFasting = () => {
    // Save session and reset
    setShowCelebration(false);
    setIsRunning(false);
    setTargetTime(null);
    setIsExtended(false);
    setOriginalGoalTime(null);
    // TODO: Save to fasting_sessions table
  };

  const handleStartNewFast = () => {
    // Save previous session and start fresh
    setShowCelebration(false);
    setIsRunning(false);
    setTargetTime(null);
    setIsExtended(false);
    setOriginalGoalTime(null);
    // Reset to selection screen
    // TODO: Save to fasting_sessions table
  };

  // Get celebration content based on fasting level
  const getCelebrationContent = (duration) => {
    if (duration >= 14 && duration < 16) {
      return {
        title: 'GENTLE WARRIOR',
        subtitle: `You completed your ${duration}h gentle fast!`,
        message: 'Building healthy habits, one fast at a time.',
        color: '#4CAF50' // Soft green
      };
    } else if (duration >= 16 && duration < 18) {
      return {
        title: 'CLASSIC ACHIEVER',
        subtitle: `You completed your ${duration}h classic fast!`,
        message: 'This is the gold standard. You nailed it.',
        color: '#2196F3' // Blue
      };
    } else if (duration >= 18 && duration < 20) {
      return {
        title: 'INTENSIVE CHAMPION',
        subtitle: `You completed your ${duration}h intensive fast!`,
        message: "Most people can't do this. You're not most people.",
        color: '#FF9800' // Orange
      };
    } else if (duration >= 20 && duration < 24) {
      return {
        title: 'WARRIOR ELITE',
        subtitle: `You completed your ${duration}h warrior fast!`,
        message: 'Discipline. Focus. Power. This is mastery.',
        color: '#F44336' // Red
      };
    } else if (duration >= 24 && duration < 36) {
      return {
        title: 'MONK MODE MASTER',
        subtitle: `You completed your ${duration}h monk fast!`,
        message: 'Few reach this level. You have transcended.',
        color: '#9C27B0' // Purple
      };
    } else {
      return {
        title: 'LEGEND STATUS',
        subtitle: `You completed your ${duration}h extended fast!`,
        message: "This is legendary. You've earned your place.",
        color: '#FFD700' // Gold
      };
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (!isRunning || !targetTime) return 0;
    const totalSeconds = hours * 3600;
    const elapsed = totalSeconds - timeLeft;
    return (elapsed / totalSeconds) * 100;
  };

  const getFastingLevel = () => {
    if (hours >= 14 && hours < 16) return 0;
    if (hours >= 16 && hours < 18) return 1;
    if (hours >= 18 && hours < 20) return 2;
    if (hours >= 20 && hours < 24) return 3;
    if (hours >= 24 && hours < 36) return 4;
    return 5;
  };

  const getBodyMode = () => {
    if (!isRunning || !targetTime) return 0;
    const elapsed = (hours * 3600) - timeLeft;
    const elapsedHours = elapsed / 3600;

    if (elapsedHours < 4) return 0;
    if (elapsedHours < 12) return 1;
    if (elapsedHours < 18) return 2;
    if (elapsedHours < 24) return 3;
    return 4;
  };

  const getProgressColor = () => {
    const progress = getProgress();
    if (progress < 25) return '#d32f2f';
    if (progress < 50) return '#f57c00';
    if (progress < 75) return '#388e3c';
    if (progress < 100) return '#1976d2';
    return '#7b1fa2';
  };

  const fastingLevels = [
    { range: '14-16h', label: 'Gentle', startHour: 14 },
    { range: '16-18h', label: 'Classic', startHour: 16 },
    { range: '18-20h', label: 'Intensive', startHour: 18 },
    { range: '20-24h', label: 'Warrior', startHour: 20 },
    { range: '24-36h', label: 'Monk', startHour: 24 },
    { range: '36+h', label: 'Extended', startHour: 36 }
  ];

  const bodyModes = [
    { range: '0-4h', label: 'Digesting' },
    { range: '4-12h', label: 'Getting ready' },
    { range: '12-18h', label: 'Fat burning' },
    { range: '18-24h', label: 'Cell renewal' },
    { range: '24+h', label: 'Deep healing' }
  ];

  const handleX = angle * (Math.PI / 180);
  const handleY = angle * (Math.PI / 180);
  const radius = 114;
  const handlePosX = 140 + Math.sin(handleX) * radius;
  const handlePosY = 140 - Math.cos(handleY) * radius;

  const circumference = 2 * Math.PI * 120;
  const progressOffset = circumference - (getProgress() / 100) * circumference;

  const styles = {
    container: {
      minHeight: '100vh',
      background: '#fafafa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      position: 'relative'
    },
    topBar: {
      position: 'absolute',
      top: '20px',
      left: '20px',
      right: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    syncIndicator: {
      fontSize: '12px',
      color: '#999',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    authButtons: {
      display: 'flex',
      gap: '12px'
    },
    button: {
      background: 'transparent',
      color: '#666',
      border: '2px solid #ddd',
      padding: '10px 24px',
      fontSize: '13px',
      borderRadius: '50px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontWeight: '500'
    },
    app: {
      display: 'flex',
      gap: '80px',
      maxWidth: '900px',
      alignItems: 'center',
      flexWrap: 'wrap',
      justifyContent: 'center'
    },
    timerSection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minWidth: '320px'
    },
    title: {
      fontSize: '24px',
      fontWeight: '300',
      color: '#555',
      marginBottom: '50px',
      letterSpacing: '1px',
      textShadow: '0 4px 12px rgba(0,0,0,0.18)',
      WebkitTextStroke: '0.8px rgba(85, 85, 85, 0.25)'
    },
    circleContainer: {
      position: 'relative',
      width: '280px',
      height: '280px',
      marginBottom: '40px'
    },
    hoursDisplay: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      pointerEvents: 'none'
    },
    hoursNumber: {
      fontSize: '72px',
      fontWeight: '300',
      color: '#333',
      lineHeight: '1'
    },
    hoursLabel: {
      fontSize: '18px',
      color: '#999',
      marginTop: '5px'
    },
    handle: {
      position: 'absolute',
      width: '20px',
      height: '20px',
      background: '#d32f2f',
      borderRadius: '50%',
      boxShadow: '0 2px 4px rgba(211, 47, 47, 0.25)',
      touchAction: 'none',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none'
    },
    startButton: {
      background: '#333',
      color: 'white',
      border: 'none',
      padding: '16px 60px',
      fontSize: '16px',
      borderRadius: '50px',
      letterSpacing: '1px',
      cursor: 'pointer',
      transition: 'background 0.2s'
    },
    countdownDisplay: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      pointerEvents: 'none'
    },
    countdownTime: {
      fontSize: '48px',
      fontWeight: '300',
      color: '#333',
      marginBottom: '8px'
    },
    countdownLabel: {
      fontSize: '14px',
      color: '#999'
    },
    controls: {
      display: 'flex',
      gap: '16px',
      justifyContent: 'center'
    },
    controlButton: {
      background: 'transparent',
      color: '#666',
      border: '2px solid #ddd',
      padding: '12px 32px',
      fontSize: '14px',
      borderRadius: '50px',
      letterSpacing: '0.5px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    infoSection: {
      minWidth: '240px'
    },
    infoTitle: {
      fontSize: '12px',
      fontWeight: '500',
      letterSpacing: '2px',
      color: '#aaa',
      marginBottom: '24px',
      textTransform: 'uppercase',
      position: 'relative',
      paddingBottom: '12px'
    },
    infoTitleLine: {
      position: 'absolute',
      bottom: '0',
      left: '0',
      width: '140%',
      height: '1px',
      background: '#e0e0e0'
    },
    infoList: {
      listStyle: 'none',
      padding: '0',
      margin: '0'
    },
    infoItem: {
      padding: '12px 0',
      fontSize: '15px',
      transition: 'color 0.2s',
      lineHeight: '1.6',
      cursor: 'pointer'
    },
    infoHours: {
      display: 'inline-block',
      minWidth: '80px',
      fontWeight: '500'
    },
    loginModal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    loginCard: {
      background: 'white',
      padding: '40px',
      borderRadius: '12px',
      maxWidth: '400px',
      width: '90%',
      textAlign: 'center'
    },
    loginTitle: {
      fontSize: '24px',
      fontWeight: '300',
      marginBottom: '12px',
      color: '#333'
    },
    loginSubtitle: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '30px',
      lineHeight: '1.6'
    },
    loginInput: {
      width: '100%',
      padding: '16px',
      fontSize: '16px',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      marginBottom: '16px',
      outline: 'none'
    },
    loginButton: {
      width: '100%',
      padding: '16px',
      fontSize: '16px',
      background: '#333',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      marginBottom: '12px'
    },
    loginCancel: {
      background: 'transparent',
      color: '#666',
      border: 'none',
      padding: '12px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    loginMessage: {
      marginTop: '16px',
      padding: '12px',
      borderRadius: '6px',
      fontSize: '14px'
    }
  };

  return (
    <div style={styles.container}>
      {/* CELEBRATION SCREEN - Fullscreen overlay when fast completes */}
      {showCelebration && completedFastData && (() => {
        const content = getCelebrationContent(completedFastData.duration);
        return (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            animation: 'fadeIn 0.3s ease'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '50px 40px',
              maxWidth: '500px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}>
              {/* Color Bar at top */}
              <div style={{
                height: '4px',
                background: content.color,
                marginBottom: '40px',
                borderRadius: '2px'
              }} />
              
              {/* Title */}
              <h1 style={{
                fontSize: '32px',
                fontWeight: '300',
                color: '#333',
                margin: '0 0 16px 0',
                letterSpacing: '1px'
              }}>
                {content.title}
              </h1>
              
              {/* Subtitle */}
              <p style={{
                fontSize: '18px',
                color: '#666',
                margin: '0 0 12px 0',
                fontWeight: '400'
              }}>
                {content.subtitle}
              </p>
              
              {/* Message */}
              <p style={{
                fontSize: '15px',
                color: '#999',
                margin: '0 0 30px 0',
                fontStyle: 'italic',
                lineHeight: '1.6'
              }}>
                {content.message}
              </p>
              
              {/* Divider */}
              <div style={{
                height: '1px',
                background: '#e0e0e0',
                margin: '30px 0'
              }} />
              
              {/* Stats */}
              <div style={{
                textAlign: 'left',
                marginBottom: '30px',
                fontSize: '14px',
                color: '#666',
                lineHeight: '2',
                background: '#f9f9f9',
                padding: '20px',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#999' }}>Started</span>
                  <span style={{ fontWeight: '500', color: '#333' }}>
                    {completedFastData.startTime.toLocaleString('en-US', { 
                      weekday: 'short', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#999' }}>Ended</span>
                  <span style={{ fontWeight: '500', color: '#333' }}>
                    {completedFastData.endTime.toLocaleString('en-US', { 
                      weekday: 'short', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#999' }}>Duration</span>
                  <span style={{ fontWeight: '600', color: content.color }}>
                    {completedFastData.duration} {completedFastData.unit}
                  </span>
                </div>
              </div>
              
              {/* Divider */}
              <div style={{
                height: '1px',
                background: '#e0e0e0',
                margin: '30px 0'
              }} />
              
              {/* Question */}
              <p style={{
                fontSize: '15px',
                color: '#666',
                marginBottom: '20px',
                fontWeight: '500'
              }}>
                What's next?
              </p>
              
              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <button
                  onClick={handleContinueFasting}
                  style={{
                    padding: '16px',
                    fontSize: '15px',
                    fontWeight: '500',
                    background: content.color,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    letterSpacing: '0.5px'
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.target.style.opacity = '1'}
                >
                  Continue Fasting (Extended)
                </button>
                
                <button
                  onClick={handleStopFasting}
                  style={{
                    padding: '16px',
                    fontSize: '15px',
                    fontWeight: '500',
                    background: '#333',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    letterSpacing: '0.5px'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#555'}
                  onMouseLeave={(e) => e.target.style.background = '#333'}
                >
                  {user ? 'Stop & Save' : 'Stop Fasting'}
                </button>
                
                <button
                  onClick={handleStartNewFast}
                  style={{
                    padding: '16px',
                    fontSize: '15px',
                    fontWeight: '500',
                    background: 'transparent',
                    color: '#666',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    letterSpacing: '0.5px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = '#999';
                    e.target.style.color = '#333';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.color = '#666';
                  }}
                >
                  Start New Fast
                </button>
              </div>

              {/* Sign-in hint for non-logged users */}
              {!user && (
                <div style={{
                  marginTop: '20px',
                  padding: '12px 16px',
                  background: '#F0F7FF',
                  border: '1px solid #B3D9FF',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#666',
                  textAlign: 'center',
                  lineHeight: '1.5'
                }}>
                  💡 <strong>Sign in</strong> to save your progress and track stats!
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* AUTH ERROR BANNER */}
      {authError && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: '#FFE5E5',
          border: '1px solid #FF6B6B',
          color: '#C92A2A',
          padding: '12px 16px',
          textAlign: 'center',
          fontSize: '14px',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ flex: 1 }}>
            <strong>Authentication Error:</strong> {
              authError.type === 'otp_expired' 
                ? 'Email link expired. Please request a new one.' 
                : authError.description || 'Please try signing in again.'
            }
          </div>
          <button
            onClick={() => setShowLogin(true)}
            style={{
              background: '#C92A2A',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '13px',
              cursor: 'pointer',
              marginLeft: '12px'
            }}
          >
            Sign In
          </button>
        </div>
      )}

      {/* TEST MODE INDICATOR */}
      {TEST_MODE && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: '#FF4444',
          color: 'white',
          padding: '8px',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 9999
        }}>
          🧪 TEST MODE: Timer uses SECONDS instead of HOURS
        </div>
      )}
      
      <div style={styles.topBar}>
        <div style={styles.syncIndicator}>
          {user && (
            <>
              <span>{syncing ? '⏳' : '✓'}</span>
              <span>{syncing ? 'Syncing...' : 'Synced'}</span>
            </>
          )}
        </div>

        <div style={styles.authButtons}>
          {user ? (
            <button
              onClick={signOut}
              style={styles.button}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#999';
                e.currentTarget.style.color = '#333';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#ddd';
                e.currentTarget.style.color = '#666';
              }}
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              style={styles.button}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#999';
                e.currentTarget.style.color = '#333';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#ddd';
                e.currentTarget.style.color = '#666';
              }}
            >
              Sign in to sync
            </button>
          )}
        </div>
      </div>

      <div style={styles.app}>
        <div style={styles.timerSection}>
          <h1 style={styles.title}>IF Timer</h1>

          {/* TEST MODE Banner */}
          {TEST_MODE && (
            <div style={{
              background: '#FF6B6B',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              🧪 TEST MODE: Using seconds instead of hours
            </div>
          )}

          {!isRunning ? (
            <>
              <div 
                ref={circleRef}
                style={styles.circleContainer}
              >
                <svg width="280" height="280" style={{ position: 'absolute', top: 0, left: 0 }}>
                  <circle
                    cx="140"
                    cy="140"
                    r="130"
                    fill="none"
                    stroke="#e0e0e0"
                    strokeWidth="3"
                  />
                  
                  <g transform="rotate(-90 140 140)">
                    <defs>
                      <linearGradient id="trailGradient" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#d32f2f" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#d32f2f" stopOpacity="0.4" />
                      </linearGradient>
                    </defs>
                    <circle
                      cx="140"
                      cy="140"
                      r="130"
                      fill="none"
                      stroke="url(#trailGradient)"
                      strokeWidth="3"
                      strokeDasharray={`${(angle / 360) * (2 * Math.PI * 130)} ${2 * Math.PI * 130}`}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dasharray 0.3s ease' }}
                    />
                  </g>
                </svg>
                
                <div
                  style={{
                    ...styles.handle,
                    left: `${handlePosX - 10}px`,
                    top: `${handlePosY - 10}px`,
                    cursor: isDragging ? 'grabbing' : 'grab'
                  }}
                  onMouseDown={handlePointerDown}
                  onTouchStart={handlePointerDown}
                />

                <div style={styles.hoursDisplay}>
                  <div style={styles.hoursNumber}>{hours}</div>
                  <div style={styles.hoursLabel}>{TIME_UNIT}</div>
                </div>
              </div>

              {/* Notification Info Banner - only show if permission not granted */}
              {typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default' && (
                <div style={{
                  background: '#FFF9E6',
                  border: '1px solid #FFE066',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  fontSize: '13px',
                  color: '#666',
                  textAlign: 'center',
                  lineHeight: '1.5',
                  maxWidth: '320px'
                }}>
                  🔔 <strong>Get notified</strong> when your fast completes!<br/>
                  <span style={{ fontSize: '12px' }}>We'll ask for permission when you start</span>
                </div>
              )}

              <button
                onClick={startTimer}
                style={styles.startButton}
                onMouseEnter={(e) => e.target.style.background = '#555'}
                onMouseLeave={(e) => e.target.style.background = '#333'}
              >
                START
              </button>
            </>
          ) : (
            <>
              <div style={styles.circleContainer}>
                <svg width="280" height="280" style={{ transform: 'rotate(-90deg)' }}>
                  <circle
                    cx="140"
                    cy="140"
                    r="120"
                    fill="none"
                    stroke="#e0e0e0"
                    strokeWidth="8"
                  />
                  <circle
                    cx="140"
                    cy="140"
                    r="120"
                    fill="none"
                    stroke={getProgressColor()}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={progressOffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
                  />
                </svg>

                <div style={styles.countdownDisplay}>
                  {isExtended ? (
                    <>
                      {/* Extended Mode Display */}
                      <div style={{
                        fontSize: '14px',
                        color: '#4CAF50',
                        fontWeight: '600',
                        marginBottom: '8px',
                        letterSpacing: '0.5px'
                      }}>
                        {hours}{TEST_MODE ? 'sec' : 'h'} ✓ GOAL REACHED
                      </div>
                      <div style={styles.countdownTime}>
                        +{formatTime(timeLeft)}
                      </div>
                      <div style={{
                        ...styles.countdownLabel,
                        color: '#FF6B6B',
                        fontWeight: '600'
                      }}>
                        extended
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Normal Mode Display */}
                      <div style={styles.countdownTime}>{formatTime(timeLeft)}</div>
                      <div style={styles.countdownLabel}>remaining</div>
                    </>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <button
                  onClick={cancelTimer}
                  style={{
                    ...styles.controlButton,
                    background: 'transparent',
                    color: '#999',
                    border: '2px solid #e0e0e0',
                    padding: '12px 40px',
                    fontSize: '14px',
                    borderRadius: '50px',
                    letterSpacing: '0.5px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#d32f2f';
                    e.currentTarget.style.color = '#d32f2f';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e0e0e0';
                    e.currentTarget.style.color = '#999';
                  }}
                >
                  ✕ STOP FASTING
                </button>
              </div>
            </>
          )}
        </div>

        <div style={styles.infoSection}>
          <div style={styles.infoTitle}>
            {!isRunning ? 'Fasting Levels' : 'Body Mode'}
            <div style={styles.infoTitleLine} />
          </div>

          <ul style={styles.infoList}>
            {(!isRunning ? fastingLevels : bodyModes).map((item, index) => (
              <li
                key={index}
                style={{
                  ...styles.infoItem,
                  color: (!isRunning ? getFastingLevel() : getBodyMode()) === index ? '#333' : '#999',
                  fontWeight: (!isRunning ? getFastingLevel() : getBodyMode()) === index ? '500' : 'normal'
                }}
                onClick={() => !isRunning && item.startHour && handleLevelClick(item.startHour)}
                onMouseEnter={(e) => {
                  if (!isRunning && item.startHour) {
                    e.currentTarget.style.color = '#333';
                    e.currentTarget.style.fontWeight = '500';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isRunning && item.startHour && getFastingLevel() !== index) {
                    e.currentTarget.style.color = '#999';
                    e.currentTarget.style.fontWeight = 'normal';
                  }
                }}
              >
                <span style={styles.infoHours}>{item.range}</span>
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {showLogin && !user && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}

function LoginModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const { signInWithEmail } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Please enter your email');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await signInWithEmail(email);
      setSuccess(true);
      setMessage('');
      // No auto-close - user decides when to close
    } catch (error) {
      setSuccess(false);
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    card: {
      background: 'white',
      padding: '40px',
      borderRadius: '12px',
      maxWidth: '400px',
      width: '90%',
      textAlign: 'center'
    },
    title: {
      fontSize: '24px',
      fontWeight: '300',
      marginBottom: '12px',
      color: '#333'
    },
    subtitle: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '30px',
      lineHeight: '1.6'
    },
    input: {
      width: '100%',
      padding: '16px',
      fontSize: '16px',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      marginBottom: '16px',
      outline: 'none',
      boxSizing: 'border-box'
    },
    button: {
      width: '100%',
      padding: '16px',
      fontSize: '16px',
      background: '#333',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      marginBottom: '12px'
    },
    cancel: {
      background: 'transparent',
      color: '#666',
      border: 'none',
      padding: '12px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    message: {
      marginTop: '16px',
      padding: '12px',
      borderRadius: '6px',
      fontSize: '14px',
      background: message.includes('✅') ? '#e8f5e9' : '#ffebee',
      color: message.includes('✅') ? '#2e7d32' : '#c62828'
    }
  };

  return (
    <div style={styles.modal} onClick={onClose}>
      <div style={styles.card} onClick={(e) => e.stopPropagation()}>
        {!success ? (
          <>
            <h2 style={styles.title}>Sign in to sync</h2>
            <p style={styles.subtitle}>
              Enter your email to sync your timer<br />
              across all your devices. No password needed!
            </p>

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                style={styles.input}
              />

              <button
                type="submit"
                disabled={loading}
                style={styles.button}
              >
                {loading ? 'Sending...' : 'Send Magic Link'}
              </button>

              <button
                type="button"
                onClick={onClose}
                style={styles.cancel}
              >
                Cancel
              </button>
            </form>

            {message && (
              <div style={styles.message}>
                {message}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Success Screen */}
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📧</div>
            <h2 style={styles.title}>Check your inbox!</h2>
            <p style={{ 
              fontSize: '15px', 
              color: '#666', 
              lineHeight: '1.6',
              marginBottom: '8px'
            }}>
              We sent a magic link to<br />
              <strong style={{ color: '#333' }}>{email}</strong>
            </p>
            <p style={{ 
              fontSize: '14px', 
              color: '#999', 
              lineHeight: '1.6',
              marginBottom: '20px'
            }}>
              Click the link in the email to sign in.
            </p>

            {/* HIGHLIGHTED: Close tab instruction */}
            <div style={{
              background: '#FFF9E6',
              border: '2px solid #FFE066',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '24px'
            }}>
              <p style={{ 
                fontSize: '14px', 
                color: '#333',
                fontWeight: '600',
                margin: 0
              }}>
                ✓ You can close this tab now
              </p>
            </div>

            <button
              onClick={onClose}
              style={{
                ...styles.button,
                background: '#4CAF50'
              }}
            >
              Got it!
            </button>

            <p style={{ 
              fontSize: '12px', 
              color: '#999',
              marginTop: '16px'
            }}>
              💡 The link works on all your devices
            </p>
          </>
        )}
      </div>
    </div>
  );
}