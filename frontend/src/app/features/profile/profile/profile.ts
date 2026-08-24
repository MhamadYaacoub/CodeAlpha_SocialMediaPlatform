import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../../core/services/user';
import { Auth } from '../../../core/services/auth';
import { PostCard } from '../../../shared/components/post-card/post-card';
import { Upload } from '../../../core/services/upload';

@Component({selector:'app-profile',standalone:true,imports:[FormsModule,PostCard],templateUrl:'./profile.html',styleUrl:'./profile.scss'})
export class Profile implements OnInit {
  profile=signal<any>(null);loading=signal(true);saving=signal(false);uploading=signal(false);message=signal('');connections=signal<any[]>([]);connectionTitle=signal('');name='';bio='';profileImage='';
  menuOpen=signal(false);
  readonly currentUser:ReturnType<Auth['getCurrentUser']>;
  constructor(private service:User,private auth:Auth,private router:Router,private route:ActivatedRoute,private upload:Upload){this.currentUser=auth.getCurrentUser();}
  ngOnInit():void{this.route.paramMap.subscribe(params=>{const routeId=params.get('id');if(routeId){this.load(Number(routeId));return;}this.service.me().subscribe({next:({user})=>{this.auth.updateCurrentUser(user);this.load(user.id);},error:()=>{this.message.set('Unable to load your profile. Please sign in again.');this.loading.set(false);}});});}
  load(id:number):void{this.loading.set(true);this.service.profile(id).subscribe({next:data=>{this.profile.set(data);this.name=data.user.name;this.bio=data.user.bio||'';this.profileImage=data.user.profileImage||'';this.loading.set(false);},error:()=>this.loading.set(false)});}
  save():void{this.saving.set(true);this.service.updateMe({name:this.name,bio:this.bio,profileImage:this.profileImage}).subscribe({next:({user})=>{this.auth.updateCurrentUser(user);this.load(user.id);this.message.set('Profile saved.');this.saving.set(false);},error:e=>{this.message.set(e?.error?.message||'Unable to save.');this.saving.set(false);}});}
  follow():void{const data=this.profile();if(!data)return;this.service.toggleFollow(data.user.id).subscribe((result:any)=>{data.following=result.following;data.requestStatus=result.requestStatus;});}
  showFollowers():void{const id=this.profile()?.user.id;if(!id)return;this.service.followers(id).subscribe(data=>{this.connections.set(data.followers.map((item:any)=>item.follower));this.connectionTitle.set('Followers');});}
  showFollowing():void{const id=this.profile()?.user.id;if(!id)return;this.service.following(id).subscribe(data=>{this.connections.set(data.following.map((item:any)=>item.followingUser));this.connectionTitle.set('Following');});}
  visit(id:number):void{this.connections.set([]);this.router.navigate(['/profile',id]);}
  logout():void{this.auth.logout();this.router.navigate(['/login']);}
  uploadProfileImage(event:Event):void{const input=event.target as HTMLInputElement;const file=input.files?.[0];if(!file)return;if(!file.type.startsWith('image/')){this.message.set('Please choose an image file.');return;}this.uploading.set(true);this.message.set('');this.upload.file(file).subscribe({next:({url})=>{this.profileImage=url;this.uploading.set(false);this.message.set('Photo uploaded. Save changes to apply it.');},error:e=>{this.uploading.set(false);this.message.set(e?.error?.message||'Unable to upload profile photo.');}});input.value='';}
  removeProfileImage():void{this.profileImage='';this.message.set('Photo removed. Save changes to apply it.');}
  openSettings():void{this.menuOpen.set(false);this.router.navigate(['/settings']);}
}
