import "./TodoForm.css";
import { useState } from "react";
import { addTodo } from "../api/todoApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const TodoForm = () => {
  const [todo, setTodo] = useState("");
  const queryClient = useQueryClient();

  const createTodo = useMutation({
    mutationFn: (todo: string) => addTodo(todo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      setTodo("");
    },
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const title = todo.trim();
    if (!title) return;

    createTodo.mutate(title);
  };

  return (
    <form onSubmit={onSubmit} className="todo-form">
      <input
        className="todo-input"
        type="text"
        value={todo}
        onChange={(e) => setTodo(e.target.value)}
        required
      />
      <button
        className="todo-button"
        type="submit"
        disabled={createTodo.isPending}
      >
        {!createTodo.isPending ? "Add" : "Adding..."}
      </button>
    </form>
  );
};
