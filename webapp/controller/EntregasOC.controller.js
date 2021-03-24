sap.ui.define(["sap/ui/core/mvc/Controller",
	"./BaseController",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	'sap/m/Token',
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/model/Sorter",
	'../util/utilUI',
	"../services/Services",
	'../util/util',
], function(e, BaseController, MessageBox, Utilities, History,Token,MessageToast,JSONModel,Fragment,NumberFormat,Sorter,utilUI,Services,util) {
	"use strict";
	let oView;
	let that;
	var arraymateriales=null;
	var materiales=[];
	var total=[];
	var i = 0;
	return BaseController.extend("com.rava.controller.EntregasOC", {
		//inicio de app
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("EntregasOC").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
		},
		onAfterRendering:function(){
			that = this;
			oView = this.getView();
			var ModeloProyect = oView.getModel("EntregaSinOC");
			ModeloProyect.setSizeLimit(99999999);
		},
		onBeforeRendering :function (){
			that = this;
			oView = this.getView();
			sap.ui.core.BusyIndicator.show(0);
			that.fnLimpiar();
			that.fnLimpiarValueStates();
			that.getDataGlobalEntregaSinOC();
		},
		handleRouteMatched:function(oEvent){
			that=this;
			oView = this.getView();
		},
		fnSelectedCondEntregaOC:function(oEvent){
			that = this;
			oView = this.getView();
			var keyCondEntrega=oEvent.getSource().getSelectedItem().getKey();
			var ModeloProyect = oView.getModel("EntregaSinOC");
			if(keyCondEntrega != ""){
				var data=oEvent.getSource().getSelectedItem().getBindingContext("EntregaSinOC").getObject();
				var destino = data.ArrayGeneral;
				var obj = {
					Lgort: "",
					Namel:"Seleccionar"
				};
				if(destino[0].Lgort != ""){
					destino.unshift(obj)
				}
				
				ModeloProyect.setProperty("/DataDestino" ,destino);
				oView.byId("selectDestinoOC").setSelectedKey("");
				// oEvent.getSource().setValueState("Success");
			}else{
				ModeloProyect.setProperty("/DataDestino" , []);
				// oEvent.getSource().setValueState("None");
			}
		},
		fnChangeOtros:function(oEvent){
			var that = this;
			var oView = this.getView();
			var objkey= oView.byId("selectMotivos").getSelectedItem().getKey();
			if(objkey != ""){
				// oEvent.getSource().setValueState("Success");
				if(objkey == "X03"){
					oView.byId("otrosid").setVisible(true);
				}else{
					oView.byId("otrosid").setVisible(false);
				}
			}else{
				// oEvent.getSource().setValueState("None");
			}
		},
		fnPressAddEmbalajes:function(oEvent){
			var oView = this.getView();
			var that=this;
			var obj;
			var items=[];
			var objmaxtable;
			var maximo = 0;
			var maxEmb=0;
			if(oView.byId("tableEmbalajes").getBinding().getModel("/DataEmbalajes").getData().DataEmbalajes != undefined){
				items= oView.byId("tableEmbalajes").getBinding().getModel("/DataEmbalajes").getData().DataEmbalajes;
				for(var i=0,len=items.length;i<len;i++){
					if(maximo < items[i].key){
						maximo = items[i].key;
						objmaxtable = items[i];
					}
					
					if(maxEmb < items[i].nEmbalaje){
						maxEmb = items[i].nEmbalaje;
					}
				}
			}
				
			obj={
				"key": maximo + 1,
				"nEmbalaje": maxEmb + 1,
				"selectedKey":"",
				"tipoEmbalaje": "",
				"desctipoEmbalaje": "",
				"descripcionContenido": "",
				"peso": "",
				"longitud": "",
				"ancho": "",
				"altura": ""
			}
			
			items.push(obj);
			// var oJsonModel = new JSONModel(items);
			// this.getView().byId("tableEmbalajes").setModel(oJsonModel)
			// this.getView("tableEmbalajes").setVisibleRowCount((items.length).toString());
			oView.getModel("EntregaSinOC").setProperty("/DataEmbalajes", items);
			oView.byId("cantEmbalajeEntregaSinOC").setText(items.length)
			
		},
		fnSelectionEmbalajes:function(oEvent){
			var oView = this.getView();
			var table = oView.byId("tableEmbalajes");
			var context = oEvent.getParameter("rowContext");
			
			if(context != null){
				var path = context.sPath;
				var Object = this.getView().getModel("EntregaSinOC").getProperty(path);
				// var items= Object.items
			}
			
			var oIndex = oEvent.getParameter('rowIndex');
			var Selecciones =table.getSelectedIndices();
			var selectedEntriesProvi = [];
			var selectedEntries=[];
			
			if(Selecciones.length>1){
				table.removeSelectionInterval(oIndex,oIndex);
			}else{
				for(var i=0; i<Selecciones.length; i++){
					var oData = table.getContextByIndex(Selecciones[i]);
					selectedEntries.push(oData.getProperty(oData.getPath()));
				}
				
				// oView.byId("tableItems").setVisible(true);
				// var oJsonModel = new JSONModel(items);
				// oView.byId("tableItems").setModel(oJsonModel);
			}
			
		},
		fnPressDeleteEmbalajes:function(){
			var that = this;
			var oView= this.getView();
			var tablaEmbalajes=oView.byId("tableEmbalajes");
			var index=tablaEmbalajes.getSelectedIndex();
			if(index != -1){
				MessageBox.confirm("¿Seguro que desea eliminar? \n Se eliminaran todos los items relacionados al embalaje \n Se actualizaran los embalajes y items", {
					actions: ["Confirmar", "Cancelar"],
					emphasizedAction: "Manage Products",
					onClose: function (sAction) {
						if(sAction=="Confirmar"){
							that.fnDeleteEmbalajes();
						} 
					}
				});
			}else{
				utilUI.onMessageErrorDialogPress2("No se ha seleccionado ningun embalaje");
			}
		},
		fnDeleteEmbalajes:function(){
			var that = this;
			var oView=this.getView();
			
			var table = oView.byId("tableEmbalajes");
			var index = oView.byId("tableEmbalajes").getSelectedIndex();
			table.removeSelectionInterval(index,index);
			
			var tableItems = oView.byId("tableItems");
			var indexItems = oView.byId("tableItems").getSelectedIndex();
			tableItems.removeSelectionInterval(indexItems,indexItems);
			
			var sPath="/DataEmbalajes/" + (index).toString();
			var objTabla=oView.getModel("EntregaSinOC").getProperty("/DataEmbalajes");
			var objSelected=oView.getModel("EntregaSinOC").getProperty(sPath);
			
			var objectItem=oView.getModel("EntregaSinOC").getProperty("/DataItems");
			var cantidad=objectItem.length;
			var objectItemMoment=oView.getModel("EntregaSinOC").getProperty("/DataItems");
			var indiceItems=[];
			for(var i=0;i<cantidad;i++){
				if(objSelected.nEmbalaje == objectItem[i].nEmbalaje){
					var indice = objectItemMoment.indexOf( objectItem[i] );
					if(indice != -1)
					indiceItems.push(indice)
					// objectItemMoment.splice( indice, 1 );
				}
			}
			if(indiceItems.length > 0){
				objectItemMoment.splice( indiceItems[0], indiceItems.length );
				oView.getModel("EntregaSinOC").setProperty("/DataItems", objectItemMoment);
			}
			
			var arrmoment=[];
			
			for(var i=0;i<objTabla.length;i++){
				var indice = objTabla.indexOf( objSelected );
				if(indice != -1)
				objTabla.splice( indice, 1 );
			}
			
			var oJsonModel = new JSONModel([]);
			
			
			oView.getModel("EntregaSinOC").setProperty("/DataEmbalajes", objTabla);
			// oView.byId("tableItems").setModel(oJsonModel)
			
			oView.byId("cantEmbalajeEntregaSinOC").setText(objTabla.length)
			this.reestruccturacionTabla(objTabla,0,"/DataEmbalajes",objectItemMoment,"/DataItems");
			// if(indiceItems.length > 0){
			// 	this.reestruccturacionTabla(objectItemMoment,1,"/DataItems");
			// }
			MessageBox.success("Eliminado Correctamente.");
		},
		fnPressAddItems  :function(){
			var oView = this.getView();
			var that=this;
			var obj;
			var items=[];
			var objmaxtable;
			var maximo = 0;
			var maxitem = 0;
			
			var table = oView.byId("tableEmbalajes");
			var index = oView.byId("tableEmbalajes").getSelectedIndex();
			var sPath="/DataEmbalajes/" + (index).toString();
			var objSelected=oView.getModel("EntregaSinOC").getProperty(sPath);
			
			if(objSelected == undefined){
				MessageBox.error("No se puede añadir items sin seleccionar un embalaje", {
					actions: ["Ok"],
					emphasizedAction: "Manage Products",
					onClose: function (sAction) {
					}
				});
			}else{
				if(oView.byId("tableItems").getBinding().getModel("/DataItems").getData().DataItems != undefined){
					items= oView.byId("tableItems").getBinding().getModel("/DataItems").getData().DataItems;
					for(var i=0,len=items.length;i<len;i++){
						if(maximo < items[i].key){
							maximo = items[i].key;
							objmaxtable = items[i];
						}
						
						if(objSelected.nEmbalaje == items[i].nEmbalaje){
							if(maxitem < items[i].itemkey){
								maxitem = items[i].itemkey;
							}
						}
					}
				}
					
				obj={
					"key":maximo+1,
					"nEmbalaje":objSelected.nEmbalaje,
					"keyEmbalaje":objSelected.key,
					"selectedKey":"",
					"itemkey":maxitem+1,
					"descripcionMaterial": "",
					"cantidad": "",
					"unmMaterial": "",
					"descunmMaterial": "",
					"obsMaterial": ""
				}
				
				items.push(obj);
				oView.getModel("EntregaSinOC").setProperty("/DataItems", items);
			}
		},
		fnSelectionItems:function(oEvent){
			var oView = this.getView();
			var table = oView.byId("tableItems");
			var context = oEvent.getParameter("rowContext");
			
			if(context != null){
				var path = context.sPath;
				var Object = this.getView().getModel("ItemsSinOC").getProperty(path);
			}
			
			var oIndex = oEvent.getParameter('rowIndex');
			var Selecciones =table.getSelectedIndices();
			var selectedEntriesProvi = [];
			var selectedEntries=[];
			
			if(Selecciones.length>1){
				table.removeSelectionInterval(oIndex,oIndex);
			}
		},
		fnPressDeleteItems:function(){
			var that = this;
			var oView=this.getView();
			var tablaItems=oView.byId("tableItems");
			var index=tablaItems.getSelectedIndex();
			if(index != -1){
				MessageBox.confirm("¿Seguro que desea eliminar? \n Se actualizaran los items", {
					actions: ["Confirmar", "Cancelar"],
					emphasizedAction: "Manage Products",
					onClose: function (sAction) {
						if(sAction=="Confirmar"){
							that.fnDeleteItems();
						} 
					}
				});
			}else{
				utilUI.onMessageErrorDialogPress2("No se ha seleccionado ningun item");
			}
		},
		fnDeleteItems:function(){
			var that = this;
			var oView=this.getView();
			
			var table = oView.byId("tableItems");
			var index = oView.byId("tableItems").getSelectedIndex();
			var sPath="/DataItems/" + (index).toString();
			var objTabla=oView.getModel("EntregaSinOC").getProperty("/DataItems");
			var objSelected=oView.getModel("EntregaSinOC").getProperty(sPath);
			
			var arrmoment=[];
			
			for(var i=0;i<objTabla.length;i++){
				var indice = objTabla.indexOf( objSelected );
				if(indice != -1)
				objTabla.splice( indice, 1 );
			}
			
			var oJsonModel = new JSONModel([]);
			table.removeSelectionInterval(index,index);
			
			oView.getModel("EntregaSinOC").setProperty("/DataItems", objTabla);
			// oView.byId("tableItems").setModel(oJsonModel)
			this.reestruccturacionTabla(objTabla,1,"/DataItems");
			
			MessageBox.success("Eliminado Correctamente.");
		},
		reestruccturacionTabla:function(obj,event,parameter,objItems,parameterItems){
			var that = this;
			var oView=this.getView();
			var index = oView.byId("tableEmbalajes").getSelectedIndex();
			var sPath="/DataEmbalajes/" + (index).toString();
			var objSelected=oView.getModel("EntregaSinOC").getProperty(sPath);
			
			if(event == 0){
				
				var countEmb=0;  
				for(var i=0;i<obj.length;i++){
					obj[i].nEmbalaje = countEmb+1;
					countEmb++;
				}
				var countItem=0
				if(objItems.length>0){
					for(var i=0;i<obj.length;i++){
						for(var j=0;j<objItems.length;j++){
							if(obj[i].key == objItems[j].keyEmbalaje){
								objItems[j].nEmbalaje = obj[i].nEmbalaje;
							}
						}
					}
					oView.getModel("EntregaSinOC").setProperty(parameterItems, objItems);
				}
				
				oView.getModel("EntregaSinOC").setProperty(parameter, obj);
			}else{
				var countEmb=0; 
				for(var i=0;i<obj.length;i++){
					if(obj[i].nEmbalaje == objSelected.nEmbalaje){
						obj[i].itemkey = countEmb+1;
						countEmb++;
					}
				}
				oView.getModel("EntregaSinOC").setProperty(parameter, obj);
			}
			
		},
		fnSelectedTipoBultoEntregaOC:function(oEvent){
			that=this;
			oView=this.getView();
			var tipoemb=oEvent.getSource().getSelectedItem().getBindingContext("Proyect").getObject();
			var cell=oEvent.getSource().getParent().getBindingContext("EntregaSinOC").getObject();
			// cell.unmMaterial = unm.Msehi;
			var arr=oView.getModel("EntregaSinOC").getProperty("/DataEmbalajes");
			for(var i=0;i<arr.length;i++){
				if(cell.key == arr[i].key){
					arr[i].tipoEmbalaje = tipoemb.Vegr2;
					arr[i].desctipoEmbalaje = tipoemb.Bezei;
				}
			}
			oView.getModel("EntregaSinOC").setProperty("/DataEmbalajes", arr);
		},
		fnSelectedUnmMaterial:function(oEvent){
			that=this;
			oView=this.getView();
			if(oEvent.getSource().getSelectedItem() != null){
				var unm=oEvent.getSource().getSelectedItem().getBindingContext("EntregaSinOC").getObject();
				var cell=oEvent.getSource().getParent().getBindingContext("EntregaSinOC").getObject();
				// cell.unmMaterial = unm.Msehi;
				var arr=oView.getModel("EntregaSinOC").getProperty("/DataItems");
				for(var i=0;i<arr.length;i++){
					if(cell.key == arr[i].key){
						arr[i].unmMaterial = unm.Msehi;
						arr[i].descunmMaterial = unm.Msehl;                   
					}
				}
				oView.getModel("EntregaSinOC").setProperty("/DataItems", arr);
				oEvent.getSource().setValue(unm.Msehi);
			}
			
			
		},
		fnPressGuardarOC:function(){
			that = this;
			oView = this.getView();
			sap.m.MessageBox.confirm("¿Desea guardar los cambios?", {
				title: "Mensaje",
				actions: ["Confirmar","Cancelar"],
				onClose: function (sActionClicked) {
					if(sActionClicked == "Confirmar"){
						that.fnGuardarOC();
					}
				}
			});
		},
		fnGuardarOC:function(){
			that = this;
			oView = this.getView();
			var prooveedores=oView.getModel("Proyect").getProperty("/Proveedor")[0];
			
			var condEnt=oView.byId("selectTipoCondEntregaOC").getSelectedItem().getBindingContext("EntregaSinOC").getObject();
			var booleancondEnt = this.validateSelected("selectTipoCondEntregaOC", condEnt.CodigoCondicion, condEnt.DescripcionCondicion,"Condición Entrega");
			if(booleancondEnt){return;}
			
			var destino=oView.byId("selectDestinoOC").getSelectedItem().getBindingContext("EntregaSinOC").getObject();
			var booleandestino = this.validateSelected("selectDestinoOC", destino.Lgort, destino.Namel,"Destino");
			if(booleandestino){return;}
			
			var areaResp=oView.byId("areaResp").getValue();
			var booleanAreaResp = this.validateInputs("areaResp",areaResp,"Area Responsable");
			if(booleanAreaResp){return;}
			
			var motivos=oView.byId("selectMotivos").getSelectedItem().getBindingContext("EntregaSinOC").getObject();
			var booleanMotivos= this.validateSelected("selectMotivos", motivos.Motivo, motivos.DescMotivo,"Motivo");
			if(booleanMotivos){return;}
			
			var otros="";
			if(motivos.Motivo == "X03"){
				otros=oView.byId("otrosid").getValue();
				var booleanOtros = this.validateInputs("otrosid",otros,"Descripción Otros");
				if(booleanOtros){return;}
			}
			
			var email=oView.byId("emailIdDestFin").getValue();
			var booleanEmail = this.validateInputs("emailIdDestFin",email,"Email Destinatario Final");
			if(booleanEmail){return;}
			
			var embalajes=oView.byId("tableEmbalajes").getBinding().getModel("/DataEmbalajes").getData().DataEmbalajes;
			if(embalajes.length==0){
				utilUI.onMessageErrorDialogPress2("No se ha generado ningun embalaje");
				return;
			}
			for(var i = 0;i<embalajes.length ; i++){
				var data = embalajes[i];
				
				var tipoEmbalaje = data.tipoEmbalaje;
				if(tipoEmbalaje == "" || tipoEmbalaje == "0"){
					utilUI.onMessageErrorDialogPress2("Tabla: Embalajes \n Campo no Seleccionado: Embalaje N°"+ data.nEmbalaje +"\n Campo Tipo de Embalaje");
					return;
				}
				
				var descripcionContenido = data.descripcionContenido;
				if(descripcionContenido == ""){
					utilUI.onMessageErrorDialogPress2("Tabla: Embalajes \n Campo vacio: Embalaje N°"+ data.nEmbalaje +"\n Campo Descripcion del Contenido");
					return;
				}
				
				var peso = data.peso;
				if(peso == ""){
					utilUI.onMessageErrorDialogPress2("Tabla: Embalajes \n Campo vacio: Embalaje N°"+ data.nEmbalaje +"\n Campo Peso(Kg)");
					return;
				}
				
				var longitud = data.longitud;
				if(longitud == ""){
					utilUI.onMessageErrorDialogPress2("Tabla: Embalajes \n Campo vacio: Embalaje N°"+ data.nEmbalaje +"\n Campo Longuitud(Cm)");
					return;
				}
				
				var ancho = data.ancho;
				if(ancho == ""){
					utilUI.onMessageErrorDialogPress2("Tabla: Embalajes \n Campo vacio: Embalaje N°"+ data.ancho +"\n Campo Ancho(Cm)");
					return;
				}
				
				var altura = data.altura;
				if(altura == ""){
					utilUI.onMessageErrorDialogPress2("Tabla: Embalajes \n Campo vacio: Embalaje N°"+ data.altura +"\n Campo Altura(Cm)");
					return;
				}
				
			}
			
	
			var items=oView.byId("tableItems").getBinding().getModel("/DataItems").getData().DataItems;
			if(items.length==0 ){
				utilUI.onMessageErrorDialogPress2("No se ha generado ningun item");
				return;
			}
			for(var j = 0;j<items.length ; j++){
				var data = items[j];
				
				var descripcionMaterial=data.descripcionMaterial;
				if(descripcionMaterial == ""){
					utilUI.onMessageErrorDialogPress2("Tabla: Items \n Campo vacio: Embalaje N°"+ data.nEmbalaje +", Item "+data.itemkey+" \n Campo Descripcion del Material");
					return;
				}
				
				var cantidad=data.cantidad;
				if(descripcionMaterial == ""){
					utilUI.onMessageErrorDialogPress2("Tabla: Items \n Campo vacio: Embalaje N°"+ data.nEmbalaje +", Item "+data.itemkey+" \n Campo Cantidad");
					return;
				}
				
				var unmMaterial=data.unmMaterial;
				if(unmMaterial == ""){
					utilUI.onMessageErrorDialogPress2("Tabla: Items \n Campo no Seleccionado: Embalaje N°"+ data.nEmbalaje +", Item "+data.itemkey+" \n Campo UNM Material");
					return;
				}
				
				// var obsMaterial=data.obsMaterial;
				// if(obsMaterial == ""){
				// 	utilUI.onMessageErrorDialogPress2("Tabla: Items \n Campo no Seleccionado: Embalaje N°"+ data.nEmbalaje +", Item "+data.itemkey+" \n Campo Observación Material");
				// 	return;
				// }
			}
			
			for(var i = 0;i<embalajes.length ; i++){
				var booleanCorrelativo=true;
				var dataEmbalajes = embalajes[i];
				for(var j = 0;j<items.length ; j++){
					var dataItems = items[j];
					if(dataEmbalajes.nEmbalaje == dataItems.nEmbalaje){
						booleanCorrelativo = false;
					}
				}
				
				if(booleanCorrelativo){
					utilUI.onMessageErrorDialogPress2("No se genero ningun item para el embalaje N°" + dataEmbalajes.nEmbalaje);
					return;
				}
			}
			
			var estatus=oView.getModel("EntregaSinOC").getProperty("/DataEstatus");            ;
			
			//Estructura Cabecera
			var sum=0;
			embalajes.forEach(function(x){
				if(x.peso != "")
				sum += parseFloat(x.peso)
			});
			var objCabecera={
				"PROOVEDOR":prooveedores.Lifnr, 
				"NOMBRE_PROVEEDOR": prooveedores.Name, 
				"SOCIEDAD": condEnt.Sociedad, 
				"NOMBRE_SOCIEDAD": condEnt.DescripcionSociedad, 
				"CENTRO": condEnt.Centro, 
				"NOMBRE_CENTRO": condEnt.NombreCentro, 
				"ALMACEN": destino.Lgort, 
				"NOMBRE_ALMACEN": destino.Namel, 
				"CANTIDAD_EMBALAJE": embalajes.length.toString(), // Sumatoria cant del form
				"PESO_TOTAL_EMBALAJE": sum.toFixed(2), // Sumatoria peso del form
				"AREA_RESPONSABLE": areaResp,
				"MOTIVOS": motivos.Motivo,
				"MOTIVOS_OTROS": otros,
				"DESCRIPCION_MOTIVOS": motivos.DescMotivo,
				"EMAIL_DESTINATARIO_FINAL": email,
				"NUMERO_GUIA": "", // Manda Vacio
				"ESTATUS_USUARIO": estatus[0].Cod,
				"DESCRIPCION_ESTATUS_USUARIO": estatus[0].Descrip,
				"USUARIO_CREADOR": oView.getModel("Proyect").getProperty("/UserSession"),
				"USUARIO_MODIFICADOR": oView.getModel("Proyect").getProperty("/UserSession")
			}
			
			//Estructura detalles
			var objDetalle=[];
			for(var i = 0;i<embalajes.length ; i++){
				var obj={};
				var dataEmbalajes = embalajes[i];
				for(var j = 0;j<items.length ; j++){
					var dataItems = items[j];
					if(dataEmbalajes.nEmbalaje == dataItems.nEmbalaje){
						obj={
							"ENTREGA":"",
							"NUMERO_EMBALAJE":dataEmbalajes.nEmbalaje.toString(),
							"TIPO_EMBALAJE":dataEmbalajes.tipoEmbalaje,
							"DESCRIPCION_TIPO_EMBALAJE":dataEmbalajes.desctipoEmbalaje,
							"DESCRIPCION_CONTENIDO":dataEmbalajes.descripcionContenido,
							"PESO":parseFloat(dataEmbalajes.peso).toFixed(2),
							"LARGO":parseFloat(dataEmbalajes.longitud).toFixed(2),
							"ANCHO":parseFloat(dataEmbalajes.ancho).toFixed(2),
							"ALTURA":parseFloat(dataEmbalajes.altura).toFixed(2),
							"ITEM":dataItems.itemkey.toString(),
							"DESCRIPCION_MATERIAL":dataItems.descripcionMaterial,
							"CANTIDAD":parseFloat(dataItems.cantidad).toFixed(2),
							"UNIDAD":dataItems.unmMaterial,
							"DESCRIPCION_UNIDAD":dataItems.descunmMaterial,
							"OBSERVACION_MATERIAL":dataItems.obsMaterial,
							"USUARIO_CREADOR": oView.getModel("Proyect").getProperty("/UserSession"),
							"USUARIO_MODIFICADOR": oView.getModel("Proyect").getProperty("/UserSession")
						}
						objDetalle.push(obj);
					}
				}
			}
			
			var total={
				"objCabecera": objCabecera,
				"objDetalle": objDetalle	
			}
			
			var obj = {
				"oResults" : total
			}
			
			that.RegistrarEntregaSinOC(obj)
		},
		RegistrarEntregaSinOC: function(obj){
				sap.ui.core.BusyIndicator.show(0);
				var self = this;
				var oResults = obj;
				Services.RegistrarEntregaSinOC(self, oResults, function (result) {
					util.response.validateFunctionEndButton(result, {
						success: function (data, message) {
							self.fnLimpiar();
							self.fnLimpiarValueStates();
							sap.ui.core.BusyIndicator.hide(0);
							self.getOwnerComponent().getRouter().navTo("Page1");
						},
						error: function (message) {
							sap.ui.core.BusyIndicator.hide(0);
						}
					});
				});
		},
		fnCancelarOC:function(){
			var that = this;
			var oView=this.getView();
			
			var condEnt=oView.byId("selectTipoCondEntregaOC").getSelectedItem().getBindingContext("EntregaSinOC").getObject();
			if(condEnt.CodigoCondicion != ""){that.validateCancelar();return;}
			
			var areaResp=oView.byId("areaResp").getValue();
			if(areaResp != "" ){that.validateCancelar();return;}
			
			var motivos=oView.byId("selectMotivos").getSelectedItem().getBindingContext("EntregaSinOC").getObject();
			if(motivos.Motivo != ""){that.validateCancelar();return;}
			
			var otros="";
			if(motivos.Motivo == "X03"){
				otros=oView.byId("otrosid").getValue();
				if(otros != ""){that.validateCancelar();}
			}
			
			var email=oView.byId("emailIdDestFin").getValue();
			if(email != ""){that.validateCancelar();return;}
			
			var embalajes=oView.byId("tableEmbalajes").getBinding().getModel("/DataEmbalajes").getData().DataEmbalajes;
			if(embalajes.length!=0){that.validateCancelar();return;}
			
			var items=oView.byId("tableItems").getBinding().getModel("/DataItems").getData().DataItems;
			if(items.length!=0 ){that.validateCancelar();return;}
			
			
			MessageBox.warning("¿Seguro Desea Cancelar?.", {
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.OK,
				onClose: function (sAction) {
					if(sAction=="OK"){
						that.fnLimpiar();
						that.fnLimpiarValueStates();
						that.getOwnerComponent().getRouter().navTo("Page1");
					}
				}
			});
		},
		validateCancelar:function(){
			var that = this;
			var oView=this.getView();
			MessageBox.warning("Hay data Registrada ¿Seguro Desea Cancelar?.", {
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.OK,
				onClose: function (sAction) {
					if(sAction=="OK"){
						that.fnLimpiar();
						that.fnLimpiarValueStates();
						that.getOwnerComponent().getRouter().navTo("Page1");
					}
				}
			});
		},
		fnLimpiar:function(){
			var that = this;
			var oView=this.getView();
			
			var tableEmbalajes = oView.byId("tableEmbalajes");
			var oIndexEmb=tableEmbalajes.getSelectedIndex();
			tableEmbalajes.removeSelectionInterval(oIndexEmb,oIndexEmb);
			
			var tableItems = oView.byId("tableItems");
			var oIndexItems = tableItems.getSelectedIndex();
			tableItems.removeSelectionInterval(oIndexItems,oIndexItems);
			
			oView.byId("selectTipoCondEntregaOC").setSelectedKey("");
			oView.byId("areaResp").setValue("");
			oView.byId("cantEmbalajeEntregaSinOC").setText(0);
			oView.byId("selectMotivos").setSelectedKey("");
			oView.byId("otrosid").setValue("");
			oView.byId("emailIdDestFin").setValue("");
			oView.getModel("EntregaSinOC").setProperty("/DataDestino" , []);
			oView.getModel("EntregaSinOC").setProperty("/DataEmbalajes", []);
			oView.getModel("EntregaSinOC").setProperty("/DataItems", []);
		},
		fnLimpiarValueStates:function(){
			var that = this;
			var oView=this.getView();
			
			oView.byId("selectTipoCondEntregaOC").setValueState("None");
			oView.byId("selectDestinoOC").setValueState("None");
			oView.byId("areaResp").setValueState("None");
			oView.byId("selectMotivos").setValueState("None");
			oView.byId("otrosid").setValueState("None");
			oView.byId("emailIdDestFin").setValueState("None");
		}
	});
}, /* bExport= */ true);