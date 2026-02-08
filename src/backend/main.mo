import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Types
  type ExpenseCategory = {
    #foodCost; // groceries, etc.
    #supplies; // cleaning, paper goods, etc.
    #maintenance;
    #utilities; // electricity, water, etc.
    #rent;
    #payroll;
    #marketing;
    #other;
  };

  type PaymentMethod = {
    #cash;
    #bank;
    #creditCard;
    #other;
  };

  type ExpenseType = {
    #fixed;
    #variable;
  };

  // Sales
  type SalesEntry = {
    id : Nat;
    date : Nat; // YYYYMMDD format
    amount : Float;
    notes : ?Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  // Expenses
  type ExpenseEntry = {
    id : Nat;
    date : Nat; // YYYYMMDD format
    category : ExpenseCategory;
    expenseType : ExpenseType;
    amount : Float;
    paymentMethod : PaymentMethod;
    notes : ?Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  // Petty Cash
  type PettyCashTransaction = {
    id : Nat;
    dateTime : Time.Time;
    transactionType : {
      #cashIn;
      #out;
    };
    amount : Float;
    reason : Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  // Inventory
  type InventoryItem = {
    id : Nat;
    name : Text;
    unit : Text;
    lowStockThreshold : ?Float;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  type StockMovement = {
    id : Nat;
    itemId : Nat;
    dateTime : Time.Time;
    movementType : {
      #stockIn;
      #out;
      #adjustment;
    };
    quantity : Float;
    notes : ?Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  // Internal storage
  let salesMap = Map.empty<Nat, SalesEntry>();
  var nextSalesId = 1;

  let expensesMap = Map.empty<Nat, ExpenseEntry>();
  var nextExpenseId = 1;

  let pettyCashMap = Map.empty<Nat, PettyCashTransaction>();
  var nextPettyCashId = 1;

  let inventoryMap = Map.empty<Nat, InventoryItem>();
  var nextInventoryId = 1;

  let stockMovementsMap = Map.empty<Nat, StockMovement>();
  var nextStockMovementId = 1;

  module ExpenseCategory {
    public func compare(a : ExpenseCategory, b : ExpenseCategory) : Order.Order {
      switch (a, b) {
        case (#foodCost, #foodCost) { #equal };
        case (#foodCost, _) { #less };
        case (_, #foodCost) { #greater };
        case (#supplies, #supplies) { #equal };
        case (#supplies, _) { #less };
        case (_, #supplies) { #greater };
        case (#maintenance, #maintenance) { #equal };
        case (#maintenance, _) { #less };
        case (_, #maintenance) { #greater };
        case (#utilities, #utilities) { #equal };
        case (#utilities, _) { #less };
        case (_, #utilities) { #greater };
        case (#rent, #rent) { #equal };
        case (#rent, _) { #less };
        case (_, #rent) { #greater };
        case (#payroll, #payroll) { #equal };
        case (#payroll, _) { #less };
        case (_, #payroll) { #greater };
        case (#marketing, #marketing) { #equal };
        case (#marketing, _) { #less };
        case (_, #marketing) { #greater };
        case (#other, #other) { #equal };
      };
    };
  };

  module SalesEntry {
    public func compare(a : SalesEntry, b : SalesEntry) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module ExpenseEntry {
    public func compare(a : ExpenseEntry, b : ExpenseEntry) : Order.Order {
      Nat.compare(a.id, b.id);
    };

    public func compareByCategory(a : ExpenseEntry, b : ExpenseEntry) : Order.Order {
      switch (ExpenseCategory.compare(a.category, b.category)) {
        case (#equal) { Nat.compare(a.id, b.id) };
        case (order) { order };
      };
    };
  };

  module PettyCashTransaction {
    public func compare(a : PettyCashTransaction, b : PettyCashTransaction) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module InventoryItem {
    public func compare(a : InventoryItem, b : InventoryItem) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module StockMovement {
    public func compare(a : StockMovement, b : StockMovement) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  // Sales CRUD
  public shared ({ caller }) func createSalesEntry(date : Nat, amount : Float, notes : ?Text) : async SalesEntry {
    let now = Time.now();
    let salesEntry : SalesEntry = {
      id = nextSalesId;
      date;
      amount;
      notes;
      createdAt = now;
      updatedAt = now;
    };
    salesMap.add(nextSalesId, salesEntry);
    nextSalesId += 1;
    salesEntry;
  };

  public query ({ caller }) func getSalesEntry(id : Nat) : async SalesEntry {
    switch (salesMap.get(id)) {
      case (null) { Runtime.trap("Sales entry not found") };
      case (?entry) { entry };
    };
  };

  public shared ({ caller }) func updateSalesEntry(id : Nat, date : Nat, amount : Float, notes : ?Text) : async SalesEntry {
    switch (salesMap.get(id)) {
      case (null) { Runtime.trap("Sales entry not found") };
      case (?existing) {
        let updated : SalesEntry = {
          id = existing.id;
          date;
          amount;
          notes;
          createdAt = existing.createdAt;
          updatedAt = Time.now();
        };
        salesMap.add(id, updated);
        updated;
      };
    };
  };

  public shared ({ caller }) func deleteSalesEntry(id : Nat) : async () {
    if (not salesMap.containsKey(id)) {
      Runtime.trap("Sales entry not found");
    };
    salesMap.remove(id);
  };

  public query ({ caller }) func getAllSalesEntries() : async [SalesEntry] {
    salesMap.values().toArray().sort();
  };

  // Expenses CRUD
  public shared ({ caller }) func createExpenseEntry(
    date : Nat,
    category : ExpenseCategory,
    expenseType : ExpenseType,
    amount : Float,
    paymentMethod : PaymentMethod,
    notes : ?Text,
  ) : async ExpenseEntry {
    let now = Time.now();
    let expenseEntry : ExpenseEntry = {
      id = nextExpenseId;
      date;
      category;
      expenseType;
      amount;
      paymentMethod;
      notes;
      createdAt = now;
      updatedAt = now;
    };
    expensesMap.add(nextExpenseId, expenseEntry);
    nextExpenseId += 1;
    expenseEntry;
  };

  public query ({ caller }) func getExpenseEntry(id : Nat) : async ExpenseEntry {
    switch (expensesMap.get(id)) {
      case (null) { Runtime.trap("Expense entry not found") };
      case (?entry) { entry };
    };
  };

  public shared ({ caller }) func updateExpenseEntry(
    id : Nat,
    date : Nat,
    category : ExpenseCategory,
    expenseType : ExpenseType,
    amount : Float,
    paymentMethod : PaymentMethod,
    notes : ?Text,
  ) : async ExpenseEntry {
    switch (expensesMap.get(id)) {
      case (null) { Runtime.trap("Expense entry not found") };
      case (?existing) {
        let updated : ExpenseEntry = {
          id = existing.id;
          date;
          category;
          expenseType;
          amount;
          paymentMethod;
          notes;
          createdAt = existing.createdAt;
          updatedAt = Time.now();
        };
        expensesMap.add(id, updated);
        updated;
      };
    };
  };

  public shared ({ caller }) func deleteExpenseEntry(id : Nat) : async () {
    if (not expensesMap.containsKey(id)) {
      Runtime.trap("Expense entry not found");
    };
    expensesMap.remove(id);
  };

  public query ({ caller }) func getAllExpenseEntries() : async [ExpenseEntry] {
    expensesMap.values().toArray().sort();
  };

  // Petty Cash
  public shared ({ caller }) func addPettyCashTransaction(
    transactionType : { #cashIn; #out },
    amount : Float,
    reason : Text,
  ) : async PettyCashTransaction {
    let now = Time.now();
    let transaction : PettyCashTransaction = {
      id = nextPettyCashId;
      dateTime = now;
      transactionType;
      amount;
      reason;
      createdAt = now;
      updatedAt = now;
    };
    pettyCashMap.add(nextPettyCashId, transaction);
    nextPettyCashId += 1;
    transaction;
  };

  public query ({ caller }) func getAllPettyCashTransactions() : async [PettyCashTransaction] {
    pettyCashMap.values().toArray().sort();
  };

  // Inventory
  public shared ({ caller }) func addInventoryItem(
    name : Text,
    unit : Text,
    lowStockThreshold : ?Float,
  ) : async InventoryItem {
    let now = Time.now();
    let item : InventoryItem = {
      id = nextInventoryId;
      name;
      unit;
      lowStockThreshold;
      createdAt = now;
      updatedAt = now;
    };
    inventoryMap.add(nextInventoryId, item);
    nextInventoryId += 1;
    item;
  };

  public query ({ caller }) func getAllInventoryItems() : async [InventoryItem] {
    inventoryMap.values().toArray().sort();
  };

  public shared ({ caller }) func addStockMovement(
    itemId : Nat,
    movementType : { #stockIn; #out; #adjustment },
    quantity : Float,
    notes : ?Text,
  ) : async StockMovement {
    let now = Time.now();
    if (not inventoryMap.containsKey(itemId)) {
      Runtime.trap("Item not found");
    };
    let movement : StockMovement = {
      id = nextStockMovementId;
      itemId;
      dateTime = now;
      movementType;
      quantity;
      notes;
      createdAt = now;
      updatedAt = now;
    };
    stockMovementsMap.add(nextStockMovementId, movement);
    nextStockMovementId += 1;
    movement;
  };

  public query ({ caller }) func getAllStockMovements() : async [StockMovement] {
    stockMovementsMap.values().toArray().sort();
  };

  // Reporting - (Stub: To be implemented)
  public query ({ caller }) func getProfitAndLoss(_startDate : Nat, _endDate : Nat) : async {
    totalSales : Float;
    totalExpenses : Float;
    netProfitLoss : Float;
    // categoryBreakdown : [(ExpenseCategory, Float)]
  } {
    // Filtering can be done client-side using getAllSalesEntries and getAllExpenseEntries
    { totalSales = 0.0; totalExpenses = 0.0; netProfitLoss = 0.0 };
  };
};
