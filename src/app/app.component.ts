import { ElementRef } from '@angular/core';
import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';

import { TextSelectEvent } from "./text-select.directive";

interface SelectionRectangle {
  left: number;
  top: number;
  width: number;
  height: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  @ViewChild('messageEl') messageElement: ElementRef;

  dateFormat = 'DD/MM/YYYY';

  form = new FormGroup({
    instrument: new FormControl(),
    applicant: new FormControl(''),
    issueDate: new FormControl(),
    notes: new FormControl(''),
  });

  controls = [
    {
      name: 'instrument',
      type: 'select'
    },
    {
      name: 'applicant',
      type: 'text'
    },
    {
      name: 'issueDate',
      type: 'date'
    },
    {
      name: 'notes',
      type: 'text'
    }
  ];

  get fields() {
    let fields = [];

    Object.keys(this.form.controls).forEach(key => {
      fields.push(key);
    });

    return fields;
  }
  public hostRectangle: SelectionRectangle | null;
  public viewportRectangle: SelectionRectangle | null;

  private selectedText: string;

  showStyle: boolean = false;

  selections = [];

  private copyToClipboard(item) {
    document.addEventListener('copy', (e: ClipboardEvent) => {
      e.clipboardData.setData('text/plain', (item));
      e.preventDefault();
      document.removeEventListener('copy', null);
    });
    document.execCommand('copy');
  }

  public clickText(event) {
    if (event.target.nodeName == 'MARK') {
      event.target.outerHTML = event.target.innerText;
    }
  }

  wrapSelectedText() {
    var selection = window.getSelection().getRangeAt(0);
    var selectedText = selection.extractContents();
    var span = document.createElement("mark");
    //span.style.backgroundColor = "yellow";
    span.appendChild(selectedText);
    selection.insertNode(span);
  }

  // I render the rectangles emitted by the [textSelect] directive.
  public renderRectangles(event: TextSelectEvent): void {

    console.group("Text Select Event");
    console.log("Text:", event.text);
    console.log("Viewport Rectangle:", event.viewportRectangle);
    console.log("Host Rectangle:", event.hostRectangle);
    console.groupEnd();

    // If a new selection has been created, the viewport and host rectangles will
    // exist. Or, if a selection is being removed, the rectangles will be null.
    if (event.hostRectangle) {
      this.hostRectangle = event.hostRectangle;
      this.viewportRectangle = event.viewportRectangle;
      this.selectedText = event.text;
    } else {
      this.hostRectangle = null;
      this.viewportRectangle = null;
      this.selectedText = "";
    }
  }

  unwrapSelectedText() {
    let element = this.messageElement.nativeElement;
    element.querySelectorAll('mark').forEach((item, i) => {
      item.outerHTML = item.innerText;
    });
  }

  // I share the selected text with friends :)
  public copySelection(field): void {

    console.log(this.selectedText);
    console.log(field);

    let control = this.controls.find(control => control.name === field);

    switch (control.type) {
      case 'select':
        this.form.get(field).patchValue(this.selectedText.toLowerCase());
        break;
      case 'date':
        let day = dayjs(this.selectedText, this.dateFormat).format();
        this.form.get(field).patchValue(day.substr(0, 10));
        break;
      default:
        this.form.get(field).patchValue(this.selectedText);
        break;
    }

    this.wrapSelectedText();

    this.copyToClipboard(this.selectedText);

    console.groupEnd();

    // Now that we've shared the text, let's clear the current selection.
    document.getSelection().removeAllRanges();
    // CAUTION: In modern browsers, the above call triggers a "selectionchange"
    // event, which implicitly calls our renderRectangles() callback. However,
    // in IE, the above call doesn't appear to trigger the "selectionchange"
    // event. As such, we need to remove the host rectangle explicitly.
    this.hostRectangle = null;
    this.selectedText = "";
  }

  constructor() { }

  ngOnInit() {
    dayjs.extend(utc);
    dayjs.extend(customParseFormat);
  }

