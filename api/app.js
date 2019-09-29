import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import routes from './routes'
import http from 'http'
import multipart from 'connect-multiparty'

const cors = require('cors');

const https = require('https')
const fs = require('fs');

const app = express()
const server = http.Server(app)

const cert = fs.readFileSync('./certificate.crt');
const ca = fs.readFileSync('./ca_bundle.crt');
const key = fs.readFileSync('./private.key');

// // SDK de Mercado Pago
// const mercadopago = require ('mercadopago');
//
// // Agrega credenciales
// mercadopago.configure({
//  // access_token: 'APP_USR-4297521837416041-071123-f0e5264ee38cc56eb4256efa4aaccd41-423762400'
// 	access_token: 'TEST-1987933163722578-071123-0620c4d917127b582baa80ed661152fc-423762400'
// });
//
// let preference = {
// 	operation_type:"regular_payment",
// 	external_reference:"iddelcomprador",
//   items: [
//     {
//       title: 'Mi producto',
// 			description:'decripcion',
//       unit_price: 101,
//       quantity: 1,
//     }
//   ]
// };
//
// mercadopago.preferences.create(preference)
// .then(function(response){
// // Este valor reemplazará el string "$$init_point$$" en tu HTML
// 	console.log(response.body);
//   console.log(response.body.init_point);
// }).catch(function(error){
//   console.log(error);
// });
//


// var preapprovalPayment = {
// 	payer_email: 'jmoreno1976@gmail.com',
// 	back_url: 'http://www.google.com',
// 	reason: 'Monthly subscription to premium package',
// 	external_reference: 'OP-1234',
// 	auto_recurring: {
// 		frequency: 1,
// 		frequency_type: 'months',
// 		transaction_amount: 60,
// 		currency_id: 'ARS',
// 		// start_date: mercadopago.utils.date.now().add(1).toString(),
// 		// end_date: mercadopago.utils.date.now().add(3).toString()
// 	}
// };
//
//
// mercadopago.preapproval.create(preapprovalPayment)
// .then(function (data) {
// 	console.log(data);
// 	console.log(data.body.init_point);
// }).catch(function (error) {
// 	console.log(error);
// });

// var payment = {
// 	description: 'Buying a PS4',
// 	transaction_amount: 10500,
// 	payment_method_id: 'rapipago',
// };
//
// mercadopago.configurations.setAccessToken("TEST-1987933163722578-071123-0620c4d917127b582baa80ed661152fc-423762400");
//
// mercadopago.payment.create(payment).then(function (data) {
// 		console.log(data);
// }).catch(function (error) {
// 		console.log(error);
// });
//


let options = {
   cert: cert, // fs.readFileSync('./ssl/example.crt');
   ca: ca, // fs.readFileSync('./ssl/example.ca-bundle');
   key: key // fs.readFileSync('./ssl/example.key');
};

https.createServer(options, app)
.listen(4071);


app.use(function (req, res, next) {
	if (process.env.NODE_ENV && process.env.NODE_ENV == 'test') {
		req.settings = require('./test/config/settings')
	} else {
		req.settings = require('./config/settings')
	}
	return next()
})


// cache control error 304
app.disable('etag');

// CORS
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*')
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Authorization, Accept, x-access-token, x-accepted-format')
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
	next()
})

app.use(multipart({
	uploadDir: '/tmp/'
}))

app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.urlencoded({
	parameterLimit: 100000,
	limit: '50mb',
	extended: true
}));

app.use(cookieParser())


/*
 * @static content
 * app.use('/speechToText', express.static(path.join(__dirname, './static/speechToText.html')));
 * app.use('/files', express.static(path.join(__dirname, './static/files/')));
 */
app.use('/api', routes)

app.use('/', express.static(path.join(__dirname, '../adm/dist/')))
app.use('/files', express.static(path.join(__dirname, '../adm/files/')))

app.get('/*',  function(req, res) {
	res.sendFile('index.html', { root: '../adm/dist/' })
})

export {app, server}
