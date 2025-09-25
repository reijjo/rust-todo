import type { Todo } from "../../../utils/types";

type TodoItemProps = {
  todo: Todo;
};

export const TodoItem = ({ todo }: TodoItemProps) => {
  return <li className="todo-item">{todo.title}</li>;
};
