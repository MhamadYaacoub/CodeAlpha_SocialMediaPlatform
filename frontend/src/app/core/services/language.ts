import { Injectable, signal } from '@angular/core';

export type AppLanguage = 'en' | 'fr' | 'ar';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  readonly language = signal<AppLanguage>('en');
  readonly direction = signal<'ltr' | 'rtl'>('ltr');

  private readonly messages: Record<AppLanguage, Record<string, string>> = {
    en: { home:'Home',explore:'Explore',messages:'Messages',profile:'Profile',createPost:'Create post',signOut:'Sign out',notifications:'Notifications',search:'Search',what:'What\'s happening?',post:'Post',latest:'Latest posts',yourStory:'Your story',newStory:'New story',shareStory:'Share story',back:'Back',language:'Language' },
    fr: { home:'Accueil',explore:'Explorer',messages:'Messages',profile:'Profil',createPost:'Créer une publication',signOut:'Déconnexion',notifications:'Notifications',search:'Rechercher',what:'Quoi de neuf ?',post:'Publier',latest:'Publications récentes',yourStory:'Votre story',newStory:'Nouvelle story',shareStory:'Partager',back:'Retour',language:'Langue' },
    ar: { home:'الرئيسية',explore:'استكشاف',messages:'الرسائل',profile:'الملف الشخصي',createPost:'إنشاء منشور',signOut:'تسجيل الخروج',notifications:'الإشعارات',search:'بحث',what:'بماذا تفكر؟',post:'نشر',latest:'أحدث المنشورات',yourStory:'قصتك',newStory:'قصة جديدة',shareStory:'مشاركة',back:'رجوع',language:'اللغة' },
  };

  constructor() {
    const saved = localStorage.getItem('socially-language') as AppLanguage | null;
    this.setLanguage(saved && ['en','fr','ar'].includes(saved) ? saved : 'en');
  }

  setLanguage(language: AppLanguage): void {
    this.language.set(language);
    this.direction.set(language === 'ar' ? 'rtl' : 'ltr');
    localStorage.setItem('socially-language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = this.direction();
  }

  text(key: string): string { return this.messages[this.language()][key] || this.messages.en[key] || key; }
}
