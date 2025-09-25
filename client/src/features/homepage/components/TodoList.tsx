import { useEffect, useState } from "react";
import { getTodos } from "../api/todoApi";
import type { Todo } from "../../../utils/types";

export const TodoList = () => {
  const [todoList, setTodoList] = useState<Todo[]>([]);

  useEffect(() => {
    const getTodoList = async () => {
      try {
        const getList = await getTodos();
        setTodoList(getList);
      } catch (err) {
        console.log("failed to get todo list", err);
      }
    };
    getTodoList();
  }, []);

  console.log("todo list", todoList);

  return (
    <ul className="todo-list">
      <li className="todo-item">Example TODOO</li>
      {todoList.length > 0
        ? todoList.map((todo) => (
            <li className="todo-item" key={todo.id}>
              {todo.title}
            </li>
          ))
        : "No todos"}
    </ul>
  );
};
