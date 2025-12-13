import { render } from "solid-js/web";
import { Router, Route } from "@solidjs/router";
import { lazy } from "solid-js";
import App from "./App";
import "./styles/app.css";

// Lazy load pages
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Profiles = lazy(() => import("@/pages/Profiles"));
const Repository = lazy(() => import("@/pages/Repository"));
const Settings = lazy(() => import("@/pages/Settings"));
const Updates = lazy(() => import("@/pages/Updates"));
const Backup = lazy(() => import("@/pages/Backup"));
const Diagnostics = lazy(() => import("@/pages/Diagnostics"));

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

render(
  () => (
    <Router root={App}>
      <Route path="/" component={Dashboard} />
      <Route path="/profiles" component={Profiles} />
      <Route path="/repository" component={Repository} />
      <Route path="/settings" component={Settings} />
      <Route path="/updates" component={Updates} />
      <Route path="/backup" component={Backup} />
      <Route path="/diagnostics" component={Diagnostics} />
    </Router>
  ),
  root
);