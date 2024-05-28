import { sleep } from "@/engine/helper";
import { defineStore } from "pinia";
import { toast } from "vue3-toastify";
import { useWorkspaceStore } from "./workspace";
import { usePluginStore } from "./plugin";
import storage from "@/engine/storage";
import { md5 } from 'hash-wasm';
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

const startupScript = `#!/bin/sh

[ ! -e /va/run ] && mkdir -p /var/run
mount /mnt/UDISK /root

app="/root/app/main.py"
libmaix="/root/maix_dist/start_app.sh"
maixpy3="/root/maixpy3-9.9.9-cp38-cp38-linux_armv7l.whl"
main="/root/main.py"
swap="/swapfile"

case "$1" in
  start)
        if [ -f "$swap" ]; then
          swapon /swapfile
        fi
        if [ -d "/home/root/" ]; then
          mv /home/root/* /root/
          sync
          rm -rf /home/root/
          sync
        fi
        if [ -d "/home/app/" ]; then
          mv /home/app/ /root/
          sync
        fi
        echo "Starting app..."
        python3 /root/app/startup.py &
#       python -c "from maix import camera, display, image, nn"

        ;;
  stop)
        echo "Stopping app..."
        if [ -f "$libmaix" ]; then
          ps |grep maix_dist |awk '{print $1}'|xargs kill -9
        else
          killall python3
        fi
        ;;
  restart|reload)
        "$0" stop
        "$0" start
        ;;
  *)
        echo "Usage: $0 {start|stop|restart}"
        exit 1
esac

`;

