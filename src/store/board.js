import { findIncludeModuleNameInCode, sleep } from "@/engine/helper";
import { defineStore } from "pinia";
import { toast } from "vue3-toastify";
import { useWorkspaceStore } from "./workspace";

import {
  WrapConsumableStream,
  WrapReadableStream,
  Consumable,
  InspectStream,
  WritableStream,
} from "@yume-chan/stream-extra";

import { Adb, AdbDaemonTransport, LinuxFileType, encodeUtf8  } from "@yume-chan/adb";
import AdbWebCredentialStore from "@yume-chan/adb-credential-web";
import { AdbDaemonWebUsbDeviceManager } from "@yume-chan/adb-daemon-webusb";
import { isProxy, toRaw } from "vue";
import SingletonShell from "../engine/SingletonShell";


export const useBoardStore = defineStore({
  id: "board",
  state: () => {
    return {
      isElectron: false,      
      firmwareUpdateMode: false,
      uploading: false,
    }
  },

  actions: {
    isConnected(){
      return this.$adb.transport != null;
    },
    async deviceConnect(){
      console.log("deviceConnect");
      let currentBoard = useWorkspaceStore().currentBoard;
      const Manager = AdbDaemonWebUsbDeviceManager.BROWSER;
      if (!Manager) {
        toast.error("Your browser doesn't support WebUSB");
        return;
      }
      let device = null;
      if(!this.$adb.transport){
        const devices = await Manager.getDevices();        
        if (devices.length === 0) {
          // no available devices are being registered
          toast.warning("ยังไม่เคยขอสิทธิ์ใช้งาน USB หรือไม่ได้เสียบบอร์ดเข้ากับคอมพิวเตอร์มาก่อน")
          toast.warning("กรุณาเลือกอุปกรณ์ USB ที่ต้องการเชื่อมต่อ")
          //toast.error("No device found");
          //return;
        }
        if (devices.length > 0) {
          for (let port of devices) {
            if (port.raw.productId == currentBoard.usb[0].productId && 
                port.raw.vendorId == currentBoard.usb[0].vendorId) {
              device = port;
              break;
            }
          }
        }
        if(!device){
          device = await Manager.requestDevice();
          if (!device) {
            toast.error("No device selected");
            return;
          }
        }
        const connection = await device.connect()
        // tell user to accept connection on device
        const transport = await AdbDaemonTransport.authenticate({
            serial: device.serial,
            connection,            
            credentialStore: new AdbWebCredentialStore(),
        });
        const adb = new Adb(transport);        
        this.$adb.adb = adb;
        SingletonShell.getInstance(adb, null);
        toast.success("Device connected");
        this.$adb.transport = transport;
        return true;
      }   
    },
    async connectStreaming(callback){
      let currentBoard = useWorkspaceStore().currentBoard;
      
        if (!this.$adb.transport) {
          if (!await this.deviceConnect()) {
            return;
          }
          await sleep(300);
        }
        let adb = this.$adb.adb;
        if(isProxy(adb)){
          adb = toRaw(adb);
        }        
        //try open service
        //try{
        //kill all python3
        SingletonShell.write("killall python3\n");
        //start service
        //shell.write("python3 -c 'from maix import mjpg;mjpg.start(); &'\n");
        SingletonShell.write("python3 /usr/lib/python3.8/site-packages/maix/mjpg.pyc &\n");
        await sleep(3000);
        let sock = await adb.createSocket("tcp:18811");
        sock.readable.pipeTo(new WritableStream(
        {
          write : (chunk) => {
            if(callback){
              callback(chunk);
            }
          }
        }));
        let reqText = "GET / HTTP/1.1\r\nHost: localhost:18811\r\n\r\n";
        let writer = sock.writable.getWriter();
        writer.write(new Consumable(encodeUtf8(reqText)));
      // }catch(e){
      //   if(e.message == "Socket open failed"){
      //     console.log("cannot start service");

      //   }
      //   console.log(e);
      // }
      // const list = await adb.reverse.list();
      // console.log("list");
      // console.log(list);
      // const stream = await adb.reverse.add("usb:18812",()=>{
      //   console.log("reverse callback");
      // });
      // console.log("stream");
      // console.log(stream);        
    },

    async deviceDisconnect() {
      toast.warning("Serial port disconnect");
      this.device = null;
    },

    async upload(code, skipFirmwareUpgrade = false) {
      if (!this.$adb.transport) {
        if (!await this.deviceConnect()) {
          return;
        }
        await sleep(300);
      }

      this.uploading = true;

      let filesUpload = [];
      let extra_files = [];
      let uploadModuleList = findIncludeModuleNameInCode(code);
      //=======================//
      filesUpload = filesUpload.concat(extra_files);
      filesUpload.push({
        file: "/root/main2.py",
        content: code
      });
      //return;
      console.log(filesUpload);
      const currentBoard = useWorkspaceStore().currentBoard;
      try {
        let adb = this.$adb.adb;
        if(isProxy(adb)){
          adb = toRaw(adb);
        }
        const sync = await adb.sync();    
        for (let file of filesUpload) {
          let fileT = new File([file.content], file.file);        
          let fileStream = new WrapReadableStream(fileT.stream());
          await sync.write({
            filename: file.file,
            file: fileStream
              .pipeThrough(new WrapConsumableStream()),
            type: LinuxFileType.File,
            permission: 0o666,
            mtime: Date.now() / 1000,
          });
        }
        sync.dispose(); 
        SingletonShell.write("killall python3\n");
        SingletonShell.write("python3 /root/main2.py\n");       
        //await adb.subprocess.spawn("killall python3");
        //await adb.subprocess.spawn("python3 /root/main2.py");        
        return true;
      } catch (e) {
        throw e;
      } finally {
        this.uploading = false;
      }
    }, // end upload
    
  }
});
