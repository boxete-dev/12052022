var APP_ID = (validProp(config_builder.app_id)) ? config_builder.app_id : 'orderingapp';
var FRONT_VERSION = (validProp(config_builder.front_version)) ? config_builder.front_version : '__VERSION__';
var API_URL = (validProp(config_builder.api_url)) ? config_builder.api_url : 'https://apiv4-staging.ordering.co/';
var API_VERSION = (validProp(config_builder.api_version)) ? config_builder.api_version : 'v400';
var SOCKET_URL = (validProp(config_builder.socket_url)) ? config_builder.socket_url : 'https://socket-staging.ordering.co/';
var API_PROJECT_NAME = (validProp(config_builder.api_project_name)) ? config_builder.api_project_name : 'demo';
var APP_ID_IONIC_CLOUD = (validProp(config_builder.ionic_cloud)) ? config_builder.ionic_cloud : 'e25d2da0';
var ONE_SIGNAL_ID = (validProp(config_builder.onesignal_id)) ? config_builder.onesignal_id : 'f4d9d806-882e-4b96-b7d1-4f3e478e8726';
var GCM_DEVICE_TOKEN = '';
var GM_API_KEY = '';
var SEARCH_BY_ADDRESS = (validProp(config_builder.search_by_address)) ? config_builder.search_by_address : true;
var METERS_TO_CHANGE_ADDRESS = (validProp(config_builder.meters_to_change_address)) ? config_builder.meters_to_change_address : 30;
var TIME_FORMAT_24 = (validProp(config_builder.time_format_24h)) ? config_builder.time_format_24h : true;
var DISTANCE_UNIT_KM = (validProp(config_builder.distance_unit_km)) ? config_builder.distance_unit_km : true;
var BUSINESS_ID = (validProp(config_builder.single_business_id)) ? config_builder.single_business_id : '7'; //Only single business
var FB_APP_ID = (validProp(config_builder.facebook_id)) ? config_builder.facebook_id : '2292687467631621';//'225514411127555';
var WELCOME_FULLSCREEN = (validProp(config_builder.welcome_fullscreen)) ? config_builder.welcome_fullscreen : false;
var CHECK_ADDRESS = (validProp(config_builder.check_address)) ? config_builder.check_address : true;
var DEFAULT_ORDER_TYPE = (validProp(config_builder.default_order_type)) ? config_builder.default_order_type : 'delivery';
var PRODUCTS_AS_LIST = (validProp(config_builder.products_as_list)) ? config_builder.products_as_list : true;
var DEBUG_MODE =  true;
var CURRENCY_POSITION = (validProp(config_builder.currency_position)) ? config_builder.currency_position : 'right';
var MAX_DAYS_PREORDER = (validProp(config_builder.max_days_preorder)) ? parseInt(config_builder.max_days_preorder) : 6;
var COUNTRY_AUTOCOMPLETE = (validProp(config_builder.country_autocomplete)) ? config_builder.country_autocomplete : "*";
var CLOSEST_BUSINESS = (validProp(config_builder.closest_business)) ? config_builder.closest_business : false;
var SHOW_TUTORIAL = (validProp(config_builder.show_tutorial)) ? config_builder.show_tutorial : false;
var FULL_ADDRESS_ONLY = (validProp(config_builder.full_address_only)) ? config_builder.full_address_only : false;
var SHOW_INAPP_NOTIFICATIONS = true;
var TUTORIAL_SUPER = (validProp(config_builder.tutorial_super)) ? config_builder.tutorial_super : true;
var TUTORIAL_BUSINESS = (validProp(config_builder.tutorial_business)) ? config_builder.tutorial_business : true;
var GOOGLE_AUTOCOMPLETE_SELECTION_REQUIRED = (validProp(config_builder.google_autocomplete_selection_required)) ? config_builder.google_autocomplete_selection_required : true;
var SUPPORT_PRO_PACKAGE = (validProp(config_builder.support_pro_package)) ? config_builder.support_pro_package : true;
var SUPPORT_ADVANCED_PACKAGE = (validProp(config_builder.support_advanced_package)) ? config_builder.support_advanced_package : true;
var SUPPORT_SECTION = (validProp(config_builder.support_section)) ? config_builder.support_section : false;
var ALLOW_USER_SELF_DELETE_ACCOUNT = (validProp(config_builder.remove_user_by_himself)) ? config_builder.remove_user_by_himself : true;
var MAX_PRODUCT_AMOUNT = (validProp(config_builder.max_product_amount)) ? config_builder.max_product_amount : 99;
//newconstant

var NEW_FEATURES = {
    ORDER_MANAGER: (validProp(config_builder.new_features_order_manager)) ? config_builder.new_features_order_manager : true,
    //PREORDER:  validProp(config_builder.new_features_preorder) ? config_builder.new_features_preorder: true,
    PREORDER: false,
    MULTI_ADDRESS: (validProp(config_builder.new_features_multi_address) ? config_builder.new_features_multi_address : true) && SEARCH_BY_ADDRESS,
    BUSINESS_PAGE: validProp(config_builder.new_features_business_page) ? config_builder.new_features_business_page : true,
    FLEX_HEIGHT: (validProp(config_builder.new_features_flex_height) ? config_builder.new_features_flex_height : true) || config_builder.new_features_business_page,
    CUSTOM_HOME_CONTENT: (validProp(config_builder.custom_home_content)) ? config_builder.custom_home_content : false,
    QUICK_PRODUCT: validProp(config_builder.new_features_add_quick_product) ? config_builder.new_features_add_quick_product : false,
    SHARED_MENUS: validProp(config_builder.shared_menus) ? config_builder.shared_menus : false,
    ONLY_EDITOR: (validProp(config_builder.only_editor) ? config_builder.only_editor : false) || (validProp(config_builder.enabled_multiproject) ? config_builder.enabled_multiproject : false),
    ENABLE_MULTIPROJECT: validProp(config_builder.enabled_multiproject) ? config_builder.enabled_multiproject : false,
    NEW_BUSINESS_PAGINATION: validProp(config_builder.business_pagination) ? config_builder.business_pagination : false,
    API_BUSINESS_LISTING_V2: validProp(config_builder.api_business_listing_v2) ? config_builder.api_business_listing_v2 : false,
    DISABLE_BUSINESS_LOCAL_STORAGE: validProp(config_builder.disable_business_local_storage) ? config_builder.disable_business_local_storage : true,
};

var NEW_ADDONS = {
    UPSELLING: validProp(config_builder.addons.upselling) ? config_builder.addons.upselling : false,
    REORDER: validProp(config_builder.addons.reorder) ? config_builder.addons.reorder : true,
    INVOICE_MANAGER: validProp(config_builder.addons.invoice_manager) ? config_builder.addons.invoice_manager : false,
    HEATMAP: validProp(config_builder.addons.heatmap) ? config_builder.addons.heatmap : false
}

var SETTINGS = {};

var BREAKER_FEATURES = {
    STRIPE_UPDATED: validProp(config_builder.breaker_features_stripe_updated) ? config_builder.breaker_features_stripe_updated : true,
}

var PAGINATIONS = {
    business_products: {
        first: 50,
        page: 50
    }
}

