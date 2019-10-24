let jsConvert = function(val, from, to, dec = null) {

    //Get decimal places. If the user didn't input one, assume the user wants the full value (expressed as -1)
    let decimals = ((typeof(dec) === "undefined" || dec == null ) ? -1 : parseInt(dec));

    /*
     Retrieve the JSON object where both "from" and "to" units reside in.
       *Note: it is important that both "from" and "to" units exist within the
              unit type. Some short-hand units like "oz" exist in two separate
              Types (Mass and Volume)
       INPUTS:  [From unit],  [TO unit]  both strings in unit short-hand form
       OUTPUT: An object in the form of {"type": string, "from": object, "to": object}
	*/
    function getTypeofUnits(from, to) {

        //Iterative variables for the loop.
        let i = 0, j = 0;

        // _f and _t are booleans that will be reset to FALSE after checking each TYPE.
        // _f0 and _t0 are considered global booleans of the search. Their purpose is to see if the unit even exists in the entire dataset.
        //   Once they become TRUE, they stay TRUE - this is only to notify the user that the unit they entered does exist in the dataset
        let _f = false, _t = false, _f0 = false, _t0 = false;

        // $o will represent the specific unit of a TYPE in the for loop below, by storing this in cache we can analyze the data quicker
        let $o;

        // $from and $to will represent the found objects in the loop below
        let $from, $to;

        // $result is the resultant object, it is preset to null and empty values
        let $result = {"type":null, "from":null, "to":null, "errors": []};

        //Initate a search on the dataset by running a for loop
        for (i = 0; i < jsCAU.length; i++) {

            //If we already have values, break from the loop
            if ($result.type !== null) {
                break;
            }

            // Iterate through the "UNITS" of each TYPE object
            for (j = 0; j < jsCAU[i].units.length; j++) {

                //Retrieve the object
                $o = jsCAU[i].units[j];

                //If the FROM unit has not been found for this TYPE
                if (!_f) {

                    //Check to see if the units match
                    if ($o.unit == from) {

                        //If TRUE, then set the $from object equal to THIS object and set the booleans _f and _f0 to true;
                        $from = $o;
                        _f = _f0 = true;
                    }
                }

                //If the TO unit has not been found for this TYPE
                if (!_t) {

                    //Check to see if the units match
                    if ($o.unit == to) {

                        //If TRUE, then set the $from object equal to THIS object and set the booleans _f and _f0 to true;
                        $to = $o;
                        _t = _t0 = true;
                    }
                }

                //If both FROM and TO have been found within a TYPE we have a successful data set to return. Set the $result object and break from the loop.
                if (_f && _t) {
                    $result = {"type": jsCAU[i].type, "from": $from, "to": $to, "errors": []};
                    break;
                }
            }

            //If we have run through an entire set without successfully finding both FROM and TO within the type, reset the variables to null and false values.
            _f = false;
            _t = false;
            $from = null;
            $to = null;
        }

        //If after we conducted the search we NEVER found the FROM value (or TO value) in the entire dataset, notate the error(s) to send back to the user.
        if (!_f0)
            $result.errors.push(`Unable to locate ${from}`);

        if (!_t0)
            $result.errors.push(`Unable to locate ${to}`);

        //Return the Dataset
        return $result;
    }

    //Converts temperature units: F, C, K, R
    function convertTemp(val, from, to) {
        let temp = val;
        if (from === to)
            return val;

        switch (from) {
            case "F":
                switch (to) {
                    case "C":
                        temp = parseFloat((val - 32) * 5 / 9);
                        break;
                    case "K":
                        temp = parseFloat((val + 459.67) * 5 / 9);
                        break;
                    case "R":
                        temp = parseFloat(val + 459.67);
                        break;
                    case "F":
                    default:
                        temp = val;
                        break;
                }
            case "C":
                switch (to) {
                    case "F":
                        temp = parseFloat((val * 9 / 5) + 32);
                        break;
                    case "K":
                        temp  = parseFloat(val + 273.15);
                        break;
                    case "R":
                        temp = parseFloat((val + 273.15) * 9 / 5);
                        break;
                    case "C":
                    default:
                        temp = val;
                        break;
                }
                case "K":
                    switch (to) {
                        case "C":
                            temp = parseFloat(val - 273.15);
                            break;
                        case "F":
                            temp = parseFloat((val * 9 / 5) - 459.67);
                            break;
                        case "R":
                            temp = parseFloat(val * 9 / 5);
                            break;
                        case "K":
                        default:
                            temp = val;
                            break;
                    }
                case "R":
                    switch (to) {
                        case "K":
                            temp = parseFloat(val * 5 / 9);
                            break;
                        case "F":
                            temp = parseFloat(val - 459.67);
                            break;
                        case "C":
                            temp = parseFloat((val - 491.67) * 5 / 9);
                            break;
                        case "R":
                        default:
                            temp = val;
                            break;
                    }
                default:
                    temp = val;
                    break;
        }
        return temp;
    }

    //Converts units in the jsCAU array of objects
    function convertLinear(val, from, to) {

        //Get the object $set by searching the Units dataset for the FROM and TO short-hand units.
        let $set = getTypeofUnits(from, to);

        //If the set contains errors, display the errors in the log
        if ($set.errors.length > 0) {
            logError($set.errors);
            return -Infinity;
        }

        //At this point, we do not have errors and we have retrieved the FROM and TO dataset objects.
        //Calculate the converted value.
        let v = parseFloat(val * $set.to.xval / $set.from.xval);

        //return the value
        return v;
    }

    //Logs any errors
    function logError(errors) {
        if (errors.length > 0) {
            console.log("-----------------------------------");
            console.log("(jsConvert) ERROR(s): ");
            for (var i = 0; i < errors.length; i++) {
                console.log(` - ${errors[i]}`);
            }
            console.log("");
        }
    }

    //Primary function call.
    function init(val, from, to) {
		if (val === "help" || val === "check" || val === "search") {
			help(val, from);
			return "";
		}
		else {
			//Check to see if we are converting Temperatures or another type of unit.
			let v = (from.match(/^(F|C|R|K)$/) && from.match(/^(F|C|R|K)$/)) ? convertTemp(val, from, to) : convertLinear(val, from, to);

			//If we have a calculated value (no errors) and the user specified a decimal place, round the value to the decimal place
			if (v !== -Infinity && decimals >= 0) {
				let c = Math.pow(10, decimals);
				v = Math.round(v * c) / c;
			}
			return v;
		}
    }


    // ***********************************************************************************************************************
    // ------------------------------------------------ HELP / CHECK / SEARCH ------------------------------------------------
    //                                   (* This is an optional feature and may be removed *)
    // ***********************************************************************************************************************
	function help(val, from) {
        //If the user specified the "help" variable, this will override the primary init function call.
		// =>  jsConvert("Help", "Units");   <== This displays a list of all Unit Types in the console.
		// =>  jsConvert("Help", "Volume");  <== This displays a list of all Units of Type 'Volume' in the console.
		if (val === "help") {
			var bar = "--------------------------------------------------------------------------------------";
			var bigBar = "**************************************************************************************";
			var bar0 = "    " + bar.substring(0, bar.length - 4);

			var _display = [];

			var i = 0, j = 0; 
			var isType = (typeof(from) === 'string' || from instanceof String);

			//If no TYPE was entered, display the initial HELP text
			if (!isType) {
				_display.push("", bar, bigBar, "JSCONVERT HELP", bigBar, bar, "");
				_display.push(bigBar, "USAGE", bigBar);
				_display.push("The primary function takes 4 parameters (the first three are required):", "");
				_display.push(" [1]: Value (decimal) to convert (*required).", " [2]: From Unit (string) short-hand (*required).", " [3]: To Unit (string) short-hand (*required).", " [4]: Decimal Place to round result to (integer) (*optional).", "");
				_display.push("'short-hand' units are the unit symbols, such as 'm' for 'meters' or 'ft/s2' for 'Feet per Square-Second'.", "");
				_display.push("    jsConvert( [decimal value], [from], [to], [decimal place] );", "");
				_display.push(bar0, "    Example: jsConvert(43.5, 'm/s2', 'ft/min2');", "    This converts 43.5 Meters per Square-Second to Feet per Square-Minute.", "    output: 513779.5275590532", bar0, "");
				_display.push(bar0, "    Example: jsConvert(43.5, 'ft/hr2', 'm/s2', 2);", "    This converts 43.5 Meters per Square-Second to Feet per Square-Minute and rounds to nearest 2nd decimal place", "    output: 513779.53", bar0, "");
				_display.push("");
				_display.push(bigBar, "MORE HELP (SEARCH, CHECK, VALIDATE)", bigBar);
				_display.push("", "To see the full list of UNIT TYPES:", "    console.log(jsConvert('help', 'units'));", "", bar);
				_display.push("", "To check if a short-hand unit is valid:", "    console.log(jsConvert('check', 'N/m2'));", "", bar );
				_display.push("", "To search for a unit or type (*partial searches are accepted):", "    console.log(jsConvert('search', 'viscos');", "");
				_display.push(bigBar, bigBar, "", "");
			}

			//If a TYPE was entered, display the HELP text pertaining to the specific TYPE
			else {
				var _type = from;
				_display.push("", bar, bigBar, `JSCONVERT HELP => ${_type}`, bigBar, bar, "");

				var $records = jsCAU.filter(obj => obj.type === _type);
				if ($records[0].units.length > 0) {

					_display.push(`  EXAMPLE:  jsConvert(158.5, '${$records[0].units[0].unit}', '${$records[0].units[1].unit}');`, "");

					_display.push(`Use the following short-hand codes for ${_type.toUpperCase()} units:`);

					for (i = 0; i < $records[0].units.length; i++) {
						_display.push(` - ${$records[0].units[i].unit} (${$records[0].units[i].display})`);
					}
				}
			}

			for (i = 0; i < _display.length; i++) {
				console.log(_display[i]);
			}

			return "";
		}

		//Else if the user entered a "check" parameter, display the "check" text in the console
		// =>  jsConvert("check", "m/s2");   <== Checks the entire dataset to see if 'm/s2' is a valid short-hand code. The console will display the results.
		else if (val === "check") {
			var bar = "--------------------------------------------------------------------------------------";
			var bigBar = "**************************************************************************************";
			var bar0 = "    " + bar.substring(0, bar.length - 4);

			var _display = [bar, bigBar, "JSCONVERT CHECK", bigBar, bar, ""];

			var i = 0, j = 0;
			var hasParam = (typeof(from) === 'string' || from instanceof String);

			var isValid = false;

			if (!hasParam) {
				_display.push("   **ERROR**: No parameter was entered to 'check'. Please enter a second parameter.", "");
			}
			else {
				for (i = 0; i < jsCAU.length; i++) {
					for (j = 0; j < jsCAU[i].units.length; j++) {
						if (from == jsCAU[i].units[j].unit) {
							isValid = true;
							_display.push(`   CONFIRMED! The short-hand code '${from}' exists in TYPE [${jsCAU[i].type}].`);
						}
					}
				}
				if (!isValid) {
					_display.push(`   SORRY... the short-hand code '${from}' could not be found in the dataset.`);
				}
			}

			_display.push("");

			for (i = 0; i < _display.length; i++) {
				console.log(_display[i]);
			}
			return "";
		}

		//Else if the user entered a "search" parameter, display the "searched" text in the console
		// =>  jsConvert("search", "oz");   <== Returns (if any) a list of all Units and Unit Types that are associated with the searched text (NOT CASE-SENSITIVE).
		else if (val === "search") {
			var bar = "--------------------------------------------------------------------------------------";
			var bigBar = "**************************************************************************************";
			var bar0 = "    " + bar.substring(0, bar.length - 4);

			var _display = [bar, bigBar, "JSCONVERT SEARCH", bigBar, bar, ""];

			var i = 0, j = 0;
			var hasParam = (typeof(from) === 'string' || from instanceof String);

			var isValid = false;

			if (!hasParam) {
				_display.push("   **ERROR**: No parameter was entered to 'search'. Please enter a second parameter.", "");
			}
			else {
				var s = "", $o = null, $r = null;
				var key = from.toLowerCase();

				_display.push(`  Searching dataset for '${from}'....`);

				for (i = 0; i < jsCAU.length; i++) {
					$o = jsCAU[i];
					if ( (($o.type).toLowerCase()).indexOf(key) >= 0 || (($o.keywords).toLowerCase()).indexOf(key) >= 0) {
						isValid = true;
						_display.push(`   UNIT TYPE: ${$o.type}`);
					}

					for (j = 0; j < $o.units.length; j++) {
						$r = $o.units[j];
						if ( (($r.display).toLowerCase()).indexOf(key) >= 0 || (($r.unit).toLowerCase()).indexOf(key) >= 0) {
							isValid = true;
							_display.push(`  UNIT: ${$r.unit}  (${$r.display}) in TYPE [${$o.type}]`);
						}
					}
				}

				if (!isValid) {
					_display.push(`   SORRY... unable to locate '${from}' in the dataset.`);
				}

			}

			_display.push("");

			for (i = 0; i < _display.length; i++) {
				console.log(_display[i]);
			}
			return "";
		}

		else {
		}
		
	}
    

    // ************************************************************************************************************************
    // __________________________________________ END HELP / CHECK / SEARCH SECTIONS __________________________________________
    // ************************************************************************************************************************

	//Return calculated value (or help section)
	return init(val, from, to);

};

