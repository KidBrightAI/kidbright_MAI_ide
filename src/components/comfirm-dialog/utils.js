import { createVNode, render } from 'vue'

// type ExtractProps<TComponent> =
//   TComponent extends new () => {
//     $props: infer P
//   }
//     ? Omit<P, keyof VNodeProps | keyof AllowedComponentProps>
//     : never

// export interface ConfirmDialogOptions {
//   title?: string
//   content?: string
//   contentComponent?: Component
//   confirmationText?: string
//   cancellationText?: string
//   dialogProps?: ExtractProps<typeof VDialog>
//   cardProps?: ExtractProps<typeof VCard>
//   cardTitleProps?: ExtractProps<typeof VCardTitle>
//   cardTextProps?: ExtractProps<typeof VCardText>
//   cardActionsProps?: ExtractProps<typeof VCardActions>
//   cancellationButtonProps?: ExtractProps<typeof VBtn>
//   confirmationButtonProps?: ExtractProps<typeof VBtn>
//   confirmationKeyword?: string
//   confirmationKeywordTextFieldProps?: ExtractProps<typeof VTextField>
//   theme?: string
// }

export function mount(component, props, app) {
  let el = null

  function destroy() {
    if (el)
      render(null, el)
    el = null
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    vNode = null
  }

  let vNode = createVNode(component, {
    ...props,
    destroy,
  })
  if (app && app._context)
    vNode.appContext = app._context
  if (el)
    render(vNode, el)
  else if (typeof document !== 'undefined')
    render(vNode, el = document.createElement('div'))

  // TODO: Remount with correct theme
  // if (import.meta.hot) {
  //   import.meta.hot.on('vite:beforeUpdate', () => {
  //     destroy()
  //   })
  // }

  return { vNode, destroy, el }
}

// export interface ConfirmDialogKeyValue {
//   mountDialog: (options: ConfirmDialogOptions) => Promise<undefined>
//   mountSnackbar: (options: SnackbarOptions) => void
//   state: {
//     'promiseIds': Map<string, {
//       resolve: ((value: unknown) => void)
//       reject: ((value: unknown) => void)
//     }>
//   }
// }

// export const ConfirmDialogKey = Symbol('ConfirmDialogKey') as InjectionKey<ConfirmDialogKeyValue>

export const ConfirmDialogKey = {
  mountDialog: null,
  state: {},
}
