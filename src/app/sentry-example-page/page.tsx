"use client";

import * as Sentry from "@sentry/nextjs";

export default function SentryExamplePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-bold">Sentry Example Page</h1>
      <p className="text-muted-foreground max-w-md text-center">
        Click the button below to trigger a test error that will be captured by
        Sentry. Check your Sentry dashboard to verify it was received.
      </p>
      <button
        className="bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg px-6 py-3 cursor-pointer transition-colors"
        onClick={async () => {
          await Sentry.startSpan(
            { name: "Example Frontend Span", op: "test" },
            async () => {
              const res = await fetch("/api/sentry-example-api");
              if (!res.ok) {
                throw new Error("Sentry Example Frontend Error");
              }
            }
          );
        }}
      >
        Trigger Test Error
      </button>
    </div>
  );
}
