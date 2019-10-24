# jsConvert
Javascript library for converting general &amp; engineering units

<br/>
<br/>

## Prerequisites
Web browser compatible with ECMAScript 5 Javascript. (No external libraries are required)

<br/>
<br/>


## Setup:
Reference the script in your HTML
```
<script src="..\path\to\your\folders\jsConvert.js"></script>

or

<script src="..\path\to\your\folders\jsConvert.min.js"></script>
```


In order to convert units we will need the following parameters:
```
1. Value (decimal)          [*required]
2. From Unit (string)       [*required]
3. To Unit (string)         [*required]
4. Decimal Places (integer) [*optional]
```
*Notice that the 4th parameter is optional*

The "From" and "To" units must be expressed in **short-hand form** and the entries are **case-sensitive**.
<br/>*See the **Help** section below for additional information on short-hand unit form.*

<br/>
<br/>



## Usage

The primary function takes the following form:
```
jsConvert( [Value], [From Unit], [To Unit], [Decimal Place] );
```

Assume we wish to convert 2.034 square-feet to square-meters. We can retrieve the full answer or round it to the 3rd decimal place.
```
jsConvert(2.304, "ft2", "m2");
    ----- output: 0.21404859046088998

jsConvert(2.304, "ft2", "m2", 3);
    ----- output: 0.214 
```

<br/>
<br/>


## Error Handling

The script ensures the the passed short-hand units ("From" and "To") are of the same *type* (ie: Length, Area, Velocity, Density, etc...). 

If the script detects an error, the returned value will always be **-INFINITY**.

The following function would produce an error:
```
jsConvert(3.553, "m", "cm3");
     ---- output: 
           "(jsConvertIt) Error: Unable to convert 'm'(Length) to 'cm3'(Volume)."
           -Infinity
```

<br/>
<br/>


# Help

A built-in **help** section is accessible and viewable via the console.

The help command accepts one to two parameters. 
The first must be "help".
The second parameter (optional) must be "units"

To view general usage,  guidelines, and additional help resources, simply pass "help" into the function.
```
jsConvert("help");

--------------------------------------------------------------------------------------
**************************************************************************************
JSCONVERT HELP
**************************************************************************************
--------------------------------------------------------------------------------------

**************************************************************************************
USAGE
**************************************************************************************
The primary function takes 4 parameters (the first three are required):

  [1]: Value (decimal) to convert (*required).
  [2]: From Unit (string) short-hand (*required).
  [3]: To Unit (string) short-hand (*required).
  [4]: Decimal Place to round result to (integer) (*optional).

'short-hand' units are the unit symbols, such as 'm' for 'meters' or 'ft/s2' for 'Feet per Square-Second'.

    jsConvert( [decimal value], [from], [to], [decimal place] );

    ----------------------------------------------------------------------------------
    Example: jsConvert(43.5, 'm/s2', 'ft/min2');
    This converts 43.5 Meters per Square-Second to Feet per Square-Minute.
    output: 513779.5275590532
    ----------------------------------------------------------------------------------

    ----------------------------------------------------------------------------------
    Example: jsConvert(43.5, 'ft/hr2', 'm/s2', 2);
    This converts 43.5 Meters per Square-Second to Feet per Square-Minute and rounds to nearest 2nd decimal place
    output: 513779.53
    ----------------------------------------------------------------------------------

**************************************************************************************
MORE HELP (SEARCH, CHECK, VALIDATE)
**************************************************************************************

To see the full list of UNIT TYPES:
    window.runnerWindow.proxyConsole.log(jsConvert('help', 'units'));

--------------------------------------------------------------------------------------

To check if a short-hand unit is valid:
    window.runnerWindow.proxyConsole.log(jsConvert('check', 'N/m2'));

--------------------------------------------------------------------------------------

To search for a unit or type (*partial searches are accepted):
    window.runnerWindow.proxyConsole.log(jsConvert('search', 'viscos');

**************************************************************************************
**************************************************************************************

```
<br/>

