import { useState } from "react";
import "./TodoForm.css";
import type { NewTodo } from "../../../utils/types";
import { defaultNewTodo } from "../../../utils/defaults";
import { addTodo } from "../api/todoApi";

export const TodoForm = () => {
  const [todo, setTodo] = useState<NewTodo>(defaultNewTodo);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newTodo = await addTodo(todo);
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
        onChange={(e) => setTodo({ ...todo, title: e.target.value })}
      />
      <button className="todo-button" type="submit">
        Add
      </button>
    </form>
  );
};
