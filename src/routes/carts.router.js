const Router = require('express').Router
const {CartManager} = require('../DAO/carrito/cartManager')
const {CartManagerDB} = require('../DAO/carrito/cartManagerDB')
const {ProductManager} = require('../DAO/productos/productManager')
const {ProductManagerDB} = require('../DAO/productos/productManagerDB')
const router=Router()
const mongoose = require('mongoose')

const carritoManager = new CartManager()
const productosManager = new ProductManager()


//get para carrito por id
router.get('/:cid', async (req, res) => {

    const id = req.params.cid
    //validar id
    if (!mongoose.isValidObjectId(id)){
    return res.status(400).json({error: 'Id no valido'})
    }



    try{
        const cart = await CartManagerDB.getcart(id)

        if(cart){
            res.json(cart)
        }else{
            res.status(404).json({error: 'Carrito no encontrado get'})
        }
    }catch(err){
        console.error("Error en la API: ", err);
        res.status(500).json({ err: 'Error interno del servidor' })
    }


})

//post crea carro vacio
router.post('/', async (req, res) => {
    const newCart = await CartManagerDB.addCart()
    if(newCart){
        req.io.emit('NuevoCarrito', newCart)
        res.status(201).json(newCart)
    }else{
        res.status(400).json({error: 'No se pudo agregar el carrito'})
    }
})

//post para agregar producto al carrito
router.post('/:cid/products/:pid', async (req, res) => {

    const cartId = req.params.cid
    if (!mongoose.isValidObjectId(cartId)){
        return res.status(400).json({error: 'Id de cart no valido'})
    }

    //revisar si carrito existe
    //const cart = await req.cartManager.getcart(cartId)
    const cart = await CartManagerDB.getcart(cartId)
    if(!cart){
        return res.status(204).json({error: 'Carrito no encontrado post'})
        
    }
    //revisar si producto existe
    const productId = req.params.pid
    if (!mongoose.isValidObjectId(productId)){
        return res.status(400).json({error: 'Id de producto no valido'})
    }

    const product = await ProductManagerDB.getProduct(productId)
    if(!product){
        return res.status(204).json({error: 'Producto no encontrado'})
        
    }
    //agregar producto al carrito
    //await req.cartManager.addProductToCart(cartId, productId)
   // await carritoManager.addProductToCart(cartId, productId)
    await CartManagerDB.addProductToCart(cartId, productId)

    //revisar si se agrego el producto
    const updatedCart = await CartManagerDB.getcart(cartId)
   // console.log(updatedCart)
    if(!updatedCart){
        res.status(204).json({error: 'Producto no agregado al carrito'})
    }else{
        req.io.emit('ProductoCarrito', updatedCart)
        res.status(201).json({message: 'Producto agregado al carrito'})
    }
})



router.delete('/:cid/products/:pid', async (req, res) => {

    const cartId = req.params.cid
    if (!mongoose.isValidObjectId(cartId)){
        return res.status(400).json({error: 'Id de cart no valido'})
    }

    //revisar si carrito existe
    //const cart = await req.cartManager.getcart(cartId)
    const cart = await CartManagerDB.getcart(cartId)
    if(!cart){
        return res.status(204).json({error: 'Carrito no encontrado post'})
        
    }
    //revisar si producto existe
    const productId = req.params.pid
    if (!mongoose.isValidObjectId(productId)){
        return res.status(400).json({error: 'Id de producto no valido'})
    }

    const product = await ProductManagerDB.getProduct(productId)
    if(!product){
        return res.status(204).json({error: 'Producto no encontrado'})
        
    }
    //resta producto al carrito
    await CartManagerDB.subtractProductToCart(cartId, productId)

    //revisar si se agrego el producto
    const updatedCart = await CartManagerDB.getcart(cartId)
   // console.log(updatedCart)
    if(!updatedCart){
        res.status(204).json({error: 'Producto no restado al carrito'})
    }else{
        req.io.emit('ProductoCarrito', updatedCart)
        res.status(201).json({message: 'Producto restado al carrito'})
    }


})



module.exports = router