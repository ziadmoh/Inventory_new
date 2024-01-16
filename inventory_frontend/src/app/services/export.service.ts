import { Injectable } from "@angular/core";
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx-js-style';

@Injectable({
    providedIn: 'root'
})
export class ExportService {

    constructor() { }

    exportExcel(data,fileName,coloumnNames) {

     const formattedData = data
      const workbook = XLSX.utils.book_new();
      if (!workbook.Workbook) workbook.Workbook = {};
      if (!workbook.Workbook.Views) workbook.Workbook.Views = [];
      if (!workbook.Workbook.Views[0]) workbook.Workbook.Views[0] = {};
      workbook.Workbook.Views[0].RTL = true;
      
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      worksheet['!rightToLeft'] = true;
      
      // Set column widths
      worksheet['!cols'] = [];
      coloumnNames.forEach((columnName, index) => {
      const columnWidth = Math.max(columnName.length, ...formattedData.map(row => row[columnName]?row[columnName].toString().length :15 ));
      worksheet['!cols'][index] = { wch: columnWidth +20}; //columnWidth +20
      worksheet[XLSX.utils.encode_cell({ r: 0, c: index })] = {
          v: columnName,
          t: 's',
          s: { font: { bold: true } }
      };
      });
      
     
    


      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      
      this.saveAsExcelFile(excelBuffer, fileName);

  }

  saveAsExcelFile(buffer: any, fileName: string): void {
      let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      let EXCEL_EXTENSION = '.xlsx';
      const data: Blob = new Blob([buffer], {
          type: EXCEL_TYPE
      });
      saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }


  formatRowsData(data){
   // console.log(data)
    return data.map(obj =>{
      let newObj = {};
      Object.keys(obj).forEach(key => {
         newObj[key] = obj[key];
      });

      Object.entries(newObj).forEach(([key,val]) => {
        let newVal:any = ''
        if(val instanceof Object ){
          if(val == null || val =='null' || val =='null null' || val=='undefined' || Object.keys(val).length == 0){
            newVal = '-'
          }
        }else if(val == null || val =='null' || val =='null null'  || val=='undefined' || val == undefined){
          newVal = '-'
        }else if(val == '0'){
          newVal = 0
        }else{
          newVal = val
        }
        
         newObj[key] = newVal;
         
      });
      return newObj;
    })
  }

}