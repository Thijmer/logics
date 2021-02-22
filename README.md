# logics
Online client-side node editor

Logics is a program that lets you visualize mathematical formulas by building as a node network. It is inspired on Blender's material nodes.

![Logics screenshot trafficlight example](https://thijmer.nl/images/Logics_screenshot_1.png)

# Explaination
Nodes make up a network and are resembled as squares with a UI in them. They are connected using wires that transmit data.
Nodes perform an operation to the data, such as addition or converting a number to binary.
The data comes in on the left side of the node and comes out on the right side.
Zooming in and out and moving the viewport is also possible, allowing for networks much larger than your screen!

# Limitations
 - This webapp only does not work on mobile devices and has some compatibility issues with non-chromium-based browsers, but is still usable on them.
 - A node has a fixed number of input/output sockets. An addition node can add just two numbers, and  you have to chain them together if you want to add more numbers.

# Nodes in Logics
### Input nodes
 - Checkbox (Outputs Boolean)
 - Number input (Outputs number)
 - Color input (Outputs three numbers (R,G,B) ranging from 0-1)

### Boolean operations
 - Invert (1 Boolean in, 1 Boolean out)
 - Logical or gate (2 Booleans in, 1 Boolean out)
 - Logical and gate (2 Booleans in, 1 Boolean out)
 - Logical xor gate (2 Booleans in, 1 Boolean out)

### Number operation
 - Compare (2 numbers in, 1 Boolean out)
 - Math (2 numbers in, 1 number out)
 - Sine, Cosine or Tangent (1 number in, 1 number out)
 - Round (1 number in, 1 number out)
 - Mix (3 numbers in, 1 number out)
 - Color convert (3 numbers in, 3 numbers out)
 - Number to bits (1 number in, 8 Booleans out)
 - Bits to number (8 Booleans in, one number out)

### Fourth dimension
 - Memory node
 - Time node

### Output nodes
 - Colored light (1 Boolean in)
 - RGB lighting (3 numbers in (R,G,B) ranging from 0-1)
 - Number displayer (1 number in)

You can check the live version of the web app on [Thijmer online](https://thijmer.nl/logics/)
