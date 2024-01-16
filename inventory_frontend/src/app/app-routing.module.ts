import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { AdminGuard } from './auth/admin-guard.service';
import { AuthGuard } from './auth/auth-guard.service';
import { LoginComponent } from './auth/login/login.component';
import { AccountingInitialComponent } from './components/accounting-initial/accounting-initial.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { SystemInitialComponent } from './components/system-initial/system-initial.component';
import { ReportsInitialComponent } from './components/reports/reports-initial/reports-initial.component';

const routes: Routes = [
	{
		path: '',
		redirectTo:'system',
    	pathMatch:'full'
	},
	{
		path: 'login',
		component: LoginComponent,
	},
	{
		path: 'system',
		component: SystemInitialComponent,
		children: [
			{
				path: '',
				loadChildren: () => import( './modules/system-pages' ).then( m => m.SystemPagesModule )
			},
		],
    	canActivate:[AuthGuard]
	},
	{
		path: 'accounting',
		component: AccountingInitialComponent,
		children: [
			{
				path: '',
				loadChildren: () => import( './modules/Accounting/accounting.module' ).then( m => m.AccountingModule )
			},
		],
    	canActivate:[AuthGuard,AdminGuard]
	},
	{
		path: 'reports',
		component: ReportsInitialComponent,
		children: [
			{
				path: '',
				loadChildren: () => import( './modules/Reports/reports.module' ).then( m => m.ReportsModule )
			},
		],
    	canActivate:[AuthGuard,AdminGuard]
	},
	{
		path: '**',
		component: NotFoundComponent,
	}
];


@NgModule( {
	imports: [ RouterModule.forRoot( routes, { useHash: false, anchorScrolling: 'disabled', scrollPositionRestoration: 'disabled' } )],
	exports: [ RouterModule ]
} )

export class AppRoutingModule { }
