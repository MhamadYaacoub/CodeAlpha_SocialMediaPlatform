import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Post, PostItem, CommentItem } from '../../../core/services/post';
import { Auth } from '../../../core/services/auth';
import { User } from '../../../core/services/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './post-card.html',
  styleUrl: './post-card.scss',
})
export class PostCard {
  @Input({ required: true }) post!: PostItem;
  @Output() changed = new EventEmitter<void>();
  comments = signal<CommentItem[]>([]); showComments = signal(false); busy = signal(false); comment = '';
  heart=signal(false);
  likeError=signal('');
  followBusy=signal(false);commentBusy=signal(false);
  readonly currentUser: ReturnType<Auth['getCurrentUser']>;
  constructor(private service: Post, private auth: Auth,private users:User,private router:Router) { this.currentUser = auth.getCurrentUser(); }
  toggleLike(): void {if(this.busy())return;const previousLiked=this.post.liked;const previousCount=this.post.likesCount;const desired=!previousLiked;this.likeError.set('');this.post.liked=desired;this.post.likesCount=Math.max(0,previousCount+(desired?1:-1));this.busy.set(true);this.service.setLike(this.post.id,desired).subscribe({next:({liked,likesCount})=>{this.post.liked=liked;this.post.likesCount=likesCount;this.busy.set(false);},error:(error)=>{this.post.liked=previousLiked;this.post.likesCount=previousCount;this.busy.set(false);this.likeError.set(error?.error?.message||'Like was not saved. Check that the backend is running.');}});}
  openComments(): void { this.showComments.update(v => !v); if (this.showComments()) this.service.getComments(this.post.id).subscribe(({ comments }) => this.comments.set(comments)); }
  addComment(): void { const value = this.comment.trim(); if (!value||this.commentBusy()) return;this.commentBusy.set(true); this.service.addComment(this.post.id, value).subscribe({next:({ comment }) => { this.comments.update(items => [...items, comment]); this.post.commentsCount++; this.comment = '';this.commentBusy.set(false);},error:()=>this.commentBusy.set(false)}); }
  delete(): void { if (confirm('Delete this post?')) this.service.deletePost(this.post.id).subscribe(() => this.changed.emit()); }
  deleteComment(item: CommentItem): void { if (confirm('Delete this comment?')) this.service.deleteComment(item.id).subscribe(() => { this.comments.update(v => v.filter(c => c.id !== item.id)); this.post.commentsCount--; }); }
  initial(name?: string): string { return (name?.[0] || 'U').toUpperCase(); }
  mediaLike():void{if(!this.post.liked)this.toggleLike();this.heart.set(true);setTimeout(()=>this.heart.set(false),700);}
  follow():void{if(this.followBusy())return;this.followBusy.set(true);this.users.toggleFollow(this.post.userId).subscribe({next:(result:any)=>{this.post.user.following=result.following;this.post.user.requestStatus=result.requestStatus;this.followBusy.set(false);},error:()=>this.followBusy.set(false)});}
  openProfile():void{this.router.navigate(['/profile',this.post.userId]);}
}
