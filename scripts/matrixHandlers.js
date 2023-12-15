const csvToMatrix = (csvString) => {
    const rows = csvString.split("\n");
    if(rows[rows.length-1] == ""){
        rows.pop();
    }
    const matrix = rows.map(row => row.split(",").map(data => parseFloat(data)));
    return matrix;
}

//create a copy of matrix
const createCopy = (data2D) => {
    let copy = []
    for (let i = 0; i < data2D.length; i++) {
        let row = []
        for (let j = 0; j < data2D[0].length; j++) {
            row.push(data2D[i][j]);
        }
        copy.push(row);
    }
    return copy;
}

//print matrix
const printMatrix = (data2D) => {
    let str = ""
    for (let i = 0; i < data2D.length; i++) {
        let row = []
        for (let j = 0; j < data2D[0].length; j++) {
            str += Math.round(data2D[i][j]*100)/100 + "\t";
        }
        str += "\n";
    }
    console.log(str);
}

//transpose matrix
const transposeMatrix = (data2D) => {
    let copy = []
    for (let i = 0; i < data2D[0].length; i++) {
        let row = []
        for (let j = 0; j < data2D.length; j++) {
            row.push(data2D[j][i]);
        }
        copy.push(row);
    }
    return copy;
}

//create a matrix where all elements are equal to value
const createNumericMatrix = (value,rowCount,columnCount) => {
    let matrix = [] ;
    for (let i = 0; i < rowCount; i++) {
        let row = []
        for (let j = 0; j < columnCount; j++) {
            row.push(value); 
        }
        matrix.push(row);
    }
    return matrix;
}

//get whole column from matrix
const getColumnVector = (index,data) => {
    let columnVector = [];
    for (let i = 0; i < data.length; i++) {
        columnVector.push(data[i][index]);
    }
    return columnVector;
}

//get corresponding polynomial based on coefficients
const getPolynomialString = (coefficients) => {
    let result = coefficients[0];
    for (let i = 1; i < coefficients.length; i++) {
        result += " + " + coefficients[i] + " * x ** " + i;
    }
    return result;
}

//selection sort ascending
const sortValuePairs = (matrix) => {
    let n = matrix.length;
        
    for(let i = 0; i < n; i++) {
        // Finding the smallest number in the subarray
        let min = i;
        for(let j = i+1; j < n; j++){
            if(matrix[j][0] < matrix[min][0]) {
                min=j; 
            }
         }
         if (min != i) {
             // Swapping the elements
             let tmp = matrix[i]; 
             matrix[i] = matrix[min];
             matrix[min] = tmp;      
        }
    }
    return matrix;
}


function generateTableHead(table, heads) {
    while(table.firstChild){
        table.removeChild(table.firstChild);
    }
    let thead = table.createTHead();
    let row = thead.insertRow();
    for (let i=0; i < heads.length;i++) {
        let th = document.createElement("th");
        let text = document.createTextNode(heads[i]);
        th.appendChild(text);
        row.appendChild(th);
    }
}

//create a table
const createTableFromMatrix = (matrix,tableID,labels) => {
    let table = document.getElementById(tableID);
    generateTableHead(table,labels)
    matrix.forEach(row => {
        let tableRow = table.insertRow();
        row.forEach(element => {
            let cell = tableRow.insertCell();
            let text = document.createTextNode(element);
            cell.appendChild(text);
        })
    });
}


//round off to x decimal places
const roundOffTo = (num, x) =>{
    return Math.round(num*(10**x))/100;
}