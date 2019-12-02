import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { SidebarModule } from 'ng-sidebar';

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
    ContactComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    SidebarModule,
    ButtonsModule,
    InputsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
