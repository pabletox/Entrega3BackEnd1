const {productModel} = require('../models/productModel.js')

class ProductManagerDB {

    static async getProducts() {
        try {
            return await productModel.find().lean()
        } catch (error) {
            console.error("Error al obtener productos: ", error.message)
            throw new Error("No se pudieron obtener los productos")
        }
    }

    static async getProduct(id) {
        try {
            return await productModel.findOne({ id: id.toString() }).lean()
        } catch (error) {
            console.error("Error al obtener producto: ", error.message)
            throw new Error("No se pudieron obtener los productos")
        }
    }

    static async addProduct(product) {
        try {
            let id = 1
            const products = await productModel.find().lean()
            console.log(products )
            if(products.length > 0) {
                id = Math.max(...products.map(d => d.id)) + 1
            }
            product.id = id
            return await productModel.create(product)
        } catch (error) {
            console.error("Error al agregar producto: ", error.message)
            throw new Error("No se pudo agregar el producto")
        }
    }

    static async updateProduct(id, product) {
        try {
            return await productModel.findByIdAndUpdate(id, product, {new: true})  // {new: true} devuelve el documento actualizado
        } catch (error) {
            console.error("Error al actualizar producto: ", error.message)
            throw new Error("No se pudo actualizar el producto")
        }   
    }

    static async deleteProduct(id) {
        try {
            return await productModel.deleteOne({id: id.toString()})   
        }catch (error) {
            console.error("Error al eliminar producto: ", error.message)
            throw new Error("No se pudo eliminar el producto")
        }
    }

}

module.exports = ProductManagerDB
