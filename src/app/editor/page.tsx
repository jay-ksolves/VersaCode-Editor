
'use client';

import { IdeLayout } from '@/components/versacode/ide-layout';

interface EditorPageProps {
  theme: string;
  setTheme: (theme: string) => void;
}

export default function EditorPage({ theme, setTheme }: EditorPageProps) {
  return <IdeLayout theme={theme} setTheme={setTheme} />;
}

    