module.exports = cds.service.impl(async function(){

    // Step - 1 ; Get the object from OATA Service
    let { EmployeeSrv,ProductSrv,POSrv } = this.entities;

    // Generic handler is a built-in mechanism that automatically manages the standard data operations.
    // Out of the box, CAP automatically provisions the generic handlers to serve CRUD(Create, Update, Delete, Read) operations, sorting,
    // pagination, and input validation without requiring you to write any custom backend
    // Event Execution Lifecycle : There are three execution phases : Before, On, After
    // before: Runs a custom logic before the data reaches to the generic handler - this.before() : Defining generic handler
    // for the pre-validations / pre-checks

    // Step - 2 : Perform validation using this.before()
    this.before('UPDATE', EmployeeSrv, (request, response) => {

        console.log("Salary : ", request.data.salaryAmount);
        if(parseFloat(request.data.salaryAmount) >= 100000 && request.data.Currency_code === 'USD') {
            request.error(500, "Please get the approval from your linemanager.");

        }
        if(parseFloat(request.data.salaryAmount) >= 80000 && request.data.Currency_code === 'EUR') {
            request.error(500, "Please get the approval from your linemanager.");
        }
    })

    this.before('UPDATE', ProductSrv, (request,response) =>{
        console.log("Price : ", request.data.PRICE);
        if (parseFloat(request.data.PRICE) >= 1500 && request.data.CURRENCY_CODE === 'EUR') {
        request.error(500, "Please get the approval from your product manager.")
        }
        if (parseFloat(request.data.PRICE) >= 2000 && request.data.CURRENCY_CODE === 'USD') {
        request.error(500, "Please get the approval from your product manager.")
        }
    })

    // on : Run where teh generic handler runs.
    this.on('getTopfiveSalariedEmployees', async(request, response) => {
        try {
            // Step-1 : Creating an object for the transaction
            const transaction = cds.tx(request);

            // Step-2 : Get salaries of an employee using Transaction object
            const response = await transaction.read(EmployeeSrv).orderBy({
                salaryAmount : 'desc'
            }) . limit(5);
            // Step-3 : Display the employee salaries
            return response;
        }catch (error) {
            return " Error: " + error.toString();
        }

    })

    this.on('getTop10Products', async(request, response) => {
        try {
            // Step-1 : Creating an object for the transaction
            const transaction = cds.tx(request);

            // Step-2 : Get salaries of an employee using Transaction object
            const response = await transaction.read(ProductSrv).orderBy({
                PRICE : 'desc'
            }).limit(10);
            // Step-3 : Display the employee salaries
            return response;
        }catch (error) {
            return " Error: " + error.toString();
        }

    })


    this.on('createEmployee', async(request, respone) =>{
        // Getting input data from the serivce
        const dataset = request.data.input;

        // Here, we are inserting a record into EmployeeSrv using cds.tx()
        const transaction = cds.tx(request);

        const returnData = await transaction.run([
            INSERT.into(EmployeeSrv).entries(dataset)
        ]).then((resolve, reject) =>{
            if(typeof(resolve) !== undefined) {
                return request.data.input;
            }else {
                request.error(500, "Error in creating the employee information");
            }
        }).catch(err => {
        request.error(500, "There is an error : " + err.tostring());
        })
        return returnData;
    })

    this.on('discountPrice', async(request, response) =>{
        try{
            // Step-1 : Get parameters(which is your ID) from the entity
            const ID = request.params[0];

            // Step-2 : Create an object for the transaction service using request
            const transaction = cds.tx(request);

            // Step-3 : Update the purchase order service(discount on Gross Amount, Net Amount, Tax Amount)
            await transaction.update(POSrv).with({
                GROSS_AMOUNT : {
                    '-=' : 1000
                },
                NET_AMOUNT : {
                    '-=' : 800
                },
                TAX_AMOUNT : {
                    '-=' : 200
                }
            }).where(ID)

            // Step-4 : Read the purchase order service
            const podata = transaction.read(POSrv).where(ID);

            // Step - 5 : Return the data
            return podata;
        }catch (error) {
            return "Error : "+ error.tostring();
        }
    })


    this.on('largestOrder', async(request, response) =>{
        try {
            const transaction = cds.tx(request);

            const reply = await transaction.read(POSrv).orderBy({
                GROSS_AMOUNT : 'desc'
            }).limit(1);

            return reply;
        } catch (error) {
            return "Error : "+ error.tostring();
        }
    })
    




})