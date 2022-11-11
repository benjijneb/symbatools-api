const express = require('express')
const bodyParser = require('body-parser')
const usersRouter = require('./routers/usersRouter')
const pcNpcRouter = require('./routers/pcNpcRouter')
const authRouter = require('./routers/authRouter')
const session = require('express-session')
const cors = require('cors')
const fs = require('fs')

const app = express()
const port = 3000

app.use(express.json())
app.use(bodyParser.json());

/*var corsOptions = {
  origin: '*'
}

app.use(cors(corsOptions));*/
app.use('/auth', authRouter)

app.get('/', function(req, res){
    fs.readFile('index.html',function (err, data){
      res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
      res.write(data);
      res.end();
  })
})

app.use('/users', usersRouter)
app.use('/json', pcNpcRouter)

app.listen(port, () => {
  
  console.log(`SymbaTools is now listening on port ${port}`)
})