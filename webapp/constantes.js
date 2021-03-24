/* global moment:true */
sap.ui.define([

], function () {
	"use strict";
	return {
		idProyecto: "com.rava",
		PaginaHome: "appHome",
		IdApp: "SolicitarCita",
		modelOdata: "modelOdata",
		root: "/XS_IPROVIDER_ENTREGA",
		userApi: "userapi",
		services: {
			//////////////////////////////////////////////////////////////////////
			//////////////////////////////////////////////////////////////////////
			registrarEntregasSinOC: "/Entrega/Service/RegistrarEntregasSinOC/",
			consultarUsuario: "/backend/api/proveedor/getSessionUser",
			consultarAlmacen: "/ERP/sap/opu/odata/sap/ZBVMM_WEB_CENTRO_ALMACEN_SRV/CentroAlmacenSet",
			unmMedida: "/ERP/sap/opu/odata/sap/ZBVMM_WEB_UNIDADES_MEDIDA_SRV/UnidadesMedidaSet",
			motivo: "/ERP/sap/opu/odata/sap/ZBVMM_WEB_MOTIVO_SRV/MotivosSet",
			tipoEmbalaje: "/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_REL_PEDC_XCONF_SRV/TipoBultoSet?$filter=Spras eq 'S'&$format=json",
			estatus:"/ERP/sap/opu/odata/sap/ZBVMM_WEB_OC_REGISTRO_ENTRE_SRV/ZET_ESTATUSSet"
		}
	};
});