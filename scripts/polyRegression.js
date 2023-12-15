"use strict"

//get sum of x raised to a and y raised to b [sum[(x^a)(y^b)]]
const getSummation = (xVector,a,yVector,b) => {
    let sum = 0;
    for (let i = 0; i < xVector.length; i++) {
        sum = sum + (xVector[i] ** a) * (yVector[i] ** b);
    }
    return sum;
}

//get augmented coefficient matrix
const getAugCoeffMatrix = (order,data) => {
    let augCoeffMatrix = createNumericMatrix(0,order+1,order+2);
    
    let xVector = getColumnVector(0,data);
    let yVector = getColumnVector(1,data)

    //start of iteration
    for (let i = 0; i < augCoeffMatrix.length; i++) {
        for (let j = 0; j < augCoeffMatrix[0].length; j++) {
            if(j == augCoeffMatrix[0].length - 1){
                augCoeffMatrix[i][j] = getSummation(xVector,i,yVector,1);
                continue;
            } 
            augCoeffMatrix[i][j] = getSummation(xVector,j+i,yVector,0);
        }
    }

    return augCoeffMatrix;
}

//create table from csv uploaded
async function createTablePR(event){
    event.preventDefault();

    let dataPromise = new Promise((resolve) => {
        const fileInput = document.getElementById('dataPR');
        const reader = new FileReader();
        reader.onload = () => {
            //once called, return the data in matrix form
            resolve(csvToMatrix(reader.result));
        }
        // start reading the file. When it is done, calls the onload event defined above.
        reader.readAsBinaryString(fileInput.files[0]);
    });
    const data = await dataPromise;
    const sortedData = sortValuePairs(data);
    createTableFromMatrix(sortedData,"tablePR",["x","y"]);
}

async function showPolynomialRegression(event){
    event.preventDefault();
    const degree = parseInt(document.getElementById('degreePR').value);
    const xValue = parseInt(document.getElementById("xValuePR").value);

    let dataPromise = new Promise((resolve) => {
        const fileInput = document.getElementById('dataPR');
        const reader = new FileReader();
        reader.onload = () => {
            //once called, return the data in matrix form
            resolve(csvToMatrix(reader.result));
        }
        // start reading the file. When it is done, calls the onload event defined above.
        reader.readAsBinaryString(fileInput.files[0]);
    });

    
    const data = await dataPromise;
    createTableFromMatrix(data,"tablePR",["x","y"]);
    const [augCoeffMatrix,coefficients,rStylePolynomialString, polynomialFunction] = conductPolynomialRegression(degree,data);
    const estimate = polynomialFunction(xValue);
    document.getElementById("estimatePR").innerText = estimate;
    document.getElementById("functionPR").innerText = rStylePolynomialString;
    console.log(augCoeffMatrix,coefficients,rStylePolynomialString,polynomialFunction,estimate);
}

const conductPolynomialRegression = (order, data) => {
    if(order < 1 || data.length < order+1){
        return null;
    }
    const augCoeffMatrix = getAugCoeffMatrix(order, data);
    const coefficients = getGaussJordan(augCoeffMatrix);
    const polynomialString = getPolynomialString(coefficients);
    const rStylePolynomialString = "function (x) " + polynomialString.replaceAll("**","^");
    const polynomialFunction = Function("x","return " + polynomialString);
    return [augCoeffMatrix,coefficients,rStylePolynomialString, polynomialFunction];
}


