import { TodoForm } from "../features/homepage/components/TodoForm";
import { TodoList } from "../features/homepage/components/TodoList";
import "./HomePage.css";

const HomePage = () => {
  return (
    <div className="wrapper homepage">
      <h1>Add a todo</h1>
      <TodoForm />

      <TodoList />
    </div>
  );
};

export default HomePage;
