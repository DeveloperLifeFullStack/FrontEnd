import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { UserDataService } from '../../services/user-data-service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  constructor(
    private router: Router,
    private auth: Auth,
    private userDataService: UserDataService
  ) {}
  loginForm = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(4),
      Validators.maxLength(20),
    ]),
  });
  get usernameControl() {
    return this.loginForm.get('username');
  }
  onSubmit() {
    if (this.loginForm.valid) {
      const loginData = {
        username: this.loginForm.value.username!,
      };
      this.auth.login(loginData).subscribe({
        next: (response) => {
          localStorage.setItem('userData', JSON.stringify(response));
          localStorage.setItem('token', JSON.stringify(response.token));
          this.router.navigate(['/dashboard']);
        },
      });
    }
  }
  redirectToRegister() {
    this.router.navigate(['/register']);
  }
}
