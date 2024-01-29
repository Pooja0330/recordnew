sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/core/message/Message",
    "sap/ui/core/library",
    "sap/ui/core/Core",
    "sap/ui/core/Element"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,Fragment, Message, coreLibrary, Core, Element) {
        "use strict";
        var MessageType = coreLibrary.MessageType;
        return Controller.extend("nonconformanceodata.controller.addpage", {
            onInit: function () {
               
                this.oModel = new sap.ui.model.json.JSONModel();
                this.oModel.loadData(sap.ui.require.toUrl("nonconformanceodata/model/orderdata.json"), null, false);
                this.getView().setModel(this.oModel, "LocalModel");
                this.refreshform();

           },
          
             onPressCreateSave: function () {
            
                    let oCreateData = this.getView().getModel("LocalModel").getProperty("/EmployeeList");
                    let EmployeeCreationObject = this.getView().getModel("LocalModel").getProperty("/EmployeeCreationObject");
                    if (oCreateData.length == 0) {
                        EmployeeCreationObject.EmployeeId = 1;
                    } else {
                        EmployeeCreationObject.EmployeeId = oCreateData[oCreateData.length - 1].EmployeeId + 1;
                    };
                    oCreateData.push(EmployeeCreationObject);
                    this.getView().getModel("LocalModel").setProperty("/EmployeeList", oCreateData);
                    this.refreshform();
                   this.onPressCreateClose();
                
            },
            onPressCreateClose:function(){
                sap.ui.core.UIComponent.getRouterFor(this).navTo("Routeview1");
            },
         
            refreshform: function () {
                let oCreateEmployeeObj = {
                    "EmployeeId": "",
                    "Salutation": -1,
                    "First_Name": "",
                    "Last_Name": "",
                    "Address": "",
                    "CountryCode": "",
                    "ContactNo": "",
                    "Position": ""
                }

                this.getView().getModel("LocalModel").setProperty("/EmployeeCreationObject", oCreateEmployeeObj);


            },

           

        });
    });
