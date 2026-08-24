import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../core/services/auth';
import { AppLanguage, LanguageService } from '../../core/services/language';
import { Upload } from '../../core/services/upload';
import { User } from '../../core/services/user';

@Component({selector:'app-settings',standalone:true,imports:[FormsModule],templateUrl:'./settings.html',styleUrl:'./settings.scss'})
export class Settings implements OnInit {
  loading=signal(true);saving=signal(false);uploading=signal(false);message=signal('');
  name='';bio='';profileImage='';
  constructor(private users:User,private auth:Auth,private upload:Upload,private router:Router,public language:LanguageService){}
  ngOnInit():void{this.users.me().subscribe({next:({user})=>{this.name=user.name;this.bio=user.bio||'';this.profileImage=user.profileImage||'';this.loading.set(false);},error:()=>this.loading.set(false)});}
  save():void{if(this.saving())return;this.saving.set(true);this.users.updateMe({name:this.name,bio:this.bio,profileImage:this.profileImage}).subscribe({next:({user})=>{this.auth.updateCurrentUser(user);this.message.set('Profile saved successfully.');this.saving.set(false);},error:e=>{this.message.set(e?.error?.message||'Unable to save your profile.');this.saving.set(false);}});}
  uploadPhoto(event:Event):void{const input=event.target as HTMLInputElement,file=input.files?.[0];if(!file)return;if(!file.type.startsWith('image/')){this.message.set('Choose an image file.');return;}this.uploading.set(true);this.upload.file(file).subscribe({next:({url})=>{this.profileImage=url;this.uploading.set(false);this.message.set('Photo ready. Save changes to apply it.');},error:e=>{this.uploading.set(false);this.message.set(e?.error?.message||'Photo upload failed.');}});input.value='';}
  removePhoto():void{this.profileImage='';this.message.set('Photo removed. Save changes to apply it.');}
  changeLanguage(event:Event):void{this.language.setLanguage((event.target as HTMLSelectElement).value as AppLanguage);}
  back():void{this.router.navigate(['/profile']);}
  logout():void{this.auth.logout();this.router.navigate(['/login']);}
}
