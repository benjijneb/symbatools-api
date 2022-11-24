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

var fileStoreOptions = {};
if ((process.env.SYMBAPI_ENV == 'DEV')) {
  fileStoreOptions = { reapInterval: 30 }
} else {
  fileStoreOptions = { logFn: () => {} }
}

app.use(session({
    store: new FileStore(fileStoreOptions),
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    resave: true,
    cookie: { secure: true, sameSite: 'none', httpOnly: true }
  })
);

app.use(cors({
  origin: ['http://127.0.0.1:5500', 'https://symbaroum.fr'],
  methods: ['POST', 'GET', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Cookie', 'Set-Cookie']
}));

app.get('/', function(req, res){

  res.send('SymbaTools API')
})

app.use('/auth', authRouter)
app.use('/users', usersRouter)
app.use('/json', pcNpcRouter)

app.listen(port, () => {
  
  console.log(`SymbaTools is now listening on port ${port}`)
})