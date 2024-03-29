import { React, Component } from "react";
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      todoList: [],
      activeItem: {
        id: null,
        title: "",
        completed: false,
      },
      editing: false,
    };

    this.fetchTasks = this.fetchTasks.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getCookie = this.getCookie.bind(this);

    this.startEdit = this.startEdit.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.delUndelItem = this.delUndelItem.bind(this);
  }

  getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      var cookies = document.cookie.split(";");
      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    console.log(cookieValue);
    return cookieValue;
  }

  fetchTasks() {
    console.log("Fetching...");

    fetch("http://127.0.0.1:8000/api/task-list/")
      .then((response) => response.json())
      .then((data) =>
        this.setState({
          todoList: data,
        })
      );
  }

  componentDidMount() {
    this.fetchTasks();
  }

  handleChange(e) {
    var value = e.target.value;
    console.log("Value:", value);

    this.setState({
      activeItem: {
        ...this.state.activeItem,
        title: value,
      },
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    console.log("ITEM:", this.state.activeItem);

    var csrftoken = this.getCookie("csrftoken");
    var url = "http://127.0.0.1:8000/api/task-create/";

    if (this.state.editing == true) {
      url = `http://127.0.0.1:8000/api/task-update/${this.state.activeItem.id}/`;
      this.setState({
        editing: false,
      });
    }

    fetch(url, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify(this.state.activeItem),
    })
      .then(() => {
        this.fetchTasks();
        this.setState({
          activeItem: {
            id: null,
            title: "",
            completed: false,
          },
        });
      })
      .catch(function (error) {
        console.log("ERROR:", error);
      });
  }

  startEdit(task) {
    this.setState({
      activeItem: task,
      editing: true,
    });
  }

  deleteItem(task) {
    var csrftoken = this.getCookie("csrftoken");
    var url = `http://127.0.0.1:8000/api/task-delete/${task.id}/`;

    fetch(url, {
      method: "DELETE",
      headers: {
        "Content-type": "application/json",
        "X-CSRFToken": csrftoken,
      },
    }).then(() => {
      this.fetchTasks();
    });
  }

  delUndelItem(task) {
    task.completed = !task.completed;

    var csrftoken = this.getCookie("csrftoken");
    var url = `http://127.0.0.1:8000/api/task-update/${task.id}/`;

    fetch(url, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify({ completed: task.completed, title: task.title }),
    }).then(() => {
      this.fetchTasks();
    });
    console.log("TASK:", task.completed);
  }

  render() {
    var tasks = this.state.todoList;
    var self = this;
    return (
      <div className="container">
        <div id="task-container">
          <div className="form-wrapper">
            <form onSubmit={this.handleSubmit} id="form">
              <div className="flex-wrapper">
                <div style={{ flex: 6 }}>
                  <input
                    type="text"
                    onChange={this.handleChange}
                    className="form-control"
                    id="title"
                    value={this.state.activeItem.title}
                    name="title"
                    placeholder="Add task..."
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    type="submit"
                    id="submit"
                    className="btn btn-warning"
                    name="Add"
                  />
                </div>
              </div>
            </form>
          </div>

          <div id="list-wrapper">
            {tasks.map(function (task, index) {
              return (
                <div key={index} className="task-wrapper flex-wrapper">
                  <div
                    onClick={() => self.delUndelItem(task)}
                    style={{ flex: 7 }}
                  >
                    {task.completed == false ? (
                      <span>{task.title}</span>
                    ) : (
                      <del>{task.title}</del>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <button
                      onClick={() => self.startEdit(task)}
                      className="btn btn-sm btn-outline-info"
                    >
                      Edit
                    </button>
                  </div>
                  <div style={{ flex: 1 }}>
                    <button
                      onClick={() => self.deleteItem(task)}
                      className="btn btn-sm btn-outline-danger delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
