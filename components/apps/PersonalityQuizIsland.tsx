'use client';

import dynamic from 'next/dynamic';

/**
 * Browser-only quiz, so /apps/personality-quiz/page.tsx can stay a server
 * component and render its explainer and FAQ as static HTML.
 */
const PersonalityQuizIsland = dynamic(() => import('@/components/apps/PersonalityQuiz'), {
  ssr: false,
});

export default PersonalityQuizIsland;
