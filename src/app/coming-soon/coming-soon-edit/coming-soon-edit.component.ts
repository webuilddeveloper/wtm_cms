import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FileUploadService } from 'src/app/shared/file-upload.service';
import { ServiceProviderService } from 'src/app/shared/service-provider.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ApiProviderService } from 'src/app/shared/api-provider.service';
import { ValidateService } from 'src/app/shared/validate.service';
import { OrganizationService } from 'src/app/shared/organization.service';
import { PermissionService } from 'src/app/shared/permission.service';
import { ExcelService } from 'src/app/shared/excel.service';

@Component({
  selector: 'app-coming-soon-edit',
  templateUrl: './coming-soon-edit.component.html',
  styleUrls: ['./coming-soon-edit.component.css']
})
export class ComingSoonEditComponent implements OnInit {
  Editor = ClassicEditor;
  listCategory: any = [];
  editModel: any = { fileUrl: '' , file: [],sequence: 10, language: 'th' };
  commentList:any = [];
  commentModel:any;
  hiddenBtnComment: boolean = false;
  hiddenComment: boolean = true;
  momentCriteriaModel:any = {};
  imageFile: string = '';
  code: any;
  title = 'เพิ่มข้อมูลรอการจัดการ';
  organization: any; // <----- Organization เก็บค่า องกรค์
  category: any; // <----- Category เพื่ออ่านสิทธิ์ Organization ของ User ว่าสามารถเห็นระดับไหน
  permission: any; // <----- Permission ส่งเข้า Read เพื่อให้เห็นเฉพาะ Category ที่ถูกเซตไว้กับ Role สรุปคือ (Category Code List)
  permissionList: any; // <----- PermissionList ไว้สำหรับตรวจสอบว่า Category มีสิทธิ์ในการ Create Read Update Read หรือเปล่า
  isSaveSuccess: boolean = false;
  lv0Category: any = []; // <----- Organization
  lv1Category: any = []; // <----- Organization
  lv2Category: any = []; // <----- Organization
  lv3Category: any = []; // <----- Organization
  lv4Category: any = []; // <----- Organization
  isReadOGLv0: boolean; // <----- Organization
  isReadOGLv1: boolean; // <----- Organization
  isReadOGLv2: boolean; // <----- Organization
  isReadOGLv3: boolean; // <----- Organization
  isReadOGLv4: boolean; // <----- Organization

  url: any = {};


  constructor(private apiProviderService: ApiProviderService
    , private validService: ValidateService
    , private organizationService: OrganizationService
    , private permissionService: PermissionService
    , private serviceProviderService: ServiceProviderService
    , private spinner: NgxSpinnerService
    , private excelService: ExcelService
    , private toastr: ToastrService
    , private router: Router
    , private activetedRoute: ActivatedRoute) {

    this.url = {
      create: this.apiProviderService.comingSoon.create,
      read: this.apiProviderService.comingSoon.read,
      update: this.apiProviderService.comingSoon.update,
      delete: this.apiProviderService.comingSoon.delete,
      category: {
        create: this.apiProviderService.comingSoon.category.create,
        read: this.apiProviderService.comingSoon.category.read,
        update: this.apiProviderService.comingSoon.category.update,
        delete: this.apiProviderService.comingSoon.category.delete
      },
      gallery: {
        create: this.apiProviderService.comingSoon.gallery.create,
        read: this.apiProviderService.comingSoon.gallery.read,
        update: this.apiProviderService.comingSoon.gallery.update,
        delete: this.apiProviderService.comingSoon.gallery.delete
      }
    }

  }

  ngOnInit(): void {

    // this.permission = this.permissionService.readPermission('comingSoonPage');
    // this.permissionList = this.permissionService.readLocalStorage('comingSoonPage');
    // this.organization = this.permissionService.readLocalStorage('organization');
    // this.category = this.permissionService.readLocalStorage('category');

    this.activetedRoute.queryParams.subscribe(params => {
      let model: any = this.activetedRoute.snapshot.params;
      this.code = model.code;

      if (this.code != '') {
        this.title = 'แก้ไขข้อมูลรอการจัดการ';
        this.read();
        this.readComment()
      }else{
        this.hiddenBtnComment = true; // ปิดปุ่ม comment ตอน create
      }
    });

  }

