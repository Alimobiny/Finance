export {}

declare global {
  interface GisTokenResponse {
    access_token?: string
    expires_in?: number
    error?: string
  }

  interface GisTokenClient {
    requestAccessToken(overrideConfig?: { prompt?: string }): void
  }

  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient(config: {
            client_id: string
            scope: string
            callback: (response: GisTokenResponse) => void
            error_callback?: (error: { type: string }) => void
          }): GisTokenClient
        }
      }
    }
  }
}
