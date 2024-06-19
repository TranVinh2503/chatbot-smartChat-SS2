import React, { useState } from "react";
import "./App.css";
import { Register } from "./pages/Register";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import "./style.scss";
import { publicRoutes, privateRoutes } from "./routes";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ChatContextProvider } from "./context/ChatContext";
function App() {
  const accessToken = localStorage.getItem("token");
  return (
    <ChatContextProvider>
    <Router>
      <Routes>
        {publicRoutes.map((route, index) => {
          const Page = route.component;
          return (
            <Route
              key={index}
              path={route.path}
              element={
                !(
                  accessToken &
                  (route.path === "/register" || route.path === "/")
                ) ? (
                  <Page />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
          );
        })}
        {privateRoutes.map((route, index) => {
          const Page = route.component;

          return (
            <Route
              key={index}
              path={route.path}
              element={accessToken ? <Page /> : <Navigate to="/" replace />}
            />
          );
        })}
        return (
        <Route path="*" element={<Navigate to="/" replace />} />)
      </Routes>
    </Router>
    </ChatContextProvider>
  );
}
// }
export default App;
