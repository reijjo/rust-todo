import { getTodos } from "../api/todoApi";
import { useQuery } from "@tanstack/react-query";

export const TodoList = () => {
  const {
    data: todoList = [],
    isError,
    error,
  } = useQuery({ queryKey: ["todos"], queryFn: getTodos });

  console.log("todos", todoList);
  console.log("IS ERROR", isError, error);

  return (
    <ul className="todo-list">
      {todoList?.length > 0
        ? todoList?.map((todo) => (
            <li className="todo-item" key={todo.id}>
              {todo.title}
            </li>
          ))
        : "No todos"}
    </ul>
  );
};
