import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../../../services/sidebar';

@Component({
  selector: 'app-code-casino',
  imports: [CommonModule, FormsModule],
  templateUrl: './code-casino.html',
  styleUrl: './code-casino.scss',
})
export class CodeCasino {
  selectedCode: string | null = null;
  betAmount: number = 100;

  codeSnippetA = `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n-1) + 
         fibonacci(n-2);
  return n;
}`;
  codeSnippetB = `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n-1) + 
         fibonacci(n-2);
  return n;
}`;

  constructor(public sideBarService: Sidebar) {}

  selectCode(code: string): void {
    this.selectedCode = code;
  }

  setBet(amount: number): void {
    this.betAmount = amount;
  }

  calculateWin(): number {
    if (!this.betAmount) return 0;
    // Apply zodiac multiplier (1.5x for Aries)
    return Math.floor(this.betAmount * 2 * 1.5);
  }

  placeBet(): void {
    if (!this.selectedCode || !this.betAmount) return;

    // Here you would implement the actual betting logic
    console.log(
      `Placed bet: ${this.betAmount} points on Code ${this.selectedCode}`
    );

    // For demo purposes, randomly determine win/loss
    const isWin = Math.random() > 0.5;

    if (isWin) {
      const winAmount = this.calculateWin();
      console.log(`You won ${winAmount} points!`);
      // Update user points, streak, etc.
    } else {
      console.log(`You lost ${this.betAmount} points!`);
      // Deduct points, reset streak if needed
    }

    // Reset for next game
    this.selectedCode = null;
    this.betAmount = 100;
  }
}
