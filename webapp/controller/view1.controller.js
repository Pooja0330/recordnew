sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/m/SearchField',
    'sap/m/Token',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/model/odata/v2/ODataModel',
    'sap/ui/table/Column',
    'sap/m/Column',
    'sap/m/Text',
    'sap/ui/comp/library',
    'sap/ui/model/type/String',
    'sap/m/ColumnListItem',
    'sap/m/Label',
    "sap/m/MessageBox",
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, SearchField, Token, Filter, FilterOperator, ODataModel, UIColumn, MColumn, Text, compLibrary
        , TypeString, ColumnListItem, Label,MessageBox,MessageToast) {
        "use strict";

        return Controller.extend("nonconformanceodata.controller.view1", {
            onInit: function () {
                this.oModel = new sap.ui.model.json.JSONModel();
                this.oModel.loadData(sap.ui.require.toUrl("nonconformanceodata/model/orderdata.json"), null, false);
                this.getView().setModel(this.oModel, "LocalModel");

                var oMultiInput
                // Value Help Dialog standard use case with filter bar without filter suggestions
                oMultiInput = this.byId("multiInput");
                oMultiInput.addValidator(this._onMultiInputValidate);
                oMultiInput.setTokens(this._getDefaultTokens());
                this._oMultiInput = oMultiInput;

                let Ncdata = {
                    items: [
                        { key: "1", text: "Finical Line Item" },
                        { key: "2", text: "Object Line Item" },
                    ],
                    otestdata: [
                        {
                            "defectcode": "0",
                            "plants": "001",
                            "station": "gurgaon"
                        },
                        {
                            "defectcode": "1",
                            "plants": "002",
                            "station": "gurgaon"
                        },
                        {
                            "defectcode": "2",
                            "plants": "003",
                            "station": "gurgaon"
                        }]
                };
                var OModel = new sap.ui.model.json.JSONModel(Ncdata);
                this.getView().setModel(OModel, "OModel");

            },
            formatRowHighlight: function (oValue) {
                // Your logic for rowHighlight goes here
                if (oValue == 1) {
                    return "Error";
                } else if (oValue == 2) {
                    return "Warning";
                } else if (oValue == 3) {
                    return "Success";
                }
                return "Information";
            },
            navOnPress: function (oEvent) {
                
                sap.ui.core.UIComponent.getRouterFor(this).navTo("Routeaddpage");
               
            },
            OnAffectedPart:function(){
                sap.ui.core.UIComponent.getRouterFor(this).navTo("RouteaffectedPartsaddpage"); 
            },
            onPressDelete: function () {
                let sSelectedItem = this.getView().byId("idEmployeeTabel").getSelectedItems();
                if (sSelectedItem.length == 0) {
                    MessageBox.warning(
                        "Please Select an item for deletion",
                        {
                            icon: MessageBox.Icon.WARNING,
                            title: "WARNING",
                            actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                            emphasizedAction: MessageBox.Action.OK,
                            initialFocus: MessageBox.Action.CANCEL,
                            styleClass: sResponsivePaddingClasses
                        }
                    );
                } else {
                    let oCreateData = this.getView().getModel("LocalModel").getProperty("/EmployeeList");

                    let itemtobedeleted = [];
                    for (let i = 0; i < sSelectedItem.length; i++) {
                        let sSelectedItemPath = sSelectedItem[i].getBindingContextPath();
                        let spliceIndex = parseInt(sSelectedItemPath.split("/EmployeeList/")[1]);
                        itemtobedeleted.push(spliceIndex);

                    }
                    for (let i = 0; i < itemtobedeleted.length; i++) {
                        oCreateData.splice(itemtobedeleted[i], 1);

                    }

                    this.getView().byId("idEmployeeTabel").removeSelections(true);
                    this.getView().getModel("LocalModel").setProperty("/EmployeeList", oCreateData);

                }
            },
            onValueHelpRequested: function () {
                this._oBasicSearchField = new SearchField();
                this.loadFragment({
                    name: "nonconformanceodata.view.fragments.ValueHelpDialogFilterbar"
                }).then(function (oDialog) {
                    var oFilterBar = oDialog.getFilterBar(), oColumnProductCode, oColumnProductName;
                    this._oVHD = oDialog;

                    this.getView().addDependent(oDialog);

                    // Set key fields for filtering in the Define Conditions Tab
                    oDialog.setRangeKeyFields([{
                        label: "Product",
                        key: "ProductID",
                        type: "string",
                        typeInstance: new TypeString({}, {
                            maxLength: 7
                        })
                    }]);

                    // Set Basic Search for FilterBar
                    oFilterBar.setFilterBarExpanded(false);
                    oFilterBar.setBasicSearch(this._oBasicSearchField);

                    // Trigger filter bar search when the basic search is fired
                    this._oBasicSearchField.attachSearch(function () {
                        oFilterBar.search();
                    });

                    oDialog.getTableAsync().then(function (oTable) {

                        oTable.setModel(this.oProductsModel);

                        // For Desktop and tabled the default table is sap.ui.table.Table
                        if (oTable.bindRows) {
                            // Bind rows to the ODataModel and add columns
                            oTable.bindAggregation("rows", {
                                path: "/Products",
                                events: {
                                    dataReceived: function () {
                                        oDialog.update();
                                    }
                                }
                            });
                            oColumnProductCode = new UIColumn({ label: new Label({ text: "Product ID" }), template: new Text({ wrapping: false, text: "{ProductID}" }) });
                            oColumnProductCode.data({
                                fieldName: "ProductID"
                            });
                            oColumnProductName = new UIColumn({ label: new Label({ text: "Product Name" }), template: new Text({ wrapping: false, text: "{ProductName}" }) });
                            oColumnProductName.data({
                                fieldName: "ProductName"
                            });
                            oTable.addColumn(oColumnProductCode);
                            oTable.addColumn(oColumnProductName);
                        }

                        // For Mobile the default table is sap.m.Table
                        if (oTable.bindItems) {
                            // Bind items to the ODataModel and add columns
                            oTable.bindAggregation("items", {
                                path: "/Products",
                                template: new ColumnListItem({
                                    cells: [new Label({ text: "{ProductID}" }), new Label({ text: "{ProductName}" })]
                                }),
                                events: {
                                    dataReceived: function () {
                                        oDialog.update();
                                    }
                                }
                            });
                            oTable.addColumn(new MColumn({ header: new Label({ text: "Product ID" }) }));
                            oTable.addColumn(new MColumn({ header: new Label({ text: "Product Name" }) }));
                        }
                        oDialog.update();
                    }.bind(this));

                    oDialog.setTokens(this._oMultiInput.getTokens());
                    oDialog.open();
                }.bind(this));
            },

            onValueHelpOkPress: function (oEvent) {
                var aTokens = oEvent.getParameter("tokens");
                this._oMultiInput.setTokens(aTokens);
                this._oVHD.close();
            },

            onValueHelpCancelPress: function () {
                this._oVHD.close();
            },

            onValueHelpAfterClose: function () {
                this._oVHD.destroy();
            },
            // #endregion
            onFilterBarSearch: function (oEvent) {
                var sSearchQuery = this._oBasicSearchField.getValue(),
                    aSelectionSet = oEvent.getParameter("selectionSet");

                var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
                    if (oControl.getValue()) {
                        aResult.push(new Filter({
                            path: oControl.getName(),
                            operator: oControl.getName() === "ProductID" ? FilterOperator.EQ : FilterOperator.Contains,
                            value1: oControl.getValue()
                        }));
                    }

                    return aResult;
                }, []);

                aFilters.push(new Filter({
                    filters: [
                        new Filter({ path: "ProductID", operator: FilterOperator.EQ, value1: sSearchQuery }),
                        new Filter({ path: "ProductName", operator: FilterOperator.Contains, value1: sSearchQuery })
                    ],
                    and: false
                }));

                this._filterTable(new Filter({
                    filters: aFilters,
                    and: true
                }));
            },
            _filterTable: function (oFilter) {
                var oVHD = this._oVHD;

                oVHD.getTableAsync().then(function (oTable) {
                    if (oTable.bindRows) {
                        oTable.getBinding("rows").filter(oFilter);
                    }
                    if (oTable.bindItems) {
                        oTable.getBinding("items").filter(oFilter);
                    }

                    // This method must be called after binding update of the table.
                    oVHD.update();
                });
            },
            _getDefaultTokens: function () {
                var ValueHelpRangeOperation = compLibrary.valuehelpdialog.ValueHelpRangeOperation;
                var oToken1 = new Token({
                    key: "PD-103",
                    text: "Mouse (PD-103)"
                });

                var oToken2 = new Token({
                    key: "range_0",
                    text: "!(=PD-102)"
                }).data("range", {
                    "exclude": true,
                    "operation": ValueHelpRangeOperation.EQ,
                    "keyField": "ProductID",
                    "value1": "PD-102",
                    "value2": ""
                });

                return [oToken1, oToken2];
            },
            onPressCreateTaskBar: function () {
                sap.ui.core.UIComponent.getRouterFor(this).navTo("RouteTaskaddpage");
            },
         
            onPressDeleteTaskBar:function(){
                
                    MessageBox.error("Do you want to Delete Selected Items.", {
                        actions: ["OK", MessageBox.Action.CLOSE],
                        emphasizedAction: "Manage Products",
                        onClose: function (sAction) {
                            let oSelectedItemObject = this.getView().byId("idOrdersTBL").getSelectedItem().getBindingContext("MasterPageModel").getObject(),
                                    //path according to the entity's Property
                                    sPath = "/zs2p_c_bp_gsdb_map(Bpvendorcode='" + oSelectedItemObject.Bpvendorcode + "',Gsdbcode='" + oSelectedItemObject.Gsdbcode + "',Accountgroup='" + oSelectedItemObject.Accountgroup + "',Partnerfunction='" + oSelectedItemObject.Partnerfunction + "',Paymentterms='" + oSelectedItemObject.Paymentterms + "')";
                                 if(!oSelectedItemObject){
                                    MessageToast.show("Please select item to be deleted");
                                 }
                                 else{
                                this.getView().setBusy(true);
                                this.getView().getModel().remove(sPath, {
                                    success: function (oData) {
                                        this.getView().setBusy(false);
                                        MessageBox.success("Selected Record deleted successfully.");
                                        this.getView().getModel().refresh();
                                    }.bind(this),
                                    error: function (oError) {
                                        this.getView().setBusy(false);
                                        this.getView().getModel().refresh();
                                    }.bind(this)
                                });
                            }
                        
                        }
                    });
                
            },

           
        });
    });
