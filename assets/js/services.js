var _services = angular.module('orderingApp.services', []);
_services.service('gNearService', function() {
    var gNearService = this;
    gNearService.sharedObject = {};

    gNearService.getData = function(){
        if (!gNearService.sharedObject.nearAddress && localStorageApp.getItem(STORE.NEAR_SERVICE)) gNearService.sharedObject = JSON.parse(localStorageApp.getItem(STORE.NEAR_SERVICE));
        return gNearService.sharedObject;
    };

    gNearService.setData = function(value){
        localStorageApp.setItem(STORE.NEAR_SERVICE, JSON.stringify(value));
        gNearService.sharedObject = value;
    }
});

_services.service('gUser', function() {

    var userData = {};
    this.setData = function(obj) {
        localStorageApp.setItem(STORE.USER, JSON.stringify(obj));
        userData = obj;
    };
    this.getData = function() {
        var local = localStorageApp.getItem(STORE.USER);
        if (local && JSON.parse(local).id) userData = JSON.parse(localStorageApp.getItem(STORE.USER));
        else if (!userData.id) {
            var user = {
                id: -1,
                name: '',
                lastname: '',
                email: '',
            };
            localStorageApp.setItem(STORE.USER, JSON.stringify(user));
            userData = user;
        }
        return userData;
    };

    this.isLogged = function() {
        var user = this.getData();
        return user.id && user.id > 0;
    }
});

_services.service('gAddress', function($rootScope) {
    this.onchange_callback = null;
    this.timeoutChange = null;
    this.setData = function(new_address, avoid_event) {
        $rootScope.sharedData.curAddress = new_address;
        localStorageApp.setItem(STORE.ADDRESS, JSON.stringify(new_address));
        if (this.onchange_callback && !avoid_event) {
            if (this.timeoutChange) clearTimeout(this.timeoutChange);
            that = this;
            this.timeoutChange = setTimeout(function () {
                if (that.onchange_callback) that.onchange_callback(new_address);
            }, 250);
        }
    };
    this.getData = function() {
        var address = localStorageApp.getItem(STORE.ADDRESS);
        if (address == 'null') return address;
        address = JSON.parse(address);
        return address;
    };
    this.onChange = function(callback) {
        this.onchange_callback = callback;
    };
    this.hasAddress = function () {
        return this.getData() != null && this.getData() != 'null';
    }
});

_services.service('gAllBusiness',function(){

    var businessData = [];
    var _cb = null;
    this.setData = function(obj) {
        localStorageApp.setItem(STORE.ALL_BUSINESS, JSON.stringify(obj));
        businessData = obj;
        if (_cb) _cb(businessData);
    };
    this.getData = function() {
        if (businessData.length == 0 && localStorageApp.getItem(STORE.ALL_BUSINESS)) businessData = JSON.parse(localStorageApp.getItem(STORE.ALL_BUSINESS));
        return businessData;
    };
    this.onChange = function (cb) {
        _cb = cb;
    }
});

_services.service('gCurDishList', function() {
    var gCurDishList = this;
    gCurDishList.sharedObject = {};

    gCurDishList.getData = function(){
        return gCurDishList.sharedObject;
    };

    gCurDishList.setData = function(value){
        gCurDishList.sharedObject = value;
    }
});

_services.service('gPreorder',function(){
    var gPreorder = {};
    this.setData = function(obj) {
        localStorageApp.setItem(STORE.PREORDER, JSON.stringify(obj));
        gPreorder = obj;
    };
    this.getData = function() {
        if (!gPreorder.menu && localStorageApp.getItem(STORE.PREORDER)) gPreorder = JSON.parse(localStorageApp.getItem(STORE.PREORDER));
        return gPreorder;
    };
});

