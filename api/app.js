const http = require('http');
const https = require('https');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const fs = require('fs');

const hostname = '127.0.0.1';
const port = 3000;
const SQUARE_ACCESS_TOKEN = 'EAAAEN1W2q5HExF7P1fC-Fh7xxZWvAWspnwM7S1TKhJMf-gRRmW4FWBniRglITVC';
const SQUARE_DEFAULT_LOCATION = 'L2BPCKKX63ZMR';
const SQUARE_IS_PRODUCTION = false;
const ORDERING_API = {
  version: 'v400',
  language: 'en',
  host_name: 'apiv4.ordering.co',
  project_name: 'boxetekitchen',
  api_key: 'jc3sWGO0jmVCbV_eyABYGIvgL8aweahbQ63WS14YTnMsjJIFDl7JhXsXEWSjvIKas',
  port: null,
}

const API_ENDPOINTS = {
  square_port: 443,
  square_sandbox_url: 'connect.squareupsandbox.com',
  square_production_url: 'connect.squareup.com',
  square_online_get_catalog_list: '/v2/catalog/list?types=ITEM',
  square_online_get_catalog_modifiers_list: '/v2/catalog/list?types=MODIFIER_LIST',
  square_online_add_order: '/v2/orders',
  square_online_add_payment: '/v2/payments',
  square_online_refund_payment: '/v2/refunds',
  square_online_customers: '/v2/customers',
  square_online_customers_search: '/v2/customers/search',
  doordash_url: 'openapi.doordash.com',
  doordash_create_delivery: '/drive/v2/deliveries',
  doordash_port: 443,
};
const DOORDASH_ACCESS_KEY = {
  developer_id: "22c97248-8730-4146-a783-5899bc5981af",
  key_id: "f1420bc9-bae3-410c-9b31-0e18827657ff",
  signing_secret: "ivb_dkmvB67XqoSYevJR6QXALRpGgRy_txuoD7BMZwQ"
}
DOORDASH_TOKEN = '';
const STORE_INFO = {
  pick_up_address: '1300 Peachtree Industrial Blvd #2110, Suwanee, GA 30024, USA',
  pick_up_phone_number: '+16788355533',
  external_business_name: 'Boxete',
  external_store_id: 'Boxete-Store-Id',
}

const STATUS_CODE_NOTFOUND = 404;
const STATUS_CODE_INTERNAT_SERVER_ERROR = 500;
const STATUS_CODE_SUCCESS = 200;
const STATUS_CODE_INVALID_ORIGIN = 401;
SQUARE_CATALOG_ITEMS = [];
SQUARE_CATALOG_MODIFIERS = [];
statusMap = [
  {
    doordash_status: 'DASHER_DROPPED_OFF', //Delivered
    square_status: null,
    app_order_status: 11 // 'Delivery Completed by Driver'
  },
  {
    doordash_status: 'DASHER_CONFIRMED_DROPOFF_ARRIVAL', //Dasher Arrived at Dropoff
    square_status: null,//'Shipped',
    app_order_status: 19 //'Driver Almost arrived to customer'
  },
  {
    doordash_status: 'DASHER_PICKED_UP', //Delivery Picked Up
    square_status: 'COMPLETED',
    app_order_status: 9 //'Picked up Completed by Driver'
  },
  {
    doordash_status: 'DASHER_CONFIRMED_PICKUP_ARRIVAL', //Dasher Arrived at Pickup
    square_status: null,
    app_order_status: 18 //'Driver Almost arrived to Business'
  },
  {
    doordash_status: 'DASHER_CONFIRMED', //Delivery Confirmed
    square_status: null,
    app_order_status: 15 // 'Accepted by Customer' , // Pickup completed by the customer
  },
  {
    doordash_status: 'Delivery Created',
    square_status: null,//'PREPARED', //'In progress',
    app_order_status: 7 //'Accepted by Business'
  },
  {
    doordash_status: 'DELIVERY_CANCELLED',  //Cancelled
    square_status: 'Refund',
    app_order_status: 2 //'Canceled Order' // Rejected
  }
]

