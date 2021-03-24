sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/rava/model/models",
	"./model/errorHandling"
], function(UIComponent, Device, models, errorHandling) {
	"use strict";

	return UIComponent.extend("com.rava.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			
			this.setModel(models.createDeviceModel(), "device");
			
			UIComponent.prototype.init.apply(this, arguments);
			
			this.getRouter().initialize();
		},

		createContent: function() {
			var app = new sap.m.App({
				id: "App"
			});
			var appType = "App";
			var appBackgroundColor = "#FFFFFF";
			if (appType === "App" && appBackgroundColor) {
				app.setBackgroundColor(appBackgroundColor);
			}

			return app;
		},

		getNavigationPropertyForNavigationWithContext: function(sEntityNameSet, targetPageName) {
			var entityNavigations = navigationWithContext[sEntityNameSet];
			return entityNavigations == null ? null : entityNavigations[targetPageName];
		}

	});

});
