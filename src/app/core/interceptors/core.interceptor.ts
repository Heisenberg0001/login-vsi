import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { delay, finalize } from 'rxjs';

import { LoadingService } from '@shared/services';

export const coreInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService: LoadingService = inject(LoadingService);
  loaderService.show();
  return next(req).pipe(
    delay(1500), // to replicate real scenario average time
    finalize(() => loaderService.hide()),
  );
};
