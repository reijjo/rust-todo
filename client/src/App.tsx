import { Outlet } from "react-router-dom";
import "./App.css";
import { Footer } from "./components/shared/Footer";

function App() {
  return (
    <main className="layout">
      <section className="app-content">
        <Outlet />
      </section>
      <Footer />
    </main>
  );
}

export default App;
