<script setup>
import { computed, inject, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ConfirmDialogKey } from './utils'

const props = defineProps({
  title: {
    type: String,
    required: false,
    default: undefined,
  },
  content: {
    type: String,
    required: false,
    default: '',
  },
  confirmationKeyword: {
    type: String,
    required: false,
    default: "",
  },
  confirmationKeywordTextFieldProps: {
    type: Object,
    required: false,
    default: () => ({}),
  },
  confirmationText: {
    type: String,
    required: false,
    default: undefined,
  },
  cancellationText: {
    type: String,
    required: false,
    default: undefined,
  },
  dialogProps: {
    type: Object,
    required: false,
    default: () => ({}),
  },
  cardProps: {
    type: Object,
    required: false,
    default: () => ({}),
  },
  cardTitleProps: {
    type: Object,
    required: false,
    default: () => ({}),
  },
  cardTextProps: {
    type: Object,
    required: false,
    default: () => ({}),
  },
  cardActionsProps: {
    type: Object,
    required: false,
    default: () => ({}),
  },
  cancellationButtonProps: {
    type: Object,
    required: false,
    default: () => ({}),
  },
  confirmationButtonProps: {
    type: Object,
    required: false,
    default: () => ({}),
  },
  theme: {
    type: String,
    required: true,
  },
  destroy: {
    type: Function,
    required: true,
  },
  promiseId: {
    type: String,
    required: true,
  },
})

const dialog = inject(ConfirmDialogKey)
const { t } = useI18n()

// Prop defaults cannot call useI18n(), so the English defaults became
// locale-aware fallbacks here; a text passed by the caller still wins.
const finalTitle = computed(() => props.title ?? t('dialog.confirm.title'))
const finalConfirmationText = computed(() => props.confirmationText ?? t('common.ok'))
const finalCancellationText = computed(() => props.cancellationText ?? t('common.cancel'))
const isOpen = ref(true)
const textFieldInput = ref(null)
const textField = ref('')
function confirm() {
  dialog?.state.promiseIds.get(props.promiseId)?.resolve?.(undefined)
  isOpen.value = false
}
function cancel() {
  dialog?.state.promiseIds.get(props.promiseId)?.reject?.(undefined)
  isOpen.value = false
}
onMounted(() => {
  textFieldInput.value?.focus()
})

const confirmationButtonDisabled = computed(() => {
  if (!props.confirmationKeyword)
    return false
  
  return props.confirmationKeyword !== textField.value
})

const finalDialogProps = computed(() => {
  return {
    ...props.dialogProps,
    onAfterLeave() {
      props.dialogProps.onAfterLeave?.()
      dialog?.state.promiseIds.delete(props.promiseId)
      props.destroy()
    },
  }
})
</script>

<template>
  <VThemeProvider :theme="theme">
    <VDialog
      v-bind="finalDialogProps"
      v-model="isOpen"
    >
      <VCard v-bind="cardProps">
        <VCardTitle v-bind="cardTitleProps">
          {{ finalTitle }}
        </VCardTitle>
        <VCardText v-bind="cardTextProps">
          <template v-if="confirmationKeyword">
            <VTextField
              ref="textFieldInput"
              v-model="textField"
              v-bind="confirmationKeywordTextFieldProps"
              variant="underlined"
            />
          </template>
          <template v-else>
            {{ content }}
          </template>
        </VCardText>
        <VCardActions v-bind="cardActionsProps">
          <VSpacer />
          <VBtn
            v-bind="cancellationButtonProps"
            @click="cancel"
          >
            {{ finalCancellationText }}
          </VBtn>
          <VBtn
            color="primary"
            :disabled="confirmationButtonDisabled"
            v-bind="confirmationButtonProps"
            @click="confirm"
          >
            {{ finalConfirmationText }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VThemeProvider>
</template>
