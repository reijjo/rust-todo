import type { FallbackProps } from "react-error-boundary";

export const GlobalErrorFallback = ({
  error,
  resetErrorBoundary,
}: FallbackProps) => (
  <div style={{ display: "grid", placeContent: "center", height: "100vh" }}>
    <div role="alert">
      <h1>Something went wrong</h1>
      <pre>{error.message}</pre>
      <button type="button" onClick={resetErrorBoundary}>
        Reload app
      </button>
    </div>
  </div>
);