  create() {
    let isValid = false;
    if (this.editModel.title == '') {
      this.toastr.warning('กรุณาใส่หัวข้อ', 'แจ้งเตือนระบบ', { timeOut: 2000 });
      isValid = true;
    }

    if (this.editModel.image != undefined)
    {
      if (this.editModel.image.length == 0) {
        this.toastr.warning('กรุณาใส่รูปภาพ', 'แจ้งเตือนระบบ', { timeOut: 2000 });
        isValid = true;
      }
    }

    if (isValid)
      return;

    this.spinner.show();
    this.editModel.imageUrl = this.editModel.image[0].imageUrl;

    //fileUrl create
    if(this.editModel.file != undefined){
      if (this.editModel.file.length > 0)
          this.editModel.fileUrl = this.editModel.file[0].fileUrl;
      else
          this.editModel.fileUrl = '';
    }

    // <----- Organization
    // this.editModel = this.organizationService.filterSelected(this.editModel, this.lv0Category, this.lv1Category, this.lv2Category, this.lv3Category, this.lv4Category);
    // <----- Organization

    this.serviceProviderService.post(this.url.create, this.editModel).subscribe(data => {

      let model: any = {};
      model = data;

      if (this.editModel.gallery.length > 0) {
        this.editModel.gallery.forEach(element => {
          element.reference = model.objectData.code;
          element.imageUrl = element.imageUrl;
          this.serviceProviderService.post(this.url.gallery.create, element).subscribe(data => { }, err => { });
        });
      }
      this.isSaveSuccess = true;
      this.spinner.hide();
      this.toastr.success('บันทึกข้อมูลสำเร็จ', 'แจ้งเตือนระบบ', { timeOut: 1000 });

      setTimeout(() => { this.back(); }, 2000);

    }, err => {
      this.toastr.error(err.message, 'แจ้งเตือนระบบ', { timeOut: 1000 });
    });
  }

  read() {
    this.spinner.show();
    this.serviceProviderService.post(this.url.read, { code: this.code, permission: 'all'}).subscribe(data => {
      let model: any = {};
      model = data;
      this.editModel = model.objectData[0];

      // image file
      if (this.editModel.fileUrl != '') {
        let resultArray = this.editModel.fileUrl.split('.');
        let type = resultArray[resultArray.length - 1];
        if (type == 'pdf') {
          this.imageFile = './assets/img/267px-PDF_file_icon.svg.png';
        } else {
          this.imageFile = './assets/img/excel.png';
        }
      }

      // if (this.editModel.categoryList.length > 0)
      //   this.editModel.category = this.editModel.categoryList[0].code;

      // this.readCategory(this.editModel.language);
      this.galleryRead();

      // <----- Organization
      this.editModel.chkManualOG = true; // <----- Organization
      this.editModel.organization = 'manual'; // <----- Organization
      this.isReadOGLv0 = true; // <----- Organization
      this.isReadOGLv1 = true; // <----- Organization
      this.isReadOGLv2 = true; // <----- Organization
      this.isReadOGLv3 = true; // <----- Organization
      this.isReadOGLv4 = true; // <----- Organization
      // -----> Organization

      this.spinner.hide();
    }, err => {
      this.spinner.hide();
      this.toastr.error(err, 'แจ้งเตือนระบบ', { timeOut: 2000 });
    });
  }

