# How to Build a Computer?

<a href='code-note.html'>中文</a>

This is a graph note for the book "*Code: The Hidden Language of Computer Hardware and Software*".

[TOC]

## How to Build a Computer

```mermaid
graph TD
F(Binary):::soft
F1(Decimal):::soft
H(Boolean algebra):::soft
I(Logic gate):::common
F-.->I
H-.->I
F1-.->F

J(Half adder):::common
L(Full adder):::common
N(Subtracter):::common
O(Complement):::common
ALU(Arithmetic Logical Unit):::common
L-->ALU
N-->ALU
I-->J
J-->L
L-->N
O-.->N

P(Oscillator):::common
Q(Feedback):::soft
R(Clock):::common
S(Trigger):::common
I-->P
Q-.->P
P-->S
S-->R

T(Frequency divider):::common
T1(Number counter):::common
PC(Program Counter):::common
T1-->PC
S-->T
T-->T1

U(Multiplexer):::common
U1(Decipherer):::common
S1(Latch):::common
S2(Random Access Memory):::common
S3(RAM array):::common
S-->S1
R-->S2
S1-->U
U-->U1
S1-->S2
U1-->S2
S2-->S3

CPU(Central Processing Unit):::common
ALU-->CPU
PC-->CPU

RG(Register):::common
S3-->RG
RG-->CPU

ST(Storage):::common
MG(Magnetic medium):::common
IO(Input-output device):::common
BW(Bus):::common
CP(Computer):::common
MG-->ST
CPU-->CP
IO-->CP
ST-->CP
BW-->CP
S3-.->ST

ADR(Address):::soft
OP(Opcode):::soft
ON(Operand):::soft
MC(Machine code):::soft
MC-.->CP
OP-.->MC
ON-.->MC
ADR-.->MC
U1-.->ADR

ASL(Assembly):::soft
LB(Label):::soft
CM(Comment):::soft
MC-.->ASL
LB-.->ASL
CM-.->ASL

CMD(Command processor):::soft
ASL-.->CMD
FOP(File system):::soft
API(Hardware interface):::soft
PROC(Memory management):::soft
OS(Operating system):::soft
FOP-.->OS
API-.->OS
PROC-.->OS
CMD-.->OS

syntax(Syntax):::soft
compiler("Compiler/Interpreter"):::soft
HPL(High-level languages):::soft
ASL-.->compiler
compiler-.->HPL
syntax-.->compiler

classDef common fill:#555555,color:white,stroke-width:0px
classDef soft fill:#0101,stroke-width:0px
```

## Ideas before Computer

```mermaid
graph LR
SP(Abacus):::common
napier(("John Napier")):::people
DSB(Logarithm tables):::common
gunter(("Edmund Gunter")):::people
DSHC(Logarithmic slide rule):::common
napier-.->DSB
DSB-.->DSHC
gunter-.->DSHC

schickard(("Wilhelm Schickard")):::people
JXJSQ(Mechanical calculator):::common
pascal(("Blaise Pascal")):::people
leibniz(("Gottfried Wilhelm Leibniz")):::people
pascal-.->JXJSQ
leibniz-.->JXJSQ
schickard-.->JXJSQ
SP==>JXJSQ

jacquard(("Joseph Maria Jacquard")):::people
ZDZBJ("Automatic loom"):::common
jacquard-.->ZDZBJ

babbage(("Charles Babbage")):::people
CFJ(Difference engine):::common
JXJ(Analytical engine):::common
babbage-.->CFJ
DSB==>CFJ
ZDZBJ-.->CFJ
JXJSQ==>CFJ
CFJ-.->JXJ

hollerith(("Herman Hollerith")):::people
RKPC(Automatic census):::common
hollerith-.->RKPC
CFJ-.->RKPC

aiken(("Howard Hathaway Aiken")):::people
ASCC(Automatic sequence controlled calculator):::common
aiken-.->ASCC
CFJ==>ASCC

zuse(("Konrad Zuse")):::people
JDSCP(Relay computer):::common
zuse-.->JDSCP
CFJ-.->JDSCP

turing(("Alan Mathison Turing")):::people
TLJ(Turing machine):::common
turing-.->TLJ

eckert(("John Presper Eckert Jr.")):::people
mauchly(("John William Mauchly")):::people
ENIAC("Valve computer - ENIAC"):::common
eckert-.->ENIAC
mauchly-.->ENIAC
ZKG-.->ENIAC
ASCC==>ENIAC
TLJ==>ENIAC

neumann(("John von Neumann")):::people
VNJ("von Neumann machine"):::common
neumann-.->VNJ
ENIAC==>VNJ

shannon(("Claude Elwood Shannon")):::people
INF(Information theory):::common
shannon-.->INF

wiener(("Norbert Wiener")):::people
CBYER(Control theory):::common
wiener-.->CBYER

MCP(Computer theory):::common
INF==>MCP
CBYER==>MCP
VNJ==>MCP

bell(("Bell Laboratory")):::people
JTG(Transistor):::common
bell-.->JTG
ZKG==>JTG

JTGCP(Transistor computer):::common
MCP==>JTGCP
JTG-.->JTGCP

JCCP(Integrated circuit computer):::common
JTGCP==>JCCP
IC==>JCCP

moore(("Gordon Moore")):::people
MR(Moore's law):::common
moore-.->MR
IC-.->MR

PCB(Printed circuit board):::common
SICP(Computer chip):::common
intel((Intel)):::people
intel-.->SICP
PCB-.->SICP
JCCP==>SICP

MCPP(Microporcessor):::common
SICP==>MCPP

JDQ("Relay"):::common
ZKG("Valve"):::common
JDQ-->ASCC
JDQ-->JDSCP
JDQ==>ZKG
xt((Fairchild Semiconductor)):::people
ti((Texas Instruments)):::people
IC(chip):::common
xt-.->IC
ti-.->IC
JTG==>IC

classDef common fill:#555555,color:white,stroke-width:0px
classDef people fill:#0101,stroke-width:0px
```

