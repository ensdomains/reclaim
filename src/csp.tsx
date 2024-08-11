import { Helmet } from "react-helmet";

const resources = [
  "https://*.googletagmanager.com",
  "plausible.io",
  "static.cloudflareinsights.com",
  "*.ens-app-v3.pages.dev",
  "https://app.intercom.io",
  "https://widget.intercom.io",
  "https://js.intercomcdn.com",
].join(" ");

const content =
  meta.env.NODE_ENV === "production"
    ? `worker-src 'self'; script-src 'self' 'sha256-UyYcl+sKCF/ROFZPHBlozJrndwfNiC5KT5ZZfup/pPc=' ${resources} 'wasm-unsafe-eval';`
    : "script-src 'self'";

export function Csp() {
  return (
    <Helmet>
      <meta httpEquiv="Content-Security-Policy" content={content} />
    </Helmet>
  );
}
