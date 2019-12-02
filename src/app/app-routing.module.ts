import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './core/home/home.component';
import { AddRequestComponent } from './core/home/basic/add-request/add-request.component';
import { ExternalComponent } from './core/external/external.component';
import { WelcomeComponent } from './core/external/welcome/welcome.component';


const routes: Routes = [
  {
    path: 'welcome',
    component: ExternalComponent,
    children: [
      {
        path: '',
        component: WelcomeComponent
      }
    ]
  },
  {
    path: 'home',
    component: HomeComponent,
    children: [
      {
        path: '',
        component: AddRequestComponent
      }
    ]
  },
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full'
  },
  {
      path: '**',
      redirectTo: 'welcome',
      pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
