import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'priority',
  standalone: true,
})
export class PriorityPipe implements PipeTransform {
  transform(value: 'low' | 'medium' | 'high'): string {
    switch (value) {
      case 'low':
        return 'Faible';
      case 'medium':
        return 'Moyenne';
      case 'high':
        return 'Haute';
      default:
        return value;
    }
  }
}
