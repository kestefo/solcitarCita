sap.ui.define([
	"./utilUI"
], function(utilUI) {
    "use strict";
    return {
    	iCodeSuccess	: 1,
    	iCodeWarn		: 2,
    	iCodeError		: -1,
    	iCodeException	: -2,
        success: function(sIdTransaction, sMessage, oResults) {
            return {
                oResults		: oResults,
                oAuditResponse  : {
                	iCode			: this.iCodeSuccess,
	                sIdTransaction  : sIdTransaction,
	                sMessage		: sMessage,
                }
            };
        },
        warn: function(sIdTransaction, sMessage,oResults) {
            return {
                iCode		: this.iCodeWarn,
                sIdTransaction  : sIdTransaction,
                sMessage	: sMessage,
                oResults	: oResults
            };
        },
        error: function(sIdTransaction, sMessage,oResults) {
            return {
                oResults	: oResults,
                oAuditResponse  : {
                	iCode		: this.iCodeError,
	                sIdTransaction  : sIdTransaction,
	                sMessage	: sMessage,
                }
            };
        },
        exception: function(sIdTransaction, sMessage) {
            return {
                iCode		: this.iCodeException,
                sIdTransaction  : sIdTransaction,
                sMessage	: sMessage
            };
        },
        validate: function(result,events){
        	var valid = result.oAuditResponse;
        	if(valid.iCode === 1){
        		//Dato Variable depende de la situacion
        		utilUI.onMessageSuccessDialogPress(valid.sIdTransaction, valid.sMessage);
        		// utilUI.onMessageSuccessDialogPress2(valid.sIdTransaction, valid.sMessage);
        		//Dato Variable depende de la situacion
        		events.success(result.oResults,valid.sMessage);
        	}else{
        		utilUI.onMessageErrorDialogPress(valid.sIdTransaction, valid.sMessage);
        		events.error(valid.sMessage);
        	}
        },
        validateFunctionEndButton: function(result,events){
        	var valid = result.oAuditResponse;
        	if(valid.iCode === 1){
        		//Dato Variable depende de la situacion
        		utilUI.onMessageSuccessDialogPressSuccesFunctionEnd(valid.sIdTransaction, valid.sMessage,events,result);
        		// utilUI.onMessageSuccessDialogPress(valid.sIdTransaction, valid.sMessage);
        		//Dato Variable depende de la situacion
        		// events.success(result.oResults,valid.sMessage);
        	}else{
        		utilUI.onMessageErrorDialogPress(valid.sIdTransaction, valid.sMessage);
        		events.error(valid.sMessage);
        	}
        },
        validateAjaxGet: function(result,events){
        	var valid = result;
        	if(valid.iCode === 1){
        		//Dato Variable depende de la situacion
        		// utilUI.onMessageSuccessDialogPress2(valid.sIdTransaction, valid.sMessage);
        		// utilUI.onMessageSuccessDialogPress(valid.sIdTransaction, valid.sMessage);
        		//Dato Variable depende de la situacion
        		events.success(result,valid.m);
        	}else{
        		utilUI.onMessageErrorDialogPress2("Error en el metodo " + result.u);
        		events.error(valid);
        	}
        }
    };
});