import { Component, OnInit, ViewChild, OnDestroy, ViewContainerRef, DoCheck, KeyValueDiffers } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { from } from 'rxjs/observable/from';
import { DriverService } from '../../service/driver.service';
import { VehicleService } from '../../service/vehicle.service';
import { FuelingService } from '../../service/fueling.service';
import { Driver } from '../../model/driver';
import { Vehicle } from '../../model/vehicle';
import { Fueling } from '../../model/fueling';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { ChartDataService } from '../../service/chart-data.service';
import { TranslateBase } from '../../service/translate.base';
import { ToastsManager } from 'ng2-toastr';

@Component({
  selector: 'app-stat',
  templateUrl: './stat.component.html',
  styleUrls: ['./stat.component.css']
})
export class StatComponent extends TranslateBase<any> implements OnInit, OnDestroy, DoCheck {

  @ViewChild('cchart') myChart;

  allData: any;

  pieChartData: any = {};

  driverList: Array<{key: string, label: string}> = [];
  filterObject = {
    driverID: 'notset',
    startDate: '',
    endDate: ''
  }
  filterDiffer: any;
  chartType: string = "PieChart";
  zipSubscription: Subscription;
  formObservable: Observable<any>;

  constructor(
    private cService: ChartDataService,
    private differs: KeyValueDiffers,
    toaster: ToastsManager,
    vcr: ViewContainerRef
  ) {
    super(toaster, vcr);
    this.allData = this.cService.cachedData;
    this.createChartData();

    this.filterDiffer = this.differs.find(this.filterObject).create();
  }

  ngOnInit() {
    this.zipSubscription = this.cService.dataSubject
      .map( values => {
        values.drivers.forEach( item => {
          this.driverList.push({
            key: item.key,
            label: item.driver.name
          });
        });
        return values;
      })
      .subscribe(
        zipData => {
          this.allData = zipData;
          this.createChartData();
      }
    );


  }

  ngDoCheck() {
    var changes = this.filterDiffer.diff(this.filterObject); // check for changes
    if (changes) {
      this.chartType =
      this.filterObject.driverID != 'notset' || this.filterObject.startDate ||
        this.filterObject.endDate
        ? 'ColumnChart'
        : 'PieChart';
      this.createChartData();
    }
  }

  ngOnDestroy() {
    this.zipSubscription.unsubscribe();
  }

  createChartData(): void {
    if (!this.allData) return;

    let chartData = {
      chartType: this.chartType,
      dataTable: this.chartType == 'PieChart'
                  ? this.getConsumptionPerDriver()
                  : this.getFuelingsByDriver(),
      options: {
        'title': 'Tankolás',
        'is3D': true,
        'legend': 'bottom',
        'width': 800,
        'height': 600
      }
    };

    this.pieChartData = chartData;
  }

  applyFilters(fuelings: Array<any>): Array<any> {
    return fuelings.filter( item => {
      let out = true;
      if (this.filterObject.driverID != 'notset' &&
          this.filterObject.driverID != item.fueling.driverId) {
            out = false;
          }
      if (this.filterObject.startDate &&
          this.filterObject.startDate > item.fueling.time) {
            out = false;
          }
      if (this.filterObject.endDate &&
          this.filterObject.endDate < item.fueling.time) {
            out = false;
          }
      return out;
    });
  }

  getConsumptionPerDriver(): Array<any> {
    let compared: Array<any> = [
      ['Names', 'Fuel Consumption']
    ];
    this.allData.drivers.forEach(item => {
      compared.push(
        [item.driver.name, this.getFueling(item.key)]
      );
    });
    return compared;
  }

  getFuelingsByDriver(): Array<any> {
    let fueling: Array<any> = [
      ['Időpont', 'Üzemanyag mennyisége']
    ];

    let fuelingData: Array<any> = this.applyFilters(this.allData.fuelings);

    fuelingData.forEach(item => {
      fueling.push(
        [
          item.fueling.time,
          parseInt(item.fueling.amount)
        ]
      );
    });

    return fueling;
  }

  getFueling(driverKey): any {
    let fueling: any = 0;

    let fuelingData: Array<any> = this.applyFilters(this.allData.fuelings);

    fuelingData.forEach(item => {
      if (item.fueling.driverId == driverKey) {
        fueling += parseInt(item.fueling.amount);
      }
    });
    return parseInt(fueling);
  }

}
