import DashboardHome from './pages/DashboardHome';
import DataImport from './pages/DataImport';
import FaultDiagnosis from './pages/FaultDiagnosis';
import CostAnalysis from './pages/CostAnalysis';
import Analyzer from './pages/Analyzer';
import PredictiveFailure from './pages/PredictiveFailure';
import Help from './pages/Help';
import About from './pages/About';
import type { ComponentType } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  component: ComponentType;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Dashboard Home',
    path: '/',
    component: DashboardHome,
    visible: true
  },
  {
    name: 'Data Import',
    path: '/data-import',
    component: DataImport,
    visible: false
  },
  {
    name: 'Fault Diagnosis',
    path: '/fault-diagnosis',
    component: FaultDiagnosis,
    visible: true
  },
  {
    name: 'Cost Analysis',
    path: '/cost-analysis',
    component: CostAnalysis,
    visible: true
  },
  {
    name: 'Predictive Failure',
    path: '/predictive',
    component: PredictiveFailure,
    visible: true
  },
  {
    name: 'Performance Analytics',
    path: '/performance-analytics',
    component: Analyzer,
    visible: true
  },
  {
    name: 'Help',
    path: '/help',
    component: Help,
    visible: false
  },
  {
    name: 'About',
    path: '/about',
    component: About,
    visible: false
  }
];

export default routes;
