function createStandardNode(type="", coords=null, node_data=null, standards=null) {
    if (coords == null) {
        coords = [300,50];
    }
    if (standards == null) {
        standards = {};
    } if (node_data == null) {
        node_data = {};
    }
    if (type == "checkbox") {
        if (standards.checked == null) {standards.checked = false};
        if (platform != "firefox" && platform != "safari") {
            var n = new Node("Input node", "#0f0", [], [["boolean", "Output"]], `
        <input type="checkbox" id="node${node_id}checkbox" style="width:100px; height:100px;" />`, behaviour=function(outputslot) {return [document.getElementById(`node${this.id}checkbox`).checked]}, null, coords);
            document.getElementById(`node${n.id}checkbox`).checked = standards.checked;
        } else {
            var n = new Node("Input node", "#0f0", [], [["boolean", "Output"]], `
        <div class="checkbox_firefox_div" id="node${node_id}checkdiv" onclick=
            'document.getElementById("node${node_id}checkbox").checked = !document.getElementById("node${node_id}checkbox").checked;
            document.getElementById("node${node_id}checkdiv").classList.toggle("checkbox_firefox_div_checked");
            document.getElementById("node${node_id}checkdiv").classList.toggle("checkbox_firefox_div");
            let svg = document.getElementById("node${node_id}svg");
            if (svg.style.display === "none") {
                svg.style.display = "block";
            } else {
                svg.style.display = "none";
            }    '>
        <svg width="100" height="100" style="display: none;" id="node${node_id}svg">
            <line x1="20" y1="50" x2="50" y2="80" stroke-width="20" stroke="#ffffff" />
            <line x1="40" y1="80" x2="80" y2="20" stroke-width="20" stroke="#ffffff" />
        </svg>
        
        </div><input type="checkbox" id="node${node_id}checkbox" style="width:100px; height:100px; visibility:hidden;" />`, behaviour=function(outputslot) {return [document.getElementById(`node${this.id}checkbox`).checked]}, initscript=function() {

            }, coords);
            if (standards.checked) {
                document.getElementById(`node${n.id}checkdiv`).dispatchEvent(new Event("click"));
            }
        }
        
    } if (type == "color input") {
        if (standards.color == null) {standards.color = "#ffbc03"};
        var n = new Node("Input node", "#0f0", [], [["number", "Red"], ["number", "Green"], ["number", "Blue"]],
            `<input type="color" id="node${node_id}color" style="width:100px; height:100px;" />`,
            behaviour=function(outputslot) {
                let colorvalue = document.getElementById(`node${this.id}color`).value;
                let r = parseInt(colorvalue.substr(1,2), 16)
                let g = parseInt(colorvalue.substr(3,2), 16)
                let b = parseInt(colorvalue.substr(5,2), 16)
                return [r/255,g/255,b/255]
            }, null, coords);
        document.getElementById(`node${n.id}color`).value = standards.color;
    } else if (type == "number input") {
        if (standards.number == null) {standards.number = 0};
        var n = new Node("Number input", "#0f0", [], [["number", "output"]], `
        <br>
        <input type="number" id="node${node_id}numberInput" />
        
        `, function() {
            return([parseFloat(document.getElementById(`node${this.id}numberInput`).value)]);
        }, null, coords);
        document.getElementById(`node${n.id}numberInput`).value = standards.number;
    } else if (type == "invert") {
        if (standards.checked == null) {standards.checked = false};
        var n = new Node("Invert", "#aaa", [["boolean", "input", true]], [["boolean", "output"]], `
        <svg height="75" width="100">
            <g>
            <g>
            <path transform="matrix(.84008 0 0 .83751 1.8576 5.93)" d="m78.15 36.87-55.305 31.931 1e-6 -63.861z" fill-opacity="0" stroke="#fff" stroke-width="3.5766"/>
            <circle cx="76.203" cy="36.789" rx="6.7207" ry="6.7" fill-opacity="0" stroke="#fff" stroke-width="2"/>
            <path d="m0 38.095 20.946-0.12249" fill="none" stroke="#fffffb" stroke-width="3"/>
            <path d="m82.07 37.238 17.639-0.12249" fill="none" stroke="#fffffe" stroke-width="3"/>
            </g>
            <text transform="matrix(1.0662 0 0 1.2448 -3.2216 -5.4742)" x="25.478394" y="38.21759" fill="#ffffff" font-family="sans-serif" font-size="10.583px" stroke="#ffffff" style="inline-size:26.3723;line-height:1.25;white-space:pre" xml:space="preserve"><tspan x="25.478394" y="38.21759"><tspan fill="#ffffff" font-weight="bold" stroke="#ffffff">NOT</tspan></tspan></text>
            <circle cx="75.639" cy="36.993" r="6" fill="none" stroke="#fffffb" stroke-width="2.0803"/>
            </g>

        </svg>
        `, behaviour=function(input_data) {
            return([! input_data[0]]);
        
        
        }, null, coords);
        n.input_elements["input" + 0 + "input"].checked = standards.checked;
    } else if (type == "or") {
        if (standards.value0 == null) {standards.value0 = false};
        if (standards.value1 == null) {standards.value1 = false};
        var n = new Node("or", "#aaa", [["boolean", "input A", true],["boolean", "input B", true]], [["boolean", "output"]], `
        <svg height="50" width="100">
            <g fill="#ffffff" stroke="#ffffff">
            <g font-family="Verdana" font-size="3.0682px" stroke-width=".25568px">
            <text transform="scale(.96858 1.0324)" x="10.001908" y="22.172966" style="line-height:0%" xml:space="preserve"><tspan x="10.001908" y="22.172966" fill="#ffffff" font-size="18.409px" stroke="#ffffff" stroke-width=".25568px" style="line-height:1.25">A</tspan></text>
            <text transform="scale(.96858 1.0324)" x="10.001908" y="42.116108" style="line-height:0%" xml:space="preserve"><tspan x="10.001908" y="42.116108" fill="#ffffff" font-size="18.409px" stroke="#ffffff" stroke-width=".25568px" style="line-height:1.25">B</tspan></text>
            <path id="path1316" d="m25.29 15.983h27.984" fill="#fff" fill-rule="evenodd" stroke="#fff" stroke-linecap="round" stroke-width="1.9176"/>
            </g>
            <use transform="translate(0 20.59)" width="500" height="180" xlink:href="#path1316"/>
            <use transform="matrix(.68354 0 0 1 65.541 10.295)" width="500" height="180" xlink:href="#path1316"/>
            </g>
            <path d="m44.111 47.198c-0.03391 0.0013 10.157-1.9628 10.157-20.92 0-19.144-10.157-20.92-10.157-20.92 16.408 1.9175 27.093-0.79807 38.386 20.92-8.4201 19.203-19.463 20.115-38.386 20.92z" fill-opacity="0" stroke="#fff" stroke-linejoin="round" stroke-width="1.9176"/>
            <g>
            <text transform="scale(.96858 1.0324)" x="108.80025" y="30.370747" fill="#ffffff" font-family="Verdana" font-size="3.0682px" stroke="#ffffff" stroke-width=".25568px" style="line-height:0%" xml:space="preserve"><tspan x="108.80025" y="30.370747" fill="#ffffff" font-size="14.318px" stroke="#ffffff" stroke-width=".25568px" style="line-height:1.25">out</tspan></text>
            <text x="54.5" y="42.299999" fill="#000000" font-family="sans-serif" font-size="40px" style="line-height:1.25" xml:space="preserve"><tspan x="54.5" y="42.299999"/></text>
            <text transform="scale(.99063 1.0095)" x="56.621998" y="30.710438" fill="#000000" font-family="sans-serif" font-size="18.578px" stroke-width=".46445" style="line-height:1.25" xml:space="preserve"><tspan x="56.621998" y="30.710438" fill="#ffffff" stroke-width=".46445">or</tspan></text>
            </g>

        </svg>
        `,
        behaviour=function(input_data) {
            return([input_data[0] | input_data[1]]);
        }, null, coords);
        n.input_elements["input" + 0 + "input"].checked = standards.value0;
        n.input_elements["input" + 1 + "input"].checked = standards.value1;
    } else if (type=="and") {
        if (standards.value0 == null) {standards.value0 = false};
        if (standards.value1 == null) {standards.value1 = false};
        var n = new Node("and", "#aaa", [["boolean", "input A", true],["boolean", "input B", true]], [["boolean", "output"]], `
        <svg height="60" width="150">

            <g transform="matrix(.48982 0 0 .48982 -221.63 -264.49)" fill-opacity="0">
            <g transform="matrix(1.4992 0 0 1.4992 -221.11 -260.34)">
            <g fill-opacity="0" stroke="#fff" stroke-linecap="square">
                <line x1="471.8" x2="501.22" y1="559.25" y2="559.25" stroke-miterlimit="10.433" stroke-width="2.0038"/>
                <line x1="576.64" x2="612.35" y1="574.09" y2="574.09" stroke-miterlimit="10.433" stroke-width="1.8278"/>
                <path transform="matrix(1438.6 0 0 1438.6 -392.1 495.93)" d="m0.62119 0.033723h0.030937c0.001528 0 0.003247 1.9097e-4 0.005156 5.7291e-4 0.00191 3.8195e-4 0.003819 0.0011458 0.005712 0.0022917 0.00191 0.0011285 0.003819 0.0028646 0.005729 0.0051389 0.00191 0.0022916 0.003247 0.0049826 0.00401 0.0080208 7.6388e-4 0.0030555 7.6388e-4 0.0061111 0 0.0091666s-0.002101 0.0057291-0.00401 0.0080208c-0.00191 0.0022743-0.003819 0.003993-0.005729 0.0051562-0.001892 0.0011285-0.003802 0.0018924-0.005712 0.0022743-0.00191 3.8194e-4 -0.003628 5.7292e-4 -0.005156 5.7292e-4h-0.016614-0.014323v-0.020625z" stroke-miterlimit="10.43" stroke-width=".0027805"/>
                <line x1="471.8" x2="501.22" y1="588.93" y2="588.93" stroke-miterlimit="10.433" stroke-width="2.0038"/>
            </g>
            <g fill="#fffffe" fill-opacity="1" font-family="Bitstream Vera Sans" font-size="12px" stroke="#ffffff" stroke-opacity="0" stroke-width="1px">
                <text x="453.62256" y="565.81165" xml:space="preserve"><tspan x="453.62256" y="565.81165" fill="#fffffe" fill-opacity="1" font-size="18px" font-weight="bold" stroke="#ffffff" stroke-opacity="0">A</tspan></text>
                <text x="453.53467" y="595.49249" xml:space="preserve"><tspan x="453.53467" y="595.49249" fill="#fffffe" fill-opacity="1" font-size="18px" font-weight="bold" stroke="#ffffff" stroke-opacity="0">B</tspan></text>
                <text x="612.96295" y="580.60614" xml:space="preserve"><tspan x="612.96295" y="580.60614" fill="#fffffe" fill-opacity="1" font-size="18px" font-weight="bold" stroke="#ffffff" stroke-opacity="0">Out</tspan></text>
            </g>
            </g>
            <text x="545.42413" y="609.52032" fill="#ffffff" fill-opacity="1" font-family="Bitstream Vera Sans" font-size="17.99px" stroke="#ffffff" stroke-opacity="0" stroke-width="1.4992px" xml:space="preserve"><tspan x="545.42413" y="609.52032" fill="#ffffff" fill-opacity="1" font-size="26.986px" font-weight="bold" stroke="#ffffff" stroke-opacity="0" stroke-width="1.4992px">AND</tspan></text>
            </g>
        </svg>`,
        behaviour=function(input_data) {
            return([input_data[0] && input_data[1]]);
        }, null, coords);
        n.input_elements["input" + 0 + "input"].checked = standards.value0;
        n.input_elements["input" + 1 + "input"].checked = standards.value1;
    } else if (type=="xor") {
        if (standards.value0 == null) {standards.value0 = false};
        if (standards.value1 == null) {standards.value1 = false};
        var n = new Node("Exclusive or", "#aaa", [["boolean", "input A", true],["boolean", "input B", true]], [["boolean", "output"]], `
            <svg height="60" width="150">
                <path d="m97.542 29.637h30.87m-79.787-12.348h-31.347m32.552 24.696h-32.552" fill="none" stroke="#fff" stroke-width="2.4696"/>
                <g>
                <g transform="matrix(1.2348 0 0 1.2348 11.105 -1.2331)" fill="#fff" fill-rule="evenodd" stroke="#fff">
                <path d="m24.25 42c-1.5974 2.6444-2.25 3-2.25 3h-3.6562l2-2.4375s5.6562-7 5.6562-17.562-5.6562-17.562-5.6562-17.562l-2-2.4375h3.6562c0.78125 0.9375 1.4219 1.6562 2.2188 3 1.8727 3.0998 4.7812 9.0266 4.7812 17 0 7.9506-2.8967 13.879-4.75 17z"/>
                <path d="m24.094 5 2 2.4375s5.6562 7 5.6562 17.562-5.6562 17.562-5.6562 17.562l-2 2.4375h17.156c2.4081 0 7.6897 0.02451 13.625-2.4062s12.537-7.3433 17.688-16.875l-1.3125-0.71875 1.3125-0.71875c-10.303-19.066-26.556-19.281-31.312-19.281zm5.875 3h11.281c4.6842 0 18.287-0.1302 27.969 17-4.7668 8.4291-10.521 12.684-15.719 14.812-5.3607 2.1954-9.8419 2.1875-12.25 2.1875h-11.25c1.8736-3.1084 4.75-9.0494 4.75-17 0-7.9734-2.9085-13.9-4.7812-17z"/>
                </g>
                <g font-family="sans-serif">
                <text x="3.8510292" y="22.904369" fill="#ffffff" font-size="15.545px" stroke-width=".38863" style="line-height:1.25" xml:space="preserve"><tspan x="3.8510292" y="22.904369" stroke-width=".38863">A</tspan></text>
                <text x="4.5450225" y="46.988567" fill="#ffffff" font-size="15.545px" stroke-width=".38863" style="line-height:1.25" xml:space="preserve"><tspan x="4.5450225" y="46.988567" stroke-width=".38863">B</tspan></text>
                <text x="131.52303" y="32.703659" fill="#000000" font-size="40px" style="line-height:1.25" xml:space="preserve"><tspan x="131.52303" y="32.703659"/></text>
                <text x="129.85939" y="33.305981" fill="#ffffff" font-size="10.472px" stroke-width=".2618" style="line-height:1.25" xml:space="preserve"><tspan x="129.85939" y="33.305981" stroke-width=".2618">Out</tspan></text>
                </g>
                </g>



            </svg>`,
            behaviour=function(input_data) {
                return([input_data[0] ^ input_data[1]]);
            }, null, coords);
        n.input_elements["input" + 0 + "input"].checked = standards.value0;
        n.input_elements["input" + 1 + "input"].checked = standards.value1;
    } else if (type == "compare") {
        if (standards.value0 == null) {standards.value0 = 0};
        if (standards.value1 == null) {standards.value1 = 0};
        if (standards.operationtype == null) {standards.operationtype = "greater"};
        var n = new Node("Greater than", "#88c", [["number", "Input A", true], ["number", "Input B", true]], [["boolean", "output"]], `
        <p>Operation type:</p>
        <select id="node${node_id}OperationType">
            <option value="greater">Greater than</option>
            <option value="less">Less than</option>
            <option value="equals">Equal to</option>


        </select>
        `, function(inp) {
                if (document.getElementById(`node${this.id}OperationType`).value == "greater") {
                    return([inp[0]>inp[1]]);
                } else if (document.getElementById(`node${this.id}OperationType`).value == "less") {
                    return([inp[0]<inp[1]]);
                } else if (document.getElementById(`node${this.id}OperationType`).value == "equals") {
                    return([inp[0]==inp[1]]);
                } else {
                    return [0];
                }
                
            }, initscript = function() {
                document.getElementById(`node${this.id}OperationType`).addEventListener("change", function(e) {
                    if (document.getElementById(`node${this.id}OperationType`).value == "greater") {
                        this.title= "Greater than";
                    } else if (document.getElementById(`node${this.id}OperationType`).value == "less") {
                        this.title= "Less than";
                    } else if (document.getElementById(`node${this.id}OperationType`).value == "equals") {
                        this.title= "Equal to";
                    }
                    this.header.innerHTML = this.title;
                }.bind(this))
        }, coords);
        n.input_elements["input" + 0 + "input"].value = standards.value0;
        n.input_elements["input" + 1 + "input"].value = standards.value1;
        document.getElementById(`node${n.id}OperationType`).value = standards.operationtype;
        
    } else if (type == "math") {
        if (standards.value0 == null) {standards.value0 = 0};
        if (standards.value1 == null) {standards.value1 = 0};
        if (standards.operationtype == null) {standards.operationtype = "add"};
        var n = new Node("Add", "#88c", [["number", "Input A", true], ["number", "Input B", true]], [["number", "output"]], `
        <p>Operation type:</p>
        <select id="node${node_id}OperationType">
            <option value="add">Add</option>
            <option value="subtract">Subtract</option>
            <option value="multiply">Multiply</option>
            <option value="divide">Divide</option>
            <option value="power">Power</option>
            <option value="modulo">Modulo</option>
            <option value="log">Logarithm</option>

        </select>


    `, function(inp) {
        if (document.getElementById(`node${this.id}OperationType`).value == "add") {
            return([inp[0]+inp[1]]);
        } else if (document.getElementById(`node${this.id}OperationType`).value == "subtract") {
            return([inp[0]-inp[1]]);
        } else if (document.getElementById(`node${this.id}OperationType`).value == "multiply") {
            return([inp[0]*inp[1]]);
        } else if (document.getElementById(`node${this.id}OperationType`).value == "divide") {
            return([inp[0]/inp[1]]);
        } else if (document.getElementById(`node${this.id}OperationType`).value == "power") {
            return([inp[0]**inp[1]]);
        } else if (document.getElementById(`node${this.id}OperationType`).value == "modulo") {
            return([inp[0]%inp[1]]);
        } else if (document.getElementById(`node${this.id}OperationType`).value == "log") {
            return([Math.log(inp[1]) / Math.log(inp[0])]);
        } else {
            return [0];
        }
        
        }, initscript=function() {
            document.getElementById(`node${this.id}OperationType`).addEventListener("change", function(e) {
                if (document.getElementById(`node${this.id}OperationType`).value == "add") {
                    this.input_elements["input" + 0 + "text"].innerHTML = "Term A";
                    this.input_elements["input" + 1 + "text"].innerHTML = "Term B";
                    this.output_elements["output" + 0 + "text"].innerHTML = "Sum";
                    this.title = "Add";
                } else if (document.getElementById(`node${this.id}OperationType`).value == "subtract") {
                    this.input_elements["input" + 0 + "text"].innerHTML = "Term A";
                    this.input_elements["input" + 1 + "text"].innerHTML = "Term B";
                    this.output_elements["output" + 0 + "text"].innerHTML = "Difference";
                    this.title = "Subtract";
                } else if (document.getElementById(`node${this.id}OperationType`).value == "multiply") {
                    this.input_elements["input" + 0 + "text"].innerHTML = "Factor A";
                    this.input_elements["input" + 1 + "text"].innerHTML = "Factor B";
                    this.output_elements["output" + 0 + "text"].innerHTML = "Product";
                    this.title = "Multiply";
                } else if (document.getElementById(`node${this.id}OperationType`).value == "divide") {
                    this.input_elements["input" + 0 + "text"].innerHTML = "Factor A";
                    this.input_elements["input" + 1 + "text"].innerHTML = "Factor B";
                    this.output_elements["output" + 0 + "text"].innerHTML = "Quotient";
                    this.title = "Divide";
                } else if (document.getElementById(`node${this.id}OperationType`).value == "power") {
                    this.input_elements["input" + 0 + "text"].innerHTML = "Base";
                    this.input_elements["input" + 1 + "text"].innerHTML = "Exponent";
                    this.output_elements["output" + 0 + "text"].innerHTML = "Result";
                    this.title = "Power";
                } else if (document.getElementById(`node${this.id}OperationType`).value == "modulo") {
                    this.input_elements["input" + 0 + "text"].innerHTML = "Input";
                    this.input_elements["input" + 1 + "text"].innerHTML = "Divider";
                    this.output_elements["output" + 0 + "text"].innerHTML = "Result";
                    this.title = "Modulo";
                } else if (document.getElementById(`node${this.id}OperationType`).value == "log") {
                    this.input_elements["input" + 0 + "text"].innerHTML = "Base";
                    this.input_elements["input" + 1 + "text"].innerHTML = "Power result";
                    this.output_elements["output" + 0 + "text"].innerHTML = "Exponent";
                    this.title = "Logarithm";
                }
                this.header.innerHTML = this.title;
                this.getConnectorPositions();
                this.requestParentDrawLines();
            }.bind(this));
        }, coords);
        n.input_elements["input" + 0 + "input"].value = standards.value0;
        n.input_elements["input" + 1 + "input"].value = standards.value1;
        document.getElementById(`node${n.id}OperationType`).value = standards.operationtype;
        document.getElementById(`node${n.id}OperationType`).dispatchEvent(new Event("change"));
    } else if (type=="round") {
        if (standards.value0 == null) {standards.value0 = 0};
        if (standards.operationtype == null) {standards.operationtype = "nearest"};
        n = new Node("Round", "#88c", [["number", "Input", true]], [["number", "Output", true]], `
        <p>Round number to</p>
        <select id="node${node_id}OperationType">
            <option value="nearest">Nearest</option>
            <option value="up">Up</option>
            <option value="down">Down</option>
        </select>
        `, function(inp) {
            if (document.getElementById(`node${this.id}OperationType`).value == "nearest")
                return [Math.round(inp[0])];
            if (document.getElementById(`node${this.id}OperationType`).value == "up")
                return [Math.ceil(inp[0])];
            if (document.getElementById(`node${this.id}OperationType`).value == "down")
                return [Math.floor(inp[0])];
        }, null, coords);
        n.input_elements["input" + 0 + "input"].value = standards.value0;
        document.getElementById(`node${n.id}OperationType`).value = standards.operationtype;

    } else if (type=="colorconvert") {
        if (standards.value0 == null) {standards.value0 = 0};
        if (standards.value1 == null) {standards.value1 = 0};
        if (standards.value2 == null) {standards.value2 = 0};
        if (standards.operationtype == null) {standards.operationtype = "rgbtohsv"};
        n = new Node("Color convert", "#88c", [["number", "Red", true],["number", "Green", true],["number", "Blue", true]], [["number", "Hue"], ["number", "Saturation"], ["number", "Value"]], `
        <p>Convert color from</p>
        <select id="node${node_id}OperationType">
            <option value="rgbtohsv">RGB to HSV</option>
            <option value="hsvtorgb">HSV to RGB</option>
        </select>
        `, function(inp) {
            if (document.getElementById(`node${this.id}OperationType`).value == "rgbtohsv") {
                var r = inp[0]; var g = inp[1]; var b = inp[2];
                //r /= 255, g /= 255, b /= 255; RGB values are no longer from 0 to 255 but now they are from 0 to 1.

                var max = Math.max(r, g, b), min = Math.min(r, g, b);
                var h, s, v = max;

                var d = max - min;
                s = max == 0 ? 0 : d / max;

                if (max == min) {
                    h = 0; // achromatic
                } else {
                    switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                    }

                    h /= 6;
                }

                return [ h, s, v ];
            } if (document.getElementById(`node${this.id}OperationType`).value == "hsvtorgb") {
                var h = inp[0]; var s = inp[1]; var v = inp[2];
                var r, g, b;

                var i = Math.floor(h * 6);
                var f = h * 6 - i;
                var p = v * (1 - s);
                var q = v * (1 - f * s);
                var t = v * (1 - (1 - f) * s);

                switch (i % 6) {
                    case 0: r = v, g = t, b = p; break;
                    case 1: r = q, g = v, b = p; break;
                    case 2: r = p, g = v, b = t; break;
                    case 3: r = p, g = q, b = v; break;
                    case 4: r = t, g = p, b = v; break;
                    case 5: r = v, g = p, b = q; break;
                }

                return [ r , g , b  ];
            }
        }, function() {
            document.getElementById(`node${this.id}OperationType`).addEventListener("change", function(e) {
                if (document.getElementById(`node${this.id}OperationType`).value == "rgbtohsv") {
                    this.input_elements["input" + 0 + "text"].innerHTML = "Red";
                    this.input_elements["input" + 1 + "text"].innerHTML = "Green";
                    this.input_elements["input" + 2 + "text"].innerHTML = "Blue";
                    this.output_elements["output" + 0 + "text"].innerHTML = "Hue";
                    this.output_elements["output" + 1 + "text"].innerHTML = "Saturation";
                    this.output_elements["output" + 2 + "text"].innerHTML = "Value";
                } else if (document.getElementById(`node${this.id}OperationType`).value == "hsvtorgb") {
                    this.input_elements["input" + 0 + "text"].innerHTML = "Hue";
                    this.input_elements["input" + 1 + "text"].innerHTML = "Saturation";
                    this.input_elements["input" + 2 + "text"].innerHTML = "Value";
                    this.output_elements["output" + 0 + "text"].innerHTML = "Red";
                    this.output_elements["output" + 1 + "text"].innerHTML = "Green";
                    this.output_elements["output" + 2 + "text"].innerHTML = "Blue";
                }
                this.header.innerHTML = this.title;
                this.getConnectorPositions();
                this.requestParentDrawLines();
            }.bind(this));
        }, coords);
        n.input_elements["input" + 0 + "input"].value = standards.value0;
        n.input_elements["input" + 1 + "input"].value = standards.value1;
        n.input_elements["input" + 2 + "input"].value = standards.value2;
        document.getElementById(`node${n.id}OperationType`).value = standards.operationtype;
        document.getElementById(`node${n.id}OperationType`).dispatchEvent(new Event("change"));

    } else if (type=="sincostan") {
        if (standards.value0 == null) {standards.value0 = 0};
        if (standards.operationtype == null) {standards.operationtype = "sin"};
        n = new Node("Sin, Cos or Tan", "#88c", [["number", "Input", true]], [["number", "Output", true]], `
        <p>Units in radians.</p>
        <select id="node${node_id}OperationType">
            <option value="sin">Sine</option>
            <option value="cos">Cosine</option>
            <option value="tan">Tangent</option>
        </select>
        `, function(inp) {
            if (document.getElementById(`node${this.id}OperationType`).value == "sin")
                return [Math.sin(inp[0])];
            if (document.getElementById(`node${this.id}OperationType`).value == "cos")
                return [Math.cos(inp[0])];
            if (document.getElementById(`node${this.id}OperationType`).value == "tan")
                return [Math.tan(inp[0])];
        }, null, coords);
        n.input_elements["input" + 0 + "input"].value = standards.value0;
        document.getElementById(`node${n.id}OperationType`).value = standards.operationtype;

    } else if (type == "mix") {
        if (standards.value0 == null) {standards.value0 = 0};
        if (standards.value1 == null) {standards.value1 = 0};
        if (standards.value2 == null) {standards.value2 = 0};
        var n = new Node("Mix/Switch", "#88c", [["number", "Factor", true],["number", "Input 1", true],["number", "Input 2", true]], [["number", "Output", true]], `
            <p>Switch between two values.</p>
        
        `, function(inp) {
            //factor*input1+(1-factor)*input2
            return [(1-inp[0])*inp[1]+inp[0]*inp[2]];
        }, null, coords);
        n.input_elements["input" + 0 + "input"].value = standards.value0;
        n.input_elements["input" + 1 + "input"].value = standards.value1;
        n.input_elements["input" + 2 + "input"].value = standards.value2;
    } else if (type.toLowerCase() == "ntobin") {
        if (standards.value0 == null) {standards.value0 = 0};
        var n = new Node("Number to binary (8 bit)", "#88c", [["number", "input", true]], [["boolean", "bit 1", true],["boolean", "bit 2", true],["boolean", "bit 3", true],["boolean", "bit 4", true],["boolean", "bit 5", true],["boolean", "bit 6", true],["boolean", "bit 7", true],["boolean", "bit 8", true]], "", function(inp) {
            let bitstring =  (Math.min(255, Math.max(0,Math.round(inp[0]))) >>> 0).toString(2);
            let returnlist = new Array(8);
            returnlist.fill(false);
            bitlist = bitstring.split("").reverse();
            for (let i in bitstring) {
                let char = bitlist[i];
                if (char == 0) {
                    returnlist[i] = false;
                } else {
                    returnlist[i] = true;
                }
            }
            let length = returnlist.length;
            let fillength = 8-length;
            return returnlist.reverse();
        }, null, coords);
        n.input_elements["input" + 0 + "input"].value = standards.value0;
    } else if (type.toLowerCase() == "binton") {
        if (standards.value0 == null) {standards.value0 = 0};
        if (standards.value1 == null) {standards.value1 = 0};
        if (standards.value2 == null) {standards.value2 = 0};
        if (standards.value3 == null) {standards.value3 = 0};
        if (standards.value4 == null) {standards.value4 = 0};
        if (standards.value5 == null) {standards.value5 = 0};
        if (standards.value6 == null) {standards.value6 = 0};
        if (standards.value7 == null) {standards.value7 = 0};
        var n = new Node("Binary (8 bit) to number", "#88c", [["boolean", "bit 1", true],["boolean", "bit 2", true],["boolean", "bit 3", true],["boolean", "bit 4", true],["boolean", "bit 5", true],["boolean", "bit 6", true],["boolean", "bit 7", true],["boolean", "bit 8", true]], [["number", "input", true]], "", function(inp) {
            string = "";
            for (i of inp) {
                if (i) {
                    string += "1";
                } else {
                    string += "0";
                }
            }
            return [parseInt(string, 2)];
        }, null, coords);
        n.input_elements["input" + 0 + "input"].checked = standards.value0;
        n.input_elements["input" + 1 + "input"].checked = standards.value1;
        n.input_elements["input" + 2 + "input"].checked = standards.value2;
        n.input_elements["input" + 3 + "input"].checked = standards.value3;
        n.input_elements["input" + 4 + "input"].checked = standards.value4;
        n.input_elements["input" + 5 + "input"].checked = standards.value5;
        n.input_elements["input" + 6 + "input"].checked = standards.value6;
        n.input_elements["input" + 7 + "input"].checked = standards.value7;
    } else if (type.toLocaleLowerCase() == "memory") {
        if (standards.value0 == null) {standards.value0 = 0};
        if (standards.value1 == null) {standards.value1 = 0};
        if (node_data.memory == null) {node_data.memory = 0};
        var n = new Node("Memory node", "#00f", [["number", "Data in", true], ["boolean", "Control", true]], [["number", "Data out"]], `
        <p id="Node${node_id}StoredValue">Stored value: <b>${node_data.memory}</b></p>
        `, function(inp) {
            if(inp[1]) {
                this.node_data.memory = inp[0];
                document.getElementById(`Node${this.id}StoredValue`).innerHTML = "Stored value: <b>"+this.node_data.memory+"</b>";
                return [inp[0]];
            } else {
                document.getElementById(`Node${this.id}StoredValue`).innerHTML = "Stored value: <b>"+this.node_data.memory+"</b>";
                return [this.node_data.memory]
            }
        }, function() {
            if (this.node_data.memory == null) {
                this.node_data.memory = 0;
            }
        }, coords, node_data);
        live_data_nodes.push(n);
        n.input_elements["input" + 0 + "input"].value = standards.value0;
        n.input_elements["input" + 1 + "input"].checked = standards.value1;
    } else if (type == "time") {
        var n = new Node("Time node", "#00f",[], [["number", "time"]], "", function(inp) {
            let d = new Date();
            return [d.getTime()/1000];
        }, null, coords);
    } else if (type == "light") {
        if (standards.value0 == null) {standards.value0 = 0};
        if (standards.lightColor == null) {standards.lightColor = "red"};
        var n = new Node("Red light", "#f00", [["boolean", "Input", true]], [], `
        <svg width= "150px" height:"150px" preserveAspectRatio="xMinYMin meet" style="overflow: visible;">
            <defs>
                <filter id="f1" x="0" y="0">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="15" />
                </filter>
            </defs>
            <circle cx="50%" cy="50%" r="45%" fill="#500" id="node${node_id}light" filter="url(#f1)"/>
            <circle cx="50%" cy="50%" r="45%" fill="#500" id="node${node_id}lightfront"/>
        </svg><br>
        <select id="node${node_id}LightColor">
                <option value="red" style="background-color: Red">Red</option>
                <option value="orange" style="background-color: DarkOrange">Orange</option>
                <option value="yellow" style="background-color: Yellow">Yellow</option>
                <option value="green" style="background-color: Lime">Green</option>
                <option value="cyan" style="background-color: cyan">Cyan</option>
                <option value="blue" style="background-color: Blue">Blue</option>
                <option value="purple" style="background-color: #f0f">Purple</option>
                <option value="white" style="background-color: #fff">White</option>
        </select>
        
            `, function(inputs) {
                if (inputs[0]) {
                    if (document.getElementById(`node${this.id}LightColor`).value == "red") {
                        document.getElementById(`node${this.id}light`).setAttribute("fill", "#f00");
                        document.getElementById(`node${this.id}lightfront`).setAttribute("fill", "#f00");
                    } else if (document.getElementById(`node${this.id}LightColor`).value == "orange") {
                        document.getElementById(`node${this.id}light`).setAttribute("fill", "#f80");
                        document.getElementById(`node${this.id}lightfront`).setAttribute("fill", "#f80");
                    } else if (document.getElementById(`node${this.id}LightColor`).value == "yellow") {
                        document.getElementById(`node${this.id}light`).setAttribute("fill", "#ff0");
                        document.getElementById(`node${this.id}lightfront`).setAttribute("fill", "#ff0");
                    } else if (document.getElementById(`node${this.id}LightColor`).value == "green") {
                        document.getElementById(`node${this.id}light`).setAttribute("fill", "#0f0");
                        document.getElementById(`node${this.id}lightfront`).setAttribute("fill", "#0f0");
                    } else if (document.getElementById(`node${this.id}LightColor`).value == "cyan") {
                        document.getElementById(`node${this.id}light`).setAttribute("fill", "#0ff");
                        document.getElementById(`node${this.id}lightfront`).setAttribute("fill", "#0ff");
                    } else if (document.getElementById(`node${this.id}LightColor`).value == "blue") {
                        document.getElementById(`node${this.id}light`).setAttribute("fill", "#00f");
                        document.getElementById(`node${this.id}lightfront`).setAttribute("fill", "#00f");
                    } else if (document.getElementById(`node${this.id}LightColor`).value == "purple") {
                        document.getElementById(`node${this.id}light`).setAttribute("fill", "#f0f");
                        document.getElementById(`node${this.id}lightfront`).setAttribute("fill", "#f0f");
                    } else if (document.getElementById(`node${this.id}LightColor`).value == "white") {
                        document.getElementById(`node${this.id}light`).setAttribute("fill", "#fff");
                        document.getElementById(`node${this.id}lightfront`).setAttribute("fill", "#fff");
                    }
                    document.getElementById(`node${this.id}light`).setAttribute("r", "52%");
                    document.getElementById(`node${this.id}light`).setAttribute("filter", "url(#f1)");
                } else {
                    if (document.getElementById(`node${this.id}LightColor`).value == "red") {
                        document.getElementById(`node${this.id}light`).setAttribute("fill", "#500");
                        document.getElementById(`node${this.id}lightfront`).setAttribute("fill", "#500");
                    } else if (document.getElementById(`node${this.id}LightColor`).value == "orange") {
                        document.getElementById(`node${this.id}light`).setAttribute("fill", "#530");
                        document.getElementById(`node${this.id}lightfront`).setAttribute("fill", "#530");
                    } else if (document.getElementById(`node${this.id}LightColor`).value == "yellow") {
                        document.getElementById(`node${this.id}light`).setAttribute("fill", "#550");
                        document.getElementById(`node${this.id}lightfront`).setAttribute("fill", "#550");
                    } else if (document.getElementById(`node${this.id}LightColor`).value == "green") {
                        document.getElementById(`node${this.id}light`).setAttribute("fill", "#050");
                        document.getElementById(`node${this.id}lightfront`).setAttribute("fill", "#050");
                    } else if (document.getElementById(`node${this.id}LightColor`).value == "cyan") {
                        document.getElementById(`node${this.id}light`).setAttribute("fill", "#055");
                        document.getElementById(`node${this.id}lightfront`).setAttribute("fill", "#055");
                    } else if (document.getElementById(`node${this.id}LightColor`).value == "blue") {
                        document.getElementById(`node${this.id}light`).setAttribute("fill", "#005");
                        document.getElementById(`node${this.id}lightfront`).setAttribute("fill", "#005");
                    } else if (document.getElementById(`node${this.id}LightColor`).value == "purple") {
                        document.getElementById(`node${this.id}light`).setAttribute("fill", "#505");
                        document.getElementById(`node${this.id}lightfront`).setAttribute("fill", "#505");
                    } else if (document.getElementById(`node${this.id}LightColor`).value == "white") {
                        document.getElementById(`node${this.id}light`).setAttribute("fill", "#555");
                        document.getElementById(`node${this.id}lightfront`).setAttribute("fill", "#555");
                    }
                    document.getElementById(`node${this.id}light`).setAttribute("r", "45%");
                    document.getElementById(`node${this.id}light`).setAttribute("filter", null);
                }
            }, function() {
                document.getElementById(`node${this.id}LightColor`).onchange = function(e) {
                    if (document.getElementById(`node${this.id}LightColor`).value == "red") {
                        this.title = "Red light";
                    } else if (document.getElementById(`node${this.id}LightColor`).value == "orange") {
                        this.title = "Orange light";
                    } else if (document.getElementById(`node${this.id}LightColor`).value == "yellow") {
                        this.title = "Yellow light";
                    } else if (document.getElementById(`node${this.id}LightColor`).value == "green") {
                        this.title = "Green light";
                    } else if (document.getElementById(`node${this.id}LightColor`).value == "cyan") {
                        this.title = "Cyan light";
                    } else if (document.getElementById(`node${this.id}LightColor`).value == "blue") {
                        this.title = "Blue light";
                    } else if (document.getElementById(`node${this.id}LightColor`).value == "purple") {
                        this.title = "Purple light";
                    } else if (document.getElementById(`node${this.id}LightColor`).value == "white") {
                        this.title = "White light";
                    }
                    this.header.innerHTML = this.title;
                }.bind(this);

            }, coords);
        n.input_elements["input" + 0 + "input"].checked = standards.value0;
        document.getElementById(`node${n.id}LightColor`).value = standards.lightColor;
        document.getElementById(`node${n.id}LightColor`).dispatchEvent(new Event("change"));
        output_nodes.push(n);
    } else if (type == "lightrgb") {
        if (standards.value0 == null) {standards.value0 = 0};
        if (standards.value1 == null) {standards.value1 = 0};
        if (standards.value2 == null) {standards.value2 = 0};
        var n = new Node("RGB lighting", "#f00", [["number", "Red", true], ["number", "Green", true], ["number", "Blue", true]], [], `
        <svg width= "150px" height="150px" preserveAspectRatio="xMinYMin meet" style="overflow: visible;">
            <defs>
                <filter id="f1" x="0" y="0">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="15" />
                </filter>
            </defs>
            <circle cx="50%" cy="50%" r="50%" fill="#000" id="node${node_id}light" filter="url(#f1)"/>
            <circle cx="50%" cy="50%" r="45%" fill="#000" id="node${node_id}lightfront"/>
        </svg>


        `, function(inputs) {
            let inp = [];
            for (i of inputs) {
                if (i > 1) {
                    inp.push(255);
                } else {
                    inp.push(i*255);
                }
            }
            document.getElementById(`node${this.id}light`).setAttribute("fill", `rgb(${inp[0]}, ${inp[1]}, ${inp[2]})`);
            document.getElementById(`node${this.id}lightfront`).setAttribute("fill", `rgb(${inp[0]}, ${inp[1]}, ${inp[2]})`);
        }, null, coords);
        n.input_elements["input" + 0 + "input"].value = standards.value0;
        n.input_elements["input" + 1 + "input"].value = standards.value1;
        n.input_elements["input" + 2 + "input"].value = standards.value2;
        output_nodes.push(n);
    } else if (type == "numdisp") {
        if (standards.value0 == null) {standards.value0 = 0};
        var n = new Node("Number displayer", "#f00", [["number", "Input", true]], [], `
        <h1 id="node${node_id}NumberOutput">0</h1>
        
        `, function(inputs) {
            document.getElementById(`node${this.id}NumberOutput`).innerHTML = inputs[0];
        }, null, coords)
        n.input_elements["input" + 0 + "input"].value = standards.value0;
        output_nodes.push(n);
    }

    n.type = type.toLowerCase();
}





