import path from 'path'

const settings = {
	token      : {
		secret:     'ts$s38*jsjmjnT1',
		expires:    '1d', // expires in 24 hours
		noexpires:  '100y', // expires in 100 years
	},
	baseUrl    : process.env.BASE_URL || 'http://localhost',
	uploadDir  : process.env.UPLOAD_DIR || '/tmp',
	imagesDir  : process.env.IMAGES_DIR || '../adm/files/',
	url        : function() {
		return this.baseUrl + ':' + this.port
	},
	path       : path.normalize(path.join(__dirname, '..')),
	port       : process.env.NODE_PORT || 3071,
	database   : {
		logging  : 'console.log',
		timezone : '-03:00',
		host     : 'localhost',
		name     : 'testingIonic'
	},
	pagging    : {
		itemsPerPage  : 10
	},
	pn    		 : {
		android  : {
			key : "AAAAodkUsTQ:APA91bH10qyc5oey2_-I12Ad8PLc85xynNlgiJN4BCqRyn1fJSh57U41DP6pfST39CERLcp7Jr1ZdeQP-ODy2eRE0Vt8eDePmob7hLaRKbEa02eKQnPTanCBZVxQh7Z55kf6HyNjP-AX"
		},
		type : {
			"1":"Notificacion de SOS"
		}
	},
	mp : {
		env : "dev",
		prod  : {
			accessToken : "APP_USR-4297521837416041-071123-f0e5264ee38cc56eb4256efa4aaccd41-423762400"
		},
		dev : {
			accessToken : "TEST-1987933163722578-071123-0620c4d917127b582baa80ed661152fc-423762400"
		}
	}
}


module.exports = settings;
