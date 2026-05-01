import { ref } from 'vue'

const DIALOG_NAMES = [
  'newProject',
  'selectBoard',
  'example',
  'plugin',
  'connectWifi',
  'newModel',
  'fileExplorer',
  'saveProject',
  'deployAsApp',
]

export function useDialogs() {
  const dialogs = ref(Object.fromEntries(DIALOG_NAMES.map(n => [n, false])))
  return { dialogs }
}
