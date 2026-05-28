const { exec } = require('child_process');
const http = require('http');

// A simple utility to check if the server is running on port 3001
function checkServer() {
  return new Promise((resolve) => {
    http.get('http://localhost:3001/', (res) => {
      resolve(true);
    }).on('error', () => {
      resolve(false);
    });
  });
}

// Simple sleep helper
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  console.log('🚀 Starting FitSaaS API Backend server locally...');
  
  // Start the Fastify backend using ts-node inside apps/api
  // Cwd should be apps/api
  const serverProcess = exec('npm run dev', {
    cwd: 'C:/Users/nisha/Downloads/files/fitness-app/apps/api',
  });

  // Capture logs
  serverProcess.stdout.on('data', (data) => {
    // console.log('[Server stdout]:', data.trim());
  });
  serverProcess.stderr.on('data', (data) => {
    console.error('[Server stderr]:', data.trim());
  });

  // Wait for server to boot (up to 10 seconds)
  let serverReady = false;
  for (let i = 0; i < 20; i++) {
    serverReady = await checkServer();
    if (serverReady) break;
    await sleep(500);
  }

  if (!serverReady) {
    console.error('❌ Server failed to start on port 3001. Exiting.');
    serverProcess.kill();
    process.exit(1);
  }

  console.log('✅ Fastify API server successfully verified on http://localhost:3001!');
  console.log('🧪 Commencing automated integration suite...');

  const uniqueEmail = `test-user-${Date.now()}@example.com`;
  const password = 'securepassword123';
  const name = 'Test Runner';
  let token = '';
  let userId = '';
  let workoutId = '';

  try {
    // 1. Test /auth/register
    console.log('\n--- Test 1: User Registration ---');
    const regRes = await fetch('http://localhost:3001/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: uniqueEmail, password, name }),
    });
    
    if (!regRes.ok) throw new Error(`Registration failed: ${regRes.statusText}`);
    const regData = await regRes.json();
    console.log('✓ Registration successful!');
    console.log('  Email:', regData.user.email);
    console.log('  Name:', regData.user.name);
    
    token = regData.token;
    userId = regData.user.id;

    // 2. Test /auth/login
    console.log('\n--- Test 2: User Login ---');
    const loginRes = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: uniqueEmail, password }),
    });

    if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.statusText}`);
    const loginData = await loginRes.json();
    console.log('✓ Login successful, JWT token received!');

    // 3. Test /auth/me (Get profile)
    console.log('\n--- Test 3: Retrieve Initial Profile ---');
    const meRes = await fetch('http://localhost:3001/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!meRes.ok) throw new Error(`Get profile failed: ${meRes.statusText}`);
    const meData = await meRes.json();
    console.log('✓ Initial profile loaded!');
    console.log('  Gender (default):', meData.user.gender);
    console.log('  Cycle Length (default):', meData.user.cycleLength);

    // 4. Test /auth/profile (Update to Female with cycle details)
    console.log('\n--- Test 4: Update Profile to Female (Menstrual Cycle) ---');
    const lastPeriodStart = new Date().toISOString();
    const profileRes = await fetch('http://localhost:3001/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Test Runner Updated',
        gender: 'FEMALE',
        cycleLength: 30,
        lastPeriodStart,
      }),
    });

    if (!profileRes.ok) throw new Error(`Update profile failed: ${profileRes.statusText}`);
    const profileData = await profileRes.json();
    console.log('✓ Profile updated successfully!');
    console.log('  Gender:', profileData.user.gender);
    console.log('  Cycle Length:', profileData.user.cycleLength);
    console.log('  Last Period Start:', profileData.user.lastPeriodStart);

    // Assertions
    if (profileData.user.gender !== 'FEMALE') throw new Error('Assertion failed: Gender is not FEMALE');
    if (profileData.user.cycleLength !== 30) throw new Error('Assertion failed: Cycle length is not 30');

    // 5. Test /workouts (Log a session)
    console.log('\n--- Test 5: Log Workout Session ---');
    const workoutRes = await fetch('http://localhost:3001/workouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: 'Cable Crossover',
        duration: 45,
        notes: 'Targeting chest hypertrophy, felt strong.',
      }),
    });

    if (!workoutRes.ok) throw new Error(`Workout logging failed: ${workoutRes.statusText}`);
    const workoutData = await workoutRes.json();
    console.log('✓ Workout logged successfully!');
    console.log('  Title:', workoutData.workout.title);
    console.log('  Duration:', workoutData.workout.duration);
    workoutId = workoutData.workout.id;

    // 6. Test /workouts (Get workouts list)
    console.log('\n--- Test 6: Get Workouts List ---');
    const workoutsRes = await fetch('http://localhost:3001/workouts', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!workoutsRes.ok) throw new Error(`Get workouts list failed: ${workoutsRes.statusText}`);
    const workoutsData = await workoutsRes.json();
    console.log('✓ Workouts retrieved!');
    console.log('  Total workouts:', workoutsData.workouts.length);
    if (workoutsData.workouts.length !== 1) throw new Error('Assertion failed: Expected 1 logged workout');

    // 7. Test /workouts/:id (Delete workout)
    console.log('\n--- Test 7: Delete Logged Workout ---');
    const deleteRes = await fetch(`http://localhost:3001/workouts/${workoutId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!deleteRes.ok) throw new Error(`Delete failed: ${deleteRes.statusText}`);
    console.log('✓ Workout session successfully deleted!');

    // 8. Verify deletion
    const verifyRes = await fetch('http://localhost:3001/workouts', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const verifyData = await verifyRes.json();
    if (verifyData.workouts.length !== 0) throw new Error('Assertion failed: Expected 0 workouts after deletion');
    console.log('✓ Verified: Workouts list is empty.');

    console.log('\n=========================================');
    console.log('🎉 ALL INTEGRATION TESTS PASSED GLORIOUSLY!');
    console.log('=========================================');
  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED:', error.message);
  } finally {
    console.log('\nShutting down backend server process...');
    serverProcess.kill();
    process.exit(0);
  }
}

runTests();
