import { Injectable } from '@angular/core';
import { Investment } from '../models/investment';
import { Holdings } from '../models/player';


@Injectable({
  providedIn: 'root'
})
export class InvestmentService {
  coinNames: string[] = ['$FRNSWRTH', '$DOGSHT', '$DATASS', '$JNX', '$GME'];
  coinValues: number[] = [10, 69, 77, 750, .01];

  networkGasFee: number = 0.01;

  constructor() { }

  // For future use, we will probably have a method to get a difficulty
  // Difficulty will determine the number of coins available
  totalCoins: number = 5;

  public generateCoins(totalCoins: number): Investment[] {
    let coins: Investment[] = [];
    for (let i = 0; i < totalCoins; i++) {
      coins.push({
        name: this.coinNames[i],
        id: i,
        value: this.coinValues[i],
        deltaPercentage: 0
      });
    }
    return coins;
  }

  public transactCoin(coins: Investment[], id: number, amount: number): number {
    let coin = coins.find((coin: Investment) => coin.id === id);
    if (!coin) {
      return 0;
    }
    let deltaCoin = amount / coin.value;
    return deltaCoin;
  }
}
