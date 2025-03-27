const Router = require('express').Router
const {ProductManager} = require('../DAO/productos/productManager')
const {ProductManagerDB} = require('../DAO/productos/productManagerDB')
const router = Router()

const productosManager = new ProductManager()

router.get('/prueba', (req, res) => {
  res.render('ejemplo')
})


router.get('/realtimeproducts', async (req, res) => {
  try {
    const productos = await productosManager.getProducts()
    //const productos = await ProductManagerDB.getProducts()
    res.render('realTimeProducts', { productos })
  }
  catch (err) {
    console.error("Error en la API: ", err);
    res.status(500).json({ err: 'Error interno del servidor' })
  }
})

router.get('/', async (req, res) => {
    let {page} = req.query
    if(!page){
        page = 1
    }
    try {
      //const productos = await productosManager.getProducts()
      const productos = await ProductManagerDB.getProducts(page)
      //console.log(productos)
      res.render('home', { productos:productos.docs })
    }
    catch (err) {
      console.error("Error en la API: ", err);
      res.status(500).json({ err: 'Error interno del servidor' })
    }
  })

module.exports = router