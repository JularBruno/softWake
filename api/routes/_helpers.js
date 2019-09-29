var url = require('url');
var fs = require('fs');
var _ = require('lodash');
var moment = require('moment');
const uuid = require('uuid');
import jwt from 'jsonwebtoken';
import Debug from 'debug'
import settings from '../config/settings';
// import achievement from '../models/achievement';
// import userAchievement from '../models/userAchievement';
// import {info} from "easyimage";
// import {thumbnail} from "easyimage";


const debug = new Debug('api/_helpers/')

// **** TOKEN  ****

const createToken = async  (user) => {
  try {
    debug('inside createtoken:', user);
    const token = jwt.sign({
      user
    }, settings.token.secret)
    return Promise.resolve(token);
  } catch (error) {
    return Promise.reject(error);
  }
}

// **** TOKEN  ****


//const PushNotifications = require('node-pushnotifications');
const FCM = require('fcm-node');
// const push = new PushNotifications(settings);
// const registrationIds = [];
//registrationIds.push('c03w687LI3M:APA91bH4cMHIxXjJX0qtgVo90bLQz05YF858UkaVxdHPUltno34ihMWWt5kaiaf8dQunFJ-iw_Ll9PQdj4CncxeDQR2BlOhUQQMOkC74q9RYud5r01_t2kbaIRJ-UiZ4Z2aAhizTTa3U');
//registrationIds.push('c03w687LI3M:APA91bH4cMHIxXjJX0qtgVo90bLQz05YF858UkaVxdHPUltno34ihMWWt5kaiaf8dQunFJ-iw_Ll9PQdj4CncxeDQR2BlOhUQQMOkC74q9RYud5r01_t2kbaIRJ-UiZ4Z2aAhizTTa3U');


