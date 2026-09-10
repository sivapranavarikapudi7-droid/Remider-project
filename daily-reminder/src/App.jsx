import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [task, setTask] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("dailyTasks");
    return saved ? JSON.parse(saved) : [];
  });

  // Save tasks in localStorage
  useEffect(() => {
    localStorage.setItem("dailyTasks", JSON.stringify(tasks));
  }, [tasks]);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Check reminders every second
  useEffect(() => {
    const reminderTimer = setInterval(() => {
      const now = new Date();

      setTasks((previousTasks) =>
        previousTasks.map((item) => {
          if (
            !item.completed &&
            !item.reminded &&
            now >= new Date(item.dateTime)
          ) {
            alert("⏰ Reminder: " + item.task);

            return {
              ...item,
              reminded: true,
            };
          }

          return item;
        })
      );
    }, 1000);

    return () => clearInterval(reminderTimer);
  }, []);

  // Add task
  function addTask(e) {
    e.preventDefault();

    if (task.trim() === "" || dateTime === "") {
      alert("Please enter task and date/time.");
      return;
    }

    const newTask = {
      id: Date.now(),
      task: task,
      dateTime: dateTime,
      completed: false,
      reminded: false,
    };

    setTasks((previousTasks) => [...previousTasks, newTask]);

    setTask("");
    setDateTime("");
  }

  // Complete / Undo task
  function completeTask(id) {
    setTasks((previousTasks) =>
      previousTasks.map((item) =>
        item.id === id
          ? { ...item, completed: !item.completed }
          : item
      )
    );
  }

  // Delete task
  function deleteTask(id) {
    setTasks((previousTasks) =>
      previousTasks.filter((item) => item.id !== id)
    );
  }

  // Convert Date to local datetime input format
  function toLocalInputValue(date) {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);

    return localDate.toISOString().slice(0, 16);
  }

  // Snooze task for 5 minutes
  function snoozeTask(id) {
    setTasks((previousTasks) =>
      previousTasks.map((item) => {
        if (item.id === id) {
          const newTime = new Date(item.dateTime);
          newTime.setMinutes(newTime.getMinutes() + 5);

          return {
            ...item,
            dateTime: toLocalInputValue(newTime),
            reminded: false,
          };
        }

        return item;
      })
    );

    alert("⏰ Task snoozed for 5 minutes!");
  }

  // Format date and time
  function formatDate(value) {
    return new Date(value).toLocaleString();
  }

  return (
    <div className="app">

      {/* Header */}
      <header className="header">
        <h1>⏰ Daily Routine Reminder</h1>

        <p>
          Plan your day • Stay organized • Never miss a task
        </p>

        <div className="clock">
          {currentTime.toLocaleTimeString()}
        </div>
      </header>

      {/* Main content */}
      <main className="container">

        {/* Add Task */}
        <section className="card">
          <h2>➕ Add Daily Task</h2>

          <form onSubmit={addTask}>
            <input
              type="text"
              placeholder="Enter task name"
              value={task}
              onChange={(e) => setTask(e.target.value)}
            />

            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
            />

            <button type="submit">
              Add Task
            </button>
          </form>
        </section>

        {/* Task List */}
        <section className="card">
          <h2>📋 My Tasks</h2>

          {tasks.length === 0 ? (
            <p className="empty">
              No tasks added yet.
            </p>
          ) : (
            <div>
              {tasks.map((item) => (
                <div
                  key={item.id}
                  className={
                    item.completed
                      ? "task completed"
                      : "task"
                  }
                >

                  <div className="taskInfo">
                    <h3>{item.task}</h3>

                    <p>
                      🕐 {formatDate(item.dateTime)}
                    </p>
                  </div>

                  <div className="buttons">

                    <button
                      className="complete"
                      onClick={() => completeTask(item.id)}
                    >
                      {item.completed ? "Undo" : "Complete"}
                    </button>

                    <button
                      className="snooze"
                      onClick={() => snoozeTask(item.id)}
                    >
                      Snooze 5 Min
                    </button>

                    <button
                      className="delete"
                      onClick={() => deleteTask(item.id)}
                    >
                      Delete
                    </button>

                  </div>

                </div>
              ))}
            </div>
          )}
        </section>

      </main>

      {/* Footer */}
      <footer>
        Daily Routine Reminder | Developed using React
      </footer>

    </div>
  );
}

export default App;