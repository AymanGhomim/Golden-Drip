# Penta-K Cafe Desktop

One generic Electron client is distributed to every Cafe. Tenant branding and access are resolved only after login; do not create Tenant-specific installers.

## Development

```bash
npm install
npm run electron:dev
```

Development authentication is available only in Vite development mode. It is dynamically imported and excluded from production bundles.

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
