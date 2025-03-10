import { ThemeProvider } from "../components/theme-provider";
import { ReactQueryProvider } from "./providers/ReactQueryProvider";
import { RoutesProvider } from "./providers/RoutesProvider";

export function App() {
  return (
    <ThemeProvider>
      <ReactQueryProvider>
        <RoutesProvider />
      </ReactQueryProvider>
    </ThemeProvider>
  );
}
