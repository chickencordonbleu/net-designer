import { ThemeProvider } from "./components/theme-provider";
import Layout from "./Layout";
import { NetworkForm } from "./NetworkForm";

export function App() {
  return (
    <ThemeProvider>
      <Layout>
        <NetworkForm />
      </Layout>
    </ThemeProvider>
  );
}
