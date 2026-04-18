import { toast } from 'vue3-toastify'

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
      const res = await workspaceStore.createNewProject(projectInfo)
      if (res) {
        toast.success('สร้างโปรเจคเสร็จเรียบร้อย')
        setTimeout(() => location.reload(), 1000)
      } else {
        toast.error('สร้างโปรเจคไม่สำเร็จ')
      }
    } catch (err) {
      toast.error(`มีข้อผิดพลาด: ${err.message}`)
    } finally {
      dialogs.value.newProject = false
      dialogs.value.selectBoard = false
    }
  }

  const newProjectConfirm = async () => {
    try {
      await confirm({
        title: 'ยืนยันการสร้างโปรเจค',
        content: 'ข้อมูลโปรเจคปัจจุบันจะถูกลบทั้งหมด คุณต้องการสร้างโปรเจคใหม่หรือไม่',
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
        title: 'ยืนยันการเปิดโปรเจค',
        content: 'ข้อมูลโปรเจคปัจจุบันจะถูกลบทั้งหมด คุณต้องการเปิดโปรเจคใหม่หรือไม่',
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
        title: 'ยืนยันการลบโปรเจค',
        content: 'ข้อมูลโปรเจคปัจจุบันจะถูกลบทั้งหมด คุณต้องการลบโปรเจคหรือไม่',
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
      toast.error('เลือกประเภทโมเดลไม่สำเร็จ')
    }
  }

  const onExampleOpen = async (mode, example) => {
    try {
      await confirm({
        title: 'Confirm open example',
        content: 'All code in this project will be deleted, please save first!',
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
