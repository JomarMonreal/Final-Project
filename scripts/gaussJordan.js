"use strict"

//pivoting for solving linear systems
const pivotRows = (inputMatrix,rowIndex,columnIndex) => {
    let matrix = [...inputMatrix];
    let highestRow = [...matrix[rowIndex]];
    let highestRowIndex = rowIndex;

    //find row with highest value
    for (let i = rowIndex; i < matrix.length; i++) {
        if (Math.abs(matrix[i][columnIndex]) > Math.abs(highestRow[columnIndex])) {
            highestRow = [...matrix[i]];
            highestRowIndex = i;                    }
    }

    //swap
    matrix[highestRowIndex] = [...matrix[rowIndex]]
    matrix[rowIndex] = highestRow;
    return matrix;

}

const getGaussJordan = (augCoeffMatrix) => {
    //check if it's a square matrix (not in augcoeff form)
    if(augCoeffMatrix.length + 1 != augCoeffMatrix[0].length){
        return null;
    }

    //caching
    const rowCount = augCoeffMatrix.length;
    const colCount = augCoeffMatrix[0].length;
    let augCoeffMatrixCopy = createCopy(augCoeffMatrix);
    
    //  start of method
    //by column instead of by row
    for (let j = 0; j < colCount-1; j++) {
        //swap every change of column and normalize [j, ]
        augCoeffMatrixCopy =  pivotRows(augCoeffMatrixCopy,j,j);
        augCoeffMatrixCopy[j] = [...augCoeffMatrixCopy][j].map(e => e/augCoeffMatrixCopy[j][j]);

        for (let i = 0; i < rowCount; i++) {
            //skip normalized row
            if(i==j){
                continue;
            }
            //subtract row to multiplied equation where [j,] is the pivot row
            const multiplier = augCoeffMatrixCopy[i][j];
            const multipliedEquation = [...augCoeffMatrixCopy[j]].map(e => e * multiplier);
            for (let k = 0; k < colCount; k++) {
                augCoeffMatrixCopy[i][k] = augCoeffMatrixCopy[i][k] - multipliedEquation[k];      
            }
        }
    }

    const solution = getColumnVector(colCount-1,augCoeffMatrixCopy);
    return solution;
}
