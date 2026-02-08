'use client';

import { useState } from 'react';
import AIInsightCard from './AIInsightCard';
import GenerateWithAI from './GenerateWithAI';

interface Insight {
  id: string;
  message: string;
  actions?: { label: string; onClick?: () => void }[];
}

// Pre-built insights for demo. In production these would come from the API.
const defaultInsights: Insight[] = [
  {
    id: 'spending-analysis',
    message:
      'AI analyzed your last 30 days \u2014 expenses dropped by 12%, income steady. Want a full report?',
    actions: [
      { label: 'View Report' },
      { label: 'Predict Next Month' },
    ],
  },
  {
    id: 'budget-prediction',
    message:
      'AI predicts you\u2019ll exceed your monthly budget by Sept 25 if spending continues at the current rate.',
    actions: [
      { label: 'Adjust Limit' },
      { label: 'Ignore' },
    ],
  },
];

interface AIInsightsPanelProps {
  insights?: Insight[];
  className?: string;
}

export default function AIInsightsPanel({
  insights = defaultInsights,
  className = '',
}: AIInsightsPanelProps) {
  const [visibleInsights, setVisibleInsights] = useState(insights);
  const [generating, setGenerating] = useState(false);

  const handleDismiss = (id: string) => {
    setVisibleInsights((prev) => prev.filter((i) => i.id !== id));
  };

  const handleGenerate = async () => {
    setGenerating(true);
    // Simulate AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newInsight: Insight = {
      id: `ai-${Date.now()}`,
      message:
        'Your savings rate has increased 8% month-over-month. At this pace, you\u2019ll reach your $20,000 goal by June. Consider increasing your investment allocation to maximize compound growth.',
      actions: [
        { label: 'View Details' },
        { label: 'Set Reminder' },
      ],
    };

    setVisibleInsights((prev) => [newInsight, ...prev]);
    setGenerating(false);
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Insight cards */}
      {visibleInsights.map((insight) => (
        <AIInsightCard
          key={insight.id}
          message={insight.message}
          actions={insight.actions}
          onDismiss={() => handleDismiss(insight.id)}
        />
      ))}

      {/* Generate button */}
      <div className="flex justify-center">
        <GenerateWithAI
          onClick={handleGenerate}
          size="md"
        />
      </div>
    </div>
  );
}
