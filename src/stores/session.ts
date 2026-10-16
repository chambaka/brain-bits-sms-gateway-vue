import { defineStore } from "pinia";
import { api } from "../api";

export const useSession = defineStore("session", {
  state: () => ({
    email: localStorage.getItem("email") ?? "",
    accessToken: localStorage.getItem("accessToken") ?? ""
  }),
  getters: {
    signedIn: (state) => state.accessToken.length > 0
  },
  actions: {
    async login(email: string, password: string) {
      const data = await api<{ accessToken: string }>(
        "/api/v1/auth/login",
        { method: "POST", body: JSON.stringify({ email, password }) }
      );
      this.email = email;
      this.accessToken = data.accessToken;
      localStorage.setItem("email", email);
      localStorage.setItem("accessToken", data.accessToken);
    },
    logout() {
      this.email = "";
      this.accessToken = "";
      localStorage.removeItem("email");
      localStorage.removeItem("accessToken");
    }
  }
});
