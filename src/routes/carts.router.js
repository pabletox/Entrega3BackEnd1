const Router = require('express').Router
const {CartManager} = require('../DAO/carrito/cartManager')
const {ProductManager} = require('../DAO/productos/productManager')
const router=Router()

const carritoManager = new CartManager()
const productosManager = new ProductManager()


//get para carrito por id
router.get('/:cid', async (req, res) => {

    const id = Number(req.params.cid)

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
        //const cart = await req.cartManager.getcart(id)
        const cart = await carritoManager.getcart(id)

        if(cart){
            res.json(cart)
        }else{
            res.status(404).json({error: 'Carrito no encontrado'})
        }
    }catch(err){
        console.error("Error en la API: ", err);
        res.status(500).json({ err: 'Error interno del servidor' })
    }


})

//post crea carro vacio
router.post('/', async (req, res) => {
    //const newCart = await req.cartManager.addCart()
    const newCart = await carritoManager.addCart()
    if(newCart){
        req.io.emit('NuevoCarrito', newCart)
        res.status(201).json(newCart)
    }else{
        res.status(400).json({error: 'No se pudo agregar el carrito'})
    }
})

//post para agregar producto al carrito
router.post('/:cid/products/:pid', async (req, res) => {
    const cartId = Number(req.params.cid)

    if (!cartId){
        res.status(400).json({error: 'Id del cart es requerido'})
        return
    }

    //validar si el id es un numero
    if (isNaN(cartId) || cartId < 1 ||!Number.isInteger(cartId)){
        res.status(400).json({error: 'Id debe ser Numero y positivo'})
        return
    }

    //revisar si carrito existe
    //const cart = await req.cartManager.getcart(cartId)
    const cart = await carritoManager.getcart(cartId)
    if(!cart){
        res.status(204).json({error: 'Carrito no encontrado'})
        return
    }
    //revisar si producto existe
    const productId = Number(req.params.pid)
    if (!productId){
        res.status(400).json({error: 'Id del producto es requerido'})
        return
    }
    //validar si el id es un numero
    if (isNaN(productId) || productId < 1 ||!Number.isInteger(productId)){
        res.status(400).json({error: 'Id debe ser Numero y positivo'})
        return
    }
    //const product = await req.producManager.getProduct(productId)
    const product = await productosManager.getProduct(productId)
    if(!product){
        res.status(204).json({error: 'Producto no encontrado'})
        return
    }
    //agregar producto al carrito
    //await req.cartManager.addProductToCart(cartId, productId)
    await carritoManager.addProductToCart(cartId, productId)
    //revisar si se agrego el producto
    const updatedCart = await carritoManager.getcart(cartId)
    if(!updatedCart){
        res.status(204).json({error: 'Producto no agregado al carrito'})
    }else{
        req.io.emit('ProductoCarrito', updatedCart)
        res.status(201).json({message: 'Producto agregado al carrito'})
    }
})


module.exports = router