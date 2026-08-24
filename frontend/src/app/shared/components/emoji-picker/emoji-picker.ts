import { Component, EventEmitter, Output, signal } from '@angular/core';

@Component({
  selector: 'app-emoji-picker',
  standalone: true,
  templateUrl: './emoji-picker.html',
  styleUrl: './emoji-picker.scss',
})
export class EmojiPicker {
  @Output() selected = new EventEmitter<string>();
  open = signal(false);
  readonly emojis = ['😀','😃','😄','😁','😂','🤣','😊','😍','🥰','😘','😎','🤩','🥳','🤗','🤔','😢','😭','😡','👍','👎','👏','🙌','🙏','💪','❤️','💜','🔥','✨','🎉','💯','🌹','🌟','📸','🎬','🎵','☕','🍕','⚽','🌍','🚀'];
  choose(emoji:string):void{this.selected.emit(emoji);}
}
