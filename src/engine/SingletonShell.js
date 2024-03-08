import { sleep } from "./helper.js";
import { isProxy , toRaw } from "vue";
import {
  AbortController,
  Consumable,
  WritableStream,
} from "@yume-chan/stream-extra";
import { encodeUtf8 } from "@yume-chan/adb";


export default class SingletonShell {
  constructor(adb, cb) {
    if(isProxy(adb)){
      this.adb = toRaw(adb);
    }else{
      this.adb = adb;
    }
    
    this.cb = cb;
    this.socketAbordController = null;    
    // kill existing shell  
    if(this.shell){
      this.socketAbordController.abort();
    }

    this.socketAbordController = new AbortController();    
    adb.subprocess.shell().then((shell) => {
      this.shell = shell;
      this.shell.stdout.pipeTo(
        new WritableStream({
          write: (chunk) => {
            if(Array.isArray(this.cb)){
              this.cb.forEach((cb) => {
                cb(chunk);
              });
            }else if(this.cb){
              this.cb(chunk);
            }
          },
        }),
        {
          signal: this.socketAbordController.signal,
        }
      );
      this.writer = this.shell.stdin.getWriter();
    }).catch((err) => {
      console.log(err);
    });
    console.log("----- shell -----");
  }
  
  static getInstance(adb, cb = null) {
    if (!this._instance) {
      this._instance = new SingletonShell(adb, cb);
    }
    return this._instance;
  }
  
  static write(data) {
    if(this._instance){
      const output = new Consumable(encodeUtf8(data));    
      this._instance.writer.write(output);
    }
  }
  static close() {
    if(this._instance){
      this._instance.socketAbordController.abort();
    }
  }
  static hasWriter() {
    if(this._instance && this._instance.writer){
      return true;
    }
    return false;
  }

  static waitWriter() {
    return new Promise(async (resolve, reject) => {
      let maxretry = 10;
      while(--maxretry) {
        if(this._instance && this._instance.writer){
          break;
        }
        await sleep(1000);
      }
      if(this._instance && this._instance.writer){
        resolve();
      }else{
        reject("shell is not ready");
      }
    });
  }

  getAdb() {
    return this.adb;
  }
  
  getWriter() {
    return this.writer;
  }

  setWriter(writer) {
    this.writer = writer;
  }
  
  static addCallback(cb) {
    if(this._instance){
      //check if cb is array
      if(Array.isArray(this._instance.cb)){
        this._instance.cb.push(cb);
      }else if(this._instance.cb){
        this._instance.cb = [this._instance.cb, cb];
      }      
    }
  }

  static removeLastCallback() {
    if(this._instance){
      if(Array.isArray(this._instance.cb)){
        this._instance.cb.pop();
      }else if(this._instance.cb){
        this._instance.cb = null;
      }
    }
  }

  setCallback(cb) {
    this.cb = cb;
  }

  clearCallback() {
    this.cb = null;
  }

  write(data) {
    this.writer.write(encodeUtf8(data));
  }
}
  