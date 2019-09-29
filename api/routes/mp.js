const helpers = require('./_helpers.js')
const express = require('express')
const router = express.Router()
const required = require('../middlewares/token')
import subscription from '../models/subscription'
import transaction from '../models/transaction'
import userArticle from '../models/userArticle'
import settingModel from '../models/setting'

import Debug from 'debug'
const debug = new Debug(`api/mp`)
const url = require('url');

import settings from '../config/settings';
const mercadopago = require ('mercadopago');

// Agrega credenciales
mercadopago.configure({
	access_token: settings.mp[settings.mp.env].accessToken
});

router.post('/article/initPoint', (req, res, next) => {

	debug(req.body);

  let preference = {
  	external_reference:req.body.id + "|" + req.body.article.id,
    items: [
      {
        title: req.body.article.title,
  			description:req.body.article.title,
        unit_price: req.body.article.price,
        quantity: 1,
      }
    ]
  };

  mercadopago.preferences.create(preference)
  .then(function(response){
  	console.log(response.body);
    // console.log(response.body.init_point);
    res.status(200).json({ initPoint:response.body.init_point });
		//res.status(200).json({ initPoint:"https://www.mercadopago.com/mla/debits/new?preapproval_plan_id=e444083629524a329a667e13e99dc631 "});
  }).catch(function(error){
    res.status(400).json({ error: error.message||'No se puede obtener el link de pago' });
  });


})

router.post('/subscription/initPoint', (req, res, next) => {

	let unitPrice = 0;

	settingModel.find()
	.then( prSettings => {
		let pr = prSettings[0];

		console.log("asd" + pr)

		unitPrice= pr.subscription
	})
		.then(() => {
			debug(req.body);

			console.log(unitPrice)

			let preference = {
				external_reference:req.body.id + "|" + "subscription",
				items: [
					{
					title: 'Suscripcion mensual',
					description:'Suscripcion mensual',
			// ----------------- PRICE OF SUBSCRIPTION -----------------
					unit_price: unitPrice,
					quantity: 1,
					}
				]
			};

			mercadopago.preferences.create(preference)
			.then(function(response){
				console.log(response.body);
				// console.log(response.body.init_point);
				res.status(200).json({ initPoint:response.body.init_point });
				//res.status(200).json({ initPoint:"https://www.mercadopago.com/mla/debits/new?preapproval_plan_id=e444083629524a329a667e13e99dc631 "});
			}).catch(function(error){
				res.status(400).json({ error: error.message||'No se puede obtener el link de pago' });
			});
		})

})


router.post('/ipn', (req, res, next) => {

  debug("MP IPN 5----");
  console.log(req.body);

	if(req.body.type == "payment"){
		let userId;
		let articleId;
		let subscriptionId;
		let mpPayment;

		mercadopago.payment.get(req.body.data.id)
    // mercadopago.payment.get("20398746")
		.then((response) => {
			mpPayment = response;
		  console.log(response);

			console.log(response.body.status);

			if(response.body.status == "approved"){
				console.log(response.body.external_reference);
				let datas = response.body.external_reference.split("|");

				userId = datas[0];

				if(datas[1] == "subscription"){

					subscription.findOne({user:userId})
					.then(sub => {
						console.log("sub:",sub);
						if(sub){
							sub.timestampUpdate = Date.now();
							subscriptionId = sub._id;
							return subscription.update({ _id: sub._id }, sub)
						} else {
							sub = {user:userId};
							return subscription.create(sub)
						}

					})
					.then(subRet => {
						console.log("subRet:",subRet);

						if(subRet._id) subscriptionId = subRet._id;

						let tx = {};
						tx.user = userId;
						tx.price = mpPayment.body.transaction_amount;
						tx.subscription = subscriptionId;
						tx.mpPayment = mpPayment;

						return transaction.create(tx);

					})
					.catch((error) => {
					  console.log('An error ocurred: ' + error.message);
					})
					.then(() => {
						res.sendStatus(200);
					})

				} else {
					articleId = datas[1];

					let tx = {};
					tx.user = userId;
					tx.price = mpPayment.body.transaction_amount;
					tx.article = articleId;
					tx.mpPayment = mpPayment;

					transaction.create(tx)
					.then(txRet => {
						console.log("txRet:",txRet);

						let ua = {};
						ua.user = userId;
						ua.article = articleId;
						ua.like = false;
						ua.payed = true;

						return userArticle.create(ua);
					})
					.then(uaRet => {
						console.log("uaRet:",uaRet);
					})
					.catch((error) => {
					  console.log('An error ocurred: ' + error.message);
					})
					.then(() => {
						res.sendStatus(200);
					})

				}
			} else {
				res.sendStatus(200);
			}
		})
	} else {
		res.sendStatus(200);
	}

})


/*
router.post('/ipn', (req, res, next) => {

  debug("MP IPN 5----");
  console.log(req.body);


	//mercadopago.payment.get(req.body.data.id).then(function (response) {
	mercadopago.payment.get("20398746")
	.then((response) => {
	  //console.log(response);

		console.log(response.body.external_reference);
		console.log(response.body.status);

		let datas = response.body.external_reference.split("|");

		user.findById(datas[0])
			.then(u => {
				console.log(u);
			})
			.catch(e => {
				console.log('An error ocurred: ' + (e.message || "Error al buscar el usuario:" + data[0]));
			})
			.then(() => {
				res.sendStatus(200);
			})


	}).catch((error) => {
	  console.log('An error ocurred: ' + error.message);
		res.sendStatus(200);
	});


})

*/

module.exports = router
