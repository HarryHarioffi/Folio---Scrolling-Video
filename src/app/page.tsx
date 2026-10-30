import App from "../App";

// Prerendered to static HTML at build time (output: "export" in next.config.ts)
export default function Page() {
  return <App />;
}
