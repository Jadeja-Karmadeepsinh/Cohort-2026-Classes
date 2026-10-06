import { NextRequest, NextResponse } from "next/server";
// import your prisma from @lib/db

// @ts-ignore
export async function GET(request: NextRequest, ctx: RouteContext<'/todos/[id]'>) {
    try {
        const { id } = await ctx.params;

        if(!id) {
            return NextResponse.json(
                { success: false, error: "No id in params" },
                { status: 400 }
            );
        }

        const todo = await prisma.todo.findUnique({
            where: {
                id: id
            }
        })

        if(!todo) {
            return NextResponse.json(
                { success: false, error: "No todo with given id exsists" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, data: todo },
            { status: 200 }
        );
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch todos" },
            { status: 500 }
        )
    }
}