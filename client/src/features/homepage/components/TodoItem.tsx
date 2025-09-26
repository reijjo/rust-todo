import "./TodoItem.css";
import type { Todo } from "../../../utils/types";

type TodoItemProps = {
  todo: Todo;
};

export const TodoItem = ({ todo }: TodoItemProps) => {
  return (
    <li className="todo-item">
      <label htmlFor={todo.id} className="todo-input">
        <input
          type="checkbox"
          name="todo-input"
          id={todo.id}
          className="todo-check"
        />
        <p className="todo-title">{todo.title}</p>
        {todo.done && (
          <button type="button" className="todo-delete">
            Delete
          </button>
        )}
      </label>
    </li>
  );
};
