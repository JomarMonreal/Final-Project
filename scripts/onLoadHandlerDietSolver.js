//create a check box for food
const createCheckBox = (foodRow, containerID) => {
    const container = document.getElementById(containerID);
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.className = "foodCheckbox";
    checkbox.type = "checkbox";
    checkbox.id = foodRow["Foods"];
    checkbox.checked = sessionStorage.getItem(checkbox.id) == "true"? true: false;
    checkbox.value = JSON.stringify(foodRow);   //to pass food properties (object) into checkbox value as string
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(foodRow["Foods"]));
    container.appendChild(label);
}

//do this when window loads
window.onload = (e) => {
    const nutritionalValues = getNutritionalValues();
    for (let i = 0; i < nutritionalValues.length; i++) {
        const foodRow = nutritionalValues[i];
        if(i < nutritionalValues.length/2){
            createCheckBox(foodRow,"checkboxContainer1");
        } else{
            createCheckBox(foodRow,"checkboxContainer2");
        }
    }

}

window.onbeforeunload = (e) => {
    saveSession();
}

//save checbox state for every session
const saveSession = () => {
    const checkBoxes = document.getElementsByClassName("foodCheckbox");
    for (let i = 0; i < checkBoxes.length; i++) {
        const checkBox = checkBoxes[i];
        sessionStorage.setItem(checkBox.id,checkBox.checked? "true": "false");
    }
}

