import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'transformData',
})
export class TransformDataPipe implements PipeTransform {
  transform(value: string | any[]): string {
    // console.log('pipe', value);

    if (typeof value === 'string') {
      const res: any[] = JSON.parse(value);
      if (res.length === 0) return 'No hay concepto';
      return res[0].concepto;
    }

    return value[0].concepto;
  }
}
