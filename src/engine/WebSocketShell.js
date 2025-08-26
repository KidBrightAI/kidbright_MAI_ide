
import { sleep } from "./helper.js";

export default class WebSocketShell {
  constructor(url, cb) {
    this.url = url;
    this.cb = cb;
    this.websocket = null;
    this.isConnected = false;
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.websocket = new WebSocket(this.url);
        this.websocket.binaryType = 'arraybuffer';

        this.websocket.onopen = (event) => {
          console.log("WebSocket connection opened:", event);
          this.isConnected = true;
          resolve();
        };

        this.websocket.onmessage = (event) => {
          if (this.cb) {
            if (Array.isArray(this.cb)) {
              this.cb.forEach((cb) => cb(event.data));
            } else {
              this.cb(event.data);
            }
          }
        };

        this.websocket.onclose = (event) => {
          console.log("WebSocket connection closed:", event);
          this.isConnected = false;
          this.websocket = null;
        };

        this.websocket.onerror = (error) => {
          console.error("WebSocket error:", error);
          this.isConnected = false;
          reject(error);
        };

      } catch (error) {
        console.error("Failed to create WebSocket:", error);
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.websocket) {
      this.websocket.close();
    }
  }

  exec(data) {
    if (this.isConnected && this.websocket) {
      this.websocket.send(data);
    } else {
      console.error("WebSocket is not connected.");
    }
  }
  
  waitConnection() {
    return new Promise(async (resolve, reject) => {
      let maxretry = 10;
      while(--maxretry) {
        if(this.isConnected){
          break;
        }
        await sleep(500);
      }
      if(this.isConnected){
        resolve();
      }else{
        reject("WebSocket is not ready");
      }
    });
  }

  addCallback(cb) {
    if (Array.isArray(this.cb)) {
      this.cb.push(cb);
    } else if (this.cb) {
      this.cb = [this.cb, cb];
    } else {
      this.cb = cb;
    }
  }

  removeLastCallback() {
    if (Array.isArray(this.cb)) {
      this.cb.pop();
    } else if (this.cb) {
      this.cb = null;
    }
  }

  setCallback(cb) {
    this.cb = cb;
  }

  clearCallback() {
    this.cb = null;
  }
}
