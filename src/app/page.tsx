'use client';

import { ENTRY_CONFIG } from '@/lib/config';
import EntryFormPage from '@/components/EntryFormPage';
import LeaderboardPage from './leaderboard/page';

export default function Home() {
  const now = new Date();
  const submissionsClosed = now >= ENTRY_CONFIG.submissionDeadline;

  if (submissionsClosed) {
    return <LeaderboardPage hideBackLink />;
  }

  return <EntryFormPage />;
}
