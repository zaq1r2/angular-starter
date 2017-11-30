import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, Validators, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { AuthService, ApiService, UIService } from '@shared';

@Component({
  selector: 'login', 
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

    public formMain: FormGroup;
    public waiting: boolean;
    public errorApi: IErrorApi;
    public showErrorDetails: boolean = false;
    public sessionExpired: boolean = this.authService.sessionExpired;
    public showPassword: boolean = false;
    public returnUrl: string;

    constructor(
        private authService: AuthService,
        private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder,
		private api: ApiService,
		private ui: UIService
    ) {
    }

    public ngOnInit() {

        let isLogin, hasLogin;
		if (window.localStorage.rememberLogin && window.localStorage.userName) {
            isLogin = window.localStorage.userName;
		}

		if (window.localStorage.rememberLogin) {
			hasLogin = true;
		}

		this.route.queryParams.subscribe(params => {
				if (params.session == 'expired') {
					this.sessionExpired = true;
				}
			}).unsubscribe();
        
        
        window.clearTimeout(this.authService.sessionTimer); // When the page is loaded, clear any legacy timeouts
        this.authService.logOutModal = null; // Get rid of logout modal if it persists

        this.formMain = this.fb.group({ // <-- the parent FormGroup
			userName: [isLogin || '', [Validators.required]],
			password    : ['', [Validators.required]],
			remember    : [hasLogin]
        });

        // get return url from route parameters or default to '/'
		this.returnUrl = this.route.snapshot.queryParams['returnUrl'] ||  '/'
    }

    /**
    * Submit the form
    */
    public onLogin() {
        this.waiting = true;
		this.errorApi = null;
		this.showErrorDetails = false;

        // If remember username is set
		if (this.formMain.value.remember) {
		    window.localStorage.userName = this.formMain.value.userName;
		    window.localStorage.rememberLogin = true;
		} else {
		    window.localStorage.removeItem('rememberLogin');
		}
        
        this.authService.logIn(this.formMain.value).subscribe(
			(success) => this.router.navigate([this.returnUrl]),
			(error) => {
				error.errorMsg = 'Error logging in.';
				if (error.statusText = 'Unauthorized'){
					error.errorMsg = 'Invalid username or password, please try again.';
					this.showErrorDetails = false;
				}

				this.errorApi = error; 
				this.waiting = false;
            }
        )
          
    } // end onSubmit
    
}
