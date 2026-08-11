/// <reference types="vite/client" />

interface Window {
  desktop?: { platform: string; versions: { electron: string } };
}
