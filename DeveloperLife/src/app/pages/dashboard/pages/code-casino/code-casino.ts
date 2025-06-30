import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../../../services/sidebar';
import { CodeCasinoServices } from '../../../../services/code-casino-services';
import { OnInit } from '@angular/core';
import { Toast, ToastrService } from 'ngx-toastr';

export interface player {
  username: string;
  streak: number;
  points: number;
}
@Component({
  selector: 'app-code-casino',
  imports: [CommonModule, FormsModule],
  templateUrl: './code-casino.html',
  styleUrl: './code-casino.scss',
})
export class CodeCasino implements OnInit {
  selectedCode: string | null = null;
  betAmount: number = 0;
  userData: any = null;
  experience: any = null;
  leaderboard: player[] = [];
  userRank: number = 0;
  userStreak: number = 0;

  codeSnippetA: string = '';
  codeSnippetB: string = '';

  snippetId: string = '';

  ngOnInit(): void {
    this.userData = JSON.parse(localStorage.getItem('userData') ?? 'null');
    this.experience = localStorage.getItem('experience');
    this.getSnippets();
    this.getLeaderboard();
    console.log(this.leaderboard);
  }
  constructor(
    public sideBarService: Sidebar,
    private codeCasinoService: CodeCasinoServices,
    private toastr: ToastrService
  ) {}

  getUserDetails() {
    const requestDataForSnippet = {
      language: this.userData.user.stack,
      experience: this.experience,
    };
    return requestDataForSnippet;
  }
  getSnippets(): void {
    this.codeCasinoService.requestSnippet(this.getUserDetails()).subscribe({
      next: (response) => {
        this.codeSnippetA = response.optionA;
        this.codeSnippetB = response.optionB;
        this.snippetId = response.snippetId;
      },
      error: (error) => {
        console.log('Full errorr: ', error);
      },
    });
  }
  selectCode(code: string): void {
    this.selectedCode = code;
  }

  setBet(amount: number): void {
    this.betAmount = amount;
  }

  placeBet(): void {
    if (!this.selectedCode || !this.betAmount) return;

    const chooseData = {
      snippetId: this.snippetId,
      selectedOption: this.selectedCode,
      pointsBet: this.betAmount.toString(),
    };

    this.codeCasinoService.chooseCorrect(chooseData).subscribe({
      next: (response) => {
        if (response.isCorrect) {
          this.toastr.success(
            `🎉 You won ${response.pointsChanged} points!`,
            'Correct Choice!',
            { timeOut: 1500 }
          );
        } else {
          this.toastr.error(
            `😞 You lost ${Math.abs(response.pointsChanged)} points!`,
            'Wrong Choice!',
            { timeOut: 5000 }
          );
        }

        this.userData.user.points = response.newTotal;

        this.selectedCode = null;
        this.betAmount = 0;

        this.userData = { ...this.userData };
        localStorage.setItem('userData', JSON.stringify(this.userData));
        this.getSnippets();
        this.getLeaderboard();
      },
      error: (err) => {
        console.log('Error: ', err);
      },
    });
  }
  getLeaderboard(): void {
    this.codeCasinoService.getLeaderboard().subscribe({
      next: (response) => {
        console.log(response);
        this.leaderboard = response.slice(0, 3);

        const currentUser = response.find(
          (player: player) => player.username === this.userData.user.username
        );

        if (currentUser) {
          this.userRank =
            response.findIndex((p) => p.username === currentUser.username) + 1;
          this.userStreak = currentUser.streak; // Get streak from leaderboard
          console.log('User streak:', this.userStreak);
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
