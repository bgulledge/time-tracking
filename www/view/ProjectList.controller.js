jQuery.sap.require("sap.m.MessageBox");

sap.ui.controller("view.ProjectList", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf view.ProjectList
*/
	onInit: function() {


		// register for onBeforeShow events for 'pages'
		this.getView().addEventDelegate({
			onBeforeShow : jQuery.proxy(function (evt) {
				this.onBeforeShow(evt);
			}, this)
		});
	},

	onBeforeShow : function(evt) {
		if ("to" === evt.direction) {
			var theModel = sap.ui.getCore().getModel();
			theModel.read("/TimeTrackProjectSet", null, [], true,
    	    	function (response){
    		    	var oActivityModel = new sap.ui.model.json.JSONModel({ "projectList": response.results });
    		    	var oTable = sap.ui.getCore().byId("ProjectsListTable");
    		    	var oColListItem = sap.ui.getCore().byId("projectListItem");
    		    	oTable.setModel(oActivityModel);
    		    	oTable.bindItems("/projectList", oColListItem, new sap.ui.model.Sorter("Txtmd", false) );
    		    	spinner.stop();
    	    	},
    	    	function (response){
					spinner.stop();
					var bundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
    	    		sap.m.MessageBox.alert(bundle.getText("READ_PROJECT_ERROR"), {
    				    title: "Alert",
    				    onClose: null
    				});
    	    	}
        	);

		}
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf view.ProjectList
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf view.ProjectList
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf view.ProjectList
*/
//	onExit: function() {
//
//	}

	handleBackTriggered :  function (evt) {
		var bus = sap.ui.getCore().getEventBus();
		bus.publish("nav", "back", {
			id: "TimeList"
		});
		//window.history.back();
	},

	handleRowSelect :  function (evt) {
		spinner.spin(target);
		var selValModel = sap.ui.getCore().getModel("selectedValModel");
		selValModel.oData.projNum = evt.getSource().getBindingContext().getObject().Zproject;
		selValModel.oData.projName = evt.getSource().getBindingContext().getObject().Txtmd;

		var bus = sap.ui.getCore().getEventBus();
		bus.publish("nav", "to", {
			id: "ActivityList",
			data : {
				projectId : evt.getSource().getBindingContext().getObject().Zproject,
				projectName : evt.getSource().getBindingContext().getObject().Txtmd
			}
		});
	},

	handleSearchLiveChange :  function (oEvt) {
		// add filter for search
		var aFilters = [];
		var sQuery = oEvt.getSource().getValue();
		if (sQuery && sQuery.length > 0) {
			var filter = new  sap.ui.model.Filter("Txtmd", sap.ui.model.FilterOperator.Contains, sQuery);
			aFilters.push(filter);
		}

		// update list binding
		var list = sap.ui.getCore().byId("ProjectsListTable");
		var binding = list.getBinding("items");
		binding.filter(aFilters, "Application");
	}

});