## HELP &#8594; UNITS

To view the list of Unit Types in the dataset, pass "units" as the 2nd parameter.
```
    jsConvert("help", "units");

--------------------------------------------------------------------------------------
**************************************************************************************
JSCONVERT HELP => units
**************************************************************************************
--------------------------------------------------------------------------------------

Acceleration (Angular)
Acceleration (Linear)
Area
Capacitance
Current
Density
Energy
Force
Frequency
Inductance
Inertia
Length
Mass
Mass Flow Rate
Power
Pressure
Resistance
Sound
Specific Volume
Surface Tension
Time
Torque
Velocity (Angular)
Velocity (Linear)
Viscosity (Dynamic Absolute)
Viscosity (Kinematic)
Volume
Volume Flow Rate
```

## HELP &#8594; UNIT TYPE

To view a list of short-hand units associated with a specific Unit Type, pass the Unit Type into the function as the second parameter.

**CASE-SENSITIVE**
```
   jsConvert("help", "Area");

--------------------------------------------------------------------------------------
**************************************************************************************
JSCONVERT HELP => Area
**************************************************************************************
--------------------------------------------------------------------------------------

  EXAMPLE:  jsConvert(158.5, 'nm2', 'um2');

Use the following short-hand codes for AREA units:
 - nm2 (Nanometers-Squared)
 - um2 (Micrometers-Squared)
 - mm2 (Millimeters-Squared)
 - cm2 (Centimeters-Squared)
 - dm2 (Decimeters-Squared)
 - m2 (Meters-Squared)
 - dam2 (Decameters-Squared)
 - hm2 (Hectometers-Squared)
 - km2 (Kilometers-Squared)
 - mil2 (Mil-Squared)
 - in2 (Inches)
 - ft2 (Feet)
 - yd2 (Yards)
 - mi2 (Mile)
 - acre (Acres)

```

## CHECK &#8594; UNIT

To confirm if a short-hand unit exists, and what unit type it is associated with,
pass the parameter "check" followed by the short-hand unit you wish to query.

**CASE-SENSITIVE**
```
EXAMPLES:

    jsConvert("check", "N-s/m2");
    
    output:
      CONFIRMED! The short-hand code 'N-s/m2' exists in TYPE [Viscosity (Dynamic Absolute)].
      
---------------------------------------------------------------------------------------------------------
    jsConvert("check", "m-N/s2");
    
    output:
      SORRY... the short-hand code 's-N/m2' could not be found in the dataset.
      
---------------------------------------------------------------------------------------------------------     
    jsConvert("check", "oz");
    
    output:
      CONFIRMED! The short-hand code 'oz' exists in TYPE [Mass].
      CONFIRMED! The short-hand code 'oz' exists in TYPE [Volume].
```

## SEARCH KEYWORDS

To search for a unit or unit type, you may enter keywords that are associated with the unit or unit type.
Simply pass the parameter "search", followed by your keyword search.

**NOT CASE-SENSITIVE**

```
  jsConvert("search", "electr");

--------------------------------------------------------------------------------------
**************************************************************************************
JSCONVERT SEARCH
**************************************************************************************
--------------------------------------------------------------------------------------

  Searching dataset for 'electr'....
    UNIT TYPE: Capacitance
    UNIT TYPE: Current
    UNIT: meV  (Millielectron-Volts) in TYPE [Energy]
    UNIT: eV  (Electron-Volts) in TYPE [Energy]
    UNIT: keV  (Kiloelectron-Volts) in TYPE [Energy]
    UNIT: MeV  (Megaelectron-Volts) in TYPE [Energy]
    UNIT: GeV  (Gigaelectron-Volts) in TYPE [Energy]
    UNIT TYPE: Inductance
    UNIT: hp-e  (Horsepower (electric)) in TYPE [Power]
    UNIT TYPE: Resistance
```
