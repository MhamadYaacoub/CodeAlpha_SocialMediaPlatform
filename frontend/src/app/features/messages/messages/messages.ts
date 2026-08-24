import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Message, Conversation } from '../../../core/services/message';
import { Auth } from '../../../core/services/auth';
import { NotificationService } from '../../../core/services/notification';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './messages.html',
  styleUrl: './messages.scss',
})
export class Messages implements OnInit, OnDestroy {
  conversations = signal<Conversation[]>([]); selected = signal<Conversation | null>(null); messages = signal<any[]>([]); loading = signal(true); error = signal(''); draft = '';
  readonly currentUser: ReturnType<Auth['getCurrentUser']>;
  sending=signal(false);
  mobileChatOpen=signal(false);
  private refreshTimer?: ReturnType<typeof setInterval>;
  constructor(private service: Message, private auth: Auth,private notifications:NotificationService,private route:ActivatedRoute) { this.currentUser = auth.getCurrentUser(); }
  ngOnInit(): void { this.load();this.refreshTimer=setInterval(()=>this.load(true),10000); }
  ngOnDestroy():void{if(this.refreshTimer)clearInterval(this.refreshTimer);}
  load(background=false): void { this.service.conversations().subscribe({ next: ({ conversations,unreadCount }) => { this.conversations.set(conversations);this.notifications.unreadMessages.set(unreadCount||0);this.loading.set(false);const requested=Number(this.route.snapshot.queryParamMap.get('conversation'));const selectedId=this.selected()?.id;const target=conversations.find(item=>item.id===(requested||selectedId))||(!background?conversations[0]:undefined);if(target){if(target.id!==selectedId)this.select(target,Boolean(requested));else this.selected.set(target);}else if(selectedId&&!conversations.some(item=>item.id===selectedId)){this.selected.set(null);this.messages.set([]);this.mobileChatOpen.set(false);} }, error: () => { if(!background)this.error.set('Unable to load conversations.'); this.loading.set(false); } }); }
  select(item: Conversation,openMobile=true): void { this.selected.set(item);this.mobileChatOpen.set(openMobile); this.service.messages(item.id).subscribe(({ messages }) => this.messages.set(messages)); this.service.read(item.id).subscribe(()=>{this.notifications.unreadMessages.update(value=>Math.max(0,value-item.unreadCount));item.unreadCount=0;}); }
  backToList():void{this.mobileChatOpen.set(false);}
  send(): void { const content=this.draft.trim(), conversation=this.selected(); if (!content || !conversation||this.sending()) return;this.sending.set(true); this.service.send(conversation.id, content).subscribe({next:({ data }) => { this.messages.update(items => [...items, { ...data, sender: this.currentUser }]); this.draft='';this.sending.set(false);},error:()=>this.sending.set(false)}); }
  other(item: Conversation): any { return item.participants?.find(p => p.userId !== this.currentUser?.id)?.user; }
}
