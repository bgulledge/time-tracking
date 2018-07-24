sap.ui.jsview("view.App", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf timetracking.timeentry
	*/ 
	getControllerName : function() {
		return "view.App";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf timetracking.timeentry
	*/ 
	createContent : function(oController) {
		
		// to avoid scrollbars on desktop the root view must be set to block display
		this.setDisplayBlock(true);
		
		this.app = new sap.m.App("App");
		
		this.app.addPage(sap.ui.jsview("Login", "view.Login"));
		
		return this.app;
		
		/* return new sap.m.Shell("Shell", {
			title : "Time Tracking",
			showLogout : false,
			app : this.app
		}); */
	}
	

});