export interface InventoryRow {
  sku: string;
  name: string;
  warehouse: string;
  onHand: number;
  reserved: number;
  reorderPoint: number;
}

export const INVENTORY: InventoryRow[] = [
  { sku: "AGT-OVS-001", name: "Field Overshirt", warehouse: "Mumbai — Main", onHand: 34, reserved: 3, reorderPoint: 15 },
  { sku: "AGT-SHT-014", name: "Washed Linen Shirt", warehouse: "Mumbai — Main", onHand: 61, reserved: 5, reorderPoint: 20 },
  { sku: "AGT-DNM-002", name: "Selvedge Denim", warehouse: "Mumbai — Main", onHand: 12, reserved: 4, reorderPoint: 15 },
  { sku: "AGT-KNT-007", name: "Wool Crew Sweater", warehouse: "Delhi — Overflow", onHand: 4, reserved: 1, reorderPoint: 10 },
  { sku: "AGT-ACC-021", name: "Waxed Canvas Tote", warehouse: "Mumbai — Main", onHand: 0, reserved: 0, reorderPoint: 10 },
  { sku: "AGT-TRS-009", name: "Raw Hem Trouser", warehouse: "Delhi — Overflow", onHand: 22, reserved: 2, reorderPoint: 15 },
];
