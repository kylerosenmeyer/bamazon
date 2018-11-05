//*This is a node application called bamazonCustomer. It allows the user to shop for products and make purchases!

//Define constants for node modules.
const   mysql = require("mysql"),
        fs = require("fs"),
        inquire = require("inquirer"),
        {table} = require("table")

var homeDepartment = [],
    electronicsDepartment = [],
    clothingDepartment = []

//Setup connection to MYSQL
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon_DB"
})
    
connection.connect(function(err) {

    if (err) throw err;
    console.log("]\nconnected as id " + connection.threadId + "\n");
    console.log("\nWelcome to the bAmazon Supervisor\'s Office.\n")

    connection.query("SELECT * FROM departments", function(err, data) {

        var home = data[0],
            electronics = data[1],
            clothing = data[2]

        homeDepartment.push(home.department_id, home.department_name, Number(home.over_head_costs).toFixed(2))
        electronicsDepartment.push(electronics.department_id, electronics.department_name, Number(electronics.over_head_costs).toFixed(2))
        clothingDepartment.push(clothing.department_id, clothing.department_name, Number(clothing.over_head_costs).toFixed(2))

    })
    supervision()
});

function supervision() {

    inquire.prompt([
        {
            type: "list",
            name: "managerPrompt",
            message: "What would you like to do supervisor?",
            choices: ["View product sales by department.", "Create new department.", "End supervision session."]
            
        }
    ]).then( function(response) {

        console.log("\n")

        switch(response.managerPrompt) {

            case "View product sales by department.":
                getSales()
                break

            case "Create new department.":
                newDepartment()
                break

            case "End supervision session.":
                connection.end()
                break
        }
    })
}

function getSales() {

    

    connection.query(
        "SELECT SUM(products.product_sales) AS sum_sales, departments.department_name " +
        "FROM products " +
        "RIGHT JOIN departments ON  products.department_name = departments.department_name " +
        "GROUP BY department_name " +
        "ORDER BY department_name DESC;", 
        
        function(err, data) {

            if (err) throw err

            for ( let i=0; i<data.length; i++ ) {
                
                var deptSale = Number(data[i].sum_sales).toFixed(2),
                    deptName = data[i].department_name

                if ( deptName === "Home" ) {
                    homeDepartment.push(deptSale)
                } else if ( deptName === "Electronics" ) {
                    electronicsDepartment.push(deptSale)
                } else if ( deptName === "Clothing" ) {
                    clothingDepartment.push(deptSale)
                }
            }
        }
    )
    
    setTimeout( function() {
        updateSales()
    },500)
    
    
}

function updateSales() {


    connection.query(
                        
        "UPDATE departments SET ? WHERE ?",

        [
            {
                product_sales: homeDepartment[3]
            },
            {
                department_name: homeDepartment[1]
            }
        ],

        function(err, res) {

        }
    )

    connection.query(
                        
        "UPDATE departments SET ? WHERE ?",

        [
            {
                product_sales: electronicsDepartment[3]
            },
            {
                department_name: electronicsDepartment[1]
            }
        ],

        function(err, res) {

        }
    )

    connection.query(
                        
        "UPDATE departments SET ? WHERE ?",

        [
            {
                product_sales: clothingDepartment[3]
            },
            {
                department_name: clothingDepartment[1]
            }
        ],

        function(err, res) {

            displaySales()
        }
    )
}

function displaySales() {

    console.log("\nHere are the current sales figures by department:\n")

    var homeProfit = Number(homeDepartment[3] - homeDepartment[2]).toFixed(2),
        electronicsProfit = Number(electronicsDepartment[3] - electronicsDepartment[2]).toFixed(2),
        clothingProfit = Number(clothingDepartment[3] - clothingDepartment[2]).toFixed(2),
        toutput = "",
        tdata = [
            ["Department ID", "Department Name", "Department Overhead ($)", "Department Sales ($)", "Department Total Profit ($)"],
            [homeDepartment[0],homeDepartment[1], homeDepartment[2], homeDepartment[3], homeProfit],
            [electronicsDepartment[0], electronicsDepartment[1], electronicsDepartment[2], electronicsDepartment[3], electronicsProfit],
            [clothingDepartment[0], clothingDepartment[1], clothingDepartment[2], clothingDepartment[3], clothingProfit]
        ]


    toutput = table(tdata)

    console.log(toutput)
    
    supervision()
}

function newDepartment() {
    console.log("\nAhhh... With the recent budget cuts taking effect, I'm afraid we can\'t expand right now.\n")
    supervision()
}