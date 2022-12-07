const express = require('express')
const bodyParser = require('body-parser')
const usersRouter = require('./routers/usersRouter')
const pcNpcRouter = require('./routers/pcNpcRouter')
const authRouter = require('./routers/authRouter')
const session = require('express-session')
var FileStore = require('session-file-store')(session);
const cors = require('cors')

const app = express()
const port = process.env.PORT || 443

app.use(express.json())
app.use(bodyParser.json());

console.log(`Environment (PROD if empty): ${process.env.SYMBAPI_ENV}`)

var fileStoreOptions = {};
if (process.env.SYMBAPI_ENV == 'DEV') {
  fileStoreOptions = { reapInterval: 30 }
} else {
  fileStoreOptions = { logFn: () => {} }
}

var maxAgeMult = 10
if (process.env.SYMBAPI_ENV == 'DEV') {
  maxAgeMult = 1/2
}

app.use(session({
    store: new FileStore(fileStoreOptions),
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: true,
    cookie: {
      secure: true,
      sameSite: 'none',
      httpOnly: true,
      maxAge: maxAgeMult * 60 * 60 * 1000
    }
  })
);

var origins = ['https://symbaroum.fr']
if (process.env.SYMBAPI_ENV == 'DEV') {
  origins.push('https://localhost:5500')
}

app.use(cors({
  origin: origins,
  methods: ['POST', 'GET', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type']
}));

app.enable('trust proxy');

app.get('/', function(req, res){

  res.send('SymbaTools API')
})

app.use('/auth', authRouter)
app.use('/users', usersRouter)
app.use('/json', pcNpcRouter)



const https = require("https");
const fs = require("fs");

var options = {}
if (process.env.SYMBAPI_ENV == 'DEV') {
  options = {
    key: fs.readFileSync('c:/data/server.key'),
    cert: fs.readFileSync('c:/data/server.crt'),
    passphrase: 'changeit'
  }
} else {
  options = {
    key: fs.readFileSync('/etc/letsencrypt/live/symbatools-api.tk/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/symbatools-api.tk/fullchain.pem')
  }
}

server = https.createServer(options, app);

server.listen(port, () => {
  
  console.log(`SymbaTools API is now listening on https on port ${port}`)
})

  
/*app.listen(port, () => {
  
  console.log(`SymbaTools API is now listening on port ${port}`)
})*/