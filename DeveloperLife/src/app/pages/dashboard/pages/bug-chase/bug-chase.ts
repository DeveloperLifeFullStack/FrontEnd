import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../../../services/sidebar';
import { ChangeDetectorRef } from '@angular/core';
import { BugChaseService } from '../../../../services/bug-chase-service';

interface Leaderboard {
  username: string;
  score: number;
}

interface UserRank {
  username: string;
  score: number;
  position: number;
}

interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  jumpSpeed: number;
  isJumping: boolean;
  isDucking: boolean;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
}

interface Coffee {
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
}

@Component({
  selector: 'app-bug-chase',
  imports: [CommonModule],
  templateUrl: './bug-chase.html',
  styleUrls: ['./bug-chase.scss'],
})
export class BugChase implements OnInit, OnDestroy {
  @ViewChild('gameCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private gameLoop!: number;

  // Game state
  isPlaying = false;
  isGameOver = false;
  score = 0;
  coffeeCount = 0;
  totalCoffee = 0;

  // Game settings
  gameSpeed = 3;
  baseGameSpeed = 3;
  groundY = 320;
  gravity = 0.6;
  jumpForce = -12;

  // Coffee Power-up System
  isSpeedBoosted = false;
  speedBoostEndTime = 0;
  speedBoostDuration = 5000;
  speedBoostMultiplier = 2;

  // Player
  player: Player = {
    x: 100,
    y: this.groundY,
    width: 40,
    height: 50,
    jumpSpeed: 0,
    isJumping: false,
    isDucking: false,
  };

  // Game objects
  obstacles: Obstacle[] = [];
  coffees: Coffee[] = [];

  // Spawn timing
  lastObstacleTime = 0;
  lastCoffeeTime = 0;
  obstacleInterval = 2000;
  coffeeInterval = 2500;

  // Mobile detection
  isMobile = false;

  // Leaderboard data
  topPlayers: Leaderboard[] = [];
  userRank: UserRank | null = null;
  userHighScore = 0;
  isSubmittingScore = false;

  constructor(
    public sideBarService: Sidebar,
    private cdr: ChangeDetectorRef,
    private bugChaseService: BugChaseService
  ) {}

  ngOnInit(): void {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.isMobile = window.innerWidth <= 768;

    this.loadTotalCoffee();
    this.drawStartScreen();
    this.getLeaderboardStats();
    this.getHighScore();
  }

  ngOnDestroy(): void {
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
    }
  }

  getLeaderboardStats(): void {
    this.bugChaseService.getLeaderboard().subscribe({
      next: (response) => {
        // For now, treat response as simple array.
        // Adjust this based on your actual API response structure
        if (Array.isArray(response)) {
          this.topPlayers = response.slice(0, 4); // Top 4 only

          // Find user in the full list (you may need to modify this based on your API)
          // For now, we'll create a mock user rank - adjust based on your API response
          const fullList = response;
          const currentUserUsername = this.getCurrentUsername(); // You'll need to implement this
          const userIndex = fullList.findIndex(
            (player: Leaderboard) => player.username === currentUserUsername
          );

          if (userIndex !== -1 && userIndex >= 4) {
            this.userRank = {
              username: fullList[userIndex].username,
              score: fullList[userIndex].score,
              position: userIndex + 1,
            };
          } else {
            this.userRank = null; // User is in top 4 or not found
          }
        }

        console.log('Top 4 players:', this.topPlayers);
        console.log('User rank:', this.userRank);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Error fetching leaderboard:', err);
      },
    });
  }

  // You'll need to implement this method to get current user's username
  getCurrentUsername(): string {
    // This should return the current user's username
    // You might get this from localStorage, a service, or JWT token
    const userData = localStorage.getItem('user'); // Adjust based on your app
    if (userData) {
      const user = JSON.parse(userData);
      return user.username || user.name || 'You';
    }
    return 'You';
  }

