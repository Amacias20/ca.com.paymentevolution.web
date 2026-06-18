# Payment Evolution - Web App (Prueba Técnica)

Este proyecto es el frontend de una aplicación web desarrollada como **Prueba Técnica**. Su objetivo es demostrar la capacidad de integración y desarrollo completo del lado del cliente, consumiendo una API REST desarrollada en .NET.

## Tecnologías Utilizadas

El proyecto fue desarrollado utilizando el siguiente stack tecnológico moderno:

- **React 19**: Biblioteca principal para la construcción de interfaces de usuario.
- **Vite**: Herramienta de construcción (bundler) ultrarrápida y servidor de desarrollo.
- **TypeScript**: Superset de JavaScript para tipado estático y mayor seguridad en el desarrollo.
- **Redux Toolkit**: Para la gestión global del estado de la aplicación (ej. autenticación).
- **Kendo UI (KendoReact)**: Biblioteca de componentes premium utilizada ampliamente para:
  - Tablas de datos (Grid) con paginación y filtros.
  - Componentes de formulario (Inputs, DropDowns, DateRangePicker).
  - Diálogos y Modales.
  - Gráficos y visualizaciones (Charts).
- **Axios**: Cliente HTTP para realizar peticiones e interactuar con el backend de forma segura mediante interceptores.
- **React Router v7**: Manejo de rutas, navegación y "Lazy Loading" (carga diferida) para una carga óptima de componentes y vistas.
- **i18next**: Soporte multilingüe para internacionalización (i18n).
- **Vanilla CSS**: Sistema de diseño basado en variables y estilos puramente customizados, logrando una estética moderna tipo *Glassmorphism* sin depender de frameworks pesados de CSS.

## Características Implementadas

- **Autenticación (Login)**: Protegido por JWT.
- **Dashboard Resumen**: Con métricas y gráficos estadísticos.
- **Gestión (CRUD)**: Módulos completos para listar, crear, editar y eliminar Empleados, Usuarios, Roles, Tipos de Ausencias y Ausencias.
- **Reportes Pivotales**: Tabla dinámica para reportes de ausencias de empleados con totales por fila y columna.
- **Diseño Responsivo y Temas**: Soporte para temas Claro/Oscuro dinámico e interfaz adaptada a diferentes tamaños de pantalla.
- **Optimización**: Lazy loading en todas las rutas para reducir drásticamente el peso inicial.

---
*Desarrollado como demostración de habilidades de diseño de UI/UX y conexión a servicios C# .NET.*
