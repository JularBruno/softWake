
const helpers = require('./_helpers.js')
const express = require('express')
const router = express.Router()
const required = require('../middlewares/token')
import model from '../models/notification'
import Debug from 'debug'
const debug = new Debug(`api/notification`)

router.get('/', (req, res, next) => {

  let sort =[['timestamp', -1]];

  model
    .find({})
    // .select(select)
    // .populate(populates || [])
    .sort(sort)
    .then(find => {
      debug(`find result`, find);
      res.status(200).json(find);
    })
    .catch(error => {
      res.status(404).json({
        message: error.message || 'Ocurrio un error inesperado',
        error
      })
    })
})


// filter notification by user Id
router.get('/user/:id', (req, res, next) => {

  let sort = [['timestamp', -1]];

  const userId = req.params.id

  let notificationToResponse = [];

  model
    .find({})
    // .select(select)
    // .populate(populates || [])
    .sort(sort)
    .then(find => {
      debug(`find result`, find);
      for(let i of find){
        console.log("i ------ ", i)
        console.log("i.directedTo ", i.directedTo)
        console.log("i.directedTo.length ", i.directedTo.length)

        if (i.directedTo.length <= 0 || i.directedTo[0] == -1 ){
          console.log("USER TO GET NOTIFICATION ", i)
          notificationToResponse.push(
            new Promise((resolve) => {
              resolve(i);
            })
          )
        } else {
          for (let o of i.directedTo) {
            console.log("o ------- ", o)

            if (o.id == userId) {
              console.log("USER TO GET NOTIFICATION ", i)
              // res.status(200).json(i);
              notificationToResponse.push(
                new Promise((resolve) => {
                  resolve(i);
                })
              )
            }
          }
        }
      }
      Promise.all(notificationToResponse)
        .then((results) => {
          console.log("All done", results);
          res.status(202).json(results)
        })
        .catch((e) => {
          console.log(e)
        });

    })
    .catch(error => {
      res.status(404).json({
        message: error.message || 'Ocurrio un error inesperado',
        error
      })
    })
})

router.get('/:id', (req, res, next) => {
  return helpers.findById(model, req, res)
})

router.post('/', (req, res, next) => {
  return helpers.save(model, req, res)
})

router.put('/:id', (req, res, next) => {
  return helpers.findByIdAndUpdate(model, req, res);
})

router.delete('/all', (req, res, next) => {
  return helpers.deleteAll(model, req, res)
})

router.delete('/:id', (req, res, next) => {
  return helpers.delete(model, req, res)
})

module.exports = router
