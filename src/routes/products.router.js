const Router = require('express').Router
const {ProductManagerDB} = require('../DAO/productos/productManagerDB.js')
const {ProductManager} = require('../DAO/productos/productManager')
const router=Router()
const mongoose = require('mongoose')

const productosManager = new ProductManager()

//GET productos
router.get('/', async (req, res) => {
    let {page, limit, sort, category, status} = req.query
    let sortText = ""
    let urlBase = `${req.protocol}://${req.get('host')}/api/products` 
    let urlPrevPage = urlBase
    let urlNextPage = urlBase
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
    try{
        let {docs:productos,  totalPages, hasPrevPage, hasNextPage, prevPage, nextPage} = await ProductManagerDB.getProducts(page, limit, sort, queryFilter)
      //  const productos = await productosManager.getProducts()

      if (hasPrevPage) {
        urlPrevPage += `?page=${prevPage}`
      } 
      
      if (hasNextPage) {
        urlNextPage += `?page=${nextPage}`
      } 
      if(limit){
        urlPrevPage += `&limit=${limit}`
        urlNextPage += `&limit=${limit}`
      }
      if(sort){
        urlPrevPage += `&sort=${sortText}`
        urlNextPage += `&sort=${sortText}`
      }
      if(category){
        urlPrevPage += `&category=${category}`
        urlNextPage += `&category=${category}`
      }
      if(status){

        urlPrevPage += `&status=${status}`
        urlNextPage += `&status=${status}`
      }

      if(!hasPrevPage){
        urlPrevPage = null
      }

      if(!hasNextPage){
        urlNextPage = null
      }

      if (!productos || productos.length === 0) {
        return res.status(404).json({error: 'No se encontraron productos'})
      }
        
        res.setHeader('Content-Type','application/json');
        res.status(200).json({
            productos,
            totalPages,
            hasPrevPage,
            hasNextPage,
            prevPage,
            nextPage,
            page, 
            urlPrevPage,
            urlNextPage
        })
    }catch(err){
        console.error("Error en la API: ", err);
        res.status(500).json({ err: 'Error interno del servidor' })
    }
    
})

//get productos por id
router.get('/:id', async (req, res) => {
    
    const id = req.params.id
    //validar id
     if (!mongoose.isValidObjectId(id)){
        return res.status(400).json({error: 'Id es requerido'})
     }


        try{
            //const producto = await req.producManager.getProduct(id)
            //const producto = await productosManager.getProduct(id)
            const producto = await ProductManagerDB.getProduct(id)

            if(producto){
                res.status(200).json(producto)
            }else{
                res.status(404).json({error: 'Producto no encontrado'})
            }
        }catch(err){
            console.error("Error en la API: ", err);
            res.status(500).json({ err: 'Error interno del servidor' })
        }
    
})

//POST para agregar producto
router.post('/', async (req, res) => {
    const producto = req.body
    //ver si existe el producto por title
    if(!producto.title || !producto.price || !producto.code||!producto.description||!producto.stock||!producto.category||!producto.status){
        return res.status(400).json({error: 'Todos los campos son requeridos'})
    }
    try{

        const exist = await ProductManagerDB.getProductByCode(producto.code)
        if(exist){
            
            return res.status(409).json({error: 'Producto ya existe'})
        }
        //sino lo agregamos
        //const newProduct = await req.producManager.addProduct(producto)
        //const newProduct = await productosManager.addProduct(producto)
        const newProduct = await ProductManagerDB.addProduct(producto)
        if(newProduct){
            req.io.emit('NuevoProducto', newProduct)
            res.status(201).json({
                message: "Producto agregado",
                product: newProduct
            })
            
        }else{
            res.status(400).json({error: 'No se pudo agregar el producto'})
        }
    }catch(err){
        console.error("Error en la API: ", err);
        res.status(500).json({ err: 'Error interno del servidor' })
    }
})

//put para actualizar producto
router.put('/:id', async (req, res) => {
    const id = req.params.id
    if (!mongoose.isValidObjectId(id)){
        return res.status(400).json({error: 'Id es requerido'})
    }
    const producto = req.body

    try{
        //const product = await req.producManager.getProduct(id)
        //const product = await productosManager.getProduct(id)
        const product = await ProductManagerDB.getProduct(id)
        if(!product){
            res.status(404).json({error: 'No se encontro el producto'})
        }else{
            const updatedProduct = await ProductManagerDB.updateProduct(id, producto)
            if(updatedProduct){
                req.io.emit('ActualizacionProducto', id)
                res.status(200).json({
                    message: "Producto Actualizado",
                    product: updatedProduct
                })

            }
        }
    }catch(err){
        console.error("Error en la API: ", err.message)
        res.status(500).json({ err: 'Error interno del servidor' })
    }


    
})

//delete para borrar producto
router.delete('/:id', async (req, res) => {
    const id = req.params.id
    try{
        //const product = await req.producManager.getProduct(id)
        //const product = await productosManager.getProduct(id)
        const product = await ProductManagerDB.getProduct(id)
        if(!product){
            return res.status(404).json({error: 'No se encontro el producto'})
        }

        //const deletedProduct = await productosManager.deleteProduct(id)
        const deletedProduct = await ProductManagerDB.deleteProduct(id)
        req.io.emit('ProductoEliminado', id); // Emitir evento para Socket.io
        res.status(200).json({message:'Producto Eliminado'})
    }catch(err){
        console.error("Error en la API: ", err.message)
        res.status(500).json({ err: 'Error interno del servidor' })
    }
})


module.exports = router