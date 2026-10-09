import { createI18n } from 'vue-i18n'
import { en as vuetifyEn, th as vuetifyTh } from 'vuetify/locale'

// Messages live in src/locales/<code>/<namespace>.json: the file name is
// the top-level key (header.json -> header.*). A big namespace can be
// split into <namespace>__<part>.json files that are deep-merged, so
// dialog__project.json and dialog__import.json both feed dialog.*.
// See I18N_PLAN.md for the naming rules.
const localeFiles = import.meta.glob('@/locales/*/*.json', { eager: true })
const LOCALE_FILE = /\/locales\/([a-z]+)\/([A-Za-z0-9-]+)(?:__[A-Za-z0-9-]+)?\.json$/

function deepMerge(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      target[key] = deepMerge(target[key] && typeof target[key] === 'object' ? target[key] : {}, value)
    } else {
      target[key] = value
    }
  }

  return target
}

/**
 * Single source of truth for the UI language. See I18N_PLAN.md for
 * key naming, the per-phase plan and what must not be translated.
 *
 * The locale has to be known before Pinia exists and before Blockly
 * defines a single block (Blockly resolves %{BKY_...} from Blockly.Msg
 * when blocks are created), so it lives in localStorage under
 * LOCALE_STORAGE_KEY rather than in a persisted store. Switching
 * language persists the choice and reloads the page: the toolbox and
 * the board / plugin block scripts are built once at load time.
 */
export const SUPPORTED_LOCALES = ['th', 'en']
export const FALLBACK_LOCALE = 'en'
export const LOCALE_STORAGE_KEY = 'kbmai.locale'

/** Native-script names for the switcher; these are never translated. */
export const LOCALE_NAMES = { th: 'ไทย', en: 'English' } // i18n-ignore: native names

function loadMessages(code) {
  const messages = {}
  for (const [file, mod] of Object.entries(localeFiles).sort(([a], [b]) => a.localeCompare(b))) {
    const match = file.match(LOCALE_FILE)
    if (!match || match[1] !== code) continue
    messages[match[2]] = deepMerge(messages[match[2]] || {}, mod.default ?? mod)
  }

  return messages
}

export function getInitialLocale() {
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (SUPPORTED_LOCALES.includes(saved)) return saved
  } catch (e) {
    // Storage blocked (private mode, sandboxed iframe): use the browser language.
  }
  const browser = (typeof navigator !== 'undefined' && navigator.language) || ''

  return browser.toLowerCase().startsWith('th') ? 'th' : 'en'
}

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: getInitialLocale(),
  fallbackLocale: FALLBACK_LOCALE,
  messages: {
    th: { ...loadMessages('th'), $vuetify: vuetifyTh },
    en: { ...loadMessages('en'), $vuetify: vuetifyEn },
  },
  missingWarn: import.meta.env.DEV,
  fallbackWarn: false,
})

/** Current locale code, for modules that cannot call useI18n(). */
export const currentLocale = () => i18n.global.locale.value

/** Translate from plain JS modules (stores, engine, composables). */
export const t = (key, ...rest) => i18n.global.t(key, ...rest)

export function applyDocumentLang(locale = currentLocale()) {
  if (typeof document !== 'undefined') document.documentElement.lang = locale
}

/**
 * Persist and apply a locale. Returns true when it actually changed.
 * Callers that need Blockly or the toolbox to follow must reload.
 */
export function setLocale(locale) {
  if (!SUPPORTED_LOCALES.includes(locale)) return false
  const changed = locale !== currentLocale()
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch (e) {
    // Storage blocked: the choice lasts for this page only.
  }
  i18n.global.locale.value = locale
  applyDocumentLang(locale)

  return changed
}

/**
 * Resolve a metadata field that is either a plain string (legacy,
 * returned as-is) or a per-language object such as
 * { th: "...", en: "..." }. Board / plugin / extension descriptors go
 * through this so third-party plugins that never translated keep
 * working.
 */
export function localized(value, locale = currentLocale()) {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    return value[locale]
      ?? value[FALLBACK_LOCALE]
      ?? Object.values(value).find(v => typeof v === 'string')
      ?? ''
  }

  return String(value)
}

applyDocumentLang()
