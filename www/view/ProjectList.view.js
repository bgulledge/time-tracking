sap.ui.jsview("view.ProjectList", {

	/** Specifies the Controller belonging to this View.
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf view.ProjectList
	*/
	getControllerName : function() {
		return "view.ProjectList";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
	* Since the Controller is given to this method, its event handlers can be attached right away.
	* @memberOf view.ProjectList
	*/
	createContent : function(oController) {
		var oPage = new sap.m.Page("page4", {
	          showHeader:false,
	          showSubHeader:true,
			  subHeader : new sap.m.Bar({
				  contentRight : [new sap.ui.core.Icon({ src : "sap-icon://decline", press: [oController.handleBackTriggered, oController] }) ]
	          })
	      });

		var oTable = new sap.m.List("ProjectsListTable", {
			columns : [ new sap.m.Column({

	        }) ]
	    });

		var colListItem = new sap.m.ColumnListItem("projectListItem",{
			 type : "Navigation",
			 press : [ oController.handleRowSelect, oController ],
		     cells : [ new sap.m.Text({text : "{Txtmd}"})]
		 });

		var oVBox = new sap.m.VBox({ alignItems : sap.m.FlexAlignItems.Stretch ,
					items: [new sap.m.SearchField("projSearchField",{liveChange : [ oController.handleSearchLiveChange, oController ]}), oTable ]
		});

 		oPage.addContent(oVBox);
 		return oPage;
	}


});