import "./TodoForm.css";
import { useState } from "react";
import { addTodo } from "../api/todoApi";

export const TodoForm = () => {
  const [todo, setTodo] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const title = todo.trim();
    if (!title) return;

    try {
      const newTodo = await addTodo(title);
      setTodo("");
      console.log("todo added", newTodo);
    } catch (err) {
      console.log("failed to add todo", err);
    }
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
      <button className="todo-button" type="submit">
        Add
      </button>
    </form>
  );
};
