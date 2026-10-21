import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const ACCESS_TOKEN_KEY = "blog_folio_access_token";
const REFRESH_TOKEN_KEY = "blog_folio_refresh_token";

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
};

let refreshPromise: Promise<string | null> | null = null;

export const authService = {
  async login(username: string, password: string) {
    const { data } = await axios.post<LoginResponse>(`${API_URL}/auth/login`, {
      username,
      password,
    });
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
  },

  logout() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  isAuthenticated() {
    return Boolean(localStorage.getItem(REFRESH_TOKEN_KEY));
  },

  async getAccessToken() {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (accessToken && !isExpired(accessToken)) return accessToken;

    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) return null;

    // Reuse one refresh request when several API calls need a token at once.
    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          const { data } = await axios.post<Pick<LoginResponse, "accessToken">>(
            `${API_URL}/auth/refresh`,
            { refreshToken },
          );
          localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
          return data.accessToken;
        } catch {
          // Refresh failed, so clear the tokens and require a new login.
          this.logout();
          return null;
        } finally {
          refreshPromise = null;
        }
      })();
    }

    return refreshPromise;
  }
}

function isExpired(token: string) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as { exp?: number };
    return !payload.exp || payload.exp * 1000 <= Date.now() + 10_000;
  } catch {
    return true;
  }
}
