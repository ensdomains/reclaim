window.global ||= window;

import { Buffer } from "node:buffer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { WagmiProvider } from "wagmi";

import { ThorinGlobalStyles, lightTheme } from "@ensdomains/thorin";
import { ThemeProvider } from "styled-components";
import App from "./App.tsx";
import { config } from "./wagmi.ts";

import "./index.css";

globalThis.Buffer = Buffer;

const queryClient = new QueryClient();

// biome-ignore lint/style/noNonNullAssertion: never null
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={lightTheme}>
          <ThorinGlobalStyles />
          <App />
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);
