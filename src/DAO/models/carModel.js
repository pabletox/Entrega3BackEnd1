const mongoose = require('mongoose')


const cartSchema = new mongoose.Schema(
    {
    
        products:{
            type:[
                    {
                        product: {type: mongoose.Types.ObjectId, 
                                ref: 'products'
                                },
                        quantity: Number
                    }
                ]
        }
    
    },
    {
        timestamps: true
    }
)

const cartModel = mongoose.model('carts', cartSchema)

module.exports = {cartModel}