import { NextRequest, NextResponse } from 'next/server';
import { generateInsights, type FinancialContext } from '@/lib/ai/insights';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const context: FinancialContext = {
      totalIncome: body.totalIncome,
      totalExpenses: body.totalExpenses,
      savingsRate: body.savingsRate,
      monthlyBudget: body.monthlyBudget,
      currentSpending: body.currentSpending,
      topCategories: body.topCategories,
    };

    const insights = generateInsights(context);

    return NextResponse.json({ insights }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
