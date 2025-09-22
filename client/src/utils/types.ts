export type TodoID = number;
export type NewTodo = {
  title: string;
  completed: boolean;
};

export type Todo = {
  id: TodoID;
  title: string;
  completed: boolean;
};
