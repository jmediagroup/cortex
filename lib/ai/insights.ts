/**
 * AI Insights Engine
 *
 * Generates financial insights based on user data. Currently uses
 * rule-based templates. Can be extended to call Claude API or
 * other LLM providers for dynamic natural language generation.
 */

export interface FinancialContext {
  totalIncome?: number;
  totalExpenses?: number;
  savingsRate?: number;
  monthlyBudget?: number;
  currentSpending?: number;
  topCategories?: { name: string; amount: number; change: number }[];
}

export interface AIInsight {
  id: string;
  type: 'spending_analysis' | 'budget_prediction' | 'anomaly' | 'savings_tip' | 'general';
  message: string;
  severity: 'info' | 'warning' | 'positive';
  actions: { label: string; actionType: string }[];
}

/**
 * Generate insights from financial context data.
 * In production, this would call the Claude API with the user's
 * financial data to generate personalized natural language insights.
 */
export function generateInsights(context: FinancialContext): AIInsight[] {
  const insights: AIInsight[] = [];

  // Spending analysis insight
  if (context.totalExpenses !== undefined && context.totalIncome !== undefined) {
    const ratio = context.totalExpenses / context.totalIncome;
    if (ratio < 0.7) {
      insights.push({
        id: 'spending-healthy',
        type: 'spending_analysis',
        message: `AI analyzed your last 30 days \u2014 expenses are ${Math.round((1 - ratio) * 100)}% below income. Your spending discipline is strong.`,
        severity: 'positive',
        actions: [
          { label: 'View Report', actionType: 'view_report' },
          { label: 'Predict Next Month', actionType: 'predict' },
        ],
      });
    } else if (ratio > 0.9) {
      insights.push({
        id: 'spending-high',
        type: 'spending_analysis',
        message: `AI detected your expenses are ${Math.round(ratio * 100)}% of income this month. Consider reducing discretionary spending to improve your savings rate.`,
        severity: 'warning',
        actions: [
          { label: 'View Breakdown', actionType: 'view_breakdown' },
          { label: 'Set Budget', actionType: 'set_budget' },
        ],
      });
    }
  }

  // Budget prediction insight
  if (context.monthlyBudget && context.currentSpending) {
    const daysInMonth = 30;
    const today = new Date().getDate();
    const dailyRate = context.currentSpending / today;
    const projectedTotal = dailyRate * daysInMonth;

    if (projectedTotal > context.monthlyBudget) {
      const exceedDate = Math.ceil(context.monthlyBudget / dailyRate);
      insights.push({
        id: 'budget-exceed',
        type: 'budget_prediction',
        message: `AI predicts you\u2019ll exceed your monthly budget by day ${exceedDate} if spending continues at $${Math.round(dailyRate).toLocaleString()}/day.`,
        severity: 'warning',
        actions: [
          { label: 'Adjust Limit', actionType: 'adjust_limit' },
          { label: 'Ignore', actionType: 'dismiss' },
        ],
      });
    }
  }

  // Savings rate insight
  if (context.savingsRate !== undefined) {
    if (context.savingsRate >= 20) {
      insights.push({
        id: 'savings-excellent',
        type: 'savings_tip',
        message: `Your ${context.savingsRate}% savings rate exceeds the recommended 20% target. At this pace, consider allocating the surplus to investment accounts for compound growth.`,
        severity: 'positive',
        actions: [
          { label: 'View Options', actionType: 'investment_options' },
        ],
      });
    } else if (context.savingsRate < 10) {
      insights.push({
        id: 'savings-low',
        type: 'savings_tip',
        message: `Your savings rate is ${context.savingsRate}%, below the recommended 20%. Small changes \u2014 like reducing your top spending category by 15% \u2014 could double your savings.`,
        severity: 'warning',
        actions: [
          { label: 'See Suggestions', actionType: 'suggestions' },
        ],
      });
    }
  }

  // Category anomaly detection
  if (context.topCategories?.length) {
    const anomaly = context.topCategories.find((c) => Math.abs(c.change) > 25);
    if (anomaly) {
      const direction = anomaly.change > 0 ? 'increase' : 'decrease';
      insights.push({
        id: `anomaly-${anomaly.name.toLowerCase().replace(/\s/g, '-')}`,
        type: 'anomaly',
        message: `AI detected an unusual ${Math.abs(anomaly.change)}% ${direction} in ${anomaly.name} spending ($${anomaly.amount.toLocaleString()}) compared to your 3-month average.`,
        severity: anomaly.change > 0 ? 'warning' : 'positive',
        actions: [
          { label: 'View Transactions', actionType: 'view_transactions' },
          { label: 'Dismiss', actionType: 'dismiss' },
        ],
      });
    }
  }

  // Always provide at least one general insight
  if (insights.length === 0) {
    insights.push({
      id: 'general-tip',
      type: 'general',
      message: 'AI analyzed your financial data. Everything looks on track. Use the Generate button below for a detailed report.',
      severity: 'info',
      actions: [
        { label: 'View Details', actionType: 'view_details' },
      ],
    });
  }

  return insights;
}
