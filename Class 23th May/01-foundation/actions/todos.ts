"use server";

export async function createTodo(title: string) {
    try {   
        const todo = await prisma.todo.create({
            data: {
                title: title
            }
        })

        return todo;
    } catch(error) {

    }
}