  getHighScore(): void {
    this.bugChaseService.getHighScore().subscribe({
      next: (response) => {
        let highScore = 0;

        if (typeof response === 'number') {
          highScore = response;
        } else if (response && typeof response.highScore === 'number') {
          highScore = response.highScore;
        } else if (response && response.highScore) {
          // If it's still an object, try to extract the number
          highScore = parseInt(response.highScore) || 0;
        }
      },
      error: (err) => {
        console.log('Failed to get high score:', err);
        this.userHighScore = 0;
      },
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (!this.isPlaying) return;

    if (event.code === 'Space') {
      event.preventDefault();
      this.jump();
    } else if (event.code === 'ArrowDown') {
      event.preventDefault();
      this.startDuck();
    }
  }

  @HostListener('window:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent): void {
    if (event.code === 'ArrowDown') {
      this.stopDuck();
    }
  }

  startGame(): void {
    this.resetGame();
    this.isPlaying = true;
    this.isGameOver = false;
    this.gameLoop = requestAnimationFrame(() => this.update());
  }

  restartGame(): void {
    this.startGame();
  }

  resetGame(): void {
    this.score = 0;
    this.coffeeCount = 0;
    this.gameSpeed = 3;
    this.baseGameSpeed = 3;
    this.obstacles = [];
    this.coffees = [];
    this.lastObstacleTime = 0;
    this.lastCoffeeTime = 0;
    this.obstacleInterval = 2000;
    this.coffeeInterval = 4000;

    this.isSpeedBoosted = false;
    this.speedBoostEndTime = 0;

    this.player.x = 100;
    this.player.y = this.groundY;
    this.player.jumpSpeed = 0;
    this.player.isJumping = false;
    this.player.isDucking = false;
    this.player.height = 50;
  }

  jump(): void {
    if (!this.player.isJumping && !this.player.isDucking) {
      this.player.jumpSpeed = this.jumpForce;
      this.player.isJumping = true;
    }
  }

  startDuck(): void {
    if (!this.player.isJumping) {
      this.player.isDucking = true;
      this.player.height = 20;
      this.player.y = this.groundY + 30;
    }
  }

  stopDuck(): void {
    this.player.isDucking = false;
    this.player.height = 50;
    this.player.y = this.groundY;
  }

  activateSpeedBoost(): void {
    this.isSpeedBoosted = true;
    this.speedBoostEndTime = Date.now() + this.speedBoostDuration;
    this.gameSpeed = this.baseGameSpeed * this.speedBoostMultiplier;
  }

  updateSpeedBoost(): void {
    if (this.isSpeedBoosted && Date.now() >= this.speedBoostEndTime) {
      this.isSpeedBoosted = false;
      this.gameSpeed = this.baseGameSpeed;
    }
  }

  update(): void {
    this.clearCanvas();
    this.updateSpeedBoost();
    this.updatePlayer();
    this.updateObstacles();
    this.updateCoffees();
    this.spawnObjects();
    this.checkCollisions();
    this.updateScore();
    this.draw();

    if (this.isPlaying) {
      this.gameLoop = requestAnimationFrame(() => this.update());
    }
  }

  updatePlayer(): void {
    if (this.player.isJumping) {
      this.player.jumpSpeed += this.gravity;
      this.player.y += this.player.jumpSpeed;

      if (this.player.y >= this.groundY) {
        this.player.y = this.groundY;
        this.player.jumpSpeed = 0;
        this.player.isJumping = false;
      }
    }
  }

  updateObstacles(): void {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.x -= this.gameSpeed;

      if (obstacle.x + obstacle.width < 0) {
        this.obstacles.splice(i, 1);
        this.score += 10;
      }
    }
  }

  updateCoffees(): void {
    for (let i = this.coffees.length - 1; i >= 0; i--) {
      const coffee = this.coffees[i];
      coffee.x -= this.gameSpeed;

      if (coffee.x + coffee.width < 0) {
        this.coffees.splice(i, 1);
      }
    }
  }

  spawnObjects(): void {
    const currentTime = Date.now();

    if (currentTime - this.lastObstacleTime > this.obstacleInterval) {
      this.createObstacle();
      this.lastObstacleTime = currentTime;
      this.obstacleInterval = Math.max(800, this.obstacleInterval - 5);
    }

    if (currentTime - this.lastCoffeeTime > this.coffeeInterval) {
      this.createCoffee();
      this.lastCoffeeTime = currentTime;
      this.coffeeInterval = Math.max(1500, this.coffeeInterval - 2);
    }
  }

  createObstacle(): void {
    const types = ['BUG', 'DEADLINE'];
    const type = types[Math.floor(Math.random() * types.length)];

    const obstacle: Obstacle = {
      x: this.canvas.width,
      y: this.groundY + 20,
      width: 40,
      height: 25,
      type: type,
    };

    if (Math.random() < 0.4) {
      obstacle.y = this.groundY - 15;
      obstacle.height = 30;
      obstacle.width = 50;
    }

    this.obstacles.push(obstacle);
  }

  createCoffee(): void {
    const hasNearbyObstacle = this.obstacles.some(
      (obstacle) => obstacle.x > this.canvas.width - 120
    );

    if (hasNearbyObstacle) {
      return;
    }

    const coffee: Coffee = {
      x: this.canvas.width,
      y: this.groundY + 25,
      width: 20,
      height: 20,
      collected: false,
    };

    if (Math.random() < 0.25) {
      coffee.y = this.groundY - 25;
    }

    this.coffees.push(coffee);
  }

  checkCollisions(): void {
    for (const obstacle of this.obstacles) {
      if (this.isColliding(this.player, obstacle)) {
        this.gameOver();
        break;
      }
    }

    for (let i = this.coffees.length - 1; i >= 0; i--) {
      const coffee = this.coffees[i];
      if (!coffee.collected && this.isColliding(this.player, coffee)) {
        coffee.collected = true;
        this.coffeeCount++;
        this.totalCoffee++;
        this.score += 25;
        this.activateSpeedBoost();
        this.coffees.splice(i, 1);
      }
    }
  }

  isColliding(player: Player, object: any): boolean {
    return (
      player.x < object.x + object.width &&
      player.x + player.width > object.x &&
      player.y < object.y + object.height &&
      player.y + player.height > object.y
    );
  }

  updateScore(): void {
    this.score += 1;

    if (!this.isSpeedBoosted) {
      this.baseGameSpeed += 0.001;
      this.gameSpeed = this.baseGameSpeed;
    } else {
      this.baseGameSpeed += 0.001;
      this.gameSpeed = this.baseGameSpeed * this.speedBoostMultiplier;
    }
  }

  gameOver(): void {
    this.isPlaying = false;
    this.isGameOver = true;
    this.isSpeedBoosted = false;
    this.speedBoostEndTime = 0;
    this.saveTotalCoffee();
    this.checkAndSubmitHighScore();
  }

  checkAndSubmitHighScore(): void {
    const currentHighScore = Number(this.userHighScore) || 0;
    const currentScore = Number(this.score) || 0;

    console.log(
      `🔍 Comparing scores: Current ${currentScore} vs Best ${currentHighScore}`
    );
    console.log(`🔍 Current score type: ${typeof currentScore}`);
    console.log(`🔍 High score type: ${typeof currentHighScore}`);

    if (currentScore > currentHighScore && !this.isSubmittingScore) {
      console.log('✅ New high score! Submitting...');
      this.submitNewHighScore();
    } else {
      console.log(
        `❌ Score ${currentScore} is not higher than personal best ${currentHighScore}`
      );
    }
  }

  submitNewHighScore(): void {
    this.isSubmittingScore = true;
    console.log('Submitting score:', this.score);

    this.bugChaseService.submitScore(this.score).subscribe({
      next: (response) => {
        console.log('Score submitted successfully!', response);
        this.userHighScore = this.score;

        setTimeout(() => {
          console.log('Refreshing data...');
          this.getLeaderboardStats();
          this.getHighScore();
          this.isSubmittingScore = false;
        }, 1000);
      },
      error: (error) => {
        console.error('Failed to submit score:', error);
        this.isSubmittingScore = false;
      },
    });
  }

  loadTotalCoffee(): void {
    try {
      const savedTotalCoffee = localStorage.getItem('bugChaseTotalCoffee');
      if (savedTotalCoffee) {
        this.totalCoffee = parseInt(savedTotalCoffee) || 0;
      }
    } catch (error) {
      console.error('Error loading total coffee:', error);
      this.totalCoffee = 0;
    }
  }

  saveTotalCoffee(): void {
    try {
      localStorage.setItem('bugChaseTotalCoffee', this.totalCoffee.toString());
    } catch (error) {
      console.error('Error saving total coffee:', error);
    }
  }

  // Drawing functions
  clearCanvas(): void {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    if (this.isSpeedBoosted) {
      gradient.addColorStop(0, '#FFD700');
      gradient.addColorStop(1, '#FFA500');
    } else {
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#98FB98');
    }
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#90EE90';
    this.ctx.fillRect(0, this.groundY + 50, this.canvas.width, 50);

    this.ctx.fillStyle = '#228B22';
    this.ctx.fillRect(0, this.groundY + 50, this.canvas.width, 4);

    this.ctx.fillStyle = '#32CD32';
    for (let i = 0; i < this.canvas.width; i += 10) {
      this.ctx.fillRect(i, this.groundY + 52, 2, 8);
    }
  }

  draw(): void {
    this.drawPlayer();
    this.drawObstacles();
    this.drawCoffees();
    this.drawScore();
    this.drawSpeedBoostIndicator();
  }

  drawPlayer(): void {
    if (this.isSpeedBoosted) {
      this.ctx.shadowColor = '#FFD700';
      this.ctx.shadowBlur = 10;
      this.ctx.fillStyle = '#FFD700';
    } else {
      this.ctx.shadowBlur = 0;
      this.ctx.fillStyle = '#4169E1';
    }

    this.ctx.fillRect(
      this.player.x,
      this.player.y,
      this.player.width,
      this.player.height
    );

    this.ctx.shadowBlur = 0;

    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(this.player.x + 8, this.player.y + 8, 8, 8);
    this.ctx.fillRect(this.player.x + 24, this.player.y + 8, 8, 8);

    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(this.player.x + 15, this.player.y + 25, 10, 3);

    const legSpeed = this.isSpeedBoosted ? 0.04 : 0.02;
    const legOffset = Math.sin(Date.now() * legSpeed) * 3;
    this.ctx.fillStyle = this.isSpeedBoosted ? '#FFD700' : '#4169E1';
    this.ctx.fillRect(
      this.player.x + 5,
      this.player.y + this.player.height,
      8,
      10 + legOffset
    );
    this.ctx.fillRect(
      this.player.x + 27,
      this.player.y + this.player.height,
      8,
      10 - legOffset
    );
  }

  drawObstacles(): void {
    this.obstacles.forEach((obstacle) => {
      if (obstacle.type === 'BUG') {
        this.ctx.fillStyle = '#FF0000';
      } else if (obstacle.type === 'DEADLINE') {
        this.ctx.fillStyle = '#FF4500';
      }

      this.ctx.fillRect(
        obstacle.x,
        obstacle.y,
        obstacle.width,
        obstacle.height
      );

      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(
        obstacle.x,
        obstacle.y,
        obstacle.width,
        obstacle.height
      );

      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = 'bold 8px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        obstacle.type,
        obstacle.x + obstacle.width / 2,
        obstacle.y + obstacle.height / 2 + 3
      );
    });
  }

