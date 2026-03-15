import { Component } from '@angular/core';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {

  email: string = '';
  password: string = '';
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private authService: AuthServiceService,
    private router: Router
  ) {}

  // Login function called on form submit
  login() {
    this.errorMessage = '';
    this.loading = true;

    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password';
      this.loading = false;
      return;
    }

    this.authService.login({ email: this.email, password: this.password })
      .subscribe({
        next: (token: string) => {
          // Save the token in localStorage (or any storage you prefer)
          localStorage.setItem('authToken', token);

          // Navigate to dashboard or home page
          this.router.navigate(['/chat']);
        },
        error: (err: { error: { message: string; }; }) => {
          this.errorMessage = err.error?.message || 'Login failed. Please try again.';
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
  }
}