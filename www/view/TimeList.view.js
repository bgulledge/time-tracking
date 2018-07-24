sap.ui.jsview("view.TimeList", {

	/** Specifies the Controller belonging to this View.
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf timetracking.timeentry
	*/
	getControllerName : function() {
		return "view.TimeList";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
	* Since the Controller is given to this method, its event handlers can be attached right away.
	* @memberOf timetracking.timeentry
	*/
	createContent : function(oController) {
		var deviceModel = sap.ui.getCore().getModel("device");
		var deviceData = deviceModel.getData();

		var oPage = new sap.m.Page("page1", {
			enableScrolling : true,
			footer : new sap.m.Bar("footerBar",{contentRight : [new sap.m.Button({ icon : "sap-icon://accept", press: [oController.handleDoneButtonPress, oController], visible : "{cfg>/inDelete}", enabled : "{cfg>/changeHours}", text : "{i18n>DONE}" }),
	                                                  new sap.m.Text("valueTotalHours", {text : "{hoursModel>/ZtotalHours}", visible : "{cfg>/notInDelete}"}),
	                                                  new sap.m.Text("textTotalHours",{text : "{i18n>TOTAL_WKHOURS}", visible : "{cfg>/notInDelete}"}) ],
	        	  contentLeft : [new sap.m.Button("logOutButton",{ icon : "sap-icon://log", press: [oController.handleLogOutButtonPress, oController], visible : true }),
	        	  		new sap.m.Button("addButton",{ icon : "sap-icon://add", press : [oController.handleAddProjectPress, oController], visible : "{cfg>/notInDelete}", enabled : "{cfg>/useButtons}" }),
                        new sap.m.Button("saveButton",{ icon : "sap-icon://save", press: [oController.handleSaveButtonPress, oController], visible : "{cfg>/notInDelete}", enabled : "{cfg>/useButtons}" }) ]

	          })
	      }).addStyleClass("background2");


		oPage.setShowHeader(false);
		oPage.setEnableScrolling(false);
		oPage = this.createMobileTable(oController);


		this.createDialogs(oController);

 		return oPage;
	},

	createMobileTable : function(oController) {

		var oTable2 = new sap.m.List("CalHolder", {columns : [ new sap.m.Column({}) ]});

		var theCalendar = new sap.me.Calendar("theCal", {
			singleRow:true,
			disabledWeekDays :[0,1,2,3,4,5,6],
			firstDayOffset : 1
			});
		theCalendar.attachChangeCurrentDate(oController.handleDateChange, oController);

		oTable2.addItem(new sap.m.ColumnListItem({cells: [theCalendar]}));

		var oTable = new sap.m.List("idTimeValuesTable", {
			mode : "{cfg>/listMode}",
			columns : [ new sap.m.Column({}) ],
			swipeContent : new sap.m.SegmentedButton("LayoutProject8", {
		 	 			        					buttons: [new sap.m.Button({ width:"6rem", icon : "sap-icon://comment", press: [oController.handleAddCommentPress, oController] }),
		 	 												new sap.m.Button({ width:"6rem", icon : "sap-icon://delete", press: [oController.handleDeletePress, oController] }) ]
		 	 									}),
		 	swipe: [oController.handleListSwipe, oController]
	    	});

		oTable.attachDelete(oController.handleEntryListDelete);

		var oFloat = new sap.ui.model.type.Float(
			{
				minFractionDigits: 0,
				maxFractionDigits: 1
			},
			{
			   maximum: 24
			}
		);

		 var mobileColListItem = new sap.m.ColumnListItem("timeListItem", {
				type : "{cfg>/listItemType}",
				 cells : [ new sap.m.VBox("Layout2", {
		 	 			items: [ new sap.m.HBox("LayoutProject6", { justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
		 	 			        		items: [new sap.m.VBox("LayoutProject2", {
		 	 										items: [new sap.m.Text({text : "{Zprojecttxt}"}).addStyleClass("textBold"), new sap.m.Text({text : "{Zactivitytxt}"})]}).addStyleClass("entryTitleContainer"),
		 	 									new sap.m.HBox("LayoutProject7", { width:"3rem", justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
		 	 			        					items: [new sap.ui.core.Icon("commentIcon",{ src : "sap-icon://comment", press: [oController.handleEditCommentPress, oController] }).addStyleClass("icon-comment"),
		 	 												new sap.ui.core.Icon("deleteIcon",{ src : "sap-icon://delete", press: [oController.handleDeleteButtonPress, oController] }).addStyleClass("icon-delete") ]
		 	 									})
		 	 					 ]}),

		 	 			         new sap.m.HBox("LayoutProject3", {
		 	 			        	items: [ new sap.m.VBox("dayVbox1",{items:[
		 	 			        				new sap.m.Text("dayText1",{text : "{i18n>MONDAY}"}),
												new sap.m.Input("hours10",{
													value : {path: "Zday1hr", type: oFloat},
													type : sap.m.InputType.Number,
													enabled : "{cfg>/changeHours}",
													maxLength: 4,
													liveChange : oController.handleHourChange,
													change : oController.handleTimeChange
													})
											]}).addStyleClass("dayWrapper"),
											new sap.m.VBox("dayVbox2",{items:[
		 	 			        				new sap.m.Text("dayText2",{text : "{i18n>TUESDAY}"}),
												new sap.m.Input("hours20",{
													value : {path: "Zday2hr", type: oFloat},
													type : sap.m.InputType.Number,
													enabled : "{cfg>/changeHours}",
													maxLength: 4,
													liveChange : oController.handleHourChange
													}).addStyleClass("dayWrapper")
							 				]}).addStyleClass("dayWrapper"),
							 				new sap.m.VBox("dayVbox3",{items:[
		 	 			        				new sap.m.Text("dayText3",{text : "{i18n>WEDNESDAY}"}),
												new sap.m.Input("hours30",{
													value : {path: "Zday3hr", type: oFloat},
													type : sap.m.InputType.Number,
													enabled : "{cfg>/changeHours}",
													maxLength: 4,
													liveChange : oController.handleHourChange
													}).addStyleClass("dayWrapper")
							 				]}).addStyleClass("dayWrapper"),
							 				new sap.m.VBox("dayVbox4",{items:[
		 	 			        				new sap.m.Text("dayText4",{text : "{i18n>THURSDAY}"}),
												new sap.m.Input("hours40",{
													value : {path: "Zday4hr", type: oFloat},
													type : sap.m.InputType.Number,
													enabled : "{cfg>/changeHours}",
													maxLength: 4,
													liveChange : oController.handleHourChange
													}).addStyleClass("dayWrapper")
								        	]}).addStyleClass("dayWrapper"),
								        	new sap.m.VBox("dayVbox5",{items:[
		 	 			        				new sap.m.Text("dayText5",{text : "{i18n>FRIDAY}"}),
												new sap.m.Input("hours50",{
													value : {path: "Zday5hr", type: oFloat},
													type : sap.m.InputType.Number,
													enabled : "{cfg>/changeHours}",
													maxLength: 4,
													liveChange : oController.handleHourChange
													}).addStyleClass("dayWrapper")
								        	]}).addStyleClass("dayWrapper"),
								        	new sap.m.VBox("dayVbox6",{items:[
		 	 			        				new sap.m.Text("dayText6",{text : "{i18n>SATURDAY}"}),
												new sap.m.Input("hours60",{
													value : {path: "Zday6hr", type: oFloat},
													type : sap.m.InputType.Number,
													enabled : "{cfg>/changeHours}",
													maxLength: 4,
													liveChange : oController.handleHourChange
													}).addStyleClass("dayWrapper")
								        	]}).addStyleClass("dayWrapper"),
								        	new sap.m.VBox("dayVbox7",{items:[
		 	 			        				new sap.m.Text("dayText7",{text : "{i18n>SUNDAY}"}),
												new sap.m.Input("hours70",{
													value : {path: "Zday7hr", type: oFloat},
													type : sap.m.InputType.Number,
													hAlign : "Center",
													enabled : "{cfg>/changeHours}",
													maxLength: 4,
													liveChange : oController.handleHourChange
												}).addStyleClass("dayWrapper")
								        	]}).addStyleClass("dayWrapper")
		 	 			        	]}),
		 	 			        	new sap.m.HBox("LayoutProject4", { width:"6rem", justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
		 	 			        		items: [new sap.m.Text({text : "{i18n>TOTAL_HOURS}"}), new sap.m.Text("totalHours",{text : "{Ztotal}"})]}).addStyleClass("totalhrsContainer"),
		 	 			        	new sap.m.HBox("LayoutProject5", {
		 	 			        		items: [new sap.m.Link({text : "{i18n>COMMENT_LBL}", press : [oController.handleEditCommentPress, oController]}), new sap.m.Text("commentTxt", {text: "{Zremark}"}).addStyleClass("textItalic")]}).addStyleClass("commentsContainer")

					]
				}) ]
		     });

		var deviceData = sap.ui.getCore().getModel("device").getData();
		var oImagePlus = new sap.m.Image({src : "./img/Large_Plus.png", press: [oController.handlePlusImagePress, oController]});
		oImagePlus.setWidth(deviceData.isPhone ? "8rem" : "16rem");
		oImagePlus.setHeight(deviceData.isPhone ? "8rem" : "16rem");

		var oAddVBox = new sap.m.VBox("addVBox",{ height: "65%", alignItems : sap.m.FlexAlignItems.Center, justifyContent: sap.m.FlexJustifyContent.Center, items:[oImagePlus,new sap.m.Text({text : "{i18n>NEW_ENTRY_TXT}"})]});

		var oMsgVBox = new sap.m.VBox("msgVBox",{ height: "65%", alignItems : sap.m.FlexAlignItems.Center, justifyContent: sap.m.FlexJustifyContent.Center, items:[new sap.m.Text({text : "{i18n>MESSAGE_TXT}", textAlign:sap.ui.core.TextAlign.Center})]});

		var oPage = sap.ui.getCore().byId("page1");
		oPage.addContent(oTable2);
		var mobileLayout2 = new sap.m.ScrollContainer("Layout6", {vertical:true,horizontal:false, height:"80%", width:"100%", content: [oTable]});
		//oPage.addContent(mobileLayout2);
		return oPage;

	},

	createDialogs : function (oController) {

		var oCommentDialog = new sap.m.Dialog("commentDialog", {title: "{i18n>COMMENT_TITLE}"});
		var oTxtVbox = new sap.m.VBox({ alignItems : sap.m.FlexAlignItems.Center ,justifyContent: sap.m.FlexJustifyContent.SpaceAround, height : "7rem",
			items: [
				new sap.m.TextArea("commentTextArea", {maxLength : 50, liveChange:[oController.handleCommentChange, oController] }).addStyleClass("textSize"),
				new sap.m.Text("maxCharsText",{text : "{i18n>MAX_CHARS}"})
				]
		});
		oCommentDialog.addContent(oTxtVbox);
		oCommentDialog.setRightButton(new sap.m.Button({text: "{i18n>SAVE}",press : [oController.handleSaveCommentPress, oController]}));
		oCommentDialog.setLeftButton(new sap.m.Button({text: "{i18n>CANCEL}",press : [oController.handleCancelCommentPress, oController]}));

		var oDuplicateDialog = new sap.m.Dialog("duplicateDialog", {title: "{i18n>SAVE_HEADER}"});
		oDuplicateDialog.addContent(new sap.m.Text({text : "{i18n>CONFIRM_SAVE}"}).addStyleClass("textPadding"));
		oDuplicateDialog.setLeftButton(new sap.m.Button({text: "{i18n>YES}",press : [oController.handleSaveHoursPress, oController]}));
		oDuplicateDialog.setRightButton(new sap.m.Button({text: "{i18n>NO}",press : [oController.handleCancelHoursPress, oController]}));

		var oDeleteDialog = new sap.m.Dialog("deleteDialog", {title: "{i18n>DELETE_HEADER}"});
		oDeleteDialog.setLeftButton(new sap.m.Button({text: "{i18n>YES}",press : [oController.handleEntryListDelete, oController]}));
		oDeleteDialog.setRightButton(new sap.m.Button({text: "{i18n>NO}",press : [oController.handleDeleteNoPress, oController]	}));

		var oActionSheet = new sap.m.ActionSheet("actionSheet", { placement : sap.m.PlacementType.Top,
			cancelButtonText : "{i18n>CANCEL}",
			buttons : [new sap.m.Button({ icon : "sap-icon://comment", text : "{i18n>BUTTON_COMMENT}", press : [oController.handleAddCommentPress, oController] }),
			           //new sap.m.Button({ icon : "sap-icon://delete", text : "{i18n>BUTTON_DELETE}", press: [oController.handleDeleteButtonPress, oController] }),
                       new sap.m.Button("logOutButton2",{ icon : "sap-icon://log", text : "{i18n>BUTTON_LOGOUT}", press: [oController.handleLogOutButtonPress, oController], visible : true })  ]

		});

	}

});