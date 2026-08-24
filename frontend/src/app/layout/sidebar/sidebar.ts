import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../core/services/auth';
import { NotificationService } from '../../core/services/notification';
import { LanguageService } from '../../core/services/language';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  get user() { return this.auth.currentUser(); }
  constructor(public auth: Auth, private router: Router, public notifications: NotificationService,public language:LanguageService) {}
  logout(): void { this.auth.logout(); this.router.navigate(['/login']); }
}
