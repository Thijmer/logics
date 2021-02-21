container = document.getElementById("container");
backgraph = document.getElementById("line_container_svg");
node_id = 0;
z_index_id = 0;
all_nodes = [];
selected_nodes = [];
output_nodes = [];
latest_nodes = [];
input_connectors = {};
live_data_nodes_update = true;
connectorVisualisation = true;
connectorglow = false;
nodelib_version = 1.00; //Version of nodelib, for compatibility check with old Logics saves.

node_backdrop = "blur(3px)";
zoom_factor = 1;


{ /*Made by Thijmen Voskuilen. See the about tab on this webpage for contact info.*/
    let width = 15;
    let space = 2;
    console.log(`%c${" ".repeat(width)}%cAbout the node system%c${" ".repeat(width)}`, "font-weight: bold; text-decoration: line-through;", "font-weight: bold;",  "font-weight: bold; text-decoration: line-through;");
    console.log(" ".repeat(space)+"Made by Thijmen Voskuilen");
    console.log(" ".repeat(space)+"License: You can use the software however you want");
    console.log(" ".repeat(space)+"but please don't distribute the code.");
    
}


class Node {
        constructor(title, titlecolor, inputs, outputs, customHTML, behaviour, initscript=function(){}, coords=[300,50], node_data = {}) {
        // Get all defined class methods
        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this));

        // Bind all methods
        methods
            .filter(method => (method !== 'constructor'))
            .forEach((method) => { this[method] = this[method].bind(this); });

        if (initscript == null) {
            initscript=function() {};
        }
        if (node_data == null) {
            let node_data = {};
        }
        
        //Initscript
        this.initscript = initscript.bind(this);
        //ID stuff
        this.id = node_id;
        node_id++;
        

        this.node_data = node_data; //Object in which the initscript and the behaviour functions can store data for later access.
        this.html = customHTML;
        this.titlecolor = titlecolor;
        this.title = title;
        this.inputs = inputs;
        this.outputs = outputs;
        if (behaviour != null) {
            this.behaviour = behaviour.bind(this);
        } else { //Empty nodes should just return false for all outputs.
            this.behaviour = function (inputs) {
                let a =  new Array(this.outputs.length);
                a.fill(0);
            }
            console.log("Node without behaviour detected!");
        }

        this.node_container = document.createElement("div");
        this.node_container.classList.add("node_container");
        this.node_container.style.left = coords[0];
        this.node_container.style.top = coords[1];

        this.header = document.createElement("div");
        this.header.classList.add("node_header");
        this.header.innerHTML = this.title;
        this.header.style.backgroundColor = this.titlecolor;
        
        //this.header.appendChild(document.createTextNode(this.title));
        this.node_container.appendChild(this.header);

        this.body = document.createElement("div");
        this.body.classList.add("node_body");
        this.node_container.appendChild(this.body);

        container.appendChild(this.node_container);

        //Inputs / outputs are defined like this: [type, text, connectable]. type (string )is the data type: 'Boolean', 'number' and other things if I want to add them. Text (string) is the explaination of what the socket is for. Connectable (boolean) describes
        //if the input should be connectable to other nodes. 

        this.output_elements = {};
        this.input_elements = {};

        this.customhtmldiv = document.createElement("div");
        this.customhtmldiv.innerHTML = this.html;
        this.body.appendChild(this.customhtmldiv);

        //this.input_connections: Data from the node connected to this input socket: [Connector number, coords, behaviour, node]
        this.outputcoords_dependant_nodes = [] //List of nodes with connectors lines to this node, because the lacation is important.
        this.input_connections = {};
        this.connector_lines = [];



        this.body.appendChild(document.createElement("hr"));
        this.makeconnectors();
        this.getConnectorPositions();
        z_index_id++;

        this.connectordragstartposition = [0, 0];


        //Temporary delete button
        this.deletebtn = document.createElement("button");
        this.deletebtn.innerHTML = "Delete node";
        this.body.appendChild(this.deletebtn);
        this.deletebtn.onclick = this.delete;

        this.pos1 = 0; this.pos2 = 0; this.pos3 = 0; this.pos4 = 0; //variables for the window dragging behaviour
        this.header.onmousedown = this.dragMouseDown;

        this.to_top(); //New nodes on top

        all_nodes.push(this);





        //Adding the drag event listeners so that the lines will be drawn if you drag the connector.
        for (let index in this.outputs) {
            let output = this.outputs[index];
            this.output_elements["output" + index + "connector_circle"].addEventListener("mousedown", this.connectorMouseDown);

        }
        for (let index in this.inputs) {
            let input = this.inputs[index];
            this.input_elements["input" + index + "connector_circle"].addEventListener("click", this.inputMouseDown);

        }

        this.initscript(); //Execute the setup script.
        }

    makeconnectors() {
        for (let index in this.outputs) { //Creating the output elements
            let output = this.outputs[index];

            this.output_elements["output" + index + "div"] = document.createElement("div");
            this.output_elements["output" + index + "div"].style.textAlign = "right";
            //this.output_elements["output"+index+"input"] = document.createElement("input");
            //this.output_elements["output"+index+"input"].type= "checkbox";
            //this.output_elements["output"+index+"div"].appendChild(this.output_elements["output"+index+"input"]);

            this.output_elements["output" + index + "connector_circle"] = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.output_elements["output" + index + "connector_circle"].setAttribute("height", 15);
            this.output_elements["output" + index + "connector_circle"].setAttribute("width", 10);
            var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute("cx", 5);
            circle.setAttribute("cy", 10);
            circle.setAttribute("r", 5);
            if (output[0] == "boolean")
                circle.setAttribute("fill", "#0f0");
            else if (output[0] == "number")
                circle.setAttribute("fill", "#ff0");
            this.output_elements["output" + index + "connector_circle"].appendChild(circle)
            this.output_elements["output" + index + "connector_circle"].style.cursor = "grab";
            this.output_elements["output" + index + "connector_circle"].style.position = "absolute";
            this.output_elements["output" + index + "connector_circle"].style.right = "-7px";
            this.output_elements["output" + index + "connector_circle"].id = `node${this.id}connector${index}`;


            this.output_elements["output" + index + "text"] = document.createElement("SPAN");
            this.output_elements["output" + index + "text"].innerHTML = output[1];
            this.output_elements["output" + index + "div"].style.marginRight = "10px";
            this.output_elements["output" + index + "div"].style.marginLeft = "50px";
            this.output_elements["output" + index + "div"].appendChild(this.output_elements["output" + index + "text"]);
            this.output_elements["output" + index + "div"].appendChild(this.output_elements["output" + index + "connector_circle"]);//innerHTML += circlehtml;
            this.body.appendChild(this.output_elements["output" + index + "div"]);
        }
    
    
    
        this.body.appendChild(document.createElement("hr"));
    
        input_connectors[this.id] = [];
        for (let index in this.inputs) { //Creating the input elements
            let input = this.inputs[index];
            this.input_elements["input" + index + "div"] = document.createElement("div");
            this.input_elements["input" + index + "div"].style.textAlign = "left";

            this.input_elements["input" + index + "connector_circle"] = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.input_elements["input" + index + "connector_circle"].setAttribute("height", 15);
            this.input_elements["input" + index + "connector_circle"].setAttribute("width", 10);
            circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute("cx", 5);
            circle.setAttribute("cy", 10);
            circle.setAttribute("r", 5);
            if (input[0] == "boolean")
                circle.setAttribute("fill", "#0f0");
            else if (input[0] == "number")
                circle.setAttribute("fill", "#ff0");
            this.input_elements["input" + index + "connector_circle"].appendChild(circle);
            this.input_elements["input" + index + "connector_circle"].style.cursor = "pointer";
            this.input_elements["input" + index + "connector_circle"].style.position = "absolute";
            this.input_elements["input" + index + "connector_circle"].style.left = "-7px";
            this.input_elements["input" + index + "connector_circle"].id = `node${this.id}inputconnector${index}`;

            input_connectors[this.id].push([index, [0, 0], this]); //Input connector list: [nodeIDnumber  [ConnectorID, coords, object]]





            this.input_elements["input" + index + "input"] = document.createElement("input");
            if (input[0] == "boolean")
                this.input_elements["input" + index + "input"].type = "checkbox";
            else if (input[0] == "number") {
                this.input_elements["input" + index + "input"].type = "number";
                this.input_elements["input" + index + "input"].style.width = "50px";
            }
            
            this.input_elements["input" + index + "div"].appendChild(this.input_elements["input" + index + "input"]);
            this.input_elements["input" + index + "text"] = document.createElement("SPAN");
            this.input_elements["input" + index + "text"].innerHTML = input[1];
            this.input_elements["input" + index + "div"].style.marginRight = "50px";
            this.input_elements["input" + index + "div"].style.marginLeft = "10px";
            this.input_elements["input" + index + "div"].appendChild(this.input_elements["input" + index + "text"]);
            if (input[2]) {
                this.input_elements["input" + index + "div"].appendChild(this.input_elements["input" + index + "connector_circle"]);
                this.connector_lines[index] = document.createElementNS("http://www.w3.org/2000/svg", "line");
                this.connector_lines[index].setAttribute("x1", 0); this.connector_lines[index].setAttribute("x2", 0); this.connector_lines[index].setAttribute("y1", 0); this.connector_lines[index].setAttribute("x2", 0);
                this.connector_lines[index].classList.add("connector");
                backgraph.appendChild(this.connector_lines[index]);



            }
            this.body.appendChild(this.input_elements["input" + index + "div"]);
        }
    
    }
    




    getConnectorPositions() {
        for (let index in this.outputs) {
            let output = this.outputs[index];
            this.output_elements["output" + index + "connector_coords"] = [this.node_container.offsetLeft + this.body.clientWidth + 2, this.node_container.offsetTop + this.output_elements["output" + index + "div"].offsetTop + 10];
            //backgraph.innerHTML += `<circle cx="${this.output_elements["output"+index+"connector_coords"][0]}" cy="${this.output_elements["output"+index+"connector_coords"][1]}" r="10" fill="#f00" />`;// This was for testing purposes, so that I could see if the output circle locations were correct.
            /*for (outpcoordnode of this.outputcoords_dependant_nodes) {
                //Node.input_connections[] is a variable which contains data for each input socket about what it is connected to. [Output socket parent node, coords of the parent connector, parent node behaviour, node itself.]
                for (x of this.outputcoords_dependant_nodes.input_connections) {
                    if (this in x) {
                        x[1] = [0, 0];
                    }
                }
            }*/
            //c[2].input_connections[c[0]] = [this.latestConnectorNumber, [this.output_elements["output"+this.latestConnectorNumber+"connector_coords"][0], this.output_elements["output"+this.latestConnectorNumber+"connector_coords"][1]], this.behaviour, this]; //[index, coords[x,y], parentbehaviour (In this case the behaviour of this instance), parent]


        }
        for (let index in this.inputs) {
            let input = this.inputs[index];
            this.input_elements["input" + index + "connector_coords"] = [this.node_container.offsetLeft+2, this.node_container.offsetTop + this.input_elements["input" + index + "div"].offsetTop + 10];
            //backgraph.innerHTML += `<circle cx="${this.input_elements["input"+index+"connector_coords"][0]}" cy="${this.input_elements["input"+index+"connector_coords"][1]}" r="10" fill="#f00" />`;// This was for testing purposes, so that I could see if the output circle locations were correct.
            input_connectors[this.id][index] = [index, [this.input_elements["input" + index + "connector_coords"][0], this.input_elements["input" + index + "connector_coords"][1]], this];
        }
    }

    



    
    delete(excludeallnodeslist = false) {
        this.node_container.remove();
        for (let index in this.inputs) {
            let input = this.inputs[index];

            delete input_connectors[this.id];



            this.connector_lines[index].remove();

        }
        for (let x of this.outputcoords_dependant_nodes) {
            x.childNodeDeleted(this);
        }

        if (output_nodes.includes(this)) {
            output_nodes.splice(output_nodes.indexOf(this), 1);
        }
        if ((! excludeallnodeslist) || typeof excludeallnodeslist != "boolean") {
            all_nodes.splice(all_nodes.indexOf(this), 1);
        }
        if (live_data_nodes.includes(this)) {
            live_data_nodes.splice(live_data_nodes.indexOf(this), 1);
        }

    };



    //Node drag and overlapping behaviour
    to_top() {
        this.node_container.style.zIndex = z_index_id + 1;
        z_index_id++;

    }

    //Add dragg behaviour
    dragMouseDown(e) { //*Starts dragging the window noises*
        e = e || window.event;
        if (e.button != 0 && e.button != null) { //Dont register right clicks and stuff. Proceed if the grab behaviour is caused by something else than a mouse click: the G key.
            return false;
        }
        this.pos3 = parseInt(e.clientX);
        this.pos4 = parseInt(e.clientY);
        this.to_top();
        document.onmouseup = this.closeDragElement;
        document.onmousemove = this.elementDrag;

        //Code for node selection.
        
        if (pressed_keys.includes("ShiftLeft")) {
            if (selected_nodes.includes(this)) {
                selected_nodes.splice(selected_nodes.indexOf(this), 1);
                document.onmousemove = null;
                document.onmousedown = null;
            } else {
                selected_nodes.push(this);
            }
        } else {
            for (let node_to_unselect of selected_nodes) {
                node_to_unselect.updateNodeSelectionStyle(false);
            }
            selected_nodes = [this];
                
            
        }
    
        this.updateNodeSelectionStyle();
    
        for (let x of selected_nodes.slice(selected_nodes.indexOf(this))) {
            x.initializeIndirectDragging([this.pos3, this.pos4]);
        }


        return false;
    }

    initializeIndirectDragging(coords) {
        this.pos3 = parseInt(coords[0]);
        this.pos4 = parseInt(coords[1]);
        this.to_top();
    }

    elementDrag(e) { //Dragging the window. Executed on mouse movement, when dragging the window header.
        e = e || window.event;
        this.pos1 = (this.pos3 - parseInt(e.clientX))*(1/zoom_factor);
        this.pos2 = (this.pos4 - parseInt(e.clientY))*(1/zoom_factor);
        this.pos3 = parseInt(e.clientX);
        this.pos4 = parseInt(e.clientY);
        this.node_container.style.top = (this.node_container.offsetTop - this.pos2) + "px";
        this.node_container.style.left = (this.node_container.offsetLeft - this.pos1) + "px";
        this.getConnectorPositions();
        this.drawInputConnectorLines();
        this.requestParentDrawLines();
        //Code for node selection. I'm not gonna make this now.
        /*
        for (x of selected_nodes.slice(selected_nodes.indexOf(this))) {
            x.indirectDragging([this.pos1, this.pos2]);
        }*/
    }

    //Code for node selection. I'm not gonna make this now.
    indirectDragging(coords) { 
        this.pos1 = this.pos3 - parseInt(coords[0]);
        this.pos2 = this.pos4 - parseInt(coords[1]);
        this.pos3 = parseInt(coords[0]);
        this.pos4 = parseInt(coords[1]);
        this.node_container.style.top = (this.node_container.offsetTop - this.pos2) + "px";
        this.node_container.style.left = (this.node_container.offsetLeft - this.pos1) + "px";
        this.getConnectorPositions();
        this.drawInputConnectorLines();
        this.requestParentDrawLines();
    }

    closeDragElement() { //We're done dragging the window. yee!
        document.onmouseup = null;
        document.onmousemove = null;
    }

    requestParentDrawLines(){ //Request to all nodes drawing lines to me: I have moved! please redraw your lines!
        for (let x of this.outputcoords_dependant_nodes) {
            x.drawInputConnectorLines();
        }
    }



    


    connectorMouseDown(e) { //Trying to connect me to something? This function is called when someone starts dragging one of the output connectors.
        e = e || window.event;
        this.to_top();
        document.onmousemove = this.connectorDrag;
        document.onmouseup = this.connectorCloseDrag;
        this.connector = document.createElementNS("http://www.w3.org/2000/svg", "line");

        if (e.target.id == "") {
            var connector_number = parseInt(e.target.parentElement.id.replace(`node${this.id}connector`, ""));
        } else {
            var connector_number = parseInt(e.target.id.replace(`node${this.id}connector`, ""));
        }

        this.connectordragstartposition = [parseInt(e.pageX), parseInt(e.pageY)];


        this.connector.setAttribute("x1", this.output_elements["output" + connector_number + "connector_coords"][0]);
        this.connector.setAttribute("y1", this.output_elements["output" + connector_number + "connector_coords"][1]);
        this.connector.setAttribute("x2", this.output_elements["output" + connector_number + "connector_coords"][0]);
        this.connector.setAttribute("y2", this.output_elements["output" + connector_number + "connector_coords"][1]);
        this.connector.classList.add("connector");
        backgraph.appendChild(this.connector);
        this.body.classList.add("noselect");

        this.latestConnectorNumber = connector_number;



    }
    connectorDrag(e) { //This function is called when the mouse moves while dragging the connector.
        e = e || window.event;
        let differenceX = (parseInt(e.pageX)-this.connectordragstartposition[0])/zoom_factor;
        let differenceY = (parseInt(e.pageY)-this.connectordragstartposition[1])/zoom_factor;
        let cursorX = parseInt(this.connector.getAttribute("x1"))+differenceX;
        let cursorY = parseInt(this.connector.getAttribute("y1"))+differenceY;
        let snapped = false //Connector snapping stuff
        for (let inputs_node_index in input_connectors) {
            let inputs_node = input_connectors[inputs_node_index];
            for (let c of inputs_node) {
                if (cursorX - 20 < c[1][0] && c[1][0] < cursorX + 20 && cursorY - 20 < c[1][1] && c[1][1] < cursorY + 20) {
                    this.connector.setAttribute("x2", c[1][0]);
                    this.connector.setAttribute("y2", c[1][1]);
                    snapped = true;
                    break;
                };
            }
        }
        if (!snapped) {
            this.connector.setAttribute("x2", cursorX);
            this.connector.setAttribute("y2", cursorY);
        }

    }



    connectorCloseDrag() { //This function is executed when the user stops dragging the connector. Did he manage to connect the dots? Or are they too far apart?
        document.onmouseup = null;
        document.onmousemove = null;
        this.connector.remove();
        this.body.classList.remove("noselect");
        //input_connectors [nodeIDnumber  [[ConnectorID, coords, object], [SecondInputConnectorID, coords, object]]
        let x = parseInt(this.connector.getAttribute("x2"));//Coördinates of the place where the user stopped dragging the connector.
        let y = parseInt(this.connector.getAttribute("y2"));

        //Loop through all the connectors to see if one is near enough to connect.
        for (let inputs_node_index in input_connectors) { //input_connectors is a global variable containing all the input connectors and their location.
            let inputs_node = input_connectors[inputs_node_index];
            for (let c of inputs_node) {
                if (x - 1 < c[1][0] && c[1][0] < x + 1 && y - 1 < c[1][1] && c[1][1] < y + 1) { //Is it near enough to connect? Yes: Proceed with the connection. No? Cancel the connection and act like it never happened.
                    //Tell the node we're connecting to which input from which node (THIS ONE) is connecting, where it is and what its behaviour is. []
                    //Child node means the node the output is from.
                    //Node.input_connections[] is a variable which contains data for each input socket about what it is connected to. [Output socket Child node, coords of the child connector, child node behaviour, node itself.]
                    c[2].input_connections[c[0]] = [this.latestConnectorNumber, [this.output_elements["output" + this.latestConnectorNumber + "connector_coords"][0], this.output_elements["output" + this.latestConnectorNumber + "connector_coords"][1]], this.behaviour, this]; //[index, coords[x,y], childbehaviour (In this case the behaviour of this instance), child]
                    c[2].drawInputConnectorLines();
                    c[2].input_elements["input" + c[0] + "input"].disabled = true;
                    if (!this.outputcoords_dependant_nodes.includes(c[2])) { //The new parent needs to know where I am at every time, so that he can draw the line.
                        this.outputcoords_dependant_nodes.push(c[2]);
                    }
                    break;
                };
            }
        }
        

    }

    drawInputConnectorLines() { //Draw datalines to my childs. This is a PARENT NODE function!
        for (let index in this.input_connections) { //was for (index in this.inputs)
            let input = this.inputs[index];
            let x = this.input_elements["input" + index + "connector_coords"][0];
            let y = this.input_elements["input" + index + "connector_coords"][1];
            this.connector_lines[index].setAttribute("x1", x);
            this.connector_lines[index].setAttribute("y1", y);
            if (this.input_connections[index] != null) {
                this.connector_lines[index].setAttribute("x2", this.input_connections[index][3].output_elements["output" + this.input_connections[index][0] + "connector_coords"][0]);
                this.connector_lines[index].setAttribute("y2", this.input_connections[index][3].output_elements["output" + this.input_connections[index][0] + "connector_coords"][1]);
            } else {
                this.connector_lines[index].setAttribute("x2", x);
                this.connector_lines[index].setAttribute("y2", y);
            }

        }
    }

    childNodeDeleted(child) { //Delete all evidence of the removed child node. Make sure the node isn't drawing lines and stuff to it anymore.
        for (let x in this.input_connections) {
            let connection = this.input_connections[x];
            if (connection[3] == child) {
                delete (this.input_connections[x]) //Get rid of the child node data
                //this.connector_lines[index].remove(); //Get rid of the line to the child.
                this.connector_lines[x].setAttribute("x1", this.input_elements["input" + x + "connector_coords"][0]);
                this.connector_lines[x].setAttribute("y1", this.input_elements["input" + x + "connector_coords"][1]);
                this.connector_lines[x].setAttribute("x2", this.input_elements["input" + x + "connector_coords"][0]);
                this.connector_lines[x].setAttribute("y2", this.input_elements["input" + x + "connector_coords"][1]);
                this.input_elements["input" + x + "input"].disabled = false;
            }

        }

    }

    getInputData() {
        var inpdatalist = []
        for (var x in this.inputs) {
            if (x in this.input_connections) {
                var data = this.input_connections[x][3].getNodeOutput()[this.input_connections[x][0]]
                this.input_elements["input" + x + "input"].disabled = true;
                if (data != undefined && data != "" && !isNaN(data)) {
                    inpdatalist.push(data);
                } else {
                    inpdatalist.push(0);
                }
                if (connectorVisualisation) {
                    if (data) {
                        this.connector_lines[x].style['stroke-width'] = 4;
                        this.connector_lines[x].style['stroke'] = "#f80";
                        if (connectorglow)
                            this.connector_lines[x].setAttribute("filter", "url(#glowconnector)");
                        else
                            this.connector_lines[x].setAttribute("filter", "");
                    } else {
                        this.connector_lines[x].style['stroke-width'] = 2;
                        this.connector_lines[x].style['stroke'] = "#fff";
                        this.connector_lines[x].setAttribute("filter", "");
                    }
                }


            } else {
                this.input_elements["input" + x + "input"].disabled = false;
                if (this.inputs[x][0] == "number") {
                    if (this.input_elements["input" + x + "input"].value != undefined && this.input_elements["input" + x + "input"].value != "" && parseFloat(this.input_elements["input" + x + "input"].value) != NaN) {
                        inpdatalist.push(parseFloat(this.input_elements["input" + x + "input"].value));
                    } else {
                        inpdatalist.push(0);
                    }

                } else {
                    inpdatalist.push(this.input_elements["input" + x + "input"].checked);
                }

            }
        }
        return inpdatalist;
    }

    resetConnectorStyle() {
        for (let connector_number in this.connector_lines) {
            this.connector_lines[connector_number].style['stroke-width'] = 2;
            this.connector_lines[connector_number].style['stroke'] = "#fff";
            this.connector_lines[connector_number].setAttribute("filter", "");
        }
    }

    update() {
        if (this.behaviour != null) {
            let data = this.getInputData();
            this.behaviour(data);
        }
    }

    getNodeOutput() { //Returns the node output
        return this.behaviour(this.getInputData());
    }

    inputMouseDown(e) {
        if (e.target.id == "") {
            var connector_number = parseInt(e.target.parentElement.id.replace(`node${this.id}inputconnector`, ""));
        } else {
            var connector_number = parseInt(e.target.id.replace(`node${this.id}inputconnector`, ""));
        }
        if (connector_number in this.input_connections) {
            delete (this.input_connections[connector_number]);
            this.connector_lines[connector_number].setAttribute("x1", this.input_elements["input" + connector_number + "connector_coords"][0]);
            this.connector_lines[connector_number].setAttribute("y1", this.input_elements["input" + connector_number + "connector_coords"][1]);
            this.connector_lines[connector_number].setAttribute("x2", this.input_elements["input" + connector_number + "connector_coords"][0]);
            this.connector_lines[connector_number].setAttribute("y2", this.input_elements["input" + connector_number + "connector_coords"][1]);
            this.input_elements["input" + connector_number + "input"].disabled = false;
        }
    }

    updateNodeSelectionStyle(state=undefined) {
        if (state == null) {
            if (selected_nodes.includes(this)) {
                this.node_container.style.borderWidth =  "2px";
                this.node_container.style.borderColor = "#fff";
            } else {
                this.node_container.style.borderWidth =  "1px";
                this.node_container.style.borderColor = "#3a3a3a";
            }
        } else {
            if (state) {
                this.node_container.style.borderWidth =  "2px";
                this.node_container.style.borderColor = "#fff";
            } else {
                this.node_container.style.borderWidth =  "1px";
                this.node_container.style.borderColor = "#3a3a3a";
            }
        }
        
    }

    

}


