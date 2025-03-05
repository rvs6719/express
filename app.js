import express from 'express'
const app = express()
const port = 3000

app.use(express.static('public'));


app.get('/', (req, res) => {
  res.sendFile('autorization.html',  {root: "pages"});
})

app.get('/second', (req, res) => {
  res.sendFile('second_page.html',  {root: "pages"});
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})