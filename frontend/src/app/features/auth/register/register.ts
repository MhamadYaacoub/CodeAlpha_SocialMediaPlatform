import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  name = '';
  username = '';
  email = '';
  password = '';
  confirmPassword = '';

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

  register(): void {
    this.errorMessage.set('');

    if (!this.name || !this.username || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage.set('Please complete all fields.');
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage.set('Password must be at least 8 characters.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    this.loading.set(true);

    this.authService
      .register({
        name: this.name,
        username: this.username,
        email: this.email,
        password: this.password,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);

          this.router.navigate(['/login'], {
            queryParams: {
              registered: 'true',
            },
          });
        },

        error: (error) => {
          this.loading.set(false);

          this.errorMessage.set(error?.error?.message || 'Unable to create your account.');
        },
      });
  }
}
