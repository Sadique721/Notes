import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'modules',
    loadComponent: () => import('./components/modules/modules.component').then(m => m.ModulesComponent)
  },
  {
    path: 'topic/:slug',
    loadComponent: () => import('./components/topic-detail/topic-detail.component').then(m => m.TopicDetailComponent)
  },
  {
    path: 'interview-vault',
    loadComponent: () => import('./components/interview-vault/interview-vault.component').then(m => m.InterviewVaultComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
