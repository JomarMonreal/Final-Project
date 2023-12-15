"use strict"



//find pivot column
const findPivotColumn = (tableau) => {
    //find negative number with highest magnitude in last row
    const lastRowIndex = tableau.length -1; 
    let pivotColumnIndex = -1;
    let highest = 0;
    for (let i = 0; i < tableau[lastRowIndex].length; i++) {
        const num = tableau[lastRowIndex][i];
        //if negative and magnitude greater than highest
        if(num < 0 && Math.abs(num) > highest){
            pivotColumnIndex = i;
            highest = Math.abs(num);
        }
    }
    return pivotColumnIndex;
}

//find pivot row
const findPivotRow = (tableau,pivotColumnIndex) => {
    //find positive number with smallest 
    let lastColumnIndex = tableau[0].length -1;
    let pivotRowIndex = -1;
    let smallest = Infinity;
    for (let i = 0; i < tableau.length; i++) {
        const row = tableau[i];
        let ratio = row[lastColumnIndex]/row[pivotColumnIndex];
        if(ratio > 0 && ratio < smallest){
            pivotRowIndex = i;
            smallest = ratio;
        }
    }
    return pivotRowIndex;
}

const setupInitialTableau = (transposedMatrix,numberOfUnknowns) =>{
    //setup the intial tableau
    let initialTableau = [];
    let currentIndex = 0;
    for (let i = 0; i < transposedMatrix.length; i++) {
        const transposedMatrixRow = transposedMatrix[i];
        let initialTableauRow = [];
        console.log(transposedMatrix.length,transposedMatrix[0].length);
        const numberOfColumns = transposedMatrix.length-1 + transposedMatrix[0].length-1 + 2;

        for (let j = 0; j < numberOfColumns; j++) {
            //for slacks columns
            if(j<transposedMatrix[0].length-1){
                //if not last row, push it as is
                if(i != transposedMatrix.length-1){
                    initialTableauRow.push(transposedMatrixRow[j]);
                }
                //else push its inverse
                else{
                    initialTableauRow.push(transposedMatrixRow[j] * -1);
                }
            } 
            //unknown columns except last row
            else if(j == transposedMatrix[0].length-1+currentIndex && i != transposedMatrix.length-1){
                initialTableauRow.push(1);
            } 
            //solution column except last row
            else if(j == numberOfColumns-1 && i != transposedMatrix.length-1){
                initialTableauRow.push(transposedMatrixRow[transposedMatrixRow.length-1]);
            } 
            //if last row, second to the last column
            else if(i == transposedMatrix.length-1 && j == numberOfColumns -2){
                initialTableauRow.push(1);
            }
            //default
            else{
                initialTableauRow.push(0);
            }

        }
        initialTableau.push(initialTableauRow);
        currentIndex++;
    }
    return initialTableau;
}

//accepts objective (list), constraint functions (2D list), and unknowns(list)
const simplexMinimization = (objective,constraints,unknowns) => {
    const numberOfUnknowns = unknowns.length;

    //initial matrix
    let initialMatrix = [];
    constraints.forEach(constraint => {
        initialMatrix.push(constraint);
    });
    initialMatrix.push(objective);
    
    
    //get transposed
    let transposedMatrix = transposeMatrix(initialMatrix);

    console.log(initialMatrix);
    console.log(transposedMatrix);

    // setup initial tableau
    let tableau = setupInitialTableau(transposedMatrix,numberOfUnknowns);
    printMatrix(tableau);
    
    
    //solve the tableau
    let pivotColumnIndex = findPivotColumn(tableau);
    let pivotRowIndex = findPivotRow(tableau,pivotColumnIndex);
    let numOfIterations = 0;

    while(pivotColumnIndex != -1 && numOfIterations < 1000){
        if(pivotRowIndex == -1){
            console.log("Infeasible");
            return [null,null];
        }
        
        const pivotElement = tableau[pivotRowIndex][pivotColumnIndex];
        //if pivot element is zero, infeasible
        if(pivotElement == 0){
            console.log("Infeasible");
            return [null,null];
        }

        //normalize row
        tableau[pivotRowIndex] = tableau[pivotRowIndex].map(e => e / pivotElement);
    
        //clear the pivot column
        for (let i = 0; i < tableau.length; i++) {
            //skip normalized row
            if(i == pivotRowIndex){
                continue;
            }
            //subtract row to multiplied equation where [j,] is the pivot row
            const multiplier = tableau[i][pivotColumnIndex];
            const multipliedEquation = [...tableau[pivotRowIndex]].map(e => e * multiplier);
            for (let k = 0; k < tableau[i].length; k++) {
                tableau[i][k] = tableau[i][k] - multipliedEquation[k];      
            }
        }

        pivotColumnIndex = findPivotColumn(tableau);
        pivotRowIndex = findPivotRow(tableau,pivotColumnIndex);
        numOfIterations++;

        //print the state of tableau every iteration
        printMatrix(tableau);
    }
    
    //setup solutions
    const basicSolutions = tableau[tableau.length-1];
    const solutionsToUnknowns = basicSolutions.slice(transposedMatrix[0].length-1,-2);
    const Z = basicSolutions[basicSolutions.length-1];  //from the objective function
    
    //construct the diet plan table
    const dietPlanBreakdown = []
    for (let i = 0; i < unknowns.length; i++) {
        if(solutionsToUnknowns[i] == 0){
            continue;
        }
        const unknown = unknowns[i]["Foods"];
        const servings = solutionsToUnknowns[i];
        const cost = unknowns[i]["Price/Serving"] * servings;
        dietPlanBreakdown.push([unknown,roundOffTo(servings,2),roundOffTo(cost,2)]);
    }

    //log essential data to console
    console.log("Number of iterations: ",numOfIterations);
    console.log("Basic solutions", basicSolutions);
    console.log("Diet table", dietPlanBreakdown);
    console.log("The cost of this optimal diet is ", Z);

    return [dietPlanBreakdown,Z];
}


