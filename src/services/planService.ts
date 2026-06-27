import plansData from '@/data/plans.json'
import type { Plan } from '@/domain/plan/types'

export const planService = {
  getAll: (): Plan[] => plansData as Plan[],
}
