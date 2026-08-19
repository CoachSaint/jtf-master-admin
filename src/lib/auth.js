// Executive Access & PIN Gate for David & Michael

export const AUTHORIZED_OPERATORS = [
  {
    id: "michael",
    name: "Michael Saint",
    email: "michael@jtfhomegroup.com",
    phone: "(404) 555-0199",
    title: "Managing Partner",
    pin: "0424",
    avatar: "MS",
  },
  {
    id: "david",
    name: "David",
    email: "david@jtfhomegroup.com",
    phone: "(404) 555-0188",
    title: "Executive Partner",
    pin: "0424",
    avatar: "D",
  },
];

const MASTER_PIN = "0424"; // Universal Executive Master PIN
const AUTH_SESSION_KEY = "jtf_master_admin_session_v1";

export const authService = {
  isAuthenticated() {
    try {
      const session = localStorage.getItem(AUTH_SESSION_KEY);
      if (!session) return false;
      const data = JSON.parse(session);
      // Valid for 30 days
      return data.expiresAt && new Date(data.expiresAt) > new Date();
    } catch {
      return false;
    }
  },

  getCurrentUser() {
    try {
      const session = localStorage.getItem(AUTH_SESSION_KEY);
      if (!session) return AUTHORIZED_OPERATORS[0];
      const data = JSON.parse(session);
      return AUTHORIZED_OPERATORS.find((o) => o.id === data.operatorId) || AUTHORIZED_OPERATORS[0];
    } catch {
      return AUTHORIZED_OPERATORS[0];
    }
  },

  loginWithPin(pin, operatorId = "michael") {
    const cleanPin = String(pin).trim();
    const op = AUTHORIZED_OPERATORS.find((o) => o.id === operatorId) || AUTHORIZED_OPERATORS[0];
    
    if (cleanPin === MASTER_PIN || cleanPin === op.pin) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 day persistent session
      const sessionData = {
        operatorId: op.id,
        operatorName: op.name,
        operatorEmail: op.email,
        authenticatedAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
      };
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(sessionData));
      return { ok: true, user: op };
    }
    return { ok: false, error: "Invalid Executive PIN" };
  },

  switchOperator(operatorId) {
    const op = AUTHORIZED_OPERATORS.find((o) => o.id === operatorId);
    if (!op) return;
    try {
      const session = JSON.parse(localStorage.getItem(AUTH_SESSION_KEY) || "{}");
      session.operatorId = op.id;
      session.operatorName = op.name;
      session.operatorEmail = op.email;
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    } catch {}
    return op;
  },

  logout() {
    localStorage.removeItem(AUTH_SESSION_KEY);
  }
};
