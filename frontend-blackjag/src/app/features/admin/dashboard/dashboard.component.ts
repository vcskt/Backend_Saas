import { Component } from '@angular/core';
import { PoPageModule } from '@po-ui/ng-components';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [PoPageModule],
  template: '<po-page-default p-title="Dashboard Administrativo"><div class="po-row">Painel.</div></po-page-default>',
})
export class DashboardComponent {}
