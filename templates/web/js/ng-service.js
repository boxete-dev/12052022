_services.service('gmultiBusiness', function() {
  var multibusdata = [];
  this.setData = function(obj) {
    localStorageApp.setItem("multi_business", JSON.stringify(obj));
    multibusdata = obj;
  };
  this.getData = function() {
    if (localStorageApp.getItem("multi_business")) multibusdata = JSON.parse(localStorageApp.getItem("multi_business"));
    return multibusdata;
  };
});

_services.service('gmultiConfirm', function() {
  var multiconfdata = [];
  this.setData = function(obj) {
    localStorageApp.setItem("multi_confirmation", JSON.stringify(obj));
    multiconfdata = obj;
  };
  this.getData = function() {
    if (localStorageApp.getItem("multi_confirmation")) multiconfdata = JSON.parse(localStorageApp.getItem("multi_confirmation"));
    return multiconfdata;
  };
});
