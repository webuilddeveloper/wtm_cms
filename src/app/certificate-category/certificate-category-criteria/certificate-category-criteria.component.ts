import { Component, OnInit, Input, Output, EventEmitter, KeyValueDiffer, KeyValueDiffers, KeyValueChanges } from '@angular/core';
import { ServiceProviderService } from 'src/app/shared/service-provider.service';
import { FormControl } from '@angular/forms';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { MatAccordionDisplayMode } from '@angular/material/expansion';

@Component({
  selector: 'app-certificate-category-criteria',
  templateUrl: './certificate-category-criteria.component.html',
  styleUrls: ['./certificate-category-criteria.component.css']
})
export class CertificateCategoryCriteriaComponent implements OnInit {

  @Input() displayMode: MatAccordionDisplayMode
  @Input() hideToggle: boolean
  @Input() criteriaModel: any = {};;
  @Output() messageToEmit = new EventEmitter<any>();
  isAdvanceSearch: boolean = true;
  listCategory: any = [{ value: '', display: 'ทั้งหมด' }];
  permission: any;
  @Input() paginationModel: any = {}; // <----- Pagination
  paginationModelDiffer: KeyValueDiffer<string, any>; // <----- Pagination

  // @Input() title;
  // @Input() description;
  // @Input() isActive;

  
  public dateTimeControl = new FormControl(moment());
  public dateControl = new FormControl(moment());

  constructor(private serviceProviderService: ServiceProviderService, private spinner: NgxSpinnerService,  private toastr: ToastrService, private differs: KeyValueDiffers) { }

  ngOnInit(): void {

    if (localStorage.getItem('certificateCategoryPage') != null) {
      let model: any = [];
      model = JSON.parse(localStorage.getItem('certificateCategoryPage'));

      for (let index = 0; index < model.length; index++) {
        if (index == 0)
          this.permission = model[index].title;
        else
          this.permission = this.permission + "," + model[index].title;        
      }
    }

    this.search()

    this.paginationModelDiffer = this.differs.find(this.paginationModel).create(); // <----- Pagination
  }

  search() {
    this.spinner.show();
    this.messageToEmit.emit(this.criteriaModel); // <----- Pagination
  }

  advance() {
    this.isAdvanceSearch = !this.isAdvanceSearch; 
    this.criteriaModel.keySearch = '';
  }

  displayDate(param) {
    return moment(param).format('YYYYMMDD');
  }
  
  displayDateTime(param) {
    return moment(param).format('YYYYMMDDhhmmss');
  }

  reset() {
    this.criteriaModel.title = '';
    this.criteriaModel.sequence = '';
    this.criteriaModel.category = '';
    this.criteriaModel.startDate = '';
    this.criteriaModel.endDate = '';
    this.criteriaModel.status = '';
    this.criteriaModel.createBy = '';
    // this.read();
  }

}
