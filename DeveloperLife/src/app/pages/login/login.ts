import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  constructor(private router: Router) {}
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
      setTimeout(() => {
        console.log('logged in successfully');
      }, 1500);
      localStorage.setItem('token', '1232');
      this.router.navigate(['/dashboard']);
    }
  }
  redirectToRegister() {
    this.router.navigate(['/register']);
  }
}