//diet solver
const createDietPlan = (e) => {
    e.preventDefault();
    const foods = document.getElementsByClassName("foodCheckbox");

    //find selected foods
    let selectedFoods = [];
    for (let i = 0; i < foods.length; i++) {
        const food = foods[i];
        if (food.checked == true) {
            selectedFoods.push(JSON.parse(food.value)); //parse the string back to an object containing food properties
        }
    }

    //setting up the parameters for minimization
    let rowCount = 0;   //row count of initial matrix
    let rowsNegated = [];   //rows that were multiplied by negative 1

    //for objective function
    let objective = [];
    for (let i = 0; i < selectedFoods.length; i++) {
        const selectedFood = selectedFoods[i];
        objective.push(selectedFood["Price/Serving"]); 
    }
    objective.push(1);
    rowCount++;

    let constraints = [];

    //first set of constraints: minimizing total nutrients
    for (let i = 0; i < nutritionalValueConstraints().length; i++) {
        const nutritionalValueConstraint = nutritionalValueConstraints()[i];

        let constraint = [];
        for (let j = 0; j < selectedFoods.length; j++) {
            const selectedFood = selectedFoods[j];
            const nutrientValue = selectedFood[nutritionalValueConstraint["nutrient"]];
            constraint.push(parseFloat(nutrientValue));
        }
        constraint.push(nutritionalValueConstraint["minimum"]);
        constraints.push(constraint);
        rowCount++;
    }

    //second set of constraints: maximizing total nutrients
    for (let i = 0; i < nutritionalValueConstraints().length; i++) {
        const nutritionalValueConstraint = nutritionalValueConstraints()[i];

        let constraint = [];
        for (let j = 0; j < selectedFoods.length; j++) {
            const selectedFood = selectedFoods[j];
            const nutrientValue = selectedFood[nutritionalValueConstraint["nutrient"]];
            constraint.push(parseFloat(nutrientValue) * -1);
        }

        constraint.push(nutritionalValueConstraint["maximum"] * -1);
        constraints.push(constraint);
        rowsNegated.push(rowCount);
        rowCount++;
    }

    //third set of constraints: minimizing serving
    for (let i = 0; i < selectedFoods.length; i++) {
        let constraint = [];
        for (let j = 0; j < selectedFoods.length; j++) {
            const selectedFood = selectedFoods[j];
            if(i == j){
                constraint.push(1);
            } else{
                constraint.push(0);
            }
        }
        constraint.push(0);    //0 is the min serving size
        constraints.push(constraint);
        rowsNegated.push(rowCount);
        rowCount++;
    }

    //fourth set of constraints: maximizing serving
    for (let i = 0; i < selectedFoods.length; i++) {
        let constraint = [];
        for (let j = 0; j < selectedFoods.length; j++) {
            const selectedFood = selectedFoods[j];
            if(i == j){
                constraint.push(-1);
            } else{
                constraint.push(0);
            }
        }
        constraint.push(-10);    //10 is the max serving size
        constraints.push(constraint);
        rowsNegated.push(rowCount);
        rowCount++;
    }

    //unknowns label for table heads
    let unknowns = [];
    for (let i = 0; i < selectedFoods.length; i++) {
        const selectedFood = selectedFoods[i];
        unknowns.push(selectedFood["Foods"]);
    }

    //perfor simplex
    const [dietPlanBreakdown,Z] = simplexMinimization(objective,constraints,selectedFoods, unknowns);
    //if it goes smoothly, present output
    if(dietPlanBreakdown != null){
        createTableFromMatrix(dietPlanBreakdown,"dietTable",["Food","Servings","Cost ($)"]);
        document.getElementById("optimalDietCost").innerText = roundOffTo(Z,2);
    } 
    //else say it's impossible to find/infeasisble
    else{
        document.getElementById("optimalDietCost").innerText = "impossible to find";
    }

}

const clearOutput = (e) => {
    e.preventDefault();
    document.getElementById("dietTable").replaceChildren();
    document.getElementById("optimalDietCost").innerText = "_________";
}