  update() {

    if (this.editModel.image != undefined)
      this.editModel.imageUrl = this.editModel.image[0].imageUrl;

    //fileUrl update
    if(this.editModel.file != undefined){
      if (this.editModel.file.length > 0)
      this.editModel.fileUrl = this.editModel.file[0].fileUrl;
      else
      this.editModel.fileUrl = '';
    }

    // <----- Organization
    this.editModel = this.organizationService.filterSelected(this.editModel, this.lv0Category, this.lv1Category, this.lv2Category, this.lv3Category, this.lv4Category);
    // <----- Organization

    this.spinner.show();
    this.serviceProviderService.post(this.url.update, this.editModel).subscribe(data => {

      this.serviceProviderService.post(this.url.gallery.delete, this.editModel).subscribe(data => {
        if (this.editModel.gallery.length > 0) {
          this.editModel.gallery.forEach(element => {
            // element.code = this.editModel.code; //เพิ่ม set active false ทั้วหมด
            element.reference = this.editModel.code;
            element.imageUrl = element.imageUrl;
            this.serviceProviderService.post(this.url.gallery.create, element).subscribe(data => { }, err => { });
          });
        }
      }, err => { });

      this.isSaveSuccess = true;
      this.spinner.hide();
      this.toastr.success('บันทึกข้อมูลสำเร็จ', 'แจ้งเตือนระบบ', { timeOut: 2000 });

      setTimeout(() => {
        this.back();
      }, 2000);

    }, err => {
      this.toastr.error(err, 'แจ้งเตือนระบบ', { timeOut: 2000 });
    });
  }

  // readCategory(param: string) {
  //   this.editModel.language = param;
  //   if (this.editModel.language != '') {
  //     this.serviceProviderService.post('comingSoon/category/read', { language: param, permission: this.permission }).subscribe(data => {
  //       let model: any = {};
  //       model = data;
  //       this.listCategory = [];
  //       model.objectData.forEach(element => {
  //         this.listCategory.push({ value: element.code, display: element.title });
  //       });
  //     }, err => { });
  //   }
  // }

  readComment() {
      this.serviceProviderService.post('comingSoon/comment/read', { code: this.code }).subscribe(data => {
        let model: any = {};
        model = data;
        this.commentList = model.objectData; // <----- Pagination
        this.spinner.hide()
      }, err => {
        this.spinner.hide()
       });
  }

  galleryRead() {
    this.serviceProviderService.post('m/comingSoon/gallery/read', { code: this.editModel.code }).subscribe(data => {
      let model: any = {};
      model = data;
      this.editModel.gallery = model.objectData;
    }, err => { });
  }

  checkSave() {

    if (this.code != '') {
      // <----- Validate title, image, category
      if (this.isValidateComingSoon(this.editModel))
        return;

      this.update()

      // this.checkPermission(this.editModel.category, 'updateAction')
    } else {
      // <----- Validate title, image, category
      if (this.isValidateComingSoon(this.editModel))
        return;

        this.create();

      // this.checkPermission(this.editModel.category, 'createAction')
    }

  }

  isValidateComingSoon(param) {

    let isValid = false;
    if (param.title == '') {
      this.toastr.warning('กรุณาใส่หัวข้อ', 'แจ้งเตือนระบบ', { timeOut: 1000 });
      isValid = true;
    }

    

    if (param.image != undefined)
    {
      if (param.image.length == 0 ) {
        this.toastr.warning('กรุณาใส่รูปภาพ', 'แจ้งเตือนระบบ', { timeOut: 1000 });
        isValid = true;
      }  
    }
    
    // if (param.category == '') {
    //   this.toastr.warning('กรุณาเลือกหมวดหมู่', 'แจ้งเตือนระบบ', { timeOut: 1000 });
    //   isValid = true;
    // }

    return isValid;
  }

  checkPermission(param, param2) {
    // if (param2 == 'createAction') {
    //   let model = this.permissionList.filter(c => c.title == param);
    //   if (model.length > 0 && this.code == '') {
    //     if (model[0].createAction)
    //       this.create();
    //   }
    // }
    // else if (param2 == 'updateAction') {
    //   let model = this.permissionList.filter(c => c.title == param);
    //   if (model.length > 0 && this.code != '') {
    //     if (model[0].updateAction)
    //       this.update();
    //   }
    // }
    // else if (param2 == 'approveAction') {
    //   let model = this.permissionList.filter(c => c.title == param);
    //   if (model.length > 0) {
    //     if (!model[0].approveAction) {
    //       this.editModel.isActive = false;
    //     }

    //     return model[0].approveAction;
    //   }
    // }

  }

