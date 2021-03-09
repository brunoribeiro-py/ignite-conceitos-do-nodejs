const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }
  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const userAlreadyExists = users.some(
    (user) => user.username === username
  );

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists!" });
  }

  const id = uuidv4();

  users.push({
    id,
    name,
    username,
    todos: []
  });
  return response.status(201).send();
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const id = uuidv4();

  const addTodo = {
    id,
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(addTodo);

  return response.status(201).send()
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = user.todos.filter(function (el) {
    return el.id == id;
  });

  if (todo.length === 0) {
    return response.status(404).json({ error: "todo not found!" });
  }

  todo[0].title = title;
  todo[0].deadline = new Date(deadline);
  return response.status(202).send();
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.filter(function (el) {
    return el.id == id;
  });

  if (todo.length === 0) {
    return response.status(404).json({ error: "todo not found!" });
  }

  todo[0].done = true;
  return response.status(202).send();

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.filter(function (el) {
    return el.id == id;
  });

  if (todo.length === 0) {
    return response.status(404).json({ error: "todo not found!" });
  }
  // indexOf() finds the todo position in the user.todos array
  user.todos.splice(user.todos.indexOf(todo, 0), 1);

  return response.status(202).send();


});

module.exports = app;