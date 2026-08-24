import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { MobileNav } from '../mobile-nav/mobile-nav';
import { RightSidebar } from '../right-sidebar/right-sidebar';
import { Notifications } from '../notifications/notifications';
import { AppLanguage, LanguageService } from '../../core/services/language';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [RouterOutlet, Sidebar, MobileNav, RightSidebar, Notifications],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.scss',
})
export class AppLayout {
  constructor(public language:LanguageService){}
  changeLanguage(event:Event):void{this.language.setLanguage((event.target as HTMLSelectElement).value as AppLanguage);}
}
