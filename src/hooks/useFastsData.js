// hooks/useFastsData.js
import { useState, useEffect } from 'react';
import { loadFasts, calculateStatistics } from '../services/fastsService';

/**
 * Custom hook to load and manage fasts data
 * @param {string} userId - User ID
 * @returns {object} Fasts data and statistics
 */
export function useFastsData(userId) {
  const [fasts, setFasts] = useState([]);
  const [statistics, setStatistics] = useState({
    totalFasts: 0,
    totalHours: 0,
    longestFast: 0,
    currentStreak: 0,
    averageFast: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchFasts = async () => {
      try {
        setLoading(true);
        const data = await loadFasts(userId);
        setFasts(data);
        const stats = calculateStatistics(data);
        setStatistics(stats);
        setError(null);
      } catch (err) {
        console.error('Error fetching fasts:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFasts();
  }, [userId]);

  /**
   * Refresh fasts data
   */
  const refreshFasts = async () => {
    if (!userId) return;

    try {
      const data = await loadFasts(userId);
      setFasts(data);
      const stats = calculateStatistics(data);
      setStatistics(stats);
    } catch (err) {
      console.error('Error refreshing fasts:', err);
    }
  };

  return {
    fasts,
    statistics,
    loading,
    error,
    refreshFasts,
  };
}