  public message = `
  EXPORT LC
  GUARANTEE
  SENDER: ARAIEGCXDOC
  RECEIVER: UNCRITMM
  MESSAGE:
  {1:F01UNCRITMMCXXX5869233492}
  {2:O7001443191024ARAIEGCXADOC04688403331910241443N}
  {3:{108:TRADE FINANCE MR}}
  {4:
  :27:1/1
  :40A:IRREVOCABLE
  :20:LC/DOK 70865/19
  :31C:191024
  :40E:UCP LATEST VERSION
  :31D:200421AT YOUR COUNTERS
  :50:EGYPT TRADERS
  35 ADABIYAH, ATTAKA, SUEZ - EGYPT.
  :59:TRUCK BUSSES
  AV. MUNICH NO.101
  COL,1188,046,NLE,C.P. 66450 MEXICO
  :32B:USD652646,
  :41A:UNCRITMMXXX
  BY ACCEPTANCE
  :42A:ARAIEGCXDOC
  :42C:AT SIGHT
  :43P:ALLOWED
  :43T:ALLOWED
  :44E:ANY SEAPORT IN MEXICO
  :44F:ALEXANDRIA SEAPORT,  EGYPT
  :44C:200331
  :45A:SPARE PARTS FOR DRP PLANT
  AS PER THE DETAILED DESCRIPTION MENTIONED IN THE PURCHASE ORDER
  NO. F5574/2019 DATED 08/08/2019 AND BENEFICIARY'S PROFORMA
  INVOICE DATED 19/08/2019
  .
  TERMS OF DELIVERY: CFR ALEXANDRIA SEAPORT- EGYPT  AS PER
  INCOTERMS 2010 .
  :46A:1) BENEFICIARY'S SIGNED COMMERCIAL INVOICE IN 3 ORIGINALS AND
     3 PHOTOCOPIES,
  + SHOWING DESCRIPTION OF GOODS AS PER THE DETAILED
  DESCRIPTION MENTIONED IN PURCHASE ORDER NO.
  F5574/2019 DATED 08/08/2019 AND BENEFICIARY'S PROFORMA
  INVOICE DATED 19/08/2019
  + SHOWING ITEMIZED PRICES AND THE TOTAL VALUE OF GOODS
  SHIPPED
  + ONE ORIGINAL MUST BE COUNTERSIGNED BY CHAMBER OF COMMERCE.
  2) 3/3 ORIGINALS + 3 NON NEGOTIABLE PHOTOCOPIES OF CLEAN ON
  BOARD BILLS OF LADING ISSUED TO THE ORDER OF ARAB AFRICAN
     INTERNATIONAL BANK ,SHOWING NOTIFY APPLICANT (NAME AND
     ADDRESS AS PER FIELD 50) AND MARKED FREIGHT PREPAID.
  3)
  PACKING LIST IN 2 ORIGINALS + 4 PHOTOCOPIES , ISSUED BY
  BENEFICIARY
  SHOWING THE QUANTITIES AND TOTAL NET / GROSS
  WEIGHT AND
  DIMENSIONS.
  4)
  WARRANTY CERTIFICATE IN 1 ORIGINAL + 2 PHOTOCOPIES, ISSUED
  BY BENEFICIARY VALID FOR 12 MONTHS FROM THE LAST DATE OF
  SHIPMENT AND STATING THAT THE DEFECTIVE COMMODITIES DUE TO
  BAD
  WORKMANSHIP OR FAULTY MATERIALS OCCURRED BEFORE SHIPMENT
  WILL BE REPAIRED AND/OR REPLACED FREE OF CHARGE UP TO THE
  SITE OF WORK IN SUEZ AS PER PURCHASE ORDER NO. F5574/2019
  5)
  FUMIGATION CERTIFICATE ISSUED BY BENEFICIARY IN ONE ORIGINAL
  STATING THAT ALL WOODEN PALLETS OR BOXES MUST BEAR A STAMP
  CONFIRMATION THAT THEY HAVE PASSED FUMIGATION PROCESS BEFORE
  SHIPMENT BASED ON THE INTERNATIONAL STANDARD OF IPPC CALLED
  ISPM NO.15 OF THE FAO GUIDELINES FOR REGULATION WOOD
  PACKAGING MATERIAL IN "INTERNATIONAL TRADE".
  6)
  CERTIFICATE OF ORIGIN IN 1 ORIGINAL, ISSUED BY CHAMBER
  OF COMMERCE IN THE COUNTRY OF BENEFICIARY SHOWING THE
  FOLLOWING:
  - NAME OF THE FACTORY OR MANUFACTURER OR SELLER.
  - THE CONSIGNEE AS "
  EGYPT TRADERS
  ".
  - THE COUNTRY OF ORIGIN.
  - THE TOTAL NET AND GROSS WEIGHT.
  7)
  INSPECTION CERTIFICATE IN 1 ORIGINAL ISSUED BY BENEFICIARY
  STATING
  THE COMMODITIES HAVE BEEN PASSED THE TECHNICAL
  INSPECTION TESTS
  BEFORE SHIPPING.
  8)
  BENEFICIARY CERTIFICATE IN 1 ORIGINAL + 1 COPY ,STATING THAT
  THEY HAVE SENT THE FOLLOWING DOCUMENTS DIRECTLY TO
  EGYPT
  TRADERS
   S.A.E , 35 ADABIYAH, ATTAKA, SUEZ, EGYPT WITHIN 10
  WORKING
  DAYS FROM B/L DATE BY ANY COURIER SERVICES OR BY
  E-
  MAIL:
  F-
  1 PHOTOCOPY OF COMMERCIAL INVOICE
  G-
  1 PHOTOCOPY OF B/L
  H-
  1 PHOTOCOPY OF PACKING LIST
  I-
  1 PHOTOCOPY OF CERTIFICATE OF ORIGIN
  J-
  1 PHOTOCOPY OF WARRANTY CERTIFICATE
  K-
  1 PHOTOCOPY OF FUMIGATION CERTIFICATE
  L-
  1 PHOTOCOPY OF INSPECTION CERTIFICATE
  9) SHIPPING COMPANY CERTIFICATE IN 1 ORIGINAL, ISSUED BY CARRIER
  OR ITS AGENT STATING THAT:
  - VESSAL AGE NOT EXCEED 25 YEARS OLD
  - SHIPMENT HAVE BEEN EFFECTED ON A CLASSIFIED REGULAR LINE'S
  VESSAL.
  :47A:1) ALL DOCUMENTS TO BE FORWARDED DIRECTLY TO US IN (TWO
     LOTS)BY EXPRESS COURIER SERVICES TO OUR ADDRESS AT:
     ARAB AFRICAN INTERNATIONAL BANK
     44 ABDEL KHALEK SARWAT ST., CAIRO-EGYPT
     ATTN: TRADE FINANCE CENTER
  2) ALL DOCUMENTS MUST INDICATE THIS L/C NO.
  3) ALL DOCUMENTS MUST BE DATED.
  4) ALL DOCUMENTS MUST BE ISSUED IN ENGLISH LANGUAGE EXCEPT
     PREPRINTED FORMS AND STAMPS ISSUED IN OTHER LANGUAGE IS
     ACCEPTABLE.
  5) ALL DOCUMENTS MUST BE DULY SIGNED AND STAMPED FACSIMILE
     SIGNATURE ARE ACCEPTABLE.
  6) DOCUMENTS BEARING A DATE OF ISSUE PRIOR TO THAT OF LETTER OF
     CREDIT ARE NOT ACCEPTABLE .
  7) DISCREPANCY FEES FOR USD 150.- WILL BE DEDUCTED FROM THE
     PROCEEDS OF EACH SET OF DOCUMENTS WITH DISCREPANCY(S).
  8) CONFIRMING THIS L/C IS SUBJECT TO BENEFICIARY'S REQUEST,
     AND PROVIDED THAT YOUR CONFIRMATION COMMISSION IS PREPAID BY
     THEM IN ADVANCE.
  9) 1 SET OF PHOTOCOPY OF ALL RELEVANT DOCS MUST BE ATTACHED FOR
     OUR FILES ( FREE OF CHARGES ).
  10)PLS CREDIT OUR USD ACCOUNT HELD WITH (IRVTUS3N) FOR
     USD 9,899.69 BEING OUR ISSUANCE COMM. UNDER SWIFT ADVICE TO
     US.
  :71D:ALL COMMISSIONS AND CHARGES
  INSIDE AND OUTSIDE EGYPT INCLUDING
  CONFIRMATION COMMISSIONS AND
  REIMBURSEMENT CHARGES ARE FOR
  A/C OF BENEFICIARY.
  :48:21
  :49:CONFIRM
  :78:UPON OUR RECEIPT OF YOUR AUTHENTICATED SWIFT MSG CLAIM,
  CERTIFYING THAT YOU HAVE TAKEN UP AND DISPATCHED TO US ON SAME
  DAY DOCUMENTS WHICH CONSTITUTE A COMPLYING PRESENTATION AND
  STATING COURIER RECEIPT NO. AND DATE.
  WE HEREBY UNDERTAKE TO REMIT YOU VALUE OF SAME LESS USD 125,-
  BEING OUR  REIMBURSEMENT AND SWIFT CHARGES VALUE FIVE BANKING
  DAYS EXCLUDING FRIDAYS AFTER RECEIPT OF SAID SWIFT MESSAGE.
  :57A:/IT 29 W 02008 09440 000500085705
  UNCRITMMMCN
  :72Z:KINDLY ACKNOWLEDGE RECEIPT
  MENTIONING YOUR REF. NUMUBER
  -}
  {5:{CHK:50F775BD865D}}
  `;
}
