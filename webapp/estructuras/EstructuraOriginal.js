jQuery.sap.require("sap.ui.core.format.DateFormat");
sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"../util/utilController"
], function (JSONModel, controller) {
	"use strict";
	return {
		maestro: {
			mapCombo: function (self, nameModel, nameTable, campoKey, campoDescripcion) {
				var model = self.getView().getModel(nameModel).getProperty("/" + nameTable);
				var modelSet = model ? model : [];
				var modDatos = {
					Codigo: campoKey,
					Descripcion: campoDescripcion
				};
				modelSet.push(modDatos);
				self.getView().getModel(nameModel).setProperty("/" + nameTable, modelSet);
			},
			mapComboGeneral: function (self, nameModel, nameTable, campoKey, campoDescripcion, servDatos) {
				var model = self.getView().getModel(nameModel).getProperty("/" + nameTable);
				var modelSet = model ? model : [];
				var modDatos = servDatos;
				modDatos.Codigo = campoKey;
				modDatos.Descripcion = campoDescripcion;

				modelSet.push(modDatos);
				self.getView().getModel(nameModel).setProperty("/" + nameTable, modelSet);
				self.getView().getModel(nameModel).refresh(true);
			},
			mapVGenericaCampoComboBox: function (self, datos) {
				var servDatos = datos;
				var via = self.getView().getModel("localModel").getProperty("/Detail/Via");
				self.getView().getModel("maestroModel").setData({});
				for (var i in servDatos) {
					if (servDatos[i].CodigoTabla == "T_MOD_RECEP" ||
						servDatos[i].CodigoTabla == "T_TERMINALES" ||
						servDatos[i].CodigoTabla == "T_TIPO_ALMACEN" ||
						servDatos[i].CodigoTabla == "T_TIPO_CARGA" ||
						servDatos[i].CodigoTabla == "T_TIPO_CONDICION") {
						this.mapComboGeneral(self, "maestroModel", servDatos[i].CodigoTabla, servDatos[i].Campo, servDatos[i].DescripcionCampo, servDatos[
							i]);
					} else if (servDatos[i].CodigoTabla == "T_REGIMENES") {
						if (servDatos[i].PadreDescripcion == "01") { //Regimenes para Importacion
							this.mapComboGeneral(self, "maestroModel", servDatos[i].CodigoTabla, servDatos[i].Id, servDatos[i].DescripcionCampo, servDatos[i]);
						}
					} else if (servDatos[i].CodigoTabla == "T_TIPO_DOC_ADJUNTO") {
						this.mapComboGeneral(self, "maestroModel", servDatos[i].CodigoTabla, servDatos[i].Id + "," + servDatos[i].CodigoSap, servDatos[i].DescripcionCampo,
							servDatos[i]);
					} else if (servDatos[i].CodigoTabla == "T_CON_CONTENEDOR") {
						this.mapComboGeneral(self, "maestroModel", servDatos[i].CodigoTabla, servDatos[i].Id, servDatos[i].DescripcionCampo, servDatos[i]);
					} else if (servDatos[i].CodigoTabla == "T_IDENT_DOC_TRANS" ||
						servDatos[i].CodigoTabla == "T_TIPO_DOC_TRANSPORTE" ||
						servDatos[i].CodigoTabla == "T_PARTICIPANTES" ||
						servDatos[i].CodigoTabla == "T_CODIGOS_UN" ||
						servDatos[i].CodigoTabla == "T_TIPO_BULTOS" ||
						servDatos[i].CodigoTabla == "T_PAISES" ||
						servDatos[i].CodigoTabla == "T_TIPO_PAGO" ||
						servDatos[i].CodigoTabla == "T_TIPO_FLETE" ||
						servDatos[i].CodigoTabla == "T_MONEDA_FLETE" ||
						servDatos[i].CodigoTabla == "T_DESTINACION_CARGA") {
						this.mapComboGeneral(self, "maestroModel", servDatos[i].CodigoTabla, servDatos[i].Campo, servDatos[i].DescripcionCampo, servDatos[
							i]);
					} else {
						if (servDatos[i].PadreDescripcion == via) {
							this.mapComboGeneral(self, "maestroModel", servDatos[i].CodigoTabla, servDatos[i].Campo, servDatos[i].DescripcionCampo, servDatos[
								i]);
						}
					}
				}
			},
			mapVGenericaCampo: function (self, datos) {
				var servDatos = datos;
				var via = self.getView().getModel("miData").getProperty("/AddManifiesto/Via");
				self.getView().getModel("maestroModelManifiesto").setData({});
				for (var i in servDatos) {
					if (servDatos[i].CodigoTabla == "T_TIPO_LUGAR_DESCARGA") {
						if (servDatos[i].PadreDescripcion == via) {
							this.mapComboGeneral(self, "maestroModelManifiesto", servDatos[i].CodigoTabla, servDatos[i].Campo, servDatos[i].DescripcionCampo,
								servDatos[i]);
						}
					} else if (servDatos[i].CodigoTabla == "T_VIAS") {
						this.mapComboGeneral(self, "maestroModelManifiesto", servDatos[i].CodigoTabla, servDatos[i].Campo, servDatos[i].DescripcionCampo,
							servDatos[i]);
					} else {
						this.mapComboGeneral(self, "maestroModelManifiesto", servDatos[i].CodigoTabla, servDatos[i].Campo, servDatos[i].DescripcionCampo,
							servDatos[i]);
					}
				}
			},
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
					modDatos.Descripcion = servDatos[i].NroViaje + "-" + servDatos[i].AnioViaje;
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
			//////////////////////////////////////////////////////////////
			mapVGenericaCampo2: function (self, datos, oFiltro) {
				var servDatos = datos;
				for (var i in oFiltro) {
					var tableFilter = servDatos.filter(function (el) {
						return el.CodigoTabla == oFiltro[i].oValue1;
					});
					var arrayDatos = [];
					for (var j in tableFilter) {
						var modDatos = {
							Codigo: tableFilter[j].Campo,
							Descripcion: tableFilter[j].DescripcionCampo
						};
						arrayDatos.push(modDatos);
					}
					self.getView().getModel("maestroModel").setProperty("/" + oFiltro[i].oValue1, arrayDatos);
				}
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
						Id: servDatos[i].Id,
						Via: servDatos[i].Via,
						Viaje: servDatos[i].Viaje,
						TipoManifiesto: servDatos[i].TipoManifiesto,
						NumeroManifiesto: servDatos[i].NumeroManifiesto,
						AnioManifiesto: servDatos[i].AnioManifiesto,
						FechaLlegada: servDatos[i].FechaLlegada,
						FechaTerminoDescarga: controller.formatFechaDDMMAAAAHora(servDatos[i].FechaTerminoDescarga),
						CodItinerario: servDatos[i].CodItinerario,
						AnioItinerario: servDatos[i].AnioItinerario,
						IdItinerarioDetalle: servDatos[i].IdItinerarioDetalle,
						FechaHoraLlegada: controller.formatFechaDDMMAAAAHora(servDatos[i].FechaHoraLlegada),
						Movimiento: servDatos[i].Movimiento,
						Contenedores: servDatos[i].Contenedores ? controller.removeDuplicates(servDatos[i].Contenedores.split(",")) : "",
						DocumentosTransporte: servDatos[i].DocumentosTransporte ? controller.removeDuplicates(servDatos[i].DocumentosTransporte.split(",")) : "",
						Paquetes: servDatos[i].Paquetes ? controller.removeDuplicates(servDatos[i].Paquetes.split(",")) : "",
						Precintos: servDatos[i].Precintos ? controller.removeDuplicates(servDatos[i].Precintos.split(",")) : "",
						Adjuntos: servDatos[i].Adjuntos ? controller.removeDuplicates(servDatos[i].Adjuntos.split(",")) : "",
						Fletes: servDatos[i].Fletes ? controller.removeDuplicates(servDatos[i].Fletes.split(",")) : "",
						IdTransportista: servDatos[i].IdTransportista,
						DescripcionTransportista: servDatos[i].DescripcionTransportista,
						IdVia: servDatos[i].IdVia,
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
						FechaHoraLlegadaATA: servDatos[i].FechaHoraLlegadaATA,
					};
					arrayDatos.push(modDatos);
				}
				return arrayDatos;
			},
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
				for (var i in servDatos) {
					totalBultoManifestado = totalBultoManifestado + parseInt(servDatos[i].BultosManifestados);
					totalPesoManifestado = totalPesoManifestado + parseInt(servDatos[i].PesoManifestado);

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
						BultosRecibidos: servDatos[i].BultosRecibidos,
						PesoRecibido: servDatos[i].PesoRecibido,
						BultosFaltantes: servDatos[i].BultosFaltantes,
						PesoFaltante: servDatos[i].PesoFaltante,
						BultosSobrantes: servDatos[i].BultosSobrantes,
						PesoSobrante: servDatos[i].PesoSobrante,
						BultosMalEstado: servDatos[i].BultosMalEstado,
						PesoMalEstado: servDatos[i].PesoMalEstado,
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
						Embarcador: servDatos[i].Embarcador,
						Consignatario: servDatos[i].Consignatario,
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
						IdTipoAdjunto: servDatos[i].IdTipoAdjunto + "," + servDatos[i].TipoAdjuntoCodigoSAP,
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
						Notificado: servDatos[i].Notificado,
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
						enabledInput: false,
						icon: "sap-icon://edit"
					};
					/////Inicio Tree/////////////////////////////////////////////////////////////////////////////////////////
					//modDatos.Id = parseInt(servDatos[i].DocumentoTransporteMadreId).toString();
					modDatos.id = servDatos[i].Id;
					modDatos.parentId = (servDatos[i].DocumentoTransporteMadreId) ? servDatos[i].DocumentoTransporteMadreId : "0";
					modDatos.children = null;
					//////End Tree//////////////////////////////////////////////////////////////////////////////////////////
					arrayDatos.push(modDatos);
				}
				self.getView().getModel("localModel").setProperty("/Detail/TotalBultoManifestado", totalBultoManifestado);
				self.getView().getModel("localModel").setProperty("/Detail/TotalPesoManifestado", totalPesoManifestado);
				//arrayDatos = controller.listaToArbol(arrayDatos);
				return arrayDatos;
			},
			mapoDataDocumentosTransporte2: function (self, datos) {
				var servDatos = datos;
				var arrayDatos = [];
				var totalBultoManifestado = 0;
				var totalPesoManifestado = 0;
				for (var i in servDatos) {
					totalBultoManifestado = totalBultoManifestado + parseInt(servDatos[i].BultosManifestados);
					totalPesoManifestado = totalPesoManifestado + parseInt(servDatos[i].PesoManifestado);
					var modDatos = {
						Id: servDatos[i].Id,
						/*EsMaster: servDatos[i].EsMaster,
						DocumentoTransporteMadreId: servDatos[i].DocumentoTransporteMadreId,
						DocumentoTransporteCodigo: servDatos[i].DocumentoTransporteCodigo,
						Descripcion: servDatos[i].Descripcion,
						BultosManifestados: servDatos[i].BultosManifestados,
						PesoManifestado: servDatos[i].PesoManifestado,
						Origen: servDatos[i].Origen,
						Destino: servDatos[i].Destino,
						PuntoLlegada: servDatos[i].PuntoLlegada,
						TerminalOrigen: servDatos[i].TerminalOrigen,
						TerminalDestino: servDatos[i].TerminalDestino,
						IdModalidad: servDatos[i].IdModalidad,
						IdTipoCarga: servDatos[i].IdTipoCarga,
						IdTipoAlmacenamiento: servDatos[i].IdTipoAlmacenamiento,
						IdRegimen: servDatos[i].IdRegimen,
						AgenteCarga: servDatos[i].AgenteCarga,
						Embarcador: servDatos[i].Embarcador,
						Consignatario: servDatos[i].Consignatario,
						IdManifiesto: servDatos[i].IdManifiesto,
						IdContenedor: servDatos[i].IdContenedor,
						EsCargaSuelta: servDatos[i].EsCargaSuelta,
						EsExpo: servDatos[i].EsExpo,
						Adjunto: servDatos[i].Adjunto,
						EsTCI: servDatos[i].EsTCI,*/
						EsMaster: servDatos[i].EsMaster,
						EsMasterDescripcion: servDatos[i].EsMasterDescripcion,
						DocumentoTransporteMadreId: servDatos[i].DocumentoTransporteMadreId,
						DocumentoTransporteMasterCodigo: servDatos[i].DocumentoTransporteMasterCodigo,
						DocumentoTransporteCodigo: servDatos[i].DocumentoTransporteCodigo,
						Descripcion: servDatos[i].Descripcion,
						BultosManifestados: servDatos[i].BultosManifestados,
						PesoManifestado: servDatos[i].PesoManifestado,
						BultosRecibidos: servDatos[i].BultosRecibidos,
						PesoRecibido: servDatos[i].PesoRecibido,
						BultosFaltantes: servDatos[i].BultosFaltantes,
						PesoFaltante: servDatos[i].PesoFaltante,
						BultosSobrantes: servDatos[i].BultosSobrantes,
						PesoSobrante: servDatos[i].PesoSobrante,
						BultosMalEstado: servDatos[i].BultosMalEstado,
						PesoMalEstado: servDatos[i].PesoMalEstado,
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
						Embarcador: servDatos[i].Embarcador,
						Consignatario: servDatos[i].Consignatario,
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
						IdTipoAdjunto: servDatos[i].IdTipoAdjunto + "," + servDatos[i].TipoAdjuntoCodigoSAP,
						TipoAdjuntoDescripcion: servDatos[i].TipoAdjuntoDescripcion,
						IdAdjunto: servDatos[i].IdAdjunto,
						TipoAdjuntoCodigoSAP: servDatos[i].TipoAdjuntoCodigoSAP,
						RutaAdjunto: servDatos[i].RutaAdjunto,
						enabledInput: false,
						icon: "sap-icon://edit"
					};
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
						enabledInput: false
							//icon: "sap-icon://edit"
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
		}
	};
});