Logics_version = 1.4;
project_name = "Logics project";

function makeFile() {
    var text = "This is a Thijmer Logics file (thijmer.nl).\n";
    var saveobject = {};
    saveobject.version = Logics_version;
    saveobject.time = new Date().getTime() //Time of making the save
    saveobject.settings = {};
    saveobject.settings.live_data_nodes_update = live_data_nodes_update;
    saveobject.settings.title = project_name;
    saveobject.settings.connectorVisualisation = connectorVisualisation;
    saveobject.settings.live_data_nodes_update = live_data_nodes_update;
    saveobject.settings.zoom_factor = zoom_factor;

    //Saving the actual stuff
    saveobject.nodes = [];
    for (let x in all_nodes) {
        let node = all_nodes[x]
        let node_save = {};
        node_save.type = node.type;
        node_save.inputs = [];
        node_save.specificdefaults = {}; //Contains node-specific options like if a checkbox node is checked or on which operation mode a math node is.
        { //Do the node-specific stuff
            if (node.type == "checkbox") {
                node_save.specificdefaults.checked = document.getElementById(`node${node.id}checkbox`).checked;
            } else if (node.type == "number input") {
                node_save.specificdefaults.number = document.getElementById(`node${node.id}numberInput`).value;
            } else if (node.type == "compare" || node.type == "math" || node.type == "round" || node.type == "sincostan" || node.type == "colorconvert") { //Is the node in the list of nodes with a multi-function chooser?
                node_save.specificdefaults.operationtype = document.getElementById(`node${node.id}OperationType`).value; //Set the switch to the right value.
            } else if (node.type == "light") {
                node_save.specificdefaults.lightColor = document.getElementById(`node${node.id}LightColor`).value;
                console.log(node_save.specificdefaults.lightColor = document.getElementById(`node${node.id}LightColor`).value);
            } else if (node.type == "color input") {
                console.log(`node${node.id}color`);
                node_save.specificdefaults.color = document.getElementById(`node${node.id}color`).value;
            }




        }

        node_save.input_connections = {}; //Object containing all of the IDs of CONNECTED child nodes
        for (let inpN in node.inputs) {
            inptype = node.inputs[inpN][0];
            console.log(inptype);
            if (inptype == "boolean") {
                node_save.inputs.push(node.input_elements["input" + inpN + "input"].checked);
            } else if (inptype == "number") {
                node_save.inputs.push(node.input_elements["input" + inpN + "input"].value);
            }
            
            console.log(node.input_elements["input" + inpN + "input"].value);

            if (inpN in node.input_connections) {
                node_save.input_connections[inpN] = [all_nodes.indexOf(node.input_connections[inpN][3]), node.input_connections[inpN][0]] //For each of the input connectors the child node it is connected to and the output connector of it it is connected to.
            }
            
        }
        node_save.coords = [node.node_container.style.left,node.node_container.style.top];
        node_save.node_data = node.node_data;
        node_save.id = x; //ID used for identifiing the node while reconstructing the network.
        saveobject.nodes.push(node_save);
    }
    var textsave = text+JSON.stringify(saveobject);
    console.log(textsave);
    download(`${project_name}.tlgx`, textsave);
    
}
//Node.input_connections[] is a variable which contains data for each input socket about what it is connected to. [Output socket Child node, coords of the child connector, child node behaviour, node itself.]
function loadFile(datastr) {
    EmptyWorkspace(); //Start the new file with an empty workspace

    var datastr = datastr.split("\n").slice(1).join("\n");
    console.log(datastr);
    var saveobject = JSON.parse(datastr);
    try {
        live_data_nodes_update = saveobject.settings.live_data_nodes_update;
        project_name = saveobject.settings.title;
        connectorVisualisation = saveobject.settings.connectorVisualisation;
        live_data_nodes_update = saveobject.settings.live_data_nodes_update;
        if (saveobject.settings.zoom_factor != null) {
            zoom_factor = saveobject.settings.zoom_factor;
        } else {
            zoom_factor = 1;
        }
    } catch {
        console.log("The document lacks some of the newer settings. Is it an old document?");
    }
    container.onwheel({"deltaY" : 0, "preventDefault" : function() {}});

    //Load the values in the inputs of the nodes and the node-specific default values, e.g. if a checkbox node is checked
    for (let x in saveobject.nodes) {
        let node = saveobject.nodes[x];
        let standards = node.specificdefaults;
        for (inpn in node.inputs) {
            inp = node.inputs[inpn];
            standards["value"+inpn] = inp;
        }

        if (saveobject.version < 1.2) {
            node.coords[0] = parseInt(node.coords[0].replace("px", ""))+9000+"px";
            node.coords[1] = parseInt(node.coords[1].replace("px", ""))+5000+"px";
            console.log("This is an old document. Changes have been made while loading. If you save the file. it will be updated.");
        }

        createStandardNode(node.type, node.coords, node.node_data, standards) //type, coords, data, standards;
    }

    

    for (let x in saveobject.nodes) {
        let nodedatafromsave = saveobject.nodes[x];
        let node = all_nodes[x];
        for (let inpN in node.inputs) {
            if (inpN in nodedatafromsave.input_connections) {
                node.input_connections[inpN] = [nodedatafromsave.input_connections[inpN][1], [0,0], all_nodes[nodedatafromsave.input_connections[inpN][0]].behaviour, all_nodes[nodedatafromsave.input_connections[inpN][0]]];
                if (!all_nodes[nodedatafromsave.input_connections[inpN][0]].outputcoords_dependant_nodes.includes("node")) {
                    all_nodes[nodedatafromsave.input_connections[inpN][0]].outputcoords_dependant_nodes.push(node);
                }              
            }
        }

    }


    for (let node of all_nodes) {
        node.getConnectorPositions();
    }

    for (let node of all_nodes) {
        node.drawInputConnectorLines();
        node.updateIsRecursive()
    }
}



function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
}


