"use client";

import Link from "next/link";
import { Component, type ErrorInfo, type ReactNode } from "react";

import * as Sentry from "@sentry/nextjs";

type RoadmapGraphErrorBoundaryProps = {
  children: ReactNode;
  majorHref?: string;
  majorName?: string;
};

type RoadmapGraphErrorBoundaryState = {
  hasError: boolean;
};

export class RoadmapGraphErrorBoundary extends Component<
  RoadmapGraphErrorBoundaryProps,
  RoadmapGraphErrorBoundaryState
> {
  state: RoadmapGraphErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): RoadmapGraphErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.captureException(error, {
      extra: { componentStack: errorInfo.componentStack },
    });
  }

  private handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex h-full min-h-[360px] flex-col items-center justify-center rounded-xl border border-red-500/30 bg-red-50 px-6 py-10 text-center dark:bg-red-950/20">
        <h2 className="text-lg font-semibold text-red-900 dark:text-red-200">
          Graph failed to load
        </h2>
        <p className="mt-2 max-w-md text-sm text-red-800 dark:text-red-300">
          Something went wrong rendering this roadmap. The error was reported
          automatically.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={this.handleReload}
            className="rounded-lg bg-gaucho-blue px-4 py-2 text-sm font-semibold text-white hover:bg-gaucho-blue-light"
          >
            Reload page
          </button>
          {this.props.majorHref ? (
            <Link
              href={this.props.majorHref}
              className="rounded-lg border border-gaucho-blue/30 px-4 py-2 text-sm font-semibold text-gaucho-blue hover:bg-gaucho-blue/5 dark:text-gaucho-gold"
            >
              Back to {this.props.majorName ?? "major"} requirements
            </Link>
          ) : null}
        </div>
      </div>
    );
  }
}
