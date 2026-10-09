#!/usr/bin/env node
/**
 * i18n guardrails for the IDE. See I18N_PLAN.md.
 *
 *   node scripts/i18n-check.mjs            report mode: fails only on locale-file problems
 *   node scripts/i18n-check.mjs --strict   also fails when Thai text is found outside locale files
 *
 * Checks
 *   1. every key in src/locales/<code>/*.json exists in every locale with a non-empty string
 *      (the file name is the top-level namespace)
 *   2. every %{BKY_KB_...} reference in a block file has a message in that unit's
 *      locales/<code>.json for every locale (boards/<id>, plugins/<id>, src/blocks)
 *   3. Thai characters outside locale files, reported per file
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SUPPORTED = ['th', 'en']
const SCAN_DIRS = ['src', 'extensions', 'boards', 'plugins']
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', 'locales', 'js', 'static', '__pycache__'])
const SKIP_FILES = new Set(['maixvision.js'])
const SCAN_EXT = new Set(['.vue', '.js', '.mjs', '.ts'])
const THAI = /[฀-๿]/

// %{BKY_KB_...} inside JSON block definitions, and Blockly.Msg.KB_... /
// Blockly.Msg["KB_..."] lookups inside JS-defined blocks (appendField).
const BKY_REFS = [/%\{BKY_(KB_[A-Z0-9_]+)\}/g, /Blockly\.Msg(?:\.|\[["'])(KB_[A-Z0-9_]+)/g]
const strict = process.argv.includes('--strict')
const rel = file => path.relative(ROOT, file)

let failed = false
const fail = message => {
  failed = true
  console.error(`ERROR ${message}`)
}

function flatten(obj, prefix = '', out = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object') flatten(value, full, out)
    else out[full] = value
  }

  return out
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(full, out)
    } else if (!SKIP_FILES.has(entry.name) && !entry.name.endsWith('.min.js')) {
      out.push(full)
    }
  }

  return out
}

function listDirs(parent) {
  const full = path.join(ROOT, parent)
  if (!fs.existsSync(full)) return []

  return fs.readdirSync(full, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => path.join(full, e.name))
}

// ---------------------------------------------------------------- 1. key parity
const messages = {}
for (const code of SUPPORTED) {
  const dir = path.join(ROOT, 'src', 'locales', code)
  if (!fs.existsSync(dir)) {
    fail(`missing ${rel(dir)}/`)
    continue
  }

  // <namespace>.json or <namespace>__<part>.json; parts merge into one
  // namespace and must not define the same key twice.
  const flat = {}
  const owner = {}
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort()) {
    const match = file.match(/^([A-Za-z0-9-]+)(?:__[A-Za-z0-9-]+)?\.json$/)
    if (!match) {
      fail(`${rel(path.join(dir, file))}: file name must be <namespace>.json or <namespace>__<part>.json`)
      continue
    }
    let parsed
    try {
      parsed = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'))
    } catch (e) {
      fail(`${rel(path.join(dir, file))} is not valid JSON: ${e.message}`)
      continue
    }
    for (const [key, value] of Object.entries(flatten({ [match[1]]: parsed }))) {
      if (key in flat) fail(`${code}: "${key}" is defined in both ${owner[key]} and ${file}`)
      flat[key] = value
      owner[key] = file
    }
  }
  messages[code] = flat
}
const allKeys = new Set(Object.values(messages).flatMap(m => Object.keys(m)))
for (const [code, flat] of Object.entries(messages)) {
  for (const key of allKeys) {
    const value = flat[key]
    if (value === undefined) fail(`${code}.json is missing "${key}"`)
    else if (typeof value !== 'string' || value.trim() === '') fail(`${code}.json has an empty value for "${key}"`)
  }
}
console.log(`locale keys: ${allKeys.size} across ${Object.keys(messages).join(', ')}`)

// ------------------------------------------- 2. Blockly message references
// Units are the directories that own block files plus a locales/ folder
// holding <code>.json with { "KB_...": "..." } per language.
const units = [
  path.join(ROOT, 'src', 'blocks'),
  ...listDirs('boards'),
  ...listDirs('plugins'),
]
let refTotal = 0
for (const unit of units) {
  const blockDir = unit.endsWith(path.join('src', 'blocks')) ? unit : path.join(unit, 'blocks')
  if (!fs.existsSync(blockDir)) continue
  const refs = new Set()
  for (const file of fs.readdirSync(blockDir)) {
    if (!file.endsWith('.js')) continue
    const text = fs.readFileSync(path.join(blockDir, file), 'utf8')
    for (const pattern of BKY_REFS) {
      for (const match of text.matchAll(pattern)) refs.add(match[1])
    }
  }
  if (refs.size === 0) continue
  refTotal += refs.size
  for (const code of SUPPORTED) {
    const localeFile = path.join(unit, 'locales', `${code}.json`)
    if (!fs.existsSync(localeFile)) {
      fail(`${rel(unit)} references ${refs.size} KB_ messages but has no ${rel(localeFile)}`)
      continue
    }
    let table
    try {
      table = JSON.parse(fs.readFileSync(localeFile, 'utf8'))
    } catch (e) {
      fail(`${rel(localeFile)} is not valid JSON: ${e.message}`)
      continue
    }
    for (const key of refs) {
      if (typeof table[key] !== 'string' || table[key].trim() === '') {
        fail(`${rel(localeFile)} is missing "${key}"`)
      }
    }
  }
}
console.log(`Blockly message references checked: ${refTotal}`)

// ----------------------------------------------- 3. Thai outside locale files
const offenders = []
for (const dir of SCAN_DIRS) {
  for (const file of walk(path.join(ROOT, dir))) {
    if (!SCAN_EXT.has(path.extname(file))) continue
    const count = fs.readFileSync(file, 'utf8').split('\n').filter(line => THAI.test(line)).length
    if (count > 0) offenders.push([rel(file), count])
  }
}
offenders.sort((a, b) => b[1] - a[1])
if (offenders.length === 0) {
  console.log('no Thai text outside locale files')
} else {
  const lines = offenders.reduce((n, [, count]) => n + count, 0)
  console.log(`Thai text outside locale files: ${lines} lines in ${offenders.length} files${strict ? '' : ' (report only, use --strict to fail)'}`)
  for (const [file, count] of offenders.slice(0, 40)) console.log(`  ${String(count).padStart(4)}  ${file}`)
  if (offenders.length > 40) console.log(`  ... and ${offenders.length - 40} more files`)
  if (strict) fail('Thai text must live in locale files')
}

process.exit(failed ? 1 : 0)