//Maintain a list with all pressed keys at the moment: keydown
pressed_keys = [];
window.addEventListener("keydown", e => {
    if (!pressed_keys.includes(e.code)) {
        pressed_keys.push(e.code);
    }

});

window.addEventListener("keyup", e => {
    //Maintain a list with all pressed keys at the moment: keydown
    if (pressed_keys.includes(e.code)) {
        pressed_keys.splice(pressed_keys.indexOf(e.code), 1);
    }

    //Node deleting using X or delete button
    if ((e.code == "Delete" | e.code =="KeyX") && (document.activeElement.nodeName != "INPUT" | (document.activeElement.type != 'text' && document.activeElement.type != 'number'))) {
        for (let nodeToDelete of selected_nodes) {
            nodeToDelete.delete();
        }
        selected_nodes = []
    }

    if ((e.code == "ShiftLeft" && pressed_keys.includes("KeyD")) | (e.code == "KeyD" && pressed_keys.includes("ShiftLeft"))) {
        console.log("Duplicate");
        let nodestoduplicate = selected_nodes;

        
    }

    if ((e.code =="KeyG") && (document.activeElement.nodeName != "INPUT" | (document.activeElement.type != 'text' && document.activeElement.type != 'number'))) {
        let nodestomove = selected_nodes;
        for (let nodeToMove of nodestomove) {
            nodeToMove.dragMouseDown();
        }
        window.onmousemove = function(e) {
            for (let nodeToMove of nodestomove) {
                nodeToMove.elementDrag(e);
            }
        }
        selected_nodes = nodestomove;
        for (let nodeToMove of nodestomove) {
            nodeToMove.updateNodeSelectionStyle(true);
        }
        
        window.onmouseup = function() {
            window.onmouseup = null;
            window.onmousemove = null;
        }
        
    }

});

