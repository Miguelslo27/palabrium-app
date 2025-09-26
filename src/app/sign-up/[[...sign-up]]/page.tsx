"use client";

import CustomSignUp from '@/components/CustomSignUp';
import { useState } from 'react';

export default function Page() {
  const [debug, setDebug] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  return (
    <div className="h-screen flex">
      <div className="flex-1 bg-blue-600"></div>
      <div className="flex-1 h-full">
        <CustomSignUp />
      </div>
    </div>
  );
}