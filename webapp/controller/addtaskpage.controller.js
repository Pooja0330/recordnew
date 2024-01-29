sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/core/message/Message",
    "sap/ui/core/library",
    "sap/ui/core/Core",
    "sap/ui/core/Element",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,Fragment, Message, coreLibrary, Core, Element,MessageBox) {
        "use strict";
        var MessageType = coreLibrary.MessageType;
        return Controller.extend("nonconformanceodata.controller.addtaskpage", {
            onInit: function () {
                this.oModel = new sap.ui.model.json.JSONModel();
                this.oModel.loadData(sap.ui.require.toUrl("nonconformanceodata/model/orderdata.json"), null, false);
                this.getView().setModel(this.oModel, "LocalModel");
           },
           onPressCreateTaskSave: function () {

            let OrderCreationObject = this.getView().getModel("LocalModel").getProperty("/OrderCreationObject")
            this.getView().setBusy(true);
            this.getView().getModel().create("/Products", OrderCreationObject, {
                success: function (oData) {
                    this.getView().setBusy(false);
                    MessageBox.success("New record created successfully.");
                }.bind(this),
                error: function (oError) {
                    this.getView().setBusy(false);
                    MessageBox.error("New record  not Inserted.");
                }.bind(this)
            });
            this.onPressCreateClose();
        
        },
        onPressCreateClose:function(){
            sap.ui.core.UIComponent.getRouterFor(this).navTo("Routeview1");
        }
       
        });
    });