window.addEventListener("mousedown", e => {
    if (true) { //Was firs if (e.target == container), but with the middle mouse button stuff, its nice to just have that in the leftclick if statement.
        if (e.button == 0 && e.target == container) {
            for (let nodeToUnselect of selected_nodes) {
                nodeToUnselect.updateNodeSelectionStyle(false)
            }
            selected_nodes = [];
        } else if (e.button == 1) {
            container.style.cursor = "grab";
            dragstartposition = [e.pageX, e.pageY]
            gridstartposition = [parseInt(grid.getAttribute("x")), parseInt(grid.getAttribute("y"))];
            for (let nodeToMove of all_nodes) {
                nodeToMove.pos1 = nodeToMove.node_container.offsetLeft;
                nodeToMove.pos2 = nodeToMove.node_container.offsetTop;
                nodeToMove.node_container.style["backdrop-filter"] = "";
            }
            window.onmousemove = function(e) {
                let movedby = [parseInt(e.pageX-dragstartposition[0])*(1/zoom_factor), parseInt(e.pageY-dragstartposition[1])*(1/zoom_factor)];
                for (let nodeToMove of all_nodes) {
                    nodeToMove.node_container.style.left = parseInt(movedby[0]+nodeToMove.pos1).toString()+"px";
                    nodeToMove.node_container.style.top = parseInt(movedby[1]+nodeToMove.pos2).toString()+"px";
                    nodeToMove.getConnectorPositions();
                    nodeToMove.drawInputConnectorLines();
                }
                let grid = document.getElementById("grid");
                grid.setAttribute("x", gridstartposition[0]+movedby[0]);
                grid.setAttribute("y", gridstartposition[1]+movedby[1]);
                
            }
            
            window.onmouseup = function() {
                window.onmouseup = null;
                window.onmousemove = null;
                container.style.cursor = "auto";
                for (let nodeToBackdropRestore of all_nodes) {
                    nodeToBackdropRestore.node_container.style["backdrop-filter"] = node_backdrop;

                }
                
            }
        }
        
    }
});





