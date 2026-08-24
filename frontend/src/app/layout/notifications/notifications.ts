import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationItem, NotificationService } from '../../core/services/notification';
import { User } from '../../core/services/user';

@Component({ selector:'app-notifications', standalone:true, imports:[DatePipe], templateUrl:'./notifications.html', styleUrl:'./notifications.scss' })
export class Notifications implements OnInit, OnDestroy {
  open = signal(false); items = signal<NotificationItem[]>([]); private timer?: ReturnType<typeof setInterval>;
  processing=signal<Set<number>>(new Set()); actionError=signal('');
  constructor(public service:NotificationService, private users:User, private router:Router) {}
  ngOnInit():void { this.refresh(); this.timer=setInterval(()=>this.refresh(false),15000); }
  ngOnDestroy():void { if(this.timer) clearInterval(this.timer); }
  refresh(updateItems=true):void { this.service.list().subscribe(({notifications,unreadCount})=>{if(updateItems)this.items.set(notifications);this.service.unreadNotifications.set(unreadCount)}); this.service.refreshBadges(); }
  toggle():void { this.open.update(v=>!v); if(this.open()){this.refresh();this.service.markRead().subscribe(()=>this.service.unreadNotifications.set(0));} }
  text(item:NotificationItem):string { return ({like:'liked your post',comment:'commented on your post',follow_request:'sent you a follow request',follow_accepted:'accepted your follow request',message:'sent you a message'} as any)[item.type]; }
  isProcessing(item:NotificationItem):boolean{return this.processing().has(item.id);}
  private setProcessing(id:number,value:boolean):void{this.processing.update(current=>{const next=new Set(current);value?next.add(id):next.delete(id);return next;});}
  respond(item:NotificationItem,action:'accept'|'decline'):void {if(!item.followRequestId||this.isProcessing(item))return;this.actionError.set('');this.setProcessing(item.id,true);this.service.respond(item.followRequestId,action).subscribe({next:(result)=>{item.requestStatus=result.status;item.response=action;this.setProcessing(item.id,false);if(action==='decline')this.items.update(items=>items.filter(value=>value.id!==item.id));},error:(error)=>{this.setProcessing(item.id,false);this.actionError.set(error?.error?.message||'Unable to process this request.');this.refresh();}});}
  followBack(item:NotificationItem):void {if(this.isProcessing(item))return;this.setProcessing(item.id,true);this.users.toggleFollow(item.actorId).subscribe({next:()=>{item.followedBack=true;item.followingActor=true;this.setProcessing(item.id,false);},error:()=>{this.setProcessing(item.id,false);this.actionError.set('Unable to send follow request.');}});}
  visit(item:NotificationItem):void { this.open.set(false); if(item.type==='message')this.router.navigate(['/messages'],{queryParams:{conversation:item.conversationId}}); else this.router.navigate(['/profile',item.actorId]); }
}
