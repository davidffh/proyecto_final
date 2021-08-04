sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
],
    /**
    * @param {typeof sap.ui.core.mvc.Controller} Controller
    * @param {typeof sap.ui.core.routing.History} History
    */

    function (Controller, History) {
        "use strict";

        return Controller.extend("dffh.empleados.controller.menu", {

            onInit: function () {

            },

            crearEmpleado: function () {
                var oHistory = History.getInstance();
                var sPreviousHash = oHistory.getPreviousHash();

                if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                } else {
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    oRouter.navTo("crearEmpleado", {}, true);
                };
            },

            mostrarEmpleado: function () {
                var oHistory = History.getInstance();
                var sPreviousHash = oHistory.getPreviousHash();

                if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                } else {
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    oRouter.navTo("mostrarEmpleado", {}, true);
                };
            },

            irAUrl: function () {
                window.open("https://4f90fb3etrial-dev-logali-approuter.cfapps.us10.hana.ondemand.com/logaligroupEmployees/index.html");
            }
        });
    }
);
