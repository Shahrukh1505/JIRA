let addBtn = document.querySelector(".add-btn");
let removeBtn = document.querySelector(".remove-btn");
let modalCont = document.querySelector(".modal-cont");
let mainCont = document.querySelector(".main-cont");
let textareaCont = document.querySelector(".textarea-cont");
let allPriorityColors = document.querySelectorAll(".priority-color");
let toolBoxColors = document.querySelectorAll(".color");

let colors = ["lightpink", "lightblue","lightgreen","black"]; //priority color list
let modalPriorityColor = colors[colors.length-1]; //default color
let addFlag = false; //for handling the visibility of the modal
let removeFlag = false; //for handling removal of tickets


let lockClass = "fa-lock";
let unlockClass = "fa-lock-open";
//Listener for modal priority coloring

let ticketsArr = []; //ticket array of objects each object will store ticketid tickettask ticketcolor

if(localStorage.getItem("jira_tickets")){
    //retrieve and display tickets
    ticketsArr = JSON.parse(localStorage.getItem("jira_tickets"));
    ticketsArr.forEach((ticketObj)=>{
        createTicket(ticketObj.ticketColor,ticketObj.ticketTask,ticketObj.ticketID);
    })
}
//this will handle the single click and double click for priority colors in the toolbox
//single click -> tickets of only same color will be visible
//double click -> all the tickets will be visible
for(let i = 0;i<toolBoxColors.length;i++){
    toolBoxColors[i].addEventListener("click", (e) => {
        let currentToolBoxColor = toolBoxColors[i].classList[0];

        //tickets filtered on the basis of priority color clicked
        let filteredTickets = ticketsArr.filter((ticketObj, idx) =>{
            return currentToolBoxColor === ticketObj.ticketColor;
        })

        let allTicketsCont = document.querySelectorAll(".ticket-cont");
        
        //First we will be removing all the tickets
        for(let i = allTicketsCont.length-1;i>=0;i--){
            allTicketsCont[i].remove();
        }

        //then adding/displaying only the tickets with color which has been clicked
        filteredTickets.forEach((ticketObj, idx) => {
            createTicket(ticketObj.ticketColor,ticketObj.ticketTask,ticketObj.ticketID);
        })

    })

    toolBoxColors[i].addEventListener("dblclick", (e) =>{
        let allTicketsCont = document.querySelectorAll(".ticket-cont");
        
        //First we will be removing all the tickets
        for(let i = allTicketsCont.length-1;i>=0;i--){
            allTicketsCont[i].remove();
        }

        ticketsArr.forEach((ticketObj, idx) => {
            createTicket(ticketObj.ticketColor,ticketObj.ticketTask, ticketObj.ticketID);
        })
    })

}

allPriorityColors.forEach((colorElem, idx) => {
    colorElem.addEventListener("click",(e) => {
        allPriorityColors.forEach((priorityColorElem, idx)=>{
            console.log(priorityColorElem.classList);
            priorityColorElem.classList.remove("border");
        })
      colorElem.classList.add("border");  

      modalPriorityColor = colorElem.classList[0];
    })
})
addBtn.addEventListener("click", (e) => {
    //display modal
    //generate ticket
    
    //AddFlag = true -> Modal Display
    //AddFlag, false -> Modal node

    addFlag = !addFlag;
    
    if(addFlag){
        modalCont.style.display = "flex";
        addBtn.setAttribute('title', "hide modal");
    }
    else{
        modalCont.style.display = "none";
        addBtn.setAttribute('title', "show modal");
    }
});

removeBtn.addEventListener("click", (e) => {
    removeFlag = !removeFlag;
})

modalCont.addEventListener("keydown", (e) => {
    let key = e.key;
    console.log(key);
    if(key === "Shift"){
        createTicket(modalPriorityColor, textareaCont.value); //unique created throught this library
        addFlag = false;
        setModalToDefault();
        addBtn.setAttribute('title', "show modal");
    }
});

