import React, { useState, useEffect, useRef } from 'react';

export default function IFTimerMinimal() {
  const [hours, setHours] = useState(14);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [angle, setAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const circleRef = useRef(null);

  // Timer countdown
  useEffect(() => {
    let interval;
    if (isRunning && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsPaused(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused, timeLeft]);

  // Handle mouse/touch drag
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
    
    let newAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
    if (newAngle < 0) newAngle += 360;
    
    // Block ONLY the left side FROM START (180° to 360° when starting from 0°)
    // But allow going all the way around clockwise (0° -> 359°)
    // So only block if trying to START going left
    if (angle < 90 && newAngle > 270) {
      // At start area, trying to jump to left side - block
      return;
    }
    
    setAngle(newAngle);
    
    const hourRange = 34;
    const mappedHours = Math.round(14 + (newAngle / 360) * hourRange);
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

  const startTimer = () => {
    const totalSeconds = hours * 3600;
    setTimeLeft(totalSeconds);
    setIsRunning(true);
    setIsPaused(false);
    setStartTime(new Date());
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const cancelTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(0);
    setStartTime(null);
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (!startTime || timeLeft === 0) return 0;
    const totalSeconds = hours * 3600;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
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
    const elapsed = hours * 3600 - timeLeft;
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
    { range: '14-16h', label: 'Gentle' },
    { range: '16-18h', label: 'Classic' },
    { range: '18-20h', label: 'Intensive' },
    { range: '20-24h', label: 'Warrior' },
    { range: '24-36h', label: 'Monk' },
    { range: '36+h', label: 'Extended' }
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
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
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
      lineHeight: '1.6'
    },
    infoHours: {
      display: 'inline-block',
      minWidth: '80px',
      fontWeight: '500'
    }
  };

  return (
    <div style={styles.container}>
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
              >
                <span style={styles.infoHours}>{item.range}</span>
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}