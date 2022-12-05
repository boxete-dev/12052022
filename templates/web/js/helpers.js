var scrollDisableControl = null;
var scrollEnableControl = null;
var CUSTOM_SERVER_URL = "https://plugins-development-2.ordering.co/boxetekitchen/";

function getScrollTop() {
  var scrolltop_body = document.body.scrollTop;
  var scrolltop_html = document.querySelector('html').scrollTop;
  if (scrolltop_body > 0) return scrolltop_body;
  if (scrolltop_html > 0) return scrolltop_html;
  return 0;
}

function disableScroll() {
  if (scrollEnableControl) clearTimeout(scrollEnableControl);
  scrollDisableControl = setTimeout(function () {
    if (IFRAME_INLINE) {
      window.parent.postMessage({ event: 'scroll', data: { enable: false } }, '*');
    }
    $('html').css({ 'overflow-y': 'hidden' });
    $('body').css({ 'overflow-y': 'hidden' });
  }, 200);
}

function enableScroll() {
  if (scrollDisableControl) clearTimeout(scrollDisableControl);
  scrollEnableControl = setTimeout(function () {
    if (IFRAME_INLINE) {
      window.parent.postMessage({ event: 'scroll', data: { enable: true } }, '*');
    }
    $('html').css({ 'overflow-y': 'auto' });
    $('body').css({ 'overflow-y': 'auto' });
  }, 200);
}

function backdropAlert(show) {
  if (show) $('.backdrop').last().addClass('backdrop-alert');
  else $('.backdrop').last().removeClass('backdrop-alert');
}

function scrollToAlert() {
  if (!NEW_FEATURES.FLEX_HEIGHT) {
    var ealert = $('.popup-container.popup-showing.active').last();
    var popup = ealert.find('.popup').last();
    setTimeout(function () {
      if (ealert.length == 0) return scrollToAlert();
      if (IFRAME_INLINE) {
        ealert.css({ bottom: 'auto', top: PARENT_DATA.top + (PARENT_DATA.height / 2) - (popup.outerHeight() / 2) - PARENT_DATA.offsetTop });
      } else {
        var curScroll = ($('html').scrollTop() > $('body').scrollTop()) ? $('html').scrollTop() : $('body').scrollTop();
        var mtop = curScroll + (($(window).outerHeight() - popup.outerHeight()) / 2);
        ealert.css({ bottom: 'auto', top: mtop });
      }
    }, 50);
  } else {
    var popup_container = $('.popup-container.popup-showing.active').last();
    var popup = popup_container.find('.popup').last();
    setTimeout(function () {
      if (popup_container.length == 0) return scrollToAlert();
      if (IFRAME_INLINE) {
        popup_container.css({ bottom: 'auto', top: PARENT_DATA.top + (PARENT_DATA.height / 2) - (popup.outerHeight() / 2) - PARENT_DATA.offsetTop });
      } else {
        var scrolltop = getScrollTop();
        var mtop = scrolltop + ((window.innerHeight - popup.outerHeight()) / 2);
        popup_container.css({ bottom: 'auto', top: mtop });
      }
    }, 10);
  }
}

function scrollToLoading() {
  setTimeout(function () {
    var loading_container = $('.loading-container.visible.active').last();
    if (loading_container.length > 0) {
      var loading = loading_container.find('.loading').last();
      loading_container.css({
        'padding-top': ((loading_container.height() / 2) - (loading.height() / 2)) + 'px'
      });
    }
  }, 50);
}

var intervalFixHeight = null;
function fixHeight(selector, by_body) {
  if (NEW_FEATURES.FLEX_HEIGHT) {
    var last_height = null;
    if (intervalFixHeight != null) clearInterval(intervalFixHeight);
    intervalFixHeight = setInterval(function () {
      var footer = document.querySelector('.footer');
      var header = document.querySelector('.navbar');
      var selected = document.querySelector('.main ' + selector);
      if (!selected) {
        clearInterval(intervalFixHeight);
        intervalFixHeight = null;
      } else {
        var cur_height = (window.innerHeight - footer.offsetHeight - header.offsetHeight) + 'px';
        if (last_height != cur_height) {
          selected.style.minHeight = cur_height;
          last_height = cur_height;
        }
      }
    }, 50);
    return;
  }
  if (intervalFixHeight != null) clearInterval(intervalFixHeight);
  intervalFixHeight = setInterval(function () {
    var footer = $('.footer').last();
    var header = $('.navbar').last();
    var editor = ($('.navbar.editor').last().length == 0) ? 0 : $('.navbar.editor').last().outerHeight();
    var div = $(selector).last();
    var body = $('html').last();
    div.css({ 'min-height': 'auto' });
    if ($(window).width() > 768) {
      lastBodyHeight = body.outerHeight();
      if (!div.is(":visible")) clearInterval(intervalFixHeight);
      // div.css({ 'min-height': 'auto'});
      // if ($(window).width() < 768) {
      //     div.css({ 'min-height': 'auto'});
      // } else 
      // } else 
      // } else 
      if (window.self === window.top) {
        if (by_body === true) {
          if ($(window).height() > footer.outerHeight() + header.outerHeight() + editor + div.outerHeight()) {
            div.css({ 'min-height': $(window).height() - footer.outerHeight() - header.outerHeight() - editor });
          } else {
            div.css({ 'min-height': body.outerHeight() - footer.outerHeight() - header.outerHeight() - editor });
          }
        } else if ($(window).height() > footer.outerHeight() + header.outerHeight() + editor + div.outerHeight()) {
          div.css({ 'min-height': $(window).height() - footer.outerHeight() - header.outerHeight() - editor });
        }
      }
    }
  }, 100);
}

var mouseover = false;
var totalheight = 0;
setInterval(function () {
  if ($(".navbar-nav > li > .dropdown-menu").length > 0 && $(".navbar-nav > li > .dropdown-menu").is(":visible")) {
    if (!mouseover) {
      mouseover = true;
      $(".navbar-nav > li > .dropdown-menu").on('mouseover', function () {
        disableScroll();
      });
      $(".navbar-nav > li > .dropdown-menu").on('mouseleave', function () {
        enableScroll();
      });
    }
  } else {
    mouseover = false;
    $(".navbar-nav > li > .dropdown-menu").off('mouseover');
    $(".navbar-nav > li > .dropdown-menu").off('mouseleave');
    if ($('.modal-backdrop.active').length > 0) {
      disableScroll();
    } else {
      enableScroll();
    }
  }
  if (ADDONS.web_template && !NEW_FEATURES.FLEX_HEIGHT) {
    var footer = $('.container.footer');
    totalheight = (footer.outerHeight() > totalheight + 2 || footer.outerHeight() < totalheight - 2) ? footer.outerHeight() : totalheight;
    if (footer.css('position') == 'absolute') $('body').css({ 'margin-bottom': totalheight + 'px' });
    else $('body').css({ 'margin-bottom': '0px' });
  }
}, 100);

function moveStickyElemets(totop, target) {
  var header = $('.navbar').last();
  var cover = $('.cover').last();
  var editor = ($('.navbar.editor').last().length == 0) ? 0 : $('.navbar.editor').last().outerHeight();
  var business_content = $('.business-content').last();
  var limit = header.height() + cover.height() + business_content.height() + editor;
  if (!NEW_FEATURES.BUSINESS_PAGE) {
    target = window;
  } else {
    $('.offset-categories').css({
      height: '100px',
      overflow: 'hidden'
    });
  }
  if (limit > $(target).scrollTop() && !(IFRAME_INLINE && limit < PARENT_DATA.top - PARENT_DATA.offsetTop) || totop) {
    $('#categories-tabs').removeClass('fixed').css({
      width: '100%'
    });
  } else {
    $('#categories-tabs').removeClass('fixed');
    $('#categories-tabs').addClass('fixed').css({
      width: cover.width(),
      top: (IFRAME_INLINE) ? PARENT_DATA.top - PARENT_DATA.offsetTop : 0
    }, 1000);
  }
  if (!NEW_FEATURES.BUSINESS_PAGE) $('.offset-categories').css('height', $('#categories-tabs').height());
  var cart_stiky = $('#cart-stiky').last();
  var cart = $('.cart').last();
  var footer = $('.footer').last();
  var superElement = ($('html').outerHeight() >= $('body').outerHeight()) ? $('html') : $('body');
  if (NEW_FEATURES.BUSINESS_PAGE) {
    superElement = $('body article').first();
  }
  var cartBottom = (superElement.outerHeight() - footer.outerHeight()) - ($(target).scrollTop() + cart_stiky.outerHeight());
  var showFooter = superElement.outerHeight() - $(target).scrollTop() - footer.outerHeight() - $(window).outerHeight();
  if (IFRAME_INLINE) {
    cartBottom = (superElement.outerHeight() - footer.outerHeight()) - ((PARENT_DATA.top - PARENT_DATA.offsetTop) + cart_stiky.outerHeight());
    showFooter = superElement.outerHeight() - (PARENT_DATA.top - PARENT_DATA.offsetTop) - footer.outerHeight() - $(window).outerHeight();
  }
  if ($(window).width() < 768) {
    cart_stiky.removeClass('fixed').removeClass('bottom').css({
      'width': '100%',
      'margin-bottom': 0
    });
    cart.css({ 'height': 'auto' });
  } else if (($(target).scrollTop() >= header.outerHeight() + editor && cart_stiky.outerHeight() <= $(window).outerHeight() /*&& cart_stiky.outerHeight()+footer.outerHeight()+header.outerHeight() < $(window).outerHeight()*/) || (IFRAME_INLINE && PARENT_DATA.top - PARENT_DATA.offsetTop >= header.outerHeight() + editor && cart_stiky.outerHeight() <= PARENT_DATA.height) && !totop) {
    cart.css({ 'height': cart_stiky.outerHeight() });
    if (cartBottom <= 0) {
      cart_stiky.addClass('fixed').addClass('bottom').css({
        'width': cart.width(),
        'margin-bottom': (showFooter + 2) * -1,
        // 'top': IFRAME_INLINE?PARENT_DATA.top-PARENT_DATA.offsetTop:0
      });
      if (IFRAME_INLINE) cart_stiky.css({
        'top': 'auto',
        //  'bottom': footer.outerHeight()
      });
    } else {
      cart_stiky.addClass('fixed').removeClass('bottom').css({
        'width': cart.width(),
        'margin-bottom': 0,
      });
      cart.height(cart_stiky.outerHeight());
      if (IFRAME_INLINE) cart_stiky.css({
        'top': PARENT_DATA.top - PARENT_DATA.offsetTop
      });
    }
  } else {
    cart_stiky.removeClass('fixed').removeClass('bottom').css({
      'width': cart.width(),
      'margin-bottom': 0
    });
    cart.css({ 'height': 'auto' });
  }
}

function businessRefreshScroll() {
  setTimeout(function () {
    // $('body').off('scroll');
    // $(window).off('scroll');
    $('body').on('scroll', function () {
      moveStickyElemets(false, 'body');
    });
    $(window).on('scroll', function () {
      moveStickyElemets(false, 'html');
    });
  }, 100);
}

var events_category_images = {
  click: function (e) {
    e.stopPropagation();
    curCategory = this.dataset.categoryId;
    document.getElementById(this.dataset.categoryId + '_file').click();
  },
  dragover: function (e) {
    this.className = "drag active";
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  },
  dragleave: function (e) {
    this.className = "drag";
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  },
  drop: function (e) {
    this.className = "drag";
    var that = this;
    e.stopPropagation();
    e.preventDefault();
    var files = e.dataTransfer.files;
    checkImage(files[0], function (err, img) {
      events_category_images.cb(err, that.dataset.categoryId, img)
    }, events_category_images.width, events_category_images.height);
  },
  change: function (e) {
    e.stopPropagation();
    checkImage(this.files[0], function (err, img) {
      events_category_images.cb(err, curCategory, img)
    }, events_category_images.width, events_category_images.height);
  }
};

function initDragDropCategoriesImage(cb, width, height) {
  var products = document.querySelectorAll('.category .img .drag');
  var curCategory = null;
  events_category_images.cb = cb;
  events_category_images.width = width;
  events_category_images.height = height;
  for (var i = 0; i < products.length; i++) {
    var element = products[i];
    var input = document.getElementById(element.dataset.categoryId + '_file');

    element.removeEventListener('click', events_category_images.click);
    element.removeEventListener('dragover', events_category_images.dragover);
    element.removeEventListener('dragleave', events_category_images.dragleave);
    element.removeEventListener('drop', events_category_images.drop);
    input.removeEventListener('change', events_category_images.change);

    element.addEventListener('click', events_category_images.click, false);
    element.addEventListener('dragover', events_category_images.dragover, false);
    element.addEventListener('dragleave', events_category_images.dragleave, false);
    element.addEventListener('drop', events_category_images.drop, false);
    input.addEventListener('change', events_category_images.change, false);
  }
}

function initDragDropProducts(cb, width, height) {
  var products = document.querySelectorAll('.dishes .dishe .drag');
  var curProduct = null;
  for (var i = 0; i < products.length; i++) {
    var element = products[i];
    var input = document.getElementById(element.dataset.productId + '_file');
    element.addEventListener('click', function (e) {
      curProduct = this.dataset.productId;
      document.getElementById(this.dataset.productId + '_file').click();
    }, false);
    element.addEventListener('dragover', function (e) {
      this.className = "drag active";
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }, false);
    element.addEventListener('dragleave', function (e) {
      this.className = "drag";
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }, false);
    element.addEventListener('drop', function (e) {
      this.className = "drag";
      var that = this;
      e.stopPropagation();
      e.preventDefault();
      var files = e.dataTransfer.files;
      checkImage(files[0], function (err, img) {
        cb(err, that.dataset.productId, img)
      }, width, height);
    }, false);
    input.addEventListener('change', function (e) {
      checkImage(this.files[0], function (err, img) {
        cb(err, curProduct, img)
      }, width, height);
    }, false);
  }
}

function initDragDropProductsMulti(cb, width, height) {
  var products = document.querySelectorAll('.dishes .disheMulti .drag');
  var curProduct = null;
  var html_progress_images = document.getElementById("progress_images");
  for (var i = 0; i < products.length; i++) {
    var element = products[i];
    var input = document.getElementById(element.dataset.productId + '_file');
    element.addEventListener('click', function (e) {
      curProduct = this.dataset.productId;
      document.getElementById(this.dataset.productId + '_file').click();
    }, false);
    element.addEventListener('dragover', function (e) {
      this.className = "drag active";
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }, false);
    element.addEventListener('dragleave', function (e) {
      this.className = "drag";
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }, false);
    element.addEventListener('drop', function (e) {
      curProduct = this.dataset.productId;
      this.className = "drag";
      var that = this;
      e.stopPropagation();
      e.preventDefault();
      var files = e.dataTransfer.files;
      myWaitFunct = function (receivedimage, progress_images) {
        html_progress_images.innerHTML = "(" + (progress_images + 1) + "/" + files.length + ")";
        checkImages(receivedimage, function (err, img, productId) {
          if (img) {
            cb(err, that.dataset.productId, img, productId);
          } else {
            cb(err, that.dataset.productId, 'img', receivedimage);
          }
        }, width, height);
      }
      if (curProduct == -2) {
        for (var i = 0; i < files.length; i++) {
          setTimeout(myWaitFunct, i * 2000, files[i], i);
        }
      }
    }, false);
    input.addEventListener('change', function (e) {
      var lengthFiles = this.files.length;
      myWaitFunct = function (receivedimage, progress_images) {
        html_progress_images.innerHTML = "(" + (progress_images + 1) + "/" + lengthFiles + ")";
        checkImages(receivedimage, function (err, img, productId) {
          if (img) {
            cb(err, curProduct, img, productId);
          } else {
            cb(err, curProduct, 'img', receivedimage);
          }
        }, width, height);
      }
      if (curProduct == -2) {
        for (var i = 0; i < this.files.length; i++) {
          setTimeout(myWaitFunct, i * 2000, this.files[i], i);
        }
      }
    }, false);
  }
}

function initDragDropOption(cb, width, height) {
  var options = document.querySelectorAll('.option-image .drag');
  var curOption = null;
  for (var i = 0; i < options.length; i++) {
    var element = options[i];
    if (element.dataset.optionDrag) continue;
    element.dataset.optionDrag = 'true';
    var input = document.getElementById(element.dataset.optionId + '_file');
    element.addEventListener('click', function (e) {
      e.stopPropagation();
      curOption = this.dataset.optionId;
      document.getElementById(this.dataset.optionId + '_file').click();
    }, false);
    element.addEventListener('dragover', function (e) {
      this.className = "drag active";
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }, false);
    element.addEventListener('dragleave', function (e) {
      this.className = "drag";
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }, false);
    element.addEventListener('drop', function (e) {
      this.className = "drag";
      var that = this;
      e.stopPropagation();
      e.preventDefault();
      var files = e.dataTransfer.files;
      checkImage(files[0], function (err, img) {
        cb(err, that.dataset.optionId, img)
      }, width, height);
    }, false);
    input.addEventListener('change', function (e) {
      checkImage(this.files[0], function (err, img) {
        cb(err, curOption, img)
      }, width, height);
    }, false);
  }
}

function initDragDropSuboption(cb, width, height) {
  var suboptions = document.querySelectorAll('.suboption-image .drag');
  var curOption = null;
  for (var i = 0; i < suboptions.length; i++) {
    var element = suboptions[i];
    if (element.dataset.suboptionDrag) continue;
    element.dataset.suboptionDrag = 'true';
    var input = document.getElementById(element.dataset.suboptionId + '_file');
    element.addEventListener('click', function (e) {
      e.stopPropagation();
      curOption = this.dataset.suboptionId;
      document.getElementById(this.dataset.suboptionId + '_file').click();
    }, false);
    element.addEventListener('dragover', function (e) {
      this.className = "drag active";
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }, false);
    element.addEventListener('dragleave', function (e) {
      this.className = "drag";
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }, false);
    element.addEventListener('drop', function (e) {
      this.className = "drag";
      var that = this;
      e.stopPropagation();
      e.preventDefault();
      var files = e.dataTransfer.files;
      checkImage(files[0], function (err, img) {
        cb(err, that.dataset.suboptionId, img)
      }, width, height);
    }, false);
    input.addEventListener('change', function (e) {
      checkImage(this.files[0], function (err, img) {
        cb(err, curOption, img)
      }, width, height);
    }, false);
  }
}

var events_category_rank = {
  dragstart: function (e) {
    e.stopPropagation();
    this.style.opacity = 0.3;
    e.dataTransfer.dropEffect = 'copy';
    swap = {
      id: this.dataset.categoryId,
      rank: this.dataset.categoryRank
    }
  },
  dragover: function (e) {
    e.stopPropagation();
    e.preventDefault();
    this.style.opacity = 0.3;
  },
  dragleave: function (e) {
    e.stopPropagation();
    e.preventDefault();
    this.style.opacity = 1;
  },
  dragend: function (e) {
    e.stopPropagation();
    e.preventDefault();
    this.style.opacity = 1;
  },
  drag: function (e) {
    e.stopPropagation();
    this.style.opacity = 0.3;
  },
  drop: function (e) {
    e.stopPropagation();
    e.preventDefault();
    this.style.opacity = 1;
    events_category_rank.cb(swap, {
      id: this.dataset.categoryId,
      rank: this.dataset.categoryRank
    });
  }
};

function initDragDropCategories(cb) {
  var swap = null;
  events_category_rank.cb = cb;
  var categories = document.querySelectorAll('li.categories .category');
  for (var i = 0; i < categories.length; i++) {
    categories[i].removeEventListener('dragstart', events_category_rank.dragstart);
    categories[i].removeEventListener('dragover', events_category_rank.dragover);
    categories[i].removeEventListener('dragleave', events_category_rank.dragleave);
    categories[i].removeEventListener('dragend', events_category_rank.dragend);
    categories[i].removeEventListener('drag', events_category_rank.drag);
    categories[i].removeEventListener('drop', events_category_rank.drop);

    categories[i].addEventListener('dragstart', events_category_rank.dragstart, false);
    categories[i].addEventListener('dragover', events_category_rank.dragover, false);
    categories[i].addEventListener('dragleave', events_category_rank.dragleave, false);
    categories[i].addEventListener('dragend', events_category_rank.dragend, false);
    categories[i].addEventListener('drag', events_category_rank.drag, false);
    categories[i].addEventListener('drop', events_category_rank.drop, false);
  }
}

