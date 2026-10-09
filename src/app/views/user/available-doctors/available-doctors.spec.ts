import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvailableDoctors } from './available-doctors';

describe('AvailableDoctors', () => {
  let component: AvailableDoctors;
  let fixture: ComponentFixture<AvailableDoctors>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvailableDoctors],
    }).compileComponents();

    fixture = TestBed.createComponent(AvailableDoctors);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