## Coding

```mermaid
graph TD
B(Permutation&Combination)
C(Braille)
D(Morse code)
B-.->C
B-.->D

CG(Escape character)
MRY(Murray code/Baudot code)
CG-.->MRY
CG-.->C

T1(Telegraph)
T2(Teleprinter)
T1-->D
T2-->MRY

CP(Computer)
CTR(Control character)
ASCII(ASCII)
MRY-.->ASCII
CTR-.->ASCII
CP-->ASCII

UNICODE(UNICODE)
ASCII-.->UNICODE

classDef node fill:gray,stroke-width:0px,color:white
```

## Numeric Coding

```mermaid
graph LR
subgraph Math
N(Natural number)
NG(Negative integer)
Z(Integer)
N-.->Z
NG-.->Z

F(Fraction)
R(Rational number)
F-.->R
Z-.->R

IR(Irational number)
RE(Real number)
R-.->RE
IR-.->RE

IM(Imaginary number)
CPL(Complex number)
RE-.->CPL
IM-.->CPL
end

subgraph Notation
C(Continuous number)
D(Discrete number)
C-.->|Restricted by computer|D

sig(Sign bit)
Fix(Fixed-point number)
D-.->Fix
sig-.->Fix

int(Fixed-point integer)
frac(Fixed-point fraction)
Fix-.->int
Fix-.->frac

sci(Scientific notation)
man(Mantissa)
exp(Exponent)
sci-.->man
sci-.->exp

Flo(Floating number)
D-.->Flo
sig-.->Flo
man-.->Flo
exp-.->Flo

f32(32-bit float)
d64(64-bit double)
Flo-.->f32
Flo-.->d64
end

classDef node fill:gray,stroke-width:0px,color:white

style Notation fill:white,stroke:black
style Math fill:white,stroke:black
```

## Image Coding

```mermaid
graph LR
M(Video Graphic Adapter)
BM(Raster)
VC(Vector)
M-.->BM
M-.->VC

CAD(Computer Aided Design)
VC-.->CAD

BMP(Bitmap)
BM-.->BMP

DC(Data compression)
BMP-.->|Too large|DC

ll(Lossless compression)
l(Lossy compression)
DC-.->l
DC-.->ll

ll-.->LZW
ll-.->RLE
LZW-.->GIF

l-.->JPEG

BM-.->|OCR|VC

classDef node fill:gray,stroke-width:0px,color:white
```

## Audio Coding

```mermaid
graph LR
S(Sound)
W(Wave file)
T(Text)
S-.->|"Sampling,Quantization,Coding"|W
W-.->|DAC|S
W-.->|Automatic Speech Recognition|T
T-.->|Audio Synthesizer|W

MIDI(MIDI file)
MIDI-.->|MIDI Synthesizer|S

classDef node fill:gray,stroke-width:0px,color:white
```

