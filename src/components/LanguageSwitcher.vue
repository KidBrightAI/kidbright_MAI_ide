<script setup>
import { useI18n } from "vue-i18n"
import { LOCALE_NAMES, SUPPORTED_LOCALES, setLocale } from "@/plugins/i18n"

/**
 * Header control that switches the IDE language. setLocale() persists
 * the choice; the page then reloads because Blockly, the toolbox and
 * the board / plugin block scripts are all built from the active
 * locale at load time. The open project is persisted, so a reload
 * loses nothing.
 */
const { t, locale } = useI18n()

const choose = code => {
  if (!setLocale(code)) return
  window.location.reload()
}
</script>

<template>
  <VMenu location="bottom end">
    <template #activator="{ props }">
      <VBtn
        v-bind="props"
        variant="text"
        color="white"
        class="mx-1 text-none"
        prepend-icon="mdi-translate"
        :aria-label="t('common.language')"
      >
        {{ locale.toUpperCase() }}
      </VBtn>
    </template>
    <VList density="compact">
      <VListSubheader>{{ t('common.language') }}</VListSubheader>
      <VListItem
        v-for="code in SUPPORTED_LOCALES"
        :key="code"
        :active="code === locale"
        @click="choose(code)"
      >
        <VListItemTitle>{{ LOCALE_NAMES[code] }}</VListItemTitle>
      </VListItem>
    </VList>
  </VMenu>
</template>
