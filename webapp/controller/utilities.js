sap.ui.define([
	"sap/ui/core/format/NumberFormat"
], function(NumberFormat) {
	"use strict";

	// class providing static utility methods to retrieve entity default values.

	return {
		formaterx: function (value) {

			if (value) {
				var myDater = new Date(value.match(/\d+/)[0] * 1).getTime()+ 1 * 24  * 60  * 60 * 1000;
				var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "dd.MM.yyyy"
				});
				return oDateFormat.format(new Date(myDater));
			} else {
				return value;
			}

		},
		formatHour: function (param) {
			var formatHour;
			var timex2 = param.split("H");
			var time3 = timex2[1].split("M");
			var minuto = "";
			if (time3[0].length === 1) {
				minuto = "0" + time3[0];
			} else {
				minuto = time3[0];
			}
			var hora = timex2[0].substring(2);
			var segundo = time3[1].substring(0, 2);

			formatHour = hora + ":" + minuto + ":" + segundo;

			return formatHour;

		},
		formatHour2: function (param) {
			var formatHour;
			var timex2 = param.split("H");
			var time3 = timex2[1].split("M");
			var minuto = "";
			if (time3[0].length === 1) {
				minuto = "0" + time3[0];
			} else {
				minuto = time3[0];
			}
			var hora = timex2[0].substring(2);
			var hora2an = (parseInt(hora)+1).toString();
			var hora2;
			if(hora2an.length === 1 ){
				hora2 = "0" + hora2an;
			}else{
				hora2=hora2an;
			}
			var segundo = time3[1].substring(0, 2);
			
			if(hora2)

			formatHour = hora + ":" + minuto + ":" + segundo + "-" + hora2.toString() + ":" + minuto + ":" + segundo;

			return formatHour;

		},
		convertirXmlEnObjeto: function (xml) {
			var self = this;
			var objeto = {};
			var esRaiz = false;

			//  Objeto "raiz"
			if (xml.nodeType == 1) { // Objeto 
				// Se recuperan sus atributos
				if (xml.attributes.length > 0) {
					for (var j = 0; j < xml.attributes.length; j++) {
						var atributo = xml.attributes.item(j);
						objeto[atributo.nodeName] = atributo.nodeValue;
					}
				}
			} else if (xml.nodeType == 3) { // Texto
				objeto = xml.nodeValue;
			} else if (xml.nodeType == 9) { // Elemento raiz
				esRaiz = true;
			}

			// Atributos del objeto (objetos hijos)
			if (xml.hasChildNodes()) {
				for (var i = 0; i < xml.childNodes.length; i++) {
					var item = xml.childNodes.item(i);
					var nombreNodo = item.nodeName;

					// Si objeto no tiene un atributo con el nombre nombreNodo se anade, si ya lo tiene (es un array) se anade
					// a la lista del objeto con nombre nombreNodo
					if (typeof (objeto[nombreNodo]) == "undefined") {
						// Si el elemento es un CDATA se copia el contenido en el elemento y no se crea un
						// hijo para almacenar el texto
						if (nombreNodo == "#cdata-section") {
							objeto = item.nodeValue;
						} else if (nombreNodo == "#text") { // Si el elemento es un texto no se crea el objeto #text
							if (item.childNodes.length < 1) {
								objeto = item.nodeValue;
							} else {
								objeto[nombreNodo] = self.convertirXmlEnObjeto(item);
							}
						} else {
							if (esRaiz) {
								objeto = self.convertirXmlEnObjeto(item);
							} else {
								objeto[nombreNodo] = self.convertirXmlEnObjeto(item);
							}
						}
					} else {
						// Si el atributo no es una lista se convierte el atributo en un array y se anade el
						// valor a dicho array
						if (typeof (objeto[nombreNodo].push) == "undefined") {
							var valorAtributo = objeto[nombreNodo];
							objeto[nombreNodo] = new Array();
							objeto[nombreNodo].push(valorAtributo);
						}

						objeto[nombreNodo].push(self.convertirXmlEnObjeto(item));
					}
				}
			}

			return objeto;
		},
		getDestinationBack: function () {
			return "/backend/api";
			//return "http://localhost:5555/api";
		},
		getGuiaRequest: function (ruc, serie, correlativo) {
			return '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:mm0="http://buenaventura.com.pe/quipu/PO/PROVEEDORES/EntregaEnvio/MM039">' +
				'<soapenv:Header/>' +
				'<soapenv:Body>' +
				'<mm0:MT_ListaEntregaRequest>' +
				'<Ruc>' + ruc + '</Ruc>' +
				'<NumeroSerie>' + serie + '</NumeroSerie>' +
				'<GuiaProveedor>' + correlativo + '</GuiaProveedor>' +
				'</mm0:MT_ListaEntregaRequest>' +
				'</soapenv:Body>' +
				'</soapenv:Envelope>';
		},
		getRequestDetallePedido: function (idPedido) {

			return '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:mm0="http://buenaventura.com.pe/quipu/PO/PROVEEDORES/PedidoCompra/MM038">' +
				'<soapenv:Header/>' +
				'<soapenv:Body>' +
				'<mm0:MT_DetallePedidoCompraRequest>' +
				'<Pedido>' + idPedido + '</Pedido>' +
				'</mm0:MT_DetallePedidoCompraRequest>' +
				'</soapenv:Body>' +
				'</soapenv:Envelope>';
		},
		getRequestDelete: function (entrega) {

			return '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:mm0="http://buenaventura.com.pe/quipu/PO/PROVEEDORES/EntregaEnvio/MM039">' +
				'<soapenv:Header/>' +
				'<soapenv:Body>' +
				'<mm0:MT_ElimEntregaRequest>' +
				'<NroEntrega>' + entrega + '</NroEntrega>' +
				'</mm0:MT_ElimEntregaRequest>' +
				'</soapenv:Body>' +
				'</soapenv:Envelope>';
		},
		getCreaPreEntregaRequest: function (lista) {

			var content =
				'<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:mm0="http://buenaventura.com.pe/quipu/PO/PROVEEDORES/EntregaEnvio/MM039">' +
				'<soapenv:Header/>' +
				'<soapenv:Body>' +
				'<mm0:MT_CreaPreEntregaRequest>';
			for (var i = 0; i < lista.length; i++) {
				content = content + '<preEntrega>' +
					'<PedidoCompras>' + lista[i].idPedido + '</PedidoCompras>' +
					'<PosicionCompras>' + lista[i].posicion + '</PosicionCompras>' +
					'<GuiaEntrega>' + lista[i].guia + '</GuiaEntrega>' +
					'<DescPreEntrega>' + lista[i].descPreEntrega + '</DescPreEntrega>' +
					'<CantBultos>' + lista[i].cantBultos + '</CantBultos>' +
					'<UndMedidaBulto>' + lista[i].unidadBulto + '</UndMedidaBulto>' +
					'<Item>' + lista[i].codigoItem + '</Item>' +
					'<CantidadEnviaCompra>' + lista[i].cantidadEnviaCompra + '</CantidadEnviaCompra>' +
					'<UndCompra>' + lista[i].undCompra + '</UndCompra>' +
					'</preEntrega>';
			}
			content = content +
				'</mm0:MT_CreaPreEntregaRequest>' +
				'</soapenv:Body>' +
				'</soapenv:Envelope>';
			return content;
			/*'<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:mm0="http://buenaventura.com.pe/quipu/PO/PROVEEDORES/EntregaEnvio/MM039">' +
							'<soapenv:Header/>' +
							'<soapenv:Body>' +
							'<mm0:MT_CreaPreEntregaRequest>' +
							'<preEntrega>' +
							'<PedidoCompras>'+idPedido+'</PedidoCompras>' +
							'<PosicionCompras>'+posicion+'</PosicionCompras>' +
							'<GuiaEntrega>'+guia+'</GuiaEntrega>' +
							'<DescPreEntrega>'+descPreEntrega+'</DescPreEntrega>' +
							'<CantBultos>'+cantBultos+'</CantBultos>' +
							'<UndMedidaBulto>'+unidadBulto+'</UndMedidaBulto>' +
							'<Item>'+codigoItem+'</Item>' +
							'<CantidadEnviaCompra>'+cantidadEnviaCompra+'</CantidadEnviaCompra>' +
							'<UndCompra>'+undCompra+'</UndCompra>' +
							'</preEntrega>' +
							'</mm0:MT_CreaPreEntregaRequest>' +
							'</soapenv:Body>' +
							'</soapenv:Envelope>';*/
		},
		getPDFUrl: function (i) {
			var decodedPdfContent = atob(i);
			var byteArray = new Uint8Array(decodedPdfContent.length)
			for (var i = 0; i < decodedPdfContent.length; i++) {
				byteArray[i] = decodedPdfContent.charCodeAt(i);
			}
			var blob = new Blob([byteArray.buffer], {
				type: 'application/pdf'
			});
			return URL.createObjectURL(blob);

		},
		estaVacio: function (inputStr) {

			var flag = false;
			if (inputStr === '') {
				flag = true;
			}
			if (inputStr === null) {
				flag = true;
			}
			if (inputStr === undefined) {
				flag = true;
			}
			if (inputStr == null) {
				flag = true;
			}

			return flag;
		},
		setRuc: function (ruc) {
			sessionStorage.setItem("USER.ruc", ruc);
		},
		getRuc: function () {
			return sessionStorage.getItem("USER.ruc");
		},
		getCorreo: function () {
			var userModel = new sap.ui.model.json.JSONModel();
			userModel.loadData("/services/userapi/attributes", null, false);
			var dataUser = userModel.getData();

			return dataUser.mail;
		},
		
		FormatterDinero: function (value) {

			var oNumberFormat = NumberFormat.getFloatInstance({
				minFractionDigits: 1,
				maxFractionDigits: 6,
				decimals: 2,
				groupingEnabled: true,
				groupingSeparator: "",
				decimalSeparator: "."
			});

			if (value !== null) {
				return oNumberFormat.format(value);
			} else {
				return value;
			}
		},
		isEmpty: function (inputStr) {

			var flag = false;
			if (inputStr === '') {
				flag = true;
			}
			if (inputStr === null) {
				flag = true;
			}
			if (inputStr === undefined) {
				flag = true;
			}
			if (inputStr == null) {
				flag = true;
			}

			return flag;
		},

	};
});
