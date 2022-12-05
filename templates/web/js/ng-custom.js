_controllers.controller('businessTypeSubCatEditorCtrl', function ($scope, $rootScope, $state, $ionicModal, $timeout, MyAlert, MyLoading,$http) {
    $scope.curbtypessubcat = {};
    var curTimeout = null;
    $scope.businesstypes = [];
    
    $scope.newpagination = {
        current: 1,
        pages: 1,
        items: '10',
        itemsPerPage: [10,20,30,50,100]
    }   
    
    $scope.nextPage = function (pagination) {
        if (pagination.current < pagination.pages) pagination.current++;
        setTimeout(function () {    
        $(function () {
          var colpick = $('.demo').each( function() {
            $(this).minicolors({
              control: $(this).attr('data-control') || 'hue',
              inline: $(this).attr('data-inline') === 'true',
              letterCase: 'lowercase',
              opacity: false,
              change: function(hex, opacity) {
                if(!hex) return;
                if(opacity) hex += ', ' + opacity;
                try {
                  console.log(hex);
                } catch(e) {}
                $(this).select();
              },
              theme: 'bootstrap'
            });
          });
        }) 
    
                }, 500);    
        setTimeout(function () {
                initDragDropSubsCategoriesImage(function (err, subcat, image) {
                  if (err) utilities.MyAlert.show(err.message);
                  else {
                      
                      MyLoading.show(); 
                        var url = CUSTOM_SERVER_URL+"CloudinaryUpload/upload_btypes_img.php";
                        var data = {
                        image: image,
                        id: subcat
                        };
                        var config = {
                        headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded'
                        }
                        };
                
                        $http.post(url, data, config).then(function (response) {
                            MyLoading.hide();
                            for (var i = 0; i < $scope.businesstypes.length; i++) {
                                  if ($scope.businesstypes[i].id == subcat) {                                     
                                     $scope.businesstypes[i].image = image;
                                  }
                            }
                            
                        })
                   
                  }
                });
                }, 500);    
    }
    $scope.backPage = function (pagination) {
        if (pagination.current > 0) pagination.current--;
        setTimeout(function () {    
        $(function () {
          var colpick = $('.demo').each( function() {
            $(this).minicolors({
              control: $(this).attr('data-control') || 'hue',
              inline: $(this).attr('data-inline') === 'true',
              letterCase: 'lowercase',
              opacity: false,
              change: function(hex, opacity) {
                if(!hex) return;
                if(opacity) hex += ', ' + opacity;
                try {
                  console.log(hex);
                } catch(e) {}
                $(this).select();
              },
              theme: 'bootstrap'
            });
          });
        }) 
    
                }, 500);    
        setTimeout(function () {
                initDragDropSubsCategoriesImage(function (err, subcat, image) {
                  if (err) utilities.MyAlert.show(err.message);
                  else {
                      
                      MyLoading.show(); 
                        var url = CUSTOM_SERVER_URL+"CloudinaryUpload/upload_btypes_img.php";
                        var data = {
                        image: image,
                        id: subcat
                        };
                        var config = {
                        headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded'
                        }
                        };
                
                        $http.post(url, data, config).then(function (response) {
                            MyLoading.hide();
                            for (var i = 0; i < $scope.businesstypes.length; i++) {
                                  if ($scope.businesstypes[i].id == subcat) {                                     
                                     $scope.businesstypes[i].image = image;
                                  }
                            }
                            
                        })
                   
                  }
                });
                }, 500);    
    }
    
	// image upload
  var events_subcategory_images = {
    click: function (e) {
      e.stopPropagation();
      curCategory = this.dataset.subcategoryId;
      document.getElementById(this.dataset.subcategoryId+'_file').click();
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
        events_subcategory_images.cb(err, that.dataset.subcategoryId, img)
      }, events_subcategory_images.width, events_subcategory_images.height);
    },
    change: function (e) {
      e.stopPropagation();
      checkImage(this.files[0], function (err, img) {
        events_subcategory_images.cb(err, curCategory, img)
      }, events_subcategory_images.width, events_subcategory_images.height);
    }
      };
      function initDragDropSubsCategoriesImage(cb, width, height) {
    var products = document.querySelectorAll('.subscategory .img .drag');
    var curCategory = null;
    events_subcategory_images.cb = cb;
    events_subcategory_images.width = width;
    events_subcategory_images.height = height;
    console.log(products)
    for (var i = 0; i < products.length; i++) {
      var element = products[i];
      var input = document.getElementById(element.dataset.subcategoryId+'_file');
      element.removeEventListener('click', events_subcategory_images.click);
      element.removeEventListener('dragover', events_subcategory_images.dragover);
      element.removeEventListener('dragleave', events_subcategory_images.dragleave);
      element.removeEventListener('drop', events_subcategory_images.drop);
      input.removeEventListener('change', events_subcategory_images.change);
      element.addEventListener('click', events_subcategory_images.click, false);
      element.addEventListener('dragover', events_subcategory_images.dragover, false);
      element.addEventListener('dragleave', events_subcategory_images.dragleave, false);
      element.addEventListener('drop', events_subcategory_images.drop, false);
      input.addEventListener('change', events_subcategory_images.change, false);
       }
      }

	
    $scope.initBtypessubcat = function (btypescat) {
        if (btypescat) $scope.curbtypessubcat = btypescat;
        else $scope.curbtypessubcat = {
            id: -1,
            name: ""
        };
		
		
		//console.log('134 ='+btypescat)
		/*$scope.deal.types.map(function(type){
								$scope.businessTypes.map( function(businessType) {
									if (businessType.id === type.id) {
										businessType.activated = true;
									}
								})
							})*/
		
    }
    
      $scope.range = function(value) {
        var step = 1;
        var input = [];
        for (var i = 1; i <= value; i += step) {
            input.push(i);
        }
        return input;
      };

    
    $scope.initBtypessubcat();
    $scope.getSubcatogory = function () {
        
            MyLoading.show($scope.translate('LOADING')+'...');
            var url = CUSTOM_SERVER_URL+"save_business_subtypes.php";
            var data = {
                function: 'fetchSubType',
                lang_id: localStorageApp.getItem(STORE.LANG_CODE)
            };
            var config = {
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
                }
            };
            
            $http.post(url, data, config).then(function (response) { 
              console.log(response)               
                $scope.businesstypes = response.data.result;    
                $scope.newpagination.current = 1;
                $scope.newpagination.pages = Math.ceil($scope.businesstypes.length/$scope.newpagination.items); 
                MyLoading.hide();  
				
				setTimeout(function () {
                  initDragDropSubsCategoriesImage(function (err, subcat, image) {
                    if (err) utilities.MyAlert.show(err.message);
                    else {
                        MyLoading.show(); 
                          var url = CUSTOM_SERVER_URL+"CloudinaryUpload/upload_btypes_img.php";
                          var data = {
                          image: image,
                          frndsId: subcat
                          };
                          var config = {
                          headers: {
                          'Accept': 'application/json',
                          'Content-Type': 'application/x-www-form-urlencoded'
                          }
                          };
                          $http.post(url, data, config).then(function (response) {
                              MyLoading.hide();
                              for (var i = 0; i < $scope.businesstypes.length; i++) {
                                    if ($scope.businesstypes[i].id == subcat) {                                     
                                       $scope.businesstypes[i].image_link = image;
                                    }
                              }
                          })
                    }
                  });
                  }, 800); 
    // image upload              
            })
        
    }
    $scope.getSubcatogory();
    
    $scope.checkBtypesSubCat = function (btypes) {
        if (btypes.name.trim() == '') return new Error($rootScope.translate('PLEASE_ENTER_NAME'));
        else return null;
    }
    
    $scope.saveBtypesSubcat = function (curbtypessubcat) {

      for (let i = 0; i < $scope.businesstypes.length; i++) {
        if($scope.businesstypes[i].name == curbtypessubcat.name){
          MyAlert.show($scope.translate('SAME_NAME_ERROR'));
          return;
        }
        
      }

        var error = $scope.checkBtypesSubCat(curbtypessubcat);
        if (error) MyAlert.show(error.message);
        else {
            
            MyLoading.show($scope.translate('LOADING')+'...');
            var url = CUSTOM_SERVER_URL+"save_business_subtypes.php";
            var data = {
                function: 'saveSubType',
                name        : $scope.curbtypessubcat.name,
                lang_id: localStorageApp.getItem(STORE.LANG_CODE)
            };
            var config = {
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
                }
            };
            
            $http.post(url, data, config).then(function (response) {
                $scope.getSubcatogory();
                $scope.curbtypessubcat = {
                    id: -1,
                    name: ""
                };
                MyLoading.success($rootScope.translate('UPDATE_SUCCESSFUL'), 1500);
                MyLoading.hide();                       
                
            })
        }
        
    }

    
    $scope.updateBtypesSubCat = function (subcats) {
        console.log(subcats);

        // for (let i = 0; i < $scope.businesstypes.length; i++) {
        //   if($scope.businesstypes[i].name == subcats.name){
        //     MyAlert.show($scope.translate('SAME_NAME_ERROR'));
        //     return;
        //   }
          
        // }

        var error = $scope.checkBtypesSubCat(subcats);
        if (error) MyAlert.show(error.message);
        else {
            
            MyLoading.show($scope.translate('LOADING')+'...');
            
          
            var url = CUSTOM_SERVER_URL+"save_business_subtypes.php";
            var data = {
                function: 'updateSubType',
                name        : subcats.name,
                id        : subcats.id,
                lang_id: localStorageApp.getItem(STORE.LANG_CODE),
                enabled: subcats.enabled,
                hide_status: subcats.hide_status,
                imge: subcats.imge,
                description: subcats.description
            };
            console.log(data);

            var config = {
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
                }
            };
            
            $http.post(url, data, config).then(function (response) {
                MyLoading.success($rootScope.translate('UPDATE_SUCCESSFUL'), 1500);
                MyLoading.hide();                       
                
            })          
        }
    }
    
    $scope.removeBtypesSubCat = function (subcats) {
        MyAlert.confirm($rootScope.translate('REMOVE_BUSINESS_TYPE_CATEGORY')).then(function (res) {
            
            MyLoading.toast($rootScope.translate('LOADING'));
            var url = CUSTOM_SERVER_URL+"save_business_subtypes.php";
            var data = {
                function: 'deleteSubType',
                id        : subcats.id

            };
            var config = {
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
                }
            };
            
            $http.post(url, data, config).then(function (response) {
                $scope.getSubcatogory();
                MyLoading.success($rootScope.translate('DELETED_SUCCESSFULLY'), 1500);
                MyLoading.hide();                       
                
            })
            
        });
    }
	
	$scope.editBtypesSubCat = function(subcats) {
    console.log(subcats)
		$scope.subcats = subcats;
		if ($scope.modalOpening) return;
		$scope.modalOpening = true;
		MyModal.showTemplate('templates/'+ADDONS.template+'/views/editor/settings/business-typescat-settings.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(business_typescat_settings) {
			modals.push(business_typescat_settings);
			$scope.business_typescat_settings = business_typescat_settings;
			$scope.business_typescat_settings.show();
			$scope.modalOpening = false;

      setTimeout(function () {
        initDragDrop('type_image_a', function (err, image) {
          if (err) MyAlert.show(err.message);
          else $scope.subcats.image = image;
        });
      }, 200);
      business_typescat_settings.scope.updateBusinessType = function(subcats){
        console.log(subcats)

        MyLoading.show($scope.translate('LOADING')+'...');
            var url = CUSTOM_SERVER_URL+"save_business_subtypes.php";
            var data = {
                function: 'updateSubType',
                name        : subcats.name,
                id        : subcats.id,
                lang_id: localStorageApp.getItem(STORE.LANG_CODE),
				enabled: subcats.enabled,
                hide_status: subcats.hide_status,
                image: subcats.image,
                description: subcats.description
            };
            var config = {
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
                }
            };
            
            $http.post(url, data, config).then(function (response) {
                MyLoading.success($rootScope.translate('UPDATE_SUCCESSFUL'), 1500);
                MyLoading.hide();                       
                
            })    

      }
			//Extensions.runAction('after_business_types_view', subcats, $scope);
		});
	};
	
	$scope.hideBTypeSubCatSettings = function () {
		if ($scope.business_typescat_settings) {
			$scope.business_typescat_settings.hide();
			$scope.business_typescat_settings.remove();
			//$scope.initBusinessType();
		}
	};
})



