const Router = require('express').Router
const {ProductManager} = require('../DAO/productos/productManager')
const {ProductManagerDB} = require('../DAO/productos/productManagerDB')
const {CartManagerDB} = require('../DAO/carrito/cartManagerDB')
const router = Router()
const mongoose = require('mongoose')
const { cartModel } = require('../DAO/models/carModel')

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
  try {
    const productos = await productosManager.getProducts()
    res.render('home', { productos })
  }
  catch (err) {
    console.error("Error en la API: ", err);
    res.status(500).json({ err: 'Error interno del servidor' })
  }
})

router.get('/products', async (req, res) => {
    let {page, limit, sort, category, status} = req.query
    let urlFirstPage = "?page=1"
    let urlPrevPage = ""
    let urlNextPage = ""
    let urlLastPage = ""
    let sortText = ""

    if(!page){
        page = 1
    }
    if(sort === 'asc'){
        sort = {price: 1}
        sortText = 'asc'
    }else if(sort === 'desc'){
        sort = {price: -1}
        sortText = 'desc'
    }
    // Construir el filtro de búsqueda
    let queryFilter = {};
    if (category) {
        queryFilter.category = category;
    }

    if (status !== undefined) {
      queryFilter.status = (status === "true"); 
    }

    try {
      //const productos = await productosManager.getProducts()
      let {docs:productos,  totalPages, hasPrevPage, hasNextPage, prevPage, nextPage} = await ProductManagerDB.getProducts(page, limit, sort, queryFilter)
      let showLastPage = true
      if (totalPages == page) {
        showLastPage = false
      }
      if (hasPrevPage) {
        urlPrevPage = `?page=${prevPage}`
      } else{
        urlPrevPage = `?page=${page}`
      }
      if (hasNextPage) {
        urlNextPage = `?page=${nextPage}`
      } else{
        urlNextPage = `?page=${totalPages}`
      }
      urlLastPage = `?page=${totalPages}`
      if(limit){
        urlFirstPage += `&limit=${limit}`
        urlPrevPage += `&limit=${limit}`
        urlNextPage += `&limit=${limit}`
        urlLastPage += `&limit=${limit}`
      }
      if(sort){
        urlFirstPage += `&sort=${sortText}`
        urlPrevPage += `&sort=${sortText}`
        urlNextPage += `&sort=${sortText}`
        urlLastPage += `&sort=${sortText}`
      }
      if(category){
        urlFirstPage += `&category=${category}`
        urlPrevPage += `&category=${category}`
        urlNextPage += `&category=${category}`
        urlLastPage += `&category=${category}`
      }
      if(status){
        urlFirstPage += `&status=${status}`
        urlPrevPage += `&status=${status}`
        urlNextPage += `&status=${status}`
        urlLastPage += `&status=${status}`
      }
      //console.log(urlPrevPage)
      let showFirstPage = true
      if (page == 1) {
        showFirstPage = false
      }
      

      res.render('index', { productos
                          , totalPages
                          , hasPrevPage
                          , hasNextPage
                          , prevPage
                          , nextPage 
                          , limit 
                          , sort
                          , showLastPage
                          , urlPrevPage
                          , urlNextPage
                          , urlFirstPage
                          , urlLastPage
                          , showFirstPage
                          })
    }
    catch (err) {
      console.error("Error en la API: ", err);
      res.status(500).json({ err: 'Error interno del servidor' })
    }
  })



router.get('/carts/:cid', async (req,res)=>{
    let cid = req.params.cid

     if (!mongoose.isValidObjectId(cid)){
        return res.status(400).json({error: 'Id no valido'})
      }
  
  
  
      try{
          const cart = await CartManagerDB.getcart(cid)
          // Extraer los productos con sus características
        const products = cart.products.map(productArray => ({
                                            title: productArray.product.title,
                                            price: productArray.product.price,
                                            code: productArray.product.code,
                                            description: productArray.product.description,
                                            quantity: productArray.quantity,
                                            stock: productArray.product.stock,
                                            totalProduct: productArray.product.price * productArray.quantity,
                                        }));
         // console.log(products)
         let totalFinal = 0
         products.forEach(product => {
            totalFinal += product.totalProduct
         })
  
          if(cart){
            res.render('cartview', {cid, products, totalFinal})
          }else{
              res.status(404).json({error: 'Carrito no encontrado get'})
          }
      }catch(err){
          console.error("Error en la API: ", err);
          res.status(500).json({ err: 'Error interno del servidor' })
      }

  

})

module.exports = router