const server = http.createServer((request, response) => {

  const allowedOrigins = ['http://localhost', 'https://www.boxete.com', 'chrome-extension://fhbjgbiflinjbdggehcddcbncdddomop', 'https://boxetekitchen.tryordering.com'];
  const authorizations = ['Bearer 57a3b2e327a1776e94ad296a19573f4a']
  const origin = request.headers.origin;
  const authorization = request.headers.authorization;

  console.log('incoming origin: ' + origin);
  console.log('incoming authorization: ' + authorization)

  var log = 'incoming origin: ' + origin + '\n' +
    'incoming authorization: ' + authorization;

  writeLog(log, "appInit");

  if (allowedOrigins.includes(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Access-Control-Allow-Headers",
      "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With,x-front-version-x,x-app-x,authorization, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    console.log(`ORIGIN Included: ${origin}`);
    if (request.method === 'OPTIONS') {
      response.end();
      return;
    }
    else {
      console.log(`APP INIT:`);
      appInit(request, response);
    }
  }
  else if (authorizations.includes(authorization)) {
    console.log(`APP INIT:`);
    appInit(request, response);
  }
  else {
    writeResponse(response, responseObject(null, 'invalid origin'), STATUS_CODE_INVALID_ORIGIN);
  }

});

const appInit = function (request, response) {

  let data = [];
  request.on('error', (err) => {
    console.error(`Request Error : ${err}`);
    writeResponse(response, responseObject(err, 'Unknown error'), STATUS_CODE_INTERNAT_SERVER_ERROR);
  }).on('data', (chunk) => {
    data.push(chunk);
  }).on('end', () => {
    data = Buffer.concat(data).toString();
    const url = request.url;
    data = ValidateRequest(request, response, data);

    var log = `Method: ${getJSONString(request.method)}` + '\n' +
      `Headers: ${getJSONString(request.headers)}` + '\n' +
      `URL: ${getJSONString(request.url)}` + '\n' +
      `Data: ${getJSONString(data)}`;

    writeLog(log, "appInit");

    if (data) {

      if (url == "/public_html?action=doordash-webhook") {
        console.log("IN WEBHOOK");
        updateStatus(response, data);
      }
      else if (url.indexOf("/public_html?action=doordash") >= 0) {
        console.log("IN doordash");
        doorDashOperation(response, data);
      }
      else if (url.indexOf("/public_html?action=square") >= 0) {
        console.log("IN square");
        squareOnlineOperation(response, data);
      }
      else {
        writeResponse(response, responseObject(null, 'Method not found'), STATUS_CODE_NOTFOUND);
      }
    }
  });
}


const doorDashOperation = async function (response, data) {

  try {
    let delivery_info = await createDoordashDelivery(data);
    if (delivery_info && delivery_info.data.code == 'authentication_error' && delivery_info.data.message.indexOf('JWT is expired') >= 0) {
      // get new token and call again.
      getDoordashToken();
      delivery_info = await createDoordashDelivery(data);
    }

    if (delivery_info.data)
      writeResponse(response, responseObject(true, 'Success'), STATUS_CODE_SUCCESS);
    else
      writeResponse(response, responseObject(null, delivery_info.message), STATUS_CODE_SUCCESS);

  } catch (error) {
    writeLog(error.message, "doorDashOperation", true);
    writeResponse(response, responseObject(null, error.message), STATUS_CODE_INTERNAT_SERVER_ERROR);
  }
}

const createDoordashDelivery = function (data) {

  return new Promise((resolve, reject) => {
    try {

      data = validateValues(data);
      var postData = JSON.stringify({
        external_delivery_id: data.delivery_id,
        dropoff_address: data.buyer.address,
        dropoff_phone_number: data.buyer.cellphone,
        order_value: data.order_value,
        pickup_address: STORE_INFO.pick_up_address,
        pickup_phone_number: STORE_INFO.pick_up_phone_number,
        external_business_name: STORE_INFO.external_business_name,
        external_store_id: STORE_INFO.external_store_id,
        customer: {
          phone_number: data.buyer.cellphone,
          first_name: data.buyer.name,
          last_name: data.buyer.lastname,
          email: data.buyer.email,
          should_send_notifications: true,
        }
        // pickup_business_name: 'Wells Fargo SF Downtown',
        // pickup_instructions: 'Enter gate code 1234 on the callbox.',
        // dropoff_business_name: 'Wells Fargo SF Downtown',
        // dropoff_instructions: 'Enter gate code 1234 on the callbox.',
      });

      var options = {
        method: "POST",
        host: API_ENDPOINTS.doordash_url,
        port: API_ENDPOINTS.doordash_port,
        path: API_ENDPOINTS.doordash_create_delivery,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': postData.length,
          "Authorization": 'Bearer ' + DOORDASH_TOKEN,
        },
      };

      var body = '';
      writeLog('Doordash Delivery Request Options : ' + JSON.stringify(options), "createDoordashDelivery");
      const req = https.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          console.log(`BODY: ${chunk}`);
          body += chunk;
        });
        res.on('end', () => {
          console.log('No more data in response in order.');
          resolve(responseObject(JSON.parse(body), 'Success delivery'));
        });
      });

      req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
        writeLog(e.message, "createDoordashDelivery", true);
        resolve(responseObject(null, e.message));
      });

      req.write(postData);
      req.end();

    } catch (error) {
      writeLog(error.message, "createDoordashDelivery", true);
      resolve(responseObject(null, error.message));
    }

  });

}

