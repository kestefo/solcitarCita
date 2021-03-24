sap.ui.define(["./Page1.controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	'sap/m/Token',
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/model/Sorter"
], function(Page1, MessageBox, Utilities, History,Token,MessageToast,JSONModel,Fragment,NumberFormat,Sorter) {
	"use strict";
	let oView;
	let that;
	var arraymateriales=null;
	var materiales=[];
	var total=[];
	var i = 0;
	return Page1.extend("com.rava.controller.Registo", {
		//inicio de app
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("Registro").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			
			// this.setRUC();
		},
		onAfterRendering :function (){
			that = this;
			oView = this.getView();
			var url="/ERP/sap/opu/odata/sap/ZBVMM_WEB_CONDICION_ENTREGA_SRV/CondicionEntregaSet";
			var ModeloProyect = oView.getModel("ItemsModCondEnt");
			
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
					// console.log(oData)
					if (oData.d.results.length === 0) {
						MessageBox.error("No hay data consultar metodo "+url);
					} else {
						var data = oData.d.results;
						
						var obj = {
							"CodCond":"00",
							"DescCond":"Seleccionar",
						}
						
						data.unshift(obj)
						ModeloProyect.setProperty("/Data" ,data);
					}
				},
				error: function () {
					MessageBox.error("Ocurrio un error al obtener los datos");
				}
			});
		},
		fnPressModificarCondEntrega:function(){
			that = this; 
			oView = this.getView();
			
			var SeleccionBultos			=oView.byId("tableRegistro").getSelectedIndices();
			var tableRegistro			=oView.byId("tableRegistro");
			var arraymateriales 		=[];
			// var context =tableRegistro.getContextByIndex(d);
			// var oBjeto  =context.getObject();
			// arraymateriales.push(JSON.parse(JSON.stringify(oBjeto)));
			if(SeleccionBultos.length == 0){
				MessageToast.show("No se ha seleccionado material");
			}else{
				if (!oView.byId("DialogModCondEntrega")) {
						Fragment.load({
							id: oView.getId(),
							name: "com.rava.fragment.Cambios.ModificarCondEntrega",
							controller: that
					}).then(function (oDialog) {
						oView.addDependent(oDialog);
						oDialog.open();
						oView.byId("selectTipoCondEntregaOC").setSelectedKey("00")
					});
				} else {
					oView.byId("DialogModCondEntrega").open();
					oView.byId("selectTipoCondEntregaOC").setSelectedKey("00")
				}
			}
		},
		fnPreesCerrarDialogModEntrega:function(){
			oView.byId("DialogModCondEntrega").close();
		},
		saveModCondEntregaTemp:function(){
			that = this; 
			oView = this.getView();
			sap.m.MessageBox.success("Correo Enviado a \n kestefo@ravaconsulting.com.pe", {
				title: "Mensaje",
				actions: ["Aceptar"],
				onClose: function (sActionClicked){
					oView.byId("DialogModCondEntrega").close();
				}
			});
		},
		handleRouteMatched:function(oEvent){
			var oView = this.getView();
			var that=this;
			localStorage.setItem("arrayMateriales", JSON.stringify([]));
			localStorage.setItem("seleccionarBulto", JSON.stringify([]));
			localStorage.setItem("seleccionarMateriales", JSON.stringify([]));
			
			
			materiales=[];
			if(oView.byId("tableRegistro")){
			oView.byId("tableRegistro").clearSelection();
			}
			var ModeloProyect = oView.getModel("Proyect");
			ModeloProyect.setProperty("/Identifacador" , []);
			// ModeloProyect.setProperty("/DataPlani" ,{Array:[]});
			ModeloProyect.setProperty("/DataBultos",{Array:[]});
			var data = JSON.parse(sessionStorage.getItem('arrayMaterialOrden'));
			var arr=[];
			for(var i=0 ; i<data.length;i++){
				for(var k=0;k<data[i].ArrayMaterial.length;k++){
					
					data[i].ArrayMaterial[k].MengeD		=that.format2Decimales(data[i].ArrayMaterial[k].MengeD);	
					data[i].ArrayMaterial[k].ObmngD		=that.format2Decimales(data[i].ArrayMaterial[k].ObmngD);	
					data[i].ArrayMaterial[k].MengezuD	=that.FormatterDinero(data[i].ArrayMaterial[k].MengezuD);
					
					if(0<=data[i].ArrayMaterial[k].Diasxven){
						// data[i].ArrayMaterial[k].Status = "None";
						data[i].ArrayMaterial[k].Status1 = 9;
						data[i].ArrayMaterial[k].Status2 = 9;
						data[i].ArrayMaterial[k].Status3 = 9;
						if(1<=data[i].ArrayMaterial[k].Diasxven){
							data[i].ArrayMaterial[k].Status1 = 9;
							data[i].ArrayMaterial[k].Status2 = 9;
							data[i].ArrayMaterial[k].Status3 = 8;
							// data[i].ArrayMaterial[k].Status = "Success";
							if(3<=data[i].ArrayMaterial[k].Diasxven){
								// data[i].ArrayMaterial[k].Status = "Warning";
								data[i].ArrayMaterial[k].Status1 = 9;
								data[i].ArrayMaterial[k].Status2 = 1;
								data[i].ArrayMaterial[k].Status3 = 9;
								if(7<=data[i].ArrayMaterial[k].Diasxven){
									// data[i].ArrayMaterial[k].Status = "Error";
										data[i].ArrayMaterial[k].Status1 = 3;
										data[i].ArrayMaterial[k].Status2 = 9;
										data[i].ArrayMaterial[k].Status3 = 9;
								}
							}
						}
					}else{
						// data[i].ArrayMaterial[k].Status = "None";
						data[i].ArrayMaterial[k].Status1 = 9;
						data[i].ArrayMaterial[k].Status2 = 9;
						data[i].ArrayMaterial[k].Status3 = 9;
					}
					arr.push(data[i].ArrayMaterial[k])
				}
			}
			
			ModeloProyect.setProperty("/DataMateriales" ,arr);
			// var Sort = [{
   //     		 path: "Ebeln", 
   //     		 descending: false 
   // 			 },
   // 			 {
   // 			 path: "EbelpD", 
   //     		 descending: false
   // 			 }];
			
			// var oSorter = new Sorter(Sort);  
 
   // 		var oList = oView.byId("tableRegistro");
   // 		oList.getBinding("rows").sort(oSorter);
			ModeloProyect.refresh(true);
			console.log(arr)
		},
		//salir de la pantalla
		CerrarRegistro:function(){
			this.getView().byId("tableRegistro").clearSelection();
			this.oRouter.navTo("Page1");
		},
		
		//formato date celda
		formatDate: function (sValue) {
			// console.log(sValue)
			if(sValue==null){
			}else{
			var Fecha=new Date(parseInt(sValue.split("(")[1].split(")")[0]));
				
			
			Fecha.setHours(Fecha.getHours() + 24);
			var mes = (Fecha.getMonth() + 1);	
				
			if (mes > 0 && mes < 10) {
			mes = "0" + mes;
			}
			var dia =Fecha.getDate();
			if (dia > 0 && dia < 10) {
			dia = "0" + dia;
			}
				var fechaOC=dia.toString()+"."+mes.toString()+"."+Fecha.getFullYear().toString();
				// console.log(sValue)
				return fechaOC;
			}
		},
		
		//Dialog Button Embalar de Registro
		onSelectionChange:function(oEvent){
			// console.log("uo")
			var tableRegistro = this.byId("tableRegistro");
			var source = oEvent.getSource();
 		// console.log(this.getView().byId("regiscantidad").getValue())
			var Selecciones =source.getSelectedIndices();
			var selectedEntries = [];
			for(var i=0; i<Selecciones.length; i++){
				var oData = tableRegistro.getContextByIndex(Selecciones[i]);
				selectedEntries.push(oData.getProperty(oData.getPath()));
			}
			localStorage.setItem("arrayMateriales", JSON.stringify(selectedEntries));
			
			// console.log(selectedEntries)	
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
		Embalar: function(){
			that = this;
			var oView					=this.getView();
			var ModeloProyect			=oView.getModel("Proyect");
			var SeleccionBultos			=oView.byId("tableRegistro").getSelectedIndices();
			var tableRegistro			=oView.byId("tableRegistro");
			var Bultos					=ModeloProyect.getProperty("/DataBultos");
			var validarEnt 				=true;
			var validarProgramar		=true;	
			var validarCantidad			=true;
			var validarHU				=true;
			
			var contextFirst=tableRegistro.getContextByIndex(SeleccionBultos[0]);
			
			if(contextFirst === null){
				MessageToast.show("No se ha seleccionado material");
				return ;
			}
			
			var FirstObj=contextFirst.getObject();
			// Lugares.sort(that.dynamicSort("EbelpD"));
			var arraymateriales 		=[];
			
			
			SeleccionBultos.forEach(function(d){
			var context =tableRegistro.getContextByIndex(d);
			var oBjeto  =context.getObject();
			
			if(oBjeto.DescCond  !== FirstObj.DescCond ){
				// LugEntD Campo Antiguo
				validarEnt=false;
				
			}else if(oBjeto.Entprog !== FirstObj.Entprog){
				validarProgramar=false;
			}else if (parseFloat(oBjeto.MengezuD) > parseFloat(oBjeto.ObmngD.replace(",",""))){
				validarCantidad=false;
			}else if (oBjeto.Xhupf !== FirstObj.Xhupf){
				validarHU=false;
			}
			arraymateriales.push(JSON.parse(JSON.stringify(oBjeto)));
			
			});
			
			if(!validarEnt){
				sap.m.MessageBox.error("Verificar  Condición de Entrega", {
					title: "Mensaje de Error",
					actions: ["Aceptar","Cancelar"],
					onClose: function (sActionClicked){
					
					}
				});
				
				
			// MessageToast.show("Seleccione Lugares de Entrega iguales");
			return ;
			}else if (!validarProgramar){
					sap.m.MessageBox.error("Consolidación Inapropiada, solo seleccionar OC con la misma condición", {
					title: "Mensaje de Error",
					actions: ["Aceptar","Cancelar"],
					onClose: function (sActionClicked){
					
					}
				});
				
				// MessageToast.show("Seleccione Condiciones iguales");
				return ;
			}else if(!validarCantidad){
				MessageToast.show("No puede superar el Pendiende de Envio");
				return ;
				
			}else if(!validarHU){
				MessageToast.show("No se puede seleccionar con HU diferentes");
				return ;
				
			}			
		
			var ModeloProyect = oView.getModel("Proyect");
			// var arraymateriales = JSON.parse(localStorage.getItem('arrayMateriales'));
			// console.log(arraymateriales)
			if(arraymateriales[0] === undefined){
				MessageToast.show("No se ha seleccionado material");
			}else{
				var array = [];
				var variable = {
				MatnrD 		:"",
				EbelnD  	:"",
				CantTotal	:0.00,
				MengezuD	:0.00,
				MeinsD		:"",
				Txz01D		:""
				// obs			:"obsPrueba"
				};
				// TdlinePos
				var Object1 = arraymateriales[0] ;
				for(var i=0;i<arraymateriales.length;i++){
					arraymateriales[i].enabled		= false;
					// arraymateriales[i].CantTotal	=arraymateriales[i].MengezuD;
					if (Object1.EbelnD ===  arraymateriales[i].EbelnD && Object1.MatnrD ===  arraymateriales[i].MatnrD && Object1.EbelpD ===  arraymateriales[i].EbelpD){
						variable.MatnrD		=arraymateriales[i].MatnrD;
						variable.EbelnD		=arraymateriales[i].EbelnD;	
						variable.MeinsD		=arraymateriales[i].MeinsD;	
						variable.Txz01D		=arraymateriales[i].Txz01D;	
						variable.EindtpD	=arraymateriales[i].EindtpD;	
						variable.MengezuD	+=parseFloat(arraymateriales[i].MengezuD);
						variable.CantTotal	+=parseFloat(arraymateriales[i].MengezuD);
						variable.EbelpD		=arraymateriales[i].EbelpD;	
						variable.Xhupf		=arraymateriales[i].Xhupf;
						variable.TdlinePos	=arraymateriales[i].TdlinePos;
						// variable.obs		=arraymateriales[i].obs;
					}else {
						variable.CantTotal	=that.format2Decimales(variable.CantTotal);
						variable.MengezuD	=that.FormatterDinero(variable.MengezuD);
						array.push(JSON.parse(JSON.stringify(variable)));
						variable.MatnrD		=arraymateriales[i].MatnrD;
						variable.EbelnD		=arraymateriales[i].EbelnD;	
						variable.MeinsD		=arraymateriales[i].MeinsD;	
						variable.Txz01D		=arraymateriales[i].Txz01D;	
						variable.EindtpD	=arraymateriales[i].EindtpD;
						variable.MengezuD	=parseFloat(arraymateriales[i].MengezuD);
						variable.CantTotal	=parseFloat(arraymateriales[i].MengezuD);
						variable.EbelpD		=arraymateriales[i].EbelpD;	
						variable.Xhupf		=arraymateriales[i].Xhupf;
						variable.TdlinePos	=arraymateriales[i].TdlinePos;
						// variable.obs		=arraymateriales[i].obs;
						Object1 			=arraymateriales[i] ;
					}
				}
				variable.CantTotal	=that.format2Decimales(variable.CantTotal);
				variable.MengezuD	=that.FormatterDinero(variable.MengezuD);
				array.push(JSON.parse(JSON.stringify(variable)));
				
				var obj={
					Num			:materiales.length+1,
					TipoBulto	:"0",
					enabledTpB	:false,
					CantBulto	:"",
					Observacion	:"",
					PesoBulto	:"",
					Longitud	:"",
					Ancho		:"",
					Altura		:"",
					Array		:[]
					};
			
				if (!oView.byId("DialogEmbalarBultos")) {
				// load asynchronous XML fragment
					Fragment.load({
						id: oView.getId(),
						name: "com.rava.fragment.EmbalarBultos",
						controller: that
					}).then(function (oDialog) {
						// connect dialog to the root view of this component (models, lifecycle)
						oView.addDependent(oDialog);
						if(arraymateriales[0].Xhupf){
							
							// Bultos.Array.push({Array:[]});
							ModeloProyect.setProperty("/DataBultos" , {Array:[]});
							oView.byId("bottonBulto").setEnabled(true);
							oView.byId("bottonBultoMenos").setEnabled(true);
							oView.byId("tableBultos").clearSelection();
							oView.byId("tableMateriales").clearSelection();
							// oView.byId("BotonCantidadParcial").setEnabled(true);
						}else{
							Bultos.Array.push(obj);
							oView.byId("bottonBulto").setEnabled(false);
							oView.byId("bottonBultoMenos").setEnabled(false);
							// oView.byId("BotonCantidadParcial").setEnabled(false);
							oView.byId("DialogEmbalarBultos").open();
						}
						ModeloProyect.setProperty("/DataMaterialesSeleccionados" ,array);
						oDialog.open();
						oView.byId("tableBultos").clearSelection();
						oView.byId("tableMateriales").clearSelection();
					});
				} else {
					if(arraymateriales[0].Xhupf){
						
						ModeloProyect.setProperty("/DataBultos" , {Array:[]});
						oView.byId("bottonBulto").setEnabled(true);
						oView.byId("bottonBultoMenos").setEnabled(true);
						oView.byId("tableBultos").clearSelection();
						oView.byId("tableMateriales").clearSelection();
						// oView.byId("BotonCantidadParcial").setEnabled(true);
					}else{
						Bultos.Array.push(obj);
						// ModeloProyect.setProperty("/DataBultos" ,materiales);
						oView.byId("bottonBulto").setEnabled(false);
						oView.byId("bottonBultoMenos").setEnabled(false);
						oView.byId("DialogEmbalarBultos").open();
						// oView.byId("TituloBultos").setText("Numero de Bultos (" + materiales.length +")")
					}
					// oView.byId("TituloResumen").setText("Resumen de Materiales (" + arraymateriales.length +")")
					oView.byId("DialogEmbalarBultos").open();
					oView.byId("tableBultos").clearSelection();
					oView.byId("tableMateriales").clearSelection();
					ModeloProyect.setProperty("/DataMaterialesSeleccionados" ,array);
				}
				
			}
		
			
			ModeloProyect.refresh(true);
			that.getTipoBultos();
		},
		CerrarDialog:function(){
			materiales=[];
			this.getView().byId("tableMateriales").clearSelection();
			this.getView().byId("tableBultos").clearSelection();
			this.getView().byId("bottonBulto").setEnabled(true);
			// this.getView().byId("TituloBultos").setText("Numero de Bultos()");
			// this.getView().byId("TituloResumen").setText("Resumen de Materiales ()");
			this.getView().getModel("Proyect").setProperty("/DataMaterialesSeleccionados" ,materiales);
			this.getView().getModel("Proyect").setProperty("/DataBultos" ,{Array:[]});
			// this.getView().getModel("Proyect").setProperty("/DataPlani" ,{Array:[]});
			this.getView().getModel("Proyect").refresh(true);
			this.byId("DialogEmbalarBultos").close();
		},
		//Dialog Button Embalar de Registro
		
		format2Decimales: function (Number) {
			var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
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
		
		// //button cantidad parcial
		CantidadParcial:function(){
			var that						=this;
			var oView						=this.getView();
			var ModeloProyect				=oView.getModel("Proyect");
			var tablaBultos					=oView.byId("tableBultos")
			var tableMateriales				=oView.byId("tableMateriales");
			var SeleccionMateriales			=tableMateriales.getSelectedIndices();
			var SeleccionBultos				=tablaBultos.getSelectedIndices();
			var Materiales					=ModeloProyect.getProperty("/DataMaterialesSeleccionados");
			var validarCantidadParcial		=false;
			var validarCantidadParcialTotal	=false;
			// var BultosMateriales			=ModeloProyect.getProperty("/DataPlani");
			var Bultos						=ModeloProyect.getProperty("/DataBultos");
			var Data						=[];
			var ArraySeleccionados			=[];
			var MaterialesSelecionado		=[];
			var validad;
			var DataTipoBulto				=ModeloProyect.getProperty("/DataTipoBulto");
			var TipoBultoNombre	;
			if(SeleccionMateriales.length ===0){
				MessageToast.show("Seleccione Material");
				return ;
			}
			
			if(SeleccionBultos.length ===0){
				
				MessageToast.show("Seleccione un Embalaje");
				return ;
			}
			
			SeleccionMateriales.forEach(function (e){
			var Mat = {
				Mat		:"",
				Cant	:0.000,
				Orden	:"",
				Pos		:""
			};
			Bultos.Array.forEach(function(d){
			d.Array.forEach(function(f){
					if(f.MatnrD === Materiales[e].MatnrD &&  f.EbelnD === Materiales[e].EbelnD  && f.EbelpD === Materiales[e].EbelpD){
					Mat.Mat		=f.MatnrD ;
					Mat.Pos		=f.EbelpD ;
					Mat.Cant	+=parseFloat(f.MengezuD) ;
					Mat.Orden	=f.EbelnD;
					
				}
				});
				});
				
			   	Materiales.forEach(function(b){
			   			if (Materiales[e].MatnrD === b.MatnrD && b.EbelnD === Materiales[e].EbelnD &&  b.EbelpD === Materiales[e].EbelpD ){
			  			Mat.Cant	+=parseFloat(b.MengezuD) ;
			  			Mat.Pos		=b.EbelpD ;
			  			Mat.Mat		=b.MatnrD;
			  			Mat.Orden	=b.EbelnD;
			  		}	
			  	});
				
				ArraySeleccionados.push(Mat);
				
			});
			var validar = false ;
			
			ArraySeleccionados.forEach(function (g){
			SeleccionMateriales.forEach(function (e){
				if(g.Mat === Materiales[e].MatnrD &&  g.Orden === Materiales[e].EbelnD &&  g.Pos === Materiales[e].EbelpD &&  parseFloat(g.Cant) > parseFloat( Materiales[e].CantTotal.replace(",","").replace(",","")  ) ){
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
				
				// Materiales[a].MengezuD1	=Utilities.FormatterDinero(parseFloat(totalAcumulado));
				MaterialesSelecionado.push( JSON.parse(JSON.stringify(Materiales[a])) );
				Materiales[a].MengezuD	=Utilities.FormatterDinero( parseFloat(Materiales[a].CantTotal) - parseFloat(totalAcumulado) );
				
				if(  parseFloat(Materiales[a].CantTotal) - parseFloat(totalAcumulado)   === 0){
				Materiales.splice(a,1);
				tablaBultos.clearSelection();
				tableMateriales.clearSelection();
				}
				
			  });
			  
					var context =tablaBultos.getContextByIndex(SeleccionBultos[0]);
					var oBjeto  =context.getObject();
					MaterialesSelecionado.forEach(function(a){
						var validar = false ;
					
						oBjeto.Array.forEach(function(d){
							
							if(d.MatnrD === a.MatnrD && a.EbelnD  === d.EbelnD && a.EbelpD  === d.EbelpD) {
								
							d.MengezuD =that.FormatterDinero( parseFloat(d.MengezuD) + parseFloat(a.MengezuD) );
								// ArraySeleccionados.forEach(function(j){
								// 	if(j.Mat === d.MatnrD && j.Orden === d.EbelnD){
						  //				d.MengezuD = that.format2Decimales(j.Cant) ; 
			  			// 			}
									
								// });
								validar = true ;
							}
						});
						
						if(!validar){
							// a.MengezuD = a.MengezuD1 ;
								
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
		
		// metodos add materiales
		addBultos:function(){
		// materiales = [];	
		that=this
		var oView =this.getView();	
		var ModeloProyect = oView.getModel("Proyect");
		var tipoBultos = ModeloProyect.getProperty("/DataTipoBulto") ;
		var DataBultos = ModeloProyect.getProperty("/DataBultos");
		var Mayor 
		if(DataBultos.Array.length ===0){
			Mayor = 1 ;
			
		}else {
			Mayor= DataBultos.Array[0].Num ;
			DataBultos.Array.forEach(function (a){
				if(a.Num > Mayor){
					Mayor = a.Num ;
				}
			});
			Mayor = Mayor+1;
			
		}
			var obj={
				Num			:Mayor,
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
		var tabla1					=oView.byId("tableBultos");
		var SeleccionBultos			=oView.byId("tableBultos").getSelectedIndices();
		
		
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
		getTipoBultos: function(){
			var oView = this.getView();
			var ModeloProyect = oView.getModel("Proyect");
			
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
					
					ModeloProyect.setProperty("/DataTipoBulto" ,oData.d.results);
				},
				error: function () {
					MessageBox.error("Ocurrio un error al obtener los datos");
				}
			});
		},
		// metodos add bulto
		
		// valida onclick en campos
		ValidarCamposBultos : function (oEvent){
			var oView = this.getView();
			var table = oView.byId("tableBultos");
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
		ValidarCamposMateriales : function (oEvent){
			var oView = this.getView();
			var table = oView.byId("tableMateriales");
			var context = oEvent.getParameter("rowContext");
			// var path = context.sPath;
			if(context != null){
				var Object = this.getView().getModel("Proyect").getProperty(context.sPath);
				var oIndex = oEvent.getParameter('rowIndex');
				
				var Selecciones =table.getSelectedIndices();
				var selectedEntries = [];
				
				for(var i=0; i<Selecciones.length; i++){
					var oData = table.getContextByIndex(Selecciones[i]);
					selectedEntries.push(oData.getProperty(oData.getPath()));
				}
				localStorage.setItem("seleccionarMateriales", JSON.stringify(selectedEntries));
			}
			// this.almbultoTotal(selectedEntries,"materialAsociados")
		},
		EmbaladoParcial:function(){
			// var objetoBulto = JSON.parse(localStorage.getItem('seleccionarBulto'))
			// var objetoMateriales =  JSON.parse(localStorage.getItem('seleccionarMateriales'))
			var oView					=this.getView();
			var ModeloProyecto			=oView.getModel("Proyect");
			var Bultos					=ModeloProyecto.getProperty("/DataBultos");
			var Materiales				=ModeloProyecto.getProperty("/DataMaterialesSeleccionados");
			var SeleccionBultos			=oView.byId("tableBultos").getSelectedIndices();
			var SeleccionMateriales		=oView.byId("tableMateriales").getSelectedIndices();
			var MaterialesSelecionado	=[];
			var BultosMateriales		=ModeloProyecto.getProperty("/DataPlani");
			var DataTipoBulto			=ModeloProyecto.getProperty("/DataTipoBulto");
			var TipoBultoNombre	;
			var ArraySeleccionados =[];
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
			
				SeleccionMateriales.forEach(function (e){
			var Mat = {
				Mat: "",
				Cant:0.000,
				Orden:""
			}	;
			BultosMateriales.Array.forEach(function(d){
			d.Array.forEach(function(f){
					if(f.MatnrD === Materiales[e].MatnrD &&  f.EbelnD === Materiales[e].EbelnD){
					Mat.Mat =f.MatnrD ;
					Mat.Cant += parseFloat(f.MengezuD) ;
					Mat.Orden = f.EbelnD;
				}
				});
				});
				// validacion.push(Mat);
			//  var acumulado = {
			// 	Mat:"",
			// 	Cant:0.000,
			// 	Orden:""
			// };
			   //	Materiales.forEach(function(b){
			   //			if (Materiales[e].MatnrD === b.MatnrD && b.EbelnD === Materiales[e].EbelnD  ){
			  	// 		Mat.Cant += parseFloat(b.MengezuD) ;
			  	// 		Mat.Mat = b.MatnrD;
			  	// 		Mat.Orden =b.EbelnD;
			  	// 	}	
			  	// });
				
				ArraySeleccionados.push(Mat);
			});
			var validar = false ;
			
			ArraySeleccionados.forEach(function (g){
			SeleccionMateriales.forEach(function (e){
				if(g.Mat === Materiales[e].MatnrD &&  g.Orden === Materiales[e].EbelnD &&  parseFloat(g.Cant) > parseFloat(Materiales[e].CantTotal) ){
					validar = true	;			
				}
				// 	if(g.Mat === Materiales[e].MatnrD &&  g.Orden === Materiales[e].EbelnD &&  parseFloat(Materiales[e].CantTotal) === parseFloat(g.Cant)  ){
				// 	validar = true	;			
				// }
			});
			});
			
			if(validar){
				MessageToast.show("No debe excederse de la Cantidad Total");
				
				return ;
			}
			
				if(SeleccionMateriales.length>0){
					SeleccionMateriales.reverse().forEach(function(a){
						
				var totalAcumulado =0;
			  	ArraySeleccionados.forEach(function(j){ 
			  		if(j.Mat === Materiales[a].MatnrD && j.Orden === Materiales[a].EbelnD && Materiales[a].EbelpD){
			  			totalAcumulado = j.Cant ;
			  		}
			  	});
						
						
							Materiales[a].TipoBulto =TipoBultoNombre;
							if(parseFloat(totalAcumulado) === 0){
								Materiales[a].MengezuD = Utilities.FormatterDinero(Materiales[a].CantTotal);
							}else {
								Materiales[a].MengezuD = Utilities.FormatterDinero(parseFloat(Materiales[a].CantTotal) - parseFloat(totalAcumulado));
							}
							
							MaterialesSelecionado.push(Materiales[a]);
							Materiales.splice(a,1);
							
							
					});
				
					oView.byId("tableMateriales").clearSelection();
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
	
		Continuar : function (){
			if(!this.Bultos){
				this.Bultos = sap.ui.xmlfragment("com.rava.fragment.Bultos" , this);
				this.getView().addDependent(this.Bultos);
			}
			this.Bultos.close();
			this.Bultos.open();
		},
		CerrarDialogBultos : function (){
			this.Bultos.close();
			var tabla			=sap.ui.getCore().byId("treetableDataBultosMateriales")	;
			tabla.clearSelection();
		},
		
		ValidarCamposBM:function(oEvent){
			
			var oView					=this.getView();
			var ModeloProyecto			=oView.getModel("Proyect");
			
			var table = sap.ui.getCore().byId("treetableDataBultosMateriales");
			var context = oEvent.getParameter("rowContext");
			
			if (context=== null){
			
			return ;
			}
			var Object = this.getView().getModel("Proyect").getProperty(context.sPath);
			var oIndex = oEvent.getParameter('rowIndex');
			var indentificador	=ModeloProyecto.getProperty("/Identifacador");
			
			if(Object.Descripcion=== undefined){
				
			return ;
			}
			
			
			if(!Object.Descripcion){
				// MessageToast.show("Solo se puede seleccionar Numero de Entrega");
				table.removeSelectionInterval(oIndex,oIndex);
			}else  {
					
				if (indentificador.length ===0){
					indentificador.push(Object);
				} 
				indentificador.forEach(function (a){
					
					if(a.Descripcion  !== Object.Descripcion && i === 0){
						indentificador.push(Object);
						i++;
					}
				
				});
			}
			
		},
		desvincular : function () {
		var oView					=this.getView();
		// var tabla					=sap.ui.getCore().byId("treetableDataBultosMateriales");
		var tabla1					=oView.byId("tableBultos");
		var SeleccionBultos			=tabla1.getSelectedIndices();
		var ModeloProyecto			=oView.getModel("Proyect");
		var Bultos					=ModeloProyecto.getProperty("/DataBultos");
		var MaterialesEmbalar		=ModeloProyecto.getProperty("/DataMaterialesSeleccionados");
		var array =[];
		// var BultoEmbalar =  ModeloProyecto.getProperty("/DataBultos");
		
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
	
		tabla1.clearSelection();
		SeleccionBultos.reverse().forEach(function(a){
			var context =tabla1.getContextByIndex(a);
			var oBjeto  =context.getObject();
			
			oBjeto.Array.forEach(function(k){
			MaterialesEmbalar.forEach(function(r){
				if (k.MatnrD === r.MatnrD && k.EbelnD === r.EbelnD  && k.EbelpD === r.EbelpD){
					k.MengezuD = Utilities.FormatterDinero(parseFloat(r.MengezuD) + parseFloat(k.MengezuD)) ; 
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
					Bultos.Array.splice(indice,1);
					obj.TipoBulto	="0";
					// obj.CantBulto	="";
					// obj.Observacion	="";
					// obj.PesoBulto	="";
					// obj.Longitud	="";
					// obj.Ancho		="";
					// obj.Altura		="";
					// obj.Array.splice(0,obj.Array.length);
					
				}
				indice++;
			});
		
			
		}else  {
			ModeloProyecto.setProperty("/DataBultos/Array",[obj]);
		}

		
		});
		ModeloProyecto.refresh(true);
		},
		
		addZero :function (i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
},

		ConvertirFechaSap :function (fecha1){
			var FechaSap  =(fecha1.replace("/Date(","")).replace(")/","");
			var Fecha = new Date(FechaSap*1);
			Fecha.setHours(Fecha.getHours() + 24);
			var mes = (Fecha.getMonth() + 1);
			if (mes > 0 && mes < 10) {
			mes = "0" + mes;
			}
			var dia =Fecha.getDate();
			if (dia > 0 && dia < 10) {
			dia = "0" + dia;
			}
			return Fecha.getFullYear().toString()+"-"+mes.toString()+"-"+dia.toString();
			
		},
		GuardarBultos : function (){
		var oView					=this.getView();
		var ModeloProyecto			=oView.getModel("Proyect");
		var Bultos					=ModeloProyecto.getProperty("/DataBultos");
		var array=[];
		var validarMaterialVacio=false ;
		var validarBulto=false ;
		
		if (Bultos.Array.length === 0){
			MessageToast.show("Embale un Material con un Embalaje");
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
			
		if(ab.Altura === "" || ab.Ancho === "" || ab.Longitud === "" || ab.Observacion === ""  || ab.PesoBulto === "") {
		// ||  ab.CantBulto === "" 
			validarBulto= true ;
		}	
			
		});
		
		if (validarBulto){
			MessageToast.show("Complete los campos del Embalaje");
			return ;
		}
		
		// if(Bultos.Altura ==="" && Bultos.Ancho === "" && Bultos.CantBulto ==="" && Bultos.Longitud ==="" Bultos.Observacion === "" Bultos.PesoBulto === "") {
			
		// }
		
		
		// if(Bultos.){
			
		// }
		
		sap.ui.core.BusyIndicator.show(0);
		
	var today = new Date();
    var dd = this.addZero(today.getDate());
    var MM = this.addZero(today.getMonth() + 1);
    var yyyy = today.getFullYear();
    var hours = this.addZero(today.getHours());
    var min = this.addZero(today.getMinutes());
    that = this;
    
		Bultos.Array.forEach(function(a){
			a.Array.forEach(function(d){
	
			var ob = {
				VhilmKu:a.Num.toString(),
				Lfdat		:that.ConvertirFechaSap(d.EindtpD)+"T00:00:00",
				Laeng		:a.Longitud		,
				Breit		:a.Ancho		,
				Hoehe		:a.Altura		,
				Inhalt		:a.Observacion	,
				Brgew		:a.PesoBulto	,
				Vegr2		:a.TipoBulto	,
				Ebeln		:d.EbelnD		,
				Ebelp		:d.EbelpD		,
				zul_aufpl	:"0"			,
				Tdline		:d.TdlinePos	,	
				// a.CantBulto,
				Matnr		:d.MatnrD		,
				eindt		:that.ConvertirFechaSap(d.EindtpD)+"T00:00:00",
				Menge		:d.MengezuD		,
				Meins		:d.MeinsD
			}
				array.push(ob);
				
			});
			
		});
		

	var data2	=	{
	"Zflag": "X",
	"Lfdat": yyyy+"-"+MM+"-"+dd+"T00:00:00",
	"Lfuhr": "PT"+hours+"H"+min+"M",
	"Anzpk": Bultos.Array.length.toString(),
	 "ZDETALLE": array,
  "ZETRESULTADOSet": [
    {
      "Codigo": "",
      "Msg": ""
    }
  ]
};
			var that = this;
			
			$.ajax({ 
					url			:"/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_GUARD_ENTREGA_SRV",
					type		: "GET",
					headers 	:{"x-CSRF-Token":"Fetch"}
					}).always(function(data,status,response){
					var	token =response.getResponseHeader("x-csrf-token");
						
					$.ajax({ 
					type		: "POST",
					url			:"/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_GUARD_ENTREGA_SRV/ZETCABECERASet",
					headers 	:{"x-CSRF-Token":token},
					contentType	:"application/json",
					dataType	:"json",
					data		:JSON.stringify(data2)
					}).always(function(data , status,response){
						
					
					if (status=== "success"){	
					sap.m.MessageBox.success(data.d.ZETRESULTADOSet.results[0].Msg	, {
					title: "Mensaje de Exito",
					actions: ["OK"],
					onClose: function (sActionClicked) {
						if(sActionClicked==="OK"){
							
						// that.CerrarDialogBultos();
						that.CerrarDialog();
						that.getOwnerComponent().getRouter().navTo("Page1");
						that.llamadoMetodos();
						}
					}
					});	
					}else {
					sap.m.MessageBox.error("No se creó la entrega", {
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
					});
						
						
					});	
		},
		
		ValidarDecimal : function (oEvent){
		var value = oEvent.getSource().getValue();
		oEvent.getSource().setValue(this.FormatterDinero(value));
		},
		FormatterDinero: function (value) {

			var oNumberFormat = sap.ui.core.format.NumberFormat.getCurrencyInstance({
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
		DialogVerObs:function(oEvent){
			that = this;
			oView = this.getView();
			var path = oEvent.getSource().getParent().getBindingContext("Proyect").getPath();
			var object = oEvent.getSource().getParent().getBindingContext("Proyect").getObject();
			var obs = object.TdlinePos;
			if (!oView.byId("DialogObsEmbMat")) {
					Fragment.load({
						id: oView.getId(),
						name: "com.rava.fragment.Cambios.DialogObsEmbMat",
						controller: that
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					oDialog.open();
					oView.byId("inputObs").setValue(obs);
				});
			} else {
				oView.byId("DialogObsEmbMat").open();
				oView.byId("inputObs").setValue(obs);
			}
		},
		GuardarDialogVerObs:function(){
			
		},
		CerrarDialogVerObs:function(){
			that = this;
			oView = this.getView();
			oView.byId("DialogObsEmbMat").close();
			oView.byId("inputObs").setValue("");
		}
		
	});
}, /* bExport= */ true);