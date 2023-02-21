import "./assets/css/App.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { routes } from "./routes";
import React from "react";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers";

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Router>
        <Routes>
          {routes.map((route) => (
            <Route {...route} />
          ))}
        </Routes>
      </Router>
    </LocalizationProvider>
  );
}

export default App;