window.onerror = function (errorMsg, url, lineNumber) {
    return !DEBUG_MODE;
}
var THOUSAND_SEPARATOR = ',';
var DECIMAL = { // They are no longer configured from the builder, by default they are "Point" and "2"
    separator: '.',
    length: 2
}

var DRIVER_TIP = (validProp(config_builder.user_driver_tip)) ? config_builder.user_driver_tip : true;
var DRIVER_TIPS = {
    tip_1: (validProp(config_builder.driver_tip_1)) ? parseInt(config_builder.driver_tip_1) : 0,
    // tip_2: (validProp(config_builder.driver_tip_2)) ? parseInt(config_builder.driver_tip_2) : 10,
    tip_3: (validProp(config_builder.driver_tip_3)) ? parseInt(config_builder.driver_tip_3) : 15,
    tip_4: (validProp(config_builder.driver_tip_4)) ? parseInt(config_builder.driver_tip_4) : 20,
    tip_5: (validProp(config_builder.driver_tip_5)) ? parseInt(config_builder.driver_tip_5) : 25
};

var ADDRESS = {
    street: (validProp(config_builder.default_address_street)) ? config_builder.default_address_street : '5th Ave, New York, NY, EE. UU.',
    latitude: (validProp(config_builder.default_address_latitude)) ? parseFloat(config_builder.default_address_latitude) : 40.7750534,
    longitude: (validProp(config_builder.default_address_longitude)) ? parseFloat(config_builder.default_address_longitude) : -73.965151
}

var STATE = {                   // App State
    PROFILE: 'userProfileState',
    MY_ORDER: 'myOrderState',
    MY_CARD: 'myCardState',
    ORDERING: 'orderingState',
    MENU: 'homeScreenState',
    NO_INTERNET: 'NoInternetConnection',
    STATE_OK: 'ConnectionOk',
    SIGNUP_BUSINESS: 'signUpBusinessState',
    CART_DETAIL_BACK: 'cartDetailBack'
};

var VALUE_TYPE = {
    INTEGER: 'integer',
    DECIMAL: 'decimal',
    BOOLEAN: 'boolean',
    TEXT: 'text',
    JSON: 'json'
}

//var CURRENCY = (validProp(config_builder.currency)) ? (config_builder.currency) : '$';             // Currency of Current Business
var USER_STATE = 'SIGN_UP';     // State of User's such as Login, SignUp, Guest
var STRIPE_CURRENCY = (validProp(config_builder.stripe_currency)) ? (config_builder.stripe_currency) : 'EUR';

var AVATAR_LOAD = true;
var G_NETSTATE = 'OK';
var LOGIN_STATE = false;

var STORE = {
    LANG: 'lang_id',
    LANG_CODE: 'lang_code',
    LANG_LIST: 'lang_list',
    LANG_RESET: 'lang_reset',
    RTL: 'lang_rtl',
    DICTIONARY: 'dictionary',
    USER: 'user',
    USER_ID: 'user_id',
    TOKEN: 'token',
    LOGIN: 'login_state',
    FROM_SEARCH: 'from_search',
    CART: 'cart',
    BUSINESS: 'business',
    ORDER: 'order',
    CONFIRM: 'confirm',
    NEAR_SERVICE: 'near_service',
    EDIT_MODE: 'edit_mode',
    CREATE_ORDER: 'create_order',
    TUTORIAL: 'tutorial',
    APP_VERSION: 'app_version',
    PREORDER_BUSINESS: 'preorder_business',
    MY_LAT_LNG: 'my_lat_lng',
    MY_NEIGHBOURHOOD: 'my_neighbourhood',
    MY_PAYDETAILS: 'my_paydetails',
    MY_ADDRESS: 'my_address',
    ALL_BUSINESS: 'all_business',
    CUR_RESTAURANT: 'cur_restaurant',
    ORDER_DATA: 'order_data',
    PREORDER: 'preorder',
    BUFFER_DISHES: 'buffer_dishes',
    CONFIRM_DATA: 'confirm_data',
    MY_STRIPE_CARD: 'my_stripe_card',
    CREATE_ORDER_BUYER: 'create_order_buyer',
    ADDRESS: 'address',
    PROJECT: 'project',
};

// Updates
UPDATE_BACKGROUND = (validProp(config_builder.background_update)) ? config_builder.background_update : false;
RESET_AFTER_UPDATE = (validProp(config_builder.reset_after_update)) ? config_builder.reset_after_update : false;
ENABLE_UPDATE = (validProp(config_builder.enable_update)) ? config_builder.enable_update : false;

