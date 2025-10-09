import React from 'react';

type Props = {
  title: string;
  children?: React.ReactNode;
};

export default function PageHeader({ title, children }: Props) {
  return (
    <div className="p-6 bg-gray-200/70 flex items-center justify-between">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      <div className="flex items-center gap-3">{children}</div>
    </div>
  );
}
