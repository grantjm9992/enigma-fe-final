// In-memory token storage
let authToken: string | null = null;

export const tokenManager = {
  getToken: (): string | null => {
    return authToken;
  },

  setToken: (token: string | null): void => {
    authToken = token;
  },

  clearToken: (): void => {
    authToken = null;
  },
};
