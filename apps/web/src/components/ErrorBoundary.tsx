'use client';

import { Box, Button, Typography } from '@mui/material';
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          py={8}
          px={3}
          textAlign="center"
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1D1D1F', mb: 1 }}>
            משהו השתבש
          </Typography>
          <Typography variant="body2" sx={{ color: '#86868B', mb: 1 }}>
            Something went wrong
          </Typography>
          <Typography variant="caption" sx={{ color: '#86868B', mb: 3, maxWidth: 400 }}>
            {this.state.error?.message}
          </Typography>
          <Button variant="outlined" onClick={this.handleRetry}>
            נסה שוב
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}
