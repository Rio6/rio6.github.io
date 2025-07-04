# 60Hz Processor Design in Factorio {title}
## 2023-05-07 {date}
The following is written for my WKRPT-300 report.

[toc]

<!-- {{{ Summary -->
## Summary
The Turing complete circuit network in Factorio has inspired its players to make
many fun creations over the years. One of the popular circuits that were created
are general purpose computing circuits or CPUs. This report describes a CPU
design in Factorio that achieves an operation speed of 60Hz (which is the
fastest possible speed to run in game) using a custom EPIC style RISC
instruction set and Harvard architecture.

Two primary constraints when designing are the game update speed and number of
connections per combinator. Extra combinators often needs to be used to get
around the connection limit without additional penalties in time.

The core of the CPU are registers. These registers can latch data from different
sources and from each other using control signals.  All the mathematical
operations are done in the ALU. In this design, the ALU can be used by writing
values to operand registers and reading the result of the operations back to a
register.

Unconditional jumps is identical to a `mov` instruction with destination
being `jmp`. A conditional jump requires additional circuits to determine
of a jump should be performed. Both type of jump has a delayed branching, where
the instruction immediately behind the jump instruction is always executed. This
allows programmer or compiler to minimize pipeline stalls in absence of branch
prediction.

The code of the CPU is stored in ROM constructed using constant combinators.
Instructions are stored in them as decoded signals to remove the need of decoder
in the circuit. The design follows the Harvard architecture where the
instructions are on a separate address space as other peripherals. This allows
instructions to be fetched in parallel to normal data access on the bus.

The CPU is connected to a bus controlled by a few registers. A RAM, a display,
and a user input device are connected to the CPU via this bus. This allows the
CPU to communicate with the user and also store data that does not fit within
the limited registers.

An assembler written in Python is made for this CPU. It supports special syntax
for specifying parallel instructions, as well as generating ROM for both
instructions and data. The assembler also decodes the instructions into
signals directly. The output of this assembler is a Factorio blueprint string
containing constant combinators as ROM.

<!-- }}} -->

