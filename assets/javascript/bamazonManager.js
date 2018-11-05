//*This is a node application called bamazonCustomer. It allows the user to shop for products and make purchases!

//Define constants for node modules.
const   mysql = require("mysql"),
        fs = require("fs"),
        inquire = require("inquirer")

var itemArray = []

//Setup connection to MYSQL
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon_DB"
})
    
connection.connect(function(err) {

    if (err) throw err
    console.log("\nconnected as id " + connection.threadId + "\n")
    console.log("\nWelcome to the bAmazon Manager\'s Office.\n")

    management()
});



function management() {

    inquire.prompt([
        {
            type: "list",
            name: "managerPrompt",
            message: "What would you like to do manager?",
            choices: ["Show me the current product lineup.", "Show me the low inventory.", "Order new inventory.", "Add products to lineup.", "End management session."]
            
        }
    ]).then( function(response) {

        console.log("\n")

        switch(response.managerPrompt) {

            case "Show me the current product lineup.":
                displayProducts()
                break

            case "Show me the low inventory.":
                lowInventory()
                break

            case "Order new inventory.":
                newInventory()
                break

            case "Add products to lineup.":
                newProduct()
                break

            case "End management session.":
                connection.end()
                break
        }
    })
}

function itemArrayBuilder(data) {

    itemArray = []

    for ( let i=0; i<data.length; i++ ) {

        var itemID = data[i].item_id,
            productName = data[i].product_name,
            departmentName = data[i].department_name,
            price = data[i].price,
            quantity = data[i].quantity,
            product = {
                id: itemID,
                name: productName,
                dept: departmentName,
                price: price,
                quantity: quantity
            }

        itemArray.push(product)
        console.log("ID: ", itemID)
        console.log("Product: ", productName)
        console.log("Department: ", departmentName)
        console.log("Price: $" + price)
        console.log("Quanitity Available: ", quantity, "\n")
    }
} 


function displayProducts() {

    connection.query("SELECT * FROM products", function(err, data) {
        if (err) throw err
        
        itemArrayBuilder(data)

        management()
        
        
    })
}

function lowInventory() {

    connection.query("SELECT * FROM products", function(err, data) {
        if (err) throw err

        console.log("Here is your low inventory. Consider submitting a replenishment order.\n")
        for ( let i=0; i<data.length; i++ ) {

            if ( data[i].quantity <=5 ) {

                var itemID = data[i].item_id,
                    productName = data[i].product_name,
                    departmentName = data[i].department_name,
                    price = data[i].price,
                    quantity = data[i].quantity

                console.log("ID: ", itemID)
                console.log("Product: ", productName)
                console.log("Department: ", departmentName)
                console.log("Price: $" + price)
                console.log("Quanitity Available: ", quantity, "\n")

            } 
        }

        inquire.prompt([
            {
                type: "confirm",
                name: "lowInventoryOrder",
                message: "Would you like to order more inventory now?"
            }
        ]).then( function(response) {

            console.log("\n")

            if ( response.lowInventoryOrder ) {
                newInventory()
            } else management()
        })
    })
}

function newInventory() {

    if ( itemArray[0] === undefined) {
        connection.query("SELECT * FROM products", function(err, data) {
            if (err) throw err
            
            itemArrayBuilder(data)     
        })
    } 

    setTimeout( function() {    

        console.log("\n")

        inquire.prompt([
            {
                type: "list",
                name: "productUpdate",
                message: "Select a product to update",
                choices: itemArray
            },
            {
                type: "input",
                name: "newQuantity",
                message: "How many units would you like to order?"
            }
        ]).then(function(response) {
            
            for (let k=0; k<itemArray.length; k++) {
                if (itemArray[k].name === response.productUpdate) {
                    var getIndex = k
                }
            }
    
            var quantityUpdate = parseInt(itemArray[getIndex].quantity) + parseInt(response.newQuantity)

            connection.query(
                        
                "UPDATE products SET ? WHERE ?",
        
                [
                    {
                        quantity: quantityUpdate
                    },
                    {
                        product_name: response.productUpdate
                    }
                ],
        
                function(err, res) {
        
                    console.log("\n Another " + response.newQuantity + " unit(s) of " + response.productUpdate + " were ordered.\n")
                    
                    management()
                }
            )
        }) 
    },500)
    
}

function newProduct() { 

    console.log("\n")

    inquire.prompt([
        {
            type: "input",
            name: "newProductName",
            message: "What is the name of the new product?"
        },
        {
            type: "list",
            name: "newProductDept",
            message: "Which department will sell it?",
            choices: ["Home", "Electronics", "Clothing"]
        },
        {
            type: "input",
            name: "newProductPrice",
            message: "How much will it retail for? (Enter price as decimal to two places)"
        },
        {
            type: "input",
            name: "newProductQuantity",
            message: "How many units will we stock initially? (Must be a number)"
        }
    ]).then(function(response) {

        connection.query(
                    
            "INSERT INTO products SET ?",
    
            [
                {
                    product_name: response.newProductName,
                    department_name: response.newProductDept,
                    price: response.newProductPrice,
                    quantity: response.newProductQuantity
                }
            ],
    
            function(err, res) {
    
                console.log("\n A new product was added to the store\'s product lineup:\n")
                console.log("Name: ", response.newProductName)
                console.log("Department: ", response.newProductDept)
                console.log("Price: $", response.newProductPrice)
                console.log("Initial Quantity: ", response.newProductQuantity, "\n")
                
                management()
            }
        )
    }) 
    
}
