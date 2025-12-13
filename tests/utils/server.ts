import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export function startNext() {
  const cmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  const child = spawn(cmd, ['run', 'start:next'], {
    cwd: path.resolve(__dirname, '..', '..'),
    stdio: 'inherit',
    env: { ...process.env, PORT: process.env.PORT || '4173' },
  })
  return child
}
