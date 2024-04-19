import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SubscriptionService } from './service/subscription.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'meme-coin-wars';

  constructor(private state: SubscriptionService) { }

  ngOnInit(): void {
    this.state.initializeGameState();
  }

}
