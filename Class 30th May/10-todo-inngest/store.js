export const todos = [];
export const auditLogs = [];

let nextId = 1;

export function createTodo(title) {
    const todo = { id: nextId++, title: title, completed: false };
    todos.push(todo);
    console.log(todos);
    return todo;
}

export function getTodo(id) {
    const todo = todos.find((t) => t.id === id);
    return todo;
}

export function updateTodo(id, patch) {
    const todo = getTodo(id);
    if (!todo) return null;
    if (patch.title !== undefined) todo.title = patch.title;
    if (patch.completed !== undefined) todo.completed = patch.completed;
    return todo;
}

export function deleteTodo(id) {
    console.log(id);
    console.log(todos);
    const index = todos.findIndex((todo) => {
        console.log(todo);
        return todo.id === id
    });
    console.log(index);
    if (index === -1) return false;
    return todos.splice(index, 1)[0];
}
  