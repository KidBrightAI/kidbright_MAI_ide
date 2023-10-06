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
            if(this.cb){
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

  getAdb() {
    return this.adb;
  }
  
  getWriter() {
    return this.writer;
  }

  setWriter(writer) {
    this.writer = writer;
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
  