const updateStatus = async function (response, data) {

  try {

    writeLog("Doordash Update Status Request : " + JSON.stringify(data), "updateStatus");
    let squareInfo = await updateSquareOrderStatus(data);
    let orderingInfo = await updateStatusOnOrderingAPI(data);
    writeResponse(response, { square: squareInfo, ordering: orderingInfo }, STATUS_CODE_SUCCESS);

  } catch (error) {
    writeLog(error.message, "updateStatus", true);
    writeResponse(response, responseObject(null, error.message), STATUS_CODE_INTERNAT_SERVER_ERROR);
  }
}

const updateSquareOrderStatus = async function (data) {



  return new Promise((resolve, reject) => {

    try {

      var status = statusMap.filter(p => p.doordash_status == data.event_name && p.square_status != null);
      if (status && status.length > 0) {
        status = status[0];
        //Update Square Order Status
        var ids = data.external_delivery_id.split('-box-');
        var square_order_id = ids.length > 0 ? ids[0] : data.external_delivery_id;
        var square_order_payment_id = ids.length >= 1 ? ids[1] : 0;
        var square_order_amount = ids.length >= 2 ? ids[2] : 0;

        writeLog('Square Status: ' + status.square_status + ' External Delivery Id: ' + data.external_delivery_id, "updateSquareOrderStatus");

        if (square_order_id) {

          if (status.square_status == 'Refund') {

            if (square_order_payment_id && square_order_amount) {
              refundPayment(resolve, square_order_id, square_order_payment_id, square_order_amount);
            }
            else {
              resolve(responseObject(null, 'Square Payment not found.'));
            }

          }
          else if (status.square_status == 'COMPLETED') {

            var postData = {
              "order_id": square_order_id,
              "order": {
                "location_id": SQUARE_DEFAULT_LOCATION,
              }
            };

            //set fulfilment state.
            postData.order['fulfillments'] = [{
              state: status.square_status
            }];


            postData = JSON.stringify({ postData });
            var options = {
              method: "POST",
              host: getBaseUrl(),
              port: API_ENDPOINTS.square_port,
              path: API_ENDPOINTS.square_online_add_order,
              headers: {
                'Content-Type': 'application/json',
                'Content-Length': postData.length,
                "Authorization": 'Bearer ' + SQUARE_ACCESS_TOKEN,
              },
            };

            var body = '';
            const req = https.request(options, (res) => {
              res.setEncoding('utf8');
              res.on('data', (chunk) => {
                body += chunk;
              });
              res.on('end', () => {
                console.log('No more data in response in Square Update order. ' + body);
                writeLog('successfully order updated : ' + body, "updateSquareOrderStatus");
                resolve(responseObject(JSON.parse(body), 'successfully order updated'));
              });
            });

            req.on('error', (e) => {
              console.error(`problem with request: ${e.message}`);
              writeLog(e.message, "updateSquareOrderStatus", true);
              resolve(responseObject(null, e.message));
            });

            req.write(postData);
            req.end();
          }
          else {
            writeLog('Matching Status not found', "updateSquareOrderStatus");
            resolve(responseObject(null, 'Matching Status not found'));
          }

        }
        else {
          //Square Id not found in Doordash external Id
          resolve(responseObject(null, 'Square Id not found in Doordash external Id'));
          writeLog('Square Id not found in Doordash external Id', "updateSquareOrderStatus");
        }
      }
      else {
        writeLog('Matching Status not found', "updateSquareOrderStatus");
        resolve(responseObject(null, 'Matching Status not found'));
      }

    } catch (error) {
      console.log(error);
      writeLog(error.message, "updateSquareOrderStatus", true);
      resolve(responseObject(null, error.message));
    }
  });

}

const updateStatusOnOrderingAPI = async function (data) {

  return new Promise((resolve, reject) => {

    try {

      var status = statusMap.filter(p => p.doordash_status == data.event_name && p.app_order_status != null);
      if (status && status.length > 0) {
        status = status[0];
        //Update Square Order Status
        var ids = data.external_delivery_id.split('-box-');
        var order_id = ids.length >= 3 ? ids[3] : null;

        writeLog('Ordering Status: ' + status.app_order_status + ' External Delivery Id: ' + data.external_delivery_id, "updateSquareOrderStatus");

        if (order_id && status.app_order_status) {
          updateOrderStatus(resolve, order_id, status.app_order_status);
        }
        else {
          //Square Id not found in Doordash external Id
          resolve(responseObject(null, 'Order Id or matching status not found in Doordash external Id'));
          writeLog('Order Id not found in Doordash external Id', "updateStatusOnOrderingAPI");
        }
      }
      else {
        writeLog('Matching Status not found', "updateStatusOnOrderingAPI");
        resolve(responseObject(null, 'Matching Status not found'));
      }

    } catch (error) {
      console.log(error);
      writeLog(error.message, "updateStatusOnOrderingAPI", true);
      resolve(responseObject(null, error.message));
    }
  });

}

