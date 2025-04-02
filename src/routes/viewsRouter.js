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
    }else{
        sort = {}
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
                          })
    }
    catch (err) {
      console.error("Error en la API: ", err);
      res.status(500).json({ err: 'Error interno del servidor' })
    }
  })

module.exports = router