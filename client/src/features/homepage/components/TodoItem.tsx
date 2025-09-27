import "./TodoItem.css";
import type { Todo } from "../../../utils/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTodo, deleteTodo } from "../api/todoApi";

type TodoItemProps = {
  todo: Todo;
};

export const TodoItem = ({ todo }: TodoItemProps) => {
  const queryClient = useQueryClient();

  const update = useMutation({
    mutationFn: updateTodo,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
  const remove = useMutation({
    mutationFn: deleteTodo,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  return (
    <li className="todo-item">
      <label htmlFor={todo.id} className="todo-input">
        <input
          type="checkbox"
          name="todo-input"
          id={todo.id}
          className="todo-check"
          disabled={update.isPending}
          checked={todo.done}
          onClick={() =>
            update.mutate({
              id: todo.id,
              done: !todo.done,
            })
          }
        />
        <p
          className="todo-title"
          style={
            todo.done
              ? {
                  textDecoration: "line-through",
                  color: "rgba(255, 255, 255, 0.5)",
                }
              : undefined
          }
        >
          {update.isPending ? "updating..." : todo.title}
        </p>
      </label>
      {todo.done && (
        <button
          type="button"
          className="todo-delete"
          onClick={() => remove.mutate(todo.id)}
        >
          Delete
        </button>
      )}
    </li>
  );
};
