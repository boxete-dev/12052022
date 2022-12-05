var _factories = angular.module('orderingApp.factories', []);
_factories.factory('MyLoading', function ($ionicLoading) {
  return {
    show: showLoading,
    hide: hideLoading,
    toast: showToast,
    success: showSuccess
  };
  function showLoading(msg) {
    $ionicLoading.show({
      template: '<p>' + msg + '</p><ion-spinner icon="' + (ADDONS.web_template ? 'android' : 'crescent') + '" class="spinner-assertive"></ion-spinner>'
    });
    Extensions.runAction('after_show_loading', $ionicLoading);
  }
  function hideLoading() {
    $ionicLoading.hide();
    Extensions.runAction('after_hide_loading', $ionicLoading);
  }
  function showToast(msg, time, options) {
    $ionicLoading.show({
      template: '<div class="toast' + (options && options.class ? ' ' + options.class : '') + '">' + msg + '</p>',
      noBackdrop: true,
      duration: time
    });
  }
  function showSuccess(msg, time) {
    return $ionicLoading.show({
      template: '<div class="toast success">' + msg + '</p>',
      noBackdrop: true,
      duration: time
    });
  }
})

_factories.factory('MyToast', function ($q) {
  return {
    add: addToast
  };
  function getContainer() {
    var container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.classList.add('toast-container');
      document.body.appendChild(container);
    }
    return container;
  }
  function addToast(message, options) {
    var deferred = $q.defer();
    var options = Object.assign({
      timeout: 2000
    }, options);
    var container = getContainer();
    var toast = document.createElement('div');
    toast.classList.add('toast');
    toast.innerHTML = message;
    toast.onclick = function () {
      deferred.resolve();
    }
    container.appendChild(toast);
    setTimeout(function () {
      toast.remove();
    }, options.timeout);
    return deferred.promise;
  }
});

//addnewfactories
_factories.factory('MyModal', function ($ionicModal, $timeout, $ionicScrollDelegate) {
  return {
    showTemplate: function (template, options) {
      var modal = $ionicModal.fromTemplateUrl(template, options);
      modal.hardwareBackButtonClose = options.modalClose == false ? false : true;
      modal.then(function (modal) {
        if (/iP(ad|od|hone)/i.test(window.navigator.userAgent) && !ADDONS.web_template) {
          if (window.screen.height === 812) {
            modal.modalEl.classList.add("iPhoneXApp");
          }
          else {
            modal.modalEl.classList.add("iPhoneApp");
          }
        }
        if (IFRAME_INLINE) {
          var interval = setInterval(function () {
            if (modal.isShown()) {
              clearInterval(interval);
              var tb = PARENT_DATA.height * 0.05;
              var height = $(modal.modalEl).height();
              var maxHeight = PARENT_DATA.height - (tb * 2);
              modal.modalEl.style.top = (PARENT_DATA.top - PARENT_DATA.offsetTop + tb) + 'px';
              modal.modalEl.style.maxHeight = maxHeight + 'px';
              $('.modal .popup-mode.scroll-content').css('max-height', (maxHeight - 40) + 'px');
              $timeout(function () {
                $ionicScrollDelegate.resize();
              }, 250);
            }
          }, 50);
        }
        modal.scope.hide = function () {
          modal.hide();
          modal.remove();
        }
        modal.$el.on('click', function (e) {
          if (modal.backdropClickToClose && e.target === modal.el) {
            modal.hide();
            modal.remove();
          }
        });
      });
      return modal;
    }
  };
});

_factories.factory('MyAlert', function ($ionicPopup, $rootScope, $q) {
  return {
    show: showAlert,
    alert: callAlert,
    confirm: callConfirm,
    prompt: callPrompt,
    showtWithTitle: showAlertWithTitle,
    confirmInput: callConfirmWith
  };
  function showAlertWithTitle(title, msg) {
    if (!$rootScope.arabic_rtl) {
      $ionicPopup.alert({
        title: title,
        template: msg,
        okText: $rootScope.MLanguages.MOBILE_FOURTH_PAGE_OK
      });
    }
    else {
      $ionicPopup.alert({
        title: title,
        template: '<p style=\'direction:rtl;\'>' + msg + '</p>',
        okText: $rootScope.MLanguages.MOBILE_FOURTH_PAGE_OK
      });
    }
  }
  function showAlert(msg) {
    $(':focus').blur();
    var alertPopup = null;
    if (msg instanceof Array) {
      var message = '<ul>';
      for (var i = 0; i < msg.length; i++) {
        message += '<li>' + msg[i] + '</li>';
      }
      msg = message + '</ul>';
    }
    if (!$rootScope.arabic_rtl) {
      alertPopup = $ionicPopup.alert({
        title: (!ADDONS.web_template) ? ((ADDONS.template.indexOf('bot') == -1) ? $rootScope.MLanguages.MOBILE_APPNAME : $rootScope.MLanguages.BOT_APPNAME) : $rootScope.MLanguages.WEB_APPNAME,
        template: '<center>' + msg + '</center>',
        okText: $rootScope.MLanguages.MOBILE_FOURTH_PAGE_OK
      });
    } else {
      alertPopup = $ionicPopup.alert({
        title: (!ADDONS.web_template) ? ((ADDONS.template.indexOf('bot') == -1) ? $rootScope.MLanguages.MOBILE_APPNAME : $rootScope.MLanguages.BOT_APPNAME) : $rootScope.MLanguages.WEB_APPNAME,
        template: '<p style=\'direction:rtl;\'>' + msg + '</p>',
        okText: $rootScope.MLanguages.MOBILE_FOURTH_PAGE_OK
      });
    }
    Extensions.runAction('after_show_alert', alertPopup);
    alertPopup.then(function (res) {
      Extensions.runAction('after_hide_alert', alertPopup);
    });
    return alertPopup;
  }
  function callAlert(msg) {
    var def = $q.defer();
    $ionicPopup.alert({
      title: (!ADDONS.web_template) ? ((ADDONS.template.indexOf('bot') == -1) ? $rootScope.MLanguages.MOBILE_APPNAME : $rootScope.MLanguages.BOT_APPNAME) : $rootScope.MLanguages.WEB_APPNAME,
      template: msg
    }).then(function (res) {
      def.resolve();
    });
  }
  function callConfirm(msg, ok, cancel) {
    $(':focus').blur();
    var def = $q.defer();
    // disableScroll();
    var confirmPopup = $ionicPopup.confirm({
      title: (!ADDONS.web_template) ? ((ADDONS.template.indexOf('bot') == -1) ? $rootScope.MLanguages.MOBILE_APPNAME : $rootScope.MLanguages.BOT_APPNAME) : $rootScope.MLanguages.WEB_APPNAME,
      template: '<p>' + msg + '</p>',
      cancelType: 'button-stable button-cancel',
      cancelText: (cancel) ? cancel : $rootScope.MLanguages.MOBILE_CHECKOUT_CANCEL,
      okText: (ok) ? ok : $rootScope.MLanguages.MOBILE_FOURTH_PAGE_OK.toUpperCase()
    }).then(function (res) {
      if (res) {
        def.resolve('OK');
        Extensions.runAction('after_hide_confirm', confirmPopup);
      } else {
        def.reject('CANCEL');
        Extensions.runAction('after_hide_confirm', confirmPopup);
      }
    });
    // alertToMiddle();
    Extensions.runAction('after_show_confirm', confirmPopup);
    return def.promise;
  }
  function callConfirmWith(msg, template, ok, cancel) {
    $(':focus').blur();
    var def = $q.defer();
    // disableScroll();
    var confirmPopup = $ionicPopup.confirm({
      title: (!ADDONS.web_template) ? ((ADDONS.template.indexOf('bot') == -1) ? $rootScope.MLanguages.MOBILE_APPNAME : $rootScope.MLanguages.BOT_APPNAME) : $rootScope.MLanguages.WEB_APPNAME,
      template: template,
      subTitle: msg,
      scope: $rootScope,
      buttons: [
        { text: (cancel) ? cancel : $rootScope.MLanguages.MOBILE_CHECKOUT_CANCEL },
        {
          text: (ok) ? ok : $rootScope.MLanguages.MOBILE_FOURTH_PAGE_OK.toUpperCase(), type: 'button-positive',
          onTap: function (e) {
            if (!$rootScope.confirmData.password) {
              e.preventDefault();
            } else {
              return $rootScope.confirmData
            }
          }
        }
      ]
    }).then(function (res) {
      if (res) {
        def.resolve(res);
        Extensions.runAction('after_hide_confirm', confirmPopup);
      } else {
        def.reject('CANCEL');
        Extensions.runAction('after_hide_confirm', confirmPopup);
      }
    });
    // alertToMiddle();
    Extensions.runAction('after_show_confirm', confirmPopup);
    return def.promise;
  }
  function callPrompt(msg) {
    var def = $q.defer();
    $ionicPopup.confirm({
      title: (!ADDONS.web_template) ? ((ADDONS.template.indexOf('bot') == -1) ? $rootScope.MLanguages.MOBILE_APPNAME : $rootScope.MLanguages.BOT_APPNAME) : $rootScope.MLanguages.WEB_APPNAME,
      template: msg
    }).then(function (res) {
      if (res) {
        def.resolve(res);
      } else {
        def.reject('CANCEL');
      }
    });
  }
})

