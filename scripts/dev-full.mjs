import { spawn } from 'node:child_process';
const isWin = process.platform === 'win32';
const npm = isWin ? 'npm.cmd' : 'npm';
const backend = spawn(npm, ['run','backend'], { stdio: 'inherit', shell: isWin });
const frontend = spawn(npm, ['run','dev'], { stdio: 'inherit', shell: isWin });
const stop = () => { backend.kill(); frontend.kill(); };
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
backend.on('exit', code => { if (code && code !== 0) frontend.kill(); });
