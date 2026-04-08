'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1


import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[400px] p-8">
          <Card className="p-8 text-center max-w-md">
            <h2 className="text-xl font-semibold mb-2">Bir hata oluştu</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {this.state.error?.message ?? 'Beklenmeyen bir hata meydana geldi.'}
            </p>
            <Button
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Tekrar Dene
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