  // <----- Organization
  checkOG(param, param2) {

    if (param2 == 'auto') {
      this.editModel.organization = 'auto';
      this.editModel.chkAutoOG = param;
      this.editModel.chkManualOG = false;

      if (!this.editModel.chkAutoOG && !this.editModel.chkManualOG)
        this.editModel.chkAutoOG = true;
    }
    else if (param2 == 'manual') {
      this.editModel.organization = 'manual';
      this.editModel.chkAutoOG = false;
      this.editModel.chkManualOG = param;

      this.lv4Category = [];
      this.lv3Category = [];
      this.lv2Category = [];
      this.lv1Category = [];
      this.lv0Category = [];

      if (!this.editModel.chkAutoOG && !this.editModel.chkManualOG) {
        this.editModel.chkAutoOG = true;
        this.editModel.organization = 'auto';
      }

    }

    this.organization.forEach(og => {
      if (og.lv4 != '') {
        // this.editModel.organization = 'lv4';
        this.serviceProviderService.post('organization/read', { category: 'lv4' }).subscribe(data => {
          let model: any = {};
          model = data;

          let arr: any = [];
          let split = og.lv4.split(',');
          split.forEach(element => {
            let idx = model.objectData.findIndex(item => item.code === element);
            if (idx != -1) {

              let display = '';
              if (this.lv3Category.length > 0)
              {
                let idxy = this.lv3Category.findIndex(item => item.code === model.objectData[idx].lv0);
                if (idxy != -1)
                  display = this.lv3Category[idxy] + ' - ';

              }

              model.objectData[idx].display = display + model.objectData[idx].title;

              let idxx = this.lv4Category.findIndex(item => item.code === model.objectData[idx].code);
              if (idxx == -1)
                this.lv4Category.push(model.objectData[idx]);
              // arr.push({ title: model.objectData[idx].title, display: model.objectData[idx].title, code: model.objectData[idx].code, check: false });
            }
          });

          // this.lv4Category = arr;

          //เช็คเฉพาะตอน edit check ค่ากลับเข้าไป
          
          setTimeout(() => {
            if (this.isReadOGLv4) {
              let lvContent = this.editModel.lv4.split(',');
              lvContent.forEach(element => {
                let idx = this.lv4Category.findIndex(item => item.code === element);
                if (idx != -1) {
                  this.lv4Category[idx].check = true;
                  this.readCategoryByLv(true, 'lv4', this.lv4Category[idx]);
                }
              });
              this.isReadOGLv4 = false;
            }
          }, 2500);

          this.spinner.hide();
        }, err => {
          this.spinner.hide();
          this.toastr.error(err.message, 'แจ้งเตือนระบบ', { timeOut: 1000 });
        });
      }
      else if (og.lv3 != '') {
        // this.editModel.organization = 'lv3';
        this.serviceProviderService.post('organization/read', { category: 'lv3' }).subscribe(data => {
          let model: any = {};
          model = data;

          let arr: any = [];
          let split = og.lv3.split(',');
          split.forEach(element => {
            let idx = model.objectData.findIndex(item => item.code === element);
            if (idx != -1) {

              let display = '';
              if (this.lv2Category.length > 0)
              {
                let idxy = this.lv2Category.findIndex(item => item.code === model.objectData[idx].lv0);
                if (idxy != -1)
                  display = this.lv2Category[idxy] + ' - ';

              }

              model.objectData[idx].display = display + model.objectData[idx].title;

              let idxx = this.lv3Category.findIndex(item => item.code === model.objectData[idx].code);
              if (idxx == -1)
                this.lv3Category.push(model.objectData[idx]);
              // arr.push({ title: model.objectData[idx].title, display: model.objectData[idx].title, code: model.objectData[idx].code, check: false });
            }
          });


          //เช็คเฉพาะตอน edit check ค่ากลับเข้าไป
          
          setTimeout(() => {
            if (this.isReadOGLv3) {
              let lvContent = this.editModel.lv3.split(',');
              lvContent.forEach(element => {
                let idx = this.lv3Category.findIndex(item => item.code === element);
                if (idx != -1) {
                  this.lv3Category[idx].check = true;
                  this.readCategoryByLv(true, 'lv3', this.lv3Category[idx]);
                }
              });
              this.isReadOGLv3 = false;
            }
          }, 2000);

          this.spinner.hide();
        }, err => {
          this.spinner.hide();
          this.toastr.error(err.message, 'แจ้งเตือนระบบ', { timeOut: 1000 });
        });
      }
      else if (og.lv2 != '') {
        // this.editModel.organization = 'lv2';
        this.serviceProviderService.post('organization/read', { category: 'lv2' }).subscribe(data => {
          let model: any = {};
          model = data;

          let arr: any = [];
          let split = og.lv2.split(',');
          split.forEach(element => {
            let idx = model.objectData.findIndex(item => item.code === element);
            if (idx != -1) {

              let display = '';
              if (this.lv1Category.length > 0)
              {
                let idxy = this.lv1Category.findIndex(item => item.code === model.objectData[idx].lv0);
                if (idxy != -1)
                  display = this.lv1Category[idxy] + ' - ';

              }

              model.objectData[idx].display = display + model.objectData[idx].title;

              let idxx = this.lv2Category.findIndex(item => item.code === model.objectData[idx].code);
              if (idxx == -1)
                this.lv2Category.push(model.objectData[idx]);
              // arr.push({ title: model.objectData[idx].title, display: model.objectData[idx].title, code: model.objectData[idx].code, check: false });
            }
          });

          // this.lv2Category = arr;

          //เช็คเฉพาะตอน edit check ค่ากลับเข้าไป
          
          setTimeout(() => {
            if (this.isReadOGLv2) {
              let lvContent = this.editModel.lv2.split(',');
              lvContent.forEach(element => {
                let idx = this.lv2Category.findIndex(item => item.code === element);
                if (idx != -1) {
                  this.lv2Category[idx].check = true;
                  this.readCategoryByLv(true, 'lv2', this.lv2Category[idx]);
                }
              });
              this.isReadOGLv2 = false;
            }
          }, 1500);

          this.spinner.hide();
        }, err => {
          this.spinner.hide();
          this.toastr.error(err.message, 'แจ้งเตือนระบบ', { timeOut: 1000 });
        });
      }
      else if (og.lv1 != '') {
        // this.editModel.organization = 'lv1';
        this.serviceProviderService.post('organization/read', { category: 'lv1' }).subscribe(data => {
          let model: any = {};
          model = data;

          let arr: any = [];
          let split = og.lv1.split(',');
          split.forEach(element => {
            let idx = model.objectData.findIndex(item => item.code === element);
            if (idx != -1) {

              let display = '';
              if (this.lv0Category.length > 0)
              {
                let idxy = this.lv0Category.findIndex(item => item.code === model.objectData[idx].lv0);
                if (idxy != -1)
                  display = this.lv0Category[idxy] + ' - ';

              }

              model.objectData[idx].display = display + model.objectData[idx].title;

              let idxx = this.lv1Category.findIndex(item => item.code === model.objectData[idx].code);
              if (idxx == -1)
                this.lv1Category.push(model.objectData[idx]);
              // arr.push({ title: model.objectData[idx].title, display: model.objectData[idx].title, code: model.objectData[idx].code, check: false });
            }
          });

          // this.lv1Category = arr;

          //เช็คเฉพาะตอน edit check ค่ากลับเข้าไป
          
          setTimeout(() => {
            if (this.isReadOGLv1) {
              let lvContent = this.editModel.lv1.split(',');
              lvContent.forEach(element => {
                let idx = this.lv1Category.findIndex(item => item.code === element);
                if (idx != -1) {
                  this.lv1Category[idx].check = true;
                  this.readCategoryByLv(true, 'lv1', this.lv1Category[idx]);
                }
              });
              this.isReadOGLv1 = false;
            }
          }, 1000);

          this.spinner.hide();
        }, err => {
          this.spinner.hide();
          this.toastr.error(err.message, 'แจ้งเตือนระบบ', { timeOut: 1000 });
        });
      }
      else if (og.lv0 != '') {
        // this.editModel.organization = 'lv0';
        this.serviceProviderService.post('organization/read', { category: 'lv0' }).subscribe(data => {
          let model: any = {};
          model = data;

          // let arr: any = [];
          let split = og.lv0.split(',');
          split.forEach(element => {
            let idx = model.objectData.findIndex(item => item.code === element);
            if (idx != -1) {
              model.objectData[idx].display = model.objectData[idx].title;

              let idxx = this.lv0Category.findIndex(item => item.code === model.objectData[idx].code);
              if (idxx == -1)
                this.lv0Category.push(model.objectData[idx]);
              // arr.push({ title: model.objectData[idx].title, display: model.objectData[idx].title, code: model.objectData[idx].code, check: false });
            }
          });

          // this.lv0Category = arr;

          //เช็คเฉพาะตอน edit check ค่ากลับเข้าไป
          
          setTimeout(() => {
            if (this.isReadOGLv0) {
              let lvContent = this.editModel.lv0.split(',');
              lvContent.forEach(element => {
                let idx = this.lv0Category.findIndex(item => item.code === element);
                if (idx != -1) {
                  this.lv0Category[idx].check = true;
                  this.readCategoryByLv(true, 'lv0', this.lv0Category[idx]);
                }
              });
              this.isReadOGLv0 = false;
            }
          }, 500);

          this.spinner.hide();
        }, err => {
          this.spinner.hide();
          this.toastr.error(err.message, 'แจ้งเตือนระบบ', { timeOut: 1000 });
        });
      }
    });


  }

