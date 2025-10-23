import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, RotateCcw, Globe } from 'lucide-react';

export default function IFTimer() {
  const [language, setLanguage] = useState('en');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [customHours, setCustomHours] = useState(16);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  const translations = {
    en: {
      title: 'IF Timer',
      subtitle: 'Simple Intermittent Fasting',
      selectProgram: 'Choose your fasting program',
      customDuration: 'Fasting duration in hours',
      hours: 'Hours',
      start: 'Start Fasting',
      pause: 'Pause',
      resume: 'Resume',
      reset: 'Reset',
      end: 'End',
      clock: 'o\'clock',
      completed: 'Congratulations! Fasting completed!',
      completedDesc: 'successfully completed',
      backToPrograms: '← Back to Programs',
      programs: [
        { id: '16-8', name: '16:8', hours: 16, desc: 'Classic - 16h fast, 8h eat' },
        { id: '18-6', name: '18:6', hours: 18, desc: 'Intensive - 18h fast, 6h eat' },
        { id: '20-4', name: '20:4', hours: 20, desc: 'Warrior - 20h fast, 4h eat' },
        { id: '14-10', name: '14:10', hours: 14, desc: 'Gentle - 14h fast, 10h eat' },
        { id: '23-1', name: '23:1 (OMAD)', hours: 23, desc: 'One Meal A Day' },
        { id: 'custom', name: 'Custom', hours: null, desc: 'Your own duration' }
      ]
    },
    de: {
      title: 'IF Timer',
      subtitle: 'Einfaches Intervall-Fasten',
      selectProgram: 'Wähle dein Fasten-Programm',
      customDuration: 'Fastendauer in Stunden',
      hours: 'Stunden',
      start: 'Fasten starten',
      pause: 'Pausieren',
      resume: 'Fortsetzen',
      reset: 'Zurücksetzen',
      end: 'Ende',
      clock: 'Uhr',
      completed: 'Glückwunsch! Fasten beendet!',
      completedDesc: 'erfolgreich abgeschlossen',
      backToPrograms: '← Zurück zu Programmen',
      programs: [
        { id: '16-8', name: '16:8', hours: 16, desc: 'Klassisch - 16h fasten, 8h essen' },
        { id: '18-6', name: '18:6', hours: 18, desc: 'Intensiv - 18h fasten, 6h essen' },
        { id: '20-4', name: '20:4', hours: 20, desc: 'Warrior - 20h fasten, 4h essen' },
        { id: '14-10', name: '14:10', hours: 14, desc: 'Sanft - 14h fasten, 10h essen' },
        { id: '23-1', name: '23:1 (OMAD)', hours: 23, desc: 'One Meal A Day' },
        { id: 'custom', name: 'Individuell', hours: null, desc: 'Eigene Fastendauer' }
      ]
    }
  };

  const t = translations[language];

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

  const startTimer = (hours) => {
    const totalSeconds = hours * 3600;
    setTimeLeft(totalSeconds);
    setIsRunning(true);
    setIsPaused(false);
    setStartTime(new Date());
  };

  const handleProgramSelect = (program) => {
    if (program.id === 'custom') {
      setSelectedProgram(program);
    } else {
      setSelectedProgram(program);
      startTimer(program.hours);
    }
  };

  const handleCustomStart = () => {
    startTimer(customHours);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(0);
    setStartTime(null);
    setSelectedProgram(null);
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (!startTime || timeLeft === 0) return 0;
    const hours = selectedProgram?.hours || customHours;
    const totalSeconds = hours * 3600;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };

  const getEndTime = () => {
    if (!startTime) return '';
    const hours = selectedProgram?.hours || customHours;
    const end = new Date(startTime.getTime() + hours * 3600 * 1000);
    return end.toLocaleTimeString(language === 'de' ? 'de-DE' : 'en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setLanguage(language === 'en' ? 'de' : 'en')}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-sm text-gray-700"
          >
            <Globe className="w-4 h-4" />
            {language === 'en' ? 'Deutsch' : 'English'}
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <Clock className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{t.title}</h1>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>

          {!isRunning && !selectedProgram ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">{t.selectProgram}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {t.programs.map(program => (
                  <button
                    key={program.id}
                    onClick={() => handleProgramSelect(program)}
                    className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl hover:from-indigo-100 hover:to-purple-100 transition-all border-2 border-transparent hover:border-indigo-300 text-left group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-xl text-indigo-600 mb-1">{program.name}</h3>
                        <p className="text-sm text-gray-600">{program.desc}</p>
                      </div>
                      <Play className="w-5 h-5 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : selectedProgram?.id === 'custom' && !isRunning ? (
            <div className="space-y-6">
              <button
                onClick={() => setSelectedProgram(null)}
                className="text-indigo-600 hover:text-indigo-700 font-medium mb-4"
              >
                {t.backToPrograms}
              </button>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t.customDuration}
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setCustomHours(Math.max(1, customHours - 1))}
                    className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 font-bold text-xl hover:bg-indigo-200 transition-colors"
                  >
                    -
                  </button>
                  <div className="flex-1 text-center">
                    <div className="text-5xl font-bold text-indigo-600">{customHours}</div>
                    <div className="text-sm text-gray-500 mt-1">{t.hours}</div>
                  </div>
                  <button
                    onClick={() => setCustomHours(Math.min(48, customHours + 1))}
                    className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 font-bold text-xl hover:bg-indigo-200 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[12, 14, 16, 18, 20, 24, 36, 48].map(h => (
                  <button
                    key={h}
                    onClick={() => setCustomHours(h)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      customHours === h
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>

              <button
                onClick={handleCustomStart}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                {t.start}
              </button>
            </div>
          ) : isRunning ? (
            <div className="space-y-6">
              <div className="text-center mb-4">
                <span className="inline-block px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                  {selectedProgram?.name || `${customHours}h Custom`}
                </span>
              </div>

              <div className="relative">
                <svg className="w-full h-64" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="85"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="85"
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="12"
                    strokeDasharray={`${2 * Math.PI * 85}`}
                    strokeDashoffset={`${2 * Math.PI * 85 * (1 - getProgress() / 100)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 100 100)"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-5xl font-bold text-gray-800">{formatTime(timeLeft)}</div>
                  <div className="text-sm text-gray-500 mt-2">
                    {timeLeft > 0 ? `${t.end}: ${getEndTime()} ${t.clock}` : t.completed}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={togglePause}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                  {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                  {isPaused ? t.resume : t.pause}
                </button>
                <button
                  onClick={resetTimer}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  {t.reset}
                </button>
              </div>

              {timeLeft === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <p className="text-green-800 font-semibold text-lg mb-2">
                    🎊 {t.completed}
                  </p>
                  <p className="text-green-700 text-sm">
                    {selectedProgram?.name || `${customHours}h`} {t.completedDesc}
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Stage 1 ✓ | Stage 2 ✓</p>
        </div>
      </div>
    </div>
  );
}