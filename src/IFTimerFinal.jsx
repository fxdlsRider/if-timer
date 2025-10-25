// src/IFTimerFinal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from './supabaseClient';

export default function IFTimerFinal() {
  const { user, signOut } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  
  const [hours, setHours] = useState(16);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [targetTime, setTargetTime] = useState(null);
  const [pausedTimeLeft, setPausedTimeLeft] = useState(null);
  const [angle, setAngle] = useState(21.2);
  const [isDragging, setIsDragging] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const circleRef = useRef(null);
  const notificationShownRef = useRef(false);

  // Update current time every second for display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate time left based on target time
  const getTimeLeft = () => {
    if (!isRunning) return 0;
    if (isPaused && pausedTimeLeft !== null) return pausedTimeLeft;
    if (!targetTime) return 0;
    
    const remaining = Math.max(0, Math.floor((targetTime - currentTime) / 1000));
    return remaining;
  };

  const timeLeft = getTimeLeft();

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Show notification when timer completes
  useEffect(() => {
    if (isRunning && timeLeft === 0 && !notificationShownRef.current) {
      notificationShownRef.current = true;
      
      // Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('IF Timer Complete! 🎉', {
          body: `Your ${hours}h fast is complete! Great job!`,
          icon: '/favicon.ico',
          tag: 'if-timer-complete'
        });
      }

      // Reset timer
      setIsRunning(false);
      setIsPaused(false);
      setTargetTime(null);
      setPausedTimeLeft(null);
      
      // Reset notification flag after 5 seconds
      setTimeout(() => {
        notificationShownRef.current = false;
      }, 5000);
    }
  }, [isRunning, timeLeft, hours]);

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
        setIsPaused(state.isPaused || false);
        setTargetTime(state.targetTime || null);
        setPausedTimeLeft(state.pausedTimeLeft || null);
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
      isPaused,
      targetTime,
      pausedTimeLeft
    };
    localStorage.setItem('ifTimerState', JSON.stringify(state));
  }, [hours, angle, isRunning, isPaused, targetTime, pausedTimeLeft, user]);

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
        const now = Date.now();
        
        if (targetTimeMs && targetTimeMs > now && data.is_running && !data.is_paused) {
          // Timer is still running!
          setIsRunning(true);
          setIsPaused(false);
          setTargetTime(targetTimeMs);
          setPausedTimeLeft(null);
        } else if (data.is_paused && data.paused_time_left) {
          // Timer is paused
          setIsRunning(true);
          setIsPaused(true);
          setTargetTime(targetTimeMs);
          setPausedTimeLeft(data.paused_time_left);
        } else {
          // Timer completed or not started
          setIsRunning(false);
          setIsPaused(false);
          setTargetTime(null);
          setPausedTimeLeft(null);
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
            const now = Date.now();
            
            if (targetTimeMs && targetTimeMs > now && data.is_running && !data.is_paused) {
              // Timer is still running!
              setIsRunning(true);
              setIsPaused(false);
              setTargetTime(targetTimeMs);
              setPausedTimeLeft(null);
            } else if (data.is_paused && data.paused_time_left) {
              // Timer is paused
              setIsRunning(true);
              setIsPaused(true);
              setTargetTime(targetTimeMs);
              setPausedTimeLeft(data.paused_time_left);
            } else {
              // Timer completed or not started
              setIsRunning(false);
              setIsPaused(false);
              setTargetTime(null);
              setPausedTimeLeft(null);
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
          is_paused: isPaused,
          target_time: targetTime ? new Date(targetTime).toISOString() : null,
          paused_time_left: pausedTimeLeft
        }, {
          onConflict: 'user_id'  // IMPORTANT: Handle duplicate user_id
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
  }, [hours, angle, isRunning, isPaused, targetTime, pausedTimeLeft, user]);

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
    const now = Date.now();
    const target = now + (hours * 3600 * 1000);
    
    setTargetTime(target);
    setIsRunning(true);
    setIsPaused(false);
    setPausedTimeLeft(null);
    notificationShownRef.current = false;
  };

  const togglePause = () => {
    if (isPaused) {
      // Resume: calculate new target time
      const now = Date.now();
      const newTarget = now + (pausedTimeLeft * 1000);
      setTargetTime(newTarget);
      setIsPaused(false);
      setPausedTimeLeft(null);
    } else {
      // Pause: save current time left
      setPausedTimeLeft(timeLeft);
      setIsPaused(true);
    }
  };

  const cancelTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTargetTime(null);
    setPausedTimeLeft(null);
    notificationShownRef.current = false;
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
                  <div style={styles.hoursLabel}>hours</div>
                </div>
              </div>

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
                  <div style={styles.countdownTime}>{formatTime(timeLeft)}</div>
                  <div style={styles.countdownLabel}>remaining</div>
                </div>
              </div>

              <div style={styles.controls}>
                <button
                  onClick={togglePause}
                  style={styles.controlButton}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#999';
                    e.currentTarget.style.color = '#333';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#ddd';
                    e.currentTarget.style.color = '#666';
                  }}
                >
                  {isPaused ? '▶' : '⏸'} {isPaused ? 'RESUME' : 'PAUSE'}
                </button>
                <button
                  onClick={cancelTimer}
                  style={styles.controlButton}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#999';
                    e.currentTarget.style.color = '#333';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#ddd';
                    e.currentTarget.style.color = '#666';
                  }}
                >
                  ✕ CANCEL
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
      setMessage('✅ Check your email for the magic link!');
      setEmail('');
    } catch (error) {
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
      </div>
    </div>
  );
}