import { Injectable } from '@angular/core';
import { Point } from 'src/@types';

@Injectable({
  providedIn: 'root',
})
export class CalculatorService {
  constructor() {}

  public calculateGeneralEquation(pa: Point, pb: Point) {
    const a = pa.y - pb.y;
    const b = pb.x - pa.x;
    const c = pa.x * pb.y - pb.x * pa.y;
    return new GeneralEquationCalculator(a, b, c);
  }
  public calculateReducedEquation(pa: Point, pb: Point) {
    const m = (pb.y - pa.y) / (pb.x - pa.x);
    const n = (m * pa.x - pa.y) * -1;
    return new ReducedEquationCalculator(m, n);
  }
  public distanceBetweenPoints(pa: Point, pb: Point) {
    const distance = Math.sqrt(
      Math.pow(pa.x - pb.x, 2) + Math.pow(pa.y - pb.y, 2)
    );
    return distance;
  }
}

class GeneralEquationCalculator {
  private a: number = 0;
  private b: number = 0;
  private c: number = 0;
  constructor(a: number, b: number, c: number) {
    this.a = a;
    this.b = b;
    this.c = c;
  }

  public calc(coordinate: number, type: 'x' | 'y') {
    if (type == 'y') {
      return (-this.a * coordinate - this.c) / this.b;
    }
    if (type == 'x') {
      return (-this.b * coordinate - this.c) / this.a;
    }
    return;
  }

  public getA() {
    return this.a;
  }

  public getB() {
    return this.b;
  }

  public getC() {
    return this.c;
  }
}

class ReducedEquationCalculator {
  private m: number = 0;
  private n: number = 0;

  constructor(m: number, n: number) {
    this.m = m;
    this.n = n;
  }

  public calc(coodinate: number, type: 'x' | 'y') {
    if (type == 'x') {
      return (coodinate - this.n) / this.m;
    }
    if (type == 'y') {
      return this.m * coodinate + this.n;
    }
    return;
  }

  public getM() {
    return this.m;
  }
  public getN() {
    return this.n;
  }
}

/*
  (a1 * b2 + a2 * x + b1 * y) - (x * b2 + y * a1 + b1 * a2)
 a = a2 * x - b2 * x
 b = b1 * y - a1 * y
 c = a1 * b2 - b1 * a2
  

 ax+by+c = 0

 -by = ax+c
 by= -ax-c
 y = (-ax - c) / b


 -ax = by+c
 ax = -by - c
 x= (-by -c) / a


 y = mx+n
  mx = y-n
  x = (y-n)/m
 y-n = mx
 -n = mx -y
 n = -(mx) + y
*/
