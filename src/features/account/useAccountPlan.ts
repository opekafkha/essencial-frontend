export interface AccountPlan {
  id: string
  name: string
  preview: boolean
}

// Temporary display data. Replace this source with the purchase hook result later.
// A displayed plan never grants permissions or changes the authenticated role.
const PREVIEW_PLAN: AccountPlan = { id: 'preview-esencial', name: 'Plan Esencial', preview: true }

export function useAccountPlan(): AccountPlan {
  return PREVIEW_PLAN
}
