'use client';

import React, { Suspense } from 'react';
import Layout from '@/components/Layout';
import TrialSetup from '@/components/TrialSetup';
import { AccountContent, AccountLoading } from '@/components/account';

export default function AccountPage() {
  return (
    <Layout>
      <TrialSetup />
      <Suspense fallback={<AccountLoading />}>
        <AccountContent />
      </Suspense>
    </Layout>
  );
} 