  drawCoffees(): void {
    this.coffees.forEach((coffee) => {
      if (!coffee.collected) {
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(
          coffee.x + 3,
          coffee.y + 5,
          coffee.width - 6,
          coffee.height - 8
        );

        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(
          coffee.x + coffee.width - 2,
          coffee.y + coffee.height / 2,
          6,
          0,
          Math.PI
        );
        this.ctx.stroke();

        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          const steamX = coffee.x + 8 + i * 4;
          const steamOffset = Math.sin(Date.now() * 0.01 + i) * 2;
          this.ctx.beginPath();
          this.ctx.moveTo(steamX, coffee.y + 2);
          this.ctx.lineTo(steamX + steamOffset, coffee.y - 5);
          this.ctx.stroke();
        }

        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 8px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
          '☕',
          coffee.x + coffee.width / 2,
          coffee.y + coffee.height / 2 + 2
        );
      }
    });
  }

  drawScore(): void {
    this.ctx.fillStyle = '#000000';
    this.ctx.font = '20px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Score: ${this.score}`, 20, 30);
    this.ctx.fillText(`Coffee: ${this.coffeeCount} ☕`, 20, 55);
    this.ctx.fillText(`Speed: ${this.gameSpeed.toFixed(1)}`, 20, 80);
  }

  drawSpeedBoostIndicator(): void {
    if (this.isSpeedBoosted) {
      const timeLeft = Math.max(0, this.speedBoostEndTime - Date.now());
      const timeLeftSeconds = (timeLeft / 1000).toFixed(1);

      this.ctx.fillStyle = '#FFD700';
      this.ctx.font = 'bold 24px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`⚡ SPEED BOOST ⚡`, this.canvas.width / 2, 40);

      this.ctx.fillStyle = '#FF4500';
      this.ctx.font = '16px Arial';
      this.ctx.fillText(`${timeLeftSeconds}s`, this.canvas.width / 2, 65);
    }
  }

  drawStartScreen(): void {
    this.clearCanvas();

    this.ctx.fillStyle = '#000000';
    this.ctx.font = '48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      'Bug Chase',
      this.canvas.width / 2,
      this.canvas.height / 2 - 80
    );

    this.ctx.font = '18px Arial';
    this.ctx.fillText(
      'Jump over small ground obstacles',
      this.canvas.width / 2,
      this.canvas.height / 2 - 40
    );
    this.ctx.fillText(
      'Duck under flying obstacles',
      this.canvas.width / 2,
      this.canvas.height / 2 - 15
    );
    this.ctx.fillText(
      'Collect COFFEE for speed boost (5s)!',
      this.canvas.width / 2,
      this.canvas.height / 2 + 10
    );

    this.ctx.font = '16px Arial';
    this.ctx.fillText(
      'Space = Jump | Arrow Down = Duck',
      this.canvas.width / 2,
      this.canvas.height / 2 + 50
    );
  }
}