_controllers.controller('partnerTypeEditorCtrl', function ($scope, $rootScope, $state, $ionicModal, $timeout, MyAlert, MyLoading,$http) {

    $scope.curpartenertypes = {};

    var curTimeout = null;

    $scope.partenertypes = [];




    $scope.newpagination = {

        current: 1,

        pages: 1,

        items: '10',

        itemsPerPage: [10,20,30,50,100]

    }   




    $scope.nextPage = function (pagination) {

        if (pagination.current < pagination.pages) pagination.current++;

        setTimeout(function () {    

        $(function () {

          var colpick = $('.demo').each( function() {

            $(this).minicolors({

              control: $(this).attr('data-control') || 'hue',

              inline: $(this).attr('data-inline') === 'true',

              letterCase: 'lowercase',

              opacity: false,

              change: function(hex, opacity) {

                if(!hex) return;

                if(opacity) hex += ', ' + opacity;

                try {

                  console.log(hex);

                } catch(e) {}

                $(this).select();

              },

              theme: 'bootstrap'

            });

          });

        }) 




                }, 500);    

        setTimeout(function () {

                initDragDropPartenerTypesImage(function (err, ptypes, image) {

                  if (err) utilities.MyAlert.show(err.message);

                  else {




                      MyLoading.show(); 

                        var url = CUSTOM_SERVER_URL+"CloudinaryUpload/upload_ptypes_img.php";

                        var data = {

                        image: image,

                        id: ptypes

                        };

                        var config = {

                        headers: {

                        'Accept': 'application/json',

                        'Content-Type': 'application/x-www-form-urlencoded'

                        }

                        };

  $http.post(url, data, config).then(function (response) {

                            MyLoading.hide();

                            for (var i = 0; i < $scope.partenertypes.length; i++) {

                                  if ($scope.partenertypes[i].id == ptypes) {                                     

                                     $scope.partenertypes[i].image = image;

                                  }

                            }
                        })
                  }

                });

                }, 500);    

    }

    $scope.backPage = function (pagination) {

        if (pagination.current > 0) pagination.current--;

        setTimeout(function () {    

        $(function () {

          var colpick = $('.demo').each( function() {

            $(this).minicolors({

              control: $(this).attr('data-control') || 'hue',

              inline: $(this).attr('data-inline') === 'true',

              letterCase: 'lowercase',

              opacity: false,

              change: function(hex, opacity) {

                if(!hex) return;

                if(opacity) hex += ', ' + opacity;

                try {

                  console.log(hex);

                } catch(e) {}

                $(this).select();

              },

              theme: 'bootstrap'

            });

          });

        }) 




                }, 500);    

        setTimeout(function () {

                initDragDropPartenerTypesImage(function (err, ptypes, image) {

                  if (err) utilities.MyAlert.show(err.message);

                  else {




                      MyLoading.show(); 

                        var url = CUSTOM_SERVER_URL+"CloudinaryUpload/upload_ptypes_img.php";

                        var data = {

                        image: image,

                        id: ptypes

                        };

                        var config = {

                        headers: {

                        'Accept': 'application/json',

                        'Content-Type': 'application/x-www-form-urlencoded'

                        }

                        };




                        $http.post(url, data, config).then(function (response) {

                            MyLoading.hide();

                            for (var i = 0; i < $scope.partenertypes.length; i++) {

                                  if ($scope.partenertypes[i].id == ptypes) {                                     

                                     $scope.partenertypes[i].image = image;

                                  }

                            }




                        })




                  }

                });

                }, 500);    

    }




      // image upload

  var events_subcategory_images = {

    click: function (e) {

      e.stopPropagation();

      curCategory = this.dataset.subcategoryId;

      document.getElementById(this.dataset.subcategoryId+'_file').click();

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

        events_subcategory_images.cb(err, that.dataset.subcategoryId, img)

      }, events_subcategory_images.width, events_subcategory_images.height);

    },

    change: function (e) {

      e.stopPropagation();

      checkImage(this.files[0], function (err, img) {

        events_subcategory_images.cb(err, curCategory, img)

      }, events_subcategory_images.width, events_subcategory_images.height);

    }

      };




      function initDragDropPartenerTypesImage(cb, width, height) {

    var products = document.querySelectorAll('.subscategory .img .drag');

    var curCategory = null;

    events_subcategory_images.cb = cb;

    events_subcategory_images.width = width;

    events_subcategory_images.height = height;

    for (var i = 0; i < products.length; i++) {

      var element = products[i];

      var input = document.getElementById(element.dataset.subcategoryId+'_file');




      element.removeEventListener('click', events_subcategory_images.click);

      element.removeEventListener('dragover', events_subcategory_images.dragover);

      element.removeEventListener('dragleave', events_subcategory_images.dragleave);

      element.removeEventListener('drop', events_subcategory_images.drop);

      input.removeEventListener('change', events_subcategory_images.change);




      element.addEventListener('click', events_subcategory_images.click, false);

      element.addEventListener('dragover', events_subcategory_images.dragover, false);

      element.addEventListener('dragleave', events_subcategory_images.dragleave, false);

      element.addEventListener('drop', events_subcategory_images.drop, false);

      input.addEventListener('change', events_subcategory_images.change, false);

       }

      }




    $scope.initPartenertypes = function (btypescat) {

        if (btypescat) $scope.curpartenertypes = btypescat;

        else $scope.curpartenertypes = {

            id: -1,

            name: ""

        };

    }




      $scope.range = function(value) {

        var step = 1;

        var input = [];

        for (var i = 1; i <= value; i += step) {

            input.push(i);

        }

        return input;

      };







    $scope.initPartenertypes();

    $scope.getPartener = function () {




            MyLoading.show($scope.translate('LOADING')+'...');

            var url = CUSTOM_SERVER_URL+"save_partener_types.php";

            var data = {

                function: 'fetchPartenerType',

                lang_id: localStorageApp.getItem(STORE.LANG_CODE)

            };

            var config = {

                headers: {

                'Accept': 'application/json',

                'Content-Type': 'application/x-www-form-urlencoded'

                }

            };




            $http.post(url, data, config).then(function (response) {                

                $scope.partenertypes = response.data.result;    

                $scope.newpagination.current = 1;

                $scope.newpagination.pages = Math.ceil($scope.partenertypes.length/$scope.newpagination.items); 

                MyLoading.hide();  

				setTimeout(function () {

                  initDragDropPartenerTypesImage(function (err, ptypes, image) {

                    if (err) utilities.MyAlert.show(err.message);

                    else {




                        MyLoading.show(); 

                          var url = CUSTOM_SERVER_URL+"CloudinaryUpload/upload_ptypes_img.php";

                          var data = {

                          image: image,

                          frndsId: ptypes

                          };

                          var config = {

                          headers: {

                          'Accept': 'application/json',

                          'Content-Type': 'application/x-www-form-urlencoded'

                          }

                          };




                          $http.post(url, data, config).then(function (response) {

                              MyLoading.hide();

                              for (var i = 0; i < $scope.partenertypes.length; i++) {

                                    if ($scope.partenertypes[i].id == ptypes) {                                     

                                       $scope.partenertypes[i].image_link = image;

                                    }

                              }




                          })




                    }

                  });

                  }, 800); 

    // image upload

            })




    }

    $scope.getPartener();




    $scope.checkPartenerTypes = function (parttypes) {

        if (parttypes.name.trim() == '') return new Error($rootScope.translate('PLEASE_ENTER_NAME'));

        else return null;

    }




    $scope.savePartenerTypes = function (curpartenertypes) {




      for (let i = 0; i < $scope.partenertypes.length; i++) {

        if($scope.partenertypes[i].name == curpartenertypes.name){

          MyAlert.show($scope.translate('SAME_NAME_ERROR'));

          return;

        }


      }




        var error = $scope.checkPartenerTypes(curpartenertypes);

        if (error) MyAlert.show(error.message);

        else {




            MyLoading.show($scope.translate('LOADING')+'...');

            var url = CUSTOM_SERVER_URL+"save_partener_types.php";

            var data = {

                function: 'savePartenerTypes',

                name        : $scope.curpartenertypes.name,

                lang_id: localStorageApp.getItem(STORE.LANG_CODE)

            };

            var config = {

                headers: {

                'Accept': 'application/json',

                'Content-Type': 'application/x-www-form-urlencoded'

                }

            };

            $http.post(url, data, config).then(function (response) {

                $scope.getPartener();

                $scope.curpartenertypes = {

                    id: -1,

                    name: ""

                };

                MyLoading.success($rootScope.translate('UPDATE_SUCCESSFUL'), 1500);

                MyLoading.hide();  
            })

        }




    }

    $scope.updatePartenerTypes = function (parttypes) {

        console.log(parttypes);

        var error = $scope.checkPartenerTypes(parttypes);

        if (error){ 
		MyAlert.show(error.message);
		
		}

        else {




            MyLoading.show($scope.translate('LOADING')+'...');

            var url = CUSTOM_SERVER_URL+"save_partener_types.php";

            var data = {

                function: 'updatePartenerTypes',

					name: parttypes.name,					
					id: parttypes.id,					
					lang_id: localStorageApp.getItem(STORE.LANG_CODE),					
					enabled: parttypes.enabled,
					delivery_fee: parttypes.delivery_fee,
					multi_cart: parttypes.multi_cart,
					image_link: parttypes.image_link

            };

            var config = {

                headers: {

                'Accept': 'application/json',

                'Content-Type': 'application/x-www-form-urlencoded'

                }

            };




            $http.post(url, data, config).then(function (response) {
                MyLoading.success($rootScope.translate('UPDATE_SUCCESSFUL'), 1500);

                MyLoading.hide();                       




            })          

        }

    }




    $scope.removePartenertypes = function (parttypes) {

        MyAlert.confirm($rootScope.translate('REMOVE_BUSINESS_TYPE_CATEGORY')).then(function (res) {




            MyLoading.toast($rootScope.translate('LOADING'));

            var url = CUSTOM_SERVER_URL+"save_partener_types.php";

            var data = {

                function: 'deletePartenerTypes',

                id        : parttypes.id




            };

            var config = {

                headers: {

                'Accept': 'application/json',

                'Content-Type': 'application/x-www-form-urlencoded'

                }

            };




            $http.post(url, data, config).then(function (response) {

                $scope.getPartener();

                MyLoading.success($rootScope.translate('DELETED_SUCCESSFULLY'), 1500);

                MyLoading.hide();                       




            })




        });

    }





    /*************************** */

    /*************************** */
    let n = 0;
    $scope.upload = function(partner){
      
      n += 1;
      let id = partner.id;
      setTimeout(function () {
        initDragDrop(id, function (err, image) {
          if (err) MyAlert.show(err.message);
          else partner.image_link = image;$scope.uploadImg(partner);
        });
      }, 200);
      console.log(n)
    }
    $scope.uploadImg = function(partner){
      console.log(partner)
      $scope.updatePartenerTypes(partner);
    }


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
							//if($rootScope.numCart==0)
							$rootScope.multi_buttn = false
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
						console.log(data_search)
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
									
									$rootScope.cartval = false;
									//console.log('aa ='+$rootScope.cartval)
									//**************Multi business****************//
									if(gmultiBusiness.getData().length>0){
									$scope.allbusinesses = gmultiBusiness.getData();
									var cc = 0;
									for (var i = 0; i < $scope.allbusinesses.length; i++) {									
									if($scope.business.id == $scope.allbusinesses[i].id){
									cc = 1;
									break;										
									}									
									}
									if(cc == 0){
									$scope.allbusinesses.push($scope.business);
									gmultiBusiness.setData($scope.allbusinesses);
									}
									
									}else{
									var busdata = [];
									busdata.push($scope.business);
									gmultiBusiness.setData(busdata);
									}

									
									//console.log(gmultiBusiness.getData().length)
									let blank = []
									let allMlt = gmultiBusiness.getData();
									for (let i = 0; i < allMlt.length; i++) {
										if(allMlt[i].id==gBusiness.getData().id){
											blank.push(allMlt[i])
										}else{
											if(allMlt[i].cartdata){
												if(allMlt[i].cartdata.length >0 ){
													blank.push(allMlt[i])
												}
											}
										}
									}
									gmultiBusiness.setData(blank)
									//*****************Multi business**************//
									
									
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
										console.log('lllllll')
										console.log(params)
										/******************* */
										var paramsA ={
											limit :50,
											params :'name,slug,logo,metadata',
											type :params.type,
											location : params.location,
										}
										console.log(paramsA)
										Ordering.business.all(paramsA, function (res) {
											if(!res.error){
												$scope.businesses = res.result;
												console.log($scope.businesses);
												var multi_business = localStorage.getItem('multi_business');
												multi_business = JSON.parse(multi_business);
												for (let b = 0; b < $scope.businesses.length; b++) {
													for (let m = 0; m < multi_business.length; m++) {
														multi_business[m].match = 0;
														if(multi_business[m].id ==$scope.businesses[b].id){
															multi_business[m].match = 1;
															console.log(multi_business[m]);
														}
													}           
												}
												for (let i = 0; i < multi_business.length; i++) {
													if (multi_business[i].match && multi_business[i].match ==1) {
														
													}else{
														delete multi_business[i];
													}            
												}									
												var filtered = multi_business.filter(function (el) {
												return el != null;
												});
												console.log(filtered)
												localStorage.setItem('multi_business', JSON.stringify(filtered));

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
											}
										})
							
										/* $scope.businesses = JSON.parse(localStorage.getItem('all_business'));
										console.log($scope.businesses)
											 */
										/******************* */
										setTimeout(() => {
											
										}, 2000);
										
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
		$scope.onProductOption = function (product, edit, noNavigation, callback,mbid) { 
		
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
				
				
				$scope.mbuss_cart = gmultiBusiness.getData()
			
			for (var m = 0; m < $scope.mbuss_cart.length; m++) {
				if(mbid == $scope.mbuss_cart[m].id){
					for (var j = 0; j < $scope.mbuss_cart[m].cartdata.length; j++) {
						if ($scope.mbuss_cart[m].cartdata[j].id == product.id) {
							console.log(JSON.stringify($scope.mbuss_cart[m].cartdata[j]))
							order_product = $scope.mbuss_cart[m].cartdata[j];
							
							product = $scope.mbuss_cart[m].cartdata[j];
							gmultiBusiness.setData($scope.mbuss_cart);
							break;
						}
					}
				break;
				}
			}
			
				
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
					
					//*******Edit Multi business product*******//
					
					$scope.business_custom = gmultiBusiness.getData()
					console.log(res)
					for (var m = 0; m < $scope.business_custom.length; m++) {
						if(mbid == $scope.business_custom[m].id){
							for (var j = 0; j < $scope.business_custom[m].cartdata.length; j++) {
								if ($scope.business_custom[m].cartdata[j].code == res.code) {
									$scope.business_custom[m].cartdata[j] = res;
									sw = true;
									break;
								}
							}
							break;
						}
					}
					
					gmultiBusiness.setData($scope.business_custom);
					//***********End of Edit Multi business product************//
					
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
		$scope.goCheckout = function () {
			console.log(gCart.getData())
			if(gCart.getData().length ==0){
				let mlt = JSON.parse( localStorage.getItem('multi_business'))
				console.log()
				gCart.setData(mlt[0].cartdata);
				
			}			
			console.log(gOrder.getData().length)
			function getUpselling(cb) {
				console.log('call upselling')
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
											console.log('lllllll')
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

								console.log('lllllll')
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
					
					//***********Add Cartdata************//
						$scope.mbusdata = gmultiBusiness.getData();

						for (var i = 0; i < $scope.mbusdata.length; i++) {								
						
						if($scope.business.id == $scope.mbusdata[i].id){
							console.log(3248)
							if(!$scope.mbusdata[i].cartdata){
								$scope.mbusdata[i].cartdata = [];
							}
							$scope.mbusdata[i].cartdata.push(product_to_cart);
							$rootScope.cartval = true;
							break;								
							}								
						}
						gmultiBusiness.setData($scope.mbusdata);
						
						console.log($scope.mbusdata)
						
						//****************Cartdata*************//
					
					
					$scope.refreshCartData();
					if (callback) callback(true);
				}
			} else {
				gCart.setData($scope.cart);
				$scope.refreshCartData();
			}
		}

		$scope.removeProduct = function (product,mbid) {
			var products = [];
			for (var i = 0; i < $scope.cart.length; i++) {
				if ($scope.cart[i].code != product.code) {
					products.push($scope.cart[i]);
				}
			}
			$scope.cart = products;
			gCart.setData($scope.cart);
			$scope.refreshCartData();
			$scope.emptyCart = 0;
			$scope.mcart_remove = gmultiBusiness.getData();
				console.log(JSON.stringify($scope.mcart_remove))
				if($scope.mcart_remove){
					console.log('2681 = '+ $scope.mcart_remove.length)
					for (var m = 0; m < $scope.mcart_remove.length; m++) {
						if(mbid == $scope.mcart_remove[m].id){
							console.log('2684 = '+ $scope.mcart_remove.length)
						for (var j = 0; j < $scope.mcart_remove[m].cartdata.length; j++) {
							
							if($scope.mcart_remove[m].cartdata.length == 1){
										if ($scope.mcart_remove[m].cartdata[j].code == product.code) {
										console.log('go to 2688 ')
										$scope.mcart_remove[m].cartdata.splice(j, 1);
										/* if($scope.mcart_remove[m].cartdata.length == 0){
											$scope.mcart_remove.splice(m, 1);
										} */
									}
									break;
								}
							else{
								if ($scope.mcart_remove[m].cartdata[j].code == product.code) {
								console.log('go to 2698 ')
								$scope.mcart_remove[m].cartdata.splice(j, 1);
								if($scope.mcart_remove[m].cartdata.length == 0){
									$scope.mcart_remove.splice(m, 1);
								}
							}
							}
							$scope.emptyCart += $scope.mcart_remove[m].cartdata.length;
						}
						break;
						}
				}
				}
				console.log('2697 = '+$scope.mcart_remove.length)
				gmultiBusiness.setData($scope.mcart_remove);
				$scope.refreshCartData();
			
		}

		$scope.refreshCartData2 = function () {
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
		$scope.emptyCart = 0;
		
		$scope.refreshCartData = function () {

			//setTimeout(() => {
				
	  
			  //}, 1000);

			let blank = []
			let allMlt = gmultiBusiness.getData();
			for (let i = 0; i < allMlt.length; i++) {
				if(allMlt[i].id==gBusiness.getData().id){
					blank.push(allMlt[i])
				}else{
					if(allMlt[i].cartdata){
						if(allMlt[i].cartdata.length>0){
							blank.push(allMlt[i])
						}
					}
				}
			}
			gmultiBusiness.setData(blank)
		
			var customsubtotal = 0
            //var quantity = 0;
            $scope.allTotal = 0;
            $scope.mcartdata = gmultiBusiness.getData();
			/*console.log('cc = '+$rootScope.cartval)
			console.log(JSON.stringify($scope.mcartdata))*/
console.log($scope.emptyCart)


			$scope.checkPartner = [];
			$scope.sumdelvPartner =[];
			
			for (var j = 0; j < $scope.mcartdata.length; j++){
				if($scope.mcartdata[j].cartdata){
					$scope.emptyCart += $scope.mcartdata[j].cartdata.length; 
				}
				
			let delv = -1;
			if($scope.mcartdata[j].partner_id){
				let partner_id = $scope.mcartdata[j].partner_id;
				if($scope.mcartdata[j].partners){
					for (let p = 0; p < $scope.mcartdata[j].partners.length; p++) {
						if($scope.mcartdata[j].partners[p].id == partner_id){
							if($scope.mcartdata[j].partners[p].enabled){
								if($scope.checkPartner.indexOf($scope.mcartdata[j].partner_id) ==-1){
									delv = Number($scope.mcartdata[j].partners[p].delivery_fee);
									$scope.checkPartner.push($scope.mcartdata[j].partner_id);
									$scope.sumdelvPartner.push(delv);
								}else{
									delv = 0;
								}
							}
						}
						
					}
				}
			}
			 
			  if(delv != -1){
				$scope.mcartdata[j].delivery_price = delv;
			  }

				$scope.cart_data = {};
				var subtotal = 0;
				var tax_new = 0
				var service_feenew = 0
				//var subtotal = 0;
				var quantity = 0;
				if($scope.mcartdata[j].cartdata){
					for (var i = 0; i < $scope.mcartdata[j].cartdata.length; i++) {
						subtotal += $scope.mcartdata[j].cartdata[i].total;
						customsubtotal += $scope.mcartdata[j].cartdata[i].total;
						quantity += $scope.mcartdata[j].cartdata[i].quantity;
					}
				}
				$scope.cart_data.total = 0;
				$scope.cart_data.subtotal = subtotal;
				//$scope.cart_data.quantity = quantity;
				//console.log($scope.cart_data.quantity)
				//$rootScope.numCart = $scope.cart_data.quantity;
				
				
				if ($scope.mcartdata[j].tax_type == 2)
                tax_new += subtotal * $scope.mcartdata[j].tax / 100;
            else
                tax_new = 0
				
				service_feenew += subtotal * $scope.mcartdata[j].service_fee / 100;
				$scope.mcartdata[j].service_fee_price = service_feenew
				$scope.mcartdata[j].tax_price = tax_new
				$scope.mcartdata[j].service_fee_price = service_feenew
				$scope.mcartdata[j].subtotal = subtotal
				$scope.mcartdata[j].quantity = quantity;
				console.log($scope.mcartdata[j].quantity)
				
				
				//$scope.mcartdata[j].delivery_price1 =  $scope.mcartdata[j].delivery_price;
				if ($scope.order.type == 1) $scope.cart_data.total += $scope.mcartdata[j].delivery_price;
				//if ($scope.order.type == 1) $scope.cart_data.total += $scope.mcartdata[j].deliveryfee
				
				if (ADDONS.discount_offer) {
                var offer = null;
                for (var i = 0; i < $scope.mcartdata[j].offers.length; i++) {
                    if ($scope.mcartdata[j].offers[i].type == 1 && $scope.mcartdata[j].offers[i].minimum <= $scope.cart_data.subtotal) {
                        var aux = $scope.mcartdata[j].offers[i].rate_type == 1 ? $scope.cart_data.subtotal * $scope.mcartdata[j].offers[i].rate / 100 : $scope.mcartdata[j].offers[i].rate;
                        var last = 0;
                        if (offer != null) last = offer.rate_type == 1 ? $scope.cart_data.subtotal * offer.rate / 100 : offer.rate;
                        if (aux < $scope.cart_data.subtotal && last < aux) {
                            offer = $scope.mcartdata[j].offers[i];
                        }
                    }
                }

                if (offer) {
                    $scope.cart_data.discount = offer.rate_type == 1 ? $scope.cart_data.subtotal * offer.rate / 100 : offer.rate;
                    $scope.cart_data.offer = offer;
                    $scope.mcartdata[j].offer = offer;
                    $scope.mcartdata[j].discount = offer.rate_type == 1 ? $scope.mcartdata[j].subtotal * offer.rate / 100 : offer.rate;
                } else $scope.mcartdata[j].discount = 0;
                $scope.order.offer = offer;
            } else $scope.cart_data.discount = 0;
					$scope.mcartdata[j].offer = offer;
					$scope.cart_data.total = $scope.cart_data.total + subtotal + tax_new + service_feenew
					$scope.mcartdata[j].totalPrice = $scope.cart_data.total
					$scope.allTotal = $scope.allTotal + $scope.cart_data.total		
					}
					$rootScope.numCart = $scope.emptyCart;
					
					gmultiBusiness.setData($scope.mcartdata);
					$scope.minimumflag = 0;
		if($scope.mcartdata.length>1){
			$scope.businessminimumord = 0;
		
			for (var y = 0; y < $scope.mcartdata.length; y++) {
				$scope.businessminimumord += $scope.mcartdata[y].minimum;
				var subtotal =0;
				if($scope.mcartdata[y].cartdata){
					for (var i = 0; i < $scope.mcartdata[y].cartdata.length; i++) {
						subtotal += $scope.mcartdata[y].cartdata[i].total;
												
					}
				}
				
				console.log(subtotal+' >= '+$scope.mcartdata[y].minimum)
				if(subtotal >= $scope.mcartdata[y].minimum){
						$scope.minimumflag = $scope.minimumflag+1;
						
					}
			}
		}else{
				$scope.businessminimumord = $scope.business.minimum;
				$scope.multibussubtotalordt = $scope.cart_data.subtotal;
				if($scope.multibussubtotalordt >= $scope.businessminimumord )
				$scope.minimumflag = 1
		}
			//console.log($scope.mcartdata.length+' , '+$scope.minimumflag)
			if($scope.mcartdata.length == $scope.minimumflag)
				$scope.minimumflag_status = true
			else
				$scope.minimumflag_status = false
		gmultiBusiness.setData($scope.mcartdata);

		$scope.sumDelv =  $scope.sumdelvPartner.reduce(function(a, b) {
			//console.log(a+', '+ b)
			 return a + b; }, 0);
		//}, 0);
		console.log($scope.sumDelv);

		$scope.sumDelv2 =  $scope.checkPartner.reduce(function(a, b) {
			//console.log(a+', '+ b)
			 return a + b; }, 0);
		//}, 0);
		console.log($scope.sumcheckDelv2);

		$scope.refreshNumCart();
		
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

		$scope.onChangeQuantity = function (product,mbid) {
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
				$scope.removeProduct(product, mbid);
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
		
		$scope.goToMultiStore = function(){
	console.log(gBusiness.getData())
		var type = gOrder.getData().type
		$state.go('main.search', { 'order_type': (type==1)?'delivery':'pickup', 'address': gOrder.getData().position.lat+','+gOrder.getData().position.lng });
	}
	});