import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderUser } from './header-user';

describe('HeaderUser', () => {
  let component: HeaderUser;
  let fixture: ComponentFixture<HeaderUser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderUser],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderUser);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
