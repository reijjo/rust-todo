import type { Todo, TodoResponse } from "../../../utils/types";
import { config } from "../../../utils/config";
import { parseTodoResponse } from "../../../utils/helperFunctions/parsers";

const { API_URL } = config;

export const getTodos = async (): Promise<Todo[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const response = await fetch(`${API_URL}/todos`);
  if (!response.ok) {
    console.log("get todos api error", {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
    });
    throw new Error(response.statusText);
  }

  const todos: TodoResponse[] = await response.json();
  return todos.map(parseTodoResponse);
};

export const addTodo = async (todo: string): Promise<Todo> => {
  const response = await fetch(`${API_URL}/todos`, {
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

export const updateTodo = async ({
  id,
  done,
}: Partial<Todo>): Promise<Todo> => {
  const response = await fetch(`${API_URL}/todos/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(done),
  });

  if (!response.ok) {
    console.log("Update todo api error", response);
    throw new Error(response.statusText);
  }
  return response.json();
};

export const deleteTodo = async (id: string): Promise<Todo> => {
  const response = await fetch(`${API_URL}/todos/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    console.log("delete todo api error", response);
    throw new Error(response.statusText);
  }
  return response.json();
};
