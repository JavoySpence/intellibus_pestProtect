import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignupPageComponent } from './pages/signup-page/signup-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { ChatInterfaceComponent } from './pages/chat-interface/chat-interface.component';



const routes: Routes = [
  { path: '', redirectTo: 'signup', pathMatch: 'full' }, // default home route
  { path: 'signup', component: SignupPageComponent },
  { path: 'login', component: LoginPageComponent  },
  { path: 'chat', component: ChatInterfaceComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
