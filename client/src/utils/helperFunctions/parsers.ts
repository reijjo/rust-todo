import type { Todo, TodoResponse } from "../types";

export const parseTodoResponse = (todo: TodoResponse): Todo => {
  return {
    id: todo._id.$oid,
    title: todo.title,
    done: todo.done,
  };
};
