import fs from 'fs'
import path from 'path'

export function loadCompanionPrompt(): string {
  const filePath = path.join(process.cwd(), 'data', 'companionPrompt.txt')
  return fs.readFileSync(filePath, 'utf-8')
}