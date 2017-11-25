import { Directive, ElementRef, Renderer, Input, Output, HostListener, EventEmitter,
  OnChanges, OnDestroy, SimpleChanges, NgZone } from '@angular/core';
import { ChangeFilter } from '../util/change-filter';

declare var echarts: any;

@Directive({
  selector: 'echarts, [echarts]'
})
export class NgxEchartsDirective implements OnChanges, OnDestroy {
  @Input() options: any;
  @Input() theme: string;
  @Input() loading: boolean;
  @Input() initOpts: any;
  @Input() merge: any;

  // chart events:
  @Output() chartInit = new EventEmitter<any>();
  @Output() chartClick = new EventEmitter<any>();
  @Output() chartDblClick = new EventEmitter<any>();
  @Output() chartMouseDown = new EventEmitter<any>();
  @Output() chartMouseUp = new EventEmitter<any>();
  @Output() chartMouseOver = new EventEmitter<any>();
  @Output() chartMouseOut = new EventEmitter<any>();
  @Output() chartGlobalOut = new EventEmitter<any>();
  @Output() chartContextMenu = new EventEmitter<any>();
  @Output() chartDataZoom = new EventEmitter<any>();

  private _chart: any = null;
  private currentWindowWidth: any = null;

  constructor(private el: ElementRef, private _ngZone: NgZone) { }

  private createChart() {
    this.currentWindowWidth = window.innerWidth;
    let dom = this.el.nativeElement;

    if (window && window.getComputedStyle) {
      let prop = window.getComputedStyle(dom, null).getPropertyValue('height');
      if (!prop || prop === '0px') {
        dom.style.height = '400px';
      }
    }

    return this._ngZone.runOutsideAngular(() => echarts.init(dom, this.theme || undefined, this.initOpts || undefined));
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    if (event.target.innerWidth !== this.currentWindowWidth) {
      this.currentWindowWidth = event.target.innerWidth;
      if (this._chart) {
        this._chart.resize();
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    const filter = ChangeFilter.of(changes);
    filter.notEmpty<any>('options').subscribe(opt => this.onOptionsChange(opt));
    filter.notEmpty<any>('merge').subscribe(opt => this.setOption(opt));
    filter.has<boolean>('loading').subscribe(v => this.toggleLoading(!!v));
  }

  ngOnDestroy() {
    if (this._chart) {
      this._chart.dispose();
      this._chart = null;
    }
  }

  private onOptionsChange(opt: any) {
    if (opt) {
      if (!this._chart) {
        this._chart = this.createChart();

        // output echart instance:
        this.chartInit.emit(this._chart);

        // register events:
        this.registerEvents(this._chart);
      }

      this._chart.setOption(this.options, true);
      this._chart.resize();
    }
  }

  private registerEvents(_chart: any) {
    if (_chart) {
      // register mouse events:
      _chart.on('click', e => this.chartClick.emit(e));
      _chart.on('dblClick', e => this.chartDblClick.emit(e));
      _chart.on('mousedown', e => this.chartMouseDown.emit(e));
      _chart.on('mouseup', e => this.chartMouseUp.emit(e));
      _chart.on('mouseover', e => this.chartMouseOver.emit(e));
      _chart.on('mouseout', e => this.chartMouseOut.emit(e));
      _chart.on('globalout', e => this.chartGlobalOut.emit(e));
      _chart.on('contextmenu', e => this.chartContextMenu.emit(e));
      // other events;
      _chart.on('datazoom', e => this.chartDataZoom.emit(e));
    }
  }

  clear() {
    if (this._chart) {
      this._chart.clear();
    }
  }

  toggleLoading(loading: boolean) {
    if (this._chart) {
      loading ? this._chart.showLoading() : this._chart.hideLoading();
    }
  }

  setOption(option: any, opts?: any) {
    if (this._chart) {
      this._chart.setOption(option, opts);
    }
  }
}
