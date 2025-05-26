import express from 'express'
import { randomUUID } from 'node:crypto'
import cookieParser from 'cookie-parser'
import jwt from "jsonwebtoken"
import CryptoJS from 'crypto-js'
import {createHmac, createHash} from 'node:crypto'
const app = express()
const port = 80
import { Pool } from 'pg';

const session = [];

const SECRET = "rvs6719sidqwerty12345"

app.use(express.static('public'));
app.use(cookieParser());

const pool = new Pool({
  user: 'postgres',
  host: '172.28.66.193',
  database: 'postgres',
  password: 'password',
  port: 5432,
});

// let users = [];
async function fetchUsers(login, password) {
  try {
    const res = await pool.query('SELECT * FROM Users WHERE login = $1 AND password = $2', [login, password]);
    const found = res.rows;
    if (found.length > 0) {
      return found[0];
    } else {
      return null;
    }
  } catch (err) {
    console.error('Error executing query', err.stack);
    return null;
  }
}



// let users = [
//   {
//     id: '1',
//     login: 'admin',
//     password: 'admin',
//     role: 'admin'
//   },
//   {
//     id: '2',
//     login: 'user',
//     password: 'user',
//     role: 'user'
//   },
//   {
//     id: '3',
//     login: 'staff',
//     password: 'staff',
//     role: 'staff'
//   }
// ]
//getUsers();






app.get('/auth', async (req, res) => {
  const errors = {};
  const data = req.query;

  if (!data.login || data.login.length === 0) {
    errors["login"] = "Вы не указали логин.";
  }

  if (!data.password || data.password.length === 0) {
    errors["password"] = "Вы не указали пароль.";
  }

  if (Object.keys(errors).length > 0) {
    res.status(400).send(errors);
    return;
  }

  try {
    const findedUser = await fetchUsers(data.login, data.password);
    if (!findedUser) {
      res.status(401).send("Неправильный логин или пароль");
      return;
    }

    const token = jwt.sign(findedUser, SECRET);
    console.log(token);
    session.push(token);
    res.cookie("session", token, { path: "/", httpOnly: true });
    res.status(302);
    if (findedUser.role === "admin" || findedUser.role === "staff") {
      res.redirect("/staff");
    } else {
      res.redirect("/all");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Произошла ошибка на сервере");
  }
});

app.get('/profile', async (req, res) => {
  const id = req.query.id;
  if(!id){
    res.statusCode = 400;
    res.send("Не указан id пользователя");
    return;
  }
  const user = await pool.query('SELECT * FROM users WHERE id = $1',[id]);
  console.log(user.rows)
  res.send({user : 1})
})

function decimalToHexString(number)
{
  if (number < 0)
  {
    number = 0xFFFFFFFF + number + 1;
  }

  return number.toString(16);
}

function validateUserData(data) {
  const keys = Object.keys(data).sort();
  let str = '';
  for (const key in keys) {
      if (keys[key] !== 'hash') {
          str += keys[key] + '=' + data[keys[key]];
          if (+key !== keys.length - 1) str += '\n';
      }
  }

  const botToken = "7629198716:AAHPHr_ZQULHqlcUesmENzdxQa5zAKKEt4M";

  const hashSecret = createHash('sha256').update(botToken).digest();
  const hash = createHmac('sha256', hashSecret).update(str).digest('hex');
  const compare = hash === data.hash;

  const authDate = new Date(+data.auth_date * 1000);

  if (!compare || ((+new Date() - +authDate) / 1000 > 60)) {
      return false;
  }
  return true;
}


app.get('/telegram', (req, res) => {
  const userData = req.query;
  "7629198716:AAHPHr_ZQULHqlcUesmENzdxQa5zAKKEt4M"
  const botToken = "7629198716:AAHPHr_ZQULHqlcUesmENzdxQa5zAKKEt4M"
  //const secret_key = sha256(botToken)
  //res.send(validateUserData(userData))
  if(validateUserData(userData)){
    res.send("Data correct!");
  }else{
    res.send("Data incorrect!");
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