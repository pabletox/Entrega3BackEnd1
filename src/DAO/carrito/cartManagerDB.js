const {cartModel} = require('../models/carModel.js')


class CartManagerDB {

    static async getcarts() {
        try{
            return await cartModel.find().lean()

        }catch(err){
            console.error("Error al obtener carritos: ", err.message)
            throw new Error("No se pudieron obtener los carritos")
        }
        
    }  

    static async getcart(cartId) {
    try{    
      
      let cart = await cartModel.findById(cartId).lean()
      return cart || null;  // Devuelve null si no lo encuentra

    }catch(err){
        console.error("Error al obtener carrito: ", err.message)
        throw new Error("No se pudieron obtener los carrito")
    }
    

  }


  //crea un carro vacio
  static async addCart() {
    try {
 
      let newCart = {  "products": [] }
      return await cartModel.create(newCart)
    } catch (err) {
      console.error("Error al agregar carrito: ", err.message)
      return null
    }
    
  }

  static async addProductToCart(cartId, productId, qty=1) { 
        try {
            
            let cart = await cartModel.findById(cartId)
            console.log('previa clg')
            console.log(cart)
            if(!cart){
                return console.error("Carrito no encontrado addProductToCart")
            }

            // Buscar si el producto ya está en el carrito
            const productIndex = cart.products.findIndex(p => p.product.toString()=== productId.toString());

            if(productIndex !== -1){
                console.log('producto existe')
                cart.products[productIndex].quantity += qty;
            }
            else{
                console.log('producto No existe')
                cart.products.push({product: productId, quantity: qty});
            }

            await cart.save(); 
            return cart;

            
        } catch (err) {
            console.error("Error al agregar producto al carrito: ", err.message)
        }
        
    }


    static async subtractProductToCart(cartId, productId, qty=1) { 
        try {
            
            let cart = await cartModel.findById(cartId)
            console.log('previa clg')
            console.log(cart)
            if(!cart){
                return console.error("Carrito no encontrado addProductToCart")
            }

            // Buscar si el producto ya está en el carrito
            const productIndex = cart.products.findIndex(p => p.product.toString()=== productId.toString());

            if(productIndex !== -1){
                console.log('producto existe')
                cart.products[productIndex].quantity -= qty;

                // Si la cantidad es 0 o menor, eliminar el producto del carrito
                if (cart.products[productIndex].quantity <= 0) {
                    cart.products.splice(productIndex, 1); // Elimina el producto
                }
            }
            else{
                return console.error('producto No existe')
            }

            await cart.save(); 
            return cart;

            
        } catch (err) {
            console.error("Error al agregar producto al carrito: ", err.message)
        }
        
    }


} 


module.exports ={CartManagerDB}