sap.ui.define([
	"./MethodRepository",
	"./utilities",
	"sap/m/MessageBox",
	'sap/m/Token',
	"sap/m/MessageToast",
	"sap/ui/core/BusyIndicator",
	"sap/ui/core/Fragment"
], function (MethodRepository, Utilities, MessageBox, Token, MessageToast, BusyIndicator, Fragment) {
	"use strict";
	var qrcode;
	// class providing static utility methods to retrieve entity default values.

	return {
		getRuc: function (context) {
			var that = this;
			jQuery.sap.require("jquery.sap.storage");
			that._oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);
			var currentRuc = "";
			$.ajax({
				type: "GET",
				url: "/backend/api/proveedor/getSessionUser",
				dataType: "json",
				contentType: "application/json",
				// async: false,
				headers: {
					"Accept": "application/json"
				},
				success: function (response) {

					// currentRuc = response.data.ruc;
					currentRuc = "20106740004";
					// that._oStorage.put('CURRENT_RUC', currentRuc);
					that.getDataMain(currentRuc, context);
				},
				error: function () {
					//	that.getView().setBusy(false);
					MessageBox.error("Ocurrio un error al obtener la sesion");
					//alert("Ocurrio un error al obtener la sesion")
				}
			});

			// return currentRuc;
		},
		generarCita: function () {
			var oControl = this;
			var response;
			var url = "/XS_IPROVIDER_ENTREGA/IPROVIDER_ENTREGA/CITAS/GenerarCita.xsjs";
			var aData = jQuery.ajax({
				method: 'GET',
				cache: false,
				headers: {
					"X-CSRF-Token": "Fetch"
				},
				async: false,
				url: url

			}).then(function successCallback(result, xhr, data) {
				//token = data.getResponseHeader("X-CSRF-Token");
				response = result;
			}, function errorCallback(xhr, readyState) {
				jQuery.sap.log.debug(xhr);
			});
			return response;
		},
		getDataMain: function (ruc, context) {
			var that = this;
			var lista = [];
			var oView = context.getView();
			var ModeloProyect = oView.getModel("Proyect");
			var url = "/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_REL_PEDC_XCONF_SRV/RelacionPedEntSet?$filter=IRuc eq '" + ruc +
				"'&$format=json";

			jQuery.ajax({
				method: 'GET',
				cache: false,
				contentType: 'application/json',
				headers: {
					Authorization: "Basic VVNSX1JBVkE6UmF2YTIwMjAk"
				},
				async: false,
				url: url

			}).then(function successCallback(result, xhr, data) {
					//token = data.getResponseHeader("X-CSRF-Token");
					var listaAux = result.d.results;
					var listaFinal = [];
					var exist;
					//Eliminar duplicidad: inicio-------------------------------------------------------------------------------
					if (listaAux.length > 0) {
						listaFinal.push(listaAux[0]);
						$.each(listaAux, function (index, value) {
							exist = false;

							$.each(listaFinal, function (index2, value2) {
								if (value.Vbeln === value2.Vbeln) {
									exist = true;
								}
							});

							if (!exist) {

								listaFinal.push(value);
							}
						});
					}
					//Eliminar duplicidad: fin-------------------------------------------------------------------------------
					$.each(listaFinal, function (index, value) {
						if (value.Zzlfstk === 'P' || value.Zzlfstk === 'R') {
							value.Lfdat = Utilities.formaterx(value.Lfdat);
							var timex = value.Lfuhr;
							if (!Utilities.isEmpty(timex)) {

								var timex2 = timex.split("H");
								var time3 = timex2[1].split("M");
								var minuto = "";
								if (time3[0].length === 1) {
									minuto = "0" + time3[0];
								} else {
									minuto = time3[0];
								}
								var hora = timex2[0].substring(2);
								var segundo = time3[1].substring(0, 2);
							}

							value.Lfuhr = hora + ":" + minuto + ":" + segundo;

							if (value.Zzlfstk === 'R') {
								var entregaReg = that.getEntregReg(value.Vbeln);
								value.Zcita = entregaReg[0].Zcita;
								value.Zbolnr = entregaReg[0].Zbolnr;
							} else {
								value.Zcita = "";
								value.Zbolnr = "";
							}

							value.Status = value.Zcita === '' ? "Pendiente" : "Completado";

							lista.push(value);
						}
					});

				},
				function errorCallback(xhr, readyState) {
					jQuery.sap.log.debug(xhr);
				});

			ModeloProyect.setProperty("/DataCentro", lista);
			// return lista;
		},
		getEntregReg: function (numEntrega) {
			var oControl = this;
			var response = [];
			var url = "/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_REL_PEDC_XCONF_SRV/ZET_MOSTRAR_REGISTROSet?$filter=Zvbeln eq '" + numEntrega +
				"'&$format=json";
			var aData = jQuery.ajax({
				method: 'GET',
				cache: false,
				headers: {
					"X-CSRF-Token": "Fetch"
				},
				async: false,
				url: url

			}).then(function successCallback(result, xhr, data) {
				//token = data.getResponseHeader("X-CSRF-Token");
				var aux = result.d.results;
				aux.forEach(function (value, index) {
					if (numEntrega === value.Zvbeln) {
						response.push(value);
					}
				});
			}, function errorCallback(xhr, readyState) {
				jQuery.sap.log.debug(xhr);
			});
			return response;
		},
		getDataPersonaVehiculo: function (ident) {
			var oControl = this;
			var lista = [];
			var url = "/XS_IPROVIDER_ENTREGA/IPROVIDER_ENTREGA/PERSONAS_VEHICULOS/PersonasVehiculos.xsjs?num=" + ident;
			jQuery.ajax({
				method: 'GET',
				cache: false,
				headers: {
					"X-CSRF-Token": "Fetch"
				},
				async: false,
				url: url

			}).then(function successCallback(result, xhr, data) {
				//token = data.getResponseHeader("X-CSRF-Token");
				lista.push(result);
			}, function errorCallback(xhr, readyState) {
				jQuery.sap.log.debug(xhr);
			});
			return lista;
		},
		saveDni: function (obj, context,callBack) {
			var oView = context.getView();
			jQuery.sap.require("jquery.sap.storage");
			context._oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);
			var response;
			console.log(JSON.stringify(obj));
			$.ajax({
				url: "/XS_IPROVIDER_ENTREGA/IPROVIDER_ENTREGA/PERSONAS_VEHICULOS/PersonasVehiculos.xsjs?Nombre="+obj.NOMBRES+"&Apellido="+obj.APELLIDOS,
				type: "POST",
				contentType: 'text/json',
				async: true,
				
				data: JSON.stringify(obj),
				success: function (data) {
					MessageToast.show("EL DNI '" + obj.NUMERO_IDENTIFICACION + "' FUE REGISTRADO CORRECTAMENTE");

					context.byId("DialogRegistrarDni").close();
					response = "OK";
					callBack(response);
				},
				error: function (e) {
					sap.m.MessageBox.alert("Error al Grabar el dni");
				}
			});

			// return response;
		},
		savePlaca: function (obj) {
			var response;
			$.ajax({
				url: "/XS_IPROVIDER_ENTREGA/IPROVIDER_ENTREGA/PERSONAS_VEHICULOS/PersonasVehiculos.xsjs",
				type: "POST",
				contentType: 'text/json',
				async: false,
				headers: {
					Authorization: "Basic VVNSX1JBVkE6UmF2YTIwMjAk"
				},
				data: JSON.stringify(obj),
				success: function (data) {
					response = data;

				},
				error: function (e) {
					sap.m.MessageBox.alert("Error al Grabar la placa");
				}
			});

			return response;
		},
		getMateriales: function (tipo, docDef) {
			var oControl = this;
			var lista = [];
			var url = "/XS_IPROVIDER_ENTREGA/IPROVIDER_ENTREGA/DOCUMENTOS/SolicitudDocumentos.xsjs?tipo=" + tipo + "&docDef=" + docDef;
			var aData = jQuery.ajax({
				method: 'GET',
				cache: false,
				headers: {
					"X-CSRF-Token": "Fetch"
				},
				async: false,
				url: url

			}).then(function successCallback(result, xhr, data) {
				//token = data.getResponseHeader("X-CSRF-Token");
				lista = result.results;
			}, function errorCallback(xhr, readyState) {
				jQuery.sap.log.debug(xhr);
			});
			return lista;
		},
		getDocPersonaVehiculo: function (tipo, docDef) {
			var oControl = this;
			var lista = [];
			var url = "/XS_IPROVIDER_ENTREGA/IPROVIDER_ENTREGA/DOCUMENTOS/SolicitudDocumentos.xsjs?tipo=" + tipo + "&docDef=" + docDef;
			var aData = jQuery.ajax({
				method: 'GET',
				cache: false,
				headers: {
					"X-CSRF-Token": "Fetch"
				},
				async: false,
				url: url

			}).then(function successCallback(result, xhr, data) {
				//token = data.getResponseHeader("X-CSRF-Token");
				lista = result.results;
			}, function errorCallback(xhr, readyState) {
				jQuery.sap.log.debug(xhr);
			});
			return lista;
		},
		saveGuia: function (lista, cita, context) {

			var that = this;
			var listFinal = [];
			var count = 1;
			lista.forEach(function (value, index) {
				var obj = {
					Vbeln: value.Vbeln,
					Bolnr: value.Zbolnr,
					ZET_REGISTRO_ENTR_RESSet: [{
						Codigo: "",
						Msg: ""
					}]
				};

				// listFinal.push(obj);
				// });

				jQuery.ajax({
					method: 'GET',
					cache: false,
					headers: {
						"X-CSRF-Token": "Fetch"
					},
					// async: false,
					url: "/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_REGISTRO_ENTRG_SRV"

				}).then(function successCallback(result, xhr, data) {
					var token = data.getResponseHeader("X-CSRF-Token");
					jQuery.ajax({
						method: 'POST',
						cache: false,
						headers: {
							"X-CSRF-Token": token
						},
						contentType: "application/json",
						dataType: "json",
						// async: false,
						url: "/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_REGISTRO_ENTRG_SRV/ZET_REGISTRO_ENTRSet",
						data: JSON.stringify(obj)
					}).then(function successCallback(result, xhr, data) {
						//token = data.getResponseHeader("X-CSRF-Token");
						var response = result;
						if (lista.length === count) {
							that.saveCEPlacaDni(cita, context.entregaGuiaSelected, context.listaDni, context.listaVeh, context);
						} else {
							count++;
						}
						// that._oStorage.put('COMPLETESAVEGUI', 1);
					}, function errorCallback(xhr, readyState) {
						// that._oStorage.put('COMPLETESAVEGUI', 0);
						jQuery.sap.log.debug(xhr);
					});

				}, function errorCallback(xhr, readyState) {
					jQuery.sap.log.debug(xhr);
				});
			});

		},
		saveCEPlacaDni: function (cita, listaEntrega, listaDni, listaVeh, context) {
			var that = this;
			var count = 1;
			listaEntrega.forEach(function (value, index) {

				//--------------------------------------------------------------------
				if (listaVeh.length > 0) {
					listaDni.forEach(function (valueDni, indexDni) {

						var obj = {
							Zcita: cita,
							Zvbeln: value.Vbeln,
							Zplaca: listaVeh[0],
							Zndni: valueDni,
							ZET_REGISTRO_ENTR_ERESSet: [{
								Codigo: "",
								Msg: ""
							}]
						};

						jQuery.ajax({
							method: 'GET',
							cache: false,
							headers: {
								"X-CSRF-Token": "Fetch"
							},
							// async: false,
							url: "/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_REGISTRO_ENTRE_SRV"

						}).then(function successCallback(result, xhr, data) {
							var token = data.getResponseHeader("X-CSRF-Token");
							jQuery.ajax({
								method: 'POST',
								cache: false,
								headers: {
									"X-CSRF-Token": token
								},
								contentType: "application/json",
								dataType: "json",
								// async: false,
								url: "/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_REGISTRO_ENTRE_SRV/ZET_REGISTRO_ENTRESet",
								data: JSON.stringify(obj)
							}).then(function successCallback(result, xhr, data) {
								//token = data.getResponseHeader("X-CSRF-Token");
								var response = result;
								if ((listaEntrega.length) * (listaDni.length) === count) {
									that.mostrarRegistros(context, cita, listaEntrega);
								} else {
									count++;
								}
							}, function errorCallback(xhr, readyState) {
								jQuery.sap.log.debug(xhr);
							});

						}, function errorCallback(xhr, readyState) {
							jQuery.sap.log.debug(xhr);
						});
					});

				} else {

					listaDni.forEach(function (valueDni, indexDni) {

						var obj = {
							Zcita: cita,
							Zvbeln: value.Vbeln,
							Zplaca: "",
							Zndni: valueDni,
							ZET_REGISTRO_ENTR_ERESSet: [{
								Codigo: "",
								Msg: ""
							}]
						};

						jQuery.ajax({
							method: 'GET',
							cache: false,
							headers: {
								"X-CSRF-Token": "Fetch"
							},
							// async: false,
							url: "/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_REGISTRO_ENTRE_SRV"

						}).then(function successCallback(result, xhr, data) {
							var token = data.getResponseHeader("X-CSRF-Token");
							jQuery.ajax({
								method: 'POST',
								cache: false,
								headers: {
									"X-CSRF-Token": token
								},
								contentType: "application/json",
								dataType: "json",
								// async: false,
								url: "/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_REGISTRO_ENTRE_SRV/ZET_REGISTRO_ENTRESet",
								data: JSON.stringify(obj)
							}).then(function successCallback(result, xhr, data) {
								//token = data.getResponseHeader("X-CSRF-Token");
								if ((listaEntrega.length)(listaEntrega.length) === count) {
									that.mostrarRegistros(context, cita, listaEntrega);
								} else {
									count++;
								}
							}, function errorCallback(xhr, readyState) {
								jQuery.sap.log.debug(xhr);
							});

						}, function errorCallback(xhr, readyState) {
							jQuery.sap.log.debug(xhr);
						});
					});
				}
			});

		},
		mostrarRegistros: function (context, cita, listaEntrega) {
			var that = this;
			jQuery.sap.require("jquery.sap.storage");
			that._oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);
			// var count = 1;
			var LISTA_GENERAL = [];
			// listaEntrega.forEach(function (value, index) {

			jQuery.ajax({
				method: 'GET',
				cache: false,
				headers: {
					"X-CSRF-Token": "Fetch"
				},
				// async: false,
				url: "/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_REL_PEDC_XCONF_SRV/ZET_MOSTRAR_REGISTROSet?$filter=Zcita eq '" + cita +
					"'&$format=json"

			}).then(function successCallback(result, xhr, data) {
				// that.generatePdfWithQr(context, result.d.results, cita);
				var response = result.d.results;
				listaEntrega.forEach(function (value, index) {
					response.forEach(function (value2, index2) {
						if (value2.Zcita === cita && value2.Zvbeln === value.Vbeln) {
							LISTA_GENERAL.push(value2);
						}
					});
				});

				// if (listaEntrega.length === count) {
				that.generatePdfWithQr(context, LISTA_GENERAL, cita);
				// } else {
				// 	count++;
				// }
			}, function errorCallback(xhr, readyState) {
				jQuery.sap.log.debug(xhr);
			});
			// });

		},
		generatePdfWithQr: function (context, listaGeneral, citax) {
			var that = this;
			//generar pdf's con listaGeneral: inicio -------------------------------------------
			var oView = context.getView();
			
			// var data = that.getData();
			var data = listaGeneral;
			var Entregas = [];
			var cantidad = data.length;
			
			while (cantidad !== 0) {
				var data1 = data[0];
				var arrayCoincidencias = [];
				var a = 1;
				for (a = 1; a < data.length; a++) {
					if (data1.Zvbeln === data[a].Zvbeln) {
						arrayCoincidencias.push(data[a]);
						cantidad--;
						data.splice(a, 1);
						a--;
					}
				}
				arrayCoincidencias.push(data[0]);
				data.splice(0, 1);
				
				cantidad--;

				var nBultos = arrayCoincidencias[0].Zanzpk;
				var cita = arrayCoincidencias[0].Zcita;
				var entrega = arrayCoincidencias[0].Zvbeln;
				var proveedor = arrayCoincidencias[0].ZnameText;
				var destino = arrayCoincidencias[0].Zgort;

				var guia = arrayCoincidencias[0].Zbolnr;
				var numeroTotalBultos = (arrayCoincidencias[0].Zanzpk) * 1;
				var condEnt = arrayCoincidencias[0].ZzlugEnt;
				var direccion = arrayCoincidencias[0].Zdireccion;
				var fecha = Utilities.formaterx(arrayCoincidencias[0].Zlfdat);

				var hora = Utilities.formatHour(arrayCoincidencias[0].Zlfuhr);
				var zona = arrayCoincidencias[0].Zzona;
				var pesoTotBultos = (arrayCoincidencias[0].Zbtgew) * 1;
				var placa = arrayCoincidencias[0].Zplaca;

				var Bultos = [];
				var CantidadEntregas = arrayCoincidencias.length;
				while (CantidadEntregas !== 0) {
					var dataEntregas = arrayCoincidencias[0];
					var arrayBultos = [];
					var e = 1;
					for (e ; e < arrayCoincidencias.length; e++) {
						if (dataEntregas.ZvhilmKu === arrayCoincidencias[e].ZvhilmKu) {
							arrayBultos.push(arrayCoincidencias[e]);
							CantidadEntregas--;
							arrayCoincidencias.splice(e, 1);
							e--;
						}
					}
					arrayBultos.push(arrayCoincidencias[0]);
					arrayCoincidencias.splice(0, 1);
					
					CantidadEntregas--;

					var BultoCodigo = arrayBultos[0].ZvhilmKu;
					var PesoBulto = arrayBultos[0].ZbrgewB;
					var codigo = arrayBultos[0].Zbezei;
					var descipcion = (parseInt(arrayBultos[0].Zlaeng)+"x"+parseInt(arrayBultos[0].Zbreit)+"x"+parseInt(arrayBultos[0].Zhoehe)).toString();
					
					var Pedido = [];
					var CantidadBulto= arrayBultos.length;
					while (CantidadBulto !== 0) {
						var dataButlto = arrayBultos[0];
						var arrayPedido = [];
						var i = 1;
						for (i ; i < arrayBultos.length; i++) {
							if (dataButlto.Zebeln === arrayBultos[i].Zebeln) {
								arrayPedido.push(arrayBultos[i]);
								CantidadBulto--;
								arrayBultos.splice(i, 1);
								i--;
							}
						}
						arrayPedido.push(arrayBultos[0]);
						arrayBultos.splice(0, 1);
						
						CantidadBulto--;


						var DescripcionPedido	= arrayPedido[0].Zebeln;
						var Proveedor	= arrayPedido[0].ZnameText;
						
						var dataPedidos= {
							DescripcionGeneral: DescripcionPedido,
							Proveedor:Proveedor,
							ArrayGeneral: arrayPedido

						};

						Pedido.push(dataPedidos);

					}
					var dataBultos = {
						Descipcion:descipcion,
						Codigo:codigo,
						PesoBult: PesoBulto,
						DescripcionGeneral: BultoCodigo,
						ArrayGeneral: Pedido
					};

					Bultos.push(dataBultos);

				}

				var DataEntregas = {
					cita: cita,
					entrega: entrega,
					proveedor: proveedor,
					destino: destino,
					guia: guia,
					numeroTotalBultos: numeroTotalBultos,
					condEnt: condEnt,
					direccion: direccion,
					fecha: fecha,
					hora: hora,
					zona: zona,
					pesoTotBultos: pesoTotBultos,
					bultos: nBultos,
					placa: placa,
					ArrayGeneral: Bultos
				};
				Entregas.push(DataEntregas);
			}
			var Data = {
				ArrayGeneral :Entregas
			};
			console.log(Data)
			
			var proveedorNombre;
			$.ajax({
				type: "GET",
				url: "/backend/api/proveedor/getSessionUser",
				dataType: "json",
				async:false,
				contentType: "application/json",
				headers: {
					"Accept": "application/json"
				},
				success: function (response) {
					proveedorNombre= response.data.firstName;
				},
				error: function () {
					MessageBox.error("Ocurrio un error al obtener la sesion");
				}
			});
			
			var arrtext = [];
			var cantidad = Data.ArrayGeneral.length
			for (var i = 0; i < Data.ArrayGeneral.length; i++) {
				if (cantidad == 1) {
					arrtext += Data.ArrayGeneral[i].entrega;
				} else {
					arrtext += Data.ArrayGeneral[i].entrega + "-";
				}
				cantidad--;
			}
			
			if (!oView.byId("DialogFormatQR")) {
				Fragment.load({
					id: oView.getId(),
					name: "com.rava.project.fragment.GeneratePdfQr",
					controller: that
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					
					var arrCita = [];
					var arrQrBultos = [];
					for(var i=0;i<Data.ArrayGeneral.length;i++){
						var h4 = document.createElement("h4")
						h4.textContent = "ENTREGA NRO "+ Data.ArrayGeneral[i].entrega;

						var tituloProveedor='<p style="border: 1px solid black;border-collapse: collapse;" >Proveedor : <strong>'+
						proveedorNombre+
						'</strong></p>';
						
						var destino=Data.ArrayGeneral[i].destino;
						var numeroEntrega=Data.ArrayGeneral[i].entrega;
						var numBultos=Data.ArrayGeneral[i].numeroTotalBultos;

						var condEntrega=Data.ArrayGeneral[i].condEnt;
						var direccion=Data.ArrayGeneral[i].direccion;
						var fecha = Data.ArrayGeneral[i].fecha;
						var hora=Data.ArrayGeneral[i].hora;
						var zona=Data.ArrayGeneral[i].zona;
						var pesototalbultos=Data.ArrayGeneral[i].pesoTotBultos;
						var qrEntrega = new sap.m.HBox({});
						var htmltabla = '<br><table align="center" style="border: 1px solid black;'+
						'border-collapse: collapse;width:100%; ">'+
					  	'<caption style="border: 1px solid black;">RESUMEN DE DISTRIBUCION DE DESTINOS</caption>'+
						'<thead>'+
						  '<tr>'+
							'<td style="border:1px solid black;border-collapse:collapse;">Destino </td>'+
							'<td style="border:1px solid black;border-collapse:collapse;">Guia de Entrega</td>'+
							'<td style="border:1px solid black;border-collapse:collapse;"># de Bultos</td>'+
							'<td style="border:1px solid black;border-collapse:collapse;">QR Pre entrega</td>'+
						  '</tr>'+
						  '</thead>'+
						'<tbody>'+
							'<tr>'+
								'<td style="border:1px solid black;border-collapse:collapse;">'+
								destino+
								'</td>'+
								'<td style="border:1px solid black;border-collapse:collapse;">'+
								numeroEntrega+
								'</td>'+
								'<td style="border:1px solid black;border-collapse:collapse;">'+
								numBultos+
								'</td>'+
								'<td style="border:1px solid black;border-collapse:collapse;" rowspan = "6" >'+ 
								'<div id="'+qrEntrega.getId()+
								'" style="display: block;margin-left: auto;margin-right: auto;width: 78%;"></div>'+
							'</tr>'+
							'<tr>'+
								'<td style="border:1px solid black;border-collapse:collapse;">Condicion de Entrega</td>'+
								'<td style="border:1px solid black;border-collapse:collapse;" colspan="2">'+
								condEntrega+
								'</td>'+
							'</tr>'+
							'<tr>'+
								'<td style="border:1px solid black;border-collapse:collapse;">Direccion</td>'+
								'<td style="border:1px solid black;border-collapse:collapse;" colspan="2">'+
								direccion+
								'</td>'+
							'</tr>'+
							'<tr>'+
								'<td style="border:1px solid black;border-collapse:collapse;">Fecha de Cita</td>'+
								'<td style="border:1px solid black;border-collapse:collapse;" colspan="2">'+
								fecha+
								'</td>'+
							'</tr>'+
							'<tr>'+
								'<td style="border:1px solid black;border-collapse:collapse;">Hora Atencion</td>'+
								'<td style="border:1px solid black;border-collapse:collapse;">Zona de Atencion</td>'+
								'<td style="border:1px solid black;border-collapse:collapse;">Peso Total de Bultos (KG)</td>'+
							'</tr>'+
							'<tr>'+
								'<td style="border:1px solid black;border-collapse:collapse;">'+
								hora+
								'</td>'+
								'<td style="border:1px solid black;border-collapse:collapse;">'+
								zona+
								'</td>'+
								'<td style="border:1px solid black;border-collapse:collapse;">'+
								pesototalbultos+
								'</td>'+
							'</tr>'+
							'</tbody>'+
						'</table>';
						
						
						var VBoxPrincipal =new sap.m.VBox({width:"720px"});
						var hboxTitle = new sap.m.HBox({alignItems:"Center"});
						var vboxTitleimg = new sap.m.HBox({width:"36.5%"});
						var img= new sap.m.Image({
							src:"/webapp/images/buenaventura_web.png",
							height:"70px" ,
							width:"200px"
						});
						var vboxTitletitle = new sap.m.HBox({});
						var vboxTitleProveedor = new sap.m.HBox({alignItems:"Center"});
						var qrCita = new sap.m.HBox({});

						var title= new sap.ui.core.HTML({}); 
						var titleProvedor= new sap.ui.core.HTML({}); 
						var titleProvedorNombre= new sap.ui.core.HTML({}); 
						var tableEntrega= new sap.ui.core.HTML({}); 

						var titlqQrCita=new sap.m.Label({text:"Qr Cita",design:"Bold"});

						VBoxPrincipal.addStyleClass("VBoxPrincipal sapUiSmallMargin sapUiSizeCompact");
						VBoxPrincipal.addItem(hboxTitle);
						hboxTitle.addItem(vboxTitleimg);
						hboxTitle.addItem(vboxTitletitle);
						vboxTitleimg.addItem(img);
						vboxTitletitle.addItem(title);
						VBoxPrincipal.addItem(titleProvedor);
						VBoxPrincipal.addItem(titlqQrCita);
						titlqQrCita.addStyleClass("sapUiTinyMarginTop");
						VBoxPrincipal.addItem(qrCita);

						title.setContent(h4.outerHTML);
						titleProvedor.setContent(tituloProveedor);

						tableEntrega.setContent(htmltabla);

						
						VBoxPrincipal.addItem(tableEntrega)

						var objqrCita={
							qrcita:qrCita.getId(),
							qrentrega:qrEntrega.getId(),
							cita:Data.ArrayGeneral[i].cita,
							entrega:Data.ArrayGeneral[i].entrega,
							arrtext:arrtext,
							nombre:"Irina",
							placa:Data.ArrayGeneral[i].placa,
							fecha:Data.ArrayGeneral[i].fecha,
							hora:Data.ArrayGeneral[i].hora,
							destino:Data.ArrayGeneral[i].destino,
							nbultos:Data.ArrayGeneral[i].numeroTotalBultos.toString(),
							condEnt:Data.ArrayGeneral[i].condEnt,
							direccion:Data.ArrayGeneral[i].direccion,
							pesoTotBultos:Data.ArrayGeneral[i].pesoTotBultos,
							zona:Data.ArrayGeneral[i].zona
						};
						arrCita.push(objqrCita);
						
						
						var VBoxBultos =new sap.m.VBox({});
						for(var k=0;k<Data.ArrayGeneral[i].ArrayGeneral.length;k++){
							var VBoxBulto =new sap.m.HBox({width:"100%"});
							var tableBultos= new sap.ui.core.HTML({}); 
							var qrBultos = new sap.m.HBox({});
							var tableHtmlBultos='<br><br><table width="500px" style="border:1px solid black;border-collapse:collapse;" align="center">'+
                                        '<tbody>'+
                                            '<tr>'+
                                                '<td style="border:1px solid black;border-collapse:collapse;">PESO BULTO (KG)</td>'+
                                                '<td style="border:1px solid black;border-collapse:collapse;" rowspan="2">'+
                                                'Bulto ' + Data.ArrayGeneral[i].ArrayGeneral[k].DescripcionGeneral + 
                                                '</td>'+
                                                '<td style="border:1px solid black;border-collapse:collapse;" rowspan = "3" style="text-align: center;">'+
													'<div id="'+qrBultos.getId()+
													'" style="display: block;margin-left: auto;margin-right: auto;width: 78%;"></div>'+
                                                '</td>'+
                                            '</tr>'+
                                            '<tr>'+
												'<td style="border:1px solid black;border-collapse:collapse;">'+
												Data.ArrayGeneral[i].ArrayGeneral[k].PesoBult+
												'</td>'+
                                            '</tr>'+
                                            '<tr>'+
												'<td style="border:1px solid black;border-collapse:collapse;">'+
												Data.ArrayGeneral[i].ArrayGeneral[k].Codigo+
												'</td>'+
												'<td style="border:1px solid black;border-collapse:collapse;" rowspan = "2">'+
												Data.ArrayGeneral[i].ArrayGeneral[k].Descipcion+
												'</td>'+
                                            '</tr>'+
                                        '</tbody>'+
                                    '</table><br/><br/>'
							tableBultos.setContent(tableHtmlBultos)
							VBoxBulto.addItem(tableBultos)
							VBoxBultos.addItem(VBoxBulto)
							
							var objqrBulto={
								qrBultos:qrBultos.getId(),
								ordencompras:Data.ArrayGeneral[i].ArrayGeneral[k].DescripcionGeneral,
								dimensionbulto:Data.ArrayGeneral[i].ArrayGeneral[k].Descipcion,
								pesobulto:Data.ArrayGeneral[i].ArrayGeneral[k].PesoBult,
								// material:Data.ArrayGeneral[i].ArrayGeneral[k].destino,
								cantidad:Data.ArrayGeneral[i].ArrayGeneral[k].ArrayGeneral.length.toString(),
								// unmed:Data.ArrayGeneral[i].ArrayGeneral[k].condEnt,
								// pesomat:Data.ArrayGeneral[i].ArrayGeneral[k].direccion,
								ecri:Data.ArrayGeneral[i].ArrayGeneral[k].Codigo
							};
							arrQrBultos.push(objqrBulto);

							var VBoxPedidos = new sap.m.VBox({width:"100%"});
							for(var l=0;l<Data.ArrayGeneral[i].ArrayGeneral[k].ArrayGeneral.length;l++){
								var comprador = Data.ArrayGeneral[i].ArrayGeneral[k].ArrayGeneral[l].Proveedor;
								var tablePedidos= new sap.ui.core.HTML({});
								var brhtml= new sap.ui.core.HTML({});
								var br='<br>';
								var tableHtmlPedidos= '<table width="500px" style="border:1px solid black;border-collapse:collapse;">'+
									'<thead>'+
										'<tr>'+
											'<td style="border:1px solid black;border-collapse:collapse;"><strong>Pedido de compra '+
											Data.ArrayGeneral[i].ArrayGeneral[k].ArrayGeneral[l].DescripcionGeneral+
											'</strong></td>'+
											'<td style="border:1px solid black;border-collapse:collapse;"><strong>Comprador</strong></td>'+
											'<td style="border:1px solid black;border-collapse:collapse;"><strong>'+
											comprador+
											'</strong></td>'+
										'</tr>'+
									'</thead>'+
								'</table>';
								tablePedidos.setContent(tableHtmlPedidos);
								brhtml.setContent(br);
								VBoxPedidos.addItem(tablePedidos);

								var oJsonModel = new sap.ui.model.json.JSONModel();
								oJsonModel.setData({
									results: Data.ArrayGeneral[i].ArrayGeneral[k].ArrayGeneral[l].ArrayGeneral
								});

								var oTable = new sap.m.Table({
									columns:[
										new sap.m.Column({styleClass:"colum",width:"6rem",header:[new sap.m.Label({text:"MATERIAL"}).addStyleClass('list-label')]
										}),
										new sap.m.Column({styleClass:"colum",header:[new sap.m.Label({text:"DESCRIPCION"}).addStyleClass('list-label')]
										}),
										new sap.m.Column({styleClass:"colum",hAlign:"Right",width:"8.2rem",header:[new sap.m.Label({text:"CANTIDAD A ENVIAR"}).addStyleClass('list-label')]
										}),
										new sap.m.Column({styleClass:"colum",width:"6rem",header:[new sap.m.Label({text:"UNID MEDIDA"}).addStyleClass('list-label')]
										}),
										new sap.m.Column({styleClass:"colum",hAlign:"Right",width:"4.8rem",header:[new sap.m.Label({text:"PESO (KG)"}).addStyleClass('list-label')]
										}),
										new sap.m.Column({styleClass:"colum",width:"5.2rem",header:[new sap.m.Label({text:"ECRI"}).addStyleClass('list-label')]
										})
									],
									items:{
										path: '/results',
										template: new sap.m.ColumnListItem({
											cells:[
												new sap.m.Text({text:"{Zmatnr}"}).addStyleClass('list-label"'),
												new sap.m.Text({text:"{Zmaktx}"}).addStyleClass('list-label'),
												new sap.m.Text({text:"{Zvemng}"}).addStyleClass('list-label'),
												new sap.m.Text({text:"{Zgewei}"}).addStyleClass('list-label'),
												new sap.m.Text({text:"{ZbrgewM}"}).addStyleClass('list-label'),
												new sap.m.Text({text:"{Zecri}"}).addStyleClass('list-label'),
											]
										})
									}
								}).addStyleClass("sapUiSizeCompact tableMaterial");
								oTable.setModel(oJsonModel);
								
								VBoxPedidos.addItem(oTable);
								VBoxPedidos.addItem(brhtml);
								
								VBoxBultos.addItem(VBoxPedidos);
							}
							
						}

						
						
						VBoxPrincipal.addItem(VBoxBultos);
						oView.byId("total").addItem(VBoxPrincipal);
					}

					oDialog.open();
					for(var i=0;i<arrCita.length;i++){
						var textQRCita = arrCita[i].cita + "|" + arrCita[i].arrtext + "|" + arrCita[i].nombre + "|" + arrCita[i].placa + "|" + arrCita[i].fecha + "|" + arrCita[i].hora;
						var textQREntrega =arrCita[i].destino +"|"+arrCita[i].entrega+"|"+arrCita[i].nbultos+"|"+arrCita[i].condEnt+"|"+arrCita[i].direccion+"|"+arrCita[i].fecha+"|"+arrCita[i].hora+"|"+arrCita[i].pesoTotBultos+"|"+arrCita[i].zona;
						qrcode = new QRCode(document.getElementById(arrCita[i].qrcita), {
							text:textQRCita, //ESTE ES EL TEXTO SE CONVERTIRA EL EL CODIGO QR 
							width: "120",
							height: "120",
							colorDark: "#000000",
							colorLight: "#ffffff",
							correctLevel: QRCode.CorrectLevel.H
						});

						qrcode = new QRCode(document.getElementById(arrCita[i].qrentrega), {
							text:textQREntrega, //ESTE ES EL TEXTO SE CONVERTIRA EL EL CODIGO QR 
							width: "120",
							height: "120",
							colorDark: "#000000",
							colorLight: "#ffffff",
							correctLevel: QRCode.CorrectLevel.H
						});
						console.log("textQRCita",textQRCita)
						console.log("textQREntrega",textQREntrega)
					}

					for(var i=0;i<arrQrBultos.length;i++){
						var textQRBulto =arrQrBultos[i].ordencompras +"|"+arrQrBultos[i].dimensionbulto+"|"+arrQrBultos[i].pesobulto+"|"+arrQrBultos[i].cantidad+"|"+arrQrBultos[i].ecri;
						qrcode = new QRCode(document.getElementById(arrQrBultos[i].qrBultos), {
							text:textQRBulto, //ESTE ES EL TEXTO SE CONVERTIRA EL EL CODIGO QR 
							width: "80",
							height: "80",
							colorDark: "#000000",
							colorLight: "#ffffff",
							correctLevel: QRCode.CorrectLevel.H
						});
						console.log("textQRBulto",textQRBulto)
					}
					
				});
			} else {
				oView.byId("DialogFormatQR").open();
			}
			//generar pdf's con listaGeneral: fin -------------------------------------------
			that.saveCitaHanaScp(context, citax);

		},
		saveCitaHanaScp: function (context, cita) {
			var that = this;
			jQuery.sap.require("jquery.sap.storage");
			context._oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);

			var obj = {
				ID_CITA: cita
			};

			$.ajax({
				url: "/XS_IPROVIDER_ENTREGA/IPROVIDER_ENTREGA/CITAS/GenerarCita.xsjs",
				type: "POST",
				contentType: 'text/json',
				async: false,
				headers: {
					Authorization: "Basic VVNSX1JBVkE6UmF2YTIwMjAk"
				},
				data: JSON.stringify(obj),
				success: function (data) {

					
					// that.LISTA_GENERAL = [];
					context.getDataMain();
					BusyIndicator.hide();
					
					sap.m.MessageBox.success("Se ha generado el número de cita " + cita, {
						title: "Mensaje de éxito",
						actions: ["OK"],
						onClose: function (sActionClicked) {
							if (sActionClicked === "OK") {
								// BusyIndicator.show();
								// context.byId("DialogResumen").close();
								context.byId("DialogMant").close();
								context.byId("DialogConfirmarCentro").close();
								// context._oStorage.put('COMPLETE', '');
								// context.getDataMain();
								// BusyIndicator.hide();
							}
						}
					});
					// }
					//-------------------------------------------------------------------------------
				},
				error: function (e) {
					sap.m.MessageBox.alert("Error al garabar cita en scp");
					BusyIndicator.hide();
				}
			});
		},
		generateQR: function (context, cita) {
			var that = this;
			jQuery.sap.require("jquery.sap.storage");
			that._oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);
			var data = [];
			data = that._oStorage.get('LISTA_GENERAL');
			var listQR = [];
			var baseURL = "http://chart.apis.google.com/chart?cht=qr&chs=250x250&chl=";
			if (data.length > 0) {
				var listaAux = [];
				data.forEach(function (value, index) {

					var obj1 = {

						Zlaeng: value.Zlaeng,
						Zlfdat: value.Zlfdat,
						Zlfuhr: value.Zlfuhr,
						Zmaktx: value.Zmaktx,
						Zmatnr: value.Zmatnr,
						Zobservacion: value.Zobservacion,
						Zplaca: value.Zplaca,
						Zseqnr: value.Zseqnr,
						ZsmtpAddr: value.ZsmtpAddr,
						Zvbeln: value.Zvbeln,
						ZvbelnF: value.ZvbelnF,
						Zvegr2: value.Zvegr2,
						Zvemng: value.Zvemng,
						ZvhilmKu: value.ZvhilmKu,
						Zwerks: value.Zwerks,
						ZzlugEnt: value.ZzlugEnt,
						Zzona: value.Zzona
					};

					listaAux.push(obj1);
					var obj = {
						Zanzpk: value.Zanzpk,
						Zbezei: value.Zbezei,
						Zbolnr: value.Zbolnr,
						Zbreit: value.Zbreit,
						ZbrgewB: value.ZbrgewB,
						ZbrgewM: value.ZbrgewM,
						Zbtgew: value.Zbtgew,
						Zcita: value.Zcita,
						ZcitaF: value.ZcitaF,
						Zdireccion: value.Zdireccion,
						Zdni: value.Zdni,
						Zebeln: value.Zebeln,
						Zecri: value.Zecri,
						Zgewei: value.Zgewei,
						Zgort: value.Zgort,
						Zhoehe: value.Zhoehe,
						Zlaeng: value.Zlaeng,
						Zlfdat: value.Zlfdat,
						Zlfuhr: value.Zlfuhr,
						Zmaktx: value.Zmaktx,
						Zmatnr: value.Zmatnr,
						Zobservacion: value.Zobservacion,
						Zplaca: value.Zplaca,
						Zseqnr: value.Zseqnr,
						ZsmtpAddr: value.ZsmtpAddr,
						Zvbeln: value.Zvbeln,
						ZvbelnF: value.ZvbelnF,
						Zvegr2: value.Zvegr2,
						Zvemng: value.Zvemng,
						ZvhilmKu: value.ZvhilmKu,
						Zwerks: value.Zwerks,
						ZzlugEnt: value.ZzlugEnt,
						Zzona: value.Zzona
					};

					listaAux.push(obj);

					listaAux.forEach(function (value2, index2) {
						var allString = "";
						allString = JSON.stringify(obj);
						var aux1 = Utilities.replaceAll(allString, '"', '');
						var aux2 = Utilities.replaceAll(aux1, '{', '');
						var aux3 = Utilities.replaceAll(aux2, '}', '');
						var aux4 = Utilities.replaceAll(aux3, ',', '~');
						var url = baseURL + aux4;
						listQR.push(url);
						// setting final URL to image,which I have taken in view....
						// this.byId("imgId").setSrc(url);
					});

					that.generatePDF(context, cita, listQR);
					listaAux = [];
					listQR = [];
				});

				//guardar cita en SCP
				that.saveCitaHanaScp(context, cita);
			}
		},
		generatePDF: function (context, cita, lista) {
			var that = this;
			var doc = new jsPDF();

			for (var i = 0; i < lista.length; i++) {
				var url = lista[0];
				// var split = Spliturl.slice(0, 169);
				var Parameters = url.split("chl=");
				var values = Parameters[1];
				var Fianlvalues = values.split("~");

				/* ------- URL converstion to base64_data ------*/

				var convertImgToDataURLviaCanvas = function (url, callback) {
					var img = new Image();
					img.crossOrigin = 'Anonymous';
					// var dataURL;
					img.onload = function () {

						var canvas = document.createElement('CANVAS');
						var ctx = canvas.getContext('2d');
						var dataURL;
						canvas.height = this.height;
						canvas.width = this.width;
						ctx.drawImage(this, 0, 0);
						dataURL = canvas.toDataURL();
						callback(dataURL);
						canvas = null;
					};
					// doc.save('Test.pdf');
					img.src = url;

				};

				convertImgToDataURLviaCanvas(url, function (base64_data) {
					console.log(base64_data);
					var sometext1 = "QRCode and it's Veriables";
					var sometext = Fianlvalues;

					doc.addImage(base64_data, 'JPEG', 15, 40, 180, 160);
					// doc.addPage();
					// pdf.text(70, 10, sometext1);
					// pdf.text(5, 30, sometext);

					doc.save('Test.pdf');
				});

			}

			// doc.save('Test.pdf');

		}

	};
});