import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy } from "react";

const HomePage = lazy(() => import("./pages/HomePage"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: (
      <div style={{ display: "grid", placeContent: "center", height: "100vh" }}>
        404
      </div>
    ),
    children: [{ path: "/", element: <HomePage /> }],
  },
]);

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
