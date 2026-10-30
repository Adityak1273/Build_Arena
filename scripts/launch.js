// AutoForge v1.8 Unified Node.js Launcher
import { spawn } from 'child_process';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

function checkHealth() {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:4000/api/health', (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(800, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function main() {
  console.log('===================================================');
  console.log('   🚀 AUTOFORGE ONE-CLICK LOCAL SYSTEM LAUNCHER    ');
  console.log('===================================================\n');

  // Check if server is running on port 4000
  const isHealthy = await checkHealth();
  let serverProc = null;

  if (!isHealthy) {
    console.log('📦 Starting AutoForge Runtime Server (port 4000)...');
    const isWindows = process.platform === 'win32';
    const npxCmd = isWindows ? 'npx.cmd' : 'npx';
    serverProc = spawn(npxCmd, ['tsx', 'src/runtime/server.ts'], {
      cwd: rootDir,
      stdio: 'inherit',
      shell: true
    });

    const start = Date.now();
    let ready = false;
    while (Date.now() - start < 15000) {
      await new Promise((r) => setTimeout(r, 400));
      if (await checkHealth()) {
        console.log('✅ Runtime Server verified active on port 4000.\n');
        ready = true;
        break;
      }
    }
    if (!ready) {
      console.warn('⚠️ Runtime Server starting slowly, proceeding with Electron launch...');
    }
  } else {
    console.log('✅ Runtime Server is already healthy on port 4000.\n');
  }

  // Start Electron
  console.log('🖥️  Starting AutoForge Electron Browser...');
  const isWindows = process.platform === 'win32';
  const npmCmd = isWindows ? 'npm.cmd' : 'npm';
  const electronProc = spawn(npmCmd, ['start'], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true
  });

  electronProc.on('close', (code) => {
    console.log(`\n🛑 AutoForge closed (exit code ${code}). Cleaning up runtime...`);
    if (serverProc && serverProc.pid) {
      if (isWindows) {
        spawn('taskkill', ['/pid', serverProc.pid.toString(), '/f', '/t']);
      } else {
        serverProc.kill('SIGTERM');
      }
    }
    process.exit(code || 0);
  });
}

main().catch(console.error);
