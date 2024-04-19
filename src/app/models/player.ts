export interface Player {
  name: string;
  cash: number;
  holdings: Holdings[];
}

export interface Holdings {
  coin: string;
  amount: number;
  value: number;
}
/*

Instantiate player as follows:
let player: Player = {
  name: 'Generated Name', // replace with the actual generated name
  cash: 100,
  holdings: []
};

*/