  readCategoryByLv(param, lv, param2) {

    // หน่วยงาน
    if (lv == 'lv0') {

      param2.check = param;

      if (param2.check) {

        // เอาค่าใส่ให้ใหม่ทุกครั้งที่ติ๊ก
        // let chk = this.lv0Category.filter(c => c.check);
        // for (let index = 0; index < chk.length; index++) {
        //   if (index == 0)
        //     this.editModel.lv0 = chk[index].code;
        //   else
        //     this.editModel.lv0 = this.editModel.lv0 + ',' + chk[index].code;
        // }

        this.serviceProviderService.postByPass('organization/category/read', { category: 'lv1', lv0: param2.code }).subscribe(data => {
          let model: any = {};
          model = data;

          model.objectData.forEach(element => {
            let idx = this.lv1Category.findIndex(item => item.code === element.code);
            if (idx == -1) {
              element.display = param2.title + ' - ' + element.title;
              this.lv1Category.push(element);
            }
          });

          //เช็คเฉพาะตอน edit check ค่ากลับเข้าไป
          setTimeout(() => {
            if (this.isReadOGLv1) {
              let lvContent = this.editModel.lv1.split(',');
              lvContent.forEach(element => {
                let idx = this.lv1Category.findIndex(item => item.code === element);
                if (idx != -1) {
                  this.lv1Category[idx].check = true;
                  this.readCategoryByLv(true, 'lv1', this.lv1Category[idx]);
                }
              });
              this.isReadOGLv1 = false;
            }
          }, 500);

        }, err => { });
      }
      else {

        for (let index = 0; index < 20; index++) {
          let idx = this.lv1Category.findIndex(item => item.lv0 === param2.code);
          if (idx != -1) {
            this.lv1Category.splice(idx, 1);
          }
        }

        for (let index = 0; index < 20; index++) {
          let idx = this.lv2Category.findIndex(item => item.lv0 === param2.code);
          if (idx != -1) {
            this.lv2Category.splice(idx, 1);
          }
        }

        for (let index = 0; index < 20; index++) {
          let idx = this.lv3Category.findIndex(item => item.lv0 === param2.code);
          if (idx != -1) {
            this.lv3Category.splice(idx, 1);
          }
        }

        for (let index = 0; index < 20; index++) {
          let idx = this.lv4Category.findIndex(item => item.lv0 === param2.code);
          if (idx != -1) {
            this.lv4Category.splice(idx, 1);
          }
        }

      }

    }

    // เขต
    else if (lv == 'lv1') {

      param2.check = param;

      if (param2.check) {

        this.serviceProviderService.postByPass('organization/category/read', { category: 'lv2', lv1: param2.code }).subscribe(data => {
          let model: any = {};
          model = data;

          model.objectData.forEach(element => {
            let idx = this.lv2Category.findIndex(item => item.code === element.code);
            if (idx == -1) {
              element.display = param2.title + ' - ' + element.title;
              this.lv2Category.push(element);
            }
          });

          //เช็คเฉพาะตอน edit check ค่ากลับเข้าไป
          setTimeout(() => {
            if (this.isReadOGLv2) {
              let lvContent = this.editModel.lv2.split(',');
              lvContent.forEach(element => {
                let idx = this.lv2Category.findIndex(item => item.code === element);
                if (idx != -1) {
                  this.lv2Category[idx].check = true;
                  this.readCategoryByLv(true, 'lv2', this.lv2Category[idx]);
                }
              });
              this.isReadOGLv2 = false;
            }
          }, 500);

        }, err => { });
      }
      else {

        for (let index = 0; index < 20; index++) {
          let idx = this.lv2Category.findIndex(item => item.lv1 === param2.code);
          if (idx != -1) {
            this.lv2Category.splice(idx, 1);
          }
        }

        for (let index = 0; index < 20; index++) {
          let idx = this.lv3Category.findIndex(item => item.lv1 === param2.code);
          if (idx != -1) {
            this.lv3Category.splice(idx, 1);
          }
        }

        for (let index = 0; index < 20; index++) {
          let idx = this.lv4Category.findIndex(item => item.lv1 === param2.code);
          if (idx != -1) {
            this.lv4Category.splice(idx, 1);
          }
        }

      }

    }

    // จังหวัด
    else if (lv == 'lv2') {
      param2.check = param;

      if (param2.check) {
        this.serviceProviderService.postByPass('organization/category/read', { category: 'lv3', lv2: param2.code }).subscribe(data => {
          let model: any = {};
          model = data;

          model.objectData.forEach(element => {
            let idx = this.lv3Category.findIndex(item => item.code === element.code);
            if (idx == -1) {
              element.display = param2.title + ' - ' + element.title;
              this.lv3Category.push(element);
            }
          });

          //เช็คเฉพาะตอน edit check ค่ากลับเข้าไป
          setTimeout(() => {
            if (this.isReadOGLv3) {
              let lvContent = this.editModel.lv3.split(',');
              lvContent.forEach(element => {
                let idx = this.lv3Category.findIndex(item => item.code === element);
                if (idx != -1) {
                  this.lv3Category[idx].check = true;
                  this.readCategoryByLv(true, 'lv3', this.lv3Category[idx]);
                }
              });
              this.isReadOGLv3 = false;
            }
          }, 500);

        }, err => { });
      }
      else {
        for (let index = 0; index < 20; index++) {
          let idx = this.lv3Category.findIndex(item => item.lv2 === param2.code);
          if (idx != -1) {
            this.lv3Category.splice(idx, 1);
          }
        }

        for (let index = 0; index < 20; index++) {
          let idx = this.lv4Category.findIndex(item => item.lv2 === param2.code);
          if (idx != -1) {
            this.lv4Category.splice(idx, 1);
          }
        }
      }

    }

    // อำเภอ/เขต
    else if (lv == 'lv3') {
      param2.check = param;

      if (param2.check) {

        this.serviceProviderService.postByPass('organization/category/read', { category: 'lv4', lv3: param2.code }).subscribe(data => {
          let model: any = {};
          model = data;

          model.objectData.forEach(element => {
            let idx = this.lv4Category.findIndex(item => item.code === element.code);
            if (idx == -1) {
              element.display = param2.title + ' - ' + element.title;
              this.lv4Category.push(element);
            }
          });

          //เช็คเฉพาะตอน edit check ค่ากลับเข้าไป
          setTimeout(() => {
            if (this.isReadOGLv4) {
              let lvContent = this.editModel.lv4.split(',');
              lvContent.forEach(element => {
                let idx = this.lv4Category.findIndex(item => item.code === element);
                if (idx != -1) {
                  this.lv4Category[idx].check = true;
                  this.readCategoryByLv(true, 'lv4', this.lv4Category[idx]);
                }
              });
              this.isReadOGLv3 = false;
            }
          }, 500);

        }, err => { });
      }
      else {
        for (let index = 0; index < 20; index++) {
          let idx = this.lv4Category.findIndex(item => item.lv3 === param2.code);
          if (idx != -1) {
            this.lv4Category.splice(idx, 1);
          }
        }
      }

    }

    // ตำบล/แขวง
    else if (lv == 'lv4') {
      param2.check = param;
    }

  }
  // -----> Organization

