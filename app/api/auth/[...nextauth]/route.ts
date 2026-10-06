// Endpoints de Auth.js v5: /api/auth/* (Semana 05).
//
// El proxy NO sirve estas rutas —comprueba la sesión, pero no implementa el
// inicio de sesión— así que este Route Handler es obligatorio: sin él, el POST
// a /api/auth/callback/credentials que dispara el formulario no llega a ninguna
// parte y el login nunca funcionaría.
//
// `handlers` expone GET y POST con la misma función: Auth.js enruta internamente
// según la URL y el método.
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
