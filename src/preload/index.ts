import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('desktop', {
  platform: process.platform,
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('app:version')
})
