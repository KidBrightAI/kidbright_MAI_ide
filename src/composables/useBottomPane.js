import { ref, nextTick, onBeforeUnmount } from 'vue'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { CanvasAddon } from 'xterm-addon-canvas'

const DEFAULT_FOOTER_HEIGHT = 18

export function useBottomPane({ workspaceStore, boardStore, splitpanesRef, blocklyComp, footer, selectedMenu }) {
  const bottomPaneSize = ref(5)
  const bottomMinPaneSize = ref(5)
  const bottomMaxPaneSize = ref(80)
  const isSerialPanelOpen = ref(false)

  let terminal = null
  let fitAddon = null

  // Track the unsubscribe fn returned by the handler's attachOutput so
  // we can tear down cleanly on unmount and re-attach if the user moves
  // to another page and comes back (see SingletonShell docstring for the
  // broadcast-subscriber model).
  let unsubOutput = null
  let bridgedHandler = null

  const serialMonitorCallback = chunk => {
    if (terminal) {
      terminal.write(typeof chunk === 'string' ? chunk : new TextDecoder().decode(chunk))
    }
  }

  const serialMonitorWrite = data => {
    boardStore.handler?.writeInput(data)
  }

  const serialMonitorBridge = async () => {
    if (!(await boardStore.deviceConnect())) return
    const handler = boardStore.handler
    if (!handler || handler === bridgedHandler) return
    try {
      if (unsubOutput) { unsubOutput(); unsubOutput = null }
      unsubOutput = await handler.attachOutput(serialMonitorCallback)
      bridgedHandler = handler
    } catch (err) {
      console.error(err)
      serialMonitorCallback(`\r\nError bridging terminal: ${err.message}\r\n`)
    }
  }

  onBeforeUnmount(() => {
    if (unsubOutput) { unsubOutput(); unsubOutput = null }
    bridgedHandler = null
    try { terminal?.dispose() } catch (e) { /* noop */ }
  })

  const calculateMinBottomPlaneSize = () => {
    if (!splitpanesRef.value || !splitpanesRef.value.$el) return
    const minBottom = DEFAULT_FOOTER_HEIGHT / (splitpanesRef.value.$el.clientHeight / 100)
    bottomMinPaneSize.value = minBottom
    if (bottomPaneSize.value < minBottom) {
      bottomPaneSize.value = minBottom
    }
    if (selectedMenu.value === 4) {
      bottomMaxPaneSize.value = isSerialPanelOpen.value ? 80 : minBottom
      if (!isSerialPanelOpen.value) {
        bottomPaneSize.value = minBottom
      }
    } else {
      bottomMaxPaneSize.value = 0
      bottomPaneSize.value = 0
    }
  }

  const onResized = () => {
    calculateMinBottomPlaneSize()
    if (workspaceStore.currentBoard && selectedMenu.value === 4) {
      blocklyComp.value?.resizeWorkspace()
      nextTick(() => {
        setTimeout(() => {
          if (!footer.value || !footer.value.$refs.terminalDiv) return
          const footerHeight = footer.value.$el.clientHeight
          const serialMonitorHeight = footerHeight - DEFAULT_FOOTER_HEIGHT
          footer.value.$refs.terminalDiv.style.height = `${serialMonitorHeight}px`
          fitAddon?.fit()
        }, 500)
      })
    }
  }

  const onSerial = async () => {
    isSerialPanelOpen.value = !isSerialPanelOpen.value
    bottomPaneSize.value = isSerialPanelOpen.value ? 30 : bottomMinPaneSize.value
    if (isSerialPanelOpen.value) {
      await serialMonitorBridge()
    }
    // Closing the pane just hides UI — shell lifecycle belongs to the
    // handler (adb SingletonShell / ws socket), not to the pane.
    onResized()
  }

  const mountSerial = () => {
    if (!footer.value || !footer.value.$refs.terminalDiv) return
    terminal = new Terminal({
      cursorBlink: true,
      scrollback: 1000,
      tabStopWidth: 4,
      theme: { background: '#101214', foreground: '#ffffff' },
      fontFamily: 'monospace',
      fontSize: 14,
      lineHeight: 1,
      scrollOnWrite: true,
    })
    fitAddon = new FitAddon()
    terminal.loadAddon(fitAddon)
    terminal.loadAddon(new CanvasAddon())
    terminal.open(footer.value.$refs.terminalDiv)
    fitAddon.fit()
    terminal.write('\r\n')
    terminal.onData(serialMonitorWrite)
  }

  const resetTerminal = () => terminal?.reset()

  return {
    bottomPaneSize,
    bottomMinPaneSize,
    bottomMaxPaneSize,
    isSerialPanelOpen,
    serialMonitorBridge,
    onResized,
    onSerial,
    mountSerial,
    resetTerminal,
    calculateMinBottomPlaneSize,
  }
}
