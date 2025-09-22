import { ContractTemplate } from "../types";

export const sampleTemplates: ContractTemplate[] = [
  {
    id: "1",
    name: "Contrato de Compraventa Estándar",
    description: "Plantilla estándar para contratos de compraventa de inmuebles",
    type: "SALE",
    content: `CONTRATO DE COMPRAVENTA DE INMUEBLE

Entre los suscritos, a saber:

VENDEDOR: {{vendedor_nombre}}, identificado con {{vendedor_documento}}, de nacionalidad {{vendedor_nacionalidad}}, mayor de edad, domiciliado en {{vendedor_direccion}}, a quien en adelante se le denominará "EL VENDEDOR";

COMPRADOR: {{comprador_nombre}}, identificado con {{comprador_documento}}, de nacionalidad {{comprador_nacionalidad}}, mayor de edad, domiciliado en {{comprador_direccion}}, a quien en adelante se le denominará "EL COMPRADOR";

Se ha convenido celebrar el presente contrato de compraventa, que se regirá por las siguientes cláusulas:

PRIMERA: OBJETO DEL CONTRATO
El VENDEDOR transfiere al COMPRADOR la propiedad del inmueble ubicado en {{inmueble_direccion}}, identificado con matrícula inmobiliaria {{matricula_inmobiliaria}}.

SEGUNDA: PRECIO Y FORMA DE PAGO
El precio de venta es de {{precio_venta}} ({{precio_letras}}), que será cancelado de la siguiente forma:
- Entrada: {{entrada}}
- Saldo: {{saldo}} en {{plazo_pago}} cuotas de {{valor_cuota}} cada una.

TERCERA: ENTREGA DEL INMUEBLE
La entrega del inmueble se realizará el día {{fecha_entrega}}.

CUARTA: GASTOS
Los gastos de escrituración y registro correrán por cuenta del COMPRADOR.

En fe de lo cual se firma el presente contrato en {{lugar_firma}} el día {{fecha_firma}}.

VENDEDOR: _________________
COMPRADOR: _________________`,
    variables: [
      {
        name: "vendedor_nombre",
        label: "Nombre del Vendedor",
        type: "text",
        required: true,
        placeholder: "Ingrese el nombre completo del vendedor",
        description: "Nombre completo del vendedor del inmueble"
      },
      {
        name: "vendedor_documento",
        label: "Documento del Vendedor",
        type: "text",
        required: true,
        placeholder: "Cédula de identidad del vendedor",
        description: "Número de documento de identidad del vendedor"
      },
      {
        name: "vendedor_nacionalidad",
        label: "Nacionalidad del Vendedor",
        type: "text",
        required: true,
        placeholder: "Nacionalidad del vendedor",
        description: "Nacionalidad del vendedor"
      },
      {
        name: "vendedor_direccion",
        label: "Dirección del Vendedor",
        type: "textarea",
        required: true,
        placeholder: "Dirección completa del vendedor",
        description: "Dirección de residencia del vendedor"
      },
      {
        name: "comprador_nombre",
        label: "Nombre del Comprador",
        type: "text",
        required: true,
        placeholder: "Ingrese el nombre completo del comprador",
        description: "Nombre completo del comprador del inmueble"
      },
      {
        name: "comprador_documento",
        label: "Documento del Comprador",
        type: "text",
        required: true,
        placeholder: "Cédula de identidad del comprador",
        description: "Número de documento de identidad del comprador"
      },
      {
        name: "comprador_nacionalidad",
        label: "Nacionalidad del Comprador",
        type: "text",
        required: true,
        placeholder: "Nacionalidad del comprador",
        description: "Nacionalidad del comprador"
      },
      {
        name: "comprador_direccion",
        label: "Dirección del Comprador",
        type: "textarea",
        required: true,
        placeholder: "Dirección completa del comprador",
        description: "Dirección de residencia del comprador"
      },
      {
        name: "inmueble_direccion",
        label: "Dirección del Inmueble",
        type: "textarea",
        required: true,
        placeholder: "Dirección completa del inmueble",
        description: "Dirección exacta del inmueble objeto de la venta"
      },
      {
        name: "matricula_inmobiliaria",
        label: "Matrícula Inmobiliaria",
        type: "text",
        required: true,
        placeholder: "Número de matrícula inmobiliaria",
        description: "Número de matrícula inmobiliaria del inmueble"
      },
      {
        name: "precio_venta",
        label: "Precio de Venta",
        type: "number",
        required: true,
        placeholder: "Precio total de la venta",
        description: "Precio total acordado para la venta del inmueble"
      },
      {
        name: "precio_letras",
        label: "Precio en Letras",
        type: "text",
        required: true,
        placeholder: "Precio escrito en letras",
        description: "Precio total escrito en letras"
      },
      {
        name: "entrada",
        label: "Entrada",
        type: "number",
        required: true,
        placeholder: "Monto de la entrada",
        description: "Monto de la entrada inicial"
      },
      {
        name: "saldo",
        label: "Saldo",
        type: "number",
        required: true,
        placeholder: "Monto del saldo",
        description: "Monto del saldo a pagar"
      },
      {
        name: "plazo_pago",
        label: "Plazo de Pago",
        type: "number",
        required: true,
        placeholder: "Número de cuotas",
        description: "Número de cuotas para el pago del saldo"
      },
      {
        name: "valor_cuota",
        label: "Valor de Cuota",
        type: "number",
        required: true,
        placeholder: "Valor de cada cuota",
        description: "Valor de cada cuota mensual"
      },
      {
        name: "fecha_entrega",
        label: "Fecha de Entrega",
        type: "date",
        required: true,
        placeholder: "",
        description: "Fecha acordada para la entrega del inmueble"
      },
      {
        name: "lugar_firma",
        label: "Lugar de Firma",
        type: "text",
        required: true,
        placeholder: "Ciudad donde se firma el contrato",
        description: "Ciudad donde se firma el contrato"
      },
      {
        name: "fecha_firma",
        label: "Fecha de Firma",
        type: "date",
        required: true,
        placeholder: "",
        description: "Fecha de firma del contrato"
      }
    ],
    isDefault: true,
    isActive: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z"
  },
  {
    id: "2",
    name: "Contrato de Arrendamiento Residencial",
    description: "Plantilla para contratos de arrendamiento de viviendas",
    type: "RENT",
    content: `CONTRATO DE ARRENDAMIENTO

Entre los suscritos, a saber:

ARRENDADOR: {{arrendador_nombre}}, identificado con {{arrendador_documento}}, domiciliado en {{arrendador_direccion}}, a quien en adelante se le denominará "EL ARRENDADOR";

ARRENDATARIO: {{arrendatario_nombre}}, identificado con {{arrendatario_documento}}, domiciliado en {{arrendatario_direccion}}, a quien en adelante se le denominará "EL ARRENDATARIO";

Se ha convenido celebrar el presente contrato de arrendamiento, que se regirá por las siguientes cláusulas:

PRIMERA: OBJETO DEL CONTRATO
El ARRENDADOR cede en arrendamiento al ARRENDATARIO el inmueble ubicado en {{inmueble_direccion}}, por el término de {{plazo_arrendamiento}} meses.

SEGUNDA: CANON DE ARRENDAMIENTO
El canon de arrendamiento mensual es de {{canon_mensual}} ({{canon_letras}}), que deberá ser cancelado dentro de los primeros {{dias_pago}} días de cada mes.

TERCERA: DEPÓSITO DE GARANTÍA
El ARRENDATARIO consigna como depósito de garantía la suma de {{deposito_garantia}} ({{deposito_letras}}).

CUARTA: OBLIGACIONES DEL ARRENDATARIO
- Pagar puntualmente el canon de arrendamiento
- Mantener el inmueble en buen estado
- No subarrendar sin autorización escrita
- Pagar los servicios básicos (luz, agua, gas)

QUINTA: OBLIGACIONES DEL ARRENDADOR
- Entregar el inmueble en buen estado
- Realizar las reparaciones necesarias
- Respetar la privacidad del arrendatario

En fe de lo cual se firma el presente contrato en {{lugar_firma}} el día {{fecha_firma}}.

ARRENDADOR: _________________
ARRENDATARIO: _________________`,
    variables: [
      {
        name: "arrendador_nombre",
        label: "Nombre del Arrendador",
        type: "text",
        required: true,
        placeholder: "Nombre completo del arrendador",
        description: "Nombre completo del propietario que arrienda"
      },
      {
        name: "arrendador_documento",
        label: "Documento del Arrendador",
        type: "text",
        required: true,
        placeholder: "Cédula de identidad del arrendador",
        description: "Número de documento de identidad del arrendador"
      },
      {
        name: "arrendador_direccion",
        label: "Dirección del Arrendador",
        type: "textarea",
        required: true,
        placeholder: "Dirección completa del arrendador",
        description: "Dirección de residencia del arrendador"
      },
      {
        name: "arrendatario_nombre",
        label: "Nombre del Arrendatario",
        type: "text",
        required: true,
        placeholder: "Nombre completo del arrendatario",
        description: "Nombre completo de la persona que arrienda"
      },
      {
        name: "arrendatario_documento",
        label: "Documento del Arrendatario",
        type: "text",
        required: true,
        placeholder: "Cédula de identidad del arrendatario",
        description: "Número de documento de identidad del arrendatario"
      },
      {
        name: "arrendatario_direccion",
        label: "Dirección del Arrendatario",
        type: "textarea",
        required: true,
        placeholder: "Dirección completa del arrendatario",
        description: "Dirección de residencia del arrendatario"
      },
      {
        name: "inmueble_direccion",
        label: "Dirección del Inmueble",
        type: "textarea",
        required: true,
        placeholder: "Dirección completa del inmueble",
        description: "Dirección exacta del inmueble arrendado"
      },
      {
        name: "plazo_arrendamiento",
        label: "Plazo de Arrendamiento",
        type: "number",
        required: true,
        placeholder: "Número de meses",
        description: "Duración del contrato en meses"
      },
      {
        name: "canon_mensual",
        label: "Canon Mensual",
        type: "number",
        required: true,
        placeholder: "Monto del canon mensual",
        description: "Precio mensual del arrendamiento"
      },
      {
        name: "canon_letras",
        label: "Canon en Letras",
        type: "text",
        required: true,
        placeholder: "Canon mensual escrito en letras",
        description: "Precio mensual escrito en letras"
      },
      {
        name: "dias_pago",
        label: "Días para Pago",
        type: "number",
        required: true,
        placeholder: "Número de días",
        description: "Días del mes para realizar el pago"
      },
      {
        name: "deposito_garantia",
        label: "Depósito de Garantía",
        type: "number",
        required: true,
        placeholder: "Monto del depósito",
        description: "Monto del depósito de garantía"
      },
      {
        name: "deposito_letras",
        label: "Depósito en Letras",
        type: "text",
        required: true,
        placeholder: "Depósito escrito en letras",
        description: "Depósito de garantía escrito en letras"
      },
      {
        name: "lugar_firma",
        label: "Lugar de Firma",
        type: "text",
        required: true,
        placeholder: "Ciudad donde se firma el contrato",
        description: "Ciudad donde se firma el contrato"
      },
      {
        name: "fecha_firma",
        label: "Fecha de Firma",
        type: "date",
        required: true,
        placeholder: "",
        description: "Fecha de firma del contrato"
      }
    ],
    isDefault: true,
    isActive: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z"
  },
  {
    id: "3",
    name: "Contrato de Corretaje Inmobiliario",
    description: "Plantilla para contratos de corretaje inmobiliario",
    type: "BROKERAGE",
    content: `CONTRATO DE CORRETAJE INMOBILIARIO

Entre los suscritos, a saber:

PROPIETARIO: {{propietario_nombre}}, identificado con {{propietario_documento}}, domiciliado en {{propietario_direccion}}, a quien en adelante se le denominará "EL PROPIETARIO";

CORREDOR: {{corredor_nombre}}, identificado con {{corredor_documento}}, domiciliado en {{corredor_direccion}}, a quien en adelante se le denominará "EL CORREDOR";

Se ha convenido celebrar el presente contrato de corretaje inmobiliario, que se regirá por las siguientes cláusulas:

PRIMERA: OBJETO DEL CONTRATO
El PROPIETARIO encomienda al CORREDOR la gestión de {{tipo_operacion}} del inmueble ubicado en {{inmueble_direccion}}, identificado con matrícula inmobiliaria {{matricula_inmobiliaria}}.

SEGUNDA: COMISIÓN
El CORREDOR tendrá derecho a una comisión del {{porcentaje_comision}}% sobre el valor de la operación, que será pagada al momento de la firma del contrato definitivo.

TERCERA: DURACIÓN
El presente contrato tendrá una duración de {{duracion_contrato}} meses, contados desde la fecha de firma.

CUARTA: OBLIGACIONES DEL CORREDOR
- Promocionar el inmueble
- Gestionar visitas de potenciales clientes
- Negociar las mejores condiciones para el PROPIETARIO
- Mantener informado al PROPIETARIO sobre el progreso

QUINTA: OBLIGACIONES DEL PROPIETARIO
- Proporcionar información veraz sobre el inmueble
- Facilitar las visitas programadas
- No negociar directamente con clientes del CORREDOR
- Pagar la comisión acordada

En fe de lo cual se firma el presente contrato en {{lugar_firma}} el día {{fecha_firma}}.

PROPIETARIO: _________________
CORREDOR: _________________`,
    variables: [
      {
        name: "propietario_nombre",
        label: "Nombre del Propietario",
        type: "text",
        required: true,
        placeholder: "Nombre completo del propietario",
        description: "Nombre completo del propietario del inmueble"
      },
      {
        name: "propietario_documento",
        label: "Documento del Propietario",
        type: "text",
        required: true,
        placeholder: "Cédula de identidad del propietario",
        description: "Número de documento de identidad del propietario"
      },
      {
        name: "propietario_direccion",
        label: "Dirección del Propietario",
        type: "textarea",
        required: true,
        placeholder: "Dirección completa del propietario",
        description: "Dirección de residencia del propietario"
      },
      {
        name: "corredor_nombre",
        label: "Nombre del Corredor",
        type: "text",
        required: true,
        placeholder: "Nombre completo del corredor",
        description: "Nombre completo del corredor inmobiliario"
      },
      {
        name: "corredor_documento",
        label: "Documento del Corredor",
        type: "text",
        required: true,
        placeholder: "Cédula de identidad del corredor",
        description: "Número de documento de identidad del corredor"
      },
      {
        name: "corredor_direccion",
        label: "Dirección del Corredor",
        type: "textarea",
        required: true,
        placeholder: "Dirección completa del corredor",
        description: "Dirección de residencia del corredor"
      },
      {
        name: "tipo_operacion",
        label: "Tipo de Operación",
        type: "select",
        required: true,
        placeholder: "",
        description: "Tipo de operación inmobiliaria",
        options: ["Venta", "Alquiler", "Compra", "Inversión"]
      },
      {
        name: "inmueble_direccion",
        label: "Dirección del Inmueble",
        type: "textarea",
        required: true,
        placeholder: "Dirección completa del inmueble",
        description: "Dirección exacta del inmueble"
      },
      {
        name: "matricula_inmobiliaria",
        label: "Matrícula Inmobiliaria",
        type: "text",
        required: true,
        placeholder: "Número de matrícula inmobiliaria",
        description: "Número de matrícula inmobiliaria del inmueble"
      },
      {
        name: "porcentaje_comision",
        label: "Porcentaje de Comisión",
        type: "number",
        required: true,
        placeholder: "Porcentaje de comisión",
        description: "Porcentaje de comisión sobre la operación"
      },
      {
        name: "duracion_contrato",
        label: "Duración del Contrato",
        type: "number",
        required: true,
        placeholder: "Número de meses",
        description: "Duración del contrato en meses"
      },
      {
        name: "lugar_firma",
        label: "Lugar de Firma",
        type: "text",
        required: true,
        placeholder: "Ciudad donde se firma el contrato",
        description: "Ciudad donde se firma el contrato"
      },
      {
        name: "fecha_firma",
        label: "Fecha de Firma",
        type: "date",
        required: true,
        placeholder: "",
        description: "Fecha de firma del contrato"
      }
    ],
    isDefault: true,
    isActive: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z"
  }
]; 