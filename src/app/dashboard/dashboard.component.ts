import { ApplicationRef, ChangeDetectorRef, Component, importProvidersFrom, NgModule, ViewChild } from '@angular/core';
import { Investment } from '../models/investment';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { bootstrapApplication } from '@angular/platform-browser';
import { News } from '../models/news';
import { Player } from '../models/player';
import { InvestmentService } from '../service/investment.service';
import { NewsService } from '../service/news.service';
import { SubscriptionService } from '../service/subscription.service';
import { DecimalPipe } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  imports: [FormsModule, DecimalPipe],
  providers: [InvestmentService, NewsService]
})
export class DashboardComponent {
  @ViewChild('gameInput') gameInput: any;

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
    });
  }

  startGame(): void {
    // Start the game
    if (this.gameData.phase == 1) {
      this.state.save('gameData', { phase: 2} );
      this.totalScore += this.player.cash;
    }
  }

  saveDailyCoinValuation(): void {
    this.state.save('marketRecord', this.dailyCoinValuation);
  }

  getDailyCoinChange(day: number, coin: Investment): number {
    let percentageChange = 0;
    if (day > 1) {
      let previousValue = this.dailyCoinValuation[day - 2].find((c: Investment) => c.id == coin.id).value;
      percentageChange = ((coin.value - previousValue) / previousValue) * 100;
    }
    return percentageChange;
  }

  buy(): void {
    if (this.buying == false) {
      this.buying = true;
    }
    this.buyPhase1();
  }

  buyPhase1(): void {
    // Display the coins for the player to buy
    this.dynamicText1 = 'Which coin would you like to buy?:';
 }

  buyCoin(coin: Investment): void {
    this.buyPhase2(coin);
    this.dynamicTracker++;
  }

  buyPhase2(coin: Investment): void {
    this.dynamicText1 = `How much of ${coin.name} would you like to buy?`;
    this.coinTracker = coin.id;
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

  maxValue(): void {
    this.incrementAmount = this.player.cash;
  }

  resetValue(): void {
    this.incrementAmount = 0;
  }

  buyCoinAmount(): void {
    this.buyPhase3(this.incrementAmount);
  }

  buyPhase3(coinVal: number): void {
    let newHolding = this.coinService.transactCoin(this.coins, this.coinTracker, coinVal);
    let newValue = this.coins[this.coinTracker].value * newHolding;
    this.state.updateHoldings(coinVal, this.coinTracker, newHolding, newValue, true);
    this.buying = false;
    this.dynamicTracker = 0;
    this.incrementAmount = 0;
    this.cdr.detectChanges();
  }

  sell(): void {
    if (this.selling == false) {
      this.selling = true;
    }
    this.sellPhase1();
  }

  sellPhase1(): void {
    this.dynamicText1 = 'Which coin would you like to sell?:';
  }

  sellCoin(coin: Investment): void {
    this.sellPhase2(coin);
    this.dynamicTracker++;
  }

  sellPhase2(coin: Investment): void {
    this.dynamicText1 = `How much of ${coin.name} would you like to sell?`;
    this.coinTracker = coin.id;
  }

  sellCoinAmount(): void {
    this.sellPhase3(this.incrementAmount);
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

  sellPhase3(coinVal: number): void {
    let newHolding = this.coinService.transactCoin(this.coins, this.coinTracker, coinVal);
    let newValue = this.coins[this.coinTracker].value * newHolding;
    this.state.updateHoldings(coinVal, this.coinTracker, newHolding, newValue, false);
    this.selling = false;
    this.dynamicTracker = 0;
    this.incrementAmount = 0;
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
    let runningTotal = 0;
    this.player.holdings.forEach((holding) => {
      let coin = this.coins.find((c) => c.name === holding.coin);
      runningTotal += holding.amount * coin!.value;
    });
    runningTotal += this.player.cash;
    this.totalScore = runningTotal;
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