const jsCAU = [
    {
        "type": "Acceleration (Angular)",
        "keywords": "accelerate accel circular round angle degree radian rev",
        "units": [
            { "unit": "deg/s2", "xval": 360, "display": "Degrees per Second-Squared"},
            { "unit": "deg/min2", "xval": 1296000, "display": "Degrees per Minute-Squared"},
            { "unit": "deg/hr2", "xval": 4665600000, "display": "Degrees per Hour-Squared"},
            { "unit": "grade/s2", "xval": 400, "display": "Grade per Second-Squared"},
            { "unit": "rad/s2", "xval": 6.283185307, "display": "Radians per Second-Squared"},
            { "unit": "rad/min2", "xval": 22619.4671052, "display": "Radians per Minute-Squared"},
            { "unit": "rad/hr2", "xval": 81430081.57872, "display": "Radians per Hour-Squared"},
            { "unit": "rev/s2", "xval": 1, "display": "Revolutions per Second-Squared"},
            { "unit": "rev/min2", "xval": 3600, "display": "Revolutions per Minute-Squared"},
            { "unit": "rev/hr2", "xval": 12960000, "display": "Revolutions per Hour-Squared"}
        ]
    },
    {
        "type": "Acceleration (Linear)",
		"keywords": "accelerate accel circular round angle degree radian rev",
        "units": [
            { "unit": "mm/s2", "xval": 1000, "display": "Millimeters per Second-Squared"},
            { "unit": "mm/min2", "xval": 3600000, "display": "Millimeters per Minute-Squared"},
            { "unit": "mm/hr2", "xval": 12960000000, "display": "Millimeters per Hour-Squared"},
            { "unit": "cm/s2", "xval": 100, "display": "Centimeters per Second-Squared"},
            { "unit": "cm/min2", "xval": 360000, "display": "Centimeters per Minute-Squared"},
            { "unit": "cm/hr2", "xval": 1296000000, "display": "Centimeters per Hour-Squared"},
            { "unit": "m/s2", "xval": 1, "display": "Meters per Second-Squared"},
            { "unit": "m/min2", "xval": 3600, "display": "Meters per Minute-Squared"},
            { "unit": "m/hr2", "xval": 12960000, "display": "Meters per Hour-Squared"},
            { "unit": "km/s2", "xval": 0.001, "display": "Kilometers per Second-Squared"},
            { "unit": "km/min2", "xval": 3.6, "display": "Kilometers per Minute-Squared"},
            { "unit": "km/hr2", "xval": 12960, "display": "Kilometers per Hour-Squared"},
            { "unit": "in/s2", "xval": 39.370078740157, "display": "Inches per Second-Squared"},
            { "unit": "in/min2", "xval": 141732.283464565, "display": "Inches per Minute-Squared"},
            { "unit": "in/hr2", "xval": 510236220.472435, "display": "Inches per Hour-Squared"},
            { "unit": "ft/s2", "xval": 3.2808398950131, "display": "Feet per Second-Squared"},
            { "unit": "ft/min2", "xval": 11811.0236220472, "display": "Feet per Minute-Squared"},
            { "unit": "ft/hr2", "xval": 42519685.0393698, "display": "Feet per Hour-Squared"},
            { "unit": "yd/s2", "xval": 1.09361, "display": "Yards per Second-Squared"},
            { "unit": "yd/min2", "xval": 3936.996, "display": "Yards per Minute-Squared"},
            { "unit": "yd/hr2", "xval": 14173185.6, "display": "Yards per Hour-Squared"},
            { "unit": "mi/s2", "xval": 0.000621371, "display": "Miles per Second-Squared"},
            { "unit": "mi/min2", "xval": 2.2369356, "display": "Miles per Minute-Squared"},
            { "unit": "mi/hr2", "xval": 8052.96816, "display": "Miles per Hour-Squared"},
            { "unit": "celo", "xval": 3.2808399, "display": "Celo"},
            { "unit": "leo", "xval": 0.1, "display": "Leo"}
        ]
    },
    {
        "type": "Area",
        "keywords": "square area cover acre squared",
        "units": [
            { "unit": "nm2", "xval": 1000000000000000000, "display": "Nanometers-Squared"},
            { "unit": "um2", "xval": 1000000000000, "display": "Micrometers-Squared"},
            { "unit": "mm2", "xval": 1000000, "display": "Millimeters-Squared"},
            { "unit": "cm2", "xval": 10000, "display": "Centimeters-Squared"},
            { "unit": "dm2", "xval": 100, "display": "Decimeters-Squared"},
            { "unit": "m2", "xval": 1, "display": "Meters-Squared"},
            { "unit": "dam2", "xval": 0.01, "display": "Decameters-Squared"},
            { "unit": "hm2", "xval": 0.001, "display": "Hectometers-Squared"},
            { "unit": "km2", "xval": 0.000001, "display": "Kilometers-Squared"},
            { "unit": "mil2", "xval": 1550003100.006, "display": "Mil-Squared"},
            { "unit": "in2", "xval": 1550.003100006, "display": "Inches"},
            { "unit": "ft2", "xval": 10.76391041671, "display": "Feet"},
            { "unit": "yd2", "xval": 1.195990046301, "display": "Yards"},
            { "unit": "mi2", "xval": 3.861021585424E-07, "display": "Mile"},
            { "unit": "acre", "xval": 0.0002471053814671, "display": "Acres"}
        ]
    },
    {
        "type": "Capacitance",
        "keywords": "electrical capacitor capacitance farad",
        "units": [
            { "unit": "aH", "xval": 1000000000000000000, "display": "Attofarads"},
            { "unit": "fH", "xval": 1000000000000000, "display": "Femtofarads"},
            { "unit": "pH", "xval": 1000000000000, "display": "Picofarads"},
            { "unit": "nH", "xval": 1000000000, "display": "Nanofarads"},
            { "unit": "C/V", "xval": 1, "display": "Coulomb per Volt"},
            { "unit": "c/v", "xval": 1, "display": "Coulomb per Volt"},
            { "unit": "uH", "xval": 1000000, "display": "Microfarads"},
            { "unit": "mH", "xval": 1000, "display": "Millifarads"},
            { "unit": "cH", "xval": 100, "display": "Centifarads"},
            { "unit": "H", "xval": 1, "display": "farads"},
            { "unit": "kH", "xval": 0.001, "display": "Kilofarads"},
            { "unit": "MH", "xval": 0.000001, "display": "Megafarads"},
            { "unit": "GH", "xval": 0.000000001, "display": "Gigafarads"},
            { "unit": "TH", "xval": 0.000000000001, "display": "Terrafarads"},
            { "unit": "PH", "xval": 0.000000000000001, "display": "Petafarads"},
            { "unit": "EH", "xval": 0.000000000000000001, "display": "Exafarads"}
        ]
    },
    {
        "type": "Current",
        "keywords": "amps ampere current electrical flow biot",
        "units": [
            { "unit": "A", "xval": 1, "display": "Amperes"},
            { "unit": "kA", "xval": 0.001, "display": "Kiloamperes"},
            { "unit": "mA", "xval": 1000, "display": "Milliamperes"},
            { "unit": "aA", "xval": 0.1, "display": "Abamperes (Biot)"}
        ]
    },
    {
        "type": "Density",
        "keywords": "compact volume mass weight dense density",
        "units": [
            { "unit": "mg/mm3", "xval": 0.001, "display": "Milligrams per Cubic-Millimeter"},
            { "unit": "mg/cm3", "xval": 1, "display": "Milligrams per Cubic-Centimeter"},
            { "unit": "mg/m3", "xval": 1000000, "display": "Milligrams per Cubic-Meter"},
            { "unit": "g/mm3", "xval": 0.000001, "display": "Grams per Cubic-Millimeter"},
            { "unit": "g/cm3", "xval": 0.001, "display": "Grams per Cubic-Centimeter"},
            { "unit": "g/m3", "xval": 1000, "display": "Grams per Cubic-Meter"},
            { "unit": "kg/mm3", "xval": 0.000000001, "display": "Kilograms per Cubic-Millimeter"},
            { "unit": "kg/cm3", "xval": 0.000001, "display": "Kilograms per Cubic-Centimeter"},
            { "unit": "kg/m3", "xval": 1, "display": "Kilograms per Cubic-Meter"},
            { "unit": "mg/mL", "xval": 1, "display": "Milligrams per Milliliter"},
            { "unit": "mg/L", "xval": 1000, "display": "Milligrams per Liter"},
            { "unit": "g/mL", "xval": 0.001, "display": "Grams per Milliliter"},
            { "unit": "g/L", "xval": 1, "display": "Grams per Liter"},
            { "unit": "kg/mL", "xval": 0.000001, "display": "Kilograms per Milliliter"},
            { "unit": "kg/L", "xval": 0.001, "display": "Kilograms per Liter"},
            { "unit": "oz/in3", "xval": 0.0005780366720016, "display": "Ounces (avdp) per Cubic-Inch"},
            { "unit": "oz/ft3", "xval": 0.9988473692188, "display": "Ounces (avdp) per Cubic-Foot"},
            { "unit": "lb/in3", "xval": 0.0000361272920001, "display": "Pounds (avdp) per Cubic-Inch"},
            { "unit": "lb/ft3", "xval": 0.06242796057617, "display": "Pounds (avdp) per Cubic-Foot"},
            { "unit": "oz/gal", "xval": 0.1335264712325, "display": "Ounces per Gallon (US)"},
            { "unit": "lb/gal", "xval": 0.008345404452031, "display": "Pounds per Gallon (US)"},
            { "unit": "grain/gal", "xval": 58.41783116413, "display": "Grains per Gallon (US)"},
            { "unit": "grain/ft3", "xval": 436.995724033, "display": "Grains per Cubic-Foot"},
            { "unit": "grain/in3", "xval": 0.252891044000579, "display": "Grains per Cubic-Inch"},
            { "unit": "slug/ft3", "xval": 0.00194032033198, "display": "Slugs per Cubic-Foot"},
            { "unit": "slug/in3", "xval": 0.000001122870562488, "display": "Slugs per Cubic-Inch"}
        ]
    },
    {
        "type": "Energy",
        "keywords": "energy btu hvac air refrigeration heat work",
        "units": [
            { "unit": "btu", "xval": 1, "display": "British Thermal Units (IT)"},
            { "unit": "mbtu", "xval": 0.000001, "display": "Mega British Thermal Units (IT)"},
            { "unit": "cal", "xval": 251.8272344, "display": "Calories"},
            { "unit": "kcal", "xval": 0.2519957611111, "display": "Kilocalories"},
            { "unit": "dyne-cm", "xval": 10550558526.2, "display": "Dyne-Centimeters"},
            { "unit": "meV", "xval": 6.585137817547E+24, "display": "Millielectron-Volts"},
            { "unit": "eV", "xval": 6.585137817547E+21, "display": "Electron-Volts"},
            { "unit": "keV", "xval": 6585137817547000000, "display": "Kiloelectron-Volts"},
            { "unit": "MeV", "xval": 6585137817547000, "display": "Megaelectron-Volts"},
            { "unit": "GeV", "xval": 6585137817547, "display": "Gigaelectron-Volts"},
            { "unit": "in-lbf", "xval": 9338.031147479, "display": "Inch-Pounds"},
            { "unit": "ft-lbf", "xval": 778.1692622659, "display": "Foot-Pounds"},
            { "unit": "hp-hr", "xval": 0.0003930147790409, "display": "Horsepower-Hours"},
            { "unit": "aJ", "xval": 1.05505585262E+21, "display": "Attajoules"},
            { "unit": "pJ", "xval": 1055055852620000000, "display": "Picojoules"},
            { "unit": "nJ", "xval": 1055055852620000, "display": "Nanojoules"},
            { "unit": "uJ", "xval": 1055055852.62, "display": "Microjoules"},
            { "unit": "mJ", "xval": 1055055.85262, "display": "Millijoules"},
            { "unit": "J", "xval": 1055.05585262, "display": "Joules"},
            { "unit": "Nm", "xval": 1055.05585262, "display": "Newton-Meters"},
            { "unit": "kJ", "xval": 1.05505585262, "display": "Kilojoules"},
            { "unit": "kW-s", "xval": 1.05505585262, "display": "Kilowatt-Seconds"},
            { "unit": "kW-min", "xval": 0.017584264210332, "display": "Kilowatt-Minutes"},
            { "unit": "kW-hr", "xval": 0.0002930710701722, "display": "Kilowatt-Hours"},
            { "unit": "MW-s", "xval": 0.00105505585261992, "display": "Megawatt-Seconds"},
            { "unit": "MW-min", "xval": 0.000017584264210332, "display": "Megawatt-Minutes"},
            { "unit": "MW-hr", "xval": 2.930710701722E-07, "display": "Megawatt-Hours"},
            { "unit": "GW-s", "xval": 1.05505585261992E-06, "display": "Gigawatt-Seconds"},
            { "unit": "GW-min", "xval": 1.7584264210332E-08, "display": "Gigawatt-Minutes"},
            { "unit": "GW-hr", "xval": 2.930710701722E-10, "display": "Gigawatt-Hours"},
            { "unit": "therms", "xval": 0.000009999998603107, "display": "Therms (US)"},
            { "unit": "W-s", "xval": 1055.05585262, "display": "Watt-Seconds"},
            { "unit": "W-min", "xval": 17.5842642103333, "display": "Watt-Minutes"},
            { "unit": "W-hr", "xval": 0.293071070172222, "display": "Watt-Hours"},
            { "unit": "erg", "xval": 10550558526.2, "display": "Erg"}
        ]
    },
    {
        "type": "Force",
        "keywords": "force newton joule slug",
        "units": [
            { "unit": "gf", "xval": 101972, "display": "Gram-Force"},
            { "unit": "J/cm", "xval": 10, "display": "Joule per Centimeter"},
            { "unit": "kgf", "xval": 101.972, "display": "Kilogram-Force"},
            { "unit": "kN", "xval": 1, "display": "Kilonewtons"},
            { "unit": "kg-m/s2", "xval": 1000, "display": "Kilogram-meters per Second-Squared"},
            { "unit": "m-kg/s2", "xval": 1000, "display": "Kilogram-meters per Second-Squared"},
            { "unit": "kip", "xval": 0.224809, "display": "Kilopound-Force"},
            { "unit": "mN", "xval": 1000000, "display": "Millinewtons"},
            { "unit": "N", "xval": 1000, "display": "Newtons"},
            { "unit": "ozf", "xval": 3596.9431, "display": "Ounce-Force (avdp)"},
            { "unit": "lbf", "xval": 224.80894, "display": "Pound-Force (avdp)"},
            { "unit": "lb-ft/s2", "xval": 7233.0138512, "display": "Foot-Pounds per Second-Squared"},
            { "unit": "ft-lb/s2", "xval": 7233.0138512, "display": "Foot-Pounds per Second-Squared"},
            { "unit": "poundal", "xval": 7233.0138512, "display": "Poundals"},
            { "unit": "slug-ft/s2", "xval": 224.809, "display": "Slug-Feet per Second-Squared"},
            { "unit": "slugf", "xval": 6.98728, "display": "Slug-Force"}
        ]
    },
    {
        "type": "Frequency",
        "keywords": "frequency hertz hz wave wavelength sound cycle",
        "units": [
            { "unit": "aHz", "xval": 1000000000000000000, "display": "Attohertz"},
            { "unit": "fHz", "xval": 1000000000000000, "display": "Femtohertz"},
            { "unit": "pHz", "xval": 1000000000000, "display": "Picohertz"},
            { "unit": "nHz", "xval": 1000000000, "display": "Nanohertz"},
            { "unit": "uHz", "xval": 1000000, "display": "Microhertz"},
            { "unit": "mHz", "xval": 1000, "display": "Millihertz"},
            { "unit": "Hz", "xval": 1, "display": "Hertz"},
            { "unit": "kHz", "xval": 1000, "display": "Kilohertz"},
            { "unit": "MHz", "xval": 0.000001, "display": "Megahertz"},
            { "unit": "GHz", "xval": 0.000000001, "display": "Gigahertz"},
            { "unit": "THz", "xval": 0.000000000001, "display": "Terahertz"},
            { "unit": "PHz", "xval": 0.000000000000001, "display": "Petahertz"},
            { "unit": "Ehz", "xval": 0.000000000000000001, "display": "Exahertz"}
        ]
    },
    {
        "type": "Inductance",
        "keywords": "electrical inductance henry",
        "units": [
            { "unit": "aH", "xval": 1000000000000000000, "display": "Attohenry"},
            { "unit": "fH", "xval": 1000000000000000, "display": "Femtohenries"},
            { "unit": "pH", "xval": 1000000000000, "display": "Picohenries"},
            { "unit": "nH", "xval": 1000000000, "display": "Nanohenries"},
            { "unit": "abH", "xval": 1000000000, "display": "Abhenries"},
            { "unit": "uH", "xval": 1000000, "display": "Microhenries"},
            { "unit": "mH", "xval": 1000, "display": "Millihenries"},
            { "unit": "cH", "xval": 100, "display": "Centihenries"},
            { "unit": "H", "xval": 1, "display": "Henries"},
            { "unit": "kH", "xval": 0.001, "display": "Kilohenries"},
            { "unit": "MH", "xval": 0.000001, "display": "Megahenries"},
            { "unit": "GH", "xval": 0.000000001, "display": "Gigahenries"},
            { "unit": "TH", "xval": 0.000000000001, "display": "Terrahenries"},
            { "unit": "PH", "xval": 0.000000000000001, "display": "Petahenries"},
            { "unit": "EH", "xval": 0.000000000000000001, "display": "Exahenries"}
        ]
    },
    {
        "type": "Inertia",
        "keywords": "inertia inertial moment impact",
        "units": [
            { "unit": "kg-m2", "xval": 1, "display": "Kilogram Meters-Squared"},
            { "unit": "kg-cm2", "xval": 10000, "display": "Kilogram Centimeters-Squared"},
            { "unit": "kg-mm2", "xval": 1000000, "display": "Kilogram Millimeters-Squared"},
            { "unit": "g-cm2", "xval": 10000000, "display": "Gram Centimeters-Squared"},
            { "unit": "g-mm2", "xval": 1000000000, "display": "Gram Millimeters-Squared"},
            { "unit": "kgf-m-s2", "xval": 0.1019716213, "display": "Kilogram-Force-Meter Seconds-Squared"},
            { "unit": "lb-ft2", "xval": 23.73036040423, "display": "Pound Feet-Squard"},
            { "unit": "lbf-ft-s2", "xval": 0.7375621418999, "display": "Pound-Force-Foot Seconds-Squared"},
            { "unit": "lb-in2", "xval": 3417.171898209, "display": "Pound Inches-Squared"},
            { "unit": "lbf-in-s2", "xval": 8.850745702999, "display": "Pound-Force-Inch Seconds-Squared"},
            { "unit": "slug-ft2", "xval": 0.7375621418999, "display": "Slug Feet-Squared"}
        ]
    },
    {
        "type": "Length",
        "keywords": "length long width height depth distance short",
        "units": [
            { "unit": "am", "xval": 1E+21, "display": "Attometers"},
            { "unit": "fm", "xval": 1000000000000000000, "display": "Femtometers"},
            { "unit": "nm", "xval": 1000000000000, "display": "Nanometers"},
            { "unit": "um", "xval": 1000000000, "display": "Micrometers (Microns)"},
            { "unit": "mm", "xval": 1000000, "display": "Millimeters"},
            { "unit": "cm", "xval": 100000, "display": "Centimeters"},
            { "unit": "dm", "xval": 10000, "display": "Decimeters"},
            { "unit": "m", "xval": 1000, "display": "Meters"},
            { "unit": "dam", "xval": 100, "display": "Decameters"},
            { "unit": "hm", "xval": 10, "display": "Hectometer"},
            { "unit": "km", "xval": 1, "display": "Kilometers"},
            { "unit": "uin", "xval": 39370078740.16, "display": "Microinch"},
            { "unit": "mil", "xval": 39370078.74016, "display": "Mil (Thousandth of an Inch)"},
            { "unit": "in", "xval": 39370.07874016, "display": "Inches"},
            { "unit": "ft", "xval": 3280.839895013, "display": "Feet"},
            { "unit": "yd", "xval": 1093.613298338, "display": "Yards"},
            { "unit": "mi", "xval": 0.6213711922373, "display": "Mile"},
            { "unit": "ls", "xval": 0.000003335640951982, "display": "Light Seconds"},
            { "unit": "lm", "xval": 5.55940158663587E-08, "display": "Light Minutes"},
            { "unit": "ly", "xval": 1.05700083402462E-13, "display": "Light Minutes"},
            { "unit": "pc", "xval": 3.24077928944437E-14, "display": "Parsecs"},
            { "unit": "au", "xval": 6.68458712226845E-09, "display": "Astronomical Units"}
        ]
    },
    {
        "type": "Mass",
        "keywords": "mass weight ton gram pound lbm",
        "units": [
            { "unit": "carats", "xval": 5000, "display": "Carats"},
            { "unit": "drams", "xval": 564.38339, "display": "Drams (avdp)"},
            { "unit": "grains", "xval": 15432.358, "display": "Grains (avdp)"},
            { "unit": "g", "xval": 1000, "display": "Grams"},
            { "unit": "kg", "xval": 1, "display": "Kilograms"},
            { "unit": "ug", "xval": 1000000000, "display": "Micrograms"},
            { "unit": "mg", "xval": 1000000, "display": "Milligrams"},
            { "unit": "oz", "xval": 35.273962, "display": "Ounces (avdp)"},
            { "unit": "lb", "xval": 2.20462, "display": "Pounds (avdp)"},
            { "unit": "stones", "xval": 0.157473, "display": "Stones"},
            { "unit": "ton", "xval": 0.0011023, "display": "Ton (short)"},
            { "unit": "ton-m", "xval": 0.001, "display": "Ton (metric)"}
        ]
    },
    {
        "type": "Mass Flow Rate",
        "keywords": "mass flow rate speed weight",
        "units": [
            { "unit": "carats/s", "xval": 5000, "display": "Carats per Second"},
            { "unit": "carats/min", "xval": 300000, "display": "Carats per Minute"},
            { "unit": "carats/hr", "xval": 18000000, "display": "Carats per Hour"},
            { "unit": "drams/s", "xval": 564.38339, "display": "Drams (avdp) per Second"},
            { "unit": "drams/min", "xval": 33863.0034, "display": "Drams (avdp) per Minute"},
            { "unit": "drams/hr", "xval": 2031780.204, "display": "Drams (avdp) per Hour"},
            { "unit": "grains/s", "xval": 15432.358, "display": "Grains (avdp) per Second"},
            { "unit": "grains/min", "xval": 925941.48, "display": "Grains (avdp) per Minute"},
            { "unit": "grains/hr", "xval": 55556488.8, "display": "Grains (avdp) per Hour"},
            { "unit": "g/s", "xval": 1000, "display": "Grams per Second"},
            { "unit": "g/min", "xval": 60000, "display": "Grams per Minute"},
            { "unit": "g/hr", "xval": 3600000, "display": "Grams per Hour"},
            { "unit": "kg/s", "xval": 1, "display": "Kilograms per Second"},
            { "unit": "kg/min", "xval": 60, "display": "Kilograms per Minute"},
            { "unit": "kg/hr", "xval": 3600, "display": "Kilograms per Hour"},
            { "unit": "ug/s", "xval": 1000000000, "display": "Micrograms per Second"},
            { "unit": "ug/min", "xval": 60000000000, "display": "Micrograms per Minute"},
            { "unit": "ug/hr", "xval": 3600000000000, "display": "Micrograms per Hour"},
            { "unit": "mg/s", "xval": 1000000, "display": "Milligrams per Second"},
            { "unit": "mg/min", "xval": 60000000, "display": "Milligrams per Minute"},
            { "unit": "mg/hr", "xval": 3600000000, "display": "Milligrams per Hour"},
            { "unit": "oz/s", "xval": 35.273962, "display": "Ounces (avdp) per Second"},
            { "unit": "oz/min", "xval": 2116.43772, "display": "Ounces (avdp) per Minute"},
            { "unit": "oz/hr", "xval": 126986.2632, "display": "Ounces (avdp) per Hour"},
            { "unit": "lb/s", "xval": 2.20462, "display": "Pounds (avdp) per Second"},
            { "unit": "lb/min", "xval": 132.2772, "display": "Pounds (avdp) per Minute"},
            { "unit": "lb/hr", "xval": 7936.632, "display": "Pounds (avdp) per Hour"},
            { "unit": "stones/s", "xval": 0.157473, "display": "Stones per Second"},
            { "unit": "stones/min", "xval": 9.44838, "display": "Stones per Minute"},
            { "unit": "stones/hr", "xval": 566.9028, "display": "Stones per Hour"},
            { "unit": "ton/s", "xval": 0.0011023, "display": "Tons (short) per Second"},
            { "unit": "ton/min", "xval": 0.066138, "display": "Tons (short) per Minute"},
            { "unit": "ton/hr", "xval": 3.96828, "display": "Tons (short) per Hour"},
            { "unit": "ton-m/s", "xval": 0.001, "display": "Tons (metric) per Second"},
            { "unit": "ton-m/min", "xval": 0.06, "display": "Tons (metric) per Minute"},
            { "unit": "ton-m/hr", "xval": 3.6, "display": "Tons (metric) per Hour"},
            { "unit": "slug/s", "xval": 0.0685218, "display": "Slugs per Second"},
            { "unit": "slug/min", "xval": 4.111308, "display": "Slugs per Minute"},
            { "unit": "slug/hr", "xval": 246.67848, "display": "Slugs per Hour"}
        ]
    },
    {
        "type": "Power",
        "keywords": "watt horsepower hp power btu",
        "units": [
            { "unit": "aW", "xval": 1E+21, "display": "Attowatts"},
            { "unit": "fW", "xval": 1000000000000000000, "display": "Femtowatts"},
            { "unit": "pW", "xval": 1000000000000000, "display": "Picowatts"},
            { "unit": "nW", "xval": 1000000000000, "display": "Nanowatts"},
            { "unit": "uW", "xval": 1000000000, "display": "Microwatts"},
            { "unit": "mW", "xval": 1000000, "display": "Milliwatts"},
            { "unit": "W", "xval": 1000, "display": "Watts"},
            { "unit": "kW", "xval": 1, "display": "Kilowatts"},
            { "unit": "MW", "xval": 0.001, "display": "Megawatts"},
            { "unit": "GW", "xval": 0.000001, "display": "Gigawatts"},
            { "unit": "TW", "xval": 0.000000001, "display": "Terrawatts"},
            { "unit": "PW", "xval": 0.000000000001, "display": "Petawatts"},
            { "unit": "EW", "xval": 0.000000000000001, "display": "Exawatts"},
            { "unit": "hp", "xval": 1.341022089595, "display": "Horsepower (550 ft-lbf/s)"},
            { "unit": "hp-m", "xval": 1.359621617304, "display": "Horsepower (metric)"},
            { "unit": "hp-b", "xval": 0.1019419950048, "display": "Horsepower (boiler)"},
            { "unit": "hp-e", "xval": 1.340482573726, "display": "Horsepower (electric)"},
            { "unit": "hp-w", "xval": 1.340405311758, "display": "Horsepower (water)"},
            { "unit": "btu/s", "xval": 0.9478171203132, "display": "British Thermal Units (IT) per Second"},
            { "unit": "BTU/s", "xval": 0.9478171203132, "display": "British Thermal Units (IT) per Second"},
            { "unit": "btu/min", "xval": 56.869027218792, "display": "British Thermal Units (IT) per Minute"},
            { "unit": "BTU/min", "xval": 56.869027218792, "display": "British Thermal Units (IT) per Minute"},
            { "unit": "btu/hr", "xval": 3412.14163312752, "display": "British Thermal Units (IT) per Hour"},
            { "unit": "BTU/hr", "xval": 3412.14163312752, "display": "British Thermal Units (IT) per Hour"},
            { "unit": "MBtu/s", "xval": 0.000947817120313333, "display": "One-Thousand British Thermal Units (IT) per Second"},
            { "unit": "mbtu/s", "xval": 0.000947817120313333, "display": "One-Thousand British Thermal Units (IT) per Second"},
            { "unit": "MBtu/min", "xval": 0.0568690272188, "display": "One-Thousand British Thermal Units (IT) per Minute"},
            { "unit": "mbtu/min", "xval": 0.0568690272188, "display": "One-Thousand British Thermal Units (IT) per Minute"},
            { "unit": "MBtu/hr", "xval": 3.412141633128, "display": "One-Thousand British Thermal Units (IT) per Hour"},
            { "unit": "mbtu/hr", "xval": 3.412141633128, "display": "One-Thousand British Thermal Units (IT) per Hour"},
            { "unit": "MBH", "xval": 3.412141633128, "display": "One-Thousand British Thermal Units (IT) per Hour"},
            { "unit": "mbh", "xval": 3.412141633128, "display": "One-Thousand British Thermal Units (IT) per Hour"},
            { "unit": "MMBtu/hr", "xval": 0.003412141633128, "display": "One-Million British Thermal Units (IT) per Hour"},
            { "unit": "MMBH", "xval": 0.003412141633128, "display": "One-Million British Thermal Units (IT) per Hour"},
            { "unit": "mmbh", "xval": 0.003412141633128, "display": "One-Million British Thermal Units (IT) per Hour"},
            { "unit": "ton", "xval": 0.284345136094, "display": "Ton (Refriegeration)"},
            { "unit": "cal/s", "xval": 238.8458966275, "display": "Calories per Second"},
            { "unit": "cal/min", "xval": 14330.75379765, "display": "Calories per Minute"},
            { "unit": "cal/hr", "xval": 859845.227859, "display": "Calories per Hour"},
            { "unit": "kcal/s", "xval": 0.2390057361377, "display": "Kilocalories per Second"},
            { "unit": "kcal/min", "xval": 14.340344168262, "display": "Kilocalories per Minute"},
            { "unit": "kcal/hr", "xval": 860.42065009572, "display": "Kilocalories per Hour"},
            { "unit": "ft-lbf/s", "xval": 737.5621492783, "display": "Foot Pound-Force per Second"},
            { "unit": "ft-lbf/min", "xval": 44253.728956698, "display": "Foot Pound-Force per Minute"},
            { "unit": "ft-lbf/hr", "xval": 2655223.73740188, "display": "Foot Pound-Force per Hour"},
            { "unit": "erg/s", "xval": 10000000000, "display": "Ergs per Second"},
            { "unit": "erg/min", "xval": 600000000000, "display": "Ergs per Minute"},
            { "unit": "erg/hr", "xval": 36000000000000, "display": "Ergs per Hour"},
            { "unit": "VA", "xval": 1000, "display": "Volt-Amperes"},
            { "unit": "kVA", "xval": 1, "display": "Kilovolt-Amperes"},
            { "unit": "Nm/s", "xval": 1000, "display": "Newton-Meters per Second"},
            { "unit": "J/s", "xval": 1000, "display": "Joules per Second"},
            { "unit": "J/min", "xval": 60000, "display": "Joules per Minute"},
            { "unit": "J/hr", "xval": 3600000, "display": "Joules per Hour"},
            { "unit": "kJ/s", "xval": 1, "display": "Kilojoules per Second"},
            { "unit": "kJ/min", "xval": 60, "display": "Kilojoules per Minute"},
            { "unit": "kJ/hr", "xval": 3600, "display": "Kilojoules per Hour"}
        ]
    },
    {
        "type": "Pressure",
        "keywords": "psi psia psig pressure squeeze pascal atmospheric pressure bar",
        "units": [
            { "unit": "atm", "xval": 9.86923, "display": "atmospheric pressure"},
            { "unit": "bar", "xval": 10, "display": "bars"},
            { "unit": "cmHg", "xval": 750.062, "display": "centimeters of mercury (0 Celsius)"},
            { "unit": "cmWC", "xval": 10197.4, "display": "centimeters of water (4 Celsius)"},
            { "unit": "ftWC", "xval": 334.562, "display": "feet of Water (4 Celsius)"},
            { "unit": "GPa", "xval": 0.001, "display": "gigapascals"},
            { "unit": "HPa", "xval": 10000, "display": "hectopascals"},
            { "unit": "inHg", "xval": 295.3, "display": "inches of mecury (0 Celsius)"},
            { "unit": "inHg-15", "xval": 296.105, "display": "inches of mercury (15.56 Celsius)"},
            { "unit": "inWC-15", "xval": 4018.56, "display": "inches of water (15.56 Celsius)"},
            { "unit": "inWC", "xval": 4014.74, "display": "inches of water (4 Celsius)"},
            { "unit": "kgf/mm2", "xval": 0.101972, "display": "kilogram-force per millimeter-squared"},
            { "unit": "kgf/cm2", "xval": 10.1972, "display": "kilogram-force per centimeter-squared"},
            { "unit": "kgf/m2", "xval": 101972, "display": "kilogram-force per meter-square"},
            { "unit": "kPa", "xval": 1000, "display": "kilopascals"},
            { "unit": "kpf/in2", "xval": 0.145038, "display": "kilopound-force per inch-squared"},
            { "unit": "MPa", "xval": 1, "display": "megapascals"},
            { "unit": "mWC-15", "xval": 102.071, "display": "meters of water (15.56 Celsius)"},
            { "unit": "mWC", "xval": 101.974, "display": "meters of water (4 Celsius)"},
            { "unit": "ubar", "xval": 10000000, "display": "microbars"},
            { "unit": "microbar", "xval": 10000000, "display": "microbars"},
            { "unit": "utorr", "xval": 7500620, "display": "millitorr"},
            { "unit": "millitorr", "xval": 7500620, "display": "millitorr"},
            { "unit": "ubar", "xval": 10000, "display": "millibar"},
            { "unit": "millibar", "xval": 10000, "display": "millibar"},
            { "unit": "mmHg", "xval": 7500.616827, "display": "millimeters of mercury (0 Celsius)"},
            { "unit": "mmWC", "xval": 102071, "display": "millimeters of water (4 Celsius)"},
            { "unit": "mmWC-15", "xval": 101974, "display": "millimeters of water (15.56 Celsius)"},
            { "unit": "N/m2", "xval": 1000000, "display": "Newtons per meter-squared"},
            { "unit": "P", "xval": 1000000, "display": "pascals"},
            { "unit": "lbf/ft2", "xval": 20885.4, "display": "pound-force per foot-squared"},
            { "unit": "lbf/in2", "xval": 145.038, "display": "pound-force per inch-squared"},
            { "unit": "psi", "xval": 145.038, "display": "pound-force per inch-squared"},
            { "unit": "torr", "xval": 7500.62, "display": "torr"}
        ]
    },
    {
        "type": "Resistance",
        "keywords": "resistance ohm electrical",
        "units": [
            { "unit": "uohm", "xval": 1000000, "display": "Microohms"},
            { "unit": "mohm", "xval": 1000, "display": "Milliohms"},
            { "unit": "ohm", "xval": 1, "display": "Ohms"},
            { "unit": "kohm", "xval": 0.001, "display": "Kiloohms"},
            { "unit": "Mohm", "xval": 0.000001, "display": "Megaohms"},
            { "unit": "V/A", "xval": 1, "display": "Volts per Ampere"},
            { "unit": "abohm", "xval": 1000000000, "display": "Abohms"}
        ]
    },
    {
        "type": "Sound",
        "keywords": "hear hearing sound decibel dB db loud noise",
        "units": [
            { "unit": "dB", "xval": 1, "display": "Decibels"},
            { "unit": "B", "xval": 0.1, "display": "Bels"},
            { "unit": "Np", "xval": 0.11512925465, "display": "Nepers"}
        ]
    },
    {
        "type": "Specific Volume",
        "keywords": "sv specific volume compact volume mass weight dense density",
        "units": [
            { "unit": "mm3/mg", "xval": 1000, "display": "Cubic-Millimeters per Milligram"},
            { "unit": "mm3/g", "xval": 1000000, "display": "Cubic-Millimeters per Gram"},
            { "unit": "mm3/kg", "xval": 1000000000, "display": "Cubic-Millimeters per Kilogram"},
            { "unit": "cm3/mg", "xval": 1, "display": "Cubic-Centimeters per Milligram"},
            { "unit": "cm3/g", "xval": 1000, "display": "Cubic-Centimeters per Gram"},
            { "unit": "cm3/kg", "xval": 1000000, "display": "Cubic-Centimeters per Kilogram"},
            { "unit": "m3/mg", "xval": 0.000001, "display": "Cubic-Meters per Milligram"},
            { "unit": "m3/g", "xval": 0.001, "display": "Cubic-Meters per Gram"},
            { "unit": "m3/kg", "xval": 1, "display": "Cubic-Meters per Kilogram"},
            { "unit": "mL/mg", "xval": 0.001, "display": "Milliliters per Milligram"},
            { "unit": "mL/g", "xval": 1, "display": "Milliliters per Gram"},
            { "unit": "mL/kg", "xval": 1000, "display": "Milliliters per Kilogram"},
            { "unit": "L/mg", "xval": 0.000001, "display": "Liters per Milligram"},
            { "unit": "L/g", "xval": 0.001, "display": "Liters per Gram"},
            { "unit": "L/kg", "xval": 1000, "display": "Liters per Kilogram"},
            { "unit": "in3/mg", "xval": 0.02767990497984, "display": "Cubic-Inches per Milligram"},
            { "unit": "in3/g", "xval": 27.67990497984, "display": "Cubic-Inches per Gram"},
            { "unit": "in3/kg", "xval": 27679.90497984, "display": "Cubic-Inches per Kilogram"},
            { "unit": "in3/oz", "xval": 784.71303954423, "display": "Cubic-Inches per Ounce"},
            { "unit": "in3/lb", "xval": 12555.4086327077, "display": "Cubic-Inches per Pound"},
            { "unit": "ft3/mg", "xval": 0.00003531466672, "display": "Cubic-Feet per Milligram"},
            { "unit": "ft3/g", "xval": 0.03531466672, "display": "Cubic-Feet per Gram"},
            { "unit": "ft3/kg", "xval": 35.31466672, "display": "Cubic-Feet per Kilogram"},
            { "unit": "ft3/oz", "xval": 1.001153970625, "display": "Cubic-Feet per Ounce"},
            { "unit": "ft3/lb", "xval": 16.01846353, "display": "Cubic-Feet per Pound"},
            { "unit": "gal/lb", "xval": 119.826435935, "display": "Gallons per Pound"}
        ]
    },
    {
        "type": "Surface Tension",
        "keywords": "tensile surface tension force shear",
        "units": [
            { "unit": "mN/cm", "xval": 0.00001, "display": "Millinewtons per Centimeter"},
            { "unit": "N/cm", "xval": 0.01, "display": "Newtons per Centimeter"},
            { "unit": "kN/cm", "xval": 10, "display": "Kilonewtons per Centimeter"},
            { "unit": "mN/m", "xval": 1000, "display": "Millinewtons per Meter"},
            { "unit": "N/m", "xval": 1, "display": "Newtons per Meter"},
            { "unit": "kN/m", "xval": 0.001, "display": "Kilonewtons per Meter"},
            { "unit": "gf/cm", "xval": 1.019716213, "display": "Gram-Force per Centimeter"},
            { "unit": "dyne/cm", "xval": 1000, "display": "Dyne per Centimeter"},
            { "unit": "erg/mm2", "xval": 1000, "display": "Ergs per Millimeters-Squared"},
            { "unit": "erg/cm2", "xval": 10, "display": "Ergs per Centimeters-Squared"},
            { "unit": "lbf/in", "xval": 0.005710147098, "display": "Pound-Force per Inch"}
        ]
    },
    {
        "type": "Time",
        "keywords": "second minute week month year day hour time",
        "units": [
            { "unit": "ns", "xval": 3600000000000, "display": "Nanoseconds"},
            { "unit": "us", "xval": 3600000000, "display": "Microseconds"},
            { "unit": "ms", "xval": 3600000, "display": "Milliseconds"},
            { "unit": "s", "xval": 3600, "display": "Seconds"},
            { "unit": "min", "xval": 60, "display": "Minutes"},
            { "unit": "hr", "xval": 1, "display": "Hours"},
            { "unit": "day", "xval": 0.416666666666666, "display": "Days"},
            { "unit": "wk", "xval": 0.005952380952381, "display": "Weeks"},
            { "unit": "mon", "xval": 0.001369863013699, "display": "Months"},
            { "unit": "yr", "xval": 0.0001141552511416, "display": "Years"}
        ]
    },
    {
        "type": "Torque",
        "keywords": "torque twist dyne",
        "units": [
            { "unit": "N-m", "xval": 1, "display": "Newton Meters"},
            { "unit": "N-cm", "xval": 100, "display": "Newton Centimeters"},
            { "unit": "N-mm", "xval": 1000, "display": "Newton Millimeters"},
            { "unit": "kN-m", "xval": 0.001, "display": "Kilonewton Meters"},
            { "unit": "dyne-m", "xval": 100000, "display": "Dyne Meters"},
            { "unit": "dyne-cm", "xval": 10000000, "display": "Dyne Centimeters"},
            { "unit": "dyne-mm", "xval": 100000000, "display": "Dyne Millimeters"},
            { "unit": "kgf-m", "xval": 0.1019716212978, "display": "Kilogram-Force Meters"},
            { "unit": "kgf-cm", "xval": 10.19716212978, "display": "Kilogram-Force Centimeters"},
            { "unit": "kgf-mm", "xval": 101.9716212978, "display": "Kilogram-Force Millimeters"},
            { "unit": "gf-m", "xval": 101.9716212978, "display": "Gram-Force Meters"},
            { "unit": "gf-cm", "xval": 10197.16212978, "display": "Gram-Force Centimeters"},
            { "unit": "gf-mm", "xval": 101971.6212978, "display": "Gram-Force Millimeters"},
            { "unit": "lbf-ft", "xval": 0.7375621211697, "display": "Pound-Force Feet"},
            { "unit": "lbf-in", "xval": 8.850745454036, "display": "Pound-Force Inches"}
        ]
    },
    {
        "type": "Velocity (Angular)",
        "keywords": "angular velocity speed angle circular circle round radian degree revolution",
        "units": [
            { "unit": "deg/hr", "xval": 1296000, "display": "degrees per hour"},
            { "unit": "deg/min", "xval": 21600, "display": "degrees per minute"},
            { "unit": "deg/s", "xval": 360, "display": "degrees per second"},
            { "unit": "grade/s", "xval": 400, "display": "grade per second"},
            { "unit": "rad/hr", "xval": 22619.4671052, "display": "radians per hour"},
            { "unit": "rad/min", "xval": 376.99111842, "display": "radians per minute"},
            { "unit": "rad/s", "xval": 6.283185307, "display": "radians per second"},
            { "unit": "rev/hr", "xval": 3600, "display": "revolutions per hour"},
            { "unit": "rev/min", "xval": 60, "display": "revolutions per minute"},
            { "unit": "rpm", "xval": 60, "display": "revolutions per minute"},
            { "unit": "rev/s", "xval": 1, "display": "revolutions per second"},
            { "unit": "rps", "xval": 1, "display": "revolutions per second"}
        ]
    },
    {
        "type": "Velocity (Linear)",
        "keywords": "velocity speed linear straight per second meter feet inch mile mph fpm",
        "units": [
            { "unit": "m/s", "xval": 1, "display": "Meters per Second"},
            { "unit": "m/min", "xval": 60, "display": "Meters per Minute"},
            { "unit": "m/hr", "xval": 3600, "display": "Meters per Hour"},
            { "unit": "fps", "xval": 3.28083989501389, "display": "Feet per Second"},
            { "unit": "ft/s", "xval": 3.28083989501389, "display": "Feet per Second"},
            { "unit": "ft/min", "xval": 196.850393700833, "display": "Feet per Minute"},
            { "unit": "fpm", "xval": 196.850393700833, "display": "Feet per Minute"},
            { "unit": "ft/hr", "xval": 11811.02362205, "display": "Feet per Hour"},
            { "unit": "fph", "xval": 11811.02362205, "display": "Feet per Hour"},
            { "unit": "ips", "xval": 39.37007874016, "display": "Inches per Second"},
            { "unit": "in/s", "xval": 39.37007874016, "display": "Inches per Second"},
            { "unit": "in/min", "xval": 2362.2047244096, "display": "Inches per Minute"},
            { "unit": "in/hr", "xval": 141732.283464576, "display": "Inches per Hour"},
            { "unit": "cm/s", "xval": 100, "display": "Centimeters per Second"},
            { "unit": "cm/min", "xval": 6000, "display": "Centimeters per Minute"},
            { "unit": "cm/hr", "xval": 360000, "display": "Centimeters per Hour"},
            { "unit": "mm/s", "xval": 1000, "display": "Millimeters per Second"},
            { "unit": "mm/min", "xval": 60000, "display": "Millimeters per Minute"},
            { "unit": "mm/hr", "xval": 3600000, "display": "Millimeters per Hour"},
            { "unit": "km/s", "xval": 0.001, "display": "Kilometers per Second"},
            { "unit": "km/min", "xval": 0.06, "display": "Kilometers per Minute"},
            { "unit": "km/hr", "xval": 3.6, "display": "Kilometers per Hour"},
            { "unit": "kph", "xval": 3.6, "display": "Kilometers per Hour"},
            { "unit": "mi/s", "xval": 0.0006213711922373, "display": "Miles per Second"},
            { "unit": "mi/min", "xval": 0.037282271534238, "display": "Miles per Minute"},
            { "unit": "mi/hr", "xval": 2.23693629205428, "display": "Miles per Hour"},
            { "unit": "mph", "xval": 2.23693629205428, "display": "Miles per Hour"},
            { "unit": "kn", "xval": 1.94384449244, "display": "Knots"},
            { "unit": "c", "xval": 3.335640951981E-09, "display": "Speed of Light (in a vacuum)"},
            { "unit": "M", "xval": 0.0033892974122, "display": "Mach (SI Standard)"}
        ]
    },
    {
        "type": "Viscosity (Dynamic Absolute)",
        "keywords": "viscosity poise dynamic absolute viscous",
        "units": [
            { "unit": "P-s", "xval": 1, "display": "Pascal-Seconds"},
            { "unit": "kgf-s/m2", "xval": 0.1019716212978, "display": "Kilogram-Force-Seconds per Meter-Squared"},
            { "unit": "N-s/m2", "xval": 1, "display": "Newton-Seconds per Meter-Squared"},
            { "unit": "mN-s/m2", "xval": 1000, "display": "Millinewton-Seconds per Meter-Squared"},
            { "unit": "dyne-s/cm2", "xval": 10, "display": "Dyne-Seconds per Centimeter-Squared"},
            { "unit": "nP", "xval": 10000000000, "display": "Nanopoise"},
            { "unit": "uP", "xval": 10000000, "display": "Micropoise"},
            { "unit": "mP", "xval": 10000, "display": "Millipoise"},
            { "unit": "cP", "xval": 1000, "display": "Centipoise"},
            { "unit": "P", "xval": 10, "display": "Poise"},
            { "unit": "kP", "xval": 0.01, "display": "Kilopoise"},
            { "unit": "MP", "xval": 0.00001, "display": "Megapoise"},
            { "unit": "GP", "xval": 0.00000001, "display": "Gigapoise"},
            { "unit": "lbf-s/in2", "xval": 0.0001450377377302, "display": "Pound-Force-Seconds per Inch-Squared"},
            { "unit": "lbf-s/ft2", "xval": 0.0208854342332, "display": "Pound-Force-Seconds per Foot-Squared"},
            { "unit": "g/cm/s", "xval": 10, "display": "Grams per Centimeter Per Second"},
            { "unit": "lb/ft/s", "xval": 0.67196897514, "display": "Pounds per Foot per Second"},
            { "unit": "lb/ft/hr", "xval": 2419.088310502, "display": "Pounds per Foot per Hour"},
            { "unit": "reyn", "xval": 0.0001451378809869, "display": "Reyn"}
        ]
    },
    {
        "type": "Viscosity (Kinematic)",
        "keywords": "kinematic viscosity stoke viscous",
        "units": [
            { "unit": "m2/s", "xval": 1, "display": "Meters-Squared per Second"},
            { "unit": "m2/hr", "xval": 3600, "display": "Meters-Squared per Hour"},
            { "unit": "cm2/s", "xval": 10000, "display": "Centimeters-Squared per Second"},
            { "unit": "mm2/s", "xval": 1000000, "display": "Millimeters-Squared per Second"},
            { "unit": "ft2/s", "xval": 10.7639104167, "display": "Feet-Squared per Second"},
            { "unit": "ft2/hr", "xval": 38750.07750016, "display": "Feet-Squared per Hour"},
            { "unit": "in2/s", "xval": 1550.003100006, "display": "Inches-Squared per Second"},
            { "unit": "GSt", "xval": 0.00001, "display": "Gigastokes"},
            { "unit": "MSt", "xval": 0.01, "display": "Megastokes"},
            { "unit": "kSt", "xval": 10, "display": "Kilostokes"},
            { "unit": "St", "xval": 10000, "display": "Stokes"},
            { "unit": "cSt", "xval": 1000000, "display": "Centistokes"},
            { "unit": "mSt", "xval": 10000000, "display": "Millistokes"},
            { "unit": "uSt", "xval": 10000000000, "display": "Microstokes"},
            { "unit": "nSt", "xval": 10000000000000, "display": "Nanostokes"}
        ]
    },
    {
        "type": "Volume",
        "keywords": "volume fill cube cubed cubic liquid dry",
        "units": [
            { "unit": "m3", "xval": 1, "display": "Cubic-Meters"},
            { "unit": "ft3", "xval": 35.3146667, "display": "Cubic-Feet"},
            { "unit": "in3", "xval": 61023.7440947, "display": "Cubic-Inches"},
            { "unit": "mm3", "xval": 1000000000, "display": "Cubic-Millimeters"},
            { "unit": "yd3", "xval": 1.3079506, "display": "Cubic-Yards"},
            { "unit": "cm3", "xval": 1000000, "display": "Cubic-Centimeters"},
            { "unit": "mL", "xval": 1000000, "display": "Milliliters"},
            { "unit": "cups", "xval": 4226.7528377, "display": "Cups"},
            { "unit": "gal", "xval": 264.1720524, "display": "Gallons"},
            { "unit": "L", "xval": 1000, "display": "Liters"},
            { "unit": "oz", "xval": 33814.0227013, "display": "Ounces"},
            { "unit": "tsp", "xval": 202884.136209, "display": "Teaspoons"},
            { "unit": "tbsp", "xval": 67628.0454048, "display": "Tablespoons"},
            { "unit": "qt", "xval": 1056.6882094, "display": "Quarts"}
        ]
    },
    {
        "type": "Volume Flow Rate",
        "keywords": "volumetric flow volume rate fill speed velocity weight cube cubic cubed",
        "units": [
            { "unit": "mm3/s", "xval": 1000000000, "display": "Cubic-Millimeters per Second"},
            { "unit": "mm3/min", "xval": 60000000000, "display": "Cubic-Millimeters per Minute"},
            { "unit": "mm3/hr", "xval": 3600000000000, "display": "Cubic-Millimeters per Hour"},
            { "unit": "cm3/s", "xval": 1000000, "display": "Cubic-Centimeters per Second"},
            { "unit": "cm3/min", "xval": 60000000, "display": "Cubic-Centimeters per Minute"},
            { "unit": "cm3/hr", "xval": 3600000000, "display": "Cubic-Centimeters per Hour"},
            { "unit": "m3/s", "xval": 1, "display": "Cubic-Meters per Second"},
            { "unit": "CMS", "xval": 1, "display": "Cubic-Meters per Second"},
            { "unit": "cms", "xval": 1, "display": "Cubic-Meters per Second"},
            { "unit": "m3/min", "xval": 60, "display": "Cubic-Meters per Minute"},
            { "unit": "CMM", "xval": 60, "display": "Cubic-Meters per Minute"},
            { "unit": "cmm", "xval": 60, "display": "Cubic-Meters per Minute"},
            { "unit": "m3/hr", "xval": 3600, "display": "Cubic-Meters per Hour"},
            { "unit": "CMH", "xval": 3600, "display": "Cubic-Meters per Hour"},
            { "unit": "cmh", "xval": 3600, "display": "Cubic-Meters per Hour"},
            { "unit": "km3/s", "xval": 0.000000001, "display": "Cubic-Kilometers per Second"},
            { "unit": "km3/min", "xval": 0.00000006, "display": "Cubic-Kilometers per Minute"},
            { "unit": "km3/hr", "xval": 0.0000036, "display": "Cubic-Kilometers per Hour"},
            { "unit": "in3/s", "xval": 61023.7440947, "display": "Cubic-Inches per Second"},
            { "unit": "in3/min", "xval": 3661424.645682, "display": "Cubic-Inches per Minute"},
            { "unit": "in3/hr", "xval": 219685478.74092, "display": "Cubic-Inches per Hour"},
            { "unit": "ft3/s", "xval": 35.3146667, "display": "Cubic-Feet per Second"},
            { "unit": "CFS", "xval": 35.3146667, "display": "Cubic-Feet per Second"},
            { "unit": "cfs", "xval": 35.3146667, "display": "Cubic-Feet per Second"},
            { "unit": "ft3/min", "xval": 2118.880002, "display": "Cubic-Feet per Minute"},
            { "unit": "cfm", "xval": 2118.880002, "display": "Cubic-Feet per Minute"},
            { "unit": "CFM", "xval": 2118.880002, "display": "Cubic-Feet per Minute"},
            { "unit": "ft3/hr", "xval": 127132.80012, "display": "Cubic-Feet per Hour"},
            { "unit": "CFH", "xval": 127132.80012, "display": "Cubic-Feet per Hour"},
            { "unit": "cfs", "xval": 127132.80012, "display": "Cubic-Feet per Hour"},
            { "unit": "yd3/s", "xval": 1.3079506, "display": "Cubic-Yards per Second"},
            { "unit": "yd3/min", "xval": 78.477036, "display": "Cubic-Yards per Minute"},
            { "unit": "yd3/hr", "xval": 4708.62216, "display": "Cubic-Yards per Hour"},
            { "unit": "gal/s", "xval": 264.1720524, "display": "Gallons per Second"},
            { "unit": "GPS", "xval": 264.1720524, "display": "Gallons per Second"},
            { "unit": "gps", "xval": 264.1720524, "display": "Gallons per Second"},
            { "unit": "gal/min", "xval": 15850.323144, "display": "Gallons per Minute"},
            { "unit": "GPM", "xval": 15850.323144, "display": "Gallons per Minute"},
            { "unit": "gpm", "xval": 15850.323144, "display": "Gallons per Minute"},
            { "unit": "gal/hr", "xval": 951019.38864, "display": "Gallons per Hour"},
            { "unit": "GPH", "xval": 951019.38864, "display": "Gallons per Hour"},
            { "unit": "gph", "xval": 951019.38864, "display": "Gallons per Hour"},
            { "unit": "oz/s", "xval": 33814.0227013, "display": "Ounces per Second"},
            { "unit": "oz/min", "xval": 2028841.362078, "display": "Ounces per Minute"},
            { "unit": "oz/hr", "xval": 121730481.72468, "display": "Ounces per Hour"},
            { "unit": "mL/s", "xval": 1000000, "display": "Milliliters per Second"},
            { "unit": "mL/min", "xval": 60000000, "display": "Milliliters per Minute"},
            { "unit": "mL/hr", "xval": 3600000000, "display": "Milliliters per Hour"},
            { "unit": "L/s", "xval": 1000, "display": "Liters per Second"},
            { "unit": "LPS", "xval": 1000, "display": "Liters per Second"},
            { "unit": "lps", "xval": 1000, "display": "Liters per Second"},
            { "unit": "L/min", "xval": 60000, "display": "Liters per Minute"},
            { "unit": "LPM", "xval": 60000, "display": "Liters per Minute"},
            { "unit": "lpm", "xval": 60000, "display": "Liters per Minute"},
            { "unit": "L/hr", "xval": 3600000, "display": "Liters per Hour"},
            { "unit": "LPH", "xval": 3600000, "display": "Liters per Hour"},
            { "unit": "lph", "xval": 3600000, "display": "Liters per Hour"},
            { "unit": "cup/s", "xval": 4226.7528377, "display": "Cups per Second"},
            { "unit": "cup/min", "xval": 253605.170262, "display": "Cups per Minute"},
            { "unit": "cup/hr", "xval": 15216310.21572, "display": "Cups per Hour"},
            { "unit": "tsp/s", "xval": 202884.136209, "display": "Teaspoons per Second"},
            { "unit": "tsp/min", "xval": 12173048.17254, "display": "Teaspoons per Minute"},
            { "unit": "tsp/hr", "xval": 730382890.3524, "display": "Teaspoons per Hour"},
            { "unit": "tbsp/s", "xval": 67628.0454048, "display": "Tablespoons per Second"},
            { "unit": "tbsp/min", "xval": 4057682.724288, "display": "Tablespoons per Minute"},
            { "unit": "tbsp/hr", "xval": 243460963.45728, "display": "Tablespoons per Hour"},
            { "unit": "qt/s", "xval": 1056.6882094, "display": "Quarts per Second"},
            { "unit": "qt/min", "xval": 63401.292564, "display": "Quarts per Minute"},
            { "unit": "qt/hr", "xval": 3804077.55384, "display": "Quarts per Hour"}
        ]
    }
];