<!-- {{{ Introduction -->
## Introduction
The nature of Turing completeness in Factorio has invited many processor designs
being created in the game [[1]](#comp-0)[[2]](#comp-1)[[3]](#comp-2), with each
design having different design goals and constraints. This report introduces yet
another processor design that focuses and execution speed, while keeping the
instruction set usable for general purposes.

### Factorio Circuit Network
Factorio is a game about building factories. In the game, the player need to
manage resources and build processing facilities to achieve the end goal of the
game [[4]](#factorio). One of the aspect in the game is its circuit network,
allowing players to control the operation of their factories. The core part of
the network are arithmetic combinators, decider combinators, constant
combinators, and two colours of wires carrying multiple channels of data between
combinators. A detailed explanation of circuit mechanics can be found in my
previous report [[5]](#factorio-ram).

Being an open ended game, many players have dedicated majority of their play
time creating logic circuits in the game. Creations such as Tetris, Pong, snake,
and even a 3D renderer have all been made before
[[6]](#comp-3)[[7]](#comp-4)[[8]](#comp-5). The ability for the circuit network to
simulate any sequential logic naturally leads to the development of general
computing circuits, also known as CPUs.

### CPU Basics
A central computing unit, CPU, are designed to handle wide variety of general
computing tasks. CPUs are distinct from most sequential logics in that it does
not require the connections between logic elements to be rewired to solve
different problems. Instead, a series of instructions, or *software*, can
be written for each purpose.

### Clock Speed {secclock}
A big factor that determines the speed of real life CPUs is the clock speed. A
clock in digital circuit is used to synchronize data transfer between registers;
higher the clock speed, the faster data can move inside the circuit. In real
life, CPU clock clock speeds can go up to GHz with thermal dissipation being the
main limiting factor alongside with other factors like transmission delays
[[9]](#cpuspeed). In Factorio, it is different, as the default update (or
*tick*) speed in the game is limited to 60Hz only, the fastest possible CPU
design in the game would consequently be limited to this speed. On a positive
side, since all data gets updated synchronously at the same speed, it removes
the need of an explicit clock signal.

### Execution Cycle
A typical CPU follows a fetch-decode-execute execution cycle. Each cycle, the
CPU **fetches** the next instruction from the memory, **decode** it into
control signals, and **execute** the instruction based on the decoded control
signals. For this Factorio CPU design, the capability of holding multiple
signals in a single wire is utilized to store decoded instructions directly in
memory storage, simplifying the cycle to be fetch-execute only.

### Processor Architecture
Reduced instruction set computer (RISC) and complex instruction set computer
(CISC) are the two instruction architectures used in CPUs. RISC CPUs support
less instructions, but each instructions takes less cycles, and requires less
resources to complete decode. As opposed, CISC CPUs have more complicated
instructions, requiring more resource to decode and cycles to complete, but
reduces program size. Since instruction decoding is
offloaded to the assembler for this Factorio CPU, either architecture can be
implemented without any hardware change.

Regardless, a RISC architecture is still used for this design. Since RISC is a
load-store architecture, where accessing memory is done through explicit
instructions rather than implicit addressing mode, the program can better
optimize memory access in the code [[10]](#loadstore). This is advantageous
particularly in this system, as the memory speed is also limited to game's 60Hz
update speed, unoptimized memory access can slow down the program significantly.

### Explicitly Parallel Instruction Computing {secepic}
EPIC style architecture is a design philosophy to achieve instruction level
parallelism (ILP). The code idea of EPIC is to move the complicated work of ILP,
like instruction reordering, instruction dependency, to software (ie, the
compiler), greatly reduce the complexity in the hardware [[11]](#epic). For this
CPU design, since the program in ROM is already decoded, executing
non-conflicting instructions can be stored in the same address to be executed in
parallel. This way, ILP can be easily be achieved using special assembler
syntax. For example, the `inc a` instruction and `mov b 0` do not
share the same decoded control signal, therefore both instructions can be stored
in together, and gets loaded and executed simultaneously.
<!-- }}} -->

<!-- {{{ Problem Definition -->
## Problem Definition
This section describes the problem definition of the report, including the
design goal, constraints, and criteria of the design.

### Design Goal
The goal of this report is to demonstrate a CPU design implemented in Factorio
circuit network, optimizing cycles (ticks) per instruction and parallelism to
minimize the impact of the slow game update speed. The design does not attempt
to emulate any existing ISAs, or have high level programming support. Only a
low level assembler will be implemented to create simple programs that can be
run on the CPU.

### Constraints and Criteria
There are two main constraints when implementing digital circuit in Factorio.

First is the update speed. As mentioned in [Clock Speed](#secclock), the default
update speed in game is only at 60Hz. It is the fastest rate any object in game
can can change state, including the circuit network. While the game speed can be
increased through game editor (and it is a useful feature to run the game tick
by tick for debugging), doing so does not change the relative speed between the
game environment and the circuits. As the CPU is required to run at this fastest
speed, every part of the circuit needs to be designed with this speed in mind.
For more, the number of combinators a signal goes through should also be
minimized to reduce latency.

Second is the limited number of wire colours. In the game, when two wires of the
same colour connected together, they carry the same signals; on contrary, two
wires of different colour can connect together while carrying independent
colour. This is especially limiting when signals coming from different sources
needs to be fed into one combinator. In low speed logic, this can be easily
solved using another combinator to isolate the signals, but for high speed
circuits, often duplicated combinators and tricks are needed to implement the
same logic without time penalties.
<!-- }}} -->

<!-- {{{ Processor Design -->
## Detailed Processor Design
The processor design is inspired by Ben Eater's Youtube playlist *Building
an 8-bit breadboard computer!* [[12]](#beneater). The core of the processor
consists of numerous registers, some of them are used to control other
components of the processors, like the arithmetic unit and data bus. The
instruction ROM is on a separate bus and address space than the data, allowing
instructions to be read continuously in parallel with memory access from the
code.

Figure 1 shows the screenshot of the overall design in the game.

<center>
![](img/factorio-cpu/overview.png =80%x*)

Figure 1 Overall Processor in Game
</center>

<!-- {{{ Registers -->
### Registers {secregister}
The core of the processor is made of registers. All of the instructions specify
how the data is moved around these registers.  Each register has their own
control signal to specify conditional loading from different sources, like other
registers, bus data, arithmetic result, etc. A list of registers and all
supported data source can be found in Table 1 and Table 2.

Registers `a, b` are arithmetic operands. They are connected to the input
of the ALU, allowing arithmetic operations and comparisons to be done on these
two registers.

`wa, wd, ra` are bus registers write-address, write-data, and
read-address. By setting appropriate values to these registers the code can
read and write values to the bus, and through it access peripherals like the
RAM, ROM, display, etc.

`x, y, z` are general use registers and can be used for anything.

`jmp` is the jump register, also known as program counter. This register
is different from others that ever tick it automatically increments when no
control data is present. This register is connected directly to instruction ROM
to fetch the next instruction to execute.

Figure 2 shows a general construction of a register.
<center>
<span style="filter: invert(0.87) hue-rotate(180deg)">
![](img/factorio-cpu/tikz-0.png =70%x*)
</span>

Figure 2 Sample Register Construction
</center>

Both the red and green wire on the output side contains the value of the
register. Some decider combinators, like `A = -1` in this example, are
duplicated to work around the limited number of wires. This control increments
the value stored in the register, thus requiring a feedback input and an
external `D ⇐ 1` input. On top of the control input, 3 total
inputs would be required, and since the number of wires per combinator is
limited to 2 only, a second combinator is needed to achieve the desired
behaviour without additional delay.

The duplication of only some combinators causes a problem. For starter, the
control line can also carry the data signal `D`. Without proper filtering,
undesired value can "leak" through the `D ⇒ D` conditions in the
combinators and corrupting the register value. Filtering can be easily
implemented by adding a signal `D = -D` arithmetic combinator in parallel,
effectively subtracts the undesirable data out. However, with some combinators
being duplicated, the "leaked" amount would vary depending on the value of
control signal `A`. To solve this a second `D = -D` filter and a `A ≥ 0`
decider combinator are added. This way, non-duplicated control signals can be
assigned with values `A > 0`, canceling the effect of the second filter. For
duplicated control signals assigned to have `A < 0`, the second filter becomes
in effect and filter out the additional leaked data correctly.

One exception to the above is the load-immediate control, `A = 1` in this
example. In this case, the data signal `D` on the control line *is*
desired, therefore duplicated combinators are used but it has a non-negative
control signal value. It can also be viewed as the first combinator cancels the
filtering, while the second combinator outputs the data.

An absence of control signal indicates the data in the register should be held
the same. This is easily achieved by one decider combinator with `A = 0`
condition with a feedback input.

The register data is available on both red and green wires on the right. Being
able to access the register from either wire is important to the system, as it
allows direct connections from the register to other components of either colour
as input without additional combinators.

Some typical operations for this example register:
- Load immediate 10 into the register:
    1. Control sends `A = 1, D = 10`
    2. 1st combinator outputs `-10`
    3. 2nd combinator outputs `-10`
    4. 3rd combinator outputs `10`
    5. 7th combinator outputs `10`
    6. 8th combinator outputs `10`
    7. Total of `D = -10 - 10 + 10 + 10 + 10 = 10` is loaded
- Keeping the previous value `D = 10`, while a random `D = 5` is in the input
    1. Control contains random data `D = 5`
    2. 1st combinator outputs `-5`
    3. 2nd combinator outputs `-5`
    4. 3rd combinator outputs `5`
    5. 4th combinator outputs `15` as its input contains both the feedback `D = 10` and the undesired `D = 5`
    6. Total of `D = -5 - 5 + 5 + 15 = 10` is kept
- Increment the register value `10` by one
    1. Controls sends `A = -1`
    2. 5th combinator outputs `10` as it is the feedback
    3. 6th combinator outputs `1` from the constant combinator
    4. Total of `D = 10 + 1 = 11` is stored in the register

Note that the control signal for this example register is `A`, but each
different registers would have a different signal. The signal `D` is used as
data for all registers. For more, there can be more data sources than this
example by adding more decider combinators in parallel with different control
signal conditions.
<!-- }}} -->

<!-- {{{ ALU -->
### Arithmetic Logic Unit
The arithmetic logic unit (ALU) handles all the mathematical operations in the
processor. All the operations supported by Factorio arithmetic combinators are
implemented, this includes addition, subtraction, multiplication, division,
remainder, exponentiation, bitwise and, bitwise or, bitwise xor, and
comparisons (`><=≠≥≤`). Unlike most instruction sets where there are
dedicated instructions for these operations, in this design the result of each
operation are computed constantly from registers `a, b`, and their
results can be read back to any register when finished. This design makes it easy
to pipeline same mathematical operations in the code, minimizing stalls from
waiting for calculations to finish.

A sample construction of the ALU can be found in Figure 3.
<center>
<span style="filter: invert(0.87) hue-rotate(180deg)">
![](img/factorio-cpu/tikz-1.png =70%x*)
</span>

Figure 3 Sample ALU Construction
</center>

For most operations, a minimum of 2 combinators are needed, one to convert data
signal `D` from the two input into different signals `A, B`, so they can be fed
into a second combinator to perform the actual operation. This introduces a 2
tick delay to perform these operations. Some optimization can be done using
Factorio's implicit addition. Addition can be done without any additional
combinator by having the destination register load both register `a` and
`b` together. For subtraction, one of the input signal would need to be
inverted, and the other delayed to match the timing. Adding the resulting
signals together effectively produces the difference between the two. This
results in one tick delay for subtraction, which is still better than the 2
ticks delay of other operations.
<!-- }}} -->

<!-- {{{ Jump -->
### Jump Logic
Jump instructions allows control flows, usually in the forms of if statements,
loops, function calls at the higher level language, to be implemented. They can
be categorized into two types: conditional and unconditional jumps.

Unconditional jumps are simple move instructions to the jump register. The
implementation of it is identical to any register load as described in
[Registers](#secregisters). Any value loaded into the register would get used
next tick to fetch the next instruction.

Conditional jumps requires more complexity. The processor would need to select
the condition to use, evaluate it based in registers, and use the result to
determine if a jump should be performed. Figure 4 shows its
construction.

<center>
<span style="filter: invert(0.87) hue-rotate(180deg)">
![](img/factorio-cpu/tikz-2.png =90%x*)
</span>

Figure 4 Jump Logic
</center>

In this example, signal `J` is used for `jmp` register control, so for
example, loading `J = 1, D = 10` would load 10 into the jump register,
effectively jump the program execution to address 10. A construction similar to
other register, using signal `K`, can be seen in the figure. The difference
being that it operates on the `jmp` register control signal `J` instead
of the usual data signal `D`, and the output of combinators are connected
directly to the control line.  The input of this construction are connected to
an array of combinators that outputs `J = 1` when different conditions are met.
Together, the signal `J=1` is conditionally asserted to the control line, which
in turns creates conditional jump.

For example, to jump to address `10` when register `a` is 0, one would
send control signal `K = 20`. If the condition is true, `J = 1` would be output
by the `D = 0` combinator, and gets passed to the control line by the `K = 20`
combinator. If in the following tick, another `D = 10` is asserted to the
control line, its value would be loaded into `jmp` and the jump succeeds.
On the other hand, if the condition is false, then the `K = 20` combinator would
output `J = 0`, and a lone `D = 10` on the control line would have no effect.

Both conditional and conditional jumps implements delayed branching, which comes
inherently from the fetch-execute pipeline. The instruction immediately behind
the jump instruction (the delayed slot) would be executed regardless if the jump
is taken. This is also a common approach used by RISC many processors to allow
the compiler or programmer to specify static jump prediction and minimize
pipeline stalls in absence of a complex branch prediction circuit
[[13]](#delayslot).
<!-- }}} -->

<!-- {{{ ROM -->
### Program Storage {secprogstore}
The program is stored in read only memory (ROM) constructed using constant
combinators. By using the property that multiple signals can exist on the same
wire or combinator, each constant combinator can store the decoded form of one
or more instructions. This results in a compact and high instruction throughput
ROM design. This design follows the Harvard architecture, where the instructions
are on a separate address space to other peripherals [[14]](#harvardarch), eg.
RAM, with a direct connection from `jmp` register to the ROM addressing
line. This way, the instruction can be constantly fetched every single tick in
parallel to data access. Figure 5 shows the construction of ROM
containing program that computes the Fibonacci sequence.

<center>
<span style="filter: invert(0.87) hue-rotate(180deg)">
![](img/factorio-cpu/tikz-3.png =70%x*)
</span>

Figure 5 Sample Program Stored in ROM
</center>

<!-- }}} -->

This program consists of 6 instructions occupying 4 ROM cells (or 3, as the last
`noop` is not really necessary). Three of the instructions do not have
any conflicting signals, so they resides in the same ROM cell. The `jmp`
register increments by one by itself each tick, loading decoded instructions in
each cell sequentially to executed. The three instructions in the same cell
would be executed in parallel.

The decider combinators are used to activate each cell based on the value of
`jmp`. Note the conditions are not sequential like `D = 1, D = 2, ...`.
This is because the `D` signal from the constant combinator adds to `jmp`.
This extra value needs to be compensated in the decider combinator conditions.
For example, the first cell contains the signal `D ⇐ 1`, and the
condition `D = 2`. This way, when `jmp` contains `D = 1`, it adds to the
content of the constant combinator to `D = 2` and activates the cell.

The constant combinator in the last cell contains no signal. It is to represent
the `noop` instruction. In practice, it is not required and the program
would run the same way without it.
<!-- }}} -->

<!-- {{{ Peripherals -->
### Peripherals
The registers, ALU, and jump logic forms the main part of the computer, while
other components, like RAM, display, and input device are peripherals. The
processor controls and communicates with the peripheral through a peripheral
bus. The bus operates full-duplex at one read/write per tick (60Hz) using 4
wires. Three of the wires connects to the `wa, wd, ra` registers, and the
4th wire connects one of the register inputs. Values can be written to
peripherals by writing address to `wa`, then data to `wd`, and
read from them by writing address to `ra`. The specific values and
timings differs between each peripheral.

<!-- {{{ Memory -->
#### Memory {secram}
An exact copy of the instruction ROM described in [Program Storage](#secprogstore) is
also present on the data bus. This ROM can be used by the assembler to store
data that are alongside the program. Since ROMs are read only, only the read
address and read data lines are connected.

For read-write memory, a random access memory (RAM) is available. The RAM design
used is based on my previous report Multi-port Random Access Memory in Factorio
[[5]](#factorio-ram). The RAM is wired to all 4 write address, write data, read
address, and read data lines, providing interface for the CPU to access the
data. Figure 6 shows a RAM construction, including the first and
last memory cell.

<center>
<span style="filter: invert(0.87) hue-rotate(180deg)">
![](img/factorio-cpu/tikz-4.png =90%x*)
</span>

Figure 6 Sample RAM Construction
</center>

<!-- }}} -->

On the top, a series of `A + 1 ⇒ A` combinators connected together to
automatically assign each cell a unique address, which can be offset using the
first constant combinator (10 in this case). This combinator string makes
expanding the RAM as easy as appending the same cells to the end.

As with registers and ROM, a `-D ⇒ D` combinator is used in the
circuit to filter out undesired data signal `D`. To ensure that the filter only
applies to the address range of the RAM, two `D < A` and `D > A` decider
combinators are connected to the first and last address of the RAM. The two
combinators cancels the effect of the filter when non of the RAM cells are
addressed thus no undesired data is emitted.

The core of each cell is a `W ≠ A` combinator with a looped-back input, which
forms a register. Data is kept in this register as long as the `W` signal is not
the address of the cell. When it is, the register is reset and new data is
loaded via `W = A` decider combinator.

A `D ⇒ W` register at the beginning of the cell converts `D` signal on
the `wa` line to `W` signal. This is required so the address signal does
not add to the `wd` write data signal, corrupting them both. As a side
effect, when writing to the RAM, write address will need to be available one
tick before write data. Since loading immediate values to registers often
contain conflicting control signals, not requiring two registers to be loaded in
the same tick can actually simplify the code.

The value of the core register connects to a `D + A ⇒ B` arithmetic
combinator. The `B` signal is used to compensate cell addressing for the output.
Similar to the ROM, the `D = B` combinator that outputs the cell value based on
read address receives `D` signal from both the address line and the stored data.
By using the sum of stored data and cell address for comparison, the cell can be
correctly addressed. A dummy `D ⇒ D` combinator is connected in
parallel to synchronize the stored data with this sum, ensuring the stored data
and the new corrected address value reaches the output combinator at the same
time.

<!-- }}} -->

<!-- {{{ Graphics -->
#### Graphical Display Output
The graphical output of this computer are built using arrays of lamps. There are
two parts: the display controller and the lamp array. The controller contains a
bitmap decoder, bitmap RAM, and colour decoder. The lamp arrays consists of 64
memory cells with 29 lamps connected to each. Both the RAM and lamp array
registers can be written to from the bus, but can not be read.

A 32 bit integer can store any glyph that needs to be displayed in a cell.  The
bits are decoded into signals `0, 1, ..., 9, A, B, ..., Z`, where the sign
bit (which is also the MSB) of each signal determines whether a lamp should turn
on or off, and all other bits are ignored. This reduces decoding into single bit
shift combinator for each signal. Testing the sign bit can be done by checking
if it is less than 0.

The decoded bitmap is stored in a multi-signal RAM [[5]](#factorio-ram). This RAM
variant allows multiple signals to be stored at the same address. When data is
written to the display cells, the lower 28 bit of that data is used as address
to look up corresponding bitmap from the RAM.  The upper 4 bit of display data
is used to carry colour information. By shifting the bits down and compare it to
a lookup table, the special colour signals are output to change the colour of
the cell.

In addition, the beginning of the RAM contains a register to hold an address
offset. This is useful for storing ASCII bitmaps, where the first printable
character does not have a value of 0.

Figure 7 shows the display controller.

<center>
<span style="filter: invert(0.87) hue-rotate(180deg)">
![](img/factorio-cpu/tikz-5.png =100%x*)
</span>

Figure 7 Video RAM and Graphics Controller
</center>

On the top left of the diagram, the arithmetic combinators with bit shifts are
the bitmap decoders. They shift the input data such that the sign bit of each
output signal contains each bit of the input data.

The second column at the top of the diagram is the RAM offset register. It
contains a writable register with its value negated and added to the address
line of the bitmap RAM, effectively offsets the base address of the RAM.

The right part of the diagram is the bitmap RAM. It is similar to the general
use RAM described in [Memory](#secram), except it operates on the special
`ALL` signal, with two additional combinators `-X ⇒ X` and `-W
⇒ W` filters to cancel the undesired data in the output from the use
of `ALL`.

The lower part of the diagram contains combinators used to delay and synchronize
write address from the bus, so the decoded bitmap and display address output at
the same tick for the display cells.

Figure 8 shows one cell of the display.

<center>
<span style="filter: invert(0.87) hue-rotate(180deg)">
![](img/factorio-cpu/tikz-6.png =100%x*)
</span>

Figure 8 Lamp Display Cell
</center>

The display cell is a simple writable register with hard-coded address (0 in
this example). The register uses the `ALL` signal and can hold multiple
signals, thus a `-W ⇒ W` filter is added. The register is connected to
29 lamps, each of them tests the sign bit of different signals by checking if
they're negative. The `ALL` signal also forwards the special colour
signals as well, which the lamps reads and emit the corresponding colour in
game.

Figure 9 shows the display working in game.

<center>
![](img/factorio-cpu/display.png =65%x*)

Figure 9 Lamp Display in Game
</center>

<!-- {{{ User Input -->
#### User Input
There are many ways in Factorio for players to interact with the circuit
network, including going through gates, rotating inserters, and dropping items
on belts or chests, or editing the combinators directly. Currently, a chest
based solution is included that allows the player to trigger input values by
dropping items in different chests. The in-game view of this chest input is
shown in Figure 10.

<center>
![](img/factorio-cpu/input.png =65%x*)

Figure 10 User Input with Chests
</center>

For this design, active provider chests are arranged in a grid. A roboport is
placed nearby containing logistic bots to remove items dropped by the user. Red
wires connect chests in each column and green wires connect chests in each row.
The chests are set to output signal corresponding to their contents. Each row
and column are connected to a rising edge detector. This way, when the number of
items in a chest increases, signal is emitted containing information on the row
and column of the chest. The design of the edge detector is shown in Figure 10.

<center>
<span style="filter: invert(0.87) hue-rotate(180deg)">
![](img/factorio-cpu/tikz-7.png =90%x*)
</span>

Figure 10 Rising Edge Detector
</center>

The combinators at the bottom receive the latest signal from the chests and a
delayed signal from the top combinator. When the chest input is incremented, it
becomes greater than the delayed value and a signal `A` is emitted. The value of
`A` is decremented by 1 per column, and by 8 per row. The value is always
negative to avoid triggering the `EACH > C` condition by `A` signal.
The input register is shown in Figure 11.

<center>
<span style="filter: invert(0.87) hue-rotate(180deg)">
![](img/factorio-cpu/tikz-8.png =90%x*)
</span>

Figure 11 User Input Register
</center>

There are a few extra properties for this register: the signal stored is
different than the signal input, the value stored is the negative of the input
value, and it clears the old value automatically when new signal is available.

The `A = 0` combinator with loop back input stores the value of the register.
When signal `A` contains any non-zero value, the combinator is disabled and
value is cleared. The `-A ⇒ D` combinator then emit the converted
value in `D` signal which gets stored as new value when input `A` signal is
deasserted.

The `D = W` combinator is used to reset the register. When the condition is
triggered, a `A = -1` signal is emitted and it disables the `A = 0` register,
effectively clears the register. This reset input is connected to the same
addressing line as the read addressing combinators (`D ⇒ R`). This
way, the register is cleared when the value is read. The constant combinator `W
⇐ 1000` is used to set the address of the register.

<!-- }}} -->

### Assembler
The purpose of an assembler is to takes a list of human readable instructions
and convert them into machine readable format [[15]](#bottomup). For this report,
a simple assembler is written to generate a Factorio blueprint string containing
decoded instructions in ROM cells as described in [Program Storage](#progstore).

Different sections of the assembly file can have different modes, separated by
`.<mode>` directive. Two modes `.data` and `.code` are
supported.  In `.data` sections, each line is interpreted as constant
values. These values are stored in the data ROM on the peripheral bus and can be
accessed using the `ra` register.

In `.code` sections, each line is interpreted as instructions. Some
instructions can contain operands to specify the source and destination of the
operation. A list of instructions can be found in Table 1.

The assembler supports special syntax to better aid the EPIC philosophy the
processor follows (see [Explicitly Parallel Instruction Computing](#secepic)). All instructions with
destination operands can have multiple registers as the destination. For
example, the instruction `inc a,b` increments both register `a, b`
in one operation. In addition, an instruction can be specified to run in the
same tick as the next instruction by appending a backslash
`\` to the end, provided they don't contain conflicting
control signals.

An example of the assembly program can be found in [Code Demo](#sec:codedemo).

<!-- }}} -->

<!-- {{{ Conclusion -->
## Conclusion
The versatility of Factorio's circuit network makes it possible to create a
general computing circuit. However, challenges still exist in implementations,
considering the constraints given. Factors like clock speed and wire limit
create interesting engineering problems. Techniques such as parallel processing
and circuit duplication need to be employed to maximize the execution speed.

By using a custom processor architecture and instruction set, it is relatively
easy to create a fast circuit with relatively few resources. As consequence,
existing compilers can not be used for high level languages such as C. For more,
it lacks hardware support for a lot of common features such as stack pointer or
context switching. Overall, this report is created for demonstration and
education, and the design may not be practical for any use in game or in real
world.

For future work, defining an application binary interface (ABI) for the
processor would be the foundation for any more complex programming. Only with a
standardized interface for function calls, parameter passing, stack usage, etc.,
can different compilers tool chains target this custom architecture.

<!-- }}} -->

<!-- {{{ List of Instructions -->
## List of Instructions and Registers
Table 1 List of Instructions Supported by Assembler
<center style="overflow-x: scroll">
| Instruction          | Description                                                                           | Note                                                                                                                  |
|----------------------|---------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| `mov`&nbsp;*dst src* | Load from data source *src* to registers *dst*                                        | *dst* and *reg* can have multiple registers sepearted by commas                                                       |
| `inc`&nbsp;*reg*     | Increment value in register *reg*                                                     | Same as above                                                                                                         |
| `dec`&nbsp;*reg*     | Decrement value in register *reg*                                                     | Same as above                                                                                                         |
| `j`&nbsp;*loc*       | Unconditional jump to location *loc*                                                  |                                                                                                                       |
| `j[cond]`&nbsp;*loc* | Conditional jump to location *loc*.<br/>`cond` can be `z, nz, eq, ne, gt, lt, ge, le` | `z, nz` takes effect 2 ticks after register `a` is changed. The rest takes 3 ticks after register `a, b` are changed. |

</center>
<!-- }}} -->

<!-- {{{ Registers -->
Table 2 List of Registers
<center style="overflow-x: scroll">
| Register | Signal | Function           | Note                                                             |
|----------|--------|--------------------|------------------------------------------------------------------|
| `a`      | A      | Arithmetic Operand |                                                                  |
| `b`      | B      | Arithmetic Operand |                                                                  |
| `x`      | X      | General            |                                                                  |
| `y`      | Y      | General            |                                                                  |
| `z`      | Z      | General            |                                                                  |
| `ra`     | R      | Bus Read Address   |                                                                  |
| `wa`     | W      | Bus Write Address  | Write to `wd` in the cycle following corresponding write to `wa` |
| `wd`     | L      | Bus Write Data     | Same as above                                                    |
| `jmp`    | J      | Program Counter    | Used by assembler to create jumps. Not usually used directly.    |
| `cj`     | K      | Jump Control       | Same as above                                                    |
| `cd`     | C      | Data Control       | Same as above                                                    |

</center>
<!-- }}} -->

<!-- {{{ Sources -->
Table 3 List of Data Source
<center style="overflow-x: scroll">
| Source    | Description                                      | Note                                                                                                                             |
|-----------|--------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| Immediate | Immediate value                                  | Can be a literal, a constant, or a label                                                                                         |
| `a`       | Register `a`                                     |                                                                                                                                  |
| `b`       | Register `b`                                     |                                                                                                                                  |
| `x`       | Register `x`                                     |                                                                                                                                  |
| `y`       | Register `y`                                     |                                                                                                                                  |
| `z`       | Register `z`                                     |                                                                                                                                  |
| `rd`      | Bus Read Data                                    | Different peripherals have different timings.  For RAM, it is available 2 ticks after `ra` is changed. For chest input, 3 ticks. |
| `add`     | Result of `a + b`              | Available 1 cycle after `a, b` are changed.                                                                                      |
| `sub`     | Result of `a - b`              | Available 2 cycle after `a, b` are changed.                                                                                      |
| `mul`     | Result of `a * b`         | Available 3 cycle after `a, b` are changed.                                                                                      |
| `div`     | Result of `a / b`            | Same as above                                                                                                                    |
| `mod`     | Result of `a mod b` | Same as above                                                                                                                    |
| `exp`     | Result of `a^b`                | Same as above                                                                                                                    |
| `ls`      | Result of `a << b`            | Same as above                                                                                                                    |
| `rs`      | Result of `a >> b`            | Same as above                                                                                                                    |
| `and`     | Result of `a ∧ b`          | Same as above                                                                                                                    |
| `or`      | Result of `a ∨ b`           | Same as above                                                                                                                    |
| `xor`     | Result of `a ⊕ b`         | Same as above                                                                                                                    |
| `eq`      | 1 if `a = b` else 0            | Same as above                                                                                                                    |
| `ne`      | 1 if `a ≠ b` else 0            | Same as above                                                                                                                    |
| `lt`      | 1 if `a < b` else 0            | Same as above                                                                                                                    |
| `gt`      | 1 if `a > b` else 0            | Same as above                                                                                                                    |
| `le`      | 1 if `a ≤ b` else 0            | Same as above                                                                                                                    |
| `ge`      | 1 if `a ≥ b` else 0            | Same as above                                                                                                                    |
| `zero`    | 1 if `a = 0` else 0                     | Same as above                                                                                                                    |
| `nero`    | 1 if `a ≠ 0` else 0                     | Same as above                                                                                                                    |
| `inc`     | Increment                                        | Used by assembler for `inc` and `dec` instructions. <br> For example, `inc a` is equivalent to `mov a inc`.                  |
| `dec`     | Decrement                                        | Same as above                                                                                                                    |

</center>
<!-- }}} -->

<!-- {{{ Tools Used -->
## Tools Used
The mod *Better Lamp Contrast* by Purpzie is used throughout the
development and testing for this report. The mod can be found at
<https://mods.factorio.com/mod/lamp-contrast>.

Python 3 is used throughout the development to automate some of the circuit
building and to assemble and generate code as blueprint strings.

The in-game `/editor` command is used to debug the circuit and code, as
well as providing infinite resource for building.
<!-- }}} -->

<!-- {{{ Demo -->
## Code Demonstration {seccode-demo}
This simple chess program demonstrates the usage of different components in the
system and assembler syntax. The program copies chess piece bitmaps and initial
position to the VRAM and RAM, then polls for user input in a loop, checks and
perform a move by reading and updating content in the RAM. A video demonstration
of the program working can be found on YouTube.

<iframe width="100%" height="500" src="https://www.youtube.com/embed/WpxZ9LE9LhM?si=ndonTMwJTzZ67LOC" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

The source code of the program follows:

<!-- {{{ ASM Code -->
```asm
; memory locations
#vram 800
#disp 900
#input 1000

; colour
#pink (5 << 28)

; chess piece definitions
#bk (1 | pink)
#bq (2 | pink)
#bb (3 | pink)
#bn (4 | pink)
#br (5 | pink)
#bp (6 | pink)
#wk 1
#wq 2
#wb 3
#wn 4
#wr 5
#wp 6

; variables
#pos 400

.data
initial:
#br #bn #bb #bq #bk #bb #bn #br
#bp #bp #bp #bp #bp #bp #bp #bp
0   0   0   0   0   0   0   0
0   0   0   0   0   0   0   0
0   0   0   0   0   0   0   0
0   0   0   0   0   0   0   0
#wp #wp #wp #wp #wp #wp #wp #wp
#wr #wn #wb #wq #wk #wb #wn #wr

.code
; reset regiters
mov a,b,x,y,z 0

; move bitmaps to vram
mov a 12
mov ra bitmap:
mov wa #vram+1
j memcpy:
mov z .

mov wa #vram
mov wd 1

; move initial position to ram
mov a 64
mov ra initial:
mov wa #pos
j memcpy:
mov z .

; show pieces
mov a 64
mov ra #pos
mov wa #disp
j memcpy:
mov z .

loop:

mov ra #input   ; read from input
mov ra 0        ; clear read register
mov b #pos-1    ; calculate selected address
mov a,y rd      ; save user input, check zero
mov a x \       ; check saved value is not zero
mov ra add      ; address of selected position
jz loop:        ; input is zero, skip
mov a rd        ; read value of selected position

jnz check_move: ; check if saved value is zero
mov z sel_fin:  ; go to sel_fin when returning from check_move

; saved value is zero
jz loop:        ; if selected position is empty, continue
noop

j loop:         ; else
mov x y         ; save input value

sel_fin:        ; saved value is not zero
noop            ; wait for jnz condition

jnz move_piece: ; move piece if valid
mov z .

j loop:         ; loop
mov x 0         ; clear saved value

; a count
; ra src
; wa dst (set right before j)
memcpy:
mov wd rd \
jz z
dec a
j memcpy: \
inc ra
inc wa

; x src
; y dst
; a 1 if valid, 0 if not
; checks for colour only
check_move:
mov b #pos-1 \  ; calculate addresses
mov a y         ; dest address
mov ra add \    ; read dest value
mov a x         ; source address
mov ra add      ; read source value
mov a rd        ; store dest value to a
mov b rd        ; store source value to b

jz z            ; pass if dest has no piece
mov a 1         ; return 1

mov a xor \     ; check colour bits
mov b 0x7FFFFFF
noop            ; wait for calculation
noop

jle z           ; same colour, fail
mov a 0         ; return 0

j z
mov a 1         ; return 1

; x src
; y dst
; move the piece and update display
move_piece:
mov a x \       ; calculate source address
mov b #pos-1

mov ra,wa add \ ; read write from source
mov a y         ; calculate destination address

mov wd 0 \      ; write 0 to source
mov wa add      ; write to destination

mov wd,x rd \   ; read piece from source and write to destination
mov wa 0 \
mov a x         ; calculate display source address
mov b #disp-1

mov a y \       ; calculate display destination address
mov wa add      ; clear source cell
mov wd 0

mov wa add      ; write to display destination
j z             ; return
mov wd x        ; write piece

.data
bitmap:
0x01f711c4 ; king
0x01f77dd5 ; queen
0x01f728ce ; bishop
0x01f779c4 ; knight
0x01f73bf5 ; rook
0x01f73880 ; pawn
```
<!-- }}} -->
<!-- }}} -->

<!-- {{{ Blueprint -->
## Processor Blueprint String
```text
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
```
<!-- }}} -->

<!-- {{{ Reference -->
## Related Projects
These are some related projects that I've came across when researching for this
project.
<div markdown=1 style="white-space: nowrap; overflow-x: scroll">
- <https://forums.factorio.com/viewtopic.php?t=13154>
- <https://forums.factorio.com/viewtopic.php?t=90583>
- <https://forums.factorio.com/viewtopic.php?f=8&t=23405>
- <https://github.com/Artorp/factorio-computer>
- <https://github.com/Halke1986/factorio-riscv>
- <https://github.com/alcatrazEscapee/FactorioProcessorV2>
- <https://www.reddit.com/r/factorio/comments/b9sssm/factorio_processor_keyboard_ascii_display_code/>
- <https://www.reddit.com/r/factorio/comments/ugv2w2/playing_tetris_on_a_general_purpose_factorio_cpu/>
- <https://www.reddit.com/r/factorio/comments/7h2fes/rendering_3d_image_on_factorio_cpu/>
- <https://www.reddit.com/r/factorio/comments/a8yfr4/i_made_another_cpu_in_factorio/>
- <https://www.youtube.com/watch?v=who7vZWwYiM>
- <https://www.reddit.com/r/factorio/comments/v4e30i/i_saw_somebody_else_on_here_made_pong_so_i_made/>
- <https://www.reddit.com/r/factorio/comments/c37e0l/the_engineer_keeps_boredom_away_by_playing_an_old/>
</div>

## References
<ol markdown=1 class=reference>
<li id=comp-0>Lupoviridae, Factorio Computer, Jun 23, 2015. Available: <https://forums.factorio.com/viewtopic.php?t=13154></li>
<li id=comp-1>jade52blue, First functioning programmable computer!, Oct 21, 2020. Available: <https://forums.factorio.com/viewtopic.php?t=90583></li>
<li id=comp-2>Halke1986, Factorio RISC V implementation, 2021. Available: <https://github.com/Halke1986/factorio-riscv></li>
<li id=factorio>Factorio. Accessed: Mar 12, 2023. Available: <https://factorio.com/></li>
<li id=factorio-ram>Liu, R., Multi-port Random Access Memory in Factorio, Nov 12, 2022. Available: <https://blog.r26.me/C-factorio-ram.en.html></li>
<li id=comp-3>YsVc, Rendering 3D image on Factorio CPU, Dev 2, 2017. Available: <https://www.reddit.com/r/factorio/comments/7h2fes/rendering_3d_image_on_factorio_cpu/></li>
<li id=comp-4>alcatraz\_escapee, Playing Tetris on a general purpose Factorio CPU, May 2, 2022. Available: <https://www.reddit.com/r/factorio/comments/ugv2w2/playing_tetris_on_a_general_purpose_factorio_cpu/></li>
<li id=comp-5>Sjadfooey, I saw somebody else on here made pong, so I made snake!, Jun 3, 2022. Available: <https://www.reddit.com/r/factorio/comments/v4e30i/i_saw_somebody_else_on_here_made_pong_so_i_made/></li>
<li id=cpuspeed>fuzzyhair2, What limits CPU speed?. Available: <https://electronics.stackexchange.com/a/122060></li>
<li id=loadstore>Charles W. Kann, "Load and Store Architecture," in Introduction to Assembly Language Programming: From Soup to Nuts: ARM Edition. <https://eng.libretexts.org/Bookshelves/Computer_Science/Programming_Languages/Introduction_to_Assembly_Language_Programming%3A_From_Soup_to_Nuts%3A_ARM_Edition_(Kann)/04%3A_New_Page/4.04%3A_New_Page></li>
<li id=epic>M. S. Schlansker and B. R. Rau, "EPIC: Explicitly Parallel Instruction Computing," in Computer, vol. 33, no. 2, pp. 37-45, Feb. 2000, doi: 10.1109/2.820037. Available: <https://www.cs.binghamton.edu/~dima/cs522_05/epic.pdf></li>
<li id=beneater>Ben Eater, Building an 8-bit breadboard computer!, 2016. Available: <https://www.youtube.com/playlist?list=PLowKtXNTBypGqImE405J2565dvjafglHU></li>
<li id=delayslot>DeRosa, J. A. and Levy, H. M., An Evaluation of Branch Architectures, Jun 1987, doi: 10.1145/30350.30352. Available: <https://dl.acm.org/doi/pdf/10.1145/30350.30352></li>
<li id=harvardarch>Wikipedia, Harvard architecture. Accessed: May 03, 2023. Available: <https://en.wikipedia.org/w/index.php?title=Harvard_architecture&oldid=1150624733></li>
<li id=bottomup>Wienand, I., "Assembler" in Computer Science from the Bottom Up. Available: <https://bottomupcs.com/ch07s04.html></li>
</ol>
<!-- }}} -->

<!-- % vim: foldmethod=marker textwidth=80 spell: -->
