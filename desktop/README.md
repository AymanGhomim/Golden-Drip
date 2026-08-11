# Penta-K Cafe Desktop

One generic Electron client is distributed to every Cafe. Tenant branding and access are resolved only after login; do not create Tenant-specific installers.

## Development

```bash
npm install
npm run electron:dev
```

Development authentication is available only in Vite development mode. It is dynamically imported and excluded from production bundles.

## Windows receipt printer setup

Penta-K Cafe discovers printers that are already installed in Windows. Install the printer using its manufacturer or compatible Windows driver first, configure the driver for the actual 80mm roll size, then:

1. Start the Electron application with `npm run electron:dev`.
2. Open **الإعدادات → الطابعة**.
3. Click **تحديث الطابعات**.
4. Select the exact installed receipt printer and click **حفظ الطابعة**.
5. Use **طباعة تجريبية** before printing a real order receipt.

The selected system `deviceName` is stored only on that computer at:

```text
Electron userData/desktop-printer-settings.json
```

The application validates the saved name against `webContents.getPrintersAsync()` before every print and never silently switches to another printer. Physical printing uses `webContents.print()` directly; it does not create a PDF. Penta-K Cafe does not install or manage printer drivers.

To inspect the printers Electron can currently see without sending any print job:

```bash
npm run electron:printers
```

## Production build

```bash
npm run build
```

This creates the renderer in `dist/` and Electron main/preload output in `dist-electron/`. It does not create an installer.

Production login requires `VITE_API_BASE_URL` at build time. Without it, the packaged application displays a Backend-configuration-unavailable state and never falls back to localhost or development authentication.

PowerShell example for a future production Backend:

```powershell
$env:VITE_API_BASE_URL="https://api.example.com/api/v1"
npm run electron:dist:win
```

## Windows installer

```bash
npm run electron:dist:win
```

Expected output:

```text
release/Penta-K-Cafe-Setup-<version>.exe
release/win-unpacked/Penta-K Cafe.exe
```

The NSIS installer is assisted, per-user, allows choosing the installation directory, creates Desktop and Start Menu shortcuts, and includes normal uninstall support.

## Distribution status

- Current installers are unsigned and are suitable for development/test distribution only.
- Commercial distribution should use a trusted Windows code-signing certificate supplied to electron-builder through secure CI secrets such as `CSC_LINK` and `CSC_KEY_PASSWORD`; never commit certificate material.
- A real shared Backend and production Cafe authentication are required before delivery to paying Cafes.
- Auto-update is intentionally not included. It is the next distribution enhancement after signing and release hosting are decided.