  manageComment(param) {
    param.isActive = param.isActive = !param.isActive
    this.spinner.show()
    console.log('param -------- ',param);
    this.serviceProviderService.post('comingSoon/comment/update', param).subscribe(data => {
      let model: any = {};
      model = data;

      this.spinner.hide()
      if(model.status === 'E'){
        this.spinner.hide()
        this.toastr.warning('เกิดข้อผิดพลาดกรุณาลองอีกครั้ง', 'แจ้งเตือนระบบ', { timeOut: 500 });
        setTimeout(() => {
          this.readComment()
        }, 500);
      }
    }, error => {
      this.spinner.hide()
      this.toastr.warning('เกิดข้อผิดพลาดกรุณาลองอีกครั้ง', 'แจ้งเตือนระบบ', { timeOut: 500 });
      setTimeout(() => {
        this.readComment()
      }, 500);
    })
  }

  verifyComment(param) {
    this.spinner.show()
    this.serviceProviderService.post('comingSoon/comment/verify', param).subscribe(data => {
      let model: any = {};
      model = data;

      if(model.status === 'E'){
        this.spinner.hide()
        this.toastr.warning('เกิดข้อผิดพลาดกรุณาลองอีกครั้ง', 'แจ้งเตือนระบบ', { timeOut: 500 });
        setTimeout(() => {
          this.readComment()
        }, 500);
      }else{
        this.readComment()
      }
      
    }, error => {
      this.spinner.hide()
      this.toastr.warning('เกิดข้อผิดพลาดกรุณาลองอีกครั้ง', 'แจ้งเตือนระบบ', { timeOut: 500 });
      setTimeout(() => {
        this.readComment()
      }, 500);
    })
  }

  exportAsXLSX(): void {
    this.serviceProviderService.post('comingSoon/comment/read', { skip: 0, limit: 999999, code:this.code }).subscribe(data => {
      let model: any = {};
      let result: any = []; 
      model = data;
      // this.data = model.objectData; // <----- Pagination
      model.objectData.forEach((e, index) => {

        if(e.isActive){
          e.textStatus = 'อนุญาตให้แสดงความคิดเห็น'
        }else{
          e.textStatus = 'ไม่อนุญาตให้แสดงความคิดเห็น'
        }

        result.push({
          'ลำดับ': index + 1,
          'ความคิดเห็น': e.description,
          'ชื่อผู้ใช้': e.createBy,
          'วันที่': e.createDate,
          'สถานะ': e.textStatus,
        })
      });

      this.excelService.exportAsExcelFile(result, 'รายงาน ความคิดเห็น');
    }, err => {
      this.toastr.error(err.message, 'แจ้งเตือนระบบ', { timeOut: 2000 });
    });
  }

  back() {
    this.router.navigate(['coming-soon'], { skipLocationChange: true });
  }
}
