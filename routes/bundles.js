const express = require('express')
const router = express.Router()
const verified = require('./verifyToken')
const Bundle = require('../models/Bundle')
const Product = require('../models/Product')

router.get('/', verified, async (req, res) => {
    try {
        let bundles = await Bundle.find()

        for (let index = 0; index < bundles.length; index++) {
            var bundle = bundles[index].toObject();
            bundle.bundlingStock = 0 
            for (let i = 0; i < bundle.productID.length; i++) {
                const product = await  Product.find( { SKU: bundle.productID[i] } )
               
                // console.log(product)
                if (product) {
                    if (bundle.bundlingStock !== 0 )bundle.bundlingStock = Math.min(bundle.bundlingStock, (product[0].stock / bundle.qty[i])) 
                    else bundle.bundlingStock = (product[0].stock / bundle.qty[i])
                    console.log(bundle.bundlingStock)
                }
                bundles[index] = bundle
            }
            // return bundle;


        }
        res.json(bundles)
    } catch (e) {
        res.status(400).send({
            "message": "Bad Request" + e
        })
    }
})

router.post('/create', verified, async (req, res) => {
    const bundle = new Bundle({
        SKU: req.body.SKU,
        qty: req.body.qty,
        productID: req.body.productID,
        price: 0
    })


    let lenProduct = bundle.productID.length
    let lenQty = bundle.qty.length

    if (lenProduct != lenQty) {
        return res.status(400).send({
            "message": "Request not valid :|"
        })
    }

    for (let i = 0; i < lenProduct; i++) {
        const query = Product.where({ SKU: bundle.productID[i] })
        query.findOne((err, product) => {
            if (err) {
                console.log(err)
                return res.status(400).send({
                    "message": "Bad Request " + err
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
                    bundle.price += (product.price * bundle.qty[i])
                    console.log(bundle)
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
            "message": "Bad Request " + err
        });
    })

})

router.post('/delete/:id', verified, async (req, res) => {
    const bundle = Bundle.findById(req.params.id).then(obj => {
        return res.json(obj)
    }).catch(err => {
        console.log("error!")
        return res.status(400).send({ "message": "Bad Request " + err });
    })
})

router.post('/update/:id', verified, async (req, res) => {
    const bundle = Bundle.findById(req.params.id).then(obj => {
        obj.SKU = req.body.SKU
        obj.name = req.body.name
        obj.stock = req.body.stock
        obj.price = req.body.price
        obj.weight = req.body.weight
        obj.UOM = req.body.UOM
        obj.save()
            .then(
                (data) => {
                    return res.json(data)
                }
            ).catch(err => {
                console.log("error!")
                return res.status(400).send({ "message": "Bad Request " + err });
            })
    }).catch(err => {
        console.log("error!")
        return res.status(400).send({ "message": "Bad Request " + err });
    })

})

module.exports = router
