import type { Todo } from "../../../utils/types";
import { config } from "../../../utils/config";

const { API_URL } = config;

export const getTodos = async (): Promise<Todo[]> => {
  const response = await fetch(`${API_URL}/todos`);
  if (!response.ok) {
    console.log("get todos api error", response);
    throw new Error(response.statusText);
  }
  return response.json();
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
