//angular.bootstrap(document, ["orderingApp"]);

var _app = angular.module('orderingApp', angular_requires);
_app.run(function ($ionicPlatform, $ionicPopup, gStates, $rootScope, $ionicModal, $state, $ionicLoading, gUser, gAddress, gOrder, MyAlert, Ordering) {
    $rootScope.$on('$stateChangeStart', function (e, toState, toParams, fromState, fromParams) {
        if (NEW_FEATURES.ONLY_EDITOR) {
            if (NEW_FEATURES.ENABLE_MULTIPROJECT) {
                Ordering.configs.all({
                    mode: 'dictionary'
                }, function (res) {
                    if (!res.error) {
                        $rootScope.settings = res.result;
                        if (res.result['front_version'] && ADDONS.web_template) {
                            var local_last_version = localStorage.getItem('last_from_version');
                            if ((!local_last_version && res.result['front_version'].value != FRONT_VERSION) || (local_last_version && local_last_version != res.result['front_version'].value)) {
                                local_last_version = res.result['front_version'].value
                                localStorage.setItem('last_from_version', $rootScope.settings['front_version'].value);
                            }
                        }
                    }
                })
                if (gUser.getData().id == -1) {
                    Intercom('shutdown');
                    window.Intercom('boot', {
                        app_id: 'jdykrmpc',
                    });
                } else {
                    Intercom('shutdown');
                    window.Intercom('boot', {
                        app_id: 'jdykrmpc',
                        name: gUser.getData().name,
                        email: gUser.getData().email,
                        user_id: gUser.getData().email
                    });
                }
            }
            console.log(e, toState, toParams, fromState, fromParams)
            if (['main.search', 'main.business', 'main.checkOut', 'main.homeScreenRoot', 'main.homeScreen', 'main.signUp'].indexOf(toState.name) != -1) {
                e.preventDefault();
                if (!gUser.getData().id || gUser.getData().id <= 0) {
                    $state.go('main.login');
                } else {
                    $state.go('main.listing');
                }
                return;
            }
            if (['main.business-createorder'].indexOf(toState.name) != -1) {
                e.preventDefault();
                return;
            }
        }
        if (NEW_FEATURES.MULTI_ADDRESS && (gUser.isLogged() && !ADDONS.single_business) && ['main.homeScreenRoot', 'main.homeScreen', 'sideMenu.homeScreen'].indexOf(toState.name) != -1) {
            if (fromState.name != 'main.search' || fromState.name != 'sideMenu.searchBusinesses') {
                var defaultAddress = gAddress.getData();
                if (defaultAddress && defaultAddress != 'null') {
                    var order = gOrder.getData();
                    order.type = DEFAULT_ORDER_TYPE == 'delivery' ? '1' : '2';
                    gOrder.setData({
                        address: defaultAddress.address,
                        position: defaultAddress.location,
                        lat: defaultAddress.location.lat,
                        lng: defaultAddress.location.lng,
                        type: order.type ? order.type : "1",
                        business_slug: order.business_slug
                    });
                    var searchData = { 'order_type': (gOrder.getData().type == 1) ? 'delivery' : 'pickup', 'address': gOrder.getData().position.lat + ',' + gOrder.getData().position.lng };
                    if (ADDONS.web_template) {
                        e.preventDefault();
                        $state.go('main.search', searchData);
                    } else {
                        setTimeout(function () {
                            $state.go('sideMenu.searchBusinesses', searchData, { animation: 'no-animation' });
                        }, 1);
                    }
                }
            } else {
                e.preventDefault();
            }
        }
    });
    $ionicPlatform.ready(function () {
        // Hide the Splash Screen
        if (navigator.splashscreen) {
            setTimeout(function () {
                navigator.splashscreen.hide();
            }, 100);
        }

        // Detect of Network Connection
        if (window.Connection) {
            // checkConnection();
            if (navigator.connection.type == Connection.NONE) {
                G_NETSTATE = STATE.NO_INTERNET;
                //alert("Connect detect : " + STATE.NO_INTERNET);
            } else {
                G_NETSTATE = STATE.STATE_OK;
                //alert("Connect detect : " + STATE.STATE_OK);
            }
        }

        function checkConnection() {
            var networkState = navigator.connection.type;

            var states = {};
            states[Connection.UNKNOWN] = 'Unknown connection';
            states[Connection.ETHERNET] = 'Ethernet connection';
            states[Connection.WIFI] = 'WiFi connection';
            states[Connection.CELL_2G] = 'Cell 2G connection';
            states[Connection.CELL_3G] = 'Cell 3G connection';
            states[Connection.CELL_4G] = 'Cell 4G connection';
            states[Connection.CELL] = 'Cell generic connection';
            states[Connection.NONE] = 'No network connection';

            $ionicPopup.alert({
                title: 'OrderingApp',
                template: 'ConnectionType: ' + states[networkState]
            });
        }

        //------------------------------------------------------------

        if (window.cordova && window.Keyboard && window.Keyboard.hideFormAccessoryBar) {
            window.Keyboard.hideFormAccessoryBar(false);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }

        var notificationOpenedCallback = function (jsonData) {
            if (typeof jsonData.notification.payload.additionalData == 'string') {
                jsonData.notification.payload.additionalData = JSON.parse(jsonData.notification.payload.additionalData);
            }
            if (jsonData.notification.payload.additionalData.type && jsonData.notification.payload.additionalData.type == 1) {
                $rootScope.notification_data = jsonData.notification.payload;
                $ionicModal.fromTemplateUrl('templates/' + ADDONS.template + '/views/push-marketing-popup.html', {
                    scope: $rootScope,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    modal.show();
                    $rootScope.modal = modal;
                });
                $rootScope.offConfirm = function () {
                    $rootScope.modal.hide();
                    $state.go('sideMenu.homeScreen');
                }
            } else {
                Ordering.orders.all({}, function (res) {
                    if (!res.error) {
                        for (var i = 0; i < res.result.length; i++) {
                            if (res.result[i].id == jsonData.notification.payload.additionalData.order_id) {
                                tap = 0;
                                if (jsonData.notification.payload.additionalData.type == 'order_message') {
                                    tap = 1;
                                }
                                $rootScope.orderViewMore(res.result[i], tap);
                                break;
                            }
                        }
                    } else MyAlert.show(res.result);
                });
            }
        };

        if (window.plugins && window.plugins.OneSignal) {
            window.plugins.OneSignal
                .startInit(ONE_SIGNAL_ID)
                .inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.None)
                .handleNotificationOpened(notificationOpenedCallback)
                .handleNotificationReceived(function (jsonData) {
                    if (SHOW_INAPP_NOTIFICATIONS) MyAlert.show(jsonData.payload.body);
                })
                .endInit();
            window.plugins.OneSignal.getIds(function (ids) {
                GCM_DEVICE_TOKEN = ids.userId;
                localStorage.setItem('token_notification', ids.userId);
            });
        }
    });

});

