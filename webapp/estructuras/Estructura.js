jQuery.sap.require("sap.ui.core.format.DateFormat");
sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"../util/utilController"
], function (JSONModel, controller) {
	"use strict";

	return {
		maestro: {
			mapVGenericaCampoComboBox: function (self, datos, oFiltro) {
				var servDatos = datos;
				self.getView().getModel("maestroModel").setData({});
				var via = self.getView().getModel("localModel").getProperty("/Detail/Via");
				controller.setFilterArray(self, servDatos, "CodigoTabla", oFiltro, function (modData, nameTable) {
					modData.forEach(function (item) {
						if (nameTable == "T_TERMINALES" ||
							nameTable == "T_TIPO_ALMACEN" ||
							nameTable == "T_TIPO_CARGA" ||
							nameTable == "T_TIPO_CONDICION") {
							item.Codigo = item.Campo;
							item.Descripcion = item.DescripcionCampo;
						} else if (nameTable == "T_MOD_RECEP") {
							if (item.Campo) {
								if (item.Campo.includes("XNAX")) {
									item.Campo = null;
								}
							}
							item.Codigo = item.Campo;
							item.Descripcion = item.DescripcionCampo;
						} else if (nameTable == "T_REGIMENES") {
							if (item.PadreDescripcion == "01") { //Regimenes para Importacion
								item.Codigo = item.Id;
								item.Descripcion = item.DescripcionCampo;
							}
						} else if (nameTable == "T_TIPO_DOC_ADJUNTO") {
							item.Codigo = item.Id + "," + item.CodigoSap;
							item.Descripcion = item.DescripcionCampo;
						} else if (nameTable == "T_CON_CONTENEDOR") {
							item.Codigo = item.Id;
							item.Descripcion = item.DescripcionCampo;
						} else if (nameTable == "T_IDENT_DOC_TRANS" ||
							nameTable == "T_TIPO_DOC_TRANSPORTE" ||
							nameTable == "T_ENTIDAD_REG_MERC" ||
							nameTable == "T_CODIGOS_UN" ||
							nameTable == "T_TIPO_BULTOS" ||
							nameTable == "T_PAISES" ||
							nameTable == "T_TIPO_PAGO" ||
							nameTable == "T_TIPO_FLETE" ||
							nameTable == "T_MONEDA_FLETE" ||
							nameTable == "T_DESTINACION_CARGA") {
							item.Codigo = item.Campo;
							item.Descripcion = item.DescripcionCampo;
						} else if (nameTable == "T_AEROPUERTOS") {
							if (item.PadreDescripcion == via) {
								item.Codigo = item.Campo;
								item.Descripcion = item.Campo;
							}
						} else if (nameTable == "T_TIPO_DOCUMENTO") {
							item.Codigo = item.CodigoSap;
							item.Descripcion = item.DescripcionCampo;
						} else if (nameTable == "T_RECEPTOR_CARGA") {
							item.Codigo = item.Campo;
							item.Descripcion = item.DescripcionCampo;
						} else {
							if (item.PadreDescripcion == via) {
								item.Codigo = item.Campo;
								item.Descripcion = item.DescripcionCampo;
							}
						}
					});
					modData = modData.filter(function (el) {
						return el.Codigo && el.Codigo!="";
					});
					self.getView().getModel("maestroModel").setProperty("/" + nameTable, modData);
				});
			},
			/*mapVGenericaCampoComboBox: function (self, datos) {
				var servDatos = datos;
				var via = self.getView().getModel("localModel").getProperty("/Detail/Via");
				self.getView().getModel("maestroModel").setData({});
				servDatos.forEach(function (item) {
					if (servDatos[i].CodigoTabla == "T_TERMINALES" ||
						servDatos[i].CodigoTabla == "T_TIPO_ALMACEN" ||
						servDatos[i].CodigoTabla == "T_TIPO_CARGA" ||
						servDatos[i].CodigoTabla == "T_TIPO_CONDICION") {
						controller.setComboGeneral(self, "maestroModel", servDatos[i].CodigoTabla, servDatos[i].Campo, servDatos[i].DescripcionCampo,
							servDatos[i]);
					} else if (servDatos[i].CodigoTabla == "T_MOD_RECEP") {
						if (servDatos[i].Campo) {
							if (servDatos[i].Campo.includes("XNAX")) {
								servDatos[i].Campo = null;
							}
						}
						controller.setComboGeneral(self, "maestroModel", servDatos[i].CodigoTabla, servDatos[i].Campo, servDatos[i].DescripcionCampo,
							servDatos[i]);
					} else if (servDatos[i].CodigoTabla == "T_REGIMENES") {
						if (servDatos[i].PadreDescripcion == "01") { //Regimenes para Importacion
							controller.setComboGeneral(self, "maestroModel", servDatos[i].CodigoTabla, servDatos[i].Id, servDatos[i].DescripcionCampo,
								servDatos[i]);
						}
					} else if (servDatos[i].CodigoTabla == "T_TIPO_DOC_ADJUNTO") {
						controller.setComboGeneral(self, "maestroModel", servDatos[i].CodigoTabla, servDatos[i].Id + "," + servDatos[i].CodigoSap,
							servDatos[i].DescripcionCampo,
							servDatos[i]);
					} else if (servDatos[i].CodigoTabla == "T_CON_CONTENEDOR") {
						controller.setComboGeneral(self, "maestroModel", servDatos[i].CodigoTabla, servDatos[i].Id, servDatos[i].DescripcionCampo,
							servDatos[i]);
					} else if (servDatos[i].CodigoTabla == "T_IDENT_DOC_TRANS" ||
						servDatos[i].CodigoTabla == "T_TIPO_DOC_TRANSPORTE" ||
						servDatos[i].CodigoTabla == "T_ENTIDAD_REG_MERC" ||
						servDatos[i].CodigoTabla == "T_CODIGOS_UN" ||
						servDatos[i].CodigoTabla == "T_TIPO_BULTOS" ||
						servDatos[i].CodigoTabla == "T_PAISES" ||
						servDatos[i].CodigoTabla == "T_TIPO_PAGO" ||
						servDatos[i].CodigoTabla == "T_TIPO_FLETE" ||
						servDatos[i].CodigoTabla == "T_MONEDA_FLETE" ||
						servDatos[i].CodigoTabla == "T_DESTINACION_CARGA") {
						controller.setComboGeneral(self, "maestroModel", servDatos[i].CodigoTabla, servDatos[i].Campo, servDatos[i].DescripcionCampo,
							servDatos[i]);
					} else if (servDatos[i].CodigoTabla == "T_AEROPUERTOS") {
						if (servDatos[i].PadreDescripcion == via) {
							controller.setComboGeneral(self, "maestroModel", servDatos[i].CodigoTabla, servDatos[i].Campo, servDatos[i].Campo, servDatos[i]);
						}
					} else if (servDatos[i].CodigoTabla == "T_TIPO_DOCUMENTO") {
						controller.setComboGeneral(self, "maestroModel", servDatos[i].CodigoTabla, servDatos[i].CodigoSap, servDatos[i].DescripcionCampo,
							servDatos[i]);
					} else if (servDatos[i].CodigoTabla == "T_RECEPTOR_CARGA") {
						controller.setComboGeneral(self, "maestroModel", servDatos[i].CodigoTabla, servDatos[i].Campo, servDatos[i].DescripcionCampo,
							servDatos[i]);
					} else {
						if (servDatos[i].PadreDescripcion == via) {
							controller.setComboGeneral(self, "maestroModel", servDatos[i].CodigoTabla, servDatos[i].Campo, servDatos[i].DescripcionCampo,
								servDatos[i]);
						}
					}
				}
			},*/
			mapVGenericaCampo: function (self, datos, oFiltro) {
				var servDatos = datos;
				self.getView().getModel("maestroModelManifiesto").setData({});
				var via = self.getView().getModel("localModel").getProperty("/Detail/Via");
				controller.setFilterArray(self, servDatos, "CodigoTabla", oFiltro, function (modData, nameTable) {
					modData.forEach(function (item) {
						if (nameTable == "T_TIPO_LUGAR_DESCARGA") {
							if (item.PadreDescripcion == via) {
								item.Codigo = item.Campo;
								item.Descripcion = item.DescripcionCampo;
							}
						} else if (nameTable == "T_VIAS") {
							item.Codigo = item.Campo;
							item.Descripcion = item.DescripcionCampo;
						} else if (nameTable == "T_TERMINALES") {
							if (item.Campo == "XNAX") {
								return;
							}
							item.Codigo = item.CodigoSap;
							item.Descripcion = item.DescripcionCampo;
						} else if (nameTable == "T_AEROPUERTOS") {
							item.Codigo = item.Campo;
							item.Descripcion = item.Campo;
						} else {
							item.Codigo = item.Campo;
							item.Descripcion = item.DescripcionCampo;
						}
					});
					modData = modData.filter(function (el) {
						return el.Codigo && el.Codigo!="";
					});
					self.getView().getModel("maestroModelManifiesto").setProperty("/" + nameTable, modData);
				});
			},
			/*mapVGenericaCampo: function (self, datos) {
				var servDatos = datos;
				var via = self.getView().getModel("miData").getProperty("/AddManifiesto/Via");
				self.getView().getModel("maestroModelManifiesto").setData({});
				servDatos.forEach(function (item) {
					if (servDatos[i].CodigoTabla == "T_TIPO_LUGAR_DESCARGA") {
						if (servDatos[i].PadreDescripcion == via) {
							controller.setComboGeneral(self, "maestroModelManifiesto", servDatos[i].CodigoTabla, servDatos[i].Campo, servDatos[i].DescripcionCampo,
								servDatos[i]);
						}
					} else if (servDatos[i].CodigoTabla == "T_VIAS") {
						controller.setComboGeneral(self, "maestroModelManifiesto", servDatos[i].CodigoTabla, servDatos[i].Campo, servDatos[i].DescripcionCampo,
							servDatos[i]);
					} else if (servDatos[i].CodigoTabla == "T_TERMINALES") {
						if (servDatos[i].Campo == "XNAX") {
							return;
						}
						controller.setComboGeneral(self, "maestroModelManifiesto", servDatos[i].CodigoTabla, servDatos[i].CodigoSap, servDatos[i].DescripcionCampo,
							servDatos[i]);
					} else if (servDatos[i].CodigoTabla == "T_AEROPUERTOS") {
						controller.setComboGeneral(self, "maestroModelManifiesto", servDatos[i].CodigoTabla, servDatos[i].Campo, servDatos[i].Campo,
							servDatos[i]);
					} else {
						controller.setComboGeneral(self, "maestroModelManifiesto", servDatos[i].CodigoTabla, servDatos[i].Campo, servDatos[i].DescripcionCampo,
							servDatos[i]);
					}
				}
			},*/
			mapoDataVTransportistaDetalle: function (datos) {
				var servDatos = datos;
				var arrayDatos = [];
				for (var i in servDatos) {
					var modDatos = {
						Codigo: servDatos[i].Id,
						Descripcion: servDatos[i].Matricula,
					};
					arrayDatos.push(modDatos);
				}
				return arrayDatos;
			},
			mapoDataVItinerario: function (datos) {
				var servDatos = datos;
				var arrayDatos = [];
				for (var i in servDatos) {
					var modDatos = servDatos[i];
					modDatos.Codigo = servDatos[i].Id;
					modDatos.Descripcion = servDatos[i].NroViaje; //servDatos[i].NroViaje + "-" + servDatos[i].AnioViaje;
					modDatos.CodItinerario = servDatos[i].NroViaje;
					modDatos.AnioItinerario = servDatos[i].AnioViaje;
					modDatos.CodVia = servDatos[i].CodVia;
					modDatos.TipoTransporte = servDatos[i].TipoTransporte;

					arrayDatos.push(modDatos);
				}
				return arrayDatos;
			},
			mapoDataVItinerarioDetalle: function (datos) {
				var servDatos = datos;
				var arrayDatos = [];
				for (var i in servDatos) {
					var modDatos = {
						Codigo: servDatos[i].Id,
						Descripcion: servDatos[i].Estacionamiento,
						IdItinerario: servDatos[i].IdItinerario,
						FechaHoraLlegada: servDatos[i].FechaHora,
						Estacionamiento: servDatos[i].Estacionamiento,
						IdItinerarioDetalle: servDatos[i].Id
					};
					arrayDatos.push(modDatos);
				}
				return arrayDatos;
			},
		},
		master: {
			mapoDataManifiesto: function (datos) {
				var servDatos = datos;
				var arrayDatos = [];
				for (var i in servDatos) {
					var modDatos = {
						validacionVia: servDatos[i].CodVia === "AEREO" ? false : true,
						etiquetaContenedor: servDatos[i].CodVia === "AEREO" ? "ULD" : "Contenedor",
						validacionBtnPDF: true, //servDatos[i].EstadoCodigo == "TE_MANIF_03" || servDatos[i].EstadoCodigo == "TE_MANIF_04" ? true : false,
						FechaCreacion: servDatos[i].FechaCreacion,
						Id: servDatos[i].Id,
						EstadoDescripcion: servDatos[i].EstadoDescripcion,
						EstadoCodigo: servDatos[i].EstadoCodigo,
						Via: servDatos[i].Via,
						Viaje: servDatos[i].Viaje,
						TipoManifiesto: servDatos[i].TipoManifiesto,
						NumeroManifiesto: servDatos[i].NumeroManifiesto,
						AnioManifiesto: servDatos[i].AnioManifiesto,
						FechaLlegada: servDatos[i].FechaLlegada,
						FechaTerminoDescarga: servDatos[i].FechaTerminoDescarga ? servDatos[i].FechaTerminoDescarga : null,
						FechaTerminoDescargaString: servDatos[i].FechaHoraTerminoDescargaString ? servDatos[i].FechaHoraTerminoDescargaString : null,
						CodItinerario: servDatos[i].CodItinerario,
						AnioItinerario: servDatos[i].AnioItinerario,
						IdItinerarioDetalle: servDatos[i].IdItinerarioDetalle,
						FechaHoraLlegada: servDatos[i].FechaHoraLlegada ? servDatos[i].FechaHoraLlegada : null,
						Movimiento: servDatos[i].Movimiento,
						Contenedores: servDatos[i].Contenedores ? controller.removeDuplicates(servDatos[i].Contenedores.split(",")) : [],
						DocumentosTransporte: servDatos[i].DocumentosTransporte ? controller.removeDuplicates(servDatos[i].DocumentosTransporte.split(",")) : [],
						Paquetes: servDatos[i].Paquetes ? controller.removeDuplicates(servDatos[i].Paquetes.split(",")) : [],
						Precintos: servDatos[i].Precintos ? controller.removeDuplicates(servDatos[i].Precintos.split(",")) : [],
						Adjuntos: servDatos[i].Adjuntos ? controller.removeDuplicates(servDatos[i].Adjuntos.split(",")) : [],
						Fletes: servDatos[i].Fletes ? controller.removeDuplicates(servDatos[i].Fletes.split(",")) : [],
						IdTransportista: servDatos[i].IdTransportista,
						DescripcionTransportista: servDatos[i].DescripcionTransportista,
						IdVia: servDatos[i].IdVia ? servDatos[i].IdVia : "",
						CodVia: servDatos[i].CodVia,
						DescVia: servDatos[i].DescVia,
						ClienteSap: servDatos[i].ClienteSap,
						GHA: servDatos[i].GHA,
						CodTerminal: servDatos[i].CodTerminal,
						IdTipoTransportista: servDatos[i].IdTipoTransportista,
						CodTipoTransportista: servDatos[i].CodTipoTransportista,
						DescTipoTransportista: servDatos[i].DescTipoTransportista,
						CodSapTipoTransportista: servDatos[i].CodSapTipoTransportista,
						PaisDescripcion: servDatos[i].PaisDescripcion,
						NroViaje: servDatos[i].NroViaje,
						AnioViaje: servDatos[i].AnioViaje,
						Matricula: servDatos[i].Matricula,
						ModeloTransporte: servDatos[i].ModeloTransporte,
						ModeloTransporteDescripcion: servDatos[i].ModeloTransporteDescripcion,
						TipoTransporte: servDatos[i].TipoTransporte,
						TipoTransporteDescripcion: servDatos[i].TipoTransporteDescripcion,
						MovimientoItinerario: servDatos[i].MovimientoItinerario,
						MovimientoDescripcion: servDatos[i].MovimientoDescripcion,
						MovimientoDescripcionItinerario: servDatos[i].MovimientoDescripcionItinerario,
						Origen: servDatos[i].Origen,
						OrigenDescripcion: servDatos[i].OrigenDescripcion,
						Destino: servDatos[i].Destino,
						DestinoDescripcion: servDatos[i].DestinoDescripcion,
						Dias: servDatos[i].Dias,
						Hora: servDatos[i].Hora,
						DescTipoManifiesto: servDatos[i].DescTipoManifiesto,
						Estacionamiento: servDatos[i].Estacionamiento,

						FechaInicioTarja: servDatos[i].FechaInicioTarja,
						FechaFinTarja: servDatos[i].FechaFinTarja,
						JurisdiccionAduanera: servDatos[i].JurisdiccionAduanera,
						CapitanTransporte: servDatos[i].CapitanTransporte,
						PuertoZarpe: servDatos[i].PuertoZarpe,
						TipoLugarDescarga: servDatos[i].TipoLugarDescarga,
						LugarDescarga: servDatos[i].LugarDescarga,
						JurisdiccionAduaneraDescripcion: servDatos[i].JurisdiccionAduaneraDescripcion,
						PuertoZarpeDescripcion: servDatos[i].PuertoZarpeDescripcion,
						TipoLugarDescargaDescripcion: servDatos[i].TipoLugarDescargaDescripcion,
						LugarDescargaDescripcion: servDatos[i].LugarDescargaDescripcion,
						FechaHoraLlegadaATA: servDatos[i].FechaHoraLlegadaATA ? servDatos[i].FechaHoraLlegadaATA : null,
						FechaHoraLlegadaATAString: servDatos[i].FechaHoraLlegadaATAString ? servDatos[i].FechaHoraLlegadaATAString : null,

						Matricula: servDatos[i].Matricula,
						Nacionalidad: servDatos[i].Nacionalidad,
						TipoTransporte: servDatos[i].TipoTransporte,
						ViaSunat: servDatos[i].ViaSunat,
						LugarLLegada: servDatos[i].LugarLLegada,
						FechaZarpe: servDatos[i].FechaZarpe,
						
						FechaNumeracion: servDatos[i].FechaNumeracion,

					};
					arrayDatos.push(modDatos);
				}
				return arrayDatos;
			},
			mapoDataGuia: function(self, datos){
				var servDatos = datos;
				var arrayDatos = [];
				var totalBultoManifestado = 0;
				var totalPesoManifestado = 0;
				var totalVolumenManifestado = 0;
				for (var i in servDatos) {
					var MasterDirectas = servDatos[i].EsMaster;

					if(MasterDirectas!== 2){
						totalBultoManifestado = totalBultoManifestado + parseInt(controller.leftNumberUndefined(servDatos[i].BultosManifestados));
						totalPesoManifestado = totalPesoManifestado + parseInt(controller.leftNumberUndefined(servDatos[i].PesoManifestado));
                        totalVolumenManifestado = totalVolumenManifestado + parseInt(controller.leftNumberUndefined(servDatos[i].VolumenManifestado));
					}
					var modDatos = {
						Id: servDatos[i].Id,
						EsMaster: servDatos[i].EsMaster,
						CodVolante: servDatos[i].CodVolante,
						BultosBuenEstado: servDatos[i].BultosBuenEstado,
						PesoBuenEstado: servDatos[i].PesoBuenEstado,
						BultosMalEstado: servDatos[i].BultosMalEstado,
						PesoMalEstado: servDatos[i].PesoMalEstado,
						EsMasterDescripcion: servDatos[i].EsMasterDescripcion,
						NumeroManifiesto: servDatos[i].NumeroManifiesto,
						FechaLlegada: servDatos[i].FechaHoraLlegadaATAString,
						DocumentoTransporteMadreId: servDatos[i].DocumentoTransporteMadreId,
						NotificadoCodigo: servDatos[i].NotificadoCodigo,
						NotificadoDescripcion: servDatos[i].NotificadoDescripcion,
						DocumentoTransporteMasterCodigo: servDatos[i].DocumentoTransporteMasterCodigo,
						DocumentoTransporteCodigo: servDatos[i].DocumentoTransporteCodigo,
						Descripcion: servDatos[i].Descripcion,
						BultosManifestados: servDatos[i].BultosManifestados,
						PesoManifestado: servDatos[i].PesoManifestado,
						VolumenManifestado: servDatos[i].VolumenManifestado,
						BultosRecibidos: servDatos[i].BultosRecibidos,
						PesoRecibido: servDatos[i].PesoRecibido,
						BultosFaltantes: servDatos[i].BultosFaltantes,
						PesoFaltante: servDatos[i].PesoFaltante,
						BultosSobrantes: servDatos[i].BultosSobrantes,
						PesoSobrante: servDatos[i].PesoSobrante,
						BultosMalEstado: servDatos[i].BultosMalEstado,
						PesoMalEstado: servDatos[i].PesoMalEstado,
						FechaHoraFinATAString:servDatos[i].FechaHoraFinATAString,
						usuarioPago:servDatos[i].UsuarioCreador,
						IndClienteCredito:servDatos[i].IndClienteCredito,
						PagoHandling:servDatos[i].PagoHandling,
						DescripcionPagoHandling:servDatos[i].DescripcionPagoHandling,
						IndCliente:servDatos[i].IndCliente,
						DescripcionIndCliente:servDatos[i].DescripcionIndCliente,
						FechaCreacion:servDatos[i].FechaCreacion,
						NroFactura:servDatos[i].NroFactura,
						NroOperMov:servDatos[i].NroOperMov,
						CodigoTransportista:servDatos[i].CodigoTransportista,
						CodigoYata:servDatos[i].CodigoYata,
						TotalBultos:servDatos[i].TotalBultos,
						TotalPesos:servDatos[i].TotalPesos,
						// validMostrarPDF: (parseInt(controller.leftNumberUndefined(servDatos[i].TarjaBultosMalEstado)) > 0) ? true : false,
						// Origen: servDatos[i].Origen,
						// Destino: servDatos[i].Destino,
						// OrigenDescripcion: servDatos[i].OrigenDescripcion,
						// DestinoDescripcion: servDatos[i].DestinoDescripcion,
						// PuntoLlegada: servDatos[i].PuntoLlegada,
						// PuntoLlegadaDescripcion: servDatos[i].PuntoLlegadaDescripcion,
						// TerminalOrigen: servDatos[i].TerminalOrigen,
						// TerminalOrigenDescripcion: servDatos[i].TerminalOrigenDescripcion,
						// TerminalDestino: servDatos[i].TerminalDestino,
						// TerminalDestinoDescripcion: servDatos[i].TerminalDestinoDescripcion,
						// IdModalidad: servDatos[i].IdModalidad,
						// ModalidadDescripcion: servDatos[i].ModalidadDescripcion,
						// IdTipoCarga: servDatos[i].IdTipoCarga,
						// TipoCargaDescripcion: servDatos[i].TipoCargaDescripcion,
						// IdTipoAlmacenamiento: servDatos[i].IdTipoAlmacenamiento,
						// TipoAlmacenamientoDescripcion: servDatos[i].TipoAlmacenamientoDescripcion,
						// IdRegimen: servDatos[i].IdRegimen,
						// RegimenAduanaCodigo: servDatos[i].RegimenAduanaCodigo,
						// RegimenAduanaCodigoSAP: servDatos[i].RegimenAduanaCodigoSAP,
						// RegimenAduanaDescripcion: servDatos[i].RegimenAduanaDescripcion,
						// AgenteCarga: servDatos[i].AgenteCarga,
						//Embarcador: servDatos[i].Embarcador,
						//Consignatario: servDatos[i].Consignatario,
						// IdManifiesto: servDatos[i].IdManifiesto,
						// IdContenedor: servDatos[i].IdContenedor,
						// EsCargaSuelta: servDatos[i].EsCargaSuelta,
						// EsExpo: servDatos[i].EsExpo,
						// Adjunto: servDatos[i].Adjunto,
						// EsTCI: servDatos[i].EsTCI,
						// IdTipoCondicion: servDatos[i].IdTipoCondicion,
						////////////////
						// Adjunto: servDatos[i].Adjunto,
						// NombreAdjunto: servDatos[i].NombreAdjunto,
						//IdTipoAdjunto: servDatos[i].IdTipoAdjunto + "," + servDatos[i].TipoAdjuntoCodigoSAP,
						// TipoAdjuntoDescripcion: servDatos[i].TipoAdjuntoDescripcion,
						// IdAdjunto: servDatos[i].IdAdjunto,
						// TipoAdjuntoCodigoSAP: servDatos[i].TipoAdjuntoCodigoSAP,
						// RutaAdjunto: servDatos[i].RutaAdjunto,

						///Nuevos Campos
						// FechaEmision: servDatos[i].FechaEmision ? new Date(servDatos[i].FechaEmision) : "",
						// FechaEmisionString: servDatos[i].FechaEmisionString,
						// LugarEmision: servDatos[i].LugarEmision,
						// FechaEmbarque: servDatos[i].FechaEmbarque ? new Date(servDatos[i].FechaEmbarque) : "",
						// FechaEmbarqueString: servDatos[i].FechaEmbarqueString,
						// PuertoEmbarque: servDatos[i].PuertoEmbarque,
						// Indicador: servDatos[i].Indicador,
						// CodigoUN: servDatos[i].CodigoUN,
						// TipoBulto: servDatos[i].TipoBulto,

						// TipoDocumentoTransporte: servDatos[i].TipoDocumentoTransporte,
						// VinVehiculos: servDatos[i].VinVehiculos,
						// DepositoTemporal: servDatos[i].DepositoTemporal,

						// TipoDocumentoTransporteDescripcion: servDatos[i].TipoDocumentoTransporteDescripcion,
						// IndicadorDescripcion: servDatos[i].IndicadorDescripcion,
						// TipoBultoDescripcion: servDatos[i].TipoBultoDescripcion,
						// LugarEmisionDescripcion: servDatos[i].LugarEmisionDescripcion,
						// DepositoTemporalDescripcion: servDatos[i].DepositoTemporalDescripcion,
						// NaturalezaCarga: servDatos[i].NaturalezaCarga,
						// CodModalidad: servDatos[i].CodModalidad,
						// CodTipoAlmacenamiento: servDatos[i].CodTipoAlmacenamiento,
						//
						//Nuevos Campos

						//
						// ConsignatarioCodigoCampo: servDatos[i].ConsignatarioCodigoCampo,
						// EmbarcadorCodigoCampo: servDatos[i].EmbarcadorCodigoCampo,
						// NotificadoCodigoCampo: servDatos[i].NotificadoCodigoCampo,
						//

						// ConsignatarioCodigo: servDatos[i].ConsignatarioCodigo,
						// ConsignatarioDescripcion: servDatos[i].ConsignatarioDescripcion,
						// ConsignatarioTelefono: servDatos[i].ConsignatarioTelefono,
						// ConsignatarioDireccion: servDatos[i].ConsignatarioDireccion,
						// ConsignatarioCorreo: servDatos[i].ConsignatarioCorreo,
						// ConsignatarioTipoDocumento: servDatos[i].ConsignatarioTipoDocumento,

						// EmbarcadorCodigo: servDatos[i].EmbarcadorCodigo,
						// EmbarcadorDescripcion: servDatos[i].EmbarcadorDescripcion,
						// EmbarcadorTelefono: servDatos[i].EmbarcadorTelefono,
						// EmbarcadorDireccion: servDatos[i].EmbarcadorDireccion,
						// EmbarcadorCorreo: servDatos[i].EmbarcadorCorreo,
						// EmbarcadorTipoDocumento: servDatos[i].EmbarcadorTipoDocumento,

						// NotificadoCodigo: servDatos[i].NotificadoCodigo,
						// NotificadoDescripcion: servDatos[i].NotificadoDescripcion,
						// NotificadoTelefono: servDatos[i].NotificadoTelefono,
						// NotificadoDireccion: servDatos[i].NotificadoDireccion,
						// NotificadoCorreo: servDatos[i].NotificadoCorreo,
						// NotificadoTipoDocumento: servDatos[i].NotificadoTipoDocumento,

						// ConsolidadorCodigo: servDatos[i].ConsolidadorCodigo,
						// ConsolidadorTipoDocumento: servDatos[i].ConsolidadorTipoDocumento,
						// ConsolidadorDescripcion: servDatos[i].ConsolidadorDescripcion,
						// ConsolidadorDireccion: servDatos[i].ConsolidadorDireccion,
						// ConsolidadorTelefono: servDatos[i].ConsolidadorTelefono,
						// ConsolidadorCorreo: servDatos[i].ConsolidadorCorreo,
						// ConsolidadorPuertoDescarga: servDatos[i].ConsolidadorPuertoDescarga,

						// ValorMercancia: servDatos[i].ValorMercancia,
						// ValorMercanciaMoneda: servDatos[i].ValorMercanciaMoneda,

						// EntidadReguladoraMercPeligrosa: servDatos[i].EntidadReguladoraMercPeligrosa,

						// DestinacionCarga: servDatos[i].DestinacionCarga,

						// NroDetalle: servDatos[i].NroDetalle,
						// DAM: servDatos[i].DAM,
						
						// Marcas: servDatos[i].Marcas,
						// ReceptorCargaId: servDatos[i].ReceptorCargaId,
						// ReceptorCarga: servDatos[i].ReceptorCarga,
						//

						enabledInput: false,
						icon: "sap-icon://edit"
					};
					if (servDatos[i].IdTipoAdjunto && servDatos[i].TipoAdjuntoCodigoSAP) {
						modDatos.IdTipoAdjunto = servDatos[i].IdTipoAdjunto + "," + servDatos[i].TipoAdjuntoCodigoSAP;
					}
					arrayDatos.push(modDatos);
				}
				self.getView().getModel("midata").setProperty("/Detail/TotalBultoManifestado", totalBultoManifestado);
				self.getView().getModel("midata").setProperty("/Detail/TotalPesoManifestado", totalPesoManifestado);
				return arrayDatos;
			}                               
		},
		detail: {
			mapoDataContenedores: function (datos) {
				var servDatos = datos;
				var arrayDatos = [];
				for (var i in servDatos) {
					var modDatos = {
						Id: servDatos[i].Id,
						Tipo: servDatos[i].Tipo,
						Tamanio: servDatos[i].Tamanio,
						Clasificacion: servDatos[i].Clasificacion,
						Condicion: servDatos[i].Condicion,
						BultoManifestado: servDatos[i].BultoManifestado,
						PesoManifestado: servDatos[i].PesoManifestado,
						IdManifiesto: servDatos[i].IdManifiesto,
						NumeroContenedor: servDatos[i].NumeroContenedor,
						enabledInput: false,
						icon: "sap-icon://edit"
					};
					arrayDatos.push(modDatos);
				}
				return arrayDatos;
			},
			mapoDataDocumentosTransporte: function (self, datos) {
				var servDatos = datos;
				var arrayDatos = [];
				var totalBultoManifestado = 0;
				var totalPesoManifestado = 0;
				var totalVolumenManifestado = 0;
				for (var i in servDatos) {
					var MasterDirectas = servDatos[i].EsMaster;

					if(MasterDirectas!== 2){
						totalBultoManifestado = totalBultoManifestado + parseInt(controller.leftNumberUndefined(servDatos[i].BultosManifestados));
						totalPesoManifestado = totalPesoManifestado + parseInt(controller.leftNumberUndefined(servDatos[i].PesoManifestado));
                        totalVolumenManifestado = totalVolumenManifestado + parseInt(controller.leftNumberUndefined(servDatos[i].VolumenManifestado));
					}
					var modDatos = {
						Id: servDatos[i].Id,
						EsMaster: servDatos[i].EsMaster,
						EsMasterDescripcion: servDatos[i].EsMasterDescripcion,
						DocumentoTransporteMadreId: servDatos[i].DocumentoTransporteMadreId,
						DocumentoTransporteMasterCodigo: servDatos[i].DocumentoTransporteMasterCodigo,
						DocumentoTransporteCodigo: servDatos[i].DocumentoTransporteCodigo,
						Descripcion: servDatos[i].Descripcion,
						BultosManifestados: servDatos[i].BultosManifestados,
						PesoManifestado: servDatos[i].PesoManifestado,
						VolumenManifestado: servDatos[i].VolumenManifestado,
						BultosRecibidos: servDatos[i].BultosRecibidos,
						PesoRecibido: servDatos[i].PesoRecibido,
						BultosFaltantes: servDatos[i].BultosFaltantes,
						PesoFaltante: servDatos[i].PesoFaltante,
						BultosSobrantes: servDatos[i].BultosSobrantes,
						PesoSobrante: servDatos[i].PesoSobrante,
						BultosMalEstado: servDatos[i].BultosMalEstado,
						PesoMalEstado: servDatos[i].PesoMalEstado,
						validMostrarPDF: (parseInt(controller.leftNumberUndefined(servDatos[i].TarjaBultosMalEstado)) > 0) ? true : false,
						Origen: servDatos[i].Origen,
						Destino: servDatos[i].Destino,
						OrigenDescripcion: servDatos[i].OrigenDescripcion,
						DestinoDescripcion: servDatos[i].DestinoDescripcion,
						PuntoLlegada: servDatos[i].PuntoLlegada,
						PuntoLlegadaDescripcion: servDatos[i].PuntoLlegadaDescripcion,
						TerminalOrigen: servDatos[i].TerminalOrigen,
						TerminalOrigenDescripcion: servDatos[i].TerminalOrigenDescripcion,
						TerminalDestino: servDatos[i].TerminalDestino,
						TerminalDestinoDescripcion: servDatos[i].TerminalDestinoDescripcion,
						IdModalidad: servDatos[i].IdModalidad,
						ModalidadDescripcion: servDatos[i].ModalidadDescripcion,
						IdTipoCarga: servDatos[i].IdTipoCarga,
						TipoCargaDescripcion: servDatos[i].TipoCargaDescripcion,
						IdTipoAlmacenamiento: servDatos[i].IdTipoAlmacenamiento,
						TipoAlmacenamientoDescripcion: servDatos[i].TipoAlmacenamientoDescripcion,
						IdRegimen: servDatos[i].IdRegimen,
						RegimenAduanaCodigo: servDatos[i].RegimenAduanaCodigo,
						RegimenAduanaCodigoSAP: servDatos[i].RegimenAduanaCodigoSAP,
						RegimenAduanaDescripcion: servDatos[i].RegimenAduanaDescripcion,
						AgenteCarga: servDatos[i].AgenteCarga,
						//Embarcador: servDatos[i].Embarcador,
						//Consignatario: servDatos[i].Consignatario,
						IdManifiesto: servDatos[i].IdManifiesto,
						IdContenedor: servDatos[i].IdContenedor,
						EsCargaSuelta: servDatos[i].EsCargaSuelta,
						EsExpo: servDatos[i].EsExpo,
						Adjunto: servDatos[i].Adjunto,
						EsTCI: servDatos[i].EsTCI,
						IdTipoCondicion: servDatos[i].IdTipoCondicion,
						////////////////
						Adjunto: servDatos[i].Adjunto,
						NombreAdjunto: servDatos[i].NombreAdjunto,
						//IdTipoAdjunto: servDatos[i].IdTipoAdjunto + "," + servDatos[i].TipoAdjuntoCodigoSAP,
						TipoAdjuntoDescripcion: servDatos[i].TipoAdjuntoDescripcion,
						IdAdjunto: servDatos[i].IdAdjunto,
						TipoAdjuntoCodigoSAP: servDatos[i].TipoAdjuntoCodigoSAP,
						RutaAdjunto: servDatos[i].RutaAdjunto,

						///Nuevos Campos
						FechaEmision: servDatos[i].FechaEmision ? new Date(servDatos[i].FechaEmision) : "",
						FechaEmisionString: servDatos[i].FechaEmisionString,
						LugarEmision: servDatos[i].LugarEmision,
						FechaEmbarque: servDatos[i].FechaEmbarque ? new Date(servDatos[i].FechaEmbarque) : "",
						FechaEmbarqueString: servDatos[i].FechaEmbarqueString,
						PuertoEmbarque: servDatos[i].PuertoEmbarque,
						Indicador: servDatos[i].Indicador,
						CodigoUN: servDatos[i].CodigoUN,
						TipoBulto: servDatos[i].TipoBulto,

						TipoDocumentoTransporte: servDatos[i].TipoDocumentoTransporte,
						VinVehiculos: servDatos[i].VinVehiculos,
						DepositoTemporal: servDatos[i].DepositoTemporal,

						TipoDocumentoTransporteDescripcion: servDatos[i].TipoDocumentoTransporteDescripcion,
						IndicadorDescripcion: servDatos[i].IndicadorDescripcion,
						TipoBultoDescripcion: servDatos[i].TipoBultoDescripcion,
						LugarEmisionDescripcion: servDatos[i].LugarEmisionDescripcion,
						DepositoTemporalDescripcion: servDatos[i].DepositoTemporalDescripcion,
						NaturalezaCarga: servDatos[i].NaturalezaCarga,
						CodModalidad: servDatos[i].CodModalidad,
						CodTipoAlmacenamiento: servDatos[i].CodTipoAlmacenamiento,
						//
						//Nuevos Campos

						//
						ConsignatarioCodigoCampo: servDatos[i].ConsignatarioCodigoCampo,
						EmbarcadorCodigoCampo: servDatos[i].EmbarcadorCodigoCampo,
						NotificadoCodigoCampo: servDatos[i].NotificadoCodigoCampo,
						//

						ConsignatarioCodigo: servDatos[i].ConsignatarioCodigo,
						ConsignatarioDescripcion: servDatos[i].ConsignatarioDescripcion,
						ConsignatarioTelefono: servDatos[i].ConsignatarioTelefono,
						ConsignatarioDireccion: servDatos[i].ConsignatarioDireccion,
						ConsignatarioCorreo: servDatos[i].ConsignatarioCorreo,
						ConsignatarioTipoDocumento: servDatos[i].ConsignatarioTipoDocumento,

						EmbarcadorCodigo: servDatos[i].EmbarcadorCodigo,
						EmbarcadorDescripcion: servDatos[i].EmbarcadorDescripcion,
						EmbarcadorTelefono: servDatos[i].EmbarcadorTelefono,
						EmbarcadorDireccion: servDatos[i].EmbarcadorDireccion,
						EmbarcadorCorreo: servDatos[i].EmbarcadorCorreo,
						EmbarcadorTipoDocumento: servDatos[i].EmbarcadorTipoDocumento,

						NotificadoCodigo: servDatos[i].NotificadoCodigo,
						NotificadoDescripcion: servDatos[i].NotificadoDescripcion,
						NotificadoTelefono: servDatos[i].NotificadoTelefono,
						NotificadoDireccion: servDatos[i].NotificadoDireccion,
						NotificadoCorreo: servDatos[i].NotificadoCorreo,
						NotificadoTipoDocumento: servDatos[i].NotificadoTipoDocumento,

						ConsolidadorCodigo: servDatos[i].ConsolidadorCodigo,
						ConsolidadorTipoDocumento: servDatos[i].ConsolidadorTipoDocumento,
						ConsolidadorDescripcion: servDatos[i].ConsolidadorDescripcion,
						ConsolidadorDireccion: servDatos[i].ConsolidadorDireccion,
						ConsolidadorTelefono: servDatos[i].ConsolidadorTelefono,
						ConsolidadorCorreo: servDatos[i].ConsolidadorCorreo,
						ConsolidadorPuertoDescarga: servDatos[i].ConsolidadorPuertoDescarga,

						ValorMercancia: servDatos[i].ValorMercancia,
						ValorMercanciaMoneda: servDatos[i].ValorMercanciaMoneda,

						EntidadReguladoraMercPeligrosa: servDatos[i].EntidadReguladoraMercPeligrosa,

						DestinacionCarga: servDatos[i].DestinacionCarga,

						NroDetalle: servDatos[i].NroDetalle,
						DAM: servDatos[i].DAM,
						
						Marcas: servDatos[i].Marcas,
						ReceptorCargaId: servDatos[i].ReceptorCargaId,
						ReceptorCarga: servDatos[i].ReceptorCarga,
						//

						enabledInput: false,
						icon: "sap-icon://edit"
					};
					if (servDatos[i].IdTipoAdjunto && servDatos[i].TipoAdjuntoCodigoSAP) {
						modDatos.IdTipoAdjunto = servDatos[i].IdTipoAdjunto + "," + servDatos[i].TipoAdjuntoCodigoSAP;
					}
					arrayDatos.push(modDatos);
				}
				self.getView().getModel("localModel").setProperty("/Detail/TotalBultoManifestado", totalBultoManifestado);
				self.getView().getModel("localModel").setProperty("/Detail/TotalPesoManifestado", totalPesoManifestado);
				return arrayDatos;
			},
			mapoDataPaquetes: function (datos) {
				var servDatos = datos;
				var arrayDatos = [];
				for (var i in servDatos) {
					var modDatos = {
						Id: servDatos[i].Id,
						IdDocumentoTransporte: servDatos[i].IdDocumentoTransporte,
						TipoEmpaqueCodigo: servDatos[i].TipoEmpaqueCodigo,
						Cantidad: servDatos[i].Cantidad,
						enabledInput: false,
						icon: "sap-icon://edit"
					};
					arrayDatos.push(modDatos);
				}
				return arrayDatos;
			},
			mapoDataPrecintos: function (datos) {
				var servDatos = datos;
				var arrayDatos = [];
				for (var i in servDatos) {
					var modDatos = {
						Id: servDatos[i].Id,
						IdContenedor: servDatos[i].IdContenedor,
						NumeroPrecinto: servDatos[i].NumeroPrecinto,
						enabledInput: false,
						icon: "sap-icon://edit"
					};
					arrayDatos.push(modDatos);
				}
				return arrayDatos;
			},
			mapoDataAdjuntos: function (datos) {
				var servDatos = datos;
				var arrayDatos = [];
				for (var i in servDatos) {
					var modDatos = {
						Id: servDatos[i].Id,
						IdManifiesto: servDatos[i].IdManifiesto,
						IdTipoAdjunto: servDatos[i].IdTipoAdjunto + "," + servDatos[i].CodigoSap,
						CodigoSap: servDatos[i].CodigoSap,
						TipoAdjuntoDescripcion: servDatos[i].TipoAdjuntoDescripcion,
						IdAdjunto: servDatos[i].IdAdjunto,
						NombreAdjunto: servDatos[i].NombreAdjunto,
						RutaAdjunto: servDatos[i].RutaAdjunto,
						enabledInput: false,
						icon: "sap-icon://edit"
					};
					arrayDatos.push(modDatos);
				}
				return arrayDatos;
			},
			mapoDataFletes: function (datos) {
				var servDatos = datos;
				var arrayDatos = [];
				for (var i in servDatos) {
					var modDatos = {
						Id: servDatos[i].Id,
						IdDocumentoTransporte: servDatos[i].IdDocumentoTransporte,
						TipoPago: servDatos[i].TipoPago,
						TipoFlete: servDatos[i].TipoFlete,
						MontoFlete: servDatos[i].MontoFlete,
						MonedaFlete: servDatos[i].MonedaFlete,
						DestinacionCarga: servDatos[i].DestinacionCarga,
						TipoPagoDescripcion: servDatos[i].TipoPagoDescripcion,
						TipoFleteDescripcion: servDatos[i].TipoFleteDescripcion,
						MonedaFleteDescripcion: servDatos[i].MonedaFleteDescripcion,
						DestinacionCargaDescripcion: servDatos[i].DestinacionCargaDescripcion,
						enabledInput: false,
						icon: "sap-icon://edit"
					};
					arrayDatos.push(modDatos);
				}
				return arrayDatos;
			}
		},
		detailExcel: {
			mapTbImportExcel: function (datos) {
				var servDatos = datos;
				var arrayDatos = [];
				for (var i in servDatos) {
					var modDatos = {
						DocumentoTransporteMasterCodigo: servDatos[i]["Documento Transporte"],
						DocumentoTransporteCodigo: servDatos[i]["GA / BL"],
						Descripcion: servDatos[i]["Descripcion"],
						IdContenedor: servDatos[i]["Contenedor"],
						BultosManifestados: servDatos[i]["Bultos Manif."],
						PesoManifestado: servDatos[i]["Peso Manif."],
						Origen: servDatos[i]["Origen"],
						Destino: servDatos[i]["Destino"],
						PuntoLlegada: servDatos[i]["P. Llegada"],
						TerminalOrigen: servDatos[i]["Term. Origen"],
						TerminalDestino: servDatos[i]["Term. Destino"],
						IdModalidad: servDatos[i]["Modalidad"],
						IdTipoCarga: servDatos[i]["Tipo Carga"],
						IdTipoAlmacenamiento: servDatos[i]["Tipo Almacenamiento"],
						IdRegimen: servDatos[i]["Régimen"],
						AgenteCarga: servDatos[i]["Agente de Carga"],
						Embarcador: servDatos[i]["Embarcador"],
						Consignatario: servDatos[i]["Consignatario"],
						Adjunto: servDatos[i]["Adjunto"],
						enabledInput: false,
						icon: "sap-icon://edit"
					};
					arrayDatos.push(modDatos);
				}
				return arrayDatos;
			},
			mapTbExportExcel: function (datos) {
				var servDatos = datos;
				var arrayDatos = [];
				for (var i in servDatos) {
					var modDatos = {
						//["Documento Transporte"]: servDatos[i].DocumentoTransporteMasterCodigo,
						["GA / BL"]: servDatos[i].DocumentoTransporteCodigo,
						["Descripcion"]: servDatos[i].Descripcion,
						["Contenedor"]: servDatos[i].IdContenedor,
						["Bultos Manif."]: servDatos[i].BultosManifestados,
						["Peso Manif."]: servDatos[i].PesoManifestado,
						["Origen"]: servDatos[i].Origen,
						["Destino"]: servDatos[i].Destino,
						["P. Llegada"]: servDatos[i].PuntoLlegada,
						["Term. Origen"]: servDatos[i].TerminalOrigen,
						["Term. Destino"]: servDatos[i].TerminalDestino,
						["Modalidad"]: servDatos[i].IdModalidad,
						["Tipo Carga"]: servDatos[i].IdTipoCarga,
						["Tipo Almacenamiento"]: servDatos[i].IdTipoAlmacenamiento,
						["Régimen"]: servDatos[i].IdRegimen,
						["Agente de Carga"]: servDatos[i].AgenteCarga,
						["Embarcador"]: servDatos[i].Embarcador,
						["Consignatario"]: servDatos[i].Consignatario,
						["Adjunto"]: servDatos[i].Adjunto
					};
					arrayDatos.push(modDatos);
				}
				return arrayDatos;
			}
		},
		detailPDF: {
			mapExportPDFActaInventarioDirecta: function (dataInfo) {
				var objDT = dataInfo;
				var datosPdf = {
					NumeroActaInventario: controller.valueUndefinedPDF(dataInfo.ManifiestoActaInventarioNroFormato),
					Observacion: controller.valueUndefinedPDF(dataInfo.ManifiestoActaInventarioObs),

					DireccionDepositoTemporal: controller.valueUndefinedPDF(dataInfo.DireccionDepositoTemporal),
					DireccionFiscal: controller.valueUndefinedPDF(dataInfo.DireccionFiscal),
					RucSaasa: controller.valueUndefinedPDF(dataInfo.RucSaasa),
					DescripcionSaasa: controller.valueUndefinedPDF(dataInfo.DescripcionSaasa),
					BaseLegalMaster: controller.valueUndefinedPDF(dataInfo.BaseLegalMaster),
					BaseLegalMasterCita: controller.valueUndefinedPDF(dataInfo.BaseLegalMasterCita),
					BaseLegalMasterMalaCond: controller.valueUndefinedPDF(dataInfo.BaseLegalMasterMalaCond),
					BaseLegalMasterMalaCondCita: controller.valueUndefinedPDF(dataInfo.BaseLegalMasterMalaCondCita),

					BaseLegalHouse: controller.valueUndefinedPDF(dataInfo.BaseLegalHouse),
					BaseLegalHouseCita: controller.valueUndefinedPDF(dataInfo.BaseLegalHouseCita),
					BaseLegalHouseMalaCond: controller.valueUndefinedPDF(dataInfo.BaseLegalHouseMalaCond),
					BaseLegalHouseMalaCondCita: controller.valueUndefinedPDF(dataInfo.BaseLegalHouseMalaCondCita),

					Titulo: "ActaInventarioDirecta" + controller.valueUndefinedPDF(dataInfo.CodVolante),
					NumeroInventario: controller.valueUndefinedPDF(dataInfo),
					NumeroIngreso: controller.valueUndefinedPDF(dataInfo.CodVolante),
					MAWB: controller.valueUndefinedPDF(dataInfo.DTMasterCodigo),
					FechaLlegada: controller.valueUndefinedPDF(dataInfo.ManifiestoFechaLlegadaATAString),
					NumeroManifiesto: controller.valueUndefinedPDF(dataInfo.ManifiestoJurisdicionAduanera) + "-" + controller.valueUndefinedPDF(dataInfo.TransporteVia)
										+ "-" + controller.valueUndefinedPDF(dataInfo.ManifiestoAnio) + "-" + controller.valueUndefinedPDF(dataInfo.ManifiestoNumero),
					AgenteCarga: controller.valueUndefinedPDF(dataInfo.AgenteCargaDescripcion),
					Consignatario: controller.valueUndefinedPDF(dataInfo.ConsignatarioNombre),
					DiceContener: controller.valueUndefinedPDF(dataInfo.NumeroContenedor),
					PuntoOrigen: controller.valueUndefinedPDF(dataInfo.Origen) + " " + controller.valueUndefinedPDF(dataInfo.OrigenDescripcion),
					EmpresaTransportista: controller.valueUndefinedPDF(dataInfo.TransportistaNombre),
					NumeroVuelo: controller.valueUndefinedPDF(dataInfo.ItinerarioCodigoYata) + "-" + controller.valueUndefinedPDF(dataInfo.ItinerarioNroViaje),
					Almacen: controller.valueUndefinedPDF(dataInfo.UbicacionDescAlmacen),
					TipoCarga: controller.valueUndefinedPDF(dataInfo.TipoAlmacenamientoDescripcion),

					Transportista: controller.valueUndefinedPDF(dataInfo.TransportistaNombre),
					Consignatario: controller.valueUndefinedPDF(dataInfo.ConsignatarioNombre),
					Contenedor: controller.valueUndefinedPDF(dataInfo.NumeroContenedor),
					Descripcion: controller.valueUndefinedPDF(dataInfo.DTDescripcion),

					HAWB: controller.valueUndefinedPDF(dataInfo.DTCodigo),
					TerminoDescarga: controller.valueUndefinedPDF(dataInfo.FechaTerminoDescargaString),
					ModoIngreso: controller.valueUndefinedPDF(dataInfo.ModalidadDescripcion),

					FechaRecepcion: controller.valueUndefinedPDF(dataInfo.ManifiestoFechaInicioTarjaString),
					DocTransporteDirecta: controller.valueUndefinedPDF(dataInfo.DTCodigo),
					DocTransporteMaster: controller.valueUndefinedPDF(dataInfo.DTCodigo),
					RazonSocialTransportista: controller.valueUndefinedPDF(dataInfo.ItinerarioDescripcionTransportista),
					RucTransportista: controller.valueUndefinedPDF(dataInfo.ItinerarioCodigoTransportista),
					DireccionTransportista: controller.valueUndefinedPDF(dataInfo.ItinerarioDireccionTransportista),
					aDetalle: {
						"BultosManifestados": controller.leftNumberUndefined(objDT.DTBultosManifestados),
						"BultosRecibidos": controller.leftNumberUndefined(objDT.DTBultosRecibidos),
						"BultosFaltantes": controller.leftNumberUndefined(objDT.DTBultosFaltantes),
						"BultosSobrantes": controller.leftNumberUndefined(objDT.DTBultosSobrantes),
						"BultosBuenos": controller.leftNumberUndefined(objDT.DTBultosBuenEstado),
						"BultosMalos": controller.leftNumberUndefined(objDT.DTBultosMalEstado),

						"PesoManifestados": parseFloat(controller.leftNumberUndefined(objDT.DTPesoManifestado)).toFixed(2),
						"PesoRecibidos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoRecibido)).toFixed(2),
						"PesoFaltantes": parseFloat(controller.leftNumberUndefined(objDT.DTPesoFaltante)).toFixed(2),
						"PesoSobrantes": parseFloat(controller.leftNumberUndefined(objDT.DTPesoSobrante)).toFixed(2),
						"PesoBuenos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoBuenEstado)).toFixed(2),
						"PesoMalos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoMalEstado)).toFixed(2),
					},
					Fotos: dataInfo.oFotos
				};
				return datosPdf;
			},
			mapExportPDFActaTrasladoDirecta: function (dataInfo) {
				var objDT = dataInfo;
				var datosPdf = {
					DescripcionSaasa: controller.valueUndefinedPDF(dataInfo.DescripcionSaasa),
					DepositoTemporal: controller.valueUndefinedPDF(dataInfo.DTDepositoTemporalDescripcion),
					Titulo: "Anexo X Acta de Traslado" + controller.valueUndefinedPDF(dataInfo.CodVolante),
					RepresentanteLegalOrigen: controller.valueUndefinedPDF(dataInfo.RepresentanteLegalOrigen),
					RepresentanteLegalDestino: controller.valueUndefinedPDF(dataInfo.RepresentanteLegalDestino),
					NumeroManifiesto: controller.valueUndefinedPDF(dataInfo.ManifiestoJurisdicionAduanera) + "-" + controller.valueUndefinedPDF(dataInfo.TransporteVia)
										+ "-" + controller.valueUndefinedPDF(dataInfo.ManifiestoAnio) + "-" + controller.valueUndefinedPDF(dataInfo.ManifiestoNumero),
					Matricula: controller.valueUndefinedPDF(dataInfo.TransporteMatricula),
					Titulo: "Anexo X Acta de Traslado" + controller.valueUndefinedPDF(dataInfo.CodVolante),
					aDetalle: {
						"BultosManifestados": controller.leftNumberUndefined(objDT.DTBultosManifestados),
						"BultosRecibidos": controller.leftNumberUndefined(objDT.DTBultosRecibidos),
						"BultosFaltantes": controller.leftNumberUndefined(objDT.DTBultosFaltantes),
						"BultosSobrantes": controller.leftNumberUndefined(objDT.DTBultosSobrantes),
						"BultosBuenos": controller.leftNumberUndefined(objDT.DTBultosBuenEstado),
						"BultosMalos": controller.leftNumberUndefined(objDT.DTBultosMalEstado),

						"PesoManifestados": parseFloat(controller.leftNumberUndefined(objDT.DTPesoManifestado)).toFixed(2),
						"PesoRecibidos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoRecibido)).toFixed(2),
						"PesoFaltantes": parseFloat(controller.leftNumberUndefined(objDT.DTPesoFaltante)).toFixed(2),
						"PesoSobrantes": parseFloat(controller.leftNumberUndefined(objDT.DTPesoSobrante)).toFixed(2),
						"PesoBuenos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoBuenEstado)).toFixed(2),
						"PesoMalos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoMalEstado)).toFixed(2),
					}
				};
				return datosPdf;
			},
			mapExportPDFActaInventarioMaster: function (dataInfo) {
				var objDT = dataInfo;
				var datosPdf = {
					NumeroActaInventario: controller.valueUndefinedPDF(dataInfo.ManifiestoActaInventarioNroFormato),
					Observacion: controller.valueUndefinedPDF(dataInfo.ManifiestoActaInventarioObs),

					DireccionDepositoTemporal: controller.valueUndefinedPDF(dataInfo.DireccionDepositoTemporal),
					DireccionFiscal: controller.valueUndefinedPDF(dataInfo.DireccionFiscal),
					RucSaasa: controller.valueUndefinedPDF(dataInfo.RucSaasa),
					DescripcionSaasa: controller.valueUndefinedPDF(dataInfo.DescripcionSaasa),
					//BaseLegalMaster: controller.valueUndefinedPDF(dataInfo.BaseLegalMaster),
					BaseLegalMasterCita: controller.valueUndefinedPDF(dataInfo.BaseLegalMasterCita),
					BaseLegalMaster: controller.valueUndefinedPDF(dataInfo.BaseLegalMaster),
					BaseLegalMasterMalaCond: controller.valueUndefinedPDF(dataInfo.BaseLegalMasterMalaCond),
					BaseLegalMasterMalaCondCita: controller.valueUndefinedPDF(dataInfo.BaseLegalMasterMalaCondCita),
					BaseLegalHouse: controller.valueUndefinedPDF(dataInfo.BaseLegalHouse),
					BaseLegalHouseCita: controller.valueUndefinedPDF(dataInfo.BaseLegalHouseCita),
					BaseLegalHouseMalaCond: controller.valueUndefinedPDF(dataInfo.BaseLegalHouseMalaCond),
					BaseLegalHouseMalaCondCita: controller.valueUndefinedPDF(dataInfo.BaseLegalHouseMalaCondCita),

					Titulo: "ActaInventarioMaster" + controller.valueUndefinedPDF(dataInfo.CodVolante),
					NumeroInventario: controller.valueUndefinedPDF(dataInfo),
					NumeroIngreso: controller.valueUndefinedPDF(dataInfo.CodVolante),
					MAWB: controller.valueUndefinedPDF(dataInfo.DTMasterCodigo),
					FechaLlegada: controller.valueUndefinedPDF(dataInfo.ManifiestoFechaLlegadaATAString),
					NumeroManifiesto: controller.valueUndefinedPDF(dataInfo.ManifiestoJurisdicionAduanera) + "-" + controller.valueUndefinedPDF(dataInfo.TransporteVia)
									+ "-" + controller.valueUndefinedPDF(dataInfo.ManifiestoAnio) + "-" + controller.valueUndefinedPDF(dataInfo.ManifiestoNumero),
					AgenteCarga: controller.valueUndefinedPDF(dataInfo.AgenteCargaDescripcion),
					Consignatario: controller.valueUndefinedPDF(dataInfo.ConsignatarioNombre),
					DiceContener: controller.valueUndefinedPDF(dataInfo.NumeroContenedor),
					PuntoOrigen: controller.valueUndefinedPDF(dataInfo.Origen) + " " + controller.valueUndefinedPDF(dataInfo.OrigenDescripcion),
					EmpresaTransportista: controller.valueUndefinedPDF(dataInfo.TransportistaNombre),
					NumeroVuelo: controller.valueUndefinedPDF(dataInfo.ItinerarioCodigoYata) + "-" + controller.valueUndefinedPDF(dataInfo.ItinerarioNroViaje),
					Almacen: controller.valueUndefinedPDF(dataInfo.UbicacionDescAlmacen),
					TipoCarga: controller.valueUndefinedPDF(dataInfo.TipoAlmacenamientoDescripcion),
 
					Transportista: controller.valueUndefinedPDF(dataInfo.TransportistaNombre),
					Consignatario: controller.valueUndefinedPDF(dataInfo.ConsignatarioNombre),
					Contenedor: controller.valueUndefinedPDF(dataInfo.NumeroContenedor),
					Descripcion: controller.valueUndefinedPDF(dataInfo.DTDescripcion),

					HAWB: controller.valueUndefinedPDF(dataInfo.DTCodigo),
					TerminoDescarga: controller.valueUndefinedPDF(dataInfo.FechaTerminoDescargaString),
					ModoIngreso: controller.valueUndefinedPDF(dataInfo.ModalidadDescripcion),

					FechaRecepcion: controller.valueUndefinedPDF(dataInfo.ManifiestoFechaInicioTarjaString),
					DocTransporteDirecta: controller.valueUndefinedPDF(dataInfo.DTCodigo),
					DocTransporteMaster: dataInfo.DTMasterCodigo? controller.valueUndefinedPDF(dataInfo.DTMasterCodigo):controller.valueUndefinedPDF(dataInfo.DTCodigo) ,
					RazonSocialTransportista: controller.valueUndefinedPDF(dataInfo.ItinerarioDescripcionTransportista),
					RucTransportista: controller.valueUndefinedPDF(dataInfo.ItinerarioCodigoTransportista),
					DireccionTransportista: controller.valueUndefinedPDF(dataInfo.ItinerarioDireccionTransportista),
					aDetalle: {
						"BultosManifestados": controller.leftNumberUndefined(objDT.DTBultosManifestados),
						"BultosRecibidos": controller.leftNumberUndefined(objDT.DTBultosRecibidos),
						"BultosFaltantes": controller.leftNumberUndefined(objDT.DTBultosFaltantes),
						"BultosSobrantes": controller.leftNumberUndefined(objDT.DTBultosSobrantes),
						"BultosBuenos": controller.leftNumberUndefined(objDT.DTBultosBuenEstado),
						"BultosMalos": controller.leftNumberUndefined(objDT.DTBultosMalEstado),

						"PesoManifestados": parseFloat(controller.leftNumberUndefined(objDT.DTPesoManifestado)).toFixed(2),
						"PesoRecibidos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoRecibido)).toFixed(2),
						"PesoFaltantes": parseFloat(controller.leftNumberUndefined(objDT.DTPesoFaltante)).toFixed(2),
						"PesoSobrantes": parseFloat(controller.leftNumberUndefined(objDT.DTPesoSobrante)).toFixed(2),
						"PesoBuenos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoBuenEstado)).toFixed(2),
						"PesoMalos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoMalEstado)).toFixed(2),
					},
					Fotos: dataInfo.oFotos
				};
				return datosPdf;
			},
			mapExportPDFActaTrasladoMaster: function (dataInfo) {
				var objDT = dataInfo;
				var datosPdf = {
					DescripcionSaasa: controller.valueUndefinedPDF(dataInfo.DescripcionSaasa),
					DepositoTemporal: controller.valueUndefinedPDF(dataInfo.DTDepositoTemporalDescripcion),
					Titulo: "Anexo X Acta de Traslado" + controller.valueUndefinedPDF(dataInfo.CodVolante),
					RepresentanteLegalOrigen: controller.valueUndefinedPDF(dataInfo.RepresentanteLegalOrigen),
					RepresentanteLegalDestino: controller.valueUndefinedPDF(dataInfo.RepresentanteLegalDestino),
					NumeroManifiesto: controller.valueUndefinedPDF(dataInfo.ManifiestoJurisdicionAduanera) + "-" + controller.valueUndefinedPDF(dataInfo.TransporteVia)
										+ "-" + controller.valueUndefinedPDF(dataInfo.ManifiestoAnio) + "-" + controller.valueUndefinedPDF(dataInfo.ManifiestoNumero),
					Matricula: controller.valueUndefinedPDF(dataInfo.TransporteMatricula),
					aDetalle: {
						"BultosManifestados": controller.leftNumberUndefined(objDT.DTBultosManifestados),
						"BultosRecibidos": controller.leftNumberUndefined(objDT.DTBultosRecibidos),
						"BultosFaltantes": controller.leftNumberUndefined(objDT.DTBultosFaltantes),
						"BultosSobrantes": controller.leftNumberUndefined(objDT.DTBultosSobrantes),
						"BultosBuenos": controller.leftNumberUndefined(objDT.DTBultosBuenEstado),
						"BultosMalos": controller.leftNumberUndefined(objDT.DTBultosMalEstado),

						"PesoManifestados": parseFloat(controller.leftNumberUndefined(objDT.DTPesoManifestado)).toFixed(2),
						"PesoRecibidos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoRecibido)).toFixed(2),
						"PesoFaltantes": parseFloat(controller.leftNumberUndefined(objDT.DTPesoFaltante)).toFixed(2),
						"PesoSobrantes": parseFloat(controller.leftNumberUndefined(objDT.DTPesoSobrante)).toFixed(2),
						"PesoBuenos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoBuenEstado)).toFixed(2),
						"PesoMalos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoMalEstado)).toFixed(2),
					}
				};
				return datosPdf;
			},
			mapExportPDFAnexo6ManifiestoCargaDC: function (dataInfo) {
				var aGeneral = [];
				var master = dataInfo.filter(function (el) {
						return el["DTMasterCodigo"] == null;
					});
				var hijas = dataInfo.filter(function (el) {
						return el["DTMasterCodigo"] != null;
					});
					
				for (var i in master) {
					var dataCabecera = master[i];
					var filterHijas = hijas.filter(function (el) {
						return el["DTMasterCodigo"] == master[i]["DTCodigo"];
					});
					
					var inicioTarja = false;
					if (dataInfo.EstadoCodigo == "TE_MANIF_03" || dataInfo.EstadoCodigo == "TE_MANIF_04"){
						inicioTarja = true;
					}
				
					var datosPdf = {
						DireccionFiscal: controller.valueUndefinedPDF(dataCabecera.DireccionFiscal),
						RucSaasa: controller.valueUndefinedPDF(dataCabecera.RucSaasa),
						DescripcionSaasa: controller.valueUndefinedPDF(dataCabecera.DescripcionSaasa),
						BaseLegalAnexo6MasterDirecta: controller.valueUndefinedPDF(dataCabecera.BaseLegalAnexo6MasterDirecta),
						Titulo: "Anexo VI Manif. Carga Desconsolid. Consolid.",

						AgenteCargaInternacional: controller.valueUndefinedPDF(dataCabecera.AgenteCargaDescripcion),
						AgenteCargaIdentificacion: controller.valueUndefinedPDF(dataCabecera.AgenteCargaIdentificacion),
						
						ConsignatarioDireccion: controller.valueUndefinedPDF(dataCabecera.ConsignatarioDireccion),
						
						FechaHoraLlegada: controller.valueUndefinedPDF(dataCabecera.ManifiestoFechaHoraLlegadaATAString),
						FechaHoraTerminoDescarga: controller.valueUndefinedPDF(dataCabecera.FechaHoraTerminoDescargaString),
						TransportistaNombre: controller.valueUndefinedPDF(dataCabecera.TransportistaNombre),
						Matricula: controller.valueUndefinedPDF(dataCabecera.TransporteMatricula),
						TransporteFechaEstimadaLlegada: controller.valueUndefinedPDF(dataCabecera.ManifiestoFechaHoraLlegadaATAString),
						DTPuertoFinal: controller.valueUndefinedPDF(dataCabecera.DTPuertoFinal),
						DocumentoTransporteMaster: controller.valueUndefinedPDF(dataCabecera.DTCodigo),
						TicketNumeracion: controller.valueUndefinedPDF(dataCabecera.TicketNumeracion),
						
						RazonSocialAerolinea: controller.valueUndefinedPDF(dataCabecera.ItinerarioDescripcionTransportista),
						DireccionFiscalAerolinea: controller.valueUndefinedPDF(dataCabecera.ItinerarioDireccionTransportista),
						RucAerolinea: controller.valueUndefinedPDF(dataCabecera.ItinerarioCodigoTransportista),
						CodigoTransportista: controller.valueUndefinedPDF(dataCabecera.TransportistaIdentificacion),
						OrigenDescripcion: controller.valueUndefinedPDF(dataCabecera.OrigenDescripcion),
						
						NumeroVuelo: controller.valueUndefinedPDF(dataCabecera.ItinerarioCodigoYata) + "-" + controller.valueUndefinedPDF(dataCabecera.ItinerarioNroViaje),
						Manifiesto: controller.valueUndefinedPDF(dataCabecera.ManifiestoJurisdicionAduanera) + "-" + controller.valueUndefinedPDF(
						dataCabecera.TransporteVia) + "-" + controller.valueUndefinedPDF(dataCabecera.ManifiestoAnio) + "-" + controller.valueUndefinedPDF(dataCabecera.ManifiestoNumero),
						DepositoTemporal: "4372", //controller.valueUndefinedPDF(dataCabecera.DTDepositoTemporalDescripcion),
						FechaInicioTarja: !inicioTarja ? "" : controller.valueUndefinedPDF(dataCabecera.ManifiestoFechaInicioTarja),
						FechaFinTarja: !inicioTarja ? "" : controller.valueUndefinedPDF(dataCabecera.ManifiestoFechaFinTarja),
						aDetalle: []
					};
					var totalBultosManif = 0.00;
					var totalBultosRec = 0.00;
					var totalBultosFalt = 0.00;
					var totalBultosSobr = 0.00;
					var totalBultosBueno = 0.00;
					var totalBultosMalo = 0.00;

					var totalPesoManif = 0.00;
					var totalPesoRec = 0.00;
					var totalPesoFalt = 0.00;
					var totalPesoSobr = 0.00;
					var totalPesoBueno = 0.00;
					var totalPesoMalo = 0.00;
					var contador = 0;
					for (var i in filterHijas) {
						var objDT = filterHijas[i];
						if (objDT.DTDepositoTemporal !== "4372") {
							continue;
						}
						contador = contador + 1;
						var obj = {
							"Numero": controller.leftNumberUndefined(objDT.DTNumeroDetalle),
							"TipoManifiesto": controller.valueUndefinedPDF(objDT.ManifiestoTipo),
							"CodPto": controller.valueUndefinedPDF(objDT.Origen),
							"DocumentoTransporteMaster": controller.valueUndefinedPDF(objDT.DTMasterCodigo),
							"DocumentoTransporteHouse": controller.valueUndefinedPDF(objDT.DTCodigo),
							"Consignatario": controller.valueUndefinedPDF(objDT.ConsignatarioNombre),
							"Descripcion": controller.valueUndefinedPDF(objDT.DTDescripcion),
							"NumeroContenedor": controller.valueUndefinedPDF(objDT.NumeroContenedor),

							"BultosManifestados": controller.leftNumberUndefined(objDT.DTBultosManifestados),
							"BultosRecibidos": controller.leftNumberUndefined(objDT.DTBultosRecibidos),
							"BultosFaltantes": controller.leftNumberUndefined(objDT.DTBultosFaltantes),
							"BultosSobrantes": controller.leftNumberUndefined(objDT.DTBultosSobrantes),
							"BultosBuenos": controller.leftNumberUndefined(objDT.DTBultosBuenEstado),
							"BultosMalos": controller.leftNumberUndefined(objDT.DTBultosMalEstado),
							
							"ConsignatarioDescripcionTipoIdentificacion": controller.valueUndefinedPDF(objDT.DescripcionTipoIdentificacion),
							"ConsignatarioIdentificacion": controller.valueUndefinedPDF(objDT.ConsignatarioIdentificacion),
							"Origen": controller.valueUndefinedPDF(objDT.Origen),
							"Destino": controller.valueUndefinedPDF(objDT.Destino),
							"Marcas": controller.valueUndefinedPDF(objDT.Marcas),
							"Bultos": controller.valueUndefinedPDF(objDT.DTBultosManifestados),
							"Peso": controller.valueUndefinedPDF(objDT.DTPesoManifestado),

							"PesoManifestados": parseFloat(controller.leftNumberUndefined(objDT.DTPesoManifestado)).toFixed(2),
							"PesoRecibidos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoRecibido)).toFixed(2),
							"PesoFaltantes": parseFloat(controller.leftNumberUndefined(objDT.DTPesoFaltante)).toFixed(2),
							"PesoSobrantes": parseFloat(controller.leftNumberUndefined(objDT.DTPesoSobrante)).toFixed(2),
							"PesoBuenos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoBuenEstado)).toFixed(2),
							"PesoMalos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoMalEstado)).toFixed(2),

							"ActaInventario": controller.leftNumberUndefined(objDT.EsMalEstado) == 0 ? "" : controller.valueUndefinedPDF(objDT.ManifiestoActaInventarioNroFormato),
							"Incidencia": controller.leftNumberUndefined(objDT.EsMalEstado) == 0 ? "" : controller.valueUndefinedPDF(objDT.ManifiestoNumeroIncidencia),
							"DescripcionIncidencia": controller.leftNumberUndefined(objDT.EsMalEstado) == 0 ? "" : controller.valueUndefinedPDF(objDT.ManifiestoActaInventarioObs),
							"DiferenciaPeso": (parseFloat(controller.leftNumberUndefined(objDT.DTPesoRecibido)) == 0 ? 0 : parseFloat(controller.leftNumberUndefined(
								objDT.DTPesoManifestado)) / parseFloat(controller.leftNumberUndefined(objDT.DTPesoRecibido))).toString()
						};
						obj.DiferenciaPeso = parseFloat(obj.DiferenciaPeso).toFixed(2) + " %";
						totalBultosManif = parseInt(totalBultosManif) + parseInt(obj.BultosManifestados);
						totalBultosRec = parseInt(totalBultosRec) + parseFloat(obj.BultosRecibidos);
						totalBultosFalt = parseInt(totalBultosFalt) + parseInt(obj.BultosFaltantes);
						totalBultosSobr = parseInt(totalBultosSobr) + parseInt(obj.BultosSobrantes);
						totalBultosBueno = parseInt(totalBultosBueno) + parseInt(obj.BultosBuenos);
						totalBultosMalo = parseInt(totalBultosMalo) + parseInt(obj.BultosMalos);

						totalPesoManif = (parseFloat(totalPesoManif) + parseFloat(obj.PesoManifestados)).toFixed(2);
						totalPesoRec = (parseFloat(totalPesoRec) + parseFloat(obj.PesoRecibidos)).toFixed(2);
						totalPesoFalt = (parseFloat(totalPesoFalt) + parseFloat(obj.PesoFaltantes)).toFixed(2);
						totalPesoSobr = (parseFloat(totalPesoSobr) + parseFloat(obj.PesoSobrantes)).toFixed(2);
						totalPesoBueno = (parseFloat(totalPesoBueno) + parseFloat(obj.PesoBuenos)).toFixed(2);
						totalPesoMalo = (parseFloat(totalPesoMalo) + parseFloat(obj.PesoMalos)).toFixed(2);

						datosPdf.aDetalle.push(obj);
					}
					datosPdf.CantidadDocumentos = controller.leftNumberUndefined(datosPdf.aDetalle.length);
					datosPdf.totalBultosManif = totalBultosManif.toString();
					datosPdf.totalBultosRec = totalBultosRec.toString();
					datosPdf.totalBultosFalt = totalBultosFalt.toString();
					datosPdf.totalBultosSobr = totalBultosSobr.toString();
					datosPdf.totalBultosBueno = totalBultosBueno.toString();
					datosPdf.totalBultosMalo = totalBultosMalo.toString();

					datosPdf.totalPesoManif = totalPesoManif.toString();
					datosPdf.totalPesoRec = totalPesoRec.toString();
					datosPdf.totalPesoFalt = totalPesoFalt.toString();
					datosPdf.totalPesoSobr = totalPesoSobr.toString();
					datosPdf.totalPesoBueno = totalPesoBueno.toString();
					datosPdf.totalPesoMalo = totalPesoMalo.toString();
					
					aGeneral.push(datosPdf);
				}

				return aGeneral;
			},
			mapExportPDFActaInventarioHouse: function (dataInfo) {
				var objDT = dataInfo;
				var datosPdf = {
					NumeroActaInventario: controller.valueUndefinedPDF(dataInfo.ManifiestoActaInventarioNroFormato),
					Observacion: controller.valueUndefinedPDF(dataInfo.ManifiestoActaInventarioObs),
					
					DTCodigo: controller.valueUndefinedPDF(dataInfo.DTCodigo),
					DTDepositoTemporal: controller.valueUndefinedPDF(dataInfo.DTDepositoTemporal),
					DTDepositoTemporalDescripcion: controller.valueUndefinedPDF(dataInfo.DTDepositoTemporalDescripcion),
					DireccionDepositoTemporal: controller.valueUndefinedPDF(dataInfo.DireccionDepositoTemporal),
					DireccionFiscal: controller.valueUndefinedPDF(dataInfo.DireccionFiscal),
					DescripcionSaasa: controller.valueUndefinedPDF(dataInfo.DescripcionSaasa),
					RucSaasa: controller.valueUndefinedPDF(dataInfo.RucSaasa),
					Descripcion: controller.valueUndefinedPDF(dataInfo.DTDescripcion),
					BaseLegalMaster: controller.valueUndefinedPDF(dataInfo.BaseLegalMaster),
					BaseLegalMasterCita: controller.valueUndefinedPDF(dataInfo.BaseLegalMasterCita),
					BaseLegalMasterMalaCond: controller.valueUndefinedPDF(dataInfo.BaseLegalMasterMalaCond),
					BaseLegalMasterMalaCondCita: controller.valueUndefinedPDF(dataInfo.BaseLegalMasterMalaCondCita),
					BaseLegalHouse: controller.valueUndefinedPDF(dataInfo.BaseLegalHouse),
					BaseLegalHouseCita: controller.valueUndefinedPDF(dataInfo.BaseLegalHouseCita),
					BaseLegalHouseMalaCond: controller.valueUndefinedPDF(dataInfo.BaseLegalHouseMalaCond),
					BaseLegalHouseMalaCondCita: controller.valueUndefinedPDF(dataInfo.BaseLegalHouseMalaCondCita),

					Titulo: "ActaInventarioHouse" + controller.valueUndefinedPDF(dataInfo.CodVolante),
					NumeroInventario: controller.valueUndefinedPDF(dataInfo),
					NumeroIngreso: controller.valueUndefinedPDF(dataInfo.CodVolante),
					MAWB: controller.valueUndefinedPDF(dataInfo.DTMasterCodigo),
					FechaLlegada: controller.valueUndefinedPDF(dataInfo.ManifiestoFechaLlegadaATAString),
					NumeroManifiesto: controller.valueUndefinedPDF(dataInfo.ManifiestoJurisdicionAduanera) + "-" + controller.valueUndefinedPDF(dataInfo.TransporteVia)
										+ "-" + controller.valueUndefinedPDF(dataInfo.ManifiestoAnio) + "-" + controller.valueUndefinedPDF(dataInfo.ManifiestoNumero),
					AgenteCarga: controller.valueUndefinedPDF(dataInfo.AgenteCargaDescripcion),
					Consignatario: controller.valueUndefinedPDF(dataInfo.ConsignatarioNombre),
					DiceContener: controller.valueUndefinedPDF(dataInfo.NumeroContenedor),
					PuntoOrigen: controller.valueUndefinedPDF(dataInfo.Origen) + " " + controller.valueUndefinedPDF(dataInfo.OrigenDescripcion),
					EmpresaTransportista: controller.valueUndefinedPDF(dataInfo.TransportistaNombre),
					NumeroVuelo: controller.valueUndefinedPDF(dataInfo.ItinerarioCodigoYata) + "-" + controller.valueUndefinedPDF(dataInfo.ItinerarioNroViaje),
					Almacen: controller.valueUndefinedPDF(dataInfo.UbicacionDescAlmacen),
					TipoCarga: controller.valueUndefinedPDF(dataInfo.TipoAlmacenamientoDescripcion),

					HAWB: controller.valueUndefinedPDF(dataInfo.DTCodigo),
					TerminoDescarga: controller.valueUndefinedPDF(dataInfo.FechaTerminoDescargaString),
					ModoIngreso: controller.valueUndefinedPDF(dataInfo.ModalidadDescripcion),
					aDetalle: {
						"BultosManifestados": controller.leftNumberUndefined(objDT.DTBultosManifestados),
						"BultosRecibidos": controller.leftNumberUndefined(objDT.DTBultosRecibidos),
						"BultosFaltantes": controller.leftNumberUndefined(objDT.DTBultosFaltantes),
						"BultosSobrantes": controller.leftNumberUndefined(objDT.DTBultosSobrantes),
						"BultosBuenos": controller.leftNumberUndefined(objDT.DTBultosBuenEstado),
						"BultosMalos": controller.leftNumberUndefined(objDT.DTBultosMalEstado),

						"PesoManifestados": parseFloat(controller.leftNumberUndefined(objDT.DTPesoManifestado)).toFixed(2),
						"PesoRecibidos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoRecibido)).toFixed(2),
						"PesoFaltantes": parseFloat(controller.leftNumberUndefined(objDT.DTPesoFaltante)).toFixed(2),
						"PesoSobrantes": parseFloat(controller.leftNumberUndefined(objDT.DTPesoSobrante)).toFixed(2),
						"PesoBuenos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoBuenEstado)).toFixed(2),
						"PesoMalos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoMalEstado)).toFixed(2),
					},
					Fotos: dataInfo.oFotos
				};
				return datosPdf;
			},
			mapExportPDFActaTrasladoHouse: function (dataInfo) {
				var objDT = dataInfo;
				var datosPdf = {
					DescripcionSaasa: controller.valueUndefinedPDF(dataInfo.DescripcionSaasa),
					DepositoTemporal: controller.valueUndefinedPDF(dataInfo.DTDepositoTemporalDescripcion),
					Titulo: "Anexo X Acta de Traslado" + controller.valueUndefinedPDF(dataInfo.CodVolante),
					RepresentanteLegalOrigen: controller.valueUndefinedPDF(dataInfo.RepresentanteLegalOrigen),
					RepresentanteLegalDestino: controller.valueUndefinedPDF(dataInfo.RepresentanteLegalDestino),
					NumeroManifiesto: controller.valueUndefinedPDF(dataInfo.ManifiestoJurisdicionAduanera) + "-" + controller.valueUndefinedPDF(dataInfo.TransporteVia)
										+ "-" + controller.valueUndefinedPDF(dataInfo.ManifiestoAnio) + "-" + controller.valueUndefinedPDF(dataInfo.ManifiestoNumero),
					Matricula: controller.valueUndefinedPDF(dataInfo.TransporteMatricula),
					Titulo: "Anexo X Acta de Traslado" + controller.valueUndefinedPDF(dataInfo.CodVolante),
					aDetalle: {
						"BultosManifestados": controller.leftNumberUndefined(objDT.DTBultosManifestados),
						"BultosRecibidos": controller.leftNumberUndefined(objDT.DTBultosRecibidos),
						"BultosFaltantes": controller.leftNumberUndefined(objDT.DTBultosFaltantes),
						"BultosSobrantes": controller.leftNumberUndefined(objDT.DTBultosSobrantes),
						"BultosBuenos": controller.leftNumberUndefined(objDT.DTBultosBuenEstado),
						"BultosMalos": controller.leftNumberUndefined(objDT.DTBultosMalEstado),

						"PesoManifestados": parseFloat(controller.leftNumberUndefined(objDT.DTPesoManifestado)).toFixed(2),
						"PesoRecibidos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoRecibido)).toFixed(2),
						"PesoFaltantes": parseFloat(controller.leftNumberUndefined(objDT.DTPesoFaltante)).toFixed(2),
						"PesoSobrantes": parseFloat(controller.leftNumberUndefined(objDT.DTPesoSobrante)).toFixed(2),
						"PesoBuenos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoBuenEstado)).toFixed(2),
						"PesoMalos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoMalEstado)).toFixed(2),
					}
				};
				return datosPdf;
			},
			mapExportPDFDescargaMercancia: function (dataInfo) {
				var aGeneral = [];
				var aDepositoTemporal = controller.removeDuplicatesGeneral(dataInfo,"DTDepositoTemporal");

				for (var i in aDepositoTemporal) {
					if (controller.valueUndefinedPDF(aDepositoTemporal[i].DTDepositoTemporal) != ""){
						var depositoTemporal = aDepositoTemporal[i].DTDepositoTemporal;
						var aGuia = dataInfo.filter(function (el) {
							return el["DTDepositoTemporal"] == depositoTemporal;
						});
						
						var dataCabecera = aGuia[0];
						
						var inicioTarja = false;
						if (dataCabecera.EstadoCodigo == "TE_MANIF_03" || dataCabecera.EstadoCodigo == "TE_MANIF_04"){
							inicioTarja = true;
						}
						
						var fechas_ini_tarja = [],fechas_fin_tarja = [];
						aGuia.forEach(function(e,index){
							fechas_ini_tarja.push(e.ManifiestoFechaInicioTarja);
							fechas_fin_tarja.push(e.ManifiestoFechaFinTarja);
						});
						
						var min_ini_tarja = new Date(Math.min.apply(null,fechas_ini_tarja));
						var max_fin_tarja = new Date(Math.max.apply(null,fechas_fin_tarja));
						
						var inicio = fechas_ini_tarja.filter(function(f) {
						  return f != null;
						});
						
						if (inicio.length == 0 || !inicioTarja){
							min_ini_tarja = "";
						}
						
						var fin = fechas_fin_tarja.filter(function(f) {
						  return f != null;
						});
						if (fin.length == 0){
							max_fin_tarja = "";
						}
				
						var datosPdf = {
							Titulo: "DescargaMercancia" + controller.valueUndefinedPDF(dataCabecera.CodVolante),
							RazonSocialAerolinea: controller.valueUndefinedPDF(dataCabecera.ItinerarioDescripcionTransportista),
							DireccionFiscalAerolinea: controller.valueUndefinedPDF(dataCabecera.ItinerarioDireccionTransportista),
							RucAerolinea: controller.valueUndefinedPDF(dataCabecera.ItinerarioCodigoTransportista),
							CompaniaTransportista: controller.valueUndefinedPDF(dataCabecera.TransportistaNombre),
							NumeroVuelo: controller.valueUndefinedPDF(dataCabecera.ItinerarioCodigoYata) + "-" + controller.valueUndefinedPDF(dataCabecera.ItinerarioNroViaje),
							FechaHoraLlegada: controller.valueUndefinedPDF(dataCabecera.ManifiestoFechaHoraLlegadaATAString),
							FechaHoraTerminoDescarga: controller.valueUndefinedPDF(dataCabecera.FechaHoraTerminoDescargaString),
							Manifiesto: controller.valueUndefinedPDF(dataCabecera.ManifiestoJurisdicionAduanera) + "-" + controller.valueUndefinedPDF(dataCabecera.TransporteVia) 
										+"-" + controller.valueUndefinedPDF(dataCabecera.ManifiestoAnio) + "-" + controller.valueUndefinedPDF(dataCabecera.ManifiestoNumero),
							Almacen: controller.valueUndefinedPDF(dataCabecera.DTDepositoTemporal), //Almacen: "4372",
							UltimoOrigenEmb: controller.valueUndefinedPDF(dataCabecera.ItinerarioOrigen),
							BaseLegalDescargaMercancia: controller.valueUndefinedPDF(dataCabecera.BaseLegalDescargaMercancia),
							ManifiestoFechaInicioTarja: controller.valueUndefinedPDF(controller.formatFechaDDMMAAAAHora(min_ini_tarja)),
							ManifiestoFechaFinTarja: controller.valueUndefinedPDF(controller.formatFechaDDMMAAAAHora(max_fin_tarja)),
							aDetalle: []
						};
						
						var inicioTarja = false;
						if (dataCabecera.EstadoCodigo == "TE_MANIF_03" || dataCabecera.EstadoCodigo == "TE_MANIF_04"){
							inicioTarja = true;
						}
					
						var totalBultosManif = 0.00;
						var totalBultosRec = 0.00;
						var totalBultosFalt = 0.00;
						var totalBultosSobr = 0.00;
						var totalBultosBueno = 0.00;
						var totalBultosMalo = 0.00;
		
						var totalPesoManif = 0.00;
						var totalPesoRec = 0.00;
						var totalPesoFalt = 0.00;
						var totalPesoSobr = 0.00;
						var totalPesoBueno = 0.00;
						var totalPesoMalo = 0.00;
						var contador = 0;
						for (var i in aGuia) {
							var objDT = aGuia[i];
							/*if (objDT.DTDepositoTemporal !== "4372") {
								continue;
							}*/
							contador = contador + 1;
							var obj = {
								"Numero": controller.leftNumberUndefined(objDT.DTNumeroDetalle),
								"DocumentoTransporteMaster": controller.valueUndefinedPDF(objDT.DTCodigo),
								"TipoBulto": controller.valueUndefinedPDF(objDT.DTTipoBultoDescripcion),
								"NumeroPrecinto": objDT.NumeroPrecinto ? controller.valueUndefinedPDF(objDT.NumeroPrecinto) : "S/P",
								"Consignatario": controller.valueUndefinedPDF(objDT.ConsignatarioNombre),
								"Descripcion": controller.valueUndefinedPDF(objDT.DTDescripcion),
								"DAM": controller.valueUndefinedPDF(objDT.DTDAM),
								"PuntoLlegada": controller.valueUndefinedPDF(objDT.PuntoLlegada),
								"PuntoLlegadaDescripcion": controller.valueUndefinedPDF(objDT.PuntoLlegadaDescripcion),
								"PuntoLlegadaRuc": controller.valueUndefinedPDF(objDT.PuntoLlegadaRuc),
								"ConsignatarioIdentificacion": controller.valueUndefinedPDF(objDT.ConsignatarioIdentificacion),
								"BultosManifestados": controller.leftNumberUndefined(objDT.DTBultosManifestados),
								"BultosRecibidos": controller.leftNumberUndefined(objDT.DTBultosRecibidos),
								"BultosFaltantes": controller.leftNumberUndefined(objDT.DTBultosFaltantes),
								"BultosSobrantes": controller.leftNumberUndefined(objDT.DTBultosSobrantes),
								"BultosBuenos": controller.leftNumberUndefined(objDT.DTBultosBuenEstado),
								"BultosMalos": controller.leftNumberUndefined(objDT.DTBultosMalEstado),
								"DTDepositoTemporalDescripcion": controller.valueUndefinedPDF(objDT.DTDepositoTemporalDescripcion),
								"DTDepositoTemporalRuc": controller.valueUndefinedPDF(objDT.DTDepositoTemporalRuc),
								"PesoManifestados": parseFloat(controller.leftNumberUndefined(objDT.DTPesoManifestado)).toFixed(2),
								"PesoRecibidos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoRecibido)).toFixed(2),
								"PesoFaltantes": parseFloat(controller.leftNumberUndefined(objDT.DTPesoFaltante)).toFixed(2),
								"PesoSobrantes": parseFloat(controller.leftNumberUndefined(objDT.DTPesoSobrante)).toFixed(2),
								"PesoBuenos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoBuenEstado)).toFixed(2),
								"PesoMalos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoMalEstado)).toFixed(2),
								"ContenedorTipoCarga": controller.valueUndefinedPDF(objDT.DTCondicionCargaDescripcion)
							};
							totalBultosManif = parseInt(totalBultosManif) + parseInt(obj.BultosManifestados);
							totalBultosRec = parseInt(totalBultosRec) + parseFloat(obj.BultosRecibidos);
							totalBultosFalt = parseInt(totalBultosFalt) + parseInt(obj.BultosFaltantes);
							totalBultosSobr = parseInt(totalBultosSobr) + parseInt(obj.BultosSobrantes);
							totalBultosBueno = parseInt(totalBultosBueno) + parseInt(obj.BultosBuenos);
							totalBultosMalo = parseInt(totalBultosMalo) + parseInt(obj.BultosMalos);
		
							totalPesoManif = (parseFloat(totalPesoManif) + parseFloat(obj.PesoManifestados)).toFixed(2);
							totalPesoRec = (parseFloat(totalPesoRec) + parseFloat(obj.PesoRecibidos)).toFixed(2);
							totalPesoFalt = (parseFloat(totalPesoFalt) + parseFloat(obj.PesoFaltantes)).toFixed(2);
							totalPesoSobr = (parseFloat(totalPesoSobr) + parseFloat(obj.PesoSobrantes)).toFixed(2);
							totalPesoBueno = (parseFloat(totalPesoBueno) + parseFloat(obj.PesoBuenos)).toFixed(2);
							totalPesoMalo = (parseFloat(totalPesoMalo) + parseFloat(obj.PesoMalos)).toFixed(2);
		
							if (obj.BultosRecibidos > 0){
								if (obj.BultosMalos != null && obj.BultosMalos == 0) {
									obj.Estado = "BUEN ESTADO";
								} else {
									obj.Estado = "MAL ESTADO";
								}	
							}
							
							datosPdf.aDetalle.push(obj);
						}
						datosPdf.CantidadDocumentos = controller.leftNumberUndefined(datosPdf.aDetalle.length);
						datosPdf.totalBultosManif = totalBultosManif.toString();
						datosPdf.totalBultosRec = totalBultosRec.toString();
						datosPdf.totalBultosFalt = totalBultosFalt.toString();
						datosPdf.totalBultosSobr = totalBultosSobr.toString();
						datosPdf.totalBultosBueno = totalBultosBueno.toString();
						datosPdf.totalBultosMalo = totalBultosMalo.toString();
		
						datosPdf.totalPesoManif = totalPesoManif.toString();
						datosPdf.totalPesoRec = totalPesoRec.toString();
						datosPdf.totalPesoFalt = totalPesoFalt.toString();
						datosPdf.totalPesoSobr = totalPesoSobr.toString();
						datosPdf.totalPesoBueno = totalPesoBueno.toString();
						datosPdf.totalPesoMalo = totalPesoMalo.toString();
						aGeneral.push(datosPdf);
					}		
				}

				return aGeneral;
			},
			mapExportPDFNotaContenido: function (dataInfo) {
				var fechas_ini_tarja = [],fechas_fin_tarja = [];
				dataInfo.forEach(function(e,index){
					fechas_ini_tarja.push(e.ManifiestoFechaInicioTarja);
					fechas_fin_tarja.push(e.ManifiestoFechaFinTarja);
				});
				
				var dataCabecera = dataInfo[0];
				
				var inicioTarja = false;
				if (dataCabecera.EstadoCodigo == "TE_MANIF_03" || dataCabecera.EstadoCodigo == "TE_MANIF_04"){
					inicioTarja = true;
				}
				
				var min_ini_tarja = new Date(Math.min.apply(null,fechas_ini_tarja));
				var max_fin_tarja = new Date(Math.max.apply(null,fechas_fin_tarja));
				
				var inicio = fechas_ini_tarja.filter(function(f) {
				  return f != null;
				});
				
				if (inicio.length == 0 || !inicioTarja){
					min_ini_tarja = "";
				}
				
				var fin = fechas_fin_tarja.filter(function(f) {
				  return f != null;
				});
				if (fin.length == 0){
					max_fin_tarja = "";
				}
				
				var datosPdf = {
					DireccionDepositoTemporal: controller.valueUndefinedPDF(dataCabecera.DireccionDepositoTemporal),
					DireccionFiscal: controller.valueUndefinedPDF(dataCabecera.DireccionFiscal),
					RucSaasa: controller.valueUndefinedPDF(dataCabecera.RucSaasa),
					DescripcionSaasa: controller.valueUndefinedPDF(dataCabecera.DescripcionSaasa),
					BaseLegalHouse: controller.valueUndefinedPDF(dataCabecera.BaseLegalHouse),
					BaseLegalHouseCita: controller.valueUndefinedPDF(dataCabecera.BaseLegalHouseCita),
					// DocumentosTransporte: controller.valueUndefinedPDF(dataCabecera.DocumentosTransporte),
					Titulo: "NotaContenido" + controller.valueUndefinedPDF(dataCabecera.CodVolante),

					Transportista: controller.valueUndefinedPDF(dataCabecera.TransportistaNombre),
					NroVueloViaje: controller.valueUndefinedPDF(dataCabecera.ItinerarioCodigoYata) + "-" + controller.valueUndefinedPDF(dataCabecera.ItinerarioNroViaje),
					ManifiestoCarga: controller.valueUndefinedPDF(dataCabecera.ManifiestoJurisdicionAduanera) + "-" + controller.valueUndefinedPDF(
						dataCabecera.TransporteVia) + "-" + controller.valueUndefinedPDF(dataCabecera.ManifiestoAnio) + "-" + controller.valueUndefinedPDF(dataCabecera.ManifiestoNumero),
					FechaHoraTerminoDescarga: controller.valueUndefinedPDF(dataCabecera.FechaHoraTerminoDescargaString),
					FechaHoraInicioRecepcion: controller.valueUndefinedPDF(controller.formatFechaDDMMAAAAHora(min_ini_tarja)),
					FechaHoraFinRecepcion: controller.valueUndefinedPDF(controller.formatFechaDDMMAAAAHora(max_fin_tarja)),
					FechaHoraLlegadaATA: controller.valueUndefinedPDF(dataCabecera.ManifiestoFechaHoraLlegadaATAString),
					aDetalle: []

				};
				
				var inicioTarja = false;
				if (dataCabecera.EstadoCodigo == "TE_MANIF_03" || dataCabecera.EstadoCodigo == "TE_MANIF_04"){
					inicioTarja = true;
				}
					
				var totalBultosManif = 0.00;
				var totalBultosRec = 0.00;
				var totalBultosFalt = 0.00;
				var totalBultosSobr = 0.00;
				var totalBultosBueno = 0.00;
				var totalBultosMalo = 0.00;

				var totalPesoManif = 0.00;
				var totalPesoRec = 0.00;
				var totalPesoFalt = 0.00;	
				var totalPesoSobr = 0.00;
				var totalPesoBueno = 0.00;
				var totalPesoMalo = 0.00;
				var contador = 0; 
				for (var i in dataInfo) {
					if (i != "oFotos"){
						var objDT = dataInfo[i];
						if (controller.leftNumberUndefined(objDT) != ""){
							var diferenciaPeso = ((parseFloat(controller.leftNumberUndefined(objDT.DTPesoManifestado))-parseFloat(controller.leftNumberUndefined(objDT.DTPesoRecibido)))*100)/parseFloat(controller.leftNumberUndefined(objDT.DTPesoManifestado));
							contador = contador + 1;
							var obj = {
								"Numero": controller.leftNumberUndefined(objDT.DTNumeroDetalle),
								"BultosManifestados": controller.leftNumberUndefined(objDT.DTBultosManifestados),
								"BultosRecibidos": controller.leftNumberUndefined(objDT.DTBultosRecibidos),
								"BultosFaltantes": controller.leftNumberUndefined(objDT.DTBultosFaltantes),
								"BultosSobrantes": controller.leftNumberUndefined(objDT.DTBultosSobrantes),
								"BultosBuenos": controller.leftNumberUndefined(objDT.DTBultosBuenEstado),
								"BultosMalos": controller.leftNumberUndefined(objDT.DTBultosMalEstado),
		
								"PesoManifestados": parseFloat(controller.leftNumberUndefined(objDT.DTPesoManifestado)).toFixed(2),
								"PesoRecibidos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoRecibido)).toFixed(2),
								"PesoFaltantes": parseFloat(controller.leftNumberUndefined(objDT.DTPesoFaltante)).toFixed(2),
								"PesoSobrantes": parseFloat(controller.leftNumberUndefined(objDT.DTPesoSobrante)).toFixed(2),
								"PesoBuenos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoBuenEstado)).toFixed(2),
								"PesoMalos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoMalEstado)).toFixed(2),
		
								"DiferenciaPeso": controller.valueDiferenciaPeso(diferenciaPeso),
		
								"DTCodigo": controller.valueUndefinedPDF(objDT.DTCodigo),
								"DTDescripcion": controller.valueUndefinedPDF(objDT.DTDescripcion),
								"VolumenManifestado": controller.valueUndefinedPDF(objDT.DTVolumenManifestado),
								"DTBultosMalEstado": controller.valueUndefinedPDF(objDT.DTBultosMalEstado),
							};
							obj.DiferenciaPeso = parseFloat(obj.DiferenciaPeso).toFixed(2) + " %";
							
							if (obj.BultosRecibidos > 0){
								if (obj.BultosMalos != null && obj.BultosMalos == 0) {
									obj.Estado = "BUEN ESTADO";
								} else {
									obj.Estado = "MAL ESTADO";
								}	
							}
								
							totalBultosManif = parseInt(totalBultosManif) + parseInt(obj.BultosManifestados);
							totalBultosRec = parseInt(totalBultosRec) + parseFloat(obj.BultosRecibidos);
							totalBultosFalt = parseInt(totalBultosFalt) + parseInt(obj.BultosFaltantes);
							totalBultosSobr = parseInt(totalBultosSobr) + parseInt(obj.BultosSobrantes);
							totalBultosBueno = parseInt(totalBultosBueno) + parseInt(obj.BultosBuenos);
							totalBultosMalo = parseInt(totalBultosMalo) + parseInt(obj.BultosMalos);
		
							totalPesoManif = (parseFloat(totalPesoManif) + parseFloat(obj.PesoManifestados)).toFixed(2);
							totalPesoRec = (parseFloat(totalPesoRec) + parseFloat(obj.PesoRecibidos)).toFixed(2);
							totalPesoFalt = (parseFloat(totalPesoFalt) + parseFloat(obj.PesoFaltantes)).toFixed(2);
							totalPesoSobr = (parseFloat(totalPesoSobr) + parseFloat(obj.PesoSobrantes)).toFixed(2);
							totalPesoBueno = (parseFloat(totalPesoBueno) + parseFloat(obj.PesoBuenos)).toFixed(2);
							totalPesoMalo = (parseFloat(totalPesoMalo) + parseFloat(obj.PesoMalos)).toFixed(2);
		
							datosPdf.aDetalle.push(obj);	
						}	
					}
				}
				datosPdf.totalBultosManif = totalBultosManif.toString();
				datosPdf.totalBultosRec = totalBultosRec.toString();
				datosPdf.totalBultosFalt = totalBultosFalt.toString();
				datosPdf.totalBultosSobr = totalBultosSobr.toString();
				datosPdf.totalBultosBueno = totalBultosBueno.toString();
				datosPdf.totalBultosMalo = totalBultosMalo.toString();

				datosPdf.totalPesoManif = totalPesoManif.toString();
				datosPdf.totalPesoRec = totalPesoRec.toString();
				datosPdf.totalPesoFalt = totalPesoFalt.toString();
				datosPdf.totalPesoSobr = totalPesoSobr.toString();
				datosPdf.totalPesoBueno = totalPesoBueno.toString();
				datosPdf.totalPesoMalo = totalPesoMalo.toString();

				return datosPdf;
			},
			mapExportPDFReporteTerminoDescarga: function (dataInfo) {
				var fechas_ini_tarja = [],fechas_fin_tarja = [];
				dataInfo.forEach(function(e,index){
					fechas_ini_tarja.push(e.ManifiestoFechaInicioTarja);
					fechas_fin_tarja.push(e.ManifiestoFechaFinTarja);
				});
				
				var inicioTarja = false;
				if (dataInfo.EstadoCodigo == "TE_MANIF_03" || dataInfo.EstadoCodigo == "TE_MANIF_04"){
					inicioTarja = true;
				}

				var min_ini_tarja = new Date(Math.min.apply(null,fechas_ini_tarja));
				var max_fin_tarja = new Date(Math.max.apply(null,fechas_fin_tarja));
				
				var inicio = fechas_ini_tarja.filter(function(f) {
				  return f != null;
				});
				if (inicio.length == 0 || !inicioTarja){
					min_ini_tarja = "";
				}
				
				var fin = fechas_fin_tarja.filter(function(f) {
				  return f != null;
				});
				if (fin.length == 0){
					max_fin_tarja = "";
				}
				
				var dataCabecera = dataInfo[0];
				var datosPdf = {
					DireccionDepositoTemporal: controller.valueUndefinedPDF(dataCabecera.DireccionDepositoTemporal),
					DireccionFiscal: controller.valueUndefinedPDF(dataCabecera.DireccionFiscal),
					RucSaasa: controller.valueUndefinedPDF(dataCabecera.RucSaasa),
					RazonSocialSaasa: controller.valueUndefinedPDF(dataCabecera.DescripcionSaasa),
					RazonSocialAerolinea: controller.valueUndefinedPDF(dataCabecera.ItinerarioDescripcionTransportista),
					RucAerolinea: controller.valueUndefinedPDF(dataCabecera.ItinerarioCodigoTransportista),
					Matricula: controller.valueUndefinedPDF(dataCabecera.TransporteMatricula),
					NumeroVuelo: controller.valueUndefinedPDF(dataCabecera.ItinerarioCodigoYata) + "-" + controller.valueUndefinedPDF(dataCabecera.ItinerarioNroViaje),
					Titulo: "Anexo VII Reporte Término de la Descarga/Embarque" + controller.valueUndefinedPDF(dataCabecera.CodVolante),

					Transportista: controller.valueUndefinedPDF(dataCabecera.TransportistaNombre),
					NroVueloViaje: controller.valueUndefinedPDF(dataCabecera.ItinerarioCodigoYata) + "-" + controller.valueUndefinedPDF(dataCabecera.ItinerarioNroViaje),
					ManifiestoCarga: controller.valueUndefinedPDF(dataCabecera.ManifiestoJurisdicionAduanera) + "-" + controller.valueUndefinedPDF(
						dataCabecera.TransporteVia) + "-" + controller.valueUndefinedPDF(dataCabecera.ManifiestoAnio) + "-" + controller.valueUndefinedPDF(dataCabecera.ManifiestoNumero),
					FechaHoraTerminoDescarga: controller.valueUndefinedPDF(dataCabecera.FechaHoraTerminoDescargaString),
					FechaHoraInicioRecepcion: controller.valueUndefinedPDF(controller.formatFechaDDMMAAAAHora(min_ini_tarja)),
					FechaHoraFinRecepcion: controller.valueUndefinedPDF(controller.formatFechaDDMMAAAAHora(max_fin_tarja)),
					FechaHoraLlegadaATA: controller.valueUndefinedPDF(dataCabecera.ManifiestoFechaHoraLlegadaATAString),
					ItinerarioCodigoAerolinea: controller.valueUndefinedPDF(dataCabecera.ItinerarioCodigoAerolinea),
					Nave: controller.valueUndefinedPDF(dataCabecera.NaveDescripcion),
					aDetalle: []

				};
				
				var inicioTarja = false;
				if (dataCabecera.EstadoCodigo == "TE_MANIF_03" || dataCabecera.EstadoCodigo == "TE_MANIF_04"){
					inicioTarja = true;
				}
					
				var totalBultosManif = 0.00;
				var totalBultosRec = 0.00;
				var totalBultosFalt = 0.00;
				var totalBultosSobr = 0.00;
				var totalBultosBueno = 0.00;
				var totalBultosMalo = 0.00;

				var totalPesoManif = 0.00;
				var totalPesoRec = 0.00;
				var totalPesoFalt = 0.00;	
				var totalPesoSobr = 0.00;
				var totalPesoBueno = 0.00;
				var totalPesoMalo = 0.00;
				var contador = 0; 
				for (var i in dataInfo) {
					var objDT = dataInfo[i];
					var diferenciaPeso = ((parseFloat(controller.leftNumberUndefined(objDT.DTPesoManifestado))-parseFloat(controller.leftNumberUndefined(objDT.DTPesoRecibido)))*100)/parseFloat(controller.leftNumberUndefined(objDT.DTPesoManifestado));
					contador = contador + 1;
					var obj = {
						"Numero": controller.leftNumberUndefined(objDT.DTNumeroDetalle),
						"BultosManifestados": controller.leftNumberUndefined(objDT.DTBultosManifestados),
						"BultosRecibidos": controller.leftNumberUndefined(objDT.DTBultosRecibidos),
						"BultosFaltantes": controller.leftNumberUndefined(objDT.DTBultosFaltantes),
						"BultosSobrantes": controller.leftNumberUndefined(objDT.DTBultosSobrantes),
						"BultosBuenos": controller.leftNumberUndefined(objDT.DTBultosBuenEstado),
						"BultosMalos": controller.leftNumberUndefined(objDT.DTBultosMalEstado),

						"PesoManifestados": parseFloat(controller.leftNumberUndefined(objDT.DTPesoManifestado)).toFixed(2),
						"PesoRecibidos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoRecibido)).toFixed(2),
						"PesoFaltantes": parseFloat(controller.leftNumberUndefined(objDT.DTPesoFaltante)).toFixed(2),
						"PesoSobrantes": parseFloat(controller.leftNumberUndefined(objDT.DTPesoSobrante)).toFixed(2),
						"PesoBuenos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoBuenEstado)).toFixed(2),
						"PesoMalos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoMalEstado)).toFixed(2),

						"DiferenciaPeso": controller.valueDiferenciaPeso(diferenciaPeso),

						"DTCodigo": controller.valueUndefinedPDF(objDT.DTCodigo),
						"DTDescripcion": controller.valueUndefinedPDF(objDT.DTDescripcion),
						"DTBultosMalEstado": controller.valueUndefinedPDF(objDT.DTBultosMalEstado),
					};
					obj.DiferenciaPeso = parseFloat(obj.DiferenciaPeso).toFixed(2) + " %";
					
					if (obj.BultosRecibidos > 0){
						if (obj.BultosMalos != null && obj.BultosMalos == 0) {
							obj.Estado = "BUEN ESTADO";
						} else {
							obj.Estado = "MAL ESTADO";
						}	
					}
						
					totalBultosManif = parseInt(totalBultosManif) + parseInt(obj.BultosManifestados);
					totalBultosRec = parseInt(totalBultosRec) + parseFloat(obj.BultosRecibidos);
					totalBultosFalt = parseInt(totalBultosFalt) + parseInt(obj.BultosFaltantes);
					totalBultosSobr = parseInt(totalBultosSobr) + parseInt(obj.BultosSobrantes);
					totalBultosBueno = parseInt(totalBultosBueno) + parseInt(obj.BultosBuenos);
					totalBultosMalo = parseInt(totalBultosMalo) + parseInt(obj.BultosMalos);

					totalPesoManif = (parseFloat(totalPesoManif) + parseFloat(obj.PesoManifestados)).toFixed(2);
					totalPesoRec = (parseFloat(totalPesoRec) + parseFloat(obj.PesoRecibidos)).toFixed(2);
					totalPesoFalt = (parseFloat(totalPesoFalt) + parseFloat(obj.PesoFaltantes)).toFixed(2);
					totalPesoSobr = (parseFloat(totalPesoSobr) + parseFloat(obj.PesoSobrantes)).toFixed(2);
					totalPesoBueno = (parseFloat(totalPesoBueno) + parseFloat(obj.PesoBuenos)).toFixed(2);
					totalPesoMalo = (parseFloat(totalPesoMalo) + parseFloat(obj.PesoMalos)).toFixed(2);

					datosPdf.aDetalle.push(obj);
				}
				datosPdf.totalBultosManif = totalBultosManif.toString();
				datosPdf.totalBultosRec = totalBultosRec.toString();
				datosPdf.totalBultosFalt = totalBultosFalt.toString();
				datosPdf.totalBultosSobr = totalBultosSobr.toString();
				datosPdf.totalBultosBueno = totalBultosBueno.toString();
				datosPdf.totalBultosMalo = totalBultosMalo.toString();

				datosPdf.totalPesoManif = totalPesoManif.toString();
				datosPdf.totalPesoRec = totalPesoRec.toString();
				datosPdf.totalPesoFalt = totalPesoFalt.toString();
				datosPdf.totalPesoSobr = totalPesoSobr.toString();
				datosPdf.totalPesoBueno = totalPesoBueno.toString();
				datosPdf.totalPesoMalo = totalPesoMalo.toString();
				return datosPdf;
			},
			mapExportPDFAnexo6MasterDirecta: function (dataInfo) {
				var aGeneral = [];
				var aDepositoTemporal = controller.removeDuplicatesGeneral(dataInfo,"DTDepositoTemporal");

				for (var i in aDepositoTemporal) {
					if (controller.valueUndefinedPDF(aDepositoTemporal[i].DTDepositoTemporal) != ""){
						var depositoTemporal = aDepositoTemporal[i].DTDepositoTemporal;
						var aGuia = dataInfo.filter(function (el) {
							return el["DTDepositoTemporal"] == depositoTemporal;
						});
	
						var dataCabecera = aGuia[0];
						var inicioTarja = false;
						if (dataCabecera.EstadoCodigo == "TE_MANIF_03" || dataCabecera.EstadoCodigo == "TE_MANIF_04"){
							inicioTarja = true;
						}
						
						var datosPdf = {
							RazonSocialAerolinea: controller.valueUndefinedPDF(dataCabecera.ItinerarioDescripcionTransportista),
							DireccionFiscalAerolinea: controller.valueUndefinedPDF(dataCabecera.ItinerarioDireccionTransportista),
							RucAerolinea: controller.valueUndefinedPDF(dataCabecera.ItinerarioCodigoTransportista),
							BaseLegalAnexo6MasterDirecta: controller.valueUndefinedPDF(dataCabecera.BaseLegalAnexo6MasterDirecta),
							Titulo: "AnexoIXMasterDirecta" + controller.valueUndefinedPDF(dataCabecera.CodVolante),
		
							FechaHoraLlegada: controller.valueUndefinedPDF(dataCabecera.ManifiestoFechaHoraLlegadaATAString),
							FechaHoraTerminoDescarga: controller.valueUndefinedPDF(dataCabecera.FechaHoraTerminoDescargaString),
							CompaniaTransportista: controller.valueUndefinedPDF(dataCabecera.TransportistaNombre),
							NumeroVuelo: controller.valueUndefinedPDF(dataCabecera.ItinerarioCodigoYata) + "-" + controller.valueUndefinedPDF(dataCabecera.ItinerarioNroViaje),
							EsMalEstado: controller.valueUndefinedPDF(dataCabecera.EsMalEstado),
							Manifiesto: controller.valueUndefinedPDF(dataCabecera.ManifiestoJurisdicionAduanera) + "-" + controller.valueUndefinedPDF(
								dataCabecera.TransporteVia) + "-" + controller.valueUndefinedPDF(dataCabecera.ManifiestoAnio) + "-" + controller.valueUndefinedPDF(dataCabecera.ManifiestoNumero),
							DepositoTemporal: controller.valueUndefinedPDF(dataCabecera.DTDepositoTemporal), //Almacen: "4372",
							FechaInicioTarja: !inicioTarja ? "" : controller.formatFechaDDMMAAAAHora(controller.valueUndefinedPDF(dataCabecera.ManifiestoFechaInicioTarja)),
							FechaFinTarja: !inicioTarja ? "" : controller.formatFechaDDMMAAAAHora(controller.valueUndefinedPDF(dataCabecera.ManifiestoFechaFinTarja)),
							aDetalle: []
						};
						
						//var esMalEstado = datosPdf.EsMalEstado == 1;
						
						var totalBultosManif = 0.00;
						var totalBultosRec = 0.00;
						var totalBultosFalt = 0.00;
						var totalBultosSobr = 0.00;
						var totalBultosBueno = 0.00;
						var totalBultosMalo = 0.00;
		
						var totalPesoManif = 0.00;
						var totalPesoRec = 0.00;
						var totalPesoFalt = 0.00;
						var totalPesoSobr = 0.00;
						var totalPesoBueno = 0.00;
						var totalPesoMalo = 0.00;
						var contador = 0;
						for (var i in aGuia) {
							var objDT = aGuia[i];
							/*if (objDT.DTDepositoTemporal !== "4372") {
								continue;
							}*/
							contador = contador + 1;
							var obj = {
								"Numero": controller.leftNumberUndefined(objDT.DTNumeroDetalle),
								"TipoManifiesto": controller.valueUndefinedPDF(objDT.ManifiestoCampoTipoManifiesto),
								"CodPto": controller.valueUndefinedPDF(objDT.Origen),
								"DocumentoTransporteMaster": controller.valueUndefinedPDF(objDT.DTCodigo),
								"DocumentoTransporteHouse": objDT.DTHouseCodigo ? controller.valueUndefinedPDF(objDT.DTHouseCodigo) : controller.valueUndefinedPDF(objDT.DTCodigo),
								"Consignatario": controller.valueUndefinedPDF(objDT.ConsignatarioNombre),
								"Descripcion": controller.valueUndefinedPDF(objDT.DTDescripcion),
		
								"BultosManifestados": controller.leftNumberUndefined(objDT.DTBultosManifestados),
								"BultosRecibidos": controller.leftNumberUndefined(objDT.DTBultosRecibidos),
								"BultosFaltantes": controller.leftNumberUndefined(objDT.DTBultosFaltantes),
								"BultosSobrantes": controller.leftNumberUndefined(objDT.DTBultosSobrantes),
								"BultosBuenos": controller.leftNumberUndefined(objDT.DTBultosBuenEstado),
								"BultosMalos": controller.leftNumberUndefined(objDT.DTBultosMalEstado),
		
								"PesoManifestados": parseFloat(controller.leftNumberUndefined(objDT.DTPesoManifestado)).toFixed(2),
								"PesoRecibidos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoRecibido)).toFixed(2),
								"PesoFaltantes": parseFloat(controller.leftNumberUndefined(objDT.DTPesoFaltante)).toFixed(2),
								"PesoSobrantes": parseFloat(controller.leftNumberUndefined(objDT.DTPesoSobrante)).toFixed(2),
								"PesoBuenos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoBuenEstado)).toFixed(2),
								"PesoMalos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoMalEstado)).toFixed(2),
		
								"ActaInventario": controller.leftNumberUndefined(objDT.DTBultosMalEstado) < 1 ? "" : controller.valueUndefinedPDF(objDT.ManifiestoActaInventarioNroFormato),
								"Incidencia": controller.leftNumberUndefined(objDT.DTBultosMalEstado) < 1 ? "" : controller.valueUndefinedPDF(objDT.ManifiestoNumeroIncidencia),
								"DescripcionIncidencia": controller.leftNumberUndefined(objDT.DTBultosMalEstado) < 1 ? "" : controller.valueUndefinedPDF(objDT.ManifiestoActaInventarioObs),
								"DiferenciaPeso": (parseFloat(controller.leftNumberUndefined(objDT.DTPesoRecibido)) == 0 ? 0 : parseFloat(controller.leftNumberUndefined(
									objDT.DTPesoManifestado)) / parseFloat(controller.leftNumberUndefined(objDT.DTPesoRecibido))).toString()
							};
							obj.DiferenciaPeso = parseFloat(obj.DiferenciaPeso).toFixed(2) + " %";
							totalBultosManif = parseInt(totalBultosManif) + parseInt(obj.BultosManifestados);
							totalBultosRec = parseInt(totalBultosRec) + parseFloat(obj.BultosRecibidos);
							totalBultosFalt = parseInt(totalBultosFalt) + parseInt(obj.BultosFaltantes);
							totalBultosSobr = parseInt(totalBultosSobr) + parseInt(obj.BultosSobrantes);
							totalBultosBueno = parseInt(totalBultosBueno) + parseInt(obj.BultosBuenos);
							totalBultosMalo = parseInt(totalBultosMalo) + parseInt(obj.BultosMalos);
		
							totalPesoManif = (parseFloat(totalPesoManif) + parseFloat(obj.PesoManifestados)).toFixed(2);
							totalPesoRec = (parseFloat(totalPesoRec) + parseFloat(obj.PesoRecibidos)).toFixed(2);
							totalPesoFalt = (parseFloat(totalPesoFalt) + parseFloat(obj.PesoFaltantes)).toFixed(2);
							totalPesoSobr = (parseFloat(totalPesoSobr) + parseFloat(obj.PesoSobrantes)).toFixed(2);
							totalPesoBueno = (parseFloat(totalPesoBueno) + parseFloat(obj.PesoBuenos)).toFixed(2);
							totalPesoMalo = (parseFloat(totalPesoMalo) + parseFloat(obj.PesoMalos)).toFixed(2);
		
							datosPdf.aDetalle.push(obj);
						}
						datosPdf.CantidadDocumentos = controller.leftNumberUndefined(datosPdf.aDetalle.length);
						datosPdf.totalBultosManif = totalBultosManif.toString();
						datosPdf.totalBultosRec = totalBultosRec.toString();
						datosPdf.totalBultosFalt = totalBultosFalt.toString();
						datosPdf.totalBultosSobr = totalBultosSobr.toString();
						datosPdf.totalBultosBueno = totalBultosBueno.toString();
						datosPdf.totalBultosMalo = totalBultosMalo.toString();
		
						datosPdf.totalPesoManif = totalPesoManif.toString();
						datosPdf.totalPesoRec = totalPesoRec.toString();
						datosPdf.totalPesoFalt = totalPesoFalt.toString();
						datosPdf.totalPesoSobr = totalPesoSobr.toString();
						datosPdf.totalPesoBueno = totalPesoBueno.toString();
						datosPdf.totalPesoMalo = totalPesoMalo.toString();
						aGeneral.push(datosPdf);	
					}
					
				}

				return aGeneral;
			},
			mapExportPDFAnexo6House: function (dataInfo) {
				var aGeneral = [];
				var master = dataInfo.filter(function (el) {
						return el["DTMasterCodigo"] == null;
					});
				var hijas = dataInfo.filter(function (el) {
						return el["DTMasterCodigo"] != null;
					});

					
				for (var i in master) {
					var dataCabecera = master[i];
					
					var filterHijas = hijas.filter(function (el) {
						return el["DTMasterCodigo"] == master[i]["DTCodigo"];
					});
					
					var inicioTarja = false;
					if (dataCabecera.EstadoCodigo == "TE_MANIF_03" || dataCabecera.EstadoCodigo == "TE_MANIF_04"){
						inicioTarja = true;
					}
				
					var datosPdf = {
						DireccionFiscal: controller.valueUndefinedPDF(dataCabecera.DireccionFiscal),
						RucSaasa: controller.valueUndefinedPDF(dataCabecera.RucSaasa),
						DescripcionSaasa: controller.valueUndefinedPDF(dataCabecera.DescripcionSaasa),
						BaseLegalAnexo6House: controller.valueUndefinedPDF(dataCabecera.BaseLegalAnexo6House),
						Titulo: "AnexoIXHouse" + controller.valueUndefinedPDF(dataCabecera.CodVolante),

						AgenteCargaInternacional: controller.valueUndefinedPDF(dataCabecera.AgenteCargaDescripcion),
						FechaHoraLlegada: controller.valueUndefinedPDF(dataCabecera.ManifiestoFechaHoraLlegadaATAString),
						FechaHoraTerminoDescarga: controller.valueUndefinedPDF(dataCabecera.FechaHoraTerminoDescargaString),
						CompaniaTransportista: controller.valueUndefinedPDF(dataCabecera.TransportistaNombre),
						NumeroVuelo: controller.valueUndefinedPDF(dataCabecera.ItinerarioCodigoYata) + "-" + controller.valueUndefinedPDF(dataCabecera.ItinerarioNroViaje),
						Manifiesto: controller.valueUndefinedPDF(dataCabecera.ManifiestoJurisdicionAduanera) + "-" + controller.valueUndefinedPDF(
						dataCabecera.TransporteVia) + "-" + controller.valueUndefinedPDF(dataCabecera.ManifiestoAnio) + "-" + controller.valueUndefinedPDF(dataCabecera.ManifiestoNumero),
						DepositoTemporal: "4372", //controller.valueUndefinedPDF(dataCabecera.DTDepositoTemporalDescripcion),
						FechaInicioTarja: !inicioTarja ? "" : controller.formatFechaDDMMAAAAHora(controller.valueUndefinedPDF(dataCabecera.ManifiestoFechaInicioTarja)),
						FechaFinTarja: !inicioTarja ? "" : controller.formatFechaDDMMAAAAHora(controller.valueUndefinedPDF(dataCabecera.ManifiestoFechaFinTarja)),
						EsMalEstado: controller.valueUndefinedPDF(dataCabecera.EsMalEstado),
						aDetalle: []
					};
					
					var esMalEstado = datosPdf.EsMalEstado == 1;
					
					var totalBultosManif = 0.00;
					var totalBultosRec = 0.00;
					var totalBultosFalt = 0.00;
					var totalBultosSobr = 0.00;
					var totalBultosBueno = 0.00;
					var totalBultosMalo = 0.00;

					var totalPesoManif = 0.00;
					var totalPesoRec = 0.00;
					var totalPesoFalt = 0.00;
					var totalPesoSobr = 0.00;
					var totalPesoBueno = 0.00;
					var totalPesoMalo = 0.00;
					var contador = 0;
					for (var i in filterHijas) {
						var objDT = filterHijas[i];
						if (objDT.DTDepositoTemporal !== "4372") {
							continue;
						}
						contador = contador + 1;
						var obj = {
							"Numero": controller.leftNumberUndefined(objDT.DTNumeroDetalle),
							"TipoManifiesto": controller.valueUndefinedPDF(objDT.ManifiestoTipo),
							"CodPto": controller.valueUndefinedPDF(objDT.Origen),
							"DocumentoTransporteMaster": controller.valueUndefinedPDF(objDT.DTMasterCodigo),
							"DocumentoTransporteHouse": controller.valueUndefinedPDF(objDT.DTCodigo),
							"Consignatario": controller.valueUndefinedPDF(objDT.ConsignatarioNombre),
							"Descripcion": controller.valueUndefinedPDF(objDT.DTDescripcion),

							"BultosManifestados": controller.leftNumberUndefined(objDT.DTBultosManifestados),
							"BultosRecibidos": controller.leftNumberUndefined(objDT.DTBultosRecibidos),
							"BultosFaltantes": controller.leftNumberUndefined(objDT.DTBultosFaltantes),
							"BultosSobrantes": controller.leftNumberUndefined(objDT.DTBultosSobrantes),
							"BultosBuenos": controller.leftNumberUndefined(objDT.DTBultosBuenEstado),
							"BultosMalos": controller.leftNumberUndefined(objDT.DTBultosMalEstado),

							"PesoManifestados": parseFloat(controller.leftNumberUndefined(objDT.DTPesoManifestado)).toFixed(2),
							"PesoRecibidos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoRecibido)).toFixed(2),
							"PesoFaltantes": parseFloat(controller.leftNumberUndefined(objDT.DTPesoFaltante)).toFixed(2),
							"PesoSobrantes": parseFloat(controller.leftNumberUndefined(objDT.DTPesoSobrante)).toFixed(2),
							"PesoBuenos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoBuenEstado)).toFixed(2),
							"PesoMalos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoMalEstado)).toFixed(2),

							"ActaInventario": controller.leftNumberUndefined(objDT.DTBultosMalEstado) < 1 ? "" : controller.valueUndefinedPDF(objDT.ManifiestoActaInventarioNroFormato),
							"Incidencia": controller.leftNumberUndefined(objDT.DTBultosMalEstado) < 1 ? "" : controller.valueUndefinedPDF(objDT.ManifiestoNumeroIncidencia),
							"DescripcionIncidencia": controller.leftNumberUndefined(objDT.DTBultosMalEstado) < 1 ? "" : controller.valueUndefinedPDF(objDT.ManifiestoActaInventarioObs),
							"DiferenciaPeso": (parseFloat(controller.leftNumberUndefined(objDT.DTPesoRecibido)) == 0 ? 0 : parseFloat(controller.leftNumberUndefined(
									objDT.DTPesoManifestado)) / parseFloat(controller.leftNumberUndefined(objDT.DTPesoRecibido))).toString()
						};
						obj.DiferenciaPeso = parseFloat(obj.DiferenciaPeso).toFixed(2) + " %";
						totalBultosManif = parseInt(totalBultosManif) + parseInt(obj.BultosManifestados);
						totalBultosRec = parseInt(totalBultosRec) + parseFloat(obj.BultosRecibidos);
						totalBultosFalt = parseInt(totalBultosFalt) + parseInt(obj.BultosFaltantes);
						totalBultosSobr = parseInt(totalBultosSobr) + parseInt(obj.BultosSobrantes);
						totalBultosBueno = parseInt(totalBultosBueno) + parseInt(obj.BultosBuenos);
						totalBultosMalo = parseInt(totalBultosMalo) + parseInt(obj.BultosMalos);

						totalPesoManif = (parseFloat(totalPesoManif) + parseFloat(obj.PesoManifestados)).toFixed(2);
						totalPesoRec = (parseFloat(totalPesoRec) + parseFloat(obj.PesoRecibidos)).toFixed(2);
						totalPesoFalt = (parseFloat(totalPesoFalt) + parseFloat(obj.PesoFaltantes)).toFixed(2);
						totalPesoSobr = (parseFloat(totalPesoSobr) + parseFloat(obj.PesoSobrantes)).toFixed(2);
						totalPesoBueno = (parseFloat(totalPesoBueno) + parseFloat(obj.PesoBuenos)).toFixed(2);
						totalPesoMalo = (parseFloat(totalPesoMalo) + parseFloat(obj.PesoMalos)).toFixed(2);

						datosPdf.aDetalle.push(obj);
					}
					datosPdf.CantidadDocumentos = controller.leftNumberUndefined(datosPdf.aDetalle.length);
					datosPdf.totalBultosManif = totalBultosManif.toString();
					datosPdf.totalBultosRec = totalBultosRec.toString();
					datosPdf.totalBultosFalt = totalBultosFalt.toString();
					datosPdf.totalBultosSobr = totalBultosSobr.toString();
					datosPdf.totalBultosBueno = totalBultosBueno.toString();
					datosPdf.totalBultosMalo = totalBultosMalo.toString();

					datosPdf.totalPesoManif = totalPesoManif.toString();
					datosPdf.totalPesoRec = totalPesoRec.toString();
					datosPdf.totalPesoFalt = totalPesoFalt.toString();
					datosPdf.totalPesoSobr = totalPesoSobr.toString();
					datosPdf.totalPesoBueno = totalPesoBueno.toString();
					datosPdf.totalPesoMalo = totalPesoMalo.toString();
					
					aGeneral.push(datosPdf);
				}

				return aGeneral;
			},
			mapExportPDFAnexo7General: function (dataInfo) {
				
				var dataCabecera = dataInfo[0];
				
				var fechas_ini_tarja = [],fechas_fin_tarja = [];
				dataInfo.forEach(function(e,index){
					fechas_ini_tarja.push(e.ManifiestoFechaInicioTarja);
					fechas_fin_tarja.push(e.ManifiestoFechaFinTarja);
				});
				
				var inicioTarja = false;
				if (dataCabecera.EstadoCodigo == "TE_MANIF_03" || dataCabecera.EstadoCodigo == "TE_MANIF_04"){
					inicioTarja = true;
				}
				
				var min_ini_tarja = new Date(Math.min.apply(null,fechas_ini_tarja));
				var max_fin_tarja = new Date(Math.max.apply(null,fechas_fin_tarja));
				
				var inicio = fechas_ini_tarja.filter(function(f) {
				  return f != null;
				});
				if (inicio.length == 0 || !inicioTarja){
					min_ini_tarja = "";
				}
				
				var fin = fechas_fin_tarja.filter(function(f) {
				  return f != null;
				});
				if (fin.length == 0){
					max_fin_tarja = "";
				}
				
				var datosPdf = {
					DireccionFiscal: controller.valueUndefinedPDF(dataCabecera.DireccionFiscal),
					RucSaasa: controller.valueUndefinedPDF(dataCabecera.RucSaasa),
					DescripcionSaasa: controller.valueUndefinedPDF(dataCabecera.DescripcionSaasa),
					BaseLegalAnexo7General: controller.valueUndefinedPDF(dataCabecera.BaseLegalAnexo7General),
					Titulo: "AnexoVGeneral" + controller.valueUndefinedPDF(dataCabecera.CodVolante),

					CompaniaTransportista: controller.valueUndefinedPDF(dataCabecera.TransportistaNombre),
					FechaHoraLlegada: controller.valueUndefinedPDF(dataCabecera.ManifiestoFechaHoraLlegadaATAString),
					FechaHoraTerminoDescarga: controller.valueUndefinedPDF(dataCabecera.FechaHoraTerminoDescargaString),
					EsMalEstado: controller.valueUndefinedPDF(dataCabecera.EsMalEstado),
					NumeroVuelo: controller.valueUndefinedPDF(dataCabecera.ItinerarioCodigoYata) + "-" + controller.valueUndefinedPDF(dataCabecera.ItinerarioNroViaje),
					FechaHoraInicioRecepcion: controller.valueUndefinedPDF(controller.formatFechaDDMMAAAAHora(min_ini_tarja)),//controller.valueUndefinedPDF(dataCabecera.DTFechaIngresoSAASAString),
					FechaHoraFinRecepcion: controller.valueUndefinedPDF(controller.formatFechaDDMMAAAAHora(max_fin_tarja)),//controller.valueUndefinedPDF(dataInfo[dataInfo.length-1].DTFechaIngresoSAASAString),
					Manifiesto: controller.valueUndefinedPDF(dataCabecera.ManifiestoJurisdicionAduanera) + "-" + controller.valueUndefinedPDF(
						dataCabecera.TransporteVia) + "-" + controller.valueUndefinedPDF(dataCabecera.ManifiestoAnio) + "-" + controller.valueUndefinedPDF(dataCabecera.ManifiestoNumero),
					Almacen: "4372",
					UltimoOrigenEmb: controller.valueUndefinedPDF(dataCabecera.ItinerarioOrigen),
					aDetalle: []
				};
				
				var esMalEstado = datosPdf.EsMalEstado == 1;
				
				var totalBultosManif = 0.00;
				var totalBultosRec = 0.00;
				var totalBultosFalt = 0.00;
				var totalBultosSobr = 0.00;
				var totalBultosBueno = 0.00;
				var totalBultosMalo = 0.00;

				var totalPesoManif = 0.00;
				var totalPesoRec = 0.00;
				var totalPesoFalt = 0.00;
				var totalPesoSobr = 0.00;
				var totalPesoBueno = 0.00;
				var totalPesoMalo = 0.00;
				var contador = 0;
				for (var i in dataInfo) {
					var objDT = dataInfo[i];
					if (objDT.DTDepositoTemporal !== "4372") {
						continue;
					}
					contador = contador + 1;
					var obj = {
						"Numero": controller.leftNumberUndefined(objDT.DTNumeroDetalle),
						"DocumentoTransporteMaster": objDT.DTMasterCodigo ? controller.valueUndefinedPDF(objDT.DTMasterCodigo) : controller.valueUndefinedPDF(objDT.DTCodigo),
						"DocumentoTransporteHouse": controller.valueUndefinedPDF(objDT.DTCodigo),
						"TipoBulto": controller.valueUndefinedPDF(objDT.DTTipoBultoDescripcion),
						"NumeroPrecinto": objDT.NumeroPrecinto ? controller.valueUndefinedPDF(objDT.NumeroPrecinto) : "S/P",

						"Consignatario": controller.valueUndefinedPDF(objDT.ConsignatarioNombre),
						"Descripcion": controller.valueUndefinedPDF(objDT.DTDescripcion),

						"BultosManifestados": controller.leftNumberUndefined(objDT.DTBultosManifestados),
						"BultosRecibidos": controller.leftNumberUndefined(objDT.DTBultosRecibidos),
						"BultosFaltantes": controller.leftNumberUndefined(objDT.DTBultosFaltantes),
						"BultosSobrantes": controller.leftNumberUndefined(objDT.DTBultosSobrantes),
						"BultosBuenos": controller.leftNumberUndefined(objDT.DTBultosBuenEstado),
						"BultosMalos": controller.leftNumberUndefined(objDT.DTBultosMalEstado),

						"PesoManifestados": parseFloat(controller.leftNumberUndefined(objDT.DTPesoManifestado)).toFixed(2),
						"PesoRecibidos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoRecibido)).toFixed(2),
						"PesoFaltantes": parseFloat(controller.leftNumberUndefined(objDT.DTPesoFaltante)).toFixed(2),
						"PesoSobrantes": parseFloat(controller.leftNumberUndefined(objDT.DTPesoSobrante)).toFixed(2),
						"PesoBuenos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoBuenEstado)).toFixed(2),
						"PesoMalos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoMalEstado)).toFixed(2),

						"ActaInventario": controller.valueUndefinedPDF(objDT.ManifiestoActaInventarioNroFormato),
						"DiferenciaPeso": (parseFloat(controller.leftNumberUndefined(objDT.DTPesoRecibido)) == 0 ? 0 : parseFloat(controller.leftNumberUndefined(
							objDT.DTPesoManifestado)) / parseFloat(controller.leftNumberUndefined(objDT.DTPesoRecibido))).toString()
					};
					obj.DiferenciaPeso = parseFloat(obj.DiferenciaPeso).toFixed(2) + " %";
					if (objDT.DTEsMaster != "2") {
						totalBultosManif = parseInt(totalBultosManif) + parseInt(obj.BultosManifestados);
						totalBultosRec = parseInt(totalBultosRec) + parseFloat(obj.BultosRecibidos);
						totalBultosFalt = parseInt(totalBultosFalt) + parseInt(obj.BultosFaltantes);
						totalBultosSobr = parseInt(totalBultosSobr) + parseInt(obj.BultosSobrantes);
						totalBultosBueno = parseInt(totalBultosBueno) + parseInt(obj.BultosBuenos);
						totalBultosMalo = parseInt(totalBultosMalo) + parseInt(obj.BultosMalos);

						totalPesoManif = (parseFloat(totalPesoManif) + parseFloat(obj.PesoManifestados)).toFixed(2);
						totalPesoRec = (parseFloat(totalPesoRec) + parseFloat(obj.PesoRecibidos)).toFixed(2);
						totalPesoFalt = (parseFloat(totalPesoFalt) + parseFloat(obj.PesoFaltantes)).toFixed(2);
						totalPesoSobr = (parseFloat(totalPesoSobr) + parseFloat(obj.PesoSobrantes)).toFixed(2);
						totalPesoBueno = (parseFloat(totalPesoBueno) + parseFloat(obj.PesoBuenos)).toFixed(2);
						totalPesoMalo = (parseFloat(totalPesoMalo) + parseFloat(obj.PesoMalos)).toFixed(2);
					}
					
					if (obj.BultosRecibidos > 0){
						if (obj.BultosMalos != null && obj.BultosMalos == 0) {
							obj.Estado = "BUEN ESTADO";
						} else {
							obj.Estado = "MAL ESTADO";
						}	
					}
					
					datosPdf.aDetalle.push(obj);
				}
				datosPdf.CantidadDocumentos = controller.leftNumberUndefined(datosPdf.aDetalle.length);
				datosPdf.totalBultosManif = totalBultosManif.toString();
				datosPdf.totalBultosRec = totalBultosRec.toString();
				datosPdf.totalBultosFalt = totalBultosFalt.toString();
				datosPdf.totalBultosSobr = totalBultosSobr.toString();
				datosPdf.totalBultosBueno = totalBultosBueno.toString();
				datosPdf.totalBultosMalo = totalBultosMalo.toString();

				datosPdf.totalPesoManif = totalPesoManif.toString();
				datosPdf.totalPesoRec = totalPesoRec.toString();
				datosPdf.totalPesoFalt = totalPesoFalt.toString();
				datosPdf.totalPesoSobr = totalPesoSobr.toString();
				datosPdf.totalPesoBueno = totalPesoBueno.toString();
				datosPdf.totalPesoMalo = totalPesoMalo.toString();
				return datosPdf;
			},
			mapExportPDFAnexo7Master: function (dataInfo) {
				var dataCabecera = dataInfo[0];
				var datosPdf = {
					DireccionFiscal: controller.valueUndefinedPDF(dataCabecera.DireccionFiscal),
					RucSaasa: controller.valueUndefinedPDF(dataCabecera.RucSaasa),
					DescripcionSaasa: controller.valueUndefinedPDF(dataCabecera.DescripcionSaasa),
					BaseLegalAnexo7Master: controller.valueUndefinedPDF(dataCabecera.BaseLegalAnexo7Master),
					Titulo: "Anexo7Master" + controller.valueUndefinedPDF(dataCabecera),

					FechaHoraLlegada: controller.valueUndefinedPDF(dataCabecera.ManifiestoFechaHoraLlegadaATAString),
					FechaHoraTerminoDescarga: controller.valueUndefinedPDF(dataCabecera.FechaHoraTerminoDescargaString),
					CompaniaTransportista: controller.valueUndefinedPDF(dataCabecera.TransportistaNombre),
					NumeroVuelo: controller.valueUndefinedPDF(dataCabecera.ItinerarioCodigoYata) + "-" + controller.valueUndefinedPDF(dataCabecera.ItinerarioNroViaje),
					Manifiesto: controller.valueUndefinedPDF(dataCabecera.ManifiestoJurisdicionAduanera) + "-" + controller.valueUndefinedPDF(dataCabecera.TransporteVia) 
								+ "-" + controller.valueUndefinedPDF(dataCabecera.ManifiestoAnio) + "-" + controller.valueUndefinedPDF(dataCabecera.ManifiestoNumero),
					FechaHoraInicioRecepcion: controller.valueUndefinedPDF(dataCabecera.ManifiestoFechaHoraInicioTarjaString),
					FechaHoraFinRecepcion: controller.valueUndefinedPDF(dataCabecera.ManifiestoFechaHoraFinTarjaString),
					Almacen: "4372",
					UltimoOrigenEmb: controller.valueUndefinedPDF(dataCabecera.ItinerarioOrigen),
					aDetalle: []
				};
				
				var inicioTarja = false;
				if (dataCabecera.EstadoCodigo == "TE_MANIF_03" || dataCabecera.EstadoCodigo == "TE_MANIF_04"){
					inicioTarja = true;
				}
					
				var totalBultosManif = 0.00;
				var totalBultosRec = 0.00;
				var totalBultosFalt = 0.00;
				var totalBultosSobr = 0.00;
				var totalBultosBueno = 0.00;
				var totalBultosMalo = 0.00;

				var totalPesoManif = 0.00;
				var totalPesoRec = 0.00;
				var totalPesoFalt = 0.00;
				var totalPesoSobr = 0.00;
				var totalPesoBueno = 0.00;
				var totalPesoMalo = 0.00;
				var contador = 0;
				for (var i in dataInfo) {
					var objDT = dataInfo[i];
					if (objDT.DTDepositoTemporal !== "4372") {
						continue;
					}
					contador = contador + 1;
					var obj = {
						"Numero": controller.leftNumberUndefined(objDT.DTNumeroDetalle),
						"DocumentoTransporte": controller.valueUndefinedPDF(objDT.DTCodigo),
						"TipoBulto": controller.valueUndefinedPDF(objDT.DTTipoBultoDescripcion),
						"NumeroPrecinto": objDT.NumeroPrecinto ? controller.valueUndefinedPDF(objDT.NumeroPrecinto) : "S/P",

						"Consignatario": controller.valueUndefinedPDF(objDT.ConsignatarioNombre),
						"Descripcion": controller.valueUndefinedPDF(objDT.DTDescripcion),

						"BultosManifestados": controller.leftNumberUndefined(objDT.DTBultosManifestados),
						"BultosRecibidos": controller.leftNumberUndefined(objDT.DTBultosRecibidos),
						"BultosFaltantes": controller.leftNumberUndefined(objDT.DTBultosFaltantes),
						"BultosSobrantes": controller.leftNumberUndefined(objDT.DTBultosSobrantes),
						"BultosBuenos": controller.leftNumberUndefined(objDT.DTBultosBuenEstado),
						"BultosMalos": controller.leftNumberUndefined(objDT.DTBultosMalEstado),

						"PesoManifestados": parseFloat(controller.leftNumberUndefined(objDT.DTPesoManifestado)).toFixed(2),
						"PesoRecibidos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoRecibido)).toFixed(2),
						"PesoFaltantes": parseFloat(controller.leftNumberUndefined(objDT.DTPesoFaltante)).toFixed(2),
						"PesoSobrantes": parseFloat(controller.leftNumberUndefined(objDT.DTPesoSobrante)).toFixed(2),
						"PesoBuenos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoBuenEstado)).toFixed(2),
						"PesoMalos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoMalEstado)).toFixed(2),

						"ActaInventario": controller.valueUndefinedPDF(objDT.ManifiestoActaInventarioNroFormato),
						"DiferenciaPeso": (parseFloat(controller.leftNumberUndefined(objDT.DTPesoRecibido)) == 0 ? 0 : parseFloat(controller.leftNumberUndefined(
							objDT.DTPesoManifestado)) / parseFloat(controller.leftNumberUndefined(objDT.DTPesoRecibido))).toString()
					};
					obj.DiferenciaPeso = parseFloat(obj.DiferenciaPeso).toFixed(2) + " %";
					totalBultosManif = parseInt(totalBultosManif) + parseInt(obj.BultosManifestados);
					totalBultosRec = parseInt(totalBultosRec) + parseFloat(obj.BultosRecibidos);
					totalBultosFalt = parseInt(totalBultosFalt) + parseInt(obj.BultosFaltantes);
					totalBultosSobr = parseInt(totalBultosSobr) + parseInt(obj.BultosSobrantes);
					totalBultosBueno = parseInt(totalBultosBueno) + parseInt(obj.BultosBuenos);
					totalBultosMalo = parseInt(totalBultosMalo) + parseInt(obj.BultosMalos);

					totalPesoManif = (parseFloat(totalPesoManif) + parseFloat(obj.PesoManifestados)).toFixed(2);
					totalPesoRec = (parseFloat(totalPesoRec) + parseFloat(obj.PesoRecibidos)).toFixed(2);
					totalPesoFalt = (parseFloat(totalPesoFalt) + parseFloat(obj.PesoFaltantes)).toFixed(2);
					totalPesoSobr = (parseFloat(totalPesoSobr) + parseFloat(obj.PesoSobrantes)).toFixed(2);
					totalPesoBueno = (parseFloat(totalPesoBueno) + parseFloat(obj.PesoBuenos)).toFixed(2);
					totalPesoMalo = (parseFloat(totalPesoMalo) + parseFloat(obj.PesoMalos)).toFixed(2);
					
					if (obj.BultosRecibidos > 0){
						if (obj.BultosMalos != null && obj.BultosMalos == 0) {
							obj.Estado = "BUEN ESTADO";
						} else {
							obj.Estado = "MAL ESTADO";
						}	
					}
					
					obj.Observaciones = "";
					datosPdf.aDetalle.push(obj);
				}
				datosPdf.CantidadDocumentos = controller.leftNumberUndefined(datosPdf.aDetalle.length);
				datosPdf.totalBultosManif = totalBultosManif.toString();
				datosPdf.totalBultosRec = totalBultosRec.toString();
				datosPdf.totalBultosFalt = totalBultosFalt.toString();
				datosPdf.totalBultosSobr = totalBultosSobr.toString();
				datosPdf.totalBultosBueno = totalBultosBueno.toString();
				datosPdf.totalBultosMalo = totalBultosMalo.toString();

				datosPdf.totalPesoManif = totalPesoManif.toString();
				datosPdf.totalPesoRec = totalPesoRec.toString();
				datosPdf.totalPesoFalt = totalPesoFalt.toString();
				datosPdf.totalPesoSobr = totalPesoSobr.toString();
				datosPdf.totalPesoBueno = totalPesoBueno.toString();
				datosPdf.totalPesoMalo = totalPesoMalo.toString();
				return datosPdf;
			},
			mapExportPDFAnexo7House: function (dataInfo) {
				var aGeneral = [];
				
				var master = dataInfo.filter(function (el) {
						return el["DTMasterCodigo"] == null;
					});
				var hijas = dataInfo.filter(function (el) {
						return el["DTMasterCodigo"] != null;
					});

					
				for (var i in master) {
					var dataCabecera = master[i];
					var filterHijas = hijas.filter(function (el) {
						return el["DTMasterCodigo"] == master[i]["DTCodigo"];
					});
					
					var inicioTarja = false;
					if (dataCabecera.EstadoCodigo == "TE_MANIF_03" || dataCabecera.EstadoCodigo == "TE_MANIF_04"){
						inicioTarja = true;
					}
					
					var min_ini_tarja = dataCabecera.ManifiestoFechaInicioTarja;
					var max_fin_tarja = dataCabecera.ManifiestoFechaFinTarja;
					
					if (!inicioTarja){
						min_ini_tarja = "";
					}
				
				var datosPdf = {
					DireccionFiscal: controller.valueUndefinedPDF(dataCabecera.DireccionFiscal),
					RucSaasa: controller.valueUndefinedPDF(dataCabecera.RucSaasa),
					DescripcionSaasa: controller.valueUndefinedPDF(dataCabecera.DescripcionSaasa),
					BaseLegalAnexo7House: controller.valueUndefinedPDF(dataCabecera.BaseLegalAnexo7House),
					Titulo: "AnexoVHouse" + controller.valueUndefinedPDF(dataCabecera.CodVolante),

					AgenteCargaInternacional: controller.valueUndefinedPDF(dataCabecera.AgenteCargaDescripcion),
					DocumentosTransporteMaster: controller.valueUndefinedPDF(dataCabecera.DTCodigo),
					FechaHoraLlegada: controller.valueUndefinedPDF(dataCabecera.ManifiestoFechaHoraLlegadaATAString),
					FechaHoraTerminoDescarga: controller.valueUndefinedPDF(dataCabecera.FechaHoraTerminoDescargaString),
					CompaniaTransportista: controller.valueUndefinedPDF(dataCabecera.TransportistaNombre),
					NumeroVuelo: controller.valueUndefinedPDF(dataCabecera.ItinerarioCodigoYata) + "-" + controller.valueUndefinedPDF(dataCabecera.ItinerarioNroViaje),
					Manifiesto: controller.valueUndefinedPDF(dataCabecera.ManifiestoJurisdicionAduanera) + "-" + controller.valueUndefinedPDF(dataCabecera.TransporteVia) 
								+ "-" + controller.valueUndefinedPDF(dataCabecera.ManifiestoAnio) + "-" + controller.valueUndefinedPDF(dataCabecera.ManifiestoNumero),
					FechaHoraInicioRecepcion: controller.valueUndefinedPDF(controller.formatFechaDDMMAAAAHora(min_ini_tarja)),
					FechaHoraFinRecepcion: controller.valueUndefinedPDF(controller.formatFechaDDMMAAAAHora(max_fin_tarja)),
					Almacen: "4372",
					EsMalEstado: controller.valueUndefinedPDF(dataCabecera.EsMalEstado),
					UltimoOrigenEmb: controller.valueUndefinedPDF(dataCabecera.ItinerarioOrigen),
					aDetalle: []
				};
				
				var esMalEstado = datosPdf.EsMalEstado == 1;
				
				var totalBultosManif = 0.00;
				var totalBultosRec = 0.00;
				var totalBultosFalt = 0.00;
				var totalBultosSobr = 0.00;
				var totalBultosBueno = 0.00;
				var totalBultosMalo = 0.00;

				var totalPesoManif = 0.00;
				var totalPesoRec = 0.00;
				var totalPesoFalt = 0.00;
				var totalPesoSobr = 0.00;
				var totalPesoBueno = 0.00;
				var totalPesoMalo = 0.00;
				var contador = 0;
				for (var i in filterHijas) {
					var objDT = filterHijas[i];
					if (objDT.DTDepositoTemporal !== "4372") {
						continue;
					}
					contador = contador + 1;
					var obj = {
						"Numero": controller.leftNumberUndefined(objDT.DTNumeroDetalle),
						"DocumentoTransporte": controller.valueUndefinedPDF(objDT.DTCodigo),
						"TipoBulto": controller.valueUndefinedPDF(objDT.DTTipoBultoDescripcion),
						"NumeroPrecinto": objDT.NumeroPrecinto ? controller.valueUndefinedPDF(objDT.NumeroPrecinto) : "S/P",

						"Consignatario": controller.valueUndefinedPDF(objDT.ConsignatarioNombre),
						"Descripcion": controller.valueUndefinedPDF(objDT.DTDescripcion),

						"BultosManifestados": controller.leftNumberUndefined(objDT.DTBultosManifestados),
						"BultosRecibidos": controller.leftNumberUndefined(objDT.DTBultosRecibidos),
						"BultosFaltantes": controller.leftNumberUndefined(objDT.DTBultosFaltantes),
						"BultosSobrantes": controller.leftNumberUndefined(objDT.DTBultosSobrantes),
						"BultosBuenos": controller.leftNumberUndefined(objDT.DTBultosBuenEstado),
						"BultosMalos": controller.leftNumberUndefined(objDT.DTBultosMalEstado),

						"PesoManifestados": parseFloat(controller.leftNumberUndefined(objDT.DTPesoManifestado)).toFixed(2),
						"PesoRecibidos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoRecibido)).toFixed(2),
						"PesoFaltantes": parseFloat(controller.leftNumberUndefined(objDT.DTPesoFaltante)).toFixed(2),
						"PesoSobrantes": parseFloat(controller.leftNumberUndefined(objDT.DTPesoSobrante)).toFixed(2),
						"PesoBuenos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoBuenEstado)).toFixed(2),
						"PesoMalos": parseFloat(controller.leftNumberUndefined(objDT.DTPesoMalEstado)).toFixed(2),
 
						"ActaInventario": controller.leftNumberUndefined(objDT.DTBultosMalEstado) < 1 ? "" : controller.valueUndefinedPDF(objDT.ManifiestoActaInventarioNroFormato),
						"DiferenciaPeso": (parseFloat(controller.leftNumberUndefined(objDT.DTPesoRecibido)) == 0 ? 0 : parseFloat(controller.leftNumberUndefined(
							objDT.DTPesoManifestado)) / parseFloat(controller.leftNumberUndefined(objDT.DTPesoRecibido))).toString()
					};
					obj.DiferenciaPeso = parseFloat(obj.DiferenciaPeso).toFixed(2) + " %";
					totalBultosManif = parseInt(totalBultosManif) + parseInt(obj.BultosManifestados);
					totalBultosRec = parseInt(totalBultosRec) + parseFloat(obj.BultosRecibidos);
					totalBultosFalt = parseInt(totalBultosFalt) + parseInt(obj.BultosFaltantes);
					totalBultosSobr = parseInt(totalBultosSobr) + parseInt(obj.BultosSobrantes);
					totalBultosBueno = parseInt(totalBultosBueno) + parseInt(obj.BultosBuenos);
					totalBultosMalo = parseInt(totalBultosMalo) + parseInt(obj.BultosMalos);

					totalPesoManif = (parseFloat(totalPesoManif) + parseFloat(obj.PesoManifestados)).toFixed(2);
					totalPesoRec = (parseFloat(totalPesoRec) + parseFloat(obj.PesoRecibidos)).toFixed(2);
					totalPesoFalt = (parseFloat(totalPesoFalt) + parseFloat(obj.PesoFaltantes)).toFixed(2);
					totalPesoSobr = (parseFloat(totalPesoSobr) + parseFloat(obj.PesoSobrantes)).toFixed(2);
					totalPesoBueno = (parseFloat(totalPesoBueno) + parseFloat(obj.PesoBuenos)).toFixed(2);
					totalPesoMalo = (parseFloat(totalPesoMalo) + parseFloat(obj.PesoMalos)).toFixed(2);
					
					if (obj.BultosRecibidos > 0){
						if (obj.BultosMalos != null && obj.BultosMalos == 0) {
							obj.Estado = "BUEN ESTADO";
						} else {
							obj.Estado = "MAL ESTADO";
						}	
					}
					
					obj.Observaciones = "";
					datosPdf.aDetalle.push(obj);
				}
				datosPdf.CantidadDocumentos = controller.leftNumberUndefined(datosPdf.aDetalle.length);
				datosPdf.totalBultosManif = totalBultosManif.toString();
				datosPdf.totalBultosRec = totalBultosRec.toString();
				datosPdf.totalBultosFalt = totalBultosFalt.toString();
				datosPdf.totalBultosSobr = totalBultosSobr.toString();
				datosPdf.totalBultosBueno = totalBultosBueno.toString();
				datosPdf.totalBultosMalo = totalBultosMalo.toString();

				datosPdf.totalPesoManif = totalPesoManif.toString();
				datosPdf.totalPesoRec = totalPesoRec.toString();
				datosPdf.totalPesoFalt = totalPesoFalt.toString();
				datosPdf.totalPesoSobr = totalPesoSobr.toString();
				datosPdf.totalPesoBueno = totalPesoBueno.toString();
				datosPdf.totalPesoMalo = totalPesoMalo.toString();
				aGeneral.push(datosPdf);
				
				}
				return aGeneral;
			},
			mapExportPDFAnexo2ManifiestoCarga: function (dataInfo) {
				var aGeneral = [];
				var aDepositoTemporal = controller.removeDuplicatesGeneral(dataInfo,"DTDepositoTemporal");

				for (var i in aDepositoTemporal) {
					if (controller.valueUndefinedPDF(aDepositoTemporal[i].DTDepositoTemporal) != ""){
						var depositoTemporal = aDepositoTemporal[i].DTDepositoTemporal;
						var aGuia = dataInfo.filter(function (el) {
							return el["DTDepositoTemporal"] == depositoTemporal;
						});
	
						var dataCabecera = aGuia[0];
						var datosPdf = {
							RazonSocialAerolinea: controller.valueUndefinedPDF(dataCabecera.ItinerarioDescripcionTransportista),
							DireccionFiscalAerolinea: controller.valueUndefinedPDF(dataCabecera.ItinerarioDireccionTransportista),
							RucAerolinea: controller.valueUndefinedPDF(dataCabecera.ItinerarioCodigoTransportista),
							BaseLegalAnexo6MasterDirecta: controller.valueUndefinedPDF(dataCabecera.BaseLegalAnexo6MasterDirecta),
							Titulo: "MDC" + controller.valueUndefinedPDF(dataCabecera.CodVolante),
							CodigoTransportista: controller.valueUndefinedPDF(dataCabecera.TransportistaIdentificacion),
							Matricula: controller.valueUndefinedPDF(dataCabecera.TransporteMatricula),
							TransporteFechaEstimadaLlegada: controller.valueUndefinedPDF(dataCabecera.ManifiestoFechaHoraLlegadaATAString),
							FechaHoraLlegada: controller.valueUndefinedPDF(dataCabecera.ManifiestoFechaHoraLlegadaATAString),
							FechaHoraTerminoDescarga: controller.valueUndefinedPDF(dataCabecera.FechaHoraTerminoDescargaString),
							CompaniaTransportista: controller.valueUndefinedPDF(dataCabecera.TransportistaNombre),
							NumeroVuelo: controller.valueUndefinedPDF(dataCabecera.ItinerarioCodigoYata) + "-" + controller.valueUndefinedPDF(dataCabecera.ItinerarioNroViaje),
							FechaZarpeString: controller.valueUndefinedPDF(dataCabecera.FechaZarpeString),
							Manifiesto: controller.valueUndefinedPDF(dataCabecera.ManifiestoJurisdicionAduanera) + "-" + controller.valueUndefinedPDF(
								dataCabecera.TransporteVia) + "-" + controller.valueUndefinedPDF(dataCabecera.ManifiestoAnio) + "-" + controller.valueUndefinedPDF(dataCabecera.ManifiestoNumero),
							DepositoTemporal: controller.valueUndefinedPDF(dataCabecera.DTDepositoTemporal), //Almacen: "4372",
							DTPuertoFinal: controller.valueUndefinedPDF(dataCabecera.DTPuertoFinal),
							CapitanTransporte: controller.valueUndefinedPDF(dataCabecera.CapitanTransporte),
							DTDepositoTemporalDescripcion: controller.valueUndefinedPDF(dataCabecera.DTDepositoTemporalDescripcion),
							DTDepositoTemporal: controller.valueUndefinedPDF(dataCabecera.DTDepositoTemporal),
							DescripcionSaasa: controller.valueUndefinedPDF(dataCabecera.DescripcionSaasa),
							CodigoSaasa: "4372",
							aDetalle: []
						};
						var totalBultosManif = 0.00;
						var totalBultosRec = 0.00;
						var totalBultosFalt = 0.00;
						var totalBultosSobr = 0.00;
						var totalBultosBueno = 0.00;
						var totalBultosMalo = 0.00;
		
						var totalPesoManif = 0.00;
						var totalPesoRec = 0.00;
						var totalPesoFalt = 0.00;
						var totalPesoSobr = 0.00;
						var totalPesoBueno = 0.00;
						var totalPesoMalo = 0.00;
						var contador = 0;
						for (var i in aGuia) {
							var objDT = aGuia[i];
							/*if (objDT.DTDepositoTemporal !== "4372") {
								continue;
							}*/
							contador = contador + 1;
							var obj = {
								"Numero": controller.leftNumberUndefined(objDT.DTNumeroDetalle),
								"TipoManifiesto": controller.valueUndefinedPDF(objDT.ManifiestoCampoTipoManifiesto),
								"CodPto": controller.valueUndefinedPDF(objDT.Origen),
								"DocumentoTransporteMaster": controller.valueUndefinedPDF(objDT.DTCodigo),
								"Consignatario": controller.valueUndefinedPDF(objDT.ConsignatarioNombre),
								"ConsignatarioDescripcionTipoIdentificacion": controller.valueUndefinedPDF(objDT.DescripcionTipoIdentificacion),
								"ConsignatarioIdentificacion": controller.valueUndefinedPDF(objDT.ConsignatarioIdentificacion),
								"Origen": controller.valueUndefinedPDF(objDT.Origen),
								"Destino": controller.valueUndefinedPDF(objDT.Destino),
								"Marcas": controller.valueUndefinedPDF(objDT.Marcas),
								"Bultos": controller.valueUndefinedPDF(objDT.DTBultosManifestados) == "" ? 0 : controller.valueUndefinedPDF(objDT.DTBultosManifestados),
								"Peso": controller.valueUndefinedPDF(objDT.DTPesoManifestado) == "" ? 0 : parseFloat(controller.valueUndefinedPDF(objDT.DTPesoManifestado)).toFixed(2),
								"Descripcion": controller.valueUndefinedPDF(objDT.DTDescripcion),
							};
							totalBultosManif = parseInt(totalBultosManif) + parseInt(obj.Bultos);
							totalPesoManif = (parseFloat(totalPesoManif) + parseFloat(obj.Peso)).toFixed(2);
							/*obj.DiferenciaPeso = parseFloat(obj.DiferenciaPeso).toFixed(2) + " %";
							totalBultosRec = parseInt(totalBultosRec) + parseFloat(obj.BultosRecibidos);
							totalBultosFalt = parseInt(totalBultosFalt) + parseInt(obj.BultosFaltantes);
							totalBultosSobr = parseInt(totalBultosSobr) + parseInt(obj.BultosSobrantes);
							totalBultosBueno = parseInt(totalBultosBueno) + parseInt(obj.BultosBuenos);
							totalBultosMalo = parseInt(totalBultosMalo) + parseInt(obj.BultosMalos);
		
							totalPesoManif = (parseFloat(totalPesoManif) + parseFloat(obj.PesoManifestados)).toFixed(2);
							totalPesoRec = (parseFloat(totalPesoRec) + parseFloat(obj.PesoRecibidos)).toFixed(2);
							totalPesoFalt = (parseFloat(totalPesoFalt) + parseFloat(obj.PesoFaltantes)).toFixed(2);
							totalPesoSobr = (parseFloat(totalPesoSobr) + parseFloat(obj.PesoSobrantes)).toFixed(2);
							totalPesoBueno = (parseFloat(totalPesoBueno) + parseFloat(obj.PesoBuenos)).toFixed(2);
							totalPesoMalo = (parseFloat(totalPesoMalo) + parseFloat(obj.PesoMalos)).toFixed(2);*/
		
							datosPdf.aDetalle.push(obj);
						}
						datosPdf.CantidadDocumentos = controller.leftNumberUndefined(datosPdf.aDetalle.length);
						datosPdf.totalBultosManif = totalBultosManif.toString();
						datosPdf.totalPesoManif = totalPesoManif.toString();
						aGeneral.push(datosPdf);	
					}
				}

				return aGeneral;
			},
		},
	};
});