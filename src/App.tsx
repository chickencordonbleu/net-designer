import { ThemeProvider } from "./components/theme-provider";
import { RootLayout } from "./RootLayout";
import { NetworkDesigner } from "./pages/NetworkDesigner/NetworkDesigner";

export function App() {
  return (
    <ThemeProvider>
      <RootLayout>
        <NetworkDesigner />
      </RootLayout>
    </ThemeProvider>
  );
}
