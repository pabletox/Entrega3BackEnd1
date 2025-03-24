const express = require('express')
const routerProducts = require('./routes/products.router.js')
const routerCarts = require('./routes/carts.router.js')
const {engine}  = require('express-handlebars')
const viewRouter = require('./routes/viewsRouter.js')
const {Server} = require('socket.io')
const {conectDB} = require('./connDB.js')
const {config} = require('./config/config.js')



const app = express()
const PORT = config.PORT
let io =undefined

//Midelware para poder trabajar con datos JSON
app.use(express.json())
app.use(express.urlencoded({extended: true}))

//Midelware para archivos estaticos
app.use(express.static('./src/public'))

//configuracion handlebars
app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
app.set('views', './src/views')

//las rutas de la API
app.use('/api/products'
        ,(req,res,next)=>{
            req.io=io
            next()
        }
        ,routerProducts)
app.use('/api/carts'
        ,(req,res,next)=>{
            req.io=io
            next()
        }, routerCarts)

//las rutas de handlebars
app.use('/', viewRouter)



const serverhttp = app.listen(PORT, () => {//server http
    console.log(`Server is running on port ${PORT}`)
})

io = new Server(serverhttp) // server websocket sobre http

conectDB(config.MONGO_URL,config.DB_NAME)