updateOrderStatus = function (resolve, order_id, status_id) {

  try {

    var postData = {
      status: status_id
    }
    var postData = JSON.stringify(postData);

    var options = {
      method: "PUT",
      hostname: ORDERING_API.host_name,
      port: ORDERING_API.port,
      path: '/' + ORDERING_API.version + '/' + ORDERING_API.language + '/' + ORDERING_API.project_name + '/orders/' + order_id,
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
        "x-api-key": ORDERING_API.api_key,
      },
    };

    var body = '';
    writeLog("Order status Options :" + JSON.stringify(options), "updateOrderStatus");
    const req = https.request(options, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
        body += chunk;
      });
      res.on('end', () => {
        console.log('No more data in response in order status.');
        writeLog("Order status updated successfully :" + JSON.stringify(body), "updateOrderStatus");
        resolve(responseObject(JSON.parse(body), `Success.`));
      });
    });

    req.on('error', (e) => {
      console.error(`problem with request: ${e.message}`);
      writeLog(e.message, "updateOrderStatus", true);
      resolve(responseObject(null, e.message));
    });

    req.write(postData);
    req.end();

  } catch (error) {
    console.log(error);
    writeLog(error.message, "updateOrderStatus", true);
    resolve(responseObject(null, error.message));
  }
}

updateOrderStatusWarper = async function (order_id, status_id) {
  return new Promise((resolve, reject) => {
    updateOrderStatus(resolve, order_id, status_id);
  });
}

validateValues = function (data) {
  if (data.buyer.cellphone) {
    data.buyer.cellphone = data.buyer.cellphone && data.buyer.cellphone.indexOf('1') == 0 ? '+' + data.buyer.cellphone : '+1' + data.buyer.cellphone;
  }
  return data;
}

const squareOnlineOperation = async function (response, data) {

  try {

    let customerInfo = await searchCustomerOnSquareOnline(data.name, data.email, data.buyer);
    if (customerInfo && customerInfo.data) {

      let uuid = data.uuid;
      var orderInfo = await saveOrder(data, customerInfo.data);
      // Update order status as accepted.
      var statusInfo = await updateOrderStatusWarper(data.order.id, 7);
      console.log("statusInfo ::" + JSON.stringify(statusInfo));
      writeLog("Square order Info : " + JSON.stringify(orderInfo), "squareOnlineOperation");
      if (orderInfo && orderInfo.data && orderInfo.data.order) {
        var order = orderInfo.data.order;
        console.log("order created for id: " + order.id);
        let summary = data.order.summary ? data.order.summary : null;
        order['tip_money'] = summary ? summary.driver_tip : 0;
        var paymentInfo = await savePayment(uuid, order);
        writeLog("Square payment Info : " + JSON.stringify(paymentInfo), "squareOnlineOperation");
        if (paymentInfo && paymentInfo.data && paymentInfo.data.payment) {
          var payment = paymentInfo.data.payment;
          console.log("order payment saved for id: " + payment.id);
          console.log("order payment: " + payment);
          writeResponse(response, responseObject({
            order: orderInfo.data.order,
            payment: paymentInfo.data.payment,
          }, 'Success'), STATUS_CODE_SUCCESS);
        }
        else {
          writeResponse(response, responseObject(null, paymentInfo ? paymentInfo.message : 'Error while making order payment.'), STATUS_CODE_INTERNAT_SERVER_ERROR);
        }
      }
      else {
        writeResponse(response, responseObject(null, orderInfo ? orderInfo.message : 'Error while creating Order.'), STATUS_CODE_INTERNAT_SERVER_ERROR);
      }
    }
    else {
      writeResponse(response, responseObject(null, customerInfo ? customerInfo.message : 'Error while finding or saving customer information.'), STATUS_CODE_INTERNAT_SERVER_ERROR);
    }

  } catch (error) {
    writeLog(error.message, "squareOnlineOperation", true);
    writeResponse(response, responseObject(null, error.message), STATUS_CODE_INTERNAT_SERVER_ERROR);
  }


}

