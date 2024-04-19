import { BehaviorSubject } from 'rxjs';
import { Player } from '../models/player';
import { Investment } from '../models/investment';
import { News } from '../models/news';
import { InvestmentService } from './investment.service';
import { NewsService } from './news.service';
import { Injectable } from '@angular/core';

interface State {
	player: Player;
	tokens: Investment[];
	news: News[];
	gameData: any;
	// an array of objects that contains the array of investments for each day
	marketRecord: Investment[][];
	[key: string]: any; // Add index signature
}

@Injectable({
	providedIn: 'root'
})

export class SubscriptionService {
	private _state$: BehaviorSubject<State>;

	constructor(
		private investmentService: InvestmentService,
		private newsService: NewsService
	) {
		this._state$ = new BehaviorSubject<State>({
			player: {
				name: '',
				cash: 0,
				holdings: []
			},
			tokens: [],
			news: [],
			gameData: [],
			marketRecord: []
			// Initialize other state properties as needed
		});
	}

	getState$() {
		return this._state$.asObservable();
	}

	updatePlayer(player: Player) {
		const state = this._state$.getValue();
		state.player = player;
		this._state$.next(state);
	}

	initializeGameState(): void {
		const coins = this.investmentService.generateCoins(5);
		const newsItems = this.newsService.generateNewsForTheDay(coins.map(coin => coin.name));
		const player: Player = {
			name: 'MemeBotKiller2000',
			cash: 100,
			holdings: coins.map(coin => ({
				coin: coin.name,
				amount: 0,
				value: 0
			}))
		};
		const gameData = {
			day: 1,
			phase: 1,
		}
		const state = this._state$.getValue();
		state.tokens = coins;
		state.news = newsItems;
		state.player = player;
		state.gameData = gameData;
		state.marketRecord = [];
		this._state$.next(state);
	}

	// Generic state save method
	public save(key: string, value: any) {
		const state = this._state$.getValue();
		state[key] = value;
		this._state$.next(state);
	}

	marketRecord: Investment[] = [];

	public saveMarketRecord(value: Investment[]) {
		const state = this._state$.getValue();
		state.marketRecord.push(...[value]);
		this._state$.next(state);
	}

	// pass in an updated holding and update the player's holdings either adding to or removing from the specific holding
	updateHoldings(cashSpent: number, coinID: number, newHolding: number, newValue: number, add: boolean) {
		const state = this._state$.getValue();
		const holding = state.player.holdings[coinID];
		if (holding) {
			if (add) {
				holding.amount += newHolding;
				holding.value += newValue;
				state.player.cash -= cashSpent;
			} else {
				holding.amount -= newHolding;
				holding.value -= newValue;
				state.player.cash += cashSpent;
			}
		}
		this._state$.next(state);
	}

	public volatilityCalculator(price: number): number {
		// Define volatility ranges for different price ranges
		const volatilityRanges = [
			{ min: 0.01, max: 1, volatility: 0.5 },  // High volatility for low prices
			{ min: 1, max: 10, volatility: 0.2 },   // Low volatility for mid prices
			{ min: 10, max: 100, volatility: 0.3 }, // Medium volatility for mid prices
			{ min: 100, max: 1000, volatility: 0.4 }, // High volatility for high prices
			{ min: 1000, max: Infinity, volatility: 0.1 }, // Low volatility for very high prices
		  ];
		
		  // Find the matching volatility range based on price
		  const matchingRange = volatilityRanges.find((range) => price >= range.min && price < range.max);
		
		  // If no matching range found, use default (medium volatility)
		  if (!matchingRange) {
			return 0.3;
		  }
		
		  // Generate random volatility within the range with some noise
		  const baseVolatility = matchingRange.volatility;
		  const noise = Math.random() * 0.1 - 0.05; // Random noise between -0.05 and 0.05
		  return baseVolatility + noise;
	}