//ADDONS
var ADDONS = {
    multilanguage: (validProp(config_builder.addons.multilanguage)) ? config_builder.addons.multilanguage : true,
    pickup: (validProp(config_builder.addons.pickup)) ? config_builder.addons.pickup : true,
    eatin: (validProp(config_builder.addons.eatin)) ? config_builder.addons.eatin : true,
    curbside: (validProp(config_builder.addons.curbside)) ? config_builder.addons.curbside : true,
    driver_thru: (validProp(config_builder.addons.driver_thru)) ? config_builder.addons.driver_thru : true,
    discount_offer: (validProp(config_builder.addons.discount_offer)) ? config_builder.addons.discount_offer : true,
    discount_code: (validProp(config_builder.addons.discount_code)) ? config_builder.addons.discount_code : true,
    stripe_payment: (validProp(config_builder.addons.stripe_payment)) ? config_builder.addons.stripe_payment : true,
    advanced_search: (validProp(config_builder.addons.advanced_map_search)) ? config_builder.addons.advanced_map_search : false,
    drivers_tracking: (validProp(config_builder.addons.drivers_tracking)) ? config_builder.addons.drivers_tracking : true,
    single_business: (validProp(config_builder.addons.single_business)) ? config_builder.addons.single_business : false,
    web_template: (validProp(config_builder.addons.web_template)) ? config_builder.addons.web_template : true,
    template: (validProp(config_builder.addons.template)) ? config_builder.addons.template : 'web',
    theme_style: (validProp(config_builder.addons.theme_style)) ? config_builder.addons.theme_style : 'none',
    facebook_login: (validProp(config_builder.addons.facebook_login)) ? config_builder.addons.facebook_login : true,
    guest_login: (validProp(config_builder.addons.guest_login)) ? config_builder.addons.guest_login : true,
    authorize_payment: (validProp(config_builder.addons.authorize_payment)) ? config_builder.addons.authorize_payment : true,
    stripedirect_payment: (validProp(config_builder.addons.stripedirect_payment)) ? config_builder.addons.stripedirect_payment : true,
    paypal_express_payment: (validProp(config_builder.addons.paypal_express_payment)) ? config_builder.addons.paypal_express_payment : true,
    google_analytics_id: (validProp(config_builder.addons.google_analytics_id)) ? config_builder.addons.google_analytics_id : 'UA-51635411-4',
    google_analytics_debug: (validProp(config_builder.addons.google_analytics_debug)) ? config_builder.addons.google_analytics_debug : false,
    powered_by_ordering: (validProp(config_builder.addons.powered_by_ordering)) ? config_builder.addons.powered_by_ordering : true,
    featured_business: (validProp(config_builder.addons.featured_business)) ? config_builder.addons.featured_business : true,
    featured_products: (validProp(config_builder.addons.featured_products)) ? config_builder.addons.featured_products : true,
    order_reviews: (validProp(config_builder.addons.order_reviews)) ? config_builder.addons.order_reviews : true,
    user_reviews: (validProp(config_builder.addons.user_reviews)) ? config_builder.addons.user_reviews : true,
    bot_side_menu: (validProp(config_builder.addons.bot_side_menu)) ? config_builder.addons.bot_side_menu : false,
    editor_gprs_printer: (validProp(config_builder.addons.editor_gprs_printer)) ? config_builder.addons.editor_gprs_printer : true,
    preorder: (validProp(config_builder.addons.preorder)) ? config_builder.addons.preorder : true,
    create_order: (validProp(config_builder.addons.create_order)) ? config_builder.addons.create_order : true, //Reviewing
    editor_channel_modal_widget: (validProp(config_builder.addons.editor_channel_modal_widget)) ? config_builder.addons.editor_channel_modal_widget : true,
    editor_channel_inline: (validProp(config_builder.addons.editor_channel_inline)) ? config_builder.addons.editor_channel_inline : true,
    stripeconnect_payment: (validProp(config_builder.addons.stripeconnect_payment)) ? config_builder.addons.stripeconnect_payment : true,
    striperedirect_payment: {
        enable: (validProp(config_builder.addons.striperedirect_payment)) ? config_builder.addons.striperedirect_payment : true,
        gateways: {
            bancontact: (validProp(config_builder.addons.striperedirect_payment_bancontact)) ? config_builder.addons.striperedirect_payment_bancontact : true,
            alipay: (validProp(config_builder.addons.striperedirect_payment_alipay)) ? config_builder.addons.striperedirect_payment_alipay : false,
            giropay: (validProp(config_builder.addons.striperedirect_payment_giropay)) ? config_builder.addons.striperedirect_payment_giropay : false,
            ideal: (validProp(config_builder.addons.striperedirect_payment_ideal)) ? config_builder.addons.striperedirect_payment_ideal : false,
        },
        auto_place_order: (validProp(config_builder.addons.striperedirect_payment_auto_place_order)) ? config_builder.addons.striperedirect_payment_auto_place_order : true,
    },
    stripe_refund: (validProp(config_builder.addons.stripe_refund)) ? config_builder.addons.stripe_refund : true,
    inventory: (validProp(config_builder.addons.inventory)) ? config_builder.addons.inventory : true,
    delivery_dashboard: (validProp(config_builder.addons.delivery_dashboard)) ? config_builder.addons.delivery_dashboard : true,
    check_address_checkout: (validProp(config_builder.addons.check_address_checkout)) ? config_builder.addons.check_address_checkout : true,
    autoassign: (validProp(config_builder.addons.autoassign)) ? config_builder.addons.autoassign : true,
    add_business: (validProp(config_builder.addons.add_business)) ? config_builder.addons.add_business : true,
    limit_business: (validProp(config_builder.addons.limit_business)) ? config_builder.addons.limit_business : false,
    limit_cities: (validProp(config_builder.addons.limit_cities)) ? config_builder.addons.limit_cities : false,
    metafields_editor: (validProp(config_builder.addons.metafields_editor)) ? config_builder.addons.metafields_editor : false,
    show_discount: (validProp(config_builder.addons.show_discount)) ? config_builder.addons.show_discount : true,
    business_multi_owners_module: (validProp(config_builder.addons.business_multi_owners_module)) ? config_builder.addons.business_multi_owners_module : false,
    quantity_options: false,
    use_segment: (validProp(config_builder.addons.use_segment)) ? config_builder.addons.use_segment : true,
    segment_key: (validProp(config_builder.addons.segment_key)) ? config_builder.addons.segment_key : 'ZokYegc7YwIqt4WSZnypParX6C7UN09H',
    segment_debug: (validProp(config_builder.addons.segment_debug)) ? config_builder.addons.segment_debug : true,
    twilio_verify: (validProp(config_builder.addons.twilio_verify)) ? config_builder.addons.twilio_verify : false,
    default_order_is_processing: (validProp(config_builder.addons.default_order_is_processing)) ? config_builder.addons.default_order_is_processing : '',
    //newaddon
};

var WEB_ADDONS = {
    all_categories: (validProp(config_builder.web_addons.all_categories)) ? config_builder.web_addons.all_categories : true,
    remove_hash: (validProp(config_builder.web_addons.remove_hash)) ? config_builder.web_addons.remove_hash : false,
};

var PARAMS = {
    SEARCH_CONTROLLER: {
        BUSINESS: 'name,slug,logo,header,location,description,food,alcohol,groceries,laundry,zones,delivery_price,minimum,schedule,featured,reviews,about,delivery_time,pickup_time,offers'
    }
}

window.onload = function () {
    var link = document.createElement('link');
    link.type = 'image/png';
    link.rel = 'icon';
    link.href = 'templates/' + ADDONS.template + '/img/favicon.png';
    document.getElementsByTagName('head')[0].appendChild(link);
}

function getInclude(link) {
    if (link.indexOf('https://') != -1 || link.indexOf('http://') != -1) return link;
    return 'templates/' + ADDONS.template + '/' + link;
}

var before_includes = [
    'assets/js/ionic.bundle.min.js',
    'assets/js/ionic.filter.bar.min.js',
    'assets/js/storage.js',
    'assets/js/agan.js',
    'assets/js/imgcache.js',
    'assets/js/moment.min.js',
];
var after_includes = [
    'assets/js/app.js',
    'assets/js/custom/app.js',
    'assets/js/controllers.js',
    'assets/js/custom/controllers.js',
    'assets/js/controllers_editor.js',
    'assets/js/factories.js',
    'assets/js/custom/factories.js',
    'assets/js/services.js',
    'assets/js/custom/services.js',
];

var after_angular = [
];

var _scripts = [];
var _routes = [];

var angular_requires = [
    'ionic',
    'orderingApp.controllers',
    'orderingApp.services',
    'orderingApp.factories',
    'angular-google-analytics',
    'jett.ionic.filter.bar',
    'ngSanitize',
    'sn.addthis',
];
if (ADDONS.use_segment) {
    before_includes.push('assets/js/segment.min.js');
    angular_requires.push('ngSegment');
}

if (ADDONS.web_template) angular_requires.push("ui.router");

var checkView = setInterval(function () {
    var version = "?v=" + FRONT_VERSION;
    if (document.getElementById("mobile-view") || document.getElementById("web-view")) {
        clearInterval(checkView);
        if (ADDONS.web_template) {
            document.body.removeChild(document.getElementById("mobile-view"));
        } else {
            document.body.removeChild(document.getElementById("web-view"));
        }
        $.getJSON('templates/' + ADDONS.template + '/includes.json' + version, function (includes) {
            if (includes.angular_requires) {
                angular_requires = angular_requires.concat(includes.angular_requires);
            }
            if (includes.async_scripts) {
                for (var i = 0; i < includes.async_scripts.length; i++) {
                    var file = includes.async_scripts[i];
                    if (file.indexOf('http') == -1) {
                        file += version;
                    }
                    loadScript(getInclude(file));
                }
            }
            for (var i = 0; i < includes.styles.length; i++) {
                var file = includes.styles[i];
                if (file.indexOf('http') == -1) {
                    file += version;
                }
                loadStyle(getInclude(file));
            }
            if (ADDONS.theme_style != 'none') {
                var ext = ADDONS.theme_style.substring(ADDONS.theme_style.length - 4) == '.css' ? '' : '.css';
                loadStyle('templates/' + ADDONS.template + '/styles/' + ADDONS.theme_style + ext);
            }
            loadStyle('assets/css/custom.css' + version);
            loadStyle('assets/css/custom_changes.css' + version);
            _scripts = before_includes;
            for (var i = 0; i < includes.scripts.length; i++) {
                _scripts.push(getInclude(includes.scripts[i]));
            }
            _scripts = _scripts.concat(after_includes);
            if (includes.angular) {
                for (var i = 0; i < includes.angular.length; i++) {
                    _scripts.push(getInclude(includes.angular[i]));
                }
            }
            _scripts = _scripts.concat(after_angular);
            if (includes.routes) _routes = includes.routes;
            createScriptTag(function () {
                console.log("FILES LOADED!");
                angular.element(document).ready(function () {
                    angular.bootstrap(document, ['orderingApp']);
                });
            });
        });
    }
}, 5);