// ORIGINAL_APIs ------------------------------------------------------------------------

_factories.factory('ionicReady', function ($ionicPlatform) {
  var readyPromise;

  return function () {
    if (!readyPromise) {
      readyPromise = $ionicPlatform.ready();
    }
    return readyPromise;
  };
})
_factories.factory('Geolocation', function () {
  return {
    locationByAddress: function (address, cb) {
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode({ 'address': address }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          cb({
            address: results[0].formatted_address,
            location: {
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng()
            },
            place_id: results[0].place_id
          });
        } else {
          cb();
        }
      });
    }
  };
})
// GeoCoding with Geolocation and GoogleMaps
_factories.factory('GeolocationSvc', [
  '$q', '$window',
  function ($q, $window) {
    return function () {
      var deferred = $q.defer();
      var positionOptions = { timeout: 10000, enableHighAccuracy: true };
      if (typeof cordova == 'undefined' || !cordova) {
        window.navigator.geolocation.getCurrentPosition(function (position) {
          deferred.resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        }, deferred.reject, positionOptions);
      } else {
        document.addEventListener("deviceready", function () {
          window.navigator.geolocation.getCurrentPosition(function (position) {
            deferred.resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          }, deferred.reject, positionOptions);
        }, false);
      }
      return deferred.promise;
    };
  }])

_factories.factory('AddressLookupSvc', [
  '$q', '$http', 'GeolocationSvc',
  function ($q, $http, GeolocationSvc) {
    var MAPS_ENDPOINT = 'https://maps.google.com/maps/api/geocode/json?latlng={POSITION}&sensor=false&key=' + GM_API_KEY;

    return {
      urlForLatLng: function (lat, lng) {
        return MAPS_ENDPOINT.replace('{POSITION}', lat + ',' + lng);
      },

      lookupByLatLng: function (lat, lng) {
        var deferred = $q.defer();
        var url = this.urlForLatLng(lat, lng);

        $http.get(url).success(function (response) {
          // hacky
          var zipCode;
          angular.forEach(response.results, function (result) {
            if (result.types[0] === 'postal_code') {
              zipCode = result.address_components[0].short_name;
            }
          });
          deferred.resolve(zipCode);
        }).error(deferred.reject);

        return deferred.promise;
      },

      lookupByAddress: function (lat, lng) {
        var deferred = $q.defer();
        var url = this.urlForLatLng(lat, lng);
        $http.get(url).success(function (response) {
          // hacky
          var address = {
            address: '',
            zip: ''
          };
          var state = false;
          angular.forEach(response.results, function (result) {
            //console.log(result.types);
            if (!state) {
              if (result.types.indexOf('street_address') != -1) {
                address.address = result.formatted_address;
                state = true;
              } else if (result.types.indexOf('route') != -1) {
                for (v in result.address_components) {
                  if (result.address_components[v].types.indexOf('route') != -1) {
                    if (result.address_components[v].long_name != 'Unnamed Road') {
                      address.address = result.formatted_address;
                      state = true;
                    }
                  }
                }
              } else if (result.types.indexOf('locality') != -1) {
                address.address = result.formatted_address;
                state = true;
              } else if (result.types.indexOf('postal_code') != -1) {
                address.address = result.formatted_address;
                state = true;
              } else if (result.types.indexOf('political') != -1) {
                address.address = result.formatted_address;
                state = true;
              }
            }
            if (result.types[0] === 'postal_code') {
              address.zip = result.address_components[0].long_name;
              // state = true;
            }
          });
          deferred.resolve(address);
        }).error(deferred.reject);

        return deferred.promise;
      },

      lookup: function () {
        var deferred = $q.defer();
        var self = this;

        GeolocationSvc().then(function (position) {
          //deferred.resolve(self.lookupByLatLng(position.lat, position.lng));
          deferred.resolve({
            address: self.lookupByAddress(position.lat, position.lng),
            location: position
          });
        }, deferred.reject);

        return deferred.promise;
      }
    };
  }
])

_factories.factory('GeoCoderSvc', [
  '$q', '$window',
  function ($q, $window) {
    return {
      getLocationFromAddress: function (address) {
        var geocoder = new google.maps.Geocoder;
        var deferred = $q.defer();
        geocoder.geocode({ 'address': address }, function (results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            deferred.resolve({
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng()
            });
          }
          else {
            deferred.reject("Geocode was not successful for the following reason: " + status);
          }
        });
        return deferred.promise;
      },
      getCountryCityFromAddress: function (address) {
        var geocoder = new google.maps.Geocoder;
        var deferred = $q.defer();
        geocoder.geocode({ 'address': address }, function (results, status) {
          if (status == google.maps.GeocoderStatus.OK) {

            var city, country, formatted_address;
            var zip = '';
            var state = false;
            var location = {
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng()
            }

            angular.forEach(results, function (subResult) {
              if (state == false) {
                if (!formatted_address && subResult.formatted_address) {
                  formatted_address = subResult.formatted_address;
                }
                angular.forEach(subResult.address_components, function (result) {
                  if (result.types[0] === 'locality') {
                    city = result.long_name;
                  }
                  if (result.types[0] === 'country') {
                    country = result.long_name;
                  }
                  if (result.types[0] === 'postal_code') {
                    zip = result.long_name;
                  }
                  if (result.types[0] === 'administrative_area_level_2') {
                    province = result.long_name;
                  }
                  if (result.types[0] === 'political') {
                    province = result.long_name;
                  }
                });
                if (typeof city != 'undefined' && typeof country != 'undefined' && zip != '') {
                  state = true;
                }
              }
            });

            deferred.resolve({
              formatted_address: formatted_address,
              city: city,
              country: country,
              zip: zip,
              location: location
            });
          }
          else {
            deferred.reject("Geocode was not successful for the following reason: " + status);
          }
        });
        return deferred.promise;
      },
      getPlaceIdFromLatLng: function (position) {
        var geocoder = new google.maps.Geocoder;
        var deferred = $q.defer();
        geocoder.geocode({ 'location': position }, function (results, status) {

          if (status === google.maps.GeocoderStatus.OK) {
            if (results[1]) {
              deferred.resolve(results[1].place_id);
            } else {
              defered.reject('No results found');
            }
          } else {
            defered.reject('Geocoder failed due to: ' + status);
          }
        });
        return deferred.promise;
      }
    }
  }
])
_factories.factory('$ionicClickBlock', [
  '$document',
  '$ionicBody',
  '$timeout',
  function ($document, $ionicBody, $timeout) {
    return {
      show: function (autoExpire) { },
      hide: function () { }
    };
  }
])

function getLangCode() {
  return (localStorageApp.getItem(STORE.LANG_CODE)) ? localStorageApp.getItem(STORE.LANG_CODE) : 'en'
}

