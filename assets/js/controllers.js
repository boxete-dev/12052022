var _controllers = angular.module('orderingApp.controllers', []);
var modals = [];
var intervals = [];
var sockets = {};
var curUrl = window.location.href;
var NOTIFICATION_TOAST;
// $(window).bind('hashchange', onChangePage);
function closeModals() {
	for (var i = 0; i < modals.length; i++) {
		if (modals[i].scope.close) modals[i].scope.close();
		else if (modals[i].scope.hide) modals[i].scope.hide();
		else if (modals[i].isShown()) {
			modals[i].hide();
			modals[i].remove();
		}
	}
	modals = [];
}
function onChangePage() {
	for (var i = 0; i < modals.length; i++) {
		modals[i].hide();
		modals[i].remove();
	}
	modals = [];
	if (!NEW_FEATURES.FLEX_HEIGHT) {
		$(window).off('scroll');
	}
	$('.pac-container').remove();
	intervals.forEach(function (interval) {
		clearInterval(interval);
	});
	intervals = [];
	// for (let key in sockets) {
	// 	sockets[key].close();
	// 	delete sockets[key];
	// }
}

var app_states = {
	homeScreen: ADDONS.web_template ? 'main.homeScreen': 'sideMenu.homeScreen',
	profile: ADDONS.web_template ? 'main.profile': 'sideMenu.profile',
	finalCheckOut: ADDONS.web_template ? 'main.checkOut': 'finalCheckOut'
}


	_controllers.directive('ngCache', function(ADDONS) {

		return {
			restrict: 'A',
			link: function(scope, el, attrs) {
				attrs.$observe('ngSrc', function(src) {

					ImgCache.isCached(src, function(path, success) {
						if (success) {
							ImgCache.useCachedFile(el);
						} else {
							ImgCache.cacheFile(src, function() {
								ImgCache.useCachedFile(el);
							});
						}
					});

				});
			}
		};
	})
	_controllers.controller('rootCtrl', function ($scope, $rootScope, $injector, $state, $filter, $location, $timeout, $interval, gStates, gOrder, $ionicHistory, gUser, 
									MyLoading, MyAlert, $ionicActionSheet, $ionicSideMenuDelegate, $ionicScrollDelegate, MyModal, $ionicPopover, $ionicPlatform,
									gNearService, GeolocationSvc, Geolocation, AddressLookupSvc, Analytics, MyToast,
									gPreorder, gCreateOrderBuyer, Ordering, gBusiness, gCart, gAddress, gAllBusiness, gConfirm, gProject, API_ENDPOINTS/*newrootCtrl*/) {
		
		$rootScope.ADDONS = ADDONS;
		$rootScope.constants = {
			DISTANCE_UNIT_KM: DISTANCE_UNIT_KM,
			fix_order_summary: null
		}
		$rootScope.NEW_FEATURES = NEW_FEATURES;
		$rootScope.NEW_ADDONS = NEW_ADDONS;
		$rootScope.pageTitle = '';
		$rootScope.sharedData = {
			curAddress: null
		};
		$rootScope.features = {
			facebook_login: {
				ready: false
			},
			facebook_sms: {
				ready: false
			},
			recaptcha: {
				ready: false,
				auth_required: false,
				signup_required: false
			}
		};
		$rootScope.setApiEndpoints = function (project) {
			if (!(NEW_FEATURES.ONLY_EDITOR && NEW_FEATURES.ENABLE_MULTIPROJECT)) project = API_PROJECT_NAME;
			console.log(project)
			API_ENDPOINTS.auth = API_URL+'/'+API_VERSION+'/:language/'+project+'/auth';
			API_ENDPOINTS.sms = API_URL+'/'+API_VERSION+'/:language/'+project+'/auth/sms/:platform';
			API_ENDPOINTS.languages = API_URL+'/'+API_VERSION+'/:language/'+project+'/languages';
			API_ENDPOINTS.translations = API_URL+'/'+API_VERSION+'/:language/'+project+'/translations';
			API_ENDPOINTS.users = API_URL+'/'+API_VERSION+'/:language/'+project+'/users';
			API_ENDPOINTS.user_locations = API_URL+'/'+API_VERSION+'/:language/'+project+'/users/:user_id/locations';
			API_ENDPOINTS.user_keys = API_URL+'/'+API_VERSION+'/:language/'+project+'/users/:user_id/keys';
			API_ENDPOINTS.user_addresses = API_URL+'/'+API_VERSION+'/:language/'+project+'/users/:user_id/addresses';
			API_ENDPOINTS.orders = API_URL+'/'+API_VERSION+'/:language/'+project+'/orders';
			API_ENDPOINTS.orders_customfields = API_URL+'/'+API_VERSION+'/:language/'+project+'/orders/:order_id/metafields';
			API_ENDPOINTS.order_messages = API_URL+'/'+API_VERSION+'/:language/'+project+'/orders/:order_id/messages';
			API_ENDPOINTS.order_logs = API_URL+'/'+API_VERSION+'/:language/'+project+'/orders/:order_id/logs';
			API_ENDPOINTS.countries = API_URL+'/'+API_VERSION+'/:language/'+project+'/countries';
			API_ENDPOINTS.cities = API_URL+'/'+API_VERSION+'/:language/'+project+'/countries/:country_id/cities';
			API_ENDPOINTS.business = API_URL+'/'+API_VERSION+'/:language/'+project+'/business';
			API_ENDPOINTS.reviews = API_URL+'/'+API_VERSION+'/:language/'+project+'/business/:business_id/reviews';
			API_ENDPOINTS.categories = API_URL+'/'+API_VERSION+'/:language/'+project+'/business/:business_id/categories';
			API_ENDPOINTS.business_gallery = API_URL+'/'+API_VERSION+'/:language/'+project+'/business/:business_id/gallery';
			API_ENDPOINTS.products = API_URL+'/'+API_VERSION+'/:language/'+project+'/business/:business_id/categories/:category_id/products';
			API_ENDPOINTS.ingredients = API_URL+'/'+API_VERSION+'/:language/'+project+'/business/:business_id/categories/:category_id/products/:product_id/ingredients';
			API_ENDPOINTS.offers = API_URL+'/'+API_VERSION+'/:language/'+project+'/business/:business_id/offers';
			API_ENDPOINTS.offers_customfields = API_URL+'/'+API_VERSION+'/:language/'+project+'/business/:business_id/offers/:offer_id/metafields';
			API_ENDPOINTS.extras = API_URL+'/'+API_VERSION+'/:language/'+project+'/business/:business_id/extras';
			API_ENDPOINTS.options = API_URL+'/'+API_VERSION+'/:language/'+project+'/business/:business_id/extras/:extra_id/options';
			API_ENDPOINTS.suboptions = API_URL+'/'+API_VERSION+'/:language/'+project+'/business/:business_id/extras/:extra_id/options/:option_id/suboptions';
			API_ENDPOINTS.menus = API_URL+'/'+API_VERSION+'/:language/'+project+'/business/:business_id/menus';
			API_ENDPOINTS.menus_customfields = API_URL+'/'+API_VERSION+'/:language/'+project+'/business/:business_id/menus/:menu_id/metafields';
			API_ENDPOINTS.paymethod_credentials = API_URL+'/'+API_VERSION+'/:language/'+project+'/business/:business_id/paymethods';
			API_ENDPOINTS.deliveryzones = API_URL+'/'+API_VERSION+'/:language/'+project+'/business/:business_id/deliveryzones';
			API_ENDPOINTS.dropdownoptions = API_URL+'/'+API_VERSION+'/:language/'+project+'/dropdownoptions';
			API_ENDPOINTS.drivergroups = API_URL+'/'+API_VERSION+'/:language/'+project+'/drivergroups';
			API_ENDPOINTS.configs = API_URL+'/'+API_VERSION+'/:language/'+project+'/configs';
			API_ENDPOINTS.paymethods = API_URL+'/'+API_VERSION+'/:language/'+project+'/paymethods';
			API_ENDPOINTS.checkoutfields = API_URL+'/'+API_VERSION+'/:language/'+project+'/checkoutfields';
			API_ENDPOINTS.validationfields = API_URL+'/'+API_VERSION+'/:language/'+project+'/validationfields';
			API_ENDPOINTS.printers = API_URL+'/'+API_VERSION+'/:language/'+project+'/printers';
			API_ENDPOINTS.payments = API_URL+'/'+API_VERSION+'/:language/'+project+'/payments/:gateway';
			API_ENDPOINTS.webhooks = API_URL+'/'+API_VERSION+'/:language/'+project+'/webhooks';
			API_ENDPOINTS.plugins = API_URL+'/'+API_VERSION+'/:language/'+project+'/plugins';
			API_ENDPOINTS.business_webhooks = API_URL+'/'+API_VERSION+'/:language/'+project+'/business/:business_id/webhooks';
			API_ENDPOINTS.notifications = API_URL+'/'+API_VERSION+'/:language/'+project+'/users/:user_id/notification_tokens';
			API_ENDPOINTS.reports = API_URL+'/'+API_VERSION+'/:language/'+project+'/reports';
			API_ENDPOINTS.pages = API_URL+'/'+API_VERSION+'/:language/'+project+'/pages';
			API_ENDPOINTS.files = API_URL+'/'+API_VERSION+'/:language/'+project+'/files';
			API_ENDPOINTS.bulks_products = API_URL+'/'+API_VERSION+'/:language/'+project+'/bulks/products';
			API_ENDPOINTS.bulks_translations = API_URL+'/'+API_VERSION+'/:language/'+project+'/bulks/translations';
			API_ENDPOINTS.metafields = API_URL+'/'+API_VERSION+'/:language/'+project+'/users/:user_id/metafields';
			API_ENDPOINTS.limits = API_URL+'/'+API_VERSION+'/:language/'+project+'/limits';
			API_ENDPOINTS.metafields_order = API_URL+'/'+API_VERSION+'/:language/'+project+'/orders/:order_id/metafields';
			API_ENDPOINTS.order_groups = API_URL+'/'+API_VERSION+'/:language/'+project+'/order_groups';
			API_ENDPOINTS.business_customfields = API_URL+'/'+API_VERSION+'/:language/'+project+'/business/:business_id/metafields';
			API_ENDPOINTS.category_customfields = API_URL+'/'+API_VERSION+'/:language/'+project+'/business/:business_id/categories/:category_id/metafields';
			API_ENDPOINTS.product_customfields = API_URL+'/'+API_VERSION+'/:language/'+project+'/business/:business_id/categories/:category_id/products/:product_id/metafields';
			API_ENDPOINTS.product_extra_customfields = API_URL+'/'+API_VERSION+'/:language/'+project+'/business/:business_id/extras/:extra_id/metafields';
			API_ENDPOINTS.product_extra_option_customfields = API_URL+'/'+API_VERSION+'/:language/'+project+'/business/:business_id/extras/:extra_id/options/:option_id/metafields';
			API_ENDPOINTS.product_extra_soption_customfields = API_URL+'/'+API_VERSION+'/:language/'+project+'/business/:business_id/extras/:extra_id/options/:option_id/suboptions/:suboption_id/metafields';
			API_ENDPOINTS.user_reviews = API_URL+'/'+API_VERSION+'/:language/'+project+'/users/:user_id/user_reviews';
			API_ENDPOINTS.logistic_orders = API_URL+'/'+API_VERSION+'/:language/'+project+'/logistic/orders/:order_id';
			API_ENDPOINTS.driver_companies = API_URL+'/'+API_VERSION+'/:language/'+project+'/driver_companies';
			API_ENDPOINTS.business_types = API_URL+'/'+API_VERSION+'/:language/'+project+'/business_types';
			gProject.setData(project);
			console.log(API_ENDPOINTS);
		}
		if (gProject.getData()) { 
			$rootScope.setApiEndpoints(gProject.getData());
			API_PROJECT_NAME = gProject.getData();
		}
		$rootScope.tutorialON = true;
		var isIOS = /iP(ad|od|hone)/i.test(window.navigator.userAgent);
		$rootScope.isIOS = isIOS;
		$rootScope.isMobileSafari = isIOS && /WebKit/i.test(window.navigator.userAgent) && !(/(CriOS|FxiOS|OPiOS|mercury)/i.test(window.navigator.userAgent));
		if (isIPhoneX()) document.getElementsByTagName('body')[0].classList.add('platform-ios-x');
		$rootScope.rootTheme = 'templates/'+ADDONS.template;
		$rootScope.settings = {};
		$ionicPlatform.ready(function() {
			$ionicPlatform.registerBackButtonAction(function (event) {
				event.preventDefault();
				var stateName = $state.current.name;
				if (stateName == "sideMenu.homeScreen" || (stateName == 'sideMenu.restDetail' && NEW_FEATURES.MULTI_ADDRESS && $rootScope.getLogState())){
					if ($rootScope.backButtonPressedOnceToExit) {
						navigator.app.exitApp();
					} else {
						$rootScope.backButtonPressedOnceToExit = true;
						if (typeof showSnabbar !== 'undefined') {
							showSnabbar($scope.MLanguages ? $scope.translate('PRESS_BACKBUTTON_AGAIN_TO_EXIT') : "Press back button again to exit");
						}
						setTimeout(function() {
							$rootScope.backButtonPressedOnceToExit = false;
						}, 2000);
					}
				} else if (stateName=="sideMenu.searchBusinesses" || stateName == "restaurantSearch") {
					if ($rootScope.getLogState() && NEW_FEATURES.MULTI_ADDRESS && !$state.includes("restaurantSearch")) {
						if ($rootScope.backButtonPressedOnceToExit) {
							navigator.app.exitApp();
						} else {
							$rootScope.backButtonPressedOnceToExit = true;
							if (typeof showSnabbar !== 'undefined') {
								showSnabbar($scope.MLanguages ? $scope.translate('PRESS_BACKBUTTON_AGAIN_TO_EXIT') : "Press back button again to exit");
							}
							setTimeout(function() {
								$rootScope.backButtonPressedOnceToExit = false;
							}, 2000);
						}
					} else {
						var order = gOrder.getData();
						order.position = null;
						gOrder.setData(order);
						$state.go('sideMenu.homeScreen');
					}
				} else {
					if (stateName.toLowerCase().indexOf('sidemenu') !== -1 || stateName == 'mobileDetailRest') {
						if ($state.includes("restaurantSearch") != undefined) {
							if ($rootScope.getLogState() && !NEW_FEATURES.MULTI_ADDRESS && stateName != 'mobileDetailRest') 
								$state.go("sideMenu.homeScreen");
							else
								if (ADDONS.single_business)
									$state.go('sideMenu.homeScreen'); 
								else	
									$state.go(NEW_FEATURES.MULTI_ADDRESS ? 'sideMenu.searchBusinesses' : 'restaurantSearch');
						} else {
							if ($rootScope.getLogState()) {
								$state.go('sideMenu.homeScreen');
							} else {
								$state.go(NEW_FEATURES.MULTI_ADDRESS ? 'sideMenu.searchBusinesses' : 'restaurantSearch');
							}
						}
					} else {
						if ($ionicHistory.backView()) {
							$ionicHistory.goBack(); 
						} else {
							if (stateName == "signUp" && $state.includes("restaurantSearch") != undefined ) {
								$state.go('sideMenu.homeScreen'); 
							}
							if (gOrder.getData().position) {
								if (ADDONS.single_business)
									$state.go( 'sideMenu.restDetail'); 
								else
									$state.go(NEW_FEATURES.MULTI_ADDRESS ? 'sideMenu.searchBusinesses' : 'restaurantSearch');
							} else {
								$state.go('sideMenu.homeScreen'); 
							}
						}
					}
				}
			}, 101);
		});
		
		$rootScope.$on('$locationChangeStart', function(event, current, old) {
			Ordering.configs.all({
				mode: 'dictionary'
			}, function (res) {
				if (!res.error) {
					$rootScope.settings = res.result;
					if (res.result['format_time']) TIME_FORMAT_24 = res.result['format_time'].value=="24"?true:false;
					if (res.result['format_number_decimal_length']) DECIMAL.length = res.result['format_number_decimal_length'].value;
					if (res.result['format_number_decimal_separator']) DECIMAL.separator = res.result['format_number_decimal_separator'].value;
					if (res.result['format_number_thousand_separator']) THOUSAND_SEPARATOR = res.result['format_number_thousand_separator'].value=='space'?' ':res.result['format_number_thousand_separator'].value;
					if (res.result['facebook_login']) ADDONS.facebook_login = (res.result['facebook_login']).value == "true" ? true : false;
					if (res.result['front_version'] && ADDONS.web_template) {
						var local_last_version = localStorage.getItem('last_from_version');
						if (!local_last_version && res.result['front_version'].value) {
							local_last_version = res.result['front_version'].value
							localStorage.setItem('last_from_version', $rootScope.settings['front_version'].value);
						}
						if ((!local_last_version && res.result['front_version'].value != FRONT_VERSION) || (local_last_version && local_last_version != res.result['front_version'].value )) {
							var interval_language = setInterval(function () {
								if (Object.keys($rootScope.MLanguages).length > 0) {
									clearInterval(interval_language);
									MyAlert.confirm($rootScope.translate('QUESTION_NEW_VERSION'), $scope.translate('YES'), $scope.translate('NO')).then(function (res) {
										localStorage.setItem('last_from_version', $rootScope.settings['front_version'].value);
										location.reload();
									});
								}
							}, 50);
						}
					}
					if (res.result['business_multi_owners_module']) ADDONS.business_multi_owners_module = (res.result['business_multi_owners_module']).value == true ? true : false;
					if (res.result['terms_and_conditions']) SETTINGS.terms_and_conditions = (res.result['terms_and_conditions']).value == "true" ? true : false;
					if (res.result['terms_and_conditions_url']) SETTINGS.terms_and_conditions_url = res.result['terms_and_conditions_url'].value;
					if (res.result['notification_toast']) NOTIFICATION_TOAST = res.result['notification_toast'].value;
					if (res.result['advanced_product_options']) {
						ADDONS.quantity_options = res.result['advanced_product_options'];
					}
					if (res.result['security_recaptcha_site_key']) {
						$rootScope.features.recaptcha.site_key = res.result['security_recaptcha_site_key'].value;
					}
					if (res.result['security_recaptcha_auth']) {
						$rootScope.features.recaptcha.auth_required = res.result['security_recaptcha_auth'].value == '1';
					}
					if (res.result['security_recaptcha_signup']) {
						$rootScope.features.recaptcha.signup_required = res.result['security_recaptcha_signup'].value == '1';
					}
					if (res.result['project_fix_order_summary']) {
						$rootScope.constants.fix_order_summary = res.result['project_fix_order_summary'].value == '1';
					} else {
						$rootScope.constants.fix_order_summary = true;
					}
					if ($rootScope.features.recaptcha.site_key && ($rootScope.features.recaptcha.auth_required || $rootScope.features.recaptcha.signup_required)) {
						window.recaptchaInit = function() {
							$scope.$apply(function () {
								$rootScope.features.recaptcha.ready = true;
							})
						};
						(function(d, s, id) {
							var js, fjs = d.getElementsByTagName(s)[0];
							if (d.getElementById(id)) {return;}
							js = d.createElement(s); js.id = id;
							js.src = "https://www.google.com/recaptcha/api.js?onload=recaptchaInit&render=explicit";
							fjs.parentNode.insertBefore(js, fjs);
						} (document, 'script', 'recaptcha'));
					}
					// if (res.result['lazy_load_products_when_necessary']) NEW_FEATURES.BUSINESS_PAGE = res.result['lazy_load_products_when_necessary'].value == '1';
					// else NEW_FEATURES.BUSINESS_PAGE = false;
					if (res.result.facebook_id && res.result.facebook_id.value) {
						if (ADDONS.facebook_login) {
							window.fbAsyncInit = function() {
								FB.init({
									appId      : res.result.facebook_id.value,
									cookie     : false,
									xfbml      : true,
									version    : 'v5.0'
								});
								FB.AppEvents.logPageView();
								$scope.features.facebook_login.ready = true;
							};
							(function(d, s, id) {
								var js, fjs = d.getElementsByTagName(s)[0];
								if (d.getElementById(id)) {return;}
								js = d.createElement(s); js.id = id;
								js.src = "https://connect.facebook.net/en_US/sdk.js";
								fjs.parentNode.insertBefore(js, fjs);
							} (document, 'script', 'facebook-jssdk'));
						}
						$scope.features.facebook_sms.ready = false;
						//	Removed, Twilio could be a workaround to implement phone login
						// AccountKit_OnInteractive = function() {
						// 	AccountKit.init({
						// 		appId: res.result.facebook_id.value, 
						// 		state: "3748293884hudwhchwd394dh93djjd78", 
						// 		version: "v1.1",
						// 		fbAppEventsEnabled: true,
						// 		debug: true
						// 	});
						// 	$scope.features.facebook_sms.ready = true;
						// };
						//	Removed, Twilio could be a workaround to implement phone login
						// (function(d, s, id) {
						// 	var js, fjs = d.getElementsByTagName(s)[0];
						// 	if (d.getElementById(id)) {return;}
						// 	js = d.createElement(s); js.id = id;
						// 	js.src = "https://sdk.accountkit.com/en_US/sdk.js";
						// 	fjs.parentNode.insertBefore(js, fjs);
						// } (document, 'script', 'accountkit-jssdk'));
					}
				}
			});

			var path = WEB_ADDONS.remove_hash?location.pathname:location.hash.split('#')[1];
			var path_old = current.split(location.origin+(WEB_ADDONS.remove_hash?'':'/#'))[1];
			if (path && path_old && path.split('/')[1].split('?')[0] == path_old.split('/')[1].split('?')[0] && $location.search().product) {
				return;
			}
			window.parent.postMessage({ event: 'url', data: current }, '*');
			onChangePage();
			$rootScope.refreshReviews();
		});
		$rootScope.$on('$stateChangeStart', function(ev, to, toParams, from, fromParams) {
			if (NEW_FEATURES.MULTI_ADDRESS) {
				$rootScope.refreshCurUserAddress();
				gAddress.onChange(null);
			}
		});
		$rootScope.$on('$stateChangeSuccess', function(ev, to, toParams, from, fromParams) {
			document.body.scrollTop = document.documentElement.scrollTop = 0;
		});
		$rootScope.$on("$ionicView.enter", function() {
			// console.log($state.current.name);
			// if (NEW_FEATURES.MULTI_ADDRESS) {
			// 	if (["sideMenu.searchBusinesses"].indexOf($state.current.name) == -1) {
			// 		gAddress.onChange(null);
			// 	}
			// 	$rootScope.refreshCurUserAddress();
			// }
		});
		$rootScope.getUtilities = function () {
			return {
				MyLoading: MyLoading,
				MyAlert: MyAlert,
				Ordering: Ordering,
				ionicScrollDelegate: $ionicScrollDelegate
			};
		}

		$rootScope.getNgDependency = function (name) {
			return $injector.get(name);
		}
		if (ADDONS.use_segment) {
			var segment = $rootScope.getNgDependency('segment')
		}
		function refreshGUI() {

		}

		refreshGUI();

		//no-internet
		$rootScope.netModalState = false;
		MyModal.showTemplate('templates/'+ADDONS.template+'/views/no-connection.html', {
			scope: $rootScope,
			backdropClickToClose: false
		}).then(function(modal_no_connection) {
			modal_no_connection.scope.trying = false;
			modal_no_connection.scope.retry = function () {
				modal_no_connection.scope.trying = true;
			}
			modal_no_connection.scope.close = function () {
				modal_no_connection.scope.trying = true;
				modal_no_connection.hide();
				if (ADDONS.web_template) location.reload();
				$rootScope.netModalState = false;
			}
			$rootScope.modal_no_connection = modal_no_connection;
		});
		$rootScope.showNoConnection = function () {
			if (!$rootScope.MLanguages.OK) {
				$rootScope.MLanguages = {};
                $rootScope.MLanguages.MOBILE_FRONT_CONNECTION_LOST = 'Connection lost';
                $rootScope.MLanguages.MOBILE_FRONT_TAP_TO_RETRY = 'Tap to retry';
			}
			$rootScope.modal_no_connection.show().then(function () {
				MyLoading.hide();
				
				$rootScope.netModalState = true;
				
				var checkConnection = setInterval(function () {
					var isOnLine = navigator.onLine;
					if (isOnLine) {
						clearInterval(checkConnection);
						$rootScope.modal_no_connection.scope.close();
						if (!$rootScope.MLanguages.OK) {
							$rootScope.getLanguage(function () {});
						}
					}
					$rootScope.modal_no_connection.scope.trying = false;
				}, 5000);
			});
		};
		
		setInterval(function() {
			var isOnLine = navigator.onLine;
			if (!isOnLine && !$rootScope.netModalState) {
				$rootScope.showNoConnection();
			} 
		}, 5000);

		Analytics.pageView();
		$rootScope.DECIMAL = DECIMAL;
		LOGIN_STATE = gUser.getData().id > 0;
		$scope.ADDONS = ADDONS;
		$rootScope.SEARCH_BY_ADDRESS = SEARCH_BY_ADDRESS;
		$rootScope.CURRENCY_POSITION = CURRENCY_POSITION;
		$rootScope.TUTORIAL_SUPER = TUTORIAL_SUPER;
		$rootScope.TUTORIAL_BUSINESS = TUTORIAL_BUSINESS;
		$rootScope.SUPPORT_PRO_PACKAGE = SUPPORT_PRO_PACKAGE;
		$rootScope.SUPPORT_ADVANCED_PACKAGE = SUPPORT_ADVANCED_PACKAGE;
		$rootScope.SUPPORT_SECTION = SUPPORT_SECTION;
		$scope.state = {
			loginState : LOGIN_STATE
		};
		$rootScope.MLanguages = {};
		$scope.MLanguages = {};

		$rootScope.myOrder = {
			curAddress: (gNearService.getData().nearAddress)?gNearService.getData().nearAddress:''
		};
		$rootScope.curDataOrder = {
			type: (gNearService.getData().orderType)?gNearService.getData().orderType:'delivery',
			address: $rootScope.myOrder.curAddress
		};

		$scope.layout = ADDONS.web_template?'main.':'';

		$scope.numCart = 0;
		$rootScope.side_menu = 'left';

		var cur_arabic_rtl = localStorageApp.getItem(STORE.RTL)
		$interval(function () {
			var should_rtl = localStorageApp.getItem(STORE.RTL) == 'true';
			if (localStorageApp.getItem(STORE.LANG_CODE) && ($scope.cur_lang != localStorageApp.getItem(STORE.LANG_CODE) || should_rtl)) {
				$scope.cur_lang = localStorageApp.getItem(STORE.LANG_CODE);
				$rootScope.cur_lang = localStorageApp.getItem(STORE.LANG_CODE);
				if (localStorageApp.getItem(STORE.RTL) == 'true') {
					$scope.arabic_rtl = true;
					$rootScope.arabic_rtl = true;
					if (!cur_arabic_rtl && !$rootScope.tutorialON) {
						cur_arabic_rtl = true;
						$state.reload();
					}
				} else {
					$scope.arabic_rtl = false;
					$rootScope.arabic_rtl = false;
				}
			}
		}, 100);

		$rootScope.checkGPS = function (callback) {
			if (ADDONS.web_template) return callback(true);
			if (typeof cordova == 'undefined' || !cordova) return callback(true);
			cordova.plugins.locationAccuracy.isRequesting(function (requesting) {
				if (!requesting) {
					cordova.plugins.locationAccuracy.canRequest(function(canRequest){
						if (canRequest) {
							cordova.plugins.locationAccuracy.request(function name(res) {
								if (device.platform == 'iOS') $rootScope.checkGPS(callback);
								else callback(true);
							}, function (res) {
								callback(false);
							}, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
						} else {
							cordova.plugins.diagnostic.getLocationAuthorizationStatus(function(status){
								switch(status){
									case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
										cordova.plugins.diagnostic.requestLocationAuthorization(function(status){
											switch(status){
												case cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
												case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
												case cordova.plugins.diagnostic.permissionStatus.DENIED:
													callback(false);
													break;
													case cordova.plugins.diagnostic.permissionStatus.GRANTED:
												case cordova.plugins.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE:
													$rootScope.checkGPS(callback);
													break;
											}
										}, function(error) {
											callback(false);
										}, cordova.plugins.diagnostic.locationAuthorizationMode.WHEN_IN_USE);
										break;
									case cordova.plugins.diagnostic.permissionStatus.DENIED:
										callback(false);
										break;
									case cordova.plugins.diagnostic.permissionStatus.GRANTED:
									case cordova.plugins.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE:
										callback(true);
										break;
								}
							}, function(error){
								callback(false);
							});
						}
					});
				}
			});
		}

		/*newvariable-rootCtrl*/

		$rootScope.refreshCurUserAddress = function (cb) {
			if (gUser.getData().id > 0) {
				Ordering.users.addresses.all({
					user_id: gUser.getData().id,
					where: [
						{
							attribute: 'default',
							value: true
						}
					]
				}, function (res) {
					if (!res.error && res.result.length > 0) {
						var curAddress = gAddress.getData();
						if (curAddress == 'null' || !curAddress || curAddress.id) {
							gAddress.setData(res.result[0], true);
							$scope.sharedData.curAddress = res.result[0];
						} else {
							$scope.sharedData.curAddress = curAddress;
						}
					}
					if (cb) cb();
				});
			}
		}

		$rootScope.refreshCurUserAddress();

		$rootScope.getReviews = function (cb) {
			if (!gUser.getData().id || gUser.getData().id == -1) return;
			Ordering.users.reviews({
				id: gUser.getData().id
			}, function (res) {
				if (!res.error) {
					cb(res.result);
				} else cb([]);
			});
		}

		$rootScope.reviewStatus = {};
		$rootScope.reviewStatus.pending = 0;

		$rootScope.refreshReviews = function () {
			$rootScope.getReviews(function (reviewStatus) {
				$rootScope.reviewStatus = {};
				$rootScope.reviewStatus.pending = 0;
				for (var i = 0; i < reviewStatus.length; i++) {
					if (!reviewStatus[i].reviewstatus) $rootScope.reviewStatus.pending++;
					$rootScope.reviewStatus[reviewStatus[i].id] = reviewStatus[i].reviewstatus;
				}
			});
		}

		$rootScope.refreshReviews();

		$rootScope.getWidthRating = function (reviews, is_list, id) {
			var ratingWidth = $('.rating .base').width();
			var starWidth = $('.rating').children('.base').children().width();
			if (is_list) {
				ratingWidth = $('.rating.'+id+' .base').width();
				starWidth = $('.rating.'+id).children('.base').children().width();
			}
			var offset = (ratingWidth-starWidth*5)/4;
			var ratio = reviews/5;
			var width = (starWidth*5*ratio)+(offset*Math.floor(reviews));
			if (width > ratingWidth) width = ratingWidth;
			return width;
		}

		$rootScope.refreshNumCart = function () {
			$scope.numCart = 0;
			for (var i = 0; i < gCart.getData().length; i++) {
				$scope.numCart += gCart.getData()[i].quantity;
			}
			$rootScope.numCart += $scope.numCart;
		}

		// Getting Order Status as String
		$rootScope.getOrderState = function (num) {
			//console.log(num);
			switch (num) {
				case 0:
					return $scope.translate('ORDER_STATUS_PENDING');
				case 1:
					return $scope.translate('ORDERS_COMPLETED');
				case 2:
					return $scope.translate('ORDER_REJECTED');
				case 3:
					return $scope.translate('ORDER_STATUS_IN_BUSINESS');
				case 4:
					return $scope.translate('ORDER_READY');
				case 5:
					return $scope.translate('ORDER_REJECTED_RESTAURANT');
				case 6:
					return $scope.translate('ORDER_STATUS_CANCELLEDBYDRIVER');
				case 7:
					return $scope.translate('ORDER_STATUS_ACCEPTEDBYRESTAURANT');
				case 8:
					return $scope.translate('ORDER_CONFIRMED_ACCEPTED_BY_DRIVER');
				case 9:
					return $scope.translate('ORDER_PICKUP_COMPLETED_BY_DRIVER');
				case 10:
					return $scope.translate('ORDER_PICKUP_FAILED_BY_DRIVER');
				case 11:
					return $scope.translate('ORDER_DELIVERY_COMPLETED_BY_DRIVER');
				case 12:
					return $scope.translate('ORDER_DELIVERY_FAILED_BY_DRIVER');
				case 13:
					return $scope.translate('PREORDER');
				case 14:
					return $scope.translate('ORDER_NOT_READY');
				case 15:
					return $scope.translate('ORDER_PICKEDUP_COMPLETED_BY_CUSTOMER');
				case 16:
					return $scope.translate('ORDER_STATUS_CANCELLED_BY_CUSTOMER');
				case 17:
					return $scope.translate('ORDER_NOT_PICKEDUP_BY_CUSTOMER');
				case 18:
					return $scope.translate('ORDER_DRIVER_ALMOST_ARRIVED_BUSINESS');
				case 19:
					return $scope.translate('ORDER_DRIVER_ALMOST_ARRIVED_CUSTOMER');
				case 20:
					return $scope.translate('ORDER_CUSTOMER_ALMOST_ARRIVED_BUSINESS');
				case 21:
					return $scope.translate('ORDER_CUSTOMER_ARRIVED_BUSINESS');
				default:
					return "N/A";
			}
		};
		$rootScope.getOrderTypeAllowed = function (num) {
			switch (num) {
				case 1:
					return $scope.translate('DELIVERY');
				case 2:
					return $scope.translate('PICKUP');
				case 3:
					return $scope.translate('EATIN');
				case 4:
					return $scope.translate('CURBSIDE');
				case 5:
					return $scope.translate('DRIVE_THRU');
				default:
					return "N/A";
			}
		};
		$rootScope.refreshNotifications = function (alert) {
			if (GCM_DEVICE_TOKEN != ''){
				var device_kind = 0;
				if (ionic.Platform.isIOS()){
					device_kind = 1;
				}else{
					device_kind = 0;
				}
				Ordering.notifications.add({
					user_id: gUser.getData().id,
					token: GCM_DEVICE_TOKEN,
					app: APP_ID
				}, function (res) {
					if (!res.error && alert) MyAlert.show($scope.translate('NOTIFICATIONS_RESET_SUCCESSFULLY'));
					if (res.error) MyAlert.show(res.result);
				});
			}
		}

		$rootScope.resetDeviceToken = function () {
			if (GCM_DEVICE_TOKEN != '') {
				var device_kind = 0;
				if (ionic.Platform.isIOS()){
					device_kind = 1;
				} else {
					device_kind = 0;
				}
			}
        };

        $rootScope.tryNotification = function () {
			if (GCM_DEVICE_TOKEN != '') {
				var device_kind = 0;
				if (ionic.Platform.isIOS()){
					device_kind = 1;
				} else {
					device_kind = 0;
				}
			}
		}

		$rootScope.getCurrencySymbol = function (currency_str) {
			return getCurrencySymbol(currency_str);
		}

		$rootScope.refreshNumCart();
		$rootScope.onCart = function () {
			if (gCart.getData().length > 0) {
				$state.go('main.checkOut');
			}
		}

		$rootScope.getLanguage = function (callback) {
			var lang = localStorageApp.getItem(STORE.LANG_CODE);
			var dictionary = localStorageApp.getItem(STORE.DICTIONARY);
			var lang_list = localStorageApp.getItem(STORE.LANG_LIST);
			var lang_reset = localStorageApp.getItem(STORE.LANG_RESET);
			var date = new Date().toLocaleString('en-US', {timeZone: gBusiness.getData().timezone});
			date = new Date(date);
			if (!lang || !dictionary || !lang_list || !lang_reset || lang_reset < date.getTime()) {
				Ordering.languages.all({}, function (res) {
					if (!res.error) {
						for (var i = 0; i < res.result.length; i++) {
							if (res.result[i].default) {
								if (!lang) {
									localStorageApp.setItem(STORE.LANG, res.result[i].id);
									localStorageApp.setItem(STORE.LANG_CODE, res.result[i].code);
									localStorageApp.setItem(STORE.RTL, res.result[i].rtl);
									$scope.cur_lang = res.result[i].code;
									$rootScope.cur_lang = lang;
								}
								var languages = [];
								for (var j = 0; j < res.result.length; j++) {
									if (res.result[j].enabled || res.result[i].default) languages.push(res.result[j]);
								}
								$scope.arabic_rtl = res.result[i].rtl;
								$rootScope.arabic_rtl = res.result[i].rtl;
								$scope.side_menu = !res.result[i].rtl?'left':'right';
								$rootScope.side_menu = !res.result[i].rtl?'left':'right';
								$rootScope.languages = languages;
								$rootScope.cur_lang = lang;
								$scope.cur_lang = lang;
								Ordering.translations.all({ mode: 'dictionary' }, function (res) {
									if (!res.error) {
										localStorageApp.setItem(STORE.DICTIONARY, JSON.stringify(res.result));
										localStorageApp.setItem(STORE.LANG_LIST, JSON.stringify(languages));
										var date = new Date().toLocaleString('en-US', {timeZone: gBusiness.getData().timezone});
										date = new Date(date);
										localStorageApp.setItem(STORE.LANG_RESET, (date.getTime()+1000*60*5));
										$scope.MLanguages = res.result;
										$rootScope.MLanguages = res.result;
										$rootScope.currency = res.result['Panel_Currency'];
										$rootScope.order_types = [
											{ name: $scope.translate('MOBILE_FRONT_VISUALS_DELIVERY'), value: '1' },
											{ name: $scope.translate('MOBILE_FRONT_VISUALS_PICKUP'), value: '2' },
											{ name: $scope.translate('EATIN'), value: '3' },
											{ name: $scope.translate('CURBSIDE'), value: '4' },
											{ name: $scope.translate('DRIVE_THRU'), value: '5' },
										];
										$scope.order_types = $rootScope.order_types;
										if (!localStorageApp.getItem(STORE.TUTORIAL)) $rootScope.showTutorial();
										if ($scope.MLanguages.GM_API_KEY && $scope.MLanguages.GM_API_KEY != '') GM_API_KEY = $scope.MLanguages.GM_API_KEY;
										loadGoogleMaps(GM_API_KEY);
										callback(null, languages, res.result);
									}
								}, null, true);
								break;
							}
						}
					}
				}, null, true);
			} else {
				$rootScope.languages = JSON.parse(lang_list);
				$rootScope.cur_lang = lang;
				$scope.cur_lang = lang;
				$scope.arabic_rtl = localStorageApp.getItem(STORE.RTL) == 'true';
				$rootScope.arabic_rtl = localStorageApp.getItem(STORE.RTL) == 'true';
				$scope.side_menu = localStorageApp.getItem(STORE.RTL) == 'true'?'right':'left';
				$rootScope.side_menu = localStorageApp.getItem(STORE.RTL) == 'true'?'right':'left';
				$scope.MLanguages = JSON.parse(dictionary);
				$rootScope.MLanguages = JSON.parse(dictionary);
				$rootScope.currency = JSON.parse(dictionary)['Panel_Currency'];
				CURRENCY = $scope.MLanguages.Panel_Currency;
				$rootScope.order_types = [
					{ name: $scope.translate('MOBILE_FRONT_VISUALS_DELIVERY'), value: '1' },
					{ name: $scope.translate('MOBILE_FRONT_VISUALS_PICKUP'), value: '2' },
					{ name: $scope.translate('EATIN'), value: '3' },
					{ name: $scope.translate('CURBSIDE'), value: '4' },
					{ name: $scope.translate('DRIVE_THRU'), value: '5' },
				];
				$scope.order_types = $rootScope.order_types;
				if ($scope.MLanguages.GM_API_KEY && $scope.MLanguages.GM_API_KEY != '') GM_API_KEY = $scope.MLanguages.GM_API_KEY;
				loadGoogleMaps(GM_API_KEY);
				callback(null, JSON.parse(lang_list), JSON.parse(dictionary));
			}
		}

		$rootScope.selectLanguage = function (id, code, rtl) {
			localStorageApp.setItem(STORE.LANG, id);
			localStorageApp.setItem(STORE.LANG_CODE, code);
			localStorageApp.setItem(STORE.LANG_RESET, 0);
			localStorageApp.setItem(STORE.RTL, rtl);
			location.reload();
		}

		$rootScope.selectLanguageByCode = function (code, cb) {
			for (var i = 0; i < $rootScope.languages.length; i++) {
				if ($rootScope.languages[i].code == code) {
					localStorageApp.setItem(STORE.LANG, $rootScope.languages[i].id);
					localStorageApp.setItem(STORE.LANG_CODE, $rootScope.languages[i].code);
					localStorageApp.removeItem(STORE.LANG_RESET);
					MyLoading.show($scope.translate('LOADING')+'...');
					$scope.getLanguage(function () {
						MyLoading.hide();
						if (cb) cb();
					});
					break;
				}
			}
		}

		$rootScope.loadGoogleMaps = function (callback, libs) {
			var interval = setInterval(function () {
				if (typeof google != 'undefined' && (!libs || typeof MarkerWithLabel != 'undefined')) {
					clearInterval(interval);
					callback();
				}
			}, 100);
		}

		$rootScope.getLogState = function () {
			return gUser.isLogged();
		};

		$rootScope.onGoHomeScreen = function() {
			if (!LOGIN_STATE) $state.go(app_states.homeScreen)
			else {
				var defaultAddress = gAddress.getData();
				if (defaultAddress && defaultAddress != 'null') {
					var order = gOrder.getData();
					order.type = DEFAULT_ORDER_TYPE=='delivery'?'1':'2';
					gOrder.setData({
						address: defaultAddress.address,
						position: defaultAddress.location,
						lat: defaultAddress.location.lat,
						lng: defaultAddress.location.lng,
						type: order.type?order.type:"1",
						business_slug: order.business_slug
					});
					var searchData = { 'order_type': (gOrder.getData().type==1)?'delivery':'pickup', 'address': gOrder.getData().position.lat+','+gOrder.getData().position.lng };
					if (ADDONS.web_template) {
						e.preventDefault();
						$state.go('main.search', searchData);
					} else {
						setTimeout(function(){
							if (ADDONS.single_business) {
								$state.go('sideMenu.restDetail');
							} else {
								$state.go(NEW_FEATURES.MULTI_ADDRESS?'sideMenu.searchBusinesses':app_states.homeScreen, searchData, { animation: 'no-animation' });
							}
						}, 1);
					}
				} else {
					if (ADDONS.single_business) 
						$state.go('sideMenu.restDetail');
					else
						$state.go(app_states.homeScreen);
				}
			}
		}

		$rootScope.onOpenExternal = function(url) {
			window.open(url, '_system')
		}

		$rootScope.onGoHome = function() {
			$rootScope.homeRequired = true;
			$state.go(app_states.homeScreen);
		};

		$rootScope.onGoAddress = function () {
			$state.go('sideMenu.addresses');
		}

		$rootScope.onGoSettings = function () {
			$state.go('sideMenu.setting');
		}

		$rootScope.onGoLogin = function(){
			if (gStates.getState() != STATE.ORDERING) gStates.setState(STATE.PROFILE);
			if (!LOGIN_STATE){
				if (ADDONS.web_template) $state.go('main.login');
				else $state.go('signUp');
			}else {
				$ionicHistory.nextViewOptions({
					disableBack: true
				});
				$state.go(app_states.profile);
			}
		};
		$rootScope.onGoForgotPassword = function($event) {
			$event.preventDefault();
			if (ADDONS.web_template) $state.go('main.forgot_password');
			else {
				$state.go('forgot_password');
				onChangePage();
			}
		};

		$rootScope.showTutorial = function () {
			if (ADDONS.web_template || !SHOW_TUTORIAL) {
				$rootScope.tutorialON = false;
				return;
			}
			MyModal.showTemplate('templates/'+ADDONS.template+'/views/tutorial-popup.html',{
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function(modal_tutorial){
				modals.push(modal_tutorial);
				$scope.modal_tutorial = modal_tutorial;
				$scope.modal_tutorial.show().then(function () {
					var userAgent = new UAParser();
				    $scope.device = userAgent.getDevice().type;
				    if (!$scope.device) $scope.device = 'mobile';
					$scope.slides = [
				        {
							image: $scope.rootTheme+'/img/'+$scope.device+'/slide1.jpg',
							title: $scope.translate('DELIVERY_BY_ADDRESS'),
							instructions : $scope.translate('DELIVERY_BY_ADDRESS_INST')
				        },
				        {
							image: $scope.rootTheme+'/img/'+$scope.device+'/slide2.jpg',
							title: $scope.translate('SELECT_A_BUSINESS'),
							instructions : $scope.translate('SELECT_A_BUSINESS_INST')
				        },
				        {
							image: $scope.rootTheme+'/img/'+$scope.device+'/slide3.jpg',
							title: $scope.translate('BUSINESS_MENU'),
							instructions : $scope.translate('BUSINESS_MENU_INST')
				        },
				        {
							image: $scope.rootTheme+'/img/'+$scope.device+'/slide4.jpg',
							title: $scope.translate('PRODUCT_LIST'),
							instructions : $scope.translate('PRODUCT_LIST_INST')
				        },
				        {
							image: $scope.rootTheme+'/img/'+$scope.device+'/slide5.jpg',
							title: $scope.translate('CHECKOUT_SCREEN'),
							instructions : $scope.translate('CHECKOUT_SCREEN_INST')
				        },
				        {
							image: $scope.rootTheme+'/img/'+$scope.device+'/slide6.jpg',
							title: $scope.translate('TUTORIAL_ORDER_COMPLETED'),
							instructions : $scope.translate('TUTORIAL_ORDER_COMPLETED_INST')
				        },
				    ];
				    modal_tutorial.scope.skip = function () {
				    	localStorageApp.setItem(STORE.TUTORIAL,gUser.getData().id);
						modal_tutorial.hide();
						modal_tutorial.remove();
						$rootScope.tutorialON = false;
					}
				});
			});
		}
		
		$rootScope.customPages = [];
		$rootScope.getPages = function(){
			Ordering.pages.all({
				params: 'name,slug,enabled'
			}, function (res) {
				if (!res.error) {
					$rootScope.customPages = res.result;
				} else MyAlert.show(res.result)
			})
		}
		$rootScope.getPages()
		$rootScope.goCustomPage = function (slug) {
			location.href = (!WEB_ADDONS.remove_hash?'#':'')+'/pages/'+slug
		}
		$rootScope.onGoMyProfile = function(tab, $event){
			if ($event) $event.stopPropagation();
			if (!tab) tab = 0;
			if (gStates.getState() != STATE.ORDERING) gStates.setState(STATE.PROFILE);
			if (!LOGIN_STATE){
				if (gStates.getState() != STATE.ORDERING) gStates.setState(STATE.PROFILE);
				$state.go($scope.layout+'signUp');
			}else {
				$ionicHistory.nextViewOptions({
					disableBack: true
				});
				$state.go(app_states.profile, { 'tab': tab });
			}
		};
		$rootScope.goSignupBusiness = function () {
			gStates.setState(STATE.SIGNUP_BUSINESS)
			$state.go($scope.layout+'signUpBusiness');
		}
		$rootScope.driverManager = function () {
			return gUser.getData().level == 5;
		};
		$rootScope.onSignOut = function (isDelete) {
			LOGIN_STATE = false;
			$scope.state.loginState = LOGIN_STATE;
			if (!isDelete) Ordering.users.logout({ token_notification: localStorage.getItem('token_notification') }, function (res) {$rootScope.getPages()});
			localStorage.removeItem('token_notification');
			localStorageApp.removeItem(STORE.TOKEN);
			var buff = {};
			gUser.setData(buff);
			gAddress.setData(null);
			if (ADDONS.web_template) {
				$rootScope.editorAvilable = false;
				$rootScope.editMode = false;
				$rootScope.superAdmin = false;
				$state.go(app_states.homeScreen);
			} else {
				if ($ionicSideMenuDelegate.isOpen(true))
					$ionicSideMenuDelegate.toggleLeft();

				$ionicHistory.nextViewOptions({
					historyRoot: true,
					disableAnimate: true,
					expire: 300
				});
				$state.go(app_states.homeScreen);
			}
			if (typeof facebookConnectPlugin != 'undefined') {
				facebookConnectPlugin.logout();
			}
		}

		$rootScope.showModalImage = function (image, title, e) {
			if (e) e.stopPropagation();
			$scope.curImageZoom = image;
			$scope.curImageTitle = title;
			if ($scope.modalimage) $scope.modalimage.remove();
			MyModal.showTemplate('templates/'+ADDONS.template+'/views/image-popup.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function(modal) {
				modals.push(modal);
				$scope.modalimage = modal;
				$scope.modalimage.show().then(function () {});
				$scope.$on('modal.hidden', function() {});
			});
		};

		$rootScope.hideModalImage = function () {
			if ($scope.modalimage) {
				$scope.modalimage.hide();
				$scope.modalimage.remove();
			}
		};

		var users = {};
		var lastMobile = "";
		$rootScope.searchByMobile = function (mobile, id, order_data) {
			if (mobile && mobile.length >= 3) {
				$("#"+id+" + .autocomplete").show();
				$("#"+id+" + .autocomplete").css({
					width: $("#"+id).outerWidth(),
					top: $("#cellphone-input").parent('div').position().top-10,
					marginBottom: '50px'
				});
				if (!ADDONS.pickup) {
					$("#"+id+" + .autocomplete").css({
						width: $("#"+id).outerWidth(),
						top: '38px',
						marginBottom: '50px'
					});
				}
				Ordering.orders.all({
					customer_phone: mobile,
					business_id: gBusiness.getData().id,
					mode: 'dashboard'
				}, function (res) {
					users = {};
					$("#"+id+" + .autocomplete").empty();
					for (var i = 0; i < res.result.length; i++) {
						if (!users[res.result[i].customer.cellphone]) {
							users[res.result[i].customer.cellphone] = [];
						}
						var exist = false;
						for (var j = 0; j < users[res.result[i].customer.cellphone].length; j++) {
							if (users[res.result[i].customer.cellphone][j].address == res.result[i].customer.address) {
								exist = true;
								break;
							}
						}
						if (!exist) {
							res.result[i].customer.id = res.result[i].customer_id;
							users[res.result[i].customer.cellphone].push(res.result[i].customer);
						}
					}
					for (var key in users) {
						if (users[key].length == 1) {
							$item = $('<div></div>')
								.addClass('autoitem')
								.text(users[key][0].cellphone+' ('+users[key][0].name+')')
								.attr('data-tel', users[key][0].cellphone)
								.attr('data-index', 0);
							$("#"+id+" + .autocomplete").append($item);
							$item.on('click', function () {
								var user = users[$(this).attr('data-tel')][$(this).attr('data-index')];
								$("#cellphone-input").val(users[$(this).attr('data-tel')][$(this).attr('data-index')].cellphone);
								var that = $(this);
								$scope.$apply(function () {
									$scope.curDataOrder.cellphone = user.cellphone;
									$scope.curDataOrder.address = user.address;
									order_data.address = user.address;
									order_data.position = $scope.getJson(user.location);
								});
								$("#"+id+" + .autocomplete").hide();
								gCreateOrderBuyer.setData(user);
							});
						} else {
							$item = $('<div></div>')
								.addClass('autoitem').addClass('autoitem title')
								.text(users[key][0].cellphone+' ('+users[key][0].name+')')
							$("#"+id+" + .autocomplete").append($item);
							for (var i = 0; i < users[key].length; i++) {
								$item = $('<div></div>')
									.addClass('autoitem').addClass('subitem')
									.text(users[key][i].address)
									.attr('data-tel', users[key][i].cellphone)
									.attr('data-index', i+"");
								$("#"+id+" + .autocomplete").append($item);
								$item.on('click', function () {
									var user = users[$(this).attr('data-tel')][$(this).attr('data-index')];
									$("#cellphone-input").val(user.cellphone);
									var that = $(this);
									$scope.$apply(function () {
										$scope.curDataOrder.cellphone = user.cellphone;
										$scope.curDataOrder.address = user.address;
										order_data.address = user.address;
										order_data.position = $scope.getJson(user.location);
									});
									$("#"+id+" + .autocomplete").hide();
									gCreateOrderBuyer.setData(user);
								});
							}
						}
					}
					$item = $('<div></div>')
						.addClass('autoitem')
						.text($scope.translate('CREATE_GUEST_CUSTOMER'));
					$item.on('click', function () {
						gCreateOrderBuyer.setData({
							id: -1
						});
						$("#"+id+" + .autocomplete").hide();
					});
					$("#"+id+" + .autocomplete").append($item);
					$("#"+id).off('blur');
					$("#"+id).on('blur', function () {});
				});
			} else {
				$("#"+id+" + .autocomplete").hide();
			}
		}

		if (ADDONS.web_template && ADDONS.powered_by_ordering) {
			$div = $('<div>Powered by <a style="color:#fff!important;font-weight:bold;" href="https://bit.ly/ordering-branding" target="_blank">www.ordering.co</a></div>');
			function asa33j34hj4hc9242dg() {
				var isi = navigator.userAgent.match(/iPad/i) != null;
				var position = 'absolute';
				if(isi && window.innerHeight < window.innerWidth){
					position = 'relative';
				}
				var css = {
					'z-index': '99999999',
					'position': NEW_FEATURES.FLEX_HEIGHT?'static':position,
					'padding': '5px 15px',
					'height': '30px',
					'color': '#fff',
					'bottom': 0,
					'margin-left': 'auto',
					'margin-right': 'auto',
					'left': 0,
					'right': 0,
					'margin-top': NEW_FEATURES.FLEX_HEIGHT?'-30px':0
				};
				if ($(window).width() > 480) {
					$('div.footer.container'+(NEW_FEATURES.FLEX_HEIGHT?'':'-fluid')).css(NEW_FEATURES.FLEX_HEIGHT?'padding-bottom':'bottom', '0');
					Object.assign(css, {
						'background': 'rgba(0,0,0,0.3)',
						'border-radius': '5px 5px 0 0',
						'text-align': 'center',
						'width': 230
					});
				} else {
					$('div.footer.container'+(NEW_FEATURES.FLEX_HEIGHT?'':'-fluid')).css(NEW_FEATURES.FLEX_HEIGHT?'padding-bottom':'bottom', '30px');
					Object.assign(css, {
						'background': 'rgb(0,0,0)',
						'border-radius': '0',
						'width': '100%'
					});
				}
				$div.css(css);
			}
			if (NEW_FEATURES.FLEX_HEIGHT) {
				var article = $('body article').first();
				if (article.length > 0) {
					// setTimeout(asa33j34hj4hc9242dg, 500);
					article.append($div);
					asa33j34hj4hc9242dg();
					$(window).resize(asa33j34hj4hc9242dg);
				} else {
					var checkArticle = setInterval(function () {
						var article = $('body article').first();
						if (article.length > 0) {
							clearInterval(checkArticle);
							article.append($div);
							asa33j34hj4hc9242dg();
							$(window).resize(asa33j34hj4hc9242dg);
						}
					}, 500);
				}
			} else {
				$('body').append($div);
				setTimeout(asa33j34hj4hc9242dg, 500);
				asa33j34hj4hc9242dg();
				$(window).resize(asa33j34hj4hc9242dg);
			}
		}

		$rootScope.getWeekdayName = function(idx) {
			var weekdayname = "";
			switch (idx) {
				case 1:
					weekdayname = $rootScope.translate('CONTROL_PANEL_BUSINESS_SCHEDULES_MONDAY');
					break;
				case 2:
					weekdayname = $rootScope.translate('CONTROL_PANEL_BUSINESS_SCHEDULES_TUESDAY');
					break;
				case 3:
					weekdayname = $rootScope.translate('CONTROL_PANEL_BUSINESS_SCHEDULES_WEDNESDAY');
					break;
				case 4:
					weekdayname = $rootScope.translate('CONTROL_PANEL_BUSINESS_SCHEDULES_THURSDAY');
					break;
				case 5:
					weekdayname = $rootScope.translate('CONTROL_PANEL_BUSINESS_SCHEDULES_FRIDAY');
					break;
				case 6:
					weekdayname = $rootScope.translate('CONTROL_PANEL_BUSINESS_SCHEDULES_SATURDAY');
					break;
				case 0:
					weekdayname = $rootScope.translate('CONTROL_PANEL_BUSINESS_SCHEDULES_SUNDAY');
					break;
			}
			return weekdayname
		}

		$rootScope.openPreorder = function (business, cb) {
			$scope.preorder_by_date = NEW_FEATURES.PREORDER;
			if (!ADDONS.preorder) return;
			$scope.curPreorder = {
				business_id: business.id,
				business_slug: business.slug,
				menu_id: -1,
				date: "",
				time: "",
				days: [],
				times: [],
				schedule: {},
			};
			$scope.unablePreorder = false;
			$scope.curBusiness = business;
			$scope.curMenu = null;
			$scope.getDays = function (menu) {
				var days = [];
				var date = new Date().toLocaleString('en-US', {timeZone: gBusiness.getData().timezone})
				date = new Date(date);
				date.setHours(0);
				date.setMinutes(0);
				date.setSeconds(0);
				date.setMilliseconds(0);
				var count = 0;
				while (days.length < MAX_DAYS_PREORDER && count < 100) {
					if (menu.schedule[date.getDay()].enabled) {
						if (getTimes(date.toString(), menu).length > 0) {
							var text = $scope.translate('DAY'+(date.getDay()!=0?date.getDay():7))+', '+$scope.translate('MONTH'+(date.getMonth()+1))+' '+date.getDate()+', '+date.getFullYear();
							days.push({
								text: text,
								value: date.toString()
							});
						}
					}
					count++;
					date = new Date(date.getTime()+(24*60*60*1000));
				}
				if (days.length == 0) {
					if (count == MAX_DAYS_PREORDER || count >= 7) {
						$scope.unablePreorder = true;
						return [];
					}
					date = new Date().toLocaleString('en-US', {timeZone: gBusiness.getData().timezone});
					date = new Date(date);
					date.setHours(0);
					date.setMinutes(0);
					date.setSeconds(0);
					date.setMilliseconds(0);
					while (days.length < MAX_DAYS_PREORDER) {
						if (getTimes(date.toString(), menu).length > 0) {
							var text = $scope.translate('DAY'+(date.getDay()!=0?date.getDay():7))+', '+$scope.translate('MONTH'+(date.getMonth()+1))+' '+date.getDate()+', '+date.getFullYear();
							days.push({
								text: text,
								value: date.toString()
							});
						}
						date = new Date(date.getTime()+(24*60*60*1000));
					}
				}
				return days
			}
			$scope.selectMenu = function (menu) {
				$scope.curPreorder.menu_id = menu.id;
				$scope.curPreorder.schedule = menu.schedule;
				$scope.curPreorder.menudays = menu.days;
				$scope.curMenu = menu;
				$scope.curPreorder.date = "";
				$scope.curPreorder.time = "";
				$scope.curPreorder.days = $scope.getDays(menu);
			}
			$scope.selectDate = function (date) {
				$scope.curPreorder.time = "";
				$scope.curPreorder.times = getTimes(date?date:$scope.curPreorder.date, $scope.preorder_by_date?business:$scope.curMenu);
				if ($scope.preorder_by_date && $scope.curPreorder.times) {
					$scope.curPreorder._times = []
					for (var i = 0; i < $scope.curPreorder.times.length; i++) {
						var element = $scope.curPreorder.times[i];
						var hour = element.text.split(':')[0];
						var meridian = '';
						if (TIME_FORMAT_24) {
							var minute = element.text.split(':')[1];
						} else {
							var minute = element.text.split(':')[1].split(' ')[0];
							var meridian = element.text.split(':')[1].split(' ')[1];
						}
						var exist = $scope.curPreorder._times.findIndex(function (time){
							return time.hour == hour;
						});
						if (exist == -1) {
							$scope.curPreorder._times.push({
								hour:  hour,
								minutes: [minute],
								meridian: meridian
							})
						} else {
							$scope.curPreorder._times[exist].minutes.push(minute)
						}
					}
					$scope._hour = $scope.curPreorder.times[0].text.split(':')[0];
					$scope._minute = TIME_FORMAT_24?$scope.curPreorder.times[0].text.split(':')[1]:$scope.curPreorder.times[0].text.split(':')[1].split(' ')[0];
					$scope._meridian = TIME_FORMAT_24?null:$scope.curPreorder.times[0].text.split(':')[1].split(' ')[1];
				}
			}
			function getTimes(curdate, menu) {
				var date = new Date().toLocaleString('en-US', {timeZone: gBusiness.getData().timezone});
				date = new Date(date);
				var dateSeleted = new Date(curdate);
				var times = [];
				for (var k = 0; k < menu.schedule[dateSeleted.getDay()].lapses.length; k++) {
					var open = {
						hour: menu.schedule[dateSeleted.getDay()].lapses[k].open.hour,
						minute: menu.schedule[dateSeleted.getDay()].lapses[k].open.minute
					}
					var close = {
						hour: menu.schedule[dateSeleted.getDay()].lapses[k].close.hour,
						minute: menu.schedule[dateSeleted.getDay()].lapses[k].close.minute
					}
					for (var i = open.hour; i <= close.hour; i++) {
						if (date.getDate() != dateSeleted.getDate() || i >= date.getHours()) {
							var hour = "";
							var meridian = "";
							if (TIME_FORMAT_24) hour = i<10?'0'+i:i;
							else {
								if (i == 0) {
									hour = '12';
									meridian = " "+$scope.translate('AM');
								} else if (i > 0 && i < 12) {
									hour = (i<10?'0'+i:i);
									meridian = " "+$scope.translate('AM');
								} else if (i == 12) {
									hour = "12";
									meridian = " "+$scope.translate('PM');
								} else {
									hour = ((i-12<10)?'0'+(i-12):(i-12));
									meridian = " "+$scope.translate('PM');
								}
							}
							for (var j = (i==open.hour?open.minute:0); j <= (i==close.hour?close.minute:59); j+=15) {
								if (i != date.getHours() || j >= date.getMinutes() || date.getDate() != dateSeleted.getDate()) {
										times.push({
											text: hour+':'+(j<10?'0'+j:j)+meridian,
											value: (i<10?'0'+i:i)+':'+(j<10?'0'+j:j)
										});
								}
							}
						}
					}
				}
				return times;
			}
			$scope.goToMenu = function () {
				if ($scope.numCart > 0) {
					MyAlert.confirm($rootScope.translate('QUESTION_CHANGE_PREORDER_TIME_WITH_CART'), $scope.translate('YES_EMPTY_CART'), $scope.translate('NO')).then(function (res) {
						gCart.setData([])
						$rootScope.allDishCount = 0;
						$rootScope.refreshNumCart();
						$scope.proccessToMenu();
					}, function () {
						$rootScope.hidePreorder();
					});
				} else {
					$scope.proccessToMenu();
				}
			}
			$scope.haveMenuAtTime= function (preorder , cb) {
				data = {
					id_or_slug: preorder.business_slug,
					timestamp: preorder.timestamp,
				}
				if (gOrder.getData().type) data.type = gOrder.getData().type;
				if (SEARCH_BY_ADDRESS && gOrder.getData().address && gOrder.getData().address != '') {
					data.location = gOrder.getData().position.lat+','+gOrder.getData().position.lng;
				} else if (!SEARCH_BY_ADDRESS && gOrder.getData().dropdownoption && gOrder.getData().dropdownoption != '') {
					data.dropdownoption = gOrder.getData().dropdownoption;
				}
				MyLoading.show($scope.translate('LOADING')+'...');
				Ordering.business.get(data, function(res){
					MyLoading.hide()
					console.log(res)
					cb(res.result)
				})
			}
			$scope.proccessToMenu = function () {
				var aux_preoder = null
				$scope.curPreorder.type = gOrder.getData().type || $scope.getDetaultOrderTypeId();
				if ($scope.preorder_by_date) { 
					var datePreorder = new Date($scope.date_aux)
					if (ADDONS.web_template) {
						$scope.curPreorder.time = $scope._hour+':'+$scope._minute;
					}
					datePreorder = datePreorder.toString().replace('00:00', $scope.curPreorder.time)
					$scope.curPreorder.timestamp = new Date(datePreorder).getTime();
					aux_preoder = JSON.parse(JSON.stringify($scope.curPreorder))
					aux_preoder.date = datePreorder
				}
				gPreorder.setData(aux_preoder?aux_preoder:$scope.curPreorder);
				if (ADDONS.web_template) {
					if ($state.current.name == 'main.search') localStorageApp.setItem(STORE.FROM_SEARCH, true);
					if ($state.current.name == 'main.business' || $state.current.name == 'main.business-createorder') location.reload();
					else $state.go('main.business', { 'business': $scope.curBusiness.slug });
				} else {
					var data_search = {
						id_or_slug: business.id,
					};
					if (gPreorder.getData().timestamp) data_search.timestamp = gPreorder.getData().timestamp;
					else if (gPreorder.getData().menu_id) data_search.menu_id = gPreorder.getData().menu_id;
					if (SEARCH_BY_ADDRESS && gOrder.getData().address && gOrder.getData().address != '') {
						data_search.location = gOrder.getData().position.lat+','+gOrder.getData().position.lng;
						if (gOrder.getData().type) data_search.type = gOrder.getData().type;
					} else if (!SEARCH_BY_ADDRESS && gOrder.getData().dropdownoption && gOrder.getData().dropdownoption != '') {
						data_search.dropdownoption = gOrder.getData().dropdownoption;
						if (gOrder.getData().type) data_search.type = gOrder.getData().type;
					}
					// if (NEW_FEATURES.BUSINESS_PAGE) {
					// 	data_search.params = 'name,email,slug,schedule,description,about,logo,header,phone,cellphone,owner_id,city_id,address,address_notes,zipcode,location,featured,timezone,food,alcohol,groceries,laundry,groceries,use_printer,printer_id,minimum,delivery_price,always_deliver,tax_type,tax,delivery_time,pickup_time,service_fee,fixed_usage_fee,percentage_usage_fee,enabled,checkoutfields,reviews,categories,menus,city,webhooks,currency,zones,gallery,paymethods,offers';
					// }
					MyLoading.show($scope.translate('LOADING')+'...');
					Ordering.business.get(data_search, function (res) {
						MyLoading.hide();
						if (!res.error) {
							gBusiness.setData(res.result);
							$rootScope.hidePreorder();
							if (cb) cb();
						} 
					});
				}
			}
			$scope.date_aux = null
			Ordering.menus.all({
				business_id: business.id,
			}, function (res) {
				if (!res.error) {
					$scope.menus = [];
					for (var i = 0; i < res.result.length; i++) {
						if (!gOrder.getData().type || (res.result[i].delivery && gOrder.getData().type == 1) || (res.result[i].pickup && gOrder.getData().type == 2) || (res.result[i].eatin && gOrder.getData().type == 3) || (res.result[i].curbside && gOrder.getData().type == 4) || (res.result[i].driver_thru && gOrder.getData().type == 5)) {
							$scope.menus.push(res.result[i]);
						}
					}
					if ($scope.menus.length == 0) {
						if (gOrder.getData().type == 1) {
							return MyAlert.show($scope.translate('BUSINESS_NOT_HAVE_MENU_TO_DELIVERY'));
						} else {
							return MyAlert.show($scope.translate('BUSINESS_NOT_HAVE_MENU_TO_PICKUP'));
						}
					}
					if ($scope.menus.length == 1) {
						$scope.selectMenu($scope.menus[0]);
					}
					$rootScope.hidePreorder();
					MyModal.showTemplate('templates/'+ADDONS.template+'/views/preorder-popup.html', {
						scope: $scope,
						animation: 'slide-in-up',
						// backdropClickToClose: false
					}).then(function(preorder_modal) {
						modals.push(preorder_modal);
						$scope.preorder_modal = preorder_modal;
						var preordeDate = null;
						var date_aux = null;
						$scope.preorder_modal.show().then(function () {
							// $scope.curPreorder.days = $scope.getDays(business)
							var days = $scope.curPreorder.days.map(function(day){
								return new Date(day.value);
							})
							$scope._type = 1;
							$scope.onPreorderTab = function (tab) {
								$scope.curPreorder.date = '';
								if (tab == 1) {
									$scope.preorder_by_date = false;
								} else if (tab == 2) {
									$scope.preorder_by_date = true;
									if (!$scope._type && ADDONS.pickup) {
										$scope._type = DEFAULT_ORDER_TYPE == 'delivery'?1:2;
									} else if (!ADDONS.pickup) {
										$scope._type = 1;
									}
									if(ADDONS.web_template){
										setTimeout(function() {
											preordeDate = $('#preordeDate').datetimepicker({
												format: 'L',
												widgetPositioning: {
													horizontal: 'auto',
														vertical: 'top',
												}
											})
											preordeDate.data("DateTimePicker").enabledDates(days);
											preordeDate.on('dp.show', function (e) {
												var date = $scope.curPreorder.date;
												if($scope.curPreorder.days && $scope.curPreorder.days.length != 0) {
														console.log('entry')
													_selected = $scope.curPreorder.days.find(function(day){
														return date && day.value == date
													})
													date = _selected&&_selected.text?_selected.text:date;
												}
												$scope.curPreorder.date = date
												$scope.$apply(function () {
													$scope.curPreorder.date = date
												});
												$(".bootstrap-datetimepicker-widget").attr('data-tap-disabled', 'true');
											});
											$("#preordeDate").on("dp.change", function (e) {
												var selected = new Date($('#preordeDate').val());
												if($scope.curPreorder.days && $scope.curPreorder.days.length != 0) {
													$scope.date_aux = selected
													_selected = $scope.curPreorder.days.find(function(day){
														return selected && day.value == selected
													})
													selected = _selected&&_selected.text?_selected.text:selected;
												}
												$scope.$apply(function () {
													$scope.curPreorder.date = selected;
												});
												$scope.selectDate($scope.date_aux);
											});
										}, 100);
									}
								}
							}
							$scope.showDates = function ()	{
								// preordeDate.data("DateTimePicker").show()
								// document.getElementById("preordeDate").focus();
							}
							$scope.hour_index = 0
							$scope.changeHour = function (hour) {
								$scope._hour = hour;
								$scope.hour_index = $scope.curPreorder._times.findIndex(function(time){
									return time.hour == $scope._hour;
								})
								if ($scope.hour_index == -1) {
									$scope.hour_index = 0
								} else {
									var minute_index = $scope.curPreorder._times[$scope.hour_index].minutes.findIndex(function(minute){
										return minute == $scope._minute;
									})
									if (minute_index == -1) {
										$scope._minute = $scope.curPreorder._times[$scope.hour_index].minutes[0]
									}
								}
							} 
							$scope.changeMinutes = function (minute) {
								$scope._minute = minute;
							}
							if ($scope.preorder_by_date && ADDONS.web_template) {
								$scope.onPreorderTab(2);
							}
						});
					});
				} else MyAlert.show(res.result);
			});
		}
		$rootScope.selectTypePreorder = function(type){
			$scope._type = type;
		}

		$rootScope.hidePreorder = function () {
			if ($scope.preorder_modal) {
				$scope.preorder_modal.hide();
				$scope.preorder_modal.remove();
			}
		}

		$rootScope.showCardStripe = function (publishablekey, pay, cb, requirements) {
			$scope.cardStripePayMode = pay;
			MyModal.showTemplate('templates/'+ADDONS.template+'/views/card-stripe-popup.html', {
				scope: $scope,
				animation: 'slide-in-left',
				backdropClickToClose: false
			}).then(function(card_stripe_modal) {
				modals.push(card_stripe_modal);
				$scope.card_stripe_modal = card_stripe_modal;
				$scope.card_stripe_modal.show().then(function () {
					var stripe = Stripe(publishablekey);
					var elements = stripe.elements();
					var cardNumber = elements.create('cardNumber', {});
					cardNumber.mount('#card-number');
					var cardExpiry = elements.create('cardExpiry', {});
					cardExpiry.mount('#card-expiry');
					var cardCvc = elements.create('cardCvc', {});
					cardCvc.mount('#card-cvc');
					cardNumber.addEventListener('change', function(event) {
						var displayError = $('#card-errors');
						if (event.error) {
							displayError.show();
							displayError.text($scope.translate("CARD_"+event.error.code.toUpperCase()));
						} else {
							displayError.text('');
							displayError.hide();
						}
					});
					cardExpiry.addEventListener('change', function(event) {
						var displayError = $('#date-errors');
						if (event.error) {
							displayError.show();
							displayError.text($scope.translate("CARD_"+event.error.code.toUpperCase()));
						} else {
							displayError.text('');
							displayError.hide();
						}
					});
					cardCvc.addEventListener('change', function(event) {
						var displayError = $('#cvc-errors');
						if (event.error) {
							displayError.show();
							displayError.text($scope.translate("CARD_"+event.error.code.toUpperCase()));
						} else {
							displayError.text('');
							displayError.hide();
						}
					});
					$scope.getTokenCard = function () {
						MyLoading.show($rootScope.translate('MOBILE_FRONT_LOAD_LOADING'));
						var customer = {};
						customer.name = (gUser.getData().name?gUser.getData().name:'')+(gUser.getData().lastname?' '+gUser.getData().lastname:'');
						if (gUser.getData().email) customer.email = gUser.getData().email;
						customer.address = gUser.getData().address?gUser.getData().address:'';
						customer.address_zip = gUser.getData().zip?gUser.getData().zip:'';
						customer.address_line1 = gUser.getData().phone?gUser.getData().phone:'';
						if (BREAKER_FEATURES.STRIPE_UPDATED) {
							var customer = {};
							customer.name = (gUser.getData().name?gUser.getData().name:'')+(gUser.getData().lastname?' '+gUser.getData().lastname:'');
							if (gUser.getData().email) customer.email = gUser.getData().email;
							if (gUser.getData().cellphone) customer.phone = gUser.getData().cellphone?gUser.getData().cellphone:'';
							if (pay) {
								stripe.createPaymentMethod(
									'card',
									cardNumber
								).then(function(result) {
									if (result.error) {
										MyLoading.hide();
										MyAlert.show($scope.translate(result.error.code.toUpperCase()));
									} else {
										MyLoading.hide();
										cb(result.paymentMethod.id);
										$rootScope.hideCardStripe();
									}
								});
							} else {
								stripe.handleCardSetup(
									requirements,
									cardNumber,
									{
										payment_method_data: {
											billing_details: customer
										}
									}
								).then(function(result) {
									MyLoading.hide();
									if (result.error) {
										MyAlert.show(result.error.code.toUpperCase());
									} else {
										cb(result.setupIntent.payment_method);
										$rootScope.hideCardStripe();
									}
								});
							}
						} else {
							stripe.createToken(cardNumber, customer).then(function(result) {
								if (result.error) {
									MyLoading.hide();
									MyAlert.show($scope.translate("CARD_"+result.error.code.toUpperCase()));
								} else if (!pay) {
									MyLoading.hide();
									cb(result.token.id);
									$rootScope.hideCardStripe();
								} else {
									MyLoading.hide();
									cb(result.token.id);
									$rootScope.hideCardStripe();
								}
							});
						}
					}
				});
			});	
		}
		$rootScope.hideCardStripe = function () {
			if ($scope.card_stripe_modal) {
				$scope.card_stripe_modal.hide();
				$scope.card_stripe_modal.remove();
			}
		}

		$rootScope.showOrdersFilter = function (cb) {
			$scope.filters = {
				orderby: ""
			};
			MyModal.showTemplate('templates/'+ADDONS.template+'/views/orders-filter-popup.html', {
				scope: $scope,
				animation: 'slide-in-left',
				backdropClickToClose: false
			}).then(function(orders_filter_modal) {
				modals.push(orders_filter_modal);
				$scope.orders_filter_modal = orders_filter_modal;
				$scope.orders_filter_modal.show();
			});
			$scope.applyFilters = function () {
				cb($scope.filters);
				$rootScope.hideOrdersFilter();
			}
		}
		$rootScope.hideOrdersFilter = function () {
			if ($scope.orders_filter_modal) {
				$scope.orders_filter_modal.hide();
				$scope.orders_filter_modal.remove();
			}
		}
		$rootScope.showStripeRedirect = function (publishablekey, buyer, order, cb) {
			if (!ADDONS.striperedirect_payment.enable) return;
			$scope.paydata = {
				method: '',
				name: buyer.name,
				email: buyer.email
			};
			$scope.paymethods = [
				{
					name: 'Bancontact',
					value: 'bancontact',
					enabled: ADDONS.striperedirect_payment.gateways.bancontact
				},
				{
					name: 'Alipay',
					value: 'alipay',
					enabled: ADDONS.striperedirect_payment.gateways.alipay
				},
				{
					name: 'Giropay',
					value: 'giropay',
					enabled: ADDONS.striperedirect_payment.gateways.giropay
				},
				{
					name: 'iDEAL',
					value: 'ideal',
					enabled: ADDONS.striperedirect_payment.gateways.ideal
				}
			];
			var paymethod = '';
			var count = 0;
			for (var i = 0; i < $scope.paymethods.length; i++) {
				if ($scope.paymethods[i].enabled) {
					count++;
					paymethod = $scope.paymethods[i].value;
				}
			}
			if (count == 1) $scope.paydata.method = paymethod;
			MyModal.showTemplate('templates/'+ADDONS.template+'/views/stripe-redirect-popup.html', {
				scope: $scope,
				animation: 'slide-in-left',
				backdropClickToClose: false
			}).then(function(stripe_redirect_modal) {
				modals.push(stripe_redirect_modal);
				$scope.stripe_redirect_modal = stripe_redirect_modal;
				$scope.stripe_redirect_modal.show();
				$scope.getAuthorization = function () {
					var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
					if ($scope.paydata.method.trim() == '') return MyAlert.show($scope.translate('SELECT_PAYMENT_METHOD'));
					else if ($scope.paydata.name.trim() == '') return MyAlert.show($scope.translate('NAME_IS_REQUIRED'));
					else if (!re.test($scope.paydata.email)) return MyAlert.show($scope.translate('valid_email_V2'));
					else {
						MyLoading.show($scope.translate('MOBILE_FRONT_LOAD_LOADING'));
						$rootScope.hideStripeRedirect();
						var stripe = Stripe(publishablekey);
						var redirect_popup = null;
						if (ADDONS.web_template || typeof cordova == 'undefined') var redirect_popup = window.open('', '_blank','directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,clearcache=yes');
						stripe.createSource({
							type: $scope.paydata.method,
							amount: Math.round(parseFloat(order.total).toFixed(2)*100),
							currency: STRIPE_CURRENCY,
							owner: {
								name: $scope.paydata.name,
								email: $scope.paydata.email
							},
							redirect: {
								return_url: (API_URL+'/'+API_VERSION+'/'+localStorageApp.getItem(STORE.LANG_CODE)+'/'+API_PROJECT_NAME+'/payments/stripe_redirect/redirect').replace(/([^:]\/)\/+/g, "$1"),
							},
						}).then(function(result) {
							if (!result.error) {
								if (ADDONS.web_template || typeof cordova == 'undefined') redirect_popup.location.href = result.source.redirect.url;
								else redirect_popup = window.open(result.source.redirect.url, '_blank');
								
								if (ADDONS.web_template || typeof cordova == 'undefined') {
									var timer = setInterval(function() {   
										if(redirect_popup.closed) {  
											clearInterval(timer);  
											MyLoading.hide();
											cb(new Error("CANCELED"));
										}
									}, 100);
									var checkdata = setInterval(function () {
										redirect_popup.postMessage("data", API_URL);
									}, 100);
									var timeout = null;
									function handleMessage (e) {
										if (e.data.result) {
											redirect_popup.postMessage("close", API_URL);
											window.removeEventListener("message", handleMessage);
											clearInterval(checkdata);
											clearInterval(timer);
											clearTimeout(timeout);
											timeout = setTimeout(function () {
												MyLoading.hide();
												if (e.data.result.redirect_status === 'failed' || e.data.result.redirect_status === 'canceled') {
													cb(new Error('Error stripe redirect'));
												} else {
													cb(null, e.data.result.client_secret, e.data.result.source);
												}
											}, 500);
										}
									}
									window.addEventListener("message", handleMessage, false);
								} else {
									var ok = false;
									redirect_popup.addEventListener("loadstart", function() {
										var timeout = null;
										var interval = setInterval(function () {
											redirect_popup.executeScript(
												{ code: "result" },
												function(result) {
													if (result[0] != null && result[0].result) {
														if (!ok) {
															ok = true;
															timeout = setTimeout(function () {
																ok = true;
																redirect_popup.close();
																clearInterval(interval);
																MyLoading.hide();
																cb(null, result[0].result.client_secret, result[0].result.source);
															}, 1500);
														}
													}
												}
											);
										}, 1000);
									});
									redirect_popup.addEventListener('exit', function () {
										MyLoading.hide();
										console.log("CANCELED");
										if (!ok) cb(new Error("CANCELED"));
									});
								}
							} else {
								redirect_popup.close();
								MyLoading.hide();
								MyAlert.show(result.error.message);
							}
						});
					}
				}
			});
		}
		$rootScope.hideStripeRedirect = function () {
			if ($scope.stripe_redirect_modal) {
				$scope.stripe_redirect_modal.hide();
				$scope.stripe_redirect_modal.remove();
			}
		}

		$rootScope.goBusinessMap = function(business) {
			MyModal.showTemplate('templates/'+ADDONS.template+'/views/business-map-popup.html', {
				scope: $scope,
				animation: 'none',
			}).then(function(modal) {
				modals.push(modal);
				$scope.map_modal = modal;
				$scope.map_modal.scope.dest = business.location;	// destination point for navigation

				$scope.map_modal.show().then(function () {

					setTimeout(function(){
						var el_map = document.getElementById('business-map');
						if (el_map) {
							var map = new google.maps.Map(el_map, {
								center: business.location,
								zoom: 15,
								zoomControl: true,
								mapTypeControl: false,
								scaleControl: true,
								streetViewControl: false,
								rotateControl: false,
								fullscreenControl: false
							});
							$scope.map = map;
							var marker = new google.maps.Marker({
								position: business.location,
								map: map,
								title: 'Address'
							});
							$scope.marker = marker;
		
							var options = {
								types: []
							};
							if(FULL_ADDRESS_ONLY){
								options.types.push('address');
							}
							if (COUNTRY_AUTOCOMPLETE != "*") options.componentRestrictions = {
								country: COUNTRY_AUTOCOMPLETE
							}
							var infowindow = new google.maps.InfoWindow({
								content: business.address,
								disableAutoPan: true
							});
							infowindow.open(map, marker);
						}
					},150);

				});
			});
			
		}

		$rootScope.onStartNavigation = function(dest) {
			if (!ADDONS.web_template) {
				if (typeof launchnavigator != 'undefined' && launchnavigator != null) {
					var destination = [dest.lat, dest.lng];
					if (destination != null) {
						launchnavigator.navigate(destination, {
							errorCallback: function () {
								if (err != 'cancelled') {
									MyAlert.show($scope.translate('ERROR_OPEN_MAP'));
								}
							}
						});
					} else {
						MyAlert.show($scope.translate('NOT_DETECTED_DESTINATION'));
					}
				} else {
					window.open('https://maps.google.com/?q='+ dest.lat +','+ dest.lng +'', '_system');
				}
			} else {
				window.open('https://maps.google.com/?q='+ dest.lat +','+ dest.lng +'', '_system');
			}
		}

		$rootScope.showMap = function (address, position, cb, not_autoclose) {
			if ($scope.map_modal) {
				$scope.map_modal.remove();
			}
			//$(".pac-container").remove();
			MyModal.showTemplate('templates/'+ADDONS.template+'/views/advanced-search-popup.html', {
				scope: $scope,
				animation: 'none',
			}).then(function(modal) {
				modals.push(modal);
				$scope.map_modal = modal;
				var from_input = false;
				var from_gps = false;
				var intervalmap = null;
				var timeoutAddress = null;
				var address_selected = true;
				$scope.$on('modal.hidden', function() {
					clearInterval(intervalmap);
				});
				$scope.map_modal.show().then(function () {
					var data = {
						address: address,
						position: position
					};
					var content = $('ion-modal-view ion-content').last();
					//var div = document.getElementById('map');
					var height = content.height();
					var width = content.width();
					$("#map").height(height);
					$("#map").width(width);
					intervalmap = setInterval(function () {
						if ((height != content.height() || width != content.width()) || (height != $("#map").height() || width != $("#map").width())) {
							height = content.height();
							width = content.width();
							$("#map").height(content.height());
							$("#map").width(content.width());
							google.maps.event.trigger(map, 'resize');
						}
					}, 100);

					$scope.map_address = address;
					var options = {
						types: []
					};
					if(FULL_ADDRESS_ONLY){
						options.types.push('address');
					}
					if (COUNTRY_AUTOCOMPLETE != "*") options.componentRestrictions = {
						country: COUNTRY_AUTOCOMPLETE
					}
					var input = document.getElementById('map_address');
					var autocomplete = new google.maps.places.Autocomplete(input, options);
					autocomplete.setFields(['place_id', 'formatted_address', 'geometry']);
					autocomplete.addListener('place_changed', function() {
						if (autocomplete.getPlace().geometry) {
							marker.setPosition(autocomplete.getPlace().geometry.location);
							data.address = input.value;
							data.position = {
								lat: autocomplete.getPlace().geometry.location.lat(),
								lng: autocomplete.getPlace().geometry.location.lng()
							}
							map.panTo(autocomplete.getPlace().geometry.location);
							$scope.map_address = input.value;
							infowindow.setContent(input.value);
							address_selected = true;
							from_input = true;
						} else {
							MyAlert.show($scope.translate('PLACE_NO_POSITION'));
						}
					});
					input.onkeydown = function () {
						address_selected = false;
					}
					var map = new google.maps.Map(document.getElementById('map'), {
						zoom: 18,
						center: data.position,
						streetViewControl: false
					});
					var marker = new google.maps.Marker({
						position: data.position,
						map: map
					});
					var infowindow = new google.maps.InfoWindow({
						content: data.address,
						disableAutoPan: true
					});
					var geocoder = new google.maps.Geocoder;
					infowindow.open(map, marker);
					map.addListener('center_changed', function() {
						$timeout.cancel(timeoutAddress);
						timeoutAddress = $timeout(function () {
							data.position = {
								lat: map.getCenter().lat(),
								lng: map.getCenter().lng()
							};
							if (!from_input && !from_gps) {
								geocoder.geocode({'location': data.position}, function(results, status) {
									MyLoading.hide();
									if (status === 'OK') {
										data.address = results[0].formatted_address;
										$scope.map_address = results[0].formatted_address;
										infowindow.setContent(results[0].formatted_address);
									} else MyAlert.show($scope.translate('MOBILE_GET_LOCATION_ERROR'));
								})
							}
							from_gps = false;
							from_input = false;
							address_selected = true;
							marker.setPosition(map.getCenter());
						}, 200);
					});
					document.addEventListener("resume", function () {
						$scope.checkGPS(function (gpsAvailable) {
							if (gpsAvailable) {
								MyLoading.show($scope.translate("LOADING")+'...');
								GeolocationSvc().then(function(position) {
									MyLoading.hide();
									data.position = {
										lat: position.lat,
										lng: position.lng
									};
									if (!from_input) {
										AddressLookupSvc.lookupByAddress(data.position.lat, data.position.lng).then(function(addr) {
										data.address = addr.address;
											$scope.map_address = addr.address;
											infowindow.setContent(addr.address);
										});
										map.panTo(data.position);
										marker.setPosition(data.position);
										from_gps = true;
										address_selected = true;
									}
								}).catch(function (err) {
									setTimeout(function () {
										MyLoading.hide();
									}, 50);
									MyAlert.show($scope.translate('MOBILE_GET_LOCATION_ERROR'));
								});
							}
						});
					}, false);
					$scope.checkGPS(function (gpsAvailable) {
						if (gpsAvailable) {
							MyLoading.show($scope.translate("LOADING")+'...');
							GeolocationSvc().then(function(position) {
								MyLoading.hide();
								data.position = {
									lat: position.lat,
									lng: position.lng
								};
								if (!from_input) {
									var geocoder = new google.maps.Geocoder;
									geocoder.geocode({'location': position}, function(results, status) {
										MyLoading.hide();
										if (status === 'OK') {
											var order = {
												address: results[0].formatted_address,
												position: position
											};
											data.address = results[0].formatted_address;
											$scope.map_address = results[0].formatted_address;
											infowindow.setContent(results[0].formatted_address);
										} else MyAlert.show($scope.translate('MOBILE_GET_LOCATION_ERROR'));
									})
									// AddressLookupSvc.lookupByAddress(data.position.lat, data.position.lng).then(function(addr) {
										// data.address = addr.address?addr.address:address;
										// $scope.map_address = addr.address?addr.address:address;
										// infowindow.setContent(addr.address?addr.address:address);
									// });
									address_selected = true;
									map.panTo(data.position);
									marker.setPosition(data.position);
									from_gps = true;
								}
							}).catch(function (err) {
								setTimeout(function () {
									MyLoading.hide();
								}, 50);
								MyAlert.show($scope.translate('MOBILE_GET_LOCATION_ERROR'));
							});
						}
					});
					$scope.clear = function () {
						$scope.map_address = '';
						$('#map_address').val('');
						setTimeout(function () {
							$('#map_address').focus();
						}, 10);
						address_selected = false;
					}
					$scope.hide = function () {
						$scope.map_modal.hide();
						$scope.map_modal.remove();
					}
					$scope.select = function () {
						if (GOOGLE_AUTOCOMPLETE_SELECTION_REQUIRED && !address_selected) {
							MyAlert.show($scope.translate('SELECT_ADDRESS_FROM_AUTOCOMPLETE'));
							return;
						}
						if ($scope.map_modal != null && $scope.map_modal.isShown() && !not_autoclose) {
							$scope.map_modal.hide();
							$scope.map_modal.remove();
						}
						if (map) {
							google.maps.event.clearListeners(map, 'center_changed');
						}
						clearInterval(intervalmap);
						cb(data, modal);
					}
				});
			});
		};

		$rootScope.optimizeImage = function (url, params, fallback) {
			if (!url && fallback) return fallback;
			if (params && params.length > 0) params = ","+params;
			else params = "";
			if (url != null && url.indexOf('res.cloudinary.com') != -1) {
				var parts = url.split('upload');
				url = parts[0]+'upload/f_auto,q_auto'+params+parts[1];
			}
			return url;
		}

		$rootScope.openProduct = function (product, order_product, inventory, edit, cb, cb_hide) {
			MyModal.showTemplate('templates/'+ADDONS.template+'/views/order-product-option-popup.html', {
				scope: $scope,
				animation: 'slide-in-left',
			}).then(function(product_modal) {
				if (edit) product_modal.scope.code = order_product.code;
				product_modal.scope.product = product;
				product_modal.scope.edit = edit;
				product_modal.scope.inventory = inventory;
				product_modal.scope.orderProduct = order_product;
				if (!product_modal.scope.inventory[product.id]) {
					product_modal.scope.inventory[product.id] = 0;
				}
				if (product.inventoried) {
					product_modal.scope.orderProduct.balance = product.quantity > MAX_PRODUCT_AMOUNT ? MAX_PRODUCT_AMOUNT : product.quantity;
				}
				if (!product_modal.scope.orderProduct.extended_data_options || typeof product_modal.scope.orderProduct.extended_data_options != 'object') {
					product_modal.scope.orderProduct.extended_data_options = {};
				}
				if (ADDONS.quantity_options && product_modal.scope.orderProduct.data_options 
						&& typeof product_modal.scope.orderProduct.data_options == 'object' 
						&& Object.keys(product_modal.scope.orderProduct.data_options).length > 0) {
					for (var i = 0; i < product.extras.length; i++) {
						var extra = product.extras[i];
						for (var j = 0; j < extra.options.length; j++) {
							var option = extra.options[j];
							for (var k = 0; k < option.suboptions.length; k++) {
								var suboption = option.suboptions[k];
								if (product_modal.scope.orderProduct.data_options[suboption.id]) {
									product_modal.scope.orderProduct.extended_data_options[suboption.id] = {
										selected: true,
										position: 'whole',
										quantity: 1
									};
								}
							}
						}
					}
					product_modal.scope.refresh();
				}
				modals.push(product_modal);
				$scope.product_modal = product_modal;
				$scope.MAX_PRODUCT_AMOUNT = MAX_PRODUCT_AMOUNT;
				product_modal.scope.onCheckbox = function (option, suboption) {
					Extensions.runAction('product_option_checkbox_changed', suboption, $scope);
					if (!ADDONS.quantity_options) {
						var count = 0;
						for (var i = 0; i < option.suboptions.length; i++) {
							if (product_modal.scope.orderProduct.data_options[option.suboptions[i].id]) count++;
						}
						if (option.max != 0 && count > option.max) {
							delete product_modal.scope.orderProduct.data_options[suboption.id];
							return MyAlert.show($scope.translate('ONLY_CHOOSE_MAX_OPTIONS').replace('_max_', option.max));
						}
						for (var i = 0; i < option.suboptions.length; i++) {
							if (option.suboptions[i].id == suboption.id) {
								if (!product_modal.scope.orderProduct.data_options[option.suboptions[i].id]) {
									delete product_modal.scope.orderProduct.data_options[option.suboptions[i].id];
								} else {
									product_modal.scope.orderProduct.data_options[option.suboptions[i].id] = true;
								}
							}
						}
					} else {
						if (!product_modal.scope.orderProduct.extended_data_options[suboption.id]) {
							product_modal.scope.orderProduct.extended_data_options[suboption.id] = {
								selected: true,
								position: 'whole',
								quantity: 1,
							};
						} else {
							product_modal.scope.orderProduct.extended_data_options[suboption.id].quantity = 1;
							product_modal.scope.orderProduct.extended_data_options[suboption.id].position = 'whole';
							product_modal.scope.orderProduct.extended_data_options[suboption.id].selected = !product_modal.scope.orderProduct.extended_data_options[suboption.id].selected;
						}

						var count = 0;
						for (var i = 0; i < option.suboptions.length; i++) {
							if (product_modal.scope.orderProduct.extended_data_options[option.suboptions[i].id] && product_modal.scope.orderProduct.extended_data_options[option.suboptions[i].id].selected) {
								if (!option.limit_suboptions_by_max) {
									count++;
								} else {
									count += product_modal.scope.orderProduct.extended_data_options[option.suboptions[i].id].quantity;
								}
							}
						}

						if (option.max != 0 && count > option.max) {
							product_modal.scope.orderProduct.extended_data_options[suboption.id].selected = false;
							return MyAlert.show($scope.translate('ONLY_CHOOSE_MAX_OPTIONS').replace('_max_', option.max));
						}
					}
					product_modal.scope.refresh();
				}
				product_modal.scope.getCartCountByProduct = function(product) {
					var ret = {
						quantity: 0,
						status: false
					};
					var cart = gCart.getData();
					for (var i = 0; i < cart.length; i++) {
						if (edit) {
							if (cart[i].id == product.id && cart[i].code != product_modal.scope.code) {
								ret.quantity += cart[i].quantity;
							}
						} else {
							if (cart[i].id == product.id) {
								ret.quantity += cart[i].quantity;
							}
						}
					}
					if (ret.quantity > 0) ret.status = true;
					return ret
				}
				product_modal.scope.onRadio = function (option, suboption) {
					Extensions.runAction('product_option_radio_changed', suboption, $scope);
					if (!ADDONS.quantity_options) {
						for (var i = 0; i < option.suboptions.length; i++) {
							if (option.suboptions[i].id == suboption.id) {
							} else if (product_modal.scope.orderProduct.data_options[option.suboptions[i].id]) {
								delete product_modal.scope.orderProduct.data_options[option.suboptions[i].id];
							}
						}
					} else {
						for (var i = 0; i < option.suboptions.length; i++) {
							if (option.suboptions[i].id != suboption.id && product_modal.scope.orderProduct.extended_data_options[option.suboptions[i].id]) {
								product_modal.scope.orderProduct.extended_data_options[option.suboptions[i].id].selected = false;
							}
						}
						if (!product_modal.scope.orderProduct.extended_data_options[suboption.id]) {
							product_modal.scope.orderProduct.extended_data_options[suboption.id] = {
								selected: true,
								position: 'whole',
								quantity: 1,
							};
						} else {
							product_modal.scope.orderProduct.extended_data_options[suboption.id].selected = true;
						}
					}
					product_modal.scope.refresh();
				}
				product_modal.scope.selectPosition = function (option, suboption, position) {
					if (!option.with_half_option) return;
					if (!product_modal.scope.orderProduct.extended_data_options[suboption.id]) {
						product_modal.scope.orderProduct.extended_data_options[suboption.id] = {
							selected: false,
							position: position,
							quantity: 1,
						};
					}
					product_modal.scope.orderProduct.extended_data_options[suboption.id].position = position;
					product_modal.scope.refresh();
				}
				product_modal.scope.addSuboption = function (option, suboption) {
					if (!option.allow_suboption_quantity) return;
					if (!product_modal.scope.orderProduct.extended_data_options[suboption.id]) {
						product_modal.scope.orderProduct.extended_data_options[suboption.id] = {
							selected: false,
							position: 'whole',
							quantity: 1,
						};
					}

					if (option.limit_suboptions_by_max) {
						var count = 0;
						for (var i = 0; i < option.suboptions.length; i++) {
							if (product_modal.scope.orderProduct.extended_data_options[option.suboptions[i].id] && product_modal.scope.orderProduct.extended_data_options[option.suboptions[i].id].selected) {
								count += product_modal.scope.orderProduct.extended_data_options[option.suboptions[i].id].quantity;
							}
						}
	
						if (option.max != 0 && count+1 > option.max) {
							return MyAlert.show($scope.translate('ONLY_CHOOSE_MAX_OPTIONS').replace('_max_', option.max));
						}
					}

					if (product_modal.scope.orderProduct.extended_data_options[suboption.id].quantity < suboption.max) {
						product_modal.scope.orderProduct.extended_data_options[suboption.id].quantity++;
						product_modal.scope.refresh();
					}
				}
				product_modal.scope.subtractSuboption = function (option, suboption) {
					if (!option.allow_suboption_quantity) return;
					if (!product_modal.scope.orderProduct.extended_data_options[suboption.id]) {
						product_modal.scope.orderProduct.extended_data_options[suboption.id] = {
							selected: false,
							position: 'whole',
							quantity: 1,
						};
					}
					if (product_modal.scope.orderProduct.extended_data_options[suboption.id].quantity > 1) {
						product_modal.scope.orderProduct.extended_data_options[suboption.id].quantity--;
						product_modal.scope.refresh();
					}
				}
				product_modal.scope.getSuboptionPrice = function (option, suboption) {
					if (product_modal.scope.orderProduct.extended_data_options[suboption.id]) {
						var unit_value = product_modal.scope.orderProduct.extended_data_options[suboption.id].position == 'whole'?suboption.price:suboption.half_price;
						return product_modal.scope.orderProduct.extended_data_options[suboption.id].quantity*unit_value;
					} else {
						return suboption.price;
					}
				}
				product_modal.scope.add = function () {
					var flag = false;
					if (!product.inventoried && product_modal.scope.orderProduct.quantity < MAX_PRODUCT_AMOUNT) {
						flag = true;
					} else if (product.inventoried) {
						if (product_modal.scope.orderProduct.quantity < product_modal.scope.orderProduct.balance - product_modal.scope.getCartCountByProduct(product).quantity) {
							flag = true;
						} 
						// else if (!edit && product_modal.scope.orderProduct.quantity < balance - product_modal.scope.getCartCountByProduct(product).quantity) {
						// 	flag = true;
						// }
					}

					if (flag) {
						product_modal.scope.orderProduct.quantity++;
						product_modal.scope.refresh();
					}
				}
				product_modal.scope.subtract = function () {
					if (product_modal.scope.orderProduct.quantity > 1) {
						product_modal.scope.orderProduct.quantity--;
						product_modal.scope.refresh();
					}
				}
				product_modal.scope.checkConditioned = function () {
					if (!ADDONS.quantity_options) {
						product.extras = product.extras?product.extras:[];
						for (var i = 0; i < product.extras.length; i++) {
							for (var j = 0; j < product.extras[i].options.length; j++) {
								if (product.extras[i].options[j].conditioned && (product_modal.scope.orderProduct.data_options && !product_modal.scope.orderProduct.data_options[product.extras[i].options[j].respect_to])) {
									for (var k = 0; k < product.extras[i].options[j].suboptions.length; k++) {
										delete product_modal.scope.orderProduct.data_options[product.extras[i].options[j].suboptions[k].id];
									}
								}
							}
						}
					} else {
						var hasChange = true;
						do {
							hasChange = false;
							for (var suboption_id in product_modal.scope.orderProduct.extended_data_options) {
								if (product_modal.scope.orderProduct.extended_data_options.hasOwnProperty(suboption_id) 
									&& !product_modal.scope.orderProduct.extended_data_options[suboption_id].selected)
								{
									for (var i = 0; i < product.extras.length; i++) {
										var extra = product.extras[i];
										for (var j = 0; j < extra.options.length; j++) {
											var option = extra.options[j];
											if (option.respect_to == suboption_id) {
												for (var k = 0; k < option.suboptions.length; k++) {
													var suboption = option.suboptions[k];
													if (product_modal.scope.orderProduct.extended_data_options[suboption.id.toString()]
														&& product_modal.scope.orderProduct.extended_data_options[suboption.id.toString()].selected)
													{
														product_modal.scope.orderProduct.extended_data_options[suboption.id.toString()].selected = false;
														hasChange = true;
													}
												}
											}
										}
									}
								}
							}
						} while (hasChange);
					}
				}
				product_modal.scope.refresh = function () {
					product_modal.scope.checkConditioned();
					if (!ADDONS.quantity_options) {
						var subtotal = product.price;
						var options = [];
						for (var i = 0; i < product.extras.length; i++) {
							for (var j = 0; j < product.extras[i].options.length; j++) {
								var option = {
									id: product.extras[i].options[j].id,
									name:  product.extras[i].options[j].name,
									suboptions:[], 
								};
								for (var k = 0; k < product.extras[i].options[j].suboptions.length; k++) {
									if (product_modal.scope.orderProduct.data_options 
										&& product_modal.scope.orderProduct.data_options[product.extras[i].options[j].suboptions[k].id]
										&& (!product.extras[i].options[j].conditioned || (product_modal.scope.orderProduct.data_options && product_modal.scope.orderProduct.data_options[product.extras[i].options[j].respect_to]))) {
										subtotal += product.extras[i].options[j].suboptions[k].price;
										var suboption = {
											id: product.extras[i].options[j].suboptions[k].id,
											name: product.extras[i].options[j].suboptions[k].name,
											price: product.extras[i].options[j].suboptions[k].price
										};
										option.suboptions.push(suboption);
									}
								}
								if (option.suboptions.length > 0) options.push(option);
							}
						}
						product_modal.scope.orderProduct.options = options;
						product_modal.scope.orderProduct.total = product_modal.scope.orderProduct.quantity*subtotal;
					} else {
						var subtotal = product.price;
						var options = [];
						for (var i = 0; i < product.extras.length; i++) {
							var extra = product.extras[i];
							for (var j = 0; j < extra.options.length; j++) {
								var option = product.extras[i].options[j];
								var _option = {
									id: option.id,
									name: option.name,
									allow_suboption_quantity: option.allow_suboption_quantity || false,
									with_half_option: option.with_half_option || false,
									limit_suboptions_by_max: option.limit_suboptions_by_max || false,
									suboptions:[]
								};
								for (var k = 0; k < option.suboptions.length; k++) {
									var suboption = option.suboptions[k];
									if (product_modal.scope.orderProduct.extended_data_options 
										&& product_modal.scope.orderProduct.extended_data_options[suboption.id]
										&& product_modal.scope.orderProduct.extended_data_options[suboption.id].selected
										&& (!option.conditioned || (product_modal.scope.orderProduct.extended_data_options && product_modal.scope.orderProduct.extended_data_options[option.respect_to] && product_modal.scope.orderProduct.extended_data_options[option.respect_to].selected))) {
										var suboption_price = suboption.price;
										var _suboption = {
											id: suboption.id,
											name: suboption.name,
											price: suboption.price,
											half_price: suboption.half_price,
											position: 'whole',
											quantity: 1
										};
										if (option.with_half_option) {
											_suboption.half_price = suboption.half_price;
											_suboption.position = product_modal.scope.orderProduct.extended_data_options[suboption.id].position;
											if (_suboption.position != 'whole') {
												suboption_price = _suboption.half_price;
											}
										}
										if (option.allow_suboption_quantity) {
											_suboption.quantity = product_modal.scope.orderProduct.extended_data_options[suboption.id].quantity;
											suboption_price *= _suboption.quantity;
										}
										subtotal += suboption_price;
										_option.suboptions.push(_suboption);
									}
								}
								if (_option.suboptions.length > 0) {
									options.push(_option);
								}
							}
						}
						product_modal.scope.orderProduct.options = [];
						product_modal.scope.orderProduct.extended_options = options;
						product_modal.scope.orderProduct.total = product_modal.scope.orderProduct.quantity*subtotal;
					}
					$timeout(function () {
						$ionicScrollDelegate.resize();
					}, 200);
				}
				product_modal.scope.ok = function () {
					var invalids = [];
					if (product.extras){
							for (var i = 0; i < product.extras.length; i++) {
							var extra = product.extras[i];
							for (var j = 0; j < extra.options.length; j++) {
								var option = extra.options[j];
								var count = 0;
								for (var k = 0; k < option.suboptions.length; k++) {
									var suboption = option.suboptions[k];
									if (!ADDONS.quantity_options) {
										for (key in product_modal.scope.orderProduct.data_options) {
											if (key == suboption.id){
												count++;
											}
										}
									} else {
										for (key in product_modal.scope.orderProduct.extended_data_options) {
											if (key == suboption.id && product_modal.scope.orderProduct.extended_data_options[key].selected) {
												if (option.limit_suboptions_by_max && option.allow_suboption_quantity) {
													count += product_modal.scope.orderProduct.extended_data_options[key].quantity > 0 ? product_modal.scope.orderProduct.extended_data_options[key].quantity : 1;
												} else {
													count++;
												}
											}
										}
									}
								}
								if (!ADDONS.quantity_options) {
									if ((!option.conditioned
											|| (product_modal.scope.orderProduct.data_options
												&& product_modal.scope.orderProduct.data_options[option.respect_to]))
										&& (option.max != 0
											&& (option.min > count
												|| option.max < count))) {
										invalids.push(option);
									}
								} else {
									if ((!option.conditioned
										|| (product_modal.scope.orderProduct.extended_data_options
											&& product_modal.scope.orderProduct.extended_data_options[option.respect_to]
											&& product_modal.scope.orderProduct.extended_data_options[option.respect_to].selected))
										&& (option.max != 0
											&& (option.min > count
												|| option.max < count))) {
										invalids.push(option);
									}
								}
							}
						}
					}
					if (invalids.length > 0) {
						Extensions.runAction('product_option_errors', invalids, $scope);
						return;
					}
					product_modal.hide();
					product_modal.remove();
					if (ADDONS.quantity_options) {
						product_modal.scope.orderProduct.data_options = {};
					}
					cb(product_modal.scope.orderProduct);
				}
				product_modal.scope.close = function () {
					product_modal.hide();
					product_modal.remove();
					if (cb_hide) cb_hide();
				}
				product_modal.$el.on('click', function(e) {
					if (product_modal.backdropClickToClose && e.target === product_modal.el) {
						product_modal.hide();
						product_modal.remove();
						if (cb_hide) cb_hide();
					}
				});
				product_modal.scope.hasImages = function (option) {
					var images = false;
					for (var i = 0; i < option.suboptions.length; i++) {
						var suboption = option.suboptions[i];
						if (suboption.image) {
							images = true;
							break;
						}
					}
					return images;
				}
				$scope.product_modal.show().then(function () {
				});

				if (ADDONS.web_template) {
					$ionicPopover.fromTemplateUrl('templates/'+ADDONS.template+'/views/share-popover.html', {
						scope: $scope,
					}).then(function(popover) {
						$scope.popover = popover;
					});
				}
			});
		}

		$rootScope.getImageFile = function (element_id, cb) {
			if (typeof cordova == 'undefined' || !cordova || typeof Camera == 'undefined') {
				var input = document.getElementById(element_id);
				input.click();
				input.addEventListener("change", changeFile, true);
				function changeFile() {
					input.removeEventListener("change", changeFile, true);
					if (input.files.length > 0) {
						var file = input.files[0];
						var reader = new FileReader();
						reader.readAsDataURL(file);
						reader.onload = function () {
							var img = new Image;
							img.onload = function() {
								cb(reader.result);
							};
							img.src = reader.result;
						};
						reader.onerror = function (error) {
							cb();
						};
					} else cb();
				}
				function onFocus() {
					input.removeEventListener("focus", onFocus, true);
					setTimeout(function () {
						input.removeEventListener("change", changeFile, true);
					}, 1000);
				}
				document.body.addEventListener("focus", onFocus, true);
			} else {
				function openLibraryCamera (mode) {
					var options = {
						quality: 50,
						destinationType: Camera.DestinationType.DATA_URL,
						sourceType: mode,
						encodingType: Camera.EncodingType.JPEG,
						mediaType: Camera.MediaType.PICTURE,
						allowEdit: false,
						correctOrientation: true
					}
					navigator.camera.getPicture(function (imageData) {
						cb('data:image/jpeg;base64,'+imageData);
					}, function (error) {
						cb();
					}, options);
				  }
				var buttons = [
					{ text: '<div class="div-actionsheet">'+$rootScope.translate('TAKE_IMAGE_FROM_CAMERA')+' <i class="ion-camera i-actionsheet"></i></div>' },
					{ text: '<div class="div-actionsheet">'+$rootScope.translate('TAKE_IMAGE_FROM_LIBRARY')+' <i class="ion-images i-actionsheet"></i></div>' }
				];
				var sheet = $ionicActionSheet.show({
					buttons: buttons,
					cancelText: $rootScope.translate('cancel_V2'),
					cancel: function() {},
					buttonClicked: function(index) {
						sheet();
							if (typeof Camera != 'undefined') {
							openLibraryCamera(index==0?Camera.PictureSourceType.CAMERA:Camera.PictureSourceType.PHOTOLIBRARY);
						}
					}
				});
			}
		}

		$rootScope.orderViewMore = function(order, tab) {
			$scope.ordersubtotal=[];
				MyModal.showTemplate('templates/'+ADDONS.template+'/views/my-order-detail.html', {
					scope: $scope,
					animation: 'slide-in-up'
				}).then(function(modal) {
					modals.push(modal);
					$scope.modal_detail = modal;
					$scope.modal_detail.show();
					if (order.business && order.business.location) order.business.location = $scope.getJson(order.business.location);
					if (order.driver && order.driver.location) order.driver.location = $scope.getJson(order.driver.location);
					if (order.customer && order.customer.location) order.customer.location = $scope.getJson(order.customer.location);
					modal.scope.order = order;
					modal.scope.user = gUser.getData();
					modal.scope.tab = 0;
					modal.scope.message = {
						comment: '',
						canSee: {
							customer: true,
							driver: modal.scope.order.driver_id?true:false,
							administrator: true,
							business: true
						},
						type: 2,
						file: null
					};
					modal.scope.messages = [];
					Ordering.orders.messages.all({
						order_id: order.id
					}, function (res) {
						var messages = [];
						if (res.result.length == 0 || res.result[0].type != 0) {
							var message = {
								type: 0,
								direction: 'general',
								comment: $scope.translate('ORDER_PLACED_FOR_VIA').replace('_for_', '<b>'+$scope.parseDate(order.delivery_datetime)+'</b>').replace('_via_', '<b>'+$scope.translate(order.app_id?order.app_id.toUpperCase():'OTHER')+'</b>'),
								created_at: order.created_at
							};
							messages.push(message);
						}
						for (var i = 0; i < res.result.length; i++) {
							var message = res.result[i];
							if (message.type > 1) {
								message.direction = message.author_id==gUser.getData().id?'to':'from';
							} else {
								message.direction = 'general';
								if (message.type == 0) {
									message.comment = $scope.translate('ORDER_PLACED_FOR_VIA').replace('_for_', '<b>'+$scope.parseDate(order.delivery_datetime)+'</b>').replace('_via_', '<b>'+$scope.translate(message.app_id?message.app_id.toUpperCase():'OTHER')+'</b>');
								} else if (message.change.attribute == 'distance') {
									message.comment = $scope.translate('THE_DRIVER_IS_CLOSE')+' <b>('+message.driver.name+(message.driver.lastname?' '+message.driver.lastname:'')+')</b>';
								} else if (message.change.attribute == 'status') {
									if (message.change.new == 8 && message.change.estimated) {
										var estimated_delivery = message.change.estimated;
										message.comment = $scope.translate('ORDER_ATTRIBUTE_CHANGED_FROM_TO').replace('_attribute_', '<b>'+$scope.translate(message.change.attribute.toUpperCase()).toLowerCase()+'</b>').replace('_from_', '<b>'+$scope.getOrderState(message.change.old*1)+'</b>').replace('_to_', '<b>'+$scope.getOrderState(message.change.new*1)+'</b>')+'<br>'+$scope.translate('ESTIMATED_DELIVERY_TIME').replace('_min_', estimated_delivery);
									} else if (message.change.new == 7 && message.change.estimated) {
										var estimated_preparation = message.change.estimated;
										message.comment = $scope.translate('ORDER_ATTRIBUTE_CHANGED_FROM_TO').replace('_attribute_', '<b>'+$scope.translate(message.change.attribute.toUpperCase()).toLowerCase()+'</b>').replace('_from_', '<b>'+$scope.getOrderState(message.change.old*1)+'</b>').replace('_to_', '<b>'+$scope.getOrderState(message.change.new*1)+'</b>')+'<br>'+$scope.translate('ESTIMATED_PREPARATION_TIME').replace('_min_', estimated_preparation);
									} else if ([2, 5, 6, 10, 12].indexOf(message.change.new) != -1 && message.change.comment) {
										message.comment = $scope.translate('ORDER_ATTRIBUTE_CHANGED_FROM_TO').replace('_attribute_', '<b>'+$scope.translate(message.change.attribute.toUpperCase()).toLowerCase()+'</b>').replace('_from_', '<b>'+$scope.getOrderState(message.change.old*1)+'</b>').replace('_to_', '<b>'+$scope.getOrderState(message.change.new*1)+'</b>');
										message.comment += "<br>'"+message.change.comment+"'.";
									} else {
										message.comment = $scope.translate('ORDER_ATTRIBUTE_CHANGED_FROM_TO').replace('_attribute_', '<b>'+$scope.translate(message.change.attribute.toUpperCase()).toLowerCase()+'</b>').replace('_from_', '<b>'+$scope.getOrderState(message.change.old*1)+'</b>').replace('_to_', '<b>'+$scope.getOrderState(message.change.new*1)+'</b>');
									}
								} else if (message.change.attribute == 'driver_id') {
									if (message.driver) {
										message.comment = $scope.translate('DRIVER_ASSIGNED_AS_DRIVER').replace('_driver_', '<b>'+message.driver.name+' '+(message.driver.lastname?message.driver.lastname:'')+'</b>');
									} else {
										message.comment = $scope.translate('DRIVER_UNASSIGNED');
									}
								} else if (message.change.attribute != 'comment') {
									if (message.change.old) {
										message.comment = $scope.translate('ORDER_ATTRIBUTE_CHANGED_FROM_TO').replace('_attribute_', '<b>'+$scope.translate(message.change.attribute.toUpperCase()).toLowerCase()+'</b>').replace('_from_', '<b>'+message.change.old+'</b>').replace('_to_', '<b>'+message.change.new+'</b>');
									} else {
										message.comment = $scope.translate('ORDER_ATTRIBUTE_CHANGED_TO').replace('_attribute_', '<b>'+$scope.translate(message.change.attribute.toUpperCase()).toLowerCase()+'</b>').replace('_to_', '<b>'+message.change.new+'</b>');
									}
								} else continue;
							}
							messages.push(message);
						}
						modal.scope.messages = messages;
						if (modal.scope.tab == 1) modal.scope.readMessages();
					});
					modal.scope.readMessages = function () {
						if (modal.scope.messages.length > 0 && order.unread_count > 0) {
							Ordering.orders.messages.read({
								order_id: order.id,
								order_message_id: modal.scope.messages[modal.scope.messages.length-1].id,
							}, function (res) {
								order.unread_count = 0;
							});
						}
					}
					sockets['messageOrdersManager'] = io(SOCKET_URL, {
						extraHeaders: {
							Authorization: "Bearer "+localStorageApp.getItem(STORE.TOKEN),
						},
						query: "token="+localStorageApp.getItem(STORE.TOKEN)+"&project="+API_PROJECT_NAME,
						transports: [ 'websocket' ]
					});
					sockets['messageOrdersManager'].on('connect', function () {
						var message_orders = API_PROJECT_NAME+'_messages_orders_'+order.id+'_'+modal.scope.user.level;
						sockets['messageOrdersManager'].emit('join', message_orders);
						sockets['messageOrdersManager'].on('message', function (message) {
							var messages = modal.scope.messages.filter(function (filter) {
								return filter.id == message.id;
							});
							if (messages.length == 0) {
								if (message.type > 1) {
									message.direction = message.author_id==gUser.getData().id?'to':'from';
								} else {
									message.direction = 'general';
									if (message.type == 0) {
										message.comment = $scope.translate('ORDER_PLACED_FOR_VIA').replace('_for_', '<b>'+$scope.parseDate(order.delivery_datetime)+'</b>').replace('_via_', '<b>'+$scope.translate(message.app_id?message.app_id.toUpperCase():'OTHER')+'</b>');
									} else if (message.change.attribute == 'distance') {
										message.comment = $scope.translate('THE_DRIVER_IS_CLOSE')+' <b>('+message.driver.name+(message.driver.lastname?' '+message.driver.lastname:'')+')</b>';
									} else if (message.change.attribute == 'status') {
										if (message.change.new == 8 && message.change.estimated) {
											var estimated_delivery = message.change.estimated;
											message.comment = $scope.translate('ORDER_ATTRIBUTE_CHANGED_FROM_TO').replace('_attribute_', '<b>'+$scope.translate(message.change.attribute.toUpperCase()).toLowerCase()+'</b>').replace('_from_', '<b>'+$scope.getOrderState(message.change.old*1)+'</b>').replace('_to_', '<b>'+$scope.getOrderState(message.change.new*1)+'</b>')+'<br>'+$scope.translate('ESTIMATED_DELIVERY_TIME').replace('_min_', estimated_delivery);
										} else if (message.change.new == 7 && message.change.estimated) {
											var estimated_preparation = message.change.estimated;
											message.comment = $scope.translate('ORDER_ATTRIBUTE_CHANGED_FROM_TO').replace('_attribute_', '<b>'+$scope.translate(message.change.attribute.toUpperCase()).toLowerCase()+'</b>').replace('_from_', '<b>'+$scope.getOrderState(message.change.old*1)+'</b>').replace('_to_', '<b>'+$scope.getOrderState(message.change.new*1)+'</b>')+'<br>'+$scope.translate('ESTIMATED_PREPARATION_TIME').replace('_min_', estimated_preparation);
										} else if ([2, 5, 6, 10, 12].indexOf(message.change.new) != -1 && message.change.comment) {
											message.comment = $scope.translate('ORDER_ATTRIBUTE_CHANGED_FROM_TO').replace('_attribute_', '<b>'+$scope.translate(message.change.attribute.toUpperCase()).toLowerCase()+'</b>').replace('_from_', '<b>'+$scope.getOrderState(message.change.old*1)+'</b>').replace('_to_', '<b>'+$scope.getOrderState(message.change.new*1)+'</b>');
											message.comment += "<br>'"+message.change.comment+"'.";
										} else {
											message.comment = $scope.translate('ORDER_ATTRIBUTE_CHANGED_FROM_TO').replace('_attribute_', '<b>'+$scope.translate(message.change.attribute.toUpperCase()).toLowerCase()+'</b>').replace('_from_', '<b>'+$scope.getOrderState(message.change.old*1)+'</b>').replace('_to_', '<b>'+$scope.getOrderState(message.change.new*1)+'</b>');
										}
									} else if (message.change.attribute == 'driver_id') {
										if (message.driver) {
											message.comment = $scope.translate('DRIVER_ASSIGNED_AS_DRIVER').replace('_driver_', '<b>'+message.driver.name+' '+(message.driver.lastname?message.driver.lastname:'')+'</b>');
										} else {
											message.comment = $scope.translate('DRIVER_UNASSIGNED');
										}
									} else if (message.change.attribute != 'comment') {
										message.comment = $scope.translate('ORDER_ATTRIBUTE_CHANGED_FROM_TO').replace('_attribute_', '<b>'+$scope.translate(message.change.attribute.toUpperCase()).toLowerCase()+'</b>').replace('_from_', '<b>'+message.change.old+'</b>').replace('_to_', '<b>'+message.change.new+'</b>');
									} else return;
								}
								modal.scope.messages.push(message);
								order.unread_count++;
								if (modal.scope.tab == 1) modal.scope.readMessages();
							}
						});
					});
					modal.scope.changeTab = function (tab) {
						modal.scope.tab = tab;
						if (tab == 1) {
							SHOW_INAPP_NOTIFICATIONS = false;
							modal.scope.readMessages();
							setTimeout(function () {
								var elements = $('.chat').siblings(':visible');
								var content = $('.chat').parents('ion-content');
								var height = 0;
								for (var i = 0; i < elements.length; i++) {
									var element = elements[i];
									height += $(element).outerHeight(true);
								}
								var h = content.height()-height;
								$('.chat').height(h);
								if (lastScrollHeight) $('.messages').scrollTop(lastScrollHeight);
							}, 20);
						} else {
							SHOW_INAPP_NOTIFICATIONS = true;
						}
					};
					var lastScrollHeight = 0;
					var checkScrollHeight = setInterval(function () {
						if ($('.messages').length == 0) return;
						if ($('.messages')[0].scrollHeight != lastScrollHeight) {
							lastScrollHeight = $('.messages')[0].scrollHeight;
							$('.messages').scrollTop(lastScrollHeight);
						}
					}, 100);
					intervals.push(checkScrollHeight);

					modal.scope.openChooseFile = function () {
						$rootScope.getImageFile('chat_image', function (base64) {
							if (base64) {
								modal.scope.message.file = base64;
								modal.scope.message.type = 3;
							} else {
								modal.scope.message.file = null;
								modal.scope.message.type = 2;
							}
						});
					}

					modal.scope.clearFile = function () {
						modal.scope.message.file = null;
						modal.scope.message.type = 2;
						$('#chat_image').val('');
					}

					modal.scope.sendMessage = function () {
						if (!modal.scope.message.comment && modal.scope.message.type == 2) return;
						if (!modal.scope.message.file && modal.scope.message.type == 3) return;
						var can_see = [];
						if (modal.scope.message.canSee.administrator) can_see.push(0);
						if (modal.scope.message.canSee.business) can_see.push(2);
						if (modal.scope.message.canSee.customer) can_see.push(3);
						if (modal.scope.message.canSee.driver) can_see.push(4);
						MyLoading.show($scope.translate('LOADING')+'...');
						Ordering.orders.messages.add({
							order_id: order.id,
							type: modal.scope.message.type,
							comment: modal.scope.message.comment?modal.scope.message.comment:null,
							file: modal.scope.message.file?modal.scope.message.file:null,
							can_see: can_see.join(',')
						}, function (res) {
							MyLoading.hide();
							if (!res.error) {
								var _message = modal.scope.messages.find(function (__message) {
									return res.result.id === __message.id
								})
								if (!_message) {
									res.result.direction = res.result.author_id==gUser.getData().id?'to':'from';
									modal.scope.messages.push(res.result);
								}
								modal.scope.message.type = 2;
								modal.scope.message.comment = '';
								modal.scope.message.file = null;
								$('#chat_image').val('');
							} else MyAlert.show(res.result);
						});
					}

					modal.scope.track = function () {
						////if ([8, 9].indexOf(modal.scope.order.status) == -1) return;
						MyModal.showTemplate('templates/'+ADDONS.template+'/views/track-position-real-time.html', {
							scope: $scope,
							animation: 'slide-in-up'
						}).then(function(modal_track) {
							modals.push(modal_track);
							modal_track.scope.driver_icon = {
								name: modal.scope.order.driver.name,
								photo: modal.scope.order.driver.photo?modal.scope.order.driver.photo:$scope.rootTheme+"/img/profile.png",
								status: modal.scope.order.status,
								id: modal.scope.order.id,
								comment: ''
							}
							modal_track.scope.getColor = function () {
								return ([0,6,10,12].indexOf(modal_track.scope.driver_icon.status)==-1)?'green':'red';
							}
							modal_track.show().then(function () {
								if (order.business && order.business.location) order.business.location = $scope.getJson(order.business.location);
								if (order.driver && order.driver.location) order.driver.location = $scope.getJson(order.driver.location);
								if (order.customer && order.customer.location) order.customer.location = $scope.getJson(order.customer.location);
								$scope.loadGoogleMaps(function () { 
									var map = new google.maps.Map(document.getElementById('order-track-map'), {
										center: order.customer.location,
										zoom: 15,
										mapTypeControl: false,
										streetViewControl: false,
										rotateControl: false,
										fullscreenControl: false
									});
									var business_marker = null;
									var driver_marker = null;
									var customer_marker = null;
									var bounds = new google.maps.LatLngBounds();
									if (order.business.location) {
										bounds.extend(order.business.location);
										business_marker = new MarkerWithLabel({
											position: order.business.location,
											draggable: false,
											raiseOnDrag: false,
											map: map,
											labelContent: '<div><img src="'+$scope.optimizeImage(order.business.logo, 'h_100,c_limit')+'" onerror="this.src=\'templates/'+ADDONS.template+'/img/icon.png\'"></img></div>',
											labelAnchor: new google.maps.Point(19, 45),
											labelClass: "pin business",
											labelStyle: {opacity: 1}
										});
									}
									if (order.driver.location) {
										bounds.extend(order.driver.location);
										driver_marker = new MarkerWithLabel({
											position: order.driver.location,
											draggable: false,
											raiseOnDrag: false,
											map: map,
											labelContent: '<div><img src="'+$scope.optimizeImage('templates/'+ADDONS.template+'/img/car.png', 'h_100,c_limit')+'"></img></div>',
											labelAnchor: new google.maps.Point(19, 45),
											labelClass: "pin driver active",
											labelStyle: {opacity: 1}
										});
									}
									if (order.customer.location) {
										bounds.extend(order.customer.location);
										customer_marker = new MarkerWithLabel({
											position: order.customer.location,
											draggable: false,
											raiseOnDrag: false,
											map: map,
											labelContent: '<div><img src="templates/'+ADDONS.template+'/img/profile.png" onerror="this.src=\'templates/'+ADDONS.template+'/img/profile.png\'"></img></div>',
											labelAnchor: new google.maps.Point(19, 45),
											labelClass: "pin customer",
											labelStyle: {opacity: 1}
										});
									}
									map.fitBounds(bounds);
									var socket = io(SOCKET_URL, {
										extraHeaders: {
											Authorization: "Bearer "+localStorageApp.getItem(STORE.TOKEN),
										},
										query: "token="+localStorageApp.getItem(STORE.TOKEN)+"&project="+API_PROJECT_NAME,
										transports: [ 'websocket' ]
									});
									socket.on('connect', function () {
										var drivers_room = API_PROJECT_NAME+'_drivers_'+order.driver.id;
										socket.emit('join', drivers_room);
										socket.on('tracking_driver', function (data) {
											setTimeout(function () {
												order.driver.location = data.location;
												if (driver_marker) {
													driver_marker.setPosition(new google.maps.LatLng(data.location.lat, data.location.lng));
												}else {
													bounds.extend(data.location);
													driver_marker = new MarkerWithLabel({
													position: data.location,
													draggable: false,
													raiseOnDrag: false,
													map: map,
													labelContent: '<div><img src="'+$scope.optimizeImage('templates/'+ADDONS.template+'/img/car.png', 'h_100,c_limit')+'"></img></div>',
													labelAnchor: new google.maps.Point(19, 45),
													labelClass: "pin driver active",
													labelStyle: {opacity: 1}
													});
													map.fitBounds(bounds);
												}
												
											}, 100);
										});
									});
								})
							});
							modal_track.scope.hide = function () {
								modal_track.hide();
								modal_track.remove();
							}
							var blockSend = false;
							modal_track.scope.sendMessage = function () {
								if (!modal_track.scope.driver_icon.comment || blockSend) return;
								blockSend = true;
								MyLoading.show($scope.translate('LOADING')+'...');
								Ordering.orders.messages.add({
									order_id: order.id,
									type: 2,
									comment: modal_track.scope.driver_icon.comment,
									can_see: '0,2,3,4'
								}, function (res) {
									MyLoading.hide();
									if (!res.error) {
										var _message = modal.scope.messages.find(function (__message) {
											return res.result.id === __message.id
										})
										if (!_message) {
											res.result.direction = res.result.author_id==gUser.getData().id?'to':'from';
											modal.scope.messages.push(res.result);
										}
										modal_track.scope.driver_icon.comment  = '';
									} else MyAlert.show(res.result);
									blockSend = false;
								});
							}
							modal_track.$el.on('click', function(e) {
								if (modal_track.backdropClickToClose && e.target === modal_track.el) {
									modal_track.hide();
									modal_track.remove();
								}
							});
						});
					}

					modal.$el.on('click', function(e) {
						if (modal.backdropClickToClose && e.target === modal.el) {
							modal.hide();
							modal.remove();
							if (sockets['messageOrdersManager']) {
								sockets['messageOrdersManager'].close();
								delete sockets['messageOrdersManager'];
							}
							$location.search('order', null);
							SHOW_INAPP_NOTIFICATIONS = true;
						}
					});
					modal.scope.hide = function () {
						$location.search('order', null);
						modal.hide();
						modal.remove();
						if (sockets['messageOrdersManager']) {
							sockets['messageOrdersManager'].close();
							delete sockets['messageOrdersManager'];
						}
						SHOW_INAPP_NOTIFICATIONS = true;
					}
					if (tab && tab != 0) modal.scope.changeTab(tab);
				});
			// }
		}

		$rootScope.reOrder = function(order, isClose) {
			gStates.setState(STATE.CART_DETAIL_BACK);
			
			MyLoading.show($scope.translate('LOADING')+'...');
			var addressData = gAddress.getData();
			if (addressData == null) {
				addressData = {
					location: gUser.getData().location,
					address: gUser.getData().address
				}
			}
			Ordering.business.get({
				id_or_slug: order.business_id,
				type: order.delivery_type,
				location: addressData.location.lat+','+addressData.location.lng
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					if (res.result && res.result.valid_service) {
						// ---  initializing cart ----
						if (res.result.lazy_load_products_recommended) {
							return MyAlert.show($scope.translate('CANT_REORDER_FOR_THIS_BUSINESS'))

							// var products_ids = order.products.map(function(pro){
							// 	return pro.product_id;
							// })
							
							// var where = [
							// 	{
							// 		attribute: 'id',
							// 		value: products_ids
							// 	}
							// ]
							// Ordering.business.products({
							// 	id: order.business_id,
							// 	where: where
							// }, function(res) {
							// 	if(!res.error) {
							// 		var reorder_products = [];
							// 		reorder_products = res.result.map(function (product) {
							// 			var order_product = {
							// 				id: product.id,
							// 				name: product.name,
							// 				images: product.images,
							// 				extended_options: [],
							// 				quantity: 1,
							// 				code: $scope.generateRandom(6),
							// 				options: [],
							// 				extended_options: [],
							// 				price: product.price,
							// 				total: product.price,
							// 				ingredients: [],
							// 				balance: product.inventoried ? product.quantity : 0
							// 			};
										
							// 			cur_product = order.products.find(function (pro) {
							// 				return pro.id == order_product.id;
							// 			})
							// 			if (cur_product) {
							// 				console.log(cur_product)
							// 				order_product.data_options = cur_product.data_options;
							// 				order_product.quantity = cur_product.quantity;
							// 				order_product.comment = cur_product.comment?cur_product.comment:'';
							// 				order_product.extended_options = cur_product.extended_options;
							// 				order_product.ingredients = cur_product.ingredients;

							// 				// order_product.cur_product = cur_product;
							// 				var subtotal = order_product.price
							// 				for (var i = 0; i < order_product.options.length; i++) {
							// 					for (var  j = 0; j < order_product.options[i].suboptions.length; j++) {
							// 						subtotal += order_product.options[i].suboptions[j].price;
							// 						order_product.data_options[''+order.products[i].options[j].suboptions[k].id] = true;
							// 					}
												
							// 				}
							// 				order_product.total = order_product.quantity*subtotal;
							// 				var ori = cur_product.ingredients?cur_product.ingredients:[];
							// 				if (ori.length > 0) {
							// 					ori.map(function (item) {
							// 						item['selected'] = true;
							// 						for (var i = 0; i < order_product.ingredients.length; i++) {
							// 							if (item.id == order_product.ingredients[i].id) {
							// 								item['selected'] = false;
							// 								break;
							// 							}
							// 						}
							// 					})
							// 				}
							// 				order_product.ingredients = ori == undefined ? [] : ori;
							// 			};
							// 			return order_product;
							// 		})
							// 		console.log(reorder_products)
							// 		gCart.setData(reorder_products);
							// 	}
							// })
						}
						var products = [];
						for (var i = 0; i < order.products.length; i++) {
							order.products[i]['code'] = $rootScope.generateRandom(6);
							var subtotal = order.products[i].price;
							order.products[i]['data_options'] = {};
							for (var j = 0; j < order.products[i].options.length; j++) {
								for (var k = 0; k < order.products[i].options[j].suboptions.length; k++) {
									subtotal += order.products[i].options[j].suboptions[k].price;
									order.products[i].data_options[''+order.products[i].options[j].suboptions[k].id] = true;
								}
							}
							order.products[i]['total'] = order.products[i].quantity*subtotal;
							order.products[i].id = order.products[i].product_id;
							order.products[i].extended_options = [];
							delete(order.products[i].product_id);
							// config ingredients
							var categories = res.result.categories;
							for (var j = 0; j < categories.length; j++) {
								for (var jj = 0; jj < categories[j].products.length; jj++) {
									if (categories[j].products[jj].id == order.products[i].id) {
										var ori = categories[j].products[jj].ingredients;
										if (ori.length > 0) {
											var cur = order.products[i].ingredients ? order.products[i].ingredients : [];
											ori.map(function(item){
												item['selected'] = true;
												for (var ii = 0; ii < cur.length; ii++) {
													if (item.id == cur[ii].id) {
														item['selected'] = false;
														break;
													}
												}
											});
											console.log(ori);
										}
									}
								}
							}
							order.products[i].ingredients = ori == undefined ? [] : ori;
							products.push(order.products[i]);
						}
						//console.log(products)
						gCart.setData(products);
						// ---- end adding cart ------
						gBusiness.setData(res.result);
						gOrder.setData({
							type: '' + order.delivery_type,
							address: addressData.address,
							lat: addressData.location.lat,
							lng: addressData.location.lng,
							position: addressData.location,
							business_slug: res.result.slug
						});
						$rootScope.refreshNumCart();
						if (!ADDONS.web_template && isClose) {
							if (modals[modals.length - 1].scope.close) modals[modals.length - 1].scope.close();
							else if (modals[modals.length - 1].scope.hide) modals[modals.length - 1].scope.hide();
							else if (modals[modals.length - 1].isShown()) {
								modals[modals.length - 1].hide();
								modals[modals.length - 1].remove();
							}
							$state.go(app_states.finalCheckOut);
						} else {
							$state.go(app_states.finalCheckOut);
						}
					} else {
						if (res.result)
							MyAlert.show($scope.translate('INVALID_SERVICE_REORDER'));
						else MyAlert.show($scope.translate('BUSINESS_NOT_ENABLED'));
					}
				} else {
					MyAlert.show(res.result);
				}
			});

		}

		$rootScope.openAddress = function (cb) {
			MyModal.showTemplate('templates/'+ADDONS.template+'/views/select-address-business.html', {
				scope: $scope,
				//animation: 'slide-in-left',
				animation: 'none',
			}).then(function(address_modal) {
				var address_selected = false;
				address_modal.scope.order_types = [
					{
						type: "1",
						name: $scope.translate('DELIVERY'),
					},
					{
						type: "2",
						name: $scope.translate('PICKUP'),
					},
					{
						type: "3",
						name: $scope.translate('EATIN'),
					},
					{
						type: "4",
						name: $scope.translate('CURBSIDE'),
					},
					{
						type: "5",
						name: $scope.translate('DRIVER_THRU'),
					},
				];
				address_modal.scope.order_data = {
					type: (DEFAULT_ORDER_TYPE=='delivery'||!ADDONS.pickup)? '1' : '2',
					city: "",
					dropdownoption: ""
				};
				if (gOrder.getData().type) address_modal.scope.order_data.type = gOrder.getData().type;
				address_modal.scope.create_order = localStorageApp.getItem(STORE.CREATE_ORDER) != null;
				if (address_modal.scope.create_order) modals.push(address_modal);
				address_modal.scope.cities = [/*{
					name: address_modal.scope.MLanguages.FRONT_SELECT_CITY,
					id: ""
				}*/];
				address_modal.scope.dropdownoptions = [/*{
					id: "",
					name: address_modal.scope.MLanguages.FRONT_SELECT_NEIBORHOOD,
					enabled: true
				}*/];
				if (!SEARCH_BY_ADDRESS) {
					Ordering.countries.all({}, function (res) {
						MyLoading.hide();
						if (!res.error) {
							for (var i = 0; i < res.result.length; i++) {
								for (var j = 0; j < res.result[i].cities.length; j++) {
									if (res.result[i].cities[j].enabled && res.result[i].cities[j].options.length > 0) {
										address_modal.scope.cities.push(res.result[i].cities[j]);
										address_modal.scope.dropdownoptions = address_modal.scope.dropdownoptions.concat(res.result[i].cities[j].options);
									}
								}
							}
						}
					});
				}
				if (!address_modal.scope.create_order) {
					if (SEARCH_BY_ADDRESS && gOrder.getData().address) {
						address_modal.scope.order_data.address = gOrder.getData().address;
						address_modal.scope.order_data.position = gOrder.getData().position;
						address_selected = true;
					}
				}

				if (!ADDONS.advanced_search) {
					$timeout(function () {
						var options = {
							types: [],
						};
						if(FULL_ADDRESS_ONLY){
							options.types.push('address');
						}
						if (COUNTRY_AUTOCOMPLETE != "*") options.componentRestrictions = {
							country: COUNTRY_AUTOCOMPLETE
						}
						var input = document.getElementById('check-address');
						var autocomplete = new google.maps.places.Autocomplete(input, options);
						autocomplete.setFields(['place_id', 'formatted_address', 'geometry']);
						autocomplete.addListener('place_changed', function () {
							address_modal.scope.order_data.address = input.value;
							address_modal.scope.order_data.position = {
								lat: autocomplete.getPlace().geometry.location.lat(),
								lng: autocomplete.getPlace().geometry.location.lng()
							}
							address_modal.scope.order_data.position.from_google = false;
							address_selected = true;
						});
						input.onkeydown = function () {
							address_selected = false;
						}
					}, 150);
				}

				address_modal.scope.map = function () {
					if (ADDONS.advanced_search) {
						$('input').blur();
						$scope.showMap(ADDRESS.street, { lat: ADDRESS.latitude, lng: ADDRESS.longitude }, function (location) {
							address_modal.scope.order_data.address = location.address;
							address_modal.scope.order_data.position = location.position;
							address_selected = true;
						});
					}
				}

				address_modal.scope.errors = {
					address: false
				};

				address_modal.scope.check = function () {
					if (SEARCH_BY_ADDRESS && GOOGLE_AUTOCOMPLETE_SELECTION_REQUIRED && (!address_selected && !address_modal.scope.order_data.position)) {
						MyAlert.show($scope.translate('SELECT_ADDRESS_FROM_AUTOCOMPLETE'));
						return;
					}
					if (!gCreateOrderBuyer.getData().id || gCreateOrderBuyer.getData().id == -1) {
						var user = gCreateOrderBuyer.getData();
						/*var user = {
							id: -1,
							cellphone: $scope.curDataOrder.cellphone
						}*/
						user.cellphone = $scope.curDataOrder.cellphone;
						gCreateOrderBuyer.setData(user);
					}
					var data = {
						id_or_slug: gBusiness.getData().slug,
						type: address_modal.scope.order_data.type
					};
					if (!SEARCH_BY_ADDRESS || (address_modal.scope.create_order && !SEARCH_BY_ADDRESS)) {
						if (address_modal.scope.order_data.city == '') return MyAlert.show($scope.translate('FRONT_SELECT_CITY'));
						else if (address_modal.scope.order_data.dropdownoption == '') return MyAlert.show($scope.translate('FRONT_SELECT_NEIBORHOOD'));
						data.city = address_modal.scope.order_data.city;
						data.dropdownoption = address_modal.scope.order_data.dropdownoption;
						address_modal.scope.search(data);
					} else if (address_modal.scope.order_data.address) {
						if (!address_modal.scope.order_data.position || address_modal.scope.order_data.position.from_google) {
							MyLoading.show($scope.translate('LOADING')+'...');
							Geolocation.locationByAddress(address_modal.scope.order_data.address, function (res) {
								MyLoading.hide();
								address_modal.scope.order_data.address = res.address;
								address_modal.scope.order_data.position = res.location;
								address_modal.scope.order_data.position.from_google = true;
								data.location = address_modal.scope.order_data.position.lat+','+ address_modal.scope.order_data.position.lng;
								address_modal.scope.search(data);
							});
						} else {
							address_modal.scope.order_data.position.from_google = false;
							data.location = address_modal.scope.order_data.position.lat+','+ address_modal.scope.order_data.position.lng;
							address_modal.scope.search(data);
						}
					} else {
						if (SEARCH_BY_ADDRESS) address_modal.scope.errors.address = true;
					}
				}
				address_modal.scope.search = function (data) {
					MyLoading.show($scope.translate('LOADING')+'...');
					if (gPreorder.getData().menu_id) data.menu_id = gPreorder.getData().menu_id;
					Ordering.business.get(data, function (res) {
						MyLoading.hide();
						if (!res.error && res.result.valid_service) {
							var data = gOrder.getData();
							if (SEARCH_BY_ADDRESS) {
								data.address = address_modal.scope.order_data.address;
								data.position = address_modal.scope.order_data.position;
							} else {
								data.city = address_modal.scope.order_data.city;
								data.dropdownoption = address_modal.scope.order_data.dropdownoption;
							}
							data.business_slug = res.result.slug;
							data.type = address_modal.scope.order_data.type;
							gOrder.setData(data);
							address_modal.hide();
							address_modal.remove();
							cb(res.result);
						} else {
							if (address_modal.scope.order_data.type == 1) MyAlert.show($scope.translate('FRONT_SORRY_DELIVERY_OPTION'));
							else MyAlert.show($scope.translate('MOBILE_VERY_FAR_FOR_PICKUP'));
						}
					});
				}
				if (address_modal.scope.create_order) {
					address_modal.scope.hide = function () {
						address_modal.hide();
						address_modal.remove();
					}
				}
				address_modal.show().then(function () {
				});
				address_modal.scope.hide = function () {
					address_modal.hide();
					address_modal.remove();
				}
			});
		}

		$rootScope.parseOrderData = function (cart, cart_data, business, order) {
			var str_products = '';
            for (var i = 0; i < cart.length; i++) {
                var product = cart[i];
                var str_product = '  ' + product.quantity + ' x ' + product.name + ': ' + $scope.currency + product.total.toFixed(2) + '\r\n';
                if (product.ingredients && product.ingredients.length > 0) {
                    str_product += '    ' + $scope.translate('NO') + ' ' + $scope.translate('Ingredients_V2') + '\r\n';
                    for (var j = 0; j < product.ingredients.length; j++) {
                        str_product += '      ' + product.ingredients[j].name + '\r\n';
                    }
                }
                for (var j = 0; j < product.options.length; j++) {
                    str_product += '    ' + product.options[j].name + '\r\n';
                    for (var k = 0; k < product.options[j].suboptions.length; k++) {
                        str_product += '      ' + product.options[j].suboptions[k].name + '  ' + $scope.currency + product.options[j].suboptions[k].price.toFixed(2) + '\r\n';
                    }
                }
                str_products += str_product;
            }
            var str_order = $scope.translate('ORDER_TO') + " " + business.name + ": \r\n" + $scope.translate('Order_details_V2') + ": \r\n" + str_products +
                $scope.translate('SUBTOTAL') + ": " + $scope.currency + ' ' + cart_data.subtotal.toFixed(2) + "\r\n";
            if (business.tax_type == 2) {
				str_order += $scope.translate('Tax_V2') + ": " + $scope.currency + cart_data.tax.toFixed(2) + "\r\n";
			}
            if (order.type == 1) {
                str_order += $scope.translate('MOBILE_CHECKOUT_DELIVERY_FEE') + ": " + $scope.currency  + business.delivery_price.toFixed(2) + "\r\n" +
                    $scope.translate('MOBILE_FRONT_DRIVER_TIP') + ": " + $scope.currency  + cart_data.driver_tip.toFixed(2) + "\r\n";
            }
            if (cart_data.service_fee > 0) str_order += $scope.translate('SERVICE_FEE') + ": " + $scope.currency  + cart_data.service_fee.toFixed(2) + "\r\n";
            if (cart_data.discount > 0) {
                str_order += $scope.translate('APP_DISCOUNT') + ": -" + $scope.currency + ' ' + cart_data.discount.toFixed(2) + "\r\n";
            }
            str_order += $scope.translate('TOTAL') + ": " + $scope.currency  + cart_data.total.toFixed(2);
            return str_order;
		}

		$rootScope.distanceBetweenLocations = function distance(location1, location2, unit) {
			if (!location1 || !location2 || !location1.lat || !location1.lng || !location2.lat || !location2.lng) {
				return 999999;
			} else if ((location1.lat == location2.lat) && (location1.lng == location2.lng)) {
				return 0;
			} else {
				var radlat1 = Math.PI * location1.lat/180;
				var radlat2 = Math.PI * location2.lat/180;
				var theta = location1.lng-location2.lng;
				var radtheta = Math.PI * theta/180;
				var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
				if (dist > 1) {
					dist = 1;
				}
				dist = Math.acos(dist);
				dist = dist * 180/Math.PI;
				dist = dist * 60 * 1.1515;
				if (unit === 'K') {
					dist = dist * 1.609344;
				} else if (unit === 'M') {
					dist = dist * 1.609344 * 1000;
				} else if (unit === 'N') {
					dist = dist * 0.8684;
				}
				return dist;
			}
		}

		$rootScope.parseDistance = function (km) {
			if (!km) km = 0;
			if (DISTANCE_UNIT_KM) return km.toFixed(2)+' '+$scope.translate('BUSINESS_LIST_OPTIONS_KM');
			else return (km*0.621371).toFixed(2)+' '+$scope.translate('BUSINESS_LIST_OPTIONS_MILES');
		}

		$rootScope.parseDate = function (date) {
			var parts_date = date.split(' ');
        	var o_date = new Date(parts_date[0].split('-')[0], parts_date[0].split('-')[1]-1, parts_date[0].split('-')[2], parts_date[1].split(':')[0], parts_date[1].split(':')[1], parts_date[1].split(':')[2], 0);
			var month = o_date.getMonth() + 1;
			var date = o_date.getFullYear()+(month<10?'/0':'/')+month+(o_date.getDate()<10?'/0':'/')+o_date.getDate();
			var hour = o_date.getHours();
			var minute = (o_date.getMinutes()<10?':0':':')+o_date.getMinutes();
			if (!TIME_FORMAT_24) {
				if (hour == 0) time = '12'+minute+' '+$scope.translate('AM');
				else if (hour < 12) time = (hour<10?'0':'')+hour+minute+' '+$scope.translate('AM');
				else if (hour == 12) time = hour+minute+' '+$scope.translate('PM');
				else if (hour > 12) time = ((hour-12)<10?'0':'')+(hour-12)+minute+' '+$scope.translate('PM');
			} else time = ((hour < 10)?'0':'')+hour+minute;
			return date+' '+time;
		}

		$rootScope.parseTime = function (time) {
			var str = '00:00';
			if (!time) return str;
			time.hour = parseInt(time.hour);
			time.minute = parseInt(time.minute);
			var minute = (time.minute<10?':0':':')+time.minute;
			if (!TIME_FORMAT_24) {
				if (time.hour == 0) str = '12'+minute+' '+$scope.translate('AM');
				else if (time.hour < 12) str = (time.hour<10?'0':'')+time.hour+minute+' '+$scope.translate('AM');
				else if (time.hour == 12) str = time.hour+minute+' '+$scope.translate('PM');
				else if (time.hour > 12) str = ((time.hour-12)<10?'0':'')+(time.hour-12)+minute+' '+$scope.translate('PM');
			} else str = (time.hour < 10?'0':'')+time.hour+minute;
			return str;
		}

		$rootScope.parseWaitTime = function (time) {
			if (!time) return '00:00';
			var parts = time.split(':');
			if (parts.length < 2) return '00:00';
			else {
				// return (parseInt(parts[0])<10?'0':'')+parseInt(parts[0])+':'+(parseInt(parts[1])<10?'0':'')+parseInt(parts[1])
				return (parseInt(parts[0]) < 10 && parseInt(parts[0]) > 0 ? '0' : '') + (parseInt(parts[0]) > 0 ? parseInt(parts[0]) + ':' : '') + (parseInt(parts[1]) < 10 ? '0' : '') + parseInt(parts[1])
			}
		}

		function getYoutubeCode(url){
			var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
			var match = url.match(regExp);
			return (match&&match[7].length==11)? match[7] : false;
		}

		$rootScope.getVideoEmbedded = function (video) {
			if (video.indexOf('youtube')) {
				return '<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/'+getYoutubeCode(video)+'" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
			}
		}

		$rootScope.reorderLapses = function (lapses) {
			return lapses.sort(function (a, b) {
				if (a.open.hour*60+a.open.minute < b.open.hour*60+b.open.minute) return -1;
				if (a.open.hour*60+a.open.minute > b.open.hour*60+b.open.minute) return 1;
				return 0;
			});
		}

		$rootScope.getProducts = function (categories) {
			if (!categories) return [];
			var products = [];
			for (var i = 0; i < categories.length; i++) {
				products = products.concat(categories[i].products);
			}
			return products;
		}

		function elementReady(id, cb) {
			var el = document.getElementById(id);
			if (!el) {
				setTimeout(function () {
					elementReady(id, cb);
				}, 100);
			} else cb(el)
		}
		
		$rootScope.openAddresses = function (callback) {
			var checkmode = false;
			var business_id = null;
			var order = null;
			if (["main.checkOut", "main.business", "restaurantSearch", "finalCheckOut"].indexOf($state.current.name) != -1) {
				business_id = gBusiness.getData().id;
				order = gOrder.getData();
				checkmode = true;
			}
			MyModal.showTemplate('templates/'+ADDONS.template+'/views/addresses-popup.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function (addresses_modal) {
				modals.push(addresses_modal);
				addresses_modal.scope.loading = true;
				addresses_modal.show().then(function () {
					addresses_modal.scope.addresses = [];
					if (!ADDONS.web_template && gUser.getData().id != -1) MyLoading.show($scope.translate('LOADING')+'...');
					if (gUser.getData().id != -1) {
						Ordering.users.addresses.all({
							user_id: gUser.getData().id
						}, function (res) {
							addresses_modal.scope.loading = false;
							if (!ADDONS.web_template) MyLoading.hide();
							if (!res.error) {
								addresses_modal.scope.addresses = res.result;
							} else MyAlert(res.result);
						});
					} 

					function checkAddress(address, callback) {
						if (checkmode) {
							MyLoading.show($scope.translate('LOADING')+'...');
							Ordering.business.get({
								id_or_slug: business_id,
								type: order.type,
								location: address.location.lat+','+address.location.lng
							}, function (res) {
								MyLoading.hide();
								callback(!res.error && res.result.valid_service);
							});
						} else callback(true);
					}

					addresses_modal.scope.change = function (address) {
						if (gAddress.getData() && gAddress.getData().id == address.id && !ADDONS.single_business) return;
						checkAddress(address, function (ok) {
							if (ok) {
								if (ADDONS.web_template) MyLoading.toast($scope.translate('LOADING')+'...');
								else MyLoading.show($scope.translate('LOADING')+'...');
								Ordering.users.addresses.update({
									id: address.id,
									user_id: gUser.getData().id,
									default: true
								}, function (res) {
									MyLoading.hide();
									if (!res.error) {
										if (ADDONS.web_template) MyLoading.success($scope.translate('ADDRESS_CHANGED'), 2000);
										addresses_modal.scope.addresses.forEach(function (address) {
											if (address.id != res.result.id) {
												address.default = false;
											} else address.default = true;
										});
										gAddress.setData(address);
										addresses_modal.scope.hide();
										if (callback) callback(address);
									} else MyAlert.show(res.result);
								})
							} else {
								if (order.type == 1) MyAlert.show($scope.translate('BUSINESS_NOT_DELIVERY_ADDRESS'));
								else MyAlert.show($scope.translate('BUSINESS_FAR_PICKUP_ADDRESS'));
							}
						});
					}

					addresses_modal.scope.edit = function (address) {
						$scope.openFullAddress(address, function (addr, modal) {
							checkAddress(addr, function (ok) {
								if (ok) {
									MyLoading.toast($scope.translate('LOADING')+'...');
									Ordering.users.addresses.update({
										id: addr.id,
										user_id: gUser.getData().id,
										name: addr.name,
										lastname: addr.lastname,
										cellphone: addr.cellphone,
										address: addr.address,
										internal_number: addr.internal_number,
										address_notes: addr.address_notes,
										location: JSON.stringify(addr.location),
										zipcode: addr.zipcode,
										map_data: JSON.stringify(addr.map_data),
										tag: addr.tag
									}, function (res) {
										MyLoading.hide();
										if (!res.error) {
											Object.assign(address, res.result);
											modal.scope.hide();
											if (res.result.default) {
												gAddress.setData(res.result);
											}
											if (callback) callback(address);
											MyLoading.success($scope.translate('ADDRESS_SAVED'), 2000);
										} else MyAlert.show(res.result);
									}, null, null, true);
								} else {
									if (order.type == 1) MyAlert.show($scope.translate('BUSINESS_NOT_DELIVERY_ADDRESS'));
									else MyAlert.show($scope.translate('BUSINESS_FAR_PICKUP_ADDRESS'));
								}
							});
						});
					}

					addresses_modal.scope.delete = function (address) {
						MyAlert.confirm($scope.translate('QUESTION_DELETE_ADDRESS')).then(function () {
							MyLoading.toast($scope.translate('LOADING')+'...');
							Ordering.users.addresses.delete({
								id: address.id,
								user_id: gUser.getData().id
							}, function (res) {
								MyLoading.hide();
								if (!res.error) {
									for (var i = 0; i < addresses_modal.scope.addresses.length; i++) {
										var addr = addresses_modal.scope.addresses[i];
										if (addr.id == address.id) {
											addresses_modal.scope.addresses.splice(i, 1);
											break;
										}
									}
									MyLoading.success($scope.translate('ADDRESS_DELETED'), 2000);
								} else MyAlert.show(res.result);
							});
						});
					}

					addresses_modal.scope.add = function () {
						$scope.openFullAddress(null, function (addr, modal) {
							MyLoading.toast($scope.translate('LOADING')+'...');
							if (gUser.getData().id != -1) {
								Ordering.users.addresses.add({
									user_id: gUser.getData().id,
									name: addr.name,
									lastname: addr.lastname,
									cellphone: addr.cellphone,
									address: addr.address,
									internal_number: addr.internal_number,
									address_notes: addr.address_notes,
									location: JSON.stringify(addr.location),
									zipcode: addr.zipcode,
									map_data: JSON.stringify(addr.map_data),
									tag: addr.tag,
									default: !checkmode
								}, function (res) {
									MyLoading.toast($scope.translate('LOADING')+'...');
									if (!res.error) {
										addresses_modal.scope.addresses.push(res.result);
										modal.scope.hide();
										addresses_modal.scope.addresses.forEach(function (address) {
											if (!checkmode && address.id != res.result.id) {
												address.default = false;
											} else if (!checkmode) address.default = true;
										});
										if (res.result.default) {
											gAddress.setData(res.result);
											if (callback) callback(res.result, addresses_modal);
										}
										MyLoading.success($scope.translate('ADDRESS_SAVED'), 2000);
									} else MyAlert.show(res.result);
								});
							} else {
								gAddress.setData({
									name: addr.name,
									lastname: addr.lastname,
									cellphone: addr.cellphone,
									address: addr.address,
									internal_number: addr.internal_number,
									address_notes: addr.address_notes,
									location: JSON.stringify(addr.location),
									zipcode: addr.zipcode,
									map_data: JSON.stringify(addr.map_data),
									tag: addr.tag,
								});
								addresses_modal.hide();
								modal.scope.hide();
							}
						});
					}
				});
			});
		}

		$rootScope.openFullAddress = function (address, cb) {
			MyModal.showTemplate('templates/'+ADDONS.template+'/views/address-popup.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function(open_full_address) {
				modals.push(open_full_address);
				open_full_address.scope.loading = true;
				open_full_address.scope.address = address?clone(address):{
					tag: 'home'
				};
				open_full_address.scope.address_selected = address && address.address && address.location;
				if (!open_full_address.scope.address.location) {
					open_full_address.scope.address.location = {
						lat: ADDRESS.latitude,
						lng: ADDRESS.longitude
					};
				}
				open_full_address.scope.from_autocomplete = false;
				open_full_address.scope.locationChangeAddress = clone(open_full_address.scope.address.location);
				open_full_address.scope.useLocatacion = function () {
					if (ADDONS.advanced_search) {
						MyLoading.show($scope.translate('MOBILE_GETTING_CURRENT_LOCATION'));
						navigator.geolocation.getCurrentPosition(function(res){
							if (res) {
								var geocoder = new google.maps.Geocoder;
								open_full_address.scope.address.location = {
									lat: res.coords.latitude,
									lng: res.coords.longitude
								};
								open_full_address.scope.locationChangeAddress = clone(open_full_address.scope.address.location);
								geocoder.geocode({'location': open_full_address.scope.address.location}, function(results, status) {
									if (status === 'OK') {
										open_full_address.scope.address.address = results[0].formatted_address;
										open_full_address.scope.address_selected = true;
										open_full_address.scope.address.map_data = {
											library: 'google',
											place_id: results[0].place_id
										};
										if ($scope.map) {
											$scope.map.setCenter(open_full_address.scope.address.location);
											$scope.marker.setPosition(open_full_address.scope.address.location)
										}
									} else {
										console.log('err')
									}
									MyLoading.hide();
								})
							} else {
								console.log(res);
								MyAlert.show(res);
							}
						},function(err){
							MyLoading.hide();
							console.log(err);
							MyAlert.show(err.message);
						});
					} else {
						$scope.checkGPS(function (gpsAvailable) {
							if (gpsAvailable) {
								MyLoading.show($scope.translate("LOADING")+'...');
								GeolocationSvc().then(function(position) {
									open_full_address.scope.address.location = position;
									open_full_address.scope.locationChangeAddress = clone(open_full_address.scope.address.location);
									var geocoder = new google.maps.Geocoder;
									geocoder.geocode({'location': position}, function(results, status) {
										MyLoading.hide();
										if (status === 'OK') {
											open_full_address.scope.address.address = results[0].formatted_address;
											open_full_address.scope.address_selected = true;
											open_full_address.scope.address.map_data = {
												library: 'google',
												place_id: results[0].place_id
											};
											if ($scope.map) {
												$scope.map.setCenter(open_full_address.scope.address.location);
												$scope.marker.setPosition(open_full_address.scope.address.location)
											}
										} else MyAlert.show($scope.translate('MOBILE_GET_LOCATION_ERROR'));
									})
								}).catch(function (err) {
									setTimeout(function () {
										MyLoading.hide();
									}, 10);
									MyAlert.show($scope.translate('MOBILE_GET_LOCATION_ERROR'));
								});
							} else {
								setTimeout(function () {
									MyLoading.hide();
								}, 10);
								MyAlert.show($scope.translate('MOBILE_GET_LOCATION_ERROR'));
							}
						});
					}
				}
				open_full_address.scope.addressfields = {};
				if (!ADDONS.web_template) MyLoading.show($scope.translate('LOADING')+'...');
				Ordering.validationfields.all({
					mode: 'dictionary',
					where: [{
						attribute: 'validate',
						value: 'address'
					}]
				}, function (res) {
					if (!ADDONS.web_template) MyLoading.hide();
					open_full_address.scope.loading = false;
					if (!res.error) {
						open_full_address.scope.addressfields = res.result;
					}
				});
				open_full_address.show().then(function () {
					// var input, el_map, map, marker, autocomplete;
					open_full_address.scope.$watch('loading', function (cur, pre) {
						if (cur) return;
						setTimeout(function () {
							var input = document.getElementById('address-input');
							var el_map = document.getElementById('address-map');
							input.focus();
							input.select();
							if (el_map) {
								var map = new google.maps.Map(el_map, {
									center: open_full_address.scope.address.location,
									zoom: 15,
									zoomControl: true,
									mapTypeControl: false,
									scaleControl: true,
									streetViewControl: false,
									rotateControl: false,
									fullscreenControl: false,
									scrollwheel: false,
									disableDoubleClickZoom: true
								});
								//function that handle the wheelEvent
								var bussy_scroll = false;
								function wheelEvent(event) {
									if (bussy_scroll) return;
									bussy_scroll = true;
									var e = window.event || e; // old IE support
									var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail))); //to know whether it was wheel up or down
									map.setZoom(map.getZoom() + delta);
									setTimeout(function () {
										bussy_scroll = false;
									}, 250)
								}
							
								function zoomIn() {
									map.setZoom(map.getZoom() + 1);	
								}
								//normal event listener on the map container
								el_map.addEventListener('mousewheel', wheelEvent, true);
								el_map.addEventListener('DOMMouseScroll', wheelEvent, true);
								//same with the double click
								el_map.addEventListener('dblclick', zoomIn, true);
								$scope.map = map;
								var marker = new google.maps.Marker({
									position: open_full_address.scope.address.location,
									map: map,
									title: 'Address'
								});
								$scope.marker = marker;

								var options = {
									types: []
								};
								if(FULL_ADDRESS_ONLY){
									options.types.push('address');
								}
								if (COUNTRY_AUTOCOMPLETE != "*") options.componentRestrictions = {
									country: COUNTRY_AUTOCOMPLETE
								}
								var center_changed = null;
								var geocoder = new google.maps.Geocoder();
								map.addListener('center_changed', function () {
									marker.setPosition(map.getCenter());
									open_full_address.scope.address.location = {
										lat: map.getCenter().lat(),
										lng: map.getCenter().lng()
									};
									if (open_full_address.scope.from_autocomplete) {
										open_full_address.scope.from_autocomplete = false;
										return;
									}
									if (center_changed) {
										clearTimeout(center_changed);
									}
									center_changed = setTimeout(function () {
										var distance = $scope.distanceBetweenLocations(open_full_address.scope.locationChangeAddress, {
											lat: map.getCenter().lat(),
											lng: map.getCenter().lng()
										}, 'M');
										if (distance > METERS_TO_CHANGE_ADDRESS) {
											MyLoading.show($scope.translate('LOADING')+'...');
											var myLatLng =  new google.maps.LatLng(open_full_address.scope.address.location.lat, open_full_address.scope.address.location.lng);
											geocoder.geocode({ 'latLng': myLatLng }, function(results, status) {
												MyLoading.hide();
												if (status === 'OK') {
													open_full_address.scope.address.address = results[0].formatted_address;
													open_full_address.scope.address_selected = true;
													open_full_address.scope.address.map_data = {
														library: 'google',
														place_id: results[0].place_id
													};
													open_full_address.scope.locationChangeAddress = clone(open_full_address.scope.address.location);
												} else {
													MyAlert.show($scope.translate('MOBILE_GET_LOCATION_ERROR'));
												}
											});
										};
										clearTimeout(center_changed);
									}, 300);
								});
							}
							if (input) {
								var autocomplete = new google.maps.places.Autocomplete(input, options);
								autocomplete.setFields(['place_id', 'formatted_address', 'geometry']);
								autocomplete.addListener('place_changed', function() {
									open_full_address.scope.from_autocomplete = true;
									map.setCenter(autocomplete.getPlace().geometry.location);
									marker.setPosition(autocomplete.getPlace().geometry.location);
									open_full_address.scope.address.address = input.value;
									open_full_address.scope.address.location = {
										lat: autocomplete.getPlace().geometry.location.lat(),
										lng: autocomplete.getPlace().geometry.location.lng()
									};
									open_full_address.scope.locationChangeAddress = clone(open_full_address.scope.address.location);
									open_full_address.scope.address.map_data = {
										library: 'google',
										place_id: autocomplete.getPlace().place_id
									};
									open_full_address.scope.address_selected = true;
								});
								
								window.addEventListener('native.keyboardshow', function(){
									if (document.activeElement.nodeName !== "INPUT") {
										var activeElement = document.querySelector("#address-input");
										if (activeElement) {
											activeElement.focus();
											$ionicScrollDelegate.scrollBottom(true);
										}
									}
								});

								input.onkeydown = function () {
									open_full_address.scope.address_selected = false;
								}
							}
						}, 150);
					})
					open_full_address.scope.save = function () {
						var errors = $scope.validateAddress(open_full_address.scope.address, open_full_address.scope.addressfields);
						if (GOOGLE_AUTOCOMPLETE_SELECTION_REQUIRED && !open_full_address.scope.address_selected) {
							errors.push($scope.translate('SELECT_ADDRESS_FROM_AUTOCOMPLETE'));
						}
						if (errors.length > 0) {
							MyAlert.show(errors);
						} else {
							cb(open_full_address.scope.address, open_full_address);
						}
					}

					open_full_address.scope.address_tags = [
						{
							id: 1,
							name: $scope.translate('ADDRESS_TAG_HOME'),
							icon: 'fa fa-home',
							value: 'home'
						},
						{
							id: 2,
							name: $scope.translate('ADDRESS_TAG_OFFICE'),
							icon: 'fa fa-building',
							value: 'office'
						},
						{
							id: 3,
							name: $scope.translate('ADDRESS_TAG_FAVORITE'),
							icon: 'fa fa-heart',
							value: 'favorite'
						},
						{
							id: 4,
							name: $scope.translate('ADDRESS_TAG_OTHER'),
							icon: 'fa fa-plus',
							value: 'other'
						}
					];
			
					open_full_address.scope.selectTag = function (tag) {
						open_full_address.scope.address.tag = tag.value;
					};
				});
			});
		}

		$rootScope.validateAddress = function (address, fields) {
			var errors = [];
			if ((!address.name || address.name == '') && fields.name && fields.name.enabled && fields.name.required) {
				errors.push($scope.translate('VALIDATION_ERROR_REQUIRED').replace('_attribute_', $scope.translate('NAME')));
			}
			if ((!address.lastname || address.lastname == '') && fields.lastname && fields.lastname.enabled && fields.lastname.required) {
				errors.push($scope.translate('VALIDATION_ERROR_REQUIRED').replace('_attribute_', $scope.translate('LASTNAME')));
			}
			if ((!address.cellphone || address.cellphone == '') && fields.mobile_phone && fields.mobile_phone.enabled && fields.mobile_phone.required) {
				errors.push($scope.translate('VALIDATION_ERROR_REQUIRED').replace('_attribute_', $scope.translate('CELLPHONE')));
			}
			if ((!address.address || address.address == '') && fields.address && fields.address.enabled && fields.address.required) {
				errors.push($scope.translate('VALIDATION_ERROR_REQUIRED').replace('_attribute_', $scope.translate('ADDRESS')));
			}
			if ((!address.address_notes || address.address_notes == '') && fields.address_notes && fields.address_notes.enabled && fields.address_notes.required) {
				errors.push($scope.translate('VALIDATION_ERROR_REQUIRED').replace('_attribute_', $scope.translate('ADDRESS_NOTES')));
			}
			if ((!address.internal_number || address.internal_number == '') && fields.internal_number && fields.internal_number.enabled && fields.internal_number.required) {
				errors.push($scope.translate('VALIDATION_ERROR_REQUIRED').replace('_attribute_', $scope.translate('INTERNAL_NUMBER')));
			}
			if ((!address.zipcode || address.zipcode == '') && fields.zipcode && fields.zipcode.enabled && fields.zipcode.required) {
				errors.push($scope.translate('VALIDATION_ERROR_REQUIRED').replace('_attribute_', $scope.translate('ZIPCODE')));
			}
			if ((!address.dropdown_option_id || address.dropdown_option_id == '') && fields.city_dropdown_option && fields.city_dropdown_option.enabled && fields.city_dropdown_option.required) {
				errors.push($scope.translate('VALIDATION_ERROR_REQUIRED').replace('_attribute_', $scope.translate('DROPDOWN_OPTION_ID')));
			}
			return errors
		}

		$rootScope.getStaticMapByAddress = function (address, business) {
			if (!address) return;
			var link = "https://res.cloudinary.com/ditpjbrmz/image/upload/v1564675872/marker-customer_kvxric.png";
			var markers = "&markers="+(link?"icon:"+$scope.optimizeImage(link.replace('.jpg', '.png'), 'w_45,q_auto:best,q_auto:best')+"%7C":"")+"color:white%7C"+address.location.lat+","+address.location.lng;
			if (business && business.location) {
				markers += "&markers="+(business.logo?"icon:"+$scope.optimizeImage(business.logo.replace('.jpg', '.png'), 'w_45,h_45,q_auto:best,q_auto:best,r_max,bo_3px_solid_gray')+"%7C":"")+"color:white%7C"+business.location.lat+","+business.location.lng;
			}
			var url = "https://maps.googleapis.com/maps/api/staticmap?size=500x190"+((business && business.location)?"":"&center="+address.location.lat+","+address.location.lng+"&zoom=17")+"&scale=2&maptype=roadmap"+markers+"&key="+GM_API_KEY;
			return url;
		}
		$rootScope.getStaticMapByLocation = function (location, size) {
			if (!size) {
				size = '250x100'
			}
			var url = "https://maps.googleapis.com/maps/api/staticmap?center="+location.lat+","+location.lng+"&zoom=14&size="+size+"&markers=color:red%7C"+location.lat+","+location.lng+"&key="+GM_API_KEY;
			return url;
		}

		$rootScope.getCartCountByProduct = function(product) {
			var ret = {
				quantity: 0,
				status: false
			};
			var cart = gCart.getData();
			for (var i = 0; i < cart.length; i++) {
				if (cart[i].id == product.id) {
					ret.quantity += cart[i].quantity;
				}
			}
			if (ret.quantity > 0) ret.status = true;
			return ret
		}

		$rootScope.isSoldOut = function (product) {
			var cart_quantity = $scope.getCartCountByProduct(product).quantity;
			if (product.inventoried && product.quantity == 0) {
				return true;
			} else if (product.inventoried && product.quantity - cart_quantity <= 0) {
				return true;
			} else if (MAX_PRODUCT_AMOUNT <= cart_quantity) {
				return true;
			}
			return false;
		}

		// Deploy
		/*document.addEventListener("deviceready", function () {
			if (typeof IonicCordova == 'undefined') return;
			setTimeout(function () {
				IonicCordova.deploy.init({
					appId: APP_ID_IONIC_CLOUD
				}, function (res) {
					changeVersions(function (changed) {
						if (changed) {
							IonicCordova.deploy.getVersions(function (versions) {
								for (var i = 0; i < versions.length; i++) {
									IonicCordova.deploy.deleteVersion(versions[i]);
								}
								setTimeout(function () {
									var path_cor = localStorageApp.getItem('cordova');
									location.href = path_cor.replace('cordova.js', 'index.html');
								}, 200);
							});
						} else {
							IonicCordova.deploy.check(function (res) {
								if (res === 'true') {
									$scope.$apply(function () {
										$rootScope.updatingAppProgress = 0;
									});
									MyLoading.show("Updating application: <br>Downloading {{updatingAppProgress}}%");
									IonicCordova.deploy.download(function (res) {
										if (res == 'true') {
											MyLoading.hide();
											// We can unzip the latest version
											$scope.$apply(function () {
												$rootScope.updatingAppProgress = 0;
											});
											MyLoading.show("Updating application: <br>Extracting {{updatingAppProgress}}%");
											IonicCordova.deploy.extract(function (res) {
												if (res == 'true') {
													MyLoading.hide();
													IonicCordova.deploy.redirect(function () {
														console.log("Redirect!");
													});
												} else {
													$scope.$apply(function () {
														$rootScope.updatingAppProgress = res;
													});
												}
											});
										} else {
											$scope.$apply(function () {
												$rootScope.updatingAppProgress = res;
											});
										}
									});
								}
							});
						}
					});
				});
			}, 2500);
		}, false);

		function changeVersions(cb) {
			var cur_version = localStorageApp.getItem(STORE.APP_VERSION);
			cordova.getAppVersion.getVersionNumber().then(function (version) {
				localStorageApp.setItem(STORE.APP_VERSION, version);
				cb(cur_version != null && cur_version != version);
			});
		}*/

		$rootScope.getJson = function (string) {
			while (typeof string == 'string') string = JSON.parse(string);
			return string;
		}

		$rootScope.translate = function (key) {
			if ($rootScope.MLanguages && $rootScope.MLanguages[key]) return $rootScope.MLanguages[key];
			else if ($scope.MLanguages && $scope.MLanguages[key]) return $scope.MLanguages[key];
			else return DEBUG_MODE?key:'';
		}

		$rootScope.truncate = function (variable, max) {
			if (variable && variable.length > max) return variable.substring(0, max)+'...';
			return variable;
		}

		$rootScope.Order = {
			getProductsStr: function (order, endings) {
				var endings = typeof endings === "boolean"?endings:true;
				var str_products = ''+(endings?'\n':'');
				for (var i = 0; i < order.products.length; i++) {
					var product = order.products[i];
					var str_product = product.quantity + ' x ' + product.name + ': ' + $scope.currency + this.getProductsTotal(product).toFixed(2) + "\r"+(endings?'\n':'');
					if (product.ingredients.length > 0) {
						str_product += '  ' + $scope.translate('NO') + ' ' + $scope.translate('Ingredients_V2') + "\r"+(endings?'\n':'');
						for (var j = 0; j < product.ingredients.length; j++) {
							str_product += '    ' + product.ingredients[j].name + "\r"+(endings?'\n':'');
						}
					}
					for (var j = 0; j < product.options.length; j++) {
						var option = product.options[j];
						str_product += '  ' + option.name + "\r"+(endings?'\n':'');
						for (var k = 0; k < option.suboptions.length; k++) {
							var suboption = option.suboptions[k];
							var str_suboption_quantity = '';
							var str_suboption_position = '';
							if (option.allow_suboption_quantity && suboption.quantity) {
								str_suboption_quantity = suboption.quantity + '  x  ';
							}
							if (option.with_half_option && suboption.position && suboption.position != 'whole') {
								str_suboption_position = ' ('+$scope.translate(suboption.position.toUpperCase())+')';
							}
							var suboption_price = this.getSuboptionTotal(option, suboption);
							str_product += '    ' + str_suboption_quantity + suboption.name + str_suboption_position + '  ' + $scope.parsePrice(suboption_price) + "\r"+(endings?'\n':'');
						}
					}
					str_products += str_product;
				}
				return str_products+(endings?'':'');
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
				return (total+product.price)*product.quantity;
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
				return suboption_price*suboption_quantity;
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
					var tax = (order.tax_type == 2)? order.tax*(this.getSubtotal(order)-order.discount)/100:0;
					return this.roundPrice(tax)
				} else {
					return order.summary.tax
				}
			},
			getDriverTip: function (order) {
				if (!order.summary) {
					var tip = (this.getSubtotal(order)-order.discount)*order.driver_tip/100;
					return this.roundPrice(tip)
				} else {
					return order.summary.driver_tip
				}
			},
			getServiceFee: function (order) {
				if (!order.summary) {
					var subtotal = (this.getSubtotal(order)-order.discount)*order.service_fee/100;
					return this.roundPrice(subtotal)
				} else {
					return order.summary.service_fee
				}
			},
			getTotal: function (order) {
				if (!order.summary) {
					var subtotal = this.getSubtotal(order);
					var tax = this.getTax(order);
					var service_fee = this.getServiceFee(order);
					totalorder = order.delivery_type == "2"?subtotal+tax+service_fee-order.discount:subtotal+tax+order.delivery_zone_price+this.getDriverTip(order)+service_fee-order.discount; subtotal+tax+service_fee-order.discount; //discount_type and offer_type must be created
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
				var power = Math.pow (10, DECIMAL.length);
				var poweredVal = Math.round(value * power);
				return poweredVal / power;
			}
		};

		$rootScope.numberFormat = function (number, decimals, separator) {
			decimals = decimals || DECIMAL.length;
			separator = separator || DECIMAL.separator;
			number = number.toFixed(decimals)+"";
			if (separator == '.') return number.replace(',', '.');
			else return number.replace('.', ',');
		}
		$rootScope.usersToCsv = function (users, filename) {
			var users = JSON.parse(JSON.stringify(users));
			users.sort(function (a, b) {
				return a.id-b.id;
			});
			getValue = function (attribute) {
				return attribute?attribute:'';
			}
			clearChar = function (value) {
				var regex = /"/gi;
				value = value.replace(regex, '""');
				return value
			}
			getAddress = function (user) {
				if (user.addresses && user.addresses.length > 0) {
					address = user.addresses.find(function(address){
						return address.default == true;
					})
					if (address) {
						return {
							address: address.address,
							address_notes: address.address_notes
						};
					} else {
						return {
							address: user.address,
							address_notes: user.address_notes
						};	
					}
				} else {
					return {
						address: user.address,
						address_notes: user.address_notes
					};
				}
			}
			var delimiter = ',';
			var csv = '"ID"'+delimiter+'"NAME"'+delimiter+'"LASTNAME"'+delimiter+'"EMAIL"'+delimiter+'"CELLPHONE"'+delimiter+'"ADDRESS"'+delimiter+'"ADDRESS NOTES"'+delimiter+'"DROPDOWN OPTION"'+delimiter+'"ZIPCODE"'+delimiter+'"CITY"'+delimiter+'"LATITUDE"'+delimiter+'"LONGITUDE"'+"\n";
			for (var i = 0; i < users.length; i++) {
				var user = users[i];
				var separator = DECIMAL.separator+'';
				DECIMAL.separator = ',';
				var location = {lat: '',lng: ''};
				if (user.location){
					user_location = $rootScope.getJson(user.location);
				} else {
					user_location = location
				}
				DECIMAL.separator = separator
				var curUser = '"'+getValue(user.id)+'"'+delimiter+'"'+getValue(user.name)+'"'+delimiter+'"'+getValue(user.lastname)+'"'+delimiter+'"'+getValue(user.email)+'"'+delimiter+'"'+getValue(user.cellphone)+'"'+delimiter+'"'+clearChar(getValue(getAddress(user).address))+'"'+delimiter+'"'+clearChar(getValue(getAddress(user).address_notes))+'"'+delimiter+'"'+(user.dropdown_option?user.dropdown_option.name:'')+'"'+delimiter+'"'+getValue(user.zipcode)+'"'+delimiter+'"'+(user.city?user.city.name:'')+'"'+delimiter+'"'+getValue(user_location.lat)+'"'+delimiter+'"'+getValue(user_location.lng)+'"'+"\n";
				csv += curUser;
			}
			$rootScope.downloadTextFile(filename+"_"+(new Date()).getTime()+".csv", csv);
		}

		$rootScope.ordersToCsv = function (orders, filename) {
			var orders = JSON.parse(JSON.stringify(orders));
			orders.sort(function (a, b) {
				return a.id-b.id;
			});
			var delimiter = ";";
			var csv = '"ID"'+delimiter+'"CUSTOMER ID"'+delimiter+'"CUSTOMER NAME"'+delimiter+'"CUSTOMER LASTNAME"'+delimiter+'"CUSTOMER EMAIL"'+delimiter+'"CUSTOMER CELLPHONE"'+delimiter+'"CUSTOMER ADDRESS"'+delimiter+'"CUSTOMER ADDRESS NOTES"'+delimiter+'"CUSTOMER ZIPCODE"'+delimiter+'"CUSTOMER CITY"'+delimiter+'"CUSTOMER DROPDOWN OPTION"'+delimiter+'"CUSTOMER LATITUDE"'+delimiter+'"CUSTOMER LONGITUDE"'+delimiter+'"DRIVER ID"'+delimiter+'"DRIVER NAME"'+delimiter+'"DRIVER LASTNAME"'+delimiter+'"DRIVER CELLPHONE"'+delimiter+'"DRIVER LATITUDE"'+delimiter+'"DRIVER LONGITUDE"'+delimiter+'"BUSINESS ID"'+delimiter+'"BUSINESS NAME"'+delimiter+'"BUSINESS EMAIL"'+delimiter+'"BUSINESS PHONE"'+delimiter+'"BUSINESS CELLPHONE"'+delimiter+'"BUSINESS ADDRESS"'+delimiter+'"BUSINESS ADDRESS NOTES"'+delimiter+'"BUSINESS CITY"'+delimiter+'"BUSINESS LATITUDE"'+delimiter+'"BUSINESS LONGITUDE"'+delimiter+'"CODE STATE"'+delimiter+'"STATE"'+delimiter+'"DELIVERY TYPE"'+delimiter+'"PAYMETHOD"'+delimiter+'"PAY DATA"'+delimiter+'"DELIVERY DATETIME"'+delimiter+'"PRODUCTS"'+delimiter+'"SUBTOTAL"'+delimiter+'"TAX RATE (%)"'+delimiter+'"TAX"'+delimiter+'"DELIVERY FEE"'+delimiter+'"DRIVER TIP"'+delimiter+'"SERVICE FEE RATE"'+delimiter+'"SERVICE FEE"'+delimiter+'"DISCOUNT TYPE"'+delimiter+'"DISCOUNT RATE"'+delimiter+'"DISCOUNT"'+delimiter+'"TOTAL"'+delimiter+'"REFUND"'+delimiter+'"REFUND DATA"'+"\n";
			for (var i = 0; i < orders.length; i++) {
				var order = orders[i];
				if (!order.customer || !order.business) continue;
				var driver_location = null;
				var separator = DECIMAL.separator+'';
				DECIMAL.separator = ',';
				var customer_location = { lat: '', lng: '' };
				if (order.customer.location){
					customer_location = $rootScope.getJson(order.customer.location);
					customer_location.lat = $filter('separator')(customer_location.lat);
					customer_location.lng = $filter('separator')(customer_location.lng);
				}
				var business_location = { lat: '', lng: '' };
				if (order.business.location) {
					business_location = $rootScope.getJson(order.business.location);
					business_location.lat = $filter('separator')(business_location.lat);
					business_location.lng = $filter('separator')(business_location.lng);
				}
				if (order.driver && order.driver.location) {
					driver_location = $rootScope.getJson(order.driver.location);
					driver_location.lat = $filter('separator')(driver_location.lat);
					driver_location.lng = $filter('separator')(driver_location.lng);
				}
				DECIMAL.separator = separator;
				var curOrder = '"'+order.id+'"'+delimiter+'"'+order.customer.id+'"'+delimiter+'"'+order.customer.name+'"'+delimiter+'"'+(order.customer.lastname?order.customer.lastname:'')+'"'+delimiter+'"'+order.customer.email+'"'+delimiter+'"'+order.customer.cellphone+'"'+delimiter+'"'+order.customer.address+'"'+delimiter+'"'+(order.customer.address_notes?order.customer.address_notes:'')+'"'+delimiter+'"'+(order.customer.zipcode?order.customer.zipcode:'')+'"'+delimiter+'"'+(order.customer.dropdown_option?order.customer.dropdown_option.city.name:'')+'"'+delimiter+'"'+(order.customer.dropdown_option?order.customer.dropdown_option.name:'')+'"'+delimiter+'"'+customer_location.lat+'"'+delimiter+'"'+customer_location.lng+'"'+delimiter+'"';
				curOrder += (order.driver?order.driver.id:'')+'"'+delimiter+'"'+(order.driver?order.driver.name:'')+'"'+delimiter+'"'+((order.driver&&order.driver.lastname)?order.driver.lastname:'')+'"'+delimiter+'"'+(order.driver?order.driver.cellphone:'')+'"'+delimiter+'"'+(driver_location?driver_location.lat:'')+'"'+delimiter+'"'+(driver_location?driver_location.lng:'')+'"'+delimiter+'"';
				curOrder += order.business.id+'"'+delimiter+'"'+order.business.name+'"'+delimiter+'"'+order.business.email+'"'+delimiter+'"'+order.business.phone+'"'+delimiter+'"'+order.business.cellphone+'"'+delimiter+'"'+order.business.address+'"'+delimiter+'"'+(order.business.address_notes?order.business.address_notes:'')+'"'+delimiter+'"'+order.business.city.name+'"'+delimiter+'"'+business_location.lat+'"'+delimiter+'"'+business_location.lng+'"'+delimiter+'"';
				curOrder += order.status+'"'+delimiter+'"'+$rootScope.getOrderState(order.status)+'"'+delimiter+'"'+$rootScope.translate(order.delivery_type==1?'DELIVERY':order.delivery_type==2?'PICKUP':order.delivery_type==3?'EATIN':order.delivery_type==4?'CURBSIDE':'DRIVETHRU')+'"'+delimiter+'"'+$rootScope.translate(order.paymethod.gateway.toUpperCase())+'"'+delimiter+'"'+(order.pay_data?order.pay_data:'')+'"'+delimiter+'"'+$rootScope.parseDate(order.delivery_datetime)+'"'+delimiter+'"'+$rootScope.Order.getProductsStr(order, false)+'"'+delimiter+'"'+$rootScope.numberFormat($rootScope.Order.getSubtotal(order))+'"'+delimiter+'"'+$rootScope.numberFormat(order.tax)+'"'+delimiter+'"'+$rootScope.numberFormat($rootScope.Order.getTax(order))+'"'+delimiter+'"';
				curOrder += $rootScope.numberFormat(order.delivery_zone_price)+'"'+delimiter+'"'+$rootScope.numberFormat($rootScope.Order.getDriverTip(order))+";+"+order.service_fee+'"'+delimiter+'"'+$rootScope.numberFormat($rootScope.Order.getServiceFee(order))+'"'+delimiter+'"'+(order.offer_type?order.offer_type:'No')+'"'+delimiter+'"'+$rootScope.numberFormat(order.offer_rate)+'"'+delimiter+'"'+$rootScope.numberFormat(order.discount)+'"'+delimiter+'"'+$rootScope.numberFormat($rootScope.Order.getTotal(order))+'"'+delimiter+'"'+(order.refund_data?'true':'false')+'"'+delimiter+'"'+(order.refund_data?order.refund_data:'')+'"'+"\n";
				csv += curOrder;
			}
			$rootScope.downloadTextFile(filename+"_"+(new Date()).getTime()+".csv", csv);
		}

		$rootScope.downloadTextFile = function (filename, text) {
			var uri = 'data:text/csv;charset=utf-8,'+encodeURIComponent(text);
			var downloadLink = document.createElement("a");
			downloadLink.href = uri;
			downloadLink.download = filename;
			downloadLink.click();
			event.preventDefault();
		}

		$rootScope.parsePrice = function (number) {
			var isNegative = number < 0;
			if (isNegative) {
				number *= -1;
			}
			number = $filter('decimal')(number);
			number = $filter('separator')(number);
			number = $filter('thousand')(number);
			if ((CURRENCY_POSITION == 'left' && !$scope.arabic_rtl) || (CURRENCY_POSITION == 'right' && $scope.arabic_rtl)) {
				number = $scope.currency+' '+number;
			} else {
				number = number+' '+$scope.currency;
			}
			if (isNegative) {
				number = '- ' + number
			}
			return number;
		}

		$rootScope.getLessUnitTime = function (time) {
			if (time > 3600) return [(time/60/60).toFixed(2), $rootScope.translate('HOURS')];
			else if (time > 300) return [(time/60).toFixed(2), $rootScope.translate('MINUTES')];
			return [(time*1).toFixed(2), $rootScope.translate('SECONDS')];
		}

		$rootScope.getTimeAgo = function (date) {
			if (!date) return "NN";
			if (typeof moment == 'undefined') return $rootScope.parseDate(date);
			var ago_time = moment.utc(date).fromNow();
			ago_time = ago_time.replace("a year ago", $rootScope.translate('MESSAGES_YEAR'));
			ago_time = ago_time.replace("a month ago", $rootScope.translate('MESSAGES_MONTH'));
			ago_time = ago_time.replace("a day ago", $rootScope.translate('MESSAGES_DAY'));
			ago_time = ago_time.replace("an hour ago", $rootScope.translate('MESSAGES_HOUR'));
			ago_time = ago_time.replace("a minute ago", $rootScope.translate('MESSAGES_MINUTE'));
			ago_time = ago_time.replace("a few seconds ago", $rootScope.translate('MESSAGES_SECONDS'));
			if (ago_time.indexOf('years ago') >-1) {
				var time = ago_time.replace("years ago",'');
				ago_time = $rootScope.translate('MESSAGES_YEARS').replace('_##_', time);
			}
			if (ago_time.indexOf('months ago') >-1) {
				var time = ago_time.replace('months ago','');
				ago_time = $rootScope.translate('MESSAGES_MONTHS').replace('_##_', time);
			}
			if (ago_time.indexOf('days ago') >-1) {
				var time = ago_time.replace('days ago','');
				ago_time = $rootScope.translate('MESSAGES_DAYS').replace('_##_', time);
			}
			if (ago_time.indexOf('hours ago') >-1) {
				var time = ago_time.replace('hours ago','');
				ago_time = $rootScope.translate('MESSAGES_HOURS').replace('_##_', time);
			}
			if (ago_time.indexOf('minutes ago') >-1) {
				var time = ago_time.replace('minutes ago','');
				ago_time = $rootScope.translate('MESSAGES_MINUTES').replace('_##_', time);
			}
			//return moment.utc(date).fromNow();
			return ago_time;
		}

		$rootScope.getUserRol = function (level) {
			switch (level) {
				case 0:
					return $rootScope.translate('ADMINISTRATOR_ID');
				case 2:
					return $rootScope.translate('BUSINESS_ID');
				case 3:
					return $rootScope.translate('CUSTOMER_ID');
				case 4:
					return $rootScope.translate('DRIVER_ID');
				case 5:
					return $rootScope.translate('DRIVER_MANAGER');
				default:
					return $rootScope.translate('OTHER');
			}
		}

		$rootScope.getDateAgo = function (date){
			var stillUtc = moment.utc(date).toDate();
			var dateMessage = moment(stillUtc).local().format('YYYY-MM-DD HH:mm:ss');
			return $rootScope.parseDateMessage(dateMessage);
		}

		$rootScope.parseDateMessage = function(date){
			var parts_date = date.split(' ');
        	var o_date = new Date(parts_date[0].split('-')[0], parts_date[0].split('-')[1]-1, parts_date[0].split('-')[2], parts_date[1].split(':')[0], parts_date[1].split(':')[1], parts_date[1].split(':')[2], 0);
			var month = o_date.getMonth() + 1;
			var date = o_date.getFullYear()+(month<10?'/0':'/')+month+(o_date.getDate()<10?'/0':'/')+o_date.getDate();
			var hour = o_date.getHours();
			var minute = (o_date.getMinutes()<10?':0':':')+o_date.getMinutes();
			var sec = (o_date.getSeconds()<10?':0':':')+o_date.getSeconds();
			if (!TIME_FORMAT_24) {
				if (hour == 0) time = '12'+minute+sec+' '+$scope.translate('AM');
				else if (hour < 12) time = (hour<10?'0':'')+hour+minute+sec+' '+$scope.translate('AM');
				else if (hour == 12) time = hour+minute+sec+' '+$scope.translate('PM');
				else if (hour > 12) time = ((hour-12)<10?'0':'')+(hour-12)+minute+sec+' '+$scope.translate('PM');
			} else time = ((hour < 10)?'0':'')+hour+minute+sec;
			return date+' '+time;
		}
    
		$rootScope.getBusinessByOrder = function (business, order, callback) {
			var data_search = {
				type: order.type,
				id_or_slug: business.slug
			};
			if (order.position) data_search.location = order.position.lat+','+order.position.lng;
			else data_search.dropdownoption = order.dropdownoption;
			if(order.timestamp) data_search.timestamp = order.timestamp;
			else if (gPreorder.getData().timestamp) data_search.timestamp = gPreorder.getData().timestamp;
			else if (gPreorder.getData().menu_id) data_search.menu_id = gPreorder.getData().menu_id;
			MyLoading.show($scope.translate("LOADING")+'...');
			Ordering.business.get(data_search, function (res) {
				MyLoading.hide();
				if (!res.error) {
					callback(res.result);
				}
			});
		}

		$rootScope.compareBusinessAndCart = function (business, cart) {
			var invalid_products = clone(cart);
			for (var i = 0; i < business.categories.length; i++) {
				var category = business.categories[i];
				for (var j = 0; j < category.products.length; j++) {
					var product = category.products[j];
					for (var k = invalid_products.length - 1; k >= 0; k--) {
						var cart_product = invalid_products[k];
						if (product.id == cart_product.id) {
							invalid_products.splice(k, 1);
						}
					}
					if (invalid_products.length == 0) break;
				}
				if (invalid_products.length == 0) break;
			}
			return invalid_products;
		}

		$rootScope.checkProductCart = function (business, cart, callback, checkEmpty, date) {
			var products = $rootScope.compareBusinessAndCart(business, cart);
			if (checkEmpty && products.length == cart.length) {
				MyAlert.confirm($rootScope.translate(!date?'IF_CHANGE_ORDER_TYPE_PRODUCTS_REMOVED_ALL':'IF_CHANGE_DELIVERY_TIME_PRODUCTS_REMOVED_ALL'), $scope.translate('OK'), $scope.translate('CANCEL')).then(function (res) {
					callback(true, products.map(function (product) {
						return product.id;
					}))
				}).catch(function(){
					callback(false)
				});
			} else if (products.length == 0) {
				callback(true);
			} else {
				var product_str = products.map(function (product) {
					return product.name;
				});
				product_str = product_str.join(', ');
				MyAlert.confirm($rootScope.translate(!date?'IF_CHANGE_ORDER_TYPE_PRODUCTS_REMOVED':'IF_CHANGE_DELIVERY_TIME_PRODUCTS_REMOVED').replace('_products_', product_str), $scope.translate('OK'), $scope.translate('CANCEL')).then(function (res) {
					callback(true, products.map(function (product) {
						return product.id;
					}));
				}).catch(function(){
					callback(false)
				});
			}
		}
		$scope.data_search_scroll = {};
		$rootScope.searchBusinesses = function (order, callback, params) {
			var data_search = {
				type: order.type
			};
			if (order.orderby) {
				data_search.orderBy = order.orderby;
			}
			if (order.where) {
				data_search.where = order.where;
			}
			if (order.position) data_search.location = order.position.lat+','+order.position.lng;
			else data_search.dropdownoption = order.dropdownoption;
			MyLoading.show($scope.translate("LOADING")+'...');
			if (ADDONS.single_business) {
				data_search.id_or_slug = BUSINESS_ID;
				Ordering.business.get(data_search, function (res) {
					MyLoading.hide();
					if (!res.error) {
						callback(res.result);
					} else callback(null);
				});
			} else {
				if (!CLOSEST_BUSINESS && !order.no_limit) data_search.limit = ADDONS.web_template?50:25;
				data_search.params = params?params:'name,slug,logo,header,location,about,description,food,alcohol,groceries,laundry,zones,delivery_price,minimum,schedule,featured,reviews,delivery_time,pickup_time,offers';
				if (params) Object.assign(data_search, params);
				if (NEW_FEATURES.API_BUSINESS_LISTING_V2) {
					data_search.v = 2;
				}
				Ordering.business.all(data_search, function (res) {
					MyLoading.hide();
					if (!res.error) {
						if (CLOSEST_BUSINESS) {
							var closest = res.result[0];
							for (var i = 1; i < res.result.length; i++) {
								if (closest.distance > res.result[i].distance) closest = res.result[i];
							}
							delete data_search.params;
							data_search.id_or_slug = closest.id;
							MyLoading.show($scope.translate("LOADING")+'...');
							Ordering.business.get(data_search, function (res) {
								MyLoading.hide();
								if (!res.error) {
									callback(res.result);
								} else callback(null);
							});
						} else {
							callback(res.result);
							$scope.data_search_scroll = clone(data_search);
							if (res.result.length == data_search.limit) {
								delete data_search.limit;
								if (ADDONS.web_template) {
									data_search.offset = ADDONS.web_template?50:25;
									if (NEW_FEATURES.API_BUSINESS_LISTING_V2) {
										data_search.v = 2;
									}
									Ordering.business.all(data_search, function (res) {
										callback(res.result);
									});
								}
							}
						}
					} else callback(null);
				});
			}
		}

		$rootScope.getDetaultOrderTypeId = function () {
			if (DEFAULT_ORDER_TYPE) {
				switch (DEFAULT_ORDER_TYPE.toLowerCase()) {
					case 'delivery':
						return '1'
					case 'pickup':
						return '2';
					default:
						return '1';
				}
			}
			return '1';
		}

		/*newfunction-rootCtrl*/

		$rootScope.doGroupInCart = function (new_product, product) {
			for (key in new_product.extended_data_options) {
				if (!new_product.extended_data_options[key].selected) {
					delete new_product.extended_data_options[key];
				}
				
			}
			var cart = gCart.getData();
			if (cart.length > 0) {
				var groupedTo = null; 
				for (var i = 0; i < cart.length; i++) {
					var cart_product = cart[i];
					if (cart_product.id == new_product.id) {
						var same = Object.compare({
							comment: cart_product.comment || null,
							ingredients: cart_product.ingredients || null,
							options: cart_product.options,
							extended_options: cart_product.extended_options,
							extended_data_options: cart_product.extended_data_options || null
						}, {
							comment: new_product.comment || null,
							ingredients: new_product.ingredients || null,
							options: new_product.options,
							extended_options: new_product.extended_options,
							extended_data_options: new_product.extended_data_options || null
						});

						if (same) {
							groupedTo = i;
							break;
						}
					}
				}
				if (groupedTo !== null) {
					var unitPrice = cart[groupedTo].total / cart[groupedTo].quantity;
					cart[groupedTo].quantity += new_product.quantity;
					cart[groupedTo].total = unitPrice * cart[groupedTo].quantity;
				} else {
					cart.push(new_product);
				}
			} else {
				cart.push(new_product);
			}
			gCart.setData(cart);
			if (ADDONS.use_segment) {
				segment.track('Product Added', {
					id: new_product.id,
					name: new_product.name,
					quantity: new_product.quantity
				});
			}
		}

		$rootScope.unitConvert = function (value, unit_from, unit_to) {
			if (unit_from.toLowerCase() == 'm' && unit_to.toLowerCase() == 'yd') {
				return value*1.09361;
			}
			if (unit_from.toLowerCase() == 'm' && unit_to.toLowerCase() == 'auto') {
				if (DISTANCE_UNIT_KM) {
					return value/1000;
				} else {
					return value/1609;
				}
			}
			return value;
    }
    
		$rootScope.getSoltProductQuantity = function (product) {
			var cart = gCart.getData();
			var quantity = 0;
			for (var i = 0; i < cart.length; i++) {
				if (cart[i].id == product.id && cart[i].code != product.code) {
					quantity += cart[i].quantity;
				}
			}
			return quantity;
		}

		$rootScope.isEnterpriceAutoassign = function () {
			return $scope.settings.logistic_module && $scope.settings.logistic_module.value && $scope.settings.autoassign_enabled.value == '1' && ($scope.settings.autoassign_type && $scope.settings.autoassign_type.value == 'enterprise');
		}

		$rootScope.generateRandom = function (size) {
			size = size || 10;
			if (!window.crypto && window.msCrypto) {
				window.crypto = window.msCrypto
			}

			if (window.crypto) {
				var e = "";
				var r = crypto.getRandomValues(new Uint8Array(size));
				for (;size--;) {
					var n = 63 & r[size];
					e += n < 36 ? n.toString(36) : n < 62 ? (n-26).toString(36).toUpperCase() : n<63 ? "_" : "-";
				}
				return e;
			} else {
				var text = "";
				var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
				for( var i=0; i < size; i++ ) text += possible.charAt(Math.floor(Math.random() * possible.length));
				return text;
			}
		}

		$rootScope.goToConfirm = function (order, buyer) {
			if (!localStorageApp.getItem(STORE.CREATE_ORDER) && buyer) {
				gUser.setData(buyer);
			}
			gCreateOrderBuyer.setData({});
			// res.result.business.slug = $scope.business.slug;
			// res.result.business.header = $scope.business.header;
			// if ($scope.buyer.lastname) res.result.customer.lastname = $scope.buyer.lastname;
			// else res.result.customer.lastname = '';
			gAllBusiness.setData([]);
			gCart.setData([]);
			gOrder.setData({});
			gPreorder.setData({});
			gBusiness.setData({});
			$scope.refreshNumCart();
			gConfirm.setData(order);
			if (ADDONS.web_template) {
				$state.go('main.confirm').then(function() {
					MyLoading.hide();
					$scope.placing = false;
				});
			} else {
				var registerBack = $ionicPlatform.registerBackButtonAction(function (event) {
					console.log('opened confirmation modal will disable back button on android.');
				}, 400);
				MyModal.showTemplate('templates/'+ADDONS.template+'/views/order-confirm-popup.html', {
					scope: $scope,
					animation: 'none',
					modalClose: false
				}).then(function(modal) {
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
						$ionicHistory.clearHistory();
						$ionicHistory.clearCache().then(function(){ $state.go(app_states.homeScreen)});
						if (!ADDONS.web_template) {
							$state.go(app_states.homeScreen);
						}
					}
				});
			}
		}

		// Check some order code
		var secure_id = localStorageApp.getItem('order_code');
		if (secure_id) {
			$scope.placing = true;
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
				if (!res.error && res.result.length > 0) {
					try {
						res.result[0].business.header = gBusiness.getData().header;
					} catch (err) {}
					$scope.goToConfirm(res.result[0]);
				}
			});
		}
		
		Extensions.runAction('enter_root', null, $scope);
	});
	_controllers.controller('homeScreenCtrl', function($scope, $state, $ionicScrollDelegate, $rootScope, $timeout, MyAlert, MyLoading, gAllBusiness,
										   GeolocationSvc, AddressLookupSvc, gUser,Geolocation, ADDONS, Analytics, gPreorder, Ordering, gOrder, gBusiness, gAddress/*newhomeScreenCtrl*/){
		$rootScope.pageTitle = '';
		Analytics.set('&dp', 'Home');
		Analytics.pageView();
		$scope.ADDONS = ADDONS;
		$scope.SEARCH_BY_ADDRESS = SEARCH_BY_ADDRESS;
		$scope.choosedAddress = false;
		$scope.address_selected = false;
		localStorageApp.removeItem(STORE.CREATE_ORDER);
		if ($scope.numCart == 0) {
			gPreorder.setData({});
		}

		$scope.$on('$stateChangeStart', function () {
			window.removeEventListener('keyboardDidShow', listenerOpenKeyboard, false);
			window.removeEventListener('keyboardDidHide', listenerCloseKeyboard, false);
		});

		$scope.$on('$ionicView.enter', function() {
			$scope.initView();
			window.addEventListener('keyboardDidShow', listenerOpenKeyboard, false);
			window.addEventListener('keyboardDidHide', listenerCloseKeyboard, false);
		});

		function listenerOpenKeyboard(event) {
			$timeout(function () {
				if ($(':focus').attr('id') == 'home-address') {
					var padding = 0;
					if (isIPhoneX()) padding = 150
					else padding = 50;
					$('.list.search-form').css('padding-bottom', padding);
					$ionicScrollDelegate.resize();
					$ionicScrollDelegate.scrollBottom(false);
				}
			}, 200);
		}

		function listenerCloseKeyboard(event) {
			$('.list.search-form').css('padding-bottom', 0);
		}

		$scope.search = {
			type: (DEFAULT_ORDER_TYPE=='delivery'||!ADDONS.pickup)?'1':'2',
			address: gUser.getData().id!=-1?gUser.getData().address:""
		};

		$scope.myOrder = {
			curAddress: gUser.getData().id!=-1?gUser.getData().address:""
		}

		if (gUser.isLogged() && gUser.getData().address && gUser.getData().location) {
			$scope.address_selected = true;
		}

		/*newvariable-homeScreenCtrl*/

		$scope.cleanAddress = function ($event) {
			//$event.preventDefault();
			//$event.stopPropagation()
			$scope.myOrder.curAddress = '';
			/*console.log($('#dirMap'));
			$('#dirMap').focus();*/
			$scope.isFocusDir = true;
		}

		$scope.initView = function () {
			if (NEW_FEATURES.MULTI_ADDRESS) {
				var defaultAddress = gAddress.getData();
				if (defaultAddress && defaultAddress != 'null' && gUser.isLogged()) {
					gOrder.setData({
						address: defaultAddress.address,
						position: defaultAddress.location,
						lat: defaultAddress.location.lat,
						lng: defaultAddress.location.lng,
						type: (DEFAULT_ORDER_TYPE=='delivery'||!ADDONS.pickup)?1:2
					});
					var searchData = { 'order_type': (gOrder.getData().type==1)?'delivery':'pickup', 'address': gOrder.getData().position.lat+','+gOrder.getData().position.lng };
					if (ADDONS.web_template) {
						$state.go('main.search', searchData);
					} else {
						if (!ADDONS.single_business) {
							$state.go('sideMenu.searchBusinesses', {}, { animation: 'no-animation' });
						} else {
							$scope.searchBusiness();
						}
					}
				}
				// if (defaultAddress) {
				// 	$scope.search.address = defaultAddress.address;
				// 	$scope.myOrder.curAddress = defaultAddress.address;
				// }
			} else {
				$scope.loadGoogleMaps(function () {
					var options = {
						types: [],
					};
					if(FULL_ADDRESS_ONLY){
						options.types.push('address');
					}
					if (COUNTRY_AUTOCOMPLETE != "*") options.componentRestrictions = {
						country: COUNTRY_AUTOCOMPLETE
					}
					var input = document.getElementById('home-address');
					if (input) {
						var autocomplete = new google.maps.places.Autocomplete(input, options);
						autocomplete.setFields(['place_id', 'formatted_address', 'geometry']);
						autocomplete.addListener('place_changed', function() {
							var order = {
								address: input.value
							};
							if (gOrder.getData().business_slug) order.business_slug = gOrder.getData().business_slug; 
							if (autocomplete.getPlace().geometry) {
								order.position = {
									lat: autocomplete.getPlace().geometry.location.lat(),
									lng: autocomplete.getPlace().geometry.location.lng()
								}
							}
							gOrder.setData(order);
							$scope.myOrder.curAddress = input.value;
							$scope.address_selected = true;
							$scope.findRest();
						});
						input.onkeydown = function () {
							$scope.address_selected = false;
						}
					}
				});
			}
			if (ADDONS.web_template && WELCOME_FULLSCREEN && !IFRAME_INLINE) {
				if ($(window).height()-$('.navbar-header').height() > $('.welcome .content').height()) {
					$('.welcome').height($(window).height()-$('.navbar-header').height());
				}
			}
		}

		if (typeof $scope.MLanguages.LOADING == 'undefined') MyLoading.show("Loading...");
		else MyLoading.show($scope.translate('LOADING')+'...');

		$scope.getLanguage(function (err, list, dictionary) {
			if (err) MyAlert(err);
			else {
				$scope.cur_lang = localStorageApp.getItem(STORE.LANG_CODE);
				if (!SEARCH_BY_ADDRESS) {
					$scope.myOrder.city = "";
					$scope.myOrder.dropdownoption = "";
					$scope.cities = [/*{
						name: $scope.translate('FRONT_SELECT_CITY'),
						id: ""
					}*/];
					$scope.dropdownoptions = [/*{
						id: "",
						name: $scope.translate('FRONT_SELECT_NEIBORHOOD'),
						enabled: true
					}*/];
					Ordering.countries.all({}, function (res) {
						MyLoading.hide();
						if (!res.error) {
							for (var i = 0; i < res.result.length; i++) {
								for (var j = 0; j < res.result[i].cities.length; j++) {
									if (res.result[i].cities[j].enabled && res.result[i].cities[j].options.length > 0) {
										$scope.cities.push(res.result[i].cities[j]);
										$scope.dropdownoptions = $scope.dropdownoptions.concat(res.result[i].cities[j].options);
									}
								}
							}
						}
					});
				}
				MyLoading.hide();
			}
		});

		$scope.resetDropdownoption = function () {
			$scope.myOrder.dropdownoption = "";
		}
		
		$scope.changeLanguage = function (code) {
			var rtl = $scope.languages.find(function (lang) {
				return lang.code == code;
			}).rtl;
			var cur_language = localStorageApp.getItem(STORE.LANG_CODE);
			localStorageApp.setItem(STORE.LANG_CODE, code);
			localStorageApp.setItem(STORE.RTL, rtl);
			$scope.selectLanguageByCode(code, function () {
				if (cur_language == 'ar' || code == 'ar' || rtl) location.reload();
				Ordering.countries.all({}, function (res) {
					MyLoading.hide();
					if (!res.error) {
						$scope.cities = [];
						$scope.dropdownoptions = [];
						for (var i = 0; i < res.result.length; i++) {
							for (var j = 0; j < res.result[i].cities.length; j++) {
								if (res.result[i].cities[j].enabled && res.result[i].cities[j].options.length > 0) {
									$scope.cities.push(res.result[i].cities[j]);
									$scope.dropdownoptions = $scope.dropdownoptions.concat(res.result[i].cities[j].options);
								}
							}
						}
					}
				});
			});
		}

		$scope.openMap = function (curLocation) {
			if (NEW_FEATURES.MULTI_ADDRESS) {
				var MyLocation = curLocation?curLocation:null;
				if (!gUser.isLogged()) {
					$scope.openFullAddress(MyLocation, function (addr, modal) {
						function redirect(address) {
							gAddress.setData(address);
							var order = gOrder.getData();
							order.type = $scope.search.type;
							order.position = address.location;
							order.address = address.address;
							gOrder.setData(order);
							if (ADDONS.web_template) {
								$state.go('main.search', { 'order_type': (order.type==1)?'delivery':'pickup', 'address': order.position.lat+','+order.position.lng });
							} else {
								modal.scope.hide();
								if (ADDONS.single_business) {
									$scope.searchBusiness(modal);
								} else {
									$state.go('sideMenu.searchBusinesses', {}, { animation: 'no-animation' });
								}
							}
						}
						redirect(addr);
					});
				} else {
					where = [
						{
							attribute: 'default',
							value: true
						}
					];
					MyLoading.show($scope.translate('LOADING')+'...');
					Ordering.users.addresses.all({
						user_id: gUser.getData().id,
						where: where
					}, function (res) {
						MyLoading.hide();
						if (!res.error) {
							if (res.result.length == 0) {
								$scope.openFullAddress(MyLocation, function (address, modal) {
									MyLoading.show($scope.translate('LOADING')+'...');
									var _address = clone(address);
									_address.user_id = gUser.getData().id
									_address.location = JSON.stringify(_address.location);
									if (_address.map_data) _address.map_data = JSON.stringify(_address.map_data);
									Ordering.users.addresses.add(_address, function (res) {
										MyLoading.hide();
										if (!res.error) {
											gAddress.setData(res.result);
											var order = gOrder.getData();
											order.type = $scope.search.type;
											order.position = res.result.location;
											order.address = res.result.address;
											gOrder.setData(order);
											modal.scope.hide();
											if (ADDONS.web_template) {
												$state.go('main.search', { 'order_type': (order.type==1)?'delivery':'pickup', 'address': order.position.lat+','+order.position.lng });
											} else {
												if (ADDONS.single_business) {
													$scope.searchBusiness();
												} else {
													$state.go('sideMenu.searchBusinesses', {}, { animation: 'no-animation' });
												}
											}
										} else {
											MyAlert.show(res.result);
										}
									});
								});
							} else {
								$scope.openAddresses(function(address) {
									gAddress.setData(address);
									var order = gOrder.getData();
									order.type = $scope.search.type;
									order.position = address.location;
									order.address = address.address;
									gOrder.setData(order);
									if (ADDONS.web_template) {
										$state.go('main.search', { 'order_type': (order.type==1)?'delivery':'pickup', 'address': order.position.lat+','+order.position.lng });
									} else {
										if (ADDONS.single_business) {
											$scope.searchBusiness();
										} else {
											$state.go('sideMenu.searchBusinesses', {}, { animation: 'no-animation' });
										}
									}
								});
							}
						} else {
							MyAlert.show(res.result);
						}
					});
				}
			} else if (ADDONS.advanced_search || ADDONS.single_business) {
				var address = ADDRESS.street;
				var position = { lat: ADDRESS.latitude, lng: ADDRESS.longitude };
				if (gUser.getData().id != -1) {
					address = gUser.getData().address;
					position = gUser.getData().location;
				}
				setTimeout(function () {
					$('input').blur();
				}, 10);
				$scope.showMap(curLocation?curLocation.address:address, curLocation?curLocation.location:position, function (data, modal) {
					$scope.search.address = data.address;
					gOrder.setData({
						type: $scope.search.type,
						address: data.address,
						position: data.position
					});
					if (document.getElementById('home-address')) document.getElementById('home-address').value = data.address;
					$scope.myOrder.curAddress = data.address;
					$timeout(function () {
						$scope.address_selected = true;
						$scope.findRest(modal);
					}, 200);
				}, true);
			}
		}

		function closeModal(modal) {
			MyLoading.hide();
			if (modal) {
				modal.hide();
				modal.remove();
			}
		}

		$scope.findRest = function (modal) {
			if (SEARCH_BY_ADDRESS && GOOGLE_AUTOCOMPLETE_SELECTION_REQUIRED && !$scope.address_selected) {
				MyAlert.show($scope.translate('SELECT_ADDRESS_FROM_AUTOCOMPLETE'));
				return;
			}
			MyLoading.show($scope.translate('LOADING')+'...');
			var business_slug = null;
			if (gOrder.getData().business_slug) business_slug = gOrder.getData().business_slug;
			gOrder.setData({});
			if (!SEARCH_BY_ADDRESS) {
				var order = {};
				if (business_slug) order.business_slug = business_slug;
				order.type = $scope.search.type;
				order.city = $scope.myOrder.city;
				order.dropdownoption = $scope.myOrder.dropdownoption;
				for (var i = 0; i < $scope.dropdownoptions.length; i++) {
					if ($scope.dropdownoptions[i].id == order.dropdownoption) {
						order.address = $scope.dropdownoptions[i].name;
						break;
					}
				}
				gOrder.setData(order);
				if ($scope.myOrder.dropdownoption == '') {
					MyAlert.show($rootScope.translate('FRONT_SELECT_NEIBORHOOD'));
					MyLoading.hide();
					return;
				}
				if (ADDONS.web_template) {
					$state.go('main.searchN', { 'order_type': ($scope.search.type==1)?'delivery':'pickup', 'city': $scope.myOrder.city, 'neighborhood': $scope.myOrder.dropdownoption });
				} else {
					$scope.searchBusiness(modal);
				}
			} else {
				/*if (document.getElementById('home-address') == null) $scope.myOrder.curAddress = document.getElementById('dirMap').value;
				else */
				if (!$scope.myOrder.curAddress) $scope.myOrder.curAddress = document.getElementById('home-address').value;
				if (!$scope.myOrder.curAddress) {
					$("#home-address").blur();
					MyAlert.show($rootScope.translate('FRONT_SELECT_ADDRESS'));
					MyLoading.hide();
					return;
				}
				var order = gOrder.getData();
				if (business_slug) order.business_slug = business_slug;
				delete order.city;
				delete order.dropdownoption;
				order.type = $scope.search.type;
				gOrder.setData(order);
				if (ADDONS.web_template && !CLOSEST_BUSINESS) {
					if (!ADDONS.advanced_search || !gOrder.getData().position) {
						MyLoading.show($scope.translate('LOADING')+'...');
						Geolocation.locationByAddress($scope.myOrder.curAddress, function (data) {
							MyLoading.hide();
							var order = gOrder.getData();
							order.address = $scope.myOrder.curAddress;
							order.position = data.location;
							gOrder.setData(order);
							if (NEW_FEATURES.MULTI_ADDRESS) {
								gAddress.setData({
									address: $scope.myOrder.curAddress,
									location: data.location
								});
							}
							closeModal(modal);
							$state.go('main.search', { 'order_type': ($scope.search.type==1)?'delivery':'pickup', 'address': gOrder.getData().position.lat+','+gOrder.getData().position.lng });
						});
					} else {
						closeModal(modal);
						$state.go('main.search', { 'order_type': ($scope.search.type==1)?'delivery':'pickup', 'address': gOrder.getData().position.lat+','+gOrder.getData().position.lng });
					}
				} else {
					if (!ADDONS.advanced_search || !gOrder.getData().position) {
						MyLoading.show($rootScope.translate('MOBILE_FRONT_LOAD_SEARCHING'));
						Geolocation.locationByAddress($scope.myOrder.curAddress, function (data) {
							MyLoading.hide();
							order.address = data.address;
							order.position = data.location;
							gOrder.setData(order)
							if (NEW_FEATURES.MULTI_ADDRESS) {
								gAddress.setData({
									address: data.address,
									location: data.location
								});
							}
							$scope.searchBusiness(modal);
						});
					} else {
						if (NEW_FEATURES.MULTI_ADDRESS) {
							gAddress.setData({
								address: order.address,
								location: order.position
							});
						}
						$scope.searchBusiness(modal);
					}
				}
			}

		};

		$scope.delivery = function () {
			$scope.search.type = 1;
			if (SEARCH_BY_ADDRESS) {
				$scope.openMap();
			} else {
				$scope.findRest();
			}
		}

		$scope.pickup = function () {
			$scope.search.type = 2;
			if (SEARCH_BY_ADDRESS) {
				$scope.openMap();
			} else {
				$scope.findRest();
			}
		}

		$scope.searchBusiness = function (modal) {
			var order = gOrder.getData();
			var data_search = {
				type: gOrder.getData().type,
				params: 'name,slug,logo,header,location,about,description,food,alcohol,groceries,laundry,zones,delivery_price,minimum,schedule,featured,reviews,delivery_time,pickup_time'
			};
			if (!CLOSEST_BUSINESS && !ADDONS.single_business) data_search.limit = 25;
			if (gOrder.getData().position) data_search.location = gOrder.getData().position.lat+','+gOrder.getData().position.lng;
			else data_search.dropdownoption = gOrder.getData().dropdownoption;
			MyLoading.show($scope.translate("LOADING")+'...');
			if (NEW_FEATURES.API_BUSINESS_LISTING_V2) {
				data_search.v = 2;
			}
			Ordering.business.all(data_search, function (res) {
				MyLoading.hide();
				if (!res.error) {
					if (res.result.length) {
						if (CLOSEST_BUSINESS) {
							var closest = res.result[0];
							for (var i = 1; i < res.result.length; i++) {
								if (closest.distance > res.result[i].distance) closest = res.result[i];
							}
							order.business_slug = closest.slug;
							gOrder.setData(order);
							if (ADDONS.web_template) {
								closeModal(modal);
								$state.go('main.business', { 'business': closest.slug });
							} else {
								data_search = {
									id_or_slug: closest.id,
									type: gOrder.getData().type,
									location: (gOrder.getData().position) ? gOrder.getData().position.lat+','+gOrder.getData().position.lng : $state.params.address,
									dropdownoption: gOrder.getData().dropdownoption
								};
								MyLoading.show($scope.translate("LOADING")+'...');
								Ordering.business.get(data_search, function (res) {
									MyLoading.hide();
									closeModal(modal);
									gBusiness.setData(res.result);
									$state.go('mobileDetailRest');
								});
							}
						} else if (ADDONS.single_business) {
							var single = null;
							for (var i = 0; i < res.result.length; i++) {
								if (res.result[i].id == BUSINESS_ID) {
									single = res.result[i];
									break;
								}
							}
							if (single) {
								order.business_slug = single.slug;
								gOrder.setData(order);
								if (ADDONS.web_template) {
									closeModal(modal);
									$state.go('main.business', { 'business': single.slug });
								} else {
									data_search = {
										id_or_slug: single.id,
										type: gOrder.getData().type,
										location: (gOrder.getData().position) ? gOrder.getData().position.lat+','+gOrder.getData().position.lng : $state.params.address
									};
									MyLoading.show($scope.translate("LOADING")+'...');
									Ordering.business.get(data_search, function (res) {
										MyLoading.hide();
										closeModal(modal);
										gBusiness.setData(res.result);
										$state.go('sideMenu.restDetail');
										// $state.go('mobileDetailRest');
									});
								}
							} else {
								MyLoading.hide();
								if (gOrder.getData().type == 1) MyAlert.show($scope.translate('FRONT_SORRY_DELIVERY_OPTION'));
								else MyAlert.show($scope.translate('MOBILE_VERY_FAR_FOR_PICKUP'));
							}
						} else {
							closeModal(modal);
							gAllBusiness.setData(res.result);
							//$ionicViewSwitcher.nextmodalion('forward');
							$state.go(NEW_FEATURES.MULTI_ADDRESS?'sideMenu.searchBusinesses':'restaurantSearch');
							data_search.limit = null;
							data_search.offset = 25;
							if (NEW_FEATURES.API_BUSINESS_LISTING_V2) {
								data_search.v = 2;
							}
							Ordering.business.all(data_search, function (res) {
								var aux = gAllBusiness.getData();
								aux = aux.concat(res.result);
								gAllBusiness.setData(aux);
							});
						}
					} else {
						MyLoading.hide();
						if (gOrder.getData().type == 1) MyAlert.show($scope.translate('FRONT_SORRY_DELIVERY_OPTION'));
						else MyAlert.show($scope.translate('MOBILE_VERY_FAR_FOR_PICKUP'));
					}
				}
			});
		}

		$scope.getCurLocation = function() {
			if (ADDONS.advanced_search) {
				MyLoading.show($scope.translate("LOADING")+'...');
				navigator.geolocation.getCurrentPosition(function(res){
					MyLoading.hide();
					if (res) {
						var geocoder = new google.maps.Geocoder;
						var location = {
							lat: res.coords.latitude,
							lng: res.coords.longitude
						};
						geocoder.geocode({'location': location}, function(results, status) {
							if (status === 'OK') {
								var address = {
									address: results[0].formatted_address,
									location: location
								}
								// open_full_address.scope.address.address = results[0].formatted_address;
								$scope.openMap(address);
							} else console.log('err')
						})
					}
				}, function () {
					MyLoading.hide();
					MyAlert.show($scope.translate('MOBILE_GET_LOCATION_ERROR'));
				});
				// return;
			} else {
				$scope.checkGPS(function (gpsAvailable) {
					if (gpsAvailable) {
						MyLoading.show($scope.translate("LOADING")+'...');
						GeolocationSvc().then(function(position) {
							var geocoder = new google.maps.Geocoder;
							geocoder.geocode({'location': position}, function(results, status) {
								MyLoading.hide();
								if (status === 'OK') {
									var order = {
										address: results[0].formatted_address,
										position: position
									};
									if (gOrder.getData().business_slug) order.business_slug = gOrder.getData().business_slug; 
									gOrder.setData(order);
									$scope.myOrder.curAddress = order.address;
									$scope.address_selected = true;
									// $scope.findRest();
								} else MyAlert.show($scope.translate('MOBILE_GET_LOCATION_ERROR'));
							})
							// AddressLookupSvc.lookupByAddress(position.lat, position.lng).then(function(addr) {
							// 	MyLoading.hide();
							// 	console.log(addr)
							// 	var order = {
							// 		address: addr.address,
							// 		position: {
							// 			lat: position.lat,
							// 			lng: position.lng
							// 		}
							// 	};
							// 	if (gOrder.getData().business_slug) order.business_slug = gOrder.getData().business_slug; 
							// 	gOrder.setData(order);
							// 	$scope.myOrder.curAddress = addr.address;
							// 	$scope.findRest();
							// }).catch(function (err) {
							// 	setTimeout(function () {
							// 		MyLoading.hide();
							// 	}, 10);
							// 	MyAlert.show($scope.translate('MOBILE_GET_LOCATION_ERROR'));
							// });
						}).catch(function (err) {
							setTimeout(function () {
								MyLoading.hide();
							}, 10);
							MyAlert.show($scope.translate('MOBILE_GET_LOCATION_ERROR'));
						});
					} else MyAlert.show($scope.translate('MOBILE_GET_LOCATION_ERROR'));
				});
			}
		};

		Extensions.runAction('enter_home_view', null, $scope);

		if (ADDONS.web_template) $scope.initView();
		/*newfunction-homeScreenCtrl*/

	});

	_controllers.controller('morePagesCtrl', function($scope, $state, $rootScope, $sce, MyAlert, MyLoading, Ordering){
		$scope.page = {}
		$scope.slug = $state.params.slug
		Ordering.pages.get({
			page_id: $scope.slug
		}, function(res){
			MyLoading.hide()
			if (!res.error) {
				$scope.page = res.result
				$scope.trustAsHtml = $sce.trustAsHtml($scope.page.body)
			} else return $state.go('main.notfound')
		});
		// $scope.enablePage = function(){
		// 	MyLoading.toast($scope.translate('LOADING')+'...');
		// 	Ordering.pages.update({
		// 		page_id: $scope.page.id,
		// 		enabled: $scope.page.enabled
		// 	}, function(res){
		// 		MyLoading.hide();
		// 		if (!res.error) {
		// 			MyLoading.success($scope.translate('PAGE_SAVED'))
		// 		} else {

		// 		}
		// 	});
		// }
		$scope.editPage = function(){
			$state.go('main.settings-page',{slug: $scope.page.id})
		}
		// $scope.deletePage = function(){
		// 	MyAlert.confirm($scope.translate('QUESTION_DELETE_PAGE')).then(function(){
		// 		Ordering.pages.delete({id: $scope.page.id}, function(res){
		// 			if (!res.error) {
		// 				for (var i = 0; i < $rootScope.customPages.length; i++) {
		// 					if ($rootScope.customPages[i].id == $scope.page.id) {
		// 						$rootScope.customPages.splice(i, 1);
		// 						break;
		// 					}
		// 				}
		// 				location.href = ((!WEB_ADDONS.remove_hash?'#':'')+'/settings/pages')
		// 			} else MyAlert.show(res.result)
		// 		})
		// 	});
		// }
	});

	_controllers.controller('sideMenuCtrl', function($scope, $state, $rootScope, $ionicHistory, gStates, ADDONS, MyLoading, Analytics/*newsideMenuCtrl*/){
		Analytics.set('&dp', 'Memu');
		Analytics.pageView();
		$scope.ADDONS = ADDONS;
		$scope.version = FRONT_VERSION;
		$scope.refreshReviews();
		$scope.$on('$ionicView.enter',function(){
			$ionicHistory.nextViewOptions({
				disableBack: true
			});
			$scope.state.loginState = LOGIN_STATE;
		});

		$scope.state = {
			loginState : LOGIN_STATE
		};

		/*newvariable-sideMenuCtrl*/
		
		$scope.onGoMyOrder = function() {
			gStates.setState(STATE.MY_ORDER);
			if (!LOGIN_STATE) {
				$state.go('signUp');
			} else {
				$ionicHistory.nextViewOptions({
					disableBack: true
				});
				$state.go('sideMenu.myOrder');
			}
		};

		$scope.addMyCardinfo = function(){
			$rootScope.fromMyCards = true;
			$state.go('sideMenu.cardDetail');
		};
		
		$scope.onGoMyCard = function() {
			gStates.setState(STATE.MY_CARD);
			if (!LOGIN_STATE) {
				$state.go('signUp');
			} else {
				$ionicHistory.nextViewOptions({
					disableBack: true
				});
				$state.go('sideMenu.myCard');
			}
		};

		/*newfunction-sideMenuCtrl*/
	})
	_controllers.controller('profileCtrl', function($scope, $rootScope, $location, $state, gUser, MyAlert, MyModal, MyLoading, Analytics, Ordering, gNext/*newprofileCtrl*/){
		Analytics.set('&dp', 'Profile');
		Analytics.pageView();
		$rootScope.curTab = 0;
		$scope.checkoutfields = {};
		$scope.cities = [];
		$scope.dropdownoptions = [];
		var address_selected = true;
		$scope.isSelfDeleteAccount = ALLOW_USER_SELF_DELETE_ACCOUNT;
		/*newvariable-profileCtrl*/

		$scope.$on('$ionicView.beforeEnter', function(){
			initView();
		});

		function initView() {
			if (!localStorageApp.getItem(STORE.TOKEN)) {
				gNext.set($location.url());
				$scope.onGoLogin();
				return;
			}
			if (ADDONS.web_template && $location.search().order) $scope.onTab(null, 1);
			MyLoading.show($scope.translate('LOADING')+'...');
			$scope.getLanguage(function (err, list, dictionary) {
				if (err) MyAlert.show(err);
				else {
					$rootScope.pageTitle = gUser.getData().name + (gUser.getData().lastname?' ' + gUser.getData().lastname:'');
					Ordering.checkoutfields.all({}, function (res) {
						MyLoading.hide();
						$scope.checkoutfields = {};
						for (var i = 0; i < res.result.length; i++) {
							$scope.checkoutfields[res.result[i].code] = res.result[i];
						}
						$scope.updateUser = gUser.getData();
						if ($scope.updateUser.city_id) $scope.updateUser.city_id = $scope.updateUser.city_id+"";
						Ordering.users.find({
							id: gUser.getData().id,
							params: 'name,middle_name,lastname,second_lastname,email,cellphone,address,address_notes,dropdown_option_id,dropdown_option,photo,qualification'
						},function(res) {
							if (!res.error) {
								if (res.result.dropdown_option_id) res.result.dropdown_option_id = res.result.dropdown_option_id+"";
								if (res.result.dropdown_option && res.result.dropdown_option.city_id) {
									res.result.city_id = res.result.dropdown_option.city_id+"";
								}
								if ($scope.updateUser.city_id) $scope.updateUser.city_id = $scope.updateUser.city_id+"";
								Object.assign($scope.updateUser, res.result);
								gUser.setData($scope.updateUser);
							}
						});
						if ($scope.updateUser.dropdown_option) {
							$scope.updateUser.city_id = $scope.updateUser.dropdown_option.city.id+'';
							$scope.updateUser.dropdown_option_id = $scope.updateUser.dropdown_option.id+'';
						} else {
							$scope.updateUser.city_id = '';
							$scope.updateUser.dropdown_option_id = '';
						}
						$scope.loadGoogleMaps(function () {
							var input = document.getElementById('address-profile');
							if (input) {
								var options = {
									types: []
								};
								if(FULL_ADDRESS_ONLY){
									options.types.push('address');
								}
								if (COUNTRY_AUTOCOMPLETE != "*") options.componentRestrictions = {
									country: COUNTRY_AUTOCOMPLETE
								}
								var autocomplete = new google.maps.places.Autocomplete(input, options);
								autocomplete.setFields(['place_id', 'formatted_address', 'geometry']);
								autocomplete.addListener('place_changed', function() {
									$scope.updateUser.address = autocomplete.getPlace().formatted_address;
									$scope.updateUser.location = {
										lat: autocomplete.getPlace().geometry.location.lat(),
										lng: autocomplete.getPlace().geometry.location.lng()
									}
									address_selected = true;
								});
								input.onkeydown = function () {
									address_selected = false;
								}
							}
						});
					});
					Ordering.countries.all({}, function (res) {
						if (!res.error) {
							for (var i = 0; i < res.result.length; i++) {
								for (var j = 0; j < res.result[i].cities.length; j++) {
									res.result[i].cities[j].id = res.result[i].cities[j].id+'';
									if (res.result[i].cities[j].enabled && res.result[i].cities[j].options.length > 0) {
										$scope.cities.push(res.result[i].cities[j]);
										$scope.dropdownoptions = $scope.dropdownoptions.concat(res.result[i].cities[j].options);
									}
								}
							}
						}
					});
					Extensions.runAction('after_profile_view', gUser.getData(), $scope);
					$scope.dummy = 'img/signup-avatar.png';
				}
			});

		}

		$rootScope.curTab = $state.params.tab;
		$scope.resetDropdownoption = function () {
			$scope.updateUser.dropdown_option_id = "";
		}

		$scope.updateProfile = function () {
			if (typeof $scope.updateUser == 'undefined') return;
			if ($scope.updateUser.address && GOOGLE_AUTOCOMPLETE_SELECTION_REQUIRED && !address_selected) {
				MyAlert.show($scope.translate('SELECT_ADDRESS_FROM_AUTOCOMPLETE'));
				return;
			}
			var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			if (($scope.updateUser.email && !re.test($scope.updateUser.email)) || !$scope.updateUser.email) {
				MyAlert.show($scope.translate('valid_email_V2'));
				return;
			}
			MyLoading.show($scope.translate('MOBILE_UPDATING'));
			var update_data = {
				id: $scope.updateUser.id,
				name: $scope.updateUser.name,
				middle_name: $scope.updateUser.middle_name,
				lastname: $scope.updateUser.lastname,
				second_lastname: $scope.updateUser.second_lastname,
				email: $scope.updateUser.email,
				address: $scope.updateUser.address,
				cellphone: $scope.updateUser.cellphone,
				location: JSON.stringify($scope.updateUser.location),
				address_notes: $scope.updateUser.address_notes,
				zipcode: $scope.updateUser.zipcode,
				dropdown_option_id: $scope.updateUser.dropdown_option_id,
				photo: $scope.updateUser.image,
			}
			if ($scope.updateUser.password && $scope.updateUser.password != '') {
				update_data.password = $scope.updateUser.password;
			} 
			Ordering.users.update(update_data, function (res) {
				MyLoading.hide();
				if (!res.error) {
					MyAlert.show($scope.translate('MOBILE_SUCCESS_UPDATE'));
					gUser.setData(res.result);
				} else MyAlert.show(res.result);
			}, function (res) {
				MyLoading.hide();
			}, null, true, true);
		};

		$rootScope.confirmData = {
			password: ''
		}

		$scope.deleteMyAccount = function () {
			MyAlert.confirm($scope.translate('QUESTION_DELETE_USER_ACCOUNT')).then(function(res) {
				if (res == 'OK') {
					if (!ADDONS.web_template) {
						MyAlert.confirmInput($scope.translate('INSERT_PASSWORD_CONFIRM'), '<input type="password" ng-model="confirmData.password">').then(function(res){
							if (res != 'CANCEL') {
								Ordering.users.password({
									password: res.password
								},function (res) {
									if (!res.error) {
										$scope.performDeleteAccount()
									}
									else MyAlert.show(res.result)
								})
							}
						});
					} else {
						MyModal.showTemplate('templates/'+ADDONS.template+'/views/editor/check-password.html',{
							scope: $scope,
							animation: 'slide-in-up'
						}).then(function(password_modal){
							modals.push(password_modal);
							password_modal.show();
							password_modal.scope.checkPassword = function (password) {
								Ordering.users.password({
									password: password
								},function (res) {
									if (!res.error) {
										password_modal.hide()
										$scope.performDeleteAccount()
									}
									else MyAlert.show(res.result)
								})
							}
						})
					}
					
				}
			});
		}
		$scope.performDeleteAccount = function () {
			MyLoading.show($scope.translate('LOADING')+'...');
			Ordering.users.delete({
				id: $scope.updateUser.id
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					MyAlert.show($scope.translate('SUCCESS_DELETE_USER'));
					setTimeout(function() { $rootScope.onSignOut(true); }, 500);
				} else MyAlert.show(res.result);
			}, function (err) {
				MyLoading.hide();
			});
		}

		//Web mode

		$scope.onTab = function ($event, tab) {
			if ($event) $event.preventDefault();
			$rootScope.curTab = tab;
		}
		if (ADDONS.web_template) initView();

		Extensions.runAction('enter_profile_view', null, $scope);

		/*newfunction-profileCtrl*/

	});

	_controllers.controller('addressesCtrl', function ($rootScope, $scope, MyLoading, MyAlert, gUser, gAddress, Ordering) {
		$scope.addresses = [];
		$scope.loading = true;
		Ordering.users.addresses.all({
			user_id: gUser.getData().id
		}, function (res) {
			$scope.loading = false;
			if (!res.error) {
				$scope.addresses = res.result;
			} else MyAlert(res.result);
		});

		$scope.change = function (address) {
			if (address.default) return;
			if (ADDONS.web_template) MyLoading.toast($scope.translate('LOADING')+'...');
			else MyLoading.show($scope.translate('LOADING')+'...');
			Ordering.users.addresses.update({
				id: address.id,
				user_id: gUser.getData().id,
				default: true
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					$scope.addresses.forEach(function (address) {
						if (address.id != res.result.id) {
							address.default = false;
						} else address.default = true;
					});
					gAddress.setData(address);
					if (ADDONS.web_template) MyLoading.success($scope.translate('ADDRESS_CHANGED'), 2000);
				} else MyAlert.show(res.result);
			})
		}

		$scope.edit = function (address) {
			$scope.openFullAddress(address, function (addr, modal) {
				if (ADDONS.web_template) MyLoading.toast($scope.translate('LOADING')+'...');
				else MyLoading.show($scope.translate('LOADING')+'...');
				Ordering.users.addresses.update({
					id: addr.id,
					user_id: gUser.getData().id,
					name: addr.name,
					lastname: addr.lastname,
					cellphone: addr.cellphone,
					address: addr.address,
					internal_number: addr.internal_number,
					address_notes: addr.address_notes,
					location: JSON.stringify(addr.location),
					zipcode: addr.zipcode,
					map_data: JSON.stringify(addr.map_data),
					tag: addr.tag
				}, function (res) {
					MyLoading.hide();
					if (!res.error) {
						Object.assign(address, res.result);
						modal.scope.hide();
						if (res.result.default) {
							gAddress.setData(address);
						}
						if (ADDONS.web_template) MyLoading.success($scope.translate('ADDRESS_SAVED'), 2000);
					} else MyAlert.show(res.result);
				}, null, null, true);
			});
		}

		$scope.delete = function (address) {
			MyAlert.confirm($scope.translate('QUESTION_DELETE_ADDRESS')).then(function () {
				if (ADDONS.web_template) MyLoading.toast($scope.translate('LOADING')+'...');
				else MyLoading.show($scope.translate('LOADING')+'...');
				Ordering.users.addresses.delete({
					id: address.id,
					user_id: gUser.getData().id
				}, function (res) {
					MyLoading.hide();
					if (!res.error) {
						for (var i = 0; i < $scope.addresses.length; i++) {
							var addr = $scope.addresses[i];
							if (addr.id == address.id) {
								$scope.addresses.splice(i, 1);
								break;
							}
						}
						if (ADDONS.web_template) MyLoading.success($scope.translate('ADDRESS_DELETED'), 2000);
					} else MyAlert.show(res.result);
				});
			});
		}

		$scope.add = function () {
			$scope.openFullAddress(null, function (addr, modal) {
				if (ADDONS.web_template) MyLoading.toast($scope.translate('LOADING')+'...');
				else MyLoading.show($scope.translate('LOADING')+'...');
				Ordering.users.addresses.add({
					user_id: gUser.getData().id,
					name: addr.name,
					lastname: addr.lastname,
					cellphone: addr.cellphone,
					address: addr.address,
					internal_number: addr.internal_number,
					address_notes: addr.address_notes,
					location: JSON.stringify(addr.location),
					zipcode: addr.zipcode,
					map_data: JSON.stringify(addr.map_data),
					tag: addr.tag
				}, function (res) {
					MyLoading.hide();
					if (!res.error) {
						$scope.addresses.push(res.result);
						modal.scope.hide();
						if (res.result.default) {
							gAddress.setData(addr);
						}
						$scope.addresses.forEach(function (address) {
							address.default = address.id == res.result.id; 
						});
						if (ADDONS.web_template) MyLoading.success($scope.translate('ADDRESS_SAVED'), 2000);
					} else MyAlert.show(res.result);
				});
			});
		}

		Extensions.runAction('enter_addresses_view', null, $scope);
	});

	_controllers.controller('orderCtrl', function($scope, $location, $ionicScrollDelegate, MyLoading, MyAlert, gUser, MyModal, Analytics, Ordering/*neworderCtrl*/){
		$scope.$on('$locationChangeStart', function(event, current, old) {
			if (!ADDONS.web_template) return;
			for (var i = 0; i < $scope.orders.length; i++) {
				if ($scope.orders[i].id == $location.search().order) {
					$scope.orderViewMore($scope.orders[i]);
					break;
				}
			}
		});
		
		Analytics.set('&dp', 'Orders');
		Analytics.pageView();
		$scope.reviews_pending = false;
		$scope.curOrder = {};

		/*newvariable-orderCtrl*/	

		$scope.$on('$ionicView.beforeEnter', function(){
			$ionicScrollDelegate.scrollTop();
			$scope.loadOrderData();
		});

		$scope.orders = [];
		$scope.loadOrderData = function () {
			MyLoading.show($scope.translate('MOBILE_GETTING_ORDER'));
			var cUser = gUser.getData();
			Ordering.orders.all({}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					var to_open = null;
					for (var i = 0; i < res.result.length; i++) {
						if ((res.result[i].status == 1 || res.result[i].status == 11)&& !res.result[i].review && res.result[i].business_id) {
							$scope.reviews_pending = true;
						}
						if ($location.search().order == res.result[i].id) to_open = res.result[i];
					}
					$scope.orders = res.result;
					if (to_open) $scope.orderViewMore(to_open);
					var socket = io(SOCKET_URL, {
						extraHeaders: {
							Authorization: "Bearer "+localStorageApp.getItem(STORE.TOKEN),
						},
						query: "token="+localStorageApp.getItem(STORE.TOKEN)+"&project="+API_PROJECT_NAME,
						transports: [ 'websocket' ]
					});
			
					socket.on('connect', function () {
						var orders_room = API_PROJECT_NAME+'_orders_'+gUser.getData().id;
						var message_orders = API_PROJECT_NAME+'_messages_orders_'+gUser.getData().id;
						socket.emit('join', orders_room);
						socket.emit('join', message_orders);
			
						socket.on('update_order', function (order) {
							order.status *= 1;
							for (var i = 0; i < $scope.orders.length; i++) {
								if ($scope.orders[i].id == order.id) {
									Object.assign($scope.orders[i], order);
									break;
								}
							}
						});
					});
					socket.on('message', function (message) {
						$scope.orders.forEach(function (order) {
							if (order.id == message.order_id) {
								$scope.$apply(function () {
									order.unread_count++;
								});
							}
						});
					});
				} else MyAlert.show(res.result);
			});
		};

		$scope.openDetails = function (order) {
			if (ADDONS.web_template) $location.search('order', order.id);
			else $scope.orderViewMore(order);
		}

		$scope.orderDetail = {};
		
		/* Reviews */
		$scope.openModalUserReview = function(order, driver, $event) {
			if ($event) $event.stopPropagation();
			MyModal.showTemplate('templates/'+ADDONS.template+'/views/order-review-popup.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function(modal) {
				modals.push(modal);
				modal.show();
				modal.scope.driver = order.driver;
				modal.scope.user_review = true;
				modal.scope.review = {
					comments: ''
				};
				modal.scope.toReview = [
					{
						title: $scope.translate('TEMPLATE_SERVICE'),
						review: 0,
						selected: 0
					}
				]
				modal.scope.paintStars = function (category, index) {
					category.selected = index+1;
				}
				modal.scope.chooseReview = function (category, index) {
					category.review = index+1;
				}
				modal.scope.rangeReview = function () {
					var range = [];
					for (var i = 0; i < 5; i++) {
						range.push(i+1);
					}
					return range;
				}
				modal.scope.addReview = function () {
					MyLoading.show($scope.translate('MOBILE_FRONT_LOAD_LOADING'));
					Ordering.user_reviews.add({
						order_id: order.id,
						qualification: modal.scope.toReview[0].review,
						user_id: order.driver_id,
						comment: modal.scope.review.comments,
					}, function (res) {
						MyLoading.hide();
						if (!res.error) {
							MyAlert.show($scope.translate('REVIEW_THANK_YOU_MESSAGE'));
							order.user_review = res.result;
							$scope.refreshReviews();
							modal.scope.hide();
						} else MyAlert.show(res.result);
					});
				};
			})
		}
		$scope.openModalReview = function (order, $event) {
			if ($event) $event.stopPropagation();
			//$scope.curOrder = order;
			MyModal.showTemplate('templates/'+ADDONS.template+'/views/order-review-popup.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function(modal) {
				modals.push(modal);
				modal.show();
				modal.scope.order = order;
				modal.scope.review = {
					name: gUser.getData().name,
					email: gUser.getData().email,
					comments: ''
				};
				modal.scope.toReview = [
					{
						title: $scope.translate('TEMPLATE_QUALITY_OF_FOOD'),
						review: 0,
						selected: 0
					},
					{
						title: $scope.translate('TEMPLATE_PUNCTUALITY'),
						review: 0,
						selected: 0
					},
					{
						title: $scope.translate('TEMPLATE_SERVICE'),
						review: 0,
						selected: 0
					},
					{
						title: $scope.translate('TEMPLATE_FOOD_PACKAGING'),
						review: 0,
						selected: 0
					}
				];
				modal.scope.paintStars = function (category, index) {
					category.selected = index+1;
				}
				modal.scope.chooseReview = function (category, index) {
					category.review = index+1;
				}
				modal.scope.rangeReview = function () {
					var range = [];
					for (var i = 0; i < 5; i++) {
						range.push(i+1);
					}
					return range;
				}
				modal.scope.addReview = function () {
					function doReview() {
						MyLoading.show($scope.translate('MOBILE_FRONT_LOAD_LOADING'));
						Ordering.reviews.add({
							business_id: order.business_id,
							order_id: order.id,
							quality: modal.scope.toReview[0].review,
							delivery: modal.scope.toReview[1].review,
							service: modal.scope.toReview[2].review,
							package: modal.scope.toReview[3].review,
							user_id: gUser.getData().id,
							comment: modal.scope.review.comments,
						}, function (res) {
							MyLoading.hide();
							if (!res.error) {
								MyAlert.show($scope.translate('REVIEW_THANK_YOU_MESSAGE'));
								order.review = res.result;
								if ($scope.orders) {
									var pending = false;
									 for (var i = 0; i < $scope.orders.length; i++) {
										if (($scope.orders[i].status == 1 || $scope.orders[i].status == 11) && !$scope.orders[i].review /*&& $scope.orders.business_id*/) {
											pending = true;
											break;
										}
									}
									$scope.reviews_pending = pending;
								}
								$scope.refreshReviews();
								modal.scope.hide();
							} else MyAlert.show(res.result);
						});
					}
					reviewUser = gUser.getData();
					personalData = false;
					if (reviewUser.name && modal.scope.review.comments.replace(/\s/g, '').toLowerCase().indexOf(reviewUser.name.toLowerCase()) != -1) personalData = true;
					if (reviewUser.lastname && modal.scope.review.comments.replace(/\s/g, '').toLowerCase().indexOf(reviewUser.lastname.toLowerCase()) != -1) personalData = true;
					if (reviewUser.email && modal.scope.review.comments.replace(/\s/g, '').toLowerCase().indexOf(reviewUser.email.toLowerCase()) != -1) personalData = true;
					if (reviewUser.phone && modal.scope.review.comments.replace(/\s/g, '').toLowerCase().indexOf(reviewUser.phone.toLowerCase()) != -1) personalData = true;
					if (personalData) {
						MyAlert.confirm($scope.translate('PERSONAL_DATA_WARNING')).then(function () {
							doReview();
						});
					} else {
						doReview()
					}
				};
				modal.scope.hide = function () {
					modal.remove();
					modal.hide();
				}
				// disableScroll();
			});
		}

		Extensions.runAction('enter_orders_view', null, $scope);

		if (ADDONS.web_template) $scope.loadOrderData();
		
		/*newfunction-orderCtrl*/
	})
	_controllers.controller('cardCtrl', function($scope, $ionicScrollDelegate, $ionicNavBarDelegate, MyLoading, MyAlert, gUser, Analytics, Ordering/*newcardCtrl*/){
		
		Analytics.set('&dp', 'Cards');
		Analytics.pageView();
		$scope.cards = []

		/*newvariable-cardCtrl*/

		$scope.$on('$ionicView.beforeEnter', function(){
			$ionicScrollDelegate.scrollTop();
			$scope.loadCards();
			$ionicNavBarDelegate.showBar(true);
		});

		$scope.loadCards = function() {
			MyLoading.show($scope.translate('MOBILE_FRONT_LOAD_GETTING_DATA'));
			Ordering.payments.cards.all({
				business_id: -1,
				user_id: gUser.getData().id,
				gateway: 'stripe'
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					$scope.cards = res.result;
				} else MyAlert.show(res.result);
			});
		};

		$scope.addNewCard = function () {
			MyLoading.show($scope.translate('MOBILE_FRONT_LOAD_LOADING'));
			Ordering.payments.credentials({
				gateway: 'stripe'
			}, function (res) {
				if (!res.error) {
					var credentials = res.result;
					function afterRequirements(credentials, requirements) {
						$scope.addStripeCard(credentials.publishable, function () {
							MyLoading.show($scope.translate('LOADING')+'...');
							Ordering.payments.cards.all({
								business_id: -1,
								user_id: gUser.getData().id,
								gateway: 'stripe'
							}, function (res) {
								MyLoading.hide();
								if (!res.error) {
									$scope.cards = res.result;
								} else MyAlert.show(res.result);
							});
						}, requirements);
					}
					if (!BREAKER_FEATURES.STRIPE_UPDATED) {
						MyLoading.hide();
						afterRequirements(credentials);
					} else {
						Ordering.payments.requirements({
							gateway: 'stripe',
							type: 'add_card'
						}, function (res) {
							MyLoading.hide();
							if (!res.error) {
								afterRequirements(credentials, res.result);
							} else MyAlert.show($scope.translate(res.result));
						});
					}
				} else MyAlert.show(res.result);
			});
		}

		$scope.addStripeCard = function (publishable, cb, requirements) {
			$scope.showCardStripe(publishable, false, function (token) {
				MyLoading.show($scope.translate('LOADING')+'...');
				Ordering.payments.cards.add({
					business_id: -1,
					user_id: gUser.getData().id,
					token_id: token,
					gateway: 'stripe'//paymethod.gateway
				}, function (res) {
					MyLoading.hide();
					if (!res.error) {
						cb();
					} else MyAlert.show(res.result);
				});
			}, requirements);
		}

		$scope.deleteCard = function(card) {
			MyAlert.confirm($scope.translate('MOBILE_QUESTION_DELETE_CARD')).then(function (res) {
				MyLoading.show($scope.translate('LOADING')+'...');
				Ordering.payments.cards.delete({
					business_id: -1,
					card_id: card.id,
					user_id: gUser.getData().id,
					gateway: 'stripe'
				}, function (res) {
					MyLoading.hide();
					if (!res.error) {
						for (var i = 0; i < $scope.cards.length; i++) {
							if ($scope.cards[i].id == card.id) {
								$scope.cards.splice(i, 1);
							}
						}
					} else MyAlert.show(res.result);
				});
			});
		}

		Extensions.runAction('enter_cards_view', null, $scope);

		if (ADDONS.web_template) $scope.loadCards();
		/*newfunction-cardCtrl*/
	});

	_controllers.controller('keyCtrl', function($scope, $ionicScrollDelegate, $ionicNavBarDelegate, MyLoading, MyAlert, gUser, Analytics, Ordering/*newcardCtrl*/){
		Analytics.set('&dp', 'Keys');
		Analytics.pageView();

		$scope.keys = [];

		$scope.getKeys = function() {
			MyLoading.show($scope.translate('LOADING')+'...');
			Ordering.users.keys.all({
				user_id: gUser.getData().id,
				params: 'id,key'
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					$scope.keys = res.result;
				} else MyAlert.show(res.result);
			});
		};
		$scope.getKeys();

		$scope.add = function () {
			MyLoading.show($scope.translate('LOADING')+'...');
			Ordering.users.keys.add({
				user_id: gUser.getData().id
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					$scope.keys.push(res.result);
				} else MyAlert.show(res.result);
			});
		}

		$scope.delete = function (key) {
			MyLoading.show($scope.translate('LOADING')+'...');
			Ordering.users.keys.delete({
				id: key.id,
				user_id: gUser.getData().id
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					for (var i = 0; i < $scope.keys.length; i++) {
						if ($scope.keys[i].id == key.id) {
							$scope.keys.splice(i, 1);
							break;
						}
					}
				} else MyAlert.show(res.result);
			});
		}

		Extensions.runAction('enter_keys_view', null, $scope);
	});

	_controllers.controller('addressCtrl', function($scope, $state){

		/*newvariable-addressCtrl*/		
		/*newfunction-addressCtrl*/

	});

	_controllers.controller('settingCtrl', function($scope, MyLoading, MyAlert, Analytics, gUser, Ordering/*newsettingCtrl*/){
		Analytics.set('&dp', 'Settings');
		Analytics.pageView();
		$scope.user = gUser.getData();

		/*newvariable-settingCtrl*/	

		$scope.$on('$ionicView.beforeEnter', function() {});
		$scope.getLoginState = function(){
			return LOGIN_STATE;
		};
		$scope.pushChanged = function(){
			MyLoading.show($scope.translate('MOBILE_UPDATING'));
			Ordering.users.update({
				id: $scope.user.id,
				push_notifications: $scope.user.push_notifications
			}, function (res) {
				if (!res.error) {
					gUser.setData($scope.user);
					MyLoading.hide();
				} else MyAlert.show(res.result);
			});
		};

		Extensions.runAction('enter_settings_view', null, $scope);
		
		/*newfunction-settingCtrl*/
	});

	_controllers.controller('orderingCtrl', function($scope, $state, $ionicHistory/*neworderingCtrl*/){
		/*newvariable-orderingCtrl*/		
		/*newfunction-orderingCtrl*/

	});

	_controllers.controller('orderingCardCtrl', function($scope, $state, $ionicHistory/*neworderingCardCtrl*/){
		/*newvariable-orderingCardCtrl*/		
		/*newfunction-orderingCardCtrl*/
	});

	_controllers.controller('searchCtrl', function($scope, $rootScope, $ionicHistory, $ionicScrollDelegate, $ionicFilterBar, $state, gAllBusiness, gStates, Geolocation,
									   MyLoading, MyAlert, $filter, $interval, GeoCoderSvc, Analytics, gPreorder, Ordering, gUser, gOrder, gBusiness, gCart, gAddress, $timeout/*newsearchCtrl*/){
		Analytics.set('&dp', 'Search');
		Analytics.pageView();
		$scope.searchText = '';
		$scope.businesses = [];
		$scope.show_change_address = false;
		$scope.loading = true;
		$scope.page = {
			title: ''
		};

		/*newvariable-searchCtrl*/
		localStorageApp.removeItem(STORE.CREATE_ORDER);
		if ($scope.numCart == 0 && !localStorageApp.getItem(STORE.PREORDER_BUSINESS)) gPreorder.setData({});
		$scope.filters = {
			orderby: ADDONS.web_template?"distance*1":''
		};
		if (!ADDONS.web_template) {
			rm_orderby = gOrder.getData();
			if (rm_orderby.orderby) {
				delete rm_orderby.orderby;
			}
			gOrder.setData(rm_orderby);
		}
		/*$scope.$on('$ionicView.beforeEnter', function() {
			initView();
		});*/

		function initView() {
			//$scope.MLanguages = {};
			$scope.filterBusinessType = '';
			$scope.allBusiness = [];
			$scope.filteredBusiness = [];
			$ionicScrollDelegate.scrollTop();
			$scope.getLanguage(function (err, list, dictionary) {
				$scope.loadGoogleMaps(function () {
					if (err) MyAlert(err);
					else {
						//console.log($scope.MLanguages, $rootScope.MLanguages);
						//$rootScope.MLanguages = dictionary;
						//$scope.MLanguages = $rootScope.MLanguages;
						$scope.dummyHeader = $scope.rootTheme+'/img/dummy_header.png';
						$scope.dummyLogo = $scope.rootTheme+'/img/dummy_logo.png';
						$scope.loadData();	
					}
				});
			});
		}
		$scope.busychange = false;
		$scope.changeOrdeType = function (value) {
			$scope.busychange = true;
			setTimeout(function() {
				$scope.busychange = false
			}, 1500);
			var order = gOrder.getData();
			if (order.type != value) {
				order.type = value;
				gOrder.setData(order);
				var order_type = 'delivery';
				if (gOrder.getData().type == 2) {
					order_type = 'pickup';
				} else if (gOrder.getData().type == 3) {
					order_type = 'eatin';
				} else if (gOrder.getData().type == 4) {
					order_type = 'curbside';
				} else if (gOrder.getData().type == 5) {
					order_type = 'driver_thru';
				}
				if (ADDONS.web_template) {
					if (SEARCH_BY_ADDRESS) {
						$state.go('main.search', { 'order_type': order_type, 'address': order.position.lat+','+order.position.lng }, { location: 'replace' });
					} else {
						$state.go('main.searchN', { 'order_type': order_type, 'city': order.city, 'neighborhood': order.dropdownoption });
					}
				} else {
					$scope.businesses = [];
					$scope.filteredBusiness = [];
					$scope.data_search_scroll.type = value + '';
					$scope.loadData();
				}
			}
		}
		$scope.loadData = function () {
			var order = gOrder.getData();
			var change_direction = false;
			if (!order.type || (order.type != $state.params.order_type && ADDONS.web_template)) {
				console.log('in here: '+$state.params.order_type)
				if ($state.params.order_type == 'pickup') {
					order.type = '2'
				} else if ($state.params.order_type == 'eatin') {
					order.type = '3'
				} else if ($state.params.order_type == 'curbside') {
					order.type = '4'
				} else if ($state.params.order_type == 'driver_thru') {
					order.type = '5'
				} else  {
					order.type = '1'
				}
			}
			if (NEW_FEATURES.MULTI_ADDRESS) {
				if (gAddress.hasAddress()) {
					if (!order.type) order.type = (DEFAULT_ORDER_TYPE=='delivery' || !ADDONS.pickup)?'1':'2';
					if (ADDONS.web_template) {
						var curAddress = gAddress.getData();
						if (!gAddress.hasAddress() && $state.params.address != curAddress.location.lat+','+curAddress.location.lng) {
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
					}else {
						params.limit = 50;
					}
					MyLoading.show($scope.translate('LOADING')+'...');
					$scope.helpersParams = params;
					if (NEW_FEATURES.API_BUSINESS_LISTING_V2) {
						params.v = 2;
					}
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
									return MyAlert.show($scope.translate(order.type==1?'FRONT_SORRY_DELIVERY_OPTION':'FRONT_SORRY_PICKUP_OPTION')).then(function(res) {
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
									res.result[i].delivery_time_min = parseInt(res.result[i].delivery_time.split(':')[0])*60+parseInt(res.result[i].delivery_time.split(':')[1]);
								} else res.result[i].delivery_time_min = 9999;
								if (res.result[i].pickup_time) {
									res.result[i].pickup_time_min = parseInt(res.result[i].pickup_time.split(':')[0])*60+parseInt(res.result[i].pickup_time.split(':')[1]);
								} else res.result[i].pickup_time_min = 9999;
							}
							$scope.businesses = res.result;
							gAllBusiness.setData(res.result);
							$scope.filteredBusiness = gAllBusiness.getData();
							if (NEW_FEATURES.MULTI_ADDRESS) {
								gAddress.onChange(function (address) {
									$scope.page.title = address.address;
									$state.go('main.search', { 'order_type': (gOrder.getData().type==1)?'delivery':'pickup', 'address': address.location.lat+','+address.location.lng }, { location: 'replace' });
								});
							}
							Extensions.runAction('after_search_view', gAllBusiness.getData(), $scope);
							// params.limit = null;
							// params.offset = 50;
							// Ordering.business.all(params, function (res) {
							// 	for (var i = 0; i < res.result.length; i++) {
							// 		if (res.result[i].delivery_time) {
							// 			res.result[i].delivery_time_min = parseInt(res.result[i].delivery_time.split(':')[0])*60+parseInt(res.result[i].delivery_time.split(':')[1]);
							// 		} else res.result[i].delivery_time_min = 9999;
							// 		if (res.result[i].pickup_time) {
							// 			res.result[i].pickup_time_min = parseInt(res.result[i].pickup_time.split(':')[0])*60+parseInt(res.result[i].pickup_time.split(':')[1]);
							// 		} else res.result[i].pickup_time_min = 9999;
							// 	}
							// 	$scope.businesses = $scope.businesses.concat(res.result);
							// 	gAllBusiness.setData($scope.businesses);
							// });
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
						MyLoading.show($scope.translate('LOADING')+'...');
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
										search({ type: searchType, location: order.position.lat+','+order.position.lng, params: 'name,slug,logo,header,location,description,food,alcohol,groceries,laundry,zones,delivery_price,minimum,schedule,featured,reviews,about,delivery_time,pickup_time,offers' });
									} else {
										MyAlert.show($scope.translate('SHOPPING_FOURTH_ERROR_STREET')).then(function(res) {
											$scope.onGoHome();
										});
									}
								});
							} else {
								$scope.curAddress = gAddress.getData().address;
								$rootScope.pageTitle = gAddress.getData().address;
								search({ type: searchType, location: gAddress.getData().location.lat+','+gAddress.getData().location.lng, params: 'name,slug,logo,header,location,description,food,alcohol,groceries,laundry,zones,delivery_price,minimum,schedule,featured,reviews,about,delivery_time,pickup_time,offers' });
							}
						} else if ($state.params.address == order.address || (order.position && $state.params.address == order.position.lat+','+order.position.lng)) {
							search({ type: searchType, location: order.position.lat+','+order.position.lng, params: 'name,slug,logo,header,location,description,food,alcohol,groceries,laundry,zones,delivery_price,minimum,schedule,featured,reviews,about,delivery_time,pickup_time,offers' });
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
									search({ type: searchType, location: order.position.lat+','+order.position.lng, params: 'name,slug,logo,header,location,description,food,alcohol,groceries,laundry,zones,delivery_price,minimum,schedule,featured,reviews,about,delivery_time,pickup_time,offers' });
								} else {
									MyAlert.show($scope.translate('SHOPPING_FOURTH_ERROR_STREET')).then(function(res) {
										$scope.onGoHome();
									});
								}
							});
						}
					}
				} else if ($state.params.city && $state.params.city != '' && $state.params.neighborhood && $state.params.neighborhood != '') {
					var order = gOrder.getData();
					order.type = $state.params.order_type=='delivery'?1:2,
					order.city = $state.params.city;
					order.dropdownoption = $state.params.neighborhood;
					gOrder.setData(order);
					search({ type: searchType, dropdownoption: $state.params.neighborhood, params: 'name,slug,logo,header,location,description,food,alcohol,groceries,laundry,zones,delivery_price,minimum,schedule,featured,reviews,about,delivery_time,pickup_time,offers' });
				} else {
					MyAlert.show($scope.translate('FRONT_SELECT_ADDRESS')).then(function(res) {
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
		};

		$scope.getRateState = function (rNum){
			var rateAry = [];
			for (var i = 0; i < 5; i++) {
				if (i < (5 - rNum)) {
					rateAry.push({rate:'stars-dis'});
				} else {
					rateAry.push({rate:'stars'});
				}
			}
			return rateAry;
		};

		//----------------------------------
		gStates.setState(STATE.MENU);
		//----------------------------------

		$scope.onBusiness = function(business, preorder) {
			var data = gOrder.getData();
			if (business.slug != gOrder.getData().business_slug) gCart.setData([]);
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
						$state.go('mobileDetailRest');
					}
				});
			}
		}

		var filterBarInstance;
		var filterTimeout = null;
		$scope.showFilterBar = function () {
			filterBarInstance = $ionicFilterBar.show({
				items: [],
				cancelText: $scope.translate('cancel_V2'),
				update: function (filteredItems, filterText) {
					filterText = filterText?filterText:'';
					$scope.searchText = filterText;
					if (NEW_FEATURES.BUSINESS_PAGE) {
						if (filterTimeout) $timeout.cancel(filterTimeout);
						filterTimeout = $timeout(function () {
							var where = [
								{
									attribute: 'name',
									value: {
										condition: 'ilike',
										value: encodeURI('%'+filterText+'%')
									}
								}
							];
							if ($scope.filterBusinessType) {
								where.push({
									attribute: $scope.filterBusinessType,
									value: true
								})
							}
							var order_search = gOrder.getData();
							if ($scope.searchText) {
								order_search.no_limit = true
							} else {
								order_search.no_limit = false
							}
							order_search.where = where;
							$scope.searchBusinesses(order_search, function (businesses) {
								$scope.filteredBusiness = businesses;
								where = [
									{
										attribute: 'about',
										value: {
											condition: 'ilike',
											value: encodeURI('%'+filterText+'%')
										}
									}
								];
								if ($scope.filterBusinessType) {
									where.push({
										attribute: $scope.filterBusinessType,
										value: true
									})
								}
								order_search.where = where;
								$scope.searchBusinesses(order_search, function (businesses) {
									businesses.forEach(function (element) {
										var found = $scope.filteredBusiness.find(function (element2) {
											return element.id == element2.id;
										})
										if (found === undefined) $scope.filteredBusiness.push(element);
									});
									where = [
										{
											attribute: 'description',
											value: {
												condition: 'ilike',
												value: encodeURI('%'+filterText+'%')
											}
										}
									];
									if ($scope.filterBusinessType) {
										where.push({
											attribute: $scope.filterBusinessType,
											value: true
										})
									}
									order_search.where = where;
									$scope.searchBusinesses(order_search, function (businesses) {
										businesses.forEach(function (element) {
											var found = $scope.filteredBusiness.find(function (element2) {
												return element.id == element2.id;
											})
											if (found === undefined) $scope.filteredBusiness.push(element);
										});
									})
								});
							})
							
						}, 250)
					}
				},
				done: function () {
					if (typeof cordova != 'undefined' && cordova) cordova.plugins.Keyboard.show();
				},
				cancel: function () {
					$scope.searchText = '';
					if (NEW_FEATURES.BUSINESS_PAGE) {
						$scope.searchBusinesses(gOrder.getData(), function (businesses) {
							$scope.filteredBusiness = businesses;
						})
					}
				},
				filter : $filter('filter'),
				config: {
					placeholder: $scope.translate('SEARCH')
				}
			});
		};

		$scope.showFilters = function () {
			$scope.showOrdersFilter(function (filters) {
				$scope.filters = filters;
				$scope.filteredBusiness = [];
				$scope.loadData();
			});
		}

		$scope.gotoHome = function(){
			$ionicHistory.clearCache().then(function(){$state.go(app_states.homeScreen)});
		};

		$scope.selectBusinessType = function ($event, type) {
			if ($event) $event.preventDefault();
			$scope.filterBusinessType = type;
			var filterBy = $scope.businesses;
			var filters = [];
			if (type == '') filters = $scope.businesses;
			else {
				for (var i = 0; i < filterBy.length; i++) {
					if (type == 'food' && filterBy[i].food) filters.push(filterBy[i]);
					else if (type == 'alcohol' && filterBy[i].alcohol) filters.push(filterBy[i]);
					else if (type == 'laundry' && filterBy[i].laundry) filters.push(filterBy[i]);
					else if (type == 'groceries' && filterBy[i].groceries) filters.push(filterBy[i]);
				}
			}
			$scope.filteredBusiness = filters;
			$ionicScrollDelegate.scrollTop();
		}

		$scope.showOffer = function(offers){
			var maxDiscountPercen = 0;
			var maxDiscountRate = 0;
			for(var i=0; i<offers.length; i++){
				if(offers[i].rate_type==1){ 
					if(offers[i].rate > maxDiscountPercen) maxDiscountPercen =  offers[i].rate ;
				}else if(offers[i].rate_type==2){
					if(offers[i].rate > maxDiscountRate) maxDiscountRate = offers[i].rate
				}
			}
			if(maxDiscountPercen > 0){
				return maxDiscountPercen + '%';
			}else{
				return $scope.parsePrice(maxDiscountRate);
			}
		}

		Extensions.runAction('enter_search_view', null, $scope);

		initView();

		/*newfunction-searchCtrl*/
	});

	_controllers.controller('detailRestCtrl', function($scope, $rootScope, $state, $ionicPopup, $ionicHistory, gCurDishList, gOrder, gStates, $timeout, MyAlert, MyLoading, ADDONS, gUser,
										   $ionicScrollDelegate, Analytics, $ionicFilterBar, $filter, $ionicFilterBarConfig, $ionicConfig, gBusiness, gCart, gPreorder, Ordering/*newdetailRestCtrl*/) {

		Analytics.set('&dp', 'Business');
		Analytics.pageView();
		$scope.preordering = false;
		//$scope.$on('$ionicView.beforeEnter', function() {
			// initView();
		//});
		$scope.withoutmenu = false;
		$scope.cart = gCart.getData();
		$scope.features = [];
		$scope.loading = true;
		$scope.searchResults = [];
		$scope.userAddress = NEW_FEATURES.MULTI_ADDRESS ? JSON.parse(localStorage.getItem(STORE.ADDRESS)).address : '';
		$scope.isGuestUser = !$rootScope.getLogState();
		var REVIEW_CHUNK = 20;
		/*newvariable-detailRestCtrl*/

		function initView() {

			$scope.curReview = {
				idx: 0,
				items: [],
				infinit: 0
			};
			
			$scope.order = gOrder.getData();
			$scope.orderType = $scope.order.type;
			$scope.WEB_ADDONS = WEB_ADDONS;
			$scope.business = gBusiness.getData();
			$scope.reviews = $scope.business.reviews ? $scope.business.reviews.reviews : [];
			if (!NEW_FEATURES.BUSINESS_PAGE) {
				$scope.showFeaturedCategory = false;
				for (var i = 0; i < $scope.business.categories.length; i++) {
					for (var j = 0; j < $scope.business.categories[i].products.length; j++) {
						if ($scope.business.categories[i].products[j].featured) {
							$scope.showFeaturedCategory = true;
							break;
						}
					}
				}
			} else {
				// var where = [
				// 	{
				// 		attribute: 'featured',
				// 		value: true
				// 	}
				// ];
				var params = {
					id: $scope.business.id,
					type: gOrder.getData().type?gOrder.getData().type:1,
					// where: where,
					params: 'features'
				}
				if (gPreorder.getData().timestamp) {
					params.timestamp = parseInt(gPreorder.getData().timestamp/1000);
				} else if (gPreorder.getData().menu_id) {
					params.menu_id = gPreorder.getData().menu_id;
				}
				Ordering.business.products(params, function (res) {
					if (!res.error && res.result.length > 0) {
						$scope.features = res.result;
						$scope.showFeaturedCategory = true;
					}
				});
			}

			if (gCart.getData().length > 0 && gOrder.getData().business_slug != gBusiness.getData().slug) {
				gCart.setData([]);
				$rootScope.refreshNumCart();
			}

			if (gPreorder.getData().business_slug != gBusiness.getData().slug) gPreorder.setData({});

			if ($scope.business.categories.length == 0) {
				if (!ADDONS.preorder) MyAlert.show($scope.translate('SORRY_NOT_HAVE_MENU')).then(function () {
					if (ADDONS.web_template) window.history.back();
					else $state.go(NEW_FEATURES.MULTI_ADDRESS?'sideMenu.searchBusinesses':'restaurantSearch');
				});
				$scope.withoutmenu = true;
				$scope.preordering = true;
				$scope.preorder();
			} else {
				$scope.preordering = true;
			}

			$scope.dummyHeader = $scope.rootTheme+'/img/dummy_header.png';
			$scope.dummyLogo = $scope.rootTheme+'/img/dummy_logo.png';

			if (gCart.getData().length == 0) {
				$scope.cart = [];
			} else {
				$scope.cart = gCart.getData();
			}
		}

		$scope.initView = initView;

		$scope.$on('$ionicView.beforeEnter', function() {
			initView();
		});

		$scope.addAddress = function() {
			$scope.openFullAddress(null, function (addr) {
				if (ADDONS.web_template) MyLoading.toast($scope.translate('LOADING')+'...');
				else MyLoading.show($scope.translate('LOADING')+'...');
				Ordering.users.addresses.add({
					user_id: gUser.getData().id,
					name: addr.name,
					lastname: addr.lastname,
					cellphone: addr.cellphone,
					address: addr.address,
					internal_number: addr.internal_number,
					address_notes: addr.address_notes,
					location: JSON.stringify(addr.location),
					zipcode: addr.zipcode,
					map_data: JSON.stringify(addr.map_data),
					tag: addr.tag
				}, function (res) {
					MyLoading.hide();
					if (!res.error) {
						$scope.addresses.push(res.result);
						if (res.result.default) {
							gAddress.setData(addr);
						}
						$scope.addresses.forEach(function (address) {
							address.default = address.id == res.result.id; 
						});
						if (ADDONS.web_template) MyLoading.success($scope.translate('ADDRESS_SAVED'), 2000);
					} else MyAlert.show(res.result);
				});
			});
		}

		$scope.selectAddress = function () {
			if ($scope.isGuestUser) {
				// guest user logic
				return;
			} else {
				$rootScope.onGoAddress();
			}
		}

		$scope.onFilterReview = function(idx) {
			$scope.curReview.idx = idx;
			$scope.curReview.infinit = 0;
			var original = $scope.business.reviews.reviews.sort(function(a,b){
				return b.id - a.id; 
			});
			if (idx == 0) { // date filter
				$scope.curReview.items = original.sort(function(a,b){
					return b.id - a.id; 
				});
			} else {	// point filter
				$scope.curReview.items = original.filter(function(a){
					return (idx == 4) ? a.total >= idx && a.total <= idx + 1 : a.total >= idx && a.total < idx + 1; 
				});
			}
			$scope.canLoaded = $scope.curReview.items.length > REVIEW_CHUNK ? true : false;
			$scope.reviews = $scope.curReview.items.slice(0, $scope.curReview.items.length > REVIEW_CHUNK ? REVIEW_CHUNK - 1 : $scope.curReview.items.length);
		}

		$scope.reviewInfinite = function() {
			setTimeout(function(){
				$scope.curReview.infinit++;
				$scope.reviews = $scope.curReview.items.slice(
					$scope.curReview.infinit * REVIEW_CHUNK,
					$scope.curReview.infinit * REVIEW_CHUNK + REVIEW_CHUNK
				);
				$scope.$broadcast("scroll.infiniteScrollComplete");
				$ionicScrollDelegate.scrollTop();
				if ($scope.reviews.length == 0 || $scope.reviews.length < REVIEW_CHUNK) {
					$scope.canLoaded =  false;
				}
			},1000);
		}

		$scope.changeOrderType = function (type) {
			var order = gOrder.getData();
			if (order.type != type) {
				order.type = type;
				$scope.getBusinessByOrder($scope.business, order, function (business) {
					if (business.valid_service) {
						if (!NEW_FEATURES.BUSINESS_PAGE) {
							$scope.checkProductCart(business, $scope.cart, function (change, products) {
								if (change) {
									if (products) {
										var new_cart = [];
										for (var i = 0; i < $scope.cart.length; i++) {
											var product_cart = $scope.cart[i];
											if (products.indexOf(product_cart.id) == -1) {
												new_cart.push(product_cart);
											}
										}
										$scope.cart = new_cart;
										gCart.setData($scope.cart);
									}
									gBusiness.getData();
									$scope.order.type = type;
									var myorderselect = document.getElementById('myorderselect');
									if (myorderselect) {
										myorderselect.value = type;
									}
									gOrder.setData(order);
									gBusiness.setData(business);
									$scope.initView();
								}else {
									var myorderselect = document.getElementById('myorderselect');
									if (myorderselect){
										myorderselect.value = $scope.order.type;
										myorderselect.options[type-1].classList.add("diselected")
										myorderselect.options[$scope.order.type-1].classList.remove("diselected")
										myorderselect.options[$scope.order.type-1].Selected = true;
									}
								}
							});
						} else {
							if ($scope.cart.length > 0) {
								var products = $scope.cart.map(function (product) {
									return product.id;
								});
								MyLoading.show($scope.translate('LOADING')+'...');
								Ordering.business.validate_cart({
									id: $scope.business.id,
									type: type,
									products: JSON.stringify(products),
								}, function (res) {
									MyLoading.hide();
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
												$scope.cart = new_cart;
												gCart.setData($scope.cart);
											}

											if (res.result.invalid_products.length > 0) {
												var product_str = '';
												res.result.invalid_products.forEach(function (product) {
													if (product_str != '') product_str += ', ';
													product_str += product.name
												});
												MyAlert.confirm($rootScope.translate('IF_CHANGE_ORDER_TYPE_PRODUCTS_REMOVED').replace('_products_', product_str), $scope.translate('OK'), $scope.translate('CANCEL')).then(function () {
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
													$scope.cart = new_cart;
													gCart.setData($scope.cart);
													$scope.order.type = type;
													var myorderselect = document.getElementById('myorderselect');
													if (myorderselect) {
														myorderselect.value = type;
													}
													gOrder.setData(order);
													$scope.business = business;
													gBusiness.setData(business);
													$scope.initView();
													// }
												}).catch(function(){
													var myorderselect = document.getElementById('myorderselect');
													if (myorderselect){
														myorderselect.value = $scope.order.type;
														myorderselect.options[type-1].classList.add("diselected")
														myorderselect.options[$scope.order.type-1].classList.remove("diselected")
														myorderselect.options[$scope.order.type-1].Selected = true;
													}
												});
											}

											if (res.result.invalid_products.length == 0) {
												$scope.order.type = type;
												gOrder.setData(order);
												$scope.business = business;
												gBusiness.setData($scope.business);
												$scope.initView();
											}
										} else {
											$scope.order.type = type;
											gOrder.setData(order);
											$scope.business = business;
											gBusiness.setData($scope.business);
											$scope.initView();
										}
									} else MyAlert.show(res.result);
								});
							} else {
								$scope.order.type = type;
								gOrder.setData(order);
								$scope.business = business;
								gBusiness.setData($scope.business);
								$scope.initView();
							}
						}
					} else {
						if (type == 1) MyAlert.show($scope.translate('FRONT_SORRY_DELIVERY_OPTION'));
						else MyAlert.show($scope.translate('MOBILE_VERY_FAR_FOR_PICKUP'));
					}
				});
			}
		}

		//$scope.ADDONS = ADDONS;
		$scope.menu = {
			menu : $rootScope.translate('MENU_V21'),
			info : $rootScope.translate('INFO_V21'),
			review : $rootScope.translate('REVIEWSOF_V21'),
			offer : $rootScope.translate('OFFERS_V21')
		};

		$scope.type = $scope.menu.menu;

		if (ADDONS.web_template) $scope.type = $scope.menu.info;

		$scope.setType = function (event) {
			$scope.type = angular.element(event.target).text();
		};

		$scope.goCheckout = function(){
			if (gOrder.getData().length == 0){
				MyAlert.show($scope.translate('MOBILE_CARD_EMPTY'));
			} else {
				$state.go('ordering.checkOut');
			}
		}

		$scope.showCategories = function () {
			$('.backdrop-categories').fadeIn(150);
			$('.float-categories').slideDown(300);
			$('.backdrop-categories').click(function () {
				$('.backdrop-categories').fadeOut(150)
				$('.float-categories').slideUp(300);
			});
		}

		$scope.scrollToCategory = function (category) {
			$('.backdrop-categories').fadeOut(150)
			$('.float-categories').slideUp(300);
			var position = ionic.DomUtil.getPositionInParent($("#category"+category)[0]);
			$ionicScrollDelegate.scrollTo(0, position.top, true);
		}

		$scope.preorder = function () {
			$scope.openPreorder($scope.business, function () {
				Object.assign($scope.business, gBusiness.getData());
				$scope.cart = gCart.getData();
			});
		}

		$scope.goDetailMenu = function(item, filterby) {
			var details = {
				id: item,
				products: [],
				filterby: ''
			};
			if (item == 'featured') {
				details.title = $rootScope.translate('BLIST_FEATURED');
				if (!NEW_FEATURES.BUSINESS_PAGE) {
					for (var i = 0; i < $scope.business.categories.length; i++) {
						for (var j = 0; j < $scope.business.categories[i].products.length; j++) {
							if ($scope.business.categories[i].products[j].featured) {
								details.products.push($scope.business.categories[i].products[j]);
							}
						}
					}
				} else {
					details.products = $scope.features;
				}
			} else if (item == 'filter') {
				details.title = $rootScope.translate('RESULTS');
				if (!NEW_FEATURES.BUSINESS_PAGE) {
					for (var i = 0; i < $scope.business.categories.length; i++) {
						for (var j = 0; j < $scope.business.categories[i].products.length; j++) {
							details.products.push($scope.business.categories[i].products[j]);
						}
					}
				}
				details.filterby = filterby;
			} else {
				details.id = item.id;
				details.title = item.name;
				details.products = item.products;
			}
			gCurDishList.setData(details);
			gStates.setState(STATE.ORDERING);
			$state.go('ordering.detailMenu');
		};

		$scope.backToRestaurant = function () {
			if (ADDONS.single_business || CLOSEST_BUSINESS) {
				return $state.go(app_states.homeScreen);
			}
			if (ADDONS.single_business) {
				return $state.go(app_states.homeScreen);
			}
			if (gCart.getData().length == 0){
				$state.go(NEW_FEATURES.MULTI_ADDRESS?'sideMenu.searchBusinesses':'restaurantSearch');
			} else {
				var promptPopup = $ionicPopup.confirm({
					title: (!ADDONS.web_template)?$scope.translate('MOBILE_APPNAME'):$scope.translate('WEB_APPNAME'),
					template: "<p"+(($scope.arabic_rtl)?' class="arabic_rtl"':' style="text-align:center;"')+">"+$scope.translate('MOBILE_QUESTION_CANCEL_ORDER')+"</p>",
					cancelType: 'button-stable',
					cancelText: $scope.translate('MOBILE_CHECKOUT_CANCEL'),
					okText: $scope.translate('MOBILE_FOURTH_PAGE_OK').toUpperCase()
				});
				promptPopup.then(function(res) {
					if (res) {
						gCart.setData([]);
						gBusiness.setData({});
						$rootScope.refreshNumCart();
						if (!ADDONS.web_template) {
							$ionicHistory.clearHistory();
							$ionicHistory.clearCache();
						}
						$state.go(NEW_FEATURES.MULTI_ADDRESS?'sideMenu.searchBusinesses':'restaurantSearch');
					}
				});
			}
		};

		$rootScope.restTapNum = {
			id : (ADDONS.web_template) ? 1:0
		};
		$rootScope.onClickCategory = function (num) {
			$rootScope.restTapNum.id = num;
			if (num == 2) 
				$scope.onFilterReview(0);
		};
		var flag = false;
		var buffnum = -1;
		$scope.collapsItem = function (num) {
			if (buffnum == num){
				$scope.subCollapsNum = -1;
				buffnum = -1;
			} else {
				$scope.subCollapsNum = num;
				if (num == 1) {
					$timeout(function () {
						var loc = $scope.business.location;
						var map = new google.maps.Map(document.getElementById('business-info-map'), {
							center: { lat: loc.lat, lng: loc.lng },
							zoom: loc.zoom || 15
						});
						var marker = new google.maps.Marker({
							position: { lat: loc.lat, lng: loc.lng },
							map: map,
							title: $scope.business.name
						});
					}, 200);
				}
				buffnum = num;
			}
		}

		$scope.searchText = '';
		var filterBarInstance;

		$scope.showFilterBar = function () {
			filterBarInstance = $ionicFilterBar.show({
				items: $scope.filteredBusiness,
				cancelText: $scope.translate('SEARCH'),
				delay: 0,
				okText: $scope.translate('SEARCH'),
				update: function (filteredItems, filterText) {
					if (filterText || filterText == '') $scope.searchText = filterText;
					if ($scope.searchText && $scope.searchText != '') {
						if ($scope.searchText.length == 1) { $scope.goDetailMenu('filter', $scope.searchText); }
						$rootScope.$broadcast('fileter-value-changed', {text: filterText});
					}
				},
				done: function () {
					if (typeof cordova != 'undefined' && cordova != null) cordova.plugins.Keyboard.show();
				},
				cancel: function () {
					if ($scope.searchText && $scope.searchText != '') {
						$scope.goDetailMenu('filter', $scope.searchText);
					}
					$rootScope.$broadcast('fileter-value-changed', {text: ''});
				},
				filter : $filter('filter'),
				config: {
					theme: $ionicFilterBarConfig.theme(),
					transition: $ionicFilterBarConfig.transition(),
					back: $ionicConfig.backButton.icon(),
					clear: $ionicFilterBarConfig.clear(),
					favorite: $ionicFilterBarConfig.favorite(),
					search: $ionicFilterBarConfig.search(),
					backdrop: $ionicFilterBarConfig.backdrop(),
					placeholder: $scope.translate('SEARCH'),
					close: $ionicFilterBarConfig.close(),
					done: $ionicFilterBarConfig.done(),
					reorder: $ionicFilterBarConfig.reorder(),
					remove: $ionicFilterBarConfig.remove(),
					add: $ionicFilterBarConfig.add()
				},
				cancelOnStateChange: false
			});
		};
		Extensions.runAction('enter_business_view', null, $scope);
		/*newfunction-detailRestCtrl*/

	});

	_controllers.controller('detailMenuCtrl', function($scope, $rootScope, $state, MyLoading, MyAlert, gPreorder, gOrder, gCurDishList, Analytics, $ionicFilterBar, $ionicFilterBarConfig, $ionicConfig, $ionicScrollDelegate, $filter, gBusiness, gCart, Ordering, gConfirm, $timeout, $ionicHistory/*newdetailMenuCtrl*/){
		Analytics.set('&dp', 'Menu Details');
		Analytics.pageView();
		$scope.cart = gCart.getData();
		$scope.curDish = null;
		$scope.cartInventory = {};
		$scope.curOrderDish = {};
		$scope.modeEditDish = false;
		$scope.searchText = '';
		$scope.loading = false;

		/*newvariable-detailMenuCtrl*/

		$scope.$on('fileter-value-changed', function(event, args){
			$scope.category.filterby = args.text;
			$scope.searchProducts($scope.category.filterby);
		});

		$scope.init = function () {
			$scope.PRODUCTS_AS_LIST = PRODUCTS_AS_LIST;
			if (gBusiness.getData().lazy_load_products_recommended) {
				$scope.category = gCurDishList.getData();
				if ($scope.category.id == undefined) {
					$scope.category = JSON.parse(localStorage.getItem(STORE.BUFFER_DISHES));
					gCurDishList.setData($scope.category);
				}
				if ($scope.category.id == 'featured') {
					$scope.category.stop = true;
				} else {
					var _request = $scope.category.id=='filter'?Ordering.business.products:Ordering.products.all;
					var params = {
						type: gOrder.getData().type?gOrder.getData().type:1,
						limit: PAGINATIONS.business_products.first,
						business_id: gBusiness.getData().id,
						category_id: $scope.category.id,
						orderBy: 'name'
					};
					if (gPreorder.getData().timestamp) {
						params.timestamp = parseInt(gPreorder.getData().timestamp/1000);
					} else if (gPreorder.getData().menu_id) {
						params.menu_id = gPreorder.getData().menu_id;
					}
					if ($scope.category.id == 'filter') {
						var where = [
							{
								attribute: 'name',
								value: {
									condition: 'ilike',
									value: encodeURI('%'+$scope.category.filterby+'%')
								}
							}
						];
						
						params.where = where;
						params.id = gBusiness.getData().id;
					}
					var DoRequest = true;
					if (JSON.stringify($scope.category) == '{}') {
						var DoRequest = false;
					}
					if (DoRequest) {
						MyLoading.show($scope.translate('LOADING')+'...');
						_request(params, function (res) {
							MyLoading.hide();
							if (!res.error) {
								$scope.category.products = res.result;
								$scope.category.stop = PAGINATIONS.business_products.first > res.result.length;
								$scope.category.search_stop = false;
	
								var b = gBusiness.getData();
								for (var i = 0; i < b.categories.length; i++) {
									if (typeof b.categories[i].id == 'string') continue;
									if (b.categories[i].id == $scope.category.id) {
										b.categories[i].products = $scope.category.products;
										break;
									}
								}
								gBusiness.setData(b);
								localStorage.setItem(STORE.BUFFER_DISHES,JSON.stringify($scope.category));
							}
						});
					}
				}
			} else {
				$scope.category = gCurDishList.getData();
				$scope.category.filterby = $scope.category.filterby || '';
				if ($scope.category.filterby != '') {
					$scope.searchText = $scope.category.filterby;
				}
				$scope.business = gBusiness.getData();
				$scope.resSubMenulist = [];
				$scope.cart = gCart.getData();
			}
		}
		$scope.calcSubtotal = function (cart) {
			var subtotal = 0;
			for (var i = 0; i < cart.length; i++) {
				subtotal += (cart[i].total);
			}
			return subtotal;
		}

		$scope.onProductOption = function (product, edit) {
			var order_product = {
				id: product.id,
				name: product.name,
				images: product.images,
				quantity: 1,
				code: $scope.generateRandom(6),
				options: [],
				extended_options: [],
				//comments: "",
				price: product.price,
				total: product.price,
				ingredients: [],
				balance: product.inventoried ? product.quantity : 0
			};
			order_product.ingredients = JSON.parse(JSON.stringify(product.ingredients));
			if (edit) {
				for (var i = 0; i < $scope.business.categories.length; i++) {
					if (typeof $scope.business.categories[i].id == 'string') continue;
					for (var j = 0; j < $scope.business.categories[i].products.length; j++) {
						if ($scope.business.categories[i].products[j].id == product.id) {
							order_product = JSON.parse(JSON.stringify(product));
							product = $scope.business.categories[i].products[j];
							break;
						}
					}
				}
			} else {
				for (var i = 0; i < order_product.ingredients.length; i++) {
					order_product.ingredients[i].selected = true;
				}
			}
			var inventory = {};
			for (var i = 0; i < $scope.cart.length; i++) {
				if (inventory[$scope.cart[i].id]) inventory[$scope.cart[i].id] -= $scope.cart[i].quantity;
				else inventory[$scope.cart[i].id] = $scope.cart[i].balance;
			}
			if (NEW_FEATURES.QUICK_PRODUCT && product.extras.length == 0 && product.ingredients.length == 0 && !edit) {
				if(!product.inventoried || product.quantity != 0)
				{
					$rootScope.doGroupInCart(order_product, product);
					$scope.cart = gCart.getData();
				}
			} else {
				$scope.openProduct(product, order_product, inventory, edit, function (res) {
					var sw = false;
					for (var i = 0; i < $scope.cart.length; i++) {
						if ($scope.cart[i].code == res.code) {
							$scope.cart[i] = res;
							sw = true;
						}
					}
					if (!sw) $rootScope.doGroupInCart(res, product);
					$scope.cart = gCart.getData();
				});
			}
		}

		$scope.$on('$ionicView.beforeEnter', function(){
			$scope.init();
		});
		
		var filterBarInstance;
		var filterTimeout = null;
		$scope.showFilterBar = function () {
			filterBarInstance = $ionicFilterBar.show({
				items: $scope.category.products,
				cancelText: $scope.translate('cancel_V2'),
				delay: 0,
				update: function (filteredItems, filterText) {
					// if (!NEW_FEATURES.BUSINESS_PAGE) {
						// if (filterText || filterText == '') $scope.searchText = filterText;
						// $scope.category.filterby = $scope.searchText;
					// } else {
						$scope.searchResults = filteredItems;
						$scope.category.search_stop = false;
						if (!filterText) {
							$scope.category.filterby = '';
							$ionicScrollDelegate.scrollTop();
							return;
						}
						if (filterText.length < 3 && $scope.category.id != 'filter') {
							$ionicScrollDelegate.scrollTop();
							return;
						};
						
						$scope.searchProducts(filterText);
					// }
				},
				done: function () {
					if (typeof cordova != 'undefined' && cordova != null) {
						cordova.plugins.Keyboard.show();
					}
				},
				cancel: function () {
					$scope.searchText = '';
				},
				filter : $filter('filter'),
				config: {
					theme: $ionicFilterBarConfig.theme(),
					transition: $ionicFilterBarConfig.transition(),
					back: $ionicConfig.backButton.icon(),
					clear: $ionicFilterBarConfig.clear(),
					favorite: $ionicFilterBarConfig.favorite(),
					search: $ionicFilterBarConfig.search(),
					backdrop: false,
					placeholder: $scope.translate('SEARCH'),
					close: $ionicFilterBarConfig.close(),
					done: $ionicFilterBarConfig.done(),
					reorder: $ionicFilterBarConfig.reorder(),
					remove: $ionicFilterBarConfig.remove(),
					add: $ionicFilterBarConfig.add()
				},
				cancelOnStateChange: true
			});
		};

		$scope.searchProducts = function(filter) {
			$scope.category.filterby = filter;
			if (filterTimeout) $timeout.cancel(filterTimeout);
			// if ($scope.category.id != 'filter') return;
			if (!NEW_FEATURES.BUSINESS_PAGE) { return; }
			filterTimeout = $timeout(function () {
				var where = [
					{
						attribute: 'name',
						value: {
							condition: 'ilike',
							value: encodeURI('%'+filter+'%')
						}
					}
				];
				var where_desc = [
					{
						attribute: 'description',
						value: {
							condition: 'ilike',
							value: encodeURI('%'+filter+'%')
						}
					}
				];
				var _request = $scope.category.id=='filter'?Ordering.business.products:Ordering.products.all;
				var params = {
					business_id: gBusiness.getData().id,
					type: gOrder.getData().type?gOrder.getData().type:1,
					limit: PAGINATIONS.business_products.first,
					where: where
				};
				if ($scope.category.id == 'filter') {
					params.id = gBusiness.getData().id;
				} else {
					params.category_id = $scope.category.id;
				}
				if (gPreorder.getData().timestamp) {
					params.timestamp = parseInt(gPreorder.getData().timestamp/1000);
				} else if (gPreorder.getData().menu_id) {
					params.menu_id = gPreorder.getData().menu_id;
				}
				$scope.loadings = true;
				MyLoading.show($scope.translate('LOADING')+'...');
				_request(params, function (res) {
					// $scope.loadings = false;
					MyLoading.hide();
					$ionicScrollDelegate.scrollTop();
					if (!res.error) {
						$scope.searchResults = res.result;
						$scope.category.products = res.result;
						$scope.category.search_stop = PAGINATIONS.business_products.first > res.result.length;
						params.where = where_desc;
						_request(params, function (res_desc) {
							MyLoading.hide();
							if (!res.error) {
								for (var i = 0; i < res_desc.result.length; i++) {
									var found = false;
									for (var k = 0; k < $scope.category.products.length; k++) {
										if ( $scope.category.products[k].id ==  res_desc.result[i].id) {
											found = true;
											break
										}
									}
									if (!found) {
										$scope.category.products.push(res_desc.result[i]);
									}
								}
							}
						})
					}
				});
			}, 250);
		}

		$scope.goCheckout = function(){
			if (gOrder.getData().length == 0) {
				MyAlert.show($scope.translate('MOBILE_CARD_EMPTY'));
			} else {
				$state.go('ordering.checkOut');
			}
		}

		$scope.getCartCountByProduct = function(product) {
			var ret = {
				quantity: 0,
				status: false
			};
			for (var i = 0; i < $scope.cart.length; i++) {
				if ($scope.cart[i].id == product.id) {
					ret.quantity += $scope.cart[i].quantity;
				}
			}
			if (ret.quantity > 0) ret.status = true;
			return ret
		}

		$scope.goBack = function() {
			if (ADDONS.single_business)
				$state.go('sideMenu.restDetail'); // $ionicHistory.goBack();
			else
				$state.go('mobileDetailRest');
		};

		Extensions.runAction('enter_category_view', null, $scope);
		
		/*newfunction-detailMenuCtrl*/

	})

	_controllers.controller('pOptionCtrl', function ($scope, $state, $ionicScrollDelegate/*newpOptionCtrl*/) {
		/*newvariable-pOptionCtrl*/	
		$scope.$on('MyModalView.enter', function() {
			// Code you want executed every time view is opened
			$ionicScrollDelegate.scrollTop();
			// console.log('Opened!')
		});
		$scope.modalInit = function () {
			$ionicScrollDelegate.$getByHandle('modalContent').scrollTop(true);
		}
		
		/*newfunction-pOptionCtrl*/
	})

	_controllers.controller('editOptionCtrl', function ($scope, $rootScope, $state/*neweditOptionCtrl*/) {

		/*newvariable-editOptionCtrl*/
		$scope.$on('$ionicView.enter', function() {
			// Code you want executed every time view is opened

		});		
		/*newfunction-editOptionCtrl*/

	})

	_controllers.controller('businessCtrl', function($scope, $rootScope, $location, $timeout, $state, $filter, MyAlert, MyLoading, ADDONS, MyModal, gNearService, $ionicScrollDelegate,
										   Analytics, gPreorder, gCreateOrderBuyer, Ordering, gUser, gCart, gBusiness, gOrder, gStates, gAddress/*newbusinessCtrl*/){
		if(ADDONS.single_business && ADDONS.web_template){
			if($state.params.business != BUSINESS_ID){
				window.location.replace(window.location.origin);
			}
		}
		if (ADDONS.use_segment) {
			var segment = $scope.getNgDependency('segment')
		}
		$scope.curReview = {
			idx: 0,
			items: [],
			infinit: 0
		};
		var REVIEW_CHUNK = 20;

		var getCreateOrderUserData = true;
		$scope.done = false;
		$scope.hasBackAfterCloseProduct = (!document.referrer&&$location.search().category) ? false : true;
		$scope.$on('$locationChangeStart', function(event, current, old) {
			if (!$scope.done) {
				if ($location.search().category) {
					$scope.filterCategory = $location.search().category;
					if ($location.search().product) {
						if ($scope.business) {
							for (var i = 0; i < $scope.business.categories.length; i++) {
								for (var j = 0; j < $scope.business.categories[i].products.length; j++) {
									if ($scope.business.categories[i].products[j].id == $location.search().product) {
										$scope.onProductOption($scope.business.categories[i].products[j]);
										break;
									}
								}
							}
						}
					}
				} else $scope.filterCategory = '';
			} else $scope.done = false;
		});

		$scope.create_order = localStorage.getItem(STORE.CREATE_ORDER) != null && $state.current.name == 'main.business-createorder';
		$scope.$on('$ionicView.beforeEnter', function() {
			$scope.initView();
		});
		$scope.preorder = {};
		$scope.ADDONS = ADDONS;
		$scope.showMore = true;
		$scope.filterProduct = '';
		$scope.preordering = false;
		$scope.dummyLogo = $scope.rootTheme+'/img/dummy_logo.png';
		$scope.dummyHeader = $scope.rootTheme+'/img/dummy_header.png';
		$scope.order = gOrder.getData();
		if (!$scope.order.type) {
			$scope.order.type = $scope.getDetaultOrderTypeId();
			gOrder.setData($scope.order);
		}

		$scope.myOrder = {
			type: gNearService.getData().orderType || 'delivery',
			curAddress: ''
		}

		$scope.categories = {};
		$scope.loadings = {
			products: false,
			search: false
		};
		$scope.stops = {};
		$scope.searchResults = [];

		/*newvariable-businessCtrl*/

		$scope.newCreateOrder = function () {
			if ($scope.numCart > 0) {
				MyAlert.confirm($rootScope.translate('QUESTION_CREATE_NEW_ORDER'), $scope.translate('YES_EMPTY_CART'), $scope.translate('NO')).then(function (res) {
					gCart.setData([])
					$rootScope.allDishCount = 0;
					$rootScope.refreshNumCart();
					gCreateOrderBuyer.setData({});
					$scope.removePreorder();
					location.reload();
				});
			} else {
				$scope.removePreorder();
				gCreateOrderBuyer.setData({});
				location.reload();
			}
		}

		$scope.removePreorder = function () {
			if ($scope.numCart > 0) {
				MyAlert.confirm($rootScope.translate('QUESTION_CHANGE_PREORDER_TIME_WITH_CART'), $scope.translate('YES_EMPTY_CART'), $scope.translate('NO')).then(function (res) {
					gCart.setData([]);
					gPreorder.setData({});
					location.reload();
				});
			} else {
				gPreorder.setData({});
				location.reload();
			}
		}

		$scope.checkMore = function () {
			if (!$scope.business && !$scope.curNumTab) return false;
			var categories = $filter('orderBy')($scope.business.categories, 'rank*1');
			for (var i = 0; i < categories.length; i++) {
				if (categories[i].id == $scope.filterCategory) {
					return categories[i].rank > categories[$scope.curNumTab-1].rank;
				}
			}
			return false;
		}

		$scope.initView = function () {
			$scope.WEB_ADDONS = WEB_ADDONS;
			$scope.loadGoogleMaps(function () {
				$scope.getLanguage(function (err, list, dictionary) {
					if (err) MyAlert(err);
					else {
						$scope.menu = {
							menu : $rootScope.translate('MENU_V21'),
							info : $rootScope.translate('INFO_V21'),
							review : $rootScope.translate('REVIEWSOF_V21'),
							offer : $rootScope.translate('OFFERS_V21')
						};
						$scope.type = $scope.menu.info;

						var data_search = {
							id_or_slug: $state.params.business,
						};
						if (gPreorder.getData().timestamp) data_search.timestamp = gPreorder.getData().timestamp;
						else if (gPreorder.getData().menu_id) data_search.menu_id = gPreorder.getData().menu_id;
						// if (NEW_FEATURES.BUSINESS_PAGE) data_search.params = 'name,email,slug,schedule,description,about,logo,header,phone,cellphone,owner_id,city_id,address,address_notes,zipcode,location,featured,timezone,food,alcohol,groceries,laundry,groceries,use_printer,printer_id,minimum,delivery_price,always_deliver,tax_type,tax,delivery_time,pickup_time,service_fee,fixed_usage_fee,percentage_usage_fee,enabled,checkoutfields,reviews,categories,menus,city,webhooks,currency,zones,gallery,paymethods,offers';
						if (NEW_FEATURES.MULTI_ADDRESS && gUser.isLogged() && gAddress.getData() != 'null' && !$scope.create_order) {
							var order = gOrder.getData();
							order.business_slug = $state.params.business;
							order.type = order.type?order.type:'1';
							gOrder.setData(order);
							if (gAddress.getData()) {
								data_search.location = gAddress.getData().location.lat+','+gAddress.getData().location.lng;
							}
							data_search.type = order.type;
						} else if (SEARCH_BY_ADDRESS && gOrder.getData().address && gOrder.getData().address != '') {
							if ((gOrder.getData().business_slug == $state.params.business || ADDONS.single_business) && gOrder.getData().position) data_search.location = gOrder.getData().position.lat+','+gOrder.getData().position.lng;
							if (gOrder.getData().type) data_search.type = gOrder.getData().type;
						} else if (!SEARCH_BY_ADDRESS && gOrder.getData().dropdownoption && gOrder.getData().dropdownoption != '') {
							data_search.dropdownoption = gOrder.getData().dropdownoption;
							if (gOrder.getData().type) data_search.type = gOrder.getData().type;
						}
						if (gOrder.getData().type) {
							data_search.type = gOrder.getData().type;
						}
						if (gPreorder.getData().type) {
							data_search.type = gPreorder.getData().type;
						}
						Ordering.business.get(data_search, function (res) {
							if (!res.error) {
								if (ADDONS.single_business) {
									$state.params.business = res.result.slug;
									var order = gOrder.getData();
									order.business_slug = $state.params.business;
									gOrder.setData(order);
								}
								if (gPreorder.getData().business_slug != $state.params.business) gPreorder.setData({});
								if (gBusiness.getData() == null || (gBusiness.getData().slug != $state.params.business)) gCart.setData([]);
								var owner_match = false;
								if (res.result == null) owner_match = false;
								else {
									if (res.result.owners.length > 1) {
										res.result.owners.forEach(function(o){
											if (o.id == gUser.getData().id) {
												owner_match = true;
											}
										});
									} else {
										owner_match = res.result.owner_id == gUser.getData().id ? true : false;
									}
								}
								if (res.result == null || ($scope.create_order && !owner_match && gUser.getData().level == 2)) return $state.go('main.notfound');
								NEW_FEATURES.BUSINESS_PAGE = res.result.lazy_load_products_recommended;
								$scope.business = res.result;
								$scope.curNumTab = res.result.categories.length;
								$scope.reviews = $scope.business.reviews ? $scope.business.reviews.reviews : [];
								if (!$scope.WEB_ADDONS.all_categories) {
									for (var i = 0; i < res.result.categories.length; i++) {
										if (res.result.categories[i].rank == 1) $scope.filterCategory = res.result.categories[i].id;
									}
								} else $scope.filterCategory = '';
								for (var i = 0; i < res.result.categories.length; i++) {
									for (var j = 0; j < res.result.categories[i].products.length; j++) {
										if (res.result.categories[i].products[j].featured) {
											$scope.showFeaturedCategory = true;
											if (!$scope.WEB_ADDONS.all_categories && ADDONS.featured_products) $scope.filterCategory = 'featured';
											break;
										}
									}
								}
								if (gPreorder.getData().menu_id) {
									$scope.preordering = true;
									$scope.preorder = gPreorder.getData();
									var date = new Date($scope.preorder.date);
									date.setHours($scope.preorder.time.split(':')[0]);
									date.setMinutes($scope.preorder.time.split(':')[1]);
									var day = (date.getDay() == 0)?7:date.getDay();
									$scope.preorder.strtime = $scope.translate('DAY'+day)+', '+$scope.translate('MONTH'+(date.getMonth()+1))+' '+date.getDate()+', '+date.getFullYear()+' - '+(date.getHours()<10?'0':'')+date.getHours()+':'+(date.getMinutes()<10?'0':'')+date.getMinutes();
								}
								$rootScope.pageTitle = $scope.business.name;
								if (NEW_FEATURES.MULTI_ADDRESS) {
									if (gCart.getData().length > 0 && !$scope.business.valid_service) {
										gCart.setData([]);
									}
								}
								try{
									gBusiness.setData($scope.business);
								} catch (err) {
									console.log(err)
								}
								$scope.cart = gCart.getData();
								$scope.refreshCartData();
								if ($location.search().category) {
									$scope.filterCategory = $location.search().category;
									if ($location.search().product) {
										if (!NEW_FEATURES.BUSINESS_PAGE) {
											for (var i = 0; i < res.result.categories.length; i++) {
												for (var j = 0; j < res.result.categories[i].products.length; j++) {
													if (res.result.categories[i].products[j].id == $location.search().product) {
														$scope.onProductOption(res.result.categories[i].products[j]);
														break;
													}
												}
											}
										} else {
											Ordering.products.get({
												id: $location.search().product,
												category_id: $location.search().category,
												business_id: $scope.business.id
											}, function (res) {
												if (!res.error) {
													$scope.onProductOption(res.result);
												}
											});
										}
									}
								}
								if (NEW_FEATURES.BUSINESS_PAGE) {
									var key = 'category_'+($scope.filterCategory==''?'all':$scope.filterCategory);
									$scope.loadings.products = true;
									var _request = key=='category_all'?Ordering.business.products:Ordering.products.all;
									var params = {
										type: gOrder.getData().type?gOrder.getData().type:1,
										limit: PAGINATIONS.business_products.first
									};
									if (gPreorder.getData().timestamp) {
										params.timestamp = parseInt(gPreorder.getData().timestamp/1000);
									} else if (gPreorder.getData().menu_id) {
										params.menu_id = gPreorder.getData().menu_id;
									}
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
										if (!res.error) {
											if (!$scope.categories[key]) {
												$scope.categories[key] = [];
											}
											$scope.categories[key] = $scope.categories[key].concat(res.result);
										}
									});
									// var where = [
									// 	{
									// 		attribute: 'featured',
									// 		value: true
									// 	}
									// ];
									params = {
										id: $scope.business.id,
										type: gOrder.getData().type?gOrder.getData().type:1,
										// where: where,
										params: 'features'
									};
									if (gPreorder.getData().timestamp) {
										params.timestamp = parseInt(gPreorder.getData().timestamp/1000);
									} else if (gPreorder.getData().menu_id) {
										params.menu_id = gPreorder.getData().menu_id;
									}
									Ordering.business.products(params, function (res) {
										if (!res.error && res.result.length > 0) {
											$scope.categories['category_featured'] = res.result;
											$scope.showFeaturedCategory = true;
											if (!$scope.WEB_ADDONS.all_categories && ADDONS.featured_products) $scope.filterCategory = 'featured';
										}
									});
								}
								if (NEW_FEATURES.MULTI_ADDRESS) {
									gAddress.onChange(function (address) {
										MyLoading.show($scope.translate('LOADING')+'...');
										var params = {
											id_or_slug: gBusiness.getData().slug,
											type: gOrder.getData().type,
											location: address.location.lat+','+address.location.lng
										}
										if (gPreorder.getData().menu_id) params.menu_id = gPreorder.getData().menu_id;
										Ordering.business.get(params, function (res) {
											MyLoading.hide();
											if (!res.error) {
												$scope.business = res.result;
												gBusiness.setData($scope.business);
												$scope.refreshCartData();
												var order = gOrder.getData();
												order.address = address.address;
												order.position = address.location;
												gOrder.setData(order);
											}
										});
									});
								}
								Analytics.set('&dp', gBusiness.getData().slug);
								Analytics.pageView();
								window.scrollTo(0, 0);
								if ($scope.create_order && $scope.cart.length == 0) {
									$scope.openAddress(function (business) {
										gBusiness.setData(business);
										$scope.order = gOrder.getData();
										$scope.business = business;
										getCreateOrderUserData = false;
									});
								} else {
									getCreateOrderUserData = false;
								}
								Extensions.runAction('after_business_view', gBusiness.getData(), $scope);
							} else {
								$state.go('main.notfound');
								return;
							}
						});
					}
				});
			});
		}

		// Web mode
		$scope.selectCategory = function ($event, category, more, noscroll) {
			if ($event) $event.preventDefault();
			if (!noscroll) {
				$(window).scroll();
				$('body').animate({scrollTop: 0}, 350);
				$('html').animate({scrollTop: 0}, 350);
			}
			window.parent.postMessage({ event: 'url', data: window.location.href+'/'+category }, '*');
			$scope.filterCategory = category;
			$scope.isMore = (more==null)?false:more;
			$scope.done = true;
			if (category == '' || category == 'featured') {
				$location.search('category', null).replace();
			} else {
				$location.search('category', category).replace();
			}
			if (NEW_FEATURES.BUSINESS_PAGE && $scope.business.categories.length > 0) {
				$scope.filterProduct = '';
				$scope.searchResults = [];
				var key = 'category_'+($scope.filterCategory==''?'all':$scope.filterCategory);
				if (!$scope.categories[key]) {
					$scope.loadings.products = true;
					var _request = key=='category_all'?Ordering.business.products:Ordering.products.all;
					var params = {
						type: gOrder.getData().type?gOrder.getData().type:1,
						limit: PAGINATIONS.business_products.first
					};
					if (gPreorder.getData().timestamp) {
						params.timestamp = parseInt(gPreorder.getData().timestamp/1000);
					} else if (gPreorder.getData().menu_id) params.menu_id = gPreorder.getData().menu_id;
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
						if (!res.error) {
							if (!$scope.categories[key]) {
								$scope.categories[key] = [];
							}
							$scope.categories[key] = $scope.categories[key].concat(res.result);
						}
					});
				}
			}
			Extensions.runAction('after_business_open_category', category, $scope);
		}

		$scope.agrupateProductsByCategories = function (products) {
			if (!products) return [];
			var categories = [];
			products.forEach(function (product) {
				var category = categories.find(function (category) {
					return category.id == product.category_id;
				});
				if (!category) {
					category = product.category;
					category.products = [];
					categories.push(category);
				}
				category.products.push(product);
			});
			return categories;
		}

		var filterTimeout = null;
		$scope.changeFilterProduct = function (filterProduct) {
			if (!NEW_FEATURES.BUSINESS_PAGE) {
				$scope.filterProduct = filterProduct;
				if (filterProduct && filterProduct != '') $scope.selectCategory(null, 'filter', null, true);
				else $scope.selectCategory(null, '', null, true);
			} else {
				$scope.searchResults = [];
				if (filterProduct.length < 3) {
					return;
				};
				$scope.filterProduct = filterProduct;
				if (filterTimeout) $timeout.cancel(filterTimeout);
				filterTimeout = $timeout(function () {
					var where = [
						{
							attribute: 'name',
							value: {
								condition: 'ilike',
								value: encodeURI('%'+filterProduct+'%')
							}
						}
					];
					var where_desc = [
						{
							attribute: 'description',
							value: {
								condition: 'ilike',
								value: encodeURI('%'+filterProduct+'%')
							}
						}
					];
					$scope.loadings.search = true;
					var params = {
						id: $scope.business.id,
						type: gOrder.getData().type?gOrder.getData().type:1,
						where: where
					}
					if (gPreorder.getData().type) {
						params.type = gPreorder.getData().type;
					}
					if (gPreorder.getData().menu_id) {
						params.menu_id = gPreorder.getData().menu_id;
					}
					Ordering.business.products( params, function (res) {
						$scope.loadings.search = false;
						if (!res.error) {
							$scope.searchResults = res.result;
							params.where = where_desc;
							Ordering.business.products(params, function (res_desc) {
								if (!res.error) {
									for (var i = 0; i < res_desc.result.length; i++) {
										var found = false;
										for (var k = 0; k <  $scope.searchResults.length; k++) {
											if ( $scope.searchResults[k].id ==  res_desc.result[i].id) {
												found = true;
												break
											}
										}
										if (!found) {
											$scope.searchResults.push(res_desc.result[i]);
										}
									}
								}
							})
						}
					});
				}, 250);
			}
		}

		$scope.goToCart = function () {
			var pos = $('.business').outerHeight();
			if ($(window).width() < 768) {
				setTimeout(function(){
					MyModal.showTemplate('templates/'+ADDONS.template+'/views/order-cart-popup.html', {
						scope: $scope,
						animation: 'slide-in-up'
					}).then(function(modal) {
						modals.push(modal);
						$scope.modal_cart = modal;
						$scope.modal_cart.show();
	
						$scope.closeCart = function () {
							if ($scope.modal_cart) {
								$scope.modal_cart.hide();
								$scope.modal_cart.remove();
								history.back();
							}
						}
					});

				},100);
				
				$location.search({'cart': true});

			} else {
				if (NEW_FEATURES.FLEX_HEIGHT) {
					$('html,body').animate({scrollTop: pos}, 300);
				} else {
					$('body').animate({scrollTop: pos}, 300);
					$('html').animate({scrollTop: pos}, 300);
				}
			}
		}

		$scope.moreInfo = function (review) {
			if ($scope.modal_info) $scope.modal_info.remove();
			$scope.onFilterReview(0);
			MyModal.showTemplate('templates/'+ADDONS.template+'/views/business-more-info-popup.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function(modal) {
				modals.push(modal);
				$scope.modal_info = modal;
				$scope.modal_info.show();
				
				if(review == undefined){
					$scope.restTapNum = {
						id: 1
					};
				}else{
					$scope.restTapNum = {
						id: 2
					};
				}
				$scope.subCollapsNum = -1;
				$scope.onClickCategory = function (num) {
					$scope.subCollapsNum = -1;
					$scope.restTapNum.id = num;
				};
				var flag = false;
				var buffnum = -1;
				$scope.collapsItem = function (num) {
					if (buffnum == num){
						$scope.subCollapsNum = -1;
						buffnum = -1;
					} else {
						$scope.subCollapsNum = num;
						if (num == 1) {
							$timeout(function () {
								var loc = $scope.business.location;
								var map = new google.maps.Map(document.getElementById('business-info-map'), {
									center: { lat: loc.lat, lng: loc.lng },
									zoom: loc.zoom || 15
								});
								var marker = new google.maps.Marker({
									position: { lat: loc.lat, lng: loc.lng },
									map: map,
									title: $scope.business.name
								});
								var infowindow = new google.maps.InfoWindow({
									content: "<b>"+$scope.business.name+"</b>",
									disableAutoPan: true
								});
								infowindow.open(map, marker);
							},200);
						}
						buffnum = num;
					}
				}
				$scope.closeInfo = function () {
					if ($scope.modal_info) {
						$scope.modal_info.hide();
						$scope.modal_info.remove();
					}
				} 
			});
		};

		$scope.onFilterReview = function(idx) {
			$scope.curReview.idx = idx;
			$scope.curReview.infinit = 0;
			var original = $scope.business.reviews.reviews.sort(function(a,b){
				return b.id - a.id; 
			});
			if (idx == 0) { // date filter
				$scope.curReview.items = original.sort(function(a,b){
					return b.id - a.id; 
				});
			} else {	// point filter
				$scope.curReview.items = original.filter(function(a){
					return (idx == 4) ? a.total >= idx && a.total <= idx + 1 : a.total >= idx && a.total < idx + 1;  
				});
			}
			$scope.canLoaded = $scope.curReview.items.length > REVIEW_CHUNK ? true : false;
			$scope.reviews = $scope.curReview.items.slice(0, $scope.curReview.items.length > REVIEW_CHUNK ? REVIEW_CHUNK - 1 : $scope.curReview.items.length);
		}

		$scope.reviewInfinite = function() {
			setTimeout(function(){
				$scope.curReview.infinit++;
				$scope.reviews = $scope.curReview.items.slice(
					$scope.curReview.infinit * REVIEW_CHUNK,
					$scope.curReview.infinit * REVIEW_CHUNK + REVIEW_CHUNK
				);
				$scope.$broadcast("scroll.infiniteScrollComplete");
				$ionicScrollDelegate.scrollTop();
				if ($scope.reviews.length == 0 || $scope.reviews.length < REVIEW_CHUNK) {
					$scope.canLoaded =  false;
				}
			},1000);
		}
		$scope.orderType = $scope.order.type;
		$scope.changeOrderType = function (type) {
			var order = gOrder.getData();
			if ($scope.order.type != type) {
				order.type = type;
				$scope.getBusinessByOrder($scope.business, order, function (business) {
					if (business && (business.valid_service || (!order.position && !order.dropdownoption))) {
						if (!NEW_FEATURES.BUSINESS_PAGE) {
							$scope.checkProductCart(business, $scope.cart, function (change, products) {
								if (change) {
									if (products) {
										var new_cart = [];
										for (var i = 0; i < $scope.cart.length; i++) {
											var product_cart = $scope.cart[i];
											if (products.indexOf(product_cart.id) == -1) {
												new_cart.push(product_cart);
											}
										}
										$scope.cart = new_cart;
										gCart.setData($scope.cart);
									}
									$scope.order.type = type;
									var myorderselect = document.getElementById('myorderselect');
									if (myorderselect) {
										myorderselect.value = type;
									}
									gOrder.setData(order);
									if (gPreorder.getData().type) {
										var preorder = gPreorder.getData();
										preorder.type = type;
										gPreorder.setData(preorder);
									}
									$scope.business = business;
									$scope.showFeaturedCategory = false;
									business.categories.forEach(function (category) {
										category.products.forEach(function(product){
											if (product.featured)  $scope.showFeaturedCategory = true;
										})
									})
									gBusiness.setData($scope.business);
									$scope.refreshCartData();
								} else {
									var myorderselect = document.getElementById('myorderselect');
									if (myorderselect){
										myorderselect.value = $scope.order.type;
										myorderselect.options[type-1].classList.add("diselected")
										myorderselect.options[$scope.order.type-1].classList.remove("diselected")
										myorderselect.options[$scope.order.type-1].Selected = true;
									}
								}
							});
						} else {
							if ($scope.cart.length > 0) {
								var products = $scope.cart.map(function (product) {
									return product.id;
								});
								MyLoading.show($scope.translate('LOADING')+'...');
								Ordering.business.validate_cart({
									id: $scope.business.id,
									type: type,
									products: JSON.stringify(products),
								}, function (res) {
									MyLoading.hide();
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
												$scope.cart = new_cart;
												gCart.setData($scope.cart);
											}

											if (res.result.invalid_products.length > 0) {
												var product_str = '';
												res.result.invalid_products.forEach(function (product) {
													if (product_str != '') product_str += ', ';
													product_str += product.name
												});
												MyAlert.confirm($rootScope.translate('IF_CHANGE_ORDER_TYPE_PRODUCTS_REMOVED').replace('_products_', product_str), $scope.translate('OK'), $scope.translate('CANCEL')).then(function () {
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
													$scope.cart = new_cart;
													gCart.setData($scope.cart);
													$scope.order.type = type;
													var myorderselect = document.getElementById('myorderselect');
													if (myorderselect) {
														myorderselect.value = type;
													}
													if (gPreorder.getData().type) {
														var preorder = gPreorder.getData();
														preorder.type = type;
														gPreorder.setData(preorder);
													}
													gOrder.setData(order);
													$scope.business = business;
													gBusiness.setData($scope.business);
													$scope.refreshCartData();
													afterCheckCart();
												}).catch(function(){
													var myorderselect = document.getElementById('myorderselect');
													if (myorderselect){
														myorderselect.value = $scope.order.type;
														myorderselect.options[type-1].classList.add("diselected")
														myorderselect.options[$scope.order.type-1].classList.remove("diselected")
														myorderselect.options[$scope.order.type-1].Selected = true;
													}
												});
											}

											if (res.result.invalid_products.length == 0) {
												$scope.order.type = type;
												var myorderselect = document.getElementById('myorderselect');
												if (myorderselect) {
													myorderselect.value = type;
												}
												gOrder.setData(order);
												if (gPreorder.getData().type) {
													var preorder = gPreorder.getData();
													preorder.type = type;
													gPreorder.setData(preorder);
												}
												$scope.business = business;
												gBusiness.setData($scope.business);
												$scope.refreshCartData();
												afterCheckCart();
											}
										} else {
											$scope.order.type = type;
											gOrder.setData(order);
											if (gPreorder.getData().type) {
												var preorder = gPreorder.getData();
												preorder.type = type;
												gPreorder.setData(preorder);
											}
											$scope.business = business;
											gBusiness.setData($scope.business);
											$scope.refreshCartData();
											afterCheckCart();
										}
									} else MyAlert.show(res.result);
								});
							} else {
								$scope.order.type = order.type;
								gOrder.setData(order);
								$scope.business = business;
								$scope.categories = $scope.business.categories;
								afterCheckCart()
							}
							function afterCheckCart() {
								$scope.categories = {};
								var exist = false;
								for (var i = 0; i < business.categories.length; i++) {
									var category = business.categories[i];
									if (category.id == $scope.filterCategory) {
										exist = true;
										break;
									}
								}
								if (exist) {
									var key = 'category_'+($scope.filterCategory==''?'all':$scope.filterCategory);
									$scope.loadings.products = true;
									var _request = key=='category_all'?Ordering.business.products:Ordering.products.all;
									var params = {
										type: gOrder.getData().type?gOrder.getData().type:1,
										limit: PAGINATIONS.business_products.first
									};
									if (gPreorder.getData().timestamp) {
										params.timestamp = parseInt(gPreorder.getData().timestamp/1000);
									} else if (gPreorder.getData().menu_id) params.menu_id = gPreorder.getData().menu_id;
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
										if (!res.error) {
											if (!$scope.categories[key]) {
												$scope.categories[key] = [];
											}
											$scope.categories[key] = $scope.categories[key].concat(res.result);
										}
									});
									var where = [
										{
											attribute: 'featured',
											value: true
										}
									];
									Ordering.business.products({
										id: $scope.business.id,
										type: gOrder.getData().type?gOrder.getData().type:1,
										where: where
									}, function (res) {
										if (!res.error && res.result.length > 0) {
											$scope.categories['category_featured'] = res.result;
											$scope.showFeaturedCategory = true;
											if (!$scope.WEB_ADDONS.all_categories && ADDONS.featured_products) $scope.filterCategory = 'featured';
										} else $scope.showFeaturedCategory = false;
									});
								} else {
									$scope.selectCategory(null, '');
								}
							}
						}
					} else {
						if (type == 1) MyAlert.show($scope.translate('FRONT_SORRY_DELIVERY_OPTION'));
						else MyAlert.show($scope.translate('MOBILE_VERY_FAR_FOR_PICKUP'));
					}
				});
			}
		}

		$rootScope.changeBusiness = function (business, order_type) {
			$scope.item = gCurRestaurant.getData();
			$scope.myOrder.type = order_type;
			$scope.item.deliveryFee = business.deliveryCost;
			$scope.item.restData.minium = business.minimum;
			gCurRestaurant.setData($scope.item);
			$rootScope.resetCart();
		}
		$scope.onProductOption = function (product, edit, noNavigation, callback) {
			if (ADDONS.use_segment) {
				segment.track('Product Clicked', {
					name: product.name,
					id: product.id
				})
				if (product.featured) {
					segment.track(' Promotion Clicked', {
						name: product.name,
						id: product.id
					})
				}
			}

			var order_product = {
				id: product.id,
				name: product.name,
				images: product.images,
				extended_options: [],
				quantity: 1,
				code: $scope.generateRandom(6),
				options: [],
				extended_options: [],
				//comments: "",
				price: product.price,
				total: product.price,
				ingredients: [],
				balance: product.inventoried ? product.quantity : 0
			};
			if (product.category_id) order_product.category_id = product.category_id;
			order_product.ingredients = JSON.parse(JSON.stringify(product.ingredients));
			if (edit) {
				if (!NEW_FEATURES.BUSINESS_PAGE) {
					for (var i = 0; i < $scope.business.categories.length; i++) {
						if (typeof $scope.business.categories[i].id == 'string') continue;
						for (var j = 0; j < $scope.business.categories[i].products.length; j++) {
							if ($scope.business.categories[i].products[j].id == product.id) {
								order_product = clone(product);
								product = $scope.business.categories[i].products[j];
								break;
							}
						}
					}
				} else {
					var _product = null;
					for (var key in $scope.categories) {
						var category = $scope.categories[key];
						for (var i = 0; i < category.length; i++) {
							if (category[i].id == product.id) {
								_product = category[i];
								break;
							}
						}
					}
					if (!_product) {
						MyLoading.show($scope.translate('LOADING')+'...');
						Ordering.products.get({
							id: product.id,
							category_id: order_product.category_id,
							business_id: $scope.business.id
						}, function (res) {
							MyLoading.hide();
							if (!res.error) {
								openProductCallback(res.result, product, edit);
							}
						});
					} else {
						openProductCallback(_product, product, edit);
					}
				}
			} else {
				for (var i = 0; i < order_product.ingredients.length; i++) {
					order_product.ingredients[i].selected = true;
				}
			}

			if (!NEW_FEATURES.BUSINESS_PAGE || !edit) {
				if (!callback){
					if (NEW_FEATURES.QUICK_PRODUCT && product.extras.length == 0 && product.ingredients.length == 0 && !edit) {
						if(!product.inventoried || product.quantity != 0){
							$scope.detectAddress(order_product, product);
						}
					} else {
						openProductCallback(product, order_product, edit);
					}
				} else {
					openProductCallback(product, order_product, edit);
				}
			}

			function openProductCallback(product, order_product, edit) {
				var inventory = {};
				for (var i = 0; i < $scope.cart.length; i++) {
					if (inventory[$scope.cart[i].id]) inventory[$scope.cart[i].id] -= $scope.cart[i].quantity;
					else inventory[$scope.cart[i].id] = $scope.cart[i].balance;
				}
				$scope.openProduct(product, order_product, inventory, edit, function (res) {
					$scope.detectAddress(res, product);
					if (!edit && !noNavigation) {
						if ($scope.hasBackAfterCloseProduct) history.back();
						else $location.search({'category': null, 'product': null});
					}
					Extensions.runAction('after_business_close_product', product, $scope);
				}, function () {
					if (!edit && !noNavigation) {
						if ($scope.hasBackAfterCloseProduct) history.back();
						else $location.search({'category': null, 'product': null});
					}
					Extensions.runAction('after_business_close_product', product, $scope);
				});
			}
			$scope.done = true;
			if (!edit && !noNavigation) {
				if (NEW_FEATURES.QUICK_PRODUCT && product.extras.length == 0 && product.ingredients.length == 0) {
					$location.search({'category': null, 'product': null});
				} else {
					var search = Object.assign($location.search(), {'category': product.category_id, 'product': product.id})
					$location.search(search);
				}
			}
		}

		$scope.detectAddress = function (product_to_cart, product, callback) {
			var sw = false;
			for (var i = 0; i < $scope.cart.length; i++) {
				if ($scope.cart[i].code == product_to_cart.code) {
					$scope.cart[i] = product_to_cart;
					sw = true;
				}
			}
			if (!sw) {
				if (($scope.create_order && $scope.cart.length == 0 && getCreateOrderUserData) || gOrder.getData().business_slug != $state.params.business || !$scope.business.valid_service) {
					if (NEW_FEATURES.MULTI_ADDRESS && gUser.isLogged() && !getCreateOrderUserData) {
						$timeout(function () {
							MyLoading.show($scope.translate('LOADING')+'...');
							Ordering.users.addresses.all({
								user_id: gUser.getData().id
							}, function (res) {
								MyLoading.hide();
								if (!res.error) {
									if (res.result.length == 0) {
										$scope.openFullAddress(null, function (addr, modal) {
											MyLoading.show($scope.translate('LOADING')+'...');
											var business_data = {
												id_or_slug: gBusiness.getData().id,
												type: gOrder.getData().type?gOrder.getData().type:1,
												location: addr.location.lat+','+addr.location.lng,
											};
											if (gPreorder.getData().menu_id) {
												business_data.menu_id = gPreorder.getData().menu_id;
											}
											Ordering.business.get(business_data, function (res) {
												MyLoading.hide();
												if (!res.error) {
													if (res.result.valid_service) {
														var business = res.result;
														addr.user_id = gUser.getData().id;
														addr.location = JSON.stringify(addr.location);
														addr.map_data = JSON.stringify(addr.map_data);
														Ordering.users.addresses.add(addr, function (res) {
															if (!res.error) {
																gAddress.setData(res.result);
																var order = gOrder.getData();
																order.business_slug = business.slug;
																order.position = res.result.location;
																order.address = res.result.address;
																gOrder.setData(order);
																$rootScope.doGroupInCart(product_to_cart, product);
																$scope.cart = gCart.getData();
																$scope.refreshCartData();
																if (callback) callback(true);
																modal.scope.hide();
															} else {
																MyAlert.show(res.result);
															}
														});
													} else {
														if (gOrder.getData().type == 2) MyAlert.show($scope.translate('BUSINESS_FAR_PICKUP_ADDRESS'));
														else MyAlert.show($scope.translate('BUSINESS_NOT_DELIVERY_ADDRESS'));
													}
												} else {
													MyAlert.show(res.result);
												}
											});
										});
									} else {
										$scope.openAddresses(function (address) {
											var order = gOrder.getData();
											order.position = address.location;
											order.address = address.address;
											gOrder.setData(order);
											$rootScope.doGroupInCart(product_to_cart, product);
											$scope.cart = gCart.getData();
											$scope.refreshCartData();
											if (callback) callback(true);
										});
									}
								} else {
									MyAlert.show(res.result);
								}
							});
						}, 100);
					} else if (NEW_FEATURES.MULTI_ADDRESS && !gUser.isLogged()) {
						$timeout(function () {
							$scope.openFullAddress(null, function (addr, modal) {
								var business = gBusiness.getData();
								var order = gOrder.getData();
								if (!order.type) order.type = 1;
								MyLoading.show($scope.translate('LOADING')+'...');
								Ordering.business.get({
									id_or_slug: business.id,
									type: order.type,
									location: addr.location.lat+','+addr.location.lng
								}, function (res) {
									MyLoading.hide();
									if (!res.error) {
										if (res.result.valid_service) {
											gAddress.setData(addr);
											order.business_slug = res.result.slug;
											order.position = addr.location;
											order.address = addr.address;
											gOrder.setData(order);
											$rootScope.doGroupInCart(product_to_cart, product);
											$scope.cart = gCart.getData();
											$scope.refreshCartData();
											if (callback) callback(true);
											modal.scope.hide();
										} else {
											if (order.type == 1) MyAlert.show($scope.translate('BUSINESS_NOT_DELIVERY_ADDRESS'));
											else MyAlert.show($scope.translate('BUSINESS_FAR_PICKUP_ADDRESS'));
										}
									} else {
										MyAlert.show(res.result);
									}
								});
							}, true);
						}, 100);
					} else {
						$timeout(function () {
							$scope.openAddress(function (business) {
								getCreateOrderUserData = false;
								if (!business.lazy_load_products_recommended) {
									var valid = false;
									for (var i = 0; i < business.categories.length; i++) {
										for (var j = 0; j < business.categories[i].products.length; j++) {
											if (business.categories[i].products[j].id == product_to_cart.id) {
												valid = true;
												break;
											}
										}
									}
									if (valid) {
										$scope.order = gOrder.getData();
										$scope.business = business;
										$rootScope.doGroupInCart(product_to_cart, product);
										$scope.cart = gCart.getData();
										gBusiness.setData($scope.business);
										$scope.refreshCartData();
										if (callback) callback(true);
									} else {
										if (gOrder.getData().type == 1) MyAlert.show($scope.translate('PRODUCT_NOT_AVAILABLE_DELIVERY'));
										else MyAlert.show($scope.translate('PRODUCT_NOT_AVAILABLE_PICKUP'));
									}
								} else {
									var _product = product_to_cart;
									var products = [product.id];
									MyLoading.show($scope.translate('LOADING')+'...');
									Ordering.business.validate_cart({
										id: business.id,
										type: gOrder.getData().type,
										products: JSON.stringify(products),
									}, function (res) {
										MyLoading.hide();
										if (!res.error) {
											if (res.result.valid) {
												NEW_FEATURES.BUSINESS_PAGE = business.lazy_load_products_recommended;
												$scope.order = gOrder.getData();
												$scope.business = business;
												$rootScope.doGroupInCart(_product, product);
												$scope.cart = gCart.getData();
												gBusiness.setData($scope.business);
												$scope.refreshCartData();
												afterCheckCart();
												if (callback) callback(true);
											} else {
												if (gOrder.getData().type == 1) MyAlert.show($scope.translate('PRODUCT_NOT_AVAILABLE_DELIVERY'));
												else MyAlert.show($scope.translate('PRODUCT_NOT_AVAILABLE_PICKUP'));
											}
										} else MyAlert.show(res.result);
									});
									function afterCheckCart() {
										$scope.categories = {};
										var exist = false;
										for (var i = 0; i < business.categories.length; i++) {
											var category = business.categories[i];
											if (category.id == $scope.filterCategory) {
												exist = true;
												break;
											}
										}
										if (exist) {
											var key = 'category_'+($scope.filterCategory==''?'all':$scope.filterCategory);
											$scope.loadings.products = true;
											var _request = key=='category_all'?Ordering.business.products:Ordering.products.all;
											var params = {
												type: gOrder.getData().type?gOrder.getData().type:1,
												limit: PAGINATIONS.business_products.first
											};
											if (gPreorder.getData().timestamp) {
												params.timestamp = gPreorder.getData().timestamp
											} else if (gPreorder.getData().menu_id) params.menu_id = gPreorder.getData().menu_id;
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
												if (!res.error) {
													if (!$scope.categories[key]) {
														$scope.categories[key] = [];
													}
													$scope.categories[key] = $scope.categories[key].concat(res.result);
												}
											});
											var where = [
												{
													attribute: 'featured',
													value: true
												}
											];
											Ordering.business.products({
												id: $scope.business.id,
												type: gOrder.getData().type?gOrder.getData().type:1,
												where: where
											}, function (res) {
												if (!res.error && res.result.length > 0) {
													$scope.categories['category_featured'] = res.result;
													$scope.showFeaturedCategory = true;
													if (!$scope.WEB_ADDONS.all_categories && ADDONS.featured_products) $scope.filterCategory = 'featured';
												}
											});
										} else {
											$scope.selectCategory(null, '');
										}
									}
								}
							});
						}, 100);
					}
				} else {
					//localStorageApp.removeItem(STORE.FROM_SEARCH);
					$rootScope.doGroupInCart(product_to_cart, product);
					$scope.cart = gCart.getData();
					$scope.refreshCartData();
					if (callback) callback(true);
				}
			} else {
				gCart.setData($scope.cart);
				$scope.refreshCartData();
			}
		}

		$scope.removeProduct = function (product) {
			var products = [];
			for (var i = 0; i < $scope.cart.length; i++) {
				if ($scope.cart[i].code != product.code) {
					products.push($scope.cart[i]);
				}
			}
			$scope.cart = products;
			gCart.setData($scope.cart);
			$scope.refreshCartData();
		}

		$scope.refreshCartData = function () {
			$scope.cart_data = {};
			var subtotal = 0;
			var quantity = 0;
			for (var i = 0; i < $scope.cart.length; i++) {
				subtotal += $scope.cart[i].total;
				quantity += $scope.cart[i].quantity;
			}

			var fix_order_summary = $rootScope.constants.fix_order_summary || $scope.business.tax_type === 2;

			$scope.cart_data.quantity = quantity;

			var tax = subtotal * ($scope.business.tax / 100);
			if ($scope.business.tax_type === 1) {
				tax = (subtotal * $scope.business.tax) / (100 + $scope.business.tax);
				subtotal -= tax;
			}
			var delivery_price = $scope.order.type == 1 ? $scope.business.delivery_price : 0;
			var discount = 0;
			var subtotal_to_calculate = subtotal * 1;
			if ($scope.business.tax_type === 1) {
				subtotal_to_calculate += tax;
			}
			if (ADDONS.discount_offer) {
				var offer = null;
				for (var i = 0; i < $scope.business.offers.length; i++) {
					if ($scope.business.offers[i].type == 1 && $scope.business.offers[i].minimum <= subtotal_to_calculate) {
						var aux = $scope.business.offers[i].rate_type == 1 ? subtotal_to_calculate * $scope.business.offers[i].rate / 100 : $scope.business.offers[i].rate;
						var last = 0;
						if (offer != null) last = offer.rate_type == 1 ? subtotal_to_calculate * offer.rate / 100 : offer.rate;
						if (aux < subtotal_to_calculate && last < aux) {
							offer = $scope.business.offers[i];
						}
					}
				}
				if (offer) {
					discount = offer.rate_type == 1 ? subtotal_to_calculate * offer.rate / 100 : offer.rate;
					$scope.cart_data.offer = offer;
				} else discount = 0;
			} else {
				discount = 0;
			}

			var subtotal_with_discount = subtotal - discount;

			var service_fee = (subtotal + tax - discount) * ($scope.business.service_fee / 100);
			if ($scope.business.tax_type === 2) {
				tax = (subtotal - discount) * $scope.business.tax / 100;
				service_fee = subtotal_with_discount * $scope.business.service_fee / 100;
			}

			subtotal_with_discount = $rootScope.Order.roundPrice(subtotal_with_discount);
			tax = $rootScope.Order.roundPrice(tax);
			discount = $rootScope.Order.roundPrice(discount);
			service_fee = $rootScope.Order.roundPrice(service_fee);
			tax = $rootScope.Order.roundPrice(tax);
			subtotal = subtotal_with_discount + discount;
			subtotal = $rootScope.Order.roundPrice(subtotal);
			var total = subtotal_with_discount + tax + service_fee + delivery_price;
			total = $rootScope.Order.roundPrice(total);

			$scope.cart_data.subtotal_with_discount = subtotal_with_discount;
			$scope.cart_data.tax = tax;
			$scope.cart_data.subtotal = subtotal + (!fix_order_summary ? tax : 0);
			$scope.cart_data.discount = discount;
			$scope.cart_data.service_fee = service_fee;
			$scope.cart_data.total = total;

			$scope.refreshNumCart();

			gCart.setData($scope.cart);
			$scope.setCartBalances();
		}

		$scope.goCheckout = function () {
			function getUpselling(cb) {
				var upselling = [];
				var products_id = [];
				var cart_products = $scope.cart.map(function (product) {
					return product.id;
				});
				if (!$scope.business.lazy_load_products_recommended) {
					$scope.business.categories.forEach(function (category) {
						if (typeof category.id == 'string') return;
						category.products.forEach(function (product) {
							if (product.upselling && cart_products.indexOf(product.id) == -1 && products_id.indexOf(product.id) == -1 && (!product.inventoried || (product.inventoried && product.quantity > 0)) ) {
								products_id.push(product.id);
								upselling.push(product);
							}
						});
					});
					delete products_id, cart_products;
					return cb(upselling);
				} else {
					Ordering.business.products({
						id: $scope.business.id,
						type: $scope.order.type,
						params: 'upsellings'
						// where: [{
						// 	attribute: 'upselling',
						// 	value: true
						// }]
					}, function (res) {
						if (!res.error) {
							for (var i = 0; i < res.result.length; i++) {
								if(cart_products.indexOf(res.result[i].id) == -1 && products_id.indexOf(res.result[i].id) && (!res.result[i].inventoried || (res.result[i].inventoried && res.result[i].quantity > 0)) ){
									products_id.push(res.result[i].id);
									upselling.push(res.result[i]);
								}
							}
							return cb(upselling)
						}
					})
				}
			}
			getUpselling(function(upselling) {
				if (upselling.length == 0 || !NEW_ADDONS.UPSELLING) {
					gStates.setState(STATE.ORDERING);
					if (gUser.getData().id == -1) {
						$state.go('main.signUp');
					} else {
						$state.go(app_states.finalCheckOut);
					}
				} else {
					MyModal.showTemplate('templates/'+ADDONS.template+'/views/upselling-products.html', {
						scope: $scope,
						animation: 'slide-in-up'
					}).then(function(upselling_products) {
						modals.push(upselling_products);
						upselling_products.scope.upselling_products = upselling;
						upselling_products.scope.some_product_added = false;
						upselling_products.scope.add = function (product) {
							if(ADDONS.use_segment){
								segment.track('Product Clicked', {
									id: product.id,
									name: product.name
								});
							}
							if (!product.extras || product.extras.length == 0) {
								var _product = {
									code: $scope.generateRandom(6),
									id: product.id,
									images: product.images,
									ingredients: [],
									name: product.name,
									options: [],
									extended_options: [],
									quantity: 1,
									total: product.price,
									price: product.price,
									category_id: product.category_id,
									inventoried: product.inventoried,
									balance: product.inventoried ? product.quantity : 0
								};
								$rootScope.doGroupInCart(_product, product);
								$scope.cart = gCart.getData();
								$scope.refreshCartData();
								getUpselling(function(upselling){
									upselling_products.scope.upselling_products = upselling;
									if (upselling_products.scope.upselling_products.length == 0) upselling_products.scope.thanks();
								});
								if (upselling_products.scope.upselling_products.length == 0) {
									upselling_products.scope.thanks();
								} else {
									upselling_products.scope.some_product_added = true;
								}
							} else {
								$scope.onProductOption(product);
							}
						}
						upselling_products.scope.thanks = function () {
							// upselling_products.scope.hide();
							gStates.setState(STATE.ORDERING);
							if (gUser.getData().id == -1) {
								$state.go('main.signUp');
							} else {
								$state.go(app_states.finalCheckOut);
							}
						}
						upselling_products.show();
					});
				}
			});
		}

		$scope.setCartBalances = function() {
			$scope.amounts = {};
			$scope.cart = gCart.getData();
			
			var cart = gCart.getData();
			var categories = gBusiness.getData().categories;
			cart.map(function(cart_product) {
				for (var i = 0; i < categories.length; i++) {
					var category = categories[i];
					for (var j = 0; j < category.products.length; j++) {
						var product = category.products[j];
						if (product.id == cart_product.id) {
							if (product && product.inventoried) {
								cart_product.balance = (product.quantity > MAX_PRODUCT_AMOUNT ? MAX_PRODUCT_AMOUNT : product.quantity) - $rootScope.getSoltProductQuantity(cart_product);
							} else {
								cart_product.balance = 0;
							}
							break;
						}
					}
				}
			});

			gCart.setData(cart);
			$scope.cart = cart;

			for (var j = 0; j < $scope.cart.length; j++) {
				$scope.amounts[$scope.cart[j].code] = [{value: 0, name: $scope.translate('REMOVE')}];
				if ($scope.cart[j].balance > MAX_PRODUCT_AMOUNT) $scope.cart[j].balance = MAX_PRODUCT_AMOUNT;
				var len = $scope.cart[j].balance == 0 ? MAX_PRODUCT_AMOUNT : $scope.cart[j].balance;
				for (var i = 1; i <= len; i++) {
					$scope.amounts[$scope.cart[j].code].push({value: i, name: i});
				}
			}
		}

		$scope.onChangeQuantity = function (product) {
			product.quantity = parseInt(product.quantity);
			if (product.quantity > 0) {
				if (!ADDONS.quantity_options) {
					var subtotal = product.price;
					for (var i = 0; i < product.options.length; i++) {
						var option = product.options[i];
						for (var k = 0; k < option.suboptions.length; k++) {
							var suboption = option.suboptions[k];
							subtotal += suboption.price;
						}
					}
					product.total = product.quantity*subtotal;
				} else {
					var subtotal = product.price;
					for (var i = 0; i < product.extended_options.length; i++) {
						var option = product.extended_options[i];
						for (var k = 0; k < option.suboptions.length; k++) {
							var suboption = option.suboptions[k];
							var suboption_price = suboption.price;
							if (option.with_half_option && suboption.position != 'whole') {
								suboption_price = suboption.half_price;
							}
							if (option.allow_suboption_quantity) {
								suboption_price *= suboption.quantity;
							}
							subtotal += suboption_price;
						}
					}
					product.total = product.quantity*subtotal;
				}
				$scope.refreshCartData();
			} else {
				$scope.removeProduct(product);
			}
		}

		$scope.getCartCountByProduct = function(product) {
			var ret = {
				quantity: 0,
				status: false
			};
			for (var i = 0; i < $scope.cart.length; i++) {
				if ($scope.cart[i].id == product.id) {
					ret.quantity += $scope.cart[i].quantity;
				}
			}
			if (ret.quantity > 0) ret.status = true;
			return ret
		}

		Extensions.runAction('enter_business_view', null, $scope);

		$scope.initView();

		/*newfunction-businessCtrl*/
	});

	_controllers.controller('checkOutCtrl',function($scope, $rootScope, $state, $ionicPopup, $ionicHistory, MyModal, MyLoading, gOrder, gUser, gStates, ADDONS, Analytics, gBusiness, gCart, Ordering/*newcheckOutCtrl*/){
		Analytics.set('&dp', 'Check Out');
		Analytics.pageView();
		$scope.ADDONS = ADDONS;
		$scope.citems = 0;

		/*newvariable-checkOutCtrl*/
		$scope.$on('$ionicView.beforeEnter', function(){
		   initOrderData();
		});

		$scope.goDetailMenu = function() {
			if (gStates.getState() == STATE.CART_DETAIL_BACK) $state.go('mobileDetailRest');
			else $state.go('ordering.detailMenu');
		}

		function initOrderData () {
			$scope.business = gBusiness.getData();
			$scope.cart = gCart.getData();
			$scope.order = gOrder.getData();
			$scope.refreshCartData();
		}

		$scope.refreshCartData = function () {
			$scope.cart_data = {};
			var subtotal = 0;
			var quantity = 0;
			for (var i = 0; i < $scope.cart.length; i++) {
				subtotal += $scope.cart[i].total;
				quantity += $scope.cart[i].quantity;
			}

			var fix_order_summary = $rootScope.constants.fix_order_summary || $scope.business.tax_type === 2;

			$scope.cart_data.quantity = quantity;

			var tax = subtotal * ($scope.business.tax / 100);
			if ($scope.business.tax_type === 1) {
				tax = (subtotal * $scope.business.tax) / (100 + $scope.business.tax);
				subtotal -= tax;
			}
			var delivery_price = $scope.order.type == 1 ? $scope.business.delivery_price : 0;
			var discount = 0;
			var subtotal_to_calculate = subtotal * 1;
			if ($scope.business.tax_type === 1) {
				subtotal_to_calculate += tax;
			}
			if (ADDONS.discount_offer) {
				var offer = null;
				for (var i = 0; i < $scope.business.offers.length; i++) {
					if ($scope.business.offers[i].type == 1 && $scope.business.offers[i].minimum <= subtotal_to_calculate) {
						var aux = $scope.business.offers[i].rate_type == 1 ? subtotal_to_calculate * $scope.business.offers[i].rate / 100 : $scope.business.offers[i].rate;
						var last = 0;
						if (offer != null) last = offer.rate_type == 1 ? subtotal_to_calculate * offer.rate / 100 : offer.rate;
						if (aux < subtotal_to_calculate && last < aux) {
							offer = $scope.business.offers[i];
						}
					}
				}
				if (offer) {
					discount = offer.rate_type == 1 ? subtotal_to_calculate * offer.rate / 100 : offer.rate;
					$scope.cart_data.offer = offer;
				} else discount = 0;
			} else {
				discount = 0;
			}

			var subtotal_with_discount = subtotal - discount;

			var service_fee = (subtotal + tax - discount) * ($scope.business.service_fee / 100);
			if ($scope.business.tax_type === 2) {
				tax = (subtotal - discount) * $scope.business.tax / 100;
				service_fee = subtotal_with_discount * $scope.business.service_fee / 100;
			}

			subtotal_with_discount = $rootScope.Order.roundPrice(subtotal_with_discount);
			tax = $rootScope.Order.roundPrice(tax);
			discount = $rootScope.Order.roundPrice(discount);
			service_fee = $rootScope.Order.roundPrice(service_fee);
			tax = $rootScope.Order.roundPrice(tax);
			subtotal = subtotal_with_discount + discount;
			subtotal = $rootScope.Order.roundPrice(subtotal);
			var total = subtotal_with_discount + tax + service_fee + delivery_price;
			total = $rootScope.Order.roundPrice(total);

			$scope.cart_data.subtotal_with_discount = subtotal_with_discount;
			$scope.cart_data.tax = tax;
			$scope.cart_data.subtotal = subtotal + (!fix_order_summary ? tax : 0);
			$scope.cart_data.discount = discount;
			$scope.cart_data.service_fee = service_fee;
			$scope.cart_data.total = total;

			$scope.refreshNumCart();

			gCart.setData($scope.cart);
			$scope.setCartBalances();
		}

		$scope.goFinalCheckout = function () {
			function getUpselling(cb) {
				var upselling = [];
				var products_id = [];
				var cart_products = $scope.cart.map(function (product) {
					return product.id;
				});
				if (!$scope.business.lazy_load_products_recommended) {
				$scope.business.categories.forEach(function (category) {
					if (typeof category.id == 'string') return;
					category.products.forEach(function (product) {
						if (product.upselling && cart_products.indexOf(product.id) == -1 && products_id.indexOf(product.id) == -1 && (!product.inventoried || (product.inventoried && product.quantity > 0)) ) {
							products_id.push(product.id);
							upselling.push(product);
						}
					});
				});
				delete products_id, cart_products;
					return cb(upselling);
				} else {
					Ordering.business.products({
						id: $scope.business.id,
						type: $scope.order.type,
						where: [{
							attribute: 'upselling',
							value: true
						}]
					}, function (res) {
						if (!res.error) {
							for (var i = 0; i < res.result.length; i++) {
								if(cart_products.indexOf(res.result[i].id) == -1 && products_id.indexOf(res.result[i].id) && (!res.result[i].inventoried || (res.result[i].inventoried && res.result[i].quantity > 0)) ){
									products_id.push(res.result[i].id);
									upselling.push(res.result[i]);
			}
							}
							return cb(upselling)
						}
					})
				}
			}
			getUpselling(function (upselling) {
			if (upselling.length == 0 || !NEW_ADDONS.UPSELLING) {
				gStates.setState(STATE.ORDERING);
				if (gUser.getData().id == -1) {
					$state.go((ADDONS.web_template?'main.':'')+'signUp');
				} else {
					$state.go(app_states.finalCheckOut);
				}
			} else {
				MyModal.showTemplate('templates/'+ADDONS.template+'/views/upselling-products.html', {
					scope: $scope,
					animation: 'slide-in-up'
				}).then(function(upselling_products) {
					modals.push(upselling_products);
					upselling_products.scope.upselling_products = upselling;
					upselling_products.scope.some_product_added = false;
					upselling_products.scope.add = function (product) {
						if (!product.extras || product.extras.length == 0) {
							var _product = {
								code: $scope.generateRandom(6),
								id: product.id,
								images: product.images,
								ingredients: [],
								name: product.name,
								options: [],
								extended_options: [],
								quantity: 1,
								total: product.price,
								price: product.price,
								category_id: product.category_id,
								inventoried: product.inventoried,
								balance: product.inventoried ? product.quantity : 0
							};
							$rootScope.doGroupInCart(_product, product);
							$scope.cart = gCart.getData();
							$scope.refreshCartData();
							getUpselling(function(upselling){
								upselling_products.scope.upselling_products = upselling;
								if (upselling_products.scope.upselling_products.length == 0) upselling_products.scope.thanks();
							});
							if (upselling_products.scope.upselling_products.length == 0) {
								upselling_products.scope.thanks();
							} else upselling_products.scope.some_product_added = true;
						} else {
							$scope.onProductOption(product, false, function (res) {
								if (res) {
									upselling_products.scope.upselling_products = getUpselling();
									if (upselling_products.scope.upselling_products.length == 0) {
										upselling_products.scope.thanks();
									} else upselling_products.scope.some_product_added = true;
								}
							});
						}
					}
					upselling_products.scope.thanks = function () {
						upselling_products.scope.hide();
						gStates.setState(STATE.ORDERING);
						if (gUser.getData().id == -1) {
							$state.go((ADDONS.web_template?'main.':'')+'signUp');
						} else {
							$state.go(app_states.finalCheckOut);
						}
					}
					upselling_products.show();
				});
			}
			})
		}

		$scope.onProductOption = function (product, edit, callback) {
			var order_product = {
				id: product.id,
				name: product.name,
				images: product.images,
				quantity: edit ? product.quantity : 1,
				code: $scope.generateRandom(6),
				options: [],
				extended_options: [],
				//comments: "",
				price: product.price,
				total: product.price,
				ingredients: []
			};
			if (product.ingredients)  {
				order_product.ingredients = JSON.parse(JSON.stringify(product.ingredients));
			} else {
				order_product.ingredients = [];
			}
			if (edit) {
				for (var i = 0; i < $scope.business.categories.length; i++) {
					if (typeof $scope.business.categories[i].id == 'string') continue;
					for (var j = 0; j < $scope.business.categories[i].products.length; j++) {
						if ($scope.business.categories[i].products[j].id == product.id) {
							order_product = JSON.parse(JSON.stringify(product));
							product = $scope.business.categories[i].products[j];
							break;
						}
					}
				}
			} else {
				for (var i = 0; i < order_product.ingredients.length; i++) {
					order_product.ingredients[i].selected = true;
				}
			}
			var inventory = {};
			for (var i = 0; i < $scope.cart.length; i++) {
				if (inventory[$scope.cart[i].id]) inventory[$scope.cart[i].id] -= $scope.cart[i].quantity;
				else inventory[$scope.cart[i].id] = $scope.cart[i].balance;
			}
			$scope.openProduct(product, order_product, inventory, edit, function (res) {
				var sw = false;
				for (var i = 0; i < $scope.cart.length; i++) {
					if ($scope.cart[i].code == res.code) {
						$scope.cart[i] = res;
						sw = true;
					}
				}
				if (!sw) $rootScope.doGroupInCart(res, product);
				if (!edit) $scope.cart = gCart.getData();
				else gCart.setData($scope.cart);
				$scope.refreshCartData();
				if (callback) callback(true);
			});
		}

		$scope.removeProduct = function (product) {
			var products = [];
			for (var i = 0; i < $scope.cart.length; i++) {
				if ($scope.cart[i].code != product.code) {
					products.push($scope.cart[i]);
				}
			}
			$scope.cart = products;
			gCart.setData($scope.cart);
			$scope.refreshCartData();
		}

		$scope.onClickCancel = function () {
			if (gCart.getData().length == 0) {
				if (ADDONS.single_business) $state.go(app_states.homeScreen);
				else $state.go(NEW_FEATURES.MULTI_ADDRESS?'sideMenu.searchBusinesses':'restaurantSearch');
			} else {
				var promptPopup = $ionicPopup.confirm({
					title: (!ADDONS.web_template)?$scope.translate('MOBILE_APPNAME'):$scope.translate('WEB_APPNAME'),
					template: "<p"+(($scope.arabic_rtl)?' class="arabic_rtl"':' style="text-align:center;"')+">"+$scope.translate('MOBILE_QUESTION_CANCEL_ORDER')+"</p>",
					cancelType: 'button-stable',
					cancelText: $scope.translate('MOBILE_CHECKOUT_CANCEL'),
					okText: $scope.translate('MOBILE_FOURTH_PAGE_OK').toUpperCase()
				});
				promptPopup.then(function(res) {
					if (res) {
						gCart.setData([]);
						gBusiness.setData({});
						$ionicHistory.clearCache();
						if (ADDONS.single_business) $state.go(app_states.homeScreen);
						else $state.go(NEW_FEATURES.MULTI_ADDRESS?'sideMenu.searchBusinesses':'restaurantSearch');
					}
				});
			}
		}

		$scope.setCartBalances = function() {
			$scope.amounts = {};
			$scope.cart = gCart.getData();

			var cart = gCart.getData();
			var categories = gBusiness.getData().categories;
			cart.map(function(cart_product) {
				for (var i = 0; i < categories.length; i++) {
					var category = categories[i];
					for (var j = 0; j < category.products.length; j++) {
						var product = category.products[j];
						if (product.id == cart_product.id) {
							if (product && product.inventoried) {
								cart_product.balance = (product.quantity > MAX_PRODUCT_AMOUNT ? MAX_PRODUCT_AMOUNT : product.quantity) - $rootScope.getSoltProductQuantity(cart_product);
							} else {
								cart_product.balance = 0;
							}
							break;
						}
					}
				}
			});

			gCart.setData(cart);
			$scope.cart = cart;

			for (var j = 0; j < $scope.cart.length; j++) {
				$scope.amounts[$scope.cart[j].code] = [{value: 0, name: $scope.translate('REMOVE')}];
				if ($scope.cart[j].balance > MAX_PRODUCT_AMOUNT) $scope.cart[j].balance = MAX_PRODUCT_AMOUNT;
				var len = $scope.cart[j].balance == 0 ? MAX_PRODUCT_AMOUNT : $scope.cart[j].balance;
				for (var i = 1; i <= len; i++) {
					$scope.amounts[$scope.cart[j].code].push({value: i, name: i});
				}
			}
		}

		$scope.onChangeQuantity = function (product) {
			product.quantity = parseInt(product.quantity);
			if (product.quantity > 0) {
				if (!ADDONS.quantity_options) {
					var subtotal = product.price;
					for (var i = 0; i < product.options.length; i++) {
						var option = product.options[i];
						for (var k = 0; k < option.suboptions.length; k++) {
							var suboption = option.suboptions[k];
							subtotal += suboption.price;
						}
					}
					product.total = product.quantity*subtotal;
				} else {
					var subtotal = product.price;
					for (var i = 0; i < product.extended_options.length; i++) {
						var option = product.extended_options[i];
						for (var k = 0; k < option.suboptions.length; k++) {
							var suboption = option.suboptions[k];
							var suboption_price = suboption.price;
							if (option.with_half_option && suboption.position != 'whole') {
								suboption_price = suboption.half_price;
							}
							if (option.allow_suboption_quantity) {
								suboption_price *= suboption.quantity;
							}
							subtotal += suboption_price;
						}
					}
					product.total = product.quantity*subtotal;
				}
				$scope.refreshCartData();
			} else {
				$scope.removeProduct(product);
			}
		}

		Extensions.runAction('enter_cart_view', null, $scope);

		/*newfunction-checkOutCtrl*/
	});

	_controllers.controller('signUpCtrl',function($scope, $state, $location, $rootScope, $ionicHistory, MyModal, $ionicPopup,
									  MyLoading, MyAlert, gOrder, gUser, gStates, Analytics, Ordering, gNext/*newsignUpCtrl*/) {
		
		Analytics.set('&dp', 'Signup');
		Analytics.pageView();
		if (ADDONS.use_segment) {
			var segment = $scope.getNgDependency('segment');
		}
		$scope.ADDONS = ADDONS;
		$scope.countries = countries;
		$scope.signUpBusiness = false;
		$scope.SETTINGS = SETTINGS;
		var loginCaptcha = null;
		var signupCaptcha = null;
		
		$scope.$watch('features.recaptcha.ready',function (ready) {
			if ($state.current.name == "main.signUp" || $state.current.name == "signUp") {
				if (ready && $rootScope.features.recaptcha.signup_required) {
					signupCaptcha = grecaptcha.render('signup-recaptcha', {
						sitekey: $rootScope.features.recaptcha.site_key,
						callback: function (token) {
							$scope.$apply(function () {
								$scope.signUpUser.verification_code = token;
							});
						}
					});
				}
			} else if ($state.current.name == "main.login") {
				if (ready && $rootScope.features.recaptcha.auth_required) {
					loginCaptcha = grecaptcha.render('login-recaptcha', {
						sitekey: $rootScope.features.recaptcha.site_key,
						callback: function (token) {
							$scope.$apply(function () {
								$scope.signInUser.verification_code = token;
							});
						}
					});
				}
			}
		})

    /*newvariable-signUpCtrl*/	
		// init variables -------------------------------


		$scope.initVariable = function() {
			setTimeout(function () {
				window.scrollTo(0, 0);
			}, 150);
			$scope.signUpUser = {
				name : '',
				email : '',
				checkbox: true
			}
			$scope.signInUser = {
				email : '',
				pwd : ''
			};
			if ($state.current.name == "main.signUpBusiness") {
				$scope.signUpUser.level = 2;
				$scope.signUpUser.phone = '';
				$scope.signUpBusiness = true;
			}
			Extensions.runAction(($state.current.name=='main.login')?'after_login_view':'after_signup_view', {}, $scope);
			$scope.getLanguage(function (err, list, dictionary) {
				if (err) MyAlert(err);
				else {
					if ($state.current.name == 'main.login') $rootScope.pageTitle = $scope.translate('LOGIN');
					else $rootScope.pageTitle = $scope.translate('SIGNUP');
				}
			});
		}

		$scope.buyerInfoSetting = function (user) {
			MyLoading.show($scope.translate('MOBILE_FRONT_LOAD_GETTING_DATA'));
			// Getting CheckOut Fields and Setting the Buyer Data
			if (user.id == '-1'){
				// setting user data with temp userdata have structure of signinUser
				gUser.setData($scope.signInUser);
			}
			$scope.setBuyer();
		};

		$scope.setBuyer = function () {
			if (gStates.getState() == STATE.PROFILE) {
				var next = gNext.get();
				if (next && next != 'null') {
					$location.url(next);
				} else {
					$ionicHistory.nextViewOptions({
						disableBack: false
					});
					$state.go(app_states.homeScreen, {}, { reload:true, inherit:false });
				}
			} else if(gStates.getState() == STATE.MY_ORDER) {
				$ionicHistory.nextViewOptions({
					disableBack: false
				});
				$state.go('sideMenu.myOrder', {}, { reload:true, inherit:false });
			} else if(gStates.getState() == STATE.MY_CARD) {
				$ionicHistory.nextViewOptions({
					disableBack: false
				});
				$state.go('sideMenu.myCard', {}, { reload:true, inherit:false });
			} else if (gStates.getState() == STATE.ORDERING) {
				$state.go(app_states.finalCheckOut);
			} else if (gStates.getState() == STATE.SIGNUP_BUSINESS) {
				$state.go('main.listing');
				MyAlert.show($scope.translate('AFTER_BUSINESS_SIGNUP'));
			} else {
				$ionicHistory.nextViewOptions({
					disableBack: false
				});
				$state.go(app_states.homeScreen, {}, { reload:true, inherit:false });
			}
			MyLoading.hide();
			$scope.offSigninPopup();
			//if (ADDONS.web_template) location.reload();
		};
		//-------------------------------------------------
		$scope.onClickBack = function () {
			if (gStates.getState() == STATE.ORDERING){
				$state.go('ordering.checkOut');
				// var promptPopup = $ionicPopup.confirm({
				// 	title: (!ADDONS.web_template)?$scope.translate('MOBILE_APPNAME'):$scope.translate('WEB_APPNAME'),
				// 	template: "<p"+(($scope.arabic_rtl)?' class="arabic_rtl"':' style="text-align:center;"')+">"+$scope.translate('MOBILE_CARD_EMPTY')+"</p>",
				// 	cancelType: 'button-stable',
				// 	cancelText: $scope.translate('MOBILE_CHECKOUT_CANCEL'),
				// 	okText: $scope.translate('MOBILE_FOURTH_PAGE_OK').toUpperCase()
				// }).then(function(res){
				// 	if (res){
				// 		// var ary = [];
				// 		// gOrder.setData(ary);
				// 		// //$ionicHistory.clearCache();
				// 		// //$ionicHistory.clearHistory();
				// 		// $ionicHistory.nextViewOptions({
				// 		// 	disableBack: false
				// 		// });
				// 		// $state.go(app_states.homeScreen);
				// 	}else {

				// 	}
				// });
			}else {
				$ionicHistory.nextViewOptions({
					disableBack : false
				});
				//DEBUG
				$state.go(app_states.homeScreen);
			}
		};

		// ------ Implement of Sign-in Popup ------------------------------
		$scope.onSigninPopup = function(){
			if ($scope.modal) $scope.modal.remove();
			MyModal.showTemplate('templates/'+ADDONS.template+'/views/sign-in.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function(modal) {
				modals.push(modal);
				$scope.modal = modal;
				$scope.modal.show().then(function () {
					$scope.$watch('features.recaptcha.ready',function (ready) {
						if (ready && $rootScope.features.recaptcha.auth_required) {
							loginCaptcha = grecaptcha.render('login-recaptcha', {
								sitekey: $rootScope.features.recaptcha.site_key,
								callback: function (token) {
									$scope.$apply(function () {
										$scope.signInUser.verification_code = token;
									});
								}
							});
						}
					});
				});
			});
		};
		$scope.offSigninPopup = function(){
			if ($scope.modal) {
				$scope.modal.hide();
				$scope.modal.remove();
			}
		};

		$scope.signInCellphoneSms = function () {
			if (!$scope.signInUser.cellphone) {
				MyAlert.show($scope.translate('VALIDATION_ERROR_REQUIRED').replace('_attribute_', $scope.translate('CELLPHONE')));
			} else if (!$scope.signInUser.phone_code) {
				MyAlert.show($scope.translate('VALIDATION_ERROR_REQUIRED').replace('_attribute_', $scope.translate('PHONE_CODE')));
			} else {
				AccountKit.login('PHONE', {
					countryCode: '+'+$scope.signInUser.phone_code, phoneNumber: $scope.signInUser.cellphone
				}, function (response) {
					if (response.status === "PARTIALLY_AUTHENTICATED") {
						MyLoading.show($scope.translate('LOADING')+'...');
						Ordering.users.sms({
							platform: 'facebook',
							code: response.code
						}, function (res) {
							MyLoading.hide();
							if (!res.error) {
								USER_STATE = 'LOGIN';
								LOGIN_STATE = true;
								Analytics.set('&uid', res.result.id);
								localStorageApp.setItem(STORE.USER_ID, res.result.id);
								localStorageApp.setItem(STORE.TOKEN, res.result.session.access_token);
								localStorageApp.setItem(STORE.LOGIN, true);
								res.result.session = null;
								getUserInformation(res.result);
								if (res.result.level == 0 || res.result.level == 2 || res.result.level == 5) {
									$rootScope.editorAvilable = true;
									if (res.result.level == 0) $rootScope.superAdmin = true;
									else $rootScope.superAdmin = false;
								} else {
									$rootScope.editorAvilable = false;
									$rootScope.superAdmin = false;
								}
								$rootScope.getPages();
							} else MyAlert.show(res.result);
						});
					} else if (response.status === "NOT_AUTHENTICATED") {
						MyAlert.show($scope.translate('ERROR_AUTH_SMS'));
					} else if (response.status === "BAD_PARAMS") {
						MyAlert.show($scope.translate('ERROR_AUTH_SMS'));
					}
				});
			}
		};

		// LOGIN PART -------------------------------------------------------

		$scope.signIn = function () {
			console.log($state)
			if ($scope.signInUser.email == '' || $scope.signInUser.password == '' ) {
				MyAlert.show($scope.translate('MOBILE_FILL_REQUIRED_FIELDS'));
				return;
			}
			var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			var login = {
				password: $scope.signInUser.password
			};
			if ($rootScope.features.recaptcha.auth_required) {
				login.verification_code = $scope.signInUser.verification_code
			}
			if (re.test($scope.signInUser.email)) {
				login.email = $scope.signInUser.email;
			} else if (Number.isInteger($scope.signInUser.email*1)) {
				login.cellphone = $scope.signInUser.email;
			} else {
				return MyAlert.show($scope.translate('EMAIL_INVALID'));
			}
			if (NEW_FEATURES.ONLY_EDITOR && NEW_FEATURES.ENABLE_MULTIPROJECT && (!$scope.signInUser.project || $scope.signInUser.project == '')) {
				
				return MyAlert.show($scope.translate('WEBAPP_NAME_IS_REQUIRED'));
			}
			$rootScope.setApiEndpoints($scope.signInUser.project)
			MyLoading.show($scope.translate('MOBILE_FRONT_LOAD_GETTING_DATA'));
			Ordering.users.auth(login, function (res) {
				if (!res.error) {
					if (NEW_FEATURES.ONLY_EDITOR && res.result.level != 0 && res.result.level != 2) {
						return MyAlert.show($scope.translate('ERROR_NOT_PERMISSION'))
					}
					USER_STATE = 'LOGIN';
					LOGIN_STATE = true;
					Analytics.set('&uid', res.result.id);
					localStorageApp.setItem(STORE.USER_ID, res.result.id);
					localStorageApp.setItem(STORE.TOKEN, res.result.session.access_token);
					localStorageApp.setItem(STORE.LOGIN, true);
					res.result.session = null;
					if (ADDONS.use_segment) {
						segment.identify(res.result.id, {
							login_type: res.result.login_type,
							type: 'Login',
							name: res.result.name+' '+res.result.lastname,
							email: res.result.email
						})
					}
					getUserInformation(res.result);
					if (res.result.level == 0 || res.result.level == 2 || res.result.level == 5) {
						$rootScope.editorAvilable = true;
						if (res.result.level == 0) $rootScope.superAdmin = true;
						else $rootScope.superAdmin = false;
					} else {
						$rootScope.editorAvilable = false;
						$rootScope.superAdmin = false;
					}
					$rootScope.getPages()
				} else {
					MyLoading.hide();
					MyAlert.show(res.result);
					delete $scope.signInUser.verification_code;
					if ($rootScope.features.recaptcha.auth_required && loginCaptcha !== null) {
						setTimeout(function () {
							grecaptcha.reset(loginCaptcha)
						}, 100)
					}
				}
			});
			MyLoading.hide();

		};

		// Get User and Setting Buyer information by ID ----------------

		function getUserInformation ( user ) {
			if (GCM_DEVICE_TOKEN != '') {
				Ordering.notifications.add({
					user_id: user.id,
					token: GCM_DEVICE_TOKEN,
					app: APP_ID
				}, function (res) {});
			}
			gUser.setData(user);
			$scope.refreshCurUserAddress(function () {
				$scope.buyerInfoSetting(user);
			});
		}

		// ------ Implement of Register Popup ------------------------------
		/*MyModal.showTemplate('templates/'+ADDONS.template+'/views/register.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			modals.push(modal);
			$scope.modal1 = modal;
		});
		$scope.onRegPopup = function(){
			$scope.modal1.show();
		};
		$scope.offRegPopup = function(){
			$scope.modal1.hide();
		};*/
		//-------------------------------------------------------------------
		$scope.onClickSignUp = function () {
			$scope.onRegister();
		};
		$scope.onRegister = function () {
			MyLoading.show($scope.translate('MOBILE_REGISTRING'));
			if ($scope.signUpUser.checkbox && SETTINGS.terms_and_conditions) {
				Ordering.users.add($scope.signUpUser, function (res) {
					MyLoading.hide();
					if (!res.error) {
						if (ADDONS.use_segment) {
							segment.identify(res.result.id, {
								login_type: res.result.login_type,
								type: 'Sign Up',
								name: res.result.name+' '+res.result.lastname,
								email: res.result.email
							})
						}
						if (((!$rootScope.settings.business_signup_enabled_default) || ($rootScope.settings.business_signup_enabled_default && $rootScope.settings.business_signup_enabled_default.value == 0)) && $scope.signUpBusiness) {
							MyAlert.show($scope.translate('WAIT_CONFIRM_BUSINESS_SIGNUP'));
						} else {
							LOGIN_STATE = true;
							Analytics.set('&uid', res.result.id);
							localStorageApp.setItem(STORE.USER_ID, res.result.id);
							localStorageApp.setItem(STORE.TOKEN, res.result.session.access_token);
							localStorageApp.setItem(STORE.LOGIN, true);
							var usr = res.result;
							usr.session = null;
							gUser.setData(usr);
							getUserInformation(usr);
						}
					} else {
						MyAlert.show(res.result);
						delete $scope.signUpUser.verification_code;
						if ($rootScope.features.recaptcha.auth_required && loginCaptcha !== null) {
							setTimeout(function () {
								grecaptcha.reset(signupCaptcha)
							}, 100)
						}
					}
				}, function (e) {
					MyLoading.hide();
					MyAlert.show(e.statusText);
				});
			} else if (!SETTINGS.terms_and_conditions) {
				Ordering.users.add($scope.signUpUser, function (res) {
					MyLoading.hide();
					if (!res.error) {
						if (ADDONS.use_segment) {
							segment.identify(res.result.id, {
								login_type: res.result.login_type,
								type: 'Sign Up',
								name: res.result.name+' '+res.result.lastname,
								email: res.result.email
							})
						}
						if (((!$rootScope.settings.business_signup_enabled_default) || ($rootScope.settings.business_signup_enabled_default && $rootScope.settings.business_signup_enabled_default.value == 0)) && $scope.signUpBusiness) {
							MyAlert.show($scope.translate('WAIT_CONFIRM_BUSINESS_SIGNUP'));
						} else {
							LOGIN_STATE = true;
							Analytics.set('&uid', res.result.id);
							localStorageApp.setItem(STORE.USER_ID, res.result.id);
							localStorageApp.setItem(STORE.TOKEN, res.result.session.access_token);
							localStorageApp.setItem(STORE.LOGIN, true);
							var usr = res.result;
							usr.session = null;
							gUser.setData(usr);
							getUserInformation(usr);
						}
					}else {
						MyAlert.show(res.result);
						delete $scope.signUpUser.verification_code;
						if ($rootScope.features.recaptcha.signup_required && signupCaptcha !== null) {
							setTimeout(function () {
								grecaptcha.reset(signupCaptcha)
							}, 100)
						}
					}
				}, function (e) {
					MyLoading.hide();
					MyAlert.show(e.statusText);
				});
			} else {
				MyLoading.hide();
				MyAlert.show($scope.translate('TERMS_AND_CONDITIONS_ERROR'));
			}
		};

		$scope.onClickGuest = function() {
			if (gStates.getState() == STATE.PROFILE){
				$ionicHistory.nextViewOptions({
					disableBack: false
				});
				$state.go(app_states.homeScreen);
			}else if(gStates.getState() == STATE.MY_ORDER) {
				$ionicHistory.nextViewOptions({
					disableBack: false
				});
				$state.go(app_states.homeScreen);
			}
			else if(gStates.getState() == STATE.MY_CARD) {
				$ionicHistory.nextViewOptions({
					disableBack: false
				});
				$state.go(app_states.homeScreen);
			}
			
			else if (gStates.getState() == STATE.ORDERING) {
				USER_STATE = 'GUEST';
				$scope.signUpUser.id = '-1';
				gUser.setData({});
				$scope.setBuyer();
			}
		};

		// FB Login Part --------------------------------------------------

		$scope.fbLogin = function () {
			if (typeof facebookConnectPlugin == 'undefined') {
				function doLoginFacebook(accessToken) {
					MyLoading.show($scope.translate('LOADING')+'...');
					Ordering.users.facebook({
						access_token: accessToken
					}, function (res) {
						MyLoading.hide();
						if (!res.error) {
							USER_STATE = 'LOGIN';
							LOGIN_STATE = true;
							Analytics.set('&uid', res.result.id);
							localStorageApp.setItem(STORE.USER_ID, res.result.id);
							localStorageApp.setItem(STORE.TOKEN, res.result.session.access_token);
							localStorageApp.setItem(STORE.LOGIN, true);
							res.result.session = null;
							getUserInformation(res.result);
						} else MyAlert.show(res.result);
					});
				}
				FB.getLoginStatus(function(response) {
					if (response.status != 'connected') {
						FB.login(function (response) {
							if (response.status == 'connected') {
								doLoginFacebook(response.authResponse.accessToken);
							} else {
								MyAlert.show($scope.translate('MOBILE_FACEBOOK_LOGIN_ERROR'));
							}
						}, {scope: 'email,public_profile'});
					} else {
						doLoginFacebook(response.authResponse.accessToken);
					}
				});
			} else {
				facebookConnectPlugin.login(['email', 'public_profile'], function(result) {
					if(result.status != 'connected') {
						MyAlert.show($scope.translate('MOBILE_FACEBOOK_LOGIN_ERROR'));
					} else {
						MyLoading.show($scope.translate('LOADING')+'...');
						Ordering.users.facebook({
							access_token: result.authResponse.accessToken
						}, function (res) {
							MyLoading.hide();
							if (!res.error) {
								USER_STATE = 'LOGIN';
								LOGIN_STATE = true;
								Analytics.set('&uid', res.result.id);
								localStorageApp.setItem(STORE.USER_ID, res.result.id);
								localStorageApp.setItem(STORE.TOKEN, res.result.session.access_token);
								localStorageApp.setItem(STORE.LOGIN, true);
								res.result.session = null;
								getUserInformation(res.result);
							} else MyAlert.show(res.result);
						});
					}
				}, function(result) {
					MyAlert.show($scope.translate('MOBILE_FACEBOOK_LOGIN_ERROR'));
				});
			}
		};

		Extensions.runAction('enter_singup_view', null, $scope);
		Extensions.runAction('enter_login_view', null, $scope);

		$scope.initVariable();

		/*newfunction-signUpCtrl*/
	});

	_controllers.controller('registerCtrl',function($scope, $state, MyModal, gAllBusiness, gOrder/*newregisterCtrl*/) {

		/*newvariable-registerCtrl*/		
		/*newfunction-registerCtrl*/

	})

	_controllers.controller('finalCheckOutCtrl', function($scope, $rootScope, $timeout, $state, $ionicScrollDelegate, MyModal,
											  $ionicHistory, gOrder, gUser, MyAlert, MyLoading, ADDONS, $interval, Analytics, $ionicPlatform,
											  gPreorder, gAllBusiness, gCreateOrderBuyer, Ordering, gCart, gConfirm, gBusiness, gAddress/*newfinalCheckOutCtrl*/) {

		Analytics.set('&dp', 'Final Check Out');
		if(ADDONS.use_segment) {
			var segment = $scope.getNgDependency('segment')
			segment.track('Checkout Started', {})
		}										
		Analytics.pageView();
		var isCreateOrder = localStorageApp.getItem(STORE.CREATE_ORDER) != null;
		$scope.isCreateOrder = localStorageApp.getItem(STORE.CREATE_ORDER) != null;
		$scope.ADDONS = ADDONS;
		$scope.WEB_ADDONS = WEB_ADDONS;
		$scope.DRIVER_TIP = DRIVER_TIP;
		$scope.infoFields = {};
		$scope.preorder = gPreorder.getData();
		$scope.checkASAP = false;
		$scope.dateASAP = '';
		$scope.check_deliverytime = null;
		if (!$scope.preorder.menu_id) $scope.checkASAP = true;
		$scope.wopreorder = {
			dates: [],
			times: [],
			date: '',
			time: ''
		};
		$scope.curBusiness = {
			schedule: {}
		};

		if (NEW_FEATURES.MULTI_ADDRESS) {
			var order = gOrder.getData();
			if (gUser.isLogged() && !$scope.isCreateOrder && (!order.address || !order.position)) {
				if (!$scope.sharedData.curAddress) {
					$scope.sharedData.curAddress = gAddress.getData();
				}
				$scope.curAddress = $scope.sharedData.curAddress;
			} else if (gUser.isLogged() && !$scope.isCreateOrder && gAddress.getData().id) {
                $scope.curAddress = gAddress.getData();
            } else {
				$scope.curAddress = {
					address: gOrder.getData().address,
					location: gOrder.getData().position,
					tag: 'other'
				};
				if (gAddress.getData()){
					if (gAddress.getData().address_notes) $scope.curAddress.address_notes = gAddress.getData().address_notes;
					if (gAddress.getData().internal_number) $scope.curAddress.internal_number = gAddress.getData().internal_number;
					if (gAddress.getData().zipcode) $scope.curAddress.zipcode = gAddress.getData().zipcode;
				}
			}
			if (!$scope.isCreateOrder) {
				setTimeout(function () {
					gAddress.onChange(function (address) {
						if (gUser.isLogged()) {
							$scope.curAddress = $scope.sharedData.curAddress;
						}
						MyLoading.show($scope.translate('LOADING')+'...');
						Ordering.business.get({
							id_or_slug: gBusiness.getData().id,
							type: gOrder.getData().type,
							location: address.location.lat+','+address.location.lng
						}, function (res) {
							MyLoading.hide();
							if (!res.error && res.result.valid_service) {
								$scope.business = res.result;
								gBusiness.setData($scope.business);
								$scope.buyer.address = gOrder.getData().address;
								var order = gOrder.getData();
								order.address = address.address;
								order.position = address.location;
								gOrder.setData(order);
								$scope.initVariables();
								$scope.refreshCartData();
							} else {
								console.log("INVALID SERVICE");
							}
						});
					});
				}, 1000)
			}
		}

		$scope.order = gOrder.getData();
		$scope.buyer = localStorageApp.getItem(STORE.CREATE_ORDER)?gCreateOrderBuyer.getData():gUser.getData();
		$scope.buyer.city_id = '';
		$scope.cart_ready = false;
		$scope.buyer.dropdown_option_id = '';
		if ($scope.order.city && $scope.order.dropdownoption) {
			$scope.buyer.city_id = $scope.order.city;
			$scope.buyer.dropdown_option_id = $scope.order.dropdownoption;
		} else if ($scope.buyer.dropdown_option) {
			$scope.buyer.city_id = $scope.buyer.dropdown_option.city.id+'';
			$scope.buyer.dropdown_option_id = $scope.buyer.dropdown_option.id+'';
		}
		$scope.buyer.address = $scope.order.address;
		$scope.buyer.city_id = $scope.order.city || $scope.buyer.city_id+'' || '';
		$scope.buyer.dropdown_option_id = $scope.order.dropdownoption || $scope.buyer.dropdown_option_id+'' || '';
		$scope.business = gBusiness.getData();
		NEW_FEATURES.BUSINESS_PAGE = $scope.business.lazy_load_products_recommended
		$scope.cart = gCart.getData();
		$scope.order.paymethod = null;
		$scope.order.driver_tip = DRIVER_TIPS.tip_1;
		$scope.driver_tips = [
            { text: DRIVER_TIPS.tip_1+"%", value: DRIVER_TIPS.tip_1 },
            // { text: DRIVER_TIPS.tip_2+"%", value: DRIVER_TIPS.tip_2 },
            { text: DRIVER_TIPS.tip_3+"%", value: DRIVER_TIPS.tip_3 },
            { text: DRIVER_TIPS.tip_4+"%", value: DRIVER_TIPS.tip_4 },
            { text: DRIVER_TIPS.tip_5+"%", value: DRIVER_TIPS.tip_5 },
			{ text: "Other", value: -1 }
        ];
        $scope.placing = false;

		/*newvariable-finalCheckOutCtrl*/
		
		if (ADDONS.preorder) {
			$scope.check_deliverytime = $interval(function () {
				if ((ADDONS.web_template && $state.current.name != 'main.checkOut') || (!ADDONS.web_template && $state.current.name != 'finalCheckOut')) $interval.cancel($scope.check_deliverytime);
				if ($scope.preorder.menu_id) {
					var date = new Date($scope.preorder.date);
					var time = date.getTime()+($scope.preorder.time.split(':')[0]*60*60*1000)+($scope.preorder.time.split(':')[1]*60*1000);
					var curTime = new Date().toLocaleString('en-US', {timeZone: gBusiness.getData().timezone});
					curTime = new Date(curTime);
					curTime.setSeconds(0);
					curTime.setMilliseconds(0);
					curTime = curTime.getTime();
					if ((time-curTime)/(60*1000) < 16) {
						var dates = $scope.getDatesSchedule($scope.preorder.schedule);
						if (angular.toJson($scope.preorder.days) != angular.toJson(dates)) $scope.preorder.days = dates;
						var aux = $scope.checkASAP === true;
						$scope.changeCheckASAP(true, aux);
						$scope.checkASAP = aux;
					}
				} else {
					var date = new Date($scope.wopreorder.date);
					var time = date.getTime()+($scope.wopreorder.time.split(':')[0]*60*60*1000)+($scope.wopreorder.time.split(':')[1]*60*1000);
					var curTime = new Date().toLocaleString('en-US', {timeZone: gBusiness.getData().timezone});
					curTime = new Date(curTime);
					curTime.setSeconds(0);
					curTime.setMilliseconds(0);
					curTime = curTime.getTime();
					if ((time-curTime)/(60*1000) < 16) {
						var dates = $scope.getDatesSchedule(gBusiness.getData().schedule);
						if (angular.toJson($scope.wopreorder.dates) != angular.toJson(dates)) $scope.wopreorder.dates = dates;
						var aux = $scope.checkASAP === true;
						$scope.changeCheckASAP(true, aux);
						$scope.checkASAP = aux;
					}
				}
			}, 200);
		}

		$scope.changePreorderDatetime = function (date) {
			if ($scope.preorder.menu_id) {
				if (!date) {
					var date = new Date($scope.preorder.date);
					$scope.order.delivery_datetime = (date.getMonth()+1)+'-'+date.getDate()+'-'+date.getFullYear()+' '+$scope.preorder.time;     // String(date)
				} else {
					for (var i = 0; i < $scope.preorder.days.length; i++) {
						if ($scope.preorder.days[i].value == $scope.preorder.date) {
							$scope.preorder.times = $scope.getTimesSchedule($scope.preorder.date, $scope.preorder.schedule);
							break;
						}
					}
					$scope.preorder.time = $scope.preorder.times[0].value;
					var date = new Date($scope.preorder.date);
					$scope.order.delivery_datetime = (date.getMonth()+1)+'-'+date.getDate()+'-'+date.getFullYear()+' '+$scope.preorder.time;
				}
			} else $scope.order.delivery_datetime = null;
		}

		$scope.changeWopreorderDatetime = function () {
			if ($scope.wopreorder.date != '' && $scope.wopreorder.time != '') {
				var date = new Date($scope.wopreorder.date);
				$scope.order.delivery_datetime = (date.getMonth()+1)+'-'+date.getDate()+'-'+date.getFullYear()+' '+$scope.wopreorder.time;
			} else if ($scope.wopreorder.date != '' && $scope.wopreorder.time == '') {
				for (var i = 0; i < $scope.wopreorder.dates.length; i++) {
					if ($scope.wopreorder.dates[i].value == $scope.wopreorder.date) {
						$scope.wopreorder.times = $scope.getTimesSchedule($scope.wopreorder.date, $scope.wopreorder.schedule);
						break;
					}
				}
				$scope.wopreorder.time = $scope.wopreorder.times[0].value;
				var date = new Date($scope.wopreorder.date);
				$scope.order.delivery_datetime = (date.getMonth()+1)+'-'+date.getDate()+'-'+date.getFullYear()+' '+$scope.wopreorder.time;
			} else $scope.order.delivery_datetime = null;
		}

		$scope.getDatesSchedule = function (schedule) {
			if (!schedule) return [];
			var rdays = [];
			var date = new Date().toLocaleString('en-US', {timeZone: gBusiness.getData().timezone});
			date = new Date(date);
			date.setHours(0);
			date.setMinutes(0);
			date.setSeconds(0);
			date.setMilliseconds(0);
			var count = 0;

			while (rdays.length < MAX_DAYS_PREORDER && count < 100) {
				if (schedule[date.getDay()].enabled) {
					if ($scope.getTimesSchedule(date.toString(), schedule).length > 0) {
						var text = $scope.translate('DAY'+(date.getDay()!=0?date.getDay():7))+', '+$scope.translate('MONTH'+(date.getMonth()+1))+' '+date.getDate()+', '+date.getFullYear();
						rdays.push({
							text: text,
							value: date.toString()
						});
					}
				}
				count++;
				date = new Date(date.getTime()+(24*60*60*1000));
			}
			return rdays;
		}

		$scope.getTimesSchedule = function (curdate, schedule) {
			var date = new Date().toLocaleString('en-US', {timeZone: gBusiness.getData().timezone});
			date = new Date(date)
			var dateSeleted = new Date(curdate);
			var times = [];
			for (var k = 0; k < schedule[dateSeleted.getDay()].lapses.length; k++) {
				var open = {
					hour: schedule[dateSeleted.getDay()].lapses[k].open.hour,
					minute: schedule[dateSeleted.getDay()].lapses[k].open.minute
				}
				var close = {
					hour: schedule[dateSeleted.getDay()].lapses[k].close.hour,
					minute: schedule[dateSeleted.getDay()].lapses[k].close.minute
				}
				for (var i = open.hour; i <= close.hour; i++) {
					if (date.getDate() != dateSeleted.getDate() || (date.getDate() == dateSeleted.getDate() && i >= date.getHours())|| i >= date.getHours()) {
						var hour = "";
						var meridian = "";
						if (TIME_FORMAT_24) hour = i<10?'0'+i:i;
						else {
							if (i == 0) {
								hour = '12';
								meridian = " "+$scope.translate('AM');
							} else if (i > 0 && i < 12) {
								hour = (i<10?'0'+i:i);
								meridian = " "+$scope.translate('AM');
							} else if (i == 12) {
								hour = "12";
								meridian = " "+$scope.translate('PM');
							} else {
								hour = ((i-12<10)?'0'+(i-12):(i-12));
								meridian = " "+$scope.translate('PM');
							}
						}
						var needStart = null 
						for (var j = (i==open.hour?open.minute:0); j <= (i==close.hour?close.minute:59); j+=15) {
							if (i != date.getHours() || j >= date.getMinutes()) {
								times.push({
									text: hour+':'+(j<10?'0'+j:j)+meridian,
									value: (i<10?'0'+i:i)+':'+(j<10?'0'+j:j)
								});
							} else if (i == date.getHours() &&  close.minute >= date.getMinutes()) {
								needStart = {
									text: hour+':'+(date.getMinutes()<10?'0'+date.getMinutes():date.getMinutes())+meridian,
									value: (i<10?'0'+i:i)+':'+(date.getMinutes()<10?'0'+date.getMinutes():date.getMinutes())
								};
							}
						}
						if (needStart) {
							times.unshift(needStart)
						}
					}
				}
			}
			return times;
		}

		$scope.changeCheckASAP = function (check, curcheck) {
			$scope.checkASAP = check;
			if (check) {
				if ($scope.preorder.menu_id) {
					if (!$scope.preorder.days[0]) return;
					$scope.preorder.date = $scope.preorder.days[0].value;
					var times = $scope.getTimesSchedule($scope.preorder.days[0].value, $scope.preorder.schedule);
					if (angular.toJson($scope.preorder.times) != angular.toJson(times)) $scope.preorder.times = times;
					$scope.preorder.time = $scope.preorder.times[0].value;
					var cdate = new Date().toLocaleString('en-US', {timeZone: gBusiness.getData().timezone});
					cdate = new Date(cdate);
					var date = new Date($scope.preorder.days[0].value);
					date = new Date(date.getTime()+($scope.preorder.times[0].value.split(':')[0]*60*60*1000)+($scope.preorder.times[0].value.split(':')[1]*60*1000));
					console.log(cdate)
					console.log(date)
					if (Math.ceil((date.getTime()-cdate.getTime())/(60*1000)) < 16 && curcheck) {
						$scope.dateASAP = $scope.translate('DAY'+(cdate.getDay()!=0?cdate.getDay():7))+', '+$scope.translate('MONTH'+(cdate.getMonth()+1))+' '+cdate.getDate()+', '+cdate.getFullYear()+' '+$scope.parseTime({ hour: (cdate.getHours()<10?'0'+cdate.getHours():cdate.getHours()), minute: (cdate.getMinutes()<10?'0'+cdate.getMinutes():cdate.getMinutes()) });
						//$scope.order.delivery_datetime = null;
						$scope.order.delivery_datetime = (cdate.getMonth()+1)+'-'+cdate.getDate()+'-'+cdate.getFullYear()+' '+cdate.getHours()+':'+cdate.getMinutes();
					} else {
						$scope.dateASAP = $scope.preorder.days[0].text+' '+$scope.preorder.times[0].text;
						$scope.changePreorderDatetime();
					}
				} else {
					if (!$scope.wopreorder.dates[0]) return;
					$scope.wopreorder.date = $scope.wopreorder.dates[0].value;
					var times = $scope.getTimesSchedule($scope.wopreorder.dates[0].value, $scope.wopreorder.schedule);
					if (angular.toJson($scope.wopreorder.times) != angular.toJson(times)) $scope.wopreorder.times = times;
					$scope.wopreorder.time = times[0].value;
					var cdate = new Date().toLocaleString('en-US', {timeZone: gBusiness.getData().timezone});
					cdate = new Date(cdate);
					var date = new Date($scope.wopreorder.dates[0].value);
					date = new Date(date.getTime()+($scope.wopreorder.times[0].value.split(':')[0]*60*60*1000)+($scope.wopreorder.times[0].value.split(':')[1]*60*1000));
					if (Math.ceil((date.getTime()-cdate.getTime())/(60*1000)) < 16 && curcheck) {
						$scope.dateASAP = $scope.translate('DAY'+(cdate.getDay()!=0?cdate.getDay():7))+', '+$scope.translate('MONTH'+(cdate.getMonth()+1))+' '+cdate.getDate()+', '+cdate.getFullYear()+' '+$scope.parseTime({ hour: (cdate.getHours()<10?'0'+cdate.getHours():cdate.getHours()), minute: (cdate.getMinutes()<10?'0'+cdate.getMinutes():cdate.getMinutes()) });;
						$scope.order.delivery_datetime = null;
					} else {
						$scope.dateASAP = $scope.wopreorder.dates[0].text+' '+times[0].text;
						$scope.changeWopreorderDatetime();
					}
				}
			} else if ($scope.preorder.menu_id) {
				var times = $scope.getTimesSchedule($scope.preorder.days[0].value, $scope.preorder.schedule);
				$scope.dateASAP = $scope.preorder.days[0].text+' '+$scope.parseTime({ hour: times[0].text.split(':')[0], minute: times[0].text.split(':')[1] });
				$scope.changePreorderDatetime();
			} else $scope.changeWopreorderDatetime();
		}

		$scope.show = function() {
			MyLoading.show($scope.translate('MOBILE_FRONT_LOAD_LOADING'));
		};

		$scope.hide = function(){
			MyLoading.hide();
		};

		$scope.userState = USER_STATE;
		$scope.user_login = gUser.getData().id != undefined && gUser.getData().id != -1;
		// console.log($scope.user_login);

		// Part of Display for map ---------------------------------------------------

		/*$scope.$on('$ionicView.beforeEnter', function(){
			initView();
		});*/

		/*$scope.$on('$ionicView.beforeLeave', function() {
			//$scope.offConfirm(true);
		});*/
		var init_date = false;
		$scope.$watch('order.delivery_datetime', function (value) {
			if (init_date) {
				$scope.changeOrderType($scope.order.type, true)
			} else {
				setTimeout(function(){
					init_date = true;
				}, 500)
			}
		});
		$scope.orderType = $scope.order.type;
		$scope.changeOrderType = function (type, force) {
			var order = gOrder.getData();
			if ($scope.order.type != type || force) {
				order.type = type;
				if ($scope.order.delivery_datetime) {
					order.timestamp = parseInt((new Date($scope.order.delivery_datetime)).getTime()/1000);
				}
				$scope.getBusinessByOrder($scope.business, order, function (business) {
					if (ADDONS.single_business || !ADDONS.single_business && business.valid_service) {
						if (!NEW_FEATURES.BUSINESS_PAGE) {
							$scope.checkProductCart(business, $scope.cart, function (change, products) {
								if (change) {
									if (products) {
										var new_cart = [];
										for (var i = 0; i < $scope.cart.length; i++) {
											var product_cart = $scope.cart[i];
											if (products.indexOf(product_cart.id) == -1) {
												new_cart.push(product_cart);
											}
										}
										$scope.cart = new_cart;
										gCart.setData($scope.cart);
									}
									$scope.order.type = type;
									var myorderselect = document.getElementById('myorderselectChek');
									if (myorderselect) {
										myorderselect.value = type;
									}
									gOrder.setData(order);
									$scope.business = business;
									gBusiness.setData($scope.business);
									$scope.initVariables();
									$scope.refreshCartData();
									if ($scope.cart.length == 0 && ADDONS.web_template) return  $state.go('main.business', { business: $scope.business.slug });
									else if ($scope.cart.length == 0 && !ADDONS.web_template) {
										$state.go('sideMenu.homeScreen');
									}
									if ($scope.cart_data.subtotal < $scope.business.minimum) {
										if (ADDONS.web_template) $state.go('main.business', { business: $scope.business.slug });
										else $scope.onClickDetail();
									}
								} else {
									var myorderselect = document.getElementById('myorderselectChek');
									if (myorderselect){
										myorderselect.value = $scope.order.type;
										myorderselect.options[type-1].classList.add("diselected")
										myorderselect.options[$scope.order.type-1].classList.remove("diselected")
										myorderselect.options[$scope.order.type-1].Selected = true;
									}
								}
							}, true, force?true:false);
						} else {
							if ($scope.cart.length > 0) {
								var products = $scope.cart.map(function (product) {
									return product.id;
								});
								MyLoading.show($scope.translate('LOADING')+'...');
								var validate_data = {
									id: $scope.business.id,
									type: type,
									products: JSON.stringify(products),
								}
								if ($scope.order.delivery_datetime && gPreorder.getData().menu_id) {
									validate_data.menu_id = gPreorder.getData().menu_id;
								} else if ($scope.order.delivery_datetime) {
									validate_data.timestamp = parseInt((new Date($scope.order.delivery_datetime)).getTime()/1000);
								}
								Ordering.business.validate_cart(validate_data, function (res) {
									MyLoading.hide();
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
												$scope.cart = new_cart;
												gCart.setData($scope.cart);
											}

											if (res.result.invalid_products.length > 0) {
												var product_str = '';
												res.result.invalid_products.forEach(function (product) {
													if (product_str != '') product_str += ', ';
													product_str += product.name
												});
												MyAlert.confirm($rootScope.translate(!force?'IF_CHANGE_ORDER_TYPE_PRODUCTS_REMOVED':'IF_CHANGE_DELIVERY_TIME_PRODUCTS_REMOVED').replace('_products_', product_str), $scope.translate('OK'), $scope.translate('CANCEL')).then(function () {
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
													$scope.cart = new_cart;
													gCart.setData($scope.cart);
													$scope.order.type = type;
													var myorderselect = document.getElementById('myorderselectChek');
													if (myorderselect) {
														myorderselect.value = type;
													}
													gOrder.setData(order);
													$scope.business = business;
													gBusiness.setData($scope.business);
													$scope.refreshCartData();
													if ($scope.cart.length == 0 && ADDONS.web_template) return  $state.go('main.business', { business: $scope.business.slug });
													else if ($scope.cart.length == 0 && !ADDONS.web_template) {
														$state.go('sideMenu.homeScreen');
													}
													if ($scope.cart_data.subtotal < $scope.business.minimum) {
														if (ADDONS.web_template) $state.go('main.business', { business: $scope.business.slug });
														else $scope.onClickDetail();
													}
												}).catch(function () {
													var myorderselect = document.getElementById('myorderselectChek');
													if (myorderselect){
														myorderselect.value = $scope.order.type;
														myorderselect.options[type-1].classList.add("diselected")
														myorderselect.options[$scope.order.type-1].classList.remove("diselected")
														myorderselect.options[$scope.order.type-1].Selected = true;
													}
												});
											}

											if (res.result.invalid_products.length == 0) {
												$scope.order.type = type;
												gOrder.setData(order);
												$scope.business = business;
												gBusiness.setData($scope.business);
												$scope.refreshCartData();
												if ($scope.cart.length == 0 && ADDONS.web_template) return  $state.go('main.business', { business: $scope.business.slug });
												else if ($scope.cart.length == 0 && !ADDONS.web_template) {
													$state.go('sideMenu.homeScreen');
												}
												if ($scope.cart_data.subtotal < $scope.business.minimum) {
													if (ADDONS.web_template) $state.go('main.business', { business: $scope.business.slug });
													else $scope.onClickDetail();
												}
											}
										} else {
											$scope.order.type = type;
											gOrder.setData(order);
											$scope.business = business;
											gBusiness.setData($scope.business);
											$scope.refreshCartData();
										}
									} else MyAlert.show(res.result);
								});
							}
						}
					} else {
						if (type == 1) MyAlert.show($scope.translate('FRONT_SORRY_DELIVERY_OPTION'));
						else MyAlert.show($scope.translate('MOBILE_VERY_FAR_FOR_PICKUP'));
					}
				});
			}
		}
		var checkAddressBusy = false;
		$scope.showCheckAddress = function () {
			if (checkAddressBusy) return;
			checkAddressBusy = true;
			setTimeout(function () {
				checkAddressBusy = false;
			}, 1000);
			if (ADDONS.check_address_checkout && SEARCH_BY_ADDRESS) {
				$('input').blur();
				$scope.openAddress(function (business) {
					$scope.business = business;
					gBusiness.setData($scope.business);
					$scope.buyer.address = gOrder.getData().address;
					$scope.order.type = gOrder.getData().type;
					if (NEW_FEATURES.MULTI_ADDRESS) {
						$scope.curAddress.address = gOrder.getData().address;
						$scope.curAddress.location = gOrder.getData().position;
					}
					$scope.initVariables();
					$scope.refreshCartData();
				});
			}
		}

		$scope.openChangeAddress = function () {
			if (gUser.isLogged() && !$scope.isCreateOrder) {
				$scope.openAddresses();
			} else {
				$scope.showCheckAddress();
			}
		}

		$scope.refreshCartData = function () {
			$scope.cart_data = {};
			var subtotal = 0;
			var quantity = 0;
			for (var i = 0; i < $scope.cart.length; i++) {
				subtotal += $scope.cart[i].total;
				quantity += $scope.cart[i].quantity;
			}

			var aux_subtotal = subtotal * 1;

			var fix_order_summary = $rootScope.constants.fix_order_summary || $scope.business.tax_type === 2;

			$scope.cart_data.quantity = quantity;

			var tax = subtotal * ($scope.business.tax / 100);
			if ($scope.business.tax_type === 1) {
				tax = (subtotal * $scope.business.tax) / (100 + $scope.business.tax);
				subtotal -= tax;
			}
			var delivery_price = $scope.order.type == 1 ? $scope.business.delivery_price : 0;
			var discount = 0;
			var subtotal_to_calculate = subtotal * 1;
			if ($scope.business.tax_type === 1) {
				subtotal_to_calculate += tax;
			}
			if (!$scope.order.offer) {
				if (ADDONS.discount_offer) {
					var offer = null;
					for (var i = 0; i < $scope.business.offers.length; i++) {
						if ($scope.business.offers[i].type == 1 && $scope.business.offers[i].minimum <= subtotal_to_calculate) {
							var aux = $scope.business.offers[i].rate_type == 1 ? subtotal_to_calculate * $scope.business.offers[i].rate / 100 : $scope.business.offers[i].rate;
							var last = 0;
							if (offer != null) last = offer.rate_type == 1 ? subtotal_to_calculate * offer.rate / 100 : offer.rate;
							if (aux < subtotal_to_calculate && last < aux) {
								offer = $scope.business.offers[i];
							}
						}
					}
					if (offer) {
						discount = offer.rate_type == 1 ? subtotal_to_calculate * offer.rate / 100 : offer.rate;
						$scope.cart_data.offer = offer;
					}
					else discount = 0;
				} else discount = 0;
				$scope.order.offer = offer;
			} else {
				discount = $scope.order.offer.rate_type == 1 ? subtotal_to_calculate * $scope.order.offer.rate / 100 : $scope.order.offer.rate;
			}

			var subtotal_with_discount = subtotal - discount;

			var service_fee = (subtotal_with_discount + tax) * ($scope.business.service_fee / 100);
			var driver_tip = (subtotal_with_discount + tax) * $scope.order.driver_tip / 100;
			if ($scope.business.tax_type === 2) {
				tax = (subtotal - discount) * $scope.business.tax / 100;
				service_fee = subtotal_with_discount * $scope.business.service_fee / 100;
				driver_tip = subtotal_with_discount * $scope.order.driver_tip / 100;
			}

			if ($scope.order.type != 1) {
				driver_tip = 0;
			}

			subtotal_with_discount = $rootScope.Order.roundPrice(subtotal_with_discount);
			tax = $rootScope.Order.roundPrice(tax);
			discount = $rootScope.Order.roundPrice(discount);
			service_fee = $rootScope.Order.roundPrice(service_fee);
			driver_tip = $rootScope.Order.roundPrice(driver_tip);
			tax = $rootScope.Order.roundPrice(tax);
			subtotal = subtotal_with_discount + discount;
			subtotal = $rootScope.Order.roundPrice(subtotal);
			var total = subtotal_with_discount + tax + service_fee + delivery_price + driver_tip;
			total = $rootScope.Order.roundPrice(total);

			$scope.cart_data.subtotal_with_discount = subtotal_with_discount;
			$scope.cart_data.tax = tax;
			$scope.cart_data.subtotal = subtotal + (!fix_order_summary ? tax : 0);
			$scope.cart_data.discount = discount;
			$scope.cart_data.service_fee = service_fee;
			$scope.cart_data.driver_tip = driver_tip;
			$scope.cart_data.total = total;

			console.log($scope.cart_data)

			if ($scope.business.minimum > aux_subtotal) {
				if (ADDONS.web_template) {
					$state.go('main.business', { business: $scope.business.slug });
				} else $scope.onClickDetail();
			}
		}

		function initView() {
			if (!gUser.getData().id || !gBusiness.getData().id || gCart.getData().length == 0) {
				return $scope.onGoHome();
			}
			if ($rootScope.constants.fix_order_summary !== null) {
				$scope.cart_ready = true;
				$scope.refreshCartData();
			} else {
				$rootScope.$watch('constants.fix_order_summary', function (newVal, oldVal) {
					if (oldVal === null && newVal !== null) {
						$scope.cart_ready = true;
						$scope.refreshCartData();
					} 
				}, true)
			}
			$scope.loadGoogleMaps(function () {
				$scope.getLanguage(function (err, list, dictionary) {
					setTimeout(function () {
						window.scrollTo(0, 0);
						$ionicScrollDelegate.scrollTop();
					}, 150);
					$rootScope.pageTitle = $scope.translate('MOBILE_FRONT_CHECKOUT');
					$scope.checkoutfields = {};
					$scope.addressfields = {};
					Ordering.validationfields.all({}, function (res) {
						if (!res.error) {
							res.result.forEach(function (validationfield) {
								if (validationfield.validate == 'checkout') $scope.checkoutfields[validationfield.code] = validationfield;
								else if (validationfield.validate == 'address') $scope.addressfields[validationfield.code] = validationfield;
							});
						}
					});
					$scope.cities = [{
						name: $scope.translate('FRONT_SELECT_CITY'),
						id: ""
					}];
					$scope.dropdownoptions = [{
						id: "",
						name: $scope.translate('FRONT_SELECT_NEIBORHOOD'),
						enabled: true
					}];
					Ordering.countries.all({}, function (res) {
						MyLoading.hide();
						if (!res.error) {
							for (var i = 0; i < res.result.length; i++) {
								for (var j = 0; j < res.result[i].cities.length; j++) {
									if (res.result[i].cities[j].enabled && res.result[i].cities[j].options.length > 0) {
										$scope.cities.push(res.result[i].cities[j]);
										$scope.dropdownoptions = $scope.dropdownoptions.concat(res.result[i].cities[j].options);
									}
								}
							}
						}
					});

					$scope.paymethods = [];
					for (var i = 0; i < $scope.business.paymethods.length; i++) {
						if ($scope.business.paymethods[i].enabled) {
							if ((($scope.business.paymethods[i].paymethod.gateway == 'stripe' || $scope.business.paymethods[i].paymethod.gateway == 'stripe_connect') && gUser.getData().id < 0)
								|| ($scope.business.paymethods[i].paymethod.gateway == 'stripe' && !ADDONS.stripe_payment)
								|| ($scope.business.paymethods[i].paymethod.gateway == 'stripe_connect' && !ADDONS.stripeconnect_payment)
								|| ($scope.business.paymethods[i].paymethod.gateway == 'stripe_direct' && !ADDONS.stripedirect_payment)
								|| ($scope.business.paymethods[i].paymethod.gateway == 'stripe_redirect' && !ADDONS.striperedirect_payment.enable)
								|| ($scope.business.paymethods[i].paymethod.gateway == 'paypal_express' && !ADDONS.paypal_express_payment)
								|| ($scope.business.paymethods[i].paymethod.gateway == 'authorize' && !ADDONS.authorize_payment)
								|| ($scope.business.paymethods[i].paymethod.gateway != 'cash' && $scope.business.paymethods[i].paymethod.gateway != 'card_delivery' && isCreateOrder)) continue;
							$scope.paymethods.push({
								id: $scope.business.paymethods[i].paymethod_id,
								name: $scope.business.paymethods[i].paymethod.name,
								gateway: $scope.business.paymethods[i].paymethod.gateway,
								sandbox: $scope.business.paymethods[i].sandbox,
								data: $scope.business.paymethods[i].data
							});
						}
					}
					if ($scope.paymethods.length == 1) {
						$scope.gateway = $scope.paymethods[0].gateway;
						$scope.onPaymethod($scope.paymethods[0]);
					}
					
					var schedule = gBusiness.getData().schedule;

					var days = [];
					var date = new Date().toLocaleString('en-US', {timeZone: gBusiness.getData().timezone});
					date = new Date(date);
					date.setHours(0);
					date.setMinutes(0);
					date.setSeconds(0);
					date.setMilliseconds(0);
					var count = 0;
					while (days.length < MAX_DAYS_PREORDER && count < 100) {
						if ($scope.getTimesSchedule(date.toString(), schedule).length > 0) {
							var text = $scope.translate('DAY'+(date.getDay()!=0?date.getDay():7))+', '+$scope.translate('MONTH'+(date.getMonth()+1))+' '+date.getDate()+', '+date.getFullYear();
							days.push({
								text: text,
								value: date.toString(),
								schedule: schedule
							});
						}
						count++;
						date = new Date(date.getTime()+(24*60*60*1000));
					}
					$scope.wopreorder.schedule = schedule;
					$scope.wopreorder.dates = days;

					$scope.changeCheckASAP(!$scope.preorder.menu_id);
				});
			});
		}

		$scope.addStripeCard = function (paymethod, business, user, cb) {
			var publishable = '';
			if (paymethod.gateway == 'stripe_connect') publishable = paymethod.data.stripe.publishable;
			else publishable = publishable = paymethod.data.publishable;
			function afterRequirements(publishable, requirements) {
				$scope.showCardStripe(publishable, false, function (token) {
					MyLoading.show($scope.translate('LOADING')+'...');
					Ordering.payments.cards.add({
						business_id: business.id,
						user_id: user.id,
						token_id: token,
						gateway: 'stripe'
					}, function (res) {
						MyLoading.hide();
						if (!res.error) {
							cb();
						} else MyAlert.show(res.result);
					});
				}, requirements);
			}
			if (!BREAKER_FEATURES.STRIPE_UPDATED) {
				afterRequirements(publishable);
			} else {
				MyLoading.show($scope.translate('LOADING')+'...');
				Ordering.payments.requirements({
					gateway: 'stripe',
					type: 'add_card'
				}, function (res) {
					MyLoading.hide();
					if (!res.error) {
						afterRequirements(publishable, res.result);
					} else MyAlert.show($scope.translate(res.result));
				});
			}
		}

		$scope.showStripeCards = function (paymethod, business, user, cb) {
			MyLoading.show($scope.translate('LOADING')+'...');
			Ordering.payments.cards.all({
				business_id: business.id,
				user_id: user.id,
				gateway: 'stripe'//paymethod.gateway
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					if (res.result.length == 0) {
						$scope.addStripeCard(paymethod, business, user, function () {
							$scope.showStripeCards(paymethod, business, user, cb);
						});
					} else {
						MyModal.showTemplate('templates/'+ADDONS.template+'/views/payment-choose-stripe.html', {
							scope: $scope,
							animation: 'slide-in-left',
							backdropClickToClose: false
						}).then(function(modal_cards) {
							modals.push(modal_cards);
							$scope.modalstripe = modal_cards;
							modal_cards.scope.changed = false;
							modal_cards.scope.cards = res.result;
							for (var i = 0; i < res.result.length; i++) {
								if (res.result[i].default) {
									modal_cards.scope.cur_card = res.result[i].id;
									break;
								}
							}
							modal_cards.scope.change = function (card) {
								modal_cards.scope.cur_card = card;
								modal_cards.scope.changed = true;
							}
							modal_cards.scope.add = function () {
								$scope.addStripeCard(paymethod, business, user, function () {
									MyLoading.show($scope.translate('LOADING')+'...');
									Ordering.payments.cards.all({
										business_id: business.id,
										user_id: user.id,
										gateway: 'stripe'
									}, function (res) {
										MyLoading.hide();
										modal_cards.scope.cards = res.result;
									});
								});
							}
							modal_cards.scope.accept = function () {
								if (!modal_cards.scope.cur_card) {
									MyAlert.show($scope.translate('SELECT_A_CARD'));
									return;
								}
								if (!modal_cards.scope.changed) {
									modal_cards.hide();
									modal_cards.remove();
									if (cb) cb(modal_cards.scope.cur_card);
								} else {
									MyLoading.show($scope.translate('LOADING')+'...');
									Ordering.payments.cards.default({
										business_id: business.id,
										user_id: user.id,
										gateway: 'stripe',//paymethod.gateway,
										card_id: modal_cards.scope.cur_card
									}, function (res) {
										MyLoading.hide();
										if (!res.error) {
											modal_cards.hide();
											modal_cards.remove();
											cb(modal_cards.scope.cur_card);
										} else MyAlert.show(res.result);
									});
								}
							}
							modal_cards.scope.hide = function () {
								modal_cards.hide();
								modal_cards.remove();
							}
							$scope.modalstripe.show();
						});
					}
				} else MyAlert.show(res.result);
			});
		}

		$scope.onPaymethod = function (paymethod, hide_model) {
			$scope.errors.paymethod.status = false;
			$scope.isPaypal = false;
			$scope.placing = false;
			$scope.gateway = paymethod.gateway;
			$scope.order.paymethod = paymethod;
			if (paymethod.gateway == 'stripe' || paymethod.gateway == 'stripe_connect') {
				$scope.showStripeCards(paymethod, gBusiness.getData(), $scope.buyer, function (token) {
					$scope.stripe_token = token;
				});
			} else if (paymethod.gateway == 'stripe_direct') {
				$scope.showCardStripe(paymethod.data.publishable, true, function (token) {
					$scope.stripe_token = token;
				});
			} else if (paymethod.gateway == 'stripe_redirect') {
				$scope.refreshCartData();
				$scope.showStripeRedirect(paymethod.data.publishable, $scope.buyer, $scope.cart_data, function (err, client_secret, token) {
					if (err) {
						MyAlert.show($scope.translate('ERROR_PAY_WITH_STRIPE_REDIRECT'));
					} else {
						$scope.stripe_token = token;
						if (ADDONS.striperedirect_payment.auto_place_order) {
							if (hide_model) {
								hide_model();
							}
							$scope.onPlace();
						}
					}
				});
			} else if (paymethod.gateway == 'authorize') {
				$scope.showPayDirectCard(function (card) {
					$scope.card_data = card;
				});
			} else {
				console.log("PAGO SIN PREREQUISITO");
			}
		}

		$scope.errors = {
			name: {
				status: false,
				message: null
			},
			middle_name: {
				status: false,
				message: null
			},
			lastname: {
				status: false,
				message: null
			},
			second_lastname: {
				status: false,
				message: null
			},
			email: {
				status: false,
				message: null
			},
			address: {
				status: false,
				message: null
			},
			zipcode: {
				status: false,
				message: null
			},
			mobile_phone: {
				status: false,
				message: null
			},
			address_notes: {
				status: false,
				message: null
			},
			internal_number: {
				status: false,
				message: null
			},
			coupon: {
				status: false,
				message: null
			},
			city: {
				status: false,
				message: null
			},
			dropdown_option: {
				status: false,
				message: null
			},
			paymethod: {
				status: false,
				message: null
			},
		};

		$scope.changeDropdownopton = function () {
			if (SEARCH_BY_ADDRESS) return;
			MyLoading.show($scope.translate('LOADING')+'...');
			var order = gOrder.getData();
			Ordering.business.get({
				id_or_slug: $scope.business.id,
				type: gOrder.getData().type,
				dropdownoption: $scope.buyer.dropdown_option_id
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					if (res.result.valid_service) {
						$scope.business = res.result;
						order.city = $scope.buyer.city_id;
						order.dropdownoption = $scope.buyer.dropdown_option_id;
						gOrder.setData(order);
						gBusiness.setData(res.result);
						$scope.refreshCartData();
					} else {
						$scope.buyer.city_id = order.city;
						$scope.buyer.dropdown_option_id = order.dropdownoption;
						if (gOrder.getData().type == 1) MyAlert.show($scope.translate('FRONT_SORRY_DELIVERY_OPTION'));
						else MyAlert.show($scope.translate('MOBILE_VERY_FAR_FOR_PICKUP'));
					}
				} else MyAlert.show(res.result);
			});
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
			});
		}

		$scope.onPlace = function () {
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

		$scope.pay = function (data, cb) {
			data.business_id = gBusiness.getData().id;
			if (['stripe', 'stripe_connect', 'stripe_direct'].indexOf($scope.order.paymethod.gateway) != -1 && BREAKER_FEATURES.STRIPE_UPDATED) {
				MyLoading.show($scope.translate('LOADING')+'...');
				Ordering.payments.confirm(data, function (res) {
					if (!res.error) {
						if (!res.result.requires_action) {
							MyLoading.hide();
							$scope.placing = false;
							cb(res.result.pay_data);
						} else {
							var stripe = Stripe($scope.order.paymethod.data.publishable);
							stripe.handleCardAction(
								res.result.client_secret
							).then(function(result) {
								if (result.error) {
									MyLoading.hide();
									$scope.placing = false;
									MyAlert.show($scope.translate(result.error.code.toUpperCase()));
								} else {
									Ordering.payments.capture({
										gateway: $scope.order.paymethod.gateway,
										source_id: result.paymentIntent.id,
										business_id: gBusiness.getData().id
									}, function (res) {
										MyLoading.hide();
										$scope.placing = false;
										if (!res.error) {
											if (!res.result.requires_action) {
												cb(res.result.pay_data);
											} else {
												MyAlert.show($scope.translate('ERROR_PAYMENTS_PAY'));
											}
										} else {
											MyAlert.show(res.result);
										}
									});
								}
							});
						}
					} else {
						MyLoading.hide();
						$scope.placing = false;
						MyAlert.show(res.result)
					}
				});
			} else {
				MyLoading.show($scope.translate('LOADING')+'...');
				Ordering.payments.pay(data, function (res) {
					MyLoading.hide();
					$scope.placing = false;
					if (!res.error) {
						cb(res.result);
					} else MyAlert.show(res.result)
				});
			}
		}

		$scope.place = function () {
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
			$scope.placeOrder(order);
		}
		
		$scope.placeOrder = function (order) {
			MyLoading.show($scope.translate('LOADING')+'...');
			Ordering.orders.add(order, function (res) {
				if (!res.error) {
					Analytics.trackTransaction(res.result.id, $scope.business.name, $scope.cart_data.total, $scope.business.tax, $scope.business.delivery_price, '', '', '', '');
					if (ADDONS.use_segment) {
						segment.track('Order Placed', {
							order: res.result.id,
							customer_email: res.result.customer.email,
							customer_phone:  res.result.customer.phone,
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
					if (ADDONS.web_template) {
						$state.go('main.confirm').then(function() {
							MyLoading.hide();
							$scope.placing = false;
						});
					} else {
						var registerBack = $ionicPlatform.registerBackButtonAction(function (event) {
							console.log('opened confirmation modal will disable back button on android.');
						}, 400);
						MyModal.showTemplate('templates/'+ADDONS.template+'/views/order-confirm-popup.html', {
							scope: $scope,
							animation: 'none',
							modalClose: false
						}).then(function(modal) {
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
			});
		}

		var checkWidth = null;
		$scope.initPaypal = function () {
			if (checkWidth != null) clearInterval(checkWidth);
			checkWidth = setInterval(function () {
				if ($(window).width() < 480) {
					$("iframe[name^='__paypal_checkout_sandbox_xcomponent-paypal-checkout-']").contents().find('.paypal-checkout-iframe-container').css("min-width", "95vw");
				}
			}, 150);
			$scope.isPaypal = true;
			$scope.isPaypalAuthorized = false;
			$('#paypal-button-container').empty();
			$scope.curOrderCode = $scope.business.id+'_'+$scope.buyer.id+'_'+$scope.generateRandom(10);
			$timeout(function () {
				MyLoading.show($scope.translate('LOADING')+'...');
				$timeout(function () {
					MyLoading.hide();
				}, 2000);
				paypal.Button.render({
					env: !$scope.order.paymethod.sandbox?'production':'sandbox',
					client: {
						sandbox:    $scope.order.paymethod.sandbox?$scope.order.paymethod.data.client_id:'',
						production: !$scope.order.paymethod.sandbox?$scope.order.paymethod.data.client_id:''
					},
					style: {
						size: 'responsive',
						color: 'gold',
						shape: 'rect',
						layout: 'vertical'
					},
					payment: function(data, actions) {
						return actions.payment.create({
							payment: {
								transactions: [
									{
										description: $scope.curOrderCode,
										amount: { 
											total: (['HUF','JPY','TWD'].indexOf(STRIPE_CURRENCY) != -1) ? $scope.cart_data.total.toFixed(0) : $scope.cart_data.total.toFixed(2), 
											currency: STRIPE_CURRENCY }
									}
								]
							}
						});
					},

					// Wait for the payment to be authorized by the customer

					onAuthorize: function(data, actions) {

						var products = gCart.getData().map(function(product){
							return {id: product.id, name: product.name, category_id: product.category_id, quantity: product.quantity}
						});
						console.log(products)
						errors = [];
						products.forEach(function(product, index){
							Ordering.products.get({
								id: product.id,
								category_id: product.category_id,
								business_id: gBusiness.getData().id
							}, function(res){
								if(res.result.inventoried && res.result.quantity < product.quantity){
									var errorMessage = $scope.translate('ERROR_ORDERS_SOLD_OUT');
									if (res.result.quantity === 0){
										errorMessage = errorMessage.slice(0, errorMessage.indexOf('|')).replace('{0}', '').replace('_product_', product.name);
									} else {
										errorMessage = errorMessage.slice(errorMessage.indexOf('|')+1).replace('[1, *]', '').replace('_product_', product.name).replace('_quantity_', res.result.quantity);
									};
									document.querySelector('#confirmButton').disabled = true;
									errors.push(errorMessage);
								};
								if (errors.length > 0 && index === products.length-1){
									return MyAlert.show(errors);
								};
							});
						});
						
						return actions.payment.get().then(function(data) {
							$scope.$apply(function () {
								$("#address_checkout").attr('disabled', true);
								$("#coupon").attr('disabled', true);
								$("#paymethods").find('*').attr('disabled', true);
								$("#driver-tip").find('*').attr('disabled', true);
								$("#city-field").attr('disabled', true);
								$("#neiborhood-field").attr('disabled', true);
								$scope.disableConfirmPayment = false;
								$scope.isPaypalAuthorized = true;
							});
							if (typeof cordova != 'undefined' && cordova && cordova.plugins && cordova.plugins.Keyboard) cordova.plugins.Keyboard.close();
							document.querySelector('#paypal-button-container').style.display = 'none';
							document.querySelector('#confirm').style.display = 'block';
							document.querySelector('#confirmButton').addEventListener('click', function() {
								if (!$scope.disableConfirmPayment) {
								// document.querySelector('#confirm').innerText = 'Loading...';
									$scope.$apply(function () {
										$scope.disableConfirmPayment = true;
									});
									MyLoading.show($scope.translate('MOBILE_FRONT_LOAD_LOADING'));
									document.querySelector('#confirm').disabled = true;

									return actions.payment.execute().then(function(data) {
										MyLoading.hide();
										if (data.state == 'approved') {
											$scope.$apply(function () {
												$scope.order.pay_data = data.id;
												$scope.place();
											});
										} else {
											MyAlert.show("Payment with Paypal could not be completed.");
											$scope.$apply(function () {
												$scope.disableConfirmPayment = false;
												$scope.placing = false;
											});
										}
									});
								}
							});
						});
					},

					onCancel: function(data, actions) {
						$scope.$apply(function () {
							if (!ADDONS.web_template) $scope.initPaypal();
						});
					},

					onError: function (err) {
						console.log(err);
					}
				}, '#paypal-button-container');
			}, 100);
		}

		$scope.showPayDirectCard = function(cb) {

			$scope.months = [
				{name:'MM', value:'', selected:'selected'},
				{name:'01', value:'01', selected:''},
				{name:'02', value:'02', selected:''},
				{name:'03', value:'03', selected:''},
				{name:'04', value:'04', selected:''},
				{name:'05', value:'05', selected:''},
				{name:'06', value:'06', selected:''},
				{name:'07', value:'07', selected:''},
				{name:'08', value:'08', selected:''},
				{name:'09', value:'09', selected:''},
				{name:'10', value:'10', selected:''},
				{name:'11', value:'11', selected:''},
				{name:'12', value:'12', selected:''},
			];

			var year = new Date().getFullYear();

			$scope.years = [];
			$scope.years.push({name: 'YY', value:'', selected: 'selected'});

			for (var i = 0; i < 12; i++) {
				$scope.years.push({ name: year+i, value: year+i, selected: '' });
			}
			MyModal.showTemplate('templates/'+ADDONS.template+'/views/pay-direct-card.html', {
				scope: $scope,
				backdropClickToClose: false,
				animation: 'slide-in-up'
			}).then(function(modal) {
				modals.push(modal);
				modal.show();
				modal.scope.card = {
					number: '',
					cvc: '',
					zip: '',
					month: '',
					year: ''
				};
				modal.scope.hide = function () {
					modal.hide();
					modal.remove();
				}
				modal.scope.ok = function () {
					modal.scope.hide();
					cb(modal.scope.card);
				}
			});
		}

		$scope.checkCoupon = function (change) {
			$scope.errors.coupon.status = false;
			$scope.errors.coupon.message = '';
			if(change == 'change') return;
			var auxCoupon = $scope.order.coupon == undefined ? '' : $scope.order.coupon;
			if ((auxCoupon.trim() == '' && !ADDONS.discount_code) || $scope.order.coupon == undefined || $scope.order.coupon == ''){
				$scope.errors.coupon.message = ''
				 return;
			}
			Ordering.offers.get({
				business_id: $scope.business.id,
				id: $scope.order.coupon
			}, function (res) {
				if (!res.error && res.result) {
					if (res.result.enabled) {
						var aux = res.result.rate_type == 1?$scope.cart_data.subtotal*res.result.rate/100:res.result.rate;
						if (aux < $scope.cart_data.subtotal && $scope.cart_data.subtotal >= res.result.minimum) {
							$scope.cart_data.discount = aux;
							$scope.order.offer = res.result;
							$scope.order.coupon = res.result.coupon;
						} else {
							$scope.errors.coupon.status = true;
							$scope.errors.coupon.message = $scope.translate('COUPON_INVALID_MIN').replace('_min_', $scope.parsePrice(res.result.minimum));
						}
						$scope.refreshCartData();
					}
				} else {
					$scope.errors.coupon.status = true;
					$scope.errors.coupon.message = $scope.translate('COUPON_INVALID');
				}
			});
		}

		$scope.openPaymethods = function () {
			MyModal.showTemplate('templates/'+ADDONS.template+'/views/payment-select-popup.html', {
				scope: $scope,
				animation: 'slide-in-left',
				backdropClickToClose: false
			}).then(function(modal) {
				modals.push(modal);
				modal.show();
				modal.scope.hide = function () {
					modal.hide();
					modal.remove();
				}
			});
		}

		$scope.onGoToHome = function() {
			$ionicHistory.clearHistory();
			$ionicHistory.clearCache().then(function(){ $state.go(app_states.homeScreen)});
			if (!ADDONS.web_template) $state.go(app_states.homeScreen);
		};

		$scope.initVariables = function () {
			if (ADDONS.web_template) fixHeight('.form.full');
		}

		$scope.onClickDetail = function ()
		{
			$state.go('ordering.checkOut');
		};

		$scope.onSocialShare = function (num) {
			var url = document.location.origin+(WEB_ADDONS.remove_hash?'':'/#')+'/'+$scope.business.slug;
			if (num == 1) {         // Facebook
				window.plugins.socialsharing.shareViaFacebookWithPasteMessageHint($scope.translate('MOBILE_FACEBOOK_SHARED_MESSAGE'), null, null, 'Paste message!', function() {
				}, function(error) {});
			}else if (num == 2) {   // Twitter
				window.plugins.socialsharing.shareViaTwitter($scope.translate('MOBILE_FACEBOOK_SHARED_MESSAGE'), null, null, function() {
				}, function(error) {});
			}else {                 // Common Share
				window.plugins.socialsharing.share($scope.translate('MOBILE_FACEBOOK_SHARED_MESSAGE'), null, null, '', function() {
				}, function(error) {});
			}
		};
	   
		$scope.onAutoCompleteAddress = function() {
			setTimeout(function() {
				if (typeof document.getElementsByClassName('backdrop')[0] != 'undefined' &&
					typeof document.getElementsByClassName('pac-container')[0] != 'undefined'){
					for (var i = 0; i < document.getElementsByClassName('pac-container').length; i++){
						document.getElementsByClassName('pac-container')[i].setAttribute('data-tap-disabled', true);
					}
					for (i = 0; i < document.getElementsByClassName('backdrop').length; i++){
						document.getElementsByClassName('backdrop')[i].setAttribute('data-tap-disabled', true);
					}
				}
			}, 100);
		}

		$scope.backEditOrder = function(){
			var business = gBusiness.getData();
    		$state.go('main.business', { business: business.slug });
		}

		Extensions.runAction('enter_checkout_view', null, $scope);

		initView();

		$scope.onBlurAmount = function(e) {
			$scope.order.cash = e.currentTarget.value;
		}

		/*newfunction-finalCheckOutCtrl*/
	});

	_controllers.controller('confirmCtrl',function($scope, $rootScope, $timeout, $state, Analytics, gCreateOrderBuyer, gConfirm, gCart, Ordering, MyModal, MyLoading/*newconfirmCtrl*/){
		//console.log($rootScope.confirmData);
		//if ($scope.reload)location.reload();
		localStorageApp.removeItem('order_code');
		Analytics.set('&dp', 'Confirm');
		Analytics.pageView();
		$scope.order = gConfirm.getData();
		if (!$scope.order.id) return $state.go(app_states.homeScreen);
		$scope.create_order = localStorageApp.getItem(STORE.CREATE_ORDER) != null;
		/*newvariable-confirmCtrl*/	
		$scope.getLanguage(function (err, list, dictionary) {
			$rootScope.pageTitle = $scope.translate('CONFIRM_ORDER')+$scope.order.id;
			$scope.calcTotalProduct = function (product) {
				console.warn('The Function "calcTotalProduct" is deprecated please change to "Order.getProductsTotal(product)" in your theme')
				return $scope.Order.getProductsTotal(product)
			}
		
			$scope.calcDriverTip = function (order) {
				console.warn('The Function "calcDriverTip" is deprecated please change to "Order.getDriverTip(order)" in your theme')
				return $scope.Order.getDriverTip(order)
			}
		
			$scope.calcTax = function (order) {
				console.warn('The Function "calcTax" is deprecated please change to "Order.getTax(order)" in your theme')
				return $scope.Order.getTax(order)
			}
		
			$scope.calcServiceFee = function (order) {
				console.warn('The Function "calcServiceFee" is deprecated please change to "Order.getServiceFee(order)" in your theme')
				return $scope.Order.getServiceFee(order)
			}
		
			$scope.calcSubtotal = function (order) {
				console.warn('The Function "calcSubtotal" is deprecated please change to "Order.getSubtotal(order)" in your theme')
				return $scope.Order.getSubtotal(order)
			}
		
			$scope.calcTotalOrder = function (order) {
				console.warn('The Function "calcTotalOrder" is deprecated please change to "Order.getTotal(order)" in your theme')
				return $scope.Order.getTotal(order)
			}
			/*$scope.MLanguages.ORDER_IN_BUSINESS = "Order in _business";
			$scope.MLanguages.ORDER_IN_BUSINESS_WITH_APPNAME = "Order in _business with Orderingapp";*/
			$scope.cubside_site = '';
			$scope.sendCurbside = function (site) {
				if (!site) return;
				MyLoading.show($scope.translate('LOADING')+'...');
				Ordering.orders.messages.add({
					order_id: $scope.order.id,
					type: 2,
					comment: $scope.translate('IM_ON_SPOT_NUMBER').replace('_site_', site),
					file: null,
					can_see: '0,2,3'
				}, function (res) {
					MyLoading.hide();
					if (!res.error) {

					} else MyAlert.show(res.result);
				});
			}
			$timeout(function(){
				addthis_share = {
					url: document.location.origin+(WEB_ADDONS.remove_hash?'':'/#')+'/'+$scope.order.business.slug,
					title: $scope.translate('ORDER_IN_BUSINESS').replace("_business", $scope.order.business.name),
					description: $scope.translate('ORDER_IN_BUSINESS_WITH_APPNAME').replace("_business", $scope.order.business.name),
					media: $scope.order.business.header
				}
				function loadAddthis() {
					if (typeof addthis == 'undefined' || typeof addthis.layers.refresh == 'undefined') {
						setTimeout(function() {
							loadAddthis();
						}, 100);
					} else {
						addthis.layers.refresh();
						addthis_share = {
							url: document.location.origin+(WEB_ADDONS.remove_hash?'':'/#')+'/'+$scope.order.business.slug,
							title: $scope.translate('ORDER_IN_BUSINESS').replace("_business", $scope.order.business.name),
							description: $scope.translate('ORDER_IN_BUSINESS_WITH_APPNAME').replace("_business", $scope.order.business.name),
							media: $scope.order.business.header
						}
					}
				}
				loadAddthis();
			}, 300);

		});

		$scope.print = function () {
			window.print();
		}

		$scope.newCreateOrder = function () {
			// localStorageApp.removeItem(STORE.CREATE_ORDER);
			gCreateOrderBuyer.setData({});
			gCart.setData([]);
			$state.go('main.business-createorder', { 'business': $scope.order.business.slug });
		}

		setTimeout(function () {
			window.scrollTo(0, 0);
		}, 100);

		Extensions.runAction('enter_confirm_view', null, $scope);

		/*newfunction-confirmCtrl*/
	});

	_controllers.controller('notfoundCtrl',function($scope, $rootScope, Analytics/*newnotfoundCtrl*/){
		Analytics.set('&dp', 'Not Found');
		Analytics.pageView();

		/*newvariable-notfoundCtrl*/

		$scope.getLanguage(function (err, list, dictionary) {
			$rootScope.pageTitle = $scope.translate('PAGE_NOT_FOUNT');
		});

		Extensions.runAction('enter_notfount_view', null, $scope);

		/*newfunction-notfoundCtrl*/
	})

	_controllers.controller('forgotPasswordCtrl',function($scope, $rootScope, MyAlert, Ordering/*newforgotPasswordCtrl*/){
		$scope.forgot = {};

		/*newvariable-forgotPasswordCtrl*/	

		$scope.getLanguage(function (err, list, dictionary) {
			$rootScope.pageTitle = $scope.translate('MOBILE_FRONT_VISUALS_FORGOT_PASSWORD');
			Extensions.runAction('after_forgot_password_view', $scope.forgot, $scope);
		});

		$scope.recoverPassword = function () {
			if (!$scope.forgot.email || $scope.forgot.email.trim() == '') MyAlert.show($scope.translate('EMAIL_IS_REQUIRED'));
			else {
				Ordering.users.forgot({
					email: $scope.forgot.email
				}, function (res) {
					if (!res.error) {
						MyAlert.show($scope.translate('MOBILE_PASSWORD_SENT_TO_EMAIL'));
					} else {
						MyAlert.show(res.result);
					}
				});
			}
		};
		Extensions.runAction('enter_forgot_password_view', null, $scope);
		/*newfunction-forgotPasswordCtrl*/
	})

	_controllers.controller('resetPasswordCtrl',function($scope, $rootScope, $state, $location, MyAlert, Ordering/*newresetPasswordCtrl*/){
		/*newvariable-resetPasswordCtrl*/
		$scope.reset = {
			password: '',
			confirm: ''
		};
		$scope.getLanguage(function (err, list, dictionary) {
			$rootScope.pageTitle = $scope.translate('MOBILE_RESET_PASSWORD');
			Extensions.runAction('after_reset_password_view', $scope.reset, $scope);
		});
		$scope.resetPassword = function () {
			if ($scope.reset.password != $scope.reset.confirm) return MyAlert.show($scope.translate('NOT_MATCH_PASSWORD'));
			Ordering.users.reset({
				password: $scope.reset.password,
				code: $location.search().code,
				random: $location.search().random
			}, function (res) {
				if (!res.error) {
					MyAlert.show($scope.translate('PASSWORD_SENT')).then(function () {
						$state.go('main.login');
					});
				} else MyAlert.show(res.result);
			});

		}

		Extensions.runAction('enter_reset_password_view', null, $scope);
		/*newfunction-resetPasswordCtrl*/
	})

	_controllers.controller('checkDetailCtrl',function($scope, $ionicLoading, $compile/*newcheckDetailCtrl*/){
		/*newvariable-checkDetailCtrl*/		
		/*newfunction-checkDetailCtrl*/
	})

	_controllers.controller('MapCtrl', function($scope, $ionicLoading, $compile/*newMapCtrl*/) {
		/*newvariable-MapCtrl*/		
		/*newfunction-MapCtrl*/
	})

	_controllers.controller('MapCtrl2', function($scope, $ionicLoading, $compile/*newMapCtrl2*/) {
		/*newvariable-MapCtrl2*/		
		/*newfunction-MapCtrl2*/
	})

	_controllers.directive('errSrc', function() {
		return {
			link: function(scope, element, attrs) {
				element.bind('error', function() {
					if (attrs.src != attrs.errSrc) {
						attrs.$set('src', attrs.errSrc);
					}
				});
			}
		}
	})

	_controllers.directive('imageonload', function() {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				element.bind('load', function() {
					//alert('image is loaded');
					AVATAR_LOAD = true;
				});
				element.bind('error', function(){
					//alert('image could not be loaded');
					scope.$on('$ionicView.loaded',function(){
						//alert("");
					});
					AVATAR_LOAD = false;
				});
			}
		};
	})

	_controllers.directive('myRepeat', [ '$animate', function($animate) {

		var updateScope = function(scope, index, valueIdentifier, value, key, arrayLength) {
			scope[valueIdentifier] = value;
			scope.$index = index;
			scope.$first = (index === 0);
			scope.$last = (index === (arrayLength - 1));
			scope.$middle = !(scope.$first || scope.$last);
			scope.$odd = !(scope.$even = (index&1) === 0);
		};

		return {
			restrict: 'A',
			transclude: 'element',
			compile: function($element, $attrs) {

				var expression = $attrs.myRepeat;

				var match = expression.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)?\s*$/);

				var valueIdentifier = match[1];
				var collection = match[2];

				return function($scope, $element, $attr, ctrl, $transclude) {

					$scope.$watchCollection(collection, function(collection) {
						var index, length,
							previousNode = $element[0],
							collectionLength,
							key, value;

						collectionLength = collection.length;

						for (index = 0; index < collectionLength; index++) {
							key = index;
							value = collection[key];

							$transclude(function(clone, scope) {
								$animate.enter(clone, null, angular.element(previousNode));
								previousNode = clone;
								updateScope(scope, index, valueIdentifier, value, key, collectionLength);
							});

						}
					});

				}
			}
		}

	}])
	/*.directive('select', function($interpolate) {
		return {
			restrict: 'E',
			require: 'ngModel',
			link: function(scope, elem, attrs, ctrl) {
				var defaultOptionTemplate;
				scope.defaultOptionText = attrs.defaultOption || 'Please select';
				defaultOptionTemplate = '<option value="" disabled selected style="display: none;">{{defaultOptionText}}</option>';
				elem.prepend($interpolate(defaultOptionTemplate)(scope));
			}
		};
	})*/
	_controllers.directive('starRating', function () {
		return {
			restrict: 'A',
			template: '<ul class="rating">' +
			'<li ng-repeat="star in stars" ng-class="star">' +
			'<span class="icon ion-star"></span>' +
			'</li>' +
			'</ul>',
			scope: {
				ratingValue: '=',
				max: '='
			},
			link: function (scope, elem, attrs) {
				var aux = JSON.stringify(scope.ratingValue);
				scope.stars = [];
				for (var i = 0; i < scope.max; i++) {
					scope.stars.push({
						filled: i < scope.ratingValue,
						unfilled: i >= scope.ratingValue
					});
				}
			}
		}
	})
	_controllers.directive('onErrorSrc', function() {
		return {
			link: function(scope, element, attrs) {
				element.bind('error', function() {
					element.remove();
					$('#'+attrs.onErrorSrc).remove();
				});
			}
		}
	})
	_controllers.filter('safeHtml', function ($sce) {
		return function (val) {
			return $sce.trustAsHtml(val);
		};
	})

	_controllers.filter('separator', function () {
		return function (val) {
			var number = ""+val;
			if (number.indexOf('.')) number = number.replace('.', DECIMAL.separator);
			else if (number.indexOf(',')) number = number.replace(',', DECIMAL.separator);
			return number;
		};
	})
	_controllers.filter('decimal', function () {
		return function (val) {
			var number = (val*1).toFixed(DECIMAL.length);
			return number;
		};
	})
	_controllers.filter('thousand', function () {
		return function (val) {
			var number = ""+val;
			number_parts = number.split(DECIMAL.separator);
			number_parts[0] = number_parts[0].replace(/(.)(?=(\d{3})+$)/g, '$1'+THOUSAND_SEPARATOR)
			return number = number_parts.join(DECIMAL.separator);
			
		};
	})

	_controllers.filter('bfilter', function() {
		return function(input, search) {
			if (search == '' || !search) return input;
			var output = [];
			for (var i = 0; i < input.length; i++) {
				if ((input[i].name && input[i].name.toLowerCase().indexOf(search.toLowerCase()) >= 0) 
					|| (input[i].about && input[i].about.toLowerCase().indexOf(search.toLowerCase()) >= 0)
					|| (input[i].description && input[i].description.toLowerCase().indexOf(search.toLowerCase()) >= 0)) {
					output.push(input[i]);
				} else if (input[i].categories) {
					for (var j = 0; j < input[i].categories.length; j++) {
						if (input[i].categories[j].name && input[i].categories[j].name.toLowerCase().indexOf(search.toLowerCase()) >= 0) {
							output.push(input[i]);
							break;
						}
					}
				}
			}
			return output;
		}
	});

	_controllers.directive('format', ['$filter', function ($filter) {
		return {
			require: '?ngModel',
			link: function (scope, elem, attrs, ctrl) {
				if (!ctrl) return;

				ctrl.$formatters.unshift(function (a) {
					if (ctrl.$modelValue == '') return ctrl.$modelValue;
					return parseFloat(ctrl.$modelValue).toFixed(DECIMAL.length);
				});

				// ctrl.$parsers.unshift(function (viewValue) {
				// 	console.log(!isNaN(ctrl.$modelValue), ctrl.$modelValue.charAt(0) != '.');
				// 	if (!isNaN(ctrl.$modelValue) && ctrl.$modelValue.charAt(0) != '.') {
				// 		console.log($filter(attrs.format)(viewValue, scope.DECIMAL.length));
				// 		elem.val($filter(attrs.format)(viewValue, scope.DECIMAL.length));
				// 		return $filter(attrs.format)(viewValue, scope.DECIMAL.length);
				// 	} else return viewValue;
				// });
			}
		};
	}]);

	//addnewcontroller

	_controllers.directive('ngPreload', function() {
		return {
			restrict: 'A',
			link: function(scope, element, attr) {
				element.on('load', function() {
					element[0].style.display = 'inline';
					if (document.getElementById(attr.ngPreload)) {
						document.getElementById(attr.ngPreload).style.display = 'none';
					}
				});
				element.on('error', function() {
				});
				scope.$watch('ngSrc', function() {
					element[0].style.display = 'none';
				});
			}
		};
	});

	var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
	if (ADDONS.web_template && isChrome) {
		var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
		var version = parseInt(raw[2]);
		if (version >= 53) {
			function avoidTap() {
				return {
					restrict: 'A',
					link: function (scope, elem) {
						elem.attr('data-tap-disabled', 'true');
					},
				};
			}
			_controllers.directive('selectContent', avoidTap);
		}
	}
	
	setInterval(function () {
		var pac = $('.pac-container:not([data-tap-disabled])');
		if (pac.length > 0) {
			for (var i = 0; i < pac.length; i++) {
				$(pac[i]).attr('data-tap-disabled', 'true');
			}
		}
	}, 200);

	_controllers.controller('customCtrl', function($scope, $rootScope) {
		
	});

	_controllers.directive('formAutofillFix', function() {
		return function(scope, elem, attrs) {
			elem.prop('method', 'POST');
			if (attrs.ngSubmit) {
				setTimeout(function() {
					elem.unbind('submit').submit(function(e) {
						e.preventDefault();
						elem.find('input, textarea, select').trigger('input').trigger('change').trigger('keydown');
						scope.$apply(attrs.ngSubmit);
					});
				}, 0);
			}
		};
	});

	_controllers.directive('compile', ['$compile', function ($compile) {
		return function(scope, element, attrs) {
			scope.$watch(function(scope) {
				return scope.$eval(attrs.compile);
			},
			function(value) {
				element.html(value);
				$compile(element.contents())(scope);
			});
		};
	}])
	_controllers.directive('avoidAutofill', function(){
		return function(scope, element, attrs) {
			var interval = setInterval(function(){
				if (element.context.attributes.autocomplete && element.context.attributes.autocomplete.value == 'new-field') clearInterval(interval)
				element.attr('autocomplete', 'new-field')
			}, 500)
		}
	})

	_controllers.directive('select',function(){
		return {
			restrict: 'E',
			scope: false,
			link: function (scope, ele) {
				ele.on('touchmove touchstart',function(e){
					e.stopPropagation();
				})
			}
		}
	})

	//custom_page_newcontroller
