import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Status, StatusItem } from '../../../core/services/status';
import { Auth } from '../../../core/services/auth';
import { Upload } from '../../../core/services/upload';

@Component({
  selector: 'app-status-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './status-list.html',
  styleUrl: './status-list.scss',
})
export class StatusList implements OnInit {
  statuses = signal<StatusItem[]>([]);
  loading = signal(true);
  error = signal('');

  showCreateModal = signal(false);
  creating = signal(false);
  createError = signal('');

  showViewer = signal(false);
  selectedStatus = signal<StatusItem | null>(null);

  viewers = signal<any[]>([]);
  viewsCount = signal(0);
  viewersLoading = signal(false);
  uploading=signal(false);

  newStatusContent = '';
  newMediaUrl='';newMediaType:'image'|'video'='image';newMusicUrl='';newMusicTitle='';

  constructor(private statusService: Status, private auth: Auth,private upload:Upload) {}

  ngOnInit(): void {
    this.loadStatuses();
  }

  loadStatuses(): void {
    this.loading.set(true);
    this.error.set('');

    this.statusService.getStatuses().subscribe({
      next: (response) => {
        this.statuses.set(response.statuses);
        this.loading.set(false);
      },

      error: () => {
        this.error.set('Unable to load stories.');
        this.loading.set(false);
      },
    });
  }

  openCreateModal(): void {
    this.newStatusContent = '';
    this.newMediaUrl='';this.newMusicUrl='';this.newMusicTitle='';
    this.createError.set('');
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    if (this.creating()) {
      return;
    }

    this.showCreateModal.set(false);
  }

  createStatus(): void {
    const content = this.newStatusContent.trim();

    if (!content&&!this.newMediaUrl.trim()) {
      this.createError.set('Add text, a photo, or a video before sharing.');
      return;
    }

    this.creating.set(true);
    this.createError.set('');

    this.statusService.createStatus({ content,mediaUrl:this.newMediaUrl.trim()||undefined,mediaType:this.newMediaUrl?this.newMediaType:undefined,musicUrl:this.newMusicUrl.trim()||undefined,musicTitle:this.newMusicTitle.trim()||undefined }).subscribe({
      next: () => {
        this.creating.set(false);
        this.showCreateModal.set(false);
        this.newStatusContent = '';

        this.loadStatuses();
      },

      error: (error) => {
        this.creating.set(false);

        this.createError.set(error?.error?.message || 'Unable to create your story.');
      },
    });
  }

  openStatus(status: StatusItem): void {
    this.statusService.viewStatus(status.id).subscribe({
      next: (response) => {
        const currentStatus = response.status || status;

        this.selectedStatus.set(currentStatus);
        this.viewsCount.set(response.viewsCount ?? status.viewsCount ?? 0);

        this.viewers.set([]);
        this.showViewer.set(true);

        this.loadStatuses();
      },

      error: () => {
        this.selectedStatus.set(status);
        this.showViewer.set(true);
      },
    });
  }

  closeViewer(): void {
    this.showViewer.set(false);
    this.selectedStatus.set(null);
    this.viewers.set([]);
  }

  loadViewers(): void {
    const status = this.selectedStatus();

    if (!status) {
      return;
    }

    this.viewersLoading.set(true);

    this.statusService.getViewers(status.id).subscribe({
      next: (response) => {
        this.viewsCount.set(response.viewsCount || 0);

        this.viewers.set(response.viewers || []);

        this.viewersLoading.set(false);
      },

      error: () => {
        this.viewersLoading.set(false);
      },
    });
  }

  deleteSelectedStatus(): void {
    const status = this.selectedStatus();

    if (!status) {
      return;
    }

    this.statusService.deleteStatus(status.id).subscribe({
      next: () => {
        this.closeViewer();
        this.loadStatuses();
      },
    });
  }

  getInitial(status: StatusItem): string {
    return (status.user?.name?.charAt(0) || status.user?.username?.charAt(0) || '?').toUpperCase();
  }

  getName(status: StatusItem): string {
    return status.user?.name?.split(' ')[0] || status.user?.username || 'User';
  }

  getTimeAgo(date: string): string {
    const created = new Date(date).getTime();

    const now = Date.now();

    const minutes = Math.floor((now - created) / 60000);

    if (minutes < 1) {
      return 'Just now';
    }

    if (minutes < 60) {
      return `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);

    return `${hours}h`;
  }

  isMyStatus(status: StatusItem): boolean {
    return status.userId === this.auth.getCurrentUser()?.id;
  }
  ownStatus():StatusItem|undefined{return this.statuses().find((status)=>this.isMyStatus(status));}
  otherStatuses():StatusItem[]{return this.statuses().filter((status)=>!this.isMyStatus(status));}
  openOwnStory():void{const status=this.ownStatus();if(status)this.openStatus(status);else this.openCreateModal();}
  uploadMedia(event:Event):void{const file=(event.target as HTMLInputElement).files?.[0];if(!file)return;this.uploading.set(true);this.upload.file(file).subscribe({next:({url,mime})=>{this.newMediaUrl=url;this.newMediaType=mime.startsWith('video/')?'video':'image';this.uploading.set(false);},error:()=>{this.createError.set('Media upload failed.');this.uploading.set(false);}});}
  uploadMusic(event:Event):void{const file=(event.target as HTMLInputElement).files?.[0];if(!file)return;this.uploading.set(true);this.upload.file(file).subscribe({next:({url})=>{this.newMusicUrl=url;this.newMusicTitle=file.name;this.uploading.set(false);},error:()=>{this.createError.set('Music upload failed.');this.uploading.set(false);}});}
}
