
'use client';

import { IdeLayout } from '@/components/versacode/ide-layout';

interface EditorPageProps {
  theme: string;
  setTheme: (theme: string) => void;
}

// This component is now primarily handled by the InfoLayout component,
// which will render the IdeLayout with the correct props.
export default function EditorPage({ theme, setTheme }: EditorPageProps) {
  return <IdeLayout theme={theme} setTheme={setTheme} />;
}
