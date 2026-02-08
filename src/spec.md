# Specification

## Summary
**Goal:** Add a Fixed vs Variable classification to expense entries, enabling entry/editing, filtering, and reporting totals by classification.

**Planned changes:**
- Extend the ExpenseEntry backend data model and API to include an expense classification field with exactly two values: Fixed and Variable, including a safe default for existing legacy entries.
- Update the Add/Edit Expense UI to require selecting Fixed or Variable, persist it, and display the classification in the expenses list.
- Add an Expenses page filter control to view All, Fixed-only, or Variable-only expenses, and ensure Clear Filters resets it to All.
- Update Profit & Loss reporting to calculate and display totals for Fixed expenses and Variable expenses (in addition to total expenses) for the selected date range, while keeping existing category breakdown working.

**User-visible outcome:** Users can classify each expense as Fixed or Variable, filter the expenses list by that classification, and see Fixed vs Variable expense totals in Profit & Loss reports.