export const useBoardStore = defineStore({
  id: "board",
  state: () => {
    return {
      isElectron: false,      
      firmwareUpdateMode: false,
      uploading: false,
      connected: false,
      wifiConnected: false,
      wifiConnecting : false,
      wifiListing: false,
    }
  },
  getters: {
    isBoardConnected(){
      return this.$adb?.transport != null;
      //return true;
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
    checkWifi(){
      return new Promise(async (resolve, reject) => {
        if (!this.$adb.transport) {
          if (!await this.deviceConnect()) {
            reject("device not connected");
            return;
          }
          await sleep(300);
        }
        this.wifiListing = true;
        SingletonShell.addCallback((data) => {
          let dataString = new TextDecoder().decode(data);
          console.log("wifi check : ", dataString);
          /*
          Connected AP: BanAomnaha_2.4GHz
          IP address: 192.168.1.75
          frequency: 2422
          RSSI: -56
          link_speed: 72
          noise: 9999
          */
         //extract data
          let lines = dataString.split("\n");
          let wifiInfo = {};
          for(let line of lines){
            let parts = line.split(":");
            if(parts.length == 2){
              wifiInfo[parts[0].trim()] = parts[1].trim();
            }
          }
          console.log("--- wifi info ---");
          console.log(wifiInfo);
          if(dataString.match(/wifi_get_connection_info_test: get connection infomation complete!/)){
            SingletonShell.removeLastCallback();
            this.wifiConnected = true;
            this.wifiListing = false;
            resolve(true);
          }
          if(dataString.match(/wifi_get_connection_info_test: WIFI disconnected/)){
            SingletonShell.removeLastCallback();
            this.wifiConnected = false;
            this.wifiListing = false;
            resolve(false);
          }
        });
        await SingletonShell.write("wifi_get_connection_info_test 1\n");
      });
    },
    listWifi(){
      return new Promise(async (resolve, reject) => {
        if (!this.$adb.transport) {
          if (!await this.deviceConnect()) {
            reject("device not connected");
            return;
          }
          await sleep(300);
        }

        this.wifiListing = true;
        let wifiList = [];
        SingletonShell.addCallback((data) => {        
          let dataString = new TextDecoder().decode(data);
          console.log("wifi list : ", dataString);
          // data start with bssid frequency signal level flags ssid
          // 64:20:e0:c2:8e:a5	2442	-50	[WPA2-PSK-CCMP][WPS][ESS]	Yanika_2.4G
          // 9c:52:f8:7b:3f:fc	2422	-64	[WPA-PSK-CCMP][WPA2-PSK-CCMP][ESS]	BanAomnaha_2.4GHz
          let lines = dataString.split("\n");
          for(let line of lines){
            //check line start with bssid xx:xx:xx:xx:xx:xx
            if(line.match(/([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})/)){
              let wifi = line.split("\t");              
              if(wifi.length == 5){
                wifiList.push({
                  ssid: wifi[4].trim(),
                  bssid: wifi[0].trim(),
                  frequency: wifi[1].trim(),
                  signal: wifi[2].trim(),
                  flags: wifi[3].trim()
                });
              }
            }
          }
          //check if command success with root@sipeed:/#
          if(dataString.match(/root@sipeed:/)){
            SingletonShell.removeLastCallback();
            this.wifiListing = false;        
            //filter if ssid is empty
            wifiList = wifiList.filter(wifi => wifi.ssid != "");       
            //sort by signal level
            wifiList.sort((a, b) => (parseInt(a.signal) > parseInt(b.signal)) ? -1 : 1);         
            resolve(wifiList);
          }
        });
        await SingletonShell.write("wifi_scan_results_test\n");
        await sleep(1000);
      });
    },
    async listDir(path){
      if (!this.$adb.transport) {
        if (!await this.deviceConnect()) {
          return;
        }
        await sleep(300);
      }
      try {
        let adb = this.$adb.adb;
        if(isProxy(adb)){
          adb = toRaw(adb);
        }
        const sync = await adb.sync();
        const entries = await sync.readdir(path);
        //console.log(entries);
        sync.dispose();
        return entries;
      } catch (e) {
        throw e;
      }
    },
    async downloadFile(path){
      if (!this.$adb.transport) {
        if (!await this.deviceConnect()) {
          return;
        }
        await sleep(300);
      }
      try {
        let adb = this.$adb.adb;
        if(isProxy(adb)){
          adb = toRaw(adb);
        }
        const sync = await adb.sync();
        const file = await sync.read(path);
        //file is PushReadableStream convert to arrayBuffer
        let arrayBuffer = await new Response(file).arrayBuffer();
        
        //const arrayBuffer = await file.arrayBuffer();
        sync.dispose();
        //create download link
        let blob = new Blob([arrayBuffer]);
        let url = URL.createObjectURL(blob);
        let a = document.createElement("a");
        a.href = url;
        a.download = path.split("/").pop();
        a.click();
        URL.revokeObjectURL(url);

        return true;
      } catch (e) {
        throw e;
      }
    },
    async deleteFileOrFolder(path){
      if (!this.$adb.transport) {
        if (!await this.deviceConnect()) {
          return;
        }
        await sleep(300);
      }
      try {
        SingletonShell.write("\x03");
        SingletonShell.write("\x03");
        await sleep(300);
        //check empty path
        if(path == ""){
          toast.error("ไม่สามารถลบไฟล์หรือโฟลเดอร์ที่ว่างเปล่าได้");
          return;
        }
        //check if root folder or app folder        
        if(path == "/" || path == "/root" || path == "/root/app"){
          toast.error("ไม่สามารถลบไฟล์หรือโฟลเดอร์หลักได้");
          return;
        }
        SingletonShell.write(`rm -rf "${path}"\n`);
        return true;
      } catch (e) {
        throw e;
      }
    },

    async createNewFolder(path){
      if (!this.$adb.transport) {
        if (!await this.deviceConnect()) {
          return;
        }
        await sleep(300);
      }
      try {
        SingletonShell.write("\x03");
        SingletonShell.write("\x03");
        await sleep(300);
        //check empty path
        if(path == ""){
          toast.error("ไม่สามารถสร้างโฟลเดอร์ที่ว่างเปล่าได้");
          return;
        }
        SingletonShell.write(`mkdir -p "${path}"\n`);
        return true;
      } catch (e) {
        throw e;
      }
    },

    async uploadFile(path, file){
      if (!this.$adb.transport) {
        if (!await this.deviceConnect()) {
          return;
        }
        await sleep(300);
      }
      try {
        let adb = this.$adb.adb;
        if(isProxy(adb)){
          adb = toRaw(adb);
        }
        const sync = await adb.sync();
        //file is browser file object
        let fileStream = new WrapReadableStream(file.stream());
        await sync.write({
          filename: path,
          file: fileStream
            .pipeThrough(new WrapConsumableStream()),
          type: LinuxFileType.File,
          permission: 0o666,
          mtime: Date.now() / 1000,
        });
        sync.dispose();
        return true;
      } catch (e) {
        throw e;
      }
    },

    connectWifi(ssid, password){
      return new Promise(async (resolve, reject) => {
        if (!this.$adb.transport) {
          if (!await this.deviceConnect()) {
            reject("device not connected");
            return;
          }
          await sleep(300);
        }
        this.wifiConnecting = true;
        SingletonShell.addCallback(async (data) => {
          let dataString = new TextDecoder().decode(data);
          console.log("wifi connect : ", dataString);
          if(dataString.match(/Wifi connect ap : Success!/)){
            SingletonShell.removeLastCallback();
            //write wifi config
            await this.writeWifiConfig(ssid, password);
            this.wifiConnecting = false;
            resolve(true);
          }
          if(dataString.match(/Wifi connect ap : Failure!/)){
            SingletonShell.removeLastCallback();
            this.wifiConnecting = false;
            resolve(false);
          }
        });
        await SingletonShell.write(`wifi_connect_ap_test ${ssid} ${password}\n\n`);                  
      });
    },
    async writeWifiConfig(ssid, password){
      //create wpa_supplicant.conf
      /*
      network={
        ssid="Sipeed_Guest"
        psk="qwert123"
      }*/
      let wpaConfig = `network={\n\tssid="${ssid}"\n\tpsk="${password}"\n}\n`;
      let buffer = encodeUtf8(wpaConfig);
      let file = new File([buffer], "wpa_supplicant.conf");
      let fileStream = new WrapReadableStream(file.stream());
      if (!this.$adb.transport) {
        if (!await this.deviceConnect()) {
          return;
        }
        await sleep(300);
      }
      try {
        let adb = this.$adb.adb;
        if(isProxy(adb)){
          adb = toRaw(adb);
        }
        const sync = await adb.sync();        
        await sync.write({
          filename: "/root/wpa_supplicant.conf",
          file: fileStream
            .pipeThrough(new WrapConsumableStream()),
          type: LinuxFileType.File,
          permission: 0o666,
          mtime: Date.now() / 1000,
        });
        sync.dispose();
        await sleep(300);
        SingletonShell.write("cp /root/wpa_supplicant.conf /etc/wifi/wpa_supplicant.conf\n"); 
        await sleep(300);
        SingletonShell.write("sync\n");
        await sleep(300);
        return true;
      } catch (e) {
        throw e;
      }
    },
    rebootBoard(){
      SingletonShell.write("reboot\n");
      this.connected = false;
      this.$adb.transport = null;
      this.$adb.adb = null;
    },
    // async checkStartupScriptIfNeeded(){
    //   if (!this.$adb.transport) {
    //     if (!await this.deviceConnect()) {
    //       return;
    //     }
    //     await sleep(300);
    //   }
    //   try {
    //     let adb = this.$adb.adb;
    //     if(isProxy(adb)){
    //       adb = toRaw(adb);
    //     }
    //     const sync = await adb.sync();
        
    //   } catch (e) {
    //     throw e;
    //   }
    // },
    async deviceDisconnect() {
      toast.warning("Serial port disconnect");
      this.device = null;
    },
    async uploadModelIfNeeded(sync){
      const workspaceStore = useWorkspaceStore();
      let model = workspaceStore.model;
      // check board has model 
      //let stat = await sync.lstat("/home/model/" + model.hash + ".param");
      console.log(model);
      if(model != null){
        try{
          let stat = await sync.lstat("/root/model/" + model.hash + ".bin");
          console.log(stat);
        }catch(e){
          toast.warn("ไม่พบไฟล์โมเดลบนบอร์ด กำลังอัพโหลดโมเดลใหม่");
          let modelBinaries = await storage.readAsFile(this.$fs, `${workspaceStore.id}/model.bin`);
          let modelParams = await storage.readAsFile(this.$fs, `${workspaceStore.id}/model.param`);
          let paramHash = await md5(new Uint8Array(await modelParams.arrayBuffer()));
          let modelHash = await md5(new Uint8Array(await modelBinaries.arrayBuffer()));
          console.log("model hash : ", model.hash);
          console.log("param hash : ", paramHash);
          console.log("model hash : ", modelHash);
          try{
            await sync.write({
              filename: "/root/model/" + model.hash + ".param",
              file: new WrapReadableStream(modelParams.stream())
                      .pipeThrough(new WrapConsumableStream()),
              type: LinuxFileType.File,
              permission: 0o666,
              mtime: Date.now() / 1000,
            });
            await sync.write({
              filename: "/root/model/" + model.hash + ".bin",
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
      }
    },
    async upload(code, writeStartup=false) {
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
      //=======================//
      const workspaceStore = useWorkspaceStore();
      const currentBoard = workspaceStore.currentBoard;
      const pluginStore = usePluginStore();
            
      //=========== code template merge ============//
      console.log("code template : ", currentBoard.codeTemplate);
      //replace code template ##{main}## with code
      code = currentBoard.codeTemplate.replace("##{main}##", code);
      console.log("code : ", code);
      //let uploadModuleList = findIncludeModuleNameInCode(code);
      //=======================//
      filesUpload = filesUpload.concat(extra_files);
      filesUpload.push({
        file: "/root/app/run.py",
        content: code
      });

      //edit startup 
      // TODO : remove this when firmware support startup script
      if (writeStartup) {
        console.log("write startup script");
        filesUpload.push({
          file: "/root/app/startup.py",
          content: code
        });
       
        filesUpload.push({
          file: "/etc/init.d/S02app",
          content: startupScript,
          permission: 0o777
        });
      }
      
      // list board python modules
      for(let module of currentBoard.pythonModules){
        let scriptResponse = await fetch(module);
        if(scriptResponse.ok){
          let scriptData = await scriptResponse.text();
          filesUpload.push({
            file: "/root/app/" + module.replace(currentBoard.path + "libs/", ""),
            content: scriptData
          });
        }
      }
      // list plugin files
      for(let plugin of pluginStore.installed){
        console.log(plugin);
        for(let codeFile of plugin.codeFiles){
          let scriptResponse = await fetch(codeFile);
          if(scriptResponse.ok){
            let scriptData = await scriptResponse.text();
            filesUpload.push({
              file: "/root/app/" + codeFile.replace(plugin.path + "libs/",""),
              content: scriptData
            });
          }
          // filesUpload.push({
          //   file: "/root/" + codeFile.replace(plugin.path + "/libs/", ""),
          //   content: code
          // });
        }
      }
      console.log(filesUpload);

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
          console.log("upload file : ", file.file);
          let fileStream = new WrapReadableStream(fileT.stream());
          await sync.write({
            filename: file.file,
            file: fileStream
              .pipeThrough(new WrapConsumableStream()),
            type: LinuxFileType.File,
            permission: file.permission | 0o666,
            mtime: Date.now() / 1000,
          });
        }
        sync.dispose(); 
        if(writeStartup){
          SingletonShell.write("chmod +x /etc/init.d/S02app\n");
          //SingletonShell.write("ln -s /etc/init.d/S02app /etc/rc.d/S02app\n");
          //SingletonShell.write("ln -s /etc/init.d/S02app /etc/rc.d/S99app\n");
        }
        SingletonShell.write("sync\n");
        SingletonShell.write("killall python3\n");
        SingletonShell.write("python3 /root/app/run.py\n");       
        return true;
      } catch (e) {
        throw e;
      } finally {
        this.uploading = false;
      }
    }, // end upload
    
  }
});
