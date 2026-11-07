import { SeverityNumber } from "@opentelemetry/api-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  BatchLogRecordProcessor,
  LoggerProvider,
} from "@opentelemetry/sdk-logs";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if ((!posthogKey || !posthogHost) && process.env.NODE_ENV !== "production") {
  const missingVariable = posthogKey
    ? "NEXT_PUBLIC_POSTHOG_HOST"
    : "NEXT_PUBLIC_POSTHOG_KEY";
  console.warn(
    `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
  );
}

const processors =
  posthogKey && posthogHost
    ? [
        new BatchLogRecordProcessor(
          new OTLPLogExporter({
            url: `${posthogHost.replace(/\/$/, "")}/i/v1/logs`,
            headers: {
              Authorization: `Bearer ${posthogKey}`,
              "Content-Type": "application/json",
            },
          }),
        ),
      ]
    : [];

export const posthogLoggerProvider = new LoggerProvider({
  resource: resourceFromAttributes({ "service.name": "stay-in-touch" }),
  processors,
});

// This logger is intentionally separate from the application's existing logs.
export const posthogLogger = posthogLoggerProvider.getLogger(
  "stay-in-touch-posthog",
);

export function logPostHogInfo(
  body: string,
  attributes: Record<string, boolean | number | string>,
) {
  posthogLogger.emit({
    body,
    severityNumber: SeverityNumber.INFO,
    attributes,
  });
}
