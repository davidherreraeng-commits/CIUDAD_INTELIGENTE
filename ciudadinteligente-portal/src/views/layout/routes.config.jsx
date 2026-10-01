import { Group, HomeWork, Assessment, Paid, CloudDone, Storage, Savings } from "@mui/icons-material";

import { Projects } from "../projects";
import { Users } from "../users";
import { Report } from "../report"
import BillingDashboard from "../billing";
import { CloudAuthorizations } from "../cloud-authorizations";
import { Inventory } from "../inventory";
import ContractsCreditsDashboard from "../contracts-credits";

export const menuItems = [
  {
    pathname: 'projects',
    label: 'Gestión de proyectos',
    text: 'Gestión de proyectos',
    icon: <HomeWork />,
    roleId: [1, 4, 'system_manager'],
    component: <Projects />
  },
  {
    pathname: 'users',
    label: 'Administrar usuarios',
    icon: <Group />,
    roleId: [4, 'system_manager'],
    component: <Users />
  },
  {
    pathname: 'report',
    label: 'Reporte',
    icon: <Assessment />,
    roleId: [1, 4, 'system_manager'],
    component: <Report />,
    // Pathnames de los items que se muestran como submenú desplegable de "Reporte"
    children: ['billing', 'inventory', 'contracts-credits']
  },
  {
    pathname: 'billing', // La URL será /billing
    label: 'Facturación Azure',
    text: 'Facturación Azure', // Esto es lo que aparecerá en el Tooltip del menú
    icon: <Paid />,
    roleId: [4, 'system_manager'],
    component: <BillingDashboard />,
    parentPathname: 'report'
  },
  {
    pathname: 'contracts-credits', // La URL será /contracts-credits
    label: 'Créditos por Contrato',
    text: 'Créditos por Contrato',
    icon: <Savings />,
    roleId: [4, 'system_manager'],
    component: <ContractsCreditsDashboard />,
    parentPathname: 'report'
  },
  {
    pathname: 'inventory',
    label: 'Inventario agente Alcalde',
    text: 'Inventario agente Alcalde',
    icon: <Storage />,
    roleId: [1, 4, 'system_manager'],
    component: <Inventory />,
    parentPathname: 'report'
  },
  {
    pathname: 'cloud-authorizations',
    label: 'Autorizaciones Cloud',
    text: 'Aprobación presupuestal Azure',
    icon: <CloudDone />,
    roleId: [4, 'system_manager'],
    component: <CloudAuthorizations />
  }

]
