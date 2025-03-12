import express from 'express'
import { randomUUID } from 'node:crypto'
import cookieParser from 'cookie-parser'
const app = express()
const port = 3000

let users = [
  {
    id: '1',
    login: 'admin',
    password: 'admin'
  },
  {
    id: '2',
    login: 'user',
    password: 'user'
  }
]

let session = [];

app.use(express.static('public'));
app.use(cookieParser());

app.get('/auth', (req, res) => {
  const errors = {};
  const data = req.query;
  if(!data.login ||!data.login?.length === 0){
    errors["login"] = "Вы не указали логин.";
  }
  if(!data.password ||!data.password?.length === 0){
    errors["password"] = "Вы не указали пароль.";
  }
  if(Object.keys(errors).length > 0){
    res.statusCode = 400;
    res.send(errors);
  }
  const findedUser = users.find(
    (i) => i.login === data.login && i.password === data.password,
  );
  if(findedUser === undefined){
    res.statusCode = 401;
    res.send("Неправильный логин или пароль");
  }
  const sessionKey = randomUUID();
  console.log(data.login);
  session.push(sessionKey);
  res.cookie("session", sessionKey, { path: "/", httpOnly: true });
  res.statusCode = 301;
  res.redirect("/second");


})

app.get('/', (req, res) => {
  res.sendFile('autorization.html',  {root: "pages"});
})

app.get('/second', (req, res) => {
  const sessionKey = req.cookies.session;
  if(sessionKey === undefined){
    res.statusCode = 403;
    res.send("Доступ запрещен");
  }
  res.sendFile('second_page.html',  {root: "pages"});
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})