import { Component } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { DecimalPipe, PercentPipe, CommonModule } from '@angular/common';
import { InvestmentService } from '../service/investment.service';
import { NewsService } from '../service/news.service';
import { Investment } from '../models/investment';
import { News } from '../models/news';
import { Player } from '../models/player';
import { SubscriptionService } from '../service/subscription.service';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-day',
  standalone: true,
  imports: [ DecimalPipe, PercentPipe, CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  providers: [InvestmentService, NewsService],
  templateUrl: './day.component.html',
  styleUrl: './day.component.scss'
})
export class DayComponent {

  coins: Investment[] = [];
  newsItems: News[] = [];
  player: Player;
  gameData: any;
  marketRecord: any[] = [];

  day: number = 1;

  totalScore: number = 0;
  dailyCoinValuation: any[] = [];
  incrementAmount: number = 0;

  buying: boolean = false;
  selling: boolean = false;

  dynamicTracker: number = 0;
  dynamicText: string = '';
  coinTracker: number = 0;
  
  constructor (
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

  buy(): void {
    if (this.buying == false) {
      this.buying = true;
    }
    this.dynamicText = 'Which coin would you like to buy?:';
  }

  buyCoin(coin: Investment): void {
    this.dynamicTracker++;
    this.dynamicText = `How much of ${coin.name} would you like to buy?`;
    this.coinTracker = coin.id;
  }

  maxValue(): void {
    this.incrementAmount = this.player.cash;
  }

  resetValue(): void {
    this.incrementAmount = 0;
  }

  incrementValue(): void {
    let tentativeValue = this.incrementAmount + 10;
    if (tentativeValue > this.player.cash) {
      return;
    }
    this.incrementAmount += 10;
  }

  decrementValue(): void {
    let tentativeValue = this.incrementAmount - 10;
    if (tentativeValue < 0) {
      return;
    }
    this.incrementAmount -= 10;
  }

  maxSaleValue(): void {
    let coin = this.coins[this.coinTracker];
    this.incrementAmount = this.player.holdings[this.coinTracker].amount * coin.value;
  }

  incrementSaleValue(): void {
    let tentativeValue = this.incrementAmount + 10;
    if (tentativeValue > this.player.holdings[this.coinTracker].amount * this.coins[this.coinTracker].value) {
      return;
    }
    this.incrementAmount += 10;
  }

  buyCoinAmount(coinVal: number): void {
    let newHolding = this.coinService.transactCoin(this.coins, this.coinTracker, coinVal);
    let newValue = this.coins[this.coinTracker].value * newHolding;
    this.state.updateHoldings(coinVal, this.coinTracker, newHolding, newValue, true);
    this.dynamicTracker = 0;
    this.incrementAmount = 0;
    this.dynamicText = '';
    this.buying = false;

    this.cdr.detectChanges();
  }

  sell(): void {
    if (this.selling == false) {
      this.selling = true;
    }
    this.dynamicText = 'Which coin would you like to sell?:';
  }

  sellCoin(coin: Investment): void {
    this.dynamicTracker++;
    this.dynamicText = `How much of ${coin.name} would you like to sell?`;
    this.coinTracker = coin.id;
  }

  sellCoinAmount(coinVal: number): void {
    let newHolding = this.coinService.transactCoin(this.coins, this.coinTracker, coinVal);
    let newValue = this.coins[this.coinTracker].value * newHolding;
    this.state.updateHoldings(coinVal, this.coinTracker, newHolding, newValue, false);
    this.selling = false;
    this.dynamicTracker = 0;
    this.incrementAmount = 0;
    this.dynamicText = '';

    this.cdr.detectChanges();
  }

  hodl(): void {
    let coins = JSON.parse(JSON.stringify(this.coins));
    this.state.saveMarketRecord(coins);
    this.day++;
    if (this.day > 22) {
      this.endGame();
    }
    this.state.executeMarketMovement()
    // get total score based on the player's cash and holding values
    this.state.getNewTotalScore();
    if (this.totalScore < 0) {
      this.endGame();
    }
  }

  endGame(): void {
    this.gameData.phase = 3;
    // End the game
  }

  playAgain(): void {
    this.gameData.phase = 1;
    this.totalScore = 0;
    this.day = 1;
    this.state.initializeGameState();
  }

}
