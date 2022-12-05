(function(window) {
  function Extensions() {
    var _extensions = {};
    var enter_hooks = [
      'enter_root',
      'enter_root_editor',
      'enter_home_view',
      'enter_profile_view',
      'enter_addresses_view',
      'enter_orders_view',
      'enter_cards_view',
      'enter_keys_view',
      'enter_settings_view',
      'enter_search_view',
      'enter_business_view',
      'enter_category_view',
      'enter_cart_view',
      'enter_singup_view',
      'enter_login_view',
      'enter_checkout_view',
      'enter_confirm_view',
      'enter_notfount_view',
      'enter_forgot_password_view',
      'enter_reset_password_view',
      'enter_businesses_editor_view',
      'enter_business_editor_view',
      'enter_orders_editor_view',
      'enter_settings_editor_view',
      'enter_webhooks_editor_view',
      'enter_reviews_editor_view',
      'enter_plugins_editor_view',
      'enter_general_editor_view',
      'enter_languages_editor_view',
      'enter_integrations_editor_view',
      'enter_users_editor_view',
      'enter_users_create_editor_view',
      'enter_users_update_editor_view',
      'enter_drivermanager_create_editor_view',
      'enter_drivermanager_update_editor_view',
      'enter_driver_create_editor_view',
      'enter_driver_update_editor_view',
      'enter_dropdown_options_editor_view',
      'enter_places_editor_view',
      'enter_channels_editor_view',
      'enter_drivers_editor_view'
    ];
    var hooks = [
      "after_show_loading",
      "after_hide_loading",
      "before_profile_view",
      "after_profile_view",
      "before_search_view",
      "after_search_view",
      "before_business_view",
      "after_business_view",
      "after_business_close_product",
      "after_business_open_category",
      "before_login_view",
      "after_login_view",
      "before_signup_view",
      "after_signup_view",
      "after_forgot_password_view",
      "after_reset_password_view",
      "after_business_editor_view",
      "after_business_editor_open_category_view",
      "after_business_editor_add_category_view",
      "after_business_editor_open_gallery_view",
      "after_listing_editor_view",
      "after_show_alert",
      "after_hide_alert",
      "after_show_confirm",
      "after_hide_confirm",
      "after_orders_editor_view",
      "after_orders_manager_view",
      "product_option_radio_changed",
      "product_option_checkbox_changed",
      "product_option_errors",
      "checkout_form_errors",
      "after_open_image_page_editor_view",
      'after_show_product_options_settings',
			"after_business_types_view",
    ];
    hooks = hooks.concat(enter_hooks);
    var actions = {};
    var filters = {};

    for (var i = 0; i < hooks.length; i++) {
      actions[hooks[i]] = [];
      filters[hooks[i]] = [];
    }

    _extensions.add_filter = function(hook, func) {
      filters[hook].push(func);
    };

    _extensions.add_action = function(hook, func) {
      actions[hook].push(func);
    };

    _extensions.runFilter = function(hook, data, scope) {
      for (var i = 0; i < filters[hook].length; i++) {
        data = filters[hook][i](data, scope);
      }
      return data;
    };

    _extensions.runAction = function(hook, data, scope) {
      for (var i = 0; i < actions[hook].length; i++) {
        actions[hook][i](data, scope);
      }
    };

    return _extensions;
  }

  if (typeof(window.Extensions) === 'undefined') {
    window.Extensions = Extensions();
  }
})(window);