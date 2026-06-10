import { Compass, Users } from 'lucide-react';
import { UI_CONTENT } from '../lib/content';

export function ChatIntro() {
  const { title, description, features } = UI_CONTENT.chatIntro;
  return (
    <div className="border-b border-[--color-border]/60 bg-gradient-to-b from-brand-50/40 to-transparent">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-brand-900">
          {title}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-foreground/70 leading-relaxed">
          {description}
        </p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2.5 text-foreground/70">
            <Compass className="h-4 w-4 mt-0.5 shrink-0 text-brand-700" />
            <span>{features[0]}</span>
          </div>
          <div className="flex items-start gap-2.5 text-foreground/70">
            <Users className="h-4 w-4 mt-0.5 shrink-0 text-brand-700" />
            <span>{features[1]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