output_nodes = []; //used for updating. Push 'this' to the list and 'this.update' will be executed.
live_data_nodes = [];







window.setInterval(function () {
    for (x of output_nodes) {
        x.update();
    }
}, 10);
window.setInterval(function () {
    if (live_data_nodes_update) {
        for (let x of live_data_nodes) {
            x.update();
        }
    }
}, 500);

window.setInterval(function () {
    if (connectorVisualisation) {
        for (let x of all_nodes) {
            if (x.outputcoords_dependant_nodes.length == 0) {
                x.update();
            }
        }
    }
}, 100);


function EmptyWorkspace() { //To delete all nodes and reset values.
    for (let nodetd of all_nodes) {
        nodetd.delete(true);
    }
    all_nodes = [];
    output_nodes = [];
    all_nodes = [];
    z_index_id = 0;
    node_id = 0;
    
}


container.onwheel = function(e) { //Disabled until answer to the zoom question on stackoverflow is given...
    e.preventDefault();

    let oldzoom = zoom_factor;
    if (e.deltaY != 0) {
        var zoomedinby = zoom_factor*-6/e.deltaY;
    } else {
        zoomedinby = 0;
    }
    zoom_factor += zoomedinby;
    if (! (zoom_factor >= .2)) {
        zoom_factor = .2;
    }
    //Zoom in/out
    container.style["transform-origin"] = "50% 50%"
    let offset_transform = 100/(zoom_factor)//(zoom_factor-1)*100;
    container.style.transform = `scale(${zoom_factor})`;
}