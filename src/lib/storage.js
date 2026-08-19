// Storage helper for Master Admin App

export const OPERATORS = [
  { id: "michael", name: "Michael Saint", email: "michael@jtfhomegroup.com", phone: "(404) 555-0199", title: "Managing Partner" },
  { id: "david", name: "David", email: "david@jtfhomegroup.com", phone: "(404) 555-0188", title: "Executive Partner" },
];

const DEALS_KEY = "jtf_master_deals_v1";
const OP_KEY = "jtf_master_active_operator_v1";

export const dealStorage = {
  getDeals() {
    try {
      const raw = localStorage.getItem(DEALS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveDeal(deal) {
    const deals = this.getDeals();
    const existingIdx = deals.findIndex((d) => d.id === deal.id);
    let updated;
    const now = new Date().toISOString();
    const row = { ...deal, updatedAt: now };

    if (existingIdx >= 0) {
      deals[existingIdx] = row;
      updated = deals;
    } else {
      row.createdAt = row.createdAt || now;
      updated = [row, ...deals];
    }

    try {
      localStorage.setItem(DEALS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Storage write failed", e);
    }
    return row;
  },

  getDeal(id) {
    return this.getDeals().find((d) => d.id === id) || null;
  },

  deleteDeal(id) {
    const updated = this.getDeals().filter((d) => d.id !== id);
    localStorage.setItem(DEALS_KEY, JSON.stringify(updated));
    return updated;
  },

  getActiveOperator() {
    try {
      const id = localStorage.getItem(OP_KEY);
      return OPERATORS.find((o) => o.id === id) || OPERATORS[0];
    } catch {
      return OPERATORS[0];
    }
  },

  setActiveOperator(id) {
    try {
      localStorage.setItem(OP_KEY, id);
    } catch (e) {
      console.warn("Storage write failed", e);
    }
  }
};
