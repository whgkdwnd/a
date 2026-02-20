const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  getGoalBalance: () => ipcRenderer.invoke('getGoalBalance'),
  updateGoalBalance: (body) => ipcRenderer.invoke('updateGoalBalance', body),
  getMaterialSettings: () => ipcRenderer.invoke('getMaterialSettings'),
  updateMaterialSettings: (body) => ipcRenderer.invoke('updateMaterialSettings', body),
  getRecords: (month) => ipcRenderer.invoke('getRecords', month),
  createRecord: (body) => ipcRenderer.invoke('createRecord', body),
  deleteRecord: (id) => ipcRenderer.invoke('deleteRecord', id),
  getContents: () => ipcRenderer.invoke('getContents'),
  createContent: (body) => ipcRenderer.invoke('createContent', body),
  spendContent: (body) => ipcRenderer.invoke('spendContent', body),
  getBosses: () => ipcRenderer.invoke('getBosses'),
  createBoss: (body) => ipcRenderer.invoke('createBoss', body),
  deleteBoss: (id) => ipcRenderer.invoke('deleteBoss', id),
  reorderBosses: (body) => ipcRenderer.invoke('reorderBosses', body),
  checkBoss: (body) => ipcRenderer.invoke('checkBoss', body),
  resetBosses: () => ipcRenderer.invoke('resetBosses'),
  recordAhmae: (body) => ipcRenderer.invoke('recordAhmae', body),
  getDataPath: () => ipcRenderer.invoke('getDataPath'),
})
