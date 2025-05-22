-- Drop triggers first
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
DROP TRIGGER IF EXISTS update_budget_categories_updated_at ON budget_categories;
DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;

-- Drop indexes
DROP INDEX IF EXISTS idx_transactions_date;
DROP INDEX IF EXISTS idx_transactions_category_id;
DROP INDEX IF EXISTS idx_transactions_account_id;
DROP INDEX IF EXISTS idx_transactions_user_id;
DROP INDEX IF EXISTS idx_budget_categories_user_id;
DROP INDEX IF EXISTS idx_accounts_user_id;

-- Drop tables (in correct order due to foreign key constraints)
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS budget_categories;
DROP TABLE IF EXISTS accounts;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Disable RLS (optional, as tables will be dropped anyway)
ALTER TABLE IF EXISTS accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS budget_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS transactions DISABLE ROW LEVEL SECURITY;

-- Drop policies (optional, as tables will be dropped anyway)
DROP POLICY IF EXISTS "Users can only see their own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can only see their own budget categories" ON budget_categories;
DROP POLICY IF EXISTS "Users can only see their own transactions" ON transactions; 