function createTicket(ticketColor, ticketTask, ticketID) {
    let id = ticketID || shortid();  //FIRST time when the ticket is created ticketID will be null so shortid will be created for this ticket
    let ticketCont = document.createElement("div");
    ticketCont.setAttribute("class", "ticket-cont");
    ticketCont.innerHTML = `
    <div class="ticket-color ${ticketColor}"></div>
    <div class="ticket-id">#${id}</div>
    <div class="task-area">
    ${ticketTask}
    </div>
    <div class="ticket-lock">
            <i class="fas fa-lock"></i>
    </div>`
    mainCont.appendChild(ticketCont);

    //Create object of ticket and add to array 
    //0-> ticketColor
    //1-> ticketTask
    //2 -> ticketID


    //if the ticket is new then only push it into tickets arr
    if(!ticketID){
        
    ticketsArr.push({ticketColor : ticketColor, ticketTask : ticketTask,ticketID : id});
    localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr));
    }
    handleRemoval(ticketCont, id);
    handleLock(ticketCont, id);
    handleColor(ticketCont,id);
}

function handleRemoval(ticket,id) {
    //removeFlag -> true -> remove
    ticket.addEventListener("click", (e) => {
        if (!removeFlag) return;

        let idx = getTicketIdx(id);
       

        // DB removal removes the element from idx to one element
        ticketsArr.splice(idx, 1);
        let strTicketsArr = JSON.stringify(ticketsArr);
        localStorage.setItem("jira_tickets", strTicketsArr);
        
        ticket.remove(); //UI removal
    })
}

function handleLock(ticket, id){
    let ticketLockElem = ticket.querySelector(".ticket-lock");
    let ticketLock = ticketLockElem.children[0];
    let ticketTaskArea = ticket.querySelector(".task-area");
    ticketLock.addEventListener("click", (e) => {
        let ticketIdx = getTicketIdx(id);
        //if it is locked
        if(ticketLock.classList.contains(lockClass)){
            ticketLock.classList.remove(lockClass);
            ticketLock.classList.add(unlockClass);
            ticketTaskArea.setAttribute("contenteditable","true");
        }
        //if it is unlocked
        else{
            ticketLock.classList.remove(unlockClass);
            ticketLock.classList.add(lockClass);
            ticketTaskArea.setAttribute("contenteditable","false");
        }

        //Modify data in localStorage (Ticket Task)
        ticketsArr[ticketIdx].ticketTask = ticketTaskArea.innerText;
        localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr));
    })
}

//handling change of priorities on ticket
function handleColor(ticket, id){
    let ticketColor = ticket.querySelector(".ticket-color");
    ticketColor.addEventListener("click",(e) => {
       //get ticketidx from the tickets array
        let ticketIdx = getTicketIdx(id);
        
        let currentTicketColor = ticketColor.classList[1]; //gets the current color from the div of ticket color
        //get ticket color idx from the array colors
        let currentTicketColorIdx = colors.findIndex((color) => {
            return currentTicketColor === color;
        })
    
        currentTicketColorIdx++; //moving on to next color
        let newTicketColorIdx = currentTicketColorIdx%colors.length; //cyclic traversal of the colors array
        let newTicketColor = colors[newTicketColorIdx];
        ticketColor.classList.remove(currentTicketColor);
        ticketColor.classList.add(newTicketColor);
    
        //Modify data in localStorage(prioruty color change)

        ticketsArr[ticketIdx].ticketColor = newTicketColor;
        localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr));
    })
    
}

function getTicketIdx(id){
    let ticketIdx = ticketsArr.findIndex((ticketObj) => {
        return ticketObj.ticketID === id;
    })

    return ticketIdx;

}

//default properties for the modal

function setModalToDefault(){
    modalCont.style.display = "none";
    textareaCont.value = "";
    modalPriorityColor = colors[colors.length-1];
    allPriorityColors.forEach((priorityColorElem) => {
        priorityColorElem.classList.remove("border");

    })
    allPriorityColors[allPriorityColors.length-1].classList.add("border");
}

