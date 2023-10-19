import { findIncludeModuleNameInCode, sleep } from "@/engine/helper";
import { defineStore } from "pinia";
import { toast } from "vue3-toastify";
import { useWorkspaceStore } from "./workspace";
import storage from "@/engine/storage";

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
      connected: false,
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
            toast.error("คุณไม่ได้เลือกอุปกรณ์");
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
        toast.success("เชื่อมต่อบอร์ดสำเร็จ");
        this.$adb.transport = transport;
        this.connected = true;
        return true;
      }   
    },

    rebootBoard(){
      SingletonShell.write("reboot\n");
      this.connected = false;
      this.$adb.transport = null;
      this.$adb.adb = null;
    },

    async deviceDisconnect() {
      toast.warning("Serial port disconnect");
      this.device = null;
    },
    async uploadModelIfNeeded(sync){
      const workspaceStore = useWorkspaceStore();
      let model = workspaceStore.model;
      // check board has model 
      //let stat = await sync.lstat("/home/model/" + model.hash + ".param");
      try{
        let stat = await sync.lstat("/home/model/" + model.hash + ".param");
        console.log(stat);
      }catch(e){
        toast.warn("ไม่พบไฟล์โมเดลบนบอร์ด กำลังอัพโหลดโมเดลใหม่");
        let modelBinaries = await storage.readAsFile(this.$fs, `${workspaceStore.id}/model.bin`);
        let modelParams = await storage.readAsFile(this.$fs, `${workspaceStore.id}/model.param`);
        try{
          await sync.write({
            filename: "/home/model/" + model.hash + ".param",
            file: new WrapReadableStream(modelParams.stream())
                    .pipeThrough(new WrapConsumableStream()),
            type: LinuxFileType.File,
            permission: 0o666,
            mtime: Date.now() / 1000,
          });
          await sync.write({
            filename: "/home/model/" + model.hash + ".bin",
            file: new WrapReadableStream(modelBinaries.stream())
                    .pipeThrough(new WrapConsumableStream()),
            type: LinuxFileType.File,
            permission: 0o666,
            mtime: Date.now() / 1000,
          });
          toast.success("อัพโหลดโมเดลสำเร็จ");
        }catch(e){
          console.log(e);
          toast.error("อัพโหลดโมเดลไม่สำเร็จ");
          return;
        }        
      }
    },
    async upload(code, skipFirmwareUpgrade = false) {
      if (!this.$adb.transport) {
        if (!await this.deviceConnect()) {
          return;
        }
        await sleep(300);
      }

      this.uploading = true;
      // signal ctrl + c 
      SingletonShell.write("\x03");
      SingletonShell.write("\x03");
      
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
        // upload model 
        
        await this.uploadModelIfNeeded(sync);

        // upload files
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
        return true;
      } catch (e) {
        throw e;
      } finally {
        this.uploading = false;
      }
    }, // end upload
    
  }
});
