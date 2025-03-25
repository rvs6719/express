import express from 'express'
import { randomUUID } from 'node:crypto'
import cookieParser from 'cookie-parser'
import jwt from "jsonwebtoken"
const app = express()
const port = 3000

const SECRET = "rvs6719sidqwerty12345"

let users = [
  {
    id: '1',
    login: 'admin',
    password: 'admin',
    role: 'admin'
  },
  {
    id: '2',
    login: 'user',
    password: 'user',
    role: 'user'
  },
  {
    id: '3',
    login: 'staff',
    password: 'staff',
    role: 'staff'
  }
]

const session = [];

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
  //const sessionKey = randomUUID();
  const token = jwt.sign(findedUser, SECRET);
  console.log(token);
  session.push(token);
  res.cookie("session", token, { path: "/", httpOnly: true });
  res.statusCode = 301;
  if(findedUser.role === "admin" || findedUser.role === "staff"){
    res.redirect("/staff");
  } else {
    res.redirect("/all");
  }


})

app.get('/staff', (req, res) => {
  const token = req.cookies.session;
  try {
    jwt.verify(token, SECRET);
    res.sendFile("staff.html", {root: "pages"})
    return
  } catch (e) {
    console.log(e);
    res.statusCode = 301;
    res.redirect("/");
    return;
  }
})

app.get('/all', (req, res) => {
  const token = req.cookies.session;
  try {
    jwt.verify(token, SECRET);
    res.sendFile("all.html", {root: "pages"})
    return
  } catch (e) {
    console.log(e);
    res.statusCode = 301;
    res.redirect("/");
    return;
  }

})

app.get('/logout', (req, res) => {
  const sessionKey = req.cookies.session;
  if(sessionKey === undefined){
    res.redirect("/");
    return;
  }
  const idx = session.findIndex((i) => i === sessionKey);
  if(idx < 0){
    res.redirect("/");
    return;
  }
  session.splice(idx, 1);
  res.clearCookie("session");
  res.redirect("/");
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