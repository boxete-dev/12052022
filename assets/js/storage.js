var localStorageApp = null;
var databaseApp = null;

function getLocalStoreApp() {
  try {
    localStorage.setItem("TST", 1);
    localStorageApp = localStorage;
  } catch (e) {
    localStorageApp = {
      keyValues: {},
      length: 0,
      setItem: function (key, value) {
        this.keyValues[key] = value;
      },
      getItem: function (key) {
        if (this.keyValues[key] == undefined) return null;
        else return this.keyValues[key];
      },
      removeItem: function (key) {
        this.keyValues[key] = null;
      }
    };
  }
  return localStorageApp; 
}

function getDatabaseApp() {
  var db = window.sqlitePlugin.openDatabase('orderingapp.db');
  db.transaction(function(tx) {
    tx.executeSql('CREATE TABLE IF NOT EXISTS keyValues (key, value)');
  }, function(error) {
    console.log('Transaction ERROR: ' + error.message);
  }, function() {
    console.log('Populated database OK');
  });
  localStorageApp = {
    keyValues: {},
    length: 0,
    setItem: function (key, value, callback) {
      var db = window.sqlitePlugin.openDatabase('orderingapp.db');
      this.keyValues[key] = value;
      db.transaction(function (tx) {
        tx.executeSql("SELECT value FROM keyValues WHERE key=?", [key], function(tx, res) {
          console.log("db", res.rows);
          if (res.rows.length == 0) {
            console.log("Insert");
            db.transaction(function (tx) {
              tx.executeSql("INSERT INTO keyValues VALUES (?, ?)", [key, value], callback, callback);
            });
          } else {
            console.log("Update");
            db.transaction(function (tx) {
              tx.executeSql("UPDATE keyValues SET value=? WHERE key=?", [value, key], callback, callback);
            });
          }
        }, function(error) {
          console.log('getItem SQL statement ERROR: ' + error.message);
          callback(new Error("Error"));
        });
      });
    },
    getItem: function (key) {
      var db = window.sqlitePlugin.openDatabase('orderingapp.db');
      db.transaction(function (tx) {
        tx.executeSql("SELECT value FROM keyValues WHERE key=?", [key], function(tx, res) {
          console.log("db", key, res.rows.item(0).value);
          if (res.rows.length == 0) callback(null);
          else return callback(res.rows.item(0).value);
        }, function(error) {
          console.log('getItem SQL statement ERROR: ' + error.message);
          callback(null);
        });
      });
    },
    removeItem: function (key) {
      var db = window.sqlitePlugin.openDatabase('orderingapp.db');
      db.transaction(function (tx) {
        tx.executeSql("DELETE FROM keyValues WHERE key=?", [key], function(tx, res) {
          console.log("db", key, res);
          callback();
        }, function(error) {
          console.log('getItem SQL statement ERROR: ' + error.message);
          callback(new Error("Error"));
        });
      });
    },
    selectAll: function () {
      var db = window.sqlitePlugin.openDatabase('orderingapp.db');
      db.transaction(function (tx) {
        tx.executeSql("SELECT value FROM keyValues", [], function(tx, res) {
          console.log("db", res.rows);
        }, function(error) {
          console.log('getItem SQL statement ERROR: ' + error.message);
        });
      });
    }
  };
  return localStorageApp;
}
localStorageApp = getLocalStoreApp();

if (!localStorageApp.getItem('FLAG_V4') && localStorageApp.clear) {
  localStorageApp.clear();
  localStorageApp.setItem('FLAG_V4', 'true');
}
