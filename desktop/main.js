const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        title: "Chat Connect",
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    const frontendPath = app.isPackaged
        ? path.join(process.resourcesPath, "frontend/dist/index.html")
        : path.join(__dirname, "../frontend/dist/index.html");

    console.log("Frontend path:", frontendPath);
    console.log("File exists:", fs.existsSync(frontendPath));

    win.webContents.openDevTools();

    win.webContents.on("did-fail-load", (event, code, description) => {
        console.log("Load failed:", code, description);
    });

    win.webContents.on("console-message", (event, level, message) => {
        console.log("Frontend console:", message);
    });

    win.loadFile(frontendPath);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});