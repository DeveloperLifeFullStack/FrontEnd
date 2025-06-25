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

interface ScoreData {
  score: number;
  coffee: number;
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
  highScore = 0;
  bestScores: ScoreData[] = [];

  // Game settings
  gameSpeed = 3;
  baseGameSpeed = 3; // Track the base speed without boost
  groundY = 320;
  gravity = 0.6; // Lighter gravity for easier jumping
  jumpForce = -12; // Less jump force but with lighter gravity

  // Coffee Power-up System
  isSpeedBoosted = false;
  speedBoostEndTime = 0;
  speedBoostDuration = 5000; // 5 seconds in milliseconds
  speedBoostMultiplier = 2; // 2x speed when boosted

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
  obstacleInterval = 2000; // 2 seconds
  coffeeInterval = 2500; // 2.5 seconds (faster coffee spawning!)

  // Mobile detection
  isMobile = false;

  constructor(public sideBarService: Sidebar, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.isMobile = window.innerWidth <= 768;

    // Load saved data
    this.loadGameData();

    // For debugging: Add some sample scores if none exist
    if (this.bestScores.length === 0) {
      console.log(
        'No existing scores found. You can play the game to populate the leaderboard.'
      );
    }

    // Draw start screen
    this.drawStartScreen();
  }

  ngOnDestroy(): void {
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
    }
  }

  // Keyboard controls
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

  // Game controls
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
    this.obstacleInterval = 2000; // Reset intervals
    this.coffeeInterval = 4000;

    // Reset speed boost
    this.isSpeedBoosted = false;
    this.speedBoostEndTime = 0;

    // Reset player
    this.player.x = 100;
    this.player.y = this.groundY;
    this.player.jumpSpeed = 0;
    this.player.isJumping = false;
    this.player.isDucking = false;
    this.player.height = 50;
  }

  // Player actions
  jump(): void {
    if (!this.player.isJumping && !this.player.isDucking) {
      this.player.jumpSpeed = this.jumpForce;
      this.player.isJumping = true;
    }
  }

  startDuck(): void {
    if (!this.player.isJumping) {
      this.player.isDucking = true;
      this.player.height = 20; // Very short when ducking
      this.player.y = this.groundY + 30; // Much lower position
    }
  }

  stopDuck(): void {
    this.player.isDucking = false;
    this.player.height = 50; // Back to normal height
    this.player.y = this.groundY; // Back to normal position
  }

  // Coffee Power-up System
  activateSpeedBoost(): void {
    this.isSpeedBoosted = true;
    this.speedBoostEndTime = Date.now() + this.speedBoostDuration;
    this.gameSpeed = this.baseGameSpeed * this.speedBoostMultiplier;
  }

  updateSpeedBoost(): void {
    if (this.isSpeedBoosted && Date.now() >= this.speedBoostEndTime) {
      this.isSpeedBoosted = false;
      this.gameSpeed = this.baseGameSpeed; // Return to base speed
    }
  }

  // Main game loop
  update(): void {
    // Clear canvas
    this.clearCanvas();

    // Update speed boost
    this.updateSpeedBoost();

    // Update player
    this.updatePlayer();

    // Update obstacles
    this.updateObstacles();

    // Update coffee
    this.updateCoffees();

    // Spawn new objects
    this.spawnObjects();

    // Check collisions
    this.checkCollisions();

    // Update score and speed
    this.updateScore();

    // Draw everything
    this.draw();

    // Continue game loop
    if (this.isPlaying) {
      this.gameLoop = requestAnimationFrame(() => this.update());
    }
  }

  updatePlayer(): void {
    if (this.player.isJumping) {
      // Apply gravity
      this.player.jumpSpeed += this.gravity;
      this.player.y += this.player.jumpSpeed;

      // Land on ground
      if (this.player.y >= this.groundY) {
        this.player.y = this.groundY;
        this.player.jumpSpeed = 0;
        this.player.isJumping = false;
      }
    }
  }

  updateObstacles(): void {
    // Move obstacles from right to left
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.x -= this.gameSpeed;

      // Remove obstacles that are off-screen
      if (obstacle.x + obstacle.width < 0) {
        this.obstacles.splice(i, 1);
        this.score += 10; // Points for avoiding obstacle
      }
    }
  }

  updateCoffees(): void {
    // Move coffees from right to left
    for (let i = this.coffees.length - 1; i >= 0; i--) {
      const coffee = this.coffees[i];
      coffee.x -= this.gameSpeed;

      // Remove coffees that are off-screen
      if (coffee.x + coffee.width < 0) {
        this.coffees.splice(i, 1);
      }
    }
  }

  spawnObjects(): void {
    const currentTime = Date.now();

    // Spawn obstacles
    if (currentTime - this.lastObstacleTime > this.obstacleInterval) {
      this.createObstacle();
      this.lastObstacleTime = currentTime;

      // Make spawning faster over time
      this.obstacleInterval = Math.max(800, this.obstacleInterval - 5);
    }

    // Spawn coffee
    if (currentTime - this.lastCoffeeTime > this.coffeeInterval) {
      this.createCoffee();
      this.lastCoffeeTime = currentTime;

      // Make coffee spawn faster too, but not as aggressive
      this.coffeeInterval = Math.max(1500, this.coffeeInterval - 2);
    }
  }

  createObstacle(): void {
    const types = ['BUG', 'DEADLINE'];
    const type = types[Math.floor(Math.random() * types.length)];

    const obstacle: Obstacle = {
      x: this.canvas.width,
      y: this.groundY + 20, // On ground level
      width: 40, // Smaller width
      height: 25, // Much shorter - easy to jump over
      type: type,
    };

    // Sometimes make flying obstacles that require ducking
    if (Math.random() < 0.4) {
      obstacle.y = this.groundY - 15; // Lower flying obstacle
      obstacle.height = 30; // Flying obstacles are taller
      obstacle.width = 50; // Flying ones can be wider
    }

    this.obstacles.push(obstacle);
  }

  createCoffee(): void {
    // Check if there's an obstacle too close (within 120px)
    const hasNearbyObstacle = this.obstacles.some(
      (obstacle) => obstacle.x > this.canvas.width - 120
    );

    // Don't spawn coffee if there's a nearby obstacle
    if (hasNearbyObstacle) {
      return;
    }

    const coffee: Coffee = {
      x: this.canvas.width,
      y: this.groundY + 25, // On ground level
      width: 20,
      height: 20,
      collected: false,
    };

    // Sometimes make floating coffee (25% chance)
    if (Math.random() < 0.25) {
      coffee.y = this.groundY - 25; // Floating coffee (easier to collect)
    }

    this.coffees.push(coffee);
  }

  checkCollisions(): void {
    // Check obstacle collisions
    for (const obstacle of this.obstacles) {
      if (this.isColliding(this.player, obstacle)) {
        this.gameOver();
        break;
      }
    }

    // Check coffee collisions
    for (let i = this.coffees.length - 1; i >= 0; i--) {
      const coffee = this.coffees[i];
      if (!coffee.collected && this.isColliding(this.player, coffee)) {
        coffee.collected = true;
        this.coffeeCount++;
        this.totalCoffee++;
        this.score += 25; // Bonus points for coffee

        // Activate speed boost power-up
        this.activateSpeedBoost();

        // Remove collected coffee
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
    this.score += 1; // Continuous score increase

    // Increase base speed gradually (only if not speed boosted)
    if (!this.isSpeedBoosted) {
      this.baseGameSpeed += 0.001;
      this.gameSpeed = this.baseGameSpeed;
    } else {
      // If speed boosted, increase base speed but maintain boost multiplier
      this.baseGameSpeed += 0.001;
      this.gameSpeed = this.baseGameSpeed * this.speedBoostMultiplier;
    }
  }

  gameOver(): void {
    this.isPlaying = false;
    this.isGameOver = true;

    // Reset speed boost
    this.isSpeedBoosted = false;
    this.speedBoostEndTime = 0;

    // Save high score
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
    this.bestScores = [...this.bestScores];
    this.cdr.detectChanges();

    // Add to best scores list with coffee count (only if score > 0)
    if (this.score > 0) {
      this.bestScores.push({ score: this.score, coffee: this.coffeeCount });
      this.bestScores.sort((a, b) => b.score - a.score); // Sort by score descending
      this.bestScores = this.bestScores.slice(0, 5); // Keep top 5
      console.log('Updated best scores:', this.bestScores); // Debug log
    }

    this.saveGameData();
  }

  // Drawing functions
  clearCanvas(): void {
    // Sky gradient (different color when speed boosted)
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    if (this.isSpeedBoosted) {
      gradient.addColorStop(0, '#FFD700'); // Golden sky when boosted
      gradient.addColorStop(1, '#FFA500');
    } else {
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#98FB98');
    }
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Ground
    this.ctx.fillStyle = '#90EE90';
    this.ctx.fillRect(0, this.groundY + 50, this.canvas.width, 50);

    // Ground line (where player stands)
    this.ctx.fillStyle = '#228B22';
    this.ctx.fillRect(0, this.groundY + 50, this.canvas.width, 4);

    // Additional visual: grass texture
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
    // Player body (glowing effect when speed boosted)
    if (this.isSpeedBoosted) {
      // Add glow effect
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

    // Reset shadow
    this.ctx.shadowBlur = 0;

    // Simple face
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(this.player.x + 8, this.player.y + 8, 8, 8); // Eye
    this.ctx.fillRect(this.player.x + 24, this.player.y + 8, 8, 8); // Eye

    // Mouth
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(this.player.x + 15, this.player.y + 25, 10, 3);

    // Running legs (faster animation when speed boosted)
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
      // Different colors for different types
      if (obstacle.type === 'BUG') {
        this.ctx.fillStyle = '#FF0000';
      } else if (obstacle.type === 'DEADLINE') {
        this.ctx.fillStyle = '#FF4500';
      }

      // Draw obstacle background
      this.ctx.fillRect(
        obstacle.x,
        obstacle.y,
        obstacle.width,
        obstacle.height
      );

      // Draw border
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(
        obstacle.x,
        obstacle.y,
        obstacle.width,
        obstacle.height
      );

      // Draw text (very small font for small obstacles)
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = 'bold 8px Arial';
      this.ctx.textAlign = 'center';

      // Simple one-line text for small obstacles
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
        // Coffee cup body
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(
          coffee.x + 3,
          coffee.y + 5,
          coffee.width - 6,
          coffee.height - 8
        );

        // Coffee cup handle
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

        // Coffee steam (simple lines)
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

        // Coffee text
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

      // Draw speed boost indicator
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

  saveGameData(): void {
    try {
      localStorage.setItem('bugChaseHighScore', this.highScore.toString());
      localStorage.setItem(
        'bugChaseBestScores',
        JSON.stringify(this.bestScores)
      );
      localStorage.setItem('bugChaseTotalCoffee', this.totalCoffee.toString());
      console.log('Game data saved successfully:', {
        highScore: this.highScore,
        bestScores: this.bestScores,
        totalCoffee: this.totalCoffee,
      });
    } catch (error) {
      console.error('Error saving game data:', error);
    }
  }

  loadGameData(): void {
    try {
      const savedHighScore = localStorage.getItem('bugChaseHighScore');
      const savedBestScores = localStorage.getItem('bugChaseBestScores');
      const savedTotalCoffee = localStorage.getItem('bugChaseTotalCoffee');

      if (savedHighScore) {
        this.highScore = parseInt(savedHighScore) || 0;
      }

      if (savedBestScores) {
        try {
          const parsed = JSON.parse(savedBestScores);
          this.bestScores = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          console.error('Error parsing saved scores:', e);
          this.bestScores = [];
        }
      } else {
        this.bestScores = [];
      }

      if (savedTotalCoffee) {
        this.totalCoffee = parseInt(savedTotalCoffee) || 0;
      }

      console.log('Game data loaded:', {
        highScore: this.highScore,
        bestScores: this.bestScores,
        totalCoffee: this.totalCoffee,
      });
    } catch (error) {
      console.error('Error loading game data:', error);
      this.bestScores = [];
      this.highScore = 0;
      this.totalCoffee = 0;
    }
  }

  debugLeaderboard(): void {
    console.log('Current leaderboard state:', {
      bestScores: this.bestScores,
      bestScoresLength: this.bestScores.length,
      highScore: this.highScore,
      isPlaying: this.isPlaying,
      isGameOver: this.isGameOver,
    });
  }

  clearLeaderboard(): void {
    this.bestScores = [];
    this.highScore = 0;
    this.totalCoffee = 0;
    localStorage.removeItem('bugChaseHighScore');
    localStorage.removeItem('bugChaseBestScores');
    localStorage.removeItem('bugChaseTotalCoffee');
    console.log('Leaderboard cleared!');
  }

  trackByScore(index: number, item: ScoreData): string {
    return `${item.score}-${item.coffee}-${index}`;
  }
}