function createScriptTag(cb) {
    var script = _scripts.shift();
    if (!script) {
        if (cb) cb();
        return;
    }
    var version = "?v=" + FRONT_VERSION;
    if (script.indexOf('http') == -1) {
        script += version;
    }
    var js = document.createElement('script');
    js.type = 'text/javascript';
    js.src = script;
    js.defer = true;
    js.onload = function (event) {
        createScriptTag(cb);
    };
    js.onerror = function (event) {
        createScriptTag(cb);
    };
    (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(js);
}

if (!DEBUG_MODE) {
    console.log = function () { }
    // console.warn = console.log;
}

var path_cordova = '';
path_cordova = getCordovaPath();
localStorage.setItem('cordova', path_cordova);

// loadCordova(path_cordova);

var IFRAME_INLINE = false;
var PARENT_DATA = {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    offsetTop: 0
};

function validProp(prop) {
    return prop != null && prop != undefined;
}

function loadScript(link) {
    var script_tag = document.createElement('script');
    script_tag.setAttribute("type", "text/javascript");
    script_tag.setAttribute("src", link);
    (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
}

function loadStyle(url) {
    var link = document.createElement("link");
    link.setAttribute("href", url);
    link.setAttribute("type", "text/css");
    link.setAttribute("rel", "stylesheet");
    (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(link);
}

function getCordovaPath() {
    var os = getOS();
    var path = '';
    if (os == 'iOS') {
        if (window.location.pathname.indexOf('/www/') > 0) {
            path = window.location.pathname;
            path = path.split('index')[0];
            path += 'cordova.js';
        } else if (localStorage.getItem('cordova')) path = localStorage.getItem('cordova');
    } else {
        if (localStorage.getItem('cordova')) path = localStorage.getItem('cordova');
        else {
            path = window.location.pathname;
            path = path.split('index')[0];
            path += 'cordova.js';
        }
    }
    return path;
};

function getOS() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/windows phone/i.test(userAgent)) return "Windows Phone";
    if (/android/i.test(userAgent)) return "Android";
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) return "iOS";
    return "unknown";
}

