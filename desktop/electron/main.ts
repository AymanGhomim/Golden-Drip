import { app, BrowserWindow, shell } from "electron";
import path from "node:path";
import { pathToFileURL } from "node:url";

const APP_ID = "com.pentak.cafe";

function isExternalWebUrl(url: string) {
  try {
    const protocol = new URL(url).protocol;
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}

function createWindow() {
  const developmentUrl = app.isPackaged
    ? undefined
    : process.env.VITE_DEV_SERVER_URL;
  const productionIndex = path.resolve(__dirname, "../dist/index.html");
  const productionUrl = pathToFileURL(productionIndex).href;
  const rendererSmokeTest =
    process.env.ELECTRON_RENDERER_SMOKE_TEST === "1" ||
    process.env.ELECTRON_PACKAGED_SMOKE_TEST === "1";

  const window = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    backgroundColor: "#f5ede5",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });

  window.once("ready-to-show", () => {
    if (!rendererSmokeTest) window.show();
  });
  window.webContents.once("did-finish-load", () => {
    if (rendererSmokeTest) {
      console.log("Electron renderer loaded successfully");
      app.quit();
    }
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (isExternalWebUrl(url)) void shell.openExternal(url);
    return { action: "deny" };
  });
  window.webContents.on("will-navigate", (event, url) => {
    const allowed = developmentUrl
      ? new URL(url).origin === new URL(developmentUrl).origin
      : url === productionUrl || url.startsWith(`${productionUrl}#`);
    if (!allowed) {
      event.preventDefault();
      if (isExternalWebUrl(url)) void shell.openExternal(url);
    }
  });

  if (developmentUrl) void window.loadURL(developmentUrl);
  else void window.loadFile(productionIndex);
}

app.whenReady().then(() => {
  app.setAppUserModelId(APP_ID);
  if (process.env.ELECTRON_SMOKE_TEST === "1") {
    console.log("Electron main process started successfully");
    app.quit();
    return;
  }
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
