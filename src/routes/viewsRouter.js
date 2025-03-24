const Router = require('express').Router
const {ProductManager} = require('../DAO/productos/productManager')
const router = Router()

const productosManager = new ProductManager()

router.get('/prueba', (req, res) => {
  res.render('ejemplo')
})


router.get('/realtimeproducts', async (req, res) => {
  try {
    const productos = await productosManager.getProducts()
    res.render('realTimeProducts', { productos })
  }
  catch (err) {
    console.error("Error en la API: ", err);
    res.status(500).json({ err: 'Error interno del servidor' })
  }
})

router.get('/', async (req, res) => {
    try {
      const productos = await productosManager.getProducts()
      res.render('home', { productos })
    }
    catch (err) {
      console.error("Error en la API: ", err);
      res.status(500).json({ err: 'Error interno del servidor' })
    }
  })

module.exports = router