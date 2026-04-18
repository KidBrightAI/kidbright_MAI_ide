// Shared on-device path convention. Both boards in this repo deploy user
// code and downloaded models under /root/app and /root/model respectively,
// so the protocol layers (web-adb, websocket-shell) and ModelFormat.remoteDir
// read the constant instead of repeating the literal string. If a future
// board uses a different layout, move these into `boards/*/index.js` and
// pass the active board in via context.

export const BOARD_APP_DIR = "/root/app"
export const BOARD_MODEL_DIR = "/root/model"

export function appPath(name = "") {
  return name ? `${BOARD_APP_DIR}/${name}` : BOARD_APP_DIR
}

export function modelPath(name = "") {
  return name ? `${BOARD_MODEL_DIR}/${name}` : BOARD_MODEL_DIR
}
