import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    let authReq = req;

    if (token) {
      authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Only handle 401s for authenticated requests (not login/register/forgot/reset)
        if (error.status === 401 && token && !this.isAuthEndpoint(req.url)) {
          return this.handle401(authReq, next);
        }
        return throwError(() => error);
      })
    );
  }

  private isAuthEndpoint(url: string): boolean {
    return url.includes('/auth/login') ||
           url.includes('/auth/register') ||
           url.includes('/auth/forgot-password') ||
           url.includes('/auth/reset-password');
  }

  private handle401(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((newToken: string) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(newToken);
          // Retry original request with new token
          return next.handle(req.clone({
            headers: req.headers.set('Authorization', `Bearer ${newToken}`)
          }));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.authService.logout();
          return throwError(() => err);
        })
      );
    }

    // Another request is already refreshing — wait for the new token
    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => {
        return next.handle(req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token!}`)
        }));
      })
    );
  }
}