_app.config(function ($stateProvider, $urlRouterProvider, $locationProvider, $compileProvider, AnalyticsProvider, $ionicConfigProvider, $compileProvider, $injector) {
    $ionicConfigProvider.views.swipeBackEnabled(false);
    AnalyticsProvider
        .setAccount(ADDONS.google_analytics_id)
        .logAllCalls(true)
        //.startOffline(true)
        .useECommerce(true, true)
        .trackUrlParams(ADDONS.web_template)
        .setPageEvent('$stateChangeSuccess')
        //.setDomainName('none')
        .setHybridMobileSupport(true)
        .setCurrency(STRIPE_CURRENCY);
    if (ADDONS.google_analytics_debug) {
        AnalyticsProvider.enterDebugMode(ADDONS.google_analytics_debug);
    }
    if (ADDONS.use_segment) {
        var segmentProvider = $injector.get('segmentProvider');
        segmentProvider.setConfig({
            debug: ADDONS.segment_debug,
            apiKey: ADDONS.segment_key,
            autoload: true
        });
    }
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob|ionic):|data:image/);
    var layout = (ADDONS.web_template) ? 'main.' : '';
    var view_profile = {};
    var view_forgot_password = {};
    var view_sign_up_business = {};
    function getTemplate($http, url) {
        return $http.get(url)
            .then(function (data) {
                return data.data;
            });
    }
    if (ADDONS.web_template) {
        view_profile = {
            url: '/sign-up',
            views: {
                'content': {
                    templateUrl: 'templates/' + ADDONS.template + '/views/sign-up.html',
                    controller: 'signUpCtrl'
                }
            }
        };
        view_sign_up_business = {
            url: '/sign-up-business',
            views: {
                'content': {
                    templateUrl: 'templates/' + ADDONS.template + '/views/sign-up.html',
                    controller: 'signUpCtrl'
                }
            }
        }
        view_forgot_password = {
            url: '/forgot_password',
            views: {
                'content': {
                    controller: 'forgotPasswordCtrl',
                    templateProvider: function ($http) {
                        return getTemplate($http, 'templates/' + ADDONS.template + '/views/forgot-password.html')
                    }
                }
            }
        };
    } else {
        view_profile = {
            //url: '/sign-up',
            controller: 'signUpCtrl',
            templateProvider: function ($http) {
                return getTemplate($http, 'templates/' + ADDONS.template + '/views/sign-up.html')
            }
        }
        view_forgot_password = {
            // url: '/forgot_password',
            controller: 'forgotPasswordCtrl',
            templateProvider: function ($http) {
                return getTemplate($http, 'templates/' + ADDONS.template + '/views/forgot-password.html')
            }
        };
    }
    var data_home = {
        controller: 'homeScreenCtrl',
        templateProvider: function ($http) {
            return getTemplate($http, ADDONS.single_business ? 'templates/' + ADDONS.template + '/views/home-screen-sb.html' : 'templates/' + ADDONS.template + '/views/home-screen.html')
        }
    }
    var home_params = {};
    if (ADDONS.single_business) {
        data_home = {
            controller: 'businessCtrl',
            templateProvider: function ($http) {
                // var template = (NEW_FEATURES.BUSINESS_PAGE)?'templates/'+ADDONS.template+'/views/business.html':'templates/'+ADDONS.template+'/views/order-rest-menu.html';
                var template = 'templates/' + ADDONS.template + '/views/order-rest-menu.html';
                return getTemplate($http, template)
            }
        }
        home_params.business = BUSINESS_ID;
    }
    $urlRouterProvider.rule(function ($injector, $location) {
        var path = $location.path();
        if (path[path.length - 1] === '/') {
            var redirect = path.substr(0, path.length - 1);
            return redirect;
        }
    });

    if (!ADDONS.web_template) {
        $stateProvider.state('sideMenu', {
            cache: false,
            // url : '/side-menu',
            controller: 'sideMenuCtrl',
            templateProvider: function ($http) {
                return getTemplate($http, 'templates/' + ADDONS.template + '/views/side-menu.html')
            }
        });
        $stateProvider.state('sideMenu.homeScreen', {
            url: '/home-screen',
            views: {
                'mainContainer': {
                    controller: (ADDONS.template != 'bot1') ? 'homeScreenCtrl' : 'botCtrl',
                    templateProvider: function ($http) {
                        return getTemplate($http, (ADDONS.single_business && ADDONS.template != 'bot1') ? 'templates/' + ADDONS.template + '/views/home-screen-sb.html' : 'templates/' + ADDONS.template + '/views/home-screen.html')
                    }
                }
            }
        });
    }
    if (ADDONS.web_template) {
        $stateProvider.state('main', {
            templateProvider: function ($http) {
                var template = (NEW_FEATURES.FLEX_HEIGHT) ? 'templates/' + ADDONS.template + '/views/layouts/_main.html' : 'templates/' + ADDONS.template + '/views/layouts/main.html';
                return getTemplate($http, template)
            }
        });
    }
    // Web
    $stateProvider.state('main.homeScreenRoot', {
        url: '/',
        params: home_params,
        views: {
            'content': data_home
        }
    });
    $stateProvider.state('main.homeScreen', {
        url: '/home',
        params: home_params,
        views: {
            'content': data_home
        }
    });
    $stateProvider.state('sideMenu.profile', {
        // url: '/profile',
        params: {
            'tab': 1
        },
        views: {
            'mainContainer': {
                controller: 'profileCtrl',
                templateProvider: function ($http) {
                    return getTemplate($http, 'templates/' + ADDONS.template + '/views/my-account-profile.html')
                }
            }
        }
    });
    // Web
    $stateProvider.state(layout + 'profile', {
        url: '/profile',
        params: {
            'tab': 0
        },
        views: {
            'content': {
                controller: 'profileCtrl',
                templateProvider: function ($http) {
                    return getTemplate($http, 'templates/' + ADDONS.template + '/views/my-account-profile.html')
                }
            }
        }
    });
    if (!ADDONS.web_template) {
        $stateProvider.state('sideMenu.setting', {
            url: '/setting',
            views: {
                'mainContainer': {
                    controller: 'settingCtrl',
                    templateProvider: function ($http) {
                        return getTemplate($http, 'templates/' + ADDONS.template + '/views/my-account-setting.html')
                    }
                }
            }
        });
        $stateProvider.state('sideMenu.address-book', {
            url: '/address-book',
            views: {
                'mainContainer': {
                    controller: 'addressCtrl',
                    templateProvider: function ($http) {
                        return getTemplate($http, 'templates/' + ADDONS.template + '/views/my-address-book.html')
                    }
                }
            }
        });
        $stateProvider.state('sideMenu.myOrder', {
            // url: '/my-order',
            views: {
                'mainContainer': {
                    controller: 'orderCtrl',
                    templateProvider: function ($http) {
                        return getTemplate($http, 'templates/' + ADDONS.template + '/views/my-order.html')
                    }
                }
            }
        });
        $stateProvider.state('sideMenu.myCard', {
            // url: '/my-card',
            views: {
                'mainContainer': {
                    controller: 'cardCtrl',
                    templateProvider: function ($http) {
                        return getTemplate($http, 'templates/' + ADDONS.template + '/views/my-card.html')
                    }
                }
            }
        });
    }

    $stateProvider.state('ordering', {
        //cache: false,
        //url: '/ordering',
        controller: 'orderingCtrl',
        templateProvider: function ($http) {
            return getTemplate($http, 'templates/' + ADDONS.template + '/views/order-home.html')
        }
    });
    /*.state('addMyCardDetails',{
        //cache: false,
        url: '/cardDetails',
        templateUrl: 'templates/'+ADDONS.template+'/views/my-card-details.html',
        controller: 'orderingCardCtrl'
    })*/

    /*.state('search', {
        url: '/search/type/:order_type/address/:address',
        templateUrl: 'templates/'+ADDONS.template+'/views/order-rest-search.html',
        controller: 'searchCtrl'
    })*/

    /* Routes Editor */
    if (ADDONS.web_template) {
        $stateProvider.state('main.listing', {
            url: '/listing',
            views: {
                'content': {
                    controller: 'listingCtrl',
                    templateProvider: function ($http) {
                        return getTemplate($http, 'templates/' + ADDONS.template + '/views/editor/listing-business.html')
                    }
                }
            }
        });

        $stateProvider.state('main.pages', {
            url: '/pages/{slug}',
            views: {
                'content': {
                    controller: 'morePagesCtrl',
                    templateProvider: function ($http) {
                        return getTemplate($http, 'templates/' + ADDONS.template + '/views/more-pages.html')
                    }
                }
            }
        });

        $stateProvider.state('main.business-editor', {
            url: '/business/{slug:[0-9a-zA-Z_-]+}',
            views: {
                'content': {
                    controller: 'editBusinessCtrl',
                    templateProvider: function ($http) {
                        return getTemplate($http, 'templates/' + ADDONS.template + '/views/editor/business.html')
                    }
                }
            }
        });

        $stateProvider.state('main.orders', {
            url: '/orders',
            views: {
                'content': {
                    controller: NEW_FEATURES.ORDER_MANAGER ? 'ordersManagerCtrl' : 'ordersEditorCtrl',
                    templateProvider: function ($http) {
                        return getTemplate($http, 'templates/' + ADDONS.template + '/views/editor/orders/' + (NEW_FEATURES.ORDER_MANAGER ? 'orders-manager.html' : 'orders-list.html'))
                    }
                }
            }
        });
        $stateProvider.state('main.deliveries', {
            //url: '/deliveries',
            url: '/deliveries{order:(?:/[0-9]+)?}',
            views: {
                'content': {
                    controller: NEW_FEATURES.ORDER_MANAGER ? 'ordersManagerCtrl' : 'ordersEditorCtrl',
                    templateProvider: function ($http) {
                        return getTemplate($http, 'templates/' + ADDONS.template + '/views/editor/orders/' + (NEW_FEATURES.ORDER_MANAGER ? 'orders-manager.html' : 'orders-list.html'))
                    }
                }
            }
        });
    }

    if (ADDONS.web_template) {
        $stateProvider.state('main.settings', {
            url: '/settings{section:(?:/[^/]+)?}',
            defaultParams: { section: '/general' },
            views: {
                'content': {
                    controller: 'settingsEditorCtrl',
                    templateProvider: function ($http) {
                        return getTemplate($http, 'templates/' + ADDONS.template + '/views/editor/settings/main.html')
                    }
                }
            }
        });
        $stateProvider.state('main.settings-page', {
            url: '/settings/pages/{slug}',
            views: {
                'content': {
                    controller: 'pageSettingEditorCtrl',
                    templateProvider: function ($http) {
                        return getTemplate($http, 'templates/' + ADDONS.template + '/views/editor/settings/main.html')
                    }
                }
            }
        });
        $stateProvider.state('main.reports', {
            url: '/reports',
            views: {
                'content': {
                    controller: 'reportsEditorCtrl',
                    templateProvider: function ($http) {
                        return getTemplate($http, 'templates/' + ADDONS.template + '/views/editor/reports.html')
                    }
                }
            }
        });
        $stateProvider.state('main.driver_reports', {
            url: '/driver_reports',
            views: {
                'content': {
                    controller: 'driversReportsEditorCtrl',
                    templateProvider: function ($http) {
                        return getTemplate($http, 'templates/' + ADDONS.template + '/views/editor/drivers-reports.html')
                    }
                }
            }
        });
        $stateProvider.state('main.downloadable_reports', {
            url: '/new_reports',
            views: {
                'content': {
                    controller: 'downloadableReportsEditorCtrl',
                    templateProvider: function ($http) {
                        return getTemplate($http, 'templates/' + ADDONS.template + '/views/editor/downloadable-reports.html')
                    }
                }
            }
        });
        $stateProvider.state('main.support', {
            url: '/support{section:(?:/[^/]+)?}',
            defaultParams: { section: '/tutorials' },
            views: {
                'content': {
                    controller: 'supportEditorCtrl',
                    templateProvider: function ($http) {
                        return getTemplate($http, 'templates/' + ADDONS.template + '/views/editor/support/support-general.html')
                    }
                }
            }
        });
    }
    /* End Routes Editor */

    $stateProvider.state('main.search', {
        url: '/search/type/:order_type/address/:address',
        views: {
            'content': {
                controller: 'searchCtrl',
                templateProvider: function ($http) {
                    return getTemplate($http, 'templates/' + ADDONS.template + '/views/order-rest-search.html')
                }
            }
        }
    });

    $stateProvider.state('main.searchN', {
        url: '/search/type/:order_type/city/:city/neighborhood/:neighborhood',
        views: {
            'content': {
                controller: 'searchCtrl',
                templateProvider: function ($http) {
                    return getTemplate($http, 'templates/' + ADDONS.template + '/views/order-rest-search.html')
                }
            }
        }
    });

    if (NEW_FEATURES.MULTI_ADDRESS) {
        $stateProvider.state('sideMenu.searchBusinesses', {
            cache: false,
            views: {
                'mainContainer': {
                    controller: 'searchCtrl',
                    templateProvider: function ($http) {
                        return getTemplate($http, 'templates/' + ADDONS.template + '/views/search-businesses.html')
                    }
                }
            }
        });
        $stateProvider.state('sideMenu.addresses', {
            cache: false,
            views: {
                'mainContainer': {
                    controller: 'addressesCtrl',
                    templateProvider: function ($http) {
                        return getTemplate($http, 'templates/' + ADDONS.template + '/views/my-addresses.html')
                    }
                }
            }
        });
    }
    $stateProvider.state('restaurantSearch', {
        cache: false,
        //url: '/search-rest',
        controller: 'searchCtrl',
        templateProvider: function ($http) {
            return getTemplate($http, 'templates/' + ADDONS.template + '/views/order-rest-search.html')
        }
    });

    $stateProvider.state('sideMenu.restDetail', {
        cache: false,
        views: {
            'mainContainer': {
                controller: 'detailRestCtrl',
                templateProvider: function ($http) {
                    return getTemplate($http, 'templates/' + ADDONS.template + '/views/order-rest-menu.html')
                }
            }
        }
    });
    $stateProvider.state('mobileDetailRest', {
        //url: '/detail-rest',
        controller: 'detailRestCtrl',
        templateProvider: function ($http) {
            return getTemplate($http, 'templates/' + ADDONS.template + '/views/order-rest-menu.html')
        }
    });
    //Web
    $stateProvider.state('detailRest', {
        url: '/detail-rest-web',
        controller: 'detailRestCtrl',
        templateProvider: function ($http) {
            return getTemplate($http, 'templates/' + ADDONS.template + '/views/order-rest-menu.html')
        }
    });

    if (!ADDONS.web_template) {
        $stateProvider.state('ordering.detailMenu', {
            cache: false,
            //url: '/detail-menu',
            views: {
                'orderContainer': {
                    controller: 'detailMenuCtrl',
                    templateProvider: function ($http) {
                        return getTemplate($http, 'templates/' + ADDONS.template + '/views/order-rest-menu-detail.html')
                    }
                }
            }
        });
        $stateProvider.state('ordering.checkOut', {
            //url: '/order-checkout',
            views: {
                'orderContainer': {
                    controller: 'detailMenuCtrl',
                    templateProvider: function ($http) {
                        return getTemplate($http, 'templates/' + ADDONS.template + '/views/order-checkout.html')
                    }
                }
            }
        });
    }

    $stateProvider.state(layout + 'login', {
        url: '/login',
        views: {
            'content': {
                controller: 'signUpCtrl',
                templateProvider: function ($http) {
                    return getTemplate($http, 'templates/' + ADDONS.template + '/views/sign-in.html')
                }
            }
        }
    });

    $stateProvider.state(layout + 'forgot_password', view_forgot_password);

    if (ADDONS.web_template) {
        $stateProvider.state(layout + 'reset_password', {
            url: '/reset_password',
            views: {
                'content': {
                    controller: 'resetPasswordCtrl',
                    templateProvider: function ($http) {
                        return getTemplate($http, 'templates/' + ADDONS.template + '/views/reset-password.html')
                    }
                }
            }
        });
    }

    $stateProvider.state(layout + 'signUp', view_profile);
    $stateProvider.state(layout + 'signUpBusiness', view_sign_up_business);

    if (!ADDONS.web_template) {
        $stateProvider.state('signUp.register', {
            url: '/register',
            views: {
                'userContainer': {
                    controller: 'registerCtrl',
                    templateProvider: function ($http) {
                        return getTemplate($http, 'templates/' + ADDONS.template + '/views/register.html')
                    }
                }
            }
        });
    }

    $stateProvider.state('finalCheckOut', {
        cache: false,
        // url: '/order-final-checkout',
        params: {
            'addCardstripe': false
        },
        controller: 'finalCheckOutCtrl',
        templateProvider: function ($http) {
            return getTemplate($http, 'templates/' + ADDONS.template + '/views/order-checkout-popup.html')
        }
    });

    $stateProvider.state(layout + 'checkOut', {
        cache: false,
        url: '/checkout',
        params: {
            'addCardstripe': false
        },
        views: {
            'content': {
                controller: 'finalCheckOutCtrl',
                templateProvider: function ($http) {
                    return getTemplate($http, 'templates/' + ADDONS.template + '/views/order-checkout-popup.html')
                }
            }
        }
    });

    $stateProvider.state(layout + 'confirm', {
        //cache: false,
        url: '/confirm-order',
        views: {
            'content': {
                controller: 'confirmCtrl',
                templateProvider: function ($http) {
                    return getTemplate($http, 'templates/' + ADDONS.template + '/views/order-confirm-popup.html')
                }
            }
        }
    });

    if (ADDONS.web_template) {
        $stateProvider.state(layout + 'notfound', {
            //cache: false,
            url: '/store',
            views: {
                'content': {
                    controller: 'notfoundCtrl',
                    templateProvider: function ($http) {
                        return getTemplate($http, 'templates/' + ADDONS.template + '/views/404.html')
                    }
                }
            }
        });
    }

    for (var i = 0; i < _routes.length; i++) {
        if (_routes[i].state) {
            var options = {};
            if (_routes[i].url) options.url = _routes[i].url;
            if (_routes[i].controller) options.controller = _routes[i].controller;
            if (_routes[i].params) options.params = _routes[i].params;
            if (_routes[i].views && _routes[i].views.content && _routes[i].views.content.templateUrl) {
                _routes[i].views.content.templateUrl = 'templates/' + ADDONS.template + '/views/' + _routes[i].views.content.templateUrl;
                options.views = _routes[i].views;
            }
            if (_routes[i].views && _routes[i].views.mainContainer && _routes[i].views.mainContainer.templateUrl) {
                _routes[i].views.mainContainer.templateUrl = 'templates/' + ADDONS.template + '/views/' + _routes[i].views.mainContainer.templateUrl;
                options.views = _routes[i].views;
            }
            if (_routes[i].templateUrl) {
                options.templateUrl = 'templates/' + ADDONS.template + '/views/' + _routes[i].templateUrl;
            }
            $stateProvider.state(_routes[i].state, options);
        }
    }

    $stateProvider.state(layout + 'example', {
        url: '/example',
        views: {
            'content': {
                templateUrl: 'example.html',
                controller: 'customCtrl'
            }
        }
    });

    $stateProvider.state(layout + 'business-createorder', {
        url: '/{business:[0-9a-zA-Z_-]+}/createorder',
        views: {
            'content': {
                controller: 'businessCtrl',
                templateProvider: function ($http) {
                    // var template = (NEW_FEATURES.BUSINESS_PAGE)?'templates/'+ADDONS.template+'/views/business.html':'templates/'+ADDONS.template+'/views/order-rest-menu.html';
                    var template = 'templates/' + ADDONS.template + '/views/order-rest-menu.html';
                    return getTemplate($http, template)
                }
            }
        }
    });

    $stateProvider.state(layout + 'business', {
        url: '/{business:[0-9a-zA-Z_-]+}',
        views: {
            'content': {
                controller: 'businessCtrl',
                templateProvider: function ($http) {
                    // var template = (NEW_FEATURES.BUSINESS_PAGE)?'templates/'+ADDONS.template+'/views/business.html':'templates/'+ADDONS.template+'/views/order-rest-menu.html';
                    var template = 'templates/' + ADDONS.template + '/views/order-rest-menu.html';
                    return getTemplate($http, template)
                }
            }
        }
    });

    if (!ADDONS.web_template) $urlRouterProvider.otherwise('/home-screen');
    else {
        $urlRouterProvider.otherwise('/');
        $locationProvider.html5Mode(WEB_ADDONS.remove_hash);
    }
});

