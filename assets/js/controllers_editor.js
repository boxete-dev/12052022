_controllers.controller('editorRootCtrl', function ($scope, $rootScope, $state, MyModal, gUser, MyAlert/*neweditorRootCtrl*/) {
	$rootScope.NOTIFICATION_TOAST = NOTIFICATION_TOAST;
	document.onkeydown = function (evt) {
		evt = evt || window.event;
		if (evt.keyCode == 27) {
			if (modals.length > 0) {
				if (modals[modals.length - 1].scope.close) modals[modals.length - 1].scope.close();
				else if (modals[modals.length - 1].scope.hide) modals[modals.length - 1].scope.hide();
				else if (modals[modals.length - 1].isShown()) {
					modals[modals.length - 1].hide();
					modals[modals.length - 1].remove();
				}
				modals.splice(modals.length - 1, 1);
			}
		}
	};
	$rootScope.editorAvilable = false;
	$rootScope.editMode = false;
	$rootScope.superAdmin = false;
	$rootScope.modalOpening = false;
	$scope.getLanguage(function (err, list, dictionary) {
		$rootScope.pagesToEdit = [
			{
				name: $scope.translate('SELECT_PAGE_EDIT'),
				key: ''
			},
			{
				name: $scope.translate('LISTING_PAGE'),
				key: 'listing'
			},
			{
				name: $scope.translate('ORDER_MANAGER'),
				key: 'orders'
			},
			{
				name: $scope.translate('DELIVERY_DASHBOARD'),
				key: 'deliveries'
			},
			{
				name: $scope.translate('REPORTS'),
				key: 'reports'
			},
			{
				name: $scope.translate('DRIVER_REPORTS'),
				key: 'driver_reports'
			},
			{
				name: $scope.translate('NEW_REPORTS'),
				key: 'new_reports'
			},
			{
				name: $scope.translate('NEW_DASHBOARD_BETA'),
				key: 'new_dashboard'
			},
			{
				name: $scope.translate('MORE'),
				key: 'settings'
			},
			{
				name: $scope.translate('SUPPORT'),
				key: 'support'
			}
		];
	});
	function checkEditor() {
		if (gUser.getData().level == 0 || gUser.getData().level == 2 || gUser.getData().level == 5) {
			$rootScope.editorAvilable = true;
			if (gUser.getData().level == 0) $rootScope.superAdmin = true;
			else $rootScope.superAdmin = false;
		} else {
			$rootScope.editorAvilable = false;
			$rootScope.superAdmin = false;
		}
		if (localStorageApp.getItem(STORE.EDIT_MODE) == 'true') {
			$rootScope.editMode = true;
		}
	}
	checkEditor();
	setInterval(checkEditor, 250);
	$scope.changeEditMode = function (editMode) {
		localStorageApp.setItem(STORE.EDIT_MODE, editMode);
	}
	$scope.goToPageEdit = function (page) {
		switch (page) {
			case 'listing':
				$state.go('main.listing');
				break;
			case 'orders':
				$state.go('main.orders');
				break;
			case 'deliveries':
				$state.go('main.deliveries');
				break;
			case 'reports':
				$state.go('main.reports');
				break;
			case 'driver_reports':
				$state.go('main.driver_reports');
				break;
			case 'new_reports':
				$state.go('main.downloadable_reports');
				break;
			case 'new_dashboard':
				window.open('https://admin.ordering.co/', '_blank');
				break;
			case 'settings':
				$state.go('main.settings');
				break;
			case 'support':
				$state.go('main.support');
				break;
		}
	}
	$rootScope.makeSchedule = function () {
		var schedule = [];
		for (var i = 0; i < 7; i++) {
			schedule.push({
				enabled: true,
				lapses: [
					{
						open: {
							hour: 0,
							minute: 0
						},
						close: {
							hour: 23,
							minute: 59
						}
					}
				],
			});
		}
		return schedule;
	}
	$rootScope.showSchedule = function (schedule, cb, options) {
		options = options || {};
		if (typeof options.autosave === 'undefined' || options.autosave === undefined || options.autosave === null) {
			options.autosave = true;
		}
		schedule = $scope.getJson(schedule);
		MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/schedule.html', {
			scope: $scope,
		}).then(function (modal) {
			modals.push(modal);
			modal.show();
			modal.scope.curDay = null;
			modal.scope.autosave = options.autosave;
			modal.scope.schedule = JSON.parse(JSON.stringify(schedule));
			modal.scope.changeDay = function (day) {
				if (modal.scope.curDay == day) modal.scope.curDay = null;
				else modal.scope.curDay = day;
			}
			modal.scope.hide = function () {
				modal.hide();
				modal.remove();
			}
			modal.scope.edit = function (index) {
				modal.scope.showLapse(index, modal.scope.schedule[modal.scope.curDay].lapses[index]);
			}
			modal.scope.add = function () {
				modal.scope.showLapse();
			}
			modal.scope.remove = function (index) {
				modal.scope.schedule[modal.scope.curDay].lapses.splice(index, 1);
				if (options.autosave) {
					modal.scope.save();
				}
			}
			modal.scope.save = function () {
				if (modal.scope.curDay !== null) {
					modal.scope.schedule[modal.scope.curDay].lapses = $rootScope.reorderLapses(modal.scope.schedule[modal.scope.curDay].lapses);
				}
				cb(modal.scope.schedule);
				if (!options.autosave) {
					modal.scope.hide()
				}
			}
			modal.scope.showLapse = function (index, lapse) {
				MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/schedule_lapse.html', {
					scope: modal.scope,
				}).then(function (modal_lapse) {
					modals.push(modal_lapse);
					modal_lapse.show();
					modal_lapse.scope.autosave = options.autosave;
					modal.scope.edit_mode = false;
					modal_lapse.scope.timeCheck = {
						hour: '0',
						minute: '0',
					};
					if (lapse) {
						modal.scope.edit_mode = true;
						modal_lapse.scope.lapse = JSON.parse(JSON.stringify(lapse));
						modal_lapse.scope.lapse.open.hour = modal_lapse.scope.lapse.open.hour + '';
						modal_lapse.scope.lapse.open.minute = modal_lapse.scope.lapse.open.minute + '';
						modal_lapse.scope.lapse.close.hour = modal_lapse.scope.lapse.close.hour + '';
						modal_lapse.scope.lapse.close.minute = modal_lapse.scope.lapse.close.minute + '';
					} else {
						modal_lapse.scope.lapse = {
							open: {
								hour: '0',
								minute: '0'
							},
							close: {
								hour: '23',
								minute: '59'
							}
						}
					}
					modal_lapse.scope.hours = [];
					for (var i = 0; i < 24; i++) {
						var text = (i < 10 ? '0' : '') + i
						if (!TIME_FORMAT_24) {
							if (i == 0) text = '12 ' + $scope.translate('AM');
							else if (i == 12) text = '12 ' + $scope.translate('PM');
							else if (i < 12) text = (i < 10 ? '0' : '') + i + ' ' + $scope.translate('AM');
							else if (i < 24) text = ((i - 12) < 10 ? '0' : '') + (i - 12) + ' ' + $scope.translate('PM');
						}
						modal_lapse.scope.hours.push({
							text: text,
							hour: i
						});
					}
					modal_lapse.scope.minutes = [];
					for (var i = 0; i < 60; i++) {
						var text = (i < 10 ? '0' : '') + i
						modal_lapse.scope.minutes.push({
							text: text,
							minute: i
						});
					}
					modal_lapse.scope.checkTime = function () {
						modal_lapse.scope.timeCheck.hour = modal_lapse.scope.lapse.open.hour;
						modal_lapse.scope.timeCheck.minute = '0';
						if (modal_lapse.scope.lapse.open.hour * 1 > modal_lapse.scope.lapse.close.hour * 1
							|| (modal_lapse.scope.lapse.open.hour * 1 == modal_lapse.scope.lapse.close.hour * 1
								&& modal_lapse.scope.lapse.open.minute * 1 > modal_lapse.scope.lapse.close.minute * 1)) {
							modal_lapse.scope.lapse.close.hour = '23';
							modal_lapse.scope.lapse.close.minute = '59';
						}
						if (modal_lapse.scope.lapse.open.hour * 1 == modal_lapse.scope.lapse.close.hour * 1) {
							modal_lapse.scope.timeCheck.minute = parseInt(modal_lapse.scope.lapse.open.minute) + 1;
							modal_lapse.scope.timeCheck.minute = modal_lapse.scope.timeCheck.minute + '';
						}
						if (modal_lapse.scope.lapse.open.hour * 1 == modal_lapse.scope.lapse.close.hour * 1
							&& modal_lapse.scope.lapse.open.minute * 1 == 59) modal_lapse.scope.timeCheck.minute = '59';
						if (options.autosave && modal.scope.edit_mode) {
							modal_lapse.scope.save();
						}
					}
					modal_lapse.scope.save = function () {
						if (!modal.scope.edit_mode) return;
						modal_lapse.scope.lapse.open.hour = parseInt(modal_lapse.scope.lapse.open.hour);
						modal_lapse.scope.lapse.open.minute = parseInt(modal_lapse.scope.lapse.open.minute);
						modal_lapse.scope.lapse.close.hour = parseInt(modal_lapse.scope.lapse.close.hour);
						modal_lapse.scope.lapse.close.minute = parseInt(modal_lapse.scope.lapse.close.minute);
						//valid lapse
						var openNew = (modal_lapse.scope.lapse.open.hour * 60) + modal_lapse.scope.lapse.open.minute * 1;
						var closeNew = (modal_lapse.scope.lapse.close.hour * 60) + modal_lapse.scope.lapse.close.minute * 1;
						var openOld = 0;
						var closeOld = 0;
						var valid = true;
						for (var i = 0; i < modal.scope.schedule[modal.scope.curDay].lapses.length; i++) {
							openOld = modal.scope.schedule[modal.scope.curDay].lapses[i].open.hour * 60 + modal.scope.schedule[modal.scope.curDay].lapses[i].open.minute * 1;
							closeOld = modal.scope.schedule[modal.scope.curDay].lapses[i].close.hour * 60 + modal.scope.schedule[modal.scope.curDay].lapses[i].close.minute * 1;
							if (i != index) {
								if (openNew < openOld && closeNew > closeOld) valid = false;
								if (openNew < openOld && closeNew > openOld) valid = false;
								if (openNew > openOld && closeNew < closeOld) valid = false;
								if (openNew < closeOld && closeNew > closeOld) valid = false;
							};
						}

						//end valid lapse
						if (valid) {
							Object.assign(lapse, modal_lapse.scope.lapse);

							modal_lapse.scope.lapse = JSON.parse(JSON.stringify(lapse));
							modal_lapse.scope.lapse.open.hour = modal_lapse.scope.lapse.open.hour + '';
							modal_lapse.scope.lapse.open.minute = modal_lapse.scope.lapse.open.minute + '';
							modal_lapse.scope.lapse.close.hour = modal_lapse.scope.lapse.close.hour + '';
							modal_lapse.scope.lapse.close.minute = modal_lapse.scope.lapse.close.minute + '';
							if (options.autosave) {
								modal.scope.save();
							}
							if (!options.autosave) {
								modal_lapse.scope.hide();
							}
						} else {
							MyAlert.show($scope.translate('SCHEDULE_CONFLICT'));
							modal_lapse.scope.lapse = JSON.parse(JSON.stringify(lapse));
							modal_lapse.scope.lapse.open.hour = modal_lapse.scope.lapse.open.hour + '';
							modal_lapse.scope.lapse.open.minute = modal_lapse.scope.lapse.open.minute + '';
							modal_lapse.scope.lapse.close.hour = modal_lapse.scope.lapse.close.hour + '';
							modal_lapse.scope.lapse.close.minute = modal_lapse.scope.lapse.close.minute + '';
						}
					}
					modal_lapse.scope.add = function () {
						modal_lapse.scope.lapse.open.hour = parseInt(modal_lapse.scope.lapse.open.hour);
						modal_lapse.scope.lapse.open.minute = parseInt(modal_lapse.scope.lapse.open.minute);
						modal_lapse.scope.lapse.close.hour = parseInt(modal_lapse.scope.lapse.close.hour);
						modal_lapse.scope.lapse.close.minute = parseInt(modal_lapse.scope.lapse.close.minute);
						//valid lapse
						var openNew = (modal_lapse.scope.lapse.open.hour * 60) + modal_lapse.scope.lapse.open.minute * 1;
						var closeNew = (modal_lapse.scope.lapse.close.hour * 60) + modal_lapse.scope.lapse.close.minute * 1;
						var openOld = 0;
						var closeOld = 0;
						var valid = true;
						for (var i = 0; i < modal.scope.schedule[modal.scope.curDay].lapses.length; i++) {
							openOld = modal.scope.schedule[modal.scope.curDay].lapses[i].open.hour * 60 + modal.scope.schedule[modal.scope.curDay].lapses[i].open.minute * 1;
							closeOld = modal.scope.schedule[modal.scope.curDay].lapses[i].close.hour * 60 + modal.scope.schedule[modal.scope.curDay].lapses[i].close.minute * 1;
							if (openNew <= openOld && closeNew >= closeOld) valid = false;
							if (openNew < openOld && closeNew > openOld) valid = false;
							if (openNew >= openOld && closeNew <= closeOld) valid = false;
							if (openNew < closeOld && closeNew > closeOld) valid = false;
						}
						if (valid) {
							modal.scope.schedule[modal.scope.curDay].lapses.push(modal_lapse.scope.lapse);
							modal_lapse.scope.hide();
							if (options.autosave) {
								modal.scope.save();
							}
						} else {
							MyAlert.show($scope.translate('SCHEDULE_CONFLICT'));
							modal_lapse.scope.lapse = {
								open: {
									hour: '0',
									minute: '0'
								},
								close: {
									hour: '23',
									minute: '59'
								}
							}
						}

						//
						// modal.scope.schedule[modal.scope.curDay].lapses.push(modal_lapse.scope.lapse);
						// modal_lapse.scope.hide();
					}
					modal_lapse.scope.hide = function () {
						modal_lapse.hide();
						modal_lapse.remove();
					}
					var mode_aux = modal.scope.edit_mode && true;
					modal.scope.edit_mode = false;
					modal_lapse.scope.checkTime();
					modal.scope.edit_mode = mode_aux;
				});
			}
			$(document).ready(function () {
				$('[data-toggle="popover"]').popover({ html: true })
			});
			/***Show Bottom Help***/
		});
	}

	$rootScope.getDateAgo = function (date) {
		var stillUtc = moment.utc(date).toDate();
		var dateMessage = moment(stillUtc).local().format('YYYY-MM-DD HH:mm:ss');
		return $rootScope.parseDateMessage(dateMessage);
	}

	$rootScope.parseDateMessage = function (date) {
		var parts_date = date.split(' ');
		var o_date = new Date(parts_date[0].split('-')[0], parts_date[0].split('-')[1] - 1, parts_date[0].split('-')[2], parts_date[1].split(':')[0], parts_date[1].split(':')[1], parts_date[1].split(':')[2], 0);
		var month = o_date.getMonth() + 1;
		var date = o_date.getFullYear() + (month < 10 ? '/0' : '/') + month + (o_date.getDate() < 10 ? '/0' : '/') + o_date.getDate();
		var hour = o_date.getHours();
		var minute = (o_date.getMinutes() < 10 ? ':0' : ':') + o_date.getMinutes();
		var sec = (o_date.getSeconds() < 10 ? ':0' : ':') + o_date.getSeconds();
		if (!TIME_FORMAT_24) {
			if (hour == 0) time = '12' + minute + sec + ' ' + $scope.translate('AM');
			else if (hour < 12) time = (hour < 10 ? '0' : '') + hour + minute + sec + ' ' + $scope.translate('AM');
			else if (hour == 12) time = hour + minute + sec + ' ' + $scope.translate('PM');
			else if (hour > 12) time = ((hour - 12) < 10 ? '0' : '') + (hour - 12) + minute + sec + ' ' + $scope.translate('PM');
		} else time = ((hour < 10) ? '0' : '') + hour + minute + sec;
		return date + ' ' + time;
	}
	$rootScope.sortByStatus = function (status) {
		var returnOrder = '';
		if (status.tab == 'pending') {
			returnOrder = returnOrder + 'a';
		};
		if (status.tab == 'in_progress') {
			returnOrder = returnOrder + 'b';
		};
		if (status.tab == 'completed') {
			returnOrder = returnOrder + 'c';
		};
		if (status.tab == 'cancelled') {
			returnOrder = returnOrder + 'd';
		};
		return returnOrder;
	}
	Extensions.runAction('enter_root_editor', null, $scope);
});
_controllers.controller('listingCtrl', function ($scope, $rootScope, $interval, $timeout, $state, MyModal, MyAlert, MyLoading, gUser, Ordering/*newlistingCtrl*/) {
	if (!$scope.editorAvilable) {
		return $state.go(app_states.homeScreen);
	}
	$scope.filterBusinessType = '';
	$scope.business = [];
	$scope.getLanguage(function () {
		$rootScope.pageTitle = $scope.translate('FRONT_VISUALS_RESTAURANTS')
	});
	MyLoading.show($scope.translate('LOADING') + '...');
	Ordering.business.all({
		mode: 'dashboard',
		params: 'name,slug,logo,header,food,alcohol,groceries,laundry,enabled,city,metafields',
		limit: 50
	}, function (res) {
		MyLoading.hide();
		if (!res.error) {
			for (var i = 0; i < res.result.length; i++) {
				if (!res.result[i].logo) res.result[i].logo = 'img/dummy_logo.png';
				if (!res.result[i].header) res.result[i].header = 'img/dummy_header.png';
			}
			$scope.business = res.result;
			$scope.filteredBusiness = res.result;
			Extensions.runAction('after_listing_editor_view', res.result, $scope);
			Ordering.business.all({
				mode: 'dashboard',
				params: 'name,slug,logo,header,food,alcohol,groceries,laundry,enabled,city,metafields',
				offset: 50
			}, function (res) {
				for (var i = 0; i < res.result.length; i++) {
					if (!res.result[i].logo) res.result[i].logo = 'img/dummy_logo.png';
					if (!res.result[i].header) res.result[i].header = 'img/dummy_header.png';
				}
				$scope.business = $scope.business.concat(res.result);
			});
		} else MyAlert.show(res.result);
	});
	$scope.cities = [];
	$scope.curBusiness = {
		name: '',
		slug: '',
		tax_type: 1,
		tax: 0,
		minimum: 0,
		email: '',
		address: '',
		location: null,
		owner_id: gUser.getData().id,
		//address: ADDRESS.street,
		delivery_price: 0,
		service_fee: 0,
		percentage_usage_fee: 0,
		fixed_usage_fee: 0,
		schedule: JSON.stringify($scope.makeSchedule())
	}

	$scope.selectBusinessType = function ($event, type) {
		$event.preventDefault();
		$scope.filterBusinessType = type;
		var filtered = [];
		if (type == '') {
			filtered = $scope.business;
		} else {
			for (var i = 0; i < $scope.business.length; i++) {
				if (type == 'food' && $scope.business[i].food) filtered.push($scope.business[i]);
				else if (type == 'alcohol' && $scope.business[i].alcohol) filtered.push($scope.business[i]);
				else if (type == 'groceries' && $scope.business[i].groceries) filtered.push($scope.business[i]);
				else if (type == 'laundry' && $scope.business[i].laundry) filtered.push($scope.business[i]);
			}
		}
		$scope.filteredBusiness = filtered;
	}
	$scope.delete = function (business, $event) {
		$event.stopPropagation();
		MyAlert.confirm($scope.translate('QUESTION_DELETE_BUSINESS')).then(function (res) {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.business.delete({
				id: business
			}, function (res) {
				if (!res.error) {
					for (var i = 0; i < $scope.filteredBusiness.length; i++) {
						if ($scope.filteredBusiness[i].id == business) {
							$scope.filteredBusiness.splice(i, 1);
						}
					}
					for (var i = 0; i < $scope.business.length; i++) {
						if ($scope.business[i].id == business) {
							$scope.business.splice(i, 1);
						}
					}
					MyLoading.success($scope.translate('BUSINESS_DELETED'), 1500);
				} else {
					MyAlert.show(res.message);
					MyLoading.hide();
				}
			});
		});
	}
	$scope.copy = function (business) {
		MyAlert.confirm($scope.translate('QUESTION_COPY_BUSINESS')).then(function (res) {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.business.duplicate({
				id: business
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					$scope.business.push(res.result);
				} else MyAlert.show(res.result);
			});
		});
	}
	$scope.edit = function (slug) {
		$state.go('main.business-editor', { slug: slug });
	}
	$scope.changeBusinessStatus = function (business) {
		MyLoading.toast($scope.translate('LOADING') + '...');
		Ordering.business.update({
			id: business.id,
			enabled: business.enabled,
		}, function (res) {
			if (res.error) {
				business.enabled = !business.enabled;
				MyLoading.hide();
			} else MyLoading.success($scope.translate('BUSINESS_STATE_CHANGED'), 1500);
		});
	}

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
	$(document).ready(function () {
		/***Show Bottom Help***/
		$('[data-toggle="popover"]').popover({ html: true });
		/***Position bottom ButtomHelp***/
		$('#buttonFixed').css({
			'bottom': $('.footer').height() + 15 + 'px',
		});
	});
	Extensions.runAction('enter_businesses_editor_view', null, $scope);
});

_controllers.controller('editBusinessCtrl', function ($scope, $rootScope, $state, $timeout, MyAlert, MyLoading, MyModal, Ordering, gUser, gCart, gCreateOrderBuyer, hotRegisterer, $http/*neweditBusinessCtrl*/) {
	$(document).ready(function () {
		$('[data-toggle="popover"]').popover({ html: true })
	});
	if (!$scope.editorAvilable) {
		return $state.go(app_states.homeScreen);
	}
	var curTimeout = null
	$scope.deal = {};
	$scope.users = [];
	$scope.business = [];
	$scope.cities = [];
	$scope.curUser = gUser.getData();
	$scope.curCategoryName = '';
	$scope.selectedCategory = {};
	$scope.configs = {};
	$scope.model = '';
	$scope.businessTypes = [];
	$scope.activatedBusinessTypes = [];
	$timeout(function () {
		window.scrollTo(0, 0);
	}, 250);
	MyLoading.show();
	if (!$scope.editorAvilable) {
		return $state.go(app_states.homeScreen);
	}
	$scope.initView = function () {
		$scope.getLanguage(function (err, list, dictionary) {
			if ($state.params.slug) {
				Ordering.users.all({
					params: 'name,middle_name,lastname,second_lastname,level',
					where: [{
						attribute: 'level',
						value: ['0', '2']
					}]
				}, function (res) {
					if (!res.error) $scope.users = res.result;
					else MyAlert.show(res.result);
				});
				Ordering.countries.all({}, function (res) {
					if (!res.error) {
						for (var i = 0; i < res.result.length; i++) {
							$scope.cities = $scope.cities.concat(res.result[i].cities);
						}
					}
					else MyAlert.show(res.result);
				});
				Ordering.dropdownoptions.all({ params: 'id,name,city_id,enabled' }, function (res) {
					if (!res.error) {
						$scope.dropdownoptions = res.result;
					}
				});
				Ordering.configs.all({ mode: 'dictionary' }, function (res) {
					if (!res.error) {
						$scope.configs = res.result;
					}
				});
				Ordering.business.get({ id_or_slug: $state.params.slug, mode: 'dashboard' }, function (res) {
					if (!res.error) {
						MyLoading.hide();
						if (!res.result) return $state.go('main.notfound');
						if (res.result.categories.length > 0) {
							for (var i = 0; i < res.result.categories.length; i++) {
								if (res.result.categories[i].rank == 1) $scope.selectCategory(res.result.categories[i]);
							}
						}
						$scope.deal = res.result;
						if ($scope.deal.types && $scope.deal.types.length > 0) {
							$scope.deal.types.forEach(function (type) {
								$scope.activatedBusinessTypes.push(type.id);
							});
						};

						Ordering.business_types.all({}, function (res) {
							$scope.businessTypes = res.result.filter(function (type) {
								return type.enabled
							});
							$scope.deal.types.map(function (type) {
								$scope.businessTypes.map(function (businessType) {
									if (businessType.id === type.id) {
										businessType.activated = true;
									}
								})
							})
						});

						Ordering.business.all({
							mode: 'dashboard',
							params: 'id,name',
						}, function (res) {
							$scope.business = res.result.filter(function (business) {
								return business.id != $scope.deal.id;
							});
						});

						$scope.deal.order_default_priority = $scope.deal.order_default_priority + '';

						$rootScope.pageTitle = $scope.translate('EDIT_BUTTON') + ' ' + $scope.deal.name;
						Extensions.runAction('after_business_editor_view', res.result, $scope);
					}
				});
			}
		});
	}

	$scope.changeBusinessName = function (name) {
		if (curTimeout) $timeout.cancel(curTimeout);
		curTimeout = $timeout(function () {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.business.update({
				id: $scope.deal.id,
				name: name
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					MyLoading.success($scope.translate('BUSINESS_NAME_SAVED'), 1500);
				} else MyAlert.show(res.message);
			});
		}, 0);
	}

	$scope.changeBusinessOwner = function (provider) {
		if (provider == '') return;
		MyAlert.confirm($scope.translate('QUESTION_CHANGE_BUSINESS_OWNER')).then(function () {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.business.update({
				id: $scope.deal.id,
				owner_id: provider,
				owners: JSON.stringify([provider * 1])
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					MyLoading.success($scope.translate('BUSINESS_OWNER_CHANGED'), 1500);
					$scope.deal.owner_id = provider;
				} else MyAlert.show(res.result);
			});
		});
	}

	$scope.changeBusinessStatus = function (business) {
		MyLoading.toast($scope.translate('LOADING') + '...');
		Ordering.business.update({
			id: $scope.deal.id,
			enabled: $scope.deal.enabled,
		}, function (res) {
			if (!res.error) {
				business.status = !business.status;
				MyLoading.hide();
				MyLoading.success($scope.translate('BUSINESS_STATE_CHANGED'), 1500);
			} else console.log(res.result)
		});
	}
	/* Start Categories */
	$scope.categorySelected = 0;
	$scope.selectCategory = function (category) {
		category.products.forEach(function (product) {
			if (product.inventoried) {
				product._inventory = product.quantity
			} else if (product.id && !product.inventoried) {
				product._inventory = 'NA'
			}
		})
		if ($scope.selectedCategory.id) $scope.selectedCategory = category;
		$scope.categorySelected = category.id;
		$scope.newProduct.category_id = $scope.categorySelected;
		Extensions.runAction('after_business_editor_open_category_view', category, $scope);
	}
	$scope.updateCategory = function (category) {
		MyLoading.toast($scope.translate('LOADING') + '...');
		Ordering.categories.update({
			id: category.id,
			business_id: $scope.deal.id,
			name: category.name,
			rank: category.rank,
			enabled: category.enabled
		}, function (res) {
			MyLoading.hide();
			if (!res.error) MyLoading.success($scope.translate('CATEGORY_SAVED'), 1500);
			else MyAlert.show(res.result);
		});
	}
	$scope.changeCategoryName = function (category) {
		if (curTimeout) $timeout.cancel(curTimeout);
		curTimeout = $timeout(function () {
			$scope.updateCategory(category);
		}, 0);
	}
	$scope.removeCategory = function (category) {
		MyAlert.confirm($scope.translate('QUESTION_DELETE_CATEGORY')).then(function (res) {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.categories.delete({
				id: category.id,
				business_id: $scope.deal.id
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					var categories = [];
					for (var i = 0; i < $scope.deal.categories.length; i++) {
						if ($scope.deal.categories[i].id != category.id) categories.push($scope.deal.categories[i]);
					}
					$scope.deal.categories = categories;
					MyLoading.success($scope.translate('CATEGORY_DELETED'), 2000);
				} else MyAlert.show(res.result);
			});
		});
	}
	$scope.addCategory = function (name) {
		if (name.trim() == '') return MyAlert.show($scope.translate('NAME_REQUIRED'));
		// MyAlert.confirm($scope.translate('QUESTION_ADD_CATEGORY')).then(function (res) {
		MyLoading.toast($scope.translate('LOADING') + '...');
		Ordering.categories.add({
			name: name,
			business_id: $scope.deal.id
		}, function (res) {
			MyLoading.hide();
			if (!res.error) {
				res.result.enabled = true;
				res.result.products = [];
				$scope.deal.categories.push(res.result);
				$scope.selectCategory(res.result);
				$('#curCategoryName').val('');
				MyLoading.success($scope.translate('CATEGORY_ADDED'), 2000);
				Extensions.runAction('after_business_editor_add_category_view', res.result, $scope);
			} else MyAlert.show(res.result);
		});
		// });
	}
	/* Finish Categories */
	/* Start Products */
	$scope.filterProduct = '';
	$scope.newProduct = {
		name: '',
		price: '0.00',
		description: '',
		img: ''
	};
	$scope.changeFilterProduct = function (filterProduct) {
		$scope.filterProduct = filterProduct;
	}
	$scope.checkProduct = function (product) {
		if (!product.name || product.name.trim() == '') return new Error($scope.translate('NAME_REQUIRED'));
		//else if (!product.price || product.price <= 0 ) return new Error($scope.translate('PRICE_REQUIRED'));
		else return null;
	}
	$scope.addProduct = function (product) {
		var error = $scope.checkProduct(product);
		if (error) return MyAlert.show(error.message);
		MyLoading.toast($scope.translate('LOADING') + '...');
		Ordering.products.add({
			name: product.name,
			business_id: $scope.deal.id,
			description: product.description,
			price: product.price,
			category_id: product.category_id,
		}, function (res) {
			MyLoading.hide();
			if (!res.error) {
				res.result.extras = [];
				res.result.ingredients = [];
				var category = null;
				for (var i = 0; i < $scope.deal.categories.length; i++) {
					if ($scope.deal.categories[i].id == res.result.category_id) {
						$scope.deal.categories[i].products.push(res.result);
						category = $scope.deal.categories[i]
						break;
					}
				}
				$scope.newProduct = {
					name: '',
					price: '0.00',
					description: '',
					category_id: category.id,
				};
				$scope.selectCategory(category);
				MyLoading.success($scope.translate('PRODUCT_ADDED'), 1500);
			} else MyAlert.show(res.result);
		});
	}
	$scope.enableProduct = function (product) {
		Ordering.products.update({
			id: product.id,
			business_id: $scope.deal.id,
			category_id: product.category_id,
			enabled: product.enabled
		}, function (res) {
			MyLoading.hide();
			if (!res.error) {
				MyLoading.success($scope.translate('PRODUCT_SAVED'), 2000);
				if (close) $scope.hideMoreProductSettings();
			} else MyAlert.show(res.result);
		});
	}
	$scope.updateProduct = function (product, close) {
		var error = $scope.checkProduct(product);
		if (error) {
			return MyAlert.show(error.message);
		}
		var sku = -1;
		if (product.issku) sku = product.sku;
		else product.sku = '';
		var product_data = {
			id: product.id,
			business_id: $scope.deal.id,
			category_id: product.category_id,
			name: product.name,
			price: product.price,
			description: product.description,
			featured: product.featured,
			quantity: product.quantity,
			inventoried: product.inventoried,
			upselling: product.upselling,
			sku: sku
		}
		if (product.extras_a) {
			var extras = []
			for (var i = 0; i < product.extras_a.length; i++) {
				if (product.extras_a[i]) extras.push(i);
			}
			product_data.extras = JSON.stringify(extras);
		}
		if (product.description == "") {
			product_data.description = "\0";
		}
		MyLoading.toast($scope.translate('LOADING') + '...');
		Ordering.products.update(product_data, function (res) {
			MyLoading.hide();
			if (!res.error) {
				extras = [];
				if (product.extras_a) {
					for (var i = 0; i < $scope.deal.extras.length; i++) {
						if (product.extras_a[$scope.deal.extras[i].id]) extras.push($scope.deal.extras[i]);
					}
				}
				product.extras = extras;
				MyLoading.success($scope.translate('PRODUCT_SAVED'), 2000);
				if (close) $scope.hideMoreProductSettings();
			} else MyAlert.show(res.result);
		});
	}
	$scope.changeProductData = function (product) {
		if (curTimeout) $timeout.cancel(curTimeout);
		curTimeout = $timeout(function () {
			$scope.updateProduct(product);
		}, 0);
	}
	$scope.showMoreProductSettings = function (product) {
		if ($scope.modalOpening) return;
		$scope.modalOpening = true;
		$scope.hideMoreProductSettings();
		$scope.curProduct = product;
		$scope.model = 'Product';
		if (product.sku == -1) product.sku = null;
		if (product.sku) $scope.curProduct.issku = true;
		else $scope.curProduct.issku = false;
		//if ($scope.curProduct.ingredients != '') $scope.curProduct.ingredients_a = JSON.parse($scope.curProduct.ingredients);
		//else $scope.curProduct.ingredients_a = [];
		//var d_extras = $scope.deal.extras;
		//var p_extras = ($scope.curProduct.extras!='')?JSON.parse($scope.curProduct.extras):[];
		$scope.curProduct.extras_a = [];
		for (var i = 0; i < $scope.deal.extras.length; i++) {
			var sw = false;
			for (var j = 0; j < $scope.curProduct.extras.length; j++) {
				if ($scope.deal.extras[i].id == $scope.curProduct.extras[j].id) {
					sw = true;
					break;
				}
			}
			$scope.curProduct.extras_a[$scope.deal.extras[i].id] = sw;
		}
		MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/more-product-settings.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (more_product_settings) {
			modals.push(more_product_settings);
			$scope.more_product_settings = more_product_settings;
			$scope.more_product_settings.show();
			$scope.more_product_settings.name = 'Product';
			$scope.modalOpening = false;

			$scope.resetFields();
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.product_customfields.get({
				business_id: $scope.deal.id,
				category_id: $scope.curProduct.category_id,
				product_id: $scope.curProduct.id
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					console.log(res.result);
					if ($scope.curProduct.metafields)
						$scope.curProduct.metafields = res.result;
					else $scope.curProduct['metafields'] = res.result;
				} else MyAlert.show(res.result);
			});
		});
	}

	$scope.hideMoreProductSettings = function () {
		if ($scope.more_product_settings) {
			$scope.more_product_settings.hide();
			$scope.more_product_settings.remove();
		}
	}
	$scope.removeProduct = function (product) {
		MyAlert.confirm($scope.translate('QUESTION_DELETE_PRODUCT')).then(function (res) {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.products.delete({
				business_id: $scope.deal.id,
				category_id: product.category_id,
				id: product.id
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					for (var i = 0; i < $scope.deal.categories.length; i++) {
						for (var k = 0; k < $scope.deal.categories[i].products.length; k++) {
							if ($scope.deal.categories[i].products[k].id == product.id) $scope.deal.categories[i].products.splice(k, 1);
						}
					}
					MyLoading.success($scope.translate('PRODUCT_DELETED'), 2000);
				} else MyAlert.show(res.result);
			});
		});
	}
	/* Finish Products */
	/* Start Ingredients*/
	$scope.curNewIngredient = {
		name: '',
	}
	$scope.addIngredient = function (ingredient, product) {
		MyLoading.toast($scope.translate('LOADING') + '...');
		Ordering.ingredients.add({
			business_id: $scope.deal.id,
			category_id: product.category_id,
			product_id: product.id,
			name: ingredient.name,
		}, function (res) {
			MyLoading.hide();
			if (!res.error) {
				$scope.curProduct.ingredients.push(res.result);
				$scope.curNewIngredient = {
					name: ''
				};
				MyLoading.success($scope.translate('INGREDIENT_SAVED'), 1500);
			} else MyAlert.show(res.result);
		});
	}
	$scope.updateIngredient = function (ingredient, product) {
		MyLoading.toast($scope.translate('LOADING') + '...');
		Ordering.ingredients.update({
			id: ingredient.id,
			business_id: $scope.deal.id,
			category_id: product.category_id,
			product_id: ingredient.product_id,
			name: ingredient.name,
		}, function (res) {
			MyLoading.hide();
			if (!res.error) {
				MyLoading.success($scope.translate('INGREDIENT_SAVED'), 1500);
			} else MyAlert.show(res.result);
		});
	}

	$scope.removeIngredient = function (ingredient, product) {
		MyLoading.toast($scope.translate('LOADING') + '...');
		Ordering.ingredients.delete({
			id: ingredient.id,
			business_id: $scope.deal.id,
			category_id: product.category_id,
			product_id: ingredient.product_id,
		}, function (res) {
			MyLoading.hide();
			if (!res.error) {
				for (var i = 0; i < $scope.curProduct.ingredients.length; i++) {
					if ($scope.curProduct.ingredients[i].id == ingredient.id) {
						$scope.curProduct.ingredients.splice(i, 1);
						break;
					}
				}
				MyLoading.success($scope.translate('INGREDIENT_DELETED'), 1500);
			} else MyAlert.show(res.result);
		});
	}
	/* Start Ingredients*/
	/* Start Extras */
	$scope.curNewExtra = {
		name: ''
	};
	$scope.curNewSuboption = {
		name: '',
		price: 0
	};
	$scope.updateExtra = function (extra) {
		if (curTimeout) $timeout.cancel(curTimeout);
		curTimeout = $timeout(function () {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.extras.update({
				id: extra.id,
				business_id: $scope.deal.id,
				name: extra.name
			}, function (res) {
				MyLoading.hide();
				if (!res.error) MyLoading.success($scope.translate('EXTRA_SAVED'), 1500);
				else MyAlert.show(res.result);
			});
		}, 0);
	}
	$scope.addExtra = function (extra) {
		console.log(extra);
		MyLoading.toast($scope.translate('LOADING') + '...');
		Ordering.extras.add({
			business_id: $scope.deal.id,
			name: extra.name
		}, function (res) {
			MyLoading.hide();
			if (!res.error) {
				res.result.options = [];
				$scope.deal.extras.push(res.result);
				$scope.curNewExtra = {
					name: ''
				};
				MyLoading.success($scope.translate('EXTRA_ADDED'), 1500);
			} else MyAlert.show(res.result);
		});
	}
	$scope.removeExtra = function (extra) {
		MyAlert.confirm($scope.translate('QUESTION_DELETE_EXTRA')).then(function (res) {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.extras.delete({
				id: extra.id,
				business_id: $scope.deal.id
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					for (var i = 0; i < $scope.deal.extras.length; i++) {
						if ($scope.deal.extras[i].id == extra.id) {
							$scope.deal.extras.splice(i, 1);
							break;
						}
					}
					MyLoading.success($scope.translate('EXTRA_DELETED'), 2000);
				} else MyAlert.show(res.result);
			});
		});
	}

	$scope.showMoreProductOptionsSettings = function (product, extra) {
		if ($scope.modalOpening) return;
		$scope.modalOpening = true;
		$scope.hideMoreProductOptionsSettings();
		$scope.curProduct = product;
		$scope.model = 'ProductExtra';
		for (var i = 0; i < extra.options.length; i++) {
			extra.options[i].curNewSuboption = {
				name: '',
				price: 0
			};
			extra.options[i].last_min = extra.options[i].min;
			extra.options[i].last_max = extra.options[i].max;
			for (var j = 0; j < extra.options.length; j++) {
				if (extra.options[i].conditioned) {
					for (var k = 0; k < extra.options[j].suboptions.length; k++) {
						if (extra.options[j].suboptions[k].id == extra.options[i].respect_to /*&& extra.options[i].conditioned*/) {
							extra.options[i].option_respect_to = extra.options[j].id + "";
							extra.options[i].respect_to = extra.options[i].respect_to + "";
						}
					}
				} else {
					extra.options[i].option_respect_to = "";
					extra.options[i].respect_to = "";
				}
			}
		}
		MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/more-product-options-settings.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (more_product_options_settings) {
			modals.push(more_product_options_settings);
			$scope.more_product_options_settings = more_product_options_settings;
			more_product_options_settings.scope.extra = extra;
			$scope.more_product_options_settings.show().then(function () {
				Extensions.runAction('after_show_product_options_settings', more_product_options_settings, $scope);
			});
			$scope.more_product_options_settings.name = 'ProductExtra';
			$scope.modalOpening = false;

			$scope.resetFields();
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.product_extra_customfields.get({
				business_id: $scope.deal.id,
				extra_id: extra.id
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					console.log(res.result);
					more_product_options_settings.scope.extra['metafields'] = res.result;

				} else MyAlert.show(res.result);
			});
		});
	}

	$scope.hideMoreProductOptionsSettings = function () {
		if ($scope.more_product_options_settings) {
			$scope.more_product_options_settings.hide();
			$scope.more_product_options_settings.remove();
			$scope.model = 'Product';
		}
	}
	/* Finish Extras */
	/* Start Extra Options */
	$scope.updateExtraOption = function (option, extra) {
		if ($scope.checkExtraOption(option)) {
			option.min = option.last_min;
			option.max = option.last_max;
			return;
		}
		if (curTimeout) $timeout.cancel(curTimeout);
		curTimeout = $timeout(function () {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.options.update({
				id: option.id,
				business_id: $scope.deal.id,
				extra_id: extra.id,
				name: option.name,
				min: option.min,
				max: option.max,
				conditioned: option.conditioned,
				respect_to: option.respect_to,
				with_half_option: option.with_half_option,
				allow_suboption_quantity: option.allow_suboption_quantity,
				limit_suboptions_by_max: option.limit_suboptions_by_max,
				enabled: option.enabled
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					option.last_min = option.min;
					option.last_max = option.max;
					MyLoading.success($scope.translate('OPTION_SAVED'), 1500);
				} else MyAlert.show(res.result);
			});
		}, 0);
	}
	$scope.checkExtraOption = function (option) {
		if (!option.name || option.name.trim() == '') return new Error($scope.translate('OPTION_NAME_REQUIRED'));
		else if (option.min == null) return new Error($scope.translate('MIN_SELECT_REQUIRED'));
		else if (option.max == null) return new Error($scope.translate('MAX_SELECT_REQUIRED'));
		else if (option.min * 1 > option.max * 1) return new Error($scope.translate('MIN_MAX_CONDITION'));
		else return null;
	}
	$scope.checkExtraOptionSuboption = function (suboption) {
		if (!suboption.name || suboption.name.trim() == '') return new Error($scope.translate('CHOICE_NAME_REQUIRED'));
		else if (suboption.price == null) return new Error($scope.translate('CHOICE_PRICE_REQUIRED'));
		else return null;
	}
	$scope.checkSuboption = function (suboption, option) {
		var with_half_option = option && option.with_half_option === true;
		var allow_suboption_quantity = option && option.allow_suboption_quantity === true;
		var errors = [];
		if (!suboption.name || suboption.name.trim() == '') {
			errors.push($scope.translate('VALIDATION_ERROR_REQUIRED').replace('_attribute_', $scope.translate('NAME')));
		}
		if ((!suboption.price && suboption.price != 0) || (isNaN(suboption.price) && suboption.price.trim() == '')) {
			errors.push($scope.translate('VALIDATION_ERROR_REQUIRED').replace('_attribute_', $scope.translate('PRICE')));
		}
		if (with_half_option && (!suboption.half_price || (isNaN(suboption.half_price) && suboption.half_price.trim() == ''))) {
			errors.push($scope.translate('VALIDATION_ERROR_REQUIRED').replace('_attribute_', $scope.translate('HALF_PRICE')));
		}
		if (allow_suboption_quantity) {
			if (!suboption.max || (isNaN(suboption.max) && suboption.max.trim() == '')) {
				errors.push($scope.translate('VALIDATION_ERROR_REQUIRED').replace('_attribute_', $scope.translate('MAX')));
			}
			if (suboption.max && !isNaN(suboption.max) && suboption.max < 1) {
				errors.push($scope.translate('VALIDATION_ERROR_MIN_NUMERIC').replace('_attribute_', $scope.translate('MAX')).replace('_min_', '1'));
			}
		}
		return errors;
	}

	$scope.checkOption = function (option) {
		var errors = [];
		if (!option.name || option.name.trim() == '') {
			errors.push($scope.translate('VALIDATION_ERROR_REQUIRED').replace('_attribute_', $scope.translate('NAME')));
		}
		if (!option.min || (isNaN(option.min) && option.min.trim() == '')) {
			errors.push($scope.translate('VALIDATION_ERROR_REQUIRED').replace('_attribute_', $scope.translate('MIN')));
		}
		if (!option.max || (isNaN(option.max) && option.max.trim() == '')) {
			errors.push($scope.translate('VALIDATION_ERROR_REQUIRED').replace('_attribute_', $scope.translate('MAX')));
		}
		if (option.max && !isNaN(option.max) && option.max < 1) {
			errors.push($scope.translate('VALIDATION_ERROR_MIN_NUMERIC').replace('_attribute_', $scope.translate('MAX')).replace('_min_', '1'));
		}
		if (option.min && !isNaN(option.min) && option.max && !isNaN(option.max) && option.min > option.max) {
			errors.push($scope.translate('VALIDATION_ERROR_MIN_NUMERIC').replace('_attribute_', $scope.translate('MAX')).replace('_min_', option.min));
		}
		return errors;
	}

	// $scope.curNewOption = {};
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
			} else MyAlert.show(res.result);
		});
	}
	$scope.curNewOption = {
		name: '',
		min: 0,
		max: 1
	};

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
			limit_suboptions_by_max: option.limit_suboptions_by_max,
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
				option.limit_suboptions_by_max = false;
				MyLoading.success($scope.translate('OPTION_ADDED'), 1500);
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
					} else MyAlert.show(res.result);
				});
			} else MyAlert.show(res.result);
		});
	}
	$scope.removeSuboption = function (extra, option, suboption) {
		MyAlert.confirm($scope.translate('QUESTION_DELETE_CHOICE')).then(function (res) {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.suboptions.delete({
				id: suboption.id,
				business_id: $scope.deal.id,
				extra_id: extra.id,
				option_id: option.id
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					for (var i = 0; i < option.suboptions.length; i++) {
						if (option.suboptions[i].id == suboption.id) {
							option.suboptions.splice(i, 1);
							break;
						}
					}
					MyLoading.success($scope.translate('CHOICE_DELETED'), 1500);
					for (var i = 0; i < extra.options.length; i++) {
						if (extra.options[i].respect_to == suboption.id) {
							var c_option = extra.options[i];
							MyLoading.show($scope.translate('LOADING') + '...');
							Ordering.options.update({
								id: c_option.id,
								business_id: $scope.deal.id,
								extra_id: c_option.extra_id,
								conditioned: false
							}, function (res) {
								MyLoading.hide();
								if (!res.error) {
									c_option.conditioned = false;
									c_option.option_respect_to = '';
									c_option.respect_to = '';
								}
							});
						}
					}
				} else MyAlert.show(res.message);
			});
		});
	}
	$scope.updateExtraOptionChoice = function (extra, option, suboption) {
		if ((suboption.half_price && suboption.half_price == '.') || (suboption.price && suboption.price == '.')) {
			return;
		}
		MyLoading.toast($scope.translate('LOADING') + '...');
		Ordering.suboptions.update({
			id: suboption.id,
			business_id: $scope.deal.id,
			option_id: option.id,
			extra_id: extra.id,
			name: suboption.name,
			price: suboption.price,
			half_price: suboption.half_price,
			max: suboption.max,
			enabled: suboption.enabled
		}, function (res) {
			MyLoading.hide();
			if (!res.error) MyLoading.success($scope.translate('CHOICE_SAVED'), 1500);
			else MyAlert.show(res.result);
		});
	}
	$scope.removeExtraOption = function (extra, option) {
		MyAlert.confirm($scope.translate('QUESTION_DELETE_OPTION')).then(function (res) {
			if (res) {
				MyLoading.toast($scope.translate('LOADING') + '...');
				Ordering.options.delete({
					business_id: $scope.deal.id,
					extra_id: extra.id,
					id: option.id
				}, function (res) {
					MyLoading.hide();
					if (!res.error) {
						for (var i = 0; i < extra.options.length; i++) {
							if (extra.options[i].id == option.id) {
								extra.options.splice(i, 1);
								break;
							}
						}
						MyLoading.success($scope.translate('OPTION_DELETED'), 1500);
						for (var i = 0; i < extra.options.length; i++) {
							for (var j = 0; j < option.suboptions.length; j++) {
								if (extra.options[i].respect_to == option.suboptions[j].id) {
									var c_option = extra.options[i];
									Ordering.options.update({
										id: c_option.id,
										business_id: $scope.deal.id,
										extra_id: c_option.extra_id,
										conditioned: false
									}, function (res) {
										if (!res.error) {
											c_option.conditioned = false;
										}
									});
								}
							}
						}
					} else MyAlert.show(res.message);
				});
			}
		});
	}
	/* Finish Extra Options*/
	$scope.createOrder = function () {
		localStorageApp.setItem(STORE.CREATE_ORDER, 'true');
		gCreateOrderBuyer.setData({});
		gCart.setData([]);
		$state.go('main.business-createorder', { business: $scope.deal.slug });
	}
	/* Start Business info */
	$scope.showBusinessInfo = function () {
		$scope.hideBusinessInfo();
		MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/business-info.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (business_info) {
			$scope.deal.city_id = $scope.deal.city_id == null ? '' : $scope.deal.city_id.toString();
			business_info.scope.data = {
				curProvider: ""
			}
			if (ADDONS.business_multi_owners_module) {
				$scope.deal.owner_id = '';
			} else {
				$scope.deal.owner_id = $scope.deal.owners.length > 0 ? $scope.deal.owners[0].id.toString() : '';
			}
			business_info.scope.setProvider = function (provider) {
				business_info.scope.curProvider = provider;
			}
			business_info.scope.addBusinessOwner = function () {
				if (!business_info.scope.data.curProvider) return;
				MyAlert.confirm($scope.translate('QUESTION_ADD_BUSINESS_OWNER')).then(function () {
					MyLoading.toast($scope.translate('LOADING') + '...');
					var owners = $scope.deal.owners.map(function (own) {
						return own.id;
					});
					owners.push(business_info.scope.data.curProvider * 1)
					Ordering.business.update({
						id: $scope.deal.id,
						owners: JSON.stringify(owners)
					}, function (res) {
						MyLoading.hide();
						if (!res.error) {
							new_owner = $scope.users.find(function (user) {
								return user.id == business_info.scope.data.curProvider;
							})
							if (new_owner) $scope.deal.owners.push(new_owner);
							business_info.scope.data.curProvider = "";
							MyLoading.success($scope.translate('BUSINESS_OWNER_ADDED'), 1500);
						} else MyAlert.show(res.result);
					});
				});
			}
			business_info.scope.removeBusinessOwner = function (owner) {
				MyAlert.confirm($scope.translate('QUESTION_DELETE_BUSINESS_OWNER')).then(function () {
					MyLoading.toast($scope.translate('LOADING') + '...');
					var owners = $scope.deal.owners.map(function (own) {
						return own.id;
					});
					var index = owners.findIndex(function (own) {
						return own == owner;
					})
					owners.splice(index, 1);
					Ordering.business.update({
						id: $scope.deal.id,
						owners: JSON.stringify(owners)
					}, function (res) {
						MyLoading.hide();
						if (!res.error) {
							delete_owner = $scope.deal.owners.findIndex(function (user) {
								return user.id == owner;
							})
							// changeByfunc = true;
							// business_info.scope.data.curProvider = "";
							// business_info.scope.$apply(function () {
							// 	business_info.scope.curProvider = "";
							// })
							if (delete_owner != -1) $scope.deal.owners.splice(delete_owner, 1);
							MyLoading.success($scope.translate('BUSINESS_OWNER_DELETED'), 1500);
						} else MyAlert.show(res.result);
					});
				});
			}
			modals.push(business_info);
			$scope.business_info = business_info;
			$scope.business_info.show();
			$(document).ready(function () {
				$('[data-toggle="popover"]').popover({ html: true })
			});
			/***Show Bottom Help***/
		});
	}
	$scope.inBusiness = function (id) {
		var find = $scope.deal.owners.findIndex(function (owner) {
			return owner.id == id;
		});
		if (find != -1) return true;
		else return false;
	}
	$scope.hideBusinessInfo = function () {
		if ($scope.business_info) {
			$scope.business_info.hide();
			$scope.business_info.remove();
			$scope.curCollapse = -1;
		}
	}
	$scope.curCollapse = -1;
	$scope.map = null;
	$scope.curAddress = null;
	$scope.curInputAddress = '';
	$scope.changeCollapse = function (index) {
		if ($scope.curCollapse == index) $scope.curCollapse = -1;
		else {
			$scope.curCollapse = index;
			if (index == 2) {
				$timeout(function () {
					var position = { lat: 40.77473399999999, lng: -73.9653844 };
					if ($scope.deal.location && $scope.deal.location != 'null') {
						var b_location = $scope.getJson($scope.deal.location);
						if (b_location != null) position = { lat: b_location.lat, lng: b_location.lng };
					}
					var bi_map = document.getElementById('business-info-map');
					$scope.map = new google.maps.Map(bi_map, {
						center: position,
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
					var from_autocomplete = false;
					//function that handle the wheelEvent
					var bussy_scroll = false;
					function wheelEvent(event) {
						if (bussy_scroll) return;
						bussy_scroll = true;
						var e = window.event || e; // old IE support
						var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail))); //to know whether it was wheel up or down
						$scope.map.setZoom($scope.map.getZoom() + delta);
						setTimeout(function () {
							bussy_scroll = false;
						}, 250)
					}

					function zoomIn() {
						$scope.map.setZoom($scope.map.getZoom() + 1);
					}
					//normal event listener on the map container
					bi_map.addEventListener('mousewheel', wheelEvent, true);
					bi_map.addEventListener('DOMMouseScroll', wheelEvent, true);

					//same with the double click
					bi_map.addEventListener('dblclick', zoomIn, true);
					var input = document.getElementById('business-info-map-address');
					input.value = $scope.deal.address;
					$scope.curInputAddress = $scope.deal.address + '';
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
						from_autocomplete = true;
						var places = autocomplete.getPlace();
						$scope.map.setCenter(places.geometry.location);
						marker.setPosition(places.geometry.location);
						$scope.map.setZoom(18);
						$scope.$apply(function () {
							$scope.curAddress = places.geometry.location;
							$scope.deal.address = input.value;
							$scope.saveAddress();
						});
					});
					var timeout = null;
					$scope.map.addListener('center_changed', function () {
						if (from_autocomplete) {
							from_autocomplete = false;
							return;
						}
						if (timeout) clearTimeout(timeout);
						timeout = setTimeout(function () {
							marker.setPosition($scope.map.getCenter());
							$scope.$apply(function () {
								$scope.curAddress = $scope.map.getCenter();
								$scope.deal.address = input.value;
								$scope.saveAddress();
							});
						}, 200);
					});
				}, 150);
			} else if (index == 4) {
				Extensions.runAction('after_business_editor_open_gallery_view', $scope.deal.gallery, $scope);
			}
		}
	}
	$scope.changeTypes = function () {
		MyLoading.toast($scope.translate('LOADING') + '...');
		Ordering.business.update({
			id: $scope.deal.id,
			food: $scope.deal.food,
			alcohol: $scope.deal.alcohol,
			groceries: $scope.deal.groceries,
			laundry: $scope.deal.laundry,
		}, function (res) {
			MyLoading.hide();
			if (!res.error) MyLoading.success($scope.translate('BUSINESS_TYPE_SAVED'), 1500);
			else MyAlert.show(res.message);
		});
	}
	$scope.updateDynamicTypes = function (businessType) {
		MyLoading.toast($scope.translate('LOADING') + '...');
		if (businessType.activated) {
			$scope.activatedBusinessTypes.push(businessType.id);
		} else {
			$scope.activatedBusinessTypes.splice($scope.activatedBusinessTypes.find(function (typeID) {
				typeID == businessType.id
			}), 1);
		};
		Ordering.business.update({
			id: $scope.deal.id,
			types: $scope.activatedBusinessTypes,
		}, function (res) {
			MyLoading.hide();
			if (!res.error) MyLoading.success($scope.translate('BUSINESS_TYPE_SAVED'), 1500);
			else MyAlert.show(res.result)
		})
	}
	$scope.hours = [];
	for (var i = 0; i < 29; i++) {
		var text = (i < 10) ? '0' + i : '' + i;
		if (i < 12) text += ' ' + $scope.translate('AM');
		else if (i == 12) text += ' ' + $scope.translate('PM');
		else if (i > 12 && i < 24) text = (((i - 12) < 10) ? '0' + (i - 12) : '' + (i - 12)) + ' ' + $scope.translate('PM');
		else if (i == 24) text = '12 ' + $scope.translate('AM');
		else if (i > 24) text = (((i - 24) < 10) ? '0' + (i - 24) : '' + (i - 24)) + ' ' + $scope.translate('AM');
		$scope.hours.push({
			hour: '' + i,
			text: text,
			textWithoutMeridian: (i < 10) ? '0' + i : '' + i
		});
	}
	$scope.minutes = [];
	for (var i = 0; i < 60; i++) {
		$scope.minutes.push({
			minute: '' + i,
			text: (i < 10) ? '0' + i : '' + i
		});
	}
	$scope.changeAbout = function () {
		if (curTimeout) $timeout.cancel(curTimeout);
		curTimeout = $timeout(function () {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.business.update({
				id: $scope.deal.id,
				about: $scope.deal.about,
				description: $scope.deal.description,
			}, function (res) {
				MyLoading.hide();
				if (!res.error) MyLoading.success($scope.translate('BUSINESS_ABOUT_SAVED'), 1500);
				else MyAlert.show(res.result);
			});
		}, 0);
	}
	$scope.cleanSchedule = function (schedule) {
		var schedule = JSON.parse(JSON.stringify(schedule));
		for (var i = 0; i < schedule.length; i++) {
			schedule[i].open.hour = parseInt(schedule[i].open.hour);
			schedule[i].open.minute = parseInt(schedule[i].open.minute);
			schedule[i].close.hour = parseInt(schedule[i].close.hour);
			schedule[i].close.minute = parseInt(schedule[i].close.minute);
		}
		return schedule;
	}
	$scope.changeSchedule = function () {
		if (curTimeout) $timeout.cancel(curTimeout);
		curTimeout = $timeout(function () {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.business.update({
				id: $scope.deal.id,
				schedule: JSON.stringify($scope.cleanSchedule($scope.deal.schedule))
			}, function (res) {
				MyLoading.hide();
				if (!res.error) MyLoading.success($scope.translate('BUSINESS_SCHEDULE_SAVED'), 1500);
				else MyAlert.show(res.result);
			});
		}, 0);
	}
	$scope.changeCity = function (city) {
		Ordering.business.update({
			id: $scope.deal.id,
			city_id: city
		}, function (res) {
			MyLoading.hide();
			if (!res.error) {
				$scope.deal.city_id = city;
				MyLoading.success($scope.translate('CITY_SAVED'), 1500);
			} else MyAlert.show(res.result);
		});
	}
	$scope.changeAddressNotes = function (address_notes) {
		MyLoading.toast($scope.translate('LOADING') + '...');
		Ordering.business.update({
			id: $scope.deal.id,
			address_notes: address_notes
		}, function (res) {
			MyLoading.hide();
			if (!res.error) {
				MyLoading.success($scope.translate('BUSINESS_ADDRESS_SAVED'), 1500);
			} else MyAlert.show(res.result);
		});
	}
	$scope.changeAddress = function (curAddress) {
		if (!GOOGLE_AUTOCOMPLETE_SELECTION_REQUIRED) {
			$scope.deal.address = curAddress;
			$scope.saveAddress();
		}
	}
	$scope.saveAddress = function () {
		$scope.deal.location = $scope.getJson($scope.deal.location);
		var position = {};
		if ($scope.deal.location) {
			var position = $scope.deal.location != 'null' ? $scope.deal.location : {};
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
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.business.update({
				id: $scope.deal.id,
				address: document.getElementById('business-info-map-address').value,
				address_notes: $scope.deal.address_notes,
				location: JSON.stringify(position),
				timezone: data.timeZoneId
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					$scope.deal.timezone = data.timeZoneId;
					$scope.deal.address = document.getElementById('business-info-map-address').value;
					$scope.curInputAddress = $scope.deal.address + '';
					$scope.deal.location = position;
					MyLoading.success($scope.translate('BUSINESS_ADDRESS_SAVED'), 1500);
				} else MyAlert.show(res.result);
			});
		});
	}
	$scope.removeGallery = function (item) {
		MyAlert.confirm($scope.translate('QUESTION_DELETE_GALLERY_ITEM')).then(function () {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.business_gallery.delete({
				business_id: $scope.deal.id,
				id: item.id
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					for (var i = 0; i < $scope.deal.gallery.length; i++) {
						if ($scope.deal.gallery[i].id == item.id) {
							$scope.deal.gallery.splice(i, 1);
							break;
						}
					}
					MyLoading.success($scope.translate('GALLERY_ITEM_DELETED'), 1500);
				} else MyAlert.show(res.result);
			});
		});
	}
	$scope.newVideo = {
		type: 'youtube',
		url: ''
	};
	$scope.getUrlVideoGallery = function (item) {
		item.url = $(item.link).attr('src');
	}
	$scope.addVideoGallery = function () {
		if ($scope.newVideo.url == '') MyAlert.show($scope.translate('VIDEO_URL_REQUIRED'));
		else {
			var iframe = '<iframe width="560" height="315" src="' + $scope.newVideo.url + '" frameborder="0" allowfullscreen></iframe>';
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.business_gallery.add({
				business_id: $scope.deal.id,
				video: $scope.newVideo.url,
				type: 2
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					$scope.deal.gallery.push(res.result);
					$scope.newVideo.url = '';
					MyLoading.success($scope.translate('GALLERY_VIDEO_ADDED'), 1500);
				} else MyAlert.show(res.result);
			});
		}
	}
	$scope.customMetafields = [];
	$scope.newField = {
		value_type: VALUE_TYPE.TEXT,
		key: '',
		value: ''
	};
	$scope.value_regx = '';
	$scope.buffVal = '';
	$scope.tmpVal = '';
	$scope.valueTypes = Object.values(VALUE_TYPE);
	$scope.jsonEditor = null;
	$scope.onChangeType = function () {
		if ($scope.newField.value_type == VALUE_TYPE.INTEGER) {
			$scope.value_regx = /-?[0-9]+$/;
		} else if ($scope.newField.value_type == VALUE_TYPE.DECIMAL) {
			$scope.value_regx = /\d*\.?\d*$/;
		} else {
			$scope.value_regx = '';
		}
		if ($scope.newField.value_type == VALUE_TYPE.BOOLEAN) $scope.newField.value = '0';
		else $scope.newField.value = '';
		$scope.newField.key = '';
		$scope.buffVal = '';

		if ($scope.newField.value_type == VALUE_TYPE.JSON) {
			setTimeout(function () {
				$scope.jsonEditor = $scope.initJsonEditor('custom_editor');
				$scope.value = $scope.jsonEditor.get();
			}, 200);
		}
	}

	$scope.isBoolVal = function (type) {
		if (type == VALUE_TYPE.BOOLEAN) return true;
		else return false;
	}

	$scope.isJsonVal = function (type) {
		if (type == VALUE_TYPE.JSON) return true;
		else return false;
	}

	$scope.inpType = function (type) {
		if (type == VALUE_TYPE.TEXT) return 'text';
		else return 'number';
	}

	$scope.isValid = function (value) {
		if ($scope.newField.value_type == VALUE_TYPE.TEXT) return;

		console.log($scope.newField.value)
		if (value == '') $scope.buffVal = '';
		if (value == undefined) {
			// if ($scope.buffVal == '') {
			$scope.newField.value = $scope.buffVal;
			return;
			// }
			// $scope.newField.value = $scope.newField.value.substring(0, value.length - 1);
		} else {
			if (Number.isNaN(parseInt(value))) {
				$scope.newField.value = $scope.buffVal;
			} if (Number.isNaN(parseFloat(value))) {
				$scope.newField.value = $scope.buffVal;
			} else {
				if ($scope.newField.value_type == VALUE_TYPE.INTEGER) {
					$scope.buffVal = parseInt(value);
				} else if ($scope.newField.value_type == VALUE_TYPE.DECIMAL) {
					$scope.buffVal = '' + parseFloat(value);
					if ($scope.buffVal.length < value.length) {
						if (!$scope.buffVal.includes('.') && value.slice(value.length - 1) == '.')
							$scope.newField.value = $scope.buffVal = value;
						else $scope.newField.value = $scope.buffVal;
					}
				} else {
					$scope.buffVal = value;
					$scope.newField.value = $scope.buffVal;
				}
			}
		}
	}
	$scope.getEnterEvent = function (e, model, extra, option, suboption) {
		if (e.charCode == 13) {
			if (model == 'ProductExtra')
				$scope.addCustomField(model, extra);
			else if (model == 'ProductExtraOption')
				$scope.addCustomField(model, extra, option);
			else if (model == 'ProductExtraSubOption')
				$scope.addCustomField(model, extra, option, suboption);
			else $scope.addCustomField(model);
		}
	}
	$scope.isValidating = function (type) {
		if (type == 'key') {
			if ($scope.newField.key) {
				$scope.newField.key = $scope.newField.key.replace(/\s/g, '');
			}
		}
	}
	$scope.resetFields = function () {
		$scope.newField.key = '';
		$scope.newField.value = '';
		$scope.newField.value_type = VALUE_TYPE.TEXT;
	}

	$scope.addCustomField = function (model, extra, option, suboption) {
		if ($scope.newField.value_type == VALUE_TYPE.JSON) {
			$scope.newField.value = JSON.stringify($scope.jsonEditor.get());
			if (!isValidJSONString) {
				MyAlert.show('Invalid JSON format! Please enter correct json format');
				return;
			}
		}

		if ($scope.newField.key == '') {
			MyAlert.show('Please enter correct key.');
			return;
		}

		if ($scope.newField.value == '' || $scope.newField.value == undefined) {
			MyAlert.show('Please enter correct value.');
			return;
		}

		$scope.newField['business_id'] = $scope.deal.id;
		if (model == 'Category')
			$scope.newField['category_id'] = $scope.selectedCategory.id;
		else if (model == 'Product') {
			$scope.newField['category_id'] = $scope.curProduct.category_id;
			$scope.newField['product_id'] = $scope.curProduct.id;
		}
		else if (model == 'ProductExtra') {
			if (extra) $scope.newField['extra_id'] = extra.id;
		}
		else if (model == 'ProductExtraOption') {
			if (extra) $scope.newField['extra_id'] = extra.id;
			if (extra && option) { $scope.newField['option_id'] = option.id; }
		}
		else if (model == 'ProductExtraSubOption') {
			if (extra) $scope.newField['extra_id'] = extra.id;
			if (extra && option) { $scope.newField['option_id'] = option.id; }
			if (extra && option && suboption) { $scope.newField['suboption_id'] = suboption.id; }
		}

		if ($scope.newField.value_type == VALUE_TYPE.BOOLEAN) $scope.newField.value = JSON.parse($scope.newField.value);
		else if ($scope.newField.value_type == VALUE_TYPE.INTEGER) $scope.newField.value = parseInt($scope.newField.value);
		else if ($scope.newField.value_type == VALUE_TYPE.DECIMAL) $scope.newField.value = parseFloat($scope.newField.value);

		MyLoading.toast($scope.translate('LOADING') + '...');

		if (model == 'Business') {
			Ordering.business_customfields.add(
				$scope.newField
				, function (res) {
					MyLoading.hide();
					if (!res.error) {
						console.log(res.result);
						$scope.deal.metafields.push(res.result);
						$scope.resetFields();
						MyLoading.success($scope.translate('CUSTOM_FIELD_ADDED'), 1500);
					} else MyAlert.show(res.result);
				});
		} else if (model == 'Category') {
			Ordering.category_customfields.add(
				$scope.newField
				, function (res) {
					MyLoading.hide();
					if (!res.error) {
						console.log(res.result);
						if ($scope.customMetafields)
							$scope.customMetafields.push(res.result);
						$scope.resetFields();
						MyLoading.success($scope.translate('CUSTOM_FIELD_ADDED'), 1500);
					} else MyAlert.show(res.result);
				});
		} else if (model == 'Product') {
			Ordering.product_customfields.add(
				$scope.newField
				, function (res) {
					MyLoading.hide();
					if (!res.error) {
						console.log(res.result);
						if ($scope.curProduct.metafields)
							$scope.curProduct.metafields.push(res.result);
						else $scope.curProduct['metafields'] = [res.result];
						$scope.resetFields();
						MyLoading.success($scope.translate('CUSTOM_FIELD_ADDED'), 1500);
					} else MyAlert.show(res.result);
				});
		} else if (model == 'ProductExtra') {
			Ordering.product_extra_customfields.add(
				$scope.newField
				, function (res) {
					MyLoading.hide();
					if (!res.error) {
						console.log(res.result);
						$scope.more_product_options_settings.scope.extra.metafields.push(res.result);
						$scope.resetFields();
						MyLoading.success($scope.translate('CUSTOM_FIELD_ADDED'), 1500);
					} else MyAlert.show(res.result);
				});
		} else if (model == 'ProductExtraOption') {
			Ordering.product_extra_option_customfields.add(
				$scope.newField
				, function (res) {
					MyLoading.hide();
					if (!res.error) {
						console.log(res.result);
						if ($scope.customMetafields)
							$scope.customMetafields.push(res.result);
						else $scope.customMetafields = [res.result];
						$scope.resetFields();
						MyLoading.success($scope.translate('CUSTOM_FIELD_ADDED'), 1500);
					} else MyAlert.show(res.result);
				});
		} else if (model == 'ProductExtraSubOption') {
			Ordering.product_extra_soption_customfields.add(
				$scope.newField
				, function (res) {
					MyLoading.hide();
					if (!res.error) {
						console.log(res.result);
						if ($scope.customMetafields)
							$scope.customMetafields.push(res.result);
						else $scope.customMetafields = [res.result];
						$scope.resetFields();
						MyLoading.success($scope.translate('CUSTOM_FIELD_ADDED'), 1500);
					} else MyAlert.show(res.result);
				});

		} else {

		}
	}

	$scope.removeCustomField = function (item, model, data) {
		MyAlert.confirm($scope.translate('QUESTION_DELETE_CUSTOM_FIELD_ITEM')).then(function () {
			MyLoading.toast($scope.translate('LOADING') + '...');
			if (model == 'Business') {
				Ordering.business_customfields.delete({
					business_id: $scope.deal.id,
					id: item.id
				}, function (res) {
					MyLoading.hide();
					if (!res.error) {
						for (var i = 0; i < $scope.deal.metafields.length; i++) {
							if ($scope.deal.metafields[i].id == item.id) {
								$scope.deal.metafields.splice(i, 1);
								break;
							}
						}
						MyLoading.success($scope.translate('CUSTOM_FIELD_ITEM_DELETED'), 1500);
					} else MyAlert.show(res.result);
				});
			} else if (model == 'Category') {
				Ordering.category_customfields.delete({
					business_id: $scope.deal.id,
					category_id: $scope.selectedCategory.id,
					id: item.id
				}, function (res) {
					MyLoading.hide();
					if (!res.error) {
						for (var i = 0; i < $scope.customMetafields.length; i++) {
							if ($scope.customMetafields[i].id == item.id) {
								$scope.customMetafields.splice(i, 1);
								break;
							}
						}
						MyLoading.success($scope.translate('CUSTOM_FIELD_ITEM_DELETED'), 1500);
					} else MyAlert.show(res.result);
				});
			} else if (model == 'Product') {
				Ordering.product_customfields.delete({
					business_id: $scope.deal.id,
					category_id: $scope.curProduct.category_id,
					product_id: $scope.curProduct.id,
					id: item.id
				}, function (res) {
					MyLoading.hide();
					if (!res.error) {
						for (var i = 0; i < $scope.curProduct.metafields.length; i++) {
							if ($scope.curProduct.metafields[i].id == item.id) {
								$scope.curProduct.metafields.splice(i, 1);
								break;
							}
						}
						MyLoading.success($scope.translate('CUSTOM_FIELD_ITEM_DELETED'), 1500);
					} else MyAlert.show(res.result);
				});
			} else if (model == 'ProductExtra') {
				Ordering.product_extra_customfields.delete({
					business_id: $scope.deal.id,
					extra_id: data.extra.id,
					id: item.id
				}, function (res) {
					MyLoading.hide();
					if (!res.error) {
						for (var i = 0; i < $scope.more_product_options_settings.scope.extra.metafields.length; i++) {
							if ($scope.more_product_options_settings.scope.extra.metafields[i].id == item.id) {
								$scope.more_product_options_settings.scope.extra.metafields.splice(i, 1);
								break;
							}
						}
						MyLoading.success($scope.translate('CUSTOM_FIELD_ITEM_DELETED'), 1500);
					} else MyAlert.show(res.result);
				});
			} else if (model == 'ProductExtraOption') {
				if (!data) return;
				Ordering.product_extra_option_customfields.delete({
					business_id: $scope.deal.id,
					extra_id: data.extra.id,
					option_id: data.option.id,
					id: item.id
				}, function (res) {
					MyLoading.hide();
					if (!res.error) {
						for (var i = 0; i < $scope.customMetafields.length; i++) {
							if ($scope.customMetafields[i].id == item.id) {
								$scope.customMetafields.splice(i, 1);
								break;
							}
						}
						MyLoading.success($scope.translate('CUSTOM_FIELD_ITEM_DELETED'), 1500);
					} else MyAlert.show(res.result);
				});
			} else if (model == 'ProductExtraSubOption') {
				if (!data) return;
				Ordering.product_extra_soption_customfields.delete({
					business_id: $scope.deal.id,
					extra_id: data.extra.id,
					option_id: data.option.id,
					suboption_id: data.suboption.id,
					id: item.id
				}, function (res) {
					MyLoading.hide();
					if (!res.error) {
						for (var i = 0; i < $scope.customMetafields.length; i++) {
							if ($scope.customMetafields[i].id == item.id) {
								$scope.customMetafields.splice(i, 1);
								break;
							}
						}
						MyLoading.success($scope.translate('CUSTOM_FIELD_ITEM_DELETED'), 1500);
					} else MyAlert.show(res.result);
				});
			}
		});
	}
	$scope.business = [];

	$scope.openEditView = function (data, model) {
		if ($scope.modalOpening) return;
		$scope.modalOpening = true;
		if (model == 'Category') $scope.selectedCategory = data;
		$scope.model = model;
		MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/add-custom-field.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (add_custom_fields) {
			modals.push(add_custom_fields);
			$scope.add_custom_fields = add_custom_fields;
			$scope.add_custom_fields.show();
			$scope.add_custom_fields.name = 'Custom';
			$scope.modalOpening = false;

			$scope.resetFields();
			add_custom_fields.scope.model = model;
			add_custom_fields.scope.data = data;
			$scope.customMetafields = [];
			MyLoading.toast($scope.translate('LOADING') + '...');
			if (model == 'Category') {
				Ordering.category_customfields.get({
					business_id: $scope.deal.id,
					category_id: $scope.selectedCategory.id
				}, function (res) {
					MyLoading.hide();
					if (!res.error) {
						console.log(res.result);
						$scope.customMetafields = res.result;

					} else MyAlert.show(res.result);
				});
			} else if (model == 'Product') {
				Ordering.category_customfields.get({
					business_id: $scope.deal.id,
					category_id: $scope.curProduct.category_id
				}, function (res) {
					MyLoading.hide();
					if (!res.error) {
						console.log(res.result);
						$scope.customMetafields = res.result;

					} else MyAlert.show(res.result);
				});
			} else if (model == 'ProductExtraOption') {
				Ordering.product_extra_option_customfields.get({
					business_id: $scope.deal.id,
					extra_id: data.extra.id,
					option_id: data.option.id
				}, function (res) {
					MyLoading.hide();
					if (!res.error) {
						console.log(res.result);
						$scope.customMetafields = res.result;

					} else MyAlert.show(res.result);
				});
			} else if (model == 'ProductExtraSubOption') {
				add_custom_fields.scope.curdata = data;
				if (data.suboption.sku == -1) data.suboption.sku = null;
				if (data.suboption.sku) add_custom_fields.scope.curdata.suboption['issku'] = true;
				else add_custom_fields.scope.curdata.suboption['issku'] = false;
				Ordering.product_extra_soption_customfields.get({
					business_id: $scope.deal.id,
					extra_id: data.extra.id,
					option_id: data.option.id,
					suboption_id: data.suboption.id
				}, function (res) {
					MyLoading.hide();
					if (!res.error) {
						console.log(res.result);
						$scope.customMetafields = res.result;

					} else MyAlert.show(res.result);
				});
			}
			add_custom_fields.scope.hideModal = function () {
				$scope.add_custom_fields.hide();
				$scope.add_custom_fields.remove();
				$scope.model = 'ProductExtra';
				$scope.resetFields();
			}
		});
	}
	$scope.$on('modal.hidden', function (even, modal) {
		if (modal.name == 'Custom')
			$scope.model = 'ProductExtra';
		else if (modal.name == 'ProductExtra')
			$scope.model = 'Product';

		$scope.resetFields();
	});

	$scope.updateProductSubOption = function (extra, option, suboption) {
		if (curTimeout) $timeout.cancel(curTimeout);
		curTimeout = $timeout(function () {
			MyLoading.toast($scope.translate('LOADING') + '...');
			var sku = -1;
			if (suboption.issku) sku = suboption.sku;
			else $scope.add_custom_fields.scope.curdata.suboption.sku = '';
			Ordering.suboptions.update({
				id: suboption.id,
				business_id: $scope.deal.id,
				option_id: option.id,
				extra_id: extra.id,
				sku: sku
			}, function (res) {
				MyLoading.hide();
				if (!res.error) MyLoading.success($scope.translate('SKU_UPDATED'), 1500);
				else MyAlert.show(res.result);
			});
		}, 0);
	}

	$scope.initJsonEditor = function (id_string, init_json) {
		var container = document.getElementById(id_string);
		var options = {
			"mode": "tree",
			"search": false,
			"indentation": 2
		};
		var editor = new JSONEditor(container, options, init_json);

		return editor;
	}

	/* Finish Business info */
	/* Start Business menu */
	$scope.menus = [];
	$scope.curCategory = -1;
	$scope.toggleCategory = function (category) {
		if ($scope.curCategory == category) $scope.curCategory = -1;
		else $scope.curCategory = category;
	}

	$scope.showBusinessSchedule = function () {
		$scope.showSchedule($scope.deal.schedule, function (schedule) {
			Ordering.business.update({
				id: $scope.deal.id,
				schedule: angular.toJson(schedule)
			}, function (res) {
				if (!res.error) {
					Object.assign($scope.deal.schedule, schedule);
					MyLoading.success($scope.translate('BUSINESS_SCHEDULE_SAVED'), 1500);
				} else MyAlert.show(res.result);
			});
		});
	}

	$scope.showBusinessMenu = function () {
		if ($scope.modalOpening) return;
		$scope.modalOpening = true;
		$scope.hideBusinessMenu();
		MyLoading.toast($scope.translate('LOADING') + '...');
		MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/business-menu.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (business_menu) {
			modals.push(business_menu);
			$scope.business_menu = business_menu;
			$scope.business_menu.show();
			$scope.modalOpening = false;
			MyLoading.hide();
			$(document).ready(function () {
				$('[data-toggle="popover"]').popover({ html: true })
			});
			/***Show Bottom Help***/
		});
		//});
	}
	$scope.showWebhooks = function () {
		if ($scope.modalOpening) return;
		$scope.modalOpening = true;
		$scope.hideBusinessMenu();
		MyLoading.toast($scope.translate('LOADING') + '...');
		$scope.curWebhook = {
			hook: '',
			url: '',
			delay: '0'
		};
		MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/webhooks.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (business_webhooks) {
			modals.push(business_webhooks);
			$scope.business_webhooks = business_webhooks;
			$scope.business_webhooks.show();
			$scope.modalOpening = false;
			MyLoading.hide();

			business_webhooks.scope.add = function (curWebhook) {
				MyLoading.toast($scope.translate('LOADING') + '...');
				Ordering.business.webhooks.add({
					business_id: $scope.deal.id,
					hook: curWebhook.hook,
					url: curWebhook.url,
					delay: curWebhook.delay
				}, function (res) {
					MyLoading.hide();
					if (!res.error) {
						MyLoading.success($scope.translate('WEBHOOK_ADDED'), 1500);
						$scope.deal.webhooks.push(res.result);
						$scope.curWebhook = {
							hook: '',
							url: '',
							delay: '0'
						};
					} else MyAlert.show(res.result);
				});
			};

			business_webhooks.scope.update = function (webhook) {
				MyLoading.toast($scope.translate('LOADING') + '...');
				Ordering.business.webhooks.update({
					id: webhook.id,
					business_id: $scope.deal.id,
					hook: webhook.hook,
					url: webhook.url,
					delay: webhook.delay
				}, function (res) {
					MyLoading.hide();
					if (!res.error) {
						MyLoading.success($scope.translate('WEBHOOK_SAVED'), 1500);
					} else MyAlert.show(res.result)
				});
			};
			business_webhooks.scope.remove = function (webhook) {
				MyLoading.toast($scope.translate('LOADING') + '...');
				Ordering.business.webhooks.delete({
					id: webhook.id,
					business_id: $scope.deal.id,
				}, function (res) {
					MyLoading.hide();
					if (!res.error) {
						MyLoading.success($scope.translate('WEBHOOK_REMOVED'), 1500);
						for (var i = 0; i < $scope.deal.webhooks.length; i++) {
							if ($scope.deal.webhooks[i].id == webhook.id) $scope.deal.webhooks.splice(i, 1);
						}
					} else MyAlert.show(res.result)
				});
			};
			$(document).ready(function () {
				$('[data-toggle="popover"]').popover({ html: true })
			});
			/***Show Bottom Help***/
		});



		//});
	}

	$scope.hideBusinessWebhooks = function () {
		if ($scope.business_webhooks) {
			$scope.business_webhooks.hide();
			$scope.business_webhooks.remove();
		}
	}

	$scope.hideBusinessMenu = function () {
		if ($scope.business_menu) {
			$scope.business_menu.hide();
			$scope.business_menu.remove();
		}
	}

	$scope.curNewMenu = {
		id: -1,
		name: '',
		delivery: true,
		pickup: true,
		comment: '',
		schedule: $scope.makeSchedule(),
		products: []
	};
	$scope.showSharedCategories = function (category) {
		MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/business-menu-settings.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (business_share_category) {
			modals.push(business_share_category);
			business_share_category.scope.check_business = {
				all: true
			};
			$scope.business_share_category = business_share_category;
			business_share_category.scope.tab = 1;
			business_share_category.scope.category = category;
			business_share_category.scope.isCategory = true;

			for (var i = 0; i < $scope.business.length; i++) {
				var check = false;
				if (business_share_category.scope.category.businesses == undefined) business_share_category.scope.category.businesses = [];
				for (var j = 0; j < business_share_category.scope.category.businesses.length; j++) {
					if ($scope.business[i].id == business_share_category.scope.category.businesses[j].id) {
						check = true;
						break;
					}
				}
				if (!check) business_share_category.scope.check_business.all = false;
				business_share_category.scope.check_business[$scope.business[i].id] = check;
			}
			business_share_category.scope.toggleAllBusiness = function () {
				for (var i = 0; i < $scope.business.length; i++) {
					business_share_category.scope.check_business[$scope.business[i].id] = business_share_category.scope.check_business.all;
				}
				business_share_category.scope.saveBusiness(function (cb) {
					if (cb) {
						var categoryIndex = $scope.deal.categories.findIndex(function (category) {
							return category.id == business_share_category.scope.category.id
						})
						if (business_share_category.scope.check_business.all) {
							$scope.deal.categories[categoryIndex].businesses = $scope.business;
						} else {
							$scope.deal.categories[categoryIndex].businesses = [];
						}
					}
				});
			}
			business_share_category.scope.toggleBusiness = function (business) {
				var all = true;
				for (var key in business_share_category.scope.check_business) {
					if (key != 'all' && !business_share_category.scope.check_business[key]) {
						all = false;
						break;
					}
				}
				business_share_category.scope.check_business.all = all;
				business_share_category.scope.saveBusiness(function (cb) {
					if (cb) {
						if (business_share_category.scope.check_business[business.id]) {
							$scope.deal.categories.forEach(function (category) {
								if (category.id == business_share_category.scope.category.id) {
									category.businesses.push(business);
								}
							});
						} else {
							for (var i = 0; i < business_share_category.scope.category.id.length; i++) {
								if ($scope.deal.categories[i].id == business_share_category.scope.menu.id) {
									for (var k = 0; k < business_share_category.scope.category.id[i].businesses.length; k++) {
										if ($scope.deal.categories[i].businesses[k].id == business.id) {
											$scope.deal.categories[i].businesses.splice(k, 1);
										}
									}
								}
							}
						}
					}
				});
			}
			business_share_category.scope.saveBusiness = function (cb) {
				var checkeds = [];
				for (var key in business_share_category.scope.check_business) {
					if (business_share_category.scope.check_business[key] && key != 'all')
						checkeds.push(key * 1);
				}
				MyLoading.toast($scope.translate('LOADING') + '...');
				Ordering.categories.update({
					id: business_share_category.scope.category.id,
					business_id: $scope.deal.id,
					shared: JSON.stringify(checkeds)
				}, function (res) {
					MyLoading.hide();
					if (!res.error) {
						cb(true)
						MyLoading.success($scope.translate('BUSINESS_SAVED'), 1500);
					} else {
						MyAlert.show('error');
						cb(false)
					}
				})
			}
			business_share_category.show();
		})
	}
	$scope.showBusinessMenuSttings = function (menu) {
		if ($scope.modalOpening) return;
		$scope.modalOpening = true;
		//$scope.initMenu(menu);
		MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/business-menu-settings.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (business_menu_settings) {
			modals.push(business_menu_settings);
			$scope.business_menu_settings = business_menu_settings;
			business_menu_settings.scope.menu = menu;
			var categories = JSON.parse(JSON.stringify($scope.deal.categories));
			var categories_shared = JSON.parse(JSON.stringify($scope.deal.categories_shared));
			categories = categories.concat(categories_shared)
			for (var i = 0; i < categories.length; i++) {
				categories[i].all = true;
				categories[i].none = true;
				if (categories[i].products.length > 0) {
					for (var j = 0; j < categories[i].products.length; j++) {
						categories[i].products[j].selected = false;
						for (var k = 0; k < menu.products.length; k++) {
							if (categories[i].products[j].id == menu.products[k].id) {
								categories[i].products[j].selected = true;
								categories[i].none = false;
							}
						}
						if (!categories[i].products[j].selected) {
							categories[i].all = false;
						}
					}
				} else {
					categories[i].all = false;
					categories[i].none = true;
				}
			}
			business_menu_settings.scope.categories = categories;
			business_menu_settings.scope.tab = 0;
			business_menu_settings.scope.changeTab = function (tab) {
				business_menu_settings.scope.tab = tab;
			}
			business_menu_settings.scope.check_business = {
				all: true
			};
			for (var i = 0; i < $scope.business.length; i++) {
				var check = false;
				if (business_menu_settings.scope.menu.businesses == undefined) business_menu_settings.scope.menu.businesses = [];
				for (var j = 0; j < business_menu_settings.scope.menu.businesses.length; j++) {
					if ($scope.business[i].id == business_menu_settings.scope.menu.businesses[j].id) {
						check = true;
						break;
					}
				}
				if (!check) business_menu_settings.scope.check_business.all = false;
				business_menu_settings.scope.check_business[$scope.business[i].id] = check;
			}
			business_menu_settings.scope.toggleAllBusiness = function () {
				for (var i = 0; i < $scope.business.length; i++) {
					business_menu_settings.scope.check_business[$scope.business[i].id] = business_menu_settings.scope.check_business.all;
				}
				business_menu_settings.scope.saveBusiness(function (cb) {
					if (cb) {
						var menuIndex = $scope.deal.menus.findIndex(function (menu) {
							return menu.id == business_menu_settings.scope.menu.id
						})
						if (business_menu_settings.scope.check_business.all) {
							$scope.deal.menus[menuIndex].businesses = $scope.business;
						} else {
							$scope.deal.menus[menuIndex].businesses = [];
						}
					}
				});
			}
			business_menu_settings.scope.toggleBusiness = function (business) {
				var all = true;
				for (var key in business_menu_settings.scope.check_business) {
					if (key != 'all' && !business_menu_settings.scope.check_business[key]) {
						all = false;
						break;
					}
				}
				business_menu_settings.scope.check_business.all = all;
				business_menu_settings.scope.saveBusiness(function (cb) {
					if (cb) {
						if (business_menu_settings.scope.check_business[business.id]) {
							$scope.deal.menus.forEach(function (menu) {
								if (menu.id == business_menu_settings.scope.menu.id) {
									menu.businesses.push(business);
								}
							});
						} else {
							for (var i = 0; i < business_menu_settings.scope.menu.id.length; i++) {
								if ($scope.deal.menus[i].id == business_menu_settings.scope.menu.id) {
									for (var k = 0; k < business_menu_settings.scope.menu.id[i].businesses.length; k++) {
										if ($scope.deal.menus[i].businesses[k].id == business.id) {
											$scope.deal.menus[i].businesses.splice(k, 1);
										}
									}
								}
							}
						}
					}
				});
			}
			business_menu_settings.scope.saveBusiness = function (cb) {
				var checkeds = [];
				for (var key in business_menu_settings.scope.check_business) {
					if (business_menu_settings.scope.check_business[key] && key != 'all')
						checkeds.push(key * 1);
				}
				MyLoading.toast($scope.translate('LOADING') + '...');
				Ordering.menus.update({
					id: business_menu_settings.scope.menu.id,
					business_id: $scope.deal.id,
					shared: JSON.stringify(checkeds)
				}, function (res) {
					MyLoading.hide();
					if (!res.error) {
						cb(true)
						MyLoading.success($scope.translate('BUSINESS_SAVED'), 1500);
					} else {
						MyAlert.show('error');
						cb(false)
					}
				})
			}
			business_menu_settings.scope.toggleAll = function (category) {
				for (var i = 0; i < category.products.length; i++) {
					category.products[i].selected = !category.all;
				}
				category.none = category.all;
				category.all = !category.all;
			}
			business_menu_settings.scope.toggleProduct = function (category) {
				var all = true;
				var none = true;
				for (var i = 0; i < category.products.length; i++) {
					if (category.products[i].selected) none = false;
					else all = false;
				}
				category.all = all;
				category.none = none;
			}
			business_menu_settings.scope.toggleAllShared = function (category) {
				for (var i = 0; i < category.products.length; i++) {
					category.products[i].selected = !category.all;
				}
				category.none = category.all;
				category.all = !category.all;
			}
			business_menu_settings.scope.toggleProductShared = function (category) {
				var all = true;
				var none = true;
				for (var i = 0; i < category.products.length; i++) {
					if (category.products[i].selected) none = false;
					else all = false;
				}
				category.all = all;
				category.none = none;
			}
			business_menu_settings.scope.editSchedule = function () {
				$scope.showSchedule(business_menu_settings.scope.menu.schedule, function (schedule) {
					if (business_menu_settings.scope.menu.id == -1) Object.assign(business_menu_settings.scope.menu.schedule, schedule);
					else {
						MyLoading.show($scope.translate('LOADING') + '...');
						Ordering.menus.update({
							id: business_menu_settings.scope.menu.id,
							business_id: $scope.deal.id,
							schedule: angular.toJson(schedule)
						}, function (res) {
							MyLoading.hide();
							if (!res.error) {
								Object.assign(business_menu_settings.scope.menu.schedule, schedule);
								MyLoading.success($scope.translate('MENU_SAVED'), 1500);
							} else MyAlert.show(res.result);
						});
					}
				});
			}
			$scope.resetFields();
			$scope.business_menu_settings.scope.getMenuCustoms = function () {
				MyLoading.toast($scope.translate('LOADING') + '...');
				$scope.newField['business_id'] = $scope.deal.id;
				$scope.newField['menu_id'] = menu.id;
				Ordering.menus.custom_fields.get($scope.newField, function (res) {
					MyLoading.hide();
					if (!res.error) {
						business_menu_settings.scope.menu['metafields'] = res.result;
					} else MyAlert.show(res.result);
				});
			}
			$scope.business_menu_settings.scope.addMenuCustom = function () {
				if ($scope.newField.value_type == VALUE_TYPE.JSON)
					$scope.newField.value = JSON.stringify($scope.jsonEditor.get());
				MyLoading.toast($scope.translate('LOADING') + '...');
				$scope.newField['business_id'] = $scope.deal.id;
				$scope.newField['menu_id'] = menu.id;
				Ordering.menus.custom_fields.add($scope.newField, function (res) {
					MyLoading.hide();
					$scope.resetFields();
					if (!res.error) {
						business_menu_settings.scope.menu.metafields.push(res.result);
						MyLoading.success($scope.translate('MENU_SAVED'), 1500);
					} else MyAlert.show(res.result);
				});
			}
			$scope.business_menu_settings.scope.removeMenuCustom = function (item) {
				MyLoading.toast($scope.translate('LOADING') + '...');
				$scope.newField['business_id'] = $scope.deal.id;
				$scope.newField['menu_id'] = menu.id;
				$scope.newField['id'] = item.id;
				Ordering.menus.custom_fields.delete($scope.newField, function (res) {
					MyLoading.hide();
					if (!res.error) {
						for (var i = 0; i < business_menu_settings.scope.menu.metafields.length; i++) {
							if (business_menu_settings.scope.menu.metafields[i].id == item.id) {
								business_menu_settings.scope.menu.metafields.splice(i, 1);
								break;
							}
						}
						MyLoading.success($scope.translate('CUSTOM_FIELD_ITEM_DELETED'), 1500);
					} else MyAlert.show(res.result);
				});
			}
			$scope.business_menu_settings.scope.getKeyEvent = function (e) {
				if (e.charCode == 13)
					$scope.business_menu_settings.scope.addMenuCustom();
			}
			if (menu.id > 0) $scope.business_menu_settings.scope.getMenuCustoms();
			$scope.business_menu_settings.show();
			$scope.modalOpening = false;
		});
	}
	$scope.hideBusinessMenuSettings = function () {
		if ($scope.business_menu_settings) {
			//$scope.initMenu();
			$scope.business_menu_settings.hide();
			$scope.business_menu_settings.remove();
		}
		if ($scope.business_share_category) {
			//$scope.initMenu();
			$scope.business_share_category.hide();
			$scope.business_share_category.remove();
		}
	}
	$scope.enabledSharedMenu = function (menu) {
		MyLoading.toast($scope.translate('LOADING') + '...');
		var data = {
			id: menu.id,
			business_id: $scope.deal.id,
			enabled: menu.enabled
		}
		Ordering.business_menus_shared.update(data, function (res) {
			MyLoading.hide();
			if (!res.error) {
				//$scope.hideBusinessMenuSettings();
				// if (new_products.length > 0) menu.products = new_products;
				MyLoading.success($scope.translate('MENU_SAVED'), 1500);
			} else MyAlert.show(res.result);
		});
	}
	$scope.deleteSharedMenus = function (menu) {
		MyAlert.confirm($scope.translate('QUESTION_DELETE_MENU')).then(function () {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.business_menus_shared.delete({
				id: menu.id,
				business_id: $scope.deal.id
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					for (var i = 0; i < $scope.deal.menus_shared.length; i++) {
						if ($scope.deal.menus_shared[i].id == menu.id) {
							$scope.deal.menus_shared.splice(i, 1);
							break;
						}
					}
					MyLoading.success($scope.translate('MENU_DELETED'), 1500);
				} else MyAlert.show(res.result);
			});
		});
	}
	$scope.openMoreMenusShares = function (menu) {
		MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/menus-shared-products.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (modal_menus_shared) {
			modal_menus_shared.show()
			modal_menus_shared.scope.products = menu.products
			modal_menus_shared.scope.close = function () {
				modal_menus_shared.hide()
				modal_menus_shared.remove()
			}
			var timeout = null;
			modal_menus_shared.scope.updateProductShared = function (product) {
				if (timeout) clearTimeout(timeout)
				timeout = setTimeout(function () {
					MyLoading.toast($scope.translate('LOADING') + '...');
					product.menu_id = menu.id
					product.business_id = $scope.deal.id
					var update_product = {
						id: product.id,
						menu_id: menu.id,
						business_id: $scope.deal.id,
						price: product.price,
						quantity: product.quantity
					}
					Ordering.business_menus_shared.products.update(update_product, function (res) {
						MyLoading.hide();
						if (!res.error) {
							MyLoading.success($scope.translate('PRODUCT_SAVED'), 1500);
						} else MyAlert.show(res.result);
					});
				}, 500)
			}
			modal_menus_shared.scope.updateToggleProductShared = function (product) {
				timeout = setTimeout(function () {
					MyLoading.toast($scope.translate('LOADING') + '...');
					product.menu_id = menu.id
					product.business_id = $scope.deal.id
					var update_product = {
						id: product.id,
						menu_id: menu.id,
						business_id: $scope.deal.id,
						inventoried: product.inventoried,
						upselling: product.upselling,
						enabled: product.enabled,
						featured: product.featured,
					}
					Ordering.business_menus_shared.products.update(update_product, function (res) {
						MyLoading.hide();
						if (!res.error) {
							MyLoading.success($scope.translate('PRODUCT_SAVED'), 1500);
						} else MyAlert.show(res.result);
					});
				}, 500)
			}
		});
	}
	$scope.openExtraOptionsMenuShared = function (productExtraOptions) {
		console.log(productExtraOptions)
		MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/menus-shared-extra-options.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (modal_extra_options_menus_shared) {
			modal_extra_options_menus_shared.show()
			modal_extra_options_menus_shared.scope.extras = productExtraOptions.extras
			modal_extra_options_menus_shared.scope.close = function () {
				modal_extra_options_menus_shared.hide()
				modal_extra_options_menus_shared.remove()
			}
			modal_extra_options_menus_shared.scope.updateToggleProductExtra = function (extra) {
				timeout = setTimeout(function () {
					MyLoading.toast($scope.translate('LOADING') + '...');
					extra.pivot.menu_id = productExtraOptions.pivot.menu_id
					extra.pivot.business_id = $scope.deal.id
					var update_extra = {
						extra_id: extra.pivot.extra_id,
						business_id: extra.pivot.business_id,
						menu_id: extra.pivot.menu_id,
						enabled: extra.enabled,
					}
					Ordering.business_menus_shared.products.extras.update(update_extra, function (res) {
						MyLoading.hide();
						if (!res.error) {
							MyLoading.success($scope.translate('PRODUCT_SAVED'), 1500);
						} else MyAlert.show(res.result);
					});
				}, 500)
			}
			modal_extra_options_menus_shared.scope.updateToggleProductExtraOption = function (option) {
				timeout = setTimeout(function () {
					MyLoading.toast($scope.translate('LOADING') + '...');
					option.pivot_menu_id = productExtraOptions.pivot.menu_id
					option.pivot_business_id = $scope.deal.id
					console.log(option);
					var update_extra_option = {
						option_id: option.id,
						business_id: option.pivot_business_id,
						menu_id: option.pivot_menu_id,
						enabled: option.enabled,
					}
					Ordering.business_menus_shared.products.options.update(update_extra_option, function (res) {
						MyLoading.hide();
						if (!res.error) {
							MyLoading.success($scope.translate('PRODUCT_SAVED'), 1500);
						} else MyAlert.show(res.result);
					});
				}, 500)
			}
			modal_extra_options_menus_shared.scope.updateToggleProductExtraSubOption = function (suboption) {
				timeout = setTimeout(function () {
					MyLoading.toast($scope.translate('LOADING') + '...');
					suboption.pivot_menu_id = productExtraOptions.pivot.menu_id
					suboption.pivot_business_id = $scope.deal.id
					var update_extra_suboption = {
						suboption_id: suboption.id,
						business_id: suboption.pivot_business_id,
						menu_id: suboption.pivot_menu_id,
						enabled: suboption.enabled,
					}
					Ordering.business_menus_shared.products.suboptions.update(update_extra_suboption, function (res) {
						MyLoading.hide();
						if (!res.error) {
							MyLoading.success($scope.translate('PRODUCT_SAVED'), 1500);
						} else MyAlert.show(res.result);
					});
				}, 500)
			}
		});
	}
	$scope.checkMenu = function (menu) {
		if (menu.name.trim() == '') return new Error($scope.translate('NAME_REQUIRED'));
		else if (menu.days.length == 0) return new Error($scope.translate('CHOOSE_LEAST_ONE_DAY'));
		else if (!menu.delivery && !menu.pickup) return new Error($scope.translate('CHOOSE_DELIVERY_PICKUP'));
		else if (menu.dishes.length == 0) return new Error($scope.translate('CHOOSE_LEAST_ONE_PRODUCT'));
		else return null;
	}
	$scope.updateMenu = function (menu, categories) {

		if (menu.id == -1) return;
		var time = 0;
		if (curTimeout) $timeout.cancel(curTimeout);
		curTimeout = $timeout(function () {
			MyLoading.toast($scope.translate('LOADING') + '...');
			var data = {
				id: menu.id,
				enabled: menu.enabled,
				business_id: $scope.deal.id,
				name: menu.name,
				pickup: menu.pickup,
				delivery: menu.delivery,
				eatin: menu.eatin,
				curbside: menu.curbside,
				driver_thru: menu.driver_thru,
				schedule: JSON.stringify($scope.getJson(menu.schedule)),
				comment: menu.comment
			};
			var new_products = [];
			if (categories) {
				var products = [];
				for (var i = 0; i < categories.length; i++) {
					for (var j = 0; j < categories[i].products.length; j++) {
						if (categories[i].products[j].selected) {
							products.push(categories[i].products[j].id);
							new_products.push(categories[i].products[j]);
						}
					}
				}
				var diff = false;
				for (var i = 0; i < menu.products.length; i++) {
					if (products.indexOf(menu.products[i].id) == -1) diff = true;
				}
				if (products.length != menu.products.length) diff = true;
				if (diff) data.products = JSON.stringify(products);
			}
			/*if (products.length == 0) {
				MyLoading.hide();
				return;
			}*/
			console.log(data);
			Ordering.menus.update(data, function (res) {
				MyLoading.hide();
				if (!res.error) {
					//$scope.hideBusinessMenuSettings();
					if (new_products.length > 0) menu.products = new_products;
					MyLoading.success($scope.translate('MENU_SAVED'), 1500);
				} else MyAlert.show(res.result);
			});
		}, time);
	}
	$scope.addMenu = function (menu, categories) {
		// if (curTimeout) $timeout.cancel(curTimeout);
		// curTimeout = $timeout(function () {
		var data = {
			business_id: $scope.deal.id,
			name: menu.name,
			pickup: menu.pickup,
			delivery: menu.delivery,
			schedule: JSON.stringify(menu.schedule),
			comment: menu.comment
		};
		var new_products = [];
		if (categories) {
			var products = [];
			for (var i = 0; i < categories.length; i++) {
				for (var j = 0; j < categories[i].products.length; j++) {
					if (categories[i].products[j].selected) {
						products.push(categories[i].products[j].id);
						new_products.push(categories[i].products[j]);
					}
				}
			}
			var diff = false;
			for (var i = 0; i < menu.products.length; i++) {
				if (products.indexOf(menu.products[i].id) == -1) diff = true;
			}
			if (products.length != menu.products.length) diff = true;
			if (diff) data.products = JSON.stringify(products);
		}
		MyLoading.toast($scope.translate('LOADING') + '...');
		Ordering.menus.add(data, function (res) {
			MyLoading.hide();
			if (!res.error) {
				res.result.products = new_products;
				res.result.enabled = true;
				$scope.deal.menus.push(res.result);
				$scope.curNewMenu = {
					id: -1,
					name: '',
					delivery: true,
					pickup: true,
					comment: '',
					schedule: $scope.makeSchedule(),
					products: []
				};
				$scope.hideBusinessMenuSettings();
				MyLoading.success($scope.translate('MENU_ADDED'), 1500);
			} else MyAlert.show(res.result);
		});
		// }, 0);
	}
	$scope.removeMenu = function (menu) {
		MyAlert.confirm($scope.translate('QUESTION_DELETE_MENU')).then(function () {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.menus.delete({
				id: menu.id,
				business_id: $scope.deal.id
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					for (var i = 0; i < $scope.deal.menus.length; i++) {
						if ($scope.deal.menus[i].id == menu.id) {
							$scope.deal.menus.splice(i, 1);
							break;
						}
					}
					MyLoading.success($scope.translate('MENU_DELETED'), 1500);
				} else MyAlert.show(res.result);
			});
		});
	}
	/* Finish Business menu */
	/* Start Delivery zones */
	$scope.curNewZone = {
		id: -1,
		name: '',
		minimum: '',
		type: 2,
		data: [],
		dropdown_option_id: '',
		price: '',
		schedule: $scope.makeSchedule(),
	};
	$scope.checkZone = function (zone) {
		if (zone.name.trim() == '') return new Error($scope.translate('NAME_REQUIRED'));
		else if (zone.minimum.toString().trim() == '') return new Error($scope.translate('MINIMUN_PURCHASED_REQUIRED'));
		else if (zone.price.toString().trim() == '') return new Error($scope.translate('DELIVERY_PRICE_REQUIRED'));
		else return null;
	}
	$scope.addDeliveryZone = function (zone, cb) {
		var error = $scope.checkZone(zone);
		if (error) return MyAlert.show(error.message);
		MyLoading.toast($scope.translate('LOADING') + '...');
		Ordering.deliveryzones.add({
			business_id: $scope.deal.id,
			name: zone.name,
			minimum: zone.minimum,
			price: zone.price,
			type: zone.type,
			data: JSON.stringify(zone.data),
			dropdown_option_id: zone.dropdown_option_id,
			schedule: JSON.stringify(zone.schedule)
		}, function (res) {
			MyLoading.hide();
			if (!res.error) {
				res.result.enabled = true;
				$scope.deal.zones.push(res.result);
				$scope.curNewZone = {
					id: -1,
					name: '',
					minimum: '',
					type: 2,
					data: [],
					dropdown_option_id: '',
					price: '',
					schedule: $scope.makeSchedule(),
				};
				MyLoading.success($scope.translate('DELIVERYZONE_ADDED'), 1500);
				if (cb) cb();
			} else MyAlert.show(res.result);
		});
	}
	$scope.showDeliveryZone = function () {
		if ($scope.modalOpening) return;
		$scope.modalOpening = true;
		$scope.hideDeliveryZone();
		MyLoading.toast($scope.translate('LOADING') + '...');
		MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/delivery-zone.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (delivery_zone) {
			modals.push(delivery_zone);
			$scope.delivery_zone = delivery_zone;
			$scope.delivery_zone.show();
			$scope.modalOpening = false;
			MyLoading.hide();
			$(document).ready(function () {
				$('[data-toggle="popover"]').popover({ html: true })
			});
			/***Show Bottom Help***/
		});
	}
	$scope.hideDeliveryZone = function () {
		if ($scope.delivery_zone) {
			$scope.delivery_zone.hide();
			$scope.delivery_zone.remove();
		}
	}
	$scope.showDeliveryZoneSettings = function (zone) {
		var error = $scope.checkZone(zone);
		var dropCitiesId = [];
		$scope.dropdownCities = [];
		for (var i = 0; i < $scope.dropdownoptions.length; i++) {
			valid = true;
			for (var j = 0; j < dropCitiesId.length; j++) {
				if (dropCitiesId[j] == $scope.dropdownoptions[i].city_id) valid = false;

			}
			if (valid) dropCitiesId.push($scope.dropdownoptions[i].city_id)
		}
		for (var i = 0; i < dropCitiesId.length; i++) {
			for (var j = 0; j < $scope.cities.length; j++) {
				if ($scope.cities[j].id == dropCitiesId[i]) $scope.dropdownCities.push($scope.cities[j])
			}
		}
		if (error) return MyAlert.show(error.message);
		if ($scope.modalOpening) return;
		$scope.modalOpening = true;
		MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/delivery-zone-settings.html', {
			scope: $scope,
			animation: 'slide-in-up',
			// backdropClickToClose: false
		}).then(function (zone_settings) {
			modals.push(zone_settings);
			zone.type = zone.type.toString();
			if (zone.dropdown_option_id) {
				for (var i = 0; i < $scope.dropdownoptions.length; i++) {
					if ($scope.dropdownoptions[i].id == zone.dropdown_option_id) {
						zone.dropdownCity = $scope.dropdownoptions[i].city_id.toString();
						zone.dropdown_option_id = zone.dropdown_option_id.toString();
					}
				}
			} else zone.dropdownCity = '';
			zone_settings.scope.zone = JSON.parse(JSON.stringify(zone));
			if (!SEARCH_BY_ADDRESS && zone_settings.scope.zone.id == -1) zone_settings.scope.zone.type = '3';
			$scope.zone_settings = zone_settings;
			var curOverlay = null;
			var map_delivery = null;
			var drawingManager = null;
			var infowindow = new google.maps.InfoWindow();
			zone_settings.scope.changeType = function () {
				setTimeout(function () {
					if (zone_settings.scope.zone.type == 1 || zone_settings.scope.zone.type == 2) initMap();
					drawingManager.setOptions({
						drawingControl: true,
						drawingControlOptions: {
							position: google.maps.ControlPosition.TOP_CENTER,
							drawingModes: zone_settings.scope.zone.type == 1 ? ['circle'] : ['polygon']
						}
					});
					zone_settings.scope.zone.data = null;
					zone_settings.scope.clearMap();
				}, 100);
			}
			zone_settings.scope.clearMap = function () {
				if (curOverlay) {
					curOverlay.setMap(null);
					curOverlay = null;
					drawingManager.setOptions({
						drawingControl: true
					});
					infowindow.close();
				}
			}
			zone_settings.scope.changed = function () {
				zone_settings.scope.zone.dropdown_option_id = "";
			}
			zone_settings.scope.saveZone = function () {
				if (zone_settings.scope.zone.type == 1 || zone_settings.scope.zone.type == 2) {
					if (curOverlay) {
						if (curOverlay.type == "polygon") {
							var c_path = curOverlay.getPath().getArray();
							var path = [];
							for (var i = 0; i < c_path.length; i++) {
								path.push({
									lat: c_path[i].lat(),
									lng: c_path[i].lng()
								});
							}
							zone_settings.scope.zone.data = path;
						} else {
							zone_settings.scope.zone.data = {
								center: {
									lat: curOverlay.getCenter().lat(),
									lng: curOverlay.getCenter().lng()
								},
								radio: curOverlay.getRadius() / 1000
							};
						}
					} else return MyAlert.show($scope.translate('REQUIRED_POLYGON_CIRCLE'));
				}
				if (zone_settings.scope.zone.id > 0) {
					$scope.updateDeliveryZone(zone_settings.scope.zone, function () {
						zone.data = zone_settings.scope.zone.data;
						zone.type = parseInt(zone_settings.scope.zone.type);
						if (zone_settings.scope.zone.dropdown_option_id) {
							zone.dropdown_option_id = parseInt(zone_settings.scope.zone.dropdown_option_id);
						}
						zone_settings.scope.hide();
					});
				} else {
					$scope.addDeliveryZone(zone_settings.scope.zone, function () {
						zone_settings.scope.hide();
					});
				}
			}
			zone_settings.scope.hide = function () {
				zone_settings.hide();
				zone_settings.remove();
			}
			zone_settings.$el.on('click', function (e) {
				if (zone_settings.backdropClickToClose && e.target === zone_settings.el) {
					zone_settings.hide();
					zone_settings.remove();
				}
			});
			function initMap() {
				if (!document.getElementById('map-delivery-zone')) return;
				document.getElementById('map-delivery-zone').innerHTML = '';
				var scroll = $('#map-delivery-zone').parents('.scroll-content');
				var children = $('#map-delivery-zone').parents('.scroll').children();
				var height = -$('#map-delivery-zone').height() + 30;
				for (var i = 0; i < children.length; i++) {
					height += $(children[i]).outerHeight();
				}
				$('#map-delivery-zone').height(scroll.height() - height);
				$scope.modalOpening = false;
				var position = { lat: 40.77473399999999, lng: -73.9653844 };
				if ($scope.deal.location) {
					position = $scope.getJson($scope.deal.location);
				}
				map_delivery = new google.maps.Map(document.getElementById('map-delivery-zone'), {
					center: { lat: position.lat, lng: position.lng },
					zoom: position.zoom || 8,
					zoomControl: true,
					mapTypeControl: false,
					scaleControl: true,
					streetViewControl: false,
					rotateControl: false,
					fullscreenControl: false
				});
				var marker = new google.maps.Marker({
					position: position,
					title: $scope.deal.name,
					map: map_delivery
				});
				drawingManager = new google.maps.drawing.DrawingManager({
					drawingMode: null,
					drawingControl: true,
					polygonOptions: {
						clickable: false,
						editable: true,
					},
					drawingControlOptions: {
						position: google.maps.ControlPosition.TOP_CENTER,
						drawingModes: zone_settings.scope.zone.type == 1 ? ['circle'] : ['polygon']
					},
					circleOptions: {
						clickable: false,
						editable: true,
					}
				});
				drawingManager.setMap(map_delivery);
				google.maps.event.addListener(drawingManager, 'overlaycomplete', function (event) {
					curOverlay = event.overlay;
					curOverlay.type = event.type;
					if (event.type == "polygon") {
					} else {
						google.maps.event.addListener(event.overlay, 'radius_changed', function (e) {
							infowindow.setContent("<strong>Radius:</strong><br>" + (curOverlay.getRadius() / 1000).toFixed(2) + "km<br>" + (curOverlay.getRadius() / 1000 * 0.621371).toFixed(2) + 'mi');
						});
						infowindow.setContent("<strong>Radius:</strong><br>" + (curOverlay.getRadius() / 1000).toFixed(2) + "km<br>" + (curOverlay.getRadius() / 1000 * 0.621371).toFixed(2) + 'mi');
						infowindow.setPosition(curOverlay.getCenter());
						infowindow.open(map_delivery);
					}
					drawingManager.setOptions({
						drawingControl: false
					});
					drawingManager.setDrawingMode(null);
				});
			}
			$scope.zone_settings.show().then(function () {
				if (zone.type == 1 || zone.type == 2) {
					initMap();
					if (zone.data != null && (zone.data.length > 0 || zone.data.center)) {
						var bounds = new google.maps.LatLngBounds();
						if (zone.type == 2) {
							for (var i = 0; i < zone.data.length; i++) {
								bounds.extend(new google.maps.LatLng(zone.data[i].lat, zone.data[i].lng));
							}
							curOverlay = new google.maps.Polygon({
								paths: zone.data,
								clickable: false,
								editable: true,
							});
							curOverlay.type = 'polygon';
							curOverlay.setMap(map_delivery);
							drawingManager.setOptions({
								drawingControl: false
							});
						} else if (zone.type == 1) {
							curOverlay = new google.maps.Circle({
								clickable: false,
								editable: true,
								center: zone.data.center,
								radius: zone.data.radio * 1000
							});
							bounds = curOverlay.getBounds();
							infowindow.setContent("<strong>Radius:</strong><br>" + (zone.data.radio).toFixed(2) + "km<br>" + (zone.data.radio * 0.621371).toFixed(2) + 'mi');
							infowindow.setPosition(zone.data.center);
							infowindow.open(map_delivery);
							curOverlay.type = 'circle';
							curOverlay.setMap(map_delivery);
							drawingManager.setOptions({
								drawingControl: false
							});
							google.maps.event.addListener(curOverlay, 'radius_changed', function (e) {
								infowindow.setContent("<strong>Radius:</strong><br>" + (curOverlay.getRadius() / 1000).toFixed(2) + "km<br>" + (curOverlay.getRadius() / 1000 * 0.621371).toFixed(2) + 'mi');
							});
						}
						map_delivery.fitBounds(bounds);
					}
				}
				$scope.modalOpening = false;
			});
		});
	}

	$scope.removeDeliveryZone = function (zone) {
		MyAlert.confirm($scope.translate('QUESTION_DELETE_DELIVERYZONE')).then(function () {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.deliveryzones.delete({
				id: zone.id,
				business_id: $scope.deal.id
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					for (var i = 0; i < $scope.deal.zones.length; i++) {
						if ($scope.deal.zones[i].id == zone.id) {
							$scope.deal.zones.splice(i, 1);
							break;
						}
					}
					MyLoading.success($scope.translate('DELIVERYZONE_DELETED'), 1500);
				} else MyAlert.show(res.message);
			});
		});
	}
	$scope.updateDeliveryZone = function (zone, cb) {
		var error = $scope.checkZone(zone);
		if (error) return MyAlert.show(error.message);
		var time = 0;
		if (curTimeout) $timeout.cancel(curTimeout);
		curTimeout = $timeout(function () {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.deliveryzones.update({
				id: zone.id,
				business_id: $scope.deal.id,
				name: zone.name,
				minimum: zone.minimum,
				price: zone.price,
				type: zone.type,
				data: JSON.stringify(zone.data),
				dropdown_option_id: zone.dropdown_option_id,
				enabled: zone.enabled
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					if (cb) cb();
					MyLoading.success($scope.translate('DELIVERYZONE_SAVED'), 1500);
				} else MyAlert.show(res.result);
			});
		}, time);
	}
	/* Finish Delivery zones */
	/* Start Notifications */
	$scope.showNotifications = function () {
		if ($scope.modalOpening) return;
		$scope.modalOpening = true;
		$scope.hideNotifications();
		MyLoading.toast($scope.translate('LOADING') + '...');
		Ordering.printers.all({
		}, function (res) {
			$scope.printers = res.result;
			$scope.filePath = API_URL.replace("https", "http") + (API_URL[API_URL.length - 1] != '/' ? '/' : '') + API_VERSION + '/' + localStorageApp.getItem(STORE.LANG_CODE) + '/' + API_PROJECT_NAME + '/business/' + $scope.deal.id + '/queue.txt';
			$scope.filePathConfirm = API_URL.replace("https", "http") + (API_URL[API_URL.length - 1] != '/' ? '/' : '') + API_VERSION + '/' + localStorageApp.getItem(STORE.LANG_CODE) + '/' + API_PROJECT_NAME + '/business/' + $scope.deal.id + '/queue/confirm';
			MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/notifications.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function (notifications) {
				$scope.deal.printer_id = $scope.deal.printer_id == null ? '' : $scope.deal.printer_id.toString();
				modals.push(notifications);
				$scope.notifications = notifications;
				$scope.notifications.show();
				$scope.modalOpening = false;
				MyLoading.hide();
				$(document).ready(function () {
					$('[data-toggle="popover"]').popover({ html: true })
				});
				/***Show Bottom Help***/
			});
		});
	}
	$scope.hideNotifications = function () {
		if ($scope.notifications) {
			$scope.notifications.hide();
			$scope.notifications.remove();
			$scope.curCollapse = -1;
		}
	}
	$scope.saveEmailOrders = function (email) {
		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if (email.trim() == '' || !re.test(email)) return;
		// if (email.trim() == '') return MyAlert.show($scope.translate('EMAIL_REQUIRED'));
		MyLoading.toast($scope.translate('LOADING') + '...');
		Ordering.business.update({
			id: $scope.deal.id,
			email: email,
		}, function (res) {
			MyLoading.hide();
			if (!res.error) {
				$scope.deal.email = email;
				MyLoading.success($scope.translate('EMAIL_SAVED'), 1500);
			} else MyAlert.show(res.result);
		});
	}
	$scope.checkBusinessTel = function (phone) {
		if (phone.length >= 7) $scope.saveBusinessTel(phone);
	}
	$scope.saveBusinessTel = function (phone) {
		if (phone.trim() == '') return MyAlert.show($scope.translate('PHONE_REQUIRED'));
		MyLoading.toast($scope.translate('LOADING') + '...');
		Ordering.business.update({
			id: $scope.deal.id,
			phone: phone,
		}, function (res) {
			if (!res.error) {
				$scope.deal.phone = phone;
				MyLoading.success($scope.translate('PHONE_SAVED'), 1500);
			} else MyAlert.show(res.result);
		});
	}
	$scope.checkBusinessCel = function (cellphone) {
		if (cellphone.length >= 10 || cellphone.length == 0) $scope.saveBusinessCel(cellphone);
	}
	$scope.saveBusinessCel = function (cellphone) {
		// if (cellphone.trim() == '') return MyAlert.show($scope.translate('MOBILE_REQUIRED'));
		MyLoading.toast($scope.translate('LOADING') + '...');
		Ordering.business.update({
			id: $scope.deal.id,
			cellphone: cellphone ? cellphone : '',
		}, function (res) {
			MyLoading.hide();
			if (!res.error) {
				$scope.deal.cellphone = cellphone;
				MyLoading.success($scope.translate('MOBILE_SAVED'), 1500);
			} else MyAlert.show(res.result);
		}, null, null, true);
	}
	$scope.changePrinter = function () {
		MyLoading.toast($scope.translate('LOADING') + '...');
		Ordering.business.update({
			id: $scope.deal.id,
			printer_id: $scope.deal.printer_id,
			use_printer: $scope.deal.use_printer
		}, function (res) {
			MyLoading.hide();
			if (!res.error) {
				MyLoading.success($scope.translate('PRINTER_SAVED'), 1500);
			} else MyAlert.show(res.result);
		});
	}
	/* Finish Notifications*/
	/* Start Payments */
	$scope.ADDONS = ADDONS;
	$scope.showPaymentsMethods = function () {
		if ($scope.modalOpening) return;
		$scope.modalOpening = true;
		Ordering.paymethods.all({}, function (res) {
			$scope.paymethods = [];
			for (var i = 0; i < res.result.length; i++) {
				if (res.result[i].gateway == 'paypal' && !res.result[i].enabled && gUser.getData().level === 0) Ordering.paymethods.update({ id: res.result[i].id, enabled: true }, function (res) {
					if (!res.error) {
						console.log(res.result)
					} else {
						MyAlert.show($scope.translate(res.result))
					}
				});
				if (res.result[i].enabled) {
					var enabled = false;
					var credentials = null;
					for (var j = 0; j < $scope.deal.paymethods.length; j++) {
						if ($scope.deal.paymethods[j].paymethod_id == res.result[i].id) {
							credentials = $scope.deal.paymethods[j];
							enabled = $scope.deal.paymethods[j].enabled;
							break;
						}
					}
					if (res.result[i].gateway == "authorize") continue; //remove if want to show authorize.net
					$scope.paymethods.push({
						id: res.result[i].id,
						name: res.result[i].name,
						gateway: res.result[i].gateway,
						more: res.result[i].gateway != 'cash' && res.result[i].gateway != 'card_delivery' && res.result[i].gateway != 'stripe',
						enabled: enabled,
						credentials: credentials
					});
				}
			}
			MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/payments-methods.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function (payments_methods) {
				modals.push(payments_methods);
				$scope.payments_methods = payments_methods;
				$scope.payments_methods.show();
				$scope.modalOpening = false;
				payments_methods.scope.hide = function () {
					payments_methods.hide();
					payments_methods.remove();
				}
				$scope.stripeConnect = function ($event) {
					$event.preventDefault();
				}
				$(document).ready(function () {
					$('[data-toggle="popover"]').popover({ html: true })
				});
				/***Show Bottom Help***/
			});
		});
	}

	$scope.changeStatePaymethod = function (paymethod) {
		MyLoading.toast($scope.translate('LOADING') + '...');
		if (paymethod.credentials) {
			Ordering.paymethod_credentials.update({
				id: paymethod.credentials.id,
				business_id: $scope.deal.id,
				enabled: paymethod.enabled
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					paymethod.credentials.enabled = paymethod.enabled;
					MyLoading.success($scope.translate('PAYMETHOD_SAVED'), 1500);
				} else MyAlert.show(res.result);
			});
		} else {
			Ordering.paymethod_credentials.add({
				business_id: $scope.deal.id,
				paymethod_id: paymethod.id,
				sandbox: true,
				enabled: paymethod.enabled
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					res.result.data = null;
					res.result.data_sandbox = null;
					paymethod.credentials = res.result;
					$scope.deal.paymethods.push(res.result);
					MyLoading.success($scope.translate('PAYMETHOD_SAVED'), 1500);
				} else MyAlert.show(res.result);
			});
		}
	}
	$scope.showPaymentsMethodSettings = function (paymethod) {
		if ($scope.modalOpening) return;
		$scope.modalOpening = true;
		MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/more-payments-methods.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (payments_methods_settings) {
			modals.push(payments_methods_settings);
			$scope.payments_methods_settings = payments_methods_settings;
			$scope.payments_methods_settings.show();
			$scope.modalOpening = false;
			if (!paymethod.credentials.data) paymethod.credentials.data = {};
			if (!paymethod.credentials.data_sandbox) paymethod.credentials.data_sandbox = {};
			payments_methods_settings.scope.paymethod = paymethod;
			payments_methods_settings.scope.fields = [];
			switch (paymethod.gateway) {
				case 'authorize':
					payments_methods_settings.scope.fields.push({
						name: 'Login name',
						data: 'data',
						model: 'app'
					});
					payments_methods_settings.scope.fields.push({
						name: 'Transition key',
						data: 'data',
						model: 'key'
					});
					payments_methods_settings.scope.fields.push({
						name: 'Login name (Sandbox)',
						data: 'data_sandbox',
						model: 'app'
					});
					payments_methods_settings.scope.fields.push({
						name: 'Transition key (Sandbox)',
						data: 'data_sandbox',
						model: 'key'
					});
					break;
				case 'stripe_direct':
				case 'stripe_redirect':
					payments_methods_settings.scope.fields.push({
						name: 'Publishable key',
						data: 'data',
						model: 'publishable'
					});
					payments_methods_settings.scope.fields.push({
						name: 'Secret key',
						data: 'data',
						model: 'secret'
					});
					payments_methods_settings.scope.fields.push({
						name: 'Publishable key (Sandbox)',
						data: 'data_sandbox',
						model: 'publishable'
					});
					payments_methods_settings.scope.fields.push({
						name: 'Secret key (Sandbox)',
						data: 'data_sandbox',
						model: 'secret'
					});
					break;
				case 'paypal_express':
					payments_methods_settings.scope.fields.push({
						name: 'Cliente ID',
						data: 'data',
						model: 'client_id'
					});
					payments_methods_settings.scope.fields.push({
						name: 'Cliente ID (Sandbox)',
						data: 'data_sandbox',
						model: 'client_id'
					});
					break;
				case 'paypal':
					payments_methods_settings.scope.fields.push({
						name: 'Client ID',
						data: 'data',
						model: 'client_id'
					});
					payments_methods_settings.scope.fields.push({
						name: 'Secret ID',
						data: 'data',
						model: 'secret'
					});
					payments_methods_settings.scope.fields.push({
						name: 'Cliente ID (Sandbox)',
						data: 'data_sandbox',
						model: 'client_id'
					});
					payments_methods_settings.scope.fields.push({
						name: 'Secret ID (Sandbox)',
						data: 'data_sandbox',
						model: 'secret'
					});
					break;
				case 'stripe_connect':
					payments_methods_settings.scope.fields.push({
						name: 'Access token ID',
						data: !paymethod.credentials.sandbox ? 'data' : 'data_sandbox',
						model: 'token'
					});
					payments_methods_settings.scope.fields.push({
						name: 'Publishable key',
						data: !paymethod.credentials.sandbox ? 'data' : 'data_sandbox',
						model: 'publishable'
					});
					payments_methods_settings.scope.fields.push({
						name: 'User ID',
						data: !paymethod.credentials.sandbox ? 'data' : 'data_sandbox',
						model: 'user'
					});
					payments_methods_settings.scope.fields.push({
						name: 'Refresh token',
						data: !paymethod.credentials.sandbox ? 'data' : 'data_sandbox',
						model: 'refresh_token'
					});
					break;
			}
			payments_methods_settings.scope.hide = function () {
				payments_methods_settings.hide();
				payments_methods_settings.remove();
			}
			payments_methods_settings.scope.stripeConnect = function ($event) {
				$event.preventDefault();
				var stripe_client_id = '';
				if ($scope.configs.stripe_connect_sandbox.value == '1') {
					stripe_client_id = $scope.configs.stripe_connect_client_id_sandbox.value;
				} else {
					stripe_client_id = $scope.configs.stripe_connect_client_id.value;
				}
				var connect = window.open('https://connect.stripe.com/oauth/authorize?response_type=code&client_id=' + stripe_client_id + '&scope=read_write&state=' + localStorageApp.getItem(STORE.TOKEN), '_blank', 'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,clearcache=yes');
				var interval = setInterval(function () {
					if (!connect.closed) {
						connect.postMessage("data", API_URL);
					} else {
						clearInterval(interval);
					}
				}, 200);
				var timeout = null;
				window.addEventListener("message", function (e) {
					if (e.origin.indexOf(".ordering.co") === -1) {
						return;
					}
					clearInterval(interval);
					if (timeout) clearTimeout(timeout);
					timeout = setTimeout(function () {
						connect.postMessage("close", API_URL);
						if (!e.data.error && e.data.result) {
							var data = e.data.result;
							$scope.$apply(function () {
								payments_methods_settings.scope.paymethod.credentials.sandbox = data.livemode;
								payments_methods_settings.scope.paymethod.credentials.data = {};
								payments_methods_settings.scope.paymethod.credentials.data.token = data.access_token;
								payments_methods_settings.scope.paymethod.credentials.data.publishable = data.stripe_publishable_key;
								payments_methods_settings.scope.paymethod.credentials.data.user = data.stripe_user_id;
								payments_methods_settings.scope.paymethod.credentials.data.refresh_token = data.refresh_token;
								payments_methods_settings.scope.paymethod.credentials.data_sandbox = payments_methods_settings.scope.paymethod.credentials.data;
								$scope.updatePaymethod(payments_methods_settings.scope.paymethod);
							});
							MyLoading.success($scope.translate('STRIPE_CONNECT_OK'), 1500);
						} else if (e.data.error) {
							MyAlert.show($scope.translate('STRIPE_CONNECT_ERROR'));
						}
					}, 1000);
				});
			}
		});
	}
	$scope.updatePaymethod = function (paymethod) {
		if (curTimeout) $timeout.cancel(curTimeout);
		curTimeout = $timeout(function () {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.paymethod_credentials.update({
				id: paymethod.credentials.id,
				business_id: $scope.deal.id,
				data: JSON.stringify(paymethod.credentials.data),
				data_sandbox: JSON.stringify(paymethod.credentials.data_sandbox),
				sandbox: paymethod.credentials.sandbox
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					MyLoading.success($scope.translate('PAYMETHOD_SAVED'), 1500);
				} else MyAlert.show(res.result);
			});
		}, 100);
	}
	$scope.updateAppFee = function () {
		if ($scope.deal.fixed_usage_fee === '' || $scope.deal.percentage_usage_fee === '') return;
		MyLoading.toast($scope.translate('LOADING') + '...');
		Ordering.business.update({
			id: $scope.deal.id,
			fixed_usage_fee: $scope.deal.fixed_usage_fee,
			percentage_usage_fee: $scope.deal.percentage_usage_fee
		}, function (res) {
			MyLoading.hide();
			if (!res.error) {
				MyLoading.success($scope.translate('PAYMETHOD_SAVED'), 1500);
			} else MyAlert.show(res.result);
		});
	}
	/* Finish Payments */
	/* Start Extensions */
	$scope.changeCollapseExt = function (index) {
		if ($scope.curCollapse == index) $scope.curCollapse = -1;
		else $scope.curCollapse = index;
	}
	$scope.initDiscounts = function () {
		$scope.curOffer = {
			accept: true,
			business: "",
			createdate: "",
			discounttext: "",
			discountype: "1",
			enddate: "",
			id: -1,
			minshop: "",
			rate: "",
			startdate: "",
			validdays: ""
		};
	}

	$scope.initOffer = function () {
		$scope.curCoupon = {
			id: -1,
			rate_type: '2',
			rate: 0,
			minimum: null,
			limit: null,
			type: 2,
		};
		$scope.curOffer = {
			id: -1,
			rate_type: '1',
			rate: 0,
			minimum: null,
			limit: null,
			type: 1,
		};
	}

	$scope.showExtensions = function () {
		if ($scope.modalOpening) return;
		$scope.modalOpening = true;
		$scope.hideExtensions();
		$scope.initOffer();
		if (!$scope.deal.delivery_time || $scope.deal.delivery_time == '') $scope.deal.delivery_time = '0:0';
		if (!$scope.deal.pickup_time || $scope.deal.pickup_time == '') $scope.deal.pickup_time = '0:0';
		$scope.curDeliveryTime = {
			hour: ($scope.deal.delivery_time.split(':')[0] * 1) + '',
			minute: ($scope.deal.delivery_time.split(':')[1] * 1) + ''
		};
		$scope.curPickupTime = {
			hour: ($scope.deal.pickup_time.split(':')[0] * 1) + '',
			minute: ($scope.deal.pickup_time.split(':')[1] * 1) + ''
		};
		MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/extensions.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (modal_extensions) {
			$scope.deal.tax_type = $scope.deal.tax_type.toString();
			modals.push(modal_extensions);
			$scope.modal_extensions = modal_extensions;
			$scope.modal_extensions.show();
			$scope.modalOpening = false;
			MyLoading.hide();
			$(document).ready(function () {
				$('[data-toggle="popover"]').popover({ html: true })
			});
			/***Show Bottom Help***/
		});
	}
	$scope.hideExtensions = function () {
		if ($scope.modal_extensions) {
			$scope.modal_extensions.hide();
			$scope.modal_extensions.remove();
		}
	}
	$scope.changeTax = function () {
		if (curTimeout) $timeout.cancel(curTimeout);
		curTimeout = $timeout(function () {
			if ($scope.deal.tax == '') return MyAlert.show($scope.translate('TAX_REQUIRED'));
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.business.update({
				id: $scope.deal.id,
				tax_type: $scope.deal.tax_type,
				tax: $scope.deal.tax,
			}, function (res) {
				MyLoading.hide();
				if (!res.error) MyLoading.success($scope.translate('BUSINESS_TAX_SAVED'), 1500);
				else MyAlert.show(res.result);
			});
		}, 0);
	}
	$scope.changeDeliveryTime = function () {
		if (curTimeout) $timeout.cancel(curTimeout);
		curTimeout = $timeout(function () {
			$scope.deal.delivery_time = $scope.curDeliveryTime.hour + ':' + $scope.curDeliveryTime.minute;
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.business.update({
				id: $scope.deal.id,
				delivery_time: $scope.deal.delivery_time,
			}, function (res) {
				MyLoading.hide();
				if (!res.error) MyLoading.success($scope.translate('DELIVERYTIME_SAVED'), 1500);
				else MyAlert.show(res.result);
			});
		}, 0);
	}
	$scope.changePickupTime = function () {
		if (curTimeout) $timeout.cancel(curTimeout);
		curTimeout = $timeout(function () {
			$scope.deal.pickup_time = $scope.curPickupTime.hour + ':' + $scope.curPickupTime.minute;
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.business.update({
				id: $scope.deal.id,
				pickup_time: $scope.deal.pickup_time,
			}, function (res) {
				MyLoading.hide();
				if (!res.error) MyLoading.success($scope.translate('PICKUPTIME_SAVED'), 1500);
				else MyAlert.show(res.result);
			});
		}, 0);
	}
	$scope.showOfferSetting = function (coupon) {
		if ($scope.modalOpening) return;
		if (!coupon.name) coupon.name = '';
		$scope.validOffer(coupon, function (error) {
			if (!error) {
				$scope.modalOpening = true;
				$scope.hideOfferSetting();
				$scope.curCoupon = coupon;
				// if (!$scope.curCoupon.id) $scope.curCoupon.id = -1;
				//$scope.curCoupon.minimum = null;
				$scope.selectedBusiness = [];
				MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/more-coupon-settings.html', {
					scope: $scope,
					animation: 'slide-in-up',
					// backdropClickToClose: false,
				}).then(function (coupon_settings) {
					$scope.curCoupon.rate_type = $scope.curCoupon.rate_type.toString();
					modals.push(coupon_settings);
					$scope.coupon_settings = coupon_settings;
					$scope.coupon_settings.show().then(function () {
						/**/
						var datefrom = $('#datefrom').datetimepicker({
							format: 'YYYY-MM-DD',
						});
						datefrom.on('dp.show', function () {
							$(".bootstrap-datetimepicker-widget").attr('data-tap-disabled', 'true');
						});
						var dateto = $('#dateto').datetimepicker({
							useCurrent: false, //Important! See issue #1075
							format: 'YYYY-MM-DD',
						});
						dateto.on('dp.show', function () {
							$(".bootstrap-datetimepicker-widget").attr('data-tap-disabled', 'true');
						});
						$("#datefrom").on("dp.change", function (e) {
							$('#dateto').data("DateTimePicker").minDate(e.date);
							$scope.$apply(function () {
								$scope.curCoupon.end = $('#dateto').val();
								$scope.curCoupon.start = $('#datefrom').val();
								$scope.updateOffer($scope.curCoupon);
							});
						});
						$("#dateto").on("dp.change", function (e) {
							$('#datefrom').data("DateTimePicker").maxDate(e.date)
							$scope.$apply(function () {
								$scope.curCoupon.end = $('#dateto').val();
								$scope.curCoupon.start = $('#datefrom').val();
								$scope.updateOffer($scope.curCoupon);
							});
						});

						/**/
					});
					$scope.coupon_settings.$el.on('click', function (e) {
						if ($scope.coupon_settings.backdropClickToClose && e.target === $scope.coupon_settings.el) {
							$scope.hideOfferSetting();
						}
					});
					$scope.resetFields();
					$scope.coupon_settings.scope.getCouponCustoms = function () {
						MyLoading.toast($scope.translate('LOADING') + '...');
						$scope.newField['business_id'] = $scope.deal.id;
						$scope.newField['offer_id'] = coupon.id;
						Ordering.offers.custom_fields.get($scope.newField, function (res) {
							MyLoading.hide();
							if (!res.error) {
								$scope.curCoupon['metafields'] = res.result;
							} else MyAlert.show(res.result);
						});
					}
					$scope.coupon_settings.scope.addCouponCustom = function () {
						if ($scope.newField.value_type == VALUE_TYPE.JSON)
							$scope.newField.value = JSON.stringify($scope.jsonEditor.get());
						MyLoading.toast($scope.translate('LOADING') + '...');
						$scope.newField['business_id'] = $scope.deal.id;
						$scope.newField['offer_id'] = coupon.id;
						Ordering.offers.custom_fields.add($scope.newField, function (res) {
							MyLoading.hide();
							if (!res.error) {
								$scope.resetFields();
								$scope.curCoupon.metafields.push(res.result);
								if (coupon.type == 1) MyLoading.success($scope.translate('OFFER_SAVED'), 1500);
								if (coupon.type == 2) MyLoading.success($scope.translate('COUPON_SAVED'), 1500);
							} else MyAlert.show(res.result);
						});
					}
					$scope.coupon_settings.scope.removeCouponCustom = function (item) {
						MyLoading.toast($scope.translate('LOADING') + '...');
						$scope.newField['business_id'] = $scope.deal.id;
						$scope.newField['offer_id'] = coupon.id;
						$scope.newField['id'] = item.id;
						Ordering.offers.custom_fields.delete($scope.newField, function (res) {
							MyLoading.hide();
							if (!res.error) {
								for (var i = 0; i < $scope.curCoupon.metafields.length; i++) {
									if ($scope.curCoupon.metafields[i].id == item.id) {
										$scope.curCoupon.metafields.splice(i, 1);
										break;
									}
								}
								MyLoading.success($scope.translate('CUSTOM_FIELD_ITEM_DELETED'), 1500);
							} else MyAlert.show(res.result);
						});
					}
					$scope.coupon_settings.scope.getKeyEvent = function (e) {
						if (e.charCode == 13)
							$scope.coupon_settings.scope.addCouponCustom();
					}
					if (coupon.id > 0) $scope.coupon_settings.scope.getCouponCustoms();
					$scope.modalOpening = false;
				});
			} else {
				return MyAlert.show(error.message);
			}
		});
	}
	$scope.hideOfferSetting = function () {
		if ($scope.coupon_settings) {
			$scope.coupon_settings.hide();
			$scope.coupon_settings.remove();
			$scope.initDiscounts();
			$scope.initOffer();
		}
	}
	$scope.getSelectedBusiness = function () {
		var selected = [];
		for (var i = 0; i < $scope.selectedBusiness.length; i++) {
			if ($scope.selectedBusiness[i]) selected.push(i + '');
		}
		return JSON.stringify(selected);
	}
	$scope.validCoupon = function (coupon, cb) {
		if (coupon.code.trim() == '') return cb(new Error($scope.translate('CODE_REQUIRED')));
		else if (coupon.commonrate.trim() == '') return cb(new Error($scope.translate('VALUE_REQUIRED')));
		else if (coupon.maxallow.trim() == '') return cb(new Error($scope.translate('LIMIT_REQUIRED')));
		else if (coupon.minshop.trim() == '') return cb(new Error($scope.translate('MINIMUN_PURCHASED_REQUIRED')));
		else if (!validDate(coupon.currentdate)) return cb(new Error($scope.translate('START_DATE_REQUIRED')));
		else if (!validDate(coupon.expirydate)) return cb(new Error($scope.translate('FINISH_DATE_REQUIRED')));
		else return cb(null);
	}
	$scope.validOffer = function (coupon, cb) {
		if (coupon.name.trim() == '' && coupon.type == 1) return cb(new Error($scope.translate('OFFER_TEXT_REQUIRED')));
		else return cb(null);
	}
	$scope.updateOffer = function (offer, now) {
		if (offer.coupon) {
			offer.coupon = offer.coupon.replace(/\s/g, '');
		}
		var time = 0;
		if (now) time = 0;
		if (offer.id == -1) return;
		if (curTimeout) $timeout.cancel(curTimeout);
		curTimeout = $timeout(function () {
			if ($scope.selectedBusiness) business_id = $scope.getSelectedBusiness();
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.offers.update({
				name: offer.name ? offer.name : offer.coupon,
				business_id: $scope.deal.id,
				id: offer.id,
				coupon: offer.coupon,
				rate_type: offer.rate_type,
				rate: offer.rate,
				minimum: offer.minimum,
				limit: offer.limit,
				start: offer.start,
				end: offer.end,
				enabled: offer.enabled,
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					if (offer.type == 1) MyLoading.success($scope.translate('OFFER_SAVED'), 1500);
					if (offer.type == 2) MyLoading.success($scope.translate('COUPON_SAVED'), 1500);
				} else MyAlert.show(res.result);
			});
		}, time);
	}
	$scope.addOffer = function (offer) {
		business_id = $scope.getSelectedBusiness();
		MyLoading.toast($scope.translate('LOADING') + '...');
		if (offer.type == 2) offer.name = offer.coupon;
		Ordering.offers.add({
			business_id: $scope.deal.id,
			coupon: offer.coupon,
			rate_type: offer.rate_type,
			rate: offer.rate,
			minimum: offer.minimum,
			limit: offer.limit,
			start: offer.start,
			end: offer.end,
			name: offer.name,
			type: offer.type
		}, function (res) {
			MyLoading.hide();
			if (!res.error) {
				res.result.enabled = true;
				$scope.deal.offers.push(res.result);
				$scope.initOffer();
				$scope.hideOfferSetting();
				if (offer.type == 1) MyLoading.success($scope.translate('OFFER_ADDED'), 1500);
				if (offer.type == 2) MyLoading.success($scope.translate('COUPON_ADDED'), 1500);
			} else MyAlert.show(res.result);
		});
		// coupon.business = $scope.getSelectedBusiness();
	}
	$scope.removeOffer = function (offer) {
		MyAlert.confirm($scope.translate('QUESTION_DELETE_COUPON')).then(function () {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.offers.delete({
				business_id: $scope.deal.id,
				id: offer.id,
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					for (var i = 0; i < $scope.deal.offers.length; i++) {
						if ($scope.deal.offers[i].id == offer.id) {
							$scope.deal.offers.splice(i, 1);
							break;
						}
					}
					if (offer.type == 1) MyLoading.success($scope.translate('OFFER_DELETED'), 1500);
					if (offer.type == 2) MyLoading.success($scope.translate('COUPON_DELETED'), 1500);
				} else MyAlert.show(res.result);
			});
		});
	}
	$scope.changeMinimunPurchased = function () {
		if (curTimeout) $timeout.cancel(curTimeout);
		curTimeout = $timeout(function () {
			if ($scope.deal.minimum.trim() == '') return MyAlert.show($scope.translate('MINIMUN_PURCHASED_REQUIRED'));
			// $scope.deal.deliverytime = $scope.curDeliveryTime.hour+':'+$scope.curDeliveryTime.minute;
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.business.update({
				id: $scope.deal.id,
				minimum: $scope.deal.minimum,
			}, function (res) {
				MyLoading.hide();
				if (!res.error) MyLoading.success($scope.translate('MINIMUN_PURCHASED_SAVED'), 1500);
				else MyAlert.show(res.result);
			});
		}, 500);
	}
	$scope.changeServiceFee = function () {
		if (curTimeout) $timeout.cancel(curTimeout);
		curTimeout = $timeout(function () {
			if ($scope.deal.service_fee.trim() == '') return MyAlert.show($scope.translate('SERVICE_FEE_REQUIRED'));
			// $scope.deal.deliverytime = $scope.curDeliveryTime.hour+':'+$scope.curDeliveryTime.minute;
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.business.update({
				id: $scope.deal.id,
				service_fee: $scope.deal.service_fee,
			}, function (res) {
				MyLoading.hide();
				if (!res.error) MyLoading.success($scope.translate('SERVICE_FEE_SAVED'), 1500);
				else MyAlert.show(res.result);
			});
		}, 500);
	}
	$scope.changeFeature = function () {
		if (curTimeout) $timeout.cancel(curTimeout);
		curTimeout = $timeout(function () {
			// $scope.deal.deliverytime = $scope.curDeliveryTime.hour+':'+$scope.curDeliveryTime.minute;
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.business.update({
				id: $scope.deal.id,
				featured: $scope.deal.featured
			}, function (res) {
				MyLoading.hide();
				if (!res.error) MyLoading.success($scope.translate('FEATURE_SAVED'), 1500);
				else MyAlert.show(res.result);
			});
		}, 0);
	}
	$scope.changeExpireOrderAfterMinutes = function () {
		if (!$scope.deal.cancel_order_after_minutes) {
			return;
		}
		if (curTimeout) $timeout.cancel(curTimeout);
		curTimeout = $timeout(function () {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.business.update({
				id: $scope.deal.id,
				cancel_order_after_minutes: parseInt($scope.deal.cancel_order_after_minutes)
			}, function (res) {
				MyLoading.hide();
				if (!res.error) MyLoading.success($scope.translate('BUSINESS_SAVED'), 1500);
				else MyAlert.show(res.result);
			});
		}, 50);
	}
	$scope.changeOrderDefaultPriority = function () {
		if (!$scope.deal.order_default_priority) {
			return;
		}
		if (curTimeout) $timeout.cancel(curTimeout);
		curTimeout = $timeout(function () {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.business.update({
				id: $scope.deal.id,
				order_default_priority: parseInt($scope.deal.order_default_priority)
			}, function (res) {
				MyLoading.hide();
				if (!res.error) MyLoading.success($scope.translate('BUSINESS_SAVED'), 1500);
				else MyAlert.show(res.result);
			});
		}, 50);
	}
	/* Finish Extensions */
	/* Start Channels */
	$scope.showChannels = function () {
		if ($scope.modalOpening) return;
		$scope.modalOpening = true;
		$scope.type = 'modal';
		$scope.baseurl = window.location.origin + (!WEB_ADDONS.remove_hash ? '/#/' : '/');
		var url = window.location.origin + (!WEB_ADDONS.remove_hash ? '/#/' : '/') + $scope.deal.slug;
		// $scope.widget_popup = '<script type="text/javascript">window.onload=function(){function e(e,t){return e===!0||e===!1?e:t}function t(){return navigator.userAgent.match(/Android/i)||navigator.userAgent.match(/webOS/i)||navigator.userAgent.match(/iPhone/i)||navigator.userAgent.match(/iPad/i)||navigator.userAgent.match(/iPod/i)||navigator.userAgent.match(/BlackBerry/i)||navigator.userAgent.match(/Windows Phone/i)?!0:!1}function i(){return navigator.userAgent.match(/iPad/i)?"iPad":navigator.userAgent.match(/iPhone/i)?"iPhone":void 0}function n(){r?(console.log("onresize"),l.style.height="auto",l.style.width="auto",window.innerWidth<=480?(l.style.right=0,l.style.left=0,l.style.top=0,l.style.bottom=0,l.style.borderRadius=0):(window.innerWidth>480&&window.innerWidth<600?(l.style.left="5%",l.style.right="5%"):(l.style.left="5%",l.style.right="5%"),l.style.top="5%",l.style.bottom="5%",l.style.borderRadius="5px")):(l.style.height="0px",l.style.width="0px")}var o="'+url+'";"undefined"==typeof orderingSettings&&(orderingSettings={});var s=orderingSettings,d={openOnMobile:e(s.openOnMobile,!1),openOnDesktop:e(s.openOnDesktop,!1)},r=!1,l=document.createElement("div");l.id="ordering_bot",l.style.height=0,l.style.width=0,l.style.position="fixed",l.style.right="5%",l.style.left="5%",l.style.top="5%",l.style.bottom="5%",l.style.borderRadius="5px",l.style.overflow="hidden",l.style.zIndex=99999,l.style.maxheight=window.innerHeight+"px",l.style["-webkit-transition"]="height 0.5s, width 0.5s",l.style["-moz-transition"]="height 0.5s, width 0.5s",l.style["-ms-transition"]="height 0.5s, width 0.5s",l.style["-o-transition"]="height 0.5s, width 0.5s",l.style.transition="height 0.5s, width 0.5s",l.style.boxShadow="0 0 20px 0 #999";var a={insideIframe:!1};l.addEventListener("mouseenter",function(){a.insideIframe=!0,a.scrollX=window.scrollX,a.scrollY=window.scrollY,t()||(document.body.style.overflow="hidden")}),l.addEventListener("mouseleave",function(){a.insideIframe=!1,t()||(document.body.style.overflow="auto")}),document.addEventListener("scroll",function(e){a.insideIframe&&(e.preventDefault(),window.scrollTo(0,0))});var h=document.createElement("div");h.style.height="40px",h.style.background="#F5F5F5",h.style.width="100%",h.style.position="absolute";var y=document.createElement("div");y.style.height="50px",y.style.width="50px",y.style["float"]="right",y.style.fontSize="28px",y.style.lineHeight="25px",y.style.padding="5px",y.style.textAlign="center",y.style.boxSizing="border-box",y.style.color="#666",y.style.cursor="pointer",y.innerHTML="&times;",h.appendChild(y);var g=document.createElement("iframe");g.id="ordering_iframe",g.src=o,g.setAttribute("allow", "geolocation"),g.style.border=0,g.style.height="100%",g.style.width="100%",g.style.maxWidth="none",g.style.paddingTop="40px",g.style.boxSizing="border-box",l.appendChild(h),l.appendChild(g),document.getElementsByTagName("body")[0].appendChild(l),window.toggleOrderingWidget=function(){r=!r,r?t()&&(a.insideIframe=!0,document.body.style.overflow="hidden",document.body.style.height=window.innerHeight-150+"px"):t()&&(a.insideIframe=!1,document.body.style.overflow="auto",document.body.style.height="auto"),n()},n(),window.onresize=n,(t()&&d.openOnMobile&&!i()||!t()&&d.openOnDesktop)&&toggleOrderingWidget(),y.addEventListener("click",toggleOrderingWidget)};</script>';
		$scope.widget_popup = '<script type="text/javascript">window.onload=function(){function e(e,t){return!0===e||!1===e?e:t}function t(){return!!(navigator.userAgent.match(/Android/i)||navigator.userAgent.match(/webOS/i)||navigator.userAgent.match(/iPhone/i)||navigator.userAgent.match(/iPad/i)||navigator.userAgent.match(/iPod/i)||navigator.userAgent.match(/BlackBerry/i)||navigator.userAgent.match(/Windows Phone/i))}"undefined"==typeof orderingSettings&&(orderingSettings={});var i=orderingSettings,o=e(i.openOnMobile,!1),n=e(i.openOnDesktop,!1),s=!1,l=document.createElement("div");l.id="ordering_bot",l.style.height=0,l.style.width=0,l.style.position="fixed",l.style.right="20%",l.style.left="20%",l.style.top="7%",l.style.bottom="7%",l.style.borderRadius="5px",l.style.overflow="hidden",l.style.zIndex=99999,l.style.maxheight=window.innerHeight+"px",l.style["-webkit-transition"]="height 0.5s, width 0.5s",l.style["-moz-transition"]="height 0.5s, width 0.5s",l.style["-ms-transition"]="height 0.5s, width 0.5s",l.style["-o-transition"]="height 0.5s, width 0.5s",l.style.transition="height 0.5s, width 0.5s",l.style["-webkit-overflow-scrolling"]="touch",l.style["overflow-y"]="scroll",l.style.boxShadow="0 0 20px 0 #999";var r={insideIframe:!1};document.addEventListener("scroll",function(e){r.insideIframe&&(e.preventDefault(),window.scrollTo(0,0))});var d=document.createElement("div");d.style.height="40px",d.style.background="#ccc",d.style.width="100%",d.style.position="absolute";var a=document.createElement("div");a.style.height="40px",a.style.width="40px",a.style.float="right",a.style.fontSize="28px",a.style.lineHeight="25px",a.style.padding="5px",a.style.textAlign="center",a.style.boxSizing="border-box",a.style.color="#666",a.style.borderLeft="1px solid #bbb",a.style.cursor="pointer",a.innerHTML="&times;",d.appendChild(a);var h=document.createElement("iframe");function y(){s?(l.style.height="auto",l.style.width="auto",window.innerWidth<=480?(l.style.right=0,l.style.left=0,l.style.top=0,l.style.bottom=0,l.style.borderRadius=0):(window.innerWidth>480&&window.innerWidth<600?(l.style.left="10%",l.style.right="10%"):(l.style.left="20%",l.style.right="20%"),l.style.top="7%",l.style.bottom="7%",l.style.borderRadius="5px")):(l.style.height="0px",l.style.width="0px")}h.id="ordering_iframe",h.src="' + url + '",h.style.border=0,h.style.height="100%",h.style.width="100%",h.style.maxWidth="none",h.style.paddingTop="40px",h.style.boxSizing="border-box",h.style["-webkit-overflow-scrolling"]="touch",l.appendChild(d),l.appendChild(h),document.getElementsByTagName("body")[0].appendChild(l),window.toggleOrderingWidget=function(){(s=!s)?(t()&&(r.insideIframe=!0,document.body.style.overflow="hidden",document.body.style.height=window.innerHeight-150+"px"),r.insideIframe=!0,r.scrollX=window.scrollX,r.scrollY=window.scrollY,t()||(document.body.style.overflow="hidden")):(t()&&(r.insideIframe=!1,document.body.style.overflow="auto",document.body.style.height="auto"),r.insideIframe=!1,t()||(document.body.style.overflow="auto")),y()},y(),window.onresize=y,(t()&&o&&!(navigator.userAgent.match(/iPad/i)||(navigator.userAgent.match(/iPhone/i)||void 0))||!t()&&n)&&toggleOrderingWidget(),a.addEventListener("click",toggleOrderingWidget)};</script>';
		$scope.widget_inline = '<script type="text/javascript">var orderingInlineSettings = {baseUrl: "/"};</script><script type="text/javascript">window.onload=function(){var i={baseUrl:orderingInlineSettings&&orderingInlineSettings.baseUrl?orderingInlineSettings.baseUrl:"/inline/"},l=location.href.split(i.baseUrl)[0],e=location.href.split(i.baseUrl)[1],a="' + url + '",r=document.createElement("iframe");r.id="ordering_iframe",r.src=(a+"/"+e).replace(/([^:]\\/)\\/+/g,"$1"),r.style.border=0,r.style.height="100%",r.style.width="100%",r.style.maxWidth="none",r.allow="geolocation";var d=document.getElementById("ordering_iframe_inline");d.appendChild(r),r.addEventListener("load",function(){t(),setInterval(function(){var e=JSON.stringify({event:"body",data:{}});r.contentWindow.postMessage(e,a)},100)});function t(){var e=document.documentElement,t=window.innerwidth||e.clientWidth,n=window.innerHeight||e.clientHeight,o=(window.pageXOffset||e.scrollLeft)-(e.clientLeft||0),i=(window.pageYOffset||e.scrollTop)-(e.clientTop||0),l=JSON.stringify({event:"scroll",data:{top:i,left:o,width:t,height:n,offsetTop:s(r).top}});r.contentWindow.postMessage(l,a)}function s(e){for(var t=0,n=0;t+=e.offsetTop||0,n+=e.offsetLeft||0,e=e.offsetParent;);return{top:t,left:n}}window.addEventListener("message",function(e){var t=e.data;if("body"==t.event)d.style.height=t.data.height+"px";else if("scroll"==t.event)t.data.enable?document.getElementsByTagName("body")[0].style.overflowY="auto":document.getElementsByTagName("body")[0].style.overflowY="hidden";else if("url"==t.event){var n=document.createElement("a");n.href=t.data;var o=((l?l+"/":"")+i.baseUrl+"/"+n.pathname).replace(/([^:]\\/)\\/+/g,"$1");window.history.pushState("","",o),"http://localhost/"!=t.data&&window.scrollTo(0,s(r).top)}},!1),window.onscroll=function(e){t()}};</script><div style="height: 1000px;" id="ordering_iframe_inline"></div>';
		var color = $('.navbar-default .navbar-nav > li >a').css('color');
		$scope.widget_bot = '<script type="text/javascript">window.onload=function(){function e(e,t){return e===!0||e===!1||void 0!=e||null!=e?e:t}function t(){return navigator.userAgent.match(/Android/i)||navigator.userAgent.match(/webOS/i)||navigator.userAgent.match(/iPhone/i)||navigator.userAgent.match(/iPad/i)||navigator.userAgent.match(/iPod/i)||navigator.userAgent.match(/BlackBerry/i)||navigator.userAgent.match(/Windows Phone/i)?!0:!1}function n(){return navigator.userAgent.match(/iPad/i)?"iPad":navigator.userAgent.match(/iPhone/i)?"iPhone":void 0}function i(){h=!h,h?(t()&&(w.insideIframe=!0,document.body.style.overflow="hidden",document.body.style.height=window.innerHeight-150+"px"),g.innerHTML=p.outerHTML):(t()&&(w.insideIframe=!1,document.body.style.overflow="auto",document.body.style.height="auto"),g.innerHTML=c.outerHTML),o(m)}function o(e){e.style.height=s(),e.style.width=r(),window.innerWidth<=480&&(e.style.top=0,e.style.left=0,e.style.right=0,e.style.bottom=0)}function s(){if(h){if(window.innerWidth<=480)return"100%";var e=window.innerHeight-70-10-20;return (e>570&&y.type=="chat")?"570px":e+"px"}return"0px"}function r(){return h?window.innerWidth<=480?"100%":"chat"==y.type?"370px":window.innerWidth-40+"px":"0px"}function l(){console.log("onresize"),window.innerWidth<=480?(m.style.position="fixed",m.style.bottom=0,m.style.right=0,m.style.borderRadius=0,f.style.display="block"):(m.style.position="fixed",m.style.bottom="80px",m.style.right="20px",m.style.borderRadius="10px",f.style.display="none"),m.style.height=s(),m.style.width=r()}var d="' + url + '";"undefined"==typeof orderingSettings&&(orderingSettings={});var a=orderingSettings,y={openOnMobile:e(a.openOnMobile,!1),openOnDesktop:e(a.openOnDesktop,!1),type:e(a.type,"chat")},h=!1,g=document.createElement("div"),c=document.createElement("img");c.src=d.split("/")[0]+"//"+d.split("/")[2]+"/templates/web/img/icon.png",c.style.width="30px",c.style.marginTop="9px",c.style.maxWidth="none";var p=document.createElement("div");p.innerHTML="&times;",p.style.display="block",p.style.color="#fff",p.style.font="Arial",p.style.fontSize="30px",p.style.margin="0 5px",p.style.borderRadius="50px",p.style.width="40px",p.style.height="40px",p.style.lineHeight="47px",p.style.fontWeight="400",g.style.position="fixed",g.style.bottom="20px",g.style.right="20px",g.style.width="50px",g.style.height="50px",g.style.background="' + color + '",g.style.borderRadius="50px",g.style.textAlign="center",g.style.cursor="pointer",g.style.outline="none",g.style.border=0,g.style.zIndex=99999,g.appendChild(c);var m=document.createElement("div");m.id="ordering_bot",m.style.height=0,m.style.width=0,m.style.position="fixed",m.style.bottom="80px",m.style.right="20px",m.style.borderRadius="10px",m.style.overflow="hidden",m.style.zIndex=99999,m.style.maxheight=window.innerHeight+"px",m.style["-webkit-transition"]="height 0.5s, width 0.5s",m.style["-moz-transition"]="height 0.5s, width 0.5s",m.style["-ms-transition"]="height 0.5s, width 0.5s",m.style["-o-transition"]="height 0.5s, width 0.5s",m.style.transition="height 0.5s, width 0.5s";var u=document.createElement("iframe");u.id="ordering_bot_iframe",u.src=d,u.setAttribute("allow", "geolocation"),u.style.border=0,u.style.height="125%",u.style.width="125%",u.style.maxWidth="none",u.style["-ms-zoom"]="0.8",u.style["-moz-transform"]="scale(0.8)",u.style["-moz-transform-origin"]="0 0",u.style["-o-transform"]="scale(0.8)",u.style["-o-transform-origin"]="0 0",u.style["-webkit-transform"]="scale(0.8)",u.style["-webkit-transform-origin"]="0 0";var w={insideIframe:!1};m.addEventListener("mouseenter",function(){w.insideIframe=!0,w.scrollX=window.scrollX,w.scrollY=window.scrollY,t()||(document.body.style.overflow="hidden")}),m.addEventListener("mouseleave",function(){w.insideIframe=!1,t()||(document.body.style.overflow="auto")}),document.addEventListener("scroll",function(e){w.insideIframe&&(e.preventDefault(),window.scrollTo(0,0))});var f=document.createElement("div");f.style.position="absolute",f.style.width="35px",f.style.height="35px",f.style.bottom="45px",f.style.left="50%",f.style.lineHeight="36px",f.style.background="transparent",f.style.borderColor="transparent";var x=document.createElement("div");x.innerHTML="&times;",x.style.position="relative",x.style.left="-50%",x.style.zIndex="999",x.style.width="40px",x.style.height="40px",x.style.background="rgba(0,0,0,0.2)",x.style.textAlign="center",x.style.border=0,x.style.borderRadius="35px",x.style.color="#fff",x.style.fontSize="30px",x.style.outline="none",x.style.cursor="pointer",f.appendChild(x),m.appendChild(f),m.appendChild(u),document.getElementsByTagName("body")[0].appendChild(g),document.getElementsByTagName("body")[0].appendChild(m),window.toggleOrderingWidget=i,g.onclick=i,f.onclick=i,l(),window.onresize=l,(t()&&y.openOnMobile&&!n()||!t()&&y.openOnDesktop)&&i(),setInterval(function(){n()&&window.innerHeight<m.clientHeight&&(u.style.height=.7*window.innerHeight+"px"),n()&&window.innerHeight==m.clientHeight&&(m.style.bottom=0,u.style.height="125%")},2e3)};</script>';
		MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/channels.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (modal_channels) {
			modals.push(modal_channels);
			$scope.modal_channels = modal_channels;
			$scope.modal_channels.show();
			$scope.modalOpening = false;
			$(document).ready(function () {
				$('[data-toggle="popover"]').popover({ html: true })
			});
			/***Show Bottom Help***/
		});
	}
	$scope.hideChannels = function () {
		if ($scope.modal_channels) {
			$scope.modal_channels.hide();
			$scope.modal_channels.remove();
		}
	}
	$scope.changeCustomslug = function () {
		if (curTimeout) $timeout.cancel(curTimeout);
		curTimeout = $timeout(function () {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.business.update({
				id: $scope.deal.id,
				slug: $scope.deal.slug,
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					MyLoading.success($scope.translate('CUSTOM_SLUG_SAVED_RELOAD'), 1500);
					setTimeout(function () {
						$state.go('main.business-editor', { slug: $scope.deal.slug });
					}, 0);
				} else MyAlert.show(res.result);
			});
		}, 0);
	}
	/* Finish Channels */
	$scope.$on('modal.hidden', function (event) {
		$scope.initDiscounts();
	});
	/*HANDSOTABLE*/
	$scope.view = 'visual';
	$scope.changeView = function (category, view) {
		$scope.view = view;
		if (view == 'table') {
			$scope.selectedCategory = {};
			category.products.forEach(function (product) {
				if (product.inventoried) {
					product._inventory = product.quantity
				} else if (product.id && !product.inventoried) {
					product._inventory = 'NA'
				}
			})
			$timeout(function () {
				$scope.selectedCategory = category;
			}, 100)
		} else Extensions.runAction('after_business_editor_open_category_view', category, $scope);
	}
	function emptyName(value, cb) {
		if (!value || value == '') cb(false);
		else cb(true);
	};
	Handsontable.validators.registerValidator('empty-name', emptyName);
	var undo = false;
	var removingWithSupr = false;
	var errors = [];
	var timeoutErrors = null;
	var cache = null;
	setInterval(function () {
		if (navigator.clipboard) navigator.clipboard.readText().then(function (clipboardData) {
			if (clipboardData) cache = clipboardData;
		}).catch(function (e) { });
	}, 100);
	var curCell = {
		col: -1,
		row: -1,
	};
	$scope.configs = {
		stretchH: 'all',
		undo: true,
		autoWrapRow: true,
		copyPaste: true,
		contextMenu: {
			items: {
				"copy": {
					name: $scope.translate('SPREADSHEET_COPY'),
				},
				'remove_row': {
					name: $scope.translate('SPREADSHEET_REMOVE_ROW'),
				},
				'undo': {
					name: $scope.translate('SPREADSHEET_UNDO'),
				},
				'redo': {
					name: $scope.translate('SPREADSHEET_REDO'),
				},
				"paste": {
					key: 'paste',
					name: $scope.translate('SPREADSHEET_PASTE'),
					disabled: function () {
						return cache ? false : true;
					},
					callback: function () {
						var plugin = this.getPlugin('copyPaste');
						this.listen();
						plugin.paste(cache);
					}
				}
			}
		},
		afterSelectionEnd: function (row, col, row1, col1) {
			if ((curCell.row == row && curCell.col == col) || (row !== row1 || col !== col1)) return;
			curCell.row = row;
			curCell.col = col;
			var hot = hotRegisterer.getInstance('products');
			hot.deselectCell();
			hot.selectCell(row, col);
		},
		outsideClickDeselects: function (event) {
			curCell.row = -1;
			curCell.col = -1;
			return false;
		},
		beforeRemoveRow: function (row, amount, datarows) {
			var toRemove = [];
			for (var i = 0; i < datarows.length; i++) {
				toRemove.push(hotRegisterer.getInstance('products').getSourceDataAtRow(datarows[i]).id)
			}
			remove = function (toRemove) {
				Ordering.bulks_products.delete({
					products: JSON.stringify(toRemove)
				}, function (res) {
					if (!res.error) {
						MyLoading.success($scope.translate('PRODUCT_DELETED'), 2000);
					} else MyAlert.show(res.result)
				});
			}
			if (removingWithSupr) {
				removingWithSupr = false;
				remove(toRemove);
				return;
			}
			MyAlert.confirm($scope.translate('QUESTION_DELETE_PRODUCT')).then(function (res) {
				if (res) {
					remove(toRemove);
				}
			}).catch(function (err) {
				if (err) {
					undo = true;
					hotRegisterer.getInstance('products').undo();
				}
			})
		},
		afterChange: function (b) {
			if (undo) {
				undo = false;
				return;
			};
			b = !b ? [] : b;
			var changes = [];
			var itemToRemove = [];
			var itemToUpdate = [];
			var itemToAdd = [];
			for (var i = 0; i < b.length; i++) {
				var error = {
					name: false,
					price: false,
				};
				if (b[i][2] != b[i][3]) {
					var valid = true;
					for (var j = 0; j < changes.length; j++) {
						if (changes[j] == b[i][0]) {
							valid = false;
							break;
						}
					}
					if (valid) {
						changes.push(b[i][0]);
						var row = hotRegisterer.getInstance('products').getSourceDataAtRow(b[i][0]);
						hotRegisterer.getInstance('products').validateRows(changes, function (res) { });
						if (!row.name) {
							error.name = true;
							if (errors.indexOf($scope.translate('NAME_REQUIRED')) == -1 && (row.description || row.name)) errors.push($scope.translate('NAME_REQUIRED'));
						}
						if (row.price && typeof (row.price) != 'number') {
							var price = parseFloat(row.price);
							if (!price) {
								error.price = true;
								if (errors.indexOf($scope.translate('PRODUCT_PRICE_NUMBER')) == -1) errors.push($scope.translate('PRODUCT_PRICE_NUMBER'));
							} else row.price = price;
						}
						if (row._inventory && typeof (row._inventory) != 'number' && row._inventory != 'NA') {
							var quantity = parseFloat(row.quantity);
							if (!quantity) {
								error.quantity = true;
								if (errors.indexOf($scope.translate('PRODUCT_QUANTITY_NUMBER')) == -1) errors.push($scope.translate('PRODUCT_QUANTITY_NUMBER'));
							} else row.quantity = quantity;
						}
						if (!row.id) {
							if (error.price || error.name || error.quantity) continue;
							var _add = {
								name: row.name,
								description: row.description ? row.description : ' ',
								price: row.price ? row.price : 0,
								category_id: $scope.categorySelected,
								business_id: $scope.deal.id,
							}
							if (row._inventory && row._inventory != 'NA' || row._inventory == 0) {
								_add.quantity = row._inventory;
								_add.inventoried = true;
							}
							itemToAdd.push(_add);
						} else {
							if (!row.name && !row.price && !row.description) {
								row.row = b[i][0];
								itemToRemove.push(row)
							} else {
								if (error.price || error.name || error.quantity) continue;
								if (!row.description) row.description = null;
								var _update = {
									id: row.id,
									name: row.name,
									description: row.description ? row.description : ' ',
									price: row.price ? row.price : 0,
									category_id: $scope.categorySelected,
									business_id: $scope.deal.id,
								}
								if (row._inventory && row._inventory != 'NA' || row._inventory == 0) {
									_update.quantity = row._inventory;
									_update.inventoried = true;
								}
								itemToUpdate.push(_update)
							}
						}
					}
				}
			}
			if (errors.length > 0) {
				if (timeoutErrors) clearTimeout(timeoutErrors);
				timeoutErrors = setTimeout(function () {
					MyAlert.show(errors);
					errors = [];
				}, 100)
			}
			if (itemToAdd.length > 0) {
				Ordering.bulks_products.add({
					products: JSON.stringify(itemToAdd)
				}, function (res) {
					if (!res.error) {
						MyLoading.success($scope.translate('PRODUCT_ADDED'), 1500);
						Ordering.products.all({
							business_id: $scope.deal.id,
							category_id: $scope.categorySelected
						}, function (res) {
							if (!res.error) {
								res.result.forEach(function (product) {
									if (product.inventoried) {
										product._inventory = product.quantity
									} else if (product.id && !product.inventoried) {
										product._inventory = 'NA'
									}
								})
								$scope.selectedCategory.products = res.result;
								Extensions.runAction('after_business_editor_open_category_view', $scope.selectedCategory, $scope);
							} else MyAlert.show(res.result)
						})
					} else MyAlert.show(res.result)
				})
			}
			if (itemToUpdate.length > 0) {
				Ordering.bulks_products.update({
					products: JSON.stringify(itemToUpdate)
				}, function (res) {
					if (!res.error) {
						MyLoading.success($scope.translate('PRODUCT_SAVED'), 1500);
						Ordering.products.all({
							business_id: $scope.deal.id,
							category_id: $scope.categorySelected
						}, function (res) {
							if (!res.error) {
								res.result.forEach(function (product) {
									if (product.inventoried) {
										product._inventory = product.quantity
									} else if (product.id && !product.inventoried) {
										product._inventory = 'NA'
									}
								})
								$scope.selectedCategory.products = res.result;
								Extensions.runAction('after_business_editor_open_category_view', $scope.selectedCategory, $scope);
							} else MyAlert.show(res.result)
						})
					} else MyAlert.show(res.result)
				})
			}
			if (itemToRemove.length > 0) {
				MyAlert.confirm($scope.translate('QUESTION_DELETE_PRODUCT')).then(function (res) {
					if (res) {
						removingWithSupr = true;
						hotRegisterer.getInstance('products').alter('remove_row', itemToRemove[0].row, itemToRemove.length);
					}
				}).catch(function (err) {
					if (err) {
						undo = true;
						hotRegisterer.getInstance('products').undo();
					}
				})
			}
		},
	}
	$scope.nuevaFuncion = function () {
		$("[data-toggle=popover]").popover({ html: true })
	};
	/***Show Bottom Help***/
	/*END HANDSOMETABLE*/
	Extensions.runAction('enter_business_editor_view', null, $scope);

	$scope.initView();
});

_controllers.controller('ordersManagerCtrl', function ($scope, $rootScope, $timeout, $interval, $location, $state, MyModal, MyToast, MyAlert, Ordering, MyLoading, gUser/*newordersEditorCtrl*/) {
	if (NOTIFICATION_TOAST) {
		$rootScope.NOTIFICATION_TOAST = NOTIFICATION_TOAST;
	} else {
		setTimeout(function () {
			$rootScope.NOTIFICATION_TOAST = NOTIFICATION_TOAST;
		}, 1500)
	}
	if (!$scope.editorAvilable || (!ADDONS.delivery_dashboard && $state.current.name == "main.deliveries")) {
		return $state.go(app_states.homeScreen);
	}
	$scope.$on('$locationChangeStart', function (event, current, old) {
		if ($location.search().id) {
			if (ADDONS.delivery_dashboard && $state.current.name == "main.deliveries") $scope.openMapById($location.search().id);
			else $scope.openDetailsById($location.search().id, $location.search().tab == 'messages' ? 1 : 0);
		}
	})

	$scope.order_groups = [];
	$scope.driver_companies = [];

	// Ordering.business.all({
	// 	mode: 'dashboard',
	// 	params: 'id,name'
	// },function (res) {
	// 	if (!res.error) {
	// 		$scope.business = res.result
	// 		$scope.multiBusiness('business-select');
	// 	} else MyAlert.show(res.result)
	// })
	Ordering.controls.orders({
	}, function (res) {
		if (!res.error) {
			$scope.business = res.result.businesses
			$scope.drivergroups_filter = res.result.driver_groups
			$scope.multiBusiness('business-select');
		} else MyAlert.show(res.result)
	})
	Ordering.users.all({
		mode: 'dashboard',
		params: 'id,name,lastname',
		where: [
			{
				attribute: 'level',
				value: {
					condition: '=',
					value: 4,
				}
			}
		]
	}, function (res) {
		if (!res.error) {
			$scope.drivers_filter = res.result
		} else MyAlert.show(res.result)
	})
	Ordering.driver_companies.all({
	}, function (res) {
		if (!res.error) {
			$scope.driver_companies = res.result
			// $scope.multiBusiness('business-select');
		} else {
			MyAlert.show(res.result)
		}
	})
	// if(gUser.getData().level == 0){
	// 	Ordering.drivergroups.all({
	// 		params: 'id,name,drivers',
	// 		where: [
	// 			{
	// 				attribute: 'enabled',
	// 				value: {
	// 					condition: '=',
	// 					value: true,
	// 				}
	// 			}
	// 		]
	// 	},function (res) {
	// 		if (!res.error) {
	// 			$scope.drivergroups_filter = res.result
	// 		} else MyAlert.show(res.result)
	// 	})
	// }
	$scope.notifications = [];
	$scope.selected_businesses = [];
	$scope.businesses_text = $scope.translate('SELECT_BUSINESS')
	var socket = io(SOCKET_URL, {
		extraHeaders: {
			Authorization: "Bearer " + localStorageApp.getItem(STORE.TOKEN),
		},
		query: "token=" + localStorageApp.getItem(STORE.TOKEN) + "&project=" + API_PROJECT_NAME,
		transports: ['websocket']
	});
	if (sockets['ordersEditorCtrl']) sockets['ordersEditorCtrl'].disconnect();
	sockets['ordersEditorCtrl'] = socket;
	socket.on('connect', function () {
		var orders_room = API_PROJECT_NAME + '_orders' + (gUser.getData().level == 0 ? '' : '_' + gUser.getData().id);
		var drivers_room = API_PROJECT_NAME + '_drivers';
		var message_orders = API_PROJECT_NAME + '_messages_orders' + (gUser.getData().level == 0 ? '' : '_' + gUser.getData().id);
		var order_groups_room = API_PROJECT_NAME + '_ordergroups' + (gUser.getData().level == 0 ? '' : '_' + gUser.getData().id);
		socket.emit('join', orders_room);
		socket.emit('join', drivers_room);
		socket.emit('join', message_orders);
		socket.emit('join', order_groups_room);
		socket.on('ordergroups_register', function (order_group) {
			if (order_group.status > 1) {
				return;
			}
			var color = getRandomColor();
			$scope.order_group_colors['ORDER_GROUP_' + order_group.id] = color;
			order_group.color = color;
			$scope.order_groups.push(order_group);
		});

		socket.on('ordergroups_update', function (order_group) {
			for (var i = 0; i < $scope.order_groups.length; i++) {
				if ($scope.order_groups[i].id == order_group.id) {
					if (order_group.status > 1) {
						$scope.$apply(function () {
							delete $scope.order_group_colors['ORDER_GROUP_' + order_group.id];
							$scope.order_groups.splice(i, 1);
							var debug_filter = $scope.search.order_group_id || ''
							var _order_group = $scope.order_groups.find(function (__order_group) {
								return __order_group.id === debug_filter
							})
							!_order_group && debug_filter !== '' && $scope.onGroup();
						});
					} else {
						$scope.$apply(function () {
							Object.assign($scope.order_groups[i], order_group);
						});
					}
					break;
				}
			}
		});
		socket.on('orders_register', function (order) {
			for (var key in $scope.orders) {
				var status_orders = $scope.orders[key];
				for (var i = 0; i < status_orders.length; i++) {
					var _order = status_orders[i];
					if (_order.id == order.id) {
						return;
					}
				}
			}

			$scope.$apply(function () {
				order.delivery_datetime_date = moment(order.delivery_datetime).toDate();
				order.unread_count = 0;
				var total = $scope.Order.getTotal(order);
				$scope.totals.pending += total;
				$scope.orders_ids.pending.unshift(order.id);
				$scope.orders.pending.unshift(order);
				$scope.counters.pending++;
				refreshTotals();
				if ($rootScope.NOTIFICATION_TOAST == 'true') {
					MyToast.add($scope.translate('ORDER_N_ORDERED').replace('_order_id_', order.id), { timeout: 7000 }).then(function () {
						$scope.openOrder(order, 'messages');
						stopNotificationSound(order.id);
					});
					setTimeout(function () {
						stopNotificationSound(order.id);
					}, 7000)
				} else {
					MyAlert.show($scope.translate('ORDER_N_ORDERED').replace('_order_id_', order.id)).then(function () {
						stopNotificationSound(order.id);
					});
				}
				playNotificationSound(order.id);
			});
		});

		socket.on('update_order', function (data) {
			if (data.status || data.status == 0) {
				data.status = data.status + '';
			}
			if (data.priority || data.priority == 0) {
				data.priority = data.priority + '';
			}
			if (data.driver_id) {
				data.driver_id = data.driver_id + '';
			} else if (data.driver_id === null) {
				data.driver_id = '';
			}
			if (data.order_group_id) {
				data.order_group_id = data.order_group_id + '';
			} else if (data.order_group_id === null) {
				data.order_group_id = '';
			}
			if (data.driver_company_id) {
				data.driver_company_id = data.driver_company_id + '';
			} else if (data.driver_company_id === null) {
				data.driver_company_id = '';
			}
			$scope.$apply(function () {
				if (data.driver_id) data.driver_id = data.driver_id + '';
				if ($scope.curOrder && $scope.curOrder.id == data.id) {
					Object.assign($scope.curOrder, data);
				}
				var data_order = null;
				var found = false;
				for (var key in $scope.orders) {
					if (found) break;
					var status_orders = $scope.orders[key];
					for (var i = 0; i < status_orders.length; i++) {
						if (found) break;
						var order = status_orders[i];
						if (order.id == data.id) {
							Object.assign(order, data);
							data_order = order;
							status_orders.splice(i, 1);
							$scope.counters[key]--;
							if ($scope.order_status.pending.indexOf(order.status * 1) != -1) {
								$scope.orders.pending.push(order);
								$scope.counters.pending++;
							} else if ($scope.order_status.in_progress.indexOf(order.status * 1) != -1) {
								$scope.orders.in_progress.push(order);
								$scope.counters.in_progress++;
							} else if ($scope.order_status.completed.indexOf(order.status * 1) != -1) {
								$scope.orders.completed.push(order);
								$scope.counters.completed++;
							} else if ($scope.order_status.cancelled.indexOf(order.status * 1) != -1) {
								$scope.orders.cancelled.push(order);
								$scope.counters.cancelled++;
							}
							found = true;
							break;
						}
					}
				}
				var status = '';
				for (var key in $scope.orders_ids) {
					var orders_ids = $scope.orders_ids[key];
					for (var i = 0; i < orders_ids.length; i++) {
						var order_id = orders_ids[i];
						if (order_id == data.id) {
							if ($scope.order_status.pending.indexOf(data_order.status * 1) != -1) {
								status = 'pending';
							} else if ($scope.order_status.in_progress.indexOf(data_order.status * 1) != -1) {
								status = 'in_progress';
							} else if ($scope.order_status.completed.indexOf(data_order.status * 1) != -1) {
								status = 'completed';
							} else if ($scope.order_status.cancelled.indexOf(data_order.status * 1) != -1) {
								status = 'cancelled';
							}
							break;
						}
					}
				}
				for (var key in $scope.orders) {
					var orders_ids = $scope.orders_ids[key];
					if (!orders_ids) continue;
					for (var i = 0; i < orders_ids.length; i++) {
						var order_id = orders_ids[i];
						if (data.id == order_id) {
							Object.assign(order, data);
							var total = $scope.Order.getTotal(order);
							$scope.totals[key] -= total;
							$scope.totals[status] += total;
							$scope.orders_ids[key].splice(i, 1);
							$scope.orders_ids[status].push(order_id);
							refreshTotals();
							break;
						}
					}
				}
			});
		});

		socket.on('drivers_update', function (data) {
			$scope.$apply(function () {
				var bounds = new google.maps.LatLngBounds();
				for (var i = 0; i < $scope.drivers.length; i++) {
					if ($scope.drivers[i].id == data.id) {
						Object.assign($scope.drivers[i], data);
						bounds.extend($scope.drivers[i].location);
						break;
					}
				}
				for (var i = 0; i < $scope.users.length; i++) {
					if ($scope.users[i].id == data.id) {
						Object.assign($scope.users[i], data);
						break;
					}
				}
				$scope.showDrivers($scope.drivers, bounds);
			});
		});

		socket.on('tracking_driver', function (data) {
			$scope.$apply(function () {
				for (var i = 0; i < $scope.drivers.length; i++) {
					if ($scope.drivers[i].id == data.driver_id) {
						$scope.drivers[i].location = data.location;
						break;
					}
				}
				for (var i = 0; i < markers.length; i++) {
					if (markers[i].driver_id == data.driver_id) {
						markers[i].setPosition(data.location);
					}
				}
				if (marker_driver && marker_driver.driver_id == data.driver_id) {
					marker_driver.setPosition(data.location);
				}
			});
		});

		socket.on('message', function (message) {
			$scope.getOrderById(message.order_id, function (order) {
				$scope.$apply(function () {
					order.unread_count++;
					MyToast.add($scope.translate('NEW_MESSAGE_ORDER').replace('_order_', order.id), { timeout: 3000 }).then(function () {
						$scope.openOrder(order, 'messages');
					});
				});
			});
		});
	});

	function playNotificationSound(id) {

		var interval = $interval(function () {
			var notification = document.getElementById("notification-sound");
			try {
				notification.play();
			} catch (err) { }
		}, 2500);
		var notification = {
			interval: interval,
			id: id,
		};
		$scope.notifications.push(notification);
	}

	function stopNotificationSound(id) {
		for (var i = 0; i < $scope.notifications.length; i++) {
			if ($scope.notifications[i].id == id) {
				$interval.cancel($scope.notifications[i].interval);
			}
		}
	}
	$scope.search = {
		id: '',
		business: '',
		city: '',
		state: '',
		cemail: '',
		cphone: '',
		date: {
			from: '',
			to: '',
			day: ''
		},
		orderby: '-id',
		paymethod: '',
		driver: '',
		delivery_type: ''
	};
	$scope.searchChanged = null;
	$scope.filtered = [];
	$scope.o_business = {};
	$scope.cities = [];
	$scope.filterTotal = 0;

	$scope.show_filters = false;
	$scope.curOrder = null;
	$scope.curDriver = null;
	$scope.delivery_mode = ADDONS.delivery_dashboard && $state.current.name == "main.deliveries";
	var map = null;
	var directionsService = null;
	var directionsDisplay = null;
	var marker_customer = null;
	var marker_business = null;
	var marker_driver = null;
	var markers = [];

	// News
	$scope.cities = [];
	$scope.users = [];
	$scope.business = [];
	$scope.paymethods = [];
	$scope.drivers = [];
	$scope.curTab = 'pending';
	$scope.drivers_filter = [];
	$scope.drivergroups_filter = [];
	$scope.order_status = {
		pending: [0, 13],
		in_progress: [3, 4, 7, 8, 9, 14, 18, 19, 20, 21],
		completed: [1, 11, 15],
		cancelled: [2, 5, 6, 10, 12, 16, 17],
		active_drivers: [0, 1, 2, 5, 6, 7, 8, 9, 10, 11, 12, 13, 18, 19],
		inactive_drivers: [0, 1, 2, 5, 6, 7, 8, 9, 10, 11, 12, 13, 18, 19],
	};
	$scope.drivergroups_filter_dashboard = [];

	$scope.loadings = {
		dashboard: true,
		pending: true,
		in_progress: true,
		completed: true,
		cancelled: true
	};
	$scope.counters = {
		pending: 0,
		in_progress: 0,
		completed: 0,
		cancelled: 0
	};
	$scope.orders = {
		pending: [],
		in_progress: [],
		completed: [],
		cancelled: []
	};
	$scope.totals = {
		page: 0,
		pending: 0,
		in_progress: 0,
		completed: 0,
		cancelled: 0
	};
	$scope.orders_ids = {
		pending: [],
		in_progress: [],
		completed: [],
		cancelled: []
	};

	$scope._pagination = {
		current: 1,
		pages: 1,
		items: 10,
		itemsPerPage: [10, 20, 30, 50, 100],
		nextPage: function () {
			if ($scope._pagination.current == $scope._pagination.pages) return;
			$scope._pagination.current++;
			var from = (($scope._pagination.current - 1) * $scope._pagination.items) + 1;
			var to = $scope._pagination.current * $scope._pagination.items;
			if ($scope.orders[$scope.curTab].length < from) {
				$scope.loadings[$scope.curTab] = true;
				var where = $scope.generateWhere().where;
				var where_status = $scope.generateWhere().where_status;
				var orderBy = $scope.search.orderby;

				var status = [{
					attribute: 'status',
					value: where_status ? where_status.value : $scope.order_status[$scope.curTab]
				}];
				Ordering.orders.all({
					mode: 'dashboard',
					orderBy: orderBy,
					where: where.concat(status),
					limit: $scope._pagination.items,
					offset: from - 1
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
					refreshTotals();
				});
			}
			refreshTotals();
		},
		backPage: function () {
			if ($scope._pagination.current == 1) return;
			$scope._pagination.current--;
			refreshTotals();
		},
		reset: function () {
			$scope._pagination.current = 1;
			$scope._pagination.pages = Math.ceil($scope.counters[$scope.curTab] / $scope._pagination.items);
			refreshTotals();
		}
	};

	function refreshTotals() {
		$scope.totals.page = 0;
		if (!$scope.orders[$scope.curTab]) return;
		var from = (($scope._pagination.current - 1) * $scope._pagination.items);
		var to = $scope._pagination.current * $scope._pagination.items;
		for (var i = from; i < to; i++) {
			var order = $scope.orders[$scope.curTab][i];
			if (!order) continue;
			$scope.totals.page += $scope.Order.getTotal(order);
		}
	}

	$scope.startMap = function () {
		if (!map) {
			map = new google.maps.Map(document.getElementById('order-map'), {
				center: { lat: -34.397, lng: 150.644 },
				zoom: 8,
				mapTypeControl: false,
				streetViewControl: false,
				rotateControl: false,
				fullscreenControl: false
			});
			directionsService = new google.maps.DirectionsService;
			directionsDisplay = new google.maps.DirectionsRenderer;
			directionsDisplay.setOptions({ suppressMarkers: true });
			directionsDisplay.setMap(map);
		}
	}

	$scope.$watch('curTab', function (current, previous) {
		if (['active_drivers', 'inactive_drivers'].indexOf(previous) != -1) {
			$scope.search.driver = '';
		}
		$scope._pagination.reset();
		refreshTotals();
	});
	$scope.$watchCollection('search', function () {
		$scope.searchChanged = $scope.searchChanged == null ? false : true;
	});
	$scope.$watchCollection('search.date', function () {
		$scope.searchChanged = $scope.searchChanged == null ? false : true;
	});
	$scope.$watchGroup(['users', 'business'], function () {
		if ($scope.users.length > 0 && $scope.business.length > 0) {
			var drivers = [];
			var allGroups = [];
			var drivers_ids = [];
			// for (var i = 0; i < $scope.business.length; i++) {
			// 	for (var j = 0; j < $scope.users.length; j++) {
			// 		if (!$scope.users[j].drivergroups || !$scope.users[j].enabled || !$scope.users[j].location) continue;
			// 		for (var k = 0; k < $scope.users[j].drivergroups.length; k++) {
			// 			if (!$scope.users[j].drivergroups[k].enabled) continue;
			// 			for (var l = 0; l < $scope.users[j].drivergroups[k].business.length; l++) {
			// 				if ($scope.users[j].drivergroups[k].business[l].id == $scope.business[i].id) {
			// 					if (drivers_ids.indexOf($scope.users[j].id) > -1) continue;
			// 					drivers.push($scope.users[j]);
			// 					drivers_ids.push($scope.users[j].id);
			// 				}
			// 			}
			// 		}
			// 	}
			// }
			drivers = $scope.users;
			$scope.drivers = drivers
			$scope.drivers.forEach(function (driver) {
				drivers_ids = driver.id;
			})

			if ($scope.delivery_mode) {
				$scope.loadGoogleMaps(function () {
					markers.forEach(function (marker) {
						marker.setMap(null);
					});
					markers = [];
					$scope.startMap();
					var bounds = new google.maps.LatLngBounds();
					for (var i = 0; i < $scope.drivers.length; i++) {
						if ($scope.drivers[i].location && (
							($scope.search.drivergroup == undefined || $scope.search.drivergroup == '') ||
							(($scope.search.drivergroup != undefined && $scope.search.drivergroup != '') && $scope.drivergroups_filter_dashboard.indexOf($scope.drivers[i].id) != -1)
						)) {
							var infowindow = new google.maps.InfoWindow();
							var driver = new MarkerWithLabel({
								position: $scope.drivers[i].location,
								draggable: false,
								raiseOnDrag: false,
								map: map,
								labelContent: '<div>' + $scope.drivers[i].id + '</div>',
								labelAnchor: new google.maps.Point(19, 45),
								labelClass: "pin driver" + ((!$scope.drivers[i].available) ? " invactive" : " active") + (($scope.drivers[i].id <= 1000) ? " small" : " large"), // the CSS class for the label
								labelStyle: { opacity: 1 }
							});
							driver.driver_id = $scope.drivers[i].id;
							driver.name = $scope.drivers[i].name;
							for (var j = 0; j < $scope.drivers[i].drivergroups.length; j++) {
								allGroups.push($scope.drivers[i].drivergroups[j].name);
							}
							driver.drivergroup = $scope.drivers[i].drivergroups[0].name;
							driver.drivergroups = $scope.drivers[i].drivergroups;
							driver.last_order_at = $scope.drivers[i].last_order_assigned_at;
							driver.last_location_at = $scope.drivers[i].last_location_at;
							var markers_index = markers.push(driver) - 1;
							google.maps.event.addListener(markers[markers_index], 'mouseover', function () {
								var makecontent = '<div class="delivery-infowindow">'
								makecontent += '<strong>' + $scope.translate('NAME') + ': </strong> ' + this.name + '<br>'
								if (this.last_order_at) makecontent += '<strong>' + $scope.translate('LAST_ORDER_AT') + ': </strong> ' + this.last_order_at + '<br>';
								if (this.drivergroup) {
									makecontent += '<strong>' + $scope.translate('DRIVERGROUP') + ': </strong> ';
									for (var k = 0; k < this.drivergroups.length; k++) {
										makecontent += this.drivergroups[k].name;
										if (k + 1 < this.drivergroups.length) makecontent += ', ';
										if ((k + 1) % 3 == 2) makecontent += '<br>';
									}
									if (this.drivergroups.length % 3 != 2) makecontent += '<br>';
								}
								if (this.last_location_at) makecontent += '<strong>' + $scope.translate('LAST_LOCATION') + ': </strong> ' + this.last_location_at + '<br>'
								makecontent += '</div>';
								infowindow.setContent(makecontent);
								infowindow.open(map, this);
							});
							google.maps.event.addListener(markers[markers_index], 'mouseout', function () {
								infowindow.close(map, this);
							});
							bounds.extend($scope.drivers[i].location);
						}
					}
					map.fitBounds(bounds);
				}, true);
			}
		}
	});

	$scope.$watchGroup(['orders.pending', 'orders.in_progress', 'orders.completed', 'orders.cancelled'], function () {
		var business_ids = [];
		var cities_ids = [];
		var drivers_ids = [];
		var paumethods_ids = [];

		// var business = [];
		var cities = [];
		// var drivers_filter = [];
		var paymethods = [];
		for (key in $scope.orders) {
			$scope.orders[key].forEach(function (order) {
				if (!order.delivery_datetime_date) {
					order.delivery_datetime_date = moment(order.delivery_datetime).toDate();
				}
				// if (order.business_id != null && business_ids.indexOf(order.business_id) == -1 && order.business) {
				// 	business_ids.push(order.business_id);
				// 	business.push({id: order.business_id, name: order.business.name});
				// }
				if (order.business && order.business.city_id && cities_ids.indexOf(order.business.city_id) == -1 && order.business) {
					cities_ids.push(order.business.city_id);
					cities.push({ id: order.business.city_id, name: order.business.city.name });
				}
				// if (order.driver && drivers_ids.indexOf(order.driver.id) == -1) {
				// 	drivers_ids.push(order.driver.id);
				// 	drivers_filter.push({id: order.driver.id, name: order.driver.name+(order.driver.lastname?" "+order.driver.lastname:'')});
				// }
				if (order.paymethod && paumethods_ids.indexOf(order.paymethod.id) == -1) {
					paumethods_ids.push(order.paymethod.id);
					paymethods.push({ id: order.paymethod.id, name: $scope.translate(order.paymethod.gateway.toUpperCase()) });
				}
			})
		}
		// $scope.business = business;
		$scope.cities = cities;
		// $scope.drivers_filter = drivers_filter;
		$scope.paymethods = paymethods;
	});
	// End news
	$scope.generateWhere = function () {
		var where = [];
		var where_status = null;
		if ($scope.search.id) where.push({
			attribute: 'id',
			value: $scope.search.id
		});
		if ($scope.search.city) where.push({
			attribute: 'business',
			conditions: [
				{
					attribute: 'city_id',
					value: $scope.search.city
				}
			]
		});
		if ($scope.search.business) where.push({
			attribute: 'business_id',
			value: $scope.search.business
		})
		if ($scope.selected_businesses.length > 0) where.push({
			attribute: 'business_id',
			value: $scope.selected_businesses
		})
		if ($scope.search.driver) where.push({
			attribute: 'driver_id',
			value: $scope.search.driver
		});
		if ($scope.search.drivergroup) {
			var drivergroup_drivers = JSON.parse($scope.search.drivergroup)
			drivergroup_drivers = drivergroup_drivers.drivers.map(function (driver) {
				return driver;
			})
			where.push({
				attribute: 'driver_id',
				value: drivergroup_drivers
			});
			console.log('Entra filtro');
			$scope.drivergroups_filter_dashboard = drivergroup_drivers;
		}

		if ($scope.search.state) where_status = {
			attribute: 'status',
			value: $scope.search.state
		};
		if ($scope.search.paymethod) where.push({
			attribute: 'paymethod_id',
			value: $scope.search.paymethod
		});
		if ($scope.search.delivery_type) where.push({
			attribute: 'delivery_type',
			value: $scope.search.delivery_type
		});
		if ($scope.search.order_group_id) {
			where.push({
				attribute: 'order_group_id',
				value: $scope.search.order_group_id
			});
		}
		if ($scope.search.date.from) {
			where.push({
				attribute: 'delivery_datetime',
				value: {
					condition: '>=',
					value: $scope.search.date.from + ' 00:00:00'
				}
			});
		}
		if ($scope.search.date.to) {
			where.push({
				attribute: 'delivery_datetime',
				value: {
					condition: '<=',
					value: $scope.search.date.to + ' 23:59:59'
				}
			});
		}
		if ($scope.search.date.day) {
			where.push({
				attribute: 'delivery_datetime',
				value: {
					condition: '>=',
					value: $scope.search.date.day + ' 00:00:00'
				}
			});
			where.push({
				attribute: 'delivery_datetime',
				value: {
					condition: '<=',
					value: $scope.search.date.day + ' 23:59:59'
				}
			});
		}
		if ($scope.search.cemail || $scope.search.cphone) {
			var condition = {
				attribute: 'customer',
				conditions: []
			};
			if ($scope.search.cemail) {
				condition.conditions.push({
					attribute: 'email',
					value: {
						condition: 'ilike',
						value: encodeURI('%' + $scope.search.cemail + '%')
					}
				});
			}
			if ($scope.search.cphone) {
				condition.conditions.push({
					attribute: 'cellphone',
					value: {
						condition: 'ilike',
						value: encodeURI('%' + $scope.search.cphone + '%')
					}
				});
			}
			where.push(condition);
		}
		return { where: where, where_status: where_status };
	}
	$scope.initOrders = function () {
		$scope.loadings = {
			dashboard: true,
			pending: true,
			in_progress: true,
			completed: true,
			cancelled: true,
			active_drivers: true,
			inactive_drivers: true,
		};
		$scope.counters = {
			pending: 0,
			in_progress: 0,
			completed: 0,
			cancelled: 0
		};
		$scope.orders = {
			pending: [],
			in_progress: [],
			completed: [],
			cancelled: [],
			active_drivers: [],
			inactive_drivers: [],
		};
		$scope.totals = {
			page: 0,
			pending: 0,
			in_progress: 0,
			completed: 0,
			cancelled: 0
		};
		$scope.orders_ids = {
			pending: [],
			in_progress: [],
			completed: [],
			cancelled: []
		};
		var where = $scope.generateWhere().where;
		var where_status = $scope.generateWhere().where_status;
		var orderBy = $scope.search.orderby;
		var where_dashboard = where_status ? [where_status] : [];
		Ordering.orders.dashboard({
			where: where.concat(where_dashboard),
			orderBy: orderBy
		}, function (res) {
			$scope.loadings.dashboard = false;
			if (!res.error) {
				res.result.forEach(function (status) {
					if ($scope.order_status.pending.indexOf(status.status) != -1) {
						$scope.counters.pending += status.quantity;
						$scope.totals.pending += parseFloat(status.total);
						$scope.orders_ids.pending = $scope.orders_ids.pending.concat(status.orders);
					} else if ($scope.order_status.in_progress.indexOf(status.status) != -1) {
						$scope.counters.in_progress += status.quantity;
						$scope.totals.in_progress += parseFloat(status.total);
						$scope.orders_ids.in_progress = $scope.orders_ids.in_progress.concat(status.orders);
					} else if ($scope.order_status.completed.indexOf(status.status) != -1) {
						$scope.counters.completed += status.quantity;
						$scope.totals.completed += parseFloat(status.total);
						$scope.orders_ids.completed = $scope.orders_ids.completed.concat(status.orders);
					} else if ($scope.order_status.cancelled.indexOf(status.status) != -1) {
						$scope.counters.cancelled += status.quantity;
						$scope.totals.cancelled += parseFloat(status.total);
						$scope.orders_ids.cancelled = $scope.orders_ids.cancelled.concat(status.orders);
					}
				});
				$scope._pagination.reset();
			}
			Extensions.runAction('after_orders_editor_view', $scope.orders, $scope);
		});
		if (!where_status || $scope.order_status.pending.indexOf($scope.search.state * 1) != -1) {
			var status = [{
				attribute: 'status',
				value: where_status ? where_status.value : $scope.order_status.pending
			}];
			Ordering.orders.all({
				mode: 'dashboard',
				where: where.concat(status),
				orderBy: orderBy
			}, function (res) {
				if (!res.error) {
					$scope.orders.pending = res.result;
					$scope.loadings.pending = false;
					refreshTotals();
				}
			});
		} else $scope.loadings.pending = false;

		if (!where_status || $scope.order_status.in_progress.indexOf($scope.search.state * 1) != -1) {
			status = [{
				attribute: 'status',
				value: where_status ? where_status.value : $scope.order_status.in_progress
			}];
			Ordering.orders.all({
				mode: 'dashboard',
				where: where.concat(status),
				orderBy: orderBy
			}, function (res) {
				if (!res.error) {
					$scope.orders.in_progress = res.result;
					$scope.loadings.in_progress = false;
					refreshTotals();
				}
			});
		} else $scope.loadings.in_progress = false;

		if (!where_status || $scope.order_status.completed.indexOf($scope.search.state * 1) != -1) {
			status = [{
				attribute: 'status',
				value: where_status ? where_status.value : $scope.order_status.completed
			}];
			Ordering.orders.all({
				mode: 'dashboard',
				where: where.concat(status),
				orderBy: orderBy,
				limit: 50
			}, function (res) {
				if (!res.error) {
					$scope.orders.completed = res.result;
					$scope.loadings.completed = false;
					refreshTotals();
				}
			});
		} else $scope.loadings.completed = false;

		if (!where_status || $scope.order_status.cancelled.indexOf($scope.search.state * 1) != -1) {
			status = [{
				attribute: 'status',
				value: where_status ? where_status.value : $scope.order_status.cancelled
			}];
			Ordering.orders.all({
				mode: 'dashboard',
				where: where.concat(status),
				orderBy: orderBy,
				limit: 50
			}, function (res) {
				if (!res.error) {
					$scope.orders.cancelled = res.result;
					$scope.loadings.cancelled = false;
					refreshTotals();
				}
			});
		} else $scope.loadings.cancelled = false;

		if ($scope.curDriver) {
			if (!where_status || $scope.order_status.active_drivers.indexOf($scope.search.state * 1) != -1) {
				status = [{
					attribute: 'status',
					value: where_status ? where_status.value : $scope.order_status.active_drivers
				}];
				Ordering.orders.all({
					mode: 'dashboard',
					where: where.concat(status),
					orderBy: orderBy,
				}, function (res) {
					if (!res.error) {
						$scope.orders.active_drivers = res.result;
						$scope.loadings.active_drivers = false;
					}
				});
			} else $scope.loadings.active_drivers = false;
			if (!where_status || $scope.order_status.inactive_drivers.indexOf($scope.search.state * 1) != -1) {
				status = [{
					attribute: 'status',
					value: where_status ? where_status.value : $scope.order_status.inactive_drivers
				}];
				Ordering.orders.all({
					mode: 'dashboard',
					where: where.concat(status),
					orderBy: orderBy,
				}, function (res) {
					if (!res.error) {
						$scope.orders.inactive_drivers = res.result;
						$scope.loadings.inactive_drivers = false;
					}
				});
			} else $scope.loadings.active_drivers = false;
		}

		Ordering.users.all({
			params: 'name,lastname,location,enabled,available,busy,driver_groups.name,assigned_orders_count,last_order_assigned_at,last_location_at',
			where: [
				{
					attribute: 'level',
					value: 4
				},
				{
					attribute: 'enabled',
					value: true
				}
			],
		}, function (res) {
			$scope.users = res.result;
			if ($location.search().id) {
				setTimeout(function () {
					if (!$scope.delivery_mode) $scope.openDetailsById($location.search().id);
					else $scope.openMapById($location.search().id);
				}, 1000);
			}
		});
	}
	$scope.getOrderById = function (order_id, cb) {
		var to_open = null;
		for (var key in $scope.orders) {
			if (to_open) break;
			for (var i = 0; i < $scope.orders[key].length; i++) {
				if (to_open) break;
				var order = $scope.orders[key][i];
				if (order.id == order_id) {
					to_open = order
				}
			}
		}
		if (!to_open) {
			MyLoading.show($scope.translate('LOADING') + '...');
			Ordering.orders.get({
				mode: 'dashboard',
				id: order_id
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					cb(res.result);
				}
			});
		} else {
			cb(to_open);
		}
	}
	$scope.openDetailsById = function (order_id, tab) {
		$scope.getOrderById(order_id, function (order) {
			$scope.openDetails(order, tab);
		});
	}
	$scope.openMapById = function (order_id) {
		$scope.getOrderById(order_id, function (order) {
			$scope.openMap(order);
		});
	}
	$scope.getLanguage(function (err, list, dictionary) {
		$rootScope.pageTitle = $scope.translate($scope.delivery_mode ? 'DELIVERY_DASHBOARD' : 'ORDER_MANAGER');
		$scope.status = [
			{ id: "0", value: $scope.translate('ORDER_STATUS_PENDING'), tab: 'pending' },
			{ id: "1", value: $scope.translate('ORDERS_COMPLETED'), tab: 'completed' },
			{ id: "2", value: $scope.translate('ORDER_REJECTED'), tab: 'cancelled' },
			{ id: "3", value: $scope.translate('ORDER_STATUS_IN_BUSINESS'), tab: 'in_progress' },
			{ id: "4", value: $scope.translate('ORDER_READY'), tab: 'in_progress' },
			{ id: "5", value: $scope.translate('ORDER_REJECTED_RESTAURANT'), tab: 'cancelled' },
			{ id: "6", value: $scope.translate('ORDER_STATUS_CANCELLEDBYDRIVER'), tab: 'cancelled' },
			{ id: "7", value: $scope.translate('ORDER_STATUS_ACCEPTEDBYRESTAURANT'), tab: 'in_progress' },
			{ id: "8", value: $scope.translate('ORDER_CONFIRMED_ACCEPTED_BY_DRIVER'), tab: 'in_progress' },
			{ id: "9", value: $scope.translate('ORDER_PICKUP_COMPLETED_BY_DRIVER'), tab: 'in_progress' },
			{ id: "10", value: $scope.translate('ORDER_PICKUP_FAILED_BY_DRIVER'), tab: 'cancelled' },
			{ id: "11", value: $scope.translate('ORDER_DELIVERY_COMPLETED_BY_DRIVER'), tab: 'completed' },
			{ id: "12", value: $scope.translate('ORDER_DELIVERY_FAILED_BY_DRIVER'), tab: 'cancelled' },
			{ id: "13", value: $scope.translate('PREORDER'), tab: 'pending' },
			{ id: "14", value: $scope.translate('ORDER_NOT_READY'), tab: 'in_progress' },
			{ id: "15", value: $scope.translate('ORDER_PICKEDUP_COMPLETED_BY_CUSTOMER'), tab: 'completed' },
			{ id: "16", value: $scope.translate('ORDER_STATUS_CANCELLED_BY_CUSTOMER'), tab: 'cancelled' },
			{ id: "17", value: $scope.translate('ORDER_NOT_PICKEDUP_BY_CUSTOMER'), tab: 'cancelled' },
			{ id: "18", value: $scope.translate('ORDER_DRIVER_ALMOST_ARRIVED_BUSINESS'), tab: 'in_progress' },
			{ id: "19", value: $scope.translate('ORDER_DRIVER_ALMOST_ARRIVED_CUSTOMER'), tab: 'in_progress' },
			{ id: "20", value: $scope.translate('ORDER_CUSTOMER_ALMOST_ARRIVED_BUSINESS'), tab: 'in_progress' },
			{ id: "21", value: $scope.translate('ORDER_CUSTOMER_ARRIVED_BUSINESS'), tab: 'in_progress' },
		];
		$scope.order_types = [
			{ name: $scope.translate('ORDER_BY_ORDER_NUMBER') + ' (' + $scope.translate('DESCENDING') + ')', value: '-id', order: true },
			{ name: $scope.translate('ORDER_BY_ORDER_NUMBER') + ' (' + $scope.translate('ASCENDING') + ')', value: 'id', order: false },
			// { name: $scope.translate('ORDER_BY_BUSINESS')+' ('+$scope.translate('DESCENDING')+')', value: '-business.name', order: true  },
			// { name: $scope.translate('ORDER_BY_BUSINESS')+' ('+$scope.translate('ASCENDING')+')', value: 'business.name', order: false },
			// { name: $scope.translate('ORDER_BY_USER')+' ('+$scope.translate('DESCENDING')+')', value: '-customer.name', order: true },
			// { name: $scope.translate('ORDER_BY_USER')+' ('+$scope.translate('ASCENDING')+')', value: 'customer.name', order: false },
			{ name: $scope.translate('DELIVERY_TIME') + ' (' + $scope.translate('DESCENDING') + ')', value: '-delivery_datetime', order: true },
			{ name: $scope.translate('DELIVERY_TIME') + ' (' + $scope.translate('ASCENDING') + ')', value: 'delivery_datetime', order: false },
		];
		$scope.initOrders();
		Extensions.runAction('after_orders_manager_view', $scope.orders, $scope);
	});

	$scope.changeDeliveryFilter = function () {
		$scope.initOrders();
	}

	$scope.toggleFilters = function ($event) {
		$event.preventDefault();
		$scope.show_filters = !$scope.show_filters;
		if ($scope.show_filters) {
			if (!$('#dateday').data("DateTimePicker")) {
				$timeout(function () {
					var dateday = $('#dateday').datetimepicker({
						format: 'YYYY-MM-DD',
					})
					dateday.on('dp.show', function () {
						$(".bootstrap-datetimepicker-widget").attr('data-tap-disabled', 'true');
					});
					var datefrom = $('#datefrom').datetimepicker({
						format: 'L',
					})
					datefrom.on('dp.show', function () {
						$(".bootstrap-datetimepicker-widget").attr('data-tap-disabled', 'true');
					});
					var dateto = $('#dateto').datetimepicker({
						useCurrent: false, //Important! See issue #1075
						format: 'L',
					});
					dateto.on('dp.show', function () {
						$(".bootstrap-datetimepicker-widget").attr('data-tap-disabled', 'true');
					});
					$("#datefrom").on("dp.change", function (e) {
						$('#dateto').data("DateTimePicker").minDate(e.date);
						$scope.$apply(function () {
							$scope.search.date.to = $('#dateto').val();
							$scope.search.date.from = $('#datefrom').val();
						});
					});
					$("#dateto").on("dp.change", function (e) {
						$('#datefrom').data("DateTimePicker").maxDate(e.date);
						$scope.$apply(function () {
							$scope.search.date.to = $('#dateto').val();
							$scope.search.date.from = $('#datefrom').val();
						});
					});
					$("#dateday").on("dp.change", function (e) {
						$scope.$apply(function () {
							$scope.search.date.day = $('#dateday').val();
						});
					});
				}, 500);
			}
			$timeout(function () {
				$scope.multiBusiness('business-select');
			}, 500)
		}
	}

	$scope.exportAll = function ($event) {
		if ($event) $event.preventDefault();
		MyLoading.show($scope.translate('LOADING') + '...');
		Ordering.orders.csv({
			mode: 'dashboard',
			orderBy: 'id'
		}, function (res) {
			MyLoading.hide();
			MyAlert.show(res.result);
		});
	}

	$scope.exportFiltered = function ($event) {
		if ($event) $event.preventDefault();
		MyLoading.show($scope.translate('LOADING') + '...');
		var where = $scope.generateWhere().where;
		var where_status = $scope.generateWhere().where_status;
		var status = [
			{
				attribute: 'status',
				value: where_status ? where_status.value : [0, 1, 2, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]
			}
		];
		Ordering.orders.csv({
			mode: 'dashboard',
			where: where.concat(status),
			orderBy: 'id'
		}, function (res) {
			MyLoading.hide();
			MyAlert.show(res.result);
		});
	}
	$scope.showDrivers = function (drivers, bounds) {
		for (var i = 0; i < drivers.length; i++) {
			if (drivers[i].enabled && drivers[i].location && drivers[i].available) {
				var infowindow = new google.maps.InfoWindow();
				var allGroups = [];
				var driver = new MarkerWithLabel({
					position: drivers[i].location,
					draggable: false,
					raiseOnDrag: false,
					map: map,
					labelContent: '<div>' + drivers[i].id + '</div>',
					labelAnchor: new google.maps.Point(19, 45),
					labelClass: "pin driver" + ((!drivers[i].available) ? " invactive" : " active") + (($scope.drivers[i].id <= 1000) ? " small" : " large"), // the CSS class for the label
					labelStyle: { opacity: 1 }
				});
				driver.driver_id = drivers[i].id;
				driver.name = $scope.drivers[i].name;
				driver.drivergroup = $scope.drivers[i].drivergroups[0].name;
				for (var j = 0; j < $scope.drivers[i].drivergroups.length; j++) {
					allGroups.push($scope.drivers[i].drivergroups[j].name);
				}
				driver.last_order_at = $scope.drivers[i].last_order_assigned_at;
				driver.last_location_at = $scope.drivers[i].last_location_at;
				var markers_index = markers.push(driver) - 1;
				google.maps.event.addListener(markers[markers_index], 'mouseover', function () {
					var makecontent = '<div class="delivery-infowindow">'
					makecontent += '<strong>' + $scope.translate('NAME') + ': </strong> ' + this.name + '<br>'
					if (this.last_order_at) makecontent += '<strong>' + $scope.translate('LAST_ORDER_AT') + ': </strong> ' + this.last_order_at + '<br>';
					if (this.drivergroup) {
						makecontent += '<strong>' + $scope.translate('DRIVERGROUP') + ': </strong> ';
						for (var k = 0; k < allGroups.length; k++) {
							makecontent += allGroups[k];
							if (k + 1 < allGroups.length) makecontent += ', ';
							if ((k + 1) % 3 == 2) makecontent += '<br>';
						}
						if (allGroups.length % 3 != 2) makecontent += '<br>';
					}
					if (this.last_location_at) makecontent += '<strong>' + $scope.translate('LAST_LOCATION') + ': </strong> ' + this.last_location_at + '<br>'
					makecontent += '</div>';
					infowindow.setContent(makecontent);
					infowindow.open(map, this);
				});
				google.maps.event.addListener(markers[markers_index], 'mouseout', function () {
					infowindow.close(map, this);
				});
				bounds.extend(drivers[i].location);
			}
		}
	}
	$scope.ordersByDriver = function (tab, driver) {
		$scope.curTab = tab;
		$scope.curDriver = driver;
		$scope.search.driver = driver.id;
		var where = $scope.generateWhere().where;
		var where_status = $scope.generateWhere().where_status;
		$scope.loadings[$scope.curTab] = true;
		var status = [{
			attribute: 'status',
			value: where_status ? where_status.value : $scope.order_status.inactive_drivers
		}];
		Ordering.orders.all({
			mode: 'dashboard',
			orderBy: $scope.search.orderby,
			where: where.concat(status),
		}, function (res) {
			if (!res.error) {
				$scope.orders[$scope.curTab] = res.result;
				$scope.loadings[$scope.curTab] = false;
			}
		});
	}
	$scope.openMap = function (order) {
		// $location.search('id', order.id);
		$scope.startMap();
		var allGroups = [];
		if (directionsDisplay) directionsDisplay.setMap(null);
		for (var i = 0; i < markers.length; i++) {
			markers[i].setMap(null);
		}
		markers = [];
		var drivers = [];
		var drivers_ids = [];
		// for (var j = 0; j < $scope.users.length; j++) {
		// 	if (!$scope.users[j].enabled || !$scope.users[j].drivergroups || !$scope.users[j].location) continue;
		// 	for (var k = 0; k < $scope.users[j].drivergroups.length; k++) {
		// 		if (!$scope.users[j].drivergroups[k].enabled) continue;
		// 		for (var l = 0; l < $scope.users[j].drivergroups[k].business.length; l++) {
		// 			if ($scope.users[j].drivergroups[k].business[l].id == order.business_id) {
		// 				if (drivers_ids.indexOf($scope.users[j].id) > -1) continue;
		// 				drivers.push($scope.users[j]);
		// 				drivers_ids.push($scope.users[j].id);
		// 			}
		// 		}
		// 	}
		// }
		// $scope.filteredDrivers = drivers;
		Ordering.controls.order(order, function (res) {
			drivers = res.result.drivers
			drivers.forEach(function (driver) {
				drivers_ids.push(driver.id);
			})
			$scope.filteredDrivers = drivers;
			$scope.drivers = drivers
		})
		if (order.driver_id) order.driver_id = order.driver_id + '';
		order.status = order.status + '';
		$scope.curOrder = order;
		if (marker_customer) marker_customer.setMap(null);
		if (marker_business) marker_business.setMap(null);
		if (marker_driver) marker_driver.setMap(null);
		if (!order.customer.location) return MyAlert.show($scope.translate('ORDER_NO_LOCATION'));
		if (!order.business.location) return MyAlert.show($scope.translate('ORDER_NO_LOCATION'));
		if (typeof order.customer.location == 'string') order.customer.location = $scope.getJson(order.customer.location);
		if (typeof order.business.location == 'string') order.business.location = $scope.getJson(order.business.location);
		var bounds = new google.maps.LatLngBounds();
		bounds.extend(order.customer.location);
		bounds.extend(order.business.location);
		marker_customer = new MarkerWithLabel({
			position: order.customer.location,
			draggable: false,
			raiseOnDrag: false,
			map: map,
			labelContent: '<div><img src="' + $scope.rootTheme + '/img/profile.png" onerror="this.src=\'' + $scope.rootTheme + '/img/profile.png\'"></img></div>',
			labelAnchor: new google.maps.Point(19, 45),
			labelClass: "pin customer", // the CSS class for the label
			labelStyle: { opacity: 1 }
		});
		marker_business = new MarkerWithLabel({
			position: order.business.location,
			draggable: false,
			raiseOnDrag: false,
			map: map,
			labelContent: '<div><img src="' + $scope.optimizeImage(order.business.logo, 'h_100,c_limit') + '" onerror="this.src=\'/' + $scope.rootTheme + '/img/icon.png\'"></img></div>',
			labelAnchor: new google.maps.Point(19, 45),
			labelClass: "pin business", // the CSS class for the label
			labelStyle: { opacity: 1 }
		});
		if (order.driver_id) {
			if (order.driver && order.driver.location) {
				// for(var j=0; j < $scope.drivers[i].drivergroups.length; j++){
				// 	allGroups.push($scope.drivers[i].drivergroups[j].name);
				// }
				if (typeof order.driver.location == 'string') order.driver.location = $scope.getJson(order.driver.location);
				var infowindow = new google.maps.InfoWindow();
				marker_driver = new MarkerWithLabel({
					position: order.driver.location,
					draggable: false,
					raiseOnDrag: false,
					map: map,
					labelContent: '<div>' + order.driver.id + '</div>',
					labelAnchor: new google.maps.Point(19, 45),
					labelClass: "pin driver" + ((!order.driver.available) ? " invactive" : " active") + ((order.driver.id <= 1000) ? " small" : " large"), // the CSS class for the label
					labelStyle: { opacity: 1 }
				});
				marker_driver.driver_id = order.driver_id;
				marker_driver.name = order.driver.name;
				// marker_driver.drivergroup = order.driver.drivergroups[0].name;
				marker_driver.last_order_at = order.driver.last_order_assigned_at;
				marker_driver.last_location_at = order.driver.last_location_at;
				google.maps.event.addListener(marker_driver, 'mouseover', function () {
					var makecontent = '<div class="delivery-infowindow">'
					makecontent += '<strong>' + $scope.translate('NAME') + ': </strong> ' + this.name + '<br>'
					if (this.last_order_at) makecontent += '<strong>' + $scope.translate('LAST_ORDER_AT') + ': </strong> ' + this.last_order_at + '<br>';
					if (this.drivergroup) {
						makecontent += '<strong>' + $scope.translate('DRIVERGROUP') + ': </strong> ';
						for (var k = 0; k < allGroups.length; k++) {
							makecontent += allGroups[k];
							if (k + 1 < allGroups.length) makecontent += ', ';
							if ((k + 1) % 3 == 2) makecontent += '<br>';
						}
						if (allGroups.length % 3 != 2) makecontent += '<br>';
					}
					if (this.last_location_at) makecontent += '<strong>' + $scope.translate('LAST_LOCATION') + ': </strong> ' + this.last_location_at + '<br>'
					makecontent += '</div>';
					infowindow.setContent(makecontent);
					infowindow.open(map, this);
				});
				google.maps.event.addListener(marker_driver, 'mouseout', function () {
					infowindow.close(map, this);
				});
				bounds.extend(order.driver.location);
			}
			map.fitBounds(bounds);
		} else {
			$scope.showDrivers($scope.filteredDrivers, bounds);
			map.fitBounds(bounds);
		}
	}

	$scope.traceRoute = function (order) {
		MyLoading.show($scope.translate('LOADING') + '...');
		if (typeof order.customer.location == 'string') order.customer.location = $scope.getJson(order.customer.location);
		if (typeof order.business.location == 'string') order.business.location = $scope.getJson(order.business.location);
		if (typeof order.driver.location == 'string') order.driver.location = $scope.getJson(order.driver.location);
		var options = {
			origin: order.driver.location,
			destination: order.customer.location,
			travelMode: 'DRIVING'
		};
		if (!$scope.settings.autoassign_closest_to || $scope.settings.autoassign_closest_to.value != 'customer') {
			options.waypoints = [{ location: order.business.location }];
		}
		directionsService.route(options, function (response, status) {
			MyLoading.hide();
			if (status === 'OK') {
				directionsDisplay.setMap(map);
				directionsDisplay.setDirections(response);
			} else {
				MyAlert.show($scope.translate('CANT_TRACE_ROUTE'));
			}
		});
	}

	$scope.filterByStatus = function (status, $event) {
		if ($event) $event.preventDefault();
		if ($scope.curTab != status) {
			diselectAll();
		}
		$scope.curTab = status;
	}
	$scope.applyFilter = function () {
		if (!$scope.searchChanged) return;
		$scope.initOrders();
	}
	$scope.clearFilter = function () {
		$scope.search = {
			id: '',
			business: '',
			city: '',
			state: '',
			cemail: '',
			cphone: '',
			date: {
				from: '',
				to: '',
				day: '',
			},
			orderby: '-id',
			paymethod: '',
			driver: '',
			delivery_type: '',
			order_group_id: ''
		};
		$scope.businesses_text = $scope.translate('SELECT_BUSINESS')
		$scope.selected_businesses = [];
		$scope.initOrders();
	}

	$scope.changeStatus = function (order, status) {
		Ordering.orders.update({
			id: order.id,
			status: status
		}, function (res) {
			if (!res.error) {
				MyLoading.success($scope.translate('ORDER_STATE_CHANGED'), 1500);
			} else MyAlert.show(res.result);
		});
	}
	$scope.changePriority = function (order, priority) {
		if (!priority) {
			return;
		}
		Ordering.orders.update({
			id: order.id,
			priority: parseInt(priority)
		}, function (res) {
			if (!res.error) {
				order.priority = priority + '';
				MyLoading.success($scope.translate('SAVED'), 1500);
			} else MyAlert.show(res.result);
		});
	}
	$scope.changeDriverCompany = function (order, driver_company_id) {
		var _driver_company_id = '';
		if (driver_company_id != -1) {
			_driver_company_id = driver_company_id * 1;
		}
		Ordering.orders.update({
			id: order.id,
			driver_company_id: _driver_company_id
		}, function (res) {
			if (!res.error) {
				order.driver_company_id = driver_company_id + '';
				MyLoading.success($scope.translate('SAVED'), 1500);
			} else {
				MyAlert.show(res.result);
			}
		}, null, false, true);
	}
	$scope.toReview = {
		title: $scope.translate('QUALIFICATION'),
		review: 0,
		selected: 0,
		comment: '',
	}

	$scope.paintStars = function (category, index) {
		$scope.toReview.selected = index + 1;
	}
	$scope.chooseReview = function (category, index) {
		$scope.toReview.review = index + 1;
	}
	$scope.rangeReview = function () {
		var range = [];
		for (var i = 0; i < 5; i++) {
			range.push(i + 1);
		}
		return range;
	}
	$scope.sendReview = function (order, review) {
		MyLoading.show($scope.translate('MOBILE_FRONT_LOAD_LOADING'));
		Ordering.user_reviews.add({
			order_id: order.id,
			qualification: review.review,
			user_id: order.customer_id,
			comment: review.comment,
		}, function (res) {
			MyLoading.hide();
			if (!res.error) {
				MyAlert.show($scope.translate('REVIEW_THANK_YOU_MESSAGE'));
				order.user_review = res.result;
			} else MyAlert.show(res.result);
		});
	}
	$scope.changeDriver = function (order, driver_id) {

		var _driver_id = '';
		if (driver_id != -1) {
			_driver_id = driver_id * 1;
		}

		MyLoading.toast($scope.translate('LOADING') + '...');
		Ordering.orders.update({
			id: order.id,
			driver_id: _driver_id
		}, function (res) {
			MyLoading.hide();
			if (!res.error) {
				order.driver_id = _driver_id + '';
				MyLoading.success($scope.translate('ORDER_DRIVER_ASSIGNED'), 1500);
			} else MyAlert.show(res.result);
		}, null, false, true);
	}
	$scope.openOrder = function (order, tab) {
		$location.search({ id: order.id, tab: tab });
		$scope.toReview.selected = order.user_review != null ? order.user_review.qualification + 1 : 0;
		$scope.toReview.review = 0;
		$scope.toReview.comment = order.user_review != null ? order.user_review.comment : '';
	}
	$scope.newField = {
		value_type: VALUE_TYPE.TEXT,
		key: '',
		value: ''
	};
	$scope.value_regx = '';
	$scope.buffVal = '';
	$scope.tmpVal = '';
	$scope.valueTypes = Object.values(VALUE_TYPE);
	$scope.jsonEditor = null;
	$scope.onChangeType = function () {
		if ($scope.newField.value_type == VALUE_TYPE.INTEGER) {
			$scope.value_regx = /-?[0-9]+$/;
		} else if ($scope.newField.value_type == VALUE_TYPE.DECIMAL) {
			$scope.value_regx = /\d*\.?\d*$/;
		} else {
			$scope.value_regx = '';
		}
		if ($scope.newField.value_type == VALUE_TYPE.BOOLEAN) $scope.newField.value = '0';
		else $scope.newField.value = '';
		$scope.newField.key = '';
		$scope.buffVal = '';

		if ($scope.newField.value_type == VALUE_TYPE.JSON) {
			setTimeout(function () {
				$scope.jsonEditor = $scope.initJsonEditor('custom_editor');
				$scope.value = $scope.jsonEditor.get();
			}, 200);
		}
	}

	$scope.isBoolVal = function (type) {
		if (type == VALUE_TYPE.BOOLEAN) return true;
		else return false;
	}

	$scope.isJsonVal = function (type) {
		if (type == VALUE_TYPE.JSON) return true;
		else return false;
	}

	$scope.inpType = function (type) {
		if (type == VALUE_TYPE.TEXT) return 'text';
		else return 'number';
	}

	$scope.isValid = function (value) {
		if ($scope.newField.value_type == VALUE_TYPE.TEXT) return;

		console.log($scope.newField.value)
		if (value == '') $scope.buffVal = '';
		if (value == undefined) {
			// if ($scope.buffVal == '') {
			$scope.newField.value = $scope.buffVal;
			return;
			// }
			// $scope.newField.value = $scope.newField.value.substring(0, value.length - 1);
		} else {
			if (Number.isNaN(parseInt(value))) {
				$scope.newField.value = $scope.buffVal;
			} if (Number.isNaN(parseFloat(value))) {
				$scope.newField.value = $scope.buffVal;
			} else {
				if ($scope.newField.value_type == VALUE_TYPE.INTEGER) {
					$scope.buffVal = parseInt(value);
				} else if ($scope.newField.value_type == VALUE_TYPE.DECIMAL) {
					$scope.buffVal = '' + parseFloat(value);
					if ($scope.buffVal.length < value.length) {
						if (!$scope.buffVal.includes('.') && value.slice(value.length - 1) == '.')
							$scope.newField.value = $scope.buffVal = value;
						else $scope.newField.value = $scope.buffVal;
					}
				} else {
					$scope.buffVal = value;
					$scope.newField.value = $scope.buffVal;
				}
			}
		}
	}
	$scope.getEnterEvent = function (e) {
		if (e.charCode == 13) {
			$scope.order_details.scope.addOrderCustom();
		}
	}
	$scope.isValidating = function (type) {
		if (type == 'key') {
			if ($scope.newField.key) {
				$scope.newField.key = $scope.newField.key.replace(/\s/g, '');
			}
		}
	}
	$scope.resetFields = function () {
		$scope.newField.key = '';
		$scope.newField.value = '';
		$scope.newField.value_type = VALUE_TYPE.TEXT;
	}
	$scope.initJsonEditor = function (id_string, init_json) {
		var container = document.getElementById(id_string);
		var options = {
			"mode": "tree",
			"search": false,
			"indentation": 2
		};
		var editor = new JSONEditor(container, options, init_json);

		return editor;
	}
	$scope.openDetails = function (order, tab) {
		if ($scope.modalOpening) return;
		$scope.modalOpening = true;
		order.order_group_id = order.order_group_id ? order.order_group_id + '' : '';
		MyLoading.toast($scope.translate('LOADING') + '...');
		var drivers = [];
		var drivers_ids = [];
		// for (var j = 0; j < $scope.users.length; j++) {
		// 	if (!$scope.users[j].enabled || !$scope.users[j].drivergroups) continue;
		// 	for (var k = 0; k < $scope.users[j].drivergroups.length; k++) {
		// 		if (!$scope.users[j].drivergroups[k].enabled) continue;
		// 		for (var l = 0; l < $scope.users[j].drivergroups[k].business.length; l++) {
		// 			if ($scope.users[j].drivergroups[k].business[l].id == order.business_id) {
		// 				if (drivers_ids.indexOf($scope.users[j].id) > -1) continue;
		// 				drivers.push($scope.users[j]);
		// 				drivers_ids.push($scope.users[j].id);
		// 			}
		// 		}
		// 	}
		// }
		// $scope.filteredDrivers = drivers;
		Ordering.controls.order(order, function (res) {
			drivers = res.result.drivers
			drivers.forEach(function (driver) {
				drivers_ids.push(driver.id);
			})
			$scope.filteredDrivers = drivers;
			$scope.drivers = drivers
		})

		$scope.charge = null;
		if (order.driver_id) order.driver_id = order.driver_id.toString();
		if (order.status) order.status = order.status.toString();
		if (order.priority || order.priority === 0) order.priority = order.priority.toString();
		$scope.curOrder = order;
		MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/orders/order-details.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (order_details) {
			order.status = order.status.toString()
			MyLoading.hide();
			modals.push(order_details);
			$scope.order_details = order_details;
			$scope.order_details.show();
			$scope.modalOpening = false;
			order_details.scope.order = order;
			order_details.scope.user = gUser.getData();
			order_details.scope.tab = 0;

			$scope.resetFields();
			$scope.order_details.scope.getOrderCustoms = function () {
				MyLoading.toast($scope.translate('LOADING') + '...');
				$scope.newField['order_id'] = order.id;
				Ordering.orders.custom_fields.get($scope.newField, function (res) {
					MyLoading.hide();
					if (!res.error) {
						order_details.scope.order['metafields'] = res.result;
					} else MyAlert.show(res.result);
				});
			}
			$scope.order_details.scope.addOrderCustom = function () {
				if ($scope.newField.value_type == VALUE_TYPE.JSON)
					$scope.newField.value = JSON.stringify($scope.jsonEditor.get());
				MyLoading.toast($scope.translate('LOADING') + '...');
				$scope.newField['order_id'] = order.id;
				Ordering.orders.custom_fields.add($scope.newField, function (res) {
					MyLoading.hide();
					$scope.resetFields();
					if (!res.error) {
						order_details.scope.order.metafields.push(res.result);
						MyLoading.success($scope.translate('ORDERS_UPDATED'), 1500);
					} else MyAlert.show(res.result);
				});
			}
			$scope.order_details.scope.removeOrderCustom = function (item) {
				MyLoading.toast($scope.translate('LOADING') + '...');
				$scope.newField['order_id'] = order.id;
				$scope.newField['id'] = item.id;
				Ordering.orders.custom_fields.delete($scope.newField, function (res) {
					MyLoading.hide();
					if (!res.error) {
						for (var i = 0; i < order_details.scope.order.metafields.length; i++) {
							if (order_details.scope.order.metafields[i].id == item.id) {
								order_details.scope.order.metafields.splice(i, 1);
								break;
							}
						}
						MyLoading.success($scope.translate('CUSTOM_FIELD_ITEM_DELETED'), 1500);
					} else MyAlert.show(res.result);
				});
			}

			$scope.order_details.scope.getOrderCustoms();

			order_details.scope.message = {
				comment: '',
				canSee: {
					customer: true,
					driver: order_details.scope.order ? true : false,
					administrator: true,
					business: true
				},
				type: 2,
				file: null
			};
			order_details.scope.messages = [];
			sockets['messageOrdersManager'] = io(SOCKET_URL, {
				extraHeaders: {
					Authorization: "Bearer " + localStorageApp.getItem(STORE.TOKEN),
				},
				query: "token=" + localStorageApp.getItem(STORE.TOKEN) + "&project=" + API_PROJECT_NAME,
				transports: ['websocket']
			});
			sockets['messageOrdersManager'].on('connect', function () {
				var message_orders = API_PROJECT_NAME + '_messages_orders_' + order.id + '_' + order_details.scope.user.level;
				var orders_logs = API_PROJECT_NAME + '_orders_logs_' + order.id;
				sockets['messageOrdersManager'].emit('join', message_orders);
				sockets['messageOrdersManager'].emit('join', orders_logs);

				sockets['messageOrdersManager'].on('log', function (log) {
					if (!order.logs || order.logs.length == 0) {
						order.logs = [];
						order.logs.push(log);
					} else {
						var found = false;
						for (var i = 0; i < order.logs.length; i++) {
							var _log = order.logs[i];
							if (_log.id == log.id) {
								found = true;
								break;
							}
						}

						if (!found) {
							order.logs.push(log);
						}
					}
				});

				sockets['messageOrdersManager'].on('message', function (message) {
					var messages = order_details.scope.messages.filter(function (filter) {
						return filter.id == message.id;
					});
					if (messages.length == 0) {
						if (message.type > 1) {
							message.direction = message.author_id == gUser.getData().id ? 'to' : 'from';
						} else {
							message.direction = 'general';
							if (message.type == 0) {
								message.comment = $scope.translate('ORDER_PLACED_FOR_VIA').replace('_for_', '<b>' + $scope.parseDate(order.delivery_datetime) + '</b>').replace('_via_', '<b>' + $scope.translate(message.app_id ? message.app_id.toUpperCase() : 'OTHER') + '</b>');
								if (order_details.scope.user.level == 0 || order_details.scope.user.level == 2) {
									message.comment += '<br>-';
									message.comment += '<br>' + $scope.translate('AUTHOR') + ': ' + message.author.name + (message.author.lastname ? ' ' + message.author.lastname : '');
									message.comment += '<br>' + $scope.translate('USER_AGENT') + ': ' + message.user_agent;
									if (message.location) message.comment += '<br><strong>' + $scope.translate('LOCATION') + ':</strong> <img src="' + $scope.getStaticMapByLocation(message.location, '250x100') + '" />';
									message.comment += '<br>' + $scope.translate('IP') + ': ' + message.ip;
								}
							} else if (message.change.attribute == 'distance') {
								message.comment = $scope.translate('THE_DRIVER_IS_CLOSE') + ' <b>(' + message.driver.name + (message.driver.lastname ? ' ' + message.driver.lastname : '') + ')</b>';
							} else if (message.change.attribute == 'status') {
								if (message.change.new == 8 && message.change.estimated) {
									var estimated_delivery = message.change.estimated;
									message.comment = $scope.translate('ORDER_ATTRIBUTE_CHANGED_FROM_TO').replace('_attribute_', '<b>' + $scope.translate(message.change.attribute.toUpperCase()).toLowerCase() + '</b>').replace('_from_', '<b>' + $scope.getOrderState(message.change.old * 1) + '</b>').replace('_to_', '<b>' + $scope.getOrderState(message.change.new * 1) + '</b>') + '<br>' + $scope.translate('ESTIMATED_DELIVERY_TIME').replace('_min_', estimated_delivery);
								} else if (message.change.new == 7 && message.change.estimated) {
									var estimated_preparation = message.change.estimated;
									message.comment = $scope.translate('ORDER_ATTRIBUTE_CHANGED_FROM_TO').replace('_attribute_', '<b>' + $scope.translate(message.change.attribute.toUpperCase()).toLowerCase() + '</b>').replace('_from_', '<b>' + $scope.getOrderState(message.change.old * 1) + '</b>').replace('_to_', '<b>' + $scope.getOrderState(message.change.new * 1) + '</b>') + '<br>' + $scope.translate('ESTIMATED_PREPARATION_TIME').replace('_min_', estimated_preparation);
								} else if ([2, 5, 6, 10, 12].indexOf(message.change.new) != -1 && message.change.comment) {
									message.comment = $scope.translate('ORDER_ATTRIBUTE_CHANGED_FROM_TO').replace('_attribute_', '<b>' + $scope.translate(message.change.attribute.toUpperCase()).toLowerCase() + '</b>').replace('_from_', '<b>' + $scope.getOrderState(message.change.old * 1) + '</b>').replace('_to_', '<b>' + $scope.getOrderState(message.change.new * 1) + '</b>');
									message.comment += "<br>'" + message.change.comment + "'.";
								} else {
									message.comment = $scope.translate('ORDER_ATTRIBUTE_CHANGED_FROM_TO').replace('_attribute_', '<b>' + $scope.translate(message.change.attribute.toUpperCase()).toLowerCase() + '</b>').replace('_from_', '<b>' + $scope.getOrderState(message.change.old * 1) + '</b>').replace('_to_', '<b>' + $scope.getOrderState(message.change.new * 1) + '</b>');
								}
								if (order_details.scope.user.level == 0 || order_details.scope.user.level == 2) {
									message.comment += '<br>-';
									message.comment += '<br><strong>' + $scope.translate('AUTHOR') + ':</strong> ' + ((message.author) ? (message.author.name + (message.author.lastname ? ' ' + message.author.lastname : '')) : $scope.translate('GUEST_USER'));
									message.comment += '<br><strong>' + $scope.translate('USER_AGENT') + ':</strong> ' + message.user_agent;
									if (message.location) message.comment += '<br><strong>' + $scope.translate('LOCATION') + ':</strong> <img src="' + $scope.getStaticMapByLocation(message.location, '250x100') + '" />';
									message.comment += '<br><strong>' + $scope.translate('IP') + ':</strong> ' + message.ip;
								}
							} else if (message.change.attribute == 'driver_id') {
								if (message.driver) {
									message.comment = $scope.translate('DRIVER_ASSIGNED_AS_DRIVER').replace('_driver_', '<b>' + message.driver.name + ' ' + (message.driver.lastname ? message.driver.lastname : '') + '</b>');
								} else {
									message.comment = $scope.translate('DRIVER_UNASSIGNED');
								}
							} else if (message.change.attribute != 'comment') {
								message.comment = $scope.translate('ORDER_ATTRIBUTE_CHANGED_FROM_TO').replace('_attribute_', '<b>' + $scope.translate(message.change.attribute.toUpperCase()).toLowerCase() + '</b>').replace('_from_', '<b>' + message.change.old + '</b>').replace('_to_', '<b>' + message.change.new + '</b>');
							} else return;
						}
						order_details.scope.messages.push(message);
						if (order_details.scope.tab == 1) order_details.scope.readMessages();
					}
				});
			});
			order_details.$el.on('click', function (e) {
				if (order_details.backdropClickToClose && e.target === order_details.el) {
					order_details.hide();
					order_details.remove();
					$location.search('id', null);
					if (sockets['messageOrdersManager']) {
						sockets['messageOrdersManager'].close();
						delete sockets['messageOrdersManager'];
					}
				}
			});
			Ordering.orders.messages.all({
				order_id: order.id,
				mode: 'dashboard'
			}, function (res) {
				var messages = [];
				if (res.result.length == 0 || res.result[0].type != 0) {
					var message = {
						type: 0,
						direction: 'general',
						comment: $scope.translate('ORDER_PLACED_FOR_VIA').replace('_for_', '<b>' + $scope.parseDate(order.delivery_datetime) + '</b>').replace('_via_', '<b>' + $scope.translate(order.app_id ? order.app_id.toUpperCase() : 'OTHER') + '</b>'),
						created_at: order.created_at
					};
					messages.push(message);
				}
				for (var i = 0; i < res.result.length; i++) {
					var message = res.result[i];
					if (message.type > 1) {
						message.direction = message.author_id == gUser.getData().id ? 'to' : 'from';
					} else {
						message.direction = 'general';
						if (message.type == 0) {
							message.comment = $scope.translate('ORDER_PLACED_FOR_VIA').replace('_for_', '<b>' + $scope.parseDate(order.delivery_datetime) + '</b>').replace('_via_', '<b>' + $scope.translate(message.app_id ? message.app_id.toUpperCase() : 'OTHER') + '</b>');
							if (order_details.scope.user.level == 0 || order_details.scope.user.level == 2) {
								message.comment += '<br>-';
								if (message.app_id) message.comment += '<br><strong>' + $scope.translate('APP_ID') + ':</strong> ' + message.app_id;
								message.comment += '<br><strong>' + $scope.translate('AUTHOR') + ':</strong> ' + ((message.author) ? (message.author.name + (message.author.lastname ? ' ' + message.author.lastname : '')) : $scope.translate('GUEST_USER'));
								if (message.user_agent) message.comment += '<br><strong>' + $scope.translate('USER_AGENT') + ':</strong> ' + message.user_agent;
								if (message.location) message.comment += '<br><strong>' + $scope.translate('LOCATION') + ':</strong> <img src="' + $scope.getStaticMapByLocation(message.location, '250x100') + '" />';
								message.comment += '<br><strong>' + $scope.translate('IP') + ':</strong> ' + message.ip;
							}
						} else if (message.change.attribute == 'distance') {
							message.comment = $scope.translate('THE_DRIVER_IS_CLOSE') + ' <b>(' + message.driver.name + (message.driver.lastname ? ' ' + message.driver.lastname : '') + ')</b>';
						} else if (message.change.attribute == 'status') {
							if (message.change.new == 8 && message.change.estimated) {
								var estimated_delivery = message.change.estimated;
								message.comment = $scope.translate('ORDER_ATTRIBUTE_CHANGED_FROM_TO').replace('_attribute_', '<b>' + $scope.translate(message.change.attribute.toUpperCase()).toLowerCase() + '</b>').replace('_from_', '<b>' + $scope.getOrderState(message.change.old * 1) + '</b>').replace('_to_', '<b>' + $scope.getOrderState(message.change.new * 1) + '</b>') + '<br>' + $scope.translate('ESTIMATED_DELIVERY_TIME').replace('_min_', estimated_delivery);
							} else if (message.change.new == 7 && message.change.estimated) {
								var estimated_preparation = message.change.estimated;
								message.comment = $scope.translate('ORDER_ATTRIBUTE_CHANGED_FROM_TO').replace('_attribute_', '<b>' + $scope.translate(message.change.attribute.toUpperCase()).toLowerCase() + '</b>').replace('_from_', '<b>' + $scope.getOrderState(message.change.old * 1) + '</b>').replace('_to_', '<b>' + $scope.getOrderState(message.change.new * 1) + '</b>') + '<br>' + $scope.translate('ESTIMATED_PREPARATION_TIME').replace('_min_', estimated_preparation);
							} else if ([2, 5, 6, 10, 12].indexOf(message.change.new) != -1 && message.change.comment) {
								message.comment = $scope.translate('ORDER_ATTRIBUTE_CHANGED_FROM_TO').replace('_attribute_', '<b>' + $scope.translate(message.change.attribute.toUpperCase()).toLowerCase() + '</b>').replace('_from_', '<b>' + $scope.getOrderState(message.change.old * 1) + '</b>').replace('_to_', '<b>' + $scope.getOrderState(message.change.new * 1) + '</b>');
								message.comment += "<br>'" + message.change.comment + "'.";
							} else {
								message.comment = $scope.translate('ORDER_ATTRIBUTE_CHANGED_FROM_TO').replace('_attribute_', '<b>' + $scope.translate(message.change.attribute.toUpperCase()).toLowerCase() + '</b>').replace('_from_', '<b>' + $scope.getOrderState(message.change.old * 1) + '</b>').replace('_to_', '<b>' + $scope.getOrderState(message.change.new * 1) + '</b>');
							}
							if (order_details.scope.user.level == 0 || order_details.scope.user.level == 2) {
								message.comment += '<br>-';
								if (message.app_id) message.comment += '<br><strong>' + $scope.translate('APP_ID') + ':</strong> ' + message.app_id;
								message.comment += '<br><strong>' + $scope.translate('AUTHOR') + ':</strong> ' + ((message.author) ? (message.author.name + (message.author.lastname ? ' ' + message.author.lastname : '')) : $scope.translate('GUEST_USER'));
								if (message.user_agent) message.comment += '<br><strong>' + $scope.translate('USER_AGENT') + ':</strong> ' + message.user_agent;
								if (message.location) message.comment += '<br><strong>' + $scope.translate('LOCATION') + ':</strong> <img src="' + $scope.getStaticMapByLocation(message.location, '250x100') + '" />';
								message.comment += '<br><strong>' + $scope.translate('IP') + ':</strong> ' + message.ip;
							}
						} else if (message.change.attribute == 'driver_id') {
							if (message.driver) {
								message.comment = $scope.translate('DRIVER_ASSIGNED_AS_DRIVER').replace('_driver_', '<b>' + message.driver.name + ' ' + (message.driver.lastname ? message.driver.lastname : '') + '</b>');
							} else {
								message.comment = $scope.translate('DRIVER_UNASSIGNED');
							}
						} else if (message.change.attribute != 'comment') {
							if (message.change.old) {
								message.comment = $scope.translate('ORDER_ATTRIBUTE_CHANGED_FROM_TO').replace('_attribute_', '<b>' + $scope.translate(message.change.attribute.toUpperCase()).toLowerCase() + '</b>').replace('_from_', '<b>' + message.change.old + '</b>').replace('_to_', '<b>' + message.change.new + '</b>');
							} else {
								message.comment = $scope.translate('ORDER_ATTRIBUTE_CHANGED_TO').replace('_attribute_', '<b>' + $scope.translate(message.change.attribute.toUpperCase()).toLowerCase() + '</b>').replace('_to_', '<b>' + message.change.new + '</b>');
							}
						} else continue;
					}
					messages.push(message);
				}
				order_details.scope.messages = messages;
				if (order_details.scope.tab == 1) order_details.scope.readMessages();
			});
			order_details.scope.readMessages = function () {
				if (order_details.scope.messages.length > 0 && order.unread_count > 0) {
					Ordering.orders.messages.read({
						order_id: order.id,
						order_message_id: order_details.scope.messages[order_details.scope.messages.length - 1].id,
					}, function (res) {
						order.unread_count = 0;
					});
				}
			}
			order_details.scope.changeTab = function (tab) {
				order_details.scope.tab = tab;
				if (tab == 1) {
					order_details.scope.readMessages();
					setTimeout(function () {
						var elements = $('.chat').siblings(':visible');
						var content = $('.chat').parents('ion-content');
						var height = 0;
						for (var i = 0; i < elements.length; i++) {
							var element = elements[i];
							height += $(element).outerHeight(true);
						}
						var h = content.height() - height;
						$('.chat').height(h);
						if (lastScrollHeight) $('.messages').scrollTop(lastScrollHeight);
					}, 20);
				} else if (tab == 2) {
					Ordering.orders.logs.all({
						order_id: $scope.curOrder.id
					}, function (res) {
						if (!res.error) {
							order.logs = res.result;
						} else {
							MyAlert.show(res.result);
						}
					});
				}
			}
			var lastScrollHeight = 0;
			var checkScrollHeight = setInterval(function () {
				if ($('.messages').length == 0) return;
				if ($('.messages')[0].scrollHeight != lastScrollHeight) {
					lastScrollHeight = $('.messages')[0].scrollHeight;
					$('.messages').scrollTop(lastScrollHeight);
				}
			}, 100);
			intervals.push(checkScrollHeight);

			order_details.scope.openChooseFile = function () {
				$rootScope.getImageFile('chat_image', function (base64) {
					if (base64) {
						order_details.scope.message.file = base64;
						order_details.scope.message.type = 3;
					} else {
						order_details.scope.message.file = null;
						order_details.scope.message.type = 2;
					}
				});
			}

			order_details.scope.clearFile = function () {
				order_details.scope.message.file = null;
				order_details.scope.message.type = 2;
				$('#chat_image').val('');
			}

			order_details.scope.sendMessage = function () {
				if (!order_details.scope.message.comment && order_details.scope.message.type == 2) return;
				if (!order_details.scope.message.file && order_details.scope.message.type == 3) return;
				var can_see = [];
				if (order_details.scope.message.canSee.administrator) can_see.push(0);
				if (order_details.scope.message.canSee.business) can_see.push(2);
				if (order_details.scope.message.canSee.customer) can_see.push(3);
				if (order_details.scope.message.canSee.driver) can_see.push(4);
				MyLoading.show($scope.translate('LOADING') + '...');
				Ordering.orders.messages.add({
					order_id: order.id,
					type: order_details.scope.message.type,
					comment: order_details.scope.message.comment ? order_details.scope.message.comment : null,
					file: order_details.scope.message.file ? order_details.scope.message.file : null,
					can_see: can_see.join(',')
				}, function (res) {
					MyLoading.hide();
					if (!res.error) {
						var _message = order_details.scope.messages.find(function (__message) {
							return res.result.id === __message.id
						})
						if (!_message) {
							res.result.direction = res.result.author_id == gUser.getData().id ? 'to' : 'from';
							order_details.scope.messages.push(res.result);
						}
						order_details.scope.message.type = 2;
						order_details.scope.message.comment = '';
						order_details.scope.message.file = null;
						$('#chat_image').val('');
					} else MyAlert.show(res.result);
				});
			}
			order_details.scope.hide = function () {
				if ($scope.order_details) {
					$scope.order_details.hide();
					$scope.order_details.remove();
				}
				if (sockets['messageOrdersManager']) {
					sockets['messageOrdersManager'].close();
					delete sockets['messageOrdersManager'];
				}
				$location.search('id', null);
			}
			if (tab && tab != 0) order_details.scope.changeTab(tab);
		});
	}
	$scope.selectedOrders = [];
	$scope.allSelected = {};
	function getSelectedCant(orders) {
		return orders.reduce(function (last, order) {
			if (order.selected) return last + 1;
			else return last
		}, 0)
	}

	$scope.parseLog = function (log) {
		var driverEvents = [
			'logistic_driver_found',
			'logistic_driver_found_group',
			'logistic_driver_not_found',
			'logistic_driver_not_found_group',
			'logistic_driver_found_in_coverage',
			'logistic_driver_found_in_coverage_group',
			'logistic_driver_found_out_coverage',
			'logistic_driver_found_out_coverage_group',
			'logistic_driver_autoaccepted',
			'logistic_driver_autoaccepted_group',
			'logistic_request_autorejected',
			'logistic_request_autorejected_group',
			'logistic_assign_request_accepted',
			'logistic_assign_request_accepted_group',
			'logistic_assign_request_rejected',
			'logistic_assign_request_rejected_group',
			'logistic_manual_driver_assignment',
			'logistic_manual_driver_unassignment',
			'logistic_driver_autoassigned_group'
		];
		var generalEvents = [
			'logistic_started',
			'logistic_finished',
			'logistic_expired',
			'logistic_resolved',
			'logistic_reset',
			'logistic_grouped',
			'logistic_cancelled',
			'logistic_not_grouped',
			'logistic_order_queued',
			'logistic_order_out_queued',
			'logistic_driver_company_not_found'
		];

		function parseLogData(eventName, data) {
			var message = $scope.translate('LOG_' + eventName.toUpperCase());
			for (var key in data) {
				var replaceBy = data[key];
				if (key === 'distance' || key === 'coverage') {
					replaceBy = $scope.parseDistance($scope.unitConvert(data[key], 'm', 'auto'));
				} else if (key === 'with_orders') {
					replaceBy = data[key].join(', ')
					key = 'orders'
				} else if (key === 'status') {
					replaceBy = $scope.getOrderState(data[key])
				}

				message = message.replace('_' + key + '_', replaceBy)
			}
			return message;
		}

		var logData = log.data ? log.data : {};

		if (driverEvents.indexOf(log.event) !== -1 || log.driver_id) {
			if (log.driver) {
				logData.driver = log.driver.name + (log.driver.lastname ? log.driver.lastname : '')
			}
			return parseLogData(log.event, logData)
		} else if (log.driver_company_id || log.external_driver_id) {
			if (log.driver_company) {
				logData.driver_company = log.driver_company.name
			}
			if (log.external_driver) {
				logData.external_driver = log.external_driver.name
			}
			return parseLogData(log.event, logData)
		} else if (generalEvents.indexOf(log.event) !== -1) {
			return parseLogData(log.event, logData)
		}
		return $scope.translate(log.event.toUpperCase()) + '<br />' + JSON.stringify(log.data);
	}

	$scope.selectOrder = function (order, event) {
		event.stopPropagation();
		var exist = $scope.selectedOrders.indexOf(order.id) != -1;
		if (order.selected) {
			if (!exist) $scope.selectedOrders.push(order.id);
		} else {
			if (exist) $scope.selectedOrders.splice($scope.selectedOrders.indexOf(order.id), 1)
		}
		if (getSelectedCant($scope.ordersOnPage) == $scope.ordersOnPage.length && !$scope.allSelected[$scope._pagination.current]) $scope.allSelected[$scope._pagination.current] = true;
		if (getSelectedCant($scope.ordersOnPage) != $scope.ordersOnPage.length && $scope.allSelected[$scope._pagination.current]) $scope.allSelected[$scope._pagination.current] = false;
	};
	$scope.selectAll = function (allSelected) {
		if (allSelected) {
			$scope.ordersOnPage.forEach(function (order) {
				if ($scope.selectedOrders.indexOf(order.id) == -1) $scope.selectedOrders.push(order.id)
				order.selected = true;
			})
		} else {
			$scope.ordersOnPage.forEach(function (order) {
				if ($scope.selectedOrders.indexOf(order.id) != -1) $scope.selectedOrders.splice($scope.selectedOrders.indexOf(order.id), 1)
				order.selected = false
			})
		}
	}
	$scope.deleteOrders = function (cb) {
		if ($scope.selectedOrders.length == 0) return cb();
		var curOrder = $scope.selectedOrders.shift();
		Ordering.orders.delete({
			id: curOrder
		}, function (res) {
			if (!res.error) {
				var index = $scope.orders[$scope.curTab].findIndex(function (order) {
					return order.id == curOrder
				})
				if (index > -1) $scope.orders[$scope.curTab].splice(index, 1)
				MyLoading.toast(($scope.totalDelete - $scope.selectedOrders.length) + '/' + $scope.totalDelete)
				refreshTotals()
			} else {
				console.log(res.error)
			}
			$scope.counters[$scope.curTab]--;
			$scope.deleteOrders(cb);
		})
	}
	function updateOrders(status, cb) {
		if ($scope.selectedOrders.length == 0) return cb();
		var curOrder = $scope.selectedOrders.shift();
		Ordering.orders.update({
			id: curOrder,
			status: status
		}, function (res) {
			if (!res.error) {
				// var index = $scope.orders[$scope.curTab].findIndex(function(order){
				// 	return order.id == curOrder
				// })
				// if (index > -1) $scope.orders[$scope.curTab][index].status = status
				moveOrder(res.result)
				MyLoading.toast(($scope.totalUpdate - $scope.selectedOrders.length) + '/' + $scope.totalUpdate)
				refreshTotals();
			} else {
				console.log(res, result)
			}
			updateOrders(status, cb);
		})
	}
	function diselectAll() {
		$scope.allSelected = {};
		$scope.selectedOrders = []
		$scope.orders[$scope.curTab].forEach(function (order) {
			order.selected = false;
		})
	}
	function moveOrder(data) {
		data.selected = false;
		var found = false;
		for (var key in $scope.orders) {
			if (found) break;
			var status_orders = $scope.orders[key];
			for (var i = 0; i < status_orders.length; i++) {
				if (found) break;
				var order = status_orders[i];
				if (order.id == data.id) {
					Object.assign(order, data);
					status_orders.splice(i, 1);
					$scope.counters[key]--;
					if ($scope.order_status.pending.indexOf(data.status * 1) != -1) {
						$scope.orders.pending.push(order);
						$scope.counters.pending++;
					} else if ($scope.order_status.in_progress.indexOf(data.status * 1) != -1) {
						$scope.orders.in_progress.push(order);
						$scope.counters.in_progress++;
					} else if ($scope.order_status.completed.indexOf(data.status * 1) != -1) {
						$scope.orders.completed.push(order);
						$scope.counters.completed++;
					} else if ($scope.order_status.cancelled.indexOf(data.status * 1) != -1) {
						$scope.orders.cancelled.push(order);
						$scope.counters.cancelled++;
					}
					found = true;
					break;
				}
			}
		}
	}
	$scope.changeOrdersStatus = function (status) {
		$scope.selectedOrders.sort(function (a, b) { return b - a });
		$scope.totalUpdate = JSON.parse(JSON.stringify($scope.selectedOrders)).length;
		MyLoading.toast(($scope.totalUpdate - $scope.selectedOrders.length) + '/' + $scope.totalUpdate);
		updateOrders(status, function () {
			MyLoading.toast(($scope.totalUpdate - $scope.selectedOrders.length) + '/' + $scope.totalUpdate)
			setTimeout(function () {
				MyLoading.hide();
				MyLoading.success($scope.translate('ORDERS_UPDATED'), 500);
				diselectAll();
			}, 500)
		})
	}
	$scope.afterConfirmDelete = function () {
		$scope.selectedOrders.sort(function (a, b) { return b - a });
		$scope.totalDelete = JSON.parse(JSON.stringify($scope.selectedOrders)).length
		MyLoading.toast(($scope.totalDelete - $scope.selectedOrders.length) + '/' + $scope.totalDelete)
		$scope.deleteOrders(function () {
			MyLoading.toast(($scope.totalDelete - $scope.selectedOrders.length) + '/' + $scope.totalDelete)
			setTimeout(function () {
				MyLoading.hide();
				MyLoading.success($scope.translate('ORDERS_DELETED'), 500)
			}, 500)
		})
	}
	$scope.orderConfirmDelete = function () {
		MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/check-password.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (password_modal) {
			modals.push(password_modal);
			password_modal.show();
			password_modal.scope.checkPassword = function (password) {
				Ordering.users.password({
					password: password
				}, function (res) {
					if (!res.error) {
						password_modal.hide()
						$scope.afterConfirmDelete()
					}
					else MyAlert.show(res.result)
				})
			}
		})
	}
	$scope.refund = function (order) {
		if (!ADDONS.stripe_refund) return;
		MyAlert.confirm($scope.translate('QUESTION_REFUND_ORDER')).then(function (res) {
			MyLoading.show($scope.translate('LOADING') + '...');
			Ordering.payments.refund({
				order_id: order.id,
				business_id: order.business_id,
				gateway: order.paymethod.gateway
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					order.refund_data = res.result;
					MyLoading.success($scope.translate('ORDER_REFUNDED'), 1500);
				} else MyAlert.show(res.result);
			});
		});
	}

	// Order groups
	$scope.order_groups = [];
	$scope.order_group_colors = {};
	var where_order_groups = [
		{
			attribute: 'status',
			value: [0, 1]
		}
	];
	Ordering.order_groups.all({
		where: where_order_groups
	}, function (res) {
		if (!res.error) {
			$scope.order_groups = res.result.map(function (order_group) {
				var color = getRandomColor();
				$scope.order_group_colors['ORDER_GROUP_' + order_group.id] = color;
				order_group.color = color;
				return order_group;
			});
		} else {
			MyAlert.show(res.result);
		}
	});

	$scope.onGroup = function (order_group_id) {
		if (!order_group_id || $scope.search.order_group_id == order_group_id) {
			$scope.search.order_group_id = '';
		} else {
			$scope.search.order_group_id = order_group_id;
		}
		$scope.applyFilter();
	}

	// $scope.getOrderGroupByBusiness = function (business_id, order_group_id) {
	// 	var found = false;
	// 	var order_groups = $scope.order_groups.filter(function (order_group) {
	// 		if (order_group.id == order_group_id) {
	// 			found = true;
	// 		}
	// 		return order_group.status == 1 && order_group.driver_group.businesses_ids.indexOf(business_id) >= 0;
	// 	});
	// 	if (!found && order_group_id) {
	// 		order_groups.unshift({
	// 			id: order_group_id
	// 		});
	// 	}
	// 	console.log(clone(order_groups), $scope.order_groups);
	// 	return order_groups;
	// }

	$scope.changeOrderGroup = function (order, order_group_id) {
		var _order_group_id = '';
		if (order_group_id != -1) {
			_order_group_id = order_group_id * 1;
		}

		MyLoading.show($scope.translate('LOADING') + '...');
		Ordering.orders.update({
			id: order.id,
			order_group_id: _order_group_id
		}, function (res) {
			MyLoading.hide();
			if (!res.error) {
				res.result.status = res.result.status === null ? '' : res.result.status + '';
				res.result.driver_id = res.result.driver_id === null ? '' : res.result.driver_id + '';
				res.result.order_group_id = res.result.order_group_id === null ? '' : res.result.order_group_id + '';
				Object.assign(order, res.result);
			} else {
				MyAlert.show(res.result);
			}
		}, null, false, true);
	}
	// End order groups

	$scope.multiBusiness = function (element_id, cb) {
		if ($scope.selected_businesses.length == 0) {
			$scope.businesses_text = $scope.translate('SELECT_BUSINESS')
		}
		var select = document.getElementById(element_id);
		var options = document.getElementById(element_id + "-options");
		var backdrop = document.getElementById(element_id + "-backdrop");
		var hovered = false;
		if (select) {
			select.onclick = function (e) {
				e.stopPropagation()
				var parent = select.parentElement;
				var parent_styles = window.getComputedStyle(parent);
				if (!options && !backdrop) {
					var body = document.getElementsByTagName("BODY")[0];
					backdrop = document.createElement('div');
					backdrop.id = element_id + "-backdrop";
					options = document.createElement('div');
					backdrop.classList.add('custom-multiselect-backdrop');
					options.id = element_id + "-options";
					options.classList.add('custom-multiselect');
					if (parent_styles.position != 'relative') parent.style.position = 'relative';
					parent.appendChild(options);
					body.appendChild(backdrop);
					backdrop.onclick = function (e) {
						e.stopPropagation()
						options.remove();
						options = null;
						backdrop.remove();
						backdrop = null;
					}
					options.onmouseover = function () {
						hovered = true;
					}
					options.onmouseleave = function () {
						hovered = false;
					}
				}
				//add business items
				$scope.business.forEach(function (buss) {
					var item_inner = document.createElement('div');
					item_inner.classList.add('inner');
					var label = document.createElement('label');
					label.setAttribute("for", 'business-' + buss.id);
					label.style.width = '100%';
					label.classList.add('custom-checkbox');
					var checkbox = document.createElement('input');
					checkbox.id = 'business-' + buss.id;
					checkbox.setAttribute("type", "checkbox");
					checkbox.dataset.business = JSON.stringify(buss);
					if ($scope.selected_businesses.indexOf(buss.id) != -1) {
						checkbox.checked = true;
					}
					var checkmark = document.createElement('span');
					checkmark.classList.add('checkmark');
					var name = document.createElement('span');
					name.innerText = buss.name;
					name.style.position = 'static';
					name.style.paddingLeft = '20px';
					label.appendChild(checkbox);
					label.appendChild(checkmark);
					label.appendChild(name);
					options.appendChild(label);
					checkbox.onchange = function (e) {
						if (this.checked) {
							$scope.selected_businesses.push(JSON.parse(this.dataset.business).id);
						} else {
							var index = $scope.selected_businesses.indexOf(JSON.parse(this.dataset.business).id)
							if (index > -1) $scope.selected_businesses.splice(index, 1)
						}
						if ($scope.selected_businesses.length == 0) {
							$scope.businesses_text = $scope.translate('SELECT_BUSINESS')
						} else {
							var text_filter = $scope.business.filter(function (buss_fil) {
								return $scope.selected_businesses.indexOf(buss_fil.id) != -1;
							});
							$scope.businesses_text = text_filter.map(function (buss_text) {
								return buss_text.name
							}).join(', ')
						}
					}
				})
			}
		}
	}

	$scope.getTimeTag = function (delivery_datetime) {
		var order_moment = moment.utc(delivery_datetime);
		var diffDays = order_moment.diff(moment.utc(), 'days', true);
		var sign = diffDays >= 0 ? '+ ' : '-';
		var days = Math.trunc(diffDays)
		var hours = Math.trunc((diffDays - days) * 24)
		var minutes = Math.trunc((((diffDays - days) * 24) - hours) * 60)
		var text = Math.abs(minutes) + ' ' + $scope.translate('MINUTES', 'minutes').toLowerCase()
		if (Math.abs(hours) > 0 || Math.abs(days) > 0) {
			text = Math.abs(hours) + ' ' + $scope.translate('HOURS', 'Hours').toLowerCase() + ' ' + text
			if (Math.abs(days) > 0) {
				text = Math.abs(days) + ' ' + $scope.translate('DAYS', 'Days').toLowerCase() + ' ' + text
			}
		}
		text = sign + text
		return { colors: { background: '#777', text: '#FFF' }, text: text }
	}

	$scope.getTypeTag = function (type) {
		type = parseInt(type);
		switch (type) {
			case 1:
				return { colors: { background: '#ff9031', text: '#FFF' }, text: $scope.translate('DELIVERY') }
			case 2:
				return { colors: { background: '#1dc54d', text: '#FFF' }, text: $scope.translate('PICKUP') }
			case 3:
				return { colors: { background: '#9D6E4C', text: '#FFF' }, text: $scope.translate('EATIN') }
			case 4:
				return { colors: { background: '#495780', text: '#FFF' }, text: $scope.translate('CURBSIDE') }
			case 5:
				return { colors: { background: '#875D97', text: '#FFF' }, text: $scope.translate('DRIVETHRU') }

			default:
				return { colors: { background: '#777', text: '#FFF' }, text: $scope.translate('UNKNOWN') }
		}
	}

	$scope.getLogisticTag = function (status) {
		status = parseInt(status);
		switch (status) {
			case 0:
				return { colors: { background: '#ff9031', text: '#FFF' }, text: $scope.translate('PENDING') }
			case 1:
				return { colors: { background: '#E8E733', text: '#333' }, text: $scope.translate('IN_PROGRESS') }
			case 2:
				return { colors: { background: '#006C7D', text: '#FFF' }, text: $scope.translate('IN_QUEUE') }
			case 3:
				return { colors: { background: '#E83333', text: '#FFF' }, text: $scope.translate('EXPIRED') }
			case 4:
				return { colors: { background: '#04B366', text: '#FFF' }, text: $scope.translate('RESOLVED') }

			default:
				return { colors: { background: '#777', text: '#FFF' }, text: $scope.translate('UNKNOWN') }
		}
	}

	$scope.getPriorityTag = function (priority) {
		priority = parseInt(priority);
		switch (priority) {
			case -1:
				return { colors: { background: '#0070E1', text: '#FFF' }, text: $scope.translate('LOW') }
			case 0:
				return { colors: { background: '#E9DD4B', text: '#333' }, text: $scope.translate('NORMAL') }
			case 1:
				return { colors: { background: '#F68B40', text: '#FFF' }, text: $scope.translate('HIGH') }
			case 2:
				return { colors: { background: '#EE3542', text: '#FFF' }, text: $scope.translate('URGENT') }

			default:
				return { colors: { background: '#777', text: '#FFF' }, text: $scope.translate('UNKNOWN') }
		}
	}

	$scope.getLogisticInformation = function (order_id) {
		MyLoading.show($scope.translate('LOADING') + '...');
		Ordering.logistic.orders.information({
			id: order_id
		}, function (res) {
			MyLoading.hide();
			if (!res.error) {
				MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/orders/order-logistic-information.html', {
					scope: $scope,
					animation: 'slide-in-up'
				}).then(function (order_logistic_information) {
					modals.push(order_logistic_information);
					order_logistic_information.scope.logistic_information = res.result;
					order_logistic_information.show().then(function () {
					});
				});
			} else {
				MyAlert.show(res.result);
			}
		});
	}

	$(document).ready(function () {
		/***Show Bottom Help***/
		$('[data-toggle="popover"]').popover({ html: true });
		/***Position bottom ButtomHelp***/
		$('#buttonFixed').css({
			'bottom': $('.footer').height() + 15 + 'px',
		});
	});
	Extensions.runAction('enter_orders_editor_view', null, $scope);
});

_controllers.controller('ordersEditorCtrl', function ($scope, $rootScope, $timeout, $interval, $location, $state, MyModal, MyToast, MyAlert, Ordering, MyLoading, gUser/*newordersEditorCtrl*/) {
	if (!$scope.editorAvilable || (!ADDONS.delivery_dashboard && $state.current.name == "main.deliveries")) {
		// MyLoading.hide();
		return $state.go(app_states.homeScreen);
	}
	$scope.$on('$locationChangeStart', function (event, current, old) {
		for (var i = 0; i < $scope.orders.length; i++) {
			if ($scope.orders[i].id == $location.search().id) {
				if (ADDONS.delivery_dashboard && $state.current.name == "main.deliveries") $scope.openMap($scope.orders[i]);
				else $scope.openDetails($scope.orders[i]);
				break;
			}
		}
	})
	$scope.notifications = [];
	var socket = io(SOCKET_URL, {
		extraHeaders: {
			Authorization: "Bearer " + localStorageApp.getItem(STORE.TOKEN),
		},
		query: "token=" + localStorageApp.getItem(STORE.TOKEN) + "&project=" + API_PROJECT_NAME,
		transports: ['websocket']
	});
	if (sockets['ordersEditorCtrl']) sockets['ordersEditorCtrl'].disconnect();
	sockets['ordersEditorCtrl'] = socket;
	socket.on('connect', function () {
		var orders_room = API_PROJECT_NAME + '_orders' + (gUser.getData().level == 0 ? '' : '_' + gUser.getData().id);
		var drivers_room = API_PROJECT_NAME + '_drivers';
		var message_orders = API_PROJECT_NAME + '_messages_orders' + (gUser.getData().level == 0 ? '' : '_' + gUser.getData().id);
		socket.emit('join', orders_room);
		socket.emit('join', drivers_room);
		socket.emit('join', message_orders);
		socket.on('orders_register', function (order) {
			var valid = true;
			for (var i = 0; i < $scope.orders.length; i++) {
				if ($scope.orders[i].id == order.id) {
					valid = false;
					break;
				}
			}
			if (valid) {
				$scope.$apply(function () {
					var _date = order.delivery_datetime.split(' ');
					_date = new Date(_date[0].split('-')[0], _date[0].split('-')[1] - 1, _date[0].split('-')[2], _date[1].split(':')[0], _date[1].split(':')[1], 0, 0);
					order.delivery_datetime_date = _date;
					order.unread_count = 0;
					$scope.orders.push(order);
					$scope.applyFilters();
					playNotificationSound(order.id);
					MyAlert.show($scope.translate('ORDER_N_ORDERED').replace('_order_id_', order.id)).then(function () {
						stopNotificationSound(order.id);
					});
				});

			}
		});

		socket.on('update_order', function (data) {
			$scope.$apply(function () {
				for (var i = 0; i < $scope.orders.length; i++) {
					if ($scope.orders[i].id == data.id) {
						data.status = data.status + '';
						data.driver_id = data.driver_id + '';
						if (data.driver_id == 'null') data.driver_id = '';
						Object.assign($scope.orders[i], data);
						break;
					}
				}
				$scope.applyFilters();
			});
		});

		socket.on('drivers_update', function (data) {
			$scope.$apply(function () {
				for (var i = 0; i < $scope.drivers.length; i++) {
					if ($scope.drivers[i].id == data.id) {
						Object.assign($scope.drivers[i], data);
						break;
					}
				}
				for (var i = 0; i < $scope.users.length; i++) {
					if ($scope.users[i].id == data.id) {
						Object.assign($scope.users[i], data);
						break;
					}
				}
			});
		});

		socket.on('tracking_driver', function (data) {
			$scope.$apply(function () {
				for (var i = 0; i < $scope.drivers.length; i++) {
					if ($scope.drivers[i].id == data.driver_id) {
						$scope.drivers[i].location = data.location;
						break;
					}
				}
				for (var i = 0; i < markers.length; i++) {
					if (markers[i].driver_id == data.driver_id) {
						markers[i].setPosition(data.location);
					}
				}
				if (marker_driver && marker_driver.driver_id == data.driver_id) {
					marker_driver.setPosition(data.location);
				}
			});
		});

		socket.on('message', function (message) {
			$scope.orders.forEach(function (order) {
				if (order.id == message.order_id) {
					$scope.$apply(function () {
						order.unread_count++;
						MyToast.add($scope.translate('NEW_MESSAGE_ORDER').replace('_order_', order.id), { timeout: 3000 }).then(function () {
							closeModals();
							$scope.openDetails(order, 1);
						});
					});
				}
			});
		});
	});

	function playNotificationSound(id) {

		var interval = $interval(function () {
			var notification = document.getElementById("notification-sound");
			notification.play();
		}, 2500);
		var notification = {
			interval: interval,
			id: id,
		};
		$scope.notifications.push(notification);
	}

	function stopNotificationSound(id) {
		for (var i = 0; i < $scope.notifications.length; i++) {
			if ($scope.notifications[i].id == id) {
				$interval.cancel($scope.notifications[i].interval);
			}
		}
	}
	var today = new Date();
	$scope.search = {
		id: '',
		business: '',
		city: '',
		state: '',
		cemail: '',
		cphone: '',
		date: {
			from: '',
			to: '',
			day: ''
		},
		orderby: '-id',
		paymethod: '',
		driver: '',
		delivery_type: '',
		order_group_id: ''
	};
	$scope.orders = [];
	$scope.filtered = [];
	$scope.business = [];
	$scope.paymethods = [];
	$scope.o_business = {};
	$scope.cities = [];
	$scope.curTab = 'pending';
	$scope.filterTotal = 0;
	$scope.pagination = {
		current: 1,
		pages: 0,
		items: '10',
		itemsPerPage: [10, 20, 30, 50]
	};
	$scope.show_filters = false;
	$scope.curOrder = null;
	$scope.curDriver = null;
	$scope.delivery_mode = ADDONS.delivery_dashboard && $state.current.name == "main.deliveries";
	$scope.drivers = [];
	$scope.drivers_filter = [];
	var map = null;
	var directionsService = null;
	var directionsDisplay = null;
	var marker_customer = null;
	var marker_business = null;
	var marker_driver = null;
	var markers = [];
	// $scope.ADDONS = ADDONS;
	$scope.nextPage = function () {
		if ($scope.pagination.current < $scope.pagination.pages) $scope.pagination.current++;
	}
	$scope.backPage = function () {
		if ($scope.pagination.current > 0) $scope.pagination.current--;
	}
	$scope.getLanguage(function (err, list, dictionary) {
		$rootScope.pageTitle = $scope.translate($scope.delivery_mode ? 'DELIVERY_DASHBOARD' : 'ORDER_MANAGER');
		$scope.status = [
			{ id: "0", value: $scope.translate('ORDER_STATUS_PENDING'), tab: 'pending' },
			{ id: "1", value: $scope.translate('ORDERS_COMPLETED'), tab: 'completed' },
			{ id: "2", value: $scope.translate('ORDER_REJECTED'), tab: 'cancelled' },
			{ id: "3", value: $scope.translate('ORDER_STATUS_IN_BUSINESS'), tab: 'in_progress' },
			{ id: "4", value: $scope.translate('ORDER_READY'), tab: 'in_progress' },
			{ id: "5", value: $scope.translate('ORDER_REJECTED_RESTAURANT'), tab: 'cancelled' },
			{ id: "6", value: $scope.translate('ORDER_STATUS_CANCELLEDBYDRIVER'), tab: 'cancelled' },
			{ id: "7", value: $scope.translate('ORDER_STATUS_ACCEPTEDBYRESTAURANT'), tab: 'in_progress' },
			{ id: "8", value: $scope.translate('ORDER_CONFIRMED_ACCEPTED_BY_DRIVER'), tab: 'in_progress' },
			{ id: "9", value: $scope.translate('ORDER_PICKUP_COMPLETED_BY_DRIVER'), tab: 'in_progress' },
			{ id: "10", value: $scope.translate('ORDER_PICKUP_FAILED_BY_DRIVER'), tab: 'cancelled' },
			{ id: "11", value: $scope.translate('ORDER_DELIVERY_COMPLETED_BY_DRIVER'), tab: 'completed' },
			{ id: "12", value: $scope.translate('ORDER_DELIVERY_FAILED_BY_DRIVER'), tab: 'cancelled' },
			{ id: "13", value: $scope.translate('PREORDER'), tab: 'pending' },
			{ id: "14", value: $scope.translate('ORDER_NOT_READY'), tab: 'in_progress' },
			{ id: "15", value: $scope.translate('ORDER_PICKUP_COMPLETED_BY_CUSTOMER'), tab: 'completed' },
			{ id: "16", value: $scope.translate('ORDER_CANCELLED_BY_CUSTOMER'), tab: 'cancelled' },
			{ id: "17", value: $scope.translate('NOT_PICKED_BY_CUSTOMER'), tab: 'cancelled' },
			{ id: "18", value: $scope.translate('DRIVER_NEAR_BUSINESS'), tab: 'in_progress' },
			{ id: "19", value: $scope.translate('DRIVER_NEAR_CUSTOMER'), tab: 'in_progress' },
			{ id: "20", value: $scope.translate('CUSTOMER_NEAR_BUSINESS'), tab: 'in_progress' },
			{ id: "21", value: $scope.translate('CUSTOMER_ARRIVED_BUSINESS'), tab: 'in_progress' },
		];
		$scope.order_types = [
			{ name: $scope.translate('ORDER_BY_ORDER_NUMBER') + ' (' + $scope.translate('DESCENDING') + ')', value: '-id', order: true },
			{ name: $scope.translate('ORDER_BY_ORDER_NUMBER') + ' (' + $scope.translate('ASCENDING') + ')', value: 'id', order: false },
			{ name: $scope.translate('ORDER_BY_BUSINESS') + ' (' + $scope.translate('DESCENDING') + ')', value: '-business.name', order: true },
			{ name: $scope.translate('ORDER_BY_BUSINESS') + ' (' + $scope.translate('ASCENDING') + ')', value: 'business.name', order: false },
			{ name: $scope.translate('ORDER_BY_USER') + ' (' + $scope.translate('DESCENDING') + ')', value: '-customer.name', order: true },
			{ name: $scope.translate('ORDER_BY_USER') + ' (' + $scope.translate('ASCENDING') + ')', value: 'customer.name', order: false },
			{ name: $scope.translate('DELIVERY_TIME') + ' (' + $scope.translate('DESCENDING') + ')', value: '-delivery_datetime_date', order: true },
			{ name: $scope.translate('DELIVERY_TIME') + ' (' + $scope.translate('ASCENDING') + ')', value: 'delivery_datetime_date', order: false },
		];
		MyLoading.show();
		Ordering.orders.all({
			mode: 'dashboard',
			limit: 100,
			orderBy: '-id'
		}, function (res) {
			$scope.orders = res.result;
			$scope.filterByStatus($scope.curTab);
			var business_ids = [];
			var cities_ids = [];
			var drivers_ids = [];
			var paumethods_ids = [];
			var to_open = null;
			for (var i = 0; i < res.result.length; i++) {
				var _date = res.result[i].delivery_datetime.split(' ');
				_date = new Date(_date[0].split('-')[0], _date[0].split('-')[1] - 1, _date[0].split('-')[2], _date[1].split(':')[0], _date[1].split(':')[1], 0, 0);
				res.result[i].delivery_datetime_date = _date;
				if (res.result[i].business_id != null && business_ids.indexOf(res.result[i].business_id) == -1 && res.result[i].business) {
					business_ids.push(res.result[i].business_id);
					$scope.business.push({ id: res.result[i].business_id, name: res.result[i].business.name });
				}
				if (res.result[i].business && res.result[i].business.city_id && cities_ids.indexOf(res.result[i].business.city_id) == -1 && res.result[i].business) {
					cities_ids.push(res.result[i].business.city_id);
					$scope.cities.push({ id: res.result[i].business.city_id, name: res.result[i].business.city.name });
				}
				if (res.result[i].driver && drivers_ids.indexOf(res.result[i].driver.id) == -1) {
					drivers_ids.push(res.result[i].driver.id);
					$scope.drivers_filter.push({ id: res.result[i].driver.id, name: res.result[i].driver.name + (res.result[i].driver.lastname ? " " + res.result[i].driver.lastname : '') });
				}
				if (res.result[i].paymethod && paumethods_ids.indexOf(res.result[i].paymethod.id) == -1) {
					paumethods_ids.push(res.result[i].paymethod.id);
					$scope.paymethods.push({ id: res.result[i].paymethod.id, name: $scope.translate(res.result[i].paymethod.gateway.toUpperCase()) });
				}
				if ($scope.orders[i].id == $location.search().id) {
					to_open = $scope.orders[i];
				}
			}
			Ordering.orders.all({
				mode: 'dashboard',
				offset: 100,
				orderBy: '-id'
			}, function (res) {
				$scope.orders = $scope.orders.concat(res.result);
				$scope.filterByStatus($scope.curTab);
				for (var i = 0; i < res.result.length; i++) {
					var _date = res.result[i].delivery_datetime.split(' ');
					_date = new Date(_date[0].split('-')[0], _date[0].split('-')[1] - 1, _date[0].split('-')[2], _date[1].split(':')[0], _date[1].split(':')[1], 0, 0);
					res.result[i].delivery_datetime_date = _date;
					if (res.result[i].business_id != null && business_ids.indexOf(res.result[i].business_id) == -1 && res.result[i].business) {
						business_ids.push(res.result[i].business_id);
						$scope.business.push({ id: res.result[i].business_id, name: res.result[i].business.name });
					}
					if (res.result[i].business && res.result[i].business.city_id && cities_ids.indexOf(res.result[i].business.city_id) == -1 && res.result[i].business) {
						cities_ids.push(res.result[i].business.city_id);
						$scope.cities.push({ id: res.result[i].business.city_id, name: res.result[i].business.city.name });
					}
					if (res.result[i].driver && drivers_ids.indexOf(res.result[i].driver.id) == -1) {
						drivers_ids.push(res.result[i].driver.id);
						$scope.drivers_filter.push({ id: res.result[i].driver.id, name: res.result[i].driver.name + (res.result[i].driver.lastname ? " " + res.result[i].driver.lastname : '') });
					}
					if (res.result[i].paymethod && paumethods_ids.indexOf(res.result[i].paymethod.id) == -1) {
						paumethods_ids.push(res.result[i].paymethod.id);
						$scope.paymethods.push({ id: res.result[i].paymethod.id, name: $scope.translate(res.result[i].paymethod.gateway.toUpperCase()) });
					}
				}
				Ordering.users.all({
					params: 'name,lastname,address,location,level,enabled,available,driver_groups,assigned_orders_count,busy',
					where: { level: 4 }
				}, function (res) {
					MyLoading.hide();
					$scope.users = res.result;
					var drivers = [];
					var drivers_ids = [];
					for (var i = 0; i < $scope.business.length; i++) {
						for (var j = 0; j < $scope.users.length; j++) {
							if (!$scope.users[j].enabled || !$scope.users[j].drivergroups || !$scope.users[j].available) continue;
							for (var k = 0; k < $scope.users[j].drivergroups.length; k++) {
								if (!$scope.users[j].drivergroups[k].enabled) continue;
								for (var l = 0; l < $scope.users[j].drivergroups[k].business.length; l++) {
									if ($scope.users[j].drivergroups[k].business[l].id == $scope.business[i].id) {
										if (drivers_ids.indexOf($scope.users[j].id) > -1) continue;
										drivers.push($scope.users[j]);
										drivers_ids.push($scope.users[j].id);
									}
								}
							}
						}
					}
					$scope.drivers = drivers;
					if (to_open && !$scope.delivery_mode) $scope.openDetails(to_open);
					if ($scope.delivery_mode) {
						$scope.loadGoogleMaps(function () {
							map = new google.maps.Map(document.getElementById('order-map'), {
								center: { lat: -34.397, lng: 150.644 },
								zoom: 8,
								mapTypeControl: false,
								streetViewControl: false,
								rotateControl: false,
								fullscreenControl: false
							});
							directionsService = new google.maps.DirectionsService;
							directionsDisplay = new google.maps.DirectionsRenderer;
							directionsDisplay.setOptions({ suppressMarkers: true });
							directionsDisplay.setMap(map);
							var bounds = new google.maps.LatLngBounds();
							for (var i = 0; i < $scope.drivers.length; i++) {
								if ($scope.drivers[i].available && $scope.drivers[i].location) {
									var infowindow = new google.maps.InfoWindow();
									var driver = new MarkerWithLabel({
										position: $scope.drivers[i].location,
										draggable: false,
										raiseOnDrag: false,
										map: map,
										labelContent: '<div>' + $scope.drivers[i].id + '</div>',
										labelAnchor: new google.maps.Point(19, 45),
										labelClass: "pin driver" + ((!$scope.drivers[i].available) ? " invactive" : " active") + (($scope.drivers[i].id <= 1000) ? " small" : " large"), // the CSS class for the label
										labelStyle: { opacity: 1 }
									});
									driver.driver_id = $scope.drivers[i].id;
									driver.name = $scope.drivers[i].name;
									driver.drivergroup = $scope.drivers[i].drivergroups[0].name;
									driver.last_order_at = $scope.drivers[i].last_order_assigned_at;
									driver.last_location_at = $scope.drivers[i].last_location_at;
									markers.push(driver);
									google.maps.event.addListener(markers[i], 'mouseover', function () {
										var makecontent = '<div class="delivery-infowindow">'
										makecontent += '<strong>' + $scope.translate('NAME') + ': </strong> ' + this.name + '<br>'
										if (this.last_order_at) makecontent += '<strong>' + $scope.translate('LAST_ORDER_AT') + ': </strong> ' + this.last_order_at + '<br>';
										if (this.drivergroup) makecontent += '<strong>' + $scope.translate('DRIVERGROUP') + ': </strong> ' + this.drivergroup + '<br>'
										if (this.last_location_at) makecontent += '<strong>' + $scope.translate('LAST_LOCATION') + ': </strong> ' + this.last_location_at + '<br>'
										makecontent += '</div>';
										infowindow.setContent(makecontent);
										infowindow.open(map, this);
									});
									google.maps.event.addListener(markers[i], 'mouseout', function () {
										infowindow.close(map, this);
									});
									bounds.extend($scope.drivers[i].location);
								}
							}
							map.fitBounds(bounds);
							if (to_open && $scope.delivery_mode) $scope.openMap(to_open);
						}, true);
						if ($state.params.order && $state.params.order.replace('/', '') != '') {
							for (var i = 0; i < $scope.orders.length; i++) {
								if ($scope.orders[i].id == $state.params.order.replace('/', '')) {
									$scope.openMap($scope.orders[i]);
									break;
								}
							}
						}
					}
				});
				Extensions.runAction('after_orders_editor_view', $scope.orders, $scope);
			});
		});
	});

	$scope.toggleFilters = function ($event) {
		$event.preventDefault();
		$scope.show_filters = !$scope.show_filters;
		if ($scope.show_filters) {
			if (!$('#dateday').data("DateTimePicker")) {
				$timeout(function () {
					var dateday = $('#dateday').datetimepicker({
						format: 'YYYY-MM-DD',
					})
					dateday.on('dp.show', function () {
						$(".bootstrap-datetimepicker-widget").attr('data-tap-disabled', 'true');
					});
					var datefrom = $('#datefrom').datetimepicker({
						format: 'L',
					})
					datefrom.on('dp.show', function () {
						$(".bootstrap-datetimepicker-widget").attr('data-tap-disabled', 'true');
					});
					var dateto = $('#dateto').datetimepicker({
						useCurrent: false, //Important! See issue #1075
						format: 'L',
					});
					dateto.on('dp.show', function () {
						$(".bootstrap-datetimepicker-widget").attr('data-tap-disabled', 'true');
					});
					$("#datefrom").on("dp.change", function (e) {
						$('#dateto').data("DateTimePicker").minDate(e.date);
						$scope.$apply(function () {
							$scope.search.date.to = $('#dateto').val();
							$scope.search.date.from = $('#datefrom').val();
							$scope.applyFilters();
						});
					});
					$("#dateto").on("dp.change", function (e) {
						$('#datefrom').data("DateTimePicker").maxDate(e.date);
						$scope.$apply(function () {
							$scope.search.date.to = $('#dateto').val();
							$scope.search.date.from = $('#datefrom').val();
							$scope.applyFilters();
						});
					});
					$("#dateday").on("dp.change", function (e) {
						$scope.$apply(function () {
							$scope.search.date.day = $('#dateday').val();
						});
					});
				}, 500);
			}
		}
	}

	$scope.exportAll = function () {
		$scope.ordersToCsv($scope.orders, 'all_orders');
	}

	$scope.exportFiltered = function () {
		$scope.ordersToCsv($scope.filtered, 'filtered_orders');
	}

	$scope.showDrivers = function (drivers, bounds) {
		for (var i = 0; i < drivers.length; i++) {
			if (drivers[i].available && drivers[i].location) {
				var infowindow = new google.maps.InfoWindow();
				var driver = new MarkerWithLabel({
					position: drivers[i].location,
					draggable: false,
					raiseOnDrag: false,
					map: map,
					labelContent: '<div>' + drivers[i].id + '</div>',
					labelAnchor: new google.maps.Point(19, 45),
					labelClass: "pin driver" + ((!drivers[i].available) ? " invactive" : " active") + ((drivers[i].id <= 1000) ? " small" : " large"), // the CSS class for the label
					labelStyle: { opacity: 1 }
				});
				driver.driver_id = drivers[i].id;
				driver.name = $scope.drivers[i].name;
				driver.drivergroup = $scope.drivers[i].drivergroups[0].name;
				driver.last_order_at = $scope.drivers[i].last_order_assigned_at;
				driver.last_location_at = $scope.drivers[i].last_location_at;
				var markers_index = markers.push(driver) - 1;
				google.maps.event.addListener(markers[markers_index], 'mouseover', function () {
					var makecontent = '<div class="delivery-infowindow">'
					makecontent += '<strong>' + $scope.translate('NAME') + ': </strong> ' + this.name + '<br>'
					if (this.last_order_at) makecontent += '<strong>' + $scope.translate('LAST_ORDER_AT') + ': </strong> ' + this.last_order_at + '<br>';
					if (this.drivergroup) makecontent += '<strong>' + $scope.translate('DRIVERGROUP') + ': </strong> ' + this.drivergroup + '<br>'
					if (this.last_location_at) makecontent += '<strong>' + $scope.translate('LAST_LOCATION') + ': </strong> ' + this.last_location_at + '<br>'
					makecontent += '</div>';
					infowindow.setContent(makecontent);
					infowindow.open(map, this);
				});
				google.maps.event.addListener(markers[markers_index], 'mouseout', function () {
					infowindow.close(map, this);
				});
				bounds.extend(drivers[i].location);
			}
		}
	}
	$scope.ordersByDriver = function (tab, driver) {
		$scope.curTab = tab;
		$scope.curDriver = driver;
		var filtered = [];
		for (var i = 0; i < $scope.orders.length; i++) {
			if ($scope.orders[i].driver_id == driver.id) {
				filtered.push($scope.orders[i]);
			}
		}
		$scope.filtered = filtered;
	}
	$scope.openMap = function (order) {
		$location.search('id', order.id);
		if (directionsDisplay) directionsDisplay.setMap(null);
		for (var i = 0; i < markers.length; i++) {
			markers[i].setMap(null);
		}
		markers = [];
		var drivers = [];
		var drivers_ids = [];
		for (var j = 0; j < $scope.users.length; j++) {
			if (!$scope.users[j].enabled || !$scope.users[j].drivergroups) continue;
			for (var k = 0; k < $scope.users[j].drivergroups.length; k++) {
				if (!$scope.users[j].drivergroups[k].enabled) continue;
				for (var l = 0; l < $scope.users[j].drivergroups[k].business.length; l++) {
					if ($scope.users[j].drivergroups[k].business[l].id == order.business_id) {
						if (drivers_ids.indexOf($scope.users[j].id) > -1) continue;
						drivers.push($scope.users[j]);
						drivers_ids.push($scope.users[j].id);
					}
				}
			}
		}
		$scope.filteredDrivers = drivers;
		if (order.driver_id) order.driver_id = order.driver_id + '';
		order.status = order.status + '';
		$scope.curOrder = order;
		if (marker_customer) marker_customer.setMap(null);
		if (marker_business) marker_business.setMap(null);
		if (marker_driver) marker_driver.setMap(null);
		if (!order.customer.location) return MyAlert.show($scope.translate('ORDER_NO_LOCATION'));
		if (!order.business.location) return MyAlert.show($scope.translate('ORDER_NO_LOCATION'));
		if (typeof order.customer.location == 'string') order.customer.location = $scope.getJson(order.customer.location);
		if (typeof order.business.location == 'string') order.business.location = $scope.getJson(order.business.location);
		var bounds = new google.maps.LatLngBounds();
		bounds.extend(order.customer.location);
		bounds.extend(order.business.location);
		marker_customer = new MarkerWithLabel({
			position: order.customer.location,
			draggable: false,
			raiseOnDrag: false,
			map: map,
			labelContent: '<div><img src="' + $scope.rootTheme + '/img/profile.png" onerror="this.src=\'' + $scope.rootTheme + '/img/profile.png\'"></img></div>',
			labelAnchor: new google.maps.Point(19, 45),
			labelClass: "pin customer", // the CSS class for the label
			labelStyle: { opacity: 1 }
		});
		marker_business = new MarkerWithLabel({
			position: order.business.location,
			draggable: false,
			raiseOnDrag: false,
			map: map,
			labelContent: '<div><img src="' + $scope.optimizeImage(order.business.logo, 'h_100,c_limit') + '" onerror="this.src=\'/' + $scope.rootTheme + '/img/icon.png\'"></img></div>',
			labelAnchor: new google.maps.Point(19, 45),
			labelClass: "pin business", // the CSS class for the label
			labelStyle: { opacity: 1 }
		});
		if (order.driver_id) {
			if (order.driver.location) {
				if (typeof order.driver.location == 'string') order.driver.location = $scope.getJson(order.driver.location);
				var infowindow = new google.maps.InfoWindow();
				marker_driver = new MarkerWithLabel({
					position: order.driver.location,
					draggable: false,
					raiseOnDrag: false,
					map: map,
					labelContent: '<div>' + order.driver.id + '</div>',
					labelAnchor: new google.maps.Point(19, 45),
					labelClass: "pin driver" + ((!$scope.drivers[i].available) ? " invactive" : " active") + (($scope.drivers[i].id <= 1000) ? " small" : " large"), // the CSS class for the label

					// labelClass: "pin driver"+((!order.driver.available)?" invactive":" active"), // the CSS class for the label
					labelStyle: { opacity: 1 }
				});
				marker_driver.driver_id = order.driver_id;
				marker_driver.name = $scope.drivers[i].name;
				marker_driver.drivergroup = $scope.drivers[i].drivergroups[0].name;
				marker_driver.last_order_at = $scope.drivers[i].last_order_assigned_at;
				marker_driver.last_location_at = $scope.drivers[i].last_location_at;
				google.maps.event.addListener(marker_driver, 'mouseover', function () {
					var makecontent = '<div class="delivery-infowindow">'
					makecontent += '<strong>' + $scope.translate('NAME') + ': </strong> ' + this.name + '<br>'
					if (this.last_order_at) makecontent += '<strong>' + $scope.translate('LAST_ORDER_AT') + ': </strong> ' + this.last_order_at + '<br>';
					if (this.drivergroup) makecontent += '<strong>' + $scope.translate('DRIVERGROUP') + ': </strong> ' + this.drivergroup + '<br>'
					if (this.last_location_at) makecontent += '<strong>' + $scope.translate('LAST_LOCATION') + ': </strong> ' + this.last_location_at + '<br>'
					makecontent += '</div>';
					infowindow.setContent(makecontent);
					infowindow.open(map, this);
				});
				google.maps.event.addListener(marker_driver, 'mouseout', function () {
					infowindow.close(map, this);
				});
				bounds.extend(order.driver.location);
			}
			map.fitBounds(bounds);
		} else {
			$scope.showDrivers($scope.filteredDrivers, bounds);
			map.fitBounds(bounds);
		}
	}

	$scope.traceRoute = function (order) {
		/*if (order.driver_id) {
			if (order.driver.location) {*/
		MyLoading.show($scope.translate('LOADING') + '...');
		if (typeof order.customer.location == 'string') order.customer.location = $scope.getJson(order.customer.location);
		if (typeof order.business.location == 'string') order.business.location = $scope.getJson(order.business.location);
		if (typeof order.driver.location == 'string') order.driver.location = $scope.getJson(order.driver.location);
		var options = {
			origin: order.driver.location,
			destination: order.customer.location,
			travelMode: 'DRIVING'
		};
		if (!$scope.settings.autoassign_closest_to || $scope.settings.autoassign_closest_to.value != 'customer') {
			options.waypoints = [{ location: order.business.location }];
		}
		directionsService.route(options, function (response, status) {
			MyLoading.hide();
			if (status === 'OK') {
				directionsDisplay.setDirections(response);
			} else {
				MyAlert.show($scope.translate('CANT_TRACE_ROUTE'));
			}
		});
		/*} else MyAlert.show($scope.translate('CANT_TRACE_ROUTE'));
	} else MyAlert.show($scope.translate('CANT_TRACE_ROUTE'));*/
	}

	$scope.filterByStatus = function (status, $event) {
		if ($event) $event.preventDefault();
		$scope.curTab = status;
		var filtered = [];
		for (var i = 0; i < $scope.orders.length; i++) {
			if (status == 'pending' && $scope.orders[i].status == '0') filtered.push($scope.orders[i]);
			else if (status == 'completed' && ($scope.orders[i].status == '1' || $scope.orders[i].status == '11')) filtered.push($scope.orders[i]);
			else if (status == 'cancelled' && ($scope.orders[i].status == '2' || $scope.orders[i].status == '5' || $scope.orders[i].status == '6' || $scope.orders[i].status == '10' || $scope.orders[i].status == '12')) filtered.push($scope.orders[i]);
			else if (status == 'inprogress' && ($scope.orders[i].status == '7' || $scope.orders[i].status == '8' || $scope.orders[i].status == '9')) {
				filtered.push($scope.orders[i]);
			}
		}
		$scope.pagination.current = 1;
		$scope.pagination.pages = Math.ceil(filtered.length / $scope.pagination.items);
		$scope.filtered = filtered;
		$scope.calcTotal();
	}
	$scope.applyFilters = function () {
		$scope.filterByStatus($scope.curTab);
		var filter = [];
		if ($scope.search.date.from != '' || $scope.search.date.to != '') {
			var fdate = new Date($scope.search.date.from + ' 00:00:00');
			var tdate = new Date($scope.search.date.to + ' 23:59:59');
		}
		for (var i = 0; i < $scope.filtered.length; i++) {
			var valid = true;
			if ($scope.search.id != '' && $scope.filtered[i].id.toString().indexOf($scope.search.id) == -1) valid = false;
			if ($scope.search.state != '' && $scope.filtered[i].status != $scope.search.state) valid = false;
			if ($scope.search.business != '' && $scope.filtered[i].business_id != $scope.search.business) valid = false;
			if ($scope.search.cphone != '' && ($scope.filtered[i].customer.cellphone == null || $scope.filtered[i].customer.cellphone.indexOf($scope.search.cphone) == -1)) valid = false;
			if ($scope.search.email != undefined && $scope.search.email != '' && $scope.filtered[i].customer.email.indexOf($scope.search.email) == -1) valid = false;
			if ($scope.search.date.from != '' || $scope.search.date.to != '') {
				var odate = new Date($scope.filtered[i].delivery_datetime);
				if (($scope.search.date.from != '' && fdate >= odate) || ($scope.search.date.to != '' && tdate <= odate)) valid = false;
			}
			if ($scope.search.city != '' && $scope.search.city != $scope.filtered[i].business.city_id) valid = false;
			if ($scope.search.paymethod != '' && $scope.search.paymethod != $scope.filtered[i].paymethod_id) valid = false;
			if ($scope.search.driver != '' && $scope.search.driver != $scope.filtered[i].driver_id) valid = false;
			if ($scope.search.delivery_type != '' && $scope.search.delivery_type != $scope.filtered[i].delivery_type) valid = false;
			if (valid) filter.push($scope.filtered[i]);
		}
		$scope.filtered = filter;
		$scope.calcTotal();
	}
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
	$scope.calcTotal = function () {
		var total = 0;
		for (var i = 0; i < $scope.filtered.length; i++) {
			total += $rootScope.Order.getTotal($scope.filtered[i]);
		}
		$scope.filterTotal = total;
	}
	$scope.clearFilters = function () {
		$scope.search = {
			id: '',
			business: '',
			city: '',
			state: '',
			cemail: '',
			cphone: '',
			date: {
				from: '',
				to: ''
			}
		};
		$scope.filterByStatus($scope.curTab);
	}
	$scope.changeStatus = function (order, status) {
		Ordering.orders.update({
			id: order.id,
			status: status
		}, function (res) {
			if (!res.error) {
				$scope.applyFilters();
				MyLoading.success($scope.translate('ORDER_STATE_CHANGED'), 1500);
			} else MyAlert.show(res.result);
		});
	}
	$scope.changeDriver = function (order, driver) {
		MyLoading.toast($scope.translate('LOADING') + '...');
		Ordering.orders.update({
			id: order.id,
			driver_id: driver
		}, function (res) {
			MyLoading.hide();
			if (!res.error) {
				order.driver_id = driver;
				MyLoading.success($scope.translate('ORDER_DRIVER_ASSIGNED'), 1500);
			} else MyAlert.show(res.result);
		});
	}
	$scope.openDetails = function (order, tab) {
		$location.search('id', order.id);
		if ($scope.modalOpening) return;
		$scope.modalOpening = true;
		MyLoading.toast($scope.translate('LOADING') + '...');
		var drivers = [];
		var drivers_ids = [];
		for (var j = 0; j < $scope.users.length; j++) {
			if (!$scope.users[j].enabled || !$scope.users[j].drivergroups) continue;
			for (var k = 0; k < $scope.users[j].drivergroups.length; k++) {
				if (!$scope.users[j].drivergroups[k].enabled) continue;
				for (var l = 0; l < $scope.users[j].drivergroups[k].business.length; l++) {
					if ($scope.users[j].drivergroups[k].business[l].id == order.business_id) {
						if (drivers_ids.indexOf($scope.users[j].id) > -1) continue;
						drivers.push($scope.users[j]);
						drivers_ids.push($scope.users[j].id);
					}
				}
			}
		}
		$scope.filteredDrivers = drivers;
		$scope.charge = null;
		if (order.driver_id) order.driver_id = order.driver_id.toString();
		if (order.status) order.status = order.status.toString();
		$scope.curOrder = order;
		MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/orders/order-details.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (order_details) {
			order.status = order.status.toString()
			MyLoading.hide();
			modals.push(order_details);
			$scope.order_details = order_details;
			$scope.order_details.show();
			$scope.modalOpening = false;
			order_details.scope.order = order;
			order_details.scope.user = gUser.getData();
			order_details.scope.tab = 0;
			order_details.scope.message = {
				comment: '',
				canSee: {
					customer: true,
					driver: order_details.scope.order ? true : false,
					administrator: true,
					business: true
				},
				type: 2,
				file: null
			};
			order_details.scope.messages = [];
			sockets['messageOrdersManager'] = io(SOCKET_URL, {
				extraHeaders: {
					Authorization: "Bearer " + localStorageApp.getItem(STORE.TOKEN),
				},
				query: "token=" + localStorageApp.getItem(STORE.TOKEN) + "&project=" + API_PROJECT_NAME,
				transports: ['websocket']
			});
			sockets['messageOrdersManager'].on('connect', function () {
				var message_orders = API_PROJECT_NAME + '_messages_orders_' + order.id + '_' + order_details.scope.user.level;
				sockets['messageOrdersManager'].emit('join', message_orders);
				sockets['messageOrdersManager'].on('message', function (message) {
					var messages = order_details.scope.messages.filter(function (filter) {
						return filter.id == message.id;
					});
					if (messages.length == 0) {
						if (message.type != 1) {
							message.direction = message.author_id == gUser.getData().id ? 'to' : 'from';
						} else {
							message.direction = 'general';
							if (message.change.attribute == 'distance') {
								message.comment = $scope.translate('THE_DRIVER_IS_CLOSE') + ' <b>(' + message.driver.name + (message.driver.lastname ? ' ' + message.driver.lastname : '') + ')</b>';
							} else if (message.change.attribute == 'status') {
								if (message.change.new == 8 && message.change.estimated) {
									var estimated_delivery = message.change.estimated;
									message.comment = $scope.translate('ORDER_ATTRIBUTE_CHANGED_FROM_TO').replace('_attribute_', '<b>' + $scope.translate(message.change.attribute.toUpperCase()).toLowerCase() + '</b>').replace('_from_', '<b>' + $scope.getOrderState(message.change.old * 1) + '</b>').replace('_to_', '<b>' + $scope.getOrderState(message.change.new * 1) + '</b>') + '<br>' + $scope.translate('ESTIMATED_DELIVERY_TIME').replace('_min_', estimated_delivery);
								} else if (message.change.new == 7 && message.change.estimated) {
									var estimated_preparation = message.change.estimated;
									message.comment = $scope.translate('ORDER_ATTRIBUTE_CHANGED_FROM_TO').replace('_attribute_', '<b>' + $scope.translate(message.change.attribute.toUpperCase()).toLowerCase() + '</b>').replace('_from_', '<b>' + $scope.getOrderState(message.change.old * 1) + '</b>').replace('_to_', '<b>' + $scope.getOrderState(message.change.new * 1) + '</b>') + '<br>' + $scope.translate('ESTIMATED_PREPARATION_TIME').replace('_min_', estimated_preparation);
								} else if ([2, 5, 6, 10, 12].indexOf(message.change.new) != -1 && message.change.comment) {
									message.comment = $scope.translate('ORDER_ATTRIBUTE_CHANGED_FROM_TO').replace('_attribute_', '<b>' + $scope.translate(message.change.attribute.toUpperCase()).toLowerCase() + '</b>').replace('_from_', '<b>' + $scope.getOrderState(message.change.old * 1) + '</b>').replace('_to_', '<b>' + $scope.getOrderState(message.change.new * 1) + '</b>');
									message.comment += "<br>'" + message.change.comment + "'.";
								} else {
									message.comment = $scope.translate('ORDER_ATTRIBUTE_CHANGED_FROM_TO').replace('_attribute_', '<b>' + $scope.translate(message.change.attribute.toUpperCase()).toLowerCase() + '</b>').replace('_from_', '<b>' + $scope.getOrderState(message.change.old * 1) + '</b>').replace('_to_', '<b>' + $scope.getOrderState(message.change.new * 1) + '</b>');
								}
							} else if (message.change.attribute == 'driver_id') {
								if (message.driver) {
									message.comment = $scope.translate('DRIVER_ASSIGNED_AS_DRIVER').replace('_driver_', '<b>' + message.driver.name + ' ' + (message.driver.lastname ? message.driver.lastname : '') + '</b>');
								}
							} else if (message.change.attribute != 'comment') {
								message.comment = $scope.translate('ORDER_ATTRIBUTE_CHANGED_FROM_TO').replace('_attribute_', '<b>' + $scope.translate(message.change.attribute.toUpperCase()).toLowerCase() + '</b>').replace('_from_', '<b>' + message.change.old + '</b>').replace('_to_', '<b>' + message.change.new + '</b>');
							} else return;
						}
						order_details.scope.messages.push(message);
						if (order_details.scope.tab == 1) order_details.scope.readMessages();
					}
				});
			});
			order_details.$el.on('click', function (e) {
				if (order_details.backdropClickToClose && e.target === order_details.el) {
					order_details.hide();
					order_details.remove();
					$location.search('id', null);
					if (sockets['messageOrdersManager']) {
						sockets['messageOrdersManager'].close();
						delete sockets['messageOrdersManager'];
					}
				}
			});
			Ordering.orders.messages.all({
				order_id: order.id,
				mode: 'dashboard'
			}, function (res) {
				var messages = [];
				for (var i = 0; i < res.result.length; i++) {
					var message = res.result[i];
					if (message.type != 1) {
						message.direction = message.author_id == gUser.getData().id ? 'to' : 'from';
					} else {
						message.direction = 'general';
						if (message.change.attribute == 'distance') {
							message.comment = $scope.translate('THE_DRIVER_IS_CLOSE') + ' <b>(' + message.driver.name + (message.driver.lastname ? ' ' + message.driver.lastname : '') + ')</b>';
						} else if (message.change.attribute == 'status') {
							if (message.change.new == 8 && message.change.estimated) {
								var estimated_delivery = message.change.estimated;
								message.comment = $scope.translate('ORDER_ATTRIBUTE_CHANGED_FROM_TO').replace('_attribute_', '<b>' + $scope.translate(message.change.attribute.toUpperCase()).toLowerCase() + '</b>').replace('_from_', '<b>' + $scope.getOrderState(message.change.old * 1) + '</b>').replace('_to_', '<b>' + $scope.getOrderState(message.change.new * 1) + '</b>') + '<br>' + $scope.translate('ESTIMATED_DELIVERY_TIME').replace('_min_', estimated_delivery);
							} else if (message.change.new == 7 && message.change.estimated) {
								var estimated_preparation = message.change.estimated;
								message.comment = $scope.translate('ORDER_ATTRIBUTE_CHANGED_FROM_TO').replace('_attribute_', '<b>' + $scope.translate(message.change.attribute.toUpperCase()).toLowerCase() + '</b>').replace('_from_', '<b>' + $scope.getOrderState(message.change.old * 1) + '</b>').replace('_to_', '<b>' + $scope.getOrderState(message.change.new * 1) + '</b>') + '<br>' + $scope.translate('ESTIMATED_PREPARATION_TIME').replace('_min_', estimated_preparation);
							} else if ([2, 5, 6, 10, 12].indexOf(message.change.new) != -1 && message.change.comment) {
								message.comment = $scope.translate('ORDER_ATTRIBUTE_CHANGED_FROM_TO').replace('_attribute_', '<b>' + $scope.translate(message.change.attribute.toUpperCase()).toLowerCase() + '</b>').replace('_from_', '<b>' + $scope.getOrderState(message.change.old * 1) + '</b>').replace('_to_', '<b>' + $scope.getOrderState(message.change.new * 1) + '</b>');
								message.comment += "<br>'" + message.change.comment + "'.";
							} else {
								message.comment = $scope.translate('ORDER_ATTRIBUTE_CHANGED_FROM_TO').replace('_attribute_', '<b>' + $scope.translate(message.change.attribute.toUpperCase()).toLowerCase() + '</b>').replace('_from_', '<b>' + $scope.getOrderState(message.change.old * 1) + '</b>').replace('_to_', '<b>' + $scope.getOrderState(message.change.new * 1) + '</b>');
							}
						} else if (message.change.attribute == 'driver_id') {
							if (message.driver) {
								message.comment = $scope.translate('DRIVER_ASSIGNED_AS_DRIVER').replace('_driver_', '<b>' + message.driver.name + ' ' + (message.driver.lastname ? message.driver.lastname : '') + '</b>');
							}
						} else if (message.change.attribute != 'comment') {
							message.comment = $scope.translate('ORDER_ATTRIBUTE_CHANGED_FROM_TO').replace('_attribute_', '<b>' + $scope.translate(message.change.attribute.toUpperCase()).toLowerCase() + '</b>').replace('_from_', '<b>' + message.change.old + '</b>').replace('_to_', '<b>' + message.change.new + '</b>');
						} else continue;
					}
					messages.push(message);
				}
				order_details.scope.messages = messages;
				if (order_details.scope.tab == 1) order_details.scope.readMessages();
			});
			order_details.scope.readMessages = function () {
				if (order_details.scope.messages.length > 0 && order.unread_count > 0) {
					Ordering.orders.messages.read({
						order_id: order.id,
						order_message_id: order_details.scope.messages[order_details.scope.messages.length - 1].id,
					}, function (res) {
						order.unread_count = 0;
					});
				}
			}
			order_details.scope.changeTab = function (tab) {
				order_details.scope.tab = tab;
				if (tab == 1) {
					order_details.scope.readMessages();
					setTimeout(function () {
						var elements = $('.chat').siblings(':visible');
						var content = $('.chat').parents('ion-content');
						var height = 0;
						for (var i = 0; i < elements.length; i++) {
							var element = elements[i];
							height += $(element).outerHeight(true);
						}
						var h = content.height() - height;
						$('.chat').height(h);
						if (lastScrollHeight) $('.messages').scrollTop(lastScrollHeight);
					}, 20);
				}
			}
			var lastScrollHeight = 0;
			var checkScrollHeight = setInterval(function () {
				if ($('.messages').length == 0) return;
				if ($('.messages')[0].scrollHeight != lastScrollHeight) {
					lastScrollHeight = $('.messages')[0].scrollHeight;
					$('.messages').scrollTop(lastScrollHeight);
				}
			}, 100);
			intervals.push(checkScrollHeight);

			order_details.scope.openChooseFile = function () {
				$rootScope.getImageFile('chat_image', function (base64) {
					if (base64) {
						order_details.scope.message.file = base64;
						order_details.scope.message.type = 3;
					} else {
						order_details.scope.message.file = null;
						order_details.scope.message.type = 2;
					}
				});
			}

			order_details.scope.clearFile = function () {
				order_details.scope.message.file = null;
				order_details.scope.message.type = 2;
				$('#chat_image').val('');
			}

			order_details.scope.sendMessage = function () {
				if (!order_details.scope.message.comment && order_details.scope.message.type == 2) return;
				if (!order_details.scope.message.file && order_details.scope.message.type == 3) return;
				var can_see = [];
				if (order_details.scope.message.canSee.administrator) can_see.push(0);
				if (order_details.scope.message.canSee.business) can_see.push(2);
				if (order_details.scope.message.canSee.customer) can_see.push(3);
				if (order_details.scope.message.canSee.driver) can_see.push(4);
				MyLoading.show($scope.translate('LOADING') + '...');
				Ordering.orders.messages.add({
					order_id: order.id,
					type: order_details.scope.message.type,
					comment: order_details.scope.message.comment ? order_details.scope.message.comment : null,
					file: order_details.scope.message.file ? order_details.scope.message.file : null,
					can_see: can_see.join(',')
				}, function (res) {
					MyLoading.hide();
					if (!res.error) {
						var _message = order_details.scope.messages.find(function (__message) {
							return res.result.id === __message.id
						})
						if (!_message) {
							res.result.direction = res.result.author_id == gUser.getData().id ? 'to' : 'from';
							order_details.scope.messages.push(res.result);
						}
						order_details.scope.message.type = 2;
						order_details.scope.message.comment = '';
						order_details.scope.message.file = null;
						$('#chat_image').val('');
					} else MyAlert.show(res.result);
				});
			}
			order_details.scope.hide = function () {
				if ($scope.order_details) {
					$scope.order_details.hide();
					$scope.order_details.remove();
				}
				if (sockets['messageOrdersManager']) {
					sockets['messageOrdersManager'].close();
					delete sockets['messageOrdersManager'];
				}
				$location.search('id', null);
			}
			if (tab && tab != 0) order_details.scope.changeTab(tab);
		});
	}
	$scope.refund = function (order) {
		if (!ADDONS.stripe_refund) return;
		MyAlert.confirm($scope.translate('QUESTION_REFUND_ORDER')).then(function (res) {
			MyLoading.show($scope.translate('LOADING') + '...');
			Ordering.payments.refund({
				order_id: order.id,
				business_id: order.business_id,
				gateway: order.paymethod.gateway
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					order.refund_data = res.result;
					MyLoading.success($scope.translate('ORDER_REFUNDED'), 1500);
				} else MyAlert.show(res.result);
			});
		});
	}
	Extensions.runAction('enter_orders_editor_view', null, $scope);
});

_controllers.controller('settingsEditorCtrl', function ($scope, $rootScope, $state, $timeout, MyLoading, Ordering/*newsettingsEditorCtrl*/) {
	$rootScope.SEARCH_BY_ADDRESS = SEARCH_BY_ADDRESS;
	MyLoading.show();
	$rootScope.configs = {};
	if (!$scope.editorAvilable || !$scope.superAdmin) {
		// MyLoading.hide();
		return $state.go(app_states.homeScreen);
	}
	$scope.getLanguage(function (err, list, dictionary) {
		$rootScope.pageTitle = $scope.translate('MORE');
		Ordering.configs.all({
		}, function (res) {
			MyLoading.hide();
			$rootScope.configs = res;
		});
	});
	if ($state.params.section == '') $state.params.section = '/general';
	$scope.curTemplateFile = $state.params.section.replace('/', '') + '.html';
	$scope.curTemplate = 'templates/' + ADDONS.template + '/views/editor/settings/includes/' + $scope.curTemplateFile;
	$scope.changeTemplate = function (template) {
		location.href = (!WEB_ADDONS.remove_hash ? '#' : '') + '/settings/' + template;
	}
	Extensions.runAction('enter_settings_editor_view', null, $scope);
});
_controllers.controller('webhooksSettingsEditorCtrl', function ($scope, $rootScope, $state, $timeout, MyLoading, Ordering, MyAlert/*newsettingsEditorCtrl*/) {
	$scope.webhooks = [];
	$scope.curWebhook = {
		hook: '',
		url: '',
		delay: '0'
	}
	$scope.filterUrl = '';

	Ordering.webhooks.all({}, function (res) {
		if (!res.error) {
			$scope.webhooks = res.result;
			$scope.pagination.pages = Math.ceil($scope.webhooks.length / $scope.pagination.items)
		} else MyAlert.show(res.result)
	});
	$scope.pagination = {
		current: 1,
		pages: 1,
		items: '10',
		itemsPerPage: [10, 20, 30, 50]
	};
	$scope.addWebhook = function (curWebhook) {
		MyLoading.show($scope.translate('LOADING') + '...');
		Ordering.webhooks.add({
			hook: curWebhook.hook,
			url: curWebhook.url,
			delay: curWebhook.delay,
		}, function (res) {
			MyLoading.hide();
			if (!res.error) {
				$scope.webhooks.push(res.result);
				curWebhook.url = '';
				curWebhook.hook = '';
				curWebhook.delay = '0';
				MyLoading.success($scope.translate('WEBHOOK_ADDED'), 1500);
			} else MyAlert.show(res.result);
		});
	};

	$scope.deleteWebhook = function (webhook) {
		MyLoading.show($scope.translate('LOADING') + '...');
		Ordering.webhooks.delete({
			id: webhook.id,
		}, function (res) {
			MyLoading.hide();
			if (!res.error) {
				MyLoading.success($scope.translate('WEBHOOK_REMOVED'), 1500);
				for (var i = 0; i < $scope.webhooks.length; i++) {
					if ($scope.webhooks[i].id == webhook.id) $scope.webhooks.splice(i, 1);
				}
			} else MyAlert.show(res.result);
		});
	};

	$scope.updateWebhook = function (webhook) {
		MyLoading.show($scope.translate('LOADING') + '...');
		Ordering.webhooks.update({
			id: webhook.id,
			url: webhook.url,
			hook: webhook.hook,
			delay: webhook.delay
		}, function (res) {
			if (!res.error) {
				MyLoading.success($scope.translate('WEBHOOK_SAVED'), 1500);
			}
		});
	}
	$scope.nextPage = function (pagination) {
		if (pagination.current < pagination.pages) pagination.current++;
	}
	$scope.backPage = function (pagination) {
		if (pagination.current > 0) pagination.current--;
	}
	$(document).ready(function () {
		/***Show Bottom Help***/
		$('[data-toggle="popover"]').popover({ html: true });
		/***Position bottom ButtomHelp***/
		$('#buttonFixed').css({
			'bottom': $('.footer').height() + 15 + 'px',
		});
	});
	Extensions.runAction('enter_webhooks_editor_view', null, $scope);
});
_controllers.controller('reviewManagerCtrl', function ($scope, Ordering, MyModal, MyLoading) {
	$scope.filter = '';
	$scope.reviews = [];
	$scope.pagination = {
		current: 1,
		pages: 1,
		items: '10',
		itemsPerPage: [10, 20, 30, 50]
	};
	$scope.filteredReviews = [];
	$scope.nextPage = function (pagination) {
		if (pagination.current < pagination.pages) pagination.current++;
	}
	$scope.backPage = function (pagination) {
		if (pagination.current > 0) pagination.current--;
	}
	Ordering.business.all({
		mode: 'dashboard',
		params: 'reviews,name'
	}, function (res) {
		if (!res.error) {
			$scope.reviews = [];
			for (var i = 0; i < res.result.length; i++) {
				for (var j = 0; j < res.result[i].reviews.reviews.length; j++) {
					res.result[i].reviews.reviews[j].business_name = res.result[i].name;
					$scope.reviews.push(res.result[i].reviews.reviews[j]);
					$scope.pagination.pages = Math.ceil($scope.reviews.length / $scope.pagination.items)
				}
			}
			$scope.filteredReviews = $scope.reviews;
		} else console.log(res.result)
	})

	$scope.enabledReview = function (review) {
		MyLoading.show($scope.translate('LOADING') + '...')
		Ordering.reviews.update({
			id: review.id,
			business_id: review.laravel_through_key,
			enabled: review.enabled,
		}, function (res) {
			MyLoading.hide();
			if (!res.error) {
				MyLoading.success($scope.translate('REVIEW_UPDATED'), 1500);
			} else console.log(res.result);
		});
	}
	$scope.filterReviews = function () {
		$scope.filteredReviews = $scope.reviews.filter(function (review) {
			var custName = review.user.name + ' ' + review.user.lastname;
			return ((review.business_name && review.business_name.toLowerCase().includes($scope.filter.toLowerCase())) || (review.comment && review.comment.toLowerCase().includes($scope.filter.toLowerCase())) || (review.user.email && review.user.email.toLowerCase().includes($scope.filter.toLowerCase())) || (custName && custName.toLowerCase().includes($scope.filter.toLowerCase())))
		});
	};

	$scope.openModalReview = function (review, $event) {
		if ($event) $event.stopPropagation();
		MyModal.showTemplate('templates/' + ADDONS.template + '/views/order-review-popup.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (modal) {
			modals.push(modal);
			modal.show();
			modal.scope.review = {
				// name: review.user.name,
				// email: review.user.email,
				comments: review.comment,
				manager: true,
			};
			modal.scope.toReview = [
				{
					title: $scope.translate('TEMPLATE_QUALITY_OF_FOOD'),
					review: review.quality,
				},
				{
					title: $scope.translate('TEMPLATE_PUNCTUALITY'),
					review: review.delivery,
				},
				{
					title: $scope.translate('TEMPLATE_SERVICE'),
					review: review.service,
				},
				{
					title: $scope.translate('TEMPLATE_FOOD_PACKAGING'),
					review: review.package,
				}
			];
			modal.scope.rangeReview = function () {
				var range = [];
				for (var i = 0; i < 5; i++) {
					range.push(i + 1);
				}
				return range;
			}
			modal.scope.hide = function () {
				modal.remove();
				modal.hide();
			}
		});
	}
	$(document).ready(function () {
		/***Show Bottom Help***/
		$('[data-toggle="popover"]').popover({ html: true });
		/***Position bottom ButtomHelp***/
		$('#buttonFixed').css({
			'bottom': $('.footer').height() + 15 + 'px',
		});
	});
	Extensions.runAction('enter_reviews_editor_view', null, $scope);
});
_controllers.controller('pluginsSettingsEditorCtrl', function ($scope, $rootScope, $state, $timeout, MyLoading, Ordering, MyAlert) {
	$scope.pagination = {
		current: 1,
		pages: 1,
		items: '10',
		itemsPerPage: [10, 20, 30, 50]
	};
	$scope.nextPage = function (pagination) {
		if (pagination.current < pagination.pages) pagination.current++;
	}
	$scope.backPage = function (pagination) {
		if (pagination.current > 0) pagination.current--;
	}
	$scope.plugins = [];
	Ordering.plugins.all({}, function (res) {
		if (!res.error) {
			$scope.plugins = res.result;
			$scope.pagination.pages = Math.ceil(res.result.length / $scope.pagination.items);
		} else MyAlert.show(res.result);
	});
	$scope.curPlugin = {
		url: ''
	};

	$scope.add = function (plugin) {
		Ordering.plugins.add({
			url: plugin.url
		}, function (res) {
			if (!res.error) {
				$scope.plugins.push(res.result);
				$scope.curPlugin.url = "";
				MyLoading.success($scope.translate('PLUGIN_SAVED'), 1500);
			} else MyAlert.show(res.result);
		});
	}

	$scope.refresh = function (plugin) {
		Ordering.plugins.update({
			id: plugin.id,
			root: plugin.root
		}, function (res) {
			if (!res.error) {
				for (var i = 0; i < $scope.plugins.length; i++) {
					if ($scope.plugins[i].id == plugin.id) {
						$scope.plugins[i] = res.result;
					}
				}
				MyLoading.success($scope.translate('PLUGIN_SAVED'), 1500);
			} else MyAlert.show(res.result);
		});
	}

	$scope.changeStatus = function (plugin) {
		Ordering.plugins.update({
			id: plugin.id,
			enabled: plugin.enabled
		}, function (res) {
			if (!res.error) {
				for (var i = 0; i < $scope.plugins.length; i++) {
					if ($scope.plugins[i].id == plugin.id) {
						$scope.plugins[i] = res.result;
					}
				}
				MyLoading.success($scope.translate('PLUGIN_SAVED'), 1500);
			} else MyAlert.show(res.result);
		});
	}

	$scope.remove = function (plugin) {
		MyAlert.confirm($scope.translate('QUESTION_DELETE_PLUGIN')).then(function (res) {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.plugins.delete({
				id: plugin.id,
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					for (var i = 0; i < $scope.plugins.length; i++) {
						if ($scope.plugins[i].id == plugin.id) {
							$scope.plugins[i] = res.result;
							$scope.plugins.splice(i, 1);
						}
					}
					MyLoading.success($scope.translate('PLUGIN_REMOVED'), 1500);
				} else MyAlert.show(res.result);
			});
		});
	}
	$(document).ready(function () {
		/***Show Bottom Help***/
		$('[data-toggle="popover"]').popover({ html: true });
		/***Position bottom ButtomHelp***/
		$('#buttonFixed').css({
			'bottom': $('.footer').height() + 15 + 'px',
		});
	});
	Extensions.runAction('enter_plugins_editor_view', null, $scope);
});
_controllers.controller('generalSettingsEditorCtrl', function ($scope, $rootScope, $state, MyModal, $timeout, MyAlert, MyLoading, Ordering/*newgeneralSettingsEditorCtrl*/) {
	var curTimeout = null;
	$scope.curForm = [];
	$scope.configs = {};
	$scope.stripe = [];

	setInterval(function () {
		var thumbs = $('.panel');
		if (thumbs.length == 1) return;
		var max = 0;
		for (var i = 0; i < thumbs.length; i++) {
			var header = $(thumbs[i]).find('.panel-heading');
			var caption = $(thumbs[i]).find('.panel-body');
			var height = header.outerHeight() + caption.outerHeight()
			if (height > max) {
				max = height;
			}
		}
		if (max < 50) max = 50;
		$('.panel').height(max);
		if (IFRAME_INLINE) $('.panel .header').css({ 'min-height': '0px' });
	}, 150);

	MyLoading.show();
	Ordering.configs.all({ mode: 'dictionary' }, function (res) {
		MyLoading.hide();
		$scope.configs = res.result;
	});

	$scope.showCheckoutFields = function () {
		if ($scope.modalOpening) return;
		$scope.modalOpening = true;
		MyLoading.toast($scope.translate('LOADING') + '...');
		Ordering.checkoutfields.all({
		}, function (res) {
			$scope.checkoutfields = [];
			for (var key in res.result) {
				if (!ADDONS.discount_code && res.result[key].code != 'coupon') {
					$scope.checkoutfields.push(res.result[key]);
				} else if (ADDONS.discount_code) {
					$scope.checkoutfields.push(res.result[key])
				}
			}
			MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/settings/checkoutfields.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function (checkout_fields) {
				modals.push(checkout_fields);
				$scope.checkout_fields = checkout_fields;
				$scope.checkout_fields.show();
				$scope.modalOpening = false;
				MyLoading.hide();
				checkout_fields.scope.update = function (field, now) {
					var time = 0;
					if (now) time = 0;
					if (curTimeout) $timeout.cancel(curTimeout);
					curTimeout = $timeout(function () {
						MyLoading.toast($scope.translate('LOADING') + '...');
						Ordering.checkoutfields.update({
							id: field.id,
							name: field.name,
							required: field.required ? true : false,
							enabled: field.enabled ? true : false
						}, function (res) {
							MyLoading.hide();
							if (!res.error) MyLoading.success($scope.translate('CHECKOUT_FIELD_SAVED'), 1500);
							else MyAlert.show(res.reasult);
						});
					}, time);
				}
				checkout_fields.scope.hide = function () {
					checkout_fields.hide();
					checkout_fields.remove();
				}
				$(document).ready(function () {
					$('[data-toggle="popover"]').popover({ html: true })
				});
				/***Show Bottom Help***/
			});
		});
	}

	$scope.showValidationFields = function (type) {
		if ($scope.modalOpening) return;
		$scope.modalOpening = true;
		MyLoading.toast($scope.translate('LOADING') + '...');
		var data = {};
		if (type) {
			data.where = [{
				attribute: 'validate',
				value: type
			}];
		}
		Ordering.validationfields.all(data, function (res) {
			MyLoading.hide();
			$scope.validationfields = [];
			for (var key in res.result) {
				//For checkout fields
				if (data.where.includes("checkout")) {
					if ((ADDONS.discount_code || res.result[key].code != 'coupon') && (!NEW_FEATURES.MULTI_ADDRESS || (res.result[key].code != 'city_dropdown_option' && res.result[key].code != 'address' && res.result[key].code != 'zipcode' && res.result[key].code != 'address_notes'))) {
						$scope.validationfields.push(res.result[key])
					}
				}
				//For address fields
				else {
					if (res.result[key].code != 'city_dropdown_option' && res.result[key].code != 'name' && res.result[key].code != 'lastname' && res.result[key].code != 'mobile_phone' && res.result[key].code != 'email' && type == 'address' && res.result[key].code != 'middle_name' && res.result[key].code != 'second_lastname') {
						$scope.validationfields.push(res.result[key]);
					}
				}
			}
			var order_validation_fields = ["name", "middle_name", "lastname", "second_lastname", "email", "mobile_phone", "city_dropdown_option", "address", "zipcode", "address_notes", "coupon", "driver_tip"];
			var validationF = []
			order_validation_fields.forEach(function (field) {
				var sort = $scope.validationfields.findIndex(function (validationfields) {
					return validationfields.code == field;
				})
				if (sort != -1) {
					var item = $scope.validationfields[sort];
					$scope.validationfields.splice(sort, 1);
					validationF.push(item);
				}
			});
			$scope.validationfields = validationF.concat($scope.validationfields)
			MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/settings/validationfields.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function (validation_fields) {
				modals.push(validation_fields);
				validation_fields.show();
				$scope.modalOpening = false;
				validation_fields.scope.type = type;
				validation_fields.scope.update = function (field) {
					if (curTimeout) $timeout.cancel(curTimeout);
					MyLoading.toast($scope.translate('LOADING') + '...');
					Ordering.validationfields.update({
						id: field.id,
						// name: field.name,
						required: field.required ? true : false,
						enabled: field.enabled ? true : false
					}, function (res) {
						MyLoading.hide();
						if (!res.error) MyLoading.success($scope.translate('VALIDATION_FIELD_SAVED'), 1500);
						else MyAlert.show(res.reasult);
					});
				}
				validation_fields.scope.hide = function () {
					validation_fields.hide();
					validation_fields.remove();
				}
			});
		});
	}

	$scope.languages = [];
	$scope.default = -1;
	$scope.showLanguageSettings = function () {
		if ($scope.modalOpening) return;
		$scope.modalOpening = true;
		MyLoading.toast($scope.translate('LOADING') + '...');
		Ordering.languages.all({
		}, function (res) {
			for (var i = 0; i < res.result.length; i++) {
				if (res.result[i].default) $scope.default = res.result[i].id;
			}
			$scope.languages = res.result;
			MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/settings/languages.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function (languages_settings) {
				modals.push(languages_settings);
				$scope.languages_settings = languages_settings;
				$scope.languages_settings.show();
				$scope.modalOpening = false;
				MyLoading.hide();
				languages_settings.scope.update = function (language, bool) {
					if (bool) {
						language.enabled = true;
					}
					Ordering.languages.update({
						id: language.id,
						enabled: language.enabled,
						default: language.default
					}, function (res) {
						if (!res.error) MyLoading.success($scope.translate('LANGUAGE_SAVED'), 1500);
						else MyAlert.show(res.result);
					});
				}
				languages_settings.scope.changeDefault = function (language) {
					for (var i = 0; i < $scope.languages.length; i++) {
						if ($scope.languages[i].id != language.id) $scope.languages[i].default = false;
						else $scope.languages[i].default = true;
					}
					$scope.default = language.id;
					languages_settings.scope.update(language, true);
				}
				languages_settings.scope.hide = function () {
					languages_settings.hide();
					languages_settings.remove();
				}
				$(document).ready(function () {
					$('[data-toggle="popover"]').popover({ html: true })
				});
				/***Show Bottom Help***/
			});
		});
	}

	$scope.showIntegration = function () {
		if ($scope.modalOpening) return;
		$scope.modalOpening = true;
		MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/settings/modal-integration.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (integration_settings) {
			modals.push(integration_settings);
			$scope.integration_settings = integration_settings;
			$scope.integration_settings.show();
			$scope.modalOpening = false;
			integration_settings.scope.hide = function () {
				integration_settings.hide();
				integration_settings.remove();
			}
			$(document).ready(function () {
				$('[data-toggle="popover"]').popover({ html: true });
				$("#facebook_login").change($scope.changeSelect("facebook_login"));
			});
			/***Show Bottom Help***/
		});
	}

	$scope.changeSelect = function (id) {
		if (id == 'facebook_login') {
			setTimeout(function () {
				var singleValue = $("#facebook_login").val();
				if (singleValue == "true") {
					$('#facebook_id').prop('disabled', false);
					$('#facebook_secret').prop('disabled', false);
					$('#facebook_account_kit_secret').prop('disabled', false);
				} else if (singleValue == "false") {
					$('#facebook_id').prop('disabled', 'disabled');
					$('#facebook_secret').prop('disabled', 'disabled');
					$('#facebook_account_kit_secret').prop('disabled', 'disabled');
				}
			}, 50);
		}
	}

	$scope.isUndefined = function (variable) {
		return variable == undefined || variable == null;
	}

	$scope.transformArray = function (values) {
		return '[' + values + ']';
	}

	$scope.formatArray = function (values) {
		values = values.replace('[', '');
		values = values.replace(']', '');
		return values;
	}

	$scope.stripeSettings = function () {
		$scope.curForm = {
			title: $scope.translate('STRIPE_SETTINGS'),
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
					name: 'stripe_sandbox',
					value: !$scope.isUndefined($scope.configs.stripe_sandbox) ? $scope.configs.stripe_sandbox.value : '',
					config: $scope.configs.stripe_sandbox
				},
				{
					label: $scope.translate('PUBLISHABLE_KEY'),
					type: 'text',
					name: 'stripe_publishable',
					value: !$scope.isUndefined($scope.configs.stripe_publishable) ? $scope.configs.stripe_publishable.value : '',
					config: $scope.configs.stripe_publishable
				},
				{
					label: $scope.translate('API_SECRET'),
					type: 'text',
					name: 'stripe_secret',
					value: !$scope.isUndefined($scope.configs.stripe_secret) ? $scope.configs.stripe_secret.value : '',
					config: $scope.configs.stripe_secret
				},
				{
					label: $scope.translate('PUBLISHABLE_KEY') + ' (' + $scope.translate('SANDBOX') + ')',
					type: 'text',
					name: 'stripe_publishable_sandbox',
					value: !$scope.isUndefined($scope.configs.stripe_publishable_sandbox) ? $scope.configs.stripe_publishable_sandbox.value : '',
					config: $scope.configs.stripe_publishable_sandbox
				},
				{
					label: $scope.translate('API_SECRET') + ' (' + $scope.translate('SANDBOX') + ')',
					type: 'text',
					name: 'stripe_secret_sandbox',
					value: !$scope.isUndefined($scope.configs.stripe_secret_sandbox) ? $scope.configs.stripe_secret_sandbox.value : '',
					config: $scope.configs.stripe_secret_sandbox
				},
			]
		};
		$scope.showIntegration();
	}

	$scope.siteSettings = function () {
		$scope.curForm = {
			title: $scope.translate('SITE_SETTINGS'),
			fields: [
				{
					label: $scope.translate('SITE_NAME'),
					type: 'text',
					name: 'site_name',
					value: !$scope.isUndefined($scope.configs.site_name) ? $scope.configs.site_name.value : '',
					config: $scope.configs.site_name
				},
				{
					label: $scope.translate('SITE_URL'),
					type: 'text',
					name: 'site_url',
					value: !$scope.isUndefined($scope.configs.site_url) ? $scope.configs.site_url.value : '',
					config: $scope.configs.site_url
				}
			]
		};
		$scope.showIntegration();
	}

	$scope.formatNumberSettings = function () {
		$scope.curForm = {
			title: $scope.translate('FORMAT_NUMBER_SETTINGS'),
			fields: [
				{
					label: $scope.translate('FORMAT_NUMBER_DECIMAL_LENGTH'),
					type: 'select',
					options: [
						{
							value: '0',
							text: '0'
						},
						{
							value: '1',
							text: '1'
						},
						{
							value: '2',
							text: '2'
						},
						{
							value: '3',
							text: '3'
						},
						{
							value: '4',
							text: '4'
						},
						{
							value: '5',
							text: '5'
						}
					],
					name: 'format_number_decimal_length',
					value: !$scope.isUndefined($scope.configs.format_number_decimal_length) ? $scope.configs.format_number_decimal_length.value : '',
					config: $scope.configs.format_number_decimal_length
				},
				{
					label: $scope.translate('FORMAT_NUMBER_DECIMAL_SEPARATOR'),
					type: 'select',
					options: [
						{
							value: '.',
							text: '.'
						},
						{
							value: ',',
							text: ','
						}
					],
					name: 'format_number_decimal_separator',
					value: !$scope.isUndefined($scope.configs.format_number_decimal_separator) ? $scope.configs.format_number_decimal_separator.value : '',
					config: $scope.configs.format_number_decimal_separator
				},
				{
					label: $scope.translate('FORMAT_NUMBER_THOUSAND_SEPARATOR'),
					type: 'select',
					options: [
						{
							value: '.',
							text: '.'
						},
						{
							value: ',',
							text: ','
						},
						{
							value: ' ',
							text: $scope.translate('SPACE')
						}
					],
					name: 'format_number_thousand_separator',
					value: !$scope.isUndefined($scope.configs.format_number_thousand_separator) ? $scope.configs.format_number_thousand_separator.value : ',',
					config: $scope.configs.format_number_thousand_separator
				}
			]
		};
		$scope.showIntegration();
	}

	$scope.showAutoassignField = function (curForm, field) {
		var logistic_module = $scope.configs.logistic_module && $scope.configs.logistic_module.value;
		var autassign_type = 'basic';
		curForm.fields.forEach(function (_field) {
			if (_field.name == 'autoassign_type') {
				autassign_type = _field.value
			}
		});
		if (!logistic_module && field.name == 'autoassign_type') {
			return false;
		} else if (logistic_module && autassign_type == 'enterprise') {
			return ['autoassign_max_assignments', 'autoassign_max_distance', 'autoassign_start_in_status'].indexOf(field.name) == -1;
		} else if (autassign_type != 'enterprise' && field.name == 'google_maps_api_key') {
			return false;
		}
		return true;
	}

	$scope.autoAssignSettings = function () {
		$scope.curForm = {
			title: $scope.translate('DRIVER_ASSIGMENT_SETTINGS'),
			key: 'autoassign',
			fields: [{
				label: $scope.translate('AUTOASSIGN_TYPE'),
				type: 'select',
				options: [
					{
						value: 'basic',
						text: $scope.translate('BASIC')
					},
					{
						value: 'enterprise',
						text: $scope.translate('ENTERPRISE')
					}
				],
				name: 'autoassign_type',
				value: !$scope.isUndefined($scope.configs.autoassign_type) ? $scope.configs.autoassign_type.value : 'basic',
				config: $scope.configs.autoassign_type,
			},
			{
				label: $scope.translate('MAX_ASSIGNMENTS'),
				type: 'text',
				name: 'autoassign_max_assignments',
				value: !$scope.isUndefined($scope.configs.autoassign_max_assignments) ? $scope.configs.autoassign_max_assignments.value : '1',
				config: $scope.configs.autoassign_max_assignments,
			},
			{
				label: $scope.translate('AUTOASSIGN_MAIN_ORDER_DRIVER'),
				type: 'select',
				options: [
					{
						value: 'distance',
						text: $scope.translate('DISTANCE') + " (" + $scope.translate('ASCENDING') + ")"
					},
					{
						value: 'last_order_assigned_at',
						text: $scope.translate('LAST_ORDER_ASSGINED_AT') + " (" + $scope.translate('ASCENDING') + ")"
					}
				],
				name: 'autoassign_main_order_driver',
				value: !$scope.isUndefined($scope.configs.autoassign_main_order_driver) ? $scope.configs.autoassign_main_order_driver.value : 'last_order_assigned_at',
				config: $scope.configs.autoassign_main_order_driver,
			},
			{
				label: $scope.translate('MAP_API_KEY'),
				type: 'text',
				name: 'google_maps_api_key',
				value: !$scope.isUndefined($scope.configs.google_maps_api_key) ? $scope.configs.google_maps_api_key.value : '',
				config: $scope.configs.google_maps_api_key,
			}],
		};

		if (ADDONS.autoassign == true) {
			$scope.curForm.fields.push(
				{
					label: $scope.translate('ENABLE') + " " + $scope.translate('AUTO_ASSIGNMENT'),
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
					name: 'autoassign_enabled',
					value: !$scope.isUndefined($scope.configs.autoassign_enabled) ? $scope.configs.autoassign_enabled.value : '',
					config: $scope.configs.autoassign_enabled
				},
				{
					label: $scope.translate('AUTO_ASSIGNMENT') + " " + $scope.translate('MAX_DISTANCE') + " (" + $scope.translate('BUSINESS_LIST_OPTIONS_KM') + ")",
					type: 'text',
					name: 'autoassign_max_distance',
					value: !$scope.isUndefined($scope.configs.autoassign_max_distance) ? $scope.configs.autoassign_max_distance.value : '',
					config: $scope.configs.autoassign_max_distance
				}
			);
			$scope.curForm.fields.push(
				{
					label: $scope.translate('START_IN_STATUS'),
					type: 'select',
					options: [
						{
							value: '4',
							text: $scope.translate('ORDER_READY')
						},
						{
							value: '7',
							text: $scope.translate('ORDER_STATUS_ACCEPTEDBYRESTAURANT')
						}
					],
					name: 'autoassign_start_in_status',
					value: !$scope.isUndefined($scope.configs.autoassign_start_in_status) ? $scope.configs.autoassign_start_in_status.value : '7',
					config: $scope.configs.autoassign_start_in_status
				}
			)
		}
		$scope.showIntegration();
	}

	$scope.facebookSettings = function () {
		$scope.curForm = {
			title: $scope.translate('FACEBOOK_SETTINGS'),
			fields: [
				{
					label: $scope.translate('FACEBOOK_LOGIN_DESC'),
					type: 'select',
					options: [
						{
							value: 'true',
							text: $scope.translate('YES')
						},
						{
							value: 'false',
							text: $scope.translate('NO')
						}
					],
					name: 'facebook_login',
					value: !$scope.isUndefined($scope.configs.facebook_login) ? $scope.configs.facebook_login.value : '',
					config: $scope.configs.facebook_login,
					id: 'facebook_login'
				},
				{
					label: $scope.translate('FACEBOOK_ID'),
					type: 'text',
					name: 'facebook_id',
					value: !$scope.isUndefined($scope.configs.facebook_id) ? $scope.configs.facebook_id.value : '',
					config: $scope.configs.facebook_id,
					id: 'facebook_id'
				},
				{
					label: $scope.translate('FACEBOOK_SECRET'),
					type: 'text',
					name: 'facebook_secret',
					value: !$scope.isUndefined($scope.configs.facebook_secret) ? $scope.configs.facebook_secret.value : '',
					config: $scope.configs.facebook_secret,
					id: 'facebook_secret'
				},
				{
					label: $scope.translate('FACEBOOK_ACCOUNT_KIT_SECRET'),
					type: 'text',
					name: 'facebook_account_kit_secret',
					value: !$scope.isUndefined($scope.configs.facebook_account_kit_secret) ? $scope.configs.facebook_account_kit_secret.value : '',
					config: $scope.configs.facebook_account_kit_secret,
					id: 'facebook_account_kit_secret'
				}
			]
		};
		$scope.showIntegration();
	}
	$scope.notificationSettings = function () {
		if ($scope.modalOpening) return;
		$scope.modalOpening = true;
		MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/settings/modal-notifications.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (notifications_settings) {
			modals.push(notifications_settings);
			$scope.notifications_settings = notifications_settings;
			$scope.notifications_settings.show();
			$scope.modalOpening = false;
			function parseStates(states) {
				var numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 18, 19, 50, 51];
				if (!states || !states.value) states = numbers.join('|');
				else states = states.value;
				states = states.split('|').map(function (x) {
					return parseInt(x);
				});
				var res = [];
				for (var i = 0; i < numbers.length; i++) {
					res[numbers[i]] = states.indexOf(numbers[i]) >= 0;
				}
				return res;
			}
			function getStates(states) {
				return states.map(function (value, key) {
					if (value) return key;
				}).filter(function (key) {
					return key != null && key != undefined;
				}).join('|');
			}
			notifications_settings.scope.curCollapse = null;
			notifications_settings.scope.general = {
				onesignal_user_auth: !$scope.isUndefined($scope.configs.onesignal_user_auth) ? $scope.configs.onesignal_user_auth.value : '',
				onesignal_orderingapp_id: !$scope.isUndefined($scope.configs.onesignal_orderingapp_id) ? $scope.configs.onesignal_orderingapp_id.value : '',
				onesignal_businessapp_id: !$scope.isUndefined($scope.configs.onesignal_businessapp_id) ? $scope.configs.onesignal_businessapp_id.value : '',
				onesignal_deliveryapp_id: !$scope.isUndefined($scope.configs.onesignal_deliveryapp_id) ? $scope.configs.onesignal_deliveryapp_id.value : '',
				driver_close_distance: !$scope.isUndefined($scope.configs.driver_close_distance) ? $scope.configs.driver_close_distance.value : ''
			}

			notifications_settings.scope.superadmin_notifications = parseStates($scope.configs.notification_superadmin_states);
			notifications_settings.scope.business_notifications = parseStates($scope.configs.notification_business_states);
			notifications_settings.scope.customer_notifications = parseStates($scope.configs.notification_customer_states);
			notifications_settings.scope.driver_notifications = parseStates($scope.configs.notification_driver_states);
			// notifications_settings.scope.city_manager_notifications = parseStates($scope.configs.notification_city_manager_states);
			notifications_settings.scope.changeCollapse = function (index) {
				if (notifications_settings.scope.curCollapse == index) notifications_settings.scope.curCollapse = null;
				else notifications_settings.scope.curCollapse = index;
			}
			notifications_settings.scope.save = function () {
				var form = {
					fields: [
						{
							name: 'onesignal_user_auth',
							value: notifications_settings.scope.general.onesignal_user_auth,
							config: $scope.configs.onesignal_user_auth
						},
						{
							name: 'onesignal_orderingapp_id',
							value: notifications_settings.scope.general.onesignal_orderingapp_id,
							config: $scope.configs.onesignal_orderingapp_id
						},
						{
							name: 'onesignal_businessapp_id',
							value: notifications_settings.scope.general.onesignal_businessapp_id,
							config: $scope.configs.onesignal_businessapp_id
						},
						{
							name: 'onesignal_deliveryapp_id',
							value: notifications_settings.scope.general.onesignal_deliveryapp_id,
							config: $scope.configs.onesignal_deliveryapp_id
						},
						{
							name: 'driver_close_distance',
							value: notifications_settings.scope.general.driver_close_distance,
							config: $scope.configs.driver_close_distance
						},
						{
							name: 'notification_superadmin_states',
							value: getStates(notifications_settings.scope.superadmin_notifications),
							config: $scope.configs.notification_superadmin_states
						},
						{
							name: 'notification_business_states',
							value: getStates(notifications_settings.scope.business_notifications),
							config: $scope.configs.notification_business_states
						},
						{
							name: 'notification_customer_states',
							value: getStates(notifications_settings.scope.customer_notifications),
							config: $scope.configs.notification_customer_states
						},
						{
							name: 'notification_driver_states',
							value: getStates(notifications_settings.scope.driver_notifications),
							config: $scope.configs.notification_driver_states
						}
					]
				}
				$scope.saveIntegration(form);
			}
			notifications_settings.scope.hide = function () {
				notifications_settings.hide();
				notifications_settings.remove();
			}
			$(document).ready(function () {
				$('[data-toggle="popover"]').popover({ html: true })
			});
			/***Show Bottom Help***/
		});
	}
	$scope.cloudinarySettings = function () {
		$scope.curForm = {
			title: $scope.translate('CLOUDINARY_SETTINGS'),
			fields: [
				{
					label: $scope.translate('CLOUD_NAME'),
					type: 'text',
					name: 'cloudinary_name',
					value: !$scope.isUndefined($scope.configs.cloudinary_name) ? $scope.configs.cloudinary_name.value : '',
					config: $scope.configs.cloudinary_name
				},
				{
					label: $scope.translate('API_KEY'),
					type: 'text',
					name: 'cloudinary_key',
					value: !$scope.isUndefined($scope.configs.cloudinary_key) ? $scope.configs.cloudinary_key.value : '',
					config: $scope.configs.cloudinary_key
				},
				{
					label: $scope.translate('API_SECRET'),
					type: 'text',
					name: 'cloudinary_secret',
					value: !$scope.isUndefined($scope.configs.cloudinary_secret) ? $scope.configs.cloudinary_secret.value : '',
					config: $scope.configs.cloudinary_secret
				}
			]
		};
		$scope.showIntegration();
	}
	$scope.tookanSettings = function () {
		$scope.curForm = {
			title: $scope.translate('TOOKAN_SETTINGS'),
			fields: [
				{
					label: $scope.translate('TOOKAN_ENABLED'),
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
					name: 'tookan_enabled',
					value: !$scope.isUndefined($scope.configs.tookan_enabled) ? $scope.configs.tookan_enabled.value : '',
					config: $scope.configs.tookan_enabled
				},
				{
					label: $scope.translate('TOOKAN_USER_ID'),
					type: 'text',
					name: 'tookan_user',
					value: !$scope.isUndefined($scope.configs.tookan_user) ? $scope.configs.tookan_user.value : '',
					config: $scope.configs.tookan_user
				},
				{
					label: $scope.translate('TOOKAN_V2_API'),
					type: 'text',
					name: 'tookan_key',
					value: !$scope.isUndefined($scope.configs.tookan_key) ? $scope.configs.tookan_key.value : '',
					config: $scope.configs.tookan_key
				}
			]
		};
		$scope.showIntegration();
	}
	$scope.comunicationSettings = function () {
		if ($scope.modalOpening) return;
		$scope.modalOpening = true;
		MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/settings/modal-emails.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (emails_settings) {
			modals.push(emails_settings);
			$scope.emails_settings = emails_settings;
			$scope.emails_settings.show();
			$scope.modalOpening = false;
			function parseStates(states) {
				var numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 50, 53];
				if (!states || !states.value) states = numbers.join('|');
				else states = states.value;
				states = states.split('|').map(function (x) {
					return parseInt(x);
				});
				var res = [];
				for (var i = 0; i < numbers.length; i++) {
					res[numbers[i]] = states.indexOf(numbers[i]) >= 0;
				}
				return res;
			}
			function getStates(states) {
				return states.map(function (value, key) {
					if (value) return key;
				}).filter(function (key) {
					return key != null && key != undefined;
				}).join('|');
			}
			emails_settings.scope.curCollapse = null;
			emails_settings.scope.general = {
				main_name: !$scope.isUndefined($scope.configs.email_main_name) ? $scope.configs.email_main_name.value : '',
				reply_name: !$scope.isUndefined($scope.configs.email_reply_name) ? $scope.configs.email_reply_name.value : '',
				reply: !$scope.isUndefined($scope.configs.email_reply) ? $scope.configs.email_reply.value : '',
				email_main: !$scope.isUndefined($scope.configs.email_main) ? $scope.configs.email_main.value : '',
				email_smtp_host: !$scope.isUndefined($scope.configs.email_smtp_host) ? $scope.configs.email_smtp_host.value : '',
				email_smtp_port: !$scope.isUndefined($scope.configs.email_smtp_port) ? $scope.configs.email_smtp_port.value : '',
				email_smtp_username: !$scope.isUndefined($scope.configs.email_smtp_username) ? $scope.configs.email_smtp_username.value : '',
				email_smtp_password: !$scope.isUndefined($scope.configs.email_smtp_password) ? $scope.configs.email_smtp_password.value : '',
				email_smtp_encryption: !$scope.isUndefined($scope.configs.email_smtp_encryption) ? $scope.configs.email_smtp_encryption.value : '',
				email_smtp_use_default: !$scope.configs.email_smtp_use_default || $scope.configs.email_smtp_use_default.value == '1',
			};
			emails_settings.scope.superadmin_emails = parseStates($scope.configs.email_superadmin_states);
			emails_settings.scope.business_emails = parseStates($scope.configs.email_business_states);
			emails_settings.scope.customer_emails = parseStates($scope.configs.email_customer_states);
			// emails_settings.scope.driver_emails = parseStates($scope.configs.email_driver_states);
			emails_settings.scope.city_manager_emails = parseStates($scope.configs.email_city_manager_states);
			emails_settings.scope.changeCollapse = function (index) {
				if (emails_settings.scope.curCollapse == index) emails_settings.scope.curCollapse = null;
				else emails_settings.scope.curCollapse = index;
			}
			emails_settings.scope.save = function () {
				var form = {
					fields: [
						{
							name: 'email_main_name',
							value: emails_settings.scope.general.main_name,
							config: $scope.configs.email_main_name
						},
						{
							name: 'email_reply_name',
							value: emails_settings.scope.general.reply_name,
							config: $scope.configs.email_reply_name
						},
						{
							name: 'email_reply',
							value: emails_settings.scope.general.reply,
							config: $scope.configs.email_reply
						},
						{
							name: 'email_main',
							value: emails_settings.scope.general.email_main,
							config: $scope.configs.email_main
						},
						{
							name: 'email_smtp_host',
							value: emails_settings.scope.general.email_smtp_host,
							config: $scope.configs.email_smtp_host
						},
						{
							name: 'email_smtp_port',
							value: emails_settings.scope.general.email_smtp_port,
							config: $scope.configs.email_smtp_port
						},
						{
							name: 'email_smtp_username',
							value: emails_settings.scope.general.email_smtp_username,
							config: $scope.configs.email_smtp_username
						},
						{
							name: 'email_smtp_password',
							value: emails_settings.scope.general.email_smtp_password,
							config: $scope.configs.email_smtp_password
						},
						{
							name: 'email_smtp_encryption',
							value: emails_settings.scope.general.email_smtp_encryption,
							config: $scope.configs.email_smtp_encryption
						},
						{
							name: 'email_smtp_use_default',
							value: emails_settings.scope.general.email_smtp_use_default ? '1' : '0',
							config: $scope.configs.email_smtp_use_default
						},
						{
							name: 'email_superadmin_states',
							value: getStates(emails_settings.scope.superadmin_emails),
							config: $scope.configs.email_superadmin_states
						},
						{
							name: 'email_business_states',
							value: getStates(emails_settings.scope.business_emails),
							config: $scope.configs.email_business_states
						},
						{
							name: 'email_customer_states',
							value: getStates(emails_settings.scope.customer_emails),
							config: $scope.configs.email_customer_states
						},
						{
							name: 'email_city_manager_states',
							value: getStates(emails_settings.scope.city_manager_emails),
							config: $scope.configs.email_city_manager_states
						}
					]
				}
				$scope.saveIntegration(form);
			}

			emails_settings.scope.hide = function () {
				emails_settings.hide();
				emails_settings.remove();
			}
			$(document).ready(function () {
				$('[data-toggle="popover"]').popover({ html: true })
			});
			/***Show Bottom Help***/
		});
	}
	$scope.stripeConnectSettings = function () {
		$scope.curForm = {
			title: $scope.translate('STRIPE_CONNECT_SETTINGS'),
			stripeconnect: true,
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
					name: 'stripe_connect_sandbox',
					value: !$scope.isUndefined($scope.configs.stripe_connect_sandbox) ? $scope.configs.stripe_connect_sandbox.value : '',
					config: $scope.configs.stripe_connect_sandbox
				},
				{
					label: $scope.translate('CLIENT_ID_SANDBOX'),
					type: 'text',
					name: 'stripe_connect_client_id_sandbox',
					value: !$scope.isUndefined($scope.configs.stripe_connect_client_id_sandbox) ? $scope.configs.stripe_connect_client_id_sandbox.value : '',
					config: $scope.configs.stripe_connect_client_id_sandbox
				},
				{
					label: $scope.translate('CLIENT_ID_PRODUCTION'),
					type: 'text',
					name: 'stripe_connect_client_id',
					value: !$scope.isUndefined($scope.configs.stripe_connect_client_id) ? $scope.configs.stripe_connect_client_id.value : '',
					config: $scope.configs.stripe_connect_client_id
				}
			]
		};
		$scope.showIntegration();
	}
	$scope.signupBusinessSettings = function () {
		$scope.curForm = {
			title: $scope.translate('SIGNUP_BUSINESS_SETTINGS'),
			fields: [
				{
					label: $scope.translate('ALLOW_SIGNUP_BUSINESS'),
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
					name: 'business_signup_allow',
					value: !$scope.isUndefined($scope.configs.business_signup_allow) ? $scope.configs.business_signup_allow.value : '',
					config: $scope.configs.business_signup_allow
				},
				{
					label: $scope.translate('ENABLED_DEFAULT_SIGNUP_BUSINESS'),
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
					name: 'business_signup_enabled_default',
					value: !$scope.isUndefined($scope.configs.business_signup_enabled_default) ? $scope.configs.business_signup_enabled_default.value : '',
					config: $scope.configs.business_signup_enabled_default
				}
			]
		};
		$scope.showIntegration();
	}
	$scope.formatTimeSettings = function () {
		$scope.curForm = {
			title: $scope.translate('FORMAT_TIME_SETTINGS'),
			fields: [
				{
					label: $scope.translate('FORMAT_TIME'),
					type: 'select',
					options: [
						{
							value: '12',
							text: $scope.translate('12')
						},
						{
							value: '24',
							text: $scope.translate('24')
						}
					],
					name: 'format_time',
					value: !$scope.isUndefined($scope.configs.format_time) ? $scope.configs.format_time.value : '12',
					config: $scope.configs.format_time
				},
				{
					label: $scope.translate('DATE_MOMENT_FORMAT'),
					type: 'text',
					name: 'dates_moment_format',
					value: !$scope.isUndefined($scope.configs.dates_moment_format) ? $scope.configs.dates_moment_format.value : 'MM/DD hh:mm',
					config: $scope.configs.dates_moment_format,
				},
				{
					label: $scope.translate('DATE_GENERAL_FORMAT'),
					type: 'text',
					name: 'dates_general_format',
					value: !$scope.isUndefined($scope.configs.dates_general_format) ? $scope.configs.dates_general_format.value : 'YYYY-MM-DD HH:mm:ss',
					config: $scope.configs.dates_general_format
				},
			]
		};
		$scope.showIntegration();
	}
	$scope.businessesSettings = function () {
		$scope.curForm = {
			title: $scope.translate('BUSINESSES_SETTINGS'),
			fields: [
				{
					label: $scope.translate('LAZY_LOAD_PRODUCTS_WHEN_NECESSARY'),
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
					name: 'lazy_load_products_when_necessary',
					value: !$scope.isUndefined($scope.configs.lazy_load_products_when_necessary) ? $scope.configs.lazy_load_products_when_necessary.value : '12',
					config: $scope.configs.lazy_load_products_when_necessary
				},
				{
					label: $scope.translate('ORDER_VALIDATE'),
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
					name: 'order_validate',
					value: !$scope.isUndefined($scope.configs.order_validate) ? $scope.configs.order_validate.value : '12',
					config: $scope.configs.order_validate
				},
				{
					label: $scope.translate('PICKUP_MAX_DISTANCE_KM'),
					type: 'number',
					name: 'max_distance_pickup',
					value: !$scope.isUndefined($scope.configs.max_distance_pickup) ? $scope.configs.max_distance_pickup.value * 1 : '',
					config: $scope.configs.max_distance_pickup
				},
				{
					label: $scope.translate('USE_DISTANCE_DRIVER_RADIO'),
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
					name: 'use_distance_driver_radio',
					value: !$scope.isUndefined($scope.configs.use_distance_driver_radio) ? $scope.configs.use_distance_driver_radio.value : '',
					config: $scope.configs.use_distance_driver_radio
				},
				{
					label: $scope.translate('MIN_DISTANCE_DRIVER_RADIO') + " (KM)",
					type: 'number',
					name: 'min_distance_driver_radio',
					value: !$scope.isUndefined($scope.configs.min_distance_driver_radio) ? $scope.configs.min_distance_driver_radio.value * 1 : '',
					config: $scope.configs.min_distance_driver_radio
				},
				{
					label: $scope.translate('ENABLE_PREORDER_SETTING'),
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
					name: 'preorder_status_enabled',
					value: !$scope.isUndefined($scope.configs.preorder_status_enabled) ? $scope.configs.preorder_status_enabled.value : '0',
					config: $scope.configs.preorder_status_enabled
				},
			]
		};
		$scope.showIntegration();
	}
	$scope.operationSettings = function () {
		$scope.curForm = {
			title: $scope.translate('OPERATION_SETTINGS'),
			fields: [
				{
					label: $scope.translate('ACTIVATE_UPDATE_DRIVER_NEAR_BUSSINES_DESC'),
					type: 'select',
					options: [
						{
							value: 1,
							text: $scope.translate('YES')
						},
						{
							value: 0,
							text: $scope.translate('NO')
						},
					],
					name: 'order_update_location_business',
					value: !$scope.isUndefined($scope.configs.order_update_location_business) ? $scope.configs.order_update_location_business.value : -1,
					config: $scope.configs.order_update_location_business,
				},
				{
					label: $scope.translate('UPDATE_DRIVER_NEAR_BUSINESS_DISTANCE_DESC'),
					type: 'text',
					name: 'order_update_location_business_distance',
					value: !$scope.isUndefined($scope.configs.order_update_location_business_distance) ? $scope.configs.order_update_location_business_distance.value : 1,
					config: $scope.configs.order_update_location_business_distance,
				},
				{
					label: $scope.translate('ACTIVATE_UPDATE_DRIVER_NEAR_CUSTOMER_DESC'),
					type: 'select',
					options: [
						{
							value: 1,
							text: $scope.translate('YES')
						},
						{
							value: 0,
							text: $scope.translate('NO')
						},
					],
					name: 'order_update_location_customer',
					value: !$scope.isUndefined($scope.configs.order_update_location_customer) ? $scope.configs.order_update_location_customer.value : -1,
					config: $scope.configs.order_update_location_customer,
				},
				{
					label: $scope.translate('UPDATE_DRIVER_NEAR_CUSTOMER_DISTANCE_DESC'),
					type: 'text',
					name: 'order_update_location_customer_distance',
					value: !$scope.isUndefined($scope.configs.order_update_location_customer_distance) ? $scope.configs.order_update_location_customer_distance.value : 1,
					config: $scope.configs.order_update_location_customer_distance,
				},
			],
		};
		$scope.showIntegration();
	}
	$scope.termsConditions = function () {
		$scope.curForm = {
			title: $scope.translate('TERMS_AND_CONDITIONS'),
			fields: [
				{
					label: $scope.translate('TERMS_AND_CONDITIONS_DESC'),
					type: 'select',
					options: [
						{
							value: 'true',
							text: $scope.translate('YES')
						},
						{
							value: 'false',
							text: $scope.translate('NO')
						}
					],
					name: 'terms_and_conditions',
					value: !$scope.isUndefined($scope.configs.terms_and_conditions) ? $scope.configs.terms_and_conditions.value : '',
					config: $scope.configs.terms_and_conditions
				},
				{
					label: $scope.translate('TERMS_AND_CONDITIONS_URL'),
					type: 'text',
					name: 'terms_and_conditions_url',
					value: !$scope.isUndefined($scope.configs.terms_and_conditions_url) ? $scope.configs.terms_and_conditions_url.value : '',
					config: $scope.configs.terms_and_conditions_url
				}
			]
		};
		$scope.showIntegration();
	}
	$scope.recaptcha = function () {
		$scope.curForm = {
			title: $scope.translate('RECAPTCHA'),
			fields: [
				{
					label: $scope.translate('RECAPTCHA_FOR_SIGNUP'),
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
					name: 'security_recaptcha_signup',
					value: !$scope.isUndefined($scope.configs.security_recaptcha_signup) ? $scope.configs.security_recaptcha_signup.value : '',
					config: $scope.configs.security_recaptcha_signup
				},
				{
					label: $scope.translate('RECAPTCHA_FOR_LOGIN'),
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
					name: 'security_recaptcha_auth',
					value: !$scope.isUndefined($scope.configs.security_recaptcha_auth) ? $scope.configs.security_recaptcha_auth.value : '',
					config: $scope.configs.security_recaptcha_auth
				},
				{
					label: $scope.translate('SITE_KEY'),
					type: 'text',
					name: 'security_recaptcha_site_key',
					value: !$scope.isUndefined($scope.configs.security_recaptcha_site_key) ? $scope.configs.security_recaptcha_site_key.value : '',
					config: $scope.configs.security_recaptcha_site_key
				},
				{
					label: $scope.translate('SECRET_KEY'),
					type: 'text',
					name: 'security_recaptcha_secret_key',
					value: !$scope.isUndefined($scope.configs.security_recaptcha_secret_key) ? $scope.configs.security_recaptcha_secret_key.value : '',
					config: $scope.configs.security_recaptcha_secret_key
				}
			]
		};
		$scope.showIntegration();
	}
	$scope.twilio = function () {
		$scope.curForm = {
			title: $scope.translate('TWILIO'),
			fields: [
				{
					label: $scope.translate('TWILIO_SSID'),
					type: 'text',
					name: 'twilio_ssid',
					value: !$scope.isUndefined($scope.configs.twilio_ssid) ? $scope.configs.twilio_ssid.value : '',
					config: $scope.configs.twilio_ssid
				},
				{
					label: $scope.translate('TWILIO_AUTH_TOKEN'),
					type: 'text',
					name: 'twilio_auth_token',
					value: !$scope.isUndefined($scope.configs.twilio_auth_token) ? $scope.configs.twilio_auth_token.value : '',
					config: $scope.configs.twilio_auth_token
				},
				{
					label: $scope.translate('TWILIO_SERVICE_ID'),
					type: 'text',
					name: 'twilio_service_id',
					value: !$scope.isUndefined($scope.configs.twilio_service_id) ? $scope.configs.twilio_service_id.value : '',
					config: $scope.configs.twilio_service_id
				},
				{
					label: $scope.translate('TWILIO_SERVICE_ENABLED'),
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
					name: 'twilio_service_enabled',
					value: !$scope.isUndefined($scope.configs.twilio_service_enabled) ? $scope.configs.twilio_service_enabled.value : 0,
					config: $scope.configs.twilio_service_enabled
				},
			]
		};
		$scope.showIntegration();
	}
	$scope.saveIntegration = function (form) {
		var configs = [];
		var isStripe = false;
		console.log(form)
		for (var i = 0; i < form.fields.length; i++) {
			if (!(form.fields[i].name == 'dates_general_format' || form.fields[i].name == 'dates_moment_format') && (form.fields[i].changed == false || !form.fields[i].value || (form.fields[i].type != 'select' && (form.fields[i].value + '').trim() == '') || form.fields[i].value == 'PROTECT')) {
				continue;
			}
			// Evaluate if the date format is a correct format and change the string format based on what's selected on format time.
			if (form.fields[i].name == 'dates_general_format' || form.fields[i].name == 'dates_moment_format') {
				if (!(form.fields[i].name == 'format_time') && !/^(((Y{1,4})|(M{1,2})|(D{1,2})|([Hh]{1,2}[Aa]?)|(k{1,2}[Aa]?)|(m{1,2}[Aa]?)|(s{1,2})[Aa]?)([\W]|$))+$/.test(form.fields[i].value)) {
					return MyAlert.show($scope.translate('DATE_FORMAT_ERROR'))
				}
				if (form.fields[0].value == '12') {
					while (form.fields[i].value.includes('H')) {
						form.fields[i].value = form.fields[i].value.replace('H', 'h');
					}
					var timeIndex = -1;
					if (form.fields[i].value.lastIndexOf('h') > timeIndex) timeIndex = form.fields[i].value.lastIndexOf('h');
					if (form.fields[i].value.lastIndexOf('k') > timeIndex) timeIndex = form.fields[i].value.lastIndexOf('k');
					if (form.fields[i].value.lastIndexOf('m') > timeIndex) timeIndex = form.fields[i].value.lastIndexOf('m');
					if (form.fields[i].value.lastIndexOf('s') > timeIndex) timeIndex = form.fields[i].value.lastIndexOf('s');
					if (form.fields[i].value[timeIndex + 1] === 'a' || form.fields[i].value[timeIndex + 1] === 'A') {
						continue;
					}
					form.fields[i].value = form.fields[i].value.slice(0, timeIndex + 1) + 'a' + form.fields[i].value.slice(timeIndex + 1);
				} else if (form.fields[0].value == '24') {
					while (form.fields[i].value.includes('h')) {
						form.fields[i].value = form.fields[i].value.replace('h', 'H');
					};
					while (form.fields[i].value.includes('a')) {
						form.fields[i].value = form.fields[i].value.replace('a', '');
					};
					while (form.fields[i].value.includes('A')) {
						form.fields[i].value = form.fields[i].value.replace('A', '');
					};
				}
			}
			// Evaluate driver tip options to generate a correct configuration.
			if (form.fields[i].name == 'driver_tip_options') {
				if (!/^((\d)+,)*(\d)+$/.test(form.fields[i].value)) {
					return MyAlert.show($scope.translate('DRIVER_TIP_OPTIONS_ERROR'));
				}
				form.fields[i].value = $scope.transformArray(form.fields[i].value)
			}
			configs.push({
				id: (form.fields[i].config) ? form.fields[i].config.id : null,
				key: form.fields[i].name,
				value: form.fields[i].value
			});
			// Return driver tip options value so in front-end the value doesn't seems to be changed.
			if (form.fields[i].name == 'driver_tip_options') {
				form.fields[i].value = $scope.formatArray(form.fields[i].value)
			}
			if (['stripe_secret', 'stripe_publishable', 'stripe_secret_sandbox', 'stripe_publishable_sandbox'].indexOf(form.fields[i].name) !== -1) {
				isStripe = true;
			}
		}
		if (configs.length == 0) {
			return MyLoading.toast($scope.translate('NOTHING_TO_SAVE'), 1500);
		}
		if (isStripe) {
			MyAlert.confirm($scope.translate('QUESTION_CHANGE_STRIPE_SETTINGS')).then(function () {
				$scope.saveIntegrationChanges(configs);
			});
		} else {
			$scope.saveIntegrationChanges(configs);
		}
	}

	$scope.saveIntegrationChanges = function (configs) {
		for (var i = 0; i < configs.length; i++) {
			if (configs[i].id) {
				Ordering.configs.update({
					id: configs[i].id,
					key: configs[i].key,
					value: configs[i].value
				}, function (res) {
					if (!res.error) {
						MyLoading.success($scope.translate('CONFIGS_SAVED'), 1500);
						Object.assign($scope.configs[res.result.key], res.result);
					} else MyAlert.show(res.result);
				});
			} else {
				Ordering.configs.add({
					key: configs[i].key,
					value: configs[i].value
				}, function (res) {
					if (!res.error) {
						MyLoading.success($scope.translate('CONFIGS_SAVED'), 1500);
						$scope.configs[res.result.key] = res.result;
					} else MyAlert.show(res.result);
				});
			}
		}
	}

	$scope.notification_toast = function () {
		$scope.curForm = {
			title: $scope.translate('NOTIFICATION_TOAST'),
			fields: [
				{
					label: $scope.translate('NOTIFICATION_TOAST_DESC'),
					type: 'select',
					options: [
						{
							value: 'true',
							text: $scope.translate('NOTIFICATION_STYLE_TOAST')
						},
						{
							value: 'false',
							text: $scope.translate('NOTIFICATION_STYLE_POPUP')
						}
					],
					name: 'notification_toast',
					value: !$scope.isUndefined($scope.configs.notification_toast) ? $scope.configs.notification_toast.value : '',
					config: $scope.configs.notification_toast
				}
			]
		};
		$scope.showIntegration();
	}
	$scope.max_days_preorder = function () {
		$scope.curForm = {
			title: $scope.translate('MAX_DAYS_PREORDER'),
			react: true,
			fields: [
				{
					label: $scope.translate('MAX_DAYS_PREORDER_DESC'),
					type: 'number',
					name: 'max_days_preorder',
					value: !$scope.isUndefined($scope.configs.max_days_preorder) ? $scope.configs.max_days_preorder.value * 1 : '',
					config: $scope.configs.max_days_preorder
				}
			]
		};
		$scope.showIntegration();
	}
	$scope.meters_to_change_address = function () {
		$scope.curForm = {
			title: $scope.translate('METERS_TO_CHANGE_ADDRESS'),
			react: true,
			fields: [
				{
					label: $scope.translate('METERS_TO_CHANGE_ADDRESS_DESC'),
					type: 'number',
					name: 'meters_to_change_address',
					value: !$scope.isUndefined($scope.configs.meters_to_change_address) ? $scope.configs.meters_to_change_address.value * 1 : '',
					config: $scope.configs.meters_to_change_address
				}
			]
		};
		$scope.showIntegration();
	}
	$scope.default_order_type = function () {
		$scope.curForm = {
			title: $scope.translate('DEFAULT_ORDER_TYPE'),
			react: true,
			fields: [
				{
					label: $scope.translate('DEFAULT_ORDER_TYPE_DESC'),
					type: 'select',
					options: [
						{
							value: 'delivery',
							text: $scope.translate('DELIVERY')
						},
						{
							value: 'pickup',
							text: $scope.translate('PICKUP')
						},
						{
							value: 'eatin',
							text: $scope.translate('EAT_IN')
						},
						{
							value: 'curbside',
							text: $scope.translate('CURBSIDE')
						},
						{
							value: 'drivethru',
							text: $scope.translate('DRIVE_THRU')
						}
					],
					name: 'default_order_type',
					value: !$scope.isUndefined($scope.configs.default_order_type) ? $scope.configs.default_order_type.value : '',
					config: $scope.configs.default_order_type
				}
			]
		};
		$scope.showIntegration();
	}
	$scope.order_types_allowed = function () {
		if ($scope.modalOpening) return;
		$scope.modalOpening = true;
		MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/settings/modal-typeorder.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (order_types) {
			modals.push(order_types);
			$scope.order_types = order_types;
			$scope.order_types.show();
			$scope.modalOpening = false;
			function parseStates(states) {
				var numbers = [1, 2, 3, 4, 5];
				if (!states || !states.value) states = numbers.join('|');
				else states = states.value;
				states = states.split('|').map(function (x) {
					return parseInt(x);
				});
				var res = [];
				for (var i = 0; i < numbers.length; i++) {
					res[numbers[i]] = states.indexOf(numbers[i]) >= 0;
				}
				return res;
			}
			function getStates(states) {
				return states.map(function (value, key) {
					if (value) return key;
				}).filter(function (key) {
					return key != null && key != undefined;
				}).join('|');
			}
			order_types.scope.order_types_allowed = parseStates($scope.configs.order_types_allowed);
			order_types.scope.save = function () {
				var form = {
					fields: [
						{
							name: 'order_types_allowed',
							value: getStates(order_types.scope.order_types_allowed),
							config: $scope.configs.order_types_allowed
						}
					]
				}
				$scope.saveIntegration(form);
			}
			order_types.scope.hide = function () {
				order_types.hide();
				order_types.remove();
			}
			$(document).ready(function () {
				$('[data-toggle="popover"]').popover({ html: true })
			});
		});
	}
	$scope.google_maps_api_key = function () {
		$scope.curForm = {
			title: $scope.translate('GOOGLE_MAPS_API_KEY'),
			react: true,
			fields: [
				{
					label: $scope.translate('GOOGLE_MAPS_API_KEY_DESC'),
					type: 'text',
					name: 'google_maps_api_key',
					value: !$scope.isUndefined($scope.configs.google_maps_api_key) ? $scope.configs.google_maps_api_key.value : '',
					config: $scope.configs.google_maps_api_key
				}
			]
		};
		$scope.showIntegration();
	}
	$scope.country_autocomplete = function () {
		$scope.curForm = {
			title: $scope.translate('COUNTRY_AUTOCOMPLETE'),
			react: true,
			fields: [
				{
					label: $scope.translate('COUNTRY_AUTOCOMPLETE_DESC'),
					type: 'text',
					name: 'country_autocomplete',
					value: !$scope.isUndefined($scope.configs.country_autocomplete) ? $scope.configs.country_autocomplete.value : '',
					config: $scope.configs.country_autocomplete
				}
			]
		};
		$scope.showIntegration();
	}
	$scope.track_id_google_analytics = function () {
		$scope.curForm = {
			title: $scope.translate('TRACK_ID_GOOGLE_ANALYTICS'),
			react: true,
			fields: [
				{
					label: $scope.translate('TRACK_ID_GOOGLE_ANALYTICS_DESC'),
					type: 'text',
					name: 'track_id_google_analytics',
					value: !$scope.isUndefined($scope.configs.track_id_google_analytics) ? $scope.configs.track_id_google_analytics.value : '',
					config: $scope.configs.track_id_google_analytics
				}
			]
		};
		$scope.showIntegration();
	}
	$scope.guest_uuid_max_days = function () {
		$scope.curForm = {
			title: $scope.translate('GUEST_UUID_MAX_DAYS'),
			react: true,
			fields: [
				{
					label: $scope.translate('GUEST_UUID_MAX_DAYS_DESC'),
					type: 'number',
					name: 'guest_uuid_max_days',
					value: !$scope.isUndefined($scope.configs.guest_uuid_max_days) ? $scope.configs.guest_uuid_max_days.value * 1 : '',
					min: 1,
					config: $scope.configs.guest_uuid_max_days
				}
			]
		};
		$scope.showIntegration();
	}
	$scope.guest_uuid_access = function () {
		$scope.curForm = {
			title: $scope.translate('GUEST_UUID_ACCESS'),
			react: true,
			fields: [
				{
					label: $scope.translate('GUEST_UUID_ACCESS_DESC'),
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
					name: 'guest_uuid_access',
					value: !$scope.isUndefined($scope.configs.guest_uuid_access) ? $scope.configs.guest_uuid_access.value : '',
					config: $scope.configs.guest_uuid_access
				}
			]
		};
		$scope.showIntegration();
	}
	$scope.distance_unit = function () {
		$scope.curForm = {
			title: $scope.translate('DISTANCE_UNIT'),
			react: true,
			fields: [
				{
					label: $scope.translate('DISTANCE_UNIT_DESC'),
					type: 'select',
					options: [
						{
							value: 'mi',
							text: $scope.translate('MILES')
						},
						{
							value: 'km',
							text: $scope.translate('KILOMETERS')
						}
					],
					name: 'distance_unit',
					value: !$scope.isUndefined($scope.configs.distance_unit) ? $scope.configs.distance_unit.value : '',
					config: $scope.configs.distance_unit
				}
			]
		};
		$scope.showIntegration();
	}
	$scope.currencyPossition = function () {
		$scope.curForm = {
			title: $scope.translate('MOBILE_CURRENCY_POSITION'),
			react: true,
			fields: [
				{
					label: $scope.translate('CURRENCY_SYMBOL'),
					type: 'text',
					name: 'format_number_currency',
					value: !$scope.isUndefined($scope.configs.format_number_currency) ? $scope.configs.format_number_currency.value : '$',
					config: $scope.configs.format_number_currency
				},
				{
					label: $scope.translate('CURRENCY_POSITION'),
					type: 'select',
					options: [
						{
							value: 'left',
							text: $scope.translate('LEFT')
						},
						{
							value: 'right',
							text: $scope.translate('RIGHT')
						}
					],
					name: 'currency_position',
					value: !$scope.isUndefined($scope.configs.currency_position) ? $scope.configs.currency_position.value : 'left',
					config: $scope.configs.currency_position
				},
				{
					label: $scope.translate('PAYMENT_CURRENCY'),
					type: 'select',
					options: [{ value: "AED", text: "United Arab Emirates dirham - AED" }, { value: "AFN", text: "Afghan afghani - AFN" }, { value: "ALL", text: "Albanian lek - ALL" }, { value: "AMD", text: "Armenian dram - AMD" }, { value: "ANG", text: "Netherlands Antillean guilder - ANG" }, { value: "AOA", text: "Angolan kwanza - AOA" }, { value: "ARS", text: "Argentine peso - ARS" }, { value: "AUD", text: "Australian dollar - AUD" }, { value: "AWG", text: "Aruban florin - AWG" }, { value: "AZN", text: "Azerbaijani manat - AZN" }, { value: "BAM", text: "Bosnia and Herzegovina convertible mark - BAM" }, { value: "BBD", text: "Barbados dollar - BBD" }, { value: "BDT", text: "Bangladeshi taka - BDT" }, { value: "BGN", text: "Bulgarian lev - BGN" }, { value: "BHD", text: "Bahraini dinar - BHD" }, { value: "BIF", text: "Burundian franc - BIF" }, { value: "BMD", text: "Bermudian dollar - BMD" }, { value: "BND", text: "Brunei dollar - BND" }, { value: "BOB", text: "Boliviano - BOB" }, { value: "BRL", text: "Brazilian real - BRL" }, { value: "BSD", text: "Bahamian dollar - BSD" }, { value: "BTN", text: "Bhutanese ngultrum - BTN" }, { value: "BWP", text: "Botswana pula - BWP" }, { value: "BYN", text: "New Belarusian ruble - BYN" }, { value: "BYR", text: "Belarusian ruble - BYR" }, { value: "BZD", text: "Belize dollar - BZD" }, { value: "CAD", text: "Canadian dollar - CAD" }, { value: "CDF", text: "Congolese franc - CDF" }, { value: "CHF", text: "Swiss franc - CHF" }, { value: "CLF", text: "Unidad de Fomento - CLF" }, { value: "CLP", text: "Chilean peso - CLP" }, { value: "CNY", text: "Renminbi|Chinese yuan - CNY" }, { value: "COP", text: "Colombian peso - COP" }, { value: "CRC", text: "Costa Rican colon - CRC" }, { value: "CUC", text: "Cuban convertible peso - CUC" }, { value: "CUP", text: "Cuban peso - CUP" }, { value: "CVE", text: "Cape Verde escudo - CVE" }, { value: "CZK", text: "Czech koruna - CZK" }, { value: "DJF", text: "Djiboutian franc - DJF" }, { value: "DKK", text: "Danish krone - DKK" }, { value: "DOP", text: "Dominican peso - DOP" }, { value: "DZD", text: "Algerian dinar - DZD" }, { value: "EGP", text: "Egyptian pound - EGP" }, { value: "ERN", text: "Eritrean nakfa - ERN" }, { value: "ETB", text: "Ethiopian birr - ETB" }, { value: "EUR", text: "Euro - EUR" }, { value: "FJD", text: "Fiji dollar - FJD" }, { value: "FKP", text: "Falkland Islands pound - FKP" }, { value: "GBP", text: "Pound sterling - GBP" }, { value: "GEL", text: "Georgian lari - GEL" }, { value: "GHS", text: "Ghanaian cedi - GHS" }, { value: "GIP", text: "Gibraltar pound - GIP" }, { value: "GMD", text: "Gambian dalasi - GMD" }, { value: "GNF", text: "Guinean franc - GNF" }, { value: "GTQ", text: "Guatemalan quetzal - GTQ" }, { value: "GYD", text: "Guyanese dollar - GYD" }, { value: "HKD", text: "Hong Kong dollar - HKD" }, { value: "HNL", text: "Honduran lempira - HNL" }, { value: "HRK", text: "Croatian kuna - HRK" }, { value: "HTG", text: "Haitian gourde - HTG" }, { value: "HUF", text: "Hungarian forint - HUF" }, { value: "IDR", text: "Indonesian rupiah - IDR" }, { value: "ILS", text: "Israeli new shekel - ILS" }, { value: "INR", text: "Indian rupee - INR" }, { value: "IQD", text: "Iraqi dinar - IQD" }, { value: "IRR", text: "Iranian rial - IRR" }, { value: "ISK", text: "Icelandic króna - ISK" }, { value: "JMD", text: "Jamaican dollar - JMD" }, { value: "JOD", text: "Jordanian dinar - JOD" }, { value: "JPY", text: "Japanese yen - JPY" }, { value: "KES", text: "Kenyan shilling - KES" }, { value: "KGS", text: "Kyrgyzstani som - KGS" }, { value: "KHR", text: "Cambodian riel - KHR" }, { value: "KMF", text: "Comoro franc - KMF" }, { value: "KPW", text: "North Korean won - KPW" }, { value: "KRW", text: "South Korean won - KRW" }, { value: "KWD", text: "Kuwaiti dinar - KWD" }, { value: "KYD", text: "Cayman Islands dollar - KYD" }, { value: "KZT", text: "Kazakhstani tenge - KZT" }, { value: "LAK", text: "Lao kip - LAK" }, { value: "LBP", text: "Lebanese pound - LBP" }, { value: "LKR", text: "Sri Lankan rupee - LKR" }, { value: "LRD", text: "Liberian dollar - LRD" }, { value: "LSL", text: "Lesotho loti - LSL" }, { value: "LYD", text: "Libyan dinar - LYD" }, { value: "MAD", text: "Moroccan dirham - MAD" }, { value: "MDL", text: "Moldovan leu - MDL" }, { value: "MGA", text: "Malagasy ariary - MGA" }, { value: "MKD", text: "Macedonian denar - MKD" }, { value: "MMK", text: "Myanmar kyat - MMK" }, { value: "MNT", text: "Mongolian tögrög - MNT" }, { value: "MOP", text: "Macanese pataca - MOP" }, { value: "MRO", text: "Mauritanian ouguiya - MRO" }, { value: "MUR", text: "Mauritian rupee - MUR" }, { value: "MVR", text: "Maldivian rufiyaa - MVR" }, { value: "MWK", text: "Malawian kwacha - MWK" }, { value: "MXN", text: "Mexican peso - MXN" }, { value: "MXV", text: "Mexican Unidad de Inversion - MXV" }, { value: "MYR", text: "Malaysian ringgit - MYR" }, { value: "MZN", text: "Mozambican metical - MZN" }, { value: "NAD", text: "Namibian dollar - NAD" }, { value: "NGN", text: "Nigerian naira - NGN" }, { value: "NIO", text: "Nicaraguan córdoba - NIO" }, { value: "NOK", text: "Norwegian krone - NOK" }, { value: "NPR", text: "Nepalese rupee - NPR" }, { value: "NZD", text: "New Zealand dollar - NZD" }, { value: "OMR", text: "Omani rial - OMR" }, { value: "PAB", text: "Panamanian balboa - PAB" }, { value: "PEN", text: "Peruvian Sol - PEN" }, { value: "PGK", text: "Papua New Guinean kina - PGK" }, { value: "PHP", text: "Philippine peso - PHP" }, { value: "PKR", text: "Pakistani rupee - PKR" }, { value: "PLN", text: "Polish złoty - PLN" }, { value: "PYG", text: "Paraguayan guaraní - PYG" }, { value: "QAR", text: "Qatari riyal - QAR" }, { value: "RON", text: "Romanian leu - RON" }, { value: "RSD", text: "Serbian dinar - RSD" }, { value: "RUB", text: "Russian ruble - RUB" }, { value: "RWF", text: "Rwandan franc - RWF" }, { value: "SAR", text: "Saudi riyal - SAR" }, { value: "SBD", text: "Solomon Islands dollar - SBD" }, { value: "SCR", text: "Seychelles rupee - SCR" }, { value: "SDG", text: "Sudanese pound - SDG" }, { value: "SEK", text: "Swedish krona - SEK" }, { value: "SGD", text: "Singapore dollar - SGD" }, { value: "SHP", text: "Saint Helena pound - SHP" }, { value: "SLL", text: "Sierra Leonean leone - SLL" }, { value: "SOS", text: "Somali shilling - SOS" }, { value: "SRD", text: "Surinamese dollar - SRD" }, { value: "SSP", text: "South Sudanese pound - SSP" }, { value: "STD", text: "São Tomé and Príncipe dobra - STD" }, { value: "SVC", text: "Salvadoran colón - SVC" }, { value: "SYP", text: "Syrian pound - SYP" }, { value: "SZL", text: "Swazi lilangeni - SZL" }, { value: "THB", text: "Thai baht - THB" }, { value: "TJS", text: "Tajikistani somoni - TJS" }, { value: "TMT", text: "Turkmenistani manat - TMT" }, { value: "TND", text: "Tunisian dinar - TND" }, { value: "TOP", text: "Tongan paʻanga - TOP" }, { value: "TRY", text: "Turkish lira - TRY" }, { value: "TTD", text: "Trinidad and Tobago dollar - TTD" }, { value: "TWD", text: "New Taiwan dollar - TWD" }, { value: "TZS", text: "Tanzanian shilling - TZS" }, { value: "UAH", text: "Ukrainian hryvnia - UAH" }, { value: "UGX", text: "Ugandan shilling - UGX" }, { value: "USD", text: "United States dollar - USD" }, { value: "UYI", text: "Uruguay Peso en Unidades Indexadas - UYI" }, { value: "UYU", text: "Uruguayan peso - UYU" }, { value: "UZS", text: "Uzbekistan som - UZS" }, { value: "VEF", text: "Venezuelan bolívar - VEF" }, { value: "VND", text: "Vietnamese đồng - VND" }, { value: "VUV", text: "Vanuatu vatu - VUV" }, { value: "WST", text: "Samoan tala - WST" }, { value: "XAF", text: "Central African CFA franc - XAF" }, { value: "XCD", text: "East Caribbean dollar - XCD" }, { value: "XOF", text: "West African CFA franc - XOF" }, { value: "XPF", text: "CFP franc - XPF" }, { value: "XXX", text: "No currency - XXX" }, { value: "YER", text: "Yemeni rial - YER" }, { value: "ZAR", text: "South African rand - ZAR" }, { value: "ZMW", text: "Zambian kwacha - ZMW" }, { value: "ZWL", text: "Zimbabwean dollar - ZWL" }],
					name: 'stripe_currency',
					value: !$scope.isUndefined($scope.configs.stripe_currency) ? $scope.configs.stripe_currency.value : 'USD',
					config: $scope.configs.stripe_currency
				}
			]
		};
		$scope.showIntegration();
	}
	$scope.defaultLocationSettings = function () {
		$scope.curForm = {
			title: $scope.translate('DEFAULT_LOCATION_SETTINGS'),
			react: true,
			fields: [
				{
					label: $scope.translate('DEFAULT_LATITUDE'),
					type: 'text',
					name: 'location_default_latitude',
					value: !$scope.isUndefined($scope.configs.location_default_latitude) ? $scope.configs.location_default_latitude.value : '40.7751052',
					config: $scope.configs.location_default_latitude,
				},
				{
					label: $scope.translate('DEFAULT_LONGITUDE'),
					type: 'text',
					name: 'location_default_longitude',
					value: !$scope.isUndefined($scope.configs.location_default_longitude) ? $scope.configs.location_default_longitude.value : '-73.9651148',
					config: $scope.configs.location_default_longitude
				},
			]
		};
		$scope.showIntegration();
	};
	$scope.driverTipsSettings = function () {
		$scope.curForm = {
			title: $scope.translate('DRIVER_TIPS_SETTINGS'),
			react: true,
			fields: [
				{
					label: $scope.translate('DRIVER_TIP_TYPE'),
					type: 'select',
					name: 'driver_tip_type',
					options: [
						{
							value: 1,
							text: $scope.translate('FIXED_FEE')
						},
						{
							value: 2,
							text: $scope.translate('PERCENTAGE_FEE')
						}
					],
					value: !$scope.isUndefined($scope.configs.driver_tip_type) ? $scope.configs.driver_tip_type.value : 2,
					config: $scope.configs.driver_tip_type,
				},
				{
					label: $scope.translate('DRIVER_TIP_OPTIONS'),
					type: 'text',
					name: 'driver_tip_options',
					value: !$scope.isUndefined($scope.configs.driver_tip_options) ? $scope.formatArray($scope.configs.driver_tip_options.value) : '0,10,15,25',
					config: $scope.configs.driver_tip_options,
				},
				{
					label: $scope.translate('DRIVER_TIP_USE_CUSTOM'),
					type: 'select',
					name: 'driver_tip_use_custom',
					options: [
						{
							value: 0,
							text: $scope.translate('NO')
						},
						{
							value: 1,
							text: $scope.translate('YES')
						}
					],
					value: !$scope.isUndefined($scope.configs.driver_tip_use_custom) ? $scope.configs.driver_tip_use_custom.value : 0,
					config: $scope.configs.driver_tip_use_custom,
				},
			],
		};
		$scope.showIntegration();
	}

	$scope.defaultOrderStatusSettings = function () {
		$scope.curForm = {
			title: $scope.translate('DEFAULT_ORDER_STATUS_SETTING'),
			stripeconnect: true,
			fields: [
				{
					label: $scope.translate('DEFAULT_ORDER_STATUS_IS_PROCESSING'),
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
					name: 'default_order_is_processing',
					value: !$scope.isUndefined($scope.configs.default_order_is_processing) ? $scope.configs.default_order_is_processing.value : '',
					config: $scope.configs.default_order_is_processing
				}
			]
		};
		$scope.showIntegration();
	}

	$(document).ready(function () {
		$('[data-toggle="popover"]').popover({ html: true })
	});
	/***Show Bottom Help***/
	Extensions.runAction('enter_general_editor_view', null, $scope);
});

_controllers.controller('languagesSettingsEditorCtrl', function ($scope, $rootScope, $state, MyAlert, MyLoading, Ordering, hotRegisterer, $filter/*newlanguagesSettingsEditorCtrl*/) {
	$scope.admin = {};
	$scope.langadmin = [];
	$scope.static = {};
	$scope.langstatic = [];
	$scope.curLang = {
		key: '',
		text: ''
	};
	MyLoading.show();
	Ordering.translations.all({}, function (res) {
		$scope.translations = res.result;
		$scope.main = [];
		for (var i = 0; i < res.result.length; i++) {
			switch (res.result[i].key) {
				case 'Panel_Currency':
					console.log();
					$scope.main.push({
						i: 0,
						id: res.result[i].id,
						name: $scope.translate('CURRENCY'),
						key: res.result[i].key,
						text: res.result[i].text,
					});
					break;
				case 'BUSINESS_TYPE_FOOD':
					$scope.main.push({
						i: 1,
						id: res.result[i].id,
						name: $scope.translate('TYPE_FOOD_WEB_APP'),
						key: res.result[i].key,
						text: res.result[i].text,
					});
					break;
				case 'BUSINESS_TYPE_ALCOHOL':
					$scope.main.push({
						i: 2,
						id: res.result[i].id,
						name: $scope.translate('TYPE_ALCOHOL_WEB_APP'),
						key: res.result[i].key,
						text: res.result[i].text,
					});
					break;
				case 'BUSINESS_TYPE_LAUNDRY':
					$scope.main.push({
						i: 3,
						id: res.result[i].id,
						name: $scope.translate('TYPE_LAUNDRY_WEB_APP'),
						key: res.result[i].key,
						text: res.result[i].text,
					});
					break;
				case 'BUSINESS_TYPE_GROCERIES':
					$scope.main.push({
						i: 4,
						id: res.result[i].id,
						name: $scope.translate('TYPE_GROCERIES_WEB_APP'),
						key: res.result[i].key,
						text: res.result[i].text,
					});
					break;
			}
		}
		$scope.pagination.current = 1;
		$scope.pagination.pages = Math.ceil($scope.translations.length / $scope.pagination.items);
		MyLoading.hide();
	});
	$scope.pagination = {
		current: 1,
		pages: 1,
		items: '10',
		itemsPerPage: [10, 20, 30, 50]
	};
	$scope.nextPage = function (pagination) {
		if (pagination.current < pagination.pages) pagination.current++;
	}
	$scope.backPage = function (pagination) {
		if (pagination.current > 0) pagination.current--;
	}

	$scope.updateTranslation = function (translation) {
		MyLoading.toast($scope.translate('LOADING') + '...');
		Ordering.translations.update({
			id: translation.id,
			key: translation.key,
			text: translation.text
		}, function (res) {
			MyLoading.hide();
			if (!res.error) MyLoading.success($scope.translate('WEB_APP_LANG_SAVED'), 1500);
			else MyAlert.show(res.result);
		});
	}
	$scope.addTranslations = function (translation) {
		MyLoading.toast($scope.translate('LOADING') + '...');
		Ordering.translations.add({
			key: translation.key,
			text: translation.text
		}, function (res) {
			MyLoading.hide();
			if (!res.error) {
				$scope.curLang = {
					key: '',
					text: ''
				};
				$scope.translations.push(res.result);
				$scope.MLanguages[res.result.key] = res.result.text;
				$rootScope.MLanguages[res.result.key] = res.result.text;
				MyLoading.success($scope.translate('WEB_APP_LANG_ADDED'), 1500);
			} else MyAlert.show(res.result);
		});
	}
	//HANDSONTABLE
	$scope.view = 'visual';
	$scope.dataTable = [];
	$scope.filterTable = function (view, toTable) {
		if (view == 'visual') return;
		$scope.dataTable = [];
		if (toTable) limit = 20;
		else limit = $scope.translations.length;
		for (var i = 0; i < limit; i++) {
			if ($scope.translations[i].key.toLowerCase().indexOf($scope.filterTranslation.key.toLowerCase()) > -1
				&& $scope.translations[i].text.toLowerCase().indexOf($scope.filterTranslation.text.toLowerCase()) > -1) {
				$scope.dataTable.push($scope.translations[i]);
			}
		}
		$scope.dataTable = $filter('orderBy')($scope.dataTable, 'id');
	};
	$scope.changeView = function (view) {
		$scope.view = view;
		if (view == 'table') {
			$scope.filterTable(view);
			setTimeout(function () {
				$scope.filterTable(view);
			}, 50)
		}
	};
	function emptyField(value, cb) {
		if (value == "" || !value) cb(false);
		else cb(true);
	};
	Handsontable.validators.registerValidator('empty-field', emptyField);
	var curCell = {
		col: -1,
		row: -1,
	};
	var timeoutErrors = null;
	var errors = [];
	var removing = false;
	var cache = null;
	setInterval(function () {
		if (navigator.clipboard) navigator.clipboard.readText().then(function (clipboardData) {
			if (clipboardData) cache = clipboardData;
		}).catch(function (e) { });
	}, 500);
	$scope.configs = {
		stretchH: 'all',
		undo: true,
		autoWrapRow: true,
		copyPaste: true,
		contextMenu: {
			items: {
				"copy": {
					name: $scope.translate('SPREADSHEET_COPY'),
				},
				'undo': {
					name: $scope.translate('SPREADSHEET_UNDO'),
				},
				'redo': {
					name: $scope.translate('SPREADSHEET_REDO'),
				},
				"paste": {
					key: 'paste',
					name: $scope.translate('SPREADSHEET_PASTE'),
					disabled: function () {
						return cache ? false : true;
					},
					callback: function () {
						var plugin = this.getPlugin('copyPaste');
						this.listen();
						plugin.paste(cache);
					}
				}
			}
		},
		cells: function (row, col, prop) {
			if ($scope.view == 'visual') return;
			var cellProperties = {};
			if (col == 0) {
				var data = hotRegisterer.getInstance('hot').getSourceDataAtRow(row);
				if (data && data.id) {
					cellProperties.readOnly = true;
				};
				return cellProperties;
			}

		},
		afterSelectionEnd: function (row, col, row1, col1) {
			if ((curCell.row == row && curCell.col == col) || (row !== row1 || col !== col1)) return;
			curCell.row = row;
			curCell.col = col;
			var hot = hotRegisterer.getInstance('hot');
			hot.deselectCell();
			hot.selectCell(row, col);
		},
		outsideClickDeselects: function (event) {
			curCell.row = -1;
			curCell.col = -1;
			hotRegisterer.getInstance('hot').deselectCell();
		},
		afterUndo: function (c) {
			if (c.actionType == "change") {
				for (var i = c.changes.length - 1; i >= 0; i--) {
					if (c.changes[i][1] == "key") {
						removing = true;
						var row = hotRegisterer.getInstance('hot').getSourceDataAtRow(c.changes[i][0]);
						hotRegisterer.getInstance('hot').alter('remove_row', c.changes[i][0]);
						Ordering.translations.delete({
							id: row.id
						}, function (res) {

						});
					};
				}
				// if (removing) hotRegisterer.getInstance('hot').alter('insert_row', $scope.dataTable.length, 1);
			}
		},
		afterChange: function (b) {
			if (removing) {
				removing = false;
				return;
			}
			b = !b ? [] : b;
			var changes = [];
			var itemToAdd = [];
			var itemToUpdate = [];
			for (var i = 0; i < b.length; i++) {
				var error = {
					key: false,
					text: false,
				};
				if (b[i][2] != b[i][3]) {
					var valid = true;
					for (var j = 0; j < changes.length; j++) {
						if (changes[j] == b[i][0]) {
							valid = false;
							break;
						}
					}
					if (valid) {
						changes.push(b[i][0]);
						var row = hotRegisterer.getInstance('hot').getSourceDataAtRow(b[i][0]);
						hotRegisterer.getInstance('hot').validateRows(changes, function (res) { });
						if (!row.key) {
							error.key = true;
							if (errors.indexOf($scope.translate('KEY_REQUIRED')) == -1 && b.length != 1) errors.push($scope.translate('KEY_REQUIRED'));
						}
						if (!row.text) {
							error.text = true;
							if (errors.indexOf($scope.translate('TEXT_REQUIRED')) == -1 && b.length != 1) errors.push($scope.translate('TEXT_REQUIRED'));
						}
						if (!row.id) {
							if (error.key || error.text) continue;
							row.row = b[i][0];
							itemToAdd.push(row)
						} else {
							if (error.text || error.text) continue;
							itemToUpdate.push(row);
						}
					}
				}
			};
			if (errors.length > 0) {
				if (timeoutErrors) clearTimeout(timeoutErrors);
				timeoutErrors = setTimeout(function () {
					MyAlert.show(errors);
					errors = [];
				}, 100)
			};
			if (itemToUpdate.length > 0) {
				MyLoading.toast($scope.translate('LOADING') + '...');
				Ordering.bulks_translations.update({
					translations: JSON.stringify(itemToUpdate)
				}, function (res) {
					MyLoading.hide();
					if (!res.error) MyLoading.success($scope.translate('WEB_APP_LANG_SAVED'), 1500);
					else MyAlert.show(res.result);
				})
			}
			if (itemToAdd.length > 0) {
				MyAlert.confirm($scope.translate('QUESTION_ADD_LANGUAGE')).then(function (res) {
					if (res) {
						MyLoading.toast($scope.translate('LOADING') + '...');
						Ordering.bulks_translations.add({
							translations: JSON.stringify(itemToAdd)
						}, function (res) {
							MyLoading.hide();
							if (!res.error) {
								Ordering.translations.all({}, function (res) {
									if (!res.error) {
										$scope.dataTable = res.result;
										$scope.translations = res.result;
									} else MyAlert.show(res.result)
								})
								MyLoading.success($scope.translate('WEB_APP_LANG_ADDED'), 1500);
							} else MyAlert.show(res.result);
						});
					}
				}).catch(function (err) {
					if (err) {
						for (var i = itemToAdd.length - 1; i >= 0; i--) {
							hotRegisterer.getInstance('hot').alter('remove_row', itemToAdd[i].row);
						}
					}
				})
			}
		}
	}
	$(document).ready(function () {
		/***Show Bottom Help***/
		$('[data-toggle="popover"]').popover({ html: true });
		/***Position bottom ButtomHelp***/
		$('#buttonFixed').css({
			'bottom': $('.footer').height() + 15 + 'px',
		});
	});
	Extensions.runAction('enter_languages_editor_view', null, $scope);
});

_controllers.controller('usersSettingsEditorCtrl', function ($scope, $rootScope, $state, MyModal, $timeout, MyAlert, MyLoading, Ordering, GeoCoderSvc, gUser/*newusersSettingsEditorCtrl*/) {
	$scope.curTab = 'users';
	$scope.users = [];
	$scope.filtered = [];
	$scope.filter = '';
	$scope.countries = [];
	$scope.cities = [];
	$scope.neighborhoods = [];
	$scope.business = [];
	$scope.session_user = gUser.getData();
	var curTimeout = null;
	var map = null;
	var marker = null;
	$scope.pagination = {
		current: 1,
		pages: 1,
		items: '10',
		total_items: 0,
		itemsPerPage: [10, 20, 30, 50]
	};
	function getUserLevel() {
		switch ($scope.curTab) {
			case 'owners':
				return 2;
				break;
			case 'citymanager':
				return 1;
				break;
			case 'administrators':
				return 0;
				break;
			default:
				return 3;
				break;
		}
	}
	$scope.loadUsers = function () {
		MyLoading.show();
		var where = {
			conditions: [
				{
					attribute: 'level',
					value: getUserLevel()
				}
			]
		}
		if ($scope.filter) {
			where.conditions.push({
				conector: 'OR',
				conditions: [
					{
						attribute: 'name',
						value: {
							condition: 'ilike',
							value: encodeURI('%' + $scope.filter + '%')
						}
					},
					{
						attribute: 'email',
						value: {
							condition: 'ilike',
							value: encodeURI('%' + $scope.filter + '%')
						}
					}
				]
			})
		}
		Ordering.users.all({
			params: 'name,lastname,email,phone,photo,cellphone,city_id,city,address,address_notes,dropdown_option_id,dropdown_option,location,zipcode,level,enabled,middle_name,second_lastname',
			where: where,
			page: $scope.pagination.current,
			page_size: $scope.pagination.items
		}, function (res) {
			$scope.filtered = res.result;
			$scope.pagination.pages = res.pagination.total_pages;
			$scope.pagination.total_items = res.pagination.total;
			// $scope.filterByType($scope.curTab);
			$scope.initUser();
			MyLoading.hide();
		});
	}
	function initView() {
		$scope.loadUsers();
		Ordering.business.all({
			mode: 'dashboard',
			params: 'name'
		}, function (res) {
			$scope.business = res.result;
		});
		Ordering.countries.all({}, function (res) {
			$scope.countries = res.result;
			for (var i = 0; i < res.result.length; i++) {
				for (var j = 0; j < res.result[i].cities.length; j++) {
					$scope.cities.push(res.result[i].cities[j])
				}
			}
		});
	}
	initView()
	// Ordering.users.all({
	// 	params: 'name,lastname,email,phone,photo,cellphone,city_id,city,address,address_notes,dropdown_option_id,dropdown_option,location,zipcode,level,enabled,middle_name,second_lastname',
	// }, function (res) {
	// 	$scope.users = res.result;
	// 	$scope.filterByType($scope.curTab);
	// 	$scope.initUser();
	// 	Ordering.business.all({
	// 		mode: 'dashboard',
	// 		params: 'name'
	// 	}, function (res) {
	// 		$scope.business = res.result;
	// 	});
	// 	Ordering.countries.all({}, function (res) {
	// 		$scope.countries = res.result;
	// 		for (var i = 0; i < res.result.length; i++) {
	// 			for (var j = 0; j < res.result[i].cities.length; j++) {
	// 				$scope.cities.push(res.result[i].cities[j])
	// 			}
	// 		}
	// 	});
	// 	MyLoading.hide();
	// });
	$scope.exportAll = function () {
		// $scope.usersToCsv($scope.users, 'all_users');
		MyLoading.show($scope.translate('LOADING') + '...');
		Ordering.users.csv({
			mode: 'dashboard',
			orderBy: 'id'
		}, function () {
			MyLoading.hide();
		});
	}
	$scope.exportFiltered = function () {
		var level = null
		switch ($scope.curTab) {
			case 'users':
				level = 3
				break;
			case 'owners':
				level = 2
				break;
			case 'citymanager':
				level = 1
				break;
			case 'administrators':
				level = 0
				break;
			default:
				break;
		}
		var data = {
		}
		var where = [
			{
				attribute: 'level',
				value: level
			}
		]
		if (level != null) {
			data.where = where
		}
		MyLoading.show($scope.translate('LOADING') + '...');
		Ordering.users.csv(data, function () {
			MyLoading.hide();
		});
		// $scope.usersToCsv($scope.filtered, $scope.curTab);
	}

	$scope.initUser = function (user) {
		if (user) {
			$scope.curUser = user;
			if (!user.city) {
				$scope.curUser.city_id = '-1';
				$scope.curUser.country_id = '-1';
			} else {
				if (user.city.country_id) $scope.curUser.country_id = user.city.country_id + '';
				if (user.city.id) $scope.curUser.city_id = user.city.id + '';
			}
			$scope.curUser.image = null;
		} else $scope.curUser = {
			id: -1,
			name: '',
			middle_name: '',
			email: '',
			lastname: '',
			second_lastname: '',
			country_id: '-1',
			city_id: '-1',
			colony: '',
			address: '',
			phone: '',
			enabled: true,
			level: '3',
			zipcode: '',
			location: {},
			image: null,
			businesses: []
		};
	}
	$scope.changeTap = function (tab, $event) {
		if ($event) $event.preventDefault();
		$scope.curTab = tab;
		// $scope.filterByType(tab);
		$scope.pagination.current = 1;
		$scope.loadUsers();
	}
	var timeout = null;
	$scope.changefilterText = function () {
		if (timeout) clearTimeout(timeout)
		timeout = setTimeout(function () {
			$scope.pagination.current = 1;
			$scope.loadUsers()
		}, 1000)
	}
	$scope.filterByType = function (tab) {
		var filtered = [];
		for (var i = 0; i < $scope.users.length; i++) {
			if (tab == 'users' && ($scope.users[i].level == '3' || $scope.users[i].level == null)) filtered.push($scope.users[i]);
			if (tab == 'owners' && $scope.users[i].level == '2') filtered.push($scope.users[i]);
			if (tab == 'citymanager' && $scope.users[i].level == '1') filtered.push($scope.users[i]);
			if (tab == 'administrators' && $scope.users[i].level == '0') filtered.push($scope.users[i]);
		}
		$scope.filtered = filtered;
		$scope.pagination.current = 1;
		$scope.pagination.pages = Math.ceil($scope.filtered.length / $scope.pagination.items);

	}
	$scope.nextPage = function (pagination) {
		if (pagination.current < pagination.pages) pagination.current++;
		$scope.loadUsers()
	}
	$scope.backPage = function (pagination) {
		if (pagination.current > 0) pagination.current--;
		$scope.loadUsers()
	}
	$scope.showUserSettings = function (user) {
		if ($scope.modalOpening) return;
		$scope.modalOpening = true;
		$scope.hideUserSettings();
		var mirror_user = clone(user);
		$scope.initUser(mirror_user);
		if ($scope.curTab == 'users') $scope.curUser.level = '3';
		if ($scope.curTab == 'owners') $scope.curUser.level = '2';
		if ($scope.curTab == 'citymanager') $scope.curUser.level = '1';
		if ($scope.curTab == 'administrators') $scope.curUser.level = '0';
		MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/settings/user-settings.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (user_settings) {
			modals.push(user_settings);
			$scope.user_settings = user_settings;
			$scope.modalOpening = false;
			var address_selected = false;
			user_settings.$el.on('click', function (e) {
				if (user_settings.backdropClickToClose && e.target === user_settings.el) {
					user_settings.hide();
					user_settings.remove();
					$scope.initUser();
				}
			});
			user_settings.scope.check_business = {
				all: true
			};
			user_settings.scope.toggleAllBusiness = function () {
				for (var i = 0; i < $scope.business.length; i++) {
					user_settings.scope.check_business[$scope.business[i].id] = user_settings.scope.check_business.all;
				}
				user_settings.scope.saveBusiness(function (cb) {
					if (cb) {
						var usrIndex = $scope.users.findIndex(function (user) {
							return user.id = $scope.curUser.id
						})
						if (user_settings.scope.check_business.all) {
							$scope.users[usrIndex].businesses = $scope.business;
						} else {
							$scope.users[usrIndex].businesses = [];
						}
					}
				});
			}
			user_settings.scope.toggleBusiness = function (business) {
				var all = true;
				for (var key in user_settings.scope.check_business) {
					if (key != 'all' && !user_settings.scope.check_business[key]) {
						all = false;
						break;
					}
				}
				user_settings.scope.check_business.all = all;
				user_settings.scope.saveBusiness(function (cb) {
					if (cb) {
						if (user_settings.scope.check_business[business.id]) {
							$scope.users.forEach(function (user) {
								if (user.id == $scope.curUser.id) {
									user.businesses.push(business);
								}
							});
						} else {
							for (var i = 0; i < $scope.users.length; i++) {
								if ($scope.users[i].id == $scope.curUser.id) {
									for (var k = 0; k < $scope.users[i].businesses.length; k++) {
										if ($scope.users[i].businesses[k].id == business.id) {
											$scope.users[i].businesses.splice(k, 1);
										}
									}
								}
							}
						}
					}
				});
			}
			user_settings.scope.saveBusiness = function (cb) {
				var checkeds = [];
				for (var key in user_settings.scope.check_business) {
					if (user_settings.scope.check_business[key] && key != 'all')
						checkeds.push(key * 1);
				}
				MyLoading.toast($scope.translate('LOADING') + '...');
				Ordering.users.update({
					id: $scope.curUser.id,
					businesses: JSON.stringify(checkeds)
				}, function (res) {
					MyLoading.hide();
					if (!res.error) {
						cb(true)
						MyLoading.success($scope.translate('BUSINESS_SAVED'), 1500);
					} else {
						MyAlert.show('error');
						cb(false)
					}
				})
			}
			user_settings.show().then(function () {
				user_settings.scope.tab = 0;
				user_settings.scope.changeTab = function (tab) {
					user_settings.scope.tab = tab;
				}
				$timeout(function () {
					var position = { lat: 40.77473399999999, lng: -73.9653844 };
					if (user.location && typeof user.location == 'object' && user.location.lat && user.location.lng) {
						var b_location = user.location;
						position = { lat: b_location.lat, lng: b_location.lng };
						address_selected = true;
					} else {
						user.location = position
					}
					var el = document.getElementById('user-map-street');
					if (el) {
						$scope.map = new google.maps.Map(document.getElementById('user-map-street'), {
							center: position,
							zoom: 16,
							zoomControl: true,
							mapTypeControl: false,
							scaleControl: true,
							streetViewControl: false,
							rotateControl: false,
							fullscreenControl: false
						});
						var input = document.getElementById('user-map-adress');
						input.value = user.address;
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
								$scope.curUser.address = {
									lat: places.geometry.location.lat(),
									lng: places.geometry.location.lng(),
								};
								$scope.curUser.address = input.value;
								address_selected = true;
								// $scope.saveAddress();
							});
						});
						input.onkeydown = function () {
							address_selected = false;
						}
						var timeout = null;
						$scope.map.addListener('center_changed', function () {
							if (timeout) clearTimeout(timeout);
							timeout = setTimeout(function () {
								marker.setPosition($scope.map.getCenter());
								// user.location = {
								// 	lat: $scope.map.getCenter().lat(),
								// 	lng: $scope.map.getCenter().lng(),
								// }
								$scope.$apply(function () {
									$scope.curUser.location = {
										lat: $scope.map.getCenter().lat(),
										lng: $scope.map.getCenter().lng(),
									}
									$scope.curUser.address = input.value;
									// address_selected = true;
									// $scope.saveAddress();
								});
							}, 200);
						});
						// setTimeout(function () {
						// 	$(".pac-container").appendTo(".modal-backdrop");
						// }, 700);
					}
				}, 150);
				if (user.id == -1) Extensions.runAction('enter_users_create_editor_view', null, $scope);
				else Extensions.runAction('enter_users_update_editor_view', null, $scope);
			});

			user_settings.scope.save = function (curUser) {
				if (curUser.address && GOOGLE_AUTOCOMPLETE_SELECTION_REQUIRED && !address_selected) {
					MyAlert.show($scope.translate('SELECT_ADDRESS_FROM_AUTOCOMPLETE'));
				} else {
					if (curUser.id == -1) {
						$scope.addUser(curUser);
					} else {
						$scope.updateUser(curUser);
					}
				}
			}

			// Addresses
			$scope.addresses = [];
			if ($scope.curUser.id > 0) {
				$scope.loading = true;
				Ordering.users.find({
					id: $scope.curUser.id,
					params: 'id,addresses' + ($scope.curUser.level == 2 ? ',businesses' : '')
				}, function (res) {
					$scope.loading = false;
					if (!res.error) {
						Object.assign($scope.curUser, res.result)
						$scope.addresses = res.result.addresses
						// Init businesses
						for (var i = 0; i < $scope.business.length; i++) {
							var check = false;
							if ($scope.curUser.businesses == undefined) $scope.curUser.businesses = [];
							for (var j = 0; j < $scope.curUser.businesses.length; j++) {
								if ($scope.business[i].id == $scope.curUser.businesses[j].id) {
									check = true;
									break;
								}
							}
							if (!check) user_settings.scope.check_business.all = false;
							user_settings.scope.check_business[$scope.business[i].id] = check;
						}
					} else {
						MyAlert(res.result);
					}
				});
			}

			$scope.change = function (address) {
				if (ADDONS.web_template) MyLoading.toast($scope.translate('LOADING') + '...');
				else MyLoading.show($scope.translate('LOADING') + '...');
				Ordering.users.addresses.update({
					id: address.id,
					user_id: $scope.curUser.id,
					default: true
				}, function (res) {
					MyLoading.hide();
					if (!res.error) {
						$scope.addresses.forEach(function (address) {
							if (address.id != res.result.id) {
								address.default = false;
							} else address.default = true;
						});
						if (ADDONS.web_template) MyLoading.success($scope.translate('ADDRESS_CHANGED'), 2000);
					} else MyAlert.show(res.result);
				})
			}

			$scope.edit = function (address) {
				$scope.openFullAddress(address, function (addr, modal) {
					if (ADDONS.web_template) MyLoading.toast($scope.translate('LOADING') + '...');
					else MyLoading.show($scope.translate('LOADING') + '...');
					Ordering.users.addresses.update({
						id: addr.id,
						user_id: $scope.curUser.id,
						name: addr.name,
						middle_name: addr.middle_name,
						lastname: addr.lastname,
						second_lastname: addr.second_lastname,
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
							if (ADDONS.web_template) MyLoading.success($scope.translate('ADDRESS_SAVED'), 2000);
						} else MyAlert.show(res.result);
					}, null, null, true);
				});
			}

			$scope.delete = function (address) {
				MyAlert.confirm($scope.translate('QUESTION_DELETE_ADDRESS')).then(function () {
					MyLoading.toast($scope.translate('LOADING') + '...');
					Ordering.users.addresses.delete({
						id: address.id,
						user_id: $scope.curUser.id
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
							MyLoading.success($scope.translate('ADDRESS_DELETED'), 2000);
						} else MyAlert.show(res.result);
					});
				});
			}

			$scope.add = function () {
				$scope.openFullAddress(null, function (addr, modal) {
					MyLoading.toast($scope.translate('LOADING') + '...');
					Ordering.users.addresses.add({
						user_id: $scope.curUser.id,
						name: addr.name,
						middle_name: addr.middle_name,
						lastname: addr.lastname,
						second_lastname: addr.second_lastname,
						cellphone: addr.cellphone,
						address: addr.address,
						internal_number: addr.internal_number,
						address_notes: addr.address_notes,
						location: JSON.stringify(addr.location),
						zipcode: addr.zipcode,
						map_data: JSON.stringify(addr.map_data),
						tag: addr.tag,
						default: $scope.addresses.length == 0
					}, function (res) {
						MyLoading.hide();
						if (!res.error) {
							$scope.addresses.push(res.result);
							modal.scope.hide();
							MyLoading.success($scope.translate('ADDRESS_SAVED'), 2000);
						} else MyAlert.show(res.result);
					});
				});
			}
			$scope.reviews = [];
			//Reviews
			if ($scope.curUser.id > 0) {
				Ordering.user_reviews.all({
					user_id: $scope.curUser.id,
					mode: 'orders'
				}, function (res) {
					if (!res.error) {
						$scope.reviews = res.result;
						console.log(res.result)
					} else MyAlert(res.result);
				});
			}
		});
	}
	$scope.averageReview = function (reviews) {
		var total = 0;
		reviews.forEach(function (review) {
			total += review.qualification;
		})
		return total / reviews.length;
	}
	$scope.hideUserSettings = function () {
		if ($scope.user_settings) {
			$scope.user_settings.hide();
			$scope.user_settings.remove();
			if (map) google.maps.event.clearInstanceListeners(map);
			map = null;
			marker = null;
			$scope.initUser();
		}
	}
	// $scope.changeAddress = function () {
	// 	if (curTimeout) $timeout.cancel(curTimeout);
	// 	curTimeout = $timeout(function () {
	// 		GeoCoderSvc.getLocationFromAddress($scope.curUser.address).then(function (location) {
	// 			map.setCenter(location);
	// 		});
	// 	}, 500);
	// }
	$scope.checkUser = function (user) {
		if (user.name.trim() == '') return new Error($scope.translate('NAME_REQUIRED'));
		else if (user.email.trim() == '') return new Error($scope.translate('EMAIL_REQUIRED'));
		//else if (user.password.trim() == '') return new Error($scope.translate('PASSWORD_REQUIRED'));
		else if (user.level == '') return new Error($scope.translate('SELECT_TYPE'));
		//else if (user.city.trim() == '') return new Error($scope.translate('SELECT_CITY'));
		//else if (user.street.trim() == '') return new Error($scope.translate('ADDRESS_REQUIRED'));
		//else if (user.cel.trim() == '') return new Error($scope.translate('CELLPHONE_REQUIRED'));
		else return null;
	}
	$scope.updateUser = function (user, details) {
		if (map) {
			user.location = {
				latitud: map.getCenter().lat(),
				longitud: map.getCenter().lng()
			};
		}
		MyLoading.toast($scope.translate('LOADING') + '...');
		Ordering.users.update({
			id: user.id,
			name: user.name,
			middle_name: user.middle_name,
			lastname: user.lastname,
			second_lastname: user.second_lastname,
			email: user.email,
			password: user.password,
			enabled: user.enabled,
			level: user.level,
			zipcode: user.zipcode,
			city_id: user.city_id == -1 ? null : user.city_id,
			cellphone: user.cellphone,
			phone: user.phone,
			location: JSON.stringify(user.location),
			address: user.address,
			photo: user.image
		}, function (res) {
			MyLoading.hide();
			if (!res.error) {
				if (!details) Object.assign(user, res.result);
				user.city = res.result.city;
				for (var i = 0; i < $scope.users.length; i++) {
					if ($scope.users[i].id == res.result.id) {
						Object.assign($scope.users[i], res.result);
						break;
					}
				}
				$scope.hideUserSettings();
				MyLoading.success($scope.translate('USER_SAVED'), 1500);
			} else MyAlert.show(res.result);
		});
	}
	$scope.addUser = function (user) {
		var error = $scope.checkUser(user);
		if (error) MyAlert.show(error.message);
		else {
			if (map) {
				user.location = {
					latitud: map.getCenter().lat(),
					longitud: map.getCenter().lng()
				};
			}
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.users.add({
				name: user.name,
				middle_name: user.middle_name,
				email: user.email,
				lastname: user.lastname,
				second_lastname: user.second_lastname,
				password: user.password,
				cellphone: user.cellphone,
				phone: user.phone,
				zipcode: user.zipcode,
				enabled: user.enabled,
				level: user.level,
				city_id: user.city_id == -1 ? null : user.city_id,
				address: user.address,
				location: JSON.stringify(user.location),
				photo: user.image
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					$scope.users.push(res.result);
					$scope.filterByType($scope.curTab);
					$scope.hideUserSettings();
					MyLoading.success($scope.translate('USER_ADDED'), 1500);
				} else MyAlert.show(res.result);
			});
		}
	}
	$scope.changeUserState = function (user) {
		MyLoading.toast($scope.translate('LOADING') + '...');
		Ordering.users.update({
			id: user.id,
			enabled: user.enabled,
		}, function (res) {
			MyLoading.hide();
			if (!res.error) {
				MyLoading.success($scope.translate('USER_SAVED'), 1500);
			} else MyAlert.show(res.result);
		});
	}
	$scope.changeUserData = function (user, now) {
		var time = 0;
		function validateEmail(email) {
			var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return re.test(email);
		}
		if (now) time = 0;
		if (curTimeout) $timeout.cancel(curTimeout);
		curTimeout = $timeout(function () {
			if (validateEmail(user.email)) $scope.updateUser(user, true);
		}, time);
	}
	$scope.removeUser = function (user) {
		var curUser = gUser.getData();
		if (user.id == curUser.id) {
			MyAlert.show($scope.translate('USER_SELF_DELETE'))
		} else {
			MyAlert.confirm($scope.translate('QUESTION_DELETE_USER')).then(function (res) {
				MyLoading.toast($scope.translate('LOADING') + '...');
				Ordering.users.delete({
					id: user.id
				}, function (res) {
					MyLoading.hide();
					if (!res.error) {
						for (var i = 0; i < $scope.users.length; i++) {
							if ($scope.users[i].id == user.id) $scope.users.splice(i, 1);
						}
						$scope.filterByType($scope.curTab);
						MyLoading.success($scope.translate('USER_DELETED'), 2000);
					} else MyAlert.show(res.result);
				});
			});
		}
	}
	$(document).ready(function () {
		/***Show Bottom Help***/
		$('[data-toggle="popover"]').popover({ html: true });
		/***Position bottom ButtomHelp***/
		$('#buttonFixed').css({
			'bottom': $('.footer').height() + 15 + 'px',
		});
	});
	Extensions.runAction('enter_users_editor_view', null, $scope);
});

_controllers.controller('businessTypesEditorCtrl', function ($scope, $rootScope, $state, MyModal, $timeout, MyAlert, MyLoading, Ordering, GeoCoderSvc, gUser) {
	$scope.newBusinessType = {
		id: -1,
		name: '',
		description: '',
		enabled: true
	}
	$scope.businessTypes = []
	$scope.businessTypesPagination = {
		current: 1,
		pages: 1,
		items: '10',
		itemsPerPage: [10, 20, 30, 40, 50],
	};
	$scope.filterBusinessType = '';
	$scope.filteredBusinessTypes = []

	MyLoading.show();
	Ordering.business_types.all({}, function (res) {
		console.log(res)
		$scope.businessTypes = res.result;
		$scope.filteredBusinessTypes = res.result;
		$scope.businessTypesPagination.pages = Math.floor($scope.filteredBusinessTypes.length / parseInt($scope.businessTypesPagination.items)) + 1
		MyLoading.hide();
	});

	$scope.nextPage = function (pagination) {
		if (pagination.current < pagination.pages) pagination.current++;
	}
	$scope.backPage = function (pagination) {
		if (pagination.current > 0) pagination.current--;
	}

	$scope.editBusinessType = function (businessType) {
		$scope.businessType = businessType;
		if ($scope.modalOpening) return;
		$scope.modalOpening = true;
		MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/settings/business-type-settings.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (business_type_settings) {
			modals.push(business_type_settings);
			$scope.business_type_settings = business_type_settings;
			$scope.business_type_settings.show();
			$scope.modalOpening = false;
			Extensions.runAction('after_business_types_view', businessType, $scope);
		});
	};

	$scope.updateFilteredBusinessTypes = function () {
		$scope.filteredBusinessTypes = $scope.businessTypes.filter(function (businessType) {
			return businessType.name.toLowerCase().includes($scope.filterBusinessType.toLowerCase());
		})
	}

	$scope.addBusinessType = function (businessType) {
		MyLoading.toast($scope.translate('LOADING') + '...');
		Ordering.business_types.add(businessType, function (res) {
			console.log(res);
			MyLoading.hide();
			if (!res.error) {
				$scope.hideBusinessTypeSettings();
				$scope.businessTypes.push(res.result);
				MyLoading.success($scope.translate('BUSINESS_TYPE_ADDED'), 1500);
				$scope.updateFilteredBusinessTypes()
				$scope.initBusinessType();
			} else MyAlert.show(res.result);
		})
	}

	$scope.removeBusinessType = function (businessType) {
		MyAlert.confirm($scope.translate('QUESTION_DELETE_BUSINESS_TYPE')).then(function (res) {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.business_types.delete(businessType, function (res) {
				MyLoading.hide();
				if (!res.error) {
					for (var i = 0; i < $scope.businessTypes.length; i++) {
						if ($scope.businessTypes[i].id == businessType.id) $scope.businessTypes.splice(i, 1);
					}
					MyLoading.success($scope.translate('BUSINESS_TYPE_DELETED'), 1500);
				} else {
					MyAlert.show(res.error)
				}
			})
		});
	}
	var typesTimeout = null;
	$scope.updateBusinessType = function (businessType) {
		if (typesTimeout) clearTimeout(typesTimeout);
		typesTimeout = setTimeout(function () {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.business_types.update(businessType, function (res) {
				MyLoading.hide();
				if (!res.error) {
					$scope.hideBusinessTypeSettings();
					MyLoading.success($scope.translate('BUSINESS_TYPE_SAVED'), 1500);
				} else MyAlert.show(res.result);
			})
		}, 1000);
	}

	$scope.hideBusinessTypeSettings = function () {
		if ($scope.business_type_settings) {
			$scope.business_type_settings.hide();
			$scope.business_type_settings.remove();
			$scope.initBusinessType();
		}
	};

	$scope.initBusinessType = function () {
		$scope.newBusinessType = {
			id: -1,
			name: '',
			description: '',
			enabled: true,
		};
	}
});

_controllers.controller('multiDeliveryZonesSettingsEditorCtrl', function ($scope, $rootScope, $state, $ionicModal, $timeout, MyAlert, MyLoading, Ordering, gUser/*newmultiDeliveryZonesSettingsEditorCtrl*/) {
	//if (SEARCH_BY_ADDRESS) location.href = (!WEB_ADDONS.remove_hash?'#':'')+'/settings/general';
	$scope.curUser = gUser.getData();
	$scope.multideliveryzones = [];
	$scope.dropdownoptions = [];
	$scope.countries = [];
	$scope.cities = [];
	$scope.business = [];
	$scope.filterNeig = '';
	$scope.filterMulti = '';
	$scope.curDropdownoptions = {};
	$scope.curMultideliveryzone = {};
	var curTimeout = null;
	MyLoading.show();
	Ordering.countries.all({}, function (res) {
		MyLoading.show();
		$scope.countries = res.result;
		for (var i = 0; i < res.result.length; i++) {
			for (var j = 0; j < res.result[i].cities.length; j++) {
				$scope.cities.push(res.result[i].cities[j])
				for (var k = 0; k < res.result[i].cities[j].options.length; k++) {
					$scope.dropdownoptions.push(res.result[i].cities[j].options[k])
				}
			}
		}
	});
	$scope.neigpagination = {
		current: 1,
		pages: 1,
		items: 10,
		itemsPerPage: [10, 20, 30, 50]
	}
	$scope.multipagination = {
		current: 1,
		pages: 1,
		items: 10,
		itemsPerPage: [10, 20, 30, 50]
	}
	$scope.nextPage = function (pagination) {
		if (pagination.current < pagination.pages) pagination.current++;
	}
	$scope.backPage = function (pagination) {
		if (pagination.current > 0) pagination.current--;
	}
	$scope.initNeighborhood = function (neighborhood) {
		if (neighborhood) {
			$scope.curDropdownoptions = neighborhood;
			if (!neighborhood.city_id) {
				$scope.curDropdownoptions.city_id = '-1';
				$scope.curDropdownoptions.id = '-1';
				$scope.curDropdownoptions.country = '-1';
			} else {
				for (var i = 0; i < $scope.cities.length; i++) {
					if ($scope.cities[i].id = $scope.curDropdownoptions.city_id) {
						$scope.curDropdownoptions.country = $scope.cities[i].country_id;
						break;
					}
				}
			}
			console.log($scope.curDropdownoptions)
		}
		else {
			$scope.curDropdownoptions = {
				city_id: "-1",
				country: "-1",
				enabled: true,
				id: -1,
				name: ""
			};
		}
	}
	$scope.showNeighborhoodSettings = function (neighborhood) {
		if ($scope.modalOpening) return;
		$scope.modalOpening = true;
		$scope.hideNeighborhoodSettings();
		$scope.initNeighborhood(neighborhood);
		$ionicModal.fromTemplateUrl('templates/' + ADDONS.template + '/views/editor/settings/neighborhood-settings.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (neighborhood_settings) {
			modals.push(neighborhood_settings);
			$scope.neighborhood_settings = neighborhood_settings;
			$scope.neighborhood_settings.show();
			$scope.modalOpening = false;
		});
	}

	$scope.hideNeighborhoodSettings = function () {
		if ($scope.neighborhood_settings) {
			$scope.neighborhood_settings.hide();
			$scope.neighborhood_settings.remove();
			$scope.initNeighborhood();
		}
	}
	$scope.checkNeighborhood = function (dropdownoption) {
		if (dropdownoption.name.trim() == '') return new Error($scope.translate('NAME_REQUIRED'));
		else return null;
	}
	$scope.changeNeighborhood = function (neighborhood, now) {
		var time = 0;
		if (now) time = 0;
		if (curTimeout) $timeout.cancel(curTimeout);
		curTimeout = $timeout(function () {
			if (!$scope.checkNeighborhood(neighborhood)) $scope.updateNeighborhood(neighborhood);
		}, time);
	}
	$scope.updateNeighborhood = function (neighborhood) {
		var error = $scope.checkNeighborhood(neighborhood);
		if (error) MyAlert.show(error.message);
		else {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.dropdownoptions.update({
				id: neighborhood.id,
				city_id: neighborhood.city,
				name: neighborhood.name,
				enabled: neighborhood.enabled
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					$scope.hideNeighborhoodSettings();
					MyLoading.success($scope.translate('NEIGHBORHOOD_SAVED'), 1500);
				} else MyAlert.show(res.result);
			});
		}
	}
	$scope.addNeighborhood = function (neighborhood) {
		var error = $scope.checkNeighborhood(neighborhood);
		if (error) MyAlert.show(error.message);
		else {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.dropdownoptions.add({
				city_id: neighborhood.city_id,
				name: neighborhood.name,
				enabled: true
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					$scope.dropdownoptions.push(res.result);
					$scope.hideNeighborhoodSettings();
					MyLoading.success($scope.translate('NEIGHBORHOOD_ADDED'), 1500);
				} else MyAlert.show(res.result);
			});
		}
		$scope.curNeighborhood.name = "";
	}
	$scope.removeNeighborhood = function (neighborhood) {
		MyAlert.confirm($scope.translate('QUESTION_DELETE_NEIGHBORHOOD')).then(function (res) {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.dropdownoptions.delete({
				id: neighborhood.id
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					for (var i = 0; i < $scope.dropdownoptions.length; i++) {
						if ($scope.dropdownoptions[i].id == neighborhood.id) $scope.dropdownoptions.splice(i, 1);
					}
					MyLoading.success($scope.translate('NEIGHBORHOOD_DELETED'), 1500);
				} else MyAlert.show(res.result);
			});
		});
	}
	/* Zones */
	$scope.initMultideliveryzone = function (multideliveryzone) {
		if (multideliveryzone) $scope.curMultideliveryzone = multideliveryzone;
		else {
			$scope.curMultideliveryzone = {
				area: [],
				business: [],
				days: "[0]",
				delivery_price: "",
				enabled: true,
				id: -1,
				minimum_purchase: "",
				schedule: '{"opens":{"hour":"0","minute":"0"},"closes":{"hour":"24","minute":"0"}}',
				zone_name: ""
			};
		}
	}
	$scope.toggleAll = function (multideliveryzone) {
		for (key in multideliveryzone.check_business) {
			if (key != '') multideliveryzone.check_business[key] = multideliveryzone.check_business[0];
		}
	}
	$scope.toggleBusiness = function (multideliveryzone) {
		for (key in multideliveryzone.check_business) {
			if (key != '' && !multideliveryzone.check_business[key]) {
				multideliveryzone.check_business[0] = false;
				break;
			}
		}
	}
	$scope.showMultideliveryzoneSettings = function (multideliveryzone) {
		if ($scope.modalOpening) return;
		$scope.modalOpening = true;
		$scope.hideMultideliveryzoneSettings();
		$scope.initMultideliveryzone(multideliveryzone);
		MyLoading.toast($scope.translate('LOADING') + '...');
		DashboardSvc.business().get({
			langId: localStorageApp.getItem(STORE.LANG)
		}, function (res) {
			$scope.business = res.result.business;
			multideliveryzone.check_business = {};
			if (multideliveryzone.business[0] == '-1') multideliveryzone.check_business[0] = true;
			for (var i = 0; i < $scope.business.length; i++) {
				multideliveryzone.check_business[$scope.business[i].id] = (multideliveryzone.business.indexOf($scope.business[i].id) != -1 || multideliveryzone.business[0] == '-1');
			}
			multideliveryzone.check_area = {};
			for (var i = 0; i < $scope.neighborhoods.length; i++) {
				multideliveryzone.check_area[$scope.neighborhoods[i].id] = multideliveryzone.area.indexOf($scope.neighborhoods[i].id) != -1;
			}
			console.log(multideliveryzone);
			$ionicModal.fromTemplateUrl('templates/' + ADDONS.template + '/views/editor/settings/multideliveryzone-settings.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function (multideliveryzone_settings) {
				modals.push(multideliveryzone_settings);
				$scope.multideliveryzone_settings = multideliveryzone_settings;
				$scope.multideliveryzone_settings.show();
				$scope.modalOpening = false;
				MyLoading.hide();
			});
		});
	}
	$scope.hideMultideliveryzoneSettings = function () {
		if ($scope.multideliveryzone_settings) {
			$scope.multideliveryzone_settings.hide();
			$scope.multideliveryzone_settings.remove();
			$scope.initMultideliveryzone();
		}
	}
	$scope.checkMultideliveryzone = function (multideliveryzone) {
		if (multideliveryzone.zone_name.trim() == '') return new Error($scope.translate('NAME_REQUIRED'));
		else if (multideliveryzone.delivery_price.trim() == '') return new Error($scope.translate('DELIVERY_PRICE_REQUIRED'));
		else if (multideliveryzone.minimum_purchase.trim() == '') return new Error($scope.translate('MINIMUN_PURCHASED_REQUIRED'));
		else if (multideliveryzone.area.length == 0) return new Error($scope.translate('SELECT_LEAST_ONE_AREA'));
		else if (multideliveryzone.business.length == 0) return new Error($scope.translate('SELECT_LEAST_ONE_BUSINESS'));
		else return null;
	}
	$scope.changeMultideliveryzone = function (multideliveryzone, now) {
		var time = 0;
		if (now) time = 0;
		if (curTimeout) $timeout.cancel(curTimeout);
		curTimeout = $timeout(function () {
			if (!$scope.checkMultideliveryzone(multideliveryzone)) $scope.updateMultideliveryzone(multideliveryzone);
		}, time);
	}
	$scope.updateMultideliveryzone = function (multideliveryzone) {
		if (multideliveryzone.check_business) {
			var business = [];
			if (multideliveryzone.check_business[0]) business.push('-1');
			else {
				for (var key in multideliveryzone.check_business) {
					if (multideliveryzone.check_business[key]) business.push(key + '');
				}
			}
			multideliveryzone.business = business;
		}
		if (multideliveryzone.check_area) {
			var area = [];
			for (var key in multideliveryzone.check_area) {
				if (multideliveryzone.check_area[key]) area.push(key + '');
			}
			multideliveryzone.area = area;
		}
		var error = $scope.checkMultideliveryzone(multideliveryzone);
		if (error) MyAlert.show(error.message);
		else {
			MyLoading.toast($scope.translate('LOADING') + '...');
			DashboardSvc.multideliveryzones().update({
				langId: localStorageApp.getItem(STORE.LANG),
				Id: multideliveryzone.id,
				zonename: multideliveryzone.zone_name,
				deliveryprice: multideliveryzone.delivery_price,
				minpurchase: multideliveryzone.minimum_purchase,
				businessId: JSON.stringify(multideliveryzone.business),
				area: JSON.stringify(multideliveryzone.area),
				status: multideliveryzone.enabled ? 1 : 0,
				schedule: multideliveryzone.schedule,
				days: multideliveryzone.days
			}, function (res) {
				MyLoading.hide();
				if (res.error == 'false') {
					$scope.hideMultideliveryzoneSettings();
					MyLoading.success($scope.translate('MULTI_DELIVERY_ZONE_SAVED'), 1500);
				} else MyAlert.show(res.message);
			});
		}
	}
	$scope.addMultideliveryzone = function (multideliveryzone) {
		if (multideliveryzone.check_business) {
			var business = [];
			if (multideliveryzone.check_business[0]) business.push('-1');
			else {
				for (var key in multideliveryzone.check_business) {
					if (multideliveryzone.check_business[key]) business.push(key + '');
				}
			}
			multideliveryzone.business = business;
		}
		if (multideliveryzone.check_area) {
			var area = [];
			for (var key in multideliveryzone.check_area) {
				if (multideliveryzone.check_area[key]) area.push(key + '');
			}
			multideliveryzone.area = area;
		}
		var error = $scope.checkMultideliveryzone(multideliveryzone);
		if (error) MyAlert.show(error.message);
		else {
			MyLoading.toast($scope.translate('LOADING') + '...');
			DashboardSvc.multideliveryzones().add({
				langId: localStorageApp.getItem(STORE.LANG),
				zonename: multideliveryzone.zone_name,
				deliveryprice: multideliveryzone.delivery_price,
				minpurchase: multideliveryzone.minimum_purchase,
				businessId: JSON.stringify(multideliveryzone.business),
				area: JSON.stringify(multideliveryzone.area),
				schedule: multideliveryzone.schedule,
				days: multideliveryzone.days
			}, function (res) {
				MyLoading.hide();
				if (res.error == 'false') {
					multideliveryzone.id = res.result.deliveryneighborhood.id;
					$scope.multideliveryzones.push(multideliveryzone);
					$scope.hideMultideliveryzoneSettings();
					MyLoading.success($scope.translate('MULTI_DELIVERY_ZONE_ADDED'), 1500);
				} else MyAlert.show(res.message);
			});
		}
	}
	$scope.removeMultideliveryzone = function (multideliveryzone) {
		MyAlert.confirm($scope.translate('QUESTION_DELETE_MULTI_DELIVERY_ZONE')).then(function (res) {
			MyLoading.toast($scope.translate('LOADING') + '...');
			DashboardSvc.multideliveryzones().delete({
				neighborhoodId: multideliveryzone.id
			}, function (res) {
				MyLoading.hide();
				if (res.error == 'false') {
					for (var i = 0; i < $scope.multideliveryzones.length; i++) {
						if ($scope.multideliveryzones[i].id == multideliveryzone.id) $scope.multideliveryzones.splice(i, 1);
					}
					MyLoading.success($scope.translate('MULTI_DELIVERY_ZONE_DELETED'), 1500);
				} else MyAlert.show(res.message);
			});
		});
	}
	/* End Zones */
	$scope.$on('modal.hidden', function (event) {
		$scope.initNeighborhood();
		$scope.initMultideliveryzone();
	});

	Extensions.runAction('enter_dropdown_options_editor_view', null, $scope);
});

_controllers.controller('placesSettingsEditorCtrl', function ($scope, $rootScope, $state, MyModal, $timeout, MyAlert, MyLoading, Ordering, $ionicModal/*newplacesSettingsEditorCtrl*/) {
	$scope.countries = [];
	$scope.cities = [];
	$scope.users = [];
	$scope.curCountry = {};
	$scope.curCity = {};
	$scope.dropdownoptions = [];
	$scope.curDropdownoptions = {};
	var curTimeout = null;
	MyLoading.show();
	Ordering.users.all({
		params: 'name,level'
	}, function (res) {
		$scope.users = res.result;
		Ordering.countries.all({}, function (res) {
			MyLoading.hide();
			$scope.countries = res.result;
			$scope.coupagination.pages = Math.ceil($scope.countries.length / $scope.coupagination.items);
			$scope.cities = [];
			for (var i = 0; i < res.result.length; i++) {
				for (var j = 0; j < res.result[i].cities.length; j++) {
					$scope.cities.push(res.result[i].cities[j])
					for (var k = 0; k < res.result[i].cities[j].options.length; k++) {
						$scope.dropdownoptions.push(res.result[i].cities[j].options[k])
					}
				}
			}
			$scope.citpagination.pages = Math.ceil($scope.cities.length / $scope.citpagination.items);
			$scope.neigpagination.pages = Math.ceil($scope.dropdownoptions.length / $scope.neigpagination.items);
			$scope.initCountry();
			$scope.initCity();
			$scope.initNeighborhood();
		});
	});
	$scope.coupagination = {
		current: 1,
		pages: 1,
		items: 10,
		itemsPerPage: [10, 20, 30, 50]
	}
	$scope.citpagination = {
		current: 1,
		pages: 1,
		items: '10',
		itemsPerPage: [10, 20, 30, 50]
	}
	$scope.neigpagination = {
		current: 1,
		pages: 1,
		items: 10,
		itemsPerPage: [10, 20, 30, 50]
	}
	$scope.nextPage = function (pagination) {
		if (pagination.current < pagination.pages) pagination.current++;
	}
	$scope.backPage = function (pagination) {
		if (pagination.current > 0) pagination.current--;
	}
	$scope.initCountry = function (country) {
		if (country) $scope.curCountry = country;
		else $scope.curCountry = {
			enabled: true,
			id: -1,
			name: ""
		};
	}
	$scope.initCity = function (city) {
		if (city) $scope.curCity = city;
		else $scope.curCity = {
			admin: "",
			country_id: "",
			enabled: true,
			id: -1,
			name: "",
			timezone: ""
		};
	}
	$scope.initNeighborhood = function (neighborhood) {
		if (neighborhood) {
			$scope.curDropdownoptions = neighborhood;
			if (!neighborhood.city_id) {
				$scope.curDropdownoptions.city_id = '-1';
				$scope.curDropdownoptions.id = '-1';
				$scope.curDropdownoptions.country = '-1';
			} else {
				for (var i = 0; i < $scope.cities.length; i++) {
					if ($scope.cities[i].id = $scope.curDropdownoptions.city_id) {
						$scope.curDropdownoptions.country = $scope.cities[i].country_id;
						break;
					}
				}
			}
			console.log($scope.curDropdownoptions)
		}
		else {
			$scope.curDropdownoptions = {
				city_id: "-1",
				country: "-1",
				enabled: true,
				id: -1,
				name: ""
			};
		}
	}
	$scope.addCountry = function (country) {
		MyLoading.toast($scope.translate('LOADING') + '...');
		Ordering.countries.add({
			name: country.name
		}, function (res) {
			MyLoading.hide();
			if (!res.error) {
				res.result.enabled = true;
				res.result.cities = [];
				$scope.countries.push(res.result);
				$scope.initCountry();
				MyLoading.success($scope.translate('COUNTRY_ADDED'), 1500);
			} else MyAlert.show(res.result);
		});
	}
	$scope.updateCountry = function (country) {
		var time = 0;
		if (curTimeout) $timeout.cancel(curTimeout);
		curTimeout = $timeout(function () {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.countries.update({
				id: country.id,
				name: country.name,
				enabled: country.enabled
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					MyLoading.success($scope.translate('COUNTRY_SAVED'));
				} else MyAlert.show(res.result);
			});
		}, time);
	}
	$scope.removeCountry = function (country) {
		MyAlert.confirm($scope.translate('QUESTION_DELETE_COUNTRY')).then(function (res) {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.countries.delete({
				id: country.id
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					for (var i = 0; i < $scope.countries.length; i++) {
						if ($scope.countries[i].id == country.id) $scope.countries.splice(i, 1);
					}
					var cities = [];
					for (var i = 0; i < $scope.countries.length; i++) {
						cities = cities.concat($scope.countries[i].cities);
					}
					MyLoading.success($scope.translate('COUNTRY_DELETED'), 1500);
					$scope.cities = cities;
				} else MyAlert.show(res.message);
			});
		});
	}
	$scope.showCitySettings = function (city) {
		if ($scope.modalOpening) return;
		$scope.modalOpening = true;
		$scope.hideCitySettings();
		$scope.initCity(city);
		if (city.administrator_id) city.administrator_id = city.administrator_id + '';
		else city.administrator_id = '';
		MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/settings/city-settings.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (city_settings) {
			modals.push(city_settings);
			$scope.city_settings = city_settings;
			$scope.city_settings.show();
			$scope.modalOpening = false;
		});
	}
	$scope.hideCitySettings = function () {
		if ($scope.city_settings) {
			$scope.city_settings.hide();
			$scope.city_settings.remove();
			$scope.initCity();
		}
	}
	$scope.checkCity = function (city) {
		if (city.country_id == '') return new Error($scope.translate('SELECT_COUNTRY'));
		else return null;
	}
	$scope.changeCity = function (city, now) {
		var time = 0;
		if (now) time = 0;
		if (curTimeout) $timeout.cancel(curTimeout);
		curTimeout = $timeout(function () {
			if (!$scope.checkCity(city)) $scope.updateCity(city);
		}, time);
	}
	$scope.updateCity = function (city) {
		var error = $scope.checkCity(city);
		if (error) MyAlert.show(error.message);
		else {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.cities.update({
				id: city.id,
				name: city.name,
				country_id: city.country_id,
				administrator_id: $scope.curCity.administrator_id,
				enabled: city.enabled,
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					$scope.hideCitySettings();
					MyLoading.success($scope.translate('CITY_SAVED'), 1500);
				} else MyAlert.show(res.result);
			});
		}
	}
	$scope.addCity = function (city) {
		if ($scope.checkCity(city)) return MyAlert.show($scope.checkCity(city).message);
		MyLoading.toast($scope.translate('LOADING') + '...');
		Ordering.cities.add({
			country_id: city.country_id,
			name: city.name,
			administrator_id: city.administrator_id
		}, function (res) {
			MyLoading.hide();
			if (!res.error) {
				$scope.hideCitySettings();
				res.result.enabled = true;
				res.result.country_id = res.result.country_id * 1;
				$scope.cities.push(res.result);
				for (var i = 0; i < $scope.countries.length; i++) {
					if ($scope.countries[i].id == res.result.country_id) $scope.countries[i].cities.push(res.result);
				}
				MyLoading.success($scope.translate('CITY_ADDED'), 1500);
			} else MyAlert.show(res.result);
		});
	}
	$scope.removeCity = function (city) {
		MyAlert.confirm($scope.translate('QUESTION_DELETE_CITY')).then(function (res) {
			MyLoading.toast($scope.translate('LOADING') + '...');
			console.log(city)
			Ordering.cities.delete({
				id: city.id,
				country_id: city.country_id,
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					for (var i = 0; i < $scope.cities.length; i++) {
						if ($scope.cities[i].id == city.id) $scope.cities.splice(i, 1);
					}
					MyLoading.success($scope.translate('CITY_DELETED'), 1500);
				} else MyAlert.show(res.result);
			});
		});
	}
	$scope.showNeighborhoodSettings = function (neighborhood) {
		if ($scope.modalOpening) return;
		$scope.modalOpening = true;
		$scope.hideNeighborhoodSettings();
		$scope.initNeighborhood(neighborhood);
		$ionicModal.fromTemplateUrl('templates/' + ADDONS.template + '/views/editor/settings/neighborhood-settings.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (neighborhood_settings) {
			modals.push(neighborhood_settings);
			$scope.neighborhood_settings = neighborhood_settings;
			$scope.neighborhood_settings.show();
			$scope.modalOpening = false;
		});
	}
	$scope.hideNeighborhoodSettings = function () {
		if ($scope.neighborhood_settings) {
			$scope.neighborhood_settings.hide();
			$scope.neighborhood_settings.remove();
			$scope.initNeighborhood();
		}
	}
	$scope.addNeighborhood = function (neighborhood) {
		var error = $scope.checkNeighborhood(neighborhood);
		if (error) MyAlert.show(error.message);
		else {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.dropdownoptions.add({
				city_id: neighborhood.city_id,
				name: neighborhood.name,
				enabled: true
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					$scope.dropdownoptions.push(res.result);
					$scope.hideNeighborhoodSettings();
					MyLoading.success($scope.translate('NEIGHBORHOOD_ADDED'), 1500);
				} else MyAlert.show(res.result);
			});
		}
		$scope.curNeighborhood.name = "";
	}
	$scope.updateNeighborhood = function (neighborhood) {
		var error = $scope.checkNeighborhood(neighborhood);
		if (error) MyAlert.show(error.message);
		else {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.dropdownoptions.update({
				id: neighborhood.id,
				city_id: neighborhood.city,
				name: neighborhood.name,
				enabled: neighborhood.enabled
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					$scope.hideNeighborhoodSettings();
					MyLoading.success($scope.translate('NEIGHBORHOOD_SAVED'), 1500);
				} else MyAlert.show(res.result);
			});
		}
	}
	$scope.removeNeighborhood = function (neighborhood) {
		MyAlert.confirm($scope.translate('QUESTION_DELETE_NEIGHBORHOOD')).then(function (res) {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.dropdownoptions.delete({
				id: neighborhood.id
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					for (var i = 0; i < $scope.dropdownoptions.length; i++) {
						if ($scope.dropdownoptions[i].id == neighborhood.id) $scope.dropdownoptions.splice(i, 1);
					}
					MyLoading.success($scope.translate('NEIGHBORHOOD_DELETED'), 1500);
				} else MyAlert.show(res.result);
			});
		});
	}
	$scope.checkNeighborhood = function (dropdownoption) {
		if (dropdownoption.name.trim() == '') return new Error($scope.translate('NAME_REQUIRED'));
		else return null;
	}

	$scope.$on('modal.hidden', function (event) {
		$scope.initCity();
	});
	$(document).ready(function () {
		/***Show Bottom Help***/
		$('[data-toggle="popover"]').popover({ html: true });
		/***Position bottom ButtomHelp***/
		$('#buttonFixed').css({
			'bottom': $('.footer').height() + 15 + 'px',
		});
	});
	Extensions.runAction('enter_places_editor_view', null, $scope);
});

_controllers.controller('channelsSettingsEditorCtrl', function ($scope, $rootScope) {
	$scope.type = 'modal';
	var url = window.location.origin + '/';
	// $scope.widget_popup = '<script type="text/javascript">window.onload=function(){function e(e,t){return e===!0||e===!1?e:t}function t(){return navigator.userAgent.match(/Android/i)||navigator.userAgent.match(/webOS/i)||navigator.userAgent.match(/iPhone/i)||navigator.userAgent.match(/iPad/i)||navigator.userAgent.match(/iPod/i)||navigator.userAgent.match(/BlackBerry/i)||navigator.userAgent.match(/Windows Phone/i)?!0:!1}function i(){return navigator.userAgent.match(/iPad/i)?"iPad":navigator.userAgent.match(/iPhone/i)?"iPhone":void 0}function n(){r?(console.log("onresize"),l.style.height="auto",l.style.width="auto",window.innerWidth<=480?(l.style.right=0,l.style.left=0,l.style.top=0,l.style.bottom=0,l.style.borderRadius=0):(window.innerWidth>480&&window.innerWidth<600?(l.style.left="5%",l.style.right="5%"):(l.style.left="5%",l.style.right="5%"),l.style.top="5%",l.style.bottom="5%",l.style.borderRadius="5px")):(l.style.height="0px",l.style.width="0px")}var o="'+url+'";"undefined"==typeof orderingSettings&&(orderingSettings={});var s=orderingSettings,d={openOnMobile:e(s.openOnMobile,!1),openOnDesktop:e(s.openOnDesktop,!1)},r=!1,l=document.createElement("div");l.id="ordering_bot",l.style.height=0,l.style.width=0,l.style.position="fixed",l.style.right="5%",l.style.left="5%",l.style.top="5%",l.style.bottom="5%",l.style.borderRadius="5px",l.style.overflow="hidden",l.style.zIndex=99999,l.style.maxheight=window.innerHeight+"px",l.style["-webkit-transition"]="height 0.5s, width 0.5s",l.style["-moz-transition"]="height 0.5s, width 0.5s",l.style["-ms-transition"]="height 0.5s, width 0.5s",l.style["-o-transition"]="height 0.5s, width 0.5s",l.style.transition="height 0.5s, width 0.5s",l.style.boxShadow="0 0 20px 0 #999";var a={insideIframe:!1};l.addEventListener("mouseenter",function(){a.insideIframe=!0,a.scrollX=window.scrollX,a.scrollY=window.scrollY,t()||(document.body.style.overflow="hidden")}),l.addEventListener("mouseleave",function(){a.insideIframe=!1,t()||(document.body.style.overflow="auto")}),document.addEventListener("scroll",function(e){a.insideIframe&&(e.preventDefault(),window.scrollTo(0,0))});var h=document.createElement("div");h.style.height="40px",h.style.background="#F5F5F5",h.style.width="100%",h.style.position="absolute";var y=document.createElement("div");y.style.height="50px",y.style.width="50px",y.style["float"]="right",y.style.fontSize="28px",y.style.lineHeight="25px",y.style.padding="5px",y.style.textAlign="center",y.style.boxSizing="border-box",y.style.color="#666",y.style.cursor="pointer",y.innerHTML="&times;",h.appendChild(y);var g=document.createElement("iframe");g.id="ordering_iframe",g.src=o,g.setAttribute("allow", "geolocation"),g.style.border=0,g.style.height="100%",g.style.width="100%",g.style.maxWidth="none",g.style.paddingTop="40px",g.style.boxSizing="border-box",l.appendChild(h),l.appendChild(g),document.getElementsByTagName("body")[0].appendChild(l),window.toggleOrderingWidget=function(){r=!r,r?t()&&(a.insideIframe=!0,document.body.style.overflow="hidden",document.body.style.height=window.innerHeight-150+"px"):t()&&(a.insideIframe=!1,document.body.style.overflow="auto",document.body.style.height="auto"),n()},n(),window.onresize=n,(t()&&d.openOnMobile&&!i()||!t()&&d.openOnDesktop)&&toggleOrderingWidget(),y.addEventListener("click",toggleOrderingWidget)};</script>';
	$scope.widget_popup = '<script type="text/javascript">window.onload=function(){function e(e,t){return!0===e||!1===e?e:t}function t(){return!!(navigator.userAgent.match(/Android/i)||navigator.userAgent.match(/webOS/i)||navigator.userAgent.match(/iPhone/i)||navigator.userAgent.match(/iPad/i)||navigator.userAgent.match(/iPod/i)||navigator.userAgent.match(/BlackBerry/i)||navigator.userAgent.match(/Windows Phone/i))}"undefined"==typeof orderingSettings&&(orderingSettings={});var i=orderingSettings,o=e(i.openOnMobile,!1),n=e(i.openOnDesktop,!1),s=!1,l=document.createElement("div");l.id="ordering_bot",l.style.height=0,l.style.width=0,l.style.position="fixed",l.style.right="20%",l.style.left="20%",l.style.top="7%",l.style.bottom="7%",l.style.borderRadius="5px",l.style.overflow="hidden",l.style.zIndex=99999,l.style.maxheight=window.innerHeight+"px",l.style["-webkit-transition"]="height 0.5s, width 0.5s",l.style["-moz-transition"]="height 0.5s, width 0.5s",l.style["-ms-transition"]="height 0.5s, width 0.5s",l.style["-o-transition"]="height 0.5s, width 0.5s",l.style.transition="height 0.5s, width 0.5s",l.style["-webkit-overflow-scrolling"]="touch",l.style["overflow-y"]="scroll",l.style.boxShadow="0 0 20px 0 #999";var r={insideIframe:!1};document.addEventListener("scroll",function(e){r.insideIframe&&(e.preventDefault(),window.scrollTo(0,0))});var d=document.createElement("div");d.style.height="40px",d.style.background="#ccc",d.style.width="100%",d.style.position="absolute";var a=document.createElement("div");a.style.height="40px",a.style.width="40px",a.style.float="right",a.style.fontSize="28px",a.style.lineHeight="25px",a.style.padding="5px",a.style.textAlign="center",a.style.boxSizing="border-box",a.style.color="#666",a.style.borderLeft="1px solid #bbb",a.style.cursor="pointer",a.innerHTML="&times;",d.appendChild(a);var h=document.createElement("iframe");function y(){s?(l.style.height="auto",l.style.width="auto",window.innerWidth<=480?(l.style.right=0,l.style.left=0,l.style.top=0,l.style.bottom=0,l.style.borderRadius=0):(window.innerWidth>480&&window.innerWidth<600?(l.style.left="10%",l.style.right="10%"):(l.style.left="20%",l.style.right="20%"),l.style.top="7%",l.style.bottom="7%",l.style.borderRadius="5px")):(l.style.height="0px",l.style.width="0px")}h.id="ordering_iframe",h.src="' + url + '",h.style.border=0,h.style.height="100%",h.style.width="100%",h.style.maxWidth="none",h.style.paddingTop="40px",h.style.boxSizing="border-box",h.style["-webkit-overflow-scrolling"]="touch",l.appendChild(d),l.appendChild(h),document.getElementsByTagName("body")[0].appendChild(l),window.toggleOrderingWidget=function(){(s=!s)?(t()&&(r.insideIframe=!0,document.body.style.overflow="hidden",document.body.style.height=window.innerHeight-150+"px"),r.insideIframe=!0,r.scrollX=window.scrollX,r.scrollY=window.scrollY,t()||(document.body.style.overflow="hidden")):(t()&&(r.insideIframe=!1,document.body.style.overflow="auto",document.body.style.height="auto"),r.insideIframe=!1,t()||(document.body.style.overflow="auto")),y()},y(),window.onresize=y,(t()&&o&&!(navigator.userAgent.match(/iPad/i)||(navigator.userAgent.match(/iPhone/i)||void 0))||!t()&&n)&&toggleOrderingWidget(),a.addEventListener("click",toggleOrderingWidget)};</script>';
	// $scope.widget_inline = '<script type="text/javascript">window.onload=function(){var e="'+url+'",t=document.createElement("iframe");t.id="ordering_iframe",t.src=e,t.style.border=0,t.style.height="100%",t.style.width="100%",t.style.maxWidth="none";var n=document.getElementById("ordering_iframe_inline");n.appendChild(t),t.addEventListener("load",function(){setInterval(function(){t.contentWindow.postMessage("body",e)},100)}),window.addEventListener("message",function(e){e.data.height&&(n.style.height=e.data.height+"px")},!1)};</script><div id="ordering_iframe_inline"></div>';
	$scope.widget_inline = '<script type="text/javascript">var orderingInlineSettings = {baseUrl: "/"};</script><script type="text/javascript">window.onload=function(){var i={baseUrl:orderingInlineSettings&&orderingInlineSettings.baseUrl?orderingInlineSettings.baseUrl:"/inline/"},l=location.href.split(i.baseUrl)[0],e=location.href.split(i.baseUrl)[1],a="' + url + '",r=document.createElement("iframe");r.id="ordering_iframe",r.src=(a+"/"+e).replace(/([^:]\\/)\\/+/g,"$1"),r.style.border=0,r.style.height="100%",r.style.width="100%",r.style.maxWidth="none",r.allow="geolocation";var d=document.getElementById("ordering_iframe_inline");d.appendChild(r),r.addEventListener("load",function(){t(),setInterval(function(){var e=JSON.stringify({event:"body",data:{}});r.contentWindow.postMessage(e,a)},100)});function t(){var e=document.documentElement,t=window.innerwidth||e.clientWidth,n=window.innerHeight||e.clientHeight,o=(window.pageXOffset||e.scrollLeft)-(e.clientLeft||0),i=(window.pageYOffset||e.scrollTop)-(e.clientTop||0),l=JSON.stringify({event:"scroll",data:{top:i,left:o,width:t,height:n,offsetTop:s(r).top}});r.contentWindow.postMessage(l,a)}function s(e){for(var t=0,n=0;t+=e.offsetTop||0,n+=e.offsetLeft||0,e=e.offsetParent;);return{top:t,left:n}}window.addEventListener("message",function(e){var t=e.data;if("body"==t.event)d.style.height=t.data.height+"px";else if("scroll"==t.event)t.data.enable?document.getElementsByTagName("body")[0].style.overflowY="auto":document.getElementsByTagName("body")[0].style.overflowY="hidden";else if("url"==t.event){var n=document.createElement("a");n.href=t.data;var o=((l?l+"/":"")+i.baseUrl+"/"+n.pathname).replace(/([^:]\\/)\\/+/g,"$1");window.history.pushState("","",o),"http://localhost/"!=t.data&&window.scrollTo(0,s(r).top)}},!1),window.onscroll=function(e){t()}};</script><div style="height: 1000px;" id="ordering_iframe_inline"></div>';
	var color = $('.navbar-default .navbar-nav > li >a').css('color');
	$scope.widget_bot = '<script type="text/javascript">window.onload=function(){function e(e,t){return e===!0||e===!1||void 0!=e||null!=e?e:t}function t(){return navigator.userAgent.match(/Android/i)||navigator.userAgent.match(/webOS/i)||navigator.userAgent.match(/iPhone/i)||navigator.userAgent.match(/iPad/i)||navigator.userAgent.match(/iPod/i)||navigator.userAgent.match(/BlackBerry/i)||navigator.userAgent.match(/Windows Phone/i)?!0:!1}function n(){return navigator.userAgent.match(/iPad/i)?"iPad":navigator.userAgent.match(/iPhone/i)?"iPhone":void 0}function i(){h=!h,h?(t()&&(w.insideIframe=!0,document.body.style.overflow="hidden",document.body.style.height=window.innerHeight-150+"px"),g.innerHTML=p.outerHTML):(t()&&(w.insideIframe=!1,document.body.style.overflow="auto",document.body.style.height="auto"),g.innerHTML=c.outerHTML),o(m)}function o(e){e.style.height=s(),e.style.width=r(),window.innerWidth<=480&&(e.style.top=0,e.style.left=0,e.style.right=0,e.style.bottom=0)}function s(){if(h){if(window.innerWidth<=480)return"100%";var e=window.innerHeight-70-10-20;return (e>570&&y.type=="chat")?"570px":e+"px"}return"0px"}function r(){return h?window.innerWidth<=480?"100%":"chat"==y.type?"370px":window.innerWidth-40+"px":"0px"}function l(){console.log("onresize"),window.innerWidth<=480?(m.style.position="fixed",m.style.bottom=0,m.style.right=0,m.style.borderRadius=0,f.style.display="block"):(m.style.position="fixed",m.style.bottom="80px",m.style.right="20px",m.style.borderRadius="10px",f.style.display="none"),m.style.height=s(),m.style.width=r()}var d="' + url + '";"undefined"==typeof orderingSettings&&(orderingSettings={});var a=orderingSettings,y={openOnMobile:e(a.openOnMobile,!1),openOnDesktop:e(a.openOnDesktop,!1),type:e(a.type,"chat")},h=!1,g=document.createElement("div"),c=document.createElement("img");c.src=d.split("/")[0]+"//"+d.split("/")[2]+"/templates/web/img/icon.png",c.style.width="30px",c.style.marginTop="9px",c.style.maxWidth="none";var p=document.createElement("div");p.innerHTML="&times;",p.style.display="block",p.style.color="#fff",p.style.font="Arial",p.style.fontSize="30px",p.style.margin="0 5px",p.style.borderRadius="50px",p.style.width="40px",p.style.height="40px",p.style.lineHeight="47px",p.style.fontWeight="400",g.style.position="fixed",g.style.bottom="20px",g.style.right="20px",g.style.width="50px",g.style.height="50px",g.style.background="' + color + '",g.style.borderRadius="50px",g.style.textAlign="center",g.style.cursor="pointer",g.style.outline="none",g.style.border=0,g.style.zIndex=99999,g.appendChild(c);var m=document.createElement("div");m.id="ordering_bot",m.style.height=0,m.style.width=0,m.style.position="fixed",m.style.bottom="80px",m.style.right="20px",m.style.borderRadius="10px",m.style.overflow="hidden",m.style.zIndex=99999,m.style.maxheight=window.innerHeight+"px",m.style["-webkit-transition"]="height 0.5s, width 0.5s",m.style["-moz-transition"]="height 0.5s, width 0.5s",m.style["-ms-transition"]="height 0.5s, width 0.5s",m.style["-o-transition"]="height 0.5s, width 0.5s",m.style.transition="height 0.5s, width 0.5s";var u=document.createElement("iframe");u.id="ordering_bot_iframe",u.src=d,u.setAttribute("allow", "geolocation"),u.style.border=0,u.style.height="125%",u.style.width="125%",u.style.maxWidth="none",u.style["-ms-zoom"]="0.8",u.style["-moz-transform"]="scale(0.8)",u.style["-moz-transform-origin"]="0 0",u.style["-o-transform"]="scale(0.8)",u.style["-o-transform-origin"]="0 0",u.style["-webkit-transform"]="scale(0.8)",u.style["-webkit-transform-origin"]="0 0";var w={insideIframe:!1};m.addEventListener("mouseenter",function(){w.insideIframe=!0,w.scrollX=window.scrollX,w.scrollY=window.scrollY,t()||(document.body.style.overflow="hidden")}),m.addEventListener("mouseleave",function(){w.insideIframe=!1,t()||(document.body.style.overflow="auto")}),document.addEventListener("scroll",function(e){w.insideIframe&&(e.preventDefault(),window.scrollTo(0,0))});var f=document.createElement("div");f.style.position="absolute",f.style.width="35px",f.style.height="35px",f.style.bottom="45px",f.style.left="50%",f.style.lineHeight="36px",f.style.background="transparent",f.style.borderColor="transparent";var x=document.createElement("div");x.innerHTML="&times;",x.style.position="relative",x.style.left="-50%",x.style.zIndex="999",x.style.width="40px",x.style.height="40px",x.style.background="rgba(0,0,0,0.2)",x.style.textAlign="center",x.style.border=0,x.style.borderRadius="35px",x.style.color="#fff",x.style.fontSize="30px",x.style.outline="none",x.style.cursor="pointer",f.appendChild(x),m.appendChild(f),m.appendChild(u),document.getElementsByTagName("body")[0].appendChild(g),document.getElementsByTagName("body")[0].appendChild(m),window.toggleOrderingWidget=i,g.onclick=i,f.onclick=i,l(),window.onresize=l,(t()&&y.openOnMobile&&!n()||!t()&&y.openOnDesktop)&&i(),setInterval(function(){n()&&window.innerHeight<m.clientHeight&&(u.style.height=.7*window.innerHeight+"px"),n()&&window.innerHeight==m.clientHeight&&(m.style.bottom=0,u.style.height="125%")},2e3)};</script>';
	Extensions.runAction('enter_channels_editor_view', null, $scope);
	$(document).ready(function () {
		/***Show Bottom Help***/
		$('[data-toggle="popover"]').popover({ html: true });
		/***Position bottom ButtomHelp***/
		$('#buttonFixed').css({
			'bottom': $('.footer').height() + 15 + 'px',
		});
	});
});

_controllers.controller('driversSettingsEditorCtrl', function ($scope, $rootScope, $state, MyModal, $timeout, MyAlert, MyLoading, Ordering, gUser/*newdriversSettingsEditorCtrl*/) {
	$scope.drivermanagers = [];
	$scope.drivergroups = [];
	$scope.drivers = [];
	$scope.driver_companies = [];
	$scope.paymethods = [];
	$scope.countries = [];
	$scope.cities = [];
	$scope.business = [];
	$scope.filterDriM = '';
	$scope.filterDriG = '';
	$scope.filterDri = '';
	$scope.curType = '';
	$scope.curDriverType = {};
	$scope.curDrivergroup = {};
	$scope.allGroupDrivers = [];
	var curTimeout = null;
	$scope.dcopagination = {
		current: 1,
		pages: 1,
		items: '10',
		itemsPerPage: [10, 20, 30, 50]
	}
	MyLoading.show();
	Ordering.driver_companies.all({}, function (res) {
		if (!res.error) {
			$scope.driver_companies = res.result;
			$scope.dcopagination.pages = Math.ceil($scope.driver_companies.length / $scope.dcopagination.items)
		}
	});
	Ordering.users.all({
		params: 'name,lastname,email,phone,photo,cellphone,city_id,city,address,location,zipcode,level,enabled',
		where: [{ attribute: 'level', value: [4, 5] }]
	}, function (res) {
		$scope.drivers = [];
		$scope.drivermanagers = [];
		for (var i = 0; i < res.result.length; i++) {
			if (res.result[i].level == 4) $scope.drivers.push(res.result[i]);
			else if (res.result[i].level == 5) $scope.drivermanagers.push(res.result[i]);
		}
		$scope.drimpagination.pages = Math.ceil($scope.drivermanagers.length / $scope.drimpagination.items)
		$scope.dripagination.pages = Math.ceil($scope.drivers.length / $scope.dripagination.items)
		$scope.initDriver();
		$scope.initDrivermanager();
		Ordering.drivergroups.all({}, function (res) {
			MyLoading.hide();
			$scope.drivergroups = res.result;
			$scope.drigpagination.pages = Math.ceil($scope.drivergroups.length / $scope.drigpagination.items)
			$scope.initDrivergroup();
			Ordering.business.all({
				mode: 'dashboard',
				params: 'name'
			}, function (res) {
				$scope.business = res.result;
				Ordering.countries.all({}, function (res) {
					$scope.countries = res.result;
					$scope.cities = [];
					for (var i = 0; i < $scope.countries.length; i++) {
						$scope.cities = $scope.cities.concat($scope.countries[i].cities);
					}
				});
			});
			var wherePaymehtods = {
				enabled: true
			}
			Ordering.paymethods.all({
				params: 'name',
				where: wherePaymehtods
			}, function (res) {
				if (!res.error) {
					$scope.paymethods = res.result
				} else {
					MyAlert.show(res.result);
				}
			})
		});
	});
	$scope.drimpagination = {
		current: 1,
		pages: 1,
		items: '10',
		itemsPerPage: [10, 20, 30, 50]
	}
	$scope.drigpagination = {
		current: 1,
		pages: 1,
		items: '10',
		itemsPerPage: [10, 20, 30, 50]
	}
	$scope.dripagination = {
		current: 1,
		pages: 1,
		items: '10',
		itemsPerPage: [10, 20, 30, 50]
	}
	$scope.nextPage = function (pagination) {
		if (pagination.current < pagination.pages) pagination.current++;
	}
	$scope.backPage = function (pagination) {
		if (pagination.current > 0) pagination.current--;
	}
	$scope.initDrivermanager = function (drivermanager) {
		if (drivermanager && drivermanager.id > 0) {
			if (!drivermanager.city_id) {
				drivermanager.city_id = '-1';
				drivermanager.country_id = '-1';
			} else {
				drivermanager.city_id = drivermanager.city_id + '';
				drivermanager.country_id = drivermanager.city.country_id + '';
			}
			$scope.curDriverType = drivermanager;
			$scope.curDriverType.image = null;
		} else $scope.curDriverType = {
			address: '',
			phone: '',
			cellphone: '',
			city_id: '-1',
			country_id: '-1',
			zipcode: '',
			email: (drivermanager && drivermanager.email) ? drivermanager.email : '',
			level: 5,
			enabled: true,
			id: -1,
			lastname: '',
			name: (drivermanager && drivermanager.name) ? drivermanager.name : '',
			password: '',
			image: null
		};
	}
	$scope.initDrivergroup = function (drivergroup) {
		if (drivergroup && drivergroup.id > 0) {
			drivergroup.orders_group_start_in_status = drivergroup.orders_group_start_in_status + '';
			drivergroup.priority = drivergroup.priority + '';
			drivergroup.type = drivergroup.type + '';
			drivergroup.orders_group_use_maps_api = (!drivergroup.orders_group_use_maps_api || drivergroup.orders_group_use_maps_api == '0') ? '0' : '1';
			drivergroup.autoassign_autoaccept_by_driver = (!drivergroup.autoassign_autoaccept_by_driver || drivergroup.autoassign_autoaccept_by_driver == '0') ? '0' : '1';
			drivergroup.allowed_paymethods = drivergroup.allowed_paymethods || null;
			$scope.curDrivergroup = drivergroup;
		} else {
			$scope.curDrivergroup = {
				administrator_id: (drivergroup && drivergroup.administrator_id) ? drivergroup.administrator_id : '',
				enabled: true,
				name: (drivergroup && drivergroup.name) ? drivergroup.name : '',
				id: -1,
				drivers: [],
				business: [],
				driver_companies: [],
				priority: '0',
				type: '0',
				orders_group_start_in_status: '7',
				orders_group_max_orders: 1,
				orders_group_max_time_between: 5,
				orders_group_max_distance_between_pickup: 200,
				orders_group_max_distance_between_delivery: 200,
				orders_group_max_time_between_pickup: 600,
				orders_group_max_time_between_delivery: 600,
				orders_group_use_maps_api: '0',
				autoassign_amount_drivers: 1,
				autoassign_autoaccept_by_driver: '0',
				autoassign_autoreject_time: 30,
				autoassign_max_orders: 5,
				autoassign_max_in_pending: 5,
				autoassign_max_in_ready_for_pickup: 5,
				autoassign_max_in_accepted_by_business: 5,
				autoassign_max_in_driver_in_business: 5,
				autoassign_max_in_accepted_by_driver: 5,
				autoassign_max_in_pickup_completed: 5,
				autoassign_initial_radius: 500,
				autoassign_increment_radius: 100,
				autoassign_max_radius: 1000,
				autoassign_forced_assignment: false,
				autoassign_customer_max_distance_from_business: null,
				allowed_paymethods: null
			};
		}
	}
	$scope.initDriver = function (driver) {
		if (driver && driver.id > 0) {
			if (!driver.city) {
				driver.city_id = '-1';
				driver.country_id = '-1';
			} else {
				driver.city_id = driver.city_id + '';
				driver.country_id = driver.city.country_id + '';
			}
			$scope.curDriverType = driver;
			$scope.curDriverType.image = null;
		} else $scope.curDriverType = {
			address: '',
			phone: '',
			cellphone: '',
			city_id: '-1',
			country_id: '-1',
			zipcode: '',
			email: (driver && driver.email) ? driver.email : '',
			level: 4,
			enabled: true,
			id: -1,
			lastname: '',
			name: (driver && driver.name) ? driver.name : '',
			password: '',
			image: null
		};
	}
	$scope.newDriverCompany = {
		id: -1,
		priority: '0',
		fixed_cost_per_km: 0,
		fixed_cost_delivery: 0,
		percentage_cost_per_order_subtotal: 0,
		schedule: $scope.makeSchedule()
	}
	/* Driver companies */
	$scope.updateDriverCompany = function (driver_company, fieldsToUpdate) {
		var data_to_update = driver_company;
		if (fieldsToUpdate) {
			var data_to_update = {
				id: driver_company.id
			}
			for (var i = 0; i < fieldsToUpdate.length; i++) {
				var field = fieldsToUpdate[i];
				data_to_update[field] = driver_company[field];
			}
		}
		MyLoading.toast($scope.translate('LOADING') + '...');
		Ordering.driver_companies.update(data_to_update, function (res, changes) {
			MyLoading.hide();
			// console.log(res)
			if (!res.error) {
				if (Object.values(changes).length > 0) {
					MyLoading.success($scope.translate('SAVED'), 2000);
				}
			} else {
				MyAlert.show(res.result)
			}
		});
	}
	$scope.removeDriverCompany = function (driver_company) {
		MyAlert.confirm($scope.translate('QUESTION_DELETE_DRIVER_COMPANY')).then(function () {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.driver_companies.delete({
				id: driver_company.id
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					for (var i = 0; i < $scope.driver_companies.length; i++) {
						var _driver_company = $scope.driver_companies[i];
						if (_driver_company.id === driver_company.id) {
							$scope.driver_companies.splice(i, 1);
							break;
						}
					}
					MyLoading.success($scope.translate('CHANGES_SAVED'), 2000);
				} else {
					MyAlert.show(res.result)
				}
			})
		});
	}
	$scope.showDriverCompanySettings = function (driver_company) {
		if ($scope.modalOpening) return;
		$scope.modalOpening = true;
		$timeout(function () {
			$scope.modalOpening = false;
		}, 2000);
		MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/settings/driver-company-settings.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (drivercompany_settings) {
			drivercompany_settings.show().then(function () {
				if (driver_company) {
					var _driver_company = clone(driver_company)
					_driver_company.priority = _driver_company.priority + ''
					drivercompany_settings.scope.driver_company = _driver_company
				} else {
					drivercompany_settings.scope.driver_company = {
						id: -1,
						limit: 1,
						priority: '0',
						schedule: $scope.makeSchedule()
					}
				}
				drivercompany_settings.scope.timezones = timezones;
				drivercompany_settings.scope.openSchecule = function (schedule) {
					$scope.showSchedule(schedule, function (newSchedule) {
						MyLoading.success($scope.translate('CHANGED'), 1000);
						drivercompany_settings.scope.driver_company.schedule = newSchedule;
						drivercompany_settings.scope.autosave(['schedule'])
					}, {
						autosave: false
					});
				}
				drivercompany_settings.scope.autosave = function (fieldsToUpdate) {
					if (drivercompany_settings.scope.driver_company.id !== -1) {
						drivercompany_settings.scope.save(fieldsToUpdate);
					}
				}
				drivercompany_settings.scope.save = function (fieldsToUpdate) {
					if (drivercompany_settings.scope.driver_company.id === -1) {
						MyLoading.show($scope.translate('LOADING') + '...')
						var _driver_company = clone(drivercompany_settings.scope.driver_company)
						if (typeof _driver_company.schedule === 'object') {
							_driver_company.schedule = JSON.stringify(_driver_company.schedule)
						}
						Ordering.driver_companies.add(_driver_company, function (res) {
							MyLoading.hide()
							if (!res.error) {
								$scope.driver_companies.push(res.result);
								res.result.priority = res.result.priority + ''
								drivercompany_settings.scope.driver_company = res.result;
								MyLoading.success($scope.translate('CHANGES_SAVED'), 1000);
								$scope.newDriverCompany = {
									id: -1,
									priority: '0',
									fixed_cost_per_km: 0,
									fixed_cost_delivery: 0,
									percentage_cost_per_order_subtotal: 0,
									schedule: $scope.makeSchedule()
								}
							} else {
								MyAlert.show(res.result)
							}
						})
					} else {
						var data_to_update = drivercompany_settings.scope.driver_company;
						if (fieldsToUpdate) {
							data_to_update = {
								id: drivercompany_settings.scope.driver_company.id
							}
							for (var i = 0; i < fieldsToUpdate.length; i++) {
								var field = fieldsToUpdate[i]
								var value = drivercompany_settings.scope.driver_company[field];
								if (typeof value === 'object') {
									value = JSON.stringify(value)
								}
								data_to_update[field] = value;
							}
						}
						MyLoading.show($scope.translate('LOADING') + '...')
						Ordering.driver_companies.update(data_to_update, function (res, changes) {
							MyLoading.hide()
							if (!res.error) {
								if (Object.values(changes).length > 0) {
									res.result.priority = res.result.priority + ''
									Object.assign(drivercompany_settings.scope.driver_company, res.result)
									MyLoading.success($scope.translate('CHANGES_SAVED'), 1000);
								}
							} else {
								MyAlert.show(res.result)
							}
						});
					}
				}
			})
		});
	}
	/* End driver companies */
	/* Drivers manager */
	$scope.showDrivermanagerSettings = function (drivermanager) {
		if ($scope.modalOpening) return;
		$scope.modalOpening = true;
		$scope.hideDrivertypeSettings();
		var user_mirror = clone(drivermanager)
		$scope.initDrivermanager(user_mirror);
		$scope.curType = 'manager';
		MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/settings/drivertype-settings.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (drivertype_settings) {
			modals.push(drivertype_settings);
			$scope.drivertype_settings = drivertype_settings;
			$scope.drivertype_settings.show();
			$scope.modalOpening = false;
			var address_selected = false;

			if ($scope.curDriverType.address) {
				address_selected = true;
			}

			drivertype_settings.$el.on('click', function (e) {
				if (drivertype_settings.backdropClickToClose && e.target === drivertype_settings.el) {
					drivertype_settings.hide();
					drivertype_settings.remove();
					$scope.initDrivermanager();
				}
			});

			drivertype_settings.scope.tab = 0;
			drivertype_settings.scope.changeTab = function (tab) {
				drivertype_settings.scope.tab = tab;
			}

			if (!NEW_FEATURES.MULTI_ADDRESS) {
				var options = {
					types: [],
				};
				if (FULL_ADDRESS_ONLY) {
					options.types.push('address');
				}
				if (COUNTRY_AUTOCOMPLETE != "*") options.componentRestrictions = {
					country: COUNTRY_AUTOCOMPLETE
				}
				$timeout(function () {
					var input = document.getElementById('driver-type-address');
					var autocomplete = new google.maps.places.Autocomplete(input, options);
					autocomplete.setFields(['place_id', 'formatted_address', 'geometry']);
					autocomplete.addListener('place_changed', function () {
						$scope.curDriverType.address = input.value;
						$scope.curDriverType.position = {
							lat: autocomplete.getPlace().geometry.location.lat(),
							lng: autocomplete.getPlace().geometry.location.lng()
						}
						$scope.curDriverType.position.from_google = false;
						address_selected = true;
					});
					input.onkeydown = function () {
						address_selected = false;
					}
				}, 150);
			}

			drivertype_settings.scope.saveUser = function (curDriverType) {
				if (!NEW_FEATURES.MULTI_ADDRESS && curDriverType.address && GOOGLE_AUTOCOMPLETE_SELECTION_REQUIRED && !address_selected) {
					MyAlert.show($scope.translate('SELECT_ADDRESS_FROM_AUTOCOMPLETE'));
				} else {
					if (curDriverType.id == -1) {
						$scope.addUser(curDriverType);
					} else {
						$scope.updateUser(curDriverType);
					}
				}
			}

			// Addresses
			$scope.addresses = [];
			if ($scope.curDriverType.id > 0) {
				Ordering.users.addresses.all({
					user_id: $scope.curDriverType.id
				}, function (res) {
					$scope.loading = false;
					if (!res.error) {
						$scope.addresses = res.result;
					} else MyAlert(res.result);
				});
			}

			$scope.change = function (address) {
				if (ADDONS.web_template) MyLoading.toast($scope.translate('LOADING') + '...');
				else MyLoading.show($scope.translate('LOADING') + '...');
				Ordering.users.addresses.update({
					id: address.id,
					user_id: $scope.curDriverType.id,
					default: true
				}, function (res) {
					MyLoading.hide();
					if (!res.error) {
						$scope.addresses.forEach(function (address) {
							if (address.id != res.result.id) {
								address.default = false;
							} else address.default = true;
						});
						if (ADDONS.web_template) MyLoading.success($scope.translate('ADDRESS_CHANGED'), 2000);
					} else MyAlert.show(res.result);
				})
			}

			$scope.edit = function (address) {
				$scope.openFullAddress(address, function (addr, modal) {
					if (ADDONS.web_template) MyLoading.toast($scope.translate('LOADING') + '...');
					else MyLoading.show($scope.translate('LOADING') + '...');
					Ordering.users.addresses.update({
						id: addr.id,
						user_id: $scope.curDriverType.id,
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
							if (ADDONS.web_template) MyLoading.success($scope.translate('ADDRESS_SAVED'), 2000);
						} else MyAlert.show(res.result);
					});
				});
			}

			$scope.delete = function (address) {
				MyAlert.confirm($scope.translate('QUESTION_DELETE_ADDRESS')).then(function () {
					MyLoading.toast($scope.translate('LOADING') + '...');
					Ordering.users.addresses.delete({
						id: address.id,
						user_id: $scope.curDriverType.id
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
							MyLoading.success($scope.translate('ADDRESS_DELETED'), 2000);
						} else MyAlert.show(res.result);
					});
				});
			}

			$scope.add = function () {
				$scope.openFullAddress(null, function (addr, modal) {
					MyLoading.toast($scope.translate('LOADING') + '...');
					Ordering.users.addresses.add({
						user_id: $scope.curDriverType.id,
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
						default: $scope.addresses.length == 0
					}, function (res) {
						MyLoading.hide();
						if (!res.error) {
							$scope.addresses.push(res.result);
							modal.scope.hide();
							MyLoading.success($scope.translate('ADDRESS_SAVED'), 2000);
						} else MyAlert.show(res.result);
					});
				});
			}

			if ($scope.curDriverType.id == -1) Extensions.runAction('enter_drivermanager_create_editor_view', null, $scope);
			else Extensions.runAction('enter_drivermanager_update_editor_view', null, $scope);
		});
	}
	$scope.hideDrivertypeSettings = function () {
		if ($scope.drivertype_settings) {
			$scope.drivertype_settings.hide();
			$scope.drivertype_settings.remove();
			$scope.initDrivermanager();
			$scope.initDriver();
		}
	}
	$scope.checkDriverType = function (drivertype) {
		if ($scope.curType == 'driver' && drivertype.group_id.trim() == '') return new Error($scope.translate('SELECT_GROUP'));
		else if (drivertype.name.trim() == '') return new Error($scope.translate('NAME_REQUIRED'));
		else if (drivertype.email.trim() == '') return new Error($scope.translate('EMAIL_REQUIRED'));
		else if (drivertype.pwd.trim() == '') return new Error($scope.translate('PASSWORD_REQUIRED'));
		// else if (drivertype.country.trim() == '') return new Error($scope.translate('SELECT_COUNTRY'));
		// else if (drivertype.city.trim() == '') return new Error($scope.translate('SELECT_CITY'));
		else if (drivertype.address.trim() == '') return new Error($scope.translate('ADDRESS_REQUIRED'));
		else if ($scope.curType == 'manager' && drivertype.cel.trim() == '') return new Error($scope.translate('CELLPHONE_REQUIRED'));
		// else if ($scope.curType == 'driver' && drivertype.zip.trim() == '') return new Error($scope.translate('CELLPHONE_REQUIRED'));
		else return null;
	}
	$scope.updateUser = function (user) {
		if (curTimeout) $timeout.cancel(curTimeout);
		curTimeout = $timeout(function () {
			MyLoading.toast($scope.translate('LOADING') + '...');
			var userData = {
				id: user.id,
				address: user.address,
				name: user.name,
				lastname: user.lastname,
				email: user.email,
				password: user.password,
				phone: user.phone,
				cellphone: user.cellphone,
				zipcode: user.zipcode,
				enabled: user.enabled,
				photo: user.image
			}
			if (user.city_id && user.city_id != -1) {
				userData.city_id = user.city_id
			}
			Ordering.users.update(userData, function (res) {
				MyLoading.hide();
				if (!res.error) {
					$scope.hideDrivertypeSettings();
					if (res.result.city) user.city = res.result.city;
					for (var i = 0; i < $scope.drivermanagers.length; i++) {
						if ($scope.drivermanagers[i].id == res.result.id) {
							Object.assign($scope.drivermanagers[i], res.result);
							return;
						}
					}
					for (var i = 0; i < $scope.drivers.length; i++) {
						if ($scope.drivers[i].id == res.result.id) {
							Object.assign($scope.drivers[i], res.result);
							return;
						}
					}
					// Object.assign(user, res.result);
					MyLoading.success($scope.translate('USER_SAVED'), 1500);
				} else MyAlert.show(res.result);
			}, null, null, true);
		}, 10);
	}

	$scope.changeUserData = function (user, now) {
		var time = 0;
		if (now) time = 0;
		if (curTimeout) $timeout.cancel(curTimeout);
		curTimeout = $timeout(function () {
			function validateEmail(email) {
				var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
				return re.test(email);
			}
			if (validateEmail(user.email)) $scope.updateUser(user);
		}, time);
	}
	$scope.addUser = function (user) {
		if (curTimeout) $timeout.cancel(curTimeout);
		curTimeout = $timeout(function () {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.users.add({
				name: user.name,
				lastname: user.lastname,
				email: user.email,
				password: user.password,
				address: user.address,
				level: user.level,
				phone: user.phone,
				cellphone: user.cellphone,
				zipcode: user.zipcode,
				city_id: user.city_id != '-1' ? user.city_id : undefined,
				enabled: user.enabled,
				photo: user.image
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					if (user.level == 5) $scope.drivermanagers.push(res.result);
					else if (user.level == 4) $scope.drivers.push(res.result);
					$scope.hideDrivertypeSettings();
					MyLoading.success($scope.translate('USER_ADDED'), 1500);
				} else MyAlert.show(res.result);
			});
		}, 10);
	}
	$scope.removeUser = function (user) {
		var curUser = gUser.getData();
		if (curUser.id === user.id) {
			MyAlert.show($scope.translate('USER_SELF_DELETE'));
		} else {
			MyAlert.confirm($scope.translate('QUESTION_DELETE_DRIVER_MANAGER')).then(function (res) {
				MyLoading.toast($scope.translate('LOADING') + '...');
				Ordering.users.delete({
					id: user.id
				}, function (res) {
					MyLoading.hide();
					if (!res.error) {
						var users = [];
						if (user.level == 5) users = $scope.drivermanagers;
						else if (user.level == 4) users = $scope.drivers;
						for (var i = 0; i < users.length; i++) {
							if (users[i].id == user.id) users.splice(i, 1);
						}
						MyLoading.success($scope.translate('DRIVER_MANAGER_DELETED'), 1500);
					} else MyAlert.show(res.result);
				});
			});
		}
	}
	/* End Drivers manager */
	/* Driver group */
	$scope.showDrivergroupSettings = function (drivergroup) {
		if ($scope.modalOpening) return;
		$scope.modalOpening = true;
		$scope.hideDrivergroupSettings();
		$scope.initDrivergroup(drivergroup);
		//if (drivergroup.business[0] == '-1') drivergroup.check_business[0] = true;
		MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/settings/drivergroup-settings.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (drivergroup_settings) {
			modals.push(drivergroup_settings);
			$scope.drivergroup_settings = drivergroup_settings;
			drivergroup_settings.$el.on('click', function (e) {
				if (drivergroup_settings.backdropClickToClose && e.target === drivergroup_settings.el) {
					drivergroup_settings.hide();
					drivergroup_settings.remove();
					$scope.initDrivergroup();
				}
			});
			drivergroup_settings.scope.check_business = {
				all: true
			};
			drivergroup.administrator_id = drivergroup.administrator_id.toString();
			for (var i = 0; i < $scope.business.length; i++) {
				var check = false;
				for (var j = 0; j < $scope.curDrivergroup.business.length; j++) {
					if ($scope.business[i].id == $scope.curDrivergroup.business[j].id) {
						check = true;
						break;
					}
				}
				if (!check) drivergroup_settings.scope.check_business.all = false;
				drivergroup_settings.scope.check_business[$scope.business[i].id] = check;
			}
			drivergroup_settings.scope.toggleAllBusiness = function () {
				for (var i = 0; i < $scope.business.length; i++) {
					drivergroup_settings.scope.check_business[$scope.business[i].id] = drivergroup_settings.scope.check_business.all;
				}
				drivergroup_settings.scope.save(['business']);
			}
			drivergroup_settings.scope.toggleBusiness = function () {
				var all = true;
				for (var key in drivergroup_settings.scope.check_business) {
					if (key != 'all' && !drivergroup_settings.scope.check_business[key]) {
						all = false;
						break;
					}
				}
				drivergroup_settings.scope.check_business.all = all;
				drivergroup_settings.scope.save(['business']);
			}

			drivergroup_settings.scope.check_drivers = {
				all: true
			};
			for (var i = 0; i < $scope.drivers.length; i++) {
				var check = false;
				for (var j = 0; j < $scope.curDrivergroup.drivers.length; j++) {
					if ($scope.drivers[i].id == $scope.curDrivergroup.drivers[j].id) {
						check = true;
						break;
					}
				}
				if (!check) drivergroup_settings.scope.check_drivers.all = false;
				drivergroup_settings.scope.check_drivers[$scope.drivers[i].id] = check;
			}
			drivergroup_settings.scope.toggleAllDrivers = function () {
				for (var i = 0; i < $scope.drivers.length; i++) {
					if ($scope.drivers[i].level == 4) drivergroup_settings.scope.check_drivers[$scope.drivers[i].id] = drivergroup_settings.scope.check_drivers.all;
				}
				drivergroup_settings.scope.save(['drivers']);
			}
			drivergroup_settings.scope.toggleDriver = function () {
				var all = true;
				for (var key in drivergroup_settings.scope.check_drivers) {
					if (key != 'all' && !drivergroup_settings.scope.check_drivers[key]) {
						all = false;
						break;
					}
				}
				drivergroup_settings.scope.check_drivers.all = all;
				drivergroup_settings.scope.save(['drivers']);
			}
			drivergroup_settings.scope.check_paymethods = {
				all: true
			};
			for (var i = 0; i < $scope.paymethods.length; i++) {
				var paymethod = $scope.paymethods[i];
				var check = $scope.curDrivergroup.allowed_paymethods === null || $scope.curDrivergroup.allowed_paymethods.indexOf(paymethod.id) >= 0;
				if (!check) {
					drivergroup_settings.scope.check_paymethods.all = false;
				}
				drivergroup_settings.scope.check_paymethods[paymethod.id] = check;
			}
			drivergroup_settings.scope.toggleAllPaymethods = function () {
				var check_paymethods = {
					all: drivergroup_settings.scope.check_paymethods.all
				}
				for (var i = 0; i < $scope.paymethods.length; i++) {
					check_paymethods[$scope.paymethods[i].id] = check_paymethods.all;
				}
				drivergroup_settings.scope.check_paymethods = check_paymethods
				drivergroup_settings.scope.save(['allowed_paymethods']);
			}
			drivergroup_settings.scope.togglePaymethod = function () {
				var all = true;
				for (var key in drivergroup_settings.scope.check_paymethods) {
					if (key != 'all' && !drivergroup_settings.scope.check_paymethods[key]) {
						all = false;
						break;
					}
				}
				drivergroup_settings.scope.check_paymethods.all = all;
				drivergroup_settings.scope.save(['allowed_paymethods']);
			}
			drivergroup_settings.scope.check_driver_companies = {
				all: true
			};
			for (var i = 0; i < $scope.driver_companies.length; i++) {
				var check = false;
				for (var j = 0; j < $scope.curDrivergroup.driver_companies.length; j++) {
					if ($scope.driver_companies[i].id == $scope.curDrivergroup.driver_companies[j].id) {
						check = true;
						break;
					}
				}
				if (!check) {
					drivergroup_settings.scope.check_driver_companies.all = false;
				}
				drivergroup_settings.scope.check_driver_companies[$scope.driver_companies[i].id] = check;
			}
			drivergroup_settings.scope.toggleAllDriverCompanies = function () {
				for (var i = 0; i < $scope.driver_companies.length; i++) {
					drivergroup_settings.scope.check_driver_companies[$scope.driver_companies[i].id] = drivergroup_settings.scope.check_driver_companies.all;
				}
				drivergroup_settings.scope.save(['driver_companies']);
			}
			drivergroup_settings.scope.toggleDriverCompany = function () {
				var all = true;
				for (var key in drivergroup_settings.scope.check_driver_companies) {
					if (key != 'all' && !drivergroup_settings.scope.check_driver_companies[key]) {
						all = false;
						break;
					}
				}
				drivergroup_settings.scope.check_driver_companies.all = all;
				drivergroup_settings.scope.save(['driver_companies']);
			}
			drivergroup_settings.scope.save = function (fieldsToUpdate) {
				if ($scope.curDrivergroup.id == -1) return;
				$scope.curDrivergroup.check_business = drivergroup_settings.scope.check_business;
				$scope.curDrivergroup.check_drivers = drivergroup_settings.scope.check_drivers;
				$scope.curDrivergroup.check_paymethods = drivergroup_settings.scope.check_paymethods;
				$scope.curDrivergroup.check_driver_companies = drivergroup_settings.scope.check_driver_companies;
				$scope.updateDrivergroup($scope.curDrivergroup, fieldsToUpdate);
			}
			drivergroup_settings.scope.add = function () {
				$scope.curDrivergroup.check_business = drivergroup_settings.scope.check_business;
				$scope.curDrivergroup.check_drivers = drivergroup_settings.scope.check_drivers;
				$scope.curDrivergroup.check_paymethods = drivergroup_settings.scope.check_paymethods;
				$scope.curDrivergroup.check_driver_companies = drivergroup_settings.scope.check_driver_companies;
				$scope.addDrivergroup($scope.curDrivergroup);
			}
			$scope.drivergroup_settings.show();
			$scope.modalOpening = false;

			Extensions.runAction('enter_drivers_editor_view', null, $scope);
		});
	}
	$scope.hideDrivergroupSettings = function () {
		if ($scope.drivergroup_settings) {
			$scope.drivergroup_settings.hide();
			$scope.drivergroup_settings.remove();
			$scope.initDrivergroup();
		}
	}
	$scope.checkDrivergroup = function (drivergroup) {
		if (drivergroup.name.trim() == '') return new Error($scope.translate('NAME_REQUIRED'));
		else if (drivergroup.drivermanager_id.trim() == '') return new Error($scope.translate('SELECT_MANAGER'));
		else if (drivergroup.business.length == 0) return new Error($scope.translate('SELECT_LEAST_ONE_BUSINESS'));
		else return null;
	}
	$scope.changeDrivergroup = function (drivergroup, now) {
		var time = 0;
		if (now) time = 0;
		if (curTimeout) $timeout.cancel(curTimeout);
		curTimeout = $timeout(function () {
			if (!$scope.checkDrivergroup(drivergroup)) $scope.updateDrivergroup(drivergroup);
		}, time);
	}
	$scope.updateDrivergroup = function (drivergroup, fieldsToUpdate) {
		if (curTimeout) $timeout.cancel(curTimeout);
		curTimeout = $timeout(function () {
			var data = {
				id: drivergroup.id,
				administrator_id: drivergroup.administrator_id,
				name: drivergroup.name,
				enabled: drivergroup.enabled,
				priority: drivergroup.priority,
				type: drivergroup.type,
				orders_group_start_in_status: drivergroup.orders_group_start_in_status,
				orders_group_max_orders: drivergroup.orders_group_max_orders,
				orders_group_max_time_between: drivergroup.orders_group_max_time_between,
				orders_group_max_distance_between_pickup: drivergroup.orders_group_max_distance_between_pickup,
				orders_group_max_distance_between_delivery: drivergroup.orders_group_max_distance_between_delivery,
				orders_group_max_time_between_pickup: drivergroup.orders_group_max_time_between_pickup,
				orders_group_max_time_between_delivery: drivergroup.orders_group_max_time_between_delivery,
				orders_group_use_maps_api: drivergroup.orders_group_use_maps_api == '1',
				autoassign_amount_drivers: drivergroup.autoassign_amount_drivers,
				autoassign_autoaccept_by_driver: drivergroup.autoassign_autoaccept_by_driver == '1',
				autoassign_autoreject_time: drivergroup.autoassign_autoreject_time,
				autoassign_max_orders: drivergroup.autoassign_max_orders,
				autoassign_max_in_pending: drivergroup.autoassign_max_in_pending,
				autoassign_max_in_ready_for_pickup: drivergroup.autoassign_max_in_ready_for_pickup,
				autoassign_max_in_accepted_by_business: drivergroup.autoassign_max_in_accepted_by_business,
				autoassign_max_in_driver_in_business: drivergroup.autoassign_max_in_driver_in_business,
				autoassign_max_in_accepted_by_driver: drivergroup.autoassign_max_in_accepted_by_driver,
				autoassign_max_in_pickup_completed: drivergroup.autoassign_max_in_pickup_completed,
				autoassign_initial_radius: drivergroup.autoassign_initial_radius,
				autoassign_increment_radius: drivergroup.autoassign_increment_radius,
				autoassign_max_radius: drivergroup.autoassign_max_radius,
				autoassign_forced_assignment: drivergroup.autoassign_forced_assignment,
				autoassign_customer_max_distance_from_business: drivergroup.autoassign_customer_max_distance_from_business
			};
			var diff = false;
			if (drivergroup.check_business) {
				var business = [];
				for (var key in drivergroup.check_business) {
					if (key != 'all' && drivergroup.check_business[key]) {
						business.push(key * 1);
					}
				}
				for (var i = 0; i < drivergroup.business.length; i++) {
					if (business.indexOf(drivergroup.business[i].id) == -1) {
						diff = true;
						break;
					}
				}
				if (diff || business.length != drivergroup.business.length) data.business = JSON.stringify(business);
			}
			diff = false;
			if (drivergroup.check_business) {
				var drivers = [];
				for (var key in drivergroup.check_drivers) {
					if (key != 'all' && drivergroup.check_drivers[key]) {
						drivers.push(key * 1);
					}
				}
				diff = false;
				for (var i = 0; i < drivergroup.drivers.length; i++) {
					if (drivers.indexOf(drivergroup.drivers[i].id) == -1) {
						diff = true;
						break;
					}
				}
				if (diff || drivers.length != drivergroup.drivers.length) data.drivers = JSON.stringify(drivers);
			}
			diff = false;
			if (drivergroup.check_paymethods) {
				var allowed_paymethods = [];
				for (var key in drivergroup.check_paymethods) {
					if (key != 'all' && drivergroup.check_paymethods[key]) {
						allowed_paymethods.push(key * 1);
					}
				}
				diff = false;
				if (!drivergroup.allowed_paymethods) {
					drivergroup.allowed_paymethods = [];
				}
				for (var i = 0; i < drivergroup.allowed_paymethods.length; i++) {
					if (allowed_paymethods.indexOf(drivergroup.allowed_paymethods[i].id) == -1) {
						diff = true;
						break;
					}
				}
				if (diff || allowed_paymethods.length != drivergroup.allowed_paymethods.length) {
					data.allowed_paymethods = allowed_paymethods.length === 0 ? null : JSON.stringify(allowed_paymethods);
				}
			}
			diff = false;
			if (drivergroup.check_driver_companies) {
				var driver_companies = [];
				for (var key in drivergroup.check_driver_companies) {
					if (key != 'all' && drivergroup.check_driver_companies[key]) {
						driver_companies.push(key * 1);
					}
				}
				diff = false;
				for (var i = 0; i < drivergroup.driver_companies.length; i++) {
					if (driver_companies.indexOf(drivergroup.driver_companies[i].id) == -1) {
						diff = true;
						break;
					}
				}
				if (diff || driver_companies.length != drivergroup.driver_companies.length) {
					data.driver_companies = JSON.stringify(driver_companies);
				}
			}
			var dataUpdate = {
				id: drivergroup.id,
			};
			if (!fieldsToUpdate) {
				dataUpdate = data;
			} else {
				for (var i = 0; i < fieldsToUpdate.length; i++) {
					var field = fieldsToUpdate[i];
					dataUpdate[field] = data[field];
				}
			}
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.drivergroups.update(dataUpdate, function (res) {
				MyLoading.hide();
				if (!res.error) {
					drivergroup.drivers = res.result.drivers;
					drivergroup.business = res.result.business;
					if ($scope.curDrivergroup && $scope.autoAssign) {
						if ($scope.curDrivergroup.autoassign_initial_radius * 1 == 500 && $scope.curDrivergroup.autoassign_amount_drivers * 1 == 1) $scope.autoAssign = 1;
						else if ($scope.curDrivergroup.autoassign_initial_radius * 1 == 15000 && $scope.curDrivergroup.autoassign_amount_drivers * 1 == 1000) $scope.autoAssign = 2;
						else if ($scope.curDrivergroup.autoassign_initial_radius * 1 == 100 && $scope.curDrivergroup.autoassign_amount_drivers * 1 == 1) $scope.autoAssign = 3;
						else if ($scope.curDrivergroup.autoassign_initial_radius * 1 == 1000 && $scope.curDrivergroup.autoassign_amount_drivers * 1 == 2) $scope.autoAssign = 4;
						else if ($scope.curDrivergroup.autoassign_initial_radius * 1 == 15000 && $scope.curDrivergroup.autoassign_amount_drivers * 1 == 1) $scope.autoAssign = 5;
						else $scope.autoAssign = 6;
					}
					MyLoading.success($scope.translate('DRIVER_GROUP_SAVED'), 1500);
				} else MyAlert.show(res.result);
			}, null, null, true);
		}, 10);
	}

	$scope.addDrivergroup = function (drivergroup) {
		if (curTimeout) $timeout.cancel(curTimeout);
		curTimeout = $timeout(function () {
			var data = {
				administrator_id: drivergroup.administrator_id,
				name: drivergroup.name,
				enabled: drivergroup.enabled,
				priority: drivergroup.priority,
				type: drivergroup.type,
				orders_group_start_in_status: drivergroup.orders_group_start_in_status,
				orders_group_max_orders: drivergroup.orders_group_max_orders,
				orders_group_max_time_between: drivergroup.orders_group_max_time_between,
				orders_group_max_distance_between_pickup: drivergroup.orders_group_max_distance_between_pickup,
				orders_group_max_distance_between_delivery: drivergroup.orders_group_max_distance_between_delivery,
				orders_group_max_time_between_pickup: drivergroup.orders_group_max_time_between_pickup,
				orders_group_max_time_between_delivery: drivergroup.orders_group_max_time_between_delivery,
				orders_group_use_maps_api: drivergroup.orders_group_use_maps_api == '1',
				autoassign_amount_drivers: drivergroup.autoassign_amount_drivers,
				autoassign_autoaccept_by_driver: drivergroup.autoassign_autoaccept_by_driver == '1',
				autoassign_autoreject_time: drivergroup.autoassign_autoreject_time,
				autoassign_max_orders: drivergroup.autoassign_max_orders,
				autoassign_max_in_pending: drivergroup.autoassign_max_in_pending,
				autoassign_max_in_ready_for_pickup: drivergroup.autoassign_max_in_ready_for_pickup,
				autoassign_max_in_accepted_by_business: drivergroup.autoassign_max_in_accepted_by_business,
				autoassign_max_in_driver_in_business: drivergroup.autoassign_max_in_driver_in_business,
				autoassign_max_in_accepted_by_driver: drivergroup.autoassign_max_in_accepted_by_driver,
				autoassign_max_in_pickup_completed: drivergroup.autoassign_max_in_pickup_completed,
				autoassign_initial_radius: drivergroup.autoassign_initial_radius,
				autoassign_increment_radius: drivergroup.autoassign_increment_radius,
				autoassign_max_radius: drivergroup.autoassign_max_radius
			};
			var diff = false;
			if (drivergroup.check_business) {
				var business = [];
				for (var key in drivergroup.check_business) {
					if (key != 'all' && drivergroup.check_business[key]) {
						business.push(key * 1);
					}
				}
				for (var i = 0; i < drivergroup.business.length; i++) {
					if (business.indexOf(drivergroup.business[i].id) == -1) {
						diff = true;
						break;
					}
				}
				if (diff || business.length != drivergroup.business.length) data.business = JSON.stringify(business);
			}
			diff = false;
			if (drivergroup.check_business) {
				var drivers = [];
				for (var key in drivergroup.check_drivers) {
					if (key != 'all' && drivergroup.check_drivers[key]) {
						drivers.push(key * 1);
					}
				}
				diff = false;
				for (var i = 0; i < drivergroup.drivers.length; i++) {
					if (drivers.indexOf(drivergroup.drivers[i].id) == -1) {
						diff = true;
						break;
					}
				}
				if (diff || drivers.length != drivergroup.drivers.length) data.drivers = JSON.stringify(drivers);
			}
			diff = false;
			if (drivergroup.check_driver_companies) {
				var driver_companies = [];
				for (var key in drivergroup.check_driver_companies) {
					if (key != 'all' && drivergroup.check_driver_companies[key]) {
						driver_companies.push(key * 1);
					}
				}
				diff = false;
				for (var i = 0; i < drivergroup.driver_companies.length; i++) {
					if (driver_companies.indexOf(drivergroup.driver_companies[i].id) == -1) {
						diff = true;
						break;
					}
				}
				if (diff || driver_companies.length != drivergroup.driver_companies.length) {
					data.driver_companies = JSON.stringify(driver_companies);
				}
			}
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.drivergroups.add(data, function (res) {
				MyLoading.hide();
				if (!res.error) {
					$scope.hideDrivergroupSettings();
					$scope.drivergroups.push(res.result);
					$scope.initDrivergroup();
					MyLoading.success($scope.translate('DRIVER_GROUP_SAVED'), 1500);
				} else MyAlert.show(res.result);
			});
		}, 10);
	}
	$scope.removeDrivergroup = function (drivergroup) {
		MyAlert.confirm($scope.translate('QUESTION_DELETE_DRIVER_GROUP')).then(function (res) {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.drivergroups.delete({
				id: drivergroup.id
			}, function (res) {
				MyLoading.hide();
				if (!res.error) {
					for (var i = 0; i < $scope.drivergroups.length; i++) {
						if ($scope.drivergroups[i].id == drivergroup.id) $scope.drivergroups.splice(i, 1);
					}
					MyLoading.success($scope.translate('DRIVER_GROUP_DELETED'), 1500);
				} else MyAlert.show(res.result);
			});
		});
	}
	/* End Driver group*/
	/* Driver */
	$scope.showDriverSettings = function (driver) {
		if ($scope.modalOpening) return;
		$scope.modalOpening = true;
		$scope.hideDrivertypeSettings();
		var mirror_user = clone(driver);
		$scope.initDriver(mirror_user);
		$scope.curType = 'driver';
		$scope.allDriverGroup = [];
		$scope.getDriverGroup(driver);
		MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/settings/drivertype-settings.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (drivertype_settings) {
			modals.push(drivertype_settings);
			$scope.drivertype_settings = drivertype_settings;
			$scope.drivertype_settings.show();
			$scope.modalOpening = false;

			drivertype_settings.$el.on('click', function (e) {
				if (drivertype_settings.backdropClickToClose && e.target === drivertype_settings.el) {
					drivertype_settings.hide();
					drivertype_settings.remove();
					$scope.initDriver();
				}
			});

			drivertype_settings.scope.tab = 0;
			drivertype_settings.scope.changeTab = function (tab) {
				drivertype_settings.scope.tab = tab;
			}

			if (!NEW_FEATURES.MULTI_ADDRESS) {
				var options = {
					types: [],
				};
				if (FULL_ADDRESS_ONLY) {
					options.types.push('address');
				}
				if (COUNTRY_AUTOCOMPLETE != "*") options.componentRestrictions = {
					country: COUNTRY_AUTOCOMPLETE
				}
				$timeout(function () {
					var input = document.getElementById('driver-type-address');
					var autocomplete = new google.maps.places.Autocomplete(input, options);
					autocomplete.setFields(['place_id', 'formatted_address', 'geometry']);
					autocomplete.addListener('place_changed', function () {
						$scope.curDriverType.address = input.value;
						$scope.curDriverType.position = {
							lat: autocomplete.getPlace().geometry.location.lat(),
							lng: autocomplete.getPlace().geometry.location.lng()
						}
						$scope.curDriverType.position.from_google = false;
						address_selected = true;
					});
					input.onkeydown = function () {
						address_selected = false;
					}
				}, 150);
			}

			drivertype_settings.scope.saveUser = function (curDriverType) {
				if (!NEW_FEATURES.MULTI_ADDRESS && curDriverType.address && GOOGLE_AUTOCOMPLETE_SELECTION_REQUIRED && !address_selected) {
					MyAlert.show($scope.translate('SELECT_ADDRESS_FROM_AUTOCOMPLETE'));
				} else {
					if (curDriverType.id == -1) {
						$scope.addUser(curDriverType);
					} else {
						$scope.updateUser(curDriverType);
					}
				}
			}

			// Addresses
			$scope.addresses = [];
			if ($scope.curDriverType.id > 0) {
				Ordering.users.addresses.all({
					user_id: $scope.curDriverType.id
				}, function (res) {
					$scope.loading = false;
					if (!res.error) {
						$scope.addresses = res.result;
					} else MyAlert(res.result);
				});
			}

			$scope.change = function (address) {
				if (ADDONS.web_template) MyLoading.toast($scope.translate('LOADING') + '...');
				else MyLoading.show($scope.translate('LOADING') + '...');
				Ordering.users.addresses.update({
					id: address.id,
					user_id: $scope.curDriverType.id,
					default: true
				}, function (res) {
					MyLoading.hide();
					if (!res.error) {
						$scope.addresses.forEach(function (address) {
							if (address.id != res.result.id) {
								address.default = false;
							} else address.default = true;
						});
						if (ADDONS.web_template) MyLoading.success($scope.translate('ADDRESS_CHANGED'), 2000);
					} else MyAlert.show(res.result);
				})
			}

			$scope.edit = function (address) {
				$scope.openFullAddress(address, function (addr, modal) {
					if (ADDONS.web_template) MyLoading.toast($scope.translate('LOADING') + '...');
					else MyLoading.show($scope.translate('LOADING') + '...');
					Ordering.users.addresses.update({
						id: addr.id,
						user_id: $scope.curDriverType.id,
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
							if (ADDONS.web_template) MyLoading.success($scope.translate('ADDRESS_SAVED'), 2000);
						} else MyAlert.show(res.result);
					});
				});
			}

			$scope.delete = function (address) {
				MyAlert.confirm($scope.translate('QUESTION_DELETE_ADDRESS')).then(function () {
					MyLoading.toast($scope.translate('LOADING') + '...');
					Ordering.users.addresses.delete({
						id: address.id,
						user_id: $scope.curDriverType.id
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
							MyLoading.success($scope.translate('ADDRESS_DELETED'), 2000);
						} else MyAlert.show(res.result);
					});
				});
			}

			$scope.add = function () {
				$scope.openFullAddress(null, function (addr, modal) {
					MyLoading.toast($scope.translate('LOADING') + '...');
					Ordering.users.addresses.add({
						user_id: $scope.curDriverType.id,
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
						default: $scope.addresses.length == 0
					}, function (res) {
						MyLoading.hide();
						if (!res.error) {
							$scope.addresses.push(res.result);
							modal.scope.hide();
							MyLoading.success($scope.translate('ADDRESS_SAVED'), 2000);
						} else MyAlert.show(res.result);
					});
				});
			}
			$scope.reviews = [];
			//Reviews
			console.log($scope.curDriverType)
			if ($scope.curDriverType.id > 0) {
				Ordering.user_reviews.all({
					user_id: $scope.curDriverType.id,
					mode: 'orders'
				}, function (res) {
					if (!res.error) {
						$scope.reviews = res.result;
						console.log(res.result)
					} else MyAlert(res.result);
				});
			}
			if (driver.id == -1) Extensions.runAction('enter_driver_create_editor_view', null, $scope);
			else Extensions.runAction('enter_driver_update_editor_view', null, $scope);
		});
	}
	$scope.updateDriver = function (driver) {
		var error = $scope.checkDriverType(driver);
		if (error) MyAlert.show(error.message);
		else {
			MyLoading.toast($scope.translate('LOADING') + '...');
			Ordering.users.update({
				name: driver.name,
				email: driver.email,
				lastname: driver.lastname,
				password: driver.password,
				city: driver.city,
				zipcode: driver.zipcode,
				address: driver.address,
				phone: driver.phone,
				cellphone: driver.cellphone,
				enabled: driver.enabled
			}, function (res) {
				MyLoading.hide();
				if (res.error == 'false') {
					$scope.hideDrivertypeSettings();
					MyLoading.success($scope.translate('DRIVER_SAVED'), 1500);
				} else MyAlert.show(res.message);
			});
		}
	}
	$scope.changeDriver = function (driver, now) {
		var time = 0;
		if (now) time = 0;
		if (curTimeout) $timeout.cancel(curTimeout);
		curTimeout = $timeout(function () {
			if (!$scope.checkDriverType(driver)) $scope.updateDriver(driver);
		}, time);
	}
	$scope.addDriver = function (driver) {
		var error = $scope.checkDriverType(driver);
		if (error) MyAlert.show(error.message);
		else {
			MyLoading.toast($scope.translate('LOADING') + '...');
			DashboardSvc.drivers().add({
				langId: localStorageApp.getItem(STORE.LANG),
				groupId: driver.group_id,
				name: driver.name,
				email: driver.email,
				lastname: driver.lastname,
				password: driver.password,
				country: driver.country,
				city: driver.city,
				zipcode: driver.zipcode,
				address: driver.address,
				phone: driver.phone,
				tel: driver.mobile,
			}, function (res) {
				MyLoading.hide();
				if (res.error == 'false') {
					driver.id = res.result.driver[0].id;
					$scope.drivers.push(driver);
					$scope.hideDrivertypeSettings();
					MyLoading.success($scope.translate('DRIVER_ADDED'), 1500);
				} else MyAlert.show(res.message);
			});
		}
	}
	$scope.removeDriver = function (driver) {
		MyAlert.confirm($scope.translate('QUESTION_DELETE_DRIVER')).then(function (res) {
			MyLoading.toast($scope.translate('LOADING') + '...');
			DashboardSvc.drivers().delete({
				driverId: driver.id
			}, function (res) {
				MyLoading.hide();
				if (res.error == 'false') {
					for (var i = 0; i < $scope.drivers.length; i++) {
						if ($scope.drivers[i].id == driver.id) $scope.drivers.splice(i, 1);
					}
					MyLoading.success($scope.translate('DRIVER_DELETED'), 1500);
				} else MyAlert.show(res.message);
			});
		});
	}
	$scope.getDriverGroup = function (driver) {
		$scope.allGroupDrivers = [];
		for (var i = 0; i < $scope.drivergroups.length; i++) {
			for (var j = 0; j < $scope.drivergroups[i].drivers.length; j++) {
				if ($scope.drivergroups[i].drivers[j].id == driver.id) {
					$scope.allGroupDrivers.push($scope.drivergroups[i].name);
				}
			}
		}
	}
	/* End Driver */
	// $scope.$on('modal.hidden', function(event) {
	// 	$scope.initDrivermanager();
	// 	$scope.initDrivergroup();
	// 	$scope.initDriver();
	// });
	$(document).ready(function () {
		/***Show Bottom Help***/
		$('[data-toggle="popover"]').popover({ html: true });
		/***Position bottom ButtomHelp***/
		$('#buttonFixed').css({
			'bottom': $('.footer').height() + 15 + 'px',
		});
	});
	Extensions.runAction('enter_drivers_editor_view', null, $scope);
});

_controllers.controller('invoicingSettingsEditorCtrl', function ($scope, $sce, MyModal, MyLoading, MyAlert, Ordering, $rootScope/*newinvoicingSettingsEditorCtrl*/) {
	$scope.openInvoiceBusiness = function () {
		NEW_ADDONS.INVOICE_MANAGER ? MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/settings/business-invoicing.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (business_invoicing) {
			modals.push(business_invoicing);
			MyLoading.show($scope.translate('LOADING') + '...');
			business_invoicing.scope.businesses = [];
			business_invoicing.scope.action = $sce.trustAsResourceUrl((API_URL + '/' + API_VERSION + '/en/' + API_PROJECT_NAME + '/pdf/html').replace(/([^:]\/)\/+/g, "$1"));
			business_invoicing.scope.logo = location.origin + '/' + $scope.rootTheme + '/img/logo.png';
			Ordering.business.all({
				params: 'name',
				mode: 'dashboard'
			}, function (res) {
				if (!res.error) {
					business_invoicing.scope.businesses = res.result;
					Ordering.paymethods.all({
					}, function (res) {
						MyLoading.hide();
						if (!res.error) {
							business_invoicing.scope.paymethods = res.result.filter(function (paymethod) {
								paymethod.selected = true;
								return paymethod.enabled;
							});
						} else MyAlert.show(res.result);
					});
				} else {
					MyLoading.hide();
					MyAlert.show(res.result);
				}
			});
			business_invoicing.scope.hide = function () {
				business_invoicing.hide();
				business_invoicing.remove();
			}
			business_invoicing.$el.on('click', function (e) {
				if (business_invoicing.backdropClickToClose && e.target === business_invoicing.el) {
					business_invoicing.hide();
					business_invoicing.remove();
				}
			});
			business_invoicing.scope.delivery_types = [
				{
					id: 1,
					name: $scope.translate('DELIVERY'),
					selected: true
				},
				{
					id: 2,
					name: $scope.translate('PICKUP'),
					selected: true
				}
			]
			business_invoicing.scope.invoice = {
				type: 'charge',
				from: '',
				to: '',
				business: '',
				cancelled: false,
				discounts: false,
				notes: '',
				percentage_fee: 0,
				fixed_fee: 0,
				tax: 0,
				misc_amount: 0,
				misc_description: ''
			};
			business_invoicing.scope.reverseText = function (str) {
				if (!str) return '';
				var words = [];
				words = str.split("\s+");
				var result = "";
				for (var i = 0; i < words.length; i++) {
					return result += words[i].split('').reverse().join('');
				}
			}
			business_invoicing.scope.export = function () {
				if (business_invoicing.scope.invoice.business == '') {
					return MyAlert.show($scope.translate('VALIDATION_ERROR_EXISTS').replace('_attribute_', $scope.translate('BUSINESS')));
				}
				MyLoading.show($scope.translate('LOADING') + '...');
				var where = [
					{
						attribute: 'business_id',
						value: business_invoicing.scope.invoice.business
					}
				]
				if (business_invoicing.scope.invoice.from) {
					where.push({
						attribute: 'delivery_datetime',
						value: {
							"condition": '>=',
							"value": business_invoicing.scope.invoice.from + ' 00:00:00'
						}
					})
				}
				if (business_invoicing.scope.invoice.to) {
					where.push({
						attribute: 'delivery_datetime',
						value: {
							"condition": '<=',
							"value": business_invoicing.scope.invoice.to + ' 23:59:59'
						}
					})
				}
				Ordering.orders.all({
					mode: 'dashboard',
					where: where
				}, function (res) {
					MyLoading.hide();
					if (!res.error) {
						var paymethods = [];
						business_invoicing.scope.paymethods.forEach(function (paymethod) {
							if (paymethod.selected) paymethods.push(paymethod.id);
						});
						var delivery_types = [];
						business_invoicing.scope.delivery_types.forEach(function (delivery_type) {
							if (delivery_type.selected) delivery_types.push(delivery_type.id);
						});
						var from = business_invoicing.scope.invoice.from.split('-');
						if (from.length == 1) from = null;
						else from = new Date(from[0], from[1] - 1, from[2], 0, 0, 0, 0);
						var to = business_invoicing.scope.invoice.to.split('-');
						if (to.length == 1) to = null;
						else to = new Date(to[0], to[1] - 1, to[2], 0, 0, 0, 0);
						var orders = res.result.filter(function (order) {
							var valid = true;
							var date = order.delivery_datetime.split(' ');
							date = new Date(date[0].split('-')[0], date[0].split('-')[1] - 1, date[0].split('-')[2], 0, 0, 0, 0);
							if (paymethods.indexOf(order.paymethod_id) == -1
								|| delivery_types.indexOf(order.delivery_type) == -1
								|| ([0, 1, 7, 8, 9, 11, 15].indexOf(order.status) == -1 && !business_invoicing.scope.invoice.cancelled)) {
								valid = false;
							}
							if ((from && from > date) || (to && to < date)) valid = false;
							return valid;
						});
						business_invoicing.scope.export_invoice = {
							from: business_invoicing.scope.invoice.from,
							to: business_invoicing.scope.invoice.to,
							type: business_invoicing.scope.invoice.type,
							orders: orders,
							percentage_fee: business_invoicing.scope.invoice.percentage_fee,
							fixed_fee: business_invoicing.scope.invoice.fixed_fee,
							tax: business_invoicing.scope.invoice.tax,
							misc_amount: (business_invoicing.scope.invoice.type != 'payout' ? 1 : -1) * business_invoicing.scope.invoice.misc_amount,
							misc_description: business_invoicing.scope.invoice.misc_description,
							inlcude_discounts: business_invoicing.scope.invoice.discounts,
							tax_products: business_invoicing.scope.invoice.type != 'payout' ? 0 : orders.reduce(function (previous, current) {
								if (current.tax_type == 1) return previous;
								else return previous + $scope.Order.getTax(current);
							}, 0),
							discounts: !business_invoicing.scope.invoice.discounts ? 0 : orders.reduce(function (previous, current) {
								return previous - $scope.Order.getDiscount(current);
							}, 0),
							orders_subtotal: orders.reduce(function (previous, current) {
								return previous + $scope.Order.getSubtotal(current);
							}, 0),
							orders_total: orders.reduce(function (previous, current) {
								return previous + $scope.Order.getTotal(current);
							}, 0),
							notes: business_invoicing.scope.invoice.notes.replace(/\n/g, "<br>"),
						};
						business_invoicing.scope.export_invoice.percentage_fee_total = (business_invoicing.scope.invoice.type != 'payout' ? 1 : -1) * (business_invoicing.scope.export_invoice.orders_subtotal + business_invoicing.scope.export_invoice.discounts) * business_invoicing.scope.invoice.percentage_fee / 100;
						business_invoicing.scope.export_invoice.fixed_fee_total = (business_invoicing.scope.invoice.type != 'payout' ? 1 : -1) * orders.length * business_invoicing.scope.invoice.fixed_fee;
						var subtotal = parseFloat(business_invoicing.scope.export_invoice.percentage_fee_total)
							+ parseFloat(business_invoicing.scope.export_invoice.fixed_fee_total)
							+ parseFloat(business_invoicing.scope.export_invoice.misc_amount)
							+ parseFloat(business_invoicing.scope.export_invoice.discounts)
							+ parseFloat(business_invoicing.scope.export_invoice.tax_products)
							+ (business_invoicing.scope.invoice.type != 'payout' ? 0 : parseFloat(business_invoicing.scope.export_invoice.orders_subtotal));
						business_invoicing.scope.export_invoice.subtotal = subtotal;
						business_invoicing.scope.export_invoice.tax_total = (business_invoicing.scope.invoice.type != 'payout' ? 1 : -1) * subtotal * parseFloat(business_invoicing.scope.invoice.tax) / 100;
						business_invoicing.scope.export_invoice.total = subtotal + business_invoicing.scope.export_invoice.tax_total;
						business_invoicing.scope.businesses.forEach(function (business) {
							if (business.id == business_invoicing.scope.invoice.business) {
								business_invoicing.scope.export_invoice.business = business;
							}
						});
						setTimeout(function () {
							var html = $('#invoice_business').html();
							if ($rootScope.arabic_rtl) html = $('#invoice_business_rtl').html();
							$('#input-html').val(html);
							$('#btn-submit').click();
						}, 200);
					} else MyAlert.show(res.result);
				});
			}
			business_invoicing.show().then(function () {
				setTimeout(function () {
					var element_from = $("[id='business-invoice-from']").last();
					var element_to = $("[id='business-invoice-to']").last();
					var datefrom = element_from.datetimepicker({
						format: 'YYYY-MM-DD',
					});
					datefrom.on('dp.show', function () {
						$(".bootstrap-datetimepicker-widget").attr('data-tap-disabled', 'true');
					});
					var dateto = element_to.datetimepicker({
						useCurrent: false, //Important! See issue #1075
						format: 'YYYY-MM-DD',
					});
					dateto.on('dp.show', function () {
						$(".bootstrap-datetimepicker-widget").attr('data-tap-disabled', 'true');
						$(".bootstrap-datetimepicker-widget").css({ 'right': '0px', 'left': 'auto' })
					});
					element_from.on("dp.change", function (e) {
						element_to.data("DateTimePicker").minDate(e.date);
						$scope.$apply(function () {
							business_invoicing.scope.invoice.to = element_to.val();
							business_invoicing.scope.invoice.from = element_from.val();
						});
					});
					element_to.on("dp.change", function (e) {
						element_from.data("DateTimePicker").maxDate(e.date)
						$scope.$apply(function () {
							business_invoicing.scope.invoice.to = element_to.val();
							business_invoicing.scope.invoice.from = element_from.val();
						});
					});
				}, 200);
			});
			$(document).ready(function () {
				$('[data-toggle="popover"]').popover({ html: true })
			});
			/***Show Bottom Help***/
		}) : MyAlert.show($scope.translate('ERROR_NOT_PERMISSION'));
	}

	$scope.openInvoiceDriver = function () {
		NEW_ADDONS.INVOICE_MANAGER ? MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/settings/driver-invoicing.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (driver_invoicing) {
			modals.push(driver_invoicing);
			driver_invoicing.scope.drivers = [];
			driver_invoicing.scope.action = $sce.trustAsResourceUrl((API_URL + '/' + API_VERSION + '/en/' + API_PROJECT_NAME + '/pdf/html').replace(/([^:]\/)\/+/g, "$1"));
			driver_invoicing.scope.logo = location.origin + '/' + $scope.rootTheme + '/img/logo.png';
			driver_invoicing.scope.invoice = {
				from: '',
				to: '',
				driver: '',
				cancelled: false,
				notes: '',
				percentage_fee: 0,
				fixed_fee: 0,
				percentage_delivery_price: 0,
				percentage_driver_tip: 0,
				tax: 0,
				misc_amount: 0,
				misc_description: ''
			};
			MyLoading.show($scope.translate('LOADING') + '...');
			Ordering.users.all({
				params: 'name',
				where: { level: 4 }
			}, function (res) {
				if (!res.error) {
					driver_invoicing.scope.drivers = res.result;
					Ordering.paymethods.all({
					}, function (res) {
						MyLoading.hide();
						if (!res.error) {
							driver_invoicing.scope.paymethods = res.result.filter(function (paymethod) {
								paymethod.selected = true;
								return paymethod.enabled;
							});
						} else MyAlert.show(res.result);
					});
				} else {
					MyLoading.hide();
					MyAlert.show(res.result);
				}
			});
			driver_invoicing.scope.hide = function () {
				driver_invoicing.hide();
				driver_invoicing.remove();
			}
			driver_invoicing.$el.on('click', function (e) {
				if (driver_invoicing.backdropClickToClose && e.target === driver_invoicing.el) {
					driver_invoicing.hide();
					driver_invoicing.remove();
				}
			});
			driver_invoicing.scope.reverseText = function (str) {
				if (!str) return '';
				var words = [];
				words = str.split("\s+");
				var result = "";
				for (var i = 0; i < words.length; i++) {
					return result += words[i].split('').reverse().join('');
				}
			}
			driver_invoicing.scope.export = function () {
				if (driver_invoicing.scope.invoice.driver == '') {
					return MyAlert.show($scope.translate('VALIDATION_ERROR_EXISTS').replace('_attribute_', $scope.translate('DRIVER')));
				}
				MyLoading.show($scope.translate('LOADING') + '...');
				var where = [
					{
						attribute: 'driver_id',
						value: driver_invoicing.scope.invoice.driver
					}
				]
				if (driver_invoicing.scope.invoice.from) {
					where.push({
						attribute: 'delivery_datetime',
						value: {
							"condition": '>=',
							"value": driver_invoicing.scope.invoice.from + ' 00:00:00'
						}
					})
				}
				if (driver_invoicing.scope.invoice.to) {
					where.push({
						attribute: 'delivery_datetime',
						value: {
							"condition": '<=',
							"value": driver_invoicing.scope.invoice.to + ' 23:59:59'
						}
					})
				}
				Ordering.orders.all({
					mode: 'dashboard',
					where: where
				}, function (res) {
					MyLoading.hide();
					if (!res.error) {
						var paymethods = [];
						driver_invoicing.scope.paymethods.forEach(function (paymethod) {
							if (paymethod.selected) paymethods.push(paymethod.id);
						});
						var from = driver_invoicing.scope.invoice.from.split('-');
						if (from.length == 1) from = null;
						else from = new Date(from[0], from[1] - 1, from[2], 0, 0, 0, 0);
						var to = driver_invoicing.scope.invoice.to.split('-');
						if (to.length == 1) to = null;
						else to = new Date(to[0], to[1] - 1, to[2], 0, 0, 0, 0);
						var orders = res.result.filter(function (order) {
							var valid = true;
							var date = order.delivery_datetime.split(' ');
							date = new Date(date[0].split('-')[0], date[0].split('-')[1] - 1, date[0].split('-')[2], 0, 0, 0, 0);
							if (paymethods.indexOf(order.paymethod_id) == -1
								|| [1, 2, 5, 6, 10, 11, 12].indexOf(order.status) == -1
								|| ([2, 5, 6, 10, 12].indexOf(order.status) > -1 && !driver_invoicing.scope.invoice.cancelled)) {
								valid = false;
							}
							if ((from && from > date) || (to && to < date)) valid = false;
							return valid;
						});
						driver_invoicing.scope.export_invoice = {
							from: driver_invoicing.scope.invoice.from,
							to: driver_invoicing.scope.invoice.to,
							orders: orders,
							percentage_fee: driver_invoicing.scope.invoice.percentage_fee,
							fixed_fee: driver_invoicing.scope.invoice.fixed_fee,
							tax: driver_invoicing.scope.invoice.tax,
							misc_amount: driver_invoicing.scope.invoice.misc_amount,
							misc_description: driver_invoicing.scope.invoice.misc_description,
							orders_subtotal: orders.reduce(function (previous, current) {
								return previous + $scope.Order.getSubtotal(current) + (current.tax_type == 1 ? $scope.Order.getTax(current) : 0);
							}, 0),
							orders_total: orders.reduce(function (previous, current) {
								return previous + $scope.Order.getTotal(current);
							}, 0),
							discounts: orders.reduce(function (previous, current) {
								return previous - $scope.Order.getDiscount(current);
							}, 0),
							percentage_delivery_price: driver_invoicing.scope.invoice.percentage_delivery_price,
							percentage_delivery_price_total: orders.reduce(function (previous, current) {
								return previous + current.delivery_zone_price;
							}, 0) * driver_invoicing.scope.invoice.percentage_delivery_price / 100,
							percentage_driver_tip: driver_invoicing.scope.invoice.percentage_driver_tip,
							percentage_driver_tip_total: orders.reduce(function (previous, current) {
								return previous + $scope.Order.getDriverTip(current);
							}, 0) * driver_invoicing.scope.invoice.percentage_driver_tip / 100,
							notes: driver_invoicing.scope.invoice.notes.replace(/\n/g, "<br>"),
						};
						driver_invoicing.scope.export_invoice.percentage_fee_total = (driver_invoicing.scope.export_invoice.orders_subtotal + driver_invoicing.scope.export_invoice.discounts) * driver_invoicing.scope.invoice.percentage_fee / 100;
						driver_invoicing.scope.export_invoice.fixed_fee_total = orders.length * driver_invoicing.scope.invoice.fixed_fee;
						var subtotal = parseFloat(driver_invoicing.scope.export_invoice.percentage_fee_total)
							// +parseFloat(driver_invoicing.scope.export_invoice.discounts)
							+ parseFloat(driver_invoicing.scope.export_invoice.fixed_fee_total)
							+ parseFloat(driver_invoicing.scope.export_invoice.misc_amount)
							+ parseFloat(driver_invoicing.scope.export_invoice.percentage_delivery_price_total)
							+ parseFloat(driver_invoicing.scope.export_invoice.percentage_driver_tip_total);
						driver_invoicing.scope.export_invoice.subtotal = subtotal;
						driver_invoicing.scope.export_invoice.tax_total = subtotal * parseFloat(driver_invoicing.scope.invoice.tax) / 100;
						driver_invoicing.scope.export_invoice.total = subtotal + driver_invoicing.scope.export_invoice.tax_total;
						driver_invoicing.scope.drivers.forEach(function (driver) {
							if (driver.id == driver_invoicing.scope.invoice.driver) {
								driver_invoicing.scope.export_invoice.driver = driver;
							}
						});
						setTimeout(function () {
							var html = $('#invoice_driver').html();
							if ($rootScope.arabic_rtl) html = $('#invoice_driver_rtl').html();
							$('#input-html').val(html);
							$('#btn-submit').click();
						}, 200);
					} else MyAlert.show(res.result);
				});
			}
			driver_invoicing.show().then(function () {
				setTimeout(function () {
					var element_from = $("[id='driver-invoice-from']").last();
					var element_to = $("[id='driver-invoice-to']").last();
					var datefrom = element_from.datetimepicker({
						format: 'YYYY-MM-DD',
					});
					datefrom.on('dp.show', function () {
						$(".bootstrap-datetimepicker-widget").attr('data-tap-disabled', 'true');
					});
					var dateto = element_to.datetimepicker({
						useCurrent: false, //Important! See issue #1075
						format: 'YYYY-MM-DD',
					});
					dateto.on('dp.show', function () {
						$(".bootstrap-datetimepicker-widget").attr('data-tap-disabled', 'true');
						$(".bootstrap-datetimepicker-widget").css({ 'right': '0px', 'left': 'auto' })
					});
					element_from.on("dp.change", function (e) {
						element_to.data("DateTimePicker").minDate(e.date);
						$scope.$apply(function () {
							driver_invoicing.scope.invoice.to = element_to.val();
							driver_invoicing.scope.invoice.from = element_from.val();
						});
					});
					element_to.on("dp.change", function (e) {
						element_from.data("DateTimePicker").maxDate(e.date)
						$scope.$apply(function () {
							driver_invoicing.scope.invoice.to = element_to.val();
							driver_invoicing.scope.invoice.from = element_from.val();
						});
					});
				}, 200);
			});
			$(document).ready(function () {
				$('[data-toggle="popover"]').popover({ html: true })
			});
			/***Show Bottom Help***/
		}) : MyAlert.show($scope.translate('ERROR_NOT_PERMISSION'));
	};
	$(document).ready(function () {
		/***Show Bottom Help***/
		$('[data-toggle="popover"]').popover({ html: true });
		/***Position bottom ButtomHelp***/
		$('#buttonFixed').css({
			'bottom': $('.footer').height() + 15 + 'px',
		});
	});
});

_controllers.controller('pagesSettingsEditorCtrl', function ($scope, Ordering, MyAlert, MyLoading, $state, $rootScope) {
	MyLoading.show($scope.translate('LOADING') + '...');
	$rootScope.getPages()
	$scope.pagepagination = {
		current: 1,
		pages: 1,
		items: 10,
		itemsPerPage: [10, 20, 30, 50]
	}
	$scope.nextPage = function (pagination) {
		if (pagination.current < pagination.pages) pagination.current++;
	}
	$scope.backPage = function (pagination) {
		if (pagination.current > 0) pagination.current--;
	}
	$scope.updatePage = function (page) {
		MyLoading.toast($scope.translate('LOADING') + '...');
		Ordering.pages.update({
			page_id: page.id,
			name: page.name,
			enabled: page.enabled,
			slug: page.slug
		}, function (res) {
			if (!res.error) {
				MyLoading.success($scope.translate('PAGE_SAVED'), 1500)
			} else MyAlert.show(res.result)
		})
	}
	$scope.removePage = function (page) {
		console.log(page)
		MyLoading.toast($scope.translate('LOADING') + '...');
		Ordering.pages.delete({
			page_id: page.id,
		}, function (res) {
			if (!res.error) {
				for (var i = 0; i < $rootScope.customPages.length; i++) {
					if ($rootScope.customPages[i].id == page.id) {
						$rootScope.customPages.splice(i, 1);
						break;
					}
				}
				MyLoading.success($scope.translate('PAGE_DELETED'), 1500)
			} else MyAlert.show(res.result)
		})
	}
	$(document).ready(function () {
		/***Show Bottom Help***/
		$('[data-toggle="popover"]').popover({ html: true });
		/***Position bottom ButtomHelp***/
		$('#buttonFixed').css({
			'bottom': $('.footer').height() + 15 + 'px',
		});
	});
	$scope.showPageEditor = function (slug) {
		$state.go('main.settings-page', { slug: slug })
	}
});
_controllers.controller('pageSettingEditorCtrl', function ($scope, $rootScope, $state, MyAlert, Ordering, MyModal, MyLoading) {
	//summerEditor
	$scope.curTemplate = 'templates/' + ADDONS.template + '/views/editor/settings/includes/page-editor.html';
	$scope.changeTemplate = function (template) {
		if ($scope.unSaved) {
			MyAlert.confirm($scope.translate('QUESTION_EXIT_EDITOR')).then(function () {
				location.href = (!WEB_ADDONS.remove_hash ? '#' : '') + '/settings/' + template
			}
			)
		} else location.href = (!WEB_ADDONS.remove_hash ? '#' : '') + '/settings/' + template
	};
	$scope.metaChange = function () {
		$scope.unSaved = true
	}
	$scope.unSaved = false;
	$scope.gallery = [];
	$scope.page = {};
	$scope.host = location.host;
	Ordering.files.all({
		where: { type: 1 },
	}, function (res) {
		if (!res.error) $scope.gallery = res.result;
	});
	$scope.slug = $state.params.slug;

	// Add plugin for custom buttoms and modals
	(function (factory) {
		/* global define */
		if (typeof define === 'function' && define.amd) {
			// AMD. Register as an anonymous module.
			define(['jquery'], factory);
		} else if (typeof module === 'object' && module.exports) {
			// Node/CommonJS
			module.exports = factory(require('jquery'));
		} else {
			// Browser globals
			factory(window.jQuery);
		}
	}(function ($) {
		$.extend($.summernote.plugins, {
			'modal': function (context) {
				var ui = $.summernote.ui;
				var editor = $('#summernote');
				context.memo('button.insertImage', function () {
					var button = ui.button({
						contents: '<i class="note-icon-picture"/>',
						tooltip: 'Image',
						click: function () {
							editor.summernote('saveRange');
							MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/settings/insert-image.html', {
								scope: $scope,
								animation: 'slide-in-up'
							}).then(function (insert_image) {
								modals.push(insert_image);
								insert_image.show();
								insert_image.scope.data = { imageUrl: '' }
								Extensions.runAction('after_open_image_page_editor_view', $scope.gallery, insert_image.scope);
								insert_image.scope.hide = function () {
									insert_image.hide();
									insert_image.remove();
								};
								insert_image.scope.selectImage = function (item) {
									insert_image.scope.data.imageUrl = item;
								}
								insert_image.scope.removeGallery = function (item) {
									Ordering.files.delete({ id: item.id }, function (res) {
										if (!res.error) {
											MyLoading.success('FILE_DELETED', 1500)
										}
									})
								}
								insert_image.scope.insertImage = function () {
									editor.summernote('restoreRange');
									editor.summernote('insertImage', insert_image.scope.data.imageUrl);
									insert_image.scope.hide();
								}
							});
						}
					});
					// create jQuery object from button instance.
					return button.render();
				});
				context.memo('button.insertVideo', function () {
					var button = ui.button({
						contents: '<i class="note-icon-video"/>',
						tooltip: 'my modal',
						click: function () {
							editor.summernote('saveRange');
							MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/settings/insert-video.html', {
								scope: $scope,
								animation: 'slide-in-up'
							}).then(function (insert_video) {
								modals.push(insert_video)
								insert_video.show()
								insert_video.scope.data = { videoUrl: '' }
								insert_video.scope.hide = function () {
									insert_video.hide()
									insert_video.remove()
								}

								insert_video.scope.insertVideo = function () {
									var HTMLstring = $rootScope.getVideoEmbedded(insert_video.scope.data.videoUrl);
									editor.summernote('restoreRange');
									editor.summernote('pasteHTML', HTMLstring);
									insert_video.scope.hide();
								}
							});
						}
					});
					// create jQuery object from button instance.
					return button.render();
				});
				context.memo('button.insertLink', function () {
					var button = ui.button({
						contents: '<i class="note-icon-link"/>',
						tooltip: 'my modal',
						click: function () {
							editor.summernote('saveRange');
							MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/settings/insert-link.html', {
								scope: $scope,
								animation: 'slide-in-up'
							}).then(function (insert_link) {
								insert_link.scope.linkInfo = editor.summernote('getLinkInfo')
								modals.push(insert_link);
								insert_link.show();
								insert_link.scope.data = {
									range: insert_link.scope.linkInfo.range,
									text: insert_link.scope.linkInfo.text,
									url: insert_link.scope.linkInfo.url,
									isNewWindow: true
								}
								insert_link.scope.hide = function () {
									insert_link.hide();
									insert_link.remove();
								}
								insert_link.scope.insertLink = function (data) {
									editor.summernote('restoreRange');
									editor.summernote('createLink', data);
									insert_link.scope.hide();
								}
							});
						}
					});
					// create jQuery object from button instance.
					return button.render();
				});
			}
		});
	}));
	//---------------
	setTimeout(function () {
		$('#summernote').summernote({
			placeholder: $scope.translate('START_NEW_PAGE'),
			height: 300,
			fontNames: ['Arial', 'Arial Black', 'Comic Sans MS', 'Courier New'],
			toolbar: [
				// [groupName, [list of button]]
				['style', ['style']],
				['style', ['bold', 'italic', 'underline', 'clear']],
				['fontsize', ['fontsize']],
				['color', ['color']],
				['para', ['ul', 'paragraph']],
				['table', ['table']],
				['insert', ['insertLink', 'insertImage', 'insertVideo']],
				['codeview', ['codeview']]
			],
			popover: {
				link: [
					['link', ['unlink', 'insertLink']]
				],
			},
			callbacks: {
				onImageUpload: function (files) {
					getBase64(files[0], function (a, file64) {
						Ordering.files.add({
							type: 1,
							source: file64
						}, function (res) {
							console.log(res)
							$('#summernote').summernote('insertImage', res.result.source);
						});
					})
				},
				onChange: function (contents, $editable) {
					$scope.unSaved = true;
				}
			}
		});
		if ($scope.slug != -1) {
			MyLoading.show($scope.translate('LOADING') + '...')
			Ordering.pages.get({
				page_id: $scope.slug
			}, function (res) {
				MyLoading.hide()
				if (!res.error) {
					$scope.page = res.result;
					$('#summernote').summernote('code', $scope.page.body);
					$scope.unSaved = false;
				} else MyAlert.show(res.result).then(function () {
					$scope.changeTemplate('pages')
				})
			})
		}
		var element = document.getElementsByClassName('note-codable')[0]
		element.addEventListener('input', function () {
			$scope.unSaved = true;
		})
	}, 500);
	$scope.save = function () {
		if (!$scope.unSaved) return
		var markupStr = $('#summernote').summernote('code');
		$scope.unSaved = false;
		MyLoading.toast($scope.translate('LOADING') + '...');
		if ($scope.slug == -1) {
			Ordering.pages.add({
				body: markupStr,
				name: $scope.page.name,
				slug: $scope.page.slug
			}, function (res) {
				MyLoading.hide()
				if (!res.error) {
					$scope.page = res.result
					$scope.slug = res.result.id
					$rootScope.customPages.push({
						name: res.result.name,
						slug: res.result.slug,
						enabled: res.result.enabled
					})
					MyLoading.success($scope.translate('PAGE_ADDED'), 1500);
				} else MyAlert.show(res.result)
			})
		} else {
			Ordering.pages.update({
				page_id: $scope.page.id,
				body: markupStr,
				name: $scope.page.name,
				slug: $scope.page.slug
			}, function (res) {
				MyLoading.hide()
				if (!res.error) {
					MyLoading.success($scope.translate('PAGE_SAVED'), 1500);
					$rootScope.customPages.forEach(function (page) {
						if (page.id == $scope.page.id) {
							page.name = $scope.page.name;
							page.slug = $scope.page.slug;
						}
					})
				} else MyAlert.show(res.result)
			})
		}
	}
	$scope.cancel = function () {
		$scope.changeTemplate('pages')
	}
})
_controllers.controller('reportsEditorCtrl', function ($scope, MyModal, MyLoading, MyAlert, Ordering, gUser, $state/*newreportsEditorCtrl*/) {
	$scope.isBusinessOwner = gUser.getData().level == 2;
	if (!$scope.superAdmin && !$scope.isBusinessOwner) {
		// MyLoading.hide();
		return $state.go(app_states.homeScreen);
	}
	$scope.isSuperAdmins = gUser.getData().level == 0;
	$scope.accept_spend = 0;
	$scope.filters = {
		businesses: [],
		filter: 'today',
		app: '',
		lapse: { from: '', to: '' }
	};
	$scope.reports = {
		topSelling: null,
		topCategories: null,
		ordersStatus: null,
		ordersAcceptSpend: null,
		ArrivedPickupSpend: null,
		customerSatisfaction: null,
		sales: null,
		orders: null,
		users: null
	};
	for (var key in $scope.reports) {
		$scope.reports[key] = {
			chart: null,
			loading: true,
			filter: 'today',
			lapse: { from: '', to: '' },
			businesses: []
		};
	}
	$scope.app_ids = []
	Ordering.reports.app_ids({}, function (res) {
		if (!res.error) {
			$scope.app_ids = res.result;
		}
	})
	createLapse({
		from: '#filter-from',
		to: '#filter-to'
	}, $scope.filters.lapse);

	$scope.filterBusiness = function (businesses, cb) {
		MyLoading.show($scope.translate('LOADING') + '...');
		Ordering.business.all({
			mode: 'dashboard',
			params: 'id,name,slug'
		}, function (res) {
			MyLoading.hide();
			if (!res.error) {
				MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/business-filter.html', {
					scope: $scope,
				}).then(function (filter_business) {
					filter_business.scope.selected = {};
					res.result.forEach(function (business) {
						filter_business.scope.selected[business.slug] = businesses.length == 0 || businesses.indexOf(business.id) != -1;
					});
					filter_business.scope.all = businesses.length == 0;
					filter_business.scope.toggleAll = function () {
						filter_business.scope.all = !filter_business.scope.all;
						res.result.forEach(function (business) {
							filter_business.scope.selected[business.slug] = filter_business.scope.all;
						});
					}
					filter_business.scope.refresh = function () {
						for (var key in filter_business.scope.selected) {
							if (!filter_business.scope.selected[key]) {
								filter_business.scope.all = false;
								break;
							}
						}
					}
					filter_business.scope.toggleBusiness = function (business) {
						filter_business.scope.selected[business] = !filter_business.scope.selected[business];
						filter_business.scope.refresh();
					}
					filter_business.scope.apply = function () {
						var filtered = [];
						res.result.forEach(function (business) {
							if (filter_business.scope.selected[business.slug]) {
								filtered.push(business.id);
							}
						});
						filter_business.scope.hide();
						cb(filtered);
					}
					filter_business.scope.hide = function () {
						filter_business.hide();
						filter_business.remove();
					}
					filter_business.show().then(function () {
						filter_business.scope.businesses = res.result;
					});
				});
			} else MyAlert.show(res.result);
		});
	}

	$scope.openBusinessFilter = function () {
		$scope.filterBusiness($scope.filters.businesses, function (businesses) {
			$scope.filters.businesses = businesses;
		});
	}
	var timeAxes = [];
	$scope.$watchGroup(['filters.businesses', 'filters.filter', 'filters.app'], function () {
		updateTimeAxes(function () {
			updateOrders();
			updateSales();
			updateTopSelling();
			updateTopCategories();
			if ($scope.isSuperAdmins) updateUsers();
			updateCustomerSatisfaction();
			updateOrdersStatus();
			updateOrdersAcceptSpend();
			if (NEW_ADDONS.HEATMAP) updateHeatMap();
			updateArrivedPickupSpend();
		});
	});

	// $scope.clearBusiness = function (report) {
	// 	report.businesses = [];
	// }

	$scope.clearBusinessFilter = function () {
		$scope.filters.businesses = [];
	}

	function updateTopSelling() {
		$scope.reports.topSelling.loading = true;
		var options = {
			lapse: $scope.filters.filter
		};
		if ($scope.filters.businesses.length > 0) options.businesses = $scope.filters.businesses;
		if ($scope.filters.app) options.app_id = $scope.filters.app;
		Ordering.reports.topSelling(options, function (res) {
			if (!res.error) {
				$scope.topSelling = res.result;
				var labels = [];
				var data = [];
				res.result.forEach(function (product) {
					labels.push(product.name.split(' '));
					data.push(product.sales);
				});
				if (!$scope.reports.topSelling.chart) {
					$scope.reports.topSelling.chart = makeChart('topSelling', {
						type: 'bar',
						label: $scope.translate('TOP_PRODUCTS'),
						labels: labels,
						data: data,
						xAxes: [{
							scaleFontSize: 20,
							ticks: {
								display: false,
							}
						}]
					});
				} else {
					$scope.reports.topSelling.chart.data.labels = labels;
					$scope.reports.topSelling.chart.data.datasets.forEach(function (dataset) {
						dataset.data = data;
					});
					$scope.reports.topSelling.chart.update();
				}
				$scope.reports.topSelling.loading = false;
			} else MyAlert.show(res.result);
		});
	}
	// $scope.$watchGroup(['reports.topSelling.businesses', 'reports.topSelling.filter'], updateTopSelling);
	function updateTimeAxes(cb) {
		var unitdate = getTimeAxes($scope.filters.filter)[0].time.unit;
		var maxdate = moment(getTimeAxes($scope.filters.filter)[0].time.max).endOf(unitdate);
		var mindate = moment(getTimeAxes($scope.filters.filter)[0].time.min).startOf(unitdate);
		var curDate = mindate;
		var newTimeAxes = [];
		var adder = 'd';
		switch (unitdate) {
			case 'day': adder = 'd';
				break;
			case 'month': adder = 'M';
				break;
			case 'year': adder = 'y';
				break;
			case 'hour': adder = 'h';
				break;
			default: break;
		}
		do {
			newTimeAxes.push(moment(curDate._d.getTime()).format('YYYY-MM-DD HH:mm:ss'));
			curDate = curDate.clone().add(1, adder);
		}
		while (curDate <= maxdate);
		timeAxes = newTimeAxes;
		return cb();
	}
	function updateTopCategories() {
		$scope.reports.topCategories.loading = true;
		var options = {
			lapse: $scope.filters.filter
		};
		if ($scope.filters.businesses.length > 0) options.businesses = $scope.filters.businesses;
		if ($scope.filters.app) options.app_id = $scope.filters.app;
		Ordering.reports.topCategories(options, function (res) {
			if (!res.error) {
				$scope.topCategories = res.result;
				var labels = [];
				var data = [];
				res.result.forEach(function (category) {
					labels.push(category.name.split(' '));
					data.push(category.sales);
				});
				if (!$scope.reports.topCategories.chart) {
					$scope.reports.topCategories.chart = makeChart('topCategories', {
						type: 'bar',
						label: $scope.translate('TOP_CATEGORIES'),
						labels: labels,
						data: data,
						xAxes: [{
							scaleFontSize: 20,
							ticks: {
								display: false,
							}
						}]
					});
				} else {
					$scope.reports.topCategories.chart.data.labels = labels;
					$scope.reports.topCategories.chart.data.datasets.forEach(function (dataset) {
						dataset.data = data;
					});
					$scope.reports.topCategories.chart.update();
				}
				$scope.reports.topCategories.loading = false;
			} else MyAlert.show(res.result);
		});
	}
	// $scope.$watchGroup(['reports.topCategories.businesses', 'reports.topCategories.filter'], updateTopCategories);

	function updateUsers() {
		$scope.reports.users.loading = true;
		var options = {
			lapse: $scope.filters.filter
		};
		if ($scope.filters.businesses.length > 0) options.businesses = $scope.filters.businesses;
		if ($scope.filters.app) options.app_id = $scope.filters.app;
		Ordering.reports.users(options, function (res) {
			if (!res.error) {
				var labels = [];
				var data = [];
				// res.result.forEach(function (history) {
				// 	labels.push(history.time);
				// 	data.push(history.users);
				// });
				timeAxes.forEach(function (axe) {
					var index = res.result.findIndex(function (history) {
						return axe == history.time
					})
					if (index != -1) {
						labels.push(res.result[index].time);
						data.push(res.result[index].users);
					} else {
						labels.push(axe);
						data.push(0);
					}
				})
				if (!$scope.reports.users.chart) {
					$scope.reports.users.chart = makeChart('usersHistory', {
						type: 'line',
						label: $scope.translate('USER_HISTORY'),
						labels: labels,
						data: data,
						xAxes: getTimeAxes($scope.filters.filter),
						tooltips: {
							callbacks: {
								title: function (tooltipItem) {
									return getLabelDateByFilter(tooltipItem[0].xLabel, $scope.filters.filter);
								}
							}
						}
					});
				} else {
					$scope.reports.users.chart.data.labels = labels;
					$scope.reports.users.chart.data.datasets.forEach(function (dataset) {
						dataset.data = data;
					});
					$scope.reports.users.chart.options.scales.xAxes = getTimeAxes($scope.filters.filter);
					$scope.reports.users.chart.update();
				}
				$scope.reports.users.loading = false;
			} else MyAlert.show(res.result);
		});
	}
	// $scope.$watchGroup(['reports.users.businesses', 'reports.users.filter'], updateUsers);
	$scope.orderStatus = []
	function updateOrdersStatus() {
		$scope.reports.ordersStatus.loading = true;
		var options = {
			lapse: $scope.filters.filter
		};
		if ($scope.filters.businesses.length > 0) options.businesses = $scope.filters.businesses;
		if ($scope.filters.app) options.app_id = $scope.filters.app;
		Ordering.reports.ordersStatus(options, function (res) {
			if (!res.error) {
				$scope.orderStatus = res.result;
				var labels = [$scope.translate('ALL_ORDERS_100')];
				var totalOrders = res.result.reduce(function (previous, current) {
					return previous + current.orders;
				}, 0);
				var data = [totalOrders];
				res.result.forEach(function (order) {
					labels.push($scope.getOrderState(order.status) + " (" + (100 * order.orders / totalOrders).toFixed(2) + "%)");
					data.push(order.orders);
				});
				if (!$scope.reports.ordersStatus.chart) {
					$scope.reports.ordersStatus.chart = makeChart('ordersStatus', {
						type: 'horizontalBar',
						label: $scope.translate('ORDERS_STATUS'),
						labels: labels,
						data: data,
						xAxes: [{
							scaleFontSize: 20,
							ticks: {
								beginAtZero: true
							}
						}]
					});
				} else {
					$scope.reports.ordersStatus.chart.data.labels = labels;
					$scope.reports.ordersStatus.chart.data.datasets.forEach(function (dataset) {
						dataset.data = data;
					});
					$scope.reports.ordersStatus.chart.update();
				}
				$scope.reports.ordersStatus.loading = false;
			} else MyAlert.show(res.result);
		});
	}
	// $scope.$watchGroup(['reports.ordersStatus.businesses', 'reports.ordersStatus.filter'], updateOrdersStatus);

	function updateCustomerSatisfaction(params) {
		$scope.reports.customerSatisfaction.loading = true;
		var options = {
			lapse: $scope.filters.filter
		};
		if ($scope.filters.businesses.length > 0) options.businesses = $scope.filters.businesses;
		if ($scope.filters.app) options.app_id = $scope.filters.app;
		Ordering.reports.customerSatisfaction(options, function (res) {
			if (!res.error) {
				var labels = [
					$scope.translate('GENERAL'),
					$scope.translate('QUALITY'),
					$scope.translate('DELIVERY'),
					$scope.translate('SERVICE'),
					$scope.translate('PACKAGE')
				];
				var data = [
					res.result.general,
					res.result.quality,
					res.result.delivery,
					res.result.service,
					res.result.package
				];
				if (!$scope.reports.customerSatisfaction.chart) {
					$scope.reports.customerSatisfaction.chart = makeChart('customerSatisfaction', {
						type: 'horizontalBar',
						label: $scope.translate('CUSTOMER_SATISFACTION'),
						labels: labels,
						data: data,
						xAxes: [{
							scaleFontSize: 20,
							ticks: {
								beginAtZero: true
							}
						}]
					});
				} else {
					$scope.reports.customerSatisfaction.chart.data.labels = labels;
					$scope.reports.customerSatisfaction.chart.data.datasets.forEach(function (dataset) {
						dataset.data = data;
					});
					$scope.reports.customerSatisfaction.chart.update();
				}
				$scope.reports.customerSatisfaction.loading = false;
			} else MyAlert.show(res.result);
		});
	}
	// $scope.$watchGroup(['reports.customerSatisfaction.businesses', 'reports.customerSatisfaction.filter'], updateCustomerSatisfaction);
	$scope.total_sales = 0;
	$scope.Sales = [];
	$scope.getTimeFormat = function (date, lapse) {
		switch (lapse) {
			case 'today':
			case 'yesterday':
				new_date = moment(date).format('HH:00');
				break;
			case 'last_7_days':
			case 'last_30_days':
				new_date = moment(date).format('YYYY-MM-DD');
				break;
			default:
				var lapse = lapse.split(',');
				var from = moment(lapse[0] + ' 00:00:00');
				var to = moment(lapse[1] + ' 24:00:00');
				var duration = moment.duration(from.diff(to));
				var hours = Math.abs(duration.asHours());
				var days = Math.abs(duration.asDays());
				var months = Math.abs(duration.asMonths());
				if (hours <= 24) {
					new_date = moment(date).format('HH:MM:SS');
				} else if (days <= 30) {
					new_date = moment(date).format('YYYY-MM-DD');
				} else if (months <= 12) {
					new_date = moment(date).format('YYYY-MM');
				} else {
					new_date = moment(date).format('YYYY-MM');
				}
				break;
		}
		return new_date;
	}
	function updateSales() {
		$scope.reports.sales.loading = true;
		var options = {
			lapse: $scope.filters.filter
		};
		if ($scope.filters.businesses.length > 0) options.businesses = $scope.filters.businesses;
		if ($scope.filters.app) options.app_id = $scope.filters.app;
		Ordering.reports.sales(options, function (res) {
			if (!res.error) {
				var labels = [];
				var data = [];
				// res.result.forEach(function (history) {
				// 	labels.push(history.time);
				// 	data.push(parseFloat(history.sales).toFixed(2));
				// });
				timeAxes.forEach(function (axe) {
					var index = res.result.findIndex(function (history) {
						return axe == history.time
					})
					if (index != -1) {
						labels.push(res.result[index].time);
						data.push(res.result[index].sales * 1);
					} else {
						labels.push(axe);
						data.push(0);
					}
				})
				$scope.Sales = res.result;
				$scope.total_sales = data.reduce(function (acc, cur) {
					return acc + cur * 1
				});
				if (!$scope.reports.sales.chart) {
					$scope.reports.sales.chart = makeChart('ordersSales', {
						type: 'line',
						label: $scope.translate('SALES'),
						labels: labels,
						data: data,
						xAxes: getTimeAxes($scope.filters.filter),
						tooltips: {
							callbacks: {
								title: function (tooltipItem) {
									return getLabelDateByFilter(tooltipItem[0].xLabel, $scope.filters.filter);
								}
							}
						}
					});
				} else {
					$scope.reports.sales.chart.data.labels = labels;
					$scope.reports.sales.chart.data.datasets.forEach(function (dataset) {
						dataset.data = data;
					});
				}
				$scope.reports.sales.chart.options.scales.xAxes = getTimeAxes($scope.filters.filter);
				$scope.reports.sales.chart.update();
				$scope.reports.sales.loading = false;
			} else MyAlert.show(res.result);
		});
	}
	// $scope.$watchGroup(['reports.sales.businesses', 'reports.sales.filter'], updateSales);
	$scope.total_orders = 0
	$scope.Orders = []
	function updateOrders() {
		$scope.reports.orders.loading = true;
		var options = {
			lapse: $scope.filters.filter
		};
		if ($scope.filters.businesses.length > 0) options.businesses = $scope.filters.businesses;
		if ($scope.filters.app) options.app_id = $scope.filters.app;
		Ordering.reports.orders(options, function (res) {
			if (!res.error) {
				var labels = [];
				var data = [];
				// res.result.forEach(function (history) {
				// 	labels.push(history.time);
				// 	data.push(history.orders);
				// });
				timeAxes.forEach(function (axe) {
					var index = res.result.findIndex(function (history) {
						return axe == history.time
					})
					if (index != -1) {
						labels.push(res.result[index].time);
						data.push(res.result[index].orders);
					} else {
						labels.push(axe);
						data.push(0);
					}
				})
				$scope.total_orders = data.reduce(function (acc, cur) {
					return acc + cur
				});
				if (!$scope.reports.orders.chart) {
					$scope.reports.orders.chart = makeChart('ordersHistory', {
						type: 'line',
						label: $scope.translate('MOBILE_ORDER_HISTORY'),
						labels: labels,
						data: data,
						xAxes: getTimeAxes($scope.filters.filter),
						tooltips: {
							callbacks: {
								title: function (tooltipItem) {
									return getLabelDateByFilter(tooltipItem[0].xLabel, $scope.filters.filter);
								}
							}
						}
					});
				} else {
					$scope.reports.orders.chart.data.labels = labels;
					$scope.reports.orders.chart.data.datasets.forEach(function (dataset) {
						dataset.data = data;
					});
					$scope.reports.orders.chart.options.scales.xAxes = getTimeAxes($scope.filters.filter);
					$scope.reports.orders.chart.update();
				}
				$scope.reports.orders.loading = false;
			} else MyAlert.show(res.result);
		});
	}
	// $scope.$watchGroup(['reports.orders.businesses', 'reports.orders.filter'], updateOrders);

	function updateOrdersAcceptSpend() {
		$scope.reports.ordersAcceptSpend.loading = true;
		var options = {
			lapse: $scope.filters.filter
		};
		if ($scope.filters.app) options.app_id = $scope.filters.app;
		if ($scope.filters.businesses.length > 0) options.businesses = $scope.filters.businesses;
		Ordering.reports.ordersAcceptSpend(options, function (res) {
			if (!res.error) {
				$scope.accept_spend = res.result;
				$scope.reports.ordersAcceptSpend.loading = false;
			} else MyAlert.show(res.result);
		});
	}
	function updateArrivedPickupSpend() {
		$scope.reports.ArrivedPickupSpend.loading = true;
		var options = {
			lapse: $scope.filters.filter
		};
		if ($scope.filters.app) options.app_id = $scope.filters.app;
		if ($scope.filters.businesses.length > 0) options.businesses = $scope.filters.businesses;
		Ordering.reports.ordersArrivedPickupSpend(options, function (res) {
			if (!res.error) {
				$scope.ArrivedPickupSpend = res.result;
				$scope.reports.ArrivedPickupSpend.loading = false;
			} else MyAlert.show(res.result);
		});
	}

	var map, heatmap;
	var markerCluster = null;
	var markers = [];
	$scope.isHeat = false;
	function updateHeatMap() {
		$scope.isHeat = false;
		$scope.loadGoogleMaps(function () {
			map = new google.maps.Map(document.getElementById('heatmap'), {
				zoom: 13,
				center: { lat: 37.775, lng: -122.434 },
				disableDefaultUI: true
			});
			var bounds = new google.maps.LatLngBounds();

			var options = {
				lapse: $scope.filters.filter
			};
			if ($scope.filters.app) options.app_id = $scope.filters.app;
			if ($scope.filters.businesses.length > 0) options.businesses = $scope.filters.businesses;
			Ordering.reports.order_location(options, function (res) {
				if (!res.error) {
					var locations = res.result.map(function (location) {
						return {
							lat: location.lat * 1,
							lng: location.lng * 1
						}
					});
					heatmap = new google.maps.visualization.HeatmapLayer({
						data: locations.map(function (location) {
							return new google.maps.LatLng(location.lat, location.lng)
						}),
						map: null,
						radius: 17
					});
					markers = locations.map(function (location, i) {
						bounds.extend(location);
						return new MarkerWithLabel({
							position: location,
							draggable: false,
							raiseOnDrag: false,
							map: map,
							labelContent: '<div><img src="' + $scope.rootTheme + '/img/icon.png"></img></div>',
							labelAnchor: new google.maps.Point(19, 45),
							labelClass: "pin customer", // the CSS class for the label
							labelStyle: { opacity: 1 }
						});
					});
					map.fitBounds(bounds);
					markerCluster = new MarkerClusterer(map, markers,
						{ imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' });
				}
			})
		})
	}

	$scope.toggleHeatmap = function () {
		$scope.isHeat = !$scope.isHeat;
		heatmap.setMap(heatmap.getMap() ? null : map);
		if (heatmap.getMap()) {
			markerCluster.clearMarkers()
		} else {
			markerCluster.addMarkers(markers);
		}
	}

	// $scope.$watchGroup(['reports.ordersAcceptSpend.businesses', 'reports.ordersAcceptSpend.filter'], updateOrdersAcceptSpend);

	function createLapse(inputs, lapse) {
		var datefrom = $(inputs.from).datetimepicker({
			format: 'YYYY-MM-DD',
		});
		datefrom.on('dp.show', function () {
			$(".bootstrap-datetimepicker-widget").attr('data-tap-disabled', 'true');
		});
		var dateto = $(inputs.to).datetimepicker({
			useCurrent: false, //Important! See issue #1075
			format: 'YYYY-MM-DD',
		});
		dateto.on('dp.show', function () {
			$(".bootstrap-datetimepicker-widget").attr('data-tap-disabled', 'true');
			$(".bootstrap-datetimepicker-widget").css({ 'right': '0px', 'left': 'auto' })
		});
		$(inputs.from).on("dp.change", function (e) {
			$(inputs.to).data("DateTimePicker").minDate(e.date);
			$scope.$apply(function () {
				lapse.to = $(inputs.to).val();
				lapse.from = $(inputs.from).val();
			});
		});
		$(inputs.to).on("dp.change", function (e) {
			$(inputs.from).data("DateTimePicker").maxDate(e.date)
			$scope.$apply(function () {
				lapse.to = $(inputs.to).val();
				lapse.from = $(inputs.from).val();
			});
		});
	}
	$scope.topSelling = [];
	$scope.topCategories = [];
	function makeChart(element_id, options) {
		var yAxes = [{
			ticks: {
				beginAtZero: true
			}
		}];
		var xAxes = [{}];
		var tooltips = {};
		if (options.yAxes) yAxes = options.yAxes;
		if (options.yAxes) yAxes.ticks.beginAtZero = true;
		if (options.xAxes) xAxes = options.xAxes;
		if (options.tooltips) tooltips = options.tooltips;
		var ctx = document.getElementById(element_id).getContext('2d');
		var chart = new Chart(ctx, {
			type: options.type,
			data: {
				labels: options.labels,
				datasets: [{
					label: options.label,
					data: options.data,
					backgroundColor: 'rgba(15, 146, 70, 0.6)',
					borderColor: 'rgba(15, 146, 70, 0.8)',
					borderWidth: 1
				}]
			},
			options: {
				scales: {
					yAxes: yAxes,
					xAxes: xAxes
				},
				elements: {
					line: {
						tension: 0
					}
				},
				tooltips: tooltips
			}
		});
		return chart;
	}

	function getTimeAxes(lapse) {
		var xAxes = [{
			type: 'time',
			time: {
				stepSize: 1,
				displayFormats: {
					hour: 'LT'
				}
			},
			ticks: {
				fontSize: 10
			}
		}];
		switch (lapse) {
			case 'today':
			case 'yesterday':
				xAxes[0].time.unit = 'hour';
				xAxes[0].time.min = moment().subtract(lapse == 'today' ? 0 : 1, 'days').format('YYYY-MM-DD 00:00:00');
				xAxes[0].time.max = moment().subtract(lapse == 'today' ? 0 : 1, 'days').format('YYYY-MM-DD 24:00:00');
				break;
			case 'last_7_days':
			case 'last_30_days':
				xAxes[0].time.unit = 'day';
				xAxes[0].time.min = moment().subtract(lapse == 'last_7_days' ? 7 : 30, 'days').format('YYYY-MM-DD');
				xAxes[0].time.max = moment().format('YYYY-MM-DD');
				break;
			default:
				var lapse = lapse.split(',');
				var from = moment(lapse[0] + ' 00:00:00');
				var to = moment(lapse[1] + ' 24:00:00');
				var duration = moment.duration(from.diff(to));
				var hours = Math.abs(duration.asHours());
				var days = Math.abs(duration.asDays());
				var months = Math.abs(duration.asMonths());
				if (hours <= 24) {
					xAxes[0].time.unit = 'hour';
					xAxes[0].time.min = from.format('YYYY-MM-DD HH:mm:ss');
					xAxes[0].time.max = to.format('YYYY-MM-DD HH:mm:ss');
				} else if (days <= 30) {
					xAxes[0].time.unit = 'day';
					xAxes[0].time.min = from.format('YYYY-MM-DD HH:mm:ss');
					xAxes[0].time.max = to.format('YYYY-MM-DD HH:mm:ss');
				} else if (months <= 12) {
					xAxes[0].time.unit = 'month';
					xAxes[0].time.min = from.format('YYYY-MM-DD HH:mm:ss');
					xAxes[0].time.max = to.format('YYYY-MM-DD HH:mm:ss');
				} else {
					xAxes[0].time.unit = 'year';
					xAxes[0].time.min = from.format('YYYY-MM-DD HH:mm:ss');
					xAxes[0].time.max = to.format('YYYY-MM-DD HH:mm:ss');
				}
				break;
		}
		return xAxes;
	}

	function getLabelDateByFilter(date, filter) {
		var label = date;
		switch (filter) {
			case 'day':
			case 'yesterday':
				label = moment(date).format('YYYY-MM-DD HH:mm:ss');
				break;
			case 'last_7_days':
			case 'last_30_days':
				label = moment(date).format('MMM D');
				break;
			default:
				var lapse = filter.split(',');
				var from = moment(lapse[0] + ' 00:00:00');
				var to = moment(lapse[1] + ' 24:00:00');
				var duration = moment.duration(from.diff(to));
				var hours = Math.abs(duration.asHours());
				var days = Math.abs(duration.asDays());
				var months = Math.abs(duration.asMonths());
				if (hours <= 24) {
					label = moment(date).format('YYYY-MM-DD HH:mm:ss');
				} else if (days <= 30) {
					label = moment(date).format('MMM D');
				} else if (months <= 12) {
					label = moment(date).format('MMM YYYY');
				} else {
					label = moment(date).format('YYYY');
				}
				break;
		}
		return label;
	}
	$(document).ready(function () {
		/***Show Bottom Help***/
		$('[data-toggle="popover"]').popover({ html: true });
		/***Position bottom ButtomHelp***/
		$('#buttonFixed').css({
			'bottom': $('.footer').height() + 15 + 'px',
		});
	});
});
_controllers.controller('driversReportsEditorCtrl', function ($scope, MyModal, MyLoading, MyAlert, Ordering, gUser, $state/*newreportsEditorCtrl*/) {
	if (!$scope.editorAvilable || !$scope.superAdmin) {
		// MyLoading.hide();
		return $state.go(app_states.homeScreen);
	}
	$scope.accept_spend = 0;
	$scope.pickup_spend = 0;
	$scope.delivery_spend = 0;
	$scope.complete_spend = 0;
	$scope.inbusiness_pickup_spend = 0;
	$scope.filters = {
		drivers: [],
		filter: 'today',
		lapse: { from: '', to: '' },
		timezone: ''
	};
	$scope.reports = {
		topSelling: null,
		topCategories: null,
		topOrders: null,
		ordersStatus: null,
		ordersAcceptSpend: null,
		ordersPickupSpend: null,
		ordersDeliverySpend: null,
		ordersCompleteSpend: null,
		ordersArrivedPickupSpend: null,
		customerSatisfaction: null,
		sales: null,
		orders: null,
		spendTimes: null,
		availableTimes: null,
		busyTimes: null
	};
	for (var key in $scope.reports) {
		$scope.reports[key] = {
			chart: null,
			loading: true,
			filter: 'today',
			lapse: { from: '', to: '' },
			drivers: []
		};
	}

	createLapse({
		from: '#filter-from',
		to: '#filter-to'
	}, $scope.filters.lapse);

	$scope.filterDrivers = function (drivers, cb) {
		MyLoading.show($scope.translate('LOADING') + '...');
		Ordering.users.all({
			mode: 'dashboard',
			params: 'id,name,driver_groups',
			where: [{
				attribute: 'level',
				value: '4'
			}]
		}, function (res) {
			MyLoading.hide();
			if (!res.error) {
				MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/driver-filter.html', {
					scope: $scope,
				}).then(function (filter_driver) {
					filter_driver.scope.selected = {};
					filter_driver.scope.drivergroups = [];
					filter_driver.scope.allDriverGroup = true;
					filter_driver.scope.noneDriverGroup = true;
					// return console.log(res.result)
					res.result.forEach(function (driver) {
						driver.selected = true;
						if (driver.drivergroups.length == 0) {
							var index = filter_driver.scope.drivergroups.findIndex(function (drivergroup) {
								return drivergroup.name == 'no-group'
							})
							if (index == -1) {
								filter_driver.scope.drivergroups.push({
									selected: true,
									name: 'no-group',
									id: 0,
									drivers: [driver],
									all: true
								})
							} else {
								filter_driver.scope.drivergroups[index].drivers.push(driver)
							}
						} else {
							driver.drivergroups.forEach(function (drivergroup) {
								var _index = filter_driver.scope.drivergroups.findIndex(function (_drivergroup) {
									return drivergroup.id == _drivergroup.id;
								})
								if (_index != -1) filter_driver.scope.drivergroups[_index].drivers.push(driver)
								else {
									filter_driver.scope.drivergroups.push({
										id: drivergroup.id,
										name: drivergroup.name,
										selected: true,
										drivers: [driver],
										all: true
									})
								}
							})
						}
					});
					// res.result.forEach(function (driver) {
					// 	filter_business.scope.selected[driver.id] = driver.length == 0 || businesses.indexOf(business.id) != -1;
					// });
					// filter_business.scope.all = businesses.length == 0;
					// filter_business.scope.toggleAll = function () {
					// 	filter_business.scope.all = !filter_business.scope.all;
					// 	res.result.forEach(function (business) {
					// 		filter_business.scope.selected[business.slug] = filter_business.scope.all;
					// 	});
					// }
					// filter_business.scope.refresh = function () {
					// 	for (var key in filter_business.scope.selected) {
					// 		if (!filter_business.scope.selected[key]) {
					// 			filter_business.scope.all = false;
					// 			break;
					// 		}
					// 	}
					// }
					// filter_business.scope.toggleBusiness = function (business) {
					// 	filter_business.scope.selected[business] = !filter_business.scope.selected[business];
					// 	filter_business.scope.refresh();
					// }
					filter_driver.scope.apply = function () {
						var filtered = [];
						filter_driver.scope.drivergroups.forEach(function (drivergroup) {
							drivergroup.drivers.forEach(function (driver) {
								if (filtered.indexOf(driver.id) == -1 && driver.selected) filtered.push(driver.id)
							})
						});
						filter_driver.scope.hide();
						cb(filtered);
					}
					filter_driver.scope.hide = function () {
						filter_driver.hide();
						filter_driver.remove();
					}
					filter_driver.show().then(function () {
						filter_driver.scope.drivers = res.result;
					});
					filter_driver.scope.curDrivergroup = -1;
					filter_driver.scope.toggleDrivergroup = function (drivergroup) {
						if (filter_driver.scope.curDrivergroup == drivergroup) filter_driver.scope.curDrivergroup = -1;
						else filter_driver.scope.curDrivergroup = drivergroup;
					}
					filter_driver.scope.toggleAllGroups = function () {
						filter_driver.scope.allDriverGroup = !filter_driver.scope.allDriverGroup;
						filter_driver.scope.noneDriverGroup = !filter_driver.scope.allDriverGroup;
						for (var i = 0; i < filter_driver.scope.drivergroups.length; i++) {
							for (var j = 0; j < filter_driver.scope.drivergroups[i].drivers.length; j++) {
								filter_driver.scope.drivergroups[i].drivers[j].selected = filter_driver.scope.allDriverGroup;
							}
							filter_driver.scope.drivergroups[i].selected = filter_driver.scope.allDriverGroup;
							filter_driver.scope.drivergroups[i].all = filter_driver.scope.allDriverGroup;
							filter_driver.scope.drivergroups[i].none = !filter_driver.scope.allDriverGroup;
						}
					}
					filter_driver.scope.toggleAll = function (drivergroup) {
						var all = true;
						var none = true;
						for (var i = 0; i < drivergroup.drivers.length; i++) {
							drivergroup.drivers[i].selected = !drivergroup.all;
						}
						drivergroup.none = drivergroup.all;
						drivergroup.all = !drivergroup.all;

						for (var i = 0; i < filter_driver.scope.drivergroups.length; i++) {
							if (!filter_driver.scope.drivergroups[i].all) all = false;
							else none = false
						}

						filter_driver.scope.allDriverGroup = all;
						filter_driver.scope.noneDriverGroup = none;
					}
					filter_driver.scope.toggleDriver = function (drivergroup) {
						var all = true;
						var none = true;
						for (var i = 0; i < drivergroup.drivers.length; i++) {
							if (drivergroup.drivers[i].selected) none = false;
							else all = false;
						}
						drivergroup.all = all;
						drivergroup.none = none;

						for (var i = 0; i < filter_driver.scope.drivergroups.length; i++) {
							if (!filter_driver.scope.drivergroups[i].all) all = false;
							else none = false
						}
						filter_driver.scope.allDriverGroup = all;
						filter_driver.scope.noneDriverGroup = none;
					}
				});
			} else MyAlert.show(res.result);
		});
	}

	$scope.openDriverFilter = function () {
		$scope.filterDrivers($scope.filters.drivers, function (drivers) {
			$scope.filters.drivers = drivers;
		});
	}
	timeAxes = [];
	$scope.$watchGroup(['filters.drivers', 'filters.filter', 'filters.timezone'], function () {
		updateTimeAxes(function () {
			updateOrders();
			updateSales();
			updateTopSelling();
			updateTopCategories();
			updateTopOrders()
			updateCustomerSatisfaction();
			updateOrdersStatus();
			updateOrdersAcceptSpend();
			updateOrdersPickupSpend();
			updateOrdersDeliverySpend();
			updateOrdersCompleteSpend();
			updateOrdersArrivedPickupSpend();
			updateSpendTimes();
			updateAvailableTimes();
			updateBusyTimes();
			if (NEW_ADDONS.HEATMAP) updateHeatMap();
		})
	});
	//Timezones
	$scope.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	//check valid or change 'UTC'
	if (timezones.indexOf($scope.timezone) == -1) $scope.timezone = timezones[0];
	function autocomplete(inp, arr) {
		/*the autocomplete function takes two arguments,
		the text field element and an array of possible autocompleted values:*/
		var currentFocus;
		/*execute a function when someone writes in the text field:*/
		inp.addEventListener("input", function (e) {
			var a, b, i, val = this.value;
			/*close any already open lists of autocompleted values*/
			closeAllLists();
			if (!val) { return false; }
			currentFocus = -1;
			/*create a DIV element that will contain the items (values):*/
			a = document.createElement("DIV");
			a.setAttribute("id", this.id + "autocomplete-list");
			a.setAttribute("class", "timezone autocomplete-items");
			/*append the DIV element as a child of the autocomplete container:*/
			this.parentNode.appendChild(a);
			/*for each item in the array...*/
			for (i = 0; i < arr.length; i++) {
				/*check if the item contains the same letters as the text field value:*/
				if (arr[i].toUpperCase().indexOf(val.toUpperCase()) != -1) {
					indexString = arr[i].toUpperCase().indexOf(val.toUpperCase());
					/*create a DIV element for each matching element:*/
					b = document.createElement("DIV");
					/*make the matching letters bold:*/
					b.innerHTML = "<strong>" + arr[i].substr(indexString, val.length) + "</strong>";
					b.innerHTML += arr[i].substr(indexString + val.length);
					if (indexString > 0) {
						b.innerHTML = arr[i].substr(0, indexString) + b.innerHTML;
					}
					/*insert a input field that will hold the current array item's value:*/
					b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
					/*execute a function when someone clicks on the item value (DIV element):*/
					b.addEventListener("click", function (e) {
						/*insert the value for the autocomplete text field:*/
						inp.value = this.getElementsByTagName("input")[0].value;
						/*close the list of autocompleted values,
						(or any other open lists of autocompleted values:*/
						closeAllLists();
					});
					a.appendChild(b);
				}
			}
		});
		/*execute a function presses a key on the keyboard:*/
		// inp.addEventListener("keydown", function(e) {
		// 	var x = document.getElementById(this.id + "autocomplete-list");
		// 	if (x) x = x.getElementsByTagName("div");
		// 	if (e.keyCode == 40) {
		// 	  /*If the arrow DOWN key is pressed,
		// 	  increase the currentFocus variable:*/
		// 	  currentFocus++;
		// 	  /*and and make the current item more visible:*/
		// 	  addActive(x);
		// 	} else if (e.keyCode == 38) { //up
		// 	  /*If the arrow UP key is pressed,
		// 	  decrease the currentFocus variable:*/
		// 	  currentFocus--;
		// 	  /*and and make the current item more visible:*/
		// 	  addActive(x);
		// 	} else if (e.keyCode == 13) {
		// 		console.log('enter', x[currentFocus])
		// 	  /*If the ENTER key is pressed, prevent the form from being submitted,*/
		// 	//   e.preventDefault();
		// 	  if (currentFocus > -1) {
		// 		/*and simulate a click on the "active" item:*/
		// 		if (x) x[currentFocus].click();
		// 	  }
		// 	}
		// });
		function addActive(x) {
			/*a function to classify an item as "active":*/
			if (!x) return false;
			/*start by removing the "active" class on all items:*/
			removeActive(x);
			if (currentFocus >= x.length) currentFocus = 0;
			if (currentFocus < 0) currentFocus = (x.length - 1);
			/*add class "autocomplete-active":*/
			x[currentFocus].classList.add("timezone autocomplete-active");
		}
		function removeActive(x) {
			/*a function to remove the "active" class from all autocomplete items:*/
			for (var i = 0; i < x.length; i++) {
				x[i].classList.remove("timezone autocomplete-active");
			}
		}
		function closeAllLists(elmnt) {
			/*close all autocomplete lists in the document,
			except the one passed as an argument:*/
			var x = document.getElementsByClassName("timezone autocomplete-items");
			for (var i = 0; i < x.length; i++) {
				if (elmnt != x[i] && elmnt != inp) {
					x[i].parentNode.removeChild(x[i]);
				}
			}
		}
		/*execute a function when someone clicks in the document:*/
		document.addEventListener("click", function (e) {
			if (timezones.indexOf(e.target.textContent) != -1) {
				console.log(e.target.textContent)
				$scope.timezone = e.target.textContent
			}
			closeAllLists(e.target);
		});
	}
	if (document.getElementById("myInputTimezone")) {
		autocomplete(document.getElementById("myInputTimezone"), timezones);
	}
	$scope.changeTimezone = function () {
		if (timezones.indexOf($scope.timezone) == -1) return MyAlert.show('SELECT_VALID_TIMEZONE')
		$scope.filters.timezone = $scope.timezone
	}

	//endtimezones
	function updateTimeAxes(cb) {
		var unitdate = getTimeAxes($scope.filters.filter)[0].time.unit;
		var maxdate = moment(getTimeAxes($scope.filters.filter)[0].time.max).endOf(unitdate);
		var mindate = moment(getTimeAxes($scope.filters.filter)[0].time.min).startOf(unitdate);
		var curDate = mindate;
		var newTimeAxes = [];
		var adder = 'd';
		switch (unitdate) {
			case 'day': adder = 'd';
				break;
			case 'month': adder = 'M';
				break;
			case 'year': adder = 'y';
				break;
			case 'hour': adder = 'h';
				break;
			default: break;
		}
		do {
			newTimeAxes.push(moment(curDate._d.getTime()).format('YYYY-MM-DD HH:mm:ss'));
			curDate = curDate.clone().add(1, adder);
		}
		while (curDate <= maxdate);
		timeAxes = newTimeAxes;
		return cb();
	}
	// $scope.clearBusiness = function (report) {
	// 	report.businesses = [];
	// }

	$scope.clearBusinessFilter = function () {
		$scope.filters.drivers = [];
	}

	function updateTopSelling() {
		$scope.reports.topSelling.loading = true;
		var options = {
			lapse: $scope.filters.filter,
			timezone: $scope.timezone
		};
		if ($scope.filters.drivers.length > 0) options.drivers = $scope.filters.drivers;
		Ordering.driver_reports.topSelling(options, function (res) {
			if (!res.error) {
				$scope.topSelling = res.result;
				var labels = [];
				var data = [];
				res.result.forEach(function (product) {
					labels.push(product.name.split(' '));
					data.push(product.sales);
				});
				if (!$scope.reports.topSelling.chart) {
					$scope.reports.topSelling.chart = makeChart('topSelling', {
						type: 'bar',
						label: $scope.translate('TOP_PRODUCTS'),
						labels: labels,
						data: data,
						xAxes: [{
							scaleFontSize: 20,
							ticks: {
								display: false,
							}
						}]
					});
				} else {
					$scope.reports.topSelling.chart.data.labels = labels;
					$scope.reports.topSelling.chart.data.datasets.forEach(function (dataset) {
						dataset.data = data;
					});
					$scope.reports.topSelling.chart.update();
				}
				$scope.reports.topSelling.loading = false;
			} else MyAlert.show(res.result);
		});
	}
	// $scope.$watchGroup(['reports.topSelling.businesses', 'reports.topSelling.filter'], updateTopSelling);

	function updateTopCategories() {
		$scope.reports.topCategories.loading = true;
		var options = {
			lapse: $scope.filters.filter,
			timezone: $scope.timezone
		};
		if ($scope.filters.drivers.length > 0) options.drivers = $scope.filters.drivers;
		Ordering.driver_reports.topCategories(options, function (res) {
			if (!res.error) {
				$scope.topCategories = res.result;
				var labels = [];
				var data = [];
				res.result.forEach(function (category) {
					labels.push(category.name.split(' '));
					data.push(category.sales);
				});
				if (!$scope.reports.topCategories.chart) {
					$scope.reports.topCategories.chart = makeChart('topCategories', {
						type: 'bar',
						label: $scope.translate('TOP_CATEGORIES'),
						labels: labels,
						data: data,
						xAxes: [{
							scaleFontSize: 20,
							ticks: {
								display: false,
							}
						}]
					});
				} else {
					$scope.reports.topCategories.chart.data.labels = labels;
					$scope.reports.topCategories.chart.data.datasets.forEach(function (dataset) {
						dataset.data = data;
					});
					$scope.reports.topCategories.chart.update();
				}
				$scope.reports.topCategories.loading = false;
			} else MyAlert.show(res.result);
		});
	}
	function updateTopOrders() {
		$scope.reports.topOrders.loading = true;
		var options = {
			lapse: $scope.filters.filter,
			timezone: $scope.timezone
		};
		if ($scope.filters.drivers.length > 0) options.drivers = $scope.filters.drivers;
		Ordering.driver_reports.topOrders(options, function (res) {
			if (!res.error) {
				$scope.topOrders = res.result;
				var labels = [];
				var data = [];
				res.result.forEach(function (driver) {
					labels.push(driver.name + '(' + driver.id + ')');
					data.push(driver.orders_count);
				});
				if (!$scope.reports.topOrders.chart) {
					$scope.reports.topOrders.chart = makeChart('topOrders', {
						type: 'bar',
						label: $scope.translate('TOP_ORDERS'),
						labels: labels,
						data: data,
						xAxes: [{
							scaleFontSize: 20,
							ticks: {
								display: false,
							}
						}]
					});
				} else {
					$scope.reports.topOrders.chart.data.labels = labels;
					$scope.reports.topOrders.chart.data.datasets.forEach(function (dataset) {
						dataset.data = data;
					});
					$scope.reports.topOrders.chart.update();
				}
				$scope.reports.topOrders.loading = false;
			} else MyAlert.show(res.result);
		});
	}
	// $scope.$watchGroup(['reports.topCategories.businesses', 'reports.topCategories.filter'], updateTopCategories);


	// $scope.$watchGroup(['reports.users.businesses', 'reports.users.filter'], updateUsers);
	$scope.orderStatus = []
	function updateOrdersStatus() {
		$scope.reports.ordersStatus.loading = true;
		var options = {
			lapse: $scope.filters.filter,
			timezone: $scope.timezone
		};
		if ($scope.filters.drivers.length > 0) options.drivers = $scope.filters.drivers;
		Ordering.driver_reports.ordersStatus(options, function (res) {
			if (!res.error) {
				$scope.orderStatus = res.result;
				var labels = [$scope.translate('ALL_ORDERS_100')];
				var totalOrders = res.result.reduce(function (previous, current) {
					return previous + current.orders;
				}, 0);
				var data = [totalOrders];
				res.result.forEach(function (order) {
					labels.push($scope.getOrderState(order.status) + " (" + (100 * order.orders / totalOrders).toFixed(2) + "%)");
					data.push(order.orders);
				});
				if (!$scope.reports.ordersStatus.chart) {
					$scope.reports.ordersStatus.chart = makeChart('ordersStatus', {
						type: 'horizontalBar',
						label: $scope.translate('ORDERS_STATUS'),
						labels: labels,
						data: data,
						xAxes: [{
							scaleFontSize: 20,
							ticks: {
								beginAtZero: true
							}
						}]
					});
				} else {
					$scope.reports.ordersStatus.chart.data.labels = labels;
					$scope.reports.ordersStatus.chart.data.datasets.forEach(function (dataset) {
						dataset.data = data;
					});
					$scope.reports.ordersStatus.chart.update();
				}
				$scope.reports.ordersStatus.loading = false;
			} else MyAlert.show(res.result);
		});
	}
	// $scope.$watchGroup(['reports.ordersStatus.businesses', 'reports.ordersStatus.filter'], updateOrdersStatus);

	function updateCustomerSatisfaction(params) {
		$scope.reports.customerSatisfaction.loading = true;
		var options = {
			lapse: $scope.filters.filter,
			timezone: $scope.timezone
		};
		if ($scope.filters.drivers.length > 0) options.drivers = $scope.filters.drivers;
		Ordering.reports.customerSatisfaction(options, function (res) {
			if (!res.error) {
				var labels = [
					$scope.translate('GENERAL'),
					$scope.translate('QUALITY'),
					$scope.translate('DELIVERY'),
					$scope.translate('SERVICE'),
					$scope.translate('PACKAGE')
				];
				var data = [
					res.result.general,
					res.result.quality,
					res.result.delivery,
					res.result.service,
					res.result.package
				];
				if (!$scope.reports.customerSatisfaction.chart) {
					$scope.reports.customerSatisfaction.chart = makeChart('customerSatisfaction', {
						type: 'horizontalBar',
						label: $scope.translate('CUSTOMER_SATISFACTION'),
						labels: labels,
						data: data,
						xAxes: [{
							scaleFontSize: 20,
							ticks: {
								beginAtZero: true
							}
						}]
					});
				} else {
					$scope.reports.customerSatisfaction.chart.data.labels = labels;
					$scope.reports.customerSatisfaction.chart.data.datasets.forEach(function (dataset) {
						dataset.data = data;
					});
					$scope.reports.customerSatisfaction.chart.update();
				}
				$scope.reports.customerSatisfaction.loading = false;
			} else MyAlert.show(res.result);
		});
	}
	// $scope.$watchGroup(['reports.customerSatisfaction.businesses', 'reports.customerSatisfaction.filter'], updateCustomerSatisfaction);
	$scope.total_sales = 0;
	$scope.Sales = [];
	$scope.getTimeFormat = function (date, lapse) {
		switch (lapse) {
			case 'today':
			case 'yesterday':
				new_date = moment(date).format('HH:00');
				break;
			case 'last_7_days':
			case 'last_30_days':
				new_date = moment(date).format('YYYY-MM-DD');
				break;
			default:
				var lapse = lapse.split(',');
				var from = moment(lapse[0] + ' 00:00:00');
				var to = moment(lapse[1] + ' 24:00:00');
				var duration = moment.duration(from.diff(to));
				var hours = Math.abs(duration.asHours());
				var days = Math.abs(duration.asDays());
				var months = Math.abs(duration.asMonths());
				if (hours <= 24) {
					new_date = moment(date).format('HH:MM:SS');
				} else if (days <= 30) {
					new_date = moment(date).format('YYYY-MM-DD');
				} else if (months <= 12) {
					new_date = moment(date).format('YYYY-MM');
				} else {
					new_date = moment(date).format('YYYY-MM');
				}
				break;
		}
		return new_date;
	}
	function updateSales() {
		$scope.reports.sales.loading = true;
		var options = {
			lapse: $scope.filters.filter,
			timezone: $scope.timezone
		};
		if ($scope.filters.drivers.length > 0) options.drivers = $scope.filters.drivers;
		Ordering.driver_reports.sales(options, function (res) {
			if (!res.error) {
				var labels = [];
				var data = [];
				// res.result.forEach(function (history) {
				// 	labels.push(history.time);
				// 	data.push(parseFloat(history.users).toFixed(2));
				// });
				$scope.Sales = res.result;
				timeAxes.forEach(function (axe) {
					var index = res.result.findIndex(function (history) {
						return axe == history.time
					})
					if (index != -1) {
						labels.push(res.result[index].time);
						data.push(res.result[index].sales * 1);
					} else {
						labels.push(axe);
						data.push(0);
					}
				})
				$scope.total_sales = data.reduce(function (acc, cur) {
					return acc + cur * 1
				});
				if (!$scope.reports.sales.chart) {
					$scope.reports.sales.chart = makeChart('ordersSales', {
						type: 'line',
						label: $scope.translate('SALES'),
						labels: labels,
						data: data,
						xAxes: getTimeAxes($scope.filters.filter),
						tooltips: {
							callbacks: {
								title: function (tooltipItem) {
									return getLabelDateByFilter(tooltipItem[0].xLabel, $scope.filters.filter);
								}
							}
						}
					});
				} else {
					$scope.reports.sales.chart.data.labels = labels;
					$scope.reports.sales.chart.data.datasets.forEach(function (dataset) {
						dataset.data = data;
					});
				}
				$scope.reports.sales.chart.options.scales.xAxes = getTimeAxes($scope.filters.filter);
				$scope.reports.sales.chart.update();
				$scope.reports.sales.loading = false;
			} else MyAlert.show(res.result);
		});
	}
	function updateSpendTimes() {
		$scope.reports.spendTimes.loading = true;
		var options = {
			lapse: $scope.filters.filter,
			timezone: $scope.timezone
		};
		if ($scope.filters.drivers.length > 0) options.drivers = $scope.filters.drivers;
		Ordering.driver_reports.spend_times(options, function (res) {
			if (!res.error) {
				var labels = [];
				var data = [];
				var data1 = [];
				var data2 = [];
				var data3 = [];
				res.result.forEach(function (history) {
					labels.push(history.time);
					data.push({
						x: history.time,
						y: parseFloat(history.accept_spend).toFixed(2)
					});
					data1.push({
						x: history.time,
						y: parseFloat(history.pickup_spend).toFixed(2)
					});
					data2.push({
						x: history.time,
						y: parseFloat(history.delivery_spend).toFixed(2)
					});
					data3.push({
						x: history.time,
						y: parseFloat(history.complete_spend).toFixed(2)
					});
				});
				var datasets = [
					{
						label: 'accept',
						data: data,
						backgroundColor: 'rgba(255, 0, 0, 0.3)',
						borderColor: 'rgba(255, 0, 0, 0.3)',
						borderWidth: 1
					},
					{
						label: 'pickup',
						data: data1,
						backgroundColor: 'rgba(0, 255, 0, 0.3)',
						borderColor: 'rgba(0, 255, 0, 0.3)',
						borderWidth: 1
					},
					{
						label: 'delivery',
						data: data2,
						backgroundColor: 'rgba(0, 0, 255, 0.3)',
						borderColor: 'rgba(0, 0, 255, 0.3)',
						borderWidth: 1
					},
					{
						label: 'completed',
						data: data3,
						backgroundColor: 'rgba(255, 125, 0, 0.3)',
						borderColor: 'rgba(255, 125, 0, 0.3)',
						borderWidth: 1
					}
				]
				if (!$scope.reports.spendTimes.chart) {
					$scope.reports.spendTimes.chart = makeChart('spendTimes', {
						type: 'line',
						label: $scope.translate('TIMES'),
						datasets: datasets,
						xAxes: getTimeAxes($scope.filters.filter),
						tooltips: {
							callbacks: {
								title: function (tooltipItem) {
									return getLabelDateByFilter(tooltipItem[0].xLabel, $scope.filters.filter);
								},
								label: function (tooltipItem, data) {
									var pretty = $scope.getLessUnitTime(tooltipItem.yLabel);
									return pretty[0] + ' ' + pretty[1];
								}
							}
						}
					});
				} else {
					$scope.reports.spendTimes.chart.data.labels = labels;
					$scope.reports.spendTimes.chart.data.datasets = datasets;
				}
				$scope.reports.spendTimes.chart.options.scales.xAxes = getTimeAxes($scope.filters.filter);
				$scope.reports.spendTimes.chart.update();
				$scope.reports.spendTimes.loading = false;
			} else MyAlert.show(res.result);
		});
	}

	function updateAvailableTimes() {
		$scope.reports.availableTimes.loading = true;
		var options = {
			lapse: $scope.filters.filter,
			timezone: $scope.timezone
		};
		if ($scope.filters.drivers.length > 0) options.drivers = $scope.filters.drivers;
		Ordering.driver_reports.available_times(options, function (res) {
			if (!res.error) {
				var labels = [];
				var data = [];
				var data1 = [];
				res.result.available.forEach(function (history) {
					labels.push(history.at);
					data.push({
						x: history.at,
						y: parseFloat(history.time).toFixed(2)
					});
				});
				data = data.sort(function (a, b) {
					return new Date(a.x) - new Date(b.x)
				})
				res.result.not_available.forEach(function (history) {
					labels.push(history.at);
					data1.push({
						x: history.at,
						y: parseFloat(history.time).toFixed(2)
					});
				});
				data1 = data1.sort(function (a, b) {
					return new Date(a.x) - new Date(b.x)
				})
				if ($scope.filters.filter === 'yesterday') {
					var max = moment(getTimeAxes($scope.filters.filter)[0].time.max);
					data = data.filter(function (ava) {
						return moment(ava.x) <= max;
					})
					data1 = data1.filter(function (ava) {
						return moment(ava.x) <= max;
					})
				}
				var datasets = [
					{
						label: $scope.translate('AVAILABLE'),
						data: data,
						backgroundColor: 'rgba(0, 225	, 0, 0.3)',
						borderColor: 'rgba(0, 255, 0, 0.6)',
						borderWidth: 1
					},
					{
						label: $scope.translate('NOT_AVAILABLE'),
						data: data1,
						backgroundColor: 'rgba(255, 0, 0, 0.3)',
						borderColor: 'rgba(255, 0, 0, 0.6)',
						borderWidth: 1
					}
				]
				if (!$scope.reports.availableTimes.chart) {
					$scope.reports.availableTimes.chart = makeChart('availableTimes', {
						type: 'bar',
						label: $scope.translate('TIMES'),
						datasets: datasets,
						xAxes: getTimeAxes($scope.filters.filter, true),
						yAxes: [{
							ticks: {
								min: 0,
								max: getScale($scope.filters.filter).max,
								stepSize: getScale($scope.filters.filter).size,
								callback: function (value, index, values) {
									return value / getScale($scope.filters.filter).divisor;
								}
							}
						}],
						tooltips: {
							callbacks: {
								title: function (tooltipItem) {
									return getLabelDateByFilter(tooltipItem[0].xLabel, $scope.filters.filter);
								},
								label: function (tooltipItem, data) {
									var pretty = $scope.getLessUnitTime(tooltipItem.yLabel);
									return pretty[0] + ' ' + pretty[1];
								}
							}
						}
					});
				} else {
					$scope.reports.availableTimes.chart.data.labels = labels;
					$scope.reports.availableTimes.chart.data.datasets = datasets;
				}
				$scope.reports.availableTimes.chart.options.scales.xAxes = getTimeAxes($scope.filters.filter, true);
				$scope.reports.availableTimes.chart.options.scales.yAxes = [{
					ticks: {
						min: 0,
						max: getScale($scope.filters.filter).max,
						stepSize: getScale($scope.filters.filter).size,
						callback: function (value, index, values) {
							return value / getScale($scope.filters.filter).divisor;
						}
					}
				}]
				$scope.reports.availableTimes.chart.update();
				$scope.reports.availableTimes.loading = false;
			} else MyAlert.show(res.result);
		});
	}

	function updateBusyTimes() {
		$scope.reports.busyTimes.loading = true;
		var options = {
			lapse: $scope.filters.filter,
			timezone: $scope.timezone
		};
		if ($scope.filters.drivers.length > 0) options.drivers = $scope.filters.drivers;
		Ordering.driver_reports.busy_times(options, function (res) {
			if (!res.error) {
				var labels = [];
				var data = [];
				var data1 = [];
				res.result.busy.forEach(function (history) {
					labels.push(history.at);
					data.push({
						x: history.at,
						y: parseFloat(history.time).toFixed(2)
					});
				});
				data = data.sort(function (a, b) {
					return new Date(a.x) - new Date(b.x)
				})
				res.result.not_busy.forEach(function (history) {
					labels.push(history.at);
					data1.push({
						x: history.at,
						y: parseFloat(history.time).toFixed(2)
					});
				});
				data1 = data1.sort(function (a, b) {
					return new Date(a.x) - new Date(b.x)
				})
				if ($scope.filters.filter === 'yesterday') {
					var max = moment(getTimeAxes($scope.filters.filter)[0].time.max);
					data = data.filter(function (ava) {
						return moment(ava.x) <= max;
					})
					data1 = data1.filter(function (ava) {
						return moment(ava.x) <= max;
					})
				}
				var datasets = [
					{
						label: $scope.translate('BUSY'),
						data: data,
						backgroundColor: 'rgba(255, 0, 0, 0.3)',
						borderColor: 'rgba(255, 0, 0, 0.6)',
						borderWidth: 1
					},
					{
						label: $scope.translate('NOT_BUSY'),
						data: data1,
						backgroundColor: 'rgba(0, 255, 0, 0.3)',
						borderColor: 'rgba(0, 255, 0, 0.6)',
						borderWidth: 1
					}
				]
				if (!$scope.reports.busyTimes.chart) {
					$scope.reports.busyTimes.chart = makeChart('busyTimes', {
						type: 'bar',
						label: $scope.translate('TIMES'),
						datasets: datasets,
						xAxes: getTimeAxes($scope.filters.filter, true),
						yAxes: [{
							ticks: {
								min: 0,
								max: getScale($scope.filters.filter).max,
								stepSize: getScale($scope.filters.filter).size,
								callback: function (value, index, values) {
									return value / getScale($scope.filters.filter).divisor;
								}
							}
						}],
						tooltips: {
							callbacks: {
								title: function (tooltipItem) {
									return getLabelDateByFilter(tooltipItem[0].xLabel, $scope.filters.filter);
								},
								label: function (tooltipItem, data) {
									var pretty = $scope.getLessUnitTime(tooltipItem.yLabel);
									return pretty[0] + ' ' + pretty[1];
								}
							}
						}
					});
				} else {
					$scope.reports.busyTimes.chart.data.labels = labels;
					$scope.reports.busyTimes.chart.data.datasets = datasets;
				}
				$scope.reports.busyTimes.chart.options.scales.xAxes = getTimeAxes($scope.filters.filter, true);
				$scope.reports.busyTimes.chart.options.scales.yAxes = [{
					ticks: {
						min: 0,
						max: getScale($scope.filters.filter).max,
						stepSize: getScale($scope.filters.filter).size,
						callback: function (value, index, values) {
							return value / getScale($scope.filters.filter).divisor;
						}
					}
				}]
				$scope.reports.busyTimes.chart.update();
				$scope.reports.busyTimes.loading = false;
			} else MyAlert.show(res.result);
		});
	}

	// $scope.$watchGroup(['reports.sales.businesses', 'reports.sales.filter'], updateSales);
	$scope.total_orders = 0
	$scope.Orders = []
	function updateOrders() {
		$scope.reports.orders.loading = true;
		var options = {
			lapse: $scope.filters.filter,
			timezone: $scope.timezone
		};
		if ($scope.filters.drivers.length > 0) options.drivers = $scope.filters.drivers;
		Ordering.driver_reports.orders(options, function (res) {
			if (!res.error) {
				$scope.Orders = res.result;
				var labels = [];
				var data = [];
				// res.result.forEach(function (history) {
				// 	labels.push(history.time);
				// 	data.push(history.orders);
				// });
				timeAxes.forEach(function (axe) {
					var index = res.result.findIndex(function (history) {
						return axe == history.time
					})
					if (index != -1) {
						labels.push(res.result[index].time);
						data.push(res.result[index].orders);
					} else {
						labels.push(axe);
						data.push(0);
					}
				})
				$scope.total_orders = data.reduce(function (acc, cur) {
					return acc + cur
				});
				if (!$scope.reports.orders.chart) {
					$scope.reports.orders.chart = makeChart('ordersHistory', {
						type: 'line',
						label: $scope.translate('MOBILE_ORDER_HISTORY'),
						labels: labels,
						data: data,
						xAxes: getTimeAxes($scope.filters.filter),
						tooltips: {
							callbacks: {
								title: function (tooltipItem) {
									return getLabelDateByFilter(tooltipItem[0].xLabel, $scope.filters.filter);
								}
							}
						}
					});
				} else {
					$scope.reports.orders.chart.data.labels = labels;
					$scope.reports.orders.chart.data.datasets.forEach(function (dataset) {
						dataset.data = data;
					});
					$scope.reports.orders.chart.options.scales.xAxes = getTimeAxes($scope.filters.filter);
					$scope.reports.orders.chart.update();
				}
				$scope.reports.orders.loading = false;
			} else MyAlert.show(res.result);
		});
	}
	// $scope.$watchGroup(['reports.orders.businesses', 'reports.orders.filter'], updateOrders);

	function updateOrdersAcceptSpend() {
		$scope.reports.ordersAcceptSpend.loading = true;
		var options = {
			lapse: $scope.filters.filter,
			timezone: $scope.timezone
		};
		if ($scope.filters.drivers.length > 0) options.drivers = $scope.filters.drivers;
		Ordering.driver_reports.ordersAcceptSpend(options, function (res) {
			if (!res.error) {
				$scope.accept_spend = res.result;
				$scope.reports.ordersAcceptSpend.loading = false;
			} else MyAlert.show(res.result);
		});
	}
	function updateOrdersPickupSpend() {
		$scope.reports.ordersPickupSpend.loading = true;
		var options = {
			lapse: $scope.filters.filter,
			timezone: $scope.timezone
		};
		if ($scope.filters.drivers.length > 0) options.drivers = $scope.filters.drivers;
		Ordering.driver_reports.ordersPickupSpend(options, function (res) {
			if (!res.error) {
				$scope.pickup_spend = res.result;
				$scope.reports.ordersPickupSpend.loading = false;
			} else MyAlert.show(res.result);
		});
	}
	function updateOrdersDeliverySpend() {
		$scope.reports.ordersDeliverySpend.loading = true;
		var options = {
			lapse: $scope.filters.filter,
			timezone: $scope.timezone
		};
		if ($scope.filters.drivers.length > 0) options.drivers = $scope.filters.drivers;
		Ordering.driver_reports.ordersDeliverySpend(options, function (res) {
			if (!res.error) {
				$scope.delivery_spend = res.result;
				$scope.reports.ordersDeliverySpend.loading = false;
			} else MyAlert.show(res.result);
		});
	}
	function updateOrdersCompleteSpend() {
		$scope.reports.ordersCompleteSpend.loading = true;
		var options = {
			lapse: $scope.filters.filter,
			timezone: $scope.timezone
		};
		if ($scope.filters.drivers.length > 0) options.drivers = $scope.filters.drivers;
		Ordering.driver_reports.ordersCompleteSpend(options, function (res) {
			if (!res.error) {
				$scope.complete_spend = res.result;
				$scope.reports.ordersCompleteSpend.loading = false;
			} else MyAlert.show(res.result);
		});
	}
	function updateOrdersArrivedPickupSpend() {
		$scope.reports.ordersArrivedPickupSpend.loading = true;
		var options = {
			lapse: $scope.filters.filter,
			timezone: $scope.timezone
		};
		if ($scope.filters.drivers.length > 0) options.drivers = $scope.filters.drivers;
		Ordering.driver_reports.ordersArrivedPickupSpend(options, function (res) {
			if (!res.error) {
				$scope.inbusiness_pickup_spend = res.result;
				$scope.reports.ordersArrivedPickupSpend.loading = false;
			} else MyAlert.show(res.result);
		});
	}
	//-------------------------------------------HeaTmap
	var map, heatmap;
	var markerCluster = null;
	var markers = [];
	$scope.isHeat = false;
	function updateHeatMap() {
		$scope.isHeat = false;
		$scope.loadGoogleMaps(function () {
			map = new google.maps.Map(document.getElementById('heatmap'), {
				zoom: 13,
				center: { lat: 37.775, lng: -122.434 },
				disableDefaultUI: true
			});
			var bounds = new google.maps.LatLngBounds();

			var options = {
				lapse: $scope.filters.filter,
				timezone: $scope.timezone
			};
			if ($scope.filters.drivers.length > 0) options.drivers = $scope.filters.drivers;
			Ordering.driver_reports.order_location(options, function (res) {
				if (!res.error) {
					var locations = res.result.map(function (location) {
						return {
							lat: location.lat * 1,
							lng: location.lng * 1
						}
					});
					heatmap = new google.maps.visualization.HeatmapLayer({
						data: locations.map(function (location) {
							return new google.maps.LatLng(location.lat, location.lng)
						}),
						map: null,
						radius: 17
					});
					markers = locations.map(function (location, i) {
						bounds.extend(location);
						return new MarkerWithLabel({
							position: location,
							draggable: false,
							raiseOnDrag: false,
							map: map,
							labelContent: '<div><img src="' + $scope.rootTheme + '/img/icon.png"></img></div>',
							labelAnchor: new google.maps.Point(19, 45),
							labelClass: "pin customer", // the CSS class for the label
							labelStyle: { opacity: 1 }
						});
					});
					map.fitBounds(bounds);
					markerCluster = new MarkerClusterer(map, markers,
						{ imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' });
				}
			})
		})
	}

	$scope.toggleHeatmap = function () {
		$scope.isHeat = !$scope.isHeat;
		heatmap.setMap(heatmap.getMap() ? null : map);
		if (heatmap.getMap()) {
			markerCluster.clearMarkers()
		} else {
			markerCluster.addMarkers(markers);
		}
	}

	// $scope.$watchGroup(['reports.ordersAcceptSpend.businesses', 'reports.ordersAcceptSpend.filter'], updateOrdersAcceptSpend);

	function createLapse(inputs, lapse) {
		var datefrom = $(inputs.from).datetimepicker({
			format: 'YYYY-MM-DD',
		});
		datefrom.on('dp.show', function () {
			$(".bootstrap-datetimepicker-widget").attr('data-tap-disabled', 'true');
		});
		var dateto = $(inputs.to).datetimepicker({
			useCurrent: false, //Important! See issue #1075
			format: 'YYYY-MM-DD',
		});
		dateto.on('dp.show', function () {
			$(".bootstrap-datetimepicker-widget").attr('data-tap-disabled', 'true');
			$(".bootstrap-datetimepicker-widget").css({ 'right': '0px', 'left': 'auto' })
		});
		$(inputs.from).on("dp.change", function (e) {
			$(inputs.to).data("DateTimePicker").minDate(e.date);
			$scope.$apply(function () {
				lapse.to = $(inputs.to).val();
				lapse.from = $(inputs.from).val();
			});
		});
		$(inputs.to).on("dp.change", function (e) {
			$(inputs.from).data("DateTimePicker").maxDate(e.date)
			$scope.$apply(function () {
				lapse.to = $(inputs.to).val();
				lapse.from = $(inputs.from).val();
			});
		});
	}
	$scope.topSelling = [];
	$scope.topCategories = [];
	function makeChart(element_id, options) {
		var yAxes = [{
			ticks: {
				beginAtZero: true
			}
		}];
		var xAxes = [{}];
		var tooltips = {};
		var datasets = [{}];
		if (options.yAxes) yAxes = options.yAxes;
		if (options.xAxes) xAxes = options.xAxes;
		if (options.tooltips) tooltips = options.tooltips;
		if (options.datasets) datasets = options.datasets;
		else {
			datasets = [{
				label: options.label,
				data: options.data,
				backgroundColor: 'rgba(15, 146, 70, 0.6)',
				borderColor: 'rgba(15, 146, 70, 0.8)',
				borderWidth: 1
			}]
		}
		var ctx = document.getElementById(element_id).getContext('2d');
		var chart = new Chart(ctx, {
			type: options.type,
			data: {
				labels: options.labels,
				datasets: datasets,
			},
			options: {
				scales: {
					yAxes: yAxes,
					xAxes: xAxes
				},
				elements: {
					line: {
						tension: 0
					}
				},
				tooltips: tooltips
			}
		});
		return chart;
	}
	function getScale(lapse) {
		var scale = {
			size: 600,
			max: 3600,
			divisor: 60,
		}
		switch (lapse) {
			case 'today':
			case 'yesterday':
				scale = {
					size: 600,
					max: 3600,
					divisor: 60,
				}
				break;
			case 'last_7_days':
			case 'last_30_days':
				scale = {
					size: 3600,
					max: 3600 * 24,
					divisor: 3600,
				}
				break;
			default:
				var lapse = lapse.split(',');
				var from = moment(lapse[0] + ' 00:00:00');
				var to = moment(lapse[1] + ' 24:00:00');
				var duration = moment.duration(from.diff(to));
				var hours = Math.abs(duration.asHours());
				var days = Math.abs(duration.asDays());
				var months = Math.abs(duration.asMonths());
				if (hours <= 24) {
					scale = {
						size: 600,
						max: 3600,
						divisor: 60,
					}
				} else if (days <= 30) {
					scale = {
						size: 3600,
						max: 3600 * 24,
						divisor: 3600,
					}
				} else if (months <= 12) {

				} else {

				}
				break;
		}
		return scale;
	}
	function getTimeAxes(lapse, offset) {
		var xAxes = [{
			type: 'time',
			time: {
				stepSize: 1,
				displayFormats: {
					hour: 'LT'
				}
			},
			ticks: {
				fontSize: 10
			}
		}];
		switch (lapse) {
			case 'today':
			case 'yesterday':
				xAxes[0].time.unit = 'hour';
				xAxes[0].time.min = moment().subtract(lapse == 'today' ? 0 : 1, 'days').format('YYYY-MM-DD 00:00:00');
				xAxes[0].time.max = moment().subtract(lapse == 'today' ? 0 : 1, 'days').format('YYYY-MM-DD 24:00:00');
				if (offset) {
					xAxes[0].time.min = moment(xAxes[0].time.min).subtract(1, 'days').format('YYYY-MM-DD 23:00:00')
					xAxes[0].time.max = moment(xAxes[0].time.max).format('YYYY-MM-DD 01:00:00');
				}
				break;
			case 'last_7_days':
			case 'last_30_days':
				xAxes[0].time.unit = 'day';
				xAxes[0].time.min = moment().subtract(lapse == 'last_7_days' ? 7 : 30, 'days').format('YYYY-MM-DD');
				xAxes[0].time.max = moment().format('YYYY-MM-DD');
				if (offset) {
					xAxes[0].time.min = moment(xAxes[0].time.min).subtract(1, 'days').format('YYYY-MM-DD')
					xAxes[0].time.max = moment(xAxes[0].time.max).add(1, 'days').format('YYYY-MM-DD');
				}
				break;
			default:
				var lapse = lapse.split(',');
				var from = moment(lapse[0] + ' 00:00:00');
				var to = moment(lapse[1] + ' 24:00:00');
				var duration = moment.duration(from.diff(to));
				var hours = Math.abs(duration.asHours());
				var days = Math.abs(duration.asDays());
				var months = Math.abs(duration.asMonths());
				if (hours <= 24) {
					xAxes[0].time.unit = 'hour';
					xAxes[0].time.min = from.format('YYYY-MM-DD HH:mm:ss');
					xAxes[0].time.max = to.format('YYYY-MM-DD HH:mm:ss');
					if (offset) {
						xAxes[0].time.min = moment(xAxes[0].time.min).subtract(1, 'hours').format('YYYY-MM-DD HH:mm:ss')
						xAxes[0].time.max = moment(xAxes[0].time.max).add(1, 'hours').format('YYYY-MM-DD HH:mm:ss');
					}
				} else if (days <= 30) {
					xAxes[0].time.unit = 'day';
					xAxes[0].time.min = from.format('YYYY-MM-DD HH:mm:ss');
					xAxes[0].time.max = to.format('YYYY-MM-DD HH:mm:ss');
					if (offset) {
						xAxes[0].time.min = moment(xAxes[0].time.min).subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss')
						xAxes[0].time.max = moment(xAxes[0].time.max).add(1, 'days').format('YYYY-MM-DD HH:mm:ss');
					}
				} else if (months <= 12) {
					xAxes[0].time.unit = 'month';
					xAxes[0].time.min = from.format('YYYY-MM-DD HH:mm:ss');
					xAxes[0].time.max = to.format('YYYY-MM-DD HH:mm:ss');
					if (offset) {
						xAxes[0].time.min = moment(xAxes[0].time.min).subtract(1, 'months').format('YYYY-MM-DD HH:mm:ss')
						xAxes[0].time.max = moment(xAxes[0].time.max).add(1, 'months').format('YYYY-MM-DD HH:mm:ss');
					}
				} else {
					xAxes[0].time.unit = 'year';
					xAxes[0].time.min = from.format('YYYY-MM-DD HH:mm:ss');
					xAxes[0].time.max = to.format('YYYY-MM-DD HH:mm:ss');
					if (offset) {
						xAxes[0].time.min = moment(xAxes[0].time.min).subtract(1, 'years').format('YYYY-MM-DD HH:mm:ss')
						xAxes[0].time.max = moment(xAxes[0].time.max).add(1, 'years').format('YYYY-MM-DD HH:mm:ss');
					}
				}
				break;
		}
		return xAxes;
	}

	function getLabelDateByFilter(date, filter) {
		var label = date;
		switch (filter) {
			case 'day':
			case 'yesterday':
				label = moment(date).format('YYYY-MM-DD HH:mm:ss');
				break;
			case 'last_7_days':
			case 'last_30_days':
				label = moment(date).format('MMM D');
				break;
			default:
				var lapse = filter.split(',');
				var from = moment(lapse[0] + ' 00:00:00');
				var to = moment(lapse[1] + ' 24:00:00');
				var duration = moment.duration(from.diff(to));
				var hours = Math.abs(duration.asHours());
				var days = Math.abs(duration.asDays());
				var months = Math.abs(duration.asMonths());
				if (hours <= 24) {
					label = moment(date).format('YYYY-MM-DD HH:mm:ss');
				} else if (days <= 30) {
					label = moment(date).format('MMM D');
				} else if (months <= 12) {
					label = moment(date).format('MMM YYYY');
				} else {
					label = moment(date).format('YYYY');
				}
				break;
		}
		return label;
	}
	$(document).ready(function () {
		$('[data-toggle="popover"]').popover({ html: true })
	});
	/***Show Bottom Help***/
});

_controllers.controller('downloadableReportsEditorCtrl', function ($scope, MyModal, MyLoading, MyAlert, Ordering, gUser, $state/*newreportsEditorCtrl*/) {
	$scope.isBusinessOwner = gUser.getData().level == 2;
	if (!$scope.superAdmin && !$scope.isBusinessOwner) {
		// MyLoading.hide();
		return $state.go(app_states.homeScreen);
	}
	$scope.isSuperAdmin = gUser.getData().level == 0;

	$scope.status = [
		{ id: "0", value: $scope.translate('ORDER_STATUS_PENDING'), tab: 'pending' },
		{ id: "1", value: $scope.translate('ORDERS_COMPLETED'), tab: 'completed' },
		{ id: "2", value: $scope.translate('ORDER_REJECTED'), tab: 'cancelled' },
		{ id: "3", value: $scope.translate('ORDER_STATUS_IN_BUSINESS'), tab: 'in_progress' },
		{ id: "4", value: $scope.translate('ORDER_READY'), tab: 'in_progress' },
		{ id: "5", value: $scope.translate('ORDER_REJECTED_RESTAURANT'), tab: 'cancelled' },
		{ id: "6", value: $scope.translate('ORDER_STATUS_CANCELLEDBYDRIVER'), tab: 'cancelled' },
		{ id: "7", value: $scope.translate('ORDER_STATUS_ACCEPTEDBYRESTAURANT'), tab: 'in_progress' },
		{ id: "8", value: $scope.translate('ORDER_CONFIRMED_ACCEPTED_BY_DRIVER'), tab: 'in_progress' },
		{ id: "9", value: $scope.translate('ORDER_PICKUP_COMPLETED_BY_DRIVER'), tab: 'in_progress' },
		{ id: "10", value: $scope.translate('ORDER_PICKUP_FAILED_BY_DRIVER'), tab: 'cancelled' },
		{ id: "11", value: $scope.translate('ORDER_DELIVERY_COMPLETED_BY_DRIVER'), tab: 'completed' },
		{ id: "12", value: $scope.translate('ORDER_DELIVERY_FAILED_BY_DRIVER'), tab: 'cancelled' },
		{ id: "13", value: $scope.translate('PREORDER'), tab: 'pending' },
		{ id: "14", value: $scope.translate('ORDER_NOT_READY'), tab: 'in_progress' },
		{ id: "15", value: $scope.translate('ORDER_PICKUP_COMPLETED_BY_CUSTOMER'), tab: 'completed' },
		{ id: "16", value: $scope.translate('ORDER_CANCELLED_BY_CUSTOMER'), tab: 'cancelled' },
		{ id: "17", value: $scope.translate('NOT_PICKED_BY_CUSTOMER'), tab: 'cancelled' },
		{ id: "18", value: $scope.translate('DRIVER_NEAR_BUSINESS'), tab: 'in_progress' },
		{ id: "19", value: $scope.translate('DRIVER_NEAR_CUSTOMER'), tab: 'in_progress' },
		{ id: "20", value: $scope.translate('CUSTOMER_NEAR_BUSINESS'), tab: 'in_progress' },
		{ id: "21", value: $scope.translate('CUSTOMER_ARRIVED_BUSINESS'), tab: 'in_progress' },
	];

	$scope.filters = {
		states: '',
		businesses: [],
		drivers: [],
		from: '',
		to: '',
		hours: {
			operator: '',
		},
		grouping: {
			operator: '',
			group_by: ''
		}
	};

	createLapse({
		from: '#filter-from',
		to: '#filter-to'
	}, $scope.filters);

	function createLapse(inputs, lapse) {
		var datefrom = $(inputs.from).datetimepicker({
			format: 'YYYY-MM-DD',
		});
		datefrom.on('dp.show', function () {
			$(".bootstrap-datetimepicker-widget").attr('data-tap-disabled', 'true');
		});
		var dateto = $(inputs.to).datetimepicker({
			useCurrent: false, //Important! See issue #1075
			format: 'YYYY-MM-DD',
		});
		dateto.on('dp.show', function () {
			$(".bootstrap-datetimepicker-widget").attr('data-tap-disabled', 'true');
		});
		$(inputs.from).on("dp.change", function (e) {
			$(inputs.to).data("DateTimePicker").minDate(e.date);
			$scope.$apply(function () {
				lapse.to = $(inputs.to).val();
				lapse.from = $(inputs.from).val();
			});
		});
		$(inputs.to).on("dp.change", function (e) {
			$(inputs.from).data("DateTimePicker").maxDate(e.date)
			$scope.$apply(function () {
				lapse.to = $(inputs.to).val();
				lapse.from = $(inputs.from).val();
			});
		});
	}

	$scope.openBusinessFilter = function () {
		$scope.filterBusiness($scope.filters.businesses, function (businesses) {
			$scope.filters.businesses = businesses;
		});
	}

	$scope.filterBusiness = function (businesses, cb) {
		MyLoading.show($scope.translate('LOADING') + '...');
		Ordering.business.all({
			mode: 'dashboard',
			params: 'id,name,slug'
		}, function (res) {
			MyLoading.hide();
			if (!res.error) {
				MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/business-filter.html', {
					scope: $scope,
				}).then(function (filter_business) {
					filter_business.scope.selected = {};
					res.result.forEach(function (business) {
						filter_business.scope.selected[business.slug] = businesses.length == 0 || businesses.indexOf(business.id) != -1;
					});
					filter_business.scope.all = businesses.length == 0;
					filter_business.scope.toggleAll = function () {
						filter_business.scope.all = !filter_business.scope.all;
						res.result.forEach(function (business) {
							filter_business.scope.selected[business.slug] = filter_business.scope.all;
						});
					}
					filter_business.scope.refresh = function () {
						for (var key in filter_business.scope.selected) {
							if (!filter_business.scope.selected[key]) {
								filter_business.scope.all = false;
								break;
							}
						}
					}
					filter_business.scope.toggleBusiness = function (business) {
						filter_business.scope.selected[business] = !filter_business.scope.selected[business];
						filter_business.scope.refresh();
					}
					filter_business.scope.apply = function () {
						var filtered = [];
						res.result.forEach(function (business) {
							if (filter_business.scope.selected[business.slug]) {
								filtered.push(business.id);
							}
						});
						filter_business.scope.hide();
						cb(filtered);
					}
					filter_business.scope.hide = function () {
						filter_business.hide();
						filter_business.remove();
					}
					filter_business.show().then(function () {
						filter_business.scope.businesses = res.result;
					});
				});
			} else MyAlert.show(res.result);
		});
	}

	$scope.clearBusinessFilter = function () {
		$scope.filters.businesses = []
	}

	$scope.openDriverFilter = function () {
		$scope.filterDrivers($scope.filters.drivers, function (drivers) {
			$scope.filters.drivers = drivers;
		});
	}

	$scope.filterDrivers = function (drivers, cb) {
		MyLoading.show($scope.translate('LOADING') + '...');
		Ordering.users.all({
			mode: 'dashboard',
			params: 'id,name,driver_groups',
			where: [{
				attribute: 'level',
				value: '4'
			}]
		}, function (res) {
			MyLoading.hide();
			if (!res.error) {
				MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/driver-filter.html', {
					scope: $scope,
				}).then(function (filter_driver) {
					filter_driver.scope.selected = {};
					filter_driver.scope.drivergroups = [];
					filter_driver.scope.allDriverGroup = true;
					filter_driver.scope.noneDriverGroup = true;
					res.result.forEach(function (driver) {
						driver.selected = true;
						if (driver.drivergroups.length == 0) {
							var index = filter_driver.scope.drivergroups.findIndex(function (drivergroup) {
								return drivergroup.name == 'no-group'
							})
							if (index == -1) {
								filter_driver.scope.drivergroups.push({
									selected: true,
									name: 'no-group',
									id: 0,
									drivers: [driver],
									all: true
								})
							} else {
								filter_driver.scope.drivergroups[index].drivers.push(driver)
							}
						} else {
							driver.drivergroups.forEach(function (drivergroup) {
								var _index = filter_driver.scope.drivergroups.findIndex(function (_drivergroup) {
									return drivergroup.id == _drivergroup.id;
								})
								if (_index != -1) filter_driver.scope.drivergroups[_index].drivers.push(driver)
								else {
									filter_driver.scope.drivergroups.push({
										id: drivergroup.id,
										name: drivergroup.name,
										selected: true,
										drivers: [driver],
										all: true
									})
								}
							})
						}
					});

					filter_driver.scope.apply = function () {
						var filtered = [];
						filter_driver.scope.drivergroups.forEach(function (drivergroup) {
							drivergroup.drivers.forEach(function (driver) {
								if (filtered.indexOf(driver.id) == -1 && driver.selected) filtered.push(driver.id)
							})
						});
						filter_driver.scope.hide();
						cb(filtered);
					}
					filter_driver.scope.hide = function () {
						filter_driver.hide();
						filter_driver.remove();
					}
					filter_driver.show().then(function () {
						filter_driver.scope.drivers = res.result;
					});
					filter_driver.scope.curDrivergroup = -1;
					filter_driver.scope.toggleDrivergroup = function (drivergroup) {
						if (filter_driver.scope.curDrivergroup == drivergroup) filter_driver.scope.curDrivergroup = -1;
						else filter_driver.scope.curDrivergroup = drivergroup;
					}
					filter_driver.scope.toggleAllGroups = function () {
						filter_driver.scope.allDriverGroup = !filter_driver.scope.allDriverGroup;
						filter_driver.scope.noneDriverGroup = !filter_driver.scope.allDriverGroup;
						for (var i = 0; i < filter_driver.scope.drivergroups.length; i++) {
							for (var j = 0; j < filter_driver.scope.drivergroups[i].drivers.length; j++) {
								filter_driver.scope.drivergroups[i].drivers[j].selected = filter_driver.scope.allDriverGroup;
							}
							filter_driver.scope.drivergroups[i].selected = filter_driver.scope.allDriverGroup;
							filter_driver.scope.drivergroups[i].all = filter_driver.scope.allDriverGroup;
							filter_driver.scope.drivergroups[i].none = !filter_driver.scope.allDriverGroup;
						}
					}
					filter_driver.scope.toggleAll = function (drivergroup) {
						var all = true;
						var none = true;
						for (var i = 0; i < drivergroup.drivers.length; i++) {
							drivergroup.drivers[i].selected = !drivergroup.all;
						}
						drivergroup.none = drivergroup.all;
						drivergroup.all = !drivergroup.all;

						for (var i = 0; i < filter_driver.scope.drivergroups.length; i++) {
							if (!filter_driver.scope.drivergroups[i].all) all = false;
							else none = false
						}

						filter_driver.scope.allDriverGroup = all;
						filter_driver.scope.noneDriverGroup = none;
					}
					filter_driver.scope.toggleDriver = function (drivergroup) {
						var all = true;
						var none = true;
						for (var i = 0; i < drivergroup.drivers.length; i++) {
							if (drivergroup.drivers[i].selected) none = false;
							else all = false;
						}
						drivergroup.all = all;
						drivergroup.none = none;

						for (var i = 0; i < filter_driver.scope.drivergroups.length; i++) {
							if (!filter_driver.scope.drivergroups[i].all) all = false;
							else none = false
						}
						filter_driver.scope.allDriverGroup = all;
						filter_driver.scope.noneDriverGroup = none;
					}
				});
			} else MyAlert.show(res.result);
		});
	}

	$scope.clearDriversFilter = function () {
		$scope.filters.drivers = []
	}

	$scope.downloadReport = function (endpoint) {
		MyLoading.show();
		var error = []
		if ($scope.filters.from === '') error.push($scope.translate('FROM_EMPTY_ERROR'));
		if ($scope.filters.to === '') error.push($scope.translate('TO_EMPTY_ERROR'))
		if (error.length > 0) {
			MyLoading.hide();
			MyAlert.show(error);
			return;
		}
		var body = {
			from: $scope.filters.from + ' 00:00:00',
			to: $scope.filters.to + ' 23:59:59',
		}
		if ($scope.filters.businesses.length > 0) body.businesses = JSON.stringify($scope.filters.businesses);
		if ($scope.filters.drivers.length > 0) body.drivers = JSON.stringify($scope.filters.drivers);
		if ($scope.filters.states) body.states = JSON.stringify([parseInt($scope.filters.states)]);

		switch (endpoint) {
			case 'hours_report':
				if ($scope.filters.hours.operator) body.operator = $scope.filters.hours.operator;
				Ordering.reports.hours_report(body, function (res) {
					if (!res.error) {
						Ordering.reports.download_report('hours_report', body, function () {
							MyLoading.hide()
						})
					} else {
						MyLoading.hide()
						MyAlert.show(res.result)
					}
				});
				break;
			case 'grouping_report':
				if ($scope.filters.grouping.operator) body.operator = $scope.filters.grouping.operator;
				if ($scope.filters.grouping.group_by) body.group_by = $scope.filters.grouping.group_by;
				Ordering.reports.grouping_report(body, function (res) {
					if (!res.error) {
						Ordering.reports.download_report('grouping_report', body, function () {
							MyLoading.hide()
						})
					} else {
						MyLoading.hide()
						MyAlert.show(res.result)
					}
				});
				break;
			case 'products_report':
				Ordering.reports.products_report(body, function (res) {
					if (!res.error) {
						Ordering.reports.download_report('products_report', body, function () {
							MyLoading.hide()
						})
					} else {
						MyLoading.hide()
						MyAlert.show(res.result)
					}
				});
				break;
			default:
				break;
		}


	}

});

_controllers.controller('limitsSettingsEditorCtrl', function ($scope, Ordering, MyAlert, MyLoading, $state, $rootScope) {
	MyLoading.show($scope.translate('LOADING') + '...');
	$scope.limits = [];
	$scope.wasLimitReached = function (limit) {
		return limit.usage >= limit.limit;
	}
	$scope.getUsageBeforeSoftlimit = function (limit) {
		var percentage_softlimit = limit.softlimit * 100 / limit.limit;
		var percentage_usage = limit.usage * 100 / limit.limit;
		if (percentage_softlimit < percentage_usage) {
			return percentage_softlimit;
		}
		return percentage_usage;
	}
	$scope.getUsageAfterSoftlimit = function (limit) {
		var percentage_softlimit = limit.softlimit * 100 / limit.limit;
		var percentage_usage = limit.usage * 100 / limit.limit;
		if (percentage_softlimit < percentage_usage) return percentage_usage - percentage_softlimit;
		return 0;
	}
	Ordering.limits.get({
		params: 'key,type,lapse,softlimit,limit,usage,email_sent'
	}, function (res) {
		MyLoading.hide();
		if (!res.error) {
			$scope.limits = res.result;
		} else {
			MyAlert.show(res.result);
		}
	});
});

_controllers.filter('startFrom', function () {
	return function (input, start) {
		if (!input) input = [];
		start = +start; //parse to int
		return input.slice(start);
	}
});

function validDate(date) {
	var parts = date.split('-');
	if (parts.length != 3) return false;
	else {
		var date = new Date(parts[0], parts[1] - 1, parts[2]);
		if (date == 'Invalid Date' || date.getDate() != parts[2] || date.getMonth() != parts[1] - 1) return false;
		else return true;
	}
}

_controllers.controller('supportEditorCtrl', function ($scope, $rootScope, $state, MyAlert, $timeout, MyLoading, gUser, Ordering/*newsupportEditorCtrl*/) {

	$rootScope.configs = {};
	MyLoading.show();
	if (!$scope.editorAvilable || !$scope.superAdmin || !$scope.SUPPORT_SECTION) {
		// MyLoading.hide();
		return $state.go(app_states.homeScreen);
	}
	$scope.getLanguage(function (err, list, dictionary) {
		$rootScope.pageTitle = $scope.translate('SUPPORT');
		Ordering.configs.all({
		}, function (res) {
			MyLoading.hide();
			$rootScope.configs = res;
		});
	});

	if ($state.params.section == '') $state.params.section = '/gethelp';
	$scope.curTemplateFile = $state.params.section.replace('/', '') + '.html';
	$scope.curTemplate = 'templates/' + ADDONS.template + '/views/editor/support/' + $scope.curTemplateFile;
	$scope.changeTemplate = function (template) {
		if (template == 'tutorials') {
			location.href = (!WEB_ADDONS.remove_hash ? '#' : '') + '/support/' + template;
		} else if ((SUPPORT_PRO_PACKAGE && template == 'orderingapp') || SUPPORT_ADVANCED_PACKAGE) {
			location.href = (!WEB_ADDONS.remove_hash ? '#' : '') + '/support/' + template;
		} else if (SUPPORT_ADVANCED_PACKAGE) {
			location.href = (!WEB_ADDONS.remove_hash ? '#' : '') + '/support/' + template;
		} else if ((!SUPPORT_PRO_PACKAGE || !SUPPORT_ADVANCED_PACKAGE) && template == 'orderingapp') {
			MyAlert.show($rootScope.translate('SUPPORT_ALERT_PRO_PACKAGE'));
		} else if ((!SUPPORT_ADVANCED_PACKAGE && template == 'businessapp') || (!SUPPORT_ADVANCED_PACKAGE && template == 'deliveryapp')) {
			MyAlert.show($rootScope.translate('SUPPORT_ALERT_PRO_PACKAGE'));
		} else if (template == 'gethelp') {
			location.href = (!WEB_ADDONS.remove_hash ? '#' : '') + '/support/' + template;
		} else if (template == 'ticketrequest') {
			location.href = (!WEB_ADDONS.remove_hash ? '#' : '') + '/support/' + template;
		} else if (template == 'improvementrequest') {
			location.href = (!WEB_ADDONS.remove_hash ? '#' : '') + '/support/' + template;
		} else if (template == 'quoterequest') {
			location.href = (!WEB_ADDONS.remove_hash ? '#' : '') + '/support/' + template;
		} else if (template == 'billingrequest') {
			location.href = (!WEB_ADDONS.remove_hash ? '#' : '') + '/support/' + template;
		} else if (template == 'cancelrequest') {
			location.href = (!WEB_ADDONS.remove_hash ? '#' : '') + '/support/' + template;
		}
	}
});

_controllers.controller('tutorialSupportEditorCtrl', function ($scope, $rootScope, $state, $timeout, MyLoading, Ordering, MyModal/*newsupportEditorCtrl*/) {

	var curTimeout = null;
	$scope.curForm = [];
	$scope.configs = {};
	$scope.stripe = [];

	setInterval(function () {
		var thumbs = $('.panel');
		if (thumbs.length == 1) return;
		var max = 0;
		for (var i = 0; i < thumbs.length; i++) {
			var header = $(thumbs[i]).find('.panel-heading');
			var caption = $(thumbs[i]).find('.panel-body');
			var height = header.outerHeight() + caption.outerHeight()
			if (height > max) {
				max = height;
			}
		}
		if (max < 50) max = 50;
		$('.panel').height(max);
		if (IFRAME_INLINE) $('.panel .header').css({ 'min-height': '0px' });
	}, 150);

	MyLoading.show();
	Ordering.configs.all({ mode: 'dictionary' }, function (res) {
		MyLoading.hide();
		$scope.configs = res.result;
	});

	$scope.modalOpening = true;
	MyLoading.toast($scope.translate('LOADING') + '...');

	$scope.showTutorialVideo = function (id, title) {
		MyModal.showTemplate('templates/' + ADDONS.template + '/views/editor/support/tutorial-popup.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (tutorialVideos) {
			$rootScope.videoID = id;
			$rootScope.titleOption = title;
			modals.push(tutorialVideos);
			tutorialVideos.show();
			tutorialVideos.scope.hide = function () {
				tutorialVideos.hide();
				tutorialVideos.remove();
			}
		});
	}

	function getYoutubeCode(url) {
		var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))([^#\&\?]*).*/;
		var match = url.match(regExp);
		return (match && match[7].length == 11) ? match[7] : false;
	}

	$scope.getVideoTutorial = function (video) {
		if (video.indexOf('youtube')) {
			return '<iframe class="video-size" src="https://www.youtube-nocookie.com/embed/' + getYoutubeCode(video) + '" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
		}
	}
});

_controllers.controller('improvementEditorCtrl', function ($scope, gUser/*newimprovementEditorCtrl*/) {

	$scope.user = gUser.getData();
	var id = $scope.user.email.replace("@", '').replace('.', '');

	!function (w, d, i, s) { function l() { if (!d.getElementById(i)) { var f = d.getElementsByTagName(s)[0], e = d.createElement(s); e.type = "text/javascript", e.async = !0, e.src = "https://canny.io/sdk.js", f.parentNode.insertBefore(e, f) } } if ("function" != typeof w.Canny) { var c = function () { c.q.push(arguments) }; c.q = [], w.Canny = c, "complete" === d.readyState ? l() : w.attachEvent ? w.attachEvent("onload", l) : w.addEventListener("load", l, !1) } }(window, document, "canny-jssdk", "script");

	Canny('identify', {
		appID: '5b05e5e2d3f6c47201694ad4',
		user: {
			email: $scope.user.email,
			id: id,
			name: $scope.user.name
		},
	});

	Canny('render', {
		boardToken: '0856eb5b-d4cf-9132-5520-98f2f466c555',
		basePath: null, // See step 2
		ssoToken: null, // See step 3
	});
});

_controllers.filter('ogfilter', function () {
	return function (input, search) {
		if (!search) {
			return input;
		}

		var found = false;

		for (var i = 0; i < input.length; i++) {
			var order_group = input[i];
			if (!order_group.debug && order_group.id == search) {
				found = true;
				break;
			}
		}

		var hasDebug = input.length > 0 && input[0].debug;
		if (!found && !hasDebug) {
			if (search != '-1') {
				input.unshift({
					id: parseInt(search),
					debug: true
				});
			}
		} else if (found && hasDebug) {
			input.shift();
		}
		return input;
	}
});
