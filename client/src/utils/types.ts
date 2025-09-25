export type Todo = {
  id: string;
  title: string;
  done: boolean;
};

export type TodoResponse = {
  _id: {
    $oid: string;
  };
  title: string;
  done: boolean;
};