_services.service('gCreateOrderBuyer',function(){
    var gCreateOrderBuyer = {};
    this.setData = function(obj) {
        localStorageApp.setItem(STORE.CREATE_ORDER_BUYER, JSON.stringify(obj));
        gCreateOrderBuyer = obj;
    };
    this.getData = function() {
        if (!gCreateOrderBuyer.id && localStorageApp.getItem(STORE.CREATE_ORDER_BUYER)) gCreateOrderBuyer = JSON.parse(localStorageApp.getItem(STORE.CREATE_ORDER_BUYER));
        return gCreateOrderBuyer;
    };
});

_services.service('gStates',function(){
    var gState = {};
    this.setState = function(obj) {
        gState = obj;
    };
    this.getState = function() {
        return gState;
    };
});

_services.service('gCart', function($rootScope) {
  var cart = [];
  this.setData = function(obj) {
    localStorageApp.setItem(STORE.CART, JSON.stringify(obj));
    cart = obj;
    $rootScope.refreshNumCart()
  };
  this.getData = function() {
    if (localStorageApp.getItem(STORE.CART)) cart = JSON.parse(localStorageApp.getItem(STORE.CART));
    return cart;
  };
});

_services.service('gBusiness', function($rootScope) {
  var business = {};
  this.setData = function(obj) {
    if (!$rootScope.NEW_FEATURES.DISABLE_BUSINESS_LOCAL_STORAGE) localStorageApp.setItem(STORE.BUSINESS, JSON.stringify(obj));
    business = obj;
  };
  this.getData = function() {
    if (localStorageApp.getItem(STORE.BUSINESS) && !$rootScope.NEW_FEATURES.DISABLE_BUSINESS_LOCAL_STORAGE) business = JSON.parse(localStorageApp.getItem(STORE.BUSINESS));
    return business;
  };
});

_services.service('gOrder', function() {
  var order = {};
  this.setData = function(obj) {
    localStorageApp.setItem(STORE.ORDER, JSON.stringify(obj));
    order = obj;
  };
  this.getData = function() {
    if (localStorageApp.getItem(STORE.ORDER)) order = JSON.parse(localStorageApp.getItem(STORE.ORDER));
    return order;
  };
});

_services.service('gConfirm', function() {
  var confirm = {};
  this.setData = function(obj) {
    localStorageApp.setItem(STORE.CONFIRM, JSON.stringify(obj));
    confirm = obj;
  };
  this.getData = function() {
    if (localStorageApp.getItem(STORE.CONFIRM)) confirm = JSON.parse(localStorageApp.getItem(STORE.CONFIRM));
    return confirm;
  };
});

_services.service('gNext',function(){
    var next = null;
    this.set = function(url) {
        next = url;
    };
    this.get = function() {
        var aux = next+'';
        next = null;
        return aux;
    };
});

_services.service('gProject', function() {
    var project = null;
    this.setData = function(text) {
      localStorageApp.setItem(STORE.PROJECT, text);
      project = text;
    };
    this.getData = function() {
      if (localStorageApp.getItem(STORE.PROJECT)) project = localStorageApp.getItem(STORE.PROJECT);
      return project;
    };
});

_services.service('$cordovaLaunchNavigator', ['$q', function ($q) {
    "use strict";

    var $cordovaLaunchNavigator = {};
    $cordovaLaunchNavigator.navigate = function (destination, options) {
        var q = $q.defer(),
            isRealDevice = ionic.Platform.isWebView();

        if (!isRealDevice) {
            q.reject("launchnavigator will only work on a real mobile device! It is a NATIVE app launcher.");
        } else {
            try {

                var successFn = options.successCallBack || function () {
                        },
                    errorFn = options.errorCallback || function () {
                        },
                    _successFn = function () {
                        successFn();
                        q.resolve();
                    },
                    _errorFn = function (err) {
                        errorFn(err);
                        q.reject(err);
                    };

                options.successCallBack = _successFn;
                options.errorCallback = _errorFn;

                launchnavigator.navigate(destination, options);
            } catch (e) {
                q.reject("Exception: " + e.message);
            }
        }
        return q.promise;
    };

    return $cordovaLaunchNavigator;
}]);
