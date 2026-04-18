import { ref, nextTick } from 'vue'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { CanvasAddon } from 'xterm-addon-canvas'
import SingletonShell from '@/engine/SingletonShell'
import WebSocketShell from '@/engine/WebSocketShell'

const DEFAULT_FOOTER_HEIGHT = 18
const WS_PROTOCOLS = ['websocket', 'websocket-shell']

export function useBottomPane({ workspaceStore, boardStore, splitpanesRef, blocklyComp, footer, selectedMenu }) {
  const adb_shell = ref(null)
  const ws_shell = ref(null)
  const bottomPaneSize = ref(5)
  const bottomMinPaneSize = ref(5)
  const bottomMaxPaneSize = ref(80)
  const isSerialPanelOpen = ref(false)

  let terminal = null
  let fitAddon = null

  const serialMonitorCallback = chunk => {
    if (terminal) {
      terminal.write(typeof chunk === 'string' ? chunk : new TextDecoder().decode(chunk))
    }
  }

  const serialMonitorWrite = data => {
    const proto = workspaceStore.currentBoard.protocol
    if (proto === 'web-adb') {
      if (SingletonShell.hasWriter()) SingletonShell.write(data)
    } else if (WS_PROTOCOLS.includes(proto)) {
      if (ws_shell.value) ws_shell.value.exec(data)
    }
  }

  const serialMonitorBridge = async () => {
    const proto = workspaceStore.currentBoard.protocol
    if (proto === 'web-adb' && SingletonShell.hasWriter()) {
      console.log('ADB shell already connected.')
      return
    }
    const isWsShellConnected = ws_shell.value && (
      (typeof ws_shell.value.isConnected === 'function' && ws_shell.value.isConnected()) ||
      (typeof ws_shell.value.isConnected === 'boolean' && ws_shell.value.isConnected)
    )
    if (WS_PROTOCOLS.includes(proto) && isWsShellConnected) {
      console.log('WebSocket shell already connected.')
      return
    }

    if (!(await boardStore.deviceConnect())) return

    if (proto === 'web-adb') {
      try {
        adb_shell.value = SingletonShell.getInstance()
        adb_shell.value.setCallback(serialMonitorCallback)
        await SingletonShell.waitWriter()
      } catch (err) {
        console.error(err)
        serialMonitorCallback(`\r\nError creating adb shell: ${err.message}\r\n`)
      }
    } else if (WS_PROTOCOLS.includes(proto)) {
      try {
        if (proto === 'websocket-shell') {
          if (boardStore.handler) {
            ws_shell.value = boardStore.handler
            ws_shell.value.on('log', serialMonitorCallback)
            serialMonitorCallback('\r\nBridged to Board Shell ...\r\n')
          }
        } else {
          const ws_url = workspaceStore.currentBoard.wsShell || 'ws://10.150.36.1:5555'
          ws_shell.value = new WebSocketShell(ws_url, serialMonitorCallback)
          await ws_shell.value.connect()
          serialMonitorCallback(`\r\nWebSocket shell connected to ${ws_url}\r\n`)
        }
      } catch (err) {
        console.error(err)
        serialMonitorCallback(`\r\nError creating websocket shell: ${err.message}\r\n`)
      }
    }
  }

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
    } else if (workspaceStore.currentBoard.protocol === 'websocket') {
      if (ws_shell.value) {
        ws_shell.value.disconnect()
        ws_shell.value = null
      }
    }
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
