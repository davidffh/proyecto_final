// @ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/m/UploadCollectionParameter"
],

    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof sap.ui.core.routing.History} History
     * @param {typeof sap.ui.model.json.JSONModel} JSONModel
     */

    function (Controller, History, MessageToast, MessageBox, JSONModel, UploadCollectionParameter) {
        "use strict";

        return Controller.extend("dffh.empleados.controller.crearEmpleado", {

            onInit: function () {
                this._wizard = this.byId("wizardEmployee");
                this._oNavContainer = this.byId("wizardNavContainer");
                this._oWizardContentPage = this.byId("wizardContentPage");
                var model = new JSONModel()

                model.setData({
                    id: "",
                    tipo: "",
                    puesto: "",
                    nombre: "",
                    apellido: "",
                    sueldo: 0,
                    dni: "",
                    cif: "",
                    dniOnOff: true, //DNI
                    cifOnOff: false, //CIF
                    sbaOnOff: true, //Sueldo Bruto Anual
                    pdOnOff: false, //Precio Diario
                    sbaMax: 0, //Sueldo Bruto Anual - Máximo 
                    sbaMin: 0, //Sueldo Bruto Anual - Mínimo 
                    sdMax: 0, //Sueldo diario - Máximo 
                    sdMin: 0, //Sueldo diario - Mínimo 
                    comentario: ""
                });

                this.getView().setModel(model, "mEmpleado");

                var testData = [];
                var oModel = new JSONModel({ data: testData });
                this.getView().setModel(oModel);

            },


            irMenu: function () {
                var oHistory = History.getInstance();
                var sPreviousHash = oHistory.getPreviousHash();

                if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                } else {

                    this.limpiar();

                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("menu", {}, true);
                }
            },

            _handleMessageBoxOpen: function (sMessage, sMessageBoxType) {
                MessageBox[sMessageBoxType](sMessage, {
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.YES) {
                            this._handleNavigationToStep(0);
                            this._wizard.discardProgress(this._wizard.getSteps()[0]);

                            this.irMenu();
                        }
                    }.bind(this)
                });
            },

            editStepOne: function () {
                this._handleNavigationToStep(0);
            },

            editStepTwo: function () {
                this._handleNavigationToStep(1);
            },

            editStepThree: function () {
                this._handleNavigationToStep(2);
            },

            _handleNavigationToStep: function (iStepNumber) {
                var fnAfterNavigate = function () {
                    this._wizard.goToStep(this._wizard.getSteps()[iStepNumber]);
                    this._oNavContainer.detachAfterNavigate(fnAfterNavigate);
                }.bind(this);

                this._oNavContainer.attachAfterNavigate(fnAfterNavigate);
                this.backToWizardContent();
            },

            backToWizardContent: function () {
                this._oNavContainer.backToPage(this._oWizardContentPage.getId());
            },


            irAPaso2: function (evt) {
                //id del botón pulsado
                var idOfMyButton = evt.getSource().getId();
                var myButton = this.getView().byId(idOfMyButton);
                var btText = myButton.getText();
                var sueldo, tipo;

                switch (btText) {
                    case "Interno":
                        tipo = 0;
                        sueldo = 24000;
                        this.getView().getModel("mEmpleado").setProperty("/sbaMax", 80000);
                        this.getView().getModel("mEmpleado").setProperty("/sbaMin", 12000);
                        break;
                    case "Autónomo":
                        tipo = 1;
                        sueldo = 400;
                        this.getView().getModel("mEmpleado").setProperty("/sdMax", 2000);
                        this.getView().getModel("mEmpleado").setProperty("/sdMin", 100);
                        this.getView().getModel("mEmpleado").setProperty("/dniOnOff", false);
                        this.getView().getModel("mEmpleado").setProperty("/cifOnOff", true);
                        this.getView().getModel("mEmpleado").setProperty("/pdOnOff", true);
                        this.getView().getModel("mEmpleado").setProperty("/sbaOnOff", false);
                        break;
                    case "Gerente":
                        tipo = 2;
                        sueldo = 70000;
                        this.getView().getModel("mEmpleado").setProperty("/sbaMax", 200000);
                        this.getView().getModel("mEmpleado").setProperty("/sbaMin", 50000);
                        break;
                }

                this.getView().getModel("mEmpleado").setProperty("/tipo", tipo);
                this.getView().getModel("mEmpleado").setProperty("/puesto", btText);
                this.getView().getModel("mEmpleado").setProperty("/sueldo", sueldo);


                this._wizard.nextStep();
            },

            wizardCancel: function () {
                this._handleMessageBoxOpen("¿Está seguro de salir?", "warning");
            },

            validarDNI: function (evt) {
                var dni = evt.getParameter("value");
                var number;
                var letter;
                var letterList;
                var regularExp = /^\d{8}[a-zA-Z]$/;
                //Se comprueba que el formato es válido
                if (regularExp.test(dni) === true) {
                    //Número
                    number = dni.substr(0, dni.length - 1);
                    //Letra
                    letter = dni.substr(dni.length - 1, 1);
                    number = number % 23;
                    letterList = "TRWAGMYFPDXBNJZSQVHLCKET";
                    letterList = letterList.substring(number, number + 1);
                    if (letterList !== letter.toUpperCase()) {
                        //Error
                        this.getView().getModel("mEmpleado").setProperty("/dniState", "Error");
                    } else {
                        //Correcto
                        this.getView().getModel("mEmpleado").setProperty("/dniState", "None");
                    }
                } else {
                    //Error
                    this.getView().getModel("mEmpleado").setProperty("/dniState", "Error");
                };
            },

            validaEmp: function (evt) {

                var vacio = false;
                var object = this.getView().getModel("mEmpleado").getData();

                if (!object.nombre) {
                    object.nombreState = "Error";
                    vacio = true;
                } else {
                    object.nombreState = "None";
                };

                if (!object.apellido) {
                    object.apellidoState = "Error";
                    vacio = true;
                } else {
                    object.apellidoState = "None";
                };

                //interno o gerente
                if (!object.tipo == "1") {
                    if (!object.dni) {
                        object.dniState = "Error";
                        vacio = true;
                    } else {
                        if (object.dniState === "Error") {
                            vacio = true;
                        } else {
                            object.dniState = "None";
                        };
                    };
                };

                //autónomo
                if (object.tipo === "1") {
                    if (!object.cif) {
                        object.cifState = "Error";
                        vacio = true;
                    } else {
                        object.cifState = "None";
                    };
                };

                if (!object.fecha) {
                    object.fechaState = "Error";
                    vacio = true;
                }
                else {
                    object.fechaState = "None";
                };

                if (vacio) {
                    MessageToast.show("Complete los campos obligatorios");
                } else {
                    this._wizard.nextStep();
                };
            },

            wizardCompletedHandler: function () {
                //cantidad de archivos seleccionados
                var oUploadCollection = this.byId("uploadCollection");
                var regs = oUploadCollection.getItems().length;

                //modelo de la lista
                var modelo = this.getView().byId("listaArchivos").getModel();

                //limpiamos los registros anteriores para actualizar la lista
                var rows = modelo.getData().data;
                rows.splice(0);

                //actualizamos el modelo con el listado de archivos selecccionados
                var itemData = modelo.getProperty("/data");

                for (var i = 0; i < regs; i++) {
                    var itemRow = { archivo: oUploadCollection.getItems()[i].getFileName() };
                    itemData.push(itemRow);
                    modelo.setData({ data: itemData });
                };

                //pasamos a la parte de la revisión de los datos
                this._oNavContainer.to(this.byId("wizardReviewPage"));
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
                var object = this.getView().getModel("mEmpleado").getData();
                var oCustomerHeaderSlug = new UploadCollectionParameter({
                    name: "slug",
                    value: this.getOwnerComponent().SapId + ";" + object.id + ";" + oEvent.getParameter("fileName")
                });
                oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);

            },


            limpiar: function () {
                var object = this.getView().getModel("mEmpleado").getData();
                object.id = "";
                object.tipo = "";
                object.puesto = "";
                object.nombre = "";
                object.apellido = "";
                object.sueldo = 0;
                object.dni = "";
                object.cif = "";
                object.dniOnOff = true;
                object.cifOnOff = false;
                object.sbaOnOff = true;
                object.pdOnOff = false;
                object.sbaMax = 0;
                object.sbaMin = 0;
                object.sdMax = 0;
                object.sdMin = 0;
                object.comentario = "";

                this.getView().byId("DP1").setValue(null);

                var oUploadCollection = this.byId("uploadCollection");
                oUploadCollection.removeAllItems();

                this._wizard.discardProgress(this.byId("employeeType"));
                this._wizard.discardProgress(this.byId("employeeData"));

                //le quitamos el botón de STEP2 al wizard
                this._wizard.invalidateStep(this.byId("employeeType"));
            },

            onGuardarEmpleado: function () {
                var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
                var object = this.getView().getModel("mEmpleado").getData();
                var dniOcif;

                 if (object.dni === '') {
                    dniOcif = object.cif;
                 } else {
                    dniOcif = object.dni;
                 };

                var body = {
                    SapId: this.getOwnerComponent().SapId,
                    Type: object.tipo.toString(),
                    FirstName: object.nombre,
                    LastName: object.apellido,
                    Dni: dniOcif,
                    CreationDate: object.fecha,
                    Comments: object.comentario
                };

                body.UserToSalary = [{
                    Ammount: parseFloat(object.sueldo).toString(),
                    Comments: object.comentario,
                    Waers: "EUR"
                }];

                this.getView().getModel("employeeModel").create("/Users", body, {
                    success: function (data) {
                        this.getView().getModel("mEmpleado").setProperty("/id", data.EmployeeId);

                        var oUploadCollection = this.byId("uploadCollection");
                        oUploadCollection.upload();

                        MessageBox.confirm(oResourceBundle.getText("odataSaveOK") + data.EmployeeId, {
                            actions: [MessageBox.Action.OK],
                            onClose: function (sAction) {
                                if (sAction === 'OK') {
                                    this._handleNavigationToStep(0);
                                    this._wizard.discardProgress(this._wizard.getSteps()[0]);
                                    this.irMenu();                                    
                                };
                            }.bind(this)
                        });

                    }.bind(this),
                    error: function (error) {
                        MessageBox.error(oResourceBundle.getText("odataSaveKO"));
                    }.bind(this)
                });
            }

        });
    });