function loadCordova(path_cordova) {
    if (ADDONS.web_template) return;
    cordova = null;
    var script_tag = document.createElement('script');
    script_tag.setAttribute("type", "text/javascript");
    script_tag.setAttribute("src", path_cordova);
    (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
}

var loadingGoogle = false;
function loadGoogleMaps(API_KEY) {
    if (typeof google != 'undefined' || loadingGoogle) return;
    loadingGoogle = true;
    var script_tag = document.createElement('script');
    script_tag.setAttribute("type", "text/javascript");
    script_tag.setAttribute("src", "https://maps.googleapis.com/maps/api/js?key=" + API_KEY + "&libraries=places,drawing,visualization");
    (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
    var inter = setInterval(function () {
        if (typeof google != 'undefined') {
            script_tag = document.createElement('script');
            script_tag.setAttribute("type", "text/javascript");
            script_tag.setAttribute("src", "assets/js/markerwithlabel.js");
            (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
            clearInterval(inter);
        }
    }, 1000);
}

function isIPhoneX() {
    if (getOS() == 'iOS' && !ADDONS.web_template) {
        var ratio = window.devicePixelRatio || 1;
        var screen = {
            width: window.screen.width * ratio,
            height: window.screen.height * ratio
        };
        if ((screen.width == 1125 && screen.height == 2436)
            || (screen.width == 828 && screen.height == 1792)
            || (screen.width == 1242 && screen.height == 2688)
            || (screen.width == 1284 && screen.height == 2778)
            || (screen.width == 1536 && screen.height == 2048)
            || (screen.width == 1170 && screen.height == 2532)) {
            return true;
        }
        return false;
    }
}

function isValidJSONString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

var clicks = {};
function avoidDoubleClick(function_name, time) {
    var time = time || 1000;
    if (clicks[function_name]) return true;
    else {
        clicks[function_name] = setTimeout(function () {
            clearTimeout(clicks[function_name]);
            delete clicks[function_name];
        }, time);
        return false;
    }
}

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

function getRandomColor() {
    var randomInt = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    var h = randomInt(0, 360);
    var s = randomInt(42, 98);
    var l = randomInt(40, 90);
    return "hsl(" + h + "," + s + "%," + l + "%)";
}

var countries = [
    { countryCode: "DZ", phoneCode: "213", name: "Algeria" },
    { countryCode: "AD", phoneCode: "376", name: "Andorra" },
    { countryCode: "AO", phoneCode: "244", name: "Angola" },
    { countryCode: "AI", phoneCode: "1264", name: "Anguilla" },
    { countryCode: "AG", phoneCode: "1268", name: "Antigua & Barbuda" },
    { countryCode: "AR", phoneCode: "54", name: "Argentina" },
    { countryCode: "AM", phoneCode: "374", name: "Armenia" },
    { countryCode: "AW", phoneCode: "297", name: "Aruba" },
    { countryCode: "AU", phoneCode: "61", name: "Australia" },
    { countryCode: "AT", phoneCode: "43", name: "Austria" },
    { countryCode: "AZ", phoneCode: "994", name: "Azerbaijan" },
    { countryCode: "BS", phoneCode: "1242", name: "Bahamas" },
    { countryCode: "BH", phoneCode: "973", name: "Bahrain" },
    { countryCode: "BD", phoneCode: "880", name: "Bangladesh" },
    { countryCode: "BB", phoneCode: "1246", name: "Barbados" },
    { countryCode: "BY", phoneCode: "375", name: "Belarus" },
    { countryCode: "BE", phoneCode: "32", name: "Belgium" },
    { countryCode: "BZ", phoneCode: "501", name: "Belize" },
    { countryCode: "BJ", phoneCode: "229", name: "Benin" },
    { countryCode: "BM", phoneCode: "1441", name: "Bermuda" },
    { countryCode: "BT", phoneCode: "975", name: "Bhutan" },
    { countryCode: "BO", phoneCode: "591", name: "Bolivia" },
    { countryCode: "BA", phoneCode: "387", name: "Bosnia Herzegovina" },
    { countryCode: "BW", phoneCode: "267", name: "Botswana" },
    { countryCode: "BR", phoneCode: "55", name: "Brazil" },
    { countryCode: "BN", phoneCode: "673", name: "Brunei" },
    { countryCode: "BG", phoneCode: "359", name: "Bulgaria" },
    { countryCode: "BF", phoneCode: "226", name: "Burkina Faso" },
    { countryCode: "BI", phoneCode: "257", name: "Burundi" },
    { countryCode: "KH", phoneCode: "855", name: "Cambodia" },
    { countryCode: "CM", phoneCode: "237", name: "Cameroon" },
    { countryCode: "CA", phoneCode: "1", name: "Canada" },
    { countryCode: "CV", phoneCode: "238", name: "Cape Verde Islands" },
    { countryCode: "KY", phoneCode: "1345", name: "Cayman Islands" },
    { countryCode: "CF", phoneCode: "236", name: "Central African Republic" },
    { countryCode: "CL", phoneCode: "56", name: "Chile" },
    { countryCode: "CN", phoneCode: "86", name: "China" },
    { countryCode: "CO", phoneCode: "57", name: "Colombia" },
    { countryCode: "KM", phoneCode: "269", name: "Comoros" },
    { countryCode: "CG", phoneCode: "242", name: "Congo" },
    { countryCode: "CK", phoneCode: "682", name: "Cook Islands" },
    { countryCode: "CR", phoneCode: "506", name: "Costa Rica" },
    { countryCode: "HR", phoneCode: "385", name: "Croatia" },
    { countryCode: "CU", phoneCode: "53", name: "Cuba" },
    { countryCode: "CY", phoneCode: "90392", name: "Cyprus North" },
    { countryCode: "CY", phoneCode: "357", name: "Cyprus South" },
    { countryCode: "CZ", phoneCode: "42", name: "Czech Republic" },
    { countryCode: "DK", phoneCode: "45", name: "Denmark" },
    { countryCode: "DJ", phoneCode: "253", name: "Djibouti" },
    { countryCode: "DM", phoneCode: "1809", name: "Dominica" },
    { countryCode: "DO", phoneCode: "1809", name: "Dominican Republic" },
    { countryCode: "EC", phoneCode: "593", name: "Ecuador" },
    { countryCode: "EG", phoneCode: "20", name: "Egypt" },
    { countryCode: "SV", phoneCode: "503", name: "El Salvador" },
    { countryCode: "GQ", phoneCode: "240", name: "Equatorial Guinea" },
    { countryCode: "ER", phoneCode: "291", name: "Eritrea" },
    { countryCode: "EE", phoneCode: "372", name: "Estonia" },
    { countryCode: "ET", phoneCode: "251", name: "Ethiopia" },
    { countryCode: "FK", phoneCode: "500", name: "Falkland Islands" },
    { countryCode: "FO", phoneCode: "298", name: "Faroe Islands" },
    { countryCode: "FJ", phoneCode: "679", name: "Fiji" },
    { countryCode: "FI", phoneCode: "358", name: "Finland" },
    { countryCode: "FR", phoneCode: "33", name: "France" },
    { countryCode: "GF", phoneCode: "594", name: "French Guiana" },
    { countryCode: "PF", phoneCode: "689", name: "French Polynesia" },
    { countryCode: "GA", phoneCode: "241", name: "Gabon" },
    { countryCode: "GM", phoneCode: "220", name: "Gambia" },
    { countryCode: "GE", phoneCode: "7880", name: "Georgia" },
    { countryCode: "DE", phoneCode: "49", name: "Germany" },
    { countryCode: "GH", phoneCode: "233", name: "Ghana" },
    { countryCode: "GI", phoneCode: "350", name: "Gibraltar" },
    { countryCode: "GR", phoneCode: "30", name: "Greece" },
    { countryCode: "GL", phoneCode: "299", name: "Greenland" },
    { countryCode: "GD", phoneCode: "1473", name: "Grenada" },
    { countryCode: "GP", phoneCode: "590", name: "Guadeloupe" },
    { countryCode: "GU", phoneCode: "671", name: "Guam" },
    { countryCode: "GT", phoneCode: "502", name: "Guatemala" },
    { countryCode: "GN", phoneCode: "224", name: "Guinea" },
    { countryCode: "GW", phoneCode: "245", name: "Guinea - Bissau" },
    { countryCode: "GY", phoneCode: "592", name: "Guyana" },
    { countryCode: "HT", phoneCode: "509", name: "Haiti" },
    { countryCode: "HN", phoneCode: "504", name: "Honduras" },
    { countryCode: "HK", phoneCode: "852", name: "Hong Kong" },
    { countryCode: "HU", phoneCode: "36", name: "Hungary" },
    { countryCode: "IS", phoneCode: "354", name: "Iceland" },
    { countryCode: "IN", phoneCode: "91", name: "India" },
    { countryCode: "ID", phoneCode: "62", name: "Indonesia" },
    { countryCode: "IR", phoneCode: "98", name: "Iran" },
    { countryCode: "IQ", phoneCode: "964", name: "Iraq" },
    { countryCode: "IE", phoneCode: "353", name: "Ireland" },
    { countryCode: "IL", phoneCode: "972", name: "Israel" },
    { countryCode: "IT", phoneCode: "39", name: "Italy" },
    { countryCode: "JM", phoneCode: "1876", name: "Jamaica" },
    { countryCode: "JP", phoneCode: "81", name: "Japan" },
    { countryCode: "JO", phoneCode: "962", name: "Jordan" },
    { countryCode: "KZ", phoneCode: "7", name: "Kazakhst" },
    { countryCode: "KE", phoneCode: "254", name: "Kenya" },
    { countryCode: "KI", phoneCode: "686", name: "Kiribati" },
    { countryCode: "KP", phoneCode: "850", name: "Korea North" },
    { countryCode: "KR", phoneCode: "82", name: "Korea South" },
    { countryCode: "KW", phoneCode: "965", name: "Kuwait" },
    { countryCode: "KG", phoneCode: "996", name: "Kyrgyzstan" },
    { countryCode: "LA", phoneCode: "856", name: "Laos" },
    { countryCode: "LV", phoneCode: "371", name: "Latvia" },
    { countryCode: "LB", phoneCode: "961", name: "Lebanon" },
    { countryCode: "LS", phoneCode: "266", name: "Lesotho" },
    { countryCode: "LR", phoneCode: "231", name: "Liberia" },
    { countryCode: "LY", phoneCode: "218", name: "Libya" },
    { countryCode: "LI", phoneCode: "417", name: "Liechtenstein" },
    { countryCode: "LT", phoneCode: "370", name: "Lithuania" },
    { countryCode: "LU", phoneCode: "352", name: "Luxembourg" },
    { countryCode: "MO", phoneCode: "853", name: "Macao" },
    { countryCode: "MK", phoneCode: "389", name: "Macedonia" },
    { countryCode: "MG", phoneCode: "261", name: "Madagascar" },
    { countryCode: "MW", phoneCode: "265", name: "Malawi" },
    { countryCode: "MY", phoneCode: "60", name: "Malaysia" },
    { countryCode: "MV", phoneCode: "960", name: "Maldives" },
    { countryCode: "ML", phoneCode: "223", name: "Mali" },
    { countryCode: "MT", phoneCode: "356", name: "Malta" },
    { countryCode: "MH", phoneCode: "692", name: "Marshall Islands" },
    { countryCode: "MQ", phoneCode: "596", name: "Martinique" },
    { countryCode: "MR", phoneCode: "222", name: "Mauritania" },
    { countryCode: "YT", phoneCode: "269", name: "Mayotte" },
    { countryCode: "MX", phoneCode: "52", name: "Mexico" },
    { countryCode: "FM", phoneCode: "691", name: "Micronesia" },
    { countryCode: "MD", phoneCode: "373", name: "Moldova" },
    { countryCode: "MC", phoneCode: "377", name: "Monaco" },
    { countryCode: "MN", phoneCode: "976", name: "Mongolia" },
    { countryCode: "MS", phoneCode: "1664", name: "Montserrat" },
    { countryCode: "MA", phoneCode: "212", name: "Morocco" },
    { countryCode: "MZ", phoneCode: "258", name: "Mozambique" },
    { countryCode: "MN", phoneCode: "95", name: "Myanmar" },
    { countryCode: "NA", phoneCode: "264", name: "Namibia" },
    { countryCode: "NR", phoneCode: "674", name: "Nauru" },
    { countryCode: "NP", phoneCode: "977", name: "Nepal" },
    { countryCode: "NL", phoneCode: "31", name: "Netherlands" },
    { countryCode: "NC", phoneCode: "687", name: "New Caledonia" },
    { countryCode: "NZ", phoneCode: "64", name: "New Zealand" },
    { countryCode: "NI", phoneCode: "505", name: "Nicaragua" },
    { countryCode: "NE", phoneCode: "227", name: "Niger" },
    { countryCode: "NG", phoneCode: "234", name: "Nigeria" },
    { countryCode: "NU", phoneCode: "683", name: "Niue" },
    { countryCode: "NF", phoneCode: "672", name: "Norfolk Islands" },
    { countryCode: "NP", phoneCode: "670", name: "Northern Marianas" },
    { countryCode: "NO", phoneCode: "47", name: "Norway" },
    { countryCode: "OM", phoneCode: "968", name: "Oman" },
    { countryCode: "PW", phoneCode: "680", name: "Palau" },
    { countryCode: "PA", phoneCode: "507", name: "Panama" },
    { countryCode: "PG", phoneCode: "675", name: "Papua New Guinea" },
    { countryCode: "PY", phoneCode: "595", name: "Paraguay" },
    { countryCode: "PE", phoneCode: "51", name: "Peru" },
    { countryCode: "PH", phoneCode: "63", name: "Philippines" },
    { countryCode: "PL", phoneCode: "48", name: "Poland" },
    { countryCode: "PT", phoneCode: "351", name: "Portugal" },
    { countryCode: "PR", phoneCode: "1787", name: "Puerto Rico" },
    { countryCode: "QA", phoneCode: "974", name: "Qatar" },
    { countryCode: "RE", phoneCode: "262", name: "Reunion" },
    { countryCode: "RO", phoneCode: "40", name: "Romania" },
    { countryCode: "RU", phoneCode: "7", name: "Russ" },
    { countryCode: "RW", phoneCode: "250", name: "Rwanda" },
    { countryCode: "SM", phoneCode: "378", name: "San Marino" },
    { countryCode: "ST", phoneCode: "239", name: "Sao Tome & Principe" },
    { countryCode: "SA", phoneCode: "966", name: "Saudi Arabia" },
    { countryCode: "SN", phoneCode: "221", name: "Senegal" },
    { countryCode: "CS", phoneCode: "381", name: "Serbia" },
    { countryCode: "SC", phoneCode: "248", name: "Seychelles" },
    { countryCode: "SL", phoneCode: "232", name: "Sierra Leone" },
    { countryCode: "SG", phoneCode: "65", name: "Singapore" },
    { countryCode: "SK", phoneCode: "421", name: "Slovak Republic" },
    { countryCode: "SI", phoneCode: "386", name: "Slovenia" },
    { countryCode: "SB", phoneCode: "677", name: "Solomon Islands" },
    { countryCode: "SO", phoneCode: "252", name: "Somalia" },
    { countryCode: "ZA", phoneCode: "27", name: "South Africa" },
    { countryCode: "ES", phoneCode: "34", name: "Spain" },
    { countryCode: "LK", phoneCode: "94", name: "Sri Lanka" },
    { countryCode: "SH", phoneCode: "290", name: "St. Helena" },
    { countryCode: "KN", phoneCode: "1869", name: "St. Kitts" },
    { countryCode: "SC", phoneCode: "1758", name: "St. Lucia" },
    { countryCode: "SD", phoneCode: "249", name: "Sudan" },
    { countryCode: "SR", phoneCode: "597", name: "Suriname" },
    { countryCode: "SZ", phoneCode: "268", name: "Swaziland" },
    { countryCode: "SE", phoneCode: "46", name: "Sweden" },
    { countryCode: "CH", phoneCode: "41", name: "Switzerland" },
    { countryCode: "SI", phoneCode: "963", name: "Syria" },
    { countryCode: "TW", phoneCode: "886", name: "Taiwan" },
    { countryCode: "TJ", phoneCode: "7", name: "Tajikst" },
    { countryCode: "TH", phoneCode: "66", name: "Thailand" },
    { countryCode: "TG", phoneCode: "228", name: "Togo" },
    { countryCode: "TO", phoneCode: "676", name: "Tonga" },
    { countryCode: "TT", phoneCode: "1868", name: "Trinidad & Tobago" },
    { countryCode: "TN", phoneCode: "216", name: "Tunisia" },
    { countryCode: "TR", phoneCode: "90", name: "Turkey" },
    { countryCode: "TM", phoneCode: "7", name: "Turkmenist" },
    { countryCode: "TM", phoneCode: "993", name: "Turkmenistan" },
    { countryCode: "TC", phoneCode: "1649", name: "Turks & Caicos Islands" },
    { countryCode: "TV", phoneCode: "688", name: "Tuvalu" },
    { countryCode: "UG", phoneCode: "256", name: "Uganda" },
    { countryCode: "GB", phoneCode: "44", name: "UK" },
    { countryCode: "UA", phoneCode: "380", name: "Ukraine" },
    { countryCode: "AE", phoneCode: "971", name: "United Arab Emirates" },
    { countryCode: "UY", phoneCode: "598", name: "Uruguay" },
    { countryCode: "US", phoneCode: "1", name: "USA" },
    { countryCode: "UZ", phoneCode: "7", name: "Uzbekist" },
    { countryCode: "VU", phoneCode: "678", name: "Vanuatu" },
    { countryCode: "VA", phoneCode: "379", name: "Vatican City" },
    { countryCode: "VE", phoneCode: "58", name: "Venezuela" },
    { countryCode: "VN", phoneCode: "84", name: "Vietnam" },
    { countryCode: "VG", phoneCode: "84", name: "Virgin Islands - British" },
    { countryCode: "VI", phoneCode: "84", name: "Virgin Islands - US" },
    { countryCode: "WF", phoneCode: "681", name: "Wallis & Futuna" },
    { countryCode: "YE", phoneCode: "969", name: "Yemen (North" },
    { countryCode: "YE", phoneCode: "967", name: "Yemen (South" },
    { countryCode: "ZM", phoneCode: "260", name: "Zambia" },
    { countryCode: "ZW", phoneCode: "263", name: "Zimbabwe" }
]

var timezones = [
    "UTC",
    "Africa/Abidjan",
    "Africa/Accra",
    "Africa/Addis_Ababa",
    "Africa/Algiers",
    "Africa/Asmara",
    "Africa/Bamako",
    "Africa/Bangui",
    "Africa/Banjul",
    "Africa/Bissau",
    "Africa/Blantyre",
    "Africa/Brazzaville",
    "Africa/Bujumbura",
    "Africa/Cairo",
    "Africa/Casablanca",
    "Africa/Ceuta",
    "Africa/Conakry",
    "Africa/Dakar",
    "Africa/Dar_es_Salaam",
    "Africa/Djibouti",
    "Africa/Douala",
    "Africa/El_Aaiun",
    "Africa/Freetown",
    "Africa/Gaborone",
    "Africa/Harare",
    "Africa/Johannesburg",
    "Africa/Juba",
    "Africa/Kampala",
    "Africa/Khartoum",
    "Africa/Kigali",
    "Africa/Kinshasa",
    "Africa/Lagos",
    "Africa/Libreville",
    "Africa/Lome",
    "Africa/Luanda",
    "Africa/Lubumbashi",
    "Africa/Lusaka",
    "Africa/Malabo",
    "Africa/Maputo",
    "Africa/Maseru",
    "Africa/Mbabane",
    "Africa/Mogadishu",
    "Africa/Monrovia",
    "Africa/Nairobi",
    "Africa/Ndjamena",
    "Africa/Niamey",
    "Africa/Nouakchott",
    "Africa/Ouagadougou",
    "Africa/Porto-Novo",
    "Africa/Sao_Tome",
    "Africa/Tripoli",
    "Africa/Tunis",
    "Africa/Windhoek",
    "America/Adak",
    "America/Anchorage",
    "America/Anguilla",
    "America/Antigua",
    "America/Araguaina",
    "America/Argentina/Buenos_Aires",
    "America/Argentina/Catamarca",
    "America/Argentina/Cordoba",
    "America/Argentina/Jujuy",
    "America/Argentina/La_Rioja",
    "America/Argentina/Mendoza",
    "America/Argentina/Rio_Gallegos",
    "America/Argentina/Salta",
    "America/Argentina/San_Juan",
    "America/Argentina/San_Luis",
    "America/Argentina/Tucuman",
    "America/Argentina/Ushuaia",
    "America/Aruba",
    "America/Asuncion",
    "America/Atikokan",
    "America/Bahia",
    "America/Bahia_Banderas",
    "America/Barbados",
    "America/Belem",
    "America/Belize",
    "America/Blanc-Sablon",
    "America/Boa_Vista",
    "America/Bogota",
    "America/Boise",
    "America/Cambridge_Bay",
    "America/Campo_Grande",
    "America/Cancun",
    "America/Caracas",
    "America/Cayenne",
    "America/Cayman",
    "America/Chicago",
    "America/Chihuahua",
    "America/Costa_Rica",
    "America/Creston",
    "America/Cuiaba",
    "America/Curacao",
    "America/Danmarkshavn",
    "America/Dawson",
    "America/Dawson_Creek",
    "America/Denver",
    "America/Detroit",
    "America/Dominica",
    "America/Edmonton",
    "America/Eirunepe",
    "America/El_Salvador",
    "America/Fort_Nelson",
    "America/Fortaleza",
    "America/Glace_Bay",
    "America/Godthab",
    "America/Goose_Bay",
    "America/Grand_Turk",
    "America/Grenada",
    "America/Guadeloupe",
    "America/Guatemala",
    "America/Guayaquil",
    "America/Guyana",
    "America/Halifax",
    "America/Havana",
    "America/Hermosillo",
    "America/Indiana/Indianapolis",
    "America/Indiana/Knox",
    "America/Indiana/Marengo",
    "America/Indiana/Petersburg",
    "America/Indiana/Tell_City",
    "America/Indiana/Vevay",
    "America/Indiana/Vincennes",
    "America/Indiana/Winamac",
    "America/Inuvik",
    "America/Iqaluit",
    "America/Jamaica",
    "America/Juneau",
    "America/Kentucky/Louisville",
    "America/Kentucky/Monticello",
    "America/Kralendijk",
    "America/La_Paz",
    "America/Lima",
    "America/Los_Angeles",
    "America/Lower_Princes",
    "America/Maceio",
    "America/Managua",
    "America/Manaus",
    "America/Marigot",
    "America/Martinique",
    "America/Matamoros",
    "America/Mazatlan",
    "America/Menominee",
    "America/Merida",
    "America/Metlakatla",
    "America/Mexico_City",
    "America/Miquelon",
    "America/Moncton",
    "America/Monterrey",
    "America/Montevideo",
    "America/Montserrat",
    "America/Nassau",
    "America/New_York",
    "America/Nipigon",
    "America/Nome",
    "America/Noronha",
    "America/North_Dakota/Beulah",
    "America/North_Dakota/Center",
    "America/North_Dakota/New_Salem",
    "America/Ojinaga",
    "America/Panama",
    "America/Pangnirtung",
    "America/Paramaribo",
    "America/Phoenix",
    "America/Port-au-Prince",
    "America/Port_of_Spain",
    "America/Porto_Velho",
    "America/Puerto_Rico",
    "America/Punta_Arenas",
    "America/Rainy_River",
    "America/Rankin_Inlet",
    "America/Recife",
    "America/Regina",
    "America/Resolute",
    "America/Rio_Branco",
    "America/Santarem",
    "America/Santiago",
    "America/Santo_Domingo",
    "America/Sao_Paulo",
    "America/Scoresbysund",
    "America/Sitka",
    "America/St_Barthelemy",
    "America/St_Johns",
    "America/St_Kitts",
    "America/St_Lucia",
    "America/St_Thomas",
    "America/St_Vincent",
    "America/Swift_Current",
    "America/Tegucigalpa",
    "America/Thule",
    "America/Thunder_Bay",
    "America/Tijuana",
    "America/Toronto",
    "America/Tortola",
    "America/Vancouver",
    "America/Whitehorse",
    "America/Winnipeg",
    "America/Yakutat",
    "America/Yellowknife",
    "Antarctica/Casey",
    "Antarctica/Davis",
    "Antarctica/DumontDUrville",
    "Antarctica/Macquarie",
    "Antarctica/Mawson",
    "Antarctica/McMurdo",
    "Antarctica/Palmer",
    "Antarctica/Rothera",
    "Antarctica/Syowa",
    "Antarctica/Troll",
    "Antarctica/Vostok",
    "Arctic/Longyearbyen",
    "Asia/Aden",
    "Asia/Almaty",
    "Asia/Amman",
    "Asia/Anadyr",
    "Asia/Aqtau",
    "Asia/Aqtobe",
    "Asia/Ashgabat",
    "Asia/Atyrau",
    "Asia/Baghdad",
    "Asia/Bahrain",
    "Asia/Baku",
    "Asia/Bangkok",
    "Asia/Barnaul",
    "Asia/Beirut",
    "Asia/Bishkek",
    "Asia/Brunei",
    "Asia/Chita",
    "Asia/Choibalsan",
    "Asia/Colombo",
    "Asia/Damascus",
    "Asia/Dhaka",
    "Asia/Dili",
    "Asia/Dubai",
    "Asia/Dushanbe",
    "Asia/Famagusta",
    "Asia/Gaza",
    "Asia/Hebron",
    "Asia/Ho_Chi_Minh",
    "Asia/Hong_Kong",
    "Asia/Hovd",
    "Asia/Irkutsk",
    "Asia/Jakarta",
    "Asia/Jayapura",
    "Asia/Jerusalem",
    "Asia/Kabul",
    "Asia/Kamchatka",
    "Asia/Karachi",
    "Asia/Kathmandu",
    "Asia/Khandyga",
    "Asia/Kolkata",
    "Asia/Krasnoyarsk",
    "Asia/Kuala_Lumpur",
    "Asia/Kuching",
    "Asia/Kuwait",
    "Asia/Macau",
    "Asia/Magadan",
    "Asia/Makassar",
    "Asia/Manila",
    "Asia/Muscat",
    "Asia/Nicosia",
    "Asia/Novokuznetsk",
    "Asia/Novosibirsk",
    "Asia/Omsk",
    "Asia/Oral",
    "Asia/Phnom_Penh",
    "Asia/Pontianak",
    "Asia/Pyongyang",
    "Asia/Qatar",
    "Asia/Qyzylorda",
    "Asia/Riyadh",
    "Asia/Sakhalin",
    "Asia/Samarkand",
    "Asia/Seoul",
    "Asia/Shanghai",
    "Asia/Singapore",
    "Asia/Srednekolymsk",
    "Asia/Taipei",
    "Asia/Tashkent",
    "Asia/Tbilisi",
    "Asia/Tehran",
    "Asia/Thimphu",
    "Asia/Tokyo",
    "Asia/Tomsk",
    "Asia/Ulaanbaatar",
    "Asia/Urumqi",
    "Asia/Ust-Nera",
    "Asia/Vientiane",
    "Asia/Vladivostok",
    "Asia/Yakutsk",
    "Asia/Yangon",
    "Asia/Yekaterinburg",
    "Asia/Yerevan",
    "Atlantic/Azores",
    "Atlantic/Bermuda",
    "Atlantic/Canary",
    "Atlantic/Cape_Verde",
    "Atlantic/Faroe",
    "Atlantic/Madeira",
    "Atlantic/Reykjavik",
    "Atlantic/South_Georgia",
    "Atlantic/St_Helena",
    "Atlantic/Stanley",
    "Australia/Adelaide",
    "Australia/Brisbane",
    "Australia/Broken_Hill",
    "Australia/Currie",
    "Australia/Darwin",
    "Australia/Eucla",
    "Australia/Hobart",
    "Australia/Lindeman",
    "Australia/Lord_Howe",
    "Australia/Melbourne",
    "Australia/Perth",
    "Australia/Sydney",
    "Europe/Amsterdam",
    "Europe/Andorra",
    "Europe/Astrakhan",
    "Europe/Athens",
    "Europe/Belgrade",
    "Europe/Berlin",
    "Europe/Bratislava",
    "Europe/Brussels",
    "Europe/Bucharest",
    "Europe/Budapest",
    "Europe/Busingen",
    "Europe/Chisinau",
    "Europe/Copenhagen",
    "Europe/Dublin",
    "Europe/Gibraltar",
    "Europe/Guernsey",
    "Europe/Helsinki",
    "Europe/Isle_of_Man",
    "Europe/Istanbul",
    "Europe/Jersey",
    "Europe/Kaliningrad",
    "Europe/Kiev",
    "Europe/Kirov",
    "Europe/Lisbon",
    "Europe/Ljubljana",
    "Europe/London",
    "Europe/Luxembourg",
    "Europe/Madrid",
    "Europe/Malta",
    "Europe/Mariehamn",
    "Europe/Minsk",
    "Europe/Monaco",
    "Europe/Moscow",
    "Europe/Oslo",
    "Europe/Paris",
    "Europe/Podgorica",
    "Europe/Prague",
    "Europe/Riga",
    "Europe/Rome",
    "Europe/Samara",
    "Europe/San_Marino",
    "Europe/Sarajevo",
    "Europe/Saratov",
    "Europe/Simferopol",
    "Europe/Skopje",
    "Europe/Sofia",
    "Europe/Stockholm",
    "Europe/Tallinn",
    "Europe/Tirane",
    "Europe/Ulyanovsk",
    "Europe/Uzhgorod",
    "Europe/Vaduz",
    "Europe/Vatican",
    "Europe/Vienna",
    "Europe/Vilnius",
    "Europe/Volgograd",
    "Europe/Warsaw",
    "Europe/Zagreb",
    "Europe/Zaporozhye",
    "Europe/Zurich",
    "Indian/Antananarivo",
    "Indian/Chagos",
    "Indian/Christmas",
    "Indian/Cocos",
    "Indian/Comoro",
    "Indian/Kerguelen",
    "Indian/Mahe",
    "Indian/Maldives",
    "Indian/Mauritius",
    "Indian/Mayotte",
    "Indian/Reunion",
    "Pacific/Apia",
    "Pacific/Auckland",
    "Pacific/Bougainville",
    "Pacific/Chatham",
    "Pacific/Chuuk",
    "Pacific/Easter",
    "Pacific/Efate",
    "Pacific/Enderbury",
    "Pacific/Fakaofo",
    "Pacific/Fiji",
    "Pacific/Funafuti",
    "Pacific/Galapagos",
    "Pacific/Gambier",
    "Pacific/Guadalcanal",
    "Pacific/Guam",
    "Pacific/Honolulu",
    "Pacific/Kiritimati",
    "Pacific/Kosrae",
    "Pacific/Kwajalein",
    "Pacific/Majuro",
    "Pacific/Marquesas",
    "Pacific/Midway",
    "Pacific/Nauru",
    "Pacific/Niue",
    "Pacific/Norfolk",
    "Pacific/Noumea",
    "Pacific/Pago_Pago",
    "Pacific/Palau",
    "Pacific/Pitcairn",
    "Pacific/Pohnpei",
    "Pacific/Port_Moresby",
    "Pacific/Rarotonga",
    "Pacific/Saipan",
    "Pacific/Tahiti",
    "Pacific/Tarawa",
    "Pacific/Tongatapu",
    "Pacific/Wake",
    "Pacific/Wallis"
]

Object.compare = function (obj1, obj2) {
    //Loop through properties in object 1
    for (var p in obj1) {
        if (p == '$$hashKey') continue;
        //Check property exists on both objects
        if (obj1.hasOwnProperty(p) !== obj2.hasOwnProperty(p)) {
            return false;
        }

        switch (typeof (obj1[p])) {
            //Deep compare objects
            case 'object':
                if (!Object.compare(obj1[p], obj2[p])) {
                    return false;
                }
                break;
            //Compare function code
            case 'function':
                if (typeof (obj2[p]) == 'undefined' || (p != 'compare' && obj1[p].toString() != obj2[p].toString())) {
                    return false;
                }
                break;
            //Compare values
            default:
                if (obj1[p] != obj2[p]) {
                    return false;
                }
        }
    }

    //Check object 2 for any extra properties
    for (var p in obj2) {
        //As object 2 has a value but object 1 is null, return false
        if (!obj1) {
            return false;
        }
        if (typeof (obj1[p]) == 'undefined') {
            return false;
        }
    }
    return true;
};
