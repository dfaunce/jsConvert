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


## Help

To retrieve a full list of short-hand units, simply pass the parameter **help** into the function and check the console for the help text.

```
jsConvert("help");
    ----- output:
    ************************************
    jsConvert Help.
       - jsConvert(23.5, 'in3', 'mL');

    Use the following short-hand units.
    -------------------------------------
    Area
     - mi2 (square-miles)
     - yd2 (square-yards)
     - ft2 (square-feet)
     - in2 (square-inches)
     - km2 (square-kilometers)
     - m2 (square-meters)
     - mm2 (square-millimeters)
     - cm2 (square-centimeters)
     -------------------------------------
     Length
     - mi (miles)
     - yd (yards)
     - ft (feet)
     - in (inches)
     - km (kilometers)
    ...
    ...
    ...
    

```
