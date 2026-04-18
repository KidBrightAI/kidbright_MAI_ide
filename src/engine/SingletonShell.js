import { sleep } from "./helper.js"
import { isProxy, toRaw } from "vue"
import {
  AbortController,
  Consumable,
  WritableStream,
} from "@yume-chan/stream-extra"
import { encodeUtf8 } from "@yume-chan/adb"

/**
 * Process-scoped wrapper around the device's interactive shell.
 *
 * Multiple parts of the IDE listen to shell stdout at the same time —
 * the terminal bridge (bottom pane), the Wi-Fi scanner's reply parser,
 * one-shot command handlers, etc. The previous `setCallback` API let
 * each caller overwrite the current listener, which broke the terminal
 * whenever e.g. `AdbSoundCapture` mounted: its own debug callback
 * replaced the terminal's and never restored it.
 *
 * The new API is a broadcast Set. Each caller gets an unsubscribe
 * function from `onOutput(cb)` and is expected to call it on cleanup
 * (component unmount, scan complete, etc.). The pipe fans every stdout
 * chunk out to every current subscriber.
 */
export default class SingletonShell {
  constructor(adb) {
    this.adb = isProxy(adb) ? toRaw(adb) : adb
    this._subscribers = new Set()
    this.abortController = new AbortController()
    this.writer = null
    this.shell = null

    this.adb.subprocess.shell().then(shell => {
      this.shell = shell
      this.writer = shell.stdin.getWriter()
      shell.stdout.pipeTo(
        new WritableStream({
          write: chunk => {
            for (const cb of this._subscribers) {
              try { cb(chunk) } catch (e) { console.error("shell subscriber error:", e) }
            }
          },
        }),
        { signal: this.abortController.signal },
      )
    }).catch(err => console.error("shell init failed:", err))
  }

  static getInstance(adb) {
    if (!this._instance) {
      this._instance = new SingletonShell(adb)
    }
    return this._instance
  }

  /**
   * Abort the shell pipe, clear subscribers, null the singleton. Next
   * `getInstance(adb)` creates a fresh shell subprocess. Called from
   * WebAdbHandler.disconnect so a reconnect gets a clean pty.
   */
  static destroyInstance() {
    if (this._instance) {
      try { this._instance.abortController.abort() } catch (e) { /* noop */ }
      this._instance._subscribers.clear()
      this._instance = null
    }
  }

  static hasWriter() {
    return !!this._instance?.writer
  }

  static waitWriter() {
    return new Promise(async (resolve, reject) => {
      let retries = 10
      while (retries--) {
        if (this._instance?.writer) return resolve()
        await sleep(1000)
      }
      reject(new Error("shell is not ready"))
    })
  }

  static write(data) {
    if (this._instance?.writer) {
      const output = new Consumable(encodeUtf8(data))
      this._instance.writer.write(output)
    }
  }

  /**
   * Subscribe to stdout. Returns an unsubscribe function — callers must
   * invoke it on cleanup so listeners don't leak or shadow each other.
   */
  onOutput(cb) {
    this._subscribers.add(cb)
    return () => this._subscribers.delete(cb)
  }

  /** Remove a specific subscriber by reference. */
  offOutput(cb) {
    this._subscribers.delete(cb)
  }

  getAdb() {
    return this.adb
  }
}