_app.constant('ADDONS', ADDONS);

_app.constant('API_ENDPOINTS', {
    auth: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/auth',
    sms: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/auth/sms/:platform',
    languages: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/languages',
    translations: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/translations',
    users: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/users',
    user_locations: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/users/:user_id/locations',
    user_keys: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/users/:user_id/keys',
    user_addresses: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/users/:user_id/addresses',
    orders: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/orders',
    orders_customfields: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/orders/:order_id/metafields',
    order_messages: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/orders/:order_id/messages',
    order_logs: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/orders/:order_id/logs',
    countries: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/countries',
    cities: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/countries/:country_id/cities',
    business: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/business',
    reviews: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/business/:business_id/reviews',
    categories: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/business/:business_id/categories',
    business_gallery: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/business/:business_id/gallery',
    products: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/business/:business_id/categories/:category_id/products',
    ingredients: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/business/:business_id/categories/:category_id/products/:product_id/ingredients',
    offers: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/business/:business_id/offers',
    offers_customfields: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/business/:business_id/offers/:offer_id/metafields',
    extras: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/business/:business_id/extras',
    options: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/business/:business_id/extras/:extra_id/options',
    suboptions: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/business/:business_id/extras/:extra_id/options/:option_id/suboptions',
    menus: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/business/:business_id/menus',
    menus_customfields: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/business/:business_id/menus/:menu_id/metafields',
    paymethod_credentials: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/business/:business_id/paymethods',
    deliveryzones: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/business/:business_id/deliveryzones',
    dropdownoptions: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/dropdownoptions',
    drivergroups: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/drivergroups',
    configs: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/configs',
    paymethods: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/paymethods',
    checkoutfields: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/checkoutfields',
    validationfields: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/validationfields',
    printers: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/printers',
    payments: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/payments/:gateway',
    webhooks: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/webhooks',
    plugins: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/plugins',
    business_webhooks: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/business/:business_id/webhooks',
    notifications: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/users/:user_id/notification_tokens',
    reports: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/reports',
    pages: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/pages',
    files: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/files',
    bulks_products: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/bulks/products',
    bulks_translations: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/bulks/translations',
    metafields: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/users/:user_id/metafields',
    limits: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/limits',
    metafields_order: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/orders/:order_id/metafields',
    order_groups: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/order_groups',
    business_customfields: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/business/:business_id/metafields',
    category_customfields: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/business/:business_id/categories/:category_id/metafields',
    product_customfields: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/business/:business_id/categories/:category_id/products/:product_id/metafields',
    product_extra_customfields: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/business/:business_id/extras/:extra_id/metafields',
    product_extra_option_customfields: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/business/:business_id/extras/:extra_id/options/:option_id/metafields',
    product_extra_soption_customfields: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/business/:business_id/extras/:extra_id/options/:option_id/suboptions/:suboption_id/metafields',
    user_reviews: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/users/:user_id/user_reviews',
    logistic_orders: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/logistic/orders/:order_id',
    driver_companies: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/driver_companies',
    business_types: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/business_types',
    business_menus_shared: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/business/:business_id/menus_shared',
    controls: API_URL + '/' + API_VERSION + '/:language/' + API_PROJECT_NAME + '/controls/orders',
    boxete_square_api_url: 'https://www.boxete.com/api/?action=square',
    boxete_doordash_api_url: 'https://www.boxete.com/api/?action=doordash',
});

