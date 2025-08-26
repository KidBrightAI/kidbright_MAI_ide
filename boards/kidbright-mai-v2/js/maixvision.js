"use strict";
const path = require("path");
const utils = require("@electron-toolkit/utils");
const electron = require("electron");
const electronUpdater = require("electron-updater");
const fontList = require("font-list");
const semver = require("semver");
const log = require("electron-log");
const fs = require("fs");
const fsPromises = require("fs/promises");
const AdmZip = require("adm-zip");
const axios = require("axios");
const yaml = require("js-yaml");
const os = require("os");
const lockfile = require("proper-lockfile");
const jimp = require("jimp");
const mdns = require("multicast-dns");
const WebSocket = require("ws");
const node_buffer = require("node:buffer");
const sharp = require("sharp");
const ssh2 = require("ssh2");
const express = require("express");
const vscodeLanguageserver = require("vscode-languageserver");
const require$$0 = require("util");
const require$$3 = require("crypto");
const require$$4 = require("net");
const cp = require("child_process");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const os__namespace = /* @__PURE__ */ _interopNamespaceDefault(os);
const cp__namespace = /* @__PURE__ */ _interopNamespaceDefault(cp);
const icon = path.join(__dirname, "../../resources/icon.png");
var IpcEvents = /* @__PURE__ */ ((IpcEvents2) => {
  IpcEvents2["APP_SYSTEM_FONTS"] = "app:system-fonts";
  IpcEvents2["APP_SET_CONFIG"] = "app:set-config";
  IpcEvents2["APP_GET_CONFIG"] = "app:get-config";
  IpcEvents2["APP_CHECK_UPDATE"] = "app:check-update";
  IpcEvents2["APP_GET_VERSION"] = "app:get-version";
  IpcEvents2["APP_GET_EXAMPLES"] = "app:get-examples";
  IpcEvents2["APP_OPEN_EXTERNAL"] = "app:open-external";
  IpcEvents2["APP_USAGE_FIRST_OPEN"] = "app:usage-first-open";
  IpcEvents2["APP_REPORT_BUG"] = "app:report-bug";
  IpcEvents2["APP_BEFORE_QUIT"] = "app:before-quit";
  IpcEvents2["APP_QUITE"] = "app:quit";
  IpcEvents2["CONFIG_PYTHON_INTERPRETER"] = "config:python-interpreter";
  IpcEvents2["CONFIG_DOWNLOAD_LOCATION"] = "config:download-location";
  IpcEvents2["DEVICE_CONNECT"] = "device:connect";
  IpcEvents2["DEVICE_DISCONNECT"] = "device:disconnect";
  IpcEvents2["DEVICE_RUN"] = "device:run";
  IpcEvents2["DEVICE_RUN_PROJECT"] = "device:run-project";
  IpcEvents2["DEVICE_STOP"] = "device:stop";
  IpcEvents2["DEVICE_CONNECT_RESPONSE"] = "device:connect-response";
  IpcEvents2["DEVICE_RUN_RESPONSE"] = "device:run-response";
  IpcEvents2["DEVICE_STOP_RESPONSE"] = "device:stop-response";
  IpcEvents2["DEVICE_RUN_LOG"] = "device:run-log";
  IpcEvents2["DEVICE_RUN_IMAGE"] = "device:run-image";
  IpcEvents2["DEVICE_RUN_MSG"] = "device:run-msg";
  IpcEvents2["DEVICE_RUN_FINISH"] = "device:run-finish";
  IpcEvents2["DEVICE_INFORMATION"] = "device:information";
  IpcEvents2["DEVICE_SET_IMAGE_FORMAT"] = "device:set-image-format";
  IpcEvents2["DEVICE_GET_IMAGE_FORMAT"] = "device:get-image-format";
  IpcEvents2["DEVICE_INSTALL_APP"] = "device:install-app";
  IpcEvents2["DEVICE_INSTALL_APP_RESPONSE"] = "device:install-app-response";
  IpcEvents2["DEVICE_GET_MDNS"] = "device:get-mdns";
  IpcEvents2["DEVICE_UPDATE_RUNTIME"] = "device:update-runtime";
  IpcEvents2["DEVICE_UPDATE_RUNTIME_RESPONSE"] = "device:update-runtime-response";
  IpcEvents2["DEVICE_WRITE_CONFIG"] = "device:write-config";
  IpcEvents2["DEVICE_READ_CONFIG"] = "device:read-config";
  IpcEvents2["DEVICE_GET_PACKAGE_INFO"] = "device:get-package-info";
  IpcEvents2["DEVICE_PACKAGE_APP"] = "device:package-app";
  IpcEvents2["DEVICE_PACKAGE_APP_SUCCESS"] = "device:package-app-success";
  IpcEvents2["DEVICE_SFTP_CONNECT"] = "device:sftp-connect";
  IpcEvents2["DEVICE_SFTP_DISCONNECT"] = "device:sftp-disconnect";
  IpcEvents2["DEVICE_SFTP_STATE"] = "device:sftp-state";
  IpcEvents2["DEVICE_SFTP_READDIR"] = "device:sftp-readdir";
  IpcEvents2["DEVICE_SFTP_MKDIR"] = "device:sftp-mkdir";
  IpcEvents2["DEVICE_SFTP_RM"] = "device:sftp-rm";
  IpcEvents2["DEVICE_SFTP_MV"] = "device:sftp-mv";
  IpcEvents2["DEVICE_SFTP_COPY"] = "device:sftp-copy";
  IpcEvents2["DEVICE_SFTP_UPLOAD"] = "device:sftp-upload";
  IpcEvents2["DEVICE_SFTP_UPLOAD_PROGRESS"] = "device:sftp-upload-progress";
  IpcEvents2["DEVICE_SFTP_DOWNLOAD"] = "device:sftp-download";
  IpcEvents2["DEVICE_SFTP_DOWNLOAD_PROGRESS"] = "device:sftp-download-progress";
  IpcEvents2["DEVICE_SFTP_RENAME"] = "device:sftp-rename";
  IpcEvents2["DEVICE_SFTP_CHMOD"] = "device:sftp-chmod";
  IpcEvents2["DEVICE_SSH_CONNECT"] = "device:ssh-connect";
  IpcEvents2["DEVICE_SSH_CREATE_SHELL"] = "device:ssh-create-shell";
  IpcEvents2["DEVICE_SSH_WRITE"] = "device:ssh-write";
  IpcEvents2["DEVICE_SSH_RESPONSE"] = "device:ssh-response";
  IpcEvents2["DEVICE_SSH_CLOSE_SHELL"] = "device:ssh-close-shell";
  IpcEvents2["DEVICE_SSH_DISCONNECT"] = "device:ssh-disconnect";
  IpcEvents2["EXPLORER_OPEN_EXPLORER"] = "explorer:open-explorer";
  IpcEvents2["EXPLORER_OPEN_FILE"] = "explorer:open-file";
  IpcEvents2["EXPLORER_READ_FILE"] = "explorer:read-file";
  IpcEvents2["EXPLORER_SAVE_FILE"] = "explorer:save-file";
  IpcEvents2["EXPLORER_SAVE_AS"] = "explorer:save-as";
  IpcEvents2["EXPLORER_OPEN_FOLDER"] = "explorer:open-folder";
  IpcEvents2["EXPLORER_CREATE_FILE"] = "explorer:create-file";
  IpcEvents2["EXPLORER_DELETE_FILE"] = "explorer:delete-file";
  IpcEvents2["EXPLORER_GET_FILE_INFO"] = "explorer:get-file-info";
  IpcEvents2["EXPLORER_PACKAGE_FOLDER"] = "explorer:package-folder";
  IpcEvents2["EXPLORER_SAVE_IMAGE"] = "explorer:save-image";
  IpcEvents2["UI_MINIMIZE_WINDOW"] = "ui:minimize-window";
  IpcEvents2["UI_MAXIMIZE_WINDOW"] = "ui:maximize-window";
  IpcEvents2["UI_CLOSE_WINDOW"] = "ui:close-window";
  IpcEvents2["UI_IS_WINDOW_MAXIMIZED"] = "ui:is-window-maximized";
  IpcEvents2["UI_SYSTEM_THEME"] = "ui:system-theme";
  IpcEvents2["STATE_HAS_UNSAVED_FILE"] = "state:has-unsaved-file";
  IpcEvents2["NODE_PATH_BASENAME"] = "node:path-basename";
  IpcEvents2["NODE_PATH_DIRNAME"] = "node:path-dirname";
  IpcEvents2["NODE_HTTP_REQUEST"] = "node:http-request";
  return IpcEvents2;
})(IpcEvents || {});
const logger = log.scope("main");
log.initialize();
electron.app.on("before-quit", () => {
  log.transports.console.level = false;
});
function getVersion() {
  return electron.app.getVersion();
}
async function checkUpdate() {
  try {
    const res = await electronUpdater.autoUpdater.checkForUpdates();
    const version = res?.updateInfo?.version || "";
    const isNewVersion = semver.gt(version, electron.app.getVersion());
    return { version, isNewVersion };
  } catch (err) {
    logger.error(`[check update]: ${err}`);
  }
  return { version: "", isNewVersion: false };
}
async function getSystemFonts() {
  try {
    return await fontList.getFonts({ disableQuoting: true });
  } catch (err) {
    logger.error("get systems font failed, ", err);
  }
  return [];
}
function openExternal(_, url, options) {
  electron.shell.openExternal(url, options).catch((err) => {
    logger.error("shell.openExternal failed", err);
  });
}
function quit() {
  electron.app.quit();
}
const CDN = "https://cdn.sipeed.com/maixvision/examples";
async function getExamples() {
  try {
    let maxVersion = "v0.0.0";
    const dir = await getExampleDir();
    const files = await fsPromises.readdir(dir, { withFileTypes: true });
    files.forEach((file) => {
      if (file.isDirectory() && semver.valid(file.name) && semver.gt(file.name, maxVersion)) {
        maxVersion = file.name;
      }
    });
    if (maxVersion === "v0.0.0") {
      const latestVersion = await getLatestVersion();
      if (!latestVersion) {
        return { code: 0, msg: "" };
      }
      await downloadExamples(latestVersion);
      maxVersion = latestVersion;
    } else {
      getLatestVersion().then((version) => {
        if (version && semver.gt(version, maxVersion)) {
          downloadExamples(version);
        }
      });
    }
    const exampleDir = path.join(dir, maxVersion);
    return { code: 0, msg: "", dir: exampleDir };
  } catch (err) {
    logger.error("[get examples]: ", err);
    const msg2 = err instanceof Error ? err.message : "get examples unknown error";
    return { code: -1, msg: msg2 };
  }
}
async function getExampleDir() {
  const dir = path.join(electron.app.getPath("appData"), "maixvision", "examples");
  try {
    const stat = await fsPromises.stat(dir);
    if (!stat.isDirectory()) {
      await fsPromises.mkdir(dir);
    }
  } catch (err) {
    await fsPromises.mkdir(dir);
  }
  return dir;
}
async function getLatestVersion() {
  try {
    const url = `${CDN}/latest.yml`;
    const response = await axios.get(url);
    if (response.status === 200 && response.data) {
      const data = yaml.load(response.data);
      return data.version;
    }
  } catch (err) {
    logger.error("[get example version]: ", err);
  }
  return "";
}
async function downloadExamples(version) {
  try {
    const url = `${CDN}/${version}.zip`;
    const response = await axios.get(url, { responseType: "stream" });
    const dir = await getExampleDir();
    const zipPath = path.join(dir, `${version}.zip`);
    const extractPath = path.join(dir, version);
    const writer = fs.createWriteStream(zipPath);
    response.data.pipe(writer);
    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
    const zip = new AdmZip(zipPath);
    await new Promise((resolve, reject) => {
      zip.extractAllToAsync(extractPath, true, true, (err) => {
        err ? reject(err) : resolve(err);
      });
    });
    await fsPromises.rm(zipPath);
  } catch (err) {
    logger.error("[download examples]: ", err);
  }
}
const BASE = utils.is.dev ? "http://127.0.0.1:8095/api" : "https://maixvision.sipeed.com/api";
const Instance = axios.create({
  baseURL: BASE,
  timeout: 1e3
});
Instance.interceptors.request.use((config) => {
  config.headers.set("token", "MaixVision2024");
  return config;
});
function getMac() {
  const zeroRegex = /(?:[0]{1,2}[:-]){5}[0]{1,2}/;
  const interfaces = os__namespace.networkInterfaces();
  let mac = "";
  Object.keys(interfaces).forEach((interfaceName) => {
    interfaces[interfaceName].forEach((info) => {
      if (info.family === "IPv4" && !info.internal && !zeroRegex.test(info.mac)) {
        mac = info.mac;
      }
    });
  });
  return mac ? mac.replace(/[^a-zA-Z0-9]/g, "") : "";
}
function firstOpen() {
  const mac = getMac();
  if (!mac)
    return;
  Instance.post("v1/usage/first-open", {
    mac,
    system: `${os__namespace.platform()}-${os__namespace.arch()}`,
    version: electron.app.getVersion()
  }).catch(() => {
  });
}
function launch() {
  const mac = getMac();
  if (!mac)
    return;
  Instance.post("v1/usage/launch", {
    mac,
    system: `${os__namespace.platform()}-${os__namespace.arch()}`,
    version: electron.app.getVersion()
  }).catch(() => {
  });
}
function reportBug(_, content, concat) {
  Instance.post("v1/feedback/bug", {
    type: 1,
    mac: getMac(),
    system: `${os__namespace.platform()}-${os__namespace.arch()}`,
    version: electron.app.getVersion(),
    content,
    concat
  }).catch(() => {
  });
}
function register$8() {
  electron.ipcMain.handle(IpcEvents.APP_GET_VERSION, getVersion);
  electron.ipcMain.handle(IpcEvents.APP_CHECK_UPDATE, checkUpdate);
  electron.ipcMain.handle(IpcEvents.APP_SYSTEM_FONTS, getSystemFonts);
  electron.ipcMain.on(IpcEvents.APP_OPEN_EXTERNAL, openExternal);
  electron.ipcMain.on(IpcEvents.APP_QUITE, quit);
  electron.ipcMain.handle(IpcEvents.APP_GET_EXAMPLES, getExamples);
  electron.ipcMain.on(IpcEvents.APP_USAGE_FIRST_OPEN, firstOpen);
  electron.ipcMain.on(IpcEvents.APP_REPORT_BUG, reportBug);
}
const configPath = path.join(electron.app.getPath("appData"), "maixvision", "settings.json");
const defaultConfig = {
  "privacy.accepted": false,
  "appearance.theme": "dark",
  "appearance.language": "en",
  "editor.fontFamily": "Consolas",
  "editor.fontSize": 14,
  "editor.fontLigatures": false,
  "editor.python": "",
  "download.location": "",
  "download.ask": true,
  "download.openExplorer": false
};
let userConfig = null;
async function initConfig() {
  if (userConfig)
    return;
  try {
    if (fs.existsSync(configPath)) {
      const data = await fs.promises.readFile(configPath, { encoding: "utf-8" });
      const fileConfig = JSON.parse(data);
      userConfig = Object.assign({}, defaultConfig, fileConfig);
    } else {
      await fs.promises.writeFile(configPath, JSON.stringify(defaultConfig), { encoding: "utf-8" });
      userConfig = defaultConfig;
    }
  } catch (err) {
    userConfig = defaultConfig;
  }
}
async function getConfig(key) {
  if (!userConfig) {
    await initConfig();
  }
  if (key) {
    return userConfig[key];
  }
  return userConfig;
}
async function setConfig(key, value) {
  try {
    await initConfig();
    if (userConfig[key] === value)
      return;
    userConfig[key] = value;
    const release = await lockfile.lock(configPath, { retries: 5 });
    await fs.promises.writeFile(configPath, JSON.stringify(userConfig));
    await release();
  } catch (err) {
    logger.error("Failed to set config: ", err);
  }
}
async function setLocation(e) {
  try {
    const win = electron.BrowserWindow.fromWebContents(e.sender);
    if (!win) {
      return { code: -1, msg: "browser window not found", location: "" };
    }
    const { canceled, filePaths } = await electron.dialog.showOpenDialog(win, {
      properties: ["openDirectory"]
    });
    if (canceled || !filePaths) {
      return { code: 0, msg: "", location: "" };
    }
    return { code: 0, msg: "", location: filePaths[0] };
  } catch (err) {
    logger.error("[set download location]: ", err);
    const msg2 = err instanceof Error ? err.message : "set python unknown error";
    return { code: -3, msg: msg2, location: "" };
  }
}
async function setPythonInterpreter(e) {
  try {
    const win = electron.BrowserWindow.fromWebContents(e.sender);
    if (!win) {
      return { code: -1, msg: "browser window not found" };
    }
    const currentPython = await getConfig("editor.python");
    const { canceled, filePaths } = await electron.dialog.showOpenDialog(win, {
      defaultPath: currentPython || "",
      properties: ["openFile"],
      filters: [{ name: "All Files", extensions: ["*"] }]
    });
    if (canceled) {
      return { code: 0, msg: "" };
    }
    try {
      const dir = path.dirname(filePaths[0]);
      const file = utils.platform.isWindows ? "python.exe" : "python";
      const python = path.join(dir, file);
      const stat = await fsPromises.stat(python);
      if (stat.isFile()) {
        return { code: 0, msg: "", interpreter: dir };
      }
    } catch (err) {
      return {
        code: -2,
        msg: "Please select the correct Python interpreter directory."
      };
    }
    return { code: 0, msg: "" };
  } catch (err) {
    logger.error("[set python interpreter]: ", err);
    const msg2 = err instanceof Error ? err.message : "set python unknown error";
    return { code: -3, msg: msg2 };
  }
}
function register$7() {
  electron.ipcMain.handle(
    IpcEvents.APP_GET_CONFIG,
    (_, key) => getConfig(key)
  );
  electron.ipcMain.on(
    IpcEvents.APP_SET_CONFIG,
    (_, key, value) => setConfig(key, value)
  );
  electron.ipcMain.handle(IpcEvents.CONFIG_PYTHON_INTERPRETER, setPythonInterpreter);
  electron.ipcMain.handle(IpcEvents.CONFIG_DOWNLOAD_LOCATION, setLocation);
}
async function readConfig(_, dir) {
  try {
    const confPath = path.join(dir, "app.yaml");
    if (!fs.existsSync(confPath)) {
      return Promise.resolve({ code: 0, msg: "" });
    }
    const content = await fsPromises.readFile(confPath, "utf8");
    const config = yaml.load(content);
    if (config.icon && config.icon === "app.png") {
      try {
        const target = path.join(dir, config.icon);
        const buffer = await fsPromises.readFile(target);
        const base64 = buffer.toString("base64");
        config.icon = `data:image/png;base64,${base64}`;
      } catch (err) {
        logger.error("[read config]: ", err);
        config.icon = "";
      }
    } else {
      config.icon = "";
    }
    return Promise.resolve({ code: 0, msg: "", config });
  } catch (err) {
    logger.error("[read config]: ", err);
    const msg2 = err instanceof Error ? err.message : "read config unknown error";
    return Promise.resolve({ code: -2, msg: msg2 });
  }
}
async function writeConfig(_, dir, data) {
  try {
    const encoding = "utf8";
    const confPath = path.join(dir, "app.yaml");
    if (data.icon && !data.icon.endsWith("app.png")) {
      try {
        const parts = data.icon.split(";");
        const img2 = parts[1].split(",")[1];
        const buffer = Buffer.from(img2, "base64");
        const image = await jimp.Jimp.read(buffer);
        const target = path.join(dir, "app.png");
        await image.contain({ w: 128, h: 128 }).write(target);
        data.icon = "app.png";
      } catch (err) {
        data.icon = "";
      }
    }
    if (data?.files?.length === 1 && path.isAbsolute(data.files[0])) {
      data.files = [path.relative(dir, data.files[0])];
    }
    let config;
    if (fs.existsSync(confPath)) {
      const content = await fsPromises.readFile(confPath, encoding);
      const oldYamlData = yaml.load(content);
      config = { ...oldYamlData, ...data };
    } else {
      config = data;
    }
    const yamlData = yaml.dump(config);
    await fsPromises.writeFile(confPath, yamlData, encoding);
    return Promise.resolve({ code: 0, msg: "" });
  } catch (err) {
    logger.error("[write config]: ", err);
    const msg2 = err instanceof Error ? err.message : "write config unknown error";
    return Promise.resolve({ code: -2, msg: msg2 });
  }
}
async function getPackageInfo(e, dir) {
  try {
    const res = await readConfig(e, dir);
    if (res.code !== 0) {
      return { code: -1, msg: res.msg };
    }
    if (!res.config) {
      return { code: 0, msg: "" };
    }
    const fileName = `maix-${res.config.id}-v${res.config.version}.zip`;
    const filePath = path.join(dir, "dist", fileName);
    try {
      const stats = await fsPromises.stat(filePath);
      return {
        code: 0,
        msg: "",
        config: res.config,
        info: {
          name: fileName,
          path: filePath,
          size: stats.size
        }
      };
    } catch (err) {
      return { code: 0, msg: "", config: res.config };
    }
  } catch (err) {
    logger.error("[get package info]: ", err);
    const msg2 = err instanceof Error ? err.message : "get package info unknown error";
    return { code: -2, msg: msg2 };
  }
}
async function packageApp(e, dir) {
  const win = electron.BrowserWindow.fromWebContents(e.sender);
  if (!win) {
    return;
  }
  try {
    const confPath = path.join(dir, "app.yaml");
    const content = await fsPromises.readFile(confPath, "utf8");
    const config = yaml.load(content);
    if (!config?.files?.length)
      return;
    const dist = path.join(dir, "dist");
    if (!fs.existsSync(dist)) {
      await fsPromises.mkdir(dist);
    }
    const zipFile = `maix-${config.id}-v${config.version}.zip`;
    const target = path.join(dist, zipFile);
    createZip(dir, config, target, (err) => {
      const rsp = err ? { code: -1, msg: err.message } : { code: 0, msg: "" };
      win.webContents.send(IpcEvents.DEVICE_PACKAGE_APP_SUCCESS, rsp);
    });
  } catch (err) {
    logger.error("[package files]: ", err);
    win.webContents.send(IpcEvents.DEVICE_PACKAGE_APP_SUCCESS, {
      code: -1,
      msg: err instanceof Error ? err.message : "package files unknown error"
    });
  }
}
function createZip(dir, config, target, callback) {
  const zip = new AdmZip();
  if (config.files.length === 1) {
    const absolutePath = path.join(dir, config.files[0]);
    zip.addLocalFile(absolutePath, "", "main.py");
  } else {
    config.files.forEach((file) => {
      const localPath = path.join(dir, file);
      const zipPath = path.dirname(file);
      const zipName = path.basename(file);
      zip.addLocalFile(localPath, zipPath === "." ? "" : zipPath, zipName);
    });
  }
  if (!config.files.includes("app.yaml")) {
    const absolutePath = path.join(dir, "app.yaml");
    zip.addLocalFile(absolutePath, "", "app.yaml");
  }
  if (config.icon) {
    const absolutePath = path.join(dir, config.icon);
    if (fs.existsSync(absolutePath)) {
      zip.addLocalFile(absolutePath, "", config.icon);
    }
  }
  zip.writeZip(target, callback);
}
const instanceIps = [];
const instances = [];
const devices = [];
let times = 0;
function getNewIps() {
  const newIps = [];
  const interfaces = os__namespace.networkInterfaces();
  Object.keys(interfaces).forEach((interfaceName) => {
    interfaces[interfaceName].forEach((info) => {
      if (info.internal || info.family !== "IPv4")
        return;
      if (!instanceIps.includes(info.address)) {
        newIps.push(info.address);
      }
    });
  });
  return newIps;
}
function createInstance(ip) {
  const instance = mdns({
    bind: "0.0.0.0",
    interface: ip,
    ttl: 255
  });
  instance.on("response", function(response) {
    response.answers.forEach((answer) => {
      if (answer.type === "PTR" && answer.name === "_ssh._tcp.local" && answer.data.startsWith("maixcam")) {
        const domain = answer.data.replace("._ssh._tcp", "");
        instance.query([{ name: domain, type: "A" }]);
      } else if (answer.type === "A" && answer.name.startsWith("maixcam")) {
        if (devices.some((device) => device.ip === answer.data)) {
          return;
        }
        devices.push({
          name: answer.name,
          ip: answer.data
        });
      }
    });
  });
  return instance;
}
function query() {
  try {
    const ips = getNewIps();
    if (ips.length > 0) {
      ips.forEach((ip) => {
        const instance = createInstance(ip);
        instances.push(instance);
        instanceIps.push(ip);
      });
    }
    instances.forEach((instance) => instance.query([{ name: "_ssh._tcp.local", type: "PTR" }]));
  } catch (err) {
    destroy();
    logger.error(`[mdns query]: ${err}`);
  }
}
function getDevices() {
  if (times++ > 200) {
    times = 0;
    destroy();
  }
  query();
  return devices;
}
function destroy() {
  try {
    instances.forEach((instances2) => instances2.destroy());
    instances.length = 0;
    instanceIps.length = 0;
    devices.length = 0;
    times = 0;
  } catch (err) {
    logger.error(`[destroy mdns]: ${err}`);
  }
}
function auth(win, content) {
  const isSuccess = content[0] === 1;
  const rsp = isSuccess ? { code: 1, msg: "connect successful\n\n" } : { code: -2, msg: `connect device failed: ${node_buffer.Buffer.from(content.slice(1)).toString()}

` };
  win.webContents.send(IpcEvents.DEVICE_CONNECT_RESPONSE, rsp);
  return isSuccess;
}
function run$2(win, content) {
  const isSuccess = content[0] === 1;
  const rsp = isSuccess ? { code: 0, msg: "start running...\n\n" } : {
    code: -1,
    msg: `device execute code failed: ${node_buffer.Buffer.from(content.slice(1)).toString()}

`
  };
  win.webContents.send(IpcEvents.DEVICE_RUN_RESPONSE, rsp);
}
function output(win, content) {
  const data = node_buffer.Buffer.from(content).toString();
  win.webContents.send(IpcEvents.DEVICE_RUN_LOG, data);
}
function img(win, content) {
  try {
    if (utils.platform.isLinux) {
      jimp.Jimp.read(node_buffer.Buffer.from(content.slice(1))).then((image) => {
        const rsp = {
          data: image.bitmap.data.buffer,
          type: content[0] === 1 ? "jpeg" : "png",
          width: image.width,
          height: image.height
        };
        win?.webContents.send(IpcEvents.DEVICE_RUN_IMAGE, rsp);
      });
    } else {
      sharp(content.slice(1)).raw().ensureAlpha().toBuffer({ resolveWithObject: true }).then(({ data, info }) => {
        const rsp = {
          data: data.buffer,
          type: content[0] === 1 ? "jpeg" : "png",
          width: info.width,
          height: info.height
        };
        win?.webContents.send(IpcEvents.DEVICE_RUN_IMAGE, rsp);
      });
    }
  } catch (err) {
    logger.error("[Sharp Exception]: ", err);
  }
}
function stop$1(win, content) {
  const isSuccess = content[0] === 1;
  const rsp = isSuccess ? { code: 0, msg: "stop running success\n" } : {
    code: -1,
    msg: `stop running failed: ${node_buffer.Buffer.from(content.slice(1)).toString()}

`
  };
  win.webContents.send(IpcEvents.DEVICE_STOP_RESPONSE, rsp);
}
function finish(win, content) {
  const isSuccess = content.slice(0, 4).every((a) => a === 0);
  let rsp;
  if (isSuccess) {
    rsp = { code: 0, msg: "\nprogram exited\n\n" };
  } else {
    const view = new DataView(content.slice(0, 4).buffer, 0);
    const code = view.getUint32(0, true);
    const err = node_buffer.Buffer.from(content.slice(4)).toString();
    const msg2 = `
program exit failed. exit code: ${code}. ${err ? "msg: " + err : ""}

`;
    rsp = { code, msg: msg2 };
  }
  win.webContents.send(IpcEvents.DEVICE_RUN_FINISH, rsp);
}
function msg(win, content) {
  win.webContents.send(IpcEvents.DEVICE_RUN_MSG, node_buffer.Buffer.from(content).toString());
}
function deviceInfo(win, content) {
  win.webContents.send(IpcEvents.DEVICE_INFORMATION, node_buffer.Buffer.from(content).toString());
}
function imgFormat(win, content) {
  const isSuccess = content[0] === 1;
  const rsp = isSuccess ? {
    code: 0,
    format: content[1] === 1 ? "JPEG" : content[1] === 2 ? "PNG" : "",
    msg: "success"
  } : {
    code: -1,
    format: "",
    msg: node_buffer.Buffer.from(content.slice(2)).toString()
  };
  win.webContents.send(IpcEvents.DEVICE_GET_IMAGE_FORMAT, rsp);
}
function installApp$1(win, content) {
  const isSuccess = content[1] === 0;
  const rsp = isSuccess ? {
    code: 0,
    progress: content[0],
    msg: "success"
  } : {
    code: -1,
    progress: 0,
    msg: node_buffer.Buffer.from(content.slice(2)).toString()
  };
  win.webContents.send(IpcEvents.DEVICE_INSTALL_APP_RESPONSE, rsp);
}
function updateRuntime$1(win, content) {
  const isSuccess = content[1] === 0;
  const rsp = isSuccess ? {
    code: 0,
    progress: content[0],
    msg: "success"
  } : {
    code: -1,
    progress: 0,
    msg: node_buffer.Buffer.from(content.slice(2)).toString()
  };
  win.webContents.send(IpcEvents.DEVICE_UPDATE_RUNTIME_RESPONSE, rsp);
  return isSuccess && content[0] === 100;
}
const HEADER = new Uint8Array([172, 190, 203, 202]);
const VERSION = new Uint8Array([0]);
var Command = /* @__PURE__ */ ((Command2) => {
  Command2[Command2["Auth"] = 1] = "Auth";
  Command2[Command2["AuthAck"] = 2] = "AuthAck";
  Command2[Command2["Run"] = 3] = "Run";
  Command2[Command2["RunAck"] = 4] = "RunAck";
  Command2[Command2["Output"] = 5] = "Output";
  Command2[Command2["Img"] = 6] = "Img";
  Command2[Command2["Stop"] = 7] = "Stop";
  Command2[Command2["StopAck"] = 8] = "StopAck";
  Command2[Command2["Finish"] = 9] = "Finish";
  Command2[Command2["Msg"] = 10] = "Msg";
  Command2[Command2["Heartbeat"] = 11] = "Heartbeat";
  Command2[Command2["DeviceInfo"] = 12] = "DeviceInfo";
  Command2[Command2["DeviceInfoAck"] = 13] = "DeviceInfoAck";
  Command2[Command2["ImgFormat"] = 14] = "ImgFormat";
  Command2[Command2["ImgFormatAck"] = 15] = "ImgFormatAck";
  Command2[Command2["InstallApp"] = 16] = "InstallApp";
  Command2[Command2["InstallAppAck"] = 17] = "InstallAppAck";
  Command2[Command2["RunProject"] = 18] = "RunProject";
  Command2[Command2["UpdateRuntime"] = 19] = "UpdateRuntime";
  Command2[Command2["UpdateRuntimeAck"] = 20] = "UpdateRuntimeAck";
  return Command2;
})(Command || {});
function packMessage(cmd, data) {
  if (typeof data === "number") {
    data = Buffer.from(num2Uint8Array(data));
  } else if (typeof data === "string") {
    data = Buffer.from(data);
  }
  const frameData = new Uint8Array([...VERSION, cmd, ...data]);
  const message = new Uint8Array([...HEADER, ...packUint32(frameData.length + 1), ...frameData]);
  const checksum = message.reduce((a, b) => a + b, 0) % 256;
  return new Uint8Array([...message, checksum]);
}
function unpackMessage(message, wishCmd) {
  const data = new Uint8Array(message);
  const header = data.slice(0, 4);
  if (!header.every((value, index) => value === HEADER[index])) {
    logger.error("message header error");
    return;
  }
  const dataLen = data.slice(4, 8).reduce((acc, value, index) => acc + (value << index * 8), 0);
  if (data.length - 8 < dataLen) {
    logger.error("message data frame not complete");
    return;
  }
  if (data.slice(0, -1).reduce((acc, value) => acc + value, 0) % 256 !== data[dataLen + 7]) {
    logger.error("check sum not equal");
    return;
  }
  const cmd = data[9];
  if (wishCmd && cmd !== wishCmd) {
    logger.error("message cmd error not match");
    return;
  }
  const content = data.slice(10, 10 + dataLen - 3);
  return { cmd, content };
}
function packUint32(value) {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setUint32(0, value, true);
  return Array.from(new Uint8Array(buffer));
}
function num2Uint8Array(num) {
  const arr = new Uint8Array(8);
  for (let i = 0; i < 8; i++) {
    arr[i] = num % 256;
    num = Math.floor(num / 256);
  }
  return arr;
}
let WS = null;
let timeoutId = null;
function connect$2(e, ip) {
  if (WS)
    return;
  const win = electron.BrowserWindow.fromWebContents(e.sender);
  if (!win)
    return;
  try {
    WS = new WebSocket(`ws://${ip}:7899`);
  } catch (err) {
    win.webContents.send(IpcEvents.DEVICE_CONNECT_RESPONSE, {
      code: -1,
      msg: `connect device failed: ${err.message}
`
    });
    return;
  }
  WS.binaryType = "arraybuffer";
  WS.addEventListener("open", () => {
    const msg2 = packMessage(Command.Auth, "maixvision");
    WS?.send(msg2);
    heartbeat(win);
    destroy();
  });
  WS.addEventListener("message", (event) => {
    heartbeat(win);
    const res = unpackMessage(event.data);
    if (!res) {
      logger.error("unpack message failed");
      return;
    }
    handleCommand(win, res.cmd, res.content);
  });
  WS.addEventListener("close", () => {
    win.webContents.send(IpcEvents.DEVICE_CONNECT_RESPONSE, { code: 0, msg: "disconnected\n\n" });
    disconnect$2();
  });
  WS.addEventListener("error", (error2) => {
    win.webContents.send(IpcEvents.DEVICE_CONNECT_RESPONSE, {
      code: -1,
      msg: `connect device failed: ${error2.message}
`
    });
    disconnect$2();
  });
}
function heartbeat(win) {
  timeoutId && clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    win.webContents.send(IpcEvents.DEVICE_CONNECT_RESPONSE, {
      code: 0,
      msg: "Device timeout. Close connection\n\n"
    });
    disconnect$2();
  }, 2e4);
}
function handleCommand(win, cmd, content) {
  switch (cmd) {
    case Command.AuthAck: {
      const ok = auth(win, content);
      if (ok) {
        WS?.send(packMessage(Command.DeviceInfo, ""));
      } else {
        disconnect$2();
      }
      break;
    }
    case Command.RunAck:
      run$2(win, content);
      break;
    case Command.Output:
      output(win, content);
      break;
    case Command.Img:
      img(win, content);
      break;
    case Command.StopAck:
      stop$1(win, content);
      break;
    case Command.Finish:
      finish(win, content);
      break;
    case Command.Msg:
      msg(win, content);
      break;
    case Command.Heartbeat:
      WS?.send(packMessage(Command.Heartbeat, ""));
      break;
    case Command.DeviceInfoAck:
      deviceInfo(win, content);
      break;
    case Command.ImgFormatAck:
      imgFormat(win, content);
      break;
    case Command.InstallAppAck:
      installApp$1(win, content);
      break;
    case Command.UpdateRuntimeAck: {
      const ok = updateRuntime$1(win, content);
      if (ok) {
        WS?.send(packMessage(Command.DeviceInfo, ""));
      }
      break;
    }
    default:
      logger.error("invalid command: ", cmd);
      break;
  }
}
function run$1(_, code) {
  const msg2 = packMessage(Command.Run, code);
  WS?.send(msg2);
}
async function runProject(_, project) {
  try {
    const data = await fsPromises.readFile(project);
    const msg2 = packMessage(Command.RunProject, data);
    WS?.send(msg2);
  } catch (err) {
    logger.error("[run project]: ", err);
  }
}
function stop() {
  const msg2 = packMessage(Command.Stop, "");
  WS?.send(msg2);
}
function setImgFormat(e, format) {
  if (WS) {
    let command;
    const img2 = format.toLowerCase();
    if (img2 === "") {
      command = 0;
    } else if (img2 === "jpeg") {
      command = 1;
    } else if (img2 === "png") {
      command = 2;
    } else {
      logger.error("invalid image format %s", format);
      return;
    }
    const msg2 = packMessage(Command.ImgFormat, command);
    WS.send(msg2);
  } else {
    const win = electron.BrowserWindow.fromWebContents(e.sender);
    const rsp = { code: 0, format, msg: "success" };
    win?.webContents.send(IpcEvents.DEVICE_GET_IMAGE_FORMAT, rsp);
  }
}
async function installApp(_, appPath) {
  try {
    const appData = await fsPromises.readFile(appPath);
    const msg2 = packMessage(Command.InstallApp, appData);
    WS?.send(msg2);
  } catch (err) {
    logger.error("[install app]: ", err);
  }
}
async function updateRuntime(_, uid, device, version) {
  try {
    const response = await axios.get("https://maixvision.sipeed.com/api/v1/devices/encryption", {
      headers: { token: "MaixVision2024" },
      params: { uid, device, version },
      responseType: "arraybuffer"
    });
    if (response.headers["content-type"] !== "application/octet-stream") {
      return false;
    }
    const versionBuffer = Buffer.from(`${version}\0`);
    const data = Buffer.concat([versionBuffer, Buffer.from(response.data)]);
    WS?.send(packMessage(Command.UpdateRuntime, data));
    return true;
  } catch (err) {
    logger.error("[update runtime]: ", err);
    return false;
  }
}
function disconnect$2() {
  if (WS) {
    WS.removeAllListeners();
    if (WS.readyState === WebSocket.OPEN) {
      WS.close();
    }
    WS = null;
  }
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
  query();
}
function register$6() {
  electron.ipcMain.on(IpcEvents.DEVICE_CONNECT, connect$2);
  electron.ipcMain.on(IpcEvents.DEVICE_DISCONNECT, disconnect$2);
  electron.ipcMain.on(IpcEvents.DEVICE_RUN, run$1);
  electron.ipcMain.on(IpcEvents.DEVICE_RUN_PROJECT, runProject);
  electron.ipcMain.on(IpcEvents.DEVICE_STOP, stop);
  electron.ipcMain.on(IpcEvents.DEVICE_SET_IMAGE_FORMAT, setImgFormat);
  electron.ipcMain.on(IpcEvents.DEVICE_INSTALL_APP, installApp);
  electron.ipcMain.handle(IpcEvents.DEVICE_UPDATE_RUNTIME, updateRuntime);
  electron.ipcMain.handle(IpcEvents.DEVICE_READ_CONFIG, readConfig);
  electron.ipcMain.handle(IpcEvents.DEVICE_WRITE_CONFIG, writeConfig);
  electron.ipcMain.handle(IpcEvents.DEVICE_GET_PACKAGE_INFO, getPackageInfo);
  electron.ipcMain.on(IpcEvents.DEVICE_PACKAGE_APP, packageApp);
  electron.ipcMain.handle(IpcEvents.DEVICE_GET_MDNS, getDevices);
}
const extensionLanguageMap = /* @__PURE__ */ new Map([
  ["py", "python"],
  ["js", "javascript"],
  ["ts", "typescript"],
  ["json", "json"],
  ["yaml", "yaml"],
  ["yml", "yaml"]
]);
function getFileLanguage(file) {
  const fileName = path.basename(file);
  const fileExtension = fileName.split(".").pop();
  if (!fileExtension) {
    return "text";
  }
  const extension = fileExtension.toLowerCase();
  const language = extensionLanguageMap.get(extension);
  return language ? language : extension;
}
async function buildFileTree(dir, level = 1, base = "") {
  const direntList = await fsPromises.readdir(dir, { withFileTypes: true });
  const tree = await Promise.all(
    direntList.map(async (dirent) => {
      const absolutePath = path.join(dir, dirent.name);
      const relativePath = path.join(base, dirent.name);
      return {
        name: dirent.name,
        path: absolutePath,
        relativePath,
        level,
        language: getFileLanguage(dirent.name),
        isDirectory: dirent.isDirectory(),
        children: dirent.isDirectory() ? await buildFileTree(absolutePath, level + 1, relativePath) : void 0
      };
    })
  );
  return tree.sort((a, b) => {
    if (a.isDirectory && !b.isDirectory) {
      return -1;
    } else if (!a.isDirectory && b.isDirectory) {
      return 1;
    } else {
      return a.name.localeCompare(b.name);
    }
  });
}
async function openFile(e) {
  try {
    const win = electron.BrowserWindow.fromWebContents(e.sender);
    if (!win) {
      return Promise.resolve({ code: -1, msg: "browser window not found", files: [] });
    }
    const { canceled, filePaths } = await electron.dialog.showOpenDialog(win, {
      properties: ["openFile", "multiSelections"],
      filters: [{ name: "All Files", extensions: ["*"] }]
    });
    if (canceled) {
      return Promise.resolve({ code: 0, msg: "", files: [] });
    }
    const files = filePaths.map((f) => ({
      name: path.basename(f),
      path: f,
      content: "",
      language: getFileLanguage(f),
      encoding: ""
    }));
    return Promise.resolve({ code: 0, msg: "", files });
  } catch (err) {
    logger.error("[open file]: ", err);
    const msg2 = err instanceof Error ? err.message : "open file unknown error";
    return Promise.resolve({ code: -2, msg: msg2, files: [] });
  }
}
async function readFile(e, filePath) {
  try {
    const win = electron.BrowserWindow.fromWebContents(e.sender);
    if (!win) {
      return Promise.resolve({ code: -1, msg: "browser window not found" });
    }
    const encoding = "utf-8";
    const file = {
      name: path.basename(filePath),
      path: filePath,
      content: await fsPromises.readFile(filePath, { encoding }),
      language: getFileLanguage(filePath),
      encoding
    };
    return Promise.resolve({ code: 0, msg: "", file });
  } catch (err) {
    logger.error("[read file]: ", err);
    const msg2 = err instanceof Error ? err.message : "read file unknown error";
    return Promise.resolve({ code: -2, msg: msg2 });
  }
}
async function saveFile(e, filePath, content) {
  try {
    const win = electron.BrowserWindow.fromWebContents(e.sender);
    if (!win) {
      return Promise.resolve({ code: -1, msg: "browser window not found" });
    }
    await fsPromises.writeFile(filePath, content, "utf-8");
    return Promise.resolve({ code: 0, msg: "" });
  } catch (err) {
    logger.error("[save file]: ", err);
    const msg2 = err instanceof Error ? err.message : "save file unknown error";
    return Promise.resolve({ code: -2, msg: msg2 });
  }
}
async function saveAs(e, workspace, content, filename) {
  try {
    const win = electron.BrowserWindow.fromWebContents(e.sender);
    if (!win) {
      return Promise.resolve({ code: -1, msg: "browser window not found" });
    }
    const ext = filename ? path.extname(filename).toLowerCase() : "";
    const filters = ["", "py"].includes(ext) ? [
      { name: "Python Files", extensions: ["py"] },
      { name: "All Files", extensions: ["*"] }
    ] : void 0;
    const { canceled, filePath } = await electron.dialog.showSaveDialog(win, {
      title: "Save As",
      defaultPath: filename ? path.join(workspace, filename) : workspace,
      filters
    });
    if (canceled || !filePath) {
      return Promise.resolve({ code: 0, msg: "" });
    }
    await fsPromises.writeFile(filePath, content, "utf-8");
    const file = {
      name: path.basename(filePath),
      path: filePath,
      content,
      language: getFileLanguage(filePath),
      encoding: "utf-8"
    };
    if (workspace && filePath.startsWith(workspace)) {
      const tree = {
        name: path.basename(workspace),
        path: workspace,
        children: await buildFileTree(workspace)
      };
      return Promise.resolve({ code: 0, msg: "", file, tree });
    }
    return Promise.resolve({ code: 0, msg: "", file });
  } catch (err) {
    logger.error("[save as]: ", err);
    const msg2 = err instanceof Error ? err.message : "save file unknown error";
    return Promise.resolve({ code: -2, msg: msg2 });
  }
}
async function getFileInfo(e, ...paths) {
  try {
    const win = electron.BrowserWindow.fromWebContents(e.sender);
    if (!win) {
      return Promise.resolve({ code: -1, msg: "browser window not found" });
    }
    const target = path.join(...paths);
    const exists = fs.existsSync(target);
    if (!exists) {
      return { code: 0, msg: "success" };
    }
    const stat = await fsPromises.stat(target);
    return {
      code: 0,
      msg: "success",
      info: {
        exists,
        isDirectory: stat.isDirectory(),
        size: stat.size
      }
    };
  } catch (err) {
    logger.error("[file info]: ", err);
    const msg2 = err instanceof Error ? err.message : "get file info error";
    return Promise.resolve({ code: -2, msg: msg2 });
  }
}
async function openExplorer(_, ...args) {
  try {
    const target = path.join(...args);
    const stats = await fsPromises.stat(target);
    if (stats.isFile()) {
      electron.shell.showItemInFolder(target);
    } else {
      await electron.shell.openPath(target);
    }
  } catch (err) {
    logger.error("[open explorer]: ", err);
  }
}
async function openFolder(e, folderPath) {
  try {
    const win = electron.BrowserWindow.fromWebContents(e.sender);
    if (!win) {
      return Promise.resolve({ code: -1, msg: "browser window not found" });
    }
    if (!folderPath) {
      const { canceled, filePaths } = await electron.dialog.showOpenDialog(win, {
        properties: ["openDirectory"]
      });
      if (canceled) {
        return Promise.resolve({ code: 0, msg: "" });
      }
      folderPath = filePaths[0];
    }
    const tree = {
      name: path.basename(folderPath),
      path: folderPath,
      children: await buildFileTree(folderPath)
    };
    return Promise.resolve({ code: 0, msg: "", tree });
  } catch (err) {
    logger.error("[open folder]: ", err);
    const msg2 = err instanceof Error ? err.message : "open folder unknown error";
    return Promise.resolve({ code: -2, msg: msg2 });
  }
}
async function createFile(_, workspace, targetType, ...paths) {
  const targetPath = path.join(...paths);
  if (fs.existsSync(targetPath)) {
    return { code: -1, msg: "file already exists" };
  }
  try {
    if (targetType === "file") {
      await fsPromises.writeFile(targetPath, "", "utf-8");
    } else {
      await fsPromises.mkdir(targetPath, { recursive: true });
    }
    const tree = {
      name: path.basename(workspace),
      path: workspace,
      children: await buildFileTree(workspace)
    };
    if (targetType === "file") {
      const file = {
        name: path.basename(targetPath),
        path: targetPath,
        content: "",
        language: getFileLanguage(targetPath),
        encoding: "utf-8"
      };
      return { code: 0, msg: "", file, tree };
    }
    return { code: 0, msg: "", tree };
  } catch (err) {
    logger.error("[create file]: ", err);
    const msg2 = err instanceof Error ? err.message : "create file unknown error";
    return { code: -2, msg: msg2 };
  }
}
async function deleteFile(_, workspace, target) {
  try {
    const stat = await fsPromises.stat(target);
    if (stat.isFile()) {
      await fsPromises.unlink(target);
    } else {
      await fsPromises.rm(target, { recursive: true });
    }
    const tree = {
      name: path.basename(workspace),
      path: workspace,
      children: await buildFileTree(workspace)
    };
    return { code: 0, msg: "", tree };
  } catch (err) {
    logger.error("[delete file]: ", err);
    const msg2 = err instanceof Error ? err.message : "delete file unknown error";
    return { code: -2, msg: msg2 };
  }
}
async function packageFolder(_, dir, target, excludes) {
  const zip = new AdmZip();
  const direntList = await fsPromises.readdir(dir, { withFileTypes: true });
  direntList.forEach((dirent) => {
    const absolutePath = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      if (!excludes?.includes(dirent.name)) {
        zip.addLocalFolder(absolutePath, dirent.name);
      }
    } else {
      zip.addLocalFile(absolutePath, "", dirent.name);
    }
  });
  const name = path.basename(dir);
  if (!target) {
    target = path.join(os.tmpdir(), "maixvision", `${name}.zip`);
  }
  const err = await new Promise((resolve) => {
    zip.writeZip(target, (err2) => resolve(err2));
  });
  if (err) {
    logger.error("[package file]: ", err);
    const msg2 = err instanceof Error ? err.message : "delete file unknown error";
    return { code: -1, msg: msg2 };
  }
  const stats = await fsPromises.stat(target);
  return {
    code: 0,
    msg: "success",
    info: {
      path: target,
      size: stats.size
    }
  };
}
async function saveImage(e, array2, width, height, dir, name) {
  const win = electron.BrowserWindow.fromWebContents(e.sender);
  try {
    if (!win) {
      return Promise.resolve({ code: -1, msg: "browser window not found" });
    }
    let imagePath = "";
    if (!dir) {
      const { canceled, filePath } = await electron.dialog.showSaveDialog(win, {
        title: "Save Image",
        defaultPath: name
      });
      if (canceled || !filePath) {
        return Promise.resolve({ code: 0, msg: "" });
      }
      imagePath = filePath;
    } else {
      imagePath = path.join(dir, name);
    }
    const image = new jimp.Jimp({ width, height });
    image.bitmap.data = Buffer.from(array2);
    await image.write(imagePath);
    return { code: 0, msg: "", path: imagePath };
  } catch (err) {
    logger.error(err);
    const msg2 = err instanceof Error ? err.message : "save image unknown error";
    return Promise.resolve({ code: -2, msg: msg2 });
  }
}
function register$5() {
  electron.ipcMain.handle(IpcEvents.EXPLORER_OPEN_FILE, openFile);
  electron.ipcMain.handle(IpcEvents.EXPLORER_READ_FILE, readFile);
  electron.ipcMain.handle(IpcEvents.EXPLORER_SAVE_FILE, saveFile);
  electron.ipcMain.handle(IpcEvents.EXPLORER_SAVE_AS, saveAs);
  electron.ipcMain.handle(IpcEvents.EXPLORER_GET_FILE_INFO, getFileInfo);
  electron.ipcMain.on(IpcEvents.EXPLORER_OPEN_EXPLORER, openExplorer);
  electron.ipcMain.handle(IpcEvents.EXPLORER_OPEN_FOLDER, openFolder);
  electron.ipcMain.handle(IpcEvents.EXPLORER_CREATE_FILE, createFile);
  electron.ipcMain.handle(IpcEvents.EXPLORER_DELETE_FILE, deleteFile);
  electron.ipcMain.handle(IpcEvents.EXPLORER_PACKAGE_FOLDER, packageFolder);
  electron.ipcMain.handle(IpcEvents.EXPLORER_SAVE_IMAGE, saveImage);
}
async function request(_, method, url, headers, parameters) {
  const config = {
    method,
    url,
    headers
  };
  if (["get", "delete"].includes(method.toLowerCase())) {
    config.params = parameters;
  } else if (["post", "put", "patch"].includes(method.toLowerCase())) {
    config.data = parameters;
  }
  try {
    const response = await axios(config);
    return response.data;
  } catch (err) {
    logger.error("[axios request]: %s", err);
    return;
  }
}
function basename(_, value) {
  return path.basename(value);
}
function dirname(_, value) {
  return path.dirname(value);
}
function register$4() {
  electron.ipcMain.handle(IpcEvents.NODE_PATH_BASENAME, basename);
  electron.ipcMain.handle(IpcEvents.NODE_PATH_DIRNAME, dirname);
  electron.ipcMain.handle(IpcEvents.NODE_HTTP_REQUEST, request);
}
async function readdir$1(sftp2, path2) {
  return new Promise((resolve, reject) => {
    sftp2.readdir(path2, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}
async function mkdir$1(sftp2, path2) {
  return new Promise((resolve, reject) => {
    sftp2.mkdir(path2, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
async function rename$1(sftp2, src, dest) {
  return new Promise((resolve, reject) => {
    sftp2.rename(src, dest, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
async function fastGet(sftp2, remote, local, step) {
  return new Promise((resolve, reject) => {
    sftp2.fastGet(remote, local, { step }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
async function fastPut(sftp2, local, remote, step) {
  return new Promise((resolve, reject) => {
    sftp2.fastPut(local, remote, { step }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
async function unlink(sftp2, path2) {
  return new Promise((resolve, reject) => {
    sftp2.unlink(path2, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
async function chmod$1(sftp2, path2, mode) {
  return new Promise((resolve, reject) => {
    sftp2.chmod(path2, mode, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
async function shell(client2, command) {
  return new Promise((resolve, reject) => {
    client2.shell((err, stream) => {
      if (err) {
        reject(err);
      } else {
        stream.on("exit", () => {
          resolve();
        });
        stream.end(command);
      }
    });
  });
}
const Ok = {
  code: 0,
  msg: ""
};
const NoConnection = {
  code: -1,
  msg: "Invalid connection. Please reconnect the device."
};
let client;
let sftp;
function connect$1(e, ip, username, password) {
  const win = electron.BrowserWindow.fromWebContents(e.sender);
  if (!win)
    return;
  if (client)
    disconnect$1();
  client = new ssh2.Client();
  client.on("ready", () => {
    client?.sftp((err, sftpWrapper) => {
      if (err) {
        logger.error("device sftp error: ", err);
        win.webContents.send(IpcEvents.DEVICE_SFTP_STATE, "failed");
        return;
      }
      sftp = sftpWrapper;
      win.webContents.send(IpcEvents.DEVICE_SFTP_STATE, "connected");
    });
  });
  client.on("error", (err) => {
    logger.error("device ssh error: ", err);
    const state = err.level === "client-authentication" ? "authentication" : "failed";
    win.webContents.send(IpcEvents.DEVICE_SFTP_STATE, state);
  });
  client.connect({
    host: ip,
    port: 22,
    username,
    password
  });
}
async function readdir(_, dir) {
  if (!sftp)
    return { ...NoConnection, files: [] };
  try {
    const fileEntries = await readdir$1(sftp, dir);
    const files = fileEntries.map((file) => ({
      filename: file.filename,
      filepath: path.posix.join(dir, file.filename),
      size: file.attrs.size,
      mode: file.attrs.mode,
      mtime: file.attrs.mtime * 1e3,
      isDirectory: file.attrs.isDirectory(),
      isFile: file.attrs.isFile(),
      isSymbolicLink: file.attrs.isSymbolicLink()
    }));
    const sortedFiles = files.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) {
        return -1;
      } else if (!a.isDirectory && b.isDirectory) {
        return 1;
      } else {
        return a.filename.localeCompare(b.filename);
      }
    });
    return { ...Ok, files: sortedFiles };
  } catch (err) {
    const msg2 = err instanceof Error ? err.message : "read directory unknown error";
    return { code: -2, msg: msg2, files: [] };
  }
}
async function mkdir(_, ...args) {
  if (!sftp)
    return NoConnection;
  try {
    await mkdir$1(sftp, path.posix.join(...args));
    return Ok;
  } catch (err) {
    const msg2 = err instanceof Error ? err.message : "mkdir unknown error";
    return { code: -2, msg: msg2 };
  }
}
async function rm(_, files) {
  if (!client || !sftp)
    return NoConnection;
  const dirList = [];
  const fileList = [];
  files.forEach((file) => {
    if (file.isDirectory) {
      dirList.push(file.filepath);
    } else {
      fileList.push(file.filepath);
    }
  });
  try {
    if (dirList.length > 0) {
      let command = "";
      dirList.forEach((dir) => {
        command += `rm -rf '${dir}'
`;
      });
      command += "exit\n";
      await shell(client, command);
    }
    if (fileList.length > 0) {
      for (const file of fileList) {
        await unlink(sftp, file);
      }
    }
    return Ok;
  } catch (err) {
    const msg2 = err instanceof Error ? err.message : "delete file unknown error";
    return { code: -2, msg: msg2 };
  }
}
async function mv(_, filePaths, dir) {
  if (!sftp)
    return NoConnection;
  try {
    for (const filepath of filePaths) {
      const filename = path.posix.basename(filepath);
      const target = path.posix.join(dir, filename);
      await rename$1(sftp, filepath, target);
    }
    return Ok;
  } catch (err) {
    const msg2 = err instanceof Error ? err.message : "move file unknown error";
    return { code: -2, msg: msg2 };
  }
}
async function copy(_, filePaths, dir) {
  if (!client)
    return NoConnection;
  try {
    for (const filepath of filePaths) {
      const filename = path.posix.basename(filepath);
      const target = path.posix.join(dir, filename);
      const command = `cp -R '${filepath}' '${target}'
exit
`;
      await shell(client, command);
    }
    return Ok;
  } catch (err) {
    const msg2 = err instanceof Error ? err.message : "move file unknown error";
    return { code: -2, msg: msg2 };
  }
}
async function rename(_, filepath, filename) {
  if (!sftp)
    return NoConnection;
  try {
    const dir = path.posix.dirname(filepath);
    const target = path.posix.join(dir, filename);
    await rename$1(sftp, filepath, target);
    return Ok;
  } catch (err) {
    const msg2 = err instanceof Error ? err.message : "rename file unknown error";
    return { code: -2, msg: msg2 };
  }
}
async function chmod(_, filepath, mode, recursion) {
  if (!client || !sftp)
    return NoConnection;
  try {
    if (recursion) {
      const command = `chmod -R ${mode} '${filepath}'
exit
`;
      await shell(client, command);
    } else {
      await chmod$1(sftp, filepath, mode);
    }
    return Ok;
  } catch (err) {
    const msg2 = err instanceof Error ? err.message : "chmod file unknown error";
    return { code: -2, msg: msg2 };
  }
}
async function upload(e, workspace, type) {
  if (!sftp)
    return NoConnection;
  const win = electron.BrowserWindow.fromWebContents(e.sender);
  if (!win)
    return { code: -2, msg: "unknown error" };
  const { canceled, filePaths } = await electron.dialog.showOpenDialog(win, {
    properties: type === "file" ? ["openFile", "multiSelections"] : ["openDirectory"],
    filters: type === "file" ? [{ name: "All Files", extensions: ["*"] }] : void 0
  });
  if (canceled)
    return Ok;
  const uploadFile = async (localPath, remotePath) => {
    await fastPut(sftp, localPath, remotePath, (total, _, fsize) => {
      win.webContents.send(IpcEvents.DEVICE_SFTP_UPLOAD_PROGRESS, {
        filename: path.posix.basename(remotePath),
        filepath: remotePath,
        progress: Math.floor(total / fsize * 100)
      });
    });
  };
  const uploadDir = async (localDir, remoteDir) => {
    const direntList = await fsPromises.readdir(localDir, { withFileTypes: true });
    try {
      await mkdir$1(sftp, remoteDir);
    } catch (err) {
    }
    for (const dirent of direntList) {
      const localPath = path.join(dirent.path, dirent.name);
      const remotePath = path.posix.join(remoteDir, dirent.name);
      if (dirent.isDirectory()) {
        await uploadDir(localPath, remotePath);
      } else {
        await uploadFile(localPath, remotePath);
      }
    }
  };
  try {
    if (type === "file") {
      await Promise.all(
        filePaths.map(async (filepath) => {
          const filename = path.basename(filepath);
          const remotePath = path.posix.join(workspace, filename);
          await uploadFile(filepath, remotePath);
        })
      );
    } else {
      const source = filePaths[0];
      const filename = path.basename(source);
      const remoteDir = path.posix.join(workspace, filename);
      await uploadDir(source, remoteDir);
    }
    return Ok;
  } catch (err) {
    const msg2 = err instanceof Error ? err.message : "upload file unknown error";
    return { code: -3, msg: msg2 };
  }
}
async function download(e, files) {
  if (!sftp)
    return NoConnection;
  const win = electron.BrowserWindow.fromWebContents(e.sender);
  if (!win) {
    return { code: -2, msg: "unknown error" };
  }
  const { canceled, filePaths } = await electron.dialog.showOpenDialog(win, {
    properties: ["openDirectory"]
  });
  if (canceled)
    return Ok;
  const downloadFile = async (remotePath, localPath) => {
    await fastGet(sftp, remotePath, localPath, (total, _, fsize) => {
      win.webContents.send(IpcEvents.DEVICE_SFTP_DOWNLOAD_PROGRESS, {
        filename: path.posix.basename(remotePath),
        filepath: remotePath,
        progress: Math.floor(total / fsize * 100)
      });
    });
  };
  const downloadDir = async (remoteDir, localDir) => {
    try {
      await fsPromises.mkdir(localDir);
    } catch (err) {
    }
    const files2 = await readdir$1(sftp, remoteDir);
    for (const file of files2) {
      const remotePath = path.posix.join(remoteDir, file.filename);
      const localPath = path.join(localDir, file.filename);
      if (file.attrs.isDirectory()) {
        await downloadDir(remotePath, localPath);
      } else {
        await downloadFile(remotePath, localPath);
      }
    }
  };
  try {
    for (const file of files) {
      const localPath = path.join(filePaths[0], file.filename);
      if (file.isDirectory) {
        await downloadDir(file.filepath, localPath);
      } else {
        await downloadFile(file.filepath, localPath);
      }
    }
    return Ok;
  } catch (err) {
    const msg2 = err instanceof Error ? err.message : "download file unknown error";
    return { code: -3, msg: msg2 };
  }
}
function disconnect$1() {
  if (sftp) {
    sftp.end();
    sftp = void 0;
  }
  if (client) {
    client.end();
    client = void 0;
  }
}
function register$3() {
  electron.ipcMain.on(IpcEvents.DEVICE_SFTP_CONNECT, connect$1);
  electron.ipcMain.on(IpcEvents.DEVICE_SFTP_DISCONNECT, disconnect$1);
  electron.ipcMain.handle(IpcEvents.DEVICE_SFTP_READDIR, readdir);
  electron.ipcMain.handle(IpcEvents.DEVICE_SFTP_MKDIR, mkdir);
  electron.ipcMain.handle(IpcEvents.DEVICE_SFTP_RM, rm);
  electron.ipcMain.handle(IpcEvents.DEVICE_SFTP_MV, mv);
  electron.ipcMain.handle(IpcEvents.DEVICE_SFTP_COPY, copy);
  electron.ipcMain.handle(IpcEvents.DEVICE_SFTP_RENAME, rename);
  electron.ipcMain.handle(IpcEvents.DEVICE_SFTP_CHMOD, chmod);
  electron.ipcMain.handle(IpcEvents.DEVICE_SFTP_UPLOAD, upload);
  electron.ipcMain.handle(IpcEvents.DEVICE_SFTP_DOWNLOAD, download);
}
const State = {
  hasUnsavedFile: true
};
function register$2() {
  electron.ipcMain.on(IpcEvents.STATE_HAS_UNSAVED_FILE, setHasUnsavedFile);
}
function setHasUnsavedFile(_, hasUnsavedFile) {
  State.hasUnsavedFile = hasUnsavedFile;
  if (!hasUnsavedFile) {
    electron.app.quit();
  }
}
class SshManager {
  connection;
  shells;
  isConnected;
  constructor() {
    this.connection = null;
    this.shells = /* @__PURE__ */ new Map();
    this.isConnected = false;
  }
  async connect(config) {
    if (this.isConnected) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      this.connection = new ssh2.Client();
      this.connection.on("ready", () => {
        this.isConnected = true;
        resolve();
      });
      this.connection.on("error", (err) => {
        this.isConnected = false;
        reject(err);
      });
      this.connection.on("end", () => {
        this.isConnected = false;
        this.shells.clear();
      });
      this.connection.on("close", () => {
        this.isConnected = false;
        this.shells.clear();
      });
      this.connection?.connect(config);
    });
  }
  createShell(id) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected || !this.connection) {
        reject(new Error("SSH connection not established"));
        return;
      }
      this.connection.shell(
        {
          term: "xterm-256color"
        },
        (err, stream) => {
          if (err) {
            reject(err);
            return;
          }
          this.shells.set(id, stream);
          resolve(stream);
        }
      );
    });
  }
  writeToShell(id, data) {
    const shell2 = this.shells.get(id);
    if (shell2) {
      shell2.write(data);
    }
  }
  resize(id, size) {
    const shell2 = this.shells.get(id);
    if (shell2) {
      shell2.setWindow(size.rows, size.cols, size.height, size.width);
    }
  }
  closeShell(id) {
    const shell2 = this.shells.get(id);
    if (shell2) {
      shell2.close();
      this.shells.delete(id);
    }
  }
  disconnect() {
    if (this.connection) {
      Array.from(this.shells.values()).forEach((shell2) => shell2.close());
      this.shells.clear();
      this.connection.destroy();
      this.isConnected = false;
      this.connection = null;
    }
  }
  isConnectionActive() {
    return this.isConnected;
  }
}
const sshManager = new SshManager();
async function connect(_, config) {
  try {
    await sshManager.connect(config);
    return { code: 0, msg: "", state: "connected" };
  } catch (err) {
    logger.error("[connect ssh]: ", err);
    return {
      code: -1,
      msg: err instanceof Error ? err.message : "Unknown error",
      state: err.level === "client-authentication" ? "authentication" : "failed"
    };
  }
}
async function createShell(e, id) {
  try {
    const stream = await sshManager.createShell(id);
    stream.on("data", (data) => {
      const rsp = {
        id,
        data: data.toString()
      };
      e.sender.send(IpcEvents.DEVICE_SSH_RESPONSE, rsp);
    });
    return { code: 0, msg: "", state: "connected" };
  } catch (err) {
    logger.error("[create shell]: ", err);
    return {
      code: -1,
      msg: err instanceof Error ? err.message : "Unknown error",
      state: "failed"
    };
  }
}
function write(_, { id, type, data }) {
  if (type === "COMMAND") {
    sshManager.writeToShell(id, data);
  } else if (type === "RESIZE") {
    const size = JSON.parse(data);
    sshManager.resize(id, size);
  }
}
function closeShell(_, id) {
  sshManager.closeShell(id);
}
function disconnect() {
  sshManager.disconnect();
}
function register$1() {
  electron.ipcMain.handle(IpcEvents.DEVICE_SSH_CONNECT, connect);
  electron.ipcMain.handle(IpcEvents.DEVICE_SSH_CREATE_SHELL, createShell);
  electron.ipcMain.on(IpcEvents.DEVICE_SSH_WRITE, write);
  electron.ipcMain.on(IpcEvents.DEVICE_SSH_CLOSE_SHELL, closeShell);
  electron.ipcMain.on(IpcEvents.DEVICE_SSH_DISCONNECT, disconnect);
}
function minimize(e) {
  electron.BrowserWindow.fromWebContents(e.sender)?.minimize();
}
function maximize(e) {
  const win = electron.BrowserWindow.fromWebContents(e.sender);
  if (!win)
    return;
  if (win.isFullScreen()) {
    win.setFullScreen(false);
    win.unmaximize();
  } else if (win.isMaximized()) {
    win.unmaximize();
  } else {
    win.maximize();
  }
}
function close(e) {
  electron.BrowserWindow.fromWebContents(e.sender)?.close();
}
function getTheme() {
  return electron.nativeTheme.shouldUseDarkColors ? "dark" : "light";
}
function register() {
  electron.ipcMain.on(IpcEvents.UI_MINIMIZE_WINDOW, minimize);
  electron.ipcMain.on(IpcEvents.UI_MAXIMIZE_WINDOW, maximize);
  electron.ipcMain.on(IpcEvents.UI_CLOSE_WINDOW, close);
  electron.ipcMain.handle(IpcEvents.UI_SYSTEM_THEME, getTheme);
}
function registerMainEvents$1(win) {
  win.on("maximize", () => {
    win.webContents.send(IpcEvents.UI_IS_WINDOW_MAXIMIZED, true, false);
  });
  win.on("unmaximize", () => {
    win.webContents.send(IpcEvents.UI_IS_WINDOW_MAXIMIZED, false, false);
  });
  win.on("enter-full-screen", () => {
    win.webContents.send(IpcEvents.UI_IS_WINDOW_MAXIMIZED, true, true);
  });
  win.on("leave-full-screen", () => {
    win.webContents.send(IpcEvents.UI_IS_WINDOW_MAXIMIZED, true, false);
  });
  win.on("close", async (event) => {
    win.webContents.send(IpcEvents.APP_BEFORE_QUIT);
    if (State.hasUnsavedFile) {
      event.preventDefault();
    }
  });
}
function registerRendererEvents() {
  register$7();
  register$8();
  register$6();
  register$3();
  register$1();
  register$5();
  register();
  register$2();
  register$4();
}
function registerMainEvents(win) {
  registerMainEvents$1(win);
}
function closeWebsocket() {
  disconnect$2();
}
class DisposableCollection {
  disposables = [];
  dispose() {
    while (this.disposables.length !== 0) {
      this.disposables.pop().dispose();
    }
  }
  push(disposable2) {
    const disposables = this.disposables;
    disposables.push(disposable2);
    return {
      dispose() {
        const index = disposables.indexOf(disposable2);
        if (index !== -1) {
          disposables.splice(index, 1);
        }
      }
    };
  }
}
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
var messageReader = {};
var ral = {};
Object.defineProperty(ral, "__esModule", { value: true });
let _ral;
function RAL() {
  if (_ral === void 0) {
    throw new Error(`No runtime abstraction layer installed`);
  }
  return _ral;
}
(function(RAL2) {
  function install(ral2) {
    if (ral2 === void 0) {
      throw new Error(`No runtime abstraction layer provided`);
    }
    _ral = ral2;
  }
  RAL2.install = install;
})(RAL || (RAL = {}));
ral.default = RAL;
var is = {};
Object.defineProperty(is, "__esModule", { value: true });
is.stringArray = is.array = is.func = is.error = is.number = is.string = is.boolean = void 0;
function boolean(value) {
  return value === true || value === false;
}
is.boolean = boolean;
function string(value) {
  return typeof value === "string" || value instanceof String;
}
is.string = string;
function number(value) {
  return typeof value === "number" || value instanceof Number;
}
is.number = number;
function error(value) {
  return value instanceof Error;
}
is.error = error;
function func(value) {
  return typeof value === "function";
}
is.func = func;
function array(value) {
  return Array.isArray(value);
}
is.array = array;
function stringArray(value) {
  return array(value) && value.every((elem) => string(elem));
}
is.stringArray = stringArray;
var events = {};
Object.defineProperty(events, "__esModule", { value: true });
events.Emitter = events.Event = void 0;
const ral_1$3 = ral;
var Event;
(function(Event2) {
  const _disposable = { dispose() {
  } };
  Event2.None = function() {
    return _disposable;
  };
})(Event || (events.Event = Event = {}));
class CallbackList {
  add(callback, context = null, bucket) {
    if (!this._callbacks) {
      this._callbacks = [];
      this._contexts = [];
    }
    this._callbacks.push(callback);
    this._contexts.push(context);
    if (Array.isArray(bucket)) {
      bucket.push({ dispose: () => this.remove(callback, context) });
    }
  }
  remove(callback, context = null) {
    if (!this._callbacks) {
      return;
    }
    let foundCallbackWithDifferentContext = false;
    for (let i = 0, len = this._callbacks.length; i < len; i++) {
      if (this._callbacks[i] === callback) {
        if (this._contexts[i] === context) {
          this._callbacks.splice(i, 1);
          this._contexts.splice(i, 1);
          return;
        } else {
          foundCallbackWithDifferentContext = true;
        }
      }
    }
    if (foundCallbackWithDifferentContext) {
      throw new Error("When adding a listener with a context, you should remove it with the same context");
    }
  }
  invoke(...args) {
    if (!this._callbacks) {
      return [];
    }
    const ret = [], callbacks = this._callbacks.slice(0), contexts = this._contexts.slice(0);
    for (let i = 0, len = callbacks.length; i < len; i++) {
      try {
        ret.push(callbacks[i].apply(contexts[i], args));
      } catch (e) {
        (0, ral_1$3.default)().console.error(e);
      }
    }
    return ret;
  }
  isEmpty() {
    return !this._callbacks || this._callbacks.length === 0;
  }
  dispose() {
    this._callbacks = void 0;
    this._contexts = void 0;
  }
}
class Emitter {
  constructor(_options) {
    this._options = _options;
  }
  /**
   * For the public to allow to subscribe
   * to events from this Emitter
   */
  get event() {
    if (!this._event) {
      this._event = (listener, thisArgs, disposables) => {
        if (!this._callbacks) {
          this._callbacks = new CallbackList();
        }
        if (this._options && this._options.onFirstListenerAdd && this._callbacks.isEmpty()) {
          this._options.onFirstListenerAdd(this);
        }
        this._callbacks.add(listener, thisArgs);
        const result = {
          dispose: () => {
            if (!this._callbacks) {
              return;
            }
            this._callbacks.remove(listener, thisArgs);
            result.dispose = Emitter._noop;
            if (this._options && this._options.onLastListenerRemove && this._callbacks.isEmpty()) {
              this._options.onLastListenerRemove(this);
            }
          }
        };
        if (Array.isArray(disposables)) {
          disposables.push(result);
        }
        return result;
      };
    }
    return this._event;
  }
  /**
   * To be kept private to fire an event to
   * subscribers
   */
  fire(event) {
    if (this._callbacks) {
      this._callbacks.invoke.call(this._callbacks, event);
    }
  }
  dispose() {
    if (this._callbacks) {
      this._callbacks.dispose();
      this._callbacks = void 0;
    }
  }
}
events.Emitter = Emitter;
Emitter._noop = function() {
};
var semaphore = {};
Object.defineProperty(semaphore, "__esModule", { value: true });
semaphore.Semaphore = void 0;
const ral_1$2 = ral;
class Semaphore {
  constructor(capacity = 1) {
    if (capacity <= 0) {
      throw new Error("Capacity must be greater than 0");
    }
    this._capacity = capacity;
    this._active = 0;
    this._waiting = [];
  }
  lock(thunk) {
    return new Promise((resolve, reject) => {
      this._waiting.push({ thunk, resolve, reject });
      this.runNext();
    });
  }
  get active() {
    return this._active;
  }
  runNext() {
    if (this._waiting.length === 0 || this._active === this._capacity) {
      return;
    }
    (0, ral_1$2.default)().timer.setImmediate(() => this.doRunNext());
  }
  doRunNext() {
    if (this._waiting.length === 0 || this._active === this._capacity) {
      return;
    }
    const next = this._waiting.shift();
    this._active++;
    if (this._active > this._capacity) {
      throw new Error(`To many thunks active`);
    }
    try {
      const result = next.thunk();
      if (result instanceof Promise) {
        result.then((value) => {
          this._active--;
          next.resolve(value);
          this.runNext();
        }, (err) => {
          this._active--;
          next.reject(err);
          this.runNext();
        });
      } else {
        this._active--;
        next.resolve(result);
        this.runNext();
      }
    } catch (err) {
      this._active--;
      next.reject(err);
      this.runNext();
    }
  }
}
semaphore.Semaphore = Semaphore;
Object.defineProperty(messageReader, "__esModule", { value: true });
messageReader.ReadableStreamMessageReader = AbstractMessageReader_1 = messageReader.AbstractMessageReader = messageReader.MessageReader = void 0;
const ral_1$1 = ral;
const Is$1 = is;
const events_1$1 = events;
const semaphore_1$1 = semaphore;
var MessageReader;
(function(MessageReader2) {
  function is2(value) {
    let candidate = value;
    return candidate && Is$1.func(candidate.listen) && Is$1.func(candidate.dispose) && Is$1.func(candidate.onError) && Is$1.func(candidate.onClose) && Is$1.func(candidate.onPartialMessage);
  }
  MessageReader2.is = is2;
})(MessageReader || (messageReader.MessageReader = MessageReader = {}));
class AbstractMessageReader {
  constructor() {
    this.errorEmitter = new events_1$1.Emitter();
    this.closeEmitter = new events_1$1.Emitter();
    this.partialMessageEmitter = new events_1$1.Emitter();
  }
  dispose() {
    this.errorEmitter.dispose();
    this.closeEmitter.dispose();
  }
  get onError() {
    return this.errorEmitter.event;
  }
  fireError(error2) {
    this.errorEmitter.fire(this.asError(error2));
  }
  get onClose() {
    return this.closeEmitter.event;
  }
  fireClose() {
    this.closeEmitter.fire(void 0);
  }
  get onPartialMessage() {
    return this.partialMessageEmitter.event;
  }
  firePartialMessage(info) {
    this.partialMessageEmitter.fire(info);
  }
  asError(error2) {
    if (error2 instanceof Error) {
      return error2;
    } else {
      return new Error(`Reader received error. Reason: ${Is$1.string(error2.message) ? error2.message : "unknown"}`);
    }
  }
}
var AbstractMessageReader_1 = messageReader.AbstractMessageReader = AbstractMessageReader;
var ResolvedMessageReaderOptions;
(function(ResolvedMessageReaderOptions2) {
  function fromOptions(options) {
    let charset;
    let contentDecoder;
    const contentDecoders = /* @__PURE__ */ new Map();
    let contentTypeDecoder;
    const contentTypeDecoders = /* @__PURE__ */ new Map();
    if (options === void 0 || typeof options === "string") {
      charset = options ?? "utf-8";
    } else {
      charset = options.charset ?? "utf-8";
      if (options.contentDecoder !== void 0) {
        contentDecoder = options.contentDecoder;
        contentDecoders.set(contentDecoder.name, contentDecoder);
      }
      if (options.contentDecoders !== void 0) {
        for (const decoder of options.contentDecoders) {
          contentDecoders.set(decoder.name, decoder);
        }
      }
      if (options.contentTypeDecoder !== void 0) {
        contentTypeDecoder = options.contentTypeDecoder;
        contentTypeDecoders.set(contentTypeDecoder.name, contentTypeDecoder);
      }
      if (options.contentTypeDecoders !== void 0) {
        for (const decoder of options.contentTypeDecoders) {
          contentTypeDecoders.set(decoder.name, decoder);
        }
      }
    }
    if (contentTypeDecoder === void 0) {
      contentTypeDecoder = (0, ral_1$1.default)().applicationJson.decoder;
      contentTypeDecoders.set(contentTypeDecoder.name, contentTypeDecoder);
    }
    return { charset, contentDecoder, contentDecoders, contentTypeDecoder, contentTypeDecoders };
  }
  ResolvedMessageReaderOptions2.fromOptions = fromOptions;
})(ResolvedMessageReaderOptions || (ResolvedMessageReaderOptions = {}));
class ReadableStreamMessageReader extends AbstractMessageReader {
  constructor(readable, options) {
    super();
    this.readable = readable;
    this.options = ResolvedMessageReaderOptions.fromOptions(options);
    this.buffer = (0, ral_1$1.default)().messageBuffer.create(this.options.charset);
    this._partialMessageTimeout = 1e4;
    this.nextMessageLength = -1;
    this.messageToken = 0;
    this.readSemaphore = new semaphore_1$1.Semaphore(1);
  }
  set partialMessageTimeout(timeout) {
    this._partialMessageTimeout = timeout;
  }
  get partialMessageTimeout() {
    return this._partialMessageTimeout;
  }
  listen(callback) {
    this.nextMessageLength = -1;
    this.messageToken = 0;
    this.partialMessageTimer = void 0;
    this.callback = callback;
    const result = this.readable.onData((data) => {
      this.onData(data);
    });
    this.readable.onError((error2) => this.fireError(error2));
    this.readable.onClose(() => this.fireClose());
    return result;
  }
  onData(data) {
    try {
      this.buffer.append(data);
      while (true) {
        if (this.nextMessageLength === -1) {
          const headers = this.buffer.tryReadHeaders(true);
          if (!headers) {
            return;
          }
          const contentLength = headers.get("content-length");
          if (!contentLength) {
            this.fireError(new Error(`Header must provide a Content-Length property.
${JSON.stringify(Object.fromEntries(headers))}`));
            return;
          }
          const length = parseInt(contentLength);
          if (isNaN(length)) {
            this.fireError(new Error(`Content-Length value must be a number. Got ${contentLength}`));
            return;
          }
          this.nextMessageLength = length;
        }
        const body = this.buffer.tryReadBody(this.nextMessageLength);
        if (body === void 0) {
          this.setPartialMessageTimer();
          return;
        }
        this.clearPartialMessageTimer();
        this.nextMessageLength = -1;
        this.readSemaphore.lock(async () => {
          const bytes = this.options.contentDecoder !== void 0 ? await this.options.contentDecoder.decode(body) : body;
          const message = await this.options.contentTypeDecoder.decode(bytes, this.options);
          this.callback(message);
        }).catch((error2) => {
          this.fireError(error2);
        });
      }
    } catch (error2) {
      this.fireError(error2);
    }
  }
  clearPartialMessageTimer() {
    if (this.partialMessageTimer) {
      this.partialMessageTimer.dispose();
      this.partialMessageTimer = void 0;
    }
  }
  setPartialMessageTimer() {
    this.clearPartialMessageTimer();
    if (this._partialMessageTimeout <= 0) {
      return;
    }
    this.partialMessageTimer = (0, ral_1$1.default)().timer.setTimeout((token, timeout) => {
      this.partialMessageTimer = void 0;
      if (token === this.messageToken) {
        this.firePartialMessage({ messageToken: token, waitingTime: timeout });
        this.setPartialMessageTimer();
      }
    }, this._partialMessageTimeout, this.messageToken, this._partialMessageTimeout);
  }
}
messageReader.ReadableStreamMessageReader = ReadableStreamMessageReader;
class WebSocketMessageReader extends AbstractMessageReader_1 {
  socket;
  state = "initial";
  callback;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  events = [];
  constructor(socket) {
    super();
    this.socket = socket;
    this.socket.onMessage((message) => this.readMessage(message));
    this.socket.onError((error2) => this.fireError(error2));
    this.socket.onClose((code, reason) => {
      if (code !== 1e3) {
        const error2 = {
          name: "" + code,
          message: `Error during socket reconnect: code = ${code}, reason = ${reason}`
        };
        this.fireError(error2);
      }
      this.fireClose();
    });
  }
  listen(callback) {
    if (this.state === "initial") {
      this.state = "listening";
      this.callback = callback;
      while (this.events.length !== 0) {
        const event = this.events.pop();
        if (event.message) {
          this.readMessage(event.message);
        } else if (event.error) {
          this.fireError(event.error);
        } else {
          this.fireClose();
        }
      }
    }
    return {
      dispose: () => {
        if (this.callback === callback) {
          this.state = "initial";
          this.callback = void 0;
        }
      }
    };
  }
  dispose() {
    super.dispose();
    this.state = "initial";
    this.callback = void 0;
    this.events.splice(0, this.events.length);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readMessage(message) {
    if (this.state === "initial") {
      this.events.splice(0, 0, { message });
    } else if (this.state === "listening") {
      try {
        const data = JSON.parse(message);
        this.callback(data);
      } catch (err) {
        const error2 = {
          name: "400",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          message: `Error during message parsing, reason = ${typeof err === "object" ? err.message : "unknown"}`
        };
        this.fireError(error2);
      }
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fireError(error2) {
    if (this.state === "initial") {
      this.events.splice(0, 0, { error: error2 });
    } else if (this.state === "listening") {
      super.fireError(error2);
    }
  }
  fireClose() {
    if (this.state === "initial") {
      this.events.splice(0, 0, {});
    } else if (this.state === "listening") {
      super.fireClose();
    }
    this.state = "closed";
  }
}
var messageWriter = {};
Object.defineProperty(messageWriter, "__esModule", { value: true });
messageWriter.WriteableStreamMessageWriter = AbstractMessageWriter_1 = messageWriter.AbstractMessageWriter = messageWriter.MessageWriter = void 0;
const ral_1 = ral;
const Is = is;
const semaphore_1 = semaphore;
const events_1 = events;
const ContentLength = "Content-Length: ";
const CRLF = "\r\n";
var MessageWriter;
(function(MessageWriter2) {
  function is2(value) {
    let candidate = value;
    return candidate && Is.func(candidate.dispose) && Is.func(candidate.onClose) && Is.func(candidate.onError) && Is.func(candidate.write);
  }
  MessageWriter2.is = is2;
})(MessageWriter || (messageWriter.MessageWriter = MessageWriter = {}));
class AbstractMessageWriter {
  constructor() {
    this.errorEmitter = new events_1.Emitter();
    this.closeEmitter = new events_1.Emitter();
  }
  dispose() {
    this.errorEmitter.dispose();
    this.closeEmitter.dispose();
  }
  get onError() {
    return this.errorEmitter.event;
  }
  fireError(error2, message, count) {
    this.errorEmitter.fire([this.asError(error2), message, count]);
  }
  get onClose() {
    return this.closeEmitter.event;
  }
  fireClose() {
    this.closeEmitter.fire(void 0);
  }
  asError(error2) {
    if (error2 instanceof Error) {
      return error2;
    } else {
      return new Error(`Writer received error. Reason: ${Is.string(error2.message) ? error2.message : "unknown"}`);
    }
  }
}
var AbstractMessageWriter_1 = messageWriter.AbstractMessageWriter = AbstractMessageWriter;
var ResolvedMessageWriterOptions;
(function(ResolvedMessageWriterOptions2) {
  function fromOptions(options) {
    if (options === void 0 || typeof options === "string") {
      return { charset: options ?? "utf-8", contentTypeEncoder: (0, ral_1.default)().applicationJson.encoder };
    } else {
      return { charset: options.charset ?? "utf-8", contentEncoder: options.contentEncoder, contentTypeEncoder: options.contentTypeEncoder ?? (0, ral_1.default)().applicationJson.encoder };
    }
  }
  ResolvedMessageWriterOptions2.fromOptions = fromOptions;
})(ResolvedMessageWriterOptions || (ResolvedMessageWriterOptions = {}));
class WriteableStreamMessageWriter extends AbstractMessageWriter {
  constructor(writable, options) {
    super();
    this.writable = writable;
    this.options = ResolvedMessageWriterOptions.fromOptions(options);
    this.errorCount = 0;
    this.writeSemaphore = new semaphore_1.Semaphore(1);
    this.writable.onError((error2) => this.fireError(error2));
    this.writable.onClose(() => this.fireClose());
  }
  async write(msg2) {
    return this.writeSemaphore.lock(async () => {
      const payload = this.options.contentTypeEncoder.encode(msg2, this.options).then((buffer) => {
        if (this.options.contentEncoder !== void 0) {
          return this.options.contentEncoder.encode(buffer);
        } else {
          return buffer;
        }
      });
      return payload.then((buffer) => {
        const headers = [];
        headers.push(ContentLength, buffer.byteLength.toString(), CRLF);
        headers.push(CRLF);
        return this.doWrite(msg2, headers, buffer);
      }, (error2) => {
        this.fireError(error2);
        throw error2;
      });
    });
  }
  async doWrite(msg2, headers, data) {
    try {
      await this.writable.write(headers.join(""), "ascii");
      return this.writable.write(data);
    } catch (error2) {
      this.handleError(error2, msg2);
      return Promise.reject(error2);
    }
  }
  handleError(error2, msg2) {
    this.errorCount++;
    this.fireError(error2, msg2, this.errorCount);
  }
  end() {
    this.writable.end();
  }
}
messageWriter.WriteableStreamMessageWriter = WriteableStreamMessageWriter;
class WebSocketMessageWriter extends AbstractMessageWriter_1 {
  errorCount = 0;
  socket;
  constructor(socket) {
    super();
    this.socket = socket;
  }
  end() {
  }
  async write(msg2) {
    try {
      const content = JSON.stringify(msg2);
      this.socket.send(content);
    } catch (e) {
      this.errorCount++;
      this.fireError(e, msg2, this.errorCount);
    }
  }
}
var main = {};
var ril = {};
var api = {};
var messages = {};
var hasRequiredMessages;
function requireMessages() {
  if (hasRequiredMessages)
    return messages;
  hasRequiredMessages = 1;
  Object.defineProperty(messages, "__esModule", { value: true });
  messages.Message = messages.NotificationType9 = messages.NotificationType8 = messages.NotificationType7 = messages.NotificationType6 = messages.NotificationType5 = messages.NotificationType4 = messages.NotificationType3 = messages.NotificationType2 = messages.NotificationType1 = messages.NotificationType0 = messages.NotificationType = messages.RequestType9 = messages.RequestType8 = messages.RequestType7 = messages.RequestType6 = messages.RequestType5 = messages.RequestType4 = messages.RequestType3 = messages.RequestType2 = messages.RequestType1 = messages.RequestType = messages.RequestType0 = messages.AbstractMessageSignature = messages.ParameterStructures = messages.ResponseError = messages.ErrorCodes = void 0;
  const is$1 = is;
  var ErrorCodes;
  (function(ErrorCodes2) {
    ErrorCodes2.ParseError = -32700;
    ErrorCodes2.InvalidRequest = -32600;
    ErrorCodes2.MethodNotFound = -32601;
    ErrorCodes2.InvalidParams = -32602;
    ErrorCodes2.InternalError = -32603;
    ErrorCodes2.jsonrpcReservedErrorRangeStart = -32099;
    ErrorCodes2.serverErrorStart = -32099;
    ErrorCodes2.MessageWriteError = -32099;
    ErrorCodes2.MessageReadError = -32098;
    ErrorCodes2.PendingResponseRejected = -32097;
    ErrorCodes2.ConnectionInactive = -32096;
    ErrorCodes2.ServerNotInitialized = -32002;
    ErrorCodes2.UnknownErrorCode = -32001;
    ErrorCodes2.jsonrpcReservedErrorRangeEnd = -32e3;
    ErrorCodes2.serverErrorEnd = -32e3;
  })(ErrorCodes || (messages.ErrorCodes = ErrorCodes = {}));
  class ResponseError extends Error {
    constructor(code, message, data) {
      super(message);
      this.code = is$1.number(code) ? code : ErrorCodes.UnknownErrorCode;
      this.data = data;
      Object.setPrototypeOf(this, ResponseError.prototype);
    }
    toJson() {
      const result = {
        code: this.code,
        message: this.message
      };
      if (this.data !== void 0) {
        result.data = this.data;
      }
      return result;
    }
  }
  messages.ResponseError = ResponseError;
  class ParameterStructures {
    constructor(kind) {
      this.kind = kind;
    }
    static is(value) {
      return value === ParameterStructures.auto || value === ParameterStructures.byName || value === ParameterStructures.byPosition;
    }
    toString() {
      return this.kind;
    }
  }
  messages.ParameterStructures = ParameterStructures;
  ParameterStructures.auto = new ParameterStructures("auto");
  ParameterStructures.byPosition = new ParameterStructures("byPosition");
  ParameterStructures.byName = new ParameterStructures("byName");
  class AbstractMessageSignature {
    constructor(method, numberOfParams) {
      this.method = method;
      this.numberOfParams = numberOfParams;
    }
    get parameterStructures() {
      return ParameterStructures.auto;
    }
  }
  messages.AbstractMessageSignature = AbstractMessageSignature;
  class RequestType0 extends AbstractMessageSignature {
    constructor(method) {
      super(method, 0);
    }
  }
  messages.RequestType0 = RequestType0;
  class RequestType extends AbstractMessageSignature {
    constructor(method, _parameterStructures = ParameterStructures.auto) {
      super(method, 1);
      this._parameterStructures = _parameterStructures;
    }
    get parameterStructures() {
      return this._parameterStructures;
    }
  }
  messages.RequestType = RequestType;
  class RequestType1 extends AbstractMessageSignature {
    constructor(method, _parameterStructures = ParameterStructures.auto) {
      super(method, 1);
      this._parameterStructures = _parameterStructures;
    }
    get parameterStructures() {
      return this._parameterStructures;
    }
  }
  messages.RequestType1 = RequestType1;
  class RequestType2 extends AbstractMessageSignature {
    constructor(method) {
      super(method, 2);
    }
  }
  messages.RequestType2 = RequestType2;
  class RequestType3 extends AbstractMessageSignature {
    constructor(method) {
      super(method, 3);
    }
  }
  messages.RequestType3 = RequestType3;
  class RequestType4 extends AbstractMessageSignature {
    constructor(method) {
      super(method, 4);
    }
  }
  messages.RequestType4 = RequestType4;
  class RequestType5 extends AbstractMessageSignature {
    constructor(method) {
      super(method, 5);
    }
  }
  messages.RequestType5 = RequestType5;
  class RequestType6 extends AbstractMessageSignature {
    constructor(method) {
      super(method, 6);
    }
  }
  messages.RequestType6 = RequestType6;
  class RequestType7 extends AbstractMessageSignature {
    constructor(method) {
      super(method, 7);
    }
  }
  messages.RequestType7 = RequestType7;
  class RequestType8 extends AbstractMessageSignature {
    constructor(method) {
      super(method, 8);
    }
  }
  messages.RequestType8 = RequestType8;
  class RequestType9 extends AbstractMessageSignature {
    constructor(method) {
      super(method, 9);
    }
  }
  messages.RequestType9 = RequestType9;
  class NotificationType extends AbstractMessageSignature {
    constructor(method, _parameterStructures = ParameterStructures.auto) {
      super(method, 1);
      this._parameterStructures = _parameterStructures;
    }
    get parameterStructures() {
      return this._parameterStructures;
    }
  }
  messages.NotificationType = NotificationType;
  class NotificationType0 extends AbstractMessageSignature {
    constructor(method) {
      super(method, 0);
    }
  }
  messages.NotificationType0 = NotificationType0;
  class NotificationType1 extends AbstractMessageSignature {
    constructor(method, _parameterStructures = ParameterStructures.auto) {
      super(method, 1);
      this._parameterStructures = _parameterStructures;
    }
    get parameterStructures() {
      return this._parameterStructures;
    }
  }
  messages.NotificationType1 = NotificationType1;
  class NotificationType2 extends AbstractMessageSignature {
    constructor(method) {
      super(method, 2);
    }
  }
  messages.NotificationType2 = NotificationType2;
  class NotificationType3 extends AbstractMessageSignature {
    constructor(method) {
      super(method, 3);
    }
  }
  messages.NotificationType3 = NotificationType3;
  class NotificationType4 extends AbstractMessageSignature {
    constructor(method) {
      super(method, 4);
    }
  }
  messages.NotificationType4 = NotificationType4;
  class NotificationType5 extends AbstractMessageSignature {
    constructor(method) {
      super(method, 5);
    }
  }
  messages.NotificationType5 = NotificationType5;
  class NotificationType6 extends AbstractMessageSignature {
    constructor(method) {
      super(method, 6);
    }
  }
  messages.NotificationType6 = NotificationType6;
  class NotificationType7 extends AbstractMessageSignature {
    constructor(method) {
      super(method, 7);
    }
  }
  messages.NotificationType7 = NotificationType7;
  class NotificationType8 extends AbstractMessageSignature {
    constructor(method) {
      super(method, 8);
    }
  }
  messages.NotificationType8 = NotificationType8;
  class NotificationType9 extends AbstractMessageSignature {
    constructor(method) {
      super(method, 9);
    }
  }
  messages.NotificationType9 = NotificationType9;
  var Message;
  (function(Message2) {
    function isRequest(message) {
      const candidate = message;
      return candidate && is$1.string(candidate.method) && (is$1.string(candidate.id) || is$1.number(candidate.id));
    }
    Message2.isRequest = isRequest;
    function isNotification(message) {
      const candidate = message;
      return candidate && is$1.string(candidate.method) && message.id === void 0;
    }
    Message2.isNotification = isNotification;
    function isResponse(message) {
      const candidate = message;
      return candidate && (candidate.result !== void 0 || !!candidate.error) && (is$1.string(candidate.id) || is$1.number(candidate.id) || candidate.id === null);
    }
    Message2.isResponse = isResponse;
  })(Message || (messages.Message = Message = {}));
  return messages;
}
var linkedMap = {};
var hasRequiredLinkedMap;
function requireLinkedMap() {
  if (hasRequiredLinkedMap)
    return linkedMap;
  hasRequiredLinkedMap = 1;
  var _a;
  Object.defineProperty(linkedMap, "__esModule", { value: true });
  linkedMap.LRUCache = linkedMap.LinkedMap = linkedMap.Touch = void 0;
  var Touch;
  (function(Touch2) {
    Touch2.None = 0;
    Touch2.First = 1;
    Touch2.AsOld = Touch2.First;
    Touch2.Last = 2;
    Touch2.AsNew = Touch2.Last;
  })(Touch || (linkedMap.Touch = Touch = {}));
  class LinkedMap {
    constructor() {
      this[_a] = "LinkedMap";
      this._map = /* @__PURE__ */ new Map();
      this._head = void 0;
      this._tail = void 0;
      this._size = 0;
      this._state = 0;
    }
    clear() {
      this._map.clear();
      this._head = void 0;
      this._tail = void 0;
      this._size = 0;
      this._state++;
    }
    isEmpty() {
      return !this._head && !this._tail;
    }
    get size() {
      return this._size;
    }
    get first() {
      return this._head?.value;
    }
    get last() {
      return this._tail?.value;
    }
    has(key) {
      return this._map.has(key);
    }
    get(key, touch = Touch.None) {
      const item = this._map.get(key);
      if (!item) {
        return void 0;
      }
      if (touch !== Touch.None) {
        this.touch(item, touch);
      }
      return item.value;
    }
    set(key, value, touch = Touch.None) {
      let item = this._map.get(key);
      if (item) {
        item.value = value;
        if (touch !== Touch.None) {
          this.touch(item, touch);
        }
      } else {
        item = { key, value, next: void 0, previous: void 0 };
        switch (touch) {
          case Touch.None:
            this.addItemLast(item);
            break;
          case Touch.First:
            this.addItemFirst(item);
            break;
          case Touch.Last:
            this.addItemLast(item);
            break;
          default:
            this.addItemLast(item);
            break;
        }
        this._map.set(key, item);
        this._size++;
      }
      return this;
    }
    delete(key) {
      return !!this.remove(key);
    }
    remove(key) {
      const item = this._map.get(key);
      if (!item) {
        return void 0;
      }
      this._map.delete(key);
      this.removeItem(item);
      this._size--;
      return item.value;
    }
    shift() {
      if (!this._head && !this._tail) {
        return void 0;
      }
      if (!this._head || !this._tail) {
        throw new Error("Invalid list");
      }
      const item = this._head;
      this._map.delete(item.key);
      this.removeItem(item);
      this._size--;
      return item.value;
    }
    forEach(callbackfn, thisArg) {
      const state = this._state;
      let current = this._head;
      while (current) {
        if (thisArg) {
          callbackfn.bind(thisArg)(current.value, current.key, this);
        } else {
          callbackfn(current.value, current.key, this);
        }
        if (this._state !== state) {
          throw new Error(`LinkedMap got modified during iteration.`);
        }
        current = current.next;
      }
    }
    keys() {
      const state = this._state;
      let current = this._head;
      const iterator = {
        [Symbol.iterator]: () => {
          return iterator;
        },
        next: () => {
          if (this._state !== state) {
            throw new Error(`LinkedMap got modified during iteration.`);
          }
          if (current) {
            const result = { value: current.key, done: false };
            current = current.next;
            return result;
          } else {
            return { value: void 0, done: true };
          }
        }
      };
      return iterator;
    }
    values() {
      const state = this._state;
      let current = this._head;
      const iterator = {
        [Symbol.iterator]: () => {
          return iterator;
        },
        next: () => {
          if (this._state !== state) {
            throw new Error(`LinkedMap got modified during iteration.`);
          }
          if (current) {
            const result = { value: current.value, done: false };
            current = current.next;
            return result;
          } else {
            return { value: void 0, done: true };
          }
        }
      };
      return iterator;
    }
    entries() {
      const state = this._state;
      let current = this._head;
      const iterator = {
        [Symbol.iterator]: () => {
          return iterator;
        },
        next: () => {
          if (this._state !== state) {
            throw new Error(`LinkedMap got modified during iteration.`);
          }
          if (current) {
            const result = { value: [current.key, current.value], done: false };
            current = current.next;
            return result;
          } else {
            return { value: void 0, done: true };
          }
        }
      };
      return iterator;
    }
    [(_a = Symbol.toStringTag, Symbol.iterator)]() {
      return this.entries();
    }
    trimOld(newSize) {
      if (newSize >= this.size) {
        return;
      }
      if (newSize === 0) {
        this.clear();
        return;
      }
      let current = this._head;
      let currentSize = this.size;
      while (current && currentSize > newSize) {
        this._map.delete(current.key);
        current = current.next;
        currentSize--;
      }
      this._head = current;
      this._size = currentSize;
      if (current) {
        current.previous = void 0;
      }
      this._state++;
    }
    addItemFirst(item) {
      if (!this._head && !this._tail) {
        this._tail = item;
      } else if (!this._head) {
        throw new Error("Invalid list");
      } else {
        item.next = this._head;
        this._head.previous = item;
      }
      this._head = item;
      this._state++;
    }
    addItemLast(item) {
      if (!this._head && !this._tail) {
        this._head = item;
      } else if (!this._tail) {
        throw new Error("Invalid list");
      } else {
        item.previous = this._tail;
        this._tail.next = item;
      }
      this._tail = item;
      this._state++;
    }
    removeItem(item) {
      if (item === this._head && item === this._tail) {
        this._head = void 0;
        this._tail = void 0;
      } else if (item === this._head) {
        if (!item.next) {
          throw new Error("Invalid list");
        }
        item.next.previous = void 0;
        this._head = item.next;
      } else if (item === this._tail) {
        if (!item.previous) {
          throw new Error("Invalid list");
        }
        item.previous.next = void 0;
        this._tail = item.previous;
      } else {
        const next = item.next;
        const previous = item.previous;
        if (!next || !previous) {
          throw new Error("Invalid list");
        }
        next.previous = previous;
        previous.next = next;
      }
      item.next = void 0;
      item.previous = void 0;
      this._state++;
    }
    touch(item, touch) {
      if (!this._head || !this._tail) {
        throw new Error("Invalid list");
      }
      if (touch !== Touch.First && touch !== Touch.Last) {
        return;
      }
      if (touch === Touch.First) {
        if (item === this._head) {
          return;
        }
        const next = item.next;
        const previous = item.previous;
        if (item === this._tail) {
          previous.next = void 0;
          this._tail = previous;
        } else {
          next.previous = previous;
          previous.next = next;
        }
        item.previous = void 0;
        item.next = this._head;
        this._head.previous = item;
        this._head = item;
        this._state++;
      } else if (touch === Touch.Last) {
        if (item === this._tail) {
          return;
        }
        const next = item.next;
        const previous = item.previous;
        if (item === this._head) {
          next.previous = void 0;
          this._head = next;
        } else {
          next.previous = previous;
          previous.next = next;
        }
        item.next = void 0;
        item.previous = this._tail;
        this._tail.next = item;
        this._tail = item;
        this._state++;
      }
    }
    toJSON() {
      const data = [];
      this.forEach((value, key) => {
        data.push([key, value]);
      });
      return data;
    }
    fromJSON(data) {
      this.clear();
      for (const [key, value] of data) {
        this.set(key, value);
      }
    }
  }
  linkedMap.LinkedMap = LinkedMap;
  class LRUCache extends LinkedMap {
    constructor(limit, ratio = 1) {
      super();
      this._limit = limit;
      this._ratio = Math.min(Math.max(0, ratio), 1);
    }
    get limit() {
      return this._limit;
    }
    set limit(limit) {
      this._limit = limit;
      this.checkTrim();
    }
    get ratio() {
      return this._ratio;
    }
    set ratio(ratio) {
      this._ratio = Math.min(Math.max(0, ratio), 1);
      this.checkTrim();
    }
    get(key, touch = Touch.AsNew) {
      return super.get(key, touch);
    }
    peek(key) {
      return super.get(key, Touch.None);
    }
    set(key, value) {
      super.set(key, value, Touch.Last);
      this.checkTrim();
      return this;
    }
    checkTrim() {
      if (this.size > this._limit) {
        this.trimOld(Math.round(this._limit * this._ratio));
      }
    }
  }
  linkedMap.LRUCache = LRUCache;
  return linkedMap;
}
var disposable = {};
var hasRequiredDisposable;
function requireDisposable() {
  if (hasRequiredDisposable)
    return disposable;
  hasRequiredDisposable = 1;
  Object.defineProperty(disposable, "__esModule", { value: true });
  disposable.Disposable = void 0;
  var Disposable;
  (function(Disposable2) {
    function create(func2) {
      return {
        dispose: func2
      };
    }
    Disposable2.create = create;
  })(Disposable || (disposable.Disposable = Disposable = {}));
  return disposable;
}
var cancellation = {};
var hasRequiredCancellation;
function requireCancellation() {
  if (hasRequiredCancellation)
    return cancellation;
  hasRequiredCancellation = 1;
  Object.defineProperty(cancellation, "__esModule", { value: true });
  cancellation.CancellationTokenSource = cancellation.CancellationToken = void 0;
  const ral_12 = ral;
  const Is2 = is;
  const events_12 = events;
  var CancellationToken;
  (function(CancellationToken2) {
    CancellationToken2.None = Object.freeze({
      isCancellationRequested: false,
      onCancellationRequested: events_12.Event.None
    });
    CancellationToken2.Cancelled = Object.freeze({
      isCancellationRequested: true,
      onCancellationRequested: events_12.Event.None
    });
    function is2(value) {
      const candidate = value;
      return candidate && (candidate === CancellationToken2.None || candidate === CancellationToken2.Cancelled || Is2.boolean(candidate.isCancellationRequested) && !!candidate.onCancellationRequested);
    }
    CancellationToken2.is = is2;
  })(CancellationToken || (cancellation.CancellationToken = CancellationToken = {}));
  const shortcutEvent = Object.freeze(function(callback, context) {
    const handle = (0, ral_12.default)().timer.setTimeout(callback.bind(context), 0);
    return { dispose() {
      handle.dispose();
    } };
  });
  class MutableToken {
    constructor() {
      this._isCancelled = false;
    }
    cancel() {
      if (!this._isCancelled) {
        this._isCancelled = true;
        if (this._emitter) {
          this._emitter.fire(void 0);
          this.dispose();
        }
      }
    }
    get isCancellationRequested() {
      return this._isCancelled;
    }
    get onCancellationRequested() {
      if (this._isCancelled) {
        return shortcutEvent;
      }
      if (!this._emitter) {
        this._emitter = new events_12.Emitter();
      }
      return this._emitter.event;
    }
    dispose() {
      if (this._emitter) {
        this._emitter.dispose();
        this._emitter = void 0;
      }
    }
  }
  class CancellationTokenSource {
    get token() {
      if (!this._token) {
        this._token = new MutableToken();
      }
      return this._token;
    }
    cancel() {
      if (!this._token) {
        this._token = CancellationToken.Cancelled;
      } else {
        this._token.cancel();
      }
    }
    dispose() {
      if (!this._token) {
        this._token = CancellationToken.None;
      } else if (this._token instanceof MutableToken) {
        this._token.dispose();
      }
    }
  }
  cancellation.CancellationTokenSource = CancellationTokenSource;
  return cancellation;
}
var sharedArrayCancellation = {};
var hasRequiredSharedArrayCancellation;
function requireSharedArrayCancellation() {
  if (hasRequiredSharedArrayCancellation)
    return sharedArrayCancellation;
  hasRequiredSharedArrayCancellation = 1;
  Object.defineProperty(sharedArrayCancellation, "__esModule", { value: true });
  sharedArrayCancellation.SharedArrayReceiverStrategy = sharedArrayCancellation.SharedArraySenderStrategy = void 0;
  const cancellation_1 = requireCancellation();
  var CancellationState;
  (function(CancellationState2) {
    CancellationState2.Continue = 0;
    CancellationState2.Cancelled = 1;
  })(CancellationState || (CancellationState = {}));
  class SharedArraySenderStrategy {
    constructor() {
      this.buffers = /* @__PURE__ */ new Map();
    }
    enableCancellation(request2) {
      if (request2.id === null) {
        return;
      }
      const buffer = new SharedArrayBuffer(4);
      const data = new Int32Array(buffer, 0, 1);
      data[0] = CancellationState.Continue;
      this.buffers.set(request2.id, buffer);
      request2.$cancellationData = buffer;
    }
    async sendCancellation(_conn, id) {
      const buffer = this.buffers.get(id);
      if (buffer === void 0) {
        return;
      }
      const data = new Int32Array(buffer, 0, 1);
      Atomics.store(data, 0, CancellationState.Cancelled);
    }
    cleanup(id) {
      this.buffers.delete(id);
    }
    dispose() {
      this.buffers.clear();
    }
  }
  sharedArrayCancellation.SharedArraySenderStrategy = SharedArraySenderStrategy;
  class SharedArrayBufferCancellationToken {
    constructor(buffer) {
      this.data = new Int32Array(buffer, 0, 1);
    }
    get isCancellationRequested() {
      return Atomics.load(this.data, 0) === CancellationState.Cancelled;
    }
    get onCancellationRequested() {
      throw new Error(`Cancellation over SharedArrayBuffer doesn't support cancellation events`);
    }
  }
  class SharedArrayBufferCancellationTokenSource {
    constructor(buffer) {
      this.token = new SharedArrayBufferCancellationToken(buffer);
    }
    cancel() {
    }
    dispose() {
    }
  }
  class SharedArrayReceiverStrategy {
    constructor() {
      this.kind = "request";
    }
    createCancellationTokenSource(request2) {
      const buffer = request2.$cancellationData;
      if (buffer === void 0) {
        return new cancellation_1.CancellationTokenSource();
      }
      return new SharedArrayBufferCancellationTokenSource(buffer);
    }
  }
  sharedArrayCancellation.SharedArrayReceiverStrategy = SharedArrayReceiverStrategy;
  return sharedArrayCancellation;
}
var messageBuffer = {};
var hasRequiredMessageBuffer;
function requireMessageBuffer() {
  if (hasRequiredMessageBuffer)
    return messageBuffer;
  hasRequiredMessageBuffer = 1;
  Object.defineProperty(messageBuffer, "__esModule", { value: true });
  messageBuffer.AbstractMessageBuffer = void 0;
  const CR = 13;
  const LF = 10;
  const CRLF2 = "\r\n";
  class AbstractMessageBuffer {
    constructor(encoding = "utf-8") {
      this._encoding = encoding;
      this._chunks = [];
      this._totalLength = 0;
    }
    get encoding() {
      return this._encoding;
    }
    append(chunk) {
      const toAppend = typeof chunk === "string" ? this.fromString(chunk, this._encoding) : chunk;
      this._chunks.push(toAppend);
      this._totalLength += toAppend.byteLength;
    }
    tryReadHeaders(lowerCaseKeys = false) {
      if (this._chunks.length === 0) {
        return void 0;
      }
      let state = 0;
      let chunkIndex = 0;
      let offset = 0;
      let chunkBytesRead = 0;
      row:
        while (chunkIndex < this._chunks.length) {
          const chunk = this._chunks[chunkIndex];
          offset = 0;
          while (offset < chunk.length) {
            const value = chunk[offset];
            switch (value) {
              case CR:
                switch (state) {
                  case 0:
                    state = 1;
                    break;
                  case 2:
                    state = 3;
                    break;
                  default:
                    state = 0;
                }
                break;
              case LF:
                switch (state) {
                  case 1:
                    state = 2;
                    break;
                  case 3:
                    state = 4;
                    offset++;
                    break row;
                  default:
                    state = 0;
                }
                break;
              default:
                state = 0;
            }
            offset++;
          }
          chunkBytesRead += chunk.byteLength;
          chunkIndex++;
        }
      if (state !== 4) {
        return void 0;
      }
      const buffer = this._read(chunkBytesRead + offset);
      const result = /* @__PURE__ */ new Map();
      const headers = this.toString(buffer, "ascii").split(CRLF2);
      if (headers.length < 2) {
        return result;
      }
      for (let i = 0; i < headers.length - 2; i++) {
        const header = headers[i];
        const index = header.indexOf(":");
        if (index === -1) {
          throw new Error(`Message header must separate key and value using ':'
${header}`);
        }
        const key = header.substr(0, index);
        const value = header.substr(index + 1).trim();
        result.set(lowerCaseKeys ? key.toLowerCase() : key, value);
      }
      return result;
    }
    tryReadBody(length) {
      if (this._totalLength < length) {
        return void 0;
      }
      return this._read(length);
    }
    get numberOfBytes() {
      return this._totalLength;
    }
    _read(byteCount) {
      if (byteCount === 0) {
        return this.emptyBuffer();
      }
      if (byteCount > this._totalLength) {
        throw new Error(`Cannot read so many bytes!`);
      }
      if (this._chunks[0].byteLength === byteCount) {
        const chunk = this._chunks[0];
        this._chunks.shift();
        this._totalLength -= byteCount;
        return this.asNative(chunk);
      }
      if (this._chunks[0].byteLength > byteCount) {
        const chunk = this._chunks[0];
        const result2 = this.asNative(chunk, byteCount);
        this._chunks[0] = chunk.slice(byteCount);
        this._totalLength -= byteCount;
        return result2;
      }
      const result = this.allocNative(byteCount);
      let resultOffset = 0;
      let chunkIndex = 0;
      while (byteCount > 0) {
        const chunk = this._chunks[chunkIndex];
        if (chunk.byteLength > byteCount) {
          const chunkPart = chunk.slice(0, byteCount);
          result.set(chunkPart, resultOffset);
          resultOffset += byteCount;
          this._chunks[chunkIndex] = chunk.slice(byteCount);
          this._totalLength -= byteCount;
          byteCount -= byteCount;
        } else {
          result.set(chunk, resultOffset);
          resultOffset += chunk.byteLength;
          this._chunks.shift();
          this._totalLength -= chunk.byteLength;
          byteCount -= chunk.byteLength;
        }
      }
      return result;
    }
  }
  messageBuffer.AbstractMessageBuffer = AbstractMessageBuffer;
  return messageBuffer;
}
var connection = {};
var hasRequiredConnection;
function requireConnection() {
  if (hasRequiredConnection)
    return connection;
  hasRequiredConnection = 1;
  (function(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createMessageConnection = exports.ConnectionOptions = exports.MessageStrategy = exports.CancellationStrategy = exports.CancellationSenderStrategy = exports.CancellationReceiverStrategy = exports.RequestCancellationReceiverStrategy = exports.IdCancellationReceiverStrategy = exports.ConnectionStrategy = exports.ConnectionError = exports.ConnectionErrors = exports.LogTraceNotification = exports.SetTraceNotification = exports.TraceFormat = exports.TraceValues = exports.Trace = exports.NullLogger = exports.ProgressType = exports.ProgressToken = void 0;
    const ral_12 = ral;
    const Is2 = is;
    const messages_1 = requireMessages();
    const linkedMap_1 = requireLinkedMap();
    const events_12 = events;
    const cancellation_1 = requireCancellation();
    var CancelNotification;
    (function(CancelNotification2) {
      CancelNotification2.type = new messages_1.NotificationType("$/cancelRequest");
    })(CancelNotification || (CancelNotification = {}));
    var ProgressToken;
    (function(ProgressToken2) {
      function is2(value) {
        return typeof value === "string" || typeof value === "number";
      }
      ProgressToken2.is = is2;
    })(ProgressToken || (exports.ProgressToken = ProgressToken = {}));
    var ProgressNotification;
    (function(ProgressNotification2) {
      ProgressNotification2.type = new messages_1.NotificationType("$/progress");
    })(ProgressNotification || (ProgressNotification = {}));
    class ProgressType {
      constructor() {
      }
    }
    exports.ProgressType = ProgressType;
    var StarRequestHandler;
    (function(StarRequestHandler2) {
      function is2(value) {
        return Is2.func(value);
      }
      StarRequestHandler2.is = is2;
    })(StarRequestHandler || (StarRequestHandler = {}));
    exports.NullLogger = Object.freeze({
      error: () => {
      },
      warn: () => {
      },
      info: () => {
      },
      log: () => {
      }
    });
    var Trace;
    (function(Trace2) {
      Trace2[Trace2["Off"] = 0] = "Off";
      Trace2[Trace2["Messages"] = 1] = "Messages";
      Trace2[Trace2["Compact"] = 2] = "Compact";
      Trace2[Trace2["Verbose"] = 3] = "Verbose";
    })(Trace || (exports.Trace = Trace = {}));
    var TraceValues;
    (function(TraceValues2) {
      TraceValues2.Off = "off";
      TraceValues2.Messages = "messages";
      TraceValues2.Compact = "compact";
      TraceValues2.Verbose = "verbose";
    })(TraceValues || (exports.TraceValues = TraceValues = {}));
    (function(Trace2) {
      function fromString(value) {
        if (!Is2.string(value)) {
          return Trace2.Off;
        }
        value = value.toLowerCase();
        switch (value) {
          case "off":
            return Trace2.Off;
          case "messages":
            return Trace2.Messages;
          case "compact":
            return Trace2.Compact;
          case "verbose":
            return Trace2.Verbose;
          default:
            return Trace2.Off;
        }
      }
      Trace2.fromString = fromString;
      function toString(value) {
        switch (value) {
          case Trace2.Off:
            return "off";
          case Trace2.Messages:
            return "messages";
          case Trace2.Compact:
            return "compact";
          case Trace2.Verbose:
            return "verbose";
          default:
            return "off";
        }
      }
      Trace2.toString = toString;
    })(Trace || (exports.Trace = Trace = {}));
    var TraceFormat;
    (function(TraceFormat2) {
      TraceFormat2["Text"] = "text";
      TraceFormat2["JSON"] = "json";
    })(TraceFormat || (exports.TraceFormat = TraceFormat = {}));
    (function(TraceFormat2) {
      function fromString(value) {
        if (!Is2.string(value)) {
          return TraceFormat2.Text;
        }
        value = value.toLowerCase();
        if (value === "json") {
          return TraceFormat2.JSON;
        } else {
          return TraceFormat2.Text;
        }
      }
      TraceFormat2.fromString = fromString;
    })(TraceFormat || (exports.TraceFormat = TraceFormat = {}));
    var SetTraceNotification;
    (function(SetTraceNotification2) {
      SetTraceNotification2.type = new messages_1.NotificationType("$/setTrace");
    })(SetTraceNotification || (exports.SetTraceNotification = SetTraceNotification = {}));
    var LogTraceNotification;
    (function(LogTraceNotification2) {
      LogTraceNotification2.type = new messages_1.NotificationType("$/logTrace");
    })(LogTraceNotification || (exports.LogTraceNotification = LogTraceNotification = {}));
    var ConnectionErrors;
    (function(ConnectionErrors2) {
      ConnectionErrors2[ConnectionErrors2["Closed"] = 1] = "Closed";
      ConnectionErrors2[ConnectionErrors2["Disposed"] = 2] = "Disposed";
      ConnectionErrors2[ConnectionErrors2["AlreadyListening"] = 3] = "AlreadyListening";
    })(ConnectionErrors || (exports.ConnectionErrors = ConnectionErrors = {}));
    class ConnectionError extends Error {
      constructor(code, message) {
        super(message);
        this.code = code;
        Object.setPrototypeOf(this, ConnectionError.prototype);
      }
    }
    exports.ConnectionError = ConnectionError;
    var ConnectionStrategy;
    (function(ConnectionStrategy2) {
      function is2(value) {
        const candidate = value;
        return candidate && Is2.func(candidate.cancelUndispatched);
      }
      ConnectionStrategy2.is = is2;
    })(ConnectionStrategy || (exports.ConnectionStrategy = ConnectionStrategy = {}));
    var IdCancellationReceiverStrategy;
    (function(IdCancellationReceiverStrategy2) {
      function is2(value) {
        const candidate = value;
        return candidate && (candidate.kind === void 0 || candidate.kind === "id") && Is2.func(candidate.createCancellationTokenSource) && (candidate.dispose === void 0 || Is2.func(candidate.dispose));
      }
      IdCancellationReceiverStrategy2.is = is2;
    })(IdCancellationReceiverStrategy || (exports.IdCancellationReceiverStrategy = IdCancellationReceiverStrategy = {}));
    var RequestCancellationReceiverStrategy;
    (function(RequestCancellationReceiverStrategy2) {
      function is2(value) {
        const candidate = value;
        return candidate && candidate.kind === "request" && Is2.func(candidate.createCancellationTokenSource) && (candidate.dispose === void 0 || Is2.func(candidate.dispose));
      }
      RequestCancellationReceiverStrategy2.is = is2;
    })(RequestCancellationReceiverStrategy || (exports.RequestCancellationReceiverStrategy = RequestCancellationReceiverStrategy = {}));
    var CancellationReceiverStrategy;
    (function(CancellationReceiverStrategy2) {
      CancellationReceiverStrategy2.Message = Object.freeze({
        createCancellationTokenSource(_) {
          return new cancellation_1.CancellationTokenSource();
        }
      });
      function is2(value) {
        return IdCancellationReceiverStrategy.is(value) || RequestCancellationReceiverStrategy.is(value);
      }
      CancellationReceiverStrategy2.is = is2;
    })(CancellationReceiverStrategy || (exports.CancellationReceiverStrategy = CancellationReceiverStrategy = {}));
    var CancellationSenderStrategy;
    (function(CancellationSenderStrategy2) {
      CancellationSenderStrategy2.Message = Object.freeze({
        sendCancellation(conn, id) {
          return conn.sendNotification(CancelNotification.type, { id });
        },
        cleanup(_) {
        }
      });
      function is2(value) {
        const candidate = value;
        return candidate && Is2.func(candidate.sendCancellation) && Is2.func(candidate.cleanup);
      }
      CancellationSenderStrategy2.is = is2;
    })(CancellationSenderStrategy || (exports.CancellationSenderStrategy = CancellationSenderStrategy = {}));
    var CancellationStrategy;
    (function(CancellationStrategy2) {
      CancellationStrategy2.Message = Object.freeze({
        receiver: CancellationReceiverStrategy.Message,
        sender: CancellationSenderStrategy.Message
      });
      function is2(value) {
        const candidate = value;
        return candidate && CancellationReceiverStrategy.is(candidate.receiver) && CancellationSenderStrategy.is(candidate.sender);
      }
      CancellationStrategy2.is = is2;
    })(CancellationStrategy || (exports.CancellationStrategy = CancellationStrategy = {}));
    var MessageStrategy;
    (function(MessageStrategy2) {
      function is2(value) {
        const candidate = value;
        return candidate && Is2.func(candidate.handleMessage);
      }
      MessageStrategy2.is = is2;
    })(MessageStrategy || (exports.MessageStrategy = MessageStrategy = {}));
    var ConnectionOptions;
    (function(ConnectionOptions2) {
      function is2(value) {
        const candidate = value;
        return candidate && (CancellationStrategy.is(candidate.cancellationStrategy) || ConnectionStrategy.is(candidate.connectionStrategy) || MessageStrategy.is(candidate.messageStrategy));
      }
      ConnectionOptions2.is = is2;
    })(ConnectionOptions || (exports.ConnectionOptions = ConnectionOptions = {}));
    var ConnectionState;
    (function(ConnectionState2) {
      ConnectionState2[ConnectionState2["New"] = 1] = "New";
      ConnectionState2[ConnectionState2["Listening"] = 2] = "Listening";
      ConnectionState2[ConnectionState2["Closed"] = 3] = "Closed";
      ConnectionState2[ConnectionState2["Disposed"] = 4] = "Disposed";
    })(ConnectionState || (ConnectionState = {}));
    function createMessageConnection(messageReader2, messageWriter2, _logger, options) {
      const logger2 = _logger !== void 0 ? _logger : exports.NullLogger;
      let sequenceNumber = 0;
      let notificationSequenceNumber = 0;
      let unknownResponseSequenceNumber = 0;
      const version = "2.0";
      let starRequestHandler = void 0;
      const requestHandlers = /* @__PURE__ */ new Map();
      let starNotificationHandler = void 0;
      const notificationHandlers = /* @__PURE__ */ new Map();
      const progressHandlers = /* @__PURE__ */ new Map();
      let timer;
      let messageQueue = new linkedMap_1.LinkedMap();
      let responsePromises = /* @__PURE__ */ new Map();
      let knownCanceledRequests = /* @__PURE__ */ new Set();
      let requestTokens = /* @__PURE__ */ new Map();
      let trace = Trace.Off;
      let traceFormat = TraceFormat.Text;
      let tracer;
      let state = ConnectionState.New;
      const errorEmitter = new events_12.Emitter();
      const closeEmitter = new events_12.Emitter();
      const unhandledNotificationEmitter = new events_12.Emitter();
      const unhandledProgressEmitter = new events_12.Emitter();
      const disposeEmitter = new events_12.Emitter();
      const cancellationStrategy = options && options.cancellationStrategy ? options.cancellationStrategy : CancellationStrategy.Message;
      function createRequestQueueKey(id) {
        if (id === null) {
          throw new Error(`Can't send requests with id null since the response can't be correlated.`);
        }
        return "req-" + id.toString();
      }
      function createResponseQueueKey(id) {
        if (id === null) {
          return "res-unknown-" + (++unknownResponseSequenceNumber).toString();
        } else {
          return "res-" + id.toString();
        }
      }
      function createNotificationQueueKey() {
        return "not-" + (++notificationSequenceNumber).toString();
      }
      function addMessageToQueue(queue, message) {
        if (messages_1.Message.isRequest(message)) {
          queue.set(createRequestQueueKey(message.id), message);
        } else if (messages_1.Message.isResponse(message)) {
          queue.set(createResponseQueueKey(message.id), message);
        } else {
          queue.set(createNotificationQueueKey(), message);
        }
      }
      function cancelUndispatched(_message) {
        return void 0;
      }
      function isListening() {
        return state === ConnectionState.Listening;
      }
      function isClosed() {
        return state === ConnectionState.Closed;
      }
      function isDisposed() {
        return state === ConnectionState.Disposed;
      }
      function closeHandler() {
        if (state === ConnectionState.New || state === ConnectionState.Listening) {
          state = ConnectionState.Closed;
          closeEmitter.fire(void 0);
        }
      }
      function readErrorHandler(error2) {
        errorEmitter.fire([error2, void 0, void 0]);
      }
      function writeErrorHandler(data) {
        errorEmitter.fire(data);
      }
      messageReader2.onClose(closeHandler);
      messageReader2.onError(readErrorHandler);
      messageWriter2.onClose(closeHandler);
      messageWriter2.onError(writeErrorHandler);
      function triggerMessageQueue() {
        if (timer || messageQueue.size === 0) {
          return;
        }
        timer = (0, ral_12.default)().timer.setImmediate(() => {
          timer = void 0;
          processMessageQueue();
        });
      }
      function handleMessage(message) {
        if (messages_1.Message.isRequest(message)) {
          handleRequest(message);
        } else if (messages_1.Message.isNotification(message)) {
          handleNotification(message);
        } else if (messages_1.Message.isResponse(message)) {
          handleResponse(message);
        } else {
          handleInvalidMessage(message);
        }
      }
      function processMessageQueue() {
        if (messageQueue.size === 0) {
          return;
        }
        const message = messageQueue.shift();
        try {
          const messageStrategy = options?.messageStrategy;
          if (MessageStrategy.is(messageStrategy)) {
            messageStrategy.handleMessage(message, handleMessage);
          } else {
            handleMessage(message);
          }
        } finally {
          triggerMessageQueue();
        }
      }
      const callback = (message) => {
        try {
          if (messages_1.Message.isNotification(message) && message.method === CancelNotification.type.method) {
            const cancelId = message.params.id;
            const key = createRequestQueueKey(cancelId);
            const toCancel = messageQueue.get(key);
            if (messages_1.Message.isRequest(toCancel)) {
              const strategy = options?.connectionStrategy;
              const response = strategy && strategy.cancelUndispatched ? strategy.cancelUndispatched(toCancel, cancelUndispatched) : cancelUndispatched(toCancel);
              if (response && (response.error !== void 0 || response.result !== void 0)) {
                messageQueue.delete(key);
                requestTokens.delete(cancelId);
                response.id = toCancel.id;
                traceSendingResponse(response, message.method, Date.now());
                messageWriter2.write(response).catch(() => logger2.error(`Sending response for canceled message failed.`));
                return;
              }
            }
            const cancellationToken = requestTokens.get(cancelId);
            if (cancellationToken !== void 0) {
              cancellationToken.cancel();
              traceReceivedNotification(message);
              return;
            } else {
              knownCanceledRequests.add(cancelId);
            }
          }
          addMessageToQueue(messageQueue, message);
        } finally {
          triggerMessageQueue();
        }
      };
      function handleRequest(requestMessage) {
        if (isDisposed()) {
          return;
        }
        function reply(resultOrError, method, startTime2) {
          const message = {
            jsonrpc: version,
            id: requestMessage.id
          };
          if (resultOrError instanceof messages_1.ResponseError) {
            message.error = resultOrError.toJson();
          } else {
            message.result = resultOrError === void 0 ? null : resultOrError;
          }
          traceSendingResponse(message, method, startTime2);
          messageWriter2.write(message).catch(() => logger2.error(`Sending response failed.`));
        }
        function replyError(error2, method, startTime2) {
          const message = {
            jsonrpc: version,
            id: requestMessage.id,
            error: error2.toJson()
          };
          traceSendingResponse(message, method, startTime2);
          messageWriter2.write(message).catch(() => logger2.error(`Sending response failed.`));
        }
        function replySuccess(result, method, startTime2) {
          if (result === void 0) {
            result = null;
          }
          const message = {
            jsonrpc: version,
            id: requestMessage.id,
            result
          };
          traceSendingResponse(message, method, startTime2);
          messageWriter2.write(message).catch(() => logger2.error(`Sending response failed.`));
        }
        traceReceivedRequest(requestMessage);
        const element = requestHandlers.get(requestMessage.method);
        let type;
        let requestHandler;
        if (element) {
          type = element.type;
          requestHandler = element.handler;
        }
        const startTime = Date.now();
        if (requestHandler || starRequestHandler) {
          const tokenKey = requestMessage.id ?? String(Date.now());
          const cancellationSource = IdCancellationReceiverStrategy.is(cancellationStrategy.receiver) ? cancellationStrategy.receiver.createCancellationTokenSource(tokenKey) : cancellationStrategy.receiver.createCancellationTokenSource(requestMessage);
          if (requestMessage.id !== null && knownCanceledRequests.has(requestMessage.id)) {
            cancellationSource.cancel();
          }
          if (requestMessage.id !== null) {
            requestTokens.set(tokenKey, cancellationSource);
          }
          try {
            let handlerResult;
            if (requestHandler) {
              if (requestMessage.params === void 0) {
                if (type !== void 0 && type.numberOfParams !== 0) {
                  replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InvalidParams, `Request ${requestMessage.method} defines ${type.numberOfParams} params but received none.`), requestMessage.method, startTime);
                  return;
                }
                handlerResult = requestHandler(cancellationSource.token);
              } else if (Array.isArray(requestMessage.params)) {
                if (type !== void 0 && type.parameterStructures === messages_1.ParameterStructures.byName) {
                  replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InvalidParams, `Request ${requestMessage.method} defines parameters by name but received parameters by position`), requestMessage.method, startTime);
                  return;
                }
                handlerResult = requestHandler(...requestMessage.params, cancellationSource.token);
              } else {
                if (type !== void 0 && type.parameterStructures === messages_1.ParameterStructures.byPosition) {
                  replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InvalidParams, `Request ${requestMessage.method} defines parameters by position but received parameters by name`), requestMessage.method, startTime);
                  return;
                }
                handlerResult = requestHandler(requestMessage.params, cancellationSource.token);
              }
            } else if (starRequestHandler) {
              handlerResult = starRequestHandler(requestMessage.method, requestMessage.params, cancellationSource.token);
            }
            const promise = handlerResult;
            if (!handlerResult) {
              requestTokens.delete(tokenKey);
              replySuccess(handlerResult, requestMessage.method, startTime);
            } else if (promise.then) {
              promise.then((resultOrError) => {
                requestTokens.delete(tokenKey);
                reply(resultOrError, requestMessage.method, startTime);
              }, (error2) => {
                requestTokens.delete(tokenKey);
                if (error2 instanceof messages_1.ResponseError) {
                  replyError(error2, requestMessage.method, startTime);
                } else if (error2 && Is2.string(error2.message)) {
                  replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed with message: ${error2.message}`), requestMessage.method, startTime);
                } else {
                  replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed unexpectedly without providing any details.`), requestMessage.method, startTime);
                }
              });
            } else {
              requestTokens.delete(tokenKey);
              reply(handlerResult, requestMessage.method, startTime);
            }
          } catch (error2) {
            requestTokens.delete(tokenKey);
            if (error2 instanceof messages_1.ResponseError) {
              reply(error2, requestMessage.method, startTime);
            } else if (error2 && Is2.string(error2.message)) {
              replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed with message: ${error2.message}`), requestMessage.method, startTime);
            } else {
              replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed unexpectedly without providing any details.`), requestMessage.method, startTime);
            }
          }
        } else {
          replyError(new messages_1.ResponseError(messages_1.ErrorCodes.MethodNotFound, `Unhandled method ${requestMessage.method}`), requestMessage.method, startTime);
        }
      }
      function handleResponse(responseMessage) {
        if (isDisposed()) {
          return;
        }
        if (responseMessage.id === null) {
          if (responseMessage.error) {
            logger2.error(`Received response message without id: Error is: 
${JSON.stringify(responseMessage.error, void 0, 4)}`);
          } else {
            logger2.error(`Received response message without id. No further error information provided.`);
          }
        } else {
          const key = responseMessage.id;
          const responsePromise = responsePromises.get(key);
          traceReceivedResponse(responseMessage, responsePromise);
          if (responsePromise !== void 0) {
            responsePromises.delete(key);
            try {
              if (responseMessage.error) {
                const error2 = responseMessage.error;
                responsePromise.reject(new messages_1.ResponseError(error2.code, error2.message, error2.data));
              } else if (responseMessage.result !== void 0) {
                responsePromise.resolve(responseMessage.result);
              } else {
                throw new Error("Should never happen.");
              }
            } catch (error2) {
              if (error2.message) {
                logger2.error(`Response handler '${responsePromise.method}' failed with message: ${error2.message}`);
              } else {
                logger2.error(`Response handler '${responsePromise.method}' failed unexpectedly.`);
              }
            }
          }
        }
      }
      function handleNotification(message) {
        if (isDisposed()) {
          return;
        }
        let type = void 0;
        let notificationHandler;
        if (message.method === CancelNotification.type.method) {
          const cancelId = message.params.id;
          knownCanceledRequests.delete(cancelId);
          traceReceivedNotification(message);
          return;
        } else {
          const element = notificationHandlers.get(message.method);
          if (element) {
            notificationHandler = element.handler;
            type = element.type;
          }
        }
        if (notificationHandler || starNotificationHandler) {
          try {
            traceReceivedNotification(message);
            if (notificationHandler) {
              if (message.params === void 0) {
                if (type !== void 0) {
                  if (type.numberOfParams !== 0 && type.parameterStructures !== messages_1.ParameterStructures.byName) {
                    logger2.error(`Notification ${message.method} defines ${type.numberOfParams} params but received none.`);
                  }
                }
                notificationHandler();
              } else if (Array.isArray(message.params)) {
                const params = message.params;
                if (message.method === ProgressNotification.type.method && params.length === 2 && ProgressToken.is(params[0])) {
                  notificationHandler({ token: params[0], value: params[1] });
                } else {
                  if (type !== void 0) {
                    if (type.parameterStructures === messages_1.ParameterStructures.byName) {
                      logger2.error(`Notification ${message.method} defines parameters by name but received parameters by position`);
                    }
                    if (type.numberOfParams !== message.params.length) {
                      logger2.error(`Notification ${message.method} defines ${type.numberOfParams} params but received ${params.length} arguments`);
                    }
                  }
                  notificationHandler(...params);
                }
              } else {
                if (type !== void 0 && type.parameterStructures === messages_1.ParameterStructures.byPosition) {
                  logger2.error(`Notification ${message.method} defines parameters by position but received parameters by name`);
                }
                notificationHandler(message.params);
              }
            } else if (starNotificationHandler) {
              starNotificationHandler(message.method, message.params);
            }
          } catch (error2) {
            if (error2.message) {
              logger2.error(`Notification handler '${message.method}' failed with message: ${error2.message}`);
            } else {
              logger2.error(`Notification handler '${message.method}' failed unexpectedly.`);
            }
          }
        } else {
          unhandledNotificationEmitter.fire(message);
        }
      }
      function handleInvalidMessage(message) {
        if (!message) {
          logger2.error("Received empty message.");
          return;
        }
        logger2.error(`Received message which is neither a response nor a notification message:
${JSON.stringify(message, null, 4)}`);
        const responseMessage = message;
        if (Is2.string(responseMessage.id) || Is2.number(responseMessage.id)) {
          const key = responseMessage.id;
          const responseHandler = responsePromises.get(key);
          if (responseHandler) {
            responseHandler.reject(new Error("The received response has neither a result nor an error property."));
          }
        }
      }
      function stringifyTrace(params) {
        if (params === void 0 || params === null) {
          return void 0;
        }
        switch (trace) {
          case Trace.Verbose:
            return JSON.stringify(params, null, 4);
          case Trace.Compact:
            return JSON.stringify(params);
          default:
            return void 0;
        }
      }
      function traceSendingRequest(message) {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if ((trace === Trace.Verbose || trace === Trace.Compact) && message.params) {
            data = `Params: ${stringifyTrace(message.params)}

`;
          }
          tracer.log(`Sending request '${message.method} - (${message.id})'.`, data);
        } else {
          logLSPMessage("send-request", message);
        }
      }
      function traceSendingNotification(message) {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if (trace === Trace.Verbose || trace === Trace.Compact) {
            if (message.params) {
              data = `Params: ${stringifyTrace(message.params)}

`;
            } else {
              data = "No parameters provided.\n\n";
            }
          }
          tracer.log(`Sending notification '${message.method}'.`, data);
        } else {
          logLSPMessage("send-notification", message);
        }
      }
      function traceSendingResponse(message, method, startTime) {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if (trace === Trace.Verbose || trace === Trace.Compact) {
            if (message.error && message.error.data) {
              data = `Error data: ${stringifyTrace(message.error.data)}

`;
            } else {
              if (message.result) {
                data = `Result: ${stringifyTrace(message.result)}

`;
              } else if (message.error === void 0) {
                data = "No result returned.\n\n";
              }
            }
          }
          tracer.log(`Sending response '${method} - (${message.id})'. Processing request took ${Date.now() - startTime}ms`, data);
        } else {
          logLSPMessage("send-response", message);
        }
      }
      function traceReceivedRequest(message) {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if ((trace === Trace.Verbose || trace === Trace.Compact) && message.params) {
            data = `Params: ${stringifyTrace(message.params)}

`;
          }
          tracer.log(`Received request '${message.method} - (${message.id})'.`, data);
        } else {
          logLSPMessage("receive-request", message);
        }
      }
      function traceReceivedNotification(message) {
        if (trace === Trace.Off || !tracer || message.method === LogTraceNotification.type.method) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if (trace === Trace.Verbose || trace === Trace.Compact) {
            if (message.params) {
              data = `Params: ${stringifyTrace(message.params)}

`;
            } else {
              data = "No parameters provided.\n\n";
            }
          }
          tracer.log(`Received notification '${message.method}'.`, data);
        } else {
          logLSPMessage("receive-notification", message);
        }
      }
      function traceReceivedResponse(message, responsePromise) {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if (trace === Trace.Verbose || trace === Trace.Compact) {
            if (message.error && message.error.data) {
              data = `Error data: ${stringifyTrace(message.error.data)}

`;
            } else {
              if (message.result) {
                data = `Result: ${stringifyTrace(message.result)}

`;
              } else if (message.error === void 0) {
                data = "No result returned.\n\n";
              }
            }
          }
          if (responsePromise) {
            const error2 = message.error ? ` Request failed: ${message.error.message} (${message.error.code}).` : "";
            tracer.log(`Received response '${responsePromise.method} - (${message.id})' in ${Date.now() - responsePromise.timerStart}ms.${error2}`, data);
          } else {
            tracer.log(`Received response ${message.id} without active response promise.`, data);
          }
        } else {
          logLSPMessage("receive-response", message);
        }
      }
      function logLSPMessage(type, message) {
        if (!tracer || trace === Trace.Off) {
          return;
        }
        const lspMessage = {
          isLSPMessage: true,
          type,
          message,
          timestamp: Date.now()
        };
        tracer.log(lspMessage);
      }
      function throwIfClosedOrDisposed() {
        if (isClosed()) {
          throw new ConnectionError(ConnectionErrors.Closed, "Connection is closed.");
        }
        if (isDisposed()) {
          throw new ConnectionError(ConnectionErrors.Disposed, "Connection is disposed.");
        }
      }
      function throwIfListening() {
        if (isListening()) {
          throw new ConnectionError(ConnectionErrors.AlreadyListening, "Connection is already listening");
        }
      }
      function throwIfNotListening() {
        if (!isListening()) {
          throw new Error("Call listen() first.");
        }
      }
      function undefinedToNull(param) {
        if (param === void 0) {
          return null;
        } else {
          return param;
        }
      }
      function nullToUndefined(param) {
        if (param === null) {
          return void 0;
        } else {
          return param;
        }
      }
      function isNamedParam(param) {
        return param !== void 0 && param !== null && !Array.isArray(param) && typeof param === "object";
      }
      function computeSingleParam(parameterStructures, param) {
        switch (parameterStructures) {
          case messages_1.ParameterStructures.auto:
            if (isNamedParam(param)) {
              return nullToUndefined(param);
            } else {
              return [undefinedToNull(param)];
            }
          case messages_1.ParameterStructures.byName:
            if (!isNamedParam(param)) {
              throw new Error(`Received parameters by name but param is not an object literal.`);
            }
            return nullToUndefined(param);
          case messages_1.ParameterStructures.byPosition:
            return [undefinedToNull(param)];
          default:
            throw new Error(`Unknown parameter structure ${parameterStructures.toString()}`);
        }
      }
      function computeMessageParams(type, params) {
        let result;
        const numberOfParams = type.numberOfParams;
        switch (numberOfParams) {
          case 0:
            result = void 0;
            break;
          case 1:
            result = computeSingleParam(type.parameterStructures, params[0]);
            break;
          default:
            result = [];
            for (let i = 0; i < params.length && i < numberOfParams; i++) {
              result.push(undefinedToNull(params[i]));
            }
            if (params.length < numberOfParams) {
              for (let i = params.length; i < numberOfParams; i++) {
                result.push(null);
              }
            }
            break;
        }
        return result;
      }
      const connection2 = {
        sendNotification: (type, ...args) => {
          throwIfClosedOrDisposed();
          let method;
          let messageParams;
          if (Is2.string(type)) {
            method = type;
            const first = args[0];
            let paramStart = 0;
            let parameterStructures = messages_1.ParameterStructures.auto;
            if (messages_1.ParameterStructures.is(first)) {
              paramStart = 1;
              parameterStructures = first;
            }
            let paramEnd = args.length;
            const numberOfParams = paramEnd - paramStart;
            switch (numberOfParams) {
              case 0:
                messageParams = void 0;
                break;
              case 1:
                messageParams = computeSingleParam(parameterStructures, args[paramStart]);
                break;
              default:
                if (parameterStructures === messages_1.ParameterStructures.byName) {
                  throw new Error(`Received ${numberOfParams} parameters for 'by Name' notification parameter structure.`);
                }
                messageParams = args.slice(paramStart, paramEnd).map((value) => undefinedToNull(value));
                break;
            }
          } else {
            const params = args;
            method = type.method;
            messageParams = computeMessageParams(type, params);
          }
          const notificationMessage = {
            jsonrpc: version,
            method,
            params: messageParams
          };
          traceSendingNotification(notificationMessage);
          return messageWriter2.write(notificationMessage).catch((error2) => {
            logger2.error(`Sending notification failed.`);
            throw error2;
          });
        },
        onNotification: (type, handler) => {
          throwIfClosedOrDisposed();
          let method;
          if (Is2.func(type)) {
            starNotificationHandler = type;
          } else if (handler) {
            if (Is2.string(type)) {
              method = type;
              notificationHandlers.set(type, { type: void 0, handler });
            } else {
              method = type.method;
              notificationHandlers.set(type.method, { type, handler });
            }
          }
          return {
            dispose: () => {
              if (method !== void 0) {
                notificationHandlers.delete(method);
              } else {
                starNotificationHandler = void 0;
              }
            }
          };
        },
        onProgress: (_type, token, handler) => {
          if (progressHandlers.has(token)) {
            throw new Error(`Progress handler for token ${token} already registered`);
          }
          progressHandlers.set(token, handler);
          return {
            dispose: () => {
              progressHandlers.delete(token);
            }
          };
        },
        sendProgress: (_type, token, value) => {
          return connection2.sendNotification(ProgressNotification.type, { token, value });
        },
        onUnhandledProgress: unhandledProgressEmitter.event,
        sendRequest: (type, ...args) => {
          throwIfClosedOrDisposed();
          throwIfNotListening();
          let method;
          let messageParams;
          let token = void 0;
          if (Is2.string(type)) {
            method = type;
            const first = args[0];
            const last = args[args.length - 1];
            let paramStart = 0;
            let parameterStructures = messages_1.ParameterStructures.auto;
            if (messages_1.ParameterStructures.is(first)) {
              paramStart = 1;
              parameterStructures = first;
            }
            let paramEnd = args.length;
            if (cancellation_1.CancellationToken.is(last)) {
              paramEnd = paramEnd - 1;
              token = last;
            }
            const numberOfParams = paramEnd - paramStart;
            switch (numberOfParams) {
              case 0:
                messageParams = void 0;
                break;
              case 1:
                messageParams = computeSingleParam(parameterStructures, args[paramStart]);
                break;
              default:
                if (parameterStructures === messages_1.ParameterStructures.byName) {
                  throw new Error(`Received ${numberOfParams} parameters for 'by Name' request parameter structure.`);
                }
                messageParams = args.slice(paramStart, paramEnd).map((value) => undefinedToNull(value));
                break;
            }
          } else {
            const params = args;
            method = type.method;
            messageParams = computeMessageParams(type, params);
            const numberOfParams = type.numberOfParams;
            token = cancellation_1.CancellationToken.is(params[numberOfParams]) ? params[numberOfParams] : void 0;
          }
          const id = sequenceNumber++;
          let disposable2;
          if (token) {
            disposable2 = token.onCancellationRequested(() => {
              const p = cancellationStrategy.sender.sendCancellation(connection2, id);
              if (p === void 0) {
                logger2.log(`Received no promise from cancellation strategy when cancelling id ${id}`);
                return Promise.resolve();
              } else {
                return p.catch(() => {
                  logger2.log(`Sending cancellation messages for id ${id} failed`);
                });
              }
            });
          }
          const requestMessage = {
            jsonrpc: version,
            id,
            method,
            params: messageParams
          };
          traceSendingRequest(requestMessage);
          if (typeof cancellationStrategy.sender.enableCancellation === "function") {
            cancellationStrategy.sender.enableCancellation(requestMessage);
          }
          return new Promise(async (resolve, reject) => {
            const resolveWithCleanup = (r) => {
              resolve(r);
              cancellationStrategy.sender.cleanup(id);
              disposable2?.dispose();
            };
            const rejectWithCleanup = (r) => {
              reject(r);
              cancellationStrategy.sender.cleanup(id);
              disposable2?.dispose();
            };
            const responsePromise = { method, timerStart: Date.now(), resolve: resolveWithCleanup, reject: rejectWithCleanup };
            try {
              await messageWriter2.write(requestMessage);
              responsePromises.set(id, responsePromise);
            } catch (error2) {
              logger2.error(`Sending request failed.`);
              responsePromise.reject(new messages_1.ResponseError(messages_1.ErrorCodes.MessageWriteError, error2.message ? error2.message : "Unknown reason"));
              throw error2;
            }
          });
        },
        onRequest: (type, handler) => {
          throwIfClosedOrDisposed();
          let method = null;
          if (StarRequestHandler.is(type)) {
            method = void 0;
            starRequestHandler = type;
          } else if (Is2.string(type)) {
            method = null;
            if (handler !== void 0) {
              method = type;
              requestHandlers.set(type, { handler, type: void 0 });
            }
          } else {
            if (handler !== void 0) {
              method = type.method;
              requestHandlers.set(type.method, { type, handler });
            }
          }
          return {
            dispose: () => {
              if (method === null) {
                return;
              }
              if (method !== void 0) {
                requestHandlers.delete(method);
              } else {
                starRequestHandler = void 0;
              }
            }
          };
        },
        hasPendingResponse: () => {
          return responsePromises.size > 0;
        },
        trace: async (_value, _tracer, sendNotificationOrTraceOptions) => {
          let _sendNotification = false;
          let _traceFormat = TraceFormat.Text;
          if (sendNotificationOrTraceOptions !== void 0) {
            if (Is2.boolean(sendNotificationOrTraceOptions)) {
              _sendNotification = sendNotificationOrTraceOptions;
            } else {
              _sendNotification = sendNotificationOrTraceOptions.sendNotification || false;
              _traceFormat = sendNotificationOrTraceOptions.traceFormat || TraceFormat.Text;
            }
          }
          trace = _value;
          traceFormat = _traceFormat;
          if (trace === Trace.Off) {
            tracer = void 0;
          } else {
            tracer = _tracer;
          }
          if (_sendNotification && !isClosed() && !isDisposed()) {
            await connection2.sendNotification(SetTraceNotification.type, { value: Trace.toString(_value) });
          }
        },
        onError: errorEmitter.event,
        onClose: closeEmitter.event,
        onUnhandledNotification: unhandledNotificationEmitter.event,
        onDispose: disposeEmitter.event,
        end: () => {
          messageWriter2.end();
        },
        dispose: () => {
          if (isDisposed()) {
            return;
          }
          state = ConnectionState.Disposed;
          disposeEmitter.fire(void 0);
          const error2 = new messages_1.ResponseError(messages_1.ErrorCodes.PendingResponseRejected, "Pending response rejected since connection got disposed");
          for (const promise of responsePromises.values()) {
            promise.reject(error2);
          }
          responsePromises = /* @__PURE__ */ new Map();
          requestTokens = /* @__PURE__ */ new Map();
          knownCanceledRequests = /* @__PURE__ */ new Set();
          messageQueue = new linkedMap_1.LinkedMap();
          if (Is2.func(messageWriter2.dispose)) {
            messageWriter2.dispose();
          }
          if (Is2.func(messageReader2.dispose)) {
            messageReader2.dispose();
          }
        },
        listen: () => {
          throwIfClosedOrDisposed();
          throwIfListening();
          state = ConnectionState.Listening;
          messageReader2.listen(callback);
        },
        inspect: () => {
          (0, ral_12.default)().console.log("inspect");
        }
      };
      connection2.onNotification(LogTraceNotification.type, (params) => {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        const verbose = trace === Trace.Verbose || trace === Trace.Compact;
        tracer.log(params.message, verbose ? params.verbose : void 0);
      });
      connection2.onNotification(ProgressNotification.type, (params) => {
        const handler = progressHandlers.get(params.token);
        if (handler) {
          handler(params.value);
        } else {
          unhandledProgressEmitter.fire(params);
        }
      });
      return connection2;
    }
    exports.createMessageConnection = createMessageConnection;
  })(connection);
  return connection;
}
var hasRequiredApi;
function requireApi() {
  if (hasRequiredApi)
    return api;
  hasRequiredApi = 1;
  (function(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProgressType = exports.ProgressToken = exports.createMessageConnection = exports.NullLogger = exports.ConnectionOptions = exports.ConnectionStrategy = exports.AbstractMessageBuffer = exports.WriteableStreamMessageWriter = exports.AbstractMessageWriter = exports.MessageWriter = exports.ReadableStreamMessageReader = exports.AbstractMessageReader = exports.MessageReader = exports.SharedArrayReceiverStrategy = exports.SharedArraySenderStrategy = exports.CancellationToken = exports.CancellationTokenSource = exports.Emitter = exports.Event = exports.Disposable = exports.LRUCache = exports.Touch = exports.LinkedMap = exports.ParameterStructures = exports.NotificationType9 = exports.NotificationType8 = exports.NotificationType7 = exports.NotificationType6 = exports.NotificationType5 = exports.NotificationType4 = exports.NotificationType3 = exports.NotificationType2 = exports.NotificationType1 = exports.NotificationType0 = exports.NotificationType = exports.ErrorCodes = exports.ResponseError = exports.RequestType9 = exports.RequestType8 = exports.RequestType7 = exports.RequestType6 = exports.RequestType5 = exports.RequestType4 = exports.RequestType3 = exports.RequestType2 = exports.RequestType1 = exports.RequestType0 = exports.RequestType = exports.Message = exports.RAL = void 0;
    exports.MessageStrategy = exports.CancellationStrategy = exports.CancellationSenderStrategy = exports.CancellationReceiverStrategy = exports.ConnectionError = exports.ConnectionErrors = exports.LogTraceNotification = exports.SetTraceNotification = exports.TraceFormat = exports.TraceValues = exports.Trace = void 0;
    const messages_1 = requireMessages();
    Object.defineProperty(exports, "Message", { enumerable: true, get: function() {
      return messages_1.Message;
    } });
    Object.defineProperty(exports, "RequestType", { enumerable: true, get: function() {
      return messages_1.RequestType;
    } });
    Object.defineProperty(exports, "RequestType0", { enumerable: true, get: function() {
      return messages_1.RequestType0;
    } });
    Object.defineProperty(exports, "RequestType1", { enumerable: true, get: function() {
      return messages_1.RequestType1;
    } });
    Object.defineProperty(exports, "RequestType2", { enumerable: true, get: function() {
      return messages_1.RequestType2;
    } });
    Object.defineProperty(exports, "RequestType3", { enumerable: true, get: function() {
      return messages_1.RequestType3;
    } });
    Object.defineProperty(exports, "RequestType4", { enumerable: true, get: function() {
      return messages_1.RequestType4;
    } });
    Object.defineProperty(exports, "RequestType5", { enumerable: true, get: function() {
      return messages_1.RequestType5;
    } });
    Object.defineProperty(exports, "RequestType6", { enumerable: true, get: function() {
      return messages_1.RequestType6;
    } });
    Object.defineProperty(exports, "RequestType7", { enumerable: true, get: function() {
      return messages_1.RequestType7;
    } });
    Object.defineProperty(exports, "RequestType8", { enumerable: true, get: function() {
      return messages_1.RequestType8;
    } });
    Object.defineProperty(exports, "RequestType9", { enumerable: true, get: function() {
      return messages_1.RequestType9;
    } });
    Object.defineProperty(exports, "ResponseError", { enumerable: true, get: function() {
      return messages_1.ResponseError;
    } });
    Object.defineProperty(exports, "ErrorCodes", { enumerable: true, get: function() {
      return messages_1.ErrorCodes;
    } });
    Object.defineProperty(exports, "NotificationType", { enumerable: true, get: function() {
      return messages_1.NotificationType;
    } });
    Object.defineProperty(exports, "NotificationType0", { enumerable: true, get: function() {
      return messages_1.NotificationType0;
    } });
    Object.defineProperty(exports, "NotificationType1", { enumerable: true, get: function() {
      return messages_1.NotificationType1;
    } });
    Object.defineProperty(exports, "NotificationType2", { enumerable: true, get: function() {
      return messages_1.NotificationType2;
    } });
    Object.defineProperty(exports, "NotificationType3", { enumerable: true, get: function() {
      return messages_1.NotificationType3;
    } });
    Object.defineProperty(exports, "NotificationType4", { enumerable: true, get: function() {
      return messages_1.NotificationType4;
    } });
    Object.defineProperty(exports, "NotificationType5", { enumerable: true, get: function() {
      return messages_1.NotificationType5;
    } });
    Object.defineProperty(exports, "NotificationType6", { enumerable: true, get: function() {
      return messages_1.NotificationType6;
    } });
    Object.defineProperty(exports, "NotificationType7", { enumerable: true, get: function() {
      return messages_1.NotificationType7;
    } });
    Object.defineProperty(exports, "NotificationType8", { enumerable: true, get: function() {
      return messages_1.NotificationType8;
    } });
    Object.defineProperty(exports, "NotificationType9", { enumerable: true, get: function() {
      return messages_1.NotificationType9;
    } });
    Object.defineProperty(exports, "ParameterStructures", { enumerable: true, get: function() {
      return messages_1.ParameterStructures;
    } });
    const linkedMap_1 = requireLinkedMap();
    Object.defineProperty(exports, "LinkedMap", { enumerable: true, get: function() {
      return linkedMap_1.LinkedMap;
    } });
    Object.defineProperty(exports, "LRUCache", { enumerable: true, get: function() {
      return linkedMap_1.LRUCache;
    } });
    Object.defineProperty(exports, "Touch", { enumerable: true, get: function() {
      return linkedMap_1.Touch;
    } });
    const disposable_1 = requireDisposable();
    Object.defineProperty(exports, "Disposable", { enumerable: true, get: function() {
      return disposable_1.Disposable;
    } });
    const events_12 = events;
    Object.defineProperty(exports, "Event", { enumerable: true, get: function() {
      return events_12.Event;
    } });
    Object.defineProperty(exports, "Emitter", { enumerable: true, get: function() {
      return events_12.Emitter;
    } });
    const cancellation_1 = requireCancellation();
    Object.defineProperty(exports, "CancellationTokenSource", { enumerable: true, get: function() {
      return cancellation_1.CancellationTokenSource;
    } });
    Object.defineProperty(exports, "CancellationToken", { enumerable: true, get: function() {
      return cancellation_1.CancellationToken;
    } });
    const sharedArrayCancellation_1 = requireSharedArrayCancellation();
    Object.defineProperty(exports, "SharedArraySenderStrategy", { enumerable: true, get: function() {
      return sharedArrayCancellation_1.SharedArraySenderStrategy;
    } });
    Object.defineProperty(exports, "SharedArrayReceiverStrategy", { enumerable: true, get: function() {
      return sharedArrayCancellation_1.SharedArrayReceiverStrategy;
    } });
    const messageReader_1 = messageReader;
    Object.defineProperty(exports, "MessageReader", { enumerable: true, get: function() {
      return messageReader_1.MessageReader;
    } });
    Object.defineProperty(exports, "AbstractMessageReader", { enumerable: true, get: function() {
      return messageReader_1.AbstractMessageReader;
    } });
    Object.defineProperty(exports, "ReadableStreamMessageReader", { enumerable: true, get: function() {
      return messageReader_1.ReadableStreamMessageReader;
    } });
    const messageWriter_1 = messageWriter;
    Object.defineProperty(exports, "MessageWriter", { enumerable: true, get: function() {
      return messageWriter_1.MessageWriter;
    } });
    Object.defineProperty(exports, "AbstractMessageWriter", { enumerable: true, get: function() {
      return messageWriter_1.AbstractMessageWriter;
    } });
    Object.defineProperty(exports, "WriteableStreamMessageWriter", { enumerable: true, get: function() {
      return messageWriter_1.WriteableStreamMessageWriter;
    } });
    const messageBuffer_1 = requireMessageBuffer();
    Object.defineProperty(exports, "AbstractMessageBuffer", { enumerable: true, get: function() {
      return messageBuffer_1.AbstractMessageBuffer;
    } });
    const connection_1 = requireConnection();
    Object.defineProperty(exports, "ConnectionStrategy", { enumerable: true, get: function() {
      return connection_1.ConnectionStrategy;
    } });
    Object.defineProperty(exports, "ConnectionOptions", { enumerable: true, get: function() {
      return connection_1.ConnectionOptions;
    } });
    Object.defineProperty(exports, "NullLogger", { enumerable: true, get: function() {
      return connection_1.NullLogger;
    } });
    Object.defineProperty(exports, "createMessageConnection", { enumerable: true, get: function() {
      return connection_1.createMessageConnection;
    } });
    Object.defineProperty(exports, "ProgressToken", { enumerable: true, get: function() {
      return connection_1.ProgressToken;
    } });
    Object.defineProperty(exports, "ProgressType", { enumerable: true, get: function() {
      return connection_1.ProgressType;
    } });
    Object.defineProperty(exports, "Trace", { enumerable: true, get: function() {
      return connection_1.Trace;
    } });
    Object.defineProperty(exports, "TraceValues", { enumerable: true, get: function() {
      return connection_1.TraceValues;
    } });
    Object.defineProperty(exports, "TraceFormat", { enumerable: true, get: function() {
      return connection_1.TraceFormat;
    } });
    Object.defineProperty(exports, "SetTraceNotification", { enumerable: true, get: function() {
      return connection_1.SetTraceNotification;
    } });
    Object.defineProperty(exports, "LogTraceNotification", { enumerable: true, get: function() {
      return connection_1.LogTraceNotification;
    } });
    Object.defineProperty(exports, "ConnectionErrors", { enumerable: true, get: function() {
      return connection_1.ConnectionErrors;
    } });
    Object.defineProperty(exports, "ConnectionError", { enumerable: true, get: function() {
      return connection_1.ConnectionError;
    } });
    Object.defineProperty(exports, "CancellationReceiverStrategy", { enumerable: true, get: function() {
      return connection_1.CancellationReceiverStrategy;
    } });
    Object.defineProperty(exports, "CancellationSenderStrategy", { enumerable: true, get: function() {
      return connection_1.CancellationSenderStrategy;
    } });
    Object.defineProperty(exports, "CancellationStrategy", { enumerable: true, get: function() {
      return connection_1.CancellationStrategy;
    } });
    Object.defineProperty(exports, "MessageStrategy", { enumerable: true, get: function() {
      return connection_1.MessageStrategy;
    } });
    const ral_12 = ral;
    exports.RAL = ral_12.default;
  })(api);
  return api;
}
Object.defineProperty(ril, "__esModule", { value: true });
const util_1 = require$$0;
const api_1 = requireApi();
class MessageBuffer extends api_1.AbstractMessageBuffer {
  constructor(encoding = "utf-8") {
    super(encoding);
  }
  emptyBuffer() {
    return MessageBuffer.emptyBuffer;
  }
  fromString(value, encoding) {
    return Buffer.from(value, encoding);
  }
  toString(value, encoding) {
    if (value instanceof Buffer) {
      return value.toString(encoding);
    } else {
      return new util_1.TextDecoder(encoding).decode(value);
    }
  }
  asNative(buffer, length) {
    if (length === void 0) {
      return buffer instanceof Buffer ? buffer : Buffer.from(buffer);
    } else {
      return buffer instanceof Buffer ? buffer.slice(0, length) : Buffer.from(buffer, 0, length);
    }
  }
  allocNative(length) {
    return Buffer.allocUnsafe(length);
  }
}
MessageBuffer.emptyBuffer = Buffer.allocUnsafe(0);
class ReadableStreamWrapper {
  constructor(stream) {
    this.stream = stream;
  }
  onClose(listener) {
    this.stream.on("close", listener);
    return api_1.Disposable.create(() => this.stream.off("close", listener));
  }
  onError(listener) {
    this.stream.on("error", listener);
    return api_1.Disposable.create(() => this.stream.off("error", listener));
  }
  onEnd(listener) {
    this.stream.on("end", listener);
    return api_1.Disposable.create(() => this.stream.off("end", listener));
  }
  onData(listener) {
    this.stream.on("data", listener);
    return api_1.Disposable.create(() => this.stream.off("data", listener));
  }
}
class WritableStreamWrapper {
  constructor(stream) {
    this.stream = stream;
  }
  onClose(listener) {
    this.stream.on("close", listener);
    return api_1.Disposable.create(() => this.stream.off("close", listener));
  }
  onError(listener) {
    this.stream.on("error", listener);
    return api_1.Disposable.create(() => this.stream.off("error", listener));
  }
  onEnd(listener) {
    this.stream.on("end", listener);
    return api_1.Disposable.create(() => this.stream.off("end", listener));
  }
  write(data, encoding) {
    return new Promise((resolve, reject) => {
      const callback = (error2) => {
        if (error2 === void 0 || error2 === null) {
          resolve();
        } else {
          reject(error2);
        }
      };
      if (typeof data === "string") {
        this.stream.write(data, encoding, callback);
      } else {
        this.stream.write(data, callback);
      }
    });
  }
  end() {
    this.stream.end();
  }
}
const _ril = Object.freeze({
  messageBuffer: Object.freeze({
    create: (encoding) => new MessageBuffer(encoding)
  }),
  applicationJson: Object.freeze({
    encoder: Object.freeze({
      name: "application/json",
      encode: (msg2, options) => {
        try {
          return Promise.resolve(Buffer.from(JSON.stringify(msg2, void 0, 0), options.charset));
        } catch (err) {
          return Promise.reject(err);
        }
      }
    }),
    decoder: Object.freeze({
      name: "application/json",
      decode: (buffer, options) => {
        try {
          if (buffer instanceof Buffer) {
            return Promise.resolve(JSON.parse(buffer.toString(options.charset)));
          } else {
            return Promise.resolve(JSON.parse(new util_1.TextDecoder(options.charset).decode(buffer)));
          }
        } catch (err) {
          return Promise.reject(err);
        }
      }
    })
  }),
  stream: Object.freeze({
    asReadableStream: (stream) => new ReadableStreamWrapper(stream),
    asWritableStream: (stream) => new WritableStreamWrapper(stream)
  }),
  console,
  timer: Object.freeze({
    setTimeout(callback, ms, ...args) {
      const handle = setTimeout(callback, ms, ...args);
      return { dispose: () => clearTimeout(handle) };
    },
    setImmediate(callback, ...args) {
      const handle = setImmediate(callback, ...args);
      return { dispose: () => clearImmediate(handle) };
    },
    setInterval(callback, ms, ...args) {
      const handle = setInterval(callback, ms, ...args);
      return { dispose: () => clearInterval(handle) };
    }
  })
});
function RIL() {
  return _ril;
}
(function(RIL2) {
  function install() {
    api_1.RAL.install(_ril);
  }
  RIL2.install = install;
})(RIL || (RIL = {}));
ril.default = RIL;
(function(exports) {
  var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    o[k2] = m[k];
  });
  var __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function(m, exports2) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
        __createBinding(exports2, m, p);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.createMessageConnection = exports.createServerSocketTransport = exports.createClientSocketTransport = exports.createServerPipeTransport = exports.createClientPipeTransport = exports.generateRandomPipeName = exports.StreamMessageWriter = exports.StreamMessageReader = exports.SocketMessageWriter = exports.SocketMessageReader = exports.PortMessageWriter = exports.PortMessageReader = exports.IPCMessageWriter = exports.IPCMessageReader = void 0;
  const ril_1 = ril;
  ril_1.default.install();
  const path$1 = path;
  const os$1 = os;
  const crypto_1 = require$$3;
  const net_1 = require$$4;
  const api_12 = requireApi();
  __exportStar(requireApi(), exports);
  class IPCMessageReader extends api_12.AbstractMessageReader {
    constructor(process2) {
      super();
      this.process = process2;
      let eventEmitter = this.process;
      eventEmitter.on("error", (error2) => this.fireError(error2));
      eventEmitter.on("close", () => this.fireClose());
    }
    listen(callback) {
      this.process.on("message", callback);
      return api_12.Disposable.create(() => this.process.off("message", callback));
    }
  }
  exports.IPCMessageReader = IPCMessageReader;
  class IPCMessageWriter extends api_12.AbstractMessageWriter {
    constructor(process2) {
      super();
      this.process = process2;
      this.errorCount = 0;
      const eventEmitter = this.process;
      eventEmitter.on("error", (error2) => this.fireError(error2));
      eventEmitter.on("close", () => this.fireClose);
    }
    write(msg2) {
      try {
        if (typeof this.process.send === "function") {
          this.process.send(msg2, void 0, void 0, (error2) => {
            if (error2) {
              this.errorCount++;
              this.handleError(error2, msg2);
            } else {
              this.errorCount = 0;
            }
          });
        }
        return Promise.resolve();
      } catch (error2) {
        this.handleError(error2, msg2);
        return Promise.reject(error2);
      }
    }
    handleError(error2, msg2) {
      this.errorCount++;
      this.fireError(error2, msg2, this.errorCount);
    }
    end() {
    }
  }
  exports.IPCMessageWriter = IPCMessageWriter;
  class PortMessageReader extends api_12.AbstractMessageReader {
    constructor(port) {
      super();
      this.onData = new api_12.Emitter();
      port.on("close", () => this.fireClose);
      port.on("error", (error2) => this.fireError(error2));
      port.on("message", (message) => {
        this.onData.fire(message);
      });
    }
    listen(callback) {
      return this.onData.event(callback);
    }
  }
  exports.PortMessageReader = PortMessageReader;
  class PortMessageWriter extends api_12.AbstractMessageWriter {
    constructor(port) {
      super();
      this.port = port;
      this.errorCount = 0;
      port.on("close", () => this.fireClose());
      port.on("error", (error2) => this.fireError(error2));
    }
    write(msg2) {
      try {
        this.port.postMessage(msg2);
        return Promise.resolve();
      } catch (error2) {
        this.handleError(error2, msg2);
        return Promise.reject(error2);
      }
    }
    handleError(error2, msg2) {
      this.errorCount++;
      this.fireError(error2, msg2, this.errorCount);
    }
    end() {
    }
  }
  exports.PortMessageWriter = PortMessageWriter;
  class SocketMessageReader extends api_12.ReadableStreamMessageReader {
    constructor(socket, encoding = "utf-8") {
      super((0, ril_1.default)().stream.asReadableStream(socket), encoding);
    }
  }
  exports.SocketMessageReader = SocketMessageReader;
  class SocketMessageWriter extends api_12.WriteableStreamMessageWriter {
    constructor(socket, options) {
      super((0, ril_1.default)().stream.asWritableStream(socket), options);
      this.socket = socket;
    }
    dispose() {
      super.dispose();
      this.socket.destroy();
    }
  }
  exports.SocketMessageWriter = SocketMessageWriter;
  class StreamMessageReader extends api_12.ReadableStreamMessageReader {
    constructor(readable, encoding) {
      super((0, ril_1.default)().stream.asReadableStream(readable), encoding);
    }
  }
  exports.StreamMessageReader = StreamMessageReader;
  class StreamMessageWriter extends api_12.WriteableStreamMessageWriter {
    constructor(writable, options) {
      super((0, ril_1.default)().stream.asWritableStream(writable), options);
    }
  }
  exports.StreamMessageWriter = StreamMessageWriter;
  const XDG_RUNTIME_DIR = process.env["XDG_RUNTIME_DIR"];
  const safeIpcPathLengths = /* @__PURE__ */ new Map([
    ["linux", 107],
    ["darwin", 103]
  ]);
  function generateRandomPipeName() {
    const randomSuffix = (0, crypto_1.randomBytes)(21).toString("hex");
    if (process.platform === "win32") {
      return `\\\\.\\pipe\\vscode-jsonrpc-${randomSuffix}-sock`;
    }
    let result;
    if (XDG_RUNTIME_DIR) {
      result = path$1.join(XDG_RUNTIME_DIR, `vscode-ipc-${randomSuffix}.sock`);
    } else {
      result = path$1.join(os$1.tmpdir(), `vscode-${randomSuffix}.sock`);
    }
    const limit = safeIpcPathLengths.get(process.platform);
    if (limit !== void 0 && result.length > limit) {
      (0, ril_1.default)().console.warn(`WARNING: IPC handle "${result}" is longer than ${limit} characters.`);
    }
    return result;
  }
  exports.generateRandomPipeName = generateRandomPipeName;
  function createClientPipeTransport(pipeName, encoding = "utf-8") {
    let connectResolve;
    const connected = new Promise((resolve, _reject) => {
      connectResolve = resolve;
    });
    return new Promise((resolve, reject) => {
      let server = (0, net_1.createServer)((socket) => {
        server.close();
        connectResolve([
          new SocketMessageReader(socket, encoding),
          new SocketMessageWriter(socket, encoding)
        ]);
      });
      server.on("error", reject);
      server.listen(pipeName, () => {
        server.removeListener("error", reject);
        resolve({
          onConnected: () => {
            return connected;
          }
        });
      });
    });
  }
  exports.createClientPipeTransport = createClientPipeTransport;
  function createServerPipeTransport(pipeName, encoding = "utf-8") {
    const socket = (0, net_1.createConnection)(pipeName);
    return [
      new SocketMessageReader(socket, encoding),
      new SocketMessageWriter(socket, encoding)
    ];
  }
  exports.createServerPipeTransport = createServerPipeTransport;
  function createClientSocketTransport(port, encoding = "utf-8") {
    let connectResolve;
    const connected = new Promise((resolve, _reject) => {
      connectResolve = resolve;
    });
    return new Promise((resolve, reject) => {
      const server = (0, net_1.createServer)((socket) => {
        server.close();
        connectResolve([
          new SocketMessageReader(socket, encoding),
          new SocketMessageWriter(socket, encoding)
        ]);
      });
      server.on("error", reject);
      server.listen(port, "127.0.0.1", () => {
        server.removeListener("error", reject);
        resolve({
          onConnected: () => {
            return connected;
          }
        });
      });
    });
  }
  exports.createClientSocketTransport = createClientSocketTransport;
  function createServerSocketTransport(port, encoding = "utf-8") {
    const socket = (0, net_1.createConnection)(port, "127.0.0.1");
    return [
      new SocketMessageReader(socket, encoding),
      new SocketMessageWriter(socket, encoding)
    ];
  }
  exports.createServerSocketTransport = createServerSocketTransport;
  function isReadableStream(value) {
    const candidate = value;
    return candidate.read !== void 0 && candidate.addListener !== void 0;
  }
  function isWritableStream(value) {
    const candidate = value;
    return candidate.write !== void 0 && candidate.addListener !== void 0;
  }
  function createMessageConnection(input, output2, logger2, options) {
    if (!logger2) {
      logger2 = api_12.NullLogger;
    }
    const reader = isReadableStream(input) ? new StreamMessageReader(input) : input;
    const writer = isWritableStream(output2) ? new StreamMessageWriter(output2) : output2;
    if (api_12.ConnectionStrategy.is(options)) {
      options = { connectionStrategy: options };
    }
    return (0, api_12.createMessageConnection)(reader, writer, logger2, options);
  }
  exports.createMessageConnection = createMessageConnection;
})(main);
function forward(clientConnection, serverConnection, map) {
  clientConnection.forward(serverConnection, map);
  serverConnection.forward(clientConnection, map);
  clientConnection.onClose(() => serverConnection.dispose());
  serverConnection.onClose(() => clientConnection.dispose());
}
function createConnection(reader, writer, onDispose, extensions = {}) {
  const disposeOnClose = new DisposableCollection();
  reader.onClose(() => disposeOnClose.dispose());
  writer.onClose(() => disposeOnClose.dispose());
  return {
    reader,
    writer,
    forward(to, map = (message) => message) {
      reader.listen((input) => {
        const output2 = map(input);
        to.writer.write(output2);
      });
    },
    onClose(callback) {
      return disposeOnClose.push(main.Disposable.create(callback));
    },
    dispose: () => onDispose(),
    ...extensions
  };
}
var node = main;
function createServerProcess(serverName, command, args, options) {
  const serverProcess = cp__namespace.spawn(command, args || [], options || {});
  serverProcess.on("error", (error2) => console.error(`Launching ${serverName} Server failed: ${error2}`));
  if (serverProcess.stderr !== null) {
    serverProcess.stderr.on("data", (data) => console.error(`${serverName} Server: ${data}`));
  }
  return createProcessStreamConnection(serverProcess);
}
function createProcessStreamConnection(process2) {
  if (process2.stdout !== null && process2.stdin !== null) {
    return createStreamConnection(process2.stdout, process2.stdin, () => process2.kill());
  } else {
    return void 0;
  }
}
function createStreamConnection(outStream, inStream, onDispose) {
  const reader = new node.StreamMessageReader(outStream);
  const writer = new node.StreamMessageWriter(inStream);
  return createConnection(reader, writer, onDispose);
}
function run(config) {
  process.on("uncaughtException", function(err) {
    logger.error("Uncaught Exception: ", err.toString());
    if (err.stack) {
      logger.error(err.stack);
    }
  });
  const app = express();
  const server = app.listen(config.serverPort);
  const wss = new WebSocket.WebSocketServer(config.wsServerOptions);
  upgradeWsServer(config, { server, wss });
}
function upgradeWsServer(runConfig, config) {
  config.server.on("upgrade", (request2, socket, head) => {
    const baseURL = `http://${request2.headers.host}/`;
    const pathName = request2.url ? new URL(request2.url, baseURL).pathname : void 0;
    if (pathName === runConfig.pathName) {
      config.wss.handleUpgrade(request2, socket, head, (webSocket) => {
        const socket2 = {
          send: (content) => webSocket.send(content, (error2) => {
            if (error2) {
              throw error2;
            }
          }),
          onMessage: (cb) => webSocket.on("message", (data) => {
            cb(data);
          }),
          onError: (cb) => webSocket.on("error", cb),
          onClose: (cb) => webSocket.on("close", cb),
          dispose: () => webSocket.close()
        };
        if (webSocket.readyState === webSocket.OPEN) {
          launchLanguageServer(runConfig, socket2);
        } else {
          webSocket.on("open", () => {
            launchLanguageServer(runConfig, socket2);
          });
        }
      });
    }
  });
}
function launchLanguageServer(runConfig, socket) {
  const { serverName, runCommand, runCommandArgs, spawnOptions } = runConfig;
  const reader = new WebSocketMessageReader(socket);
  const writer = new WebSocketMessageWriter(socket);
  const socketConnection = createConnection(reader, writer, () => socket.dispose());
  const serverConnection = createServerProcess(
    serverName,
    runCommand,
    runCommandArgs,
    spawnOptions
  );
  if (serverConnection) {
    forward(socketConnection, serverConnection, (message) => {
      if (vscodeLanguageserver.Message.isRequest(message)) {
        if (message.method === vscodeLanguageserver.InitializeRequest.type.method) {
          const initializeParams = message.params;
          initializeParams.processId = process.pid;
        }
      }
      return message;
    });
  }
}
async function runLanguageServer() {
  const node2 = path.join(__dirname, "../../node_modules/node/bin/node").replace("app.asar", "app.asar.unpacked");
  const pyright = path.join(__dirname, "../../node_modules/pyright/langserver.index.js").replace("app.asar", "app.asar.unpacked");
  const python = await getConfig("editor.python");
  const config = {
    serverName: "PYRIGHT",
    pathName: "/pyright",
    serverPort: 30017,
    runCommand: node2,
    runCommandArgs: [pyright, "--stdio"],
    wsServerOptions: {
      noServer: true,
      perMessageDeflate: false,
      clientTracking: true,
      verifyClient: (clientInfo, callback) => {
        const parsedURL = new URL(`${clientInfo.origin}${clientInfo.req?.url ?? ""}`);
        const authToken = parsedURL.searchParams.get("authorization");
        if (authToken === "UserAuth") {
          callback(true);
        } else {
          callback(false);
        }
      }
    },
    spawnOptions: python ? {
      env: {
        PATH: utils.platform.isWindows ? `${python};${process.env.PATH}` : `${python}:${process.env.PATH}`
      }
    } : void 0
  };
  try {
    run(config);
  } catch (err) {
    logger.error("run language server failed: ", err);
  }
}
function createMenu() {
  const template = [
    {
      label: electron.app.name,
      submenu: [
        { role: "services" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" }
      ]
    },
    // { role: 'editMenu' }
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" }
      ]
    },
    // { role: 'viewMenu' }
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" }
      ]
    }
  ];
  const menu = electron.Menu.buildFromTemplate(template);
  electron.Menu.setApplicationMenu(menu);
}
function createWindow() {
  const mainWindow = new electron.BrowserWindow({
    titleBarStyle: utils.platform.isMacOS ? "hiddenInset" : utils.platform.isWindows ? "hidden" : "default",
    frame: false,
    width: 1024,
    height: 768,
    minWidth: 650,
    minHeight: 650,
    backgroundColor: "#1F1F1F",
    ...utils.platform.isLinux ? { icon } : {},
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  });
  mainWindow.maximize();
  if (!utils.platform.isMacOS) {
    mainWindow.setMenu(null);
  }
  initConfig();
  registerMainEvents(mainWindow);
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}
electron.app.whenReady().then(() => {
  utils.electronApp.setAppUserModelId("com.sipeed.maixvision");
  electron.app.on("browser-window-created", (_, window2) => {
    utils.optimizer.watchWindowShortcuts(window2);
  });
  registerRendererEvents();
  createWindow();
  if (utils.platform.isMacOS) {
    createMenu();
  }
  runLanguageServer();
  launch();
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0)
      createWindow();
  });
});
electron.app.on("before-quit", () => {
  closeWebsocket();
});
electron.app.on("window-all-closed", () => {
  if (!utils.platform.isMacOS) {
    electron.app.quit();
  }
});
process.on("uncaughtException", (error2) => {
  const errorMessage = `${(/* @__PURE__ */ new Date()).toISOString()} - Uncaught Exception: ${error2}
`;
  logger.error(errorMessage);
});
