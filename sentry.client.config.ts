import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://1d89e07b3583c552c00c06dc961d20f0@o4510858004725760.ingest.us.sentry.io/4510858006036480",
  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
  enableLogs: true,
  tracesSampleRate: 1.0,
});
