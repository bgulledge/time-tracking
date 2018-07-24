sap.ui.jsview("view.Login", {

	/** Specifies the Controller belonging to this View.
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf view.ProjectList
	*/
	getControllerName : function() {
		return "view.Login";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
	* Since the Controller is given to this method, its event handlers can be attached right away.
	* @memberOf view.Login
	*/
	createContent : function(oController) {
		var oPage = new sap.m.Page("page5", {
			showHeader:false
	    }).addStyleClass("background");

		var deviceData = sap.ui.getCore().getModel("device").getData();
	    var oImage = new sap.m.Image({src : "./img/NR_LogoTag_Login.png"});
		oImage.setWidth("60%");
		oImage.setHeight(deviceData.isPhone ? "3rem" : "6rem");

		var oImageCog = new sap.m.Image({src : "./img/SettingsIcon.png", press: [oController.handleSettingsButtonPress, oController]});
		oImageCog.setWidth(deviceData.isPhone ? "1.5rem" : "4rem");
		oImageCog.setHeight(deviceData.isPhone ? "1.5rem" : "4rem");

		var oPassInput = new sap.m.Input ("passwordInput1", {
					placeholder:"{i18n>PASS_LABEL}",
					type: sap.m.InputType.Password
		});
		var oBusyDialog = sap.m.BusyDialog("busyIndicator",{text : "{i18n>BUSY_TEXT}"});

		var bundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
		selectedValues = {"selectOptions" : [{"serverKey" : "dev", "serverName" : bundle.getText("SYSTEM_DEV")},{"serverKey" : "qa", "serverName" : bundle.getText("SYSTEM_QA")},{"serverKey" : "prod", "serverName" : bundle.getText("SYSTEM_PROD")}]};
		var oSelectModel = new sap.ui.model.json.JSONModel(selectedValues);

		oSelectTemplate = new sap.ui.core.Item({
			key: "{serverKey}",
			text: "{serverName}"
		});

		oServerSelector = new sap.m.Select("serverSelectDrop",{
			change: [oController.handleDropDownSelect, oController],
			selectedKey : "dev"
		});

		oServerSelector.setModel(oSelectModel);
        oServerSelector.bindAggregation("items","/selectOptions",oSelectTemplate);

        var sTokenId = localStorage.getItem("timetrack-token");
        var sDeviceId = localStorage.getItem("timetrack-deviceId");
        var sDevice = sDeviceId ? sDeviceId : sTokenId;

        var oLayout = new sap.m.VBox("loginLayout", {
			items: [
				new sap.m.HBox({ height : "5rem", justifyContent: sap.m.FlexJustifyContent.Center, alignItems : sap.m.FlexAlignItems.Center , items:[oImage, new sap.m.Text({text : "{i18n>TIME_TRACK_TITLE}"})]}),
				new sap.m.VBox({justifyContent: sap.m.FlexJustifyContent.SpaceAround, height : "10rem",
					items:[
						new sap.m.Label({text : "{i18n>USER_LABEL}"}).addStyleClass("inputPadding"),
						new sap.m.Input ("userIdInput1",{placeholder:"{i18n>USER_LABEL}", change:[oController.handleUserIdChange, oController]}).addStyleClass("inputPadding"),
						new sap.m.Label({text : "{i18n>PASS_LABEL}"}).addStyleClass("inputPadding"),
						oPassInput.addStyleClass("inputPadding")
					]}),
				new sap.m.VBox({ alignItems : sap.m.FlexAlignItems.Center ,justifyContent: sap.m.FlexJustifyContent.SpaceAround, height : "10rem",
					items: [
						new sap.m.CheckBox("logCheckBox1", { text : "{i18n>CHECK_TEXT}"}),
						new sap.m.Button("signInButton",{text: "{i18n>BUTTON_LOGIN}",press : [oController.handleSubmitLogPress, oController], width : "12rem"}),
						new sap.m.HBox({width : "10rem", justifyContent: sap.m.FlexJustifyContent.SpaceAround,
							items: [oImageCog,new sap.m.Link({text : "{i18n>SERVER_SELECT}", press: [oController.handleSettingsButtonPress, oController]}).addStyleClass('textWhite')]
						})
					]}),
				new sap.m.VBox({ alignItems : sap.m.FlexAlignItems.Center ,
					items:[
						new sap.m.Text("serverText",{text : "{i18n>VERSION_LABEL}"}).addStyleClass("textServer"),
						new sap.m.HBox("serverHBox",{ visible : false, alignItems : sap.m.FlexAlignItems.Center ,
							items: [new sap.m.Label({text : "{i18n>SERVER_LABEL}"}).addStyleClass("inputPadding"),oServerSelector] }),
						new sap.m.Text("serverTypeText",{text : "Server",visible : false}),
						new sap.m.Label("deviceLabel",{text : "{i18n>DEVICE_LABEL}",visible : false}),
						new sap.m.TextArea("deviceText",{ rows : 6, cols : 36, value : sDevice,visible : false, enabled : false, wrapping : sap.ui.core.Wrapping.Hard})
					]})
		  	]
		}).addStyleClass("background");

		oPage.addContent(oLayout);

 		return oPage;
	}


});