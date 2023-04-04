import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Point } from 'src/@types';
import { CalculatorService } from 'src/app/services/calculator.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  private canvasId: string = 'canvas';
  private canvas?: HTMLCanvasElement;
  private point?: Point;
  private lines: { pa: Point; pb: Point }[] = [];
  private goalPoint: Point = { x: 24, y: 0 };
  private generalEquation?: { a: number; b: number; c: number };
  private reducedEquation?: { m: number; n: number };
  private distanceBetweenPoints?: number;

  public frmCtrlToggleAxies = new FormControl(false);
  public frmCtrlManual = new FormControl(false);
  public frmCtrlX = new FormControl(0);
  public frmCtrlY = new FormControl(0);

  constructor(private calculator: CalculatorService) {}

  ngOnInit(): void {
    this.frmCtrlX.disable();
    this.frmCtrlY.disable();
    this.initBoard();

    this.frmCtrlManual.valueChanges.subscribe((value) => {
      if (value) {
        this.clean();
        if (
          this.frmCtrlX.value != undefined &&
          this.frmCtrlY.value != undefined
        ) {
          this.addPoint(this.frmCtrlX.value, this.frmCtrlY.value);
          console.log(this.frmCtrlX.value, this.frmCtrlY.value);
        } else {
          console.log(this.frmCtrlX.value, this.frmCtrlY.value);
          this.addPoint(0, 0);
        }
        this.frmCtrlX.enable();
        this.frmCtrlY.enable();
      } else {
        this.frmCtrlX.disable();
        this.frmCtrlY.disable();
        this.clean();
      }
    });

    this.frmCtrlToggleAxies.valueChanges.subscribe((value) => {
      if (value) {
        this.enableAxies();
      } else {
        this.disableAxies();
      }
    });

    this.frmCtrlX.valueChanges.subscribe((value) => {
      if (value != null) {
        const point = { x: value, y: this.point?.y || 1 };
        this.clean();
        if (point) {
          this.point = point;
          this.addPoint(this.point.x, this.point.y);
          this.traceLines();
        }
      }
    });

    this.frmCtrlY.valueChanges.subscribe((value) => {
      if (value != null) {
        const point = { y: value, x: this.point?.x || 1 };
        this.clean();
        if (point) {
          this.point = point;
          this.addPoint(this.point.x, this.point.y);
          this.traceLines();
        }
      }
    });
  }

  public addPoint(x: number, y: number, init?: boolean) {
    const context = this.canvas?.getContext('2d');
    const convertedPoint = this.coodinatesConversor({ x, y });
    context?.beginPath();
    context?.arc(convertedPoint.x, convertedPoint.y, 2.5, 0, 2 * Math.PI);
    context?.stroke();
    if (!init) {
      this.point = { x, y };
      this.distanceBetweenPoints = this.calculator.distanceBetweenPoints(
        { x, y },
        { x: this.goalPoint.x, y: this.goalPoint.y }
      );
    }
  }

  public addLine(pa: Point, pb: Point, init?: boolean) {
    const context = this.canvas?.getContext('2d');
    const cpa = this.coodinatesConversor({ x: pa.x, y: pa.y });
    const cpb = this.coodinatesConversor({ x: pb.x, y: pb.y });
    context?.moveTo(cpa.x, cpa.y);
    context?.lineTo(cpb.x, cpb.y);
    context?.stroke();

    if (!init) {
      this.lines.push({ pa, pb });
    }
  }

  public generateRandomPoint() {
    this.addPoint(
      this.getRandomIntInclusive(-23, 23),
      this.getRandomIntInclusive(-14, 14)
    );
  }

  public generatePoint(x: number, y: number) {
    this.addPoint(x, y);
  }

  public clean() {
    const canvasSection = document.querySelector('.canvas-section');
    const canvas = document.querySelector('canvas');
    if (canvasSection) {
      if (canvas) {
        canvasSection.removeChild(canvas);
      }

      const newCanvas = document.createElement('canvas');
      newCanvas.setAttribute('height', '500');
      newCanvas.setAttribute('width', '500');
      newCanvas.setAttribute('style', 'height:500px; width:500px;');
      newCanvas.setAttribute('id', 'canvas');
      newCanvas.setAttribute('class', 'mt-4');

      canvasSection.appendChild(newCanvas);
      this.initBoard();
      this.point = undefined;
      this.lines = [];
      this.generalEquation = undefined;
      this.reducedEquation = undefined;
      this.distanceBetweenPoints = undefined;
      this.frmCtrlToggleAxies.setValue(false);
    }
  }

  public traceLines() {
    if (this.point) {
      this.addLine(this.point, this.goalPoint);
      const general = this.calculator.calculateGeneralEquation(
        this.point,
        this.goalPoint
      );

      this.generalEquation = {
        a: general.getA(),
        b: general.getB(),
        c: general.getC(),
      };
      const reduced = this.calculator.calculateReducedEquation(
        this.point,
        this.goalPoint
      );

      this.reducedEquation = { m: reduced.getM(), n: reduced.getN() };
    }
  }

  public getPoint() {
    return this.point;
  }

  public getLines() {
    return this.lines;
  }

  public getViewHeight() {
    return window.innerHeight;
  }

  public getValue(value: number) {
    const valueSplit = value.toString().split('.');
    const integer = valueSplit[0];
    const decimals = valueSplit[1]?.substring(0, 3);
    return Number(decimals ? integer + '.' + decimals : integer);
  }

  public getDistance() {
    return this.distanceBetweenPoints;
  }

  public getGeneralEquation() {
    if (this.generalEquation) {
      return `${
        this.generalEquation.a < 0
          ? '(' + this.generalEquation.a + 'x)'
          : this.generalEquation.a + 'x'
      } + ${
        this.generalEquation.b < 0
          ? '(' + this.generalEquation.b + 'y)'
          : this.generalEquation.b + 'y'
      } + ${
        this.generalEquation.c < 0
          ? '(' + this.generalEquation.c + ')'
          : this.generalEquation.c
      } = 0`;
    }
    return;
  }
  public getReducedEquation() {
    if (this.reducedEquation) {
      const reducedValueM = Number(
        this.reducedEquation.m.toString().split('.')[1]?.length > 3
          ? this.reducedEquation.m.toString().substring(0, 5)
          : this.reducedEquation.m
      );
      const reducedValueN = Number(
        this.reducedEquation.n.toString().split('.')[1]?.length > 3
          ? this.reducedEquation.n.toString().substring(0, 5)
          : this.reducedEquation.n
      );

      return `y = ${
        reducedValueM < 0 ? '(' + reducedValueM + ')' : reducedValueM
      } * x + ${reducedValueN < 0 ? '(' + reducedValueN + ')' : reducedValueN}`;
    }
    return;
  }

  private initBoard() {
    this.canvas = document.querySelector('canvas') as HTMLCanvasElement;
    //Gera o plano cartesiano
    // this.addPoint(0, 0);
    // this.addLine({ x: 0, y: 0 }, { x: -25, y: 0 });
    // this.addLine({ x: 0, y: 0 }, { x: 25, y: 0 });
    // this.addLine({ x: 0, y: 0 }, { x: 0, y: 25 });
    // this.addLine({ x: 0, y: 0 }, { x: 0, y: -25 });

    //Gera o perímetro da quadra
    this.addLine({ x: -25, y: 15 }, { x: -25, y: -15 }, true);
    this.addLine({ x: 25, y: 15 }, { x: 25, y: -15 }, true);
    this.addLine({ x: -25, y: 15 }, { x: 25, y: 15 }, true);
    this.addLine({ x: -25, y: -15 }, { x: 25, y: -15 }, true);

    //Gera as balizas
    this.addPoint(24, 1, true);
    this.addPoint(24, -1, true);
    this.addPoint(-24, 1, true);
    this.addPoint(-24, -1, true);

    this.addLine({ x: 24, y: 1 }, { x: 24, y: -1 }, true);
    this.addLine({ x: -24, y: 1 }, { x: -24, y: -1 }, true);
  }

  private getRandomIntInclusive(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  private coodinatesConversor(coordinate: Point): Point {
    return { x: coordinate.x * 10 + 250, y: coordinate.y * -10 + 250 };
  }

  private enableAxies() {
    const point = this.point;
    const lines = this.lines;
    const general = this.generalEquation;
    const reduced = this.reducedEquation;

    const canvasSection = document.querySelector('.canvas-section');
    const canvas = document.querySelector('canvas');
    if (canvasSection) {
      if (canvas) {
        canvasSection.removeChild(canvas);
      }

      const newCanvas = document.createElement('canvas');
      newCanvas.setAttribute('height', '500');
      newCanvas.setAttribute('width', '500');
      newCanvas.setAttribute('style', 'height:500px; width:500px;');
      newCanvas.setAttribute('id', 'canvas');
      newCanvas.setAttribute('class', 'mt-4');

      canvasSection.appendChild(newCanvas);
      this.initBoard();
      this.point = undefined;
      this.lines = [];
      this.generalEquation = undefined;
      this.reducedEquation = undefined;
    }

    this.addPoint(0, 0, true);
    this.addLine({ x: 0, y: 0 }, { x: -25, y: 0 }, true);
    this.addLine({ x: 0, y: 0 }, { x: 25, y: 0 }, true);
    this.addLine({ x: 0, y: 0 }, { x: 0, y: 25 }, true);
    this.addLine({ x: 0, y: 0 }, { x: 0, y: -25 }, true);

    for (let i = 0; i <= 24; i++) {
      this.addPoint(0, i, true);
      this.addPoint(i, 0, true);
      this.addPoint(0, -i, true);
      this.addPoint(-i, 0, true);
    }

    if (point) {
      this.addPoint(point?.x, point?.y);
    }

    lines.forEach((line) => {
      this.addLine(line.pa, line.pb);
    });

    this.reducedEquation = reduced;
    this.generalEquation = general;
  }

  private disableAxies() {
    const point = this.point;
    const lines = this.lines;
    const general = this.generalEquation;
    const reduced = this.reducedEquation;

    const canvasSection = document.querySelector('.canvas-section');
    const canvas = document.querySelector('canvas');
    if (canvasSection) {
      if (canvas) {
        canvasSection.removeChild(canvas);
      }

      const newCanvas = document.createElement('canvas');
      newCanvas.setAttribute('height', '500');
      newCanvas.setAttribute('width', '500');
      newCanvas.setAttribute('style', 'height:500px; width:500px;');
      newCanvas.setAttribute('id', 'canvas');
      newCanvas.setAttribute('class', 'mt-4');

      canvasSection.appendChild(newCanvas);
      this.initBoard();
      this.point = undefined;
      this.lines = [];
      this.generalEquation = undefined;
      this.reducedEquation = undefined;
    }

    if (point) {
      this.addPoint(point?.x, point?.y);
    }

    lines.forEach((line) => {
      this.addLine(line.pa, line.pb);
    });
    this.reducedEquation = reduced;
    this.generalEquation = general;
  }
}
