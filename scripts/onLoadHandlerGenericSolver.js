window.onload = (e) => {
    document.getElementById("dataQSI").addEventListener("change",() => createTableQSI(e));
    document.getElementById("dataPR").addEventListener("change",() => createTablePR(e));
}

