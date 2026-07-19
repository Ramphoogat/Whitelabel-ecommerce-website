export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  orders: number;
  lifetimeValue: number;
  joined: string;
}

export const CUSTOMERS: AdminCustomer[] = [
  { id: "c1", name: "Nisha Verma", email: "nisha.verma@example.com", orders: 8, lifetimeValue: 42800, joined: "2025-11-02" },
  { id: "c2", name: "Kabir Malhotra", email: "kabir.m@example.com", orders: 2, lifetimeValue: 6600, joined: "2026-03-14" },
  { id: "c3", name: "Ayesha Khan", email: "ayesha.khan@example.com", orders: 5, lifetimeValue: 24100, joined: "2025-08-27" },
  { id: "c4", name: "Rohan Desai", email: "rohan.desai@example.com", orders: 12, lifetimeValue: 71200, joined: "2025-05-19" },
  { id: "c5", name: "Priya Nair", email: "priya.nair@example.com", orders: 1, lifetimeValue: 4200, joined: "2026-06-30" },
  { id: "c6", name: "Arjun Rao", email: "arjun.rao@example.com", orders: 4, lifetimeValue: 19800, joined: "2025-12-11" },
];
