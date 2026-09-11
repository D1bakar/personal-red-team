const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("access_token");
      this.refreshToken = localStorage.getItem("refresh_token");
    }
  }

  setTokens(access: string, refresh: string) {
    this.accessToken = access;
    this.refreshToken = refresh;
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  private isTokenExpiringSoon(token: string, bufferMinutes: number = 5): boolean {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiryMs = payload.exp * 1000;
      const bufferMs = bufferMinutes * 60 * 1000;
      return expiryMs - Date.now() < bufferMs;
    } catch {
      return true;
    }
  }

  private async request(path: string, options: RequestInit = {}): Promise<any> {
    if (this.accessToken && this.isTokenExpired(this.accessToken)) {
      const refreshed = await this.tryRefresh();
      if (!refreshed) {
        this.clearTokens();
        if (typeof window !== "undefined") window.location.href = "/login";
        throw new Error("Session expired");
      }
    }

    if (this.accessToken && this.isTokenExpiringSoon(this.accessToken)) {
      await this.tryRefresh();
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (res.status === 401 && this.refreshToken) {
      const refreshed = await this.tryRefresh();
      if (refreshed) {
        headers["Authorization"] = `Bearer ${this.accessToken}`;
        const retryRes = await fetch(`${API_BASE}${path}`, { ...options, headers });
        if (!retryRes.ok) throw new Error(`Request failed: ${retryRes.status}`);
        return retryRes.json();
      }
      this.clearTokens();
      if (typeof window !== "undefined") window.location.href = "/login";
      throw new Error("Session expired");
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "Request failed" }));
      throw new Error(error.detail || `Request failed: ${res.status}`);
    }

    return res.json();
  }

  private async tryRefresh(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      this.setTokens(data.access_token, data.refresh_token);
      return true;
    } catch {
      return false;
    }
  }

  // Auth
  async register(email: string, name: string, password: string) {
    const data = await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, name, password }),
    });
    this.setTokens(data.access_token, data.refresh_token);
    return data;
  }

  async login(email: string, password: string) {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);
    const data = await this.request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });
    if (!data.refresh_token) {
      // Account has 2FA enabled: backend issued an mfa_pending token.
      // Do NOT store it as a session — park it for the challenge page.
      if (typeof window !== "undefined") {
        sessionStorage.setItem("mfa_pending_token", data.access_token);
      }
      return { mfaRequired: true as const, user: data.user };
    }
    this.setTokens(data.access_token, data.refresh_token);
    return { mfaRequired: false as const, ...data };
  }

  async verify2faLogin(token: string, code: string) {
    const data = await this.request("/auth/verify-2fa", {
      method: "POST",
      body: JSON.stringify({ token, code }),
    });
    this.setTokens(data.access_token, data.refresh_token);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("mfa_pending_token");
    }
    return data;
  }

  async forgotPassword(email: string) {
    return this.request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string) {
    return this.request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
  }

  async verifyEmail(token: string) {
    return this.request("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  }

  async setup2fa() {
    return this.request("/auth/2fa/setup", { method: "POST" });
  }

  async enable2fa(code: string) {
    return this.request("/auth/2fa/enable", {
      method: "POST",
      body: JSON.stringify({ token: "", code }),
    });
  }

  async disable2fa(code: string) {
    return this.request("/auth/2fa/disable", {
      method: "POST",
      body: JSON.stringify({ token: "", code }),
    });
  }

  async getMe() {
    return this.request("/auth/me");
  }

  // Simulations
  async generateSimulation(type?: string) {
    return this.request("/simulations/generate", {
      method: "POST",
      body: type ? JSON.stringify({ type }) : undefined,
    });
  }

  async listSimulations() {
    return this.request("/simulations");
  }

  async revealSimulation(id: string) {
    return this.request(`/simulations/${id}/reveal`, { method: "POST" });
  }

  // Threats
  async analyzeThreat(inputText: string) {
    return this.request("/threats/analyze", {
      method: "POST",
      body: JSON.stringify({ input_text: inputText }),
    });
  }

  async getThreatHistory() {
    return this.request("/threats/history");
  }

  // Analytics
  async getScore() {
    return this.request("/analytics/score");
  }

  async getStats() {
    return this.request("/analytics/stats");
  }

  async getVulnerabilities() {
    return this.request("/analytics/vulnerabilities");
  }
}

export const api = new ApiClient();
