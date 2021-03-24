sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	'sap/m/Token',
	'./MethodRepository',
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
	"sap/m/DialogType",
	"sap/m/Button",
	"sap/m/ButtonType",
	"sap/m/Text",
	"sap/ui/core/Fragment",
	"sap/ui/core/syncStyleClass",
	"sap/ui/core/BusyIndicator",
	"../model/formatter",
	"sap/m/PDFViewer"
], function (BaseController, MessageBox, Utilities, History, Token, MethodRepository, JSONModel, Dialog, DialogType, Button, ButtonType,
	Text, Fragment, syncStyleClass, BusyIndicator, formatter, PDFViewer) {
	"use strict";
	var AMBIENTE = " DEV";
	var qrcode;
	var ValidatePestaña =  true;
	var validarFechaAdjuntar = true ;
	var cantidadGeneral = 0 ;
	// var materialesAux;
	// var listaAux ;
	// var listaVAux;
	
	return BaseController.extend("com.rava.controller.RegistroEntrega", {
		// set the formatter
		formatter: formatter,
		quantity: function (iInteger) {
			var num = iInteger * 1;

			var sReturn = num.toFixed(2);
			// var sReturn = (iInteger).toFixed(2);

			// return sReturn to the view
			return sReturn;

		},
		onAfterRendering: function () {
			if (cantidadGeneral===0){
			var that = this;
			jQuery.sap.require("jquery.sap.storage");
			that._oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);
			var oView = that.getView();
			that.pdfViewer = new PDFViewer();
			that.getView().addDependent(that.pdfViewer);
			
			that.pdfViewer1 = new PDFViewer();
			that.getView().addDependent(that.pdfViewer1);
			var today = new Date();
			today.setHours(today.getHours() + 24);
			
			// var ModeloProyect = oView.getModel("Proyect");
			sap.ui.core.BusyIndicator.show(0);
			//get current ruc
			// MethodRepository.getRuc(that);
			var ModeloProyect = oView.getModel("Proyect");
				ModeloProyect.setProperty("/FechaMin",today);
					ModeloProyect.setProperty("/Visible1" ,true );
					ModeloProyect.setProperty("/Visible2" ,false );
			ModeloProyect.setProperty("/SeleccionAnterior",{ZzlugEnt :"GG"});
			ModeloProyect.setProperty("/TextGuardar" ,"Guardar y Generar QR" );
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
					currentRuc = response.data.ruc;
					// currentRuc = "20106740004";
					that._oStorage.put('CURRENT_RUC', currentRuc);
					that.getDataMain();
					that.getDateTarget2();
					// that.materialesAux	= MethodRepository.getMateriales("M", 1);
					// that.listaAux		= MethodRepository.getDocPersonaVehiculo1("P", 1);
					// that.listaVAux		= MethodRepository.getDocPersonaVehiculo1("V", 1);
					
					
				},
				error: function () {
					//	that.getView().setBusy(false);
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error("Ocurrio un error al obtener la sesion");
					//alert("Ocurrio un error al obtener la sesion")
					
					// currentRuc = "20106740004";
					// that._oStorage.put('CURRENT_RUC', currentRuc);
					// that.getDataMain();
					// that.getDateTarget2();
				}
			});
			}
			
		},
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("Page1").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			this.getCondEntregaConstant("MM","REGISTRO_ENTREGA_PORTAL","COND_ENTREGA");
			this.getCentro("MM","REGISTRO_ENTREGA_PORTAL","CENTRO");
		},
		handleRouteMatched:function(){
			localStorage.setItem("arrayEntregas", []);
			localStorage.setItem("arrayEntregasTarjet2", []);
			
			var ModeloProyect = this.getView().getModel("Proyect");
			ModeloProyect.setProperty("/DataContadorValidarEntrega",0);
		},
		getDateTarget2:function(){
			var that = this;
			var oView= this.getView();
			
			var ModeloProyect2 = oView.getModel("Proyect2");
			var ruc = that._oStorage.get('CURRENT_RUC');
			// var ruc = "20106740004";
			var url="/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_REGISTRO_ENTRE_SRV/ZET_RELRUCPEDSet?$filter=IRuc eq"+  "'" + ruc  +"'&$format=json";
			// console.log(url)
			var oJsonModel = new sap.ui.model.json.JSONModel();
			jQuery.ajax({
				type: "GET",
				cache: false,
				headers: {"Accept": "application/json"},
				contentType: "application/json",
				url: url,
				async: true,
				success: function (data, textStatus, jqXHR) {
					// console.log(data)
					for(var i=0;i<data.d.results.length;i++){
						data.d.results[i].ZBulto = parseInt(data.d.results[i].ZBulto).toString();
						data.d.results[i].ZCant = parseInt(data.d.results[i].ZCant).toString();
					}
					var cantidadCita = data.d.results.length ;
					var Citas = [];
					while (cantidadCita !== 0) {
						var dataCita = data.d.results[0];
						var arrayCita = [];
						var i = 1;
						for (i; i < cantidadCita; i++) {
							if (dataCita.ZCita === data.d.results[i].ZCita) {
								arrayCita.push(data.d.results[i]);
								cantidadCita--;
								data.d.results.splice(i, 1);
								i--;
							}
						}
						arrayCita.push(data.d.results[0]);
						data.d.results.splice(0, 1);

						cantidadCita--;

						var ZCita		= arrayCita[0].ZCita;
						var ZZLug_ent	= arrayCita[0].ZZLug_ent;
						var ZLfdat		= arrayCita[0].ZLfdat;
						var ZLfhur		= arrayCita[0].ZLfhur;
						var ZPlaca		= arrayCita[0].ZPlaca;
						var ZDni		= arrayCita[0].ZDni;
						var ZDni2		= arrayCita[0].ZDni2;
						var ZDni3		= arrayCita[0].ZDni3;
						var ZDni4		= arrayCita[0].ZDni4;
						var ZCant		= arrayCita[0].ZCant;
						var ZBulto		= arrayCita[0].ZBulto;

							var dataCitas = {
							ZCita: ZCita,
							ZZLug_ent: ZZLug_ent,
							ZLfdat: ZLfdat,
							ZLfhur: ZLfhur,
							ZPlaca: ZPlaca,
							ZDni: ZDni,
							ZDni2: ZDni2,
							ZDni3: ZDni3,
							ZDni4: ZDni4,
							ZCant: ZCant,
							ZBulto:ZBulto,
							ArrayGeneral: arrayCita

						};

						Citas.push(dataCitas);

					}
					that.CitasEntregas = Citas ;
					// var model = new JSONModel(Citas);
					ModeloProyect2.setProperty("/Citas",[]);
					ModeloProyect2.setProperty("/Citas",Citas);
					ModeloProyect2.refresh(true);
					// that.getView().byId("table2").setModel(model, "Proyect2");
					// that.getView().getModel("Proyect2").refresh(true);
				},
				error: function () {
					MessageBox.error("Ocurrio un error al obtener los datos");
				}
			});
		},
		formatDate:function(sValue){
			if(sValue==null){
			}else{
				var date=sValue.toString();
				var anio=sValue.substr(0,4)
				var mes=sValue.substr(4,2)
				var dia = sValue.substr(6)
				var fecha=dia+"."+mes+"."+anio
				return fecha;
			}
		},
		formatHour:function(sValue){
			if(sValue==null){
			}else{
				var hours=sValue.toString();
				var hour=sValue.substr(0,2)
				var min=sValue.substr(2,2)
				var second = sValue.substr(4)
				var fecha=hour+":"+min+":"+second
				return fecha;
			}
		},
		formatDecimal:function(sValue){
			if(sValue != null &&  sValue != ""){
				var decimal = parseFloat(sValue.toString());
				var conDecimal = decimal.toFixed(2); 
				var newDecimal = conDecimal.toString();
				return newDecimal;
			}else{
				return sValue;
			}
		},
		getCentroContantes: function (modulo, aplicativo, funcion) {
			var oControl = this;
			var lista = [];
			var url = "/XS_IPROVIDER_ENTREGA/IPROVIDER_ENTREGA/ENTREGA_PROVEEDOR/Registro_ENTREGAPROVEEDOR.xsjs?modulo=" + modulo + "&aplicativo=" + aplicativo +
				"&funcion=" + funcion;
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
				// lista = result.results;
				lista = Object.values(result);
			}, function errorCallback(xhr, readyState) {
				jQuery.sap.log.debug(xhr);
			});
			return lista;
		},
		getCondEntregaConstant:function(modulo,aplicativo,funcion){
			var that=this;
			var oView=this.getView();
			$.ajax({
				url: "/XS_IPROVIDER_ENTREGA/IPROVIDER_ENTREGA/ENTREGA_PROVEEDOR/Registro_ENTREGAPROVEEDOR.xsjs?modulo="+modulo+"&aplicativo="+aplicativo+"&funcion="+funcion,
				method: "GET",
				contentType: 'application/json',
				headers: {Authorization: "Basic VVNSX1JBVkE6UmF2YTIwMjAk"},
				success: function (data) {
					// console.log(data)
					var ModeloProyect = oView.getModel("Proyect");
					var cant = Object.keys(data).length;
					const myObj = {}
					for ( var i=0, len=cant; i < len; i++ )
				    myObj[data[i]['DESCRIPCION']] = data[i].DESCRIPCION;
					
					var data = new Array();
					for ( var key in myObj )
					data.push(myObj[key]);
					ModeloProyect.setProperty("/DataCondEntrega", data)
				},
				error: function (e) {
					console.log("Ocurrio un error" + JSON.parse(e))
				}
			});
		},
		getCentro:function(modulo,aplicativo,funcion){
		var that=this;
		var oView=this.getView();
		
			$.ajax({
				url: "/XS_IPROVIDER_ENTREGA/IPROVIDER_ENTREGA/ENTREGA_PROVEEDOR/Registro_ENTREGAPROVEEDOR.xsjs?modulo="+modulo+"&aplicativo="+aplicativo+"&funcion="+funcion,
				method: "GET",
				contentType: 'application/json',
				headers: {Authorization: "Basic VVNSX1JBVkE6UmF2YTIwMjAk"},
				success: function (data) {
					
				var ModeloProyect = oView.getModel("Proyect");
					var cant = Object.keys(data).length;
					const myObj = {}
					for ( var i=0, len=cant; i < len; i++ )
				    myObj[data[i]['CENTRO']] = data[i].CENTRO;
					
					var data = new Array();
					for ( var key in myObj )
					data.push(myObj[key]);
				
				
				ModeloProyect.setProperty("/DataCentro",data);
				
					
				},
				error : function(e){
					console.log("Ocurrio un error" + JSON.parse(e))
				}
			});
			
			
		},
		
		refreshDataMain: function () {
			sap.ui.core.BusyIndicator.show(0);
			var that = this;
			that.getDataMain();
			that.getDateTarget2();
			// BusyIndicator.show(0);

		},
		getDataMain: function () {
			var that = this;
			var lista = [];
			var lista2 = [];
			var oView = that.getView();
			var ModeloProyect = oView.getModel("Proyect");
			var ModeloProyect2 = oView.getModel("Proyect2");
			var ruc = that._oStorage.get('CURRENT_RUC');
			var url = "/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_REL_PEDC_XCONF_SRV/RelacionPedEntSet?$filter=IRuc eq '" + ruc +
				"'&$format=json";

			jQuery.ajax({
				method: 'GET',
				cache: false,
				contentType: 'application/json',
				// headers: {Authorization: "Basic VVNSX1JBVkE6UmF2YTIwMjAk"},
				async: true,
				url: url
			}).then(function successCallback(result, xhr, data) {
					//token = data.getResponseHeader("X-CSRF-Token");
					var listaAux = result.d.results;
					var listaFinal = [];
					// var exist;
					//Eliminar duplicidad: inicio-------------------------------------------------------------------------------
					if (listaAux.length > 0) {
						listaFinal = Utilities.deleteDuplicationObject(listaAux);
					}
					//Eliminar duplicidad: fin-------------------------------------------------------------------------------
					// $.each(listaAux, function (index, value) {
					var listaEntregasComp = [];
					var listaEntregasFinal = [];
					$.each(listaFinal, function (index, value) {
						if (value.Zzlfstk === 'P') {
							value.Lfdat = Utilities.getFormatFecha(value.Lfdat);
							value.Lfuhr = Utilities.formatHour(value.Lfuhr);

							// if (value.Zzlfstk === 'R') {
							// 	var entregaReg = that.getEntregReg(value.Vbeln);
							// 	value.Zcita = entregaReg[0].Zcita;
							// 	value.Zbolnr = entregaReg[0].Zbolnr;
							// } else {
							value.Zcita = "";
							value.Zbolnr = "";
							// }

							// value.Status = value.Zcita === '' ? "Pendiente" : "Completado";
							value.Status = value.Zzlfstk === 'P' ? "Pendiente" : "Completado";

							lista.push(value);
						}
						if (value.Zzlfstk === 'R') {
							value.Lfdat = Utilities.getFormatFecha(value.Lfdat);
							value.Lfuhr = Utilities.formatHour(value.Lfuhr);
							listaEntregasFinal.push(value);
							listaEntregasComp.push(value.Vbeln);
						}
					});

					//enviar lista de entregas completadas
					var response = that.getCitaGuiaFromEntComp(listaEntregasComp);
					listaEntregasFinal.forEach(function (value1, index1) {
						response.forEach(function (value2, index2) {
							if (value1.Vbeln === (value2.Zvbeln * 1) + '') {
								value1.Zcita = value2.Zcita;
								value1.Zbolnr = value2.Zbolnr;
								value1.Status = value1.Zzlfstk === 'P' ? "Pendiente" : "Completado";

								lista2.push(value1);
							}

						});
					});
					var obj = {
						data: lista2
					};

					var model = new JSONModel(obj);
					// that.getView().byId("table2").setModel(model, "Proyect2");
					// console.log(lista)
					ModeloProyect.setProperty("/Data", lista);
					ModeloProyect.refresh(true);
					
					
					// ModeloProyect2.setProperty("/Data", lista2);
					// ModeloProyect2.refresh(true);
					

					sap.ui.core.BusyIndicator.hide();

				},
				function errorCallback(xhr, readyState) {
					sap.ui.core.BusyIndicator.hide();
					oView.byId("idConfirmar").setEnabled(false);
					MessageBox.show(
						xhr.responseText, {
							icon: sap.m.MessageBox.Icon.INFORMATION,
							title: "",
							actions: ['OK'],
							onClose: function (sActionClicked) {}
						}
					);
					jQuery.sap.log.debug(xhr);
				});

			// return lista;
		},
		getCitaGuiaFromEntComp: function (lista) {
			var oControl = this;
			var response;
			var listaFinal = [];
			var endUrl = "&$format=json";
			var url = "/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_REL_PEDC_XCONF_SRV/ZetregistroSet?$filter=";

			lista.forEach(function (value, index) {
				url = url + "Zvbeln eq '" + value + "' or ";
			});

			var tamanio = url.length;
			var urlFinal = url.substring(0, tamanio - 4) + endUrl;

			jQuery.ajax({
				method: 'GET',
				cache: false,
				headers: {
					"X-CSRF-Token": "Fetch"
				},
				async: false,
				url: urlFinal
			}).then(function successCallback(result, xhr, data) {
				//token = data.getResponseHeader("X-CSRF-Token");
				// var aux = result.d.results;
				// aux.forEach(function (value, index) {
				// 	if (numEntrega === value.Zvbeln) {
				// 		response.push(value);
				// 	}
				// });
				response = result.d.results;
				lista.forEach(function (value, index) {
					response.forEach(function (value2, index2) {
						var entrega = value2.Zvbeln * 1;
						if (value === entrega + '' && !Utilities.isEmpty(value2.Zcita)) {
							listaFinal.push(value2);
						}
					});
				});
			}, function errorCallback(xhr, readyState) {
				sap.ui.core.BusyIndicator.hide();
				jQuery.sap.log.debug(xhr);
			});
			return listaFinal;
		},
		//validation table1
		ValidarCamposEntrega:function(oEvent){
			var that=this;
			var oView=this.getView();
			var ModeloProyect = oView.getModel("Proyect");
			var condEntrega = ModeloProyect.getProperty("/DataCondEntrega");
			var CentroHana	=ModeloProyect.getProperty("/DataCentro");
			var contador=0;
			var table = oView.byId("table");
			var context = oEvent.getParameter("rowContext");
			if(context != null){
				var path = context.sPath;
				var Object = oView.getModel("Proyect").getProperty(path);
			}
			
			var oIndex = oEvent.getParameter('rowIndex');
			var Selecciones =table.getSelectedIndices();
			// var selectedEntries=[];
			
			
			// for(var i=0; i<Selecciones.length; i++){
			// 	var oData = table.getContextByIndex(Selecciones[i]);
			// 	selectedEntries.push(oData.getProperty(oData.getPath()));
			// }
			
			if(Selecciones.length>1){
				var a = ModeloProyect.getProperty("/SeleccionAnterior");
				
				if(a.ZzlugEnt !=="GG"){
				Selecciones.forEach(function(sel){
				var oData = table.getContextByIndex(sel);
				
				var obj    =oData.getProperty(oData.getPath());
				var validarCentro = false ;
				var validarCentro1 = false ;
				
				CentroHana.forEach(function(Ce){
					if(Ce.CENTRO === obj.Werks){
					validarCentro=true;				
					}
					if (Ce.CENTRO === a.Werks){
					validarCentro1=true;
					}
				});
				
				if(a.ZzlugEnt != obj.ZzlugEnt || a.Lfdat != obj.Lfdat || a.Lfuhr != obj.Lfuhr || validarCentro !== validarCentro1){
					// if(validarCentro !== validarCentro1){
					table.removeSelectionInterval(sel,sel);
					// }
				}
				
					
				});
				}else {
				table.removeSelectionInterval(0,Selecciones.length - 1);
				sap.m.MessageToast.show("Seleccione una Entrega");
				}
				
				
			}else if(Selecciones.length==1){
				var oData = table.getContextByIndex(Selecciones[0]);
				
				for(var i=0; i<condEntrega.length; i++){
					if(oData.getProperty(oData.getPath()).ZzlugEnt==condEntrega[i]){
						contador=1;
					}
				}
				ModeloProyect.setProperty("/SeleccionAnterior",oData.getProperty(oData.getPath()));
				ModeloProyect.setProperty("/DataContadorValidarEntrega",contador);
				
			}else{
				ModeloProyect.setProperty("/SeleccionAnterior",{ZzlugEnt :"GG"});
				ModeloProyect.setProperty("/DataContadorValidarEntrega",0);
			}
			
			// console.log(selectedEntries)
			// localStorage.setItem("arrayEntregas", JSON.stringify(selectedEntries));
		},
		confirmarCentro: function () {
			var that = this;
			var ModeloProyect = this.getView().getModel("Proyect");
			var ContadorValidarEntrega=ModeloProyect.getProperty("/DataContadorValidarEntrega") 
			jQuery.sap.require("jquery.sap.storage");
			that._oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);
			var oView = that.getView();
			var table = oView.byId("table");
			var indexes = table.getSelectedIndices();
			var lista = [];
			var listaOtros = [];
			var centroConstantes = that.getCentroContantes("MM", "REGISTRO_ENTREGA_PORTAL", "CENTRO");
			
			ModeloProyect.setProperty("/Direccion","");
			// {Proyect>/Direccion}
			
			that.entregaGuiaSelected = [];
			
			if (indexes.length > 0) {

				var validarVacio = true;
				var validarStatus = false;
				var validarCantGuia = false;
				var validarCentro = false;
				var validarAlmacen = true;
				var validarFecha = true;
				var before_object;

				if (indexes.length < 2) {
					
					var obj = table.getContextByIndex(indexes[0]).getObject();
					var valueGuia = obj.Zbolnr;
					var valueStatus = obj.Zzlfstk;

					if (Utilities.isEmpty(valueGuia)) {
						validarVacio = false;
					}
					if (valueStatus == 'R') {
						validarStatus = true;
					}
					if (Utilities.validateMask(valueGuia) === "error") {
						validarCantGuia = true;
					}

					if (validarStatus) {
						MessageBox.show(
							"Seleccione solo entregas pendientes", {
								icon: sap.m.MessageBox.Icon.INFORMATION,
								title: "Mensaje",
								actions: ['OK'],
								onClose: function (sActionClicked) {}
							}
						);

						return;
					}
					if (!validarVacio) {
						MessageBox.show(
							"Ingrese el número de guia de las entregas seleccionadas", {
								icon: sap.m.MessageBox.Icon.INFORMATION,
								title: "Mensaje",
								actions: ['OK'],
								onClose: function (sActionClicked) {}
							}
						);

						return;
					}

					if (validarCantGuia) {
						MessageBox.show(
							"El número de guia esta imcompleto", {
								icon: sap.m.MessageBox.Icon.INFORMATION,
								title: "Mensaje",
								actions: ['OK'],
								onClose: function (sActionClicked) {}
							}
						);

						return;
					}

					that.entregaGuiaSelected.push(obj);
					
					
					
					// if (!oDialog) {
					// 	// load asynchronous XML fragment
					// 	oDialog = sap.ui.xmlfragment(oView.getId(), "com.rava.project.fragment.ConfirmarCentro", that);
					// 	oView.addDependent(oDialog);
					// 	// console.log(oView.byId(elementDireccion).getVisible())
					// 	var oMultiInput1 = oView.byId("multiInput1");
					// 	oMultiInput1.setValue("");
					// 	oMultiInput1.setTokens([]);
					// 	var oMultiInput2 = oView.byId("multiInput2");
					// 	oMultiInput2.setTokens([]);
					// 	oDialog.open();
					// 	if(ContadorValidarEntrega == 1){
					// 		that.getView().byId("elementDireccion").setVisible(true)
					// 	}else{
					// 		that.getView().byId("elementDireccion").setVisible(false)
					// 	}
					// } else {
					// 	var oMultiInput1 = oView.byId("multiInput1");
					// 	oMultiInput1.setValue("");
					// 	oMultiInput1.setTokens([]);
					// 	var oMultiInput2 = oView.byId("multiInput2");
					// 	oMultiInput2.setTokens([]);
					// 	oDialog.open();
						
					// 	if(ContadorValidarEntrega == 1){
					// 		that.getView().byId("elementDireccion").setVisible(true)
					// 	}else{
					// 		that.getView().byId("elementDireccion").setVisible(false)
					// 	}
					// }

				} else {
					var validarRepetidos = false ;
					var FirstObject =table.getContextByIndex(indexes[0]).getObject();

					indexes.forEach(function (value, index) {
						var object_index = table.getContextByIndex(value).getObject();
						var valueGuia = object_index.Zbolnr;
						var valueStatus = object_index.Zzlfstk;
						
						if(index >0){
						if(object_index.Zbolnr === FirstObject.Zbolnr){
							validarRepetidos = true;
						}
						}

						if (index == 0) {
							before_object = object_index;
							centroConstantes.forEach(function (value2, index2) {
								if (object_index.Werks === value2.CENTRO) {
									validarCentro = true;

								}

							});

							if (validarCentro) {
								lista.push(object_index);
							} else {
								listaOtros.push(object_index);
							}

						} else {
							validarCentro = false;
							centroConstantes.forEach(function (value2, index2) {
								if (object_index.Werks === value2.CENTRO) {
									validarCentro = true;

								}

							});

							if (validarCentro) {
								lista.push(object_index);
							} else {
								listaOtros.push(object_index);
							}

							// if (object_index.Lgort !== before_object.Lgort) {
							// 	validarAlmacen = false;

							// }
							if (object_index.Lfdat !== before_object.Lfdat) {
								validarFecha = false;

							}

						}

						// if (object_index.Lgort !== before_object.Lgort) {
						// 	validarAlmacen = false;

						// }

						if (Utilities.isEmpty(valueGuia)) {
							validarVacio = false;
						}
						if (valueStatus == 'R') {
							validarStatus = true;
						}
						if (Utilities.validateMask(valueGuia) === "error") {
							validarCantGuia = true;
						}

						that.entregaGuiaSelected.push(object_index);

					});

					if(validarRepetidos){
						MessageBox.show(
							"Escriba Guias diferentes de cada entrega", {
								icon: sap.m.MessageBox.Icon.WARNING,
								title: "Mensaje de Advertencia",
								actions: ['OK'],
								onClose: function (sActionClicked) {}
							}
						);

						return;	
						
					}

					if (validarStatus) {
						MessageBox.show(
							"Seleccione solo entregas pendientes", {
								icon: sap.m.MessageBox.Icon.INFORMATION,
								title: "Mensaje",
								actions: ['OK'],
								onClose: function (sActionClicked) {}
							}
						);

						return;
					}

					if (lista.length > 0 && listaOtros.length > 0) {

						MessageBox.show(
							"Seleccione solo Centros de la misma unidad física o virtual", {
								icon: sap.m.MessageBox.Icon.INFORMATION,
								title: "Mensaje",
								actions: ['OK'],
								onClose: function (sActionClicked) {}
							}
						);

					}

					if (listaOtros.length > 0) {

						var firstOtros = listaOtros[0];
						listaOtros.forEach(function (value, index) {
							if (value.Werks !== firstOtros.Werks) {
								MessageBox.show(
									"Seleccione solo Centros de la misma unidad física o virtual", {
										icon: sap.m.MessageBox.Icon.INFORMATION,
										title: "Mensaje",
										actions: ['OK'],
										onClose: function (sActionClicked) {}
									}
								);

								return;
							}
						});

					}

			
					if (!validarFecha) {
						MessageBox.show(
							"Seleccione solo entregas de la misma Fecha", {
								icon: sap.m.MessageBox.Icon.INFORMATION,
								title: "Mensaje",
								actions: ['OK'],
								onClose: function (sActionClicked) {}
							}
						);

						return;
					}

					if (!validarVacio) {
						MessageBox.show(
							"Ingrese el número de guia de las entregas seleccionadas", {
								icon: sap.m.MessageBox.Icon.INFORMATION,
								title: "Mensaje",
								actions: ['OK'],
								onClose: function (sActionClicked) {}
							}
						);

						return;
					}

					if (validarCantGuia) {
						MessageBox.show(
							"El número de guia esta imcompleto", {
								icon: sap.m.MessageBox.Icon.INFORMATION,
								title: "Mensaje",
								actions: ['OK'],
								onClose: function (sActionClicked) {}
							}
						);

						return;
					}
				

				}

			} else {
				MessageBox.show(
					"Seleccione al menos un registro pendiente", {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						title: "Mensaje",
						actions: ['OK'],
						onClose: function (sActionClicked) {}
					}
				);
				return ;
			}
			sap.ui.core.BusyIndicator.show(0);
				var Url ="/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_REL_PEDC_XCONF_SRV/Zet_verifa_guia_detSet?&$filter=" ;
					that.entregaGuiaSelected.forEach(function(obj , index){
						
						if(index === 0){
						Url +=  "LifnrBolnr  eq '"+ obj.Lifnr + " " +obj.Zbolnr+"'";
						}else {
						Url +=	" or LifnrBolnr  eq '" + obj.Lifnr +" " +obj.Zbolnr+"'";
						}
						
					});
					jQuery.ajax({
					url: Url +"&$format=json",
					type: "GET",
					crossDomain: true,
					success: function (data) {
					var oDialog = that.byId("DialogConfirmarCentro");
					sap.ui.core.BusyIndicator.hide();
					if (data.d.results.length === 0){
						if (!oDialog) {
						// load asynchronous XML fragment
						oDialog = sap.ui.xmlfragment(oView.getId(), "com.rava.project.fragment.ConfirmarCentro", that);
						oView.addDependent(oDialog);
						var oMultiInput1 = oView.byId("multiInput1");
						oMultiInput1.setValue("");
						oMultiInput1.setTokens([]);
						var oMultiInput2 = oView.byId("multiInput2");
						oMultiInput2.setTokens([]);
						oDialog.open();
						
						if(ContadorValidarEntrega == 1){
							that.getView().byId("elementDireccion").setVisible(true)
							ModeloProyect.setProperty("/ElementosyTablas" , false);
						}else{
							that.getView().byId("elementDireccion").setVisible(false)
							ModeloProyect.setProperty("/ElementosyTablas" , true);
						}
					} else {
						var oMultiInput1 = oView.byId("multiInput1");
						oMultiInput1.setValue("");
						oMultiInput1.setTokens([]);
						var oMultiInput2 = oView.byId("multiInput2");
						oMultiInput2.setTokens([]);
						oDialog.open();
						
						if(ContadorValidarEntrega == 1){
							that.getView().byId("elementDireccion").setVisible(true)
							ModeloProyect.setProperty("/ElementosyTablas" , false);
						}else{
							that.getView().byId("elementDireccion").setVisible(false)
							ModeloProyect.setProperty("/ElementosyTablas" , true);
						}
					}
					
					var oMultiInput1 = oView.byId("multiInput1");
					var oMultiInput2 = oView.byId("multiInput2");

					oMultiInput1.addValidator(function (args) {
					// if(args.suggestionObject === undefined){
					// 	return;
					// }
					that.dni = args.text;
					//consultar dni
					var dataPersona = MethodRepository.getDataPersonaVehiculo(that.dni);
	
					if (dataPersona.length > 0) {
						var tok = new Token({
							key: that.dni,
							text: that.dni
						});
						return args.asyncCallback(tok);
	
					} else {
	
						var DialogConfirmarRegistro = that.byId("DialogConfirmarRegistro");
						if (!DialogConfirmarRegistro) {
							// load asynchronous XML fragment
							DialogConfirmarRegistro = sap.ui.xmlfragment(oView.getId(), "com.rava.project.fragment.ConfirmarRegistro",
								that);
							oView.addDependent(DialogConfirmarRegistro);
							DialogConfirmarRegistro.open();
							return;
	
						} else {
							DialogConfirmarRegistro.open();
							return;
						}
						return;
					}
				});
	
					oMultiInput2.addValidator(function (args) {
					that.placa	=(args.text.substring(0,3)+"-"+args.text.substring(3,6)).toUpperCase() ;
					//consultar placa
					var dataVehiculo = MethodRepository.getDataPersonaVehiculo(that.placa);
					if (dataVehiculo.length > 0) {
						
						var token = new Token({
							key: that.placa.replace("-",""),
							text: that.placa.replace("-","")
						});
						
						return args.asyncCallback(token);
						
					} else {
						var obj = {};
						obj.TIPO_DOCUMENTO = "V";
						obj.NUMERO_IDENTIFICACION = that.placa;
						obj.NOMBRES = "";
						obj.APELLIDOS = "";
						var savePlaca = MethodRepository.savePlaca(obj);
						if (!Utilities.isEmpty(savePlaca)) {
							
							return new Token({
								key: that.placa.replace("-",""),
								text: that.placa.replace("-","")
								
							});
						} 
					}
				});	
					}else {
					var a =data.d.results ;	
					// that.removeDuplicates(a,"Bolnr");
					let filtered = a.reduce((accumulator, current) => {
					  if (! accumulator.find(({Bolnr}) => Bolnr === current.Bolnr)) {
					    accumulator.push(current);
					  }
					  return accumulator;
					}, []);
					
					
					var Mensaje = "";	
					filtered.forEach(function(obj,index){
						if(index === 0){
							Mensaje = "La(s) Guía(s) " +obj.Bolnr;
						}else {
							Mensaje +=" y " +obj.Bolnr ;
							
						if(filtered.length === index +1 ){
							Mensaje +=" ya existen.";
						}
						
						}
					
						
					});	
					if(filtered.length === 1){
						Mensaje +=" ya existe.";
					}
					MessageBox.show(
					Mensaje, {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Mensaje de Advertencia",
						actions: ['OK'],
						onClose: function (sActionClicked) {}
					}
					);
					return ;	
						
					}
					
					
				
							
						
					}, error : function (){
						
					}
					});

		
			
				// that.listaAux		= MethodRepository.getDocPersonaVehiculo1("P", 1);
				// that.listaVAux		= MethodRepository.getDocPersonaVehiculo1("V", 1);

		},

		responseConf: function (dni) {
			var that = this;
			var oView = that.getView();
			that.CloseDialogConfRegDni();
			var objInf = {
				recipient: {
					dni: that.dni,
					nombre: "",
					apellidos: ""
				}
			};
			var oModel = new JSONModel(objInf);
			var oDialog = that.byId("DialogRegistrarDni");
			if (!oDialog) {
				// load asynchronous XML fragment
				oDialog = sap.ui.xmlfragment(oView.getId(), "com.rava.project.fragment.RegistrarDni", that);
				oView.addDependent(oDialog);
				//set dni

				oDialog.setModel(oModel);

				oDialog.open();
				that.CloseDialogConfRegDni();

			} else {
				//set dni

				oDialog.setModel(oModel);

				oDialog.open();
				that.CloseDialogConfRegDni();

			}

			// that.CloseDialogConfRegDni();

		},
		CloseDialogConfRegDni: function () {
			var that = this;
			that.byId("DialogConfirmarRegistro").close();
			// that.getView().byId("DialogConfirmarRegistro").destroy();
		},
		CloseDialogRegDni: function () {
			var that = this;
			// that.Reg.close();
			that.byId("DialogRegistrarDni").close();
			that.byId("DialogConfirmarRegistro").close();
		},
		CancelarGuardarRoles: function () {
			var that = this;
			var oView = that.getView();
			oView.byId("table").clearSelection();
			oView.byId("table2").clearSelection();
			var ModeloProyect = oView.getModel("Proyect");
			var DataPestaña1  = ModeloProyect.getProperty("/Data");
			DataPestaña1.forEach(function(obj){
				obj.Zbolnr="";
				
			});
			ModeloProyect.setProperty("/Data",DataPestaña1);
			// that.byId("DialogConfirmarCentro").close();
			that.byId("DialogConfirmarCentro").close();
		},
		compareValues : function (key, order = 'asc') {
		  return function innerSort(a, b) {
		    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
		      // property doesn't exist on either object
		      return 0;
		    }
		
		    const varA = (typeof a[key] === 'string')
		      ? a[key].toUpperCase() : a[key];
		    const varB = (typeof b[key] === 'string')
		      ? b[key].toUpperCase() : b[key];
		
		    let comparison = 0;
		    if (varA > varB) {
		      comparison = 1;
		    } else if (varA < varB) {
		      comparison = -1;
		    }
		    return (
		      (order === 'desc') ? (comparison * -1) : comparison
		    );
		  };
		},
		
		getAttachmentMatPestaña2: function (materialesAux) {
			var that = this;
			var response;
			var oView = that.getView();
			var table = oView.byId("table");
			var indexes = table.getSelectedIndices();
			var arrayEntregasTarjet2 = JSON.parse(localStorage.getItem("arrayEntregasTarjet2"));
			
			jQuery.ajax({
				url: "/XS_IPROVIDER_ENTREGA/IPROVIDER_ENTREGA/DOCUMENTOS/DocumentoIdentificacion.xsjs",
				type: "GET",
				crossDomain: true,
				success: function (data) {
				//debugger ;
		
					// indexes.forEach(function (value, index) {

					// var object_index = table.getContextByIndex(value).getObject();
					
					
					// });
				
				materialesAux.forEach(function (value2, index2) {
				var validar = false ;
				that.CitasEntregas.forEach(function (cita) {
					
				// cita.ArrayGeneral.forEach(function (entregas) {
				if(arrayEntregasTarjet2[0].ZCita === cita.ZCita){
					
				cita.ArrayGeneral.forEach(function (entregas) {
					
				data.results.forEach(function(a){
			
				if(a.ENTREGA !== " " && a.ENTREGA !== "" &&  a.ENTREGA !== null){
				var Cita = a.ENTREGA.split("-");
				
				if(a.ID_DOCUMENTO === value2.ID_DOCUMENTO  && arrayEntregasTarjet2[0].ZCita  === Cita[0]  &&  Cita[1]=== entregas.ZVbeln.replace("0","")) {
							var fechaVenc = a.VIGENCIA;
							// fechaVenc.replace(".","-").replace(".","-");
							// fechaVenc = Utilities.formatDateX(fechaVenc);
							var vigente = true;

							if (new Date() > fechaVenc) {
								vigente = false;
							}

							if (vigente) {
								var document = {
									authorName: '',
									authorEmail: '',
									id: '',
									fileLength: "",
									creationDate: '',
									filename: a.DOCUMENTO_ADJUNTO,
									downloadLink: '',
									stream: '',
									mimeType: '',
									encode: "",
									pathDocument: '',
									flagEliminar: ''
								};
								value2.fileName = a.DOCUMENTO_ADJUNTO,
								value2.file = document;
								value2.fechaVencimiento = fechaVenc;
								value2.ver	=true;
								
								value2.idDoc = value2.ID_DOCUMENTO;
								value2.descDoc = value2.DESCRIPCION_DOCUMENTO;
								value2.ENTREGA	= Cita[1]  ;
								
							} else {
								value2.fileName = "";
								value2.file = "";
								value2.fechaVencimiento = "";
								value2.ver	=false;
								
								value2.idDoc = value2.ID_DOCUMENTO;
								value2.descDoc = value2.DESCRIPCION_DOCUMENTO;
								value2.ENTREGA	= Cita[1]  ;
								value2.NroGuia	= entregas.Zbolnr ;	
							}
							that.materiales.push(JSON.parse(JSON.stringify(value2)));
							validar = true ;
						} 
				}
				// });
				});
				
				if(!validar){
					value2.fileName 		= "";
					value2.file 			= "";
					value2.fechaVencimiento = "";
					value2.ver	=false;
					value2.idDoc = value2.ID_DOCUMENTO;
					value2.descDoc = value2.DESCRIPCION_DOCUMENTO;
					value2.ENTREGA	= entregas.ZVbeln.replace("0","")  ;
					value2.NroGuia	= entregas.Zbolnr ;							
					that.materiales.push(JSON.parse(JSON.stringify(value2)));
				}
					
				});
				
				}
				
				});	
				});
				
				that.materiales.sort(that.compareValues("ENTREGA")); 
					if(that.validarMaterial){
					that.listaProvPersona = []
					that.listaProvVehiculo=[]
					var obj = {
							recipient: {
							materiales: that.materiales,
							provedorPer: that.listaProvPersona,
							provedorVeh: that.listaProvVehiculo
						}
					};
					sap.ui.core.BusyIndicator.hide();
					var oModelMat = new JSONModel(obj);
					that.byId("DialogMant").setModel(oModelMat);
				}
				}
			});
		
			
		},
		getAttachmentMat: function (materialesAux) {
			var that = this;
			var response;
			var oView = that.getView();
			var table = oView.byId("table");
			var indexes = table.getSelectedIndices();
			
			jQuery.ajax({
				url: "/XS_IPROVIDER_ENTREGA/IPROVIDER_ENTREGA/DOCUMENTOS/DocumentoIdentificacion.xsjs",
				type: "GET",
				crossDomain: true,
				success: function (data) {
				//debugger ;
		
					// indexes.forEach(function (value, index) {

					// var object_index = table.getContextByIndex(value).getObject();
					
					
					// });
					
				indexes.forEach(function (value, index) {
				var object_index = table.getContextByIndex(value).getObject();
				materialesAux.forEach(function (value2, index2) {
				var validar = false ;
				data.results.forEach(function(a){
				
				// && value2.ENTREGA  === 
				if(a.ID_DOCUMENTO === value2.ID_DOCUMENTO && object_index.VbelnD === a.ENTREGA ){
							// var fechaVenc = a.VIGENCIA;
							var fechaVenc = new Date(a.VIGENCIA+"T23:59:59"); 
							// fechaVenc.replace(".","-").replace(".","-");
							// fechaVenc = Utilities.formatDateX(fechaVenc);
							var vigente = true;

							if (new Date() > fechaVenc) {
								vigente = false;
							}

							if (vigente) {
								var document = {
									authorName: '',
									authorEmail: '',
									id: '',
									fileLength: "",
									creationDate: '',
									filename: a.DOCUMENTO_ADJUNTO,
									downloadLink: '',
									stream: '',
									mimeType: '',
									encode: "",
									pathDocument: '',
									flagEliminar: ''
								};
								value2.fileName = "",
								value2.file = document;
								value2.fechaVencimiento = "";
								value2.EditarFechaVig = true ;
								value2.ver	=false;
							} else {
								value2.fileName = "";
								value2.file = "";
								value2.fechaVencimiento = "";
								value2.EditarFechaVig = true ;
								value2.ver	=false;
							}
							validar = true ;
						} 
						
				
				});
				
				if(!validar){
					value2.fileName 		= "";
					value2.file 			= "";
					value2.fechaVencimiento = "";
					value2.EditarFechaVig = true ;
					value2.ver	=false;
				}
						value2.idDoc = value2.ID_DOCUMENTO;
						ID_DOCUMENTO_IDENTIFICACION :"",
						value2.descDoc = value2.DESCRIPCION_DOCUMENTO;
						value2.ENTREGA	= object_index.VbelnD ;
						value2.NroGuia	= object_index.Zbolnr ;

						that.materiales.push(JSON.parse(JSON.stringify(value2)));
				});
					});
				
				}
			});
			
		},
		getAttachmentPersona: function (PersonasAux,listProvPer) {
			var that = this;
			var response;
			
			jQuery.ajax({
				url: "/XS_IPROVIDER_ENTREGA/IPROVIDER_ENTREGA/DOCUMENTOS/DocumentoIdentificacion.xsjs",
				type: "GET",
				crossDomain: true,
				success: function (data) {
						// that.listaDni.forEach(function (i) {
						// var listProvPer = MethodRepository.getDataPersonaVehiculo(i);
						// that.listPersonas.push(listProvPer[0]);
						var ArrayProv = [];
						data.results.forEach(function(d){
							listProvPer.forEach(function (g){
							if(g.NUMERO_IDENTIFICACION === d.NUMERO_IDENTIFICACION ){
								
								g.NUMERO_IDENTIFICACION = g.NUMERO_IDENTIFICACION
								g.namApellidos			= g.NOMBRES + " " + g.APELLIDOS,
								g.ID_DOCUMENTO			=d.ID_DOCUMENTO;
								g.VIGENCIA				=d.VIGENCIA;
								g.DOCUMENTO_ADJUNTO		=d.DOCUMENTO_ADJUNTO;
								ArrayProv.push(JSON.parse(JSON.stringify(g)));
							}
							});
						});
						
						
						that.listaDni.forEach(function(t){
						PersonasAux.forEach(function (j){
						var validar =false ;

						ArrayProv.forEach(function (g){
						if(g.ID_DOCUMENTO === j.ID_DOCUMENTO && t === g.NUMERO_IDENTIFICACION){
					
							//consultar documentos al on base---------------------------------
						
							that.listaConsultaPersona = [];
							var obj = {};
							// that.getAttachmentPersona(j.ID_DOCUMENTO);
							
								var fechaVenc = new Date(g.VIGENCIA+"T23:59:59"); 
								// var fechaVenc = g.VIGENCIA;
								// fechaVenc = Utilities.formatDateX(fechaVenc);
								var vigente = true;

								if (new Date() > fechaVenc) {
									vigente = false;
								}

								if (vigente) {
									
								var f = g.VIGENCIA.split("-");
									var document = {
										authorName: '',
										authorEmail: '',
										id: '',
										fileLength: "",
										creationDate: '',
										filename: g.DOCUMENTO_ADJUNTO,
										downloadLink: '',
										stream: '',
										mimeType: '',
										encode: "",
										pathDocument: '',
										flagEliminar: ''
									};

									obj = {
										dni: g.NUMERO_IDENTIFICACION,
										ID_DOCUMENTO_IDENTIFICACION :"",
										namApellidos: g.NOMBRES + " " + g.APELLIDOS,
										idDoc: j.ID_DOCUMENTO,
										descDoc: j.DESCRIPCION_DOCUMENTO,
										oblig: j.OBLIGATORIO,
										fileName: g.DOCUMENTO_ADJUNTO,
										file: document,
										fechaVencimiento: f[2] +"." + f[1]+ "."+f[0] ,
										EditarFechaVig : false ,
										ver : true
									};
								} else {
									obj = {
										dni: g.NUMERO_IDENTIFICACION,
										ID_DOCUMENTO_IDENTIFICACION :"",
										namApellidos: g.NOMBRES + " " + g.APELLIDOS,
										idDoc: j.ID_DOCUMENTO,
										descDoc: j.DESCRIPCION_DOCUMENTO,
										oblig: j.OBLIGATORIO,
										fileName: "",
										file: "",
										fechaVencimiento: "",
										EditarFechaVig : true ,
										ver : false
									};
								}
							that.listaProvPersona.push(obj);
							validar = true ;
							}
						});
						
						if(!validar){
							
							listProvPer.forEach(function(d){
							if(t === d.NUMERO_IDENTIFICACION ){
							var	obj = {
								
									dni: t,
									ID_DOCUMENTO_IDENTIFICACION :"",
									namApellidos: d.NOMBRES + " " + d.APELLIDOS,
									idDoc: j.ID_DOCUMENTO,
									descDoc: j.DESCRIPCION_DOCUMENTO,
									oblig: j.OBLIGATORIO,
									fileName: "",
									file: "",
									fechaVencimiento: "",
									EditarFechaVig : true ,
									ver : false
								};
							that.listaProvPersona.push(obj);	
								
							}
							});
							
							
							
						}
						
						});
						});

						// });
					// });
					
				}
			});
			
			
			
			
		},
		getAttachmentVehiculo: function (VehiculosAux,listaVeh) {
			var that = this;
			var response;
		
			
			jQuery.ajax({
				url: "/XS_IPROVIDER_ENTREGA/IPROVIDER_ENTREGA/DOCUMENTOS/DocumentoIdentificacion.xsjs",
				type: "GET",
				crossDomain: true,
				success: function (data) {
						// that.listaDni.forEach(function (i) {
						// var listProvPer = MethodRepository.getDataPersonaVehiculo(i);
						// that.listPersonas.push(listProvPer[0]);
						data.results.forEach(function(d){
							listaVeh.forEach(function (g){
							if(g.NUMERO_IDENTIFICACION === d.NUMERO_IDENTIFICACION ){
								g.ID_DOCUMENTO		=d.ID_DOCUMENTO;
								g.VIGENCIA			=d.VIGENCIA;
								g.DOCUMENTO_ADJUNTO	=d.DOCUMENTO_ADJUNTO;
							}
							});
						});
						that.listaVeh.forEach(function (t){	
						VehiculosAux.forEach(function (j){	
						var validar = false ;
						listaVeh.forEach(function (g){
							
							
						if(g.ID_DOCUMENTO === j.ID_DOCUMENTO && t === g.NUMERO_IDENTIFICACION){
					
							//consultar documentos al on base---------------------------------
						
							var obj = {};
							// that.getAttachmentPersona(j.ID_DOCUMENTO);
							
					
								var fechaVenc = new Date(g.VIGENCIA+"T23:59:59"); 
								// fechaVenc = Utilities.formatDateX(fechaVenc);
								var vigente = true;
								
								if (new Date() > fechaVenc) {
									vigente = false;
								}

								if (vigente) {
								var f = g.VIGENCIA.split("-");	
									var document = {
										authorName: '',
										authorEmail: '',
										id: '',
										fileLength: "",
										creationDate: '',
										filename: g.DOCUMENTO_ADJUNTO,
										downloadLink: '',
										stream: '',
										mimeType: '',
										encode: "",
										pathDocument: '',
										flagEliminar: '',
									};

									obj = {
										placa: g.NUMERO_IDENTIFICACION,
										idDoc: j.ID_DOCUMENTO,
										ID_DOCUMENTO_IDENTIFICACION :"",
										descDoc: j.DESCRIPCION_DOCUMENTO,
										oblig: j.OBLIGATORIO,
										fileName: g.DOCUMENTO_ADJUNTO,
										file: document,
										fechaVencimiento: f[2] +"." + f[1]+ "."+f[0],
										EditarFechaVig : false ,
										ver : true
										
										// dni: g.NUMERO_IDENTIFICACION,
										// namApellidos: g.NOMBRES + " " + g.APELLIDOS,
										// idDoc: j.ID_DOCUMENTO,
										// descDoc: j.DESCRIPCION_DOCUMENTO,
										// oblig: j.OBLIGATORIO,
										// fileName: g.DOCUMENTO_ADJUNTO,
										// file: document,
										// fechaVencimiento: Utilities.formatDateX1(g.VIGENCIA)
									};
								} else {
									obj = {
										placa: g.NUMERO_IDENTIFICACION,
										idDoc: j.ID_DOCUMENTO,
										ID_DOCUMENTO_IDENTIFICACION :"",
										descDoc: j.DESCRIPCION_DOCUMENTO,
										oblig: j.OBLIGATORIO,
										fileName: "",
										file: "",
										fechaVencimiento: "",
										EditarFechaVig : true ,
										ver : false
									};
								}
							validar = true ;	
							that.listaProvVehiculo.push(obj);	
							}
						});
						if(!validar) {

								obj = {
									placa: t,
									ID_DOCUMENTO_IDENTIFICACION :"",
									idDoc: j.ID_DOCUMENTO,
									descDoc: j.DESCRIPCION_DOCUMENTO,
									oblig: j.OBLIGATORIO,
									fileName: "",
									file: "",
									fechaVencimiento: "",
									EditarFechaVig : true ,
									ver : false
								};
							that.listaProvVehiculo.push(obj);		

							}
						
						
						});
						});
						var obj = {
							recipient: {
							materiales: that.materiales,
							provedorPer: that.listaProvPersona,
							provedorVeh: that.listaProvVehiculo
						}
					};
					sap.ui.core.BusyIndicator.hide();
					var oModelMat = new JSONModel(obj);
					that.byId("DialogMant").setModel(oModelMat);
						// });
					// });
					
				}
			});
		},
		AdjuntarDocumentos: function () {
			var that		= this;
			var oView		= that.getView();
			var ModeloProyect = oView.getModel("Proyect");
			if(!that.oDialog){
				that.oDialog = sap.ui.xmlfragment(oView.getId(),"com.rava.project.fragment.MantenimientoRoles" , that);
				oView.addDependent(that.oDialog);
			}
		
			
					that.listaDni			= [];
					that.listaProvPersona	= [];
					that.listaVeh			= [];
					that.listaProvVehiculo	= [];
					that.materiales 		= [];
					that.listPersonas		= [];
					that.listaConsultaMat	= [];
					
					var aTokensDni = that.getView().byId("multiInput1").getTokens();
					aTokensDni.map(function (oToken) {
						that.listaDni.push(oToken.getKey());
					});
					
					var aTokensVeh = that.getView().byId("multiInput2").getTokens();
					aTokensVeh.map(function (oToken) {
						
					that.listaVeh.push( (oToken.getKey().substring(0,3)+"-"+oToken.getKey().substring(3,6)).toUpperCase() );
					});
					var validarPV = ModeloProyect.getProperty("/ElementosyTablas");
					if(validarPV){
					
					if (aTokensDni.length === 0) {
						MessageBox.show(
							"Ingrese por lo menos un DNI", {
								icon: sap.m.MessageBox.Icon.INFORMATION,
								title: "Mensaje",
								actions: ['OK'],
								onClose: function (sActionClicked) {}
							}
						);
						sap.ui.core.BusyIndicator.hide();
						return;
					}
					if (aTokensVeh.length === 0) {
						MessageBox.show(
							"Ingrese por lo menos un Placa", {
								icon: sap.m.MessageBox.Icon.INFORMATION,
								title: "Mensaje",
								actions: ['OK'],
								onClose: function (sActionClicked) {}
							}
						);
						sap.ui.core.BusyIndicator.hide();
						return;
					}
					}
					that.oDialog.open();
					sap.ui.core.BusyIndicator.show(0);
					var materialesAux	= MethodRepository.getMateriales("M", 1);		
					var listaAux		= MethodRepository.getDocPersonaVehiculo("P", 1);
					var listaVAux		= MethodRepository.getDocPersonaVehiculo("V", 1);
					
					var listProvPer		=[];
					var listaVeh		=[];
					
					that.listaDni.forEach(function (i) {
					 listProvPer.push(MethodRepository.getDataPersonaVehiculo(i)[0]);
					});
					
					that.listaVeh.forEach(function (i) {
						 listaVeh.push(MethodRepository.getDataPersonaVehiculo(i)[0]);
					});
					
					if(ValidatePestaña){
					that.getAttachmentMat(materialesAux);
					}
					else {
					that.getAttachmentMatPestaña2(materialesAux);
					}
					that.getAttachmentPersona(listaAux,listProvPer);
					that.getAttachmentVehiculo(listaVAux,listaVeh);
					
					
					
		},
		VerPDFDni : function (oEvent){
			
			var that = this ;
			var oView = this.getView();
			var sPath = oEvent.getSource().getBindingContext().getPath();
			var Seleccion = oView.byId("DialogMant").getModel().getProperty(sPath);
			sap.ui.core.BusyIndicator.show(0);
			var keywords = 
			[
			{
				KeywordName: "ID Documento",
				KeywordValue: Seleccion.idDoc
			}
			,
			{
				KeywordName: "Numero Identificacion",
				KeywordValue: Seleccion.dni
			}
			];
			
			that.ConsultarOnbaseMatPerVeh(keywords);
		
			
		},
		VerPDFMaterial : function (oEvent){
			
			var that = this ;
			var oView = this.getView();
			var sPath = oEvent.getSource().getBindingContext().getPath();
			var Seleccion = oView.byId("DialogMant").getModel().getProperty(sPath);
			sap.ui.core.BusyIndicator.show(0);
			var keywords = 
			[
			{
				KeywordName: "ID Documento",
				KeywordValue: Seleccion.idDoc
			}
			,
			{
				KeywordName: "Numero Identificacion",
				KeywordValue: Seleccion.ENTREGA
			}
			];
			
			that.ConsultarOnbaseMatPerVeh(keywords);
			
		},
		VerPDFVehiculo : function (oEvent){
			
			var that = this ;
			var oView = this.getView();
			var sPath = oEvent.getSource().getBindingContext().getPath();
			var Seleccion = oView.byId("DialogMant").getModel().getProperty(sPath);
			sap.ui.core.BusyIndicator.show(0);
			var keywords = 
			[
			{
				KeywordName: "ID Documento",
				KeywordValue: Seleccion.idDoc
			}
			,
			{
				KeywordName: "Numero Identificacion",
				KeywordValue: Seleccion.placa
			}
			];
			
			that.ConsultarOnbaseMatPerVeh(keywords);
			
		},
		
		ConsultarOnbaseMatPerVeh : function (Keywords){
			var that = this ;
			jQuery.ajax({
				url: "/ONBASE/RESTDocsOnbase.svc/Connect",
				"headers": {
					"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
					"cache-control": "no-cache"
				},
				type: "GET",
				crossDomain: true,
				success: function (data) {
					console.log(data);
					var dataSesion = {
						SessionID: data.SessionID,
						DocumentTypeName: "Entrega - Documentos Numero de Identificacion",
						Keywords: Keywords
					};

					jQuery.ajax({
						url: "/ONBASE/RESTDocsOnbase.svc/FindDocumentByKeyword",
						"headers": {
							"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
							"content-type": "application/json",
							"cache-control": "no-cache"
						},
						type: "POST",
						data: JSON.stringify(dataSesion),
						crossDomain: true,
						processData: false,
						success: function (dataDocument) {
							if (dataDocument.length > 0) {

								var dataDocumentSend = {
									SessionID: data.SessionID,
									DocumentID: dataDocument[0].DocumentID.toString()
								};

								jQuery.ajax({
									url: "/ONBASE/RESTDocsOnbase.svc/GetDocument",
									"headers": {
										"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
										"content-type": "application/json",
										"cache-control": "no-cache"
									},
									type: "POST",
									data: JSON.stringify(dataDocumentSend),
									crossDomain: true,
									processData: false,
									success: function (dataPDF) {

										var base64EncodedPDF = dataPDF.OBDocBase64.toString(); // the encoded string
										var decodedPdfContent = atob(base64EncodedPDF);
										var byteArray = new Uint8Array(decodedPdfContent.length)
										for (var i = 0; i < decodedPdfContent.length; i++) {
											byteArray[i] = decodedPdfContent.charCodeAt(i);
										}
										var blob = new Blob([byteArray.buffer], {
											type: 'application/pdf' 		
										});
										var _pdfurl = URL.createObjectURL(blob);
										jQuery.sap.addUrlWhitelist("blob");
										that.pdfViewer.setSource(_pdfurl);
										// that.pdfViewer.setTitle("Documento del Material");
										sap.ui.core.BusyIndicator.hide();
										
										that.pdfViewer.open();
										cantidadGeneral ++ ;
										
										that.listaConsultaMat.push(dataPDF);
										var dataDisconect = {
											SessionID: data.SessionID
										};

										jQuery.ajax({
											url: "/ONBASE/RESTDocsOnbase.svc/Disconnect",
											"headers": {
												"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
												"content-type": "application/json",
												"cache-control": "no-cache"
											},
											type: "POST",
											data: JSON.stringify(dataDisconect),
											crossDomain: true,
											processData: false,
											success: function (dataDisconnect) {

											}
										});

									}

								});
							} else {
								var dataDisconect = {
									SessionID: data.SessionID
								};

								jQuery.ajax({
									url: "/ONBASE/RESTDocsOnbase.svc/Disconnect",
									"headers": {
										"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
										"content-type": "application/json",
										"cache-control": "no-cache"
									},
									type: "POST",
									data: JSON.stringify(dataDisconect),
									crossDomain: true,
									processData: false,
									success: function (dataDisconnect) {

									}
								});
							}

						},
						error: function (error) {

							sap.ui.core.BusyIndicator.hide();
							if (error.responseText.search("No se encontró ningún documento para los keywords ingresados") !== -1) {
								sap.m.MessageBox.error("No se encontró ningún documento", {
									title: "Mensaje",
									actions: [
										"Aceptar"

									],
									onClose: function (sActionClicked) {}
								});
							}

							var dataDisconect = {
								SessionID: data.SessionID
							};
							jQuery.ajax({
								url: "/ONBASE/RESTDocsOnbase.svc/Disconnect",
								"headers": {
									"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
									"content-type": "application/json",
									"cache-control": "no-cache"
								},
								type: "POST",
								data: JSON.stringify(dataDisconect),
								crossDomain: true,
								processData: false,
								success: function (dataDisconnect) {

								}
							});

						}

					});

				},
				error: function (error) {
					sap.ui.core.BusyIndicator.hide();
					console.log(error);
				}

			});
			
		},

		CancelarDialogRoles: function () {
			var that = this;
			that.listaDni = [];
			that.listaVeh = [];
			that.materiales = [];
			that.listaProvPersona = [];
			that.listaProvVehiculo = [];
			that.byId("DialogMant").close();
		},
		CancelarResumen: function () {
			var that = this;
			that.byId("DialogResumen").close();
		},
		ActualizarDialog: function () {
			var that = this;
			var oView = that.getView()
			var aux = that.byId("DialogRegistrarDni").getModel().getData().recipient;
			var obj = {};
			obj.TIPO_DOCUMENTO = "P";
			obj.NUMERO_IDENTIFICACION = aux.dni;
			obj.NOMBRES = aux.nombre;
			obj.APELLIDOS = aux.apellidos;

			MethodRepository.saveDni(obj, that,function(resp){
				if (resp == "OK") {
				var oMultiInput1 = oView.byId("multiInput1");
				let lista = [];
				var aTokensDni = oMultiInput1.getTokens();
				aTokensDni.map(function (oToken) {
					lista.push(oToken.getKey());
				});
				var registro = [];
				
				if (lista.length > 0) {

					oMultiInput1.setTokens([]);

					lista.forEach(function(obj){
					
					registro.push(new Token({
							text: obj,
							key: obj
						}) );
						
					});
					
					// oMultiInput1.setTokens([

						// new Token({
						// 	text: lista[0],
						// 	key: lista[0]
						// }),
						registro.push(new Token({
							text: aux.dni,
							key: aux.dni
						}));
					// ]);
					oMultiInput1.setTokens(registro);

				} else {
					oMultiInput1.setTokens([

						new Token({
							text: aux.dni,
							key: aux.dni
						})
					]);
				}

				oView.byId("multiInput1").setValue("");
			}
				
			});

		

		},
		attachFileProvVeh: function (oEvent) {
			var that = this;
			var oView = that.getView();
			var context = oEvent.getSource().getBindingContext();
			var path = context.getPath();
			that.indexPV = (path.substring(23, path.length)) * 1;
			var aux = context.getObject(path);

			var obj = {
				recipient: {
					docu: aux.descDoc,
					file: ""
				}
			};
			var oModel = new JSONModel(obj);
			var oDialog = that.byId("DialogUploadFileProvVeh");
			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(oView.getId(), "com.rava.project.fragment.AttachFileProvVeh", that);
				oView.addDependent(oDialog);
				that.byId("DialogUploadFileProvVeh").setModel(oModel);
				oDialog.open();
			} else {
				that.byId("DialogUploadFileProvVeh").setModel(oModel);
				oDialog.open();
			}

		},
		loadFileProvVeh: function () {
			var that = this;
			var fileAux = that.byId("fileUploaderProvVeh");
			var file = null;

			if (!Utilities.isEmpty(fileAux)) {
				var domRef = fileAux.getFocusDomRef();
				if (!Utilities.isEmpty(domRef))
					file = domRef.files[0];
			}
			if (!Utilities.isEmpty(file)) {
				var sUploadedFile = file.name;
				var size = file.size;
				var mimeType = file.type;
				if (Utilities.isEmpty(mimeType) || mimeType.length === 0) {
					mimeType = "application/octet-stream";
				}

				if (file) {
					var reader = new FileReader();
					reader.readAsDataURL(file);

					reader.onload = function () {
						var stringBase64 = reader.result;
						stringBase64 = stringBase64.split(',');

						var document = {
							authorName: '',
							authorEmail: '',
							id: '',
							fileLength: size,
							creationDate: '',
							filename: sUploadedFile,
							downloadLink: '',
							stream: '',
							mimeType: mimeType,
							encode: stringBase64[1],
							pathDocument: '',
							flagEliminar: ''
						};
						// self.limpiarRequeridos('xml');

						that.listaProvVehiculo.forEach(function (value, index) {
							if (index === that.indexPV) {
								value.fileName = document.filename;
								value.file = document;
								value.fechaVencimiento = "";
							}
						});

						var obj = {
							recipient: {
								materiales: that.materiales,
								provedorPer: that.listaProvPersona,
								provedorVeh: that.listaProvVehiculo
							}
						};
						var oModelMat = new JSONModel(obj);
						that.byId("DialogMant").setModel(oModelMat);

						that.byId("DialogUploadFileProvVeh").close();

					};
					reader.onerror = function (error) {
						//console.log('Error: ', error);
					};
				}

			} else {
				//self.loadScan();
			}
		},
		CancelarFileProvVeh: function () {
			var that = this;
			that.byId("DialogUploadFileProvVeh").close();
		},
		attachFileProvPer: function (oEvent) {
			var that = this;
			var oView = that.getView();
			var context = oEvent.getSource().getBindingContext();
			var path = context.getPath();
			that.indexPP = (path.substring(23, path.length)) * 1;
			var aux = context.getObject(path);

			var obj = {
				recipient: {
					docu: aux.descDoc,
					file: ""
				}
			};
			var oModel = new JSONModel(obj);
			var oDialog = that.byId("DialogUploadFileProvPer");
			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(oView.getId(), "com.rava.project.fragment.AttachFileProvPer", that);
				oView.addDependent(oDialog);
				that.byId("DialogUploadFileProvPer").setModel(oModel);
				oDialog.open();
			} else {
				that.byId("DialogUploadFileProvPer").setModel(oModel);
				oDialog.open();
			}

		},
		loadFileProvPer: function () {
			var that = this;
			var fileAux = that.byId("fileUploaderProvPer");
			var file = null;

			if (!Utilities.isEmpty(fileAux)) {
				var domRef = fileAux.getFocusDomRef();
				if (!Utilities.isEmpty(domRef))
					file = domRef.files[0];
			}
			if (!Utilities.isEmpty(file)) {
				var sUploadedFile = file.name;
				var size = file.size;
				var mimeType = file.type;
				if (Utilities.isEmpty(mimeType) || mimeType.length === 0) {
					mimeType = "application/octet-stream";
				}

				if (file) {
					var reader = new FileReader();
					reader.readAsDataURL(file);

					reader.onload = function () {
						var stringBase64 = reader.result;
						stringBase64 = stringBase64.split(',');

						var document = {
							authorName: '',
							authorEmail: '',
							id: '',
							fileLength: size,
							creationDate: '',
							filename: sUploadedFile,
							downloadLink: '',
							stream: '',
							mimeType: mimeType,
							encode: stringBase64[1],
							pathDocument: '',
							flagEliminar: ''
						};
						// self.limpiarRequeridos('xml');

						that.listaProvPersona.forEach(function (value, index) {
							if (index === that.indexPP) {
								value.fileName = document.filename;
								value.file = document;
								value.fechaVencimiento = "";
							}
						});

						var obj = {
							recipient: {
								materiales: that.materiales,
								provedorPer: that.listaProvPersona,
								provedorVeh: that.listaProvVehiculo
							}
						};
						var oModelMat = new JSONModel(obj);
						that.byId("DialogMant").setModel(oModelMat);

						that.byId("DialogUploadFileProvPer").close();

					};
					reader.onerror = function (error) {
						//console.log('Error: ', error);
					};
				}

			} else {
				//self.loadScan();
			}
		},
		CancelarFileProvPer: function () {
			var that = this;
			that.byId("DialogUploadFileProvPer").close();
		},
		attachFileMaterial: function (oEvent) {
			var that = this;
			var oView = that.getView();
			var context = oEvent.getSource().getBindingContext();
			var path = context.getPath();
			that.index = (path.substring(22, path.length)) * 1;
			that.obj = context.getObject(path);

			var obj = {
				recipient: {
					docu: that.obj.DESCRIPCION_DOCUMENTO,
					file: ""
				}
			};
			var oModel = new JSONModel(obj);
			var oDialog = that.byId("DialogUploadFileMaterial");
			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(oView.getId(), "com.rava.project.fragment.AttachFileMaterial", that);
				oView.addDependent(oDialog);
				that.byId("DialogUploadFileMaterial").setModel(oModel);
				oDialog.open();
			} else {
				that.byId("DialogUploadFileMaterial").setModel(oModel);
				oDialog.open();
			}

		},
		loadFileMat: function () {
			var that = this;
			var fileMatAux = that.byId("fileUploader");
			var fileMat = null;

			if (!Utilities.isEmpty(fileMatAux)) {
				var domRef = fileMatAux.getFocusDomRef();
				if (!Utilities.isEmpty(domRef))
					fileMat = domRef.files[0];
			}
			if (!Utilities.isEmpty(fileMat)) {
				var sUploadedFile = fileMat.name;
				var size = fileMat.size;
				var mimeType = fileMat.type;
				if (Utilities.isEmpty(mimeType) || mimeType.length === 0) {
					mimeType = "application/octet-stream";
				}

				if (fileMat) {
					var reader = new FileReader();
					reader.readAsDataURL(fileMat);

					reader.onload = function () {
						var stringBase64 = reader.result;
						stringBase64 = stringBase64.split(',');

						var document = {
							authorName: '',
							authorEmail: '',
							id: '',
							fileLength: size,
							creationDate: '',
							filename: sUploadedFile,
							downloadLink: '',
							stream: '',
							mimeType: mimeType,
							encode: stringBase64[1],
							pathDocument: '',
							flagEliminar: ''
						};
						// self.limpiarRequeridos('xml');

						that.materiales.forEach(function (value, index) {
							if (index === that.index) {
								value.fileName = document.filename;
								value.file = document;
								value.fechaVencimiento = "";
							}
						});

						var obj = {
							recipient: {
								materiales: that.materiales,
								provedorPer: that.listaProvPersona,
								provedorVeh: that.listaProvVehiculo
							}
						};
						var oModelMat = new JSONModel(obj);
						that.byId("DialogMant").setModel(oModelMat);

						that.byId("DialogUploadFileMaterial").close();

					};
					reader.onerror = function (error) {
						//console.log('Error: ', error);
					};
				}

			} else {
				//self.loadScan();
			}
		},
		CancelarFileMaterial: function () {
			var that = this;
			that.byId("DialogUploadFileMaterial").close();
		},
		RegistroEntrega : function (oEvent){
			var AB = oEvent.getSource().getSelectedKey();
			var oView =this.getView(); 
			var ModeloProyect = oView.getModel("Proyect");
			switch (AB) {
				case	"EntregasP":
					// Proyect>/TextGuardar
					ModeloProyect.setProperty("/Visible1" ,true );
					ModeloProyect.setProperty("/Visible2" ,false );
					ModeloProyect.setProperty("/TextGuardar" ,"Guardar y Generar QR" );
					ValidatePestaña =true ;break;
					
				case	"EntregasC":
					ModeloProyect.setProperty("/Visible1" ,false );
					ModeloProyect.setProperty("/Visible2" ,true );
					ModeloProyect.setProperty("/TextGuardar" ,"Guardar" );
					ValidatePestaña =false;break;
			} 
			
		},
		handleChange : function (oEvent){
			var bValid	= oEvent.getParameter("valid");
			var that	= this ;
			var Path =oEvent.getSource().getBindingContext().sPath;
			var index ;
			// that.byId("DialogMant").getModel(a);
			Path = Path.replace("/recipient/","");
			if(Path.indexOf("materiales") !== -1){
				
			index =	Path.replace("materiales/","")*1;
			that.materiales[index].validarFecha	=bValid;
			return;
			
			}else if (Path.indexOf("provedorPer") !== -1){
				
			index =	Path.replace("provedorPer/","")*1;
			that.listaProvPersona[index].validarFecha =bValid;
			return;
			
			}else {
				
			index =	Path.replace("provedorVeh/","")*1;
			that.listaProvVehiculo[index].validarFecha =bValid;
			return;
				
			}
			
			// that.materiales
			// that.listaProvPersona
			// that.listaProvVehiculo

		   //if(!bValid){
		   //	validarFechaAdjuntar = false ;
		   //   return;
		   //}else {
		   //	validarFechaAdjuntar = true ;
		   //}
			
		},
		validateDoc: function () {
			var that = this;
			var oView = that.getView();
			var validarMat = true ;
			var validarPer = true ;
			var validarVeh = true ;
			var fechavalida = true ;
			//-----------------------------------------------------

			// if(!validarFechaAdjuntar){
			// 	MessageToast.show("Ponga fecha Valida");
			// }
			that.materiales.forEach(function(obj){
				
			if(obj.fileName !== "" && obj.fechaVencimiento === ""){
				validarMat = false ;
			}
			if(!obj.validarFecha && obj.validarFecha !== undefined) {
				fechavalida =  false ;
			}
				
			});
			
			that.listaProvPersona.forEach(function(obj){
				if(obj.fileName !== "" && obj.fechaVencimiento === ""){
				validarPer = false ;
			}
				if(!obj.validarFecha && obj.validarFecha !== undefined){
				fechavalida =  false ;
			}
				
			});
			
			that.listaProvVehiculo.forEach(function(obj){
				if(obj.fileName !== "" && obj.fechaVencimiento === ""){
				validarVeh = false ;
			}
			if(!obj.validarFecha && obj.validarFecha !== undefined){
				fechavalida =  false ;
			}
				
			});
			if (!validarMat){
				sap.m.MessageToast.show("Ingrese una fecha");
				return ;
			}
			if (!validarPer){
				sap.m.MessageToast.show("Ingrese una fecha");
				return ;
			}
			if (!validarVeh){
				sap.m.MessageToast.show("Ingrese una fecha");
				return ;
			}
			
			
			if (!fechavalida){
				sap.m.MessageToast.show("Ingrese una fecha valida");
				return ;
			}

			var validateRequiredFilesMat = true;
			var validateRequiredFilesPer = true;
			var validateRequiredFilesVeh = true;

			if (that.materiales.length > 0) {
				for (var i = 0; i < that.materiales.length; i++) {
					var value = that.materiales[i];
					if (value.OBLIGATORIO === 1 && Utilities.isEmpty(value.fileName) && Utilities.isEmpty(value.fechaVencimiento)) {
						validateRequiredFilesMat = false;
						break;
					}
				}
			}
			if (that.listaProvPersona.length > 0) {
				for (var i = 0; i < that.listaProvPersona.length; i++) {
					var value = that.listaProvPersona[i];
					if (value.oblig === 1 && Utilities.isEmpty(value.fileName) && Utilities.isEmpty(value.fechaVencimiento) ||
						value.oblig === 1 && !Utilities.isEmpty(value.fileName) && Utilities.isEmpty(value.fechaVencimiento)) {
						validateRequiredFilesPer = false;
						break;
					}
				}
			}
			if (that.listaProvVehiculo.length > 0) {
				for (var i = 0; i < that.listaProvVehiculo.length; i++) {
					var value = that.listaProvVehiculo[i];
					if (value.oblig === 1 && Utilities.isEmpty(value.fileName) && Utilities.isEmpty(value.fechaVencimiento) ||
						value.oblig === 1 && !Utilities.isEmpty(value.fileName) && Utilities.isEmpty(value.fechaVencimiento)) {
						validateRequiredFilesVeh = false;
						break;
					}
				}
			}
			if (validateRequiredFilesMat === true && validateRequiredFilesVeh === true && validateRequiredFilesPer === true ||
				value.oblig === 1 && !Utilities.isEmpty(value.fileName) && Utilities.isEmpty(value.fechaVencimiento)) {
		
	
				sap.m.MessageBox.confirm("¿Desea generar los registros?", {
					title: "Mensaje",
					actions: [
						"Si",
						"Cancelar"
					],
					onClose: function (sActionClicked) {
						if (sActionClicked === "Si") {
							
							sap.ui.core.BusyIndicator.show(0);
							var cita ;
							if(ValidatePestaña){
							cita = MethodRepository.generarCita() + '';
							}
							else {
							var arrayEntregasTarjet2 = JSON.parse(localStorage.getItem("arrayEntregasTarjet2"));
							cita= arrayEntregasTarjet2[0].ZCita ;
							}
							
							that.generateLista(that.materiales,that.listaProvPersona,that.listaProvVehiculo,cita);
							
						}
					}
				});
			} else {

				sap.m.MessageBox.information("Los documentos obligatorios deben constar de archivo y fecha de vencimiento", {
					title: "Mensaje",
					actions: [
						"Ok"
					],
					onClose: function (sActionClicked) {

					}
				});
			}

		},
		generateLista:async function(materiales,listaProvPersona,listaProvVehiculo,cita){
			var that=this;
			var arrMateriales=[]
			var c =cita ;
			for(var i=0;i<materiales.length;i++){
				if(materiales[i].fileName!=""){
					materiales[i].ENTREGA = c+ "-"+materiales[i].ENTREGA ;
					arrMateriales.push(materiales[i]);
				}
			}
			
			var arrProvPersona=[]
			for(var i=0;i<listaProvPersona.length;i++){
				if(listaProvPersona[i].fileName!=""){
					arrProvPersona.push(listaProvPersona[i])
				}
			}
			
			var arrProvVehiculo=[]
			for(var i=0;i<listaProvVehiculo.length;i++){
				if(listaProvVehiculo[i].fileName!=""){
					arrProvVehiculo.push(listaProvVehiculo[i])
				}
			}
			
			console.log(arrMateriales);
			console.log(arrProvPersona);
			console.log(arrProvVehiculo);
			
			// jQuery.ajax({
			// 	url: "/ONBASE/RESTDocsOnbase.svc/Connect",
			// 	"headers": {
			// 		"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
			// 		"cache-control": "no-cache"
			// 	},
			// 	type: "GET",
			// 	crossDomain: true,
			// 	success: function (data) {
			
					if(arrMateriales[0]!=undefined){
						 that.validateListaMat(arrMateriales);
					}
					
					if(arrProvPersona[0]!=undefined){
						 that.validateListaPer(arrProvPersona);
					}
					
					if(arrProvVehiculo[0]!=undefined){
						 that.validateListaVeh(arrProvVehiculo);
					}
					
					if(ValidatePestaña){
					that.saveGuia(that.entregaGuiaSelected, cita, that);
					}
					
					else {
					// sap.ui.core.BusyIndicator.show(0);
					var arrayEntregasTarjet2 = JSON.parse(localStorage.getItem("arrayEntregasTarjet2"));
					
						// that.listaDni[0]
						// that.listaVeh[0]
						
						var obj = {
						 "Zflag": "X",
						"ZET_MOD_DETSet": [
							{
							"Zcita"	:arrayEntregasTarjet2[0].ZCita,
							"Zplaca":that.listaVeh[0],
							"Zdni"	:that.listaDni[0] === undefined ? "" :that.listaDni[0] ,  
							"Zdni2"	:that.listaDni[1] === undefined ? "" :that.listaDni[1] ,
							"Zdni3"	:that.listaDni[2] === undefined ? "" :that.listaDni[2] ,
							"Zdni4"	:that.listaDni[3] === undefined ? "" :that.listaDni[3] ,
							"Msg": ""
							}
				    	]
					 };
				// context.listaDni, context.listaVeh

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
						url: "/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_REGISTRO_ENTRE_SRV/ZET_MODIFICARSet",
						data: JSON.stringify(obj)
					}).then(function successCallback(result, xhr, data) {
						
						    that.getView().byId("table2").clearSelection();
							that.getDataMain();
							that.getDateTarget2();
							that.byId("DialogMant").close();
							that.byId("DialogConfirmarCentro").close();
							// sap.ui.core.BusyIndicator.hide();
							MessageBox.success("Se modificó la cita :" + arrayEntregasTarjet2[0].ZCita);
					
					}, function errorCallback(xhr, readyState) {
						jQuery.sap.log.debug(xhr);
						that.byId("DialogMant").close();
						that.byId("DialogConfirmarCentro").close();
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error("No se modificó la cita :" + arrayEntregasTarjet2[0].ZCita);
					});

				}, function errorCallback(xhr, readyState) {
					jQuery.sap.log.debug(xhr);
				});
					}
					
	
		},
		validateListaMat:async function(arrValidate,enc){
			var that=this;
			
			for(var i=0;i<arrValidate.length;i++){
				var id=arrValidate[i].ID_DOCUMENTO;
				var Ent=arrValidate[i].ENTREGA;
				// var ident=arrValidate[i].fileName;
				var vig=arrValidate[i].fechaVencimiento;
				// var enc=arrValidate[i].file.encode;
				var enc=arrValidate[i].file.encode;
				if(vig == undefined){
					vig = "";
				}
				 await $.ajax({
					url: "/XS_IPROVIDER_ENTREGA/IPROVIDER_ENTREGA/DOCUMENTOS/DocumentoIdentificacionWhere.xsjs?id_documento="+id +"&entrega="+Ent,
					method: "GET",
					contentType: 'application/json',
					headers: {Authorization: "Basic VVNSX1JBVkE6UmF2YTIwMjAk"},
					success: function (dataMaterial) {
						
						if(Object.keys(dataMaterial).length>0){
							arrValidate[i].ID_DOCUMENTO_IDENTIFICACION=dataMaterial[0].ID_DOCUMENTO_IDENTIFICACION
							that.estructuraDataMat(arrValidate[i],0,enc)
						}else{
							that.estructuraDataMat(arrValidate[i],1,enc)
						}
					},
					error: function (e) {
						console.log("Ocurrio un error" + JSON.parse(e))
						MessageToast.show("Erro al borrar registro");
					}
				});
			}
		},
		estructuraDataMat:function(dataMat,estatus,enc){
			var that=this;
			// console.log(data);
			var split=dataMat.fechaVencimiento.split(".");
	        if(split[0].length>3){
	            var vigencia2 = split[0]+"/"+split[1]+"/"+split[2];
	        }else{
	            var vigencia2 = split[2]+"/"+split[1]+"/"+split[0];
	        }
	        
			var obj={};
			obj.ID_DOCUMENTO = dataMat.idDoc;
			obj.VIGENCIA =vigencia2;
			obj.NUMERO_IDENTIFICACION = " ";
			obj.DOCUMENTO_ADJUNTO = dataMat.fileName;
			obj.ENTREGA = dataMat.ENTREGA;
			
			console.log(obj);
			if(estatus==0){
				obj.ID_DOCUMENTO_IDENTIFICACION=dataMat.ID_DOCUMENTO_IDENTIFICACION.toString();
				that.updateValidate(obj,enc,"M")
			}else{
				that.insertValidate(obj,enc,"M")
				
			}
		},
		validateListaPer:async function(arrValidate , enc){
			var that=this;
			for(var i=0;i<arrValidate.length;i++){
				var id=arrValidate[i].idDoc;
				var ident=arrValidate[i].dni;
				var enc=arrValidate[i].file.encode;
				await $.ajax({
					url: "/XS_IPROVIDER_ENTREGA/IPROVIDER_ENTREGA/DOCUMENTOS/DocumentoIdentificacionWhere2.xsjs?id_documento="+id+"&identificacion="+ident,
					method: "GET",
					contentType: 'application/json',
					headers: {Authorization: "Basic VVNSX1JBVkE6UmF2YTIwMjAk"},
					success: function (data) {
						// console.log(data)
						if(Object.keys(data).length>0){
							arrValidate[i].ID_DOCUMENTO_IDENTIFICACION=data[0].ID_DOCUMENTO_IDENTIFICACION
							that.estructuraDataPer(arrValidate[i],0,enc)
						}else{
							that.estructuraDataPer(arrValidate[i],1,enc)
						}
					},
					error: function (e) {
						console.log("Ocurrio un error" + JSON.parse(e))
						MessageToast.show("Erro al borrar registro");
					}
				});
			}
		},
		estructuraDataPer:function(data,estatus,enc){
			var that=this;
			// console.log(data);
			var split=data.fechaVencimiento.split(".");
	        if(split[0].length>3){
	            var vigencia2 = split[0]+"/"+split[1]+"/"+split[2];
	        }else{
	            var vigencia2 = split[2]+"/"+split[1]+"/"+split[0];
	        }
	        
			var obj={};
			obj.ID_DOCUMENTO = data.idDoc;
			obj.VIGENCIA =vigencia2;
			obj.NUMERO_IDENTIFICACION = data.dni;
			obj.DOCUMENTO_ADJUNTO = data.fileName;
			obj.ENTREGA	= "";
			console.log(obj);
			if(estatus==0){
				obj.ID_DOCUMENTO_IDENTIFICACION = data.ID_DOCUMENTO_IDENTIFICACION.toString();
				that.updateValidate(obj,enc,"efe")
			}else{
				that.insertValidate(obj,enc,"efe")
			}
		},
		validateListaVeh:async function(arrValidate, enc){
			var that=this;
			for(var i=0;i<arrValidate.length;i++){
				var id=arrValidate[i].idDoc;
				var ident=arrValidate[i].placa;
				var enc=arrValidate[i].file.encode;
				await $.ajax({
					url: "/XS_IPROVIDER_ENTREGA/IPROVIDER_ENTREGA/DOCUMENTOS/DocumentoIdentificacionWhere2.xsjs?id_documento="+id+"&identificacion="+ident,
					method: "GET",
					contentType: 'application/json',
					headers: {Authorization: "Basic VVNSX1JBVkE6UmF2YTIwMjAk"},
					success: function (data) {
						// console.log(data)
						if(Object.keys(data).length>0){
							arrValidate[i].ID_DOCUMENTO_IDENTIFICACION=data[0].ID_DOCUMENTO_IDENTIFICACION
							that.estructuraDataVeh(arrValidate[i],0,enc)
						}else{
							that.estructuraDataVeh(arrValidate[i],1,enc)
						}
					},
					error: function (e) {
						console.log("Ocurrio un error" + JSON.parse(e))
						MessageToast.show("Erro al borrar registro");
					}
				});
			}
		},
		estructuraDataVeh:function(data,estatus,enc){
			var that=this;
			// console.log(data);
			var split=data.fechaVencimiento.split(".");
			
			
	        if(split[0].length>3){
	            var vigencia2 = split[0]+"/"+split[1]+"/"+split[2];
	        }else{
	            var vigencia2 = split[2]+"/"+split[1]+"/"+split[0];
	        }
	        
			var obj={};
		
			obj.ID_DOCUMENTO = data.idDoc;
			obj.VIGENCIA =vigencia2;
			obj.NUMERO_IDENTIFICACION = data.placa;
			obj.DOCUMENTO_ADJUNTO = data.fileName;
			obj.ENTREGA	="";
			console.log(obj);
			if(estatus==0){
				obj.ID_DOCUMENTO_IDENTIFICACION = data.ID_DOCUMENTO_IDENTIFICACION.toString();
				that.updateValidate(obj,enc,"efe")
			}else{
				that.insertValidate(obj,enc,"efe")
			}
		},
		updateValidate: function(content,enc , campo){
			// for(var i=0;i<content.length;i++){
			var f = content.VIGENCIA.split("/");
			 content.VIGENCIA = f[0]+"-"+f[1]+"-"+f[2];
			 $.ajax({
				url: "/XS_IPROVIDER_ENTREGA/IPROVIDER_ENTREGA/DOCUMENTOS/DocumentoIdentificacion.xsjs?NombreDoc="+content.DOCUMENTO_ADJUNTO,
				type: "PUT",
				contentType: 'text/json',
				headers: {
				  Authorization: "Basic VVNSX1JBVkE6UmF2YTIwMjAk"
				},
				data: JSON.stringify(content),
				statusCode: {
				    404: function() {
				      console.log( "page not found" );
				    },
				    200: function(){
				    	console.log("Registro Actualizado Exitosamente");
				    	
				    	if(enc != undefined && enc != ""){
				    		jQuery.ajax({
								url: "/ONBASE/RESTDocsOnbase.svc/Connect",
								"headers": {
									"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
									"cache-control": "no-cache"
								},
								type: "GET",
								crossDomain: true,
								success: function (data) {
									var dataSesion = {
										SessionID: data.SessionID,
										DocumentTypeName: "Entrega - Documentos Numero de Identificacion",
										Keywords: [
											{
											KeywordName: "ID Documento",
											KeywordValue: content.ID_DOCUMENTO
											},
											{
											"KeywordName": "Numero Identificacion",
											"KeywordValue": campo==="M" ? content.ENTREGA:content.NUMERO_IDENTIFICACION
											}
										]
								    };
								  
									jQuery.ajax({
											url: "/ONBASE/RESTDocsOnbase.svc/FindDocumentByKeyword",
											"headers": {
												"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
												"content-type": "application/json",
												"cache-control": "no-cache"
											},
											type: "POST",
											data: JSON.stringify(dataSesion),
											crossDomain: true,
											processData: false,
											success: function (dataDocument) {
												var dataDocumentSend = {
													SessionID: data.SessionID,
													DocumentID: dataDocument[0].DocumentID.toString()
												};
												
											
												jQuery.ajax({
													url: "/ONBASE/RESTDocsOnbase.svc/DeleteDocument",
													"headers": {
														"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
														"content-type": "application/json",
														"cache-control": "no-cache"
													},
													data: JSON.stringify(dataDocumentSend),
													type: "POST",
													crossDomain: true,
													success: function (datiDeletes) {
														
														// var fecha =content.VIGENCIA.split("/");
														var auxiliar = {
															"SessionID": data.SessionID,
															"Document": {
																"OBDocName": "Ejemplo.pdf",
																"OBDocExtension": "pdf",
																"FileTypeID": "16",
																"OBDocumentTypeName": "Entrega - Documentos Numero de Identificacion",
																"Comment": "Esto es un documento PDF",
																"OBDocBase64": enc,
																"Keywords": [
																{
																	"KeywordName": "ID Documento",
																	"KeywordValue": content.ID_DOCUMENTO
																}, 
																// {
																// 	"KeywordName": "Fecha Fin Vigencia",
																// 	"KeywordValue": fecha[2] + "-" +fecha[1]+ "-" +fecha[0]
																// },
																{
																"KeywordName": "Numero Identificacion",
																"KeywordValue": campo==="M" ? content.ENTREGA:content.NUMERO_IDENTIFICACION
																}
																]
								
															}
														};
								
														jQuery.ajax({
															url: "/ONBASE/RESTDocsOnbase.svc/UploadDocument",
															"headers": {
																"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
																"content-type": "application/json",
																"cache-control": "no-cache"
															},
															type: "POST",
															data: JSON.stringify(auxiliar),
															crossDomain: true,
															processData: false,
															success: function (dataDisconnect) {
																console.log(dataDisconnect);
																var dataDisconect = {
																	SessionID: data.SessionID
																};
																
																jQuery.ajax({
																	url: "/ONBASE/RESTDocsOnbase.svc/Disconnect",
																	"headers": {
																		"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
																		"content-type": "application/json",
																		"cache-control": "no-cache"
																	},
																	type: "POST",
																	data: JSON.stringify(dataDisconect),
																	crossDomain: true,
																	processData: false,
																	success: function (dataDisconnect12) {
																		console.log(dataDisconnect12);
																	},
																	error: function (abc, xyz) {
																		sap.ui.core.BusyIndicator.hide();
																		MessageBox.error("Ocurrio un error al realizar desconexion para materiales");
																	}
																});
																
															},
														// 	error: function (abc, xyz) {
														// 		//	that.getView().setBusy(false);
														// 		sap.ui.core.BusyIndicator.hide();
														// 		MessageBox.error("Ocurrio un error al cargar materiales");
														// 		//alert("Ocurrio un error al obtener la sesion")
														// 	}
														});
												
												
													}
													
												});
												
											}
										});
								    
								}
				    		})
				    	}
				    	
				    	
				    },
					400: function(){
						console.log("Erro al actualizar registro");
					}
				}
			})
			// }
		},
		insertValidate:function(content , enc , campo){
			// console.log(content);
			// console.log(JSON.stringify(content));
			// for(var i=0;i<content.length;i++){
			// if(enc != undefined && enc != ""){
			 var f = content.VIGENCIA.split("/");
			 content.VIGENCIA = f[0]+"-"+f[1]+"-"+f[2];
			
				$.ajax({
					url: "/XS_IPROVIDER_ENTREGA/IPROVIDER_ENTREGA/DOCUMENTOS/DocumentoIdentificacion.xsjs?NombreDoc="+content.DOCUMENTO_ADJUNTO,
					type: "POST",
					contentType: 'text/json',
					data: JSON.stringify(content),
					success: function (data) {
						console.log("Registro Añadido Exitosamente");
							jQuery.ajax({
								url: "/ONBASE/RESTDocsOnbase.svc/Connect",
								"headers": {
									"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
									"cache-control": "no-cache"
								},
								type: "GET",
								crossDomain: true,
								success: function (data) {
														
								// var fecha =content.VIGENCIA.split("/");
								var auxiliar = {
								"SessionID": data.SessionID,
								"Document": {
								"OBDocName": "Ejemplo.pdf",
								"OBDocExtension": "pdf",
								"FileTypeID": "16",
								"OBDocumentTypeName": "Entrega - Documentos Numero de Identificacion",
								"Comment": "Esto es un documento PDF",
								"OBDocBase64": enc,
								"Keywords": [
									{
									"KeywordName": "ID Documento",
									"KeywordValue": content.ID_DOCUMENTO
									}, 
									// {
									// "KeywordName": "Fecha Fin Vigencia",
									// "KeywordValue": fecha[2] + "-" +fecha[1]+ "-" +fecha[0]
									// },
									{
									"KeywordName": "Numero Identificacion",
									"KeywordValue": campo==="M" ? content.ENTREGA:content.NUMERO_IDENTIFICACION
									}
									]
									}
														};
										jQuery.ajax({
															url: "/ONBASE/RESTDocsOnbase.svc/UploadDocument",
															"headers": {
																"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
																"content-type": "application/json",
																"cache-control": "no-cache"
															},
															type: "POST",
															data: JSON.stringify(auxiliar),
															crossDomain: true,
															processData: false,
															success: function (dataDisconnect) {
																console.log(dataDisconnect);
																var dataDisconect = {
																	SessionID: data.SessionID
																};
																
																jQuery.ajax({
																	url: "/ONBASE/RESTDocsOnbase.svc/Disconnect",
																	"headers": {
																		"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
																		"content-type": "application/json",
																		"cache-control": "no-cache"
																	},
																	type: "POST",
																	data: JSON.stringify(dataDisconect),
																	crossDomain: true,
																	processData: false,
																	success: function (dataDisconnect12) {
																		console.log(dataDisconnect12);
																	},
																	error: function (abc, xyz) {
																		sap.ui.core.BusyIndicator.hide();
																		MessageBox.error("Ocurrio un error al realizar desconexion para materiales");
																	}
																});
																
															},
														// 	error: function (abc, xyz) {
														// 		//	that.getView().setBusy(false);
														// 		sap.ui.core.BusyIndicator.hide();
														// 		MessageBox.error("Ocurrio un error al cargar materiales");
														// 		//alert("Ocurrio un error al obtener la sesion")
														// 	}
														});
												
												
												
												
										
								    
								}
				    		});
					},
					error: function (e) {
						console.log("Ocurrio un error" + JSON.parse(e))
					}
				});
			// }
			// }
		},
		saveAttachment: function () {
			sap.m.MessageBox.confirm("¿Desea guardar los registros?", {
				title: "Mensaje",
				actions: [
					"Si",
					"Cancelar"
				],
				onClose: function (sActionClicked) {

					if (sActionClicked === "Si") {

						//Guardar Archivos en el ONBASE

						sap.m.MessageBox.success("Se ha guardado los registros", {
							title: "Mensaje",
							actions: [

								"Cerrar"
							],
							onClose: function () {

							}
						});

					}

				}
			});

		},
		saveGuia: function (lista, cita, context) {

			var that = this;
			var listFinal = [];
			var count = 1;
			console.log ("LISTA ENTREGAS A ENVIAR al ERP de ZET REGISTRO ENT");
			console.log (lista);
			var array =[];
			lista.forEach(function (value, index) {
			var obj ={
				"Vbeln": value.Vbeln,
				"Bolnr": value.Zbolnr
			};
			array.push(obj);
			});
			
				var obj1 = {
				  "Act": "X",
				  "ZET_REGISTRO_ENTRSet": array,
				  "ZET_REGISTRO_ENTR_RESSet": [
				    {
				      "Codigo": "",
				      "Msg": ""
				    }
				  ]
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
						url: "/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_REGISTRO_ENTRG_SRV/ZET_ACTSet",
						data: JSON.stringify(obj1)
					}).then(function successCallback(result, xhr, data) {
						//token = data.getResponseHeader("X-CSRF-Token");
						var response = result;
						// if (lista.length === count) {
							that.saveCEPlacaDni(cita, context.entregaGuiaSelected, context.listaDni, context.listaVeh, context);
						// } else {
						// 	count++;
						// }
						// that._oStorage.put('COMPLETESAVEGUI', 1);
					}, function errorCallback(xhr, readyState) {
						// that._oStorage.put('COMPLETESAVEGUI', 0);
						jQuery.sap.log.debug(xhr);
					});

				}, function errorCallback(xhr, readyState) {
					jQuery.sap.log.debug(xhr);
				});
			

		},
		saveCEPlacaDni: function (cita, listaEntrega, listaDni, listaVeh, context) {
			var that  =this;
			var count =1;
			var oView =this.getView(); 
			console.log("LISTA ENTREGA A ENVIAR A SET REGISTRO ENT PARA PLACA Y DNI");
			console.log(listaEntrega);
			var ModeloProyect = oView.getModel("Proyect");
			listaEntrega.forEach(function (value, index) {
			var direccion =  ModeloProyect.getProperty("/Direccion");
				//--------------------------------------------------------------------
				// if (listaVeh.length > 0) {
					// listaDni.forEach(function (valueDni, indexDni) {

						var obj = {
							Zcita: cita,
							Zvbeln: value.Vbeln,
							Zplaca: listaVeh[0],
							Zndni: listaDni[0]=== undefined ? "" :listaDni[0] ,
							Zndni2: listaDni[1]=== undefined ? "" :listaDni[1] ,
							Zndni3: listaDni[2]=== undefined ? "" :listaDni[2] ,
							Zndni4: listaDni[3]=== undefined ? "" :listaDni[3] ,
							Zdireccion : direccion,
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
								// var response = result;
								// if ((listaEntrega.length) * (listaDni.length) === count) {
								if(index === listaEntrega.length -1){
									
									jQuery.sap.delayedCall(2000, this, function() {
        							that.mostrarRegistros(context, cita, listaEntrega);
    								});
									
									
								}
								// } else {
								// 	count++;
								// }
							}, function errorCallback(xhr, readyState) {
								jQuery.sap.log.debug(xhr);
							});

						}, function errorCallback(xhr, readyState) {
							jQuery.sap.log.debug(xhr);
						});
					
			});

		},
	
		generatePdfWithQr: function (context, listaGeneral, citax) {
			var that = this;
			that.saveCitaHanaScp(context, listaGeneral, citax);

			//generar pdf's con listaGeneral: fin -------------------------------------------
			// that.saveCitaHanaScp(context, citax);

		},
		// },
		downloadQr: function () {
			var that = this;
			var oView = that.getView();
			
			oView.byId("DialogFormatQR").getScrollDelegate().scrollTo(0, 0)

			var idInicial = this.getView().byId("total").getDomRef().firstChild.id
			var idFinal = this.getView().byId("total").getDomRef().lastChild.id

			var idtotal = this.getView().byId("total").getDomRef().id
			var rango = $("#" + idtotal + "> div").length
			var arr = [];
			var nameEntrega, cita, j;
			var listaAux = [];
			that.Base64=[];
			
			sap.ui.core.BusyIndicator.show(0);
			
			for (var i = 0; i < rango; i++) {
				var pdf = new jsPDF('p', 'mm');
				var divs = $("#" + idtotal + "> div").get(i)
				
				var fileContent = $("#" + divs.id).wordExport();
				var blob = new Blob([fileContent], {
					type: "application/msword;charset=utf-8"
				});
				if(i==0){
					var obj = {
						cita: that.entregas[0].cita,
						entrega: "",
						file: btoa(fileContent)
					};
					saveAs(blob, "Cita numero:"+ that.entregas[0].cita + ".doc");
					
					that.Base64.push(obj);
				}else{
					nameEntrega = that.entregas[i-1].entrega;
					var obj = {
						cita: that.entregas[0].cita,
						entrega: nameEntrega,
						file: btoa(fileContent)
					};
					
					saveAs(blob, "Entrega numero:"+nameEntrega + ".doc");
					
					that.Base64.push(obj);
				}
				
				// divs.style.display = "none";
			}
			
			// var tiempo = 1500 * parseInt(rango);
			// setTimeout(function () {
				
				oView.byId("total").destroyItems();
				//enviar a onbase los pdf_qr----------------------------------------------------
				that.CancelarDocQr();
				that.sendOnBaseQR(that.entregas[0]);
			// }, tiempo)


		},
		CancelarQR :async function (){
			var that = this;
			var oView = that.getView();
			
			oView.byId("DialogFormatQR").getScrollDelegate().scrollTo(0, 0)

			var idInicial = this.getView().byId("total").getDomRef().firstChild.id
			var idFinal = this.getView().byId("total").getDomRef().lastChild.id

			var idtotal = this.getView().byId("total").getDomRef().id
			var rango = $("#" + idtotal + "> div").length
			var arr = [];
			var nameEntrega, cita, j;
			var listaAux = [];
			that.Base64=[];
			
			sap.ui.core.BusyIndicator.show(0);
			
			for (var i = 0; i < rango; i++) {
				var pdf = new jsPDF('p', 'mm');
				var divs = $("#" + idtotal + "> div").get(i)
				
				var fileContent = $("#" + divs.id).wordExport();
				var blob = new Blob([fileContent], {
					type: "application/msword;charset=utf-8"
				});
				if(i==0){
					var obj = {
						cita: that.entregas[0].cita,
						entrega: "",
						file: btoa(fileContent)
					};
					// saveAs(blob, "Cita numero:"+ that.entregas[0].cita + ".doc");
					
					that.Base64.push(obj);
				}else{
					nameEntrega = that.entregas[i-1].entrega;
					var obj = {
						cita: that.entregas[0].cita,
						entrega: nameEntrega,
						file: btoa(fileContent)
					};
					
					// saveAs(blob, "Entrega numero:"+nameEntrega + ".doc");
					
					that.Base64.push(obj);
				}
				
				// divs.style.display = "none";
			}
			
			// var tiempo = 1500 * parseInt(rango);
			// setTimeout(function () {
				
				oView.byId("total").destroyItems();
				//enviar a onbase los pdf_qr----------------------------------------------------
				that.CancelarDocQr();
				that.sendOnBaseQR(that.entregas[0]);

		
		},
		
		sendOnBaseQR: function (value) {
			var that = this;
			var dataDisconect ;
			jQuery.ajax({
					url: "/ONBASE/RESTDocsOnbase.svc/Connect",
					"headers": {
						"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
						"cache-control": "no-cache"
					},
					type: "GET",
					crossDomain: true,
					success: function (data) {
						 dataDisconect = {
							SessionID: data.SessionID
						};
			
			that.Base64.forEach(async function (doc,index) {
						var auxiliar = {
							"SessionID": dataDisconect.SessionID,
							"Document": {
								"OBDocName": value.cita ,
								"OBDocExtension": "pdf",
								"FileTypeID": "16",
								"OBDocumentTypeName": "Entrega - Documentos Entrega",
								"Comment": "Esto es un documento PDF con QR",
								"OBDocBase64": doc.file,
								"Keywords": [{
									"KeywordName": "Cita",
									"KeywordValue": doc.cita + AMBIENTE
								} ,
								{
									"KeywordName": "Numero de Entrega",
									"KeywordValue": doc.entrega + AMBIENTE
								}
								]

							}
						};
							// if(index === that.Base64.length-1){
							await	jQuery.ajax({
							url: "/ONBASE/RESTDocsOnbase.svc/UploadDocument",
							"headers": {
								"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
								"content-type": "application/json",
								"cache-control": "no-cache"
							},
							type: "POST",
							data: JSON.stringify(auxiliar),
							crossDomain: true,
							processData: false,
							success: function (dataDisconnect) {
								console.log(dataDisconnect);
							if(index === that.Base64.length-1){	
								jQuery.ajax({
									url: "/ONBASE/RESTDocsOnbase.svc/Disconnect",
									"headers": {
										"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
										"content-type": "application/json",
										"cache-control": "no-cache"
									},
									type: "POST",
									data: JSON.stringify(dataDisconect),
									crossDomain: true,
									processData: false,
									success: function (dataDisconnect) {
											sap.ui.core.BusyIndicator.hide();
										console.log(dataDisconnect);

									}
								});
							}
								
								} , error : function (){
										if(index === that.Base64.length-1){	
								jQuery.ajax({
									url: "/ONBASE/RESTDocsOnbase.svc/Disconnect",
									"headers": {
										"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
										"content-type": "application/json",
										"cache-control": "no-cache"
									},
									type: "POST",
									data: JSON.stringify(dataDisconect),
									crossDomain: true,
									processData: false,
									success: function (dataDisconnect) {
											sap.ui.core.BusyIndicator.hide();
										console.log(dataDisconnect);

									}
								});
							}
									
								}
							});
							
						// 		}else {
						// 		jQuery.ajax({
						// 	url: "/ONBASE/RESTDocsOnbase.svc/UploadDocument",
						// 	"headers": {
						// 		"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
						// 		"content-type": "application/json",
						// 		"cache-control": "no-cache"
						// 	},
						// 	type: "POST",
						// 	data: JSON.stringify(auxiliar),
						// 	crossDomain: true,
						// 	processData: false,
						// 	success: function (dataDisconnect) {
						// 		console.log(dataDisconnect);
								
							
						// 	}
						// });	
									
						// 		}

				

			});
			
				}
			});
			
			
			

		},
		sendDocMatOnbase: function (cita) {
			var that = this;
			var lista = [];
			that.materiales.forEach(function (value, index) {
				if (!Utilities.isEmpty(value.file)) {
					// value.fechaVencimiento = new Date(value.fechaVencimiento + "T10:20:30Z");
					// value.fechaVencimiento = Utilities.obtenerGetTime(value.fechaVencimiento);
					lista.push(value);
				}
			});

			if (lista.length === 0) {
				that.sendDocPersonaOnbase(cita);

			} else {
				that.sendOnBaseAttachmentFileMat(lista, cita);
			}

		},
		sendOnBaseAttachmentFileMat: function (lista, cita) {
			var that = this;
			var count = 1;
			lista.forEach(function (value, index) {

				if (Utilities.isEmpty(value.fechaVencimiento)) {
					var now = new Date();
					now = now.slice(0, 10);
					value.fechaVencimiento = Utilities.formatDateX2(now);
				}

				jQuery.ajax({
					url: "/ONBASE/RESTDocsOnbase.svc/Connect",
					"headers": {
						"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
						"cache-control": "no-cache"
					},
					type: "GET",
					crossDomain: true,
					success: function (data) {
						var dataDisconect = {
							SessionID: data.SessionID
						};

						var auxiliar = {
							"SessionID": dataDisconect.SessionID,
							"Document": {
								"OBDocName": value.file.filename,
								"OBDocExtension": "pdf",
								"FileTypeID": "16",
								"OBDocumentTypeName": "Entrega - Documentos Numero de Identificacion",
								"Comment": "Esto es un documento PDF",
								"OBDocBase64": value.file.encode,
								"Keywords": [{
									"KeywordName": "ID Documento",
									"KeywordValue": value.idDoc
								}, {
									"KeywordName": "Fecha Fin Vigencia",
									"KeywordValue": value.fechaVencimiento
								}]

							}
						};

						jQuery.ajax({
							url: "/ONBASE/RESTDocsOnbase.svc/UploadDocument",
							"headers": {
								"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
								"content-type": "application/json",
								"cache-control": "no-cache"
							},
							type: "POST",
							data: JSON.stringify(auxiliar),
							crossDomain: true,
							processData: false,
							success: function (dataDisconnect) {
								console.log(dataDisconnect);
								jQuery.ajax({
									url: "/ONBASE/RESTDocsOnbase.svc/Disconnect",
									"headers": {
										"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
										"content-type": "application/json",
										"cache-control": "no-cache"
									},
									type: "POST",
									data: JSON.stringify(dataDisconect),
									crossDomain: true,
									processData: false,
									success: function (dataDisconnect) {
										console.log(dataDisconnect);

										if (lista.length == count) {

											that.sendDocPersonaOnbase(cita);
										} else {
											count++;
										}
									},
									error: function (abc, xyz) {
										//	that.getView().setBusy(false);
										sap.ui.core.BusyIndicator.hide();
										MessageBox.error("Ocurrio un error al realizar desconexion para materiales");
										//alert("Ocurrio un error al obtener la sesion")
									}
								});

							},
							error: function (abc, xyz) {
								//	that.getView().setBusy(false);
								sap.ui.core.BusyIndicator.hide();
								MessageBox.error("Ocurrio un error al cargar materiales");
								//alert("Ocurrio un error al obtener la sesion")
							}
						});

					},
					error: function (abc, xyz) {
						//	that.getView().setBusy(false);
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error("Ocurrio un error al realizar conexion para materiales");
						//alert("Ocurrio un error al obtener la sesion")
					}
				});

			});

		},
		sendDocPersonaOnbase: function (cita) {
			var that = this;
			var lista = [];
			that.listaProvPersona.forEach(function (value, index) {
				if (!Utilities.isEmpty(value.file)) {
					// value.fechaVencimiento = new Date(value.fechaVencimiento + "T10:20:30");
					lista.push(value);
				}
			});

			if (lista.length === 0) {
				that.sendDocVehiculoOnbase(cita);
			} else {
				that.sendOnBaseAttachmentFilePersona(lista, cita);
			}

		},
		sendOnBaseAttachmentFilePersona: function (lista, cita) {
			var that = this;
			var count = 1;
			lista.forEach(function (value, index) {

				if (Utilities.isEmpty(value.fechaVencimiento)) {
					var now = new Date();
					now = now.slice(0, 10);
					value.fechaVencimiento = Utilities.formatDateX2(now);
				}

				jQuery.ajax({
					url: "/ONBASE/RESTDocsOnbase.svc/Connect",
					"headers": {
						"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
						"cache-control": "no-cache"
					},
					type: "GET",
					crossDomain: true,
					success: function (data) {
						var dataDisconect = {
							SessionID: data.SessionID
						};

						var auxiliar = {
							"SessionID": dataDisconect.SessionID,
							"Document": {
								"OBDocName": value.file.filename,
								"OBDocExtension": "pdf",
								"FileTypeID": "16",
								"OBDocumentTypeName": "Entrega - Documentos Numero de Identificacion",
								"Comment": "Esto es un documento PDF",
								"OBDocBase64": value.file.encode,
								"Keywords": [{
									"KeywordName": "ID Documento",
									"KeywordValue": value.idDoc
								}, {
									"KeywordName": "Fecha Fin Vigencia",
									"KeywordValue": value.fechaVencimiento
								}, {
									"KeywordName": "Numero Identificacion",
									"KeywordValue": value.dni
								}]

							}
						};

						jQuery.ajax({
							url: "/ONBASE/RESTDocsOnbase.svc/UploadDocument",
							"headers": {
								"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
								"content-type": "application/json",
								"cache-control": "no-cache"
							},
							type: "POST",
							data: JSON.stringify(auxiliar),
							crossDomain: true,
							processData: false,
							success: function (dataDisconnect) {
								console.log(dataDisconnect);
								jQuery.ajax({
									url: "/ONBASE/RESTDocsOnbase.svc/Disconnect",
									"headers": {
										"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
										"content-type": "application/json",
										"cache-control": "no-cache"
									},
									type: "POST",
									data: JSON.stringify(dataDisconect),
									crossDomain: true,
									processData: false,
									success: function (dataDisconnect) {
										console.log(dataDisconnect);

										if (lista.length == count) {

											that.sendDocVehiculoOnbase(cita);
										} else {
											count++;
										}
									},
									error: function (abc, xyz) {
										//	that.getView().setBusy(false);
										sap.ui.core.BusyIndicator.hide();
										MessageBox.error("Ocurrio un error al realizar desconexion para personas");
										//alert("Ocurrio un error al obtener la sesion")
									}
								});

							},
							error: function (abc, xyz) {
								//	that.getView().setBusy(false);
								sap.ui.core.BusyIndicator.hide();
								MessageBox.error("Ocurrio un error al realizar upload para personas");
								//alert("Ocurrio un error al obtener la sesion")
							}
						});

					},
					error: function (abc, xyz) {
						//	that.getView().setBusy(false);
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error("Ocurrio un error al realizar conexion para personas");
						//alert("Ocurrio un error al obtener la sesion")
					}
				});

			});

		},
		sendDocVehiculoOnbase: function (cita) {
			var that = this;
			var lista = [];
			that.listaProvVehiculo.forEach(function (value, index) {
				if (!Utilities.isEmpty(value.file)) {
					// value.fechaVencimiento = new Date(value.fechaVencimiento + "T10:20:30");
					lista.push(value);
				}
			});

			if (lista.length === 0) {
				that.saveGuia(that.entregaGuiaSelected, cita, that);

			} else {
				that.sendOnBaseAttachmentFileVehiculo(lista, cita);
			}

		},
		sendOnBaseAttachmentFileVehiculo: function (lista, cita) {
			var that = this;
			var count = 1;
			lista.forEach(function (value, index) {
				
				if(Utilities.isEmpty(value.fechaVencimiento)){
					var now  = new Date();
					now = now.slice(0, 10);
					value.fechaVencimiento = Utilities.formatDateX2(now);                   
				}
				
				jQuery.ajax({
					url: "/ONBASE/RESTDocsOnbase.svc/Connect",
					"headers": {
						"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
						"cache-control": "no-cache"
					},
					type: "GET",
					crossDomain: true,
					success: function (data) {
						var dataDisconect = {
							SessionID: data.SessionID
						};

						var auxiliar = {
							"SessionID": dataDisconect.SessionID,
							"Document": {
								"OBDocName": value.file.filename,
								"OBDocExtension": "pdf",
								"FileTypeID": "16",
								"OBDocumentTypeName": "Entrega - Documentos Numero de Identificacion",
								"Comment": "Esto es un documento PDF",
								"OBDocBase64": value.file.encode,
								"Keywords": [{
									"KeywordName": "ID Documento",
									"KeywordValue": value.idDoc
								}, {
									"KeywordName": "Fecha Fin Vigencia",
									"KeywordValue": value.fechaVencimiento
								}, {
									"KeywordName": "Numero Identificacion",
									"KeywordValue": value.placa
								}]

							}
						};

						jQuery.ajax({
							url: "/ONBASE/RESTDocsOnbase.svc/UploadDocument",
							"headers": {
								"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
								"content-type": "application/json",
								"cache-control": "no-cache"
							},
							type: "POST",
							data: JSON.stringify(auxiliar),
							crossDomain: true,
							processData: false,
							success: function (dataDisconnect) {
								console.log(dataDisconnect);
								jQuery.ajax({
									url: "/ONBASE/RESTDocsOnbase.svc/Disconnect",
									"headers": {
										"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
										"content-type": "application/json",
										"cache-control": "no-cache"
									},
									type: "POST",
									data: JSON.stringify(dataDisconect),
									crossDomain: true,
									processData: false,
									success: function (dataDisconnect) {
										console.log(dataDisconnect);

										if (lista.length == count) {

											that.saveGuia(that.entregaGuiaSelected, cita, that);
										} else {
											count++;
										}
									},
									error: function (abc, xyz) {
										//	that.getView().setBusy(false);
										sap.ui.core.BusyIndicator.hide();
										MessageBox.error("Ocurrio un error al realizar desconexion para vehiculos");
										//alert("Ocurrio un error al obtener la sesion")
									}
								});

							},
							error: function (abc, xyz) {
								//	that.getView().setBusy(false);
								sap.ui.core.BusyIndicator.hide();
								MessageBox.error("Ocurrio un error al realizar upload para vehiculos");
								//alert("Ocurrio un error al obtener la sesion")
							}
						});

					},
					error: function (abc, xyz) {
						//	that.getView().setBusy(false);
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error("Ocurrio un error al realizar desconexion para vehiculos");
						//alert("Ocurrio un error al obtener la sesion")
					}
				});

			});

		},

		
		CancelarDocQr: function () {
			var that = this;
			that.byId("DialogFormatQR").close();
		},
		InputFecVencMat: function (oEvent) {
			var that = this;
			var oView = that.getView();

			var context = oEvent.getSource().getBindingContext();
			var fechaVenc = oEvent.mParameters.newValue;
			var path = context.getPath();
			that.index = (path.substring(22, path.length)) * 1;
			that.obj = context.getObject(path);

			that.materiales.forEach(function (value, index) {
				if (index === that.index) {
					value.fechaVencimiento = fechaVenc;
				}
			});
			var obj = {
				recipient: {
					materiales: that.materiales,
					provedorPer: that.listaProvPersona,
					provedorVeh: that.listaProvVehiculo
				}
			};
			var oModelMat = new JSONModel(obj);
			that.byId("DialogMant").setModel(oModelMat);

		},
		InputFecVencPer: function (oEvent) {
			var that = this;
			var oView = that.getView();

			var context = oEvent.getSource().getBindingContext();
			var fechaVenc = oEvent.mParameters.newValue;
			var path = context.getPath();
			that.indexPP = (path.substring(23, path.length)) * 1;
			that.obj = context.getObject(path);

			that.listaProvPersona.forEach(function (value, index) {
				if (index === that.indexPP) {
					value.fechaVencimiento = fechaVenc;
				}
			});
			var obj = {
				recipient: {
					materiales: that.materiales,
					provedorPer: that.listaProvPersona,
					provedorVeh: that.listaProvVehiculo
				}
			};
			var oModelMat = new JSONModel(obj);
			that.byId("DialogMant").setModel(oModelMat);

		},
		InputFecVencVeh: function (oEvent) {
			var that = this;
			var oView = that.getView();

			var context = oEvent.getSource().getBindingContext();
			var fechaVenc = oEvent.mParameters.newValue;
			var path = context.getPath();
			that.indexPV = (path.substring(23, path.length)) * 1;
			that.obj = context.getObject(path);

			that.listaProvVehiculo.forEach(function (value, index) {
				if (index === that.indexPV) {
					value.fechaVencimiento = fechaVenc;
				}
			});
			var obj = {
				recipient: {
					materiales: that.materiales,
					provedorPer: that.listaProvPersona,
					provedorVeh: that.listaProvVehiculo
				}
			};
			var oModelMat = new JSONModel(obj);
			that.byId("DialogMant").setModel(oModelMat);

		},
		_onDownloadDoc: function (oEvent) {
			var that = this;
			var oBindingContext = oEvent.getSource().getParent().getBindingContext("Proyect2") ;
			var oBindingObject = oBindingContext.getObject();

			sap.ui.core.BusyIndicator.show(0);
			jQuery.ajax({
				url: "/ONBASE/RESTDocsOnbase.svc/Connect",
				"headers": {
					"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
					"cache-control": "no-cache"
				},
				type: "GET",
				crossDomain: true,
				success: function (data) {
					console.log(data);
					var dataSesion = {
						SessionID: data.SessionID,
						DocumentTypeName: "Entrega - Documentos Entrega",
						Keywords: [{
								KeywordName: "Cita",
								KeywordValue: oBindingObject.ZCita + AMBIENTE
							}

					
						]
					};

					jQuery.ajax({
						url: "/ONBASE/RESTDocsOnbase.svc/FindDocumentByKeyword",
						"headers": {
							"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
							"content-type": "application/json",
							"cache-control": "no-cache"
						},
						type: "POST",
						data: JSON.stringify(dataSesion),
						crossDomain: true,
						processData: false,
						success: function (dataDocument) {
							if (dataDocument.length === 0) {
								sap.m.MessageBox.error("No se encontró ningún documento", {
									title: "Mensaje",
									actions: [
										"Aceptar"

									],
									onClose: function (sActionClicked) {}
								});
								sap.ui.core.BusyIndicator.hide();
								return;
							}
							dataDocument.forEach(function(obj,index){
							var dataDocumentSend = {
								SessionID: data.SessionID,
								DocumentID: obj.DocumentID.toString()
							};
							jQuery.ajax({
								url: "/ONBASE/RESTDocsOnbase.svc/GetDocument",
								"headers": {
									"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
									"content-type": "application/json",
									"cache-control": "no-cache"
								},
								type: "POST",
								data: JSON.stringify(dataDocumentSend),
								crossDomain: true,
								processData: false,
								success: function (dataPDF) {

									var base64EncodedPDF = atob(dataPDF.OBDocBase64).toString(); // the encoded string
								
									if(dataPDF.Keywords[1].KeywordValue === AMBIENTE.replace(" ","")){
									var linkSource = base64EncodedPDF;
									var blob = new Blob([linkSource], {
										type: "application/msword;charset=utf-8"
									});
									saveAs(blob, "Cita numero: "+ dataPDF.Keywords[0].KeywordValue.replace(AMBIENTE,"") + ".doc");
									// saveAs(blob, "Entrega numero:"+nameEntrega + ".doc");
									
									// var downloadLink = document.createElement("a");
									// var fileName = "Cita "+ dataPDF.Keywords[0].KeywordValue;
									// downloadLink.href = "data:application/pdf;base64," +linkSource;
									// downloadLink.download = fileName.replace(AMBIENTE,"");
									// downloadLink.click();	
										
									}else {
									
									var linkSource = base64EncodedPDF;
									var blob = new Blob([linkSource], {
										type: "application/msword;charset=utf-8"
									});
										saveAs(blob, "Entrega : "+ dataPDF.Keywords[1].KeywordValue.replace(AMBIENTE,"") + ".doc");
									// var downloadLink = document.createElement("a");
									// var fileName = "Entrega "+ dataPDF.Keywords[1].KeywordValue;
									// downloadLink.href = "data:application/pdf;base64," +linkSource;
									// downloadLink.download = fileName.replace(AMBIENTE,"");
									// downloadLink.click();	
										
									}
								
								
									if(index === dataDocument.length-1){ 
								
										var dataDisconect = {
											SessionID: data.SessionID
									};
											jQuery.ajax({
								url: "/ONBASE/RESTDocsOnbase.svc/Disconnect",
								"headers": {
									"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
									"content-type": "application/json",
									"cache-control": "no-cache"
								},
								type: "POST",
								data: JSON.stringify(dataDisconect),
								crossDomain: true,
								processData: false,
								success: function (dataDisconnect) {
								sap.ui.core.BusyIndicator.hide();	
								}
							});
								
									}
									
									
								
									
									

								}

							});
							
							
							
							
							
							
								
							});
							

						},
						error: function (error) {

							sap.ui.core.BusyIndicator.hide();
							if (error.responseText.search("No se encontró ningún documento para los keywords ingresados") !== -1) {
								sap.m.MessageBox.error("No se encontró ningún documento", {
									title: "Mensaje",
									actions: [
										"Aceptar"

									],
									onClose: function (sActionClicked) {}
								});
							}
						}

					});
					
					
					

				},
				error: function (error) {
					sap.ui.core.BusyIndicator.hide();
					console.log(error);
				}

			});

		},
		handlePdf: function () {
			// var tabledata = oTable.getModel().getData();
			var lista = [{
				Zanzpk: "00001",
				Zbezei: "P",
				Zbolnr: "1",
				Zbreit: "2.000",
				ZbrgewB: "70.000",
				ZbrgewM: "20.000",
				Zbtgew: "50.000",
				Zcita: "1000000002",
				ZcitaF: "",
				Zdireccion: "",
				Zdni: "45698789",
				Zebeln: "3100027277",
				Zecri: "IRREGULAR",
				Zgewei: "KG",
				Zgort: "BVN - Lima",
				Zhoehe: "3.000",
				Zlaeng: "1.000",
				Zlfdat: "/Date(1598400000000)/",
				Zlfuhr: "PT11H00M00S",
				Zmaktx: "GUIDING RING 086750882 RESEMIN",
				Zmatnr: "2000020972",
				Zobservacion: "OBSERVACION 1",
				Zplaca: "123-HGY",
				Zseqnr: "000001",
				ZsmtpAddr: "",
				Zvbeln: "180128033",
				ZvbelnF: "",
				Zvegr2: "PAL",
				Zvemng: "2.000",
				ZvhilmKu: "1",
				Zwerks: "1000",
				ZzlugEnt: "",
				Zzona: "A"
			}, {
				Zanzpk: "00001",
				Zbezei: "P",
				Zbolnr: "1",
				Zbreit: "2.000",
				ZbrgewB: "70.000",
				ZbrgewM: "20.000",
				Zbtgew: "50.000",
				Zcita: "1000000002",
				ZcitaF: "",
				Zdireccion: "",
				Zdni: "45698789",
				Zebeln: "3100027277",
				Zecri: "IRREGULAR",
				Zgewei: "KG",
				Zgort: "BVN - Lima",
				Zhoehe: "3.000",
				Zlaeng: "1.000",
				Zlfdat: "/Date(1598400000000)/",
				Zlfuhr: "PT11H00M00S",
				Zmaktx: "GUIDING RING 086750882 RESEMIN",
				Zmatnr: "2000020972",
				Zobservacion: "OBSERVACION 1",
				Zplaca: "123-HGY",
				Zseqnr: "000001",
				ZsmtpAddr: "",
				Zvbeln: "180128034",
				ZvbelnF: "",
				Zvegr2: "PAL",
				Zvemng: "2.000",
				ZvhilmKu: "1",
				Zwerks: "1000",
				ZzlugEnt: "",
				Zzona: "A"
			}];
			this.JSONToPDFConvertor(lista);
		},
		JSONToPDFConvertor: function (JSONData) {

			var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
			var columns = new Array;
			for (var index in arrData[0]) {
				//Now convert each value to string and comma-seprated
				columns.push(index);
			}
			var rows = new Array;
			console.log(arrData);
			for (var i = 0; i < arrData.length; i++) {
				rows[i] = new Array;

				for (var j = 0; j < arrData.length;) {

					for (var index in arrData[0]) {

						rows[i][j] = arrData[i][index];
						j++;
					}
				}
			}
			if (columns.length < 4) {
				var doc = new jsPDF('p', 'pt');
			} else {
				var doc = new jsPDF('l', 'pt');
			}
			doc.autoTable(columns, rows);


			doc.save('table.pdf');

		},
		getData: function () {
			var that = this;
			jQuery.sap.require("jquery.sap.storage");
			that._oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);
			var listaEntrega = [{
						cita: "1000000096",
						entrega: "180128222"
					}, {
						cita: "1000000096",
						entrega: "180128223"
					}
					// , 
					// {
					// 	cita: "1000000078",
					// 	entrega: "180128183"
					// }
				]
				// var listaEntrega = [{
				// 			cita: "1000000085",
				// 			entrega: "180128777"
				// 		}, {
				// 			cita: "1000000085",
				// 			entrega: "180128778"
				// 		}
				// 		// , 
				// 		// {
				// 		// 	cita: "1000000078",
				// 		// 	entrega: "180128183"
				// 		// }
				// 	]

			that.LISTA_GENERAL = [];
			listaEntrega.forEach(function (value, index) {

				jQuery.ajax({
					method: 'GET',
					cache: false,
					headers: {
						"X-CSRF-Token": "Fetch"
					},
					async: false,
					url: "/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_REL_PEDC_XCONF_SRV/ZET_MOSTRAR_REGISTROSet?$filter=Zcita eq '" + value.cita +
						"' and Zvbeln eq '" + value.entrega + "'&$format=json"

				}).then(function successCallback(result, xhr, data) {
					var response = result.d.results;
					response.forEach(function (value2, index2) {
						if (value2.Zcita === value.cita && value2.Zvbeln === value.entrega) {
							that.LISTA_GENERAL.push(value2);
						}
					});

				}, function errorCallback(xhr, readyState) {
					jQuery.sap.log.debug(xhr);
				});
			});
			return that.LISTA_GENERAL;

		},
		onTest: function () {
			var that = this;
			var oView = that.getView();
			var table = oView.byId("table");
			var indexes = table.clearSelection();
		},
	
		loadNew: function () {
			var that = this;
			that.onAfterRendering();

		},
		pressTest: function () {
			var that = this;
			var oView = that.getView();
			var oMultiInput1 = oView.byId("multiInput1").getValue();
			console.log(oMultiInput1);
			oView.byId("multiInput1").setValue("");

		},
		simulateServerRequest: function () {
			// simulate a longer running operation
			iTimeoutId = setTimeout(function () {
				this._oBusyDialog.close();
			}.bind(this), 5000);
		},
		onHome: function () {
			var that = this;
			var aplicacion = "#";
			var accion = "";
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			oCrossAppNavigator.toExternal({
				target: {
					semanticObject: aplicacion,
					action: accion
				}
			});
		},
		prueba: function () {
			var oGlobalBusyDialog = new sap.m.BusyDialog();
			oGlobalBusyDialog.open(1);
			var num = "5456.89";
			var resp = Utilities.formaterNumMiles(num);
			alert(resp);
		},
		//Nuevas funciones tarjet 2 Kassiel
		ValidarCamposEntregaTarjet2:function(oEvent){
			var that=this;
			var oView=this.getView();
			var ModeloProyect = oView.getModel("Proyect");
			var condEntrega = ModeloProyect.getProperty("/DataCondEntrega");
			var table = oView.byId("table2");
			var context = oEvent.getParameter("rowContext");
			if(context != null){
				var path = context.sPath;
				var Object = oView.getModel("Proyect").getProperty(path);
			}
			var oIndex = oEvent.getParameter('rowIndex');
			var Selecciones =table.getSelectedIndices();
			var selectedEntries=[];
			for(var i=0; i<Selecciones.length; i++){
				var oData = table.getContextByIndex(Selecciones[i]);
				selectedEntries.push(oData.getProperty(oData.getPath()));
			}
			
			if(Selecciones.length>1){
				this.getView().byId("modificarTarget2").setEnabled(false)
				this.getView().byId("eliminarTarget2").setEnabled(true)
			}else{
				this.getView().byId("modificarTarget2").setEnabled(true)
				this.getView().byId("eliminarTarget2").setEnabled(true)
			}
			// console.log(selectedEntries)
			localStorage.setItem("arrayEntregasTarjet2", JSON.stringify(selectedEntries));
		},
		table2Eliminar:function(){
			var that=this;
			var oView=this.getView();
			var objDeleteSap;
			var arrayEntregasTarjet2 = JSON.parse(localStorage.getItem("arrayEntregasTarjet2"));
			if(arrayEntregasTarjet2.length==0){
				MessageBox.show(
					"Seleccione una entrega", {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						title: "",
						actions: ['OK'],
						onClose: function (sActionClicked) {}
					}
				);
			}else{
				var content=[];
				for(var i=0;i<arrayEntregasTarjet2.length;i++){
					var obj={}
					obj.Zcita=arrayEntregasTarjet2[i].ZCita
					obj.Msg= ""
					content.push(obj)
				}
				objDeleteSap={
					"Zflag": "X",
					"ZET_ELIM_DETSet": content
				}
				MessageBox.show(
					"¿Desea eliminar cita?", {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						title: "Mensaje",
						actions: ['Si','No'],
						onClose: function (sActionClicked) {
							if(sActionClicked==="Si"){
								that.methodDeleteSapCita(objDeleteSap)
							}
						}
					}
				);
			}
		},
	
		saveAttachment: function () {
			sap.m.MessageBox.confirm("¿Desea guardar los registros?", {
				title: "Mensaje",
				actions: [
					"Si",
					"Cancelar"
				],
				onClose: function (sActionClicked) {

					if (sActionClicked === "Si") {

						//Guardar Archivos en el ONBASE

						sap.m.MessageBox.success("Se ha guardado los registros", {
							title: "Mensaje",
							actions: [

								"Cerrar"
							],
							onClose: function () {

							}
						});

					}

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
				console.log("ERP DE MOSTRAR REGISTRO ---- INICIO");
				
				console.log("DATA DEL ERP DE MOSTRAR REGISTRO ENTREGA");
				console.log(response);
				console.log("DATA del SCP que capturo");
				console.log(listaEntrega);
				
				listaEntrega.forEach(function (value, index) {
					response.forEach(function (value2, index2) {
						if (value2.Zcita === cita && value2.Zvbeln === value.Vbeln) {
							LISTA_GENERAL.push(value2);
						}
					});
				});
				console.log("FILTRO DE LA DATA ENTRE EL SCP Y ERP");
				console.log(LISTA_GENERAL);
					console.log("ERP DE MOSTRAR REGISTRO ---- Fin");
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
			that.saveCitaHanaScp(context, listaGeneral, citax);

			//generar pdf's con listaGeneral: fin -------------------------------------------
			// that.saveCitaHanaScp(context, citax);

		},
		saveCitaHanaScp: function (context, listaGeneral, cita) {
			var that = this;
			var oView = that.getView();
			jQuery.sap.require("jquery.sap.storage");
			context._oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);

			var obj = {
				ID_CITA: cita
			};
		// console.log("Lado de Kassiel antes PDF---- reviza bien CTM :v");
		console.log(listaGeneral);
			$.ajax({
				url: "/XS_IPROVIDER_ENTREGA/IPROVIDER_ENTREGA/CITAS/GenerarCita.xsjs",
				type: "POST",
				contentType: 'text/json',
				async: true,
				headers: {
					Authorization: "Basic VVNSX1JBVkE6UmF2YTIwMjAk"
				},
				data: JSON.stringify(obj),
				success: function (data) {
					context.getDataMain();
					context.getDateTarget2();
					oView.byId("table").clearSelection();
					// BusyIndicator.hide();
					that.entregas = [];
					// sap.ui.core.BusyIndicator.hide();
					sap.m.MessageBox.success("Se ha generado el número de cita " + cita, {
						title: "Mensaje de éxito",
						actions: ["OK"],
						onClose: function (sActionClicked) {
							if (sActionClicked === "OK") {
								that.refreshDataMain();
								
								context.byId("DialogMant").close();
								context.byId("DialogConfirmarCentro").close();

								//generar pdf's con listaGeneral: inicio -------------------------------------------
								var oView = context.getView();

								// var data = that.getData();
								var data = [];
								listaGeneral.forEach(function (value, index) {
									value.Zvemng = Utilities.formaterNumMiles(value.Zvemng);
									data.push(value);
								});
								console.log("Lado de Kassiel para PDF");
								console.log(listaGeneral);
								console.log(data);
								if (data.length === 0) {
									return;
								}
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
									var sociedad = arrayCoincidencias[0].Zbukrs;
									var entrega = arrayCoincidencias[0].Zvbeln;
									var proveedor = arrayCoincidencias[0].Zname1;
									var destino = arrayCoincidencias[0].Zgort;

									var guia = arrayCoincidencias[0].Zbolnr;
									var numeroTotalBultos = (arrayCoincidencias[0].Zanzpk) * 1;
									var condEnt = arrayCoincidencias[0].ZzlugEnt;
									var direccion = arrayCoincidencias[0].Zdireccion;
									var fecha = Utilities.formaterx(arrayCoincidencias[0].Zlfdat);
									
									var hora;
									if(Utilities.formatHour(arrayCoincidencias[0].Zlfuhr) == "00:00:00"){
										hora =Utilities.formatHour(arrayCoincidencias[0].Zlfuhr)
									}else{
										hora = Utilities.formatHour2(arrayCoincidencias[0].Zlfuhr);
									}
									var zona = arrayCoincidencias[0].Zzona;
									var pesoTotBultos = that.formatDecimal(arrayCoincidencias[0].Zbtgew);
									var placa = arrayCoincidencias[0].Zplaca;
									
									//nuevos campos 
									var almacen = arrayCoincidencias[0].Zlgobe ;
									var cantidadEmbalaje = parseInt(arrayCoincidencias[0].Ztotal_emb);

									var Bultos = [];
									var CantidadEntregas = arrayCoincidencias.length;
									while (CantidadEntregas !== 0) {
										var dataEntregas = arrayCoincidencias[0];
										var arrayBultos = [];
										var e = 1;
										for (e; e < arrayCoincidencias.length; e++) {
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
										var PesoBulto = that.formatDecimal(arrayBultos[0].ZbrgewB);
										var codigo = arrayBultos[0].Zbezei;
										var descipcion = (parseInt(arrayBultos[0].Zlaeng) + "x" + parseInt(arrayBultos[0].Zbreit) + "x" + parseInt(arrayBultos[
												0].Zhoehe))
											.toString();
										var CantidadEmbalajeBulto = parseInt(arrayBultos[0].Zul_aufl);

										var Pedido = [];
										var CantidadBulto = arrayBultos.length;
										// var CantidadEmbalajeBulto = "pendiente";
										while (CantidadBulto !== 0) {
											var dataButlto = arrayBultos[0];
											var arrayPedido = [];
											var i = 1;
											for (i; i < arrayBultos.length; i++) {
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

											var DescripcionPedido = arrayPedido[0].Zebeln;
											var Proveedor = arrayPedido[0].ZnameText;

											var dataPedidos = {
												DescripcionGeneral: DescripcionPedido,
												Proveedor: Proveedor,
												ArrayGeneral: arrayPedido

											};

											Pedido.push(dataPedidos);

										}
										var dataBultos = {
											Descipcion: descipcion,
											Codigo: codigo,
											CantidadEmbalajeBulto:CantidadEmbalajeBulto,
											PesoBult: PesoBulto,
											DescripcionGeneral: BultoCodigo,
											ArrayGeneral: Pedido
										};

										Bultos.push(dataBultos);

									}

									var DataEntregas = {
										cita: cita,
										sociedad : sociedad,
										entrega: entrega,
										almacen:almacen,
										proveedor: proveedor,
										cantidadEmbalaje:cantidadEmbalaje,
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
									that.entregas.push(DataEntregas);
								}
								var EntregasOrdenada=that.ordenarEntrega(Entregas);
								var Data = {
									ArrayGeneral: EntregasOrdenada
								};

								// console.log(Data)

								var arrtext = [];
								var cantidad = Data.ArrayGeneral.length
								for (var i = 0; i < Data.ArrayGeneral.length; i++) {
									if (cantidad == 1) {
										arrtext += Data.ArrayGeneral[i].entrega
									} else {
										arrtext += Data.ArrayGeneral[i].entrega + "-"
									}
									cantidad--;
								}
								var logo;
								if (sociedad === "1000") {
									logo = "/webapp/images/sociedad_1000.png";
								} else if (sociedad === "1100") {
									logo = "/webapp/images/sociedad_1100.png";
								} else if (sociedad === "1200") {
									logo = "/webapp/images/sociedad_1200.png";
								} else if (sociedad === "1300") {
									logo = "/webapp/images/sociedad_1300.png";
								} else if (sociedad === "1400") {
									logo = "/webapp/images/sociedad_1400.png";
								} else if (sociedad === "2100") {
									logo = "/webapp/images/sociedad_2100.png";
								} else if (sociedad === "7000") {
									logo = "/webapp/images/sociedad_7000.png";
								} else if (sociedad === "7100") {
									logo = "/webapp/images/sociedad_7100.png";
								} else if (sociedad === "8000") {
									logo = "/webapp/images/sociedad_8000.png";
								}
								
								if (!oView.byId("DialogFormatQR")) {
									Fragment.load({
										id: oView.getId(),
										name: "com.rava.project.fragment.GeneratePdfQr",
										controller: that
									}).then(function (oDialog) {
										oView.addDependent(oDialog);
										var ModeloProyect = oView.getModel("Proyect");
										that.onPdfFormat(Data,logo,arrtext);
										// var columHeader = ModeloProyect.getProperty("/DatacolumHeader");
										var qrCitaTotal= ModeloProyect.getProperty("/DataqrCitaTotal");
										var arrCitaTotal= ModeloProyect.getProperty("/DataarrCitaTotal");
										var arrCita= ModeloProyect.getProperty("/DataarrCita");
										var arrQrBultos= ModeloProyect.getProperty("/DataarrQrBultos");
										oDialog.open();
										
										// for(var o = 0; o < columHeader.length; o++){
										// 	document.getElementById(columHeader[o]).style.borderBottom="1px solid black"
										// }

										var textQRCitaTotal = arrCita[0].cita
										qrcode = new QRCode(document.getElementById(qrCitaTotal), {
											text: textQRCitaTotal, //ESTE ES EL TEXTO SE CONVERTIRA EL EL CODIGO QR 
											width: "120",
											height: "120",
											colorDark: "#000000",
											colorLight: "#ffffff",
											correctLevel: QRCode.CorrectLevel.H
										});
										for (var i = 0; i < arrCitaTotal.length; i++) {
											// var textQREntrega = arrCitaTotal[i].destino + "|" + arrCitaTotal[i].entrega + "|" + arrCitaTotal[i].nbultos + "|" +
											// 	arrCitaTotal[i].condEnt +
											// 	"|" +
											// 	arrCitaTotal[i].direccion + "|" + arrCitaTotal[i].fecha + "|" + arrCitaTotal[i].hora + "|" + arrCitaTotal[i].pesoTotBultos +
											// 	"|" + arrCitaTotal[i]
											// 	.zona;
											var textQREntrega = arrCitaTotal[i].entrega + "|" + arrCitaTotal[i].nbultos + "|" + arrCitaTotal[i].condEnt + "|" + arrCitaTotal[i].almacen

											qrcode = new QRCode(document.getElementById(arrCitaTotal[i].qrentrega), {
												text: textQREntrega, //ESTE ES EL TEXTO SE CONVERTIRA EL EL CODIGO QR 
												width: "110",
												height: "110",
												colorDark: "#000000",
												colorLight: "#ffffff",
												correctLevel: QRCode.CorrectLevel.H
											});
										}

										//PDF DETALLADOS
										for (var i = 0; i < arrCita.length; i++) {
											// var textQREntrega = arrCita[i].destino + "|" + arrCita[i].entrega + "|" + arrCita[i].nbultos + "|" + arrCita[i].condEnt +
											// 	"|" +
											// 	arrCita[i].direccion + "|" + arrCita[i].fecha + "|" + arrCita[i].hora + "|" + arrCita[i].pesoTotBultos + "|" +
											// 	arrCita[i]
											// 	.zona;
											
											var textQREntrega =arrCita[i].entrega + "|" + arrCita[i].nbultos + "|" + arrCita[i].condEnt+ "|" + arrCita[i].almacen

											qrcode = new QRCode(document.getElementById(arrCita[i].qrentrega), {
												text: textQREntrega, //ESTE ES EL TEXTO SE CONVERTIRA EL EL CODIGO QR 
												width: "110",
												height: "110",
												colorDark: "#000000",
												colorLight: "#ffffff",
												correctLevel: QRCode.CorrectLevel.H
											});
											// console.log("textQREntrega", textQREntrega)
										}

										for (var i = 0; i < arrQrBultos.length; i++) {
											// var textQRBulto = arrQrBultos[i].ordencompras + "|" + arrQrBultos[i].dimensionbulto+"|"+arrQrBultos[i].entrega + "|" + arrQrBultos[i].pesobulto + "|" +
											// 	arrQrBultos[i].cantidad + "|" + arrQrBultos[i].ecri;
											var textQRBulto = arrQrBultos[i].bulto + "|" + arrQrBultos[i].entrega
											qrcode = new QRCode(document.getElementById(arrQrBultos[i].qrBultos), {
												text: textQRBulto, //ESTE ES EL TEXTO SE CONVERTIRA EL EL CODIGO QR 
												width: "80",
												height: "80",
												colorDark: "#000000",
												colorLight: "#ffffff",
												correctLevel: QRCode.CorrectLevel.H
											});
											// console.log("textQRBulto", textQRBulto)
										}

									});
								} else {
									var ModeloProyect = oView.getModel("Proyect");
									that.onPdfFormat(Data,logo,arrtext);
									// var columHeader = ModeloProyect.getProperty("/DatacolumHeader");
									var qrCitaTotal= ModeloProyect.getProperty("/DataqrCitaTotal");
									var arrCitaTotal= ModeloProyect.getProperty("/DataarrCitaTotal");
									var arrCita= ModeloProyect.getProperty("/DataarrCita");
									var arrQrBultos= ModeloProyect.getProperty("/DataarrQrBultos");
									oView.byId("DialogFormatQR").open();
									
									// for(var o = 0; o < columHeader.length; o++){
									// 	document.getElementById(columHeader[o]).style.borderBottom="1px solid black"
									// }
									
									var textQRCitaTotal = arrCita[0].cita
									qrcode = new QRCode(document.getElementById(qrCitaTotal), {
										text: textQRCitaTotal, //ESTE ES EL TEXTO SE CONVERTIRA EL EL CODIGO QR 
										width: "120",
										height: "120",
										colorDark: "#000000",
										colorLight: "#ffffff",
										correctLevel: QRCode.CorrectLevel.H
									});
									for (var i = 0; i < arrCitaTotal.length; i++) {
										// var textQREntrega = arrCitaTotal[i].destino + "|" + arrCitaTotal[i].entrega + "|" + arrCitaTotal[i].nbultos + "|" +
										// 	arrCitaTotal[i].condEnt +
										// 	"|" +
										// 	arrCitaTotal[i].direccion + "|" + arrCitaTotal[i].fecha + "|" + arrCitaTotal[i].hora + "|" + arrCitaTotal[i].pesoTotBultos +
										// 	"|" + arrCitaTotal[i]
										// 	.zona;
											
										var textQREntrega = arrCitaTotal[i].entrega + "|" + arrCitaTotal[i].nbultos + "|" +
											arrCitaTotal[i].condEnt + "|" + arrCitaTotal[i].almacen

										qrcode = new QRCode(document.getElementById(arrCitaTotal[i].qrentrega), {
											text: textQREntrega, //ESTE ES EL TEXTO SE CONVERTIRA EL EL CODIGO QR 
											width: "110",
											height: "110",
											colorDark: "#000000",
											colorLight: "#ffffff",
											correctLevel: QRCode.CorrectLevel.H
										});
									}

									//PDF DETALLADOS
									for (var i = 0; i < arrCita.length; i++) {
										// var textQREntrega = arrCita[i].destino + "|" + arrCita[i].entrega + "|" + arrCita[i].nbultos + "|" + arrCita[i].condEnt +
										// 	"|" +
										// 	arrCita[i].direccion + "|" + arrCita[i].fecha + "|" + arrCita[i].hora + "|" + arrCita[i].pesoTotBultos + "|" +
										// 	arrCita[i]
										// 	.zona;
											
										var textQREntrega =arrCita[i].entrega + "|" + arrCita[i].nbultos + "|" + arrCita[i].condEnt + "|" + arrCita[i].almacen

										qrcode = new QRCode(document.getElementById(arrCita[i].qrentrega), {
											text: textQREntrega, //ESTE ES EL TEXTO SE CONVERTIRA EL EL CODIGO QR 
											width: "110",
											height: "110",
											colorDark: "#000000",
											colorLight: "#ffffff",
											correctLevel: QRCode.CorrectLevel.H
										});
										// console.log("textQREntrega", textQREntrega)
									}

									for (var i = 0; i < arrQrBultos.length; i++) {
										// var textQRBulto = arrQrBultos[i].ordencompras + "|" + arrQrBultos[i].dimensionbulto+"|"+arrQrBultos[i].entrega + "|" + arrQrBultos[i].pesobulto + "|" +
										// 	arrQrBultos[i].cantidad + "|" + arrQrBultos[i].ecri;
										var textQRBulto = arrQrBultos[i].bulto + "|" + arrQrBultos[i].entrega;
										qrcode = new QRCode(document.getElementById(arrQrBultos[i].qrBultos), {
											text: textQRBulto, //ESTE ES EL TEXTO SE CONVERTIRA EL EL CODIGO QR 
											width: "80",
											height: "80",
											colorDark: "#000000",
											colorLight: "#ffffff",
											correctLevel: QRCode.CorrectLevel.H
										});
										// console.log("textQRBulto", textQRBulto)
									}
								}
								
								
							}
						}
						
					});
					
					
					
					// }
					//-------------------------------------------------------------------------------
				},
				error: function (e) {
					// sap.m.MessageBox.alert("Error al grabar cita en scp");
					BusyIndicator.hide();
				}
			});
			
			
		},
		ordenarEntrega:function(entrega){
			console.log(entrega)
			entrega.sort(function(a, b){
			    return a.entrega - b.entrega;
			});
			
			for(var i=0;i<entrega.length;i++){
				entrega[i].ArrayGeneral.sort(function(a, b){
				    return a.DescripcionGeneral - b.DescripcionGeneral;
				});
			}
			
			return entrega;
		},
	
		sendDocMatOnbase: function (cita) {
			var that = this;
			var lista = [];
			that.materiales.forEach(function (value, index) {
				if (!Utilities.isEmpty(value.file)) {
					// value.fechaVencimiento = new Date(value.fechaVencimiento + "T10:20:30Z");
					// value.fechaVencimiento = Utilities.obtenerGetTime(value.fechaVencimiento);
					var materialesvalidacion=that.validateListaMat(that.materiales);
					if(Object.keys(materialesvalidacion).length>0){
						
					}else{
						
					}
					lista.push(value);
				}
			});

			if (lista.length === 0) {
				that.sendDocPersonaOnbase(cita);

			} else {
				that.sendOnBaseAttachmentFileMat(lista, cita);
			}

		},
		sendOnBaseAttachmentFileMat: function (lista, cita) {
			var that = this;
			var count = 1;
			lista.forEach(function (value, index) {

				if (Utilities.isEmpty(value.fechaVencimiento)) {
					var now = new Date();
					now = now.slice(0, 10);
					value.fechaVencimiento = Utilities.formatDateX2(now);
				}

				jQuery.ajax({
					url: "/ONBASE/RESTDocsOnbase.svc/Connect",
					"headers": {
						"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
						"cache-control": "no-cache"
					},
					type: "GET",
					crossDomain: true,
					success: function (data) {
						var dataDisconect = {
							SessionID: data.SessionID
						};

						var auxiliar = {
							"SessionID": dataDisconect.SessionID,
							"Document": {
								"OBDocName": value.file.filename,
								"OBDocExtension": "pdf",
								"FileTypeID": "16",
								"OBDocumentTypeName": "Entrega - Documentos Numero de Identificacion",
								"Comment": "Esto es un documento PDF",
								"OBDocBase64": value.file.encode,
								"Keywords": [{
									"KeywordName": "ID Documento",
									"KeywordValue": value.idDoc
								}, {
									"KeywordName": "Fecha Fin Vigencia",
									"KeywordValue": value.fechaVencimiento
								}]

							}
						};

						jQuery.ajax({
							url: "/ONBASE/RESTDocsOnbase.svc/UploadDocument",
							"headers": {
								"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
								"content-type": "application/json",
								"cache-control": "no-cache"
							},
							type: "POST",
							data: JSON.stringify(auxiliar),
							crossDomain: true,
							processData: false,
							success: function (dataDisconnect) {
								console.log(dataDisconnect);
								jQuery.ajax({
									url: "/ONBASE/RESTDocsOnbase.svc/Disconnect",
									"headers": {
										"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
										"content-type": "application/json",
										"cache-control": "no-cache"
									},
									type: "POST",
									data: JSON.stringify(dataDisconect),
									crossDomain: true,
									processData: false,
									success: function (dataDisconnect) {
										console.log(dataDisconnect);

										if (lista.length == count) {

											that.sendDocPersonaOnbase(cita);
										} else {
											count++;
										}
									},
									error: function (abc, xyz) {
										//	that.getView().setBusy(false);
										sap.ui.core.BusyIndicator.hide();
										MessageBox.error("Ocurrio un error al realizar desconexion para materiales");
										//alert("Ocurrio un error al obtener la sesion")
									}
								});

							},
							error: function (abc, xyz) {
								//	that.getView().setBusy(false);
								sap.ui.core.BusyIndicator.hide();
								MessageBox.error("Ocurrio un error al cargar materiales");
								//alert("Ocurrio un error al obtener la sesion")
							}
						});

					},
					error: function (abc, xyz) {
						//	that.getView().setBusy(false);
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error("Ocurrio un error al realizar conexion para materiales");
						//alert("Ocurrio un error al obtener la sesion")
					}
				});

			});

		},
		sendDocPersonaOnbase: function (cita) {
			var that = this;
			var lista = [];
			that.listaProvPersona.forEach(function (value, index) {
				if (!Utilities.isEmpty(value.file)) {
					// value.fechaVencimiento = new Date(value.fechaVencimiento + "T10:20:30");
					lista.push(value);
				}
			});

			if (lista.length === 0) {
				that.sendDocVehiculoOnbase(cita);
			} else {
				that.sendOnBaseAttachmentFilePersona(lista, cita);
			}

		},
		sendOnBaseAttachmentFilePersona: function (lista, cita) {
			var that = this;
			var count = 1;
			lista.forEach(function (value, index) {

				if (Utilities.isEmpty(value.fechaVencimiento)) {
					var now = new Date();
					now = now.slice(0, 10);
					value.fechaVencimiento = Utilities.formatDateX2(now);
				}

				jQuery.ajax({
					url: "/ONBASE/RESTDocsOnbase.svc/Connect",
					"headers": {
						"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
						"cache-control": "no-cache"
					},
					type: "GET",
					crossDomain: true,
					success: function (data) {
						var dataDisconect = {
							SessionID: data.SessionID
						};

						var auxiliar = {
							"SessionID": dataDisconect.SessionID,
							"Document": {
								"OBDocName": value.file.filename,
								"OBDocExtension": "pdf",
								"FileTypeID": "16",
								"OBDocumentTypeName": "Entrega - Documentos Numero de Identificacion",
								"Comment": "Esto es un documento PDF",
								"OBDocBase64": value.file.encode,
								"Keywords": [{
									"KeywordName": "ID Documento",
									"KeywordValue": value.idDoc
								}, {
									"KeywordName": "Fecha Fin Vigencia",
									"KeywordValue": value.fechaVencimiento
								}, {
									"KeywordName": "Numero Identificacion",
									"KeywordValue": value.dni
								}]

							}
						};

						jQuery.ajax({
							url: "/ONBASE/RESTDocsOnbase.svc/UploadDocument",
							"headers": {
								"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
								"content-type": "application/json",
								"cache-control": "no-cache"
							},
							type: "POST",
							data: JSON.stringify(auxiliar),
							crossDomain: true,
							processData: false,
							success: function (dataDisconnect) {
								console.log(dataDisconnect);
								jQuery.ajax({
									url: "/ONBASE/RESTDocsOnbase.svc/Disconnect",
									"headers": {
										"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
										"content-type": "application/json",
										"cache-control": "no-cache"
									},
									type: "POST",
									data: JSON.stringify(dataDisconect),
									crossDomain: true,
									processData: false,
									success: function (dataDisconnect) {
										console.log(dataDisconnect);

										if (lista.length == count) {

											that.sendDocVehiculoOnbase(cita);
										} else {
											count++;
										}
									},
									error: function (abc, xyz) {
										//	that.getView().setBusy(false);
										sap.ui.core.BusyIndicator.hide();
										MessageBox.error("Ocurrio un error al realizar desconexion para personas");
										//alert("Ocurrio un error al obtener la sesion")
									}
								});

							},
							error: function (abc, xyz) {
								//	that.getView().setBusy(false);
								sap.ui.core.BusyIndicator.hide();
								MessageBox.error("Ocurrio un error al realizar upload para personas");
								//alert("Ocurrio un error al obtener la sesion")
							}
						});

					},
					error: function (abc, xyz) {
						//	that.getView().setBusy(false);
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error("Ocurrio un error al realizar conexion para personas");
						//alert("Ocurrio un error al obtener la sesion")
					}
				});

			});

		},
		sendDocVehiculoOnbase: function (cita) {
			var that = this;
			var lista = [];
			that.listaProvVehiculo.forEach(function (value, index) {
				if (!Utilities.isEmpty(value.file)) {
					// value.fechaVencimiento = new Date(value.fechaVencimiento + "T10:20:30");
					lista.push(value);
				}
			});

			if (lista.length === 0) {
				that.saveGuia(that.entregaGuiaSelected, cita, that);

			} else {
				that.sendOnBaseAttachmentFileVehiculo(lista, cita);
			}

		},
		sendOnBaseAttachmentFileVehiculo: function (lista, cita) {
			var that = this;
			var count = 1;
			lista.forEach(function (value, index) {
				
				if(Utilities.isEmpty(value.fechaVencimiento)){
					var now  = new Date();
					now = now.slice(0, 10);
					value.fechaVencimiento = Utilities.formatDateX2(now);                   
				}
				
				jQuery.ajax({
					url: "/ONBASE/RESTDocsOnbase.svc/Connect",
					"headers": {
						"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
						"cache-control": "no-cache"
					},
					type: "GET",
					crossDomain: true,
					success: function (data) {
						var dataDisconect = {
							SessionID: data.SessionID
						};

						var auxiliar = {
							"SessionID": dataDisconect.SessionID,
							"Document": {
								"OBDocName": value.file.filename,
								"OBDocExtension": "pdf",
								"FileTypeID": "16",
								"OBDocumentTypeName": "Entrega - Documentos Numero de Identificacion",
								"Comment": "Esto es un documento PDF",
								"OBDocBase64": value.file.encode,
								"Keywords": [{
									"KeywordName": "ID Documento",
									"KeywordValue": value.idDoc
								}, {
									"KeywordName": "Fecha Fin Vigencia",
									"KeywordValue": value.fechaVencimiento
								}, {
									"KeywordName": "Numero Identificacion",
									"KeywordValue": value.placa
								}]

							}
						};

						jQuery.ajax({
							url: "/ONBASE/RESTDocsOnbase.svc/UploadDocument",
							"headers": {
								"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
								"content-type": "application/json",
								"cache-control": "no-cache"
							},
							type: "POST",
							data: JSON.stringify(auxiliar),
							crossDomain: true,
							processData: false,
							success: function (dataDisconnect) {
								console.log(dataDisconnect);
								jQuery.ajax({
									url: "/ONBASE/RESTDocsOnbase.svc/Disconnect",
									"headers": {
										"authorization": "Basic dXNyX3NjcDpBZ29zdG9fMjAyMA==",
										"content-type": "application/json",
										"cache-control": "no-cache"
									},
									type: "POST",
									data: JSON.stringify(dataDisconect),
									crossDomain: true,
									processData: false,
									success: function (dataDisconnect) {
										console.log(dataDisconnect);

										if (lista.length == count) {

											that.saveGuia(that.entregaGuiaSelected, cita, that);
										} else {
											count++;
										}
									},
									error: function (abc, xyz) {
										//	that.getView().setBusy(false);
										sap.ui.core.BusyIndicator.hide();
										MessageBox.error("Ocurrio un error al realizar desconexion para vehiculos");
										//alert("Ocurrio un error al obtener la sesion")
									}
								});

							},
							error: function (abc, xyz) {
								//	that.getView().setBusy(false);
								sap.ui.core.BusyIndicator.hide();
								MessageBox.error("Ocurrio un error al realizar upload para vehiculos");
								//alert("Ocurrio un error al obtener la sesion")
							}
						});

					},
					error: function (abc, xyz) {
						//	that.getView().setBusy(false);
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error("Ocurrio un error al realizar desconexion para vehiculos");
						//alert("Ocurrio un error al obtener la sesion")
					}
				});

			});

		},
		
		
		CancelarDocQr: function () {
			var that = this;
			that.byId("DialogFormatQR").close();
		},
	
		InputFecVencPer: function (oEvent) {
			var that = this;
			var oView = that.getView();

			var context = oEvent.getSource().getBindingContext();
			var fechaVenc = oEvent.mParameters.newValue;
			var path = context.getPath();
			that.indexPP = (path.substring(23, path.length)) * 1;
			that.obj = context.getObject(path);

			that.listaProvPersona.forEach(function (value, index) {
				if (index === that.indexPP) {
					value.fechaVencimiento = fechaVenc;
				}
			});
			var obj = {
				recipient: {
					materiales: that.materiales,
					provedorPer: that.listaProvPersona,
					provedorVeh: that.listaProvVehiculo
				}
			};
			var oModelMat = new JSONModel(obj);
			that.byId("DialogMant").setModel(oModelMat);

		},
		InputFecVencVeh: function (oEvent) {
			var that = this;
			var oView = that.getView();

			var context = oEvent.getSource().getBindingContext();
			var fechaVenc = oEvent.mParameters.newValue;
			var path = context.getPath();
			that.indexPV = (path.substring(23, path.length)) * 1;
			that.obj = context.getObject(path);

			that.listaProvVehiculo.forEach(function (value, index) {
				if (index === that.indexPV) {
					value.fechaVencimiento = fechaVenc;
				}
			});
			var obj = {
				recipient: {
					materiales: that.materiales,
					provedorPer: that.listaProvPersona,
					provedorVeh: that.listaProvVehiculo
				}
			};
			var oModelMat = new JSONModel(obj);
			that.byId("DialogMant").setModel(oModelMat);

		},
	
		handlePdf: function () {
			// var tabledata = oTable.getModel().getData();
			var lista = [{
				Zanzpk: "00001",
				Zbezei: "P",
				Zbolnr: "1",
				Zbreit: "2.000",
				ZbrgewB: "70.000",
				ZbrgewM: "20.000",
				Zbtgew: "50.000",
				Zcita: "1000000002",
				ZcitaF: "",
				Zdireccion: "",
				Zdni: "45698789",
				Zebeln: "3100027277",
				Zecri: "IRREGULAR",
				Zgewei: "KG",
				Zgort: "BVN - Lima",
				Zhoehe: "3.000",
				Zlaeng: "1.000",
				Zlfdat: "/Date(1598400000000)/",
				Zlfuhr: "PT11H00M00S",
				Zmaktx: "GUIDING RING 086750882 RESEMIN",
				Zmatnr: "2000020972",
				Zobservacion: "OBSERVACION 1",
				Zplaca: "123-HGY",
				Zseqnr: "000001",
				ZsmtpAddr: "",
				Zvbeln: "180128033",
				ZvbelnF: "",
				Zvegr2: "PAL",
				Zvemng: "2.000",
				ZvhilmKu: "1",
				Zwerks: "1000",
				ZzlugEnt: "",
				Zzona: "A"
			}, {
				Zanzpk: "00001",
				Zbezei: "P",
				Zbolnr: "1",
				Zbreit: "2.000",
				ZbrgewB: "70.000",
				ZbrgewM: "20.000",
				Zbtgew: "50.000",
				Zcita: "1000000002",
				ZcitaF: "",
				Zdireccion: "",
				Zdni: "45698789",
				Zebeln: "3100027277",
				Zecri: "IRREGULAR",
				Zgewei: "KG",
				Zgort: "BVN - Lima",
				Zhoehe: "3.000",
				Zlaeng: "1.000",
				Zlfdat: "/Date(1598400000000)/",
				Zlfuhr: "PT11H00M00S",
				Zmaktx: "GUIDING RING 086750882 RESEMIN",
				Zmatnr: "2000020972",
				Zobservacion: "OBSERVACION 1",
				Zplaca: "123-HGY",
				Zseqnr: "000001",
				ZsmtpAddr: "",
				Zvbeln: "180128034",
				ZvbelnF: "",
				Zvegr2: "PAL",
				Zvemng: "2.000",
				ZvhilmKu: "1",
				Zwerks: "1000",
				ZzlugEnt: "",
				Zzona: "A"
			}];
			this.JSONToPDFConvertor(lista);
		},
		JSONToPDFConvertor: function (JSONData) {

			var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
			var columns = new Array;
			for (var index in arrData[0]) {
				//Now convert each value to string and comma-seprated
				columns.push(index);
			}
			var rows = new Array;
			console.log(arrData);
			for (var i = 0; i < arrData.length; i++) {
				rows[i] = new Array;

				for (var j = 0; j < arrData.length;) {

					for (var index in arrData[0]) {

						rows[i][j] = arrData[i][index];
						j++;
					}
				}
			}
			if (columns.length < 4) {
				var doc = new jsPDF('p', 'pt');
			} else {
				var doc = new jsPDF('l', 'pt');
			}
			doc.autoTable(columns, rows);

			doc.save('table.pdf');

		},
	
		onTest: function () {
			var that = this;
			var oView = that.getView();
			var table = oView.byId("table");
			var indexes = table.clearSelection();
		},
		onPdfFormat: function (Data,logo,arrtext) {
			var that = this;
			var oView = that.getView();
			var ModeloProyect = oView.getModel("Proyect");
			var VBoxPrincipalCita = new sap.m.VBox({width: "720px"})
			// VBoxPrincipalCita.addStyleClass("VBoxPrincipal sapUiSmallMargin sapUiSizeCompact")
			VBoxPrincipalCita.addStyleClass("VBoxPrincipal sapUiSizeCompact")
			var VBoxPrincipalCita2 = new sap.m.VBox({})
			// var imgCita = new sap.m.Image({
			// 	src: logo,
			// 	height: "70px",
			// 	width: "200px"
			// })
			var hCita = document.createElement("h4")
			hCita.textContent = "Resumen Solicitar Cita de Cita";
			var hcita2 = '<h4 style="text-align: center;"> Resumen Solicitar Cita de Cita </h4>'
			var titleCita = new sap.ui.core.HTML({});
			// titleCita.setContent(hCita.outerHTML);
			titleCita.setContent(hcita2);

			var hboxTitleCita = new sap.m.HBox({
				alignItems: "Center"
			})
			var vboxTitleimgCita = new sap.m.HBox({
				width: "36.5%"
			})
			var vboxTitletitleCita = new sap.m.HBox({})

			// vboxTitleimgCita.addItem(imgCita)
			vboxTitletitleCita.addItem(titleCita)
			hboxTitleCita.addItem(vboxTitleimgCita)
			hboxTitleCita.addItem(vboxTitletitleCita)

			VBoxPrincipalCita2.addItem(hboxTitleCita);

			var VBoxQRTotal = new sap.m.VBox({
				width: "100%",
				alignItems: "Center"
			})
			// var qrCitaTotal = new sap.m.HBox({})
			var qrCitaTotal2 = '<div style="text-align: center;"></div>'
			var qrCitaTotal2Html = new sap.ui.core.HTML({});
			qrCitaTotal2Html.setContent(qrCitaTotal2);
			
			var idCitaTotal = Data.ArrayGeneral[0].cita;
			var titlqQrCitaTotal = new sap.m.Label({
				text: "N° Cita: " + idCitaTotal,
				design: "Bold"
			});
			var titlqQrCitaTotal2 = '<h4 style="text-align: center;"> N° Cita: '+ idCitaTotal +' </h4>'
			
			var titlqQrCitaTotalHtml = new sap.ui.core.HTML({});
			// titlqQrCitaTotal.addStyleClass("sapUiTinyMarginTop")
			// titlqQrCitaTotal.addStyleClass("sapUiTinyMarginTop")
			titlqQrCitaTotalHtml.setContent(titlqQrCitaTotal2);

			// VBoxQRTotal.addItem(titlqQrCitaTotal)
			VBoxQRTotal.addItem(titlqQrCitaTotalHtml)
			// VBoxQRTotal.addItem(qrCitaTotal)
			VBoxQRTotal.addItem(qrCitaTotal2Html)
			VBoxPrincipalCita2.addItem(VBoxQRTotal)

			var resumen = new sap.m.Title({
				text: "Resumen de Entregas: ",
				level: "H4"
			});
			// resumen.addStyleClass("sapUiTinyMarginBottom")
			VBoxPrincipalCita2.addItem(resumen)
			
			// ModeloProyect.setProperty("/DataqrCitaTotal", qrCitaTotal.getId());
			ModeloProyect.setProperty("/DataqrCitaTotal", qrCitaTotal2Html.getId());
			
			var arrCitaTotal = [];
			for (var i = 0; i < Data.ArrayGeneral.length; i++) {
				var numEntregaCita = new sap.m.Label({
					text: "ENTREGA NRO: " + Data.ArrayGeneral[i].entrega,
					design: "Bold"
				})
				var entregaCita=new sap.m.VBox({})
				// entregaCita.addStyleClass("entregaClase")
				// VBoxPrincipalCita2.addItem(numEntregaCita);
				entregaCita.addItem(numEntregaCita);

				var destinoCita = Data.ArrayGeneral[i].destino;
				var numeroEntregaCita = Data.ArrayGeneral[i].guia;
				var numBultosCita = Data.ArrayGeneral[i].numeroTotalBultos;
				//campos nuevos
				var almacenCita= Data.ArrayGeneral[i].almacen;
				var cantidadEmbalajeCita= Data.ArrayGeneral[i].cantidadEmbalaje;
				//
				var idCitaCita = Data.ArrayGeneral[i].cita;
				var condEntregaCita = Data.ArrayGeneral[i].condEnt;
				var direccionCita = Data.ArrayGeneral[i].direccion;
				var fechaCita = Data.ArrayGeneral[i].fecha;
				var horaCita = Data.ArrayGeneral[i].hora;
				var zonaCita = Data.ArrayGeneral[i].zona;
				var pesototalbultosCita = Data.ArrayGeneral[i].pesoTotBultos;
				var qrEntregaCita = new sap.m.HBox({})
				var tableEntregaCita = new sap.ui.core.HTML({});
				
				//
				var htmltablaCita = '<table align="center" style="border: 1px solid black;' +
					'border-collapse: collapse;width:100%; ">' +
					'<caption height="18px" style="border: 1px solid black;">RESUMEN DE DISTRIBUCIÓN DE DESTINOS</caption>' +
						'<thead>' +
							'<tr>' +
								'<td height="18px" style="border:1px solid black;border-collapse:collapse;" width="18%">Destino </td>' +
								'<td height="18px" style="border:1px solid black;border-collapse:collapse;" width="24%">Guía de Entrega</td>' +
								'<td height="18px" style="border:1px solid black;border-collapse:collapse;" colspan="2" width="41%">Cantidad de Embalaje</td>' +
								'<td height="18px" style="border:1px solid black;border-collapse:collapse;" width="17%">QR Pre entrega</td>' +
							'</tr>' +
					'</thead>' +
					'<tbody>' +
						'<tr>' +
							'<td height="18px" style="border:1px solid black;border-collapse:collapse;" width="18%">' +
								destinoCita +
							'</td>' +
							'<td height="18px" style="border:1px solid black;border-collapse:collapse;" width="24%">' +
								numeroEntregaCita +
							'</td>' +
							'<td height="18px" style="border:1px solid black;border-collapse:collapse;" colspan="2" width="41%">' +
								// numBultosCita + -->comentado cambios 22/10/2020
								cantidadEmbalajeCita+
							'</td>' +
							'<td height="108px" style="border:1px solid black;border-collapse:collapse;" rowspan = "6" width="17%">' +
								'<div id="' + qrEntregaCita.getId() +
								'" style="display: block;margin-left: auto;margin-right: auto"></div>' +
							'</td>' +
						'</tr>' +
						'<tr>' +
							'<td height="18px" style="border:1px solid black;border-collapse:collapse;" width="18%">Almacén</td>'+
							'<td height="18px" style="border:1px solid black;border-collapse:collapse;" width="24%">'+
								almacenCita+
							'<td height="18px" style="border:1px solid black;border-collapse:collapse;" width="10%">Cond.Entrega</td>' +
							'<td height="18px" style="border:1px solid black;border-collapse:collapse;" width="30%">' +
								condEntregaCita +
							'</td>' +
						'</tr>' +
						'<tr>' +
							'<td height="36px" style="border:1px solid black;border-collapse:collapse;" colspan="1" rowspan = "2" width="18%">Dirección</td>' +
							'<td height="36px" style="border:1px solid black;border-collapse:collapse;" colspan="3" rowspan = "2">' +
								direccionCita +
							'</td>' +
						'</tr>' +
						'<tr>' +
						// '<td style="border:1px solid black;border-collapse:collapse;"></td>' +
						// '<td style="border:1px solid black;border-collapse:collapse;" colspan="2">' +
						// fecha +
						// '</td>' +
						'</tr>' +
						'<tr>' +
							'<td height="18px" style="border:1px solid black;border-collapse:collapse;" width="18%">Fecha Cita</td>' +
							'<td height="18px" style="border:1px solid black;border-collapse:collapse;" width="24%">Hora Atención</td>' +
							'<td height="18px" style="border:1px solid black;border-collapse:collapse;" colspan="2" width="41%">Peso Total(Kg)</td>' +
						'</tr>' +
						'<tr>' +
							'<td height="18px" style="border:1px solid black;border-collapse:collapse;" width="18%">' +
								fechaCita +
							'</td>' +
							'<td height="18px" style="border:1px solid black;border-collapse:collapse;" width="24%">' +
								horaCita +
							'</td>' +
							'<td height="18px" style="border:1px solid black;border-collapse:collapse;" colspan="2" width="41%">' +
								pesototalbultosCita +
							'</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>';

				tableEntregaCita.setContent(htmltablaCita)
				entregaCita.addItem(tableEntregaCita)
				VBoxPrincipalCita2.addItem(entregaCita)

				var objqrCitaTotal = {
					qrentrega: qrEntregaCita.getId(),
					cita: Data.ArrayGeneral[i].cita,
					entrega: Data.ArrayGeneral[i].entrega,
					arrtext: arrtext,
					almacen: almacenCita,
					placa: Data.ArrayGeneral[i].placa,
					fecha: Data.ArrayGeneral[i].fecha,
					hora: Data.ArrayGeneral[i].hora,
					destino: Data.ArrayGeneral[i].destino,
					nbultos: numBultosCita.toString(),
					condEnt: Data.ArrayGeneral[i].condEnt,
					direccion: Data.ArrayGeneral[i].direccion,
					pesoTotBultos: Data.ArrayGeneral[i].pesoTotBultos,
					zona: Data.ArrayGeneral[i].zona
				}
				arrCitaTotal.push(objqrCitaTotal)
				ModeloProyect.setProperty("/DataarrCitaTotal", arrCitaTotal);
			}
			VBoxPrincipalCita.addItem(VBoxPrincipalCita2)
			oView.byId("total").addItem(VBoxPrincipalCita)

			var arrCita = [];
			var arrQrBultos = [];
			// var columHeader=[];
			for (var i = 0; i < Data.ArrayGeneral.length; i++) {
				var h4 = document.createElement("h4")
				h4.textContent = "ENTREGA NRO " + Data.ArrayGeneral[i].entrega;
				
				var logo1;
				switch(Data.ArrayGeneral[i].sociedad){
					case "1000" :logo1="/sap/fiori/registroentrega/webapp/images/sociedad_1000.png";break;
					case "1100" :logo1="/sap/fiori/registroentrega/webapp/images/sociedad_1100.png";break;
					case "1200" :logo1="/sap/fiori/registroentrega/webapp/images/sociedad_1200.png";break;
					case "1300" :logo1="/sap/fiori/registroentrega/webapp/images/sociedad_1300.png";break;
					case "1400" :logo1="/sap/fiori/registroentrega/webapp/images/sociedad_1400.png";break;
					case "2100" :logo1="/sap/fiori/registroentrega/webapp/images/sociedad_2100.png";break;
					case "7000" :logo1="/sap/fiori/registroentrega/webapp/images/sociedad_7000.png";break;
					case "7100" :logo1="/sap/fiori/registroentrega/webapp/images/sociedad_7100.png";break;
					case "8000" :logo1="/sap/fiori/registroentrega/webapp/images/sociedad_8000.png";break;
				};
				
				var h42 = '<h4 style="text-align: center;"> ENTREGA NRO '+ Data.ArrayGeneral[i].entrega +' </h4>'
				var tablatitulo = '<table width="100%" style="">' +
					'<thead>' +
						'<tr>' +
							'<td style="" width="28%">'+
								'<img src="'+logo1+'" style="float: left;" width="150px" height= "70px" >'+
							'</td>' +
							'<td style="" width="50%"><strong>ENTREGA NRO ' +
								Data.ArrayGeneral[i].entrega+
								'</strong>'+
							'</td>' +
					'	</tr>' +
					'</thead>' +
				'</table>'
				var tablatituloHtml = new sap.ui.core.HTML({});
				tablatituloHtml.setContent(tablatitulo)

				var tituloProveedor = '<p style="border: 1px solid black;border-collapse: collapse;" >Proveedor : <strong>' +
					Data.ArrayGeneral[i].proveedor +
					'</strong></p>'

				var destino = Data.ArrayGeneral[i].destino;
				var sociedad = Data.ArrayGeneral[i].sociedad;
				var numeroEntrega = Data.ArrayGeneral[i].guia;
				var numBultos = Data.ArrayGeneral[i].numeroTotalBultos;
				//campos nuevos
				var almacen= Data.ArrayGeneral[i].almacen;
				var cantidadEmbalaje= Data.ArrayGeneral[i].cantidadEmbalaje;
				//
				var idCita = Data.ArrayGeneral[i].cita;
				var condEntrega = Data.ArrayGeneral[i].condEnt;
				var direccion = Data.ArrayGeneral[i].direccion;
				var fecha = Data.ArrayGeneral[i].fecha;
				var hora = Data.ArrayGeneral[i].hora;
				var zona = Data.ArrayGeneral[i].zona;
				var pesototalbultos = Data.ArrayGeneral[i].pesoTotBultos;
				var qrEntrega = new sap.m.HBox({})
					
				var htmltabla = '<table align="center" style="border: 1px solid black;' +
					'border-collapse: collapse;width:100%; ">' +
					'<caption height="18px" style="border: 1px solid black;">RESUMEN DE DISTRIBUCIÓN DE DESTINOS</caption>' +
					'<thead>' +
						'<tr>' +
							'<td height="18px" style="border:1px solid black;border-collapse:collapse;" width="18%">Destino </td>' +
							'<td height="18px" style="border:1px solid black;border-collapse:collapse;" width="24%">Guía de Entrega</td>' +
							'<td height="18px" style="border:1px solid black;border-collapse:collapse;" colspan="2" width="41%">Cantidad de Embalaje</td>' +
							'<td height="18px" style="border:1px solid black;border-collapse:collapse;" width="17%">QR Pre entrega</td>' +
						'</tr>' +
					'</thead>' +
					'<tbody>' +
						'<tr>' +
							'<td height="18px" style="border:1px solid black;border-collapse:collapse;" width="18%">' +
								destino +
							'</td>' +
							'<td height="18px" style="border:1px solid black;border-collapse:collapse;" width="24%">' +
								numeroEntrega +
							'</td>' +
							'<td height="18px" style="border:1px solid black;border-collapse:collapse;" colspan="2" width="41%">' +
							// numBultos +-->comentado mejora 22/10/2020
								cantidadEmbalaje+
							'</td>' +
							'<td height="108px" style="border:1px solid black;border-collapse:collapse;" rowspan = "6" width="17%">' +
								'<div id="' + qrEntrega.getId() +
								'" style="display: block;margin-left: auto;margin-right: auto"></div>' +
							'</td>' +
						'</tr>' +
						'<tr>' +
							'<td height="18px" style="border:1px solid black;border-collapse:collapse;" width="18%">Almacén</td>'+
							'<td height="18px" style="border:1px solid black;border-collapse:collapse;" width="24%">'+
								almacen+
							'<td height="18px" style="border:1px solid black;border-collapse:collapse;" width="10%">Cond.Entrega</td>' +
							'<td height="18px" style="border:1px solid black;border-collapse:collapse;" width="30%">' +
								condEntrega +
							'</td>' +
						'</tr>' +
						'<tr>' +
							'<td height="36px" style="border:1px solid black;border-collapse:collapse;" colspan="1" rowspan = "2" width="18%">Dirección</td>' +
							'<td height="36px" style="border:1px solid black;border-collapse:collapse;" colspan="3" rowspan = "2">' +
								direccion +
							'</td>' +
						'</tr>' +
						'<tr>' +
						// '<td style="border:1px solid black;border-collapse:collapse;"></td>' +
						// '<td style="border:1px solid black;border-collapse:collapse;" colspan="2">' +
						// fecha +
						// '</td>' +
						'</tr>' +
						'<tr>' +
							'<td height="18px" style="border:1px solid black;border-collapse:collapse;" width="18%">Fecha Cita</td>' +
							'<td height="18px" style="border:1px solid black;border-collapse:collapse;" width="24%">Hora Atención</td>' +
							'<td height="18px" style="border:1px solid black;border-collapse:collapse;" colspan="2" width="41%">Peso Total(Kg)</td>' +
						'</tr>' +
						'<tr>' +
							'<td height="18px" style="border:1px solid black;border-collapse:collapse;" width="18%">' +
								fecha +
							'</td>' +
							'<td height="18px" style="border:1px solid black;border-collapse:collapse;" width="24%">' +
								hora +
							'</td>' +
							'<td height="18px" style="border:1px solid black;border-collapse:collapse;" colspan="2" width="41%">' +
								pesototalbultos +
							'</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>';
				var VBoxPrincipal = new sap.m.VBox({
					width: "720px"
				})
				var VBoxPrincipal2 = new sap.m.VBox({})
				var hboxTitle = new sap.m.HBox({
					alignItems: "Center"
				})
				var vboxTitleimg = new sap.m.HBox({
					width: "36.5%"
				})
				
				// var logo1;
								
				// switch(sociedad){
				// 	case "1000" :logo1="/webapp/images/sociedad_1000.png";break;
				// 	case "1100" :logo1="/webapp/images/sociedad_1100.png";break;
				// 	case "1200" :logo1="/webapp/images/sociedad_1200.png";break;
				// 	case "1300" :logo1="/webapp/images/sociedad_1300.png";break;
				// 	case "1400" :logo1="/webapp/images/sociedad_1400.png";break;
				// 	case "2100" :logo1="/webapp/images/sociedad_2100.png";break;
				// 	case "7000" :logo1="/webapp/images/sociedad_7000.png";break;
				// 	case "7100" :logo1="/webapp/images/sociedad_7100.png";break;
				// 	case "8000" :logo1="/webapp/images/sociedad_8000.png";break;
				// };
				
				var img = new sap.m.Image({
					src: logo1,
					height: "70px",
					width: "200px"
				})
				var vboxTitletitle = new sap.m.HBox({})
				var vboxTitleProveedor = new sap.m.HBox({
					alignItems: "Center"
				})
				// var qrCita = new sap.m.HBox({})

				var title = new sap.ui.core.HTML({});
				var titleProvedor = new sap.ui.core.HTML({});
				var titleProvedorNombre = new sap.ui.core.HTML({});
				var tableEntrega = new sap.ui.core.HTML({});

				VBoxPrincipal.addStyleClass("VBoxPrincipal sapUiSizeCompact")
				// VBoxPrincipal2.addItem(hboxTitle)
				VBoxPrincipal2.addItem(tablatituloHtml)
				// hboxTitle.addItem(vboxTitleimg)
				// hboxTitle.addItem(vboxTitletitle)
				// vboxTitleimg.addItem(img)
				vboxTitletitle.addItem(title)
				VBoxPrincipal2.addItem(titleProvedor)

				// title.setContent(h4.outerHTML)
				title.setContent(h42)
				titleProvedor.setContent(tituloProveedor)

				tableEntrega.setContent(htmltabla)

				VBoxPrincipal2.addItem(tableEntrega)

				var objqrCita = {
					// qrcita: qrCita.getId(),
					qrentrega: qrEntrega.getId(),
					cita: Data.ArrayGeneral[i].cita,
					entrega: Data.ArrayGeneral[i].entrega,
					arrtext: arrtext,
					almacen: almacen,
					placa: Data.ArrayGeneral[i].placa,
					fecha: Data.ArrayGeneral[i].fecha,
					hora: Data.ArrayGeneral[i].hora,
					destino: Data.ArrayGeneral[i].destino,
					nbultos: numBultos.toString(),
					condEnt: Data.ArrayGeneral[i].condEnt,
					direccion: Data.ArrayGeneral[i].direccion,
					pesoTotBultos: Data.ArrayGeneral[i].pesoTotBultos,
					zona: Data.ArrayGeneral[i].zona
				}
				arrCita.push(objqrCita)
				ModeloProyect.setProperty("/DataarrCita", arrCita);

				var VBoxBultos = new sap.m.VBox({})

				for (var k = 0; k < Data.ArrayGeneral[i].ArrayGeneral.length; k++) {
					var VBoxBulto = new sap.m.VBox({
						width: "100%"
					})
					var tableBultos = new sap.ui.core.HTML({});
					var qrBultos = new sap.m.HBox({})
					var tableHtmlBultos = '<br><table width="55%" style="border:1px solid black;border-collapse:collapse;">' +
						'<tbody>' +
							'<tr>' +
								'<td height="18px" style="border:1px solid black;border-collapse:collapse;" width="40%">Peso Embalaje(Kg)</td>' +
								'<td height="36px" style="border:1px solid black;border-collapse:collapse;" rowspan="2" width="auto">' +
									'Cantidad ' + 
									// Data.ArrayGeneral[i].ArrayGeneral[k].DescripcionGeneral +
									Data.ArrayGeneral[i].ArrayGeneral[k].CantidadEmbalajeBulto+
								'</td>' +
								'<td height="54px" style="border:1px solid black;border-collapse:collapse;" rowspan = "3" style="text-align: center;" width="23%">' +
									'<div id="' + qrBultos.getId() +
									'" style="display: block;margin-left: auto;margin-right: auto;width: 78%;"></div>' +
								'</td>' +
							'</tr>' +
							'<tr>' +
								'<td height="18px" style="border:1px solid black;border-collapse:collapse;" width="40%">' +
									Data.ArrayGeneral[i].ArrayGeneral[k].PesoBult +
								'</td>' +
							'</tr>' +
							'<tr>' +
								'<td height="18px" style="border:1px solid black;border-collapse:collapse;" width="40%">' +
									Data.ArrayGeneral[i].ArrayGeneral[k].Codigo +
								'</td>' +
								'<td height="18px" style="border:1px solid black;border-collapse:collapse;" rowspan = "2" width="25%">' +
									Data.ArrayGeneral[i].ArrayGeneral[k].Descipcion +
								'</td>' +
							'</tr>' +
						'</tbody>' +
						'</table><br>'
					tableBultos.setContent(tableHtmlBultos)
					VBoxBulto.addItem(tableBultos)
					VBoxBultos.addItem(VBoxBulto)

					var objqrBulto = {
						qrBultos: qrBultos.getId(),
						CantidadEmbalajeBulto:	Data.ArrayGeneral[i].ArrayGeneral[k].CantidadEmbalajeBulto,
						bulto: Data.ArrayGeneral[i].ArrayGeneral[k].DescripcionGeneral,
						dimensionbulto: Data.ArrayGeneral[i].ArrayGeneral[k].Descipcion,
						pesobulto: Data.ArrayGeneral[i].ArrayGeneral[k].PesoBult,
						entrega: Data.ArrayGeneral[i].entrega,
						cantidad: Data.ArrayGeneral[i].ArrayGeneral[k].ArrayGeneral.length.toString(),
						ecri: Data.ArrayGeneral[i].ArrayGeneral[k].Codigo
					}
					arrQrBultos.push(objqrBulto)
					ModeloProyect.setProperty("/DataarrQrBultos", arrQrBultos);
					var VBoxPedidos = new sap.m.VBox({
						width: "100%"
					})
					for (var l = 0; l < Data.ArrayGeneral[i].ArrayGeneral[k].ArrayGeneral.length; l++) {
						var comprador = Data.ArrayGeneral[i].ArrayGeneral[k].ArrayGeneral[l].Proveedor;
						var tablePedidos = new sap.ui.core.HTML({});
						var brhtml = new sap.ui.core.HTML({});
						var br = '<br>'
						var tableHtmlPedidos = '<table width="500px" style="border:1px solid black;border-collapse:collapse;">' +
							'<thead>' +
								'<tr>' +
									'<td style="border:1px solid black;border-collapse:collapse;"><strong>Pedido de compra ' +
										Data.ArrayGeneral[i].ArrayGeneral[k].ArrayGeneral[l].DescripcionGeneral +
									'</strong></td>' +
										// '<td style="border:1px solid black;border-collapse:collapse;"><strong>Comprador</strong></td>' +
								'	<td style="border:1px solid black;border-collapse:collapse;"><strong>' +
										comprador +
									'</strong></td>' +
								'</tr>' +
							'</thead>' +
						'</table>'
						tablePedidos.setContent(tableHtmlPedidos)
						brhtml.setContent(br)
						VBoxPedidos.addItem(tablePedidos)

						var oJsonModel = new sap.ui.model.json.JSONModel();
						oJsonModel.setData({
							results: Data.ArrayGeneral[i].ArrayGeneral[k].ArrayGeneral[l].ArrayGeneral
						});

						// var oTable = new sap.m.Table({
						// 	columns: [
						// 		new sap.m.Column({
						// 			styleClass: "colum",
						// 			width: "5.9rem",
						// 			header: [new sap.m.Label({
						// 				text: "MATERIAL"
						// 			}).addStyleClass('list-label')]
						// 		}),
						// 		new sap.m.Column({
						// 			styleClass: "colum",
						// 			header: [new sap.m.Label({
						// 				text: "DESCRIPCIÓN"
						// 			}).addStyleClass('list-label')]
						// 		}),
						// 		new sap.m.Column({
						// 			styleClass: "colum",
						// 			hAlign: "Right",
						// 			width: "9.6rem",
						// 			header: [new sap.m.Label({
						// 				text: "CANTIDAD PLANIFICADA"
						// 			}).addStyleClass('list-label')]
						// 		}),
						// 		new sap.m.Column({
						// 			styleClass: "colum",
						// 			width: "5.85rem",
						// 			header: [new sap.m.Label({
						// 				text: "UNID MEDIDA"
						// 			}).addStyleClass('list-label')]
						// 		}),
						// 		new sap.m.Column({
						// 			styleClass: "colum",
						// 			width: "5.13rem",
						// 			header: [new sap.m.Label({
						// 				text: "ECRI"
						// 			}).addStyleClass('list-label')]
						// 		})
						// 	],
						// 	items: {
						// 		path: '/results',
						// 		template: new sap.m.ColumnListItem({
						// 			cells: [
						// 				new sap.m.Text({
						// 					text: "{Zmatnr}"
						// 				}).addStyleClass('list-label"'),
						// 				new sap.m.Text({
						// 					text: "{Zmaktx}"
						// 				}).addStyleClass('list-label'),
						// 				new sap.m.Text({
						// 					text: "{parts: [{path: 'Zvemng'}], formatter: '.formatter.quantity'}"
						// 				}).addStyleClass('list-label'),
						// 				new sap.m.Text({
						// 					text: "{Zunmed}"
						// 				}).addStyleClass('list-label'),
						// 				// new sap.m.Text({
						// 				// 	text: "{ZbrgewM}"
						// 				// }).addStyleClass('list-label'),
						// 				new sap.m.Text({
						// 					text: "{Zecri}"
						// 				}).addStyleClass('list-label'),
						// 			]
						// 		})
						// 	}
						// }).addStyleClass("sapUiSizeCompact tableMaterial");
						// oTable.setModel(oJsonModel);
						
						var materiales ="";
						var oTableHTML = new sap.ui.core.HTML({});
						for (var n = 0; n < Data.ArrayGeneral[i].ArrayGeneral[k].ArrayGeneral[l].ArrayGeneral.length; n++) {
							materiales += '<tr>' +
								'<td height="18px" style="border:1px solid black;border-collapse:collapse;" >'+
								Data.ArrayGeneral[i].ArrayGeneral[k].ArrayGeneral[l].ArrayGeneral[n].Zmatnr+
								'</td>' +
								'<td height="18px" style="border:1px solid black;border-collapse:collapse;">'+
								Data.ArrayGeneral[i].ArrayGeneral[k].ArrayGeneral[l].ArrayGeneral[n].Zmaktx+
								'</td>' +
								'<td height="18px" style="border:1px solid black;border-collapse:collapse;">'+
								this.quantity(Data.ArrayGeneral[i].ArrayGeneral[k].ArrayGeneral[l].ArrayGeneral[n].Zvemng)+
								'</td>' +
								'<td height="18px" style="border:1px solid black;border-collapse:collapse;">'+
								Data.ArrayGeneral[i].ArrayGeneral[k].ArrayGeneral[l].ArrayGeneral[n].Zunmed+
								'</td>' +
								'<td height="18px" style="border:1px solid black;border-collapse:collapse;">'+
								Data.ArrayGeneral[i].ArrayGeneral[k].ArrayGeneral[l].ArrayGeneral[n].Zecri+
								'</td>' +
							'</tr>'
						}
						var oTable = '<table width="100%" style="border:1px solid black;border-collapse:collapse;">' +
							'<thead>' +
								'<tr>' +
									'<td style="border:1px solid black;border-collapse:collapse;" width="14%">Material</td>'+
									'<td style="border:1px solid black;border-collapse:collapse;" width="34%">Descripción</td>' +
									'<td style="border:1px solid black;border-collapse:collapse;" width="20%">Cant. Planificada</td>'+
									'<td style="border:1px solid black;border-collapse:collapse;" width="17%">Unid. Medida</td>' +
									'<td style="border:1px solid black;border-collapse:collapse;" width="15%">Ecri</td>'+
								'</tr>' +
							'</thead>' +
							'<tbody>' +
								materiales+
							'</tbody>' +
						'</table>'
							
						oTableHTML.setContent(oTable);
						
						// for(var n=0;n<oTable.getColumns().length;n++){
						// 	var columnId=oTable.getColumns()[n].getId();
						// 	columHeader.push(columnId)
						// }
						// ModeloProyect.setProperty("/DatacolumHeader", columHeader);
						// VBoxPedidos.addItem(oTable)
						VBoxPedidos.addItem(oTableHTML)
						VBoxPedidos.addItem(brhtml)

						VBoxBulto.addItem(VBoxPedidos)
					}

				}
				VBoxPrincipal.addItem(VBoxPrincipal2)
				VBoxPrincipal.addItem(VBoxBultos)
				oView.byId("total").addItem(VBoxPrincipal)
			}

		},
		loadNew: function () {
			var that = this;
			that.onAfterRendering();

		},
	
		simulateServerRequest: function () {
			// simulate a longer running operation
			iTimeoutId = setTimeout(function () {
				this._oBusyDialog.close();
			}.bind(this), 5000);
		},
		onHome: function () {
			var that = this;
			var aplicacion = "#";
			var accion = "";
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			oCrossAppNavigator.toExternal({
				target: {
					semanticObject: aplicacion,
					action: accion
				}
			});
		},
		prueba: function () {
			var oGlobalBusyDialog = new sap.m.BusyDialog();
			oGlobalBusyDialog.open(1);
			var num = "5456.89";
			var resp = Utilities.formaterNumMiles(num);
			alert(resp);
		},
		//Nuevas funciones tarjet 2 Kassiel
		ValidarCamposEntregaTarjet2:function(oEvent){
			var that=this;
			var oView=this.getView();
			var ModeloProyect = oView.getModel("Proyect");
			var condEntrega = ModeloProyect.getProperty("/DataCondEntrega");
			var table = oView.byId("table2");
			var context = oEvent.getParameter("rowContext");
			if(context != null){
				var path = context.sPath;
				var Object = oView.getModel("Proyect").getProperty(path);
			}
			var oIndex = oEvent.getParameter('rowIndex');
			var Selecciones =table.getSelectedIndices();
			var selectedEntries=[];
			for(var i=0; i<Selecciones.length; i++){
				var oData = table.getContextByIndex(Selecciones[i]);
				selectedEntries.push(oData.getProperty(oData.getPath()));
			}
			
			if(Selecciones.length>1){
				this.getView().byId("modificarTarget2").setEnabled(false)
				this.getView().byId("eliminarTarget2").setEnabled(true)
			}else{
				this.getView().byId("modificarTarget2").setEnabled(true)
				this.getView().byId("eliminarTarget2").setEnabled(true)
			}
			// console.log(selectedEntries)
			localStorage.setItem("arrayEntregasTarjet2", JSON.stringify(selectedEntries));
		},
	
		methodDeleteSapCita:function(content){
			var that=this;
			var oView = this.getView();
			sap.ui.core.BusyIndicator.show(0);
				$.ajax({ 
					url:"/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_REGISTRO_ENTRE_SRV",
					type: "GET",
					headers :{"x-CSRF-Token":"Fetch"}
				}).always(function(data , status,response){
						var	token =response.getResponseHeader("x-csrf-token");
						$.ajax({ 
							type		:"POST",
							url			:"/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_REGISTRO_ENTRE_SRV/ZET_ELIMINARSet",
							headers 	:{"x-CSRF-Token":token},
							contentType	:"application/json",
							dataType	:"json",
							data		:JSON.stringify(content)
						}).always(function(data , status,response){
							if(content.ZET_ELIM_DETSet.length>1){
								MessageBox.show(
									"Eliminado con éxito", {
										icon: sap.m.MessageBox.Icon.SUCCESS,
										title: "Mensaje de Éxito",
										actions: ['OK'],
										onClose: function (sActionClicked) {
											that.refreshDataMain();
										}
									}
								);
							}else{
								MessageBox.show(data.d.ZET_ELIM_DETSet.results[0].Msg+data.d.ZET_ELIM_DETSet.results[0].Zcita,{
									icon: sap.m.MessageBox.Icon.SUCCESS,
									title: "Mensaje de Éxito",
									actions: ['OK'],
									onClose: function (sActionClicked) {
										that.refreshDataMain();
									}
								});
							}
						});
				});
			oView.byId("table2").clearSelection();	
			sap.ui.core.BusyIndicator.hide();
		},
		table2Modificar:function(){
			var that = this;
			var ModeloProyect = this.getView().getModel("Proyect");
			var objDeleteSap;
			var arrayEntregasTarjet2 = JSON.parse(localStorage.getItem("arrayEntregasTarjet2"));
			var condEntrega = ModeloProyect.getProperty("/DataCondEntrega");
			
			jQuery.sap.require("jquery.sap.storage");
			that._oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);
			var oView = that.getView();
			var table = oView.byId("table2");
			var indexes = table.getSelectedIndices();
			var lista = [];
			var listaOtros = [];
			var centroConstantes = that.getCentroContantes("MM", "REGISTRO_ENTREGA_PORTAL", "CENTRO");
			
			that.entregaGuiaSelected = [];

			if (indexes.length > 0) {
				var validarVacio = true;
				var validarStatus = false;
				var validarCantGuia = false;
				var validarCentro = false;
				var validarAlmacen = true;
				var validarFecha = true;
				var before_object;
				
				var validar = false ;

				// if (indexes.length < 2) {
					var oDialog = that.byId("DialogConfirmarCentro");
					var obj = table.getContextByIndex(indexes[0]).getObject();
					var valueGuia = obj.Zbolnr;

					that.entregaGuiaSelected.push(obj);
					
				condEntrega.forEach(function(Ce){
					if(Ce === obj.ZZLug_ent){
					validar=true;				
					}
				
				});
				
				if(validar){
					ModeloProyect.setProperty("/ElementosyTablas",false);
					that.materiales=[];
				if(!that.oDialog){
						that.oDialog = sap.ui.xmlfragment(oView.getId(),"com.rava.project.fragment.MantenimientoRoles" , that);
						oView.addDependent(that.oDialog);
				}
				that.oDialog.open();
				sap.ui.core.BusyIndicator.show(0);
				that.validarMaterial = true ;
				var materialesAux	= MethodRepository.getMateriales("M", 1);
				that.getAttachmentMatPestaña2(materialesAux);
					
				}else {
					that.validarMaterial = false ;
					ModeloProyect.setProperty("/ElementosyTablas",true);
					
					if (!oDialog) {
						// load asynchronous XML fragment
						oDialog = sap.ui.xmlfragment(oView.getId(), "com.rava.project.fragment.ConfirmarCentro", that);
						oView.addDependent(oDialog);
						// console.log(oView.byId(elementDireccion).getVisible())
						var oMultiInput1 = oView.byId("multiInput1");
						// oMultiInput1.setValue("");
						var array =[];
						
						if(arrayEntregasTarjet2[0].ZDni !== ""){
						new Token({
							text: arrayEntregasTarjet2[0].ZDni,
							key: arrayEntregasTarjet2[0].ZDni
						})
						array.push(new Token({
							text: arrayEntregasTarjet2[0].ZDni,
							key: arrayEntregasTarjet2[0].ZDni
						}));
						}
						
						if(arrayEntregasTarjet2[0].ZDni2 !== ""){
						
						array.push(new Token({
							text: arrayEntregasTarjet2[0].ZDni2,
							key: arrayEntregasTarjet2[0].ZDni2
						}));
						}
						
						if(arrayEntregasTarjet2[0].ZDni3 !== ""){
					
						array.push(	new Token({
							text: arrayEntregasTarjet2[0].ZDni3,
							key: arrayEntregasTarjet2[0].ZDni3
						}));
						}
						
						if(arrayEntregasTarjet2[0].ZDni4 !== ""){
						
						array.push(new Token({
							text: arrayEntregasTarjet2[0].ZDni4,
							key: arrayEntregasTarjet2[0].ZDni4
						}));
						
						}
						
						
						
						oMultiInput1.setTokens(array);
						var oMultiInput2 = oView.byId("multiInput2");
						oMultiInput2.setTokens(
							[
							new Token({
							text: arrayEntregasTarjet2[0].ZPlaca.replace("-",""),
							key: arrayEntregasTarjet2[0].ZPlaca.replace("-","")
						})	
								]);
						oDialog.open();
						// if(ContadorValidarEntrega == 1){
						// 	that.getView().byId("elementDireccion").setVisible(true)
						// }else{
							that.getView().byId("elementDireccion").setVisible(false)
						// }
					} else {
						var array =[];
						
						if(arrayEntregasTarjet2[0].ZDni !== ""){
						new Token({
							text: arrayEntregasTarjet2[0].ZDni,
							key: arrayEntregasTarjet2[0].ZDni
						})
						array.push(new Token({
							text: arrayEntregasTarjet2[0].ZDni,
							key: arrayEntregasTarjet2[0].ZDni
						}));
						}
						
						if(arrayEntregasTarjet2[0].ZDni2 !== ""){
						
						array.push(new Token({
							text: arrayEntregasTarjet2[0].ZDni2,
							key: arrayEntregasTarjet2[0].ZDni2
						}));
						}
						
						
						if(arrayEntregasTarjet2[0].ZDni3 !== ""){
					
						array.push(	new Token({
							text: arrayEntregasTarjet2[0].ZDni3,
							key: arrayEntregasTarjet2[0].ZDni3
						}));
						}
						
						if(arrayEntregasTarjet2[0].ZDni4 !== ""){
						
						array.push(new Token({
							text: arrayEntregasTarjet2[0].ZDni4,
							key: arrayEntregasTarjet2[0].ZDni4
						}));
						
						}
						
						var oMultiInput1 = oView.byId("multiInput1");
						oMultiInput1.setValue("");
						oMultiInput1.setTokens(array);
						var oMultiInput2 = oView.byId("multiInput2");
						oMultiInput2.setTokens([
							new Token({
							text: arrayEntregasTarjet2[0].ZPlaca.replace("-",""),
							key: arrayEntregasTarjet2[0].ZPlaca.replace("-","")
						})	
								]);
						oDialog.open();
						
						// if(ContadorValidarEntrega == 1){
						// 	that.getView().byId("elementDireccion").setVisible(true)
						// }else{
							that.getView().byId("elementDireccion").setVisible(false)
						// }
					}
					
				}	

				// }

			} else {
				MessageBox.show(
					"Seleccione al menos un registro pendiente", {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						title: "Mensaje",
						actions: ['OK'],
						onClose: function (sActionClicked) {}
					}
				);
				return ;
			}

			var oMultiInput1 = oView.byId("multiInput1");
			var oMultiInput2 = oView.byId("multiInput2");

			oMultiInput1.addValidator(function (args) {
				// if(args.suggestionObject === undefined){
				// 	return;
				// }
				that.dni = args.text;
				//consultar dni
				var dataPersona = MethodRepository.getDataPersonaVehiculo(that.dni);

				if (dataPersona.length > 0) {

					return new Token({
						key: that.dni,
						text: that.dni
					});

					return;

				} else {

					var DialogConfirmarRegistro = that.byId("DialogConfirmarRegistro");
					if (!DialogConfirmarRegistro) {
						// load asynchronous XML fragment
						DialogConfirmarRegistro = sap.ui.xmlfragment(oView.getId(), "com.rava.project.fragment.ConfirmarRegistro",
							that);
						oView.addDependent(DialogConfirmarRegistro);
						DialogConfirmarRegistro.open();
						return;

					} else {
						DialogConfirmarRegistro.open();
						return;
					}
					return;
				}
			});

			oMultiInput2.addValidator(function (args) {
				that.placa = args.text;
				//consultar placa
				var dataVehiculo = MethodRepository.getDataPersonaVehiculo(that.placa);
				if (dataVehiculo.length > 0) {
					return new Token({
						key: that.placa.replace("-",""),
						text: that.placa.replace("-","")
					});
				} else {
					var obj = {};
					obj.TIPO_DOCUMENTO = "V";
					obj.NUMERO_IDENTIFICACION = that.placa;
					obj.NOMBRES = "";
					obj.APELLIDOS = "";
					var savePlaca = MethodRepository.savePlaca(obj);
					if (!Utilities.isEmpty(savePlaca)) {
						return new Token({
							key: that.placa.replace("-",""),
							text: that.placa.replace("-","")
						});
					} else {

					}
				}
			});

		},
		ValidarDni : function (oEvent){
		 var Objeto = oEvent.getSource();
            var val = Objeto.getValue();
                val = val.replace(/[^0-9]/g, '');
                val = val.toString();
                Objeto.setValue(val);	
		},
		
		ValidarPlaca : function (oEvent){
		 var Objeto = oEvent.getSource();
            var val = Objeto.getValue();
                val = val.replace(/[^a-zA-Z0-9]/gi, '');
                val = val.toString();
                Objeto.setValue(val);	
		},
		ValidarNombreApellidoDNi : function (oEvent){
			var Objeto	= oEvent.getSource();
            var val 	= Objeto.getValue();
                val 	= val.replace(/[^a-zA-ZÑñáéíóúÁÉÍÓÚ ]/gi, '');
                val 	= val.toString();
                Objeto.setValue(val);
		}
		
	});
}, /* bExport= */ true);