function initDragDrop(id, cb, width, height) {
  var element = document.getElementById(id);
  var input = document.getElementById(id + '_file');
  element.addEventListener('click', function (e) {
    input.click();
  }, false);
  element.addEventListener('dragover', function (e) {
    this.className = "drag active";
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, false);
  element.addEventListener('dragleave', function (e) {
    this.className = "drag";
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, false);
  element.addEventListener('drop', function (e) {
    this.className = "drag";
    e.stopPropagation();
    e.preventDefault();
    var files = e.dataTransfer.files;
    checkImage(files[0], cb, width, height);
  }, false);
  input.addEventListener('change', function (e) {
    checkImage(this.files[0], cb, width, height);
  }, false);
}

function checkImage(image, cb, width, height) {
  if (image.type == 'image/png' || image.type == 'image/jpeg' || image.type == 'image/png' || image.type == 'image/webp') {
    getBase64(image, function (err, base64, img) {
      if (err) cb(Error("IMAGE_ERROR_TO_GET_BASE64"));
      else {
        if (width && height) {
          if (img.width != width || img.height != height) cb(Error("IMAGE_INVALID_SIZE"));
          else cb(null, base64)
        } else cb(null, base64)
      }
    });
  } else cb(Error("IMAGE_INVALID_EXTENSION"));
}

function checkImages(image, cb, width, height) {
  if (image.type == 'image/png' || image.type == 'image/jpeg' || image.type == 'image/png' || image.type == 'image/webp') {
    getBase64Multi(image, function (err, base64, img, productId) {
      if (err) cb(Error("IMAGE_ERROR_TO_GET_BASE64"));
      else {
        cb(null, base64, productId);
      }
    });
  } else cb(Error("IMAGE_INVALID_EXTENSION"), 'invalid', image);
}

function getBase64(file, cb) {
  var reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function () {
    var img = new Image;
    img.onload = function () {
      cb(null, reader.result, img);
    };
    img.src = reader.result;
  };
  reader.onerror = function (error) {
    cb(error);
  };
}

function getBase64Multi(file, cb) {
  var name = file.name.split('.');
  var productId = name[0];
  var reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function () {
    var img = new Image;
    img.onload = function () {
      cb(null, reader.result, img, productId);
    };
    if (reader.result != 'data:') {
      img.src = reader.result;
    } else {
      cb(true);
    }
  };
  reader.onerror = function (error) {
    cb(error);
  };
}

Extensions.add_action('after_show_loading', function (data, scope) {
  scrollToLoading();
  disableScroll();
});

Extensions.add_action('after_hide_loading', function (data, scope) {
  enableScroll();
});

Extensions.add_action('after_show_alert', function (data, scope) {
  scrollToAlert();
  backdropAlert(true);
});

Extensions.add_action('after_hide_alert', function (data, scope) {
  backdropAlert(false);
});

Extensions.add_action('after_show_confirm', function (data, scope) {
  scrollToAlert();
  backdropAlert(true);
  enableScroll();
});

Extensions.add_action('after_hide_confirm', function (data, scope) {
  backdropAlert(false);
  enableScroll();
});

Extensions.add_action('enter_root', function (none, $scope) {
  $rootScope = $scope.getNgDependency('$rootScope');
  $state = $scope.getNgDependency('$state');
  $ionicHistory = $scope.getNgDependency('$ionicHistory');
  MyModal = $scope.getNgDependency('MyModal');
  gBusiness = $scope.getNgDependency('gBusiness');
  gOrder = $scope.getNgDependency('gOrder');
  gCreateOrderBuyer = $scope.getNgDependency('gCreateOrderBuyer');
  $http = $scope.getNgDependency('$http');
  MyLoading = $scope.getNgDependency('MyLoading');
  $ionicScrollDelegate = $scope.getNgDependency('$ionicScrollDelegate');
  gPreorder = $scope.getNgDependency('gPreorder');
  gmultiBusiness = $scope.getNgDependency('gmultiBusiness');
  $ionicHistory.clearCache().then(function () {

    $rootScope.refreshNumCart = function () {
      let multyBus = gmultiBusiness.getData(); //JSON.parse(localStorage.getItem('multi_business'));
      $scope.numCart = 0;
      if (multyBus) {
        for (var i = 0; i < multyBus.length; i++) {
          //$scope.numCart += gCart.getData()[i].quantity;
          if (multyBus[i].cartdata) {
            for (let p = 0; p < multyBus[i].cartdata.length; p++) {
              $scope.numCart += multyBus[i].cartdata[p].quantity;
            }
          }
        }
      }
      $rootScope.numCart += $scope.numCart;
    }

    $rootScope.allbusinesstypes = [];
    MyLoading.show($scope.translate('LOADING') + '...');
    var url = CUSTOM_SERVER_URL + "save_business_subtypes.php";
    var data = {
      function: 'fetchAllSubType',
      lang_id: localStorageApp.getItem(STORE.LANG_CODE)
    };
    var config = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    $http.post(url, data, config).then(function (response) {
      $rootScope.allbusinesstypes = response.data.result;
      $rootScope.curNumTablistBa = $rootScope.allbusinesstypes.length;
      $rootScope.curNumTablist = $rootScope.allbusinesstypes.length;
      MyLoading.hide();

    })

  })
  /* ************ */
  $rootScope.Order = {
    getProductsStr: function (order, endings) {
      var endings = typeof endings === "boolean" ? endings : true;
      var str_products = '' + (endings ? '\n' : '');
      for (var i = 0; i < order.products.length; i++) {
        var product = order.products[i];
        var str_product = product.quantity + ' x ' + product.name + ': ' + $scope.currency + this.getProductsTotal(product).toFixed(2) + "\r" + (endings ? '\n' : '');
        if (product.ingredients.length > 0) {
          str_product += '  ' + $scope.translate('NO') + ' ' + $scope.translate('Ingredients_V2') + "\r" + (endings ? '\n' : '');
          for (var j = 0; j < product.ingredients.length; j++) {
            str_product += '    ' + product.ingredients[j].name + "\r" + (endings ? '\n' : '');
          }
        }
        for (var j = 0; j < product.options.length; j++) {
          var option = product.options[j];
          str_product += '  ' + option.name + "\r" + (endings ? '\n' : '');
          for (var k = 0; k < option.suboptions.length; k++) {
            var suboption = option.suboptions[k];
            var str_suboption_quantity = '';
            var str_suboption_position = '';
            if (option.allow_suboption_quantity && suboption.quantity) {
              str_suboption_quantity = suboption.quantity + '  x  ';
            }
            if (option.with_half_option && suboption.position && suboption.position != 'whole') {
              str_suboption_position = ' (' + $scope.translate(suboption.position.toUpperCase()) + ')';
            }
            var suboption_price = this.getSuboptionTotal(option, suboption);
            str_product += '    ' + str_suboption_quantity + suboption.name + str_suboption_position + '  ' + $scope.parsePrice(suboption_price) + "\r" + (endings ? '\n' : '');
          }
        }
        str_products += str_product;
      }
      return str_products + (endings ? '' : '');
    },
    getProductsTotal: function (product) {
      var total = 0;
      if (product.options) {
        for (var i = 0; i < product.options.length; i++) {
          var option = product.options[i];
          if (option.suboptions) {
            for (var j = 0; j < option.suboptions.length; j++) {
              var suboption = option.suboptions[j];
              total += this.getSuboptionTotal(option, suboption);
            }
          }
        }
      }
      return (total + product.price) * product.quantity;
    },
    getSuboptionTotal: function (option, suboption) {
      var suboption_quantity = 1;
      var suboption_price = suboption.price;
      if (option.allow_suboption_quantity && suboption.quantity) {
        suboption_quantity = suboption.quantity;
      }
      if (option.with_half_option && suboption.position && suboption.position != 'whole') {
        suboption_price = suboption.half_price;
      }
      return suboption_price * suboption_quantity;
    },
    getSubtotal: function (order) {
      if (!order.summary) {
        var subtotal = 0;
        for (var i = 0; i < order.products.length; i++) {
          subtotal += this.getProductsTotal(order.products[i]);
        }
        return this.roundPrice(subtotal);
      } else {
        if (order.tax_type === 1 && !$rootScope.constants.fix_order_summary) {
          return order.summary.subtotal + order.summary.tax
        }
        return order.summary.subtotal
      }
    },
    getTax: function (order) {
      if (!order.summary) {
        var tax = (order.tax_type == 2) ? order.tax * (this.getSubtotal(order) - order.discount) / 100 : 0;
        return this.roundPrice(tax)
      } else {
        return order.summary.tax
      }
    },
    getDriverTip: function (order) {
      /*if(order.custom_trip){
         var tip = order.custom_trip;
        return this.roundPrice(tip);
      }*/
      if (!order.summary) {
        var tip = order.custom_trip;
        // var tip = (this.getSubtotal(order)-order.discount)*driver_tip_tip/100; ////order.driver_tip
        return this.roundPrice(tip)
      } else {
        // return order.summary.driver_tip
        return order.custom_trip;
      }
    },
    getServiceFee: function (order) {
      if (!order.summary) {
        var subtotal = (this.getSubtotal(order) - order.discount) * order.service_fee / 100;
        return this.roundPrice(subtotal)
      } else {
        return order.summary.service_fee
      }
    },
    getTotal: function (order) {
      if (order.custom_delivery_price) {
        order.delivery_zone_price = order.custom_delivery_price;
      }
      var subtotal = this.getSubtotal(order);
      var tax = this.getTax(order);
      var service_fee = this.getServiceFee(order);

      //console.log('id = '+order.id+', dfee = '+order.custom_delivery_price+', // subtotal= '+subtotal+'// tax ='+tax+'// dprice'+order.delivery_zone_price+'//tip= '+this.getDriverTip(order)+'// servfee ='+service_fee);

      totalorder = order.delivery_type == "2" ? subtotal + tax + service_fee - order.discount : subtotal + tax + order.custom_delivery_price + this.getDriverTip(order) + service_fee - order.discount; subtotal + tax + service_fee - order.discount; //discount_type and offer_type must be created
      return this.roundPrice(totalorder);


      if (!order.summary) {
        var subtotal = this.getSubtotal(order);
        var tax = 0;//this.getTax(order);
        var service_fee = this.getServiceFee(order);



        totalorder = order.delivery_type == "2" ? subtotal + tax + service_fee - order.discount : subtotal + tax + order.delivery_zone_price + this.getDriverTip(order) + service_fee - order.discount; subtotal + tax + service_fee - order.discount; //discount_type and offer_type must be created
        return this.roundPrice(totalorder);
      } else {
        return order.summary.total
      }
    },
    getDiscount: function (order) {
      if (!order.summary) {
        return this.roundPrice(order.discount);
      } else {
        return order.summary.discount
      }
    },
    roundPrice: function (value) {
      var power = Math.pow(10, DECIMAL.length);
      var poweredVal = Math.round(value * power);
      return poweredVal / power;
    }
  };
  /* ************ */


  if (NEW_FEATURES.FLEX_HEIGHT) {
    var div_root = document.getElementById('web-view');
    div_root.style.height = '100%';
    setInterval(function () {
      var body = document.body;
      var article = document.querySelector('body article');
      if (body && article) {
        if (body.clientHeight < article.clientHeight) {
          body.style.height = 'auto';
        } else if (body.clientHeight > article.clientHeight) {
          body.style.height = '100%';
        }
      }
    }, 50);
  }

  $scope.getDate = function (date, type) {
    var dateDay = date.split(" ");
    if (type) {
      return dateDay[1];
    } else {
      return dateDay[0];
    }
  }
});

Extensions.add_action('after_profile_view', function (user, scope) {
  fixHeight('.bg-gray');
  setTimeout(function () {
    initDragDrop('photo_profile', function (err, image) {
      if (err) MyAlert.show(err.message);
      else scope.updateUser.image = image;
    });
  }, 200);
});

Extensions.add_action('after_login_view', function (none, scope) {
  fixHeight('.bg-gray');
});

Extensions.add_action('after_signup_view', function (none, scope) {
  fixHeight('.bg-gray');
});

Extensions.add_action('after_forgot_password_view', function (none, scope) {
  fixHeight('.bg-gray');
});

Extensions.add_action('after_reset_password_view', function (none, scope) {
  fixHeight('.bg-gray');
});

Extensions.add_action('after_search_view', function (businesses, scope) {
  var $state = scope.getNgDependency('$state');
  var timeout = null;
  var aux = null;
  var Ordering = scope.getNgDependency('Ordering');
  var gAllBusiness = scope.getNgDependency('gAllBusiness');
  $ionicScrollDelegate = scope.getNgDependency('$ionicScrollDelegate');
  $timeout = scope.getNgDependency('$timeout');
  scope.loading_more = false;
  var changeTimeout = null;
  scope._filterBusiness = '';
  scope.changeFilterBusiness = function () {
    if (changeTimeout) $timeout.cancel(changeTimeout);
    changeTimeout = $timeout(function () {
      scope.filterBusiness = scope._filterBusiness;
    }, 120);
  }
  var thumbsHeightChecker = setInterval(function () {
    if ($state.current.name != 'main.search') {
      clearInterval(thumbsHeightChecker)
      return;
    }
    var thumbs = $('.thumbnail');
    var max = 0;
    for (var i = 0; i < thumbs.length; i++) {
      var header = $(thumbs[i]).find('.header');
      var caption = $(thumbs[i]).find('.caption');
      var height = header.outerHeight() + caption.outerHeight()
      if (height > max) {
        max = height;
      }
    }
    $('.thumbnail').height(max);
    if (IFRAME_INLINE) $('.thumbnail .header').css({ 'min-height': '0px' });
    if (timeout) {
      scope.loading_more = false;
      clearTimeout(timeout);
    }
    var next = scope.businesses.slice(scope.filteredBusiness.length, scope.filteredBusiness.length + 25);
    if (!scope.filterBusinessType && !scope.filterBusiness && next.length > 0 && $('html').height() - $('.footer').outerHeight() - 200 < $(window).scrollTop() + $(window).height() && !NEW_FEATURES.NEW_BUSINESS_PAGINATION) {
      scope.loading_more = true;
      timeout = setTimeout(function () {
        scope.loading_more = false;
        scope.filteredBusiness = scope.filteredBusiness.concat(next);
      }, 350);
    }
  }, 500);
  var _throttleTimer = null;
  $(document).ready(function () {
    $(window)
      .off('scroll', ScrollHandler)
      .on('scroll', ScrollHandler);
  });
  scope.loadMore = false;
  function ScrollHandler(e) {
    clearTimeout(_throttleTimer);
    _throttleTimer = setTimeout(function () {
      if ($(window).scrollTop() >= $('#searchBusiness').outerHeight() - window.innerHeight) {
        scope.loadMore = true;
      }
    }, 100);
  }
  loadMoreBusiness = function () {
    if (scope.currentPage < scope.totalPages) {
      scope.currentPage += 1;
      scope.helpersParams.page = scope.currentPage;
      if (NEW_FEATURES.API_BUSINESS_LISTING_V2) {
        scope.helpersParams.v = 2;
      }
      Ordering.business.all(scope.helpersParams, function (res) {
        for (var i = 0; i < res.result.length; i++) {
          if (res.result[i].delivery_time) {
            res.result[i].delivery_time_min = parseInt(res.result[i].delivery_time.split(':')[0]) * 60 + parseInt(res.result[i].delivery_time.split(':')[1]);
          } else res.result[i].delivery_time_min = 9999;
          if (res.result[i].pickup_time) {
            res.result[i].pickup_time_min = parseInt(res.result[i].pickup_time.split(':')[0]) * 60 + parseInt(res.result[i].pickup_time.split(':')[1]);
          } else res.result[i].pickup_time_min = 9999;
        }
        scope.businesses = scope.businesses.concat(res.result);
        gAllBusiness.setData(scope.businesses);

      });

      scope.loadMore = false;
    }
  }
  scope.selectBusinessType = function ($event, type) {
    if ($event) $event.preventDefault();
    scope.filterBusinessType = type;
    if (!aux) aux = scope.filteredBusiness.slice();
    var filterBy = scope.businesses;
    var filters = [];
    for (var i = 0; i < filterBy.length; i++) {
      if (type == '' && NEW_FEATURES.NEW_BUSINESS_PAGINATION) filters.push(filterBy[i]);
      else if (type == 'food' && filterBy[i].food) filters.push(filterBy[i]);
      else if (type == 'alcohol' && filterBy[i].alcohol) filters.push(filterBy[i]);
      else if (type == 'laundry' && filterBy[i].laundry) filters.push(filterBy[i]);
      else if (type == 'groceries' && filterBy[i].groceries) filters.push(filterBy[i]);
    }
    if (NEW_FEATURES.NEW_BUSINESS_PAGINATION) {
      if (type == 'food' && filters.length > 0 && filters.length < 10) loadMoreBusiness();
      if (type == 'laundry' && filters.length > 0 && filters.length < 10) loadMoreBusiness();
      if (type == 'groceries' && filters.length > 0 && filters.length < 10) loadMoreBusiness();
      if (type == 'alcohol' && filters.length > 0 && filters.length < 10) loadMoreBusiness();
    }
    scope.filteredBusiness = filters;
    if (type == '' && NEW_FEATURES.NEW_BUSINESS_PAGINATION) {
      scope.businessFound = scope.totalBusiness;
    }
    if (type == '' && !NEW_FEATURES.NEW_BUSINESS_PAGINATION) {
      scope.businessFound = scope.businesses.length;
    } else if (type != '') {
      scope.businessFound = filters.length;
    }
    $ionicScrollDelegate.scrollTop();
  }

  $rootScope.curNumTablist = $rootScope.allbusinesstypes.length;
  scope.selectChangeBusinessType = function ($event, type) {
    if (typeof (type) == 'undefined') {
      type = '';
    }
    //console\.log(type)
    if ($event) $event.preventDefault();
    scope.filterBusinessType = type;
    if (!aux) aux = scope.filteredBusiness.slice();
    var filterBy = scope.businesses;
    var filters = [];
    if (type == '') filters = aux;
    else {
      scope.filterBusinessType = type.name;
      var type_name = "extra_type_" + type.id.replace(/[^a-zA-Z0-9]/g, '');
      for (var i = 0; i < filterBy.length; i++) {

        for (var key in filterBy[i]) {
          if (key == type_name && filterBy[i][key] == true) {
            filters.push(filterBy[i]);
            break;
          }
        }
      }
    }
    scope.filteredBusiness = filters;
    if (type == '') {
      scope.businessFound = scope.businesses.length;
    } else {
      scope.businessFound = filters.length;
    }
    $ionicScrollDelegate.scrollTop();
  }
  var get_fisrt = true;
  var li_items = [];
  var myVarInters = setInterval(function () {
    var more = $('#dropdown-more');
    if (more.length > 0) {
      var pli = more.parent('li');
      if (pli.position().left + pli.width() < more.width()) more.removeClass('dropdown-menu-right').addClass('dropdown-menu-left');
      else more.removeClass('dropdown-menu-left').addClass('dropdown-menu-right');
      // //console\.log(pli.position(), more.position());
    }
    $('.nav.nav-tabs').css('overflow', 'hidden');
    var categories = $('#dynamic_list_types').outerWidth();
    if (get_fisrt && categories > 0) {
      get_fisrt = false;
      var items = $('#dynamic_list_types ul li');
      if (items.length > 0) {
        for (var i = 0; i < items.length; i++) {
          li_items.push($(items[i]).outerWidth());
        }
      }
    }

    var w_items = 0;
    var numtab = 0;
    var brk1 = false;
    var brk2 = true;
    var i = 0;
    for (; i < li_items.length; i++) {
      if (w_items + li_items[i] + 3 <= categories && !brk1) {
        w_items += li_items[i] + 3;
        numtab++;
        scope.showMore = false;
      } else {
        if (!brk1) brk2 = false;
        brk1 = true;
        scope.showMore = true;
      }
      if (w_items + li_items[li_items.length - 1] > categories
        && !brk2) {
        numtab--;
        brk2 = true;
      }
    }
    numtab--;
    numtab--;
    $rootScope.curNumTablist = numtab;
    $('.nav.nav-tabs').css('overflow', 'inherit');
  }, 200);
  scope.$on("$destroy", function () {
    if (myVarInters) {
      clearInterval(myVarInters);
    }
  });

  scope.$watch('businesses', function (value) {
    scope.selectBusinessType(null, scope.filterBusinessType);
  });
  scope.$watch('loadMore', function (value) {
    if (scope.loadMore == false) return;
    loadMoreBusiness();
  });
  var filtertype = 'filterby';
  scope.$watch('filterBusiness', function (value) {
    if (!NEW_FEATURES.NEW_BUSINESS_PAGINATION) {
      if (value == undefined || scope.filterBusinessType) return;
      if (value) {
        if (!aux) {
          aux = scope.filteredBusiness.slice();
        }
        if (filtertype == 'filterby') {
          filtertype = 'all';
          scope.filteredBusiness = scope.businesses;
        }
      } else {
        if (filtertype == 'all') {
          filtertype = 'filterby';
          scope.filteredBusiness = aux;
        }
        aux = null;
      }
    }
  });
});

Extensions.add_action('after_business_close_product', function (product, scope) {
  businessRefreshScroll();
});

Extensions.add_action('after_business_open_category', function (category, $scope) {
  if (!NEW_FEATURES.FLEX_HEIGHT) {
    fixHeight('.bg-gray');
  }
  businessRefreshScroll();
});

Extensions.add_action('after_business_view', function (business, scope) {
  fixHeight('.business', true);
  // if (NEW_FEATURES.BUSINESS_PAGE) {
  $('.offset-categories').css({
    height: '100px',
    overflow: 'hidden'
  });
  // }
  var get_fisrt = true;
  var li_items = [];
  setInterval(function () {
    var more = $('#dropdown-more');
    if (more.length > 0) {
      var pli = more.parent('li');
      if (pli.position().left + pli.width() < more.width()) more.removeClass('dropdown-menu-right').addClass('dropdown-menu-left');
      else more.removeClass('dropdown-menu-left').addClass('dropdown-menu-right');
      // //console\.log(pli.position(), more.position());
    }
    $('.nav.nav-tabs').css('overflow', 'hidden');
    var categories = $('#categories-tabs').outerWidth();
    if (get_fisrt && categories > 0) {
      get_fisrt = false;
      var items = $('#categories-tabs ul li');
      if (items.length > 0) {
        for (var i = 0; i < items.length; i++) {
          li_items.push($(items[i]).outerWidth());
        }
      }
    }
    var w_items = 0;
    var numtab = 0;
    var brk1 = false;
    var brk2 = true;
    var i = 0;
    for (; i < li_items.length; i++) {
      if (w_items + li_items[i] + 3 <= categories && !brk1) {
        w_items += li_items[i] + 3;
        numtab++;
        scope.showMore = false;
      } else {
        if (!brk1) brk2 = false;
        brk1 = true;
        scope.showMore = true;
      }
      if (w_items + li_items[li_items.length - 1] > categories
        && !brk2) {
        numtab--;
        brk2 = true;
      }
    }
    if (WEB_ADDONS.all_categories) numtab--;
    if (scope.showFeaturedCategory) numtab--;
    scope.curNumTab = numtab;
    $('.nav.nav-tabs').css('overflow', 'inherit');
  }, 200);
  setInterval(function () {
    if ($(".go-cart")[0]) {
      var scroll = $(this).scrollTop();
      var gt = $('.navbar').outerHeight() + $('.business').outerHeight() - $(this).outerHeight() + $(".go-cart").outerHeight();
      if (scroll >= gt) $(".go-cart").hide();
      else $(".go-cart").show();
    }
  }, 100);
  var checkscroll = {
    timeout: null,
    top: 0
  };
  window.addEventListener("message", function (e) {
    try {
      var data = JSON.parse(e.data);
      if (data.event == 'scroll') {
        if (checkscroll.top > data.data.top) {
          moveStickyElemets(true);
        }
        checkscroll.top = data.data.top;
        if (checkscroll.timeout) clearTimeout(checkscroll.timeout);
        checkscroll.timeout = setTimeout(function () {
          moveStickyElemets(false);
        }, 100);
      }
    } catch (err) { }
  }, false);
  businessRefreshScroll();
  /*$(window).off('scroll');
  $(window).on('scroll', function () {
    moveStickyElemets(false);
  });*/
});

Extensions.add_action('after_show_product_options_settings', function (modal, $scope) {
  var MyAlert = $scope.getNgDependency('MyAlert');
  var MyLoading = $scope.getNgDependency('MyLoading');
  var Ordering = $scope.getNgDependency('Ordering');
  function refreshDrags() {
    initDragDropOption(function (err, option_id, img) {
      if (!err) {
        for (var i = 0; i < modal.scope.extra.options.length; i++) {
          var option = modal.scope.extra.options[i];
          if (option.id == option_id) {
            MyLoading.toast($scope.translate('LOADING') + '...');
            Ordering.options.update({
              id: option.id,
              business_id: $scope.deal.id,
              extra_id: modal.scope.extra.id,
              image: img
            }, function (res) {
              MyLoading.hide();
              if (!res.error) {
                option.image = img;
                MyLoading.success($scope.translate('OPTION_SAVED'), 1500);
              } else MyAlert.show(res.result);
            });
            break;
          }
        }
      } else {
        MyAlert.show(err.message);
      }
    });//, width, height);
    initDragDropSuboption(function (err, suboption_id, img) {
      if (!err) {
        for (var i = 0; i < modal.scope.extra.options.length; i++) {
          var option = modal.scope.extra.options[i];
          for (var j = 0; j < option.suboptions.length; j++) {
            var suboption = option.suboptions[j];
            if (suboption.id == suboption_id) {
              (function (idx, s_idx) {
                MyLoading.toast($scope.translate('LOADING') + '...');
                Ordering.suboptions.update({
                  id: suboption.id,
                  business_id: $scope.deal.id,
                  option_id: option.id,
                  extra_id: modal.scope.extra.id,
                  image: img
                }, function (res) {
                  MyLoading.hide();
                  modal.scope.extra.options[idx].suboptions[s_idx].image = img;
                  if (!res.error) MyLoading.success($scope.translate('CHOICE_SAVED'), 1500);
                  else MyAlert.show(res.result);
                });
              })(i, j);
              break;
            }
          }
        }
      } else {
        MyAlert.show(err.message);
      }
    });//, width, height);
  }

  refreshDrags();

  $scope.addExtraOptionSuboption = function (extra, option, suboption) {
    var errors = $scope.checkSuboption(suboption, option);
    if (errors.length > 0) {
      return MyAlert.show(errors);
    }
    MyLoading.toast($scope.translate('LOADING') + '...');
    Ordering.suboptions.add({
      business_id: $scope.deal.id,
      extra_id: extra.id,
      option_id: option.id,
      name: suboption.name,
      price: suboption.price,
      half_price: suboption.half_price,
      max: suboption.max,
      enabled: true
    }, function (res) {
      MyLoading.hide();
      if (!res.error) {
        MyLoading.success($scope.translate('CHOICE_ADDED'), 1500);
        option.suboptions.push(res.result);
        suboption.name = '';
        suboption.price = 0;
        setTimeout(function () {
          refreshDrags();
        }, 100);
      } else MyAlert.show(res.result);
    });
  }

  $scope.addOption = function (extra, option) {
    var errors = $scope.checkOption(option);
    if (errors.length > 0) {
      return MyAlert.show(errors);
    }
    MyLoading.toast($scope.translate('LOADING') + '...');
    Ordering.options.add({
      business_id: $scope.deal.id,
      extra_id: extra.id,
      name: option.name,
      min: option.min,
      max: option.max,
      conditioned: false,
      with_half_option: option.with_half_option,
      allow_suboption_quantity: option.allow_suboption_quantity,
      enabled: true
    }, function (res) {
      MyLoading.hide();
      if (!res.error) {
        res.result.suboptions = [];
        extra.options.push(res.result);
        option.name = '';
        option.min = 1;
        option.max = 1;
        option.with_half_option = false;
        option.allow_suboption_quantity = false;
        MyLoading.success($scope.translate('OPTION_ADDED'), 1500);
        setTimeout(function () {
          refreshDrags();
        }, 100);
      } else {
        MyAlert.show(res.result);
      }
    });
  }

  $scope.addExtraOption = function (extra, option, suboption) {
    if ($scope.checkExtraOption(option)) return MyAlert.show($scope.checkExtraOption(option).message);
    if ($scope.checkExtraOptionSuboption(suboption)) return MyAlert.show($scope.checkExtraOptionSuboption(suboption).message);
    MyLoading.toast($scope.translate('LOADING') + '...');
    Ordering.options.add({
      business_id: $scope.deal.id,
      extra_id: extra.id,
      name: option.name,
      min: option.min,
      max: option.max,
      conditioned: false
    }, function (res) {
      MyLoading.hide();
      if (!res.error) {
        var c_option = res.result;
        c_option.suboptions = [];
        Ordering.suboptions.add({
          business_id: $scope.deal.id,
          extra_id: extra.id,
          option_id: res.result.id,
          name: suboption.name,
          price: suboption.price
        }, function (res) {
          if (!res.error) {
            c_option.suboptions.push(res.result);
            var curNewSuboption = {
              name: '',
              price: 0
            };
            c_option.curNewSuboption = curNewSuboption;
            extra.options.push(c_option);
            $scope.curNewOption = {
              name: '',
              min: 0,
              max: 1
            };
            $scope.curNewSuboption = {
              name: '',
              price: 0
            };
            MyLoading.success($scope.translate('OPTION_ADDED'), 1500);
            setTimeout(function () {
              refreshDrags();
            }, 100);
          } else MyAlert.show(res.result);
        });
      } else MyAlert.show(res.result);
    });
  }

  $scope.deleteOptionImage = function (extra, option, suboption) {
    MyLoading.toast($scope.translate('LOADING') + '...');
    if (suboption) {
      Ordering.suboptions.update({
        id: suboption.id,
        business_id: $scope.deal.id,
        option_id: option.id,
        extra_id: extra.id,
        image: null
      }, function (res) {
        MyLoading.hide();
        suboption.image = null;
        if (!res.error) MyLoading.success($scope.translate('CHOICE_SAVED'), 1500);
        else MyAlert.show(res.result);
      });
    } else {
      Ordering.options.update({
        id: option.id,
        business_id: $scope.deal.id,
        extra_id: extra.id,
        image: null
      }, function (res) {
        MyLoading.hide();
        if (!res.error) {
          option.image = null;
          MyLoading.success($scope.translate('OPTION_SAVED'), 1500);
        } else MyAlert.show(res.result);
      });
    }
  }
});

Extensions.add_action('enter_business_view', function (none, $scope) {
  var Ordering = $scope.getNgDependency('Ordering');
  var gOrder = $scope.getNgDependency('gOrder');
  var gPreorder = $scope.getNgDependency('gPreorder');
  var scrollBusy = false;
  function onscroll(superElement) {
    if (!NEW_FEATURES.BUSINESS_PAGE) return;
    if (scrollBusy || $scope.loadings.products || $scope.filterProduct != '') return;
    var footer = document.querySelector('.footer.container');
    var business = document.querySelector('.business');
    var header = document.querySelector('.navbar');
    if (footer && business && header) {
      var content = business.clientHeight + header.clientHeight;
      var scroll = superElement.scrollTop + window.innerHeight;
      if (content <= scroll) {
        var key = 'category_' + ($scope.filterCategory == '' ? 'all' : $scope.filterCategory);
        if ($scope.stops[key] || key == 'category_featured' || !$scope.categories[key]) return;
        var _request = Ordering.products.all;
        if (key == 'category_all') {
          _request = Ordering.business.products;
        }
        var params = {
          type: gOrder.getData().type ? gOrder.getData().type : 1,
          limit: PAGINATIONS.business_products.page
        };
        if (gPreorder.getData().timestamp) {
          params.timestamp = gPreorder.getData().timestamp
        } else if (gPreorder.getData().menu_id) params.menu_id = gPreorder.getData().menu_id;
        if ($scope.categories[key].length % PAGINATIONS.business_products.page == 0) {
          params.offset = $scope.categories[key].length;
        } else {
          $scope.stops[key] = true;
          return;
        }
        scrollBusy = true;
        $scope.loadings.products = true;
        if (key == 'category_all') {
          params.id = $scope.business.id;
          params.orderBy = 'categories.rank';
        } else {
          params.business_id = $scope.business.id;
          params.category_id = $scope.filterCategory;
          params.orderBy = 'name';
        }
        _request(params, function (res) {
          $scope.loadings.products = false;
          scrollBusy = false;
          if (!res.error) {
            if (res.result.length == 0) {
              $scope.stops[key] = true;
            }
            if (!$scope.categories[key]) {
              $scope.categories[key] = [];
            }
            $scope.categories[key] = $scope.categories[key].concat(res.result);
          }
        });
      }
    }
  }
  $(window).scroll(function () {
    onscroll(document.getElementsByTagName('html')[0]);
  });
  $('body').scroll(function () {
    onscroll(document.body);
  });
});

Extensions.add_action('after_business_types_view', function (type, scope) {
  //console\.log(scope)
  var utilities = scope.getUtilities();
  initDragDrop('type_image', function (err, image) {
    if (err) utilities.MyAlert.show(err.message);
    else utilities.MyAlert.confirm(scope.translate('QUESTION_CHANGE_BUSINESS_TYPE_IMAGE')).then(function () {
      type.image = image;
    });
  });
});

Extensions.add_action('after_business_editor_view', function (business, scope) {
  scope.errorImages = '';
  fixHeight('.business', true);
  $(window).on('scroll', function () {
    var header = $('.navbar').last();
    var editor = $('.navbar.editor').last();
    var superElement = ($('html').outerHeight() >= $('body').outerHeight()) ? $('html') : $('body');
    var cart_stiky = $('#cart-stiky').last();
    var cart = $('.cart').last();
    var footer = $('.footer').last();
    var pos = $(this).scrollTop() + $(window).height() - footer.position().top;
    var toBottom = pos + cart_stiky.outerHeight() > $(window).height();
    var numero = $('.div.footer').height();
    if ($(window).width() < 768 || header.height() + editor.height() > $(this).scrollTop() || cart_stiky.outerHeight() > $(window).height()) {
      $('#cart-stiky').removeClass('fixed').removeClass('bottom').css({
        width: '100%',
        'margin-bottom': '0px'
      });
    } else {
      var top = $(this).scrollTop() - (header.height() + editor.height());
      $('#cart-stiky').removeClass('fixed').removeClass('bottom');
      if (toBottom) {
        $('#cart-stiky').addClass('fixed').addClass('bottom').css({
          width: cart.width(),
          'margin-bottom': ($(window).outerHeight() - footer.position().top + superElement.scrollTop()) + 'px'
        });
      } else {
        $('#cart-stiky').addClass('fixed').css({
          width: cart.width(),
          'margin-bottom': '0px'
        });
      }
    }
  });
  var utilities = scope.getUtilities();
  setTimeout(function () {
    initDragDropCategories(function (c1, c2) {
      if (!c1 || !c2) return;
      if (c1.id != c2.id) {
        scope.$apply(function () {
          for (var i = 0; i < scope.deal.categories.length; i++) {
            if (scope.deal.categories[i].id == c1.id) {
              scope.deal.categories[i].rank = c2.rank;
              scope.updateCategory(scope.deal.categories[i]);
            }
            if (scope.deal.categories[i].id == c2.id) scope.deal.categories[i].rank = c1.rank;
          }
        });
      }
    });
    initDragDropCategoriesImage(function (err, category, image) {
      if (err) utilities.MyAlert.show(err.message);
      else {
        utilities.MyLoading.show("");
        for (var i = 0; i < scope.deal.categories.length; i++) {
          if (scope.deal.categories[i].id == category) {
            utilities.Ordering.categories.update({
              id: scope.deal.categories[i].id,
              business_id: scope.deal.id,
              image: image
            }, function (res) {
              utilities.MyLoading.hide();
              if (!res.error) {
                scope.deal.categories[i].image = image;
                utilities.MyLoading.success(scope.translate('CATEGORY_SAVED'), 1500);
              } else utilities.MyAlert.show(res.result);
            });
            break;
          }
        }
      }
    });
  });
  initDragDrop('header_image', function (err, image) {
    if (err) utilities.MyAlert.show(err.message);
    else utilities.MyAlert.confirm(scope.translate('QUESTION_CHANGE_BUSINESS_HEADER')).then(function () {
      utilities.MyLoading.toast(scope.translate('LOADING') + '...');
      utilities.Ordering.business.update({
        id: scope.deal.id,
        header: image
      }, function (res) {
        if (!res.error) {
          scope.deal.header = image;
          utilities.MyLoading.success(scope.translate('BUSINESS_HEADER_SAVED'), 1500);
        } else utilities.MyAlert.show(res.result);
      });
    });
  });//, 500, 600);
  initDragDrop('logo_image', function (err, image) {
    if (err) utilities.MyAlert.show(err.message);
    else utilities.MyAlert.confirm(scope.translate('QUESTION_CHANGE_BUSINESS_LOGO')).then(function () {
      utilities.MyLoading.toast(scope.translate('LOADING') + '...');
      utilities.Ordering.business.update({
        id: scope.deal.id,
        logo: image,
      }, function (res) {
        if (!res.error) {
          scope.deal.logo = image;
          utilities.MyLoading.hide();
          utilities.MyLoading.success(scope.translate('BUSINESS_LOGO_SAVED'), 1500);
        } else utilities.MyAlert.show(res.result);
      });
    });
  });//, 200, 200);
  initDragDropProductsMulti(function (err, product, image, productId) {
    if (err) {
      if (scope.errorImages == '') {
        scope.errorImages = scope.translate('ISSUE_WITH_IMAGES') + '\n' + productId.name;
      } else {
        scope.errorImages = scope.errorImages + '\n' + productId.name;
      }
    } else if (product == -2) {
      var valid = false;
      utilities.MyLoading.toast(scope.translate('LOADING') + '...');
      var _product = null;
      for (var j = 0; j < scope.deal.categories.length; j++) {
        for (var i = 0; i < scope.deal.categories[j].products.length; i++) {
          if (scope.deal.categories[j].products[i].id == productId) {
            _product = scope.deal.categories[j].products[i];
            valid = true;
            break;
          }
        }
      }
      if (valid) {
        utilities.Ordering.products.update({
          id: _product.id,
          business_id: scope.deal.id,
          category_id: _product.category_id,
          images: image
        }, function (res) {
          if (!res.error) {
            _product.images = image;
            utilities.MyLoading.success(scope.translate('PRODUCT_IMAGE_SAVED'), 1500);
          } else {
            utilities.MyLoading.hide();
            var baseExt = image.split('/');
            var imageExt = baseExt[1].split(';');
            if (scope.errorImages == '') {
              scope.errorImages = scope.translate('ISSUE_WITH_IMAGES') + '\n' + productId + '.' + imageExt[0];
            } else {
              scope.errorImages = scope.errorImages + '\n' + productId + '.' + imageExt[0];
            }
          }
        });
      } else {
        var baseExt = image.split('/');
        var imageExt = baseExt[1].split(';');
        if (scope.errorImages == '') {
          scope.errorImages = scope.translate('ISSUE_WITH_IMAGES') + '\n' + productId + '.' + imageExt[0];
        } else {
          scope.errorImages = scope.errorImages + '\n' + productId + '.' + imageExt[0];
        }
        utilities.MyLoading.hide();
      }
    }
  });
});

Extensions.add_action('after_business_editor_open_category_view', function (category, scope) {
  var utilities = scope.getUtilities();
  setTimeout(function () {
    initDragDropProducts(function (err, product, image) {
      if (err) utilities.MyAlert.show(err.message);
      else if (product == -1) {
        scope.$apply(function () {
          scope.newProduct.images = image;
        });
      } else {
        utilities.MyAlert.confirm(scope.translate('QUESTION_CHANGE_PRODUCT_IMAGE')).then(function () {
          utilities.MyLoading.toast(scope.translate('LOADING') + '...');
          var _product = null;
          for (var j = 0; j < scope.deal.categories.length; j++) {
            for (var i = 0; i < scope.deal.categories[j].products.length; i++) {
              if (scope.deal.categories[j].products[i].id == product) {
                _product = scope.deal.categories[j].products[i];
                break;
              }
            }
          }
          utilities.Ordering.products.update({
            id: _product.id,
            business_id: scope.deal.id,
            category_id: _product.category_id,
            images: image
          }, function (res) {
            if (!res.error) {
              _product.images = image;
              utilities.MyLoading.success(scope.translate('PRODUCT_IMAGE_SAVED'), 1500);
            } else {
              utilities.MyLoading.hide();
              utilities.MyAlert.show(res.result);
            }
          });
        });
      }
    });//, width, height);
  }, 150);
});

Extensions.add_action('after_business_editor_add_category_view', function (category, scope) {
  var utilities = scope.getUtilities();
  setTimeout(function () {
    initDragDropCategories(function (c1, c2) {
      if (c1.id != c2.id) {
        scope.$apply(function () {
          for (var i = 0; i < scope.deal.categories.length; i++) {
            if (scope.deal.categories[i].id == c1.id) {
              scope.deal.categories[i].rank = c2.rank;
              scope.updateCategory(scope.deal.categories[i]);
            }
            if (scope.deal.categories[i].id == c2.id) scope.deal.categories[i].rank = c1.rank;
          }
        });
      }
    });
    initDragDropCategoriesImage(function (err, category, image) {
      if (err) utilities.MyAlert.show(err.message);
      else {
        utilities.MyLoading.show("");
        for (var i = 0; i < scope.deal.categories.length; i++) {
          if (scope.deal.categories[i].id == category) {
            utilities.Ordering.categories.update({
              id: scope.deal.categories[i].id,
              business_id: scope.deal.id,
              image: image
            }, function (res) {
              utilities.MyLoading.hide();
              if (!res.error) {
                scope.deal.categories[i].image = image;
                utilities.MyLoading.success(scope.translate('CATEGORY_SAVED'), 1500);
              } else utilities.MyAlert.show(res.result);
            });
            break;
          }
        }
      }
    });
  }, 500);
});

Extensions.add_action('after_business_editor_open_gallery_view', function (gallery, scope) {
  var utilities = scope.getUtilities();
  setTimeout(function () {
    initDragDrop('gallery_image', function (err, image) {
      if (err) utilities.MyAlert.show(err.message);
      else utilities.MyAlert.confirm(scope.translate('QUESTION_ADD_GALLERY_IMAGE')).then(function () {
        utilities.MyLoading.show();
        utilities.Ordering.business_gallery.add({
          business_id: scope.deal.id,
          type: 1,
          file: image
        }, function (res) {
          utilities.MyLoading.hide();
          if (!res.error) {
            scope.deal.gallery.push(res.result);
            utilities.MyLoading.success(scope.translate('GALLERY_IMAGE_ADDED'), 1500);
          } else utilities.MyAlert.show(res.result);
        });
      });
    });//, 500, 600);
  }, 150);
});

Extensions.add_action('after_listing_editor_view', function (businesses, scope) {
  var $state = scope.getNgDependency('$state');
  var timeout = null;
  var aux = null;
  scope.loading_more = false;
  var business_filtered = [];
  var MyAlert = scope.getNgDependency('MyAlert');
  var MyLoading = scope.getNgDependency('MyLoading');
  var Ordering = scope.getNgDependency('Ordering');
  var thumbsHeightChecker = setInterval(function () {
    if ($state.current.name != 'main.listing') {
      clearInterval(thumbsHeightChecker)
      return;
    }
    var thumbs = $('.thumbnail');
    if (thumbs.length == 1) {
      $('.thumbnail.editor').height(173);
      return;
    }
    var max = 0;
    for (var i = 0; i < thumbs.length; i++) {
      var header = $(thumbs[i]).find('.header');
      var caption = $(thumbs[i]).find('.caption');
      var height = header.outerHeight() + caption.outerHeight()
      if (height > max) {
        max = height;
      }
    }
    if (max < 200) max = 200;
    $('.thumbnail').height(max);
    if (IFRAME_INLINE) $('.thumbnail .header').css({ 'min-height': '0px' });
    if (timeout) {
      scope.loading_more = false;
      clearTimeout(timeout);
    }
    var curBusinesses = !scope.filterBusiness ? scope.business : business_filtered;
    var next = curBusinesses.slice(scope.filteredBusiness.length, scope.filteredBusiness.length + 25);
    if (!scope.filterBusinessType && $('html').height() - $('.footer').outerHeight() - 200 < $(window).scrollTop() + $(window).height() && next.length > 0) {
      scope.loading_more = true;
      timeout = setTimeout(function () {
        scope.loading_more = false;
        scope.filteredBusiness = scope.filteredBusiness.concat(next);
      }, 100);
    }
  }, 500);
  scope.delete = function (business, $event) {
    $event.stopPropagation();
    MyAlert.confirm(scope.translate('QUESTION_DELETE_BUSINESS')).then(function (res) {
      MyLoading.toast(scope.translate('LOADING') + '...');
      Ordering.business.delete({
        id: business
      }, function (res) {
        if (!res.error) {
          for (var i = 0; i < scope.filteredBusiness.length; i++) {
            if (scope.filteredBusiness[i].id == business) {
              scope.filteredBusiness.splice(i, 1);
            }
          }
          for (var i = 0; i < scope.business.length; i++) {
            if (scope.business[i].id == business) {
              scope.business.splice(i, 1);
            }
          }
          for (var i = 0; i < business_filtered.length; i++) {
            if (business_filtered[i].id == business) {
              business_filtered.splice(i, 1);
            }
          }
          if (aux) {
            for (var i = 0; i < aux.length; i++) {
              if (aux[i].id == business) {
                aux.splice(i, 1);
              }
            }
          }
          MyLoading.success(scope.translate('BUSINESS_DELETED'), 1500);
        } else {
          MyAlert.show(res.message);
          MyLoading.hide();
        }
      });
    });
  }
  scope.$watch('business', function (businesses) {
    if (businesses.length > 50 && scope.filterBusiness) {
      if (!aux) {
        aux = scope.filteredBusiness.slice();
      }
      business_filtered = scope.business.filter(function (deal) {
        return deal.name.toLowerCase().indexOf(scope.filterBusiness.toLowerCase()) > -1;
      });
      scope.filteredBusiness = business_filtered.slice(0, 50);
    }
  });
  scope.selectBusinessType = function ($event, type) {
    $event.preventDefault();
    scope.filterBusinessType = type;
    if (!aux) aux = scope.filteredBusiness.slice();
    var filtered = [];
    if (type == '') {
      filtered = aux;
    } else {
      for (var i = 0; i < scope.business.length; i++) {
        if (type == 'food' && scope.business[i].food) filtered.push(scope.business[i]);
        else if (type == 'alcohol' && scope.business[i].alcohol) filtered.push(scope.business[i]);
        else if (type == 'groceries' && scope.business[i].groceries) filtered.push(scope.business[i]);
        else if (type == 'laundry' && scope.business[i].laundry) filtered.push(scope.business[i]);
      }
    }
    scope.filteredBusiness = filtered;
  }

  $rootScope.curNumTablist = $rootScope.allbusinesstypes.length;
  scope.selectChangeBusinessType = function ($event, type) {
    if ($event) $event.preventDefault();
    scope.filterBusinessType = type;
    if (!aux) aux = scope.filteredBusiness.slice();
    var filters = [];
    if (type == '') filters = aux;
    else {
      scope.filterBusinessType = type.name;
      var type_name = "extra_type_" + type.id.replace(/[^a-zA-Z0-9]/g, '');
      for (var i = 0; i < scope.business.length; i++) {

        for (var j = 0; j < scope.business[i].metafields.length; j++) {
          if (scope.business[i].metafields[j].key == type_name && scope.business[i].metafields[j].value == true) {
            filters.push(scope.business[i]);
            break;
          }
        }
      }
    }
    scope.filteredBusiness = filters;
  }
  var get_fisrt = true;
  var li_items = [];
  var myVarInter = setInterval(function () {
    var more = $('#dropdown-more');
    if (more.length > 0) {
      var pli = more.parent('li');
      if (pli.position().left + pli.width() < more.width()) more.removeClass('dropdown-menu-right').addClass('dropdown-menu-left');
      else more.removeClass('dropdown-menu-left').addClass('dropdown-menu-right');
      // //console\.log(pli.position(), more.position());
    }
    $('.nav.nav-tabs').css('overflow', 'hidden');
    var categories = $('#dynamic_editor_types').outerWidth();
    if (get_fisrt && categories > 0) {
      get_fisrt = false;
      var items = $('#dynamic_editor_types ul li');
      if (items.length > 0) {
        for (var i = 0; i < items.length; i++) {
          li_items.push($(items[i]).outerWidth());
        }
      }
    }

    var w_items = 0;
    var numtab = 0;
    var brk1 = false;
    var brk2 = true;
    var i = 0;
    for (; i < li_items.length; i++) {
      if (w_items + li_items[i] + 3 <= categories && !brk1) {
        w_items += li_items[i] + 3;
        numtab++;
        scope.showMore = false;
      } else {
        if (!brk1) brk2 = false;
        brk1 = true;
        scope.showMore = true;
      }
      if (w_items + li_items[li_items.length - 1] > categories
        && !brk2) {
        numtab--;
        brk2 = true;
      }
    }
    numtab--;
    numtab--;
    $rootScope.curNumTablist = numtab;
    $('.nav.nav-tabs').css('overflow', 'inherit');
  }, 200);
  scope.$on("$destroy", function () {
    if (myVarInter) {
      clearInterval(myVarInter);
    }
  });

  scope.$watch('filterBusiness', function (value) {
    if (value == undefined || scope.filterBusinessType) return;
    if (value) {
      if (!aux) {
        aux = scope.filteredBusiness.slice();
      }
      business_filtered = scope.business.filter(function (deal) {
        return deal.name.toLowerCase().indexOf(value.toLowerCase()) > -1;
      });
      scope.filteredBusiness = business_filtered.slice(0, 50);
    } else {
      scope.filteredBusiness = aux;
      aux = null;
    }
  });
});

Extensions.add_action('after_orders_editor_view', function (orders, scope) {
  if (scope.delivery_mode) {
    $('.dashboard').height($(window).height() + ($('#bs-example-navbar-collapse-1').hasClass('in') ? $('.collapse.navbar-collapse').outerHeight() : 0) - ($('.navbar.navbar-default').outerHeight() + $('.nav.nav-tabs').outerHeight() + $('.form.editable').outerHeight() + 15));
    $('.dashboard .ditems').height($('.dashboard').height());
    $('.dashboard .dcontent').height($('.dashboard').height());
    $('.dashboard .dcontent .map').height($('.dashboard').height());
  }
});
Extensions.add_action('after_orders_manager_view', function (orders, $scope) {
  var Ordering = $scope.getNgDependency('Ordering');
  if ($scope.delivery_mode) {
    setTimeout(function () {
      var first = true;
      var dateday = $('#dateday').datetimepicker({
        format: 'YYYY-MM-DD',
      })
      dateday.on('dp.show', function () {
        $(".bootstrap-datetimepicker-widget").attr('data-tap-disabled', 'true');
      });
      $("#dateday").on("dp.change", function (e) {
        $scope.$apply(function () {
          if (first) {
            first = false;
            $('#dateday').val('');
            return;
          }
          if ($('#dateday').val() != $scope.search.date.day) {
            $scope.search.date.day = $('#dateday').val();
            $scope.changeDeliveryFilter();
          }
        });
      });
      var viewHeight = $('.navbar').outerHeight(true) + $('.orders-tabs').outerHeight(true) + $('.form.editable .group').outerHeight(true);//+$('.container.footer').outerHeight(true);
      var diffHeight = $(window).height() - viewHeight;
      if (diffHeight < 200) diffHeight = 400;
      $('.dashboard .ditems').height(diffHeight);
      $('.dashboard .dcontent').height(diffHeight);
      $('.dashboard .dcontent .map').height(diffHeight);

      document.getElementsByClassName('ditems')[0].onscroll = function (e) {
        var curScroll = this.scrollTop + diffHeight;
        if (this.scrollHeight - curScroll < 200 && !$scope.loadings[$scope.curTab] && $scope.orders[$scope.curTab].length < $scope.counters[$scope.curTab]) {
          $scope.loadings[$scope.curTab] = true;
          var where = $scope.generateWhere().where;
          var where_status = $scope.generateWhere().where_status;
          var orderBy = $scope.search.orderby;
          var status = [{
            attribute: 'status',
            value: where_status ? where_status.value : $scope.order_status[$scope.curTab]
          }];
          var offset = $scope.orders[$scope.curTab].length;
          Ordering.orders.all({
            mode: 'dashboard',
            orderBy: orderBy,
            where: where.concat(status),
            limit: $scope._pagination.items,
            offset: offset
          }, function (res) {
            if (!res.error) {
              var inserts = [];
              var orders_ids = $scope.orders[$scope.curTab].map(function (order) {
                return order.id;
              });
              res.result.forEach(function (order) {
                if (orders_ids.indexOf(order.id) == -1) inserts.push(order);
              });
              $scope.orders[$scope.curTab] = $scope.orders[$scope.curTab].concat(inserts);
              $scope.loadings[$scope.curTab] = false;
            }
          });
        }
      };
    }, 200);
    $scope.$watch('curTab', function () {
      if (document.getElementsByClassName('ditems')[0]) {
        document.getElementsByClassName('ditems')[0].scrollTo(0, 0);
      }
    });
  }
});

Extensions.add_action('product_option_radio_changed', function (suboption, scope) {
  $("#option_" + suboption.extra_option_id).removeClass("invalid");
});

Extensions.add_action('product_option_checkbox_changed', function (suboption, scope) {
  $("#option_" + suboption.extra_option_id).removeClass("invalid");
});

Extensions.add_action('product_option_errors', function (errors, scope) {
  var utilities = scope.getUtilities();
  var $ionicScrollDelegate = scope.getNgDependency('$ionicScrollDelegate');
  for (var i = 0; i < errors.length; i++) {
    if (i == 0) {
      $ionicScrollDelegate.scrollTo(0, ionic.DomUtil.getPositionInParent($("#option_" + errors[i].id)[0]).top, true);
    }
    $("#option_" + errors[i].id).addClass("invalid");
  }
});

Extensions.add_action('checkout_form_errors', function (errors, scope) {
  var utilities = scope.getUtilities();
  for (var key in scope.errors) {
    if (key == 'paymethod' && scope.errors[key].status) {
      if (ADDONS.web_template) $('html').animate({ scrollTop: $('#paymethods').position().top }, 500);
      else utilities.ionicScrollDelegate.scrollTo(0, ionic.DomUtil.getPositionInParent($("#paymethods")[0]).top - 100, true);
      break;
    }
    var iOS = ['iPad', 'iPhone', 'iPod'].indexOf(navigator.platform) >= 0;
    if (scope.errors[key].status) {
      if (iOS && ADDONS.web_template) {
        window.scrollTo(0, 0);
      } else {
        if (ADDONS.web_template) $('html').animate({ scrollTop: 0 }, 500);
        else utilities.ionicScrollDelegate.scrollTo(0, 0, true);
        break;
      }

    }
  }
});

Extensions.add_action('enter_users_update_editor_view', function (user, scope) {
  setTimeout(function () {
    initDragDrop('photo_user_settings', function (err, image) {
      if (err) MyAlert.show(err.message);
      else scope.curUser.image = image;
    });
  }, 200);
});

Extensions.add_action('enter_users_create_editor_view', function (user, scope) {
  setTimeout(function () {
    initDragDrop('photo_user_settings', function (err, image) {
      if (err) MyAlert.show(err.message);
      else scope.curUser.image = image;
    });
  }, 200);
});


function initImageDriverType(scope) {
  setTimeout(function () {
    initDragDrop('photo_user_type_settings', function (err, image) {
      if (err) MyAlert.show(err.message);
      else scope.curDriverType.image = image;
    });
  }, 500);
}

Extensions.add_action('enter_drivermanager_create_editor_view', function (user, scope) {
  initImageDriverType(scope);
});

Extensions.add_action('enter_drivermanager_update_editor_view', function (user, scope) {
  initImageDriverType(scope);
});

Extensions.add_action('enter_driver_create_editor_view', function (user, scope) {
  initImageDriverType(scope);
});

Extensions.add_action('enter_driver_update_editor_view', function (user, scope) {
  initImageDriverType(scope);
});

Extensions.add_action('after_open_image_page_editor_view', function (gallery, scope) {
  var utilities = scope.getUtilities();
  //console\.log('extension', utilities);
  setTimeout(function () {
    initDragDrop('gallery_image', function (err, image) {
      if (err) utilities.MyAlert.show(err.message);
      else utilities.MyAlert.confirm(scope.translate('QUESTION_ADD_GALLERY_IMAGE')).then(function () {
        utilities.MyLoading.show();
        //console\.log(image)
        utilities.Ordering.files.add({
          type: 1,
          source: image
        }, function (res) {
          utilities.MyLoading.hide();
          if (!res.error) {
            scope.gallery.push(res.result);
            scope.data.imageUrl = res.result.source;
            utilities.MyLoading.success(scope.translate('GALLERY_IMAGE_ADDED'), 1500);
          } else utilities.MyAlert.show(res.result);
        });
      });
    });//, 500, 600);
  }, 150);
});

Extensions.add_action('enter_home_view', function (none, $scope) {
  var Ordering = $scope.getNgDependency('Ordering');
  var pageContent;
  Ordering.pages.get({
    page_id: 'content'
  }, function (res) {
    if (!res.error) {
      $("#home-content").append(res.result.body);
    } else MyAlert.show(res.result)
  })


});


Extensions.add_action('enter_drivers_editor_view', function (empty, $scope) {

  $scope.logistic = {
    status: $scope.curDrivergroup.autoassign_amount_drivers == 0 && $scope.curDrivergroup.orders_group_max_orders == 0 ? false : true,
    delivery: false,
    pickup: false
  }

  $scope.acceptByDriver = {
    status: $scope.curDrivergroup.autoassign_autoaccept_by_driver == '1' ? true : false
  };

  $scope.markDriverBusy = {
    enabled: false
  }
  $scope.curDrivergroup.orders_group_use_maps_api = $scope.curDrivergroup.orders_group_use_maps_api == '1' ? true : false;
  $scope.autoAssign = 0;
  $scope.curArea = -1;
  $scope.getHours = function (seconds) {
    return (seconds * 1) / 3600 > 1 ? Math.floor((seconds * 1) / 3600) : 0;
  }
  $scope.getMinuts = function (seconds) {
    return (seconds * 1) / 3600 > 1 ? (((seconds * 1) / 3600) - Math.floor((seconds * 1) / 3600)) * 60 : (seconds * 1) / 60 > 1 ? Math.floor((seconds * 1) / 60) : 0;
  }
  $scope.getSeconds = function (seconds) {
    var h = (seconds * 1) / 3600;
    var m = (seconds * 1) / 60;
    var remain = h > 1 ? (h - Math.floor(h)) * 3600 : m > 1 ? (m - Math.floor(m)) * 60 : seconds;
    return parseInt(remain);
  }

  $scope.maxTimeBetweenOrder = {
    hour: $scope.getHours($scope.curDrivergroup.orders_group_max_time_between),
    minute: $scope.getMinuts($scope.curDrivergroup.orders_group_max_time_between),
    second: $scope.getSeconds($scope.curDrivergroup.orders_group_max_time_between)
  }
  $scope.maxTimeBetweenBusiness = {
    hour: $scope.getHours($scope.curDrivergroup.orders_group_max_time_between_pickup),
    minute: $scope.getMinuts($scope.curDrivergroup.orders_group_max_time_between_pickup),
    second: $scope.getSeconds($scope.curDrivergroup.orders_group_max_time_between_pickup)
  }
  $scope.maxTimeBetweenDelivery = {
    hour: $scope.getHours($scope.curDrivergroup.orders_group_max_time_between_delivery),
    minute: $scope.getMinuts($scope.curDrivergroup.orders_group_max_time_between_delivery),
    second: $scope.getSeconds($scope.curDrivergroup.orders_group_max_time_between_delivery)
  }
  $scope.autoRejectOrderGroup = {
    hour: $scope.getHours($scope.curDrivergroup.autoassign_autoreject_time),
    minute: $scope.getMinuts($scope.curDrivergroup.autoassign_autoreject_time),
    second: $scope.getSeconds($scope.curDrivergroup.autoassign_autoreject_time)
  }

  $scope.onChangeAcceptDriver = function () {
    $scope.curDrivergroup.autoassign_autoaccept_by_driver = $scope.acceptByDriver.status ? '1' : '0';
    $scope.drivergroup_settings.scope.save(['autoassign_autoaccept_by_driver']);
  }

  $scope.onChangeTimeBetweenOrder = function (e) {
    $scope.curDrivergroup.orders_group_max_time_between = $scope.maxTimeBetweenOrder.hour * 1 * 3600 + $scope.maxTimeBetweenOrder.minute * 1 * 60 + $scope.maxTimeBetweenOrder.second * 1;
    $scope.drivergroup_settings.scope.save(['orders_group_max_time_between']);
  }

  $scope.onChangeTimeBetweenBusiness = function (e) {
    $scope.curDrivergroup.orders_group_max_time_between_pickup = $scope.maxTimeBetweenBusiness.hour * 1 * 3600 + $scope.maxTimeBetweenBusiness.minute * 1 * 60 + $scope.maxTimeBetweenBusiness.second * 1;
    $scope.drivergroup_settings.scope.save(['orders_group_max_time_between_pickup']);
  }

  $scope.onChangeTimeBetweenDelivery = function (e) {
    $scope.curDrivergroup.orders_group_max_time_between_delivery = $scope.maxTimeBetweenDelivery.hour * 1 * 3600 + $scope.maxTimeBetweenDelivery.minute * 1 * 60 + $scope.maxTimeBetweenDelivery.second * 1;
    $scope.drivergroup_settings.scope.save(['orders_group_max_time_between_delivery']);
  }

  $scope.onChangeAutoRejectOrderGroup = function (e) {
    $scope.curDrivergroup.autoassign_autoreject_time = $scope.autoRejectOrderGroup.hour * 1 * 3600 + $scope.autoRejectOrderGroup.minute * 1 * 60 + $scope.autoRejectOrderGroup.second * 1;
    $scope.drivergroup_settings.scope.save(['autoassign_autoreject_time']);
  }

  $scope.onLogistic = function () {
    if ($scope.logistic.status) return;
    $scope.curDrivergroup.autoassign_amount_drivers = 0;
    $scope.curDrivergroup.orders_group_max_orders = 0;
    if ($scope.curDrivergroup.id == -1) return;
    $scope.updateDrivergroup($scope.curDrivergroup, ['autoassign_amount_drivers', 'orders_group_max_orders']);
  }

  $scope.onCheckLogistic = function (e, type) {
    if (!$scope.logistic.status) return;
    if (type == 'delivery') {
      $scope.curDrivergroup.orders_group_start_in_status = '7';
      $scope.logistic.delivery = !$scope.logistic.delivery
    } else if (type == 'pickup') {
      $scope.logistic.pickup = !$scope.logistic.pickup;
      $scope.curDrivergroup.orders_group_start_in_status = '4';
    }
    if ($scope.curDrivergroup.id == -1) return;
    $scope.updateDrivergroup($scope.curDrivergroup, ['orders_group_start_in_status']);
  }

  $scope.onDriverAdvanced = function (e) {
    e.preventDefault();
    $scope.markDriverBusy.enabled = !$scope.markDriverBusy.enabled;
  }

  $scope.onSelectAssign = function (type) {
    $scope.autoAssign = type;
    if (type == 1) {
      // one by one
      $scope.curDrivergroup.autoassign_initial_radius = 500;
      $scope.curDrivergroup.autoassign_increment_radius = 100;
      $scope.curDrivergroup.autoassign_max_radius = 15000;

      $scope.curDrivergroup.autoassign_amount_drivers = 1;
    } else if (type == 2) {
      // send to all
      $scope.curDrivergroup.autoassign_initial_radius = 15000;
      $scope.curDrivergroup.autoassign_increment_radius = 15000;
      $scope.curDrivergroup.autoassign_max_radius = 15000;

      $scope.curDrivergroup.autoassign_amount_drivers = 1000;
    } else if (type == 3) {
      // nearest available
      $scope.curDrivergroup.autoassign_initial_radius = 100;
      $scope.curDrivergroup.autoassign_increment_radius = 100;
      $scope.curDrivergroup.autoassign_max_radius = 1500;

      $scope.curDrivergroup.autoassign_amount_drivers = 1;
    } else if (type == 4) {
      // batch wise
      $scope.curDrivergroup.autoassign_initial_radius = 1000;
      $scope.curDrivergroup.autoassign_increment_radius = 500;
      $scope.curDrivergroup.autoassign_max_radius = 15000;

      $scope.curDrivergroup.autoassign_amount_drivers = 2;
    } else if (type == 5) {
      // round robin
      $scope.curDrivergroup.autoassign_initial_radius = 15000;
      $scope.curDrivergroup.autoassign_increment_radius = 15000;
      $scope.curDrivergroup.autoassign_max_radius = 15000;

      $scope.curDrivergroup.autoassign_amount_drivers = 1;
    } else if (type == 6) {
      // other
      $scope.curDrivergroup.autoassign_initial_radius = '';
      $scope.curDrivergroup.autoassign_increment_radius = '';
      $scope.curDrivergroup.autoassign_max_radius = '';

      $scope.curDrivergroup.autoassign_amount_drivers = '';
    }
    $scope.drivergroup_settings.scope.save(['autoassign_initial_radius', 'autoassign_increment_radius', 'autoassign_max_radius', 'autoassign_amount_drivers']);
  }

  if ($scope.curDrivergroup.autoassign_initial_radius * 1 == 500 && $scope.curDrivergroup.autoassign_amount_drivers * 1 == 1) $scope.autoAssign = 1;
  else if ($scope.curDrivergroup.autoassign_initial_radius * 1 == 15000 && $scope.curDrivergroup.autoassign_amount_drivers * 1 == 1000) $scope.autoAssign = 2;
  else if ($scope.curDrivergroup.autoassign_initial_radius * 1 == 100 && $scope.curDrivergroup.autoassign_amount_drivers * 1 == 1) $scope.autoAssign = 3;
  else if ($scope.curDrivergroup.autoassign_initial_radius * 1 == 1000 && $scope.curDrivergroup.autoassign_amount_drivers * 1 == 2) $scope.autoAssign = 4;
  else if ($scope.curDrivergroup.autoassign_initial_radius * 1 == 15000 && $scope.curDrivergroup.autoassign_amount_drivers * 1 == 1) $scope.autoAssign = 5;
  else $scope.autoAssign = 6;

});

Extensions.add_action('enter_search_view', function (error, scope) {
  var $scope = scope;
  $ionicHistory = scope.getNgDependency('$ionicHistory');
  $rootScope = scope.getNgDependency('$rootScope');
  $state = scope.getNgDependency('$state');
  gOrder = scope.getNgDependency('gOrder');
  MyAlert = scope.getNgDependency('MyAlert');
  MyLoading = scope.getNgDependency('MyLoading');
  gAllBusiness = scope.getNgDependency('gAllBusiness');
  Ordering = scope.getNgDependency('Ordering');
  gBusiness = scope.getNgDependency('gBusiness');
  gCart = scope.getNgDependency('gCart');
  gPreorder = scope.getNgDependency('gPreorder');
  gAddress = scope.getNgDependency('gAddress');

  $rootScope.multi_buttn = true;

  /**************Multi business start1************/
  $scope.onBusiness = function (business, preorder) {
    var data = gOrder.getData();
    // console.log($scope.mbusspartnercheck);

    //if (business.slug != gOrder.getData().business_slug) gCart.setData([]);
    //console\.log(business.partner_id)

    /*  if(business.partner_id){
       data.business_slug = business.slug;
     gOrder.setData(data);
     if (!preorder && !business.open) {
       if (ADDONS.preorder) {
         $scope.openPreorder(business, function () {
           if (ADDONS.web_template) $state.go('main.business', { 'business': business.slug });
           else $state.go('mobileDetailRest');
         });
       } else {
         var lapses = '';
         for (i in business.today.lapses) {
           lapses += $rootScope.parseTime(business.today.lapses[i].open) + ' - ' + $rootScope.parseTime(business.today.lapses[i].close) + '<br>';
         }
         MyAlert.show(lapses);
       }
       return;
     }
     if (ADDONS.web_template) {
       localStorageApp.setItem(STORE.FROM_SEARCH, true);
       $state.go('main.business', { 'business': business.slug });
       return;
     } else {
       MyLoading.show($scope.translate('LOADING')+'...');
       var data_search = {
         id_or_slug: business.id,
       };
       if (gPreorder.getData().menu_id) data_search.menu_id = gPreorder.getData().menu_id;
       if (gOrder.getData().dropdownoption && gOrder.getData().dropdownoption != '') {
         data_search.dropdownoption = gOrder.getData().dropdownoption;
         if (gOrder.getData().type) data_search.type = gOrder.getData().type;
       } else if (gOrder.getData().address && gOrder.getData().address != '') {
         if (gOrder.getData().business_slug == business.slug) data_search.location = gOrder.getData().position.lat+','+gOrder.getData().position.lng;
         if (gOrder.getData().type) data_search.type = gOrder.getData().type;
       }
       // if (NEW_FEATURES.BUSINESS_PAGE) {
       // 	data_search.params = 'name,email,slug,schedule,description,about,logo,header,phone,cellphone,owner_id,city_id,address,address_notes,zipcode,location,featured,timezone,food,alcohol,groceries,laundry,groceries,use_printer,printer_id,minimum,delivery_price,always_deliver,tax_type,tax,delivery_time,pickup_time,service_fee,fixed_usage_fee,percentage_usage_fee,enabled,checkoutfields,reviews,categories,menus,city,webhooks,currency,zones,gallery,paymethods,offers';
       // }
       Ordering.business.get(data_search, function (res) {
         if (!res.error) {
           NEW_FEATURES.BUSINESS_PAGE = res.result.lazy_load_products_recommended;
           MyLoading.hide();
           var order = gOrder.getData();
           order.business_slug = res.result.slug;
           gOrder.setData(order);
           gBusiness.setData(res.result);
           //console\.log('set 2');
           gmultiBusiness.setData(res.result);
           $state.go('mobileDetailRest');
         }
       });
     }
       
       }else{
       MyAlert.show('Your cart has items that are not compatible. If you are try to choose multi order, please choose from premium partner restaurants');
       
       } */
    if ($rootScope.numCart)
      $rootScope.numCart = $rootScope.numCart;
    else $rootScope.numCart = 0;
    console.log($rootScope.numCart + ', ' + business.partner_id)

    if ($rootScope.numCart > 0 && !business.partner_id) {
      // alert(11)

      $scope.mbusspartnercheck = gmultiBusiness.getData();
      console.log($scope.mbusspartnercheck);
      for (var j = 0; j < $scope.mbusspartnercheck.length; j++) {
        console.log($scope.mbusspartnercheck[j].partner_id)
        if ($scope.mbusspartnercheck[j].partner_id) {
          console.log($scope.mbusspartnercheck[j].id + ', true')
          MyAlert.show('Your cart has items that are not compatible. If you are try to choose multi order, please choose from premium partner restaurants');
          return;
        }
        else {
          console.log($scope.mbusspartnercheck[j].id + ', false')
          console.log('single business')
          var data = gOrder.getData();
          if (business.slug != gOrder.getData().business_slug) gCart.setData([]);
          gmultiBusiness.setData([]);


          $rootScope.multi_buttn = false;
          data.business_slug = business.slug;
          gOrder.setData(data);
          if (!preorder && !business.open) {
            if (ADDONS.preorder) {
              $scope.openPreorder(business, function () {
                if (ADDONS.web_template) $state.go('main.business', { 'business': business.slug });
                else $state.go('mobileDetailRest');
              });
            } else {
              var lapses = '';
              for (i in business.today.lapses) {
                lapses += $rootScope.parseTime(business.today.lapses[i].open) + ' - ' + $rootScope.parseTime(business.today.lapses[i].close) + '<br>';
              }
              MyAlert.show(lapses);
            }
            return;
          }
          if (ADDONS.web_template) {
            localStorageApp.setItem(STORE.FROM_SEARCH, true);
            $state.go('main.business', { 'business': business.slug });
            return;
          } else {
            MyLoading.show($scope.translate('LOADING') + '...');
            var data_search = {
              id_or_slug: business.id,
            };
            if (gPreorder.getData().menu_id) data_search.menu_id = gPreorder.getData().menu_id;
            if (gOrder.getData().dropdownoption && gOrder.getData().dropdownoption != '') {
              data_search.dropdownoption = gOrder.getData().dropdownoption;
              if (gOrder.getData().type) data_search.type = gOrder.getData().type;
            } else if (gOrder.getData().address && gOrder.getData().address != '') {
              if (gOrder.getData().business_slug == business.slug) data_search.location = gOrder.getData().position.lat + ',' + gOrder.getData().position.lng;
              if (gOrder.getData().type) data_search.type = gOrder.getData().type;
            }
            // if (NEW_FEATURES.BUSINESS_PAGE) {
            // 	data_search.params = 'name,email,slug,schedule,description,about,logo,header,phone,cellphone,owner_id,city_id,address,address_notes,zipcode,location,featured,timezone,food,alcohol,groceries,laundry,groceries,use_printer,printer_id,minimum,delivery_price,always_deliver,tax_type,tax,delivery_time,pickup_time,service_fee,fixed_usage_fee,percentage_usage_fee,enabled,checkoutfields,reviews,categories,menus,city,webhooks,currency,zones,gallery,paymethods,offers';
            // }
            Ordering.business.get(data_search, function (res) {
              if (!res.error) {
                NEW_FEATURES.BUSINESS_PAGE = res.result.lazy_load_products_recommended;
                MyLoading.hide();
                var order = gOrder.getData();
                order.business_slug = res.result.slug;
                gOrder.setData(order);
                gBusiness.setData(res.result);
                //console\.log('set 2');
                gmultiBusiness.setData(res.result);
                $state.go('mobileDetailRest');
              }
            });
          }
        }

      }






    } else if ($rootScope.numCart == 0 && !business.partner_id) {


      // var data = gOrder.getData();
      if (business.slug != gOrder.getData().business_slug) gCart.setData([]);
      gmultiBusiness.setData([]);
      // alert('single business')
      $rootScope.multi_buttn = false;
      data.business_slug = business.slug;
      gOrder.setData(data);
      if (!preorder && !business.open) {
        if (ADDONS.preorder) {
          $scope.openPreorder(business, function () {
            if (ADDONS.web_template) $state.go('main.business', { 'business': business.slug });
            else $state.go('mobileDetailRest');
          });
        } else {
          var lapses = '';
          for (i in business.today.lapses) {
            lapses += $rootScope.parseTime(business.today.lapses[i].open) + ' - ' + $rootScope.parseTime(business.today.lapses[i].close) + '<br>';
          }
          MyAlert.show(lapses);
        }
        return;
      }
      if (ADDONS.web_template) {
        localStorageApp.setItem(STORE.FROM_SEARCH, true);
        $state.go('main.business', { 'business': business.slug });
        return;
      } else {
        MyLoading.show($scope.translate('LOADING') + '...');
        var data_search = {
          id_or_slug: business.id,
        };
        if (gPreorder.getData().menu_id) data_search.menu_id = gPreorder.getData().menu_id;
        if (gOrder.getData().dropdownoption && gOrder.getData().dropdownoption != '') {
          data_search.dropdownoption = gOrder.getData().dropdownoption;
          if (gOrder.getData().type) data_search.type = gOrder.getData().type;
        } else if (gOrder.getData().address && gOrder.getData().address != '') {
          if (gOrder.getData().business_slug == business.slug) data_search.location = gOrder.getData().position.lat + ',' + gOrder.getData().position.lng;
          if (gOrder.getData().type) data_search.type = gOrder.getData().type;
        }
        // if (NEW_FEATURES.BUSINESS_PAGE) {
        // 	data_search.params = 'name,email,slug,schedule,description,about,logo,header,phone,cellphone,owner_id,city_id,address,address_notes,zipcode,location,featured,timezone,food,alcohol,groceries,laundry,groceries,use_printer,printer_id,minimum,delivery_price,always_deliver,tax_type,tax,delivery_time,pickup_time,service_fee,fixed_usage_fee,percentage_usage_fee,enabled,checkoutfields,reviews,categories,menus,city,webhooks,currency,zones,gallery,paymethods,offers';
        // }
        Ordering.business.get(data_search, function (res) {
          if (!res.error) {
            NEW_FEATURES.BUSINESS_PAGE = res.result.lazy_load_products_recommended;
            MyLoading.hide();
            var order = gOrder.getData();
            order.business_slug = res.result.slug;
            gOrder.setData(order);
            gBusiness.setData(res.result);
            //console\.log('set 2');
            gmultiBusiness.setData(res.result);
            $state.go('mobileDetailRest');
          }
        });
      }

    }
    else { //alert(33)
      if (business.partner_id && $rootScope.numCart >= 0) {// alert('multi business')
        $scope.mbusspartnercheck = gmultiBusiness.getData();
        console.log($scope.mbusspartnercheck.length);
        if ($scope.mbusspartnercheck.length > 0) {
          for (var j = 0; j < $scope.mbusspartnercheck.length; j++) {
            console.log($scope.mbusspartnercheck[j].partner_id)
            if ($scope.mbusspartnercheck[j].partner_id) {
              console.log($scope.mbusspartnercheck[j].id + ', true')
              data.business_slug = business.slug;
              gOrder.setData(data);
              if (!preorder && !business.open) {
                if (ADDONS.preorder) {
                  $scope.openPreorder(business, function () {
                    if (ADDONS.web_template) $state.go('main.business', { 'business': business.slug });
                    else $state.go('mobileDetailRest');
                  });
                } else {
                  var lapses = '';
                  for (i in business.today.lapses) {
                    lapses += $rootScope.parseTime(business.today.lapses[i].open) + ' - ' + $rootScope.parseTime(business.today.lapses[i].close) + '<br>';
                  }
                  MyAlert.show(lapses);
                }
                return;
              }
              if (ADDONS.web_template) {
                localStorageApp.setItem(STORE.FROM_SEARCH, true);
                $state.go('main.business', { 'business': business.slug });
                return;
              } else {
                MyLoading.show($scope.translate('LOADING') + '...');
                var data_search = {
                  id_or_slug: business.id,
                };
                if (gPreorder.getData().menu_id) data_search.menu_id = gPreorder.getData().menu_id;
                if (gOrder.getData().dropdownoption && gOrder.getData().dropdownoption != '') {
                  data_search.dropdownoption = gOrder.getData().dropdownoption;
                  if (gOrder.getData().type) data_search.type = gOrder.getData().type;
                } else if (gOrder.getData().address && gOrder.getData().address != '') {
                  if (gOrder.getData().business_slug == business.slug) data_search.location = gOrder.getData().position.lat + ',' + gOrder.getData().position.lng;
                  if (gOrder.getData().type) data_search.type = gOrder.getData().type;
                }
                // if (NEW_FEATURES.BUSINESS_PAGE) {
                // 	data_search.params = 'name,email,slug,schedule,description,about,logo,header,phone,cellphone,owner_id,city_id,address,address_notes,zipcode,location,featured,timezone,food,alcohol,groceries,laundry,groceries,use_printer,printer_id,minimum,delivery_price,always_deliver,tax_type,tax,delivery_time,pickup_time,service_fee,fixed_usage_fee,percentage_usage_fee,enabled,checkoutfields,reviews,categories,menus,city,webhooks,currency,zones,gallery,paymethods,offers';
                // }
                Ordering.business.get(data_search, function (res) {
                  if (!res.error) {
                    NEW_FEATURES.BUSINESS_PAGE = res.result.lazy_load_products_recommended;
                    MyLoading.hide();
                    var order = gOrder.getData();
                    order.business_slug = res.result.slug;
                    gOrder.setData(order);
                    gBusiness.setData(res.result);
                    //console\.log('set 2');
                    gmultiBusiness.setData(res.result);
                    $state.go('mobileDetailRest');
                  }
                });
              }
            }

            else {
              //MyAlert.show('Your cart has items that are not compatible. If you are try to choose multi order, please choose from premium partner restaurants');
              // var data = gOrder.getData();
              if (business.slug != gOrder.getData().business_slug) gCart.setData([]);
              gmultiBusiness.setData([]);
              // alert('single business')
              $rootScope.multi_buttn = false;
              data.business_slug = business.slug;
              gOrder.setData(data);
              if (!preorder && !business.open) {
                if (ADDONS.preorder) {
                  $scope.openPreorder(business, function () {
                    if (ADDONS.web_template) $state.go('main.business', { 'business': business.slug });
                    else $state.go('mobileDetailRest');
                  });
                } else {
                  var lapses = '';
                  for (i in business.today.lapses) {
                    lapses += $rootScope.parseTime(business.today.lapses[i].open) + ' - ' + $rootScope.parseTime(business.today.lapses[i].close) + '<br>';
                  }
                  MyAlert.show(lapses);
                }
                return;
              }
              if (ADDONS.web_template) {
                localStorageApp.setItem(STORE.FROM_SEARCH, true);
                $state.go('main.business', { 'business': business.slug });
                return;
              } else {
                MyLoading.show($scope.translate('LOADING') + '...');
                var data_search = {
                  id_or_slug: business.id,
                };
                if (gPreorder.getData().menu_id) data_search.menu_id = gPreorder.getData().menu_id;
                if (gOrder.getData().dropdownoption && gOrder.getData().dropdownoption != '') {
                  data_search.dropdownoption = gOrder.getData().dropdownoption;
                  if (gOrder.getData().type) data_search.type = gOrder.getData().type;
                } else if (gOrder.getData().address && gOrder.getData().address != '') {
                  if (gOrder.getData().business_slug == business.slug) data_search.location = gOrder.getData().position.lat + ',' + gOrder.getData().position.lng;
                  if (gOrder.getData().type) data_search.type = gOrder.getData().type;
                }
                // if (NEW_FEATURES.BUSINESS_PAGE) {
                // 	data_search.params = 'name,email,slug,schedule,description,about,logo,header,phone,cellphone,owner_id,city_id,address,address_notes,zipcode,location,featured,timezone,food,alcohol,groceries,laundry,groceries,use_printer,printer_id,minimum,delivery_price,always_deliver,tax_type,tax,delivery_time,pickup_time,service_fee,fixed_usage_fee,percentage_usage_fee,enabled,checkoutfields,reviews,categories,menus,city,webhooks,currency,zones,gallery,paymethods,offers';
                // }
                Ordering.business.get(data_search, function (res) {
                  if (!res.error) {
                    NEW_FEATURES.BUSINESS_PAGE = res.result.lazy_load_products_recommended;
                    MyLoading.hide();
                    var order = gOrder.getData();
                    order.business_slug = res.result.slug;
                    gOrder.setData(order);
                    gBusiness.setData(res.result);
                    //console\.log('set 2');
                    gmultiBusiness.setData(res.result);
                    $state.go('mobileDetailRest');
                  }
                });
              }
            }
          }
        } else {
          if (business.slug != gOrder.getData().business_slug) gCart.setData([]);
          gmultiBusiness.setData([]);
          // alert('single business')
          $rootScope.multi_buttn = false;
          data.business_slug = business.slug;
          gOrder.setData(data);
          if (!preorder && !business.open) {
            if (ADDONS.preorder) {
              $scope.openPreorder(business, function () {
                if (ADDONS.web_template) $state.go('main.business', { 'business': business.slug });
                else $state.go('mobileDetailRest');
              });
            } else {
              var lapses = '';
              for (i in business.today.lapses) {
                lapses += $rootScope.parseTime(business.today.lapses[i].open) + ' - ' + $rootScope.parseTime(business.today.lapses[i].close) + '<br>';
              }
              MyAlert.show(lapses);
            }
            return;
          }
          if (ADDONS.web_template) {
            localStorageApp.setItem(STORE.FROM_SEARCH, true);
            $state.go('main.business', { 'business': business.slug });
            return;
          } else {
            MyLoading.show($scope.translate('LOADING') + '...');
            var data_search = {
              id_or_slug: business.id,
            };
            if (gPreorder.getData().menu_id) data_search.menu_id = gPreorder.getData().menu_id;
            if (gOrder.getData().dropdownoption && gOrder.getData().dropdownoption != '') {
              data_search.dropdownoption = gOrder.getData().dropdownoption;
              if (gOrder.getData().type) data_search.type = gOrder.getData().type;
            } else if (gOrder.getData().address && gOrder.getData().address != '') {
              if (gOrder.getData().business_slug == business.slug) data_search.location = gOrder.getData().position.lat + ',' + gOrder.getData().position.lng;
              if (gOrder.getData().type) data_search.type = gOrder.getData().type;
            }
            // if (NEW_FEATURES.BUSINESS_PAGE) {
            // 	data_search.params = 'name,email,slug,schedule,description,about,logo,header,phone,cellphone,owner_id,city_id,address,address_notes,zipcode,location,featured,timezone,food,alcohol,groceries,laundry,groceries,use_printer,printer_id,minimum,delivery_price,always_deliver,tax_type,tax,delivery_time,pickup_time,service_fee,fixed_usage_fee,percentage_usage_fee,enabled,checkoutfields,reviews,categories,menus,city,webhooks,currency,zones,gallery,paymethods,offers';
            // }
            Ordering.business.get(data_search, function (res) {
              if (!res.error) {
                NEW_FEATURES.BUSINESS_PAGE = res.result.lazy_load_products_recommended;
                MyLoading.hide();
                var order = gOrder.getData();
                order.business_slug = res.result.slug;
                gOrder.setData(order);
                gBusiness.setData(res.result);
                //console\.log('set 2');
                gmultiBusiness.setData(res.result);
                $state.go('mobileDetailRest');
              }
            });
          }

        }

      }//2653 if closing (business.partner_id && $rootScope.numCart >= 0)
    }
  }
  /*********End of Multi business start1**********/


  /*********Business type slider**********/
  setTimeout(function () {
    var setInvisible = function (elem) {
      elem.css('visibility', 'hidden');
    };
    var setVisible = function (elem) {
      elem.css('visibility', 'visible');
    };

    var elem = $("#elem");
    var items = elem.children();

    // Inserting Buttons
    elem.prepend('<div id="right-button" style="visibility: hidden;"><a href="#"><i class="fa fa-angle-left" aria-hidden="true"></i></a></div>');
    elem.append('  <div id="left-button"><a href="#"><i class="fa fa-angle-right" aria-hidden="true"></i></a></div>');

    // Inserting Inner
    items.wrapAll('<div id="inner" />');

    // Inserting Outer
    //debugger;
    elem.find('#inner').wrap('<div id="outer"/>');

    var outer = $('#outer');

    var updateUI = function () {
      var maxWidth = outer.outerWidth(true);
      var actualWidth = 0;
      $.each($('#inner >'), function (i, item) {
        actualWidth += $(item).outerWidth(true);
      });

      if (actualWidth <= maxWidth) {
        setVisible($('#left-button'));
      }
    };
    updateUI();



    $('#right-button').click(function () {
      var leftPos = outer.scrollLeft();
      outer.animate({
        scrollLeft: leftPos - 200
      }, 800, function () {
        debugger;
        if ($('#outer').scrollLeft() <= 0) {
          setInvisible($('#right-button'));
        }
      });
    });

    $('#left-button').click(function () {
      setVisible($('#right-button'));
      var leftPos = outer.scrollLeft();
      outer.animate({
        scrollLeft: leftPos + 200
      }, 800);
    });

  }, 2000);
  /********End of slider code***************/

  $scope.loadData = function () {
    var order = gOrder.getData();
    var change_direction = false;
    console.log($state.params.order_type)
    ///if(order.type == '1')
    // $state.params.order_type = 'delivery'
    //if (!order.type || (order.type != $state.params.order_type && ADDONS.web_template)) order.type = $state.params.order_type == 'delivery'?'1':'2';
    if (!order.type || (order.type != $state.params.order_type && ADDONS.web_template)) {
      console.log('in here: ' + $state.params.order_type)
      if ($state.params.order_type == 'pickup') {
        order.type = '2'
      } else if ($state.params.order_type == 'eatin') {
        order.type = '3'
      } else if ($state.params.order_type == 'curbside') {
        order.type = '4'
      } else if ($state.params.order_type == 'driver_thru') {
        order.type = '5'
      } else {
        order.type = '1'
      }
    }
    if (NEW_FEATURES.MULTI_ADDRESS) {
      if (gAddress.hasAddress()) {
        if (!order.type) order.type = (DEFAULT_ORDER_TYPE == 'delivery' || !ADDONS.pickup) ? '1' : '2';
        if (ADDONS.web_template) {
          var curAddress = gAddress.getData();
          if (!gAddress.hasAddress() && $state.params.address != curAddress.location.lat + ',' + curAddress.location.lng) {
            change_direction = true;
            delete order.address;
            delete order.location;
          } else {
            order.position = curAddress.location;
            order.address = curAddress.address;
          }
        }
        gOrder.setData(order);
      }
    }
    $scope.orderType = order.type;
    $scope.curAddress = order.address;
    if (ADDONS.web_template) {
      if (gOrder.getData().address) $rootScope.pageTitle = gOrder.getData().address;
      else $rootScope.pageTitle = $scope.translate('SEARCH_RESULTS');
      function search(params) {
        // delete params.params;
        if (typeof PARAMS_SEARCH_CONTROLLER_BUSINESSES != 'undefined') {
          Object.assign(params, PARAMS_SEARCH_CONTROLLER_BUSINESSES);
        }
        if (NEW_FEATURES.NEW_BUSINESS_PAGINATION) {
          params.page = 1;
          params.page_size = 50;
        } else {
          params.limit = 50;
        }
        MyLoading.show($scope.translate('LOADING') + '...');
        console.log(params)
        Ordering.business.all(params, function (res) {
          $scope.totalBusiness = res.pagination.total;
          $scope.businessFound = res.pagination.total
          $scope.totalPages = res.pagination.total_pages;
          $scope.currentPage = res.pagination.current_page;
          $scope.loading = false;
          if (!res.error) {
            MyLoading.hide();
            if (res.result.length == 0) {
              if (NEW_FEATURES.MULTI_ADDRESS && gUser.isLogged()) {
                $scope.show_change_address = true;
              } else {
                return MyAlert.show($scope.translate(order.type == 1 ? 'FRONT_SORRY_DELIVERY_OPTION' : 'FRONT_SORRY_PICKUP_OPTION')).then(function (res) {
                  if (NEW_FEATURES.MULTI_ADDRESS && !gUser.isLogged()) {
                    $scope.onGoHome();
                    gAddress.setData(null);
                  } else {
                    $scope.onGoHome();
                  }
                });
              }
            }
            for (var i = 0; i < res.result.length; i++) {
              if (res.result[i].delivery_time) {
                res.result[i].delivery_time_min = parseInt(res.result[i].delivery_time.split(':')[0]) * 60 + parseInt(res.result[i].delivery_time.split(':')[1]);
              } else res.result[i].delivery_time_min = 9999;
              if (res.result[i].pickup_time) {
                res.result[i].pickup_time_min = parseInt(res.result[i].pickup_time.split(':')[0]) * 60 + parseInt(res.result[i].pickup_time.split(':')[1]);
              } else res.result[i].pickup_time_min = 9999;
            }
            $scope.businesses = res.result;
            gAllBusiness.setData(res.result);
            $scope.filteredBusiness = gAllBusiness.getData();
            if (NEW_FEATURES.MULTI_ADDRESS) {
              gAddress.onChange(function (address) {
                $scope.page.title = address.address;
                $state.go('main.search', { 'order_type': (gOrder.getData().type == 1) ? 'delivery' : 'pickup', 'address': address.location.lat + ',' + address.location.lng }, { location: 'replace' });
              });
            }
            Extensions.runAction('after_search_view', gAllBusiness.getData(), $scope);
            //	  params.limit = null;
            /*	  params.offset = 50;
                Ordering.business.all(params, function (res) {
                  for (var i = 0; i < res.result.length; i++) {
                    if (res.result[i].delivery_time) {
                      res.result[i].delivery_time_min = parseInt(res.result[i].delivery_time.split(':')[0])*60+parseInt(res.result[i].delivery_time.split(':')[1]);
                    } else res.result[i].delivery_time_min = 9999;
                    if (res.result[i].pickup_time) {
                      res.result[i].pickup_time_min = parseInt(res.result[i].pickup_time.split(':')[0])*60+parseInt(res.result[i].pickup_time.split(':')[1]);
                    } else res.result[i].pickup_time_min = 9999;
                  }
                  $scope.businesses = $scope.businesses.concat(res.result);
                  gAllBusiness.setData($scope.businesses);   */
            //  });
          }
        })
      }
      var searchType = 1;
      if ($state.params.order_type == 'pickup') {
        searchType = 2
      } else if ($state.params.order_type == 'eatin') {
        searchType = 3
      } else if ($state.params.order_type == 'curbside') {
        searchType = 4
      } else if ($state.params.order_type == 'driver_thru') {
        searchType = 5
      }
      if ($state.params.address && $state.params.address != '') {
        if ($state.params.address == order.address) {
          $scope.businesses = gAllBusiness.getData();
          $scope.filteredBusiness = gAllBusiness.getData();
        } else {
          MyLoading.show($scope.translate('LOADING') + '...');
          if (NEW_FEATURES.MULTI_ADDRESS && gAddress.hasAddress()) {
            if (change_direction) {
              Geolocation.locationByAddress($state.params.address, function (data) {
                MyLoading.hide();
                if (data) {
                  gAddress.setData({
                    address: data.address,
                    location: data.location
                  });
                  order.address = data.address;
                  order.position = data.location;
                  gOrder.setData(order);
                  $scope.curAddress = order.address;
                  $rootScope.pageTitle = order.address;
                  search({ type: searchType, location: order.position.lat + ',' + order.position.lng, params: 'name,slug,logo,header,location,description,food,alcohol,groceries,laundry,zones,delivery_price,minimum,schedule,featured,reviews,about,delivery_time,pickup_time,offers,metadata' });
                } else {
                  MyAlert.show($scope.translate('SHOPPING_FOURTH_ERROR_STREET')).then(function (res) {
                    $scope.onGoHome();
                  });
                }
              });
            } else {
              $scope.curAddress = gAddress.getData().address;
              $rootScope.pageTitle = gAddress.getData().address;
              search({ type: searchType, location: gAddress.getData().location.lat + ',' + gAddress.getData().location.lng, params: 'name,slug,logo,header,location,description,food,alcohol,groceries,laundry,zones,delivery_price,minimum,schedule,featured,reviews,about,delivery_time,pickup_time,offers,metadata' });
            }
          } else if ($state.params.address == order.address || (order.position && $state.params.address == order.position.lat + ',' + order.position.lng)) {
            search({ type: searchType, location: order.position.lat + ',' + order.position.lng, params: 'name,slug,logo,header,location,description,food,alcohol,groceries,laundry,zones,delivery_price,minimum,schedule,featured,reviews,about,delivery_time,pickup_time,offers,metadata' });
          } else {
            Geolocation.locationByAddress($state.params.address, function (data) {
              MyLoading.hide();
              if (data) {
                order.address = data.address;
                order.position = data.location;
                gOrder.setData(order);
                $scope.curAddress = order.address;
                if (NEW_FEATURES.MULTI_ADDRESS) {
                  gAddress.setData({
                    address: data.address,
                    location: data.location,
                    map_data: {
                      library: 'google',
                      place_id: data.place_id
                    }
                  }, true);
                }
                search({ type: searchType, location: order.position.lat + ',' + order.position.lng, params: 'name,slug,logo,header,location,description,food,alcohol,groceries,laundry,zones,delivery_price,minimum,schedule,featured,reviews,about,delivery_time,pickup_time,offers,metadata' });
              } else {
                MyAlert.show($scope.translate('SHOPPING_FOURTH_ERROR_STREET')).then(function (res) {
                  $scope.onGoHome();
                });
              }
            });
          }
        }
      } else if ($state.params.city && $state.params.city != '' && $state.params.neighborhood && $state.params.neighborhood != '') {
        var order = gOrder.getData();
        order.type = $state.params.order_type == 'delivery' ? 1 : 2,
          order.city = $state.params.city;
        order.dropdownoption = $state.params.neighborhood;
        gOrder.setData(order);
        search({ type: searchType, dropdownoption: $state.params.neighborhood, params: 'name,slug,logo,header,location,description,food,alcohol,groceries,laundry,zones,delivery_price,minimum,schedule,featured,reviews,about,delivery_time,pickup_time,offers,metadata' });
      } else {
        MyAlert.show($scope.translate('FRONT_SELECT_ADDRESS')).then(function (res) {
          $scope.onGoHome();
        });
        return;
      }
    } else {
      //if (NEW_FEATURES.MULTI_ADDRESS || true) {
      if (NEW_FEATURES.MULTI_ADDRESS) {
        $scope.page.title = gAddress.getData().address;
      } else {
        $scope.page.title = $scope.translate('SEARCH_RESULTS');
      }
      if ($scope.filters.orderby) {
        var add_order = gOrder.getData();
        add_order.orderby = $scope.filters.orderby;
        gOrder.setData(add_order);
      }
      $scope.loading = false;
      function refreshBusiness(callback) {
        $scope.searchBusinesses(gOrder.getData(), function (businesses) {
          $scope.filteredBusiness = businesses;
          if ($scope.businesses.length == 0) {
            gAllBusiness.setData(businesses);
            $scope.businesses = businesses;
            $scope.filteredBusiness = businesses;
            if (callback) callback();
          }
          var preorder_business = localStorageApp.getItem(STORE.PREORDER_BUSINESS);
          if (preorder_business) {
            for (var i = 0; i < $scope.businesses.length; i++) {
              if ($scope.businesses[i].id == preorder_business) {
                $scope.onBusiness($scope.businesses[i], true);
                localStorageApp.removeItem(STORE.PREORDER_BUSINESS);
                break;
              }
            }
          }
        });
      }
      refreshBusiness(function () {
        $scope.show_change_address = $scope.businesses.length == 0;
        Extensions.runAction('after_search_view', gAllBusiness.getData(), $scope);
        if (NEW_FEATURES.MULTI_ADDRESS) {
          gAddress.onChange(function (address) {
            $scope.page.title = address.address;
            $scope.businesses = [];
            var order = gOrder.getData();
            order.address = address.address;
            order.position = address.location;
            $scope.curAddress = order.address;
            gOrder.setData(order);
            $scope.data_search_scroll.location = [address.location.lat, address.location.lng].join(',')
            refreshBusiness(function () {
              $scope.show_change_address = $scope.businesses.length == 0;
              Extensions.runAction('after_search_view', gAllBusiness.getData(), $scope);
            });
          });
        }
      });
    }
    setTimeout(() => {
      console.log($scope.businesses)
      var multi_business = localStorage.getItem('multi_business');
      if (multi_business) {
        multi_business = JSON.parse(multi_business);
        for (let b = 0; b < $scope.businesses.length; b++) {
          for (let m = 0; m < multi_business.length; m++) {
            //multi_business[m].match = 0;
            if (multi_business[m].id == $scope.businesses[b].id) {
              multi_business[m].match = 1;
              console.log(multi_business[m])
            }
          }
        }
        for (let i = 0; i < multi_business.length; i++) {
          if (multi_business[i].match && multi_business[i].match == 1) {

          } else {
            delete multi_business[i];
          }
        }
        console.log(multi_business)
        for (let a = 0; a < multi_business.length; a++) {
          if (multi_business[a].match) {
            console.log(multi_business[a].match)
            delete multi_business[a].match;
          }

        }
        console.log(multi_business)
        setTimeout(() => {
          var filtered = multi_business.filter(function (el) {
            return el != null;
          });
          localStorage.setItem('multi_business', JSON.stringify(filtered));
        }, 200);
      }

    }, 8000);
  };
})
Extensions.add_action('enter_business_editor_view', function (user, scope) {
  var $scope = scope;
  MyAlert = scope.getNgDependency('MyAlert');
  MyLoading = scope.getNgDependency('MyLoading');
  Ordering = scope.getNgDependency('Ordering');
  $ionicHistory = scope.getNgDependency('$ionicHistory');
  $http = scope.getNgDependency('$http');
  var curTimeout = null
  $timeout = scope.getNgDependency('$timeout');
  MyModal = scope.getNgDependency('MyModal');
  gUser = scope.getNgDependency('gUser');
  $scope.businesstypes = [];

  $scope.changeBusinessTypes = function (subcats) {
    subcats.name = subcats.name.replace(/[^a-zA-Z0-9]/g, '');
    $scope.metafieldsid = '';
    var field_name = "extra_type_" + subcats.id;
    for (var i = 0; i < $scope.deal.metafields.length; i++) {
      if ($scope.deal.metafields[i].key == field_name) {
        $scope.metafieldsid = $scope.deal.metafields[i].id;
        break;
      }
    }
    MyLoading.toast($scope.translate('LOADING') + '...');
    Ordering.business.update({
      id: $scope.deal.id,
      extratypes: true,
      btypes_name: "extra_type_" + subcats.id,
      btypes_value: subcats.active,
      metafieldsid: $scope.metafieldsid
    }, function (res) {
      MyLoading.hide();
      if (!res.error) MyLoading.success($scope.translate('BUSINESS_TYPE_SAVED'), 1500);
      else MyAlert.show(res.message);
    });
  }
  $scope.changeBusinessPrtner = function (curProvider_2) {
    //console\.log(curProvider_2)
    MyLoading.toast($scope.translate('LOADING') + '...');
    Ordering.business.update({
      id: $scope.deal.id,
      partner_id: curProvider_2
    }, function (res) {
      MyLoading.hide();
      if (!res.error) MyLoading.success($scope.translate('BUSINESS_TYPE_SAVED'), 1500);
      else MyAlert.show(res.message);
    });

  }

})

Extensions.add_action('enter_businesses_editor_view', function (user, scope) {
  var $scope = scope;
  MyAlert = scope.getNgDependency('MyAlert');
  MyLoading = scope.getNgDependency('MyLoading');
  Ordering = scope.getNgDependency('Ordering');
  $ionicHistory = scope.getNgDependency('$ionicHistory');
  $http = scope.getNgDependency('$http');
  $rootScope = scope.getNgDependency('$rootScope');
  var curTimeout = null
  $timeout = scope.getNgDependency('$timeout');
  MyModal = scope.getNgDependency('MyModal');
  gUser = scope.getNgDependency('gUser');


  $scope.showCreateBusiness = function () {
    if ($scope.modalOpening) return;
    $scope.modalOpening = true;
    $scope.cities = [];
    MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/create-business.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (create_business) {
      modals.push(create_business);
      $scope.create_business = create_business;
      $scope.create_business.show();
      $scope.modalOpening = false;
      Ordering.countries.all({}, function (res) {
        if (!res.error) {
          for (var i = 0; i < res.result.length; i++) {
            $scope.cities = $scope.cities.concat(res.result[i].cities);
          }
        }
        else MyAlert.show(res.result);
      });


      $ionicHistory.clearCache().then(function () {

        $rootScope.allpartnertypes = [];
        MyLoading.show($scope.translate('LOADING') + '...');
        var url = CUSTOM_SERVER_URL + "save_partener_types.php";
        var data = {
          function: 'fetchAllPartnerType',
          lang_id: localStorageApp.getItem(STORE.LANG_CODE)
        };
        var config = {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        };

        $http.post(url, data, config).then(function (response) {
          $rootScope.allpartnertypes = response.data.result;
          $rootScope.curNumTablistPa = $rootScope.allpartnertypes.length;
          $rootScope.curNumTablist = $rootScope.allpartnertypes.length;
          MyLoading.hide();

        })

      })


      // mapCreateBusiness
      $timeout(function () {
        var position = { lat: 40.77473399999999, lng: -73.9653844 };
        if ($scope.curBusiness.location && $scope.curBusiness.location != 'null') {
          var b_location = $scope.getJson($scope.curBusiness.location);
          if (b_location != null) position = { lat: b_location.lat, lng: b_location.lng };
        }
        // if (!$scope.map) {
        $scope.map = new google.maps.Map(document.getElementById('create-business-map'), {
          center: position,
          zoom: 8,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: false
        });
        var input = document.getElementById('create-business-map-address');
        input.value = $scope.curBusiness.address;
        var options = {
          types: []
        };
        var marker = new google.maps.Marker({
          position: position,
          map: $scope.map,
          title: 'Address'
        });
        autocomplete = new google.maps.places.Autocomplete(input, options);
        autocomplete.setFields(['place_id', 'formatted_address', 'geometry']);
        autocomplete.addListener('place_changed', function () {
          var places = autocomplete.getPlace();
          $scope.map.panTo(places.geometry.location);
          marker.setPosition(places.geometry.location);
          $scope.map.setZoom(18);
          $scope.$apply(function () {
            $scope.curAddress = places.geometry.location;
            $scope.curBusiness.address = input.value;
            $scope.saveAddress();
          });
        });
        var timeout = null;
        $scope.map.addListener('center_changed', function () {
          if (timeout) clearTimeout(timeout);
          timeout = setTimeout(function () {
            marker.setPosition($scope.map.getCenter());
            $scope.$apply(function () {
              $scope.curAddress = $scope.map.getCenter();
              $scope.curBusiness.address = input.value;
              $scope.saveAddress();
            });
          }, 200);
        });
        // setTimeout(function () {
        // 	$(".pac-container").appendTo(".modal-backdrop");
        // }, 700);
        // }
      }, 150);
      $scope.saveAddress = function () {
        var position = {};
        if ($scope.curBusiness.location) {
          var position = $scope.curBusiness.location != 'null' ? $scope.curBusiness.location : {};
          if ($scope.curAddress) {
            position.lat = $scope.curAddress.lat();
            position.lng = $scope.curAddress.lng();
          }
        } else {
          position = {
            lat: 40.7127837,
            lng: -74.00594130000002,
            zipcode: -1,
            zoom: 15
          };
        }
        $.get('https://maps.googleapis.com/maps/api/timezone/json?location=' + position.lat + ',' + position.lng + '&timestamp=1331161200&key=' + GM_API_KEY, function (data) {
          $scope.curBusiness.timezone = data.timeZoneId;
          $scope.curBusiness.address = document.getElementById('create-business-map-address').value;
          $scope.curBusiness.location = position;
        });
      }
      //endmap
      create_business.scope.hide = function () {
        $scope.create_business.hide();
        $scope.create_business.remove();
      }
      create_business.scope.add = function () {
        $scope.curBusiness.owner_id = gUser.getData().id;
        $scope.curBusiness.location = JSON.stringify($scope.curBusiness.location);

        $scope.curBusiness.partner_id = $scope.curBusiness.partner_id;

        MyLoading.show($scope.translate('LOADING') + '...');
        Ordering.business.add($scope.curBusiness, function (res) {
          MyLoading.hide();
          if (!res.error) {
            var business = res.result;
            MyLoading.show($scope.translate('LOADING') + '...');
            Ordering.paymethods.all({}, function (res) {
              if (!res.error) {
                for (var i = 0; i < res.result.length; i++) {
                  if (res.result[i].gateway == 'cash') {
                    Ordering.paymethod_credentials.add({
                      business_id: business.id,
                      paymethod_id: res.result[i].id,
                      sandbox: true,
                      enabled: true
                    }, function (res) {
                      MyLoading.hide();
                      $state.go('main.business-editor', { slug: $scope.curBusiness.slug });
                    });
                    break;
                  }
                }
              } else $state.go('main.business-editor', { slug: $scope.curBusiness.slug });
            });
          } else MyAlert.show(res.result);
        });
      }
    });
  }
})

Extensions.add_action('enter_general_editor_view', function (data, scope) {

  var $scope = scope;
  $scope.multiBussStripeSettings = function () {
    $scope.curForm = {
      title: $scope.translate('PAYMENTS_SETTINGS') + ' (' + $scope.translate('STRIPE_DIRECT') + ')',
      fields: [
        {
          label: $scope.translate('SANDBOX'),
          type: 'select',
          options: [
            {
              value: '1',
              text: $scope.translate('YES')
            },
            {
              value: '0',
              text: $scope.translate('NO')
            }
          ],
          name: 'mstripe_sandbox',
          value: !$scope.isUndefined($scope.configs.mstripe_sandbox) ? $scope.configs.mstripe_sandbox.value : '',
          config: $scope.configs.mstripe_sandbox
        },
        {
          label: $scope.translate('PUBLISHABLE_KEY'),
          type: 'text',
          name: 'mstripe_publishable',
          value: !$scope.isUndefined($scope.configs.mstripe_publishable) ? $scope.configs.mstripe_publishable.value : '',
          config: $scope.configs.mstripe_publishable
        },
        {
          label: $scope.translate('API_SECRET'),
          type: 'text',
          name: 'mstripe_secret',
          value: !$scope.isUndefined($scope.configs.mstripe_secret) ? $scope.configs.mstripe_secret.value : '',
          config: $scope.configs.mstripe_secret
        },
        {
          label: $scope.translate('PUBLISHABLE_KEY') + ' (' + $scope.translate('SANDBOX') + ')',
          type: 'text',
          name: 'mstripe_publishable_sandbox',
          value: !$scope.isUndefined($scope.configs.mstripe_publishable_sandbox) ? $scope.configs.mstripe_publishable_sandbox.value : '',
          config: $scope.configs.mstripe_publishable_sandbox
        },
        {
          label: $scope.translate('API_SECRET') + ' (' + $scope.translate('SANDBOX') + ')',
          type: 'text',
          name: 'mstripe_secret_sandbox',
          value: !$scope.isUndefined($scope.configs.mstripe_secret_sandbox) ? $scope.configs.mstripe_secret_sandbox.value : '',
          config: $scope.configs.mstripe_secret_sandbox
        },
      ]
    };
    $scope.showIntegration();


  }

})

Extensions.add_action('enter_confirm_view', function (user, $scope) {
  $rootScope = $scope.getNgDependency('$rootScope');
  $http = $scope.getNgDependency('$http');
  gOrder = $scope.getNgDependency('gOrder');
  Analytics = $scope.getNgDependency('Analytics');
  Ordering = $scope.getNgDependency('Ordering');
  gUser = $scope.getNgDependency('gUser');
  gmultiBusiness = $scope.getNgDependency('gmultiBusiness');
  gCreateOrderBuyer = $scope.getNgDependency('gCreateOrderBuyer');
  gConfirm = $scope.getNgDependency('gConfirm');
  gAllBusiness = $scope.getNgDependency('gAllBusiness');
  gBusiness = $scope.getNgDependency('gBusiness');
  gCart = $scope.getNgDependency('gCart');
  gPreorder = $scope.getNgDependency('gPreorder');
  gmultiConfirm = $scope.getNgDependency('gmultiConfirm');
  $state = $scope.getNgDependency('$state');
  if (ADDONS.use_segment) {
    var segment = $rootScope.getNgDependency('segment')
  }

  //console\.log($rootScope.orderConfirmData);
  if (typeof ($rootScope.orderConfirmData) == 'undefined') {
    $state.go(app_states.homeScreen);
  }


})
Extensions.add_action('enter_checkout_view', function (user, $scope) {
  $rootScope = $scope.getNgDependency('$rootScope');
  $http = $scope.getNgDependency('$http');
  gOrder = $scope.getNgDependency('gOrder');
  Analytics = $scope.getNgDependency('Analytics');
  Ordering = $scope.getNgDependency('Ordering');
  gUser = $scope.getNgDependency('gUser');
  gmultiBusiness = $scope.getNgDependency('gmultiBusiness');
  gCreateOrderBuyer = $scope.getNgDependency('gCreateOrderBuyer');
  gConfirm = $scope.getNgDependency('gConfirm');
  gAllBusiness = $scope.getNgDependency('gAllBusiness');
  gBusiness = $scope.getNgDependency('gBusiness');
  gCart = $scope.getNgDependency('gCart');
  gPreorder = $scope.getNgDependency('gPreorder');
  gmultiConfirm = $scope.getNgDependency('gmultiConfirm');
  $state = $scope.getNgDependency('$state');
  if (ADDONS.use_segment) {
    var segment = $rootScope.getNgDependency('segment')
  }
  if (!$scope.mcartdata1) {
    $scope.mcartdata1 = gmultiBusiness.getData();
    //console\.log('not found')
  }

  $scope.backEditOrder = function (slug) {
    if (slug) {
      var business = gBusiness.getData();
      $state.go('main.business', { business: slug });
    } else {
      var business = gBusiness.getData();
      $state.go('main.business', { business: business.slug });
    }

  }

  $scope.emptyCart = 0;
  setTimeout(() => {
    $scope.partnerExt = 0;
    console.log('partnerExt = '+$scope.partnerExt);
    for (var n = 0; n < $scope.mcartdata1.length; n++){
      console.log($scope.mcartdata1[n])
      if($scope.mcartdata1[n].partner_id){
        $scope.partnerExt = 1;
      }
    }
    console.log('partnerExt = '+$scope.partnerExt);
  }, 1000);

  $scope.refreshCartData = function () {

    var customsubtotal = 0
    var quantity = 0;
    $scope.allTotal = 0;
    /*
          //console\.log('cc = '+$rootScope.cartval)
          //console\.log(JSON.stringify($scope.mcartdata1))*/
    $scope.sumdelvPartner = [];
    $scope.checkPartner = [];
    $scope.checkPartnerDetails = [];
    console.log($scope.mcartdata1)
    //return;	
    for (var j = 0; j < $scope.mcartdata1.length; j++) {
      if ($scope.mcartdata1[j].cartdata) {
        $scope.emptyCart += $scope.mcartdata1[j].cartdata.length;
      }

      let delv = -1;
      if ($scope.mcartdata1[j].partner_id) {
        let samePartnrCode = $scope.generateRandom(4) + '' + $scope.mcartdata1[j].id;
        let partner_id = $scope.mcartdata1[j].partner_id;

        for (let p = 0; p < $scope.mcartdata1[j].partners.length; p++) {
          if ($scope.mcartdata1[j].partners[p].id == partner_id) {
            if ($scope.mcartdata1[j].partners[p].enabled) {

              if ($scope.checkPartner.indexOf($scope.mcartdata1[j].partner_id) == -1) {
                $scope.mcartdata1[j].samePartnrCode = samePartnrCode;
                delv = Number($scope.mcartdata1[j].partners[p].delivery_fee);
                //	$scope.checkPartner.push(delv);
                $scope.checkPartner.push($scope.mcartdata1[j].partner_id);
                $scope.sumdelvPartner.push(delv);
                $scope.checkPartnerDetails.push({ id: $scope.mcartdata1[j].partner_id, code: samePartnrCode })
              } else {
                var inde_x = $scope.checkPartner.indexOf($scope.mcartdata1[j].partner_id);
                $scope.mcartdata1[j].samePartnrCode = $scope.checkPartnerDetails[inde_x].code;
                delv = 0;
              }
            }
          }

        }
      }



      if (delv != -1) {
        $scope.mcartdata1[j].delivery_price = delv;
      }

      $scope.cart_data = {};
      var subtotal = 0;
      var tax_new = 0
      var service_feenew = 0
      let tex = 0;
      let driver_tip = 0;
      //var subtotal = 0;
      //var quantity = 0;
      if ($scope.mcartdata1[j].cartdata) {
        for (var i = 0; i < $scope.mcartdata1[j].cartdata.length; i++) {
          subtotal += $scope.mcartdata1[j].cartdata[i].total;
          customsubtotal += $scope.mcartdata1[j].cartdata[i].total;
          quantity += $scope.mcartdata1[j].cartdata[i].quantity;
          tex += $scope.mcartdata1[j].tax_price;
        }
      }
      $scope.cart_data.total = 0;
      $scope.cart_data.subtotal = subtotal;
      //	$scope.cart_data.quantity = quantity;
      $scope.cart_data.tax = tex;
      $scope.cart_data.driver_tip = 0;


      if ($scope.mcartdata1[j].tax_type == 2)
        tax_new += subtotal * $scope.mcartdata1[j].tax / 100;
      else
        tax_new = 0

      service_feenew += subtotal * $scope.mcartdata1[j].service_fee / 100;
      $scope.mcartdata1[j].service_fee_price = service_feenew
      $scope.mcartdata1[j].tax_price = tax_new
      $scope.mcartdata1[j].service_fee_price = service_feenew
      $scope.mcartdata1[j].quantity = quantity;
      //$scope.mcartdata1[j].driver_tip = subtotal * $scope.mcartdata1[j].tax / 100;
      $scope.mcartdata1[j].subtotal = subtotal


      //$scope.mcartdata1[j].delivery_price1 =  $scope.mcartdata1[j].delivery_price;
      if ($scope.order.type == 1) $scope.cart_data.total += $scope.mcartdata1[j].delivery_price;
      //if ($scope.order.type == 1) $scope.cart_data.total += $scope.mcartdata1[j].deliveryfee

      if (ADDONS.discount_offer) {
        var offer = null;
        //console\.log($scope.mcartdata1)
        for (var i = 0; i < $scope.mcartdata1[j].offers.length; i++) {
          if ($scope.mcartdata1[j].offers[i].type == 1 && $scope.mcartdata1[j].offers[i].minimum <= $scope.cart_data.subtotal) {
            var aux = $scope.mcartdata1[j].offers[i].rate_type == 1 ? $scope.cart_data.subtotal * $scope.mcartdata1[j].offers[i].rate / 100 : $scope.mcartdata1[j].offers[i].rate;
            var last = 0;
            if (offer != null) last = offer.rate_type == 1 ? $scope.cart_data.subtotal * offer.rate / 100 : offer.rate;
            if (aux < $scope.cart_data.subtotal && last < aux) {
              offer = $scope.mcartdata1[j].offers[i];
            }
          }
        }

        if (offer) {
          $scope.cart_data.discount = offer.rate_type == 1 ? $scope.cart_data.subtotal * offer.rate / 100 : offer.rate;
          $scope.cart_data.offer = offer;
          $scope.mcartdata1[j].offer = offer;
          $scope.mcartdata1[j].discount = offer.rate_type == 1 ? $scope.mcartdata1[j].subtotal * offer.rate / 100 : offer.rate;
        } else {
          $scope.mcartdata1[j].discount = $scope.mcartdata1[j].discount ? $scope.mcartdata1[j].discount : 0;
          $scope.mcartdata1[j].offer = $scope.mcartdata1[j].offer ? $scope.mcartdata1[j].offer : offer;
        }
      } else {
        $scope.cart_data.discount = 0;
        $scope.mcartdata1[j].offer = offer;
      }
      /******************* */
      if ($scope.mcartdata1[j].tax_type == 2){
        console.log(subtotal);
        console.log($scope.mcartdata1[j].discount);
        if ($scope.mcartdata1[j].discount) {
          subtotal -= $scope.mcartdata1[j].discount;
        }
        console.log(subtotal);
        tax_new  = subtotal * $scope.mcartdata1[j].tax / 100;
        console.log(tax_new)
        $scope.mcartdata1[j].tax_price = tax_new;
      }else{
        tax_new = 0;
        $scope.mcartdata1[j].tax_price = tax_new;
      }
      /******************* */

      //$scope.cart_data.driver_tip = ($scope.order.type == 1) ? $rootScope.Order.roundPrice((subtotal-$scope.cart_data.discount)*$scope.order.driver_tip/100) : 0;
      // if(j==0){
      if ($scope.order.driver_tip != -1) {
        $scope.order.driver_tip_amount = '';
        $scope.mcartdata1[j].driver_tip = ($scope.order.type == 1) ? $rootScope.Order.roundPrice((subtotal) * $scope.order.driver_tip / 100) : 0;
      }
      else {
        $scope.mcartdata1[j].driver_tip = 0;
      }
      // }else{
      //   $scope.mcartdata1[j].driver_tip = 0;
      // }


      $scope.cart_data.total = $scope.cart_data.total + subtotal + tax_new + service_feenew + $scope.mcartdata1[j].driver_tip;
      $scope.mcartdata1[j].totalPrice = $scope.cart_data.total
      $scope.allTotal = $scope.allTotal + $scope.cart_data.total
      //$scope.mcartdata1[j].total -= $scope.mcartdata1[j].discount;
      //$scope.mcartdata1[j].totalPrice -= $scope.mcartdata1[j].discount;
      //$scope.allTotal -= $scope.mcartdata1[j].discount;
      $rootScope.numCart = $scope.emptyCart;
      gmultiBusiness.setData($scope.mcartdata1);

      console.log($rootScope.numCart)
      $scope.refreshNumCart();

    }

    if ($scope.order.driver_tip == -1 && $scope.order.driver_tip_amount) {
      // add driver tip in total for other option.
      $scope.allTotal = $scope.allTotal + $rootScope.Order.roundPrice(($scope.order.driver_tip_amount));
    }
    $scope.sumTip = $scope.order.driver_tip != -1 ? $scope.mcartdata1.map(p => p.driver_tip).reduce(function (a, b) { return a + b; }, 0) : $scope.order.driver_tip_amount ? $scope.order.driver_tip_amount : 0;

    $scope.sumDelv = $scope.sumdelvPartner.reduce(function (a, b) {
      ////console\.log(a+', '+ b)
      return a + b;
    }, 0);
    $scope.sumDelv2 = $scope.checkPartner.reduce(function (a, b) {
      ////console\.log(a+', '+ b)
      return a + b;
    }, 0);
    //console\.log($scope.mcartdata1);

    setTimeout(function () {

      ////console\.log("aa"+JSON.stringify(scope.businessDishCart))
      //console\.log('set 1');
      //gmultiBusiness.setData($scope.mcartdata1);
    }, 1000)



  }
  /**************************** */
  gAddress = $scope.getNgDependency('gAddress');
  MyAlert = $scope.getNgDependency('MyAlert');

  $rootScope.loopCount = 0;
  $rootScope.orderConfirmData = [];

  /*********************************** */
 $scope.onPlaceOrg = function () {
    if ($scope.placing) return;
    $scope.placing = true;
    var secure_id = localStorageApp.getItem('order_code');
    if (secure_id) {
      MyLoading.show($scope.translate('LOADING', 'Loading') + '...');
      var where = [{
        attribute: 'metafield',
        conditions: [{
          attribute: 'code',
          value: secure_id
        }]
      }]
      Ordering.orders.all({
        where: where,
        limit: 1
      }, function (res) {
        MyLoading.hide();
        if (!res.error) {
          if (res.result.length === 0) {
            $scope.onPlaceAfterCode();
          } else {
            try {
              res.result[0].business.header = gBusiness.getData().header;
            } catch (err) {}
            $scope.goToConfirm(res.result[0]);
          }
        } else {
          $scope.onPlaceAfterCode();
        }
      });
    } else {
      $scope.onPlaceAfterCode();
    }
  }
  $scope.onPlaceAfterCode = function () {
    $scope.errors.email.message = null;
    $scope.errors.mobile_phone.message = null;
    if (ADDONS.preorder && ($scope.wopreorder.date == '' && $scope.preorder.date == '') && !$scope.checkASAP) {
      MyAlert.show($scope.translate('PREORDER_STEP_2_DATE'));
      $scope.placing = false;
      return;
    }
    if (ADDONS.preorder && ($scope.wopreorder.time == '' && $scope.preorder.time == '') && !$scope.checkASAP) {
      MyAlert.show($scope.translate('PREORDER_STEP_2_TIME'));
      $scope.placing = false;
      return;
    }
    if ($scope.gateway == 'cash') {
      if ($scope.order.cash != '') {
        if ($scope.order.cash < $scope.cart_data.total) {
          if(ADDONS.web_template) MyLoading.toast($scope.translate('AMOUNT_MUST_BIGGER_TOTAL'), 2000);
          else MyAlert.show($scope.translate('AMOUNT_MUST_BIGGER_TOTAL'));
          $scope.placing = false;
          return;
        }
        if ($scope.order.cash > parseInt($scope.order.cash)) {
          if(ADDONS.web_template) MyLoading.toast($scope.translate('AMOUNT_MUST_INTEGER'), 2000);
          else MyAlert.show($scope.translate('AMOUNT_MUST_INTEGER'));
          $scope.placing = false;
          return;
        }
      }
    }
    if (NEW_FEATURES.MULTI_ADDRESS && !gUser.isLogged() && $scope.addressfields.address_notes.required && (!$scope.curAddress.address_notes || $scope.curAddress.address_notes == '')) {
      $scope.errors.address_notes.status = true;
    }
    if (NEW_FEATURES.MULTI_ADDRESS && !gUser.isLogged() && $scope.addressfields.internal_number.required && (!$scope.curAddress.internal_number || $scope.curAddress.internal_number == '')) {
      $scope.errors.internal_number.status = true;
    }
    if (!$scope.buyer.name && $scope.checkoutfields.name && $scope.checkoutfields.name.required && $scope.checkoutfields.name.enabled) {
      $scope.errors.name.status = true;
    }
    if (!$scope.buyer.lastname && $scope.checkoutfields.lastname.required && $scope.checkoutfields.lastname.enabled) {
      $scope.errors.lastname.status = true;
    }
    if (!$scope.buyer.second_lastname && $scope.checkoutfields.second_lastname.required && $scope.checkoutfields.second_lastname.enabled) {
      $scope.errors.second_lastname.status = true;
    }
    var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    if ((!$scope.buyer.email && $scope.checkoutfields.email && $scope.checkoutfields.email.required && $scope.checkoutfields.email.enabled) || !re.test($scope.buyer.email)) {
      $scope.errors.email.status = true;
      $scope.errors.email.message = $scope.translate('EMAIL_INVALID');
    }
    if (!$scope.buyer.city_id && $scope.checkoutfields.city_dropdown_option && $scope.checkoutfields.city_dropdown_option.required && $scope.checkoutfields.city_dropdown_option.enabled && !NEW_FEATURES.MULTI_ADDRESS) {
      $scope.errors.city.status = true;
    }
    if (!$scope.buyer.dropdown_option_id && $scope.checkoutfields.city_dropdown_option && $scope.checkoutfields.city_dropdown_option.required && $scope.checkoutfields.city_dropdown_option.enabled && !NEW_FEATURES.MULTI_ADDRESS) {
      $scope.errors.dropdown_option.status = true;
    }
    if (!$scope.buyer.address && $scope.checkoutfields.address && $scope.checkoutfields.address.required && $scope.checkoutfields.address.enabled && !NEW_FEATURES.MULTI_ADDRESS) {
      $scope.errors.address.status = true;
    }
    if (!$scope.buyer.zipcode&& $scope.checkoutfields.zipcode && $scope.checkoutfields.zipcode.required && $scope.checkoutfields.zipcode.enabled && !NEW_FEATURES.MULTI_ADDRESS) {
      $scope.errors.zipcode.status = true;
    }
    if (!$scope.buyer.cellphone && $scope.checkoutfields.mobile_phone && $scope.checkoutfields.mobile_phone.required && $scope.checkoutfields.mobile_phone.enabled) {
      $scope.errors.mobile_phone.status = true;
    }
    if ($scope.buyer.cellphone && $scope.buyer.cellphone.length < 8) {
      $scope.errors.mobile_phone.status = true;
      $scope.errors.mobile_phone.message = $scope.translate('CELLPHONE_FORMAT_ERROR');
    }
    if (((!$scope.buyer.address_notes && !NEW_FEATURES.MULTI_ADDRESS)||(NEW_FEATURES.MULTI_ADDRESS && (!$scope.curAddress.address_notes || $scope.curAddress.address_notes == '')))&& $scope.checkoutfields.address_notes && $scope.checkoutfields.address_notes.required && $scope.checkoutfields.address_notes.enabled) {
      $scope.errors.address_notes.status = true;
    }
    if (!$scope.order.offer && $scope.checkoutfields.coupon && $scope.checkoutfields.coupon.required && $scope.checkoutfields.coupon.enabled) {
      $scope.errors.coupon.status = true;
    }
    if (!$scope.order.paymethod) {
      $scope.errors.paymethod.status = true;
    }
    for (var key in $scope.errors) {
      if ($scope.errors[key].status) {
        if(key =='coupon' && !$scope.checkoutfields.coupon.required) continue;
        Extensions.runAction('checkout_form_errors', $scope.errors, $scope);
        $scope.placing = false;
        return;
      }
    }
    if ($scope.order.driver_tip == 0 && $scope.checkoutfields.driver_tip && $scope.checkoutfields.driver_tip.required && $scope.checkoutfields.driver_tip.enabled && $scope.order.type == 1) {
      MyAlert.show($scope.translate('DRIVER_TIP_REQUIRED'));
      $scope.placing = false;
      return;
    }
    var order = gOrder.getData();
    var params = {
      id_or_slug: $scope.business.id,
      type: order.type
    };
    if (NEW_FEATURES.MULTI_ADDRESS && !localStorageApp.getItem(STORE.CREATE_ORDER)) {
      var address = gAddress.getData();
      if (address == "null" || address == null) 
        params.location = order.position.lat+','+order.position.lng;
      else
        params.location = address.location.lat+','+address.location.lng
    } else {
      if (gPreorder.getData().menu_id) params.menu_id = gPreorder.getData().menu_id;
      if (order.dropdownoption && order.dropdownoption != '') {
        params.dropdownoption = order.dropdownoption;
      } else if (order.address && order.address != '') {
        params.location = order.position.lat+','+order.position.lng;
      }
    }
    MyLoading.show($scope.translate('LOADING')+'...');
    Ordering.business.get(params, function (res) {
      MyLoading.hide();
      if (!res.result) return;
      if (res.result && !res.result.open && $scope.checkASAP) {
        MyAlert.show($scope.translate('CLOSEDRESTAURANTS'));
        $scope.placing = false;
        return;
      }
      if (order.type == 1 && $scope.business.delivery_price != res.result.delivery_price) {
        $scope.placing = false;
        return MyAlert.show($scope.translate('DELIVERY_PRICE_CHANGED'))
      }
      var cart = gCart.getData();
      var products_id = cart.map(function (product) { return product.id });
      var validation_data = {
        id: res.result.id,
        type: order.type,
        products: JSON.stringify(products_id),
        params: 'name,price,suboptions'
      }
      if ($scope.order.delivery_datetime && gPreorder.getData().menu_id) {
        validation_data.menu_id = gPreorder.getData().menu_id;
      } else if ($scope.order.delivery_datetime) {
        validation_data.timestamp = moment($scope.order.delivery_datetime, "MM-DD-YYYY HH:mm").unix();
      }
      Ordering.business.validate_cart(validation_data, function (res) {
        if (!res.error) {
          if (!res.result.valid) {
            if (res.result.non_existent_products.length > 0) {
              var new_cart = [];
              for (var i = 0; i < $scope.cart.length; i++) {
                var product_cart = $scope.cart[i];
                if (res.result.non_existent_products.indexOf(product_cart.id) == -1) {
                  new_cart.push(product_cart);
                }
              }
              gCart.setData(new_cart);
              $scope.cart = new_cart;
              $scope.refreshCartData();
              $scope.placing = false;
              return MyAlert.show($scope.translate('PRODUCTS_NO_LONGER_EXIST_REMOVED'));
            }
  
            if (res.result.invalid_products.length > 0) {
              var product_str = '';
              res.result.invalid_products.forEach(function (product) {
                if (product_str != '') product_str += ', ';
                product_str += product.name
              });
              var invalid_products = res.result.invalid_products.map(function (product) {
                return product.id;
              });
              var new_cart = [];
              for (var i = 0; i < $scope.cart.length; i++) {
                var product_cart = $scope.cart[i];
                if (invalid_products.indexOf(product_cart.id) == -1) {
                  new_cart.push(product_cart);
                }
              }
              gCart.setData(new_cart);
              $scope.cart = new_cart;
              $scope.refreshCartData();
              $scope.placing = false;
              return MyAlert.show($scope.translate('ERROR_THIS_PRODUCTS_INVALID').replace('_products_', product_str));
            }
          }
  
          var new_cart = gCart.getData();
          for (var i = 0; i < new_cart.length; i++) {
            var product_cart = new_cart[i];
            for (var j = 0; j < res.result.valid_products.length; j++) {
              var product = res.result.valid_products[j];
              if (product_cart.id == product.id) {
                var total = product.price;
                var suboptions = [];
                if (product.extras) {
                  suboptions = product.extras.reduce(function (previous, current) {
                    var _suboptions = [];
                    for (var k = 0; k < current.options.length; k++) {
                      var option = current.options[k];
                      for (var l = 0; l < option.suboptions.length; l++) {
                        var suboption = option.suboptions[l];
                        _suboptions.push(suboption);
                      }
                    }
                    return previous.concat(_suboptions);
                  }, []);
                }
                for (var k = 0; k < product_cart.options.length; k++) {
                  var option = product_cart.options[k];
                  for (var l = 0; l < option.suboptions.length; l++) {
                    var suboption = option.suboptions[l];
                    for (var m = 0; m < suboptions.length; m++) {
                      var _suboption = suboptions[m];
                      if (suboption.id == _suboption.id) {
                        suboption.price = _suboption.price;
                        total += suboption.price;
                      }
                    }
                  }
                }
                for (var k = 0; k < product_cart.extended_options.length; k++) {
                  var option = product_cart.extended_options[k];
                  for (var l = 0; l < option.suboptions.length; l++) {
                    var suboption = option.suboptions[l];
                    for (var m = 0; m < suboptions.length; m++) {
                      var _suboption = suboptions[m];
                      if (suboption.id == _suboption.id) {
                        var price_suboption = _suboption.price;
                        if (suboption.position != 'whole') {
                          price_suboption = _suboption.half_price;
                        }
                        suboption.price = _suboption.price;
                        suboption.half_price = _suboption.half_price;
                        total += price_suboption*suboption.quantity;
                      }
                    }
                  }
                }
                total *= product_cart.quantity;
                product_cart.total = total;
              }
            }
          }
          gCart.setData(new_cart);
          $scope.cart = new_cart;
          $scope.refreshCartData();
          var truncated_description = $scope.parseOrderData($scope.cart, $scope.cart_data, $scope.business, $scope.order)
          if(truncated_description.length > 1000) truncated_description = truncated_description.slice(0, 997) + '...'
          if ($scope.order.paymethod.gateway == 'authorize') {
            if ($scope.card_data) {
              $scope.pay({
                number: $scope.card_data.number,
                cvc: $scope.card_data.cvc,
                exp_year: $scope.card_data.year,
                exp_month: $scope.card_data.month,
                email: $scope.buyer.email,
                customer: JSON.stringify($scope.buyer),
                user_id: $scope.buyer.id,
                amount: $scope.cart_data.total,
                gateway: $scope.order.paymethod.gateway,
                currency: STRIPE_CURRENCY,
                description: truncated_description
              }, function (pay_data) {
                $scope.order.pay_data = pay_data;
                $scope.place();
              });
            } else {
              MyAlert.show($scope.translate('CARD_DATA_OR_SELECT_OTHER_METHOD'));
              $scope.placing = false;
            }
          } else if ($scope.order.paymethod.gateway == 'stripe' || $scope.order.paymethod.gateway == 'stripe_connect' || $scope.order.paymethod.gateway == 'stripe_redirect' || $scope.order.paymethod.gateway == 'stripe_direct') {
            if ($scope.stripe_token) {
              $scope.pay({
                source_id: $scope.stripe_token,
                customer: JSON.stringify($scope.buyer),
                user_id: $scope.buyer.id==-1?null:$scope.buyer.id,
                amount: $scope.cart_data.total,
                subtotal: $scope.cart_data.subtotal - $scope.cart_data.discount + ($scope.business.tax_type === 1 ? $scope.cart_data.tax : 0),
                gateway: $scope.order.paymethod.gateway,
                currency: STRIPE_CURRENCY,
                description: truncated_description
              }, function (pay_data) {
                $scope.order.pay_data = pay_data;
                $scope.placeOrg();
              });
            } else {
              MyAlert.show($scope.translate('CARD_DATA_OR_SELECT_OTHER_METHOD'));
              $scope.placing = false;
            }
          } else if ($scope.order.paymethod.gateway == 'paypal_express') {
            $scope.initPaypal();
          } else {
            $scope.placeOrg();
          }
        } else {
          MyAlert.show(res.result);
        }
      });
    });
  }
  $scope.placeOrg = function () {
    var code = $scope.generateRandom(30);
    localStorageApp.setItem('order_code', code);
    var delivery_datetime = null;
    if ($scope.order.delivery_datetime) {
      var date_parts = $scope.order.delivery_datetime.split(' ')[0].split('-');
      var time_parts = $scope.order.delivery_datetime.split(' ')[1].split(':');
      var date = new Date(date_parts[2], date_parts[0]-1, date_parts[1], time_parts[0], time_parts[1]);
      delivery_datetime = date.getFullYear()+'-'+(date.getMonth()+1<10?'0':'')+(date.getMonth()+1)+'-'+(date.getDate()<10?'0':'')+date.getDate()+' '+(date.getHours()<10?'0':'')+date.getHours()+':'+(date.getMinutes()<10?'0':'')+date.getMinutes()+':00';
    }
    if (!ADDONS.preorder) delivery_datetime = null;
    var order = {
      paymethod_id: $scope.order.paymethod.id,
      business_id: $scope.business.id,
      delivery_type: $scope.order.type,
      driver_tip: $scope.order.driver_tip,
      pay_data: $scope.order.pay_data,
      delivery_zone_id: $scope.business.delivery_zone,
      delivery_datetime: delivery_datetime,
      location: gOrder.getData().position,
      cash: $scope.order.cash,
      code: code
      //offer_id: ,
      /*location:,*/
    };
    if (NEW_FEATURES.MULTI_ADDRESS) {
      order.location = $scope.curAddress.location;
    }
    if ($scope.order.offer) order.offer_id = $scope.order.offer.id;
    order.products = [];
    for (var i = 0; i < $scope.cart.length; i++) {
      var product = {
        id: $scope.cart[i].id,
        code: $scope.cart[i].code,
        quantity: $scope.cart[i].quantity,
        options: [],
        ingredients: [],
        comment: $scope.cart[i].comment
      };
      for (var j = 0; j < $scope.cart[i].options.length; j++) {
        var option = {
          id: $scope.cart[i].options[j].id,
          suboptions: []
        };
        for (var k = 0; k < $scope.cart[i].options[j].suboptions.length; k++) {
          option.suboptions.push($scope.cart[i].options[j].suboptions[k].id);
        }
        product.options.push(option);
      }
      for (var j = 0; j < $scope.cart[i].extended_options.length; j++) {
        var option = {
          id: $scope.cart[i].extended_options[j].id,
          suboptions: []
        };
        for (var k = 0; k < $scope.cart[i].extended_options[j].suboptions.length; k++) {
          option.suboptions.push({
            id: $scope.cart[i].extended_options[j].suboptions[k].id,
            position: $scope.cart[i].extended_options[j].suboptions[k].position,
            quantity: $scope.cart[i].extended_options[j].suboptions[k].quantity
          });
        }
        product.options.push(option);
      }
      for (var j = 0; j < $scope.cart[i].ingredients.length; j++) {
        if (!$scope.cart[i].ingredients[j].selected) product.ingredients.push($scope.cart[i].ingredients[j].id);
      }
      Analytics.addProduct($scope.cart[i].id, $scope.cart[i].name, '', '', '', $scope.cart[i].total/$scope.cart[i].quantity, $scope.cart[i].quantity, '', i);
      order.products.push(product);
    }
    order.products = JSON.stringify(order.products);
    if ($scope.buyer.id > 0 && !localStorageApp.getItem(STORE.CREATE_ORDER)) {
      order.customer_id = $scope.buyer.id;
      var user_update = {
        id: $scope.buyer.id,
        name: $scope.buyer.name,
        middle_name: $scope.buyer.middle_name,
        lastname: $scope.buyer.lastname,
        second_lastname: $scope.buyer.second_lastname,
        // email: $scope.buyer.email,
        cellphone: $scope.buyer.cellphone,
        address: $scope.buyer.address,
        address_notes: $scope.buyer.address_notes,
        dropdown_option_id: $scope.buyer.dropdown_option_id*1,
        location: JSON.stringify(gOrder.getData().position),
        zipcode: $scope.buyer.zipcode,
      };
      if (NEW_FEATURES.MULTI_ADDRESS) {
        user_update = {
          id: $scope.buyer.id,
          name: $scope.buyer.name,
          middle_name: $scope.buyer.middle_name,
          lastname: $scope.buyer.lastname,
          second_lastname: $scope.buyer.second_lastname,
          address: $scope.buyer.address,
          address_notes: $scope.buyer.address_notes,
          zipcode: $scope.buyer.zipcode,
          location: JSON.stringify(gOrder.getData().position),
          // email: $scope.buyer.email,
          cellphone: $scope.buyer.cellphone,
        };
      }
      Ordering.users.update(user_update, function (res) {
        if (!res.error) {
          gUser.setData(res.result);
          $scope.buyer = res.result;
          if ($scope.buyer.dropdown_option) {
            $scope.buyer.city_id = $scope.buyer.dropdown_option.city.id+'';
            $scope.buyer.dropdown_option_id = $scope.buyer.dropdown_option.id+'';
          }
        }// else $scope.placing = false;
      });
    }
    $scope.buyer.location = JSON.stringify(gOrder.getData().position);
    var buyer = $scope.buyer;
    if (NEW_FEATURES.MULTI_ADDRESS) {
      buyer = {
        id: buyer.id,
        name: buyer.name,
        middle_name: $scope.buyer.middle_name,
        lastname: buyer.lastname,
        second_lastname: buyer.second_lastname,
        photo: buyer.photo,
        email: buyer.email,
        cellphone: buyer.cellphone,
        address: $scope.curAddress.address,
        location: JSON.stringify($scope.curAddress.location),
        internal_number: $scope.curAddress.internal_number,
        address_notes: $scope.curAddress.address_notes,
        zipcode: $scope.curAddress.zipcode,
        map_data: $scope.curAddress.map_data,
        tag: $scope.curAddress.tag,
      }
    }
    order.customer = JSON.stringify(buyer);
    var business = gBusiness.getData();
    order.custom_trip = business.driver_tip?business.driver_tip:0;
      //console.log(business.delivery_price)
      order.custom_delivery_price = business.delivery_price?business.delivery_price:0;
      order.partner_id = $scope.business.partner_id?$scope.business.partner_id:0;
      console.log(business)
      order.samePartnrCode = business.samePartnrCode?business.samePartnrCode:'0'
  
    $scope.placeOrder(order);
  }
   /*********************************** */
   $rootScope.allTotal_r = $scope.allTotal;
  $scope.onPlace = function () {
    $scope.placing = true;
    $rootScope.allTotal_r = $scope.allTotal;
    $rootScope.sumDelv_r = $scope.sumDelv;
    for (let x = 0; x < $scope.mcartdata1.length; x++) {
      setTimeout(function timer() {
        var buyer = gUser.getData();
        let buyer_data = {
          id: buyer.id,
          name: buyer.name,
          middle_name: $scope.buyer.middle_name,
          lastname: buyer.lastname,
          second_lastname: buyer.second_lastname,
          photo: buyer.photo,
          email: buyer.email,
          cellphone: buyer.cellphone,
          address: $scope.curAddress.address,
          location: JSON.stringify($scope.curAddress.location),
          internal_number: $scope.curAddress.internal_number,
          address_notes: $scope.curAddress.address_notes,
          zipcode: $scope.curAddress.zipcode,
          map_data: $scope.curAddress.map_data,
          tag: $scope.curAddress.tag,
        }
        var products = [];
        $scope.cart = $scope.mcartdata1[x].cartdata;
        for (var i = 0; i < $scope.cart.length; i++) {
          var product = {
            id: $scope.cart[i].id,
            code: $scope.cart[i].code,
            quantity: $scope.cart[i].quantity,
            options: [],
            ingredients: [],
            comment: $scope.cart[i].comment
          };
          for (var j = 0; j < $scope.cart[i].options.length; j++) {
            var option = {
              id: $scope.cart[i].options[j].id,
              suboptions: []
            };
            for (var k = 0; k < $scope.cart[i].options[j].suboptions.length; k++) {
              option.suboptions.push($scope.cart[i].options[j].suboptions[k].id);
            }
            product.options.push(option);
          }
          for (var j = 0; j < $scope.cart[i].extended_options.length; j++) {
            var option = {
              id: $scope.cart[i].extended_options[j].id,
              suboptions: []
            };
            for (var k = 0; k < $scope.cart[i].extended_options[j].suboptions.length; k++) {
              option.suboptions.push({
                id: $scope.cart[i].extended_options[j].suboptions[k].id,
                position: $scope.cart[i].extended_options[j].suboptions[k].position,
                quantity: $scope.cart[i].extended_options[j].suboptions[k].quantity
              });
            }
            product.options.push(option);
          }
          for (var j = 0; j < $scope.cart[i].ingredients.length; j++) {
            if (!$scope.cart[i].ingredients[j].selected) product.ingredients.push($scope.cart[i].ingredients[j].id);
          }
          Analytics.addProduct($scope.cart[i].id, $scope.cart[i].name, '', '', '', $scope.cart[i].total / $scope.cart[i].quantity, $scope.cart[i].quantity, '', i);
          products.push(product);
        }
        console.log($scope.mcartdata1);

        var placeOrderdata = {
          business_id: $scope.mcartdata1[x].id,
          code: $scope.generateRandom(30),
          custom_delivery_price: $scope.mcartdata1[x].delivery_price,
          custom_trip: $scope.mcartdata1[x].driver_tip,
          customer: JSON.stringify(buyer_data),
          customer_id: 44,
          delivery_type: $scope.order.type,
          delivery_zone_id: $scope.mcartdata1[x].delivery_zone,
          driver_tip: $scope.mcartdata1[x].driver_tip,
          location: gOrder.getData().position,
          partner_id: $scope.mcartdata1[x].partner_id,
          paymethod_id: $scope.order.paymethod.id,
          products: JSON.stringify(products),
          samePartnrCode: $scope.mcartdata1[x].samePartnrCode ? $scope.mcartdata1[x].samePartnrCode : '0'
        }
        $scope.place($scope.mcartdata1[x]);
        //return;
        //$scope.placeOrder()
        //$scope.plll();
      }, x * 3000);
    }

  }
  //console\.log($rootScope.loopCount)

  $scope.plll = function () {
    console.log('hit');
  }

  $scope.onPlaceAfterCode_a = function (mBusiness) {
    //console\.log('onPlaceAfterCode')
    $scope.business = mBusiness;
    console.log(mBusiness)
    $scope.errors.email.message = null;
    $scope.errors.mobile_phone.message = null;
    if (ADDONS.preorder && ($scope.wopreorder.date == '' && $scope.preorder.date == '') && !$scope.checkASAP) {
      MyAlert.show($scope.translate('PREORDER_STEP_2_DATE'));
      $scope.placing = false;
      return;
    }
    if (ADDONS.preorder && ($scope.wopreorder.time == '' && $scope.preorder.time == '') && !$scope.checkASAP) {
      MyAlert.show($scope.translate('PREORDER_STEP_2_TIME'));
      $scope.placing = false;
      return;
    }
    if ($scope.gateway == 'cash') {
      if ($scope.order.cash != '') {
        if ($scope.order.cash < $scope.cart_data.total) {
          if (ADDONS.web_template) MyLoading.toast($scope.translate('AMOUNT_MUST_BIGGER_TOTAL'), 2000);
          else MyAlert.show($scope.translate('AMOUNT_MUST_BIGGER_TOTAL'));
          $scope.placing = false;
          return;
        }
        if ($scope.order.cash > parseInt($scope.order.cash)) {
          if (ADDONS.web_template) MyLoading.toast($scope.translate('AMOUNT_MUST_INTEGER'), 2000);
          else MyAlert.show($scope.translate('AMOUNT_MUST_INTEGER'));
          $scope.placing = false;
          return;
        }
      }
    }
    if (NEW_FEATURES.MULTI_ADDRESS && !gUser.isLogged() && $scope.addressfields.address_notes.required && (!$scope.curAddress.address_notes || $scope.curAddress.address_notes == '')) {
      $scope.errors.address_notes.status = true;
    }
    if (NEW_FEATURES.MULTI_ADDRESS && !gUser.isLogged() && $scope.addressfields.internal_number.required && (!$scope.curAddress.internal_number || $scope.curAddress.internal_number == '')) {
      $scope.errors.internal_number.status = true;
    }
    if (!$scope.buyer.name && $scope.checkoutfields.name && $scope.checkoutfields.name.required && $scope.checkoutfields.name.enabled) {
      $scope.errors.name.status = true;
    }
    if (!$scope.buyer.lastname && $scope.checkoutfields.lastname.required && $scope.checkoutfields.lastname.enabled) {
      $scope.errors.lastname.status = true;
    }
    if (!$scope.buyer.second_lastname && $scope.checkoutfields.second_lastname.required && $scope.checkoutfields.second_lastname.enabled) {
      $scope.errors.second_lastname.status = true;
    }
    var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    if ((!$scope.buyer.email && $scope.checkoutfields.email && $scope.checkoutfields.email.required && $scope.checkoutfields.email.enabled) || !re.test($scope.buyer.email)) {
      $scope.errors.email.status = true;
      $scope.errors.email.message = $scope.translate('EMAIL_INVALID');
    }
    if (!$scope.buyer.city_id && $scope.checkoutfields.city_dropdown_option && $scope.checkoutfields.city_dropdown_option.required && $scope.checkoutfields.city_dropdown_option.enabled && !NEW_FEATURES.MULTI_ADDRESS) {
      $scope.errors.city.status = true;
    }
    if (!$scope.buyer.dropdown_option_id && $scope.checkoutfields.city_dropdown_option && $scope.checkoutfields.city_dropdown_option.required && $scope.checkoutfields.city_dropdown_option.enabled && !NEW_FEATURES.MULTI_ADDRESS) {
      $scope.errors.dropdown_option.status = true;
    }
    if (!$scope.buyer.address && $scope.checkoutfields.address && $scope.checkoutfields.address.required && $scope.checkoutfields.address.enabled && !NEW_FEATURES.MULTI_ADDRESS) {
      $scope.errors.address.status = true;
    }
    if (!$scope.buyer.zipcode && $scope.checkoutfields.zipcode && $scope.checkoutfields.zipcode.required && $scope.checkoutfields.zipcode.enabled && !NEW_FEATURES.MULTI_ADDRESS) {
      $scope.errors.zipcode.status = true;
    }
    if (!$scope.buyer.cellphone && $scope.checkoutfields.mobile_phone && $scope.checkoutfields.mobile_phone.required && $scope.checkoutfields.mobile_phone.enabled) {
      $scope.errors.mobile_phone.status = true;
    }
    if ($scope.buyer.cellphone && $scope.buyer.cellphone.length < 8) {
      $scope.errors.mobile_phone.status = true;
      $scope.errors.mobile_phone.message = $scope.translate('CELLPHONE_FORMAT_ERROR');
    }
    if (((!$scope.buyer.address_notes && !NEW_FEATURES.MULTI_ADDRESS) || (NEW_FEATURES.MULTI_ADDRESS && (!$scope.curAddress.address_notes || $scope.curAddress.address_notes == ''))) && $scope.checkoutfields.address_notes && $scope.checkoutfields.address_notes.required && $scope.checkoutfields.address_notes.enabled) {
      $scope.errors.address_notes.status = true;
    }
    if (!$scope.order.offer && $scope.checkoutfields.coupon && $scope.checkoutfields.coupon.required && $scope.checkoutfields.coupon.enabled) {
      $scope.errors.coupon.status = true;
    }
    if (!$scope.order.paymethod) {
      $scope.errors.paymethod.status = true;
    }
    for (var key in $scope.errors) {
      if ($scope.errors[key].status) {
        if (key == 'coupon' && !$scope.checkoutfields.coupon.required) continue;
        Extensions.runAction('checkout_form_errors', $scope.errors, $scope);
        $scope.placing = false;
        return;
      }
    }
    if ($scope.order.driver_tip == 0 && $scope.checkoutfields.driver_tip && $scope.checkoutfields.driver_tip.required && $scope.checkoutfields.driver_tip.enabled && $scope.order.type == 1) {
      MyAlert.show($scope.translate('DRIVER_TIP_REQUIRED'));
      $scope.placing = false;
      return;
    }
    var order = gOrder.getData();
    var params = {
      id_or_slug: $scope.business.id,
      type: order.type
    };
    //console\.log(params);

    if (NEW_FEATURES.MULTI_ADDRESS && !localStorageApp.getItem(STORE.CREATE_ORDER)) {
      var address = gAddress.getData();
      if (address == "null" || address == null)
        params.location = order.position.lat + ',' + order.position.lng;
      else
        params.location = address.location.lat + ',' + address.location.lng
    } else {
      if (gPreorder.getData().menu_id) params.menu_id = gPreorder.getData().menu_id;
      if (order.dropdownoption && order.dropdownoption != '') {
        params.dropdownoption = order.dropdownoption;
      } else if (order.address && order.address != '') {
        params.location = order.position.lat + ',' + order.position.lng;
      }
    }
    MyLoading.show($scope.translate('LOADING') + '...');
    Ordering.business.get(params, function (res) {
      MyLoading.hide();
      if (!res.result) return;
      if (res.result && !res.result.open && $scope.checkASAP) {
        MyAlert.show($scope.translate('CLOSEDRESTAURANTS'));
        $scope.placing = false;
        return;
      }
      /* if (order.type == 1 && $scope.business.delivery_price != res.result.delivery_price) {
        $scope.placing = false;
        return MyAlert.show($scope.translate('DELIVERY_PRICE_CHANGED'))
      } */
      var cart = mBusiness.cartdata;//gCart.getData();
      var products_id = cart.map(function (product) { return product.id });
      var validation_data = {
        id: res.result.id,
        type: order.type,
        products: JSON.stringify(products_id),
        params: 'name,price,suboptions'
      }
      if ($scope.order.delivery_datetime && gPreorder.getData().menu_id) {
        validation_data.menu_id = gPreorder.getData().menu_id;
      } else if ($scope.order.delivery_datetime) {
        validation_data.timestamp = moment($scope.order.delivery_datetime, "MM-DD-YYYY HH:mm").unix();
      }
      console.log('valid cart');
      Ordering.business.validate_cart(validation_data, function (res) {
        if (!res.error) {
          if (res.result.valid == 'not_need') {
            if (res.result.non_existent_products.length > 0) {
              var new_cart = [];
              for (var i = 0; i < $scope.cart.length; i++) {
                var product_cart = $scope.cart[i];
                if (res.result.non_existent_products.indexOf(product_cart.id) == -1) {
                  new_cart.push(product_cart);
                }
              }
              gCart.setData(new_cart);
              $scope.cart = new_cart;
              $scope.refreshCartData();
              $scope.placing = false;
              return MyAlert.show($scope.translate('PRODUCTS_NO_LONGER_EXIST_REMOVED'));
            }

            if (res.result.invalid_products.length > 0) {
              var product_str = '';
              res.result.invalid_products.forEach(function (product) {
                if (product_str != '') product_str += ', ';
                product_str += product.name
              });
              var invalid_products = res.result.invalid_products.map(function (product) {
                return product.id;
              });
              var new_cart = [];
              for (var i = 0; i < $scope.cart.length; i++) {
                var product_cart = $scope.cart[i];
                if (invalid_products.indexOf(product_cart.id) == -1) {
                  new_cart.push(product_cart);
                }
              }
              gCart.setData(new_cart);
              $scope.cart = new_cart;
              $scope.refreshCartData();
              $scope.placing = false;
              return MyAlert.show($scope.translate('ERROR_THIS_PRODUCTS_INVALID').replace('_products_', product_str));
            }
          }

          var new_cart = gCart.getData();
          for (var i = 0; i < new_cart.length; i++) {
            var product_cart = new_cart[i];
            for (var j = 0; j < res.result.valid_products.length; j++) {
              var product = res.result.valid_products[j];
              if (product_cart.id == product.id) {
                var total = product.price;
                var suboptions = [];
                if (product.extras) {
                  suboptions = product.extras.reduce(function (previous, current) {
                    var _suboptions = [];
                    for (var k = 0; k < current.options.length; k++) {
                      var option = current.options[k];
                      for (var l = 0; l < option.suboptions.length; l++) {
                        var suboption = option.suboptions[l];
                        _suboptions.push(suboption);
                      }
                    }
                    return previous.concat(_suboptions);
                  }, []);
                }
                for (var k = 0; k < product_cart.options.length; k++) {
                  var option = product_cart.options[k];
                  for (var l = 0; l < option.suboptions.length; l++) {
                    var suboption = option.suboptions[l];
                    for (var m = 0; m < suboptions.length; m++) {
                      var _suboption = suboptions[m];
                      if (suboption.id == _suboption.id) {
                        suboption.price = _suboption.price;
                        total += suboption.price;
                      }
                    }
                  }
                }
                for (var k = 0; k < product_cart.extended_options.length; k++) {
                  var option = product_cart.extended_options[k];
                  for (var l = 0; l < option.suboptions.length; l++) {
                    var suboption = option.suboptions[l];
                    for (var m = 0; m < suboptions.length; m++) {
                      var _suboption = suboptions[m];
                      if (suboption.id == _suboption.id) {
                        var price_suboption = _suboption.price;
                        if (suboption.position != 'whole') {
                          price_suboption = _suboption.half_price;
                        }
                        suboption.price = _suboption.price;
                        suboption.half_price = _suboption.half_price;
                        total += price_suboption * suboption.quantity;
                      }
                    }
                  }
                }
                total *= product_cart.quantity;
                product_cart.total = total;
              }
            }
          }
          gCart.setData(new_cart);
          $scope.cart = new_cart;
          $scope.refreshCartData();
          //	//console\.log($scope.cart_data); return;  
          var truncated_description = $scope.parseOrderData($scope.cart, $scope.cart_data, $scope.business, $scope.order)
          if (truncated_description.length > 1000) truncated_description = truncated_description.slice(0, 997) + '...'
          if ($scope.order.paymethod.gateway == 'authorize') {
            if ($scope.card_data) {
              $scope.pay({
                number: $scope.card_data.number,
                cvc: $scope.card_data.cvc,
                exp_year: $scope.card_data.year,
                exp_month: $scope.card_data.month,
                email: $scope.buyer.email,
                customer: JSON.stringify($scope.buyer),
                user_id: $scope.buyer.id,
                amount: $scope.cart_data.total,
                gateway: $scope.order.paymethod.gateway,
                currency: STRIPE_CURRENCY,
                description: truncated_description
              }, function (pay_data) {
                $scope.order.pay_data = pay_data;
                $scope.place();
              });
            } else {
              MyAlert.show($scope.translate('CARD_DATA_OR_SELECT_OTHER_METHOD'));
              $scope.placing = false;
            }
          } else if ($scope.order.paymethod.gateway == 'stripe' || $scope.order.paymethod.gateway == 'stripe_connect' || $scope.order.paymethod.gateway == 'stripe_redirect' || $scope.order.paymethod.gateway == 'stripe_direct') {
            if ($scope.stripe_token) {
              $scope.pay({
                source_id: $scope.stripe_token,
                customer: JSON.stringify($scope.buyer),
                user_id: $scope.buyer.id == -1 ? null : $scope.buyer.id,
                amount: $scope.cart_data.total,
                subtotal: $scope.cart_data.subtotal - $scope.cart_data.discount + ($scope.business.tax_type === 1 ? $scope.cart_data.tax : 0),
                gateway: $scope.order.paymethod.gateway,
                currency: STRIPE_CURRENCY,
                description: truncated_description
              }, function (pay_data) {
                $scope.order.pay_data = pay_data;
                $scope.place();
              });
            } else {
              MyAlert.show($scope.translate('CARD_DATA_OR_SELECT_OTHER_METHOD'));
              $scope.placing = false;
            }
          } else if ($scope.order.paymethod.gateway == 'paypal_express') {
            $scope.initPaypal();
          } else {
            $scope.place();
          }
        } else {
          MyAlert.show(res.result);
        }
      });
      //}


    });
  }

  $scope.place = function (business) {
    console.log('plac')
    //console\.log($scope.business); // .cartdata
    var code = $scope.generateRandom(30);
    localStorageApp.setItem('order_code', code);
    var delivery_datetime = null;
    if ($scope.order.delivery_datetime) {
      var date_parts = $scope.order.delivery_datetime.split(' ')[0].split('-');
      var time_parts = $scope.order.delivery_datetime.split(' ')[1].split(':');
      var date = new Date(date_parts[2], date_parts[0] - 1, date_parts[1], time_parts[0], time_parts[1]);
      delivery_datetime = date.getFullYear() + '-' + (date.getMonth() + 1 < 10 ? '0' : '') + (date.getMonth() + 1) + '-' + (date.getDate() < 10 ? '0' : '') + date.getDate() + ' ' + (date.getHours() < 10 ? '0' : '') + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ':00';
    }
    if (!ADDONS.preorder) delivery_datetime = null;
    var order = {
      paymethod_id: $scope.order.paymethod.id,
      business_id: business.id,
      delivery_type: $scope.order.type,
      driver_tip: $scope.order.driver_tip == -1 ? 0 : $scope.order.driver_tip,
      pay_data: $scope.order.pay_data,
      delivery_zone_id: business.delivery_zone,
      delivery_datetime: delivery_datetime,
      location: gOrder.getData().position,
      cash: $scope.order.cash,
      code: code
      //offer_id: ,
      /*location:,*/
    };
    if (NEW_FEATURES.MULTI_ADDRESS) {
      order.location = $scope.curAddress.location;
    }
    if ($scope.order.offer) order.offer_id = $scope.order.offer.id;
    order.products = [];
    if ($scope.mcartdata1.length > 0) {
      $scope.cart = business.cartdata;
      console.log($scope.cart);
      for (var i = 0; i < $scope.cart.length; i++) {
        var product = {
          id: $scope.cart[i].id,
          code: $scope.cart[i].code,
          quantity: $scope.cart[i].quantity,
          options: [],
          ingredients: [],
          comment: $scope.cart[i].comment
        };
        for (var j = 0; j < $scope.cart[i].options.length; j++) {
          var option = {
            id: $scope.cart[i].options[j].id,
            suboptions: []
          };
          for (var k = 0; k < $scope.cart[i].options[j].suboptions.length; k++) {
            option.suboptions.push($scope.cart[i].options[j].suboptions[k].id);
          }
          product.options.push(option);
        }
        for (var j = 0; j < $scope.cart[i].extended_options.length; j++) {
          var option = {
            id: $scope.cart[i].extended_options[j].id,
            suboptions: []
          };
          for (var k = 0; k < $scope.cart[i].extended_options[j].suboptions.length; k++) {
            option.suboptions.push({
              id: $scope.cart[i].extended_options[j].suboptions[k].id,
              position: $scope.cart[i].extended_options[j].suboptions[k].position,
              quantity: $scope.cart[i].extended_options[j].suboptions[k].quantity
            });
          }
          product.options.push(option);
        }
        for (var j = 0; j < $scope.cart[i].ingredients.length; j++) {
          if (!$scope.cart[i].ingredients[j].selected) product.ingredients.push($scope.cart[i].ingredients[j].id);
        }
        Analytics.addProduct($scope.cart[i].id, $scope.cart[i].name, '', '', '', $scope.cart[i].total / $scope.cart[i].quantity, $scope.cart[i].quantity, '', i);
        order.products.push(product);
      }
    } else {
      for (var i = 0; i < $scope.cart.length; i++) {
        var product = {
          id: $scope.cart[i].id,
          code: $scope.cart[i].code,
          quantity: $scope.cart[i].quantity,
          options: [],
          ingredients: [],
          comment: $scope.cart[i].comment
        };
        for (var j = 0; j < $scope.cart[i].options.length; j++) {
          var option = {
            id: $scope.cart[i].options[j].id,
            suboptions: []
          };
          for (var k = 0; k < $scope.cart[i].options[j].suboptions.length; k++) {
            option.suboptions.push($scope.cart[i].options[j].suboptions[k].id);
          }
          product.options.push(option);
        }
        for (var j = 0; j < $scope.cart[i].extended_options.length; j++) {
          var option = {
            id: $scope.cart[i].extended_options[j].id,
            suboptions: []
          };
          for (var k = 0; k < $scope.cart[i].extended_options[j].suboptions.length; k++) {
            option.suboptions.push({
              id: $scope.cart[i].extended_options[j].suboptions[k].id,
              position: $scope.cart[i].extended_options[j].suboptions[k].position,
              quantity: $scope.cart[i].extended_options[j].suboptions[k].quantity
            });
          }
          product.options.push(option);
        }
        for (var j = 0; j < $scope.cart[i].ingredients.length; j++) {
          if (!$scope.cart[i].ingredients[j].selected) product.ingredients.push($scope.cart[i].ingredients[j].id);
        }
        Analytics.addProduct($scope.cart[i].id, $scope.cart[i].name, '', '', '', $scope.cart[i].total / $scope.cart[i].quantity, $scope.cart[i].quantity, '', i);
        order.products.push(product);
      }
    }

    order.products = JSON.stringify(order.products);
    if ($scope.buyer.id > 0 && !localStorageApp.getItem(STORE.CREATE_ORDER)) {
      order.customer_id = $scope.buyer.id;
      var user_update = {
        id: $scope.buyer.id,
        name: $scope.buyer.name,
        middle_name: $scope.buyer.middle_name,
        lastname: $scope.buyer.lastname,
        second_lastname: $scope.buyer.second_lastname,
        // email: $scope.buyer.email,
        cellphone: $scope.buyer.cellphone,
        address: $scope.buyer.address,
        address_notes: $scope.buyer.address_notes,
        dropdown_option_id: $scope.buyer.dropdown_option_id * 1,
        location: JSON.stringify(gOrder.getData().position),
        zipcode: $scope.buyer.zipcode,
      };
      if (NEW_FEATURES.MULTI_ADDRESS) {
        user_update = {
          id: $scope.buyer.id,
          name: $scope.buyer.name,
          middle_name: $scope.buyer.middle_name,
          lastname: $scope.buyer.lastname,
          second_lastname: $scope.buyer.second_lastname,
          address: $scope.buyer.address,
          address_notes: $scope.buyer.address_notes,
          zipcode: $scope.buyer.zipcode,
          location: JSON.stringify(gOrder.getData().position),
          // email: $scope.buyer.email,
          cellphone: $scope.buyer.cellphone,
        };
      }
      Ordering.users.update(user_update, function (res) {
        if (!res.error) {
          gUser.setData(res.result);
          $scope.buyer = res.result;
          if ($scope.buyer.dropdown_option) {
            $scope.buyer.city_id = $scope.buyer.dropdown_option.city.id + '';
            $scope.buyer.dropdown_option_id = $scope.buyer.dropdown_option.id + '';
          }
        }// else $scope.placing = false;
      });
    }
    $scope.buyer.location = JSON.stringify(gOrder.getData().position);
    var buyer = $scope.buyer;
    if (NEW_FEATURES.MULTI_ADDRESS) {
      buyer = {
        id: buyer.id,
        name: buyer.name,
        middle_name: $scope.buyer.middle_name,
        lastname: buyer.lastname,
        second_lastname: buyer.second_lastname,
        photo: buyer.photo,
        email: buyer.email,
        cellphone: buyer.cellphone,
        address: $scope.curAddress.address,
        location: JSON.stringify($scope.curAddress.location),
        internal_number: $scope.curAddress.internal_number,
        address_notes: $scope.curAddress.address_notes,
        zipcode: $scope.curAddress.zipcode,
        map_data: $scope.curAddress.map_data,
        tag: $scope.curAddress.tag,
      }
    }
    order.customer = JSON.stringify(buyer);
    //console.log(business.driver_tip)
    if ($scope.order.driver_tip == -1 && $rootScope.Order.roundPrice($scope.order.driver_tip_amount) > 0) {
      order.custom_trip = $rootScope.Order.roundPrice($scope.order.driver_tip_amount) / $scope.mcartdata1.length;
    }
    else {
      order.custom_trip = business.driver_tip ? business.driver_tip : 0;
    }
    //console.log(business.delivery_price)
    order.custom_delivery_price = business.delivery_price ? business.delivery_price : 0;
    order.partner_id = $scope.business.partner_id ? $scope.business.partner_id : 0;
    order.samePartnrCode = business.samePartnrCode ? business.samePartnrCode : '0'
    $scope.placeOrder(order);
  }

  function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }



  $scope.markAsProcesing = function (order_id) {

    Ordering.orders.update({
      id: order_id,
      status: '7' // Accpeted as Business
    }, function (res) {
      if (!res.error) {
      } else {
        console.log(res, result)
      }
    })

  }

  $scope.placeOnSquareOnline = function (orderInfo) {

    var buyer = gUser.getData();
    var order = {
      uuid: uuidv4(),
      email: buyer.email,
      name: buyer.name + ' ' + buyer.lastname,
      order: {
        type: $scope.order.type,
        products: orderInfo.products
      },
      buyer: buyer
    }

    Ordering.boxeteAPI.squareAPI(order, function (res) {
      console.log(res);
      if (res.data == true) {
        MyLoading.toast('transcarion is made on Square Online');
        if (ADDONS.default_order_is_processing == '1') {
          $scope.markAsProcesing(orderInfo.id);
        }
      }
      else {
        MyLoading.toast('Error while saving transction on Square Online' + res.message);
      }
    });

  }

  $scope.placeOnDoordash = function (orderInfo) {

    if (orderInfo.delivery_type == 1) {
      var buyer = gUser.getData();

      var order = {
        delivery_id: uuidv4() + '-D-' + orderInfo.id,
        order_value: parseInt(orderInfo.summary.subtotal.toString().replace('.', '')),
        buyer: buyer
      }

      Ordering.boxeteAPI.doordashAPI(order, function (res) {
        console.log(res);
        if (res.data == true) {
          MyLoading.toast('transcarion is made on Doordash');
        }
        else {
          MyLoading.toast('Error while saving transction on Doordash' + res.message);
        }
      });
    }
  }


  $scope.placeOrder = function (order) {
    $rootScope.allTotal_r = $scope.allTotal;
    var business = "";
    for (let i = 0; i < $scope.mcartdata1.length; i++) {
      if($scope.mcartdata1[i].id ==order.business_id ){
        business = $scope.mcartdata1[i];
        if($scope.mcartdata1[i].offer){
          order.offer_id = $scope.mcartdata1[i].offer.id;
        }
      }      
    }
    order.custom_trip = business.driver_tip?business.driver_tip:0;

    $rootScope.loopCount += 1;
    MyLoading.show($scope.translate('LOADING') + '...');
    console.log($scope.business)
    console.log(order)
    Ordering.orders.add(order, function (res) {

      if (typeof (res.result) == 'string' && res.result.indexOf('Warning')) {
        res.result = JSON.parse(res.result.split("\n")[4]);
      }

      if (!res.error) {
        //$rootScope.allTotal += Ordering.getTotal(res.result);
        $rootScope.orderConfirmData.push(res.result);
      }
      $scope.last = 0;
      if ($scope.mcartdata1.length == $rootScope.loopCount) {

        //console\.log('place order');
        $scope.mcartdata1 = [];
        //console\.log($rootScope.loopCount);
        gmultiBusiness.setData([]);
        localStorage.removeItem("multi_business");
        //console\.log(gmultiBusiness.getData());
        if (!res.error) {
          $rootScope.loopCount = 0;

          Analytics.trackTransaction(res.result.id, $scope.business.name, $scope.cart_data.total, $scope.business.tax, $scope.business.delivery_price, '', '', '', '');
          if (ADDONS.use_segment) {
            segment.track('Order Placed', {
              order: res.result.id,
              customer_email: res.result.customer.email,
              customer_phone: res.result.customer.phone,
              total: res.result.total,
              business_id: res.result.business_id,
            })
            segment.track('Payment Info Entered', {
              order: res.result.id,
              business: $scope.business.name,
              business_id: res.result.business_id,
              total: res.result.total,
              tax: $scope.business.tax,
              delivery: $scope.business.delivery_price,
              paymethod: $scope.order.paymethod.gateway
            })
          }

          if (!localStorageApp.getItem(STORE.CREATE_ORDER)) gUser.setData($scope.buyer);
          gCreateOrderBuyer.setData({});
          res.result.business.slug = $scope.business.slug;
          res.result.business.header = $scope.business.header;

          if ($scope.buyer.lastname) res.result.customer.lastname = $scope.buyer.lastname;
          else res.result.customer.lastname = '';
          gConfirm.setData(res.result);
          gAllBusiness.setData([]);
          gCart.setData([]);

          gOrder.setData({});
          gPreorder.setData({});
          gBusiness.setData({});
          $scope.refreshNumCart();
          $scope.placeOnSquareOnline(res.result);
          $scope.placeOnDoordash(res.result);
          if (ADDONS.web_template) {
            $state.go('main.confirm').then(function () {
              MyLoading.hide();
              $scope.placing = false;
            });
          } else {
            var registerBack = $ionicPlatform.registerBackButtonAction(function (event) {
              //console\.log('opened confirmation modal will disable back button on android.');
            }, 400);
            MyModal.showTemplate('templates/' + ADDONS.template + '/views/order-confirm-popup.html', {
              scope: $scope,
              animation: 'none',
              modalClose: false
            }).then(function (modal) {
              modals.push(modal);
              modal.show().then(function () {
                localStorageApp.removeItem('order_code');
                MyLoading.hide();
                $scope.placing = false;
              });
              modal.scope.hide = function () {
                modal.hide();
                modal.remove();
                $scope.$on('$destroy', registerBack);
                $scope.onGoToHome();
              }
            });
          }
        } else {
          MyAlert.show(res.result);
          MyLoading.hide();
          $scope.placing = false;
        }
      }
    });
  }

  /**************************** */
  /************** */
  $scope.checkCoupon = function (change) {
    $scope.errors.coupon.status = false;
    $scope.errors.coupon.message = '';
    // if (change == 'change') return;
    // var auxCoupon = $scope.order.coupon == undefined ? '' : $scope.order.coupon;
    // if ((auxCoupon.trim() == '' && !ADDONS.discount_code) || $scope.order.coupon == undefined || $scope.order.coupon == '') {
    //   $scope.errors.coupon.message = ''
    //   return;
    // }
    var auxCoupon = $scope.order.coupon[change] == undefined ? '' : $scope.order.coupon[change];
    if ((auxCoupon.trim() == '' && !ADDONS.discount_code) || $scope.order.coupon[change] == undefined || $scope.order.coupon[change] == ''){
			$scope.errors.coupon.message = ''
			 return;
		}
    Ordering.offers.get({
      business_id: change,
      id: $scope.order.coupon[change] 
    }, function (res) {
      if (!res.error && res.result) {
        if (res.result.enabled) {
          for (let i = 0; i < $scope.mcartdata1.length; i++) {
            if ($scope.mcartdata1[i].id == change) {
              var aux = res.result.rate_type == 1 ? $scope.mcartdata1[i].subtotal * res.result.rate / 100 : res.result.rate;
              if (aux < $scope.mcartdata1[i].subtotal && $scope.mcartdata1[i].subtotal >= res.result.minimum) {
                //$scope.cart_data.discount = aux;
                $scope.mcartdata1[i].discount = aux;
                //console\.log(	$scope.mcartdata1[i].discount)
                $scope.mcartdata1[i].offer = res.result;
                $scope.mcartdata1[i].offers.push(res.result);
                $scope.mcartdata1[i].coupon = res.result.coupon;
                /* $scope.order.offer = res.result;
                $scope.order.coupon = res.result.coupon; */
                //console\.log(	$scope.mcartdata1[i])
                //console\.log(aux)
              } else {
                $scope.errors.coupon.status = true;
                $scope.errors.coupon.message = $scope.translate('COUPON_INVALID_MIN').replace('_min_', $scope.parsePrice(res.result.minimum));
              }
              //console\.log($scope.mcartdata1)
            }
            if (i == (($scope.mcartdata1.length) - 1)) {
              //console\.log($scope.mcartdata1);
              // gmultiBusiness.setData($scope.mcartdata1);

            }
          }
          setTimeout(() => {
            $scope.refreshCartData();
          }, 200);

          //
        }
      } else {
        $scope.errors.coupon.status = true;
        $scope.errors.coupon.message = $scope.translate('COUPON_INVALID');
      }
    });
  }
  /************** */

})