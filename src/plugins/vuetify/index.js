import { createVuetify } from 'vuetify'
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n'
import { useI18n } from 'vue-i18n'
import { i18n } from '@/plugins/i18n'
import defaults from './defaults'
import { icons } from './icons'
import theme from './theme'

// Styles
import '@core/scss/libs/vuetify/index.scss'
import 'vuetify/styles'
export default createVuetify({
  defaults,
  icons,
  theme,

  // Pagination, data-table, file-input and friends read $vuetify.* from
  // the same vue-i18n instance the app uses (messages come from
  // vuetify/locale, merged in src/plugins/i18n.js).
  locale: {
    adapter: createVueI18nAdapter({ i18n, useI18n }),
  },
})
