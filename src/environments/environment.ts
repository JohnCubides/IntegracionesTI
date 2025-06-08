// src/environments/environment.ts

export const environment = {
  production: (window as any)["env"]?.["production"] ?? false,
  pat: (window as any)["env"]?.["pat"] ?? "http://localhost:3000/api",
  apigeePw: (window as any)["env"]?.["apigeePw"] ?? "local-password"
};