module.exports = {

  toMysqlDate: function (date) {
    return moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD');
  },


  toHumanDate: function (date) {
    return moment(date, 'YYYY-MM-DD').format('DD/MM/YYYY');
  },

  notify: function(apiKey, deviceId, type, title, message){
    //const apiKey = 'AIzaSyB_wxXw5033f8_2wcngL1aRd_95Dnt7qdE';
    //const deviceID = 'f7km4-syAqs:APA91bHo2j-ny5fJVK5f15MrfzL9hI8W2C0uWr7qWx9AS9SYsQ-_5HHgMWAQm9q1SebhGJcTE6aJEP7_q1i6ItpfmGSKNgsjWYZ67iN2aCGkOwGM9GH5Uqp9KVLs02Jm6xbCOXC-JFvE';
    const fcm = new FCM(apiKey);

    const msg = {
      to: deviceId,
      priority: 'high', // Valid values are "normal" and "high."
      data: {
        title: title,
        message: message
      }
    };

    //console.log(err);

    fcm.send(msg, (err, response) => {
      if (err) {
        console.log(err);
        console.log('Something has gone wrong!');
      } else {
        console.log('Successfully sent with response: ', response);
      }
    });

  },

  notifyOld: function (deviceId, type, message, body) {


    const settings = {
      pn : {
        android  : {
            key : "AAAAw31mdlk:APA91bEc05rfqgHo21CYP3FgCVzuOE7ciUIBNhcQNdYfZvU-AQQOwv_iP4SABooIf6kCYMRZ1iGaE6Kce7nHPq7oH8WqoNBx3_Y4gM73vQlAb21M4uY2Vju38rhRaqIaEYa2AJqMbQtZ​"
          }
        }
    }

    const push = new PushNotifications(settings);

    debug("notify:" + message + " - " + body + " - " + deviceId);
    const data = {
      title: message, // REQUIRED for Android
      topic: 'topic', // REQUIRED for iOS (apn and gcm)
      body: body,
      custom: {
        sender: 'Peniel',
      }
    };

    // Or you could use it as a promise:
    push.send(deviceId, data)
      .then((results) => {
        //alert(JSON.stringify(results));
        debug("OK:" + JSON.stringify(results));
        return true;
      })
      .catch((err) => {
        //alert(JSON.stringify(err));
        debug("ERROR:" + JSON.stringify(err));
        return false;
      });

  },

  upload: (req, res, next, cb) => {

    let prefix = '';
    if (req.originalUrl) {
      let p = req.originalUrl.split('/');
      if (p.length >= 3) {
        prefix = p[1] + '_';
      }
    }
    debug('upload - file')

    if (req.files && req.files.file) {
      const file = req.files.file;
      debug('upload - file:',file)

      const tmp = file.type.split('/');

      debug('upload - tmp:',tmp)

      //if (tmp.length == 2 && ((tmp[0] == 'image') || (tmp[1] == 'pdf'))) {
      if (tmp.length == 2) {
        const newFileName = prefix + uuid.v4() + '.' + tmp[1];
        debug('upload - newFileName:',newFileName)

        // console.log(newFileName);
        // var imageSizes = [125, 100, 30];

        fs.rename(file.path, req.settings.imagesDir + newFileName, (err) => {
          if (err) {
            return res.status(400).json({
              message: err.message || 'fallo al renombrar imagen',
              err
            });
          } else {

            // console.log("imageeee:"+req.settings.imagesDir + newFileName);
            //
            // try {
                // const imageInfo = info(req.settings.imagesDir + newFileName)
                // .then(item => {
                //   console.log("item: ", item);
                // })
                // .catch(error => {
                //   console.log("Error: ", error);
                // });
                //
                // console.log("imageeee imageInfo:"+imageInfo);

            //     const thumbnailInfo = thumbnail({
            //         src: req.settings.imagesDir + newFileName,
            //         width: 100,
            //         height: 100,
            //     })
            //     .then(item => {
            //       console.log("item: ", item);
            //     })
            //     .catch(error => {
            //       console.log("Error: ", error);
            //     });
            //
            // } catch (e) {
            //     console.log("Error: ", e);
            // }
            // console.log("imageeee end");


            if (cb) {
              cb(newFileName);
            }
            return res.status(200).json({ file: newFileName });
          }
        });
      } else {
        return res.status(400).json({ error: 'No image files uploaded' });
      }
    } else {
      return res.status(400).json({ error: 'No file uploaded' });
    }
  },

  deleteFiles: (req, res) => {
    debug('entro', req.body)
    let images = req.body;
    if (images && Array.isArray(images)) {

      images.forEach(el => {
        fs.unlink(`${req.settings.imagesDir}/${el}`, err => {
          const i =req.body.indexOf(el);
          req.body.splice(i, 1);
          debug(`images `, req.body );
          debug(`error al borrar el archivo. ${err}`)
        })
      })
      res.status(200).json({
        message: 'Las imagenes fueron eliminadas con éxito',
        images: req.body
      })
    } else {
      res.status(400).json({
        message: 'bad request',
        body: req.body
      })
    }
  },

  findById: (model, req, res) => {

    let urlParts = url.parse(req.url, true);
    let queryParams = urlParts.query;
    debug('findById: ', queryParams);

    let sort, filter = {};
    let select = '';
    let populates = [];

    if (queryParams.sort) {
      sort = JSON.parse(queryParams.sort);
    }

    if (queryParams._filters) {
      filter = JSON.parse(queryParams._filters);
    }

    if (queryParams._populates) {
      populates = JSON.parse(queryParams._populates);
    }

    if (queryParams._select) {
      select = JSON.parse(queryParams._select);
    }

    model
      .findById(req.params.id)
      .select(select)
      .populate(populates || [])
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
  },

  // findById:(model, req, res) => {
  //   let options = {};
  //   if (req.extraOptions) {
  //     if (req.extraOptions.include) {
  //       options.include = req.extraOptions.include;
  //     }
  //   }
  //   model.findById(req.params.id, options)
  //     .then(item => {
  //       debug(`finbyid then`, item)
  //       if (item) {
  //         res.status(200).json(item);
  //       } else {
  //         res.status(404).json({
  //           message: `No se ha encontrado objecto con id: ${req.params.id}`
  //         });
  //       }
  //     })
  //     .catch(error => {
  //       res.status(404).json({
  //         message: `No se ha encontrado objecto con id: ${req.params.id}`,
  //         error
  //       })
  //     });
  // },



  register: (model, req, res) => {
    const params = req.body;
    debug(params)

    // check for duplicate 'email' in this case
    if (params && params.email) {

      model
        .findOne({ email: params.email })
        .then((user) => {
          if (user) {
            res.status(400).json({
              message: 'Ya existe un usuario registrado con esos datos',
              error: {}
            })
          } else {
            model
              .create(req.body)
              .then(user => {
                createToken(user)
                  .then(accessToken => {
                    debug('register token response ', accessToken);
                    res.status(200).json({
                      user,
                      accessToken
                    })
                  })
                  .catch(error => {
                    return Promise.reject(error);
                  });
              })
              .catch(error => {
                return Promise.reject(error);
              });
          }
        })
        .catch(error => {
          res.status(400).json({
            message: 'Ocurrio un error',
            error
          })
        });
    } else {
      res.status(400).json({
        message: 'Ocurrio un error',
        error: {}
      })
    }
  },




  // register: (model, req, res) => {
  //   const params = req.body;
  //   debug(params)
  //
  //   // check for duplicate 'email' in this case
  //   if (params && params.email) {
  //
  //     model
  //       .findOne({email: params.email})
  //       .then((user) => {
  //         if (user) {
  //           res.status(400).json({
  //             message: 'Ya existe un usuario registrado con esos datos',
  //             error : {}
  //           })
  //         } else {
  //           model
  //             .create(req.body)
  //             .then(user => {
  //               achievement.find({})
  //                 .then(ach => {
  //                   if (ach) {
  //                     ach.forEach(el => {
  //                       if (el.active) {
  //                         userAchievement.create({
  //                           user: user._id,
  //                           achievement: el._id
  //                         })
  //                       }
  //                     });
  //                   }
  //                 })
  //               createToken(user)
  //                 .then(accessToken => {
  //                   debug('register token response ', accessToken);
  //                   res.status(200).json({
  //                     user,
  //                     accessToken
  //                   })
  //                 })
  //                 .catch(error => {
  //                   return Promise.reject(error);
  //                 });
  //             })
  //             .catch(error => {
  //               return Promise.reject(error);
  //             });
  //         }
  //       })
  //       .catch(error => {
  //         res.status(400).json({
  //           message: 'Ocurrio un error',
  //           error
  //         })
  //       });
  //   } else {
  //     res.status(400).json({
  //       message: 'Ocurrio un error',
  //       error: {}
  //     })
  //   }
  // },


  login: (model, req, res) => {
    const params = req.body;
    debug(params)
    if (params && params.password) {

      model
        .findOne(params)
        .then((user) => {
          if (user) {
            user.password = null;
            debug(`antes de crear token ${user}`);
            createToken(user)
              .then(accessToken => {
                debug('accessToken response ', accessToken);
                res.status(200).json({
                  user,
                  accessToken
                })
              })
              .catch(error => {
                return Promise.reject(error);
              });
          } else {
            return Promise.reject(error);
          }
        })
        .catch(error => {
          res.status(401).json({
            message: 'Login incorrecto',
            error
          })
        });
    } else {
      res.status(401).json({
        message: 'Login incorrecto',
        error: {}
      })
    }
  },

  delete: (model, req, res) => {
    const _id = req.params.id || '';
    debug('helper delete id', _id)
    model.findOneAndDelete({_id})
      .then(data => {
        if (!data) {
          return Promise.reject('no se encontro ningun documento con ese id')
        }
        debug('helper delete ', data)
        res.status(202).json({
          message: 'Objeto eliminado con exito',
          status: 'ok',
          data
        });
      })
      .catch(err => {
        res.status(400).json({
          message: err.message || 'No se pudo eliminar el item',
          err
        })
      })

  },

  find: (model, req, res) => {

    let urlParts = url.parse(req.url, true);
    let queryParams = urlParts.query;
    debug('find: ', queryParams);

    let sort, filter = {};
    let select = '';
    let populates = [];

    if (queryParams.sort) {
      sort = JSON.parse(queryParams.sort);
    }

    if (queryParams._filters) {
      filter = JSON.parse(queryParams._filters);
    }

    if (queryParams._populates) {
      populates = JSON.parse(queryParams._populates);
    }

    if (queryParams._select) {
      select = JSON.parse(queryParams._select);
    }
    if (filter.title) {
      filter.title = new RegExp(filter.title, 'i');
    }

    model
      .find(filter)
      .select(select)
      .populate(populates || [])
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
  },


  // deleteFiles: function (req, res) {
  //   debug('entro', req.body)
  //   if (req.body) {

  //     var promises = [];
  //     const storage = new Storage({
  //       projectId: req.settings.storage.projectId,
  //     });

  //     req.body.forEach(el => {
  //       fs.unlink(`${req.settings.imagesDir}/${el}`, err => {
  //         debug(`error al borrar el archivo. ${err}`)
  //       });
  //       fs.unlink(`${req.settings.imagesDir}/small-${el}`, err => {
  //         if (err) {
  //           debug(`error al borrar el archivo. ${err}`)
  //         }
  //       });

  //       promises.push(
  //         storage
  //           .bucket(req.settings.storage.bucketName)
  //           .file(el)
  //           .delete()
  //       );
  //     });

  //     Promise.all(promises)
  //       .then(() => {
  //         res.status(200).send({ message: 'Archivos borrados con exito' })
  //       })
  //       .catch((e) => {
  //         console.error('ERROR:', e);
  //         return res.status(400).send({ errors: e.message });
  //       });


  //   } else {
  //     res.status(400).send({
  //       message: 'bad request',
  //       body: req.body
  //     })
  //   }
  // },

  save: (model, req, res) => {

    const params = req.body;

    if (req.params.id) {
      params.id = req.params.id;
    }

    if (params.id) {
      model.update({ _id: params.id }, params)
        .then((data) => {
          return res.status(200).json(data);
        })
        .catch((error) => {
          return res.status(400).json({
            message: error.message || 'no se pudo actualizar objeto',
            error
          });
        });
    } else {
      model.create(params)
        .then((data) => {
          debug(`create `, data);
          if (data.password) {
            data.password = null;
          }
          return res.status(200).json(data);
        })
        .catch((error) => {
          return res.status(400).json({
            message: error.message || 'no se pudo crear objeto',
            error
          });
        });
    }
  },





findByIdAndUpdate: (model, req, res) => {
  const params = req.body;
  const id = req.params.id || ''

  model.findByIdAndUpdate(id, params, { new: true }) // new para que devuelva el objecto actualiado
    .then(data => {
      debug(data);
      res.status(202).json(data)
    })
    .catch(error => {
      debug(`error add friend `, error);
      res.status(400).json({
        message: error.message || 'Ocurrio un error',
        error
      })
    })
},

  deleteAll: (model, req, res) => {
    model.deleteMany()
      .then(data => {
        return res.status(200).json(data);
      })
      .catch((error) => {
        return res.status(400).json({
          message: error.message || 'no se pudo crear objeto',
          error
        });
      });
  },

  getDateConditions: function (req, model) {
    let alias = '';
    if (model) {
      alias = model + '.';
    }
    let params = this.parseQueryString(req);
    let where = null;
    if (params && params._filters) {
      params._filters = JSON.parse(params._filters);
      if (params._filters.dateFrom && params._filters.dateTo) {
        where = models.sequelize.literal('DATE(' + alias + 'date) >= "' + params._filters.dateFrom + '" AND DATE(' + alias + 'date) <= "' + params._filters.dateTo + '"');
      } else {
        if (params._filters.dateFrom) {
          where = models.sequelize.literal('DATE(' + alias + 'date) >= "' + params._filters.dateFrom + '"');
        }
        if (params._filters.dateTo) {
          where = models.sequelize.literal('DATE(' + alias + 'date) <= "' + params._filters.dateTo + '"');
        }
      }
    }
    return where;
  },

  getOptionsSearch: function (model, req) {

    var urlParts = url.parse(req.url, true);
    var queryParams = urlParts.query;

    var options = {};
    var filters = {};

    debug("================= SEARCH ===================");
    debug(queryParams._filters_serach);
    debug("================= SEARCH ===================");

    if (queryParams._filters_serach) {
      var criterias = JSON.parse(queryParams._filters_serach);

      debug("================= FOR ===================");
      var filters_like = [];
      for (var i = 0; i < criterias.length; i++) {
        debug(criterias[i]);
        var f = { $like: '%' + criterias[i] + '%' };
        filters_like.push(f);
      }
      filters.art_descripcion = { $or: filters_like };

      // RUBROS
      /*var where = {};
      where.rub_descripcion = { $or : filters_like };
      req.extraOptions.include.push({
      model: models.rubros,
      where: where
    });*/
      debug("================= FOR ===================");

      /*if (criterias.art_descripcion) {
      filters.art_descripcion = { $like : '%' + criterias.art_descripcion + '%' };
      delete criterias.art_descripcion;
    }*/

      /*for (var field in criterias) {
      filters[field] = criterias[field];
      }*/

      //if (Object.keys(filters).length > 0) {
      debug("================= WHERE ===================");
      debug(filters);
      options.where = filters;
      debug("================= WHERE ===================");
      //}

    }

    if (queryParams._page && queryParams._perPage) {
      var page = null;
      if (queryParams._perPage) {
        page = parseInt(queryParams._page);
      } else {
        page = 1
      }
      page--;

      var perPage = null;
      if (queryParams._perPage) {
        perPage = parseInt(queryParams._perPage);
      } else {
        perPage = req.settings.pagging.itemsPerPage;
      }
      options.limit = perPage;
      options.offset = page * perPage;
    }

    var sort = null;
    if (queryParams._sortField) {
      sort = queryParams._sortField;
    }
    if (sort && queryParams._sortDir) {
      sort = [[sort, queryParams._sortDir]];
    }
    options.order = sort;

    if (req.extraOptions) {
      if (req.extraOptions.where) {
        if (options.where) {
          options.where = _.flatten([options.where, req.extraOptions.where]);
        } else {
          options.where = req.extraOptions.where;
        }
      }

      if (req.extraOptions.order) {
        if (options.order) {
          options.order = _.flatten([options.order, req.extraOptions.order]);
        } else {
          options.order = req.extraOptions.order;
        }
      }

      if (req.extraOptions.include) {
        options.include = req.extraOptions.include;
      }
    }

    return options;

  },


  getOptions: function (model, req) {

    var urlParts = url.parse(req.url, true);
    var queryParams = urlParts.query;

    var options = {};
    var filters = {};

    debug("====================================");
    debug(queryParams._filters);
    debug("====================================");

    if (queryParams._filters) {
      var criterias = JSON.parse(queryParams._filters);

      if (criterias.dateFrom && criterias.dateTo) {
        filters.date = { $between: [criterias.dateFrom, criterias.dateTo] };
        delete criterias.dateFrom;
        delete criterias.dateTo;
      }

      if (criterias.dateFrom) {
        filters.date = { $gte: "'" + criterias.dateFrom + "'" };
        delete criterias.dateFrom;
      }

      if (criterias.dateTo) {
        filters.date = { $lte: "'" + criterias.dateTo + "'" };
        delete criterias.dateTo;
      }

      if (criterias.email) {
        filters.email = { $like: '%' + criterias.email + '%' };
        delete criterias.email;
      }

      if (criterias.name) {
        filters.name = { $like: '%' + criterias.name + '%' };
        delete criterias.name;
      }

      if (criterias.value) {
        filters.value = { $like: '%' + criterias.value + '%' };
        delete criterias.value;
      }

      if (criterias.data) {
        filters.data = { $like: '%' + criterias.data + '%' };
        delete criterias.data;
      }

      for (var field in criterias) {
        filters[field] = criterias[field];
      }

      if (Object.keys(filters).length > 0) {
        options.where = filters;
      }

    }

    if (queryParams._page && queryParams._perPage) {
      var page = null;
      if (queryParams._perPage) {
        page = parseInt(queryParams._page);
      } else {
        page = 1
      }
      page--;

      var perPage = null;
      if (queryParams._perPage) {
        perPage = parseInt(queryParams._perPage);
      } else {
        perPage = req.settings.pagging.itemsPerPage;
      }
      options.limit = perPage;
      options.offset = page * perPage;
    }

    var sort = null;
    if (queryParams._sortField) {
      sort = queryParams._sortField;
    }
    if (sort && queryParams._sortDir) {
      sort = [[sort, queryParams._sortDir]];
    }
    options.order = sort;

    if (req.extraOptions) {
      if (req.extraOptions.where) {
        if (options.where) {
          options.where = _.flatten([options.where, req.extraOptions.where]);
        } else {
          options.where = req.extraOptions.where;
        }
      }

      if (req.extraOptions.order) {
        if (options.order) {
          options.order = _.flatten([options.order, req.extraOptions.order]);
        } else {
          options.order = req.extraOptions.order;
        }
      }

      if (req.extraOptions.include) {
        options.include = req.extraOptions.include;
      }
    }

    return options;

  },


  parseQueryString: function (req) {
    var urlParts = url.parse(req.url, true);
    return urlParts.query;
  },

  normalize: function (item) {
    return JSON.parse(JSON.stringify(item));
  },

  formatErrors: function (errorsIn) {
    var errors = [];

    if (typeof errorsIn == 'object') {
      var error = {
        name: errorsIn['name'],
        message: errorsIn['message'],
      };

      if (errorsIn.fields) {
        error.extra = errorsIn.fields;
      }

      if (errorsIn.sql) {
        error.sql = errorsIn.sql;
      }
      errors.push(error);
    } else if (typeof errorsIn == 'array') {
    }

    return errors;
  },
  handleError: (error) => {

  }
};
