import { toast } from "vue3-toastify";
import { useBoardStore } from "@/store/board";
import { Command, packMessage, unpackMessage } from "../helper";
import { ref } from "vue";

export class WebSocketHandler {
    constructor() {
        this.socket = null;
        this.boardStore = useBoardStore();
        this.eventListeners = new Map();
        this.heartbeatTimeout = null;
        this.connected = ref(false);
    }

    get isConnected() {
        return this.connected;
    }

    on(event, listener) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(listener);
    }

    emit(event, ...args) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(listener => listener(...args));
        }
    }

    isConnected() {
        return  this.connected && this.socket?.readyState === WebSocket.OPEN;
    }

    async connect(board) {
        if (!board.wsUrl) {
            toast.error("WebSocket URL is not configured for this board.");
            return false;
        }

        if (this.isConnected()) {
            return true;
        }

        return new Promise((resolve) => {
            this.socket = new WebSocket(board.wsUrl);
            this.socket.binaryType = "arraybuffer";

            this.socket.onopen = () => {
                console.log("WebSocket connected");
                const msg = packMessage(Command.Auth, "maixvision");
                this.socket.send(msg);
                this.startHeartbeat();
            };

            this.socket.onerror = (error) => {
                console.error("WebSocket error:", error);
                toast.error("ไม่สามารถเชื่อมต่อ WebSocket ได้");
                this.connected = false;
                this.cleanup();
                resolve(false);
            };

            this.socket.onclose = () => {
                console.log("WebSocket disconnected");
                toast.info("ตัดการเชื่อมต่อจากบอร์ด (WebSocket)");
                this.connected = false;
                this.cleanup();
                this.boardStore.deviceDisconnect();
            };

            this.socket.onmessage = (event) => {
                this.resetHeartbeat();
                const res = unpackMessage(event.data);
                if (!res) {
                    console.error("unpack message failed");
                    return;
                }
                this.handleCommand(res.cmd, res.content, resolve);
            };
        });
    }

    handleCommand(cmd, content, connectResolve) {
        switch (cmd) {
            case Command.AuthAck: {
                const isSuccess = content[0] === 1;
                if (isSuccess) {
                     this.connected = true;
                    toast.success("เชื่อมต่อบอร์ดสำเร็จ (WebSocket)");
                    this.socket.send(packMessage(Command.DeviceInfo, ""));
                    connectResolve(true);
                } else {
                    const errorMsg = new TextDecoder().decode(content.slice(1));
                    toast.error(`Connect device failed: ${errorMsg}`);
                     this.connected = false;
                    this.disconnect();
                    connectResolve(false);
                }
                break;
            }
            case Command.RunAck: {
                const isSuccess = content[0] === 1;
                const msg = isSuccess ? "Start running..." : `Device execute code failed: ${new TextDecoder().decode(content.slice(1))}`;
                isSuccess ? toast.info(msg) : toast.error(msg);
                this.emit('log', msg + '\n\n');
                break;
            }
            case Command.Output: {
                const data = new TextDecoder().decode(content);
                this.emit('log', data);
                break;
            }
            case Command.Img: {
                const type = content[0] === 1 ? "jpeg" : "png";
                const imageData = content.slice(1);
                this.emit('image', { type, data: imageData });
                break;
            }
            case Command.StopAck: {
                const isSuccess = content[0] === 1;
                const msg = isSuccess ? "Stop running success" : `Stop running failed: ${new TextDecoder().decode(content.slice(1))}`;
                isSuccess ? toast.success(msg) : toast.error(msg);
                this.emit('log', msg + '\n');
                break;
            }
            case Command.Finish: {
                const isSuccess = content.slice(0, 4).every((a) => a === 0);
                let msg;
                if (isSuccess) {
                    msg = "\nProgram exited\n\n";
                } else {
                    const view = new DataView(content.slice(0, 4).buffer, 0);
                    const code = view.getUint32(0, true);
                    const err = new TextDecoder().decode(content.slice(4));
                    msg = `\nProgram exit failed. exit code: ${code}. ${err ? "msg: " + err : ""}\n\n`;
                }
                this.emit('finish', msg);
                this.emit('log', msg);
                break;
            }
            case Command.Msg: {
                const msg = new TextDecoder().decode(content);
                this.emit('log', msg);
                break;
            }
            case Command.Heartbeat:
                this.socket?.send(packMessage(Command.Heartbeat, ""));
                break;
            case Command.DeviceInfoAck: {
                const deviceInfo = JSON.parse(new TextDecoder().decode(content));
                //this.boardStore.setBoardInfo(deviceInfo);
                console.log("Device Info:", deviceInfo);
                break;
            }
            default:
                console.log("Unhandled command: ", cmd);
                break;
        }
    }

    startHeartbeat() {
        this.stopHeartbeat();
        this.heartbeatTimeout = setTimeout(() => {
            console.log("WebSocket timeout. Closing connection.");
            toast.error("การเชื่อมต่อหมดเวลา (WebSocket)");
             this.connected = false;
            this.disconnect();
        }, 20000); // 20 seconds timeout
    }

    resetHeartbeat() {
        clearTimeout(this.heartbeatTimeout);
        this.startHeartbeat();
    }

    stopHeartbeat() {
        if (this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
            this.heartbeatTimeout = null;
        }
    }

    cleanup() {
        this.stopHeartbeat();
         this.connected = false;
        this.socket = null;
    }

    async disconnect() {
        if (this.isConnected()) {
            this.socket.close();
        }
    this.cleanup();
    }

    async upload(code, writeStartup = false, fs) {
        if (!this.isConnected()) {
            toast.error("ไม่ได้เชื่อมต่อกับบอร์ด");
            return;
        }
        console.log("Uploading code via WebSocket...");
    const msg = packMessage(Command.Run, code);
    this.socket.send(msg);
    toast.info("กำลังรันโค้ด...");
    }

    async stop() {
        if (!this.isConnected()) {
            toast.error("ไม่ได้เชื่อมต่อกับบอร์ด");
            return;
        }
        const msg = packMessage(Command.Stop, "");
        this.socket.send(msg);
    }

    async listDir(path) {
        toast.warn("listDir is not implemented for WebSocket protocol yet.");
        return [];
    }

    async deleteFileOrFolder(path) {
        toast.warn("deleteFileOrFolder is not implemented for WebSocket protocol yet.");
    }

    async rebootBoard() {
        toast.warn("rebootBoard is not implemented for WebSocket protocol yet.");
    }
}