const getCatalogList = function (isModifiers = false) {

  try {
    var options = {
      method: "GET",
      host: getBaseUrl(),
      port: API_ENDPOINTS.square_port,
      path: isModifiers ? API_ENDPOINTS.square_online_get_catalog_modifiers_list : API_ENDPOINTS.square_online_get_catalog_list,
      headers: {
        'Content-Type': 'application/json',
        "Authorization": 'Bearer ' + SQUARE_ACCESS_TOKEN,
      },
    };

    var body = '';
    const req = https.request(options, (res) => {
      console.log(`STATUS: ${res.statusCode}`);
      console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        // console.log(`BODY: ${chunk}`);
        body += chunk;
      });
      res.on('end', () => {
        console.log('No more data in response for category listing.');
        var result = JSON.parse(body);
        writeLog("Catalog Items " + (isModifiers ? "Modifiers" : "Items") + " : " + body, "getCatalogList");
        if (isModifiers)
          SQUARE_CATALOG_MODIFIERS = result && result.objects ? result.objects : [];
        else
          SQUARE_CATALOG_ITEMS = result && result.objects ? result.objects : [];
      });
    });

    req.on('error', (e) => {
      writeLog(e.message, "getCatalogList", true);
      console.error(`problem with request: ${e.message}`);
    });

    req.end();

  } catch (error) {
    writeLog(error.message, "getCatalogList", true);
    console.error(`Error: ${error.message}`);
  }

}


const saveOrder = async function (data, customer_id) {

  return new Promise((resolve, reject) => {

    try {

      writeLog("Initiate Order : " + JSON.stringify(data), "saveOrder");
      let order = data.order;
      let products = order.products ? order.products : [];
      let summary = order.summary ? order.summary : null;
      let buyer = data.buyer;
      let uuid = data.uuid;
      let discounts = [];
      let taxes = [];
      var lintItems = [];
      let service_charges = [];
      products.forEach(product => {

        //prepare line item
        var sq_item = getItem(product.name);
        if (sq_item && sq_item.item_data && sq_item.item_data.variations && sq_item.item_data.variations.length > 0) {
          var modifier_list_id = sq_item.item_data.modifier_list_info && sq_item.item_data.modifier_list_info.length > 0 ? sq_item.item_data.modifier_list_info[0].modifier_list_id : null;

          var item = {
            "quantity": product.quantity.toString(),
            "catalog_object_id": sq_item.item_data.variations[0].id,
            "item_type": "ITEM",
            "base_price_money": {
              "amount": parseInt(product.price * 100),
              "currency": "USD"
            },
            "modifiers": [],
          };

          if (product.modifiers && product.modifiers.length > 0 && modifier_list_id) {
            product.modifiers.forEach((modi, indx) => {
              var modf = getModifier(modifier_list_id, modi.name);

              writeLog("modf  : " + modf ? JSON.stringify(modf) : 'null', "saveOrder");

              if (modf) {
                var modifier = {
                  "uid": uuid + (indx),
                  "catalog_object_id": modf.id,
                  "catalog_version": modf.version,
                  // "name": modi.name,
                  "quantity": modi.quantity.toString(),
                };
                item["modifiers"].push(modifier);
              }
            });
          }

          lintItems.push(item);
        }
      });

      var current = new Date();
      current.setMinutes(current.getMinutes() + 30)
      var pick_up_time = current.toISOString()

      var fulfillment = order.type == "1" ? {
        "type": "SHIPMENT",
        "state": "PROPOSED",
        "shipment_details": {
          "recipient": {
            "address": {
              "address_line_1": buyer.address ? buyer.address : '',
              "country": "US",
              "postal_code": buyer.zipcode ? buyer.zipcode : '',
              // "locality": "Test"
            },
            "display_name": buyer.name + ' ' + buyer.lastname,
            "phone_number": buyer.phone ? buyer.phone : buyer.cellphone ? buyer.cellphone : '',
            "email_address": buyer.email ? buyer.email : ''
          }
        }
      } : {
        "type": "PICKUP",
        "state": "PROPOSED",
        "pickup_details": {
          "recipient": {
            "address": {
              "address_line_1": STORE_INFO.pick_up_address,
            },
            "display_name": STORE_INFO.external_business_name,
            "phone_number": STORE_INFO.pick_up_phone_number,
            // "email_address": 'test@gmail.com'
          },
          "pickup_at": pick_up_time
        }
      };

      if (summary) {
        if (summary.tax_rate && summary.tax_rate > 0) {
          var tax_uid = uuid;
          taxes.push({
            uid: tax_uid,
            name: 'tax',
            percentage: summary.tax_rate.toString().replace('.', ''),
            scope: 'ORDER',
          });
        }
        if (summary.discount && summary.discount > 0) {
          var discount_uid = uuid;
          discounts.push({
            uid: discount_uid,
            name: 'discount',
            scope: 'ORDER',
            amount_money: {
              amount: parseInt(summary.discount * 100),
              currency: "USD"
            },
          });
        }
        if (summary.delivery_price && summary.delivery_price > 0) {
          service_charges.push({
            name: 'Delivery fee',
            calculation_phase: "TOTAL_PHASE",
            amount_money: {
              amount: parseInt(summary.delivery_price * 100),
              currency: "USD"
            },
          });
        }

        if (summary.driver_tip && summary.driver_tip > 0) {
          service_charges.push({
            name: 'Driver Tip',
            calculation_phase: "TOTAL_PHASE",
            amount_money: {
              amount: parseInt(summary.driver_tip * 100),
              currency: "USD"
            },
          });
        }
      }

      if (lintItems.length > 0) {
        var postData = JSON.stringify({
          "idempotency_key": uuid,
          "order": {
            "location_id": SQUARE_DEFAULT_LOCATION,
            "customer_id": customer_id,
            "source": {},
            "state": "OPEN",
            "line_items": lintItems,
            "fulfillments": [fulfillment],
            "taxes": taxes,
            "discounts": discounts,
            "service_charges": service_charges
          }
        })

        var options = {
          method: "POST",
          host: getBaseUrl(),
          port: API_ENDPOINTS.square_port,
          path: API_ENDPOINTS.square_online_add_order,
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length,
            "Authorization": 'Bearer ' + SQUARE_ACCESS_TOKEN,
          },
        };

        var body = '';
        writeLog("Square Order data: " + JSON.stringify(options), "saveOrder");
        const req = https.request(options, (res) => {
          console.log(`STATUS: ${res.statusCode}`);
          console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
          res.setEncoding('utf8');
          res.on('data', (chunk) => {
            console.log(`SQUARE BODY: ${chunk}`);
            body += chunk;
          });
          res.on('end', () => {
            console.log('No more data in response in Square order. ' + body);
            var response = JSON.parse(body);
            writeLog("Square Order Response:" + JSON.stringify(response), "saveOrder");
            if (response.errors) {
              resolve(responseObject(response.errors, 'Unable to create order on square'));
            }
            else {
              resolve(responseObject(response, 'Success order'));
            }

          });
        });

        req.on('error', (e) => {
          console.error(`problem with request: ${e.message}`);
          resolve(responseObject(null, e.message));
        });

        req.write(postData);
        req.end();
      }
      else {
        resolve(responseObject(null, 'order items not found on Square Online'));
      }

    } catch (error) {
      writeLog(error.message, "saveOrder", true);
      resolve(responseObject(null, error.message));
    }

  });



}

