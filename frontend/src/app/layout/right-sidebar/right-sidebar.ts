import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { User, DiscoverUser } from '../../core/services/user';

@Component({
  selector: 'app-right-sidebar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './right-sidebar.html',
  styleUrl: './right-sidebar.scss',
})
export class RightSidebar implements OnInit {
  users = signal<DiscoverUser[]>([]);
  processing=signal<Set<number>>(new Set());
  constructor(private service: User) {}
  ngOnInit(): void {
    this.service.list().subscribe({
      next: ({ users }) => this.users.set(
        users.filter((user) => !user.following && user.requestStatus !== 'pending').slice(0, 3),
      ),
    });
  }
  follow(user: DiscoverUser): void {
    if(this.processing().has(user.id))return;
    this.processing.update(current=>new Set(current).add(user.id));
    this.service.toggleFollow(user.id).subscribe({next:() => {
      this.users.update((users) => users.filter((item) => item.id !== user.id));
      this.processing.update(current=>{const next=new Set(current);next.delete(user.id);return next;});
    },error:()=>this.processing.update(current=>{const next=new Set(current);next.delete(user.id);return next;})});
  }
}
