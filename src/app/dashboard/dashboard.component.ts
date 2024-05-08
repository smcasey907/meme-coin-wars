import { ApplicationRef, ChangeDetectorRef, Component, importProvidersFrom, NgModule } from '@angular/core';
import { Investment } from '../models/investment';
import { News } from '../models/news';
import { Player } from '../models/player';
import { InvestmentService } from '../service/investment.service';
import { NewsService } from '../service/news.service';
import { SubscriptionService } from '../service/subscription.service';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  imports: [ DecimalPipe, RouterOutlet, CommonModule, RouterLink, RouterLinkActive],
  providers: [InvestmentService, NewsService]
})
export class DashboardComponent {
  coins: Investment[] = [];
  newsItems: News[] = [];
  player: Player;
  gameData: any;
  marketRecord: any[] = [];

  day: number = 1;

  totalScore: number = 0;
  dailyCoinValuation: any[] = [];
  incrementAmount: number = 0;

  // TODO: move these to their own component
  buying: boolean = false;
  selling: boolean = false;
  trading: boolean = false;
  dynamicText1: string = '';
  dynamicTracker: number = 0; // Allows dynamic input to be tracked
  coinTracker: number = 0; // Allows the coin to be tracked

  token: any;

  constructor(
    private coinService: InvestmentService,
    private cdr: ChangeDetectorRef,
    private state: SubscriptionService
  ) {
    this.player = {
      name: '',
      cash: 0,
      holdings: []
    };
   }

  ngOnInit(): void {
    this.state.getState$().subscribe((state) => {
      this.coins = state.tokens;
      this.newsItems = state.news;
      this.player = state.player;
      this.gameData = state.gameData;
      this.marketRecord = state.marketRecord;
      this.totalScore = state.totalScore;
    });
  }

  startGame(): void {
    // Start the game
    if (this.gameData.phase == 1) {
      this.state.save('gameData', { phase: 2} );
      this.totalScore += this.player.cash;
    }
  }
}