const savePayment = async function (uuid, order) {

  return new Promise((resolve, reject) => {
    try {

      console.log('payment start');
      writeLog("Initiate Payment : " + JSON.stringify(order), "savePayment");
      var payment = {
        "idempotency_key": uuid,
        "source_id": "EXTERNAL",
        "order_id": order.id,
        "external_details": {
          "type": 'CARD',
          "source": 'Food Delivery Service'
        },
        // "cash_details": {
        //   "buyer_supplied_money": {
        //     "amount": parseInt(order.total_money.amount*100),
        //     "currency": "USD"
        //   }
        // },
        "amount_money": {
          "amount": parseInt(order.total_money.amount.toString().replace('.', '')),
          "currency": "USD"
        },
        // "autocomplete": false
      }

      // if (order.tip_money > 0) {
      //   payment.tip_money = {
      //     "amount": parseInt(order.tip_money*100),
      //     "currency": "USD"
      //   }
      // }

      var postData = JSON.stringify(payment);

      var options = {
        method: "POST",
        host: getBaseUrl(),
        port: API_ENDPOINTS.square_port,
        path: API_ENDPOINTS.square_online_add_payment,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': postData.length,
          "Authorization": 'Bearer ' + SQUARE_ACCESS_TOKEN,
        },
      };

      var body = '';
      const req = https.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          console.log(`BODY: ${chunk}`);
          body += chunk;
        });
        res.on('end', () => {
          console.log('No more data in response in payment.');
          writeLog("Payment made successfully :" + JSON.stringify(body), "savePayment");
          resolve(responseObject(JSON.parse(body), `Success.`));
        });
      });

      req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
        resolve(responseObject(null, e.message));
      });

      req.write(postData);
      req.end();

    } catch (error) {
      writeLog(error.message, "savePayment", true);
      resolve(responseObject(null, error.message));
    }
  });

}

const refundPayment = function (resolve, order_id, payment_id, order_amount) {


  try {

    var payment = {
      idempotency_key: order_id,
      amount_money: {
        amount: parseInt(order_amount),
        currency: 'USD'
      },
      payment_id: payment_id
    }
    var postData = JSON.stringify(payment);

    console.log('refund payment start');
    writeLog("Initiate Refund Payment : " + JSON.stringify(payment), "refundPayment");
    var options = {
      method: "POST",
      host: getBaseUrl(),
      port: API_ENDPOINTS.square_port,
      path: API_ENDPOINTS.square_online_refund_payment,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
        "Authorization": 'Bearer ' + SQUARE_ACCESS_TOKEN,
      },
    };

    var body = '';
    const req = https.request(options, (res) => {
      console.log(`STATUS: ${res.statusCode}`);
      console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
        body += chunk;
      });
      res.on('end', () => {
        console.log('No more data in response in payment.');
        writeLog("Payment refunded successfully :" + JSON.stringify(body), "refundPayment");
        resolve(responseObject(JSON.parse(body), `Success.`));
      });
    });

    req.on('error', (e) => {
      console.error(`problem with request: ${e.message}`);
      writeLog(e.message, "refundPayment", true);
      resolve(responseObject(null, e.message));
    });

    req.write(postData);
    req.end();

  } catch (error) {
    writeLog(error.message, "refundPayment", true);
    resolve(responseObject(null, error.message));
  }


}



