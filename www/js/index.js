/*
 * Licensed to Newell Rubbermaid
 */

var pushNotification;
var errorTxt = "There was an error setting up push notifications.\n\n";

function onDeviceReady() {
    navigator.splashscreen.hide();

    document.addEventListener("resume", onResume, false);

    try
    {
        pushNotification = window.plugins.pushNotification;
	if (device.platform == 'android' || device.platform == 'Android' || device.platform == 'amazon-fireos' ) {
		pushNotification.register(successHandler, errorHandler, {"senderID":"652055720980","ecb":"onNotification"});		// required!
	} else {
		pushNotification.register(tokenHandler, errorHandler, {"badge":"true","sound":"true","alert":"true","ecb":"onNotificationAPN"});	// required!
	}
    }
    catch(err)
    {
        errorTxt+="Error description: " + err.message + "\n\n";
		alert(errorTxt);
    }
}

// handle APNS notifications for iOS
function onNotificationAPN(e) {
	if (e.alert) {
	     // showing an alert also requires the org.apache.cordova.dialogs plugin
	     navigator.notification.alert(e.alert);
	}

	if (e.sound) {
	    // playing a sound also requires the org.apache.cordova.media plugin
	    var snd = new Media(e.sound);
	    snd.play();
	}

	if (e.badge) {
	    pushNotification.setApplicationIconBadgeNumber(successHandler, e.badge);
	}
}

// handle GCM notifications for Android
function onNotification(e) {

	switch( e.event )
	{
	    case 'registered':
			if ( e.regid.length > 0 )
			{
				// Your GCM push server needs to know the regID before it can push to this device
				// here is where you might want to send it the regID for later use.
				localStorage.setItem("timetrack-deviceId", e.regid);
			}
	   		break;

	    case 'message':
			// if this flag is set, this notification happened while we were in the foreground.
			// you might want to play a sound to get the user's attention, throw up a dialog, etc.
			if (e.foreground)
			{
				// on Android soundname is outside the payload.
				// On Amazon FireOS all custom attributes are contained within payload
				var soundfile = e.soundname || e.payload.sound;
				// if the notification contains a soundname, play it.
				// playing a sound also requires the org.apache.cordova.media plugin
				var my_media = new Media("/android_asset/www/"+ soundfile);
				my_media.play();
			}
			else
			{	// otherwise we were launched because the user touched a notification in the notification tray.
	//			if (e.coldstart)
	//				$("#app-status-ul").append('<li>--COLDSTART NOTIFICATION--' + '</li>');
	//			else
	//			$("#app-status-ul").append('<li>--BACKGROUND NOTIFICATION--' + '</li>');
			}
			//e.payload.msgcnt is android only

	    	break;

	    case 'error':
			errorTxt+="Error description: " + e.msg;
			alert(errorTxt);
			break;

	    default:
			console.log("TimeTracking, an event was received and we do not know what it is");
			break;
	}
}

function tokenHandler (result) {
	// Your iOS push server needs to know the token before it can push to this device
	// here is where you might want to send it the token for later use.
	localStorage.setItem("timetrack-token", result);
}

function successHandler (result) {
//	alert('success:'+ result);
}

function errorHandler (error) {
	errorTxt+="Error description: " + error;
	alert(errorTxt);
}

function onResume() {
	if (!checkUserLoggedIn()) {
		var bus = sap.ui.getCore().getEventBus();
		bus.publish("nav", "to", {
			id: "Login"
		});
	}
}

function checkUserLoggedIn() {
	//checkConnection();
	var selectedModel = sap.ui.getCore().getModel("selectedValModel");
	var theUrl = selectedModel.oData.server;
	var finalUrl = theUrl.slice(0,theUrl.indexOf("."));
	var newUrl = finalUrl + ".newellrubbermaid.com/dc~global~timetrk~webmod/logOn.jsp";
	var theReturn;

	$.ajax({
		url: newUrl,
		type: 'GET',
		async: false,
		success: function (data, status, xhr){
			theReturn = data.slice(0,7);

		},
		error: function(){
			theReturn = null;
		}
	});
	return theReturn;
}

function checkConnection() {
    var networkState = navigator.connection.type;
	if (networkState === 'none') alert('Your device is not connected to the internet');
}

function encryptForStorage(target, id) {
	var sSecret = "NotToBeSeen!";
	if (id === "number") {
		var encrypted = CryptoJS.TripleDES.encrypt(target, sSecret);
		localStorage.setItem(id, encrypted);
	}
	else {
		var sKey = localStorage.getItem("number");
		if (sKey) {
			var decrypted = CryptoJS.TripleDES.decrypt(sKey, sSecret);
			var sUsableKey  = decrypted.toString(CryptoJS.enc.Utf8);

			if (target && sUsableKey) {
				var encrypted = CryptoJS.TripleDES.encrypt(target, sUsableKey);
				localStorage.setItem(id, encrypted);
			}
			else {
				alert("Unable to store information");
			}
		}
		else {
			alert("No key found.");
		}
	}
}

function decryptFromStorage(target) {
	var sSecret = "NotToBeSeen!";
	var sKey = localStorage.getItem("number");
	if (sKey) {
		var decrypted = CryptoJS.TripleDES.decrypt(sKey, sSecret);
		var sUsableKey  = decrypted.toString(CryptoJS.enc.Utf8);
	}
	var localItem = localStorage.getItem(target);
	var returnItem;
	if (localItem && sUsableKey) {
		var decrypted = CryptoJS.TripleDES.decrypt(localItem, sUsableKey);
		returnItem = decrypted.toString(CryptoJS.enc.Utf8);
	}
	return returnItem;
}