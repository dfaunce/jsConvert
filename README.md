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


## Help

To retrieve a full list of short-hand units, simply pass the parameter **help** into the function and check the console for the help text.

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
