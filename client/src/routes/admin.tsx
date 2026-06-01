import { createFileRoute } from "@tanstack/react-router";
import AdminApp from "../components/admin/AdminApp.jsx";

export const Route = createFileRoute("/admin")({
  component: AdminApp,
});
