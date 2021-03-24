 sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	'sap/m/Token',
	"sap/m/MessageToast",
	"sap/ui/core/Fragment",
	'sap/ui/core/BusyIndicator',
	"sap/ui/core/format/NumberFormat",
	'../model/models',
	"sap/ui/model/json/JSONModel",
	'./MethodRepository',
], function(BaseController, MessageBox, Utilities, History,Token,MessageToast,Fragment,BusyIndicator,NumberFormat,models,JSONModel, MethodRepository) {
	"use strict";
	let oView;
	let that;
	var arrayOrdenes=null;
	var arrInsert=[];
	var Vaciar12	 =false;
	var ValidarNumbers = "";
	var qrcode;
	var ValidatePestaña =  true;
	var validarFechaAdjuntar = true ;
	var cantidadGeneral = 0 ;
	return BaseController.extend("com.rava.controller.Page1", {
		onAfterRendering: function() {
			that=this;
			oView=this.getView();
			var ModeloProyect = oView.getModel("Proyect");
			this.getTipoBultos();
			ModeloProyect.setSizeLimit(99999999);
		},
		//inicio app
		regresarAlLaunchpad: function(){
		    	var aplicacion	=	"#";
		    	var accion		=	"";
				var oCrossAppNavigator	=	sap.ushell.Container.getService("CrossApplicationNavigation");
				oCrossAppNavigator.toExternal({
	                  target: { semanticObject : aplicacion, action : accion}
	            });
			}, 
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("Page1").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
		},
		handleRouteMatched:function(){
			this.getView().byId("TreeTable1").clearSelection();
			this.getView().byId("TreeTable2").clearSelection();
			this.getView().byId("TreeTable").clearSelection();
			localStorage.setItem("arrayOrdenes", JSON.stringify([]));
			localStorage.setItem("arrayOrdenesPendientes", JSON.stringify([]));
			localStorage.setItem("arrayOrdenesPlanificadas", JSON.stringify([]));
			
			localStorage.setItem("arrayFechasDisponibles", JSON.stringify([]));
			localStorage.setItem("arrayFechasDisponiblesNoProg", JSON.stringify([]));
			localStorage.setItem("arrayFechasDisponiblesPlan", JSON.stringify([]));
			localStorage.setItem("arrayFechasDisponiblesPlanNoProg", JSON.stringify([]));
			arrInsert=[];
			
			this.setRUC();
		},
		//llamado Usser
		setRUC: function () {
			that = this;
			oView = this.getView();
			BusyIndicator.show(0);
			$.ajax({
				type: "GET",
				url: "/backend/api/proveedor/getSessionUser",
				dataType: "json",
				contentType: "application/json",
				headers: {
					"Accept": "application/json"
				},
				success: function (response) {
					// Utilities.setRuc(response.data.ruc);
					Utilities.setRuc("20106740004");
					oView.getModel("Proyect").setProperty("/UserSession" , response.data.firstName);
					// that.getPedidosRealizados();
					that.llamadoMetodos();
				},
				error: function () {
					// Utilities.setRuc("20106740004");
					// oView.getModel("Proyect").setProperty("/UserSession" , "Prueba");
					
					that.getView().setBusy(false);
					// that.llamadoMetodos();
					MessageBox.error("Ocurrio un error al obtener la sesion");
				}
			});
		},
		refresGeneral : function (){
			that = this;
			that.setRUC();
		},
		
		llamadoMetodos:function(){
			//comentado Temporalmente
			this.loadPedidoPorEmbalar();
			this.loadEntregas();
			// this.getConstantCentro();
			
			// this.loadPedidoPorEmbalarTemp();
			// this.loadEntregasTemp();
			// this.getConstantCentroTemp();
			this.getHorarioTemp();
		},
		getHorarioTemp:function(){
			that=this;
			oView=this.getView();
			var ModeloProyect = oView.getModel("Horario");
			$.ajax({
				url: "/backendhana/IPROVIDER_ENTREGA/ENTREGA_PROVEEDOR/Registro_ENTREGAPROVEEDOR.xsjs?modulo=MM"+"&aplicativo=PLANIFICACION_ENTREGA_PORTAL"+"&funcion=HORARIO",
				method: "GET",
				contentType: 'application/json',
				headers: {
				  Authorization: "Basic VVNSX1JBVkE6UmF2YTIwMjAk"
				},
				success: function (data) {
					ModeloProyect.setProperty("/data" ,data);
				},
				error: function (e) {
					console.log("Ocurrio un error" + JSON.parse(e))
				}
		  });
		},
		//llamado de pedidos por embalar y entregas
		fnPedidosTerceros:function(){
			this.getOwnerComponent().getRouter().navTo("EntregasOC");
		},
		
		loadEntregasTemp:function(){
			that = this;
			oView= this.getView();
			var oJsonModel = new sap.ui.model.json.JSONModel();
			let data = models.createEntregas();
			if (data.d.results.length === 0) {
				// sap.m.MessageBox.error("No se encontraron datos con los filtros seleccionados.");
			} else {
				var newArr=[]
				
				var OdataArray=data.d.results;
				var cantidad= OdataArray.length;
				
				while (cantidad !== 0) {
					var data1 = OdataArray[0];
					var arrayCoincidencias = [];
					var a = 1;
					for (a = 1; a < OdataArray.length; a++) {
						if (data1.Zzlfstk === OdataArray[a].Zzlfstk) {
							arrayCoincidencias.push(OdataArray[a]);
							cantidad--;
							OdataArray.splice(a, 1);
							a--;
						}
					}
					arrayCoincidencias.push(OdataArray[0]);
					OdataArray.splice(0, 1);
					
					cantidad--;
	
					var DescripcionEstatus = arrayCoincidencias[0].Zzlfstk;
					
					var DataSociedades = {
						DescripcionGeneral: DescripcionEstatus,
						ArrayGeneral: arrayCoincidencias
						
					};
	
					newArr.push(DataSociedades);
					
				}
				var DataEntregasPendientes = {
					ArrayGeneral :newArr
				};
				
				for(var i=0;i<newArr.length;i++){
					that.EstructuraEntregasTemp(newArr[i].ArrayGeneral , newArr[i].DescripcionGeneral)
				}
				
			}
			sap.ui.core.BusyIndicator.hide();
		},
		getConstantCentroTemp:function(){
			that=this;
			oView=this.getView();
			var data=models.createConstCentro();
			var data2=models.createConstCond();
			var ModeloProyect = oView.getModel("Proyect");
			ModeloProyect.setProperty("/DataConstantCentro" ,data);
			ModeloProyect.setProperty("/DataConstanteCond",data2);
		},
		EstructuraEntregasTemp:function(data,parameter){
			that=this;
			oView=this.getView();
			
			var oData=data;
			var cant= oData.length;
			var NumeroEntrega = [];
			
			while (cant !== 0) {
				var dataCentro = data[0];
				var arrayNumEntrega = [];
				var i = 1;
				for (i ; i < data.length; i++) {
					if (dataCentro.Vbeln === data[i].Vbeln) {
						arrayNumEntrega.push(data[i]);
						cant--;
						data.splice(i, 1);
						i--;
					}
				}
				arrayNumEntrega.push(data[0]);
				data.splice(0, 1);
				
				cant--;

				var CodigoNumEntrega		= arrayNumEntrega[0].EbelpD;
				var DescripcionNumEntrega	= arrayNumEntrega[0].Vbeln;
				var fechaEntrega	= arrayNumEntrega[0].Lfdat;
				var horaEntrega	= arrayNumEntrega[0].Lfuhr;
				var cantidadbulto	= arrayNumEntrega[0].Anzpk;
				var almacendestino	= arrayNumEntrega[0].Namel;
				//pendientes a enviar
				var pesototalbulto	= arrayNumEntrega[0].Btgew;
				var lugardestino	= arrayNumEntrega[0].ZzlugEnt;
				var desclugardestino	= arrayNumEntrega[0].Desc_cond;
				var entprogrogramada= arrayNumEntrega[0].Entprog;
				
				var Centro = arrayNumEntrega[0].Bukrs;
				var Proveedor = arrayNumEntrega[0].Lifnr;
				var status = arrayNumEntrega[0].status;
				var descEstatus = arrayNumEntrega[0].descEstatus;
				var Namew = arrayNumEntrega[0].Namew;
				var numCitas = arrayNumEntrega[0].Zcita;
				var Zbolnr = arrayNumEntrega[0].Zbolnr;

				var dataANumEntrega = {
					Centro: Centro,
					Proveedor:Proveedor,
					NumEntregaCodigo: CodigoNumEntrega,
					DescripcionGeneralEntrega: DescripcionNumEntrega,
					fecha:fechaEntrega,
					hora:horaEntrega,
					cantbulto:cantidadbulto,
					pesototalbulto:pesototalbulto,
					almdestino:almacendestino,
					lugdestino:lugardestino,
					desclugardestino:desclugardestino,
					entprogramadas: entprogrogramada,
					status:status,
					descEstatus:descEstatus,
					Namew:Namew,
					numCitas:numCitas,
					Zbolnr:Zbolnr,
					ArrayGeneral2: arrayNumEntrega
				};

				NumeroEntrega.push(dataANumEntrega);

			}
			var DataEntregasPendientes = {
				ArrayGeneral :NumeroEntrega
			};
			// console.log(Sociedades)
			if(parameter == "04"){
				oView.getModel("Proyect").setProperty("/DataEntregasPendientes" ,DataEntregasPendientes);	
			}
			// else if(parameter == "P"){
			// 	oView.getModel("Proyect").setProperty("/DataEntregasPlanificadas" ,DataEntregasPendientes);
			// }
			oView.setBusy(false);
			oView.getModel("Proyect").refresh(true);
		},
		loadPedidoPorEmbalar:function(){
			that = this;
			oView= this.getView();
			var ruc = Utilities.getRuc();
			// var ruc = "20106740004";
			
			var url="/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_REL_PEDC_XCONF_SRV/RelacionPedProvSet?$filter=RucInput eq"+  "'" + ruc  +"'&$format=json";
			// var url="/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_REL_PEDC_XCONF_SRV/RelacionPedEntSet?$filter=IRuc eq"+  "'" + ruc  +"'&$format=json";
			// console.log(url)
			var oJsonModel = new sap.ui.model.json.JSONModel();
			
			jQuery.ajax({
				type: "GET",
				cache: false,
				headers: {
					"Accept": "application/json"
				},
				contentType: "application/json",
				url: url,
				async: true,
				success: function (oData, textStatus, jqXHR) {
					if (oData.d.results.length === 0) {
					} else {
						that.EstructuraPedidosEmbalar(oData);
					}
				},
				error: function () {
					console.log("loadPedido por embalar")
					MessageBox.error("Ocurrio un error al obtener los datos");
				}
			});
			
		},
		loadEntregas:function(){
			that = this;
			oView= this.getView();
			var ruc = Utilities.getRuc();
			// var ruc = "20106740004";
			var url="/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_REL_PEDC_XCONF_SRV/RelacionPedEntSet?$filter=IRuc eq"+  "'" + ruc  +"'&$format=json";
			// console.log(url)
			var oJsonModel = new sap.ui.model.json.JSONModel();
			jQuery.ajax({
				type: "GET",
				cache: false,
				headers: {
					"Accept": "application/json"
				},
				contentType: "application/json",
				url: url,
				async: true,
				success: function (data, textStatus, jqXHR) {
					// console.log(data)
					if (data.d.results.length === 0) {
						// sap.m.MessageBox.error("No se encontraron datos con los filtros seleccionados.");
					} else {
						var newArr=[]
						
						var OdataArray=data.d.results;
						var cantidad= OdataArray.length;
						
						while (cantidad !== 0) {
							var data1 = OdataArray[0];
							var arrayCoincidencias = [];
							var a = 1;
							for (a = 1; a < OdataArray.length; a++) {
								if (data1.Zzlfstk === OdataArray[a].Zzlfstk) {
									arrayCoincidencias.push(OdataArray[a]);
									cantidad--;
									OdataArray.splice(a, 1);
									a--;
								}
							}
							arrayCoincidencias.push(OdataArray[0]);
							OdataArray.splice(0, 1);
							
							cantidad--;
			
							var DescripcionEstatus = arrayCoincidencias[0].Zzlfstk;
							
							var DataSociedades = {
								DescripcionGeneral: DescripcionEstatus,
								ArrayGeneral: arrayCoincidencias
								
							};
			
							newArr.push(DataSociedades);
							
						}
						var DataEntregasPendientes = {
							ArrayGeneral :newArr
						};
						
						for(var i=0;i<newArr.length;i++){
							// that.EstructuraEntregas(newArr[i].ArrayGeneral , newArr[i].DescripcionGeneral)
							that.EstructuraEntregasTemp(newArr[i].ArrayGeneral , newArr[i].DescripcionGeneral);
						}
						
					}
					sap.ui.core.BusyIndicator.hide();
				},
				error: function () {
					console.log("loadEntregas")
					MessageBox.error("Ocurrio un error al obtener los datos");
				}
			});
		},
		getConstantCentro:function(){
			that=this;
			oView=this.getView();
			
			var ModeloProyect = oView.getModel("Proyect");
			$.ajax({
				url: "/backendhana/IPROVIDER_ENTREGA/ENTREGA_PROVEEDOR/Registro_ENTREGAPROVEEDOR_centro.xsjs?modulo=MM&aplicativo=PLANIFICACION_ENTREGA_PORTAL&funcion=CENTRO",
				method: "GET",
				contentType: 'application/json',
				headers: {Authorization: "Basic VVNSX1JBVkE6UmF2YTIwMjAk"},
				success: function (data) {
					ModeloProyect.setProperty("/DataConstantCentro" ,data);
				},
				error: function (e){console.log("Ocurrio un error" + JSON.parse(e))}
			  });
			  
			  
			  $.ajax({
				url: "/backendhana/IPROVIDER_ENTREGA/ENTREGA_PROVEEDOR/Registro_ENTREGAPROVEEDOR.xsjs?modulo=MM&aplicativo=PLANIFICACION_ENTREGA_PORTAL&funcion=COND_ENTREGA",
				method: "GET",
				async:false,
				contentType: 'application/json',
				headers: {Authorization: "Basic VVNSX1JBVkE6UmF2YTIwMjAk"},
				success: function (data) {
					ModeloProyect.setProperty("/DataConstanteCond",data);
				},
				error: function (e) {console.log("Ocurrio un error" + JSON.parse(e))}
			  });
		},
		//Arreglo de los pedidos
		EstructuraPedidosEmbalar:function(datas){
			that=this;
			oView=this.getView();
			var oDataArray=datas.d.results;
			var cantidad= oDataArray.length;
			
			var Sociedades = [];
			while (cantidad !== 0) {
				var data = datas.d.results[0];
				var arrayCoincidencias = [];
				var a = 1;
				for (a = 1; a < oDataArray.length; a++) {
					if (data.Butxt === oDataArray[a].Butxt) {
						arrayCoincidencias.push(oDataArray[a]);
						cantidad--;
						oDataArray.splice(a, 1);
						a--;
					}
				}
				arrayCoincidencias.push(oDataArray[0]);
				oDataArray.splice(0, 1);
				
				cantidad--;

				var SociedadDescripcion = arrayCoincidencias[0].Butxt;
				var SociedadCodigo = arrayCoincidencias[0].Bukrs;

				var Centros = [];
				var CantidadSociedades = arrayCoincidencias.length;
				while (CantidadSociedades !== 0) {
					var dataSociedad = arrayCoincidencias[0];
					var arrayCentro = [];
					var e = 1;
					for (e ; e < arrayCoincidencias.length; e++) {
						if (dataSociedad.NamewD === arrayCoincidencias[e].NamewD) {
							arrayCentro.push(arrayCoincidencias[e]);
							CantidadSociedades--;
							arrayCoincidencias.splice(e, 1);
							e--;
						}
					}
					arrayCentro.push(arrayCoincidencias[0]);
					arrayCoincidencias.splice(0, 1);
					
					CantidadSociedades--;

					var CentroCodigo = arrayCentro[0].Werks;
					var CentroDescripcion = arrayCentro[0].NamewD;

					var Almacen = [];
					var CantidadCentro= arrayCentro.length;
					while (CantidadCentro !== 0) {
						var dataCentro = arrayCentro[0];
						var arrayAlmacen = [];
						var i = 1;
						for (i ; i < arrayCentro.length; i++) {
							if (dataCentro.NamelD === arrayCentro[i].NamelD) {
								arrayAlmacen.push(arrayCentro[i]);
								CantidadCentro--;
								arrayCentro.splice(i, 1);
								i--;
							}
						}
						arrayAlmacen.push(arrayCentro[0]);
						arrayCentro.splice(0, 1);
						
						CantidadCentro--;

						var CodigoAlmacen		= arrayAlmacen[0].Lgort;
						var DescripcionAlmacen	= arrayAlmacen[0].NamelD;

						var Ordenes = [];
						var CantidadAlmacen = arrayAlmacen.length;
						while (CantidadAlmacen !== 0) {
							var dataAlmacen	= arrayAlmacen[0];
							var arrayOrdenes	= [];
							var u = 1;
							for (u ; u < arrayAlmacen.length; u++) {
								if (dataAlmacen.PstypD === arrayAlmacen[u].PstypD) {
									arrayOrdenes.push(arrayAlmacen[u]);
									CantidadAlmacen--;
									arrayAlmacen.splice(u, 1);
									u--;
								}
							}
							arrayOrdenes.push(arrayAlmacen[0]);
							arrayAlmacen.splice(0, 1);
							
							CantidadAlmacen--;
							
							var CodigoOrdenes			= arrayOrdenes[0].PstypD;

							var OrdenesCompra = [];
							var CantidadOrdenes = arrayOrdenes.length;
							
							while (CantidadOrdenes !== 0) {
								var ArrayOrdenesCompra = [];
								var dataordenes	= arrayOrdenes[0];
								var M = 1;
								for (M ; M < arrayOrdenes.length; M++) {
									if (dataordenes.Ebeln === arrayOrdenes[M].Ebeln) {
										ArrayOrdenesCompra.push(arrayOrdenes[M]);
										CantidadOrdenes--;
										arrayOrdenes.splice(M, 1);
										M--;
									}
								}
								ArrayOrdenesCompra.push(arrayOrdenes[0]);
								arrayOrdenes.splice(0, 1);
								CantidadOrdenes--;
								
								ArrayOrdenesCompra.forEach(function(obj){
									 obj.Bedat = obj.Bedat;
									 obj.EindtD = obj.EindtD;
									});
								var dataOrdenCompra = {
									Ebeln:ArrayOrdenesCompra[0].Ebeln,
									Bedat:ArrayOrdenesCompra[0].Bedat,
									NameTextc :ArrayOrdenesCompra[0].NameTextc,
									PstypD	  :ArrayOrdenesCompra[0].PstypD,
									NamelD	  :ArrayOrdenesCompra[0].NamelD,
									Xhupf :ArrayOrdenesCompra[0].Xhupf,
									ArrayMaterial: ArrayOrdenesCompra
								};

								OrdenesCompra.push(dataOrdenCompra);
							
							}
							
							var dataOrden = {
								OrdenCodigo: CodigoOrdenes,
								DescripcionGeneral: CodigoOrdenes ==='0' ? "Ordenes Normales":"Ordenes Consignación",
								ArrayGeneral: OrdenesCompra
							};

							Ordenes.push(dataOrden);

						}

						var dataAlmacen = {
							AlmacenCodigo: CodigoAlmacen,
							DescripcionGeneral: DescripcionAlmacen,
							ArrayGeneral: Ordenes

						};

						Almacen.push(dataAlmacen);

					}
					var dataCentros = {
						CentroCodigo: CentroCodigo,
						DescripcionGeneral: CentroDescripcion,
						ArrayGeneral: Almacen

					};

					Centros.push(dataCentros);

				}

				var DataSociedades = {
					SociedadCodigo: SociedadCodigo,
					DescripcionGeneral: SociedadDescripcion,
					ArrayGeneral: Centros
					
				};

				Sociedades.push(DataSociedades);

			}
			var Data = {
				ArrayGeneral :Sociedades
			};
			// console.log(Data)
			oView.getModel("Proyect").setProperty("/DataPedidosEmbalar" ,Data);
			oView.getModel("Proyect").refresh(true);
			BusyIndicator.hide(0);
		},
		
		EstructuraEntregas:function(data,parameter){
			that=this;
			oView=this.getView();
			
			var oData=data;
			var cant= oData.length;
			var Sociedades = [];
			
			while (cant !== 0) {
				var data1 = data[0];
				var arrayCoincidencias = [];
				var a = 1;
				for (a = 1; a < oData.length; a++) {
					if (data1.Butxt === oData[a].Butxt) {
						arrayCoincidencias.push(oData[a]);
						cant--;
						oData.splice(a, 1);
						a--;
					}
				}
				arrayCoincidencias.push(oData[0]);
				oData.splice(0, 1);
				
				cant--;

				var SociedadDescripcion = arrayCoincidencias[0].Butxt;
				var SociedadCodigo = arrayCoincidencias[0].Bukrs;
				
				var Centros = [];
				var CantidadSociedades = arrayCoincidencias.length;
				
				while (CantidadSociedades !== 0) {
					var dataSociedad = arrayCoincidencias[0];
					var arrayCentro = [];
					
					var e = 1;
					for (e ; e < arrayCoincidencias.length; e++) {
						if (dataSociedad.Namew === arrayCoincidencias[e].Namew) {
							arrayCentro.push(arrayCoincidencias[e]);
							CantidadSociedades--;
							arrayCoincidencias.splice(e, 1);
							e--;
						}
					}
					arrayCentro.push(arrayCoincidencias[0]);
					arrayCoincidencias.splice(0, 1);
					
					CantidadSociedades--;

					var CentroCodigo = arrayCentro[0].Werks;
					var CentroDescripcion = arrayCentro[0].Namew;
					
					var NumeroEntrega = [];
					var CantidadCentro= arrayCentro.length;
					while (CantidadCentro !== 0) {
						var dataCentro = arrayCentro[0];
						var arrayNumEntrega = [];
						var i = 1;
						for (i ; i < arrayCentro.length; i++) {
							if (dataCentro.Vbeln === arrayCentro[i].Vbeln) {
								arrayNumEntrega.push(arrayCentro[i]);
								CantidadCentro--;
								arrayCentro.splice(i, 1);
								i--;
							}
						}
						arrayNumEntrega.push(arrayCentro[0]);
						arrayCentro.splice(0, 1);
						
						CantidadCentro--;

						var CodigoNumEntrega		= arrayNumEntrega[0].EbelpD;
						var DescripcionNumEntrega	= arrayNumEntrega[0].Vbeln;
						var fechaEntrega	= arrayNumEntrega[0].Lfdat;
						var horaEntrega	= arrayNumEntrega[0].Lfuhr;
						var cantidadbulto	= arrayNumEntrega[0].Anzpk;
						var almacendestino	= arrayNumEntrega[0].Namel;
						//pendientes a enviar
						var pesototalbulto	= arrayNumEntrega[0].Btgew;
						var lugardestino	= arrayNumEntrega[0].ZzlugEnt;
						var entprogrogramada= arrayNumEntrega[0].Entprog;
						
						var Centro = arrayNumEntrega[0].Bukrs;
						var Proveedor = arrayNumEntrega[0].Lifnr;
						var estatus = arrayNumEntrega[0].Zzlfstk;
						var Zbolnr = arrayNumEntrega[0].Zbolnr;
						// var citas = arrayNumEntrega[0].;

						var dataANumEntrega = {
							Centro: Centro,
							Proveedor:Proveedor,
							NumEntregaCodigo: CodigoNumEntrega,
							DescripcionGeneralEntrega: DescripcionNumEntrega,
							fecha:fechaEntrega,
							hora:horaEntrega,
							cantbulto:cantidadbulto,
							pesototalbulto:pesototalbulto,
							almdestino:almacendestino,
							estatus:estatus,
							lugdestino:lugardestino,
							entprogramadas: entprogrogramada,
							Zbolnr:Zbolnr,
							ArrayGeneral: arrayNumEntrega
								
						};

						NumeroEntrega.push(dataANumEntrega);

					}
					
					
					var dataCentros = {
						CentroCodigo: CentroCodigo,
						DescripcionGeneral: CentroDescripcion,
						ArrayGeneral: NumeroEntrega

					};

					Centros.push(dataCentros);
				}
				
				var DataSociedades = {
					SociedadCodigo: SociedadCodigo,
					DescripcionGeneral: SociedadDescripcion,
					ArrayGeneral: Centros
					
				};

				Sociedades.push(DataSociedades);
				
			}
			var DataEntregasPendientes = {
				ArrayGeneral :Sociedades
			};
			console.log(Sociedades)
			if(parameter == "04"){
				oView.getModel("Proyect").setProperty("/DataEntregasPendientes" ,DataEntregasPendientes);	
			}
			// else if(parameter == "P"){
			// 	oView.getModel("Proyect").setProperty("/DataEntregasPlanificadas" ,DataEntregasPendientes);
			// }
			oView.setBusy(false);
			oView.getModel("Proyect").refresh(true);
		},
		
		//Buttons footer IconTabBar
		Planificar : function (oEvent){
			that = this;
	 		var AB = oEvent.getSource().getSelectedKey();
	 		
	 		this.getView().byId("TreeTable1").clearSelection();
			this.getView().byId("TreeTable2").clearSelection();
			this.getView().byId("TreeTable").clearSelection();
			localStorage.setItem("arrayOrdenes", JSON.stringify([]));
			localStorage.setItem("arrayOrdenesPendientes", JSON.stringify([]));
			localStorage.setItem("arrayOrdenesPlanificadas", JSON.stringify([]));
			
			localStorage.setItem("arrayFechasDisponibles", JSON.stringify([]));
			localStorage.setItem("arrayFechasDisponiblesNoProg", JSON.stringify([]));
			localStorage.setItem("arrayFechasDisponiblesPlan", JSON.stringify([]));
			localStorage.setItem("arrayFechasDisponiblesPlanNoProg", JSON.stringify([]));
	 		
	 		localStorage.setItem("arrayOrdenes", []);
	 		localStorage.setItem("arrayOrdenes", []);
	 		localStorage.setItem("arrayOrdenes", []);
			
			switch (AB){
				case	"A" :
					this.byId("EntrSinOC").setVisible(true);
					this.byId("Registrar").setVisible(true);
					this.byId("Modificar").setVisible(false);
					this.byId("Modificar1").setVisible(false);
					this.byId("Modificar2").setVisible(false);
					this.byId("Plani").setVisible(false);
					break;
				case "B" :
					this.byId("EntrSinOC").setVisible(false);
					this.byId("Registrar").setVisible(false);
					this.byId("Modificar").setVisible(false);
					this.byId("Modificar1").setVisible(false);
					this.byId("Modificar2").setVisible(false);
					this.byId("Plani").setVisible(true);
					break;
				case "C" :
					this.byId("EntrSinOC").setVisible(false);
					this.byId("Registrar").setVisible(false);
					this.byId("Modificar").setVisible(true);
					this.byId("Modificar1").setVisible(true);
					this.byId("Modificar2").setVisible(true);
					this.byId("Plani").setVisible(false);
					break;
			}
		},
		
		//formatoCeldas y dates
		formatCell : function (sValue) {
			if(sValue==null){
			}else{
				var fecha=new Date(parseInt(sValue.split("(")[1].split(")")[0]));
				fecha.setHours(fecha.getHours() + 24);
				var fechaOC=this.formatosCellValidateoData(fecha.getDate())+"."+
				this.formatosCellValidateNumbers((fecha.getMonth()+1))+"."+
				this.formatosCellValidateNumbers(fecha.getFullYear());
				return fechaOC;
			}
		},
		formatCell2 : function (sValue) {
			if(sValue==null){
			}else{
				var fechaactual= parseInt(sValue.split("(")[1].split(")")[0]);
				var extra = 1 * 24  * 60  * 60 * 1000;
				var fecha=new Date(fechaactual+extra);
				
				// var nuevo = 
				var fechaOC=this.formatosCellValidateNumbers(fecha.getDate())+"."+
				this.formatosCellValidateNumbers((fecha.getMonth()+1))+"."+
				this.formatosCellValidateNumbers(fecha.getFullYear());
				return fechaOC;
			}
		},
		formatCell3 : function (sValue) {
			if(sValue==null){
			}else{
				var fecha=new Date(parseInt(sValue.split("(")[1].split(")")[0]));
				var fechaOC=this.formatosCellValidateNumbers(fecha.getDate())+"."+
				this.formatosCellValidateNumbers((fecha.getMonth()+1))+"."+
				this.formatosCellValidateNumbers(fecha.getFullYear());
				return fechaOC;
			}
		},
		formatosCellValidateoData:function(sValue){
			var nuevo; 
			var sValue = (sValue).toString();
			if(sValue.length == 1){
				nuevo = "0"+sValue
			}else{
				nuevo = sValue
			}
			return nuevo;
		},
		
		formatosCellValidateNumbers:function(sValue){
			var nuevo;
			var sValue = sValue.toString();
			if(sValue.length == 1){
				nuevo = "0"+sValue
			}else{
				nuevo = sValue
			}
			return nuevo;
		},
		formatCellRegistroFecha: function (sValue) {
			if (sValue == null) {} else {
				var fechaIn = sValue.split("-")[2] + "." + sValue.split("-")[1] + "." + sValue.split("-")[0]
				return fechaIn;
			}
		},
		formatDate	: function(sValue){
			if(sValue==null){
			}else{
				var fecha=new Date(parseInt(sValue.split("(")[1].split(")")[0]));
				var fechaOC=fecha.getFullYear()+"/"+(fecha.getMonth()+1)+"/"+fecha.getDate();
				return fechaOC;
			}
		},
		formatDate2	: function(sValue){
			if(sValue==null){
			}else{
				var fecha=new Date(parseInt(sValue.split("(")[1].split(")")[0]));
				var fechaOC=fecha.getDate()+"."+(fecha.getMonth()+1)+"."+fecha.getFullYear();
				return fechaOC;
			}
		},
		formatCellHora:function(sValue){
			if(sValue==null){
			}else{
				var fecha=new Date(parseInt(sValue.split("(")[1].split(")")[0]));
				var horaNE=fecha.getHours()+":"+fecha.getMinutes()+":"+fecha.getSeconds();
				return horaNE
				// return sValue;
			}
		},
		formatCellCantTotalBultos:function(sValue){
			// console.log(sValue)
			if(sValue==null || sValue ==""){
				return sValue;
			}else{
				var intCant=parseInt(sValue);
				return intCant;
				// return sValue;
			}
		},
		formatosFechasHoras:function(sValue){
			var nuevo;
			var sValue = sValue.toString();
			if(sValue.length == 1){
				nuevo = "0"+sValue
			}else{
				nuevo = sValue
			}
			var fecha = nuevo + ":00"
			return fecha;
		},
		formatosFilterDate:function(sValue,sValue2){
			var nuevo;
			if(sValue==null){
			}else{
				var fecha=sValue.split(".")[2]+ "-" +sValue.split(".")[1]+ "-" +sValue.split(".")[0];
				var fechatotal = fecha + " " + sValue2
				return new Date(fechatotal);
			}
		},
		formatosFilterDateRegistro:function(sValue){
			var nuevo;
			if(sValue==null){
			}else{
				var fecha=sValue.split(".")[2]+ "-" +sValue.split(".")[1]+ "-" +sValue.split(".")[0];
				return new Date(fecha);
			}
		},
		formatosFilterDateRegistro2:function(sValue){
			var nuevo;
			if(sValue==null){
			}else{
				var fecha=sValue.split(".")[2]+ "/" +sValue.split(".")[1]+ "/" +sValue.split(".")[0];
				return new Date(fecha);
			}
		},
		formatAbapDate: function (sValue) {
			if (sValue == null) {} else {
				var año = sValue.split(".")[2];
				var mes = sValue.split(".")[1];
				var dia = sValue.split(".")[0];
				var fechaSql = año + "-" + mes + "-" + dia;
				var horaSql = "T00:00:00";
				var fechatotalSql = fechaSql + horaSql;
				return fechatotalSql;
			}
		},
		formatAbapHours: function (sValue) {
			if (sValue == null) {} else {
				var hours = sValue.split(":")[0];
				var min = sValue.split(":")[1];
				var seconds = sValue.split(":")[2];
				var horaSql = "PT" + hours + "H" + min + "M" + seconds + "S";
				return horaSql;
			}
		},
		formatCellAbapHours: function (sValue) {
			if (sValue == null || sValue == "") {
				return sValue
			} else {
				var split =  sValue.split("PT")[1];
				var hours = split.split("H")[0];
				var min = (split.split("H")[1]).split("M")[0];
				var seconds = ((split.split("H")[1]).split("M")[0]).split("M")[0];
				// var horaCell =  hours + ":" + min + ":" + seconds;
				var horaCell =  hours + ":" + min ;
				return horaCell;
			}
			return sValue
		},
		//Temp
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
		quantity: function (iInteger) {
			var num = iInteger * 1;

			var sReturn = num.toFixed(2);
			// var sReturn = (iInteger).toFixed(2);

			// return sReturn to the view
			return sReturn;

		},
		//formatoCeldas
		
		//valida onclick en campos
		ValidarCamposEmbalar : function (oEvent){
			var oView = this.getView();
			var table = oView.byId("TreeTable");
			var context = oEvent.getParameter("rowContext");
			if(context != null){
				var path = context.sPath;
				var Object = this.getView().getModel("Proyect").getProperty(path);
			}
			var oIndex = oEvent.getParameter('rowIndex');
			// ArrayTotal.push(Object)
			
			var Selecciones =table.getSelectedIndices();
			var selectedEntriesProvi = [];
			var selectedEntries=[];
			
			for(var i=0; i<Selecciones.length; i++){
				var oData = table.getContextByIndex(Selecciones[i]);
				selectedEntries.push(oData.getProperty(oData.getPath()));
			}
				// PstypD
				// NamelD
			if(Selecciones.length>1){
				if(selectedEntries[0].Xhupf != selectedEntries[Selecciones.length-1].Xhupf || selectedEntries[0].PstypD != selectedEntries[Selecciones.length-1].PstypD  ||  selectedEntries[0].NamelD != selectedEntries[Selecciones.length-1].NamelD ){
					table.removeSelectionInterval(oIndex,oIndex);
					var i = selectedEntries.indexOf(Object);
					if ( i !== -1 ) {
				        selectedEntries.splice( i, 1 );
				    }
				}
			}
			
			// ArrayTotal = selectedEntriesProvi;
			console.log(selectedEntries)
			localStorage.setItem("arrayOrdenes", JSON.stringify(selectedEntries));
			
			// if(Object==[] || Object == undefined){
			// 	table.removeSelectionInterval(oIndex,oIndex);
			// }else{
			sap.ui.core.BusyIndicator.hide();
				if(Object !== undefined){
				if(!Object.Ebeln){
					// MessageToast.show("Solo se puede seleccionar Numero de Entrega");
					// if(oIndex == 0){
					// 	oIndex++
					// }else{
						table.removeSelectionInterval(oIndex,oIndex);
					// }
				}
				}
			
			// }
			
		},
		//valida onclick en campos
		
		Registrar : function (){
			
			var oView =this.getView();	
			var ModeloProyect = oView.getModel("Proyect");
			// ModeloProyect.setProperty("/DataTipoBulto",[]) ;
			ModeloProyect.setProperty("/DataBultos",[]) ;
		
			var arrayOrdenes = localStorage.getItem('arrayOrdenes');
			// console.log(JSON.parse(arrayOrdenes)[0])
			if(JSON.parse(arrayOrdenes)[0] === undefined){
				// console.log("no va")
				MessageToast.show("No se ha seleccionado Orden de Compra");
			}else{
				// console.log("va")
				sessionStorage.setItem('arrayMaterialOrden', arrayOrdenes);
				this.getOwnerComponent().getRouter().navTo("Registro");
			}
		},
		
		
		
		//Segundo target
		
		//Dialog Materiales Temp
		CerrarDialogEntregasTemp:function(){
			oView = this.getView();
			if(oView.byId("DialogEntregasTemp") != undefined){
				oView.byId("DialogEntregasTemp").close();
			}
		},
		DialogMaterialesTemp:function(oEvent){
			oView = this.getView();
			
			var table = oView.byId("TreeTable1");
			
			var context = oEvent.getSource().getParent().getBindingContext("Proyect").getPath(); 
			var Object = this.getView().getModel("Proyect").getProperty(context);
			var materiales = Object.ArrayGeneral2;
			var model = new JSONModel(materiales);
			if (!oView.byId("DialogMaterialesTemp")) {
					Fragment.load({
						id: oView.getId(),
						name: "com.rava.fragment.Cambios.Materiales",
						controller: that
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					oDialog.open();
					oView.byId("idTableMateriales").setVisibleRowCount(materiales.length)
					oView.byId("idTableMateriales").setModel(model, "Materiales")
				});
			} else {
				oView.byId("DialogMaterialesTemp").open();
				oView.byId("idTableMateriales").setVisibleRowCount(materiales.length)
				oView.byId("idTableMateriales").setModel(model, "Materiales")
			}
		},
		CerrarDialogMaterialesTemp:function(){
			oView = this.getView();
			oView.byId("DialogMaterialesTemp").close();
		},
		fnPressNoProgramadoTemp:function(){
			this.fnNoProgramadoTemp("")
		},
		fnNoProgramadoTemp:function(fecha){
			oView = this.getView();
			
			var ModeloProyect = oView.getModel("Proyect");
			var arrayOrdenes;
			var fecha;
			
			if(JSON.parse(localStorage.getItem('arrayOrdenesPendientes')).length > 0){
				arrayOrdenes = JSON.parse(localStorage.getItem('arrayOrdenesPendientes'));
			}else{
				arrayOrdenes = JSON.parse(localStorage.getItem('arrayOrdenesPlanificadas'));
			}

			var arrHorarioTotal=[];
			var obj={};
			if(fecha == "RECOJO EN PLANTA DE PROVEEDOR"){
				obj.TitleFecha = "Fecha de Recojo"
			}else if(fecha == "PUESTO EN MINA"){
				obj.TitleFecha = "Fecha de llegada "
			}else{
				obj.TitleFecha = "Fecha"
			}
			arrHorarioTotal.push(obj)
			
			ModeloProyect.setProperty("/DataFechaNoProg" ,arrHorarioTotal);
			
			if (!oView.byId("DialogSelecFechaNoProgTemp")) {
					Fragment.load({
						id: oView.getId(),
						name: "com.rava.fragment.Cambios.SelecFechaNoProg",
						controller: that
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					oDialog.open();
					oView.byId("nEntregaSeleccionadasNoProg").setText(arrayOrdenes.length)
				});
			} else {
				oView.byId("DialogSelecFechaNoProgTemp").open();
				oView.byId("nEntregaSeleccionadasNoProg").setText(arrayOrdenes.length)
			}
		},
		fnCitaHoraNoProgTemp:function(){
			that=this;
			oView=this.getView();
			var arrhorario=oView.getModel("Horario").getProperty("/data");
			
			var time;
			var dateselected;
			var hourselected;
			
			var arrayOrdenesPendientes = JSON.parse(localStorage.getItem('arrayOrdenesPendientes'));
			var arrayOrdenesPlanificadas = JSON.parse(localStorage.getItem('arrayOrdenesPlanificadas'));

			if(arrayOrdenesPendientes.length > 0 ){
				time=oView.byId("TP1").getDateValue();
				dateselected=this.getView().byId("CitafechaNoProg").getValue();
				hourselected=this.getView().byId("TP1").getValue();
			}else if(arrayOrdenesPlanificadas.length > 0){
				time=oView.byId("TP2").getDateValue();
				dateselected=this.getView().byId("CitafechaNoProgPlan").getValue();
				hourselected=this.getView().byId("TP2").getValue();
			}
			var hour;
			if(time != null){
				hour=time.getHours();
			}
			var arrMin=[];
			var arrMax=[];
			var count=0;
			var text="";
			for(var i=0;i<Object.keys(arrhorario).length;i++){
				var ranghourInit=parseInt(arrhorario[i].DESDE);
				var ranghourfinish=parseInt(arrhorario[i].HASTA);
				
				text += arrhorario[i].DESDE + "-" + arrhorario[i].HASTA + " ";
				if(ranghourInit<=hour && ranghourfinish>hour){
					count++
				}
			}
			
			var object={
				"FECHAS": dateselected,
				"HORARIOS":hourselected,
			}
			if(arrayOrdenesPendientes.length > 0 ){
				localStorage.setItem("arrayFechasDisponibles", JSON.stringify(object));
			}else if(arrayOrdenesPlanificadas.length > 0){
				localStorage.setItem("arrayFechasDisponiblesPlan", JSON.stringify(object));
			}
				
			if(count == 0){
				sap.m.MessageBox.error("Horarios disponibles \n" + text, {
					title: "Error",
					actions: ["Salir"],
					onClose: function (sActionClicked) {
						if(arrayOrdenesPendientes.length > 0 ){
							that.getView().byId("TP1").setValue("");
						}else if(arrayOrdenesPlanificadas.length > 0){
							that.getView().byId("TP2").setValue("");
						}
					}
				});
			}else{
				
			}
			
		},
		CerrarDialogSelecFechaNoProgTemp:function(){
			oView = this.getView();
			var arrayOrdenesPendientes = JSON.parse(localStorage.getItem('arrayOrdenesPendientes'));
			var arrayOrdenesPlanificadas = JSON.parse(localStorage.getItem('arrayOrdenesPlanificadas'));
			this.fnLimpiarSelectFechaNoProg();
			if(arrayOrdenesPendientes.length > 0 ){ 
				oView.byId("DialogSelecFechaNoProgTemp").close();
			}
			else if(arrayOrdenesPlanificadas.length > 0){
				this.fnLimpiarSelectFechaNoProg();
				oView.byId("DialogSelecFechaNoProgPlanTemp").close();
			}
		},
		fnLimpiarSelectFechaNoProg:function(){
			oView = this.getView();
			var arrayOrdenesPendientes = JSON.parse(localStorage.getItem('arrayOrdenesPendientes'));
			var arrayOrdenesPlanificadas = JSON.parse(localStorage.getItem('arrayOrdenesPlanificadas'));
			if(arrayOrdenesPendientes.length > 0 ){ 
				that.getView().byId("CitafechaNoProg").setValue("");
				that.getView().byId("TP1").setValue("");
				that.getView().byId("TP1").setEnabled(false);
			}
			if(oView.byId("DialogSelecFechaNoProgPlanTemp") != undefined){
				that.getView().byId("CitafechaNoProgPlan").setValue("");
				that.getView().byId("TP2").setValue("");
				that.getView().byId("TP2").setEnabled(false);
			}
			
			localStorage.setItem("arrayFechasDisponibles", JSON.stringify([]));
			localStorage.setItem("arrayFechasDisponiblesPlan", JSON.stringify([]));
		},
		cambioNoProgTemp:function(){
			var dateActual=new Date()
			var year = parseInt(dateActual.getFullYear());
			var mount = parseInt(dateActual.getMonth());
			var day = parseInt(dateActual.getDate());
			var arrayOrdenesPendientes = JSON.parse(localStorage.getItem('arrayOrdenesPendientes'));
			var arrayOrdenesPlanificadas = JSON.parse(localStorage.getItem('arrayOrdenesPlanificadas'));
			
			if(arrayOrdenesPendientes.length > 0 ){
				this.getView().byId("CitafechaNoProg").setMinDate(new Date(year, mount, day));
			}else if(arrayOrdenesPlanificadas.length > 0){
				this.getView().byId("CitafechaNoProgPlan").setMinDate(new Date(year, mount, day));
			}
		},
		eventchangeFechaNoProgTemp:function(){
			that = this;
			var dateselected;
			var hourselected;
			var hourinput;
			var arrayOrdenesPendientes = JSON.parse(localStorage.getItem('arrayOrdenesPendientes'));
			var arrayOrdenesPlanificadas = JSON.parse(localStorage.getItem('arrayOrdenesPlanificadas'));

			if(arrayOrdenesPendientes.length > 0 ){
				dateselected=this.getView().byId("CitafechaNoProg").getValue();
				hourinput=this.getView().byId("TP1");
				hourselected=hourinput.getValue();
			}else if(arrayOrdenesPlanificadas.length > 0){
				dateselected=this.getView().byId("CitafechaNoProgPlan").getValue();
				hourinput=this.getView().byId("TP2");
				hourselected=this.getView().byId("TP2").getValue();
			}
			var dia;
			var mes;
			var anio;
			var date;
			if(dateselected != undefined && dateselected != ""){
				dia=dateselected.split(".")[0];
				mes=dateselected.split(".")[1];
				anio=dateselected.split(".")[2];
				date = new Date( anio + "/" + mes + "/" + dia );
				
				if(date.getDay()==6 || date.getDay()==0){
					hourinput.setEnabled(false);
					sap.m.MessageBox.error("No es Seleccionable los días no laborables", {
						title: "Error",
						actions: ["OK"],
						onClose: function (sActionClicked) {
							if(arrayOrdenesPendientes.length > 0 ){
								that.getView().byId("CitafechaNoProg").setValue("");
							}else if(arrayOrdenesPlanificadas.length > 0){
								that.getView().byId("CitafechaNoProgPlan").setValue("");
							}
						}
					});
					
				}else{
					hourinput.setEnabled(true);
					var object={
						"FECHAS": dateselected,
						"HORARIOS":hourselected,
					}
					if(arrayOrdenesPendientes.length > 0 ){
						localStorage.setItem("arrayFechasDisponibles", JSON.stringify(object));
					}else if(arrayOrdenesPlanificadas.length > 0){
						localStorage.setItem("arrayFechasDisponiblesPlan", JSON.stringify(object));
					}
					localStorage.setItem("arrayFechasDisponibles", JSON.stringify(object));
				}
			}else{
				var object={
					"FECHAS": dateselected,
					"HORARIOS":hourselected,
				}
				if(arrayOrdenesPendientes.length > 0 ){
					localStorage.setItem("arrayFechasDisponibles", JSON.stringify(object));
				}else if(arrayOrdenesPlanificadas.length > 0){
					localStorage.setItem("arrayFechasDisponiblesPlan", JSON.stringify(object));
				}
				localStorage.setItem("arrayFechasDisponibles", JSON.stringify(object));
				hourinput.setEnabled(false);
			}
			
				
			
		},
		GuardarFechaNoProgTemp:function(){
			that=this;
			oView = this.getView();
			sap.m.MessageBox.confirm("¿Desea guardar los cambios?", {
				title: "Mensaje",
				actions: ["Confirmar","Cancelar"],
				onClose: function (sActionClicked) {
					if(sActionClicked == "Confirmar"){
						oView.byId("DialogSelecFechaNoProgTemp").close();
						that.CerrarDialogSeleccionarFecha();
						MessageBox.success("Registro guardado.");
					}
				}
			});
		},
		fnContinuarCitaTemp:function(){
			that=this;
			oView=this.getView();
			var fecha = JSON.parse(localStorage.getItem("arrayFechasDisponibles"));
			//añadido reciente
			var fechaPlan = JSON.parse(localStorage.getItem("arrayFechasDisponiblesPlan"));
			if((fecha.FECHAS == undefined || fecha.FECHAS == "") && (fechaPlan.FECHAS == undefined || fechaPlan.FECHAS == "") ){
				MessageToast.show("Seleccione fecha",{
					duration: 4000,
					my: "center center",
					at: "center center"
				});
			}else{
				if((fecha.HORARIOS == undefined || fecha.HORARIOS == "")&& (fechaPlan.HORARIOS == undefined || fechaPlan.HORARIOS == "")){
					MessageToast.show("Seleccione hora", {
						duration: 4000,
						my: "center center",
						at: "center center"
					});
				}else{
					sap.m.MessageBox.confirm("¿Desea planificar la fecha?", {
						title: "Mensaje",
						actions: ["Si","Cancelar"],
						onClose: function (sActionClicked) {
							if(sActionClicked==="Si"){
								BusyIndicator.show(0);
								that.newDialogGuiaTemp();
							}else{
								// oView.byId("idTableRegistroDisponible").clearSelection();
							}
						}
					});
				}
			}
		},
		fnContinuarCitaPlanTemp:function(){
			that=this;
			oView=this.getView();
			var fecha = JSON.parse(localStorage.getItem("arrayFechasDisponibles"));
			//añadido reciente
			var fechaPlan = JSON.parse(localStorage.getItem("arrayFechasDisponiblesPlan"));
			if((fecha.FECHAS == undefined || fecha.FECHAS == "") && (fechaPlan.FECHAS == undefined || fechaPlan.FECHAS == "") ){
				MessageToast.show("Seleccione fecha",{
					duration: 4000,
					my: "center center",
					at: "center center"
				});
			}else{
				if((fecha.HORARIOS == undefined || fecha.HORARIOS == "")&& (fechaPlan.HORARIOS == undefined || fechaPlan.HORARIOS == "")){
					MessageToast.show("Seleccione hora", {
						duration: 4000,
						my: "center center",
						at: "center center"
					});
				}else{
					sap.m.MessageBox.confirm("¿Desea modificar la fecha?", {
						title: "Mensaje",
						actions: ["Si","Cancelar"],
						onClose: function (sActionClicked) {
							if(sActionClicked==="Si"){
								BusyIndicator.show(0);
								that.saveGuiaTemp();
							}else{
								// oView.byId("idTableRegistroDisponible").clearSelection();
							}
						}
					});
				}
			}
		},
		newDialogGuiaTemp:function(fecha){
			that=this;
			oView=this.getView();
			var arrayOrdenes;
			var fecha;
			var arr=[];
			if(JSON.parse(localStorage.getItem('arrayOrdenesPendientes')).length > 0){
				arrayOrdenes = JSON.parse(localStorage.getItem('arrayOrdenesPendientes'));
				fecha = JSON.parse(localStorage.getItem("arrayFechasDisponibles"));
			}else{
				arrayOrdenes = JSON.parse(localStorage.getItem('arrayOrdenesPlanificadas'));
				fecha = JSON.parse(localStorage.getItem("arrayFechasDisponiblesPlan"));
			}
			// if(fecha == "NoProg"){
			// 	fecha = JSON.parse(localStorage.getItem('arrayFechasDisponiblesNoProg'));
			// }else{
			// 	fecha = JSON.parse(localStorage.getItem("arrayFechasDisponibles"));
			// }
			
			var ModeloProyect = oView.getModel("RegistroEntrega");
			ModeloProyect.setProperty("/Data" ,arrayOrdenes);
			ModeloProyect.setProperty("/fecha" ,fecha);
			
			if (!oView.byId("DialogEntregasTemp")) {
					Fragment.load({
						id: oView.getId(),
						name: "com.rava.fragment.Cambios.Entregas",
						controller: that
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					oDialog.open();
					BusyIndicator.hide(0);
					oView.byId("nEntregaSeleccionadas").setText(arrayOrdenes.length)
				});
			} else {
				oView.byId("DialogEntregasTemp").open();
				BusyIndicator.hide(0);
				oView.byId("nEntregaSeleccionadas").setText(arrayOrdenes.length)
			}
		},
		cerrarnewDialogGuiaTemp:function(){
			oView = this.getView();
			oView.byId("DialogEntregasTemp").close();
		},
		//Nueva variante de Entregas a Rendir
		confirmarCentro: function () {
			var that = this;
			var ModeloProyect = this.getView().getModel("Proyect");
			var ContadorValidarEntrega=ModeloProyect.getProperty("/DataContadorValidarEntrega") 
			jQuery.sap.require("jquery.sap.storage");
			that._oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);
			var oView = that.getView();
			var table = oView.byId("tableEntregasRegistradas");
			var indexes = oView.getModel("RegistroEntrega").getProperty("/Data");
			var lista = [];
			var listaOtros = [];
			var arrayOrdenes;
			var centroConstantes = that.getCentroContantes("MM", "REGISTRO_ENTREGA_PORTAL", "CENTRO");
			if(JSON.parse(localStorage.getItem('arrayOrdenesPendientes')).length > 0){
				arrayOrdenes = JSON.parse(localStorage.getItem('arrayOrdenesPendientes'));
			}else{
				arrayOrdenes = JSON.parse(localStorage.getItem('arrayOrdenesPlanificadas'));
			}
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
					
					// var obj = table.getContextByIndex(indexes[0]).getObject();
					var obj = oView.getModel("RegistroEntrega").getProperty("/Data")[0];
					var valueGuia = obj.Zbolnr;
					var valueStatus = obj.Zzlfstk;

					if (Utilities.isEmpty(valueGuia)) {
						validarVacio = false;
					}
					// if (valueStatus == 'R') {
						// validarStatus = true;
					// }
					// if (Utilities.validateMask(valueGuia) === "error") {
						// validarCantGuia = true;
					// }

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
							oDialog = sap.ui.xmlfragment(oView.getId(), "com.rava.fragment.Cambios.ConfirmarCentro", that);
							oView.addDependent(oDialog);
							var oMultiInput1 = oView.byId("multiInput1");
							oMultiInput1.setValue("");
							oMultiInput1.setTokens([]);
							var oMultiInput2 = oView.byId("multiInput2");
							oMultiInput2.setTokens([]);
							oDialog.open();
							
							// if(ContadorValidarEntrega == 1){
							// 	that.getView().byId("elementDireccion").setVisible(true)
							// 	ModeloProyect.setProperty("/ElementosyTablas" , false);
							// }else{
							// 	that.getView().byId("elementDireccion").setVisible(false)
							// 	ModeloProyect.setProperty("/ElementosyTablas" , true);
							// }
							if(arrayOrdenes[0].lugdestino!="RECOJO EN PLANTA DE PROVEEDOR"){
								that.getView().byId("elementDireccion").setVisible(false);
								that.getView().byId("elementEmail").setVisible(false);
								that.getView().byId("elementTelefono").setVisible(false);
								ModeloProyect.setProperty("/ElementosyTablas" , true);
							}else{
								that.getView().byId("elementDireccion").setVisible(true);
								that.getView().byId("elementEmail").setVisible(true);
								that.getView().byId("elementTelefono").setVisible(true);
								ModeloProyect.setProperty("/ElementosyTablas" , false);
							}
						
						} else {
							var oMultiInput1 = oView.byId("multiInput1");
							oMultiInput1.setValue("");
							oMultiInput1.setTokens([]);
							var oMultiInput2 = oView.byId("multiInput2");
							oMultiInput2.setTokens([]);
							oDialog.open();
							
							// if(ContadorValidarEntrega == 1){
							// 	that.getView().byId("elementDireccion").setVisible(true)
							// 	ModeloProyect.setProperty("/ElementosyTablas" , false);
							// }else{
							// 	that.getView().byId("elementDireccion").setVisible(false)
							// 	ModeloProyect.setProperty("/ElementosyTablas" , true);
							// }
							
							if(arrayOrdenes[0].lugdestino!="RECOJO EN PLANTA DE PROVEEDOR"){
								that.getView().byId("elementDireccion").setVisible(false);
								that.getView().byId("elementEmail").setVisible(false);
								that.getView().byId("elementTelefono").setVisible(false);
								ModeloProyect.setProperty("/ElementosyTablas" , true);
							}else{
								that.getView().byId("elementDireccion").setVisible(true);
								that.getView().byId("elementEmail").setVisible(true);
								that.getView().byId("elementTelefono").setVisible(true);
								ModeloProyect.setProperty("/ElementosyTablas" , false);
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
							DialogConfirmarRegistro = sap.ui.xmlfragment(oView.getId(), "com.rava.fragment.Cambios.ConfirmarRegistro",
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
		CancelarGuardarRoles: function () {
			var that = this;
			var oView = that.getView();
			var ModeloProyect = oView.getModel("Proyect");
			var DataPestaña1  = ModeloProyect.getProperty("/Data");
			// DataPestaña1.forEach(function(obj){
			// 	obj.Zbolnr="";
			// });
			// ModeloProyect.setProperty("/Data",DataPestaña1);
			// // that.byId("DialogConfirmarCentro").close();
			that.byId("DialogConfirmarCentro").close();
		},
		pressTest: function () {
			var that = this;
			var oView = that.getView();
			var oMultiInput1 = oView.byId("multiInput1").getValue();
			console.log(oMultiInput1);
			oView.byId("multiInput1").setValue("");

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
				oDialog = sap.ui.xmlfragment(oView.getId(), "com.rava.fragment.Cambios.RegistrarDni", that);
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
		AdjuntarDocumentos: function () {
			var that		= this;
			var oView		= that.getView();
			var ModeloProyect = oView.getModel("Proyect");
			if(!that.oDialog){
				that.oDialog = sap.ui.xmlfragment(oView.getId(),"com.rava.fragment.Cambios.MantenimientoRoles" , that);
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
			var table = oView.byId("tableEntregasRegistradas");
			var indexes = table.getBinding().getModel("/Data").getData().Data;
			
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
				var object_index = table.getContextByIndex(index).getObject();
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
		CancelarDialogRolesMant: function () {
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
							// cita = MethodRepository.generarCita() + '';
								cita = "1"
							}
							else {
								var arrayEntregasTarjet2 = JSON.parse(localStorage.getItem("arrayEntregasTarjet2"));
								// cita= arrayEntregasTarjet2[0].ZCita ;
								cita = "1"
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
					// if(!ValidatePestaña){
						// that.saveGuia(that.entregaGuiaSelected, cita, that);
						that.saveGuiaTemp(that.entregaGuiaSelected, cita, that);
					}else {
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
		saveGuiaTemp: function (lista, cita, context) {
			var that = this;
			var oView = that.getView();
			that.entregas = [];
			var arrayOrdenesPendientes = JSON.parse(localStorage.getItem('arrayOrdenesPendientes'));
			var arrayOrdenesPlanificadas = JSON.parse(localStorage.getItem('arrayOrdenesPlanificadas'));
			var texto="";
			var arrayOrdenes;
			if(arrayOrdenesPendientes.length > 0 ){
				if(arrayOrdenesPendientes[0].lugdestino == "CD CAMPOY"){
					if(cita != undefined){
						texto = "Se ha generado el número de cita " + cita;
					}else{
						texto = "Se ha modificado la fecha de cita" ;
					}
				}else{
					if(cita != undefined){
						texto = "Se ha generado el documento con exito";
					}else{
						texto = "Se ha modificado el documento con exito" ;
					}
					
				}
				arrayOrdenes = arrayOrdenesPendientes;
			}else{
				if(arrayOrdenesPlanificadas[0].lugdestino == "CD CAMPOY"){
					if(cita != undefined){
						texto = "Se ha generado el número de cita " + cita;
					}else{
						texto = "Se ha modificado la fecha de cita " ;
					}
				}else{
					if(cita != undefined){
						texto = "Se ha generado el documento con exito";
					}else{
						texto = "Se ha modificado el documento con exito" ;
					}
					
				}
				arrayOrdenes = arrayOrdenesPlanificadas;
			}
			sap.m.MessageBox.success(texto, {
				title: "Mensaje de éxito",
				actions: ["OK"],
				onClose: function (sActionClicked) {
					if (sActionClicked === "OK") {
						// that.refreshDataMain();
						if(context!= undefined){
							context.byId("DialogMant").close();
							context.byId("DialogConfirmarCentro").close();
							var oView = context.getView();
						}

						//generar pdf's con listaGeneral: inicio -------------------------------------------
						
						// var data = that.getData();
						var data = [];
						var listaGeneral = [];
						data = [
							{
								"Mandt":"",
								"Zcita":"1",
								"Zseqnr":"000000",
								"Zvbeln":"180128030",
								"Zvgpos":"000000",
								"Zbukrs":"1000",
								"Zbolnr":"15-2480-00000002",
								"Zplaca":"",
								"Zdni":"",
								"Zdni2":"",
								"Zdni3":"",
								"Zdni4":"",
								"Zlfdat":"18.07.2020",
								"Zlfuhr":"PT00H00M00S",
								"Zwerks":"",
								"Zgort":"BVN-LIMA",
								"ZzlugEnt":"CD CAMPOY",
								"Zdireccion":"Av. Principal Mza. C Lote 3 Urb. Campoy 2 Etapa SAN JUAN DE LURIGANCHO Lim",
								"Zzona":"",
								"Zanzpk":"12",
								"Zbtgew":"290.000",
								"ZvhilmKu":"",
								"ZbrgewB":"290.000",
								"Zvegr1":"",
								"Zvegr2":"",
								"Zbezei":"BOTELLA",
								"Zlaeng":"12.000",
								"Zbreit":"12.000",
								"Zhoehe":"12.000",
								"Zebeln":"3100031287",
								"ZsmtpAddr":"",
								"ZnameText":"Deybi José López Uzcategui",
								"Zmatnr":"2000041778",
								"Zmaktx":"BOLT FOR CHEEK PLATE TRIO17005432 TRIO",
								"Zvemng":"100.00",
								"Zgewei":"",
								"ZbrgewM":"0.000",
								"Zecri":"REGULAR",
								"Zobservacion":"",
								"Zlifnr":"",
								"Zname1":"FERRETERIA FIGALLO SRL",
								"Zunmed":"UND",
								"ZcitaF":"",
								"ZvbelnF":"",
								"Zzlfstk":"",
								"Zul_aufl":"12.000",
								"Zlgort":"",
								"Zlgobe":"Tran Lima",
								"Ztotal_emb":"12.000",
								"Msg":"No existen datos.",
								"Xhupf":""
							}
						]
						listaGeneral = [
							{
								"Mandt":"",
								"Zcita":"1",
								"Zseqnr":"000000",
								"Zvbeln":"180128030",
								"Zvgpos":"000000",
								"Zbukrs":"1000",
								"Zbolnr":"15-2480-00000002",
								"Zplaca":"",
								"Zdni":"",
								"Zdni2":"",
								"Zdni3":"",
								"Zdni4":"",
								"Zlfdat":"18.07.2020",
								"Zlfuhr":"PT00H00M00S",
								"Zwerks":"",
								"Zgort":"BVN-LIMA",
								"ZzlugEnt":"CD CAMPOY",
								"Zdireccion":"Av. Principal Mza. C Lote 3 Urb. Campoy 2 Etapa SAN JUAN DE LURIGANCHO Lima",
								"Zzona":"",
								"Zanzpk":"12",
								"Zbtgew":"290.000",
								"ZvhilmKu":"",
								"ZbrgewB":"290.000",
								"Zvegr1":"",
								"Zvegr2":"",
								"Zbezei":"BOTELLA",
								"Zlaeng":"12.000",
								"Zbreit":"12.000",
								"Zhoehe":"12.000",
								"Zebeln":"3100031287",
								"ZsmtpAddr":"",
								"ZnameText":"Deybi José López Uzcategui",
								"Zmatnr":"2000041778",
								"Zmaktx":"BOLT FOR CHEEK PLATE TRIO17005432 TRIO",
								"Zvemng":"100.00",
								"Zgewei":"",
								"ZbrgewM":"0.000",
								"Zecri":"REGULAR",
								"Zobservacion":"",
								"Zlifnr":"",
								"Zname1":"FERRETERIA FIGALLO SRL",
								"Zunmed":"UND",
								"ZcitaF":"",
								"ZvbelnF":"",
								"Zzlfstk":"",
								"Zul_aufl":"12.000",
								"Zlgort":"",
								"Zlgobe":"Tran Lima",
								"Ztotal_emb":"12.000",
								"Msg":"No existen datos.",
								"Xhupf":""
							}
						]
						// listaGeneral.forEach(function (value, index) {
						// 	value.Zvemng = Utilities.formaterNumMiles(value.Zvemng);
						// 	data.push(value);
						// });
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
						}else{
							logo = "/webapp/images/sociedad_1000.png";
						}
						
						if (!that.getView().byId("DialogFormatQR")) {
							Fragment.load({
								id: that.getView().getId(),
								name: "com.rava.fragment.Cambios.GeneratePdfQr",
								controller: that
							}).then(function (oDialog) {
								that.getView().addDependent(oDialog);
								var ModeloProyect = that.getView().getModel("Proyect");
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
								if(arrayOrdenes[0].lugdestino == "CD CAMPOY"){
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
							var ModeloProyect = that.getView().getModel("Proyect");
							that.onPdfFormat(Data,logo,arrtext);
							// var columHeader = ModeloProyect.getProperty("/DatacolumHeader");
							var qrCitaTotal= ModeloProyect.getProperty("/DataqrCitaTotal");
							var arrCitaTotal= ModeloProyect.getProperty("/DataarrCitaTotal");
							var arrCita= ModeloProyect.getProperty("/DataarrCita");
							var arrQrBultos= ModeloProyect.getProperty("/DataarrQrBultos");
							that.getView().byId("DialogFormatQR").open();
							
							// for(var o = 0; o < columHeader.length; o++){
							// 	document.getElementById(columHeader[o]).style.borderBottom="1px solid black"
							// }
							
							var textQRCitaTotal = arrCita[0].cita
							if(arrayOrdenes[0].lugdestino == "CD CAMPOY"){
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
		onPdfFormat: function (Data,logo,arrtext) {
			var that = this;
			var oView = that.getView();
			var arrayOrdenesPendientes = JSON.parse(localStorage.getItem('arrayOrdenesPendientes'));
			var arrayOrdenesPlanificadas = JSON.parse(localStorage.getItem('arrayOrdenesPlanificadas'));
			var arrayOrdenes;
			if(arrayOrdenesPendientes.length > 0){
				arrayOrdenes = arrayOrdenesPendientes;
			}else{
				arrayOrdenes = arrayOrdenesPlanificadas;
			}
			var ModeloProyect = oView.getModel("Proyect");
			if(arrayOrdenes[0].lugdestino == "CD CAMPOY"){
				var VBoxPrincipalCita = new sap.m.VBox({width: "720px"})
				VBoxPrincipalCita.addStyleClass("VBoxPrincipal sapUiSizeCompact")
				var VBoxPrincipalCita2 = new sap.m.VBox({})
				var hCita = document.createElement("h4")
				hCita.textContent = "Resumen Planificación de Cita";
				var hcita2 = '<h4 style="text-align: center;"> Resumen Planificación de Cita </h4>'
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
			
			}
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
								// '<img src="'+logo1+'" style="float: left;" width="150px" height= "70px" >'+
								'<img src="'+logo+'" style="float: left;" width="150px" height= "70px" >'+
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
		downloadQr: function () {
			var that = this;
			var oView = that.getView();
			
			var arrayOrdenesPendientes = JSON.parse(localStorage.getItem('arrayOrdenesPendientes'));
			var arrayOrdenesPlanificadas = JSON.parse(localStorage.getItem('arrayOrdenesPlanificadas'));
			var arrayOrdenes;
			if(arrayOrdenesPendientes.length > 0){
				arrayOrdenes = arrayOrdenesPendientes;
			}else{
				arrayOrdenes = arrayOrdenesPlanificadas;
			}
			
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
				if(arrayOrdenes[0].lugdestino == "CD CAMPOY"){
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
				}else{
					nameEntrega = that.entregas[i].entrega;
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
				
				// oView.byId("total").destroyItems();
				//enviar a onbase los pdf_qr----------------------------------------------------
				that.CancelarDocQr();
				// that.sendOnBaseQR(that.entregas[0]);
			// }, tiempo)


		},
		CancelarDocQr: function () {
			var that = this;
			oView.byId("total").destroyItems();
			if(that.byId("DialogFormatQR") != undefined){
				that.byId("DialogFormatQR").close();
			}
			if(that.byId("DialogMant") != undefined){
				that.byId("DialogMant").close();
			}
			if(that.byId("DialogEntregasTemp") != undefined){
				that.byId("DialogEntregasTemp").close();
			}
			// if(that.byId("DialogSelecFechaNoProgTemp") != undefined){
			// 	that.byId("DialogSelecFechaNoProgTemp").close();
			// }
			// if(that.byId("DialogSelecFechaNoProgPlanTemp") != undefined){
			// 	that.byId("DialogSelecFechaNoProgPlanTemp").close();
			// }
			// that.fnLimpiarSelectFechaNoProg();
			that.CerrarDialogSelecFechaNoProgTemp();
			localStorage.setItem("arrayFechasDisponibles", []);
			that.CerrarDialogSeleccionarFecha();
			that.CerrarDialogSeleccionarFechaPlan();
			
			that.handleRouteMatched();
			
			sap.ui.core.BusyIndicator.hide(0);
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
		//Dialog TextoAmpliado
		DialogTextoAmpliado:function(oEvent){
			oView = this.getView();
			
			var table = oView.byId("TreeTable1");
			
			var context = oEvent.getSource().getParent().getBindingContext("Proyect").getPath(); 
			var Object = this.getView().getModel("Proyect").getProperty(context);
			
			sap.m.MessageBox.success(Object.Tdline, {
				title: "Texto Ampliado de Material",
				actions: ["OK"],
				onClose: function (sActionClicked) {
				
				}
			});
		},
		CerrarDialogAdvertencia : function (){
				var that = this ;
				
				if(Vaciar12){
				
				sap.m.MessageBox.warning("Si no tiene Embalaje , se procedera a eliminar la Entrega", {
				title	: "Mensaje de Advertencia",
				actions	: ["Aceptar","Cancelar"],
				onClose	: function (sActionClicked) {
				
				if(sActionClicked==="Aceptar"){
				// that.getView().byId("DialogoPagin1").close();
				that.EmbalarBultosM.close();
				that.OperacionEliminarEntrega();
				Vaciar12 = false ;
				}				
				}
			});
			
				}else {
					Vaciar12 = false ;
					that.EmbalarBultosM.close();
				}
			
		},
		CerrarDialog:function(){
			this.getView().byId("TextAmpliado").setText("")
			this.byId("DialogoPagin1").close();
		},
		//Dialog TextoAmpliado
		
		ValidarCamposPendientes : function (oEvent){
			that=this;
			var oView = this.getView();
			var ModeloProyect = oView.getModel("Proyect");
			var contador=0;
			var contador2=0;
			var table = oView.byId("TreeTable1");
			var context = oEvent.getParameter("rowContext");
			if(context != null){
				var object = this.getView().getModel("Proyect").getProperty(context.sPath);
				var oIndex = oEvent.getParameter('rowIndex');
			
				var Selecciones =table.getSelectedIndices();
				var selectedEntries = [];
				for(var i=0; i<Selecciones.length; i++){
					var oData = table.getContextByIndex(Selecciones[i]);
					selectedEntries.push(oData.getProperty(oData.getPath ()));
				}
				
				var oDataCond=ModeloProyect.getProperty("/DataConstanteCond");
				var oDataCentro=ModeloProyect.getProperty("/DataConstantCentro");
				
				if(Selecciones.length>1){
					// if(selectedEntries[0].entprogramadas != selectedEntries[Selecciones.length-1].entprogramadas){
		   //              table.removeSelectionInterval(oIndex,oIndex);
					// 	var i = selectedEntries.indexOf(Object);
			  //          if ( i !== -1 ) {
					//         selectedEntries.splice( i, 1 );
					//     }
					// }
					// if(selectedEntries[Selecciones.length-1] != undefined){
					// 	if(selectedEntries[0].Centro != selectedEntries[Selecciones.length-1].Centro){
		   //              table.removeSelectionInterval(oIndex,oIndex);
					// 	var i = selectedEntries.indexOf(Object);
			  //          if ( i !== -1 ) {
					//         selectedEntries.splice( i, 1 );
					//     }
					// }
					// }
					//comentado temporal por mejoras
					if(Object.keys(oDataCond).length >0){
						for(var j=0;j<Object.keys(oDataCond).length;j++){
							for(var i=0; i<selectedEntries.length; i++){
								if(oDataCond[j].DESCRIPCION == selectedEntries[i].lugdestino){
									contador++;
								}
							}
						}
						if(contador==0){
							
						}
						else if(contador != Selecciones.length){
							table.removeSelectionInterval(oIndex,oIndex);
							var i = selectedEntries.indexOf(object);
							if ( i !== -1 ) {
								selectedEntries.splice( i, 1 );
							}
						}
					}
					
					if(Object.keys(oDataCentro).length >0){
						for(var j=0;j<Object.keys(oDataCentro).length;j++){
							for(var i=0; i<selectedEntries.length; i++){
								if(oDataCentro[j].CENTRO == selectedEntries[i].Centro){
									contador2++;
								}
							}
						}
						if(contador2==0){
							
						}
						else if(contador2 != Selecciones.length){
							table.removeSelectionInterval(oIndex,oIndex);
							var i = selectedEntries.indexOf(object);
							if ( i !== -1 ) {
								selectedEntries.splice( i, 1 );
							}
						}
					}
						
					for(var i=0; i<selectedEntries.length; i++){
						if(selectedEntries[i+1] != undefined){
							if(selectedEntries[i].entprogramadas != selectedEntries[i+1].entprogramadas){
								table.removeSelectionInterval(oIndex,oIndex);
								var i = selectedEntries.indexOf(object);
								if ( i !== -1 ) {
									selectedEntries.splice( i, 1 );
								}
								break;
							}
							// if(selectedEntries[i].Centro != selectedEntries[i+1].Centro){
							// 	table.removeSelectionInterval(oIndex,oIndex);
							// 	var i = selectedEntries.indexOf(object);
							// 	if ( i !== -1 ) {
							// 		selectedEntries.splice( i, 1 );
							// 	}
							// 	break;
							// }
						}
					}
					//comentado temporal por mejoras
				}
				// console.log(selectedEntries)
				localStorage.setItem("arrayOrdenesPendientes", JSON.stringify(selectedEntries));
				if(!object.DescripcionGeneralEntrega){
					// MessageToast.show("Solo se puede seleccionar Numero de Entrega");
					table.removeSelectionInterval(oIndex,oIndex);
				}
			}
		},
		ButtonAbriFecha:function(){
			that = this;
			oView = this.getView();
			var ModeloProyect = oView.getModel("Proyect");
			ModeloProyect.setProperty("/DataConstanteContadorPen" ,8);
			var arrayOrdenesPendientes = JSON.parse(localStorage.getItem('arrayOrdenesPendientes'));
			// console.log(arrayOrdenesPendientes)
			if(arrayOrdenesPendientes[0] === undefined){
				MessageToast.show("No se ha seleccionado Numero de Entrega", {
					duration: 4000,
					my: "center center",
					at: "center center"
				});
			}else{
				
				$.ajax({
					url: "/backendhana/IPROVIDER_ENTREGA/ENTREGA_PROVEEDOR/Registro_ENTREGAPROVEEDOR.xsjs?modulo=MM&aplicativo=PLANIFICACION_ENTREGA_PORTAL&funcion=COND_ENTREGA",
					method: "GET",
					contentType: 'application/json',
					headers: {
					  Authorization: "Basic VVNSX1JBVkE6UmF2YTIwMjAk"
					},
					success: function (data) {
						var contador =0;
						// if(arrayOrdenesPendientes[0].
						// if(arrayOrdenesPendientes[0].entprogramadas == "PROGRAMADO"){
							if(Object.keys(data).length >0){
								for(var i=0;i<Object.keys(data).length;i++){
									if(data[i].DESCRIPCION == arrayOrdenesPendientes[0].lugdestino){
										contador++;
									}
								}
								
								if(arrayOrdenesPendientes[0].lugdestino == "RECOJO EN PLANTA DE PROVEEDOR" || arrayOrdenesPendientes[0].lugdestino == "PUESTO EN MINA"){
									// if(contador>0){
									// 	//Camentado Temporalmento
									// 	// that.DialogSeleccionarFechaNoProgramada();
									// 	//añadido temporalmente
									// 	that.DialogSeleccionarFechaProgramada();
									// }else{
									// 	that.DialogSeleccionarFechaProgramada();
									// }
									that.fnNoProgramadoTemp(arrayOrdenesPendientes[0].lugdestino);
								}else{
									that.DialogSeleccionarFechaProgramada();
								}
								
								
							}else{
								// that.DialogSeleccionarFechaProgramada();
								if(arrayOrdenesPendientes[0].lugdestino == "RECOJO EN PLANTA DE PROVEEDOR" || arrayOrdenesPendientes[0].lugdestino == "PUESTO EN MINA"){
									that.fnNoProgramadoTemp(arrayOrdenesPendientes[0].lugdestino);
								}else{
									that.DialogSeleccionarFechaProgramada();
								}
							}
						// }else if(arrayOrdenesPendientes[0].entprogramadas == "NO PROGRAMADO"){
						// 	// that.DialogSeleccionarFechaNoProgramada();
						// 	//añadido temporalmente
						// 	that.DialogSeleccionarFechaProgramada();
						// }
					},
					error: function (e) {
						console.log("Ocurrio un error" + JSON.parse(e))
					}
				  });
				
			}
		},
		
		//DialogSeleccionarFechaNoProgramada mas get tableFecha
		DialogSeleccionarFechaNoProgramada:function(lugdestino){
			that = this;
			var ModeloProyect = oView.getModel("Proyect");
			var arrayOrdenesPendientes = JSON.parse(localStorage.getItem('arrayOrdenesPendientes'));
			// console.log(arrayOrdenesPendientes)
			var fechas=[];
			var fecha_max;
			var fecha_min;
			var dateActual=new Date();
			fechas.push(dateActual.getTime());
			for(var i=0;i<arrayOrdenesPendientes.length;i++){
				var fecha= this.formatCell2(arrayOrdenesPendientes[i].fecha);
				var hora= this.formatCellAbapHours(arrayOrdenesPendientes[i].hora);
				// var fechaarray = fecha + " " + hora;
				var fechaarray = fecha ;
				if(arrayOrdenesPendientes.length > 1){
					var newfechaarray =  fecha.split(".")[2] + "/" + fecha.split(".")[1] + "/"+fecha.split(".")[0] + " " + hora
					var date= (new Date(newfechaarray)).getTime();
					fechas.push(date)
				}else{
					fecha_max = "";
					fecha_min = dateActual.getTime();;
				}
			}
			
			if(fechas.length>0){
				var max = Math.max(...fechas);
				var min = Math.min(...fechas);
				if(max == min ){
					fecha_max = "";
					fecha_min = this.formatCell3("/Date("+fechas[0]+")/");
				}else{
					// fecha_max = this.formatCell3("/Date("+max+")/");
					fecha_max=""
					fecha_min = this.formatCell3("/Date("+fechas[0]+")/");
				}
			}else{
				fecha_max = "";
				fecha_min = this.formatCell3("/Date("+fechas[0]+")/");
			}
			ModeloProyect.setProperty("/FechaArraFechaPenInicio",fechas);
			
			if (!oView.byId("DialogSelecFechaNoProg")) {
				Fragment.load({
					id: oView.getId(),
					name: "com.rava.fragment.SelecFechaNoProg",
					controller: that
				}).then(function (oDialog) {
					oView.byId("fecharangoInicialNoProg").setValue(fecha_min)
					oView.byId("fecharangoFinalNoProg").setValue(fecha_max)
					oView.byId("nEntregaNoProg").setValue(arrayOrdenesPendientes.length)
					oView.addDependent(oDialog);
					oDialog.open();
					that.InsertRangoFechas(lugdestino);
				});
			} else {
				oView.byId("fecharangoInicialNoProg").setValue(fecha_min)
				oView.byId("fecharangoFinalNoProg").setValue(fecha_max)
				oView.byId("nEntregaNoProg").setValue(arrayOrdenesPendientes.length)
				oView.byId("DialogSelecFechaNoProg").open();
				that.InsertRangoFechas(lugdestino);
			}
			
		},
		InsertRangoFechas:function(lugdestino){
			that=this;
			oView=this.getView();
			var ModeloProyect = oView.getModel("Proyect");
			var fecha_min = oView.byId("fecharangoInicialNoProg").getValue();
			var fecha_max = oView.byId("fecharangoFinalNoProg").getValue();
			var arrHorario = [];
			var arrRangoFecha = []
			
			var fechaInicio = this.formatosFilterDateRegistro2(fecha_min);
			var fechaFin    = this.formatosFilterDateRegistro2(fecha_max);
			if(fecha_max == ""){
				if(fechaInicio.getDay() == 6 || fechaInicio.getDay() == 0){
				}else{
					arrRangoFecha.push(fecha_min)
				}
			}else{
				
				while(fechaFin.getTime() >= fechaInicio.getTime()){
					var date =  this.formatosCellValidateNumbers(fechaInicio.getDate())+ '.' + this.formatosCellValidateNumbers(fechaInicio.getMonth() + 1)+'.' +fechaInicio.getFullYear()  ;
					if(fechaInicio.getDay() == 6 || fechaInicio.getDay() == 0){
					}else{
						arrRangoFecha.push(date);
					}
					fechaInicio.setDate(fechaInicio.getDate() + 1);
				}
			}
			
			if(arrRangoFecha.length<6){
				for(var a = 0; a<arrRangoFecha.length;a++){
					var obj={};
					var FECHAS = arrRangoFecha[a];
					obj.FECHAS = FECHAS;
					arrHorario.push(obj);
				}
				var data = oView.getModel("Horario").getProperty("/data");
				
				var arrHorarioTotal=[];
				for(var i=0;i<arrHorario.length;i++){
					
					for(var k=0;k<Object.keys(data).length;k++){
						var desde = parseInt(data[k].DESDE);
						var hasta = parseInt(data[k].HASTA);
						var rango_horas = hasta - desde;
						for(var l = 0;l < rango_horas ;l++){
							var obj={};
							obj.FECHAS = arrHorario[i].FECHAS
							obj.HORARIOS = that.formatosFechasHoras(desde+l);    
							if(lugdestino == "RECOJO EN PLANTA DE PROVEEDOR"){
								obj.TitleFecha = "Fecha de Recojo"
							}else{
								obj.TitleFecha = "Fecha de llegada "
							}
							arrHorarioTotal.push(obj)
						}
					}
					
				}
				ModeloProyect.setProperty("/DataFechaNoProg" ,arrHorarioTotal);
				// ModeloProyect.setProperty("/DataFechaNoProg" ,arrHorario);
				if(arrHorario.length == 0){
					MessageBox.show(
							"Solo deben seleccionarse días laborables", {
								icon: sap.m.MessageBox.Icon.INFORMATION,
								title: "",
								actions: ['OK'],
								onClose: function (sActionClicked) {}
							}
						);
				}
			}else{
				MessageToast.show("Seleccione rango de fecha menor a una semana", {
					duration: 3000,
					my: "center center",
					at: "center center"
				});
			}
			
		},
		CerrarDialogSelecFechaNoProg:function(){
			that = this;
			oView=this.getView();
			localStorage.setItem("arrayOrdenesPendientes", JSON.stringify([]));
			localStorage.setItem("arrayFechasDisponiblesNoProg", JSON.stringify([]));
			var ModeloProyect = oView.getModel("Proyect");
			this.getView().byId("idTableRegistroDisponibleNoProg").clearSelection();
			this.getView().byId("TreeTable1").clearSelection();
			oView.byId("fecharangoInicialNoProg").setValue("")
			oView.byId("fecharangoFinalNoProg").setValue("")
			oView.byId("nEntregaNoProg").setValue("")
			oView.byId("DialogSelecFechaNoProg").close();
			ModeloProyect.setProperty("/DataFechaNoProg" ,[]);
		},
		fnContinuarGuardarFechaNoProgTemp:function(){
			that = this;
			oView = this.getView();
			var fecha = JSON.parse(localStorage.getItem('arrayFechasDisponiblesNoProg'));
			if(fecha.FECHAS == undefined ){
				MessageToast.show("Seleccione Fecha", {
					duration: 4000,
					my: "center center",
					at: "center center"
				});
			}else{
				sap.m.MessageBox.confirm("¿Desea planificar la fecha?", {
					title: "Mensaje",
					actions: ["Si","Cancelar"],
					onClose: function (sActionClicked) {
						if(sActionClicked==="Si"){
							BusyIndicator.show(0);
							// that.EstructuraPostNoProg();
							that.newDialogGuiaTemp("NoProg");
						}else{
							oView.byId("idTableRegistroDisponibleNoProg").clearSelection();
						}
					}
				});
			}
		},
		//DialogSeleccionarFechaNoProgramada mas get tableFecha
		
		//DatePicker
		cambioRangoNoProg:function(){
			var fechaInicial=this.getView().byId("fecharangoInicialNoProg").getValue()
			// console.log(fechaInicial)
			if(fechaInicial == "" ){
			}else{
				var fechaInicialSplit = fechaInicial.split(".");
				var year = parseInt(fechaInicialSplit[2]);
				var mount = parseInt(fechaInicialSplit[1]);
				var day = parseInt(fechaInicialSplit[0]);
				this.getView().byId("fecharangoFinalNoProg").setMinDate(new Date(year, mount-1, day+1));
			}
		},
		eventchangeFechaFinalNoProg:function(){
			var dateActual=new Date()
			var anioActual=dateActual.getFullYear();
			var fechaInicial=this.getView().byId("fecharangoInicialNoProg").getValue();
			var diaValInicio=fechaInicial.split(".")[0];
			var mesValInicio=fechaInicial.split(".")[1];
			var anioValInicio=fechaInicial.split(".")[2];
			var fechaInicialDate = new Date( anioValInicio + "/" + mesValInicio + "/" + diaValInicio );
			
			var fechaFinal=this.getView().byId("fecharangoFinalNoProg").getValue()
			var diaValFinal=fechaFinal.split(".")[0];
			var mesValFinal=fechaFinal.split(".")[1];
			var anioValFinal=fechaFinal.split(".")[2];
			var fechaFinalDate = new Date( anioValFinal + "/" + mesValFinal + "/" + diaValFinal );
			if(fechaInicial == "" ){
				MessageToast.show("Añadir Rango Inicial", {
					duration: 4000,
					my: "center center",
					at: "center center"
				});	
			}else{
				if(fechaFinal != ""){
					if( diaValFinal!=undefined && mesValFinal!=undefined && anioValFinal!=undefined && (parseInt(anioValFinal)>=parseInt(anioActual)) ){
						if(fechaInicialDate.getTime() <= fechaFinalDate.getTime()){
							this.InsertRangoFechas()
						}else{
							MessageBox.show("La fecha final es menor a la fecha inicial", {
									icon: sap.m.MessageBox.Icon.INFORMATION,
									title: "",
									actions: ['OK'],
									onClose: function (sActionClicked) {}
								}
							);
						}
					}else{
						MessageToast.show("Formato Incorrecto: DD.MM.YYYY", {
							duration: 4000,
							my: "center center",
							at: "center center"
						});	
					}
				}else{
					if( diaValInicio!=undefined && mesValInicio!=undefined && anioValInicio!=undefined && (parseInt(anioValInicio)>=parseInt(anioActual)) ){
						this.InsertRangoFechas()
					}else{
						MessageToast.show("Formato Inicial Incorrecto: DD.MM.YYYY", {
							duration: 4000,
							my: "center center",
							at: "center center"
						});	
					}
				}
			}
		},
		cambioRangoInicialNoProg:function(){
			var arrayOrdenesPendientes = JSON.parse(localStorage.getItem('arrayOrdenesPendientes'));
			// console.log(arrayOrdenesPendientes)
			var fechas=[];
			var fecha_max;
			var fecha_min;
			for(var i=0;i<arrayOrdenesPendientes.length;i++){
				var fecha= this.formatCell2(arrayOrdenesPendientes[i].fecha);
				var hora= this.formatCellAbapHours(arrayOrdenesPendientes[i].hora);
				var fechaarray = fecha + " " + hora;
				if(arrayOrdenesPendientes.length > 1){
					var newfechaarray =  fecha.split(".")[2] + "/" + fecha.split(".")[1] + "/"+fecha.split(".")[0] + " " + hora
					var date= (new Date(newfechaarray)).getTime();
					fechas.push(date)
					// console.log("mas de uno")
				}else{
					fecha_max = "";
					fecha_min = fecha;
				}
			}
			if(fechas.length>0){
				var max = Math.max(...fechas);
				var min = Math.min(...fechas);
				
				if(max == min ){
					fecha_max = "";
					fecha_min = this.formatCell3("/Date("+min+")/");
				}else{
					fecha_max = this.formatCell3("/Date("+max+")/");
					fecha_min = this.formatCell3("/Date("+min+")/");
				}
				
			}else{
				fecha_max = "";
			}
			
			var fechaFinal=this.getView().byId("fecharangoFinalNoProg").getValue();
			var fechaInicial=fecha_min;
			// console.log(fechaInicial)
			if(fechaFinal == "" ){
				var fechaInicialSplit = fechaInicial.split(".");
				var year0 = parseInt(fechaInicialSplit[2]);
				var mount0 = parseInt(fechaInicialSplit[1]);
				var day0 = parseInt(fechaInicialSplit[0]);
				this.getView().byId("fecharangoInicialNoProg").setMinDate(new Date(year0, mount0-1, day0));
			}else{
				var fechaFinalSplit = fechaFinal.split(".");
				var year = parseInt(fechaFinalSplit[2]);
				var mount = parseInt(fechaFinalSplit[1]);
				var day = parseInt(fechaFinalSplit[0]);
				this.getView().byId("fecharangoInicialNoProg").setMaxDate(new Date(year, mount-1, day-1));
				
				var fechaInicialSplit = fechaInicial.split(".");
				var year0 = parseInt(fechaInicialSplit[2]);
				var mount0 = parseInt(fechaInicialSplit[1]);
				var day0 = parseInt(fechaInicialSplit[0]);
				this.getView().byId("fecharangoInicialNoProg").setMinDate(new Date(year0, mount0-1, day0));
			}
		},
		eventchangeFechainicialNoProg:function(){
			var ModeloProyect = oView.getModel("Proyect");
			var fechaInicial2 = ModeloProyect.getProperty("/FechaArraFechaPenInicio");
			
			var fechaInicial=this.getView().byId("fecharangoInicialNoProg").getValue()
			var dateActual=new Date()
			var anioActual=dateActual.getFullYear()
			var diaValidation=fechaInicial.split(".")[0];
			var mesValidation=fechaInicial.split(".")[1];
			var anioValidation=fechaInicial.split(".")[2];
			var fechaTotalInicial = new Date( anioValidation + "/" + mesValidation + "/" + diaValidation).getTime();
			
			var fechaFinal=this.getView().byId("fecharangoFinalNoProg").getValue();
			var diaValFinal=fechaFinal.split(".")[0];
			var mesValFinal=fechaFinal.split(".")[1];
			var anioValFinal=fechaFinal.split(".")[2];
			
			if(fechaInicial == ""){
				MessageToast.show("Ingresar Fecha", {
					duration: 4000,
					my: "center center",
					at: "center center"
				});
			}else{
				if(fechaFinal != ""){
					if(diaValFinal != undefined && mesValFinal != undefined && anioValFinal != undefined && (parseInt(anioValFinal)>=parseInt(anioActual))){
						if(diaValidation != undefined && mesValidation != undefined && anioValidation != undefined && (parseInt(anioValidation)>=parseInt(anioActual))){
							this.InsertRangoFechas()
						}else{
							MessageToast.show("Formato Incorrecto: DD.MM.YYYY", {
								duration: 4000,
								my: "center center",
								at: "center center"
							});	
						}
					}else{
						MessageToast.show("Formato Final Incorrecto: DD.MM.YYYY", {
								duration: 4000,
								my: "center center",
								at: "center center"
							});	
					}
				}else{
					if(diaValidation != undefined && mesValidation != undefined && anioValidation != undefined && (parseInt(anioValidation)>=parseInt(anioActual))){
						if(fechaTotalInicial>=fechaInicial2[0]){
							this.InsertRangoFechas()
						}else{
							MessageToast.show("Seleccion de fecha incorrecta", {
								duration: 4000,
								my: "center center",
								at: "center center"
							});	
						}
					}else{
						MessageToast.show("Formato Incorrecto: DD.MM.YYYY", {
							duration: 4000,
							my: "center center",
							at: "center center"
						});	
					}
				}
			}
		},
		//DatePicker
		ValidarCamposFechaNoProg:function(oEvent){
			var oView = this.getView();
			var table = oView.byId("idTableRegistroDisponibleNoProg");
			var indece = table.getSelectedIndex()
			var context = oEvent.getParameter("rowContext");
			var context2 = "/DataFechaNoProg/"+indece.toString();
			var Object;
			if(context != null){
				var oIndex = oEvent.getParameter('rowIndex');
				var Selecciones =table.getSelectedIndices();
				Object = this.getView().getModel("Proyect").getProperty(context2);
				if(Object != undefined){
					if(Selecciones.length==0){
						localStorage.setItem("arrayFechasDisponiblesNoProg", JSON.stringify([]));
					}else if(Selecciones.length==1){
						localStorage.setItem("arrayFechasDisponiblesNoProg", JSON.stringify(Object));
					}else{
						table.removeSelectionInterval(oIndex,oIndex);
					}
				}else{
					if(Selecciones.length==0){
						localStorage.setItem("arrayFechasDisponiblesNoProg", JSON.stringify([]));
						table.removeSelectionInterval(oIndex,oIndex);
					}else if(Selecciones.length==1){
						table.removeSelectionInterval(oIndex,oIndex);
					}else{
						table.removeSelectionInterval(oIndex,oIndex);
					}
				}
				
			}else{
				localStorage.setItem("arrayFechasDisponiblesNoProg", JSON.stringify([]));
			}
			//console.log(localStorage.getItem("arrayFechasDisponiblesNoProg"))
		},
		GuardarFechaNoProg:function(){
			that = this;
			oView = this.getView();
			var fecha = JSON.parse(localStorage.getItem('arrayFechasDisponiblesNoProg'));
			if(fecha.FECHAS == undefined ){
				MessageToast.show("Seleccione Fecha", {
					duration: 4000,
					my: "center center",
					at: "center center"
				});
			}else{
				sap.m.MessageBox.confirm("¿Desea planificar la fecha?", {
					title: "Mensaje",
					actions: ["Si","Cancelar"],
					onClose: function (sActionClicked) {
						if(sActionClicked==="Si"){
							BusyIndicator.show(0);
							that.EstructuraPostNoProg();
						}else{
							oView.byId("idTableRegistroDisponibleNoProg").clearSelection();
						}
					}
				});
			}
		},
		EstructuraPostNoProg:function(){
			var arrayOrdenesPendientes = JSON.parse(localStorage.getItem('arrayOrdenesPendientes'));
			var fecha = JSON.parse(localStorage.getItem('arrayFechasDisponiblesNoProg'));
			var arr = [];
			var vbeln;
			for(var i=0;i<arrayOrdenesPendientes.length;i++){
				vbeln = arrayOrdenesPendientes[i].DescripcionGeneralEntrega
				var objSap = {
					  "Vbeln": vbeln,
					  "Lfdat": this.formatAbapDate(fecha.FECHAS),
					  "Lfuhr": this.formatAbapHours("00:00:00"),
					}
				arr.push(objSap)
			}
			var objEnvioSap = {
			  "Planificar": "X",
			  "ItemSet": arr,
			  "NAVRESULT": [
			    {"Vbeln": "",
			      "Codigo": "",
			      "Mensaje": ""
			    }
			  ]
			};
			this.CerrarDialogSelecFechaNoProg()
			this.methodPostSap(objEnvioSap,"/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_PLANIFICAR_ENT_SRV","/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_PLANIFICAR_ENT_SRV/ZetPlanificarSet","DialogSelecFechaNoProg","2","","","",objEnvioSap.ItemSet.length);
			// this.methodPostSap(objEnvioSap,"/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_MODIFICAR_ENT_SRV","/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_MODIFICAR_ENT_SRV/ZETMODENTREGASet","DialogSelecFechaNoProg","0");
		
			BusyIndicator.hide();
		},
		
		//DialogSeleccionarFechaProgramada mas get tableFecha
		CerrarDialogSeleccionarFecha : function (){
			oView=this.getView();
			arrInsert=[]
			localStorage.setItem("arrayOrdenesPendientes", JSON.stringify([]));
			localStorage.setItem("arrayFechasDisponibles", JSON.stringify([]));
			var ModeloProyect = oView.getModel("Proyect");
			if(this.getView().byId("idTableRegistroDisponible") != undefined){
				this.getView().byId("idTableRegistroDisponible").clearSelection();
			}
			
			
			this.getView().byId("TreeTable1").clearSelection();
			if(oView.byId("fecharangoInicial")!=undefined){
				oView.byId("fecharangoInicial").setValue("")
				oView.byId("fecharangoFinal").setValue("")
				oView.byId("nEntrega").setValue("")
			}
			
			if(oView.byId("DialogSelecFechaProg")!= undefined){
				oView.byId("DialogSelecFechaProg").close();
			}
			ModeloProyect.setProperty("/DataFecha" ,[]);
		},
		DialogSeleccionarFechaProgramada : function (){
			// BusyIndicator.show();
			that = this;
			var ModeloProyect = oView.getModel("Proyect");
			var arrcontador =[];
			var arrayOrdenesPendientes = JSON.parse(localStorage.getItem('arrayOrdenesPendientes'));
			// console.log(arrayOrdenesPendientes)
			var fechas=[];
			var fecha_max="";
			var fecha_min="";
			if(arrayOrdenesPendientes[0] === undefined){
				MessageToast.show("No se ha seleccionado Numero de Entrega", {
					duration: 4000,
					my: "center center",
					at: "center center"
				});
			}else{
				var dateActual=new Date();
				fechas.push(dateActual.getTime());
				
				for(var i=0;i<arrayOrdenesPendientes.length;i++){
					var fecha= this.formatCell(arrayOrdenesPendientes[i].fecha);
					var hora= this.formatCellAbapHours(arrayOrdenesPendientes[i].hora);
					// var fechaarray = fecha + " " + hora;
					var fechaarray = fecha ;
					if(arrayOrdenesPendientes.length > 1){
						// var newfechaarray =  fecha.split(".")[2] + "/" + fecha.split(".")[1] + "/"+fecha.split(".")[0] + " " + hora
						var newfechaarray =  fecha.split(".")[2] + "/" + fecha.split(".")[1] + "/"+fecha.split(".")[0];
						var date= (new Date(newfechaarray)).getTime();
						fechas.push(date);
					}else{
						fecha_max = "";
						fecha_min = dateActual.getTime();
					}
				}
				
				if(fechas.length>1){
					var max = Math.max(...fechas);
					var min = Math.min(...fechas);
					if(max == min ){
						fecha_max = "";
						fecha_min = this.formatCell3("/Date("+fechas[0]+")/");
					}else{
						// fecha_max = this.formatCell3("/Date("+max+")/");
						fecha_max=""
						fecha_min = this.formatCell3("/Date("+fechas[0]+")/");
					}
				}else{
					fecha_max = "";
					fecha_min = this.formatCell3("/Date("+fechas[0]+")/");
				}
				
				ModeloProyect.setProperty("/FechaArraFechaPen",fechas);
				
				if (!oView.byId("DialogSelecFechaProg")) {
					Fragment.load({
						id: oView.getId(),
						name: "com.rava.fragment.SelecFechaProg",
						controller: that
					}).then(function (oDialog) {
						oView.byId("fecharangoInicial").setValue(fecha_min)
						oView.byId("fecharangoFinal").setValue(fecha_max)
						oView.byId("nEntrega").setValue(arrayOrdenesPendientes.length)
						oView.addDependent(oDialog);
						oDialog.open();
						// that.getFilterConstant("MM","PLANIFICACION_ENTREGA_PORTAL","HORARIO");
						that.getFilterConstantCentro("MM","PLANIFICACION_ENTREGA_PORTAL","CENTRO",arrcontador);
					});
				} else {
					oView.byId("fecharangoInicial").setValue(fecha_min)
					oView.byId("fecharangoFinal").setValue(fecha_max)
					oView.byId("nEntrega").setValue(arrayOrdenesPendientes.length)
					oView.byId("DialogSelecFechaProg").open();
					// that.getFilterTableFecha(fecha_min,fecha_max);
					// that.getFilterConstant("MM","PLANIFICACION_ENTREGA_PORTAL","HORARIO",fecha_min,fecha_max);
				
					that.getFilterConstantCentro("MM","PLANIFICACION_ENTREGA_PORTAL","CENTRO",arrcontador);
				}
			}
		},
		getFilterConstantCentro:function(modulo,aplicativo,funcion,arrcontador){
			BusyIndicator.show();
			that=this;
			oView=this.getView();
			
			var extra =1;
			var arrayOrdenesPendientes = JSON.parse(localStorage.getItem('arrayOrdenesPendientes'));
			var arrCentro=[];
			arrCentro = arrayOrdenesPendientes;
			var cant = arrCentro.length;
			const myObj = {}
			
			for ( var i=0, len=arrCentro.length; i < len; i++ )
		    myObj[arrCentro[i]['Centro']] = arrCentro[i].Centro;
			
			arrCentro = new Array();
			for ( var key in myObj )
			arrCentro.push(myObj[key]);
			
			var ModeloProyect = oView.getModel("Proyect");
			var contador=0;
			$.ajax({
				url: "/backendhana/IPROVIDER_ENTREGA/ENTREGA_PROVEEDOR/Registro_ENTREGAPROVEEDOR_centro.xsjs?modulo="+modulo+"&aplicativo="+aplicativo+"&funcion="+funcion,
				method: "GET",
				contentType: 'application/json',
				headers: {Authorization: "Basic VVNSX1JBVkE6UmF2YTIwMjAk"},
				success: function (data) {
					if(Object.keys(data).length >0){
						for(var i=0;i<Object.keys(data).length;i++){
							for(var j=0;j<arrayOrdenesPendientes.length;j++){
								if(data[i].CENTRO == arrayOrdenesPendientes[j].Centro){
									contador++;
								}
							}
						}
					}
					
					
					if(contador==0){
						ModeloProyect.setProperty("/DataConstanteCentro" ,arrCentro);
						that.getFilterConstant("MM","PLANIFICACION_ENTREGA_PORTAL","HORARIO",arrcontador,extra);
					}else{
						for(var i=0;i<Object.keys(data).length;i++){
							arrCentro.push(data[i].CENTRO)
						}
						
						var cant = arrCentro.length;
						const myObj = {}
						
						for ( var i=0, len=arrCentro.length; i < len; i++ )
						    myObj[arrCentro[i]] = arrCentro[i];
							
						arrCentro = new Array();
						for ( var key in myObj )
						arrCentro.push(myObj[key]);
						
						ModeloProyect.setProperty("/DataConstanteCentro" ,arrCentro);
						that.getFilterConstant("MM","PLANIFICACION_ENTREGA_PORTAL","HORARIO",arrcontador,extra);
					}
					
				},
				error: function (e){console.log("Ocurrio un error" + JSON.parse(e))}
			  });
		},
		getFilterConstant:function(modulo,aplicativo,funcion,arrcontador,extra){
			that=this;
			oView=this.getView();
			
			var ModeloProyect = oView.getModel("Proyect");
			var oJsonModel = new sap.ui.model.json.JSONModel();
			var contador=ModeloProyect.getProperty("/DataConstanteContadorPen");
			
			var fecha_rangfin;
			var fecha_rangini;
			var rangoFecha=ModeloProyect.getProperty("/FechaArraFechaPen");
			if(rangoFecha.length>1){
				var max = Math.max(...rangoFecha);
				var min = Math.min(...rangoFecha);
				if(max == min ){
					fecha_rangfin = "";
					fecha_rangini = this.formatCell3("/Date("+rangoFecha[0]+")/");
				}else{
					fecha_rangfin = this.formatCell2("/Date("+max+")/");
					fecha_rangini = this.formatCell3("/Date("+rangoFecha[0]+")/");
				}
			}else{
				fecha_rangfin = "";
				fecha_rangini = this.formatCell3("/Date("+rangoFecha[0]+")/");
			}
			
			var dateActual=new Date(rangoFecha[0]);
			var fechaDateActual= dateActual.getFullYear()+"/"+
					that.formatosCellValidateNumbers(dateActual.getMonth()+1)+"/"+
					that.formatosCellValidateNumbers(dateActual.getDate())+" "+
					dateActual.getHours()+ ":" +
					dateActual.getMinutes()+":"+
					dateActual.getSeconds()
			
			var fechaDateActual2= that.formatosCellValidateNumbers(dateActual.getDate())+"."+
					that.formatosCellValidateNumbers(dateActual.getMonth()+1)+"."+
					dateActual.getFullYear();
					
			var fecha_min = oView.byId("fecharangoInicial").getValue();
			var fecha_max = oView.byId("fecharangoFinal").getValue();
			var arrHorario = [];
			var arrRangoFecha = []
			if(fecha_max == ""){
				arrRangoFecha.push(fecha_min);
			}else{
				var fechaInicio = this.formatosFilterDateRegistro(fecha_min);
				var fechaFin    = this.formatosFilterDateRegistro(fecha_max);
				
				while(fechaFin.getTime() >= fechaInicio.getTime()){
					fechaInicio.setDate(fechaInicio.getDate() + 1);
					var date =  fechaInicio.getDate()+ '.' + (fechaInicio.getMonth() + 1)+'.' +fechaInicio.getFullYear()  ;
					arrRangoFecha.push(date);
				}
			}
			var dataStandar =new Date(fechaDateActual)
			dataStandar=that.formatosCellValidateNumbers(dataStandar.getDate())+"."+
					that.formatosCellValidateNumbers(dataStandar.getMonth()+1)+"."+
					dataStandar.getFullYear();
			
			var fechadiaSemana=new Date(this.formatosFilterDateRegistro2(fecha_min));		
			ModeloProyect.setProperty("/DataConstanteHorarioValidatePen" ,dataStandar);
			
			if(fechadiaSemana.getDay() == 6 || fechadiaSemana.getDay() == 0){
				extra++;
			}
			// else{
			// 	extra=1
			// }
			
			if(arrRangoFecha.length<7){
				$.ajax({
				url: "/backendhana/IPROVIDER_ENTREGA/ENTREGA_PROVEEDOR/Registro_ENTREGAPROVEEDOR.xsjs?modulo="+modulo+"&aplicativo="+aplicativo+"&funcion="+funcion,
				method: "GET",
				contentType: 'application/json',
				headers: {
				  Authorization: "Basic VVNSX1JBVkE6UmF2YTIwMjAk"
				},
				success: function (data) {
					var primero = true;
					for(var a = 0; a<arrRangoFecha.length;a++){
						var FECHAS = arrRangoFecha[a];
						for(var i=0;i<Object.keys(data).length;i++){
							var desde = parseInt(data[i].DESDE);
							var hasta = parseInt(data[i].HASTA);
							var nEntregas = data[i].NUMERO_ENTREGA;
							var cantProveedores = data[i].CONTADOR;
							var rango_horas = hasta - desde;
							for(var k = 0;k < rango_horas ;k++){
								var obj={};
								obj.NUMERO_ENTREGA = nEntregas;
								obj.FECHAS = FECHAS;
								obj.STATUS = "No Disponible";
								obj.HORARIOS = that.formatosFechasHoras(desde+k);
								obj.PROVEEDORES = cantProveedores;
								var fechacompobj=obj.FECHAS.split(".")[2] + "/" + obj.FECHAS.split(".")[1] + "/"+obj.FECHAS.split(".")[0]+" "+obj.HORARIOS;
								if(fechadiaSemana.getDay() == 6 || fechadiaSemana.getDay() == 0){
									primero = false;
									arrHorario=[];
								}else{
									if( ( new Date(fechaDateActual2.split(".")[2]+"/"+ fechaDateActual2.split(".")[1] +"/"+fechaDateActual2.split(".")[0]).getTime()+ extra * 24  * 60  * 60 * 1000) == new Date(obj.FECHAS.split(".")[2] + "/" + obj.FECHAS.split(".")[1] + "/"+obj.FECHAS.split(".")[0]).getTime() ){
										primero = false;
									}	
									if(	dateActual.getTime() <= new Date(fechacompobj).getTime() ){
										arrHorario.push(obj);
									}
								}
							}
						}
					}
					
					console.log(arrHorario)
					
					var fechavalidate=new Date(fechaDateActual);
					fechavalidate=that.formatosCellValidateNumbers(fechavalidate.getDate())+"."+
					that.formatosCellValidateNumbers(fechavalidate.getMonth()+1)+"."+
					fechavalidate.getFullYear();
					
					if(arrHorario.length >contador){
						if(fecha_max == ""){
							for(var i=0;i<contador;i++){
								arrHorario.shift();
							} 
							ModeloProyect.setProperty("/DataConstante" ,arrHorario);
							that.getFilterTableFechaWhere();
						}else{
							var cant = arrHorario.length;
							const myObj = {}
							
							for ( var i=0, len=arrHorario.length; i < len; i++ )
						    myObj[arrHorario[i]['FECHAS']] = arrHorario[i].FECHAS;
							
							var arrHorario2 = new Array();
							for ( var key in myObj )
							arrHorario2.push(myObj[key]);
							var contador2 =contador*(arrHorario2.length)
							if(contador==8 && fecha_min!=(fechavalidate)){
								ModeloProyect.setProperty("/DataConstante" ,arrHorario);
								that.getFilterTableFechaWhere();
							}else if(fecha_min==fechavalidate ) {
								contador = contador2-arrHorario.length;
								ModeloProyect.setProperty("/DataConstanteContadorPen" ,contador);
								arrcontador.push(contador)
								ModeloProyect.setProperty("/DataConstanteContadorRecuertoPen" ,arrcontador);
								var nuevaFecha=(arrHorario[0].FECHAS).split(".");
								var newdia=nuevaFecha[0];
								var newmes=nuevaFecha[1];
								var newanio=nuevaFecha[2];
								var newFecha=new Date( (new Date(newanio+"/"+newmes+"/"+newdia)).getTime()+(1 *24  * 60  * 60 * 1000) );
								newFecha = that.formatosCellValidateNumbers( newFecha.getDate() )+"."+
								that.formatosCellValidateNumbers( (newFecha.getMonth()+1) )+"."+
								newFecha.getFullYear() ;
								
								ModeloProyect.setProperty("/DataConstanteFechaInicialPen" ,newFecha);
								oView.byId("fecharangoInicial").setValue(newFecha)
								that.getFilterConstant("MM","PLANIFICACION_ENTREGA_PORTAL","CENTRO",arrcontador,extra);
							}else{
								for(var i=0;i<contador;i++){
									arrHorario.shift();
								} 
								ModeloProyect.setProperty("/DataConstante" ,arrHorario);
								that.getFilterTableFechaWhere();
							}
						}
					}else if(arrHorario.length==6 && contador==8 && fecha_min!=(fechavalidate) && primero){
						ModeloProyect.setProperty("/DataConstante" ,arrHorario);
						that.getFilterTableFechaWhere();
					}else{
						contador = contador - arrHorario.length;
						ModeloProyect.setProperty("/DataConstanteContadorPen" ,contador);
						arrcontador.push(contador)
						ModeloProyect.setProperty("/DataConstanteContadorRecuertoPen" ,arrcontador);
						var nuevaFecha=(fecha_min).split(".");
						var newdia=nuevaFecha[0];
						var newmes=nuevaFecha[1];
						var newanio=nuevaFecha[2];
						
						var newFecha=new Date( (new Date(newanio+"/"+newmes+"/"+newdia)).getTime()+(1 *24  * 60  * 60 * 1000) );
						newFecha = that.formatosCellValidateNumbers( newFecha.getDate() )+"."+
						that.formatosCellValidateNumbers( (newFecha.getMonth()+1) )+"."+
						newFecha.getFullYear() ;
						
						ModeloProyect.setProperty("/DataConstanteFechaInicialPen" ,newFecha);
						oView.byId("fecharangoInicial").setValue(newFecha)
						that.getFilterConstant("MM","PLANIFICACION_ENTREGA_PORTAL","HORARIO",arrcontador,extra);
					}
				},
				error: function (e) {
					console.log("Ocurrio un error" + JSON.parse(e))
				}
			  });
			}else{
				MessageToast.show("Seleccione rango de fecha menor a una semana", {
					duration: 3000,
					my: "center center",
					at: "center center"
				});
				BusyIndicator.hide();
			}
		},
		getFilterTableFechaWhere:function(){
			that=this;
			oView=this.getView();
			var ModeloProyect = oView.getModel("Proyect");
			var arrayOrdenesPendientes = JSON.parse(localStorage.getItem('arrayOrdenesPendientes'));
			var DataConstanteCentro=ModeloProyect.getProperty("/DataConstanteCentro");
			var dataConsta=ModeloProyect.getProperty("/DataConstante");
			// console.log(arrayOrdenesPendientes)
			
			var fecha_min=this.getView().byId("fecharangoInicial").getValue();
			var fecha_max=this.getView().byId("fecharangoFinal").getValue();
			var arr=[];
			var arrProv=[];
			var url
			// for(var i=0;i<DataConstanteCentro.length;i++){
				// url ="/backendhana/IPROVIDER_ENTREGA/REGISTRO_FECHA/RegistroFechaFiltar2.xsjs?fecha_min="+DataConstanteCentro[i]+"&fecha_min="+fecha_min+"&fecha_max="+fecha_max
				url ="/backendhana/IPROVIDER_ENTREGA/REGISTRO_FECHA/RegistroFechaTotalFiltar.xsjs?fecha_min="+fecha_min+"&fecha_max="+fecha_max
				// console.log(url)
				$.ajax({
					url: url,
					method: "POST",
					contentType: 'application/json',
					data		:JSON.stringify(DataConstanteCentro),
					headers: {Authorization: "Basic VVNSX1JBVkE6UmF2YTIwMjAk"},
					success: function (data) {
						 console.log(data)
						for(var i=0;i<Object.keys(data).length;i++){
							data[i].FECHA=(data[i].FECHA).split("T")[0]
							data[i].HORA=(data[i].HORA).split("T")[1].split(".")[0]
							arr.push(data[i]);
						}
						
						var totalEntregaRegistrados=0;
						var totalProvRegistrados = 0;
						for(var i=0;i<dataConsta.length;i++){
							var dateConst = that.formatosFilterDate(dataConsta[i].FECHAS,dataConsta[i].HORARIOS).getTime();
							dataConsta[i].STATUS = "No Disponible"
							totalEntregaRegistrados = 0;
							totalProvRegistrados = 0;
							for(var k=0;k<arr.length;k++){
								var dateFecha = new Date(arr[k].FECHA+" "+arr[k].HORA).getTime();
								if(dateConst === dateFecha){
									var entRegistrada = parseInt(arr[k].ENTREGAS_REGISTRADAS)
									var provRegistrada = 1
									totalEntregaRegistrados += entRegistrada;
									totalProvRegistrados += provRegistrada;
								}
							}
							
							if(totalEntregaRegistrados<parseInt(dataConsta[i].NUMERO_ENTREGA)){
								if(parseInt(dataConsta[i].PROVEEDORES) > totalProvRegistrados){
									dataConsta[i].STATUS = "Disponible"
								}else{
									dataConsta[i].STATUS = "No Disponible"
								}
							}else{
								dataConsta[i].STATUS = "No Disponible"
							}
							
						}
							
						for(var i=0;i<dataConsta.length;i++){
							var date = dataConsta[i].FECHAS.split(".")
							dataConsta[i].FECHAS=that.formatosCellValidateNumbers(date[0])+ "." + that.formatosCellValidateNumbers(date[1])+ "." +that.formatosCellValidateNumbers(date[2])
						}
						
						ModeloProyect.setProperty("/DataFecha" ,dataConsta);
					},
					error: function (e) {
						console.log("Ocurrio un error" + JSON.parse(e))
					}
				});
			// }
			// ModeloProyect.setProperty("/DataFecha" ,dataConsta);
			BusyIndicator.hide();
		},
		//DialogSeleccionarFechaProgramada mas get tableFecha
		
		//DatePicker final Eventos
		cambioRango:function(){
			var fechaInicial = this.getView().byId("fecharangoInicial").getValue().split(".");
			if(fechaInicial != ""){
				var year = parseInt(fechaInicial[2]);
				var mount = parseInt(fechaInicial[1]);
				var day = parseInt(fechaInicial[0]);
				this.getView().byId("fecharangoFinal").setMinDate(new Date(year, mount-1, day+1));
			}else{
				MessageToast.show("Añadir Rango Inicial", {
					duration: 4000,
					my: "center center",
					at: "center center"
				});	
			}
		},
		eventchangeFechaFinal:function(){
			var ModeloProyect = oView.getModel("Proyect");
			var contador=ModeloProyect.getProperty("/DataConstanteContadorRecuertoPen");
			var ConstanteHorarioValidate=ModeloProyect.getProperty("/DataConstanteHorarioValidatePen");
			
			var fechaInicial3=ConstanteHorarioValidate;
			var diaValidation3=fechaInicial3.split(".")[0];
			var mesValidation3=fechaInicial3.split(".")[1];
			var anioValidation3=fechaInicial3.split(".")[2];
			
			var fechaInicial2=ModeloProyect.getProperty("/DataConstanteFechaInicialPen");
			var diaValidation2=fechaInicial2.split(".")[0];
			var mesValidation2=fechaInicial2.split(".")[1];
			var anioValidation2=fechaInicial2.split(".")[2];
			
			var dateActual=new Date();
			var anioActual=dateActual.getFullYear();
			var fechaInicial=this.getView().byId("fecharangoInicial").getValue()
			var diaValidation=fechaInicial.split(".")[0];
			var mesValidation=fechaInicial.split(".")[1];
			var anioValidation=fechaInicial.split(".")[2];
			
			var fechaFinal=this.getView().byId("fecharangoFinal").getValue()
			var diaValFinal=fechaFinal.split(".")[0];
			var mesValFinal=fechaFinal.split(".")[1];
			var anioValFinal=fechaFinal.split(".")[2];
			if(fechaInicial == "" ){
				MessageToast.show("Añadir Rango Inicial", {
					duration: 4000,
					my: "center center",
					at: "center center"
				});	
			}else{
				if(fechaFinal != ""){
					if(fechaInicial != ""){
						if(diaValidation!=undefined && mesValidation!=undefined && anioValidation!=undefined && (parseInt(anioValidation)>=parseInt(anioActual))){
							if( diaValFinal!=undefined && mesValFinal!=undefined && anioValFinal!=undefined && (parseInt(anioValFinal)>=parseInt(anioActual)) ){
								var fechaValidation=new Date(anioValidation+"/"+mesValidation+"/"+diaValidation).getTime();
								var fechaValidation2=new Date(anioValidation2+"/"+mesValidation2+"/"+diaValidation2).getTime();
								var fechaValidation3=new Date(anioValidation3+"/"+mesValidation3+"/"+diaValidation3).getTime();
								var fechaFinalDate=new Date(anioValFinal+"/"+mesValFinal+"/"+diaValFinal).getTime();
								
								if(fechaValidation>fechaValidation2){
									ModeloProyect.setProperty("/DataConstanteContadorPen" ,8);
								}else if(fechaValidation == fechaValidation2){
									if(contador.length>1){
										ModeloProyect.setProperty("/DataConstanteContadorPen" ,contador[1]);
									}else{
										ModeloProyect.setProperty("/DataConstanteContadorPen" ,contador[0]);
									}
								}else if(fechaValidation == fechaValidation3){
									contador=[];
									ModeloProyect.setProperty("/DataConstanteContadorPen" ,8);
								}else{
									contador.pop();
									if(contador.length>0){
										ModeloProyect.setProperty("/DataConstanteContadorPen" ,contador[0]);
									}else{
										ModeloProyect.setProperty("/DataConstanteContadorPen" ,8);
									}
								}
								
								if(fechaValidation <=fechaFinalDate){
									this.getFilterConstantCentro("MM","PLANIFICACION_ENTREGA_PORTAL","CENTRO",contador);
								}else{
									MessageBox.show("La fecha final es menor a la fecha inicial", {
										icon: sap.m.MessageBox.Icon.INFORMATION,
										title: "",
										actions: ['OK'],
										onClose: function (sActionClicked) {}
									});
								}
							}else{
								MessageToast.show("Formato Incorrecto: DD.MM.YYYY", {
									duration: 4000,
									my: "center center",
									at: "center center"
								});	
							}
						}else{
							MessageToast.show("Formato Incorrecto: DD.MM.YYYY", {
									duration: 4000,
									my: "center center",
									at: "center center"
								});	
						}
					}else{
						if( diaValFinal!=undefined && mesValFinal!=undefined && anioValFinal!=undefined && (parseInt(anioValFinal)>=parseInt(anioActual)) ){
							var fechaValidation=new Date(anioValidation+"/"+mesValidation+"/"+diaValidation).getTime();
							var fechaValidation2=new Date(anioValidation2+"/"+mesValidation2+"/"+diaValidation2).getTime();
							var fechaValidation3=new Date(anioValidation3+"/"+mesValidation3+"/"+diaValidation3).getTime();
							if(fechaValidation>fechaValidation2){
								ModeloProyect.setProperty("/DataConstanteContadorPen" ,8);
							}else if(fechaValidation == fechaValidation2){
								if(contador.length>1){
									ModeloProyect.setProperty("/DataConstanteContadorPen" ,contador[1]);
								}else{
									ModeloProyect.setProperty("/DataConstanteContadorPen" ,contador[0]);
								}
							}else if(fechaValidation == fechaValidation3){
								contador=[];
								ModeloProyect.setProperty("/DataConstanteContadorPen" ,8);
							}else{
								contador.pop();
								if(contador.length>0){
									ModeloProyect.setProperty("/DataConstanteContadorPen" ,contador[0]);
								}else{
									ModeloProyect.setProperty("/DataConstanteContadorPen" ,8);
								}
							}
							this.getFilterConstantCentro("MM","PLANIFICACION_ENTREGA_PORTAL","CENTRO",contador);
						}else{
							MessageToast.show("Formato Incorrecto: DD.MM.YYYY", {
								duration: 4000,
								my: "center center",
								at: "center center"
							});	
						}
					}
				}else{
					var fechaValidation=new Date(anioValidation+"/"+mesValidation+"/"+diaValidation).getTime();
					var fechaValidation2=new Date(anioValidation2+"/"+mesValidation2+"/"+diaValidation2).getTime();
					var fechaValidation3=new Date(anioValidation3+"/"+mesValidation3+"/"+diaValidation3).getTime();
					if(fechaValidation>fechaValidation2){
						ModeloProyect.setProperty("/DataConstanteContadorPen" ,8);
					}else if(fechaValidation == fechaValidation2){
						if(contador.length>1){
							ModeloProyect.setProperty("/DataConstanteContadorPen" ,contador[1]);
						}else{
							ModeloProyect.setProperty("/DataConstanteContadorPen" ,contador[0]);
						}
					}else if(fechaValidation == fechaValidation3){
						contador=[];
						ModeloProyect.setProperty("/DataConstanteContadorPen" ,8);
					}else{
						contador.pop();
						if(contador.length>0){
							ModeloProyect.setProperty("/DataConstanteContadorPen" ,contador[0]);
						}else{
							ModeloProyect.setProperty("/DataConstanteContadorPen" ,8);
						}
					}
					this.getFilterConstantCentro("MM","PLANIFICACION_ENTREGA_PORTAL","CENTRO",contador)
				}
			}
		},
		cambioRangoInicialProg:function(){
			var ModeloProyect = oView.getModel("Proyect");
			
			var rangoFecha=ModeloProyect.getProperty("/FechaArraFechaPen");
			var contador=ModeloProyect.getProperty("/DataConstanteContadorPen");
			
			var arrayOrdenesPendientes = JSON.parse(localStorage.getItem('arrayOrdenesPendientes'));
			var fechas=[];
			var fecha_max;
			var fecha_min = rangoFecha[0];
			fecha_min = this.formatCell3("/Date("+rangoFecha[0]+")/");
			
			var fechaFinal=this.getView().byId("fecharangoFinal").getValue()
			var fechaInicial2=ModeloProyect.getProperty("/DataConstanteFechaInicialPen");;
			var fechaInicial=fecha_min;
			// console.log(fechaInicial)
			if(fechaFinal == "" ){
				var fechaInicialSplit = fechaInicial.split(".");
				var year0 = parseInt(fechaInicialSplit[2]);
				var mount0 = parseInt(fechaInicialSplit[1]);
				var day0 = parseInt(fechaInicialSplit[0]);
				this.getView().byId("fecharangoInicial").setMinDate(new Date(year0, mount0-1, day0));
			}else{
				var fechaFinalSplit = fechaFinal.split(".");
				var year = parseInt(fechaFinalSplit[2]);
				var mount = parseInt(fechaFinalSplit[1]);
				var day = parseInt(fechaFinalSplit[0]);
				this.getView().byId("fecharangoInicial").setMaxDate(new Date(year, mount-1, day-1));
				
				var fechaInicialSplit = fechaInicial2.split(".");
				var year0 = parseInt(fechaInicialSplit[2]);
				var mount0 = parseInt(fechaInicialSplit[1]);
				var day0 = parseInt(fechaInicialSplit[0]);
				this.getView().byId("fecharangoInicial").setMinDate(new Date(year0, mount0-1, day0));
			}
		},
		eventchangeFechainicialProg:function(oEvent){
			var ModeloProyect = oView.getModel("Proyect");
			
			var contador=ModeloProyect.getProperty("/DataConstanteContadorRecuertoPen");
			var ConstanteHorarioValidate=ModeloProyect.getProperty("/DataConstanteHorarioValidatePen");
			
			var fechaInicial3=ConstanteHorarioValidate;
			var diaValidation3=fechaInicial3.split(".")[0];
			var mesValidation3=fechaInicial3.split(".")[1];
			var anioValidation3=fechaInicial3.split(".")[2];
			
			var fechaInicial2=ModeloProyect.getProperty("/DataConstanteFechaInicialPen");
			var diaValidation2=fechaInicial2.split(".")[0];
			var mesValidation2=fechaInicial2.split(".")[1];
			var anioValidation2=fechaInicial2.split(".")[2];
			
			var fechaFinal=this.getView().byId("fecharangoFinal").getValue();
			var fechaInicial=this.getView().byId("fecharangoInicial").getValue();
			var dateActual=new Date()
			var anioActual=dateActual.getFullYear()
			var diaValidation=fechaInicial.split(".")[0];
			var mesValidation=fechaInicial.split(".")[1];
			var anioValidation=fechaInicial.split(".")[2];
			
			var anioFin=dateActual.getFullYear();
			var diaFinVal=fechaFinal.split(".")[0];
			var mesFinVal=fechaFinal.split(".")[1];
			var anioFinVal=fechaFinal.split(".")[2];
			if(fechaInicial == ""){
				MessageToast.show("Ingresar Fecha", {
					duration: 4000,
					my: "center center",
					at: "center center"
				});
			}else{
				if(fechaFinal != ""){
					if(diaValidation != undefined && mesValidation != undefined && anioValidation != undefined && (parseInt(anioValidation)>=parseInt(anioActual))){
						if( diaFinVal != undefined && mesFinVal != undefined && anioFinVal != undefined && (parseInt(anioFinVal)>=parseInt(anioActual)) ){
							var fechaValidation=new Date(anioValidation+"/"+mesValidation+"/"+diaValidation).getTime();
							var fechaValidation2=new Date(anioValidation2+"/"+mesValidation2+"/"+diaValidation2).getTime();
							var fechaValidation3=new Date(anioValidation3+"/"+mesValidation3+"/"+diaValidation3).getTime();
							if(fechaValidation>fechaValidation2){
								ModeloProyect.setProperty("/DataConstanteContadorPen" ,8);
							}else if(fechaValidation == fechaValidation2){
								if(contador.length>1){
									ModeloProyect.setProperty("/DataConstanteContadorPen" ,contador[1]);
								}else{
									ModeloProyect.setProperty("/DataConstanteContadorPen" ,contador[0]);
								}
							}else if(fechaValidation == fechaValidation3){
								contador=[];
								ModeloProyect.setProperty("/DataConstanteContadorPen" ,8);
							}else{
								contador.pop();
								if(contador.length>0){
									ModeloProyect.setProperty("/DataConstanteContadorPen" ,contador[0]);
								}else{
									ModeloProyect.setProperty("/DataConstanteContadorPen" ,8);
								}
							}
							this.getFilterConstantCentro("MM","PLANIFICACION_ENTREGA_PORTAL","CENTRO",contador);
						}else{
							MessageToast.show("Formato Incorrecto: DD.MM.YYYY", {
								duration: 4000,
								my: "center center",
								at: "center center"
							});	
						}
					}else{
						MessageToast.show("Formato Incorrecto: DD.MM.YYYY", {
							duration: 4000,
							my: "center center",
							at: "center center"
						});	
					}
				}else{
					if(diaValidation != undefined && mesValidation != undefined && anioValidation != undefined && (parseInt(anioValidation)>=parseInt(anioActual))){
						var fechaValidation=new Date(anioValidation+"/"+mesValidation+"/"+diaValidation).getTime();
						var fechaValidation2=new Date(anioValidation2+"/"+mesValidation2+"/"+diaValidation2).getTime();
						var fechaValidation3=new Date(anioValidation3+"/"+mesValidation3+"/"+diaValidation3).getTime();
						if(fechaValidation>=fechaValidation2){
							if(fechaValidation>fechaValidation2){
								ModeloProyect.setProperty("/DataConstanteContadorPen" ,8);
							}else if(fechaValidation == fechaValidation2){
								if(contador.length>1){
									ModeloProyect.setProperty("/DataConstanteContadorPen" ,contador[1]);
								}else{
									ModeloProyect.setProperty("/DataConstanteContadorPen" ,contador[0]);
								}
							}else if(fechaValidation == fechaValidation3){
								contador=[];
								ModeloProyect.setProperty("/DataConstanteContadorPen" ,8);
							}else{
								contador.pop();
								if(contador.length>0){
									ModeloProyect.setProperty("/DataConstanteContadorPen" ,contador[0]);
								}else{
									ModeloProyect.setProperty("/DataConstanteContadorPen" ,8);
								}
							}
							this.getFilterConstantCentro("MM","PLANIFICACION_ENTREGA_PORTAL","CENTRO",contador);
						}else{
							MessageToast.show("Selección a partir de la fecha establecida: "+fechaInicial2, {
								duration: 4000,
								my: "center center",
								at: "center center"
							});	
						}
					}else{
						MessageToast.show("Formato Incorrecto: DD.MM.YYYY", {
							duration: 4000,
							my: "center center",
							at: "center center"
						});	
					}
				}
			}
		},
		//DatePicker
		
		//valida onclick en campos
		ValidarCamposFecha:function(oEvent){
			var oView = this.getView();
			var table = oView.byId("idTableRegistroDisponible");
			var indece = table.getSelectedIndex()
			var context = oEvent.getParameter("rowContext");
			var context2 = "/DataFecha/"+indece.toString();
			var Object;
			if(context != null){
				var oIndex = oEvent.getParameter('rowIndex');
				var Selecciones =table.getSelectedIndices();
				Object = this.getView().getModel("Proyect").getProperty(context2);
				if(Object != undefined){
					if(Selecciones.length==0){
						localStorage.setItem("arrayFechasDisponibles", JSON.stringify([]));
					}else if(Selecciones.length==1){
						localStorage.setItem("arrayFechasDisponibles", JSON.stringify(Object));
						if(Object.STATUS != "Disponible"){
							// MessageToast.show("Solo se puede seleccionar Numero de Entrega");
							// var newIndice = table.getSelectedIndex() + 1;
							MessageToast.show("NO ES POSIBLE SELECCIONAR, FECHA NO DISPONIBLE", {
								duration: 4000,
								my: "center center",
								at: "center center"
							});	
							table.removeSelectionInterval(oIndex,oIndex);
						}
					}else{
						table.removeSelectionInterval(oIndex,oIndex);
					}
				}else{
					if(Selecciones.length==0){
						localStorage.setItem("arrayFechasDisponibles", JSON.stringify([]));
						table.removeSelectionInterval(oIndex,oIndex);
					}else if(Selecciones.length==1){
						table.removeSelectionInterval(oIndex,oIndex);
					}else{
						table.removeSelectionInterval(oIndex,oIndex);
					}
				}
				
				
			}else{
				localStorage.setItem("arrayFechasDisponibles", JSON.stringify([]));
			}
			console.log(localStorage.getItem("arrayFechasDisponibles"))
		},
		
		CancelarGuardarRoles1: function (){
			that = this;
			oView = this.getView();
			var fecha = JSON.parse(localStorage.getItem("arrayFechasDisponibles"));
			if(fecha.FECHAS == undefined ){
				MessageToast.show("Seleccione Fecha", {
					duration: 4000,
					my: "center center",
					at: "center center"
				});
			}else{
				sap.m.MessageBox.confirm("¿Desea planificar la fecha?", {
					title: "Mensaje",
					actions: ["Si","Cancelar"],
					onClose: function (sActionClicked) {
						if(sActionClicked==="Si"){
							BusyIndicator.show(0);
							that.ValidacionDisponibilidad()
						}else{
							oView.byId("idTableRegistroDisponible").clearSelection();
						}
					}
				});
			}
		},
		ValidacionDisponibilidad: function(){
			that=this;
			oView=this.getView();
			var ModeloProyect = oView.getModel("Proyect");
			// oView.byId("idTableRegistroDisponible").clearSelection();
			
			var arrayOrdenesPendientes = JSON.parse(localStorage.getItem('arrayOrdenesPendientes'));
			var arrayFechaDisponibles = JSON.parse(localStorage.getItem('arrayFechasDisponibles'));
			
			var oDataCentro=ModeloProyect.getProperty("/DataConstantCentro");
			var arrCompleteCentro=[];
			for(var i = 0 ; i<Object.keys(oDataCentro).length ; i++){
				var obj={};
				obj.Centro= oDataCentro[i].CENTRO;
				arrCompleteCentro.push(obj);
			}
			for(var i = 0;i<arrayOrdenesPendientes.length;i++){
				var obj={};
				obj.Centro= arrayOrdenesPendientes[i].Centro;
				arrCompleteCentro.push(obj); 
			}
			
			var arrCentro=[];
			arrCentro = arrCompleteCentro;
			var cant = arrCentro.length;
			const myObj = {}
			
			for ( var i=0, len=arrCentro.length; i < len; i++ )
		    myObj[arrCentro[i]['Centro']] = arrCentro[i].Centro;
			
			arrCentro = new Array();
			for ( var key in myObj )
			arrCentro.push(myObj[key]);
			
			var arrCantCentro=[];
			for(var i=0;i<arrCentro.length;i++){
				var cantidadcentro=0;
				var obj={};
				obj.centro=arrCentro[i];
				for(var j=0;j<arrayOrdenesPendientes.length;j++){
					if(arrCentro[i] == arrayOrdenesPendientes[j].Centro){
						cantidadcentro += 1;
						obj.numero=cantidadcentro;
						
					}
				}
				arrCantCentro.push(obj)
			}
			
			for(var i=0; i<arrCantCentro.length;i++){
				for(var j=0; j<arrayOrdenesPendientes.length;j++){
					if(arrCantCentro[i].centro ==arrayOrdenesPendientes[j].Centro){
						arrayOrdenesPendientes[j].ID_Eliminar = "";
						arrayOrdenesPendientes[j].Enviar = arrCantCentro[i].numero;
					}
				}
			}
			
			if(arrayFechaDisponibles.FECHAS != undefined){
				var fechaComparativa = this.formatosFilterDate(arrayFechaDisponibles.FECHAS,arrayFechaDisponibles.HORARIOS).getTime();
				
				var proveedor = arrayOrdenesPendientes[0].Proveedor
				var codigoprov = arrayOrdenesPendientes[0].ArrayGeneral2[0].Lifnr;
				
				var centro = arrayOrdenesPendientes[0].ArrayGeneral2[0].Werks;
				
				var fecha = arrayFechaDisponibles.FECHAS;
				var horario = arrayFechaDisponibles.HORARIOS;
					var arr=[];
					
					var arratotal=[];
					// console.log(arrayOrdenesPendientes)
					// var url ="/backendhana/IPROVIDER_ENTREGA/REGISTRO_FECHA/RegistroHorarioFiltrar2.xsjs?centro="+centro+"&fecha="+fecha+"&horario="+horario
					var url ="/backendhana/IPROVIDER_ENTREGA/REGISTRO_FECHA/RegistroHorarioFiltrar3.xsjs?fecha="+fecha+"&horario="+horario
					// console.log(url)
					
					$.ajax({
						url: url,
						method: "POST",
						contentType: 'application/json',
						data		:JSON.stringify(arrCentro),
						headers: {Authorization: "Basic VVNSX1JBVkE6UmF2YTIwMjAk"},
						success: function (data) {
							var arrCentro=[];
							arrCentro = arrayOrdenesPendientes;
							var cant = arrCentro.length;
							const myObj = {}
							
							for ( var i=0, len=arrCentro.length; i < len; i++ )
						    myObj[arrCentro[i]['Centro']] = arrCentro[i].Centro;
							
							arrCentro = new Array();
							for ( var key in myObj )
							arrCentro.push(myObj[key]);
							
							var arrCantCentro=[];
							for(var i=0;i<arrCentro.length;i++){
								var cantidadcentro=0;
								var obj={};
								obj.centro=arrCentro[i];
								for(var j=0;j<arrayOrdenesPendientes.length;j++){
									if(arrCentro[i] == arrayOrdenesPendientes[j].Centro){
										cantidadcentro += 1;
										obj.numero=cantidadcentro;
										
									}
								}
								arrCantCentro.push(obj)
							}
							
							
							var objtotal={}
							var nEntregasInsertar = arrayOrdenesPendientes.length;
							if(Object.keys(data).length>0){
								for(var i=0;i<Object.keys(data).length;i++){
									data[i].FECHA=(data[i].FECHA).split("T")[0]
									data[i].HORA=(data[i].HORA).split("T")[1].split(".")[0]
									arr.push(data[i]);
								}
								
								var totalEntregaRegistrados = 0;
								for(var i=0;i<arr.length;i++){
									var dateFecha = new Date(arr[i].FECHA+" "+arr[i].HORA).getTime();
									if(fechaComparativa === dateFecha){
										var entRegistrada = parseInt(arr[i].ENTREGAS_REGISTRADAS)
										totalEntregaRegistrados += entRegistrada;
									}
								}
								
								if(totalEntregaRegistrados<parseInt(arrayFechaDisponibles.NUMERO_ENTREGA) ){
									var rangoEntregasDisponibles = parseInt(arrayFechaDisponibles.NUMERO_ENTREGA)-totalEntregaRegistrados;
									if(nEntregasInsertar<=rangoEntregasDisponibles){
										for(var i = 0;i<arr.length;i++){
											//comentado temporalmente
											// arrayOrdenesPendientes[i].Enviar = totalEntregaRegistrados+arrayOrdenesPendientes.length;
											//comentado temporalmente
											//codigo nuevo
											for(var j = 0;j<arrayOrdenesPendientes.length;j++){
												if(arr[i].CENTRO == arrayOrdenesPendientes[j].Centro){
													arrayOrdenesPendientes[j].ID_Eliminar = arr[i].ID_REGISTRO;
													arrayOrdenesPendientes[j].Enviar = arrayOrdenesPendientes[j].Enviar + parseInt(arr[i].ENTREGAS_REGISTRADAS);
												}
											}
										}
										objtotal.OrdenesPendientes = arrayOrdenesPendientes
										objtotal.FechaDisponibles = arrayFechaDisponibles
										arratotal.push(objtotal);
										that.EstructuraInsertFecha(arratotal,"PUT")
									}else{
										var cont=0;
										var arraynuevo=[]
										objtotal.FechaDisponibles = arrayFechaDisponibles
										var cantidadSumatoria=rangoEntregasDisponibles;
										// for(var j=0;j<arr.length;j++){
										// 	for(var i=0;i<rangoEntregasDisponibles;i++){
										// 		if(arr[j].CENTRO == arrayOrdenesPendientes[i].Centro){
										// 			if(cantidadSumatoria >= arrCantCentro[j].numero){
										// 				cont ++;
										// 				arrayOrdenesPendientes[i].Enviar = parseInt(arr[j].ENTREGAS_REGISTRADAS)+arrCantCentro[j].numero
										// 				arraynuevo.push(arrayOrdenesPendientes[i])
										// 			}else{
										// 				cont ++;
										// 				arrayOrdenesPendientes[i].Enviar = parseInt(arr[j].ENTREGAS_REGISTRADAS)+(arrCantCentro[j].numero-cantidadSumatoria)
										// 				arraynuevo.push(arrayOrdenesPendientes[i])
										// 			}
										// 		}
										// 	}
										// 	cantidadSumatoria=cantidadSumatoria-cont;
										// }
										for(var i=0;i<arr.length;i++){
											for(var k=0;k<arrayOrdenesPendientes.length;k++){
												if(arr[i].CENTRO == arrayOrdenesPendientes[k].Centro){
													if(cantidadSumatoria !=0){
														if(cantidadSumatoria >= arrayOrdenesPendientes[k].Enviar){
															arrayOrdenesPendientes[k].Identificador = "realizado";
															arrayOrdenesPendientes[k].Enviar += parseInt(arr[i].ENTREGAS_REGISTRADAS);
														}else{
															arrayOrdenesPendientes[k].Identificador = "realizado";
															arrayOrdenesPendientes[k].Enviar = parseInt(arr[i].ENTREGAS_REGISTRADAS)+(arrayOrdenesPendientes[k].Enviar-cantidadSumatoria)
															cantidadSumatoria--;
														}
													}
												}
											}
										}
										for(var i=0;i<arrayOrdenesPendientes.length;i++){
											if(arrayOrdenesPendientes[i].Identificador == "realizado"){
												arraynuevo.push(arrayOrdenesPendientes[i]);
											}
										}
										objtotal.OrdenesPendientes = arraynuevo
										arratotal.push(objtotal)
										for(var i=0;i<arraynuevo.length;i++){
											var index=arrayOrdenesPendientes.indexOf(arraynuevo[i])
											if (index !== -1) {
											    arrayOrdenesPendientes.splice(index, 1);
											  }
										}
										// arrayOrdenesPendientes.splice(0,cont)
										localStorage.setItem("arrayOrdenesPendientes", JSON.stringify(arrayOrdenesPendientes));
										var seleccionado = oView.byId("idTableRegistroDisponible").getSelectedIndex();
										
										var contextActual="/DataFecha/"+seleccionado.toString();
										var contextNuevo="/DataFecha/"+(seleccionado+1).toString();
										var actual= oView.getModel("Proyect").getProperty(contextActual);
										var nuevo= oView.getModel("Proyect").getProperty(contextNuevo);
										if(nuevo == undefined){
											MessageToast.show("No se pueden actualizar las ordenes", {
												duration: 4000,
												my: "center center",
												at: "center center"
											});
										}else{
											var horaactual=actual.HORARIOS.split(":")[0];
											var horanueva=nuevo.HORARIOS.split(":")[0];
											if((parseInt(horanueva)-parseInt(horaactual)) == 1){
												oView.byId("idTableRegistroDisponible").setSelectedIndex(seleccionado+1);
												that.ValidacionDisponibilidad2(arratotal)
											}else{
												MessageToast.show("No se pueden actualizar las ordenes", {
													duration: 4000,
													my: "center center",
													at: "center center"
												});
											}
										}
									}
								}
							}else{
								if(nEntregasInsertar<parseInt(arrayFechaDisponibles.NUMERO_ENTREGA) ){
									// for(var i = 0;i<arrayOrdenesPendientes.length;i++){
									// 	arrayOrdenesPendientes[i].Enviar = arrayOrdenesPendientes.length;
									// }
									objtotal.OrdenesPendientes = arrayOrdenesPendientes
									objtotal.FechaDisponibles = arrayFechaDisponibles
									arratotal.push(objtotal)
									that.EstructuraInsertFecha(arratotal,"POST")
								}else{
									// BusyIndicator.hide();
									// that.CerrarDialogSeleccionarFecha();
									// MessageBox.information("No se puede insertar mas de los numeros de entregas establecidos");
									var arraynuevo=[]
									objtotal.FechaDisponibles = arrayFechaDisponibles
									for(var i=0;i<parseInt(arrayFechaDisponibles.NUMERO_ENTREGA);i++){
										arrayOrdenesPendientes[i].Identificador == "realizado"
										arrayOrdenesPendientes[i].Enviar = parseInt(arrayFechaDisponibles.NUMERO_ENTREGA);
										arraynuevo.push(arrayOrdenesPendientes[i]);
									}
									objtotal.OrdenesPendientes = arraynuevo;
									for(var i=0;i<arraynuevo.length;i++){
										var index=arrayOrdenesPendientes.indexOf(arraynuevo[i])
										if (index !== -1) {
										    arrayOrdenesPendientes.splice(index, 1);
										  }
									}
									
									arratotal.push(objtotal)
									// console.log(arratotal)
									localStorage.setItem("arrayOrdenesPendientes", JSON.stringify(arrayOrdenesPendientes));
									var seleccionado = oView.byId("idTableRegistroDisponible").getSelectedIndex();
									var contextActual="/DataFecha/"+seleccionado.toString();
									var contextNuevo="/DataFecha/"+(seleccionado+1).toString();
									var actual= oView.getModel("Proyect").getProperty(contextActual);
									var nuevo= oView.getModel("Proyect").getProperty(contextNuevo);
									if(nuevo == undefined){
										MessageToast.show("No se pueden actualizar las ordenes", {
											duration: 4000,
											my: "center center",
											at: "center center"
										});
									}else{
										var horaactual=actual.HORARIOS.split(":")[0];
										var horanueva=nuevo.HORARIOS.split(":")[0];
										if((parseInt(horanueva)-parseInt(horaactual)) == 1){
											oView.byId("idTableRegistroDisponible").setSelectedIndex(seleccionado+1);
											that.ValidacionDisponibilidad2(arratotal)
										}else{
											MessageToast.show("No se pueden actualizar las ordenes", {
												duration: 4000,
												my: "center center",
												at: "center center"
											});
										}
									}
									
								}
							}
						},
						error: function (e) {
							BusyIndicator.hide();
							console.log("Ocurrio un error" + JSON.parse(e))}
					});
					
				// }
			}
			//BusyIndicator.hide();
		},
		ValidacionDisponibilidad2:function(arratotal){
			that=this;
			oView=this.getView();
			
			var ModeloProyect = oView.getModel("Proyect");
			
			var arrayOrdenesPendientes = JSON.parse(localStorage.getItem('arrayOrdenesPendientes'));
			var arrayFechaDisponibles = JSON.parse(localStorage.getItem('arrayFechasDisponibles'));
			//codigo nuevo
			var oDataCentro=ModeloProyect.getProperty("/DataConstantCentro");
			var arrCompleteCentro=[];
			for(var i = 0 ; i<Object.keys(oDataCentro).length ; i++){
				var obj={};
				obj.Centro= oDataCentro[i].CENTRO;
				arrCompleteCentro.push(obj);
			}
			for(var i = 0;i<arrayOrdenesPendientes.length;i++){
				var obj={};
				obj.Centro= arrayOrdenesPendientes[i].Centro;
				arrCompleteCentro.push(obj); 
			}
			
			
			var arrCentro=[];
			arrCentro = arrCompleteCentro;
			var cant = arrCentro.length;
			const myObj = {}
			for ( var i=0, len=arrCentro.length; i < len; i++ )
		    myObj[arrCentro[i]['Centro']] = arrCentro[i].Centro;
			
			arrCentro = new Array();
			for ( var key in myObj )
			arrCentro.push(myObj[key]);
			
			var arrCantCentro=[];
			for(var i=0;i<arrCentro.length;i++){
				var cantidadcentro=0;
				var obj={};
				obj.centro=arrCentro[i];
				for(var j=0;j<arrayOrdenesPendientes.length;j++){
					if(arrCentro[i] == arrayOrdenesPendientes[j].Centro){
						cantidadcentro += 1;
						obj.numero=cantidadcentro;
						
					}
				}
				arrCantCentro.push(obj)
			}
			
			for(var i=0; i<arrCantCentro.length;i++){
				for(var j=0; j<arrayOrdenesPendientes.length;j++){
					if(arrCantCentro[i].centro ==arrayOrdenesPendientes[j].Centro){
						arrayOrdenesPendientes[j].ID_Eliminar = "";
						arrayOrdenesPendientes[j].Enviar = arrCantCentro[i].numero;
					}
				}
			}
			//codigo nuevo
			if(arrayFechaDisponibles.FECHAS != undefined){
				// console.log(arrayFechaDisponibles)
				var fechaComparativa = this.formatosFilterDate(arrayFechaDisponibles.FECHAS,arrayFechaDisponibles.HORARIOS).getTime();
				
				var codigoprov = arrayOrdenesPendientes[0].ArrayGeneral2[0].Lifnr;
				var centro = arrayOrdenesPendientes[0].ArrayGeneral2[0].Werks;
				
				var fecha = arrayFechaDisponibles.FECHAS;
				var horario = arrayFechaDisponibles.HORARIOS;
				var arr=[];
				
				var ModeloProyect = oView.getModel("Proyect");
				
				
				var url ="/backendhana/IPROVIDER_ENTREGA/REGISTRO_FECHA/RegistroHorarioFiltrar3.xsjs?fecha="+fecha+"&horario="+horario
				// var url ="/backendhana/IPROVIDER_ENTREGA/REGISTRO_FECHA/RegistroHorarioFiltrar2.xsjs?centro="+centro+"&fecha="+fecha+"&horario="+horario
				// $.ajax({
				// 	url: url,
				// 	method: "GET",
				// 	contentType: 'application/json',
				// 	headers: {
				// 	  Authorization: "Basic VVNSX1JBVkE6UmF2YTIwMjAk"
				// 	},
				// 	success: function (data) {
				// 		var nEntregasInsertar = arrayOrdenesPendientes.length;
				// 		for(var i=0;i<Object.keys(data).length;i++){
				// 			data[i].FECHA=(data[i].FECHA).split("T")[0]
				// 			data[i].HORA=(data[i].HORA).split("T")[1].split(".")[0]
				// 			arr.push(data[i]);
				// 		}
				// 		var objtotal={}
				// 		var totalEntregaRegistrados = 0;
				// 		for(var i=0;i<arr.length;i++){
				// 			var dateFecha = new Date(arr[i].FECHA+" "+arr[i].HORA).getTime();
				// 			if(fechaComparativa === dateFecha){
				// 				var entRegistrada = parseInt(arr[i].ENTREGAS_REGISTRADAS)
				// 				totalEntregaRegistrados += entRegistrada;
				// 			}
				// 		}
				// 		if(totalEntregaRegistrados<parseInt(arrayFechaDisponibles.NUMERO_ENTREGA) ){
				// 			var rangoEntregasDisponibles = parseInt(arrayFechaDisponibles.NUMERO_ENTREGA)-totalEntregaRegistrados;
				// 			if(nEntregasInsertar<=rangoEntregasDisponibles){
				// 				for(var i = 0;i<arrayOrdenesPendientes.length;i++){
				// 					arrayOrdenesPendientes[i].Enviar = totalEntregaRegistrados+arrayOrdenesPendientes.length;
				// 				}
				// 				objtotal.OrdenesPendientes = arrayOrdenesPendientes
				// 				objtotal.FechaDisponibles = arrayFechaDisponibles
				// 				arratotal.push(objtotal);
								
				// 				that.EstructuraInsertFecha(arratotal)
				// 			}else{
				// 				MessageToast.show("No se pueden actualizar las ordenes", {
				// 					duration: 4000,
				// 					my: "center center",
				// 					at: "center center"
				// 				});
				// 			}
				// 		}
				// 	},
				// 	error: function (e) {
				// 		BusyIndicator.hide();
				// 		console.log("Ocurrio un error" + JSON.parse(e))
				// 	}
				//   });
				
				$.ajax({
					url: url,
					method: "POST",
					contentType: 'application/json',
					data		:JSON.stringify(arrCentro),
					headers: {Authorization: "Basic VVNSX1JBVkE6UmF2YTIwMjAk"},
					success: function (data) {
						var arrCentro=[];
						arrCentro = arrayOrdenesPendientes;
						var cant = arrCentro.length;
						const myObj = {}
						
						for ( var i=0, len=arrCentro.length; i < len; i++ )
					    myObj[arrCentro[i]['Centro']] = arrCentro[i].Centro;
						
						arrCentro = new Array();
						for ( var key in myObj )
						arrCentro.push(myObj[key]);
						
						var arrCantCentro=[];
						for(var i=0;i<arrCentro.length;i++){
							var cantidadcentro=0;
							var obj={};
							obj.centro=arrCentro[i];
							for(var j=0;j<arrayOrdenesPendientes.length;j++){
								if(arrCentro[i] == arrayOrdenesPendientes[j].Centro){
									cantidadcentro += 1;
									obj.numero=cantidadcentro;
									
								}
							}
							arrCantCentro.push(obj)
						}
						
						
						var objtotal={}
						var nEntregasInsertar = arrayOrdenesPendientes.length;
						if(Object.keys(data).length>0){
							for(var i=0;i<Object.keys(data).length;i++){
								data[i].FECHA=(data[i].FECHA).split("T")[0]
								data[i].HORA=(data[i].HORA).split("T")[1].split(".")[0]
								arr.push(data[i]);
							}
							
							var totalEntregaRegistrados = 0;
							for(var i=0;i<arr.length;i++){
								var dateFecha = new Date(arr[i].FECHA+" "+arr[i].HORA).getTime();
								if(fechaComparativa === dateFecha){
									var entRegistrada = parseInt(arr[i].ENTREGAS_REGISTRADAS)
									totalEntregaRegistrados += entRegistrada;
								}
							}
							
							if(totalEntregaRegistrados<parseInt(arrayFechaDisponibles.NUMERO_ENTREGA) ){
								var rangoEntregasDisponibles = parseInt(arrayFechaDisponibles.NUMERO_ENTREGA)-totalEntregaRegistrados;
								if(nEntregasInsertar<=rangoEntregasDisponibles){
									for(var i = 0;i<arr.length;i++){
										for(var j = 0;j<arrayOrdenesPendientes.length;j++){
											if(arr[i].CENTRO == arrayOrdenesPendientes[j].Centro){
												arrayOrdenesPendientes[j].ID_Eliminar = arr[i].ID_REGISTRO;
												arrayOrdenesPendientes[j].Enviar = arrayOrdenesPendientes[j].Enviar + parseInt(arr[i].ENTREGAS_REGISTRADAS);
											}
										}
									}
									objtotal.OrdenesPendientes = arrayOrdenesPendientes
									objtotal.FechaDisponibles = arrayFechaDisponibles
									arratotal.push(objtotal);
									that.EstructuraInsertFecha(arratotal)
								}else{
									MessageToast.show("No se pueden actualizar las ordenes", {
										duration: 4000,
										my: "center center",
										at: "center center"
									});
								}
							}
						}else{
							if(nEntregasInsertar<parseInt(arrayFechaDisponibles.NUMERO_ENTREGA) ){
								objtotal.OrdenesPendientes = arrayOrdenesPendientes
								objtotal.FechaDisponibles = arrayFechaDisponibles
								arratotal.push(objtotal)
								that.EstructuraInsertFecha(arratotal,"POST")
							}else{
								BusyIndicator.hide();
								that.CerrarDialogSeleccionarFecha();
								MessageBox.information("No se puede insertar mas de los numeros de entregas establecidos");
							}
						}
					},
					error: function (e) {
						BusyIndicator.hide();
						console.log("Ocurrio un error" + JSON.parse(e))}
				});
			}else{
				MessageToast.show("No se pueden actualizar las ordenes", {
					duration: 4000,
					my: "center center",
					at: "center center"
				});
			}
			//BusyIndicator.hide();
		},
		EstructuraInsertFecha:function(arratotal,method){
			oView = this.getView();
			var centro;
			var proveedor;
			var entregasRegistradas;
			var vbeln;
			var arr = [];
			var arr2= [];
			var arr3= [];
			// console.log(arratotal)
			//comentado temporalmente
			// centro = arratotal[0].OrdenesPendientes[0].ArrayGeneral2[0].Werks;
			//comentado temporalmente
			proveedor = arratotal[0].OrdenesPendientes[0].ArrayGeneral2[0].Lifnr;
			for(var i=0; i< arratotal.length;i++){
				entregasRegistradas = 0
				var split = arratotal[i].FechaDisponibles.FECHAS.split(".")
				for(var l=0;l<arratotal[i].OrdenesPendientes.length;l++ ){
					entregasRegistradas= arratotal[i].OrdenesPendientes[l].Enviar.toString();
					centro = arratotal[i].OrdenesPendientes[l].Centro;
					var obj = {
						"CENTRO":centro,
						"PROVEEDOR":proveedor,
						"ENTREGAS_REGISTRADAS":entregasRegistradas,
						"FECHA":split[2]+"-"+split[1]+"-"+split[0],
						"HORA":arratotal[i].FechaDisponibles.HORARIOS
					}
					arr2.push(obj)
				}
				for(var k=0;k<arratotal[i].OrdenesPendientes.length;k++){
					vbeln = arratotal[i].OrdenesPendientes[k].ArrayGeneral2[0].Vbeln
					var objSap = {
						  "Vbeln": vbeln,
						  "Lfdat": this.formatAbapDate(arratotal[i].FechaDisponibles.FECHAS),
						  "Lfuhr": this.formatAbapHours(arratotal[i].FechaDisponibles.HORARIOS),
						}
					arr.push(objSap)
					
					var fecha = this.formatCell(arratotal[i].OrdenesPendientes[k].fecha)
					var horario = this.formatCellAbapHours(arratotal[i].OrdenesPendientes[k].hora)
					var id = arratotal[i].OrdenesPendientes[k].ID_Eliminar;
					var centro = arratotal[i].OrdenesPendientes[k].ArrayGeneral2[0].Werks;
					var proveedor = arratotal[i].OrdenesPendientes[k].ArrayGeneral2[0].Lifnr;
					var objDelete={
						"id":id,
						"fecha": fecha,
						"hora": horario,
						"centro":centro,
						"codprov":proveedor
					}
					arr3.push(objDelete)
				}
			}
			var objEnvioSap = {
				  "Planificar": "X",
				  "ItemSet": arr,
				  "NAVRESULT": [
				    {"Vbeln": "",
				      "Codigo": "",
				      "Mensaje": ""
				    }
				  ]
				};
			console.log("POST XSJS ",arr2)
			console.log("POST SAP ",objEnvioSap)
			console.log("DELEtE ",arr3)
			
			this.CerrarDialogSeleccionarFecha();
			this.methodPostSap(objEnvioSap,"/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_PLANIFICAR_ENT_SRV","/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_PLANIFICAR_ENT_SRV/ZetPlanificarSet","DialogSelecFechaProg","1",arr2,method,arr3,objEnvioSap.ItemSet.length);
			// this.methodPostXsjs(arr2,"",arr3);
			BusyIndicator.hide();
		},
		methodPostXsjs0:function(content,methodo,contentDelete){
			that=this;
			oView=this.getView();
			
			for(var i=0;i<content.length;i++){
				var split =  content[i].FECHA.split("-");
				var fecha = split[2]+"."+split[1]+"."+split[0];
				var horario = content[i].HORA;
				var centro = content[i].CENTRO;
				var codprov = content[i].PROVEEDOR;
				var url ="/backendhana/IPROVIDER_ENTREGA/REGISTRO_FECHA/RegistroHorarioFiltrar.xsjs?centro="+centro+"&codprov="+codprov+"&fecha="+fecha+"&horario="+horario
				$.ajax({
					url: url,
					method: "GET",
					async:false,
					contentType: 'application/json',
					headers: {
					  Authorization: "Basic VVNSX1JBVkE6UmF2YTIwMjAk"
					},
					success: function (data) {
						var objtotal={}
						// var nEntregasInsertar = arrayOrdenesPlanificadas.length;
						if(Object.keys(data).length>0){
							data[0].ID_REGISTRO=data[0].ID_REGISTRO.toString();
							data[0].FECHA=(data[0].FECHA).split("T")[0];
							data[0].HORA=(data[0].HORA).split("T")[1].split(".")[0];
							data[0].ENTREGAS_REGISTRADAS = (content[i].ENTREGAS_REGISTRADAS).toString();
							
							that.methodUpdateXsjs0(data[0]);
						}else{
							$.ajax({
								url: "/backendhana/IPROVIDER_ENTREGA/REGISTRO_FECHA/RegistroFecha.xsjs",
								type: "POST",
								async: false,
								contentType: 'text/json',
								headers: {
								  Authorization: "Basic VVNSX1JBVkE6UmF2YTIwMjAk"
								},
								data: JSON.stringify(content[i]),
								success: function (data) {
									// that.CerrarDialogSeleccionarFecha();
									//BusyIndicator.hide();
									that.llamadoMetodos();
								},
								error: function (e) {
									console.log("Ocurrio un error" + JSON.parse(e))
									MessageToast.show("Erro al añadir registro");
								}
							})
						}
					},
					error: function (e) {
						console.log("Ocurrio un error" + JSON.parse(e))
					}
				});
			}
		},
		methodUpdateXsjs0:function(content){
			$.ajax({
				url: "/backendhana/IPROVIDER_ENTREGA/REGISTRO_FECHA/RegistroFecha.xsjs",
				type: "PUT",
				async:false,
				contentType: 'text/json',
				headers: {
				  Authorization: "Basic VVNSX1JBVkE6UmF2YTIwMjAk"
				},
				data: JSON.stringify(content),
				statusCode: {
				    404: function() {
				      alert( "page not found" );
				    },
				    200: function(){
				    	// that.CerrarDialogSeleccionarFecha();
						//BusyIndicator.hide();
						that.llamadoMetodos();
				    },
				    400: function(){
				    	MessageToast.show("Erro al actualizar registro");
				    	// console.log("bad request");
				    }
				  }
			})
			
		},
		methodPostSap:function(content,urlGet,urlPost,Dialog,msg,arr2,method,arr3,cantidad){
			that=this;
			oView=this.getView();
			// for(var i=0;i<content.length;i++){
				// console.log(content)
				$.ajax({ 
					url:urlGet,
					type: "GET",
					async: false,
					headers :{"x-CSRF-Token":"Fetch"}
				}).always(function(data , status,response){
						var	token =response.getResponseHeader("x-csrf-token");
						$.ajax({ 
							url			:urlPost,
							type		: "POST",
							async		: false,
							headers 	:{"x-CSRF-Token":token},
							contentType	:"application/json",
							dataType	:"json",
							data		:JSON.stringify(content)
						}).always(function(data , status,response){
								// that.getRegistroVigilancia();
								// that.MensajeFinal()
								if(msg=="0"){
									// that.MensajeFinal(data.d.NAVRESULT.results[0].Mensaje);
									if(cantidad == 1){
										that.MensajeFinal(data.d.NAVRESULT.results[0].Mensaje);
									}else{
										that.MensajeFinal("Se han actualizado correctamente");
									}
								
									var i=(data.d.NAVRESULT.results[0].Mensaje).indexOf("no admite")
									if(i != -1){
										console.log("no hace nada")
									}else{
										that.methodPostXsjs(arr2,method,arr3);
									}
								}else if(msg =="1"){
									// that.MensajeFinal(data.d.NAVRESULT.results[0].Mensaje);
									if(cantidad == 1){
										that.MensajeFinal(data.d.NAVRESULT.results[0].Mensaje);
									}else{
										that.MensajeFinal("Se han actualizado correctamente");
									}
									
									var i=(data.d.NAVRESULT.results[0].Mensaje).indexOf("no admite")
									if(i != -1){
										console.log("no hace nada")
									}else{
										that.methodPostXsjs(arr2,method,arr3);
									}
								}else if(msg =="2"){
									if(cantidad == 1){
										that.MensajeFinal(data.d.NAVRESULT.results[0].Mensaje);
									}else{
										that.MensajeFinal("Se han actualizado correctamente");
									}
									
								}else{
									that.MensajeFinal0()
								}
								 //console.log(data);
						});
					});
			// }
			// that.CerrarDialogSeleccionarFecha();
			this.llamadoMetodos();
			
		},
		MensajeFinal:function(msg){
			this.getView().byId("TreeTable").clearSelection();
			this.getView().byId("TreeTable1").clearSelection();
			this.getView().byId("TreeTable2").clearSelection();
			// MessageToast.show(msg, {
			// 	duration: 4000,
			// 	my: "center center",
			// 	at: "center center"
			// });	
			MessageBox.information(msg);	
			//BusyIndicator.hide();
		},
		MensajeFinal0:function(msg){
			this.getView().byId("TreeTable").clearSelection();
			this.getView().byId("TreeTable1").clearSelection();
			this.getView().byId("TreeTable2").clearSelection();
			// MessageToast.show("Actualizado Correctamente", {
			// 	duration: 4000,
			// 	my: "center center",
			// 	at: "center center"
			// });
			MessageBox.information("Actualizado Correctamente");
			//BusyIndicator.hide();
		},
		
		//target3
		
		//Kassiel modificaciones Temp
		DialogMaterialesPlanTemp:function(oEvent){
			oView = this.getView();
			
			var table = oView.byId("TreeTable2");
			
			var context = oEvent.getSource().getParent().getBindingContext("Proyect").getPath(); 
			var Object = this.getView().getModel("Proyect").getProperty(context);
			var materiales = Object.ArrayGeneral2;
			var model = new JSONModel(materiales);
			if (!oView.byId("DialogMaterialesTemp")) {
					Fragment.load({
						id: oView.getId(),
						name: "com.rava.fragment.Cambios.Materiales",
						controller: that
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					oDialog.open();
					oView.byId("idTableMateriales").setVisibleRowCount(materiales.length)
					oView.byId("idTableMateriales").setModel(model, "Materiales")
				});
			} else {
				oView.byId("DialogMaterialesTemp").open();
				oView.byId("idTableMateriales").setVisibleRowCount(materiales.length)
				oView.byId("idTableMateriales").setModel(model, "Materiales")
			}
		},
		fnPressNoProgramadoPlanTemp:function(){
			this.fnNoProgramadoPlanTemp("");
		},
		fnNoProgramadoPlanTemp:function(fecha){
			oView = this.getView();
			
			var ModeloProyect = oView.getModel("Proyect");
			var arrayOrdenes;
			var fecha;
			
			if(JSON.parse(localStorage.getItem('arrayOrdenesPendientes')).length > 0){
				arrayOrdenes = JSON.parse(localStorage.getItem('arrayOrdenesPendientes'));
			}else{
				arrayOrdenes = JSON.parse(localStorage.getItem('arrayOrdenesPlanificadas'));
			}

			var arrHorarioTotal=[];
			var obj={};
			if(fecha == "RECOJO EN PLANTA DE PROVEEDOR"){
				obj.TitleFecha = "Fecha de Recojo"
			}else if(fecha == "PUESTO EN MINA"){
				obj.TitleFecha = "Fecha de llegada "
			}else{
				obj.TitleFecha = "Fecha"
			}
			arrHorarioTotal.push(obj)
			
			ModeloProyect.setProperty("/DataFechaNoProg" ,arrHorarioTotal);
			
			if (!oView.byId("DialogSelecFechaNoProgPlanTemp")) {
					Fragment.load({
						id: oView.getId(),
						name: "com.rava.fragment.Cambios.SelecFechaNoProgPlan",
						controller: that
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					oDialog.open();
					oView.byId("nEntregaSeleccionadasNoProgPlan").setText(arrayOrdenes.length)
				});
			} else {
				oView.byId("DialogSelecFechaNoProgPlanTemp").open();
				oView.byId("nEntregaSeleccionadasNoProgPlan").setText(arrayOrdenes.length)
			}
		},
		ModificarEntregaTemp : function (){
		 var oView = this.getView();
		 var that= this;
		var arrayOrdenes;
		var fecha;
		if(JSON.parse(localStorage.getItem('arrayOrdenesPendientes')).length > 0){
			arrayOrdenes = JSON.parse(localStorage.getItem('arrayOrdenesPendientes'));
			var obj={
				FECHA:arrayOrdenes[0].fecha,
				HORARIOS:arrayOrdenes[0].hora
			}
			fecha = obj;
		}else{
			arrayOrdenes = JSON.parse(localStorage.getItem('arrayOrdenesPlanificadas'));
			var obj={
				FECHAS:that.formatDate2(arrayOrdenes[0].fecha),
				HORARIOS:that.formatCellAbapHours(arrayOrdenes[0].hora)
			}
			fecha = obj;
		}
		
		var ModeloProyect = oView.getModel("RegistroEntrega");
		ModeloProyect.setProperty("/Data" ,arrayOrdenes);
		ModeloProyect.setProperty("/fecha" ,fecha);
			
		 var EntregasSelecionadas = JSON.parse(localStorage.getItem("arrayOrdenesPlanificadas"));
		 var ModeloProyect = oView.getModel("Proyect");
		 ModeloProyect.setProperty("/DataMaterialesSeleccionados" ,[]);
		 var TipoBultos =	ModeloProyect.getProperty("/DataTipoBulto");
		 var DataPedidosEmbalar =	ModeloProyect.getProperty("/DataPedidosEmbalar");
		 
		 ModeloProyect.setProperty("/DataBultos" , []);
		 
		 if(EntregasSelecionadas.length === 0){
		 	MessageToast.show("Seleccione una Entrega");
		 	return ;
		 }
		 
		var Array				=[];
		var FirstObject 		=EntregasSelecionadas[0].ArrayGeneral2[0];
		var almacenarObject;
		var MaterialesEntrega	=JSON.parse(JSON.stringify(EntregasSelecionadas[0]));
		
		
		while (MaterialesEntrega.ArrayGeneral2.length !== 0){
			if(FirstObject.Xhupf){
				var obj = {
								Num			:FirstObject.VhilmKuD,
								TipoBulto	:FirstObject.Vegr2D,
								CantBulto	:Utilities.FormatterDinero(FirstObject.ZulAufl),
								Observacion	:FirstObject.InhaltD.replace(".000",""),
								PesoBulto	:FirstObject.BrgewD.replace(".000",""),
								Longitud	:FirstObject.LaengD.replace(".000",""),
								Ancho		:FirstObject.BreitD.replace(".000",""),
								Altura		:FirstObject.HoeheD.replace(".000",""),
								Array		:[]	
							};
				ModeloProyect.setProperty("/HUHabilitar" , true);
				
			}else{
				
				var obj = {
					Num			:FirstObject.VhilmKuD,
					TipoBulto	:FirstObject.Vegr2D,
					CantBulto	:Utilities.FormatterDinero(FirstObject.ZulAufl),
					Observacion	:FirstObject.InhaltD.replace(".000",""),
					PesoBulto	:FirstObject.BrgewD.replace(".000",""),
					Longitud	:FirstObject.LaengD.replace(".000",""),
					Ancho		:FirstObject.BreitD.replace(".000",""),
					Altura		:FirstObject.HoeheD.replace(".000",""),
					Array		:[]	
				};
				ModeloProyect.setProperty("/HUHabilitar" , false);
		}
		Array.push(obj);
		var arrayIndices		=[];
		var indice  =0;
		var indice1 =0;
		 EntregasSelecionadas[0].ArrayGeneral2.forEach(function (Mat){
		 	if (FirstObject.VhilmKuD === Mat.VhilmKuD){
		 		Array.forEach(function (a){
					if(a.Num === FirstObject.VhilmKuD){
						Mat.VemngD		= Utilities.FormatterDinero(Mat.VemngD);
						Mat.CantTotal	= that.format2Decimales(Mat.VemngD);
						a.Array.push(JSON.parse(JSON.stringify(Mat)));
						MaterialesEntrega.ArrayGeneral2.splice(indice,1);
						arrayIndices.push(indice1);
						indice--;
					}
		 		});
		 	}
		 	indice1++;
		 	indice++;
		 	// 	var tipo ;
		 	// TipoBultos.forEach(function (e){
		 	// 	if( e.Vegr2 === Mat.Vegr2D){
		 	// 		tipo=e.Bezei;
		 	// 	}
		 	// });
		 });
		 var total =0;
		 arrayIndices.forEach(function(a,ind){
		 	EntregasSelecionadas[0].ArrayGeneral2.splice(a-total,1);
		 	total++; 
		 });
		 
		 FirstObject =JSON.parse(JSON.stringify(MaterialesEntrega.ArrayGeneral2[0]===undefined ?{nada:"xD"}: MaterialesEntrega.ArrayGeneral2[0]));
		}
		 Array.sort(that.dynamicSort("Descripcion"));
		 var data = {
		 	Array :Array
		 };
		 
			ModeloProyect.setProperty("/DataBultos" ,data);
			// if(!this.BultosM){
			// 	this.BultosM = sap.ui.xmlfragment("com.rava.fragment.BultosModificar" , this);
			// 	this.getView().addDependent(this.BultosM);
			// }
			
			if(!this.EmbalarBultosM){
			this.EmbalarBultosM = sap.ui.xmlfragment("com.rava.fragment.Cambios.Entregas" , this);
			this.getView().addDependent(this.EmbalarBultosM);
			}
			// this.BultosM.close();
			// this.EmbalarBultosM.open();
			
			// this.getView().byId("nEntregaSeleccionadas").setText(arrayOrdenes.length)
			if (!oView.byId("DialogEntregasTemp")) {
					Fragment.load({
						id: oView.getId(),
						name: "com.rava.fragment.Cambios.Entregas",
						controller: that
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					oDialog.open();
					BusyIndicator.hide(0);
					oView.byId("nEntregaSeleccionadas").setText(arrayOrdenes.length)
				});
			} else {
				oView.byId("DialogEntregasTemp").open();
				BusyIndicator.hide(0);
				oView.byId("nEntregaSeleccionadas").setText(arrayOrdenes.length)
			}
		},
		//Kassiel
		ValidarCamposPlan : function (oEvent){
			that=this;
			var oView = this.getView();
			var ModeloProyect = oView.getModel("Proyect");
			var contador=0;
			var contador2=0;
			var table = oView.byId("TreeTable2");
			var context = oEvent.getParameter("rowContext");
			if(context != null){
				var object = this.getView().getModel("Proyect").getProperty(context.sPath);
				var oIndex = oEvent.getParameter('rowIndex');
			
				var Selecciones =table.getSelectedIndices();
				var selectedEntries = [];
				for(var i=0; i<Selecciones.length; i++){
					var oData = table.getContextByIndex(Selecciones[i]);
					selectedEntries.push(oData.getProperty(oData.getPath ()));
				}
				
				var oDataCond=ModeloProyect.getProperty("/DataConstanteCond");
				var oDataCentro=ModeloProyect.getProperty("/DataConstantCentro");
				
				if(Selecciones.length>1){
					// if(selectedEntries[0].entprogramadas != selectedEntries[Selecciones.length-1].entprogramadas){
					// 	table.removeSelectionInterval(oIndex,oIndex);
					// 	var i = selectedEntries.indexOf(Object);
					// 	if ( i !== -1 ) {
					// 		selectedEntries.splice( i, 1 );
					// 	}
					// }
					// if(selectedEntries[Selecciones.length-1] != undefined){
					// 	if(selectedEntries[0].Centro != selectedEntries[Selecciones.length-1].Centro){
		   //              table.removeSelectionInterval(oIndex,oIndex);
					// 	var i = selectedEntries.indexOf(Object);
			  //          if ( i !== -1 ) {
					//         selectedEntries.splice( i, 1 );
					//     }
					// }
					// }
					if(Object.keys(oDataCond).length >0){
						for(var j=0;j<Object.keys(oDataCond).length;j++){
							for(var i=0; i<selectedEntries.length; i++){
								if(oDataCond[j].DESCRIPCION == selectedEntries[i].lugdestino){
									contador++;
								}
							}
						}
						if(contador==0){
							
						}
						else if(contador != Selecciones.length){
							table.removeSelectionInterval(oIndex,oIndex);
							var i = selectedEntries.indexOf(object);
							if ( i !== -1 ) {
								selectedEntries.splice( i, 1 );
							}
						}
					}
					
					if(Object.keys(oDataCentro).length >0){
						for(var j=0;j<Object.keys(oDataCentro).length;j++){
							for(var i=0; i<selectedEntries.length; i++){
								if(oDataCentro[j].CENTRO == selectedEntries[i].Centro){
									contador2++;
								}
							}
						}
						if(contador2==0){
							
						}
						else if(contador2 != Selecciones.length){
							table.removeSelectionInterval(oIndex,oIndex);
							var i = selectedEntries.indexOf(object);
							if ( i !== -1 ) {
								selectedEntries.splice( i, 1 );
							}
						}
					}
					
					for(var i=0; i<selectedEntries.length; i++){
						if(selectedEntries[i+1] != undefined){
							if(selectedEntries[i].entprogramadas != selectedEntries[i+1].entprogramadas){
								table.removeSelectionInterval(oIndex,oIndex);
								var i = selectedEntries.indexOf(object);
								if ( i !== -1 ) {
									selectedEntries.splice( i, 1 );
								}
								break;
							}
							// if(selectedEntries[i].Centro != selectedEntries[i+1].Centro){
							// 	table.removeSelectionInterval(oIndex,oIndex);
							// 	var i = selectedEntries.indexOf(object);
							// 	if ( i !== -1 ) {
							// 		selectedEntries.splice( i, 1 );
							// 	}
							// }
						}
					}
				}
				// console.log(selectedEntries)
				localStorage.setItem("arrayOrdenesPlanificadas", JSON.stringify(selectedEntries));
				if(!object.DescripcionGeneralEntrega){
					// MessageToast.show("Solo se puede seleccionar Numero de Entrega");
					table.removeSelectionInterval(oIndex,oIndex);
				}else{
					if (Selecciones.length > 1){
						oView.byId("Modificar").setEnabled(true);
						oView.byId("Modificar1").setEnabled(false);
						oView.byId("Modificar2").setEnabled(true);
					}else if ( Selecciones.length === 1){
						oView.byId("Modificar").setEnabled(true);
						oView.byId("Modificar1").setEnabled(true);
						oView.byId("Modificar2").setEnabled(true);
					}else {
						oView.byId("Modificar").setEnabled(false);
						oView.byId("Modificar1").setEnabled(false);
						oView.byId("Modificar2").setEnabled(false);
					}
				}
			}
		},
		ButtonAbriFechaPlan:function(){
			that = this;
			oView = this.getView();
			var arrayOrdenesPlanificadas = JSON.parse(localStorage.getItem('arrayOrdenesPlanificadas'));
			
			var ModeloProyect = oView.getModel("Proyect");
			ModeloProyect.setProperty("/DataConstanteContador" ,8);
			// console.log(arrayOrdenesPlanificadas)
			if(arrayOrdenesPlanificadas[0] === undefined){
				MessageToast.show("No se ha seleccionado Numero de Entrega", {
					duration: 4000,
					my: "center center",
					at: "center center"
				});
			}else{
				// if(arrayOrdenesPlanificadas[0].entprogramadas == "PROGRAMADO"){
				//  	this.DialogSeleccionarFechaProgramadaPlanificada();
				// }else if(arrayOrdenesPlanificadas[0].entprogramadas == "NO PROGRAMADO"){
				// 	this.DialogSeleccionarFechaNoProgramadaPlanificada();
				// }
				$.ajax({
					url: "/backendhana/IPROVIDER_ENTREGA/ENTREGA_PROVEEDOR/Registro_ENTREGAPROVEEDOR.xsjs?modulo=MM&aplicativo=PLANIFICACION_ENTREGA_PORTAL&funcion=COND_ENTREGA",
					method: "GET",
					contentType: 'application/json',
					headers: {
					  Authorization: "Basic VVNSX1JBVkE6UmF2YTIwMjAk"
					},
					success: function (data) {
						var contador =0;
						// if(arrayOrdenesPlanificadas[0].entprogramadas == "PROGRAMADO"){
							if(Object.keys(data).length >0){
								for(var i=0;i<Object.keys(data).length;i++){
									if(data[i].DESCRIPCION == arrayOrdenesPlanificadas[0].lugdestino){
										contador++;
									}
								}
								if(arrayOrdenesPlanificadas[0].lugdestino == "RECOJO EN PLANTA DE PROVEEDOR" || arrayOrdenesPlanificadas[0].lugdestino == "PUESTO EN MINA"){
								// if(contador>0){
								// 	that.DialogSeleccionarFechaNoProgramadaPlanificada();
								// }else{
								// 	that.DialogSeleccionarFechaProgramadaPlanificada();
								// }
									that.fnNoProgramadoPlanTemp(arrayOrdenesPlanificadas[0].lugdestino);
								}else{
									that.DialogSeleccionarFechaProgramadaPlanificada();
								}
							}else{
								// that.DialogSeleccionarFechaProgramadaPlanificada();
								if(arrayOrdenesPlanificadas[0].lugdestino == "RECOJO EN PLANTA DE PROVEEDOR" || arrayOrdenesPlanificadas[0].lugdestino == "PUESTO EN MINA"){
									that.fnNoProgramadoPlanTemp(arrayOrdenesPlanificadas[0].lugdestino);
								}else{
									that.DialogSeleccionarFechaProgramadaPlanificada();
								}
							}
						// }else if(arrayOrdenesPlanificadas[0].entprogramadas == "NO PROGRAMADO"){
						// 	that.DialogSeleccionarFechaNoProgramadaPlanificada();
						// }
					},
					error: function (e) {
						console.log("Ocurrio un error" + JSON.parse(e))
					}
				  });
			}
		},
		//Dialog Plan No Prog
		DialogSeleccionarFechaNoProgramadaPlanificada: function(){
			that = this;
			var ModeloProyect = oView.getModel("Proyect");
			var arrayOrdenesPlanificadas = JSON.parse(localStorage.getItem('arrayOrdenesPlanificadas'));
			// console.log(arrayOrdenesPlanificadas)
			var fechas=[];
			var fecha_max;
			var fecha_min;
			var dateActual=new Date();
			fechas.push(dateActual.getTime());
			for(var i=0;i<arrayOrdenesPlanificadas.length;i++){
				var fecha= this.formatCell(arrayOrdenesPlanificadas[i].fecha);
				var hora= this.formatCellAbapHours(arrayOrdenesPlanificadas[i].hora);
				// var fechaarray = fecha + " " + hora;
				var fechaarray = fecha ;
				if(arrayOrdenesPlanificadas.length > 1){
					var newfechaarray =  fecha.split(".")[2] + "/" + fecha.split(".")[1] + "/"+fecha.split(".")[0] + " " + hora
					var date= (new Date(newfechaarray)).getTime();
					fechas.push(date)
				}else{
					fecha_max = "";
					// fecha_min = fecha;
					fecha_min = dateActual.getTime();;
				}
			}
			
			if(fechas.length>0){
				var max = Math.max(...fechas);
				var min = Math.min(...fechas);
				if(max == min ){
					fecha_max = "";
					fecha_min = this.formatCell3("/Date("+fechas[0]+")/");
				}else{
					// fecha_max = this.formatCell2("/Date("+max+")/");
					fecha_max=""
					fecha_min = this.formatCell3("/Date("+fechas[0]+")/");
				}
			}else{
				fecha_max = "";
				fecha_min = this.formatCell3("/Date("+fechas[0]+")/");
			}
			ModeloProyect.setProperty("/FechaArraFechaPenInicioPlan",fechas);
			if (!oView.byId("DialogSelecFechaPlanNoProg")) {
				Fragment.load({
					id: oView.getId(),
					name: "com.rava.fragment.FechasPlanificadas.SelecFechaPlanNoProg",
					controller: that
				}).then(function (oDialog) {
					oView.byId("fecharangoInicialPlanNoProg").setValue(fecha_min)
					oView.byId("fecharangoFinalPlanNoProg").setValue(fecha_max)
					oView.byId("nEntregaPlanNoProg").setValue(arrayOrdenesPlanificadas.length)
					oView.addDependent(oDialog);
					oDialog.open();
					that.InsertRangoFechasPlan();
				});
			} else {
				oView.byId("fecharangoInicialPlanNoProg").setValue(fecha_min)
				oView.byId("fecharangoFinalPlanNoProg").setValue(fecha_max)
				oView.byId("nEntregaPlanNoProg").setValue(arrayOrdenesPlanificadas.length)
				oView.byId("DialogSelecFechaPlanNoProg").open();
				that.InsertRangoFechasPlan();
			}
		},
		InsertRangoFechasPlan:function(){
			that=this;
			oView=this.getView();
			var ModeloProyect = oView.getModel("Proyect");
			var fecha_min = oView.byId("fecharangoInicialPlanNoProg").getValue();
			var fecha_max = oView.byId("fecharangoFinalPlanNoProg").getValue();
			var fechaInicio = this.formatosFilterDateRegistro2(fecha_min);
			var fechaFin    = this.formatosFilterDateRegistro2(fecha_max);
			var arrHorario = [];
			var arrRangoFecha = []
			if(fecha_max == ""){
				if(fechaInicio.getDay() == 6 || fechaInicio.getDay() == 0){
				}else{
					arrRangoFecha.push(fecha_min)
				}
			}else{
				while(fechaFin.getTime() >= fechaInicio.getTime()){
					var date =  this.formatosCellValidateNumbers(fechaInicio.getDate())+ '.' + this.formatosCellValidateNumbers(fechaInicio.getMonth() + 1)+'.' +fechaInicio.getFullYear()  ;
					if(fechaInicio.getDay() == 6 || fechaInicio.getDay() == 0){
					}else{
						arrRangoFecha.push(date);
					}
					fechaInicio.setDate(fechaInicio.getDate() + 1);
				}
			}
			
			if(arrRangoFecha.length<6){
				for(var a = 0; a<arrRangoFecha.length;a++){
					var obj={};
					var FECHAS = arrRangoFecha[a];
					obj.FECHAS = FECHAS;
					arrHorario.push(obj);
				}
				ModeloProyect.setProperty("/DataFechaPlanNoProg" ,arrHorario);
				if(arrHorario.length == 0){
					MessageBox.show(
							"Solo deben seleccionarse días laborables", {
								icon: sap.m.MessageBox.Icon.INFORMATION,
								title: "",
								actions: ['OK'],
								onClose: function (sActionClicked) {}
							}
						);
				}
			}else{
				MessageToast.show("Seleccione rango de fecha menor a una semana", {
					duration: 3000,
					my: "center center",
					at: "center center"
				});
				//BusyIndicator.hide();
			}
			
		},
		CerrarDialogSelecFechaPlanNoProg:function(){
			that = this;
			oView=this.getView();
			localStorage.setItem("arrayOrdenesPlanificadas", JSON.stringify([]));
			localStorage.setItem("arrayFechasDisponiblesPlanNoProg", JSON.stringify([]));
			var ModeloProyect = oView.getModel("Proyect");
			this.getView().byId("idTableRegistroDisponiblePlanNoProg").clearSelection();
			this.getView().byId("TreeTable2").clearSelection();
			oView.byId("fecharangoInicialPlanNoProg").setValue("")
			oView.byId("fecharangoFinalPlanNoProg").setValue("")
			oView.byId("nEntregaPlanNoProg").setValue("")
			oView.byId("DialogSelecFechaPlanNoProg").close();
			ModeloProyect.setProperty("/DataFechaPlanNoProg" ,[]);
		},
		//Dialog Plan No Prog
		//DatePicker Plan No Prog
		cambioRangoPlanNoProg:function(){
			var fechaInicial=this.getView().byId("fecharangoInicialPlanNoProg").getValue()
			// console.log(fechaInicial)
			if(fechaInicial == "" ){
			}else{
				var fechaInicialSplit = fechaInicial.split(".");
				var year = parseInt(fechaInicialSplit[2]);
				var mount = parseInt(fechaInicialSplit[1]);
				var day = parseInt(fechaInicialSplit[0]);
				this.getView().byId("fecharangoFinalPlanNoProg").setMinDate(new Date(year, mount-1, day+1));
			}
		},
		eventchangeFechaFinalPlanNoProg:function(){
			var dateActual=new Date()
			var anioActual=dateActual.getFullYear();
			var fechaInicial=this.getView().byId("fecharangoInicialPlanNoProg").getValue();
			var diaValInicio=fechaInicial.split(".")[0];
			var mesValInicio=fechaInicial.split(".")[1];
			var anioValInicio=fechaInicial.split(".")[2];
			var fechaInicialDate = new Date( anioValInicio + "/" + mesValInicio + "/" + diaValInicio );
			
			var fechaFinal=this.getView().byId("fecharangoFinalPlanNoProg").getValue()
			var diaValFinal=fechaFinal.split(".")[0];
			var mesValFinal=fechaFinal.split(".")[1];
			var anioValFinal=fechaFinal.split(".")[2];
			var fechaFinalDate = new Date( anioValFinal + "/" + mesValFinal + "/" + diaValFinal );
			
			if(fechaInicial == "" ){
				MessageToast.show("Añadir Rango Inicial", {
					duration: 4000,
					my: "center center",
					at: "center center"
				});	
			}else{
				if(fechaFinal != ""){
					if( diaValFinal!=undefined && mesValFinal!=undefined && anioValFinal!=undefined && (parseInt(anioValFinal)>=parseInt(anioActual)) ){
						if(fechaInicialDate.getTime() <= fechaFinalDate.getTime()){
							this.InsertRangoFechasPlan();
						}else{
							MessageBox.show("La fecha final es menor a la fecha inicial", {
									icon: sap.m.MessageBox.Icon.INFORMATION,
									title: "",
									actions: ['OK'],
									onClose: function (sActionClicked) {}
								}
							);
						}
						
					}else{
						MessageToast.show("Formato Incorrecto: DD.MM.YYYY", {
							duration: 4000,
							my: "center center",
							at: "center center"
						});	
					}
				}else{
					this.InsertRangoFechasPlan()
				}
			}
		},
		cambioRangoInicialPlanNoProg:function(){
			var arrayOrdenesPlanificadas = JSON.parse(localStorage.getItem('arrayOrdenesPlanificadas'));
			// console.log(arrayOrdenesPendientes)
			var fechas=[];
			var fecha_max;
			var fecha_min;
			for(var i=0;i<arrayOrdenesPlanificadas.length;i++){
				var fecha= this.formatCell2(arrayOrdenesPlanificadas[i].fecha);
				var hora= this.formatCellAbapHours(arrayOrdenesPlanificadas[i].hora);
				var fechaarray = fecha + " " + hora;
				if(arrayOrdenesPlanificadas.length > 1){
					var newfechaarray =  fecha.split(".")[2] + "/" + fecha.split(".")[1] + "/"+fecha.split(".")[0] + " " + hora
					var date= (new Date(newfechaarray)).getTime();
					fechas.push(date)
					// console.log("mas de uno")
				}else{
					fecha_max = "";
					fecha_min = fecha;
				}
			}
			if(fechas.length>0){
				var max = Math.max(...fechas);
				var min = Math.min(...fechas);
				
				if(max == min ){
					fecha_max = "";
					fecha_min = this.formatCell3("/Date("+min+")/");
				}else{
					fecha_max = this.formatCell3("/Date("+max+")/");
					fecha_min = this.formatCell3("/Date("+min+")/");
				}
				
			}else{
				fecha_max = "";
			}
			
			var fechaFinal=this.getView().byId("fecharangoFinalPlanNoProg").getValue();
			var fechaInicial=fecha_min;
			// console.log(fechaInicial)
			if(fechaFinal == "" ){
				var fechaInicialSplit = fechaInicial.split(".");
				var year0 = parseInt(fechaInicialSplit[2]);
				var mount0 = parseInt(fechaInicialSplit[1]);
				var day0 = parseInt(fechaInicialSplit[0]);
				this.getView().byId("fecharangoInicialPlanNoProg").setMinDate(new Date(year0, mount0-1, day0));
			}else{
				var fechaFinalSplit = fechaFinal.split(".");
				var year = parseInt(fechaFinalSplit[2]);
				var mount = parseInt(fechaFinalSplit[1]);
				var day = parseInt(fechaFinalSplit[0]);
				this.getView().byId("fecharangoInicialPlanNoProg").setMaxDate(new Date(year, mount-1, day-1));
			
				var fechaInicialSplit = fechaInicial.split(".");
				var year0 = parseInt(fechaInicialSplit[2]);
				var mount0 = parseInt(fechaInicialSplit[1]);
				var day0 = parseInt(fechaInicialSplit[0]);
				this.getView().byId("fecharangoInicialPlanNoProg").setMinDate(new Date(year0, mount0-1, day0));
			}
		},
		eventchangeFechainicialPlanNoProg:function(){
			var ModeloProyect = oView.getModel("Proyect");
			var fechaInicial2 = ModeloProyect.getProperty("/FechaArraFechaPenInicioPlan");
			
			var fechaInicial=this.getView().byId("fecharangoInicialPlanNoProg").getValue();
			
			var dateActual=new Date()
			var anioActual=dateActual.getFullYear()
			var diaValidation=fechaInicial.split(".")[0];
			var mesValidation=fechaInicial.split(".")[1];
			var anioValidation=fechaInicial.split(".")[2];
			var fechaTotalInicial = new Date( anioValidation + "/" + mesValidation + "/" + diaValidation).getTime();
			
			
			if(fechaInicial == ""){
				MessageToast.show("Ingresar Fecha", {
					duration: 4000,
					my: "center center",
					at: "center center"
				});
			}else{
				if(diaValidation != undefined && mesValidation != undefined && anioValidation != undefined && (parseInt(anioValidation)>=parseInt(anioActual))){
					if(fechaTotalInicial>=fechaInicial2[0]){
						this.InsertRangoFechasPlan()
					}else{
						MessageToast.show("Seleccion de fecha incorrecta", {
							duration: 4000,
							my: "center center",
							at: "center center"
						});	
					}
				}else{
					MessageToast.show("Formato Incorrecto: DD.MM.YYYY", {
						duration: 4000,
						my: "center center",
						at: "center center"
					});	
				}
			}
		},
		//DatePicker Plan No Prog
		ValidarCamposFechaPlanNoProg:function(oEvent){
			var oView = this.getView();
			var table = oView.byId("idTableRegistroDisponiblePlanNoProg");
			var indece = table.getSelectedIndex()
			var context = oEvent.getParameter("rowContext");
			var context2 = "/DataFechaPlanNoProg/"+indece.toString();
			var Object;
			if(context != null){
				var oIndex = oEvent.getParameter('rowIndex');
				var Selecciones =table.getSelectedIndices();
				Object = this.getView().getModel("Proyect").getProperty(context2);
				if(Object != undefined){
					if(Selecciones.length==0){
						localStorage.setItem("arrayFechasDisponiblesPlanNoProg", JSON.stringify([]));
					}else if(Selecciones.length==1){
						localStorage.setItem("arrayFechasDisponiblesPlanNoProg", JSON.stringify(Object));
					}else{
						table.removeSelectionInterval(oIndex,oIndex);
					}
				}else{
					if(Selecciones.length==0){
						localStorage.setItem("arrayFechasDisponiblesPlanNoProg", JSON.stringify([]));
						table.removeSelectionInterval(oIndex,oIndex);
					}else if(Selecciones.length==1){
						table.removeSelectionInterval(oIndex,oIndex);
					}else{
						table.removeSelectionInterval(oIndex,oIndex);
					}
				}
			}else{
				localStorage.setItem("arrayFechasDisponiblesPlanNoProg", JSON.stringify([]));
			}
			//console.log(localStorage.getItem("arrayFechasDisponiblesPlanNoProg"))
		},
		GuardarFechaPlanNoProg:function(){
			that = this;
			oView = this.getView();
			var fecha = JSON.parse(localStorage.getItem('arrayFechasDisponiblesPlanNoProg'));
			if(fecha.FECHAS == undefined ){
				MessageToast.show("Seleccione Fecha", {
					duration: 4000,
					my: "center center",
					at: "center center"
				});
			}else{
				sap.m.MessageBox.confirm("¿Desea modificar la fecha?", {
					title: "Mensaje",
					actions: ["Si","Cancelar"],
					onClose: function (sActionClicked) {
						if(sActionClicked==="Si"){
							BusyIndicator.show(0);
							that.EstructuraPostPlanNoProg();
						}else{
							oView.byId("idTableRegistroDisponiblePlanNoProg").clearSelection();
						}
					}
				});
			}
		},
		EstructuraPostPlanNoProg:function(){
			var arrayOrdenesPlanificadas = JSON.parse(localStorage.getItem('arrayOrdenesPlanificadas'));
			var fecha = JSON.parse(localStorage.getItem('arrayFechasDisponiblesPlanNoProg'));
			var arr = [];
			var vbeln;
			for(var i=0;i<arrayOrdenesPlanificadas.length;i++){
				vbeln = arrayOrdenesPlanificadas[i].DescripcionGeneralEntrega
				var objSap = {
					  "Vbeln": vbeln,
					  "Lfdat": this.formatAbapDate(fecha.FECHAS),
					  "Lfuhr": this.formatAbapHours("00:00:00"),
					}
				arr.push(objSap)
			}
			var objEnvioSap = {
			  "Modificar": "X",
			  "ItemSet": arr,
			  "NAVRESULT": [
			    {"Vbeln": "",
			      "Codigo": "",
			      "Mensaje": ""
			    }
			  ]
			}
			// this.methodPostSap(arr,"/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_MODIFICAR_ENT_SRV","/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_MODIFICAR_ENT_SRV/ZETMODENTREGASet","DialogSelecFechaPlanNoProg","0");
			this.CerrarDialogSelecFechaPlanNoProg();
			this.methodPostSap(objEnvioSap,"/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_MODIFICAR_ENT_SRV","/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_MODIFICAR_ENT_SRV/ZetModificarSet","DialogSelecFechaPlanNoProg","2","","","",objEnvioSap.ItemSet.length);
			BusyIndicator.hide();
		},
		//Dialog Plan Prog
		CerrarDialogSeleccionarFechaPlan:function(){
			oView=this.getView();
			arrInsert=[]
			localStorage.setItem("arrayOrdenesPlanificadas", JSON.stringify([]));
			localStorage.setItem("arrayFechasDisponiblesPlan", JSON.stringify([]));
			var ModeloProyect = oView.getModel("Proyect");
			if(this.getView().byId("idTableRegistroDisponiblePlan")!= undefined){
				this.getView().byId("idTableRegistroDisponiblePlan").clearSelection();
				this.getView().byId("TreeTable2").clearSelection();
				oView.byId("fecharangoInicialPlan").setValue("")
				oView.byId("fecharangoFinalPlan").setValue("")
				oView.byId("nEntregaPlan").setValue("")
			}
			if(oView.byId("DialogSelecFechaPlanProg") != undefined){
				oView.byId("DialogSelecFechaPlanProg").close();
			}
			ModeloProyect.setProperty("/DataFechaPlan" ,[]);
		},
		DialogSeleccionarFechaProgramadaPlanificada:function(){
			that = this;
			var ModeloProyect = oView.getModel("Proyect");
			var arrcontador =[];
			var arrayOrdenesPlanificadas = JSON.parse(localStorage.getItem('arrayOrdenesPlanificadas'));
			// console.log(arrayOrdenesPlanificadas)
			var fechas=[];
			var fecha_max;
			var fecha_min;
			if(arrayOrdenesPlanificadas[0] === undefined){
				MessageToast.show("No se ha seleccionado Numero de Entrega", {
					duration: 4000,
					my: "center center",
					at: "center center"
				});
			}else{
				var dateActual=new Date();
				fechas.push(dateActual.getTime());
				for(var i=0;i<arrayOrdenesPlanificadas.length;i++){
					var fecha= this.formatCell(arrayOrdenesPlanificadas[i].fecha);
					var hora= this.formatCellAbapHours(arrayOrdenesPlanificadas[i].hora);
					// var fechaarray = fecha + " " + hora;
					var fechaarray = fecha ;
					if(arrayOrdenesPlanificadas.length > 1){
						// var newfechaarray =  fecha.split(".")[2] + "/" + fecha.split(".")[1] + "/"+fecha.split(".")[0] + " " + hora
						var newfechaarray =  fecha.split(".")[2] + "/" + fecha.split(".")[1] + "/"+fecha.split(".")[0];
						var date= (new Date(newfechaarray)).getTime();
						fechas.push(date);
					}else{
						fecha_max = "";
						fecha_min = dateActual.getTime();
					}
				}
				if(fechas.length>1){
					var max = Math.max(...fechas);
					var min = Math.min(...fechas);
					if(max == min ){
						fecha_max = "";
						fecha_min = this.formatCell3("/Date("+fechas[0]+")/");
					}else{
						// fecha_max = this.formatCell3("/Date("+max+")/");
						fecha_max=""
						fecha_min = this.formatCell3("/Date("+fechas[0]+")/");
					}
				}else{
					fecha_max = "";
					fecha_min = this.formatCell3("/Date("+fechas[0]+")/");
				}
				ModeloProyect.setProperty("/FechaArraFecha",fechas);
				
				if (!oView.byId("DialogSelecFechaPlanProg")) {
					// load asynchronous XML fragment
					Fragment.load({
						id: oView.getId(),
						name: "com.rava.fragment.FechasPlanificadas.SelecFechaPlanProg",
						controller: that
					}).then(function (oDialog) {
						// ModeloProyect.setProperty("/DataConstanteFechaInicial" ,fecha_min);
						oView.byId("fecharangoInicialPlan").setValue(fecha_min)
						oView.byId("fecharangoFinalPlan").setValue(fecha_max)
						oView.byId("nEntregaPlan").setValue(arrayOrdenesPlanificadas.length)
						oView.addDependent(oDialog);
						oDialog.open();
						// that.getFilterTableFecha(fecha_min,fecha_max);
						// that.getFilterConstantPlan("MM","PLANIFICACION_ENTREGA_PORTAL","HORARIO");
						that.getFilterConstantCentroPlan("MM","PLANIFICACION_ENTREGA_PORTAL","CENTRO",arrcontador);
					});
				} else {
					// ModeloProyect.setProperty("/DataConstanteFechaInicial" ,fecha_min);
					oView.byId("fecharangoInicialPlan").setValue(fecha_min)
					oView.byId("fecharangoFinalPlan").setValue(fecha_max)
					oView.byId("nEntregaPlan").setValue(arrayOrdenesPlanificadas.length)
					oView.byId("DialogSelecFechaPlanProg").open();
					// that.getFilterTableFecha(fecha_min,fecha_max);
					// that.getFilterConstantPlan("MM","PLANIFICACION_ENTREGA_PORTAL","HORARIO");
					that.getFilterConstantCentroPlan("MM","PLANIFICACION_ENTREGA_PORTAL","CENTRO",arrcontador);
				}
			}
		},
		getFilterConstantCentroPlan:function(modulo,aplicativo,funcion,arrcontador){
			BusyIndicator.show();
			that=this;
			oView=this.getView();
			
			var extra =1;
			var arrayOrdenesPlanificadas = JSON.parse(localStorage.getItem('arrayOrdenesPlanificadas'));
			var arrCentro=[];
			arrCentro = arrayOrdenesPlanificadas;
			var cant = arrCentro.length;
			const myObj = {}
			
			for ( var i=0, len=arrCentro.length; i < len; i++ )
		    myObj[arrCentro[i]['Centro']] = arrCentro[i].Centro;
			
			arrCentro = new Array();
			for ( var key in myObj )
			arrCentro.push(myObj[key]);
			
			var ModeloProyect = oView.getModel("Proyect");
			var contador=0;
			$.ajax({
				url: "/backendhana/IPROVIDER_ENTREGA/ENTREGA_PROVEEDOR/Registro_ENTREGAPROVEEDOR_centro.xsjs?modulo="+modulo+"&aplicativo="+aplicativo+"&funcion="+funcion,
				method: "GET",
				contentType: 'application/json',
				headers: {Authorization: "Basic VVNSX1JBVkE6UmF2YTIwMjAk"},
				success: function (data) {
					if(Object.keys(data).length >0){
						for(var i=0;i<Object.keys(data).length;i++){
							for(var j=0;j<arrayOrdenesPlanificadas.length;j++){
								if(data[i].CENTRO == arrayOrdenesPlanificadas[j].Centro){
									contador++;
								}
							}
						}
					}
					
					
					if(contador==0){
						ModeloProyect.setProperty("/DataConstanteCentroPlan" ,arrCentro);
						that.getFilterConstantPlan("MM","PLANIFICACION_ENTREGA_PORTAL","HORARIO",arrcontador,extra);
					}else{
						for(var i=0;i<Object.keys(data).length;i++){
							arrCentro.push(data[i].CENTRO)
						}
						
						var cant = arrCentro.length;
						const myObj = {}
						
						for ( var i=0, len=arrCentro.length; i < len; i++ )
						myObj[arrCentro[i]] = arrCentro[i];
							
						arrCentro = new Array();
						for ( var key in myObj )
						arrCentro.push(myObj[key]);
						
						ModeloProyect.setProperty("/DataConstanteCentroPlan" ,arrCentro);
						that.getFilterConstantPlan("MM","PLANIFICACION_ENTREGA_PORTAL","HORARIO",arrcontador,extra);
					}
					
				},
				error: function (e){console.log("Ocurrio un error" + JSON.parse(e))}
			  });
		},
		getFilterConstantPlan:function(modulo,aplicativo,funcion,arrcontador,extra){
			that=this;
			oView=this.getView();
			
			var ModeloProyect = oView.getModel("Proyect");
			var oJsonModel = new sap.ui.model.json.JSONModel();
			var contador=ModeloProyect.getProperty("/DataConstanteContador");
			
			
			var fecha_rangfin;
			var fecha_rangini;
			var rangoFecha=ModeloProyect.getProperty("/FechaArraFecha");
			if(rangoFecha.length>1){
				var max = Math.max(...rangoFecha);
				var min = Math.min(...rangoFecha);
				if(max == min ){
					fecha_rangfin = "";
					fecha_rangini = this.formatCell3("/Date("+rangoFecha[0]+")/");
				}else{
					fecha_rangfin = this.formatCell2("/Date("+max+")/");
					fecha_rangini = this.formatCell3("/Date("+rangoFecha[0]+")/");
				}
			}else{
				fecha_rangfin = "";
				fecha_rangini = this.formatCell3("/Date("+rangoFecha[0]+")/");
			}
			
			var dateActual=new Date(rangoFecha[0]);
			var fechaDateActual= dateActual.getFullYear()+"/"+
					that.formatosCellValidateNumbers(dateActual.getMonth()+1)+"/"+
					that.formatosCellValidateNumbers(dateActual.getDate())+" "+
					dateActual.getHours()+ ":" +
					dateActual.getMinutes()+":"+
					dateActual.getSeconds()
			
			var fechaDateActual2= that.formatosCellValidateNumbers(dateActual.getDate())+"."+
					that.formatosCellValidateNumbers(dateActual.getMonth()+1)+"."+
					dateActual.getFullYear();
					// +" "+
					// that.formatosCellValidateNumbers(dateActual.getHours())+ ":" +
					// that.formatosCellValidateNumbers(dateActual.getMinutes())+":"+
					// that.formatosCellValidateNumbers(dateActual.getSeconds())
			
			var fecha_min = oView.byId("fecharangoInicialPlan").getValue();
			var fecha_max = oView.byId("fecharangoFinalPlan").getValue();
			var arrHorario = [];
			var arrRangoFecha = []
			if(fecha_max == ""){
				arrRangoFecha.push(fecha_min);
				// arrRangoFecha.push(fechaDateActual2);
			}else{
				var fechaInicio = this.formatosFilterDateRegistro(fecha_min);
				var fechaFin    = this.formatosFilterDateRegistro(fecha_max);
				
				while(fechaFin.getTime() >= fechaInicio.getTime()){
					fechaInicio.setDate(fechaInicio.getDate() + 1);
					var date =  fechaInicio.getDate()+ '.' + (fechaInicio.getMonth() + 1)+'.' +fechaInicio.getFullYear()  ;
				    arrRangoFecha.push(date)
				}
			}
			// var dataStandar =new Date(fecha_rangini)
			var dataStandar =new Date(fechaDateActual)
			dataStandar=that.formatosCellValidateNumbers(dataStandar.getDate())+"."+
					that.formatosCellValidateNumbers(dataStandar.getMonth()+1)+"."+
					dataStandar.getFullYear();
					
			var fechadiaSemana=new Date(this.formatosFilterDateRegistro2(fecha_min));
			// ModeloProyect.setProperty("/DataConstanteHorarioValidate" ,arrRangoFecha);
			ModeloProyect.setProperty("/DataConstanteHorarioValidate" ,dataStandar);
			
			if(fechadiaSemana.getDay() == 6 || fechadiaSemana.getDay() == 0){
				extra++;
			}
			// else{
			// 	extra=1
			// }
			
			if(arrRangoFecha.length<7){
				$.ajax({
				url: "/backendhana/IPROVIDER_ENTREGA/ENTREGA_PROVEEDOR/Registro_ENTREGAPROVEEDOR.xsjs?modulo="+modulo+"&aplicativo="+aplicativo+"&funcion="+funcion,
				method: "GET",
				contentType: 'application/json',
				headers: {
				  Authorization: "Basic VVNSX1JBVkE6UmF2YTIwMjAk"
				},
				success: function (data) {
					var primero = true;
					for(var a = 0; a<arrRangoFecha.length;a++){
						var FECHAS = arrRangoFecha[a];
						for(var i=0;i<Object.keys(data).length;i++){
							var desde = parseInt(data[i].DESDE);
							var hasta = parseInt(data[i].HASTA);
							var nEntregas = data[i].NUMERO_ENTREGA;
							var cantProveedores = data[i].CONTADOR;
							var rango_horas = hasta - desde;
							for(var k = 0;k < rango_horas ;k++){
								var obj={};
								obj.NUMERO_ENTREGA = nEntregas;
								obj.FECHAS = FECHAS;
								obj.STATUS = "No Disponible";
								obj.HORARIOS = that.formatosFechasHoras(desde+k);
								obj.PROVEEDORES = cantProveedores;
								var fechacompobj=obj.FECHAS.split(".")[2] + "/" + obj.FECHAS.split(".")[1] + "/"+obj.FECHAS.split(".")[0]+" "+obj.HORARIOS;
								if(fechadiaSemana.getDay() == 6 || fechadiaSemana.getDay() == 0){
									primero = false;
									arrHorario=[];
								}else{
									if( ( new Date(fechaDateActual2.split(".")[2]+"/"+ fechaDateActual2.split(".")[1] +"/"+fechaDateActual2.split(".")[0]).getTime()+ extra * 24  * 60  * 60 * 1000) == new Date(obj.FECHAS.split(".")[2] + "/" + obj.FECHAS.split(".")[1] + "/"+obj.FECHAS.split(".")[0]).getTime() ){
										primero = false;
									}	
									if(	dateActual.getTime() <= new Date(fechacompobj).getTime() ){
										arrHorario.push(obj);
									}
								}
							}
						}
					}
					console.log(arrHorario);
					
					// var fechavalidate=new Date(fecha_rangini);
					var fechavalidate=new Date(fechaDateActual);
					fechavalidate=that.formatosCellValidateNumbers(fechavalidate.getDate())+"."+
					that.formatosCellValidateNumbers(fechavalidate.getMonth()+1)+"."+
					fechavalidate.getFullYear();
					if(arrHorario.length >contador){
						if(fecha_max == ""){
							for(var i=0;i<contador;i++){
								arrHorario.shift();
							} 
							ModeloProyect.setProperty("/DataConstantePlan" ,arrHorario);
							that.getFilterTableFechaWherePlan();
						}else{
							var cant = arrHorario.length;
							const myObj = {}
							
							for ( var i=0, len=arrHorario.length; i < len; i++ )
						    myObj[arrHorario[i]['FECHAS']] = arrHorario[i].FECHAS;
							
							var arrHorario2 = new Array();
							for ( var key in myObj )
							arrHorario2.push(myObj[key]);
							var contador2 =contador*(arrHorario2.length)
							if(contador==8 && fecha_min!=(fechavalidate)){
								ModeloProyect.setProperty("/DataConstantePlan" ,arrHorario);
								that.getFilterTableFechaWherePlan();
							}else if(fecha_min==fechavalidate ) {
								contador = contador2-arrHorario.length;
								ModeloProyect.setProperty("/DataConstanteContador" ,contador);
								arrcontador.push(contador)
								ModeloProyect.setProperty("/DataConstanteContadorRecuerto" ,arrcontador);
								var nuevaFecha=(arrHorario[0].FECHAS).split(".");
								var newdia=nuevaFecha[0];
								var newmes=nuevaFecha[1];
								var newanio=nuevaFecha[2];
								var newFecha=new Date( (new Date(newanio+"/"+newmes+"/"+newdia)).getTime()+(1 *24  * 60  * 60 * 1000) );
								newFecha = that.formatosCellValidateNumbers( newFecha.getDate() )+"."+
								that.formatosCellValidateNumbers( (newFecha.getMonth()+1) )+"."+
								newFecha.getFullYear() ;
								
								ModeloProyect.setProperty("/DataConstanteFechaInicial" ,newFecha);
								oView.byId("fecharangoInicialPlan").setValue(newFecha)
								that.getFilterConstantPlan("MM","PLANIFICACION_ENTREGA_PORTAL","HORARIO",arrcontador,extra)
							}else{
								for(var i=0;i<contador;i++){
									arrHorario.shift();
								} 
								ModeloProyect.setProperty("/DataConstantePlan" ,arrHorario);
								that.getFilterTableFechaWherePlan();
							}
						}
					}else if(arrHorario.length==6 && contador==8 && fecha_min!=(fechavalidate) && primero){
						ModeloProyect.setProperty("/DataConstantePlan" ,arrHorario);
						that.getFilterTableFechaWherePlan();
					}else{
						contador = contador - arrHorario.length;
						ModeloProyect.setProperty("/DataConstanteContador" ,contador);
						arrcontador.push(contador)
						ModeloProyect.setProperty("/DataConstanteContadorRecuerto" ,arrcontador);
						var nuevaFecha=(fecha_min).split(".");
						var newdia=nuevaFecha[0];
						var newmes=nuevaFecha[1];
						var newanio=nuevaFecha[2];
					
						var newFecha=new Date( (new Date(newanio+"/"+newmes+"/"+newdia)).getTime()+(1 *24  * 60  * 60 * 1000) );
						newFecha = that.formatosCellValidateNumbers( newFecha.getDate() )+"."+
						that.formatosCellValidateNumbers( (newFecha.getMonth()+1) )+"."+
						newFecha.getFullYear() ;

						ModeloProyect.setProperty("/DataConstanteFechaInicial" ,newFecha);
						oView.byId("fecharangoInicialPlan").setValue(newFecha)
						// that.getFilterConstantCentroPlan("MM","PLANIFICACION_ENTREGA_PORTAL","CENTRO");
						that.getFilterConstantPlan("MM","PLANIFICACION_ENTREGA_PORTAL","HORARIO",arrcontador,extra);
					}
					
				},
				error: function (e) {
					console.log("Ocurrio un error" + JSON.parse(e))
				}
			  });
			}else{
				MessageToast.show("Seleccione rango de fecha menor a una semana", {
					duration: 3000,
					my: "center center",
					at: "center center"
				});
			}
		},
		getFilterTableFechaWherePlan: function(){
			that=this;
			oView=this.getView();
			var ModeloProyect = oView.getModel("Proyect");
			var arrayOrdenesPlanificadas = JSON.parse(localStorage.getItem('arrayOrdenesPlanificadas'));
			var DataConstanteCentro=ModeloProyect.getProperty("/DataConstanteCentroPlan");
			var dataConsta=ModeloProyect.getProperty("/DataConstantePlan");
			// console.log(arrayOrdenesPendientes)
			
			var fecha_min=this.getView().byId("fecharangoInicialPlan").getValue();
			var fecha_max=this.getView().byId("fecharangoFinalPlan").getValue();
			var arr=[];
			var arrProv=[];
			var url
			// for(var i=0;i<DataConstanteCentro.length;i++){
			// 	url ="/backendhana/IPROVIDER_ENTREGA/REGISTRO_FECHA/RegistroFechaFiltar2.xsjs?centro="+DataConstanteCentro[i]+"&fecha_min="+fecha_min+"&fecha_max="+fecha_max
				url ="/backendhana/IPROVIDER_ENTREGA/REGISTRO_FECHA/RegistroFechaTotalFiltar.xsjs?fecha_min="+fecha_min+"&fecha_max="+fecha_max
				// console.log(url)
				$.ajax({
					url: url,
					method: "POST",
					contentType: 'application/json',
					data		:JSON.stringify(DataConstanteCentro),
					headers: {Authorization: "Basic VVNSX1JBVkE6UmF2YTIwMjAk"},
					success: function (data) {
						// console.log(data)
						for(var i=0;i<Object.keys(data).length;i++){
							data[i].FECHA=(data[i].FECHA).split("T")[0]
							data[i].HORA=(data[i].HORA).split("T")[1].split(".")[0]
							arr.push(data[i]);
						}
						
						// console.log("constan",dataConsta);
						// console.log("registtro",arr)
						
						var totalEntregaRegistrados=0;
						var totalProvRegistrados = 0;
						for(var i=0;i<dataConsta.length;i++){
							var dateConst = that.formatosFilterDate(dataConsta[i].FECHAS,dataConsta[i].HORARIOS).getTime();
							dataConsta[i].STATUS = "No Disponible"
							totalEntregaRegistrados = 0;
							totalProvRegistrados = 0;
							for(var k=0;k<arr.length;k++){
								var dateFecha = new Date(arr[k].FECHA+" "+arr[k].HORA).getTime();
								if(dateConst === dateFecha){
									var entRegistrada = parseInt(arr[k].ENTREGAS_REGISTRADAS)
									var provRegistrada = 1
									totalEntregaRegistrados += entRegistrada;
									totalProvRegistrados += provRegistrada;
								}
							}
							
							if(totalEntregaRegistrados<parseInt(dataConsta[i].NUMERO_ENTREGA)){
								if(parseInt(dataConsta[i].PROVEEDORES) > totalProvRegistrados){
									dataConsta[i].STATUS = "Disponible"
								}else{
									dataConsta[i].STATUS = "No Disponible"
								}
							}else{
								dataConsta[i].STATUS = "No Disponible"
							}
							
						}
							
						for(var i=0;i<dataConsta.length;i++){
							var date = dataConsta[i].FECHAS.split(".")
							dataConsta[i].FECHAS=that.formatosCellValidateNumbers(date[0])+ "." + that.formatosCellValidateNumbers(date[1])+ "." +that.formatosCellValidateNumbers(date[2])
						}
						
						ModeloProyect.setProperty("/DataFechaPlan" ,dataConsta);
					},
					error: function (e) {
						console.log("Ocurrio un error" + JSON.parse(e))
					}
				});
			// }
			// ModeloProyect.setProperty("/DataFechaPlan" ,dataConsta);
			BusyIndicator.hide();
		},
		//Dialog Plan Prog
		//valida onclick en campos
		ValidarCamposFechaPlan:function(oEvent){
			var oView = this.getView();
			var table = oView.byId("idTableRegistroDisponiblePlan");
			var indece = table.getSelectedIndex()
			var context = oEvent.getParameter("rowContext");
			var context2 = "/DataFechaPlan/"+indece.toString();
			var Object;
			if(context != null){
				var oIndex = oEvent.getParameter('rowIndex');
				var Selecciones =table.getSelectedIndices();
				Object = this.getView().getModel("Proyect").getProperty(context2);
				if(Object != undefined){
					if(Selecciones.length==0){
						localStorage.setItem("arrayFechasDisponiblesPlan", JSON.stringify([]));
					}else if(Selecciones.length==1){
						localStorage.setItem("arrayFechasDisponiblesPlan", JSON.stringify(Object));
						if(Object.STATUS != "Disponible"){
							// MessageToast.show("Solo se puede seleccionar Numero de Entrega");
							// var newIndice = table.getSelectedIndex() + 1;
							MessageToast.show("NO ES POSIBLE SELECCIONAR, FECHA NO DISPONIBLE", {
								duration: 4000,
								my: "center center",
								at: "center center"
							});	
							table.removeSelectionInterval(oIndex,oIndex);
							// table.setSelectedIndex(indece+1);
						}
					}else{
						table.removeSelectionInterval(oIndex,oIndex);
					}
				}else{
					if(Selecciones.length==0){
						localStorage.setItem("arrayFechasDisponiblesPlan", JSON.stringify([]));
						table.removeSelectionInterval(oIndex,oIndex);
					}else if(Selecciones.length==1){
						table.removeSelectionInterval(oIndex,oIndex);
					}else{
						table.removeSelectionInterval(oIndex,oIndex);
					}
				}
			}else{
				localStorage.setItem("arrayFechasDisponiblesPlan", JSON.stringify([]));
			}
			//console.log(localStorage.getItem("arrayFechasDisponiblesPlan"))
		},
		GuardarDialogSelecFechaPlan:function(){
			that = this;
			oView = this.getView();
			var fecha = JSON.parse(localStorage.getItem('arrayFechasDisponiblesPlan'));
			
			if(fecha.FECHAS == undefined ){
				MessageToast.show("Seleccione Fecha", {
					duration: 4000,
					my: "center center",
					at: "center center"
				});
			}else{
				sap.m.MessageBox.confirm("¿Desea modificar la fecha?", {
					title: "Mensaje",
					actions: ["Si","Cancelar"],
					onClose: function (sActionClicked) {
						if(sActionClicked==="Si"){
							BusyIndicator.show(0);
							that.ValidacionDisponibilidadPlan()
						}else{
							oView.byId("idTableRegistroDisponiblePlan").clearSelection();
						}
					}
				});
			}
		},
		ValidacionDisponibilidadPlan:function(){
			that=this;
			oView=this.getView();
			var ModeloProyect = oView.getModel("Proyect");
			
			var arrayOrdenesPlanificadas = JSON.parse(localStorage.getItem('arrayOrdenesPlanificadas'));
			var arrayFechaDisponibles = JSON.parse(localStorage.getItem('arrayFechasDisponiblesPlan'));
			
			var oDataCentro=ModeloProyect.getProperty("/DataConstantCentro");
			
			var arrCentro=[];
			arrCentro = arrayOrdenesPlanificadas;
			var cant = arrCentro.length;
			const myObj = {}
			
			for ( var i=0, len=arrCentro.length; i < len; i++ )
		    myObj[arrCentro[i]['Centro']] = arrCentro[i].Centro;
			
			arrCentro = new Array();
			for ( var key in myObj )
			arrCentro.push(myObj[key]);
			
			var arrCantCentro=[];
			for(var i=0;i<arrCentro.length;i++){
				var cantidadcentro=0;
				var obj={};
				obj.centro=arrCentro[i];
				for(var j=0;j<arrayOrdenesPlanificadas.length;j++){
					if(arrCentro[i] == arrayOrdenesPlanificadas[j].Centro){
						cantidadcentro += 1;
						obj.numero=cantidadcentro;
						
					}
				}
				arrCantCentro.push(obj)
			}
			
			for(var i=0; i<arrCantCentro.length;i++){
				for(var j=0; j<arrayOrdenesPlanificadas.length;j++){
					if(arrCantCentro[i].centro ==arrayOrdenesPlanificadas[j].Centro){
						arrayOrdenesPlanificadas[j].ID_Eliminar = "";
						arrayOrdenesPlanificadas[j].Enviar = arrCantCentro[i].numero;
					}
				}
			}
			
			if(arrayFechaDisponibles.FECHAS != undefined){
				var fechaComparativa = this.formatosFilterDate(arrayFechaDisponibles.FECHAS,arrayFechaDisponibles.HORARIOS).getTime();
				
				var codigoprov = arrayOrdenesPlanificadas[0].ArrayGeneral2[0].Lifnr;
				var centro = arrayOrdenesPlanificadas[0].ArrayGeneral2[0].Werks;
				
				var fecha = arrayFechaDisponibles.FECHAS;
				var horario = arrayFechaDisponibles.HORARIOS;
				var arr=[];
				
				var arratotal=[];
				
				var url ="/backendhana/IPROVIDER_ENTREGA/REGISTRO_FECHA/RegistroHorarioFiltrar3.xsjs?fecha="+fecha+"&horario="+horario
				// var url ="/backendhana/IPROVIDER_ENTREGA/REGISTRO_FECHA/RegistroHorarioFiltrar2.xsjs?centro="+centro+"&fecha="+fecha+"&horario="+horario
	
				$.ajax({
					url: url,
					method: "POST",
					contentType: 'application/json',
					headers: {Authorization: "Basic VVNSX1JBVkE6UmF2YTIwMjAk"},
					data		:JSON.stringify(arrCentro),
					success: function (data) {
						var arrCentro=[];
						arrCentro = arrayOrdenesPlanificadas;
						var cant = arrCentro.length;
						const myObj = {}
						
						for ( var i=0, len=arrCentro.length; i < len; i++ )
					    myObj[arrCentro[i]['Centro']] = arrCentro[i].Centro;
						
						arrCentro = new Array();
						for ( var key in myObj )
						arrCentro.push(myObj[key]);
						
						var arrCantCentro=[];
						for(var i=0;i<arrCentro.length;i++){
							var cantidadcentro=0;
							var obj={};
							obj.centro=arrCentro[i];
							for(var j=0;j<arrayOrdenesPlanificadas.length;j++){
								if(arrCentro[i] == arrayOrdenesPlanificadas[j].Centro){
									cantidadcentro += 1;
									obj.numero=cantidadcentro;
									
								}
							}
							arrCantCentro.push(obj)
						}
						
						var objtotal={}
						var nEntregasInsertar = arrayOrdenesPlanificadas.length;
						if(Object.keys(data).length>0){
							for(var i=0;i<Object.keys(data).length;i++){
								data[i].FECHA=(data[i].FECHA).split("T")[0]
								data[i].HORA=(data[i].HORA).split("T")[1].split(".")[0]
								arr.push(data[i]);
							}
							var totalEntregaRegistrados = 0;
							for(var i=0;i<arr.length;i++){
								var dateFecha = new Date(arr[i].FECHA+" "+arr[i].HORA).getTime();
								if(fechaComparativa === dateFecha){
									var entRegistrada = parseInt(arr[i].ENTREGAS_REGISTRADAS)
									totalEntregaRegistrados += entRegistrada;
								}
							}
							
							if(totalEntregaRegistrados<parseInt(arrayFechaDisponibles.NUMERO_ENTREGA) ){
								var rangoEntregasDisponibles = parseInt(arrayFechaDisponibles.NUMERO_ENTREGA)-totalEntregaRegistrados;
								if(nEntregasInsertar<=rangoEntregasDisponibles){
									for(var i = 0;i<arr.length;i++){
										for(var j = 0;j<arrayOrdenesPlanificadas.length;j++){
											if(arr[i].CENTRO == arrayOrdenesPlanificadas[j].Centro){
												arrayOrdenesPlanificadas[j].ID_Eliminar = arr[i].ID_REGISTRO;
												arrayOrdenesPlanificadas[j].Enviar = arrayOrdenesPlanificadas[j].Enviar + parseInt(arr[i].ENTREGAS_REGISTRADAS);
											}
										}
									}
									objtotal.OrdenesPlanificadas = arrayOrdenesPlanificadas
									objtotal.FechaDisponibles = arrayFechaDisponibles
									arratotal.push(objtotal);
									that.EstructuraInsertFechaPlan(arratotal,"PUT")
								}else{
									var cont=0;
									var arraynuevo=[]
									objtotal.FechaDisponibles = arrayFechaDisponibles
									var cantidadSumatoria=rangoEntregasDisponibles;
									// for(var j=0;j<arr.length;j++){
									// 	for(var i=0;i<rangoEntregasDisponibles;i++){
									// 		if(arr[j].CENTRO == arrayOrdenesPlanificadas[i].Centro){
									// 			if(cantidadSumatoria >= arrCantCentro[j].numero){
									// 				cont ++;
									// 				arrayOrdenesPlanificadas[i].Enviar = parseInt(arr[j].ENTREGAS_REGISTRADAS)+arrCantCentro[j].numero
									// 				arraynuevo.push(arrayOrdenesPlanificadas[i])
									// 			}else{
									// 				cont ++;
									// 				arrayOrdenesPlanificadas[i].Enviar = parseInt(arr[j].ENTREGAS_REGISTRADAS)+(arrCantCentro[j].numero-cantidadSumatoria)
									// 				arraynuevo.push(arrayOrdenesPlanificadas[i])
									// 			}
									// 		}
									// 	}
									// 	cantidadSumatoria=cantidadSumatoria-cont;
									// }
									
									for(var i=0;i<arr.length;i++){
										for(var k=0;k<arrayOrdenesPlanificadas.length;k++){
											if(arr[i].CENTRO == arrayOrdenesPlanificadas[k].Centro){
												if(cantidadSumatoria !=0){
													if(cantidadSumatoria >= arrayOrdenesPlanificadas[k].Enviar){
														arrayOrdenesPlanificadas[k].Identificador = "realizado";
														arrayOrdenesPlanificadas[k].Enviar += parseInt(arr[i].ENTREGAS_REGISTRADAS);
													}else{
														arrayOrdenesPlanificadas[k].Identificador = "realizado";
														arrayOrdenesPlanificadas[k].Enviar = parseInt(arr[i].ENTREGAS_REGISTRADAS)+(arrayOrdenesPlanificadas[k].Enviar-cantidadSumatoria)
														// arrayOrdenesPlanificadas[k].Enviar = arrayFechaDisponibles.NUMERO_ENTREGA
														cantidadSumatoria--;
													}
												}
											}
										}
									}
									
									for(var i=0;i<arrayOrdenesPlanificadas.length;i++){
										if(arrayOrdenesPlanificadas[i].Identificador == "realizado"){
											arraynuevo.push(arrayOrdenesPlanificadas[i]);
										}
									}
									
									objtotal.OrdenesPlanificadas = arraynuevo
									arratotal.push(objtotal)
									for(var i=0;i<arraynuevo.length;i++){
										var index=arrayOrdenesPlanificadas.indexOf(arraynuevo[i])
										if (index !== -1) {
										    arrayOrdenesPlanificadas.splice(index, 1);
										  }
									}
									localStorage.setItem("arrayOrdenesPlanificadas", JSON.stringify(arrayOrdenesPlanificadas));
									// that.ValidacionDisponibilidad(arrayOrdenesPlanificadas,arrayFechaDisponibles)
									// oView.byId("idTableRegistroDisponible").clearSelection();
									var seleccionado = oView.byId("idTableRegistroDisponiblePlan").getSelectedIndex();
									
									
									var contextActual="/DataFechaPlan/"+seleccionado.toString();
									var contextNuevo="/DataFechaPlan/"+(seleccionado+1).toString();
									var actual= oView.getModel("Proyect").getProperty(contextActual);
									var nuevo= oView.getModel("Proyect").getProperty(contextNuevo);
									if(nuevo == undefined){
										MessageToast.show("No se pueden actualizar las ordenes", {
											duration: 4000,
											my: "center center",
											at: "center center"
										});
									}else{
										var horaactual=actual.HORARIOS.split(":")[0];
										var horanueva=nuevo.HORARIOS.split(":")[0];
										if((parseInt(horanueva)-parseInt(horaactual)) == 1){
											oView.byId("idTableRegistroDisponiblePlan").setSelectedIndex(seleccionado+1)
											that.ValidacionDisponibilidadPlan2(arratotal)
										}else{
												MessageToast.show("No se pueden actualizar las ordenes", {
													duration: 4000,
													my: "center center",
													at: "center center"
												});
										}
									}
								}
							}
						}else{
							if(nEntregasInsertar<parseInt(arrayFechaDisponibles.NUMERO_ENTREGA) ){
								// for(var i = 0;i<arrayOrdenesPlanificadas.length;i++){
								// 	arrayOrdenesPlanificadas[i].Enviar = arrayOrdenesPlanificadas.length;
								// }
								objtotal.OrdenesPlanificadas = arrayOrdenesPlanificadas
								objtotal.FechaDisponibles = arrayFechaDisponibles
								arratotal.push(objtotal)
								that.EstructuraInsertFechaPlan(arratotal,"POST")
							}else{
								BusyIndicator.hide();
								// that.CerrarDialogSeleccionarFechaPlan();
								// MessageBox.information("No se puede insertar mas de los numeros de entregas establecidos");
								var arraynuevo=[]
								objtotal.FechaDisponibles = arrayFechaDisponibles
								for(var i=0;i<parseInt(arrayFechaDisponibles.NUMERO_ENTREGA);i++){
									arrayOrdenesPlanificadas[i].Identificador == "realizado"
									arrayOrdenesPlanificadas[i].Enviar = parseInt(arrayFechaDisponibles.NUMERO_ENTREGA);
									arraynuevo.push(arrayOrdenesPlanificadas[i]);
								}
								objtotal.OrdenesPlanificadas = arraynuevo;
								for(var i=0;i<arraynuevo.length;i++){
									var index=arrayOrdenesPlanificadas.indexOf(arraynuevo[i])
									if (index !== -1) {
									    arrayOrdenesPlanificadas.splice(index, 1);
									  }
								}
								
								arratotal.push(objtotal)
								// console.log(arratotal)
								localStorage.setItem("arrayOrdenesPlanificadas", JSON.stringify(arrayOrdenesPlanificadas));
								var seleccionado = oView.byId("idTableRegistroDisponiblePlan").getSelectedIndex();
								var contextActual="/DataFechaPlan/"+seleccionado.toString();
								var contextNuevo="/DataFechaPlan/"+(seleccionado+1).toString();
								var actual= oView.getModel("Proyect").getProperty(contextActual);
								var nuevo= oView.getModel("Proyect").getProperty(contextNuevo);
								if(nuevo == undefined){
									MessageToast.show("No se pueden actualizar las ordenes", {
										duration: 4000,
										my: "center center",
										at: "center center"
									});
								}else{
									var horaactual=actual.HORARIOS.split(":")[0];
									var horanueva=nuevo.HORARIOS.split(":")[0];
									if((parseInt(horanueva)-parseInt(horaactual)) == 1){
										oView.byId("idTableRegistroDisponiblePlan").setSelectedIndex(seleccionado+1);
										that.ValidacionDisponibilidadPlan2(arratotal)
									}else{
										MessageToast.show("No se pueden actualizar las ordenes", {
											duration: 4000,
											my: "center center",
											at: "center center"
										});
									}
								}
							}
						}
					},
					error: function (e) {
						BusyIndicator.hide();
						console.log("Ocurrio un error" + JSON.parse(e))
					}
				  });
			}
		},
		ValidacionDisponibilidadPlan2:function(arratotal){
			that=this;
			oView=this.getView();
			
			var arrayOrdenesPlanificadas = JSON.parse(localStorage.getItem('arrayOrdenesPlanificadas'));
			var arrayFechaDisponibles = JSON.parse(localStorage.getItem('arrayFechasDisponiblesPlan'));
			
			var arrCentro=[];
			arrCentro = arrayOrdenesPlanificadas;
			var cant = arrCentro.length;
			const myObj = {}
			
			for ( var i=0, len=arrCentro.length; i < len; i++ )
		    myObj[arrCentro[i]['Centro']] = arrCentro[i].Centro;
			
			arrCentro = new Array();
			for ( var key in myObj )
			arrCentro.push(myObj[key]);
			
			var arrCantCentro=[];
			for(var i=0;i<arrCentro.length;i++){
				var cantidadcentro=0;
				var obj={};
				obj.centro=arrCentro[i];
				for(var j=0;j<arrayOrdenesPlanificadas.length;j++){
					if(arrCentro[i] == arrayOrdenesPlanificadas[j].Centro){
						cantidadcentro += 1;
						obj.numero=cantidadcentro;
						
					}
				}
				arrCantCentro.push(obj)
			}
			
			for(var i=0; i<arrCantCentro.length;i++){
				for(var j=0; j<arrayOrdenesPlanificadas.length;j++){
					if(arrCantCentro[i].centro ==arrayOrdenesPlanificadas[j].Centro){
						arrayOrdenesPlanificadas[j].ID_Eliminar = "";
						arrayOrdenesPlanificadas[j].Enviar = arrCantCentro[i].numero;
					}
				}
			}
			
			if(arrayFechaDisponibles.FECHAS != undefined){
				// console.log(arrayFechaDisponibles)
				var fechaComparativa = this.formatosFilterDate(arrayFechaDisponibles.FECHAS,arrayFechaDisponibles.HORARIOS).getTime();
				
				var codigoprov = arrayOrdenesPlanificadas[0].ArrayGeneral2[0].Lifnr;
				var centro = arrayOrdenesPlanificadas[0].ArrayGeneral2[0].Werks;
				
				var fecha = arrayFechaDisponibles.FECHAS;
				var horario = arrayFechaDisponibles.HORARIOS;
				var arr=[];
				
				var ModeloProyect = oView.getModel("Proyect");
				
				var url ="/backendhana/IPROVIDER_ENTREGA/REGISTRO_FECHA/RegistroHorarioFiltrar3.xsjs?fecha="+fecha+"&horario="+horario
				// var url ="/backendhana/IPROVIDER_ENTREGA/REGISTRO_FECHA/RegistroHorarioFiltrar2.xsjs?centro="+centro+"&fecha="+fecha+"&horario="+horario

				$.ajax({
					url: url,
					method: "POST",
					contentType: 'application/json',
					headers: {
					  Authorization: "Basic VVNSX1JBVkE6UmF2YTIwMjAk"
					},
					data		:JSON.stringify(arrCentro),
					success: function (data) {
						var arrCentro=[];
						arrCentro = arrayOrdenesPlanificadas;
						var cant = arrCentro.length;
						const myObj = {}
						
						for ( var i=0, len=arrCentro.length; i < len; i++ )
						myObj[arrCentro[i]['Centro']] = arrCentro[i].Centro;
						
						arrCentro = new Array();
						for ( var key in myObj )
						arrCentro.push(myObj[key]);
						
						var arrCantCentro=[];
						for(var i=0;i<arrCentro.length;i++){
							var cantidadcentro=0;
							var obj={};
							obj.centro=arrCentro[i];
							for(var j=0;j<arrayOrdenesPlanificadas.length;j++){
								if(arrCentro[i] == arrayOrdenesPlanificadas[j].Centro){
									cantidadcentro += 1;
									obj.numero=cantidadcentro;
									
								}
							}
							arrCantCentro.push(obj)
						}
						
						var objtotal={}
						var nEntregasInsertar = arrayOrdenesPlanificadas.length;
						if(Object.keys(data).length>0){
							for(var i=0;i<Object.keys(data).length;i++){
								data[i].FECHA=(data[i].FECHA).split("T")[0]
								data[i].HORA=(data[i].HORA).split("T")[1].split(".")[0]
								arr.push(data[i]);
							}
							var totalEntregaRegistrados = 0;
							for(var i=0;i<arr.length;i++){
								var dateFecha = new Date(arr[i].FECHA+" "+arr[i].HORA).getTime();
								if(fechaComparativa === dateFecha){
									var entRegistrada = parseInt(arr[i].ENTREGAS_REGISTRADAS)
									totalEntregaRegistrados += entRegistrada;
								}
							}
							
							if(totalEntregaRegistrados<parseInt(arrayFechaDisponibles.NUMERO_ENTREGA) ){
								var rangoEntregasDisponibles = parseInt(arrayFechaDisponibles.NUMERO_ENTREGA)-totalEntregaRegistrados;
								if(nEntregasInsertar<=rangoEntregasDisponibles){
									for(var i = 0;i<arr.length;i++){
										for(var j = 0;j<OrdenesPlanificadas.length;j++){
											if(arr[i].CENTRO == OrdenesPlanificadas[j].Centro){
												OrdenesPlanificadas[j].ID_Eliminar = arr[i].ID_REGISTRO;
												OrdenesPlanificadas[j].Enviar = OrdenesPlanificadas[j].Enviar + parseInt(arr[i].ENTREGAS_REGISTRADAS);
											}
										}
									}
	
									objtotal.OrdenesPlanificadas = arrayOrdenesPlanificadas
									objtotal.FechaDisponibles = arrayFechaDisponibles
									arratotal.push(objtotal);
									that.EstructuraInsertFechaPlan(arratotal,"PUT")
								}else{
									//BusyIndicator.hide();
									that.CerrarDialogSeleccionarFechaPlan();
									MessageToast.show("No se pueden actualizar las ordenes", {
										duration: 4000,
										my: "center center",
										at: "center center"
									});
								}
							}
						}else{
							if(nEntregasInsertar<parseInt(arrayFechaDisponibles.NUMERO_ENTREGA) ){
								objtotal.OrdenesPlanificadas = arrayOrdenesPlanificadas
								objtotal.FechaDisponibles = arrayFechaDisponibles
								arratotal.push(objtotal)
								that.EstructuraInsertFechaPlan(arratotal,"POST")
							}else{
								BusyIndicator.hide();
								that.CerrarDialogSeleccionarFechaPlan();
								MessageBox.information("No se ha puede insertar mas de los numeros de entregas establecidos");
							}
						}
					},
					error: function (e) {
						BusyIndicator.hide();
						console.log("Ocurrio un error" + JSON.parse(e))
					}
				});
			}else{
				MessageToast.show("No se pueden actualizar las ordenes", {
					duration: 4000,
					my: "center center",
					at: "center center"
				});
				BusyIndicator.hide();
				that.CerrarDialogSeleccionarFechaPlan();
			}
		},
		EstructuraInsertFechaPlan:function(arratotal,method){
			// console.log(arratotal)
			oView = this.getView();
			var centro;
			var proveedor;
			var entregasRegistradas;
			var vbeln;
			var arr = [];
			var arr2= [];
			var arr3= [];
			// console.log(arratotal)
			// centro = arratotal[0].OrdenesPlanificadas[0].ArrayGeneral2[0].Werks;
			proveedor = arratotal[0].OrdenesPlanificadas[0].ArrayGeneral2[0].Lifnr;
			for(var i=0; i< arratotal.length;i++){
				entregasRegistradas = 0
				var split = arratotal[i].FechaDisponibles.FECHAS.split(".")
				// for(var l=0;l<arratotal[i].OrdenesPlanificadas.length;l++ ){
				// 	entregasRegistradas= arratotal[i].OrdenesPlanificadas[l].Enviar.toString();
				// }
				// var obj = {
				// 	"CENTRO":centro,
				// 	"PROVEEDOR":proveedor,
				// 	"ENTREGAS_REGISTRADAS":entregasRegistradas,
				// 	"FECHA":split[2]+"-"+split[1]+"-"+split[0],
				// 	"HORA":arratotal[i].FechaDisponibles.HORARIOS
				// }
				// arr2.push(obj)
				for(var l=0;l<arratotal[i].OrdenesPlanificadas.length;l++ ){
					entregasRegistradas= arratotal[i].OrdenesPlanificadas[l].Enviar.toString();
					centro = arratotal[i].OrdenesPlanificadas[l].Centro;
					var obj = {
						"CENTRO":centro,
						"PROVEEDOR":proveedor,
						"ENTREGAS_REGISTRADAS":entregasRegistradas,
						"FECHA":split[2]+"-"+split[1]+"-"+split[0],
						"HORA":arratotal[i].FechaDisponibles.HORARIOS
					}
					arr2.push(obj)
				}
				for(var k=0;k<arratotal[i].OrdenesPlanificadas.length;k++){
					vbeln = arratotal[i].OrdenesPlanificadas[k].ArrayGeneral2[0].Vbeln
					var objSap = {
					  "Vbeln": vbeln,
					  "Lfdat": this.formatAbapDate(arratotal[i].FechaDisponibles.FECHAS),
					  "Lfuhr": this.formatAbapHours(arratotal[i].FechaDisponibles.HORARIOS),
					}
					arr.push(objSap)
					
					var fecha = this.formatCell2(arratotal[i].OrdenesPlanificadas[k].fecha)
					var horario = this.formatCellAbapHours(arratotal[i].OrdenesPlanificadas[k].hora)
					var id = arratotal[i].OrdenesPlanificadas[k].ID_Eliminar;
					var centro = arratotal[i].OrdenesPlanificadas[k].ArrayGeneral2[0].Werks;
					var proveedor = arratotal[i].OrdenesPlanificadas[k].ArrayGeneral2[0].Lifnr;
					var objDelete={
						"id":id,
						"fecha": fecha,
						"hora": horario,
						"centro":centro,
						"codprov":proveedor
					}
					arr3.push(objDelete)
				}
			}
			var objEnvioSap = {
			  "Modificar": "X",
			  "ItemSet": arr,
			  "NAVRESULT": [
			    {"Vbeln": "",
			      "Codigo": "",
			      "Mensaje": ""
			    }
			  ]
			}
			console.log("POST XSJS ",arr2)
			console.log("POST SAP ",objEnvioSap)
			console.log("DELEtE ",arr3)
			// this.methodPostXsjs(arr2,"",arr3);
			// this.methodPostSap(objEnvioSap,"/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_PLANIFICAR_ENT_SRV","/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_PLANIFICAR_ENT_SRV/ZETCABECERASet","DialogSelecFechaPlanProg","1");
			this.CerrarDialogSeleccionarFechaPlan();
			this.methodPostSap(objEnvioSap,"/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_MODIFICAR_ENT_SRV","/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_MODIFICAR_ENT_SRV/ZetModificarSet","DialogSelecFechaPlanProg","0",arr2,method,arr3,objEnvioSap.ItemSet.length);
			BusyIndicator.hide();
		},
		methodPostXsjs:function(content,methodo,contentDelete){
			that=this;
			oView=this.getView();
			
			for(var i=0;i<content.length;i++){
				var split =  content[i].FECHA.split("-");
				var fecha = split[2]+"."+split[1]+"."+split[0];
				var horario = content[i].HORA;
				var centro = content[i].CENTRO;
				var codprov = content[i].PROVEEDOR;
				var url ="/backendhana/IPROVIDER_ENTREGA/REGISTRO_FECHA/RegistroHorarioFiltrar.xsjs?centro="+centro+"&codprov="+codprov+"&fecha="+fecha+"&horario="+horario
				$.ajax({
					url: url,
					method: "GET",
					async:false,
					contentType: 'application/json',
					headers: {
					  Authorization: "Basic VVNSX1JBVkE6UmF2YTIwMjAk"
					},
					success: function (data) {
						var objtotal={}
						// var nEntregasInsertar = arrayOrdenesPlanificadas.length;
						if(Object.keys(data).length>0){
							data[0].ID_REGISTRO=data[0].ID_REGISTRO.toString();
							data[0].FECHA=(data[0].FECHA).split("T")[0];
							data[0].HORA=(data[0].HORA).split("T")[1].split(".")[0];
							data[0].ENTREGAS_REGISTRADAS = (content[i].ENTREGAS_REGISTRADAS).toString();
							
							that.methodUpdateXsjs(data[0]);
						}else{
							$.ajax({
								url: "/backendhana/IPROVIDER_ENTREGA/REGISTRO_FECHA/RegistroFecha.xsjs",
								type: "POST",
								async: false,
								contentType: 'text/json',
								headers: {
								  Authorization: "Basic VVNSX1JBVkE6UmF2YTIwMjAk"
								},
								data: JSON.stringify(content[i]),
								success: function (data) {
								},
								error: function (e) {
									console.log("Ocurrio un error" + JSON.parse(e))
									MessageToast.show("Erro al añadir registro");
								}
							})
						}
					},
					error: function (e) {
						console.log("Ocurrio un error" + JSON.parse(e))
					}
				});
			}
			this.BuscarDeleteXsjs(contentDelete);
		},
		
		BuscarDeleteXsjs:function(content){
			that=this;
			for(var i=0;i<content.length;i++){
				var fecha = content[i].fecha;
				var horario = content[i].hora;
				var centro = content[i].centro;
				var codprov = content[i].codprov;
				var url ="/backendhana/IPROVIDER_ENTREGA/REGISTRO_FECHA/RegistroHorarioFiltrar.xsjs?centro="+centro+"&codprov="+codprov+"&fecha="+fecha+"&horario="+horario
				$.ajax({
					url: url,
					method: "GET",
					async: false,
					contentType: 'application/json',
					headers: {
					  Authorization: "Basic VVNSX1JBVkE6UmF2YTIwMjAk"
					},
					success: function (data) {
						var objtotal={}
						// var nEntregasInsertar = arrayOrdenesPlanificadas.length;
						if(Object.keys(data).length>0){
							data[0].ID_REGISTRO=data[0].ID_REGISTRO.toString();
							data[0].FECHA=(data[0].FECHA).split("T")[0];
							data[0].HORA=(data[0].HORA).split("T")[1].split(".")[0];
							data[0].ENTREGAS_REGISTRADAS = (parseInt(data[0].ENTREGAS_REGISTRADAS) - 1).toString();
							
							if(data[0].ENTREGAS_REGISTRADAS == "0"){
								that.methodDeleteXsjs(data[0].ID_REGISTRO);
							}else{
								that.methodUpdateXsjs(data[0]);
							}
						}
					},
					error: function (e) {
						console.log("Ocurrio un error" + JSON.parse(e))
					}
				  });
			}
			
			// that.CerrarDialogSeleccionarFechaPlan();
			//BusyIndicator.hide();
			this.llamadoMetodos();
		},
		methodUpdateXsjs:function(content){
			$.ajax({
				url: "/backendhana/IPROVIDER_ENTREGA/REGISTRO_FECHA/RegistroFecha.xsjs",
				type: "PUT",
				contentType: 'text/json',
				async:false,
				headers: {
				  Authorization: "Basic VVNSX1JBVkE6UmF2YTIwMjAk"
				},
				data: JSON.stringify(content),
				statusCode: {
				    404: function() {
				      alert( "page not found" );
				    },
				    200: function(){
				    	// MessageToast.show("Registro Actualizado Exitosamente");
				    	// console.log("ejecutado");
				    },
				    400: function(){
				    	MessageToast.show("Erro al actualizar registro");
				    	// console.log("bad request");
				    }
				  }
			})
			
		},
		methodDeleteXsjs:function(id){
			$.ajax({
				url: "/backendhana/IPROVIDER_ENTREGA/REGISTRO_FECHA/RegistroFecha.xsjs?id_registro="+id,
				method: "DELETE",
				contentType: 'application/json',
				headers: {
				  Authorization: "Basic VVNSX1JBVkE6UmF2YTIwMjAk"
				},
				success: function (data) {
					// console.log(data)
				},
				error: function (e) {
					console.log("Ocurrio un error" + JSON.parse(e))
					MessageToast.show("Erro al borrar registro");
				}
			  });
		},
		//Validacion de fechas
		cambioRangoInicialPlanProg:function(){
			var ModeloProyect = oView.getModel("Proyect");
			
			var rangoFecha=ModeloProyect.getProperty("/FechaArraFecha");
			var contador=ModeloProyect.getProperty("/DataConstanteContador");
			var arrayOrdenesPlanificadas = JSON.parse(localStorage.getItem('arrayOrdenesPlanificadas'));
			var fechas=[];
			var fecha_max;
			var fecha_min = rangoFecha[0];
			fecha_min = this.formatCell3("/Date("+rangoFecha[0]+")/");
			
			var fechaFinal=this.getView().byId("fecharangoFinalPlan").getValue();
			var fechaInicial2=ModeloProyect.getProperty("/DataConstanteFechaInicial");
			var fechaInicial=fecha_min;
			// console.log(fechaInicial)
			if(fechaFinal == "" ){
				var fechaInicialSplit = fechaInicial.split(".");
				var year0 = parseInt(fechaInicialSplit[2]);
				var mount0 = parseInt(fechaInicialSplit[1]);
				var day0 = parseInt(fechaInicialSplit[0]);
				this.getView().byId("fecharangoInicialPlan").setMinDate(new Date(year0, mount0-1, day0));
			}else{
				var fechaFinalSplit = fechaFinal.split(".");
				var year = parseInt(fechaFinalSplit[2]);
				var mount = parseInt(fechaFinalSplit[1]);
				var day = parseInt(fechaFinalSplit[0]);
				this.getView().byId("fecharangoInicialPlan").setMaxDate(new Date(year, mount-1, day-1));
				
				var fechaInicialSplit = fechaInicial2.split(".");
				var year0 = parseInt(fechaInicialSplit[2]);
				var mount0 = parseInt(fechaInicialSplit[1]);
				var day0 = parseInt(fechaInicialSplit[0]);
				this.getView().byId("fecharangoInicialPlan").setMinDate(new Date(year0, mount0-1, day0));
			}
		},
		eventchangeFechainicialPlanProg:function(){
			var ModeloProyect = oView.getModel("Proyect");
			
			var contador=ModeloProyect.getProperty("/DataConstanteContadorRecuerto");
			var ConstanteHorarioValidate=ModeloProyect.getProperty("/DataConstanteHorarioValidate");
			
			var fechaInicial3=ConstanteHorarioValidate;
			var diaValidation3=fechaInicial3.split(".")[0];
			var mesValidation3=fechaInicial3.split(".")[1];
			var anioValidation3=fechaInicial3.split(".")[2];
			
			var fechaInicial2=ModeloProyect.getProperty("/DataConstanteFechaInicial");
			var diaValidation2=fechaInicial2.split(".")[0];
			var mesValidation2=fechaInicial2.split(".")[1];
			var anioValidation2=fechaInicial2.split(".")[2];
			
			var fechaFinal=this.getView().byId("fecharangoFinalPlan").getValue();
			
			var fechaInicial=this.getView().byId("fecharangoInicialPlan").getValue();
			var dateActual=new Date()
			var anioActual=dateActual.getFullYear();
			var diaValidation=fechaInicial.split(".")[0];
			var mesValidation=fechaInicial.split(".")[1];
			var anioValidation=fechaInicial.split(".")[2];
			
			var anioFin=dateActual.getFullYear();
			var diaFinVal=fechaFinal.split(".")[0];
			var mesFinVal=fechaFinal.split(".")[1];
			var anioFinVal=fechaFinal.split(".")[2];
			if(fechaInicial == ""){
				MessageToast.show("Ingresar Fecha", {
					duration: 4000,
					my: "center center",
					at: "center center"
				});	
			}else{
				if(fechaFinal != ""){
					if(diaValidation != undefined && mesValidation != undefined && anioValidation != undefined && (parseInt(anioValidation)>=parseInt(anioActual))){
						if( diaFinVal != undefined && mesFinVal != undefined && anioFinVal != undefined && (parseInt(anioFinVal)>=parseInt(anioActual)) ){
							var fechaValidation=new Date(anioValidation+"/"+mesValidation+"/"+diaValidation).getTime();
							var fechaValidation2=new Date(anioValidation2+"/"+mesValidation2+"/"+diaValidation2).getTime();
							var fechaValidation3=new Date(anioValidation3+"/"+mesValidation3+"/"+diaValidation3).getTime();
							if(fechaValidation>fechaValidation2){
								ModeloProyect.setProperty("/DataConstanteContador" ,8);
							}else if(fechaValidation == fechaValidation2){
								if(contador.length>1){
									ModeloProyect.setProperty("/DataConstanteContador" ,contador[1]);
								}else{
									ModeloProyect.setProperty("/DataConstanteContador" ,contador[0]);
								}
							}else if(fechaValidation == fechaValidation3){
								contador=[];
								ModeloProyect.setProperty("/DataConstanteContador" ,8);
							}else{
								contador.pop();
								if(contador.length>0){
									ModeloProyect.setProperty("/DataConstanteContador" ,contador[0]);
								}else{
									ModeloProyect.setProperty("/DataConstanteContador" ,8);
								}
							}
							this.getFilterConstantCentroPlan("MM","PLANIFICACION_ENTREGA_PORTAL","CENTRO",contador);
						}else{
							MessageToast.show("Formato Incorrecto: DD.MM.YYYY", {
								duration: 4000,
								my: "center center",
								at: "center center"
							});	
						}
					}else{
						MessageToast.show("Formato Incorrecto: DD.MM.YYYY", {
							duration: 4000,
							my: "center center",
							at: "center center"
						});	
					}
				}else{
					if(diaValidation != undefined && mesValidation != undefined && anioValidation != undefined && (parseInt(anioValidation)>=parseInt(anioActual))){
						var fechaValidation=new Date(anioValidation+"/"+mesValidation+"/"+diaValidation).getTime();
						var fechaValidation2=new Date(anioValidation2+"/"+mesValidation2+"/"+diaValidation2).getTime();
						var fechaValidation3=new Date(anioValidation3+"/"+mesValidation3+"/"+diaValidation3).getTime();
						if(fechaValidation>=fechaValidation2){
							if(fechaValidation>fechaValidation2){
								ModeloProyect.setProperty("/DataConstanteContador" ,8);
							}else if(fechaValidation == fechaValidation2){
								if(contador.length>1){
									ModeloProyect.setProperty("/DataConstanteContador" ,contador[1]);
								}else{
									ModeloProyect.setProperty("/DataConstanteContador" ,contador[0]);
								}
							}else if(fechaValidation == fechaValidation3){
								contador=[];
								ModeloProyect.setProperty("/DataConstanteContador" ,8);
							}else{
								contador.pop();
								if(contador.length>0){
									ModeloProyect.setProperty("/DataConstanteContador" ,contador[0]);
								}else{
									ModeloProyect.setProperty("/DataConstanteContador" ,8);
								}
							}
							this.getFilterConstantCentroPlan("MM","PLANIFICACION_ENTREGA_PORTAL","CENTRO",contador);
						}else{
							MessageToast.show("Selección a partir de la fecha establecida: "+fechaInicial2, {
								duration: 4000,
								my: "center center",
								at: "center center"
							});	
						}
					}else{
						MessageToast.show("Formato Incorrecto: DD.MM.YYYY", {
							duration: 4000,
							my: "center center",
							at: "center center"
						});	
					}
				}
			}
		},
		cambioRangoPlan:function(){
			var fechaInicial = this.getView().byId("fecharangoInicialPlan").getValue().split(".");
			if(fechaInicial != ""){
				var year = parseInt(fechaInicial[2]);
				var mount = parseInt(fechaInicial[1]);
				var day = parseInt(fechaInicial[0]);
				this.getView().byId("fecharangoFinalPlan").setMinDate(new Date(year, mount-1, day+1));
			}else{
				MessageToast.show("Añadir Rango Inicial", {
					duration: 4000,
					my: "center center",
					at: "center center"
				});	
			}
		},
		eventchangeFechaFinalPlan:function(){
			var ModeloProyect = oView.getModel("Proyect");
			var contador=ModeloProyect.getProperty("/DataConstanteContadorRecuerto");
			var ConstanteHorarioValidate=ModeloProyect.getProperty("/DataConstanteHorarioValidate");
			
			var fechaInicial3=ConstanteHorarioValidate;
			var diaValidation3=fechaInicial3.split(".")[0];
			var mesValidation3=fechaInicial3.split(".")[1];
			var anioValidation3=fechaInicial3.split(".")[2];
			
			var fechaInicial2=ModeloProyect.getProperty("/DataConstanteFechaInicial");
			var diaValidation2=fechaInicial2.split(".")[0];
			var mesValidation2=fechaInicial2.split(".")[1];
			var anioValidation2=fechaInicial2.split(".")[2];
			
			var dateActual=new Date();
			var anioActual=dateActual.getFullYear();
			var fechaInicial=this.getView().byId("fecharangoInicialPlan").getValue()
			var diaValidation=fechaInicial.split(".")[0];
			var mesValidation=fechaInicial.split(".")[1];
			var anioValidation=fechaInicial.split(".")[2];
			
			var fechaFinal=this.getView().byId("fecharangoFinalPlan").getValue()
			var diaValFinal=fechaFinal.split(".")[0];
			var mesValFinal=fechaFinal.split(".")[1];
			var anioValFinal=fechaFinal.split(".")[2];
			if(fechaInicial == "" ){
				MessageToast.show("Añadir Rango Inicial", {
					duration: 4000,
					my: "center center",
					at: "center center"
				});	
			}else{
				if(fechaFinal != ""){
					if(fechaInicial != ""){
						if(diaValidation!=undefined && mesValidation!=undefined && anioValidation!=undefined && (parseInt(anioValidation)>=parseInt(anioActual))){
							if( diaValFinal!=undefined && mesValFinal!=undefined && anioValFinal!=undefined && (parseInt(anioValFinal)>=parseInt(anioActual)) ){
								// this.getView().byId("fecharangoInicialPlan").setValue(fecha_rangini2)
								// this.getFilterConstantCentroPlan("MM","PLANIFICACION_ENTREGA_PORTAL","CENTRO");
								var fechaValidation=new Date(anioValidation+"/"+mesValidation+"/"+diaValidation).getTime();
								var fechaValidation2=new Date(anioValidation2+"/"+mesValidation2+"/"+diaValidation2).getTime();
								var fechaValidation3=new Date(anioValidation3+"/"+mesValidation3+"/"+diaValidation3).getTime();
								var fechaFinalDate=new Date(anioValFinal+"/"+mesValFinal+"/"+diaValFinal).getTime();
								if(fechaValidation>fechaValidation2){
									ModeloProyect.setProperty("/DataConstanteContador" ,8);
								}else if(fechaValidation == fechaValidation2){
									if(contador.length>1){
										ModeloProyect.setProperty("/DataConstanteContador" ,contador[1]);
									}else{
										ModeloProyect.setProperty("/DataConstanteContador" ,contador[0]);
									}
								}else if(fechaValidation == fechaValidation3){
									contador=[];
									ModeloProyect.setProperty("/DataConstanteContador" ,8);
								}else{
									contador.pop();
									if(contador.length>0){
										ModeloProyect.setProperty("/DataConstanteContador" ,contador[0]);
									}else{
										ModeloProyect.setProperty("/DataConstanteContador" ,8);
									}
								}
								
								if(fechaValidation <=fechaFinalDate){
									this.getFilterConstantCentroPlan("MM","PLANIFICACION_ENTREGA_PORTAL","CENTRO",contador);
								}else{
									MessageBox.show("La fecha final es menor a la fecha inicial", {
										icon: sap.m.MessageBox.Icon.INFORMATION,
										title: "",
										actions: ['OK'],
										onClose: function (sActionClicked) {}
									});
								}
							}else{
								MessageToast.show("Formato Incorrecto: DD.MM.YYYY", {
									duration: 4000,
									my: "center center",
									at: "center center"
								});	
							}
						}else{
							MessageToast.show("Formato Incorrecto: DD.MM.YYYY", {
									duration: 4000,
									my: "center center",
									at: "center center"
								});	
						}
					}else{
						if( diaValFinal!=undefined && mesValFinal!=undefined && anioValFinal!=undefined && (parseInt(anioValFinal)>=parseInt(anioActual)) ){
							// this.getView().byId("fecharangoInicialPlan").setValue(fecha_rangini2)
							// this.getFilterConstantCentroPlan("MM","PLANIFICACION_ENTREGA_PORTAL","CENTRO");
							var fechaValidation=new Date(anioValidation+"/"+mesValidation+"/"+diaValidation).getTime();
							var fechaValidation2=new Date(anioValidation2+"/"+mesValidation2+"/"+diaValidation2).getTime();
							var fechaValidation3=new Date(anioValidation3+"/"+mesValidation3+"/"+diaValidation3).getTime();
							if(fechaValidation>fechaValidation2){
								ModeloProyect.setProperty("/DataConstanteContador" ,8);
							}else if(fechaValidation == fechaValidation2){
								if(contador.length>1){
									ModeloProyect.setProperty("/DataConstanteContador" ,contador[1]);
								}else{
									ModeloProyect.setProperty("/DataConstanteContador" ,contador[0]);
								}
							}else if(fechaValidation == fechaValidation3){
								contador=[];
								ModeloProyect.setProperty("/DataConstanteContador" ,8);
							}else{
								contador.pop();
								if(contador.length>0){
									ModeloProyect.setProperty("/DataConstanteContador" ,contador[0]);
								}else{
									ModeloProyect.setProperty("/DataConstanteContador" ,8);
								}
							}
							this.getFilterConstantCentroPlan("MM","PLANIFICACION_ENTREGA_PORTAL","CENTRO",contador);
						}else{
							MessageToast.show("Formato Incorrecto: DD.MM.YYYY", {
								duration: 4000,
								my: "center center",
								at: "center center"
							});	
						}
					}
				}else{

					var fechaValidation=new Date(anioValidation+"/"+mesValidation+"/"+diaValidation).getTime();
					var fechaValidation2=new Date(anioValidation2+"/"+mesValidation2+"/"+diaValidation2).getTime();
					var fechaValidation3=new Date(anioValidation3+"/"+mesValidation3+"/"+diaValidation3).getTime();
					if(fechaValidation>fechaValidation2){
						ModeloProyect.setProperty("/DataConstanteContador" ,8);
					}else if(fechaValidation == fechaValidation2){
						if(contador.length>1){
							ModeloProyect.setProperty("/DataConstanteContador" ,contador[1]);
						}else{
							ModeloProyect.setProperty("/DataConstanteContador" ,contador[0]);
						}
					}else if(fechaValidation == fechaValidation3){
						contador=[];
						ModeloProyect.setProperty("/DataConstanteContador" ,8);
					}else{
						contador.pop();
						if(contador.length>0){
							ModeloProyect.setProperty("/DataConstanteContador" ,contador[0]);
						}else{
							ModeloProyect.setProperty("/DataConstanteContador" ,8);
						}
					}
					this.getFilterConstantCentroPlan("MM","PLANIFICACION_ENTREGA_PORTAL","CENTRO",contador)
				}
			}
		},
		//Kassiel
		Adjuntar : function (){
			if(!this.AdjuntarTablas){
				this.AdjuntarTablas = sap.ui.xmlfragment("com.rava.fragment.MantenimientoRoles" , this);
				this.getView().addDependent(this.AdjuntarTablas);
			}
			this.AdjuntarTablas.open();
		},
		CancelarDialogRoles : function (){
			this.AdjuntarTablas.close();
		},
		
		CerrarRegistro: function (){
			this.getOwnerComponent().getRouter().navTo("Page1");
		},
		guardar2 : function (){
			sap.m.MessageBox.confirm("¿Desea guardar la Entrega?", {
				title: "Mensaje",
				actions: [
					"Si",
					"Cancelar"
				],
				onClose: function (sActionClicked) {
					if(sActionClicked==="Si"){
						sap.m.MessageBox.success("Entrega entrante 10000004 grabado", {
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
		guardar1 : function (){
		sap.m.MessageBox.confirm("¿Desea planificar la Entrega?", {
				title: "Mensaje",
				actions: [
					"Si",
					"Cancelar"
				],
				onClose: function (sActionClicked) {
					if(sActionClicked==="Si"){
						sap.m.MessageBox.success("Se modifico la Entrega entrante 10000004", {
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
		CancelarActualizarRoles: function (){
			this.Bultos.close();
		},
		Adj: function (){
			if(!this.DocAd){
				this.DocAd = sap.ui.xmlfragment("com.rava.fragment.DocAdjuntar" , this);
				this.getView().addDependent(this.DocAd);
			}
			this.DocAd.open();
		},
		Resumen : function (){
			if(!this.abc){
				this.abc = sap.ui.xmlfragment("com.rava.fragment.Resumen" , this);
				this.getView().addDependent(this.abc);
			}
			this.abc.open();
		},
		getTipoBultos: function(){
			var oView					=this.getView();
			var ModeloProyecto			=oView.getModel("Proyect");
			
			var url="/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_REL_PEDC_XCONF_SRV/TipoBultoSet?$filter=Spras eq 'S'"+"&$format=json";
			
			jQuery.ajax({
				type: "GET",
				cache: false,
				headers: {
					"Accept": "application/json"
				},
				contentType: "application/json",
				url: url,
				async: true,
				success: function (oData, textStatus, jqXHR) {
					var data =oData.d.results;
					data.unshift({Bezei : "--Seleccionar--" , Vegr2 : "0"});
					
					ModeloProyecto.setProperty("/DataTipoBulto" ,oData.d.results);
					
				},
				error: function () {
					MessageBox.error("Ocurrio un error al obtener los datos");
				}
			});
		},
		Continuar : function (){
			if(!this.BultosM){
			this.BultosM = sap.ui.xmlfragment("com.rava.fragment.BultosModificar" , this);
			this.getView().addDependent(this.BultosM);
			}
			this.BultosM.close();
			this.BultosM.open();
		},
		CerrarDialogBultos : function (){
			this.BultosM.close();
		},
		CerrarDialog: function (){
			this.EmbalarBultosM.close();
		},
		dynamicSort : function (property) {
	    var sortOrder = 1;
	    if(property[0] === "-") {
	        sortOrder = -1;
	        property = property.substr(1);
	    }
	    return function (a,b) {
	        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
	        return result * sortOrder;
	    }
		},
		ModificarEntrega : function (){
		 var oView = this.getView();
		 var that= this;
		 var EntregasSelecionadas = JSON.parse(localStorage.getItem("arrayOrdenesPlanificadas"));
		 var ModeloProyect = oView.getModel("Proyect");
		 ModeloProyect.setProperty("/DataMaterialesSeleccionados" ,[]);
		 var TipoBultos =	ModeloProyect.getProperty("/DataTipoBulto");
		 var DataPedidosEmbalar =	ModeloProyect.getProperty("/DataPedidosEmbalar");
		 
		 ModeloProyect.setProperty("/DataBultos" , []);
		 
		 if(EntregasSelecionadas.length === 0){
		 	MessageToast.show("Seleccione una Entrega");
		 	return ;
		 }
		 
		var Array				=[];
		var FirstObject 		=EntregasSelecionadas[0].ArrayGeneral2[0];
		var almacenarObject;
		var MaterialesEntrega	=JSON.parse(JSON.stringify(EntregasSelecionadas[0]));
		
		
		while (MaterialesEntrega.ArrayGeneral2.length !== 0){
			if(FirstObject.Xhupf){
				var obj = {
								Num			:FirstObject.VhilmKuD,
								TipoBulto	:FirstObject.Vegr2D,
								CantBulto	:Utilities.FormatterDinero(FirstObject.ZulAufl),
								Observacion	:FirstObject.InhaltD.replace(".000",""),
								PesoBulto	:FirstObject.BrgewD.replace(".000",""),
								Longitud	:FirstObject.LaengD.replace(".000",""),
								Ancho		:FirstObject.BreitD.replace(".000",""),
								Altura		:FirstObject.HoeheD.replace(".000",""),
								Array		:[]	
							};
				ModeloProyect.setProperty("/HUHabilitar" , true);
				
			}else{
				
				var obj = {
					Num			:FirstObject.VhilmKuD,
					TipoBulto	:FirstObject.Vegr2D,
					CantBulto	:Utilities.FormatterDinero(FirstObject.ZulAufl),
					Observacion	:FirstObject.InhaltD.replace(".000",""),
					PesoBulto	:FirstObject.BrgewD.replace(".000",""),
					Longitud	:FirstObject.LaengD.replace(".000",""),
					Ancho		:FirstObject.BreitD.replace(".000",""),
					Altura		:FirstObject.HoeheD.replace(".000",""),
					Array		:[]	
				};
				ModeloProyect.setProperty("/HUHabilitar" , false);
		}
		Array.push(obj);
		var arrayIndices		=[];
		var indice  =0;
		var indice1 =0;
		 EntregasSelecionadas[0].ArrayGeneral2.forEach(function (Mat){
		 	if (FirstObject.VhilmKuD === Mat.VhilmKuD){
		 		Array.forEach(function (a){
					if(a.Num === FirstObject.VhilmKuD){
						Mat.VemngD		= Utilities.FormatterDinero(Mat.VemngD);
						Mat.CantTotal	= that.format2Decimales(Mat.VemngD);
						a.Array.push(JSON.parse(JSON.stringify(Mat)));
						MaterialesEntrega.ArrayGeneral2.splice(indice,1);
						arrayIndices.push(indice1);
						indice--;
					}
		 		});
		 	}
		 	indice1++;
		 	indice++;
		 	// 	var tipo ;
		 	// TipoBultos.forEach(function (e){
		 	// 	if( e.Vegr2 === Mat.Vegr2D){
		 	// 		tipo=e.Bezei;
		 	// 	}
		 	// });
		 });
		 var total =0;
		 arrayIndices.forEach(function(a,ind){
		 	EntregasSelecionadas[0].ArrayGeneral2.splice(a-total,1);
		 	total++; 
		 });
		 
		 FirstObject =JSON.parse(JSON.stringify(MaterialesEntrega.ArrayGeneral2[0]===undefined ?{nada:"xD"}: MaterialesEntrega.ArrayGeneral2[0]));
		}
		 Array.sort(that.dynamicSort("Descripcion"));
		 var data = {
		 	Array :Array
		 };
		 
			ModeloProyect.setProperty("/DataBultos" ,data);
			// if(!this.BultosM){
			// 	this.BultosM = sap.ui.xmlfragment("com.rava.fragment.BultosModificar" , this);
			// 	this.getView().addDependent(this.BultosM);
			// }
			
			if(!this.EmbalarBultosM){
			this.EmbalarBultosM = sap.ui.xmlfragment("com.rava.fragment.EmbalarBultosModificar" , this);
			this.getView().addDependent(this.EmbalarBultosM);
			}
			// this.BultosM.close();
			this.EmbalarBultosM.open();
		},
		EliminarEntrega: function (){
		var EntregasSelecionadas = JSON.parse(localStorage.getItem("arrayOrdenesPlanificadas"));
		var that =  this ;
		if (EntregasSelecionadas.length === 0){
			MessageToast.show("Seleccione Entregas");
			return;
		}	
			sap.m.MessageBox.confirm("¿Desea eliminar la(s) Entrega(s)?", {
				title: "Mensaje",
				actions: [
					"Si",
					"Cancelar"
				],
				onClose: function (sActionClicked) {
					if(sActionClicked==="Si"){
					that.OperacionEliminarEntrega();
				}
				}
		});
		},
		OperacionEliminarEntrega : function () {
		var EntregasSelecionadas = JSON.parse(localStorage.getItem("arrayOrdenesPlanificadas"));
		var array =[];
		var that =  this ;
		EntregasSelecionadas.forEach(function(a){
		var obj = {
			"Vbeln": a.DescripcionGeneralEntrega,
			"Message": ""
		};
		array.push(obj);
		});
		
		var data2 = {
				  "Eliminar": "X",
				  "ItemEntSet": array,
				  "NAVRESULT": [
				    {
				      "Mensaje2": "",
				      "Mensaje": ""
				    }
				  ]
				} ;
		sap.ui.core.BusyIndicator.show(0);
				$.ajax({ 
					url:"/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_ELIM_EMB_Y_ENTR_SRV",
					type: "GET",
					headers :{"x-CSRF-Token":"Fetch"}
				}).always(function(data , status,response){
						var	token =response.getResponseHeader("x-csrf-token");
						$.ajax({ 
							type		:"POST",
							url			:"/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_ELIM_EMB_Y_ENTR_SRV/ZetHeaderEntSet",
							headers 	:{"x-CSRF-Token":token},
							contentType	:"application/json",
							dataType	:"json",
							data		:JSON.stringify(data2)
						}).always(function(data , status,response){
							
							
							if (  data.d.NAVRESULT  === null ||  "Cancelación al actualizar en el pedido de compras" === data.d.NAVRESULT.results[0].Mensaje ){
							sap.ui.core.BusyIndicator.hide();
							that.getView().byId("TreeTable2").clearSelection();
							
							sap.m.MessageBox.error(data.d.NAVRESULT.results[0].Mensaje +" "+data.d.NAVRESULT.results[0].Mensaje2, {
							title: "Mensaje de Error",
							actions: ["OK"],
								onClose: function (sActionClicked) {
								if(sActionClicked==="OK"){
								}
							}});
							}
							else {
							that.getView().byId("TreeTable2").clearSelection();
							sap.m.MessageBox.success(data.d.NAVRESULT.results[0].Mensaje + " " + data.d.NAVRESULT.results[0].Mensaje2, {
							title: "Mensaje de Éxito",
							actions: ["OK"],
								onClose: function (sActionClicked) {
								if(sActionClicked==="OK"){
								that.llamadoMetodos();
								}
								}});	
							}
								
					
					});
							
						}); 
		},
		ValidarDecimal : function (oEvent){
		var val = oEvent.getSource().getValue();
		oEvent.getSource().setValue(Utilities.FormatterDinero(val));
		
		},
		onSubmit : function (){
			var oView					=that.getView();
			var ModeloProyect			=oView.getModel("Proyect");
			var Bultos					=ModeloProyect.getProperty("/DataBultos");
			var Materiales				=ModeloProyect.getProperty("/DataMaterialesSeleccionados");
			
			
			Bultos.Array.forEach(function(obj1){
				
				if(obj1.CantBulto !== ""){
					
				obj1.CantBulto = Utilities.FormatterDinero(obj1.CantBulto)	
				
				}
				
				
			});
			
				
				Materiales.forEach(function(obj2){
					
					if(obj2.MengezuD){
						
					if(obj2.MengezuD !== ""){
					obj2.MengezuD = Utilities.FormatterDinero(obj2.MengezuD)
					}	
						
						
					}else {
						
					if(obj2.VemngD !== ""){
					obj2.VemngD = Utilities.FormatterDinero(obj2.VemngD)
					}
						
						
					}
					
				
			});
		
			ModeloProyect.refresh(true);
			document.removeEventListener("click",validateNumbers12);
			
		},
		ValidarNumbers : function (oEvent){
		 that = this ;
		var oView			=this.getView();
		var ModeloProyecto	=oView.getModel("Proyect");
		var val 			=oEvent.getSource().getValue();
			val 			=val.replace(/[^0-9.]/g, '');
		var	vali			=val.split(".")
			
            
            if(vali.length ===2){
            	
            // if(vali[1] !== ""){
            	
            oEvent.getSource().setValue(vali[0]+"."+vali[1]);
            
            // }
            // else {
            	
            // oEvent.getSource().setValue(vali[0]);	
            
            // }
            
            	
            }else if (vali.length ===1){
            	
            oEvent.getSource().setValue(vali[0]);	
            }else if (vali.length > 2){
            oEvent.getSource().setValue(vali[0]+"."+vali[1]);
            	
            }
            
           	document.addEventListener("click", function validateNumbers12(){
			var oView					=that.getView();
			var ModeloProyect			=oView.getModel("Proyect");
			var Bultos					=ModeloProyect.getProperty("/DataBultos");
			var Materiales				=ModeloProyect.getProperty("/DataMaterialesSeleccionados");
			
			
			Bultos.Array.forEach(function(obj1){
				
				if(obj1.CantBulto !== ""){
					
				obj1.CantBulto = Utilities.FormatterDinero(obj1.CantBulto)	
				
				}
				
				
			});
			
				
				Materiales.forEach(function(obj2){
					
					if(obj2.MengezuD){
						
					if(obj2.MengezuD !== ""){
					obj2.MengezuD = Utilities.FormatterDinero(obj2.MengezuD)
					}	
						
						
					}else {
						
					if(obj2.VemngD !== ""){
					obj2.VemngD = Utilities.FormatterDinero(obj2.VemngD)
					}
						
						
					}
					
				
			});
		
			ModeloProyect.refresh(true);
			document.removeEventListener("click",validateNumbers12);
			});
            
            
            
            
		}, 
		ValidarCamposBM : function (oEvent){
			var oView					=this.getView();
			var ModeloProyecto			=oView.getModel("Proyect");
			
			var table = sap.ui.getCore().byId("treetableDataBultosMateriales1");
			var context = oEvent.getParameter("rowContext");
			
			if(context === null){
				return ;
			}
			var Object = this.getView().getModel("Proyect").getProperty(context.sPath);
			var oIndex = oEvent.getParameter('rowIndex');
			// var indentificador	=ModeloProyecto.getProperty("/Identifacador");
			if(!Object.Descripcion){
				table.removeSelectionInterval(oIndex,oIndex);
			}
			
		},
		desvincular : function (){
		var oView					=this.getView();
		var tabla1					=sap.ui.getCore().byId("tableBultos1");
		var SeleccionBultos			=tabla1.getSelectedIndices();
		var ModeloProyecto			=oView.getModel("Proyect");
		var Bultos					=ModeloProyecto.getProperty("/DataBultos");
		var MaterialesEmbalar		=ModeloProyecto.getProperty("/DataMaterialesSeleccionados");
		var data					=[];
		// var varciar1				= Vaciar;
		var that					=this;
		if(SeleccionBultos.length===0){
			MessageToast.show("Seleccione un Embalaje");
			return;
		}
		var context =tabla1.getContextByIndex(SeleccionBultos[0]);
		var oBjeto  =context.getObject();
		if(oBjeto.Array.length ===  0){
			MessageToast.show("Selecione un Embalaje con Materiales Embalados");
			return;
		}
		
		
	sap.ui.core.BusyIndicator.show(0);
	
	
	SeleccionBultos.forEach(function(a){
		var context =tabla1.getContextByIndex(a);
		var oBjeto  =context.getObject();
		
		var Bulto = {
			
			"Vbeln"  :Bultos.Array[0].Array[0].VbelnD,
			"Bulto"  :oBjeto.Num,
			"Message": ""
		}
		data.push(Bulto);
		
		});
		
		
		var data2 = {
				  "Vbeln": Bultos.Array[0].Array[0].VbelnD,
				  "ItemSet": data,
				  "NAVRESULT": [
				    {
				      "Mensaje": "",
				      "Mensaje2": ""
				    }
				  ]
				};
		
			$.ajax({ 
					url:"/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_ELIM_EMB_Y_ENTR_SRV",
					type: "GET",
					headers :{"x-CSRF-Token":"Fetch"}
				}).always(function(data , status,response){
						var	token =response.getResponseHeader("x-csrf-token");
						$.ajax({ 
							type		:"POST",
							url			:"/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_ELIM_EMB_Y_ENTR_SRV/ZetHeaderEmbSet",
							headers 	:{"x-CSRF-Token":token},
							contentType	:"application/json",
							dataType	:"json",
							data		:JSON.stringify(data2)
						}).always(function(data , status,response){
							
						if(data.d.NAVRESULT === null){
							sap.m.MessageBox.error("Unidad(es) manipulación no borrada(s)", {
							title: "Mensaje de Error",
							actions: ["OK"],
								onClose: function (sActionClicked) {
								if(sActionClicked==="OK"){
									
								sap.ui.core.BusyIndicator.hide();
								}
					}
					});
							return ;
						}
						tabla1.clearSelection();
							var obj={
							Num			:1,
							TipoBulto	:"0",
							CantBulto	:"",
							Observacion	:"",
							PesoBulto	:"",
							Longitud	:"",
							Ancho		:"",
							Altura		:"",
							enabledTpB	:false,
							Array :[]
							};
	
						SeleccionBultos.reverse().forEach(function(a){
							var context =tabla1.getContextByIndex(a);
							var oBjeto  =context.getObject();
							
							oBjeto.Array.forEach(function(k){
							MaterialesEmbalar.forEach(function(r){
								if (k.MatnrD === r.MatnrD && k.EbelnD === r.EbelnD  && k.EbelpD === r.EbelpD){
									k.VemngD = Utilities.FormatterDinero(parseFloat(r.VemngD) + parseFloat(k.VemngD)) ; 
								}
							});	
							MaterialesEmbalar.unshift(k);
							});
							
							var filtroMat = MaterialesEmbalar.filter((v,i,a)=>a.findIndex(t=>(t.MatnrD === v.MatnrD && t.EbelpD === v.EbelpD))===i);
							ModeloProyecto.setProperty("/DataMaterialesSeleccionados" , filtroMat);
							
							
							if(MaterialesEmbalar[0].Xhupf){
							var indice = 0 ;
							Bultos.Array.forEach(function (obj){
								if(obj.Num === oBjeto.Num){
									obj.TipoBulto	="0";
									// obj.CantBulto	="";
									// obj.Observacion	="";
									// obj.PesoBulto	="";
									// obj.Longitud	="";
									// obj.Ancho		="";
									// obj.Altura		="";
									// obj.Array.splice(0,obj.Array.length);
									Bultos.Array.splice(indice,1);
								}
								indice++;
							});
						
							
						}else  {
							ModeloProyecto.setProperty("/DataBultos/Array",[obj]);
						}
						
						});
					
						ModeloProyecto.refresh(true);
						Vaciar12 =  true ;
						sap.ui.core.BusyIndicator.hide();
						sap.m.MessageBox.success("Unidad(es) manipulación borrada(s)", {
							title: "Mensaje de Éxito",
							actions: ["OK"],
								onClose: function (sActionClicked) {
					}
					});
							});
				});
		},
		checkAceptar: function (oEvent) {
			var oView = this.getView();
			var table = oView.byId("TreeTable");
			var row = oEvent.getSource().getParent();
			table.setSelectedIndex(row.getIndex());
		},
		EmbaladoParcial: function (){
			var oView					=this.getView();
			var ModeloProyecto			=oView.getModel("Proyect");
			var Bultos					=ModeloProyecto.getProperty("/DataBultos");
			var Materiales				=ModeloProyecto.getProperty("/DataMaterialesSeleccionados");
			var SeleccionBultos			=sap.ui.getCore().byId("tableBultos1").getSelectedIndices();
			var SeleccionMateriales		=sap.ui.getCore().byId("tableMateriales1").getSelectedIndices();
			var MaterialesSelecionado	=[];
			var BultosMateriales		=ModeloProyecto.getProperty("/DataPlani");
			var DataTipoBulto			=ModeloProyecto.getProperty("/DataTipoBulto");
			var TipoBultoNombre	;
			
		
			if(SeleccionBultos.length>0){
				
				
			if(Bultos[SeleccionBultos[0]].TipoBulto ==="0") {
				
				MessageToast.show("Seleccione un Tipo de Embalaje");
				return;
			}
				
				
				DataTipoBulto.forEach(function(a){
				if(Bultos[SeleccionBultos[0]].TipoBulto === a.Vegr2) {
					TipoBultoNombre =a.Bezei ;
				} 
			});
			
				if(SeleccionMateriales.length>0){
					SeleccionMateriales.reverse().forEach(function(a){
						
							Materiales[a].TipoBulto =TipoBultoNombre;
							Materiales[a].VemngD = Utilities.FormatterDinero(Materiales[a].VemngD);
							
							MaterialesSelecionado.push(Materiales[a]);
							Materiales.splice(a,1);
					});
				
					sap.ui.getCore().byId("tableMateriales1").clearSelection();
					ModeloProyecto.refresh(true);
					var validar =false ;
					var indice	=-1;
					var CaputaraIndice ;
					SeleccionBultos.forEach(function (a){
					BultosMateriales.Array.forEach(function(d){
						indice++;
						if(Bultos[a].Num === d.Descripcion.replace("Bulto","")*1){
							validar = true ;
							CaputaraIndice = indice;
						}
						
					});
					    if(validar){
						MaterialesSelecionado.forEach(function(a){
							BultosMateriales.Array[CaputaraIndice].Array.push(a);	
							});
					    }else {
					    var Bulto={
						Descripcion :"Bulto"+ Bultos[a].Num , 
						TipoBulto1 :TipoBultoNombre,
						detalleBulto:Bultos[a],
						Array		:MaterialesSelecionado
						};
						BultosMateriales.Array.push(Bulto);
					    }
					
				});
					
				}else{
					MessageToast.show("Seleccione Material");
				}
			}else{
				MessageToast.show("Seleccione Embalaje");
			}
		},
		format2Decimales: function (Number) {
			var oNumberFormat = NumberFormat.getFloatInstance({
				minFractionDigits: 1,
				maxFractionDigits: 6,
				decimals: 2,
				groupingEnabled: true,
				groupingSeparator: ",",
				decimalSeparator: "."
			});

			if (Number !== null) {
				return oNumberFormat.format(Number);
			} else {
				return Number;
			}
		},
		CantidadParcial:function(){
			var that						=this;
			var oView						=this.getView();
			var ModeloProyect				=oView.getModel("Proyect");
			var tablaBultos					=sap.ui.getCore().byId("tableBultos1");
			var tablaMateriales				=sap.ui.getCore().byId("tableMateriales1");
			var SeleccionMateriales			=tablaMateriales.getSelectedIndices();
			var SeleccionBultos				=tablaBultos.getSelectedIndices();
			var Materiales					=ModeloProyect.getProperty("/DataMaterialesSeleccionados");
			var validarCantidadParcial		=false;
			var validarCantidadParcialTotal	=false;
			// var BultosMateriales			=ModeloProyect.getProperty("/DataPlani");
			var Bultos						=ModeloProyect.getProperty("/DataBultos");
			var Data=[];
			var ArraySeleccionados =[];
			var MaterialesSelecionado=[];
			var validad;
			var DataTipoBulto				=ModeloProyect.getProperty("/DataTipoBulto");
			var TipoBultoNombre	;
			if(SeleccionMateriales.length ===0){
				MessageToast.show("Seleccione Material");
				return ;
			}
			
			if(SeleccionBultos.length ===0){
				
				MessageToast.show("Seleccione Embalaje");
				return ;
			}
			
			SeleccionMateriales.forEach(function (e){
			var Mat = {
				Mat		:"",
				Cant	:0.000,
				Orden	:"",
				Pos     :""  
			};
			Bultos.Array.forEach(function(d){
			d.Array.forEach(function(f){
					if(f.MatnrD === Materiales[e].MatnrD &&  f.EbelnD === Materiales[e].EbelnD && f.EbelpD === Materiales[e].EbelpD){
					Mat.Mat		=f.MatnrD ;
					Mat.Pos		=f.EbelpD ;
					Mat.Cant	+=parseFloat(f.VemngD) ;
					Mat.Orden	=f.EbelnD;
					
				}
				});
				});
				
			   	Materiales.forEach(function(b){
			   			if (Materiales[e].MatnrD === b.MatnrD && b.EbelnD === Materiales[e].EbelnD  && b.EbelpD === Materiales[e].EbelpD){
			  			Mat.Cant	+= parseFloat(b.VemngD) ;
			  			Mat.Pos		=b.EbelpD ;
			  			Mat.Mat		= b.MatnrD;
			  			Mat.Orden	=b.EbelnD;
			  		}	
			  	});
				
				ArraySeleccionados.push(Mat);
				
			});
			var validar = false ;
			
			ArraySeleccionados.forEach(function (g){
			SeleccionMateriales.forEach(function (e){
				if(g.Mat === Materiales[e].MatnrD &&  g.Orden === Materiales[e].EbelnD &&  g.Pos === Materiales[e].EbelpD &&  parseFloat(g.Cant) > parseFloat(Materiales[e].CantTotal.replace(",","").replace(",","")  ) ){
					validar = true	;			
				}
			});
			});
			
			if(validar){
				MessageToast.show("No debe excederse a la Cantidad Total");
				return ;
			}
			  //var i = 0;ç
			  SeleccionMateriales.reverse().forEach(function(a){
			  	
			  	var totalAcumulado ;
			  	ArraySeleccionados.forEach(function(j){ 
			  		if(j.Mat === Materiales[a].MatnrD && j.Orden === Materiales[a].EbelnD && j.Pos === Materiales[a].EbelpD){
			  			totalAcumulado = j.Cant ;
			  		}
			  	});
			  	
				Materiales[a].TipoBulto =TipoBultoNombre;
			
				// Materiales[a].VemngD1	=Utilities.FormatterDinero(parseFloat(totalAcumulado));
				MaterialesSelecionado.push(JSON.parse(JSON.stringify(Materiales[a])));
				Materiales[a].VemngD	=Utilities.FormatterDinero(parseFloat(Materiales[a].CantTotal) - parseFloat(totalAcumulado));

				if((parseFloat(Materiales[a].CantTotal) - parseFloat(totalAcumulado)) === 0){
				Materiales.splice(a,1);
				tablaBultos.clearSelection();
				tablaMateriales.clearSelection();
				}
				
			  });
			  
					var context =tablaBultos.getContextByIndex(SeleccionBultos[0]);
					var oBjeto  =context.getObject();
					MaterialesSelecionado.forEach(function(a){
						var validar = false ;
					
						oBjeto.Array.forEach(function(d){
							
							if(d.MatnrD === a.MatnrD && a.EbelnD  === d.EbelnD && a.EbelpD  === d.EbelpD) {
							d.VemngD =Utilities.FormatterDinero(parseFloat(d.VemngD) + parseFloat(a.VemngD) );
								// ArraySeleccionados.forEach(function(j){
								// 	if(j.Mat === d.MatnrD && j.Orden === d.EbelnD){
						  //				d.VemngD = that.format2Decimales(j.Cant) ; 
			  			// 			}
								// });
								validar = true ;
							}
						});
						
						if(!validar){
							// a.VemngD = a.VemngD1 ;
							oBjeto.Array.push(a);
						}
						
						});
						
						sap.m.MessageBox.success("Se embalo "+oBjeto.Array.length.toString() +" Materiales al Embalaje "+oBjeto.Num,{
								title: "Mensaje de Éxito",
								actions: ["OK"],
								onClose: function (sActionClicked){
								}
							});
							
			  ModeloProyect.refresh(true);
		},
		addZero :function (i) {
		if (i < 10) {
	     i = "0" + i;
		 }
			 return i;
		},	
		GuardarBultosModificados :  function (){	
		var oView					=this.getView();
		var ModeloProyecto			=oView.getModel("Proyect");
		var Bultos					=ModeloProyecto.getProperty("/DataBultos");
		var array					=[];
		var today					= new Date();
		var dd						= this.addZero(today.getDate());
	    var MM						= this.addZero(today.getMonth() + 1);
	    var yyyy					= today.getFullYear();
	    var hours					= this.addZero(today.getHours());
	    var min 					= this.addZero(today.getMinutes());
	    var PesoTotal				= 0 ;
	    var validarMaterialVacio=false ;
	    var validarBulto=false ;
	    
	    if (Bultos.Array.length === 0){
			MessageToast.show("Embale un Material con un Embajale");
			return ;
		}
			Bultos.Array.forEach(function(a){
			if (a.Array.length === 0){
				validarMaterialVacio = true ;
				
			} 
			
		});
		if (validarMaterialVacio){
			MessageToast.show("Embalaje sin Material");
			return ;
		}
		
		Bultos.Array.forEach(function(ab){
			
		if(ab.Altura === "" || ab.Ancho === "" ||  ab.CantBulto === "" || ab.Longitud === "" || ab.Observacion === ""  || ab.PesoBulto === "") {
			validarBulto= true ;
		}	
			
		});
		
		if (validarBulto){
			MessageToast.show("Complete los campos del Embalaje");
			return ;
		}
		
	    
    	sap.ui.core.BusyIndicator.show(0);
		Bultos.Array.forEach(function(a){
			PesoTotal+=  parseFloat(a.PesoBulto);
			
			a.Array.forEach(function(d){

			var ob = {
				VhilmKu:a.Num.toString(),
				Vbeln: Bultos.Array[0].Array[0].VbelnD,
				Laeng:a.Longitud,
				Breit:a.Ancho,
				Hoehe:a.Altura,
				zul_aufpl:a.CantBulto === undefined ?"":a.CantBulto,
				Inhalt:a.Observacion,
				Brgew:a.PesoBulto,
				Vegr2:a.TipoBulto,
				Ebeln:d.EbelnD,
				Ebelp:d.EbelpD,
				Matnr:d.MatnrD,
				Menge:d.VemngD,
				Meins:d.VrkmeD
			}
				array.push(ob);
				
			});
			
		});

	var data2	=	{
	"Vbeln":  Bultos.Array[0].Array[0].VbelnD,
	"Brgew": PesoTotal.toString(),
	"Anzpk": Bultos.Array.length.toString(),
	 "ZETDETALLESet": array,
  "ZETRESULTADOSet": [
    {
      "Codigo": "",
      "Msg": ""
    }
  ]
};
			var that = this;
			$.ajax({ 
					url			:"/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_MOD_ENTREGA_SRV",
					type		: "GET",
					headers 	:{"x-CSRF-Token":"Fetch"}
					}).always(function(data,status,response){
					var	token =response.getResponseHeader("x-csrf-token");
						
					$.ajax({ 
					type		: "POST",
					url			:"/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_MOD_ENTREGA_SRV/ZETCABECERASet",
					headers 	:{"x-CSRF-Token":token},
					contentType	:"application/json",
					dataType	:"json",
					data		:JSON.stringify(data2)
					}).always(function(data , status,response){
						
					if(data.d.ZETRESULTADOSet === null){
					sap.m.MessageBox.error("No se modifico la Entrega", {
					title: "Mensaje de Error",
					actions: ["OK"],
					onClose: function (sActionClicked) {
						if(sActionClicked==="OK"){
						sap.ui.core.BusyIndicator.hide();
						// that.CerrarDialogBultos();
						that.CerrarDialog();
						}
						return ;
					}
					});
						
					}
					if(data.d.ZETRESULTADOSet.results[0].Codigo === "004"){
					sap.m.MessageBox.error(data.d.ZETRESULTADOSet.results[0].Msg, {
					title: "Mensaje de Error",
					actions: ["OK"],
					onClose: function (sActionClicked) {
						if(sActionClicked==="OK"){
						sap.ui.core.BusyIndicator.hide();
						// that.CerrarDialogBultos();
						that.CerrarDialog();
						}
					}
					});
					return ;
					} 
					if (status=== "success"){	
					sap.m.MessageBox.success(data.d.ZETRESULTADOSet.results[0].Msg	, {
					title: "Mensaje de Exito",
					actions: ["OK"],
					onClose: function (sActionClicked) {
						if(sActionClicked==="OK"){
						sap.ui.core.BusyIndicator.hide();
						// that.CerrarDialogBultos();
						that.CerrarDialog();
						// that.getOwnerComponent().getRouter().navTo("Page1");
						that.llamadoMetodos();
						}
					}
					});	
					}else {
					sap.m.MessageBox.error("No se modifico la Entrega", {
					title: "Mensaje de Error",
					actions: ["OK"],
					onClose: function (sActionClicked) {
						if(sActionClicked==="OK"){
						sap.ui.core.BusyIndicator.hide();
						// that.CerrarDialogBultos();
						that.CerrarDialog();
						}
					}
					});
					}
					// that.RegresarPagina();
					// that.ConsultarSociedades();
					// MessageToast.show("Se envió el correo al comprador :" + DataDetalle[0].SmtpAddr);	 
					// sap.ui.core.BusyIndicator.hide();
					});
						
						
					});	
		
			
			
			
		} ,
		addBultos : function (){
		var that=this;
		var oView =this.getView();	
		var ModeloProyect = oView.getModel("Proyect");
		var tipoBultos = ModeloProyect.getProperty("/DataTipoBulto") ;
		var DataBultos = ModeloProyect.getProperty("/DataBultos");
		var Mayor ;
		if(DataBultos.Array.length ===0){
			Mayor = 1 ;
			
		}else {
			Mayor= DataBultos.Array[0].Num ;
			DataBultos.Array.forEach(function (a){
				if(a.Num > Mayor){
					Mayor = a.Num ;
				}
			});
			Mayor = parseFloat(Mayor)+1;
			
		}
			var obj={
				Num			:Mayor.toString(),
				TipoBulto	:"0",
				enabledTpB	:true,
				CantBulto	:"",
				Observacion	:"",
				PesoBulto	:"",
				Longitud	:"",
				Ancho		:"",
				Altura		:"",
				Array		:[]
				
			};
			DataBultos.Array.push(obj);
			ModeloProyect.refresh(true);
		},
		removeBultos : function (){
		var 						that=this
		var oView					=this.getView();	
		var ModeloProyect			= oView.getModel("Proyect");
		var DataBultos				= ModeloProyect.getProperty("/DataBultos");
		var tabla1					=sap.ui.getCore().byId("tableBultos1");
		var SeleccionBultos			=sap.ui.getCore().byId("tableBultos1").getSelectedIndices();
		
		
		if(SeleccionBultos.length===0){
			MessageToast.show("Seleccione un Embalaje");
			return;
		}
		
		
		var context =tabla1.getContextByIndex(SeleccionBultos[0]);
		var oBjeto  =context.getObject();
		
		if(oBjeto.Array.length > 0 ){
			MessageToast.show("Seleccione un Embalaje sin Materiales Embalados");
			return;
		}
		var indice = 0 ;
		DataBultos.Array.forEach(function(a){
			if(a.Num === oBjeto.Num){
				DataBultos.Array.splice(indice,1);
			}
			indice++;
		});
		tabla1.clearSelection();
		ModeloProyect.refresh(true);
	
		
		},
		ValidarCamposBultos1 : function (oEvent){
			var oView = this.getView();
			var table =  sap.ui.getCore().byId("tableBultos1");
			var ModeloProyect = oView.getModel("Proyect");
			var context = oEvent.getParameter("rowContext");
			var DatoAnterior=ModeloProyect.getProperty("/OneDataTreeTable");
			if(context === null){
				return ;
			}
			var Object = this.getView().getModel("Proyect").getProperty(context.sPath);
			var oIndex = oEvent.getParameter('rowIndex');
			// var indentificador	=ModeloProyecto.getProperty("/Identifacador");
			if(!Object.Num){
				table.removeSelectionInterval(oIndex,oIndex);
			}else {
			
			if(table.getSelectedIndices().length ===1){
			ModeloProyect.setProperty("/OneDataTreeTable",oIndex);
				
			}else if (table.getSelectedIndices().length ===0){
				
			ModeloProyect.setProperty("/OneDataTreeTable","");
			}else {
					if(DatoAnterior !== oIndex){
				table.removeSelectionInterval(DatoAnterior,DatoAnterior);
				}
				
			}
			}
			
		
		},
		
	});
}, /* bExport= */ true);
