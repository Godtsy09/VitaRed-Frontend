import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScheduledAppointments } from './scheduled-appointments';

describe('ScheduledAppointments', () => {
  let component: ScheduledAppointments;
  let fixture: ComponentFixture<ScheduledAppointments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduledAppointments],
    }).compileComponents();

    fixture = TestBed.createComponent(ScheduledAppointments);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
