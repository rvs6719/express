import express from 'express'
import { randomUUID } from 'node:crypto'
import cookieParser from 'cookie-parser'
import jwt from "jsonwebtoken"
//import sha256 from 'js-sha256'
import CryptoJS from 'crypto-js'
//import sha256 from 'node:crypto';
import {createHmac, createHash} from 'node:crypto'
//import sha256 from 'crypto-js/sha256';
const app = express()
const port = 80

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
  /*const keys = Object.keys(userData).sort();
  let str = '';
  for (const key in keys) {
      if (keys[key] !== 'hash') {
          str += keys[key] + '=' + userData[keys[key]];
          if (+key !== keys.length - 1) str += '\n';
      }
  }
  //const data_check_string = 'auth_date='+req.query.auth_date+'\nfirst_name='+req.query.first_name+'\nid='+req.query.id+'\nphoto_url='+req.query.photo_url+'\nusername='+req.query.username+'';
  const secret_key = sha256(botToken).digest();
  const hash1 = CryptoJS.HmacSHA256(str, secret_key).digest('hex');
  if (hash1 == userData.hash) {
    res.send("Data correct");
  }else{
    res.send("Data incorrect!");
  }
  */
  /*console.log(secret_key);
  const data_check_string = 'auth_date='+req.query.auth_date+'\nfirst_name='+req.query.first_name+'\nid='+req.query.id+'\nphoto_url='+req.query.photo_url+'\nusername='+req.query.username+'';
  const data_check_string1 = 'auth_date='+userData.auth_date+'\nfirst_name='+userData.first_name+'\nid='+userData.id+'\nphoto_url='+userData.photo_url+'\nusername='+userData.username+'';
  const hash1 = CryptoJS.HmacSHA256(data_check_string, secret_key).toString(CryptoJS.enc.Hex);
  console.log(userData);
  console.log(data_check_string1);
  console.log('1');
  console.log(data_check_string);
  console.log(sha256.hmac(secret_key, data_check_string));
  console.log(decimalToHexString(sha256.hmac(secret_key, data_check_string )));
  console.log(hash1);
  if (decimalToHexString(sha256.hmac(secret_key, data_check_string )) == req.query.hash) {
    res.send("Data correct");
    console.log(decimalToHexString(sha256.hmac(secret_key, data_check_string)));
    console.log(userData.hash);
  }else{
    res.send("Data incorrect!");
    console.log(decimalToHexString(sha256.hmac(secret_key, data_check_string)));
    console.log(userData.hash);
  }
  const userData1 = userData

  // Удаляем строку hash
  delete userData1.hash;

  // Преобразуем данные в массив строк формата key=value
  const sortedData = Object.entries(userData1)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}=${value}`);

  // Объединяем строки в одну с разделителем \n
  const result = sortedData.join('\n');

  console.log(result);
  if(result === data_check_string === data_check_string1){
    console.log("yes")
  }else{
    console.log("no")
  }
  const hash2 = CryptoJS.HmacSHA256(result, secret_key).toString(CryptoJS.enc.Hex);
  console.log(hash2);*/
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