	// All the magic happens here
	public executeMarketMovement(): void {
		const state = this._state$.getValue();
		const coins = state.tokens;
		const newsItems = state.news;
		const player = state.player;
		const gameData = state.gameData;
		const marketRecord = state.marketRecord;

		/*
		generate fake market movement
			if news impacted a token positively, price will increase by a percentage
			if news impacted a token negatively, price will decrease by a percentage
			volatility for each token will be calculated based on the price of the token after news of the day impacts the token
			if no news, price will increase or decrease "randomly"
				if the token is valued close to 0, negative impact is small, positive impact can be larger
				if the token is valued closer to 100, negative impact is larger, positive impact will be smaller
				if the token "crits" the value will swing large either way
					crits will generate their own news
		create next day's news
			if news affects the previous night's movements, adjust price (news labeled bod)
		find the percentage difference between the two days movements and adjust the player's tokens value accordingly
		*/

		// News Impact for end of day
		//for each news item of the day
		for (let news of newsItems) {
			//find the impacted coin
			if (news.eod) {
				let coin = coins.find((coin: Investment) => coin.name === news.investmentName);
				//if the coin exists
				if (coin) {
					//get the impact of the news
					let impact = this.newsService.newsImpact(news.newsImpactId, coin.value);
					//adjust the coin value
					coin.value += coin.value * impact;
					console.log(`News Impact: ${news.newsImpactId}, Coin: ${coin.name}, Impact: ${impact}, New Value: ${coin.value}`);
				}
			}
		}

		// Market Movement for end of day
		//for each coin
		for (let coin of coins) {
			// get delta value
			let delta = this.volatilityCalculator(coin.value);
			// get motion data
			let motion = this.generateBrownianMotion(delta, 12, 6);
			// Roll d20 to determine motion
			let roll = Math.floor(Math.random() * 20) + 1;
			let motionIndex = 0;
			if (roll < 9) {
				motionIndex = 1;
			} else if (roll < 13) {
				motionIndex = 2;
			} else if (roll < 17) {
				motionIndex = 3;
			} else if (roll < 20) {
				motionIndex = 4;
			} else {
				motionIndex = 5;
			}
			// adjust the coin value
			coin.value += coin.value * motion[motionIndex];
		}

		// Generate next day's news
		newsItems.length = 0;
		const nextNews = this.newsService.generateNewsForTheDay(coins.map(coin => coin.name));
		for (let news of nextNews) {
			//find the impacted coin
			if (!news.eod) {
				let coin = coins.find((coin: Investment) => coin.name === news.investmentName);
				//if the coin exists
				if (coin) {
					//get the impact of the news
					let impact = this.newsService.newsImpact(news.newsImpactId, coin.value);
					//adjust the coin value
					coin.value += coin.value * impact;
					console.log(`News Impact: ${news.newsImpactId}, Coin: ${coin.name}, Impact: ${impact}, New Value: ${coin.value}`);
				}
			}
		}

		// For each token, determine the total percentage change in value between the two days
		// Adjust the player's token value accordingly
		for (let coin of coins) {
			let recordLength = marketRecord.length;
			let previousValue = (marketRecord[recordLength - 1] as Investment[]).find((c: Investment) => c.id == coin.id)?.value;
			if (previousValue) {
				let percentageChange = (coin.value - previousValue) / previousValue;
				coin.deltaPercentage = percentageChange;
				let holding = player.holdings.find((h) => h.coin === coin.name);
				if (holding) {
					holding.value += holding.value * percentageChange;
				}
			}
		}
		// Save the new state
		this.save('tokens', coins);
		this.save('news', nextNews);
		this.save('player', player);
		this.save('gameData', { ...gameData, day: gameData.day + 1 });
		this.save('marketRecord', [...marketRecord, coins]);
	}

	// delta: "drift" factor, determines the direction of the motion and speed
	// dt: time step size
	// n: number of steps
	// USAGE:
	// this.bmData = this.state.generateBrownianMotion(delta, 12, 1);
	// some thoughts: this method can kick out an array of increasing numbers
	// so part of randomizing growth of the coin value could be setting n to 6
	// and then using a random number generator like a d20 and have 1-8 be a
	// motion[1], 9-12 be motion[2], 13-16 be motion[3], and 17-19 be motion[4],
	// and 20 be motion[5]
	// So if I set delta to 10, dt to 12, and n to 6, I could have a coin value
	// range as such:
	// [1] = 0.06, [2] = 13.48, [3] = 13.91, [4] = 33.14, [5] = 65.96
	// So giving Delta a range of maybe -10 to 10 AND using a d20 to determine
	// the motion could be a good way to randomize the growth of the coin value

	generateBrownianMotion(delta: number, dt: number, n: number): number[] {
		let motion = [0];
		for (let i = 0; i < n; i++) {
		  let dx = Math.random();  // Random number between 0 and 1
		  let x = motion[i];
		  // Increase price with a smaller factor
		  if (dx < 0.5) {
			x += delta * 0.2 * dx; // Use a smaller delta for upward movement
		  } else {
			// Decrease price with a larger factor (effectively "negative volatility")
			x -= delta * 1.2 * (dx - 0.5); // Use a larger delta for downward movement 
		  }
		  motion.push(x);
		}
		return motion;
	  }
}

  // Add similar methods to update other state properties