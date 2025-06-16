import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FileUploadService } from 'src/app/shared/file-upload.service';
import { ServiceProviderService } from 'src/app/shared/service-provider.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.css']
})
export class AboutUsComponent implements OnInit {
  listPage: any = [];
  editModel: any = {};
  code: string = '';
  category: any = {};

  constructor(private fileuploadService: FileUploadService
    , private serviceProviderService: ServiceProviderService
    , private spinner: NgxSpinnerService
    , private toastr: ToastrService
    , private router: Router
    , private activetedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.read();
  }

  create() {
    let isValid = false;
    if (this.editModel.title == '') {
      this.toastr.warning('กรุณาใส่ชื่อ', 'แจ้งเตือนระบบ', { timeOut: 2000 });
      isValid = true;
    }

    if (this.editModel.image != undefined) {
      if (this.editModel.image.length == 0) {
        this.toastr.warning('กรุณาใส่รูปภาพโลโก้', 'แจ้งเตือนระบบ', { timeOut: 2000 });
        isValid = true;
      }
    }

    if (this.editModel.imageBg != undefined) {
      if (this.editModel.imageBg.length == 0) {
        this.toastr.warning('กรุณาใส่รูปภาพพื้นหลัง', 'แจ้งเตือนระบบ', { timeOut: 2000 });
        isValid = true;
      }
    }

    if (isValid)
      return;

    if (this.editModel.image != undefined)
      this.editModel.imageLogoUrl = this.editModel.image[0].imageUrl;

    if (this.editModel.imageBg != undefined)
      this.editModel.imageBgUrl = this.editModel.imageBg[0].imageUrl;

    this.spinner.show();
    this.serviceProviderService.post('aboutUs/create', this.editModel).subscribe(data => {
      let model: any = {}
      model = data;
      if (model.status === 'S') {
        /** spinner ends after 5 seconds */
        this.spinner.hide();
        this.toastr.success('บันทึกข้อมูลสำเร็จ', 'แจ้งเตือนระบบ', { timeOut: 1000 });
        // setTimeout(() => {
        //   this.spinner.show();
        //   window.location.reload();
        // },1000)

      } else {
        this.spinner.hide();
        this.toastr.error(model.message, 'แจ้งเตือนระบบ', { timeOut: 2000 });
      }
    }, err => {
      this.spinner.hide();
      this.toastr.error(err.message, 'แจ้งเตือนระบบ', { timeOut: 2000 });
    });
  }

  read() {
    this.spinner.show();
    this.editModel.code = localStorage.getItem('userCode');
    this.serviceProviderService.post('aboutUs/read', { code: this.editModel.code }).subscribe(data => {
      let model: any = {};
      model = data;

      if (model.objectData.length > 0) {
        this.editModel = model.objectData[0];
        this.code = this.editModel.code;
      }

      this.spinner.hide();
    }, err => {
      this.spinner.hide();
      this.toastr.error(err.message, 'แจ้งเตือนระบบ', { timeOut: 2000 });
    });
  }

  update() {
    let isValid = false;
    if (this.editModel.title == '') {
      this.toastr.warning('กรุณาใส่ชื่อ', 'แจ้งเตือนระบบ', { timeOut: 2000 });
      isValid = true;
    }

    if (this.editModel.image != undefined) {
      if (this.editModel.image.length == 0) {
        this.toastr.warning('กรุณาใส่รูปภาพโลโก้', 'แจ้งเตือนระบบ', { timeOut: 2000 });
        isValid = true;
      }
    }

    if (this.editModel.imageBg != undefined) {
      if (this.editModel.imageBg.length == 0) {
        this.toastr.warning('กรุณาใส่รูปภาพพื้นหลัง', 'แจ้งเตือนระบบ', { timeOut: 2000 });
        isValid = true;
      }
    }

    if (isValid)
      return;

    if (this.editModel.image != undefined) {
      this.editModel.imageLogoUrl = this.editModel.image[0].imageUrl;
    }

    if (this.editModel.imageBg != undefined) {
      this.editModel.imageBgUrl = this.editModel.imageBg[0].imageUrl;
    }

    this.spinner.show();
    this.serviceProviderService.post('aboutUs/update', this.editModel).subscribe(data => {
      let model: any = {}
      model = data;
      if (model.status === 'S') {
        /** spinner ends after 5 seconds */
        this.spinner.hide();
        this.toastr.success('บันทึกข้อมูลสำเร็จ', 'แจ้งเตือนระบบ', { timeOut: 2000 });
        // setTimeout(() => {
        //   this.spinner.show();
        //   window.location.reload();
        // },1000)
      } else {
        this.spinner.hide();
        this.toastr.error(model.message, 'แจ้งเตือนระบบ', { timeOut: 2000 });
      }
    }, err => {
      this.spinner.hide();
      this.toastr.error(err, 'แจ้งเตือนระบบ', { timeOut: 2000 });
    });
  }

}
