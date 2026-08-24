import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NotificationService } from '../../core/services/notification';

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './mobile-nav.html',
  styleUrl: './mobile-nav.scss',
})
export class MobileNav { constructor(private router: Router, public notifications:NotificationService) {} create(): void { this.router.navigate(['/feed'], { fragment: 'create-post' }); } }
