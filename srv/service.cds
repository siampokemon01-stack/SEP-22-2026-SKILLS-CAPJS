using { purchaseorders.db as db } from '../db/schema';
using { purchaseorders.common as common  } from '../db/common';


type createEmployeeInput : array of {
    Currency_code : String;
    ID : UUID;
    accountNumber : String;
    bandId : String;
    bankName : String;
    email : common.Email;
    gender : common.Gender;
    language : String;
    loginName : String;
    nameFirst : String;
    nameInitials : String;
    nameLast : String;
    nameMiddle : String;
    phoneNumber : common.PhoneNumber;
    salaryAmount : common.AmountT;
}

service CatalogService{
    //@insertonly
    entity ProductSrv as projection on db.master.Products;

    entity BPSrv as projection on db.master.BusinessPartners;

    //@readonly
    /*@Capabilities : { 
        InsertRestrictions.Insertable : false ,
        ReadRestrictions.Readable : false ,
        UpdateRestrictions.Updatable : true ,
        DeleteRestrictions.Deletable : true
     }*/
    entity EmployeeSrv as projection on db.master.Employees;

    entity AddressSrv as projection on db.master.Addresses;

    entity POSrv as projection on db.transaction.PurchaseOrders{
        *,
        case OVERALL_STATUS
            when 'N' then 'New'
            when 'P' then 'Paid'
            when 'X' then 'Not Paid'
            when 'C' then 'Cancelled'
            else 'Completed'
        end as OST : String(15) @(title: '{i18n>OVERALL_STATUS}'),

        case LIFECYCLE_STATUS
            when 'N' then 'Not Started'
            when 'S' then 'Started'
            when 'D' then 'Delivered'
            when 'R' then 'Returned'
            else 'Done'
        end as LST : String(15) @(title: '{i18n>LIFECYCLE_STATUS}'),

        case OVERALL_STATUS
            when 'N' then 3
            when 'P' then 2
            when 'X' then 1
            when 'C' then 1
            else 3
        end as OSC : Integer,

        case LIFECYCLE_STATUS
            when 'N' then 1
            when 'S' then 2
            when 'D' then 3
            when 'R' then 2
            else 3
        end as LSC : Int16
    }actions{
        action discountPrice() returns array of POSrv;

        function largestOrder() returns array of POSrv;
    };

    entity POItemSrv as projection on db.transaction.PurchaseItems;

    // Function is a light-weight component.
    // Declaration of your function - function <function_name>() returns <return-parame:
    function getTopfiveSalariedEmployees() returns array of EmployeeSrv;

    function getTop10Products() returns array of ProductSrv;

    action createEmployee(
        input : createEmployeeInput
    ) returns array of EmployeeSrv;
    
}

