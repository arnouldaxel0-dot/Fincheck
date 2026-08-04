export type AssetCategory = 'bank_account'|'savings'|'stocks'|'crypto'|'real_estate'|'bonds'
export type LiabilityCategory = 'mortgage'|'consumer_loan'|'auto_loan'|'student_loan'|'other_loan'

export interface User { id: number; username: string; email?: string; created_at: string }
export interface Asset { id: number; name: string; category: AssetCategory; value: number; currency: string; institution?: string; description?: string; isin?: string; quantity?: number; purchase_price?: number; is_manual: boolean; last_sync?: string; created_at: string; updated_at: string }
export interface Liability { id: number; name: string; category: LiabilityCategory; initial_amount: number; remaining_amount: number; monthly_payment?: number; interest_rate?: number; start_date?: string; end_date?: string; institution?: string; description?: string; created_at: string; updated_at: string }
export interface CategorySummary { category: string; label: string; total: number; percentage: number; count: number }
export interface DashboardSummary { total_assets: number; total_liabilities: number; net_worth: number; assets_by_category: CategorySummary[]; monthly_payments: number }
export interface NetWorthPoint { date: string; total_assets: number; total_liabilities: number; net_worth: number }
export interface Connector { id: number; provider: string; display_name?: string; is_active: boolean; last_sync?: string; created_at: string }

export const ASSET_LABELS: Record<AssetCategory, string> = { bank_account: 'Compte bancaire', savings: 'Épargne', stocks: 'Actions / ETF', crypto: 'Crypto-monnaies', real_estate: 'Immobilier', bonds: 'Obligations' }
export const LIABILITY_LABELS: Record<LiabilityCategory, string> = { mortgage: 'Crédit immobilier', consumer_loan: 'Crédit consommation', auto_loan: 'Crédit auto', student_loan: 'Crédit étudiant', other_loan: 'Autre crédit' }
export const ASSET_COLORS: Record<AssetCategory, string> = { bank_account: '#3B82F6', savings: '#10B981', stocks: '#7C6FF7', crypto: '#F59E0B', real_estate: '#EC4899', bonds: '#14B8A6' }
