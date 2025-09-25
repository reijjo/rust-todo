import { getTodos } from "../api/todoApi";
import { useQuery } from "@tanstack/react-query";
import { TodoItem } from "./TodoItem";

export const TodoList = () => {
  const {
    data: todoList = [],
    isError,
    error,
    isLoading,
  } = useQuery({ queryKey: ["todos"], queryFn: getTodos });

  console.log("todos", todoList);
  console.log("IS ERROR", isError, error);

  if (isLoading) return <div>Loading todos...</div>;

  return (
    <ul className="todo-list">
      {todoList?.length > 0
        ? todoList?.map((todo) => <TodoItem todo={todo} />)
        : "No todos"}
    </ul>
  );
};
