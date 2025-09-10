const { spawn } = require('child_process');
const path = require('path');
const axios = require('axios');
const dotenv = require('dotenv');

const BACKEND_DIR = __dirname;
dotenv.config({ path: path.join(BACKEND_DIR, '.env') });

const API_BASE = process.env.API_HOST || 'http://localhost:4000';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function isServerUp() {
  try {
    const resp = await axios.get(`${API_BASE}/api/power-rankings`, { timeout: 2000 });
    return resp.status === 200;
  } catch (e) {
    return false;
  }
}

function startServerProcess() {
  const server = spawn('node', ['dist/index.js'], {
    cwd: BACKEND_DIR,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  server.stdout.on('data', (data) => {
    process.stdout.write(`[server] ${data}`);
  });
  server.stderr.on('data', (data) => {
    process.stderr.write(`[server] ${data}`);
  });

  return server;
}

async function waitForServerReady(timeoutMs = 15000) {
  const start = Date.now();
  let lastErr;
  while (Date.now() - start < timeoutMs) {
    if (await isServerUp()) return true;
    await sleep(500);
  }
  return false;
}

async function ensureServerRunning() {
  if (await isServerUp()) {
    return { server: null, started: false };
  }
  const server = startServerProcess();
  const ready = await waitForServerReady();
  if (!ready) {
    try { server.kill('SIGTERM'); } catch (_) {}
    throw new Error('Server did not become ready in time');
  }
  return { server, started: true };
}

async function main() {
  console.log(`Using API base: ${API_BASE}`);

  // Ensure server is running
  const { server, started } = await ensureServerRunning();
  if (started) console.log('Server started for tests');
  else console.log('Server already running, using existing');

  const client = axios.create({ baseURL: API_BASE, timeout: 10000 });

  try {
    // 1) GET current rankings
    const currentResp = await client.get('/api/power-rankings');
    if (!currentResp.data || !Array.isArray(currentResp.data.rankings)) {
      throw new Error('Invalid response from GET /api/power-rankings');
    }
    const currentRankings = currentResp.data.rankings;
    console.log(`GET /api/power-rankings -> teams: ${currentRankings.length}`);

    // Collect team IDs for submission
    const teamIds = currentRankings.map((r) => r.team.id);
    if (teamIds.length < 12) {
      throw new Error(`Expected at least 12 teams, found ${teamIds.length}`);
    }

    // 2) GET available weeks
    const weeksResp = await client.get('/api/power-rankings/weeks');
    const weeks = Array.isArray(weeksResp.data.weeks) ? weeksResp.data.weeks : [];
    console.log(`GET /api/power-rankings/weeks -> [${weeks.join(', ')}]`);
    const nextWeek = (weeks.length ? Math.max(...weeks) : 0) + 1;

    // 3) POST submit rankings for rasmus for nextWeek
    const rankingsToSubmit = teamIds.slice(0, 12).map((id, index) => ({
      teamId: id,
      rank: index + 1,
      comment: `Auto rank ${index + 1}`,
    }));
    const submitBody = { week: nextWeek, username: 'rasmus', rankings: rankingsToSubmit };
    const submitResp = await client.post('/api/power-rankings/submit', submitBody);
    console.log(`POST /api/power-rankings/submit -> ${submitResp.status} ${submitResp.data.message}`);

    // 4) GET week rankings
    const weekResp = await client.get(`/api/power-rankings/week/${nextWeek}`);
    if (!weekResp.data || !Array.isArray(weekResp.data.rankings)) {
      throw new Error('Invalid response from GET /api/power-rankings/week/:week');
    }
    console.log(`GET /api/power-rankings/week/${nextWeek} -> teams: ${weekResp.data.rankings.length}`);

    // 5) GET user rankings for week
    const userResp = await client.get(`/api/power-rankings/user/${nextWeek}`, { params: { username: 'rasmus' } });
    if (!userResp.data || !Array.isArray(userResp.data.userRankings)) {
      throw new Error('Invalid response from GET /api/power-rankings/user/:week');
    }
    const userRanks = userResp.data.userRankings;
    console.log(`GET /api/power-rankings/user/${nextWeek}?username=rasmus -> items: ${userRanks.length}`);
    if (userRanks.length !== 12) {
      throw new Error(`Expected 12 user rankings, got ${userRanks.length}`);
    }

    console.log('All powerranking endpoint checks passed');
  } finally {
    if (server) {
      try { server.kill('SIGTERM'); } catch (_) {}
      // Give it a moment to shut down
      await sleep(500);
    }
  }
}

main().catch((err) => {
  console.error('Powerranking endpoint checks failed:', err.message || err);
  process.exit(1);
});
