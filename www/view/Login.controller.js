jQuery.sap.require("sap.m.MessageBox");

sap.ui.controller("view.Login", {

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
		//Sign out no check needed
		if (!evt.data.logout) {
			//Check if user already logged in on launch
			var sLoggedIn = checkUserLoggedIn();
			if(sLoggedIn) {
				var selectedModel = sap.ui.getCore().getModel("selectedValModel");
				selectedModel.oData.userName = sLoggedIn;
				var bus = sap.ui.getCore().getEventBus();
				bus.publish("nav", "to", {
					id: "TimeList",
					data : {
						login : true
					}
				});
			}
			else {
				var storePrefix = "timetrack-";
				var sId = decryptFromStorage(storePrefix+'userID');
				var sPassword = decryptFromStorage(storePrefix+'password');
				if (sId && sPassword) {
					this._logInSap(sId, sPassword, false);
				}
			}
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

	handleSettingsButtonPress : function (evt) {
		var selectedModel = sap.ui.getCore().getModel("selectedValModel");
		var bundle = sap.ui.getCore().getModel("i18n").getResourceBundle();

		var serverBox = sap.ui.getCore().byId("serverHBox");
		var serverText = sap.ui.getCore().byId("serverTypeText");
		var deviceBox = sap.ui.getCore().byId("deviceLabel");
		var deviceText = sap.ui.getCore().byId("deviceText");
		var oSignButton = sap.ui.getCore().byId("signInButton");

		switch(selectedModel.oData.server) {
			case "https://ecc-dev.newellrubbermaid.com":
			   	serverBox.setVisible(serverBox.getVisible() ? false : true);
				break;
			case "https://ecc-qa.newellrubbermaid.com":
				serverBox.setVisible(serverBox.getVisible() ? false : true);
				break;
			default:
				serverText.setText(bundle.getText("SYSTEM_PROD"));
				serverText.setVisible(deviceBox.getVisible() ? false : true);
		}
		deviceBox.setVisible(deviceBox.getVisible() ? false : true);
		deviceText.setVisible(deviceText.getVisible() ? false : true);

	},

	handleDropDownSelect : function (evt) {
		var selectedModel = sap.ui.getCore().getModel("selectedValModel");
		var serverSelect = sap.ui.getCore().byId("serverSelectDrop");
		var oServerText = sap.ui.getCore().byId("serverText");
		var bundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
		var sServerText = " " + bundle.getText("SERVER_LABEL");
		switch(serverSelect.getSelectedItem().getKey()) {
		    case "dev":
		        selectedModel.oData.server = "https://ecc-dev.newellrubbermaid.com";
		        break;
		    case "qa":
		        selectedModel.oData.server = "https://ecc-qa.newellrubbermaid.com";
		        break;
		    default:
		        selectedModel.oData.server = "https://ecc.newellrubbermaid.com";
		}

	},

	handleUserIdChange : function (evt) {
		var oUserInput = sap.ui.getCore().byId("userIdInput1");
		oUserInput.setValue(oUserInput.getValue().toUpperCase());

	},

	handleSubmitLogPress : function (evt) {
			var oUserInput = sap.ui.getCore().byId("userIdInput1");
			var oPassInput = sap.ui.getCore().byId("passwordInput1");
			var bundle = sap.ui.getCore().getModel("i18n").getResourceBundle();

			if (oUserInput.getValue() && oPassInput.getValue())
			{
				this._logInSap(oUserInput.getValue().toUpperCase(), oPassInput.getValue(), true);
			}
			else
			{
				sap.m.MessageBox.alert(bundle.getText("LOGIN_TOKEN_ERROR"), {
				    title: bundle.getText("ALERT"),
				    onClose: null
				});
			}
	},

	_logInSap :  function (userId, password, inputOpen) {
		var selectedModel = sap.ui.getCore().getModel("selectedValModel");
		selectedModel.oData.userName = userId;
		var theUrl = selectedModel.oData.server;
		var finalUrl = theUrl.slice(0,theUrl.indexOf("."));
		var newUrl = finalUrl + ".newellrubbermaid.com/irj/portal?login_submit=on&login_do_redirect=1&no_cert_storing=on&j_user="+userId+"&j_password="+password+"&j_authscheme=default&uidPasswordLogon=Log+on";
		var oUserInput = sap.ui.getCore().byId("userIdInput1");
		var oPassInput = sap.ui.getCore().byId("passwordInput1");

		spinner.spin(target);

		$.ajax({
			url: newUrl,
			type: 'GET',
			//async: false,
			success: function(data, status, xhr){
				var bundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
				//check return html for certain failed text
				if (data.search('authentication failed') >= 0) {
					spinner.stop();
					sap.m.MessageBox.alert(bundle.getText("LOGIN_TOKEN_ERROR"), {
						title: bundle.getText("ALERT"),
						onClose: null
					});

				}
				else {
					var oCheckBox = sap.ui.getCore().byId("logCheckBox1");
					//save log in info
					if (oCheckBox.getSelected()){
						var dToday = new Date();
						var sNumber = oUserInput.getValue()+ dToday.getFullYear() + dToday.getMonth() + dToday.getDate();
						encryptForStorage(sNumber, "number");
						var identifier = "timetrack-userID";
						encryptForStorage(oUserInput.getValue(), identifier);
						var identifier2 = "timetrack-password";
						encryptForStorage(oPassInput.getValue(), identifier2);

					}
					var selectedModel = sap.ui.getCore().getModel("selectedValModel");
					selectedModel.oData.userName = userId;

					//Save device id for messaging
					var sMessModelUrl = finalUrl + ".newellrubbermaid.com/sap/opu/odata/sap/ZGLO_BW_ODATA_TIMETRACKMSG_SRV/";
					var oMessageModel = new sap.ui.model.odata.ODataModel(sMessModelUrl, true);
					sap.ui.getCore().setModel(oMessageModel, "messagingModel");
					var sDeviceId = localStorage.getItem("timetrack-deviceId");
					var sTokenId = localStorage.getItem("timetrack-token");
					var bundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
					if(sDeviceId || sTokenId) {
						oDeviceToSend = {};
						oDeviceToSend.IUserid = userId;
						oDeviceToSend.IDeviceid = sDeviceId ? sDeviceId : sTokenId;
						//Device id means Android, token means iOS
						oDeviceToSend.IDevicetype = sDeviceId ? 'A' : 'I';
						oMessageModel.create("TimeTrackNotifySet",
							oDeviceToSend,
							null,
							function(oData, response) {

							},
							function(err) {
								sap.m.MessageBox.alert(bundle.getText("DEVICE_SAVE_ERROR"), {
									title: bundle.getText("ALERT"),
									onClose: null
								});
							}
						);
					}
					else {
						sap.m.MessageBox.alert(bundle.getText("NO_DEVICEID_ERROR"), {
							title: bundle.getText("ALERT"),
							onClose: null
						});
					}
					oPassInput.setValue("");
					//Navigate to time list even if device id save fails b/c will try next time log in
					var bus = sap.ui.getCore().getEventBus();
					bus.publish("nav", "to", {
						id: "TimeList",
						data : {
							login : true
						}
					});

					//Send Google Analytics
					ga('set', 'userId', userId);
					ga('send', 'pageview', {'page': '/index.html'});
				}
			},
			error: function(){
				var bundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
				sap.m.MessageBox.alert(bundle.getText("LOGIN_SITE_ERROR"), {
					title: bundle.getText("ALERT"),
					onClose: null
				});
				spinner.stop();
			}
		});
	}

});