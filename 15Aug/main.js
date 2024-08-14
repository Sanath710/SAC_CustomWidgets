var getScriptPromisify = src => {
    return new Promise(resolve => {
        $.getScript(src, resolve)
    })
}

var load_libs_flag = false;
var widget_ID_Name = {};

//// -------- Data Objects Starts -----------
var DO_FY = {}, DO_QT = {}, DO_MT = {}, DO_5Y = {};
//// -------- Data Objects Ends -------------


; (function () {

        const prepared = document.createElement('template')
        prepared.innerHTML = `
          <style type="text/css">
            @import url("https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/css/bootstrap.min.css");
            @import url("https://cdn.datatables.net/2.0.1/css/dataTables.bootstrap5.css");
			@import url("https://cdn.datatables.net/2.0.1/css/dataTables.dataTables.css");
            @import url("https://cdn.datatables.net/buttons/3.0.0/css/buttons.bootstrap5.css");
            @import url("https://cdnjs.cloudflare.com/ajax/libs/three-dots/0.3.2/three-dots.min.css");
            
          </style>
          <script src= "https://code.jquery.com/jquery-3.7.1.min.js"></script>
          <div id="root" style="width:100%; height:100%; padding:0%; overflow: auto; position: absolute; display: inline-grid;">
            <table id="example" class="table" style="visibility:hidden;">
                <thead>
                </thead>
                <tbody></tbody>
            </table>
          </div>
        `

        var total_cols = 0;
        var fixRowsObj = {};
        var groupRowMapping = {}, groupRowMapping_QT = {}, groupRowMapping_MT = {}, groupRowMapping_5Y = {};
        const masterRows = [];
        var indices = [], indices_QT = [], indices_MT = [];
        var gbl_finalPerCols_FY = {}, gbl_finalPerCols_QT = {}, gbl_finalPerCols_MT = {};
        var no_of_decimalPlaces = 1, no_of_decimalPlaces_K = 0, no_of_decimalPlaces_M = 1;
        var stateShown = "Num";

        class CustomTable extends HTMLElement {

            constructor() {
                // console.clear()
                super()
                this._shadowRoot = this.attachShadow({ mode: 'open' })
                this._shadowRoot.appendChild(prepared.content.cloneNode(true))
                this._root = this._shadowRoot.getElementById('root')
                this._table = this._shadowRoot.getElementById('example')
                // this._dotsLoader = this._shadowRoot.getElementById('loader');
                this._props = {}

                if(!load_libs_flag) {
                    this.loadLibraries()
                    load_libs_flag = true;
                }
            }

            async loadLibraries() {
                var start = performance.now();
                // this._dotsLoader.style.visibility = "visible";
                await getScriptPromisify(
                    'https://cdn.datatables.net/2.0.1/js/dataTables.min.js'
                )
                // await getScriptPromisify(
                //     'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/js/bootstrap.bundle.min.js'
                // )
                // await getScriptPromisify(
                //     'https://cdn.datatables.net/2.0.1/js/dataTables.bootstrap5.js'
                // )
                // await getScriptPromisify(
                //     'https://cdn.datatables.net/buttons/3.0.0/js/dataTables.buttons.js'
                // )
                // await getScriptPromisify(
                //     'https://cdn.datatables.net/buttons/3.0.0/js/buttons.bootstrap5.js'
                // )
                // console.log("----", DataTable)
                var end = performance.now();
                var time = end - start;
                console.log("Library took approx : "+(Math.round(time/1000, 2)).toString()+"s to load...")
                // this._dotsLoader.style.visibility = "hidden";
            }
            
            onCustomWidgetBeforeUpdate(changedProperties) {

                if(changedProperties["_headers"]) {
                    this._headers = changedProperties["_headers"];
                    this._dropdownsSelected = this._headers["DROPDOWN_SELECTED"];
                    this._fixedIndices = this._headers["FIXED_INDICES"].map(Number);
                    this._dropdownIndices = this._headers["DROPDOWN_INDICES"].map(Number);
                    this.no_of_decimalPlaces_K = this._headers["no_of_decimal_K"];
                    this.no_of_decimalPlaces_M = this._headers["no_of_decimal_M"];
                }

                if(changedProperties["_dateColName"]) {
                    this._dateColName = changedProperties["_dateColName"]; //selectionColumn
                }

                if(changedProperties["_hideExtraVisibleColumnFromIndex"]) {
                    this._hideExtraVisibleColumnFromIndex = changedProperties["_hideExtraVisibleColumnFromIndex"];
                }

                if(changedProperties["_hide_Individual_ExtraVisibleColumnOfIndices"]) {
                    this._hide_Individual_ExtraVisibleColumnOfIndices = changedProperties["_hide_Individual_ExtraVisibleColumnOfIndices"];
                }

                if(changedProperties["_customHeaderNames"]) {
                    this._customHeaderNames = changedProperties["_customHeaderNames"];
                    this._customTopHeader = this._customHeaderNames["TOP_HEADER"];
                }

                // console.log("BU")

            }

            onCustomWidgetAfterUpdate(changedProperties) {

                if(changedProperties["_headers"]) {
                    this._headers = changedProperties["_headers"];
                    this._dropdownsSelected = this._headers["DROPDOWN_SELECTED"];
                    this._fixedIndices = this._headers["FIXED_INDICES"].map(Number);
                    this._dropdownIndices = this._headers["DROPDOWN_INDICES"].map(Number);
                    this.no_of_decimalPlaces_K = this._headers["no_of_decimal_K"];
                    this.no_of_decimalPlaces_M = this._headers["no_of_decimal_M"];
                }

                if(changedProperties["_dateColName"]) {
                    this._dateColName = changedProperties["_dateColName"]; //selectionColumn
                }

                if(changedProperties["_hideExtraVisibleColumnFromIndex"]) {
                    this._hideExtraVisibleColumnFromIndex = changedProperties["_hideExtraVisibleColumnFromIndex"];
                }

                if(changedProperties["_hide_Individual_ExtraVisibleColumnOfIndices"]) {
                    this._hide_Individual_ExtraVisibleColumnOfIndices = changedProperties["_hide_Individual_ExtraVisibleColumnOfIndices"];
                }

                if(changedProperties["_customHeaderNames"]) {
                    this._customHeaderNames = changedProperties["_customHeaderNames"];
                    this._customTopHeader = this._customHeaderNames["TOP_HEADER"];
                }

                // console.log("AU")
            }

            setResultSet_FY(rs, col_to_row = -1, colspan_to_top_headers, currentScale) {

                // this.reinitialize_changedProperties_ClassVariables();
                var start = performance.now();

                if(this._table) {
                    this._table.remove();
                    this._root.innerHTML = `
                     <table id="example" class="table" style="visibility:hidden;">
                        <thead>
                        </thead>
                        <tbody></tbody>
                    </table>    
                    `
                    this._table = this._shadowRoot.getElementById('example')
                    // console.log( document.querySelector("#"+this["parentNode"].id+" > v1-custom-table").shadowRoot.querySelector("#example > colgroup:nth-child(2)"))
                    // document.querySelector(this._widgetID+"v1-custom-table").shadowRoot.querySelector("#example > colgroup:nth-child(2)").remove();
                }

                // this._dotsLoader.style.visibility = "visible";
                // this._table.style.visibility = "hidden";
                // this._root.style.display = "inline-grid";

                this._resultSet = [];
                this._nonNumericColumnIndices_UnitConversion = new Set();
                this._masterRows_UnitConversion = [];
                this._masterRows_UnitConversion_Flag = false;
                // this._selectionColumnsCount = selCnt
                this._col_to_row = col_to_row; // Row Grouping

                var headers = this._headers
                // console.log(headers);
                console.log(this._dropdownsSelected)

                var remove = headers["Exclude"].join(",")+",@MeasureDimension".split(",");

                this._dimensions = Array.from(new Set(Object.keys(rs[0]).filter((k) => !remove.includes(k))))
                this._measures = new Set()

                this._colOrder = headers["COL_NAME_ORDER"];
                this._scenarioOrder = headers["SCENARIO_ORDER"];
                this._fixedScenario = headers["FIXED_SCENARIO"];
                this._measureOrder = headers["@MeasureDimension"]
                this._excludeHeaders = headers['Exclude']
                // this._dateColName = selColumnName; //selectionColumn
                // this._hideExtraVisibleColumnFromIndex = hideExtraVisibleColumnFromIndex;
                // this._hide_Individual_ExtraVisibleColumnOfIndices = hide_Individual_ExtraVisibleColumnOfIndices;
                this._colspan_EmptyCase = parseInt(colspan_to_top_headers["EmptyCase"]);
                this._colspan_BaseCase = parseInt(colspan_to_top_headers["BaseCase"]);
                this._colspan_RestCase = parseInt(colspan_to_top_headers["RestCase"]);
               
                // this._customHeaderNames = customHeaderNames;

                console.log("Col-Orders",this._colOrder)
                console.log("Scenario-Orders",this._scenarioOrder)
                console.log("Fixed Scenarios",this._fixedScenario)
                console.log("Measure Order", this._measureOrder)
                console.log("Dimensions", this._dimensions)
                console.log("Exclude Headers",this._excludeHeaders)

                this._currentScaling = currentScale;
                no_of_decimalPlaces_K = this.no_of_decimalPlaces_K;
                no_of_decimalPlaces_M = this.no_of_decimalPlaces_M;


                for(var i = 0; i < rs.length;) {
                    var tempArr = [], dims = new Set();
                    for(var k = 0; k < this._dimensions.length; k++) {
                        dims.add(rs[i][this._dimensions[k]].description);
                        this._nonNumericColumnIndices_UnitConversion.add(k);
                    }
                    for(var j = 0; j < this._measureOrder.length; j++) {
                        if(JSON.stringify(this._measureOrder[j]) == JSON.stringify(rs[i]["@MeasureDimension"].description) && rs[i]["@MeasureDimension"].formattedValue != undefined) {
                            if(rs[i]["@MeasureDimension"].formattedValue.includes("%")) {
                                var v = rs[i]["@MeasureDimension"].formattedValue;
                                if(v.includes("+")) {
                                    v = v.split("+")[1];
                                }
                                tempArr.push(v)
                            } else {
                                tempArr.push(parseFloat(rs[i]["@MeasureDimension"].formattedValue.replace(/,{1,}/g,"")).toFixed(no_of_decimalPlaces))
                            }
                        } else {
                            while(JSON.stringify(this._measureOrder[j]) != JSON.stringify(rs[i]["@MeasureDimension"].description)) {
                                tempArr.push("-")
                                j+=1;
                                if(j > this._measureOrder.length) {
                                    console.log("Hit to Infinite Loop Case...")
                                    return;
                                }
                            }
                            if(JSON.stringify(this._measureOrder[j]) == JSON.stringify(rs[i]["@MeasureDimension"].description) && rs[i]["@MeasureDimension"].formattedValue != undefined) {
                                if(rs[i]["@MeasureDimension"].formattedValue.includes("%")) {
                                    var v = rs[i]["@MeasureDimension"].formattedValue;
                                    if(v.includes("+")) {
                                        v = v.split("+")[1];
                                    }
                                    tempArr.push(parseFloat(v))
                                } else {
                                    tempArr.push(parseFloat(rs[i]["@MeasureDimension"].formattedValue.replace(/,{1,}/g,"")).toFixed(no_of_decimalPlaces))
                                }
                            }
                        }
                        i++;
                        if(i >= rs.length || tempArr.length > this._measureOrder.length) {
                            break;
                        }
                    }
                    if(i > rs.length) {
                        break;
                    }
                    tempArr.unshift(...Array.from(dims))
                    // console.log(tempArr)
                    this._resultSet.push(tempArr)
                    // console.log(tempArr)
                }

                console.log("-- Result Set --")
                console.log(this._resultSet)
                console.log("----------------")

                // widget_ID_Name[this["widgetName"]] = this["offsetParent"].id;
                // console.log("Mapped Widgets : ",widget_ID_Name);
                var end = performance.now();
                var time = end - start;
                console.log("setResultSet_FY took approx : "+(Math.round(time/1000, 2)).toString()+"s to load...")

                var start = performance.now();

                this.render_FY();

                var end = performance.now();
                var time = end - start;
                console.log("Render_FY took approx : "+(Math.round(time/1000, 2)).toString()+"s to load...")

            }

            showTotal(callFrom) {

                var start = performance.now();

                var indices = [];
                this._callFrom = callFrom;
                this._fixedIndices = this._fixedIndices.concat(this._dropdownIndices);

                var considerConditions = ["numericColsCSS", "numericColsCSS perColCSS", "varCol", "numericColsCSS numCol", "varCols", "perCols", "vsPy"]
                var CAGR_Indices = [];
                var numericCols = [];
                var fyCols = [], perCols = [], varCols_5Y = [], varCol_QT = [];
                var cagrFlag = false;

                for(var i = 0; i < this._tableColumnNames.length; i++) {

                    if(considerConditions.includes(this._tableColumnNames[i]["className"])) {
                        indices.push(i);
                    } else if (this._tableColumnNames[i]["className"] == "cagrCol"){
                        indices.push(-2);
                        CAGR_Indices.push(i);
                    } else {
                        indices.push(-1);
                    }
                    ///// Numeric Col Indices
                    if(this._tableColumnNames[i]["className"] == "numericColsCSS" || this._tableColumnNames[i]["className"] == "numericColsCSS numCol") {
                        numericCols.push(i)
                    }

                    if(callFrom == "QT" && this._tableColumnNames[i]["sTitle"] == "FY") {
                        fyCols.push(i)
                    }

                    if(callFrom == "QT" && this._tableColumnNames[i]["className"] == "FY") {
                        fyCols.push(i)
                    }

                    if(callFrom == "QT" && this._tableColumnNames[i]["className"] == "vsPy") {
                        varCol_QT.push(i)
                    }

                    if(callFrom == "5Y" && this._tableColumnNames[i]["className"] == "varCols") {
                        varCols_5Y.push(i)
                    }

                }
                
                var tempRef = [], refrenceIndex = 0;
                var finalPerCols = {}
               
                var changeIndex = 0;
                for(var i = 0; i < indices.length; i++) {
                    var sum = 0;
                    var rowIDTotal = this._dataTableObj.rows()[0][0];
                    if(indices[i] != -1 && indices[i] != -2) {

                        var d = this._dataTableObj.column(indices[i]).data();

                        for(var j = 0; j < d.length; j++) {
                            if(isNaN(d[j])) {
                                if(d[j].includes("%")) {
                                    // sum = "- %";
                                    // console.log(indices[i] , tempRef);
                                    if(callFrom == "FY") {

                                        var no_of_per_cols = 3;
                                        if(indices.slice(refrenceIndex, indices[i]).filter(item => item !== -1).length > 0) {
                                            tempRef = indices.slice(refrenceIndex, indices[i]).filter(item => item !== -1)
                                        }
                                        finalPerCols[indices[i]] = tempRef.slice()
    
                                        var value = this._dataTableObj.cell(rowIDTotal, tempRef[0]).data()
                                        var val_minus_act = this._dataTableObj.cell(rowIDTotal, indices[i] - no_of_per_cols).data()

                                        if(isNaN(value)) {
                                            value = parseFloat(this._dataTableObj.cell(rowIDTotal, tempRef[0]).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                        }
                                        if(isNaN(val_minus_act)){
                                            val_minus_act = parseFloat(this._dataTableObj.cell(rowIDTotal, indices[i] - no_of_per_cols).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                        }

                                        var act1 = value - val_minus_act

                                        if(value == 0 && act1 == 0) {
                                            sum = "-"
                                        } else if(value == 0) {
                                            sum = "-100%"
                                        } else if (act1 == 0) {
                                            sum = "100%";
                                        } else {
                                            sum = (val_minus_act / act1 * 100).toString()+" %"
                                        }

                                        ////// ---------------------- Coloring the cell Starts --------------------------
                                        var node1 = this._dataTableObj.cell(rowIDTotal, tempRef[0]).node()
                                        var node2 = this._dataTableObj.cell(rowIDTotal, indices[i] - no_of_per_cols).node()

                                        if(value >= 0 || value >= "0") {
                                            node1.style.color = "#2D7230";
                                        } else {
                                            node1.style.color = "#A92626";
                                        }

                                        if(val_minus_act >= 0 || val_minus_act >= "0") {
                                            node2.style.color = "#2D7230";
                                        } else {
                                            node2.style.color = "#A92626";
                                        }
                                        ////// ---------------------- Coloring the cell Ends ----------------------------
                                        
                                    } 
                                    else if(callFrom == "QT") {

                                        // var no_of_per_cols = 5, sum = "-";
                                        // if(indices.slice(refrenceIndex, indices[i] + no_of_per_cols).filter(item => item !== -1).length > 0) {
                                        //     tempRef = indices.slice(refrenceIndex, indices[i] + no_of_per_cols).filter(item => item !== -1).slice(0, 15)
                                        // }
                                        // finalPerCols[indices[i]] = tempRef.slice() 
    
                                        var value = this._dataTableObj.cell(rowIDTotal, indices[i] - 10).data()
                                        var val_minus_act = this._dataTableObj.cell(rowIDTotal, indices[i] - 5).data()

                                        if(isNaN(value)) {
                                            value = parseFloat(this._dataTableObj.cell(rowIDTotal, indices[i] - 10).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                        }
                                        if(isNaN(val_minus_act)){
                                            val_minus_act = parseFloat(this._dataTableObj.cell(rowIDTotal, indices[i] - 5).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                        }

                                        var act1 = value - val_minus_act

                                        if(value == 0 && act1 == 0) {
                                            sum = "-"
                                        } else if(value == 0) {
                                            sum = "-100%"
                                        } else if (act1 == 0) {
                                            sum = "100%";
                                        } else {
                                            sum = (val_minus_act / act1 * 100).toString()+" %"
                                        }

                                        ////// ---------------------- Coloring the cell Starts --------------------------
                                        var node1 = this._dataTableObj.cell(rowIDTotal, indices[i] - 10).node()
                                        var node2 = this._dataTableObj.cell(rowIDTotal, indices[i] - 5).node()
 
                                        if(value >= 0 || value >= "0") {
                                            node1.style.color = "#2D7230";
                                        } else {
                                            node1.style.color = "#A92626";
                                        }
 
                                        if(val_minus_act >= 0 || val_minus_act >= "0") {
                                            node2.style.color = "#2D7230";
                                        } else {
                                            node2.style.color = "#A92626";
                                        }
                                        ////// ---------------------- Coloring the cell Ends ----------------------------

                                    }
                                    else if(callFrom == "MT") {

                                        var no_of_per_cols = 1;
                                        if(indices.slice(refrenceIndex, indices[i] + 1).filter(item => item !== -1).length > 0) {
                                            tempRef = indices.slice(refrenceIndex, indices[i] + 1).filter(item => item !== -1)
                                        }
                                        finalPerCols[indices[i]] = tempRef.slice()

                                        var value = this._dataTableObj.cell(rowIDTotal, tempRef[0]).data()
                                        var val_minus_act = this._dataTableObj.cell(rowIDTotal, indices[i] - no_of_per_cols).data()

                                        if(isNaN(value)) {
                                            value = parseFloat(this._dataTableObj.cell(rowIDTotal, tempRef[0]).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                        }
                                        if(isNaN(val_minus_act)){
                                            val_minus_act = parseFloat(this._dataTableObj.cell(rowIDTotal, indices[i] - no_of_per_cols).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                        }

                                        var act1 = value - val_minus_act

                                        if(value == 0 && act1 == 0) {
                                            sum = "-"
                                        } else if(value == 0) {
                                            sum = "-100%"
                                        } else if (act1 == 0) {
                                            sum = "100%";
                                        } else {
                                            sum = (val_minus_act / act1 * 100).toString()+" %"
                                        }

                                        // ---------------------- Coloring the cell Starts --------------------------
                                        var node1 = this._dataTableObj.cell(rowIDTotal, tempRef[0]).node()
                                        var node2 = this._dataTableObj.cell(rowIDTotal, indices[i] - no_of_per_cols).node()
   
                                        if(value >= 0 || value >= "0") {
                                            node1.style.color = "#2D7230";
                                        } else {
                                            node1.style.color = "#A92626";
                                        }
   
                                        if(val_minus_act >= 0 || val_minus_act >= "0") {
                                            node2.style.color = "#2D7230";
                                        } else {
                                            node2.style.color = "#A92626";
                                        }
                                        // ---------------------- Coloring the cell Ends ----------------------------
                                           

                                    }
                                    else if(callFrom == "5Y") {

                                        var no_of_per_cols = 5
                                        var value = this._dataTableObj.cell(rowIDTotal, indices[i] - 10).data()
                                        var val_minus_act = this._dataTableObj.cell(rowIDTotal, indices[i] - no_of_per_cols).data()

                                        if(isNaN(value)) {
                                            value = parseFloat(this._dataTableObj.cell(rowIDTotal, indices[i] - 10).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                        }
                                        if(isNaN(val_minus_act)){
                                            val_minus_act = parseFloat(this._dataTableObj.cell(rowIDTotal, indices[i] - no_of_per_cols).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                        }

                                        var act1 = value - val_minus_act

                                        if(value == 0 && act1 == 0) {
                                            sum = "-"
                                        } else if(value == 0) {
                                            sum = "-100%"
                                        } else if (act1 == 0) {
                                            sum = "100%";
                                        } else {
                                            sum = (val_minus_act / act1 * 100).toString()+" %"
                                        }

                                        // ---------------------- Coloring the cell Starts --------------------------
                                        var node1 = this._dataTableObj.cell(rowIDTotal, indices[i] - 10).node()
                                        var node2 = this._dataTableObj.cell(rowIDTotal, indices[i] - no_of_per_cols).node()
   
                                        if(value >= 0 || value >= "0") {
                                            node1.style.color = "#2D7230";
                                        } else {
                                            node1.style.color = "#A92626";
                                        }
   
                                        if(val_minus_act >= 0 || val_minus_act >= "0") {
                                            node2.style.color = "#2D7230";
                                        } else {
                                            node2.style.color = "#A92626";
                                        }
                                        // ---------------------- Coloring the cell Ends ----------------------------
                                           

                                    }
                                  
                                } else {
                                    if(!isNaN(parseFloat(d[j].replace(/,{1,}/g,"")))) {
                                        if(numericCols.includes(indices[i])) {
                                            sum += parseFloat(parseFloat(d[j].replace(/,{1,}/g,"")).toFixed(0))
                                        } else {
                                            sum += parseFloat(d[j].replace(/,{1,}/g,""))
                                        }
                                    }
                                }
                            } else {
                                if(!isNaN(parseFloat(d[j]))) {
                                    if(numericCols.includes(indices[i])) {
                                        sum += parseFloat(parseFloat(d[j]).toFixed(0))
                                    } else {
                                        sum += parseFloat(d[j])
                                    }
                                }
                            }
                        }
                        // console.log(finalPerCols)

                    } 
                    ///// -------------------------------------- CAGR Calculation Starts ------------------------------------
                    //// CAGR = ((Vfinal/Vbegin)^1/t) - 1
                    else if (indices[i] == -2) {
                        cagrFlag = true;
                        var Vbegin= 0, Vfinal = 0, t = (1/4);  
                        Vbegin = this._dataTableObj.cell(rowIDTotal, CAGR_Indices[0] - 15).data()
                        Vfinal = this._dataTableObj.cell(rowIDTotal, CAGR_Indices[0] - 11).data()
                        sum = Math.pow((Vfinal/Vbegin), t) - 1; //// CAGR sum
                        indices[i] =  CAGR_Indices[0];
                        CAGR_Indices = CAGR_Indices.slice(1, );
                    }
                    ///// -------------------------------------- CAGR Calculation Ends --------------------------------------

                    var colorFlag = false;
                    if(!isNaN(sum)) {
                        sum = parseFloat(sum).toFixed(no_of_decimalPlaces)
                    } else {
                        if(callFrom == "MT") {
                            refrenceIndex = indices[i] + 1; // 2 bcz 1 for GX_Entry_Date Col & + 1 for next indice 
                        } else if(callFrom == "QT") {
                            // None...
                        }
                        else if (callFrom == "FY") {
                            refrenceIndex = indices[i] + 2;
                        }
                        else {
                            refrenceIndex = indices[i] + 2;
                        }
                        sum = parseFloat(sum).toFixed(no_of_decimalPlaces).toString()+"%"
                    }

                    if(sum > "0" || sum > 0) {
                        colorFlag = true;
                    }

                    ////// ------------------ Number Formatting Starts --------------------------
                    var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: no_of_decimalPlaces});
                    var count = nFormat.format(sum);

                    if(isNaN(sum)) {
                        sum = sum.split("%")[0];
                        count = nFormat.format(sum) + "%";
                    }

                    if(callFrom == "FY") {
                        if(numericCols.includes(i)) {
                            count = nFormat.format(Math.round(parseFloat(count.split(".")[0].toString().replace(/,{1,}/g,"")+"."+count.split(".")[1]))).split(".")[0];
                        }
                    }
                    else if (callFrom == "QT") {
                        if(fyCols.includes(i) && !perCols.includes(i)) {
                            count = nFormat.format(Math.round(parseFloat(count.split(".")[0].toString().replace(/,{1,}/g,"")+"."+count.split(".")[1]))).split(".")[0];
                        }
                    }
                    else if (callFrom == "MT") {
                        if(numericCols.includes(i)) {
                            count = nFormat.format(Math.round(parseFloat(count.split(".")[0].toString().replace(/,{1,}/g,"")+"."+count.split(".")[1]))).split(".")[0];
                        }
                    }
                     else if (callFrom == "5Y") {
                        if(numericCols.includes(i)) {
                            count = nFormat.format(Math.round(parseFloat(count.split(".")[0].toString().replace(/,{1,}/g,"")+"."+count.split(".")[1]))).split(".")[0];
                        }
                    }
                    ////// ------------------ Number Formatting Ends ----------------------------

                   

                    var node = this._dataTableObj.cell(rowIDTotal, indices[i].toString()).data(count).node()

                    if(!numericCols.includes(i) && !cagrFlag) {
                        if(!colorFlag) {
                            node.style.color = "#A92626";
                        } else {
                            node.style.color = "#2D7230";
                        }
                    } 
                    
                }
               
                gbl_finalPerCols_FY = finalPerCols;
                // console.log(finalPerCols)

                if(callFrom == "FY") {
                    
                } else if(callFrom == "QT") {
                    gbl_finalPerCols_QT = finalPerCols;
                    // console.log(finalPerCols)
                }
               
                
                ///// ------------------------ Hide Extra Cols STARTS -------------------------
                if(callFrom == "MT") {
                    var varCols = this._dataTableObj.columns(".varCol")[0];
                    var perCols = this._dataTableObj.columns(".perColCSS")[0];
                    var hideColsOfIndex = varCols.concat(perCols);
                    // for(var inx = 0; inx < hideColsOfIndex.length; inx++) {
                        this._dataTableObj.columns(hideColsOfIndex).visible(false);
                    // }
                } 
                else if(callFrom == "QT") {
                    var perCols = this._dataTableObj.columns(".perCols")[0];
                    for(var inx = 0; inx < perCols.length; inx++) {
                        this._dataTableObj.column(perCols[inx]).visible(false);
                    }
                }
                else if(callFrom == "FY") {
                    var perCols = this._dataTableObj.columns(".perCols")[0];
                    for(var inx = 0; inx < perCols.length; inx++) {
                        this._dataTableObj.column(perCols[inx]).visible(false);
                    }
                }
                else if(callFrom == "5Y") {
                    // var varCols = this._dataTableObj.columns(".varCols")[0];
                    // var perCols = this._dataTableObj.columns(".perCols")[0];
                    // var hideColsOfIndex = varCols.concat(perCols);
                    // for(var inx = 0; inx < hideColsOfIndex.length; inx++) {
                    //     this._dataTableObj.column(hideColsOfIndex[inx]).visible(false);
                    // }
                }

                var end = performance.now();
                var time = end - start;
                console.log((Math.round(time/1000, 2)).toString()+"s to load..."+"Show Total took approx : ")
                var start = performance.now();

                ///// ------------------------ Hide Extra Cols ENDS ---------------------------
                ////// ================================== Highest Overall Total Block Ends ==================================
                /////  ------------------------------------------------------------------------------------------------------
                ////// ================================== Subset Group Total Block Starts ===================================

                if(callFrom == "FY") {
                    var rowID = undefined;
                    var no_of_per_cols = 3;
                    var lcl_groupRowMapping = {}
                    
                    for(var i = 0; i < this._dataTableObj.rows()[0].length; i++) {
                        var subsetRowID = this._dataTableObj.rows()[0][i];
                        var considerThisRow = this._dataTableObj.row(subsetRowID).node().classList
                        if(considerThisRow.length && considerThisRow[0] == "group") {
                            rowID = subsetRowID;
                            lcl_groupRowMapping[rowID] = [];
                        } 
                        if(rowID) {
                            lcl_groupRowMapping[rowID].push(subsetRowID)
                        }
                    }

                    groupRowMapping = lcl_groupRowMapping;
                    // console.log("Row ID : Subset Group Mapping", lcl_groupRowMapping)

                    for(var [key, val] of Object.entries(lcl_groupRowMapping)) {
                        for(var i = 0; i < indices.length; i++) {
                            var sum = 0;
                            if(indices[i] != -1) {
                                for(var k = 1; k < val.length; k++) {
                                    var d = this._dataTableObj.cell(val[k], indices[i]).data();
                                    // console.log("----",d)
                                    if(d != undefined && isNaN(d)) {
                                        if(d.includes("%")) {
                                            // sum = "- %";
                                            var value = this._dataTableObj.cell(key, gbl_finalPerCols_FY[indices[i].toString()][0]).data()
                                            var val_minus_act = this._dataTableObj.cell(key, indices[i] - no_of_per_cols).data()
                                            var act1 = value - val_minus_act
                                            // sum = (val_minus_act / act1).toString()+" %"

                                            if(isNaN(value)) {
                                                value = parseFloat(this._dataTableObj.cell(key, gbl_finalPerCols_FY[indices[i].toString()][0]).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                            }
                                            if(isNaN(val_minus_act)){
                                                val_minus_act = parseFloat(this._dataTableObj.cell(key, indices[i] - no_of_per_cols).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                            }

                                            var act1 = value - val_minus_act

                                            if(value == 0 && act1 == 0) {
                                                sum = "-"
                                            } else if(value == 0) {
                                                sum = "-100%"
                                            } else if (act1 == 0) {
                                                sum = "100%";
                                            } else {
                                                sum = (val_minus_act / act1 * 100).toString()+" %"
                                            }

                                        } else {
                                            if(!isNaN(parseFloat(d.replace(/,{1,}/g,""))))  {
                                                sum += parseFloat(d.replace(/,{1,}/g,""))
                                            }
                                        }
                                    } else {
                                        if(!isNaN(parseFloat(d))){
                                            sum += parseFloat(d)
                                        }
                                    }
                                }
                            }

                            var colorFlagSubGroup = false;

                            if(sum >= 0 || sum >= "0") {
                                colorFlagSubGroup = true;
                            }

                            if(sum != "- %" && !isNaN(sum)) {
                                sum = parseFloat(sum).toFixed(no_of_decimalPlaces)
                            } else {
                                sum = parseFloat(sum).toFixed(no_of_decimalPlaces).toString()+"%"
                            }

                            ////// ------------------ Number Formatting Starts --------------------------
                            var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: no_of_decimalPlaces});
                            var count = nFormat.format(sum);

                            if(isNaN(sum)) {
                                sum = sum.split("%")[0];
                                count = nFormat.format(sum) + "%";
                            }

                            if(callFrom == "FY") {
                                if(numericCols.includes(i)) {
                                    count = nFormat.format(Math.round(parseFloat(count.split(".")[0].toString().replace(/,{1,}/g,"")+"."+count.split(".")[1]))).split(".")[0];
                                }
                            }

                            if(count == "NaN%") {
                                if(value == 0) {
                                    count = "-100%"
                                } else if (act1 == 0) {
                                    count = "100%";
                                } 
                            }
                            ////// ------------------ Number Formatting Ends ----------------------------

                            var node = this._dataTableObj.cell(key, indices[i]).data(count).node();

                            if(!numericCols.includes(indices[i])) {
                                if(colorFlagSubGroup) {
                                    node.style.color = "#2D7230";
                                } else {
                                    node.style.color = "#A92626";
                                }
                            }
                        }
                    }
                } 
                else if(callFrom == "QT") {
                    var rowID = undefined;
                    var no_of_per_cols = 5;
                    var lcl_groupRowMapping = {}
                    
                    for(var i = 0; i < this._dataTableObj.rows()[0].length; i++) {
                        var subsetRowID = this._dataTableObj.rows()[0][i];
                        var considerThisRow = this._dataTableObj.row(subsetRowID).node().classList
                        if(considerThisRow.length && considerThisRow[0] == "group") {
                            rowID = subsetRowID;
                            lcl_groupRowMapping[rowID] = [];
                        } 
                        if(rowID) {
                            lcl_groupRowMapping[rowID].push(subsetRowID)
                        }
                    }

                    groupRowMapping_QT = lcl_groupRowMapping;
                    // // console.log("Row ID : Subset Group Mapping", lcl_groupRowMapping)

                    for(var [key, val] of Object.entries(lcl_groupRowMapping)) {
                        for(var i = 0; i < indices.length; i++) {
                            var sum = 0;
                            if(indices[i] != -1) {
                                for(var k = 1; k < val.length; k++) {
                                    var d = this._dataTableObj.cell(val[k], indices[i]).data();
                                    // console.log("----",d)
                                    if(d != undefined && isNaN(d)) {
                                        if(d.includes("%")) {
                                            // sum = "- %";
                                            var value = this._dataTableObj.cell(key, indices[i] - 10).data()
                                            var val_minus_act = this._dataTableObj.cell(key, indices[i] - no_of_per_cols).data()
                                            var act1 = value - val_minus_act
                                            // sum = (val_minus_act / act1).toString()+" %"

                                            if(isNaN(value)) {
                                                value = parseFloat(this._dataTableObj.cell(key, indices[i] - 10).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                            }
                                            if(isNaN(val_minus_act)){
                                                val_minus_act = parseFloat(this._dataTableObj.cell(key, indices[i] - no_of_per_cols).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                            }

                                            var act1 = value - val_minus_act

                                            if(value == 0 && act1 == 0) {
                                                sum = "-"
                                            } else if(value == 0) {
                                                sum = "-100%"
                                            } else if (act1 == 0) {
                                                sum = "100%";
                                            } else {
                                                sum = (val_minus_act / act1 * 100).toString()+" %"
                                            }

                                        } else {
                                            if(!isNaN(parseFloat(d.replace(/,{1,}/g,""))))  {
                                                sum += parseFloat(d.replace(/,{1,}/g,""))
                                            }
                                        }
                                    } else {
                                        if(!isNaN(parseFloat(d))){
                                            sum += parseFloat(d)
                                        }
                                    }
                                }
                            }

                            var colorFlagSubGroup = false;

                            if(sum >= 0 || sum >= "0") {
                                colorFlagSubGroup = true;
                            }

                            if(sum != "- %" && !isNaN(sum)) {
                                sum = parseFloat(sum).toFixed(no_of_decimalPlaces)
                            } else {
                                sum = parseFloat(sum).toFixed(no_of_decimalPlaces).toString()+"%"
                            }

                            ////// ------------------ Number Formatting Starts --------------------------
                            var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: no_of_decimalPlaces});
                            var count = nFormat.format(sum);

                            if(isNaN(sum)) {
                                sum = sum.split("%")[0];
                                count = nFormat.format(sum) + "%";
                            }

                            if(DO_QT["Current_Scale"] == "K") {
                                count = nFormat.format(Math.round(parseFloat(count.split(".")[0].toString().replace(/,{1,}/g,"")+"."+count.split(".")[1]))).split(".")[0];
                            }

                            if(fyCols.includes(i) && !perCols.includes(i)) {
                                count = nFormat.format(Math.round(parseFloat(count.split(".")[0].toString().replace(/,{1,}/g,"")+"."+count.split(".")[1]))).split(".")[0];
                            }

                            if(count == "NaN%") {
                                if(value == 0) {
                                    count = "-100%"
                                } else if (act1 == 0) {
                                    count = "100%";
                                } 
                            }
                            ////// ------------------ Number Formatting Ends ----------------------------

                            var node = this._dataTableObj.cell(key, indices[i]).data(count).node();

                            if(!numericCols.includes(indices[i])) {
                                if(colorFlagSubGroup) {
                                    node.style.color = "#2D7230";
                                } else {
                                    node.style.color = "#A92626";
                                }
                            }
                        }
                    }
                }
                else if(callFrom == "MT") {
                    var rowID = undefined;
                    var no_of_per_cols = 1;
                    var lcl_groupRowMapping = {}
                    
                    for(var i = 0; i < this._dataTableObj.rows()[0].length; i++) {
                        var subsetRowID = this._dataTableObj.rows()[0][i];
                        var considerThisRow = this._dataTableObj.row(subsetRowID).node().classList
                        if(considerThisRow.length && considerThisRow[0] == "group") {
                            rowID = subsetRowID;
                            lcl_groupRowMapping[rowID] = [];
                        } 
                        if(rowID) {
                            lcl_groupRowMapping[rowID].push(subsetRowID)
                        }
                    }

                    groupRowMapping_MT = lcl_groupRowMapping;
                //     // console.log("Row ID : Subset Group Mapping", lcl_groupRowMapping)

                //     for(var [key, val] of Object.entries(lcl_groupRowMapping)) {
                //         for(var i = 0; i < indices.length; i++) {
                //             var sum = 0;
                //             if(indices[i] != -1) {
                //                 for(var k = 1; k < val.length; k++) {
                //                     var d = this._dataTableObj.cell(val[k], indices[i]).data();
                //                     // console.log("----",d)
                //                     if(d != undefined && isNaN(d)) {
                //                         if(d.includes("%")) {
                //                             // sum = "- %";
                //                             var value = this._dataTableObj.cell(key, indices[i] - 2).data()
                //                             var val_minus_act = this._dataTableObj.cell(key, indices[i] - no_of_per_cols).data()
                //                             var act1 = value - val_minus_act
                //                             // sum = (val_minus_act / act1).toString()+" %"

                //                             if(isNaN(value)) {
                //                                 value = parseFloat(this._dataTableObj.cell(key, indices[i] - 2).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                //                             }
                //                             if(isNaN(val_minus_act)){
                //                                 val_minus_act = parseFloat(this._dataTableObj.cell(key, indices[i] - no_of_per_cols).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                //                             }

                //                             var act1 = value - val_minus_act

                //                             if(value == 0 && act1 == 0) {
                //                                 sum = "-"
                //                             } else if(value == 0) {
                //                                 sum = "-100%"
                //                             } else if (act1 == 0) {
                //                                 sum = "100%";
                //                             } else {
                //                                 sum = (val_minus_act / act1 * 100).toString()+" %"
                //                             }

                //                         } else {
                //                             if(!isNaN(parseFloat(d.replace(/,{1,}/g,""))))  {
                //                                 sum += parseFloat(d.replace(/,{1,}/g,""))
                //                             }
                //                         }
                //                     } else {
                //                         if(!isNaN(parseFloat(d))){
                //                             sum += parseFloat(d)
                //                         }
                //                     }
                //                 }
                //             }

                //             var colorFlagSubGroup = false;

                //             if(sum >= 0 || sum >= "0") {
                //                 colorFlagSubGroup = true;
                //             }

                //             if(sum != "- %" && !isNaN(sum)) {
                //                 sum = parseFloat(sum).toFixed(no_of_decimalPlaces)
                //             } else {
                //                 sum = parseFloat(sum).toFixed(no_of_decimalPlaces).toString()+"%"
                //             }

                //             ////// ------------------ Number Formatting Starts --------------------------
                //             var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: no_of_decimalPlaces});
                //             var count = nFormat.format(sum);

                //             if(isNaN(sum)) {
                //                 sum = sum.split("%")[0];
                //                 count = nFormat.format(sum) + "%";
                //             }

                //             if(numericCols.includes(i)) {
                //                 count = nFormat.format(Math.round(parseFloat(count.split(".")[0].toString().replace(/,{1,}/g,"")+"."+count.split(".")[1]))).split(".")[0];
                //             }

                //             if(count == "NaN%") {
                //                 if(value == 0) {
                //                     count = "-100%"
                //                 } else if (act1 == 0) {
                //                     count = "100%";
                //                 } 
                //             }
                //             ////// ------------------ Number Formatting Ends ----------------------------

                //             var node = this._dataTableObj.cell(key, indices[i]).data(count).node();

                //             if(!numericCols.includes(indices[i])) {
                //                 if(colorFlagSubGroup) {
                //                     node.style.color = "#2D7230";
                //                 } else {
                //                     node.style.color = "#A92626";
                //                 }
                //             }
                //         }
                //     }
                }
                else if(callFrom == "5Y") {
                    var rowID = undefined;
                    var no_of_per_cols = 5;
                    var lcl_groupRowMapping = {}
                    
                    for(var i = 0; i < this._dataTableObj.rows()[0].length; i++) {
                        var subsetRowID = this._dataTableObj.rows()[0][i];
                        var considerThisRow = this._dataTableObj.row(subsetRowID).node().classList
                        if(considerThisRow.length && considerThisRow[0] == "group") {
                            rowID = subsetRowID;
                            lcl_groupRowMapping[rowID] = [];
                        } 
                        if(rowID) {
                            lcl_groupRowMapping[rowID].push(subsetRowID)
                        }
                    }

                    groupRowMapping_5Y = lcl_groupRowMapping;
                    // console.log("Row ID : Subset Group Mapping", lcl_groupRowMapping)

                    for(var [key, val] of Object.entries(lcl_groupRowMapping)) {
                        for(var i = 0; i < indices.length; i++) {
                            var sum = 0;
                            if(indices[i] != -1) {
                                for(var k = 1; k < val.length; k++) {
                                    var d = this._dataTableObj.cell(val[k], indices[i]).data();
                                    // console.log("----",d)
                                    if(d != undefined && isNaN(d)) {
                                        if(d.includes("%")) {
                                            // sum = "- %";
                                            var value = this._dataTableObj.cell(key, indices[i] - 10).data()
                                            var val_minus_act = this._dataTableObj.cell(key, indices[i] - no_of_per_cols).data()
                                            var act1 = value - val_minus_act
                                            // sum = (val_minus_act / act1).toString()+" %"

                                            if(isNaN(value)) {
                                                value = parseFloat(this._dataTableObj.cell(key, indices[i] - 10).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                            }
                                            if(isNaN(val_minus_act)){
                                                val_minus_act = parseFloat(this._dataTableObj.cell(key, indices[i] - no_of_per_cols).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                            }

                                            var act1 = value - val_minus_act

                                            if(value == 0 && act1 == 0) {
                                                sum = "-"
                                            } else if(value == 0) {
                                                sum = "-100%"
                                            } else if (act1 == 0) {
                                                sum = "100%";
                                            } else {
                                                sum = (val_minus_act / act1 * 100).toString()+" %"
                                            }

                                        } else {
                                            if(!isNaN(parseFloat(d.replace(/,{1,}/g,""))))  {
                                                sum += parseFloat(d.replace(/,{1,}/g,""))
                                            }
                                        }
                                    } else {
                                        if(!isNaN(parseFloat(d))){
                                            sum += parseFloat(d)
                                        }
                                    }
                                }
                            }

                            var colorFlagSubGroup = false;

                            if(sum >= 0 || sum >= "0") {
                                colorFlagSubGroup = true;
                            }

                            if(sum != "- %" && !isNaN(sum)) {
                                sum = parseFloat(sum).toFixed(no_of_decimalPlaces)
                            } else {
                                sum = parseFloat(sum).toFixed(no_of_decimalPlaces).toString()+"%"
                            }

                            ////// ------------------ Number Formatting Starts --------------------------
                            var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: no_of_decimalPlaces});
                            var count = nFormat.format(sum);

                            if(isNaN(sum)) {
                                sum = sum.split("%")[0];
                                count = nFormat.format(sum) + "%";
                            }

                            if(numericCols.includes(i)) {
                                count = nFormat.format(Math.round(parseFloat(count.split(".")[0].toString().replace(/,{1,}/g,"")+"."+count.split(".")[1]))).split(".")[0];
                            }

                            if(count == "NaN%") {
                                if(value == 0) {
                                    count = "-100%"
                                } else if (act1 == 0) {
                                    count = "100%";
                                } 
                            }
                            ////// ------------------ Number Formatting Ends ----------------------------

                            var node = this._dataTableObj.cell(key, indices[i]).data(count).node();

                            if(!numericCols.includes(indices[i])) {
                                if(colorFlagSubGroup) {
                                    node.style.color = "#2D7230";
                                } else {
                                    node.style.color = "#A92626";
                                }
                            }
                        }
                    }
                }
                ////// ================================== Subset Group Total Block Ends ===================================
                var end = performance.now();
                var time = end - start;
                console.log((Math.round(time/1000, 2)).toString()+"s to load..."+"Show Total Brand Group took approx : ")
            }

            createDataObjects(call_from, is_scaled) {

var start = performance.now();

                if(call_from == "FY") {

                    var dt_tbl_obj = this._dataTableObj;
                    var numCols_FY = this._dataTableObj.columns('.numericColsCSS')[0];
                    var vsPyCols_FY = this._dataTableObj.columns('.vsPy')[0];
                    var perCols_FY = this._dataTableObj.columns('.perCols')[0];
                    var selCols_FY = this._dataTableObj.columns('.selColClass')[0];
    

                    if(is_scaled) {

                        var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: this.no_of_decimalPlaces_M});

                        for(var i = 0; i < dt_tbl_obj.rows().count(); i++) {

                            if(DO_FY["ScaledData"] == undefined) { DO_FY["ScaledData"] = {} }

                            var row = dt_tbl_obj.rows().data()[i].slice();
                            
                            ///// ------------ For Num Cols Starts --------------
                            for(var a = 0; a < numCols_FY.length; a++) {

                                var cell_data = row[numCols_FY[a]];
                                var isPerCell = false;

                                if(cell_data != undefined) {

                                    if(isNaN(cell_data)) {
                                        if(cell_data.includes("%")) {
                                            cell_data = parseFloat(cell_data.split("%")[0]) / 1000;
                                            isPerCell = true;
                                        } 
                                        else if(cell_data.includes(",") && cell_data != "-") {
                                            cell_data = parseFloat(cell_data.replace(/,{1,}/g,"")) / 1000;
                                        }
                                    } else {
                                        cell_data = cell_data / 1000;
                                    }

                                    if(isPerCell) {
                                        cell_data = nFormat.format(cell_data).toString() + " %";
                                    } else {
                                        cell_data = cell_data.toString();
                                    }

                                    row[numCols_FY[a]] = cell_data;
                                
                                }
                                
                            }
                            ///// ------------ For Num Cols Ends ----------------

                            ///// ===============================================

                            ///// ------------ For vsPy Cols Starts -------------
                            for(var a = 0; a < vsPyCols_FY.length; a++) {

                                var cell_data = row[vsPyCols_FY[a]];
                                var isPerCell = false;

                                if(cell_data != undefined) {

                                    if(isNaN(cell_data)) {
                                        if(cell_data.includes("%")) {
                                            cell_data = parseFloat(cell_data.split("%")[0]) / 1000;
                                            isPerCell = true;
                                        } 
                                        else if(cell_data.includes(",") && cell_data != "-") {
                                            cell_data = parseFloat(cell_data.replace(/,{1,}/g,"")) / 1000;
                                        }
                                    } else {
                                        cell_data = cell_data / 1000;
                                    }

                                    if(isPerCell) {
                                        cell_data = nFormat.format(cell_data).toString() + " %";
                                    } else {
                                        cell_data = nFormat.format(parseFloat(cell_data).toFixed(this.no_of_decimalPlaces_M));
                                    }

                                    row[vsPyCols_FY[a]] = cell_data;
                                
                                }

                            }
                            ///// ------------ For vsPy Cols Ends ---------------

                            ///// ===============================================

                            ///// ------------ For per Cols Ends ----------------
                            for(var a = 0; a < perCols_FY.length; a++) {

                                var cell_data = row[perCols_FY[a]];
                                var isPerCell = false;

                                if(cell_data != undefined) {

                                    if(isNaN(cell_data)) {
                                        if(cell_data.includes("%")) {
                                            cell_data = parseFloat(cell_data.split("%")[0]).toFixed(this.no_of_decimalPlaces_M);
                                            isPerCell = true;
                                        } 
                                        else if(cell_data.includes(",") && cell_data != "-") {
                                            cell_data = parseFloat(cell_data.replace(/,{1,}/g,"").replace(/%{1,}/g,"")).toFixed(this.no_of_decimalPlaces_M);
                                        }
                                    } else {
                                        cell_data = cell_data;
                                    }

                                    if(isPerCell) {
                                        cell_data = nFormat.format(cell_data).toString() + "%";
                                    } else {
                                        cell_data = nFormat.format(parseFloat(cell_data).toFixed(this.no_of_decimalPlaces_M));
                                    }

                                    if(cell_data == "NaN%") {
                                        cell_data = "- %"
                                    }

                                    row[perCols_FY[a]] = cell_data;
                                
                                }

                            }
                            ///// ------------ For per Cols Ends ----------------

                            ///// ===============================================


                            DO_FY["ScaledData"][i] = row.slice();

                            if(DO_FY["ScaledData"]["KeyMap"] == undefined) {
                                DO_FY["ScaledData"]["KeyMap"] = {}
                            }

                            DO_FY["ScaledData"]["KeyMap"][dt_tbl_obj.rows().data()[i][0]+"_#_"+dt_tbl_obj.rows().data()[i][1]] = i;

                        }

                    } else {

                        var numcols = this._dataTableObj.columns('.numericColsCSS')[0];
                        var varcols = this._dataTableObj.columns('.vsPy')[0];
                        var percols = this._dataTableObj.columns('.perCols')[0];
                        
                        var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: this.no_of_decimalPlaces_K});

                        for(var i = 0; i < dt_tbl_obj.rows().count(); i++) {

                            if(DO_FY["OriginalData"] == undefined) { DO_FY["OriginalData"] = {} }

                            this._dataTableObj.rows().data()
                            var removedDecimalRow = dt_tbl_obj.rows().data()[i].slice();
                            for(var rr = 0; rr < removedDecimalRow.length; rr++) {
                                if(numcols.includes(rr) || varcols.includes(rr)) {
                                    if(!isNaN(parseFloat(removedDecimalRow[rr].toString()))) {
                                        if(removedDecimalRow[rr].toString().includes(".") && removedDecimalRow[rr].toString() != "-") {
                                            removedDecimalRow[rr] = nFormat.format(parseFloat(removedDecimalRow[rr].toString().replace(/,{1,}/g,"")).toFixed(this.no_of_decimalPlaces_K))
                                        }
                                    }
                                }
                                else if(percols.includes(rr)) {
                                    if(!isNaN(parseFloat(removedDecimalRow[rr].toString().split("%")[0]).toFixed(0))) {
                                        removedDecimalRow[rr] = nFormat.format(parseFloat(removedDecimalRow[rr].toString().split("%")[0]).toFixed(this.no_of_decimalPlaces_K)).toString()+"%";
                                    }
                                }
                            }

                            DO_FY["OriginalData"][i] = removedDecimalRow.slice();
                            // DO_FY["OriginalData"][i] = dt_tbl_obj.rows().data()[i];

                            if(DO_FY["OriginalData"]["KeyMap"] == undefined) {
                                DO_FY["OriginalData"]["KeyMap"] = {}
                            }

                            DO_FY["OriginalData"]["KeyMap"][dt_tbl_obj.rows().data()[i][0]+"_#_"+dt_tbl_obj.rows().data()[i][1]] = i;


                        }

                    }

                }
                else if(call_from == "QT") {

                    var dt_tbl_obj = this._dataTableObj;
                    var numCols_QT = this._dataTableObj.columns('.numericColsCSS')[0];
                    var vsPyCols_QT = this._dataTableObj.columns('.vsPy')[0];
                    var perCols_QT = this._dataTableObj.columns('.perCols')[0];
                    var selCols_QT = this._dataTableObj.columns('.selColClass')[0];

                    if(is_scaled) {

                        var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: this.no_of_decimalPlaces_M});

                        for(var i = 0; i < dt_tbl_obj.rows().count(); i++) {

                            if(DO_QT["ScaledData"] == undefined) { DO_QT["ScaledData"] = {} }

                            var row = dt_tbl_obj.rows().data()[i].slice();
                            
                            ///// ------------ For Num Cols Starts --------------
                            for(var a = 0; a < numCols_QT.length; a++) {

                                var cell_data = row[numCols_QT[a]];

                                if(cell_data != undefined) {

                                    if(isNaN(cell_data) && cell_data.includes(",") && cell_data != "-") {
                                        cell_data = parseFloat(cell_data.replace(/,{1,}/g,"")) / 1000;
                                    } else {
                                        cell_data = cell_data / 1000;
                                    }

                                    row[numCols_QT[a]] = cell_data;
                                
                                }
                                
                            }
                            ///// ------------ For Num Cols Ends ----------------

                            ///// ===============================================

                            ///// ------------ For vsPy Cols Starts -------------
                            for(var a = 0; a < vsPyCols_QT.length; a++) {

                                var cell_data = row[vsPyCols_QT[a]];
                                // var isPerCell = false;

                                if(cell_data != undefined) {

                                    if(isNaN(cell_data) && cell_data.includes(",") && cell_data != "-") {
                                        // if(cell_data.includes("%")) {
                                        //     cell_data = parseFloat(cell_data.split("%")[0]) / 1000;
                                        //     isPerCell = true;
                                        // } 
                                        // else if(cell_data.includes(",") && cell_data != "-") {
                                            cell_data = parseFloat(cell_data.replace(/,{1,}/g,"")) / 1000;
                                        // }
                                    } else {
                                        cell_data = cell_data / 1000;
                                    }

                                    // if(isPerCell) {
                                    //     cell_data = nFormat.format(cell_data).toString() + " %";
                                    // } else {
                                    //     cell_data = nFormat.format(parseFloat(cell_data).toFixed(this.no_of_decimalPlaces_M));
                                    // }

                                    row[vsPyCols_QT[a]] = cell_data;
                                
                                }

                            }
                            ///// ------------ For vsPy Cols Ends ---------------

                            ///// ===============================================

                            ///// ------------ For per Cols Ends ----------------
                            for(var a = 0; a < perCols_QT.length; a++) {

                                var cell_data = row[perCols_QT[a]];
                                var isPerCell = false;

                                if(cell_data != undefined) {

                                    if(isNaN(cell_data)) {
                                        if(cell_data.includes("%")) {
                                            cell_data = parseFloat(cell_data.split("%")[0]).toFixed(this.no_of_decimalPlaces_M);
                                            isPerCell = true;
                                        } 
                                        else if(cell_data.includes(",") && cell_data != "-") {
                                            cell_data = parseFloat(cell_data.replace(/,{1,}/g,"").replace(/%{1,}/g,"")).toFixed(this.no_of_decimalPlaces_M);
                                        }
                                    } else {
                                        cell_data = cell_data;
                                    }

                                    if(isPerCell) {
                                        cell_data = nFormat.format(cell_data).toString() + "%";
                                    } else {
                                        cell_data = nFormat.format(parseFloat(cell_data).toFixed(this.no_of_decimalPlaces_M));
                                    }

                                    if(cell_data == "NaN%") {
                                        cell_data = "- %"
                                    }

                                    row[perCols_QT[a]] = cell_data;
                                
                                }

                            }
                            ///// ------------ For per Cols Ends ----------------

                            ///// ===============================================


                            DO_QT["ScaledData"][i] = row.slice();

                            if(DO_QT["ScaledData"]["KeyMap"] == undefined) {
                                DO_QT["ScaledData"]["KeyMap"] = {}
                            }

                            DO_QT["ScaledData"]["KeyMap"][dt_tbl_obj.rows().data()[i][0]+"_#_"+dt_tbl_obj.rows().data()[i][1]] = i;

                        }

                    } else {

                        var numcols = this._dataTableObj.columns('.numericColsCSS')[0];
                        var varcols = this._dataTableObj.columns('.vsPy')[0];
                        var percols = this._dataTableObj.columns('.perCols')[0];
                        
                        var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: this.no_of_decimalPlaces_K});

                        for(var i = 0; i < dt_tbl_obj.rows().count(); i++) {

                            if(DO_QT["OriginalData"] == undefined) { DO_QT["OriginalData"] = {} }

                            this._dataTableObj.rows().data()
                            var removedDecimalRow = dt_tbl_obj.rows().data()[i].slice();
                            for(var rr = 0; rr < removedDecimalRow.length; rr++) {
                                if(numcols.includes(rr) || varcols.includes(rr)) {
                                    if(!isNaN(parseFloat(removedDecimalRow[rr].toString()))) {
                                        if(removedDecimalRow[rr].toString().includes(".") && removedDecimalRow[rr].toString() != "-") {
                                            removedDecimalRow[rr] = nFormat.format(parseFloat(removedDecimalRow[rr].toString().replace(/,{1,}/g,"")).toFixed(this.no_of_decimalPlaces_K))
                                        }
                                    }
                                }
                                else if(percols.includes(rr)) {
                                    if(!isNaN(parseFloat(removedDecimalRow[rr].toString().split("%")[0]).toFixed(0))) {
                                        removedDecimalRow[rr] = nFormat.format(parseFloat(removedDecimalRow[rr].toString().split("%")[0]).toFixed(this.no_of_decimalPlaces_K)).toString()+"%";
                                    }
                                }
                            }

                            DO_QT["OriginalData"][i] = removedDecimalRow.slice();
                            // DO_FY["OriginalData"][i] = dt_tbl_obj.rows().data()[i];

                            if(DO_QT["OriginalData"]["KeyMap"] == undefined) {
                                DO_QT["OriginalData"]["KeyMap"] = {}
                            }

                            DO_QT["OriginalData"]["KeyMap"][dt_tbl_obj.rows().data()[i][0]+"_#_"+dt_tbl_obj.rows().data()[i][1]] = i;


                        }

                    }

                }
                else if(call_from == "MT") {

                    var dt_tbl_obj = this._dataTableObj;
                    var numCols_MT = this._dataTableObj.columns('.numericColsCSS.numCol')[0];
                    var varCols_MT = this._dataTableObj.columns('.varCol')[0];
                    var perCols_MT = this._dataTableObj.columns('.numericColsCSS.perColCSS')[0];

                    if(is_scaled) {

                        var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: this.no_of_decimalPlaces_M});

                        for(var i = 0; i < dt_tbl_obj.rows().count(); i++) {

                            if(DO_MT["ScaledData"] == undefined) { DO_MT["ScaledData"] = {} }

                            var row = dt_tbl_obj.rows().data()[i].slice();
                            
                            ///// ------------ For Num Cols Starts --------------
                            for(var a = 0; a < numCols_MT.length; a++) {

                                var cell_data = row[numCols_MT[a]];
                                var isPerCell = false;

                                if(cell_data != undefined) {

                                    if(isNaN(cell_data)) {
                                        if(cell_data.includes("%")) {
                                            cell_data = parseFloat(cell_data.split("%")[0]) / 1000;
                                            isPerCell = true;
                                        } 
                                        else if(cell_data.includes(",") && cell_data != "-") {
                                            cell_data = parseFloat(cell_data.replace(/,{1,}/g,"")) / 1000;
                                        }
                                    } else {
                                        cell_data = cell_data / 1000;
                                    }

                                    if(isPerCell) {
                                        cell_data = nFormat.format(cell_data).toString() + " %";
                                    } else {
                                        cell_data = cell_data.toString();
                                    }

                                    row[numCols_MT[a]] = cell_data;
                                
                                }
                                
                            }
                            ///// ------------ For Num Cols Ends ----------------

                            ///// ===============================================

                            ///// ------------ For vsPy Cols Starts -------------
                            for(var a = 0; a < varCols_MT.length; a++) {

                                var cell_data = row[varCols_MT[a]];
                                var isPerCell = false;

                                if(cell_data != undefined) {

                                    if(isNaN(cell_data)) {
                                        if(cell_data.includes("%")) {
                                            cell_data = parseFloat(cell_data.split("%")[0]) / 1000;
                                            isPerCell = true;
                                        } 
                                        else if(cell_data.includes(",") && cell_data != "-") {
                                            cell_data = parseFloat(cell_data.replace(/,{1,}/g,"")) / 1000;
                                        }
                                    } else {
                                        cell_data = cell_data / 1000;
                                    }

                                    if(isPerCell) {
                                        cell_data = nFormat.format(cell_data).toString() + " %";
                                    } else {
                                        cell_data = nFormat.format(parseFloat(cell_data).toFixed(this.no_of_decimalPlaces_M));
                                    }

                                    if(cell_data == "NaN") {
                                        cell_data = "-"
                                    }

                                    row[varCols_MT[a]] = cell_data;
                                
                                }

                            }
                            ///// ------------ For vsPy Cols Ends ---------------

                            ///// ===============================================

                            ///// ------------ For per Cols Ends ----------------
                            for(var a = 0; a < perCols_MT.length; a++) {

                                var cell_data = row[perCols_MT[a]];
                                var isPerCell = false;

                                if(cell_data != undefined) {

                                    if(isNaN(cell_data)) {
                                        if(cell_data.includes("%")) {
                                            cell_data = parseFloat(cell_data.split("%")[0]).toFixed(this.no_of_decimalPlaces_M);
                                            isPerCell = true;
                                        } 
                                        else if(cell_data.includes(",") && cell_data != "-") {
                                            cell_data = parseFloat(cell_data.replace(/,{1,}/g,"").replace(/%{1,}/g,"")).toFixed(this.no_of_decimalPlaces_M);
                                        }
                                    } else {
                                        cell_data = cell_data;
                                    }

                                    if(isPerCell) {
                                        cell_data = nFormat.format(cell_data).toString() + "%";
                                    } else {
                                        cell_data = nFormat.format(parseFloat(cell_data).toFixed(this.no_of_decimalPlaces_M));
                                    }

                                    if(cell_data == "NaN%" || cell_data == "NaN %") {
                                        cell_data = "- %"
                                    }

                                    if(cell_data == "NaN") {
                                        cell_data = "-"
                                    }

                                    row[perCols_MT[a]] = cell_data;
                                
                                }

                            }
                            ///// ------------ For per Cols Ends ----------------

                            ///// ===============================================


                            DO_MT["ScaledData"][i] = row.slice();

                            if(DO_MT["ScaledData"]["KeyMap"] == undefined) {
                                DO_MT["ScaledData"]["KeyMap"] = {}
                            }

                            DO_MT["ScaledData"]["KeyMap"][dt_tbl_obj.rows().data()[i][0]+"_#_"+dt_tbl_obj.rows().data()[i][1]] = i;

                        }

                    } else {

                        var numcols = this._dataTableObj.columns('.numericColsCSS.numCol')[0];
                        var varcols = this._dataTableObj.columns('.varCol')[0];
                        var percols = this._dataTableObj.columns('.numericColsCSS.perColCSS')[0];
                        
                        var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: this.no_of_decimalPlaces_K});

                        for(var i = 0; i < dt_tbl_obj.rows().count(); i++) {

                            if(DO_MT["OriginalData"] == undefined) { DO_MT["OriginalData"] = {} }

                            this._dataTableObj.rows().data()
                            var removedDecimalRow = dt_tbl_obj.rows().data()[i].slice();
                            for(var rr = 0; rr < removedDecimalRow.length; rr++) {
                                if(numcols.includes(rr) || varcols.includes(rr)) {
                                    if(!isNaN(parseFloat(removedDecimalRow[rr].toString()))) {
                                        if(removedDecimalRow[rr].toString().includes(".") && removedDecimalRow[rr].toString() != "-") {
                                            removedDecimalRow[rr] = nFormat.format(parseFloat(removedDecimalRow[rr].toString().replace(/,{1,}/g,"")).toFixed(this.no_of_decimalPlaces_K))
                                        }
                                    }
                                }
                                else if(percols.includes(rr)) {
                                    if(!isNaN(parseFloat(removedDecimalRow[rr].toString().split("%")[0]).toFixed(0))) {
                                        removedDecimalRow[rr] = nFormat.format(parseFloat(removedDecimalRow[rr].toString().split("%")[0]).toFixed(this.no_of_decimalPlaces_K)).toString()+"%";
                                    }
                                }
                            }

                            DO_MT["OriginalData"][i] = removedDecimalRow.slice();
                            // DO_FY["OriginalData"][i] = dt_tbl_obj.rows().data()[i];

                            if(DO_MT["OriginalData"]["KeyMap"] == undefined) {
                                DO_MT["OriginalData"]["KeyMap"] = {}
                            }

                            DO_MT["OriginalData"]["KeyMap"][dt_tbl_obj.rows().data()[i][0]+"_#_"+dt_tbl_obj.rows().data()[i][1]] = i;


                        }

                    }

                }
                else if(call_from == "5Y") {

                    var dt_tbl_obj = this._dataTableObj;
                    var numCols_5Y = this._dataTableObj.columns('.numericColsCSS')[0];
                    var vsPyCols_5Y = this._dataTableObj.columns('.varCols')[0];
                    var perCols_5Y = this._dataTableObj.columns('.perCols')[0];
    

                    if(is_scaled) {

                        var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: this.no_of_decimalPlaces_M});

                        for(var i = 0; i < dt_tbl_obj.rows().count(); i++) {

                            if(DO_5Y["ScaledData"] == undefined) { DO_5Y["ScaledData"] = {} }

                            var row = dt_tbl_obj.rows().data()[i].slice();
                            
                            ///// ------------ For Num Cols Starts --------------
                            for(var a = 0; a < numCols_5Y.length; a++) {

                                var cell_data = row[numCols_5Y[a]];
                                var isPerCell = false;

                                if(cell_data != undefined) {

                                    if(isNaN(cell_data)) {
                                        if(cell_data.includes("%")) {
                                            cell_data = parseFloat(cell_data.split("%")[0]) / 1000;
                                            isPerCell = true;
                                        } 
                                        else if(cell_data.includes(",") && cell_data != "-") {
                                            cell_data = parseFloat(cell_data.replace(/,{1,}/g,"")) / 1000;
                                        }
                                    } else {
                                        cell_data = cell_data / 1000;
                                    }

                                    row[numCols_5Y[a]] = parseFloat(cell_data).toFixed(0);
                                
                                }
                                
                            }
                            ///// ------------ For Num Cols Ends ----------------

                            ///// ===============================================

                            ///// ------------ For vsPy Cols Starts -------------
                            for(var a = 0; a < vsPyCols_5Y.length; a++) {

                                var cell_data = row[vsPyCols_5Y[a]];
                                var isPerCell = false;

                                if(cell_data != undefined) {

                                    if(isNaN(cell_data)) {
                                        if(cell_data.includes("%")) {
                                            cell_data = parseFloat(cell_data.split("%")[0]) / 1000;
                                            isPerCell = true;
                                        } 
                                        else if(cell_data.includes(",") && cell_data != "-") {
                                            cell_data = parseFloat(cell_data.replace(/,{1,}/g,"")) / 1000;
                                        }
                                    } else {
                                        cell_data = cell_data / 1000;
                                    }

                                    row[vsPyCols_5Y[a]] = cell_data;
                                
                                }

                            }
                            ///// ------------ For vsPy Cols Ends ---------------

                            ///// ===============================================

                            ///// ------------ For per Cols Ends ----------------
                            for(var a = 0; a < perCols_5Y.length; a++) {

                                var cell_data = row[perCols_5Y[a]];
                                var isPerCell = false;

                                if(cell_data != undefined) {

                                    if(isNaN(cell_data)) {
                                        if(cell_data.includes("%")) {
                                            cell_data = parseFloat(cell_data.split("%")[0]).toFixed(this.no_of_decimalPlaces_M);
                                            isPerCell = true;
                                        } 
                                        else if(cell_data.includes(",") && cell_data != "-") {
                                            cell_data = parseFloat(cell_data.replace(/,{1,}/g,"").replace(/%{1,}/g,"")).toFixed(this.no_of_decimalPlaces_M);
                                        }
                                    } else {
                                        cell_data = cell_data;
                                    }

                                    if(isPerCell) {
                                        cell_data = nFormat.format(cell_data).toString() + "%";
                                    } else {
                                        cell_data = nFormat.format(parseFloat(cell_data).toFixed(this.no_of_decimalPlaces_M));
                                    }

                                    if(cell_data == "NaN%") {
                                        cell_data = "- %"
                                    }

                                    row[perCols_5Y[a]] = cell_data;
                                
                                }

                            }
                            ///// ------------ For per Cols Ends ----------------

                            ///// ===============================================


                            DO_5Y["ScaledData"][i] = row.slice();

                            if(DO_5Y["ScaledData"]["KeyMap"] == undefined) {
                                DO_5Y["ScaledData"]["KeyMap"] = {}
                            }

                            DO_5Y["ScaledData"]["KeyMap"][dt_tbl_obj.rows().data()[i][0]+"_#_"+dt_tbl_obj.rows().data()[i][1]] = i;

                        }

                    } else {

                        var numcols = this._dataTableObj.columns('.numericColsCSS')[0];
                        var varcols = this._dataTableObj.columns('.varCols')[0];
                        var percols = this._dataTableObj.columns('.perCols')[0];
                        
                        var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: this.no_of_decimalPlaces_K});

                        for(var i = 0; i < dt_tbl_obj.rows().count(); i++) {

                            if(DO_5Y["OriginalData"] == undefined) { DO_5Y["OriginalData"] = {} }

                            this._dataTableObj.rows().data()
                            var removedDecimalRow = dt_tbl_obj.rows().data()[i].slice();
                            for(var rr = 0; rr < removedDecimalRow.length; rr++) {
                                if(numcols.includes(rr) || varcols.includes(rr)) {
                                    if(!isNaN(parseFloat(removedDecimalRow[rr].toString()))) {
                                        if(removedDecimalRow[rr].toString().includes(".") && removedDecimalRow[rr].toString() != "-") {
                                            removedDecimalRow[rr] = nFormat.format(parseFloat(removedDecimalRow[rr].toString().replace(/,{1,}/g,"")).toFixed(this.no_of_decimalPlaces_K))
                                        }
                                    }
                                }
                                else if(percols.includes(rr)) {
                                    if(!isNaN(parseFloat(removedDecimalRow[rr].toString().split("%")[0]).toFixed(0))) {
                                        removedDecimalRow[rr] = nFormat.format(parseFloat(removedDecimalRow[rr].toString().split("%")[0]).toFixed(this.no_of_decimalPlaces_K)).toString()+"%";
                                    }
                                }
                            }

                            DO_5Y["OriginalData"][i] = removedDecimalRow.slice();
                            // DO_FY["OriginalData"][i] = dt_tbl_obj.rows().data()[i];

                            if(DO_5Y["OriginalData"]["KeyMap"] == undefined) {
                                DO_5Y["OriginalData"]["KeyMap"] = {}
                            }

                            DO_5Y["OriginalData"]["KeyMap"][dt_tbl_obj.rows().data()[i][0]+"_#_"+dt_tbl_obj.rows().data()[i][1]] = i;


                        }

                    }

                }

var end = performance.now();
var time = end - start;
console.log((Math.round(time/1000, 2)).toString()+"s to load..."+"Creating Scaled Object took approx : ")

            }


            applyScaling_FY(scaleTo = "K") {

                // var dt_tbl_obj = this._dataTableObj;
                // var numCols_FY = this._dataTableObj.columns('.numericColsCSS')[0];
                // var vsPyCols_FY = this._dataTableObj.columns('.vsPy')[0];
                // var perCols_FY = this._dataTableObj.columns('.perCols')[0];

                if(scaleTo == "K") 
                {
                    DO_FY["Current_Scale"] = "K";

                    if(!Object.keys(DO_FY).includes("OriginalData")) {
                        this.createDataObjects("FY", false);
                    }

                    var selectionsIDs = Object.keys(DO_FY["DRP"]);
                    // console.log(DO_FY);

                    for(var i = 0; i < this._dataTableObj.rows().count(); i++) {

                        this._dataTableObj.row(i).data(DO_FY["OriginalData"][i].slice()).draw();

                        if(selectionsIDs.includes(i.toString())) {
                            this.preserveSelection(i, Object.keys(DO_FY["DRP"][i]), Object.values(DO_FY["DRP"][i]), "FY");
                        }
                    }

                } 
                else 
                {
                    DO_FY["Current_Scale"] = "M";

                    this.createDataObjects("FY", true);

                    for(var i = 0; i < this._dataTableObj.rows().count(); i++) {
                        this._dataTableObj.row(i).data(DO_FY["ScaledData"][i].slice()).draw();
                    }
                }

                console.log(DO_FY);

            }

            applyScaling_QT(scaleTo = "K") {

                // var dt_tbl_obj = this._dataTableObj;
                // var numCols_QT = this._dataTableObj.columns('.numericColsCSS')[0];
                // var vsPyCols_QT = this._dataTableObj.columns('.vsPy')[0];
                // var perCols_QT = this._dataTableObj.columns('.perCols')[0];

                if(scaleTo == "K") 
                {
                    DO_QT["Current_Scale"] = "K";

                    if(!Object.keys(DO_QT).includes("OriginalData")) {
                        this.createDataObjects("QT", false);
                    }

                    var selectionsIDs = Object.keys(DO_QT["DRP"]);
                    // console.log(DO_QT);

                    for(var i = 0; i < this._dataTableObj.rows().count(); i++) {

                        this._dataTableObj.row(i).data(DO_QT["OriginalData"][i].slice()).draw();

                        if(selectionsIDs.includes(i.toString())) {
                            this.preserveSelection(i, Object.keys(DO_QT["DRP"][i]), Object.values(DO_QT["DRP"][i]), "QT");
                        }
                    }

                } 
                else 
                {
                    DO_QT["Current_Scale"] = "M";

                    this.createDataObjects("QT", true);

                    for(var i = 0; i < this._dataTableObj.rows().count(); i++) {
                        this._dataTableObj.row(i).data(DO_QT["ScaledData"][i].slice()).draw();
                    }
                }

                console.log(DO_QT);

            }

            applyScaling_MT(scaleTo = "K") {

var start = performance.now();

                // var dt_tbl_obj = this._dataTableObj;
                // var numCols_QT = this._dataTableObj.columns('.numericColsCSS')[0];
                // var vsPyCols_QT = this._dataTableObj.columns('.vsPy')[0];
                // var perCols_QT = this._dataTableObj.columns('.perCols')[0];

                if(scaleTo == "K") 
                {
                    DO_MT["Current_Scale"] = "K";

                    if(!Object.keys(DO_MT).includes("OriginalData")) {
                        this.createDataObjects("MT", false);
                    }

                    var selectionsIDs = Object.keys(DO_MT["DRP"]);
                    // console.log(DO_MT);

                    for(var i = 0; i < this._dataTableObj.rows().count(); i++) {

                        this._dataTableObj.row(i).data(DO_MT["OriginalData"][i].slice()).draw();

                        if(selectionsIDs.includes(i.toString())) {
                            this.preserveSelection(i, Object.keys(DO_MT["DRP"][i]), Object.values(DO_MT["DRP"][i]), "MT");
                        }
                    }

                } 
                else 
                {
                    DO_MT["Current_Scale"] = "M";

                    this.createDataObjects("MT", true);

                    for(var i = 0; i < this._dataTableObj.rows().count(); i++) {
                        this._dataTableObj.row(i).data(DO_MT["ScaledData"][i].slice()).draw();
                    }
                }


                console.log(DO_MT);

var end = performance.now();
var time = end - start;
console.log((Math.round(time/1000, 2)).toString()+"s to load..."+"Apply Scaling took approx : ")

            }

            applyScaling_5Y(scaleTo = "K") {

                // var dt_tbl_obj = this._dataTableObj;
                // var numCols_FY = this._dataTableObj.columns('.numericColsCSS')[0];
                // var vsPyCols_FY = this._dataTableObj.columns('.vsPy')[0];
                // var perCols_FY = this._dataTableObj.columns('.perCols')[0];

                if(scaleTo == "K") 
                {
                    DO_5Y["Current_Scale"] = "K";

                    if(!Object.keys(DO_5Y).includes("OriginalData")) {
                        this.createDataObjects("5Y", false);
                    }

                    var selectionsIDs = Object.keys(DO_5Y["DRP"]);
                    // console.log(DO_5Y);

                    for(var i = 0; i < this._dataTableObj.rows().count(); i++) {

                        this._dataTableObj.row(i).data(DO_5Y["OriginalData"][i].slice()).draw();

                        if(selectionsIDs.includes(i.toString())) {
                            this.preserveSelection(i, Object.keys(DO_5Y["DRP"][i]), Object.values(DO_5Y["DRP"][i]), "5Y");
                        }
                    }

                } 
                else 
                {
                    DO_5Y["Current_Scale"] = "M";

                    this.createDataObjects("5Y", true);

                    for(var i = 0; i < this._dataTableObj.rows().count(); i++) {
                        this._dataTableObj.row(i).data(DO_5Y["ScaledData"][i].slice()).draw();
                    }
                }

                console.log(DO_5Y);

            }

            showPercentageWidVariance(scene = null) {

                if(this._callFrom == "MT") 
                {
                    if(scene == "Num") {
                        // var perCols = this._dataTableObj.columns('.perColCSS')[0];
                        var numCols = this._dataTableObj.columns('.numCol')[0];
                        var selCol = this._dataTableObj.columns('.selColClass')[0];
                        selCol.push(2); // selection column base
    
                        var numCols = numCols.concat(selCol);
                        var filteredArray = [];

                        ////// For showing Columns from indices
                        for(var i = 0; i < this._colIndices.length; i++) {
                            for(var j = parseInt(this._colIndices[i]); j <= parseInt(this._colIndices[i]) + this._no_of_succeeding; j++) {
                                filteredArray.push(j)
                            }
                        }
                        filteredArray = numCols.filter(value => filteredArray.includes(value)).concat(Array.from(new Set(this._gxDatesFiltered)))
    
    
                        ///// -------------- Handling Base Scenario Visibility Starts ---------------------
                        const filteredBase = [];
                        for(var i = 0; i < this._fixedCols; i++) {
                            if(numCols.includes(i) || i == this._dimensions.indexOf("SCENARIO_NAME")) {
                                filteredBase.push(i);
                            }
                        }
                        ///// -------------- Handling Base Scenario Visibility Ends -----------------------
    
                        for(var i = 2; i < this._hideExtraVisibleColumnFromIndex; i++) {
                            // if(numCols.includes(i)) {
                            //     this._dataTableObj.column(i).visible(true);
                            // } else {
                            //     this._dataTableObj.column(i).visible(false);
                            // }
                            if(this._visibleCols.length > 0) {
                                if(filteredArray.includes(i) || filteredBase.includes(i)) {
                                    this._dataTableObj.column(i).visible(true);
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            } else {
                                if(numCols.includes(i)) {
                                    this._dataTableObj.column(i).visible(true);
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            }
                        }
                    } 
                    else if(scene == "Var") {
                        // var perCols = this._dataTableObj.columns('.perColCSS')[0];
                        // var numCols = this._dataTableObj.columns('.numCol')[0];
                        var varCols = this._dataTableObj.columns('.varCol')[0];
                        var selCol = this._dataTableObj.columns('.selColClass')[0];
                        selCol.push(2); // selection column base
    
                        varCols = varCols.concat(selCol);
                        var filteredArray = [];
                       
                        ////// For showing Columns from indices
                        for(var i = 0; i < this._colIndices.length; i++) {
                            for(var j = parseInt(this._colIndices[i]); j <= parseInt(this._colIndices[i]) + this._no_of_succeeding; j++) {
                                filteredArray.push(j)
                            }
                        }
                        filteredArray = varCols.filter(value => filteredArray.includes(value)).concat(Array.from(new Set(this._gxDatesFiltered)))
    
                        ///// -------------- Handling Base Scenario Visibility Starts ---------------------
                        const filteredBase = [];
                        for(var i = 0; i < this._fixedCols; i++) {
                            if(varCols.includes(i) || i == this._dimensions.indexOf("SCENARIO_NAME")) {
                                filteredBase.push(i);
                            }
                        }
                        ///// -------------- Handling Base Scenario Visibility Ends -----------------------
    
                        for(var i = 2; i < this._hideExtraVisibleColumnFromIndex; i++) {
                            // if(varCols.includes(i)) {
                            //     this._dataTableObj.column(i).visible(true);
                            // } else {
                            //     this._dataTableObj.column(i).visible(false);
                            // }
                            if(this._visibleCols.length > 0) {
                                if(filteredArray.includes(i) || filteredBase.includes(i)) {
                                    this._dataTableObj.column(i).visible(true);
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            } else {
                                if(varCols.includes(i)) {
                                    this._dataTableObj.column(i).visible(true);
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            }
                        }
                    }
                    else if(scene == "Per") {
                        var perCols = this._dataTableObj.columns('.perColCSS')[0];
                        // var numCols = this._dataTableObj.columns('.numCol')[0];
                        var selCol = this._dataTableObj.columns('.selColClass')[0];
                        selCol.push(2); // selection column base
    
                        var filteredArray = [];

                        ////// For showing Columns from indices
                        for(var i = 0; i < this._colIndices.length; i++) {
                            for(var j = parseInt(this._colIndices[i]); j <= parseInt(this._colIndices[i]) + this._no_of_succeeding; j++) {
                                filteredArray.push(j)
                            }
                        }
                        filteredArray = perCols.filter(value => filteredArray.includes(value)).concat(Array.from(new Set(this._gxDatesFiltered)))
    
                        
                        ///// -------------- Handling Base Scenario Visibility Starts ---------------------
                        const filteredBase = [];
                        for(var i = 0; i < this._fixedCols; i++) {
                            if(perCols.includes(i) || i == this._dimensions.indexOf("SCENARIO_NAME")) {
                                filteredBase.push(i);
                            }
                        }
                        ///// -------------- Handling Base Scenario Visibility Ends -----------------------
    
                        for(var i = 2; i < this._hideExtraVisibleColumnFromIndex; i++) {
                            perCols = perCols.concat(selCol);
                            if(this._visibleCols.length > 0) {
                                if(filteredArray.includes(i) || filteredBase.includes(i)) {
                                    this._dataTableObj.column(i).visible(true);
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            } else {
                                if(perCols.includes(i)) {
                                    this._dataTableObj.column(i).visible(true);
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            }
                        }
                    }
                }
                else if(this._callFrom == "5Y") 
                {
                    this._fixedCols = 20; 
                    var visibleCagrCols = new Set();
                    var cagrCols = this._dataTableObj.columns('.cagrCol')[0];
                    visibleCagrCols.add(cagrCols[0]) ///// BASE CAGR

                    if(this._headerNames_to_show) {
                        if(this._headerNames_to_show.includes("Scenario 1")) {
                            visibleCagrCols.add(cagrCols[1])
                        } 
                        if(this._headerNames_to_show.includes("Scenario 2"))  {
                            visibleCagrCols.add(cagrCols[2])
                        }
                        if(this._headerNames_to_show.includes("Scenario 3"))  {
                            visibleCagrCols.add(cagrCols[3])
                        }
                    } else {
                        for(var i = 0; i < 4; i++) {
                            visibleCagrCols.add(cagrCols[i])
                        }
                    }

                    visibleCagrCols = Array.from(visibleCagrCols);


                    if(scene == "Num") {
                        // var perCols = this._dataTableObj.columns('.perColCSS')[0];
                        var numCols = this._dataTableObj.columns('.numericColsCSS')[0];
                        numCols.push(this._fixedCols - 1); //// BASE CAGR
                        var selCol = this._dataTableObj.columns('.selColClass')[0];
                        selCol.push(2); // selection column base
        
                        var numCols = numCols.concat(selCol);
                        const filteredArray = numCols.filter(value => this._visibleCols.includes(value)).concat(this._gxDatesFiltered);
        
                        ///// -------------- Handling Base Scenario Visibility Starts ---------------------
                        const filteredBase = [];
                        for(var i = 0; i < this._fixedCols; i++) {
                            if(i != 2 && (numCols.includes(i) || i == this._dimensions.indexOf("SCENARIO_NAME"))) {
                                filteredBase.push(i);
                            }
                        }
                        ///// -------------- Handling Base Scenario Visibility Ends -----------------------
        
                        for(var i = 3; i < this._hideExtraVisibleColumnFromIndex; i++) {
                            // if(numCols.includes(i)) {
                            //     this._dataTableObj.column(i).visible(true);
                            // } else {
                            //     this._dataTableObj.column(i).visible(false);
                            // }
                            if(this._visibleCols.length > 0) {
                                if(filteredArray.includes(i) || filteredBase.includes(i) || visibleCagrCols.includes(i)) {
                                    this._dataTableObj.column(i).visible(true);
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            } else {
                                if(numCols.includes(i) || visibleCagrCols.includes(i)) {
                                    this._dataTableObj.column(i).visible(true);
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            }
                        }
                    } 
                    else if(scene == "Var") {
                        // var perCols = this._dataTableObj.columns('.perColCSS')[0];
                        // var numCols = this._dataTableObj.columns('.numCol')[0];
                        var selCol = this._dataTableObj.columns('.selColClass')[0];
                        var varCols = this._dataTableObj.columns('.varCols')[0];
                        varCols.push(this._fixedCols - 1); //// BASE CAGR
                        selCol.push(2); // selection column base
        
                        const filteredArray = varCols.filter(value => this._visibleCols.includes(value)).concat(this._gxDatesFiltered);
        
                        ///// -------------- Handling Base Scenario Visibility Starts ---------------------
                        const filteredBase = [];
                        for(var i = 0; i < this._fixedCols; i++) {
                            if(i != 2 && (varCols.includes(i) || i == this._dimensions.indexOf("SCENARIO_NAME"))) {
                                filteredBase.push(i);
                            }
                        }
                        ///// -------------- Handling Base Scenario Visibility Ends -----------------------
        
                        for(var i = 3; i < this._hideExtraVisibleColumnFromIndex; i++) {
                            varCols = varCols.concat(selCol);
                            // if(varCols.includes(i)) {
                            //     this._dataTableObj.column(i).visible(true);
                            // } else {
                            //     this._dataTableObj.column(i).visible(false);
                            // }
                            if(this._visibleCols.length > 0) {
                                if(filteredArray.includes(i) || filteredBase.includes(i) || visibleCagrCols.includes(i)) {
                                    this._dataTableObj.column(i).visible(true);
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            } else {
                                if(varCols.includes(i) || visibleCagrCols.includes(i)) {
                                    this._dataTableObj.column(i).visible(true);
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            }
                        }
                    }
                    else if(scene == "Per") {
                        var perCols = this._dataTableObj.columns('.perCols')[0];
                        perCols.push(this._fixedCols - 1); //// BASE CAGR
                        var selCol = this._dataTableObj.columns('.selColClass')[0];
                        selCol.push(2); // selection column base
        
                        const filteredArray = perCols.filter(value => this._visibleCols.includes(value)).concat(this._gxDatesFiltered);
                            
                        ///// -------------- Handling Base Scenario Visibility Starts ---------------------
                        const filteredBase = [];
                        for(var i = 0; i < this._fixedCols; i++) {
                            if(i != 2 && (perCols.includes(i) || i == this._dimensions.indexOf("SCENARIO_NAME"))) {
                                filteredBase.push(i);
                            }
                        }
                        ///// -------------- Handling Base Scenario Visibility Ends -----------------------
        
                        for(var i = 3; i < this._hideExtraVisibleColumnFromIndex; i++) {
                            perCols = perCols.concat(selCol);
                            if(this._visibleCols.length > 0) {
                                if(filteredArray.includes(i) || filteredBase.includes(i) || visibleCagrCols.includes(i)) {
                                    this._dataTableObj.column(i).visible(true);
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            } else {
                                if(perCols.includes(i) || visibleCagrCols.includes(i)) {
                                    this._dataTableObj.column(i).visible(true);
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            }
                        }
                    }
                } 
                else if(this._callFrom == "QT") {
                    if(scene == "vsPy") {
                        var numCols = this._dataTableObj.columns('.numericColsCSS')[0];
                        var vsPyCols = this._dataTableObj.columns('.vsPy')[0];
                        var selCol = this._dataTableObj.columns('.selColClass')[0];
                        selCol.push(2); // selection column base

                        const filteredArray = vsPyCols.filter(value => this._visibleCols.includes(value));
                            
                        /// -------------- Handling Base Scenario Visibility Starts ---------------------
                        const filteredBase = [];
                        for(var i = 0; i < this._fixedCols; i++) {
                            if(i != 2 && (vsPyCols.includes(i) || i == this._dimensions.indexOf("SCENARIO_NAME"))) {
                                filteredBase.push(i);
                            }
                        }
                        /// -------------- Handling Base Scenario Visibility Ends -----------------------
        
                        for(var i = 8; i < this._hideExtraVisibleColumnFromIndex; i++) {
                            vsPyCols = vsPyCols.concat(selCol);
                            if(this._visibleCols.length > 0) {
                                if(filteredArray.includes(i) || filteredBase.includes(i) || this._gxDatesFiltered.includes(i)) {
                                    ////// Handling Numeric Cols ---------------------------
                                    if(this._gxDatesFiltered.includes(i)) {
                                        for(var j = i+1; j < i+1+5; j++) {
                                            this._dataTableObj.column(j).visible(true);
                                        }
                                        i = j-1;
                                    }
                                    ////// --------------------------------------------------
                                    this._dataTableObj.column(i).visible(true);
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            } else {
                                if(vsPyCols.includes(i) || numCols.includes(i)) {
                                    this._dataTableObj.column(i).visible(true);
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            }
                        }
                    } 
                    else if(scene == "Per") {
                        var numCols = this._dataTableObj.columns('.numericColsCSS')[0];
                        var perCols = this._dataTableObj.columns('.perCols')[0];
                        var selCol = this._dataTableObj.columns('.selColClass')[0];
                        selCol.push(2); // selection column base
        
                        var filteredArray = perCols.filter(value => this._visibleCols.includes(value));
                            
                        // for(var i = 0; i < perCols.length; i++) {
                        //     filteredArray.push(perCols[i] - 10);
                        // }
                        // filteredArray = Array.from(new Set(filteredArray))

                        ///// -------------- Handling Base Scenario Visibility Starts ---------------------
                        const filteredBase = [];
                        for(var i = 0; i < 18; i++) {
                            if(i != 2 && (perCols.includes(i) || i == this._dimensions.indexOf("SCENARIO_NAME"))) {
                                filteredBase.push(i);
                            }
                        }
                        ///// -------------- Handling Base Scenario Visibility Ends -----------------------
        
                        for(var i = 8; i < this._hideExtraVisibleColumnFromIndex; i++) {
                            perCols = perCols.concat(selCol);
                            if(this._visibleCols.length > 0) {
                                if(filteredArray.includes(i) || filteredBase.includes(i) || this._gxDatesFiltered.includes(i)) {
                                    ////// Handling Numeric Cols ---------------------------
                                    if(this._gxDatesFiltered.includes(i)) {
                                        for(var j = i+1; j < i+1+5; j++) {
                                            this._dataTableObj.column(j).visible(true);
                                        }
                                        i = j-1;
                                    }
                                    ////// --------------------------------------------------
                                    this._dataTableObj.column(i).visible(true);
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            } else {
                                if(perCols.includes(i) || numCols.includes(i)) {
                                    this._dataTableObj.column(i).visible(true);
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            }
                        }
                    }
                }
                else if(this._callFrom == "FY") {
                    if(scene == "vsPy") {
                        var numCols = this._dataTableObj.columns('.numericColsCSS')[0];
                        var vsPyCols = this._dataTableObj.columns('.vsPy')[0];
                        var selCol = this._dataTableObj.columns('.selColClass')[0];

                        const filteredArray = vsPyCols.filter(value => this._visibleCols.includes(value));
                            
                        /// -------------- Handling Base Scenario Visibility Starts ---------------------
                        const filteredBase = [];
                        for(var i = 0; i < 9; i++) {
                            if(i != 2 && (vsPyCols.includes(i) || i == this._dimensions.indexOf("SCENARIO_NAME"))) {
                                filteredBase.push(i);
                            }
                        }
                        /// -------------- Handling Base Scenario Visibility Ends -----------------------
        
                        for(var i = 4; i < this._hideExtraVisibleColumnFromIndex; i++) {
                            vsPyCols = vsPyCols.concat(selCol);
                            if(this._visibleCols.length > 0) {
                                if(filteredArray.includes(i) || filteredBase.includes(i) || this._gxDatesFiltered.includes(i)) {
                                    ////// Handling Numeric Cols ---------------------------
                                    if(this._gxDatesFiltered.includes(i)) {
                                        this._dataTableObj.column(i + 1).visible(true);
                                        i += 1;
                                    }
                                    ////// --------------------------------------------------
                                    if(!this._hide_Individual_ExtraVisibleColumnOfIndices.includes(i)) {
                                        this._dataTableObj.column(i).visible(true);
                                    }
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            } else {
                                if(vsPyCols.includes(i) || numCols.includes(i)) {
                                    if(!this._hide_Individual_ExtraVisibleColumnOfIndices.includes(i)) {
                                        this._dataTableObj.column(i).visible(true);
                                    }
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            }
                        }
                    }
                    else if(scene == "Per") {
                        var numCols = this._dataTableObj.columns('.numericColsCSS')[0];
                        var perCols = this._dataTableObj.columns('.perCols')[0];
                        var selCol = this._dataTableObj.columns('.selColClass')[0];
                        
                        var filteredArray = perCols.filter(value => this._visibleCols.includes(value));
                            
                        ///// -------------- Handling Base Scenario Visibility Starts ---------------------
                        const filteredBase = [];
                        for(var i = 0; i < 9; i++) {
                            if(i != 2 && (perCols.includes(i) || i == this._dimensions.indexOf("SCENARIO_NAME"))) {
                                filteredBase.push(i);
                            }
                        }
                        ///// -------------- Handling Base Scenario Visibility Ends -----------------------
        
                        for(var i = 4; i < this._hideExtraVisibleColumnFromIndex; i++) {
                            perCols = perCols.concat(selCol);
                            if(this._visibleCols.length > 0) {
                                if(filteredArray.includes(i) || filteredBase.includes(i) || this._gxDatesFiltered.includes(i)) {
                                    ////// Handling Numeric Cols ---------------------------
                                    if(this._gxDatesFiltered.includes(i)) {
                                        this._dataTableObj.column(i + 1).visible(true);
                                        i += 1;
                                    }
                                    ////// --------------------------------------------------
                                    if(!this._hide_Individual_ExtraVisibleColumnOfIndices.includes(i)) {
                                        this._dataTableObj.column(i).visible(true);
                                    }
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            } else {
                                if(perCols.includes(i) || numCols.includes(i)) {
                                    if(!this._hide_Individual_ExtraVisibleColumnOfIndices.includes(i)) {
                                        this._dataTableObj.column(i).visible(true);
                                    }
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            }
                        }

                    }
                }
            }

            columnVisibility(hideCols, showCols) {

                if(this._callFrom == "MT") {
                    if(hideCols[0] == "Num") {
                        this._stateShown = 'Num';
                        this.showPercentageWidVariance("Num");
                        if(hideCols[1] != undefined && document.querySelector(this._widgetID+"v1-custom-table").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)") != undefined) {
                            document.querySelector(this._widgetID+"v1-custom-table").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)").innerHTML = hideCols[1];
                        }
                    } 
                    else if(hideCols[0] == "Var") {
                        this._stateShown = 'Var';
                        this.showPercentageWidVariance("Var");
                        if(hideCols[1] != undefined &&  document.querySelector(this._widgetID+"v1-custom-table").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)") != undefined) {
                            document.querySelector(this._widgetID+"v1-custom-table").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)").innerHTML = hideCols[1];
                        }
                    }
                    else if(hideCols[0] == "Per") {
                        this._stateShown = 'Per';
                        this.showPercentageWidVariance("Per");
                    }

                } 
                else if (this._callFrom == "5Y") {
                    if(hideCols[0] == "Num") {
                        this._stateShown = 'Num';
                        this.showPercentageWidVariance("Num");
                    } 
                    else if(hideCols[0] == "Var") {
                        this._stateShown = 'Var';
                        this.showPercentageWidVariance("Var");
                    }
                    else if(hideCols[0] == "Per") {
                        this._stateShown = 'Per';
                        this.showPercentageWidVariance("Per");
                    }

                } 
                else if (this._callFrom == "QT") {
                    if(hideCols[0] == "vsPy") {
                        this._stateShown = 'vsPy';
                        this.showPercentageWidVariance("vsPy");
                    } 
                    else if(hideCols[0] == "Per") {
                        this._stateShown = 'Per';
                        this.showPercentageWidVariance("Per");
                    }
                }
                else if (this._callFrom == "FY") {
                    if(hideCols[0] == "vsPy") {
                        this._stateShown = 'vsPy';
                        this.showPercentageWidVariance("vsPy");
                    } 
                    else if(hideCols[0] == "Per") {
                        this._stateShown = 'Per';
                        this.showPercentageWidVariance("Per");
                    }
                }
                ///// ------------------------- For Non - MT  ------------------------------
                else {
                    if(hideCols[0] != -1) {
                        for(var i = 0; i < hideCols.length; i++) {
                            // console.log(hideCols[i])
                            this._dataTableObj.column(hideCols[i]).visible(false);
                        }
                    }
    
                    if(showCols[0] != -1) {
                        for(var i = 0; i < showCols.length; i++) {
                            this._dataTableObj.column(showCols[i]).visible(true);
                        }
                    }
                }
                stateShown =  this._stateShown;
            }

            showScenarios(fixedCols, col_start_indices, top_header_names_to_show, no_of_succeeding_measures) {

                var colIndices = col_start_indices;
                var no_of_succeeding = no_of_succeeding_measures;
                var headerNames_to_show = this._fixedScenario.slice();
                headerNames_to_show = headerNames_to_show.concat(top_header_names_to_show);
                this._headerNames_to_show =headerNames_to_show;
                var fixedCols = fixedCols;
                this._fixedCols = fixedCols;
                var visibleCols = [];
                this._colIndices = colIndices.slice();
                this._no_of_succeeding = no_of_succeeding;


                if(this._callFrom == "MT") {

                    let showCols = [];
                    let gxDates = this._dataTableObj.columns(".selColClass")[0];

                    if(this._stateShown == "Per") {
                        showCols = this._dataTableObj.columns(".perColCSS")[0];
                    } else if(this._stateShown == "Var") {
                        showCols = this._dataTableObj.columns(".varCol")[0];
                    } else {
                        showCols = this._dataTableObj.columns(".numCol")[0];
                    }
                    this._gxDatesFiltered = [];

                    ////// For showing Columns from indices
                    for(var i = 0; i < colIndices.length; i++) {
                        for(var j = parseInt(colIndices[i]); j <= parseInt(colIndices[i]) + no_of_succeeding; j++) {
                            visibleCols.push(j)
                        }
                    }

                    var visiCols = [];

                    ///// For Hiding Columns form Indices
                    for(var i = fixedCols; i < this._tableColumnNames.length; i++) {
                        if(i < this._hideExtraVisibleColumnFromIndex) 
                        {
                            if(visibleCols.includes(i) && (showCols.includes(i) || gxDates.includes(i))) {
                                if(gxDates.includes(i)) {
                                    this._gxDatesFiltered.push(i)
                                }
                                this._dataTableObj.column(i).visible(true);
                                visiCols.push(i)
                            } else {
                                this._dataTableObj.column(i).visible(false);
                            }
                        } 
                        else {
                            this._dataTableObj.column(i).visible(false);
                        }
                       
                    }

                    this._visibleCols = visiCols.slice();

                } 
                else if(this._callFrom == "5Y") {

                    let showCols = [];
                    let gxDates = this._dataTableObj.columns(".selColClass")[0];
                    let cagrCols = this._dataTableObj.columns(".cagrCol")[0];

                    if(this._stateShown == "Per") {
                        showCols = this._dataTableObj.columns(".perCols")[0];
                    } else if(this._stateShown == "Var") {
                        showCols = this._dataTableObj.columns(".varCols")[0];
                    } else {
                        showCols = this._dataTableObj.columns(".numericColsCSS")[0];
                    }
                    this._gxDatesFiltered = [];

                    ////// For showing Columns from indices
                    for(var i = 0; i < colIndices.length; i++) {
                        for(var j = parseInt(colIndices[i]); j <= parseInt(colIndices[i]) + no_of_succeeding; j++) {
                            
                            visibleCols.push(j)
                            
                            if(cagrCols.includes(j)) {
                                showCols.push(j);
                            }

                        }
                    }

                    this._visibleCols = visibleCols.slice();

                    ///// For Hiding Columns form Indices
                    for(var i = 20; i < this._tableColumnNames.length; i++) {
                        if(i < this._hideExtraVisibleColumnFromIndex) 
                        {
                            if(visibleCols.includes(i) && (showCols.includes(i) || gxDates.includes(i))) {
                                if(gxDates.includes(i)) {
                                    this._gxDatesFiltered.push(i)
                                }
                                this._dataTableObj.column(i).visible(true);
                            } else {
                                this._dataTableObj.column(i).visible(false);
                            }
                        } 
                        else {
                            this._dataTableObj.column(i).visible(false);
                        }
                       
                    }
                    
                }
                else if (this._callFrom == "QT") {

                    let showCols = [];
                    let gxDates = this._dataTableObj.columns(".selColClass")[0];

                    if(this._stateShown == "Per") {
                        showCols = this._dataTableObj.columns(".perCols")[0];
                    } 
                    ///// --------------------- vsPy CASE -----------------------
                    else { 
                        showCols = this._dataTableObj.columns(".vsPy")[0];
                    }

                    showCols = Array.from(new Set(showCols.concat(this._dataTableObj.columns(".numericColsCSS")[0])))

                    this._gxDatesFiltered = [];

                    ////// BASE CASE --------------------------
                    for(var i = 8; i < 18; i++) {
                        visibleCols.push(i)
                    }
                    ////// ------------------------------------

                    ////// For showing Columns from indices
                    for(var i = 0; i < colIndices.length; i++) {
                        for(var j = parseInt(colIndices[i]); j <= parseInt(colIndices[i]) + no_of_succeeding; j++) {
                            visibleCols.push(j)
                        }
                    }

                    this._visibleCols = visibleCols.slice();

                    ///// For Hiding Columns form Indices
                    for(var i = 8; i < this._tableColumnNames.length; i++) {
                        if(i < this._hideExtraVisibleColumnFromIndex) 
                        {
                            if(visibleCols.includes(i) && (showCols.includes(i) || gxDates.includes(i))) {
                                if(gxDates.includes(i)) {
                                    this._gxDatesFiltered.push(i)
                                }
                                this._dataTableObj.column(i).visible(true);
                            } else {
                                this._dataTableObj.column(i).visible(false);
                            }
                        } 
                        else {
                            this._dataTableObj.column(i).visible(false);
                        }
                    }

                }
                else if (this._callFrom == "FY") {

                    let showCols = [];
                    let gxDates = this._dataTableObj.columns(".selColClass")[0];

                    if(this._stateShown == "Per") {
                        showCols = this._dataTableObj.columns(".perCols")[0];
                    } 
                    ///// --------------------- vsPy CASE -----------------------
                    else { 
                        showCols = this._dataTableObj.columns(".vsPy")[0];
                    }

                    showCols = Array.from(new Set(showCols.concat(this._dataTableObj.columns(".numericColsCSS")[0])))

                    this._gxDatesFiltered = [];

                    ////// BASE CASE --------------------------
                    for(var i = 5; i < 10; i++) {
                        visibleCols.push(i)
                    }
                    ////// ------------------------------------

                    ////// For showing Columns from indices
                    for(var i = 0; i < colIndices.length; i++) {
                        for(var j = parseInt(colIndices[i]); j <= parseInt(colIndices[i]) + no_of_succeeding; j++) {
                            if(!visibleCols.includes(j)) {
                                visibleCols.push(j)
                            }
                        }
                    }

                    this._visibleCols = Array.from(new Set(visibleCols.slice()));

                    ///// For Hiding Columns form Indices
                    for(var i = 8; i < this._tableColumnNames.length; i++) {
                        if(i <= this._hideExtraVisibleColumnFromIndex) 
                        {
                            if(visibleCols.includes(i) && (showCols.includes(i) || gxDates.includes(i))) {
                                if(gxDates.includes(i)) {
                                    this._gxDatesFiltered.push(i)
                                }
                                if(!this._hide_Individual_ExtraVisibleColumnOfIndices.includes(i)) {
                                    this._dataTableObj.column(i).visible(true);
                                }
                            } else {
                                this._dataTableObj.column(i).visible(false);
                            }
                        } 
                        else {
                            this._dataTableObj.column(i).visible(false);
                        }
                    }

                }
                else {
                    ////// Fixed cols i.e base case
                    for(var i = 0; i <= fixedCols; i++) {
                        visibleCols.push(i);
                    }

                    ////// For showing Columns from indices
                    for(var i = 0; i < colIndices.length; i++) {
                        for(var j = parseInt(colIndices[i]); j <= parseInt(colIndices[i]) + no_of_succeeding; j++) {
                            // console.log(j, "->", parseInt(colIndices[i])+no_of_succeeding)
                            this._dataTableObj.column(j).visible(true);
                            visibleCols.push(j)
                        }
                    }

                    ////// For Hiding Columns from indices (Pre-Decided)
                    for(var i = 0; i < this._tableColumnNames.length; i++) {
                        if(!visibleCols.includes(i)) {
                            this._dataTableObj.column(i).visible(false);
                        }
                    }
                }
               
                // console.log(this._dataTableObj.column(2).data())

                const list = document.querySelector(this._widgetID+"v1-custom-table").shadowRoot.querySelector("#example > thead");

                for(var i = 0; i < list.children.length - 1; i++) {
                    list.removeChild(list.children[i]);
                }

                var topHeader = "<tr role='row'>";

                // Monthly Case
                if(this._callFrom == "MT") {
                    ////// Empty Case
                    topHeader += `<th class='top-header' colspan='${this._colspan_EmptyCase}'></th>`;
                    ////// Base Case
                    topHeader += `<th class='top-header' colspan='${this._colspan_BaseCase}' id='${this._customTopHeader[0].replace(" ","")}' >${this._customTopHeader[0]}</th>`
                    ////// Rest Case
                    for(var i = 0; i < top_header_names_to_show.length; i++) {
                        topHeader += `<th class='top-header' colspan='${this._colspan_RestCase}' id='${top_header_names_to_show[i].replace(" ","")}' >${top_header_names_to_show[i]}</th>`
                    }
                }
                // QTR Case
                else if(this._colOrder.includes("Q1") || this._colOrder.includes("Q2") || this._colOrder.includes("Q3") || this._colOrder.includes("Q4")) {
                    ////// Empty Case
                    topHeader += `<th class='top-header' colspan='${this._colspan_EmptyCase}'></th>`;
                    ////// Base Case
                    topHeader += `<th class='top-header' colspan='${this._colspan_BaseCase}' id='${this._customTopHeader[0].replace(" ","")}' >${this._customTopHeader[0]}</th>`
                    topHeader += `<th class='top-header' colspan='${this._colspan_RestCase}' id='${this._customTopHeader[1].replace(" ","")}' >${this._customTopHeader[1]}</th>`
                    ////// Rest Case
                    for(var i = 0; i < top_header_names_to_show.length; i++) {
                        topHeader += `<th class='top-header' colspan='${this._colspan_BaseCase}' id='${top_header_names_to_show[i].replace(" ","")}' >${top_header_names_to_show[i]}</th>`
                        topHeader += `<th class='top-header' colspan='${this._colspan_RestCase}' id='${this._customTopHeader[1].replace(" ","")}' >${this._customTopHeader[1]}</th>`
                    }
                } 
                else if(this._callFrom == "5Y") {
                    ////// Empty Case
                    topHeader += `<th class='top-header' colspan='${this._colspan_EmptyCase}'></th>`;
                    ////// Base Case
                    topHeader += `<th class='top-header' colspan='${this._colspan_BaseCase}' id='${this._customTopHeader[0].replace(" ","")}' >${this._customTopHeader[0]}</th>`
                    ////// Rest Case
                    for(var i = 0; i < top_header_names_to_show.length; i++) {
                        topHeader += `<th class='top-header' colspan='${this._colspan_RestCase}' id='${top_header_names_to_show[i].replace(" ","")}' >${top_header_names_to_show[i]}</th>`
                    }
                }
                // Full Year Case
                else { 
                    ////// Empty Case
                    topHeader += `<th class='top-header' colspan='${this._colspan_EmptyCase}'></th>`;
                    ////// Base Case
                    topHeader += `<th class='top-header' colspan='${this._colspan_BaseCase}' id='${this._customTopHeader[0].replace(" ","")}' >${this._customTopHeader[0]}</th>`
                    ////// Rest Case
                    for(var i = 0; i < top_header_names_to_show.length; i++) {
                        topHeader += `<th class='top-header' colspan='${this._colspan_RestCase}' id='${top_header_names_to_show[i].replace(" ","")}' >${top_header_names_to_show[i]}</th>`
                    }
                }

               
                topHeader += `</tr>`;

                document.querySelector(this._widgetID+"v1-custom-table").shadowRoot.querySelector("#example > thead").insertAdjacentHTML('afterBegin', topHeader);
                
            }

            preserveSelection(rowid, selector_ids, valArr = [], call_from) {

                selector_ids = Array.from(selector_ids);

                /////////////// For Color ---------------- 
                var idArr = [], changeCellColr = [];

                var vsPyCols = this._dataTableObj.columns(".vsPy")[0];
                var perCols = this._dataTableObj.columns(".perCols")[0];
                var varCols_5Y = this._dataTableObj.columns(".varCols")[0];

                for(var i = 0; i < selector_ids.length; i++) {
                    var num = parseInt(selector_ids[i].split("_")[0]);
                    idArr.push(num);
                    for(var j = num; j < num + this._measureOrder.length; j++) {
                        if(vsPyCols.includes(j) || perCols.includes(j) || varCols_5Y.includes(j)) {
                            changeCellColr.push(j);
                        }
                    }
                }
                /////////////// For Color ---------------- 

                for(var i = 0; i < valArr.length; i++) {

                    this._dataTableObj
                    .rows()
                    .nodes()
                    .each(row => row.classList.remove('selected'));

                    this._dataTableObj.row(rowid).node().setAttribute("class","selected")
                        
                    for(var i = 0; i < valArr.length; i++) {
                        var selectorID = ".row_level_select_"+selector_ids[i];
                        var selElement = document.querySelector(this._widgetID+"v1-custom-table").shadowRoot.querySelector(selectorID);
                        if(selElement && selElement.selectedIndex != undefined) {
                            selElement.selectedIndex = valArr[i];
                            // console.log(selector_ids)
                            // console.log(selElement)
                            selElement.dispatchEvent(new Event("change"));
                        }

                        // console.log(">>>",Object.keys(DO_FY["DRP_USR_TRIGGERED"]).includes(rowid.toString()));
                        // console.log("--->>>",Object.keys(DO_FY["DRP_USR_TRIGGERED"][rowid.toString()]).includes(selector_ids[i]));

                        if(selElement) {
                            selElement.style.border = "none";
                            selElement.style.backgroundColor = "#DCE6EF";
                        }
                       
                        if(call_from == "FY") {

                            if( DO_FY["DRP_USR_TRIGGERED"] && 
                                DO_FY["DRP_USR_TRIGGERED"][rowid.toString()] != undefined && 
                                Object.keys(DO_FY["DRP_USR_TRIGGERED"][rowid.toString()]).includes(selector_ids[i])) {
                                
                                if(selElement) {
                                    selElement.style.backgroundColor="#C4DBEE";
                                    selElement.style.border = "2px solid #0460A9";
                                }

                            }

                        }
                        else if(call_from == "QT") {

                            if( DO_QT["DRP_USR_TRIGGERED"] && 
                                DO_QT["DRP_USR_TRIGGERED"][rowid.toString()] != undefined && 
                                Object.keys(DO_QT["DRP_USR_TRIGGERED"][rowid.toString()]).includes(selector_ids[i])) {
                                
                                if(selElement) {
                                    selElement.style.backgroundColor="#C4DBEE";
                                    selElement.style.border = "2px solid #0460A9";
                                }

                            }

                        }
                        else if(call_from == "MT") {
                            
                            if( DO_MT["DRP_USR_TRIGGERED"] && 
                                DO_MT["DRP_USR_TRIGGERED"][rowid.toString()] != undefined && 
                                Object.keys(DO_MT["DRP_USR_TRIGGERED"][rowid.toString()]).includes(selector_ids[i])) {
                                
                                if(selElement) {
                                    selElement.style.backgroundColor="#C4DBEE";
                                    selElement.style.border = "2px solid #0460A9";
                                }

                            }

                        }
                        else if(call_from == "5Y") {
                            
                            if( DO_5Y["DRP_USR_TRIGGERED"] && 
                                DO_5Y["DRP_USR_TRIGGERED"][rowid.toString()] != undefined && 
                                Object.keys(DO_5Y["DRP_USR_TRIGGERED"][rowid.toString()]).includes(selector_ids[i])) {
                                
                                if(selElement) {
                                    selElement.style.backgroundColor="#C4DBEE";
                                    selElement.style.border = "2px solid #0460A9";
                                }

                            }

                        }

                    }

                    // var row_id = this._dataTableObj.row(':last')[0]
                    var row_id = rowid;
                    for(var j = 0; j < changeCellColr.length; j++) {

                        var node = this._dataTableObj.cell(row_id, changeCellColr[j]).node();
                        var data = this._dataTableObj.cell(row_id, changeCellColr[j]).data();

                        if(data <= 0) {
                            node.style.color = "#A92626";
                        } else {
                            node.style.color = "#2D7230";
                        }

                    }
                    
                }
            }

            setSelectorsSelectedValue(selector_ids, valArr = [], callFrom) {

                selector_ids = Array.from(selector_ids);

                /////////////// For Color ---------------- 
                var idArr = [], changeCellColr = [];

                var vsPyCols = this._dataTableObj.columns(".vsPy")[0];
                var perCols = this._dataTableObj.columns(".perCols")[0];


                for(var i = 0; i < selector_ids.length; i++) {
                    var num = parseInt(selector_ids[i].split("_")[0]);
                    idArr.push(num);
                    if(callFrom == "FY") {
                        for(var j = num; j < num + this._measureOrder.length; j++) {
                            if(vsPyCols.includes(j) || perCols.includes(j)) {
                                changeCellColr.push(j);
                            }
                        }
                    } else if(callFrom == "QT") {
                        for(var j = num; j < num + this._colOrder.length * 3; j++) {
                            if(vsPyCols.includes(j) || perCols.includes(j)) {
                                changeCellColr.push(j);
                            }
                        }
                    } else if(callFrom == "MT") {

                        vsPyCols = this._dataTableObj.columns(".varCol")[0];
                        perCols = this._dataTableObj.columns(".perColCSS")[0];

                        num += 3; 

                        for(var j = num; j < num + this._colOrder.length * 3; j++) {
                            if(vsPyCols.includes(j) || perCols.includes(j)) {
                                changeCellColr.push(j);
                            }
                        }
                    }
                   
                }
                /////////////// For Color ---------------- 


                for(var i = 0; i < valArr.length; i++) {

                    this._dataTableObj
                    .rows()
                    .nodes()
                    .each(row => row.classList.remove('selected'));

                    this._dataTableObj.row(':last').node().setAttribute("class","selected")
                        
                    for(var i = 0; i < valArr.length; i++) {
                        var selectorID = ".row_level_select_"+selector_ids[i];
                        var selElement = document.querySelector(this._widgetID+"v1-custom-table").shadowRoot.querySelector(selectorID);
                        if(selElement && selElement.selectedIndex != undefined) {
                            selElement.selectedIndex = valArr[i];
                            // console.log(selector_ids)
                            // console.log(selElement)
                            selElement.dispatchEvent(new Event("change"));
                        }
                       
                    }

                    var row_id = this._dataTableObj.row(':last')[0]
                    for(var j = 0; j < changeCellColr.length; j++) {

                        var node = this._dataTableObj.cell(row_id, changeCellColr[j]).node();
                        var data = this._dataTableObj.cell(row_id, changeCellColr[j]).data();

                        if(data <= 0 || data <= "0") {
                            node.style.color = "#A92626";
                        } else {
                            node.style.color = "#2D7230";
                        }

                    }
                    
                }

                // document.querySelector("v1-custom-table").shadowRoot.querySelector("#\\30").selectedIndex = 2;
                // console.log(document.querySelector("v1-custom-table").shadowRoot.querySelector("#\\30").parentNode.parentNode.setAttribute("class","selected"));
                // console.log(document.querySelector("v1-custom-table").shadowRoot.querySelector("#\\30").parentNode.parentNode);
                // document.querySelector("v1-custom-table").shadowRoot.querySelector("#\\30").dispatchEvent(new Event("change"));
            }

            applyStyling_FY() {

                document.querySelector(this._widgetID+"v1-custom-table").shadowRoot.querySelector("style").innerText += `
                tbody, td, tfoot, th, thead, tr {
                    border-color: inherit;
                    border-style: none;
                    border-width: 0;
                }
    
                /* ------------------------- CUSTOM STYLING --------------------------------- */
    
    
                #example > tbody > tr:nth-child(2) > td.truncate {
                    font-weight:bold;
                }
    
                select {
                    padding-top:0%;
                    background-color:#DCE6EF;
                    outline:none;
                }
    
                option {
                    background-color:white;
                    color:black;
                }
                
                select:focus>option:checked {
                    background:#0460A9;
                    color:white;
                    /* selected */
                }
    
                #example th {
                    text-wrap: nowrap;
                    border-bottom: 1px solid #CBCBCB;
                    background-color:#F2F2F2;
                    align-content: center;
                    font-family: Arial;
                    color:black;
                    font-size:14px;
                }
    
                #example > tbody > tr:nth-child(2) {
                    font-weight:bold;
                }
    
                /* ------------------------- TOP MOST - HEADER ROW ------------------------- */
    
                #example .top-header {
                    height:32px;
                    max-height:32px;
                    font-family: Arial;
                    color:black;
                    font-size:14px;
                    font-weight:bold;
                    text-align: center;
                    padding-top:0%!important;
                    padding-bottom:0%!important;
                }
    
                /* ------------------------- BASE CASE ------------------------- */
    
                #example > thead > tr:nth-child(1) > th:nth-child(2) {
                    background-color:#E0E0E0;
                }
    
                /* ------------------------- SCENARIO 1 ------------------------- */
    
                #example > thead > tr:nth-child(1) > th:nth-child(3) {
                    background-color:#D9D9D9;
                }
    
                /* ------------------------- SCENARIO 2 ------------------------- */
    
                #example > thead > tr:nth-child(1) > th:nth-child(4) {
                    background-color:#CBCBCB;
                }
    
                /* ------------------------- SCENARIO 3 ------------------------- */
    
                #example > thead > tr:nth-child(1) > th:nth-child(5) {
                    background-color:#BDBDBD;
                }
    
                /* ------------------------- 2nd MOST HEADER ------------------------- */
                
                #example > thead > tr:nth-child(2) {
                    height:48px; 
                }
    
                /* ------------------------- SCENARIO SELECT ELEMENTS HEADER ------------------------- */
    
                .scenarios {
                    background-color:inherit;
                    font-family: Arial;
                    color:black;
                    font-size:14px;
                    text-align:center;
                    font-weight:bold;
                    height:30px;
                    border:none;
                    cursor: pointer;
                }
    
                /* ------------------------- GROUPED ROW ------------------------- */
    
                #example .group > td {
                    height:32px;
                    padding: 0px 10px!important;
                    align-content: center;
                    font-weight:bold;
                    color: #212121;
                    font-family: Arial;
                    background-color:#E0E0E0!important;
                }

                #example .clTotalRow > td {
                    background-color:#b7d0e621;
                }
    
                /* ------------------------- NORMAL ROW ------------------------- */
    
                #example td {
                    text-wrap:nowrap;
                    background-color:white;
                    height:48px;
                    border-bottom:1px solid #CBCBCB!important;
                    font-family: Arial;
                    font-size:14px;
                    align-content: center;
                }
    
                #example .numericColsCSS,  #example .vsPy,  #example .perCols {
                    text-align:right!important;
                }

                #example .numericColsCSS {
                    color:#212121!important;
                }
    
                /* ------------------------- ROW LEVEL SELECT ------------------------- */
    
                #example .row_level_select {
                    font-family: Arial;
                    font-size: 14px;
                    height: 30px;
                    background-color: #DCE6EF;
                    border-radius:4px;
                    border:none;
                    outline:none;
                    cursor: pointer;
                }
     
                /* ------------------------- TRUNCATE ROW LEVEL DATA ------------------------- */
    
                #example .truncate {
                    max-width:130px;
                    padding-left: 2%;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
    
                /* ------------------------- TOP FIXED HEADER SCROLL ------------------------- */
    
                #example > thead {
                    position: sticky;
                    top:0%!important;
                    border-bottom: 1px solid #CBCBCB;
                    background-color: yellow;
                }
    
                #example {
                    position: absolute;
                    width:100%!important;
                    border-collapse: separate;
                }
    
                .mt-2 {
                    margin-top: 0% !important;
                }
    
                /* ------------------------- REMOVE TOP MOST PADDING ------------------------- */
    
                #example_wrapper > div.dt-layout-row.dt-layout-table > div {
                    padding:0%!important;
                }
    
                /* --------------------------- 1ST TOP TOTAL ROW ---------------------------- */
    
                #example > tbody > tr:nth-child(1) > td {
                    font-weight:bold;
                }

                #example > tbody > tr:nth-child(1) {
                    position:sticky!important;
                    top:80px!important;
                }
                
                `;
            }

            async render_FY() {

                DO_FY = {}

                if (!this._resultSet) {
                    return
                }

                this._widgetID = "#"+this["parentNode"].id+" > ";
                this._stateShown = "vsPy";
                this._visibleCols = [];

                var table_cols = []

                var col_dimension = this._dimensions;
                var col_measures = this._measureOrder;
                var fixedScenarioAt = col_dimension.indexOf("SCENARIO_NAME")
                console.log("Fixed Scenario At : ", fixedScenarioAt);

                console.log('ResultSet Success')

                col_dimension = col_dimension.slice(0, col_dimension.indexOf("SCENARIO_NAME"))

                var classname_col = "numericColsCSS";

                if(this._colOrder[0] == "FY") {
                  
                    if(Object.keys(this._customHeaderNames).length > 0) {
                         for (var i = 0; i < this._customHeaderNames["DIMEN_NAME"].length; i++) {
                            if(this._customHeaderNames["DIMEN_NAME"][i] != "SCENARIO_NAME") {
                                table_cols.push({
                                    title: this._customHeaderNames["DIMEN_NAME"][i]
                                })
                            }
                        }
        
                        for(var j = 0; j < this._customHeaderNames["MES_NAME"].length; j++) {
                            if(j == this._customHeaderNames["MES_NAME"].length - 3 || j == this._customHeaderNames["MES_NAME"].length - 2 || j == this._customHeaderNames["MES_NAME"].length - 1) {
                                classname_col = "perCols";
                            }
                            else if(j == this._customHeaderNames["MES_NAME"].length - 6  || j == this._customHeaderNames["MES_NAME"].length - 5 || j == this._customHeaderNames["MES_NAME"].length - 4) {
                                classname_col = "vsPy";
                            }
                            else {
                                classname_col = "numericColsCSS";
                            }
                            table_cols.push({
                                title: this._customHeaderNames["MES_NAME"][j],
                                className:classname_col
                            })
                        }
                       
                        for(var i = this._fixedScenario.length; i < this._scenarioOrder.length; i++) {
                            if(this._scenarioOrder[i] != "FY") {
                                table_cols.push({
                                    title: this._customHeaderNames["SCENARIO_NAME"][i],
                                    className:"selColClass"
                                })
                            }
                            for(var j = 0; j < this._customHeaderNames["MES_NAME"].length; j++) {
                                if(j == this._customHeaderNames["MES_NAME"].length - 3 || j == this._customHeaderNames["MES_NAME"].length - 2 || j == this._customHeaderNames["MES_NAME"].length - 1) {
                                    classname_col = "perCols";
                                } 
                                else if(j == this._customHeaderNames["MES_NAME"].length - 6 || j == this._customHeaderNames["MES_NAME"].length - 5 || j == this._customHeaderNames["MES_NAME"].length - 4) {
                                    classname_col = "vsPy";
                                }
                                else {
                                    classname_col = "numericColsCSS";
                                }
                                table_cols.push({
                                    title: this._customHeaderNames["MES_NAME"][j],
                                    className:classname_col
                                })
                            }
                        }
                    } else {
                        for (var i = 0; i < col_dimension.length; i++) {
                            if(col_dimension[i] != "SCENARIO_NAME") {
                                table_cols.push({
                                    title: col_dimension[i]
                                })
                            }
                        }
        
                        for(var j = 0; j < this._measureOrder.length; j++) {
                            if(j == this._measureOrder.length - 2 || j == this._measureOrder.length - 1) {
                                classname_col = "perCols";
                            } 
                            else if(j == this._measureOrder.length - 3 || j == this._measureOrder.length - 4) {
                                classname_col = "vsPy";
                            }
                            else {
                                classname_col = "numericColsCSS";
                            }
                            table_cols.push({
                                title: col_measures[j],
                                className:classname_col
                            })
                        }
                       
                        for(var i = this._fixedScenario.length; i < this._scenarioOrder.length; i++) {
                            if(this._scenarioOrder[i] != "FY") {
                                table_cols.push({
                                    title: this._scenarioOrder[i],
                                    className:"selColClass"
                                })
                            }
                            for(var j = 0; j < this._measureOrder.length; j++) {
                                if(j == this._measureOrder.length - 2 || j == this._measureOrder.length - 1) {
                                    classname_col = "perCols";
                                } 
                                else if(j == this._measureOrder.length - 3 || j == this._measureOrder.length - 4) {
                                    classname_col = "vsPy";
                                }
                                else {
                                    classname_col = "numericColsCSS";
                                }
                                table_cols.push({
                                    title: col_measures[j],
                                    className:classname_col
                                })
                            }
                        }
                    }
                }
               
                // TRIM LOGIC
                console.log('Data Table Columns : ', table_cols)
                this._tableColumnNames = table_cols;

                 //// ------------------------ var cols indices starts ---------------------------------
                 var colorColIndices = new Set();
                 var considerCons = ["perCols", "vsPy"];
                 var numColsForDecimal = [];

                 var alignCols = ["numericColsCSS", "perCols", "vsPy"]
                 var alignRight = new Set();
                 for(var i = 0; i < this._tableColumnNames.length; i++) {
                     if(considerCons.includes(this._tableColumnNames[i]["className"])) {
                        colorColIndices.add(i);
                     }
                     if(alignCols.includes(this._tableColumnNames[i]["className"])) {
                        alignRight.add(i)
                     }
                     if(this._tableColumnNames[i]["className"] == "numericColsCSS") {
                        numColsForDecimal.push(i);
                     }
                 }
                 //// ------------------------ var cols indices ends -----------------------------------

                //// ------------------------ Show Totals on Row Block Starts ---------------------------------
                // var indices = [];
                this._fixedIndices = this._fixedIndices.concat(this._dropdownIndices);
                var templateGroupTotal = ["Total"];

                for(var i = 0; i < this._tableColumnNames.length; i++) {
                    if(this._dropdownIndices.includes(i)) {
                        indices.push(-1);
                    } 
                    else if (!this._fixedIndices.includes(i)) {
                        indices.push(i);
                    }
                    ////// -------------- For subset group total on rowgroup level starts --------------------
                    if(i > 0) {
                        if(this._customHeaderNames["SCENARIO_NAME"].includes(this._tableColumnNames[i].title) || this._tableColumnNames[i].title == this._dateColName) {
                            templateGroupTotal.push("");
                        } else {
                            templateGroupTotal.push("");
                        }
                    }
                    ////// -------------- For subset group total on rowgroup level Ends ----------------------
                }

                this._indices = indices;

                //// ------------------------ Show Totals on Row Block Ends ---------------------------------

                // --------------- Hide Columns STARTS ---------------
                var hideCols = []

                // @--------------- CHANGED UNCOMMENT THIS... ----------------------------------

                for(var i = this._hideExtraVisibleColumnFromIndex; i < table_cols.length; i++) {
                    hideCols.push(i)
                }

                for(var i = 0; i < this._hide_Individual_ExtraVisibleColumnOfIndices.length; i++) {
                    hideCols.push(this._hide_Individual_ExtraVisibleColumnOfIndices[i])
                }

                // --------------- Hide Columns ENDS ---------------

                var groupColumn = this._col_to_row

                var tbl = undefined;
                var groupBy = new Set();

                if (!jQuery().dataTable) {
                    console.log("-------- Datatable not initialized. \nRe-Initialzing Datatable libraries ...  ");
                    await this.loadLibraries();
               }

                if (groupColumn != -1) {

                    hideCols.push(groupColumn);

                    this._dataTableObj = new DataTable(this._table, {
                        layout: {},
                        columns: table_cols,
                        bAutoWidth: false, 
                        columnDefs: [
                            {
                                defaultContent: '-',
                                // targets: hideCols, //_all
                                // targets: groupColumn,
                                targets : "_all",
                               
                                // className: 'dt-body-left'
                            },
                            { 
                                targets:hideCols,  visible: false
                            },
                            { 
                                targets:1, className:"truncate"
                            },
                            {
                                targets:numColsForDecimal,
                                render: function ( data, type, row ) {
                                    if(data != undefined && !isNaN(data)) {
                                        data =  parseFloat(data.toString().replace(/,{1,}/g,"")).toFixed(0);
                                    }
                                    return data
                                },
                            },
                            {
                                "targets": Array.from(colorColIndices),
                                "createdCell": function (td, cellData, rowData, row, col) {
                                    if (cellData >= 0 || cellData >= "0") {
                                        $(td).css('color', '#2D7230')
                                    }
                                    else if (cellData < 0 || cellData < "0") {
                                        $(td).css('color', '#A92626')
                                    }
                                }
                            },
                        ],
                         createdRow: function(row){
                            var td = $(row).find(".truncate");
                            td["prevObject"]["context"]["children"][0].title = td["prevObject"]["context"]["cells"][0]["innerText"];
                        },
                        order: [[groupColumn, 'asc']],
                        displayLength: 25,
                        drawCallback: function (settings) {
                            var api = this.api()
                            var rows = api.rows({ page: 'current' }).nodes()
                            var last = null

                            // api
                            //     .column(groupColumn, { page: 'current' })
                            //     .data()
                            //     .each(function (group, i) {
                            //         if (last !== group) {
                            //             $(rows)
                            //                 .eq(i)
                            //                 .before(
                            //                     $('<tr class="group"><td>'+group+'</td>'+templateGroupTotal).addClass(group.toString().replace(" ",""))
                            //                     // '<tr class="group"><td colspan="' +
                            //                     // table_cols.length +
                            //                     // '">' +
                            //                     // group +
                            //                     // '</td></tr>'
                                                
                            //                 )
                            //             last = group
                            //         }
                            //     })
                                // api
                                // .column(groupColumn + 1, { page: 'current' })
                                // .data()
                                // .each(function (group, i) {
                                //     // if (last !== group) {
                                //         $(rows)
                                //             .eq(i)
                                //             .before(
                                //                 $(templateGroupTotal).addClass(group.toString().replace(" ",""))
                                //             )
                                //         // last = group
                                //     // }
                                // })
                        },
                        // initComplete: function (settings, json) {
                        //     alert('DataTables has finished its initialisation.');
                        // },
                        bPaginate: false,
                        searching: false,
                        ordering: false,
                        info: false,     // Showing 1 of N Entries...
                        destroy: true,
                    })
                } else {
                    this._dataTableObj = new DataTable(this._table, {
                        layout: {},
                        columns: table_cols,
                        bAutoWidth: false, 
                        columnDefs: [
                            {
                                defaultContent: '-',
                                targets: hideCols, //_all
                                visible:false
                                // className: 'dt-body-left'
                            }
                        ],
                        bPaginate: false,
                        searching: false,
                        ordering: false,
                        info: false,     // Showing 1 of N Entries...
                        destroy: true,
                    })

                   
                }

                tbl = this._dataTableObj

                if(tbl.data().any()) {
                    tbl.rows().remove().draw();
                }

                // this._dataTableObj = tbl;
                // console.log(this._dataTableObj)

                ////// -------------------------- Show Total Row ------------------------
                var showTotalRow = ["Total", "Total"];
                var showTotalonRowUpdateFlag = false;
                for(var i = 2; i < this._tableColumnNames.length; i++) {
                    if(this._indices.includes(i)) {
                        showTotalRow.push("")
                    } else {
                        showTotalRow.push("")
                    }
                }
                tbl.row.add(showTotalRow).draw(false)
                /////  ------------------------------------------------------------------

//  ------------------------------ TO BE UNCOMMENTED ----------------------
                // Top Most Header Block Starts
                var topHeader = "<tr role='row'>";
                
                // 1st empty top header blocks...
                if(groupColumn != -1) {
                    topHeader += `<th class='top-header' colspan='${this._colspan_EmptyCase}'></th>`;
                } else {
                    topHeader += `<th class='top-header' colspan='${this._colspan_EmptyCase}'></th>`;
                }
                // 
                // CHANGED TO -2 in loop condition for neglecting last two scenarios
    

                if(this._customTopHeader) {
                    for(var i = 0; i < 4; i++) {
                        topHeader += `<th class='top-header' colspan='${this._colspan_BaseCase}' id='${this._customTopHeader[i].replace(" ","")}' >${this._customTopHeader[i]}</th>`
                    }
                } else {
                    for(var i = 0; i < this._scenarioOrder.length - 2; i++) {
                        // Base Case/Scenario
                        if(this._fixedScenario.includes(this._scenarioOrder[i])) {
                            topHeader += `<th class='top-header' colspan='${this._colspan_BaseCase}' id='${this._scenarioOrder[i].replace(" ","")}'>${this._scenarioOrder[i]}</th>`
                        } else {
                            // Rest Case/Scenario
                                for(var j = 0; j < this._scenarioOrder.length; j++) {
                                    if(!this._fixedScenario.includes(this._scenarioOrder[j])) {
                                        if(this._scenarioOrder[i] == this._scenarioOrder[j]) {
                                            topHeader += `<th class='top-header' id='${this._scenarioOrder[j].replace(" ","")}' colspan='${this._colspan_RestCase}'>${this._scenarioOrder[j]}`;
                                        } 
                                    }
                                }
                            topHeader +=  `</th>`;
                        }
                    }
                    topHeader += "</tr>";
                }
               
                // @--- uncomment below line
                console.log(this._widgetID+"v1-custom-table")

//  ------------------------------ TO BE UNCOMMENTED ----------------------

                // console.log(topHeader)
               
                tbl.on('click', 'tbody tr', e => {

                    // tbl.$('tr').removeClass('selected');
                    let classList = e.currentTarget.classList
                    tbl
                        .rows()
                        .nodes()
                        .each(row => row.classList.remove('selected'));
                    
                    if(classList.length != 1) {

                        classList.add('selected');

                        if(DO_FY["DRP_USR_TRIGGERED"] == undefined) {
                            DO_FY["DRP_USR_TRIGGERED"] = {}
                        }
    
                        if(DO_FY["DRP_USR_TRIGGERED"][tbl.row('.selected').index()] == undefined) {
                            DO_FY["DRP_USR_TRIGGERED"][tbl.row('.selected').index()] = {}
                        }
    
                    }

                    // console.log(typeof(e.target.classList), Object.keys(e.target.classList), e)
                    if(e.target.classList && e.target.classList[0] == "row_level_select") {
                        var sid = e.target.classList[1].split("row_level_select_")[1];
                        DO_FY["DRP_USR_TRIGGERED"][tbl.row('.selected').index()][sid] = 1;
                    }

                })

                
                // Master Reference Node For Selection Elements used Inside updateRow(), updateColumns() Method
                var hMap = {};
                var fixRowsObj = {}, masterObj = {};
                var is_col_updated = false;

                function updateTotalOnRowUpdate(updateFrom, no_of_mes, updateFromRowID) {
                    
                    /// ----------------------- For Subset Group Total Starts --------------------------- 
                    var parentID = undefined;
                    for(var [k, v] of Object.entries(groupRowMapping)) {
                        if(v.includes(updateFromRowID)) {
                            parentID = k;
                            break;
                        }
                    }
                    var subsetChildren = groupRowMapping[parentID].slice(1, );
                    /// ----------------------- For Subset Group Total Ends --------------------------- 

                    var indices = [];
                    var numericCols = [];
                    for(var i = 0; i < table_cols.length; i++) {
                        if(table_cols[i]["className"] == "numericColsCSS") {
                            indices.push(i);
                        } else {
                            indices.push(-1);
                        }
                         ///// Numeric Col Indices
                         if(table_cols[i]["className"] == "numericColsCSS" || table_cols[i]["className"] == "numericColsCSS numCol") {
                            numericCols.push(i)
                        }
                    }
                    var no_of_per_cols = 3;
                    // var finalPerCols = {}

                    for(var i = updateFrom; i < updateFrom + no_of_mes; i++) {
                        ////// =============================== Top-Most Total Update Starts =================================
                        var sum = 0;
                        var rowIDTotal = tbl.rows()[0][0];

                        var d = tbl.column(i).data();
                        for(var j = 1; j < d.length; j++) {

                            var node = tbl.column(i).nodes()[j]["_DT_CellIndex"]["row"]

                            ///// ---------------------- For cell color red or green starts ---------------------------
                            if(!numericCols.includes(i)) {
                                var cell_rid = tbl.column(i).nodes()[j]["_DT_CellIndex"]["row"];
                                var cell_cid = tbl.column(i).nodes()[j]["_DT_CellIndex"]["column"];
                                var cell_node = tbl.cell(cell_rid, cell_cid).node();
                                var flagColor = false, data = undefined;
                                
                                if(isNaN(tbl.cell(cell_rid, cell_cid).data())) {
                                    data = parseFloat(tbl.cell(cell_rid, cell_cid).data());
                                    if(tbl.cell(cell_rid, cell_cid).data().includes("%")) {
                                        data = parseFloat(tbl.cell(cell_rid, cell_cid).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""));
                                    }
                                } else {
                                    data = tbl.cell(cell_rid, cell_cid).data();
                                }

                                if(data < 0) {
                                    flagColor = true;
                                }

                                if(parentID == cell_rid || subsetChildren.includes(cell_rid)) {
                                    if(flagColor) {
                                        cell_node.style.color = "#A92626";
                                    } else {
                                        cell_node.style.color = "#2D7230";
                                    }
                                }
                            }
                            ///// ---------------------- For cell color red or green ends -----------------------------

                            if(!Object.keys(groupRowMapping).includes(j.toString()) && !Object.keys(groupRowMapping).includes(node.toString())){
                                
                                if(isNaN(d[j]) && d[j].includes("%")) {

                                    var value = tbl.cell(rowIDTotal, gbl_finalPerCols_FY[i][0]).data()
                                    var val_minus_act = tbl.cell(rowIDTotal, i - no_of_per_cols).data()

                                    if(isNaN(value)) {
                                        value = parseFloat(tbl.cell(rowIDTotal, gbl_finalPerCols_FY[i][0]).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                    }
                                    if(isNaN(val_minus_act)) {
                                        val_minus_act = parseFloat(tbl.cell(rowIDTotal, i - no_of_per_cols).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                    }

                                    var act1 = value - val_minus_act

                                    if(value == 0 && act1 == 0) {
                                        sum = "-"
                                    } else if(value == 0) {
                                        sum = "-100%"
                                    } else if (act1 == 0) {
                                        sum = "100%";
                                    } else {
                                        sum = (val_minus_act / act1 * 100).toString()+" %"
                                    }
                                } else {
                                    if(!isNaN(parseFloat(d[j].replace(/,{1,}/g,"")))) {
                                        sum += parseFloat(d[j].replace(/,{1,}/g,""))
                                    }
                                }
                            }
                        }
                        // console.log(d,"<<<<",sum)
                        var colorFlag = false;
                        if(!isNaN(sum)){
                            sum = parseFloat(sum).toFixed(no_of_decimalPlaces)
                        } else {
                            sum = parseFloat(sum).toFixed(no_of_decimalPlaces).toString()+"%"
                        }

                        if(sum >= 0 || sum >= "0") {
                            colorFlag = true;
                        }

                        ////// ------------------ Number Formatting Starts --------------------------
                        var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: no_of_decimalPlaces_M});
                        
                        if(DO_FY["Current_Scale"] == "K") {
                            nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: no_of_decimalPlaces_K});
                            if(sum.includes("%")) {
                                sum = parseFloat(sum.split("%")[0]).toFixed(no_of_decimalPlaces_K) + "%"
                            } else {
                                sum = parseFloat(sum).toFixed(no_of_decimalPlaces_K)
                            }
                        }

                        var count = nFormat.format(sum);

                        if(isNaN(sum)) {
                            sum = sum.split("%")[0];
                            count = nFormat.format(sum) + "%";
                        }

                        if(numericCols.includes(i)) {
                            count = nFormat.format(Math.round(parseFloat(count.split(".")[0].toString().replace(/,{1,}/g,"")+"."+count.split(".")[1]))).split(".")[0];
                        }
                        ////// ------------------ Number Formatting Ends ----------------------------

                        var node = tbl.cell(rowIDTotal, i).data(count).node()

                        if(!numericCols.includes(i) && updateFrom != i) {
                            if(colorFlag) {
                                node.style.color = "#2D7230";
                            } else {
                                node.style.color = "#A92626";
                            }
                        }
                    }
                    //// =============================== Top-Most Total Update Ends ====================================
                    ///  -----------------------------------------------------------------------------------------------
                    //// =============================== Subset Group Total Update Starts ==============================

                    var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: no_of_decimalPlaces_M});
                    var count = undefined;

                    if(DO_FY["Current_Scale"] == "K") {
                        nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: no_of_decimalPlaces_K});
                    }

                    ///// -------------------- For Non % Cols Starts ------------------------------
                    for(var k = updateFrom; k < updateFrom + no_of_mes - no_of_per_cols; k++) {

                        var subsetSum = 0;

                        for(var idx = 0; idx < subsetChildren.length; idx++) {
                            var dc = tbl.cell(subsetChildren[idx], k).data();
                            if(!isNaN(dc)) {
                                subsetSum += parseFloat(dc);
                            } else {
                                subsetSum += parseFloat(dc.replace(/,{1,}/g,""));
                            }
                        }
                        
                        count = nFormat.format(subsetSum);

                        if(numericCols.includes(k) && !isNaN(subsetSum)) {
                            count = nFormat.format(parseFloat(count.split(".")[0].toString().replace(/,{1,}/g,"")+"."+count.split(".")[1])).split(".")[0];
                        }

                        if(isNaN(subsetSum)) {
                            count = "-"
                        }

                        tbl.cell(parseInt(parentID), k).data(count)
                    }
                    ///// -------------------- For Non % Cols Ends ------------------------------
                    ///// -------------------- For % Cols Starts --------------------------------
                    for(var k = updateFrom + no_of_mes - no_of_per_cols, idx = updateFrom + 1; k < updateFrom + no_of_mes; k++) {

                        var subsetSum = 0;

                        var value = tbl.cell(parentID, updateFrom).data();
                        var val_minus_act = tbl.cell(parentID, idx).data()

                        if(isNaN(value)) {
                            value = parseFloat(tbl.cell(parentID, updateFrom).data().replace(/,{1,}/g,""))
                        }
                        if(isNaN(val_minus_act)) {
                            val_minus_act = parseFloat(tbl.cell(parentID, idx).data().replace(/,{1,}/g,""))
                        }

                        var act1 = value - val_minus_act

                        if(value == 0 && act1 == 0) {
                            subsetSum = "-"
                        } else if(value == 0) {
                            subsetSum = -100
                        } else if (act1 == 0) {
                            subsetSum = 100;
                        } else {
                            subsetSum = Math.round(parseFloat(val_minus_act / act1 * 100) * 10) / 10;
                        }

                        if(DO_FY["Current_Scale"] == "K") {
                            subsetSum = parseFloat(subsetSum).toFixed(no_of_decimalPlaces_K);
                        }

                        count = nFormat.format(subsetSum);

                        if(subsetSum == "-" || isNaN(subsetSum)) {
                            count = "-"
                        }

                        idx++;

                        var node = tbl.cell(parseInt(parentID), k).data(count.toString()+"%").node()

                        if(count >= 0 || count >= "0") {
                            node.style.color = "#2D7230";
                        } else {
                            node.style.color = "#A92626";
                        }
                    }
                    ///// -------------------- For % Cols Ends ----------------------------------

                    //// =============================== Subset Group Total Update Ends ================================
                   
                }
                
                function updateRow(state, no_of_dimens, no_of_mes, no_of_excludes, identifer, sliceFrom, sliceFromBase) 
                {

                    var selectData = tbl.row('.selected').data()

                    // console.log(tbl.row('.selected').index())
                    // console.log("Selected Row : ", selectData)

                    var ROW_ID = tbl.row('.selected')[0][0];
                    // console.log("UPDATE - ROW -->",selectData)
                    // @---
                    // var row_updated_arr = selectData.slice(0, no_of_dimens - no_of_excludes + no_of_mes + 1)
                    var row_updated_arr = selectData.slice(0, sliceFrom - 2)

                    // console.log("ROW UPDATED INITIALs - ",row_updated_arr)

                    state.getElementsByTagName('option')[state.options.selectedIndex].setAttribute('selected', 'selected')
                    // console.log("State Changed", state)

                    // console.log(state.id,">>>>>>>>>>>>>>>>>>>>.")
                    var selOptID = state.getElementsByTagName('option')[state.options.selectedIndex].id
                    // var selOptVal = JSON.parse(state.getElementsByTagName('option')[state.options.selectedIndex].value)

                    // var selOptVal = fixRowsObj[identifer];
                    var selOptVal = [];

                    if(DO_FY["Current_Scale"] == "K") {
                        selOptVal = fixRowsObj[identifer];
                    } else {
                        selOptVal = fixRowsObj["ScaledData"][identifer];
                    }
                    // var selOptVal = [];
                    // if(fixRowsObj["ScaledData"] == undefined) {
                    //     fixRowsObj["ScaledData"] = {}

                    // }
                    // if(DO_FY["OriginalData"] && DO_FY["Current_Scale"] == "K") {
                    //     selOptVal = DO_FY["OriginalData"][DO_FY["OriginalData"]["KeyMap"][identifer]].slice()
                    // } else 
                    // if(DO_FY["ScaledData"] && DO_FY["Current_Scale"] == "M") {
                    //     selOptVal = DO_FY["ScaledData"][DO_FY["ScaledData"]["KeyMap"][identifer]].slice()
                    // } else {
                    //     selOptVal = fixRowsObj[identifer];
                    // }
                    // var selOptVal = undefined;

                    let sid = state.classList[1].split("row_level_select_")[1];
                    DO_FY["DRP"][tbl.row('.selected').index()][sid] = selOptID;
                    // if(DO_FY["OriginalData"] == undefined || DO_FY["ScaledData"] == undefined) {
                    //     selOptVal = fixRowsObj[identifer];
                    // } else {
                    //     if(DO_FY["Current_Scale"] == "K") {
                    //         selOptVal = DO_FY["OriginalData"][DO_FY["OriginalData"]["KeyMap"][identifer]]
                    //     } else {
                    //         selOptVal = DO_FY["ScaledData"][DO_FY["ScaledData"]["KeyMap"][identifer]]
                    //     }
                    // }

                   

                    // console.log(state)

                    var sliced = selOptVal.slice(sliceFromBase, ), data = {};

                    // ----------------------- Handling base case for WHAT-IF column is updated first --------- 
                    if(is_col_updated && selOptID == 0) {
                        for(var k = 1, mr_k = 0; k <= no_of_mes; k++) {
                            sliced[k] = masterRows[ROW_ID].slice(hMap[0] + 1, (hMap[0] + 1) + no_of_mes)[mr_k];
                            mr_k++;
                        }
                    }
                    // ----------------------------------------------------------------------------------------


                    // console.log("SLICED ---- ", sliced)
                    for(var i = 0, index = 0; i < sliced.length; i++) {
                        data[index] = sliced.slice(i, i + no_of_mes)
                        i += no_of_mes
                        index += 1
                    }
                    // console.log("0000",data, data[selOptID])

                    var len = row_updated_arr.length;
                    row_updated_arr = row_updated_arr.concat(selectData.slice(len, ));
                    // @---
                    // row_updated_arr[no_of_dimens - no_of_excludes + no_of_mes + parseInt(state.id)] = state
                    row_updated_arr[parseInt(state.id)] = state

                    // var sliceLen = no_of_dimens - no_of_excludes + no_of_mes + parseInt(state.id) + 1
                    var sliceLen = parseInt(state.id) + 1
                    
                    var dataCopy  = Array.from(data[selOptID]);
                    // console.log("DATA", dataCopy)
                    for(var i = sliceLen, idx = 0; i < sliceLen + no_of_mes; i++) {
                        row_updated_arr[i] = dataCopy[idx]
                        idx += 1;
                    }

                    // console.log(row_updated_arr)
                    tbl.row('.selected').data(row_updated_arr)

                    var updateFrom = sliceLen;  

                    if(showTotalonRowUpdateFlag) {

                        state.style.backgroundColor="#C4DBEE";
                        state.style.border = "2px solid #0460A9";
                        state.style.color="#2C2C2C";
                        updateTotalOnRowUpdate(updateFrom, no_of_mes, ROW_ID);

                    }

                    // console.log(DO_FY)

                }

                window.updateRow = updateRow

                // var scenarioObj = Object.fromEntries(this._scenarioOrder.slice().map(key => [key, []]));
                // scenarioObj["DropDownFieldName"] = new Set();
                // scenarioObj["DropDownSelected"] = new Set();
                // console.log(scenarioObj)

                for(var i = 0, prev_key = ""; i < this._resultSet.length;) {

                    var key = this._resultSet[i].slice(0, this._dimensions.indexOf(this._dateColName)).join("_#_");
                    
                    if(i==0) {prev_key = key.substring(0, )}

                    var tempKey = key.substring(0, );

                    while(JSON.stringify(key) == JSON.stringify(tempKey)) {

                        if(this._resultSet[i] == undefined) {
                            break;
                        }
                        tempKey = this._resultSet[i].slice(0, this._dimensions.indexOf(this._dateColName)).join("_#_");

                        if(JSON.stringify(key) != JSON.stringify(tempKey)) {
                            break;
                        }

                        var masterKey = tempKey.split("_#_").slice(0, fixedScenarioAt);
                        var scene = this._resultSet[i][fixedScenarioAt];
                        

                        if(masterObj[masterKey.join("_#_")] == undefined) {
                            // masterObj[masterKey.join("_#_")] = structuredClone(scenarioObj);
                            // masterObj[masterKey.join("_#_")] = structuredClone(scenarioObj);
                            masterObj[masterKey.join("_#_")] = {};
                            masterObj[masterKey.join("_#_")]["DropDownFieldName"] =  new Set();
                            masterObj[masterKey.join("_#_")]["DropDownSelected"] = new Set();
                        }

                        if(masterObj[masterKey.join("_#_")][scene] == undefined) {
                            masterObj[masterKey.join("_#_")][scene] = [];
                        }

                        masterObj[masterKey.join("_#_")][scene] = this._resultSet[i].slice(this._dimensions.indexOf(this._dateColName), )
                        masterObj[masterKey.join("_#_")]["DropDownFieldName"].add(this._resultSet[i][this._dimensions.indexOf(this._dateColName)]);

                        if(this._dropdownsSelected.includes(this._resultSet[i][fixedScenarioAt].toUpperCase())) {
                            masterObj[masterKey.join("_#_")]["DropDownSelected"].add(this._resultSet[i][this._dimensions.indexOf(this._dateColName)]);
                        }

                        i += 1;
                    }

                    prev_key = key;
                }

                console.log("---", structuredClone(masterObj))

                // Final Row Assignment
                for(const [k, v] of Object.entries(masterObj)) {
                    // console.log(k)
                    var finalRow = [];
                    
                    // Pushing Dimensions to finalRow.
                    var dim = k.split("_#_");
                    for(var f = 0; f < dim.length; f++) {
                        finalRow.push(dim[f])
                    }

                    // console.log(v);
                    // finalRow.push(Array.from(v["DropDownFieldName"])[0])

                    // Pushing Measures to finalRow

                    for(const v1 in v) {
                        if(v1 != "DropDownFieldName") {
                            var f = false;
                            ///// checking if whole scenario is empty or not ----------------------------------
                            var checkEmpty = true;
                            for(var g = 0; g < this._scenarioOrder.length; g++) {
                                if(masterObj[k][this._scenarioOrder[g]] && masterObj[k][this._scenarioOrder[g]].length > 0) {
                                    checkEmpty = false;
                                }
                            }
                            ///// -----------------------------------------------------------------------------

                            // for(const [km, vm] of Object.entries(masterObj[k][v1])) {
                                
                                if(!checkEmpty) {
                                    if(masterObj[k][v1].length == 0) {
                                        for(var h = 0; h < this._measureOrder.length + 1; h++) {
                                            finalRow.push("-")
                                        }
                                    } else {
                                        if(masterObj[k]["DropDownFieldName"].size > 1) {
                                            for(var h = 0; h < masterObj[k][v1].length; h++) {
                                                if(masterObj[k][v1][h] != undefined) {
                                                    finalRow.push(masterObj[k][v1][h])
                                                } else {
                                                    finalRow.push("-")
                                                }
                                            }
                                        } else {
                                            f = true;
                                            for(var h = 0; h < masterObj[k][v1].length; h++) {
                                                if(masterObj[k][v1][h] != undefined) {
                                                    finalRow.push(masterObj[k][v1][h])
                                                }
                                            }
                                        }
                                    }
                                // }
                                                               
                            }
                        } else {
                            // dropdown data
                        }
                    }

                    ////// If only BASE is present STARTS -----------------------------------------
                    var onlyBaseAvailable = false, sliced = undefined;
                    if(masterObj[k]["DropDownFieldName"].size == 1) {
                        sliced = finalRow.slice(k.split("_#_").length, this._dimensions.length - 1 + this._measureOrder.length);
                        var cnt = 0;
                        for(var i = sliced.length + k.split("_#_").length; i < table_cols.length; i++) {
                            if(cnt >= sliced.length) {
                                cnt = 0;
                            }
                            finalRow[i] = sliced[cnt]
                            cnt++;
                        }
                        onlyBaseAvailable = true;
                        // console.log(sliced, "-------", finalRow);
                    }
                    ////// If only BASE is present ENDS ------------------------------------------
                    var baseRepeatedFlag = false;

                    if(finalRow.length < table_cols.length) {

                        var repeatBase = finalRow.slice(fixedScenarioAt, this._measureOrder.length + fixedScenarioAt + 1);

                        for(var fr = 0, rb = 0; fr < this._measureOrder.length * 3 + (fixedScenarioAt + 1); fr++) {

                            finalRow.push(repeatBase[rb]);

                            rb++;

                            if(rb > repeatBase.length - 1) {
                                rb = 0;
                            }

                        }

                    }

                    var dropdownArr = Array.from(masterObj[k]["DropDownFieldName"]).slice();
                    var master_dropdownArr = new Set();
                    var dropdownSel = Array.from(masterObj[k]["DropDownSelected"]).slice();
                    var caughtDropDownsAt = new Set(),  dropdownIDs = new Set(), cnt = 0;

                    for(var kk = this._measureOrder.length + 3, optIdx = 0; kk < finalRow.length; kk++) {

                        if(cnt < 3) {
                            dropdownIDs.add(kk+"_"+this._dataTableObj.rows().count());
                        }

                        if(onlyBaseAvailable) {
                            var flag_sel = sliced[0];
                            finalRow[kk] = `<select id='${kk}' class='row_level_select row_level_select_${kk}_${this._dataTableObj.rows().count()}' onchange='updateRow(this, ${this._dimensions.length}, ${this._measureOrder.length}, ${this._excludeHeaders.length}, "${finalRow[0]}_#_${finalRow[1]}", ${this._resultSet[0].length}, ${this._dimensions.indexOf(this._dateColName)})'><option selected>${flag_sel}</option></select>`;
                        } else {
                            var select_html = `<select id='${kk}' class='row_level_select row_level_select_${kk}_${this._dataTableObj.rows().count()}' onchange='updateRow(this, ${this._dimensions.length}, ${this._measureOrder.length}, ${this._excludeHeaders.length}, "${finalRow[0]}_#_${finalRow[1]}", ${this._resultSet[0].length}, ${this._dimensions.indexOf(this._dateColName)})'>`;
                            var options = "";
                            for(var i = 0; i < dropdownArr.length; i++) {
                                if(dropdownSel.includes(dropdownArr[i])) {
                                    caughtDropDownsAt.add(i)
                                } else {
                                    master_dropdownArr.add(i)
                                }
                                if(optIdx == i) {
                                    options += `<option class='optionTag' id='${i}' selected>${dropdownArr[i]}</option>`
                                } else {
                                    options += `<option class='optionTag' id='${i}' >${dropdownArr[i]}</option>`
                                }
                            }
                            select_html += options + `</select>`;
                            finalRow[kk] = select_html;
                        }

                        kk += this._measureOrder.length; 
                        cnt++;

                        if(cnt < 3 && kk == finalRow.length - 1) {
                            kk += 1;
                            for(cnt; cnt < 3; cnt++) {
                                dropdownIDs.add(kk+"_"+this._dataTableObj.rows().count());
                                var select_html = `<select id='${kk}' class='row_level_select row_level_select_${kk}_${this._dataTableObj.rows().count()}' onchange='updateRow(this, ${this._dimensions.length}, ${this._measureOrder.length}, ${this._excludeHeaders.length}, "${finalRow[0]}_#_${finalRow[1]}", ${this._resultSet[0].length}, ${this._dimensions.indexOf(this._dateColName)})'>`;
                                var options = "";
                                for(var i = 0; i < dropdownArr.length; i++) {
                                    if(dropdownSel.includes(dropdownArr[i])) {
                                        caughtDropDownsAt.add(i)
                                    } else {
                                        master_dropdownArr.add(i)
                                    }
                                    if(optIdx == i) {
                                        options += `<option class='optionTag' id='${i}' selected>${dropdownArr[i]}</option>`
                                    } else {
                                        options += `<option class='optionTag' id='${i}' >${dropdownArr[i]}</option>`
                                    }
                                }
                                select_html += options + `</select>`;
                                finalRow[kk] = select_html;
                                kk += this._measureOrder.length + 1; 
                            }
                        }

                    }


                    // console.log(finalRow)
                    finalRow = finalRow.slice(0, table_cols.length);

                    /////// creating scaled data copy starts ------------------------ 
                    var K_DataFY = finalRow.slice();
                    var M_DataFY = finalRow.slice();
                    var numCols_FY = this._dataTableObj.columns('.numericColsCSS')[0];
                    var vsPyCols_FY = this._dataTableObj.columns('.vsPy')[0];
                    var perCols_FY = this._dataTableObj.columns('.perCols')[0];

                    var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: this.no_of_decimalPlaces_M});
                    var nFormat_K = new Intl.NumberFormat('en-US', {minimumFractionDigits: this.no_of_decimalPlaces_K});


                    for(var ss = 0; ss < M_DataFY.length; ss++) {
                        if(numCols_FY.includes(ss) || vsPyCols_FY.includes(ss)) {
                            //////////
                            if(!isNaN(parseFloat(M_DataFY[ss].toString()))) {
                                if(M_DataFY[ss].toString().includes(".")) {
                                    M_DataFY[ss] = nFormat.format(parseFloat(M_DataFY[ss].toString().replace(/,{1,}/g,"") / 1000).toFixed(this.no_of_decimalPlaces_M))
                                }
                            }

                            /////////
                            if(!isNaN(parseFloat(K_DataFY[ss].toString()))) {
                                if(K_DataFY[ss].toString().includes(".")) {
                                    K_DataFY[ss] = nFormat_K.format(parseFloat(K_DataFY[ss].toString().replace(/,{1,}/g,"")).toFixed(this.no_of_decimalPlaces_K))
                                }
                            }
                        }
                        else if(perCols_FY.includes(ss)) {
                            /////////
                            if(!isNaN(parseFloat(M_DataFY[ss].toString().split("%")[0]).toFixed(0))) {
                                M_DataFY[ss] = nFormat.format(parseFloat(M_DataFY[ss].toString().split("%")[0]).toFixed(this.no_of_decimalPlaces_M)).toString()+"%";
                            }

                            ////////
                            if(!isNaN(parseFloat(K_DataFY[ss].toString().split("%")[0]).toFixed(0))) {
                                K_DataFY[ss] = nFormat_K.format(parseFloat(K_DataFY[ss].toString().split("%")[0]).toFixed(this.no_of_decimalPlaces_K)).toString()+"%";
                            }
                        }
                    }
                    finalRow = K_DataFY.slice()
                    fixRowsObj[k] = finalRow.slice()

                    if(fixRowsObj["ScaledData"] == undefined) {
                        fixRowsObj["ScaledData"] = {}
                    }

                    fixRowsObj["ScaledData"][k] = M_DataFY.slice()
                    /////// creating scaled data copy ends ------------------------ 


                    ////// ================================ Group by Row Starts =========================================
                    if(!Array.from(groupBy).includes(finalRow[0])) {
                        groupBy.add(finalRow[0])
                        templateGroupTotal[1] = finalRow[0]
                        var node = tbl.row.add(templateGroupTotal.slice()).draw(false).node()
                        node.classList.add("group")
                    }
                    ////// ================================ Group by Row Ends ============================================

                    tbl.row.add(finalRow).draw();
                    var rid = tbl.rows().indexes().toArray()[tbl.rows().indexes().toArray().length - 1];

                    if(!onlyBaseAvailable) {

                        var cga = Array.from(caughtDropDownsAt);
                        master_dropdownArr = Array.from(master_dropdownArr).slice(1, );

                        if(master_dropdownArr.length < 3) {
                            for(var md = master_dropdownArr.length; md < 3; md++) {
                                master_dropdownArr.push(0);
                            }
                        }

                        if(cga.length < 3) {
                            for(var b = 0; b < master_dropdownArr.length; b++) {
                                if(cga.length >= 3) {
                                    break;
                                }
                                cga.push(master_dropdownArr[b]);
                            }
                        }

                        var drp = Array.from(dropdownIDs);

                        if(DO_FY["DRP"] == undefined) {
                            DO_FY["DRP"] = {}
                        }

                        if(DO_FY["DRP"][rid] == undefined) {
                            DO_FY["DRP"][rid] = {}
                        }

                        DO_FY["DRP"][rid][drp[0]] = cga[0];
                        DO_FY["DRP"][rid][drp[1]] = cga[1];
                        DO_FY["DRP"][rid][drp[2]] = cga[2];

                        this.setSelectorsSelectedValue(dropdownIDs, cga, "FY");
                    }

                }

                this.applyStyling_FY();

                if (this._tableCSS) {
                    // console.log(this._tableCSS)
                    this._table.style.cssText = this._tableCSS
                }

                if (this._rowCSS) {
                    console.log(this._rowCSS)
                    document
                        .querySelector(this._widgetID+'v1-custom-table')
                        .shadowRoot.querySelectorAll('td')
                        .forEach(el => (el.style.cssText = this._rowCSS))
                    document
                        .querySelector(this._widgetID+'v1-custom-table')
                        .shadowRoot.querySelectorAll('th')
                        .forEach(el => (el.style.cssText = this._rowCSS))
                }

                if (this._colCSS) {
                    console.log(this._colCSS)
                    document
                        .querySelector(this._widgetID+'v1-custom-table')
                        .shadowRoot.querySelector('style').innerText += this._colCSS
                }

                const list = document.querySelector(this._widgetID+"v1-custom-table").shadowRoot.querySelector("#example > thead");

                for(var i = 0; i < list.children.length - 1; i++) {
                    list.removeChild(list.children[i]);
                }


                // this._dotsLoader.style.visibility = "hidden";
                this._table.style.visibility = "visible";
                this._root.style.display = "block";

                showTotalonRowUpdateFlag = true;
                document.querySelector(this._widgetID+"v1-custom-table").shadowRoot.querySelector("#example > thead").insertAdjacentHTML('afterBegin', topHeader);
                this.showTotal("FY");
                this.applyScaling_FY("K")
                if(this._currentScaling == "M") {
                    DO_FY["Current_Scale"] = "M";
                    this.applyScaling_FY("M")
                }
                // this.createDataObjects("FY", false);

                // Styling Block Ends here
            }

            // ==========================================================================================================================
            // ---------------------------------------------------------- QUARTER -------------------------------------------------------
            // ==========================================================================================================================
            setResultSet_QT(rs, col_to_row = -1, colspan_to_top_headers, currentScale) {

                var start = performance.now();

                // this._dotsLoader.style.visibility = "visible";
                if(this._table) {
                    this._table.remove();
                    this._root.innerHTML = `
                     <table id="example" class="table" style="visibility:hidden;">
                        <thead>
                        </thead>
                        <tbody></tbody>
                    </table>    
                    `
                    this._table = this._shadowRoot.getElementById('example')
                    // console.log( document.querySelector("#"+this["parentNode"].id+" > v1-custom-table").shadowRoot.querySelector("#example > colgroup:nth-child(2)"))
                    // document.querySelector(this._widgetID+"v1-custom-table").shadowRoot.querySelector("#example > colgroup:nth-child(2)").remove();
                }

                // this._table.style.visibility = "hidden";
                // this._root.style.display = "inline-grid";

                this._resultSet = [];
                // this._selectionColumnsCount = selCnt
                this._col_to_row = col_to_row // Row Grouping

                var headers = this._headers;
                // console.log("-----",headers)
                var remove = headers["Exclude"].join(",")+",@MeasureDimension".split(",");

                this._dimensions = Array.from(new Set(Object.keys(rs[0]).filter((k) => !remove.includes(k))))
                this._measures = new Set()

                this._colOrder = headers["COL_NAME_ORDER"];
                this._scenarioOrder = headers["SCENARIO_ORDER"];
                this._fixedScenario = headers["FIXED_SCENARIO"];
                this._measureOrder = headers["@MeasureDimension"]
                this._excludeHeaders = headers['Exclude']
                // this._dateColName = selColumnName; //selectionColumn
                // this._hideExtraVisibleColumnFromIndex = hideExtraVisibleColumnFromIndex;
                // this._hide_Individual_ExtraVisibleColumnOfIndices = hide_Individual_ExtraVisibleColumnOfIndices;
                this._colspan_EmptyCase = parseInt(colspan_to_top_headers["EmptyCase"]);
                this._colspan_BaseCase = parseInt(colspan_to_top_headers["BaseCase"]);
                this._colspan_RestCase = parseInt(colspan_to_top_headers["RestCase"]);

                // this._customHeaderNames = customHeaderNames;
                // this._customTopHeader = this._customHeaderNames["TOP_HEADER"];

                console.log("Col-Orders",this._colOrder)
                console.log("Scenario-Orders",this._scenarioOrder)
                console.log("Fixed Scenarios",this._fixedScenario)
                console.log("Measure Order", this._measureOrder)
                console.log("Dimensions", this._dimensions)
                console.log("Exclude Headers",this._excludeHeaders)

                this._currentScaling = currentScale;

                for(var i = 0; i < rs.length;) {
                    var tempArr = [], dims = new Set();
                    for(var k = 0; k < this._dimensions.length; k++) {
                        dims.add(rs[i][this._dimensions[k]].description);
                    }
                    
                    dims.add(rs[i]["COL_NAME"].description);
                    
                    for(var j = 0; j < this._measureOrder.length; j++) {
                        if(JSON.stringify(this._measureOrder[j]) == JSON.stringify(rs[i]["@MeasureDimension"].description) && rs[i]["@MeasureDimension"].formattedValue != undefined) {
                            // tempArr.push(rs[i]["@MeasureDimension"].formattedValue)
                            var v = rs[i]["@MeasureDimension"].formattedValue;
                            if(v.includes("+")) {
                                v = v.split("+")[1];
                            }
                            tempArr.push(v)
                        } else {
                            while(JSON.stringify(this._measureOrder[j]) != JSON.stringify(rs[i]["@MeasureDimension"].description)) {
                                tempArr.push("-")
                                j+=1;
                                if(j > this._measureOrder.length) {
                                    console.log("Hit to Infinite Loop Case...")
                                    return;
                                }
                            }
                            if(JSON.stringify(this._measureOrder[j]) == JSON.stringify(rs[i]["@MeasureDimension"].description) && rs[i]["@MeasureDimension"].formattedValue != undefined) {
                                // tempArr.push(rs[i]["@MeasureDimension"].formattedValue)
                                var v = rs[i]["@MeasureDimension"].formattedValue;
                                if(v.includes("+")) {
                                    v = v.split("+")[1];
                                }
                                tempArr.push(v)
                            }
                        }
                        i++;
                        if(i >= rs.length || tempArr.length > this._measureOrder.length) {
                            break;
                        }
                    }
                    if(i > rs.length) {
                        break;
                    }
                    tempArr.unshift(...Array.from(dims))
                    // console.log(tempArr)
                    this._resultSet.push(tempArr)
                    // console.log(tempArr)
                }

                console.log("-- Result Set --")
                console.log(this._resultSet)
                console.log("----------------")

                // widget_ID_Name[this["widgetName"]] = this["offsetParent"].id;
                // console.log("Mapped Widgets : ",widget_ID_Name);
                var end = performance.now();
                var time = end - start;
                console.log("setResultSet_QT took approx : "+(Math.round(time/1000, 2)).toString()+"s to load...")

                var start = performance.now();

                this.render_QT();

                var end = performance.now();
                var time = end - start;
                console.log("Render_QT took approx : "+(Math.round(time/1000, 2)).toString()+"s to load...")
            }

            applyStyling_QT() {

                document.querySelector(this._widgetID+"v1-custom-table").shadowRoot.querySelector("style").innerText += `
                tbody, td, tfoot, th, thead, tr {
                    border-color: inherit;
                    border-style: none;
                    border-width: 0;
                }
    
                /* ------------------------- CUSTOM STYLING --------------------------------- */
                /*
                #example > tbody > tr:nth-child(2) > td.truncate {
                    font-weight:bold;
                }
    
                */
                #example select {
                    padding-top:0%;
                    background-color:#DCE6EF;
                    outline:none;
                }
    
                option {
                    background-color:white;
                    border-bottom:1px solid #CBCBCB;
                    color:black;
                }
                
                select:focus>option:checked {
                    background:#0460A9;
                    color:white;
                    /* selected */
                }
    
                #example th {
                    text-wrap: nowrap;
                    border-bottom: 1px solid #CBCBCB;
                    background-color:#F2F2F2;
                    align-content: center;
                    font-family: Arial;
                    color:black;
                    font-size:14px;
                }
    
                /*
                #example > tbody > tr:nth-child(2) {
                    font-weight:bold;
                }
    */
                /* ------------------------- TOP MOST - HEADER ROW ------------------------- */
    
                #example .top-header {
                    height:32px;
                    max-height:32px;
                    font-family: Arial;
                    color:black;
                    font-size:14px;
                    font-weight:bold;
                    text-align: center;
                    padding-top:0%!important;
                    padding-bottom:0%!important;
                }
    
                #example > thead > tr:nth-child(1) > th:nth-child(1) {
                    background-color:#F2F2F2!important;
                }
    
                /* ------------------------- BASE CASE ------------------------- */
    
                #example > thead > tr:nth-child(1) > th:nth-child(2n) {
                    background-color:#E0E0E0;
                }
    
                /* ------------------------- REST CASE ------------------------- */
    
                #example > thead > tr:nth-child(1) > th:nth-child(2n+1) {
                    background-color:#BDBDBD;
                }
    
                /* ------------------------- 2nd MOST HEADER ------------------------- */
                
                #example > thead > tr:nth-child(2) {
                    height:48px; 
                }
    
                /* ------------------------- SCENARIO SELECT ELEMENTS HEADER ------------------------- */
    
                .scenarios {
                    background-color:inherit;
                    font-family: Arial;
                    color:black;
                    font-size:14px;
                    text-align:center;
                    font-weight:bold;
                    height:30px;
                    border:none;
                    cursor: pointer;
                }
    
                /* ------------------------- GROUPED ROW ------------------------- */
    
                #example .group > td {
                    height:32px;
                    padding: 0px 10px!important;
                    align-content: center;
                    font-weight:bold;
                    color: #212121;
                    font-family: Arial;
                    background-color:#E0E0E0!important;
                }
    
                /* ------------------------- NORMAL ROW ------------------------- */
    
                #example td {
                    text-wrap:nowrap;
                    background-color:white;
                    height:48px;
                    border-bottom:1px solid #CBCBCB!important;
                    font-family: Arial;
                    font-size:14px;
                    align-content: center;
                }
    
                #example .numericColsCSS, #example .vsPy, #example .perCols {
                    text-align:right!important;
                }
    
                #example .numericColsCSS {
                    color:#212121!important;
                }

                /* ------------------------- ROW LEVEL SELECT ------------------------- */
    
                #example .row_level_select {
                    font-family: Arial;
                    font-size: 14px;
                    height: 30px;
                    background-color: #DCE6EF;
                    border-radius:4px;
                    border:none;
                    outline:none;
                    cursor: pointer;
                }
     
                /* ------------------------- TRUNCATE ROW LEVEL DATA ------------------------- */
    
                #example .truncate {
                    max-width:50%;
                    padding-left: 2%;
                    white-space: nowrap;
                    overflow: hidden;
                    /* text-overflow: ellipsis; */
                }
    
                /* ------------------------- TOP FIXED HEADER SCROLL ------------------------- */
    
                #example > thead {
                    position: sticky;
                    top:0%!important;
                    border-bottom: 1px solid #CBCBCB;
                    background-color: yellow;
                }
    
                #example {
                    border-collapse: separate;
                    width:100%!important;
                }
    
                .mt-2 {
                    margin-top: 0% !important;
                }
    
                #example > thead > tr:nth-child(2) > th.truncate.dt-orderable-none.dt-type-numeric {
                    text-overflow:unset!important;
                }
    
                /* ------------------------- REMOVE TOP MOST PADDING ------------------------- */
    
                #example_wrapper > div.dt-layout-row.dt-layout-table > div {
                    padding:0%!important;
                }

                /* ------------------------- TOTAL TOP-MOST ROW ------------------------------ */

                #example > tbody > tr:nth-child(1) {
                    font-weight:bold;
                }
    
                /* --------------------------- FREEZE 1ST COLUMN ---------------------------- */

                #example > thead > tr:nth-child(2) > th.truncate.dt-orderable-none, #example > thead > tr:nth-child(1) > th:nth-child(1),
                #example > tbody > tr:nth-child(2) > td.truncate, #example > tbody > tr > td.truncate
                {
                    position:sticky;
                    left:0px;
                }

                td.truncate, #example > tbody > tr > td:not(.truncate) {
                    mix-blend-mode: hue;
                    scroll-behavior: smooth;
                }

                #example > tbody > tr:nth-child(1) {
                    position:sticky!important;
                    top:80px!important;
                }

                `;
            }

            async render_QT() {
                
                if (!this._resultSet) {
                    return
                }

                DO_QT = {};

                this._widgetID = "#"+this["parentNode"].id+" > ";
                this._stateShown = "vsPy";
                this._visibleCols = [];
                // var start = performance.now();
                // if (!isLibAvail) {
                //     await getScriptPromisify(
                //         'https://cdn.datatables.net/2.0.1/js/dataTables.js'
                //     )
                //     await getScriptPromisify(
                //         'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/js/bootstrap.bundle.min.js'
                //     )
                //     await getScriptPromisify(
                //         'https://cdn.datatables.net/2.0.1/js/dataTables.bootstrap5.js'
                //     )
                //     await getScriptPromisify(
                //         'https://cdn.datatables.net/buttons/3.0.0/js/dataTables.buttons.js'
                //     )
                //     await getScriptPromisify(
                //         'https://cdn.datatables.net/buttons/3.0.0/js/buttons.bootstrap5.js'
                //     )
                //     isLibAvail = true
                // }
                // var end = performance.now();
                // var time = end - start;
                // console.log("Library took approx : "+(Math.round(time/1000, 2)).toString()+"s to load...")

                // await getScriptPromisify('https://cdn.datatables.net/buttons/3.0.0/js/buttons.colVis.min.js')

                var table_cols = []

                var col_dimension = this._dimensions;
                var col_measures = this._measureOrder;
                var fixedScenarioAt = col_dimension.indexOf("SCENARIO_NAME")
                console.log("Fixed Scenario At : ", fixedScenarioAt);

                console.log('ResultSet Success')

                col_dimension = col_dimension.slice(0, col_dimension.indexOf("SCENARIO_NAME"))

                var classname_col = "numericColsCSS";
               
                if(Object.keys(this._customHeaderNames).length > 0) {


                    for (var i = 0; i < this._customHeaderNames["DIMEN_NAME"].length; i++) {
                        table_cols.push({
                            title: this._customHeaderNames["DIMEN_NAME"][i]
                        })
                    }
        
                    for(var k = 0; k < this._customHeaderNames["MES_NAME"].length; k++) {
                        if(k == this._customHeaderNames["MES_NAME"].length - 1) {
                            classname_col = "perCols";
                        } else if(k == this._customHeaderNames["MES_NAME"].length - 2) {
                            classname_col = "vsPy";
                        } else {
                            classname_col = "numericColsCSS";
                        }
                        for(var j = 0; j < this._colOrder.length; j++) {
                            table_cols.push({
                                title: this._colOrder[j],
                                className:classname_col
                            })
                        }
                    }

                    for(var i = this._fixedScenario.length; i < this._scenarioOrder.length; i++) {
                        if(this._scenarioOrder[i].includes(this._fixedScenario)) {
                            table_cols.push({
                                title: this._customHeaderNames["SCENARIO_NAME"][i],
                                className:"selColClass"
                            })
                        }
                        for(var k = 0; k < this._measureOrder.length; k++) {
                            if(k == this._measureOrder.length - 1) {
                                classname_col = "perCols";
                            } else if(k == this._measureOrder.length - 2) {
                                classname_col = "vsPy";
                            } else {
                                classname_col = "numericColsCSS";
                            }
                            for(var j = 0; j < this._colOrder.length; j++) {
                                table_cols.push({
                                    title: this._colOrder[j],
                                    className:classname_col
                                })
                            }
                        }
                    }
                }
                else {
                    for (var i = 0; i < col_dimension.length; i++) {
                        table_cols.push({
                            title: col_dimension[i]
                        })
                    }

                    table_cols.push({
                        title: this._dateColName,
                        className:"selColClass"
                    })
        
                    for(var k = 0; k < this._measureOrder.length; k++) {
                        if(k == this._measureOrder.length - 1) {
                            classname_col = "perCols";
                        } else if(k == this._measureOrder.length - 2) {
                            classname_col = "vsPy";
                        } else {
                            classname_col = "numericColsCSS";
                        }
                        for(var j = 0; j < this._colOrder.length; j++) {
                            table_cols.push({
                                title: this._colOrder[j],
                                className:classname_col
                            })
                        }
                    }
                    
                    for(var i = this._fixedScenario.length; i < this._scenarioOrder.length; i++) {
                        if(this._scenarioOrder[i].includes(this._fixedScenario)) {
                            table_cols.push({
                                title: this._scenarioOrder[i],
                            })
                        }
                        for(var k = 0; k < this._measureOrder.length; k++) {
                            if(k == this._measureOrder.length - 1) {
                                classname_col = "perCols";
                            }  else if(k == this._measureOrder.length - 2) {
                                classname_col = "vsPy";
                            } else {
                                classname_col = "numericColsCSS";
                            }
                            for(var j = 0; j < this._colOrder.length; j++) {
                                table_cols.push({
                                    title: this._colOrder[j],
                                    className:classname_col
                                })
                            }
                        }
                    }
                }
               
                // TRIM LOGIC
                // table_cols = table_cols.slice(0, this._dimensions.length - this._excludeHeaders.length + ((this._measureOrder.length + 1) * 3))
                console.log('Data Table Columns : ', table_cols)
                this._tableColumnNames = table_cols;

                //// ------------------------ var cols indices starts ---------------------------------
                var perColIndices = new Set();
                var considerCons = ["perCols", "vsPy"];
                for(var i = 0; i < this._tableColumnNames.length; i++) {
                    if(considerCons.includes(this._tableColumnNames[i]["className"])) {
                        perColIndices.add(i);
                    }
                }
                //// ------------------------ var cols indices ends -----------------------------------

                //// ------------------------ Show Totals on Row Block Starts ---------------------------------
                // var indices = [];
                this._fixedIndices = this._fixedIndices.concat(this._dropdownIndices);
                var numCols_render = [];
                // var perColsFY_render = [];
                var templateGroupTotal = ["Total"];
                // var templateGroupTotal = `<tr class="clTotalRow"><td>Total</td>`;
                // var templateGroupTotal = "";

                for(var i = 0; i < this._tableColumnNames.length; i++) {
                    if(this._dropdownIndices.includes(i)) {
                        indices_QT.push(-1);
                    } 
                    else if (!this._fixedIndices.includes(i)) {
                        indices_QT.push(i);
                    }
                    if(this._tableColumnNames[i].className == "numericColsCSS") {
                        templateGroupTotal.push("");
                        numCols_render.push(i)
                    } else {
                        templateGroupTotal.push("");
                    }

                    // if(this._tableColumnNames[i].title == "FY" && this._tableColumnNames[i].className != "perCols") {
                    //     fyCols_render.push(i);
                    // }
                    // else if(this._tableColumnNames[i].title == "FY" && this._tableColumnNames[i].className == "perCols") {
                    //     perColsFY_render.push(i);
                    // }
                    // ////// -------------- For subset group total on rowgroup level starts --------------------
                    // if(i > 0) {
                    //     // templateGroupTotal += '<td class="numericColsCSS">'+i+'</td>';
                    //     if(this._customHeaderNames["SCENARIO_NAME"].includes(this._tableColumnNames[i].title) || this._tableColumnNames[i].title == this._dateColName) {
                    //         templateGroupTotal.push("");
                    //     } else {
                    //         // console.log(this._tableColumnNames[i].title)
                    //         templateGroupTotal.push(0);
                    //     }
                    // }
                    ////// -------------- For subset group total on rowgroup level Ends ----------------------
                }
                // templateGroupTotal[0] = "Total"
                // templateGroupTotal += `</tr>`;
                
                // console.log($(templateGroupTotal));

                this._indices = indices_QT;


                // --------------- Hide Columns STARTS ---------------
                var hideCols = []

                // @--------------- CHANGED UNCOMMENT THIS... ----------------------------------

                // for(var i = 19; i < table_cols.length; i++) {

                for(var i = this._hideExtraVisibleColumnFromIndex; i < table_cols.length; i++) {
                    hideCols.push(i)
                }

                for(var i = 0; i < this._hide_Individual_ExtraVisibleColumnOfIndices.length; i++) {
                    hideCols.push(this._hide_Individual_ExtraVisibleColumnOfIndices[i])
                }

                // --------------- Hide Columns ENDS ---------------

                // console.log('Data Table Columns : ', table_cols)

                var groupColumn = this._col_to_row

                var tbl = undefined
                var groupBy = new Set();

                if (!jQuery().dataTable) {
                    console.log("-------- Datatable not initialized. \nRe-Initialzing Datatable libraries ...  ");
                    await this.loadLibraries();
                }

                if (groupColumn != -1) {

                    hideCols.push(groupColumn);
                    // hideCols.push(2);

                    // var nullArr = table_cols.slice()
                    // nullArr.fill(null)
                    // nullArr.pop()
                    // console.log(nullArr)

                    this._dataTableObj = new DataTable(this._table, {
                        layout: {
                        },
                        // fixedColumns: {
                        //     start: 12
                        // },
                        // scrollCollapse: true,
                        // scrollX: true,
                        columns: table_cols,
                        // bAutoWidth: true, 
                        columnDefs: [
                            {
                                defaultContent: '-',
                                // targets: hideCols, //_all
                                // targets: groupColumn,
                                targets : hideCols,
                                visible: false,
                                // className: 'dt-body-left'
                            },
                            { 
                                targets:1, className:"truncate"
                            },
                            {
                                targets:numCols_render,
                                render: function (data, type) {
                                    var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: 0});
                                    if(!isNaN(parseFloat(data.replace(/,{1,}/g,"")))) {
                                        return nFormat.format(parseFloat(data.replace(/,{1,}/g,"")).toFixed(0))
                                    }
                                    return data
                                }
                            },
                            // {
                            //     targets:perColsFY_render,
                            //     render: function (data, type) {
                            //         return data.split(".")[0].toString()+"%"
                            //     }
                            // },
                            {
                                "targets": Array.from(perColIndices),
                                "createdCell": function (td, cellData, rowData, row, col) {
                                    if (cellData >= 0 || cellData >= "0") {
                                        $(td).css('color', '#2D7230')
                                    }
                                    else if (cellData < 0 || cellData < "0") {
                                        $(td).css('color', '#A92626')
                                    }
                                }
                            },
                        ],
                         createdRow: function(row){
                            var td = $(row).find(".truncate");
                            td["prevObject"]["context"]["children"][0].title = td["prevObject"]["context"]["cells"][0]["innerText"];
                        },
                        order: [[groupColumn, 'asc']],
                        displayLength: 25,
                        drawCallback: function (settings) {
                            var api = this.api()
                            var rows = api.rows({ page: 'current' }).nodes()
                            var last = null

                            // api
                            //     .column(groupColumn, { page: 'current' })
                            //     .data()
                            //     .each(function (group, i) {
                            //         if (last !== group) {
                            //             $(rows)
                            //                 .eq(i)
                            //                 .before(
                            //                     '<tr class="group"><td colspan="' +
                            //                     table_cols.length +
                            //                     '">' +
                            //                     group +
                            //                     '</td></tr>'
                            //                 )
                            //             last = group
                            //         }
                            //     })
                        },
                        bPaginate: false,
                        searching: false,
                        ordering: false,
                        processing: true,
                        // serverSide: true,
                        info: false,     // Showing 1 of N Entries...
                        bDestroy: true,
                    })
                } else {
                    this._dataTableObj = new DataTable(this._table, {
                        layout: {
                          
                        },
                        columns: table_cols,
                        bAutoWidth: true, 
                        columnDefs: [
                            {
                                defaultContent: '-',
                                targets: hideCols, //_all
                                visible:false
                                // className: 'dt-body-left'
                            }
                        ],
                        // fixedColumns: {
                        //     start: 2
                        // },
                        // scrollCollapse: true,
                        // scrollX: true,
                        bPaginate: false,
                        // bProcessing: true,
                        // bServerSide: true,
                        processing: true,
                        // serverSide: true,
                        searching: false,
                        ordering: false,
                        info: false,     // Showing 1 of N Entries...
                        bDestroy: true
                    })
                }

                tbl =  this._dataTableObj;

                if(tbl.data().any()) {
                    tbl.rows().remove().draw();
                }

                // this._dataTableObj = tbl;

                ////// -------------------------- Show Total Row ------------------------
                var showTotalRow = templateGroupTotal.slice();
                showTotalRow[0], showTotalRow[1] = "Total", "Total"
                var showTotalonRowUpdateFlag = false;
                tbl.row.add(showTotalRow).draw(false)
                /////  ------------------------------------------------------------------

//  ------------------------------ TO BE UNCOMMENTED ----------------------
                // Top Most Header Block Starts
                var topHeaderData = [];
                var tempMes = this._measureOrder.slice(1, );

                for(var i = 0; i < this._scenarioOrder.length; i++) {
                    topHeaderData.push(this._scenarioOrder[i]);
                    for(var j = 0; j < tempMes.length; j++) {
                        topHeaderData.push(tempMes[j]);
                    }
                }

                console.log("Top Header Data : \n",topHeaderData)

                var topHeader = "<tr role='row'>";
                
                // 1st empty top header blocks...
                // if(groupColumn != -1) {
                //     topHeader += `<th class='top-header' colspan='${this._colspan_EmptyCase}'></th>`;
                // } else {
                    // topHeader += `<th class='top-header' colspan='${this._colspan_EmptyCase}'></th>`;
                // }
                topHeader += `<th class='top-header' colspan='${this._colspan_EmptyCase}'></th>`;


                if(this._customTopHeader) {
                    for(var i = 0; i < this._customTopHeader.length; i++) { //-4 to neglect last two scenarios to be included as top-most header...
                        // Base Case/Scenario
                        if(i%2==0) {
                            topHeader += `<th class='top-header baseCase' colspan='${this._colspan_BaseCase}'>${this._customTopHeader[i]}</th>`
                        } else {
                            // Rest Case/Scenario
                            topHeader += `<th class='top-header restCase' colspan='${this._colspan_RestCase}'>${this._customTopHeader[i]}</th>`;
                        }
                    }
                } else {
                    for(var i = 0; i < topHeaderData.length - 4; i++) { //-4 to neglect last two scenarios to be included as top-most header...
                        // Base Case/Scenario
                        if(this._scenarioOrder.includes(topHeaderData[i])) {
                            topHeader += `<th class='top-header baseCase' colspan='${this._colspan_BaseCase}'>${topHeaderData[i]}</th>`
                        } else {
                            // Rest Case/Scenario
                            topHeader += `<th class='top-header restCase' colspan='${this._colspan_RestCase}'>${topHeaderData[i]}</th>`;
                        }
                    }
                }
               
                
                topHeader += "</tr>";

                // @--- uncomment below line
                // document.querySelector("v1-custom-table").shadowRoot.querySelector("#example > thead").insertAdjacentHTML('afterBegin', topHeader);
                if(document.querySelector(this._widgetID+"v1-custom-table").shadowRoot.querySelector("#example > thead").children.length <= 1 && !tbl.data().any()) { // 5 since Empty : 1 + Base : 1 + Rest Scenario : 3
                    // document.querySelector(this._widgetID+"v1-custom-table").shadowRoot.querySelector("#example > thead").insertAdjacentHTML('afterBegin', topHeader);
                }
//  ------------------------------ TO BE UNCOMMENTED ----------------------

                // console.log(topHeader)
               
                // Top Most Header Block Ends

                tbl.on('click', 'tbody tr', e => {

                    let classList = e.currentTarget.classList
                    tbl
                        .rows()
                        .nodes()
                        .each(row => row.classList.remove('selected'))

                    if(classList.length != 1) {

                        classList.add('selected');

                        if(DO_QT["DRP_USR_TRIGGERED"] == undefined) {
                            DO_QT["DRP_USR_TRIGGERED"] = {}
                        }
    
                        if(DO_QT["DRP_USR_TRIGGERED"][tbl.row('.selected').index()] == undefined) {
                            DO_QT["DRP_USR_TRIGGERED"][tbl.row('.selected').index()] = {}
                        }
                        
                    }

                    // console.log(typeof(e.target.classList), Object.keys(e.target.classList), e)
                    if(e.target.classList && e.target.classList[0] == "row_level_select") {
                        var sid = e.target.classList[1].split("row_level_select_")[1];
                        DO_QT["DRP_USR_TRIGGERED"][tbl.row('.selected').index()][sid] = 1;
                    }

                })

                
                // Master Reference Node For Selection Elements used Inside updateRow(), updateColumns() Method
                // fixRowsObj = {};
                var masterObj = {};
                // const masterRows = [];
                var hMap = {};
                var is_col_updated = false;

                function updateTotalOnRowUpdate(updateFrom, changeLength, updateFromRowID) {
                    
                    ///// ----------------------- For Subset Group Total
                    var parentID = undefined;
                    for(var [k, v] of Object.entries(groupRowMapping_QT)) {
                        if(v.includes(updateFromRowID)) {
                            parentID = k;
                            break;
                        }
                    }
                    var subsetChildren = groupRowMapping_QT[parentID].slice(1, );
                    /// ----------------------- For Subset Group Total Ends --------------------------- 


                    var indices = [];
                    var numericCols = [];
                    var fyCols = [];
                    let considerConditions = ["numericColsCSS", "perCols"];

                    for(var i = 0; i < table_cols.length; i++) {
                        if(considerConditions.includes(table_cols[i]["className"])) {
                            indices.push(i);
                        } else {
                            indices.push(-1);
                        }
                        ///// Numeric Col Indices
                        if(table_cols[i]["className"] == "numericColsCSS" || table_cols[i]["className"] == "numericColsCSS numCol") {
                            numericCols.push(i)
                        }

                        if(table_cols[i]["sTitle"] == "FY") {
                            fyCols.push(i)
                        }
                    }
                    var no_of_per_cols = 5;

                    for(var i = updateFrom; i < updateFrom + changeLength; i++) {
                        ////// =============================== Top-Most Total Update Starts =================================
                        var sum = 0;
                        var d = tbl.column(i).data();
                        for(var j = 1; j < d.length; j++) {

                            var node = tbl.column(i).nodes()[j]["_DT_CellIndex"]["row"]

                            ///// ---------------------- For cell color red or green starts ---------------------------
                            if(!numericCols.includes(i)) {
                                var cell_rid = tbl.column(i).nodes()[j]["_DT_CellIndex"]["row"];
                                var cell_cid = tbl.column(i).nodes()[j]["_DT_CellIndex"]["column"];
                                var cell_node = tbl.cell(cell_rid, cell_cid).node();
                                var flagColor = false, data = undefined;
                                
                                if(isNaN(tbl.cell(cell_rid, cell_cid).data())) {
                                    data = parseFloat(tbl.cell(cell_rid, cell_cid).data());
                                    if(tbl.cell(cell_rid, cell_cid).data().includes("%")) {
                                        data = parseFloat(tbl.cell(cell_rid, cell_cid).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""));
                                    }
                                } else {
                                    data = parseFloat(tbl.cell(cell_rid, cell_cid).data());
                                }

                                if(data < 0) {
                                    flagColor = true;
                                }

                                if(flagColor) {
                                    cell_node.style.color = "#A92626";
                                } else {
                                    cell_node.style.color = "#2D7230";
                                }
                            }
                            ///// ---------------------- For cell color red or green ends -----------------------------


                            if(!Object.keys(groupRowMapping_QT).includes(j.toString()) && !Object.keys(groupRowMapping_QT).includes(node.toString())){
                                if(isNaN(d[j])) {
                                    // sum = "- %"
                                    if(d[j].includes("%")) {
                                        if(!isNaN(parseFloat(d[j].replace(/,{1,}/g,"").replace(/%{1,}/g,"")))) {
                                            var value = tbl.cell(rowIDTotal, indices[i] - 10).data()
                                            var val_minus_act = tbl.cell(rowIDTotal, indices[i] - no_of_per_cols).data()
                                            // var act1 = value - val_minus_act
                                            // sum = (val_minus_act / act1).toString()+" %"
                                            if(isNaN(value)) {
                                                value = parseFloat(tbl.cell(rowIDTotal, indices[i] - 10).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                            }
                                            if(isNaN(val_minus_act)) {
                                                val_minus_act = parseFloat(tbl.cell(rowIDTotal, indices[i] - no_of_per_cols).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                            }
        
                                            var act1 = value - val_minus_act
        
                                            if(value == 0 && act1 == 0) {
                                                sum = "-"
                                            } else if(value == 0) {
                                                sum = "-100%"
                                            } else if (act1 == 0) {
                                                sum = "100%";
                                            } else {
                                                sum = (val_minus_act / act1 * 100).toString()+" %"
                                            }
                                            // sum += parseFloat(d[j].replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                        }
                                    } else {
                                        if(!isNaN(parseFloat(d[j].replace(/,{1,}/g,"")))) {
                                            sum += parseFloat(d[j].replace(/,{1,}/g,""))
                                        }
                                    }
                                } else {
                                    if(!isNaN(parseFloat(d[j]))) {
                                        sum += parseFloat(d[j])
                                    }
                                }
                            }
                        }
                        // console.log(d,"<<<<",sum)
                        var colorFlag = false;
                        if(!isNaN(sum)){
                            sum = parseFloat(sum).toFixed(no_of_decimalPlaces)
                        } else {
                            sum = parseFloat(sum).toFixed(no_of_decimalPlaces).toString()+" %";
                        }

                        if(sum >= 0 || sum >= "0") {
                            colorFlag = true;
                        }

                        ////// ------------------ Number Formatting Starts --------------------------
                        var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: no_of_decimalPlaces});
                        
                        if(DO_QT["Current_Scale"] == "K") {
                            nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: no_of_decimalPlaces_K});
                            if(sum.includes("%")) {
                                sum = parseFloat(sum.split("%")[0]).toFixed(no_of_decimalPlaces_K) + "%"
                            } else {
                                sum = parseFloat(sum).toFixed(no_of_decimalPlaces_K)
                            }
                        }
                        
                        var count = nFormat.format(sum);

                        if(isNaN(sum)) {
                            sum = sum.split("%")[0];
                            count = nFormat.format(sum) + "%";
                        }

                        if(numericCols.includes(i)) {
                            count = nFormat.format(Math.round(parseFloat(count.split(".")[0].toString().replace(/,{1,}/g,"")+"."+count.split(".")[1]))).split(".")[0];
                        }
                        ////// ------------------ Number Formatting Ends ----------------------------

                        var rowIDTotal = tbl.rows()[0][0];
                        var node = tbl.cell(rowIDTotal, i).data(count).node()

                        if(!numericCols.includes(i) && updateFrom != i) {
                            if(colorFlag) {
                                node.style.color = "#2D7230";
                            } else {
                                node.style.color = "#A92626";
                            }
                        }

                        // if(!isNaN(sum)){
                        //     sum = parseFloat(sum).toFixed(no_of_decimalPlaces)
                        // } else {
                        //     sum = parseFloat(sum).toFixed(no_of_decimalPlaces).toString()+" %";
                        // }
                        // var rowIDTotal = tbl.rows()[0][0];
                        // tbl.cell(rowIDTotal, i).data(sum)
                        ////// =============================== Top-Most Total Update Ends ====================================
                        /////  -----------------------------------------------------------------------------------------------
                        // for(var k = updateFrom; k < updateFrom + changeLength; k++) {
                        //     var subsetSum = 0;
                        //     for(var idx = 0; idx < subsetChildren.length; idx++) {
                        //         var dc = tbl.cell(subsetChildren[idx], k).data();
                        //         if(isNaN(dc)) {
                        //             if(!dc.includes("%") && parseFloat(dc.replace(/,{1,}/g,""))) {
                        //                 subsetSum += parseFloat(dc.replace(/,{1,}/g,""))
                        //             } else if(dc.includes("%")) {
                        //                 // subsetSum = "-%";
                        //                 if(gbl_finalPerCols_FY[k.toString()][0]) {
                        //                     var value = tbl.cell(subsetChildren[idx], gbl_finalPerCols_FY[k.toString()][0]).data().replace(/,{1,}/g,"")
                        //                     var val_minus_act = tbl.cell(subsetChildren[idx], k - no_of_per_cols).data().replace(/,{1,}/g,"")
                        //                     var act1 = parseFloat(value) - parseFloat(val_minus_act)
                        //                     subsetSum = (val_minus_act / act1).toString()+" %"
                        //                 }
                        //             }
                        //         }
                        //         else {
                        //             subsetSum += dc;
                        //         }
                        //     }
                        //     if(!isNaN(subsetSum)) {
                        //         tbl.cell(parseInt(parentID), k).data(parseFloat(subsetSum).toFixed(no_of_decimalPlaces))
                        //     } else {
                        //         tbl.cell(parseInt(parentID), k).data(parseFloat(subsetSum).toFixed(no_of_decimalPlaces).toString()+"%")
                        //     }
                        // }
                        ////// =============================== Subset Group Total Update Ends ================================
                    }
                     ////// =============================== Subset Group Total Update Starts ==============================

                    var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: no_of_decimalPlaces});
                    var count = undefined;

                    if(DO_QT["Current_Scale"] == "K") {
                        nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: no_of_decimalPlaces_K});
                    }
 
                    ///// -------------------- For Non % Cols Starts ------------------------------
                    for(var k = updateFrom; k < updateFrom + changeLength - no_of_per_cols; k++) {
 
                        var subsetSum = 0;
 
                        for(var idx = 0; idx < subsetChildren.length; idx++) {
                            var dc = tbl.cell(subsetChildren[idx], k).data();
                            if(!isNaN(dc)) {
                                subsetSum += parseFloat(dc);
                            } else {
                                if(dc != "-") {
                                    subsetSum += parseFloat(dc.replace(/,{1,}/g,""));
                                }
                            }
                        }
                         
                        count = nFormat.format(subsetSum);
 
                        if(fyCols.includes(k) && !isNaN(subsetSum)) {
                            count = nFormat.format(parseFloat(count.split(".")[0].toString().replace(/,{1,}/g,"")+"."+count.split(".")[1])).split(".")[0];
                        }
 
                        if(isNaN(subsetSum)) {
                            count = "-"
                        }
 
                        tbl.cell(parseInt(parentID), k).data(count)
                    }
                    ///// -------------------- For Non % Cols Ends ------------------------------
                    ///// -------------------- For % Cols Starts --------------------------------
                    for(var k = updateFrom + changeLength - no_of_per_cols, idx_parent = updateFrom, idx = updateFrom + no_of_per_cols; k < updateFrom + changeLength; k++) {

                        var subsetSum = 0;

                        var value = tbl.cell(parentID, idx_parent).data();
                        var val_minus_act = tbl.cell(parentID, idx).data()

                        if(isNaN(value)) {
                            value = parseFloat(tbl.cell(parentID, idx_parent).data().replace(/,{1,}/g,""))
                        }
                        if(isNaN(val_minus_act)) {
                            val_minus_act = parseFloat(tbl.cell(parentID, idx).data().replace(/,{1,}/g,""))
                        }

                        var act1 = value - val_minus_act

                        if(value == 0 && act1 == 0) {
                            subsetSum = "-"
                        } else if(value == 0) {
                            subsetSum = -100
                        } else if (act1 == 0) {
                            subsetSum = 100;
                        } else {
                            subsetSum = Math.round(parseFloat(val_minus_act / act1 * 100) * 10) / 10;
                        }
                        
                        count = nFormat.format(subsetSum);

                        if(DO_QT["Current_Scale"] == "K") {
                            count = nFormat.format(parseFloat(subsetSum).toFixed(0));
                        }

                        if(subsetSum == "-" || isNaN(subsetSum)) {
                            count = "-"
                        }

                        idx_parent++;
                        idx++;

                        var node = tbl.cell(parseInt(parentID), k).data(count.toString()+" %").node()

                        if(count >= 0 || count >= "0") {
                            node.style.color = "#2D7230";
                        } else {
                            node.style.color = "#A92626";
                        }
                    }
                    ///// -------------------- For % Cols Ends ----------------------------------

                   
                }

                function updateRow_Q(state, no_of_dimens, no_of_mes, no_of_excludes, identifer, sliceFrom, changeLength) 
                {
                    var selectData = tbl.row('.selected').data()
                    var ROW_ID = tbl.row('.selected')[0][0];
                    // console.log(selectData, sliceFrom)

                    var row_updated_arr = selectData.slice(0, sliceFrom + 1)
                    state.getElementsByTagName('option')[state.options.selectedIndex].setAttribute('selected', 'selected')

                    var selOptID = state.getElementsByTagName('option')[state.options.selectedIndex].id
                    // var selOptVal = JSON.parse(state.getElementsByTagName('option')[state.options.selectedIndex].value)
                    // var selOptVal = fixRowsObj[identifer];
                    var selOptVal = [];

                    if(DO_QT["Current_Scale"] == "K") {
                        selOptVal = fixRowsObj[identifer];
                    } else {
                        selOptVal = fixRowsObj["ScaledData"][identifer];
                    }
                    // console.log(state)

                    let sid = state.classList[1].split("row_level_select_")[1];
                    DO_QT["DRP"][tbl.row('.selected').index()][sid] = selOptID;

                    var sliced = selOptVal.slice(2, ), data = {};
                    // var sliced = selOptVal.slice(sliceFrom, ), data = {};
                    // console.log(sliced)

                    // ----------------------- Handling base case for WHAT-IF column is updated first --------- 
                    if(is_col_updated && selOptID == 0) {
                        for(var k = 1, mr_k = 0; k <= no_of_mes; k++) {
                            sliced[k] = masterRows[ROW_ID].slice(hMap[0] + 1, (hMap[0] + 1) + no_of_mes)[mr_k];
                            mr_k++;
                        }
                    }
                    // ----------------------------------------------------------------------------------------

                    // console.log("SLICED ---- ", sliced)
                    for(var i = 1, index = 0; i < sliced.length; i++) {
                        data[index] = sliced.slice(i, i + changeLength)
                        i += changeLength
                        index += 1
                    }
                    // console.log("0000",data, data[selOptID])

                    var len = row_updated_arr.length;
                    row_updated_arr = row_updated_arr.concat(selectData.slice(len, ));

                    row_updated_arr[sliceFrom + parseInt(state.id)] = state

                    var sliceLen = sliceFrom + parseInt(state.id) + 1
                    
                    var dataCopy  = Array.from(data[selOptID]);
                    // console.log("DATA", dataCopy)
                    for(var i = sliceLen, idx = 0; i < sliceLen + changeLength; i++) {
                        row_updated_arr[i] = dataCopy[idx]
                        idx += 1;
                    }

                    // console.log(row_updated_arr)
                    tbl.row('.selected').data(row_updated_arr)

                    var updateFrom = parseInt(sliceFrom)  // length of fixed columns (till base scenario)
                                    + parseInt(state.id) // selection id present at column
                                    + 1;  // to avoid selection column in count

                    if(showTotalonRowUpdateFlag) {
                        state.style.backgroundColor="#C4DBEE";
                        state.style.border = "2px solid #0460A9";
                        state.style.color="#2C2C2C";
                        updateTotalOnRowUpdate(updateFrom, changeLength, ROW_ID);
                    }

                }

                window.updateRow_Q = updateRow_Q

                var obj = Object.fromEntries(this._colOrder.slice().map(key => [key, []]));
                // var masterObj = {};
                // var scenarioObj = {}
                // // var scenarioObj = Object.fromEntries(this._colOrder.slice().map(key => [key, []]));
                // scenarioObj["DropDownFieldName"] = new Set();
                // console.log(scenarioObj)
                // var fixRows = this._resultSet[i].slice(0, fixedScenarioAt);

                for(var i = 0, prev_key = "", seqID = 0, scenarioMissing = false; i < this._resultSet.length;) {

                    var key = this._resultSet[i].slice(0, this._dimensions.indexOf(this._dateColName)).join("_#_");
                    
                    if(i==0) {prev_key = key.substring(0, )}

                    var tempKey = key.substring(0, );

                    var scenarioObj = {}
                    scenarioObj["DropDownFieldName"] = new Set();

                    while(JSON.stringify(key) == JSON.stringify(tempKey)) {
                        // console.log(this._resultSet[i])
                        if(this._resultSet[i] == undefined) {
                            break;
                        }

                        tempKey = this._resultSet[i].slice(0, this._dimensions.indexOf(this._dateColName)).join("_#_");

                        if(JSON.stringify(key) != JSON.stringify(tempKey)) {
                            break;
                        }

                        var masterKey = tempKey.split("_#_").slice(0, fixedScenarioAt);
                        var scene = this._resultSet[i][this._dimensions.length];
                        var selColumnName = this._resultSet[i][this._dimensions.indexOf(this._dateColName)];

                        // console.log(scene, "---", )

                        if(masterObj[masterKey.join("_#_")] == undefined) {
                            masterObj[masterKey.join("_#_")] = {};
                            masterObj[masterKey.join("_#_")]["DropDownFieldName"] = new Set();
                            masterObj[masterKey.join("_#_")]["DropDownSelected"] = new Set()
                        }

                        if(masterObj[masterKey.join("_#_")][selColumnName] == undefined) {
                            masterObj[masterKey.join("_#_")][selColumnName] = structuredClone(obj);
                        }

                        masterObj[masterKey.join("_#_")][selColumnName][scene] = this._resultSet[i].slice(this._resultSet[i].length - this._measureOrder.length, )
                        masterObj[masterKey.join("_#_")]["DropDownFieldName"].add(this._resultSet[i][this._dimensions.indexOf(this._dateColName)]);
                        
                        if(this._dropdownsSelected.includes(this._resultSet[i][fixedScenarioAt].toUpperCase())) {
                            masterObj[masterKey.join("_#_")]["DropDownSelected"].add(this._resultSet[i][this._dimensions.indexOf(this._dateColName)]);
                        }

                        // console.log(masterObj[masterKey.join("_#_")][selColumnName][scene],"----")

                        // console.log(structuredClone(masterObj))
                        // console.log(this._resultSet[i])

                        i += 1;
                    }
                    prev_key = key;
                }

                console.log("---",structuredClone(masterObj))


                // Final Row Assignment
                for(const [k, v] of Object.entries(masterObj)) {
                    // console.log(k)
                    var finalRow = [];
                    
                    // Pushing Dimensions to finalRow.
                    var dim = k.split("_#_");
                    for(var f = 0; f < dim.length; f++) {
                        finalRow.push(dim[f])
                    }

                    // console.log(v);
                    finalRow.push(Array.from(v["DropDownFieldName"])[0])

                    // Pushing Quarter Measures to finalRow
                    // for(var o = 0, cnt = 1; o < this._measureOrder.length; o++) {
                        // if(o == 0) {
                        //     finalRow.push(Array.from(v["DropDownFieldName"])[o])
                        // }
                        // var relocate_idx = 0

                        var cnt = 1;
                        for(const v1 in v) {
                            // console.log(v, "---", v1)
                            if(v1 != "DropDownFieldName") {
                                // console.log(this._colOrder.length * this._measureOrder.length)
                                
                                for(var e = 0; e < this._measureOrder.length; e++)  {
                                    for(const [km, vm] of Object.entries(masterObj[k][v1])) {
                                        // console.log(v1, km, vm)
                                        // finalRow.push(km)
                                        // console.log(vm[e])
                                        if(vm[e] != undefined) {
                                            finalRow.push(vm[e])
                                        } else {
                                            finalRow.push("-")
                                        }
                                        if(cnt == this._colOrder.length * this._measureOrder.length) {
                                            finalRow.push("--selection--")
                                            cnt = 0;
                                            // console.log("HELLO...")
                                        }
                                        cnt++;
                                        // console.log(relocate_idx)
                                    }
                                }
                               
                                // relocate_idx++;
                                // finalRow.pop()
                               
                        //         // finalRow.push("--Selection--")
                        //         // console.log(masterObj[k][v1])
                            } else {
                                // dropdown data
                            }
                        // }
                    }
                    

                    finalRow.pop()
                    // fixRowsObj[k] = finalRow.slice()


                    // console.log("--------->>>>>>>", finalRow)
                    // Handling case where whole base-1/2/3/... scenario is not present ... 
                    var flag = false;

                    if(finalRow.length == (this._dimensions.length - 1) + this._colOrder.length * 3) {
                        var repeatBase = finalRow.slice(this._dimensions.indexOf(this._dateColName) - 1, );
                        for(var l = finalRow.length, lcl_cnt = 0; l < table_cols.length; l++) {
                            finalRow.push(repeatBase[lcl_cnt])
                            if(lcl_cnt >= repeatBase.length) {
                                lcl_cnt = 0;
                            }
                            lcl_cnt++;
                        }
                        flag = true;
                    } 
                    else if(finalRow.length < table_cols.length) {
                        for(var l = finalRow.length; l < table_cols.length; l++) {
                            finalRow.push("-")
                        }
                    }

                    // // Adding Dropdowns to finalRow
                    var sliceLen = this._colOrder.length * this._measureOrder.length + fixedScenarioAt + 1;
                    var sliced = finalRow.slice(sliceLen)
                    // console.log("---------", sliced)
                    var dropdownArr = Array.from(masterObj[k]["DropDownFieldName"]).slice();
                    var dropdownSel = Array.from(masterObj[k]["DropDownSelected"]).slice();
                    var caughtDropDownsAt = new Set();

                    // console.log(dropdownArr);


                    var selectionCnt = 0, cnt = 0;
                    var options = "";
                    var flag_sel = sliced[0];
                    // var isSelectionUpdatedByUser = false;
                    var dropdownIDs = new Set(), master_dropdownArr = new Set();

                    for(var kk = 0, optIdx = 0; kk < sliced.length; kk++) {

                        // dropdown change dynamic trigger through js 
                        if(cnt < 3) {
                            dropdownIDs.add(kk+"_"+this._dataTableObj.rows().count());
                        }

                        if(selectionCnt >= dropdownArr.length) {
                            if(flag) {
                                sliced[kk] = `<select id='${kk}' class='row_level_select row_level_select_${kk}_${this._dataTableObj.rows().count()}' onchange='updateRow_Q(this, ${this._dimensions.length}, ${this._measureOrder.length}, ${this._excludeHeaders.length}, "${finalRow[0]}_#_${finalRow[1]}", ${fixedScenarioAt + 1 + (this._colOrder.length * this._measureOrder.length)}, ${this._colOrder.length * this._measureOrder.length})'><option selected>${flag_sel}</option></select>`;
                            } else {
                                var emptySelect = `<select id='${kk}' class='row_level_select row_level_select_${kk}_${this._dataTableObj.rows().count()}' onchange='updateRow_Q(this, ${this._dimensions.length}, ${this._measureOrder.length}, ${this._excludeHeaders.length}, "${finalRow[0]}_#_${finalRow[1]}", ${fixedScenarioAt + 1 + (this._colOrder.length * this._measureOrder.length)}, ${this._colOrder.length * this._measureOrder.length})'>`;
                                // var emptyOption = `<option selected disabled></option>`;
                                var emptyOption = ``;
                                for(var p = 0; p < dropdownArr.length; p++) {
                                    if(dropdownSel.includes(dropdownArr[p])) {
                                        caughtDropDownsAt.add(p)
                                    } else {
                                        master_dropdownArr.add(p);
                                    }
                                    if(optIdx == p) {
                                        emptyOption += `<option id='${p}' selected>${dropdownArr[p]}</option>`
                                    } else {
                                        emptyOption += `<option id='${p}' >${dropdownArr[p]}</option>`
                                    }
                                }
                                emptySelect += emptyOption + `</select>`;
                                sliced[kk] = emptySelect;
                            }
                        } else {
                            var select_html = `<select id='${kk}' class='row_level_select row_level_select_${kk}_${this._dataTableObj.rows().count()}' onchange='updateRow_Q(this, ${this._dimensions.length}, ${this._measureOrder.length}, ${this._excludeHeaders.length}, "${finalRow[0]}_#_${finalRow[1]}", ${fixedScenarioAt + 1 + (this._colOrder.length * this._measureOrder.length)}, ${this._colOrder.length * this._measureOrder.length})'>`;
                            var options = "";
                            for(var p = 0; p < dropdownArr.length; p++) {
                                if(dropdownSel.includes(dropdownArr[p])) {
                                    caughtDropDownsAt.add(p)
                                } else {
                                    master_dropdownArr.add(p);
                                }
                                if(optIdx == p) {
                                    options += `<option id='${p}' selected>${dropdownArr[p]}</option>`
                                } else {
                                    options += `<option id='${p}' >${dropdownArr[p]}</option>`
                                }
                            }
                            select_html += options + `</select>`;
                            sliced[kk] = select_html;
                        }
                       
                        cnt++;
                        kk += this._colOrder.length * this._measureOrder.length;
                        selectionCnt++;
                        optIdx += 1;
                    }
                    // console.log(sliced)
                  
                    finalRow = finalRow.slice(0, sliceLen).concat(sliced);

                    /////// creating scaled data copy starts ------------------------ 
                    var K_DataQT = finalRow.slice();
                    var M_DataQT = finalRow.slice();
                    var numCols_QT = this._dataTableObj.columns('.numericColsCSS')[0];
                    var vsPyCols_QT = this._dataTableObj.columns('.vsPy')[0];
                    var perCols_QT = this._dataTableObj.columns('.perCols')[0];
   
                    var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: this.no_of_decimalPlaces_M});
                    var nFormat_K = new Intl.NumberFormat('en-US', {minimumFractionDigits: this.no_of_decimalPlaces_K});
   
   
                    for(var ss = 0; ss < M_DataQT.length; ss++) {
                        if(numCols_QT.includes(ss) || vsPyCols_QT.includes(ss)) {
                            //////////
                            if(!isNaN(parseFloat(M_DataQT[ss].toString()))) {
                                if(M_DataQT[ss].toString().includes(".")) {
                                    M_DataQT[ss] = nFormat.format(parseFloat(M_DataQT[ss].toString().replace(/,{1,}/g,"") / 1000).toFixed(this.no_of_decimalPlaces_M))
                                }
                            }
   
                           /////////
                           if(!isNaN(parseFloat(K_DataQT[ss].toString()))) {
                               if(K_DataQT[ss].toString().includes(".")) {
                                   K_DataQT[ss] = nFormat_K.format(parseFloat(K_DataQT[ss].toString().replace(/,{1,}/g,"")).toFixed(this.no_of_decimalPlaces_K))
                               }
                           }
                        }
                        else if(perCols_QT.includes(ss)) {
                            /////////
                            if(!isNaN(parseFloat(M_DataQT[ss].toString().split("%")[0]).toFixed(0))) {
                                M_DataQT[ss] = nFormat.format(parseFloat(M_DataQT[ss].toString().split("%")[0]).toFixed(this.no_of_decimalPlaces_M)).toString()+"%";
                            }
    
                            ////////
                            if(!isNaN(parseFloat(K_DataQT[ss].toString().split("%")[0]).toFixed(0))) {
                                K_DataQT[ss] = nFormat_K.format(parseFloat(K_DataQT[ss].toString().split("%")[0]).toFixed(this.no_of_decimalPlaces_K)).toString()+"%";
                            }
                        }
                    }
                    finalRow = K_DataQT.slice()
                    fixRowsObj[k] = finalRow.slice()
   
                    if(fixRowsObj["ScaledData"] == undefined) {
                        fixRowsObj["ScaledData"] = {}
                    }
   
                    fixRowsObj["ScaledData"][k] = M_DataQT.slice()
                    /////// creating scaled data copy ends ------------------------ 
                    
                    ////// ================================ Group by Row Starts =========================================
                    if(!Array.from(groupBy).includes(finalRow[0])) {
                        groupBy.add(finalRow[0])
                        templateGroupTotal[1] = finalRow[0]
                        var node = tbl.row.add(templateGroupTotal.slice()).draw(false).node()
                        node.classList.add("group")
                    }
                    ////// ================================ Group by Row Ends ============================================

                    tbl.row.add(finalRow).draw(false)
                    var rid = tbl.rows().indexes().toArray()[tbl.rows().indexes().toArray().length - 1];

                    if(!flag) {

                        var cga = Array.from(caughtDropDownsAt);
                        master_dropdownArr = Array.from(master_dropdownArr).slice(1,);

                        if(cga.length < 3) {
                            for(var b = 0; b < master_dropdownArr.length; b++) {
                                if(cga.length >= 3) {
                                    break;
                                }
                                cga.push(master_dropdownArr[b]);
                            }
                            if(cga.length < 3) {
                                for(var b = cga.length; b <3; b++) {
                                    cga.push(0);
                                }
                            }
                        }

                        var drp = Array.from(dropdownIDs);

                        if(DO_QT["DRP"] == undefined) {
                            DO_QT["DRP"] = {}
                        }

                        if(DO_QT["DRP"][rid] == undefined) {
                            DO_QT["DRP"][rid] = {}
                        }

                        DO_QT["DRP"][rid][drp[0]] = cga[0];
                        DO_QT["DRP"][rid][drp[1]] = cga[1];
                        DO_QT["DRP"][rid][drp[2]] = cga[2];

                        this.setSelectorsSelectedValue(dropdownIDs, cga, "QT");
                    }
                    // console.log(finalRow);
                }

                // Styling Block Starts
                this.applyStyling_QT();

                if (this._tableCSS.length > 1) {
                    console.log(this._tableCSS)
                    this._table.style.cssText = this._tableCSS
                }

                if (this._rowCSS.length > 1) {
                    console.log(this._rowCSS)
                    document
                        .querySelector(this._widgetID+'v1-custom-table')
                        .shadowRoot.querySelectorAll('td')
                        .forEach(el => (el.style.cssText = this._rowCSS))
                    document
                        .querySelector(this._widgetID+'v1-custom-table')
                        .shadowRoot.querySelectorAll('th')
                        .forEach(el => (el.style.cssText = this._rowCSS))
                }

                if (this._colCSS.length > 1) {
                    console.log(this._colCSS)
                    document
                        .querySelector(this._widgetID+'v1-custom-table')
                        .shadowRoot.querySelector('style').innerText += this._colCSS
                }

                const list = document.querySelector(this._widgetID+"v1-custom-table").shadowRoot.querySelector("#example > thead");

                for(var i = 0; i < list.children.length - 1; i++) {
                    list.removeChild(list.children[i]);
                }
                document.querySelector(this._widgetID+"v1-custom-table").shadowRoot.querySelector("#example > thead").insertAdjacentHTML('afterBegin', topHeader);
                
                // this._dotsLoader.style.visibility = "hidden";
                this._table.style.visibility = "visible";
                this._root.style.display = "block";

                // document.querySelector(this._widgetID+"v1-custom-table").shadowRoot.querySelector("#example > thead > tr:nth-child(2) > th:nth-child(2)").click();
                // Styling Block Ends here

                // isSelectionUpdatedByUser = true;
                showTotalonRowUpdateFlag = true;
                this.showTotal("QT");
                this.applyScaling_QT("K")
                if(this._currentScaling == "M") {
                    DO_QT["Current_Scale"] = "M";
                    this.applyScaling_QT("M")
                }
            }

            // ==========================================================================================================================
            // ---------------------------------------------------------- Monthly -------------------------------------------------------
            // ==========================================================================================================================

            applyStyling_MT() {
                document.querySelector(this._widgetID+"v1-custom-table").shadowRoot.querySelector("style").innerText += `
                tbody, td, tfoot, th, thead, tr {
                    border-color: inherit;
                    border-style: none;
                    border-width: 0;
                }
    
                /* ------------------------- CUSTOM STYLING --------------------------------- */
    
                #example {
                    width: 100%!important;
                }

                #example select {
                    padding-top:0%;
                    background-color:#DCE6EF;
                    outline:none;
                }
    
                option {
                    background-color:white;
                    border-bottom:1px solid #CBCBCB;
                    color:black;
                }
                
                select:focus>option:checked {
                    background:#0460A9;
                    color:white;
                    /* selected */
                }

                #example .row_level_select {
                    font-family: Arial;
                    font-size: 14px;
                    height: 30px;
                    background-color: #DCE6EF;
                    border-radius:4px;
                    border:none;
                    outline:none;
                    cursor: pointer;
                }
    
                #example th {
                    text-wrap:nowrap;
                    border-bottom: 1px solid #CBCBCB;
                    background-color:#F2F2F2;
                    align-content: center;
                    font-family: Arial;
                    color:black;
                    font-size:14px;
                }
    
                /* ------------------------- TOP MOST - HEADER ROW ------------------------- */
    
                #example .top-header {
                    height:32px;
                    max-height:32px;
                    font-family: Arial;
                    color:black;
                    font-size:14px;
                    font-weight:bold;
                    text-align: center;
                    padding-top:0%!important;
                    padding-bottom:0%!important;
                }
    
                /* ------------------------- BASE CASE ------------------------- */
    
                #example > thead > tr:nth-child(1) > th:nth-child(2) {
                    background-color:#E0E0E0;
                }
    
                /* ------------------------- SCENARIO 1 ------------------------- */
    
                #example > thead > tr:nth-child(1) > th:nth-child(3) {
                    background-color:#D9D9D9;
                }
    
                /* ------------------------- SCENARIO 2 ------------------------- */
    
                #example > thead > tr:nth-child(1) > th:nth-child(4) {
                    background-color:#CBCBCB;
                }
    
                /* ------------------------- SCENARIO 3 ------------------------- */
    
                #example > thead > tr:nth-child(1) > th:nth-child(5) {
                    background-color:#BDBDBD;
                }
    
                /* ------------------------- 2nd MOST HEADER ------------------------- */
                
                #example > thead > tr:nth-child(2) {
                    height:48px; 
                }
    
                /* ------------------------- SCENARIO SELECT ELEMENTS HEADER ------------------------- */
    
                .scenarios {
                    background-color:inherit;
                    font-family: Arial;
                    color:black;
                    font-size:14px;
                    text-align:center;
                    font-weight:bold;
                    height:30px;
                    border:none;
                    cursor: pointer;
                }
    
                /* ------------------------- GROUPED ROW ------------------------- */
    
                #example .group > td {
                    height:32px;
                    padding: 0px 10px!important;
                    align-content: center;
                    font-weight:bold;
                    color: #212121;
                    left:0%;
                    font-family: Arial;
                    background-color:#E0E0E0!important;
                }
    
                /* ------------------------- NORMAL ROW ------------------------- */
    
                #example td {
                    text-wrap:nowrap;
                    background-color:white;
                    height:48px;
                    border-bottom:1px solid #CBCBCB!important;
                    font-family: Arial;
                    font-size:14px;
                    align-content: center;
                }
    
                #example .numericColsCSS, #example .varCol, #example .perColCSS {
                    text-align:right!important;
                }

                #example .numericColsCSS.numCol {
                    color:#212121!important;
                }
    
                /* ------------------------- ROW LEVEL SELECT ------------------------- */
    
                #example .row_level_select {
                    font-family: Arial;
                    font-size: 14px;
                    height: 30px;
                    background-color: #DCE6EF;
                    border-radius:4px;
                    border:none;
                    outline:none;
                    cursor: pointer;
                }
     
                /* ------------------------- TRUNCATE ROW LEVEL DATA ------------------------- */
    
                #example .truncate {
                    max-width:130px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                /* ------------------------- TOP FIXED HEADER SCROLL ------------------------- */
    
                #example > thead {
                    position: sticky;
                    top:0%!important;
                    border-bottom: 1px solid #CBCBCB;
                    background-color: yellow;
                }
    
                #example {
                    border-collapse: separate;
                    width:100%!important;
                }
    
                .mt-2 {
                    margin-top: 0% !important;
                }
    
                #example > thead > tr:nth-child(2) > th.truncate.dt-orderable-none.dt-type-numeric {
                    text-overflow:unset!important;
                }
    
                /* ------------------------- REMOVE TOP MOST PADDING ------------------------- */
    
                #example_wrapper > div.dt-layout-row.dt-layout-table > div {
                    padding:0%!important;
                }

                /* ------------------------- TOTAL TOP-MOST ROW ------------------------------ */

                #example > tbody > tr:nth-child(1) {
                    font-weight:bold;
                    position:sticky!important;
                    top:80px!important;
                }

                
                /* --------------------------- FREEZE 1ST COLUMN ---------------------------- */

                #example > thead > tr:nth-child(2) > th.truncate.dt-orderable-none, #example > thead > tr:nth-child(1) > th:nth-child(1),
                #example > tbody > tr:nth-child(2) > td.truncate, #example > tbody > tr > td.truncate
                {
                    position:sticky;
                    left:0px;
                }

                td.truncate, #example > tbody > tr > td:not(.truncate) {
                    mix-blend-mode: hue;
                    scroll-behavior: smooth;
                }
                
                `;
            }

            setResultSet_MT(rs, col_to_row = -1, colspan_to_top_headers, lcl_no_of_decimalPlaces) {
                
                var start = performance.now();

                if(this._table) {
                    this._table.remove();
                    this._root.innerHTML = `
                     <table id="example" class="table" style="visibility:hidden;">
                        <thead>
                        </thead>
                        <tbody></tbody>
                    </table>    
                    `
                    this._table = this._shadowRoot.getElementById('example')
                    // console.log( document.querySelector("#"+this["parentNode"].id+" > v1-custom-table").shadowRoot.querySelector("#example > colgroup:nth-child(2)"))
                    // document.querySelector(this._widgetID+"v1-custom-table").shadowRoot.querySelector("#example > colgroup:nth-child(2)").remove();
                }

                this._resultSet = [];
                // this._selectionColumnsCount = selCnt
                this._col_to_row = col_to_row // Row Grouping
                // this._hideColsFrom = hideColsFrom;

                var headers = this._headers
                console.log(headers)
                var remove = headers["Exclude"].join(",")+",@MeasureDimension".split(",");

                this._dimensions = Array.from(new Set(Object.keys(rs[0]).filter((k) => !remove.includes(k))))
                this._measures = new Set()

                this._colOrder = headers["COL_NAME_ORDER"];
                this._scenarioOrder = headers["SCENARIO_ORDER"];
                this._fixedScenario = headers["FIXED_SCENARIO"];
                this._measureOrder = headers["@MeasureDimension"]
                this._excludeHeaders = headers['Exclude']

                this._colspan_EmptyCase = parseInt(colspan_to_top_headers["EmptyCase"]);
                this._colspan_BaseCase = parseInt(colspan_to_top_headers["BaseCase"]);
                this._colspan_RestCase = parseInt(colspan_to_top_headers["RestCase"]);
                // this._dateColName = selColumnName; //selectionColumn
               
                // this._customHeaderNames = customHeaderNames;

                console.log("Col-Orders",this._colOrder)
                console.log("Scenario-Orders",this._scenarioOrder)
                console.log("Fixed Scenarios",this._fixedScenario)
                console.log("Measure Order", this._measureOrder)
                console.log("Dimensions", this._dimensions)
                console.log("Exclude Headers",this._excludeHeaders)

                no_of_decimalPlaces = lcl_no_of_decimalPlaces;

                for(var i = 0; i < rs.length;) {
                    var tempArr = [], dims = new Set();
                    for(var k = 0; k < this._dimensions.length; k++) {
                        dims.add(rs[i][this._dimensions[k]].description);
                    }
                    for(var j = 0; j < this._measureOrder.length; j++) {
                        if(JSON.stringify(this._measureOrder[j]) == JSON.stringify(rs[i]["@MeasureDimension"].description) && rs[i]["@MeasureDimension"].formattedValue != undefined) {
                            // tempArr.push(rs[i]["@MeasureDimension"].formattedValue)
                            var v = rs[i]["@MeasureDimension"].formattedValue;
                            if(v.includes("+")) {
                                v = v.split("+")[1];
                            }
                            tempArr.push(v)
                        } else {
                            while(JSON.stringify(this._measureOrder[j]) != JSON.stringify(rs[i]["@MeasureDimension"].description)) {
                                tempArr.push("-")
                                j+=1;
                                if(j > this._measureOrder.length) {
                                    console.log("Hit to Infinite Loop Case...")
                                    return;
                                }
                            }
                            if(JSON.stringify(this._measureOrder[j]) == JSON.stringify(rs[i]["@MeasureDimension"].description) && rs[i]["@MeasureDimension"].formattedValue != undefined) {
                                // tempArr.push(rs[i]["@MeasureDimension"].formattedValue)
                                var v = rs[i]["@MeasureDimension"].formattedValue;
                                if(v.includes("+")) {
                                    v = v.split("+")[1];
                                }
                                tempArr.push(v)
                            }
                        }
                        i++;
                        if(i >= rs.length || tempArr.length > this._measureOrder.length) {
                            break;
                        }
                    }
                    if(i > rs.length) {
                        break;
                    }
                    tempArr.unshift(...Array.from(dims))
                    // console.log(tempArr)
                    this._resultSet.push(tempArr)
                    // console.log(tempArr)
                }

                console.log("-- Result Set --")
                console.log(this._resultSet)
                console.log("----------------")

                var end = performance.now();
                var time = end - start;
                console.log("setResultSet_MT took approx : "+(Math.round(time/1000, 2)).toString()+"s to load...")

                var start = performance.now();

                this.render_MT();

                var end = performance.now();
                var time = end - start;
                console.log("Render_MT took approx : "+(Math.round(time/1000, 2)).toString()+"s to load...")
            

            }

            async render_MT() {
                
var start = performance.now();

                if (!this._resultSet) {
                    return
                }

                DO_MT = {}

                this._widgetID = "#"+this["parentNode"].id+" > ";
                this._stateShown = "Num"; // for num - numeric, var - variance, per - percentage;
                this._visibleCols = [];
                this._colIndices = [];

                var table_cols = []

                var col_dimension = this._dimensions;
                var col_measures = this._measureOrder;
                var fixedScenarioAt = col_dimension.indexOf("SCENARIO_NAME")
                console.log("Fixed Scenario At : ", fixedScenarioAt);

                console.log('ResultSet Success')

                col_dimension = col_dimension.slice(0, col_dimension.indexOf("SCENARIO_NAME"))

                
                if(Object.keys(this._customHeaderNames).length > 0) {
                    for (var i = 0; i < this._customHeaderNames["DIMEN_NAME"].length; i++) {
                        table_cols.push({
                            title: this._customHeaderNames["DIMEN_NAME"][i]
                        })
                    }
                    for(var j = 0; j < this._customHeaderNames["MES_NAME"].length; j++) {
                        table_cols.push({
                            title: this._customHeaderNames["MES_NAME"][j],
                            className:"numericColsCSS numCol"
                        })
                        table_cols.push({
                            title: this._customHeaderNames["MES_NAME"][j],
                            className:"varCol"
                        })
                        table_cols.push({
                            title: this._customHeaderNames["MES_NAME"][j],
                            className:"numericColsCSS perColCSS"
                        })
                    }
                    for(var i = this._fixedScenario.length; i < this._scenarioOrder.length; i++) {
                        if(this._scenarioOrder[i] != "FY") {
                            table_cols.push({
                                title: this._customHeaderNames["SCENARIO_NAME"][i],
                                className:"selColClass"
                            })
                        }
                        for(var j = 0; j < this._customHeaderNames["MES_NAME"].length; j++) {
                            table_cols.push({
                                title: this._customHeaderNames["MES_NAME"][j],
                                className:"numericColsCSS numCol"
                            })
                            table_cols.push({
                                title: this._customHeaderNames["MES_NAME"][j],
                                className:"varCol"
                            })
                            table_cols.push({
                                title: this._customHeaderNames["MES_NAME"][j],
                                className:"numericColsCSS perColCSS"
                            })
                        }
                    }
                }
                else {
                    for (var i = 0; i < col_dimension.length; i++) {
                        table_cols.push({
                            title: col_dimension[i]
                        })
                    }
                    for(var j = 0; j < this._colOrder.length; j++) {
                        table_cols.push({
                            title: this._colOrder[j],
                            className:"numericColsCSS numCol"
                        })
                        table_cols.push({
                            title: this._colOrder[j],
                            className:"varCol"
                        })
                        table_cols.push({
                            title: this._colOrder[j],
                            className:"numericColsCSS perColCSS"
                        })
                    }
                    for(var i = this._fixedScenario.length; i < this._scenarioOrder.length; i++) {
                        if(this._scenarioOrder[i] != "FY") {
                            table_cols.push({
                                title: this._scenarioOrder[i],
                                className:"selColClass"
                            })
                        }
                        for(var j = 0; j < this._colOrder.length; j++) {
                            table_cols.push({
                                title: this._colOrder[j],
                                className:"numericColsCSS numCol"
                            })
                            table_cols.push({
                                title: this._colOrder[j],
                                className:"varCol"
                            })
                            table_cols.push({
                                title: this._colOrder[j],
                                className:"numericColsCSS perColCSS"
                            })
                        }
                    }
                }
                
var end = performance.now();
var time = end - start;
console.log((Math.round(time/1000, 2)).toString()+"s to load..."+"Table Heading -- Render_MT took approx : ") 
var start = performance.now();

                // TRIM LOGIC
                // table_cols = table_cols.slice(0, this._dimensions.length - this._excludeHeaders.length + ((this._measureOrder.length + 1) * 3))
                console.log('Data Table Columns : ', table_cols)
                this._tableColumnNames = table_cols;

                //// ------------------------ var cols indices starts ---------------------------------
                var varColIndices = new Set();
                var considerCons = ["numericColsCSS perColCSS", "varCol", "perColCSS"];
                for(var i = 0; i < this._tableColumnNames.length; i++) {
                    if(considerCons.includes(this._tableColumnNames[i]["className"])) {
                        varColIndices.add(i);
                    }
                }
                //// ------------------------ var cols indices ends -----------------------------------

                 //// ------------------------ Show Totals on Row Block Starts ---------------------------------
                // var indices = [];
                this._fixedIndices = this._fixedIndices.concat(this._dropdownIndices);
                // var fyColsMT_render = [];
                // var perColsMT_render = [];
                var numMT_render = [];
                var templateGroupTotal = ["Total"];
                // var templateGroupTotal = `<tr class="clTotalRow"><td>Total</td>`;
                // var templateGroupTotal = "";

                for(var i = 0; i < this._tableColumnNames.length; i++) {
                    if(this._dropdownIndices.includes(i)) {
                        indices_MT.push(-1);
                    } 
                    else if (!this._fixedIndices.includes(i)) {
                        indices_MT.push(i);
                    }
                    if(this._tableColumnNames[i].className == "numericColsCSS") {
                        templateGroupTotal.push(0);
                    } else {
                        templateGroupTotal.push("");
                    }

                    // if(this._tableColumnNames[i].title == "FY" && this._tableColumnNames[i].className != "numericColsCSS perColCSS") {
                    //     fyColsMT_render.push(i);
                    // }
                    // if(this._tableColumnNames[i].title == "FY" && this._tableColumnNames[i].className == "numericColsCSS perColCSS") {
                    //     perColsMT_render.push(i);
                    // }
                    if(this._tableColumnNames[i].className == "numericColsCSS numCol") {
                        numMT_render.push(i);
                    }
                    // ////// -------------- For subset group total on rowgroup level starts --------------------
                    // if(i > 0) {
                    //     // templateGroupTotal += '<td class="numericColsCSS">'+i+'</td>';
                    //     if(this._customHeaderNames["SCENARIO_NAME"].includes(this._tableColumnNames[i].title) || this._tableColumnNames[i].title == this._dateColName) {
                    //         templateGroupTotal.push("");
                    //     } else {
                    //         // console.log(this._tableColumnNames[i].title)
                    //         templateGroupTotal.push(0);
                    //     }
                    // }
                    ////// -------------- For subset group total on rowgroup level Ends ----------------------
                }

                // templateGroupTotal += `</tr>`;
                
                // console.log($(templateGroupTotal));

                this._indices = indices_MT;
                
                // --------------- Hide Columns STARTS ---------------
                var hideCols = []

                // @--------------- CHANGED UNCOMMENT THIS... ----------------------------------

                // for(var i = 19; i < table_cols.length; i++) {

                for(var i = this._hideExtraVisibleColumnFromIndex; i < table_cols.length; i++) {
                    hideCols.push(i)
                }
                // --------------- Hide Columns ENDS ---------------

                // console.log('Data Table Columns : ', table_cols)

                var groupColumn = this._col_to_row

                var tbl = undefined
                var groupBy = new Set();


                if (!jQuery().dataTable) {
                    console.log("-------- Datatable not initialized. \nRe-Initialzing Datatable libraries ...  ");
                    await this.loadLibraries();
                }

                if (groupColumn != -1) {

                    hideCols.push(groupColumn);
                    // hideCols.push(2);

                    // var nullArr = table_cols.slice()
                    // nullArr.fill(null)
                    // nullArr.pop()
                    // console.log(nullArr)

                    this._dataTableObj = new DataTable(this._table, {
                        layout: {},
                        columns: table_cols,
                        // bAutoWidth: true, 
                        columnDefs: [
                            {
                                defaultContent: '-',
                                // targets: hideCols, //_all
                                // targets: groupColumn,
                                targets : hideCols,
                                visible: false,
                                // className: 'dt-body-left'
                            },
                            { 
                                targets:1, className:"truncate"
                            },
                            { 
                                targets:numMT_render,
                                render: function (data, type) {
                                    var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: 0});
                                    if(!isNaN(parseFloat(data.replace(/,{1,}/g,"")))) {
                                        return nFormat.format(parseFloat(data.replace(/,{1,}/g,"")).toFixed(0))
                                    }
                                    return data
                                }
                            },
                            { 
                                // targets:fyColsMT_render,
                                // render: function (data, type) {
                                //     if(!isNaN(parseFloat(data.replace(/,{1,}/g,"")))) {
                                //         return parseFloat(data.replace(/,{1,}/g,"")).toFixed(0)
                                //     }
                                //     return data
                                // }
                            },
                            { 
                                // targets:perColsMT_render,
                                //     render: function (data, type) {
                                //         return data.split(".")[0].toString()+"%"
                                //     }
                            },
                            {
                                "targets": Array.from(varColIndices),
                                "createdCell": function (td, cellData, rowData, row, col) {
                                    if (cellData >= 0 || cellData >= "0") {
                                        $(td).css('color', '#2D7230')
                                    }
                                    else if (cellData < 0 || cellData < "0") {
                                        $(td).css('color', '#A92626')
                                    }
                                }
                            },
                        ],
                         createdRow: function(row){
                            var td = $(row).find(".truncate");
                            td["prevObject"]["context"]["children"][0].title = td["prevObject"]["context"]["cells"][0]["innerText"];
                        },
                        order: [[groupColumn, 'asc']],
                        displayLength: 25,
                       
                        // drawCallback: function (settings) {
                        //     var api = this.api()
                        //     var rows = api.rows({ page: 'current' }).nodes()
                        //     var last = null

                        //     api
                        //         .column(groupColumn, { page: 'current' })
                        //         .data()
                        //         .each(function (group, i) {
                        //             if (last !== group) {
                        //                 $(rows)
                        //                     .eq(i)
                        //                     .before(
                        //                         '<tr class="group"><td colspan="' +
                        //                         table_cols.length +
                        //                         '">' +
                        //                         group +
                        //                         '</td></tr>'
                        //                     )
                        //                 last = group
                        //             }
                        //         })
                        // },
                        bPaginate: false,
                        searching: false,
                        ordering: false,
                        processing: true,
                        // serverSide: true,
                        info: false,     // Showing 1 of N Entries...
                        bDestroy: true
                    })
                } else {
                    this._dataTableObj = new DataTable(this._table, {
                        layout: {},
                        columns: table_cols,
                        bAutoWidth: true, 
                        columnDefs: [
                            {
                                defaultContent: '-',
                                targets: hideCols, //_all
                                visible:false
                                // className: 'dt-body-left'
                            }
                        ],
                        bPaginate: false,
                        // bProcessing: true,
                        // bServerSide: true,
                        processing: true,
                        // serverSide: true,
                        searching: false,
                        ordering: false,
                        info: false,     // Showing 1 of N Entries...
                        bDestroy: true
                    })
                }

                tbl = this._dataTableObj;

                if(tbl.data().any()) {
                    tbl.rows().remove().draw();
                }

var end = performance.now();
var time = end - start;
console.log((Math.round(time/1000, 2)).toString()+"s to load..."+"Table Initialization -- Render_MT took approx : ") 
var start = performance.now();

                // this._dataTableObj = tbl;

                ////// -------------------------- Show Total Row ------------------------
                var showTotalRow = ["Total", "Total"];
                var showTotalonRowUpdateFlag = false;
                for(var i = 2; i < this._tableColumnNames.length; i++) {
                    if(this._indices.includes(i)) {
                        showTotalRow.push("")
                    } else {
                        showTotalRow.push("")
                    }
                }
                tbl.row.add(showTotalRow).draw(false)

//  ------------------------------ TO BE UNCOMMENTED ----------------------
                // Top Most Header Block Starts
                var topHeader = "<tr>";
                
                if(groupColumn != -1) {
                    topHeader += `<th class='top-header' colspan='${this._dimensions.slice(0, this._dimensions.length - this._excludeHeaders.length).length - 3}'></th>`;
                } else {
                    topHeader += `<th class='top-header' colspan='${this._dimensions.slice(0, this._dimensions.length - this._excludeHeaders.length).length - 1}'></th>`;
                }
                // 
                // CHANGED TO -2 in loop condition for neglecting last two scenarios
                // 
                // for(var i = 0; i < this._scenarioOrder.length; i++) {
    
                if(this._customTopHeader) {
                    for(var i = 0; i < 4; i++) {
                        topHeader += `<th class='top-header' colspan='${this._colspan_BaseCase}' id='${this._customTopHeader[i].replace(" ","")}' >${this._customTopHeader[i]}</th>`
                    }
                } else {
                    for(var i = 0; i < this._scenarioOrder.length - 2; i++) {
                        if(this._fixedScenario.includes(this._scenarioOrder[i])) {
                            topHeader += `<th class='top-header' colspan='${this._colOrder.length + 1}'>${this._scenarioOrder[i]}</th>`
                        } else {
                            for(var j = 0; j < this._scenarioOrder.length; j++) {
                                if(!this._fixedScenario.includes(this._scenarioOrder[j])) {
                                    if(this._scenarioOrder[i] == this._scenarioOrder[j]) {
                                        topHeader += 
                                        `<th class='top-header' colspan='${this._colOrder.length + 1}'>${this._scenarioOrder[j]}`;
                                        // console.log(this._scenarioOrder[j])
                                    } 
                                    // else {
                                    //     opts += `<option id='${j}' >${this._scenarioOrder[j]}</option>`;
                                    // }
                                }
                            }
                            topHeader +=  `</th>`;
                        }
                    }
                    topHeader += "</tr>";
                }
               

                // @--- uncomment below line
                // document.querySelector(this._widgetID+"v1-custom-table").shadowRoot.querySelector("#example > thead").insertAdjacentHTML('afterBegin', topHeader);
//  ------------------------------ TO BE UNCOMMENTED ----------------------

                // console.log(topHeader)
               
                // Top Most Header Block Ends


                tbl.on('click', 'tbody tr', e => {
                    
                    let classList = e.currentTarget.classList
                    tbl
                        .rows()
                        .nodes()
                        .each(row => row.classList.remove('selected'))

                    if(classList.length != 1) {

                        classList.add('selected');

                        if(DO_MT["DRP_USR_TRIGGERED"] == undefined) {
                            DO_MT["DRP_USR_TRIGGERED"] = {}
                        }
    
                        if(DO_MT["DRP_USR_TRIGGERED"][tbl.row('.selected').index()] == undefined) {
                            DO_MT["DRP_USR_TRIGGERED"][tbl.row('.selected').index()] = {}
                        }

                    }

                    // console.log(typeof(e.target.classList), Object.keys(e.target.classList), e)
                    if(e.target.classList && e.target.classList[0] == "row_level_select") {
                        var sid = e.target.classList[1].split("row_level_select_")[1];
                        DO_MT["DRP_USR_TRIGGERED"][tbl.row('.selected').index()][sid] = 1;
                    }

                })

                // Master Reference Node For Selection Elements used Inside updateRow_M(), updateColumns() Method
                var fixRowsObj = {}, masterObj = {};
                const masterRows = [];
                var hMap = {};
                var is_col_updated = false;
                
                function updateTotalOnRowUpdate(updateFrom, changeLength, updateFromRowID) {


                    /// ----------------------- For Subset Group Total Starts --------------------------- 
                    var parentID = undefined;
                    for(var [k, v] of Object.entries(groupRowMapping_MT)) {
                        if(v.includes(updateFromRowID)) {
                            parentID = k;
                            break;
                        }
                    }
                    var subsetChildren = groupRowMapping_MT[parentID].slice(1, );
                    /// ----------------------- For Subset Group Total Ends --------------------------- 
 
                    
                    var indices = [];
                    var fyCols = [];
                    var perCols = [];
                   
                    // for(var i = 0; i < table_cols.length; i++) {
                    //     if(table_cols[i]["className"] == "numericColsCSS" || table_cols[i]["className"] == "numericColsCSS perColCSS" || table_cols[i]["className"] == "varCol") {
                    //         indices.push(i);
                    //     } else {
                    //         indices.push(-1);
                    //     }
                    // }
                    var considerConditions = ["numericColsCSS", "numericColsCSS perColCSS", "varCol", "numericColsCSS numCol"]
                    var numericCols = [];
                    for(var i = 0; i < table_cols.length; i++) {
                        if(considerConditions.includes(table_cols[i]["className"])) {
                            indices.push(i);
                        } else {
                            indices.push(-1);
                        }
                        ///// Numeric Col Indices
                        if(table_cols[i]["className"] == "numericColsCSS" || table_cols[i]["className"] == "numericColsCSS numCol") {
                            numericCols.push(i)
                        }
                        ///// fy Col Indices
                        if(table_cols[i]["title"] == "FY" &&  table_cols[i]["className"] != "numericColsCSS perColCSS") {
                            fyCols.push(i)
                        }
                    }

                    var no_of_per_cols = 1;

                    for(var i = updateFrom; i < updateFrom + changeLength; i++) {
                        ////// =============================== Top-Most Total Update Starts =================================
                        var sum = 0;
                        var d = tbl.column(i).data();
                        for(var j = 1; j < d.length; j++) {

                            var node = tbl.column(i).nodes()[j]["_DT_CellIndex"]["row"]

                            ///// ---------------------- For cell color red or green starts ---------------------------
                            if(!numericCols.includes(i)) {
                                var cell_rid = tbl.column(i).nodes()[j]["_DT_CellIndex"]["row"];
                                var cell_cid = tbl.column(i).nodes()[j]["_DT_CellIndex"]["column"];
                                var cell_node = tbl.cell(cell_rid, cell_cid).node();
                                var flagColor = false, data = undefined;
                                
                                if(isNaN(tbl.cell(cell_rid, cell_cid).data())) {
                                    data = parseFloat(tbl.cell(cell_rid, cell_cid).data());
                                    if(tbl.cell(cell_rid, cell_cid).data().includes("%")) {
                                        data = parseFloat(tbl.cell(cell_rid, cell_cid).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""));
                                    }
                                } else {
                                    data = parseFloat(tbl.cell(cell_rid, cell_cid).data());
                                }

                                if(data < 0) {
                                    flagColor = true;
                                }

                                if(flagColor) {
                                    cell_node.style.color = "#A92626";
                                } else {
                                    cell_node.style.color = "#2D7230";
                                }
                            }
                            ///// ---------------------- For cell color red or green ends -----------------------------

                            if(!Object.keys(groupRowMapping_MT).includes(j.toString()) && !Object.keys(groupRowMapping_MT).includes(node.toString())){
                                if(isNaN(d[j])) {
                                    // sum = "- %"
                                    if(d[j].includes("%")) {
                                        if(!isNaN(parseFloat(d[j].replace(/,{1,}/g,"").replace(/%{1,}/g,"")))) {
                                            var value = tbl.cell(rowIDTotal, indices[i] - 2).data()
                                            var val_minus_act = tbl.cell(rowIDTotal, indices[i] - no_of_per_cols).data()
                                            // var act1 = value - val_minus_act
                                            // sum = (val_minus_act / act1).toString()+" %"
                                            if(isNaN(value)) {
                                                value = parseFloat(tbl.cell(rowIDTotal, indices[i] - 2).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                            }
                                            if(isNaN(val_minus_act)) {
                                                val_minus_act = parseFloat(tbl.cell(rowIDTotal, indices[i] - no_of_per_cols).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                            }
        
                                            var act1 = value - val_minus_act
        
                                            if(value == 0 && act1 == 0) {
                                                sum = "-"
                                            } else if(value == 0) {
                                                sum = "-100%"
                                            } else if (act1 == 0) {
                                                sum = "100%";
                                            } else {
                                                sum = (val_minus_act / act1 * 100).toString()+" %"
                                            }
                                            // sum += parseFloat(d[j].replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                        }
                                    } else {
                                        if(!isNaN(parseFloat(d[j].replace(/,{1,}/g,"")))) {
                                            sum += parseFloat(d[j].replace(/,{1,}/g,""))
                                        }
                                    }
                                } else {
                                    if(!isNaN(parseFloat(d[j]))) {
                                        sum += parseFloat(d[j])
                                    }
                                }
                            }
                        }
                        // console.log(d,"<<<<",sum)
                        var colorFlag = false;
                        if(!isNaN(sum)){
                            sum = parseFloat(sum).toFixed(no_of_decimalPlaces)
                        } else {
                            sum = parseFloat(sum).toFixed(no_of_decimalPlaces).toString()+"%"
                        }

                        if(sum >= 0 || sum >= "0") {
                            colorFlag = true;
                        }

                        ////// ------------------ Number Formatting Starts --------------------------
                        var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: no_of_decimalPlaces_M});
                        
                        if(DO_MT["Current_Scale"] == "K") {
                            nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: no_of_decimalPlaces_K});
                            if(sum.includes("%")) {
                                sum = parseFloat(sum.split("%")[0]).toFixed(no_of_decimalPlaces_K) + "%"
                            } else {
                                sum = parseFloat(sum).toFixed(no_of_decimalPlaces_K)
                            }
                        }
                        
                        var count = nFormat.format(sum);

                        if(isNaN(sum)) {
                            sum = sum.split("%")[0];
                            count = nFormat.format(sum) + "%";
                        }

                        if(fyCols.includes(i)) {
                            count = nFormat.format(Math.round(parseFloat(count.split(".")[0].toString().replace(/,{1,}/g,"")+"."+count.split(".")[1]))).split(".")[0];
                        }

                        /////////// to be removed
                        if(no_of_decimalPlaces == 0 || no_of_decimalPlaces == "0") {
                            var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: no_of_decimalPlaces});
                            if(count.includes("%")) {
                                count = nFormat.format(Math.round(parseFloat(count.split(".")[0].toString().replace(/,{1,}/g,"")+"."+count.split(".")[1]))).split(".")[0].toString() + "%";
                            } else {
                                count = nFormat.format(Math.round(parseFloat(count.split(".")[0].toString().replace(/,{1,}/g,"")+"."+count.split(".")[1]))).split(".")[0];
                            }
                        }
                        ////// ------------------ Number Formatting Ends ----------------------------
                        
                        var rowIDTotal = tbl.rows()[0][0];
                        var node = tbl.cell(rowIDTotal, i).data(count).node()

                        // if(!numericCols.includes(i) && updateFrom != i) {
                        //     if(colorFlag) {
                        //         node.style.color = "#2D7230";
                        //     } else {
                        //         node.style.color = "#A92626";
                        //     }
                        // }
                        // var colorFlag = false;
                        // if(!isNaN(sum)){
                        //     sum = parseFloat(sum).toFixed(no_of_decimalPlaces)
                        //     if(sum > "0" || sum > 0) {
                        //         colorFlag = true;
                        //     }
                        // } else {
                        //     if(sum > "0" || sum > 0) {
                        //         colorFlag = true;
                        //     }
                        //     sum = parseFloat(sum).toFixed(no_of_decimalPlaces).toString()+"%";
                        // }
                        // var rowIDTotal = tbl.rows()[0][0];
                        // var node = tbl.cell(rowIDTotal, i).data(sum).node();

                        // if(!numericCols.includes(i)) {
                        //     if(!colorFlag) {
                        //         node.style.color = "#A92626";
                        //     } else {
                        //         node.style.color = "#2D7230";
                        //     }
                        // }
                        ////// =============================== Top-Most Total Update Ends ====================================
                        ///  -----------------------------------------------------------------------------------------------
                        //// =============================== Subset Group Total Update Starts ==============================
                       
                        // var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: no_of_decimalPlaces_M});
                        // var count = undefined;
    
                        // if(DO_MT["Current_Scale"] == "K") {
                        //     nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: no_of_decimalPlaces_K});
                        // }
 
                        ///// -------------------- For Non % Cols Starts ------------------------------
                        // var col_id = tbl.column(i)[0][0];
                        // if(table_cols[col_id].className != "numericColsCSS perColCSS") {
                        //     var subsetSum = 0;

                        //     for(var idx = 0; idx < subsetChildren.length; idx++) {
                        //         var dc = tbl.cell(subsetChildren[idx], i).data();
                        //         if(!isNaN(dc)) {
                        //             subsetSum += parseFloat(dc);
                        //         } else {
                        //             subsetSum += parseFloat(dc.replace(/,{1,}/g,""));
                        //         }
                        //     }
                                
                        //     count = nFormat.format(subsetSum);
    
                        //     if(fyCols.includes(i) && !isNaN(subsetSum)) {
                        //         count = nFormat.format(Math.round(parseFloat(count.split(".")[0].toString().replace(/,{1,}/g,"")+"."+count.split(".")[1]))).split(".")[0];
                        //     }
    
                        //     if(isNaN(subsetSum)) {
                        //         count = "-"
                        //     }
    
                        //     tbl.cell(parseInt(parentID), i).data(count)
                        // }
                        ///// -------------------- For Non % Cols Ends ------------------------------
                        ///// -------------------- For % Cols Starts --------------------------------
                        // else {
                        //     var subsetSum = 0;

                        //     var value = tbl.cell(parentID, i - 2).data();
                        //     var val_minus_act = tbl.cell(parentID, i - 1).data()
    
                        //     if(isNaN(value)) {
                        //         value = parseFloat(tbl.cell(parentID, i - 2).data().replace(/,{1,}/g,""))
                        //     }
                        //     if(isNaN(val_minus_act)) {
                        //         val_minus_act = parseFloat(tbl.cell(parentID, i - 1).data().replace(/,{1,}/g,""))
                        //     }
    
                        //     var act1 = value - val_minus_act
    
                        //     if(value == 0 && act1 == 0) {
                        //         subsetSum = "-"
                        //     } else if(value == 0) {
                        //         subsetSum = -100
                        //     } else if (act1 == 0) {
                        //         subsetSum = 100;
                        //     } else {
                        //         subsetSum = Math.round(parseFloat(val_minus_act / act1 * 100) * 10) / 10;
                        //     }
    
                        //     if(DO_MT["Current_Scale"] == "K") {
                        //         subsetSum = parseFloat(subsetSum).toFixed(no_of_decimalPlaces_K);
                        //     }

                        //     count = nFormat.format(subsetSum);
    
                        //     if(subsetSum == "-" || isNaN(subsetSum)) {
                        //         count = "-"
                        //     }
    
                        //     idx++;
    
                        //     var node = tbl.cell(parseInt(parentID), i).data(count.toString()+"%").node()
    
                        //     if(count >= 0 || count >= "0") {
                        //         node.style.color = "#2D7230";
                        //     } else {
                        //         node.style.color = "#A92626";
                        //     }
                        // }
                        ///// -------------------- For % Cols Ends ----------------------------------
                        
                        //// =============================== Subset Group Total Update Ends ================================
                    }
                    

                    // var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: no_of_decimalPlaces});
                    // var count = undefined;

                   
                }

                function updateRow_M(state, no_of_dimens, no_of_mes, no_of_excludes, identifer, sliceFrom, changeLength) 
                {
                    var selectData = tbl.row('.selected').data()
                    var ROW_ID = tbl.row('.selected')[0][0];
                    // selectData.splice(hMap[0] + 1, 1, ...masterRows[ROW_ID].slice(hMap[0] + 1, (hMap[0] + 1) + no_of_mes))
                    // console.log(selectData, sliceFrom)


                    // console.log("UPDATE - ROW -->",selectData)
                    // @---
                    // var row_updated_arr = selectData.slice(0, no_of_dimens - no_of_excludes + no_of_mes + 1)
                    var row_updated_arr = selectData.slice(0, changeLength + 3)///sliceFrom + 1

                    // console.log("ROW UPDATED INITIALs - ",row_updated_arr)

                    state.getElementsByTagName('option')[state.options.selectedIndex].setAttribute('selected', 'selected')
                    // console.log("State Changed", state)

                    var selOptID = state.getElementsByTagName('option')[state.options.selectedIndex].id
                    // var selOptVal = JSON.parse(state.getElementsByTagName('option')[state.options.selectedIndex].value)
                    // var selOptVal = fixRowsObj[identifer]
                    // console.log(state)

                    var selOptVal = [];

                    // if(DO_MT["Current_Scale"] == "K") {
                        selOptVal = fixRowsObj[identifer];
                    // } else {
                    //     selOptVal = fixRowsObj["ScaledData"][identifer];
                    // }
                    // console.log(state)

                    // let sid = state.classList[1].split("row_level_select_")[1];
                    // DO_MT["DRP"][tbl.row('.selected').index()][sid] = selOptID;

                    // @ ---
                    // var sliced = selOptVal.slice(no_of_dimens - no_of_excludes + no_of_mes, ), data = {};
                    // console.log(selOptVal)
                    var sliced = selOptVal.slice(sliceFrom, ), data = {};
                    // console.log(sliced)


                    // ----------------------- Handling base case for WHAT-IF column is updated first --------- 
                    if(is_col_updated && selOptID == 0) {
                        for(var k = 1, mr_k = 0; k <= no_of_mes; k++) {
                            sliced[k] = masterRows[ROW_ID].slice(hMap[0] + 1, (hMap[0] + 1) + no_of_mes)[mr_k];
                            mr_k++;
                        }
                    }
                    // ----------------------------------------------------------------------------------------

                    // console.log("SLICED ---- ", sliced)
                    for(var i = 1, index = 0; i < sliced.length; i++) {
                        data[index] = sliced.slice(i, i + changeLength)
                        i += changeLength
                        index += 1
                    }
                    // console.log("0000",data, data[selOptID])

                    var len = row_updated_arr.length;
                    row_updated_arr = row_updated_arr.concat(selectData.slice(len, ));

                    row_updated_arr[len + parseInt(state.id)] = state

                    var sliceLen = len + parseInt(state.id) + 1
                    
                    var dataCopy  = Array.from(data[selOptID]);
                    // console.log("DATA", dataCopy)
                    for(var i = sliceLen, idx = 0; i < sliceLen + changeLength; i++) {
                        row_updated_arr[i] = dataCopy[idx]
                        idx += 1;
                    }

                    // console.log(row_updated_arr)
                    tbl.row('.selected').data(row_updated_arr)
                    // console.log(tbl.columns('.perColCSS'))

                    var updateFrom = sliceLen;
                    // if(parseInt(state.id) == 0) {
                    //     updateFrom = changeLength + 3 + 1;
                    // } else {
                    //     updateFrom = parseInt(state.id) + 2 + 1;
                    // }

                    // var updateFrom = parseInt(sliceFrom)  // length of fixed columns (till base scenario)
                    //                 + parseInt(state.id) // selection id present at column
                    //                 + 1;  // to avoid selection column in count
                    if(showTotalonRowUpdateFlag) {
                        state.style.backgroundColor="#C4DBEE";
                        state.style.border = "2px solid #0460A9";
                        state.style.color="#2C2C2C";
                        updateTotalOnRowUpdate(updateFrom, changeLength, ROW_ID);
                    }
                }

                window.updateRow_M = updateRow_M

                var obj = Object.fromEntries(this._colOrder.slice().map(key => [key, []]));
                // var masterObj = {};
                var scenarioObj = Object.fromEntries(this._scenarioOrder.slice().map(key => [key, structuredClone(obj)]));
                scenarioObj["DropDownFieldName"] = new Set();
                // console.log(scenarioObj)
                // var fixRows = this._resultSet[i].slice(0, fixedScenarioAt);

var end = performance.now();
var time = end - start;
console.log((Math.round(time/1000, 2)).toString()+"s to load..."+"Table Update Functions -- Render_MT took approx : ") 
var start = performance.now();

                for(var i = 0, prev_key = "", seqID = 0, scenarioMissing = false; i < this._resultSet.length;) {

                    var key = this._resultSet[i].slice(0, this._dimensions.indexOf(this._dateColName)).join("_#_");
                    
                    if(i==0) {prev_key = key.substring(0, )}

                    var tempKey = key.substring(0, );

                    while(JSON.stringify(key) == JSON.stringify(tempKey)) {
                        // console.log(this._resultSet[i])
                        if(this._resultSet[i] == undefined) {
                            break;
                        }
                        tempKey = this._resultSet[i].slice(0, this._dimensions.indexOf(this._dateColName)).join("_#_");

                        if(JSON.stringify(key) != JSON.stringify(tempKey)) {
                            break;
                        }

                        var masterKey = tempKey.split("_#_").slice(0, fixedScenarioAt);
                        var scene = this._resultSet[i][fixedScenarioAt];
                        

                        if(masterObj[masterKey.join("_#_")] == undefined) {
                            masterObj[masterKey.join("_#_")] = structuredClone(scenarioObj);
                            masterObj[masterKey.join("_#_")]["DropDownSelected"] = new Set()
                        }

                        if(masterObj[masterKey.join("_#_")][scene] != undefined){
                            masterObj[masterKey.join("_#_")][scene][this._resultSet[i].slice(this._dimensions.length - 1, )[0]] = this._resultSet[i].slice(this._dimensions.indexOf(this._dateColName), )
                            // console.log(this._resultSet[i].slice(this._dimensions.indexOf(this._dateColName), ),"---")
                            masterObj[masterKey.join("_#_")]["DropDownFieldName"].add(this._resultSet[i][this._dimensions.indexOf(this._dateColName)]);
                        }

                        if(this._dropdownsSelected.includes(this._resultSet[i][fixedScenarioAt].toUpperCase())) {
                            masterObj[masterKey.join("_#_")]["DropDownSelected"].add(this._resultSet[i][this._dimensions.indexOf(this._dateColName)]);
                        }
                        // console.log(structuredClone(masterObj))
                        // console.log(this._resultSet[i])

                        i += 1;
                    }

                    prev_key = key;
                }

                // console.log("---", structuredClone(masterObj))

var end = performance.now();
var time = end - start;
console.log((Math.round(time/1000, 2)).toString()+"s to load..."+"Table Master Object creation -- Render_MT took approx : ") 
var start = performance.now();

                // Final Row Assignment
                for(const [k, v] of Object.entries(masterObj)) {
                    // console.log(k)
                    var finalRow = [];
                    
                    // Pushing Dimensions to finalRow.
                    var dim = k.split("_#_");
                    for(var f = 0; f < dim.length; f++) {
                        finalRow.push(dim[f])
                    }

                    // console.log(v);
                    finalRow.push(Array.from(v["DropDownFieldName"])[0])

                    // Pushing Measures to finalRow

                    for(const v1 in v) {
                        if(v1 != "DropDownFieldName") {
                            // finalRow.push(Array.from(v["DropDownFieldName"])[0])
                            var f = false;
                            ///// checking if whole scenario is empty or not ----------------------------------
                            var checkEmpty = true;
                            for(var g = 0; g < this._colOrder.length; g++) {
                                if(masterObj[k][v1][this._colOrder[g]] && masterObj[k][v1][this._colOrder[g]].length > 0) {
                                    checkEmpty = false;
                                }
                            }
                            ///// -----------------------------------------------------------------------------

                            for(const [km, vm] of Object.entries(masterObj[k][v1])) {
                                
                                if(!checkEmpty) {
                                    if(vm.length == 0) {
                                        for(var h = 0; h < this._measureOrder.length; h++) {
                                            finalRow.push("-")
                                        }
                                    } else {
                                        if(masterObj[k]["DropDownFieldName"].size > 1) {
                                            for(var h = 2; h < 2 + this._measureOrder.length; h++) {
                                                if(vm[h] != undefined) {
                                                    finalRow.push(vm[h])
                                                } else {
                                                    finalRow.push("-")
                                                }
                                            }
                                        } else {
                                            f = true;
                                            for(var h = 2; h < 2 + this._measureOrder.length; h++) {
                                                if(vm[h] != undefined) {
                                                    finalRow.push(vm[h])
                                                }
                                            }
                                        }
                                    }
                                }
                                                               
                            }
                        } else {
                            // dropdown data
                        }
                        if(finalRow[finalRow.length - 1] != "--Selection--") {
                            finalRow.push("--Selection--")
                        }
                    }

                    // console.log(finalRow)
                    finalRow.pop()
                    // var len = finalRow.slice().length;
                    // var temp = finalRow.slice();
                    // finalRow.push("--Variance--")
                    finalRow = finalRow.slice(0, table_cols.length);
                    // fixRowsObj[k] = finalRow.slice()


                    // console.log("--------->>>>>>>", finalRow)
                    var flag = false;

                    //////// if only base is coming ----------- 
                    var emptyFinal = finalRow.slice(0, 2);
                    if(masterObj[k]["DropDownFieldName"].size == 1) {
                        var repeatBase = finalRow.slice(this._dimensions.indexOf(this._dateColName) - 1, ((this._colOrder.length + 1) * this._measureOrder.length));
                        for(var l = 0, lcl_cnt = 0; l < table_cols.length; l++) {

                            if(emptyFinal.length == table_cols.length) {
                                break;
                            }

                            if(lcl_cnt >= repeatBase.length) {
                                lcl_cnt = 0;
                            }

                            emptyFinal.push(repeatBase[lcl_cnt])

                            lcl_cnt++;
                        }
                        flag = true;
                        finalRow = emptyFinal.slice();
                    } 
                    else if(finalRow.length < table_cols.length) {
                        for(var l = finalRow.length; l < table_cols.length; l++) {
                            finalRow.push("-")
                        }
                    }
                   

                    // Adding Dropdowns to finalRow
                    var varianceCnt = this._measureOrder.length
                    var sliceLen = (this._colOrder.length * varianceCnt) + fixedScenarioAt + 1;
                    var sliced = finalRow.slice(sliceLen)
                    // console.log("---------", sliced)
                    var dropdownIDs = new Set();
                    var selectionCnt = 0, cnt = 0;
                    var flag_sel = sliced[0];
                    var dropdownArr = Array.from(masterObj[k]["DropDownFieldName"]).slice();
                    var master_dropdownArr = new Set();
                    var dropdownSel = Array.from(masterObj[k]["DropDownSelected"]).slice();
                    var caughtDropDownsAt = new Set();
                    var isEmptyUpdated = false;
                    // var dropdownSel = Array.from(masterObj[k]["DropDownSelected"]).slice();
                    // console.log(dropdownArr);


var end = performance.now();
var time = end - start;
console.log((Math.round(time/1000, 2)).toString()+"s to load..."+"Final Row Assignment -- Render_MT took approx : ") 
var start = performance.now();


                    for(var kk = 0, optIdx = 0; kk < sliced.length; kk++) {

                        if(cnt < 3) {
                            dropdownIDs.add(kk+"_"+this._dataTableObj.rows().count());
                        }

                        if(selectionCnt >= dropdownArr.length) {
                            if(flag) {
                                sliced[kk] = `<select id='${kk}' class='row_level_select row_level_select_${kk}_${this._dataTableObj.rows().count()}' onchange='updateRow_M(this, ${this._dimensions.length}, ${this._measureOrder.length}, ${this._excludeHeaders.length}, "${finalRow[0]}_#_${finalRow[1]}", ${fixedScenarioAt}, ${this._colOrder.length * this._measureOrder.length})'><option selected>${flag_sel}</option></select>`;
                            } else {
                                var emptySelect = `<select id='${kk}' class='row_level_select row_level_select_${kk}_${this._dataTableObj.rows().count()}' onchange='updateRow_M(this, ${this._dimensions.length}, ${this._measureOrder.length}, ${this._excludeHeaders.length}, "${finalRow[0]}_#_${finalRow[1]}", ${fixedScenarioAt}, ${this._colOrder.length * this._measureOrder.length})'>`;
                                // fixedScenarioAt + 1 + (this._colOrder.length * this._measureOrder.length)
                                // var emptyOption = `<option selected disabled></option>`;
                                var emptyOption = "";
                                for(var p = 0; p < dropdownArr.length; p++) {
                                    if(dropdownSel.includes(dropdownArr[p])) {
                                        caughtDropDownsAt.add(p)
                                    } else {
                                        master_dropdownArr.add(p);
                                    }
                                    if(optIdx == p) {
                                        emptyOption += `<option id='${p}' selected>${dropdownArr[p]}</option>`
                                    } else {
                                        emptyOption += `<option id='${p}' >${dropdownArr[p]}</option>`
                                    }
                                }
                                emptySelect += emptyOption + `</select>`;
                                sliced[kk] = emptySelect;
                            }
                        } else {
                            var select_html = `<select id='${kk}' class='row_level_select row_level_select_${kk}_${this._dataTableObj.rows().count()}' onchange='updateRow_M(this, ${this._dimensions.length}, ${this._measureOrder.length}, ${this._excludeHeaders.length}, "${finalRow[0]}_#_${finalRow[1]}", ${fixedScenarioAt}, ${this._colOrder.length * this._measureOrder.length})'>`;
                            var options = "";
                            if(sliced[kk] == "EMPTY_DROPDOWN" && !isEmptyUpdated) {
                                dropdownArr.unshift("");
                                dropdownSel.unshift("");
                                isEmptyUpdated = true;
                                // options += "<option selected disabled></option>";
                            }
                            for(var p = 0; p < dropdownArr.length; p++) {
                                if(dropdownSel.includes(dropdownArr[p])) {
                                    caughtDropDownsAt.add(p)
                                } else {
                                    master_dropdownArr.add(p);
                                }
                                if(optIdx == p) {
                                    options += `<option id='${p}' selected>${dropdownArr[p]}</option>`
                                } else {
                                    options += `<option id='${p}' >${dropdownArr[p]}</option>`
                                }
                            }
                            select_html += options + `</select>`;
                            sliced[kk] = select_html;
                        }
                      
                        // console.log("!!!!",sliced[kk])
                        cnt++;
                        kk += this._colOrder.length * varianceCnt; // 2 bcz of variance ... 
                        selectionCnt++;
                        optIdx += 1;
                    }
                    // for(var kk = 0, optIdx = 0; kk < len; kk++) {
                    //     var select_html = `<select id='${kk}' class='row_level_select' onchange='updateRow(this, ${this._dimensions.length}, ${this._measureOrder.length}, ${this._excludeHeaders.length}, "${finalRow[0]}_#_${finalRow[1]}", ${fixedScenarioAt + 1 + this._colOrder.length}, ${this._colOrder.length})'>`;
                    //     var options = "";
                    //     for(var p = 0; p < dropdownArr.length; p++) {
                    //         if(optIdx == p) {
                    //             options += `<option id='${p}' selected>${dropdownArr[p]}</option>`
                    //         } else {
                    //             options += `<option id='${p}' >${dropdownArr[p]}</option>`
                    //         }
                    //     }
                    //     select_html += options + `</select>`;
                    //     // console.log("!!!!",sliced[kk])
                    //     sliced[kk] = select_html;
                    //     kk += this._colOrder.length;
                    //     optIdx += 1;
                    // }
                    // console.log(sliced)
                    finalRow = finalRow.slice(0, sliceLen).concat(sliced);

var end = performance.now();
var time = end - start;
console.log((Math.round(time/1000, 2)).toString()+"s to load..."+"Dropdown Plotting Array -- Render_MT took approx : ") 
var start = performance.now();

                    /////// creating scaled data copy starts ------------------------ 
                    var K_DataMT = finalRow.slice();
                    var M_DataMT = finalRow.slice();
                    var numCols_MT = this._dataTableObj.columns('.numericColsCSS.numCol')[0];
                    var vsPyCols_MT = this._dataTableObj.columns('.varCol')[0];
                    var perCols_MT = this._dataTableObj.columns('.numericColsCSS.perColCSS')[0];
    
                    var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: this.no_of_decimalPlaces_M});
                    var nFormat_K = new Intl.NumberFormat('en-US', {minimumFractionDigits: this.no_of_decimalPlaces_K});
    
    
                    if(no_of_decimalPlaces == 0 || no_of_decimalPlaces == "0") {
                         for(var ss = 0; ss < M_DataMT.length; ss++) {
                            if(numCols_MT.includes(ss) || vsPyCols_MT.includes(ss)) {
                                //////////
                                // if(!isNaN(parseFloat(M_DataMT[ss].toString()))) {
                                //     if(M_DataMT[ss].toString().includes(".")) {
                                //         M_DataMT[ss] = nFormat.format(parseFloat(M_DataMT[ss].toString().replace(/,{1,}/g,"") / 1000).toFixed(this.no_of_decimalPlaces_M))
                                //     }
                                // }
        
                               /////////
                               if(!isNaN(parseFloat(K_DataMT[ss].toString()))) {
                                   if(K_DataMT[ss].toString().includes(".")) {
                                       K_DataMT[ss] = nFormat_K.format(parseFloat(K_DataMT[ss].toString().replace(/,{1,}/g,"")).toFixed(no_of_decimalPlaces))
                                   }
                               }
                            }
                            else if(perCols_MT.includes(ss)) {
                                /////////
                                // if(!isNaN(parseFloat(M_DataMT[ss].toString().split("%")[0]).toFixed(0))) {
                                //     M_DataMT[ss] = nFormat.format(parseFloat(M_DataMT[ss].toString().split("%")[0]).toFixed(this.no_of_decimalPlaces_M)).toString()+"%";
                                // }
        
                                //////
                                if(!isNaN(parseFloat(K_DataMT[ss].toString().split("%")[0]).toFixed(0))) {
                                    K_DataMT[ss] = nFormat_K.format(parseFloat(K_DataMT[ss].toString().split("%")[0]).toFixed(no_of_decimalPlaces)).toString()+"%";
                                }
                            }
                        }
                        finalRow = K_DataMT.slice()
                    }
                    // for(var ss = 0; ss < M_DataMT.length; ss++) {
                    //     if(numCols_MT.includes(ss) || vsPyCols_MT.includes(ss)) {
                    //         //////////
                    //         // if(!isNaN(parseFloat(M_DataMT[ss].toString()))) {
                    //         //     if(M_DataMT[ss].toString().includes(".")) {
                    //         //         M_DataMT[ss] = nFormat.format(parseFloat(M_DataMT[ss].toString().replace(/,{1,}/g,"") / 1000).toFixed(this.no_of_decimalPlaces_M))
                    //         //     }
                    //         // }
    
                    //        /////////
                    //     //    if(!isNaN(parseFloat(K_DataMT[ss].toString()))) {
                    //     //        if(K_DataMT[ss].toString().includes(".")) {
                    //     //            K_DataMT[ss] = nFormat_K.format(parseFloat(K_DataMT[ss].toString().replace(/,{1,}/g,"")).toFixed(this.no_of_decimalPlaces_K))
                    //     //        }
                    //     //    }
                    //     }
                    //     else if(perCols_MT.includes(ss)) {
                    //         /////////
                    //         // if(!isNaN(parseFloat(M_DataMT[ss].toString().split("%")[0]).toFixed(0))) {
                    //         //     M_DataMT[ss] = nFormat.format(parseFloat(M_DataMT[ss].toString().split("%")[0]).toFixed(this.no_of_decimalPlaces_M)).toString()+"%";
                    //         // }
     
                    //         ////////
                    //         // if(!isNaN(parseFloat(K_DataMT[ss].toString().split("%")[0]).toFixed(0))) {
                    //         //     K_DataMT[ss] = nFormat_K.format(parseFloat(K_DataMT[ss].toString().split("%")[0]).toFixed(this.no_of_decimalPlaces_K)).toString()+"%";
                    //         // }
                    //     }
                    // }
                    // finalRow = K_DataMT.slice()
                    fixRowsObj[k] = finalRow.slice()
    
                    // if(fixRowsObj["ScaledData"] == undefined) {
                    //     fixRowsObj["ScaledData"] = {}
                    // }
    
                    // fixRowsObj["ScaledData"][k] = M_DataMT.slice()
                    /////// creating scaled data copy ends ------------------------ 
                     

var end = performance.now();
var time = end - start;
console.log((Math.round(time/1000, 2)).toString()+"s to load..."+"Scaled Object Creation -- Render_MT took approx : ") 
var start = performance.now();


                    ////// ================================ Group by Row Starts =========================================
                    if(!Array.from(groupBy).includes(finalRow[0])) {
                        groupBy.add(finalRow[0])
                        templateGroupTotal[1] = finalRow[0]
                        var node = tbl.row.add(templateGroupTotal.slice()).draw(false).node()
                        node.classList.add("group")
                    }
                    ////// ================================ Group by Row Ends ============================================

                    tbl.row.add(finalRow).draw(false);
                    var rid = tbl.rows().indexes().toArray()[tbl.rows().indexes().toArray().length - 1];

                    if(!flag){
                        var cga = Array.from(caughtDropDownsAt);
                        master_dropdownArr = Array.from(master_dropdownArr).slice(1,);

                        if(cga.length < 3) {
                            for(var b = 0; b < master_dropdownArr.length; b++) {
                                if(cga.length >= 3) {
                                    break;
                                }
                                cga.push(master_dropdownArr[b]);
                            }
                            if(cga.length < 3) {
                                for(var b = cga.length; b < 3; b++) {
                                    cga.push(0);
                                }
                            }
                        }

                        var drp = Array.from(dropdownIDs);

                        if(DO_MT["DRP"] == undefined) {
                            DO_MT["DRP"] = {}
                        }

                        if(DO_MT["DRP"][rid] == undefined) {
                            DO_MT["DRP"][rid] = {}
                        }

                        DO_MT["DRP"][rid][drp[0]] = cga[0];
                        DO_MT["DRP"][rid][drp[1]] = cga[1];
                        DO_MT["DRP"][rid][drp[2]] = cga[2];

                        this.setSelectorsSelectedValue(dropdownIDs, cga, "MT");
                    }
                    // tbl.row.child(finalRow)
                    // console.log(finalRow);
                }

var end = performance.now();
var time = end - start;
console.log((Math.round(time/1000, 2)).toString()+"s to load..."+"Set Selector Selected Value -- Render_MT took approx : ") 
var start = performance.now();

                this.applyStyling_MT();

var end = performance.now();
var time = end - start;
console.log((Math.round(time/1000, 2)).toString()+"s to load..."+"Set Styling -- Render_MT took approx : ") 
var start = performance.now();

                // Styling Block Starts
                if (this._tableCSS.length > 1) {
                    // console.log(this._tableCSS)
                    this._table.style.cssText = this._tableCSS
                }

                if (this._rowCSS.length > 1) {
                    // console.log(this._rowCSS)
                    document
                        .querySelector(this._widgetID+'v1-custom-table')
                        .shadowRoot.querySelectorAll('td')
                        .forEach(el => (el.style.cssText = this._rowCSS))
                    document
                        .querySelector(this._widgetID+'v1-custom-table')
                        .shadowRoot.querySelectorAll('th')
                        .forEach(el => (el.style.cssText = this._rowCSS))
                }

                if (this._colCSS.length > 1) {
                    // console.log(this._colCSS)
                    document
                        .querySelector(this._widgetID+'v1-custom-table')
                        .shadowRoot.querySelector('style').innerText += this._colCSS
                }

                
                const list = document.querySelector(this._widgetID+"v1-custom-table").shadowRoot.querySelector("#example > thead");

                for(var i = 0; i < list.children.length - 1; i++) {
                    list.removeChild(list.children[i]);
                }
                document.querySelector(this._widgetID+"v1-custom-table").shadowRoot.querySelector("#example > thead").insertAdjacentHTML('afterBegin', topHeader);

                // Styling Block Ends here
                // this._dotsLoader.style.visibility = "hidden";
                this._table.style.visibility = "visible";
                this._root.style.display = "block";

                showTotalonRowUpdateFlag = true;

var end = performance.now();
var time = end - start;
console.log((Math.round(time/1000, 2)).toString()+"s to load..."+"CSS Styling -- Render_MT took approx : ") 
                
                this.showTotal("MT");
                // this.applyScaling_MT("K")

            }

            // ==========================================================================================================================
            // ---------------------------------------------------------- 5-Year -------------------------------------------------------
            // ==========================================================================================================================

            setResultSet_5Y(rs, col_to_row = -1, colspan_to_top_headers, lcl_no_of_decimalPlaces) {

                // this.reinitialize_changedProperties_ClassVariables();
                var start = performance.now();

                if(this._table) {
                    this._table.remove();
                    this._root.innerHTML = `
                     <table id="example" class="table" style="visibility:hidden;">
                        <thead>
                        </thead>
                        <tbody></tbody>
                    </table>    
                    `
                    this._table = this._shadowRoot.getElementById('example')
                    // console.log( document.querySelector("#"+this["parentNode"].id+" > v1-custom-table").shadowRoot.querySelector("#example > colgroup:nth-child(2)"))
                    // document.querySelector(this._widgetID+"v1-custom-table").shadowRoot.querySelector("#example > colgroup:nth-child(2)").remove();
                }

                // this._dotsLoader.style.visibility = "visible";
                // this._table.style.visibility = "hidden";
                // this._root.style.display = "inline-grid";

                this._resultSet = [];
                this._nonNumericColumnIndices_UnitConversion = new Set();
                this._masterRows_UnitConversion = [];
                this._masterRows_UnitConversion_Flag = false;
                // this._selectionColumnsCount = selCnt
                this._col_to_row = col_to_row; // Row Grouping

                var headers = this._headers
                // console.log(headers);
                console.log(this._dropdownsSelected)

                var remove = headers["Exclude"].join(",")+",@MeasureDimension".split(",");

                this._dimensions = Array.from(new Set(Object.keys(rs[0]).filter((k) => !remove.includes(k))))
                this._measures = new Set()

                this._colOrder = headers["COL_NAME_ORDER"];
                this._scenarioOrder = headers["SCENARIO_ORDER"];
                this._fixedScenario = headers["FIXED_SCENARIO"];
                this._measureOrder = headers["@MeasureDimension"]
                this._excludeHeaders = headers['Exclude']
                // this._dateColName = selColumnName; //selectionColumn
                // this._hideExtraVisibleColumnFromIndex = hideExtraVisibleColumnFromIndex;
                // this._hide_Individual_ExtraVisibleColumnOfIndices = hide_Individual_ExtraVisibleColumnOfIndices;
                this._colspan_EmptyCase = parseInt(colspan_to_top_headers["EmptyCase"]);
                this._colspan_BaseCase = parseInt(colspan_to_top_headers["BaseCase"]);
                this._colspan_RestCase = parseInt(colspan_to_top_headers["RestCase"]);
               
                // this._customHeaderNames = customHeaderNames;

                console.log("Col-Orders",this._colOrder)
                console.log("Scenario-Orders",this._scenarioOrder)
                console.log("Fixed Scenarios",this._fixedScenario)
                console.log("Measure Order", this._measureOrder)
                console.log("Dimensions", this._dimensions)
                console.log("Exclude Headers",this._excludeHeaders)

                no_of_decimalPlaces = lcl_no_of_decimalPlaces;
                no_of_decimalPlaces_K = this.no_of_decimalPlaces_K;
                no_of_decimalPlaces_M = this.no_of_decimalPlaces_M;


                for(var i = 0; i < rs.length;) {
                    var tempArr = [], dims = new Set();
                    for(var k = 0; k < this._dimensions.length; k++) {
                        dims.add(rs[i][this._dimensions[k]].description);
                        this._nonNumericColumnIndices_UnitConversion.add(k);
                    }
                    for(var j = 0; j < this._measureOrder.length; j++) {
                        if(JSON.stringify(this._measureOrder[j]) == JSON.stringify(rs[i]["@MeasureDimension"].description) && rs[i]["@MeasureDimension"].formattedValue != undefined) {
                            if(rs[i]["@MeasureDimension"].formattedValue.includes("%")) {
                                var v = rs[i]["@MeasureDimension"].formattedValue;
                                if(v.includes("+")) {
                                    v = v.split("+")[1];
                                }
                                tempArr.push(v)
                            } else {
                                tempArr.push(parseFloat(rs[i]["@MeasureDimension"].formattedValue.replace(/,{1,}/g,"")).toFixed(no_of_decimalPlaces))
                            }
                        } else {
                            while(JSON.stringify(this._measureOrder[j]) != JSON.stringify(rs[i]["@MeasureDimension"].description)) {
                                tempArr.push("-")
                                j+=1;
                                if(j > this._measureOrder.length) {
                                    console.log("Hit to Infinite Loop Case...")
                                    return;
                                }
                            }
                            if(JSON.stringify(this._measureOrder[j]) == JSON.stringify(rs[i]["@MeasureDimension"].description) && rs[i]["@MeasureDimension"].formattedValue != undefined) {
                                if(rs[i]["@MeasureDimension"].formattedValue.includes("%")) {
                                    var v = rs[i]["@MeasureDimension"].formattedValue;
                                    if(v.includes("+")) {
                                        v = v.split("+")[1];
                                    }
                                    tempArr.push(parseFloat(v))
                                } else {
                                    tempArr.push(parseFloat(rs[i]["@MeasureDimension"].formattedValue.replace(/,{1,}/g,"")).toFixed(no_of_decimalPlaces))
                                }
                            }
                        }
                        i++;
                        if(i >= rs.length || tempArr.length > this._measureOrder.length) {
                            break;
                        }
                    }
                    if(i > rs.length) {
                        break;
                    }
                    tempArr.unshift(...Array.from(dims))
                    // console.log(tempArr)
                    this._resultSet.push(tempArr)
                    // console.log(tempArr)
                }

                console.log("-- Result Set --")
                console.log(this._resultSet)
                console.log("----------------")

                // widget_ID_Name[this["widgetName"]] = this["offsetParent"].id;
                // console.log("Mapped Widgets : ",widget_ID_Name);
                var end = performance.now();
                var time = end - start;
                console.log("setResultSet_5Y took approx : "+(Math.round(time/1000, 2)).toString()+"s to load...")

                var start = performance.now();

                this.render_5Y();

                var end = performance.now();
                var time = end - start;
                console.log("Render_5Y took approx : "+(Math.round(time/1000, 2)).toString()+"s to load...")

            }

            applyStyling_5Y() {

                document.querySelector(this._widgetID+"v1-custom-table").shadowRoot.querySelector("style").innerText += `
                tbody, td, tfoot, th, thead, tr {
                    border-color: inherit;
                    border-style: none;
                    border-width: 0;
                }
    
                /* ------------------------- CUSTOM STYLING --------------------------------- */
    
    
                #example > tbody > tr:nth-child(2) > td.truncate {
                    font-weight:bold;
                }
    
                select {
                    padding-top:0%;
                    background-color:#DCE6EF;
                    outline:none;
                }
    
                option {
                    background-color:white;
                    color:black;
                }
                
                select:focus>option:checked {
                    background:#0460A9;
                    color:white;
                    /* selected */
                }
    
                #example th {
                    text-wrap: nowrap;
                    border-bottom: 1px solid #CBCBCB;
                    background-color:#F2F2F2;
                    align-content: center;
                    font-family: Arial;
                    color:black;
                    font-size:14px;
                }
    
                #example > tbody > tr:nth-child(2) {
                    font-weight:bold;
                }
    
                /* ------------------------- TOP MOST - HEADER ROW ------------------------- */
    
                #example .top-header {
                    height:32px;
                    max-height:32px;
                    font-family: Arial;
                    color:black;
                    font-size:14px;
                    font-weight:bold;
                    text-align: center;
                    padding-top:0%!important;
                    padding-bottom:0%!important;
                }
    
                /* ------------------------- BASE CASE ------------------------- */
    
                #example > thead > tr:nth-child(1) > th:nth-child(2) {
                    background-color:#E0E0E0;
                }
    
                /* ------------------------- SCENARIO 1 ------------------------- */
    
                #example > thead > tr:nth-child(1) > th:nth-child(3) {
                    background-color:#D9D9D9;
                }
    
                /* ------------------------- SCENARIO 2 ------------------------- */
    
                #example > thead > tr:nth-child(1) > th:nth-child(4) {
                    background-color:#CBCBCB;
                }
    
                /* ------------------------- SCENARIO 3 ------------------------- */
    
                #example > thead > tr:nth-child(1) > th:nth-child(5) {
                    background-color:#BDBDBD;
                }
    
                /* ------------------------- 2nd MOST HEADER ------------------------- */
                
                #example > thead > tr:nth-child(2) {
                    height:48px; 
                }
    
                /* ------------------------- SCENARIO SELECT ELEMENTS HEADER ------------------------- */
    
                .scenarios {
                    background-color:inherit;
                    font-family: Arial;
                    color:black;
                    font-size:14px;
                    text-align:center;
                    font-weight:bold;
                    height:30px;
                    border:none;
                    cursor: pointer;
                }
    
                /* ------------------------- GROUPED ROW ------------------------- */
    
                #example .group > td {
                    height:32px;
                    padding: 0px 10px!important;
                    align-content: center;
                    font-weight:bold;
                    color: #212121;
                    font-family: Arial;
                    background-color:#E0E0E0!important;
                }

                #example .clTotalRow > td {
                    background-color:#b7d0e621;
                }
    
                /* ------------------------- NORMAL ROW ------------------------- */
    
                #example td {
                    text-wrap:nowrap;
                    background-color:white;
                    height:48px;
                    border-bottom:1px solid #CBCBCB!important;
                    font-family: Arial;
                    font-size:14px;
                    align-content: center;
                }
    
                #example .numericColsCSS,  #example .varCols,  #example .perCols {
                    text-align:right!important;
                }

                #example .numericColsCSS {
                    color:#212121!important;
                }
    
                /* ------------------------- ROW LEVEL SELECT ------------------------- */
    
                #example .row_level_select {
                    font-family: Arial;
                    font-size: 14px;
                    height: 30px;
                    background-color: #DCE6EF;
                    border-radius:4px;
                    border:none;
                    outline:none;
                    cursor: pointer;
                }
     
                /* ------------------------- TRUNCATE ROW LEVEL DATA ------------------------- */
    
                #example .truncate {
                    max-width:130px;
                    padding-left: 2%;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
    
                /* ------------------------- TOP FIXED HEADER SCROLL ------------------------- */
    
                #example > thead {
                    position: sticky;
                    top:0%!important;
                    border-bottom: 1px solid #CBCBCB;
                    background-color: yellow;
                }
    
                #example {
                    position: absolute;
                    width:100%!important;
                    border-collapse: separate;
                }
    
                .mt-2 {
                    margin-top: 0% !important;
                }
    
                /* ------------------------- REMOVE TOP MOST PADDING ------------------------- */
    
                #example_wrapper > div.dt-layout-row.dt-layout-table > div {
                    padding:0%!important;
                }
    
                /* --------------------------- 1ST TOP TOTAL ROW ---------------------------- */
    
                #example > tbody > tr:nth-child(1) > td {
                    font-weight:bold;
                }

                #example > tbody > tr:nth-child(1) {
                    position:sticky!important;
                    top:80px!important;
                }
                
                `;
            }

            async render_5Y() {

                if (!this._resultSet) {
                    return
                }

                DO_5Y = {};

                this._widgetID = "#"+this["parentNode"].id+" > ";
                this._stateShown = "vsPy";
                this._visibleCols = [];

                var table_cols = []

                var col_dimension = this._dimensions;
                var col_measures = this._measureOrder;
                var fixedScenarioAt = col_dimension.indexOf("SCENARIO_NAME")
                console.log("Fixed Scenario At : ", fixedScenarioAt);

                console.log('ResultSet Success')

                col_dimension = col_dimension.slice(0, col_dimension.indexOf("SCENARIO_NAME"))

                var classname_col = "numericColsCSS";

                if(this._colOrder[0] == "FY") {
                    // if(this._colOrder[0] != "FY") {
                    //     col_dimension = col_dimension.concat(this._colOrder)
                    // } 
                    if(Object.keys(this._customHeaderNames).length > 0) {
                         for (var i = 0; i < this._customHeaderNames["DIMEN_NAME"].length; i++) {
                            table_cols.push({
                                title: this._customHeaderNames["DIMEN_NAME"][i]
                            })
                        }
        
                        var classname_col = "";

                        for(var j = 0; j < this._customHeaderNames["MES_NAME"].length; j++) {
                            if(j < 5) {
                                classname_col = "numericColsCSS";
                            } else if (j < 10) {
                                classname_col = "varCols";
                            } else if (j < 15) {
                                classname_col = "perCols";
                            } else {
                                classname_col = "cagrCol";
                            }
                            table_cols.push({
                                title: this._customHeaderNames["MES_NAME"][j],
                                className:classname_col
                            })
                        }
                       
                        for(var i = this._fixedScenario.length; i < this._scenarioOrder.length; i++) {
                            if(this._scenarioOrder[i] != "FY") {
                                table_cols.push({
                                    title: this._customHeaderNames["SCENARIO_NAME"][i],
                                    className:"selColClass"
                                })
                            }
                            for(var j = 0; j < this._customHeaderNames["MES_NAME"].length; j++) {
                                if(j < 5) {
                                    classname_col = "numericColsCSS";
                                } else if (j < 10) {
                                    classname_col = "varCols";
                                } else if (j < 15) {
                                    classname_col = "perCols";
                                } else {
                                    classname_col = "cagrCol";
                                }
                                table_cols.push({
                                    title: this._customHeaderNames["MES_NAME"][j],
                                    className:classname_col
                                })
                            }
                        }
                    } else {
                        for (var i = 0; i < col_dimension.length; i++) {
                            table_cols.push({
                                title: col_dimension[i]
                            })
                        }
        
                        var classname_col = "";

                        for(var j = 0; j < this._measureOrder.length; j++) {
                            if(j < 5) {
                                classname_col = "numericColsCSS";
                            } else if (j < 10) {
                                classname_col = "varCols";
                            } else if (j < 15) {
                                classname_col = "perCols";
                            } else {
                                classname_col = "cagrCol";
                            }
                            table_cols.push({
                                title: col_measures[j],
                                className:classname_col
                            })
                        }
                       
                        for(var i = this._fixedScenario.length; i < this._scenarioOrder.length; i++) {
                            if(this._scenarioOrder[i] != "FY") {
                                table_cols.push({
                                    title: this._scenarioOrder[i],
                                    className:"selColClass"
                                })
                            }
                            for(var j = 0; j < this._measureOrder.length; j++) {
                                if(j < 5) {
                                    classname_col = "numericColsCSS";
                                } else if (j < 10) {
                                    classname_col = "varCols";
                                } else if (j < 15) {
                                    classname_col = "perCols";
                                } else {
                                    classname_col = "cagrCol";
                                }
                                table_cols.push({
                                    title: col_measures[j],
                                    className:classname_col
                                })
                            }
                        }
                    }
                }
               
                // TRIM LOGIC
                console.log('Data Table Columns : ', table_cols)
                this._tableColumnNames = table_cols;

                 //// ------------------------ var cols indices starts ---------------------------------
                 var colorColIndices = new Set();
                 var considerCons = ["perCols", "varCols"];
                 var numColsForDecimal = [];

                 var alignCols = ["numericColsCSS", "perCols", "varCols"]
                 var alignRight = new Set();
                 for(var i = 0; i < this._tableColumnNames.length; i++) {
                     if(considerCons.includes(this._tableColumnNames[i]["className"])) {
                        colorColIndices.add(i);
                     }
                     if(alignCols.includes(this._tableColumnNames[i]["className"])) {
                        alignRight.add(i)
                     }
                    //  if(this._tableColumnNames[i]["className"] == "numericColsCSS" || this._tableColumnNames[i]["className"] == "varCols") {
                    //     numColsForDecimal.push(i);
                    //  }
                 }
                 //// ------------------------ var cols indices ends -----------------------------------

                //// ------------------------ Show Totals on Row Block Starts ---------------------------------
                // var indices = [];
                this._fixedIndices = this._fixedIndices.concat(this._dropdownIndices);
                var templateGroupTotal = ["Total"];

                for(var i = 0; i < this._tableColumnNames.length; i++) {
                    if(this._dropdownIndices.includes(i)) {
                        indices.push(-1);
                    } 
                    else if (!this._fixedIndices.includes(i)) {
                        indices.push(i);
                    }
                    ////// -------------- For subset group total on rowgroup level starts --------------------
                    if(i > 0) {
                        if(this._customHeaderNames["SCENARIO_NAME"].includes(this._tableColumnNames[i].title) || this._tableColumnNames[i].title == this._dateColName) {
                            templateGroupTotal.push("");
                        } else {
                            templateGroupTotal.push("");
                        }
                    }
                    ////// -------------- For subset group total on rowgroup level Ends ----------------------
                }

                this._indices = indices;

                //// ------------------------ Show Totals on Row Block Ends ---------------------------------

                // --------------- Hide Columns STARTS ---------------
                var hideCols = []

                // @--------------- CHANGED UNCOMMENT THIS... ----------------------------------

                for(var i = this._hideExtraVisibleColumnFromIndex; i < table_cols.length; i++) {
                    hideCols.push(i)
                }

                for(var i = 0; i < this._hide_Individual_ExtraVisibleColumnOfIndices.length; i++) {
                    hideCols.push(this._hide_Individual_ExtraVisibleColumnOfIndices[i])
                }

                // --------------- Hide Columns ENDS ---------------

                var groupColumn = this._col_to_row

                var tbl = undefined;
                var groupBy = new Set();

                if (!jQuery().dataTable) {
                    console.log("-------- Datatable not initialized. \nRe-Initialzing Datatable libraries ...  ");
                    await this.loadLibraries();
               }

                if (groupColumn != -1) {

                    hideCols.push(groupColumn);

                    this._dataTableObj = new DataTable(this._table, {
                        layout: {},
                        columns: table_cols,
                        bAutoWidth: false, 
                        columnDefs: [
                            {
                                defaultContent: '-',
                                // targets: hideCols, //_all
                                // targets: groupColumn,
                                targets : "_all",
                               
                                // className: 'dt-body-left'
                            },
                            { 
                                targets:hideCols,  visible: false
                            },
                            { 
                                targets:1, className:"truncate"
                            },
                            {
                                targets:numColsForDecimal,
                                render: function ( data, type, row ) {
                                    if(data != undefined && !isNaN(data)) {
                                        data =  parseFloat(data.toString().replace(/,{1,}/g,"")).toFixed(0);
                                    }
                                    return data
                                },
                            },
                            {
                                "targets": Array.from(colorColIndices),
                                "createdCell": function (td, cellData, rowData, row, col) {
                                    if (cellData >= 0 || cellData >= "0") {
                                        $(td).css('color', '#2D7230')
                                    }
                                    else if (cellData < 0 || cellData < "0") {
                                        $(td).css('color', '#A92626')
                                    }
                                }
                            },
                        ],
                         createdRow: function(row){
                            var td = $(row).find(".truncate");
                            td["prevObject"]["context"]["children"][0].title = td["prevObject"]["context"]["cells"][0]["innerText"];
                        },
                        order: [[groupColumn, 'asc']],
                        displayLength: 25,
                        drawCallback: function (settings) {
                            var api = this.api()
                            var rows = api.rows({ page: 'current' }).nodes()
                            var last = null

                            // api
                            //     .column(groupColumn, { page: 'current' })
                            //     .data()
                            //     .each(function (group, i) {
                            //         if (last !== group) {
                            //             $(rows)
                            //                 .eq(i)
                            //                 .before(
                            //                     $('<tr class="group"><td>'+group+'</td>'+templateGroupTotal).addClass(group.toString().replace(" ",""))
                            //                     // '<tr class="group"><td colspan="' +
                            //                     // table_cols.length +
                            //                     // '">' +
                            //                     // group +
                            //                     // '</td></tr>'
                                                
                            //                 )
                            //             last = group
                            //         }
                            //     })
                                // api
                                // .column(groupColumn + 1, { page: 'current' })
                                // .data()
                                // .each(function (group, i) {
                                //     // if (last !== group) {
                                //         $(rows)
                                //             .eq(i)
                                //             .before(
                                //                 $(templateGroupTotal).addClass(group.toString().replace(" ",""))
                                //             )
                                //         // last = group
                                //     // }
                                // })
                        },
                        // initComplete: function (settings, json) {
                        //     alert('DataTables has finished its initialisation.');
                        // },
                        bPaginate: false,
                        searching: false,
                        ordering: false,
                        info: false,     // Showing 1 of N Entries...
                        destroy: true,
                    })
                } else {
                    this._dataTableObj = new DataTable(this._table, {
                        layout: {},
                        columns: table_cols,
                        bAutoWidth: false, 
                        columnDefs: [
                            {
                                defaultContent: '-',
                                targets: hideCols, //_all
                                visible:false
                                // className: 'dt-body-left'
                            }
                        ],
                        bPaginate: false,
                        searching: false,
                        ordering: false,
                        info: false,     // Showing 1 of N Entries...
                        destroy: true,
                    })

                   
                }

                tbl = this._dataTableObj

                if(tbl.data().any()) {
                    tbl.rows().remove().draw();
                }

                // this._dataTableObj = tbl;
                // console.log(this._dataTableObj)

                ////// -------------------------- Show Total Row ------------------------
                var showTotalRow = ["Total", "Total"];
                var showTotalonRowUpdateFlag = false;
                for(var i = 2; i < this._tableColumnNames.length; i++) {
                    if(this._indices.includes(i)) {
                        showTotalRow.push("")
                    } else {
                        showTotalRow.push("")
                    }
                }
                tbl.row.add(showTotalRow).draw(false)
                /////  ------------------------------------------------------------------

//  ------------------------------ TO BE UNCOMMENTED ----------------------
                // Top Most Header Block Starts
                var topHeader = "<tr role='row'>";
                
                // 1st empty top header blocks...
                if(groupColumn != -1) {
                    topHeader += `<th class='top-header' colspan='${this._colspan_EmptyCase}'></th>`;
                } else {
                    topHeader += `<th class='top-header' colspan='${this._colspan_EmptyCase}'></th>`;
                }
                // 
                // CHANGED TO -2 in loop condition for neglecting last two scenarios
    

                if(this._customTopHeader) {
                    for(var i = 0; i < 4; i++) {
                        topHeader += `<th class='top-header' colspan='${this._colspan_BaseCase}' id='${this._customTopHeader[i].replace(" ","")}' >${this._customTopHeader[i]}</th>`
                    }
                } else {
                    for(var i = 0; i < this._scenarioOrder.length - 2; i++) {
                        // Base Case/Scenario
                        if(this._fixedScenario.includes(this._scenarioOrder[i])) {
                            topHeader += `<th class='top-header' colspan='${this._colspan_BaseCase}' id='${this._scenarioOrder[i].replace(" ","")}'>${this._scenarioOrder[i]}</th>`
                        } else {
                            // Rest Case/Scenario
                                for(var j = 0; j < this._scenarioOrder.length; j++) {
                                    if(!this._fixedScenario.includes(this._scenarioOrder[j])) {
                                        if(this._scenarioOrder[i] == this._scenarioOrder[j]) {
                                            topHeader += `<th class='top-header' id='${this._scenarioOrder[j].replace(" ","")}' colspan='${this._colspan_RestCase}'>${this._scenarioOrder[j]}`;
                                        } 
                                    }
                                }
                            topHeader +=  `</th>`;
                        }
                    }
                    topHeader += "</tr>";
                }
               
                // @--- uncomment below line
                console.log(this._widgetID+"v1-custom-table")

//  ------------------------------ TO BE UNCOMMENTED ----------------------

                // console.log(topHeader)
               
                tbl.on('click', 'tbody tr', e => {

                    // tbl.$('tr').removeClass('selected');
                    let classList = e.currentTarget.classList
                    tbl
                        .rows()
                        .nodes()
                        .each(row => row.classList.remove('selected'));
                    
                    if(classList.length != 1) {

                        classList.add('selected');

                        if(DO_FY["DRP_USR_TRIGGERED"] == undefined) {
                            DO_FY["DRP_USR_TRIGGERED"] = {}
                        }
    
                        if(DO_FY["DRP_USR_TRIGGERED"][tbl.row('.selected').index()] == undefined) {
                            DO_FY["DRP_USR_TRIGGERED"][tbl.row('.selected').index()] = {}
                        }
    
                    }

                    // console.log(typeof(e.target.classList), Object.keys(e.target.classList), e)
                    if(e.target.classList && e.target.classList[0] == "row_level_select") {
                        var sid = e.target.classList[1].split("row_level_select_")[1];
                        DO_FY["DRP_USR_TRIGGERED"][tbl.row('.selected').index()][sid] = 1;
                    }

                })

                
                // Master Reference Node For Selection Elements used Inside updateRow(), updateColumns() Method
                var hMap = {};
                var fixRowsObj = {}, masterObj = {};
                var is_col_updated = false;

                function updateTotalOnRowUpdate(updateFrom, no_of_mes, updateFromRowID) {
                    
                    /// ----------------------- For Subset Group Total Starts --------------------------- 
                    var parentID = undefined;
                    for(var [k, v] of Object.entries(groupRowMapping_5Y)) {
                        if(v.includes(updateFromRowID)) {
                            parentID = k;
                            break;
                        }
                    }
                    var subsetChildren = groupRowMapping_5Y[parentID].slice(1, );
                    /// ----------------------- For Subset Group Total Ends --------------------------- 

                    var indices = [];
                    var numericCols = [], varCols = []; 
                    var considerConditions = ["numericColsCSS", "numericColsCSS perColCSS", "varCol", "numericColsCSS numCol", "varCols", "perCols"]
                    var CAGR_Indices = [updateFrom + no_of_mes - 1];

                    for(var i = 0; i < table_cols.length; i++) {
                        if(considerConditions.includes(table_cols[i]["className"])) {
                            indices.push(i);
                        } else if (table_cols[i]["className"] == "cagrCol"){
                            indices.push(-2);
                        } else {
                            indices.push(-1);
                        }
                        ///// Numeric Col Indices
                        if(table_cols[i]["className"] == "numericColsCSS" || table_cols[i]["className"] == "numericColsCSS numCol") {
                            numericCols.push(i)
                        }

                        ///// Var Col Indices
                        if(table_cols[i]["className"] == "varCols") {
                            varCols.push(i)
                        }
                    }

                    var no_of_per_cols = 5;
                    // var finalPerCols = {}

                    for(var i = updateFrom; i < updateFrom + no_of_mes; i++) {
                        ////// =============================== Top-Most Total Update Starts =================================
                        var sum = 0;
                        var rowIDTotal = tbl.rows()[0][0];

                        var flag = false;
                        var d = tbl.column(i).data();
                        for(var j = 1; j < d.length; j++) {

                            var node = tbl.column(i).nodes()[j]["_DT_CellIndex"]["row"]

                            ///// ---------------------- For cell color red or green starts ---------------------------
                            if(!numericCols.includes(i)) {
                                var cell_rid = tbl.column(i).nodes()[j]["_DT_CellIndex"]["row"];
                                var cell_cid = tbl.column(i).nodes()[j]["_DT_CellIndex"]["column"];
                                var cell_node = tbl.cell(cell_rid, cell_cid).node();
                                var flagColor = false, data = undefined;
                                
                                if(isNaN(tbl.cell(cell_rid, cell_cid).data())) {
                                    data = parseFloat(tbl.cell(cell_rid, cell_cid).data());
                                    if(tbl.cell(cell_rid, cell_cid).data().includes("%")) {
                                        data = parseFloat(tbl.cell(cell_rid, cell_cid).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""));
                                    }
                                } else {
                                    data = tbl.cell(cell_rid, cell_cid).data();
                                }

                                if(data < 0) {
                                    flagColor = true;
                                }

                                if(parentID == cell_rid || subsetChildren.includes(cell_rid)) {
                                    if(flagColor) {
                                        cell_node.style.color = "#A92626";
                                    } else {
                                        cell_node.style.color = "#2D7230";
                                    }
                                }
                            }
                            ///// ---------------------- For cell color red or green ends -----------------------------

                            if(!Object.keys(groupRowMapping_5Y).includes(j.toString()) && !Object.keys(groupRowMapping_5Y).includes(node.toString())){
                                
                                if(isNaN(d[j]) && d[j].includes("%") && indices[i] != -2) {

                                    ////// Future ---- to be made dynamic logic
                                    flag = true;

                                }
                                else if(indices[i] == -2) {

                                    var Vbegin= 0, Vfinal = 0, t = (1/4);  
                                    Vbegin = tbl.cell(rowIDTotal, CAGR_Indices[0] - 15).data()
                                    Vfinal = tbl.cell(rowIDTotal, CAGR_Indices[0] - 11).data()
                                    sum = Math.pow((Vfinal/Vbegin), t) - 1; //// CAGR sum
                                    indices[i] =  CAGR_Indices[0];
                                    CAGR_Indices = CAGR_Indices.slice(1, );
                                    break;

                                } 
                                else {
                                    if(isNaN(d[j]) && !isNaN(parseFloat(d[j].replace(/,{1,}/g,"")))) {
                                        sum += parseFloat(d[j].replace(/,{1,}/g,""))
                                    } else {
                                        sum += parseFloat(d[j])
                                    }
                                }
                            }
                        }

                        if(flag) {

                            var value = tbl.cell(rowIDTotal, indices[i] - 10).data()
                            var val_minus_act = tbl.cell(rowIDTotal, indices[i] - 5).data()

                            if(isNaN(value)) {
                                value = parseFloat(tbl.cell(rowIDTotal, indices[i] - 10).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                            }
                            if(isNaN(val_minus_act)){
                                val_minus_act = parseFloat(tbl.cell(rowIDTotal, indices[i] - 5).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                            }

                            var act1 = value - val_minus_act

                            if(value == 0 && act1 == 0) {
                                sum = "-"
                            } else if(value == 0) {
                                sum = "-100%"
                            } else if (act1 == 0) {
                                sum = "100%";
                            } else {
                                sum = (val_minus_act / act1 * 100).toString()+" %"
                            }

                        }

                        // console.log(d,"<<<<",sum)
                        var colorFlag = false;
                        if(!isNaN(sum)){
                            sum = parseFloat(sum).toFixed(no_of_decimalPlaces)
                        } else {
                            sum = parseFloat(sum).toFixed(no_of_decimalPlaces).toString()+"%"
                        }

                        if(sum >= 0 || sum >= "0") {
                            colorFlag = true;
                        }

                        ////// ------------------ Number Formatting Starts --------------------------
                        var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: no_of_decimalPlaces_M});
                        
                        if(DO_5Y["Current_Scale"] == "K") {
                            nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: no_of_decimalPlaces_K});
                            if(sum.includes("%")) {
                                sum = parseFloat(sum.split("%")[0]).toFixed(no_of_decimalPlaces_K) + "%"
                            } else {
                                sum = parseFloat(sum).toFixed(no_of_decimalPlaces_K)
                            }
                        }

                        var count = nFormat.format(sum);

                        if(isNaN(sum)) {
                            sum = sum.split("%")[0];
                            count = nFormat.format(sum) + "%";
                        }

                        if(numericCols.includes(i)) {
                            count = nFormat.format(Math.round(parseFloat(count.split(".")[0].toString().replace(/,{1,}/g,"")+"."+count.split(".")[1]))).split(".")[0];
                        }
                        ////// ------------------ Number Formatting Ends ----------------------------

                        var node = tbl.cell(rowIDTotal, i).data(count).node()

                        if(!numericCols.includes(i) && updateFrom != i) {
                            if(colorFlag) {
                                node.style.color = "#2D7230";
                            } else {
                                node.style.color = "#A92626";
                            }
                        }
                    }
                    //// =============================== Top-Most Total Update Ends ====================================
                    ///  -----------------------------------------------------------------------------------------------
                    //// =============================== Subset Group Total Update Starts ==============================

                    var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: no_of_decimalPlaces_M});
                    var count = undefined;

                    if(DO_5Y["Current_Scale"] == "K") {
                        nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: no_of_decimalPlaces_K});
                    }

                    ///// -------------------- For Non % Cols Starts ------------------------------
                    for(var k = updateFrom; k < updateFrom + no_of_mes - no_of_per_cols - 1; k++) {

                        var subsetSum = 0;

                        for(var idx = 0; idx < subsetChildren.length; idx++) {

                            var dc = tbl.cell(subsetChildren[idx], k).data();
                            var node_dc = tbl.cell(subsetChildren[idx], k).node()

                            if(!isNaN(dc)) {
                                subsetSum += parseFloat(dc);
                            } else {
                                subsetSum += parseFloat(dc.replace(/,{1,}/g,""));
                            }

                            if(!numericCols.includes(k)) {
                                if(dc >= 0 || dc >= "0") {
                                    node_dc.style.color = "#2D7230";
                                } else {
                                    node_dc.style.color = "#A92626";
                                }
                            }
                            
                        }
                        
                        count = nFormat.format(subsetSum);

                        if(DO_5Y["Current_Scale"] == "K") {
                            if((numericCols.includes(k) || varCols.includes(k)) && !isNaN(subsetSum)) {
                                count = nFormat.format(parseFloat(count.split(".")[0].toString().replace(/,{1,}/g,"")+"."+count.split(".")[1])).split(".")[0];
                            }
                        } else {
                            if(numericCols.includes(k) && !isNaN(subsetSum)) {
                                count = nFormat.format(parseFloat(count.split(".")[0].toString().replace(/,{1,}/g,"")+"."+count.split(".")[1])).split(".")[0];
                            }
                        }

                       

                        if(isNaN(subsetSum)) {
                            count = "-"
                        }

                        tbl.cell(parseInt(parentID), k).data(count)
                    }
                    ///// -------------------- For Non % Cols Ends ------------------------------
                    ///// -------------------- For % Cols Starts --------------------------------
                    for(var k = updateFrom + no_of_mes - no_of_per_cols - 1, idx = updateFrom; k < updateFrom + no_of_mes; k++) {

                        var subsetSum = 0;

                        var value = tbl.cell(parentID, idx).data();
                        var val_minus_act = tbl.cell(parentID, k - 5).data()

                        var value_node = tbl.cell(parentID, idx).node();
                        var val_minus_act_node = tbl.cell(parentID, k - 5).node()


                        if(isNaN(value)) {
                            value = parseFloat(tbl.cell(parentID, idx).data().replace(/,{1,}/g,""))
                        }
                        if(isNaN(val_minus_act)) {
                            val_minus_act = parseFloat(tbl.cell(parentID, k - 5).data().replace(/,{1,}/g,""))
                        }

                        var act1 = value - val_minus_act

                        if(value == 0 && act1 == 0) {
                            subsetSum = "-"
                        } else if(value == 0) {
                            subsetSum = -100
                        } else if (act1 == 0) {
                            subsetSum = 100;
                        } else {
                            subsetSum = Math.round(parseFloat(val_minus_act / act1 * 100) * 10) / 10;
                        }

                        ////////// Coloring Starts ------------- 
                        if(value >= 0 || value >= "0") {
                            value_node.style.color = "#2D7230";
                        } else {
                            value_node.style.color = "#A92626";
                        }

                        if(val_minus_act >= 0 || val_minus_act >= "0") {
                            val_minus_act_node.style.color = "#2D7230";
                        } else {
                            val_minus_act_node.style.color = "#A92626";
                        }
                        ////////// Coloring Ends ------------- 


                        if(DO_5Y["Current_Scale"] == "K") {
                            subsetSum = parseFloat(subsetSum).toFixed(no_of_decimalPlaces_K);
                        }

                        count = nFormat.format(subsetSum);

                        if(subsetSum == "-" || isNaN(subsetSum)) {
                            count = "-"
                        }

                        idx++;

                        var node = tbl.cell(parseInt(parentID), k).data(count.toString()+"%").node()

                        if(count >= 0 || count >= "0") {
                            node.style.color = "#2D7230";
                        } else {
                            node.style.color = "#A92626";
                        }
                    }
                    ///// -------------------- For % Cols Ends ----------------------------------

                    //// =============================== Subset Group Total Update Ends ================================
                   
                }
                
                function updateRow_5Y(state, no_of_dimens, no_of_mes, no_of_excludes, identifer, sliceFrom, sliceFromBase) 
                {

                    var selectData = tbl.row('.selected').data()

                    // console.log(tbl.row('.selected').index())
                    // console.log("Selected Row : ", selectData)

                    var ROW_ID = tbl.row('.selected')[0][0];
                    // console.log("UPDATE - ROW -->",selectData)
                    // @---
                    // var row_updated_arr = selectData.slice(0, no_of_dimens - no_of_excludes + no_of_mes + 1)
                    var row_updated_arr = selectData.slice(0, sliceFrom - 1)

                    // console.log("ROW UPDATED INITIALs - ",row_updated_arr)

                    state.getElementsByTagName('option')[state.options.selectedIndex].setAttribute('selected', 'selected')
                    // console.log("State Changed", state)

                    // console.log(state.id,">>>>>>>>>>>>>>>>>>>>.")
                    var selOptID = state.getElementsByTagName('option')[state.options.selectedIndex].id
                    // var selOptVal = JSON.parse(state.getElementsByTagName('option')[state.options.selectedIndex].value)

                    // var selOptVal = fixRowsObj[identifer];
                    var selOptVal = [];

                    if(DO_5Y["Current_Scale"] == "K") {
                        selOptVal = fixRowsObj[identifer];
                    } else {
                        selOptVal = fixRowsObj["ScaledData"][identifer];
                    }
                   


                    let sid = state.classList[1].split("row_level_select_")[1];
                    DO_5Y["DRP"][tbl.row('.selected').index()][sid] = selOptID;

                   

                    // console.log(state)

                    var sliced = selOptVal.slice(sliceFromBase, ), data = {};

                    // ----------------------- Handling base case for WHAT-IF column is updated first --------- 
                    if(is_col_updated && selOptID == 0) {
                        for(var k = 1, mr_k = 0; k <= no_of_mes; k++) {
                            sliced[k] = masterRows[ROW_ID].slice(hMap[0] + 1, (hMap[0] + 1) + no_of_mes)[mr_k];
                            mr_k++;
                        }
                    }
                    // ----------------------------------------------------------------------------------------


                    // console.log("SLICED ---- ", sliced)
                    for(var i = 0, index = 0; i < sliced.length; i++) {
                        data[index] = sliced.slice(i, i + no_of_mes)
                        i += no_of_mes
                        index += 1
                    }
                    // console.log("0000",data, data[selOptID])

                    var len = row_updated_arr.length;
                    row_updated_arr = row_updated_arr.concat(selectData.slice(len, ));
                    // @---
                    // row_updated_arr[no_of_dimens - no_of_excludes + no_of_mes + parseInt(state.id)] = state
                    row_updated_arr[parseInt(state.id)] = state

                    // var sliceLen = no_of_dimens - no_of_excludes + no_of_mes + parseInt(state.id) + 1
                    var sliceLen = parseInt(state.id) + 1
                    
                    var dataCopy  = Array.from(data[selOptID]);
                    // console.log("DATA", dataCopy)
                    for(var i = sliceLen, idx = 0; i < sliceLen + no_of_mes; i++) {
                        row_updated_arr[i] = dataCopy[idx]
                        idx += 1;
                    }

                    // console.log(row_updated_arr)
                    tbl.row('.selected').data(row_updated_arr)

                    var updateFrom = sliceLen;

                    if(showTotalonRowUpdateFlag) {
                        state.style.backgroundColor="#C4DBEE";
                        state.style.border = "2px solid #0460A9";
                        state.style.color="#2C2C2C";
                        updateTotalOnRowUpdate(updateFrom, no_of_mes, ROW_ID);
                    }

                    // console.log(DO_FY)

                }

                window.updateRow_5Y = updateRow_5Y

                // var scenarioObj = Object.fromEntries(this._scenarioOrder.slice().map(key => [key, []]));
                // scenarioObj["DropDownFieldName"] = new Set();
                // scenarioObj["DropDownSelected"] = new Set();
                // console.log(scenarioObj)

                for(var i = 0, prev_key = ""; i < this._resultSet.length;) {

                    var key = this._resultSet[i].slice(0, this._dimensions.indexOf(this._dateColName)).join("_#_");
                    
                    if(i==0) {prev_key = key.substring(0, )}

                    var tempKey = key.substring(0, );

                    while(JSON.stringify(key) == JSON.stringify(tempKey)) {

                        if(this._resultSet[i] == undefined) {
                            break;
                        }
                        tempKey = this._resultSet[i].slice(0, this._dimensions.indexOf(this._dateColName)).join("_#_");

                        if(JSON.stringify(key) != JSON.stringify(tempKey)) {
                            break;
                        }

                        var masterKey = tempKey.split("_#_").slice(0, fixedScenarioAt);
                        var scene = this._resultSet[i][fixedScenarioAt];
                        

                        if(masterObj[masterKey.join("_#_")] == undefined) {
                            // masterObj[masterKey.join("_#_")] = structuredClone(scenarioObj);
                            // masterObj[masterKey.join("_#_")] = structuredClone(scenarioObj);
                            masterObj[masterKey.join("_#_")] = {};
                            masterObj[masterKey.join("_#_")]["DropDownFieldName"] =  new Set();
                            masterObj[masterKey.join("_#_")]["DropDownSelected"] = new Set();
                        }

                        if(masterObj[masterKey.join("_#_")][scene] == undefined) {
                            masterObj[masterKey.join("_#_")][scene] = [];
                        }

                        masterObj[masterKey.join("_#_")][scene] = this._resultSet[i].slice(this._dimensions.indexOf(this._dateColName), )
                        masterObj[masterKey.join("_#_")]["DropDownFieldName"].add(this._resultSet[i][this._dimensions.indexOf(this._dateColName)]);

                        if(this._dropdownsSelected.includes(this._resultSet[i][fixedScenarioAt].toUpperCase())) {
                            masterObj[masterKey.join("_#_")]["DropDownSelected"].add(this._resultSet[i][this._dimensions.indexOf(this._dateColName)]);
                        }

                        i += 1;
                    }

                    prev_key = key;
                }

                console.log("---", structuredClone(masterObj))

                // Final Row Assignment
                for(const [k, v] of Object.entries(masterObj)) {
                    // console.log(k)
                    var finalRow = [];
                    
                    // Pushing Dimensions to finalRow.
                    var dim = k.split("_#_");
                    for(var f = 0; f < dim.length; f++) {
                        finalRow.push(dim[f])
                    }

                    // console.log(v);
                    // finalRow.push(Array.from(v["DropDownFieldName"])[0])

                    // Pushing Measures to finalRow

                    for(const v1 in v) {
                        if(v1 != "DropDownFieldName") {
                            var f = false;
                            ///// checking if whole scenario is empty or not ----------------------------------
                            var checkEmpty = true;
                            for(var g = 0; g < this._scenarioOrder.length; g++) {
                                if(masterObj[k][this._scenarioOrder[g]] && masterObj[k][this._scenarioOrder[g]].length > 0) {
                                    checkEmpty = false;
                                }
                            }
                            ///// -----------------------------------------------------------------------------

                            // for(const [km, vm] of Object.entries(masterObj[k][v1])) {
                                
                                if(!checkEmpty) {
                                    if(masterObj[k][v1].length == 0) {
                                        for(var h = 0; h < this._measureOrder.length + 1; h++) {
                                            finalRow.push("-")
                                        }
                                    } else {
                                        if(masterObj[k]["DropDownFieldName"].size > 1) {
                                            for(var h = 0; h < masterObj[k][v1].length; h++) {
                                                if(masterObj[k][v1][h] != undefined) {
                                                    finalRow.push(masterObj[k][v1][h])
                                                } else {
                                                    finalRow.push("-")
                                                }
                                            }
                                        } else {
                                            f = true;
                                            for(var h = 0; h < masterObj[k][v1].length; h++) {
                                                if(masterObj[k][v1][h] != undefined) {
                                                    finalRow.push(masterObj[k][v1][h])
                                                }
                                            }
                                        }
                                    }
                                // }
                                                               
                            }
                        } else {
                            // dropdown data
                        }
                    }

                    ////// If only BASE is present STARTS -----------------------------------------
                    var onlyBaseAvailable = false, sliced = undefined;
                    if(masterObj[k]["DropDownFieldName"].size == 1) {
                        sliced = finalRow.slice(k.split("_#_").length, this._dimensions.length - 1 + this._measureOrder.length);
                        var cnt = 0;
                        for(var i = sliced.length + k.split("_#_").length; i < table_cols.length; i++) {
                            if(cnt >= sliced.length) {
                                cnt = 0;
                            }
                            finalRow[i] = sliced[cnt]
                            cnt++;
                        }
                        onlyBaseAvailable = true;
                        // console.log(sliced, "-------", finalRow);
                    }
                    ////// If only BASE is present ENDS ------------------------------------------


                    var dropdownArr = Array.from(masterObj[k]["DropDownFieldName"]).slice();
                    var master_dropdownArr = new Set();
                    var dropdownSel = Array.from(masterObj[k]["DropDownSelected"]).slice();
                    var caughtDropDownsAt = new Set(),  dropdownIDs = new Set(), cnt = 0;

                    for(var kk = this._measureOrder.length + 3, optIdx = 0; kk < finalRow.length; kk++) {

                        if(cnt < 3) {
                            dropdownIDs.add(kk+"_"+this._dataTableObj.rows().count());
                        }

                        if(onlyBaseAvailable) {
                            var flag_sel = sliced[0];
                            finalRow[kk] = `<select id='${kk}' class='row_level_select row_level_select_${kk}_${this._dataTableObj.rows().count()}' onchange='updateRow_5Y(this, ${this._dimensions.length}, ${this._measureOrder.length}, ${this._excludeHeaders.length}, "${finalRow[0]}_#_${finalRow[1]}", ${this._resultSet[0].length}, ${this._dimensions.indexOf(this._dateColName)})'><option selected>${flag_sel}</option></select>`;
                        } else {
                            var select_html = `<select id='${kk}' class='row_level_select row_level_select_${kk}_${this._dataTableObj.rows().count()}' onchange='updateRow_5Y(this, ${this._dimensions.length}, ${this._measureOrder.length}, ${this._excludeHeaders.length}, "${finalRow[0]}_#_${finalRow[1]}", ${this._resultSet[0].length}, ${this._dimensions.indexOf(this._dateColName)})'>`;
                            var options = "";
                            for(var i = 0; i < dropdownArr.length; i++) {
                                if(dropdownSel.includes(dropdownArr[i])) {
                                    caughtDropDownsAt.add(i)
                                } else {
                                    master_dropdownArr.add(i)
                                }
                                if(optIdx == i) {
                                    options += `<option class='optionTag' id='${i}' selected>${dropdownArr[i]}</option>`
                                } else {
                                    options += `<option class='optionTag' id='${i}' >${dropdownArr[i]}</option>`
                                }
                            }
                            select_html += options + `</select>`;
                            finalRow[kk] = select_html;
                        }

                        kk += this._measureOrder.length; 
                        cnt++;

                        if(cnt < 3 && kk == finalRow.length - 1) {
                            kk += 1;
                            for(cnt; cnt < 3; cnt++) {
                                dropdownIDs.add(kk+"_"+this._dataTableObj.rows().count());
                                var select_html = `<select id='${kk}' class='row_level_select row_level_select_${kk}_${this._dataTableObj.rows().count()}' onchange='updateRow_5Y(this, ${this._dimensions.length}, ${this._measureOrder.length}, ${this._excludeHeaders.length}, "${finalRow[0]}_#_${finalRow[1]}", ${this._resultSet[0].length}, ${this._dimensions.indexOf(this._dateColName)})'>`;
                                var options = "";
                                for(var i = 0; i < dropdownArr.length; i++) {
                                    if(dropdownSel.includes(dropdownArr[i])) {
                                        caughtDropDownsAt.add(i)
                                    } else {
                                        master_dropdownArr.add(i)
                                    }
                                    if(optIdx == i) {
                                        options += `<option class='optionTag' id='${i}' selected>${dropdownArr[i]}</option>`
                                    } else {
                                        options += `<option class='optionTag' id='${i}' >${dropdownArr[i]}</option>`
                                    }
                                }
                                select_html += options + `</select>`;
                                finalRow[kk] = select_html;
                                kk += this._measureOrder.length + 1; 
                            }
                        }

                    }


                    // console.log(finalRow)
                    finalRow = finalRow.slice(0, table_cols.length);

                    /////// creating scaled data copy starts ------------------------ 
                    var K_Data5Y = finalRow.slice();
                    var M_Data5Y = finalRow.slice();
                    var numCols_5Y = this._dataTableObj.columns('.numericColsCSS')[0];
                    var vsPyCols_5Y = this._dataTableObj.columns('.varCols')[0];
                    var perCols_5Y = this._dataTableObj.columns('.perCols')[0];

                   


                    for(var ss = 0; ss < M_Data5Y.length; ss++) {

                        var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: this.no_of_decimalPlaces_M});
                        var nFormat_K = new Intl.NumberFormat('en-US', {minimumFractionDigits: this.no_of_decimalPlaces_K});

                        if(numCols_5Y.includes(ss)) {
                            var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: 0});
                            var nFormat_K = new Intl.NumberFormat('en-US', {minimumFractionDigits: 0});
                            //////////
                            if(!isNaN(parseFloat(M_Data5Y[ss].toString()))) {
                                if(M_Data5Y[ss].toString().includes(".")) {
                                    M_Data5Y[ss] = nFormat.format(parseFloat(parseFloat(M_Data5Y[ss].toString().replace(/,{1,}/g,"")).toFixed(0) / 1000).toFixed(0));
                                }
                            }

                            /////////
                            if(!isNaN(parseFloat(K_Data5Y[ss].toString()))) {
                                if(K_Data5Y[ss].toString().includes(".")) {
                                    K_Data5Y[ss] = nFormat_K.format(parseFloat(K_Data5Y[ss].toString().replace(/,{1,}/g,"")).toFixed(0))
                                }
                            }
                        }
                        else if(vsPyCols_5Y.includes(ss)) {
                            //////////
                            if(!isNaN(parseFloat(M_Data5Y[ss].toString()))) {
                                if(M_Data5Y[ss].toString().includes(".")) {
                                    M_Data5Y[ss] = nFormat.format(parseFloat(M_Data5Y[ss].toString().replace(/,{1,}/g,"") / 1000).toFixed(this.no_of_decimalPlaces_M))
                                }
                            }

                            /////////
                            if(!isNaN(parseFloat(K_Data5Y[ss].toString()))) {
                                if(K_Data5Y[ss].toString().includes(".")) {
                                    K_Data5Y[ss] = nFormat_K.format(parseFloat(K_Data5Y[ss].toString().replace(/,{1,}/g,"")).toFixed(this.no_of_decimalPlaces_K))
                                }
                            }
                        }
                        else if(perCols_5Y.includes(ss)) {
                            /////////
                            if(!isNaN(parseFloat(M_Data5Y[ss].toString().split("%")[0]).toFixed(0))) {
                                M_Data5Y[ss] = nFormat.format(parseFloat(M_Data5Y[ss].toString().split("%")[0]).toFixed(this.no_of_decimalPlaces_M)).toString()+"%";
                            }

                            ////////
                            if(!isNaN(parseFloat(K_Data5Y[ss].toString().split("%")[0]).toFixed(0))) {
                                K_Data5Y[ss] = nFormat_K.format(parseFloat(K_Data5Y[ss].toString().split("%")[0]).toFixed(this.no_of_decimalPlaces_K)).toString()+"%";
                            }
                        }
                    }
                    finalRow = K_Data5Y.slice()
                    fixRowsObj[k] = finalRow.slice()

                    if(fixRowsObj["ScaledData"] == undefined) {
                        fixRowsObj["ScaledData"] = {}
                    }

                    fixRowsObj["ScaledData"][k] = M_Data5Y.slice()
                    /////// creating scaled data copy ends ------------------------ 


                    ////// ================================ Group by Row Starts =========================================
                    if(!Array.from(groupBy).includes(finalRow[0])) {
                        groupBy.add(finalRow[0])
                        templateGroupTotal[1] = finalRow[0]
                        var node = tbl.row.add(templateGroupTotal.slice()).draw(false).node()
                        node.classList.add("group")
                    }
                    ////// ================================ Group by Row Ends ============================================

                    tbl.row.add(finalRow).draw();
                    var rid = tbl.rows().indexes().toArray()[tbl.rows().indexes().toArray().length - 1];

                    if(!onlyBaseAvailable) {

                        var cga = Array.from(caughtDropDownsAt);
                        master_dropdownArr = Array.from(master_dropdownArr).slice(1, );

                        if(master_dropdownArr.length < 3) {
                            for(var md = master_dropdownArr.length; md < 3; md++) {
                                master_dropdownArr.push(0);
                            }
                        }

                        if(cga.length < 3) {
                            for(var b = 0; b < master_dropdownArr.length; b++) {
                                if(cga.length >= 3) {
                                    break;
                                }
                                cga.push(master_dropdownArr[b]);
                            }
                        }

                        var drp = Array.from(dropdownIDs);

                        if(DO_5Y["DRP"] == undefined) {
                            DO_5Y["DRP"] = {}
                        }

                        if(DO_5Y["DRP"][rid] == undefined) {
                            DO_5Y["DRP"][rid] = {}
                        }

                        DO_5Y["DRP"][rid][drp[0]] = cga[0];
                        DO_5Y["DRP"][rid][drp[1]] = cga[1];
                        DO_5Y["DRP"][rid][drp[2]] = cga[2];

                        this.setSelectorsSelectedValue(dropdownIDs, cga, "5Y");
                    }

                }

                this.applyStyling_5Y();

                if (this._tableCSS) {
                    // console.log(this._tableCSS)
                    this._table.style.cssText = this._tableCSS
                }

                if (this._rowCSS) {
                    console.log(this._rowCSS)
                    document
                        .querySelector(this._widgetID+'v1-custom-table')
                        .shadowRoot.querySelectorAll('td')
                        .forEach(el => (el.style.cssText = this._rowCSS))
                    document
                        .querySelector(this._widgetID+'v1-custom-table')
                        .shadowRoot.querySelectorAll('th')
                        .forEach(el => (el.style.cssText = this._rowCSS))
                }

                if (this._colCSS) {
                    console.log(this._colCSS)
                    document
                        .querySelector(this._widgetID+'v1-custom-table')
                        .shadowRoot.querySelector('style').innerText += this._colCSS
                }

                const list = document.querySelector(this._widgetID+"v1-custom-table").shadowRoot.querySelector("#example > thead");

                for(var i = 0; i < list.children.length - 1; i++) {
                    list.removeChild(list.children[i]);
                }


                // this._dotsLoader.style.visibility = "hidden";
                this._table.style.visibility = "visible";
                this._root.style.display = "block";

                showTotalonRowUpdateFlag = true;
                document.querySelector(this._widgetID+"v1-custom-table").shadowRoot.querySelector("#example > thead").insertAdjacentHTML('afterBegin', topHeader);
                this.showTotal("5Y");
                this.applyScaling_5Y("K")
                // this.createDataObjects("5Y", false);

                // Styling Block Ends here
            }

            setResultSet_5Y_OLD(rs, col_to_row = -1, colspan_to_top_headers) {

                // this.reinitialize_changedProperties_ClassVariables();

                if(this._table) {
                    this._table.remove();
                    this._root.innerHTML = `
                     <table id="example" class="table" style="visibility:hidden;">
                        <thead>
                        </thead>
                        <tbody></tbody>
                    </table>    
                    `
                    this._table = this._shadowRoot.getElementById('example')
                    // console.log( document.querySelector("#"+this["parentNode"].id+" > v1-custom-table").shadowRoot.querySelector("#example > colgroup:nth-child(2)"))
                    // document.querySelector(this._widgetID+"v1-custom-table").shadowRoot.querySelector("#example > colgroup:nth-child(2)").remove();
                }

                // this._dotsLoader.style.visibility = "visible";
                // this._table.style.visibility = "hidden";
                // this._root.style.display = "inline-grid";

                this._resultSet = [];
                this._nonNumericColumnIndices_UnitConversion = new Set();
                this._masterRows_UnitConversion = [];
                this._masterRows_UnitConversion_Flag = false;
                // this._selectionColumnsCount = selCnt
                this._col_to_row = col_to_row; // Row Grouping

                var headers = this._headers
                // console.log(headers);
                console.log(this._dropdownsSelected)

                var remove = headers["Exclude"].join(",")+",@MeasureDimension".split(",");

                this._dimensions = Array.from(new Set(Object.keys(rs[0]).filter((k) => !remove.includes(k))))
                this._measures = new Set()

                this._colOrder = headers["COL_NAME_ORDER"];
                this._scenarioOrder = headers["SCENARIO_ORDER"];
                this._fixedScenario = headers["FIXED_SCENARIO"];
                this._measureOrder = headers["@MeasureDimension"]
                this._excludeHeaders = headers['Exclude']
                // this._dateColName = selColumnName; //selectionColumn
                // this._hideExtraVisibleColumnFromIndex = hideExtraVisibleColumnFromIndex;
                // this._hide_Individual_ExtraVisibleColumnOfIndices = hide_Individual_ExtraVisibleColumnOfIndices;
                this._colspan_EmptyCase = parseInt(colspan_to_top_headers["EmptyCase"]);
                this._colspan_BaseCase = parseInt(colspan_to_top_headers["BaseCase"]);
                this._colspan_RestCase = parseInt(colspan_to_top_headers["RestCase"]);
               
                // this._customHeaderNames = customHeaderNames;

                console.log("Col-Orders",this._colOrder)
                console.log("Scenario-Orders",this._scenarioOrder)
                console.log("Fixed Scenarios",this._fixedScenario)
                console.log("Measure Order", this._measureOrder)
                console.log("Dimensions", this._dimensions)
                console.log("Exclude Headers",this._excludeHeaders)


                for(var i = 0; i < rs.length;) {
                    var tempArr = [], dims = new Set();
                    for(var k = 0; k < this._dimensions.length; k++) {
                        dims.add(rs[i][this._dimensions[k]].description);
                        this._nonNumericColumnIndices_UnitConversion.add(k);
                    }
                    for(var j = 0; j < this._measureOrder.length; j++) {
                        if(JSON.stringify(this._measureOrder[j]) == JSON.stringify(rs[i]["@MeasureDimension"].description) && rs[i]["@MeasureDimension"].formattedValue != undefined) {
                            if(rs[i]["@MeasureDimension"].formattedValue.includes("%")) {
                                tempArr.push(rs[i]["@MeasureDimension"].formattedValue)
                            } else {
                                tempArr.push(parseFloat(rs[i]["@MeasureDimension"].formattedValue.replace(/,{1,}/g,"")))
                            }
                        } else {
                            while(JSON.stringify(this._measureOrder[j]) != JSON.stringify(rs[i]["@MeasureDimension"].description)) {
                                tempArr.push("-")
                                j+=1;
                                if(j > this._measureOrder.length) {
                                    console.log("Hit to Infinite Loop Case...")
                                    return;
                                }
                            }
                            if(JSON.stringify(this._measureOrder[j]) == JSON.stringify(rs[i]["@MeasureDimension"].description) && rs[i]["@MeasureDimension"].formattedValue != undefined) {
                                if(rs[i]["@MeasureDimension"].formattedValue.includes("%")) {
                                    tempArr.push(parseFloat(rs[i]["@MeasureDimension"].formattedValue))
                                } else {
                                    tempArr.push(parseFloat(rs[i]["@MeasureDimension"].formattedValue.replace(/,{1,}/g,"")))
                                }
                            }
                        }
                        i++;
                        if(i >= rs.length || tempArr.length > this._measureOrder.length) {
                            break;
                        }
                    }
                    if(i > rs.length) {
                        break;
                    }
                    tempArr.unshift(...Array.from(dims))
                    // console.log(tempArr)
                    this._resultSet.push(tempArr)
                    // console.log(tempArr)
                }

                console.log("-- Result Set --")
                console.log(this._resultSet)
                console.log("----------------")

                // widget_ID_Name[this["widgetName"]] = this["offsetParent"].id;
                // console.log("Mapped Widgets : ",widget_ID_Name);

                this.render_5Y();

            }

            applyStyling_5Y_OLD() {

                document.querySelector(this._widgetID+"v1-custom-table").shadowRoot.querySelector("style").innerText += `
                tbody, td, tfoot, th, thead, tr {
                    border-color: inherit;
                    border-style: none;
                    border-width: 0;
                }
    
                /* ------------------------- CUSTOM STYLING --------------------------------- */
    
    
                #example > tbody > tr:nth-child(2) > td.truncate {
                    font-weight:bold;
                }
    
                select {
                    padding-top:0%;
                    background-color:#DCE6EF;
                    outline:none;
                }
    
                option {
                    background-color:white;
                    color:black;
                }
                
                select:focus>option:checked {
                    background:#0460A9;
                    color:white;
                    /* selected */
                }
    
                #example th {
                    text-wrap: nowrap;
                    border-bottom: 1px solid #CBCBCB;
                    background-color:#F2F2F2;
                    align-content: center;
                    font-family: Arial;
                    color:black;
                    font-size:14px;
                }
    
                #example > tbody > tr:nth-child(2) {
                    font-weight:bold;
                }
    
                /* ------------------------- TOP MOST - HEADER ROW ------------------------- */
    
                #example .top-header {
                    height:32px;
                    max-height:32px;
                    font-family: Arial;
                    color:black;
                    font-size:14px;
                    font-weight:bold;
                    text-align: center;
                    padding-top:0%!important;
                    padding-bottom:0%!important;
                }
    
                /* ------------------------- BASE CASE ------------------------- */
    
                #example > thead > tr:nth-child(1) > th:nth-child(2) {
                    background-color:#E0E0E0;
                }
    
                /* ------------------------- SCENARIO 1 ------------------------- */
    
                #example > thead > tr:nth-child(1) > th:nth-child(3) {
                    background-color:#D9D9D9;
                }
    
                /* ------------------------- SCENARIO 2 ------------------------- */
    
                #example > thead > tr:nth-child(1) > th:nth-child(4) {
                    background-color:#CBCBCB;
                }
    
                /* ------------------------- SCENARIO 3 ------------------------- */
    
                #example > thead > tr:nth-child(1) > th:nth-child(5) {
                    background-color:#BDBDBD;
                }
    
                /* ------------------------- 2nd MOST HEADER ------------------------- */
                
                #example > thead > tr:nth-child(2) {
                    height:48px; 
                }
    
                /* ------------------------- SCENARIO SELECT ELEMENTS HEADER ------------------------- */
    
                .scenarios {
                    background-color:inherit;
                    font-family: Arial;
                    color:black;
                    font-size:14px;
                    text-align:center;
                    font-weight:bold;
                    height:30px;
                    border:none;
                    cursor: pointer;
                }
    
                /* ------------------------- GROUPED ROW ------------------------- */
    
                #example .group > td {
                    height:32px;
                    padding: 0px 10px!important;
                    align-content: center;
                    font-weight:bold;
                    color: #212121;
                    font-family: Arial;
                    background-color:#E0E0E0!important;
                }

                #example .clTotalRow > td {
                    background-color:#b7d0e621;
                }
    
                /* ------------------------- NORMAL ROW ------------------------- */
    
                #example td {
                    text-wrap:nowrap;
                    background-color:white;
                    height:48px;
                    border-bottom:1px solid #CBCBCB!important;
                    font-family: Arial;
                    font-size:14px;
                    align-content: center;
                }
    
                #example .numericColsCSS,  #example .perCols,  #example .varCols,  #example .cagrCol {
                    text-align:right!important;
                }
    
                /* ------------------------- ROW LEVEL SELECT ------------------------- */
    
                #example .row_level_select {
                    font-family: Arial;
                    font-size: 14px;
                    height: 30px;
                    background-color: #DCE6EF;
                    border-radius:4px;
                    border:none;
                    outline:none;
                    cursor: pointer;
                }
     
                /* ------------------------- TRUNCATE ROW LEVEL DATA ------------------------- */
    
                #example .truncate {
                    max-width:130px;
                    padding-left: 2%;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
    
                /* ------------------------- TOP FIXED HEADER SCROLL ------------------------- */
    
                #example > thead {
                    position: sticky;
                    top:0%!important;
                    border-bottom: 1px solid #CBCBCB;
                    background-color: yellow;
                }
    
                #example {
                    position: absolute;
                    width:100%!important;
                    border-collapse: separate;
                }
    
                .mt-2 {
                    margin-top: 0% !important;
                }
    
                /* ------------------------- REMOVE TOP MOST PADDING ------------------------- */
    
                #example_wrapper > div.dt-layout-row.dt-layout-table > div {
                    padding:0%!important;
                }
    
                /* --------------------------- 1ST TOP TOTAL ROW ---------------------------- */
    
                #example > tbody > tr:nth-child(1) > td {
                    font-weight:bold;
                }

                #example > tbody > tr:nth-child(1) {
                    position:sticky!important;
                    top:80px!important;
                }

                /* --------------------------- FREEZE 1ST COLUMN ---------------------------- */

                #example > thead > tr:nth-child(2) > th.truncate.dt-orderable-none, #example > thead > tr:nth-child(1) > th:nth-child(1),
                #example > tbody > tr:nth-child(2) > td.truncate, #example > tbody > tr > td.truncate
                {
                    position:sticky;
                    left:0px;
                }

                td.truncate, #example > tbody > tr > td:not(.truncate) {
                    mix-blend-mode: hue;
                    scroll-behavior: smooth;
                }
                
                `;
            }

            async render_5Y_OLD() {

                if (!this._resultSet) {
                    return
                }

                this._widgetID = "#"+this["parentNode"].id+" > ";
                this._stateShown = "Num";
                this._visibleCols = [];
               
                var table_cols = []

                var col_dimension = this._dimensions;
                var col_measures = this._measureOrder;
                var fixedScenarioAt = col_dimension.indexOf("SCENARIO_NAME")
                console.log("Fixed Scenario At : ", fixedScenarioAt);

                console.log('ResultSet Success')

                col_dimension = col_dimension.slice(0, col_dimension.indexOf("SCENARIO_NAME"))

                if(this._colOrder[0] == "FY") {
                    // if(this._colOrder[0] != "FY") {
                    //     col_dimension = col_dimension.concat(this._colOrder)
                    // } 
                    if(Object.keys(this._customHeaderNames).length > 0) {
                         for (var i = 0; i < this._customHeaderNames["DIMEN_NAME"].length; i++) {
                            table_cols.push({
                                title: this._customHeaderNames["DIMEN_NAME"][i]
                            })
                        }
        
                        var classname_col = "";

                        for(var j = 0; j < this._customHeaderNames["MES_NAME"].length; j++) {
                            if(j < 5) {
                                classname_col = "numericColsCSS";
                            } else if (j < 10) {
                                classname_col = "varCols";
                            } else if (j < 15) {
                                classname_col = "perCols";
                            } else {
                                classname_col = "cagrCol";
                            }
                            table_cols.push({
                                title: this._customHeaderNames["MES_NAME"][j],
                                className:classname_col
                            })
                        }
                       
                        for(var i = this._fixedScenario.length; i < this._scenarioOrder.length; i++) {
                            if(this._scenarioOrder[i] != "FY") {
                                table_cols.push({
                                    title: this._customHeaderNames["SCENARIO_NAME"][i],
                                    className:"selColClass"
                                })
                            }
                            for(var j = 0; j < this._customHeaderNames["MES_NAME"].length; j++) {
                                if(j < 5) {
                                    classname_col = "numericColsCSS";
                                } else if (j < 10) {
                                    classname_col = "varCols";
                                } else if (j < 15) {
                                    classname_col = "perCols";
                                } else {
                                    classname_col = "cagrCol";
                                }
                                table_cols.push({
                                    title: this._customHeaderNames["MES_NAME"][j],
                                    className:classname_col
                                })
                            }
                        }
                    } else {
                        for (var i = 0; i < col_dimension.length; i++) {
                            table_cols.push({
                                title: col_dimension[i]
                            })
                        }
        
                        var classname_col = "";

                        for(var j = 0; j < this._measureOrder.length; j++) {
                            if(j < 5) {
                                classname_col = "numericColsCSS";
                            } else if (j < 10) {
                                classname_col = "varCols";
                            } else if (j < 15) {
                                classname_col = "perCols";
                            } else {
                                classname_col = "cagrCol";
                            }
                            table_cols.push({
                                title: col_measures[j],
                                className:classname_col
                            })
                        }
                       
                        for(var i = this._fixedScenario.length; i < this._scenarioOrder.length; i++) {
                            if(this._scenarioOrder[i] != "FY") {
                                table_cols.push({
                                    title: this._scenarioOrder[i],
                                    className:"selColClass"
                                })
                            }
                            for(var j = 0; j < this._measureOrder.length; j++) {
                                if(j < 5) {
                                    classname_col = "numericColsCSS";
                                } else if (j < 10) {
                                    classname_col = "varCols";
                                } else if (j < 15) {
                                    classname_col = "perCols";
                                } else {
                                    classname_col = "cagrCol";
                                }
                                table_cols.push({
                                    title: col_measures[j],
                                    className:classname_col
                                })
                            }
                        }
                    }
                }
               
                // TRIM LOGIC
                // table_cols = table_cols.slice(0, this._dimensions.length - this._excludeHeaders.length + ((this._measureOrder.length + 1) * 3))
                console.log('Data Table Columns : ', table_cols)
                this._tableColumnNames = table_cols;

                //// ------------------------ var cols indices starts ---------------------------------
                var varColIndices = new Set();
                for(var i = 0; i < this._tableColumnNames.length; i++) {
                    if(this._tableColumnNames[i]["className"] == "varCols" || this._tableColumnNames[i]["className"] == "perCols") {
                        varColIndices.add(i);
                    }
                }
                //// ------------------------ var cols indices ends -----------------------------------

                //// ------------------------ Show Totals on Row Block Starts ---------------------------------
                // var indices = [];
                this._fixedIndices = this._fixedIndices.concat(this._dropdownIndices);
                var templateGroupTotal = ["Total"];
                // var templateGroupTotal = `<tr class="clTotalRow"><td>Total</td>`;
                // var templateGroupTotal = "";

                for(var i = 0; i < this._tableColumnNames.length; i++) {
                    if(this._dropdownIndices.includes(i)) {
                        indices.push(-1);
                    } 
                    else if (!this._fixedIndices.includes(i)) {
                        indices.push(i);
                    }
                    ////// -------------- For subset group total on rowgroup level starts --------------------
                    if(i > 0) {
                        // templateGroupTotal += '<td class="numericColsCSS">'+i+'</td>';
                        if(this._customHeaderNames["SCENARIO_NAME"].includes(this._tableColumnNames[i].title) || this._tableColumnNames[i].title == this._dateColName) {
                            templateGroupTotal.push("");
                        } else {
                            // console.log(this._tableColumnNames[i].title)
                            templateGroupTotal.push("");
                        }
                    }
                    ////// -------------- For subset group total on rowgroup level Ends ----------------------
                }

                // templateGroupTotal += `</tr>`;
                
                // console.log($(templateGroupTotal));

                this._indices = indices;

                //// ------------------------ Show Totals on Row Block Ends ---------------------------------

                // --------------- Hide Columns STARTS ---------------
                var hideCols = []

                // @--------------- CHANGED UNCOMMENT THIS... ----------------------------------

                // for(var i = 19; i < table_cols.length; i++) {

                for(var i = this._hideExtraVisibleColumnFromIndex; i < table_cols.length; i++) {
                    hideCols.push(i)
                }

                for(var i = 0; i < this._hide_Individual_ExtraVisibleColumnOfIndices.length; i++) {
                    hideCols.push(this._hide_Individual_ExtraVisibleColumnOfIndices[i])
                }

                // --------------- Hide Columns ENDS ---------------

                // console.log('Data Table Columns : ', table_cols)

                var groupColumn = this._col_to_row

                var tbl = undefined;
                // $(this._table).on('init.dt', function () {
                //     console.log('Table initialisation complete: ' + new Date().getTime());
                // })
                // .DataTable();

                ////// Handling situation for what if data table library didn't got loaded ... 
                // try {
                //     new DataTable()
                // } catch(err) {
                //     console.log("-------- Exception caught & handled ... : "+err);
                //     await this.loadLibraries();
                // }

                if (!jQuery().dataTable) {
                    console.log("-------- Datatable not initialized. \nRe-Initialzing Datatable libraries ...  ");
                    await this.loadLibraries();
               }


                if (groupColumn != -1) {

                    hideCols.push(groupColumn);
                    // hideCols.push(2);

                    // var nullArr = table_cols.slice()
                    // nullArr.fill(null)
                    // nullArr.pop()
                    // console.log(nullArr)

                    tbl = new DataTable(this._table, {
                        layout: {},
                        columns: table_cols,
                        bAutoWidth: false, 
                        columnDefs: [
                            {
                                defaultContent: '-',
                                // targets: hideCols, //_all
                                // targets: groupColumn,
                                targets : "_all",
                               
                                // className: 'dt-body-left'
                            },
                            { 
                                targets:hideCols,  visible: false
                            },
                            { 
                                targets:1, className:"truncate"
                            },
                            {
                                "targets": Array.from(varColIndices),
                                "createdCell": function (td, cellData, rowData, row, col) {
                                    if (cellData >= 0 || cellData >= "0") {
                                        $(td).css('color', '#2D7230')
                                    }
                                    else if (cellData < 0 || cellData < "0") {
                                        $(td).css('color', '#A92626')
                                    }
                                }
                            },
                        ],
                         createdRow: function(row){
                            var td = $(row).find(".truncate");
                            td["prevObject"]["context"]["children"][0].title = td["prevObject"]["context"]["cells"][0]["innerText"];
                        },
                        order: [[groupColumn, 'asc']],
                        displayLength: 25,
                        drawCallback: function (settings) {
                            var api = this.api()
                            var rows = api.rows({ page: 'current' }).nodes()
                            var last = null

                            // api
                            //     .column(groupColumn, { page: 'current' })
                            //     .data()
                            //     .each(function (group, i) {
                            //         if (last !== group) {
                            //             $(rows)
                            //                 .eq(i)
                            //                 .before(
                            //                     $('<tr class="group"><td>'+group+'</td>'+templateGroupTotal).addClass(group.toString().replace(" ",""))
                            //                     // '<tr class="group"><td colspan="' +
                            //                     // table_cols.length +
                            //                     // '">' +
                            //                     // group +
                            //                     // '</td></tr>'
                                                
                            //                 )
                            //             last = group
                            //         }
                            //     })
                                // api
                                // .column(groupColumn + 1, { page: 'current' })
                                // .data()
                                // .each(function (group, i) {
                                //     // if (last !== group) {
                                //         $(rows)
                                //             .eq(i)
                                //             .before(
                                //                 $(templateGroupTotal).addClass(group.toString().replace(" ",""))
                                //             )
                                //         // last = group
                                //     // }
                                // })
                        },
                        // initComplete: function (settings, json) {
                        //     alert('DataTables has finished its initialisation.');
                        // },
                        bPaginate: false,
                        searching: false,
                        ordering: false,
                        info: false,     // Showing 1 of N Entries...
                        destroy: true,
                    })
                } else {
                    tbl = new DataTable(this._table, {
                        layout: {},
                        columns: table_cols,
                        bAutoWidth: false, 
                        columnDefs: [
                            {
                                defaultContent: '-',
                                targets: hideCols, //_all
                                visible:false
                                // className: 'dt-body-left'
                            }
                        ],
                        bPaginate: false,
                        searching: false,
                        ordering: false,
                        info: false,     // Showing 1 of N Entries...
                        destroy: true,
                    })

                   
                }

                if(tbl.data().any()) {
                    tbl.rows().remove().draw();
                }

                // tbl.col
                this._dataTableObj = tbl;
                // console.log(this._dataTableObj)

                ////// -------------------------- Show Total Row ------------------------
                var showTotalRow = ["Total", "Total"];
                var showTotalonRowUpdateFlag = false;
                for(var i = 2; i < this._tableColumnNames.length; i++) {
                    if(this._indices.includes(i)) {
                        showTotalRow.push("")
                    } else {
                        showTotalRow.push("")
                    }
                }
                tbl.row.add(showTotalRow).draw(false)
                // document.querySelector("v1-custom-table").shadowRoot.querySelector("#example > tbody > tr:nth-child(1) > td").style.display = "none";
                /////  ------------------------------------------------------------------

//  ------------------------------ TO BE UNCOMMENTED ----------------------
                // Top Most Header Block Starts
                var topHeader = "<tr role='row'>";
                
                // 1st empty top header blocks...
                if(groupColumn != -1) {
                    topHeader += `<th class='top-header' colspan='${this._colspan_EmptyCase}'></th>`;
                    // topHeader += `<th class='top-header' colspan='${this._dimensions.slice(0, this._dimensions.length - this._excludeHeaders.length).length - 3}'></th>`;
                } else {
                    topHeader += `<th class='top-header' colspan='${this._colspan_EmptyCase}'></th>`;
                    // topHeader += `<th class='top-header' colspan='${this._dimensions.slice(0, this._dimensions.length - this._excludeHeaders.length).length + 1}'></th>`;
                }
                // 
                // CHANGED TO -2 in loop condition for neglecting last two scenarios
    

                if(this._customTopHeader) {
                    for(var i = 0; i < 4; i++) {
                        topHeader += `<th class='top-header' colspan='${this._colspan_BaseCase}' id='${this._customTopHeader[i].replace(" ","")}' >${this._customTopHeader[i]}</th>`
                    }
                } else {
                    for(var i = 0; i < this._scenarioOrder.length - 2; i++) {
                        // Base Case/Scenario
                        if(this._fixedScenario.includes(this._scenarioOrder[i])) {
                            topHeader += `<th class='top-header' colspan='${this._colspan_BaseCase}' id='${this._scenarioOrder[i].replace(" ","")}'>${this._scenarioOrder[i]}</th>`
                        } else {
                            // Rest Case/Scenario
                                for(var j = 0; j < this._scenarioOrder.length; j++) {
                                    if(!this._fixedScenario.includes(this._scenarioOrder[j])) {
                                        if(this._scenarioOrder[i] == this._scenarioOrder[j]) {
                                            topHeader += `<th class='top-header' id='${this._scenarioOrder[j].replace(" ","")}' colspan='${this._colspan_RestCase}'>${this._scenarioOrder[j]}`;
                                        } 
                                    }
                                }
                            topHeader +=  `</th>`;
                        }
                    }
                    topHeader += "</tr>";
                }
               
                // @--- uncomment below line
                // document.querySelector("v1-custom-table").shadowRoot.querySelector("#example > thead").insertAdjacentHTML('afterBegin', topHeader);
                console.log(this._widgetID+"v1-custom-table")
                // if(document.querySelector(this._widgetID+"v1-custom-table").shadowRoot.querySelector("#example > thead").children.length <= 1 && !tbl.data().any()) { // 5 since Empty : 1 + Base : 1 + Rest Scenario : 3
                //     // document.querySelector("v1-custom-table").shadowRoot.querySelector("#example > thead").insertAdjacentHTML('afterBegin', topHeader);
                // }

//  ------------------------------ TO BE UNCOMMENTED ----------------------

                // console.log(topHeader)
               
                tbl.on('click', 'tbody tr', e => {
                    // tbl.$('tr').removeClass('selected');
                    let classList = e.currentTarget.classList
                    tbl
                        .rows()
                        .nodes()
                        .each(row => row.classList.remove('selected'))
                    // var rowList = document.querySelector(this._widgetID+"v1-custom-table").shadowRoot.querySelectorAll("#example > tbody tr").remove('selected');
                    // console.log(rowList)

                    // console.log(classList, classList.length, "MAIN_____________")
                    if(classList.length != 1) {
                        classList.add('selected')
                    }
                    
                    // console.log(tbl.row('.selected').data())
                })

                
                // Master Reference Node For Selection Elements used Inside updateRow(), updateColumns() Method
                var hMap = {};
                var is_col_updated = false;

                function updateTotalOnRowUpdate(updateFrom, no_of_mes, updateFromRowID) {

                    var indices = [];
                    // for(var i = 0; i < table_cols.length; i++) {
                    //     if(table_cols[i]["className"] == "numericColsCSS") {
                    //         indices.push(i);
                    //     } else {
                    //         indices.push(-1);
                    //     }
                    // }
                    var considerConditions = ["numericColsCSS", "numericColsCSS perColCSS", "varCol", "numericColsCSS numCol", "varCols", "perCols"]
                    var CAGR_Indices = [updateFrom + no_of_mes - 1];
                    var numericCols = [];

                    for(var i = 0; i < table_cols.length; i++) {
                        if(considerConditions.includes(table_cols[i]["className"])) {
                            indices.push(i);
                        } else if (table_cols[i]["className"] == "cagrCol"){
                            indices.push(-2);
                        } else {
                            indices.push(-1);
                        }
                        ///// Numeric Col Indices
                        if(table_cols[i]["className"] == "numericColsCSS" || table_cols[i]["className"] == "numericColsCSS numCol") {
                            numericCols.push(i)
                        }
                    }

                    // var no_of_per_cols = 2;

                    for(var i = updateFrom; i < updateFrom + no_of_mes; i++) {
                        ////// =============================== Top-Most Total Update Starts =================================
                        var sum = 0;
                        var rowIDTotal = tbl.rows()[0][0];

                        var flag = false;
                        var d = tbl.column(i).data();
                        for(var j = 1; j < d.length; j++) {

                            var node = tbl.column(i).nodes()[j]["_DT_CellIndex"]["row"];


                            ///// ---------------------- For cell color red or green starts ---------------------------
                            if(!numericCols.includes(i) && i < updateFrom + no_of_mes - 1) {
                                var cell_rid = tbl.column(i).nodes()[j]["_DT_CellIndex"]["row"];
                                var cell_cid = tbl.column(i).nodes()[j]["_DT_CellIndex"]["column"];
                                var cell_node = tbl.cell(cell_rid, cell_cid).node();
                                var flagColor = false, data = undefined;
    
                                if(isNaN(tbl.cell(cell_rid, cell_cid).data())) {
                                    data = parseFloat(tbl.cell(cell_rid, cell_cid).data());
                                    if(tbl.cell(cell_rid, cell_cid).data().includes("%")) {
                                        data = parseFloat(tbl.cell(cell_rid, cell_cid).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""));
                                    }
                                } else {
                                    data = parseFloat(tbl.cell(cell_rid, cell_cid).data());
                                }

                                if(data < 0) {
                                    flagColor = true;
                                }

                                if(flagColor) {
                                    cell_node.style.color = "#A92626";
                                } else {
                                    cell_node.style.color = "#2D7230";
                                }
                            }
                            ///// ---------------------- For cell color red or green ends -----------------------------
                           
                            if(!Object.keys(groupRowMapping).includes(j.toString()) && !Object.keys(groupRowMapping).includes(node.toString())){
                                if(isNaN(d[j]) && d[j].includes("%") && indices[i] != -2) {

                                    ////// Future ---- to be made dynamic logic
                                    flag = true;

                                }
                                else if(indices[i] == -2) {

                                    var Vbegin= 0, Vfinal = 0, t = (1/4);  
                                    Vbegin = tbl.cell(rowIDTotal, CAGR_Indices[0] - 15).data()
                                    Vfinal = tbl.cell(rowIDTotal, CAGR_Indices[0] - 11).data()
                                    sum = Math.pow((Vfinal/Vbegin), t) - 1; //// CAGR sum
                                    indices[i] =  CAGR_Indices[0];
                                    CAGR_Indices = CAGR_Indices.slice(1, );
                                    break;

                                } 
                                else {
                                    if(!isNaN(parseFloat(d[j]))) {
                                        sum += parseFloat(d[j])
                                    }
                                }
                            }
                        }
                        if(flag) {

                            var value = tbl.cell(rowIDTotal, indices[i] - 10).data()
                            var val_minus_act = tbl.cell(rowIDTotal, indices[i] - 5).data()

                            if(isNaN(value)) {
                                value = parseFloat(tbl.cell(rowIDTotal, indices[i] - 10).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                            }
                            if(isNaN(val_minus_act)){
                                val_minus_act = parseFloat(tbl.cell(rowIDTotal, indices[i] - 5).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                            }

                            var act1 = value - val_minus_act

                            if(value == 0 && act1 == 0) {
                                sum = "-"
                            } else if(value == 0) {
                                sum = "-100%"
                            } else if (act1 == 0) {
                                sum = "100%";
                            } else {
                                sum = (val_minus_act / act1 * 100).toString()+" %"
                            }

                        }
                        // console.log(d,"<<<<",sum)
                        var colorFlag = false;
                        if(!isNaN(sum)) {
                            sum = parseFloat(sum).toFixed(no_of_decimalPlaces)
                            if(sum > "0" || sum > 0) {
                                colorFlag = true;
                            }
                        } else {
                            if(sum > "0" || sum > 0) {
                                colorFlag = true;
                            }
                            // refrenceIndex = indices[i] + 2; // 2 bcz 1 for GX_Entry_Date Col & + 1 for next indice 
                            sum = parseFloat(sum).toFixed(no_of_decimalPlaces).toString()+"%"
                        }
                        var node = tbl.cell(rowIDTotal, i).data(sum).node();

                        if(!numericCols.includes(i) && i < updateFrom + no_of_mes - 1) {
                            if(!colorFlag) {
                                node.style.color = "#A92626";
                            } else {
                                node.style.color = "#2D7230";
                            }
                        }
                    }
                   
                }
                
                function updateRow_5Y(state, no_of_dimens, no_of_mes, no_of_excludes, identifer, sliceFrom, sliceFromBase) 
                {


                    var selectData = tbl.row('.selected').data()
                    // console.log("Selected Row : ", selectData)

                    var ROW_ID = tbl.row('.selected')[0][0];
                    // console.log("UPDATE - ROW -->",selectData)
                    // @---
                    // var row_updated_arr = selectData.slice(0, no_of_dimens - no_of_excludes + no_of_mes + 1)
                    var row_updated_arr = selectData.slice(0, sliceFrom + 1)

                    // console.log("ROW UPDATED INITIALs - ",row_updated_arr)

                    state.getElementsByTagName('option')[state.options.selectedIndex].setAttribute('selected', 'selected')
                    // console.log("State Changed", state)

                    // console.log(state.id,">>>>>>>>>>>>>>>>>>>>.")
                    var selOptID = state.getElementsByTagName('option')[state.options.selectedIndex].id
                    // var selOptVal = JSON.parse(state.getElementsByTagName('option')[state.options.selectedIndex].value)
                    var selOptVal = fixRowsObj[identifer]
                    // console.log(state)

                    var sliced = selOptVal.slice(sliceFromBase, ), data = {};

                    // ----------------------- Handling base case for WHAT-IF column is updated first --------- 
                    if(is_col_updated && selOptID == 0) {
                        for(var k = 1, mr_k = 0; k <= no_of_mes; k++) {
                            sliced[k] = masterRows[ROW_ID].slice(hMap[0] + 1, (hMap[0] + 1) + no_of_mes)[mr_k];
                            mr_k++;
                        }
                    }
                    // ----------------------------------------------------------------------------------------


                    // console.log("SLICED ---- ", sliced)
                    for(var i = 1, index = 0; i < sliced.length; i++) {
                        data[index] = sliced.slice(i, i + no_of_mes)
                        i += no_of_mes
                        index += 1
                    }
                    // console.log("0000",data, data[selOptID])

                    var len = row_updated_arr.length;
                    row_updated_arr = row_updated_arr.concat(selectData.slice(len, ));
                    // @---
                    // row_updated_arr[no_of_dimens - no_of_excludes + no_of_mes + parseInt(state.id)] = state
                    row_updated_arr[sliceFrom + parseInt(state.id)] = state

                    // var sliceLen = no_of_dimens - no_of_excludes + no_of_mes + parseInt(state.id) + 1
                    var sliceLen = sliceFrom + parseInt(state.id) + 1
                    
                    var dataCopy  = Array.from(data[selOptID]);
                    // console.log("DATA", dataCopy)
                    for(var i = sliceLen, idx = 0; i < sliceLen + no_of_mes; i++) {
                        row_updated_arr[i] = dataCopy[idx]
                        idx += 1;
                    }

                    // console.log(row_updated_arr)
                    tbl.row('.selected').data(row_updated_arr)

                    var updateFrom = parseInt(sliceFrom)  // length of fixed columns (till base scenario)
                                    + parseInt(state.id) // selection id present at column
                                    + 1;  // to avoid selection column in count
                    if(showTotalonRowUpdateFlag) {
                        state.style.backgroundColor="#C4DBEE";
                        state.style.border = "2px solid #0460A9";
                        state.style.color="#2C2C2C";
                        updateTotalOnRowUpdate(updateFrom, no_of_mes, ROW_ID);
                    }
                }

                window.updateRow_5Y = updateRow_5Y

                var dateName = new Set(), scenarioSeq = this._scenarioOrder.slice(1, );
                var caughtDropDownsAt = new Set(), caughtDropDownsCnt = 0;
                var grpRowBy = this._resultSet[0]

                for(var i = 0, prev_key = "", seqID = 0; i < this._resultSet.length;) {

                    if(this._fixedScenario.includes(this._resultSet[i][fixedScenarioAt])) {
                        caughtDropDownsAt = new Set(), caughtDropDownsCnt = 0;
                        // var obj = Object.fromEntries(this._scenarioOrder.slice(1,).map(key => [key, []]));
                        var obj = {};
                        var fixRows = [];
                        dateName = new Set();
                        if(this._colOrder[0] == "FY") {
                            var index = this._resultSet[i].length - this._measureOrder.length;
                            fixRows = this._resultSet[i].slice()
                        }
                        // @-- bug fix...
                        if(this._resultSet[i + 1] != undefined && this._resultSet[i].slice(0, fixedScenarioAt).join("_#_") == this._resultSet[i + 1].slice(0, fixedScenarioAt).join("_#_")) {
                            i+=1;
                        }

                        ////// -----------------------------  Show Group-Wise Total Starts --------------------------
                        if(grpRowBy != fixRows[0]) {
                                templateGroupTotal[0] = fixRows[0].slice();
                                templateGroupTotal[1] = fixRows[0].slice();
                                // console.log(templateGroupTotal)
                                for(var ttl = 2; ttl < fixRows.length; ttl++) {
                                    if(isNaN(fixRows[ttl])) {
                                        templateGroupTotal[ttl] = " "
                                    }
                                }
                                var newRow = tbl.row.add(templateGroupTotal.slice())
                                    .draw(false)
                                    .node();
                                // console.log(newRow, templateGroupTotal)
                                newRow.classList.add("group")
                                newRow.classList.add(fixRows[0].toString().replace(" ","")+"_"+fixRows[1].toString().replace(" ",""))
                                grpRowBy = fixRows[0]
                        }
                        ////// -----------------------------  Show Group-Wise Total Ends --------------------------
                   
                    }

                    var key = fixRows.slice(0, this._dimensions.indexOf(this._dateColName)).join("_#_")+"_#_";
                    // console.log(fixRows)
                    if(i==0) {prev_key = key.substring(0, )}

                    var tempKey = key.substring(0, );
                   
                    dateName.add(this._resultSet[i][this._dimensions.indexOf(this._dateColName)]);

// console.log(key)
                    while(JSON.stringify(key) == JSON.stringify(tempKey)) {

                        // console.log(this._resultSet[i][fixedScenarioAt])
                        // ----------------  For Dynamic Trggering of Selection Element At Particular Base ---------------
                        if(this._dropdownsSelected.includes(this._resultSet[i][fixedScenarioAt].toUpperCase())) {
                            caughtDropDownsAt.add(caughtDropDownsCnt)
                        }
                        caughtDropDownsCnt++;
                        // -----------------------------------------------------------------------------------------------

                        for(var j = 0; j < fixedScenarioAt; j++) {
                            tempKey += this._resultSet[i][j]+"_#_"
                        }
                        // fixRows.splice(fixRows.length, 0, ...this._resultSet[i].slice(this._dimensions.length - 1, ))
                        var scene = this._resultSet[i].slice(fixedScenarioAt, )[0];
                        // console.log("---",scene)
                        if(!this._fixedScenario.includes(scene)) {
                            obj[scene] = this._resultSet[i].slice(this._dimensions.length - 1, )
                        }
                        // console.log(this._resultSet[i].slice(this._dimensions.length - 1, ))
                        seqID++;
                        if(seqID >= scenarioSeq.length) {
                            seqID = 0;
                        }

                        // console.log(scenarioSeq[seqID],"---", scene)
                        dateName.add(this._resultSet[i][this._dimensions.indexOf(this._dateColName)]);
                        i += 1;
                    }

// console.log(fixRows);

                    // Final Assignment of fixRows
                    if(this._resultSet[i] != undefined && fixRows.slice(0, fixedScenarioAt).join("_#_") != this._resultSet[i].slice(0, fixedScenarioAt).join("_#_")) {
                        // dateName = new Set(Object.keys(obj).filter(v => !this._fixedScenario.includes(v)))
                        var dname = [], c = 0; // ----
                        dname.push(fixRows[this._dimensions.indexOf(this._dateColName)])

                        for(const [k, v] of Object.entries(obj)) {
                            // console.log(obj)
                            if(k != this._fixedScenario[0]) {
                                if(v.length < 1) {
                                    c++;
                                } else {
                                    if(fixRows.length != table_cols.length){
                                        fixRows = fixRows.concat(v)
                                        dname.push(v[0])// ----
                                    }
                                }
                            }
                        }

                        var tempMes = fixRows.slice(-this._measureOrder.length);
                        tempMes.unshift("-")
                        
                        for(var p = 0; p  < c*this._measureOrder.length+c; p++) {
                            fixRows.push("-")
                        }
                         // @ ------------------------------------------------------------------ REMOVE IF NEC 
                         if(fixRows.length < table_cols.length) {
                            if(Object.keys(obj).length < 1) {
                                for(var t = fixRows.length, empCnt = 0; t < table_cols.length; t++) {
                                    fixRows.push(tempMes[empCnt])
                                    empCnt++;
                                    if(empCnt >= tempMes.length) {
                                        empCnt = 0;
                                    }
                                }
                                dname.push(fixRows[this._dimensions.indexOf(this._dateColName)])
                                // @----- udpate new
                                // console.log("--------",fixRows[this._dimensions.indexOf(this._dateColName)],"----",this._dimensions.indexOf(this._dateColName))
                            } else {
                                for(var t = fixRows.length; t < table_cols.length; t++) {
                                    fixRows.push("-")
                                }
                            }
                            // console.log(fixRows, "----<")
                        }
                        // @ ------------------------------------------------------------------  ^^^^^^^^^^^
                        dateName = new Set(dname)// ----
                    } else if(this._resultSet[i] == undefined) {

                        var dname = [], c = 0;// ----
                        dname.push(fixRows[this._dimensions.indexOf(this._dateColName)])

                        for(const [k, v] of Object.entries(obj)) {
                            if(k != this._fixedScenario[0]) {
                                if(v.length < 1) {
                                    c++;
                                } else {
                                    fixRows = fixRows.concat(v)
                                    dname.push(v[0])// ----
                                }
                            }
                        }

                        var tempMes = fixRows.slice(-this._measureOrder.length);
                        tempMes.unshift("-")

                        for(var p = 0; p  < c*this._measureOrder.length+c; p++) {
                            fixRows.push("-")
                        }
                        // @ ------------------------------------------------------------------ REMOVE IF NEC 
                        if(fixRows.length < table_cols.length) {
                            if(Object.keys(obj).length < 1) {
                                for(var t = fixRows.length, empCnt = 0; t < table_cols.length; t++) {
                                    fixRows.push(tempMes[empCnt])
                                    empCnt++;
                                    if(empCnt >= tempMes.length) {
                                        empCnt = 0;
                                    }
                                }
                                dname.push(fixRows[this._dimensions.indexOf(this._dateColName)])
                                // @----- udpate new
                            } else {
                                for(var t = fixRows.length; t < table_cols.length; t++) {
                                    fixRows.push("-")
                                }
                            }
                        }
                        // @ ------------------------------------------------------------------  ^^^^^^^^^^^
                        dateName = new Set(dname)// ----
                        // console.log(fixRows,obj,"-------")
                    }
                    // console.log("--",scenarioSeq[seqID], "---",this._scenarioOrder[this._scenarioOrder.length - 1])
                   
                    // console.log(key, tempKey);

                    if(table_cols.length == fixRows.length) {
                        seqID = 0;
                        var dateNameArr = Array.from(dateName);
                        var sliceLen = this._resultSet[0].length;
                        var sliced = fixRows.slice(sliceLen)
                        var cnt = 0;
                        var options = "";
                        var dropdownIDs = new Set();

                        for(var k = 0, optIdx = 0; k < sliced.length; k++) {

                            // dropdown change dynamic trigger through js 
                            if(cnt < 3) {
                                dropdownIDs.add(k+"_"+this._dataTableObj.rows().count());
                            }

                            var select_html = `<select id='${k}' class='row_level_select row_level_select_${k}_${this._dataTableObj.rows().count()}' onchange='updateRow_5Y(this, ${this._dimensions.length}, ${this._measureOrder.length}, ${this._excludeHeaders.length}, "${fixRows[0]}_#_${fixRows[1]}", ${this._resultSet[0].length}, ${this._dimensions.indexOf(this._dateColName)})'>`;
                                var options = "";
                                for(var p = 0; p < dateNameArr.length; p++) {
                                    if(optIdx == p) {
                                        options += `<option class='optionTag' id='${p}' selected>${dateNameArr[p]}</option>`
                                    } else {
                                        options += `<option class='optionTag' id='${p}' >${dateNameArr[p]}</option>`
                                    }
                                }
                                select_html += options + `</select>`;
                                sliced[k] = select_html;
                                this._nonNumericColumnIndices_UnitConversion.add(k+this._dimensions.length - 1);
                                cnt++;
                            k += this._measureOrder.length;
                            optIdx += 1;
                        }
                        fixRows = fixRows.slice(0, sliceLen).concat(sliced);
                        // console.log(fixRows,"-----")

                        fixRowsObj[fixRows[0]+"_#_"+fixRows[1]] = fixRows
                        masterRows.push(fixRows.slice());

                     
                        tbl.row.add(fixRows).draw(false)

                      
                        // console.log(">>>>>>><<<<<<<<<", caughtDropDownsAt);
                        var drpIndicesAt = Array.from(caughtDropDownsAt);
                        this.setSelectorsSelectedValue(dropdownIDs, drpIndicesAt)
                // console.log("SELECT ELEMENT : ", document.querySelector("v1-custom-table").shadowRoot.querySelector("#\\30"))
                        fixRows = [];
                        this._nonNumericColumnIndices_UnitConversion.add(k+this._dimensions.length - 1)
                        // console.log(fixRows)
                    }

                    prev_key = key;

                }

                // Styling Block Starts

                this.applyStyling_5Y();

                if (this._tableCSS) {
                    // console.log(this._tableCSS)
                    this._table.style.cssText = this._tableCSS
                }

                if (this._rowCSS) {
                    console.log(this._rowCSS)
                    document
                        .querySelector(this._widgetID+'v1-custom-table')
                        .shadowRoot.querySelectorAll('td')
                        .forEach(el => (el.style.cssText = this._rowCSS))
                    document
                        .querySelector(this._widgetID+'v1-custom-table')
                        .shadowRoot.querySelectorAll('th')
                        .forEach(el => (el.style.cssText = this._rowCSS))
                }

                if (this._colCSS) {
                    console.log(this._colCSS)
                    document
                        .querySelector(this._widgetID+'v1-custom-table')
                        .shadowRoot.querySelector('style').innerText += this._colCSS
                }

                const list = document.querySelector(this._widgetID+"v1-custom-table").shadowRoot.querySelector("#example > thead");

                for(var i = 0; i < list.children.length - 1; i++) {
                    list.removeChild(list.children[i]);
                }


                // this._dotsLoader.style.visibility = "hidden";
                this._table.style.visibility = "visible";
                this._root.style.display = "block";

                // document.querySelector("#__widget5 > v1-custom-table").shadowRoot.querySelector("#example > thead > tr > th:nth-child(2)")
                // document.querySelector("v1-custom-table").shadowRoot.querySelector("#example > thead > tr > th:nth-child(2)").click();
                document.querySelector(this._widgetID+"v1-custom-table").shadowRoot.querySelector("#example > thead").insertAdjacentHTML('afterBegin', topHeader);
                showTotalonRowUpdateFlag = true;
                this.showTotal("5Y");

                // Styling Block Ends here
            }
         
        }
        customElements.define('v1-custom-table', CustomTable)
    })()
