import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './core/home/home.component';
import { AddRequestComponent } from './core/home/basic/add-request/add-request.component';
import { ExternalComponent } from './core/external/external.component';
import { WelcomeComponent } from './core/external/welcome/welcome.component';
import { AboutComponent } from './core/external/about/about.component';
import { ContactComponent } from './core/external/contact/contact.component';
import { ManageProductsComponent } from './core/home/advanced/manage-products/manage-products.component';
import { ManageUsersComponent } from './core/home/advanced/manage-users/manage-users.component';
import { UserGuard } from './shared/guards/user.guard';
import { AuthGuard } from './shared/guards/auth.guard';
import { AdminGuard } from './shared/guards/admin.guard';


const routes: Routes = [
  {
    path: 'welcome',  
    component: ExternalComponent,
    canActivate: [UserGuard],
    children: [
      {
        path: '',
        component: WelcomeComponent
      }
    ]
  },
  {
    path: 'about',
    component: ExternalComponent,
    canActivate: [UserGuard],
    children: [
      {
        path: '',
        component: AboutComponent
      }
    ]
  },
  {
    path: 'contact',
    component: ExternalComponent,
    canActivate: [UserGuard],
    children: [
      {
        path: '',
        component: ContactComponent
      }
    ]
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: AddRequestComponent
      }
    ]
  },
  {
    path: 'products',
    component: HomeComponent,
    canActivate: [AdminGuard],
    children: [
      {
        path: '',
        component: ManageProductsComponent
      }
    ]
  },
  {
    path: 'users',
    component: HomeComponent,
    canActivate: [AdminGuard],
    children: [
      {
        path: '',
        component: ManageUsersComponent
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
