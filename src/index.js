const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  if (!username) {
    return response.status(404).json({ error: "Please provide an username!" })
  }

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found!" });
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

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(newUser);

  return response.status(201).send(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  return response.status(201).json(request.user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const id = uuidv4();

  const newTodo = {
    id,
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(newTodo);

  return response.status(201).send(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const { title, deadline } = request.body;

  const todoIndex = user.todos.findIndex(todo => todo.id === id);

  if (todoIndex < 0) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  const altTodo = {
    ...request.user.todos[todoIndex],
    title: title,
    deadline: new Date(deadline)
  }

  request.user.todos[todoIndex] = altTodo;

  return response.status(200).send(altTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoIndex = user.todos.findIndex(todo => todo.id === id);

  if (todoIndex < 0) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  const altTodo = {
    ...request.user.todos[todoIndex],
    done: true
  }


  return response.status(202).send(altTodo);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoIndex = user.todos.findIndex(todo => todo.id === id);

  if (todoIndex < 0) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  user.todos.splice(todoIndex, 1);

  return response.status(204).send();


});

module.exports = app;