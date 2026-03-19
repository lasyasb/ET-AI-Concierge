import { UserProfile } from "../services/gemini";

export function calculateFinancialScore(profile: UserProfile): number {
  let score = 50; // Base score

  // Income Stability (based on income range)
  if (profile.incomeRange?.includes("10L+")) score += 15;
  else if (profile.incomeRange?.includes("5L-10L")) score += 10;
  else if (profile.incomeRange?.includes("2L-5L")) score += 5;

  // Savings Consistency (based on SIP plans)
  if (profile.savedSIPPlans && profile.savedSIPPlans.length > 0) {
    score += Math.min(profile.savedSIPPlans.length * 5, 15);
  }

  // Investment Diversification (based on portfolio results)
  if (profile.portfolioResults && profile.portfolioResults.length > 0) {
    score += 10;
  }

  // Risk Profile (Medium is often considered balanced)
  if (profile.riskLevel === "Medium") score += 10;
  else if (profile.riskLevel === "Low" || profile.riskLevel === "High") score += 5;

  // Loan Dependence (Penalty for multiple loan checks, though this is a proxy)
  if (profile.loanChecks && profile.loanChecks.length > 0) {
    score -= Math.min(profile.loanChecks.length * 2, 10);
  }

  return Math.max(0, Math.min(100, score));
}

export function getScoreCategory(score: number): string {
  if (score >= 90) return "Financial Pro";
  if (score >= 70) return "Wealth Builder";
  if (score >= 40) return "Growing Investor";
  return "Beginner Saver";
}

export function getScoreInsight(score: number): string {
  if (score >= 90) return "You're in excellent financial shape! Keep diversifying and optimizing for tax.";
  if (score >= 70) return "Great progress. Consider increasing your SIP amounts to reach your goals faster.";
  if (score >= 40) return "You're on the right track. Focus on building a consistent emergency fund.";
  return "Start by setting up a small monthly SIP to build the habit of regular saving.";
}
