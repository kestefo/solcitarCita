sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	'../util/util',
	'../util/utilUI',
	"sap/ui/core/routing/History", 
	"sap/ui/model/json/JSONModel", 
	"sap/ui/commons/MessageBox",
	"../services/Services",
	"../estructuras/Estructura",
	"./utilities",
	"sap/m/MessageBox",
	],
	function (Controller,UIComponent,util, utilUI, t, n, r, Services, Estructura, utilities, MessageBox) {
		"use strict";
		return Controller.extend("com.PagoHandling.controller.BaseController", {
			getDataGlobalEntregaSinOC:function(){
				var that = this;
				var oView = this.getView();
				that.consultarUsuario();
			},
			consultarUsuario: function(){
				var that = this;
				var oView = this.getView();
				Services.ConsultarUsuario(self, function (result) {
					util.response.validateAjaxGet(result, {
						success: function (oData, message) {
							utilities.setRuc("20106740004");
							oView.getModel("Proyect").setProperty("/UserSession" , oData.data.firstName);
							that.consultarProveedores();
						},
						error: function (message) {
							// Utilities.setRuc("20106740004");
							// oView.getModel("Proyect").setProperty("/UserSession" , "Prueba");
							// that.consultarProveedores();
							sap.ui.core.BusyIndicator.hide(0);
						}
					});
				});
			},
			consultarProveedores:function(){
				var that = this;
				var oView = this.getView();
				var ruc=utilities.getRuc();
				var url = "/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_REGISTRO_ENTRE_SRV/ZET_PROVEEDORESSet?$filter=Stcd1 eq '" + ruc + "'";
				
				Services.ConsultarProveedores(self, url , function (result) {
					util.response.validateAjaxGet(result, {
						success: function (oData, message) {
							if (oData.data.length === 0) {
								MessageBox.error("No hay data consultar metodo "+oData.u);
								oView.getModel("Proyect").setProperty("/Proveedor" , []);
							} else {
								var data=oData.data;
								oView.getModel("Proyect").setProperty("/Proveedor" , data);
							}
							that.getAlmacen();
						},
						error: function (message) {
							sap.ui.core.BusyIndicator.hide(0);
						}
					});
				});
			},
			getAlmacen:function(){
				var that = this;
				var oView = this.getView();
				var ModeloProyect = oView.getModel("EntregaSinOC");
				Services.AlmacenCentro(self, function (result) {
					util.response.validateAjaxGet(result, {
						success: function (oData, message) {
							if (oData.data.length === 0) {
								MessageBox.error("No hay data consultar metodo "+oData.u);
								ModeloProyect.setProperty("/DataItemsSinOCCondEnt" ,[]);
							} else {
								var data = [];
								var OdataArray=oData.data;
								var cantidad= OdataArray.length;
								
								while (cantidad !== 0) {
									var data1 = OdataArray[0];
									var arrayCoincidencias = [];
									var a = 1;
									for (a = 1; a < OdataArray.length; a++) {
										if (data1.CodCond === OdataArray[a].CodCond) {
											arrayCoincidencias.push(OdataArray[a]);
											cantidad--;
											OdataArray.splice(a, 1);
											a--;
										}
									}
									arrayCoincidencias.push(OdataArray[0]);
									OdataArray.splice(0, 1);
									
									cantidad--;
					
									var CodigoCondicion = arrayCoincidencias[0].CodCond;
									var DescripcionCondicion = arrayCoincidencias[0].DescCond;
									var Sociedad = arrayCoincidencias[0].Bukrs;
									var DescripcionSociedad = arrayCoincidencias[0].Butxt;
									var Centro = arrayCoincidencias[0].Werks;
									var NombreCentro = arrayCoincidencias[0].Namew;
									
									var DataCondEnt = {
										CodigoCondicion: CodigoCondicion,
										DescripcionCondicion:DescripcionCondicion,
										Sociedad:Sociedad,
										DescripcionSociedad:DescripcionSociedad,
										Centro:Centro,
										NombreCentro: NombreCentro,
										ArrayGeneral: arrayCoincidencias
									};
					
									data.push(DataCondEnt);
								}
								
								var obj = {
									CodigoCondicion: "",
									DescripcionCondicion:"Seleccionar"
								};
								
								data.unshift(obj)
								ModeloProyect.setProperty("/DataItemsSinOCCondEnt" ,data);
								
							}
							that.getUnidadesMedida();        
						},
						error: function (message) {
							sap.ui.core.BusyIndicator.hide(0);
						}
					});
				});
			},
			getUnidadesMedida:function(){
				var that = this;
				var oView = this.getView();
				var ModeloProyect = oView.getModel("EntregaSinOC");
				Services.UnidedesMedida(self, function (result) {
					util.response.validateAjaxGet(result, {
						success: function (oData, message) {
							if (oData.data.length === 0) {
								MessageBox.error("No hay data consultar metodo "+oData.u);
								ModeloProyect.setProperty("/DataUnmMed" ,[]);
							} else {
								var data = [];
								var data=oData.data;
								
								var obj = {
									Msehi: "",
									Msehl:"Seleccionar"
								};
								
								data.unshift(obj)
								ModeloProyect.setProperty("/DataUnmMed" ,data);
							}
							that.getMotivo();
						},
						error: function (message) {
							sap.ui.core.BusyIndicator.hide(0);
						}
					});
				});
			},
			getMotivo:function(){
				var that = this;
				var oView = this.getView();
				var ModeloProyect = oView.getModel("EntregaSinOC");
				Services.Motivos(self, function (result) {
					util.response.validateAjaxGet(result, {
						success: function (oData, message) {
							if (oData.data.length === 0) {
								MessageBox.error("No hay data consultar metodo "+oData.u);
								ModeloProyect.setProperty("/DataMotivos" ,[]);
							} else {
								var data = [];
								var data=oData.data;
								
								var obj = {
									Motivo: "",
									DescMotivo:"Seleccionar"
								};
								
								data.unshift(obj)
								
								ModeloProyect.setProperty("/DataMotivos" ,data);
							}
							that.consultarTipoEmbalaje();
						},
						error: function (message) {
							sap.ui.core.BusyIndicator.hide(0);
						}
					});
				});
			},
			consultarTipoEmbalaje: function(){
				var that=this;
				var oView = this.getView();
				var ModeloProyect = oView.getModel("Proyect");
				
				Services.TipoEmbalajes(self, function (result) {
					util.response.validateAjaxGet(result, {
						success: function (oData, message) {
							if (oData.data.length === 0) {
								MessageBox.error("No hay data consultar metodo "+oData.u);
								ModeloProyect.setProperty("/DataTipoBulto" ,[]);
							} else {
								var data =oData.data;
								data.unshift({Bezei : "--Seleccionar--" , Vegr2 : ""});
								
								ModeloProyect.setProperty("/DataTipoBulto" ,data);
							}
							
							that.getEstatus();
						},
						error: function (message) {
							sap.ui.core.BusyIndicator.hide(0);
						}
					});
				});
			},
			getEstatus:function(){
				var that = this;
				var oView = this.getView();
				var ModeloProyect = oView.getModel("EntregaSinOC");
				Services.Estatus(self, function (result) {
					util.response.validateAjaxGet(result, {
						success: function (oData, message) {
							if (oData.data.length === 0) {
								MessageBox.error("No hay data consultar metodo "+oData.u);
								ModeloProyect.setProperty("/DataEstatus" ,[]);
							} else {
								var data = [];
								var data=oData.data;
								
								ModeloProyect.setProperty("/DataEstatus" ,data);
							}
							
							sap.ui.core.BusyIndicator.hide(0);
						},
						error: function (message) {
							sap.ui.core.BusyIndicator.hide(0);
						}
					});
				});
			},
			
			validateSelected:function(id,codigo, descripcion, parameter){
				if(	this.getView().byId(id).getValueState() == "None"){
					if(codigo == "" || codigo == undefined){
						utilUI.onMessageErrorDialogPress2("Campo no seleccionado  "+ parameter);
						// this.getView().byId(id).setValueState("Error");
						// this.getView().byId(id).setValueStateText("Cambiar Campo");
						return true;
					}else{
						// this.getView().byId(id).setValueState("Success");
						return false;
					}
				}else if(this.getView().byId(id).getValueState() == "Error"){
					utilUI.onMessageErrorDialogPress2("Campo no seleccionado "+ parameter);
					// this.getView().byId(id).setValueState("Error");
					return true;
				}else if(this.getView().byId(id).getValueState() == "Success"){
					return false;
				}
			},
			fnChangeInputsNotSelected:function(oEvent){
				var value=oEvent.getSource().getSelectedItem().getKey();
				if(value == "" || value == undefined){
					// oEvent.getSource().setValueState("None");
				}else{
					// oEvent.getSource().setValueState("Success");
				}
			},
			validateInputs:function(id,value, parameter){
				if(	this.getView().byId(id).getValueState() == "None"){
					
					if(value == "" || value == undefined){
						utilUI.onMessageErrorDialogPress2("Campo vacio "+ parameter);
						this.getView().byId(id).setValueState("Error");
						this.getView().byId(id).setValueStateText("Campo Vacio");
						return true;
					}else{
						this.getView().byId(id).setValueState("Success");
						return false;
					}
					
				}else if(this.getView().byId(id).getValueState() == "Error"){
					utilUI.onMessageErrorDialogPress2("Campo incorrecto "+ parameter);
					this.getView().byId(id).setValueState("Error");
					return true;
				}else if(this.getView().byId(id).getValueState() == "Success"){
					return false;
				}
			},
			fnChangeInputsNotEmpty:function(oEvent){
				var value=oEvent.getSource().getValue();
				if(value == "" || value == undefined){
					oEvent.getSource().setValueState("Error");
					// oEvent.getSource().setValueStateText("Campo Vacio");
				}else{
					oEvent.getSource().setValueState("Success");
				}
			},
			fnChangeInputsNotEmptyEmail:function(oEvent){
				
				const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
				var value=oEvent.getSource().getValue();
				
				re.test(value.toLowerCase());
				
				if(value == "" || value == undefined){
					oEvent.getSource().setValueState("Error");
					oEvent.getSource().setValueStateText("Campo Vacio");
				}else{
					if (!re.test(value.toLowerCase())) {
						oEvent.getSource().setValueState("Error");
						oEvent.getSource().setValueStateText("Correo Electronico Invalido");
					}else{
						oEvent.getSource().setValueState("Success");
					}
				}
			},
			
			getDialogBlock: function (e) {
				var t = new sap.m.Dialog({
					title: "Información",
					type: "Message",
					afterOpen: function () {
						jQuery(".SuperApp").remove()
					},
					content: new sap.m.Text({
						text: e
					}),
					beginButton: new sap.m.Button({
						text: "OK"
					})
				});
				t.open();
				jQuery("#" + t.getId()).keydown(function (e) {
					e.preventDefault();
					return false
				})
			},
			getRouter: function () {
				return this.getOwnerComponent().getRouter()
			},
			getModel: function (e) {
				return this.getView().getModel(e)
			},
			setModel: function (e, t) {
				return this.getView().setModel(e, t)
			},
			getResourceBundle: function () {
				return this.getOwnerComponent().getModel("i18n").getResourceBundle()
			},
			loadVariable: function (e) {
				var t = this.getModel("midata");
				return t.getProperty(e)
			},
			saveVariable: function (e, t) {
				var n = this.getModel("midata");
				n.setProperty(e, t)
			},
			loadConstante: function (e) {
				var t = this.getModel("i18n");
				return t.getProperty(e)
			},
			getYYYYMMDD: function (e) {
				var t = e.getDate();
				var n = e.getMonth() + 1;
				var r = e.getFullYear();
				if (t < 10) {
					t = "0" + t
				}
				if (n < 10) {
					n = "0" + n
				}
				var o = r + "-" + n + "-" + t;
				return o
			},
			getYYYYMMDDHHMMSS: function (e) {
				var t = e.getDate();
				var n = e.getMonth() + 1;
				var r = e.getFullYear();
				if (t < 10) {
					t = "0" + t
				}
				if (n < 10) {
					n = "0" + n
				}
				var o = r + "-" + n + "-" + t;
				var i = e.getHours();
				var u = e.getMinutes();
				var a = e.getSeconds();
				o = o + " " + this.getStrZero(i, 2) + ":" + this.getStrZero(u, 2) + ":" + this.getStrZero(a, 2);
				return o
			},
			getFechaNotNull: function (e) {
				var t = e;
				if (e === "" || e === undefined || e === null) {
					t = undefined
				}
				return t
			}
		})
	});