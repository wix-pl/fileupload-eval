/*jshint bitwise:true, indent:2, curly:true, eqeqeq:true, immed:true,
latedef:true, newcap:true, noarg:true, regexp:true, undef:true,
trailing:true, white:true, strict:false*/
/*global XT:true, XM:true, XV:true, _:true, enyo:true, window:true */

(function () {

  /**
    Expected to a have a parameter widget that contains an order and
    a transaction date.

    @name XV.TransactionList
    @extends XV.List
   */
  enyo.kind(
    /** @lends XV.TransactionList */{
    name: "XV.TransactionList",
    kind: "XV.List",
    published: {
      transModule: null,
      transWorkspace: null,
      transFunction: null
    },
    events: {
      onProcessingChanged: "",
      onOrderChanged: "",
      onShipmentChanged: "",
      onUpdateHeader: ""
    },
    handlers: {
      onBarcodeCapture: "captureBarcode"
    },
    multiSelect: true,
    showDeleteAction: false,
    toggleSelected: true,
    actions: [
      {name: "transactItem", prerequisite: "canTransactItem",
        method: "transactItem", notify: false, isViewMethod: true},
      {name: "transactLine", prerequisite: "canTransactItem",
        method: "transactLine", notify: false, isViewMethod: true},
      {name: "returnLine", prerequisite: "canReturnItem",
        method: "returnItem", notify: false, isViewMethod: true}
    ],
    captureBarcode: function (inSender, inEvent) {
      var models = _.filter(this.value.models, function (model) {
        // match on upc code or item number
        return model.getValue("itemSite.item.barcode") === inEvent.data ||
          model.getValue("itemSite.item.number") === inEvent.data;
      });
      if (models.length > 0) {
        this.transact(models, true, true);
      } else {
        inEvent.noItemFound = true;
      }

      this.doUpdateHeader(inEvent);
    },
    /**
        Helper function for transacting `transact` on an array of models.

        @param {Array} Models
        @param {Boolean} Prompt user for confirmation on every model
        @param {String} Optional to handle the transaction function name, if not passed
        it will use the published value. Used by ReturnMaterial's actions.
        @param {String} Optional to handle the workspace name, if not passed
        it will use the published value. Used by ReturnMaterial's actions.
        @param {String} Optional to handle the quantity attr name, if not passed
        it will use the model.quantityAttribute. Used by ReturnMaterial's actions.
    */
    transact: function (models, prompt, transFunction, transWorkspace) {
      var that = this,
        i = -1,
        callback,
        data = [];

      that._printModels = [];

      // Recursively transact everything we can
      // #refactor see a simpler implementation of this sort of thing
      // using async in inventory's ReturnListItem stomp
      callback = function (workspace, transFunction, transWorkspace) {
        var model,
          options = {},
          toTransact,
          transDate,
          params,
          dispOptions = {},
          wsOptions = {},
          wsParams,
          transModule = that.getTransModule();

        transFunction = transFunction || that.getTransFunction();
        transWorkspace = transWorkspace || that.getTransWorkspace();

        // If argument is false, this whole process was cancelled
        if (workspace === false) {
          return;

        // If a workspace brought us here, process the information it obtained
        } else if (workspace) {
          model = workspace.getValue();
          toTransact = model.quantityAttribute ? model.get(model.quantityAttribute) : null;
          transDate = model.transactionDate;
          if (workspace._printAfterPersist) {
            that._printModels.push(model);
          }

          if (toTransact) {
            model.printQty = toTransact;
            if (transFunction === "receipt") {
              wsOptions.freight = model.get("freight");
            }
            wsOptions.detail = model.formatDetail();
            wsOptions.asOf = transDate;
            wsParams = {
              orderLine: model.id,
              quantity: toTransact,
              options: wsOptions
            };
            data.push(wsParams);
          }
          workspace.doPrevious();
        }

        i++;
        // If we've worked through all the models then forward to the server
        if (i === models.length) {
          if (data[0]) {
            that.doProcessingChanged({isProcessing: true});
            dispOptions.success = function () {
              that.doProcessingChanged({isProcessing: false});
              if (that._printModels.length) {
                var printOptions = [];
                return _.each(that._printModels, function (model) {
                  printOptions.model = model;
                  printOptions.printQty = model.printQty;
                  that.doPrint(printOptions);
                });
              }
              
            };
            dispOptions.error = function () {
              that.doProcessingChanged({isProcessing: false});
            };
            transModule.transactItem(data, dispOptions, transFunction);
          } else {
            return;
          }

        // Else if there's something here we can transact, handle it
        } else {
          model = models[i];
          toTransact = model.get(model.quantityAttribute) || model.get("balance");
          transDate = model.transactionDate;

          // See if there's anything to transact here
          if (toTransact || prompt) {

            // If prompt or distribution detail required,
            // open a workspace to handle it
            if (prompt || model.undistributed() || model.requiresDetail()) {
              that.doWorkspace({
                workspace: transWorkspace,
                id: model.id,
                callback: callback,
                allowNew: false,
                success: function (model) {
                  model.transactionDate = transDate;
                }
              });

            // Otherwise just use the data we have
            } else {
              // Shove in this model to get printed because it didn't come from a workspace, 
              var Workspace = enyo.getObject(that.getTransWorkspace()),
                ws = new Workspace();
              if (ws.$.printLabel && ws.$.printLabel.isChecked()) {
                model.printQty = toTransact;
                that._printModels.push(model);
              }
              if (transFunction === "receipt") {
                options.freight = model.get("freight");
              }
              options.asOf = transDate;
              options.detail = model.formatDetail();
              params = {
                orderLine: model.id,
                quantity: toTransact,
                options: options
              };
              data.push(params);
              callback(null, transFunction, transWorkspace);
            }

          // Nothing to transact, move on
          } else {
            callback(null, transFunction, transWorkspace);
          }
        }
      };
      callback(null, transFunction, transWorkspace);
    },
    transactAll: function () {
      var models = this.getValue().models;
      // use 'balance' attribute for qty
      this.transact(models);
    },
    transactLine: function () {
      var models = this.selectedModels();
      // use 'balance' attribute for qty
      this.transact(models);
    },
    transactItem: function () {
      var models = this.selectedModels();
      this.transact(models, true);
    },
    returnItem: function () {
      var models = this.selectedModels(),
        that = this,
        data =  [],
        options = {},
        qtyTransacted,
        model,
        i,
        transModule = that.getTransModule();

      for (i = 0; i < models.length; i++) {
        model = models[i];
        qtyTransacted = model.get(model.quantityTransactedAttribute);

        // See if there's anything to transact here
        if (qtyTransacted) {
          data.push(model.id);
        }
      }

      if (data.length) {
        that.doProcessingChanged({isProcessing: true});
        options.success = function () {
          that.doProcessingChanged({isProcessing: false});
        };
        transModule.returnItem(data, options);
      }
    },
    selectedModels: function () {
      var collection = this.getValue(),
        models = [],
        selected,
        prop;
      if (collection.length) {
        selected = this.getSelection().selected;
        for (prop in selected) {
          if (selected.hasOwnProperty(prop)) {
            models.push(this.getModel(prop - 0));
          }
        }
      }
      return models;
    }
  });

}());

