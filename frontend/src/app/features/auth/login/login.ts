import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  email = '';
  password = '';

  showPassword = signal(false);
  loading = signal(false);
  errorMessage = signal('');

  constructor(
    private authService: Auth,
    private router: Router,
  ) {}

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  login(): void {
    this.errorMessage.set('');

    if (!this.email || !this.password) {
      this.errorMessage.set('Please enter your email and password.');
      return;
    }

    this.loading.set(true);

    this.authService
      .login({
        email: this.email,
        password: this.password,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/feed']);
        },

        error: (error) => {
          this.loading.set(false);

          this.errorMessage.set(error?.error?.message || 'Unable to sign in. Please try again.');
        },
      });
  }
}
