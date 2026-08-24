import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User, DiscoverUser } from '../../../core/services/user';
import { Message } from '../../../core/services/message';
import { Router } from '@angular/router';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './explore.html',
  styleUrl: './explore.scss',
})
export class Explore implements OnInit {
  users = signal<DiscoverUser[]>([]); loading = signal(true); error = signal(''); search = '';
  processing=signal<Set<number>>(new Set());
  constructor(private usersService: User, private messagesService: Message, private router: Router) {}
  ngOnInit(): void { this.load(); }
  load(): void { this.loading.set(true); this.usersService.list(this.search.trim()).subscribe({ next: ({ users }) => { this.users.set(users); this.loading.set(false); }, error: () => { this.error.set('Unable to load people.'); this.loading.set(false); } }); }
  isProcessing(id:number):boolean{return this.processing().has(id);}
  private setProcessing(id:number,value:boolean):void{this.processing.update(current=>{const next=new Set(current);value?next.add(id):next.delete(id);return next;});}
  follow(user: DiscoverUser): void {if(this.isProcessing(user.id))return;this.setProcessing(user.id,true);this.usersService.toggleFollow(user.id).subscribe({next:(result:any)=>{user.following=result.following;user.requestStatus=result.requestStatus;this.setProcessing(user.id,false);},error:()=>this.setProcessing(user.id,false)}); }
  message(user: DiscoverUser): void {if(this.isProcessing(user.id))return;this.setProcessing(user.id,true);this.messagesService.start(user.id).subscribe({ next: () => {this.setProcessing(user.id,false);this.router.navigate(['/messages']);}, error: (e) => {this.setProcessing(user.id,false);this.error.set(e?.error?.message || 'Follow each other before messaging.');} }); }
  profile(user:DiscoverUser):void{this.router.navigate(['/profile',user.id]);}
}
