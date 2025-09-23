import type { Todo } from "../../../utils/types";

export const getTodos = async (): Promise<Todo[]> => {
  const response = await fetch("http://localhost:3000/todos");
  if (!response.ok) {
    console.log("get todos api error", response);
    throw new Error(response.statusText);
  }
  return response.json();
};

export const addTodo = async (todo: string) => {
  const response = await fetch("http://localhost:3000/todos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(todo),
  });

  if (!response.ok) {
    console.log("add todo api error", response);
    throw new Error(response.statusText);
  }
  return response.json();
};
