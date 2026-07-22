export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  orders: number;
  lifetimeValue: number; // paise
  joined: string;        // ISO date
  joinVia: "email" | "google" | "facebook" | "apple" | "phone";
  spendDaily: number;    // paise
  spendWeekly: number;
  spendMonthly: number;
  spendYearly: number;
}

export const CUSTOMERS: AdminCustomer[] = [
  {
    id: "c1", name: "Nisha Verma", email: "nisha.verma@example.com",
    orders: 8, lifetimeValue: 4280000, joined: "2025-11-02", joinVia: "google",
    spendDaily: 0, spendWeekly: 349900, spendMonthly: 899900, spendYearly: 4280000,
  },
  {
    id: "c2", name: "Kabir Malhotra", email: "kabir.m@example.com",
    orders: 2, lifetimeValue: 660000, joined: "2026-03-14", joinVia: "email",
    spendDaily: 0, spendWeekly: 0, spendMonthly: 219900, spendYearly: 660000,
  },
  {
    id: "c3", name: "Ayesha Khan", email: "ayesha.khan@example.com",
    orders: 5, lifetimeValue: 2410000, joined: "2025-08-27", joinVia: "facebook",
    spendDaily: 0, spendWeekly: 529900, spendMonthly: 529900, spendYearly: 2410000,
  },
  {
    id: "c4", name: "Rohan Desai", email: "rohan.desai@example.com",
    orders: 12, lifetimeValue: 7120000, joined: "2025-05-19", joinVia: "google",
    spendDaily: 449900, spendWeekly: 899800, spendMonthly: 1799700, spendYearly: 7120000,
  },
  {
    id: "c5", name: "Priya Nair", email: "priya.nair@example.com",
    orders: 1, lifetimeValue: 420000, joined: "2026-06-30", joinVia: "apple",
    spendDaily: 0, spendWeekly: 0, spendMonthly: 0, spendYearly: 420000,
  },
  {
    id: "c6", name: "Arjun Rao", email: "arjun.rao@example.com",
    orders: 4, lifetimeValue: 1980000, joined: "2025-12-11", joinVia: "phone",
    spendDaily: 0, spendWeekly: 379900, spendMonthly: 699800, spendYearly: 1980000,
  },
];
