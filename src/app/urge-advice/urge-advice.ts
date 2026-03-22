import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-urge-advice',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './urge-advice.html',
  styleUrl: './urge-advice.css',
})
export class UrgeAdvice {
  readonly adviceCards = [
    {
      icon: '🚿',
      title: 'Cold Shower',
      description: 'A cold shower shocks your system and resets your mind. Even 30 seconds helps.',
    },
    {
      icon: '💪',
      title: 'Do Pushups',
      description: 'Physical exertion redirects your energy. Drop and do as many as you can.',
    },
    {
      icon: '🚶',
      title: 'Change Environment',
      description: 'Get up and go outside. A change of scenery is the most effective way to break the cycle.',
    },
    {
      icon: '🧘',
      title: 'Plank',
      description: 'Hold a plank for as long as you can. It demands full focus and drains the urge.',
    },
    {
      icon: '🧘‍♂️',
      title: 'Observe the Urge',
      description: 'Sit quietly, breathe deeply, and watch the urge without acting on it. It will pass.',
    },
  ];
}
