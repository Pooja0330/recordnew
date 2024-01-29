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
        return Controller.extend("nonconformanceodata.controller.addaffpartpage", {
            onInit: function () {
                this.oModel = new sap.ui.model.json.JSONModel();
                this.oModel.loadData(sap.ui.require.toUrl("nonconformanceodata/model/orderdata.json"), null, false);
                this.getView().setModel(this.oModel, "LocalModel");

                this._MessageManager = Core.getMessageManager();
                this._MessageManager.removeAllMessages();
                this._MessageManager.registerObject(this.getView().byId("idaffPartform"), true);
                this.getView().setModel(this._MessageManager.getMessageModel(), "message");



                
           },
           onPressCreateTaskSave: function () {
            this.inputValidationCheck();
            if (this.getView().getModel("message").getData().length > 0) {
                this.getView().byId("messagePopoverBtn").firePress();
            }else{
            let OrderCreationObject = this.getView().getModel("LocalModel").getProperty("/CustomerCreationObject")
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
            });}
          
        
        },
        onPressCreateClose:function(){
            sap.ui.core.UIComponent.getRouterFor(this).navTo("Routeview1");
        },
        inputValidationCheck: function () {
            let aformElements = this.getView().byId("idaffPartform").getAggregation("form").getAggregation("formContainers")[0].getAggregation("formElements");
            for (let i = 0; i < aformElements.length; i++) {
                if (aformElements[i].getLabel().getProperty("required") === true) {
                    let feilds = aformElements[i].getFields();
                    for (let j = 0; j < feilds.length; j++) {
                        this.handelRequiredField(feilds[j], aformElements[i].getLabel().getText());
                    }
                }
            }
        },
        handelRequiredField: function (oInput, sAdditionalText) {
            let sTarget = oInput.getBindingPath("value");
            this.removeMessageFromTarget(sTarget);
            if (!oInput.getValue()) {
                this._MessageManager.addMessages(
                    new Message({
                        message: "A mandatory field is required",
                        type: MessageType.Error,
                        target: sTarget,
                        additionalText: sAdditionalText

                    })
                );
            }

        },

        createMessagePopover: function () {
            if (!this.oMessagePopoverDialog) {
                var sFragmentPath = "nonconformanceodata.view.fragments.messagepopover";
                this.oMessagePopoverDialog = Fragment.load({
                    id: this.getView().getId(),
                    name: sFragmentPath,
                    controller: this.getView().getController()
                }).then(function (oDialog) {
                    this.getView().addDependent(oDialog);
                    return oDialog;
                }.bind(this));
            }

            this.oMessagePopoverDialog.then(function (oDialog) {
                this.getView().addDependent(oDialog);
                return oDialog;
            }.bind(this));

        },

        handleMessagePopoverPress: function (oEvent) {
            if (!this.oMessagePopoverDialog) {
                this.createMessagePopover();
            }
            this.oMessagePopoverDialog.then(function (oDialog) {
                this.getView().byId("messagePopoverBtn").addDependent(oDialog);
                oDialog.toggle(oEvent.getSource());

            }.bind(this));
        },

        removeMessageFromTarget: function (sTarget) {
            this._MessageManager.getMessageModel().getData().forEach(function (oMessage) {
                if (oMessage.target === sTarget) {
                    this._MessageManager.removeMessages(oMessage);
                }
            }.bind(this));
        },
        buttonTypeFormatter: function () {
            var sHighestSeverity;
            var aMessages = this._MessageManager.getMessageModel().oData;
            aMessages.forEach(function (sMessage) {
                switch (sMessage.type) {
                    case "Error":
                        sHighestSeverity = "Negative";
                        break;
                    case "Warning":
                        sHighestSeverity = sHighestSeverity !== "Negative" ? "Critical" : sHighestSeverity;
                        break;
                    case "Success":
                        sHighestSeverity = sHighestSeverity !== "Negative" && sHighestSeverity !== "Critical" ? "Success" : sHighestSeverity;
                        break;
                    default:
                        sHighestSeverity = !sHighestSeverity ? "Neutral" : sHighestSeverity;
                        break;
                }
            });

            return sHighestSeverity;
        },

        // Display the number of messages with the highest severity
        highestSeverityMessages: function () {
            var sHighestSeverityIconType = this.buttonTypeFormatter();
            var sHighestSeverityMessageType;

            switch (sHighestSeverityIconType) {
                case "Negative":
                    sHighestSeverityMessageType = "Error";
                    break;
                case "Critical":
                    sHighestSeverityMessageType = "Warning";
                    break;
                case "Success":
                    sHighestSeverityMessageType = "Success";
                    break;
                default:
                    sHighestSeverityMessageType = !sHighestSeverityMessageType ? "Information" : sHighestSeverityMessageType;
                    break;
            }

            return this._MessageManager.getMessageModel().oData.reduce(function (iNumberOfMessages, oMessageItem) {
                return oMessageItem.type === sHighestSeverityMessageType ? ++iNumberOfMessages : iNumberOfMessages;
            }, 0) || "";
        },
        getGroupName: function (sControlId) {

            var oControl = Element.registry.get(sControlId);

            if (oControl) {
                var sFormSubtitle = oControl.getParent().getParent().getTitle().getText(),
                    sFormTitle = oControl.getParent().getParent().getParent().getTitle();

                return sFormTitle + ", " + sFormSubtitle;
            }
        },

        isPositionable: function (sControlId) {
            // Such a hook can be used by the application to determine if a control can be found/reached on the page and navigated to.
            return sControlId ? true : true;
        },

        // Set the button icon according to the message with the highest severity
        buttonIconFormatter: function () {
            var sIcon;
            var aMessages = this._MessageManager.getMessageModel().oData;

            aMessages.forEach(function (sMessage) {
                switch (sMessage.type) {
                    case "Error":
                        sIcon = "sap-icon://error";
                        break;
                    case "Warning":
                        sIcon = sIcon !== "sap-icon://error" ? "sap-icon://alert" : sIcon;
                        break;
                    case "Success":
                        sIcon = sIcon !== "sap-icon://error" && sIcon !== "sap-icon://alert" ? "sap-icon://sys-enter-2" : sIcon;
                        break;
                    default:
                        sIcon = !sIcon ? "sap-icon://information" : sIcon;
                        break;
                }
            });

            return sIcon;
        },
       
        });
    });
