"use strict"


const DEGREE = 2;   //quadratic equation has degree 2
const NUMBER_OF_TERMS = 3;  //three terms in quadratic equation

//create table from csv uploaded
async function createTableQSI(event){
    event.preventDefault();

    let dataPromise = new Promise((resolve) => {
        const fileInput = document.getElementById('dataQSI');
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
    createTableFromMatrix(sortedData,"tableQSI",["x","y"]);
}

async function showQuadraticSplineInterpolation(event){
    event.preventDefault();
    const xValue = parseInt(document.getElementById("xValueQSI").value);

    //get csv and convert it to matrix
    let dataPromise = new Promise((resolve) => {
        const fileInput = document.getElementById('dataQSI');
        const reader = new FileReader();
        reader.onload = () => {
            //once called, return the data in matrix form
            resolve(csvToMatrix(reader.result));
        }
        // start reading the file. When it is done, calls the onload event defined above.
        reader.readAsBinaryString(fileInput.files[0]);
    });

    //then conduct QSI
    const data = await dataPromise;
    const sortedData = sortValuePairs(data);
    createTableFromMatrix(sortedData, "tableQSI", ["x","y"]);
    const [intervalFunctions,estimate] = conductQuadraticSplineInterpolation(sortedData,xValue);
    document.getElementById("estimateQSI").innerText = estimate;

    //show intervals and their corresponding functions
    const functionIntervalsContainer = document.getElementById("functionIntervalsContainer");
    intervalFunctions.forEach(intervalFunction => {
        const intervalText = document.createElement("h4");
        intervalText.innerText = "At interval [" + intervalFunction.interval[0] + ", " + intervalFunction.interval[1] + "]:"

        const functionText = document.createElement("h5");
        functionText.innerText = ">   " + intervalFunction.rStylePolynomialString;

        if(intervalFunction.containsX){
            intervalText.style = "background-color: #9f87db";
            functionText.style = "background-color: #9f87db";
        }

        functionIntervalsContainer.appendChild(intervalText);
        functionIntervalsContainer.appendChild(functionText);

    });
    console.log(intervalFunctions);
}

const conductQuadraticSplineInterpolation = (data,xValue) => {
    let augCoeffMatrix = createNumericMatrix(0, (data.length-1) * NUMBER_OF_TERMS, (data.length-1)* NUMBER_OF_TERMS + 1);

    let splineCounter = 0;   //counter for splines evaluated
    let wasSplineRecorded = true;    //check if first data of spline was evaluated, assumes there's a spline recorded at first iteration
    let dataIndex = 0;    //tracks the current data index 
    
    //evaluation of data points recorded in rows 2n
    for (let i = 0; i < (data.length-1) * 2; i++) {

        //assignment in respective columns
        for (let j = 0; j < augCoeffMatrix[0].length; j++) {
            if(j >= splineCounter*3){
                let currentTermCounter = (j%NUMBER_OF_TERMS);   //counter for terms evaluated in a quadratic equation
                //assignment of data to matrix following this format x2 + x + 1
                augCoeffMatrix[i][splineCounter*3 + currentTermCounter] = data[dataIndex][0] ** (DEGREE-currentTermCounter);

                if(currentTermCounter == DEGREE){
                    break;
                }
            }
        }
        
        //assign the y value
        augCoeffMatrix[i][augCoeffMatrix[0].length-1] = data[dataIndex][1];
        //increment only when spline was recorded
        dataIndex = wasSplineRecorded? dataIndex+1: dataIndex; 
        //reverse flag
        wasSplineRecorded = !wasSplineRecorded; 
        //if the spline was recorded, move to next spline
        if(wasSplineRecorded){   
            splineCounter += 1;
        }
    }

    
    //evaluation of smoothness
    splineCounter = 0;
    dataIndex = 1;
    for (let i = (data.length-1) * 2; i < augCoeffMatrix[0].length-2; i++) {
        //assignment in respective columns
        for (let j = 0; j < augCoeffMatrix[0].length; j++) {
            if(j >= splineCounter*3){
                augCoeffMatrix[i][splineCounter*3] = data[dataIndex][0] *2;
                augCoeffMatrix[i][splineCounter*3 + 1] = 1;
                augCoeffMatrix[i][splineCounter*3 + 3] = data[dataIndex][0] *-2;
                augCoeffMatrix[i][splineCounter*3 + 4] = -1;
                splineCounter += 1;
                break;
            }
        }   
        dataIndex+=1;
    }
    
    //assume the last row as 2a1 = 0
    augCoeffMatrix[augCoeffMatrix.length-1][0] = 2;
    console.log(augCoeffMatrix);

    //find the solution from the augCoeffMatrix using Gauss Jordan
    let solutions = getGaussJordan(augCoeffMatrix);
    console.log(solutions);

    //get function from each intervals
    let intervalFunctions = [];
    for (let i = 0; i < data.length-1; i++) {
        const eqautionSolutions = solutions.splice(0,3);
        const polyString = getPolynomialString(eqautionSolutions.reverse());
        const intervalFunction = {
            functionString: polyString,
            rStylePolynomialString: "function (x) " + polyString.replaceAll("**","^"),
            interval: [data[i][0],data[i+1][0]],
            containsX: false
        };
        intervalFunctions.push(intervalFunction);
    }

    //estimate x
    let estimate = 0;
    intervalFunctions.forEach(intervalFunction => {
        if(xValue>=intervalFunction.interval[0] && xValue<=intervalFunction.interval[1]){
            const polynomialFunction = Function("x","return " + intervalFunction.functionString);
            estimate = polynomialFunction(xValue).toFixed(4);
            intervalFunction.containsX = true;
        }
    });
    
    return [intervalFunctions,estimate];
}

