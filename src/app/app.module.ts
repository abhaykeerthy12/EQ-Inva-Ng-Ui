import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { SidebarModule } from 'ng-sidebar';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './core/home/home.component';
import { ExternalComponent } from './core/external/external.component';
import { AddRequestComponent } from './core/home/basic/add-request/add-request.component';
import { RequestHistoryComponent } from './core/home/basic/request-history/request-history.component';
import { UserSettingsComponent } from './core/home/basic/user-settings/user-settings.component';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { WelcomeComponent } from './core/external/welcome/welcome.component';
import { AboutComponent } from './core/external/about/about.component';
import { ContactComponent } from './core/external/contact/contact.component';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { ManageProductsComponent } from './core/home/advanced/manage-products/manage-products.component';
import { GridModule, ExcelModule, PDFModule  } from '@progress/kendo-angular-grid';
import { AuthInterceptorService } from './shared/interceptors/auth-interceptor';
import { UserService } from './shared/services/user.service';
import { RequestService } from './shared/services/request.service';
import { ProductService } from './shared/services/product.service';
import { UploadModule } from '@progress/kendo-angular-upload';
import { ManageUsersComponent } from './core/home/advanced/manage-users/manage-users.component';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { ManagerGuard } from './shared/guards/manager.guard';
import { UserGuard } from './shared/guards/user.guard';
import { AdminGuard } from './shared/guards/admin.guard';
import { AuthGuard } from './shared/guards/auth.guard';
import { ManageRequestsComponent } from './core/home/advanced/manage-requests/manage-requests.component';
import { DashboardComponent } from './core/home/advanced/dashboard/dashboard.component';
import { CreatorGuard } from './shared/guards/creator.guard';
import { ChartsModule } from '@progress/kendo-angular-charts';
import 'hammerjs';









@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ExternalComponent,
    AddRequestComponent,
    RequestHistoryComponent,
    UserSettingsComponent,
    WelcomeComponent,
    AboutComponent,
    ContactComponent,
    ManageProductsComponent,
    ManageUsersComponent,
    ManageRequestsComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    SidebarModule,
    ButtonsModule,
    InputsModule,
    NotificationModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    GridModule,
    ExcelModule,
    PDFModule,
    UploadModule,
    DropDownsModule,
    ChartsModule 
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true
    },
    UserService, RequestService, ProductService, , AuthGuard, AdminGuard, UserGuard, ManagerGuard, CreatorGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
