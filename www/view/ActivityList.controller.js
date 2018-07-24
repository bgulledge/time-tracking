jQuery.sap.require("sap.m.MessageBox");

sap.ui.controller("view.ActivityList", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf view.ProjectList
*/
	onInit: function() {

//		activityData={"activityList":[{"activityName":"Activity Name 15"}, {"activityName":"Activity For everhyone to join"}, {"activityName":"Activity Name Touissant"}, {"activityName":"Activity Name Three"}, {"activityName":"ActivitytShort1"}, {"activityName":"ActivityShortest"}]};

		// register for onBeforeShow events for 'pages'
		this.getView().addEventDelegate({
			onBeforeShow : jQuery.proxy(function (evt) {
				this.onBeforeShow(evt);
			}, this)
		});
	},

	onBeforeShow : function(evt) {
		if ("to" === evt.direction) {
			var theFilter = "$filter=Projectval eq \'"+ evt.data.projectId+"\'";
			var theModel = sap.ui.getCore().getModel();

			theModel.read("/TimeTrackActivitySet", null, [theFilter], true,
    	    	function (response){
    		    	var oActivityModel = new sap.ui.model.json.JSONModel({ "activityList": response.results });
    		    	var oTable = sap.ui.getCore().byId("ActivityListTable");
    		    	var oColListItem = sap.ui.getCore().byId("activityListItem");
    		    	oTable.setModel(oActivityModel);
    				oTable.bindItems("/activityList", oColListItem, new sap.ui.model.Sorter("Txtmd", false) );
    				spinner.stop();
    	    	},
    	    	function (response){
					spinner.stop();
					var bundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
    	    		sap.m.MessageBox.alert(bundle.getText("READ_ACTIVITY_ERROR"), {
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
			id: "ProjectList"
		});
	},

	handleRowSelect :  function (evt) {
		spinner.spin(target);
		var selValModel = sap.ui.getCore().getModel("selectedValModel");
		selValModel.oData.actNum = evt.getSource().getBindingContext().getObject().Zpractivity;
		selValModel.oData.actName = evt.getSource().getBindingContext().getObject().Txtmd;
		selValModel.oData.phaseNum = evt.getSource().getBindingContext().getObject().Zprphase;
		selValModel.oData.rowsSaved = false;

		// create new entry
		var selValModel = sap.ui.getCore().getModel("selectedValModel");
		var model = sap.ui.getCore().getModel("hoursModel");
		var entries = model.oData.hoursList;
		var theWeek = "";
		var theUser = "";
		if (entries.length>0) {
			theWeek = entries[0].Calweek;
			theUser = entries[0].Username;
		}
		else {
			theWeek = selValModel.oData.weekYr;
			theUser = selValModel.oData.userName;
		}
		entry = {
			Id: entries.length,
			Calweek: theWeek,
			Username: theUser,
			Zphaseid: selValModel.oData.phaseNum,
			Zphasetxt: "",
			Zprojref: "",
			Zremark: "",
			Zproject: selValModel.oData.projNum,
			Zprojecttxt: selValModel.oData.projName,
			Zactivity: selValModel.oData.actNum,
			Zactivitytxt: selValModel.oData.actName,
			Zday1hr:'0.0',
			Zday2hr:'0.0',
			Zday3hr:'0.0',
			Zday4hr:'0.0',
			Zday5hr:'0.0',
			Zday6hr:'0.0',
			Zday7hr:'0.0',
			Ztotal:0,
			NewItem:true
		};
		entries[entries.length] = entry;
		model.oData.hoursList = entries;
		// update model
		model.setData(model.oData);

		var bus = sap.ui.getCore().getEventBus();
		bus.publish("nav", "to", {
			id: "TimeList",
			data : {
				login : false
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
		var list = sap.ui.getCore().byId("ActivityListTable");
		var binding = list.getBinding("items");
		binding.filter(aFilters, "Application");
	}

});