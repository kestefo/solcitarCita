sap.ui.define([
	"../util/utilResponse",
	"../util/utilHttp",
	"../constantes",
	// "../model/mockdata",
	// "../estructuras/Estructura"
], function (utilResponse, utilHttp, constantes) {
	"use strict";
	return {

		RegistrarEntregaSinOC: function (context, oResults, callback) {
			utilHttp.Post(constantes.services.registrarEntregasSinOC, oResults, callback, context);
		},
		ConsultarUsuario: function (context, oResults, callback) {
			utilHttp.SessionUserGet(constantes.services.consultarUsuario, oResults, callback, context);
		},
		AlmacenCentro: function (context, callback) {
			utilHttp.ERPGet(constantes.services.consultarAlmacen, callback, context);
		},
		UnidedesMedida: function (context, callback) {
			utilHttp.ERPGet(constantes.services.unmMedida, callback, context);
		},
		Motivos: function (context, callback) {
			utilHttp.ERPGet(constantes.services.motivo, callback, context);
		},
		ConsultarProveedores: function (context,url, callback) {
			utilHttp.ERPGet(url, callback, context);
		},
		TipoEmbalajes: function (context, callback) {
			utilHttp.ERPGet(constantes.services.tipoEmbalaje, callback, context);
		},
		Estatus: function (context, callback) {
			utilHttp.ERPGet(constantes.services.estatus, callback, context);
		},
		/////////////////////////////////////////////////////////////////////////////////////////////////
		/////////////////////////////////////////////////////////////////////////////////////////////////
	};
});