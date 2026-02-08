import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface InventoryItem {
    id: bigint;
    lowStockThreshold?: number;
    name: string;
    createdAt: Time;
    unit: string;
    updatedAt: Time;
}
export interface SalesEntry {
    id: bigint;
    date: bigint;
    createdAt: Time;
    updatedAt: Time;
    notes?: string;
    amount: number;
}
export type Time = bigint;
export interface PettyCashTransaction {
    id: bigint;
    transactionType: Variant_out_cashIn;
    createdAt: Time;
    updatedAt: Time;
    amount: number;
    dateTime: Time;
    reason: string;
}
export interface ExpenseEntry {
    id: bigint;
    expenseType: ExpenseType;
    paymentMethod: PaymentMethod;
    date: bigint;
    createdAt: Time;
    updatedAt: Time;
    notes?: string;
    category: ExpenseCategory;
    amount: number;
}
export interface StockMovement {
    id: bigint;
    itemId: bigint;
    createdAt: Time;
    movementType: Variant_out_adjustment_stockIn;
    updatedAt: Time;
    notes?: string;
    quantity: number;
    dateTime: Time;
}
export enum ExpenseCategory {
    other = "other",
    marketing = "marketing",
    supplies = "supplies",
    rent = "rent",
    utilities = "utilities",
    maintenance = "maintenance",
    payroll = "payroll",
    foodCost = "foodCost"
}
export enum ExpenseType {
    fixed = "fixed",
    variable = "variable"
}
export enum PaymentMethod {
    creditCard = "creditCard",
    other = "other",
    bank = "bank",
    cash = "cash"
}
export enum Variant_out_adjustment_stockIn {
    out = "out",
    adjustment = "adjustment",
    stockIn = "stockIn"
}
export enum Variant_out_cashIn {
    out = "out",
    cashIn = "cashIn"
}
export interface backendInterface {
    addInventoryItem(name: string, unit: string, lowStockThreshold: number | null): Promise<InventoryItem>;
    addPettyCashTransaction(transactionType: Variant_out_cashIn, amount: number, reason: string): Promise<PettyCashTransaction>;
    addStockMovement(itemId: bigint, movementType: Variant_out_adjustment_stockIn, quantity: number, notes: string | null): Promise<StockMovement>;
    createExpenseEntry(date: bigint, category: ExpenseCategory, expenseType: ExpenseType, amount: number, paymentMethod: PaymentMethod, notes: string | null): Promise<ExpenseEntry>;
    createSalesEntry(date: bigint, amount: number, notes: string | null): Promise<SalesEntry>;
    deleteExpenseEntry(id: bigint): Promise<void>;
    deleteSalesEntry(id: bigint): Promise<void>;
    getAllExpenseEntries(): Promise<Array<ExpenseEntry>>;
    getAllInventoryItems(): Promise<Array<InventoryItem>>;
    getAllPettyCashTransactions(): Promise<Array<PettyCashTransaction>>;
    getAllSalesEntries(): Promise<Array<SalesEntry>>;
    getAllStockMovements(): Promise<Array<StockMovement>>;
    getExpenseEntry(id: bigint): Promise<ExpenseEntry>;
    getProfitAndLoss(_startDate: bigint, _endDate: bigint): Promise<{
        totalExpenses: number;
        totalSales: number;
        netProfitLoss: number;
    }>;
    getSalesEntry(id: bigint): Promise<SalesEntry>;
    updateExpenseEntry(id: bigint, date: bigint, category: ExpenseCategory, expenseType: ExpenseType, amount: number, paymentMethod: PaymentMethod, notes: string | null): Promise<ExpenseEntry>;
    updateSalesEntry(id: bigint, date: bigint, amount: number, notes: string | null): Promise<SalesEntry>;
}
