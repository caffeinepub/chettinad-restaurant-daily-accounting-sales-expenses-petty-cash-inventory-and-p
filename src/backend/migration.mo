import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  type ExpenseType = {
    #fixed;
    #variable;
  };

  type OldExpenseCategory = {
    #foodCost;
    #supplies;
    #maintenance;
    #utilities;
    #rent;
    #payroll;
    #marketing;
    #other;
  };

  type OldPaymentMethod = {
    #cash;
    #bank;
    #creditCard;
    #other;
  };

  type OldExpenseEntry = {
    id : Nat;
    date : Nat;
    category : OldExpenseCategory;
    amount : Float;
    paymentMethod : OldPaymentMethod;
    notes : ?Text;
    createdAt : Int;
    updatedAt : Int;
  };

  type OldActor = {
    expensesMap : Map.Map<Nat, OldExpenseEntry>;
  };

  type NewActor = {
    expensesMap : Map.Map<Nat, NewExpenseEntry>;
  };

  type NewExpenseEntry = {
    id : Nat;
    date : Nat; // YYYYMMDD format
    category : OldExpenseCategory;
    expenseType : ExpenseType;
    amount : Float;
    paymentMethod : OldPaymentMethod;
    notes : ?Text;
    createdAt : Int;
    updatedAt : Int;
  };

  public func run(old : OldActor) : NewActor {
    let newExpenseMap = old.expensesMap.map<Nat, OldExpenseEntry, NewExpenseEntry>(
      func(_id, oldExpense) {
        {
          oldExpense with
          expenseType = determineExpenseType(oldExpense.category);
        };
      }
    );
    { expensesMap = newExpenseMap };
  };

  // Helper function to determine expense type based on category
  func determineExpenseType(category : OldExpenseCategory) : ExpenseType {
    switch (category) {
      case (#foodCost) { #variable };
      case (#supplies) { #variable };
      case (#maintenance) { #variable };
      case (#utilities) { #fixed };
      case (#rent) { #fixed };
      case (#payroll) { #fixed };
      case (#marketing) { #variable };
      case (#other) { #variable };
    };
  };
};
