import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StatusList } from '../../../shared/components/status-list/status-list';
import { PostCard } from '../../../shared/components/post-card/post-card';
import { Post, PostItem } from '../../../core/services/post';
import { Auth } from '../../../core/services/auth';
import { Upload } from '../../../core/services/upload';
import { EmojiPicker } from '../../../shared/components/emoji-picker/emoji-picker';
import { LanguageService } from '../../../core/services/language';
import { Notifications } from '../../../layout/notifications/notifications';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [StatusList, PostCard, FormsModule, EmojiPicker, Notifications],
  templateUrl: './feed.html',
  styleUrl: './feed.scss',
})
export class Feed implements OnInit {
  postContent = '';
  mediaUrl = ''; mediaType:'image'|'video'='image'; musicUrl=''; musicTitle='';
  posts = signal<PostItem[]>([]);
  loading = signal(true);
  posting = signal(false);
  error = signal('');
  uploading=signal(false);
  readonly user: ReturnType<Auth['getCurrentUser']>;
  constructor(private postsService: Post, private auth: Auth,private upload:Upload,public language:LanguageService) { this.user = auth.getCurrentUser(); }
  ngOnInit(): void { this.loadPosts(); }
  loadPosts(): void { this.loading.set(true); this.error.set(''); this.postsService.getPosts().subscribe({ next: ({ posts }) => { this.posts.set(posts); this.loading.set(false); }, error: () => { this.error.set('Unable to load posts.'); this.loading.set(false); } }); }
  createPost(): void { const content = this.postContent.trim(); if (!content&&!this.mediaUrl.trim()) { this.error.set('Add text, a photo, or a video before posting.'); return; } this.posting.set(true); this.postsService.createPost({ content, mediaUrl:this.mediaUrl.trim()||undefined,mediaType:this.mediaUrl?this.mediaType:undefined,musicUrl:this.musicUrl.trim()||undefined,musicTitle:this.musicTitle.trim()||undefined }).subscribe({ next: () => { this.postContent='';this.mediaUrl='';this.musicUrl='';this.musicTitle='';this.posting.set(false);this.loadPosts(); }, error: (error) => { this.error.set(error?.error?.message || 'Unable to create post.'); this.posting.set(false); } }); }
  initial(): string { return (this.user?.name?.[0] || 'U').toUpperCase(); }
  uploadMedia(event:Event):void{const file=(event.target as HTMLInputElement).files?.[0];if(!file)return;this.uploading.set(true);this.upload.file(file).subscribe({next:({url,mime})=>{this.mediaUrl=url;this.mediaType=mime.startsWith('video/')?'video':'image';this.uploading.set(false);},error:e=>{this.error.set(e?.error?.message||'Upload failed.');this.uploading.set(false);}});}
  uploadMusic(event:Event):void{const file=(event.target as HTMLInputElement).files?.[0];if(!file)return;this.uploading.set(true);this.upload.file(file).subscribe({next:({url})=>{this.musicUrl=url;this.musicTitle=file.name;this.uploading.set(false);},error:e=>{this.error.set(e?.error?.message||'Upload failed.');this.uploading.set(false);}});}
  addEmoji(emoji:string):void{this.postContent+=emoji;}
  removeMedia():void{this.mediaUrl='';}
}
