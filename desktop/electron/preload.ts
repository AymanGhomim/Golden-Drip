import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("desktop", {
  platform: process.platform,
  versions: { electron: process.versions.electron },
});
