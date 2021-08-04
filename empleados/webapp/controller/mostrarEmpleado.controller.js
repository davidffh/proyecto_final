// @ts-nocheck
sap.ui.define([
    'sap/ui/core/mvc/Controller',
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/routing/History",
    "sap/m/UploadCollectionParameter",
    "sap/m/MessageBox"
],
    /**
     * 
     * @param {typeof sap.ui.core.mvc.Controller} Controller 
     * @param {typeof sap.ui.model.Filter} Filter
     * @param {typeof sap.ui.model.FilterOperator} FilterOperator
     * @param {typeof sap.ui.core.routing.History} History
     */
    function (Controller, Filter, FilterOperator, History, UploadCollectionParameter, MessageBox) {
        'use strict';

        return Controller.extend("dffh.empleados.controller.mostrarEmpleado", {


            onInit: function () {
                
            },

            irMenu: function () {
                //dejo seteada la PAGE de seleccionar empleado, para cuando vuelva a consulta aparezca el mensaje
                var split = this.byId("SplitApp");
                split.toDetail(this.createId("selEmpleado"));

                var oHistory = History.getInstance();
                var sPreviousHash = oHistory.getPreviousHash();

                if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                } else {

                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    oRouter.navTo("menu", {}, true);
                }
            },

            onFilterEmployees: function (oEvent) {
                // build filter array
                var aFilter = [];
                var sQuery = oEvent.getParameter("query");
                if (sQuery) {
                    aFilter.push(new Filter("FirstName", FilterOperator.Contains, sQuery));
                }

                // filter binding
                var oList = this.getView().byId("listaEmpleados");
                var oBinding = oList.getBinding("items");
                oBinding.filter(aFilter);
            },

            empleadoSeleccionado: function (evt) {

                //1- contexto
                var objContext = evt.getParameter("listItem").getBindingContext("employeeModel");

                //2- Id del empleado, lo uso con THIS para alcanzar el id de empleado en el UploadCollection
                this.empId = objContext.getProperty("EmployeeId");

                //3- <Page> de detalle de empleado
                var detEmp = this.byId("detEmpleado");

                //4- binding con el <Page> de detalle de empleado
                detEmp.bindElement("employeeModel>/Users(EmployeeId='" + this.empId + "',SapId='" + this.getOwnerComponent().SapId + "')");

                //5- instancia el control SplitApp y le indico a cuál <Page> ir del detail
                var split = this.byId("SplitApp");
                split.toDetail(this.createId("detEmpleado"));
            },

            onFileChange: function (oEvent) {
                var oUploadCollection = oEvent.getSource();
                // Header Token
                var oCustomerHeaderToken = new UploadCollectionParameter({
                    name: "x-csrf-token",
                    value: this.getView().getModel("employeeModel").getSecurityToken()
                });
                oUploadCollection.addHeaderParameter(oCustomerHeaderToken);

            },

            onFileBeforeUpload: function (oEvent) {
                //Header Slug
                var oCustomerHeaderSlug = new UploadCollectionParameter({
                    name: "slug",
                    value: this.getOwnerComponent().SapId + ";" + this.empId + ";" + oEvent.getParameter("fileName")
                });
                oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);

            },

            onFileDeleted: function (oEvent) {
                var oUploadCollection = oEvent.getSource();
                var sPath = oEvent.getParameter("item").getBindingContext("employeeModel").getPath();
                this.getView().getModel("employeeModel").remove(sPath, {
                    success: function () {
                        oUploadCollection.getBinding("items").refresh();
                    },
                    error: function () {

                    }
                });
            },

            onFileDownload: function (oEvent) {
                const sPath = oEvent.getSource().getBindingContext("employeeModel").getPath();
                window.open("/sap/opu/odata/sap/ZEMPLOYEES_SRV" + sPath + "/$value");

            },

            onFileUploadComplete: function (oEvent) {
                var oUploadCollection = oEvent.getSource();
                oUploadCollection.getBinding("items").refresh();
            },

            darDeBaja: function () {
                var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

                var confirma = oResourceBundle.getText("confirma")
                MessageBox.confirm(confirma, {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    onClose: function (sAction) {
                        if (sAction === 'OK') {

                            this.getView().getModel("employeeModel").remove("/Users(EmployeeId='" + this.empId + "',SapId='" + this.getOwnerComponent().SapId + "')", {
                                success: function (data) {
                                    MessageBox.success(oResourceBundle.getText("odataDeletedOK") + this.empId);

                                    var split = this.byId("SplitApp");
                                    split.toDetail(this.createId("selEmpleado"));

                                    //refrescar la data
                                    var oModel = this.getView().getModel("employeeModel");
                                    oModel.refresh(true);

                                }.bind(this),
                                error: function (error) {
                                    MessageBox.error(oResourceBundle.getText("odataDeletedKO"));
                                }.bind(this)
                            });
                        };
                    }.bind(this)
                });
            },

            ascender: function () {

                // if (!this._nAscenso) {
                this._nAscenso = sap.ui.xmlfragment("dffh.empleados.fragment.ascender", this);
                this.getView().addDependent(this._nAscenso);

                var model = new sap.ui.model.json.JSONModel()

                model.setData({
                    sueldo: 0,
                    comentario: ""
                });

                this._nAscenso.setModel(model, "mAscenso");
                this._nAscenso.open();
                // };
            },

            fSalir: function () {
                this._nAscenso.close();
            },

            fAscenso: function () {
                var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
                var object = this._nAscenso.getModel("mAscenso").getData();

                var body = {
                    SapId: this.getOwnerComponent().SapId,
                    EmployeeId: this.empId,
                    CreationDate: object.fecha,
                    Ammount: parseFloat(object.sueldo).toString(),
                    Waers: "EUR",
                    Comments: object.comentario
                };

                this.getView().getModel("employeeModel").create("/Salaries", body, {
                    success: function () {
                        sap.m.MessageToast.show(oResourceBundle.getText("ascendido"));
                        
                        //refresh del modelo
                        var oModel = this.getView().getModel("employeeModel");
                        oModel.refresh(true);
                        //refresh del TimeLine
                        var oTimeLine = this.byId("timeLine");
                        oTimeLine.bindElement("/Salaries");

                        this._nAscenso.close();

                    }.bind(this),
                    error: function (error) {
                        
                    }.bind(this)
                });
            }

        });
    });