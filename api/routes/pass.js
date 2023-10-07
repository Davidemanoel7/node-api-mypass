const express = require('express')

const router = express.Router()

//não usar /pass, pois em app.js já é referenciado.
// caso use, o end-point seria: /pass/pass/
router.get('/', (req, res, next) => {
    res.status(200).json({
        massage: 'Request(GET) to /pass/'
    })    
})

router.post('/', (req, res, next) => {
    const pass = {
        productId: req.body.productId,
        quantity: req.body.quantity,
    }
    res.status(201).json({
        massage: 'Request(POST) to /pass/',
        createdpass: pass
    })
})

router.get('/:passId', (req, res, next) => {
    res.status(200).json({
        massage: 'Request(GET) to /pass/id/',
        passId: req.params.passId,
    })
})

router.delete('/:passId', (req, res, next) => {
    res.status(200).json({
        message: 'Request(DELETE) to /pass/id',
        passId: req.params.passId,
    })
})

module.exports = router