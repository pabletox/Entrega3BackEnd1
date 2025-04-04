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

    const cid = req.params.cid
    //validar id
    if (!mongoose.isValidObjectId(cid)){
    return res.status(400).json({error: 'Id no valido'})
    }



    try{
        const cart = await CartManagerDB.getcart(cid)

        if(cart){
            res.status(200).json(cart)
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
    const newCart = await CartManagerDB.addCart()
    if(newCart){
        req.io.emit('NuevoCarrito', newCart)
        res.status(201).json(newCart)
    }else{
        res.status(400).json({error: 'No se pudo agregar el carrito'})
    }
})

//post para agregar producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {

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
        return res.status(404).json({error: 'Producto no encontrado'})
        
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



router.delete('/:cid/product/:pid', async (req, res) => {

    const cartId = req.params.cid
    if (!mongoose.isValidObjectId(cartId)){
        return res.status(400).json({error: 'Id de cart no valido'})
    }

    //revisar si carrito existe
    //const cart = await req.cartManager.getcart(cartId)
    const cart = await CartManagerDB.getcart(cartId)
    if(!cart){
        return res.status(404).json({error: 'Carrito no encontrado'})
        
    }
    //revisar si producto existe
    const productId = req.params.pid
    if (!mongoose.isValidObjectId(productId)){
        return res.status(400).json({error: 'Id de producto no valido'})
    }

    const product = await ProductManagerDB.getProduct(productId)
    if(!product){
        return res.status(404).json({error: 'Producto no encontrado'})
        
    }

    //verificar si el producto esta en el carrito
    const productInCart = cart.products.find(p => p.product._id.toString() === productId.toString())
    if(!productInCart){

        return res.status(404).json({error: 'no existe el producto en el carrito'})
        
    }
    //eliminar producto del carrito
    await CartManagerDB.deleteProductToCart(cartId, productId)

    //revisar si se agrego el producto
    const updatedCart = await CartManagerDB.getcart(cartId)
    if(!updatedCart){
        res.status(400).json({error: 'Producto no eliminado al carrito'})
    }else{
        req.io.emit('ProductoCarrito', updatedCart)
        res.status(200).json({message: 'Producto eliminado al carrito'})
    }


})

router.delete('/:cid',async (req, res) => {
    const cartId = req.params.cid
    if (!mongoose.isValidObjectId(cartId)){
        return res.status(400).json({error: 'Id de cart no valido'})
    }

    //revisar si carrito existe
    //const cart = await req.cartManager.getcart(cartId)
    const cart = await CartManagerDB.getcart(cartId)
    if(!cart){
        return res.status(404).json({error: 'Carrito no encontrado'})
        
    }
    

    await CartManagerDB.deleteAllProducts(cartId)
    const updatedCart = await CartManagerDB.getcart(cartId)
    if(!updatedCart){
        res.status(400).json({error: 'Productos no eliminados del carrito'})
    }else{
        req.io.emit('ProductoCarrito', updatedCart)
        res.status(200).json({message: 'Productos eliminados del carrito'})
    }


})

//actualiza el carrito con un array de productos
router.put('/:cid', async (req, res) => {
    const cartId = req.params.cid
    if (!mongoose.isValidObjectId(cartId)){
        return res.status(400).json({error: 'Id de cart no valido'})
    }

    //revisar si carrito existe
    //const cart = await req.cartManager.getcart(cartId)
    const cart = await CartManagerDB.getcart(cartId)
    if(!cart){
        return res.status(404).json({error: 'Carrito no encontrado'})
        
    }
    
    const products = req.body.products
    if(!products || products.length === 0){
        return res.status(400).json({error: 'No se enviaron productos'})
        
    }

    //revisar si los productos existen
    for (const product of products) {
        const productId = product.product
        if (!mongoose.isValidObjectId(productId)){
            return res.status(400).json({error: `Id ${productId} de producto no valido`})
        }

        const productDB = await ProductManagerDB.getProduct(productId)
        if(!productDB){
            return res.status(404).json({error: `Id ${productId} de Producto no encontrado`})
            
        }
    }

    await CartManagerDB.updateCart(cartId, products)

    const updatedCart = await CartManagerDB.getcart(cartId)
    if(!updatedCart){
        res.status(400).json({error: 'Productos no actualizados del carrito'})
    }else{
        req.io.emit('ProductoCarrito', updatedCart)
        res.status(201).json({message: 'Productos actualizados del carrito'})
    }

})

//actualiza la cantidad de un producto en el carrito
router.put('/:cid/product/:pid', async (req, res) => {
    const cartId = req.params.cid
    if (!mongoose.isValidObjectId(cartId)){
        return res.status(400).json({error: 'Id de cart no valido'})
    }

    //revisar si carrito existe
    //const cart = await req.cartManager.getcart(cartId)
    const cart = await CartManagerDB.getcart(cartId)
    if(!cart){
        return res.status(404).json({error: 'Carrito no encontrado'})
        
    }
    //revisar si producto existe
    const productId = req.params.pid
    if (!mongoose.isValidObjectId(productId)){
        return res.status(400).json({error: 'Id de producto no valido'})
    }

    const product = await ProductManagerDB.getProduct(productId)
    if(!product){
        return res.status(404).json({error: 'Producto no encontrado'})
        
    }

    //verificar si el producto esta en el carrito
    const productInCart = cart.products.find(p => p.product._id.toString() === productId.toString())
    if(!productInCart){

        return res.status(404).json({error: 'no existe el producto en el carrito'})
        
    }
    
    const qty = req.body.quantity
    if(!qty || qty <= 0){
        return res.status(400).json({error: 'No se envio cantidad valida'})
        
    }

    
    await CartManagerDB.updateQuantityProductCart(cartId, productId, qty)

    const updatedCart = await CartManagerDB.getcart(cartId)
    if(!updatedCart){
        res.status(400).json({error: 'Productos no actualizados del carrito'})
    }else{
        req.io.emit('ProductoCarrito', updatedCart)
        res.status(201).json({message: 'Cantidad de productos actualizada del carrito'})
    }


})


module.exports = router