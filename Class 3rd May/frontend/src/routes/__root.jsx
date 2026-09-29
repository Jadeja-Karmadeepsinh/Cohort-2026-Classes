import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

const RootLayout = () => (
    <>
        <nav
            style={{
                display: "flex",
                gap: "20px",
                padding: "15px 25px",
                background: "#0f172a",
                borderBottom: "1px solid #1e293b"
            }}
        >

            <Link to="/">
                Home
            </Link>

            <Link to="/ManualForm">
                ManualForm
            </Link>

            <Link to="/HookForm">
                HookForm
            </Link>

            <Link to="/Profile">
                Profile
            </Link>

        </nav>

        <Outlet />

        <TanStackRouterDevtools />
    </>
);

export const Route = createRootRoute({
    component: RootLayout,
});