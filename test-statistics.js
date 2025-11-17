// Test script to verify statistics calculation
// Run with: node test-statistics.js

// Mock data
const testFasts = [
  { duration: 16.5, end_time: '2025-01-17T10:00:00Z' },
  { duration: 18.0, end_time: '2025-01-16T10:00:00Z' },
  { duration: 20.5, end_time: '2025-01-15T10:00:00Z' },
];

function calculateStatistics(fasts) {
  if (!fasts || fasts.length === 0) {
    return {
      totalFasts: 0,
      totalHours: 0,
      longestFast: 0,
      currentStreak: 0,
      averageFast: 0,
    };
  }

  const totalFasts = fasts.length;
  const totalHours = fasts.reduce((sum, fast) => sum + parseFloat(fast.duration || 0), 0);
  const longestFast = Math.max(...fasts.map(fast => parseFloat(fast.duration || 0)));
  const averageFast = totalHours / totalFasts;

  return {
    totalFasts,
    totalHours: Math.round(totalHours * 10) / 10,
    longestFast: Math.round(longestFast * 10) / 10,
    currentStreak: 0, // Simplified for testing
    averageFast: Math.round(averageFast * 10) / 10,
  };
}

console.log('🧪 Testing Statistics Calculation\n');
console.log('Test Data:');
testFasts.forEach((f, i) => {
  console.log(`  ${i+1}. Duration: ${f.duration}h`);
});

const stats = calculateStatistics(testFasts);

console.log('\n📊 Calculated Statistics:');
console.log(`  Total Fasts: ${stats.totalFasts}`);
console.log(`  Total Hours: ${stats.totalHours}h`);
console.log(`  Longest Fast: ${stats.longestFast}h`);
console.log(`  Average Fast: ${stats.averageFast}h`);

console.log('\n✅ Verification:');
const manualSum = 16.5 + 18.0 + 20.5;
console.log(`  Manual sum: ${manualSum}h`);
console.log(`  Calculated: ${stats.totalHours}h`);
console.log(`  Match: ${manualSum === stats.totalHours ? 'YES ✓' : 'NO ✗'}`);

console.log('\n🔍 Checking if Total Hours = Longest + Average:');
const wrongSum = stats.longestFast + stats.averageFast;
console.log(`  Longest (${stats.longestFast}) + Average (${stats.averageFast}) = ${wrongSum}h`);
console.log(`  Total Hours: ${stats.totalHours}h`);
console.log(`  Are they equal? ${wrongSum === stats.totalHours ? 'YES (BUG!)' : 'NO (Correct)'}`);
