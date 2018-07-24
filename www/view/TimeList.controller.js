jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("utils.Dates");
sap.ui.controller("view.TimeList", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf timetracking.timeentry
*/
	onInit: function() {

		// set initial ui configuration model
		cfgModel = new sap.ui.model.json.JSONModel({});
		this.getView().setModel(cfgModel, "cfg");
		this._toggleCfgModel();

		// register for onBeforeShow events for 'pages'
		this.getView().addEventDelegate({
			onBeforeShow : jQuery.proxy(function (evt) {
				this.onBeforeShow(evt);
			}, this)
		});

		//Check if user already logged in
		var sLoggedIn = this._checkLoggedIn();
		if(sLoggedIn) {
			this._loadData();
		}
		else {
			var bus = sap.ui.getCore().getEventBus();
			bus.publish("nav", "to", {
				id: "Login"
			});
		}

		var bundle = sap.ui.getCore().getModel("i18n").getResourceBundle();

		window.sap.m.Input.prototype.onfocusin=function(e){
		    document.getElementById(this["sId"]+"-inner").setAttribute("onclick", "this.select()");
		};


		$( window ).resize(function() {
			//check if mobile
			var deviceModel = sap.ui.getCore().getModel("device");
			var deviceData = deviceModel.getData();
			if(deviceData.isPhone) {
				//Check if getting larger
				var currHeight = $(window).height();
				if ( deviceData.windowHeight > 0 && currHeight - deviceData.windowHeight > 0) {
					//rebind items
					var oPage = sap.ui.getCore().byId("page1");
					if (oPage) {
						oPage.removeAllContent();
						oPage.addContent(sap.ui.getCore().byId("CalHolder"));
						//timeout prevents keypad popping up
						setTimeout(function(){
							oPage.addContent(sap.ui.getCore().byId("Layout6"));
						}, 250);
		    		}
				}
				deviceData.windowHeight = currHeight;
			}
    		});

    		sap.ui.getCore().attachValidationError(
			function(oEvent) {
				var oElement = oEvent.getParameter("element");
				//var sProperty = oEvent.getParameter('property');
				var oValue = oEvent.getParameter('newValue');
				//var oType = oEvent.getParameter('type');
				//var oOldValue = oEvent.getParameter('oldValue');

				var sMsg = oValue + " "+ bundle.getText("HOURS_ERROR");

				sap.m.MessageBox.alert(sMsg, {
				    title: bundle.getText("ALERT"),                        // default
				    onClose: null                         // default
				});

				if (oElement.setValueState) {
					oElement.setValueState(sap.ui.core.ValueState.Error);
					var oSaveButton = sap.ui.getCore().byId("saveButton");
					oSaveButton.setEnabled(false);
				}

				// reset to old value
				//oElement.prop(sProperty, oOldValue);
			}
    		);

    		sap.ui.getCore().attachValidationSuccess(
			function(oEvent) {
				var oElement = oEvent.getParameter("element");
				oElement.setValueState(sap.ui.core.ValueState.None);
				var oSaveButton = sap.ui.getCore().byId("saveButton");
				oSaveButton.setEnabled(true);
			}
    		);

    		sap.ui.getCore().attachParseError(
			function(oEvent) {
				var oElement = oEvent.getParameter("element");
				var sProperty = oEvent.getParameter('property');
				var oValue = oEvent.getParameter('newValue');
				var oType = oEvent.getParameter('type');
				var oOldValue = oEvent.getParameter('oldValue');

				if (oElement.setValueState) {
					oElement.setValueState(sap.ui.core.ValueState.Error);
					var oSaveButton = sap.ui.getCore().byId("saveButton");
					oSaveButton.setEnabled(false);
				}
			}
    		);
	},

	onBeforeShow : function(evt) {
		if(evt.data.login) {
			this._loadData();
		}
		else {
			//Decide to add table or tile
			var oHoursModel = sap.ui.getCore().getModel("hoursModel");
			var oPage = sap.ui.getCore().byId("page1");
			oPage.removeContent(1);
			sap.ui.getCore().byId("addButton").setEnabled(true);
			sap.ui.getCore().byId("saveButton").setEnabled(true);
			if(oHoursModel.oData.hoursList.length>0) {
				var oMobileLayout = sap.ui.getCore().byId("Layout6");
				oPage.addContent(oMobileLayout);
			}
			else {
				var oTile = sap.ui.getCore().byId("addVBox");
				oPage.addContent(oTile);
			}

		}
		spinner.stop();
	},

	_toggleCfgModel : function () {
		var cfgModel = this.getView().getModel("cfg");
		var data = cfgModel.getData();
		var dataNoSetYet = !data.hasOwnProperty("inDelete");
		var inDelete = (dataNoSetYet) ? true : data.inDelete;
		var changeNoSetYet = !data.hasOwnProperty("changeHours");
		var changeHours = (changeNoSetYet) ? true : data.changeHours;
		var buttonNoSetYet = !data.hasOwnProperty("useButtons");
		var useButtons = (buttonNoSetYet) ? true : data.useButtons;
		cfgModel.setData({
			inDelete : !inDelete,
			notInDelete : inDelete,
			listMode : (!inDelete) ? "Delete" : "SingleSelectMaster",
			listItemType : (!inDelete) ? "Inactive" : (jQuery.device.is.phone) ? "Active": "Inactive",
			changeHours : changeHours,
			useButtons : useButtons
		});
	},

	_toggleButtons : function() {
		var cfgModel = this.getView().getModel("cfg");
		var theData = cfgModel.getData();
		theData.useButtons = !theData.useButtons;
		cfgModel.setData(theData);

		var oLogOutButton = sap.ui.getCore().byId("logOutButton");
		oLogOutButton.setEnabled(!oLogOutButton.getEnabled());
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf timetracking.timeentry
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf timetracking.timeentry
*/
//	onAfterRendering: function() {
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf timetracking.timeentry
*/
//	onExit: function() {
//
//	},

	handleAddProjectPress :  function (evt) {
		//Start spinner here and project list controller closes it
		spinner.spin(target);
		var bus = sap.ui.getCore().getEventBus();
		bus.publish("nav", "to", {
			id: "ProjectList"
		});
	},

	handlePlusImagePress :  function (evt) {
		//Start spinner here and project list controller closes it
		spinner.spin(target);
		var bus = sap.ui.getCore().getEventBus();
		bus.publish("nav", "to", {
			id: "ProjectList"
		});
	},

	handleListSwipe : function (evt) {
		var theItem = evt.getParameter('listItem');
		sap.ui.getCore().byId("idTimeValuesTable").setSelectedItem(theItem);
	},

	handleAddCommentPress : function (evt) {
		var oCommentDialog = sap.ui.getCore().byId("commentDialog");
		var bundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
		var oTable= sap.ui.getCore().byId("idTimeValuesTable");
		var oTheItem = oTable.getSelectedItem();
		var theIndex = oTable.indexOfItem(oTheItem);
		if (theIndex > -1) {
			var oHoursModel = sap.ui.getCore().getModel("hoursModel");
			var oCommentTextArea = sap.ui.getCore().byId("commentTextArea");
			oCommentTextArea.setValue(oHoursModel.oData.hoursList[theIndex].Zremark);

			var oMaxCharsText = sap.ui.getCore().byId("maxCharsText");
			var iLength = oCommentTextArea.getValue()?oCommentTextArea.getValue().length:0;
			var iTotal = 50;
			var iLeft = iTotal - iLength;
			var bundle = this.getView().getModel("i18n").getResourceBundle();
			oMaxCharsText.setText(iLeft+' '+ bundle.getText("CHAR_REMAIN"));

			oCommentDialog.open();
		}
		else {
			sap.m.MessageBox.alert(bundle.getText("ROW_SELECT_ERROR"), {
			    title: bundle.getText("ALERT"),
			    onClose: null
			});
		}

	},

	handleEditCommentPress : function (evt) {

		var oCommentDialog = sap.ui.getCore().byId("commentDialog");
		var theIndex = evt.getParameter("id").slice(-1);
		sap.ui.getCore().byId("idTimeValuesTable").setSelectedItemById('timeListItem-idTimeValuesTable-'+theIndex);
		var oHoursModel = sap.ui.getCore().getModel("hoursModel");
		var oCommentTextArea = sap.ui.getCore().byId("commentTextArea");
		oCommentTextArea.setValue(oHoursModel.oData.hoursList[theIndex].Zremark);

		var oMaxCharsText = sap.ui.getCore().byId("maxCharsText");
		var iLength = oCommentTextArea.getValue()?oCommentTextArea.getValue().length:0;
		var iTotal = 50;
		var iLeft = iTotal - iLength;
		var bundle = this.getView().getModel("i18n").getResourceBundle();
		oMaxCharsText.setText(iLeft+' '+ bundle.getText("CHAR_REMAIN"));

		oCommentDialog.open();

	},

	handleCommentChange : function (evt) {
		var oMaxCharsText = sap.ui.getCore().byId("maxCharsText");
		var iLength = evt.getSource().getValue()?evt.getSource().getValue().length:0;
		var iTotal = 50;
		var iLeft = iTotal - iLength;
		var bundle = this.getView().getModel("i18n").getResourceBundle();
		oMaxCharsText.setText(iLeft+' '+ bundle.getText("CHAR_REMAIN"));
	},

	handleSaveCommentPress : function (evt) {
		var oHoursModel = sap.ui.getCore().getModel("hoursModel");
		var oCommentTextArea = sap.ui.getCore().byId("commentTextArea");
		var oTable= sap.ui.getCore().byId("idTimeValuesTable");
		var oTheItem = oTable.getSelectedItem();
		var theIndex = oTable.indexOfItem(oTheItem);
		oHoursModel.oData.hoursList[theIndex].Zremark =oCommentTextArea.getValue();
		oHoursModel.setData(oHoursModel.oData);
		//Unselect item so doesn't continue to change
		oTable.setSelectedItem(oTheItem, false);

		var oCommentDialog = sap.ui.getCore().byId("commentDialog");
		oCommentDialog.close();
		var selValModel = sap.ui.getCore().getModel("selectedValModel");
		selValModel.oData.rowsSaved = false;
	},

	handleCancelCommentPress : function (evt) {
		var oCommentDialog = sap.ui.getCore().byId("commentDialog");
		oCommentDialog.close();
	},

	handleSaveButtonPress :  function (evt) {
		var oHoursModel = sap.ui.getCore().getModel("hoursModel");
		this._toggleButtons();
		this._checkDuplicateData(oHoursModel);
	},

	_checkDuplicateData :  function (oHoursModel) {
		var tempHoursModel = oHoursModel.oData.hoursList.slice();


		//Check for duplicates
		var duplicates = tempHoursModel.some(function(element, index, array) {
			for (var count = index+1 ; count < array.length ; count ++) {
				var secondHour = array[count];
				if (element.Zproject===secondHour.Zproject && element.Zactivity===secondHour.Zactivity && element.Zremark===secondHour.Zremark) {
					return true;
				}
			}
		});

		if (duplicates) {
			var bundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
			sap.ui.getCore().getEventBus().publish("nav", "virtual");
			sap.m.MessageBox.show(
				bundle.getText("CONFIRM_MERGE"),
				null,
				bundle.getText("MERGE_HEADER"),
				[sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				jQuery.proxy(function (oAction) {
					// remove virtual state if dialog not closed by browser history
					if (oAction) {
						sap.ui.getCore().getEventBus().publish("nav", "back");
					}
					if (sap.m.MessageBox.Action.YES === oAction) {
						for (var i = 0 ; i < tempHoursModel.length ; i ++) {
							var currHours = tempHoursModel[i];
							for (var j =i+1 ; j < tempHoursModel.length ; j ++) {
								var nextHours = tempHoursModel[j];
								duplicates = false;
								if (nextHours) {
									duplicates = (currHours.Zproject===nextHours.Zproject && currHours.Zactivity===nextHours.Zactivity && currHours.Zremark===nextHours.Zremark);
									if(duplicates) {
										//change to integer for addition
										currHours.Zday1hr = (parseFloat(currHours.Zday1hr) + parseFloat(nextHours.Zday1hr)).toString();
										currHours.Zday2hr = (parseFloat(currHours.Zday2hr) + parseFloat(nextHours.Zday2hr)).toString();
										currHours.Zday3hr = (parseFloat(currHours.Zday3hr) + parseFloat(nextHours.Zday3hr)).toString();
										currHours.Zday4hr = (parseFloat(currHours.Zday4hr) + parseFloat(nextHours.Zday4hr)).toString();
										currHours.Zday5hr = (parseFloat(currHours.Zday5hr) + parseFloat(nextHours.Zday5hr)).toString();
										currHours.Zday6hr = (parseFloat(currHours.Zday6hr) + parseFloat(nextHours.Zday6hr)).toString();
										currHours.Zday7hr = (parseFloat(currHours.Zday7hr) + parseFloat(nextHours.Zday7hr)).toString();
										currHours.Ztotal = parseFloat(currHours.Zday1hr) + parseFloat(currHours.Zday2hr)+
												parseFloat(currHours.Zday3hr)+parseFloat(currHours.Zday4hr)+parseFloat(currHours.Zday5hr)+
												parseFloat(currHours.Zday6hr)+ parseFloat(currHours.Zday7hr);
										tempHoursModel.splice(j,1);

										//add row to delete if not new
										if(!nextHours.NewItem) {
											var oMergeModel = sap.ui.getCore().getModel("mergeModel");
											oMergeModel.oData.hoursList.push(nextHours);
											oMergeModel.setData(oMergeModel.oData);
										}
									}
								}
							}
						}
						oHoursModel.oData.hoursList = tempHoursModel;
						oHoursModel.setData(oHoursModel.getData());

						var oPage = sap.ui.getCore().byId("page1");
						if (oPage) {
							oPage.removeContent(sap.ui.getCore().byId("Layout6"));
							oPage.addContent(sap.ui.getCore().byId("Layout6"));
		    				}

						this._saveHoursData(oHoursModel);
					}
					if (sap.m.MessageBox.Action.NO === oAction) {
						this._saveHoursData(oHoursModel);
					}
				}, this)
			);
		}
		else {
			this._saveHoursData(oHoursModel);
		}
	},

	_saveHoursData :  function (oHoursModel) {
		var oModel = sap.ui.getCore().getModel();
		var selectedModel = sap.ui.getCore().getModel("selectedValModel");
		var theTarget = "";

		//create an array of batch changes and save
		var batchChanges = [];
		for (var i = 0 ; i < oHoursModel.oData.hoursList.length ; i ++) {
			var hours = oHoursModel.oData.hoursList[i];
			hoursToSend = {};
			hoursToSend.Calweek = hours.Calweek;
			hoursToSend.Username = hours.Username;
			hoursToSend.Zphaseid = hours.Zphaseid;
			hoursToSend.Zphasetxt = hours.Zphasetxt;
			hoursToSend.Zprojref = hours.Zprojref;
			hoursToSend.Zremark = hours.Zremark;
			hoursToSend.Zproject = hours.Zproject;
			hoursToSend.Zprojecttxt = hours.Zprojecttxt;
			hoursToSend.Zactivity = hours.Zactivity;
			hoursToSend.Zactivitytxt = hours.Zactivitytxt;
			hoursToSend.Zday1hr = hours.Zday1hr.toString();
			hoursToSend.Zday2hr = hours.Zday2hr.toString();
			hoursToSend.Zday3hr = hours.Zday3hr.toString();
			hoursToSend.Zday4hr = hours.Zday4hr.toString();
			hoursToSend.Zday5hr = hours.Zday5hr.toString();
			hoursToSend.Zday6hr = hours.Zday6hr.toString();
			hoursToSend.Zday7hr = hours.Zday7hr.toString();
			if(hours.NewItem) {
				batchChanges.push( oModel.createBatchOperation("TimeTrackDataSet", "POST", hoursToSend) );
			}
			else {
				theTarget = "TimeTrackDataSet(Username=\'"+ hours.Username+"\',Calweek=\'" + hours.Calweek+"\')";
			    batchChanges.push( oModel.createBatchOperation(theTarget, "PUT", hoursToSend) );
			}
		}
		//add deletes from merge
		var oMergeModel = sap.ui.getCore().getModel("mergeModel");
		for (var i = 0 ; i < oMergeModel.oData.hoursList.length ; i ++) {
			var oDelHours = oMergeModel.oData.hoursList[i];
			hoursToSend = {};
			hoursToSend.Calweek = oDelHours.Calweek;
			hoursToSend.Username = oDelHours.Username;
			hoursToSend.Zphaseid = oDelHours.Zphaseid;
			hoursToSend.Zphasetxt = oDelHours.Zphasetxt;
			hoursToSend.Zprojref = oDelHours.Zprojref;
			hoursToSend.Zremark = oDelHours.Zremark;
			hoursToSend.Zproject = oDelHours.Zproject;
			hoursToSend.Zprojecttxt = oDelHours.Zprojecttxt;
			hoursToSend.Zactivity = oDelHours.Zactivity;
			hoursToSend.Zactivitytxt = oDelHours.Zactivitytxt;
			hoursToSend.Zday1hr = oDelHours.Zday1hr.toString();
			hoursToSend.Zday2hr = oDelHours.Zday2hr.toString();
			hoursToSend.Zday3hr = oDelHours.Zday3hr.toString();
			hoursToSend.Zday4hr = oDelHours.Zday4hr.toString();
			hoursToSend.Zday5hr = oDelHours.Zday5hr.toString();
			hoursToSend.Zday6hr = oDelHours.Zday6hr.toString();
			hoursToSend.Zday7hr = oDelHours.Zday7hr.toString();
			hoursToSend.DelInd = "X";
			theTarget = "TimeTrackDataSet(Username=\'"+ oDelHours.Username+"\',Calweek=\'" + oDelHours.Calweek+"\')";
			batchChanges.push( oModel.createBatchOperation(theTarget, "PUT", hoursToSend) );
		}

		if(batchChanges.length > 0) {
			var oDuplicateDialog = sap.ui.getCore().byId("duplicateDialog");
			that = this;
			//Start spinner here and reload closes it
			spinner.spin(target);
			oModel.addBatchChangeOperations(batchChanges);
			oModel.refreshSecurityToken();
			var bundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
			//submit changes and refresh the table and display message
			var fCallback = this._reloadData;
			oModel.submitBatch(function(oData, oResponse, aErrorResponses) {
				if (aErrorResponses.length > 0)	{
					spinner.stop();
					that._toggleButtons();
					var sErrorTxt = bundle.getText("SAVE_HOURS_ERROR");
					sap.m.MessageBox.alert(sErrorTxt, {
						title: bundle.getText("ALERT"),
						onClose: null
					});
				}
				else {
					oModel.refresh();
					sap.m.MessageToast.show(bundle.getText("SAVE_MESSAGE"));
					var selValModel = sap.ui.getCore().getModel("selectedValModel");
					selValModel.oData.rowsSaved = true;
					that._toggleButtons();

					if(oDuplicateDialog.data('logout'))	{
						that._logOffSap();
						oDuplicateDialog.data(null);
					}
					else {
						//Reload rows
						fCallback(selValModel.oData.workDate);
					}

					//clear merge model
					oMergeModel.oData.hoursList = [];
					oMergeModel.setData(oMergeModel.oData);
				}
			},
			function(err) {
				spinner.stop();
				that._toggleButtons();
				sap.m.MessageBox.alert(bundle.getText("SAVE_HOURS_ERROR"), {
					title: bundle.getText("ALERT"),
					onClose: null
				});
			});

		}
		else {
			this._toggleButtons();
		}
	},

	handleDeleteNoPress : function(){
		var oDeleteDialog = sap.ui.getCore().byId("deleteDialog");
		oDeleteDialog.close();
		var oSelItem = sap.ui.getCore().byId("idTimeValuesTable").getSelectedItem();
		//Unselect item so doesn't continue to delete
		sap.ui.getCore().byId("idTimeValuesTable").setSelectedItem(oSelItem, false);
	},

	handleDeleteButtonPress :  function (evt) {
		//var oActionSheet = sap.ui.getCore().byId("actionSheet");
		//oActionSheet.close();
		//this._toggleCfgModel();

		var sNumber = evt.getParameter("id").slice(-1);
		sap.ui.getCore().byId("idTimeValuesTable").setSelectedItemById('timeListItem-idTimeValuesTable-'+sNumber);

		var bundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
		var oDeleteDialog = sap.ui.getCore().byId("deleteDialog");
		oDeleteDialog.removeAllContent();
		var oSelItemCtxt = sap.ui.getCore().byId("idTimeValuesTable").getSelectedItem().getBindingContext().getObject();
		var sText = bundle.getText('CONFIRM_DELETE')+ ' '+oSelItemCtxt.Zprojecttxt+' '+oSelItemCtxt.Zactivitytxt+'?';
		var oDelText = new sap.m.Text("deleteText", {text : sText}).addStyleClass("textPadding");
		oDeleteDialog.addContent(oDelText);
		oDeleteDialog.open();
	},

	handleDeletePress :  function (evt) {

			var bundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
			var oDeleteDialog = sap.ui.getCore().byId("deleteDialog");
			oDeleteDialog.removeAllContent();
			var oSelItemCtxt = sap.ui.getCore().byId("idTimeValuesTable").getSelectedItem().getBindingContext().getObject();
			var sText = bundle.getText('CONFIRM_DELETE')+ ' '+oSelItemCtxt.Zprojecttxt+' '+oSelItemCtxt.Zactivitytxt+'?';
			var oDelText = new sap.m.Text("deleteText", {text : sText}).addStyleClass("textPadding");
			oDeleteDialog.addContent(oDelText);
			oDeleteDialog.open();
	},

	handleEntryListDelete : function (evt) {

		var oDeleteDialog = sap.ui.getCore().byId("deleteDialog");
		oDeleteDialog.close();

		spinner.spin(target);

		var oSelItem = sap.ui.getCore().byId("idTimeValuesTable").getSelectedItem();
		var entryId = oSelItem.getBindingContext().getObject().Id;
		var entry = oSelItem.getBindingContext().getObject();
		//Unselect item so doesn't continue to delete
		sap.ui.getCore().byId("idTimeValuesTable").setSelectedItem(oSelItem, false);

		var bundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
		var selValModel = sap.ui.getCore().getModel("selectedValModel");
		if(!entry.NewItem) {
			//Update backend
			hoursToSend = {};
			hoursToSend.Calweek = entry.Calweek;
			hoursToSend.Username = entry.Username;
			hoursToSend.Zphaseid = entry.Zphaseid;
			hoursToSend.Zphasetxt = entry.Zphasetxt;
			hoursToSend.Zprojref = entry.Zprojref;
			hoursToSend.Zremark = entry.Zremark;
			hoursToSend.Zproject = entry.Zproject;
			hoursToSend.Zprojecttxt = entry.Zprojecttxt;
			hoursToSend.Zactivity = entry.Zactivity;
			hoursToSend.Zactivitytxt = entry.Zactivitytxt;
			hoursToSend.Zday1hr = entry.Zday1hr.toString();
			hoursToSend.Zday2hr = entry.Zday2hr.toString();
			hoursToSend.Zday3hr = entry.Zday3hr.toString();
			hoursToSend.Zday4hr = entry.Zday4hr.toString();
			hoursToSend.Zday5hr = entry.Zday5hr.toString();
			hoursToSend.Zday6hr = entry.Zday6hr.toString();
			hoursToSend.Zday7hr = entry.Zday7hr.toString();
			hoursToSend.DelInd = "X";
			var oModel = sap.ui.getCore().getModel();
			//error handling
			var userId = entry.Username;
			var theTarget = "TimeTrackDataSet(Username=\'"+ userId+"\',Calweek=\'" + entry.Calweek+"\')";
			oModel.update(theTarget, hoursToSend, null,
				function() {
						//update model
						var model = sap.ui.getCore().getModel("hoursModel");
						var newEntries = jQuery.grep(model.oData.hoursList, function (entry) {
							var keep = (entry.Id !== entryId);
							if (!keep) {
								model.oData.ZtotalHours = parseFloat(model.oData.ZtotalHours) - entry.Ztotal;
							}
							return keep;
						});
						model.oData.hoursList = newEntries;
						model.setData(model.getData());
						var oPage = sap.ui.getCore().byId("page1");
						if (oPage) {
							oPage.removeContent(sap.ui.getCore().byId("Layout6"));
							oPage.addContent(sap.ui.getCore().byId("Layout6"));
						}
						selValModel.oData.rowsSaved = true;
						spinner.stop();
						sap.m.MessageToast.show(bundle.getText("DELETE_MESSAGE"));
					},
				function(err) {
					spinner.stop();
					sap.m.MessageBox.alert(bundle.getText("DELETE_HOURS_ERROR"), {
						title: bundle.getText("ALERT"),
						onClose: null
					});
				}
			);
		}
		else {
			//update model
			var model = sap.ui.getCore().getModel("hoursModel");
			var newEntries = jQuery.grep(model.oData.hoursList, function (entry) {
				var keep = (entry.Id !== entryId);
				if (!keep) {
					model.oData.ZtotalHours = parseFloat(model.oData.ZtotalHours) - entry.Ztotal;
				}
				return keep;
			});
			model.oData.hoursList = newEntries;
			model.setData(model.getData());
			spinner.stop();
			sap.m.MessageToast.show(bundle.getText("DELETE_MESSAGE"));
		}

	},

	handleDoneButtonPress : function (evt) {
		this._toggleCfgModel();
	},

	handleHourChange : function (evt) {
		var model = sap.ui.getCore().getModel("hoursModel");
		var total = 0;
		for (var i = 0 ; i < model.oData.hoursList.length ; i ++) {
			var hours = model.oData.hoursList[i];
			sum = parseFloat(hours.Zday1hr) + parseFloat(hours.Zday2hr) + parseFloat(hours.Zday3hr) + parseFloat(hours.Zday4hr) + parseFloat(hours.Zday5hr) + parseFloat(hours.Zday6hr) + parseFloat(hours.Zday7hr);
	    	hours.Ztotal = sum;
	    	model.oData.hoursList[i] = hours;
	    	total += sum;
		}
		var theTotal = model.oData.ZtotalHours;
		theTotal = total.toString();
		model.oData.ZtotalHours = theTotal;
		// update model
		model.setData(model.oData);

		var selValModel = sap.ui.getCore().getModel("selectedValModel");
		selValModel.oData.rowsSaved = false;
	},

	handleTimeChange : function (evt) {
		var model = sap.ui.getCore().getModel("hoursModel");
		var oInput = evt.getSource();
		if(!sInputVal.getValue()) oInput.setValue(model.oData.hoursList[0]);

	},

	handleDateChange : function (evt) {
		var bundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
		var selValModel = sap.ui.getCore().getModel("selectedValModel");
		var oCurrentHoursModel = sap.ui.getCore().getModel("hoursModel");
		var oDuplicateModel = sap.ui.getCore().getModel("duplicateModel");
		oDuplicateModel.oData.hoursList = oCurrentHoursModel.oData.hoursList;
		oDuplicateModel.setData(oDuplicateModel.oData);
		if (!selValModel.oData.rowsSaved) {
			var oDuplicateDialog = sap.ui.getCore().byId("duplicateDialog");
			oDuplicateDialog.open();
		}
		else {
			//Start spinner here and reload closes it
			spinner.spin(target);
		}
		var navToDate = new Date(evt.getSource().getCurrentDate());
		selValModel.oData.workDate = navToDate;
		this._reloadData(navToDate);
	},

	handleSaveHoursPress : function (evt) {
		var oDuplicateDialog = sap.ui.getCore().byId("duplicateDialog");
		oDuplicateDialog.close();
		var oDuplicateModel = sap.ui.getCore().getModel("duplicateModel");
		this._checkDuplicateData(oDuplicateModel);
	},

	handleCancelHoursPress : function (evt) {
		var oDuplicateDialog = sap.ui.getCore().byId("duplicateDialog");
		oDuplicateDialog.close();
		var selValModel = sap.ui.getCore().getModel("selectedValModel");
		selValModel.oData.rowsSaved = true;
		if(oDuplicateDialog.data('logout')) {
			this._logOffSap();
			oDuplicateDialog.data(null);
		}
	},

	handleSubmitLogPress : function (evt) {
		var oUserInput = sap.ui.getCore().byId("userIdInput");
		var oPassInput = sap.ui.getCore().byId("passwordInput");
		var bundle = sap.ui.getCore().getModel("i18n").getResourceBundle();

		if (oUserInput.getValue() && oPassInput.getValue())
		{
			this._logInSap(oUserInput.getValue().toUpperCase(), oPassInput.getValue(), true);
			oPassInput.setValue("");
		}
		else
		{
			sap.m.MessageBox.alert(bundle.getText("LOGIN_TOKEN_ERROR"), {
			    title: bundle.getText("ALERT"),
			    onClose: null
			});
		}

	},

	handleMenuButtonPress : function (evt) {
		var oButton = evt.getSource();
		sap.ui.getCore().byId("actionSheet").openBy(oButton);
	},

	handleLogOutButtonPress : function (evt) {
		//08182016 check row changes
		var selValModel = sap.ui.getCore().getModel("selectedValModel");
		var oCurrentHoursModel = sap.ui.getCore().getModel("hoursModel");
		var oDuplicateModel = sap.ui.getCore().getModel("duplicateModel");
		if(oCurrentHoursModel) {
			oDuplicateModel.oData.hoursList = oCurrentHoursModel.oData.hoursList;
			oDuplicateModel.setData(oDuplicateModel.oData);
			if (!selValModel.oData.rowsSaved) {
				var oDuplicateDialog = sap.ui.getCore().byId("duplicateDialog");
				oDuplicateDialog.data('logout',true);
				oDuplicateDialog.open();
			}
			else {
				this._logOffSap();
			}
		}
		else {
			this._logOffSap();
		}
	},

	_checkLoggedIn : function () {
		return checkUserLoggedIn();
	},

	_logOffSap : function () {
		spinner.spin(target);
		var bundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
		var selectedModel = sap.ui.getCore().getModel("selectedValModel");
		var theUrl = selectedModel.oData.server;
		var finalUrl = theUrl.slice(0,theUrl.indexOf("."));
		var newUrl = finalUrl + ".newellrubbermaid.com/dc~global~timetrk~webmod/logOff.jsp";

		$.ajax({
			url: newUrl,
			type: 'GET',
			async: false,
	        success: function (data, status, xhr){
				var oTable = sap.ui.getCore().byId("idTimeValuesTable");
				oTable.unbindItems();
				localStorage.removeItem("timetrack-userID");
				localStorage.removeItem("timetrack-password");
				var oPage = sap.ui.getCore().byId("page1");
				if (oPage) {
					oPage.removeContent(sap.ui.getCore().byId("Layout6"));
					oPage.addContent(sap.ui.getCore().byId("Layout6"));
				}

				spinner.stop();
				var bus = sap.ui.getCore().getEventBus();
				bus.publish("nav", "to", {
					id: "Login",
				data : {
					logout : true
				}
				});
			},
			error: function(){
				spinner.stop();
				sap.m.MessageBox.alert(bundle.getText("LOGIN_SITE_ERROR"), {
				    title: bundle.getText("ALERT"),
				    onClose: null
				});
			}
	    });


	},

	_loadData :  function () {
		var selectedModel = sap.ui.getCore().getModel("selectedValModel");
		var userId = selectedModel.oData.userName;
		var theUrl = selectedModel.oData.server;
		var finalUrl = theUrl.slice(0,theUrl.indexOf("."));
		var modelUrl = finalUrl + ".newellrubbermaid.com/sap/opu/odata/sap/ZGLO_BW_ODATA_TIMETRACK_SRV/";
		var model = new sap.ui.model.odata.ODataModel(modelUrl, true);
		sap.ui.getCore().setModel(model);
		var today = new Date();
		//Need this in case log out and back in
		var oCalendar = sap.ui.getCore().byId("theCal");
		oCalendar.setCurrentDate(today.toDateString());

		var dateFilter = "/TimeTrackDateSet(Date=datetime\'"+today.toJSON().slice(0,-5)+"\')";
		model.read(dateFilter, null, [], true,
			function (response){
				var selectedModel = sap.ui.getCore().getModel("selectedValModel");
				selectedModel.oData.weekYr = response.Week.slice(4)+response.Week.slice(0,4);
				var sWeekYr = selectedModel.oData.weekYr;

				var theFilter = "$filter=Username eq \'"+ userId+"\' and Calweek eq \'" + sWeekYr+"\'";
				model.read("/TimeTrackDataSet", null, [theFilter], true,
					function (response){
						var oHoursModel = new sap.ui.model.json.JSONModel({ "hoursList": response.results });
						var total = 0;
						for (var i = 0 ; i < oHoursModel.oData.hoursList.length ; i ++) {
						var hours = oHoursModel.oData.hoursList[i];
						sum = parseFloat(hours.Zday1hr) + parseFloat(hours.Zday2hr) + parseFloat(hours.Zday3hr) + parseFloat(hours.Zday4hr) + parseFloat(hours.Zday5hr) + parseFloat(hours.Zday6hr) + parseFloat(hours.Zday7hr);
						hours.Ztotal = sum;
						hours.Id = i;
						hours.NewItem = false;
						oHoursModel.oData.hoursList[i] = hours;
						total += sum;
						}
						oHoursModel.oData.ZtotalHours = total.toString();
						sap.ui.getCore().setModel(oHoursModel, "hoursModel");

						var oTable = sap.ui.getCore().byId("idTimeValuesTable");
						var oColListItem = sap.ui.getCore().byId("timeListItem");
						oTable.setModel(oHoursModel);
						oTable.bindItems("/hoursList", oColListItem);//, new sap.ui.model.Sorter("Zprojecttxt", false) );

						//Decide to add table or tile
						var oPage = sap.ui.getCore().byId("page1");
						oPage.removeContent(1);

						sap.ui.getCore().byId("addButton").setEnabled(true);
						sap.ui.getCore().byId("saveButton").setEnabled(true);
						if(oHoursModel.oData.hoursList.length>0) {
							var oMobileLayout = sap.ui.getCore().byId("Layout6");
							oPage.addContent(oMobileLayout);
						}
						else {
							var oTile = sap.ui.getCore().byId("addVBox");
							oPage.addContent(oTile);
						}

					},
					function (response){
						var bundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
						sap.m.MessageBox.alert(bundle.getText("READ_HOURS_ERROR"), {
								title: bundle.getText("ALERT"),
								onClose: null
							});
					}
				);

			},
			function (response){
				var bundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
				sap.m.MessageBox.alert(bundle.getText("READ_DATE_ERROR"), {
						title: bundle.getText("ALERT"),
						onClose: null
					});
			}
		);
	},

	_reloadData :  function (dDate) {
		var target = document.getElementById('spin')
		var selectedModel = sap.ui.getCore().getModel("selectedValModel");
		var userId = selectedModel.oData.userName;
		var model = sap.ui.getCore().getModel();

		var dateFilter = "/TimeTrackDateSet(Date=datetime\'"+dDate.toJSON().slice(0,-5)+"\')";
		model.read(dateFilter, null, [], true,
			function (response){
				var selectedModel = sap.ui.getCore().getModel("selectedValModel");
				selectedModel.oData.weekYr = response.Week.slice(4)+response.Week.slice(0,4);
				var sWeekYr = selectedModel.oData.weekYr;

				var theFilter = "$filter=Username eq \'"+ userId+"\' and Calweek eq \'" + sWeekYr+"\'";
				model.read("/TimeTrackDataSet", null, [theFilter], true,
					function (response){
						spinner.stop();
						var oHoursModel = sap.ui.getCore().getModel("hoursModel");
						oHoursModel.oData.hoursList = response.results;
						var total = 0;
						for (var i = 0 ; i < oHoursModel.oData.hoursList.length ; i ++) {
							var hours = oHoursModel.oData.hoursList[i];
							sum = parseFloat(hours.Zday1hr) + parseFloat(hours.Zday2hr) + parseFloat(hours.Zday3hr) + parseFloat(hours.Zday4hr) + parseFloat(hours.Zday5hr) + parseFloat(hours.Zday6hr) + parseFloat(hours.Zday7hr);
							hours.Ztotal = sum;
							hours.Id = i;
							hours.NewItem = false;
							oHoursModel.oData.hoursList[i] = hours;
							total += sum;
						}
						oHoursModel.oData.ZtotalHours = total.toString();
						oHoursModel.setData(oHoursModel.getData());
						var oPage = sap.ui.getCore().byId("page1");
						if (oPage) {
							oPage.removeContent(1);
							sap.ui.getCore().byId("addButton").setEnabled(true);
							sap.ui.getCore().byId("saveButton").setEnabled(true);
							if(oHoursModel.oData.hoursList.length>0) {
								var oMobileLayout = sap.ui.getCore().byId("Layout6");
								oPage.addContent(oMobileLayout);
							}
							else {
								var oTile = sap.ui.getCore().byId("addVBox");
								oPage.addContent(oTile);
							}

						}
					},
					function (response){
						spinner.stop();
						var bundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
						sap.m.MessageBox.alert(bundle.getText("READ_HOURS_ERROR"), {
								title: bundle.getText("ALERT"),
								onClose: null
							});
					}
				);
			},
			function (response){
				var bundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
				sap.m.MessageBox.alert(bundle.getText("READ_DATE_ERROR"), {
						title: bundle.getText("ALERT"),
						onClose: null
					});
			}
		);
	}


});