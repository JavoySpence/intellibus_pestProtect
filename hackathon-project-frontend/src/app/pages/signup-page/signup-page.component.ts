import { Component } from '@angular/core';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-signup-page',
  templateUrl: './signup-page.component.html',   // ✅ fixed
  styleUrls: ['./signup-page.component.css']
})
export class SignupPageComponent {

  email: string = '';
  password: string = '';

  constructor(private authService: AuthServiceService) {}

  signUp() {

    const userData = {
      email: this.email,
      password: this.password
    };

    this.authService.signUp(userData).subscribe({
      next: (response: any) => {

        Swal.fire({
          icon: 'success',
          title: 'Signup Successful 🎉',
          text: 'Your account has been created!',
          confirmButtonColor: '#3085d6'
        });

        console.log('Signup success:', response);

        // clear fields
        this.email = '';
        this.password = '';

      },

      error: (error: any) => {

        Swal.fire({
          icon: 'error',
          title: 'Signup Failed ❌',
          text: 'Please try again or use another email.',
          confirmButtonColor: '#d33'
        });

        console.error('Signup failed:', error);

      }
    });

  }
}