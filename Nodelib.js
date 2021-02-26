container = document.getElementById("container");
backgraph = document.getElementById("line_container_svg");
node_id = 0;
z_index_id = 0;
all_nodes = [];
selected_nodes = [];
output_nodes = [];
latest_nodes = [];
input_connectors = {};
recursive_nodes_to_calculate = []; //List of recursive nodes that should get calculated in next tick
live_data_nodes_update = true;
connectorVisualisation = true;
connectorglow = false;
nodelib_version = 1.00; //Version of nodelib, for compatibility check with old Logics saves.

zoom_factor = 1;

current_network_call = "main"; //Multiple network states call states will be introduced in the future.
current_tick = 0;

debug_mode = true;


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
        if (debug_mode) {this.title = title+": "+this.id}
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
        this.deletebtn.innerHTML = `Delete node`;
        this.body.appendChild(this.deletebtn);
        this.deletebtn.onclick = this.delete;

        this.pos1 = 0; this.pos2 = 0; this.pos3 = 0; this.pos4 = 0; //variables for the window dragging behaviour
        
        this.header.onmousedown = this.dragMouseDown;
        
        

        this.to_top(); //New nodes on top

        all_nodes.push(this);

        this.current_tick_calloutput = {}; //Stores the outcome of the network for this node in the current "tick", so that 10 output nodes connected to one node with a node network before it, don't all call the whole network.
        this.previous_tick_calloutput = {}; //For recursive networks
        this.previous_tick = current_tick;
        this.recursive = false;



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

        }
        for (let index in this.inputs) {
            let input = this.inputs[index];
            this.input_elements["input" + index + "connector_coords"] = [this.node_container.offsetLeft+2, this.node_container.offsetTop + this.input_elements["input" + index + "div"].offsetTop + 10];
            
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

        for (x in this.input_connections) {
            this.input_connections[x][3].outputcoords_dependant_nodes.splice(this.input_connections[x][3].outputcoords_dependant_nodes.indexOf(this), 1)
        }
        for (x in this.input_connections) {
            this.input_connections[x][3].updateIsRecursive();
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
    dragMouseDown(e) { //*Starts dragging the node noises*
        e = e || window.event;
        if (e.button != 0 && e.button != null) { //Dont register right clicks and stuff. Proceed if the grab behaviour is caused by something else than a mouse click: the G key.
            return false;
        }

        this.pos3 = Number(e.clientX);
        this.pos4 = Number(e.clientY);
        
        
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
        this.pos3 = Number(coords[0]);
        this.pos4 = Number(coords[1]);
        this.to_top();
    }

    elementDrag(e) { //Dragging the window. Executed on mouse movement, when dragging the window header.
        e = e || window.event;
        if (e.type === "touchmove") {
            this.pos1 = (this.pos3 - Number(e.touches[0].clientX))*(1/zoom_factor);
            this.pos2 = (this.pos4 - Number(e.touches[0].clientY))*(1/zoom_factor);
            this.pos3 = Number(e.touches[0].clientX);
            this.pos4 = Number(e.touches[0].clientY);
        } else {
            this.pos1 = (this.pos3 - Number(e.clientX))*(1/zoom_factor);
            this.pos2 = (this.pos4 - Number(e.clientY))*(1/zoom_factor);
            this.pos3 = Number(e.clientX);
            this.pos4 = Number(e.clientY);
        }
        
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

    requestParentDrawLines(){ //Request to all nodes drawing lines to me: I have moved! Please redraw your lines!
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

        this.connectordragstartposition = [Number(e.pageX), Number(e.pageY)];

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
        
        let differenceX = (Number(e.pageX)-this.connectordragstartposition[0])/zoom_factor;
        let differenceY = (Number(e.pageY)-this.connectordragstartposition[1])/zoom_factor;
        
        let cursorX = Number(this.connector.getAttribute("x1"))+differenceX;
        let cursorY = Number(this.connector.getAttribute("y1"))+differenceY;
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
        let x = Number(this.connector.getAttribute("x2"));//Coördinates of the place where the user stopped dragging the connector.
        let y = Number(this.connector.getAttribute("y2"));

        //Loop through all the connectors to see if one is near enough to connect.
        for (let inputs_node_index in input_connectors) { //input_connectors is a global variable containing all the input connectors and their location.
            let inputs_node = input_connectors[inputs_node_index];
            for (let c of inputs_node) {
                if (x - 1 < c[1][0] && c[1][0] < x + 1 && y - 1 < c[1][1] && c[1][1] < y + 1) { //Is it near enough to connect? Yes: Proceed with the connection. No? Cancel the connection and act like it never happened.
                    //Tell the node we're connecting to which input from which node (THIS ONE) is connecting, where it is and what its behaviour is. []
                    //Child node means the node the output is from.
                    //Node.input_connections[] is a variable which contains data for each input socket about what it is connected to. [Output socket Child node, coords of the child connector, child node behaviour, node itself.]
                    if (c[2].input_connections[c[0]] != null) {var connectiontoremove = c[2].input_connections[c[0]]}
                    c[2].input_connections[c[0]] = [this.latestConnectorNumber, [this.output_elements["output" + this.latestConnectorNumber + "connector_coords"][0], this.output_elements["output" + this.latestConnectorNumber + "connector_coords"][1]], this.behaviour, this]; //[index, coords[x,y], childbehaviour (In this case the behaviour of this instance), child]
                    c[2].drawInputConnectorLines();
                    c[2].input_elements["input" + c[0] + "input"].disabled = true;
                    if (!this.outputcoords_dependant_nodes.includes(c[2])) { //The new parent needs to know where I am at every time, so that he can draw the line.
                        this.outputcoords_dependant_nodes.push(c[2]);
                    }

                    if (connectiontoremove != null) {
                        let remove_outputcoordsdependant_node = true;
                        for (let inpnodeindex in c[2].input_connections) {
                            let inpnode = c[2].input_connections[inpnodeindex];
                            if (inpnode[3] === connectiontoremove[3]) {
                                remove_outputcoordsdependant_node = false;
                            }
                        }
                        if (remove_outputcoordsdependant_node) {connectiontoremove[3].outputcoords_dependant_nodes.splice(connectiontoremove[3].outputcoords_dependant_nodes.indexOf(c[2]), 1)}
                        
                    }
                    this.updateIsRecursive();
                    c[2].getInputData(); //To make sure the connectors become green when recursive
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

    updateIsRecursive() { //Determine if this node is in a recursive relationship and update this.recursive.
        let old_recursive = this.recursive;
        if (ScanNetworkUp.call(this, this) === "Recursive") {this.recursive = true} else {this.recursive = false}; //Is the network recursive?
        if (old_recursive != this.recursive) {
            for (let x in this.input_connections) {
                let inpc = this.input_connections[x];
                inpc[3].updateIsRecursive();
            }
            for (let x of this.outputcoords_dependant_nodes) {
                x.updateIsRecursive();
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
                
                if (!this.recursive) {
                    var data = this.input_connections[x][3].getNodeOutput()[this.input_connections[x][0]];
                    
                } else {
                    let childnodespreviousoutput = this.input_connections[x][3].previous_tick_calloutput[current_network_call];

                    if (childnodespreviousoutput == null) {
                        childnodespreviousoutput = new Array(128).fill(0);
                        
                    }
                    var data = childnodespreviousoutput[this.input_connections[x][0]];
                    recursive_nodes_to_calculate.push(this.input_connections[x][3])
                }
                


                this.input_elements["input" + x + "input"].disabled = true;
                if (data != undefined && data != "" && !isNaN(data) && data != Infinity) {
                    inpdatalist.push(data);
                } else {
                    inpdatalist.push(0);
                }
                if (this.recursive && this.input_connections[x][3].recursive) {
                    if (connectorVisualisation) {
                        this.connector_lines[x].style['stroke-width'] = 2;
                        this.connector_lines[x].style['stroke'] = "#0f0";
                        this.connector_lines[x].setAttribute("filter", "");
                        
                    }
                } else {
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
        if (this.previous_tick != current_tick) {
            this.current_tick_calloutput = {};
            this.previous_tick = current_tick;
        }
        if (this.current_tick_calloutput[current_network_call] != null) { //Make sure that the network before this node is only called once.
            return this.current_tick_calloutput[current_network_call];
        } else {
            this.current_tick_calloutput[current_network_call] = this.behaviour(this.getInputData());
            this.previous_tick_calloutput = this.current_tick_calloutput;
            return this.current_tick_calloutput[current_network_call];
        }
        
    }

    inputMouseDown(e) {
        if (e.target.id == "") {
            var connector_number = Number(e.target.parentElement.id.replace(`node${this.id}inputconnector`, ""));
        } else {
            var connector_number = Number(e.target.id.replace(`node${this.id}inputconnector`, ""));
        }
        if (connector_number in this.input_connections) {
            let connection = this.input_connections[connector_number];
            delete (this.input_connections[connector_number]);
            this.connector_lines[connector_number].setAttribute("x1", this.input_elements["input" + connector_number + "connector_coords"][0]);
            this.connector_lines[connector_number].setAttribute("y1", this.input_elements["input" + connector_number + "connector_coords"][1]);
            this.connector_lines[connector_number].setAttribute("x2", this.input_elements["input" + connector_number + "connector_coords"][0]);
            this.connector_lines[connector_number].setAttribute("y2", this.input_elements["input" + connector_number + "connector_coords"][1]);
            this.input_elements["input" + connector_number + "input"].disabled = false;

            let remove_outputcoordsdependant_node = true;
            for (let inpnodeindex in this.input_connections) {
                let inpnode = this.input_connections[inpnodeindex];
                if (inpnode[3] === connection[3]) {
                    remove_outputcoordsdependant_node = false;
                }
            }
            if (remove_outputcoordsdependant_node) {connection[3].outputcoords_dependant_nodes.splice(connection[3].outputcoords_dependant_nodes.indexOf(this), 1)}
            this.updateIsRecursive();
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
        if (e.code == "KeyS" && platform == "firefox") {pressed_keys.push("ShiftLeft")}
    }

});

window.addEventListener("keyup", e => {
    //Maintain a list with all pressed keys at the moment: keydown
    if (pressed_keys.includes(e.code)) {
        pressed_keys.splice(pressed_keys.indexOf(e.code), 1);
        if (e.code == "KeyS" && platform == "firefox") {pressed_keys.splice(pressed_keys.indexOf("ShiftLeft"), 1)}
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
            gridstartposition = [Number(grid.getAttribute("x")), Number(grid.getAttribute("y"))];
            for (let nodeToMove of all_nodes) {
                nodeToMove.pos1 = nodeToMove.node_container.offsetLeft;
                nodeToMove.pos2 = nodeToMove.node_container.offsetTop;
            }
            window.onmousemove = function(e) {
                let movedby = [Number(e.pageX-dragstartposition[0])*(1/zoom_factor), Number(e.pageY-dragstartposition[1])*(1/zoom_factor)];
                for (let nodeToMove of all_nodes) {
                    nodeToMove.node_container.style.left = Number(movedby[0]+nodeToMove.pos1).toString()+"px";
                    nodeToMove.node_container.style.top = Number(movedby[1]+nodeToMove.pos2).toString()+"px";
                } for (let nodeToMove of all_nodes) { //apart from the statement above to make the lines move with the nodes, instead of having some behind.
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
                
            }
        }
        
    }
});


container.ontouchstart = function(e) {
    container.style.cursor = "grab";
    dragstartposition = [e.touches[0].pageX, e.touches[0].pageY]
    gridstartposition = [Number(grid.getAttribute("x")), Number(grid.getAttribute("y"))];
    for (let nodeToMove of all_nodes) {
        nodeToMove.pos1 = nodeToMove.node_container.offsetLeft;
        nodeToMove.pos2 = nodeToMove.node_container.offsetTop;
    }
    window.ontouchmove = function(e) {
        e.preventDefault();
        let movedby = [Number(e.touches[0].pageX-dragstartposition[0])*(1/zoom_factor), Number(e.touches[0].pageY-dragstartposition[1])*(1/zoom_factor)];
        for (let nodeToMove of all_nodes) {
            nodeToMove.node_container.style.left = Number(movedby[0]+nodeToMove.pos1).toString()+"px";
            nodeToMove.node_container.style.top = Number(movedby[1]+nodeToMove.pos2).toString()+"px";
        } for (let nodeToMove of all_nodes) { //apart from the statement above to make the lines move with the nodes, instead of having some behind.
            nodeToMove.getConnectorPositions();
            nodeToMove.drawInputConnectorLines();
        }
        let grid = document.getElementById("grid");
        grid.setAttribute("x", gridstartposition[0]+movedby[0]);
        grid.setAttribute("y", gridstartposition[1]+movedby[1]);
    }

    window.ontouchend = function() {
        window.ontouchend = null;
        window.ontouchmove = null;
        container.style.cursor = "auto";
    }

}


output_nodes = []; //used for updating. Push 'this' to the list and 'this.update' will be executed.
live_data_nodes = [];






intervalcounter = 0;
window.setInterval(function () {
    current_tick = !current_tick;
    for (x of output_nodes) {
        x.update();
    }
    recursive_nodes_to_calculate = uniq(recursive_nodes_to_calculate);
    for (x of recursive_nodes_to_calculate) {
        x.getNodeOutput();
    }
    

    if (intervalcounter%50 == 0) {
        if (live_data_nodes_update) {
            for (let x of live_data_nodes) {
                x.update();
            }
        }
    }
    if (intervalcounter%10 ==0) {
        if (connectorVisualisation) {
            for (let x of all_nodes) {
                if (x.outputcoords_dependant_nodes.length == 0) {
                    x.update();
                }
            }
            var nodedatabackup = []
            var recursive_nodes_to_calculate_backup = recursive_nodes_to_calculate;
            recursive_nodes_to_calculate = recursive_nodes_to_calculate_backup;
        }
    }

    if (intervalcounter/1000 > 1) {
        intervalcounter = 0
    }
}, 10);


function uniq(a) {
    var prims = {"boolean":{}, "number":{}, "string":{}}, objs = [];

    return a.filter(function(item) {
        var type = typeof item;
        if(type in prims)
            return prims[type].hasOwnProperty(item) ? false : (prims[type][item] = true);
        else
            return objs.indexOf(item) >= 0 ? false : objs.push(item);
    });
}

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

function ScanNetworkUp(nodeToScanFor, list_up_until_now = []) { //Returns all nodes after this one in the network.
    if (this.outputcoords_dependant_nodes.includes(nodeToScanFor)) {return "Recursive"}
    let continuescan = true;
    if (list_up_until_now.includes(this)) {continuescan = false;}
    list_up_until_now.push(this);

    if (continuescan) {
        for (nodeToScan of this.outputcoords_dependant_nodes) {
            let answer = ScanNetworkUp.call(nodeToScan, nodeToScanFor, list_up_until_now);
            if (answer === "Recursive") {return "Recursive"}
            list_up_until_now.concat(answer);
        }
    }
    
    return uniq(list_up_until_now);
}


container.onwheel = function(e) { //Disabled until answer to the zoom question on stackoverflow is given...
    e.preventDefault();

    let oldzoom = zoom_factor;
    let deltaY = e.deltaY;
    if (/*platform == "firefox" | platform == "safari"*/true) { //Helps with weirdness with touchpad scrolling in Chromium as well.
        if (deltaY > 0) {
            deltaY = 53;
        }
        else if (deltaY < 0) {
            deltaY = -53;
        }
    }

    if (deltaY != 0) {
        var zoomedinby = zoom_factor*-6/deltaY;
    } else {
        zoomedinby = 0;
    }
    zoom_factor += zoomedinby;
    if (! (zoom_factor >= .2)) {
        zoom_factor = .2;
    } else if (zoom_factor > 4) {
        zoom_factor = 4;
    }
    //Zoom in/out
    container.style["transform-origin"] = "50% 50%"
    let offset_transform = 100/(zoom_factor)//(zoom_factor-1)*100;
    container.style.transform = `scale(${zoom_factor})`;
}




platform = "unknown";
mobile = false;
//This program works better on some browsers than on others. 
if((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1 ) {
        platform = "chromium";
    } else if(navigator.userAgent.indexOf("Chrome") != -1 ) {
        platform = "chromium";
    } else if(navigator.userAgent.indexOf("Safari") != -1) {
        platform = "safari";
        alert('This application is made for and tested on Chromium. This is Safari, and the software may not work properly on this browser. If you want the best experience, please install a Chromium based browser such as Google Chrome or Opera. Or you can just continue, if you\'d rather do that.');
    } else if(navigator.userAgent.indexOf("Firefox") != -1 ) {
        platform = "firefox";        
    } else if((navigator.userAgent.indexOf("MSIE") != -1 ) || (!!document.documentMode == true )) {
        platform = "IE";
        alert('This application is made for and tested on Chromium. This is Internet Explorer, and the software may not work properly on this browser. If you want the best experience, please install a Chromium based browser such as Google Chrome or Opera. Or you can just continue, if you\'d rather do that.');
    }  

{ //And it doens't even work on phones. (due to the onmousedown and onmousemove events)
    let mobileCheck = function() {
        let check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    };
    if (mobileCheck()) {
        mobile = true;
        alert("This webapp is not intended for mobile devices. You are able to scroll around in the network and interact with nodes, you cannot edit the network on a mobile device.")
    }
}