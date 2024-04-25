import { TestBed } from '@angular/core/testing'
import { CanActivateFn } from '@angular/router'

import { yourGuardGuard } from './your-guard.guard'

describe('yourGuardGuard', () => {
    const executeGuard: CanActivateFn = (...guardParameters) => 
        TestBed.runInInjectionContext(() => yourGuardGuard(...guardParameters))

    beforeEach(() => {
        TestBed.configureTestingModule({})
    })

    it('should be created', () => {
        expect(executeGuard).toBeTruthy()
    })
})
