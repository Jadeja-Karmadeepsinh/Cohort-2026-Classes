import { createFileRoute } from "@tanstack/react-router";
import Profile from "../components/Profile.jsx";

export const Route = createFileRoute("/Profile")({
    component: Profile,
});