document.addEventListener("DOMContentLoaded", function() {
    const createLink = document.getElementById("createLink");
    const homeLink = document.getElementById("homeLink"); 
    const homeContent = document.getElementById("home"); 
    const createContent = document.getElementById("create");
    const createButton = document.getElementById("createButton"); 
    const activities = document.getElementById("activities"); 
    const addRow = document.getElementById("addRow"); 
    const tableBody = document.getElementById("tableBody");
    
    loadSavedData(); 
    
    createLink.addEventListener("click", function(event){
        event.preventDefault();
        showCreateContent(); 
    });

    homeLink.addEventListener("click", function(event){ 
        event.preventDefault();
        showHomeContent(); 
    });

    createButton.addEventListener("click", function(event){
        activities.style.display = "table";  
        addRow.style.display = "inline-block";
        createButton.style.display = "none"; 
        saveData();
    });

    addRow.addEventListener("click", function(event) {
        addNewRow(); 
        saveData();
    });

    function showHomeContent() {
        homeContent.style.display = "block"; 
        createContent.style.display = "none";
        activities.style.display = "none"; 
        addRow.style.display = "none";
        createButton.style.display = "inline-block";   
    }

    function showCreateContent() {
        homeContent.style.display = "none"; 
        createContent.style.display = "block"; 
    }

    function addNewRow(activity = "", dueDate= "", notes = "") {
        const newRow = document.createElement("tr"); 

        const activityCell = document.createElement("td"); 
        const activityInput = document.createElement("textarea"); 
        activityInput.type = "text"; 
        activityInput.value = activity; 
        activityInput.placeholder = "Activity"; 
        activityCell.appendChild(activityInput); 

        const dateCell = document.createElement("td"); 
        const dateInput = document.createElement("input"); 
        dateInput.type = "datetime-local"; 
        dateInput.value = dueDate; 
        dateCell.appendChild(dateInput); 

        const notesCell = document.createElement("td"); 
        const notesInput = document.createElement("textarea"); 
        notesInput.type = "text"; 
        notesInput.placeholder = "Notes";
        notesInput.value = notes;  
        notesCell.appendChild(notesInput); 

        const actionsCell = document.createElement("td"); 
        const deleteButton = document.createElement("button"); 
        deleteButton.textContent = "Delete"; 
        deleteButton.className = "deleteButton"; 
        deleteButton.addEventListener("click", function() {
            tableBody.removeChild(newRow); 
            saveData();
        });
        actionsCell.appendChild(deleteButton); 

        newRow.appendChild(activityCell); 
        newRow.appendChild(dateCell); 
        newRow.appendChild(notesCell); 
        newRow.appendChild(actionsCell); 

        tableBody.appendChild(newRow); 
    }

    function saveData() {
        const rows = tableBody.querySelectorAll("tr"); 
        const data = Array.from(rows).map(row => {
            const inputs = row.querySelectorAll("input, textarea"); 
            return {
                activity: inputs[0].value,
                dueDate: inputs[1].value,
                notes: inputs[2].value
            };
        });
        localStorage.setItem("toDoListData", JSON.stringify(data)); 
    }

    function loadSavedData() {
        const data = JSON.parse(localStorage.getItem("toDoListData")); 
        if (data && data.length > 0) {
            activities.style.display = "table"; 
            addRow.style.display = "inline-block"; 
            createButton.style.display = "none"; 
            data.forEach(item => {
                addNewRow(item.activity, item.dueDate, item.notes); 
            }); 
        } else {
            activities.style.display = "none"; 
            addRow.style.display = "none"; 
            createButton.style.display = "inline-block"; 
        }
    }

});




