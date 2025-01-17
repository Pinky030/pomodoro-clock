import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import Countdown from "react-countdown";

type TodoType = {
  id: number;
  name: string;
  done: boolean;
};

const TWENTYFIVE_MINUS = 25 * 60000;
const FIVE_MINUS = 5 * 60000;
const FIFTEEN_MINUS = 15 * 60000;

function App() {
  const countdownRef = useRef<Countdown | null>(null);

  const [name, setName] = useState("");
  const [todos, setTodos] = useState<TodoType[]>([]);
  const [time, setTime] = useState<number>(TWENTYFIVE_MINUS);
  const [todoId, setTodoId] = useState<number>(-1);

  useEffect(() => {
    getTodos();
  }, []);

  const addTodo = async () => {
    await invoke("add_todo", { name });
  };

  const getTodos = async () => {
    try {
      let res = await invoke<TodoType[]>("get_todos");
      setTodos(res);
    } catch (e) {
      console.log(e);
    }
  };

  const markAsDone = async() => {
    await invoke("mark_finish", { todoId  });
    getTodos();
  }

  const removeTodo = async() => {
    await invoke("remove_todo", {todoId});
    getTodos();
  }

  return (
    <main className="container">

      <h2 style={{ color: "#682a07" }}>Pomodoro clock</h2>

      <div style={{ marginTop: 5, display: "flex", gap: 10 }}>
        <button
          className="timer_button"
          style={{ backgroundColor: "#f5b091", color: "#682a07" }}
          onClick={() => setTime(TWENTYFIVE_MINUS)}
        >
          Pomodoro Clock
        </button>
        <button
          className="timer_button"
          style={{ backgroundColor: "#fcecc3", color: "#714f1e" }}
          onClick={() => setTime(FIVE_MINUS)}
        >
          Rest
        </button>
        <button
          className="timer_button"
          style={{ backgroundColor: "#c8d0b0", color: "#3a4724" }}
          onClick={() => setTime(FIFTEEN_MINUS)}
        >
          Long Break
        </button>
      </div>

      <div style={{ marginTop: 20, marginBottom: 20 }}>
        <hr />
        <div >
          <h1 style={{ color: "#682a07" }}>
            <Countdown
              autoStart={false}
              ref={countdownRef}
              date={Date.now() + time}
            />
          </h1>
        </div>

        <div style={{ display: "flex", gap: 20 }}>
          <button
            style={{
              backgroundColor: "#E1E5EA",
              color: "#714f1e",
              fontWeight: 600,
            }}
            onClick={() => {
              countdownRef.current?.api?.start();
            }}
          >
            Start
          </button>

          <button
            style={{
              backgroundColor: "#E1E5EA",
              color: "#714f1e",
              fontWeight: 600,
            }}
            onClick={() => {
              countdownRef.current?.api?.pause();
            }}
          >
            Pause
          </button>
        </div>
        <hr />
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          width: "70%",
          flexDirection: "column",
        }}
      >
        <select defaultValue={""} onChange={(e) => {setTodoId(parseInt(e.target.value))}}>
          <option value="" disabled >
            Select Todo
          </option>

          {todos.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() =>{markAsDone()}}
            style={{
              backgroundColor: "#f5b091",
              color: "#682a07",
              fontWeight: 600,
            }}
          >
            Mark as done
          </button>
          <button
          onClick={() => {removeTodo()}}
            style={{
              backgroundColor: "#c8d0b0",
              color: "#3a4724",
              fontWeight: 600,
            }}
          >
            Remove todo
          </button>
        </div>
      </div>

      <div
        style={{
          flexDirection: "column",
          marginTop: 50,
          display: "flex",
          gap: 20,
          alignItems: "center",
          width: "70%",
        }}
      >
        <input
          type="text"
          placeholder="Add task"
          onChange={(e) => setName(e.target.value)}
        />
        <button
          style={{
            backgroundColor: "#E1E5EA",
            color: "#714f1e",
            fontWeight: 600,
          }}
          onClick={() => {
            addTodo();
          }}
        >
          Create
        </button>
      </div>
    </main>
  );
}

export default App;