_factories.factory('Ordering', function ($http, MyAlert, API_ENDPOINTS, $rootScope) {
  function _post(url, data, ok, err, without_token, allow_null, token = localStorageApp.getItem(STORE.TOKEN)) {
    var fields = {};
    for (var key in data) {
      if ((data[key] !== null && data[key] !== undefined && data[key] !== '' && key != 'id') || (data[key] == '' && allow_null)) fields[key] = data[key] !== '' ? data[key] : null;
    }
    var configs = {
      headers: {
        'X-APP-X': APP_ID
      }
    };
    if (FRONT_VERSION) configs.headers['X-FRONT-VERSION-X'] = FRONT_VERSION;
    if (token && !without_token) configs.headers['Authorization'] = 'Bearer ' + token;
    $http.post(url.replace(/([^:]\/)\/+/g, "$1"), fields, configs)
      .then(function (res) {
        if (ok) ok(res.data, fields);
      }, function (res) {
        if (res.status == 400 && ok) ok(res.data, fields);
        else if (res.status == 401) MyAlert.show(res.data.result);
        else if (err) err(res);
      });
  }

  function _upload(url, data, ok, err, without_token) {
    var configs = {
      withCredentials: false,
      headers: {
        'Content-Type': undefined,
        'X-APP-X': APP_ID
      },
      transformRequest: angular.identity
    };
    if (localStorageApp.getItem(STORE.TOKEN) && !without_token) configs.headers['Authorization'] = 'Bearer ' + localStorageApp.getItem(STORE.TOKEN);
    $http.post(url.replace(/([^:]\/)\/+/g, "$1"), data, configs)
      .then(function (res) {
        if (ok) ok(res.data, fields);
      }, function (res) {
        if (res.status == 400 && ok) ok(res.data);
        else if (res.status == 401) MyAlert.show(res.data.result);
        else if (err) err(res);
      });
  }

  function _put(url, data, ok, err, without_token, allow_null) {
    var fields = {};
    for (var key in data) {
      if ((data[key] !== null && data[key] !== undefined && data[key] !== '' && key != 'id') || (data[key] == '' && allow_null)) fields[key] = data[key] !== '' ? data[key] : null;
    }
    var configs = {
      headers: {
        'X-APP-X': APP_ID
      }
    };
    if (FRONT_VERSION) configs.headers['X-FRONT-VERSION-X'] = FRONT_VERSION;
    if (localStorageApp.getItem(STORE.TOKEN) && !without_token) configs.headers['Authorization'] = 'Bearer ' + localStorageApp.getItem(STORE.TOKEN);
    $http.put(url.replace(/([^:]\/)\/+/g, "$1"), fields, configs)
      .then(function (res) {
        if (ok) ok(res.data);
      }, function (res) {
        if (res.status == 400 && ok) ok(res.data, fields);
        else if (res.status == 401) MyAlert.show(res.data.result);
        else if (err) err(res);
      });
  }

  function _get(url, params, ok, err, without_token, token = localStorageApp.getItem(STORE.TOKEN)) {
    var str = "?";
    for (var key in params) {
      if (params[key] != null && params[key] != undefined && key.trim() != '' && key != 'id' && key != 'id_or_slug') {
        if (key == 'where') params[key] = JSON.stringify(params[key]);
        if (str != '?') str += '&';
        str += key + '=' + params[key];
      }
    }
    var configs = {
      headers: {
        'X-APP-X': APP_ID
      }
    };
    if (FRONT_VERSION) configs.headers['X-FRONT-VERSION-X'] = FRONT_VERSION;
    if (token && !without_token) configs.headers['Authorization'] = 'Bearer ' + token;
    $http.get((url + str).replace(/([^:]\/)\/+/g, "$1"), configs)
      .then(function (res) {
        if (ok) ok(res.data);
      }, function (res) {
        if (res.status == 400 && ok) ok(res.data);
        else if (res.status == 401) {
          if (res.data.result[0] == "You do not have permission.") {
            $rootScope.onSignOut(true);
            $rootScope.onGoLogin();
            MyAlert.show($rootScope.translate('YOU_DO_NOT_HAVE_PERMISSION'));
          } else {
            MyAlert.show(res.data.result);
          }
        } else if (err) err(res);
      });
  }
  function _delete(url, params, ok, err, without_token) {
    var str = "?";
    for (var key in params) {
      if (params[key] != null && params[key] != undefined && key.trim() != '' && key != 'id' && key != 'id_or_slug') {
        if (str != '?') str += '&';
        str += key + '=' + params[key];
      }
    }
    var configs = {
      headers: {
        'X-APP-X': APP_ID
      }
    };
    if (FRONT_VERSION) configs.headers['X-FRONT-VERSION-X'] = FRONT_VERSION;
    if (localStorageApp.getItem(STORE.TOKEN) && !without_token) configs.headers['Authorization'] = 'Bearer ' + localStorageApp.getItem(STORE.TOKEN);
    $http.delete((url + str).replace(/([^:]\/)\/+/g, "$1"), configs)
      .then(function (res) {
        if (ok) ok(res.data);
      }, function (res) {
        if (res.status == 400 && ok) ok(res.data);
        else if (res.status == 401) { err(res); MyAlert.show(res.data.result); }
        else if (err) err(res);
      });
  }
  function _download(url, params, ok, err, without_token) {
    var str = "?";
    for (var key in params) {
      if (params[key] != null && params[key] != undefined && key.trim() != '' && key != 'id' && key != 'id_or_slug') {
        if (key == 'where') params[key] = JSON.stringify(params[key]);
        if (str != '?') str += '&';
        str += key + '=' + params[key];
      }
    }
    var req = new XMLHttpRequest();
    req.open("GET", (url + str).replace(/([^:]\/)\/+/g, "$1"), true);
    req.responseType = "blob";
    if (localStorageApp.getItem(STORE.TOKEN) && !without_token) req.setRequestHeader("Authorization", 'Bearer ' + localStorageApp.getItem(STORE.TOKEN));
    req.setRequestHeader("X-APP-X", APP_ID);
    if (FRONT_VERSION) req.setRequestHeader("X-FRONT-VERSION-X", FRONT_VERSION);
    req.onload = function (event) {
      if (req.status == 200) {
        var blob = req.response;
        var filename = "";
        var disposition = req.getResponseHeader('Content-Disposition');
        if (disposition && disposition.indexOf('attachment') !== -1) {
          var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          var matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
          }
        }
        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        if (ok) ok();
      } else {
        if (err) err(new Error());
      }
    };
    req.send();
  }
  return {
    languages: {
      all: function (params, ok, err, without_token) {
        _get(API_ENDPOINTS.languages.replace(':language', getLangCode()), params, ok, err, without_token);
      },
      update: function (params, ok, err) {
        _put(API_ENDPOINTS.languages.replace(':language', getLangCode()) + '/' + params.id, params, ok, err);
      }
    },
    translations: {
      all: function (params, ok, err, without_token) {
        _get(API_ENDPOINTS.translations.replace(':language', getLangCode()), params, ok, err, without_token);
      },
      add: function (data, ok, err) {
        _post(API_ENDPOINTS.translations.replace(':language', getLangCode()), data, ok, err);
      },
      update: function (data, ok, err) {
        _put(API_ENDPOINTS.translations.replace(':language', getLangCode()) + '/' + data.id, data, ok, err);
      },
      delete: function (data, ok, err) {
        _delete(API_ENDPOINTS.translations.replace(':language', getLangCode()) + '/' + data.id, data, ok, err);
      }
    },
    bulks_translations: {
      add: function (data, ok, err) {
        _post(API_ENDPOINTS.bulks_translations.replace(':language', getLangCode()), data, ok, err);
      },
      update: function (data, ok, err) {
        _put(API_ENDPOINTS.bulks_translations.replace(':language', getLangCode()), data, ok, err);
      },
      delete: function (data, ok, err) {
        _delete(API_ENDPOINTS.bulks_translations.replace(':language', getLangCode()), data, ok, err);
      },
    },
    users: {
      all: function (params, ok, err) {
        _get(API_ENDPOINTS.users.replace(':language', getLangCode()), params, ok, err);
      },
      find: function (params, ok, err) {
        _get(API_ENDPOINTS.users.replace(':language', getLangCode()) + '/' + params.id, params, ok, err);
      },
      auth: function (data, ok, err) {
        _post(API_ENDPOINTS.auth.replace(':language', getLangCode()), data, ok, err);
      },
      sms: function (data, ok, err) {
        var _platform = data.platform + "";
        delete data.platform;
        _post(API_ENDPOINTS.sms.replace(':language', getLangCode()).replace(':platform', _platform), data, ok, err);
      },
      add: function (data, ok, err) {
        _post(API_ENDPOINTS.users.replace(':language', getLangCode()), data, ok, err);
      },
      update: function (data, ok, err, without_token, allow_null) {
        _post(API_ENDPOINTS.users.replace(':language', getLangCode()) + '/' + data.id, data, ok, err, without_token, allow_null);
      },
      delete: function (data, ok, err) {
        _delete(API_ENDPOINTS.users.replace(':language', getLangCode()) + '/' + data.id, data, ok, err);
      },
      reviews: function (params, ok, err) {
        _get(API_ENDPOINTS.users.replace(':language', getLangCode()) + '/' + params.id + '/reviews', params, ok, err);
      },
      forgot: function (data, ok, err) {
        _post(API_ENDPOINTS.users.replace(':language', getLangCode()) + '/forgot', data, ok, err);
      },
      reset: function (data, ok, err) {
        _post(API_ENDPOINTS.users.replace(':language', getLangCode()) + '/reset', data, ok, err);
      },
      facebook: function (data, ok, err) {
        _post(API_ENDPOINTS.auth.replace(':language', getLangCode()) + '/facebook', data, ok, err);
      },
      logout: function (data, ok, err) {
        _post(API_ENDPOINTS.auth.replace(':language', getLangCode()) + '/logout', data, ok, err);
      },
      password: function (data, ok, err) {
        _post(API_ENDPOINTS.users.replace(':language', getLangCode()) + '/check_password', data, ok, err);
      },
      csv: function (params, ok, err) {
        _get(API_ENDPOINTS.users.replace(':language', getLangCode()).replace('/users', '/users_new') + ".csv", params, ok, err);
      },
      locations: {
        all: function (params, ok, err) {
          _get(API_ENDPOINTS.user_locations.replace(':language', getLangCode()).replace(':user_id', params.user_id), params, ok, err);
        }
      },
      keys: {
        all: function (params, ok, err) {
          _get(API_ENDPOINTS.user_keys.replace(':language', getLangCode()).replace(':user_id', params.user_id), params, ok, err);
        },
        add: function (data, ok, err) {
          _post(API_ENDPOINTS.user_keys.replace(':language', getLangCode()).replace(':user_id', data.user_id), data, ok, err);
        },
        delete: function (data, ok, err) {
          _delete(API_ENDPOINTS.user_keys.replace(':language', getLangCode()).replace(':user_id', data.user_id) + '/' + data.id, data, ok, err);
        }
      },
      addresses: {
        all: function (params, ok, err) {
          _get(API_ENDPOINTS.user_addresses.replace(':language', getLangCode()).replace(':user_id', params.user_id), params, ok, err);
        },
        add: function (data, ok, err) {
          _post(API_ENDPOINTS.user_addresses.replace(':language', getLangCode()).replace(':user_id', data.user_id), data, ok, err);
        },
        update: function (data, ok, err, without_token, allow_null) {
          _put(API_ENDPOINTS.user_addresses.replace(':language', getLangCode()).replace(':user_id', data.user_id) + '/' + data.id, data, ok, err, without_token, allow_null);
        },
        delete: function (data, ok, err) {
          _delete(API_ENDPOINTS.user_addresses.replace(':language', getLangCode()).replace(':user_id', data.user_id) + '/' + data.id, data, ok, err);
        }
      },
      metafields: {
        all: function (params, ok, err) {
          _get(API_ENDPOINTS.metafields.replace(':language', getLangCode()).replace(':user_id', params.id), params, ok, err);
        },
        add: function (data, ok, err) {
          _post(API_ENDPOINTS.metafields.replace(':language', getLangCode()).replace(':user_id', data.id), data, ok, err);
        },
        update: function (data, ok, err) {
          _put(API_ENDPOINTS.metafields.replace(':language', getLangCode()).replace(':user_id', data.id) + '/' + data.metafield_id, data, ok, err);
        }
      }
    },
    countries: {
      all: function (params, ok, err) {
        _get(API_ENDPOINTS.countries.replace(':language', getLangCode()), params, ok, err);
      },
      add: function (params, ok, err) {
        _post(API_ENDPOINTS.countries.replace(':language', getLangCode()), params, ok, err);
      },
      update: function (data, ok, err) {
        _put(API_ENDPOINTS.countries.replace(':language', getLangCode()) + '/' + data.id, data, ok, err);
      },
      delete: function (data, ok, err) {
        _delete(API_ENDPOINTS.countries.replace(':language', getLangCode()) + '/' + data.id, data, ok, err);
      }
    },
    user_reviews: {
      add: function (data, ok, err) {
        _post(API_ENDPOINTS.user_reviews.replace(':language', getLangCode()).replace(':user_id', data.user_id), data, ok, err);
      },
      all: function (data, ok, err) {
        _get(API_ENDPOINTS.user_reviews.replace(':language', getLangCode()).replace(':user_id', data.user_id), data, ok, err);
      },
    },
    cities: {
      all: function (params, ok, err) {
        _get(API_ENDPOINTS.cities.replace(':language', getLangCode()).replace(':country_id', data.country_id), params, ok, err);
      },
      add: function (data, ok, err) {
        _post(API_ENDPOINTS.cities.replace(':language', getLangCode()).replace(':country_id', data.country_id), data, ok, err);
      },
      update: function (data, ok, err) {
        _put(API_ENDPOINTS.cities.replace(':language', getLangCode()).replace(':country_id', data.country_id) + '/' + data.id, data, ok, err);
      },
      delete: function (data, ok, err) {
        _delete(API_ENDPOINTS.cities.replace(':language', getLangCode()).replace(':country_id', data.country_id) + '/' + data.id, data, ok, err);
      },
    },
    controls: {
      orders: function (params, ok, err) {
        _get(API_ENDPOINTS.controls.replace(':language', getLangCode()), params, ok, err);
      },
      order: function (data, ok, err) {
        _get(API_ENDPOINTS.controls.replace(':language', getLangCode()) + '/' + data.id, data, ok, err);
      }
    },
    business: {
      all: function (params, ok, err) {
        _get(API_ENDPOINTS.business.replace(':language', getLangCode()), params, ok, err);
      },
      get: function (params, ok, err) {
        _get(API_ENDPOINTS.business.replace(':language', getLangCode()) + '/' + params.id_or_slug, params, ok, err);
      },
      add: function (data, ok, err) {
        _post(API_ENDPOINTS.business.replace(':language', getLangCode()), data, ok, err);
      },
      duplicate: function (data, ok, err) {
        _post(API_ENDPOINTS.business.replace(':language', getLangCode()) + '/' + data.id + '/duplicate', data, ok, err);
      },
      update: function (params, ok, err, without_token, allow_null) {
        _post(API_ENDPOINTS.business.replace(':language', getLangCode()) + '/' + params.id, params, ok, err, without_token, allow_null);
      },
      delete: function (params, ok, err) {
        _delete(API_ENDPOINTS.business.replace(':language', getLangCode()) + '/' + params.id, params, ok, err);
      },
      products: function (params, ok, err) {
        _get(API_ENDPOINTS.business.replace(':language', getLangCode()) + '/' + params.id + '/products', params, ok, err);
      },
      validate_cart: function (params, ok, err) {
        _get(API_ENDPOINTS.business.replace(':language', getLangCode()) + '/' + params.id + '/validate_cart', params, ok, err);
      },
      webhooks: {
        // all: function (params, ok, err) {
        //   _get(API_ENDPOINTS.business_webhooks.replace(':language', getLangCode()).replace(':business_id', params.business_id), params, ok, err);
        // },
        add: function (params, ok, err) {
          _post(API_ENDPOINTS.business_webhooks.replace(':language', getLangCode()).replace(':business_id', params.business_id), params, ok, err);
        },
        update: function (params, ok, err) {
          _put(API_ENDPOINTS.business_webhooks.replace(':language', getLangCode()).replace(':business_id', params.business_id) + '/' + params.id, params, ok, err);
        },
        delete: function (params, ok, err) {
          _delete(API_ENDPOINTS.business_webhooks.replace(':language', getLangCode()).replace(':business_id', params.business_id) + '/' + params.id, params, ok, err);
        },
      },
    },
    files: {
      all: function (data, ok, err) {
        _get(API_ENDPOINTS.files.replace(':language', getLangCode()), data, ok, err);
      },
      add: function (data, ok, err) {
        _post(API_ENDPOINTS.files.replace(':language', getLangCode()), data, ok, err);
      },
      delete: function (data, ok, err) {
        _delete(API_ENDPOINTS.files.replace(':language', getLangCode()) + '/' + data.id, data, ok, err);
      }
    },
    pages: {
      all: function (data, ok, err) {
        _get(API_ENDPOINTS.pages.replace(':language', getLangCode()), data, ok, err);
      },
      get: function (data, ok, err) {
        _get(API_ENDPOINTS.pages.replace(':language', getLangCode()) + '/' + data.page_id, data, ok, err);
      },
      add: function (data, ok, err) {
        _post(API_ENDPOINTS.pages.replace(':language', getLangCode()), data, ok, err);
      },
      update: function (data, ok, err) {
        _put(API_ENDPOINTS.pages.replace(':language', getLangCode()) + '/' + data.page_id, data, ok, err);
      },
      delete: function (data, ok, err) {
        _delete(API_ENDPOINTS.pages.replace(':language', getLangCode()) + '/' + data.page_id, data, ok, err);
      }
    },
    reviews: {
      add: function (data, ok, err) {
        _post(API_ENDPOINTS.reviews.replace(':language', getLangCode()).replace(':business_id', data.business_id), data, ok, err);
      },
      update: function (data, ok, err) {
        _put(API_ENDPOINTS.reviews.replace(':language', getLangCode()).replace(':business_id', data.business_id) + '/' + data.id, data, ok, err);
      }
    },
    categories: {
      all: function (data, ok, err) {
        _get(API_ENDPOINTS.categories.replace(':language', getLangCode()).replace(':business_id', data.business_id), data, ok, err);
      },
      add: function (data, ok, err) {
        _post(API_ENDPOINTS.categories.replace(':language', getLangCode()).replace(':business_id', data.business_id), data, ok, err);
      },
      update: function (data, ok, err) {
        _post(API_ENDPOINTS.categories.replace(':language', getLangCode()).replace(':business_id', data.business_id) + '/' + data.id, data, ok, err);
      },
      delete: function (data, ok, err) {
        _delete(API_ENDPOINTS.categories.replace(':language', getLangCode()).replace(':business_id', data.business_id) + '/' + data.id, data, ok, err);
      }
    },
    ingredients: {
      add: function (data, ok, err) {
        _post(API_ENDPOINTS.ingredients.replace(':language', getLangCode()).replace(':business_id', data.business_id).replace(':category_id', data.category_id).replace(':product_id', data.product_id), data, ok, err);
      },
      update: function (data, ok, err) {
        _post(API_ENDPOINTS.ingredients.replace(':language', getLangCode()).replace(':business_id', data.business_id).replace(':category_id', data.category_id).replace(':product_id', data.product_id) + '/' + data.id, data, ok, err);
      },
      delete: function (data, ok, err) {
        _delete(API_ENDPOINTS.ingredients.replace(':language', getLangCode()).replace(':business_id', data.business_id).replace(':category_id', data.category_id).replace(':product_id', data.product_id) + '/' + data.id, data, ok, err);
      }
    },
    business_gallery: {
      add: function (data, ok, err) {
        _post(API_ENDPOINTS.business_gallery.replace(':language', getLangCode()).replace(':business_id', data.business_id), data, ok, err);
      },
      delete: function (data, ok, err) {
        _delete(API_ENDPOINTS.business_gallery.replace(':language', getLangCode()).replace(':business_id', data.business_id) + '/' + data.id, data, ok, err);
      }
    },
    business_customfields: {
      add: function (data, ok, err) {
        _post(API_ENDPOINTS.business_customfields.replace(':language', getLangCode()).replace(':business_id', data.business_id), data, ok, err);
      },
      delete: function (data, ok, err) {
        _delete(API_ENDPOINTS.business_customfields.replace(':language', getLangCode()).replace(':business_id', data.business_id) + '/' + data.id, data, ok, err);
      }
    },
    business_menus_shared: {
      update: function (data, ok, err) {
        _put(API_ENDPOINTS.business_menus_shared.replace(':language', getLangCode()).replace(':business_id', data.business_id) + '/' + data.id, data, ok, err);
      },
      delete: function (data, ok, err) {
        _delete(API_ENDPOINTS.business_menus_shared.replace(':language', getLangCode()).replace(':business_id', data.business_id) + '/' + data.id, data, ok, err);
      },
      products: {
        update: function (data, ok, err) {
          _put(API_ENDPOINTS.business_menus_shared.replace(':language', getLangCode()).replace(':business_id', data.business_id) + '/' + data.menu_id + '/products/' + data.id, data, ok, err);
        },
        extras: {
          update: function (data, ok, err) {
            _put(API_ENDPOINTS.business_menus_shared.replace(':language', getLangCode()).replace(':business_id', data.business_id) + '/' + data.menu_id + '/extras/' + data.extra_id, data, ok, err);
          }
        },
        options: {
          update: function (data, ok, err) {
            _put(API_ENDPOINTS.business_menus_shared.replace(':language', getLangCode()).replace(':business_id', data.business_id) + '/' + data.menu_id + '/options/' + data.option_id, data, ok, err);
          }
        },
        suboptions: {
          update: function (data, ok, err) {
            _put(API_ENDPOINTS.business_menus_shared.replace(':language', getLangCode()).replace(':business_id', data.business_id) + '/' + data.menu_id + '/suboptions/' + data.suboption_id, data, ok, err);
          }
        }
      }
    },
    category_customfields: {
      add: function (data, ok, err) {
        _post(API_ENDPOINTS.category_customfields.replace(':language', getLangCode()).replace(':business_id', data.business_id).replace(':category_id', data.category_id), data, ok, err);
      },
      get: function (data, ok, err) {
        _get(API_ENDPOINTS.category_customfields.replace(':language', getLangCode()).replace(':business_id', data.business_id).replace(':category_id', data.category_id), data, ok, err);
      },
      delete: function (data, ok, err) {
        _delete(API_ENDPOINTS.category_customfields.replace(':language', getLangCode()).replace(':business_id', data.business_id).replace(':category_id', data.category_id) + '/' + data.id, data, ok, err);
      }
    },
    product_customfields: {
      add: function (data, ok, err) {
        _post(API_ENDPOINTS.product_customfields.replace(':language', getLangCode()).replace(':business_id', data.business_id).replace(':category_id', data.category_id).replace(':product_id', data.product_id), data, ok, err);
      },
      get: function (data, ok, err) {
        _get(API_ENDPOINTS.product_customfields.replace(':language', getLangCode()).replace(':business_id', data.business_id).replace(':category_id', data.category_id).replace(':product_id', data.product_id), data, ok, err);
      },
      delete: function (data, ok, err) {
        _delete(API_ENDPOINTS.product_customfields.replace(':language', getLangCode()).replace(':business_id', data.business_id).replace(':category_id', data.category_id).replace(':product_id', data.product_id) + '/' + data.id, data, ok, err);
      }
    },
    product_extra_customfields: {
      add: function (data, ok, err) {
        _post(API_ENDPOINTS.product_extra_customfields.replace(':language', getLangCode()).replace(':business_id', data.business_id).replace(':extra_id', data.extra_id), data, ok, err);
      },
      get: function (data, ok, err) {
        _get(API_ENDPOINTS.product_extra_customfields.replace(':language', getLangCode()).replace(':business_id', data.business_id).replace(':extra_id', data.extra_id), data, ok, err);
      },
      delete: function (data, ok, err) {
        _delete(API_ENDPOINTS.product_extra_customfields.replace(':language', getLangCode()).replace(':business_id', data.business_id).replace(':extra_id', data.extra_id) + '/' + data.id, data, ok, err);
      }
    },
    product_extra_option_customfields: {
      add: function (data, ok, err) {
        _post(API_ENDPOINTS.product_extra_option_customfields.replace(':language', getLangCode()).replace(':business_id', data.business_id).replace(':extra_id', data.extra_id).replace(':option_id', data.option_id), data, ok, err);
      },
      get: function (data, ok, err) {
        _get(API_ENDPOINTS.product_extra_option_customfields.replace(':language', getLangCode()).replace(':business_id', data.business_id).replace(':extra_id', data.extra_id).replace(':option_id', data.option_id), data, ok, err);
      },
      delete: function (data, ok, err) {
        _delete(API_ENDPOINTS.product_extra_option_customfields.replace(':language', getLangCode()).replace(':business_id', data.business_id).replace(':extra_id', data.extra_id).replace(':option_id', data.option_id) + '/' + data.id, data, ok, err);
      }
    },
    product_extra_soption_customfields: {
      add: function (data, ok, err) {
        _post(API_ENDPOINTS.product_extra_soption_customfields.replace(':language', getLangCode()).replace(':business_id', data.business_id).replace(':extra_id', data.extra_id).replace(':option_id', data.option_id).replace(':suboption_id', data.suboption_id), data, ok, err);
      },
      get: function (data, ok, err) {
        _get(API_ENDPOINTS.product_extra_soption_customfields.replace(':language', getLangCode()).replace(':business_id', data.business_id).replace(':extra_id', data.extra_id).replace(':option_id', data.option_id).replace(':suboption_id', data.suboption_id), data, ok, err);
      },
      delete: function (data, ok, err) {
        _delete(API_ENDPOINTS.product_extra_soption_customfields.replace(':language', getLangCode()).replace(':business_id', data.business_id).replace(':extra_id', data.extra_id).replace(':option_id', data.option_id).replace(':suboption_id', data.suboption_id) + '/' + data.id, data, ok, err);
      }
    },
    printers: {
      all: function (data, ok, err) {
        _get(API_ENDPOINTS.printers.replace(':language', getLangCode()), data, ok, err);
      },
    },
    products: {
      all: function (data, ok, err) {
        _get(API_ENDPOINTS.products.replace(':language', getLangCode()).replace(':business_id', data.business_id).replace(':category_id', data.category_id), data, ok, err);
      },
      get: function (data, ok, err) {
        _get(API_ENDPOINTS.products.replace(':language', getLangCode()).replace(':business_id', data.business_id).replace(':category_id', data.category_id) + '/' + data.id, data, ok, err);
      },
      add: function (data, ok, err) {
        _post(API_ENDPOINTS.products.replace(':language', getLangCode()).replace(':business_id', data.business_id).replace(':category_id', data.category_id), data, ok, err);
      },
      update: function (data, ok, err) {
        _post(API_ENDPOINTS.products.replace(':language', getLangCode()).replace(':business_id', data.business_id).replace(':category_id', data.category_id) + '/' + data.id, data, ok, err);
      },
      delete: function (data, ok, err) {
        _delete(API_ENDPOINTS.products.replace(':language', getLangCode()).replace(':business_id', data.business_id).replace(':category_id', data.category_id) + '/' + data.id, data, ok, err);
      },
    },
    bulks_products: {
      add: function (data, ok, err) {
        _post(API_ENDPOINTS.bulks_products.replace(':language', getLangCode()), data, ok, err);
      },
      update: function (data, ok, err) {
        _put(API_ENDPOINTS.bulks_products.replace(':language', getLangCode()), data, ok, err);
      },
      delete: function (data, ok, err) {
        _delete(API_ENDPOINTS.bulks_products.replace(':language', getLangCode()), data, ok, err);
      },
    },
    offers: {
      add: function (data, ok, err) {
        _post(API_ENDPOINTS.offers.replace(':language', getLangCode()).replace(':business_id', data.business_id), data, ok, err);
      },
      get: function (params, ok, err) {
        _get(API_ENDPOINTS.offers.replace(':language', getLangCode()).replace(':business_id', params.business_id) + '/' + params.id, params, ok, err);
      },
      update: function (data, ok, err) {
        _put(API_ENDPOINTS.offers.replace(':language', getLangCode()).replace(':business_id', data.business_id) + '/' + data.id, data, ok, err);
      },
      delete: function (data, ok, err) {
        _delete(API_ENDPOINTS.offers.replace(':language', getLangCode()).replace(':business_id', data.business_id) + '/' + data.id, data, ok, err);
      },
      custom_fields: {
        add: function (data, ok, err) {
          _post(API_ENDPOINTS.offers_customfields.replace(':language', getLangCode()).replace(':business_id', data.business_id).replace(':offer_id', data.offer_id), data, ok, err);
        },
        get: function (data, ok, err) {
          _get(API_ENDPOINTS.offers_customfields.replace(':language', getLangCode()).replace(':business_id', data.business_id).replace(':offer_id', data.offer_id), data, ok, err);
        },
        update: function (data, ok, err) {
          _put(API_ENDPOINTS.offers_customfields.replace(':language', getLangCode()).replace(':business_id', data.business_id).replace(':offer_id', data.offer_id) + '/' + data.id, data, ok, err);
        },
        delete: function (data, ok, err) {
          _delete(API_ENDPOINTS.offers_customfields.replace(':language', getLangCode()).replace(':business_id', data.business_id).replace(':offer_id', data.offer_id) + '/' + data.id, data, ok, err);
        },
      }
    },
    extras: {
      add: function (data, ok, err) {
        _post(API_ENDPOINTS.extras.replace(':language', getLangCode()).replace(':business_id', data.business_id), data, ok, err);
      },
      update: function (data, ok, err) {
        _put(API_ENDPOINTS.extras.replace(':language', getLangCode()).replace(':business_id', data.business_id) + '/' + data.id, data, ok, err);
      },
      delete: function (data, ok, err) {
        _delete(API_ENDPOINTS.extras.replace(':language', getLangCode()).replace(':business_id', data.business_id) + '/' + data.id, data, ok, err);
      }
    },
    options: {
      add: function (data, ok, err) {
        _post(API_ENDPOINTS.options.replace(':language', getLangCode()).replace(':business_id', data.business_id).replace(':extra_id', data.extra_id), data, ok, err);
      },
      update: function (data, ok, err) {
        _post(API_ENDPOINTS.options.replace(':language', getLangCode()).replace(':business_id', data.business_id).replace(':extra_id', data.extra_id) + '/' + data.id, data, ok, err);
      },
      delete: function (data, ok, err) {
        _delete(API_ENDPOINTS.options.replace(':language', getLangCode()).replace(':business_id', data.business_id).replace(':extra_id', data.extra_id) + '/' + data.id, data, ok, err);
      }
    },
    suboptions: {
      add: function (data, ok, err) {
        _post(API_ENDPOINTS.suboptions.replace(':language', getLangCode()).replace(':business_id', data.business_id).replace(':extra_id', data.extra_id).replace(':option_id', data.option_id), data, ok, err);
      },
      update: function (data, ok, err) {
        _post(API_ENDPOINTS.suboptions.replace(':language', getLangCode()).replace(':business_id', data.business_id).replace(':extra_id', data.extra_id).replace(':option_id', data.option_id) + '/' + data.id, data, ok, err);
      },
      delete: function (data, ok, err) {
        _delete(API_ENDPOINTS.suboptions.replace(':language', getLangCode()).replace(':business_id', data.business_id).replace(':extra_id', data.extra_id).replace(':option_id', data.option_id) + '/' + data.id, data, ok, err);
      }
    },
    menus: {
      all: function (params, ok, err) {
        _get(API_ENDPOINTS.menus.replace(':language', getLangCode()).replace(':business_id', params.business_id), params, ok, err);
      },
      add: function (data, ok, err) {
        _post(API_ENDPOINTS.menus.replace(':language', getLangCode()).replace(':business_id', data.business_id), data, ok, err);
      },
      update: function (data, ok, err) {
        _put(API_ENDPOINTS.menus.replace(':language', getLangCode()).replace(':business_id', data.business_id) + '/' + data.id, data, ok, err);
      },
      delete: function (data, ok, err) {
        _delete(API_ENDPOINTS.menus.replace(':language', getLangCode()).replace(':business_id', data.business_id) + '/' + data.id, data, ok, err);
      },
      custom_fields: {
        get: function (params, ok, err) {
          _get(API_ENDPOINTS.menus_customfields.replace(':language', getLangCode()).replace(':business_id', params.business_id).replace(':menu_id', params.menu_id), params, ok, err);
        },
        add: function (data, ok, err) {
          _post(API_ENDPOINTS.menus_customfields.replace(':language', getLangCode()).replace(':business_id', data.business_id).replace(':menu_id', data.menu_id), data, ok, err);
        },
        delete: function (data, ok, err) {
          _delete(API_ENDPOINTS.menus_customfields.replace(':language', getLangCode()).replace(':business_id', data.business_id).replace(':menu_id', data.menu_id) + '/' + data.id, data, ok, err);
        }
      }
    },
    paymethod_credentials: {
      add: function (data, ok, err) {
        _post(API_ENDPOINTS.paymethod_credentials.replace(':language', getLangCode()).replace(':business_id', data.business_id), data, ok, err);
      },
      update: function (data, ok, err) {
        _put(API_ENDPOINTS.paymethod_credentials.replace(':language', getLangCode()).replace(':business_id', data.business_id) + '/' + data.id, data, ok, err);
      },
      delete: function (data, ok, err) {
        _delete(API_ENDPOINTS.paymethod_credentials.replace(':language', getLangCode()).replace(':business_id', data.business_id) + '/' + data.id, data, ok, err);
      }
    },
    deliveryzones: {
      add: function (data, ok, err) {
        _post(API_ENDPOINTS.deliveryzones.replace(':language', getLangCode()).replace(':business_id', data.business_id), data, ok, err);
      },
      update: function (data, ok, err) {
        _put(API_ENDPOINTS.deliveryzones.replace(':language', getLangCode()).replace(':business_id', data.business_id) + '/' + data.id, data, ok, err);
      },
      delete: function (data, ok, err) {
        _delete(API_ENDPOINTS.deliveryzones.replace(':language', getLangCode()).replace(':business_id', data.business_id) + '/' + data.id, data, ok, err);
      }
    },
    dropdownoptions: {
      all: function (params, ok, err) {
        _get(API_ENDPOINTS.dropdownoptions.replace(':language', getLangCode()), params, ok, err);
      },
      add: function (params, ok, err) {
        _post(API_ENDPOINTS.dropdownoptions.replace(':language', getLangCode()), params, ok, err);
      },
      update: function (data, ok, err) {
        _put(API_ENDPOINTS.dropdownoptions.replace(':language', getLangCode()) + '/' + data.id, data, ok, err);
      },
      delete: function (data, ok, err) {
        _delete(API_ENDPOINTS.dropdownoptions.replace(':language', getLangCode()) + '/' + data.id, data, ok, err);
      },
    },
    drivergroups: {
      all: function (params, ok, err) {
        _get(API_ENDPOINTS.drivergroups.replace(':language', getLangCode()), params, ok, err);
      },
      add: function (params, ok, err) {
        _post(API_ENDPOINTS.drivergroups.replace(':language', getLangCode()), params, ok, err);
      },
      update: function (data, ok, err, without_token, allow_null) {
        _put(API_ENDPOINTS.drivergroups.replace(':language', getLangCode()) + '/' + data.id, data, ok, err, without_token, allow_null);
      },
      delete: function (data, ok, err) {
        _delete(API_ENDPOINTS.drivergroups.replace(':language', getLangCode()) + '/' + data.id, data, ok, err);
      }
    },
    configs: {
      all: function (params, ok, err) {
        _get(API_ENDPOINTS.configs.replace(':language', getLangCode()), params, ok, err);
      },
      add: function (data, ok, err) {
        _post(API_ENDPOINTS.configs.replace(':language', getLangCode()), data, ok, err);
      },
      update: function (data, ok, err) {
        _put(API_ENDPOINTS.configs.replace(':language', getLangCode()) + '/' + data.id, data, ok, err);
      }
    },
    paymethods: {
      all: function (params, ok, err) {
        _get(API_ENDPOINTS.paymethods.replace(':language', getLangCode()), params, ok, err);
      },
      update: function (data, ok, err) {
        _put(API_ENDPOINTS.paymethods.replace(':language', getLangCode()) + '/' + data.id, data, ok, err);
      },
    },
    orders: {
      dashboard: function (params, ok, err) {
        _get(API_ENDPOINTS.orders.replace(':language', getLangCode()) + "/dashboard", params, ok, err);
      },
      csv: function (params, ok, err) {
        _get(API_ENDPOINTS.orders.replace(':language', getLangCode()) + ".csv", params, ok, err);
      },
      all: function (params, ok, err) {
        _get(API_ENDPOINTS.orders.replace(':language', getLangCode()), params, ok, err);
      },
      get: function (params, ok, err) {
        _get(API_ENDPOINTS.orders.replace(':language', getLangCode()) + '/' + params.id, params, ok, err);
      },
      add: function (data, ok, err) {
        _post(API_ENDPOINTS.orders.replace(':language', getLangCode()), data, ok, err);
      },
      update: function (data, ok, err, without_token, allow_null) {
        _put(API_ENDPOINTS.orders.replace(':language', getLangCode()) + '/' + data.id, data, ok, err, without_token, allow_null);
      },
      delete: function (params, ok, err) {
        _delete(API_ENDPOINTS.orders.replace(':language', getLangCode()) + '/' + params.id, params, ok, err);
      },
      messages: {
        all: function (params, ok, err) {
          _get(API_ENDPOINTS.order_messages.replace(':language', getLangCode()).replace(':order_id', params.order_id), params, ok, err);
        },
        add: function (data, ok, err) {
          _post(API_ENDPOINTS.order_messages.replace(':language', getLangCode()).replace(':order_id', data.order_id), data, ok, err);
        },
        read: function (params, ok, err) {
          _get(API_ENDPOINTS.order_messages.replace(':language', getLangCode()).replace(':order_id', params.order_id) + '/' + params.order_message_id + '/read', params, ok, err);
        },
      },
      logs: {
        all: function (params, ok, err) {
          _get(API_ENDPOINTS.order_logs.replace(':language', getLangCode()).replace(':order_id', params.order_id), params, ok, err);
        },
      },
      custom_fields: {
        get: function (params, ok, err) {
          _get(API_ENDPOINTS.orders_customfields.replace(':language', getLangCode()).replace(':order_id', params.order_id), params, ok, err);
        },
        add: function (data, ok, err) {
          _post(API_ENDPOINTS.orders_customfields.replace(':language', getLangCode()).replace(':order_id', data.order_id), data, ok, err);
        },
        delete: function (params, ok, err) {
          _delete(API_ENDPOINTS.orders_customfields.replace(':language', getLangCode()).replace(':order_id', params.order_id) + '/' + params.id, params, ok, err);
        }
      },
      metafields: {
        all: function (params, ok, err) {
          _get(API_ENDPOINTS.metafields_order.replace(':language', getLangCode()).replace(':order_id', params.order_id), params, ok, err);
        },
        get: function (params, or, err) {
          _get(API_ENDPOINTS.metafields_order.replace(':language', getLangCode()).replace(':order_id', params.order_id) + '/' + params.id, params, ok, err);
        },
        add: function (data, ok, err) {
          _post(API_ENDPOINTS.metafields_order.replace(':language', getLangCode()).replace(':order_id', data.order_id), data, ok, err);
        },
        update: function (data, ok, err) {
          _put(API_ENDPOINTS.metafields_order.replace(':language', getLangCode()).replace(':order_id', data.order_id) + '/' + data.metafield_id, data, ok, err);
        }
      }
    },
    checkoutfields: {
      all: function (params, ok, err) {
        _get(API_ENDPOINTS.checkoutfields.replace(':language', getLangCode()), params, ok, err);
      },
      update: function (data, ok, err) {
        _put(API_ENDPOINTS.checkoutfields.replace(':language', getLangCode()) + '/' + data.id, data, ok, err);
      }
    },
    validationfields: {
      all: function (params, ok, err) {
        _get(API_ENDPOINTS.validationfields.replace(':language', getLangCode()), params, ok, err);
      },
      update: function (data, ok, err) {
        _put(API_ENDPOINTS.validationfields.replace(':language', getLangCode()) + '/' + data.id, data, ok, err);
      }
    },
    webhooks: {
      all: function (params, ok, err) {
        _get(API_ENDPOINTS.webhooks.replace(':language', getLangCode()), params, ok, err);
      },
      add: function (data, ok, err) {
        _post(API_ENDPOINTS.webhooks.replace(':language', getLangCode()), data, ok, err);
      },
      update: function (data, ok, err) {
        _put(API_ENDPOINTS.webhooks.replace(':language', getLangCode()) + '/' + data.id, data, ok, err);
      },
      delete: function (data, ok, err) {
        _delete(API_ENDPOINTS.webhooks.replace(':language', getLangCode()) + '/' + data.id, data, ok, err);
      },
    },
    plugins: {
      all: function (params, ok, err) {
        _get(API_ENDPOINTS.plugins.replace(':language', getLangCode()), params, ok, err);
      },
      add: function (data, ok, err) {
        _post(API_ENDPOINTS.plugins.replace(':language', getLangCode()), data, ok, err);
      },
      update: function (data, ok, err) {
        _post(API_ENDPOINTS.plugins.replace(':language', getLangCode()) + '/' + data.id, data, ok, err);
      },
      delete: function (data, ok, err) {
        _delete(API_ENDPOINTS.plugins.replace(':language', getLangCode()) + '/' + data.id, data, ok, err);
      },
    },
    payments: {
      pay: function (data, ok, err) {
        _post(API_ENDPOINTS.payments.replace(':language', getLangCode()).replace(':gateway', data.gateway), data, ok, err);
      },
      confirm: function (data, ok, err) {
        _post(API_ENDPOINTS.payments.replace(':language', getLangCode()).replace(':gateway', data.gateway) + '/confirm', data, ok, err);
      },
      capture: function (data, ok, err) {
        _post(API_ENDPOINTS.payments.replace(':language', getLangCode()).replace(':gateway', data.gateway) + '/capture', data, ok, err);
      },
      requirements: function (params, ok, err) {
        _get(API_ENDPOINTS.payments.replace(':language', getLangCode()).replace(':gateway', params.gateway) + '/requirements', params, ok, err);
      },
      credentials: function (data, ok, err) {
        _get(API_ENDPOINTS.payments.replace(':language', getLangCode()).replace(':gateway', data.gateway) + '/credentials', data, ok, err);
      },
      refund: function (data, ok, err) {
        _post(API_ENDPOINTS.payments.replace(':language', getLangCode()).replace(':gateway', data.gateway) + '/refund', data, ok, err);
      },
      cards: {
        all: function (data, ok, err) {
          _get(API_ENDPOINTS.payments.replace(':language', getLangCode()).replace(':gateway', data.gateway) + '/cards', data, ok, err);
        },
        add: function (data, ok, err) {
          _post(API_ENDPOINTS.payments.replace(':language', getLangCode()).replace(':gateway', data.gateway) + '/cards', data, ok, err);
        },
        default: function (data, ok, err) {
          _post(API_ENDPOINTS.payments.replace(':language', getLangCode()).replace(':gateway', data.gateway) + '/cards/default', data, ok, err);
        },
        delete: function (data, ok, err) {
          _delete(API_ENDPOINTS.payments.replace(':language', getLangCode()).replace(':gateway', data.gateway) + '/cards', data, ok, err);
        },
      }
    },
    notifications: {
      add: function (data, ok, err) {
        _post(API_ENDPOINTS.notifications.replace(':language', getLangCode()).replace(':user_id', data.user_id), data, ok, err);
      },
    },
    reports: {
      topSelling: function (params, ok, err) {
        _get(API_ENDPOINTS.reports.replace(':language', getLangCode()) + '/top_selling', params, ok, err);
      },
      topCategories: function (params, ok, err) {
        _get(API_ENDPOINTS.reports.replace(':language', getLangCode()) + '/top_categories', params, ok, err);
      },
      ordersStatus: function (params, ok, err) {
        _get(API_ENDPOINTS.reports.replace(':language', getLangCode()) + '/orders_status', params, ok, err);
      },
      ordersAcceptSpend: function (params, ok, err) {
        _get(API_ENDPOINTS.reports.replace(':language', getLangCode()) + '/orders_accept_spend', params, ok, err);
      },
      customerSatisfaction: function (params, ok, err) {
        _get(API_ENDPOINTS.reports.replace(':language', getLangCode()) + '/customer_satisfaction', params, ok, err);
      },
      sales: function (params, ok, err) {
        _get(API_ENDPOINTS.reports.replace(':language', getLangCode()) + '/sales', params, ok, err);
      },
      orders: function (params, ok, err) {
        _get(API_ENDPOINTS.reports.replace(':language', getLangCode()) + '/orders', params, ok, err);
      },
      ordersArrivedPickupSpend: function (params, ok, err) {
        _get(API_ENDPOINTS.reports.replace(':language', getLangCode()) + '/arrived_pickup_spend', params, ok, err);
      },
      users: function (params, ok, err) {
        _get(API_ENDPOINTS.reports.replace(':language', getLangCode()) + '/users', params, ok, err);
      },
      order_location: function (params, ok, err) {
        _get(API_ENDPOINTS.reports.replace(':language', getLangCode()) + '/order_location', params, ok, err);
      },
      app_ids: function (params, ok, err) {
        _get(API_ENDPOINTS.reports.replace(':language', getLangCode()) + '/app_ids', params, ok, err);
      },
      hours_report: function (params, ok, err) {
        _get(API_ENDPOINTS.reports.replace(':language', getLangCode()) + '/hours_report', params, ok, err);
      },
      grouping_report: function (params, ok, err) {
        _get(API_ENDPOINTS.reports.replace(':language', getLangCode()) + '/grouping_report', params, ok, err);
      },
      products_report: function (params, ok, err) {
        _get(API_ENDPOINTS.reports.replace(':language', getLangCode()) + '/products_report', params, ok, err);
      },
      download_report: function (endpoint, params, ok, err) {
        params.download = true;
        _download(API_ENDPOINTS.reports.replace(':language', getLangCode()) + "/" + endpoint, params, ok, err);
      },
    },
    driver_reports: {
      topSelling: function (params, ok, err) {
        _get(API_ENDPOINTS.reports.replace(':language', getLangCode()) + '/drivers_top_selling', params, ok, err);
      },
      topCategories: function (params, ok, err) {
        _get(API_ENDPOINTS.reports.replace(':language', getLangCode()) + '/drivers_top_categories', params, ok, err);
      },
      topOrders: function (params, ok, err) {
        _get(API_ENDPOINTS.reports.replace(':language', getLangCode()) + '/drivers_top_orders', params, ok, err);
      },
      ordersStatus: function (params, ok, err) {
        _get(API_ENDPOINTS.reports.replace(':language', getLangCode()) + '/drivers_orders_status', params, ok, err);
      },
      ordersAcceptSpend: function (params, ok, err) {
        _get(API_ENDPOINTS.reports.replace(':language', getLangCode()) + '/drivers_accept_spend', params, ok, err);
      },
      ordersPickupSpend: function (params, ok, err) {
        _get(API_ENDPOINTS.reports.replace(':language', getLangCode()) + '/drivers_pickup_spend', params, ok, err);
      },
      ordersDeliverySpend: function (params, ok, err) {
        _get(API_ENDPOINTS.reports.replace(':language', getLangCode()) + '/drivers_delivery_spend', params, ok, err);
      },
      ordersCompleteSpend: function (params, ok, err) {
        _get(API_ENDPOINTS.reports.replace(':language', getLangCode()) + '/drivers_complete_spend', params, ok, err);
      },
      ordersArrivedPickupSpend: function (params, ok, err) {
        _get(API_ENDPOINTS.reports.replace(':language', getLangCode()) + '/drivers_arrived_pickup_spend', params, ok, err);
      },
      // customerSatisfaction: function (params, ok, err) {
      //   _get(API_ENDPOINTS.reports.replace(':language', getLangCode())+'/customer_satisfaction', params, ok, err);
      // },
      sales: function (params, ok, err) {
        _get(API_ENDPOINTS.reports.replace(':language', getLangCode()) + '/drivers_sales', params, ok, err);
      },
      orders: function (params, ok, err) {
        _get(API_ENDPOINTS.reports.replace(':language', getLangCode()) + '/orders_drivers', params, ok, err);
      },
      spend_times: function (params, ok, err) {
        _get(API_ENDPOINTS.reports.replace(':language', getLangCode()) + '/drivers_spend_times', params, ok, err);
      },
      available_times: function (params, ok, err) {
        _get(API_ENDPOINTS.reports.replace(':language', getLangCode()) + '/drivers_available_times', params, ok, err);
      },
      busy_times: function (params, ok, err) {
        _get(API_ENDPOINTS.reports.replace(':language', getLangCode()) + '/drivers_busy_times', params, ok, err);
      },
      order_location: function (params, ok, err) {
        _get(API_ENDPOINTS.reports.replace(':language', getLangCode()) + '/drivers_order_location', params, ok, err);
      },
    },
    limits: {
      get: function (params, ok, err) {
        _get(API_ENDPOINTS.limits.replace(':language', getLangCode()), params, ok, err);
      },
    },
    logistic: {
      orders: {
        information: function (params, ok, err) {
          _get(API_ENDPOINTS.logistic_orders.replace(':language', getLangCode()).replace(':order_id', params.id) + '/information', params, ok, err);
        }
      }
    },
    driver_companies: {
      all: function (params, ok, err) {
        _get(API_ENDPOINTS.driver_companies.replace(':language', getLangCode()), params, ok, err);
      },
      add: function (data, ok, err) {
        _post(API_ENDPOINTS.driver_companies.replace(':language', getLangCode()), data, ok, err);
      },
      update: function (data, ok, err) {
        _post(API_ENDPOINTS.driver_companies.replace(':language', getLangCode()) + '/' + data.id, data, ok, err);
      },
      delete: function (data, ok, err) {
        _delete(API_ENDPOINTS.driver_companies.replace(':language', getLangCode()) + '/' + data.id, data, ok, err);
      },
    },
    business_types: {
      all: function (params, ok, err) {
        _get(API_ENDPOINTS.business_types.replace(':language', getLangCode()), params, ok, err);
      },
      get: function (params, ok, err) {
        _get(API_ENDPOINTS.business_types.replace(':language', getLangCode()) + '/' + params.id, params, ok, err);
      },
      add: function (data, ok, err) {
        _post(API_ENDPOINTS.business_types.replace(':language', getLangCode()), data, ok, err);
      },
      update: function (data, ok, err) {
        _post(API_ENDPOINTS.business_types.replace(':language', getLangCode()) + '/' + data.id, data, ok, err);
      },
      delete: function (data, ok, err) {
        _delete(API_ENDPOINTS.business_types.replace(':language', getLangCode()) + '/' + data.id, data, ok, err);
      }
    },
    custom: {
      get: _get,
      post: _post,
      put: _put,
      delete: _delete
    },
    order_groups: {
      all: function (params, ok, err) {
        _get(API_ENDPOINTS.order_groups.replace(':language', getLangCode()), params, ok, err);
      },
    },
    boxeteAPI: {
      squareAPI: function (data, ok, err) {
        _post(API_ENDPOINTS.boxete_square_api_url, data, ok, err);
      },
      doordashAPI: function (data, ok, err) {
        _post(API_ENDPOINTS.boxete_doordash_api_url, data, ok, err);
      },
    },

  };
});
