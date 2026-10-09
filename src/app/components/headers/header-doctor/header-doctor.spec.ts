import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderDoctor } from './header-doctor';

describe('HeaderDoctor', () => {
  let component: HeaderDoctor;
  let fixture: ComponentFixture<HeaderDoctor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderDoctor],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderDoctor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
