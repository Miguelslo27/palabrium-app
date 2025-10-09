import React from 'react';
import PageHeader from '@/components/Common/PageHeader';

type Props = {
  title?: string;
  headerActions?: React.ReactNode;
  sidebar?: React.ReactNode;
  hero?: React.ReactNode;
  children?: React.ReactNode;
  mainClass?: string;
  className?: string;
};

export default function StoriesShell({
  title,
  headerActions,
  sidebar,
  hero,
  children,
  mainClass = 'flex-1 p-6 overflow-y-auto',
  className = '',
}: Props) {
  return (
    <div className={`flex-1 flex flex-col overflow-hidden ${className}`}>
      {title && (
        <PageHeader title={title}>
          {headerActions}
        </PageHeader>
      )}

      <div className="flex flex-1 min-h-0">
        {sidebar}

        <main className={mainClass}>
          {hero}
          {children}
          {/* spacer so bottom padding is visible when main is the scroll container */}
          <div className="h-0" aria-hidden="true" />
        </main>
      </div>
    </div>
  );
}
