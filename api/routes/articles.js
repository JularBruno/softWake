
const helpers = require('./_helpers.js')
var url = require('url')
const express = require('express')
const router = express.Router()
const required = require('../middlewares/token')
import model from '../models/article'
import user from '../models/user'
import userArticle from '../models/userArticle'
import subscription from '../models/subscription'
import Debug from 'debug'
const debug = new Debug(`api/article`)

router.get('/', (req, res, next) => {
  return helpers.find(model, req, res)
})

const getArticles = (articles,user,subscription,usersArticles = []) => {
  debug(`getArticles user`, user);
  debug(`getArticles subscription`, subscription);
  //debug(`getArticles articles`, articles);
  debug(`getArticles usersArticles`, usersArticles);

  let subscriptionEnabled = false;
  console.log("subscription:",subscription);
  if(subscription){
    const sd = new Date(subscription.timestampUpdate);
    sd.setMonth(sd.getMonth()+1);
    const d = new Date();

    console.log("hoy:",d);
    console.log("sd:",sd);
    console.log("subscriptionEnabled:",d.getTime() <= sd.getTime());

    subscriptionEnabled = d.getTime() <= sd.getTime();
  }
  console.log("subscriptionEnabled:",subscriptionEnabled);

  let uasByIds = {};
  for(let ua of usersArticles){
    if(!uasByIds[ua.article]){
      uasByIds[ua.article] = ua;
    }
  }

  console.log("============================");
  console.log("uasByIds:",uasByIds);

  for(let article of articles){
    let locked = false;
    if(article.access =="SUBSCRIPTION"){
      if(subscription){
        locked = !subscriptionEnabled;
      } else {
        locked = true;
      }
    }
    // if(article.access =="PAYMENT"){
    //   console.log("uasByIds[article._id]:",uasByIds[article._id]);
    //   if(uasByIds[article._id])
    //     locked = false;
    //   else
    //     locked = true;
    // }
    article.locked = locked;
  }

  return articles;
}


router.get('/user/:userId', (req, res, next) => {

  let urlParts = url.parse(req.url, true);
  let queryParams = urlParts.query;
  debug('find queryParams: ', JSON.stringify(queryParams));

  let filter = {};

  if (queryParams._filters) {
    filter = JSON.parse(queryParams._filters);
    // let string = "1";
    // filter = { title: { $regex: string } };
  }

  let currentUser;
  let currentSubscription;

  let userId = req.params.userId;
  debug(`userId`, userId);

  if(userId == "-1"){
    model.find(filter)
      .then(articles => {
        res.status(200).json(
          getArticles(articles,currentUser,currentSubscription)
        );
      })
      .catch(error => {
        res.status(404).json({
          message: error.message || 'Ocurrio un error inesperado',
          error
        })
      })
  } else {
    user
      .findById(req.params.userId)
      .then(user => {
        debug(`find user`, user);
        if(user){
          currentUser = user;
        }
        return subscription.find({user:userId});
      })
      .then(subscriptions => {
        debug(`find subscription`, subscriptions);
        if(subscriptions.length > 0){
          currentSubscription = subscriptions[0];
        }
        console.log("about to get article " , JSON.stringify(filter))

        // ------ FILTERING ARTICLE ------
        return model.find(filter);
        
      })
      .then(articles => {
        filter.user = currentUser._id;
        // userArticle.find({user:currentUser._id})

        userArticle.find(filter)
        .then(usersArticles => {

          console.log("usersArticlesss", usersArticles)
          res.status(200).json(
            getArticles(articles,currentUser,currentSubscription,usersArticles)
          );
        });
      })
      .catch(error => {
        res.status(404).json({
          message: error.message || 'Ocurrio un error inesperado',
          error
        })
      })
  }
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
