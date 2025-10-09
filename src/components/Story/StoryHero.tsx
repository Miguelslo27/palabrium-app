"use client";
import Hero from '@/components/Common/Hero';
import StoryProgressBar from '@/components/Story/StoryProgressBar';

type Props = {
  initialTitle?: string;
  actions?: React.ReactNode;
};

export default function StoryHero({ initialTitle, actions }: Props) {
  return (
    <Hero className="w-full mb-6 !p-0">
      <div className="p-6 bg-gradient-to-r from-blue-50 to-white border-b border-blue-100 rounded-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{initialTitle}</h2>
          {actions && (
            <div className="ml-4">
              {actions}
            </div>
          )}
        </div>
      </div>
      <StoryProgressBar />
    </Hero>
  );
}
