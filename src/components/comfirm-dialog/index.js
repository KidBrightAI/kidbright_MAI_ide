import { nanoid } from 'nanoid'
import { inject, reactive } from 'vue'
import { useTheme } from 'vuetify'
import ConfirmDialog from './ConfirmDialog.vue'
import { ConfirmDialogKey, mount } from './utils'


const plugin = {
  install(app, globalOptions) {
    const state = reactive({ promiseIds: new Map() })

    function mountDialog(options) {
      const promiseId = nanoid()

      mount(ConfirmDialog, {
        ...globalOptions?.confirmDialog ?? {},
        ...options,
        promiseId,
      }, app)

      return new Promise((resolve, reject) => {
        state.promiseIds.set(promiseId, {
          resolve,
          reject,
        })
      })
    }

    app.provide(ConfirmDialogKey, {
      mountDialog,
      state,
    })
  },
}

function useConfirm() {
  const dialog = inject(ConfirmDialogKey)
  const theme = useTheme()

  function confirm(options) {
    if (!dialog)
      throw new Error('Missing dialog instance')

    return dialog.mountDialog({
      theme: theme.name.value,
      ...options,
    })
  }

  return confirm
}

export {
  plugin as default,
  useConfirm,
}
