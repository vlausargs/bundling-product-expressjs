const express = require('express')
const router = express.Router()
const verified = require('./verifyToken')
const Bundle = require('../models/Bundle')
const Product = require('../models/Product')

router.get('/', verified, async(req, res) => {
    try {
        const bundles = await Bundle.find()

        res.json(bundles)
    } catch(e) {
        res.status(400).send({
            "message": "Bad Request" + e
        })
    }
})

router.post('/create', verified, async(req, res) => {
    const bundle = new Bundle({
        SKU: req.body.SKU,
        qty: req.body.qty,
        productID: req.body.productID,
        price: 0
    })


    let lenProduct = bundle.productID.length
    let lenQty = bundle.qty.length

    if (lenProduct != lenQty ){
        return res.status(400).send({
            "message": "Request not valid :|"
        })
    }

    for (let i = 0; i < lenProduct; i++) {
        const query = Product.where({SKU: bundle.productID[i]})
        query.findOne((err, product) => {
            if (err) {
                console.log(err)
                return res.status(400).send({
                    "message":"Bad Request " + err
                })
            }
            console.log(product)
            if (product) {
                if (product.stock < bundle.productID[i].qty) {
                    return res.status(400).send({
                        "message": "Not enough stock :("
                    })
                }
                else {
                    bundle.price += product.price
                }
            }
            else {
                return res.status(400).send({
                    "message": "Product not found :("
                })
            }

        })
    }

    bundle.save().then((data) => {
        return res.json(data)
    }).catch((err) => {
        console.log("error!")
        res.status(400).send({
            "message":"Bad Request "+err
        });
    })
    
})

router.post('/delete/:id',verified,async (req,res)=>{
    const bundle = Bundle.findById(req.params.id).then(obj =>{
        return res.json(obj)
    }).catch(err=>{
        console.log("error!")
        return res.status(400).send({"message":"Bad Request "+err});
    })
})

router.post('/update/:id',verified,async (req,res)=>{
    const bundle = Bundle.findById(req.params.id).then(obj =>{
        obj.SKU = req.body.SKU
        obj.name = req.body.name
        obj.stock = req.body.stock
        obj.price = req.body.price
        obj.weight = req.body.weight
        obj.UOM = req.body.UOM
        obj.save()
        .then(
            (data)=>{
                return res.json(data)
            }
        ).catch(err=>{
            console.log("error!")
            return res.status(400).send({"message":"Bad Request "+err});
        })
    }).catch(err=>{
        console.log("error!")
        return res.status(400).send({"message":"Bad Request "+err});
    })

})

module.exports = router
