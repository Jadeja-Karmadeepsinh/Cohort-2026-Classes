import { createRootRoute, Link, Outlet } from '@tanstack/react-router'

import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

const RootLayout = () => (
    <>
        <div className="p-2 flex gap-2">
            <Link to="/" className="[&.active]:font-bold">
                Home
            </Link>

            <Link to="/ManualForm" className="[&.active]:font-bold">
                ManualForm
            </Link>

            <Link to="/HookForm" className="[&.active]:font-bold">
                HookForm
            </Link>
        </div>
        <hr />
        <Outlet />
        <TanStackRouterDevtools />
    </>
)

export const Route = createRootRoute({
    component: RootLayout,
})