const searchCustomer = async function (email) {

  return new Promise((resolve, reject) => {
    try {
      console.log('Customer Email:' + email);
      var postData = JSON.stringify({ query: { filter: { email_address: { exact: email } } } });

      var options = {
        method: "POST",
        host: getBaseUrl(),
        port: API_ENDPOINTS.square_port,
        path: API_ENDPOINTS.square_online_customers_search,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': postData.length,
          "Authorization": 'Bearer ' + SQUARE_ACCESS_TOKEN,
        },
      };

      var body = '';
      const req = https.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          console.log(`BODY: ${chunk}`);
          body += chunk;
        });
        res.on('end', () => {
          console.log('No more data in response.');
          var customer = JSON.parse(body);
          var customer_id = customer && customer.customers && customer.customers.length > 0 ? customer.customers[0].id : null;
          writeLog("Customer Found : " + customer_id, "searchCustomer");
          resolve(responseObject(customer_id, 'Success'));
        });
      });

      req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
        resolve(responseObject(null, e.message));
      });

      req.write(postData);
      req.end();

    } catch (error) {
      writeLog(error.message, "searchCustomer", true);
      resolve(responseObject(null, error.message));
    }
  });



}

const saveCustomer = async function (name, email, buyer) {

  return new Promise((resolve, reject) => {
    try {

      console.log('Customer Email:' + email);
      var postData = {
        given_name: name,
        email_address: email
      };
      if (buyer.cellphone) {
        postData['phone_number'] = buyer.cellphone && buyer.cellphone.indexOf('1') == 0 ? '+' + buyer.cellphone : '+1' + buyer.cellphone;
      }
      postData = JSON.stringify(postData);
      var options = {
        method: "POST",
        host: getBaseUrl(),
        port: API_ENDPOINTS.square_port,
        path: API_ENDPOINTS.square_online_customers,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': postData.length,
          "Authorization": 'Bearer ' + SQUARE_ACCESS_TOKEN,
        },
      };
      var body = '';
      const req = https.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          console.log(`BODY: ${chunk}`);
          body += chunk;
        });
        res.on('end', () => {
          console.log('No more data in response.');
          var result = JSON.parse(body);
          var customer_id = result && result.customer.id ? result.customer.id : null;
          writeLog("Customer Saved : " + customer_id, "saveCustomer");
          resolve(responseObject(customer_id, `Success.`));
        });
      });

      req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
        resolve(responseObject(null, e.message));
      });

      req.write(postData);
      req.end();

    } catch (error) {
      writeLog(error.message, "saveCustomer", true);
      resolve(responseObject(null, error.message));
    }
  });


}

const searchCustomerOnSquareOnline = async function (name, email, buyer) {

  try {
    if (email) {

      var response = await searchCustomer(email);
      if (response && response.data) {
        writeLog("Customer found", "searchCustomerOnSquareOnline");
        return returnPromise(responseObject(response.data, 'Customer found.'));
      }
      else {
        response = await saveCustomer(name, email, buyer);
        if (response && response.data) {
          writeLog("Customer found", "searchCustomerOnSquareOnline");
          return returnPromise(responseObject(response.data, 'Customer found.'));
        }
        else {
          return returnPromise(responseObject(null, response.message));
        }
      }
    }
    else {
      writeLog("Customer email is required", "searchCustomerOnSquareOnline");
      return returnPromise(responseObject(null, 'Customer email is required'));
    }
  }
  catch (error) {
    writeLog(error.message, "searchCustomerOnSquareOnline", true);
    return returnPromise(responseObject(null, error.message));
  }
}


const getItem = function (item_name) {
  var item = SQUARE_CATALOG_ITEMS.filter(p => p.item_data.name.trim().replace(/ /g, '').toLowerCase() == item_name.trim().replace(/ /g, '').toLowerCase());
  return item.length > 0 ? item[0] : null;
}

