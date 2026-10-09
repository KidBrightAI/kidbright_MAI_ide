import { toast } from 'vue3-toastify'
import { t } from '@/plugins/i18n'
import { writePinToKMV } from '@/store/simulator'

export function useProjectActions({
  workspaceStore,
  confirm,
  router,
  blocklyComp,
  dialogs,
  selectedMenu,
  onResized,
}) {
  const createdProject = async projectInfo => {
    try {
      const boardVal = (projectInfo?.board === 'kidbright-mai-plus') ? 2 : 1
      try {
        localStorage.setItem('kmv_board_type', String(boardVal))
        sessionStorage.setItem('kmv_board_type', String(boardVal))
      } catch (e) {}

      try {
        writePinToKMV('BOARD', String(boardVal))
      } catch (e) {}

      const res = await workspaceStore.createNewProject(projectInfo)
      if (res) {
        toast.success(t('project.created'))
        setTimeout(() => location.reload(), 1000)
      } else {
        toast.error(t('project.createFailed'))
      }
    } catch (err) {
      toast.error(t('project.createError', { message: err.message }))
    } finally {
      dialogs.value.newProject = false
      dialogs.value.selectBoard = false
    }
  }

  const newProjectConfirm = async () => {
    try {
      await confirm({
        title: t('project.confirmNewTitle'),
        content: t('project.confirmNewText'),
        dialogProps: { width: 'auto' },
      })
      dialogs.value.selectBoard = true
    } catch (err) {
      // User cancelled
    }
  }

  const openProject = async () => {
    try {
      await confirm({
        title: t('project.confirmOpenTitle'),
        content: t('project.confirmOpenText'),
        dialogProps: { width: 'auto' },
      })
      if (await workspaceStore.openProjectFromZip()) {
        selectedMenu.value = 4
        blocklyComp.value.reload()
        onResized()
      }
    } catch (err) {
      // User cancelled
    }
  }

  const saveProject = async filename => {
    try {
      dialogs.value.saveProject = false
      await workspaceStore.saveProject('download', filename)
    } catch (err) {
      console.error(err)
    }
  }

  const deleteProject = async () => {
    try {
      await confirm({
        title: t('project.confirmDeleteTitle'),
        content: t('project.confirmDeleteText'),
        dialogProps: { width: 'auto' },
      })
      selectedMenu.value = 0
      await workspaceStore.deleteProject()
      onResized()
    } catch (err) {
      // User cancelled
    }
  }

  const selectProjectType = async selectedType => {
    dialogs.value.newModel = false
    if (await workspaceStore.selectProjectType(selectedType)) {
      router.push('/ai')
    } else {
      toast.error(t('project.selectModelTypeFailed'))
    }
  }

  const onExampleOpen = async (mode, example) => {
    try {
      await confirm({
        title: t('project.confirmExampleTitle'),
        content: t('project.confirmExampleText'),
        dialogProps: { width: 'auto' },
      })
      dialogs.value.example = false
      workspaceStore.switchMode(mode)
      if (mode === 'block') {
        workspaceStore.block = example.block
        blocklyComp.value.reload()
      } else if (mode === 'code') {
        workspaceStore.code = example.code
      }
      onResized()
    } catch (err) {
      // User cancelled
    }
  }

  const onAiOpen = async () => {
    if (!workspaceStore.projectType) {
      dialogs.value.newModel = true
    } else {
      router.push('/ai')
    }
  }

  return {
    createdProject,
    newProjectConfirm,
    openProject,
    saveProject,
    deleteProject,
    selectProjectType,
    onExampleOpen,
    onAiOpen,
  }
}
