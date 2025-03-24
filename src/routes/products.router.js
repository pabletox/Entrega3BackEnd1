const Router = require('express').Router
const ProductManagerDB = require('../DAO/productos/productManagerDB.js')
const {ProductManager} = require('../DAO/productos/productManager')
const router=Router()

const productosManager = new ProductManager()

//GET productos
router.get('/', async (req, res) => {
    try{
        const productos = await ProductManagerDB.getProducts()
      //  const productos = await productosManager.getProducts()
        res.setHeader('Content-Type','application/json');
        res.json(productos)
    }catch(err){
        console.error("Error en la API: ", err);
        res.status(500).json({ err: 'Error interno del servidor' })
    }
    
})

//get productos por id
router.get('/:id', async (req, res) => {
        const id = Number(req.params.id)

        if (!id){
            res.status(400).json({error: 'Id es requerido'})
            return
        }

        //validar si el id es un numero
        if (isNaN(id) || id < 1 ||!Number.isInteger(id)){
            res.status(400).json({error: 'Id debe ser Numero y positivo'})
            return
        }

        try{
            //const producto = await req.producManager.getProduct(id)
            //const producto = await productosManager.getProduct(id)
            const producto = await ProductManagerDB.getProduct(id)

            if(producto){
                res.json(producto)
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
    if(!producto.title || !producto.price || !producto.thumbnails||!producto.code||!producto.description||!producto.stock||!producto.category||!producto.status){
        return res.status(400).json({error: 'Todos los campos son requeridos'})
    }
    try{
        //const product = await req.producManager.getProducts()
        //const product = await productosManager.getProducts()
        const products = await ProductManagerDB.getProducts()
        const exist = products.find(p => p.title === producto.title)
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
    const producto = req.body

    try{
        //const product = await req.producManager.getProduct(id)
        const product = await productosManager.getProduct(id)
        if(!product){
            res.status(404).json({error: 'No se encontro el producto'})
        }else{
            const updatedProduct = await productosManager.updateProduct(id, producto)
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