export {}

declare global {
  interface Window {
    desktop: {
      platform: string
      getAppVersion: () => Promise<string>
    }
  }
}
