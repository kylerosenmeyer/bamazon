//*This is a node application called bamazonCustomer. It allows the user to shop for products and make purchases!

//Define constants for node modules.
const   mysql = require("mysql"),
        fs = require("fs"),
        inquire = require("inquirer")

var itemArray = [],
    checkout = []


//Setup connection to MYSQL
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon_DB"
})

//Establish the connection with the server and run displayProducts()
connection.connect(function(err) {

    if (err) throw err

    console.log("\nconnected as id " + connection.threadId + "\n")
    console.log("Welcome to bAmazon! Shop our amazing products below.\n")

    displayProducts()
})

//displayProducts() is the function that prints all the current products to the page.
//This is the first function in the user experience. It calls goShopping() at it's completion.
function displayProducts() {

    checkout = []
    itemArray = []

    connection.query("SELECT * FROM products", function(err, data) {
        if (err) throw err
        
        for ( let i=0; i<data.length; i++ ) {

            var itemID = data[i].item_id,
                productName = data[i].product_name,
                departmentName = data[i].department_name,
                price = data[i].price,
                quantity = data[i].quantity,
                productSales = data[i].product_sales
                product = {
                    id: itemID,
                    name: productName,
                    dept: departmentName,
                    price: price,
                    quantity: quantity,
                    sales: productSales
                }

            itemArray.push(product)
            console.log("ID: ", itemID)
            console.log("Product: ", productName)
            console.log("Department: ", departmentName)
            console.log("Price: $" + price)
            console.log("Quanitity Available: ", quantity, "\n")
        }
        setTimeout( function() {
            //This initiates the first shopping prompt to the customer.
            goShopping()
        },500)
    })
}

//goShopping() is main user experience piece of the app.
//1. It prompts the customer if they would like to shop.
//2. It displays the list of current products to choose from.
//3. It grabs all the of the current information on the product chosen.
//4. It asks the customer how many units they would like and shows them how many units are available.
//5. It displays a checkout message with the total amount and quantity of the item.
//6. It concludes with running the contineShopping() function to end the session or loop the customer back through.
function goShopping() {

    inquire.prompt([
        {
            type: "list",
            name: "shopPrompt",
            message: "Would you like to make a purchase?",
            choices: ["Yes, I have money to burn.", "No, I'm broke! What am I doing here?"]
            
        },
        {
            type: "list",
            name: "productChoice",
            message: "Select the product you would like to purchase.",
            choices: itemArray
        }
    ]).then( function(response) {

        console.log("\n")

        for (let j=0; j<itemArray.length; j++) {
            if (itemArray[j].name === response.productChoice) {
                var getIndex = j
            }
        }

        var quantityAvailable = itemArray[getIndex].quantity,
            unitPrice = itemArray[getIndex].price,
            currentSales = itemArray[getIndex].sales

        checkout.push(getIndex, itemArray[getIndex].name, itemArray[getIndex].dept, unitPrice, quantityAvailable, currentSales)

        //*Checkout Array (Used to complete several tasks below)
        //[0] Item ID
        //[1] Product Name
        //[2] Department Name
        //[3] Unit Price
        //[4] Current Quantity
        //[5] Current Sales
        // -Added Later-
        //[6] Checkout Price
        //[7] Checkout Quantity

        inquire.prompt([
            {
                type: "list",
                name: "quantity",
                message: "How many \"" + response.productChoice + "\'s\" would you like? " + quantityAvailable + " are available. (5 items max per purchase).",
                choices: ["1", "2", "3", "4", "5"]
            
            }
        ]).then( function(response) {

            console.log("\n")

            var quantityRequested = response.quantity,
                checkoutPrice = (checkout[3] * quantityRequested).toFixed(2)
            
            if ( quantityRequested <= checkout[4] ) {

                checkout.push(checkoutPrice, quantityRequested)
            
                inquire.prompt([
                    {   
                        type: "confirm",
                        name: "checkout",
                        message: "Checkout " + checkout[7] + " " + checkout[1] + "\'s for a total of $ " + checkout[6] + "?"
                    }
            
            
                ]).then( function(response) {

                    console.log("\n")

                    if ( response.checkout ) {

                        var newQuantity = checkout[4] - checkout[7]

                        if ( checkout[6] == 1 ) {
                            console.log("\nSucess! You are the proud owner of " + checkout[7] + " new " + checkout[1] + "!\n")
                            console.log("Grand Total: $", checkout[6], "\n")
                        } else {
                            console.log("\nSucess! You are the proud owner of " + checkout[7] + " new " + checkout[1] + "s!\n")
                            console.log("Grand Total: $", checkout[6], "\n")
                        }
                        //This server connection updates the quantity available of the product after purchase.
                        connection.query(
                        
                            "UPDATE products SET ? WHERE ?",

                            [
                                {
                                    quantity: newQuantity,
                                    product_sales: Number(checkout[5])+ Number(checkout[6])
                                },
                                {
                                    product_name: checkout[1]
                                }
                            ],

                            function(err, res) {

                                console.log("\n")
                                //This takes the customer to the last prompt of the experience.
                                continueShopping()
                            }
                        )
                    } else {

                        console.log("That\'s ok.\n")
                        //This takes the customer to the last prompt of the experience.
                        continueShopping()
                    }
                })
            } else if ( checkout[4] === 0 ) {

                console.log("We are Sold OUT of that item!\n")
                //This takes the customer to the last prompt of the experience.
                continueShopping()
            } else {

                console.log("We do not have that many items available.\n")
                //This takes the customer to the last prompt of the experience.
                continueShopping()
            }
        })
    })

}

//continueShopping() is the function that prompts the user to loop back to the start of the app or end the session.
function continueShopping() {

    inquire.prompt([
        {
            type: "confirm",
            name:"continue",
            message: "Would you like to continue shopping?"
        }
    ]).then( function(response) {   

        console.log("\n")

        if ( response.continue ) {
            //Restart session.
            displayProducts()
            
        } else {
            console.log("Come again soon!\n")
            //End session.
            connection.end()
        }
    })

}