const getModifier = function (modifierList_id, modifier_name) {
  var item = SQUARE_CATALOG_MODIFIERS.filter(p => p.id == modifierList_id).map(p => {
    var modifier = p.modifier_list_data.modifiers.find(q => q.modifier_data.name.trim().replace(/ /g, '').toLowerCase() == modifier_name.trim().replace(/ /g, '').toLowerCase());
    return modifier;
  }).filter(p => p);
  return item.length > 0 ? item[0] : null;
}

const ValidateRequest = function (request, response, data) {
  // console.log(`Method: ${getJSONString(request.method)}`);
  // console.log(`URL: ${getJSONString(request.url)}`);
  // console.log(`Headers: ${getJSONString(request.headers)}`);
  if (request.method == 'POST') {

    data = data ? JSON.parse(data) : null;
    if (!data) {
      writeLog("Request data is missing", "ValidateRequest");
      writeResponse(response, responseObject(null, 'Request data is missing'), STATUS_CODE_INTERNAT_SERVER_ERROR);
    }
    else {
      // writeResponse(response, responseObject(null,'Invalid origin'), 401);
      return data;
    }
  }
  else {
    writeLog("Invalid method type", "ValidateRequest");
    writeResponse(response, responseObject(null, 'Invalid method type'), STATUS_CODE_INVALID_ORIGIN);
  }
}

const writeResponse = function (response, result, statusCode = STATUS_CODE_SUCCESS) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json');
  response.write(JSON.stringify(result));
  response.end();
}

const responseObject = function (data, message = '') {
  return {
    data: data,
    message: message
  }
}

const returnPromise = function (object) {
  return new Promise((resolve, reject) => {
    resolve(object);
  });
}

const getJSONString = obj => {
  return JSON.stringify(obj, null, 2);
};

const getBaseUrl = function () {
  return SQUARE_IS_PRODUCTION ? API_ENDPOINTS.square_production_url : API_ENDPOINTS.square_sandbox_url;
}

const sendEmail = async function (subject, message) {
  try {

    var transporter = nodemailer.createTransport({
      service: "gmail.com",
      secure: false,
      // port: 465,
      auth: {
        user: 'amna.khalid2021@gmail.com',
        pass: 'Pakistan1!',
        tls: {
          // do not fail on invalid certs
          rejectUnauthorized: false
        },
      }
    });

    const mailOptions = {
      from: 'amna.khalid2021@gmail.com',
      to: 'arsal024@gmail.com',
      subject: subject, // Subject line
      text: message,
      // html: "<b>Hello world?</b>", // html body
    };

    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log("Error: " + JSON.stringify(err));
        writeLog(JSON.stringify(err), "sendEmail", true);
      }
      else {
        console.log("SUCCESS: " + JSON.stringify(info));
        writeLog(JSON.stringify(info), "sendEmail");
      }
    });


  } catch (error) {
    writeLog(error.message, "sendEmail", true);
    console.log("Error While Sending email: " + error.message);
  }
}


const getDoordashToken = function () {
  const data = {
    aud: 'doordash',
    iss: DOORDASH_ACCESS_KEY.developer_id,
    kid: DOORDASH_ACCESS_KEY.key_id,
    iat: Math.floor(Date.now() / 1000),
  }

  const headers = { algorithm: 'HS256', header: { 'dd-ver': 'DD-JWT-V1' }, expiresIn: '25m' }

  DOORDASH_TOKEN = jwt.sign(
    data,
    Buffer.from(DOORDASH_ACCESS_KEY.signing_secret, 'base64'),
    headers
  );

  writeLog("Doordash token generated", "getDoordashToken");
  console.log('Doordash token generated');
}

const writeLog = function (message, methodName, isError = false) {

  try {
    var fileName = new Date().getFullYear() + '-' + new Date().getMonth() + '-' + new Date().getDay() + '.txt';
    var path = 'logs/' + fileName;
    message = "------- Start --------" + "\n" +
      "Log Type:" + (isError ? 'Error' : 'Information') + "\n" +
      "Message :" + message + "\n" +
      "Log Time:" + new Date().toLocaleString() + "\n" +
      "Method Name:" + methodName + "\n" +
      "------- End ---------" + "\n";
    if (fs.existsSync(path)) {
      let data = fs.readFileSync(path, "utf8");
      data = data + '\n' + message;
      fs.writeFileSync(path, data);
    }
    else {
      fs.writeFileSync(path, message);
    }
  } catch (error) {
    console.log(error.message);
  }
}



server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  writeLog(`Server Started at http://${hostname}:${port}/`, "server.listen");
  getCatalogList(); // Get list of all Catalog Items.
  getCatalogList(true); // Get list of all Catalog Modifiers.
  getDoordashToken() // generate doordash token.
  // sendEmail('Test Subject', "Test Message from Node Mailer Package");
});

server.on('clientError', (err, socket) => {
  writeLog(err.message, "clientError", true);
  socket.end(err.message);
});