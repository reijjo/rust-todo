import "./TodoList.css";
import { getTodos } from "../api/todoApi";
import {
  QueryErrorResetBoundary,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { TodoItem } from "./TodoItem";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "../../../components/shared/fallback/ErrorFallback";

const Todos = () => {
  const {
    data: todoList = [],
    isError,
    error,
  } = useSuspenseQuery({ queryKey: ["todos"], queryFn: getTodos });

  console.log("todos", todoList);
  console.log("IS ERROR", isError, error);

  return (
    <ul className="todo-list">
      {todoList?.length > 0
        ? todoList?.map((todo) => <TodoItem todo={todo} key={todo.id} />)
        : "No todos"}
    </ul>
  );
};

export const TodoList = () => {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary FallbackComponent={ErrorFallback} onReset={reset}>
          <Suspense fallback={<div>Loading todolist...</div>}>
            <Todos />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};
