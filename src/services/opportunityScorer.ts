import { OpportunityLevel } from '@/lib/types';

interface ScoredOpportunity {
  opportunity: OpportunityLevel;
  opportunityScore: number;
  percentageVsAverage: number;
}

export function scoreOpportunity(price: number, averagePrice: number): ScoredOpportunity {
  if (averagePrice <= 0) {
    return { opportunity: 'normal', opportunityScore: 50, percentageVsAverage: 0 };
  }

  const percentageDiff = ((price - averagePrice) / averagePrice) * 100;
  const percentageVsAverage = Math.round(percentageDiff);

  let opportunity: OpportunityLevel;
  let opportunityScore: number;

  if (percentageDiff <= -30) {
    opportunity = 'excellent';
    opportunityScore = 90 + Math.min(10, Math.abs(percentageDiff) - 30);
  } else if (percentageDiff <= -15) {
    opportunity = 'good';
    opportunityScore = 70 + Math.round(((Math.abs(percentageDiff) - 15) / 15) * 20);
  } else if (percentageDiff <= 10) {
    opportunity = 'normal';
    opportunityScore = 40 + Math.round(((10 - percentageDiff) / 25) * 30);
  } else {
    opportunity = 'expensive';
    opportunityScore = Math.max(0, 40 - Math.round((percentageDiff - 10) * 2));
  }

  return { opportunity, opportunityScore: Math.min(100, Math.max(0, opportunityScore)), percentageVsAverage };
}
