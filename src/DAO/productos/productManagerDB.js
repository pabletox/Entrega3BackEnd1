const {productModel} = require('../models/productModel.js')

class ProductManagerDB {

    static async getProducts(page=1) {
        try {
            //return await productModel.find().lean()
            return await productModel.paginate({}, {page, limit: 10, lean: true})
        } catch (error) {
            console.error("Error al obtener productos: ", error.message)
            throw new Error("No se pudieron obtener los productos")
        }
    }

    static async getProduct(id) {
        try {
            return await productModel.findById(id).lean()
        } catch (error) {
            console.error("Error al obtener producto: ", error.message)
            throw new Error("No se pudieron obtener los productos")
        }
    }

    static async addProduct(product) {
        try {
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

module.exports = {ProductManagerDB}
