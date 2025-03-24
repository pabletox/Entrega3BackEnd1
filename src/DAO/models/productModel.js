const mongoose = require('mongoose')


const productSchema = new mongoose.Schema(
    {
    id: String,
    title: String,
    description: String,
    code: {type:String, 
           unique: true, 
           required: true 
        },
    price: Number,
    status: String,
    stock: {type: Number, 
            default: 0
        },
    category: String,
    thumbnail: String
    },
    {
        timestamps: true
    }
)

const productModel = mongoose.model('products', productSchema)

module.exports = {productModel}