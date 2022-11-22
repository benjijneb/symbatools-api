const express = require('express')
const bodyParser = require('body-parser')
const usersRouter = require('./routers/usersRouter')
const pcNpcRouter = require('./routers/pcNpcRouter')
const authRouter = require('./routers/authRouter')
const session = require('express-session')
var FileStore = require('session-file-store')(session);
const cors = require('cors')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(bodyParser.json());

console.log(`Environment (PROD if empty): ${process.env.SYMBAPI_ENV}`)

app.use(session({
    store: new FileStore((process.env.SYMBAPI_ENV == 'DEV') ? { logFn: () => {}, reapInterval: 30 } : {}),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: (process.env.SYMBAPI_ENV == 'DEV') ? 6000 : 36000000 }
  })
);

app.use(cors({ origin: ['http://127.0.0.1:5500', 'https://symbaroum.fr/'] }));

app.get('/', function(req, res){

  res.send('SymbaTools API')
})

app.use('/auth', authRouter)
app.use('/users', usersRouter)
app.use('/json', pcNpcRouter)

app.listen(port, () => {
  
  console.log(`SymbaTools is now listening on port ${port}`)
})