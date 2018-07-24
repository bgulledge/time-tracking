jQuery.sap.declare("Application");
jQuery.sap.require("sap.ui.app.Application");
jQuery.sap.require("utils.Dates");

sap.ui.app.Application.extend("Application", {

    init : function() {

    	// set global models

		//set selected values model
    	selectedValues = {userName : "", weekYr : "", workDate : new Date(), projNum : "0", projName : "none", actNum : "0", actName : "none", phaseNum : "0", phaseName : "none", rowsSaved:true, server : "https://ecc.newellrubbermaid.com"};
		var selectedModel = new sap.ui.model.json.JSONModel(selectedValues);
		sap.ui.getCore().setModel(selectedModel, "selectedValModel");

		//set merge model for deletes
		var oMergeModel = new sap.ui.model.json.JSONModel({ "hoursList": [] });
		sap.ui.getCore().setModel(oMergeModel, "mergeModel");

		//set model for saving when change dates
		var oDuplicateModel = new sap.ui.model.json.JSONModel({ "hoursList": [] });
		sap.ui.getCore().setModel(oDuplicateModel, "duplicateModel");

    	// set i18n model
		var sCurrentLocale = sap.ui.getCore().getConfiguration().getLanguage();
		var i18nModel = new sap.ui.model.resource.ResourceModel({bundleName:"i18n.timeTexts", bundleLocale: sCurrentLocale});
		sap.ui.getCore().setModel(i18nModel, "i18n");

    	// set device model
		var deviceModel = new sap.ui.model.json.JSONModel({
			isTouch : sap.ui.Device.support.touch,
			isNoTouch : !sap.ui.Device.support.touch,
//			isPhone : jQuery.device.is.phone,
//			isNoPhone : !jQuery.device.is.phone,
			windowHeight : $(window).height(),
			isPhone : true,
			isNoPhone : false
		});
		deviceModel.setDefaultBindingMode("OneWay");
		sap.ui.getCore().setModel(deviceModel, "device");

    },

    main : function() {
        // create app view and put to html root element
        var root = this.getRoot();
        sap.ui.jsview("app", "view.App").placeAt(root);
    }
});