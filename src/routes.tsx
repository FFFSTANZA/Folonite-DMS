import type { ComponentType } from 'react';
import About from './pages/About';
import AlertEngine from './pages/AlertEngine';
import Analyzer from './pages/Analyzer';
import CostAnalysis from './pages/CostAnalysis';
import DashboardHome from './pages/DashboardHome';
import DataImport from './pages/DataImport';
import FaultDiagnosis from './pages/FaultDiagnosis';
import Help from './pages/Help';
import PredictiveFailure from './pages/PredictiveFailure';
import WhatIfSimulator from './pages/WhatIfSimulator';

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
    name: 'What-If Simulator',
    path: '/what-if',
    component: WhatIfSimulator,
    visible: true
  },
  {
    name: 'Alert Engine',
    path: '/alerts',
    component: AlertEngine,
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
