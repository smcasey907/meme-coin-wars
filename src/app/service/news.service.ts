import { Injectable } from '@angular/core';
import { News } from '../models/news';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  // Array of news items including new coins being launched,
  // tweets from Elon Musk or other famous people about named coins,
  // government regulations, bank buy ins, etc.
  newsItems = [
    {
      title: 'Network Troubles!',
      description: 'Due to some bad coding, the network went down for  ',
      eod: false,
      newsImpactId: 0
    },
    {
      title: 'Elon Musk Tweets!',
      description: 'Elon Musk has tweeted about ',
      eod: true,
      newsImpactId: 1
    },
    {
      title: 'Government Regulations!',
      description: 'The government has announced new regulations on a specific coin because they can: ',
      eod: false,
      newsImpactId: 2
    },
    {
      title: 'Bank Buy In!',
      description: 'A major bank has announced that they are buying into meme coin ',
      eod: true,
      newsImpactId: 3
    }
  ];

  constructor() { }

  public generateNewsForTheDay(coins: string[]): News[] {
    let dailyNews: News[] = [];
    // Determine a random number of news items from the day from 1 to 3
    let newsCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < newsCount; i++) {
      let newsItem = this.generateNews();
      let impactedCoin = this.pickRandomCoin(coins);
      let priceImpact = this.generatePriceImpact();
      dailyNews.push({
        text: newsItem.title + ' || ' + newsItem.description+ impactedCoin,
        id: i,
        newsImpactId: newsItem.newsImpactId,
        investmentName: impactedCoin,
        priceImpact: priceImpact,
        eod: newsItem.eod
      });
    }
    return dailyNews;
  }

  public newsImpact(id: number, coinValue: number): number { 
    let impact = 0;
    switch (id) {
      case 0:
        impact = this.networkOutage(coinValue)
        break;
      case 1:
        impact = this.muskTweets(coinValue);
        break;
      case 2:
        impact = this.governmentRegulations(coinValue);
        break;
      case 3:
        impact = this.bankBuyIn(coinValue);
        break;
      default:
        return impact;
    }
    return impact;
  }

  private networkOutage(coinValue: number): number {
    let impact = this.volatilityCalculator(coinValue) * (-1);
    return impact;
  }

  private muskTweets(coinValue: number): number {
    let impact = this.volatilityCalculator(coinValue) * 1;

    return impact;
  }

  private governmentRegulations(coinValue: number): number {
    let impact = this.volatilityCalculator(coinValue) * (-1);

    return impact;
  }

  private bankBuyIn(coinValue: number): number {
    let impact = this.volatilityCalculator(coinValue) * 1;

    return impact;
  }

  // Method to generate a random news item
  private generateNews(): any {
    return this.newsItems[Math.floor(Math.random() * this.newsItems.length)];
  }

  // Method to generate a random price impact either positive or negative
  private generatePriceImpact(): number {
    return Math.random() < 0.5 ? -1 : 1;
  }

  // pick a random coin to be impacted
  private pickRandomCoin(coins: string[]): string {
    return coins[Math.floor(Math.random() * coins.length)];
  }

  private volatilityCalculator(price: number): number {
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

}